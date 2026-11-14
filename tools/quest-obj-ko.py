"""영어로 남은 퀘스트 목표(o)·이름(n)을 와우헤드 포에버 툴팁(locale=1, 한국어)에서 받아
data/qdb/ko-extra.jsonl(다음 import 때 반영)과 data/qdb/quests.jsonl(바로 반영)에 넣음.
한글이 없거나 'temp text'처럼 빈 글은 건너뛰고, 확인한 번호는 data/qdb/quest-ko-miss.txt에 적어 다음엔 안 물어봄."""
import json, re, time, urllib.request, pathlib, html
ROOT = pathlib.Path(__file__).resolve().parent.parent
Q = ROOT / 'data' / 'qdb'
lat = lambda t: bool(re.search('[A-Za-z]{3}', t or '')) and not re.search('[가-힣]', t or '')
qs = [json.loads(l) for l in (Q / 'quests.jsonl').read_text(encoding='utf-8').splitlines() if l.strip()]
miss = set((Q / 'quest-ko-miss.txt').read_text(encoding='utf-8').split()) if (Q / 'quest-ko-miss.txt').exists() else set()
todo = [q for q in qs if (lat(q.get('o')) or lat(q.get('n'))) and str(q['id']) not in miss][:450]
print('영어 목표·이름 퀘스트', len(todo))
got, nomiss = {}, []
for q in todo:
    try:
        req = urllib.request.Request('https://nether.wowhead.com/forever/tooltip/quest/%d?locale=1' % q['id'], headers={'User-Agent': 'Mozilla/5.0'})
        j = json.loads(urllib.request.urlopen(req, timeout=20).read().decode('utf-8'))
    except Exception as e:
        print('실패', q['id'], e); time.sleep(1); continue
    nm = (j.get('name') or '').strip()
    tt = j.get('tooltip') or ''
    m = re.search(r'</table><table><tr><td><br />(.*?)(?:<br /><br />|</td>)', tt, re.S)
    o = html.unescape(re.sub(r'<[^>]+>', '', m.group(1))).strip() if m else ''
    rec = {}
    if o and re.search('[가-힣]', o) and not o.lower().startswith('temp text'):
        rec['o'] = o
    if nm and re.search('[가-힣]', nm) and not nm.startswith('['):
        rec['n'] = nm
    if rec:
        got[q['id']] = rec
    else:
        nomiss.append(str(q['id']))
    time.sleep(1)
print('한글 받음', len(got), '없음', len(nomiss))
if got:
    kp = Q / 'ko-extra.jsonl'
    K = {}
    if kp.exists():
        for l in kp.read_text(encoding='utf-8').splitlines():
            if l.strip():
                o = json.loads(l); K[o['id']] = o
    for i, r in got.items():
        o = K.setdefault(i, {'id': i})
        if 'o' in r: o['o'] = r['o']
        if 'n' in r and lat(o.get('n') or 'x y z') : o['n'] = r['n']
    kp.write_text(''.join(json.dumps(o, ensure_ascii=False) + '\n' for o in K.values()), encoding='utf-8')
    out = []
    for q in qs:
        r = got.get(q['id'])
        if r:
            if 'o' in r and lat(q.get('o')): q['o'] = r['o']
            if 'n' in r and lat(q.get('n')): q['n'] = r['n']
        out.append(json.dumps(q, ensure_ascii=False))
    (Q / 'quests.jsonl').write_text('\n'.join(out) + '\n', encoding='utf-8')
if nomiss:
    with open(Q / 'quest-ko-miss.txt', 'a', encoding='utf-8') as f:
        f.write('\n'.join(nomiss) + '\n')
