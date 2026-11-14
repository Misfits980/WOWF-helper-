"""QuestieDB(와우 포에버) 자료 → 앱용 퀘스트 자료.
쓰는 법: python3 tools/qdb/import.py <QuestieDB 폴더> <Questie 폴더(지역 이름 번역)>
결과에 data/qdb/ko-extra.jsonl(wowf.io 한글)이 있으면 영어 이름 대신 씀
QuestieDB의 Lua 파일은 실행하지 않고 데이터로만 읽는다(tools/qdb/luadata.py).
결과: data/qdb/quests.jsonl (얼라이언스가 받을 수 있는 퀘스트 전부)"""
import json, os, re, sys, glob
sys.path.insert(0, os.path.dirname(__file__))
from luadata import tokenize, Parser, arr

QDB = sys.argv[1] if len(sys.argv) > 1 else '/tmp/qdb'
QZ = sys.argv[2] if len(sys.argv) > 2 else '/tmp/qzroot'
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'qdb')
os.makedirs(OUT, exist_ok=True)


def rd(p):
    return open(p, encoding='utf-8', errors='replace').read()


def parse_at(src, pos, env=None):
    p = Parser(tokenize(src[pos:]), env)
    return p.expr()


def data_table(path):
    s = rd(path)
    m = re.search(r'\[(=*)\[\s*return\s*', s)
    end = s.rfind(']' + m.group(1) + ']')
    return parse_at(s[:end], m.end())


# ---------- 상수 ----------
zsrc = rd(f'{QDB}/src/corrections/enum/zones.lua')
ZONE_ID = {}
ZONE_GROUP = {}
grp = ''
for line in zsrc.splitlines():
    m = re.match(r'\s*--\s*(.+)', line)
    if m and ':' in m.group(1):
        grp = m.group(1)
    m = re.match(r'\s*([A-Z0-9_]+)\s*=\s*(\d+)', line)
    if m:
        ZONE_ID[m.group(1)] = int(m.group(2))
        ZONE_GROUP.setdefault(int(m.group(2)), grp)
qsrc = rd(f'{QDB}/src/corrections/enum/quests.lua')
m = re.search(r'constants\.sortKeys\s*=\s*\{', qsrc)
SORT = parse_at(qsrc, m.end() - 1)
SORT = {k: v for k, v in SORT.items() if isinstance(k, str)}
RACE = {'NONE': 0, 'HUMAN': 1, 'ORC': 2, 'DWARF': 4, 'NIGHT_ELF': 8, 'UNDEAD': 16, 'TAUREN': 32, 'GNOME': 64, 'TROLL': 128,
        'SKYBORNE_ALLIANCE': 2**32, 'SKYBORNE_HORDE': 2**33}
RACE['ALL_ALLIANCE'] = 1 + 4 + 8 + 64 + 2**32
RACE['ALL_HORDE'] = 2 + 16 + 32 + 128 + 2**33
CLASS = {'NONE': 0, 'WARRIOR': 1, 'PALADIN': 2, 'HUNTER': 4, 'ROGUE': 8, 'PRIEST': 16, 'SHAMAN': 64, 'MAGE': 128, 'WARLOCK': 256, 'DRUID': 1024, 'ALL_CLASSES': 1503}
ALLY = RACE['ALL_ALLIANCE']


def keys_of(path, name):
    s = rd(path)
    m = re.search(name + r'\s*=\s*\{', s)
    t = parse_at(s, m.end() - 1)
    return {k: v for k, v in t.items() if isinstance(k, str)}


QK = keys_of(f'{QDB}/data/Forever/foreverQuestDB.lua', r'QuestieDB\.questKeys')
NK = keys_of(f'{QDB}/data/Forever/foreverNpcDB.lua', r'QuestieDB\.npcKeys')
IK = keys_of(f'{QDB}/data/Forever/foreverItemDB.lua', r'QuestieDB\.itemKeys')
OK = keys_of(f'{QDB}/data/Forever/foreverObjectDB.lua', r'QuestieDB\.objectKeys')


def env(path):
    a = path[0]
    b = path[-1] if len(path) > 1 else None
    kmap = {'questKeys': QK, 'npcKeys': NK, 'itemKeys': IK, 'objectKeys': OK}
    if a in kmap and b:
        K = kmap[a]
        if b in K:
            return K[b]
        if b.endswith('_add') and b[:-4] in K:
            return K[b[:-4]] + 1000
        if b.endswith('_remove') and b[:-7] in K:
            return K[b[:-7]] - 1000
        return None
    if a in ('raceIDs', 'raceKeys'):
        return RACE.get(b)
    if a in ('classIDs', 'classKeys'):
        return CLASS.get(b)
    if a == 'zoneIDs':
        return ZONE_ID.get(b)
    if a == 'sortKeys':
        return SORT.get(b)
    return None


def corr_tables(path):
    """보정 파일 안의 모든 `return {` 표(Load 등)를 읽는다."""
    s = rd(path)
    out = []
    for m in re.finditer(r'function\s+\w+[:.](\w+)\s*\(\s*\)', s):
        fn = m.group(1)
        if fn not in ('Load', 'LoadFactionFixes'):
            continue
        r = re.compile(r'\breturn\s*\{').search(s, m.end())
        if not r:
            continue
        try:
            out.append(parse_at(s, r.end() - 1, env))
        except Exception as e:
            print('  읽기 실패', os.path.basename(path), fn, str(e)[:80])
    return out


def merge_list(a, b):
    a = arr(a) or []
    b = arr(b) or []
    a = list(a)
    for x in b:
        if x not in a:
            a.append(x)
    return a


def apply(db, corr, nfields):
    n = 0
    for cid, fix in corr.items():
        if not isinstance(cid, int) or not isinstance(fix, dict):
            continue
        row = db.setdefault(cid, {})
        for k, v in fix.items():
            if not isinstance(k, int):
                continue
            if k > 1000:
                base = k - 1000
                cur = row.get(base)
                if isinstance(v, dict) and all(isinstance(x, int) for x in v.keys()) and v and isinstance(next(iter(v.values()), None), dict):
                    # {{npc..},{obj..},{item..}} 모양
                    cur = arr(cur) or []
                    va = arr(v)
                    cur = list(cur) + [None] * (len(va) - len(cur))
                    for i, sub in enumerate(va):
                        if sub is not None:
                            cur[i] = merge_list(cur[i], sub)
                    row[base] = cur
                else:
                    row[base] = merge_list(cur, v)
            elif k < 0:
                continue
            else:
                row[k] = v
        n += 1
    return n


def load_entity(kind, dbfile, corr_files):
    print(kind, '읽는 중…')
    t = data_table(f'{QDB}/data/Forever/{dbfile}')
    db = {k: dict(enumerate(arr(v) or [], 1)) for k, v in t.items() if isinstance(k, int)}
    for f in corr_files:
        p = f'{QDB}/src/corrections/Forever/{f}'
        if not os.path.exists(p):
            continue
        tot = 0
        for c in corr_tables(p):
            tot += apply(db, c, 0)
        print('  보정', f, tot)
    print(' ', kind, len(db))
    return db


QUEST = load_entity('quest', 'foreverQuestDB.lua', ['generated/foreverBaseQuest.lua', 'traces/foreverQuestTraces.lua', 'foreverQuestFixes.lua'])
NPC = load_entity('npc', 'foreverNpcDB.lua', ['generated/foreverBaseNpc.lua', 'traces/foreverNpcTraces.lua', 'foreverNPCFixes.lua'])
ITEM = load_entity('item', 'foreverItemDB.lua', ['generated/foreverBaseItem.lua', 'traces/foreverItemTraces.lua', 'foreverItemFixes.lua'])
OBJ = load_entity('object', 'foreverObjectDB.lua', ['generated/foreverBaseObject.lua', 'traces/foreverObjectTraces.lua', 'foreverObjectFixes.lua'])


# ---------- 한국어 ----------
def lookup(kind):
    d = {}
    for p in (f'{QDB}/l10n/Forever/{kind}/koKR.lua', f'{QDB}/l10n/Forever/traces/{kind}/koKR.lua'):
        if os.path.exists(p):
            t = data_table(p)
            for k, v in t.items():
                if isinstance(k, int):
                    d[k] = v
    return d


KQ = lookup('lookupQuests')
KN = lookup('lookupNpcs')
KI = lookup('lookupItems')
KO = lookup('lookupObjects')
print('한국어', len(KQ), len(KN), len(KI), len(KO))

# 지역 이름: 영어 → 한국어
ZKO = {}
for f in glob.glob(f'{QZ}/Localization/Translations/Zones/*.lua'):
    s = rd(f)
    for m in re.finditer(r'\[\s*"((?:\\.|[^"])+)"\s*\]\s*=\s*\{(.*?)\n\s*\}', s, re.S):
        k = re.search(r'\["koKR"\]\s*=\s*"((?:\\.|[^"])*)"', m.group(2))
        if k:
            ZKO[m.group(1)] = k.group(1)
ZEN = {}
zl = rd(f'{QZ}/Localization/lookups/lookupZones.lua')
zl = zl[zl.find('l10n.zoneLookup = {'):]
for m in re.finditer(r'\[(\d+)\]\s*=\s*"((?:\\.|[^"])+)"', zl):
    ZEN.setdefault(int(m.group(1)), m.group(2))
sub = rd(f'{QDB}/support/Forever/Zones/subZoneToParentZone.lua')
PARENT = {int(a): int(b) for a, b in re.findall(r'\[(\d+)\]\s*=\s*(\d+)', sub)}
dsrc = rd(f'{QDB}/support/Forever/Zones/dungeons.lua')
DUNGEON = {}
for m in re.finditer(r'\[(\d+)\]\s*=\s*\{"((?:\\.|[^"])+)",(\{[\d,]*\}|nil),(\d+)', dsrc):
    did = int(m.group(1))
    DUNGEON[did] = m.group(2)
    if m.group(3) != 'nil':
        for a in re.findall(r'\d+', m.group(3)):
            PARENT.setdefault(int(a), did)
SYM = {v: k for k, v in ZONE_ID.items()}


def sym_en(z):
    s = SYM.get(z)
    return s.replace('_', ' ').title() if s else None


SORT_KO = {}
for k, v in SORT.items():
    SORT_KO[v] = k
CLASS_SORT = {'WARRIOR': '전사', 'PALADIN': '성기사', 'HUNTER': '사냥꾼', 'ROGUE': '도적', 'PRIEST': '사제', 'SHAMAN': '주술사', 'MAGE': '마법사', 'WARLOCK': '흑마법사', 'DRUID': '드루이드'}


def zone_name(z):
    if z is None:
        return None, None
    if z < 0:
        k = SORT_KO.get(z, '')
        if k in CLASS_SORT:
            return CLASS_SORT[k] + ' 직업', '직업'
        return {'FISHING': '낚시', 'COOKING': '요리', 'FIRST_AID': '응급치료', 'ALCHEMY': '연금술', 'BLACKSMITHING': '대장기술', 'ENGINEERING': '기계공학', 'HERBALISM': '약초채집', 'LEATHERWORKING': '가죽세공', 'TAILORING': '재봉술', 'ENCHANTING': '마법부여', 'MINING': '채광', 'SKINNING': '무두질'}.get(k, '기타 (' + k.replace('_', ' ').lower() + ')'), '기타'
    zz = z
    seen = 0
    while zz in PARENT and seen < 4 and zz not in DUNGEON:
        zz = PARENT[zz]
        seen += 1
    en = DUNGEON.get(zz) or ZEN.get(zz) or sym_en(zz)
    ko = ZKO.get(en, en)
    g = ZONE_GROUP.get(zz, '') or ZONE_GROUP.get(z, '')
    if zz in DUNGEON or 'dungeon' in g.lower() or 'instance' in g.lower():
        cont = '던전'
    elif 'Kalimdor' in g or 'Hyjal' in g or 'Darkspear' in g:
        cont = '칼림도어'
    elif 'Eastern Kingdoms' in g:
        cont = '동부 왕국'
    elif 'Zephras' in g:
        cont = '제프라스 섬'
    elif 'Riverglades' in g:
        cont = '동부 왕국'  # 강물터(리버글레이드)는 동부 왕국
    else:
        cont = '기타'
    return ko, cont


def ko_npc(i):
    v = KN.get(i)
    if isinstance(v, dict):
        v = arr(v)
    if isinstance(v, list) and v and v[0]:
        return v[0]
    r = NPC.get(i)
    return r.get(NK['name']) if r else None


def ko_item(i):
    v = KI.get(i)
    if isinstance(v, str):
        return v
    r = ITEM.get(i)
    return r.get(IK['name']) if r else None


def ko_obj(i):
    v = KO.get(i)
    if isinstance(v, dict):
        v = arr(v)
    if isinstance(v, list) and v:
        v = v[0]
    if isinstance(v, str):
        return v
    r = OBJ.get(i)
    return r.get(OK['name']) if r else None


def first_spawn(sp):
    if not isinstance(sp, dict):
        return None, None
    for z, pts in sp.items():
        pts = arr(pts)
        if pts:
            p = arr(pts[0])
            if p and len(p) >= 2 and isinstance(p[0], (int, float)):
                return z, '%.1f,%.1f' % (p[0], p[1])
    return None, None


def who(st):
    """startedBy/finishedBy → [이름, 지역, 좌표, 종류]"""
    st = arr(st) or []
    for kind, getter, db, K in ((0, ko_npc, NPC, NK), (1, ko_obj, OBJ, OK)):
        ids = arr(st[kind]) if len(st) > kind else None
        if ids:
            for i in ids:
                if not isinstance(i, int):
                    continue
                r = db.get(i)
                if not r:
                    continue
                if kind == 0 and r.get(NK['friendlyToFaction']) == 'H':
                    continue
                z, xy = first_spawn(r.get(K['spawns']))
                return [getter(i), zone_name(z)[0] if z else None, xy, 'npc' if kind == 0 else 'obj'], z
    ids = arr(st[2]) if len(st) > 2 else None
    if ids:
        # 아이템으로 시작하는 퀘스트: 그 아이템을 떨구는 몹(또는 물건)의 첫 자리를 받는 곳으로 (지도에 받는 곳이 안 나오던 문제)
        r = ITEM.get(ids[0]) or {}
        for n in arr(r.get(IK['npcDrops'])) or []:
            nr = NPC.get(n) if isinstance(n, int) else None
            if nr:
                z, xy = first_spawn(nr.get(NK['spawns']))
                if z and xy:
                    return [ko_item(ids[0]), zone_name(z)[0], xy, 'item', ko_npc(n)], z
        for o in arr(r.get(IK['objectDrops'])) or []:
            orr = OBJ.get(o) if isinstance(o, int) else None
            if orr:
                z, xy = first_spawn(orr.get(OK['spawns']))
                if z and xy:
                    return [ko_item(ids[0]), zone_name(z)[0], xy, 'item', ko_obj(o)], z
        return [ko_item(ids[0]), None, None, 'item'], None
    return None, None


def spawn_pts(sp):
    """spawns {지역: [[x,y],…]} → {지역: [(x,y),…]} (좌표 없는 점·-1 은 버림)"""
    out = {}
    if not isinstance(sp, dict):
        return out
    for z, pts in sp.items():
        L = []
        for p in arr(pts) or []:
            p = arr(p)
            if p and len(p) >= 2 and all(isinstance(v, (int, float)) for v in p[:2]) and 0 <= p[0] <= 100 and 0 <= p[1] <= 100:
                L.append((float(p[0]), float(p[1])))
        if L and isinstance(z, int):
            out.setdefault(z, []).extend(L)
    return out


def cluster(pts, eps=7.0):
    """가까운 점끼리 묶어 [가운데x, 가운데y, 반지름, 점 수] (많은 순, 최대 3곳)"""
    C = []
    for x, y in pts:
        best = None
        for c in C:
            d = ((c[0] / c[2] - x) ** 2 + (c[1] / c[2] - y) ** 2) ** .5
            if d < eps and (best is None or d < best[0]):
                best = (d, c)
        if best:
            c = best[1]
            c[0] += x; c[1] += y; c[2] += 1; c[3].append((x, y))
        else:
            C.append([x, y, 1, [(x, y)]])
    out = []
    for sx, sy, n, P in C:
        cx, cy = sx / n, sy / n
        ds = sorted(((x - cx) ** 2 + (y - cy) ** 2) ** .5 for x, y in P)
        r = ds[int(len(ds) * .85)] if len(ds) > 1 else 0
        out.append([round(cx, 1), round(cy, 1), round(max(2.5, min(r + 1.5, 14)), 1), n])
    out.sort(key=lambda c: -c[3])
    top = out[0][3] if out else 0
    return [c for c in out if c[3] >= max(1, top * .2)][:3]


def task_places(spawn_dicts, zones, any_cont=False):
    """할 일 자리: 몹·물건이 나오는 점들을 지역별로 모아, 퀘스트 지역(없으면 점이 가장 많은 지역)에서 묶음
    → [지역 한글 이름, [x, y, 반지름, 점 수], …] 또는 None"""
    agg = {}
    for sp in spawn_dicts:
        for z, L in spawn_pts(sp).items():
            agg.setdefault(z, []).extend(L)
    if not agg:
        return None
    z = next((zz for zz in zones if zz in agg), None)
    if z is None:
        # 퀘스트 지역에 없으면 같은 대륙에서 점이 가장 많은 지역 (다른 대륙이면 엉뚱한 곳일 때가 많아서 뺌)
        qc = zone_name(zones[0])[1] if zones and not any_cont else None
        cand = [k for k in agg if not qc or zone_name(k)[1] == qc]
        if not cand:
            return None
        z = max(cand, key=lambda k: len(agg[k]))
    zk = zone_name(z)[0]
    if not zk:
        return None
    cl = cluster(agg[z])
    return [zk] + cl if cl else None


def drop_spawns(item_id):
    r = ITEM.get(item_id)
    if not r:
        return []
    sp = []
    for n in (arr(r.get(IK['npcDrops'])) or [])[:12]:
        nr = NPC.get(n) if isinstance(n, int) else None
        if nr:
            sp.append(nr.get(NK['spawns']))
    for o in (arr(r.get(IK['objectDrops'])) or [])[:12]:
        orr = OBJ.get(o) if isinstance(o, int) else None
        if orr:
            sp.append(orr.get(OK['spawns']))
    if not any(spawn_pts(x) for x in sp):
        # 떨구는 곳이 없으면 파는 상인 자리(호드 상인은 뺌)
        for n in (arr(r.get(IK['vendors'])) or [])[:8]:
            nr = NPC.get(n) if isinstance(n, int) else None
            if nr and nr.get(NK['friendlyToFaction']) != 'H':
                sp.append(nr.get(NK['spawns']))
    return sp


def droppers(item_id, near_zone):
    r = ITEM.get(item_id)
    if not r:
        return []
    out = []
    for n in arr(r.get(IK['npcDrops'])) or []:
        if not isinstance(n, int):
            continue
        nr = NPC.get(n)
        if not nr:
            continue
        lv = nr.get(NK['minLevel'])
        out.append((0 if nr.get(NK['zoneID']) == near_zone else 1, ko_npc(n), lv))
    for o in arr(r.get(IK['objectDrops'])) or []:
        if isinstance(o, int):
            out.append((0 if (OBJ.get(o) or {}).get(OK['zoneID']) == near_zone else 1, ko_obj(o), None))
    out.sort(key=lambda x: x[0])
    seen = []
    for _, nm, lv in out:
        if nm and nm not in [s[0] for s in seen]:
            seen.append([nm, lv])
        if len(seen) >= 4:
            break
    return seen


def text_list(t):
    t = arr(t)
    if isinstance(t, list):
        return ' '.join(x for x in t if isinstance(x, str))
    return t if isinstance(t, str) else ''


# 이미 모은 forg·wowf 한글 자료로 영어 이름 채우기
FQ = {}
FN = {}
lat = lambda x: bool(re.search('[A-Za-z]{3}', x or ''))
base = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'forg')
try:
    for line in open(os.path.join(base, 'leveling.txt'), encoding='utf-8'):
        p = line.rstrip('\n').split('|')
        if len(p) >= 10 and p[-1].isdigit() and not lat(p[2]):
            FQ[int(p[-1])] = p[2]
    for line in open(os.path.join(base, 'quests.jsonl'), encoding='utf-8'):
        o = json.loads(line)
        for row in o.get('ch') or []:
            if len(row) > 6 and isinstance(row[6], int) and row[1] and not lat(row[1]):
                FQ.setdefault(row[6], row[1])
        for k in ('g', 'r'):
            a = o.get(k) or []
            wf = (o.get('wf') or {}).get(k)
            ko = a[0] if a and not lat(a[0]) else (wf if wf and not lat(wf) else None)
            if ko:
                FN[(o['id'], k)] = ko
except FileNotFoundError:
    pass
KX = {}
try:
    for line in open(os.path.join(OUT, 'ko-extra.jsonl'), encoding='utf-8'):
        o = json.loads(line)
        if o.get('n'):
            o['n'] = re.sub(r'\s*(위치·보상|퀘스트)$', '', re.sub(r'^와우 포에버\s*', '', o['n'])).strip()
        KX[o['id']] = o
except FileNotFoundError:
    pass
SPECIAL_KO = {'Crafting': '제작', 'lunar festival': '달의 축제', 'camping': '야영', 'ahn qiraj war': '안퀴라즈 전쟁', 'special': '특별 퀘스트',
              'darkmoon faire': '다크문 축제', 'seasonal': '계절 행사', 'invasion': '침공', 'reputation': '평판', 'midsummer': '한여름 불꽃축제',
              'legendary': '전설', 'epic': '영웅', 'treasure map': '보물 지도', 'night elf': '나이트 엘프', "Temple of Ahn'Qiraj": '안퀴라즈 사원',
              'Alterac Valley': '알터랙 계곡', 'Arathi Basin': '아라시 분지', 'Warsong Gulch': '전쟁노래 협곡', 'Darkspear Islands': '검은창 섬',
              'City Of Dalaran 16560': '달라란'}
CONT_FIX = {'하이잘 산': '칼림도어', '검은바위 산': '동부 왕국', '검은창 섬': '칼림도어', '달라란': '던전'}

out = []
skip = {'horde': 0, 'nostart': 0, 'noname': 0}
for qid, q in sorted(QUEST.items()):
    G = lambda k: q.get(QK[k])
    races = G('requiredRaces') or 0
    if races and not (races & ALLY):
        skip['horde'] += 1
        continue
    name_en = G('name')
    kq = arr(KQ.get(qid)) if isinstance(KQ.get(qid), dict) else KQ.get(qid)
    name = (kq[0] if isinstance(kq, list) and kq and kq[0] else None) or name_en
    if not name:
        skip['noname'] += 1
        continue
    g, gz = who(G('startedBy'))
    if not g:
        skip['nostart'] += 1
        continue
    r, _ = who(G('finishedBy'))
    obj_ko = text_list(kq[1]) if isinstance(kq, list) and len(kq) > 1 else ''
    obj = obj_ko or text_list(G('objectivesText'))
    zone, cont = zone_name(G('zoneOrSort') or gz)
    if not zone and gz:
        zone, cont = zone_name(gz)
    m2 = re.match(r'기타 \((.+)\)$', zone or '')
    key = m2.group(1) if m2 else zone
    if key in SPECIAL_KO:
        zone = SPECIAL_KO[key]
    cont = CONT_FIX.get(zone, cont)
    if lat(name) and qid in FQ:
        name = FQ[qid]
    x = KX.get(qid) or {}
    if lat(name) and x.get('n') and not lat(x['n']):
        name = x['n']
    if x.get('wv') and x.get('n') and not lat(x['n']):
        name = x['n']  # wowf.io로 확인한 이름이 우선
    # 포에버 사이트(wowf.io·forever-tool) 어디에도 없는 영어 퀘스트 = 다른 서버판 퀘스트로 보고 뺌
    if qid in KX and not x.get('n') and not re.search('[가-힣]', name):
        skip['notforever'] = skip.get('notforever', 0) + 1
        continue
    if lat(obj) and x.get('o') and not lat(x['o']):
        obj = x['o']
    if g and lat(g[0]) and x.get('g') and not lat(x['g']):
        g[0] = x['g']
    if r and lat(r[0]) and x.get('r') and not lat(x['r']):
        r[0] = x['r']
    if not r and x.get('r'):
        r = [x['r'], None, None, 'npc']
    if g and lat(g[0]) and (qid, 'g') in FN:
        g[0] = FN[(qid, 'g')]
    if r and lat(r[0]) and (qid, 'r') in FN:
        r[0] = FN[(qid, 'r')]
    tasks = []
    ob = arr(G('objectives')) or []
    zq = G('zoneOrSort')
    zpref = [z for z in (zq if isinstance(zq, int) and zq > 0 else None, gz) if isinstance(z, int)]
    anyc = not (isinstance(zq, int) and zq > 0)
    for kind, label in ((0, '처치'), (1, '사용'), (2, '수집')):
        lst = arr(ob[kind]) if len(ob) > kind else None
        for e in lst or []:
            e = arr(e)
            if not e or not isinstance(e[0], int):
                continue
            if kind == 0:
                t = [label, ko_npc(e[0]), None, task_places([(NPC.get(e[0]) or {}).get(NK['spawns'])], zpref, anyc)]
            elif kind == 1:
                t = [label, ko_obj(e[0]), None, task_places([(OBJ.get(e[0]) or {}).get(OK['spawns'])], zpref, anyc)]
            else:
                t = [label, ko_item(e[0]), droppers(e[0], gz), task_places(drop_spawns(e[0]), zpref, anyc)]
            if t[3] is None:
                t.pop()
            tasks.append(t)
    kc = arr(ob[4]) if len(ob) > 4 else None
    for e in kc or []:
        e = arr(e)
        if e and len(e) > 1 and isinstance(e[1], int):
            ids = [i for i in (arr(e[0]) or []) if isinstance(i, int)] + [e[1]]
            t = ['처치', ko_npc(e[1]), None, task_places([(NPC.get(i) or {}).get(NK['spawns']) for i in ids], zpref, anyc)]
            if t[3] is None:
                t.pop()
            tasks.append(t)
    rec = {'id': qid, 'n': name, 'lv': G('questLevel') or 0, 'm': G('requiredLevel') or 0, 'z': zone, 'c': cont, 'o': obj, 'g': g, 'r': r}
    if tasks:
        rec['t'] = tasks
    # preQuestGroup: 모두 끝내야 함 / preQuestSingle: 그중 하나만 끝내면 됨
    preg = [p for p in (arr(G('preQuestGroup')) or []) if isinstance(p, int) and p in QUEST]
    pre1 = [p for p in (arr(G('preQuestSingle')) or []) if isinstance(p, int) and p in QUEST]
    if preg:
        rec['pre'] = preg
    if pre1:
        rec['pre1'] = pre1
    nx = G('nextQuestInChain')
    if isinstance(nx, int) and nx:
        rec['nx'] = nx
    cls = G('requiredClasses') or 0
    if cls and cls != CLASS['ALL_CLASSES']:
        rec['cls'] = cls
    if races and races & ALLY != ALLY:
        rec['rc'] = races & ALLY
    sf = G('specialFlags') or 0
    if sf & 1:
        rec['rep'] = 1
    bc = G('breadcrumbForQuestId')
    if isinstance(bc, int) and bc:
        rec['bc'] = bc
    ex = arr(G('exclusiveTo')) or []
    if ex:
        rec['ex'] = [x for x in ex if isinstance(x, int)]
    out.append(rec)

with open(os.path.join(OUT, 'quests.jsonl'), 'w', encoding='utf-8') as f:
    for r in out:
        f.write(json.dumps(r, ensure_ascii=False, separators=(',', ':')) + '\n')
print('퀘스트', len(out), '건너뜀', skip)

# 아이템 한국어 이름 (장비 자료 보강용)
with open(os.path.join(OUT, 'item-ko.txt'), 'w', encoding='utf-8') as f:
    for i in sorted(set(KI) | set(ITEM)):
        nm = ko_item(i)
        r = ITEM.get(i) or {}
        if nm:
            f.write('%d|%s|%s|%s\n' % (i, nm.replace('|', '/'), r.get(IK['itemLevel']) or '', r.get(IK['requiredLevel']) or ''))
print('아이템 이름', len(set(KI) | set(ITEM)))

# 장비 자료 보강용: NPC 영어→한글, 지역 id→한글
with open(os.path.join(OUT, 'npc-en-ko.txt'), 'w', encoding='utf-8') as f:
    seen = set()
    for i, r in NPC.items():
        en = r.get(NK['name'])
        ko = ko_npc(i)
        if en and ko and ko != en and en not in seen and not lat(ko):
            seen.add(en)
            f.write('%s|%s\n' % (en.replace('|', '/'), ko.replace('|', '/')))
with open(os.path.join(OUT, 'zone-ko.txt'), 'w', encoding='utf-8') as f:
    for z in sorted(set(ZEN) | set(DUNGEON)):
        ko, cont = zone_name(z)
        if ko:
            f.write('%d|%s|%s\n' % (z, ko, cont or ''))
print('npc/zone 이름표 끝')

# 장비(무기 2·방어구 4) 목록: 능력치 없는 포에버 장비를 도감에서 채울 때 씀
with open(os.path.join(OUT, 'item-equip.txt'), 'w', encoding='utf-8') as f:
    for i, r in sorted(ITEM.items()):
        cl = r.get(IK['class'])
        if cl in (2, 4):
            f.write('%d|%s|%s|%s|%s|%s\n' % (i, cl, r.get(IK['subClass']) if r.get(IK['subClass']) is not None else '', r.get(IK['itemLevel']) or '', r.get(IK['requiredLevel']) or '', ','.join(str(x) for x in (arr(r.get(IK['questRewards'])) or []))))
print('장비 목록 끝')

# ---------- 레벨업 보강: 비행 조련사 · 여관 주인 · 직업 교관 · 사냥터 ----------
CLS_EN = {'Warrior': 'warrior', 'Paladin': 'paladin', 'Hunter': 'hunter', 'Rogue': 'rogue', 'Priest': 'priest',
          'Shaman': 'shaman', 'Mage': 'mage', 'Warlock': 'warlock', 'Druid': 'druid'}
W = {'fp': [], 'inn': [], 'tr': {}, 'mob': {}}


def pts_of(sp, z):
    out = []
    for p in arr((sp or {}).get(z)) or []:
        p = arr(p)
        if p and len(p) >= 2 and isinstance(p[0], (int, float)) and p[0] >= 0:
            out.append((p[0], p[1]))
    return out


for i, r in NPC.items():
    sp = r.get(NK['spawns'])
    if not isinstance(sp, dict) or not sp:
        continue
    fl = r.get(NK['npcFlags']) or 0
    fr = r.get(NK['friendlyToFaction']) or ''
    nm = ko_npc(i)
    if not nm:
        continue
    if 'A' in fr and fl & (8 | 128 | 16):
        z, xy = first_spawn(sp)
        zk = zone_name(z)[0] if z else None
        if not zk or not xy:
            continue
        row = [nm, zk, xy]
        if fl & 8:
            W['fp'].append(row)
        if fl & 128:
            W['inn'].append(row)
        sub = r.get(NK['subName']) or ''
        m = re.match(r'^(\w+) Trainer$', sub)
        if fl & 16 and m and m.group(1) in CLS_EN:
            W['tr'].setdefault(CLS_EN[m.group(1)], []).append(row)
        continue
    # 사냥터: 적대적인 일반 몹(정예 빼고), 한 지역에 많이 있는 것
    if fr or (r.get(NK['rank']) or 0) != 0:
        continue
    lo, hi = r.get(NK['minLevel']) or 0, r.get(NK['maxLevel']) or 0
    if not (1 <= lo <= 62) or lat(nm):
        continue
    for z in sp:
        P = pts_of(sp, z)
        if len(P) < 8:
            continue
        zk, cont = zone_name(z)
        if not zk or cont in ('던전', '기타', '전장'):
            continue
        xs = sorted(p[0] for p in P)
        ys = sorted(p[1] for p in P)
        W['mob'].setdefault(zk, []).append([nm, lo, hi, len(P), round(xs[len(xs) // 2]), round(ys[len(ys) // 2])])
for zk in W['mob']:
    W['mob'][zk] = sorted(W['mob'][zk], key=lambda x: -x[3])[:40]
with open(os.path.join(OUT, 'world.json'), 'w', encoding='utf-8') as f:
    json.dump(W, f, ensure_ascii=False, separators=(',', ':'))
print('비행', len(W['fp']), '여관', len(W['inn']), '교관', {k: len(v) for k, v in W['tr'].items()}, '사냥터 지역', len(W['mob']))

# 아이템 출처 몹(wh:npc=번호)이 어느 지역에 있는지 (지역별 얻는 장비용)
_nids = set()
for _f in ('data/forg/sources.txt', 'data/qdb/sources-extra.txt'):
    _p = os.path.join(os.path.dirname(__file__), '..', '..', _f)
    if os.path.exists(_p):
        for _m in re.finditer(r'wh:npc=(\d+)', open(_p, encoding='utf-8').read()):
            _nids.add(int(_m.group(1)))
_nz = {}
_np = {}
for _i in _nids:
    _r = NPC.get(_i)
    if not _r:
        continue
    _z = _r.get(NK['zoneID'])
    if not _z:
        _sp = _r.get(NK['spawns'])
        if isinstance(_sp, dict) and _sp:
            _z = next(iter(_sp))
    if _z:
        _zk = zone_name(_z)[0]
        if _zk:
            _nz[str(_i)] = _zk
    # 장비를 떨구는 몹의 자리·레벨·희귀 여부 (앱 「네임드·희귀 몹」): [지역, x, y, 등급, 최저, 최고, 한글 이름, 자리 수]
    _sp = _r.get(NK['spawns'])
    if isinstance(_sp, dict) and _sp:
        _best = None
        for _zz in _sp:
            _P = pts_of(_sp, _zz)
            if not _P:
                continue
            _zk2, _cont = zone_name(_zz)
            if not _zk2 or _cont in ('던전', '기타', '전장'):
                continue
            if not _best or len(_P) > len(_best[1]):
                _best = (_zk2, _P)
        if _best:
            _xs = sorted(p[0] for p in _best[1]); _ys = sorted(p[1] for p in _best[1])
            _np[str(_i)] = [_best[0], round(_xs[len(_xs) // 2], 1), round(_ys[len(_ys) // 2], 1), _r.get(NK['rank']) or 0,
                            _r.get(NK['minLevel']) or 0, _r.get(NK['maxLevel']) or 0, ko_npc(_i) or '', len(_best[1])]
W['nz'] = _nz
W['np'] = _np
with open(os.path.join(OUT, 'world.json'), 'w', encoding='utf-8') as f:
    json.dump(W, f, ensure_ascii=False, separators=(',', ':'))
print('출처 몹 지역', len(_nz), '/', len(_nids))

# 아이템 영어 이름 → 한글 (전문기술 재료·제작품 번역용)
with open(os.path.join(OUT, 'item-en-ko.txt'), 'w', encoding='utf-8') as f:
    _seen = set()
    for i, r in sorted(ITEM.items()):
        en = r.get(IK['name'])
        ko = ko_item(i)
        if en and ko and ko != en and not lat(ko) and en not in _seen:
            _seen.add(en)
            f.write('%s|%s\n' % (en.replace('|', '/'), ko.replace('|', '/')))
print('아이템 영→한', len(_seen))
