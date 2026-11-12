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
R['영어로 남은 퀘스트 이름'] = sorted([[q['id'], q['n'], q.get('z')] for q in Q.values() if lat(q['n'])], key=lambda x: x[0])[:300]
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
for f, tag in ((P('data/forg/items.txt'), 'forg'), (P('data/qdb/items-extra.txt'), 'extra')):
    if os.path.exists(f):
        for line in open(f, encoding='utf-8'):
            p = line.rstrip('\n').split('|')
            if len(p) > 12:
                items.append((p, tag))
R['장비 수'] = len(items)
R['영어 이름 장비'] = [[p[0], p[12], t] for p, t in items if lat(p[12])][:300]
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
