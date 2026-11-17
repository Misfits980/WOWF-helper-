"""cmangos classic-db SQL → 던전 맵의 몹 생성 자리·순찰 경로 (json). python3 -I parse.py <sql.gz> <out.json>"""
import gzip, json, re, sys
MAPS={389,36,43,33,48,34,90,47,189,129,70,209,349,109,230,229,429,289,329}
want={'creature','creature_movement','creature_movement_template','creature_template','creature_spawn_entry','spawn_group_spawn','spawn_group_entry','spawn_group_formation','waypoint_path'}
def tuples(s):
    # s: "(...),(...);" — 따옴표 안 쉼표·괄호 처리
    out=[];i=0;n=len(s)
    while i<n:
        if s[i]!='(':
            i+=1;continue
        i+=1;row=[];cur=[];q=False
        while i<n:
            ch=s[i]
            if q:
                if ch=='\\': cur.append(s[i+1]);i+=2;continue
                if ch=="'":
                    if i+1<n and s[i+1]=="'": cur.append("'");i+=2;continue
                    q=False;i+=1;continue
                cur.append(ch);i+=1;continue
            if ch=="'": q=True;i+=1;continue
            if ch==',': row.append(''.join(cur));cur=[];i+=1;continue
            if ch==')': row.append(''.join(cur));out.append(row);i+=1;break
            cur.append(ch);i+=1
    return out
cols={};data={k:[] for k in want};curT=None;colbuf=[]
with gzip.open(sys.argv[1],'rt',encoding='utf-8',errors='replace') as f:
    for line in f:
        m=re.match(r'CREATE TABLE `(\w+)` \(',line)
        if m: curT=m.group(1);colbuf=[];continue
        if curT and line.startswith('  `'):
            colbuf.append(line.split('`')[1]);continue
        if curT and line.startswith(')'):
            cols[curT]=colbuf;curT=None;continue
        m=re.match(r'INSERT INTO `(\w+)` (?:\([^)]*\) )?VALUES',line)
        if m and m.group(1) in want:
            data[m.group(1)].extend(tuples(line[m.end():]))
C=cols['creature'];ix={c:i for i,c in enumerate(C)}
cr=[r for r in data['creature'] if int(r[ix['map']]) in MAPS]
guids={int(r[ix['guid']]) for r in cr}
cse={}
for r in data['creature_spawn_entry']:
    g=int(r[0])
    if g in guids: cse.setdefault(g,[]).append(int(r[1]))
sgs={};grp=set()
for r in data['spawn_group_spawn']:
    g=int(r[1])
    if g in guids: sgs[g]=[int(r[0]),int(r[2])];grp.add(int(r[0]))
sge={}
for r in data['spawn_group_entry']:
    i=int(r[0])
    if i in grp: sge.setdefault(i,[]).append([int(r[1]),int(r[4])])
sgf={}
for r in data['spawn_group_formation']:
    i=int(r[0])
    if i in grp: sgf[i]=[int(r[4]),int(r[5])]
pids={v[0] for v in sgf.values() if v[0]}
wp={}
for r in data['waypoint_path']:
    p=int(r[0])
    if p in pids: wp.setdefault(p,[]).append([int(r[1]),round(float(r[2]),1),round(float(r[3]),1),round(float(r[4]),1)])
ents={int(r[ix['id']]) for r in cr}|{e for v in cse.values() for e in v}|{e for v in sge.values() for e,_ in v}
T=cols['creature_template'];it={c:i for i,c in enumerate(T)}
tpl={}
for r in data['creature_template']:
    e=int(r[it['Entry']])
    if e in ents: tpl[e]=[r[it['Name']],int(r[it['Rank']]),int(r[it['MinLevel']]),int(r[it['MaxLevel']]),int(r[it['CreatureType']]),int(r[it['Faction']]),int(r[it['UnitFlags']]),int(r[it['MovementType']])]
M=cols['creature_movement'];im={c:i for i,c in enumerate(M)}
mv={}
for r in data['creature_movement']:
    g=int(r[im['Id']])
    if g in guids: mv.setdefault(g,[]).append([int(r[im['Point']]),round(float(r[im['PositionX']]),1),round(float(r[im['PositionY']]),1),round(float(r[im['PositionZ']]),1)])
MT=cols['creature_movement_template'];imt={c:i for i,c in enumerate(MT)}
mvt={}
for r in data['creature_movement_template']:
    e=int(r[imt['Entry']])
    if e in ents: mvt.setdefault(e,{}).setdefault(int(r[imt['PathId']]),[]).append([int(r[imt['Point']]),round(float(r[imt['PositionX']]),1),round(float(r[imt['PositionY']]),1),round(float(r[imt['PositionZ']]),1)])
out={'maps':{}, 'tpl':tpl}
for r in cr:
    mp=int(r[ix['map']]);g=int(r[ix['guid']]);e=int(r[ix['id']])
    out['maps'].setdefault(str(mp),[]).append([g,e,round(float(r[ix['position_x']]),1),round(float(r[ix['position_y']]),1),round(float(r[ix['position_z']]),1),int(r[ix['MovementType']]),round(float(r[ix['spawndist']]),1)])
out['mv']={str(k):sorted(v) for k,v in mv.items()}
out['cse']={str(k):v for k,v in cse.items()};out['sgs']={str(k):v for k,v in sgs.items()};out['sge']={str(k):v for k,v in sge.items()};out['sgf']={str(k):v for k,v in sgf.items()};out['wp']={str(k):sorted(v) for k,v in wp.items()}
out['mvt']={str(k):{str(p):sorted(v) for p,v in d.items()} for k,d in mvt.items()}
json.dump(out,open(sys.argv[2],'w'))
print('cse',len(cse),'sgs',len(sgs),'sgf',len(sgf),'wp',len(wp));print('creatures',len(cr),'tpl',len(tpl),'paths(guid)',len(mv),'paths(entry)',len(mvt))
for mp in sorted(out['maps'],key=int): print(mp,len(out['maps'][mp]))
