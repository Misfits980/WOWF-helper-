"""포에버 게임 자료로 장비 능력치 계산.

    python3 -I tools/itemcache/game_items.py <DBCache.bin> <csv 폴더> <WoWDBDefs 폴더(manifest.json·definitions)> <출력 jsonl> [data/qdb/items-game.txt]
    → app/build.py가 items-game.txt를 합침(핫픽스 기록은 믿고, 기본 자료는 wowf.io 툴팁이 없을 때만)

- 장비 기록: 핫픽스 캐시(DBCache.bin)의 ItemSparse·Item (+ CASC CSV ItemSparse·Item에 있는 것)
- 주 능력치: round(StatPercentEditor × RandPropPoints[아이템 레벨][등급][부위 묶음] / 10000)
- 무기 초당 공격력: ItemDamage<종류>[아이템 레벨].Quality[등급]
- 방어도: ItemArmorTotal[레벨][재질] × ArmorLocation[부위][재질] × ItemArmorQuality[레벨][등급] (방패는 ItemArmorShield)
- 착용 효과: ItemXItemEffect → ItemEffect(TriggerType 1) → SpellEffect 오라
게임 파일 자체는 저장소에 넣지 않고, 계산한 숫자만 출력함.
"""
import csv
import json
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dbc import entries  # noqa: E402
from sparse import layout, decode  # noqa: E402

BUILD = '1.60.1.70938'
TH = {'ItemSparse': 0x919BE54E, 'Item': 0x50238EC2, 'ItemEffect': 0x0, 'ItemXItemEffect': 0x0, 'SpellEffect': 0xF04238A5}


def rd_csv(path):
    with open(path, encoding='utf-8', newline='') as f:
        return list(csv.DictReader(f, delimiter=';'))


def nums(s, f=float):
    return [f(x) for x in str(s).split(',')] if s != '' else []


def rnd(x):
    return int(math.floor(x + 0.5))


# 부위 → RandPropPoints 묶음
def rpp_cat(inv):
    if inv in (1, 4, 5, 7, 17, 20):
        return 0
    if inv in (3, 6, 8, 10, 12):
        return 1
    if inv in (2, 9, 11, 14, 16, 23):
        return 2
    if inv in (13, 21, 22):
        return 3
    if inv in (15, 25, 26, 28):
        return 4
    return None


PRIMARY = {3: 'agi', 4: 'str', 5: 'int', 6: 'spi', 7: 'sta'}
# 포에버(1.60) 아이템 능력치 종류 → 앱 칸. 값이 (칸, 나눔수)면 60레벨 등급을 %로 (wowf.io 툴팁 2,800개로 맞춰 봄)
OSTAT = {12: ('def', 1), 13: ('dodge', 12), 14: ('parry', 15), 15: ('blockp', 5), 31: ('hit', 10), 32: ('crit', 14),
         38: ('ap', 1), 39: ('rap', 1), 41: ('heal', 1), 42: ('sp', 1), 43: ('mp5', 1), 45: (('sp', 'heal'), 1), 48: ('block', 1),
         84: ('holy', 1), 85: ('fire', 1), 86: ('nature', 1), 87: ('frost', 1), 88: ('shadow', 1), 89: ('arcane', 1)}
MAT = {1: 'Cloth', 2: 'Leather', 3: 'Mail', 4: 'Plate'}
LOCMOD = {1: 'Clothmodifier', 2: 'Leathermodifier', 3: 'Chainmodifier', 4: 'Platemodifier'}
SCHOOL = {2: 'holy', 4: 'fire', 8: 'nature', 16: 'frost', 32: 'shadow', 64: 'arcane'}
# 60레벨 등급 → % (앱의 items_wowf.RATE와 같은 값)
RATING = [(1 << 1, 'def', 1.5), (1 << 2, 'dodge', 12), (1 << 3, 'parry', 15), (1 << 4, 'blockp', 5), (1 << 5, 'hit', 10), (1 << 7, 'shit', 8),
          (1 << 8, 'crit', 14), (1 << 10, 'scrit', 14)]


def load(cache, csvdir, dbddir):
    import json as _j
    tabs = {}
    for t in ('ItemSparse', 'Item', 'ItemEffect', 'ItemXItemEffect', 'SpellEffect'):
        tabs[t] = {}
        p = os.path.join(csvdir, t + '.csv')
        if os.path.exists(p):
            for r in rd_csv(p):
                tabs[t][int(r['ID'])] = ('csv', r)
    man = {}
    mp = os.path.join(dbddir, 'manifest.json')
    for t in _j.load(open(mp)):
        if t.get('tableHash'):
            man[int(t['tableHash'], 16)] = t['tableName']
    L = {t: layout(os.path.join(dbddir, 'definitions', t + '.dbd') if os.path.exists(os.path.join(dbddir, 'definitions', t + '.dbd'))
                   else os.path.join(dbddir, t + '.dbd'), BUILD) for t in tabs}
    hot = 0
    for e in entries(cache):
        t = man.get(e['th'])
        if t not in tabs:
            continue
        if not e['data'] or e['st'] != 1:
            tabs[t].pop(e['rid'], None)
            continue
        tabs[t][e['rid']] = ('hot', decode(e['data'], L[t]))
        hot += 1
    return tabs, hot


def val(row, k, f=float):
    src, r = row
    v = r[k]
    if src == 'csv':
        if isinstance(v, str) and ',' in v:
            return [f(x) for x in v.split(',')]
        try:
            return f(v)
        except ValueError:
            return v
    return v


def main(cache, csvdir, dbddir, out):
    tabs, hot = load(cache, csvdir, dbddir)
    RPP = {int(r['ID']): r for r in rd_csv(os.path.join(csvdir, 'RandPropPoints.csv'))}
    DMG = {}
    for t in ('OneHand', 'OneHandCaster', 'TwoHand', 'TwoHandCaster', 'Ranged', 'Thrown', 'Wand', 'Ammo'):
        DMG[t] = {int(r['ItemLevel']): nums(r['Quality']) for r in rd_csv(os.path.join(csvdir, 'ItemDamage%s.csv' % t))}
    ATOT = {int(r['ItemLevel']): r for r in rd_csv(os.path.join(csvdir, 'ItemArmorTotal.csv'))}
    AQ = {int(r['ID']): nums(r['Qualitymod']) for r in rd_csv(os.path.join(csvdir, 'ItemArmorQuality.csv'))}
    ASH = {int(r['ItemLevel']): nums(r['Quality']) for r in rd_csv(os.path.join(csvdir, 'ItemArmorShield.csv'))}
    ALOC = {int(r['ID']): r for r in rd_csv(os.path.join(csvdir, 'ArmorLocation.csv'))}
    # 착용 효과
    ix = {}
    for _, row in tabs['ItemXItemEffect'].items():
        ix.setdefault(int(val(row, 'ItemID')), []).append(int(val(row, 'ItemEffectID')))
    sfx = {}
    for _, row in tabs['SpellEffect'].items():
        sfx.setdefault(int(val(row, 'SpellID')), []).append(row)

    def equip_stats(iid):
        st = {}
        unk = []
        for eid in ix.get(iid, []):
            er = tabs['ItemEffect'].get(eid)
            if not er or int(val(er, 'TriggerType')) != 1:
                continue
            sid = int(val(er, 'SpellID'))
            for se in sfx.get(sid, []):
                aura = int(val(se, 'EffectAura'))
                bp = val(se, 'EffectBasePointsF')
                bp = float(bp[0] if isinstance(bp, list) else bp)
                mv = val(se, 'EffectMiscValue', int)
                mv = int(mv[0] if isinstance(mv, list) else mv)
                v = rnd(bp) if abs(bp - rnd(bp)) < 1e-6 else round(bp, 2)

                def add(k, x):
                    st[k] = round(st.get(k, 0) + x, 2)
                if aura == 13:
                    if mv & 126 == 126:
                        add('sp', v)
                    else:
                        for b, k in SCHOOL.items():
                            if mv & b:
                                add(k, v)
                elif aura == 135:
                    add('heal', v)
                elif aura == 99:
                    add('ap', v)
                elif aura == 124:
                    add('rap', v)
                elif aura == 52:
                    add('crit', v)
                elif aura in (57, 71):
                    add('scrit', v)
                elif aura == 54:
                    add('hit', v)
                elif aura == 55:
                    add('shit', v)
                elif aura == 85 and mv == 0:
                    add('mp5', v)
                elif aura == 49:
                    add('dodge', v)
                elif aura == 47:
                    add('parry', v)
                elif aura == 51:
                    add('blockp', v)
                elif aura == 158:
                    add('block', v)
                elif aura == 30 and mv == 95:
                    add('def', v)
                elif aura == 29:
                    for k in (['str', 'agi', 'sta', 'int', 'spi'] if mv < 0 else [['str', 'agi', 'sta', 'int', 'spi'][mv]]):
                        add(k, v)
                elif aura == 189:
                    for b, k, r in RATING:
                        if mv & b:
                            add(k, round(v / r, 2))
                elif aura in (0, 4, 22, 42, 23, 226):
                    pass
                else:
                    unk.append((sid, aura, mv, v))
        return st, unk

    n = 0
    with open(out, 'w', encoding='utf-8') as fo:
        for iid, srow in tabs['ItemSparse'].items():
            irow = tabs['Item'].get(iid)
            if not irow:
                continue
            g = lambda k, f=int: val(srow, k, f)  # noqa: E731
            cls, sub = int(val(irow, 'ClassID')), int(val(irow, 'SubclassID'))
            inv = int(g('InventoryType'))
            if cls not in (2, 4) or inv == 0:
                continue
            ilvl, q = int(g('ItemLevel')), int(g('OverallQualityID'))
            rec = {'id': iid, 'nm': g('Display_lang', str), 'ilvl': ilvl, 'req': int(g('RequiredLevel')), 'q': q, 'inv': inv, 'cls': cls, 'sub': sub,
                   'src': srow[0]}
            # 착용 직업(AllowableClass 비트: 전사 1 · 성기사 2 · 사냥꾼 4 · 도적 8 · 사제 16 · 주술사 64 · 마법사 128 · 흑마법사 256 · 드루이드 1024)
            # · 종족(AllowableRace) · 필요 평판(MinFactionID·MinReputation 단계 0 증오 … 4 중립 5 우호 6 존경 7 매우 존경 8 확고)
            #  item_rows.py가 직업 전용 세트 조각(무용의 손목보호구 = 전사)·평판 상인 템에 씀
            try:
                acl = int(g('AllowableClass')) & 0x5FF
                if acl and acl != 0x5DF and acl != 0x5FF:
                    rec['acl'] = acl
                arc = int(g('AllowableRace'))
                if arc > 0 and (arc & 0x1FF) not in (0x1FF, 0xFF):
                    rec['arc'] = arc & 0x7FF
                mf = int(g('MinFactionID'))
                if mf > 0:
                    rec['rep'] = [mf, int(g('MinReputation'))]
            except (KeyError, TypeError, ValueError):
                pass
            st = {}
            cat = rpp_cat(inv)
            rp = RPP.get(ilvl)
            types, pcts = g('StatModifier_bonusStat'), g('StatPercentEditor')
            if not isinstance(types, list):
                types, pcts = [types], [pcts]
            if rp is not None and cat is not None:
                col = 'Epic' if q >= 4 else 'Superior' if q == 3 else 'Good'
                bud = nums(rp[col + 'F'])[cat]
                for t, p in zip(types, pcts):
                    t, p = int(t), int(p)
                    if p and t in PRIMARY:
                        st[PRIMARY[t]] = st.get(PRIMARY[t], 0) + rnd(p * bud / 10000)
                    elif p and t in OSTAT:
                        ks, dv = OSTAT[t]
                        for k in (ks if isinstance(ks, tuple) else (ks,)):
                            st[k] = round(st.get(k, 0) + rnd(p * bud / 10000) / dv, 2)
                    elif p and t == 50:
                        rec['xarmor'] = rnd(p * bud / 10000)
                    elif p and t >= 0:
                        rec.setdefault('ostat', []).append([t, rnd(p * bud / 10000)])
            es, unk = equip_stats(iid)
            for k, v in es.items():
                st[k] = round(st.get(k, 0) + v, 2)
            if unk:
                rec['unk'] = unk
            rec['st'] = st
            delay = int(g('ItemDelay'))
            if cls == 2:
                caster = bool(int((g('Flags') or [0, 0])[1]) & 0x200) if isinstance(g('Flags'), list) else False
                if inv in (13, 21, 22):
                    t = 'OneHandCaster' if caster else 'OneHand'
                elif inv == 17:
                    t = 'TwoHandCaster' if caster else 'TwoHand'
                elif inv == 25 or sub == 16:
                    t = 'Thrown'
                elif sub == 19:
                    t = 'Wand'
                elif inv in (15, 26):
                    t = 'Ranged'
                else:
                    t = None
                if t and ilvl in DMG[t] and delay:
                    dps = DMG[t][ilvl][q]
                    var = float(g('DmgVariance', float))
                    avg = dps * delay / 1000
                    rec.update(dps=round(dps, 2), spd=round(delay / 1000, 2), lo=rnd(avg * (1 - var / 2)), hi=rnd(avg * (1 + var / 2)))
            if cls == 4:
                if sub == 6 and ilvl in ASH:
                    rec['armor'] = int(ASH[ilvl][q])
                elif sub in MAT and ilvl in ATOT and (20 if inv == 20 else inv) in ALOC:
                    tot = float(ATOT[ilvl][MAT[sub]])
                    loc = float(ALOC[5 if inv == 20 else inv][LOCMOD[sub]])
                    qm = AQ[ilvl][q]
                    rec['armor'] = rnd(tot * loc * qm)
                if rec.get('xarmor'):
                    rec['armor'] = rec.get('armor', 0) + rec['xarmor']
            fo.write(json.dumps(rec, ensure_ascii=False) + '\n')
            n += 1
    print('장비', n, '(핫픽스 기록', hot, ')')


def to_txt(jsonl, txt):
    """계산 결과 → data/qdb/items-game.txt (능력치가 있는 장비만)"""
    with open(txt, 'w', encoding='utf-8') as f:
        f.write('# 포에버 게임 자료(tools/itemcache/game_items.py)로 계산한 장비 능력치: 번호|아이템 레벨|요구 레벨|등급|능력치|자료(h=포에버 핫픽스, c=기본 자료)\n')
        for l in open(jsonl, encoding='utf-8'):
            o = json.loads(l)
            st = ' '.join('%s%s' % (k, '%g' % v) for k, v in sorted(o['st'].items()) if v)
            if st:
                f.write('%d|%d|%d|%d|%s|%s\n' % (o['id'], o['ilvl'], o['req'], o['q'], st, o['src'][0]))


if __name__ == '__main__':
    main(*sys.argv[1:5])
    if len(sys.argv) > 5:
        to_txt(sys.argv[4], sys.argv[5])
