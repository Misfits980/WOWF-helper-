"""모델 OBJ들을 세계 좌표로 옮겨 WebGL 그리기용 묶음(.bin + .json + 텍스처)으로 만든다.

사용: python3 -I prep.py <설정.json>
설정: {"out": 폴더, "export": wow.export 내보내기 폴더, "parts": [{"obj": 상대경로, "pos":[PX,PY,PZ], "rotY": 도, "scale":1} 또는 {"obj":..., "world": true}]}
"""
import json, os, sys, math, re
import numpy as np
from PIL import Image

ZP = 17066.666666

def read_obj_full(path):
    V = []; VT = []; VN = []; faces = {}; mats = []; cur = '_'; mtllib = None
    with open(path, encoding='utf-8', errors='replace') as fh:
        for l in fh:
            c = l[:2]
            if c == 'v ':
                p = l.split(); V.append((float(p[1]), float(p[2]), float(p[3])))
            elif c == 'vt':
                p = l.split(); VT.append((float(p[1]), float(p[2])))
            elif c == 'vn':
                p = l.split(); VN.append((float(p[1]), float(p[2]), float(p[3])))
            elif c == 'f ':
                p = l.split()[1:]
                tri = []
                for q in p:
                    s = q.split('/')
                    vi = int(s[0]) - 1
                    ti = int(s[1]) - 1 if len(s) > 1 and s[1] else -1
                    ni = int(s[2]) - 1 if len(s) > 2 and s[2] else -1
                    tri.append((vi, ti, ni))
                L = faces.setdefault(cur, [])
                for k in range(1, len(tri) - 1):
                    L.append((tri[0], tri[k], tri[k + 1]))
            elif l.startswith('usemtl'):
                cur = l.split(None, 1)[1].strip()
            elif l.startswith('mtllib'):
                mtllib = l.split(None, 1)[1].strip()
    return np.array(V, float), np.array(VT, float) if VT else np.zeros((0, 2)), np.array(VN, float) if VN else np.zeros((0, 3)), faces, mtllib

def read_mtl(path):
    out = {}; cur = None
    if not path or not os.path.exists(path): return out
    for l in open(path, encoding='utf-8', errors='replace'):
        l = l.strip()
        if l.startswith('newmtl'): cur = l.split(None, 1)[1]
        elif l.startswith('map_Kd') and cur: out[cur] = l.split(None, 1)[1].replace('\\', '/')
    return out

def rotz(deg):
    a = math.radians(deg); c, s = math.cos(a), math.sin(a)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])

def to_local(V):  # OBJ(x,y,z) → 모델 좌표 (x, -z, y)  (Z 위)
    return np.stack([V[:, 0], -V[:, 2], V[:, 1]], 1)

def main(cfg_path):
    cfg = json.load(open(cfg_path))
    out = cfg['out']; os.makedirs(out + '/tex', exist_ok=True)
    EX = cfg['export']
    pos_all = []; uv_all = []; nrm_all = []; draws = []; texmap = {}
    nvert = 0
    for part in cfg['parts']:
        path = os.path.join(EX, part['obj'])
        V, VT, VN, faces, mtllib = read_obj_full(path)
        if part.get('world'):  # 지형 OBJ: (세계Y, 세계Z, 세계X)
            W = np.stack([V[:, 2], V[:, 0], V[:, 1]], 1)
            N = np.stack([VN[:, 2], VN[:, 0], VN[:, 1]], 1) if len(VN) else VN
        else:
            px, py, pz = part['pos']
            R = rotz(part.get('rotY', 0) + 180)
            sc = part.get('scale', 1)
            W = (to_local(V) * sc) @ R.T + np.array([ZP - pz, ZP - px, py])
            N = to_local(VN) @ R.T if len(VN) else VN
        mtl = read_mtl(os.path.join(os.path.dirname(path), mtllib)) if mtllib else {}
        for m, tris in faces.items():
            T = np.array(tris)  # (n,3,3)
            vi = T[:, :, 0].reshape(-1); ti = T[:, :, 1].reshape(-1); ni = T[:, :, 2].reshape(-1)
            P = W[vi]
            UV = VT[ti] if len(VT) and (ti >= 0).all() else np.zeros((len(vi), 2))
            NN = N[ni] if len(N) and (ni >= 0).all() else np.tile([0, 0, 1.0], (len(vi), 1))
            t = mtl.get(m)
            if t and part.get('skiptex') and re.search(part['skiptex'], t, re.I):
                continue
            tk = None
            if t:
                src = os.path.normpath(os.path.join(os.path.dirname(path), t))
                tk = texmap.get(src)
                if tk is None:
                    tk = 't%d.png' % len(texmap); texmap[src] = tk
                    try:
                        im = Image.open(src).convert('RGBA'); sz = part.get('texmax', 512); im.thumbnail((sz, sz)); im.save(out + '/tex/' + tk)
                    except Exception as e:
                        print('텍스처 없음', src, e); tk = None; texmap[src] = None
            draws.append({'tex': tk, 'first': nvert, 'count': len(vi), 'part': part.get('name', part['obj'])})
            pos_all.append(P.astype(np.float32)); uv_all.append(UV.astype(np.float32)); nrm_all.append(NN.astype(np.float32))
            nvert += len(vi)
    P = np.concatenate(pos_all); U = np.concatenate(uv_all); Nn = np.concatenate(nrm_all)
    P.tofile(out + '/pos.bin'); U.tofile(out + '/uv.bin'); Nn.tofile(out + '/nrm.bin')
    meta = {'n': int(nvert), 'draws': draws, 'min': P.min(0).tolist(), 'max': P.max(0).tolist()}
    json.dump(meta, open(out + '/mesh.json', 'w'))
    print('정점', nvert, '그리기', len(draws), '텍스처', len([v for v in texmap.values() if v]), meta['min'], meta['max'])

if __name__ == '__main__':
    main(sys.argv[1])
