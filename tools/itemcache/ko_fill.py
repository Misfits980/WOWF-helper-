"""가방 정리에서 영어로 남은 아이템 이름을 한글로 채우는 표 만들기 (게임·퀘스트 자료에서 계산한 값만 저장)

python3 -I tools/itemcache/ko_fill.py <wow.export CSV 폴더> <저장소>
  읽음: ItemSparse.csv(영어 이름), data/qdb/item-ko.txt(한글 이름), data/qdb/quests.jsonl·ko-extra.jsonl(퀘스트)
  씀:   data/qdb/item-ko-fill.txt  번호|한글 이름|근거
  1) 장인의 계약서: 포에버 「장인의 계약서」 퀘스트는 그 계약서 아이템으로 시작하고(시작 = 한글 아이템 이름),
     목표에 영어 이름 「Craftsman's Writ: …」이 들어 있음 → 영어 이름 ↔ 한글 이름
  2) 같은 영어 이름을 쓰는 다른 아이템이 한글 이름 하나로만 쓰이면 그 이름 (테스트·몬스터·옛 아이템은 뺌)
"""
import csv, json, os, re, sys
from collections import Counter, defaultdict

src, repo = sys.argv[1], sys.argv[2]
HAN = re.compile('[가-힣]')
SKIP = re.compile(r'^(OLD|\(OLD\)|Deprecated|Deptecated|Unused|UNUSED|Monster -|\[TMP\]|\[PH\]|PLACEHOLDER|QA)|\b(test|TEST|Test|DEPRECATED)\b')

ko = {}
for line in open(os.path.join(repo, 'data/qdb/item-ko.txt'), encoding='utf-8'):
    f = line.rstrip('\n').split('|')
    if len(f) > 1 and f[0].isdigit() and HAN.search(f[1]):
        ko[int(f[0])] = f[1]
en = {}
r = csv.reader(open(os.path.join(src, 'ItemSparse.csv'), encoding='utf-8', errors='replace'), delimiter=';')
h = next(r)
ix = {n: i for i, n in enumerate(h)}
for row in r:
    try:
        en[int(row[ix['ID']])] = row[ix['Display_lang']].strip()
    except (ValueError, IndexError):
        pass

# 1) 장인의 계약서 퀘스트
writ = {}
for name in ('quests.jsonl', 'ko-extra.jsonl'):
    p = os.path.join(repo, 'data/qdb', name)
    if not os.path.exists(p):
        continue
    for line in open(p, encoding='utf-8'):
        try:
            q = json.loads(line)
        except ValueError:
            continue
        g = q.get('g') or []
        if len(g) > 3 and g[3] == 'item' and g[0] and HAN.search(g[0]):
            for t in q.get('t') or []:
                if len(t) > 1 and isinstance(t[1], str) and t[1].startswith("Craftsman's Writ"):
                    writ.setdefault(t[1], set()).add(g[0])
writ = {k: next(iter(v)) for k, v in writ.items() if len(v) == 1}

# 2) 같은 영어 이름 → 한글 이름 (하나로만 쓰일 때)
e2k = defaultdict(Counter)
for i, n in en.items():
    if i in ko:
        e2k[n][ko[i]] += 1

# 3) 자료로 확인한 하나씩: 퀘스트 글이 그 물건을 한글 이름으로 부르는 것
MANUAL = {276067: ('잃어버린 화물 상자', '퀘스트 93443 「잃어버린 화물 상자를 … 전달」의 물건')}
out = []
for i, n in sorted(en.items()):
    if i in MANUAL and i not in ko:
        out.append(f'{i}|{MANUAL[i][0]}|{MANUAL[i][1]}')
        continue
    if i in ko or not n or HAN.search(n):
        continue
    if n in writ:
        out.append(f'{i}|{writ[n]}|계약서 퀘스트')
        continue
    if SKIP.search(n):
        continue
    c = e2k.get(n)
    if c and len(c) == 1:
        out.append(f'{i}|{next(iter(c))}|같은 영어 이름')
with open(os.path.join(repo, 'data/qdb/item-ko-fill.txt'), 'w', encoding='utf-8') as f:
    f.write('# 번호|한글 이름|근거 — tools/itemcache/ko_fill.py가 만듦\n' + '\n'.join(out) + '\n')
print('fill', len(out), 'writ', sum(1 for l in out if l.endswith('계약서 퀘스트')))
