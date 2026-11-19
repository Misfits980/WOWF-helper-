"""대표 판 재생 자료 만들기: replay.py가 받은 이름 없는 원자료 → data/guides/dungeon-replays.json 의 던전 한 개.

python3 tools/wcl/replay_build.py <replay-raw.json.gz> <던전 slug> [층 번호(0부터), 기본 0]

- 좌표: 워크래프트로그 x·y(야드×100) → 세계 X = y/100, 세계 Y = −x/100 (검은심연 몹 159마리로 맞춤, 중간 오차 16야드 = 끌려온 거리)
  → 지도 % 는 make.py와 같게: 가로 = (ymax−Y)/(ymax−ymin), 세로 = (xmax−X)/(xmax−xmin), 층 범위는 tools/dgmap/bounds.json
- 사람: 기록 안 번호 대신 1..5 차례, 직업·역할만(이름·서버 없음)
- 풀: 기록의 dungeonPulls(시작·끝·가운데) + 그 풀 몹을 지도 무리에 이어 붙임(같은 이름, 처음 맞은 자리에서 가장 가까운 무리)
- 기록 사이 빈 구간(10야드 넘게 떨어짐)은 길 찾기 격자(nav.png)로 이어 그림
"""
import sys, os, json, gzip, math, re
import numpy as np
from PIL import Image
from scipy.sparse import csr_matrix
from scipy.sparse.csgraph import dijkstra

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
raw_p, slug = sys.argv[1], sys.argv[2]
FI = int(sys.argv[3]) if len(sys.argv) > 3 else 0
D = json.load(gzip.open(raw_p, 'rt', encoding='utf-8'))
M3 = json.load(open(os.path.join(ROOT, 'data/guides/dungeon-maps3d.json'), encoding='utf-8'))
FL = M3[slug]['floors'][FI]
B = json.load(open(os.path.join(ROOT, 'tools/dgmap/bounds.json')))[slug][FI]['b']
xmin, xmax, ymin, ymax = B
ENKO = {}
for l in open(os.path.join(ROOT, 'data/qdb/npc-en-ko.txt'), encoding='utf-8'):
    if '|' in l:
        a, b = l.rstrip('\n').split('|', 1)
        ENKO.setdefault(a.strip().lower(), b.strip())

T0 = D['fight']['startTime']
DUR = round((D['fight']['endTime'] - T0) / 1000)
A = {a['id']: a for a in D['actors']}


def pct(wx, wy):  # 기록 좌표 → 지도 %
    X, Y = wy / 100.0, -wx / 100.0
    return (ymax - Y) / (ymax - ymin) * 100.0, (xmax - X) / (xmax - xmin) * 100.0


YPP = FL['sc'] / 100.0  # 가로 1% = 몇 야드
ASP = FL['h'] / FL['w']  # 세로 1% = 가로 1% × ASP


def yd(a, b):
    return math.hypot((a[0] - b[0]) * YPP, (a[1] - b[1]) * YPP * ASP)


# ── 길 찾기 격자 ──
nv = FL['nav']
NI = np.array(Image.open(os.path.join(ROOT, nv['img'])).convert('RGBA'))
GH, GW = NI.shape[:2]
H = NI[:, :, 0].astype(float) * nv['dz'] + nv['z0']
WALK = NI[:, :, 3] == 255
cy = nv['cy']
idx = -np.ones((GH, GW), int)
idx[WALK] = np.arange(WALK.sum())
rows, cols, cost = [], [], []
for dy, dx in ((0, 1), (1, 0), (1, 1), (1, -1)):
    L = math.hypot(dx, dy) * cy
    a = idx[:GH - dy, :][:, max(0, -dx):GW - max(0, dx)]
    b = idx[dy:, :][:, max(0, dx):GW + min(0, dx)]
    ha = H[:GH - dy, :][:, max(0, -dx):GW - max(0, dx)]
    hb = H[dy:, :][:, max(0, dx):GW + min(0, dx)]
    ok = (a >= 0) & (b >= 0) & (np.abs(ha - hb) <= 1.3 * L)
    rows += [a[ok], b[ok]]; cols += [b[ok], a[ok]]; cost += [np.full(ok.sum(), L)] * 2
G = csr_matrix((np.concatenate(cost), (np.concatenate(rows), np.concatenate(cols))), shape=(WALK.sum(),) * 2)
CELL = np.argwhere(WALK)  # 번호 → (줄, 칸)


def snap(p, r=10):
    c, rr = int(p[0] / 100 * GW), int(p[1] / 100 * GH)
    best = None
    for y in range(max(0, rr - r), min(GH, rr + r + 1)):
        for x in range(max(0, c - r), min(GW, c + r + 1)):
            if idx[y, x] >= 0:
                d2 = (x - c) ** 2 + (y - rr) ** 2
                if best is None or d2 < best[0]:
                    best = (d2, idx[y, x])
    return None if best is None else best[1]


def navpath(a, b):
    sa, sb = snap(a), snap(b)
    if sa is None or sb is None:
        return None
    dist, pred = dijkstra(G, indices=sa, return_predecessors=True, limit=yd(a, b) * 3 + 60)
    if not np.isfinite(dist[sb]):
        return None
    out, k = [], sb
    while k != sa and k >= 0:
        y, x = CELL[k]; out.append(((x + .5) / GW * 100, (y + .5) / GH * 100)); k = pred[k]
    return out[::-1]


def rdp(P, eps):
    if len(P) < 3:
        return P
    a, b = np.array(P[0][1:]), np.array(P[-1][1:])
    ab = b - a; n = np.linalg.norm(ab)
    best, bi = -1, 0
    for i in range(1, len(P) - 1):
        p = np.array(P[i][1:])
        d = np.linalg.norm(p - a) if n == 0 else abs(ab[0] * (p - a)[1] - ab[1] * (p - a)[0]) / n
        dt = P[i][0] - (P[0][0] + (P[-1][0] - P[0][0]) * (np.dot(p - a, ab) / (n * n) if n else 0))
        d = max(d, abs(dt) * 0.05)  # 시간 차이도 조금 봄(멈춰 서 있던 구간 살림)
        if d > best:
            best, bi = d, i
    if best <= eps:
        return [P[0], P[-1]]
    return rdp(P[:bi + 1], eps)[:-1] + rdp(P[bi:], eps)


# ── 사람 자리 ──
players = [i for i in D['fight']['friendlyPlayers']]
order = sorted(players, key=lambda i: ({'tanks': 0, 'healers': 1}.get(D['roles'].get(str(i)), 2), i))
raw = {i: [] for i in players}
for e in D['events']:
    if 'x' not in e:
        continue
    aid = e.get('targetID') if e.get('resourceActor') == 2 else e.get('sourceID')
    if aid in raw:
        raw[aid].append(((e['timestamp'] - T0) / 1000.0, e['x'], e['y']))
tracks = []
for i in order:
    pts = sorted(raw[i])
    sec = {}
    for t, x, y in pts:  # 1초에 하나(그 초의 가운데 값)
        sec.setdefault(int(t), []).append(pct(x, y))
    S = [(t, float(np.median([p[0] for p in v])), float(np.median([p[1] for p in v]))) for t, v in sorted(sec.items())]
    F = []
    for k, p in enumerate(S):
        if F and yd(F[-1][1:], p[1:]) > 10 and p[0] - F[-1][0] > 1.5:
            path = navpath(F[-1][1:], p[1:])
            if path and len(path) > 2:
                seg = [F[-1][1:]] + path + [p[1:]]
                L = [0.0]
                for u, v in zip(seg, seg[1:]):
                    L.append(L[-1] + yd(u, v))
                t0 = F[-1][0]; t1 = p[0]
                spd = 7.0  # 달리기 7야드/초, 남는 시간은 도착 뒤 기다림
                for q, l in zip(seg[1:-1], L[1:-1]):
                    F.append((min(t1 - .5, t0 + l / spd), q[0], q[1]))
        F.append(p)
    F = rdp(F, 0.25)
    flat = []
    for t, x, y in F:
        flat += [round(t, 1), round(x, 1), round(y, 1)]
    a = A.get(i, {})
    tracks.append({'c': a.get('cls'), 'r': {'tanks': 'T', 'healers': 'H'}.get(D['roles'].get(str(i)), 'D'), 'p': flat})

# ── 몹 → 지도 무리 ──
PK = FL['mob']['p']
pk_pts = []  # (무리 번호, 이름, x, y)
for pi, p in enumerate(PK):
    for x, y, ki in p[9]:
        pk_pts.append((pi, p[7][ki][0], x, y))
first, death = {}, {}
for e in D['events']:
    if e.get('type') == 'death' and A.get(e.get('targetID'), {}).get('type') == 'NPC':
        death.setdefault((e['targetID'], e.get('targetInstance', 1)), (e['timestamp'] - T0) / 1000.0)
    if 'x' not in e:
        continue
    if e.get('resourceActor') == 2:
        k = (e.get('targetID'), e.get('targetInstance', 1))
    else:
        k = (e.get('sourceID'), e.get('sourceInstance', 1))
    if A.get(k[0], {}).get('type') == 'NPC' and k not in first:
        first[k] = ((e['timestamp'] - T0) / 1000.0, pct(e['x'], e['y']))


def ko(aid):
    n = A.get(aid, {}).get('name') or ''
    return ENKO.get(n.lower(), n)


# 몹 → 지도 무리 칸(몹 하나하나 자리):
#  1) 시간 순서대로 가장 가까운 같은 이름 칸(45야드 안) — 가까운 짝을 먼저 확정
#  2) 남은 몹·칸만 이름별 거리 합 최소 짝짓기(80야드 안). 예전엔 처음부터 2)만 해서 22야드 칸을 두고 76야드 칸에 붙기도 했음
from scipy.optimize import linear_sum_assignment
inst_pack, taken = {}, set()
slots_by = {}
for si, (pi, nm, x, y) in enumerate(pk_pts):
    slots_by.setdefault(nm, []).append(si)
for k, (t, p) in sorted(first.items(), key=lambda kv: kv[1][0]):
    cand = sorted((yd(p, pk_pts[si][2:]), si) for si in slots_by.get(ko(k[0]), []) if si not in taken)
    if cand and cand[0][0] <= 45:
        taken.add(cand[0][1]); inst_pack[k] = pk_pts[cand[0][1]][0]
left = {}
for k in first:
    if k not in inst_pack:
        left.setdefault(ko(k[0]), []).append(k)
for n, ks in left.items():
    sl = [si for si in slots_by.get(n, []) if si not in taken]
    if not sl:
        continue
    C = np.array([[yd(first[k][1], pk_pts[si][2:]) for si in sl] for k in ks])
    r, c = linear_sum_assignment(np.where(C > 80, 1e6, C))
    for i, j in zip(r, c):
        if C[i, j] <= 80:
            taken.add(sl[j]); inst_pack[ks[i]] = pk_pts[sl[j]][0]

# 풀: 기록의 dungeonPulls(시작·끝·가운데). 몹은 처음 싸운 시각이 든 풀에 넣음
# (기록 풀의 몹 목록은 몹 번호 「몇 번~몇 번」 범위라 사이에 낀 다른 풀 몹까지 들어가 — 바다마녀 22마리 풀처럼 — 풀 묶음이 지도 반대편까지 퍼졌음)
DP = D['fight']['dungeonPulls'] or []
PW = [((pl['startTime'] - T0) / 1000.0, (pl['endTime'] - T0) / 1000.0) for pl in DP]
def pull_of(t):
    for j, (t0, t1) in enumerate(PW):
        if t0 - 3 <= t <= t1 + 1:
            return j + 1
    return min(range(len(PW)), key=lambda j: min(abs(t - PW[j][0]), abs(t - PW[j][1]))) + 1 if PW else 0
inst_pull = {k: pull_of(t) for k, (t, p) in first.items()}
pulls = []
for n, pl in enumerate(DP, 1):
    t0, t1 = PW[n - 1]
    ks = [k for k, j in inst_pull.items() if j == n]
    mobs, packs, boss = {}, set(), None
    for k in ks:
        nm = ko(k[0])
        mobs[nm] = mobs.get(nm, 0) + 1
        if k in inst_pack:
            packs.add(inst_pack[k])
        if A.get(k[0], {}).get('sub') == 'Boss':
            boss = nm
    x, y = pct(pl['x'], pl['y'])
    fp = [first[k][1] for k in ks]
    sp = max([yd(u, v) for i, u in enumerate(fp) for v in fp[i + 1:]] or [0])  # 몹이 처음 붙은 자리끼리 가장 먼 거리
    pulls.append({'sp': round(sp), 'n': n, 't': [round(t0, 1), round(t1, 1)], 'x': round(x, 1), 'y': round(y, 1),
                  'k': sorted(packs), 'm': sorted(([a, b] for a, b in mobs.items()), key=lambda v: -v[1]), 'b': boss})

# 무리가 다 죽은 때
pdead = {}
for k, pi in inst_pack.items():
    if k in death:
        pdead[pi] = max(pdead.get(pi, 0), death[k])
deaths = []
for e in D['events']:
    if e.get('type') == 'death' and e.get('targetID') in order:
        deaths.append([round((e['timestamp'] - T0) / 1000.0, 1), order.index(e['targetID'])])

# ── 몹 하나하나: 처음 맞은 때부터 죽을 때까지 자리(재생 중 빨간 점) ──
erw = {}
for e in D['events']:
    if 'x' not in e:
        continue
    k = (e.get('targetID'), e.get('targetInstance', 1)) if e.get('resourceActor') == 2 else (e.get('sourceID'), e.get('sourceInstance', 1))
    if A.get(k[0], {}).get('type') == 'NPC':
        erw.setdefault(k, []).append(((e['timestamp'] - T0) / 1000.0, e['x'], e['y']))
# ── 피(%) 시계열: 자리 사건의 hitPoints/maxHitPoints. 1초에 하나, 3% 넘게 바뀌거나 15초 지나면 남김 ──
hpraw = {}
for e in D['events']:
    if 'x' not in e or not e.get('maxHitPoints'):
        continue
    k = (e.get('targetID'), e.get('targetInstance', 1)) if e.get('resourceActor') == 2 else (e.get('sourceID'), e.get('sourceInstance', 1))
    hpraw.setdefault(k, []).append(((e['timestamp'] - T0) / 1000.0, 100.0 * e['hitPoints'] / e['maxHitPoints']))
def hpser(k, td=None):
    sec = {}
    for t, h in sorted(hpraw.get(k, [])):
        sec.setdefault(int(t), []).append(h)
    out, last = [], None
    for t, v in sorted(sec.items()):
        h = int(round(float(np.median(v))))
        if last is None or abs(h - last[1]) >= 3 or t - last[0] >= 15:
            out += [t, h]; last = (t, h)
    if td is not None:
        out += [round(td, 1), 0]
    return out

rank_by = {}
for p in PK:
    for nm in p[7]:
        if nm[2] is not None:
            rank_by[nm[0]] = max(rank_by.get(nm[0], 0), nm[2])
MN, mobs = [], []
for k, pts in sorted(erw.items(), key=lambda kv: min(p[0] for p in kv[1])):
    n = ko(k[0])
    if n not in MN:
        MN.append(n)
    sec = {}
    for t, x, y in sorted(pts):
        sec.setdefault(int(t), []).append(pct(x, y))
    S = [(t, float(np.median([p[0] for p in v])), float(np.median([p[1] for p in v]))) for t, v in sorted(sec.items())]
    td = death.get(k)
    if td is not None:
        S = [q for q in S if q[0] <= td + 1] or S[:1]
    # 기록에 15초 넘게 안 나온 구간은 숨김(예: 겔리하스트가 79초에 한 번 보이고 1400초에 잡힘 — 그 사이를 싸우는 몹으로 그리면 틀림)
    gaps = [[round(a[0] + 3, 1), round(b[0] - 3, 1)] for a, b in zip(S, S[1:]) if b[0] - a[0] > 15]
    S = rdp(S, 0.35)
    rk = 2 if A[k[0]].get('sub') == 'Boss' else (1 if rank_by.get(n, 0) >= 1 and rank_by.get(n) != 4 else 0)
    flat = []
    for t, x, y in S:
        flat += [round(t, 1), round(x, 1), round(y, 1)]
    # [이름 번호, 0 일반·1 정예·2 보스, 풀 번호, 죽은 때(-1 = 안 죽음), 지도 무리 번호(-1 = 없음), [t,x,y,…], (숨길 구간 [[a,b],…])]
    # [이름 번호, 0 일반·1 정예·2 보스, 풀, 죽은 때(-1 = 안 죽음), 지도 무리(-1 = 없음), 자리 [t,x,y…], 숨길 구간 [[a,b]…], 피 [t,%…]]
    mobs.append([MN.index(n), rk, inst_pull.get(k, 0), round(td, 1) if td is not None else -1, inst_pack.get(k, -1), flat, gaps, hpser(k, td)])

# ── 지도 풀(와우보초처럼): 이 판에서 잡힌 무리만, 같은 싸움·바로 이어진 싸움에서 35야드 안 무리끼리 한 풀, 잡은 순서로 번호 ──
# 기록 풀(61개)은 싸움이 끊긴 단위라 몹 1마리짜리가 많고, 걸으며 이어 잡은 넓은 싸움은 한 풀로 뭉쳐 있어 지도 번호로 쓰기 어려웠음
pk_c = {}
for pi, p in enumerate(PK):
    q = p[9] if p[9] else [[p[0], p[1], 0]]
    pk_c[pi] = (sum(v[0] for v in q) / len(q), sum(v[1] for v in q) / len(q))
pk_inst = {}
for k, pi in inst_pack.items():
    pk_inst.setdefault(pi, []).append(k)
kp = []
for pi, ks in pk_inst.items():
    dk = [death[k] for k in ks if k in death]
    if not dk:
        continue
    te = min(first[k][0] for k in ks)
    kp.append({'pi': pi, 'te': te, 'td': max(dk), 'wp': inst_pull.get(min(ks, key=lambda k: first[k][0]), 0), 'c': pk_c[pi], 'ks': ks})
kp.sort(key=lambda r: r['te'])
# 자리로 묶음(와우보초 「지도 풀」처럼): 무리 가운데끼리 30야드 안이면 이어 붙이되, 한 풀이 60야드 넘게 퍼지면 안 붙임(검은심연 22야드 57풀 · 30야드 42풀 · 35야드 35풀). 번호는 처음 잡은 순서
groups = []
for r in kp:
    best = None
    for g in groups:
        dmin = min(yd(r['c'], x['c']) for x in g)
        spread = max([yd(r['c'], x['c']) for x in g])
        if dmin <= 30 and spread <= 60 and (best is None or dmin < best[0]):
            best = (dmin, g)
    if best:
        best[1].append(r)
    else:
        groups.append([r])
groups.sort(key=lambda g: min(x['te'] for x in g))
MP = []
for g in groups:
    cnt = {}
    for r in g:
        for k in r['ks']:
            n = ko(k[0]); cnt[n] = cnt.get(n, 0) + 1
    cx = sum(r['c'][0] for r in g) / len(g); cy = sum(r['c'][1] for r in g) / len(g)
    MP.append({'k': sorted(r['pi'] for r in g), 't': [round(min(r['te'] for r in g), 1), round(max(r['td'] for r in g), 1)],
               'x': round(cx, 1), 'y': round(cy, 1), 'm': sorted(([a, b] for a, b in cnt.items()), key=lambda v: -v[1])})
# 보스 잡은 때(재생 시간 막대 눈금)
BK = sorted([[round(death[k], 1), ko(k[0])] for k in first if A.get(k[0], {}).get('sub') == 'Boss' and k in death])
# 지도 길: 탱이 실제로 걸은 길을 공간으로만 다듬음(흰 점선 하나)
def rdp2(P, eps):
    if len(P) < 3:
        return P
    a, b = np.array(P[0]), np.array(P[-1]); ab = b - a; n = np.linalg.norm(ab)
    ds = [np.linalg.norm(np.array(q) - a) if n == 0 else abs(ab[0] * (q[1] - a[1]) - ab[1] * (q[0] - a[0])) / n for q in P[1:-1]]
    i = int(np.argmax(ds)) + 1
    if ds[i - 1] <= eps:
        return [P[0], P[-1]]
    return rdp2(P[:i + 1], eps)[:-1] + rdp2(P[i:], eps)
# 싸우는 동안(기록 풀 시작~끝) 움직임은 그 싸움의 가운데 한 점으로 줄임 — 그대로 두면 방 안에서 지그재그가 됨
_tk = tracks[0]['p'] if tracks else []
_pts, _cur = [], None
for i in range(0, len(_tk), 3):
    t, x, y = _tk[i], _tk[i + 1], _tk[i + 2]
    w = next((j for j, (a, b) in enumerate(PW) if a <= t <= b), None)
    if w is None:
        if _cur is not None:
            xs = [q[0] for q in _cur[1]]; ys = [q[1] for q in _cur[1]]
            _pts.append((float(np.median(xs)), float(np.median(ys)))); _cur = None
        _pts.append((x, y))
    else:
        if _cur is None or _cur[0] != w:
            if _cur is not None:
                xs = [q[0] for q in _cur[1]]; ys = [q[1] for q in _cur[1]]
                _pts.append((float(np.median(xs)), float(np.median(ys))))
            _cur = (w, [])
        _cur[1].append((x, y))
if _cur is not None:
    _pts.append((float(np.median([q[0] for q in _cur[1]])), float(np.median([q[1] for q in _cur[1]]))))
RT = rdp2(_pts, 0.6)
RTF = []
for x, y in RT:
    RTF += [round(x, 1), round(y, 1)]
# 몹 이름 → 게임 번호(얼굴 그림)
MG = []
for n in MN:
    gid = next((A[k[0]].get('gameID') for k in first if ko(k[0]) == n), 0)
    MG.append(gid or 0)

# ── 파티 피·미터: 펫 딜·치유는 주인 몫. 딜량 = 몹에게 준 amount + absorbed, 치유량 = heal amount(넘친 치유 빼고) ──
owner = {a['id']: a.get('owner') for a in D['actors'] if a['type'] == 'Pet'}
who = lambda i: i if i in order else owner.get(i) if owner.get(i) in order else None
STEP = 5
NB = DUR // STEP + 2
dmg = [[0] * NB for _ in order]; heal = [[0] * NB for _ in order]
for e in D['events']:
    ty = e.get('type'); w = who(e.get('sourceID'))
    if w is None or ty not in ('damage', 'heal'):
        continue
    b = max(0, min(NB - 1, int(((e['timestamp'] - T0) / 1000.0) // STEP) + 1))
    if ty == 'damage' and A.get(e.get('targetID'), {}).get('type') == 'NPC':
        dmg[order.index(w)][b] += (e.get('amount') or 0) + (e.get('absorbed') or 0)
    elif ty == 'heal':
        heal[order.index(w)][b] += e.get('amount') or 0
for L in dmg + heal:
    for i in range(1, NB):
        L[i] += L[i - 1]
PH = [hpser((i, 1)) for i in order]
# 역할 다시: 워크래프트로그가 딜러로 적어도 파티 치유의 절반 넘게 하고 자기 딜량의 절반 넘게 치유했으면 힐러(검은심연 사제 = 치유 80%)
_ht = sum(L[-1] for L in heal) or 1
for j, t in enumerate(tracks):
    if t['r'] != 'T' and heal[j][-1] >= .5 * _ht and heal[j][-1] >= .5 * dmg[j][-1]:
        t['r'] = 'H'

out = {'fl': FI, 'dur': DUR, 'kill': bool(D['fight'].get('kill')), 'src': 'wcl',
       'party': [{'c': t['c'], 'r': t['r']} for t in tracks], 'tr': [t['p'] for t in tracks],
       'pulls': pulls, 'mp': MP, 'bk': BK, 'rt': RTF, 'mn': MN, 'mg': MG, 'mb': mobs, 'ph': PH, 'ms': STEP, 'md': dmg, 'mh': heal, 'dead': {str(k): round(v, 1) for k, v in sorted(pdead.items())}, 'pd': deaths}
OUT = os.path.join(ROOT, 'data/guides/dungeon-replays.json')
allr = json.load(open(OUT, encoding='utf-8')) if os.path.exists(OUT) else {}
allr[slug] = out
json.dump(allr, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
mi = len(first); mm = len(inst_pack)
print('사람', len(tracks), '점', [len(t['p']) // 3 for t in tracks], '· 풀', len(pulls), '· 몹', mi, '중 무리에 붙음', mm,
      '· 무리 다 잡힘', len(pdead), '/', len(PK), '· 파일', os.path.getsize(OUT), '바이트')
