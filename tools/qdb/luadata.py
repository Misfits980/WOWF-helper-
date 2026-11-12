"""Lua 표 글자(데이터)를 파이썬 값으로 읽는 작은 해석기.
코드는 실행하지 않는다. 표·문자열·숫자·nil·true/false와 `이름.이름` 상수, `+`, `..`만 읽는다.
모르는 이름이나 함수 호출은 None으로 둔다."""
import re

TOK = re.compile(r'''
  (?P<ws>\s+)
 |(?P<lcom>--\[(?P<leq>=*)\[.*?\](?P=leq)\])
 |(?P<com>--[^\n]*)
 |(?P<lstr>\[(?P<seq>=*)\[.*?\](?P=seq)\])
 |(?P<str>"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')
 |(?P<num>0x[0-9a-fA-F]+|\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?)
 |(?P<name>[A-Za-z_][A-Za-z0-9_]*)
 |(?P<op>\.\.\.|\.\.|==|~=|<=|>=|[{}\[\]=,;.+\-*/()#:<>%^])
''', re.S | re.X)

ESC = {'n': '\n', 't': '\t', 'r': '\r', '\\': '\\', '"': '"', "'": "'", 'a': '\a', 'b': '\b', 'f': '\f', 'v': '\v', '\n': '\n'}


def unq(s):
    body = s[1:-1]
    out = []
    i = 0
    raw = bytearray()
    while i < len(body):
        c = body[i]
        if c == '\\' and i + 1 < len(body):
            d = body[i + 1]
            if d.isdigit():
                m = re.match(r'\d{1,3}', body[i + 1:])
                raw += bytes([int(m.group(0)) & 255])
                i += 1 + len(m.group(0))
                continue
            raw += ESC.get(d, d).encode()
            i += 2
            continue
        raw += c.encode()
        i += 1
    return raw.decode('utf-8', 'replace')


def tokenize(src):
    toks = []
    pos = 0
    n = len(src)
    while pos < n:
        m = TOK.match(src, pos)
        if not m:
            raise SyntaxError('알 수 없는 글자 %r at %d' % (src[pos:pos + 20], pos))
        pos = m.end()
        k = m.lastgroup
        if k in ('ws', 'com', 'lcom'):
            continue
        if k in ('leq', 'seq'):
            k = 'lstr' if m.group('lstr') else 'lcom'
            if k == 'lcom':
                continue
        v = m.group(k)
        if k == 'lstr':
            eq = m.group('seq')
            body = v[2 + len(eq):-(2 + len(eq))]
            if body.startswith('\n'):
                body = body[1:]
            toks.append(('str', body, m.start()))
        elif k == 'str':
            toks.append(('str', unq(v), m.start()))
        elif k == 'num':
            toks.append(('num', int(v, 16) if v.startswith('0x') else (float(v) if re.search(r'[.eE]', v) else int(v)), m.start()))
        elif k == 'name':
            toks.append(('kw', v, m.start()) if v in ('nil', 'true', 'false', 'function', 'local', 'return', 'end', 'and', 'or', 'not') else ('name', v, m.start()))
        else:
            toks.append(('op', v, m.start()))
    toks.append(('eof', None, n))
    return toks


class Parser:
    def __init__(self, toks, env=None):
        self.t = toks
        self.i = 0
        self.env = env or (lambda path: None)

    def peek(self, k=0):
        return self.t[self.i + k]

    def take(self):
        tk = self.t[self.i]
        self.i += 1
        return tk

    def expect(self, v):
        tk = self.take()
        if tk[1] != v:
            raise SyntaxError('%r 기대, %r 받음 @%d' % (v, tk[1], tk[2]))

    def expr(self):
        v = self.term()
        while True:
            tk = self.peek()
            if tk[0] == 'op' and tk[1] in ('+', '-', '*', '..'):
                self.take()
                r = self.term()
                if tk[1] == '..':
                    v = (v or '') + (r or '') if isinstance(v, str) or isinstance(r, str) else None
                elif isinstance(v, (int, float)) and isinstance(r, (int, float)):
                    v = v + r if tk[1] == '+' else v - r if tk[1] == '-' else v * r
                else:
                    v = None
            elif tk[0] == 'kw' and tk[1] in ('or', 'and'):
                self.take()
                r = self.term()
                v = (v or r) if tk[1] == 'or' else (v and r)
            else:
                return v

    def term(self):
        tk = self.take()
        k, v = tk[0], tk[1]
        if k in ('num', 'str'):
            return v
        if k == 'kw':
            if v == 'nil':
                return None
            if v == 'true':
                return True
            if v == 'false':
                return False
            if v == 'not':
                return not self.term()
            raise SyntaxError('뜻밖의 %s @%d' % (v, tk[2]))
        if k == 'op':
            if v == '{':
                return self.table()
            if v == '-':
                x = self.term()
                return -x if isinstance(x, (int, float)) else None
            if v == '(':
                x = self.expr()
                self.expect(')')
                return self.suffix(x, None)
            if v == '#':
                x = self.term()
                return len(x) if isinstance(x, (list, dict, str)) else None
            raise SyntaxError('뜻밖의 %s @%d' % (v, tk[2]))
        if k == 'name':
            path = [v]
            while self.peek()[1] == '.' and self.peek(1)[0] == 'name':
                self.take()
                path.append(self.take()[1])
            return self.suffix(self.env(path), path)
        raise SyntaxError('뜻밖의 끝')

    def suffix(self, val, path):
        while True:
            tk = self.peek()
            if tk[1] == '[':
                self.take()
                key = self.expr()
                self.expect(']')
                val = val.get(key) if isinstance(val, dict) else (val[key - 1] if isinstance(val, list) and isinstance(key, int) and 0 < key <= len(val) else None)
            elif tk[1] in ('(',) or tk[1] == ':' or tk[0] == 'str' or tk[1] == '{':
                if tk[1] == ':':
                    self.take()
                    self.take()
                if self.peek()[1] == '(':
                    self.take()
                    args = []
                    while self.peek()[1] != ')':
                        args.append(self.expr())
                        if self.peek()[1] == ',':
                            self.take()
                    self.take()
                elif self.peek()[1] == '{':
                    self.take()
                    args = [self.table()]
                else:
                    args = [self.take()[1]]
                # 함수는 부르지 않는다. l10n("x")처럼 글 하나면 그 글을 돌려준다.
                val = args[0] if len(args) == 1 and isinstance(args[0], str) else None
            else:
                return val

    def table(self):
        arr = {}
        n = 1
        while True:
            tk = self.peek()
            if tk[1] == '}':
                self.take()
                break
            if tk[1] == '[':
                self.take()
                key = self.expr()
                self.expect(']')
                self.expect('=')
                arr[key] = self.expr()
            elif tk[0] == 'name' and self.peek(1)[1] == '=':
                key = self.take()[1]
                self.take()
                arr[key] = self.expr()
            else:
                arr[n] = self.expr()
                n += 1
            if self.peek()[1] in (',', ';'):
                self.take()
        return arr


def parse_expr(src, env=None):
    return Parser(tokenize(src), env).expr()


def arr(t):
    """{1=..,2=..} 모양 표를 리스트로 (nil 빈칸은 None)."""
    if not isinstance(t, dict):
        return t
    if not t:
        return []
    ks = [k for k in t if isinstance(k, int)]
    if len(ks) != len(t):
        return t
    m = max(ks)
    return [t.get(i) for i in range(1, m + 1)]


def find_return_table(src, after=None):
    """`function X:Load()` 다음 첫 `return {` 의 표를 위치로 찾는다."""
    start = 0
    if after:
        m = re.search(after, src)
        if not m:
            return None, None
        start = m.end()
    m = re.compile(r'\breturn\s*\{').search(src, start)
    if not m:
        return None, None
    return m.end() - 1, src
