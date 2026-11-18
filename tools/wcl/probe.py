"""WCL 자료 모양 살펴보기 2: 기록 목록·싸움 묶어 받기·사건 한 쪽 비용."""
import os, json, base64, urllib.request, urllib.parse, sys, time
cid = os.environ['WCL_CLIENT_ID'].strip(); sec = os.environ['WCL_CLIENT_SECRET'].strip()
def post(url, data, headers):
    req = urllib.request.Request(url, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=90) as r: return r.status, r.read().decode('utf-8', 'replace')
    except urllib.error.HTTPError as e: return e.code, e.read().decode('utf-8', 'replace')[:500]
auth = base64.b64encode(('%s:%s' % (cid, sec)).encode()).decode()
tok = json.loads(post('https://www.warcraftlogs.com/oauth/token', urllib.parse.urlencode({'grant_type': 'client_credentials'}).encode(), {'Authorization': 'Basic ' + auth, 'Content-Type': 'application/x-www-form-urlencoded'})[1])['access_token']
def q(query, var=None):
    st, b = post('https://www.warcraftlogs.com/api/v2/client', json.dumps({'query': query, 'variables': var or {}}).encode(), {'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json'})
    try: return json.loads(b)
    except Exception: return {'raw': b[:300], 'st': st}
pts = lambda: q('{ rateLimitData { pointsSpentThisHour } }')['data']['rateLimitData']['pointsSpentThisHour']
p0 = pts()
now = int(time.time() * 1000)
codes = []
for args in ('zoneID:3000, limit:100, page:1', 'zoneID:3000, limit:100, page:2', 'zoneID:3000, limit:100, startTime:%d, endTime:%d' % (now - 7 * 864e5, now)):
    r = q('{ reportData { reports(%s) { total per_page current_page last_page has_more_pages data { code startTime zone { id } } } } }' % args)
    rr = ((r.get('data') or {}).get('reportData') or {}).get('reports') or {}
    print('reports', args, '→', len(rr.get('data') or []), {k: rr.get(k) for k in ('total', 'per_page', 'current_page', 'last_page', 'has_more_pages')}, r.get('errors'))
    codes += [x['code'] for x in rr.get('data') or []]
codes = list(dict.fromkeys(codes))
print('기록 수', len(codes), '점수', round(pts() - p0, 2)); p1 = pts()
# 20개씩 묶어 싸움 받기
enc = {}
for i in range(0, min(len(codes), 60), 20):
    part = codes[i:i + 20]
    qq = '{ reportData { ' + ' '.join('r%d: report(code:"%s") { code fights(killType: Kills) { id encounterID kill size startTime endTime friendlyPlayers } }' % (j, c) for j, c in enumerate(part)) + ' } }'
    r = q(qq)
    for k, v in ((r.get('data') or {}).get('reportData') or {}).items():
        for f in (v or {}).get('fights') or []:
            if f.get('encounterID'):
                enc.setdefault(f['encounterID'], []).append((v['code'], f['id'], f['size'], len(f['friendlyPlayers'] or []), round((f['endTime'] - f['startTime']) / 60000, 1)))
    if r.get('errors'): print('오류', json.dumps(r['errors'])[:300])
print('싸움 60개 기록 점수', round(pts() - p1, 2))
for e, L in sorted(enc.items(), key=lambda x: -len(x[1])): print('던전', e, '판', len(L), L[:3])
# 사건 한 쪽 비용(DamageDone 10000개)
c, fid = '17paTd8tYnM9zjxZ', 1
p2 = pts()
r = q('query($c:String){ reportData { report(code:$c) { events(fightIDs:[%d], dataType:DamageDone, hostilityType:Friendlies, includeResources:true, limit:10000) { data nextPageTimestamp } } } }' % fid, {'c': c})
ev = (((r.get('data') or {}).get('reportData') or {}).get('report') or {}).get('events') or {}
print('DamageDone 쪽', len(ev.get('data') or []), 'next', ev.get('nextPageTimestamp'), '점수', round(pts() - p2, 2), r.get('errors'))
p3 = pts()
r = q('query($c:String){ reportData { report(code:$c) { events(fightIDs:[%d], dataType:Casts, includeResources:true, limit:10000) { data nextPageTimestamp } } } }' % fid, {'c': c})
ev2 = (((r.get('data') or {}).get('reportData') or {}).get('report') or {}).get('events') or {}
print('Casts 쪽', len(ev2.get('data') or []), 'next', ev2.get('nextPageTimestamp'), '점수', round(pts() - p3, 2))
p4 = pts()
r = q('query($c:String){ reportData { report(code:$c) { events(fightIDs:[%d], dataType:Deaths, limit:10000) { data nextPageTimestamp } } } }' % fid, {'c': c})
ev3 = (((r.get('data') or {}).get('reportData') or {}).get('report') or {}).get('events') or {}
print('Deaths 쪽', len(ev3.get('data') or []), '점수', round(pts() - p4, 2), json.dumps((ev3.get('data') or [])[:3])[:400])
r = q('query($c:String){ reportData { report(code:$c) { masterData { actors(type:"Player") { id subType } } playerDetails(fightIDs:[%d]) } } }' % fid, {'c': c})
pd = (((r.get('data') or {}).get('reportData') or {}).get('report') or {})
print('플레이어 직업', [a['subType'] for a in ((pd.get('masterData') or {}).get('actors') or [])][:8])
print('playerDetails', json.dumps(pd.get('playerDetails'))[:600].replace('"name"', '"n"'))
print('합계 점수', round(pts() - p0, 2))
