import json,sys
import numpy as np
sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__)))
from calib2 import SL,refs,fit,G,C
P=json.load(open('/tmp/cmout/packs.json'))
names=P['names']
out={'_':'클래식 던전 쫄 무리·순찰 경로. 몹 생성 자리·순찰 웨이포인트: CMaNGOS classic-db(GPL-3.0, github.com/cmangos/classic-db) — 지도 %로 바꾼 결과만 담음. 지도 맞춤: 보스 핀 위치로 맞춘 층만(오차 3% 안). 2026-11-17'}
TY={1:'짐승',2:'용족',3:'악마',4:'정령',5:'거인',6:'언데드',7:'인간형',9:'기계',10:'기타'}
for slug in SL:
    mp=str(SL[slug]);R=refs(slug);fl={}
    for fi,pts in R.items():
        F=fit(pts)
        if F is None: continue
        a,c,e=F
        if not(len(pts)>=3 and e.max()<3 and a[0]<0 and c[0]<0 and 1.2<=c[0]/a[0]<=1.9): continue
        zs=[p[3] for p in pts];zlo,zhi=min(zs)-18,max(zs)+18
        multi=len(G[slug]['floors'])>1
        pk=[];pt=[]
        pinned={st.get('en') for st in G[slug]['steps'] if st.get('en')}
        for p in P['packs'][mp]:
            if p['boss']: continue
            keep=[[e2,cn] for e2,cn in p['m'] if names[str(e2)][1] not in pinned]
            if not keep: continue
            p=dict(p,m=keep)
            x,y,z=p['c']
            if multi and not(zlo<=z<=zhi): continue
            px=float(np.polyval(a,y));py=float(np.polyval(c,x))
            if not(-1<=px<=101 and -1<=py<=101): continue
            n=sum(cn for _,cn in p['m'])
            nm=[[names[str(e2)][0],cn] for e2,cn in p['m'][:3]]
            pk.append([round(px,1),round(py,1),n,p['ty'],p['el'],p['lv'][0],p['lv'][1],nm,1 if p['rare'] else 0])
            if p['pat']:
                path=[[round(float(np.polyval(a,q[1])),1),round(float(np.polyval(c,q[0])),1)] for q in p['pat']]
                if all(-5<=q[0]<=105 and -5<=q[1]<=105 for q in path): pt.append([len(pk)-1,path])
        if pk: fl[str(fi)]={'p':pk,'t':pt}
    if fl: out[slug]=fl
json.dump(out,open(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)),'../../data/guides/dungeon-mobs.json'),'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
for k,v in out.items():
    if k!='_': print(k,{f:(len(d['p']),len(d['t'])) for f,d in v.items()})
