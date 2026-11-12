import fs from 'node:fs';
const out=[];
async function g(u){const r=await fetch(u,{headers:{'user-agent':'Mozilla/5.0 (WOWF-helper)','accept-language':'ko'}});return [r.status,await r.text()]}
const txt=h=>h.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<style[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,'\n').split('\n').map(s=>s.trim()).filter(Boolean);
for(const [u,mark] of [['https://wowf.io/ko/quests/102','QUESTS'],['https://forever-tool.com/quests/102','퀘스트 · '],['https://wowf.io/ko/quests/12','QUESTS'],['https://bindonforever.com/quest/102','Patrolling Westfall'],['https://forever-tool.com/quests/9','퀘스트 · ']]){
  const [st,h]=await g(u);const t=txt(h);let i=t.findIndex((x,k)=>k>20&&x.includes(mark));if(i<0)i=0;
  out.push('### '+u+' '+st+' :: '+t.slice(i,i+170).join(' / '));
  const js=[...h.matchAll(/<script[^>]*type="application\/(?:ld\+)?json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1].slice(0,1500));out.push('JSON '+js.join(' ||| ').slice(0,3000))}
fs.writeFileSync('data/_probe.txt',out.join('\n\n'));
