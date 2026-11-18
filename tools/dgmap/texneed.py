"""prep 설정의 모델들 MTL → 아직 없는 텍스처(Windows 경로) 목록. 천장·지붕·창문·LOD 뺌."""
import sys,json,os,re
cfg=json.load(open(sys.argv[1]));EX=cfg['export']
L=[]
for p in cfg['parts']:
    if p.get('world'): continue
    path=os.path.join(EX,p['obj']);mtl=path[:-4]+'.mtl'
    if not os.path.exists(mtl): print('MTL 없음',mtl,file=sys.stderr);continue
    for l in open(mtl,encoding='utf-8',errors='replace'):
        if not l.startswith('map_Kd'): continue
        t=os.path.normpath(os.path.join(os.path.dirname(mtl),l.split(None,1)[1].strip().replace('\\','/')))
        if os.path.exists(t) or re.search(r'_lod\d|ceiling|roof|window|canop|thorn|vine|effects/',t,re.I): continue
        w='G:\\World of Warcraft\\_export\\'+t.split('/_export/')[1].replace('/','\\')
        if w not in L: L.append(w)
n=int(sys.argv[2]) if len(sys.argv)>2 else 0
print(len(L),file=sys.stderr);print(json.dumps(L[n:n+50]))
