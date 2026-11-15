"""게임 지형(높이·물)으로 지역별 「걷기 비용 격자」를 다시 만든다 → data/route/<지역번호>.png

재료 (게임 파일은 저장소에 넣지 않음. 계산 결과 격자만 올림)
  · wow.export로 내보낸 원본 지형 파일: <map>_<x>_<y>.adt (높이 MCVT · 구멍 · 물 MH2O)
  · 지역 경계: UiMapAssignment.csv (지역 지도 0~1 ↔ 세계 좌표 사각형)
  · 물 종류: LiquidType.csv (있으면. 용암·독은 못 감)
  · 기존 격자의 길(값 1: 지도에 그려진 길·순찰 경로)은 그대로 살림 (다리·건물 길)

칸 값: 1 길 · 2~8 걸을 수 있는 땅(경사가 클수록 큼) · 25 험한 비탈 · 150 물(헤엄) · 200 깊은 바다 · 255 절벽·용암·자료 없음

쓰는 법
  python3 -I tools/terrain/build_terrain.py <adt 폴더(맵 이름별 하위 폴더)> <csv 폴더> <저장소 경로> [지역번호 ...]
"""
import csv
import math
import os
import re
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from adt import read_adt, read_tex0, TILE, UNIT  # noqa: E402

ORIGIN = 32 * TILE
GW, GH = 682, 454  # 지도 1024×683의 1.5px = 1칸 (예전 341×227의 2배: 큰 지도에서 확대해도 선이 길에 붙게)
CITY = {1519, 1537, 1637, 1638, 1657, 1497}  # 도시는 건물 안이라 지형으로 못 판단 → 기존 격자 유지
STEEP = math.tan(math.radians(50))
OCEAN_ID = 1250  # Map.csv OceanLiquidTypeID (포에버)  # 이보다 가파르면 못 올라감
csv.field_size_limit(10 ** 8)


def rows(p):
    with open(p, encoding='utf-8', newline='') as f:
        r = csv.reader(f, delimiter=';')
        h = next(r)
        for x in r:
            yield dict(zip(h, x))


def zone_rects(p):
    """AreaID → (MapID, minX, minY, maxX, maxY): 지역 지도 전체(0,0~1,1) 칸"""
    out = {}
    for o in rows(p):
        if o['UiMin'] != '0,0' or o['UiMax'] != '1,1':
            continue
        a = int(o['AreaID'] or 0)
        if not a:
            continue
        r = [float(v) for v in o['Region'].split(',')]
        rect = (int(o['MapID']), r[0], r[1], r[3], r[4])
        if a not in out or (r[3] - r[0]) * (r[4] - r[1]) > (out[a][3] - out[a][1]) * (out[a][4] - out[a][2]):
            out[a] = rect
    return out


def liquid_kinds(p):
    """LiquidType ID → 'bad'(용암·독) / 'ocean' / 'water'"""
    k = {}
    if not p or not os.path.exists(p):
        return k
    for o in rows(p):
        nm = (o.get('Name') or o.get('Name_lang') or '').lower()
        sid = int(o['ID'])
        if any(s in nm for s in ('magma', 'lava', 'slime', 'fel', 'plague')):
            k[sid] = 'bad'
        elif 'ocean' in nm:
            k[sid] = 'ocean'
        else:
            k[sid] = 'water'
    return k


def read_wdl(p):
    """WDL: 타일마다 대충 높이(17×17+16×16) → {(tx,ty): (최저, 최고)}. 바다 타일 골라내기용"""
    import struct
    b = open(p, 'rb').read()
    o, off, out = 0, None, {}
    while o + 8 <= len(b):
        mg = b[o:o + 4][::-1].decode('latin1')
        sz, = struct.unpack_from('<I', b, o + 4)
        if mg == 'MAOF':
            off = struct.unpack_from('<4096I', b, o + 8)
        o += 8 + sz
    for i, v in enumerate(off or []):
        if v and b[v:v + 4][::-1] == b'MARE':
            h = struct.unpack_from('<545h', b, v + 8)
            ty, tx = divmod(i, 64)
            out[(tx, ty)] = (min(h), max(h))
    return out


class Tiles:
    """ADT 타일 읽기. 파일이 없고 WDL로 보면 바다(가장 높은 곳도 물 아래)인 타일은 깊은 바다로 채움"""
    def __init__(self, d, name):
        self.d, self.name, self.c = d, name, {}
        w = os.path.join(d, name + '.wdl')
        self.wdl = read_wdl(w) if os.path.exists(w) else {}

    def get(self, tx, ty):
        key = (tx, ty)
        if key not in self.c:
            p = os.path.join(self.d, '%s_%d_%d.adt' % (self.name, tx, ty))
            if os.path.exists(p):
                self.c[key] = read_adt(open(p, 'rb').read())
            # 운고로 분화구처럼 바다보다 낮은 땅(바닥 −150~−280)과 헷갈리지 않게, 바닥이 −400보다 깊은 진짜 바다만
            elif key in self.wdl and self.wdl[key][1] <= -3 and self.wdl[key][0] <= -400:
                lo = float(self.wdl[key][0])
                self.c[key] = dict(h=np.full((129, 129), lo, np.float32), hole=np.zeros((128, 128), bool),
                                   wl=np.zeros((128, 128), np.float32), wt=np.full((128, 128), OCEAN_ID, np.uint16), chunks=0)
            else:
                self.c[key] = None
        return self.c[key]

    def tex(self, tx, ty):
        """땅 텍스처(_tex0.adt) → {FileDataID: 128×128 비중}. 파일이 없으면 None (길이 없는 타일은 안 받음)"""
        key = ('t', tx, ty)
        if key not in self.c:
            p = os.path.join(self.d, '%s_%d_%d_tex0.adt' % (self.name, tx, ty))
            self.c[key] = read_tex0(open(p, 'rb').read(), 8) if os.path.exists(p) else None
        return self.c[key]


def native(tiles, gx0, gx1, gy0, gy1, LQ):
    """세계 칸(4.17야드) 단위 배열: 높이(칸 평균), 경사 tan, 물 깊이, 물 종류, 구멍"""
    W, H = gx1 - gx0, gy1 - gy0
    hc = np.full((H, W), np.nan, np.float32)
    sl = np.zeros((H, W), np.float32)
    dep = np.full((H, W), np.nan, np.float32)
    bad = np.zeros((H, W), bool)
    ocean = np.zeros((H, W), bool)
    hole = np.zeros((H, W), bool)
    for ty in range(gy0 // 128, (gy1 - 1) // 128 + 1):
        for tx in range(gx0 // 128, (gx1 - 1) // 128 + 1):
            a = tiles.get(tx, ty)
            if a is None:
                continue
            h = a['h']
            c4 = np.stack([h[:-1, :-1], h[1:, :-1], h[:-1, 1:], h[1:, 1:]])
            cell = c4.mean(0)
            # 칸 안 최대 기울기: 가로·세로·대각선 높이차
            d = np.maximum.reduce([np.abs(h[:-1, :-1] - h[:-1, 1:]), np.abs(h[1:, :-1] - h[1:, 1:]),
                                   np.abs(h[:-1, :-1] - h[1:, :-1]), np.abs(h[:-1, 1:] - h[1:, 1:]),
                                   np.abs(h[:-1, :-1] - h[1:, 1:]) / math.sqrt(2), np.abs(h[:-1, 1:] - h[1:, :-1]) / math.sqrt(2)])
            s = d / UNIT
            wl, wt = a['wl'], a['wt']
            ys, xs = ty * 128, tx * 128
            y0, y1 = max(gy0, ys), min(gy1, ys + 128)
            x0, x1 = max(gx0, xs), min(gx1, xs + 128)
            sy, sx = slice(y0 - ys, y1 - ys), slice(x0 - xs, x1 - xs)
            ty_, tx_ = slice(y0 - gy0, y1 - gy0), slice(x0 - gx0, x1 - gx0)
            hc[ty_, tx_] = cell[sy, sx]
            sl[ty_, tx_] = s[sy, sx]
            dep[ty_, tx_] = (wl - cell)[sy, sx]
            k = wt[sy, sx]
            ocean[ty_, tx_] = (k == OCEAN_ID) & ~np.isnan(wl[sy, sx])
            if LQ:
                bad[ty_, tx_] = np.vectorize(lambda v: LQ.get(int(v)) == 'bad')(k) & ~np.isnan(wl[sy, sx])
                ocean[ty_, tx_] |= np.vectorize(lambda v: LQ.get(int(v)) == 'ocean')(k) & ~np.isnan(wl[sy, sx])
            hole[ty_, tx_] = a['hole'][sy, sx]
    return hc, sl, dep, bad, ocean, hole


ROADNAME = re.compile(r'road|path|cobble|street', re.I)
_NAMES = None


def road_tex_ids():
    """이름에 Road·Path·Cobble이 들어간 땅 텍스처 FileDataID (WFH_LISTFILE = 'id;경로' 목록 파일)"""
    global _NAMES
    if _NAMES is None:
        _NAMES = set()
        lf = os.environ.get('WFH_LISTFILE')
        if lf and os.path.exists(lf):
            for ln in open(lf, encoding='utf-8', errors='replace'):
                i, _, nm = ln.strip().partition(';')
                if nm.lower().startswith('tileset/') and ROADNAME.search(nm.rsplit('/', 1)[-1]) and i.isdigit():
                    _NAMES.add(int(i))
    return _NAMES


def prune_spurs(sk, L):
    """뼈대에서 갈림길에 붙은 짧은(L칸 이하) 곁가지만 자름. 따로 떨어진 짧은 길 조각은 그대로 둠"""
    sk = sk.copy()
    H, W = sk.shape
    N8 = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]

    def nbrs(y, x):
        return [(y + dy, x + dx) for dy, dx in N8 if 0 <= y + dy < H and 0 <= x + dx < W and sk[y + dy, x + dx]]
    ys, xs = np.nonzero(sk)
    ends = [(y, x) for y, x in zip(ys, xs) if len(nbrs(y, x)) == 1]
    for e in ends:
        path = [e]
        prev, cur = None, e
        while True:
            nb = [q for q in nbrs(*cur) if q != prev and q not in path]
            if len(nb) != 1 or len(nbrs(*cur)) > 2:
                break
            prev, cur = cur, nb[0]
            path.append(cur)
            if len(path) > L + 1:
                break
        # cur가 갈림길(이웃 3개 이상)이고 곁가지가 짧으면 자름 (갈림길 칸은 남김)
        if len(path) <= L + 1 and len(nbrs(*cur)) >= 3 and cur != e:
            for q in path[:-1]:
                sk[q] = False
    return sk


def _integral(a):
    S = np.zeros((a.shape[0] + 1, a.shape[1] + 1), np.float64)
    S[1:, 1:] = np.cumsum(np.cumsum(a, 0, dtype=np.float64), 1)
    return S


def zone_grid(tiles, rect, old, LQ):
    """지역 하나 → GH×GW 걷기 비용 격자. 칸마다 세계 칸(4.17야드)들의 평균으로 정함(적분 영상으로 한 번에)."""
    _, minX, minY, maxX, maxY = rect
    gx0 = int(math.floor((ORIGIN - maxY) / UNIT))
    gx1 = int(math.ceil((ORIGIN - minY) / UNIT))
    gy0 = int(math.floor((ORIGIN - maxX) / UNIT))
    gy1 = int(math.ceil((ORIGIN - minX) / UNIT))
    hc, sl, dep, bad, ocean, hole = native(tiles, gx0, gx1, gy0, gy1, LQ)
    H, W = hc.shape
    steep = (sl > STEEP) & ~hole
    swim = np.nan_to_num(dep, nan=-1) > 1.6
    deep = swim & (np.nan_to_num(dep, nan=-1) > 8) & ocean
    nodata = np.isnan(hc)
    # 격자 칸마다 세계 칸 범위 (지도 0~1 ↔ 세계 사각형)
    fx = lambda u: (ORIGIN - (maxY - u * (maxY - minY))) / UNIT - gx0  # noqa: E731
    fy = lambda v: (ORIGIN - (maxX - v * (maxX - minX))) / UNIT - gy0  # noqa: E731
    ys0 = np.array([int(fy(j / GH)) for j in range(GH)])
    ys1 = np.maximum(ys0 + 1, np.array([int(fy((j + 1) / GH)) for j in range(GH)]))
    xs0 = np.array([int(fx(i / GW)) for i in range(GW)])
    xs1 = np.maximum(xs0 + 1, np.array([int(fx((i + 1) / GW)) for i in range(GW)]))
    Y0, Y1 = np.clip(ys0, 0, H)[:, None], np.clip(ys1, 0, H)[:, None]
    X0, X1 = np.clip(xs0, 0, W)[None, :], np.clip(xs1, 0, W)[None, :]
    area = (Y1 - Y0) * (X1 - X0)

    def mean(a):
        S = _integral(a.astype(np.float64))
        v = S[Y1, X1] - S[Y0, X1] - S[Y1, X0] + S[Y0, X0]
        return np.where(area > 0, v / np.maximum(area, 1), np.nan)

    fn = np.nan_to_num(mean(nodata), nan=1.0)
    fs = np.nan_to_num(mean(steep))
    fw = np.nan_to_num(mean(swim))
    fd = np.nan_to_num(mean(deep))
    fb = np.nan_to_num(mean(bad))
    slv = np.where(nodata, 0, sl)
    cnt = mean(~nodata)
    ms = np.nan_to_num(mean(slv) / np.maximum(np.nan_to_num(cnt), 1e-6))
    land = np.round(2 + np.minimum(6.0, ms * 15)).astype(np.int64)  # 길(1)보다 2~8배 (게임에선 길이 더 빠르지 않음)
    out = np.select([fn > .6, fb > .3, fd > .5, fw > .5, fs >= .34, fs >= .12],
                    [255, 255, 200, 150, 255, 25], land).astype(np.uint8)
    stat = {'steep': int(((fs >= .34) & (fn <= .6) & (fb <= .3) & (fw <= .5)).sum()),
            'swim': int(((fw > .5) & (fn <= .6)).sum()), 'nodata': int((fn > .6).sum()), 'road': 0, 'texroad': 0}

    # 길: 예전 격자의 길 칸(지도 그림에서 읽은 길·순찰 길)을 「길 근처」로 삼고, 그 안에서 게임 땅 텍스처(흙길·자갈길)가
    # 깔린 칸을 길로 정함 → 큰 지도에서 확대해도 선이 실제 길 위에 붙음. 텍스처가 없는 곳(다리·텍스처 없는 길)은 예전 길 그대로.
    if old is None:
        old = np.zeros((GH, GW), np.uint8)
    if True:
        o1 = np.array(Image.fromarray(((old == 1) * 255).astype(np.uint8)).resize((GW, GH), Image.NEAREST)) > 0
        k = max(1, round(GW / old.shape[1]))  # 예전 한 칸 = 새 칸 k개
        near = o1.copy()
        for _ in range(k + 1):
            near = near | np.roll(near, 1, 0) | np.roll(near, -1, 0) | np.roll(near, 1, 1) | np.roll(near, -1, 1)
        TW = {}
        hasT = np.zeros((H, W), bool)
        for ty in range(gy0 // 128, (gy1 - 1) // 128 + 1):
            for tx in range(gx0 // 128, (gx1 - 1) // 128 + 1):
                t = tiles.tex(tx, ty)
                if not t:
                    continue
                ys, xs = ty * 128, tx * 128
                y0, y1 = max(gy0, ys), min(gy1, ys + 128)
                x0, x1 = max(gx0, xs), min(gx1, xs + 128)
                hasT[y0 - gy0:y1 - gy0, x0 - gx0:x1 - gx0] = True
                for f, w in t.items():
                    if f not in TW:
                        TW[f] = np.zeros((H, W), np.uint8)
                    TW[f][y0 - gy0:y1 - gy0, x0 - gx0:x1 - gx0] = (w[y0 - ys:y1 - ys, x0 - xs:x1 - xs] * 255).astype(np.uint8)
        have = np.nan_to_num(mean(hasT))  # 텍스처 자료가 있는 비율
        rd = np.zeros((GH, GW))
        if TW and o1.sum() > 20:
            landm = (out != 255) & (out != 200) & (out != 150) & (have > .5)
            onr = o1 & (have > .5)
            for f, a in TW.items():
                m = np.nan_to_num(mean(a)) / 255.0
                if onr.sum() < 10 or not landm.any():
                    continue
                fr = m[onr].mean()
                lift = fr / max(1e-6, m[landm].mean())
                if lift >= 2.0 and fr >= .08:   # 길 칸에 몰려 있는 텍스처 = 그 지역 길 텍스처
                    rd += m
        okc = (fn <= .6) & ~((out == 255) & (fs >= .7))
        texroad = near & (rd >= .4) & okc
        # 이름이 「…Road / Path / Cobble」인 텍스처는 길 근처가 아니어도 길로 봄 (예전 지도 그림에서 길을 못 읽은 지역도 길이 생김)
        RN = road_tex_ids()
        rn = np.zeros((GH, GW))
        for f in TW:
            if f in RN:
                rn += np.nan_to_num(mean(TW[f])) / 255.0
        texroad |= (rn >= .4) & okc
        # 예전 길 칸 둘레(k칸)에 텍스처 길이 하나도 없으면(다리·텍스처 없는 길) 예전 길 칸을 그대로 씀
        tr = texroad.copy()
        for _ in range(k + 1):
            tr = tr | np.roll(tr, 1, 0) | np.roll(tr, -1, 0) | np.roll(tr, 1, 1) | np.roll(tr, -1, 1)
        keep = o1 & ~tr & (fn <= .6) & ~((out == 255) & (fs >= .7))
        R = texroad | keep
        # 길 가운데 줄만 1(길): 흙길이 넓게 깔린 곳(갈림길·마을 앞)에서 선이 길 가장자리로 붙지 않게 뼈대(가운데 줄)를 씀.
        # 나머지 길 폭은 2(평지와 같음)
        try:
            from skimage.morphology import skeletonize, remove_small_holes, binary_closing
            # 길 사이 작은 구멍을 메운 뒤 뼈대를 뽑아야 고리 모양이 안 생김
            Rf = remove_small_holes(binary_closing(R, np.ones((3, 3), bool)) & (out != 255) | R, max_size=60)
            sk = skeletonize(Rf)
            sk = prune_spurs(sk, 4)
            R = Rf
        except ImportError:
            sk = R
        out[R & ~sk] = 2
        out[sk] = 1
        stat['road'] = int(sk.sum())
        stat['texroad'] = int(texroad.sum())
    # 절벽 사이 한 칸짜리 틈 메우기: 둘레 8칸 중 6칸 이상이 절벽이면 그 칸도 절벽 (길은 빼고)
    blk = out == 255
    n8 = sum(np.roll(np.roll(blk, dy, 0), dx, 1) for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dy or dx)
    fill = (~blk) & (n8 >= 6) & (out != 1)
    out[fill] = 255
    return out, stat


def main():
    adt_root, csv_dir, repo = sys.argv[1:4]
    only = set(int(x) for x in sys.argv[4:])
    rects = zone_rects(os.path.join(csv_dir, 'UiMapAssignment.csv'))
    LQ = liquid_kinds(os.path.join(csv_dir, 'LiquidType.csv'))
    maps = {}
    for o in rows(os.path.join(csv_dir, 'Map.csv')):
        maps[int(o['ID'])] = o['Directory'].lower()
    rdir = os.path.join(repo, 'data', 'route')
    ids = sorted(int(f[:-4]) for f in os.listdir(rdir) if f.endswith('.png'))
    T = {}
    tf = os.path.join(rdir, 'terrain.txt')
    done = set(int(x) for x in open(tf, encoding='utf-8').read().split() if x.isdigit()) if os.path.exists(tf) else set()
    for zid in ids:
        if only and zid not in only:
            continue
        if zid in CITY or zid not in rects:
            print(zid, '건너뜀', 'city' if zid in CITY else 'no rect')
            continue
        mid = rects[zid][0]
        nm = maps.get(mid)
        d = os.path.join(adt_root, nm or '?')
        if not nm or not os.path.isdir(d):
            print(zid, '지형 없음', nm)
            continue
        if nm not in T:
            T[nm] = Tiles(d, nm)
        p = os.path.join(rdir, '%d.png' % zid)
        # 길 칸은 처음 격자(지도 그림에서 읽은 길)를 씀: WFH_ROADSRC 폴더에 있으면 그것, 없으면 지금 격자
        rs = os.path.join(os.environ.get('WFH_ROADSRC', ''), '%d.png' % zid)
        src = rs if os.environ.get('WFH_ROADSRC') and os.path.exists(rs) else p
        old = np.array(Image.open(src)) if os.path.exists(src) else None
        g, st = zone_grid(T[nm], rects[zid], old, LQ)
        Image.fromarray(g, 'L').save(p, optimize=True)
        done.add(zid)
        print(zid, nm, '절벽칸', st['steep'], '물칸', st['swim'], '자료없음', st['nodata'], '길칸', st['road'], '(텍스처 길', st['texroad'], ')')
    # 이 목록에 있는 지역은 tools/route/build_grid.py(지도 그림·몹 자리 격자)가 덮어쓰지 않음
    with open(tf, 'w', encoding='utf-8') as f:
        f.write('# 게임 지형으로 만든 걷기 격자 (tools/terrain/build_terrain.py). build_grid.py는 이 지역을 건너뜀\n')
        f.write('\n'.join(str(z) for z in sorted(done)) + '\n')


if __name__ == '__main__':
    main()
