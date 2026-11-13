"""forg 장비 목록에 없는 클래식 장비를 더한다.
쓰는 법: python3 tools/items-extra.py <wow-classic-items의 data.json>
- 능력치·슬롯·출처: nexus-devs/wow-classic-items (영어, 요즘 표기라 능력치는 대략)
- 한글 이름: QuestieDB koKR (tools/qdb/import.py가 만든 data/qdb/item-ko.txt)
결과: data/qdb/items-extra.txt (forg items.txt와 같은 칸), data/qdb/sources-extra.txt"""
import json, os, re, sys

ROOT = os.path.join(os.path.dirname(__file__), '..')
src = sys.argv[1] if len(sys.argv) > 1 else '/tmp/nx/data/json/data.json'
D = json.load(open(src, encoding='utf-8'))


def rdmap(p, kcol=0, vcol=1, kint=False):
    m = {}
    try:
        for line in open(os.path.join(ROOT, p), encoding='utf-8'):
            f = line.rstrip('\n').split('|')
            if len(f) > max(kcol, vcol):
                m[int(f[kcol]) if kint else f[kcol]] = f[vcol]
    except FileNotFoundError:
        pass
    return m


KO = rdmap('data/qdb/item-ko.txt', kint=True)
NPC = rdmap('data/qdb/npc-en-ko.txt')
ZONE = rdmap('data/qdb/zone-ko.txt', kint=True)
QKO = {}
QLV = {}
try:
    for line in open(os.path.join(ROOT, 'data/qdb/quests.jsonl'), encoding='utf-8'):
        o = json.loads(line)
        QKO[o['id']] = o['n']
        QLV[o['id']] = max(o.get('m') or 0, (o.get('lv') or 0) - 3)
except FileNotFoundError:
    pass
HAVE = set()
HAVE_NM = set()
for line in open(os.path.join(ROOT, 'data/forg/items.txt'), encoding='utf-8'):
    if line.strip():
        f = line.rstrip('\n').split('|')
        HAVE.add(int(f[0]))
        if len(f) > 12:
            HAVE_NM.add(f[12])

SC = {'Head': 'he', 'Neck': 'ne', 'Shoulder': 'sh', 'Back': 'ba', 'Chest': 'ch', 'Wrist': 'wr', 'Hands': 'ha', 'Waist': 'wa', 'Legs': 'le', 'Feet': 'fe',
      'Finger': 'fi', 'Trinket': 'tr', 'Main Hand': 'mh', 'One-Hand': '1h', 'Two-Hand': '2h', 'Off Hand': 'oh', 'Held In Off-hand': 'ho', 'Ranged': 'ra', 'Thrown': 'ra', 'Relic': 'ra'}
WSUB = {'Axe': (0, 1), 'Mace': (4, 5), 'Sword': (7, 8), 'Bow': 2, 'Gun': 3, 'Polearm': 6, 'Staff': 10, 'Fist Weapon': 13, 'Miscellaneous': 14, 'Dagger': 15,
        'Thrown': 16, 'Crossbow': 18, 'Wand': 19, 'Fishing Pole': 20}
ASUB = {'Miscellaneous': 0, 'Cloth': 1, 'Leather': 2, 'Mail': 3, 'Plate': 4, 'Shield': 6, 'Libram': 7, 'Idol': 8, 'Totem': 9}
Q = {'Poor': 'p', 'Common': 'c', 'Uncommon': 'u', 'Rare': 'r', 'Epic': 'e', 'Legendary': 'l'}
CL = ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock', 'druid']
CLS_EN = {'Warrior': 'warrior', 'Paladin': 'paladin', 'Hunter': 'hunter', 'Rogue': 'rogue', 'Priest': 'priest', 'Shaman': 'shaman', 'Mage': 'mage', 'Warlock': 'warlock', 'Druid': 'druid'}
WPN = {'warrior': [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 13, 15, 16, 18], 'paladin': [0, 1, 4, 5, 6, 7, 8], 'hunter': [0, 1, 2, 3, 6, 7, 8, 10, 13, 15, 16, 18],
       'rogue': [0, 2, 3, 4, 7, 13, 15, 16, 18], 'priest': [4, 10, 15, 19], 'shaman': [0, 1, 4, 5, 10, 13, 15], 'mage': [7, 10, 15, 19], 'warlock': [7, 10, 15, 19],
       'druid': [4, 5, 6, 10, 13, 15]}
ARM = {'warrior': 4, 'paladin': 4, 'hunter': 3, 'shaman': 3, 'rogue': 2, 'druid': 2, 'priest': 1, 'mage': 1, 'warlock': 1}
RELIC = {7: 'paladin', 8: 'druid', 9: 'shaman'}
PROF = {'Blacksmithing': '대장기술', 'Leatherworking': '가죽세공', 'Tailoring': '재봉술', 'Engineering': '기계공학', 'Jewelcrafting': '보석세공', 'Enchanting': '마법부여'}
STAT = [(r'^\+(\d+) Stamina$', 'sta'), (r'^\+(\d+) Strength$', 'str'), (r'^\+(\d+) Agility$', 'agi'), (r'^\+(\d+) Intellect$', 'int'), (r'^\+(\d+) Spirit$', 'spi'),
        (r'Increases spell power by (\d+)', 'sp+heal'), (r'Increases healing done by (?:spells and effects )?by up to (\d+)', 'heal'),
        (r'Increases damage and healing done by magical spells and effects by up to (\d+)', 'sp+heal'),
        (r'Increases damage done by (Fire|Frost|Shadow|Arcane|Nature|Holy) spells and effects by up to (\d+)', 'school'),
        (r'Increases (?:your )?attack power by (\d+)', 'ap'), (r'Increases ranged attack power by (\d+)', 'rap'),
        (r'Restores (\d+) mana per 5 sec', 'mp5'), (r'Increases (?:your )?defense rating by (\d+)', 'def'), (r'Increased Defense \+(\d+)', 'def'),
        (r'block value of your shield by (\d+)', 'block')]

S = []
SI = {}


def sidx(label):
    if label not in SI:
        SI[label] = len(S)
        S.append(label)
    return SI[label]


out = []
skipped = {'have': 0, 'notko': 0, 'lv': 0, 'slot': 0, 'horde': 0, 'q': 0}
for it in D:
    iid = it['itemId']
    if it.get('class') not in ('Armor', 'Weapon'):
        continue
    if iid in HAVE:
        skipped['have'] += 1
        continue
    if iid > 25000:
        continue
    q = Q.get(it.get('quality'))
    if not q or q == 'p':
        skipped['q'] += 1
        continue
    rl = it.get('requiredLevel') or 0
    if rl > 60 or (it.get('itemLevel') or 0) > 100:
        skipped['lv'] += 1
        continue
    sl = SC.get(it.get('slot'))
    if not sl:
        skipped['slot'] += 1
        continue
    sub = it.get('subclass')
    if it['class'] == 'Weapon':
        w = WSUB.get(sub)
        if isinstance(w, tuple):
            w = w[1] if it.get('slot') == 'Two-Hand' else w[0]
        if w is None or w == 20:
            continue
        cs = '2.%d' % w
    else:
        a = ASUB.get(sub)
        if a is None:
            continue
        if a == 0 and sl not in ('ne', 'fi', 'tr', 'ho'):
            continue  # 가면·옷 같은 꾸미기 아이템
        cs = '4.%d' % a if a or sl not in ('ne', 'fi', 'tr', 'ba', 'ho') else ''
        if sl == 'ba':
            cs = ''
    tips = [t['label'] for t in it.get('tooltip', [])]
    st = {}
    allow = None
    for t in tips:
        if t.startswith('Use:') or t.startswith('Chance on hit') or '(Proc)' in t:
            continue
        m = re.match(r'^Classes: (.+)$', t)
        if m:
            allow = [CLS_EN[x.strip()] for x in m.group(1).split(',') if x.strip() in CLS_EN]
            continue
        m = re.search(r'\(([\d.]+) damage per second\)', t)
        if m:
            st['dps'] = float(m.group(1))
            continue
        m = re.match(r'^(\d+) Armor$', t)
        if m and cs == '4.6':
            st['armor'] = int(m.group(1))
            continue
        for rx, k in STAT:
            m = re.search(rx, t)
            if not m:
                continue
            if k == 'sp+heal':
                v = int(m.group(1))
                st['sp'] = st.get('sp', 0) + v
                st['heal'] = st.get('heal', 0) + v
            elif k == 'school':
                st[m.group(1).lower()] = st.get(m.group(1).lower(), 0) + int(m.group(2))
            elif k == 'rap':
                pass
            else:
                st[k] = st.get(k, 0) + int(m.group(1))
            break
    eff = any(t.startswith('Equip:') or t.startswith('Use:') or t.startswith('Chance on hit') for t in tips if not re.search('spell power|attack power|mana per|defense|block value|rating|Run speed', t))
    # 클래스 마스크: 숙련으로 판단 (60레벨 기준)
    mask = 0
    for i, c in enumerate(CL):
        ok = True
        if cs.startswith('2.'):
            ok = int(cs[2:]) in WPN[c]
        elif cs == '4.6':
            ok = c in ('warrior', 'paladin', 'shaman')
        elif cs in ('4.1', '4.2', '4.3', '4.4'):
            ok = int(cs[2:]) <= ARM[c]
        elif cs in ('4.7', '4.8', '4.9'):
            ok = RELIC[int(cs[2:])] == c
        if allow and c not in allow:
            ok = False
        if ok:
            mask |= 1 << i
    if not mask:
        continue
    # 출처
    refs = []
    s = it.get('source') or {}
    cat = s.get('category')
    if cat == 'Quest':
        qs = [x for x in s.get('quests', []) if x.get('faction') != 'Horde']
        if not qs:
            skipped['horde'] += 1
            continue
        for x in qs[:2]:
            refs.append(sidx('1~퀘스트 · %s~wh:quest=%d' % (QKO.get(x['questId'], x.get('name', '')), x['questId'])))
    elif cat == 'Boss Drop':
        nm = NPC.get(s.get('name', ''), s.get('name', ''))
        z = ZONE.get(s.get('zone'))
        refs.append(sidx('3~드랍 · %s%s~' % (nm, ' (%s)' % z if z else '')))
    elif cat == 'Vendor':
        if s.get('faction') == 'Horde':
            skipped['horde'] += 1
            continue
        refs.append(sidx('5~상인 · %s~' % NPC.get(s.get('name', ''), s.get('name', ''))))
    elif cat == 'Zone Drop':
        z = ZONE.get(s.get('zone'))
        refs.append(sidx('3~드랍 · %s 몹~' % z) if z else sidx('2~월드 드랍 · 경매장~'))
    elif cat == 'Rare Drop':
        refs.append(sidx('2~월드 드랍 · 경매장~'))
    for cb in it.get('createdBy') or []:
        p = PROF.get(cb.get('category'))
        if p:
            refs.append(sidx('4~제작 · %s · 경매장 거래~' % p))
            break
    if q == 'c' and cat != 'Quest':
        continue  # 흰 아이템은 퀘스트 보상만
    nm = KO.get(iid)
    if not nm or re.search('[A-Za-z]{3}', nm):
        skipped['notko'] += 1
        continue  # 포에버 한글 자료에 없는 장비는 포에버에 없을 가능성이 커서 뺌
    if nm in HAVE_NM:
        skipped['have'] += 1
        continue  # 포에버에서 새 번호로 바뀐 같은 장비
    est = ''
    qlv = max([QLV.get(x['questId'], 0) for x in (s.get('quests') or [])] or [0]) if cat == 'Quest' else 0
    if qlv > rl:
        rl = qlv
    if not rl:
        il = it.get('itemLevel') or 1
        if il > 8:
            rl, est = max(1, il - 5), '?'
    stxt = ' '.join('%s%s' % (k, ('%.2f' % v).rstrip('0').rstrip('.') if isinstance(v, float) else v) for k, v in st.items())
    out.append('|'.join(map(str, [iid, str(rl or 1) + est, sl, cs, q, stxt, 1 if eff else '', ';'.join(map(str, refs)), mask, '', ','.join(allow or []), '', nm.replace('|', '/'), it.get('icon') or ''])))

os.makedirs(os.path.join(ROOT, 'data/qdb'), exist_ok=True)
open(os.path.join(ROOT, 'data/qdb/items-extra.txt'), 'w', encoding='utf-8').write('\n'.join(out) + '\n')
open(os.path.join(ROOT, 'data/qdb/sources-extra.txt'), 'w', encoding='utf-8').write('\n'.join(S) + '\n')
print('더한 장비', len(out), '출처', len(S), skipped)

# 모든 클래식 아이템 영어 이름 → 한글 (전문기술 재료 번역용): nexus 번호·영어 + Questie 한글
try:
    _ko = {}
    for _l in open(os.path.join(ROOT, 'data/qdb/item-ko.txt'), encoding='utf-8'):
        _p = _l.rstrip('\n').split('|')
        if len(_p) > 1 and _p[0].isdigit():
            _ko[int(_p[0])] = _p[1]
    _n = 0
    with open(os.path.join(ROOT, 'data/qdb/item-en-ko2.txt'), 'w', encoding='utf-8') as f:
        _seen = set()
        for _it in D:
            _i, _en = _it.get('itemId'), _it.get('name')
            _k = _ko.get(_i)
            if _en and _k and _en not in _seen and not re.search('[A-Za-z]{3}', _k):
                _seen.add(_en)
                f.write('%s|%s\n' % (_en.replace('|', '/'), _k.replace('|', '/')))
                _n += 1
    print('영→한 (전체 아이템)', _n)
except Exception as e:
    print('영→한 건너뜀', e)
