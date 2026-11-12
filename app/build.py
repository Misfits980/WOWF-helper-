#!/usr/bin/env python3
"""app/ 소스와 data/forg/ 자료를 묶어 저장소 맨 위의 index.html 과 app-data.js 를 만든다."""
import json, hashlib, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
A = ROOT / 'app'; F = ROOT / 'data' / 'forg'
rd = lambda p: p.read_text(encoding='utf-8')

# 직업 자료는 쓰는 부분만 남겨 크기를 줄인다
cls = json.loads(rd(F / 'classes.json'))
slim = {}
for cid, c in cls.items():
    used = set(x[1] for s in c['specs'] for x in s['steps'])
    slim[cid] = {
        'name': c['name'], 'trees': c['trees'],
        'learns': [[l[0], l[1], l[2], l[3], l[4], l[6], (l[7] or '')[:90]] for l in c['learns'] if l[4] in ('', 'alliance', None)],
        'talents': {k: [v['n'], v['t'], v['max'], v.get('icon', ''), (v.get('d') or '')[:110]] for k, v in c['talents'].items() if k in used},
        'specs': [{'id': s['id'], 'name': s['name'], 'icon': s['icon'], 'steps': s['steps'],
                   'rot': [[r['when'], r['txt']] for r in s['rotation']],
                   'early': [[r['when'], r['txt']] for r in s['early']],
                   'late': [[r['when'], r['txt']] for r in s['late']]} for s in c['specs']],
    }

# 장비: forg 목록 + QuestieDB·클래식 자료로 더한 장비(data/qdb). 영어 이름은 한글로 바꿈
import re
Q = ROOT / 'data' / 'qdb'
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
if (Q / 'items-extra.txt').exists():
    off = len(srcs.split('\n'))
    srcs += '\n' + rd(Q / 'sources-extra.txt').rstrip('\n')
    for line in rd(Q / 'items-extra.txt').splitlines():
        f = line.split('|')
        if len(f) > 12:
            f[7] = ';'.join(str(int(x) + off) for x in f[7].split(';') if x != '')
            f[9] = 'extra'
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
    from items_wowf import eff_stats
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
            add = eff_stats(o_.get('lines'))
            if add:
                f[5] = (f[5] + ' ' if f[5] else '') + ' '.join('%s%s' % (k, ('%g' % v)) for k, v in add.items())
                items[ix] = '|'.join(f)
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
        elif not allow and bin(m0).count('1') <= 3:
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
        e = re.sub(r'^Enchant (2H Weapon|Bracer|Chest|Cloak|Boots|Gloves|Weapon|Shield) - (.+)$', ench, base)
        return pre + (e if e != base else base) + tail
    def tr(sq):
        t = sq.group(1)
        if not re.search('[A-Za-z]{3}', t) or t.startswith('http') or re.match(r'^[a-z]+$', t):
            return sq.group(0)
        parts = re.split(r'(\s*(?:,|/|→|\(|\))\s*)', t)
        return "'" + ''.join(p if re.match(r'^\s*(?:,|/|→|\(|\))\s*$', p) or not p else one(p) for p in parts) + "'"
    return re.sub(r"'((?:[^'\\]|\\.)*)'", tr, txt)

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
DVER = {k: fp(v) for k, v in {'fq': 'data/forg/quests.jsonl', 'rw': 'data/forg/rewards.jsonl', 'qdb': 'data/qdb/quests.jsonl', 'dgg': 'data/forg/dungeon-guide.json', 'world': 'data/qdb/world.json'}.items()}
data = '\n'.join([
    'const D_VER=' + json.dumps(DVER) + ';',
    '/* 와포 도우미 자료 — forg.gg 공개 페이지에서 GitHub Actions로 모은 것 (tools/forg-*.mjs) */',
    'const D_ITEMS=' + js_str(ITEMS_TXT) + ';',
    'const D_SRC=' + js_str(SRC_TXT) + ';',
    'const D_QLV=' + json.dumps(QLV, separators=(',', ':')) + ';',
    'const D_SIMW=' + (rd(F / 'sim-weights.json') if (F / 'sim-weights.json').exists() else '{}') + ';',
    'const D_DGL=' + js_str(rd(F / 'dungeons.txt')) + ';',
    'const D_DQ=' + js_str(rd(F / 'dungeon-quests.txt')) + ';',
    'const D_LVL=' + js_str(rd(F / 'leveling.txt')) + ';',
    'const D_BOSS=' + js_str(rd(F / 'bosses.txt') if (F / 'bosses.txt').exists() else '') + ';',
    'const D_CLS=' + json.dumps(slim, ensure_ascii=False, separators=(',', ':')) + ';',
    prof_ko(rd(A / 'profs.js')),
    rd(A / 'hubs.js'),
])
(ROOT / 'app-data.js').write_text(data, encoding='utf-8')
ver = hashlib.md5(data.encode()).hexdigest()[:8]
app = rd(A / 'app.js'); css = rd(A / 'style.css')
aver = hashlib.md5(app.encode()).hexdigest()[:6]
html = f'''<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#15130f">
<title>와포 도우미</title>
<meta name="description" content="와우 포에버 얼라이언스 레벨업·장비·퀘스트·던전 도우미">
<style>{css}</style></head>
<body><div id="app"><p class="boot">불러오는 중…</p></div>
<script src="app-data.js?v={ver}"></script>
<script>/* v{aver} */
{app}</script>
</body></html>'''
(ROOT / 'index.html').write_text(html, encoding='utf-8')
print('index.html', len(html), 'app-data.js', len(data))
