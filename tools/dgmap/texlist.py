import sys,os,json
mtl=sys.argv[1]  # 작업 공간 mtl 경로
base=os.path.dirname(mtl)
ex='/mnt/user-data/uploads/G:--World of Warcraft/_export/'
out=[]
for l in open(mtl,encoding='utf-8',errors='replace'):
    if l.startswith('map_Kd'):
        p=os.path.normpath(os.path.join(base,l.split(None,1)[1].strip().replace('\\','/')))
        if os.path.exists(p): continue
        rel=p.split('/_export/')[1]
        w='G:\\World of Warcraft\\_export\\'+rel.replace('/','\\')
        if w not in out: out.append(w)
n=int(sys.argv[2]) if len(sys.argv)>2 else 0
print(len(out),file=sys.stderr)
print(json.dumps(out[n:n+50]))
