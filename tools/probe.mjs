import fs from 'node:fs';
const slugs=fs.readFileSync('data/forg/dungeons.txt','utf8').split('\n').filter(Boolean).map(l=>l.split('|')[0]);
const out=[];
for(const s of slugs){for(const u of ['https://forg.gg/images/wow-forever/dungeons/'+s+'-loading.webp']){try{const r=await fetch(u,{method:'GET',headers:{'user-agent':'Mozilla/5.0'}});out.push(s+' '+r.status+' '+(r.headers.get('content-type')||'')+' '+(r.headers.get('content-length')||''))}catch(e){out.push(s+' ERR')}}}
fs.writeFileSync('data/_probe.txt',out.join('\n'));
