"""애드온 v3.6 「/wfh 아이템」이 남긴 저장 파일(WTF/Account/<계정>/SavedVariables/WowfHelper.lua) → data/qdb/items-addon.jsonl

쓰는 법: python3 -I tools/itemcache/addon_items.py <WowfHelper.lua> data/qdb/items-addon.jsonl

애드온이 아이템 하나마다 남기는 표: { 이름, 등급(0~5), 아이템 레벨, 착용 레벨, 부위(INVTYPE_…), 아이콘 번호,
  "게임 능력치 이름=값,…"(GetItemStats), 툴팁 줄… }. 툴팁 줄 첫 글자는 색(g 초록 효과 · y 노랑 · r 빨강 · h 회색 · w 흰색 · o 그 밖),
  오른쪽 글(예: 「속도 2.60」)은 탭 뒤에 붙음.
저장 파일은 게임이 쓴 Lua 표라 여기서 직접 읽음 (Lua 실행 없음).
"""
import json
import re
import sys


class P:
    def __init__(self, s):
        self.s, self.i, self.n = s, 0, len(s)

    def ws(self):
        s, n = self.s, self.n
        while self.i < n:
            c = s[self.i]
            if c in ' \t\r\n':
                self.i += 1
            elif s.startswith('--', self.i):
                j = s.find('\n', self.i)
                self.i = n if j < 0 else j + 1
            else:
                break

    def string(self):
        q = self.s[self.i]
        self.i += 1
        out = []
        s = self.s
        while True:
            c = s[self.i]
            if c == q:
                self.i += 1
                return ''.join(out)
            if c == '\\':
                d = s[self.i + 1]
                if d.isdigit():
                    m = re.match(r'\d{1,3}', s[self.i + 1:self.i + 4])
                    out.append(chr(int(m.group(0))))
                    self.i += 1 + len(m.group(0))
                    continue
                out.append({'n': '\n', 't': '\t', 'r': '\r', '\\': '\\', '"': '"', "'": "'", '\n': '\n', 'a': '\a', 'b': '\b'}.get(d, d))
                self.i += 2
                continue
            out.append(c)
            self.i += 1

    def value(self):
        self.ws()
        c = self.s[self.i]
        if c == '{':
            return self.table()
        if c in '"\'':
            return self.string()
        m = re.compile(r'-?(?:0x[0-9a-fA-F]+|\d+\.?\d*(?:[eE][-+]?\d+)?|\.\d+)|true|false|nil|-?inf|nan').match(self.s, self.i)
        if not m:
            raise ValueError('읽을 수 없는 값 %r' % self.s[self.i:self.i + 30])
        self.i = m.end()
        t = m.group(0)
        if t == 'true':
            return True
        if t == 'false':
            return False
        if t == 'nil':
            return None
        if t.startswith(('0x', '-0x')):
            return int(t, 16)
        try:
            return int(t)
        except ValueError:
            return float(t)

    def table(self):
        self.i += 1
        arr, d = [], {}
        while True:
            self.ws()
            if self.s[self.i] == '}':
                self.i += 1
                break
            if self.s[self.i] == '[':
                self.i += 1
                k = self.value()
                self.ws()
                assert self.s[self.i] == ']'
                self.i += 1
                self.ws()
                assert self.s[self.i] == '='
                self.i += 1
                d[k] = self.value()
            else:
                m = re.compile(r'[A-Za-z_]\w*\s*=').match(self.s, self.i)
                if m:
                    k = m.group(0).rstrip('= \t')
                    self.i = m.end()
                    d[k] = self.value()
                else:
                    arr.append(self.value())
            self.ws()
            if self.i < self.n and self.s[self.i] in ',;':
                self.i += 1
        if arr and not d:
            return arr
        for i, v in enumerate(arr):
            d[i + 1] = v
        return d


def read_saved(text):
    """「이름 = 값」이 이어진 저장 파일 → {이름: 값}"""
    p = P(text)
    out = {}
    while True:
        p.ws()
        if p.i >= p.n:
            return out
        m = re.compile(r'([A-Za-z_]\w*)\s*=').match(text, p.i)
        if not m:
            raise ValueError('저장 파일 모양이 달라요: %r' % text[p.i:p.i + 40])
        p.i = m.end()
        out[m.group(1)] = p.value()


def as_list(t):
    if isinstance(t, list):
        return t
    if isinstance(t, dict):
        return [t[k] for k in sorted(k for k in t if isinstance(k, int))]
    return []


def convert(saved):
    acc = saved.get('WowfHelperAcc') or {}
    it = acc.get('it') or {}
    miss = sorted(int(k) for k in (acc.get('itMiss') or {}))
    rows = []
    for k, v in (it.items() if isinstance(it, dict) else enumerate(it, 1)):
        r = as_list(v)
        if len(r) < 7 or not isinstance(r[0], str):
            continue
        lines, col = [], []
        for x in r[7:]:
            if not isinstance(x, str) or not x:
                continue
            c, body = x[0], x[1:]
            left, _, right = body.partition('\t')
            lines.append((left + (' ' + right if right else '')).strip())
            col.append(c)
        gs = {}
        for tok in (r[6] or '').split(','):
            a, _, b = tok.partition('=')
            if a and b:
                try:
                    gs[a] = float(b)
                except ValueError:
                    pass
        rows.append({'id': int(k), 'nm': r[0], 'q': r[1], 'ilvl': r[2], 'req': r[3], 'loc': r[4], 'ic': r[5], 'gs': gs, 'lines': lines, 'col': ''.join(col)})
    rows.sort(key=lambda o: o['id'])
    return rows, miss


def main(src, dst):
    saved = read_saved(open(src, encoding='utf-8', errors='replace').read())
    rows, miss = convert(saved)
    with open(dst, 'w', encoding='utf-8') as f:
        for o in rows:
            f.write(json.dumps(o, ensure_ascii=False, separators=(',', ':')) + '\n')
    print('애드온이 읽은 아이템', len(rows), '· 못 찾음', len(miss))


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
