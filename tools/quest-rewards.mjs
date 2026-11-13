// 포에버툴(forever-tool.com, 블리자드 공식 데이터 기반)에서 퀘스트 보상(경험치·돈·고르는 보상·받는 아이템·평판)을 data/forg/rewards.jsonl 로 저장
import fs from 'node:fs';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function get(u){for(let k=0;k<3;k++){try{const r=await fetch(u,{headers:{'user-agent':'WOWF-helper data sync (github.com/Misfits980/WOWF-helper-)','accept-language':'ko'}});if(r.status===404)return null;if(r.ok){await sleep(500);return await r.text()}}catch(e){}await sleep(2500)}return null}
const dec=s=>s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#x27;|&#39;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&');
const ids=[];for(const l of fs.readFileSync('data/forg/quests.jsonl','utf8').split('\n')){if(!l)continue;try{ids.push(String(JSON.parse(l).id))}catch(e){}}
// QuestieDB(포에버) 퀘스트 전부도 (forg 목록에 없는 퀘스트 보상·경험치)
if(fs.existsSync('data/qdb/quests.jsonl')){const seen=new Set(ids);for(const l of fs.readFileSync('data/qdb/quests.jsonl','utf8').split('\n')){if(!l)continue;try{const id=String(JSON.parse(l).id);if(!seen.has(id)){seen.add(id);ids.push(id)}}catch(e){}}}
const file='data/forg/rewards.jsonl';const have=new Map();
if(fs.existsSync(file)&&!process.env.FULL)for(const l of fs.readFileSync(file,'utf8').split('\n')){if(!l)continue;try{const o=JSON.parse(l);have.set(String(o.id),l)}catch(e){}}
const QN={1:'c',2:'u',3:'r',4:'e',5:'l',0:'p'};
function parse(id,h){const o={id:+id};const i=h.indexOf('>보상<');if(i<0)return o;const j=h.indexOf('퀘스트 번호',i);const b=h.slice(i,j>i?j:i+8000);
  const xp=b.match(/<dt[^>]*>경험치<\/dt><dd[^>]*><span[^>]*>([\d,]+)/);if(xp)o.xp=+xp[1].replace(/,/g,'');
  const mo=b.match(/<dt[^>]*>돈<\/dt><dd[^>]*>([\s\S]*?)<\/dd>/);if(mo){let c=0;for(const m of mo[1].matchAll(/(\d+)<span[^>]*aria-label="(골드|실버|코퍼)"/g))c+=+m[1]*({골드:10000,실버:100,코퍼:1}[m[2]]);o.money=c}
  for(const g of b.matchAll(/<div[^>]*><p[^>]*>([^<]+)<\/p><ul[^>]*>([\s\S]*?)<\/ul><\/div>/g)){const head=dec(g[1].trim());
    if(head==='평판'){o.rep=[...g[2].matchAll(/<li[^>]*><span[^>]*>([^<]+)<\/span><span[^>]*>([^<]+)<\/span>/g)].map(m=>[dec(m[1]),m[2]]);continue}
    const its=[...g[2].matchAll(/<a[^>]*href="\/items\/(\d+)\/?"[^>]*>([\s\S]*?)<\/a>/g)].map(m=>{const icon=(m[2].match(/icons\/\d+\/([^"./]+)\.jpg/)||[])[1]||'';const q=(m[2].match(/--q(\d)/)||[])[1];const nm=dec(((m[2].match(/<span[^>]*>([^<]+)<\/span>\s*$/)||m[2].match(/<span>([^<]+)<\/span>/)||[])[1]||'').trim());const cnt=(m[2].match(/[×x]\s*(\d+)/)||[])[1];return [+m[1],nm,icon,QN[q]||'c',cnt?+cnt:1]});
    if(/골라/.test(head))o.ch=its;else (o.fx=o.fx||[]).push(...its)}
  return o}
const out=[];let n=0;const t0=Date.now();const used=new Set();
/* 중간에 저장할 때·시간이 다 됐을 때 아직 안 지나간 기존 자료도 같이 씀 */
const rest=()=>[...have.entries()].filter(([k])=>!used.has(k)).map(([,l])=>l);
for(const id of ids){if(have.has(id)){out.push(have.get(id));used.add(id);continue}
  if(Date.now()-t0>35*60e3){console.log('시간 다 됨, 다음 실행 때 이어서');break}
  used.add(id);const h=await get('https://forever-tool.com/quests/'+id+'/');if(!h){out.push(JSON.stringify({id:+id,none:1}));continue}
  try{out.push(JSON.stringify(parse(id,h)));n++}catch(e){console.log('parse fail',id,e.message)}
  if(n%100===0&&n){console.log('fetched',n);fs.writeFileSync(file,[...out,...rest()].join('\n')+'\n')}}
fs.writeFileSync(file,[...out,...rest()].join('\n')+'\n');console.log('rewards',out.length,'new',n);
