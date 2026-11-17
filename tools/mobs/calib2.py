import json
import numpy as np
C=json.load(open('/tmp/cmout/classic.json'))
G=json.load(open(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)),'../../data/forg/dungeon-guide.json')))
tpl=C['tpl']
SL={'ragefire-chasm':389,'deadmines':36,'wailing-caverns':43,'shadowfang-keep':33,'blackfathom-deeps':48,'stockade':34,'gnomeregan':90,'razorfen-kraul':47,'sm-graveyard':189,'sm-library':189,'sm-armory':189,'sm-cathedral':189,'razorfen-downs':129,'uldaman':70,'zul-farrak':209,'maraudon':349,'temple-of-atal-hakkar':109,'blackrock-depths':230,'lower-blackrock-spire':229,'upper-blackrock-spire':229,'dire-maul-east':429,'dire-maul-north':429,'dire-maul-west':429,'scholomance':289,'stratholme-live':329,'stratholme-dead':329}
byname={}
for mp,rows in C['maps'].items():
    for g,e,x,y,z,mt,sd in rows:
        t=tpl.get(str(e))
        if t: byname.setdefault((mp,t[0]),[]).append((x,y,z))
def refs(slug):
    mp=str(SL[slug]);g=G[slug];out={}
    for fi,f in enumerate(g['floors']):
        pts=[]
        for st in g['steps']:
            en=st.get('en')
            if not en: continue
            pins=[p for p in f['pins'] if p['t'].rstrip('!')==str(st['n'])]
            P=byname.get((mp,en))
            if pins and P: pts.append((en,P[0][0],P[0][1],P[0][2],pins[0]['x'],pins[0]['y']))
        out[fi]=pts
    return out
def fit(pts):
    X=np.array([p[1] for p in pts]);Y=np.array([p[2] for p in pts]);px=np.array([p[4] for p in pts]);py=np.array([p[5] for p in pts])
    if len(pts)<2 or np.ptp(Y)<5 or np.ptp(X)<5: return None
    a=np.polyfit(Y,px,1);c=np.polyfit(X,py,1)
    e=np.maximum(np.abs(np.polyval(a,Y)-px),np.abs(np.polyval(c,X)-py))
    return a,c,e
if __name__=='__main__':
    good=0;tot=0
    for slug in SL:
        R=refs(slug)
        for fi,pts in R.items():
            tot+=1;F=fit(pts)
            if F is None: print(slug,fi,'refs',len(pts),'-');continue
            a,c,e=F;ok=len(pts)>=3 and e.max()<3 and a[0]<0 and c[0]<0
            good+=ok
            print(slug,fi,'refs',len(pts),'err',round(float(e.max()),2),'sx',round(a[0],3),'sy',round(c[0],3),'OK' if ok else '')
    print('good',good,'of',tot)
