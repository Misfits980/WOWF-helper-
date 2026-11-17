"""몹 생성 자리 → 무리(10야드 안 이어진 것)·순찰 경로. 결과는 세계 좌표(야드)."""
import json,math,sys
C=json.load(open('/tmp/cmout/classic.json'))
ko={}
for l in open(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)),'../../data/qdb/npc-en-ko.txt'),encoding='utf-8'):
    if '|' in l: e,k=l.rstrip('\n').split('|',1); ko.setdefault(e,k)
for l in open(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)),'../../data/qdb/npc-ko-fix.txt'),encoding='utf-8'):
    if '|' in l: e,k=l.rstrip('\n').split('|',1); ko[e]=k
tpl=C['tpl']
NOATK=0x2|0x100|0x2000000  # NON_ATTACKABLE · (IMMUNE_TO_PLAYER 0x100) · NOT_SELECTABLE
out={}
stat={}
for mp,rows in C['maps'].items():
    mobs=[]
    for g,e,x,y,z,mt,sd in rows:
        alt=None
        if not e:
            cand=C['cse'].get(str(g)) or [x2[0] for x2 in C['sge'].get(str((C['sgs'].get(str(g)) or [0])[0]),[])]
            if not cand: continue
            e=cand[0];alt=cand if len(set(cand))>1 else None
        t=tpl.get(str(e))
        if not t: continue
        name,rank,lo,hi,ctype,fac,uf,tmt=t
        if ctype==8 or 'Trigger' in name or uf&NOATK: continue
        path=C['mv'].get(str(g))
        sg=C['sgs'].get(str(g))
        if not path and sg and str(sg[0]) in C['sgf']:
            pid=C['sgf'][str(sg[0])][0];path=C['wp'].get(str(pid))
        if not path and mt==2:
            P=C['mvt'].get(str(e));path=P and P.get('0') or (P and list(P.values())[0])
        mobs.append({'g':g,'e':e,'x':x,'y':y,'z':z,'r':rank,'lv':[lo,hi],'ty':ctype,'p':[[p[1],p[2],p[3]] for p in path] if path and len(path)>1 else None,'wd':sd if mt==1 else 0,'sg':sg[0] if sg and str(sg[0]) in C['sgf'] else 0})
    # 무리: 10야드 안·높이 차 6야드 안이면 같은 무리 (보스·희귀는 따로)
    n=len(mobs);par=list(range(n))
    def f(i):
        while par[i]!=i: par[i]=par[par[i]];i=par[i]
        return i
    for i in range(n):
        if mobs[i]['r'] in (3,): continue
        for j in range(i+1,n):
            if mobs[j]['r'] in (3,): continue
            a,b=mobs[i],mobs[j]
            if (a['sg'] and a['sg']==b['sg']) or (abs(a['z']-b['z'])<6 and (a['x']-b['x'])**2+(a['y']-b['y'])**2<100): par[f(i)]=f(j)
    G={}
    for i in range(n): G.setdefault(f(i),[]).append(mobs[i])
    packs=[]
    for k,ms in G.items():
        cx=round(sum(m['x'] for m in ms)/len(ms),1);cy=round(sum(m['y'] for m in ms)/len(ms),1);cz=round(sum(m['z'] for m in ms)/len(ms),1)
        cnt={}
        for m in ms: cnt[m['e']]=cnt.get(m['e'],0)+1
        pat=next((m['p'] for m in ms if m['p']),None)
        boss=any(m['r']==3 for m in ms);rare=any(m['r'] in (2,4) for m in ms)
        packs.append({'c':[cx,cy,cz],'m':[[e,c] for e,c in sorted(cnt.items(),key=lambda x:-x[1])],'el':sum(1 for m in ms if m['r']>=1),'lv':[min(m['lv'][0] for m in ms),max(m['lv'][1] for m in ms)],'ty':max(set(m['ty'] for m in ms),key=[m['ty'] for m in ms].count),
                      'pts':[[m['x'],m['y']] for m in ms],'pat':pat,'boss':boss,'rare':rare})
    out[mp]=packs
    stat[mp]=(len(mobs),len(packs),sum(1 for p in packs if p['pat']))
names={}
for mp,packs in out.items():
    for p in packs:
        for e,c in p['m']:
            t=tpl[str(e)];names[str(e)]=[ko.get(t[0],t[0]),t[0],t[1]]
json.dump({'packs':out,'names':names},open('/tmp/cmout/packs.json','w'),separators=(',',':'))
for k,v in sorted(stat.items(),key=lambda x:int(x[0])): print(k,'mobs',v[0],'packs',v[1],'patrol',v[2])
