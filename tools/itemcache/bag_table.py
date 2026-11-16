"""가방 정리 도우미용 아이템 표 만들기 (게임 자료에서 계산한 값만 저장)

python3 -I tools/itemcache/bag_table.py <wow.export CSV 폴더> <저장소> [community-listfile.csv] [DBCache.bin WoWDBDefs폴더]
  읽음: ItemSparse.csv(등급·판매가), Item.csv(종류), data/qdb/item-ko.txt(한글 이름), data/qdb/item-ko-fill.txt(없는 한글 이름 채움)
        + 게임 핫픽스 캐시(Cache/ADB/koKR/DBCache.bin)가 있으면: 포에버가 서버로 내려 준 아이템 기록(한글 이름·등급·판매가·종류·아이콘)
          — CSV에 없는 포에버 아이템(예 7721 정의의 망치·280612 밤의 감시자의 횃불)도 넣고, 이름은 게임이 보여 주는 한글 이름을 먼저 씀
  씀:   data/qdb/item-bag.txt  번호|이름|등급|종류|판매가(동)|아이콘 이름(Item IconFileDataID → interface/icons/…)
  종류(ClassID): 0 소모품 · 1 가방 · 2 무기 · 4 방어구 · 5 재료(시약) · 7 직업 재료 · 9 도안 · 12 퀘스트 · 13 열쇠 · 15 기타
"""
import csv, os, re, sys

src, repo = sys.argv[1], sys.argv[2]
LIST = sys.argv[3] if len(sys.argv) > 3 else ''
CACHE = sys.argv[4] if len(sys.argv) > 4 else ''
DBD = sys.argv[5] if len(sys.argv) > 5 else ''
HAN = re.compile('[가-힣]')


def rows(name):
    r = csv.reader(open(os.path.join(src, name), encoding='utf-8', errors='replace'), delimiter=';')
    h = next(r)
    ix = {n: i for i, n in enumerate(h)}
    for row in r:
        yield ix, row


# 1) CSV(게임 기본 자료)
cls, icf, base = {}, {}, {}
for ix, row in rows('Item.csv'):
    try:
        cls[int(row[ix['ID']])] = int(row[ix['ClassID']])
        icf[int(row[ix['ID']])] = int(row[ix['IconFileDataID']] or 0)
    except (ValueError, KeyError):
        pass
for ix, row in rows('ItemSparse.csv'):
    try:
        base[int(row[ix['ID']])] = [row[ix['Display_lang']], int(row[ix['OverallQualityID']]), int(row[ix['SellPrice']])]
    except ValueError:
        continue

# 2) 핫픽스 캐시(포에버가 내려 준 기록 — 한글 이름)
hotnm = {}
if CACHE and DBD and os.path.exists(CACHE):
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from game_items import load  # noqa: E402
    tabs, _ = load(CACHE, src, DBD)
    for i, (s, r) in tabs['ItemSparse'].items():
        if s != 'hot':
            continue
        nm = str(r.get('Display_lang') or '')
        try:
            base[i] = [nm or (base.get(i) or [''])[0], int(r.get('OverallQualityID') or 0), int(r.get('SellPrice') or 0)]
        except (TypeError, ValueError):
            continue
        if HAN.search(nm):
            hotnm[i] = nm
    for i, (s, r) in tabs['Item'].items():
        if s != 'hot':
            continue
        try:
            cls[i] = int(r.get('ClassID'))
            if int(r.get('IconFileDataID') or 0):
                icf[i] = int(r.get('IconFileDataID'))
        except (TypeError, ValueError):
            pass

# 3) 아이콘 파일 번호 → 이름 (wowdev 공개 파일 목록에서 interface/icons/ 줄만)
icn = {}
if LIST and os.path.exists(LIST):
    want = set(icf.values())
    for line in open(LIST, encoding='utf-8', errors='replace'):
        a, _, b = line.partition(';')
        if not b.lower().startswith('interface/icons/') or not a.isdigit() or int(a) not in want:
            continue
        icn[int(a)] = re.sub(r'\.(blp|tga)$', '', b.strip().lower()[len('interface/icons/'):])

# 4) 한글 이름: 게임 캐시 > item-ko > item-ko-fill > 영어
ko = {}
for line in open(os.path.join(repo, 'data/qdb/item-ko.txt'), encoding='utf-8'):
    f = line.rstrip('\n').split('|')
    if len(f) > 1 and f[0].isdigit():
        ko[int(f[0])] = f[1]
fill = os.path.join(repo, 'data/qdb/item-ko-fill.txt')
if os.path.exists(fill):
    for line in open(fill, encoding='utf-8'):
        f = line.rstrip('\n').split('|')
        if len(f) > 1 and f[0].isdigit() and not HAN.search(ko.get(int(f[0]), '')):
            ko[int(f[0])] = f[1]

out = []
for i, (en, q, sp) in base.items():
    nm = hotnm.get(i) or (ko.get(i) if HAN.search(ko.get(i, '')) else '') or ko.get(i) or en
    nm = (nm or '').replace('|', ' ').strip()
    if not nm:
        continue
    ic = icn.get(icf.get(i, 0), '')
    out.append(f"{i}|{nm}|{q}|{cls.get(i, -1)}|{sp}" + (f"|{ic}" if ic else ''))
out.sort(key=lambda l: int(l.split('|')[0]))
with open(os.path.join(repo, 'data/qdb/item-bag.txt'), 'w', encoding='utf-8') as f:
    f.write('\n'.join(out) + '\n')
print('items', len(out), 'game cache names', len(hotnm))
