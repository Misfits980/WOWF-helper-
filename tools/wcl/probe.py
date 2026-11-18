"""WCL 살펴보기 6: 포에버 던전(zone 3000) 대표 판 후보 — 한 번만 손으로 돌리는 확인(예약 없음).

살펴보기 5 결과: 지역 3000 싸움 31개 모두 fightRankings가 "Invalid raid zone specified" → 순위로는 못 찾음.

forever.warcraftlogs.com 화면은 자동 접속을 막아서(Cloudflare) 공식 API(www)로 읽음.
던전 싸움(encounter)마다 속도 순위 → 후보 판마다 끝까지 잡았는지·플레이어 수·플레이어 죽음 수.
출력: 기록 코드·싸움 번호·걸린 시간·날짜·인원·죽음 수만(플레이어 이름·서버·길드는 출력하지 않음).
"""
import os, json, base64, urllib.request, urllib.parse, sys, time

cid = os.environ['WCL_CLIENT_ID'].strip(); sec = os.environ['WCL_CLIENT_SECRET'].strip()


def post(url, data, headers):
    req = urllib.request.Request(url, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=90) as r:
            return r.status, r.read().decode('utf-8', 'replace')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', 'replace')[:500]


auth = base64.b64encode(('%s:%s' % (cid, sec)).encode()).decode()
tok = json.loads(post('https://www.warcraftlogs.com/oauth/token', urllib.parse.urlencode({'grant_type': 'client_credentials'}).encode(),
                      {'Authorization': 'Basic ' + auth, 'Content-Type': 'application/x-www-form-urlencoded'})[1])['access_token']


def q(query, var=None):
    st, b = post('https://www.warcraftlogs.com/api/v2/client', json.dumps({'query': query, 'variables': var or {}}).encode(),
                 {'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json'})
    try:
        return json.loads(b)
    except Exception:
        return {'raw': b[:300], 'st': st}


def pts():
    r = q('{ rateLimitData { limitPerHour pointsSpentThisHour pointsResetIn } }')
    d = ((r.get('data') or {}).get('rateLimitData') or {})
    return d.get('pointsSpentThisHour', 0), d.get('limitPerHour', 0), d.get('pointsResetIn')


p0, lim, rst = pts()
print('점수 시작', p0, '/', lim, '· 초기화까지', rst, '초')
BUDGET = max(0, lim - p0 - 60)  # 한도를 넘지 않게 남겨 둠

z = q('{ worldData { zone(id: 3000) { id name encounters { id name } } } }')
encs = (((z.get('data') or {}).get('worldData') or {}).get('zone') or {}).get('encounters') or []
print('던전 싸움', len(encs), ':', ', '.join('%s(%s)' % (e['name'], e['id']) for e in encs))
if z.get('errors'):
    print('오류', json.dumps(z['errors'])[:300])

NOW = int(time.time() * 1000)
TWO_WEEKS = 14 * 86400 * 1000
EN = {e['id']: e['name'] for e in encs}
# 순위(fightRankings)는 포에버 지역에서 "Invalid raid zone" → 공개 기록 목록·순위로는 못 찾음.
# API로 찾을 수 있는 포에버 던전 기록(zoneID 3000 목록 + 앞서 확인한 기록)만 판마다 확인
codes = []
r = q('{ reportData { reports(zoneID: 3000, limit: 100) { data { code } } } }')
for x in ((((r.get('data') or {}).get('reportData') or {}).get('reports') or {}).get('data') or []):
    codes.append(x['code'])
for c in ('17paTd8tYnM9zjxZ', '4PtXn6gFj1ZmNyMG'):
    if c not in codes: codes.append(c)
print('확인할 기록', len(codes))
rows = []
for code in codes:
    r = q('query($c:String){ reportData { report(code:$c) { startTime zone { id } fights(killType: Encounters) { id encounterID kill startTime endTime friendlyPlayers } } } }', {'c': code})
    rep = ((r.get('data') or {}).get('reportData') or {}).get('report') or {}
    for f in rep.get('fights') or []:
        r2 = q('query($c:String){ reportData { report(code:$c) { table(dataType: Deaths, fightIDs:[%d], hostilityType: Friendlies) } } }' % f['id'], {'c': code})
        tb = (((r2.get('data') or {}).get('reportData') or {}).get('report') or {}).get('table')
        if isinstance(tb, str):
            try: tb = json.loads(tb)
            except Exception: tb = {}
        ent = ((tb or {}).get('data') or {}).get('entries') or []
        dpl = sum(1 for x in ent if (x.get('type') or '') not in ('Pet', 'NPC'))
        st = (rep.get('startTime') or 0) + (f.get('startTime') or 0)
        dur = round(((f.get('endTime') or 0) - (f.get('startTime') or 0)) / 1000)
        rows.append((EN.get(f['encounterID'], f['encounterID']), code, f['id'], f.get('kill'), len(f.get('friendlyPlayers') or []), dpl, dur, time.strftime('%Y-%m-%d', time.gmtime(st / 1000)) if st else '', bool(st and NOW - st <= TWO_WEEKS)))
for x in rows:
    print('판 | %s | https://forever.warcraftlogs.com/reports/%s#fight=%s | 끝까지 %s | 인원 %d | 죽음 %d | %d분 %02d초 | %s%s' % (x[0], x[1], x[2], '예' if x[3] else '아니오', x[4], x[5], x[6] // 60, x[6] % 60, x[7], ' (최근 2주)' if x[8] else ''))
print('점수 사용', round(pts()[0] - p0, 2))
sys.exit(0)
