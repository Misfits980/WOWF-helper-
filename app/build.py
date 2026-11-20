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
# 설명·운영 순서 글에 영어로 남은 포에버 기술·특성 이름 → 게임 한글 이름(게임 핫픽스 캐시 SpellName: 찌르기 1329283)
_ENKO = {'Shank': '찌르기', 'Predatory Discipline': '포식자의 절제', 'Holy Binding': '신성 결속', 'Flash of Steel': '강철의 섬광',
         'Boot Knife': '장화 칼', 'Turn Evil': '악령 퇴치', 'Bloom': '피워내기', 'Blood Splatter': '피 뿌리기'}


def _enko(t):
    for k, v in _ENKO.items():
        t = re.sub(r'\b' + re.escape(k) + r'\b', v, t)
    return t


def _ldesc_any(c, name):
    return next((x[7] for x in c['learns'] if x[1] == name and (x[7] or '').strip()), '')


_tkf = ROOT / 'data/guides/talent-ko.json'
# 포에버 새 특성 중 forg 자료에 영어 이름만 있는 것: 게임 핫픽스 캐시(Cache/ADB/koKR/DBCache.bin)의 SpellName을 특성 아이콘(SpellMisc)으로 찾아 맞춘 한글 이름
_TKN = {"paladin/retribution-turn-evil": "악령 퇴치", "rogue/combat-flash-of-steel": "강철의 섬광", "rogue/subtlety-boot-knife": "장화 칼", "priest/holy-holy-binding": "신성 결속", "druid/feral-combat-predatory-discipline": "포식자의 절제", "druid/restoration-bloom": "피워내기", "rogue/assassination-blood-splatter": "피 뿌리기"}
_TKO = {k: v for k, v in json.loads(_tkf.read_text(encoding='utf-8')).items() if not k.startswith('_')} if _tkf.exists() else {}
# 딜 사이클 여는 법(data/guides/openers.json): [기술 이름] → [이름@배우는 레벨] / 특성은 [이름@그 전문화 가이드가 찍는 레벨*]
# 이름이 그 직업 기술·특성에 없으면 괄호를 벗겨 글로 두고 알려 줌(잘못 적은 이름 찾기)
_OPN_RAW = json.loads(rd(ROOT / 'data/guides/openers.json')) if (ROOT / 'data/guides/openers.json').exists() else {}
_OPN_MISS = []
# 전문화별 「포에버에서 달라진 점·레벨업 팁」(data/guides/spec-tips.json, 우리 말로 정리)
_STIP = {k: v for k, v in json.loads(rd(ROOT / 'data/guides/spec-tips.json')).items() if not k.startswith('_')} if (ROOT / 'data/guides/spec-tips.json').exists() else {}
def _opener(cid, c, s):
    o = _OPN_RAW.get(cid + '/' + s['id'])
    if not o:
        return None
    lv = {}
    for l in c['learns']:
        if l[4] in ('', 'alliance', None):
            lv[l[1]] = min(lv.get(l[1], 99), l[0])
    tal = {v['n']: k for k, v in c['talents'].items()}
    for k_, v_ in _TKN.items():
        if k_.startswith(cid + '/'):
            tal[v_] = k_.split('/', 1)[1]
    def tok(m):
        n = m.group(1).strip()
        if n in lv:
            return '[%s@%d]' % (n, lv[n])
        if n in tal:
            st = [x[0] for x in s['steps'] if x[1] == tal[n]]
            return '[%s@%d*]' % (n, min(st)) if st else '[%s*]' % n
        _OPN_MISS.append(cid + '/' + s['id'] + ': ' + n)
        return n
    R = lambda t: re.sub(r'\[([^\]@*]+)\]', tok, t or '')
    return {'pre': R(o.get('pre')), 'open': [R(x) for x in o.get('open') or []], 'cd': R(o.get('cd')), 'src': o.get('src') or ''}
for cid, c in cls.items():
    used = set(x[1] for s in c['specs'] for x in s['steps'])
    slim[cid] = {
        'name': c['name'], 'trees': c['trees'], 'tic': c.get('tic', []),
        # 8번째 칸 = 종족 전용 기술의 종족(사제 종족 기술: 노움은 교란의 섬광·비상 대책만), 빈칸이면 모두
        'learns': [[l[0], l[1], l[2], l[3], l[4], l[6], (_LDESC.get(l[1]) or l[7] or _ldesc_any(c, l[1]))[:90], _LRACE.get(l[5] or '', '')] for l in c['learns']
                   if l[4] in ('', 'alliance', None) and (cid, l[1]) not in _LDROP],
        # 특성 칸(게임처럼 줄·칸·선행 화살표)을 그리려고 모든 특성을 넣음: [이름, 트리, 최대, 아이콘, 설명, 줄, 칸, 선행]
        'talents': {k: [_TKN.get(cid + '/' + k) or v['n'], v['t'], v['max'], v.get('icon', ''), _enko(_TKO.get(cid + '/' + k) or (v.get('d') or '')[:110]), v.get('tier', 0), v.get('col', 0), v.get('req') or 0] for k, v in c['talents'].items()},
        'specs': [{'id': s['id'], 'name': s['name'], 'icon': s['icon'], 'steps': s['steps'],
                   'rot': [[_enko(r['when']), _enko(r['txt'])] for r in s['rotation']],
                   'early': [[_enko(r['when']), _enko(r['txt'])] for r in s['early']],
                   'late': [[_enko(r['when']), _enko(r['txt'])] for r in s['late']], 'open': _opener(cid, c, s), 'tips': _STIP.get(cid + '/' + s['id'])} for s in c['specs']],
    }
if _OPN_MISS:
    print('딜 사이클: 기술·특성 목록에 없는 이름', len(_OPN_MISS), _OPN_MISS[:30])

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
                fix[f[0]] = (f[1], f[2] + '–' + f[3], f[5].strip() if len(f) > 5 else '')
    out = []
    for l in rows:
        f = l.split('|')
        if f[0] in fix:
            f[4], f[5], nm = fix[f[0]]
            # 6번째 칸 = 게임 「파티 찾기」 이름. 예전 이름은 10번째 칸에 남겨 퀘스트 지역 이름 맞추기에 씀
            if nm and nm != f[1]:
                f += [''] * (9 - len(f))
                f = f[:9] + [f[1]]
                f[1] = nm
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
            # 부위 줄은 「(n) 세트: …」 효과 줄 앞까지만 — wowf.io 툴팁은 (0/6)인데 부위가 4줄뿐인 세트가 있어 효과 2줄이 부위로 들어가고 (2)·(3) 효과가 빠졌음(세트 18개)
            parts = []
            for y in L[i + 1:i + 1 + n]:
                if re.match(r'^\(\d+\) 세트: ', y):
                    break
                parts.append(y)
            bon = []
            for y in L[i + 1 + len(parts):]:
                mb = re.match(r'^\((\d+)\) 세트: (.+)$', y)
                if mb:
                    bon.append([int(mb.group(1)), _qfix(mb.group(2))])
            if nm not in out or len(bon) > len(out[nm][2]):
                out[nm] = [nm, parts, bon, n]  # n = 게임 툴팁 (0/N)
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
    # 포에버가 던전 퀘스트에 더한 보상(예: 아그몬드의 운명 704 = 발굴조사단장의 장갑 + 새 복원가의 고운 장갑):
    # forg 아이템 출처(sources.txt의 /forever/quest/번호)가 이 퀘스트인데 보상 목록에 없는 템을 넣고, 2개 이상이면 「하나 고르기」
    QSRC = {}
    for i, l in enumerate(rd(F / 'sources.txt').split('\n')):
        m = re.search(r'/forever/quest/(\d+)', l)
        if m:
            QSRC[str(i)] = m.group(1)
    BYQ = {}
    for l in rd(F / 'items.txt').splitlines():
        p_ = l.split('|')
        if len(p_) > 7 and p_[0].isdigit():
            for s_ in p_[7].split(','):
                if s_ in QSRC:
                    BYQ.setdefault(QSRC[s_], []).append(p_[0])
    # 받는 곳(NPC·지역·좌표)은 퀘스트 자료(QuestieDB) 값이 맞으면 그걸로:
    #  forg 자료가 다른 퀘스트 좌표를 붙인 것(크라젝 → 타나리스 트란렉 좌표 51.6, 26.8. 실제 무법항 26.9, 77.2)이나
    #  「시작 · 강물터」처럼 NPC·좌표가 빠진 것. 대륙 이름·좌표 없는 것(-1)은 안 씀
    QG = {}
    if (Q / 'quests.jsonl').exists():
        for line in rd(Q / 'quests.jsonl').splitlines():
            o = json.loads(line)
            g = o.get('g') or []
            if len(g) > 3 and g[3] == 'npc' and g[0] and g[1] and g[1] not in ('동부 왕국', '칼림도어') and re.match(r'^\d', g[2] or '') \
                    and not re.search('[A-Za-z]{3}', g[0]):
                x, y = (float(v) for v in g[2].split(','))
                QG[str(o['id'])] = (g[0], g[1], x, y)
    out = []
    for l in base.split('\n'):
        f = l.split('|')
        if f[0] == 'Q' and len(f) > 8 and f[3] != 'horde' and f[2] in QG and not re.search('던전 안|입구 앞', f[8]):
            n_, z_, x_, y_ = QG[f[2]]
            m_ = re.match(r'^(.+?) · (.+?) ([\d.]+), ([\d.]+)$', f[8])
            if (m_ and (m_.group(2) != z_ or abs(float(m_.group(3)) - x_) > 3 or abs(float(m_.group(4)) - y_) > 3 or re.search('[A-Za-z]{3}', m_.group(1)))) \
                    or (not m_ and (not f[8] or f[8].startswith('시작 · ') or f[8].endswith(' · '))):  # 영어로 남은 NPC 이름(Image of Archmage Modera)도 한글로
                f[8] = '%s · %s %.1f, %.1f' % (n_, z_, x_, y_); l = '|'.join(f)
        if f[0] == 'Q' and len(f) > 6 and re.search('[A-Za-z]{3}', f[6]) and QN.get(f[2]):
            f[6] = QN[f[2]]; l = '|'.join(f)
        if f[0] == 'Q' and f[2] in BYQ:
            while len(f) < 14: f.append('')
            rw = [x for x in f[10].split(',') if x]
            more = [x for x in BYQ[f[2]] if x not in rw]
            if more:
                f[10] = ','.join(rw + more)
                if len(rw + more) > 1:
                    f[12] = '1'
                l = '|'.join(f)
        out.append(l)
    return _dq_inside('\n'.join(out))


def _dq_names(ko):
    """설명에서 찾을 던전 이름: 「발굴 현장: 저습지」→ 발굴 현장, 「스트라솔름 (정문)」→ 스트라솔름 (두 글자 이하는 안 씀)"""
    out = {ko} if ko else set()
    if ko:
        out.add(ko.split(':')[0].strip())
        out.add(re.sub(r'\s*\(.*?\)', '', ko).strip())
    return [x for x in out if len(x) > 2]


def _dq_inside(base):
    """던전 퀘스트 나누기 자료 — f[15] 「던전 안에서 해야 함」('1'), f[16] 「어디서 받나」('i' = 이 던전 안 · '' = 밖)
    앱 dqList: 밖에서 받는데 앞 단계에 f[15]인 퀘스트가 있으면 「던전 끝나고 이어서」(첫 판 전엔 못 받음).
    던전 안에서 해야 함: 안에서 받음 / 던전 안 목표(f[11]) / 설명에 던전 이름 / 목표 몹·물건이 그 던전 몹·보스
      / 목표에 바깥 좌표가 없음(인스턴스 안). 틀리는 것(만든 물건 — 승천의 인장 2부)은 안에서 받는 퀘스트라 칸엔 영향 없음, 필요하면 DQ_FIX
    안에서 받음: 받는 곳 글에 던전 안·곳곳·몇 층 / QuestieDB 받는 NPC·물건 지역이 이 던전(검은바위 첨탑 = 하층·상층) /
      물건 떨구는 몹이 이 던전 몹 / 물건으로 시작하는데 바깥 좌표가 없음 (「입구 앞」 NPC는 밖)
    DQ_FIX: 자료로 못 맞추는 것만 손으로(이유 적기)"""
    KO = {}
    for l in _dgl().split('\n'):
        g = l.split('|')
        if len(g) > 1 and g[1]:
            KO[g[0]] = g[1]
    MOB = {}
    for l in base.split('\n'):
        if l.startswith('B|'):
            g = l.split('|')
            MOB.setdefault(g[1], set()).update(x.split('=', 1)[1] for x in (g[2] if len(g) > 2 else '').split(';') if '=' in x)
    m3 = ROOT / 'data' / 'guides' / 'dungeon-maps3d.json'
    if m3.exists():
        for slug, dd in json.loads(rd(m3)).items():
            if not isinstance(dd, dict):
                continue
            for fl in dd.get('floors') or []:
                for pk in ((fl.get('mob') or {}).get('p') or []):
                    if len(pk) > 7 and isinstance(pk[7], list):
                        MOB.setdefault(slug, set()).update(m[0] for m in pk[7] if m and isinstance(m[0], str))
    QX = {}
    if (Q / 'quests.jsonl').exists():
        for line in rd(Q / 'quests.jsonl').splitlines():
            o = json.loads(line)
            QX[str(o['id'])] = o
    out = []
    for l in base.split('\n'):
        f = l.split('|')
        if f[0] == 'Q' and len(f) > 8:
            sl, ko_, qid, st = f[1], KO.get(f[1], ''), f[2], f[8]
            X = QX.get(qid) or {}
            g = X.get('g') or []
            gz = g[1] if len(g) > 1 else None
            gdrop = g[4] if len(g) > 4 else None
            # 어디서 받나
            sin = ''
            if re.search(r'던전 안|던전 곳곳|\d층', st):
                sin = 'i'
            elif '입구 앞' not in st:
                if gz and ko_ and (gz == ko_ or (gz == '검은바위 첨탑' and ko_.startswith(gz + ' '))):  # 퀘스트 자료는 하층·상층을 한 이름으로 씀(스톰윈드 ≠ 스톰윈드 지하감옥)
                    sin = 'i'
                elif ' · ' not in st or st == '아이템에서 시작':
                    # 물건으로 시작하는데 바깥 좌표가 없음 = 던전 안에서 줍는 것(피로 얼룩진 양피지·크롤도크 거푸집 등)
                    if not (len(g) > 2 and g[2] and g[2] != '-1.0,-1.0' and gz != ko_):
                        sin = 'i'
                elif len(g) > 3 and g[3] == 'item' and gdrop and gdrop in MOB.get(sl, set()):
                    sin = 'i'
            if qid in DQ_FIX.get('sin', {}):
                sin = DQ_FIX['sin'][qid]
            # 던전 안에서 해야 함
            tg = [t for t in (X.get('t') or []) if isinstance(t, list) and len(t) > 2]
            names = {m[0] for t in tg if isinstance(t[2], list) for m in t[2] if m and isinstance(m[0], str)}
            names |= {t[1] for t in tg if isinstance(t[1], str) and t[0] in ('수집', '사용', '처치')}
            # 목표에 바깥 좌표가 없음: QuestieDB는 인스턴스 안 몹·물건엔 바깥 좌표가 없음(첨탑 하층 「파멸의 궤」, 상층 「부화장 알」 등)
            noloc = bool([t for t in (X.get('t') or []) if isinstance(t, list) and len(t) > 1]) and all(len(t) < 4 or not t[3] for t in (X.get('t') or []) if isinstance(t, list) and len(t) > 1)
            ins = sin == 'i' or bool(len(f) > 11 and f[11].strip()) or any(nm_ in (f[7] or X.get('o', '')) for nm_ in _dq_names(ko_)) \
                or bool(names & MOB.get(sl, set())) or noloc
            if qid in DQ_FIX.get('ind', {}):
                ins = DQ_FIX['ind'][qid]
            while len(f) < 18: f.append('')
            f[15] = '1' if ins else ''
            f[16] = sin
            f[17] = DQ_FIX['pre'].get(qid, '')
            l = '|'.join(f)
        out.append(l)
    return '\n'.join(out)


# 자료로 못 맞추는 던전 퀘스트 손보기 — 이유를 꼭 적기
DQ_FIX = {
    # f[17] 자료에 빠진 앞 단계(쉼표로 여러 개)
    'pre': {
        '95264': '95262',  # 쇼가 알아야 할 일: 앞 단계 95263이 퀘스트 자료에 없음 — 「비밀 감옥」(알카즈 감옥 안에서 알아내기) 다음, 같은 설리가 줌
    },
    'sin': {},
    'ind': {
        '1139': True,  # 잃어버린 결의의 서판: 결의의 서판은 울다만 안 물건(자료엔 좌표·몹 없음)
    },
}


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
    _GL = {}  # 핫픽스 기록의 요구 레벨 (0이 아닌 것만 · 0은 퀘스트 보상에 흔해서 안 믿음)
    for l_ in rd(Q / 'items-game.txt').splitlines():
        if l_ and not l_.startswith('#'):
            g_ = l_.split('|')
            if g_[5] == 'c' and int(g_[0]) in _WR:
                continue  # 기본 자료(핫픽스 아님)는 캐시가 그 템을 아직 못 받은 것일 수 있어, 포에버 툴팁(wowf.io)이 있으면 그쪽을 믿음
            _GM[int(g_[0])] = {k: float(v) for k, v in re.findall(r'(?:^|\s)(mp5|[a-z]+)(-?[\d.]+)(?=\s|$)', g_[4])}
            if g_[5] == 'h':
                _GQ[int(g_[0])] = 'pcurel'[int(g_[3])] if 0 <= int(g_[3]) <= 5 else None
                if g_[2].isdigit() and int(g_[2]) > 0:
                    _GL[int(g_[0])] = g_[2]
    _PRI = ('str', 'agi', 'sta', 'int', 'spi')
    _gfix = 0
    for ix, line in enumerate(items):
        f = line.split('|')
        if len(f) > 6 and _GL.get(int(f[0])) and f[1] != _GL[int(f[0])]:
            f[1] = _GL[int(f[0])]; items[ix] = '|'.join(f); _gfix += 1
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
# 게임 캐시(DBCache) 원본 능력치 — 핫픽스(h)·기본(c) 모두. 아래에서 「다른 자료에만 있는 보조 능력치」를 거르는 데 씀
_GRAW = {}
if (Q / 'items-game.txt').exists():
    for l_ in rd(Q / 'items-game.txt').splitlines():
        if l_ and not l_.startswith('#'):
            g_ = l_.split('|')
            _GRAW[int(g_[0])] = {k: float(v) for k, v in re.findall(r'(?:^|\s)(mp5|[a-z]+)(-?[\d.]+)(?=\s|$)', g_[4])}
if (Q / 'items-addon.jsonl').exists():
    from items_wowf import parse_stats as _ps, merge_stats as _ms, weapon_dps as _wd, has_special as _hs
    _AD = {}
    for l_ in rd(Q / 'items-addon.jsonl').splitlines():
        if l_:
            o_ = json.loads(l_)
            _AD[o_['id']] = o_
    _WR = globals().get('WREC', {})
    _GSK = {'STRENGTH': 'str', 'AGILITY': 'agi', 'STAMINA': 'sta', 'INTELLECT': 'int', 'SPIRIT': 'spi'}
    _an = _aq = _as = _al = _ar = 0
    _ne = set()
    _LOC = {'INVTYPE_HEAD': 'he', 'INVTYPE_NECK': 'ne', 'INVTYPE_SHOULDER': 'sh', 'INVTYPE_CLOAK': 'ba', 'INVTYPE_CHEST': 'ch', 'INVTYPE_ROBE': 'ch', 'INVTYPE_WRIST': 'wr',
            'INVTYPE_HAND': 'ha', 'INVTYPE_WAIST': 'wa', 'INVTYPE_LEGS': 'le', 'INVTYPE_FEET': 'fe', 'INVTYPE_FINGER': 'fi', 'INVTYPE_TRINKET': 'tr', 'INVTYPE_2HWEAPON': '2h',
            'INVTYPE_WEAPON': '1h', 'INVTYPE_WEAPONMAINHAND': 'mh', 'INVTYPE_WEAPONOFFHAND': 'oh', 'INVTYPE_SHIELD': 'oh', 'INVTYPE_HOLDABLE': 'ho',
            'INVTYPE_RANGED': 'ra', 'INVTYPE_RANGEDRIGHT': 'ra', 'INVTYPE_THROWN': 'ra', 'INVTYPE_RELIC': 'ra'}
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
        # 요구 레벨도 게임 툴팁 값(「최소 요구 레벨 21」)으로: 다른 자료의 옛 값(20)이 남아 1~2레벨 일찍 추천하던 것 (140개)
        if isinstance(o_.get('req'), int) and o_['req'] > 0 and f[1] != str(o_['req']):
            f[1] = str(o_['req']); _ar += 1
        L_ = o_.get('lines') or []
        _cur = {k: float(v) for k, v in re.findall(r'(?:^|\s)(mp5|[a-z]+)(-?[\d.]+)(?=\s|$)', f[5])}
        _new = _ms(_cur, _ps(L_))
        # 보조 능력치(전투력·주문력·치유량·학파 공격력·마나·방어·적중·치명타·회피 등)도 게임 값이 정답:
        #  - 툴팁에 착용 효과 줄이 있으면 → 그 줄에서 읽은 것만 (다른 자료의 옛 값이 남아 「냉기 13」 템이 주문력 18·치유량 18로 잡히던 것)
        #  - 착용 효과 줄이 없고 게임 캐시(DBCache)가 있으면 → 캐시에 있는 것만 (미스릴 코이프 전투력 30처럼 다른 판 서버 값이 남던 것)
        #  - 방패 피해 방어(block)·방어도(armor)는 툴팁 효과 줄이 아니라서 그대로
        _SEC = ('ap', 'sp', 'heal', 'fire', 'frost', 'shadow', 'nature', 'arcane', 'holy', 'mp5', 'def', 'hit', 'shit', 'crit', 'scrit', 'dodge', 'parry', 'blockp', 'exp', 'rap')
        if not any('무작위' in x for x in L_):
            # 착용·사용·발동 효과 글이 하나라도 있으면 주문 글까지 다 불러온 툴팁 → 효과 줄에 없는 보조 능력치는 없는 것 (예: 비운의 검 전투력 16, 줄구룹 세트 장신구 주문력 12)
            if any(x.startswith(('착용 효과', '사용 효과', '발동 효과', '적중 시')) for x in L_):
                _p = _ps(L_)
                _new = {k: v for k, v in _new.items() if k not in _SEC}
                _new.update({k: v for k, v in _p.items() if k in _SEC})
            elif L_ and int(f[0]) in _GRAW:
                _g = _GRAW[int(f[0])]
                _new = {k: v for k, v in _new.items() if k not in _SEC}
                _new.update({k: v for k, v in _g.items() if k in _SEC})
        _gp = {_GSK[k]: v for k, v in (o_.get('gs') or {}).items() if k in _GSK}
        if (_gp or L_) and not any('무작위' in x for x in L_):  # 무작위 옵션 템(「…의 ○○」)은 기본 템에 주 능력치가 없음
            for k in ('str', 'agi', 'sta', 'int', 'spi'):
                _new.pop(k, None)
            _new.update(_gp)
        _w = _wd(L_) or (round((o_.get('gs') or {}).get('DAMAGE_PER_SECOND') or 0, 2) if f[3].startswith('2.') else 0)  # 「공격력 1」처럼 최소·최대가 같은 무기는 글로 못 읽음 → 게임 값
        if _w and ('dps' in _cur or f[3].startswith('2.')):  # 투척 무기처럼 초당 공격력이 빠져 있던 무기도 게임 값으로
            _new['dps'] = _w
        # 장착 자리도 게임 값으로: 「주장비 전용」을 한손(보조 손 가능)으로 잡아 쌍수 보조 무기로 추천하던 것(서슬피 등 98개)
        # 방어도(게임 툴팁 「방어도 N」 = 기본 + 추가): 탱커 점수에 씀. 방어구(천·가죽·사슬·판금·망토)는 bar(화면에 안 보이는 칸, 앱 sc()가 탱커 방어도 가중치로 셈),
        # 방패는 원래 armor 칸이 전체 방어도라 게임 값으로 맞춤. 그동안 방어도는 「추가 방어도」가 있는 템 300여 개만 있어 탱커 방어도 가중치가 거의 안 쓰였음
        _ga = (o_.get('gs') or {}).get('RESISTANCE0_NAME')
        if _ga and _ga > 0:
            if f[3] in ('4.1', '4.2', '4.3', '4.4'):
                _new['bar'] = round(_ga)
            elif f[3] == '4.6':
                _new['armor'] = round(_ga)
        _sl = _LOC.get(o_.get('loc') or '')
        if _sl and f[2] != _sl:
            f[2] = _sl; _al += 1
        if o_.get('loc') == 'INVTYPE_NON_EQUIP_IGNORE':
            _ne.add(int(f[0]))  # 게임에서 장착할 수 없는 퀘스트 물건(줄파락의 나무망치 등)
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
    print('애드온이 게임에서 읽은 값으로 고침 · 이름', _an, '· 등급', _aq, '· 능력치', _as, '· 장착 자리', _al, '· 요구 레벨', _ar, '/', len(_AD))
    if _ne:
        items = [l_ for l_ in items if int(l_.split('|')[0]) not in _ne]
        print('게임에서 장착 못 하는 물건 뺌', len(_ne))
    # 게임 툴팁은 없고 게임 캐시만 있는 템: 캐시가 거의 다 담는 종류(전투력·방어 숙련·적중·회피·무기 막기 — 툴팁과 비교해 99~100%)만,
    # 캐시에 없으면 다른 판 서버 값으로 보고 뺌. 치명타·주문력·치유량·마나는 주문 효과로만 있는 템이 있어 그대로
    _RT = ('ap', 'def', 'hit', 'shit', 'dodge', 'parry')
    _rc = 0
    for ix, line in enumerate(items):
        f = line.split('|')
        if len(f) < 13 or int(f[0]) in _AD or int(f[0]) not in _GRAW:
            continue
        _cur = {k: float(v) for k, v in re.findall(r'(?:^|\s)(mp5|[a-z]+)(-?[\d.]+)(?=\s|$)', f[5])}
        _g = _GRAW[int(f[0])]
        _new = {k: v for k, v in _cur.items() if not (k in _RT and k not in _g)}
        if _new != _cur:
            f[5] = ' '.join('%s%s' % (k, ('%g' % v)) for k, v in _new.items())
            items[ix] = '|'.join(f)
            _rc += 1
    print('게임 캐시에 없는 전투력·방어·적중·회피 뺌', _rc)
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
# 퀘스트 보상 바로잡기: forever-tool(블리자드 자료) 퀘스트 보상 목록(data/forg/rewards.jsonl)과 템 출처를 맞춤
#  1) 퀘스트 보상인데 템 출처에 그 퀘스트가 없음 → 퀘스트 출처를 넣고, 「월드 드랍」·「얻는 곳 미공개」 같은 자리표시 출처는 뺌
#     (예: 하이잘 「임무 완수」 케타라스의 사슬매듭 허리띠가 월드 드랍으로만 나와 퀘스트 추천에서 빠지던 것)
#  2) 템 출처 퀘스트의 보상 목록(비어 있지 않음)에 그 템이 없고 다른 퀘스트 보상에 있으면 그 출처를 뺌
#     (예: 청동용군단의 인장 반지가 한 단계 뒤 퀘스트 보상으로 밀려 있던 것)
#  3) 퀘스트 이름이 퀘스트 자료(한글)와 다르면 퀘스트 자료 이름으로 (가라앉은 사원으로 → 아탈학카르 신전으로)
#  호드만 받는 퀘스트·퀘스트 자료에 없는 퀘스트(목록 밖 공용 퀘스트는 됨)는 넣지 않음. 포에버 새 퀘스트는 직업마다 보상이 달라서(희귀 서적)
#  보상 목록에 없다는 것만으로는 빼지 않음
def _qrw_fix(items, srcs):
    rwp = F / 'rewards.jsonl'
    if not rwp.exists() or not (Q / 'quests.jsonl').exists():
        return items, srcs
    QA = {}
    for _l in rd(Q / 'quests.jsonl').splitlines():
        _o = json.loads(_l); QA[_o['id']] = _o
    HQ_ = set(int(x) for x in rd(Q / 'horde-quests.txt').split()) if (Q / 'horde-quests.txt').exists() else set()
    NL_ = set(int(x) for x in rd(Q / 'quests-nolist.txt').split()) if (Q / 'quests-nolist.txt').exists() else set()
    ok_q = lambda q: q not in HQ_ and (q in QA or q in NL_)
    RW_, BY_ = {}, {}
    for _l in rd(rwp).splitlines():
        try: _r = json.loads(_l)
        except Exception: continue
        ids = []
        for _k in ('fx', 'ch'):
            for _x in _r.get(_k) or []:
                ids.append(_x[0])
        if not ids:
            continue
        RW_[_r['id']] = set(ids)
        if ok_q(_r['id']):
            for _i in ids:
                BY_.setdefault(_i, []).append(_r['id'])
    SL = srcs.split('\n')
    qix = {}
    def sq(i):
        f = SL[i].split('~') if 0 <= i < len(SL) else []
        if len(f) < 3 or f[0] != '1': return None
        m = re.search(r'(?:quest=|/quest/)(\d+)', f[2])
        return int(m.group(1)) if m else None
    for i in range(len(SL)):
        q = sq(i)
        if q is not None:
            qix.setdefault(q, i)
    # 3) 이름 맞추기
    nren = 0
    for i in range(len(SL)):
        q = sq(i)
        if q is None or q not in QA: continue
        f = SL[i].split('~'); nm = QA[q].get('n') or ''
        if f[1].startswith('퀘스트 · ') and nm and not lat(nm) and f[1][6:] != nm:
            f[1] = '퀘스트 · ' + nm; SL[i] = '~'.join(f); nren += 1
    ph = lambda i: 0 <= i < len(SL) and (SL[i].startswith('2~월드 드랍') or SL[i].startswith('3~드랍 · 얻는 곳 미공개'))
    nadd = ndel = 0
    for ix, line in enumerate(items):
        f = line.split('|')
        if len(f) < 13 or not f[0].isdigit(): continue
        iid = int(f[0]); S = [int(x) for x in re.split('[;,]', f[7]) if x.isdigit()]
        have = {sq(i) for i in S} - {None}
        alt = [q for q in BY_.get(iid, []) if q not in have]
        # 2) 밀려 있는 출처 빼기
        S2 = []
        for i in S:
            q = sq(i)
            if q is not None and q in RW_ and iid not in RW_[q] and BY_.get(iid):
                ndel += 1; continue
            S2.append(i)
        # 1) 보상 퀘스트 넣기
        for q in alt:
            if q not in qix:
                nm = QA[q]['n'] if q in QA and QA[q].get('n') and not lat(QA[q]['n']) else None
                if not nm: continue
                qix[q] = len(SL); SL.append('1~퀘스트 · %s~wh:quest=%d' % (nm, q))
            S2.append(qix[q]); nadd += 1
        if alt and any(sq(i) is not None for i in S2):
            S2 = [i for i in S2 if not ph(i)]
        if S2 != S:
            f[7] = ';'.join(str(i) for i in dict.fromkeys(S2)); items[ix] = '|'.join(f)
    print('퀘스트 보상 출처: 넣음', nadd, '· 밀린 출처 뺌', ndel, '· 이름 맞춤', nren)
    return items, '\n'.join(SL)
items, srcs = _qrw_fix(items, srcs)
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
# 납품 상자 재료(data/guides/deliver.json)도 — 예전엔 전문기술 단계 글에 나오는 재료만 넣어 광석·주괴·결정 등이 빠져 상자 21개에서 「가방에 다 있어요」가 안 나왔음
if (ROOT / 'data/guides/deliver.json').exists():
    for _c in json.loads(rd(ROOT / 'data/guides/deliver.json')).get('crates', []):
        for _n in (_c.get('need') or []):
            nm_ = str(_n[1]).strip() if isinstance(_n, list) and len(_n) > 1 else ''
            if nm_ and nm_ not in MATID and nm_ in KO_ID:
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
        m = re.match(r'^(.*· )([A-Za-z0-9][^~]*)$', f[1])
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
srcs = srcs.replace("(Temple of Ahn'Qiraj)", '(안퀴라즈 사원)').replace("Temple of Ahn'Qiraj", '안퀴라즈 사원')
# 던전 이름을 게임 「파티 찾기」 이름으로 바꾼 것(dungeon-levels.txt 6번째 칸) → 아이템 출처 글에도
for _l in _dgl().split('\n'):
    _f = _l.split('|')
    if len(_f) > 9 and _f[9]:
        srcs = srcs.replace(_f[9], _f[1])
# 레이드·PvP 출처 표시(4번째 칸): r = 레이드(레이드 보스·레이드 몹 드랍, 레이드 퀘스트 보상, 레이드 평판 상인, 월드 보스)
#   p = 명예·전장 평판 상인 · 전장(알터랙·전쟁노래·아라시) 퀘스트. 앱의 「퀘스트만·던전만·퀘스트+던전」 추천에서 빼고, r은 「레이드까지」에서만 셈
_RAIDZ = ('화산 심장부', '오닉시아의 둥지', '검은날개 둥지', '줄구룹', '안퀴라즈 폐허', '안퀴라즈 사원', '낙스라마스')
_RAIDNPC = {12118, 11982, 12259, 12057, 12264, 12056, 11988, 12098, 12018, 11502, 10184,
            12435, 13020, 12017, 11983, 14601, 11981, 14020, 11583, 10162,
            14517, 14507, 14510, 14509, 14515, 14834, 11382, 15114, 15082, 15083, 15084, 15085, 11380,
            15348, 15341, 15340, 15370, 15369, 15339,
            15263, 15511, 15543, 15544, 15516, 15510, 15299, 15509, 15275, 15276, 15517, 15727, 15589,
            15956, 15953, 15952, 15954, 15936, 16011, 16061, 16060, 16062, 16063, 16064, 16065, 16028,
            15931, 15932, 15928, 15989, 15990,
            6109, 12397, 14889, 14887, 14890, 14888, 15305, 15203, 15204, 15205, 14457, 14461, 14464, 14454}
_RAIDNM = re.compile(r'^(라그나로스|네파리안|오닉시아|크로마구스|에본로크|플레임고르|주술사 진도|에메리스|이손드레|레손|타에라|아주어고스|군주 카자크|'
                     r'군주 스퀄|왕자 스칼레녹스|남작 카줌|대장군 휠락시스|공주 템페스트리아|남작 차르|아발란치온|칼날바람|쑨|제왕 베클로어|제왕 베크닐라쉬|'
                     r'아우로|공주 후후란|비시디우스|불굴의 판크리스|전투감시병 살투라|예언자 스케람|귀부인 팰리나|패치워크|역병술사 노스|로데브|사피론|켈투자드)$')
_PVPV = ('선임하사 클레이트', '부관 잭스프링', '사무엘 호키', '일리야나 문블레이즈')
_RQ, _QNR, _PQ = set(), {}, set()
if (Q / 'quests.jsonl').exists():
    _qa = [json.loads(l) for l in rd(Q / 'quests.jsonl').splitlines() if l.strip()]
    for o in _qa:
        g = o.get('g') or [None, None]
        rq = o.get('rq') or []
        if (o.get('z') in _RAIDZ or o.get('z') == '전설' or (len(g) > 1 and (g[1] in _RAIDZ or g[1] == "Temple of Ahn'Qiraj"))
                or (rq and rq[0] in (910, 270))):
            _RQ.add(o['id'])
    _ch = True
    while _ch:  # 레이드 퀘스트 다음 퀘스트도 레이드
        _ch = False
        for o in _qa:
            if o['id'] not in _RQ and any(p in _RQ for p in (o.get('pre1') or [])):
                _RQ.add(o['id']); _ch = True
    for o in _qa:
        _QNR.setdefault(o.get('n'), []).append(o['id'] in _RQ)
    _PQ = set(o['id'] for o in _qa if o.get('z') in ('알터랙 계곡', '전쟁노래 협곡', '아라시 분지'))  # 전장 퀘스트 = PvP
# 아이템 영어 → 한글 이름 (낙스라마스·안퀴라즈 보상 퀘스트는 출처에 영어 이름만 있고, 그 이름이 보상 아이템 이름과 같음)
_IENKO = {}
for _fn in ('item-en-ko.txt', 'item-en-ko2.txt'):
    if (Q / _fn).exists():
        for _l in rd(Q / _fn).splitlines():
            if '|' in _l:
                _en, _ko = _l.split('|', 1)
                _IENKO.setdefault(_en.strip(), _ko.strip())
# 출처에 영어 이름만 있고 한글 퀘스트 자료로도 못 찾는 클래식 레이드 퀘스트(줄구룹 잔달라 · 안퀴라즈 폐허·사원)
_RAIDQ_EN = {'Strength of Mount Mugamba', "The Heathen's Brand", 'The Pebble of Kajaro', "The Maelstrom's Tendril",
             'The Path of the Invoker', 'Signet of the Unseen Path', "Conqueror's Crown", 'The Savior of Kalimdor'}
def _qcr():
    """퀘스트 자료(2MB)가 오기 전에 쓰는 표: 직업·종족 제한 [cls, rc] · 아이템 출처에 있지만 퀘스트 자료에 없는 퀘스트는 [-1, -1](자료 뒤엔 qGone이 「얻을 수 없음」으로 봄)"""
    qa = _qa if (Q / 'quests.jsonl').exists() else []
    out = {str(o['id']): [o.get('cls') or 0, o.get('rc') or 0] for o in qa if o.get('cls') or o.get('rc')}
    have = set(o['id'] for o in qa)
    if have:
        for m in set(int(x) for x in re.findall(r'(?:quest=|/quest/)(\d+)', srcs)):
            if m not in have:
                out[str(m)] = [-1, -1]
    return out
def _qnmap():
    """퀘스트 번호 없이 이름만 있는 퀘스트 출처 → 퀘스트 번호. 퀘스트 자료(2MB)가 오기 전에도 앱이 자료 뒤(qByName)와 같은 퀘스트를 찾게.
    앱이 자료를 읽을 때 빼는 것(영어 이름·목표 둘 다 영어, 같은 이름·지역에 호드 도시 쪽 짝)을 똑같이 빼고 파일 순서의 첫 번호"""
    qa = _qa if (Q / 'quests.jsonl').exists() else []
    if not qa:
        return {}
    lat = lambda t: bool(re.search(r'[A-Za-z]{3}', t or '')) and not re.search(r'[가-힣]', t or '')
    M = [o for o in qa if not (lat(o.get('n')) and lat(o.get('o')))]
    HZ = re.compile(r'^(듀로타|멀고어|티리스팔 숲|은빛소나무 숲|오그리마|언더시티|썬더 블러프)$')
    byN, drop = {}, set()
    for o in M:
        byN.setdefault(str(o.get('n')) + '|' + str(o.get('z')), []).append(o)
    for L in byN.values():
        if len(L) < 2:
            continue
        ok = [o for o in L if not (o.get('g') and HZ.match((o['g'][1] if len(o['g']) > 1 else '') or ''))]
        if ok and len(ok) < len(L):
            drop.update(o['id'] for o in L if o not in ok)
    first = {}
    for o in M:
        if o['id'] not in drop:
            first.setdefault(re.sub(r'\s', '', str(o.get('n') or '')), o['id'])
    names = set()
    for l in SRC_TXT.split('\n'):
        f = l.split('~')
        if len(f) >= 2 and f[0] == '1':
            hr = f[2] if len(f) > 2 else ''
            if not re.search(r'(?:quest=|/quest/)\d+', hr) and not hr.startswith('dg:'):
                names.add(re.sub(r'\s', '', f[1].replace('퀘스트 · ', '', 1)))
    return {k: first[k] for k in sorted(names) if k in first}
def _rflag(l):
    f = l.split('~')
    if len(f) < 2:
        return l
    k, lb, hr = f[0], f[1], (f[2] if len(f) > 2 else '')
    fl = ''
    if k == '1':
        m = re.search(r'(?:quest=|/quest/)(\d+)', hr)
        if m:
            fl = 'r' if int(m.group(1)) in _RQ else 'p' if int(m.group(1)) in _PQ else ''
        elif not hr.startswith('dg:'):
            nm = lb.replace('퀘스트 · ', '', 1)
            v = _QNR.get(nm)
            # 영어 이름만 있는 퀘스트(예: Frostfire Robe = 낙스라마스 「얼음불꽃 로브」 퀘스트)는 한글 이름으로 찾음 — 예전엔 레이드 표시가 안 붙어
            # 「퀘스트만」·「퀘스트+던전」 추천에 T3·안퀴라즈 보상이 섞였음. 레이드로 확인되면 화면 글도 한글 이름으로
            if v is None and re.match('[A-Za-z]', nm):
                ko = _IENKO.get(nm)
                v2 = _QNR.get(ko) if ko else None
                # 영어 이름은 클래식 자료에서 온 것 → 같은 한글 이름 퀘스트 중 레이드 퀘스트가 있으면 레이드(예: 정복자의 왕관 = 안퀴라즈 + 포에버 새 퀘스트)
                if (v2 and any(v2)) or nm in _RAIDQ_EN:
                    v = [True]
                    if ko and v2:
                        f[1] = '퀘스트 · ' + ko
            fl = 'r' if v and all(v) else ''
    elif k == '3':
        n = lb.replace('드랍 · ', '', 1)
        z = re.search(r'\(([^)]+)\)$', n)
        nm = re.sub(r' \([^)]+\)$', '', n)
        m = re.search(r'wh:npc=(\d+)', hr)
        if (z and z.group(1) in _RAIDZ) or (m and int(m.group(1)) in _RAIDNPC) or _RAIDNM.match(nm) or re.sub(r' 몹$', '', nm) in _RAIDZ:
            fl = 'r'
    elif k == '5':
        n = lb.replace('상인 · ', '', 1)
        if n in _PVPV or lb.startswith('PvP · '):
            fl = 'p'
        elif n == '아나크로노스':
            fl = 'r'
    if not fl:
        return l
    while len(f) < 3:
        f.append('')
    return '~'.join(f[:3] + [fl])
srcs = '\n'.join(_rflag(l) for l in srcs.split('\n'))
print('레이드 출처', sum(1 for l in srcs.split('\n') if l.endswith('~r')), '· PvP(명예·전장)', sum(1 for l in srcs.split('\n') if l.endswith('~p')), '· 레이드 퀘스트', len(_RQ))
SRC_TXT = srcs + '\n'
# 템의 다른 출처가 있으면 얼라이언스가 못 하는 퀘스트 출처는 뺌 (호드 퀘스트 · 포에버 퀘스트 자료에 없는 영어 이름 퀘스트)
#   예: 블랙핸드의 팔찌 = 「For The Horde!」(호드) + 「사령관 드라키사스 처치」 → 얻는 곳 글에 호드 퀘스트가 먼저 보이던 것
_HQS = set(int(x) for x in (rd(Q / 'horde-quests.txt').split() if (Q / 'horde-quests.txt').exists() else []))
_QIDS = set(o['id'] for o in _qa) if (Q / 'quests.jsonl').exists() else set()
_SL = srcs.split('\n')
def _noq(i):
    f = _SL[i].split('~') if 0 <= i < len(_SL) else []
    if len(f) < 3 or f[0] != '1':
        return False
    m = re.search(r'(?:quest=|/quest/)(\d+)', f[2])
    if not m:
        return False
    q = int(m.group(1))
    return q in _HQS or (q not in _QIDS and bool(re.search('[A-Za-z]{3}', f[1])))
_nh = 0
for _i, _l in enumerate(items):
    _f = _l.split('|')
    if len(_f) < 8 or not _f[7]:
        continue
    _s = [x for x in _f[7].split(';') if x]
    _k = [x for x in _s if not _noq(int(x))]
    if _k and len(_k) < len(_s):
        _f[7] = ';'.join(_k); items[_i] = '|'.join(_f); _nh += 1
ITEMS_TXT = '\n'.join(items) + '\n'
print('호드·없는 퀘스트 출처 뺌', _nh)

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
    # forg 원본이 이미 강물터(#36|40|강물터 …·#41|44|강물터 …)를 넣은 새 모양이면: 셴드랄라스만 43~45로 끼움(41~44 → 41~42, 45~50 → 46~50)
    if re.search(r'^#36\|40\|강물터', txt, re.M) and re.search(r'^#41\|44\|', txt, re.M):
        out = []
        for l in txt.split('\n'):
            if l.startswith('#41|44|'):
                l = '#41|42|' + l.split('|', 2)[2]
            elif l.startswith('#45|50|'):
                out.extend(['#43|45|셴드랄라스'] + [line(q) for q in sd])
                l = '#46|50|' + l.split('|', 2)[2]
            out.append(l)
        return _hyjal('\n'.join(out), qp)
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
    return _hyjal('\n'.join(out), qp)

# 하이잘 산(포에버 새 지역, 퀘스트 56~60): 여명의 설원 남쪽 어둠속삭임 협곡으로 들어감.
# 58~60 구간을 여명의 설원 → 하이잘 산 → 동부 역병지대 → 실리더스 순서로 (운고로·악령의 숲에서 칼림도어를 떠나지 않고 이어감)
# 하이잘 퀘스트는 거점 순서(입구 → 남쪽 → 서쪽 → 북쪽 → 정상)대로, 같은 거점에서는 앞 퀘스트 → 레벨 순
HYJAL_HUBS = [('은둔자의 동굴', 75, 78), ('하이잘 하부 전초기지', 53, 84), ('케이레나 작업장', 60, 61), ('호기심 많은 까마귀', 48, 85.5),
              ('진흙 웅덩이', 48.6, 73.5), ('추락한 비행기', 25.4, 75.3), ('나무껍질일족 땅굴', 21, 79), ('서쪽 생존자 마을', 15.8, 52.5),
              ('서쪽 끝 전망대', 8.8, 46.5), ('야생신의 숲', 29.5, 51), ('아비아나의 제단', 54.4, 64), ('제레만의 쉼터', 41.5, 47),
              ('북쪽 야영지', 44, 35), ('북쪽 폐허 입구', 50, 32), ('북동쪽 폐허', 63.3, 25.9), ('영원의 정상', 69, 49), ('정상 동쪽', 77, 35)]
def _hyjal(txt, qp):
    Q = {}
    for _ln in rd(qp).splitlines():
        try: q = json.loads(_ln)
        except Exception: continue
        Q[q['id']] = q
    H = [q for q in Q.values() if q.get('z') == '하이잘 산' and (q.get('lv') or 0) >= 55 and q.get('c') not in ('던전', '기타', '직업')
         and (q.get('g') or [''])[0] and not re.search('[A-Za-z]{3}', q.get('n') or 'x')]
    if len(H) < 60:
        return txt
    def hub(q):
        g = q.get('g') or ['', '', '']
        if g[1] != '하이잘 산' or not g[2]:
            return len(HYJAL_HUBS)  # 다른 지역에서 받는 것(스톰윈드 등 먼 길)은 맨 뒤
        x, y = map(float, g[2].split(','))
        return min(range(len(HYJAL_HUBS)), key=lambda i: (HYJAL_HUBS[i][1] - x) ** 2 + (HYJAL_HUBS[i][2] - y) ** 2)
    ids = {q['id'] for q in H}
    def depth(q, seen=()):
        p = [i for i in (q.get('pre') or []) if i in ids and i not in seen]
        return 1 + max((depth(Q[i], seen + (q['id'],)) for i in p), default=-1)
    # 먼 곳으로 가져가는 퀘스트(엘윈 숲 반지 등)는 거점 안에서도 맨 뒤
    far = lambda q: 1 if re.search('엘윈 숲|스톰윈드|아이언포지', q.get('o') or '') else 0
    H.sort(key=lambda q: (hub(q), far(q), depth(q), q['lv'], q['id']))
    cl = lambda t: re.sub(r'[|\n\r]', ' ', str(t or '')).strip()
    def line(q):
        g = q.get('g') or ['', '', '', '']
        pre = q.get('pre')
        pre = pre[0] if isinstance(pre, list) and pre else (pre if isinstance(pre, int) else '')
        mn = q.get('m') or max(54, q['lv'] - 5)
        return '|'.join(map(str, [q['lv'], mn, cl(q['n']), cl(g[1] or '하이잘 산'), cl(g[0]), cl(g[2]) if g[2] and '-' not in str(g[2]) else '', 0, pre or '', cl(q.get('o')), q['id']]))
    hy = [line(q) for q in H]
    zof = lambda f: f[3] or (Q.get(int(f[9])) or {}).get('z', '') if len(f) > 9 and f[9].isdigit() else (f[3] if len(f) > 3 else '')
    out, sec = [], None
    def flush():
        if sec is None:
            return
        ws = [l for l in sec if zof(l.split('|')) == '여명의 설원']
        rest = [l for l in sec if zof(l.split('|')) != '여명의 설원']
        out.extend(ws + hy + rest)
    for l in txt.split('\n'):
        if l.startswith('#58|60|'):
            out.append('#58|60|여명의 설원 · 하이잘 산 · 동부 역병지대 · 실리더스'); sec = []; continue
        if sec is not None and (l.startswith('#') or l.startswith('@')):
            flush(); sec = None
        if sec is not None:
            if l: sec.append(l)
            continue
        out.append(l)
    flush()
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
# 던전 가는 길·열쇠·고친 내용(data/guides/dungeon-access.json) → dungeon-guide.json 각 던전 acc 칸 (자료 파일이 늘 이김)
def _dg_acc():
    p = ROOT / 'data/forg/dungeon-guide.json'; ap = ROOT / 'data/guides/dungeon-access.json'
    if not ap.exists():
        return 0
    raw = rd(p); g = json.loads(raw); A = json.loads(rd(ap)); n = 0
    mp_ = ROOT / 'data/guides/dungeon-mobs.json'; MB = json.loads(rd(mp_)) if mp_.exists() else {}
    # 게임 모델로 그린 위에서 본 지도(tools/dgmap, 미리보기에서 씀): 층마다 그림·핀·쫄 무리가 같은 좌표
    m3_ = ROOT / 'data/guides/dungeon-maps3d.json'; M3 = json.loads(rd(m3_)) if m3_.exists() else {}
    rp_ = ROOT / 'data/guides/recipe-drops.json'; RC = {}
    for r in (json.loads(rd(rp_))['rows'] if rp_.exists() else []):
        RC.setdefault(r[0], []).append(r[1:])
    for slug, t in g.items():
        a = A.get(slug)
        if a:
            t['acc'] = {k: v for k, v in a.items() if v}; n += 1
        else:
            t.pop('acc', None)
        if RC.get(slug): t['rcp'] = RC[slug]
        else: t.pop('rcp', None)
        t.pop('f3', None)  # 위에서 본 지도는 미리보기만 data/guides/dungeon-maps3d.json을 따로 받음(실제 앱 자료 가볍게)
        for fi, f in enumerate(t.get('floors') or []):
            m = (MB.get(slug) or {}).get(str(fi))
            if m: f['mob'] = m
            else: f.pop('mob', None)
    out = json.dumps(g, ensure_ascii=False, separators=(',', ':'))
    if out != raw:
        p.write_text(out, encoding='utf-8')
    return n
print('dungeon access', _dg_acc())
DVER = {k: fp(v) for k, v in {'fq': 'data/forg/quests.jsonl', 'rw': 'data/forg/rewards.jsonl', 'qdb': 'data/qdb/quests.jsonl', 'dgg': 'data/forg/dungeon-guide.json', 'm3': 'data/guides/dungeon-maps3d.json', 'rp': 'data/guides/dungeon-replays.json', 'fdt': 'data/guides/fdt-map.json', 'world': 'data/qdb/world.json', 'wy': 'data/wythic/dungeons.json', 'bag': 'data/qdb/item-bag.txt'}.items()}
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
    # 게임 퀘스트 캐시에서 확인한 레벨·최소 레벨·목표 글 (tools/qdb/gamecache.py → data/qdb/quest-game.txt)
    'const D_QGAME=' + json.dumps([[int(f[0]), int(f[1]), int(f[2]), f[3]] for f in (l.split('|', 3) for l in (rd(Q / 'quest-game.txt').splitlines() if (Q / 'quest-game.txt').exists() else []) if l and not l.startswith('#'))], ensure_ascii=False, separators=(',', ':')) + ';',
    'const D_QX=' + json.dumps([int(x) for x in (rd(Q / 'quests-nolist.txt').split() if (Q / 'quests-nolist.txt').exists() else [])], separators=(',', ':')) + ';',
    'const D_QCR=' + json.dumps(_qcr(), separators=(',', ':')) + ';',
    'const D_QN=' + json.dumps(_qnmap(), ensure_ascii=False, separators=(',', ':')) + ';',
    'const D_HQ=' + json.dumps([int(x) for x in (rd(Q / 'horde-quests.txt').split() if (Q / 'horde-quests.txt').exists() else [])], separators=(',', ':')) + ';',
    'const D_SIMW=' + (rd(F / 'sim-weights.json') if (F / 'sim-weights.json').exists() else '{}') + ';',
    'const D_DGL=' + js_str(_dgl()) + ';',
    'const D_DQ=' + js_str(_dq()) + ';',
    'const D_NPCKO=' + json.dumps(_npcko_q(), ensure_ascii=False, separators=(',', ':')) + ';',
    'const D_RWNM=' + json.dumps(_rwnm(), ensure_ascii=False, separators=(',', ':')) + ';',
    'const D_LVL=' + js_str(_lvl_forever(rd(F / 'leveling.txt'))) + ';',
    'const D_BOSS=' + js_str(rd(F / 'bosses.txt') if (F / 'bosses.txt').exists() else '') + ';',
    'const D_AB=' + js_str('\n'.join(l for l in rd(ROOT / 'data/guides/abilities.txt').split('\n') if l and not l.startswith('# '))) + ';',
    'const D_CLS=' + json.dumps(slim, ensure_ascii=False, separators=(',', ':')) + ';',
    'const D_CAMP=' + (json.dumps(json.loads(rd(ROOT / 'data/guides/camp.json')), ensure_ascii=False, separators=(',', ':')) if (ROOT / 'data/guides/camp.json').exists() else '{}') + ';',
    'const D_DLV=' + (json.dumps(json.loads(rd(ROOT / 'data/guides/deliver.json')), ensure_ascii=False, separators=(',', ':')) if (ROOT / 'data/guides/deliver.json').exists() else '{}') + ';',
    'const D_LEG=' + (json.dumps(json.loads(rd(ROOT / 'data/guides/legacy.json')), ensure_ascii=False, separators=(',', ':')) if (ROOT / 'data/guides/legacy.json').exists() else '{}') + ';',
    'const D_ZONEN=' + (json.dumps(json.loads(rd(ROOT / 'data/guides/zones-new.json')), ensure_ascii=False, separators=(',', ':')) if (ROOT / 'data/guides/zones-new.json').exists() else '{}') + ';',
    'const D_SCHED=' + (json.dumps(json.loads(rd(ROOT / 'data/guides/schedule.json')), ensure_ascii=False, separators=(',', ':')) if (ROOT / 'data/guides/schedule.json').exists() else '{}') + ';',
    'const D_LIB=' + (json.dumps(json.loads(rd(ROOT / 'data/guides/library-books.json')), ensure_ascii=False, separators=(',', ':')) if (ROOT / 'data/guides/library-books.json').exists() else '{}') + ';',
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
# 새 화면(preview.css)은 2026-11-19부터 실제 앱에도 — 글씨 크기 조절(--fs)도 같이
pcss = ''
if (A / 'preview.css').exists():
    pcss = rd(A / 'preview.css')
    pcss = re.sub(r'font-size:\s*([\d.]+)px', r'font-size:calc(\1px*var(--fs,1))', pcss)
    pcss = re.sub(r'(font:\s*(?:(?:italic|normal|bold|[1-9]00)\s+)*)([\d.]+)px', r'\1calc(\2px*var(--fs,1))', pcss)
    html = html.replace('<style>' + css + '</style>', '<style>' + css + '\n' + pcss + '</style>', 1)
    assert pcss[:40] in html
(ROOT / 'index.html').write_text(html, encoding='utf-8')
print('index.html', len(html), 'app-data.js', len(data))

# 🧪 새 화면 미리보기 (preview/index.html): 같은 앱 + WFH_PV 표시 + app/preview.css
#    자료·그림은 한 단계 위(<base href="../">)에서 · 서비스 워커 안 씀 · 기록은 따로 저장(실제 앱 기록은 읽기만)
if pcss:
    ph = html.replace('<head><meta charset="utf-8">', '<head><meta charset="utf-8">\n<base href="../"><meta name="robots" content="noindex">', 1)
    ph = ph.replace('<title>와포 도우미</title>', '<title>와포 도우미 · 새 화면 미리보기</title>', 1)
    ph = ph.replace('<script src="app-data.js', '<script>var WFH_PV=1</script>\n<script src="app-data.js', 1)
    ph = re.sub(r"<script>if\('serviceWorker'[^\n]*</script>\n", '', ph)
    assert 'WFH_PV' in ph and pcss[:40] in ph and 'serviceWorker' not in ph
    (ROOT / 'preview').mkdir(exist_ok=True)
    (ROOT / 'preview' / 'index.html').write_text(ph, encoding='utf-8')
    print('preview/index.html', len(ph))

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
