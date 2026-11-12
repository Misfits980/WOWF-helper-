import fs from 'node:fs';
const B='https://forg.gg';const out=[];
const get=async u=>{const r=await fetch(B+u,{headers:{'user-agent':'WOWF-helper data sync','accept-language':'ko'}});return [r.status,await r.text()]};
function rscText(h){let t='';for(const m of h.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)){try{t+=JSON.parse(m[1])}catch(e){}}return t}
let [st,h]=await get('/forever/quest');let t=rscText(h);
const links=[...new Set([...h.matchAll(/href="(\/forever\/quest\/[^"]+)"/g)].map(m=>m[1]))];
out.push('list '+st+' len '+h.length+' rsc '+t.length+' links '+links.length+' '+links.slice(0,8).join(' '));
const keys=[...new Set([...t.matchAll(/"([a-zA-Z]+)":(?=[\[{])/g)].map(m=>m[1]))];out.push('keys '+keys.slice(-80).join(','));
const i=t.indexOf('백성의 민병대');out.push('ctx '+(i>=0?t.slice(Math.max(0,i-600),i+600):'none'));
const d=links.find(l=>/quest\/12(\D|$)/.test(l))||links[0];
if(d){[st,h]=await get(d);t=rscText(h);out.push('### detail '+d+' '+st+' rsc '+t.length);
  const k2=[...new Set([...t.matchAll(/"([a-zA-Z]+)":(?=[\[{])/g)].map(m=>m[1]))];out.push('keys '+k2.slice(-90).join(','));
  for(const kw of ['"series"','"chain"','"next"','"prev"','"objectives"','"items"','"npcs"','"giver"','"ender"','"requires"']){const j=t.indexOf(kw);out.push('['+kw+'] '+(j>=0?t.slice(j,j+700):''))}
  const txt=h.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<[^>]+>/g,'\n').split('\n').map(s=>s.trim()).filter(Boolean);out.push('TEXT '+txt.slice(0,160).join(' / '))}
fs.writeFileSync('data/_probe.txt',out.join('\n\n'));
