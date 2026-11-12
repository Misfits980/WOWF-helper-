#!/usr/bin/env python3
"""app/ 소스와 data/forg/ 자료를 묶어 저장소 맨 위의 index.html 과 app-data.js 를 만든다."""
import json, hashlib, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
A = ROOT / 'app'; F = ROOT / 'data' / 'forg'
rd = lambda p: p.read_text(encoding='utf-8')

# 직업 자료는 쓰는 부분만 남겨 크기를 줄인다
cls = json.loads(rd(F / 'classes.json'))
slim = {}
for cid, c in cls.items():
    used = set(x[1] for s in c['specs'] for x in s['steps'])
    slim[cid] = {
        'name': c['name'], 'trees': c['trees'],
        'learns': [[l[0], l[1], l[2], l[3], l[4], l[6], (l[7] or '')[:90]] for l in c['learns'] if l[4] in ('', 'alliance', None)],
        'talents': {k: [v['n'], v['t'], v['max'], v.get('icon', ''), (v.get('d') or '')[:110]] for k, v in c['talents'].items() if k in used},
        'specs': [{'id': s['id'], 'name': s['name'], 'icon': s['icon'], 'steps': s['steps'],
                   'rot': [[r['when'], r['txt']] for r in s['rotation']],
                   'early': [[r['when'], r['txt']] for r in s['early']],
                   'late': [[r['when'], r['txt']] for r in s['late']]} for s in c['specs']],
    }

def js_str(s):
    return json.dumps(s, ensure_ascii=False)

data = '\n'.join([
    '/* 와포 도우미 자료 — forg.gg 공개 페이지에서 GitHub Actions로 모은 것 (tools/forg-*.mjs) */',
    'const D_ITEMS=' + js_str(rd(F / 'items.txt')) + ';',
    'const D_SRC=' + js_str(rd(F / 'sources.txt')) + ';',
    'const D_DGL=' + js_str(rd(F / 'dungeons.txt')) + ';',
    'const D_DQ=' + js_str(rd(F / 'dungeon-quests.txt')) + ';',
    'const D_LVL=' + js_str(rd(F / 'leveling.txt')) + ';',
    'const D_BOSS=' + js_str(rd(F / 'bosses.txt') if (F / 'bosses.txt').exists() else '') + ';',
    'const D_CLS=' + json.dumps(slim, ensure_ascii=False, separators=(',', ':')) + ';',
    rd(A / 'profs.js'),
    rd(A / 'hubs.js'),
])
(ROOT / 'app-data.js').write_text(data, encoding='utf-8')
ver = hashlib.md5(data.encode()).hexdigest()[:8]
app = rd(A / 'app.js'); css = rd(A / 'style.css')
aver = hashlib.md5(app.encode()).hexdigest()[:6]
html = f'''<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#15130f">
<title>와포 도우미</title>
<meta name="description" content="와우 포에버 얼라이언스 레벨업·장비·퀘스트·던전 도우미">
<style>{css}</style></head>
<body><div id="app"><p class="boot">불러오는 중…</p></div>
<script src="app-data.js?v={ver}"></script>
<script>/* v{aver} */
{app}</script>
</body></html>'''
(ROOT / 'index.html').write_text(html, encoding='utf-8')
print('index.html', len(html), 'app-data.js', len(data))
