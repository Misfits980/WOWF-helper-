"""위에서 본 지도 몹·보스 → NPC 번호(얼굴 그림용) 붙이기.

python3 tools/dgmap/add_ids.py [/tmp/cmout/packs.json]
- 무리 몹 이름(한글) → 그 던전 CMaNGOS 무리에 나오는 같은 이름 NPC 번호(없으면 전체 이름표에서)
- 보스 핀 번호 → 진행 순서(dungeon-guide steps) 이름 → NPC 번호
- tools/dgmap/thumbs-missing.json 에 든 번호(얼굴 그림 없음)는 넣지 않음 → 앱은 종족 그림
결과: dungeon-maps3d.json 층마다 mob.id = {이름: 번호}, pid = {핀 번호: 번호}
"""
import json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = json.load(open(sys.argv[1] if len(sys.argv) > 1 else '/tmp/cmout/packs.json'))
N = P['names']
M3p = os.path.join(ROOT, 'data/guides/dungeon-maps3d.json')
M = json.load(open(M3p, encoding='utf-8'))
C = json.load(open(os.path.join(ROOT, 'tools/dgmap/conf.json'), encoding='utf-8'))
G = json.load(open(os.path.join(ROOT, 'data/forg/dungeon-guide.json'), encoding='utf-8'))
MISS = set(json.load(open(os.path.join(ROOT, 'tools/dgmap/thumbs-missing.json')))['miss'])
allko = {}
for e, (ko, en, rk) in N.items():
    allko.setdefault(ko, int(e))
nm = np_ = 0
for slug, v in M.items():
    if slug == '_':
        continue
    ents = {str(e) for pk in P['packs'].get(str(C[slug]['map']), []) for e, c in pk['m']}
    byko = {}
    for e in sorted(ents, key=int):
        if e in N:
            byko.setdefault(N[e][0], int(e))
    steps = {st['n']: st.get('nm') for st in (G.get(slug, {}).get('steps') or [])}
    for f in v['floors']:
        ids = {}
        for m in f['mob']['p']:
            for x in m[7]:
                e = byko.get(x[0]) or allko.get(x[0])
                if e and e not in MISS:
                    ids[x[0]] = e
        f['mob']['id'] = ids; nm += len(ids)
        pid = {}
        for p in f['pins']:
            t = p['t'].rstrip('!')
            if t.isdigit() and int(t) in steps:
                e = byko.get(steps[int(t)]) or allko.get(steps[int(t)])
                if e and e not in MISS:
                    pid[t] = e
        f['pid'] = pid; np_ += len(pid)
json.dump(M, open(M3p, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('몹 이름', nm, '· 보스 핀', np_, '· 파일', os.path.getsize(M3p))
