#!/usr/bin/env python3
"""data/qdb/quest-places-fix.txt (wowf.io 퀘스트 페이지에서 찾은 받는 곳·반납 좌표)로
data/qdb/quests.jsonl 의 빈 좌표만 채운다. 이미 좌표가 있으면 건드리지 않는다.
tools/qdb/import.py 로 다시 만든 뒤에도 이 스크립트를 돌리면 같은 결과가 된다 (forg-data.yml 에서 자동)."""
import json, pathlib, re
ROOT = pathlib.Path(__file__).resolve().parent.parent
Q = ROOT / 'data' / 'qdb'
fix = {}
for l in (Q / 'quest-places-fix.txt').read_text(encoding='utf-8').splitlines():
    m = re.match(r'^(\d+)([gr])(.+)$', l)
    if not m:
        continue
    f = m.group(3).split('~')
    v = [f[0], f[1], f[2], f[3]] + ([f[4]] if len(f) > 4 and f[4] else [])
    fix[(int(m.group(1)), m.group(2))] = v
out, n = [], 0
for l in (Q / 'quests.jsonl').read_text(encoding='utf-8').splitlines():
    if not l.strip():
        continue
    o = json.loads(l)
    for k in ('g', 'r'):
        v = fix.get((o['id'], k))
        cur = o.get(k) or []
        if v and not (len(cur) > 2 and cur[2]):
            if cur and cur[0] and not re.search('[A-Za-z]{3}', cur[0]) and v[3] != 'item':
                v = [cur[0]] + v[1:]
            o[k] = v; n += 1
    out.append(json.dumps(o, ensure_ascii=False, separators=(',', ':')))
(Q / 'quests.jsonl').write_text('\n'.join(out) + '\n', encoding='utf-8')
print('quest places filled', n)
