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


# 이름별로 몹(처음 맞은 자리) ↔ 무리 칸(지도 몹 점)을 거리 합이 가장 작게 짝지음(110야드 넘으면 안 붙임)
from scipy.optimize import linear_sum_assignment
inst_pack = {}
byname = {}
for k in first:
    byname.setdefault(ko(k[0]), []).append(k)
for n, ks in byname.items():
    slots = [(pi, x, y) for pi, nm, x, y in pk_pts if nm == n]
    if not slots:
        continue
    C = np.array([[yd(first[k][1], (x, y)) for pi, x, y in slots] for k in ks])
    Cc = np.where(C > 110, 1e6, C)
    r, c = linear_sum_assignment(Cc)
    for i, j in zip(r, c):
        if C[i, j] <= 110:
            inst_pack[ks[i]] = slots[j][0]

pins = {p['t'].rstrip('!'): p for p in FL['pins']}
pulls = []
for n, pl in enumerate(D['fight']['dungeonPulls'] or [], 1):
    t0, t1 = (pl['startTime'] - T0) / 1000.0, (pl['endTime'] - T0) / 1000.0
    mobs, packs, boss = {}, set(), None
    for en in pl['enemyNPCs']:
        nm = ko(en['id'])
        for ins in range(en['minimumInstanceID'], en['maximumInstanceID'] + 1):
            k = (en['id'], ins)
            mobs[nm] = mobs.get(nm, 0) + 1
            if k in inst_pack:
                packs.add(inst_pack[k])
        if A.get(en['id'], {}).get('sub') == 'Boss':
            boss = nm
    x, y = pct(pl['x'], pl['y'])
    pulls.append({'n': n, 't': [round(t0, 1), round(t1, 1)], 'x': round(x, 1), 'y': round(y, 1),
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

out = {'fl': FI, 'dur': DUR, 'kill': bool(D['fight'].get('kill')), 'src': 'wcl',
       'party': [{'c': t['c'], 'r': t['r']} for t in tracks], 'tr': [t['p'] for t in tracks],
       'pulls': pulls, 'dead': {str(k): round(v, 1) for k, v in sorted(pdead.items())}, 'pd': deaths}
OUT = os.path.join(ROOT, 'data/guides/dungeon-replays.json')
allr = json.load(open(OUT, encoding='utf-8')) if os.path.exists(OUT) else {}
allr[slug] = out
json.dump(allr, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
mi = len(first); mm = len(inst_pack)
print('사람', len(tracks), '점', [len(t['p']) // 3 for t in tracks], '· 풀', len(pulls), '· 몹', mi, '중 무리에 붙음', mm,
      '· 무리 다 잡힘', len(pdead), '/', len(PK), '· 파일', os.path.getsize(OUT), '바이트')
