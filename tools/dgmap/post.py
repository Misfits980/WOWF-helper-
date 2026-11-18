"""위에서 본 그림 다듬기: 조금 밝게, 바깥 가장자리에 어두운 테두리, 그 바깥에 은은한 빛(어두운 배경과 구분).

enhance(색 PNG 경로, 야드당 픽셀) → PIL RGBA
"""
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

HALO = np.array([120, 100, 70], float)  # 따뜻한 회갈색 빛


def enhance(cpath, ppy, br=1.12, gamma=.88, rim=.75, glow=.35):
    C = np.asarray(Image.open(cpath).convert('RGBA')).astype(float)
    M = C[..., 3] > 128
    t = max(1, int(round(ppy * .3)))
    inner = M & ~ndi.binary_erosion(M, iterations=t)
    g = ndi.gaussian_filter(M.astype(float), ppy * .9)
    out = C.copy()
    rgb = np.clip(255 * ((C[..., :3] / 255) ** gamma) * br, 0, 255)
    out[..., :3] = np.where(inner[..., None], rgb * (1 - rim), rgb)
    a = out[..., 3] / 255
    halo = g * (~M) * glow
    out[..., :3] = np.where((~M)[..., None], HALO, out[..., :3])
    out[..., 3] = np.clip(a + halo * (1 - a), 0, 1) * 255
    return Image.fromarray(out.astype(np.uint8), 'RGBA')
