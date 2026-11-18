"""지형 칸 CSV → prep 설정(지형 + 고른 WMO). 사용: autoparts.py <slug> <maps 폴더 이름> <칸들 X_Y,...> <WMO 이름 정규식> [텍스처 최대]"""
import sys,csv,json,re,os
slug,mdir,tiles,rx=sys.argv[1:5]
EX='/mnt/user-data/uploads/G:--World of Warcraft/_export/'
parts=[];seen=set();need=[]
for t in tiles.split(','):
    parts.append({"name":"t"+t,"obj":"maps/%s/adt_%s.obj"%(mdir,t),"world":True,"texmax":2048})
    p=EX+'maps/%s/adt_%s_ModelPlacementInformation.csv'%(mdir,t)
    if not os.path.exists(p): continue
    for r in csv.DictReader(open(p,encoding='utf-8',errors='replace'),delimiter=';'):
        if r['Type']!='wmo' or not re.search(rx,r['ModelFile'],re.I): continue
        if r['ModelId'] in seen: continue
        seen.add(r['ModelId'])
        rel=os.path.normpath(os.path.join('maps/'+mdir,r['ModelFile'].replace('\\','/')))
        parts.append({"name":"w"+r['ModelId'],"obj":rel,"pos":[float(r['PositionX']),float(r['PositionY']),float(r['PositionZ'])],"rotY":float(r['RotationY'] or 0),"skiptex":"_lod\\d|effects/|roof|ceiling|window|canop|thorn|vine"})
        if rel not in need: need.append(rel)
json.dump({"out":"/home/claude/dgmap/out/"+slug,"export":EX,"parts":parts},open('/home/claude/dgmap/parts_%s.json'%slug,'w'))
L=[]
for rel in need:
    for ext in ('.obj','.mtl'):
        w='G:\\World of Warcraft\\_export\\'+(rel[:-4]+ext).replace('/','\\')
        if not os.path.exists(EX+rel[:-4]+ext): L.append(w)
print(len(parts),'parts',len(need),'wmo');print(json.dumps(L))
