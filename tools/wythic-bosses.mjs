// wythic.com 던전 페이지에서 보스 모습 그림(와우헤드 모델 썸네일 주소)을 모아 data/forg/bosses.txt 로 저장
import fs from 'node:fs';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function get(u){for(let k=0;k<3;k++){try{const r=await fetch(u,{headers:{'user-agent':'Mozilla/5.0 (WOWF-helper data sync)','accept-language':'ko'}});if(r.ok){await sleep(800);return await r.text()}}catch(e){}await sleep(2500)}return ''}
const dec=s=>s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#x27;|&#39;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&');
const idx=await get('https://wythic.com/ko/forever/dungeons');
const links=[...new Set([...idx.matchAll(/href="(\/ko\/forever\/dungeons\/\d+)"/g)].map(m=>m[1]))];
const out=[];const probe=[];
for(const l of links){const h=await get('https://wythic.com'+l);if(!h)continue;
  const title=dec((h.match(/<title>([^<|]+)/)||[])[1]||'').replace(/^와우 포에버\s*/,'').replace(/\s*던전 공략.*$/,'').trim();
  const body=h.replace(/<script[\s\S]*?<\/script>/g,'');
  for(const m of body.matchAll(/https:\/\/wow\.zamimg\.com\/modelviewer\/[a-z]+\/webthumbs\/npc\/\d+\/\d+\.webp/g)){
    const after=dec(body.slice(m.index,m.index+1500).replace(/<[^>]+>/g,'\n')).split('\n').map(s=>s.trim()).filter(Boolean);
    const before=dec(body.slice(Math.max(0,m.index-1500),m.index).replace(/<[^>]+>/g,'\n')).split('\n').map(s=>s.trim()).filter(Boolean);
    const alt=(body.slice(Math.max(0,m.index-400),m.index+400).match(/alt="([^"]+)"/)||[])[1]||'';
    const name=dec(alt)||after.find(s=>/[가-힣]/.test(s)&&s.length<30)||'';
    out.push([title,name,m[0]].join('|'));
    if(probe.length<6)probe.push(title+' | alt='+alt+' | after='+after.slice(0,6).join(' / ')+' | before='+before.slice(-4).join(' / '))}}
fs.writeFileSync('data/forg/bosses.txt',[...new Set(out)].join('\n')+'\n');
console.log('dungeon pages',links.length,'boss imgs',out.length);console.log(probe.join('\n'));
