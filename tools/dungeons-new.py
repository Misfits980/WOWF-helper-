#!/usr/bin/env python3
"""포에버 신규 던전 5곳(가라앉은 도시·크롤도크 보루·알카즈 감옥·검은아귀 요새·구체자의 정원)을
data/qdb 자료(items-wowf.jsonl 드랍, quests.jsonl 퀘스트, forg rewards.jsonl 보상)에서 모아
data/qdb/dungeons-new.txt 를 만든다. 레벨·위치: Wowhead WoW Forever 던전 개요(2026-11-13 확인)."""
import json, re, pathlib, collections
ROOT = pathlib.Path(__file__).resolve().parent.parent
Q = ROOT / 'data' / 'qdb'; F = ROOT / 'data' / 'forg'
NEW = [  # slug, 한글, 영문, 지역, 권장, 범위, 퀘스트 글 찾는 말
    ('drowned-city', '가라앉은 도시', 'The Drowned City', '가시덤불 골짜기', 37, '35–40', r"Drowned City|가라앉은 도시"),
    ('kroldok-stronghold', '크롤도크 보루', "Krol'dok Stronghold", '리버글레이드', 42, '40–45', r"Krol'dok Stronghold|크롤도크 보루"),
    ('alcaz-prison', '알카즈 감옥', 'Alcaz Prison', '먼지진흙 습지대', 50, '48–53', r"Alcaz Prison|알카즈 감옥"),
    ('blackmaw-hold', '검은아귀 요새', 'Blackmaw Hold', '아즈샤라', 57, '55–60', r"Blackmaw Hold|검은아귀 요새"),
    ('shapers-terrace', '구체자의 정원', "Shaper's Terrace", '운고로 분화구', 59, '58–60', r"Shaper'?s Terrace|구체자의 정원"),
]
boss = collections.defaultdict(dict); items = collections.defaultdict(set)
for l in (Q / 'items-wowf.jsonl').read_text(encoding='utf-8').splitlines():
    if not l: continue
    o = json.loads(l)
    for lab, href in o.get('src') or []:
        m = re.search(r'/dungeons/([a-z-]+)#([a-z0-9-]+)', href)
        if not m: continue
        slug, bs = m.groups(); nm = lab.split(' · ', 1)[-1]
        if nm != '일반 몹': boss[slug].setdefault(bs, nm.replace('"', ''))
        items[slug].add(o['id'])
RW = collections.defaultdict(list); QI = collections.defaultdict(list)
for l in (Q / 'items-wowf.jsonl').read_text(encoding='utf-8').splitlines():
    if not l: continue
    o = json.loads(l)
    for lab, href in o.get('src') or []:
        m = re.search(r'/quests/(\d+)', href)
        if m and o['id'] not in QI[int(m.group(1))]: QI[int(m.group(1))].append(o['id'])
for l in (F / 'rewards.jsonl').read_text(encoding='utf-8').splitlines():
    if l.strip():
        o = json.loads(l); RW[o['id']] = [c[0] for c in o.get('ch') or []]
for k, v in QI.items():
    if not RW.get(k): RW[k] = v
# wowf.io 보스 순서·퀘스트(진영) — data/qdb/dungeons-wowf.txt
WB = collections.defaultdict(list); WR = collections.defaultdict(list); WQ = collections.defaultdict(list); WY = {}
for l in (Q / 'dungeons-wowf.txt').read_text(encoding='utf-8').splitlines():
    if not l or l.startswith('#'): continue
    f = l.split('|')
    if f[0] == 'B': WB[f[1]].append((f[3], f[4]))
    elif f[0] == 'R': WR[f[1]].append(f[2])
    elif f[0] == 'Q': WQ[f[1]].append(f[2:])
    elif f[0] == 'W': WY[f[1]] = f[2]
QK = {}
for l in (Q / 'quests.jsonl').read_text(encoding='utf-8').splitlines():
    if l: o = json.loads(l); QK[o['id']] = o
SIDE = {'A': 'alliance', 'H': 'horde', 'B': 'both'}
slugify = lambda x: re.sub(r'[^a-z0-9]+', '-', x.lower()).strip('-')
quests = collections.defaultdict(list)
for l in (Q / 'quests.jsonl').read_text(encoding='utf-8').splitlines():
    if not l: continue
    o = json.loads(l); s = (o.get('o') or '') + ' ' + o.get('n', '')
    for slug, ko, en, loc, fit, rg, pat in NEW:
        if re.search(pat, s):
            g = o.get('g') or []
            start = '%s · %s %s' % (g[0], g[1], (g[2] or '').replace(',', ', ')) if len(g) > 2 else ''
            inside = bool(re.search(pat, g[1] if len(g) > 1 else ''))
            quests[slug].append('|'.join(map(str, ['Q', slug, o['id'], 'both', o.get('lv') or fit, o.get('m') or 0, o['n'], '', start, 1 if inside else 0, ','.join(map(str, RW.get(o['id'], []))), '', '1' if len(RW.get(o['id'], [])) > 1 else '', ''])))
            break
out = []
for slug, ko, en, loc, fit, rg, pat in NEW:
    names = {}  # 드랍에서 찾은 보스 이름 → slug
    for bs, nm in boss[slug].items(): names[nm] = bs
    bl = []
    for k2, e2 in WB[slug]:
        bl.append('%s=%s' % (names.get(k2) or slugify(e2), k2))
    for r2 in WR[slug]:
        bl.append('%s=%s' % (names.get(r2) or 'mob-' + slugify(r2), r2))
    known = set(x.split('=')[1] for x in bl)
    bl += ['%s=%s' % (bs, nm) for bs, nm in boss[slug].items() if nm not in known]
    ql = []
    for qid, sd, lv, mn, nm in WQ[slug]:
        o = QK.get(int(qid)) or {}; g = o.get('g') or []
        start = '%s · %s %s' % (g[0], g[1], (g[2] or '').replace(',', ', ')) if len(g) > 2 and g[2] else ''
        nm2 = o.get('n') if o.get('n') and not re.search('[A-Za-z]{3}', o.get('n')) else nm
        rw = RW.get(int(qid), [])
        ql.append('|'.join(map(str, ['Q', slug, qid, SIDE[sd], lv or fit, mn or 0, nm2, '', start, 0, ','.join(map(str, rw)), '', '1' if len(rw) > 1 else '', ''])))
    out.append('D|%s|%s|%s|%s|%d|%s|%d,%d,%d|soon|%s' % (slug, ko, en, loc, fit, rg, len(WB[slug]), len(items[slug]), len(ql), WY.get(slug, '')))
    out.append('B|%s|%s' % (slug, ';'.join(bl)))
    out += ql
(Q / 'dungeons-new.txt').write_text('\n'.join(out) + '\n', encoding='utf-8')
print('\n'.join(out))
