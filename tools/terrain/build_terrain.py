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
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from adt import read_adt, TILE, UNIT  # noqa: E402

ORIGIN = 32 * TILE
GW, GH = 341, 227
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
            elif key in self.wdl and self.wdl[key][1] <= -3:
                lo = float(self.wdl[key][0])
                self.c[key] = dict(h=np.full((129, 129), lo, np.float32), hole=np.zeros((128, 128), bool),
                                   wl=np.zeros((128, 128), np.float32), wt=np.full((128, 128), OCEAN_ID, np.uint16), chunks=0)
            else:
                self.c[key] = None
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


def zone_grid(tiles, rect, old, LQ):
    _, minX, minY, maxX, maxY = rect
    gx0 = int(math.floor((ORIGIN - maxY) / UNIT))
    gx1 = int(math.ceil((ORIGIN - minY) / UNIT))
    gy0 = int(math.floor((ORIGIN - maxX) / UNIT))
    gy1 = int(math.ceil((ORIGIN - minX) / UNIT))
    hc, sl, dep, bad, ocean, hole = native(tiles, gx0, gx1, gy0, gy1, LQ)
    steep = (sl > STEEP) & ~hole
    swim = np.nan_to_num(dep, nan=-1) > 1.6
    deep = swim & (np.nan_to_num(dep, nan=-1) > 8) & ocean
    nodata = np.isnan(hc)
    out = np.zeros((GH, GW), np.uint8)
    # 격자 칸마다 세계 칸 범위 (지도 0~1 ↔ 세계 사각형)
    fx = lambda u: (ORIGIN - (maxY - u * (maxY - minY))) / UNIT - gx0  # noqa: E731
    fy = lambda v: (ORIGIN - (maxX - v * (maxX - minX))) / UNIT - gy0  # noqa: E731
    stat = {'steep': 0, 'swim': 0, 'nodata': 0}
    for j in range(GH):
        y0, y1 = int(fy(j / GH)), max(int(fy(j / GH)) + 1, int(fy((j + 1) / GH)))
        for i in range(GW):
            x0, x1 = int(fx(i / GW)), max(int(fx(i / GW)) + 1, int(fx((i + 1) / GW)))
            sub = (slice(max(0, y0), min(hc.shape[0], y1)), slice(max(0, x0), min(hc.shape[1], x1)))
            n = nodata[sub]
            fs = 0.0
            if n.size == 0 or n.mean() > .6:
                v = 255
                stat['nodata'] += 1
            else:
                fs = steep[sub].mean()
                fw = swim[sub].mean()
                if bad[sub].mean() > .3:
                    v = 255
                elif deep[sub].mean() > .5:
                    v = 200
                    stat['swim'] += 1
                elif fw > .5:
                    v = 150
                    stat['swim'] += 1
                elif fs >= .34:
                    v = 255
                    stat['steep'] += 1
                elif fs >= .12:
                    v = 25
                else:
                    # 길(1)보다 2~8배: 길이 조금 돌아가면 길로, 많이 돌아가면 풀밭을 가로지름 (게임에선 길이 더 빠르지 않음)
                    ms = float(np.nanmean(sl[sub]))
                    v = int(round(2 + min(6.0, ms * 15)))
            if old is not None and old[j, i] == 1 and (v != 255 or fs < .7) and n.size and n.mean() <= .6:
                v = 1  # 지도의 길·순찰 경로(다리·비탈길)는 살림 (아주 가파른 절벽 한가운데만 빼고)
            out[j, i] = v
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
        old = np.array(Image.open(p)) if os.path.exists(p) else None
        g, st = zone_grid(T[nm], rects[zid], old, LQ)
        Image.fromarray(g, 'L').save(p, optimize=True)
        done.add(zid)
        print(zid, nm, '절벽칸', st['steep'], '물칸', st['swim'], '자료없음', st['nodata'])
    # 이 목록에 있는 지역은 tools/route/build_grid.py(지도 그림·몹 자리 격자)가 덮어쓰지 않음
    with open(tf, 'w', encoding='utf-8') as f:
        f.write('# 게임 지형으로 만든 걷기 격자 (tools/terrain/build_terrain.py). build_grid.py는 이 지역을 건너뜀\n')
        f.write('\n'.join(str(z) for z in sorted(done)) + '\n')


if __name__ == '__main__':
    main()
