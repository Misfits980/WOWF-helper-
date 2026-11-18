"""워크래프트로그 API 연결 확인 (GitHub Actions에서 실행, 비밀값은 출력하지 않음).

환경 변수 WCL_CLIENT_ID · WCL_CLIENT_SECRET → 토큰 받기 → 사이트마다 API로 확장팩·지역 목록을 물어봄.
"""
import os, json, base64, urllib.request, urllib.parse, sys

cid = os.environ.get('WCL_CLIENT_ID', '').strip()
sec = os.environ.get('WCL_CLIENT_SECRET', '').strip()
print('WCL_CLIENT_ID 있음' if cid else 'WCL_CLIENT_ID 없음', '(길이 %d)' % len(cid))
print('WCL_CLIENT_SECRET 있음' if sec else 'WCL_CLIENT_SECRET 없음', '(길이 %d)' % len(sec))
if not (cid and sec):
    sys.exit(1)


def post(url, data, headers):
    req = urllib.request.Request(url, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read().decode('utf-8', 'replace')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', 'replace')[:300]
    except Exception as e:
        return 0, str(e)[:300]


auth = base64.b64encode(('%s:%s' % (cid, sec)).encode()).decode()
st, body = post('https://www.warcraftlogs.com/oauth/token', urllib.parse.urlencode({'grant_type': 'client_credentials'}).encode(),
                {'Authorization': 'Basic ' + auth, 'Content-Type': 'application/x-www-form-urlencoded'})
tok = None
try:
    tok = json.loads(body).get('access_token')
except Exception:
    pass
print('토큰:', '받음' if tok else '실패', '(HTTP %s)' % st, '' if tok else body[:200])
if not tok:
    sys.exit(1)

Q = '{ rateLimitData { limitPerHour pointsSpentThisHour } worldData { expansions { id name zones { id name } } } }'
ok_any = False
for host in ('forever', 'classic', 'fresh', 'sod', 'www'):
    st, body = post('https://%s.warcraftlogs.com/api/v2/client' % host, json.dumps({'query': Q}).encode(),
                    {'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json'})
    try:
        d = json.loads(body)
    except Exception:
        print(host, 'HTTP', st, body[:160]); continue
    if d.get('errors'):
        print(host, 'HTTP', st, '오류', json.dumps(d['errors'], ensure_ascii=False)[:200]); continue
    dd = d.get('data') or {}
    rl = dd.get('rateLimitData') or {}
    ex = (dd.get('worldData') or {}).get('expansions') or []
    ok_any = True
    print(host, 'HTTP', st, '시간당 한도', rl.get('limitPerHour'), '사용', rl.get('pointsSpentThisHour'))
    for e in ex:
        zs = e.get('zones') or []
        print('  확장팩', e.get('id'), e.get('name'), '· 지역', len(zs), ':', ', '.join('%s(%s)' % (z['name'], z['id']) for z in zs[:40]))
# 포에버 사이트(forever.warcraftlogs.com)는 /api/v2가 없음 → 다른 사이트 API로 포에버 지역·기록을 읽을 수 있는지
Q2 = '{ worldData { z0: zone(id: 3000) { id name expansion { id name } encounters { id name } } z1: zone(id: 3001) { id name } } reportData { report(code: "17paTd8tYnM9zjxZ") { title startTime zone { id name } fights { id name encounterID kill } } } }'
for host in ('www', 'classic', 'fresh'):
    st, body = post('https://%s.warcraftlogs.com/api/v2/client' % host, json.dumps({'query': Q2}).encode(),
                    {'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json'})
    print('포에버 확인', host, 'HTTP', st, body[:900])
sys.exit(0 if ok_any else 1)
