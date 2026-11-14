"""출처 이름이 영어로 남은 몹·NPC의 한글 이름을 와우헤드 포에버 툴팁(locale=1)에서 받아 data/qdb/npc-en-ko.txt(영어|한글)에 더함.
app/build.py를 먼저 돌린 뒤 app-data.js의 D_SRC에서 「… · 영어이름 ~wh:npc=번호」 줄을 찾음. 한 번에 최대 400개, 요청 사이 1초.
한글 이름이 없는(영어로 돌려주는) 번호는 data/qdb/npc-ko-miss.txt에 적어 다음엔 건너뜀."""
import json, re, time, urllib.request, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'data' / 'qdb' / 'npc-en-ko.txt'
MISS = ROOT / 'data' / 'qdb' / 'npc-ko-miss.txt'
src = (ROOT / 'app-data.js').read_text(encoding='utf-8')
m = re.search(r'^const D_SRC=(".*?");$', src, re.M)
lines = json.loads(m.group(1)).splitlines()
have = set(l.split('|', 1)[0] for l in OUT.read_text(encoding='utf-8').splitlines() if '|' in l)
miss = set(MISS.read_text(encoding='utf-8').split()) if MISS.exists() else set()
todo = {}
for l in lines:
    f = l.split('~')
    if len(f) < 3:
        continue
    mm = re.match(r'^.*· ([A-Za-z][^~]*)$', f[1]); mi = re.search(r'wh:npc=(\d+)', f[2])
    if mm and mi and mm.group(1) not in have and mi.group(1) not in miss:
        todo[mi.group(1)] = mm.group(1).strip()
todo = list(todo.items())[:400]
print('영어 이름 NPC', len(todo))
add, nomiss = [], []
for i, en in todo:
    try:
        req = urllib.request.Request('https://nether.wowhead.com/forever/tooltip/npc/' + i + '?locale=1', headers={'User-Agent': 'Mozilla/5.0'})
        j = json.loads(urllib.request.urlopen(req, timeout=20).read().decode('utf-8'))
        ko = (j.get('name') or '').strip()
        if re.search('[가-힣]', ko):
            add.append(en + '|' + ko)
        else:
            nomiss.append(i)
    except Exception as e:
        print('실패', i, e)
    time.sleep(1)
if add:
    with open(OUT, 'a', encoding='utf-8') as f:
        f.write('\n'.join(add) + '\n')
if nomiss:
    with open(MISS, 'a', encoding='utf-8') as f:
        f.write('\n'.join(nomiss) + '\n')
print('한글', len(add), '없음', len(nomiss))
