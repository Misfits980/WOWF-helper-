#!/usr/bin/env python3
"""app/ 소스와 data/forg/ 자료를 묶어 저장소 맨 위의 index.html 과 app-data.js 를 만든다."""
import json, hashlib, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
A = ROOT / 'app'; F = ROOT / 'data' / 'forg'
rd = lambda p: p.read_text(encoding='utf-8')

# 직업 자료는 쓰는 부분만 남겨 크기를 줄인다
cls = json.loads(rd(F / 'classes.json'))
slim = {}
# forg 운영 순서의 「when」에 화면 조각이 문자열로 섞여 들어온 경우($,$L22,id-0,[object Object]) → 특성·기술 이름으로
_FIXW = {'omen-of-clarity': '청명의 전조'}
def fix_when(c, w):
    def rp(m):
        k = m.group(1)
        for tk, tv in c['talents'].items():
            if tk == k or tk.endswith('-' + k):
                return tv['n']
        return _FIXW.get(k, '')
    w = (w or '').replace(' ·  ', ' ')
    w = re.sub(r'\$,\$L\w+,([a-z0-9-]+?)-\d+,\[object Object\]', rp, w or '')
    return re.sub(r'\s+', ' ', w).strip(' ·')
import re
for cid, c in cls.items():
    for s_ in c['specs']:
        for k in ('rotation', 'early', 'late'):
            for r in s_.get(k, []):
                r['when'] = fix_when(c, r['when'])
def _fill60(c, steps):
    """forg 레벨 빌드는 59레벨(50점)에서 끝남 → 60레벨 51번째 점을 규칙대로 채움(찍다 만 특성 먼저, 없으면 깊은 줄)"""
    if not steps or len(steps) >= 51 or steps[-1][0] >= 60:
        return
    T = c['talents']; rank = {}; spent = {}
    for lv, tid, r in steps:
        rank[tid] = r; t = T.get(tid)
        if t: spent[t['t']] = spent.get(t['t'], 0) + 1
    def ok(tid, v):
        if rank.get(tid, 0) >= v['max']: return False
        if spent.get(v['t'], 0) < (v.get('tier', 1) - 1) * 5: return False
        q = v.get('req')
        if q and rank.get(q[0], 0) < q[1]: return False
        return True
    order = sorted(spent, key=lambda k: -spent[k])
    for tr in order:
        c_ = [(tid, v) for tid, v in T.items() if v['t'] == tr and ok(tid, v)]
        if not c_: continue
        c_.sort(key=lambda x: (0 if rank.get(x[0], 0) > 0 else 1, -x[1].get('tier', 0), x[1].get('col', 0)))
        tid = c_[0][0]; steps.append([60, tid, rank.get(tid, 0) + 1]); return
for cid, c in cls.items():
    for s_ in c['specs']:
        _fill60(c, s_['steps'])
# 클래스 기술 목록 손질 (forg.gg 자료)
_LRACE = {'노움': 'gnome', '드워프': 'dwarf', '인간': 'human', '나이트 엘프': 'nightelf', '트롤': 'troll', '언데드': 'undead'}
# 포에버에서 없어진 특성 기술(블리자드 사제 직업 소개: 신성 특성 「빛샘」 삭제)
_LDROP = {('priest', '빛샘'), ('priest', '빛샘의 소생')}
# forg 자료에 설명이 빈 기술 (블리자드 사제 직업 소개를 내 말로)
_LDESC = {'비상 대책': '30초 동안 아군에게 보호 주문을 걸어요. 생명력이 35% 밑으로 떨어지면 피해 흡수 보호막과 지속 치유가 걸려요(소생·보호막과 같이 걸림). 즉시 시전, 5분 대기',
          '어둠의 희생': '자기 생명력을 써서 시간에 걸쳐 마나를 얻어요. 정신력이 높을수록 마나를 더 얻어요',
          '평정': '인간형 적을 진정시켜 한동안 나를 알아채는 거리를 줄여요(정신 안정)',
          # 아래는 forg 자료에 설명이 비어 있던 기술: 게임 핫픽스 캐시(Spell.Description_lang)의 문장에서 계산식만 뺀 것
          '복수': '적의 공격을 방어·회피·막은 직후에만 쓰는 반격. 피해를 주고 위협 수준을 크게 올려요(방어 태세)',
          '승리의 돌진': '적을 처치한 뒤 잠깐만 쓸 수 있는 즉시 공격. 피해를 주고 최대 생명력 일부를 회복해요(회색 몹은 안 됨)',
          '마무리 일격': '생명력 20% 이하인 적에게만 써요. 피해를 주고 남은 분노를 모두 써서 분노만큼 추가 피해',
          '정의의 문장': '매 근접 공격에 신성 피해를 더해요. 느린 무기일수록 한 번에 더 많이 들어가요. 문장은 하나만 켤 수 있어요',
          '영혼의 귀환': '귀환석 장소로 돌아가요(귀환석과 따로 쓰는 귀환)',
          '윤회': '죽은 뒤 그 자리에서 생명력·마나 일부를 가진 채 되살아나요(앙크 필요, 대기시간 김)',
          '얼음 화살': '냉기 피해를 주고 잠시 이동 속도를 줄여요',
          '냉기계 수호': '일정량의 냉기 피해를 흡수하는 보호막',
          '생명력 전환': '생명력을 마나로 바꿔요'}
def _ldesc_any(c, name):
    return next((x[7] for x in c['learns'] if x[1] == name and (x[7] or '').strip()), '')


_tkf = ROOT / 'data/guides/talent-ko.json'
# 포에버 새 특성 중 forg 자료에 영어 이름만 있는 것: 게임 핫픽스 캐시(Cache/ADB/koKR/DBCache.bin)의 SpellName을 특성 아이콘(SpellMisc)으로 찾아 맞춘 한글 이름
_TKN = {"paladin/retribution-turn-evil": "악령 퇴치", "rogue/combat-flash-of-steel": "강철의 섬광", "rogue/subtlety-boot-knife": "장화 칼", "priest/holy-holy-binding": "신성 결속", "druid/feral-combat-predatory-discipline": "포식자의 절제", "druid/restoration-bloom": "피워내기"}
_TKO = {k: v for k, v in json.loads(_tkf.read_text(encoding='utf-8')).items() if not k.startswith('_')} if _tkf.exists() else {}
for cid, c in cls.items():
    used = set(x[1] for s in c['specs'] for x in s['steps'])
    slim[cid] = {
        'name': c['name'], 'trees': c['trees'], 'tic': c.get('tic', []),
        # 8번째 칸 = 종족 전용 기술의 종족(사제 종족 기술: 노움은 교란의 섬광·비상 대책만), 빈칸이면 모두
        'learns': [[l[0], l[1], l[2], l[3], l[4], l[6], (_LDESC.get(l[1]) or l[7] or _ldesc_any(c, l[1]))[:90], _LRACE.get(l[5] or '', '')] for l in c['learns']
                   if l[4] in ('', 'alliance', None) and (cid, l[1]) not in _LDROP],
        # 특성 칸(게임처럼 줄·칸·선행 화살표)을 그리려고 모든 특성을 넣음: [이름, 트리, 최대, 아이콘, 설명, 줄, 칸, 선행]
        'talents': {k: [_TKN.get(cid + '/' + k) or v['n'], v['t'], v['max'], v.get('icon', ''), (_TKO.get(cid + '/' + k) or (v.get('d') or '')[:110]), v.get('tier', 0), v.get('col', 0), v.get('req') or 0] for k, v in c['talents'].items()},
        'specs': [{'id': s['id'], 'name': s['name'], 'icon': s['icon'], 'steps': s['steps'],
                   'rot': [[r['when'], r['txt']] for r in s['rotation']],
                   'early': [[r['when'], r['txt']] for r in s['early']],
                   'late': [[r['when'], r['txt']] for r in s['late']]} for s in c['specs']],
    }

# 장비: forg 목록 + QuestieDB·클래식 자료로 더한 장비(data/qdb). 영어 이름은 한글로 바꿈
import re
Q = ROOT / 'data' / 'qdb'

def _dnew():
    """포에버 신규 던전 (tools/dungeons-new.py → data/qdb/dungeons-new.txt)"""
    p_ = ROOT / 'data' / 'qdb' / 'dungeons-new.txt'
    if not p_.exists():
        return []
    fx = _nmfix()
    out = []
    for l in p_.read_text(encoding='utf-8').splitlines():
        if not l.strip():
            continue
        if l.startswith('B|') and fx:
            l = re.sub(r'=([^;|]+)', lambda m: '=' + fx.get(m.group(1), m.group(1)), l)
        out.append(l)
    return out


def _nmfix():
    """data/qdb/npc-ko-fix.txt: 한글 이름이 아직 없는 포에버 몹 이름 (게임에서 확인한 것)"""
    p_ = ROOT / 'data' / 'qdb' / 'npc-ko-fix.txt'
    if not p_.exists():
        return {}
    return dict(l.split('|', 1) for l in p_.read_text(encoding='utf-8').splitlines() if '|' in l and not l.startswith('#'))


def _dgl():
    have = set(l.split('|')[0] for l in rd(F / 'dungeons.txt').splitlines() if l)
    rows = rd(F / 'dungeons.txt').rstrip('\n').split('\n') + [l[2:] for l in _dnew() if l.startswith('D|') and l.split('|')[1] not in have]
    # forg 자료의 영어 이름에 HTML 글자(&#x27; = ')가 그대로 남아 있어 화면에 「Zul&#x27;Farrak」처럼 보이던 것
    import html as _h
    rows = [_h.unescape(l) for l in rows]
    # 던전 레벨 바로잡기(data/guides/dungeon-levels.txt): 게임 던전 찾기의 시작 레벨·블리자드 공식 범위로 시작 레벨과 범위를 덮어씀
    fix = {}
    pf = ROOT / 'data' / 'guides' / 'dungeon-levels.txt'
    if pf.exists():
        for l in pf.read_text(encoding='utf-8').splitlines():
            if l and not l.startswith('#'):
                f = l.split('|')
                fix[f[0]] = (f[1], f[2] + '–' + f[3])
    out = []
    for l in rows:
        f = l.split('|')
        if f[0] in fix:
            f[4], f[5] = fix[f[0]]
        out.append('|'.join(f))
    return '\n'.join(sorted(out, key=lambda l: int(l.split('|')[4] or 0)))


def _qfix(t):
    """툴팁의 못 푼 숫자 자리(?) → 숫자 없이 자연스럽게"""
    t = re.sub(r'\s*\?(초|분|%)?만큼', '', t)
    t = re.sub(r'\?의 ', '일정량의 ', t)
    t = re.sub(r'(?<=\s)\?(?=\s)', '일부', t)
    return t


def _sets():
    """세트 장비: wowf.io 툴팁의 「세트 이름 (0/N)」 + 부위 이름 + 「(n) 세트: 효과」 → [[이름, [부위], [[n, 효과]]]]"""
    out = {}
    f = ROOT / 'data' / 'qdb' / 'items-wowf.jsonl'
    if not f.exists():
        return []
    for l in rd(f).splitlines():
        try:
            o = json.loads(l)
        except Exception:
            continue
        L = o.get('lines') or []
        for i, x in enumerate(L):
            m = re.match(r'^(.+?) \(0/(\d+)\)$', x)
            if not m:
                continue
            nm, n = m.group(1), int(m.group(2))
            parts = L[i + 1:i + 1 + n]
            bon = []
            for y in L[i + 1 + n:]:
                mb = re.match(r'^\((\d+)\) 세트: (.+)$', y)
                if mb:
                    bon.append([int(mb.group(1)), _qfix(mb.group(2))])
            if nm not in out or len(bon) > len(out[nm][2]):
                out[nm] = [nm, parts, bon]
            break
    return list(out.values())


def _dq():
    have = set(l.split('|')[1] for l in rd(F / 'dungeon-quests.txt').splitlines() if l.startswith('B|'))
    base = rd(F / 'dungeon-quests.txt').rstrip('\n') + '\n' + '\n'.join(l for l in _dnew() if l[:2] in ('B|', 'Q|') and l.split('|')[1] not in have)
    # forg.gg 목록에 빠진 던전 퀘스트 (tools/dungeon-quests-extra.py)
    ex = ROOT / 'data' / 'qdb' / 'dungeon-quests-extra.txt'
    if ex.exists():
        seen = set(l.split('|')[2] for l in base.splitlines() if l.startswith('Q|'))
        base += '\n' + '\n'.join(l for l in rd(ex).splitlines() if l.startswith('Q|') and l.split('|')[2] not in seen)
    # 보상이 빠진 퀘스트에 보상 채우기 (data/qdb/dungeon-quest-rewards.txt)
    rf = ROOT / 'data' / 'qdb' / 'dungeon-quest-rewards.txt'
    if rf.exists():
        RWX = {}
        for l in rd(rf).splitlines():
            if l and not l.startswith('#'):
                q, ch, ids = l.split('|'); RWX[q] = (ch, ids)
        out = []
        for l in base.split('\n'):
            f = l.split('|')
            if f[0] == 'Q' and f[2] in RWX and not f[10]:
                while len(f) < 14: f.append('')
                f[10] = RWX[f[2]][1]; f[12] = RWX[f[2]][0]; l = '|'.join(f)
            out.append(l)
        base = '\n'.join(out)
    # 영어로 남은 던전 퀘스트 이름 → QDB 한글 이름
    QN = {}
    if (Q / 'quests.jsonl').exists():
        for line in rd(Q / 'quests.jsonl').splitlines():
            o = json.loads(line)
            if o.get('n') and not re.search('[A-Za-z]{3}', o['n']):
                QN[str(o['id'])] = o['n']
    out = []
    for l in base.split('\n'):
        f = l.split('|')
        if f[0] == 'Q' and len(f) > 6 and re.search('[A-Za-z]{3}', f[6]) and QN.get(f[2]):
            f[6] = QN[f[2]]; l = '|'.join(f)
        out.append(l)
    return '\n'.join(out)


def _guide():
    """Wowhead WoW Forever 레벨 20·30 가이드에 나온 템 (data/guides/wowhead-forever-l20-l30.txt) → {직업/특성: {20:[id], 30:[id]}}"""
    p_ = ROOT / 'data' / 'guides' / 'wowhead-forever-l20-l30.txt'
    if not p_.exists():
        return {}
    SPM = {'priest/shadow': 'priest/shadow-magic', 'shaman/elemental': 'shaman/elemental-combat', 'druid/feral': 'druid/feral-cat',
           'druid/feraldps': 'druid/feral-cat', 'druid/feraltank': 'druid/feral-bear'}
    raw = {}
    for l in p_.read_text(encoding='utf-8').splitlines():
        if not l.strip():
            continue
        if ':' in l:
            k, v = l.split(':', 1); raw[k] = [int(x) for x in v.split()]
        else:
            k, v = l.split('='); raw[k] = ('=', v)
    for k, v in list(raw.items()):
        if isinstance(v, tuple):
            raw[k] = raw[v[1]]
    out = {}
    for k, ids in raw.items():
        sp, L = k.rsplit('/', 1)
        if k == 'druid/feral/L30':
            sp = 'druid/feraltank'
        sp = SPM.get(sp, sp)
        d = out.setdefault(sp, {})
        d[L[1:]] = sorted(set(d.get(L[1:], []) + ids))
    return out


ko = {}
if (Q / 'item-ko.txt').exists():
    for line in rd(Q / 'item-ko.txt').splitlines():
        f = line.split('|')
        if len(f) > 1 and f[0].isdigit():
            ko[int(f[0])] = f[1]
lat = lambda x: bool(re.search('[A-Za-z]{3}', x or ''))
items = []
for line in rd(F / 'items.txt').splitlines():
    if not line:
        continue
    f = line.split('|')
    if len(f) > 12 and lat(f[12]) and ko.get(int(f[0])) and not lat(ko[int(f[0])]):
        f[12] = ko[int(f[0])]
    items.append('|'.join(f))
srcs = rd(F / 'sources.txt').rstrip('\n')
# 상인 이름이 영어로 남은 것 → 한글 (npc-en-ko.txt)
_npcko = dict(l.split('|', 1) for l in (ROOT / 'data/qdb/npc-en-ko.txt').read_text(encoding='utf-8').splitlines() if '|' in l)
_npcko.update(_nmfix())
srcs = re.sub(r'(?m)^(5~상인 · )([^~]+)', lambda m: m.group(1) + _npcko.get(m.group(2), m.group(2)), srcs)
if (Q / 'items-extra.txt').exists():
    off = len(srcs.split('\n'))
    srcs += '\n' + rd(Q / 'sources-extra.txt').rstrip('\n')
    for line in rd(Q / 'items-extra.txt').splitlines():
        f = line.split('|')
        if len(f) > 12:
            f[7] = ';'.join(str(int(x) + off) for x in f[7].split(';') if x != '')
            f[9] = 'extra'
            # 리치왕 시절 '곰·표범 변신 전투력'((DPS-54.8)×14)이 전투력으로 섞여 들어온 무기 → 클래식·포에버엔 없는 값이라 뺌
            _st = dict(re.findall(r'([a-z]+)(-?[\d.]+)', f[5]))
            if 'ap' in _st and 'dps' in _st and float(_st['dps']) > 54.8 and abs((float(_st['dps']) - 54.8) * 14 - float(_st['ap'])) <= 3:
                f[5] = ' '.join(t for t in f[5].split() if not re.match(r'^ap-?[\d.]+$', t))
            items.append('|'.join(f))
if (Q / 'items-wowf.jsonl').exists() and (Q / 'item-equip.txt').exists():
    import sys
    sys.path.insert(0, str(A))
    from items_wowf import convert
    sl_ = srcs.split('\n')
    si_ = {l: i for i, l in enumerate(sl_)}
    def sidx(label):
        if label not in si_:
            si_[label] = len(sl_); sl_.append(label)
        return si_[label]
    have_ = set(int(l.split('|')[0]) for l in items)
    from items_wowf import eff_stats, parse_stats, merge_stats, weapon_dps, has_special
    _stfix = 0
    _effix = 0
    WREC = {}
    for l_ in rd(Q / 'items-wowf.jsonl').splitlines():
        if l_:
            o_ = json.loads(l_)
            if not o_.get('none'):
                WREC[o_['id']] = o_
    for ix, line in enumerate(items):
        f = line.split('|')
        o_ = WREC.get(int(f[0]))
        if o_ and len(f) > 12 and lat(f[12]) and o_.get('nm') and not lat(o_['nm']):
            f[12] = o_['nm']
            items[ix] = '|'.join(f)
        if o_ and len(f) > 6:
            # 포에버 툴팁(wowf.io)으로 능력치 채우기: forg에 빠진 주문력·적중·치명타 등급·「지능 +8」 꼴 등
            _cur = {k: float(v) for k, v in re.findall(r'(?:^|\s)(mp5|[a-z]+)(-?[\d.]+)(?=\s|$)', f[5])}
            _new = merge_stats(_cur, parse_stats(o_.get('lines')))
            # 「효과」 표시: 점수로 못 세는 특수 효과가 있을 때만 (「+9 주문력」 같은 건 능력치라 아님)
            _ef = '1' if has_special(o_.get('lines')) else ''
            if f[6] != _ef:
                f[6] = _ef
                items[ix] = '|'.join(f)
                _effix += 1
            _wd = weapon_dps(o_.get('lines'))
            if _wd and 'dps' in _cur and abs(_wd - _cur['dps']) > 0.3:
                _new['dps'] = _wd  # 포에버에서 무기 공격력·속도가 바뀐 경우 (예: 정의의 망치 29.8 → 19.8)
            if _new != _cur:
                f[5] = ' '.join('%s%s' % (k, ('%g' % v)) for k, v in _new.items())
                items[ix] = '|'.join(f)
                _stfix += 1
    print('포에버 툴팁으로 능력치 보강', _stfix, '· 효과 표시 고침', _effix)
    for line in convert(rd(Q / 'items-wowf.jsonl'), rd(Q / 'item-equip.txt'), sidx):
        if int(line.split('|')[0]) not in have_:
            items.append(line)
    srcs = '\n'.join(sl_)
# 포에버 게임 자료(핫픽스 캐시 + 클라이언트 표, tools/itemcache/game_items.py)로 능력치 바로잡기
#  - 핫픽스(h) 기록 = 포에버 서버가 보낸 지금 값 → 믿음. 기본 자료(c)는 캐시가 아직 못 받은 템일 수 있어 wowf.io 툴팁이 없을 때만 씀
#  - 주 능력치(힘·민첩·체력·지능·정신력): 게임 값이 하나라도 있으면 게임 값으로 통째로 바꿈 (무작위 접미사 템은 게임 값이 비어 있어 그대로)
#  - 아이템 능력치로 붙은 보조 능력치(적중·치명타 등급, 주문력, 전투력, 5초당 마나, 계열 주문력 …): 게임 값으로 덮어씀
#  - 등급: 핫픽스 기록 값으로 (포에버에서 고급→희귀로 올린 템). 요구 레벨은 게임 값이 0인 퀘스트 보상이 많아 그대로 둠
#  - 착용 효과 주문(예: 정의의 망치 치유량 +94)·무기 공격력은 게임 캐시에 없어 기존 값(wowf.io) 그대로
if (Q / 'items-game.txt').exists():
    _GM = {}
    _WR = globals().get('WREC', {})
    _GQ = {}  # 핫픽스 기록의 등급 (포에버에서 고급→희귀로 올린 템 등)
    for l_ in rd(Q / 'items-game.txt').splitlines():
        if l_ and not l_.startswith('#'):
            g_ = l_.split('|')
            if g_[5] == 'c' and int(g_[0]) in _WR:
                continue  # 기본 자료(핫픽스 아님)는 캐시가 그 템을 아직 못 받은 것일 수 있어, 포에버 툴팁(wowf.io)이 있으면 그쪽을 믿음
            _GM[int(g_[0])] = {k: float(v) for k, v in re.findall(r'(?:^|\s)(mp5|[a-z]+)(-?[\d.]+)(?=\s|$)', g_[4])}
            if g_[5] == 'h':
                _GQ[int(g_[0])] = 'pcurel'[int(g_[3])] if 0 <= int(g_[3]) <= 5 else None
    _PRI = ('str', 'agi', 'sta', 'int', 'spi')
    _gfix = 0
    for ix, line in enumerate(items):
        f = line.split('|')
        g_ = _GM.get(int(f[0])) if len(f) > 6 else None
        if not g_:
            continue
        _q = _GQ.get(int(f[0]))
        if _q and f[4] != _q and f[4] in 'pcurel':
            f[4] = _q
            items[ix] = '|'.join(f)
            _gfix += 1
        _cur = {k: float(v) for k, v in re.findall(r'(?:^|\s)(mp5|[a-z]+)(-?[\d.]+)(?=\s|$)', f[5])}
        _new = dict(_cur)
        if any(k in g_ for k in _PRI):
            for k in _PRI:
                _new.pop(k, None)
        for k, v in g_.items():
            _new[k] = v
        if _new != _cur:
            if __import__('os').environ.get('WFH_GAMELOG'):
                with open(__import__('os').environ['WFH_GAMELOG'], 'a', encoding='utf-8') as _lg:
                    _lg.write(json.dumps([int(f[0]), f[12] if len(f) > 12 else '', _cur, _new], ensure_ascii=False) + '\n')
            f[5] = ' '.join('%s%s' % (k, ('%g' % v)) for k, v in _new.items())
            items[ix] = '|'.join(f)
            _gfix += 1
    print('포에버 게임 자료로 능력치 고침', _gfix, '/', len(_GM))
# 애드온 v3.6 「/wfh 아이템」이 게임에서 직접 읽은 값 (tools/itemcache/addon_items.py → items-addon.jsonl). 가장 믿을 만함
#  - 한글 이름 · 등급은 게임 값으로. 주 능력치는 GetItemStats 값으로 통째로, 나머지는 툴팁 줄(착용 효과 포함)로 채움
#  - 무기 초당 공격력은 툴팁의 「34 - 64 피해 · 속도 2.60」로, 특수 효과 표시는 툴팁의 착용·사용·적중 시 효과로
if (Q / 'items-addon.jsonl').exists():
    from items_wowf import parse_stats as _ps, merge_stats as _ms, weapon_dps as _wd, has_special as _hs
    _AD = {}
    for l_ in rd(Q / 'items-addon.jsonl').splitlines():
        if l_:
            o_ = json.loads(l_)
            _AD[o_['id']] = o_
    _WR = globals().get('WREC', {})
    _GSK = {'STRENGTH': 'str', 'AGILITY': 'agi', 'STAMINA': 'sta', 'INTELLECT': 'int', 'SPIRIT': 'spi'}
    _an = _aq = _as = 0
    for ix, line in enumerate(items):
        f = line.split('|')
        o_ = _AD.get(int(f[0]))
        if not o_ or len(f) < 13:
            continue
        _nm = (o_.get('nm') or '').strip()
        if _nm and re.search('[가-힣]', _nm) and f[12] != _nm:
            f[12] = _nm; _an += 1
        if isinstance(o_.get('q'), int) and 0 <= o_['q'] <= 5 and f[4] in 'pcurel' and f[4] != 'pcurel'[o_['q']]:
            f[4] = 'pcurel'[o_['q']]; _aq += 1
        L_ = o_.get('lines') or []
        _cur = {k: float(v) for k, v in re.findall(r'(?:^|\s)(mp5|[a-z]+)(-?[\d.]+)(?=\s|$)', f[5])}
        _new = _ms(_cur, _ps(L_))
        _gp = {_GSK[k]: v for k, v in (o_.get('gs') or {}).items() if k in _GSK}
        if (_gp or L_) and not any('무작위' in x for x in L_):  # 무작위 옵션 템(「…의 ○○」)은 기본 템에 주 능력치가 없음
            for k in ('str', 'agi', 'sta', 'int', 'spi'):
                _new.pop(k, None)
            _new.update(_gp)
        _w = _wd(L_)
        if _w and 'dps' in _cur:
            _new['dps'] = _w
        if _new != _cur:
            f[5] = ' '.join('%s%s' % (k, ('%g' % v)) for k, v in _new.items()); _as += 1
        # 게임 툴팁은 주문 글(착용·사용 효과)이 늦게 불러와져 빠질 때가 있음 → 효과 줄이 wowf.io보다 적으면 효과 표시는 그대로 둠
        _E = ('착용 효과', '사용 효과', '적중 시', '발동 효과')
        _ng = sum(1 for x in L_ if x.startswith(_E))
        # wowf.io는 「착용 효과: +N 암흑 저항」처럼 능력치를 효과 줄로 따로 적음 → 문장으로 된 효과만 셈
        _nw = sum(1 for x in ((_WR.get(int(f[0])) or {}).get('lines') or []) if str(x).startswith(_E) and not re.match(r'^착용 효과:\s*\+\d', str(x)))
        if L_ and _ng >= _nw:
            f[6] = '1' if _hs(L_) else ''
        items[ix] = '|'.join(f)
    print('애드온이 게임에서 읽은 값으로 고침 · 이름', _an, '· 등급', _aq, '· 능력치', _as, '/', len(_AD))
# 착용 가능 직업: forg 마스크는 「어울리는 직업」(능력치 기준)이라 실제 착용 규칙으로 다시 계산
#  - 무기 숙련·방어구 종류로 판단, wowf.io 「직업:」 줄이나 allow가 있으면 그 직업만
#  - forg가 3직업 이하로만 표시한 건 영웅·전설(티어 등)일 때만 직업 전용으로 보고 그대로 둠
#    (고급·희귀는 forg 표시가 「어울리는 직업」일 뿐이라 착용 규칙으로: 예 보석박힌 장갑(천)이 사냥꾼 전용으로 잡혀 사제가 「못 끼는 장비」로 나오던 것)
try:
    from items_wowf import mask_of, CL as _CL
    _KO = {'전사': 'warrior', '성기사': 'paladin', '사냥꾼': 'hunter', '도적': 'rogue', '사제': 'priest', '주술사': 'shaman', '마법사': 'mage', '흑마법사': 'warlock', '드루이드': 'druid'}
    _W = {}
    if (Q / 'items-wowf.jsonl').exists():
        for l_ in rd(Q / 'items-wowf.jsonl').splitlines():
            if l_:
                o_ = json.loads(l_)
                _W[o_['id']] = o_
    _fix = 0
    for ix, line in enumerate(items):
        f = line.split('|')
        if len(f) < 13 or f[9] not in ('', 'extra'):
            continue
        m0 = int(f[8] or 0)
        allow = [x for x in f[10].split(',') if x] or None
        o_ = _W.get(int(f[0]))
        if o_ and not o_.get('none'):
            cl = [t for t in (o_.get('lines') or []) if t.startswith('직업:')]
            if cl:
                allow = [_KO[x.strip()] for x in cl[0][3:].split(',') if x.strip() in _KO] or allow
        elif not allow and bin(m0).count('1') <= 3 and f[4] in ('e', 'l') and not (f[3] or '').startswith('2.') and (f[3] or '') != '4.0' and f[2] not in ('ne', 'fi', 'tr', 'ho', 'ba'):
            # 기타 방어구·목·반지·장신구·보조 장비·망토는 누구나 낄 수 있어서 forg의 좁은 표시(추천 직업)를 쓰지 않음 (직업 전용은 wowf 「직업:」 줄로)
            # 무기는 forg 표시가 적어도 숙련 규칙으로 (도적 한손 도끼처럼 포에버에서 바뀐 숙련 반영)
            continue
        m1 = mask_of(f[3] or '', allow)
        if m1 and m1 != m0:
            f[8] = str(m1)
            items[ix] = '|'.join(f)
            _fix += 1
    print('착용 직업 다시 계산', _fix)
except ImportError as e:
    print('착용 직업 계산 건너뜀', e)
# 출처가 비어 있는 고급 이상 장비 = 월드 드랍(경매장)
_sl = srcs.split('\n')
_wd = None
for ix, line in enumerate(items):
    f = line.split('|')
    if len(f) > 12 and not f[7] and f[4] in ('u', 'r', 'e'):
        if _wd is None:
            _wd = len(_sl); _sl.append('2~월드 드랍~')
        f[7] = str(_wd); items[ix] = '|'.join(f)
srcs = '\n'.join(_sl)

# 전문기술 표의 영어 아이템·제작 이름을 한글로 (QuestieDB 아이템 영→한, 마법부여는 규칙으로)
def wy_names():
    p = ROOT / 'data' / 'wythic' / 'profs.json'
    return json.loads(rd(p)).get('n', {}) if p.exists() else {}
WYN = wy_names()

def prof_ko(txt):
    M = {}
    for _fn in ('item-en-ko.txt', 'item-en-ko2.txt'):
        pth = Q / _fn
        if pth.exists():
            for l in rd(pth).splitlines():
                if '|' in l:
                    en, ko_ = l.split('|', 1)
                    M.setdefault(en, ko_)
    wp = Q / 'items-wowf.jsonl'
    if wp.exists():
        for l in rd(wp).splitlines():
            if not l:
                continue
            o = json.loads(l)
            L_ = o.get('lines') or []
            if o.get('nm') and '영어 이름' in L_:
                k = L_.index('영어 이름')
                if k + 1 < len(L_) and not lat(o['nm']):
                    M.setdefault(L_[k + 1], o['nm'])
    # wythic 전문기술 자료의 한글 이름 (포에버 새 제작법·재료)
    for en_, v_ in WYN.items():
        if v_[0] and v_[2] == en_:
            M.setdefault(en_, v_[0])
    SL = {'Bracer': '손목', 'Chest': '가슴', 'Cloak': '망토', 'Boots': '장화', 'Gloves': '장갑', 'Weapon': '무기', 'Shield': '방패', '2H Weapon': '양손 무기'}
    GR = {'Minor': '최하급', 'Lesser': '하급', 'Inferior': '최하급', 'Greater': '상급', 'Superior': '최상급', 'Major': '특급'}
    EF = {'Stamina': '체력', 'Spirit': '정신력', 'Intellect': '지능', 'Agility': '민첩성', 'Strength': '힘', 'Defense': '방어', 'Deflect': '피해 반사', 'Absorption': '피해 흡수', 'Health': '생명력', 'Mana': '마나', 'Striking': '타격', 'Protection': '보호'}
    def ench(m):
        sl, ef = m.group(1), m.group(2).split()
        g = GR.get(ef[0]) if len(ef) > 1 else None
        e = EF.get(ef[-1])
        if sl not in SL or not e:
            return m.group(0)
        return SL[sl] + ' 마법부여 - ' + ((g + ' ') if g else '') + e
    def one(name):
        n = name.strip()
        pre = ''
        if n.startswith('+'):
            pre, n = '+', n[1:]
        mc = re.match(r'^(.*?)(\s+[+]?\d+(?:~\d+)?(?:\s*등)?)$', n)
        base, tail = (mc.group(1), mc.group(2)) if mc else (n, '')
        tail = tail
        base0 = base
        b2 = base.replace("\\'", "'")
        for cand in (b2, 'Handful of ' + b2, b2 + 's'):
            if cand in M:
                return pre + M[cand] + tail
        me_ = re.match(r'^(2H Weapon|Bracer|Chest|Cloak|Boots|Gloves|Weapon|Shield)\s+(.+)$', b2)
        if me_ and ('Enchant %s - %s' % (me_.group(1), me_.group(2))) in M:
            return pre + M['Enchant %s - %s' % (me_.group(1), me_.group(2))] + tail
        e = re.sub(r'^Enchant (2H Weapon|Bracer|Chest|Cloak|Boots|Gloves|Weapon|Shield) - (.+)$', ench, base)
        return pre + (e if e != base else base) + tail
    def tr(sq):
        t = sq.group(1)
        if not re.search('[A-Za-z]{3}', t) or t.startswith('http') or re.match(r'^[a-z]+$', t):
            return sq.group(0)
        parts = re.split(r'(\s*(?:,|/|→|\(|\))\s*)', t)
        return "'" + ''.join(p if re.match(r'^\s*(?:,|/|→|\(|\))\s*$', p) or not p else one(p) for p in parts) + "'"
    return re.sub(r"'((?:[^'\\]|\\.)*)'", tr, txt)

PROFS_JS = prof_ko(rd(A / 'profs.js'))
# 전문기술 화면에 쓰는 이름 → 아이콘 (만드는 아이템·재료)
PICO = {}
# 재료 이름 → 아이템 번호 (애드온 가방 개수와 맞추기용)
KO_ID = {}
for _id, _nm in sorted(ko.items()):
    KO_ID.setdefault(_nm, _id)
MATID = {}
for sq in re.findall(r"'((?:[^'\\]|\\.)*)'", PROFS_JS):
    for part in re.split(r'\s*(?:,|/|→|\(|\))\s*', sq.replace("\\'", "'")):
        nm_ = re.sub(r'\s+[+]?\d+(?:~\d+)?(?:\s*등)?$', '', part.strip())
        v_ = WYN.get(nm_) or WYN.get(re.sub(r'\s*(꽃잎|잎사귀)$', '', nm_))
        if v_ and v_[1]:
            PICO[nm_] = v_[1]
        if nm_ and nm_ in KO_ID:
            MATID[nm_] = KO_ID[nm_]
# 한글판이 아직 없는 영문 이름 템 → wythic.com 던전 자료(data/wythic/dungeons.json)의 한글 이름으로
_wyko = {}
if (ROOT / 'data' / 'wythic' / 'dungeons.json').exists():
    for _d in json.loads(rd(ROOT / 'data' / 'wythic' / 'dungeons.json')).get('dungeons', []):
        for _b in _d.get('bosses', []):
            for _it in _b.get('drops', []):
                _wyko[_it[0]] = _it[1]
        for _it in _d.get('trash', []):
            _wyko[_it[0]] = _it[1]
_nko = 0
for _i, _l in enumerate(items):
    _f = _l.split('|')
    if len(_f) > 12 and re.search('[A-Za-z]{3}', _f[12]) and _f[0].isdigit() and _wyko.get(int(_f[0])) and not re.search('[A-Za-z]{3}', _wyko[int(_f[0])]):
        _f[12] = _wyko[int(_f[0])]; items[_i] = '|'.join(_f); _nko += 1
print('wythic ko names', _nko)
# 아이콘·한글 이름이 빈 템 → 와우헤드 포에버 툴팁에서 받아 둔 것 (data/qdb/item-icons.txt: 번호|아이콘|한글 이름)
_ICF = Q / 'item-icons.txt'
if _ICF.exists():
    _IC = {}
    for _l in rd(_ICF).splitlines():
        _p = _l.split('|')
        if len(_p) >= 2 and _p[0].isdigit():
            _IC[int(_p[0])] = (_p[1].strip().lower(), (_p[2] if len(_p) > 2 else '').strip())
    _ni = _nk = 0
    for _i, _l in enumerate(items):
        _f = _l.split('|')
        if len(_f) < 14 or not _f[0].isdigit() or int(_f[0]) not in _IC:
            continue
        _ic, _ko = _IC[int(_f[0])]
        if _ic and not _f[13]:
            _f[13] = _ic; _ni += 1
        if _ko and re.search('[가-힣]', _ko) and re.search('[A-Za-z]{3}', _f[12]):
            _f[12] = _ko; _nk += 1
        items[_i] = '|'.join(_f)
    print('wowhead icons', _ni, 'ko', _nk)
ITEMS_TXT = '\n'.join(items) + '\n'
def _rwnm():
    """던전 퀘스트 보상 중 장비가 아닌 것(가방·물약·도안)의 한글 이름 → 던전 퀘스트 보상 칸에 글로 보여 줌"""
    have = set(l.split('|')[0] for l in items)
    out = {}
    for l in _dq().splitlines():
        f = l.split('|')
        if f[0] != 'Q' or len(f) < 11:
            continue
        for i in filter(None, f[10].split(',')):
            if i not in have and i.isdigit() and ko.get(int(i)) and not lat(ko[int(i)]):
                out[i] = ko[int(i)]
    return out
# 아이템 출처 퀘스트의 받는 레벨 (얻을 수 있는 레벨 계산용)
QLV = {}
if (Q / 'quests.jsonl').exists():
    want = set(int(x) for x in re.findall(r'quest=(\d+)', srcs))
    for line in rd(Q / 'quests.jsonl').splitlines():
        o = json.loads(line)
        if o['id'] in want:
            QLV[o['id']] = max(o.get('m') or 0, (o.get('lv') or 0) - 3)
# 출처 이름(드랍 몹·상인 등)이 영어로 남은 것 → 한글 (npc-en-ko.txt)
_QKO = {}
if (Q / 'quests.jsonl').exists():
    for _ln in rd(Q / 'quests.jsonl').splitlines():
        _o = json.loads(_ln)
        if _o.get('n') and not re.search('[A-Za-z]{3}', _o['n']):
            _QKO[str(_o['id'])] = _o['n']
def _srcko(l):
    f = l.split('~')
    if len(f) > 1:
        m = re.match(r'^(.*· )([A-Za-z][^~]*)$', f[1])
        if m:
            qi = re.search(r'(?:quest=|/quest/)(\d+)', f[2] if len(f) > 2 else '')
            if qi and _QKO.get(qi.group(1)):
                f[1] = m.group(1) + _QKO[qi.group(1)]
            elif _npcko.get(m.group(2).strip()):
                f[1] = m.group(1) + _npcko[m.group(2).strip()]
    return '~'.join(f)
srcs = '\n'.join(_srcko(l) for l in srcs.split('\n'))
# 던전 드랍 「던전 · 몹 이름」의 영어 몹 이름 → 한글 (npc-ko-fix)
_fx = _nmfix()
if _fx:
    srcs = re.sub(r'(?m)^(0~[^~·]+ · )([^~]+)', lambda m: m.group(1) + _fx.get(m.group(2).strip(), m.group(2)), srcs)
srcs = srcs.replace("(Temple of Ahn'Qiraj)", '(안퀴라즈 사원)')
SRC_TXT = srcs + '\n'

# 퀘스트 할 일(forg) 「떨구는 몹」 등에 남은 영어 몹 이름 → 한글 (앱에서 바꿔 보여 줌)
def _npcko_q():
    out = {}
    fq = ROOT / 'data/forg/quests.jsonl'
    if not fq.exists(): return out
    for _ln in rd(fq).splitlines():
        try: _o = json.loads(_ln)
        except Exception: continue
        for _t in _o.get('t') or []:
            for _f in _t[1:4]:
                if not isinstance(_f, str): continue
                for _p in re.split(r',\s*', _f):
                    _m = re.match(r"^([A-Za-z][A-Za-z'’\- .]+?)(\s*\(Lv [\d\-]+\))?$", _p.strip())
                    if _m and _npcko.get(_m.group(1).strip()):
                        out[_m.group(1).strip()] = _npcko[_m.group(1).strip()]
    qq = ROOT / 'data/qdb/quests.jsonl'
    if qq.exists():
        for _ln in rd(qq).splitlines():
            try: _o = json.loads(_ln)
            except Exception: continue
            for _t in _o.get('t') or []:
                for _x in (_t[2] if len(_t) > 2 and isinstance(_t[2], list) else []):
                    _n = (_x[0] if isinstance(_x, list) and _x else '')
                    if isinstance(_n, str) and re.match('[A-Za-z]', _n) and _npcko.get(_n.strip()):
                        out[_n.strip()] = _npcko[_n.strip()]
    return out


# 포에버 새 지역을 레벨업 동선에 넣기 (블리자드 공식: 강물터 35~40 · 셴드랄라스 40~45)
# forg 동선(오리지널 가이드)의 35~39·40~43 가시덤불 골짜기 구간을 강물터·셴드랄라스로 바꾸고 44~50 구간은 46부터로.
# 퀘스트는 data/qdb/quests.jsonl 의 그 지역 퀘스트(던전·직업·기타 빼고), 퀘스트 레벨 순. 가시덤불 골짜기는 앱의 「퀘스트 많은 곳」 동선에 그대로 남음.
def _lvl_forever(txt):
    qp = ROOT / 'data/qdb/quests.jsonl'
    if not qp.exists():
        return txt
    Z = {'강물터': [], '셴드랄라스': []}
    for _ln in rd(qp).splitlines():
        try: q = json.loads(_ln)
        except Exception: continue
        if q.get('z') in Z and q.get('c') not in ('던전', '기타', '직업') and 30 <= (q.get('lv') or 0) <= 48 and not re.search('[A-Za-z]{3}', q.get('n') or 'x'):
            Z[q['z']].append(q)
    cl = lambda t: re.sub(r'[|\n\r]', ' ', str(t or '')).strip()
    def line(q):
        g = q.get('g') or ['', '', '', '']
        pre = q.get('pre')
        pre = pre[0] if isinstance(pre, list) and pre else (pre if isinstance(pre, int) else '')
        return '|'.join(map(str, [q['lv'], q.get('m') or max(1, q['lv'] - 5), cl(q['n']), cl(g[1] or q.get('z')), cl(g[0]), cl(g[2]) if g[2] and '-' not in str(g[2]) else '', 0, pre or '', cl(q.get('o')), q['id']]))
    srt = lambda L: sorted(L, key=lambda q: (q['lv'], q['id']))
    rg, sd = srt(Z['강물터']), srt(Z['셴드랄라스'])
    if len(rg) < 20 or len(sd) < 10:
        return txt
    # 강물터 퀘스트는 대부분 36레벨부터 받을 수 있어서 36부터 (앞 33~34 구간을 35까지 늘림)
    new = ['#36|40|강물터'] + [line(q) for q in rg if q['lv'] <= 40] + ['#41|42|강물터'] + [line(q) for q in rg if q['lv'] > 40] + ['#43|45|셴드랄라스'] + [line(q) for q in sd]
    out, skip = [], False
    for l in txt.split('\n'):
        if l.startswith('#'):
            a, b = l[1:].split('|')[:2]
            if (a, b) in (('35', '39'), ('40', '43')):
                if (a, b) == ('35', '39'):
                    out.extend(new)
                skip = True
                continue
            skip = False
            if (a, b) == ('33', '34'):
                l = '#33|35|' + l.split('|', 2)[2]
            if (a, b) == ('44', '50'):
                l = '#46|50|' + l.split('|', 2)[2]
        elif l.startswith('@'):
            skip = False
        if not skip:
            out.append(l)
    return '\n'.join(out)

def js_str(s):
    return json.dumps(s, ensure_ascii=False)

# 자료 파일 내용이 바뀔 때만 새로 받도록 내용 지문을 넣음
def fp(path):
    q = ROOT / path
    return hashlib.md5(q.read_bytes()).hexdigest()[:10] if q.exists() else '0'
# 새 던전 보충: wowf.io 진행 순서가 빈 던전만 채움. 우선순위 wowf.io > wythic.com(한글, 실제 클리어 기록) > 보충 파일
# (data/guides/dungeon-route-extra.json: 입구·준비·퀘스트 연결·레벨 등 wythic에 없는 칸만, wythic에 없는 보스 단계 끼워 넣기).
# 채운 칸 이름을 'x'에 적어 두어, 자료를 고치면 다음 빌드에 다시 반영되고 wowf.io에 자료가 생기면 그쪽을 씀
WY_SLUG = {'drowned-city': 16550, 'kroldok-stronghold': 16842, 'alcaz-prison': 16620, 'blackmaw-hold': 16554, 'shapers-terrace': 16667}
def _wy_steps(slug, wy, ex):
    en = {}
    for l in rd(ROOT / 'data/qdb/dungeons-wowf.txt').split('\n'):
        f = l.split('|')
        if len(f) >= 5 and f[0] == 'B' and f[1] == slug:
            en[f[3]] = f[4]
    mine = {x['nm']: x for x in (ex or {}).get('steps') or []}
    out = []
    for b in wy.get('bosses') or []:
        nm = b['npc']; tip = b.get('tip') or ''; m = mine.get(nm, {})
        rare = '희귀 정예' in tip  # 「희귀 몹 OO를 지나」 같은 길 안내는 빼려고 「희귀 정예」만
        skip = 1 if b.get('opt') and re.search('선택 보스|잡지 않고|만나지 않고', tip) else 0
        out.append({'n': 0, 'lv': m.get('lv', 0), 'nm': nm, 'en': en.get(nm) or m.get('en', ''), 'type': '희귀' if rare else '우두머리',
                    'skip': skip, 'note': '', 'tip': tip, 'wy': 1, 'q': m.get('q', [])})
    # wythic 목록에 없는 단계(퀘스트 목표·빠진 보스)는 보충 파일 순서대로 앞 단계 뒤에 끼움
    have = {x['nm'] for x in out}
    prev = None
    for x in (ex or {}).get('steps') or []:
        if x['nm'] not in have:
            i = next((k + 1 for k, y in enumerate(out) if y['nm'] == prev), len(out))
            out.insert(i, dict(x)); have.add(x['nm'])
        prev = x['nm']
    for k, x in enumerate(out):
        x['n'] = k + 1
    return out
def _dg_extra():
    p = ROOT / 'data/forg/dungeon-guide.json'
    ep = ROOT / 'data/guides/dungeon-route-extra.json'
    raw = rd(p); g = json.loads(raw)
    ex = json.loads(rd(ep)) if ep.exists() else {}
    wp = ROOT / 'data/wythic/dungeons.json'
    WYD = {d['id']: d for d in json.loads(rd(wp)).get('dungeons', [])} if wp.exists() else {}
    n = 0
    for slug in sorted(set(k for k in ex if not k.startswith('_')) | set(WY_SLUG)):
        e = ex.get(slug) or {}; wy = WYD.get(WY_SLUG.get(slug))
        t = g.setdefault(slug, {'sum': '', 'prep': [], 'floors': [], 'steps': []})
        mine = set(t.get('x') or [])
        add = {'sum': (wy or {}).get('sum') or e.get('sum'), 'prep': e.get('prep'),
               'steps': (_wy_steps(slug, wy, e) if wy and wy.get('bosses') else None) or e.get('steps')}
        for k, v in add.items():
            if v and (k in mine or not t.get(k)):
                t[k] = v; mine.add(k)
        if mine:
            src = ['wythic.com 공략(한글, 실제 클리어 기록)'] if wy and wy.get('bosses') else []
            if e.get('prep'):
                src.append('입구·준비는 출시 첫 주 공략 기록 정리')
            t['x'] = sorted(mine); t['src'] = ' · '.join(src) + ' · 패치로 바뀔 수 있어요'; n += 1
    out = json.dumps(g, ensure_ascii=False, separators=(',', ':'))
    if out != raw:
        p.write_text(out, encoding='utf-8')
    return n
print('dungeon extra', _dg_extra())
DVER = {k: fp(v) for k, v in {'fq': 'data/forg/quests.jsonl', 'rw': 'data/forg/rewards.jsonl', 'qdb': 'data/qdb/quests.jsonl', 'dgg': 'data/forg/dungeon-guide.json', 'world': 'data/qdb/world.json', 'wy': 'data/wythic/dungeons.json', 'bag': 'data/qdb/item-bag.txt'}.items()}
# 길 따라 동선 격자(data/route/*.png, tools/route/build_grid.py): 파일 전체 지문 하나 + 있는 지역 번호
_rg = sorted((ROOT / 'data' / 'route').glob('*.png'))
DVER['rg'] = hashlib.md5(b''.join(p.read_bytes() for p in _rg)).hexdigest()[:10] if _rg else '0'
DVER['rgz'] = [int(p.stem) for p in _rg]
data = '\n'.join([
    'const D_VER=' + json.dumps(DVER) + ';',
    '/* 와포 도우미 자료 — forg.gg 공개 페이지에서 GitHub Actions로 모은 것 (tools/forg-*.mjs) */',
    'const D_ITEMS=' + js_str(ITEMS_TXT) + ';',
    'const D_SRC=' + js_str(SRC_TXT) + ';',
    'const D_QLV=' + json.dumps(QLV, separators=(',', ':')) + ';',
    'const D_GUIDE=' + json.dumps(_guide(), separators=(',', ':')) + ';',
    'const D_SIMW=' + (rd(F / 'sim-weights.json') if (F / 'sim-weights.json').exists() else '{}') + ';',
    'const D_DGL=' + js_str(_dgl()) + ';',
    'const D_DQ=' + js_str(_dq()) + ';',
    'const D_NPCKO=' + json.dumps(_npcko_q(), ensure_ascii=False, separators=(',', ':')) + ';',
    'const D_RWNM=' + json.dumps(_rwnm(), ensure_ascii=False, separators=(',', ':')) + ';',
    'const D_LVL=' + js_str(_lvl_forever(rd(F / 'leveling.txt'))) + ';',
    'const D_BOSS=' + js_str(rd(F / 'bosses.txt') if (F / 'bosses.txt').exists() else '') + ';',
    'const D_AB=' + js_str('\n'.join(l for l in rd(ROOT / 'data/guides/abilities.txt').split('\n') if l and not l.startswith('# '))) + ';',
    'const D_CLS=' + json.dumps(slim, ensure_ascii=False, separators=(',', ':')) + ';',
    PROFS_JS,
    'const PICO=' + json.dumps(PICO, ensure_ascii=False, separators=(',', ':')) + ';',
    'const D_MATID=' + json.dumps(MATID, ensure_ascii=False, separators=(',', ':')) + ';',
    'const D_SETS=' + json.dumps(_sets(), ensure_ascii=False, separators=(',', ':')) + ';',
    rd(A / 'hubs.js'),
])
(ROOT / 'app-data.js').write_text(data, encoding='utf-8')
ver = hashlib.md5(data.encode()).hexdigest()[:8]
app = rd(A / 'app.js'); css = rd(A / 'style.css') + ('\n' + rd(A / 'theme.css') if (A / 'theme.css').exists() else '')
# 글씨 크기 설정(--fs 배율): 모든 font-size px를 배율과 곱함
css = re.sub(r'font-size:\s*([\d.]+)px', r'font-size:calc(\1px*var(--fs,1))', css)
css = re.sub(r'(font:\s*(?:(?:italic|normal|bold|[1-9]00)\s+)*)([\d.]+)px', r'\1calc(\2px*var(--fs,1))', css)
aver = hashlib.md5((app + css + ver).encode()).hexdigest()[:6]
# 화면 아래에 「사이트 업데이트 날짜」를 보여 줌. 내용이 그대로면 예전 날짜를 그대로 둠(자동 갱신 때 괜히 바뀌지 않게)
import datetime
_prev = (ROOT / 'index.html').read_text(encoding='utf-8') if (ROOT / 'index.html').exists() else ''
_m = re.search(r'/\* v' + aver + r' @([^*]+) \*/', _prev)
stamp = _m.group(1) if _m else datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9))).strftime('%m/%d %H:%M')
app = app.replace("'__BUILD__'", repr(stamp))
html = f'''<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#15130f">
<link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="img/apple-touch-icon.png"><link rel="icon" href="img/icon-192.png">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="와포 도우미"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<title>와포 도우미</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@700&display=swap">
<meta name="description" content="와우 포에버 얼라이언스 레벨업·장비·퀘스트·던전 도우미">
<style>{css}</style></head>
<body><div id="app"><p class="boot">불러오는 중…</p></div>
<script src="app-data.js?v={ver}"></script>
<script>/* v{aver} @{stamp} */
{app}</script>
<script>if('serviceWorker' in navigator&&location.protocol==='https:')addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{{}}))</script>
</body></html>'''
(ROOT / 'index.html').write_text(html, encoding='utf-8')
print('index.html', len(html), 'app-data.js', len(data))

# 애드온용 보스 공략 (abilities.txt → BossTips.lua): 한글·영어 보스 이름 둘 다로 찾기
def _boss_lua():
    dgg = json.loads(rd(ROOT / 'data/forg/dungeon-guide.json'))
    en2ko = {}
    for slug, g in dgg.items():
        for st in g.get('steps', []):
            if st.get('en') and st.get('nm'):
                en2ko.setdefault(slug, {})[st['en']] = st['nm']
    LB = {'dz': '위험', 'int': '끊기', 'av': '피하기', 'add': '쫄', 'tk': '탱커', 'hl': '치유', 'info': '참고'}
    DK = {'magic': '마법', 'curse': '저주', 'poison': '독', 'disease': '질병', 'purge': '정화'}
    cur = None; boss = None; T = {}
    for l in rd(ROOT / 'data/guides/abilities.txt').split('\n'):
        if not l or l.startswith('# '):
            continue
        if l[0] == '@':
            cur = l[1:]; continue
        if l[0] == '#':
            boss = l[1:]; T.setdefault((cur, boss), []); continue
        f = l.split('|')
        if len(f) < 5 or not boss:
            continue
        t, _, k = f[0].partition(':')
        lab = ('해제(' + DK.get(k, k) + ')') if t == 'dis' else LB.get(t, t)
        x = f[4].split('→')
        tip = (f[1] + ' — ' + x[-1].strip()) if len(x) > 1 else (f[1] + ' — ' + f[4].strip())
        if len(tip) > 70:
            tip = tip[:69] + '…'
        T[(cur, boss)].append(t + '|' + lab + '|' + tip)
    def q(v):
        return '"' + v.replace('\\', '\\\\').replace('"', '\\"') + '"'
    out = ['-- 자동 생성 (app/build.py) · 보스 이름(한글/영어) → 공략 줄 "종류|이름표|내용"', 'WowfHelperBoss = {}', 'local B = WowfHelperBoss']
    n = 0
    for (slug, en), lines in T.items():
        if not lines:
            continue
        n += 1
        out.append('do local t = {' + ', '.join(q(x) for x in lines) + '}')
        out.append('B[' + q(en) + '] = t')
        ko_ = en2ko.get(slug, {}).get(en)
        if ko_ and ko_ != en:
            out.append('B[' + q(ko_) + '] = t')
        out.append('end')
    (ROOT / 'addon' / 'WowfHelper' / 'BossTips.lua').write_text('\n'.join(out) + '\n', encoding='utf-8')
    return n
print('boss tips', _boss_lua())
# 애드온 /wfh 아이템 이 게임에서 읽을 아이템 번호 (앱 장비 목록). 쓸모 큰 것부터:
# 특수 효과 → 영어 이름 → 무기 → 포에버 전용(10만 넘는 번호) → 나머지
def _item_list_lua():
    import hashlib
    rows = [l.split('|') for l in ITEMS_TXT.split('\n') if l]
    WEAP = {'1h', 'mh', 'oh', '2h', 'ra'}
    def pri(f):
        nm = f[12] if len(f) > 12 else ''
        if len(f) > 6 and f[6] == '1': return 0
        if not re.search('[가-힣]', nm): return 1
        if f[2] in WEAP: return 2
        if int(f[0]) > 100000: return 3
        return 4
    ids = [int(f[0]) for f in sorted(rows, key=lambda f: (pri(f), int(f[0])))]
    def b36(n):
        d = '0123456789abcdefghijklmnopqrstuvwxyz'; o = ''
        while True:
            n, r = divmod(n, 36); o = d[r] + o
            if not n: return o
    body = ','.join(b36(i) for i in ids)
    ver = hashlib.md5(body.encode()).hexdigest()[:8]
    txt = ('-- 앱이 만든 파일 (app/build.py). /wfh 아이템 이 게임에서 읽을 아이템 번호 %d개 (36진수, 쓸모 큰 것부터)\n'
           'WowfHelper_ItemListVer = "%s"\nWowfHelper_ItemList = "%s"\n') % (len(ids), ver, body)
    (ROOT / 'addon' / 'WowfHelper' / 'ItemList.lua').write_text(txt, encoding='utf-8')
    return len(ids)
print('addon item list', _item_list_lua())
# 애드온 묶음 (addon/WowfHelper → addon/WowfHelper.zip), 내용이 같으면 그대로
import zipfile, io
_src = ROOT / 'addon' / 'WowfHelper'
if _src.exists():
    _buf = io.BytesIO()
    with zipfile.ZipFile(_buf, 'w', zipfile.ZIP_DEFLATED) as z:
        for f in sorted(_src.iterdir()):
            zi = zipfile.ZipInfo('WowfHelper/' + f.name, date_time=(2026, 1, 1, 0, 0, 0))
            zi.compress_type = zipfile.ZIP_DEFLATED
            z.writestr(zi, f.read_bytes())
    _out = ROOT / 'addon' / 'WowfHelper.zip'
    if not _out.exists() or _out.read_bytes() != _buf.getvalue():
        _out.write_bytes(_buf.getvalue())
