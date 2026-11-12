// forg.gg 장비 페이지가 쓰는 포에버 시뮬레이터 능력치 가중치(wowsims/forever)를 꺼내 data/forg/sim-weights.json 에 저장
// 페이지 스크립트를 실행하지 않고, 스크립트 글 안의 JSON 자료만 읽는다
import fs from 'node:fs';
const UA={'user-agent':'WOWF-helper data sync (github.com/Misfits980/WOWF-helper-)'};
const get=async u=>{const r=await fetch(u,{headers:UA});return r.ok?r.text():''};
const page=await get('https://forg.gg/forever/gear/rogue');
const chunks=[...new Set([...page.matchAll(/src="(\/_next\/static\/chunks\/[^"]+)"/g)].map(m=>m[1]))];
for(const c of chunks){const js=await get('https://forg.gg'+c);const i=js.indexOf('forever-sim-weights');if(i<0)continue;
  const st=js.lastIndexOf("JSON.parse('",i)+12;const en=js.indexOf("')",i);let raw=js.slice(st,en);
  raw=raw.replace(/\\'/g,"'");const j=JSON.parse(raw);
  fs.writeFileSync('data/forg/sim-weights.json',JSON.stringify(j));console.log('가중치',Object.keys(j.specs).length,'특성',j.computedAt);process.exit(0)}
console.log('가중치 자료를 못 찾았어요');
