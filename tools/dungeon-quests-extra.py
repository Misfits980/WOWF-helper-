"""forg.gg 던전 퀘스트 목록에 빠진 퀘스트를 Questie 자료(data/qdb/quests.jsonl)로 채운다.
목록은 Warcraft Tavern 포에버 던전 퀘스트 가이드·와우헤드와 비교해서 골랐다.
출력: data/qdb/dungeon-quests-extra.txt (Q| 줄, 맨 끝 칸 = 직업 비트, 0이면 모두)"""
import json, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
ADD = {
    'gnomeregan': [95041, 2238],
    'deadmines': [92753],
    'shadowfang-keep': [1654],
    'razorfen-kraul': [1701, 96264],
    'sm-library': [96800, 1951],
    'razorfen-downs': [96773, 93604],
    'uldaman': [2398, 2200, 2278, 1956],
    'zul-farrak': [2769, 96770],
    'maraudon': [93404],
    'temple-of-atal-hakkar': [96603, 8232, 8236, 8253, 8257, 8418, 8422, 8425, 9053],
    'dire-maul-north': [7429, 5519],
    'dire-maul-east': [7463, 5526],
    'dire-maul-west': [7498, 7499, 7500, 7501, 7502, 7503, 7504, 7505, 7506],
    'lower-blackrock-spire': [4743],
    'blackrock-depths': [4295],
}
Q = {}
for l in open(ROOT / 'data/qdb/quests.jsonl', encoding='utf-8'):
    q = json.loads(l); Q[q['id']] = q
RW = {}
for l in open(ROOT / 'data/forg/rewards.jsonl', encoding='utf-8'):
    r = json.loads(l)
    ids = [x[0] for x in r.get('ch', [])] + [x[0] for x in r.get('it', [])] if isinstance(r.get('it', []), list) else [x[0] for x in r.get('ch', [])]
    RW[r['id']] = (ids, 1 if r.get('ch') else 0)
DGN = {}
for l in open(ROOT / 'data/forg/dungeons.txt', encoding='utf-8'):
    f = l.split('|')
    if len(f) > 2: DGN[f[0]] = f[1]
out = []
for slug, ids in ADD.items():
    for i in ids:
        q = Q.get(i)
        if not q:
            print('없음', slug, i); continue
        g = q.get('g') or ['', '', '', '']
        where = g[1] or ''
        inside = where and (where in DGN.get(slug, '') or DGN.get(slug, '').startswith(where))
        start = (g[0] or '시작') + ' · ' + ('던전 안' if inside else (where + (' ' + g[2].replace(',', ', ') if g[2] else '')).strip())
        pre = 1 if (q.get('pre') or q.get('pre1')) else 0
        rw, ch = RW.get(i, ([], 0))
        lv = q['lv'] or q['m'] or 0; m = q['m'] or lv
        out.append('|'.join(map(str, ['Q', slug, i, 'alliance', lv, m, q['n'], '', start, pre, ','.join(map(str, rw)), '', ch, '', q.get('cls') or 0])))
(ROOT / 'data/qdb/dungeon-quests-extra.txt').write_text('\n'.join(out) + '\n', encoding='utf-8')
print(len(out), '개')
