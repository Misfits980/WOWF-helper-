"""자료 자동 검사: 자료를 새로 모을 때마다 이상한 곳을 찾아 data/check-report.json 에 적는다.
python3 tools/data-check.py  (빌드 전에 돌림. 오류가 있어도 멈추지 않고 보고만 함)"""
import json, os, re, collections
ROOT = os.path.join(os.path.dirname(__file__), '..')
P = lambda *a: os.path.join(ROOT, *a)
lat = lambda s: bool(re.search('[A-Za-z]{3}', s or ''))
R = collections.OrderedDict()


def jl(path):
    out = []
    if os.path.exists(path):
        for line in open(path, encoding='utf-8'):
            if line.strip():
                out.append(json.loads(line))
    return out


# ---------- 퀘스트 ----------
Q = {o['id']: o for o in jl(P('data/qdb/quests.jsonl'))}
R['퀘스트 수'] = len(Q)
R['영어로 남은 퀘스트 이름'] = sorted([[q['id'], q['n'], q.get('z')] for q in Q.values() if lat(q['n']) and not re.search('[가-힣]', q['n'])], key=lambda x: x[0])[:300]
R['반납 NPC 없는 퀘스트'] = [[q['id'], q['n'], q.get('z')] for q in Q.values() if not q.get('r')][:300]
R['레벨 0 퀘스트'] = [[q['id'], q['n']] for q in Q.values() if not q.get('lv')]
inv = []
for q in Q.values():
    for p in (q.get('pre') or []) + (q.get('pre1') or []):
        a = Q.get(p)
        if a and a.get('lv') and q.get('lv') and a['lv'] - q['lv'] >= 5:
            inv.append([p, a['n'], a['lv'], q['id'], q['n'], q['lv']])
    nx = Q.get(q.get('nx'))
    if nx and q.get('lv') and nx.get('lv') and q['lv'] - nx['lv'] >= 5:
        inv.append([q['id'], q['n'], q['lv'], nx['id'], nx['n'], nx['lv']])
R['레벨이 거꾸로 이어진 연계(5레벨 이상)'] = inv

# ---------- 장비 ----------
items = []
_ad = P('app-data.js')
if os.path.exists(_ad):  # 실제 앱에 들어간 장비 기준 (한글 이름 바꾼 뒤)
    _m = re.search(r'const D_ITEMS=("(?:[^"\\]|\\.)*")', open(_ad, encoding='utf-8').read())
    for line in json.loads(_m.group(1)).split('\n'):
        p = line.split('|')
        if len(p) > 12:
            items.append((p, p[9] if p[9] in ('extra', 'wowf') else 'forg'))
else:
    for f, tag in ((P('data/forg/items.txt'), 'forg'), (P('data/qdb/items-extra.txt'), 'extra')):
        if os.path.exists(f):
            for line in open(f, encoding='utf-8'):
                p = line.rstrip('\n').split('|')
                if len(p) > 12:
                    items.append((p, tag))
R['장비 수'] = len(items)
R['영어 이름 장비'] = [[p[0], p[12], t] for p, t in items if lat(p[12]) and not re.search('[가-힣]', p[12])][:300]
odd = []
for p, t in items:
    st = dict((m.group(1), float(m.group(2))) for m in re.finditer(r'(mp5|[a-z]+)(-?[\d.]+)', p[5]))
    lv = int(re.sub(r'\D', '', p[1]) or 1)
    if st.get('dps', 0) > lv * 1.7 + 15 or any(v > lv * 2.5 + 20 for k, v in st.items() if k in ('sta', 'str', 'agi', 'int', 'spi')) or st.get('sp', 0) > lv * 1.6 + 20:
        odd.append([p[0], p[12], p[1], p[5], t])
R['능력치가 레벨에 비해 지나친 장비'] = odd[:200]
R['출처 없는 장비'] = len([1 for p, t in items if not p[7]])
nm = collections.defaultdict(list)
for p, t in items:
    nm[p[12]].append(p[0] + ':' + t)
R['이름 같은 장비(번호 다름)'] = [[k, v] for k, v in nm.items() if len(v) > 1][:200]

# ---------- 아이템 ↔ 게임 값·퀘스트 보상 (2026-11-20 아이템 점검에서 나온 것) ----------
_src = []
if os.path.exists(_ad):
    _t = open(_ad, encoding='utf-8').read()
    _m = re.search(r'const D_SRC=("(?:[^"\\]|\\.)*")', _t)
    if _m:
        _src = json.loads(_m.group(1)).split('\n')
ids = set(int(p[0]) for p, t in items if p[0].isdigit())
AD = {o['id']: o for o in jl(P('data/qdb/items-addon.jsonl'))}
RW = {}
for _o in jl(P('data/forg/rewards.jsonl')):
    RW[_o['id']] = _o
HQ = set(int(x) for x in open(P('data/qdb/horde-quests.txt')).read().split()) if os.path.exists(P('data/qdb/horde-quests.txt')) else set()
BAG = {}
if os.path.exists(P('data/qdb/item-bag.txt')):
    for _l in open(P('data/qdb/item-bag.txt'), encoding='utf-8'):
        _f = _l.rstrip('\n').split('|')
        if len(_f) > 3 and _f[0].isdigit():
            BAG[int(_f[0])] = _f
# 퀘스트 보상(무기·방어구)인데 앱 장비 목록에 없음 → 추천·「못 씀」·능력치가 안 나옴 (예전 원인: 새 형식 도감 부위 「한손 장비」를 못 읽음)
_miss = []
for q, o in RW.items():
    if q in HQ:
        continue
    for x in (o.get('ch') or []) + (o.get('fx') or []):
        b_ = BAG.get(x[0])
        if x[0] not in ids and b_ and b_[3] in ('2', '4'):
            _miss.append([x[0], x[1], q])
R['퀘스트 보상인데 장비 목록에 없는 무기·방어구'] = _miss[:300]
# 애드온(/wfh 아이템)이 게임에서 아직 안 읽은 장비 → 이름·능력치·방어도·요구 레벨을 다른 자료로만 앎
R['게임 값(애드온) 없는 장비'] = sorted(i for i in ids if i not in AD)[:1000]
R['방어도 없는 방어구(탱커 점수에 0)'] = [[p[0], p[12]] for p, t in items if p[3] in ('4.1', '4.2', '4.3', '4.4') and not re.search(r'(?:^|\s)bar\d', p[5])][:300]
# 앱(app.js ITEMS)이 못 읽는 능력치 칸 (예전 critMelee1·hitMelee1 → 치명타·적중이 점수에서 빠졌음)
R['앱이 못 읽는 능력치 이름'] = [[p[0], p[12], tk] for p, t in items for tk in p[5].split() if not re.match(r'^(mp5|[a-z]+)(-?[\d.]+)$', tk)][:200]
# 얻는 곳 이름이 영어로 남은 것 (화면에 영어로 나옴) · 장비가 쓰는 출처만
_used = collections.Counter(int(x) for p, t in items for x in p[7].split(';') if x.isdigit())
_eng = []
for i_, n_ in _used.most_common():
    if 0 <= i_ < len(_src):
        _f = _src[i_].split('~')
        _nm = _f[1].split(' · ')[-1] if len(_f) > 1 else ''
        if re.search('[A-Za-z]{3}', _nm) and not re.search('[가-힣]', re.sub(r'\([^)]*\)', '', _nm)) and not _src[i_].startswith('5~PvP'):
            _eng.append([_f[1], n_, ('호드' if re.search(r'quest=(\d+)', _src[i_]) and int(re.search(r'quest=(\d+)', _src[i_]).group(1)) in HQ else '')])
R['영어로 남은 얻는 곳 이름'] = _eng[:300]
# 보상표(forever-tool)에 「고를 템」이 1개뿐 = 직업마다 보상이 다른 포에버 퀘스트일 수 있음 → 앱은 다른 직업 보상도 「하나 고르기」로 합쳐 보여 줌
R['고를 템이 1개뿐인 퀘스트(직업별 보상?)'] = [[q, Q.get(q, {}).get('n'), o['ch'][0][1]] for q, o in RW.items() if o.get('ch') and len(o['ch']) == 1]
R['게임에 착용 레벨 제한 없는 장비'] = sum(1 for p, t in items if '!' in p[1])

# ---------- 던전 ----------
G = json.load(open(P('data/forg/dungeon-guide.json'), encoding='utf-8')) if os.path.exists(P('data/forg/dungeon-guide.json')) else {}
DG = [l.split('|')[0] for l in open(P('data/forg/dungeons.txt'), encoding='utf-8') if l.strip()]
R['진행 순서 없는 던전'] = [d for d in DG if not (G.get(d) or {}).get('steps')]
R['지도 없는 던전'] = [d for d in DG if not (G.get(d) or {}).get('floors')]

summary = {k: (len(v) if isinstance(v, list) else v) for k, v in R.items()}
R['요약'] = summary
json.dump(R, open(P('data/check-report.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for k, v in summary.items():
    print('%-30s %s' % (k, v))
