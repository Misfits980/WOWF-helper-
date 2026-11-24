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


# QuestieDB가 포에버에 쓰는 순서(src/config.lua)대로: 클래식 보정(legacy: 길잡이·배타·앞 퀘스트·진영 고침) → 포에버 기본 → 기록 → 포에버 보정
# 퀘스트 관계(앞 퀘스트·다음 퀘스트·배타)는 플레이어 기록에서 뽑은 foreverQuestRelationTraces도 씀 — QuestieDB 적용 순서(config.lua)와 같게 traces 뒤·Fixes 앞
QUEST = load_entity('quest', 'foreverQuestDB.lua', ['legacy/classicQuestFixes.lua', 'generated/foreverBaseQuest.lua', 'traces/foreverQuestTraces.lua', 'traces/foreverQuestRelationTraces.lua', 'foreverQuestFixes.lua'])
NPC = load_entity('npc', 'foreverNpcDB.lua', ['legacy/classicNPCFixes.lua', 'generated/foreverBaseNpc.lua', 'traces/foreverNpcTraces.lua', 'foreverNPCFixes.lua'])
ITEM = load_entity('item', 'foreverItemDB.lua', ['legacy/classicItemFixes.lua', 'generated/foreverBaseItem.lua', 'traces/foreverItemTraces.lua', 'foreverItemFixes.lua'])
OBJ = load_entity('object', 'foreverObjectDB.lua', ['legacy/classicObjectFixes.lua', 'generated/foreverBaseObject.lua', 'traces/foreverObjectTraces.lua', 'foreverObjectFixes.lua'])


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
# Questie 한글 번역의 오타 바로잡기 (게임 표기는 「먼지진흙 습지대」)
for _k, _v in list(ZKO.items()):
    ZKO[_k] = _v.replace('슾지대', '습지대').replace("Temple of Ahn'Qiraj", '안퀴라즈 사원')
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


def _dnorm(x):
    return re.sub(r'[^a-z]', '', re.sub(r'\b(the|forever)\b', '', (x or '').lower().replace("'", '')))


DGN_KO = {}
if os.path.exists(os.path.join(OUT, 'dungeons-new.txt')):
    for _l in rd(os.path.join(OUT, 'dungeons-new.txt')).splitlines():
        _f = _l.split('|')
        if len(_f) > 3 and _f[0] == 'D':
            DGN_KO[_dnorm(_f[3])] = _f[2]


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
    # 번역이 없는 포에버 새 던전(예: THE_SHAPERS_TERRACE_FOREVER → 「The Shapers Terrace Forever」) → dungeons-new.txt 한글 이름
    if ko and not re.search('[가-힣]', ko) and _dnorm(ko) in DGN_KO:
        return DGN_KO[_dnorm(ko)], '던전'
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


HORDE_HOME = {14, 215, 85, 130, 1637, 1497, 1638}  # 듀로타·멀고어·티리스팔 숲·은빛소나무 숲·오그리마·언더시티·썬더 블러프


def first_spawn(sp):
    if not isinstance(sp, dict):
        return None, None
    # 여러 지역에 있으면(다크문 축제 상인 = 멀고어·엘윈 숲) 호드 본거지가 아닌 곳 먼저 — 얼라이언스 앱
    items = sorted(sp.items(), key=lambda kv: kv[0] in HORDE_HOME)
    for z, pts in items:
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
        stack = list(arr(pts) or [])
        while stack:
            p = arr(stack.pop())
            if not isinstance(p, list) or not p:
                continue
            if len(p) >= 2 and all(isinstance(v, (int, float)) for v in p[:2]):
                if 0 <= p[0] <= 100 and 0 <= p[1] <= 100:
                    L.append((float(p[0]), float(p[1])))
            else:
                stack.extend(p)  # 순찰 경로처럼 한 겹 더 싸인 목록
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


_NAME_IX = {}


def _name_ix(kind):
    # 같은 이름인데 번호만 다른 몹·물건(자리 있는 것)을 찾기 위한 색인
    if kind not in _NAME_IX:
        db, K = (NPC, NK) if kind == 'npc' else (OBJ, OK)
        ix = {}
        for i, r in db.items():
            nm = r.get(K['name'])
            if isinstance(nm, str) and spawn_pts(r.get(K['spawns'])):
                ix.setdefault(nm, []).append(i)
        _NAME_IX[kind] = ix
    return _NAME_IX[kind]


def npc_sp(i):
    """몹 자리: spawns → 없으면 순찰 경로(waypoints) → 없으면 같은 이름 몹의 자리"""
    r = NPC.get(i) if isinstance(i, int) else None
    if not r:
        return [None]
    if spawn_pts(r.get(NK['spawns'])):
        return [r.get(NK['spawns'])]
    if spawn_pts(r.get(NK['waypoints'])):
        return [r.get(NK['waypoints'])]
    nm = r.get(NK['name'])
    return [NPC[j].get(NK['spawns']) for j in _name_ix('npc').get(nm, [])[:6]] or [None]


def obj_sp(i):
    r = OBJ.get(i) if isinstance(i, int) else None
    if not r:
        return [None]
    if spawn_pts(r.get(OK['spawns'])):
        return [r.get(OK['spawns'])]
    nm = r.get(OK['name'])
    return [OBJ[j].get(OK['spawns']) for j in _name_ix('obj').get(nm, [])[:12]] or [None]


def drop_spawns(item_id, depth=0):
    r = ITEM.get(item_id)
    if not r:
        return []
    sp = []
    for n in (arr(r.get(IK['npcDrops'])) or [])[:12]:
        sp.extend(npc_sp(n))
    for o in (arr(r.get(IK['objectDrops'])) or [])[:12]:
        sp.extend(obj_sp(o))
    if depth == 0 and not any(spawn_pts(x) for x in sp):
        # 다른 아이템(상자·알 등)에서 나오는 템: 그 아이템이 나오는 곳
        for it in (arr(r.get(IK['itemDrops'])) or [])[:6]:
            if isinstance(it, int):
                sp.extend(drop_spawns(it, 1))
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
            if len(o['n']) < 2:  # 원본 페이지 제목에 이름이 비어 있던 것(예: 78088 「와우 포에버 에  퀘스트」 → 「에」) — 이름은 버리고 다른 칸만 씀
                o['n'] = ''
                o['nbad'] = 1
        KX[o['id']] = o
except FileNotFoundError:
    pass
SPECIAL_KO = {'Crafting': '제작', 'lunar festival': '달의 축제', 'camping': '야영', 'ahn qiraj war': '안퀴라즈 전쟁', 'special': '특별 퀘스트',
              'darkmoon faire': '다크문 축제', 'seasonal': '계절 행사', 'invasion': '침공', 'reputation': '평판', 'midsummer': '한여름 불꽃축제',
              'legendary': '전설', 'epic': '영웅', 'treasure map': '보물 지도', 'night elf': '나이트 엘프', "Temple of Ahn'Qiraj": '안퀴라즈 사원',
              'Alterac Valley': '알터랙 계곡', 'Arathi Basin': '아라시 분지', 'Warsong Gulch': '전쟁노래 협곡', 'Darkspear Islands': '검은창 섬',
              'City Of Dalaran 16560': '달라란'}
# 이름 바로잡기: wowf.io 이름이 잘려 나온 것 — forg 레벨업 표·와우헤드 포에버 한국어판과 대조해 확인한 것만
QNAME_FIX = {98300: '아이언포지에 전할 소식'}  # wowf.io 「이 소란만큼은 아이」
CONT_FIX = {'하이잘 산': '칼림도어', '검은바위 산': '동부 왕국', '검은창 섬': '칼림도어', '달라란': '던전'}

NAME_HOLE = [  # 앞뒤 글자로 확실히 알 수 있는 것만
    (r'니<name>\.', '니다.'), (r'(있|었|왔|했)<name>고', r'\1다고'), (r'되<name> 않', '되지 않'), (r'(기|영)<name>를', r'\1지를'),
    (r'포<name>(라이트|가)', r'포지\1'), (r'으<name> 가져', '으로 가져'), (r'을<name>도 모릅', '을지도 모릅'), (r'가<name>고 있', '가지고 있'),
    (r'<name>른 ', '다른 '), (r'<name>팡이', '곰팡이'), (r'<name>레브(리안|라스)', r'셀레브\1'), (r'엘<name>라스', '엘다라스'),
    (r'블러드후프 <name>을', '블러드후프 마을'), (r'(^|[\s,])<name>([.!?,\s]|$)', r'\1모험가\2'),
]


def fix_name_hole(t):
    for a_, b_ in NAME_HOLE:
        t = re.sub(a_, b_, t)
    return t.replace('<name>', '…')  # 남은 것은 빠진 글자 표시


out = []
skip = {'horde': 0, 'nostart': 0, 'noname': 0}
HORDE_Q = []  # 호드만 받는 퀘스트 번호 → data/qdb/horde-quests.txt (앱이 이 퀘스트 보상을 「얻을 수 있는 장비」에서 뺌)
OTHER_Q = []  # 얼라이언스도 받지만 이름·시작 자료가 없어 앱 목록에서 빠진 퀘스트 → data/qdb/quests-nolist.txt (보상은 「얻을 수 있음」으로 둠)
for qid, q in sorted(QUEST.items()):
    G = lambda k: q.get(QK[k])
    races = G('requiredRaces') or 0
    if races and not (races & ALLY):
        skip['horde'] += 1
        HORDE_Q.append(qid)
        continue
    name_en = G('name')
    kq = arr(KQ.get(qid)) if isinstance(KQ.get(qid), dict) else KQ.get(qid)
    name = (kq[0] if isinstance(kq, list) and kq and kq[0] else None) or name_en
    if not name:
        skip['noname'] += 1
        OTHER_Q.append(qid)
        continue
    g, gz = who(G('startedBy'))
    if not g:
        skip['nostart'] += 1
        OTHER_Q.append(qid)
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
    name_alt = ''
    if qid in QNAME_FIX and name != QNAME_FIX[qid]:
        name_alt, name = name, QNAME_FIX[qid]  # 틀린 이름은 찾기용 다른 이름(na)으로 남김
    # 포에버 사이트(wowf.io·forever-tool) 어디에도 없는 영어 퀘스트 = 다른 서버판 퀘스트로 보고 뺌
    if qid in KX and not x.get('n') and not x.get('nbad') and not re.search('[가-힣]', name):
        skip['notforever'] = skip.get('notforever', 0) + 1
        continue
    # 플레이어 기록(traces) 한글 글에서 기록한 사람 이름(한 글자)이 <name>으로 바뀌어 글자가 빠진 것(예: 「합니<name>.」「오염되<name> 않은」)
    if '<name>' in obj:
        if x.get('o') and '<name>' not in x['o'] and not lat(x['o']):
            obj = x['o']  # wowf.io 한글 글이 있으면 그걸로
        else:
            obj = fix_name_hole(obj)
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
                t = [label, ko_npc(e[0]), None, task_places(npc_sp(e[0]), zpref, anyc)]
            elif kind == 1:
                t = [label, ko_obj(e[0]), None, task_places(obj_sp(e[0]), zpref, anyc)]
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
            t = ['처치', ko_npc(e[1]), None, task_places([x for i in ids for x in npc_sp(i)], zpref, anyc)]
            if t[3] is None:
                t.pop()
            tasks.append(t)
    _ql, _rl = G('questLevel') or 0, G('requiredLevel') or 0
    if _ql <= 0:  # -1(레벨 따라감)·0은 받는 레벨로
        _ql = _rl
    rec = {'id': qid, 'n': name, 'lv': _ql, 'm': _rl, 'z': zone, 'c': cont, 'o': obj, 'g': g, 'r': r}
    if name_alt:
        rec['na'] = [name_alt]
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
    # 받으려면 필요한 전문기술 [기술 번호, 숙련도] (예: 가죽세공 225) — 없는 캐릭터에게는 추천하지 않으려고
    sk = arr(G('requiredSkill')) or []
    if len(sk) >= 2 and isinstance(sk[0], int) and sk[0]:
        rec['sk'] = [sk[0], sk[1] if isinstance(sk[1], int) else 0]
    rp = arr(G('requiredMinRep')) or []
    if len(rp) >= 2 and isinstance(rp[0], int) and rp[0]:
        rec['rq'] = [rp[0], rp[1] if isinstance(rp[1], int) else 0]
    bc = G('breadcrumbForQuestId')
    if isinstance(bc, int) and bc:
        rec['bc'] = bc
    ex = arr(G('exclusiveTo')) or []
    if ex:
        rec['ex'] = [x for x in ex if isinstance(x, int)]
    out.append(rec)

def _sp(v):  # 글 안의 두 칸 띄어쓰기 → 한 칸
    if isinstance(v, str): return re.sub(r'(?<=\S) {2,}(?=\S)', ' ', v)
    if isinstance(v, list): return [_sp(x) for x in v]
    if isinstance(v, dict): return {k: _sp(x) for k, x in v.items()}
    return v
out = [_sp(r) for r in out]
# 영어로만 있는 퀘스트 목표 → 한글 풀이 (data/qdb/quest-obj-ko.txt)
_OK = {}
_okf = os.path.join(OUT, 'quest-obj-ko.txt')
if os.path.exists(_okf):
    for _l in open(_okf, encoding='utf-8'):
        if '|' in _l and not _l.startswith('#'):
            _a, _b = _l.rstrip('\n').split('|', 1)
            _OK[int(_a)] = _b
for r in out:
    if r.get('id') in _OK and r.get('o') and not re.search('[가-힣]', r['o']):
        r['o'] = _OK[r['id']]
with open(os.path.join(OUT, 'quests.jsonl'), 'w', encoding='utf-8') as f:
    for r in out:
        f.write(json.dumps(r, ensure_ascii=False, separators=(',', ':')) + '\n')
with open(os.path.join(OUT, 'horde-quests.txt'), 'w', encoding='utf-8') as f:
    f.write(' '.join(str(i) for i in sorted(HORDE_Q)) + '\n')
with open(os.path.join(OUT, 'quests-nolist.txt'), 'w', encoding='utf-8') as f:
    f.write(' '.join(str(i) for i in sorted(OTHER_Q)) + '\n')
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
# 전장(알터랙·전쟁노래·아라시) 퀘스트 영어 이름 → build.py가 출처에 영어 이름만 있는 전장 퀘스트(예: The Eye of Command)에도 PvP 표시 (BiS QA: 스톰파이크 6급 계급장이 퀘스트+던전 추천에 섞임)
with open(os.path.join(OUT, 'quest-pvp-en.txt'), 'w', encoding='utf-8') as f:
    f.write('# 전장 퀘스트 영어 이름 (import.py가 QuestieDB에서 만듦)\n')
    _pv = set()
    for _qid, _r in QUEST.items():
        if _r.get(QK['zoneOrSort']) in (2597, 3277, 3358) and _r.get(QK['name']):
            _pv.add(_r[QK['name']])
    for _n in sorted(_pv):
        f.write(_n + '\n')
# forg 출처에 이름 없이 번호만 온 몹(예: 「드랍 · 255247」) → 번호|영어 이름|한글 이름 (build.py가 출처 글을 고침)
try:
    _fs = open(os.path.join(os.path.dirname(OUT), 'forg', 'sources.txt'), encoding='utf-8').read()
    _ids = sorted({int(m) for m in re.findall(r'· (\d{4,})(?:~|$)', _fs, re.M)})
    with open(os.path.join(OUT, 'npc-id-name.txt'), 'w', encoding='utf-8') as f:
        f.write('# forg 출처에 번호만 있는 몹: 번호|영어|한글 (import.py가 QuestieDB에서 만듦)\n')
        for i in _ids:
            r = NPC.get(i)
            en = (r.get(NK['name']) if r else '') or ''
            ko = ko_npc(i) if r else ''
            f.write('%d|%s|%s\n' % (i, en.replace('|', '/'), (ko if ko and not lat(ko) else '').replace('|', '/')))
except FileNotFoundError:
    pass
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
W = {'fp': [], 'inn': [], 'tr': {}, 'mob': {}, 'pn': []}
# 전문기술 교관·재료 상인·책 파는 사람 (앱 전문기술 화면 「배우는 곳」·「장보기」): [한글 이름, 영어 이름, 직함, 지역, 좌표]
PROF_SUB = re.compile(r'^((Alchemy|Blacksmithing|Enchanting|Engineering|Leatherworking|Tailoring|Herbalism|Mining|Skinning|Cooking|Fishing|First Aid) (Trainer|Supplies)'
                      r'|(Junior|Journeyman|Expert|Artisan|Master) (Alchemist|Blacksmith|Enchanter|Engineer|Leatherworker|Tailor|Herbalism Trainer|Mining Trainer|Skinning Trainer)'
                      r'|Trade Supplies|General Supplies|Reagents|Trade Goods|Superior Fisherman|Master Mycologist)$')
PROF_NPC_EN = {'Shandrina', 'Old Man Heming', 'Deneb Walker', 'Dirge Quikcleave', 'Nat Pagle', 'Doctor Gustaf VanHowzen', 'Annora', 'Kaylaena Springwhisper', 'Master Mycologist Shurome'}
_PTJ = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'guides', 'prof-trainers.json')
if os.path.exists(_PTJ):  # 교관 목록에 있는 이름은 직함(Herbalist·Cook·Fisherman 등)과 상관없이 넣음
    _ptj = json.loads(rd(_PTJ))
    PROF_NPC_EN |= {t[0] for L in _ptj.get('tr', {}).values() for t in L} | {t[1] for L in _ptj.get('book', {}).values() for t in L}


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
    _sub0 = r.get(NK['subName']) or ''
    _en0 = r.get(NK['name']) or ''
    if 'A' in fr and (PROF_SUB.match(_sub0) or _en0 in PROF_NPC_EN):
        _z, _xy = first_spawn(sp)
        _zk = zone_name(_z)[0] if _z else None
        if _zk and _xy:
            W['pn'].append([nm, _en0, _sub0, _zk, _xy])
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
print('전문기술 NPC', len(W['pn']), '비행', len(W['fp']), '여관', len(W['inn']), '교관', {k: len(v) for k, v in W['tr'].items()}, '사냥터 지역', len(W['mob']))

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

# 제작법(도안·도면) 파는 상인 (wythic 제작법 자료 data/wythic/recipes.json의 npcs) → data/qdb/recipe-npcs.json
#  앱 「어디서 얻나요」 제작 칸: 도안을 어디서 사는지(한글 이름·직함·지역·좌표·진영). 번호: [이름, 직함, 진영 A/H/AH, 지역, x, y]
_rp = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'wythic', 'recipes.json')
if os.path.exists(_rp):
    _rv_ids = set()
    for _pf in (json.load(open(_rp, encoding='utf-8')).get('profs') or {}).values():
        for _sp0 in _pf.get('spells') or []:
            for _rc in _sp0.get('recipes') or []:
                _rv_ids.update(int(x) for x in (_rc.get('npcs') or []))
    _rv = {}
    for _i in sorted(_rv_ids):
        _r = NPC.get(_i)
        if not _r:
            continue
        _v = KN.get(_i)
        _v = arr(_v) if isinstance(_v, dict) else _v
        _sub = (_v[1] if isinstance(_v, list) and len(_v) > 1 and _v[1] else None) or _r.get(NK['subName']) or ''
        _sp = _r.get(NK['spawns']); _best = None
        if isinstance(_sp, dict):
            for _zz in _sp:
                _P = pts_of(_sp, _zz)
                _zk2 = zone_name(_zz)[0] if _P else None
                if _zk2 and (not _best or len(_P) > len(_best[1])):
                    _best = (_zk2, _P)
        _row = [ko_npc(_i) or '', _sub, _r.get(NK['friendlyToFaction']) or '']
        if _best:
            _xs = sorted(p[0] for p in _best[1]); _ys = sorted(p[1] for p in _best[1])
            _row += [_best[0], round(_xs[len(_xs) // 2], 1), round(_ys[len(_ys) // 2], 1)]
        _rv[str(_i)] = _row
    with open(os.path.join(OUT, 'recipe-npcs.json'), 'w', encoding='utf-8') as f:
        json.dump(_rv, f, ensure_ascii=False, separators=(',', ':'), sort_keys=True)
    print('제작법 상인', len(_rv), '/', len(_rv_ids))

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
