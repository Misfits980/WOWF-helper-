"""아이콘 없는 장비의 아이콘을 와우헤드 포에버 툴팁에서 받아 data/qdb/item-icons.txt(번호|아이콘|)에 더함.
app/build.py를 먼저 돌린 뒤 app-data.js의 D_ITEMS에서 아이콘이 빈 줄을 찾음. 한 번에 최대 300개, 요청 사이 1초 쉼."""
import json, re, time, urllib.request, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'data' / 'qdb' / 'item-icons.txt'
src = (ROOT / 'app-data.js').read_text(encoding='utf-8')
m = re.search(r'^const D_ITEMS=(".*?");$', src, re.M)
items = json.loads(m.group(1)).splitlines()
have = set(l.split('|')[0] for l in OUT.read_text(encoding='utf-8').splitlines()) if OUT.exists() else set()
todo = [f[0] for f in (l.split('|') for l in items) if len(f) >= 14 and f[0].isdigit() and not f[13] and f[0] not in have][:300]
print('아이콘 없는 장비', len(todo))
add = []
for i in todo:
    try:
        req = urllib.request.Request('https://nether.wowhead.com/forever/tooltip/item/' + i, headers={'User-Agent': 'Mozilla/5.0'})
        j = json.loads(urllib.request.urlopen(req, timeout=20).read().decode('utf-8'))
        if j.get('icon'):
            add.append(i + '|' + j['icon'].lower() + '|')
    except Exception as e:
        print('실패', i, e)
    time.sleep(1)
if add:
    with open(OUT, 'a', encoding='utf-8') as f:
        f.write('\n'.join(add) + '\n')
print('더함', len(add))
