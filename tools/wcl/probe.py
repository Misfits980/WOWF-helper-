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
def qh(host, query):
    st, b = post('https://%s.warcraftlogs.com/api/v2/client' % host, json.dumps({'query': query}).encode(), {'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json'})
    try: return json.loads(b)
    except Exception: return {'raw': b[:200], 'st': st}
from collections import Counter
for host in ('classic', 'fresh', 'sod', 'vanilla', 'www'):
    for args in ('zoneID:3000, limit:100',):
        r = qh(host, '{ reportData { reports(%s) { has_more_pages data { code startTime zone { id } } } } }' % args)
        rr = ((r.get('data') or {}).get('reportData') or {}).get('reports') or {}
        D = rr.get('data') or []
        print('reports', host, args, '→', len(D), 'more', rr.get('has_more_pages'), Counter((x.get('zone') or {}).get('id') for x in D).most_common(4), (D[0]['code'] if D else ''), json.dumps(r.get('errors'))[:200] if r.get('errors') else r.get('raw', '')[:100])
print('점수', round(pts() - p0, 2))
sys.exit(0)
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
