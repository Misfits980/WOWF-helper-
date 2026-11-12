"""화면 자동 점검: 9직업 × 특성 × 레벨로 모든 탭·새 화면을 눌러 보고 오류를 모은다.
쓰는 법: (사이트 폴더에서 http 서버를 띄운 뒤) python3 tools/ui-check.py [주소] [화면너비]
- JS 오류, 'undefined/NaN/[object Object]' 글자, 화면 가로 넘침(휴대폰), 상단바에 가리는 버튼
- 던전 동선(모두 펼치기·층 바꾸기·지도 핀), 힐/사냥 모드, 맵 전체 연계 나무, 퀘스트 검색"""
import sys, json, collections
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8765/'
WIDTH = int(sys.argv[2]) if len(sys.argv) > 2 else 390
SPEC = {'warrior': ['arms', 'fury', 'protection'], 'paladin': ['holy', 'protection', 'retribution'], 'hunter': ['beast-mastery', 'marksmanship', 'survival'],
        'rogue': ['assassination', 'combat', 'subtlety'], 'priest': ['discipline', 'holy', 'shadow-magic'], 'shaman': ['elemental-combat', 'enhancement', 'restoration'],
        'mage': ['arcane', 'fire', 'frost'], 'warlock': ['affliction', 'demonology', 'destruction'], 'druid': ['balance', 'feral-cat', 'feral-bear', 'restoration']}
RACE = {'warrior': 'human', 'paladin': 'dwarf', 'hunter': 'nightelf', 'rogue': 'gnome', 'priest': 'gnome', 'shaman': 'dwarf', 'mage': 'skyborne', 'warlock': 'human', 'druid': 'nightelf'}
LV = [int(x) for x in (sys.argv[3].split(',') if len(sys.argv) > 3 else ['5', '22', '38', '60'])]
issues = collections.defaultdict(list)

with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    pg = b.new_page(viewport={'width': WIDTH, 'height': 800})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.route('**/*zamimg*', lambda r: r.abort())
    pg.route('**/forg.gg/**', lambda r: r.abort())
    pg.goto(URL)
    pg.wait_for_timeout(800)

    def act(js, *a):
        try:
            pg.evaluate(js, *a)
        except Exception as e:
            errs.append('act ' + str(e)[:120])
        pg.wait_for_timeout(70)

    def click(sel):
        act("s=>{const e=document.querySelector(s);e&&e.click()}", sel)

    def fire(a, k):
        act("([a,k])=>{const b=document.createElement('button');b.dataset.a=a;b.dataset.k=k;document.body.appendChild(b);b.click();b.remove()}", [a, k])

    for cls, specs in SPEC.items():
        for sp in specs:
            for lv in LV:
                if sp != specs[0] and lv not in (38,):
                    continue
                tag = '%s/%s/%d' % (cls, sp, lv)
                db = {'cur': 'q', 'list': [{'id': 'q', 'name': 'QA', 'race': RACE[cls], 'cls': cls, 'spec': sp, 'lv': lv, 'eq': {}, 'fq': {}, 'dq': {}}]}
                pg.evaluate("d=>localStorage.setItem('wowf2',JSON.stringify(d))", db)
                pg.reload()
                pg.wait_for_timeout(1300 if lv == LV[0] and cls == 'warrior' else 300)

                def chk(where):
                    t = pg.inner_text('body')
                    for bad in ['undefined', 'NaN', '[object Object]', 'null ']:
                        if bad in t:
                            i = t.find(bad)
                            issues['글자:' + bad].append(tag + ' ' + where + ' …' + t[max(0, i - 40):i + 20].replace('\n', ' '))
                    ov = pg.evaluate("()=>{const W=document.documentElement.clientWidth;const o=[];for(const e of document.querySelectorAll('#app *')){const r=e.getBoundingClientRect();if(r.width>0&&r.right>W+2&&getComputedStyle(e).position!=='fixed'){let p=e.parentElement,clip=false;while(p&&p.id!=='app'){const s=getComputedStyle(p);if(/(auto|scroll|hidden)/.test(s.overflowX)){clip=true;break}p=p.parentElement}if(!clip)o.push((e.className||e.tagName)+':'+Math.round(r.right-W))}}return o.slice(0,3)}")
                    if ov:
                        issues['가로 넘침'].append(tag + ' ' + where + ' ' + ', '.join(map(str, ov)))
                    if errs:
                        issues['JS 오류'].append(tag + ' ' + where + ' ' + errs[-1])
                        errs.clear()

                for tab in ['home', 'gear', 'quest', 'dungeon', 'class']:
                    click('[data-a=tab][data-k=%s]' % tab)
                    chk(tab)
                    if tab == 'gear':
                        for m in ['solo', 'heal']:
                            if pg.query_selector('[data-a=gmode][data-k=%s]' % m):
                                click('[data-a=gmode][data-k=%s]' % m)
                                chk('gmode-' + m)
                        for sl in ['main', 'off', 'ranged', 'chest', 'trink1']:
                            fire('slot', sl)
                            chk('slot-' + sl)
                            click('[data-a=close]')
                        click('.sform summary')
                        chk('sform')
                    if tab == 'quest':
                        for m in ['route', 'map']:
                            click('[data-a=qmode][data-k=%s]' % m)
                            pg.wait_for_timeout(250 if m == 'map' else 60)
                            chk('quest-' + m)
                        if pg.query_selector('.zr.mz'):
                            click('.zr.mz.fit') if pg.query_selector('.zr.mz.fit') else click('.zr.mz')
                            for f in ['now', 'left', 'all']:
                                click('[data-a=mf][data-k=%s]' % f)
                                chk('map-' + f)
                            click('.chrun summary')
                            chk('chrun')
                            click('[data-a=mz][data-k=""]')
                        click('[data-a=qmode][data-k=route]')
                        if pg.query_selector('.card.now .nb'):
                            click('.card.now .nb')
                            chk('qsheet')
                            click('[data-a=close]')
                        act("()=>{const i=document.querySelector('[data-c=qsrch]');if(i){i.value='늑대';i.dispatchEvent(new Event('input',{bubbles:true}))}}")
                        pg.wait_for_timeout(350)
                        chk('search')
                        click('[data-a=qsclr]')
                    if tab == 'dungeon':
                        for dt in ['route', 'loot', 'quest']:
                            click('[data-a=dtab][data-k=%s]' % dt)
                            chk('dg-' + dt)
                        click('[data-a=dtab][data-k=route]')
                        click('[data-a=stall][data-k="1"]')
                        chk('dg-allopen')
                        click('[data-a=dfl][data-k="1"]')
                        chk('dg-floor2')
                        click('.pin.n')
                        chk('dg-pin')
                        click('[data-a=stall][data-k="0"]')
    b.close()

print(json.dumps({k: len(v) for k, v in issues.items()}, ensure_ascii=False))
for k, v in issues.items():
    print('==', k, len(v))
    for x in v[:10]:
        print('  ', x)
