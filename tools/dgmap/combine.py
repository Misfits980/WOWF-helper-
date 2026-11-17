import json,glob,os,shutil
R='/home/claude/wowf-helper-'
os.makedirs(R+'/data/dgmap',exist_ok=True)
out={'_':'게임 모델(wow.export로 포에버 클라이언트에서 내보냄)을 위에서 본 지도. 핀·쫄 무리·순찰은 세계 좌표를 그림 %로 바꾼 것(CMaNGOS classic-db 자리, 보스 이름이 같으면 정확·없으면 예전 지도 핀을 맞춤식으로 옮김 w=2). 만든 도구: tools/dgmap'}
for p in sorted(glob.glob('/home/claude/dgmap/final/*.json')):
    slug=os.path.basename(p)[:-5];d=json.load(open(p))
    for f in d['floors']:
        shutil.copy('/home/claude/dgmap/final/'+os.path.basename(f['img']),R+'/'+f['img'])
    out[slug]={'floors':d['floors']}
json.dump(out,open(R+'/data/guides/dungeon-maps3d.json','w'),ensure_ascii=False,separators=(',',':'))
print({k:len(v['floors']) for k,v in out.items() if k!='_'})
