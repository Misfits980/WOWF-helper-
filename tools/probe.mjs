import fs from 'node:fs';
const out=[];
async function g(u){const r=await fetch(u,{headers:{'user-agent':'Mozilla/5.0 (WOWF-helper)','accept-language':'ko'}});return [r.status,await r.text()]}
for(const u of ['https://forever-tool.com/quests/9/','https://forever-tool.com/quests/1013/','https://forever-tool.com/quests/2926/']){
  const [st,h]=await g(u);const b=h.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<style[\s\S]*?<\/style>/g,'');
  const i=b.indexOf('>보상<');const j=b.indexOf('퀘스트 번호',i);
  out.push('### '+u+' '+st+' i '+i+' j '+j+'\n'+(i>=0?b.slice(i-200,(j>i?j:i+6000)+50).replace(/\s+/g,' ').replace(/ class="[^"]*"/g,''):b.slice(0,300)));
  const k=b.indexOf('받는 조건');out.push('COND '+b.slice(k,k+800).replace(/\s+/g,' ').replace(/ class="[^"]*"/g,''))}
fs.writeFileSync('data/_probe.txt',out.join('\n\n'));
