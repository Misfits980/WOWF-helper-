import fs from 'node:fs';
const out=[];
async function g(u){const r=await fetch(u,{headers:{'user-agent':'Mozilla/5.0 (WOWF-helper)','accept-language':'ko'}});return [r.status,await r.text()]}
const txt=h=>h.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<style[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,'\n').split('\n').map(s=>s.trim()).filter(Boolean);
for(const home of ['https://zephras.com','https://bindonforever.com','https://wowf.io/ko','https://eternadex.com/en/','https://forever-tool.com','https://wowguildhub.com/wow-forever/guide']){
  try{const [st,h]=await g(home);const links=[...new Set([...h.matchAll(/href="([^"]*quest[^"]*)"/gi)].map(m=>m[1]))].slice(0,12);out.push('## '+home+' '+st+' questlinks: '+links.join(' '))}catch(e){out.push('## '+home+' ERR '+e.message)}}
const tries=['https://zephras.com/quest/12','https://zephras.com/quests/12','https://bindonforever.com/quest/12','https://bindonforever.com/quests/12','https://wowf.io/ko/quest/12','https://wowf.io/ko/quests/12','https://eternadex.com/en/quest/12','https://forever-tool.com/quest/12','https://forever-tool.com/quests/12','https://zephras.com/quest/102','https://bindonforever.com/quest/102','https://wowf.io/ko/quest/102'];
for(const u of tries){try{const [st,h]=await g(u);const t=txt(h);out.push('### '+u+' '+st+' len '+h.length+' :: '+t.slice(0,220).join(' / ').slice(0,2600))}catch(e){out.push('### '+u+' ERR')}}
fs.writeFileSync('data/_probe.txt',out.join('\n\n'));
