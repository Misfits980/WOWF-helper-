# 시험: 지도 그림에서 길(밝은 흙색 선)을 찾아 길 따라 동선 그리기 (엘윈 숲)
import json, heapq, math, urllib.request, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from scipy import ndimage as nd
os.makedirs('out', exist_ok=True)
U = 'https://wow.zamimg.com/images/wow/classic/maps/kokr/original/12.jpg'
open('out/map.jpg', 'wb').write(urllib.request.urlopen(urllib.request.Request(U, headers={'User-Agent': 'Mozilla/5.0'})).read())
im = Image.open('out/map.jpg').convert('RGB'); W, H = im.size
a = np.asarray(im).astype(np.float32) / 255
r, g, b = a[..., 0], a[..., 1], a[..., 2]
mx, mn = a.max(2), a.min(2); sat = (mx - mn) / (mx + 1e-6); L = (mx + mn) / 2
# 길: 주변보다 밝고(톱햇), 따뜻한 흙색(빨강≥초록≥파랑), 채도 낮음
blur = nd.uniform_filter(L, 17)
top = L - blur
warm = (r >= g - 0.02) & (g >= b - 0.01)
road = (top > 0.035) & warm & (sat < 0.55) & (L > 0.35)
road = nd.binary_opening(road, iterations=1)
road = nd.binary_closing(road, iterations=2)
# 작은 점 지우기 (길은 길게 이어짐)
lab, n = nd.label(road); sizes = nd.sum(road, lab, range(1, n + 1))
keep = np.zeros(n + 1, bool); keep[1:] = sizes > 120; road = keep[lab]
water = (b > r + 0.06) & (b > g - 0.02) & (sat > 0.18)
water = nd.binary_opening(water, iterations=2)
dark = L < 0.16
# 산·절벽: 밝기 변화가 큰 거친 곳
rough = nd.generic_gradient_magnitude(nd.gaussian_filter(L, 1.5), nd.sobel)
rough = nd.uniform_filter(rough, 9) > 0.42
cost = np.full((H, W), 6.0, np.float32)
cost[rough] = 30; cost[dark] = 40; cost[water] = 120
cost[road] = 1.0
# 길 가까이는 조금 싸게 (길로 붙어 가게)
dist = nd.distance_transform_edt(~road)
cost = np.minimum(cost, np.where(dist < 6, 1 + dist * 0.7, cost))
S = 3  # 3픽셀 한 칸
cs = cost[:H // S * S, :W // S * S].reshape(H // S, S, W // S, S).mean((1, 3))
h, w = cs.shape

def astar(p0, p1):
    sx, sy = int(p0[0] / 100 * W / S), int(p0[1] / 100 * H / S)
    tx, ty = int(p1[0] / 100 * W / S), int(p1[1] / 100 * H / S)
    if (sx, sy) == (tx, ty):
        return [(sx, sy)]
    mins = float(cs.min())
    D8 = [(1, 0, 1), (-1, 0, 1), (0, 1, 1), (0, -1, 1), (1, 1, 1.414), (1, -1, 1.414), (-1, 1, 1.414), (-1, -1, 1.414)]
    best = {(sx, sy): 0.0}; prev = {}; pq = [(0.0, 0.0, sx, sy)]
    while pq:
        f, gco, x, y = heapq.heappop(pq)
        if (x, y) == (tx, ty):
            break
        if gco > best.get((x, y), 1e18):
            continue
        for dx, dy, dd in D8:
            nx, ny = x + dx, y + dy
            if not (0 <= nx < w and 0 <= ny < h):
                continue
            ng = gco + dd * (cs[ny, nx] + cs[y, x]) / 2
            if ng < best.get((nx, ny), 1e18):
                best[(nx, ny)] = ng; prev[(nx, ny)] = (x, y)
                heapq.heappush(pq, (ng + math.hypot(tx - nx, ty - ny) * mins, ng, nx, ny))
    path = [(tx, ty)]
    while path[-1] in prev:
        path.append(prev[path[-1]])
    return path[::-1]

def smooth(P, k=3):
    P = [(x * S + S / 2, y * S + S / 2) for x, y in P][::2] + [(P[-1][0] * S + S / 2, P[-1][1] * S + S / 2)]
    for _ in range(k):
        Q = [P[0]]
        for (x0, y0), (x1, y1) in zip(P, P[1:]):
            Q += [(.75 * x0 + .25 * x1, .75 * y0 + .25 * y1), (.25 * x0 + .75 * x1, .25 * y0 + .75 * y1)]
        P = Q + [P[-1]]
    return P

stops = json.load(open('.github/tmp_stops.json'))
st = stops['6'][4:]
st.insert(1, {'t': 'do', 'x': 48.9, 'y': 28.3, 'p': '코볼트 일꾼 (메아리 광산 안)'}) if False else None
pts = []
for s in st:
    if not pts or math.hypot(pts[-1]['x'] - s['x'], pts[-1]['y'] - s['y']) > 2.5:
        pts.append(s)
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
except Exception:
    font = ImageFont.load_default()
COL = {'get': (255, 210, 60), 'do': (255, 138, 61), 'turn': (126, 200, 255)}

def base():
    return im.copy().convert('RGBA')

def pins(d):
    for i, s in enumerate(pts):
        x, y = s['x'] / 100 * W, s['y'] / 100 * H
        d.ellipse([x - 11, y - 11, x + 11, y + 11], fill=COL[s['t']] + (255,), outline=(20, 14, 6, 255), width=2)
        t = str(i + 1); tw = d.textlength(t, font=font)
        d.text((x - tw / 2, y - 9), t, fill=(20, 14, 6, 255), font=font)

def dashed(d, p0, p1, col, wdt=4, dash=12, gap=9):
    L_ = math.hypot(p1[0] - p0[0], p1[1] - p0[1]); n = int(L_ // (dash + gap)) + 1
    for k in range(n):
        a0 = k * (dash + gap) / L_; a1 = min(1, (k * (dash + gap) + dash) / L_)
        if a0 >= 1: break
        d.line([(p0[0] + (p1[0] - p0[0]) * a0, p0[1] + (p1[1] - p0[1]) * a0), (p0[0] + (p1[0] - p0[0]) * a1, p0[1] + (p1[1] - p0[1]) * a1)], fill=col, width=wdt)

# 1) 지금 (직선)
A = base(); d = ImageDraw.Draw(A)
for s0, s1 in zip(pts, pts[1:]):
    dashed(d, (s0['x'] / 100 * W, s0['y'] / 100 * H), (s1['x'] / 100 * W, s1['y'] / 100 * H), (255, 214, 90, 255))
pins(d); A.convert('RGB').save('out/a_straight.jpg', quality=85)
# 2) 길 따라
B = base(); d = ImageDraw.Draw(B)
for s0, s1 in zip(pts, pts[1:]):
    P = smooth(astar((s0['x'], s0['y']), (s1['x'], s1['y'])))
    d.line(P, fill=(0, 0, 0, 200), width=8, joint='curve')
    d.line(P, fill=(255, 214, 90, 255), width=4, joint='curve')
pins(d); B.convert('RGB').save('out/b_road.jpg', quality=85)
# 3) 길로 알아본 곳 (확인용)
C = base(); ov = np.zeros((H, W, 4), np.uint8)
ov[road] = (255, 60, 200, 200); ov[water & ~road] = (40, 120, 255, 120); ov[rough & ~road & ~water] = (120, 60, 20, 90)
C.alpha_composite(Image.fromarray(ov, 'RGBA')); C.convert('RGB').save('out/c_mask.jpg', quality=80)
json.dump([{'n': i + 1, **s} for i, s in enumerate(pts)], open('out/pts.json', 'w'), ensure_ascii=False)
print('ok', W, H, 'road px', int(road.sum()), 'pts', len(pts))
