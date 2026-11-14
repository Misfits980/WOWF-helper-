"""지역마다 「걷기 비용 격자」를 만든다 → data/route/<지역번호>.png (흑백, 지도 3px = 1칸)

앱이 퀘스트 동선을 길 따라 그릴 때(A*) 이 격자를 쓴다. 칸 값(1~255)이 클수록 지나가기 어려움.
  1   지도에 그려진 길·순찰 몹이 다니는 길
  5   몹·NPC·채집물이 있는 땅(= 걸어 다닐 수 있는 땅)
  ~115 몹이 없는 평지(갈 수는 있지만 피함)
  150 물(헤엄·배)
  255 몹도 없는 산·지역 밖(사실상 못 감)

판단 근거
  · 걸을 수 있는 땅: QuestieDB 포에버의 몹·NPC·물건 자리 전부와 순찰 경로(GPL-3.0 자료에서 위치만 사용)
  · 길·산·물 무늬: 와우헤드 지역 지도 그림(wow.zamimg.com classic kokr original/<지역번호>.jpg)을 읽어 계산만 함.
    그림 자체는 저장소에 넣지 않는다.

쓰는 법
  python3 tools/route/build_grid.py <지도 그림 폴더> <QuestieDB 폴더> [지역번호 ...]
  지도 그림 폴더에 <지역번호>.jpg 가 있어야 함(1024×683). 지역 번호를 안 주면 app.js ZID의 모든 지역 중 그림이 있는 것.
"""
import json, math, os, re, sys, time
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd
from scipy.ndimage import gaussian_filter
from scipy.spatial import cKDTree

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'qdb'))
from luadata import tokenize, Parser  # noqa: E402

SC = 3  # 지도 3px = 격자 1칸


def rd(p):
    return open(p, encoding='utf-8', errors='replace').read()


def parse_at(src, pos):
    return Parser(tokenize(src[pos:]), None).expr()


def data_table(path):
    s = rd(path); m = re.search(r'\[(=*)\[\s*return\s*', s); end = s.rfind(']' + m.group(1) + ']')
    return parse_at(s[:end], m.end())


def keys_of(path, name):
    s = rd(path); m = re.search(name + r'\s*=\s*\{', s); t = parse_at(s, m.end() - 1)
    return {k: v for k, v in t.items() if isinstance(k, str)}


def flat(v):
    if isinstance(v, dict):
        v = [v[k] for k in sorted(v)]
    return v


def pts(L):
    L = flat(L) or []
    for p in L:
        p = flat(p)
        if isinstance(p, list) and len(p) >= 2 and all(isinstance(c, (int, float)) for c in p[:2]):
            if p[0] >= 0 and p[1] >= 0:
                yield (round(p[0], 1), round(p[1], 1))
        elif isinstance(p, list):
            yield from pts(p)


def spawns(qdb, want):
    """지역 번호별 {npc:[(x,y)], obj:[(x,y)], wp:[[(x,y)…]]}"""
    Q = os.path.join(qdb, 'data', 'Forever')
    NK = keys_of(f'{Q}/foreverNpcDB.lua', r'QuestieDB\.npcKeys')
    OK = keys_of(f'{Q}/foreverObjectDB.lua', r'QuestieDB\.objectKeys')
    out = {z: {'npc': [], 'obj': [], 'wp': []} for z in want}
    for r in data_table(f'{Q}/foreverNpcDB.lua').values():
        if not isinstance(r, dict):
            continue
        sp = r.get(NK['spawns'])
        if isinstance(sp, dict):
            for z, L in sp.items():
                if z in out:
                    out[z]['npc'] += list(pts(L))
        wp = r.get(NK['waypoints'])
        if isinstance(wp, dict):
            for z, L in wp.items():
                if z not in out:
                    continue
                for line in flat(L) or []:
                    fl = flat(line)
                    P = list(pts([line])) if isinstance(fl, list) and fl and not isinstance(flat(fl[0]), list) else list(pts(line))
                    if len(P) >= 2:
                        out[z]['wp'].append(P)
    for r in data_table(f'{Q}/foreverObjectDB.lua').values():
        if not isinstance(r, dict):
            continue
        sp = r.get(OK['spawns'])
        if isinstance(sp, dict):
            for z, L in sp.items():
                if z in out:
                    out[z]['obj'] += list(pts(L))
    return out


def quest_points(names):
    """이 지역 퀘스트 받는 곳·반납·할 일 자리 [(x,y,반지름%)]"""
    P = []
    for l in open(os.path.join(ROOT, 'data', 'qdb', 'quests.jsonl'), encoding='utf-8'):
        q = json.loads(l)
        for k in ('g', 'r'):
            v = q.get(k)
            if v and v[1] in names and v[2]:
                x, y = map(float, v[2].split(','))
                P.append((x, y, 1.5))
        for t in q.get('t', []):
            if len(t) > 3 and t[3] and t[3][0] in names:
                for c in t[3][1:]:
                    P.append((c[0], c[1], c[2] if len(c) > 2 else 2))
    return P


def dotted1(a, RAD):
    """칼림도어 지도에 많은 점선 길: 작고 둥근 어두운 점이 줄지어 있는 곳"""
    L = a.mean(2)
    bt = nd.grey_closing(L, size=(7, 7)) - L
    m = bt > max(0.16, np.percentile(bt, 97))
    lab, n = nd.label(m)
    C = []
    for i, sl in enumerate(nd.find_objects(lab), 1):
        hh = sl[0].stop - sl[0].start; ww = sl[1].stop - sl[1].start; ar = (lab[sl] == i).sum()
        if 1 <= hh <= 6 and 1 <= ww <= 6 and 2 <= ar <= 26 and ar / (hh * ww) > 0.45:
            cy, cx = nd.center_of_mass(lab[sl] == i); C.append((sl[1].start + cx, sl[0].start + cy))
    if len(C) < 8:
        return []
    C = np.array(C); t = cKDTree(C)
    pairs = [(i, j) for i, j in t.query_pairs(RAD) if math.dist(C[i], C[j]) >= 2.5]
    deg = np.zeros(len(C), int)
    for i, j in pairs:
        deg[i] += 1; deg[j] += 1
    ok = (deg >= 1) & (deg <= 3)
    pairs = [(i, j) for i, j in pairs if ok[i] and ok[j]]
    par = list(range(len(C)))

    def f(x):
        while par[x] != x:
            par[x] = par[par[x]]; x = par[x]
        return x
    for i, j in pairs:
        par[f(i)] = f(j)
    G = {}
    for i in range(len(C)):
        if ok[i]:
            G.setdefault(f(i), []).append(i)
    keepg = {g for g, ids in G.items() if len(ids) >= 8 and max(np.ptp(C[ids][:, 0]), np.ptp(C[ids][:, 1])) >= 50}
    return [(C[i], C[j]) for i, j in pairs if f(i) in keepg]


def grid(img, sp, qp):
    im = img.convert('RGB'); W, H = im.size
    a = np.asarray(im).astype(np.float32) / 255; r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx = a.max(2); mn = a.min(2); V = mx; S_ = (mx - mn) / (mx + 1e-6); L = (mx + mn) / 2
    # 1) 이 지역 퀘스트 자리에서 흔한 색 → 땅 색
    Q = 16
    qi = (np.clip(a * Q, 0, Q - 1)).astype(np.int32)
    code = qi[..., 0] * Q * Q + qi[..., 1] * Q + qi[..., 2]
    hist = np.zeros(Q ** 3)
    for x, y, _ in qp:
        px, py = int(x / 100 * W), int(y / 100 * H)
        np.add.at(hist, code[max(0, py - 4):py + 5, max(0, px - 4):px + 5].ravel(), 1)
    allh = np.bincount(code.ravel(), minlength=Q ** 3).astype(float)
    like = ((hist / max(1, hist.sum())) / (allh / allh.sum() + 1e-9))[code]
    walk = nd.uniform_filter((like > 0.5).astype(np.float32), 15) > 0.42
    walk = nd.binary_opening(nd.binary_closing(walk, iterations=3), iterations=2)
    # 2) 길: 테두리 두 줄 사이 가는 길
    bt = nd.grey_closing(L, size=(5, 5)) - L
    D = bt > 0.085; C = ~D
    road = np.zeros_like(D)
    for k in (2, 3, 4):
        for dx, dy in ((k, 0), (0, k), (k, k), (k, -k)):
            road |= C & np.roll(np.roll(D, dy, 0), dx, 1) & np.roll(np.roll(D, -dy, 0), -dx, 1)
    road &= walk
    road = nd.binary_closing(road & ~nd.binary_opening(road, iterations=2), iterations=1)
    road &= (nd.uniform_filter(L, 3) - nd.uniform_filter(L, 9)) > -0.01
    lab, n = nd.label(road, structure=np.ones((3, 3))); keep = np.zeros(n + 1, bool)
    for i, sl in enumerate(nd.find_objects(lab), 1):
        hh = sl[0].stop - sl[0].start; ww = sl[1].stop - sl[1].start; area = (lab[sl] == i).sum()
        keep[i] = max(hh, ww) >= 60 and area / (hh * ww) < 0.18 and area / max(hh, ww) < 6
    road = nd.binary_dilation(keep[lab], iterations=1)
    # 풀밭 지역의 흙색 길
    d_ = mx - mn + 1e-6
    hue = np.where(mx == r, ((g - b) / d_) % 6, np.where(mx == g, (b - r) / d_ + 2, (r - g) / d_ + 4)) * 60
    green = (hue >= 52) & (hue <= 120) & (S_ > 0.3) & (V > 0.3)
    tan = (hue >= 22) & (hue < 52) & (V > 0.66) & (S_ > 0.28) & (S_ < 0.85)
    r2 = tan & (nd.uniform_filter(green.astype(np.float32), 31) > 0.25) & walk
    r2 = nd.binary_closing(r2 & ~nd.binary_opening(r2, iterations=5), iterations=2)
    lab, n = nd.label(r2); keep = np.zeros(n + 1, bool)
    for i, sl in enumerate(nd.find_objects(lab), 1):
        hh = sl[0].stop - sl[0].start; ww = sl[1].stop - sl[1].start; area = (lab[sl] == i).sum()
        keep[i] = max(hh, ww) >= 45 and area / (hh * ww) < 0.45
    road = road | keep[lab]
    # 점선 길
    dm = Image.new('L', (W, H), 0); dd = ImageDraw.Draw(dm)
    for RAD in (7.5, 11.5):
        for p, q in dotted1(a, RAD):
            dd.line([tuple(p), tuple(q)], fill=255, width=3)
    road = road | (np.asarray(dm) > 0)
    # 3) 산 무늬: 작은 무늬가 빽빽함
    Lm = a.mean(2)
    T = nd.uniform_filter(np.abs(Lm - gaussian_filter(Lm, 2)), 17)
    mount = nd.binary_opening(T > max(0.04, np.percentile(T, 62)), structure=np.ones((3, 3)), iterations=5)
    lab, n = nd.label(mount); sz = nd.sum(mount, lab, range(1, n + 1))
    mount = nd.binary_closing(np.isin(lab, np.nonzero(sz > 2500)[0] + 1), iterations=2) & ~nd.binary_dilation(road, iterations=3)
    free = np.zeros((H, W), bool); yy, xx = np.ogrid[:H, :W]
    for x, y, rr in qp:
        cx, cy = x / 100 * W, y / 100 * H; R = max(8, rr / 100 * W * 0.8)
        y0, y1 = int(max(0, cy - R)), int(min(H, cy + R + 1)); x0, x1 = int(max(0, cx - R)), int(min(W, cx + R + 1))
        free[y0:y1, x0:x1] |= ((xx[:, x0:x1] - cx) ** 2 + (yy[y0:y1] - cy) ** 2) <= R * R
    walk = (walk | free) & ~(mount & ~free)
    # 4) 물: 채도 낮은 물 + 바다 가로줄 빗금
    water = nd.binary_opening((S_ < 0.26) & (V > 0.33) & (V < 0.86) & ~walk, iterations=2)
    gy = nd.uniform_filter(np.abs(np.diff(Lm, axis=0, append=Lm[-1:])), 15); gx = nd.uniform_filter(np.abs(np.diff(Lm, axis=1, append=Lm[:, -1:])), 15)
    sea = nd.binary_opening((gy > 1.8 * gx) & (gy > 0.025), iterations=3)
    lab, n = nd.label(sea); sz = nd.sum(sea, lab, range(1, n + 1))
    water = water | nd.binary_closing(np.isin(lab, np.nonzero(sz > 3000)[0] + 1), iterations=3)
    # 5) 몹·NPC·물건 자리 = 걸을 수 있는 땅
    occ = np.zeros((H, W), bool)
    for x, y in sp['npc'] + sp['obj']:
        px, py = int(x / 100 * W), int(y / 100 * H)
        if 0 <= px < W and 0 <= py < H:
            occ[py, px] = True
    pm = Image.new('L', (W, H), 0); pd = ImageDraw.Draw(pm)
    for P in sp['wp']:
        pd.line([(x / 100 * W, y / 100 * H) for x, y in P], fill=255, width=3)
    patrol = np.asarray(pm) > 0
    occ |= patrol
    for x, y, _ in qp:
        px, py = int(x / 100 * W), int(y / 100 * H)
        if 0 <= px < W and 0 <= py < H:
            occ[py, px] = True
    dsp = nd.distance_transform_edt(~occ)
    R = W * 0.012
    cost = (5.0 + np.clip((dsp - R) / (1.5 * R), 0, 1) * 110).astype(np.float32)
    cost[(dsp > R) & mount] = 400
    cost[dsp > 5 * R] = 400
    wat = water & (dsp > R * 0.7); cost[wat] = np.maximum(cost[wat], 150)
    near = cost < 300
    dist = nd.distance_transform_edt(~road)
    cost = np.where((dist < 6) & near, np.minimum(cost, 1 + dist * 0.6), cost)
    cost[road & near] = 1
    cost[patrol] = np.minimum(cost[patrol], 1.5)
    cs = cost[:H // SC * SC, :W // SC * SC].reshape(H // SC, SC, W // SC, SC).mean((1, 3))
    return np.clip(np.round(cs), 1, 255).astype(np.uint8)


def main():
    maps, qdb = sys.argv[1], sys.argv[2]
    src = rd(os.path.join(ROOT, 'app', 'app.js'))
    m = re.search(r'const ZID=\{(.*?)\};', src, re.S)
    ZID = {k: int(v) for k, v in re.findall(r"'([^']+)':(\d+)", m.group(1))}
    names = {}
    for k, v in ZID.items():
        names.setdefault(v, []).append(k)
    ids = [int(x) for x in sys.argv[3:]] or sorted(i for i in names if os.path.exists(os.path.join(maps, f'{i}.jpg')))
    out = os.path.join(ROOT, 'data', 'route'); os.makedirs(out, exist_ok=True)
    t = time.time(); SP = spawns(qdb, set(ids)); print('몹 자리', round(time.time() - t), '초')
    for i in ids:
        p = os.path.join(maps, f'{i}.jpg')
        if not os.path.exists(p):
            print('지도 그림 없음', i); continue
        img = Image.open(p)
        qp = quest_points(names[i])
        if len(SP[i]['npc']) + len(SP[i]['obj']) < 50:
            print('몹 자리가 너무 적어 건너뜀', i, names[i][0]); continue
        g = grid(img, SP[i], qp)
        Image.fromarray(g, 'L').save(os.path.join(out, f'{i}.png'), optimize=True)
        print(i, names[i][0], g.shape, os.path.getsize(os.path.join(out, f'{i}.png')))


if __name__ == '__main__':
    main()
