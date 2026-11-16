"""게임 퀘스트 캐시(Cache/WDB/koKR/questcache.wdb)에서 퀘스트 레벨 · 최소 레벨 · 목표 글(한글)을 뽑아
data/qdb/quest-game.txt 에 더함 (번호|레벨|최소 레벨|목표 글). 이미 있던 줄은 남기고 새 것만 바꿈.

쓰는 법: python3 -I tools/qdb/gamecache.py <questcache.wdb>
- 게임 파일 자체는 저장소에 넣지 않음. 숫자와 목표 한 줄만 남김.
- 목표 글은 앱 퀘스트 이름(data/qdb/quests.jsonl)으로 제목 자리를 찾아, 바로 앞 비트 묶음의 길이로 정확히 자름.
- 캐시는 내 캐릭터가 게임에서 본 퀘스트만 있음 → 게임을 할수록 늘어남."""
import json, os, re, struct, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
OUT = os.path.join(ROOT, 'data', 'qdb', 'quest-game.txt')


def records(path):
    b = open(path, 'rb').read()
    if b[:4] != b'TSQW':
        raise SystemExit('questcache.wdb 가 아니에요: ' + path)
    o, out = 24, {}
    while o + 8 <= len(b):
        i, n = struct.unpack('<II', b[o:o + 8])
        if i == 0 and n == 0:
            break
        out[i] = b[o + 8:o + 8 + n]
        o += 8 + n
    return out


def bits(buf, p, n):
    """와우 비트 묶음: 바이트마다 높은 비트부터"""
    v = 0
    for k in range(n):
        by = buf[(p + k) >> 3]
        v = (v << 1) | ((by >> (7 - ((p + k) & 7))) & 1)
    return v


def objective(d, title):
    t = title.encode('utf-8')
    s = d.find(t)
    if s < 0:
        return None
    buf = d[max(0, s - 40):s]
    # 제목 길이(9비트)와 같은 값이 여러 자리에서 나올 수 있어, 문장으로 끝나는 후보 중 가장 짧은 것 (설명 글까지 붙는 것 막기)
    best = None
    for p in range(0, 8 * len(buf) - 21):
        if bits(buf, p, 9) != len(t):
            continue
        n = bits(buf, p + 9, 12)
        try:
            txt = d[s + len(t):s + len(t) + n].decode('utf-8')
        except UnicodeDecodeError:
            continue
        if n > 4 and re.search('[가-힣]', txt) and txt.rstrip().endswith(('.', '다', '요', '>')) and (best is None or len(txt) < len(best)):
            best = txt
    return best


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    names = {}
    for line in open(os.path.join(ROOT, 'data', 'qdb', 'quests.jsonl'), encoding='utf-8'):
        if line.strip():
            q = json.loads(line)
            names[q['id']] = q.get('n') or ''
    have = {}
    if os.path.exists(OUT):
        for line in open(OUT, encoding='utf-8'):
            if line.strip() and not line.startswith('#'):
                f = line.rstrip('\n').split('|', 3)
                have[int(f[0])] = f
    new = 0
    for i, d in records(sys.argv[1]).items():
        if len(d) < 32:
            continue
        v = struct.unpack('<8i', d[:32])
        if v[0] != i or not (0 < v[2] <= 63) or not (0 <= v[4] <= 63):
            continue
        ob = objective(d, names[i]) if names.get(i) else None
        ob = re.sub(r'[\r\n|]+', ' ', ob).strip() if ob else ''
        row = [str(i), str(v[2]), str(v[4]), ob]
        if have.get(i) != row:
            new += 1
        have[i] = row
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write('# 게임 퀘스트 캐시에서 확인한 값 (tools/qdb/gamecache.py) — 번호|퀘스트 레벨|최소 레벨|목표 글($1oa = 앱 글의 숫자로 채움)\n')
        for i in sorted(have):
            f.write('|'.join(have[i]) + '\n')
    print('퀘스트', len(have), '· 바뀌거나 새로', new)


if __name__ == '__main__':
    main()
