#!/usr/bin/env python3
"""app/ 소스와 data/forg/ 자료를 묶어 저장소 맨 위의 index.html 과 app-data.js 를 만든다."""
import json, hashlib, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
A = ROOT / 'app'; F = ROOT / 'data' / 'forg'
rd = lambda p: p.read_text(encoding='utf-8')

# 직업 자료는 쓰는 부분만 남겨 크기를 줄인다
cls = json.loads(rd(F / 'classes.json'))
slim = {}
# forg 운영 순서의 「when」에 화면 조각이 문자열로 섞여 들어온 경우($,$L22,id-0,[object Object]) → 특성·기술 이름으로
_FIXW = {'omen-of-clarity': '청명의 전조'}
def fix_when(c, w):
    def rp(m):
        k = m.group(1)
        for tk, tv in c['talents'].items():
            if tk == k or tk.endswith('-' + k):
                return tv['n']
        return _FIXW.get(k, '')
    w = (w or '').replace(' ·  ', ' ')
    w = re.sub(r'\$,\$L\w+,([a-z0-9-]+?)-\d+,\[object Object\]', rp, w or '')
    return re.sub(r'\s+', ' ', w).strip(' ·')
import re
for cid, c in cls.items():
    for s_ in c['specs']:
        for k in ('rotation', 'early', 'late'):
            for r in s_.get(k, []):
                r['when'] = fix_when(c, r['when'])
for cid, c in cls.items():
    used = set(x[1] for s in c['specs'] for x in s['steps'])
    slim[cid] = {
        'name': c['name'], 'trees': c['trees'], 'tic': c.get('tic', []),
        'learns': [[l[0], l[1], l[2], l[3], l[4], l[6], (l[7] or '')[:90]] for l in c['learns'] if l[4] in ('', 'alliance', None)],
        # 특성 칸(게임처럼 줄·칸·선행 화살표)을 그리려고 모든 특성을 넣음: [이름, 트리, 최대, 아이콘, 설명, 줄, 칸, 선행]
        'talents': {k: [v['n'], v['t'], v['max'], v.get('icon', ''), (v.get('d') or '')[:110], v.get('tier', 0), v.get('col', 0), v.get('req') or 0] for k, v in c['talents'].items()},
        'specs': [{'id': s['id'], 'name': s['name'], 'icon': s['icon'], 'steps': s['steps'],
                   'rot': [[r['when'], r['txt']] for r in s['rotation']],
                   'early': [[r['when'], r['txt']] for r in s['early']],
                   'late': [[r['when'], r['txt']] for r in s['late']]} for s in c['specs']],
    }

# 장비: forg 목록 + QuestieDB·클래식 자료로 더한 장비(data/qdb). 영어 이름은 한글로 바꿈
import re
Q = ROOT / 'data' / 'qdb'

def _dnew():
    """포에버 신규 던전 (tools/dungeons-new.py → data/qdb/dungeons-new.txt)"""
    p_ = ROOT / 'data' / 'qdb' / 'dungeons-new.txt'
    return [l for l in p_.read_text(encoding='utf-8').splitlines() if l.strip()] if p_.exists() else []


def _dgl():
    have = set(l.split('|')[0] for l in rd(F / 'dungeons.txt').splitlines() if l)
    rows = rd(F / 'dungeons.txt').rstrip('\n').split('\n') + [l[2:] for l in _dnew() if l.startswith('D|') and l.split('|')[1] not in have]
    return '\n'.join(sorted(rows, key=lambda l: int(l.split('|')[4] or 0)))


def _dq():
    have = set(l.split('|')[1] for l in rd(F / 'dungeon-quests.txt').splitlines() if l.startswith('B|'))
    base = rd(F / 'dungeon-quests.txt').rstrip('\n') + '\n' + '\n'.join(l for l in _dnew() if l[:2] in ('B|', 'Q|') and l.split('|')[1] not in have)
    # forg.gg 목록에 빠진 던전 퀘스트 (tools/dungeon-quests-extra.py)
    ex = ROOT / 'data' / 'qdb' / 'dungeon-quests-extra.txt'
    if ex.exists():
        seen = set(l.split('|')[2] for l in base.splitlines() if l.startswith('Q|'))
        base += '\n' + '\n'.join(l for l in rd(ex).splitlines() if l.startswith('Q|') and l.split('|')[2] not in seen)
    # 보상이 빠진 퀘스트에 보상 채우기 (data/qdb/dungeon-quest-rewards.txt)
    rf = ROOT / 'data' / 'qdb' / 'dungeon-quest-rewards.txt'
    if rf.exists():
        RWX = {}
        for l in rd(rf).splitlines():
            if l and not l.startswith('#'):
                q, ch, ids = l.split('|'); RWX[q] = (ch, ids)
        out = []
        for l in base.split('\n'):
            f = l.split('|')
            if f[0] == 'Q' and f[2] in RWX and not f[10]:
                while len(f) < 14: f.append('')
                f[10] = RWX[f[2]][1]; f[12] = RWX[f[2]][0]; l = '|'.join(f)
            out.append(l)
        base = '\n'.join(out)
    return base


def _guide():
    """Wowhead WoW Forever 레벨 20·30 가이드에 나온 템 (data/guides/wowhead-forever-l20-l30.txt) → {직업/특성: {20:[id], 30:[id]}}"""
    p_ = ROOT / 'data' / 'guides' / 'wowhead-forever-l20-l30.txt'
    if not p_.exists():
        return {}
    SPM = {'priest/shadow': 'priest/shadow-magic', 'shaman/elemental': 'shaman/elemental-combat', 'druid/feral': 'druid/feral-cat',
           'druid/feraldps': 'druid/feral-cat', 'druid/feraltank': 'druid/feral-bear'}
    raw = {}
    for l in p_.read_text(encoding='utf-8').splitlines():
        if not l.strip():
            continue
        if ':' in l:
            k, v = l.split(':', 1); raw[k] = [int(x) for x in v.split()]
        else:
            k, v = l.split('='); raw[k] = ('=', v)
    for k, v in list(raw.items()):
        if isinstance(v, tuple):
            raw[k] = raw[v[1]]
    out = {}
    for k, ids in raw.items():
        sp, L = k.rsplit('/', 1)
        if k == 'druid/feral/L30':
            sp = 'druid/feraltank'
        sp = SPM.get(sp, sp)
        d = out.setdefault(sp, {})
        d[L[1:]] = sorted(set(d.get(L[1:], []) + ids))
    return out


ko = {}
if (Q / 'item-ko.txt').exists():
    for line in rd(Q / 'item-ko.txt').splitlines():
        f = line.split('|')
        if len(f) > 1 and f[0].isdigit():
            ko[int(f[0])] = f[1]
lat = lambda x: bool(re.search('[A-Za-z]{3}', x or ''))
items = []
for line in rd(F / 'items.txt').splitlines():
    if not line:
        continue
    f = line.split('|')
    if len(f) > 12 and lat(f[12]) and ko.get(int(f[0])) and not lat(ko[int(f[0])]):
        f[12] = ko[int(f[0])]
    items.append('|'.join(f))
srcs = rd(F / 'sources.txt').rstrip('\n')
# 상인 이름이 영어로 남은 것 → 한글 (npc-en-ko.txt)
_npcko = dict(l.split('|', 1) for l in (ROOT / 'data/qdb/npc-en-ko.txt').read_text(encoding='utf-8').splitlines() if '|' in l)
srcs = re.sub(r'(?m)^(5~상인 · )([^~]+)', lambda m: m.group(1) + _npcko.get(m.group(2), m.group(2)), srcs)
if (Q / 'items-extra.txt').exists():
    off = len(srcs.split('\n'))
    srcs += '\n' + rd(Q / 'sources-extra.txt').rstrip('\n')
    for line in rd(Q / 'items-extra.txt').splitlines():
        f = line.split('|')
        if len(f) > 12:
            f[7] = ';'.join(str(int(x) + off) for x in f[7].split(';') if x != '')
            f[9] = 'extra'
            # 리치왕 시절 '곰·표범 변신 전투력'((DPS-54.8)×14)이 전투력으로 섞여 들어온 무기 → 클래식·포에버엔 없는 값이라 뺌
            _st = dict(re.findall(r'([a-z]+)(-?[\d.]+)', f[5]))
            if 'ap' in _st and 'dps' in _st and float(_st['dps']) > 54.8 and abs((float(_st['dps']) - 54.8) * 14 - float(_st['ap'])) <= 3:
                f[5] = ' '.join(t for t in f[5].split() if not re.match(r'^ap-?[\d.]+$', t))
            items.append('|'.join(f))
if (Q / 'items-wowf.jsonl').exists() and (Q / 'item-equip.txt').exists():
    import sys
    sys.path.insert(0, str(A))
    from items_wowf import convert
    sl_ = srcs.split('\n')
    si_ = {l: i for i, l in enumerate(sl_)}
    def sidx(label):
        if label not in si_:
            si_[label] = len(sl_); sl_.append(label)
        return si_[label]
    have_ = set(int(l.split('|')[0]) for l in items)
    from items_wowf import eff_stats, parse_stats, merge_stats
    _stfix = 0
    WREC = {}
    for l_ in rd(Q / 'items-wowf.jsonl').splitlines():
        if l_:
            o_ = json.loads(l_)
            if not o_.get('none'):
                WREC[o_['id']] = o_
    for ix, line in enumerate(items):
        f = line.split('|')
        o_ = WREC.get(int(f[0]))
        if o_ and len(f) > 12 and lat(f[12]) and o_.get('nm') and not lat(o_['nm']):
            f[12] = o_['nm']
            items[ix] = '|'.join(f)
        if o_ and len(f) > 6:
            # 포에버 툴팁(wowf.io)으로 능력치 채우기: forg에 빠진 주문력·적중·치명타 등급·「지능 +8」 꼴 등
            _cur = {k: float(v) for k, v in re.findall(r'([a-z]+\d?)(-?[\d.]+)', f[5])}
            _new = merge_stats(_cur, parse_stats(o_.get('lines')))
            if _new != _cur:
                f[5] = ' '.join('%s%s' % (k, ('%g' % v)) for k, v in _new.items())
                items[ix] = '|'.join(f)
                _stfix += 1
    print('포에버 툴팁으로 능력치 보강', _stfix)
    for line in convert(rd(Q / 'items-wowf.jsonl'), rd(Q / 'item-equip.txt'), sidx):
        if int(line.split('|')[0]) not in have_:
            items.append(line)
    srcs = '\n'.join(sl_)
# 착용 가능 직업: forg 마스크는 「어울리는 직업」(능력치 기준)이라 실제 착용 규칙으로 다시 계산
#  - 무기 숙련·방어구 종류로 판단, wowf.io 「직업:」 줄이나 allow가 있으면 그 직업만
#  - forg가 3직업 이하로만 표시한 건 직업 전용 장비(티어 등)로 보고 그대로 둠
try:
    from items_wowf import mask_of, CL as _CL
    _KO = {'전사': 'warrior', '성기사': 'paladin', '사냥꾼': 'hunter', '도적': 'rogue', '사제': 'priest', '주술사': 'shaman', '마법사': 'mage', '흑마법사': 'warlock', '드루이드': 'druid'}
    _W = {}
    if (Q / 'items-wowf.jsonl').exists():
        for l_ in rd(Q / 'items-wowf.jsonl').splitlines():
            if l_:
                o_ = json.loads(l_)
                _W[o_['id']] = o_
    _fix = 0
    for ix, line in enumerate(items):
        f = line.split('|')
        if len(f) < 13 or f[9] not in ('', 'extra'):
            continue
        m0 = int(f[8] or 0)
        allow = [x for x in f[10].split(',') if x] or None
        o_ = _W.get(int(f[0]))
        if o_ and not o_.get('none'):
            cl = [t for t in (o_.get('lines') or []) if t.startswith('직업:')]
            if cl:
                allow = [_KO[x.strip()] for x in cl[0][3:].split(',') if x.strip() in _KO] or allow
        elif not allow and bin(m0).count('1') <= 3 and not (f[3] or '').startswith('2.'):
            # 무기는 forg 표시가 적어도 숙련 규칙으로 (도적 한손 도끼처럼 포에버에서 바뀐 숙련 반영)
            continue
        m1 = mask_of(f[3] or '', allow)
        if m1 and m1 != m0:
            f[8] = str(m1)
            items[ix] = '|'.join(f)
            _fix += 1
    print('착용 직업 다시 계산', _fix)
except ImportError as e:
    print('착용 직업 계산 건너뜀', e)
# 출처가 비어 있는 고급 이상 장비 = 월드 드랍(경매장)
_sl = srcs.split('\n')
_wd = None
for ix, line in enumerate(items):
    f = line.split('|')
    if len(f) > 12 and not f[7] and f[4] in ('u', 'r', 'e'):
        if _wd is None:
            _wd = len(_sl); _sl.append('2~월드 드랍~')
        f[7] = str(_wd); items[ix] = '|'.join(f)
srcs = '\n'.join(_sl)

# 전문기술 표의 영어 아이템·제작 이름을 한글로 (QuestieDB 아이템 영→한, 마법부여는 규칙으로)
def wy_names():
    p = ROOT / 'data' / 'wythic' / 'profs.json'
    return json.loads(rd(p)).get('n', {}) if p.exists() else {}
WYN = wy_names()

def prof_ko(txt):
    M = {}
    for _fn in ('item-en-ko.txt', 'item-en-ko2.txt'):
        pth = Q / _fn
        if pth.exists():
            for l in rd(pth).splitlines():
                if '|' in l:
                    en, ko_ = l.split('|', 1)
                    M.setdefault(en, ko_)
    wp = Q / 'items-wowf.jsonl'
    if wp.exists():
        for l in rd(wp).splitlines():
            if not l:
                continue
            o = json.loads(l)
            L_ = o.get('lines') or []
            if o.get('nm') and '영어 이름' in L_:
                k = L_.index('영어 이름')
                if k + 1 < len(L_) and not lat(o['nm']):
                    M.setdefault(L_[k + 1], o['nm'])
    # wythic 전문기술 자료의 한글 이름 (포에버 새 제작법·재료)
    for en_, v_ in WYN.items():
        if v_[0] and v_[2] == en_:
            M.setdefault(en_, v_[0])
    SL = {'Bracer': '손목', 'Chest': '가슴', 'Cloak': '망토', 'Boots': '장화', 'Gloves': '장갑', 'Weapon': '무기', 'Shield': '방패', '2H Weapon': '양손 무기'}
    GR = {'Minor': '최하급', 'Lesser': '하급', 'Inferior': '최하급', 'Greater': '상급', 'Superior': '최상급', 'Major': '특급'}
    EF = {'Stamina': '체력', 'Spirit': '정신력', 'Intellect': '지능', 'Agility': '민첩성', 'Strength': '힘', 'Defense': '방어', 'Deflect': '피해 반사', 'Absorption': '피해 흡수', 'Health': '생명력', 'Mana': '마나', 'Striking': '타격', 'Protection': '보호'}
    def ench(m):
        sl, ef = m.group(1), m.group(2).split()
        g = GR.get(ef[0]) if len(ef) > 1 else None
        e = EF.get(ef[-1])
        if sl not in SL or not e:
            return m.group(0)
        return SL[sl] + ' 마법부여 - ' + ((g + ' ') if g else '') + e
    def one(name):
        n = name.strip()
        pre = ''
        if n.startswith('+'):
            pre, n = '+', n[1:]
        mc = re.match(r'^(.*?)(\s+[+]?\d+(?:~\d+)?(?:\s*등)?)$', n)
        base, tail = (mc.group(1), mc.group(2)) if mc else (n, '')
        tail = tail
        base0 = base
        b2 = base.replace("\\'", "'")
        for cand in (b2, 'Handful of ' + b2, b2 + 's'):
            if cand in M:
                return pre + M[cand] + tail
        me_ = re.match(r'^(2H Weapon|Bracer|Chest|Cloak|Boots|Gloves|Weapon|Shield)\s+(.+)$', b2)
        if me_ and ('Enchant %s - %s' % (me_.group(1), me_.group(2))) in M:
            return pre + M['Enchant %s - %s' % (me_.group(1), me_.group(2))] + tail
        e = re.sub(r'^Enchant (2H Weapon|Bracer|Chest|Cloak|Boots|Gloves|Weapon|Shield) - (.+)$', ench, base)
        return pre + (e if e != base else base) + tail
    def tr(sq):
        t = sq.group(1)
        if not re.search('[A-Za-z]{3}', t) or t.startswith('http') or re.match(r'^[a-z]+$', t):
            return sq.group(0)
        parts = re.split(r'(\s*(?:,|/|→|\(|\))\s*)', t)
        return "'" + ''.join(p if re.match(r'^\s*(?:,|/|→|\(|\))\s*$', p) or not p else one(p) for p in parts) + "'"
    return re.sub(r"'((?:[^'\\]|\\.)*)'", tr, txt)

PROFS_JS = prof_ko(rd(A / 'profs.js'))
# 전문기술 화면에 쓰는 이름 → 아이콘 (만드는 아이템·재료)
PICO = {}
# 재료 이름 → 아이템 번호 (애드온 가방 개수와 맞추기용)
KO_ID = {}
for _id, _nm in sorted(ko.items()):
    KO_ID.setdefault(_nm, _id)
MATID = {}
for sq in re.findall(r"'((?:[^'\\]|\\.)*)'", PROFS_JS):
    for part in re.split(r'\s*(?:,|/|→|\(|\))\s*', sq.replace("\\'", "'")):
        nm_ = re.sub(r'\s+[+]?\d+(?:~\d+)?(?:\s*등)?$', '', part.strip())
        v_ = WYN.get(nm_) or WYN.get(re.sub(r'\s*(꽃잎|잎사귀)$', '', nm_))
        if v_ and v_[1]:
            PICO[nm_] = v_[1]
        if nm_ and nm_ in KO_ID:
            MATID[nm_] = KO_ID[nm_]
# 한글판이 아직 없는 영문 이름 템 → wythic.com 던전 자료(data/wythic/dungeons.json)의 한글 이름으로
_wyko = {}
if (ROOT / 'data' / 'wythic' / 'dungeons.json').exists():
    for _d in json.loads(rd(ROOT / 'data' / 'wythic' / 'dungeons.json')).get('dungeons', []):
        for _b in _d.get('bosses', []):
            for _it in _b.get('drops', []):
                _wyko[_it[0]] = _it[1]
        for _it in _d.get('trash', []):
            _wyko[_it[0]] = _it[1]
_nko = 0
for _i, _l in enumerate(items):
    _f = _l.split('|')
    if len(_f) > 12 and re.search('[A-Za-z]{3}', _f[12]) and _f[0].isdigit() and _wyko.get(int(_f[0])) and not re.search('[A-Za-z]{3}', _wyko[int(_f[0])]):
        _f[12] = _wyko[int(_f[0])]; items[_i] = '|'.join(_f); _nko += 1
print('wythic ko names', _nko)
ITEMS_TXT = '\n'.join(items) + '\n'
# 아이템 출처 퀘스트의 받는 레벨 (얻을 수 있는 레벨 계산용)
QLV = {}
if (Q / 'quests.jsonl').exists():
    want = set(int(x) for x in re.findall(r'quest=(\d+)', srcs))
    for line in rd(Q / 'quests.jsonl').splitlines():
        o = json.loads(line)
        if o['id'] in want:
            QLV[o['id']] = max(o.get('m') or 0, (o.get('lv') or 0) - 3)
SRC_TXT = srcs + '\n'

def js_str(s):
    return json.dumps(s, ensure_ascii=False)

# 자료 파일 내용이 바뀔 때만 새로 받도록 내용 지문을 넣음
def fp(path):
    q = ROOT / path
    return hashlib.md5(q.read_bytes()).hexdigest()[:10] if q.exists() else '0'
DVER = {k: fp(v) for k, v in {'fq': 'data/forg/quests.jsonl', 'rw': 'data/forg/rewards.jsonl', 'qdb': 'data/qdb/quests.jsonl', 'dgg': 'data/forg/dungeon-guide.json', 'world': 'data/qdb/world.json', 'wy': 'data/wythic/dungeons.json'}.items()}
data = '\n'.join([
    'const D_VER=' + json.dumps(DVER) + ';',
    '/* 와포 도우미 자료 — forg.gg 공개 페이지에서 GitHub Actions로 모은 것 (tools/forg-*.mjs) */',
    'const D_ITEMS=' + js_str(ITEMS_TXT) + ';',
    'const D_SRC=' + js_str(SRC_TXT) + ';',
    'const D_QLV=' + json.dumps(QLV, separators=(',', ':')) + ';',
    'const D_GUIDE=' + json.dumps(_guide(), separators=(',', ':')) + ';',
    'const D_SIMW=' + (rd(F / 'sim-weights.json') if (F / 'sim-weights.json').exists() else '{}') + ';',
    'const D_DGL=' + js_str(_dgl()) + ';',
    'const D_DQ=' + js_str(_dq()) + ';',
    'const D_LVL=' + js_str(rd(F / 'leveling.txt')) + ';',
    'const D_BOSS=' + js_str(rd(F / 'bosses.txt') if (F / 'bosses.txt').exists() else '') + ';',
    'const D_AB=' + js_str('\n'.join(l for l in rd(ROOT / 'data/guides/abilities.txt').split('\n') if l and not l.startswith('# '))) + ';',
    'const D_CLS=' + json.dumps(slim, ensure_ascii=False, separators=(',', ':')) + ';',
    PROFS_JS,
    'const PICO=' + json.dumps(PICO, ensure_ascii=False, separators=(',', ':')) + ';',
    'const D_MATID=' + json.dumps(MATID, ensure_ascii=False, separators=(',', ':')) + ';',
    rd(A / 'hubs.js'),
])
(ROOT / 'app-data.js').write_text(data, encoding='utf-8')
ver = hashlib.md5(data.encode()).hexdigest()[:8]
app = rd(A / 'app.js'); css = rd(A / 'style.css')
aver = hashlib.md5((app + css + ver).encode()).hexdigest()[:6]
# 화면 아래에 「사이트 업데이트 날짜」를 보여 줌. 내용이 그대로면 예전 날짜를 그대로 둠(자동 갱신 때 괜히 바뀌지 않게)
import datetime
_prev = (ROOT / 'index.html').read_text(encoding='utf-8') if (ROOT / 'index.html').exists() else ''
_m = re.search(r'/\* v' + aver + r' @([^*]+) \*/', _prev)
stamp = _m.group(1) if _m else datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9))).strftime('%m/%d %H:%M')
app = app.replace("'__BUILD__'", repr(stamp))
html = f'''<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#15130f">
<link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="img/apple-touch-icon.png"><link rel="icon" href="img/icon-192.png">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="와포 도우미"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<title>와포 도우미</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@700&display=swap">
<meta name="description" content="와우 포에버 얼라이언스 레벨업·장비·퀘스트·던전 도우미">
<style>{css}</style></head>
<body><div id="app"><p class="boot">불러오는 중…</p></div>
<script src="app-data.js?v={ver}"></script>
<script>/* v{aver} @{stamp} */
{app}</script>
<script>if('serviceWorker' in navigator&&location.protocol==='https:')addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{{}}))</script>
</body></html>'''
(ROOT / 'index.html').write_text(html, encoding='utf-8')
print('index.html', len(html), 'app-data.js', len(data))

# 애드온용 보스 공략 (abilities.txt → BossTips.lua): 한글·영어 보스 이름 둘 다로 찾기
def _boss_lua():
    dgg = json.loads(rd(ROOT / 'data/forg/dungeon-guide.json'))
    en2ko = {}
    for slug, g in dgg.items():
        for st in g.get('steps', []):
            if st.get('en') and st.get('nm'):
                en2ko.setdefault(slug, {})[st['en']] = st['nm']
    LB = {'dz': '위험', 'int': '끊기', 'av': '피하기', 'add': '쫄', 'tk': '탱커', 'hl': '치유', 'info': '참고'}
    DK = {'magic': '마법', 'curse': '저주', 'poison': '독', 'disease': '질병', 'purge': '정화'}
    cur = None; boss = None; T = {}
    for l in rd(ROOT / 'data/guides/abilities.txt').split('\n'):
        if not l or l.startswith('# '):
            continue
        if l[0] == '@':
            cur = l[1:]; continue
        if l[0] == '#':
            boss = l[1:]; T.setdefault((cur, boss), []); continue
        f = l.split('|')
        if len(f) < 5 or not boss:
            continue
        t, _, k = f[0].partition(':')
        lab = ('해제(' + DK.get(k, k) + ')') if t == 'dis' else LB.get(t, t)
        x = f[4].split('→')
        tip = (f[1] + ' — ' + x[-1].strip()) if len(x) > 1 else (f[1] + ' — ' + f[4].strip())
        if len(tip) > 70:
            tip = tip[:69] + '…'
        T[(cur, boss)].append(t + '|' + lab + '|' + tip)
    def q(v):
        return '"' + v.replace('\\', '\\\\').replace('"', '\\"') + '"'
    out = ['-- 자동 생성 (app/build.py) · 보스 이름(한글/영어) → 공략 줄 "종류|이름표|내용"', 'WowfHelperBoss = {}', 'local B = WowfHelperBoss']
    n = 0
    for (slug, en), lines in T.items():
        if not lines:
            continue
        n += 1
        out.append('do local t = {' + ', '.join(q(x) for x in lines) + '}')
        out.append('B[' + q(en) + '] = t')
        ko_ = en2ko.get(slug, {}).get(en)
        if ko_ and ko_ != en:
            out.append('B[' + q(ko_) + '] = t')
        out.append('end')
    (ROOT / 'addon' / 'WowfHelper' / 'BossTips.lua').write_text('\n'.join(out) + '\n', encoding='utf-8')
    return n
print('boss tips', _boss_lua())
# 애드온 묶음 (addon/WowfHelper → addon/WowfHelper.zip), 내용이 같으면 그대로
import zipfile, io
_src = ROOT / 'addon' / 'WowfHelper'
if _src.exists():
    _buf = io.BytesIO()
    with zipfile.ZipFile(_buf, 'w', zipfile.ZIP_DEFLATED) as z:
        for f in sorted(_src.iterdir()):
            zi = zipfile.ZipInfo('WowfHelper/' + f.name, date_time=(2026, 1, 1, 0, 0, 0))
            zi.compress_type = zipfile.ZIP_DEFLATED
            z.writestr(zi, f.read_bytes())
    _out = ROOT / 'addon' / 'WowfHelper.zip'
    if not _out.exists() or _out.read_bytes() != _buf.getvalue():
        _out.write_bytes(_buf.getvalue())
