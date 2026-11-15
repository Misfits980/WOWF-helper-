"""와우 지형 파일(WDT, ADT root) 읽기.

좌표 약속(와우 세계 좌표): X = 북쪽(+), Y = 서쪽(+). 타일 하나 = 533.333야드, 청크 = 1/16 타일.
  타일 번호 tx = 32 - Y/533.333 (열), ty = 32 - X/533.333 (행)
  ADT 이름 map_<tx>_<ty>.adt

read_wdt(path) → {(tx,ty): dict(root=, obj0=, tex0=, minimap=...)}
read_adt(bytes) → dict(h=129×129 높이(타일 북서 모서리부터 행=남쪽, 열=동쪽), hole=128×128 bool,
                      wl=128×128 물 높이(nan=물 없음), wt=128×128 물 종류)
"""
import struct
import numpy as np

TILE = 1600.0 / 3.0
CH = TILE / 16.0
UNIT = CH / 8.0


def chunks(b, o=0, end=None):
    end = len(b) if end is None else end
    while o + 8 <= end:
        mg = b[o:o + 4][::-1].decode('latin1')
        sz, = struct.unpack_from('<I', b, o + 4)
        yield mg, o + 8, sz
        o += 8 + sz


def read_wdt(path):
    b = open(path, 'rb').read()
    out = {}
    main = None
    for mg, o, sz in chunks(b):
        if mg == 'MAIN':
            main = [struct.unpack_from('<I', b, o + 8 * i)[0] for i in range(4096)]
        if mg == 'MAID':
            for i in range(4096):
                v = struct.unpack_from('<8I', b, o + 32 * i)
                if v[0]:
                    ty, tx = divmod(i, 64)
                    out[(tx, ty)] = dict(root=v[0], obj0=v[1], obj1=v[2], tex0=v[3], lod=v[4],
                                         maptex=v[5], maptexn=v[6], minimap=v[7])
    return out, main


def read_adt(b):
    H = np.full((129, 129), np.nan, np.float32)
    hole = np.zeros((128, 128), bool)
    wl = np.full((128, 128), np.nan, np.float32)
    wt = np.zeros((128, 128), np.uint16)
    mh2o = None
    seen = 0
    for mg, o, sz in chunks(b):
        if mg == 'MH2O':
            mh2o = (o, sz)
        elif mg == 'MCNK':
            hd = b[o:o + 128]
            flags, cx, cy = struct.unpack_from('<3I', hd, 0)
            if cx > 15 or cy > 15:
                continue
            seen += 1
            base = struct.unpack_from('<3f', hd, 104)[2]
            # 구멍
            if flags & 0x10000:
                hr = hd[20:28]
                for yy in range(8):
                    for xx in range(8):
                        if hr[yy] >> xx & 1:
                            hole[cy * 8 + yy, cx * 8 + xx] = True
            else:
                lr, = struct.unpack_from('<H', hd, 60)
                for k in range(16):
                    if lr >> k & 1:
                        yy, xx = divmod(k, 4)
                        hole[cy * 8 + yy * 2:cy * 8 + yy * 2 + 2, cx * 8 + xx * 2:cx * 8 + xx * 2 + 2] = True
            for smg, so, ssz in chunks(b, o + 128, o + sz):
                if smg == 'MCVT':
                    v = struct.unpack_from('<145f', b, so)
                    for r in range(9):
                        H[cy * 8 + r, cx * 8:cx * 8 + 9] = np.array(v[r * 17:r * 17 + 9], np.float32) + base
    if mh2o:
        o0, sz = mh2o
        for c in range(256):
            oi, nl, oa = struct.unpack_from('<3I', b, o0 + 12 * c)
            if not nl or not oi:
                continue
            cy, cx = divmod(c, 16)
            for L in range(nl):
                io = o0 + oi + 24 * L
                ltype, lvf, hmin, hmax, xo, yo, w, h, oex, ov = struct.unpack_from('<HHffBBBBII', b, io)
                if w == 0 or h == 0 or xo + w > 8 or yo + h > 8:
                    continue
                ex = None
                if oex:
                    nb = (w * h + 7) // 8
                    bits = int.from_bytes(b[o0 + oex:o0 + oex + nb], 'little')
                    ex = [(bits >> k) & 1 for k in range(w * h)]
                hts = None
                if ov and lvf in (0, 1, 3) and abs(hmax - hmin) > 0.01:
                    n = (w + 1) * (h + 1)
                    try:
                        hts = struct.unpack_from('<%df' % n, b, o0 + ov)
                    except struct.error:
                        hts = None
                    if hts and not all(min(hmin, hmax) - 5 <= x <= max(hmin, hmax) + 5 for x in hts):
                        hts = None
                for yy in range(h):
                    for xx in range(w):
                        if ex is not None and not ex[yy * w + xx]:
                            continue
                        if hts:
                            lv = (hts[yy * (w + 1) + xx] + hts[yy * (w + 1) + xx + 1] + hts[(yy + 1) * (w + 1) + xx] + hts[(yy + 1) * (w + 1) + xx + 1]) / 4
                        else:
                            lv = (hmin + hmax) / 2 if abs(hmax - hmin) < 50 else hmin
                        gy, gx = cy * 8 + yo + yy, cx * 8 + xo + xx
                        if np.isnan(wl[gy, gx]) or lv > wl[gy, gx]:
                            wl[gy, gx] = lv
                            wt[gy, gx] = ltype
    return dict(h=H, hole=hole, wl=wl, wt=wt, chunks=seen)


def _alpha(b, o, end, compressed):
    """MCAL 한 겹 → 64×64 (0~1). 큰 알파(4096바이트) 또는 RLE 압축"""
    if compressed:
        out = bytearray()
        while len(out) < 4096 and o < end:
            c = b[o]
            o += 1
            n = c & 0x7F
            if c & 0x80:
                out += bytes([b[o]]) * n
                o += 1
            else:
                out += b[o:o + n]
                o += n
        out = (out + bytes(4096))[:4096]
        return np.frombuffer(bytes(out), np.uint8).reshape(64, 64) / 255.0
    return np.frombuffer(b[o:o + 4096], np.uint8).reshape(64, 64) / 255.0 if o + 4096 <= len(b) else np.zeros((64, 64))


def read_tex0(b, res=8):
    """땅 텍스처 파일(_tex0.adt) → {텍스처 FileDataID: (16·res)×(16·res) 비중 0~1}.
    겹 i의 비중 = a_i × Π(위에 덮인 겹들의 1−a). 맨 아래 겹은 나머지 전부."""
    ids = []
    out = {}
    N = 16 * res
    k = 0
    for mg, o, sz in chunks(b):
        if mg == 'MDID':
            ids = list(struct.unpack_from('<%dI' % (sz // 4), b, o))
        elif mg == 'MTEX' and not ids:
            ids = [x.decode('latin1') for x in b[o:o + sz].split(b'\0') if x]
        elif mg == 'MCNK':
            cy, cx = divmod(k, 16)
            k += 1
            lay = []
            mcal = None
            for m2, o2, s2 in chunks(b, o, o + sz):
                if m2 == 'MCLY':
                    lay = [struct.unpack_from('<4I', b, o2 + 16 * i) for i in range(s2 // 16)]
                elif m2 == 'MCAL':
                    mcal = (o2, s2)
            if not lay:
                continue
            al = [None]
            for tid, fl, off, eff in lay[1:]:
                if mcal and fl & 0x100:
                    al.append(_alpha(b, mcal[0] + off, mcal[0] + mcal[1], fl & 0x200))
                else:
                    al.append(np.zeros((64, 64)))
            rem = np.ones((64, 64))
            ws = [None] * len(lay)
            for i in range(len(lay) - 1, 0, -1):
                ws[i] = al[i] * rem
                rem = rem * (1 - al[i])
            ws[0] = rem
            for (tid, fl, off, eff), w in zip(lay, ws):
                if tid >= len(ids):
                    continue
                f = ids[tid]
                if f not in out:
                    out[f] = np.zeros((N, N), np.float32)
                out[f][cy * res:(cy + 1) * res, cx * res:(cx + 1) * res] += w.reshape(res, 64 // res, res, 64 // res).mean(axis=(1, 3))
    return out
