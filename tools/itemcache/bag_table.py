"""가방 정리 도우미용 아이템 표 만들기 (게임 자료에서 계산한 값만 저장)

python3 -I tools/itemcache/bag_table.py <wow.export CSV 폴더> <저장소> [community-listfile.csv]
  읽음: ItemSparse.csv(등급·판매가), Item.csv(종류), data/qdb/item-ko.txt(한글 이름), data/qdb/item-ko-fill.txt(없는 한글 이름 채움)
  씀:   data/qdb/item-bag.txt  번호|이름|등급|종류|판매가(동)|아이콘 이름(파일 목록이 있을 때, Item.csv IconFileDataID → interface/icons/…)
  종류(ClassID): 0 소모품 · 1 가방 · 2 무기 · 4 방어구 · 5 재료(시약) · 7 직업 재료 · 9 도안 · 12 퀘스트 · 15 기타
"""
import csv, os, re, sys

src, repo = sys.argv[1], sys.argv[2]
def rows(name):
    r = csv.reader(open(os.path.join(src, name), encoding='utf-8', errors='replace'), delimiter=';')
    h = next(r)
    ix = {n: i for i, n in enumerate(h)}
    for row in r:
        yield ix, row

cls = {}
icf = {}
for ix, row in rows('Item.csv'):
    try:
        cls[int(row[ix['ID']])] = int(row[ix['ClassID']])
        icf[int(row[ix['ID']])] = int(row[ix['IconFileDataID']] or 0)
    except (ValueError, KeyError): pass
# 아이콘 파일 번호 → 이름 (wowdev 공개 파일 목록에서 interface/icons/ 줄만)
icn = {}
if len(sys.argv) > 3 and os.path.exists(sys.argv[3]):
    want = set(icf.values())
    for line in open(sys.argv[3], encoding='utf-8', errors='replace'):
        a, _, b = line.partition(';')
        if not b.lower().startswith('interface/icons/') or not a.isdigit() or int(a) not in want: continue
        icn[int(a)] = re.sub(r'\.(blp|tga)$', '', b.strip().lower()[len('interface/icons/'):])
ko = {}
for line in open(os.path.join(repo, 'data/qdb/item-ko.txt'), encoding='utf-8'):
    f = line.rstrip('\n').split('|')
    if len(f) > 1 and f[0].isdigit(): ko[int(f[0])] = f[1]
# 한글 이름이 없는 것은 ko_fill.py가 만든 표로 채움(장인의 계약서 등)
fill = os.path.join(repo, 'data/qdb/item-ko-fill.txt')
if os.path.exists(fill):
    for line in open(fill, encoding='utf-8'):
        f = line.rstrip('\n').split('|')
        if len(f) > 1 and f[0].isdigit() and not re.search('[가-힣]', ko.get(int(f[0]), '')): ko[int(f[0])] = f[1]
out = []
for ix, row in rows('ItemSparse.csv'):
    try:
        i = int(row[ix['ID']]); q = int(row[ix['OverallQualityID']]); sp = int(row[ix['SellPrice']])
    except ValueError:
        continue
    nm = ko.get(i) or row[ix['Display_lang']]
    nm = nm.replace('|', ' ').strip()
    if not nm: continue
    ic = icn.get(icf.get(i, 0), '')
    out.append(f"{i}|{nm}|{q}|{cls.get(i, -1)}|{sp}" + (f"|{ic}" if ic else ''))
out.sort(key=lambda l: int(l.split('|')[0]))
with open(os.path.join(repo, 'data/qdb/item-bag.txt'), 'w', encoding='utf-8') as f:
    f.write('\n'.join(out) + '\n')
print('items', len(out))
