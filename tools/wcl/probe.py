"""WCL 살펴보기 5: 포에버 던전(zone 3000)마다 대표 판 후보 찾기 — 한 번만 손으로 돌리는 확인(예약 없음).

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
out = {}
for e in encs:
    spent = pts()[0] - p0
    if spent > BUDGET:
        print('점수 한도 가까움 — 여기서 멈춤', e['name']); break
    eid = e['id']
    cands = []
    for args in ('metric: speed', 'metric: speed, partition: -1', 'metric: default'):
        r = q('query($id:Int!){ worldData { encounter(id:$id) { fightRankings(%s) } } }' % args, {'id': eid})
        fr = (((r.get('data') or {}).get('worldData') or {}).get('encounter') or {}).get('fightRankings')
        if isinstance(fr, str):
            try: fr = json.loads(fr)
            except Exception: fr = None
        rk = (fr or {}).get('rankings') or []
        if r.get('errors'):
            print(' ', e['name'], args, '오류', json.dumps(r['errors'])[:200])
        if rk:
            for x in rk[:25]:
                rep = x.get('report') or {}
                code = rep.get('code') or x.get('reportID') or x.get('code')
                fid = rep.get('fightID') or x.get('fightID')
                if code and fid:
                    cands.append({'code': code, 'fid': fid, 'dur': x.get('duration'), 'st': rep.get('startTime') or x.get('startTime')})
            print(' ', e['name'], args, '순위', len(rk), '→ 후보', len(cands), '· 순위 칸', sorted(k for k in rk[0].keys() if k not in ('name', 'server', 'guild', 'team', 'healers', 'tanks', 'dps', 'players')))
            break
        else:
            print(' ', e['name'], args, '순위 없음', (json.dumps(fr)[:120] if fr else r.get('raw', '')[:120]))
    # 후보 판 자세히: 4개씩 묶어 한 번에 물음
    rows = []
    for i in range(0, min(len(cands), 16), 4):
        chunk = cands[i:i + 4]
        parts = []
        for j, c in enumerate(chunk):
            parts.append('r%d: report(code:"%s") { startTime fights(fightIDs:[%d]) { id kill startTime endTime encounterID friendlyPlayers } '
                         'deaths: table(dataType: Deaths, fightIDs:[%d], hostilityType: Friendlies) }' % (j, c['code'], c['fid'], c['fid']))
        r = q('{ reportData { %s } }' % ' '.join(parts))
        rd = (r.get('data') or {}).get('reportData') or {}
        if r.get('errors'):
            print('   자세히 오류', json.dumps(r['errors'])[:200])
        for j, c in enumerate(chunk):
            rr = rd.get('r%d' % j) or {}
            f = (rr.get('fights') or [{}])[0] if rr.get('fights') else {}
            tb = rr.get('deaths')
            if isinstance(tb, str):
                try: tb = json.loads(tb)
                except Exception: tb = {}
            ent = ((tb or {}).get('data') or {}).get('entries') or []
            dpl = sum(1 for x in ent if (x.get('type') or '') not in ('Pet', 'NPC'))
            st = (rr.get('startTime') or 0) + (f.get('startTime') or 0)
            dur = ((f.get('endTime') or 0) - (f.get('startTime') or 0)) / 1000
            rows.append({'code': c['code'], 'fid': c['fid'], 'kill': f.get('kill'), 'np': len(f.get('friendlyPlayers') or []), 'deaths': dpl,
                         'dur': round(dur), 'date': time.strftime('%Y-%m-%d', time.gmtime(st / 1000)) if st else '', 'recent': bool(st and NOW - st <= TWO_WEEKS), 'enc': f.get('encounterID')})
    # 고르기: 끝까지 잡음 + 5명 → 죽음 적은 순 → 시간 짧은 순 → 최근 2주 먼저
    good = [x for x in rows if x['kill'] and x['np'] == 5]
    good.sort(key=lambda x: (x['deaths'], x['dur'], not x['recent']))
    out[e['name']] = {'id': eid, 'cands': len(cands), 'checked': len(rows), 'five_kill': len(good), 'pick': good[:3],
                      'others': [{k: x[k] for k in ('np', 'kill', 'deaths', 'dur')} for x in rows if x not in good][:5]}
    print('  →', e['name'], '확인', len(rows), '· 5명 완료', len(good))
    for x in good[:3]:
        print('    https://forever.warcraftlogs.com/reports/%s#fight=%s | %d분 %02d초 | 죽음 %d | %s%s' % (x['code'], x['fid'], x['dur'] // 60, x['dur'] % 60, x['deaths'], x['date'], ' (최근 2주)' if x['recent'] else ''))

print('결과JSON', json.dumps(out, ensure_ascii=False))
print('점수 사용', round(pts()[0] - p0, 2))
sys.exit(0)
