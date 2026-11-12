// 맵 전체 퀘스트(data/qdb/quests.jsonl) 중 영어로 남은 것을 wowf.io 한글 도감에서 채움
// 결과: data/qdb/ko-extra.jsonl  {id,n,o,g,r}  (이미 받은 id는 건너뜀)
import fs from 'node:fs';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function get(u){for(let k=0;k<3;k++){try{const r=await fetch(u,{headers:{'user-agent':'WOWF-helper data sync (github.com/Misfits980/WOWF-helper-)','accept-language':'ko'}});if(r.status===404)return null;if(r.ok){await sleep(550);return await r.text()}}catch(e){}await sleep(2500)}return null}
const dec=s=>s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#x27;|&#39;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&');
const lat=s=>/[A-Za-z]{3}/.test(s||'');
const out='data/qdb/ko-extra.jsonl';const have=new Map();
if(fs.existsSync(out))for(const l of fs.readFileSync(out,'utf8').split('\n')){if(l){const o=JSON.parse(l);have.set(o.id,o)}}
const todo=[];
for(const l of fs.readFileSync('data/qdb/quests.jsonl','utf8').split('\n')){if(!l)continue;const q=JSON.parse(l);
  const hv=have.get(q.id);if(hv&&!(lat(q.n)&&!hv.ft))continue;if(lat(q.n)||lat(q.o)||lat(q.g&&q.g[0])||lat(q.r&&q.r[0]))todo.push(q.id)}
console.log('할 일',todo.length);let n=0;const t0=Date.now();
for(const id of todo){if(Date.now()-t0>40*60e3){console.log('시간 다 됨, 다음에 이어서');break}
  const h=await get('https://wowf.io/ko/quests/'+id);const rec={id};
  if(h){const tt=(h.match(/<meta property="og:title" content="([^"]*)"/)||h.match(/<title>([^<]*)<\/title>/)||[])[1];
    if(tt){const nm=dec(tt).split(/ [-|·] /)[0].replace(/^와우 포에버\s*/,'').replace(/\s*퀘스트$/,'').trim();if(nm)rec.n=nm}
    const body=h.replace(/<script[\s\S]*?<\/script>/g,'');
    const T=dec(body.replace(/<[^>]+>/g,'\n')).split('\n').map(x=>x.trim()).filter(Boolean);
    const s0=T.indexOf('퀘스트 목표');if(s0>=0&&T[s0+1]&&!/^(받기|완료|수행)$/.test(T[s0+1]))rec.o=T[s0+1];
    const npc=i=>{if(i<0)return null;let k=i+1;while(k<T.length&&/^[◉●○!?]+$/.test(T[k]))k++;return T[k]};
    const g=npc(T.indexOf('받기',s0));if(g)rec.g=g;const r=npc(T.indexOf('완료',s0));if(r)rec.r=r}
  const prev=have.get(id)||{};for(const k of ['n','o','g','r'])if(!rec[k]&&prev[k])rec[k]=prev[k];
  if(!rec.n||lat(rec.n)){const h2=await get('https://forever-tool.com/quests/'+id+'/');rec.ft=1;
    if(h2){const tt=(h2.match(/<title[^>]*>([^<]*)<\/title>/)||[])[1];if(tt){const nm=dec(tt).split(' (')[0].split(' - ')[0].trim();if(nm&&!lat(nm))rec.n=nm}}}
  have.set(id,rec);n++;if(n%100===0){console.log('wowf',n);fs.writeFileSync(out,[...have.values()].map(o=>JSON.stringify(o)).join('\n')+'\n')}}
fs.writeFileSync(out,[...have.values()].map(o=>JSON.stringify(o)).join('\n')+'\n');console.log('끝',n);
