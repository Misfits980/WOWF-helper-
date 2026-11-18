"""던전 하나(slug)의 위에서 본 지도 층들 → 그림(webp) + 핀 + 쫄 무리(지도 %).

사용: python3 make.py <slug> [...]
설정은 CONF. 묶음(prep.py 결과)은 out/<묶음>.
결과: /home/claude/dgmap/final/<slug>-<n>.webp, final/<slug>.json
"""
import json, sys, os, math, re
import numpy as np
from PIL import Image
sys.path.insert(0, '/home/claude/dgmap')
from shoot import shoot

REPO = '/home/claude/wowf-helper-'
C = json.load(open('/tmp/cmout/classic.json'))
P = json.load(open('/tmp/cmout/packs.json'))
G = json.load(open(REPO + '/data/forg/dungeon-guide.json'))
ENT = json.load(open('/home/claude/dgmap/entrances.json'))
NAMES = P['names']
TPL = C['tpl']

# 층: z(아래, 위) · box(세계 xmin,xmax,ymin,ymax, 없으면 자동) · name
CONF = json.load(open('/home/claude/dgmap/conf.json'))

def spawns_by_name(mp):
    out = {}
    for g, e, x, y, z, mt, sd in C['maps'][str(mp)]:
        t = TPL.get(str(e))
        if t: out.setdefault(t[0], []).append((x, y, z))
    return out

def ko_spawns(mp):
    out = {}
    for g, e, x, y, z, mt, sd in C['maps'][str(mp)]:
        n = NAMES.get(str(e))
        if n: out.setdefault(n[0], []).append((x, y, z))
    return out

def step_spawns(st, S, KO):
    """단계의 NPC 자리: 영어 이름 → 없으면 한글 이름(· 로 나뉜 첫 일치, 3곳 이하일 때만)."""
    en = st.get('en')
    if en and S.get(en): return S[en]
    for part in re.split(r'\s*[·,/]\s*', st.get('nm') or ''):
        if part in KO and len(KO[part]) <= 3: return KO[part]
    return []

def old_fit(slug):
    """옛 지도(wowf.io) 층마다: 옛 % ↔ 세계 좌표 축별 1차식 (보스 2곳 이상)."""
    mp = str(CONF[slug]['map']); g = G[slug]; S = spawns_by_name(mp); KO = ko_spawns(mp); fits = {}
    for fi, f in enumerate(g.get('floors') or []):
        pts = []
        for st in g['steps']:
            sp = step_spawns(st, S, KO)
            if not sp: continue
            pins = [p for p in f['pins'] if p['t'].rstrip('!') == str(st['n'])]
            if pins:
                x, y, z = sp[0]; pts.append((x, y, z, pins[0]['x'], pins[0]['y']))
        if len(pts) < 2: continue
        X = np.array([p[0] for p in pts]); Y = np.array([p[1] for p in pts])
        if np.ptp(X) < 8 or np.ptp(Y) < 8: continue
        a = np.polyfit(Y, [p[3] for p in pts], 1); c = np.polyfit(X, [p[4] for p in pts], 1)
        e = max(np.max(np.abs(np.polyval(a, Y) - [p[3] for p in pts])), np.max(np.abs(np.polyval(c, X) - [p[4] for p in pts])))
        if a[0] < 0 and c[0] < 0 and e < 4 and 0.5 < c[0] / a[0] < 3:
            fits[fi] = (a, c, float(e), [p[2] for p in pts])
    return fits

def build(slug):
    cf = CONF[slug]; mp = str(cf['map']); g = G[slug]
    S = spawns_by_name(mp); KO = ko_spawns(mp)
    packs = P['packs'][mp]
    fits = old_fit(slug)
    ent = [e for e in ENT.get(mp, []) if not cf.get('ent') or any(k in e[0] for k in cf['ent'])]
    res = {'floors': []}
    used_steps = set(); done_old = set()
    for li, fl in enumerate(cf['floors']):
        z0, z1 = fl['z']
        cl = fl.get('clip')  # 같은 높이에 다른 구역이 겹칠 때: 세계 x,y 범위로 이 층만
        CL = (lambda x, y: cl[0] <= x <= cl[1] and cl[2] <= y <= cl[3]) if cl else (lambda x, y: True)
        # 범위: 지정 or 이 층 높이의 쫄 + 보스
        if fl.get('box'):
            xmin, xmax, ymin, ymax = fl['box']
        else:
            pts = [p['c'] for p in packs if z0 <= p['c'][2] <= z1]
            pts += [s for st in g['steps'] if st.get('en') in S for s in S[st['en']] if z0 <= s[2] <= z1]
            pts += [e[1:] for e in ent if z0 <= e[3] <= z1 and (not fl.get('entbox') or True)]
            pts = [q for q in pts if CL(q[0], q[1])]
            A = np.array(pts)
            xmin, xmax, ymin, ymax = A[:, 0].min(), A[:, 0].max(), A[:, 1].min(), A[:, 1].max()
        pad = fl.get('pad', 30)
        xmin -= pad; xmax += pad; ymin -= pad; ymax += pad
        span = max(xmax - xmin, ymax - ymin)
        ppy = min(6.0, 2400.0 / span)
        w = int((ymax - ymin) * ppy); h = int((xmax - xmin) * ppy)
        inb = lambda x, y, z, m=0: xmin + m <= x <= xmax - m and ymin + m <= y <= ymax - m and z0 - 3 <= z <= z1 + 3 and CL(x, y)
        X = lambda y: round((ymax - y) / (ymax - ymin) * 100, 1)
        Y = lambda x: round((xmax - x) / (xmax - xmin) * 100, 1)
        rcfg = {'dir': 'out/' + cf['prep'], 'b': [float(xmin), float(xmax), float(ymin), float(ymax)],
                'z': [z0 - 200, z1 + 300], 's': [z0 - fl.get('below', 25), z1 + fl.get('above', 12)], 'w': w, 'h': h, 'tdim': .75}
        raw = '/tmp/dg_%s_%d.png' % (slug, li)
        if not (os.environ.get('NOSHOT') and os.path.exists(raw)): shoot(rcfg, raw)
        im = Image.open(raw)
        # 빈 둘레 잘라내기는 안 함(좌표 % 유지)
        im.thumbnail((1800, 1800))
        os.makedirs('/home/claude/dgmap/final', exist_ok=True)
        fn = '%s-%d.webp' % (slug, li + 1)
        im.save('/home/claude/dgmap/final/' + fn, 'WEBP', quality=78, method=6)
        # 핀: 보스(이름) → 세계 좌표 그대로
        pins = []
        for st in g['steps']:
            en = st.get('en'); n = st['n']
            old = None
            for f in g.get('floors') or []:
                for p in f['pins']:
                    if p['t'].rstrip('!') == str(n): old = p['t']
            sp = step_spawns(st, S, KO)
            cand = [s for s in sp if inb(*s)]
            if cand:
                x, y, z = cand[0]; pins.append({'x': X(y), 'y': Y(x), 't': old or str(n), 'w': 1}); used_steps.add(n); continue
            if sp:
                continue  # 다른 층에 정확한 자리가 있음
            # 옛 지도 핀 → 그 층 맞춤식으로 세계 좌표
            for fi, f in enumerate(g.get('floors') or []):
                if fi not in fits: continue
                a, c, e, zs = fits[fi]
                for p in f['pins']:
                    if p['t'].rstrip('!') != str(n): continue
                    wy = (p['x'] - a[1]) / a[0]; wx = (p['y'] - c[1]) / c[0]
                    zz = float(np.median(zs))
                    # 옛 층 높이에 가장 가까운 새 층 하나에만
                    best = min(range(len(cf['floors'])), key=lambda k: 0 if cf['floors'][k]['z'][0] <= zz <= cf['floors'][k]['z'][1] else min(abs(zz - cf['floors'][k]['z'][0]), abs(zz - cf['floors'][k]['z'][1])))
                    if xmin <= wx <= xmax and ymin <= wy <= ymax and best == li and n not in done_old:
                        pins.append({'x': X(wy), 'y': Y(wx), 't': p['t'], 'w': 2}); used_steps.add(n); done_old.add(n)
        for nm, x, y, z in ent:
            if inb(x, y, z):
                pins.append({'x': X(y), 'y': Y(x), 't': '입구', 'w': 1})
        # 쫄 무리·순찰 (보스·핀 있는 NPC 빼고)
        pinned = {st.get('en') for st in g['steps'] if st.get('en')}
        pk = []; pt = []
        for p in packs:
            if p['boss']: continue
            keep = [[e2, cn] for e2, cn in p['m'] if NAMES[str(e2)][1] not in pinned]
            if not keep: continue
            x, y, z = p['c']
            if not inb(x, y, z, 2): continue
            n = sum(cn for _, cn in keep)
            nm = [[NAMES[str(e2)][0], cn] for e2, cn in keep[:3]]
            pk.append([X(y), Y(x), n, p['ty'], p['el'], p['lv'][0], p['lv'][1], nm, 1 if p['rare'] else 0])
            if p['pat']:
                path = [[X(q[1]), Y(q[0])] for q in p['pat']]
                if all(-3 <= q[0] <= 103 and -3 <= q[1] <= 103 for q in path): pt.append([len(pk) - 1, path])
        res['floors'].append({'n': li + 1, 'name': fl.get('name', ''), 'img': 'data/dgmap/' + fn, 'w': im.size[0], 'h': im.size[1],
                              'pins': pins, 'mob': {'p': pk, 't': pt}})
        print(slug, li + 1, im.size, '핀', len(pins), '무리', len(pk), '순찰', len(pt))
    miss = [st['n'] for st in g['steps'] if st['n'] not in used_steps]
    res['miss'] = miss
    json.dump(res, open('/home/claude/dgmap/final/%s.json' % slug, 'w'), ensure_ascii=False)
    print(slug, '핀 없는 단계', miss)
    return res

if __name__ == '__main__':
    for s in sys.argv[1:]: build(s)
