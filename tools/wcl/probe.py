"""WCL 자료 모양 살펴보기(Actions). 비밀값·플레이어 이름은 출력 안 함."""
import os, json, base64, urllib.request, urllib.parse, sys
cid = os.environ['WCL_CLIENT_ID'].strip(); sec = os.environ['WCL_CLIENT_SECRET'].strip()
def post(url, data, headers):
    req = urllib.request.Request(url, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=60) as r: return r.status, r.read().decode('utf-8', 'replace')
    except urllib.error.HTTPError as e: return e.code, e.read().decode('utf-8', 'replace')[:500]
auth = base64.b64encode(('%s:%s' % (cid, sec)).encode()).decode()
st, body = post('https://www.warcraftlogs.com/oauth/token', urllib.parse.urlencode({'grant_type': 'client_credentials'}).encode(), {'Authorization': 'Basic ' + auth, 'Content-Type': 'application/x-www-form-urlencoded'})
tok = json.loads(body)['access_token']
def q(query, var=None):
    st, b = post('https://www.warcraftlogs.com/api/v2/client', json.dumps({'query': query, 'variables': var or {}}).encode(), {'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json'})
    try: return json.loads(b)
    except Exception: return {'raw': b[:500], 'st': st}
def show(t, x, n=1500): print('=====', t); print(json.dumps(x, ensure_ascii=False)[:n])
r = q('{ worldData { zone(id:3000){ encounters { id name } } } rateLimitData { pointsSpentThisHour } }'); show('던전 목록', r, 4000)
r = q('{ worldData { encounter(id:10036){ name fightRankings(page:1) } } }'); show('폐광 fightRankings', r, 2500)
r = q('{ worldData { encounter(id:10036){ name characterRankings(page:1) } } }'); show('폐광 characterRankings(앞부분)', r, 1200)
r = q('{ reportData { reports(zoneID:3000, limit:3) { total last_page data { code startTime endTime } } } }'); show('reports', r, 800)
code = '17paTd8tYnM9zjxZ'
r = q('query($c:String){ reportData { report(code:$c) { fights { id encounterID name startTime endTime kill size friendlyPlayers enemyNPCs { id gameID instanceCount groupCount } gameZone { id name } maps { id } } } } }', {'c': code})
fs = (((r.get('data') or {}).get('reportData') or {}).get('report') or {}).get('fights') or []
f = next((x for x in fs if x.get('encounterID')), None)
show('fights(던전 한 판)', {k: (v if k != 'enemyNPCs' else v[:8]) for k, v in (f or {}).items()}, 2000)
if f:
    r = q('query($c:String){ reportData { report(code:$c) { masterData { actors(type:"NPC") { id name gameID subType } } } } }', {'c': code})
    acts = ((((r.get('data') or {}).get('reportData') or {}).get('report') or {}).get('masterData') or {}).get('actors') or []
    show('NPC 배우', acts[:15], 1500)
    r = q('query($c:String,$f:[Int],$s:Float,$e:Float){ reportData { report(code:$c) { events(fightIDs:$f, startTime:$s, endTime:$e, includeResources:true, limit:60) { data nextPageTimestamp } } } }', {'c': code, 'f': [f['id']], 's': f['startTime'], 'e': f['endTime']})
    ev = ((((r.get('data') or {}).get('reportData') or {}).get('report') or {}).get('events') or {})
    for e in (ev.get('data') or [])[:60]:
        e = {k: v for k, v in e.items() if k not in ('classResources',)}
        print(json.dumps(e, ensure_ascii=False)[:400])
    print('next', ev.get('nextPageTimestamp'), 'errors', r.get('errors'))
    r = q('query($c:String,$f:[Int]){ reportData { report(code:$c) { table(fightIDs:$f, dataType:Deaths) } } }', {'c': code, 'f': [f['id']]})
    show('Deaths table', r, 1200)
r = q('{ rateLimitData { pointsSpentThisHour limitPerHour } }'); show('points', r)
