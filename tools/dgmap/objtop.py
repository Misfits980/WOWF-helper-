"""wow.export 지도 내보내기(OBJ + ModelPlacementInformation.csv) → 위에서 본 던전 그림.

좌표 (실측):
  지형 OBJ 정점 (x, y, z) = (세계Y, 세계Z, 세계X)
  배치 CSV PositionX/Y/Z: 세계Y = 17066.667 - PosX, 세계X = 17066.667 - PosZ, 세계Z = PosY
모델 OBJ(WMO·M2)의 축·회전은 fit_model()로 몹 자리와 맞춰 고른다.
"""
import csv, os, re, math, sys
import numpy as np
from PIL import Image, ImageDraw

ZP = 17066.666666

def read_obj(path, want_uv=False):
    """정점·면·재질 이름. 면은 삼각형 인덱스로."""
    V = []; F = []; FM = []; mats = []; mi = -1; mtllib = None
    with open(path, encoding='utf-8', errors='replace') as fh:
        for l in fh:
            c = l[:2]
            if c == 'v ':
                p = l.split(); V.append((float(p[1]), float(p[2]), float(p[3])))
            elif c == 'f ':
                p = l.split()[1:]
                idx = [int(q.split('/')[0]) for q in p]
                for k in range(1, len(idx) - 1):
                    F.append((idx[0], idx[k], idx[k + 1])); FM.append(mi)
            elif l.startswith('usemtl'):
                n = l.split(None, 1)[1].strip()
                if n not in mats: mats.append(n)
                mi = mats.index(n)
            elif l.startswith('mtllib'):
                mtllib = l.split(None, 1)[1].strip()
    V = np.array(V, dtype=np.float64) if V else np.zeros((0, 3))
    F = np.array(F, dtype=np.int64) - 1 if F else np.zeros((0, 3), dtype=np.int64)
    # 음수 인덱스는 wow.export가 안 씀
    return V, F, np.array(FM, dtype=np.int64), mats, mtllib

def read_mtl(path):
    out = {}; cur = None
    if not path or not os.path.exists(path): return out
    for l in open(path, encoding='utf-8', errors='replace'):
        l = l.strip()
        if l.startswith('newmtl'): cur = l.split(None, 1)[1]
        elif l.startswith('map_Kd') and cur: out[cur] = l.split(None, 1)[1]
    return out

_colc = {}
def tex_color(path):
    if path in _colc: return _colc[path]
    col = (128, 120, 110)
    try:
        im = Image.open(path).convert('RGBA').resize((16, 16))
        a = np.asarray(im).reshape(-1, 4).astype(float)
        w = a[:, 3:4] / 255.0 + 1e-6
        col = tuple(int(x) for x in (a[:, :3] * w).sum(0) / w.sum())
    except Exception:
        pass
    _colc[path] = col
    return col

def read_placements(csv_path):
    rows = []
    with open(csv_path, encoding='utf-8', errors='replace') as fh:
        for r in csv.DictReader(fh, delimiter=';'):
            rows.append(r)
    return rows

def placement_world(r):
    px, py, pz = float(r['PositionX']), float(r['PositionY']), float(r['PositionZ'])
    return np.array([ZP - pz, ZP - px, py])  # 세계 X, Y, Z

def rotz(deg):
    a = math.radians(deg); c, s = math.cos(a), math.sin(a)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])

# OBJ(모델) → 모델 자체 좌표(lx, ly, lz) 후보
AXES = {
    'x,-z,y': lambda V: np.stack([V[:, 0], -V[:, 2], V[:, 1]], 1),
    'x,z,y': lambda V: np.stack([V[:, 0], V[:, 2], V[:, 1]], 1),
    '-x,z,y': lambda V: np.stack([-V[:, 0], V[:, 2], V[:, 1]], 1),
    '-x,-z,y': lambda V: np.stack([-V[:, 0], -V[:, 2], V[:, 1]], 1),
    'z,x,y': lambda V: np.stack([V[:, 2], V[:, 0], V[:, 1]], 1),
    '-z,x,y': lambda V: np.stack([-V[:, 2], V[:, 0], V[:, 1]], 1),
    'z,-x,y': lambda V: np.stack([V[:, 2], -V[:, 0], V[:, 1]], 1),
    '-z,-x,y': lambda V: np.stack([-V[:, 2], -V[:, 0], V[:, 1]], 1),
}

def model_to_world(V, row, axes, rot_fn):
    L = AXES[axes](V)
    ry = float(row['RotationY'] or 0)
    sc = float(row.get('ScaleFactor') or 1) or 1
    R = rotz(rot_fn(ry))
    return (L * sc) @ R.T + placement_world(row)

ROTS = {
    'ry': lambda r: r, '-ry': lambda r: -r, 'ry+90': lambda r: r + 90, 'ry-90': lambda r: r - 90,
    '-ry+90': lambda r: -r + 90, '-ry-90': lambda r: -r - 90, 'ry+180': lambda r: r + 180, '-ry+180': lambda r: -r + 180,
}

def up_centroids(W, F, minnz=0.5):
    a, b, c = W[F[:, 0]], W[F[:, 1]], W[F[:, 2]]
    n = np.cross(b - a, c - a); ln = np.linalg.norm(n, axis=1) + 1e-9; nz = n[:, 2] / ln
    keep = np.abs(nz) > minnz   # 감김 방향이 모델마다 달라서 절댓값
    return ((a + b + c) / 3)[keep]

def fit_model(V, F, row, mobs):
    """몹 자리(세계 x,y,z)가 바닥 면에 가장 잘 붙는 축·회전 조합."""
    from scipy.spatial import cKDTree
    best = None
    for ak in AXES:
        for rk, rf in ROTS.items():
            W = model_to_world(V, row, ak, rf)
            C = up_centroids(W, F)
            if len(C) == 0: continue
            d, _ = cKDTree(C).query(mobs)
            sc = float(np.median(d)); hit = float((d < 3).mean())
            if best is None or sc < best[0]: best = (sc, hit, ak, rk)
    return best

AX_DEFAULT, ROT_DEFAULT = 'x,-z,y', 'ry+180'

def load_model(base, row, mats_cache={}):
    """배치 한 줄 → 세계 좌표 정점·면·면 재질 색."""
    rel = row['ModelFile'].replace('\\', '/')
    path = os.path.normpath(os.path.join(base, rel))
    V, F, FM, mats, mtllib = read_obj(path)
    W = model_to_world(V, row, AX_DEFAULT, ROTS[ROT_DEFAULT])
    mtl = read_mtl(os.path.join(os.path.dirname(path), mtllib)) if mtllib else {}
    cols = []
    for m in mats:
        t = mtl.get(m)
        cols.append(tex_color(os.path.normpath(os.path.join(os.path.dirname(path), t))) if t else (120, 112, 100))
    C = np.array(cols + [(120, 112, 100)], dtype=float)
    return W, F, C[FM]

def face_geo(W, F):
    a, b, c = W[F[:, 0]], W[F[:, 1]], W[F[:, 2]]
    n = np.cross(b - a, c - a); ln = np.linalg.norm(n, axis=1) + 1e-9
    return a, b, c, n / ln[:, None]

def orient_sign(W, F, mobs):
    """몹 바로 아래 면의 법선이 위로 가게 하는 부호."""
    from scipy.spatial import cKDTree
    a, b, c, n = face_geo(W, F)
    cen = (a + b + c) / 3
    keep = np.abs(n[:, 2]) > 0.6
    idx = np.where(keep)[0]
    t = cKDTree(cen[idx]); d, j = t.query(mobs)
    j = idx[j[d < 3]]
    below = cen[j, 2] <= mobs[d < 3, 2] + 0.5
    s = np.sign(n[j[below], 2]).sum()
    return 1.0 if s >= 0 else -1.0

def render(parts, bounds, ppy=4, zcut=None, zmin=None, sign=1.0, bg=(0, 0, 0, 0)):
    """parts: [(W, F, colors)], bounds=(xmin,xmax,ymin,ymax) 세계. 북쪽(+X) 위, 서쪽(+Y) 왼쪽."""
    xmin, xmax, ymin, ymax = bounds
    Wd = int(math.ceil((ymax - ymin) * ppy)); Hd = int(math.ceil((xmax - xmin) * ppy))
    im = Image.new('RGBA', (Wd, Hd), bg); dr = ImageDraw.Draw(im)
    polys = []  # (정렬 z, 꼭짓점 픽셀, 색, 종류)
    for W, F, COL in parts:
        a, b, c, n = face_geo(W, F)
        nz = n[:, 2] * sign
        zmx = np.maximum(np.maximum(a[:, 2], b[:, 2]), c[:, 2])
        zmn = np.minimum(np.minimum(a[:, 2], b[:, 2]), c[:, 2])
        ok = np.ones(len(F), bool)
        if zcut is not None: ok &= zmx <= zcut
        if zmin is not None: ok &= zmn >= zmin
        floor = ok & (nz > 0.35)
        wall = ok & (np.abs(nz) <= 0.35)
        def px(P):
            return np.stack([(ymax - P[:, 1]) * ppy, (xmax - P[:, 0]) * ppy], 1)
        A, B, C_ = px(a), px(b), px(c)
        # 밝기: 북서쪽 빛 + 높이
        L = np.array([0.45, 0.35, 0.82]); L /= np.linalg.norm(L)
        sh = np.clip((n * sign) @ L, 0.25, 1.0)
        zc = (a[:, 2] + b[:, 2] + c[:, 2]) / 3
        for i in np.where(floor)[0]:
            col = COL[i] * (0.55 + 0.6 * sh[i])
            polys.append((zc[i], 0, [tuple(A[i]), tuple(B[i]), tuple(C_[i])], tuple(int(min(255, v)) for v in col) + (255,)))
        for i in np.where(wall)[0]:
            polys.append((zmx[i], 1, [tuple(A[i]), tuple(B[i]), tuple(C_[i])], (22, 18, 16, 255)))
    polys.sort(key=lambda p: (p[0], p[1]))
    for z, k, pts, col in polys:
        if k == 0: dr.polygon(pts, fill=col)
        else: dr.polygon(pts, fill=col)
    return im
