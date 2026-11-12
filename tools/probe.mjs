import fs from 'node:fs';
const B='https://forg.gg';const out=[];
const get=async u=>{const r=await fetch(B+u,{headers:{'user-agent':'WOWF-helper data sync','accept-language':'ko'}});return [r.status,await r.text()]};
function rscText(h){let t='';for(const m of h.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)){try{t+=JSON.parse(m[1])}catch(e){}}return t}
const [st,h]=await get('/forever/quest/12');const t=rscText(h);
const keys=[...new Set([...t.matchAll(/"([a-zA-Z]+)":(?=[\[{"0-9tfn])/g)].map(m=>m[1]))];
out.push('keys '+keys.slice(-150).join(','));
for(const kw of ['데피아즈단 강탈자','"giver"','"turnin"','"objectives"','"targets"','"drops"','"steps"','"chain"','덫사냥꾼']){let i=-1,n=0;while((i=t.indexOf(kw,i+1))>=0&&n<2){out.push('['+kw+'] '+t.slice(Math.max(0,i-700),i+700));n++}}
fs.writeFileSync('data/_probe.txt',out.join('\n\n'));
