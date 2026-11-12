// forg 상세에 연계 표가 없는 퀘스트는 wowf.io 퀘스트 도감의 "연계" 목록으로 채운다
import fs from 'node:fs';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function get(u){for(let k=0;k<3;k++){try{const r=await fetch(u,{headers:{'user-agent':'WOWF-helper data sync (github.com/Misfits980/WOWF-helper-)','accept-language':'ko'}});if(r.status===404)return null;if(r.ok){await sleep(600);return await r.text()}}catch(e){}await sleep(2500)}return null}
const dec=s=>s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#x27;|&#39;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&');
const want=new Set();for(const l of fs.readFileSync('data/forg/leveling.txt','utf8').split('\n')){const f=l.split('|');if(f.length>=10&&+f[6]>0&&/^\d+$/.test(f[9].trim()))want.add(+f[9])}
const file='data/forg/quests.jsonl';const lines=fs.readFileSync(file,'utf8').split('\n').filter(Boolean).map(l=>JSON.parse(l));const byId=new Map(lines.map(o=>[o.id,o]));
let n=0;
for(const id of want){const o=byId.get(id)||{id};if(o.ch&&o.ch.length>1)continue;if(o.chSrc==='none')continue;
  const h=await get('https://wowf.io/ko/quests/'+id);if(!h){o.chSrc='none';continue}
  const body=h.replace(/<script[\s\S]*?<\/script>/g,'');const i=body.search(/>연계</);if(i<0){o.chSrc='none';byId.set(id,o);continue}
  const seg=body.slice(i,i+20000);const end=seg.search(/소식 &amp; 토론|<footer/);const s2=end>0?seg.slice(0,end):seg;
  const rows=[];const re=/href="\/ko\/quests\/(\d+)"[^>]*>([\s\S]*?)<\/a>/g;let m;let step=0;
  const txt=s=>dec(s.replace(/<[^>]+>/g,'\n')).split('\n').map(x=>x.trim()).filter(Boolean);
  const parts=s2.split(/(?=<li)/);
  for(const p of parts){const t=txt(p);if(!t.length)continue;const a=p.match(/href="\/ko\/quests\/(\d+)"/);const lv=(t.join(' ').match(/레벨 (\d+)/)||[])[1];const no=t.find(x=>/^\d+$/.test(x));const nm=t.find(x=>!/^\d+$/.test(x)&&!/^레벨 /.test(x)&&x!=='연계');
    if(!nm||!lv)continue;step=no?+no:step+1;const qid=a?+a[1]:id;rows.push([step,nm,+lv,'','',qid===id?1:0,qid])}
  if(rows.length>1){o.ch=rows;o.cn=rows.length;o.cc=(rows.find(r=>r[5])||[0])[0]||1;o.chSrc='wowf';n++}else o.chSrc='none';
  byId.set(id,o)}
fs.writeFileSync(file,[...byId.values()].map(o=>JSON.stringify(o)).join('\n')+'\n');console.log('wowf chains',n);
