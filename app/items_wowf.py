"""data/qdb/items-wowf.jsonl(wowf.io·forever-tool 한글 도감) → 장비 줄 (forg items.txt 칸과 같음)"""
import json, re

SL = {'머리': 'he', '목': 'ne', '어깨': 'sh', '등': 'ba', '가슴': 'ch', '손목': 'wr', '손': 'ha', '허리': 'wa', '다리': 'le', '발': 'fe',
      '손가락': 'fi', '장신구': 'tr', '주장비': 'mh', '주 장비': 'mh', '한손': '1h', '양손': '2h', '보조장비': 'oh', '보조 장비': 'oh',
      '보조손': 'ho', '보조손 장비': 'ho', '보조손에 장착': 'ho', '원거리': 'ra', '원거리 장비': 'ra', '투척': 'ra', '성물': 'ra', '마법봉': 'ra'}
CL = ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock', 'druid']
CKO = {'전사': 'warrior', '성기사': 'paladin', '사냥꾼': 'hunter', '도적': 'rogue', '사제': 'priest', '주술사': 'shaman', '마법사': 'mage', '흑마법사': 'warlock', '드루이드': 'druid'}
WPN = {'warrior': [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 13, 15, 16, 18], 'paladin': [0, 1, 4, 5, 6, 7, 8], 'hunter': [0, 1, 2, 3, 6, 7, 8, 10, 13, 15, 16, 18],
       'rogue': [2, 3, 4, 7, 13, 15, 16, 18], 'priest': [4, 10, 15, 19], 'shaman': [0, 1, 4, 5, 10, 13, 15], 'mage': [7, 10, 15, 19], 'warlock': [7, 10, 15, 19],
       'druid': [4, 5, 6, 10, 13, 15]}
ARM = {'warrior': 4, 'paladin': 4, 'hunter': 3, 'shaman': 3, 'rogue': 2, 'druid': 2, 'priest': 1, 'mage': 1, 'warlock': 1}
RELIC = {7: 'paladin', 8: 'druid', 9: 'shaman'}
STAT = {'정신력': 'spi', '지능': 'int', '체력': 'sta', '힘': 'str', '민첩성': 'agi', '민첩': 'agi', '주문 공격력': 'sp', '치유량': 'heal', '전투력': 'ap',
        '방어 숙련도': 'def', '방어숙련': 'def', '5초당 마나 회복': 'mp5', '방어도': 'armor'}
SCHOOL = {'화염': 'fire', '냉기': 'frost', '암흑': 'shadow', '비전': 'arcane', '자연': 'nature', '신성': 'holy'}


# wowf.io 던전 주소 → 앱 던전 slug (보스 드랍을 던전 템 목록에 넣으려고)
DGMAP = {'dalaran': 'city-of-dalaran', 'scarlet-monastery-graveyard': 'sm-graveyard', 'scarlet-monastery-library': 'sm-library',
         'scarlet-monastery-armory': 'sm-armory', 'scarlet-monastery-cathedral': 'sm-cathedral', 'stratholme-main-gate': 'stratholme-live',
         'stratholme-service-gate': 'stratholme-dead', 'sunken-temple': 'temple-of-atal-hakkar'}
for _s in ['alcaz-prison', 'blackmaw-hold', 'drowned-city', 'kroldok-stronghold', 'shapers-terrace', 'blackfathom-deeps', 'blackrock-depths', 'deadmines',
           'dire-maul-east', 'dire-maul-north', 'dire-maul-west', 'gnomeregan', 'lower-blackrock-spire', 'maraudon', 'ragefire-chasm', 'razorfen-downs',
           'razorfen-kraul', 'ruins-of-lordaeron', 'scholomance', 'shadowfang-keep', 'stockade', 'uldaman', 'upper-blackrock-spire', 'wailing-caverns', 'zul-farrak']:
    DGMAP.setdefault(_s, _s)


def eff_stats(lines):
    """착용 효과 글에서 점수로 셀 수 있는 것: 치명타·적중·회피·무기 막기·방패 막기(%), 주문 극대화·주문 적중(%)"""
    st = {}
    for t in lines or []:
        if '착용 효과' not in t:
            continue
        b = t.split(':', 1)[-1]
        m = re.search(r'(\d+(?:\.\d+)?)%만큼 증가|(\d+(?:\.\d+)?)% 증가', b)
        if not m or '자신에게 걸리는' in b or '감소' in b or '에서 ' in b.split('%')[0][-8:]:
            continue
        m = re.search(r'(\d+(?:\.\d+)?)%', b)
        v = float(m.group(1))
        k = None
        if '주문' in b and ('극대화' in b or '치명타' in b):
            k = 'scrit'
        elif '주문' in b and '적중' in b:
            k = 'shit'
        elif '치명타' in b:
            k = 'crit'
        elif '적중' in b:
            k = 'hit'
        elif '회피' in b:
            k = 'dodge'
        elif '무기 막기' in b:
            k = 'parry'
        elif '방패' in b and '막' in b:
            k = 'blockp'
        if k:
            st[k] = st.get(k, 0) + v
    return st


def mask_of(cs, allow):
    m = 0
    for i, c in enumerate(CL):
        ok = True
        if cs.startswith('2.'):
            ok = int(cs[2:]) in WPN[c]
        elif cs == '4.6':
            ok = c in ('warrior', 'paladin', 'shaman')
        elif cs in ('4.1', '4.2', '4.3', '4.4'):
            ok = int(cs[2:]) <= ARM[c]
        elif cs in ('4.7', '4.8', '4.9'):
            ok = RELIC[int(cs[2:])] == c
        if allow and c not in allow:
            ok = False
        if ok:
            m |= 1 << i
    return m


def convert(jsonl_text, equip_text, src_index):
    """src_index(label)→번호. 돌려주는 값: 장비 줄 목록"""
    EQ = {}
    for line in equip_text.splitlines():
        f = line.split('|')
        if len(f) > 4 and f[0].isdigit():
            EQ[int(f[0])] = (int(f[1]), int(f[2]) if f[2] else 0, int(f[3] or 0), int(f[4] or 0))
    out = []
    for line in jsonl_text.splitlines():
        if not line:
            continue
        o = json.loads(line)
        if o.get('none') or not o.get('nm') or (re.search('[A-Za-z]{3}', o['nm']) and not any('/dungeons/' in h for _, h in o.get('src') or [])):  # 영문 이름은 던전 드랍만 (한글판이 아직 없는 신규 던전 템)
            continue
        iid = o['id']
        cl, sub, ilvl, rlq = EQ.get(iid, (0, 0, 0, 0))
        parts = (o.get('sub') or '').split(' · ')
        slot = o.get('slot') or (parts[1] if len(parts) > 1 else '')
        sl = SL.get(slot.replace(' ', '')) or SL.get(slot)
        if not cl:
            continue
        cs = '%d.%d' % (cl, sub)
        if cl == 4 and sub == 0:
            cs = ''
        if not sl:
            if cl == 2 and sub in (2, 3, 16, 18, 19):
                sl = 'ra'
            elif cs == '4.6':
                sl = 'oh'
            elif cl == 4 and sub in (7, 8, 9):
                sl = 'ra'
            else:
                continue
        if cl == 4 and sub == 0 and sl not in ('ne', 'fi', 'tr', 'ho'):
            continue
        st = {}
        allow = None
        eff = False
        lv = 0
        lo = hi = spd = 0
        for t in o.get('lines') or []:
            t = t.strip()
            m = re.match(r'^최소 요구 레벨:?\s*(\d+)', t)
            if m:
                lv = int(m.group(1)); continue
            m = re.match(r'^직업:\s*(.+)$', t)
            if m:
                allow = [CKO[x.strip()] for x in m.group(1).split(',') if x.strip() in CKO]; continue
            m = re.search(r'(\d+)\s*-\s*(\d+)\s*(?:피해|공격력)|(?:피해|공격력)\s*(\d+)\s*-\s*(\d+)', t)
            m2 = re.search(r'속도\s*([\d.]+)', t)
            if m and not lo:
                g = [x for x in m.groups() if x]
                lo, hi = int(g[0]), int(g[1])
            if m2:
                spd = float(m2.group(1))
            if m or m2:
                continue
            m = re.match(r'^방어도\s*(\d+)', t)
            if m:
                if cs == '4.6':
                    st['armor'] = int(m.group(1))
                continue
            body = re.sub(r'^착용 효과:\s*', '', t)
            m = re.match(r'^\+(\d+)\s*(.+)$', body)
            if m and m.group(2).strip() in STAT:
                k = STAT[m.group(2).strip()]; st[k] = st.get(k, 0) + int(m.group(1)); continue
            if t.startswith('착용 효과') and re.search(r'확률|사용 시|초 동안|적중 시|공격 시', body):
                eff = True; continue
            if t.startswith('착용 효과'):
                m = re.search(r'최대 (\d+)', body) or re.search(r'(\d+)만큼', body)
                v = int(m.group(1)) if m else 0
                mh = re.search(r'치유량이 최대 (\d+)만큼,\s*주문 공격력이 최대 (\d+)', body)
                if mh:
                    st['heal'] = st.get('heal', 0) + int(mh.group(1)); st['sp'] = st.get('sp', 0) + int(mh.group(2)); continue
                if v and re.search(r'피해.*치유|치유.*피해', body):
                    st['sp'] = st.get('sp', 0) + v; st['heal'] = st.get('heal', 0) + v
                elif v and '치유' in body:
                    st['heal'] = st.get('heal', 0) + v
                elif v and any(s in body for s in SCHOOL) and '주문' in body:
                    for s, k in SCHOOL.items():
                        if s in body:
                            st[k] = st.get(k, 0) + v; break
                elif v and '전투력' in body:
                    st['ap'] = st.get('ap', 0) + v
                elif v and '마나' in body and '5초' in body:
                    st['mp5'] = st.get('mp5', 0) + v
                elif v and '방어 숙련' in body:
                    st['def'] = st.get('def', 0) + v
                elif v and '방패' in body and '방어' in body:
                    st['block'] = st.get('block', 0) + v
                elif eff_stats([t]):
                    pass  # 치명타·적중 등은 eff_stats에서 셈
                else:
                    eff = True
            elif t.startswith('사용 효과') or t.startswith('적중 시'):
                eff = True
        for k, v in eff_stats(o.get('lines')).items():
            st[k] = st.get(k, 0) + v
        if lo and hi and spd:
            st['dps'] = round((lo + hi) / 2 / spd, 2)
        est = ''
        if not lv:
            m = re.search(r'(\d+)레벨', o.get('sub') or '')
            lv = int(m.group(1)) if m else (rlq or 0)
        if not lv:
            il = ilvl or int(o.get('ilvl') or 0) or int((re.search(r'아이템 레벨 (\d+)', o.get('sub') or '') or [0, 0])[1] or 0)
            if il > 8:
                lv, est = il - 5, '?'
        refs = []
        horde_only = bool(o.get('src')) and all('(호드)' in s[0] for s in o['src'])
        if horde_only:
            continue
        for label, href in o.get('src') or []:
            label = re.sub(r'\((얼라이언스|호드)\)$', '', label).strip()
            m = re.search(r'/quests/(\d+)', href)
            if m:
                refs.append(src_index('1~퀘스트 · %s~wh:quest=%s' % (re.sub(r'^퀘스트 보상 · ', '', label), m.group(1))))
            elif '/dungeons/' in href:
                p = label.split(' · ')
                dg = DGMAP.get(href.split('/dungeons/')[1].split('#')[0])
                if dg and len(p) > 1 and p[-1] != '일반 몹':
                    refs.append(src_index('0~%s · %s~dg:%s' % (p[0], p[-1].replace('"', ''), dg)))
                else:
                    refs.append(src_index('3~드랍 · %s%s~' % (p[-1], ' (%s)' % p[0] if len(p) > 1 else '')))
            elif label.startswith('상인'):
                refs.append(src_index('5~%s~' % label))
            else:
                refs.append(src_index('3~드랍 · %s~' % label))
        mask = mask_of(cs, allow)
        if not mask:
            continue
        stxt = ' '.join('%s%s' % (k, v) for k, v in st.items())
        out.append('|'.join(map(str, [iid, str(lv or 1) + est, sl, cs, o.get('q') or 'u', stxt, 1 if eff else '', ';'.join(map(str, refs)), mask, 'wowf', ','.join(allow or []), '', o['nm'].replace('|', '/'), o.get('ic') or ''])))
    return out
