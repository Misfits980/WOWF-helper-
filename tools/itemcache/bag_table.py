"""가방 정리 도우미용 아이템 표 만들기 (게임 자료에서 계산한 값만 저장)

python3 -I tools/itemcache/bag_table.py <wow.export CSV 폴더> <저장소>
  읽음: ItemSparse.csv(등급·판매가), Item.csv(종류), data/qdb/item-ko.txt(한글 이름)
  씀:   data/qdb/item-bag.txt  번호|이름|등급|종류|판매가(동)
  종류(ClassID): 0 소모품 · 1 가방 · 2 무기 · 4 방어구 · 5 재료(시약) · 7 직업 재료 · 9 도안 · 12 퀘스트 · 15 기타
"""
import csv, os, sys

src, repo = sys.argv[1], sys.argv[2]
def rows(name):
    r = csv.reader(open(os.path.join(src, name), encoding='utf-8', errors='replace'), delimiter=';')
    h = next(r)
    ix = {n: i for i, n in enumerate(h)}
    for row in r:
        yield ix, row

cls = {}
for ix, row in rows('Item.csv'):
    try: cls[int(row[ix['ID']])] = int(row[ix['ClassID']])
    except ValueError: pass
ko = {}
for line in open(os.path.join(repo, 'data/qdb/item-ko.txt'), encoding='utf-8'):
    f = line.rstrip('\n').split('|')
    if len(f) > 1 and f[0].isdigit(): ko[int(f[0])] = f[1]
out = []
for ix, row in rows('ItemSparse.csv'):
    try:
        i = int(row[ix['ID']]); q = int(row[ix['OverallQualityID']]); sp = int(row[ix['SellPrice']])
    except ValueError:
        continue
    nm = ko.get(i) or row[ix['Display_lang']]
    nm = nm.replace('|', ' ').strip()
    if not nm: continue
    out.append(f"{i}|{nm}|{q}|{cls.get(i, -1)}|{sp}")
out.sort(key=lambda l: int(l.split('|')[0]))
with open(os.path.join(repo, 'data/qdb/item-bag.txt'), 'w', encoding='utf-8') as f:
    f.write('\n'.join(out) + '\n')
print('items', len(out))
