"""게임 캐시 장비 기록 → forg·클래식 자료에 없는 장비의 기본 칸 (data/qdb/items-cache.txt)

    python3 -I tools/itemcache/item_rows.py <game_items.py 출력 jsonl> [data/qdb/items-cache.txt]

app/build.py가 forg·wowf.io 어디에도 없어 앱에서 빠지던 포에버 장비를 이 기록과 얻는 곳
(QuestieDB 드랍·상인 item-drops.txt · 퀘스트 보상 item-equip.txt · wythic 던전 보스 드랍 · 던전 퀘스트 보상 · forg 퀘스트 보상)으로 채움.
(BiS QA 2026-11-25: 가이드 대안 32개가 앱에 없었음 — 스칼로맨스 「검은 투구」·「영혼매듭 외투」, 검은바위 나락 「양조술사의 취침모자」 등)

줄 꼴: 번호|장착 부위(InventoryType)|종류.세부|등급|요구 레벨|아이템 레벨|능력치|방어도|초당 공격력|한글 이름|자료(h=포에버 핫픽스, c=기본)|착용 직업(AllowableClass 비트, 모두면 빈칸)
- 고급(2) 이상 · 한글 이름 · 아이템 레벨 70 이하 · 요구 레벨 60 이하인 장비만 (다른 판 서버·시험용 템을 거름)
- forg(data/forg/items.txt)·클래식 보충(data/qdb/items-extra.txt)에 이미 있는 번호는 뺌
게임 파일 자체는 저장소에 넣지 않고 계산한 숫자만 씀 (game_items.py와 같은 원칙)
"""
import json
import os
import re
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
EQUIP = {1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 20, 21, 22, 23, 25, 26, 28}


def known_ids():
    ids = set()
    for p in ('data/forg/items.txt', 'data/qdb/items-extra.txt'):
        fp = os.path.join(ROOT, p)
        if os.path.exists(fp):
            for line in open(fp, encoding='utf-8'):
                f = line.split('|', 1)[0]
                if f.isdigit():
                    ids.add(int(f))
    return ids


def main():
    src = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, 'data', 'qdb', 'items-cache.txt')
    have = known_ids()
    rows = []
    for line in open(src, encoding='utf-8'):
        if not line.strip():
            continue
        o = json.loads(line)
        nm = o.get('nm') or ''
        nm = (','.join(nm) if isinstance(nm, list) else nm).strip()  # 이름에 쉼표가 있으면 캐시 도구가 목록으로 나눔
        if o['id'] in have or o.get('inv') not in EQUIP or (o.get('q') or 0) < 2:
            continue
        if not re.search('[가-힣]', nm) or (o.get('ilvl') or 0) > 70 or (o.get('req') or 0) > 60:
            continue
        st = ' '.join('%s%s' % (k, '%g' % v) for k, v in (o.get('st') or {}).items() if v)
        rows.append('|'.join(str(x) for x in (
            o['id'], o['inv'], '%d.%d' % (o.get('cls') or 0, o.get('sub') or 0), o['q'], o.get('req') or 0, o.get('ilvl') or 0,
            st, o.get('armor') or '', '%g' % o['dps'] if o.get('dps') else '', nm.replace('|', '/'), 'h' if o.get('src') == 'hot' else 'c', o.get('acl') or '')))
    rows.sort(key=lambda r: int(r.split('|', 1)[0]))
    with open(out, 'w', encoding='utf-8') as f:
        f.write('# 게임 캐시 장비 중 forg·클래식 자료에 없는 것 (tools/itemcache/item_rows.py): 번호|부위|종류.세부|등급|요구 레벨|아이템 레벨|능력치|방어도|초당 공격력|이름|h·c|직업 비트\n')
        f.write('\n'.join(rows) + '\n')
    print('장비 기본 칸', len(rows), '→', out)


if __name__ == '__main__':
    main()
