"""게임 핫픽스 캐시 기록(DBCache.bin) 한 줄을 WoWDBDefs .dbd 정의대로 풀기.

핫픽스 기록은 칸이 정의 순서대로 그대로 들어 있음: 정수는 <크기> 비트, 실수는 4바이트, 문자열은 0으로 끝남.
ID처럼 $noninline$ 표시가 붙은 칸은 기록 머리(recordId)에 있으므로 건너뜀.
"""
import re
import struct

FMT = {'32': 'i', 'u32': 'I', '16': 'h', 'u16': 'H', '8': 'b', 'u8': 'B', '64': 'q', 'u64': 'Q'}


def column_types(text):
    """COLUMNS 칸 → 'int' / 'float' / 'string' / 'locstring'"""
    out = {}
    sec = text.split('\n\n', 1)[0]
    for l in sec.split('\n')[1:]:
        m = re.match(r'(\w+)(?:<[^>]*>)?\s+(\w+)\??', l.strip())
        if m:
            out[m.group(2)] = m.group(1)
    return out


def layout(dbd_path, build):
    text = open(dbd_path, encoding='utf-8').read()
    types = column_types(text)
    lines = text.split('\n')
    rel = []
    i = next(k for k, l in enumerate(lines) if l.startswith('BUILD') and build in l)
    out = []
    for l in lines[i + 1:]:
        if not l.strip():
            break
        if l.startswith(('BUILD', 'COMMENT', 'LAYOUT')):
            continue
        m = re.match(r'(\$[^$]*\$)?([A-Za-z0-9_]+)(<(u?)(\d+)>)?(\[(\d+)\])?', l)
        ann, name, _, u, bits, _, arr = m.groups()
        t = types.get(name, 'int')
        if ann and 'noninline' in ann:
            if 'relation' in ann:  # 핫픽스 기록에선 맨 끝에 붙어 있음 (예: ItemXItemEffect.ItemID, SpellEffect.SpellID)
                rel.append((name, t, (u or '') + (bits or ''), 1))
            continue
        out.append((name, t, (u or '') + (bits or ''), int(arr or 1)))
    return out + rel


def decode(data, L):
    o = 0
    r = {}
    for name, t, size, n in L:
        vals = []
        for _ in range(n):
            if t in ('string', 'locstring'):
                e = data.index(b'\0', o)
                vals.append(data[o:e].decode('utf-8', 'replace'))
                o = e + 1
            elif t == 'float':
                vals.append(struct.unpack_from('<f', data, o)[0])
                o += 4
            else:
                f = FMT[size or '32']
                vals.append(struct.unpack_from('<' + f, data, o)[0])
                o += struct.calcsize(f)
        r[name] = vals if n > 1 else vals[0]
    r['_left'] = len(data) - o
    return r
