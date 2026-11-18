"""층마다 걸어가는 길(입구 → 보스 순서)을 높이 그림으로 찾고, 길목 무리에 풀 번호(추정)를 붙인다.

사용: python3 nav.py <slug> [...]   (make.py 다음에)
- 높이 그림 /tmp/dg_<slug>_<층>_h.png · 곁 파일 .json(b, z, ppy) 필요
- final/<slug>.json 층마다 route=[[x%,y%]...] 묶음 목록, 무리 p[i][10]=풀 번호(0 = 길에서 먼 무리)
"""
import json, sys, heapq, math
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

STEP = 1.3      # 이웃 칸 사이 높이 차(야드)가 이보다 크면 못 감(벽·절벽)
AGGRO = 9.0    # 길에서 이 거리(야드) 안 무리는 길목 무리
PATAG = 8.0     # 순찰 길이 길에서 이 거리 안이면 길목
PULLGAP = 38.0  # 한 풀로 묶는 길 길이(야드)
PULLMAX = 13     # 한 풀 최대 몹 수(넘으면 나눔)


def load_h(path, zr):
    a = np.asarray(Image.open(path).convert('RGBA')).astype(np.float64)
    m = a[..., 3] > 250
    t = (a[..., 0] * 65536 + a[..., 1] * 256 + a[..., 2]) / 16777215.0
    return zr[0] + t * (zr[1] - zr[0]), m


def grid(H, M, c):
    """c 픽셀 = 1칸. 칸 높이 = 칸 안 높이의 중앙값, 절반 넘게 차야 걸을 수 있음."""
    h, w = M.shape
    hc, wc = h // c, w // c
    Hs = np.where(M, H, np.nan)[:hc * c, :wc * c].reshape(hc, c, wc, c).transpose(0, 2, 1, 3).reshape(hc, wc, c * c)
    fill = np.isfinite(Hs).mean(axis=2)
    import warnings
    with warnings.catch_warnings(), np.errstate(all='ignore'):
        warnings.simplefilter('ignore')
        G = np.nanmedian(Hs, axis=2)
    W = (fill >= .5) & np.isfinite(G)
    return G, W


def build(G, W, wall, pen):
    """모든 칸을 잇는 그래프. 걸을 수 있는 칸끼리(높이 차 STEP 안) 보통 비용, 빈 칸(틈) 건너기 GAP배, 벽·큰 턱 WALL배."""
    from scipy.sparse import coo_matrix
    hc, wc = W.shape; N = hc * wc
    idx = np.arange(N).reshape(hc, wc)
    R = []; C = []; V = []
    for dy, dx, L in ((0, 1, 1.0), (1, 0, 1.0), (1, 1, 1.414), (1, -1, 1.414)):
        ys = slice(0, hc - dy); ye = slice(dy, hc)
        xs = slice(max(0, -dx), wc - max(0, dx)); xe = slice(max(0, dx), wc - max(0, -dx) if dx < 0 else wc)
        if dx < 0: xs, xe = slice(1, wc), slice(0, wc - 1)
        a = idx[ys, xs].ravel(); b = idx[ye, xe].ravel()
        wa = W[ys, xs].ravel(); wb = W[ye, xe].ravel()
        dz = np.abs(G[ys, xs] - G[ye, xe]).ravel()
        la = wall[ys, xs].ravel() | wall[ye, xe].ravel()
        pb = pen[ye, xe].ravel(); pa = pen[ys, xs].ravel()
        ok = wa & wb & ~la & (np.nan_to_num(dz, nan=99) <= STEP * L)
        cost = np.where(ok, L * (1 + (pa + pb) / 2), np.where(la | (wa & wb), L * 120, L * 45))
        R.append(a); C.append(b); V.append(cost)
    R = np.concatenate(R); C = np.concatenate(C); V = np.concatenate(V)
    return coo_matrix((np.concatenate([V, V]), (np.concatenate([R, C]), np.concatenate([C, R]))), shape=(N, N)).tocsr()


def route(g, wc, a, b):
    from scipy.sparse.csgraph import dijkstra as dj
    ia = a[0] * wc + a[1]; ib = b[0] * wc + b[1]
    d, pr = dj(g, indices=ia, return_predecessors=True)
    if not np.isfinite(d[ib]): return None, None
    p = [ib]
    while p[-1] != ia: p.append(pr[p[-1]])
    return [(int(i // wc), int(i % wc)) for i in p[::-1]], d[ib]


def dijkstra(G, W, pen, a, b):
    hc, wc = W.shape
    INF = 1e18
    dist = np.full(W.shape, INF); prev = -np.ones(W.shape, dtype=np.int64)
    dist[a] = 0; pq = [(0.0, a[0], a[1])]
    NB = [(-1, 0, 1), (1, 0, 1), (0, -1, 1), (0, 1, 1), (-1, -1, 1.414), (-1, 1, 1.414), (1, -1, 1.414), (1, 1, 1.414)]
    while pq:
        d, y, x = heapq.heappop(pq)
        if d > dist[y, x]: continue
        if (y, x) == b: break
        for dy, dx, L in NB:
            ny, nx = y + dy, x + dx
            if ny < 0 or nx < 0 or ny >= hc or nx >= wc or not W[ny, nx]: continue
            if abs(G[ny, nx] - G[y, x]) > STEP * L: continue
            nd = d + L * (1 + pen[ny, nx])
            if nd < dist[ny, nx]:
                dist[ny, nx] = nd; prev[ny, nx] = y * wc + x; heapq.heappush(pq, (nd, ny, nx))
    if dist[b] >= INF: return None
    path = [b]; cur = b
    while cur != a:
        p = prev[cur]; cur = (int(p // wc), int(p % wc)); path.append(cur)
    return path[::-1]


def snap(W, G, y, x, r=8):
    hc, wc = W.shape
    best = None
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            ny, nx = y + dy, x + dx
            if 0 <= ny < hc and 0 <= nx < wc and W[ny, nx]:
                d = dy * dy + dx * dx
                if best is None or d < best[0]: best = (d, (ny, nx))
    return best and best[1]


def rdp(P, eps):
    if len(P) < 3: return P
    a, b = np.array(P[0]), np.array(P[-1]); ab = b - a; n = np.hypot(*ab) or 1e-9
    d = [abs(ab[0] * (p[1] - a[1]) - ab[1] * (p[0] - a[0])) / n for p in P[1:-1]]
    i = int(np.argmax(d)) + 1
    if d[i - 1] > eps: return rdp(P[:i + 1], eps)[:-1] + rdp(P[i:], eps)
    return [P[0], P[-1]]


def seg_dist(p, a, b):
    ab = (b[0] - a[0], b[1] - a[1]); L2 = ab[0] ** 2 + ab[1] ** 2
    t = 0 if L2 == 0 else max(0, min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / L2))
    q = (a[0] + t * ab[0], a[1] + t * ab[1])
    return math.hypot(p[0] - q[0], p[1] - q[1]), t


def order_pins(pins):
    ent = [p for p in pins if p['t'] == '입구']
    num = sorted([p for p in pins if p['t'].rstrip('!').isdigit()], key=lambda p: int(p['t'].rstrip('!')))
    return ent[:1] + num


def run(slug):
    fj = '/home/claude/dgmap/final/%s.json' % slug
    D = json.load(open(fj))
    pull = 0; report = []
    for li, f in enumerate(D['floors']):
        raw = '/tmp/dg_%s_%d' % (slug, li)
        try:
            meta = json.load(open(raw + '.json'))
        except FileNotFoundError:
            report.append((li + 1, '곁 파일 없음')); continue
        H, M = load_h(raw + '_h.png', meta['z'])
        hr, wr = M.shape
        ppy = meta['ppy']; c = max(1, int(round(ppy)))
        G, W = grid(H, M, c)
        # 벽: 위에서 보이는 면이 가파른(법선 z < .45) 픽셀이 칸의 30% 넘음
        try:
            Nz = np.asarray(Image.open(raw + '_n.png').convert('RGBA')).astype(float)
            steep = (Nz[..., 3] > 250) & (Nz[..., 0] / 255 < .45)
            hc_, wc_ = W.shape
            wall = steep[:hc_ * c, :wc_ * c].reshape(hc_, c, wc_, c).mean(axis=(1, 3)) > .3
        except FileNotFoundError:
            wall = np.zeros(W.shape, bool)
        Wk = W & ~wall
        dt = ndi.distance_transform_edt(Wk)
        pen = np.clip(3.0 - dt, 0, 3) * .9
        gr = build(G, W, wall, pen)
        # 그림 % → 칸, 야드 환산(가로 1% = sc/100 야드)
        sx = f['sc'] / 100.0; sy = f['sc'] * (f['h'] / f['w']) / 100.0
        cell = lambda p: (min(W.shape[0] - 1, int(p[1] / 100 * hr / c)), min(W.shape[1] - 1, int(p[0] / 100 * wr / c)))
        pc = lambda q: [round((q[1] + .5) * c / wr * 100, 2), round((q[0] + .5) * c / hr * 100, 2)]
        # 바닥에서 너무 먼 핀(대략 자리 등)은 길에서 뺌
        stops = [(p, snap(Wk, G, *cell((p['x'], p['y'])))) for p in order_pins(f['pins'])]
        # 대략 자리(w=2) 핀이 바닥 밖 빈 곳이면 틀린 자리 → 지도에서 뺌
        drop = [p for p, q in stops if not q and p.get('w') == 2]
        if drop:
            f['pins'] = [p for p in f['pins'] if p not in drop]
            report.append((li + 1, '바닥 밖 대략 핀 뺌', [p['t'] for p in drop]))
        stops = [x for x in stops if x[1]]
        routes = []; ok = 0; bad = 0
        for (a, ca), (b, cb) in zip(stops, stops[1:]):
            path, cost = route(gr, W.shape[1], ca, cb) if ca and cb else (None, None)
            if path is not None:
                n = len(path)
                # 길 대부분이 틈·벽 건너기면 믿기 어려움 → 직선으로
                if cost > 45 * n * .5: path = None
            if path is None:
                routes.append([[a['x'], a['y']], [b['x'], b['y']]]); bad += 1; continue
            P = [pc(q) for q in path]
            P = [[a['x'], a['y']]] + P + [[b['x'], b['y']]]
            routes.append(rdp(P, .35)); ok += 1
        # 하나로 이은 길(풀 순서 재기용)
        full = [q for r in routes for q in r]
        cum = [0.0]
        for i in range(1, len(full)):
            cum.append(cum[-1] + math.hypot((full[i][0] - full[i - 1][0]) * sx, (full[i][1] - full[i - 1][1]) * sy))
        on = []
        for i, m in enumerate(f['mob']['p']):
            pts = [(q[0], q[1]) for q in (m[9] if len(m) > 9 and m[9] else [(m[0], m[1])])]
            pat = next((t[1] for t in f['mob']['t'] if t[0] == i), None)
            best = (1e9, 0)
            for P, thr in ((pts, AGGRO), (pat or [], PATAG)):
                for p in P:
                    for j in range(len(full) - 1):
                        d, t = seg_dist((p[0] * sx, p[1] * sy), (full[j][0] * sx, full[j][1] * sy), (full[j + 1][0] * sx, full[j + 1][1] * sy))
                        if d <= thr and d < best[0]:
                            best = (d, cum[j] + t * (cum[j + 1] - cum[j]))
            if best[0] < 1e9: on.append((best[1], i))
        # 길 순서대로 무리를 풀로 묶음: 첫 무리에서 길로 PULLGAP 야드 넘거나 몹이 PULLMAX 넘으면 새 풀
        nums = {}; start = None; cnt = 0
        for pos, i in sorted(on):
            n = f['mob']['p'][i][2]
            if start is None or pos - start > PULLGAP or cnt + n > PULLMAX:
                pull += 1; start = pos; cnt = 0
            nums[i] = pull; cnt += n
        for i, m in enumerate(f['mob']['p']):
            while len(m) < 10: m.append([])
            if len(m) == 10: m.append(0)
            m[10] = nums.get(i, 0)
        # 무리마다 길 위 위치(야드)와 길에서 거리 → 탱 풀 짜기에서 순서·옆길 판단
        def proj(p):
            best = (1e9, 0)
            for j in range(len(full) - 1):
                d, t = seg_dist((p[0] * sx, p[1] * sy), (full[j][0] * sx, full[j][1] * sy), (full[j + 1][0] * sx, full[j + 1][1] * sy))
                if d < best[0]: best = (d, cum[j] + t * (cum[j + 1] - cum[j]))
            return best
        for i, m in enumerate(f['mob']['p']):
            pts = [(q[0], q[1]) for q in (m[9] if m[9] else [(m[0], m[1])])]
            bb = min((proj(p) for p in pts), default=(1e9, 0)) if len(full) > 1 else (1e9, 0)
            while len(m) < 13: m.append(0)
            m[11] = round(bb[1], 1) if bb[0] < 1e9 else -1
            m[12] = round(bb[0], 1) if bb[0] < 1e9 else -1
        f['rpos'] = {p['t']: round(proj((p['x'], p['y']))[1], 1) for p in f['pins'] if len(full) > 1}
        # 길찾기 칸 그림(브라우저에서 탱 동선 계산): R 높이 · G 벽 가까움 · A 255 걸음/128 벽/0 빈 곳
        hc, wc = W.shape
        Wk2 = W & ~wall
        zs = G[Wk2] if Wk2.any() else np.array([0.0, 1.0])
        z0n, z1n = float(np.nanmin(zs)), float(np.nanmax(zs)); dzq = max((z1n - z0n) / 255.0, 1e-3)
        img = np.zeros((hc, wc, 4), np.uint8)
        img[..., 0] = np.clip(np.round((np.nan_to_num(G, nan=z0n) - z0n) / dzq), 0, 255)
        img[..., 1] = np.clip(np.round(pen * 80), 0, 255)
        img[..., 3] = np.where(Wk2, 255, np.where(wall, 128, 0))
        nn = f['img'].split('/')[-1].replace('.webp', '-nav.png')
        Image.fromarray(img, 'RGBA').save('/home/claude/dgmap/final/' + nn, optimize=True)
        f['nav'] = {'img': 'data/dgmap/' + nn, 'gw': wc, 'gh': hc, 'z0': round(z0n, 2), 'dz': round(dzq, 4),
                    'kx': round(c / wr * 100, 5), 'ky': round(c / hr * 100, 5), 'cy': round(c / ppy, 3)}
        f['route'] = routes
        report.append((li + 1, '길 %d/%d' % (ok, ok + bad), '길목 무리 %d/%d' % (len(nums), len(f['mob']['p'])), '풀 %d' % len(set(nums.values()))))
    json.dump(D, open(fj, 'w'), ensure_ascii=False)
    print(slug, report)


if __name__ == '__main__':
    for s in sys.argv[1:]: run(s)
