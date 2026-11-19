"""FDT(Forever Dungeon Tools) 루트 코드와 우리 풀 계획을 서로 바꾸기 위한 번호표.
FDT 던전 파일(GPL v2, gitBellucci/ForeverDungeonTools Classic/*.lua)의 몹 (enemyIdx, cloneIdx)를
우리 지도 무리 키 "층:무리"로 맞춤. FDT 내용은 번호만 쓰고 이름·그림 등은 안 가져옴.
쓰기: python3 -I tools/fdt/build_map.py <FDT Classic 폴더>  → data/guides/fdt-map.json
"""
import json, re, sys, math, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = sys.argv[1]
FILES = {'Ragefire.lua': 'ragefire-chasm', 'WailingCaverns.lua': 'wailing-caverns', 'Deadmines.lua': 'deadmines',
         'Shadowfang.lua': 'shadowfang-keep', 'Stockade.lua': 'stockade', 'Blackfathom.lua': 'blackfathom-deeps'}
APP = json.load(open(os.path.join(ROOT, 'data/guides/dungeon-maps3d.json')))
BND = json.load(open(os.path.join(ROOT, 'tools/dgmap/bounds.json')))
out = {'_': 'FDT(Forever Dungeon Tools) 몹 번호 ↔ 지도 무리. 만든 법 tools/fdt/build_map.py'}
for fn, slug in FILES.items():
    lua = open(os.path.join(SRC, fn)).read()
    di = int(re.search(r'local dungeonIndex = (\d+)', lua).group(1))
    W = {int(m.group(1)): tuple(float(m.group(i)) for i in range(2, 6)) for m in re.finditer(r'\[(\d+)\] = \{ xY = ([-\d.]+), x0 = ([-\d.]+), yX = ([-\d.]+), y0 = ([-\d.]+)', lua)}
    body = lua.split('MDT.dungeonEnemies')[1]
    en = []
    for ei, blk in enumerate(re.split(r'\n  \[\d+\] = \{\n', body)[1:], start=1):
        idm = re.search(r'\["id"\] = (\d+)', blk)
        for ci, c in enumerate(re.finditer(r'\[(\d+)\] = \{ \["x"\] = ([-\d.]+), \["y"\] = ([-\d.]+)(?:, \["g"\] = \d+)?, \["sublevel"\] = (\d+)', blk), start=1):
            en.append((ei, int(c.group(1)), int(idm.group(1)) if idm else 0, float(c.group(2)), float(c.group(3)), int(c.group(4))))
    fl = APP[slug]['floors']; bd = BND[slug]
    pts = []  # (fi, i, x%, y%, name)
    for fi, f in enumerate(fl):
        M = f.get('mob') or {}
        for i, m in enumerate(M.get('p', [])):
            for q in (m[9] if len(m) > 9 and m[9] else [[m[0], m[1]]]):
                pts.append((fi, i, q[0], q[1]))
    mp, miss, far = {}, 0, []
    for ei, ci, nid, mx, my, sl in en:
        if sl not in W: miss += 1; continue
        xY, x0, yX, y0 = W[sl]; wy = (mx - x0) / xY; wx = (my - y0) / yX
        best = None
        for fi, i, px, py in pts:
            b = bd[fi]['b'] if fi < len(bd) else bd[0]['b']; xmin, xmax, ymin, ymax = b
            ax = (ymax - wy) / (ymax - ymin) * 100; ay = (xmax - wx) / (xmax - xmin) * 100
            d = math.hypot((ax - px) * (ymax - ymin) / 100, (ay - py) * (xmax - xmin) / 100)  # 야드
            if best is None or d < best[0]: best = (d, fi, i)
        if best and best[0] < 4:
            mp.setdefault('%d:%d' % (best[1], best[2]), []).append([ei, ci])
        else:
            miss += 1; far.append(round(best[0], 1) if best else None)
    sig = '.'.join(str(len((f.get('mob') or {}).get('p', []))) for f in fl)
    out[slug] = {'d': di, 's': sig, 'm': mp}
    print(slug, 'FDT', di, 'clones', len(en), 'matched', len(en) - miss, 'packs', len(mp), 'far', far[:6])
json.dump(out, open(os.path.join(ROOT, 'data/guides/fdt-map.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
print('wrote', os.path.getsize(os.path.join(ROOT, 'data/guides/fdt-map.json')), 'bytes')
