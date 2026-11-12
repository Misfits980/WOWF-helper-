import fs from 'node:fs';
const out=[];
const h=await (await fetch('https://forg.gg/forever/dungeons/hall-of-thanes',{headers:{'user-agent':'WOWF-helper','accept-language':'ko'}})).text();
const imgs=[...new Set([...h.matchAll(/(\/images\/[^"'\s\\)]+\.(?:webp|png|jpg))/g)].map(m=>m[1]))];
out.push('forg imgs '+imgs.length+'\n'+imgs.join('\n'));
const i=h.indexOf('팔드림 앤빌마');out.push(h.slice(Math.max(0,i-1500),i+300).replace(/\s+/g,' '));
for(const u of ['https://wythic.com/ko/forever/dungeons/721','https://wowf.io/ko/dungeons']){try{const t=await (await fetch(u,{headers:{'user-agent':'Mozilla/5.0','accept-language':'ko'}})).text();const im=[...new Set([...t.matchAll(/(?:src|href)="([^"]+\.(?:webp|png|jpg)[^"]*)"/g)].map(m=>m[1]))].filter(x=>/boss|npc|creature|portrait|encounter/i.test(x));out.push('## '+u+' '+im.length+'\n'+im.slice(0,20).join('\n'))}catch(e){out.push('ERR '+u)}}
fs.writeFileSync('data/_probe.txt',out.join('\n\n'));
