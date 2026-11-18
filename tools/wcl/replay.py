"""WCL 기록 한 판 → 대표 판 재생용 원자료(이름 없음). 손으로 한 번 돌리는 작업(예약·자동 커밋 없음).

입력(환경 변수): WCL_CODE(기록 코드 16자), WCL_FIGHT(싸움 번호).
출력: out/replay-raw.json.gz — Actions 결과물·실행 기록(base64)으로만(저장소에 안 씀).
플레이어 이름·서버·길드는 쓰지 않음: 플레이어는 기록 안 번호·직업·역할만, 몹은 게임 번호(gameID)만.
"""
import os, re, json, gzip, base64, urllib.request, urllib.parse, sys

CODE = os.environ.get('WCL_CODE', '').strip()
FIGHT = os.environ.get('WCL_FIGHT', '').strip()
if not re.fullmatch(r'[A-Za-z0-9]{16}', CODE) or not re.fullmatch(r'\d{1,4}', FIGHT):
    sys.exit('기록 코드(16자)·싸움 번호가 이상함')
FIGHT = int(FIGHT)
cid = os.environ['WCL_CLIENT_ID'].strip(); sec = os.environ['WCL_CLIENT_SECRET'].strip()


def post(url, data, headers):
    req = urllib.request.Request(url, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
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
        r = json.loads(b)
    except Exception:
        return {'errors': [{'message': 'http %s' % st}]}
    if r.get('errors'):
        print('오류', json.dumps(r['errors'], ensure_ascii=False)[:300])
    return r


def rep(r):
    return ((r.get('data') or {}).get('reportData') or {}).get('report') or {}


def pts():
    d = ((q('{ rateLimitData { pointsSpentThisHour limitPerHour } }').get('data') or {}).get('rateLimitData') or {})
    return d.get('pointsSpentThisHour', 0), d.get('limitPerHour', 0)


p0, lim = pts()
print('점수 시작', p0, '/', lim)
V = {'c': CODE, 'f': [FIGHT]}

FQ = 'id startTime endTime kill encounterID friendlyPlayers enemyNPCs { id gameID instanceCount } maps { id }'
PULLS = ' dungeonPulls { id startTime endTime x y kill maps { id } enemyNPCs { id gameID minimumInstanceID maximumInstanceID } boundingBox { minX maxX minY maxY } }'
r = q('query($c:String,$f:[Int]){ reportData { report(code:$c) { startTime fights(fightIDs:$f) { %s } } } }' % (FQ + PULLS), V)
if r.get('errors'):
    r = q('query($c:String,$f:[Int]){ reportData { report(code:$c) { startTime fights(fightIDs:$f) { %s } } } }' % FQ, V)
fights = rep(r).get('fights') or []
if not fights:
    sys.exit('싸움을 못 찾음')
F = fights[0]
print('싸움', F['id'], '던전', F.get('encounterID'), '끝까지', F.get('kill'), '길이', round((F['endTime'] - F['startTime']) / 1000), '초',
      '풀(기록 쪽)', len(F.get('dungeonPulls') or []))

md = rep(q('query($c:String){ reportData { report(code:$c) { masterData { actors { id gameID type subType petOwner name } } } } }', V)).get('masterData') or {}
actors = []
for a in md.get('actors') or []:
    t = a.get('type')
    if t == 'Player':
        actors.append({'id': a['id'], 'type': 'Player', 'cls': a.get('subType')})  # 이름·서버 안 씀
    elif t == 'Pet':
        actors.append({'id': a['id'], 'type': 'Pet', 'owner': a.get('petOwner'), 'gameID': a.get('gameID')})
    else:
        actors.append({'id': a['id'], 'type': t, 'sub': a.get('subType'), 'gameID': a.get('gameID'), 'name': a.get('name')})  # 몹·NPC 이름(게임 이름)

pd = rep(q('query($c:String,$f:[Int]){ reportData { report(code:$c) { playerDetails(fightIDs:$f) } } }', V)).get('playerDetails')
if isinstance(pd, str):
    try: pd = json.loads(pd)
    except Exception: pd = {}
roles = {}
pdd = ((pd or {}).get('data') or {}).get('playerDetails') or (pd or {}).get('playerDetails') or {}
for role in ('tanks', 'healers', 'dps'):
    for p in pdd.get(role) or []:
        roles[str(p.get('id'))] = role

KEEP = ('timestamp', 'type', 'sourceID', 'sourceInstance', 'targetID', 'targetInstance', 'abilityGameID', 'x', 'y', 'mapID',
        'resourceActor', 'hitPoints', 'maxHitPoints', 'facing', 'fight')
events, st, n = [], F['startTime'], 0
while st is not None and n < 40:
    r = q('query($c:String,$f:[Int],$s:Float,$e:Float){ reportData { report(code:$c) { events(fightIDs:$f, startTime:$s, endTime:$e, includeResources:true, limit:10000) { data nextPageTimestamp } } } }',
          {'c': CODE, 'f': [FIGHT], 's': st, 'e': F['endTime']})
    ev = rep(r).get('events') or {}
    data = ev.get('data') or []
    for e in data:
        events.append({k: e[k] for k in KEEP if k in e})
    st = ev.get('nextPageTimestamp'); n += 1
    print('사건 쪽', n, len(data), '다음', st)
print('사건', len(events), '종류', sorted(set(e.get('type') for e in events)))

os.makedirs('out', exist_ok=True)
out = {'code': CODE, 'fight': {k: F.get(k) for k in ('id', 'startTime', 'endTime', 'kill', 'encounterID', 'friendlyPlayers', 'enemyNPCs', 'maps', 'dungeonPulls')},
       'actors': actors, 'roles': roles, 'events': events}
with gzip.open('out/replay-raw.json.gz', 'wt', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
print('파일', os.path.getsize('out/replay-raw.json.gz'), '바이트 · 점수 사용', round(pts()[0] - p0, 2))
# 결과물 내려받기가 안 되는 곳에서도 받을 수 있게 같은 파일을 실행 기록에 base64로(이름 없는 자료)
b = base64.b64encode(open('out/replay-raw.json.gz', 'rb').read()).decode()
print('B64BEGIN', len(b))
for i in range(0, len(b), 4000):
    print('B64:' + b[i:i + 4000])
print('B64END')
