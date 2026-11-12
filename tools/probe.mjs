import fs from 'node:fs';
const B='https://forg.gg';const out=[];
const get=async u=>{const r=await fetch(B+u,{headers:{'user-agent':'WOWF-helper data sync','accept-language':'ko'}});return [r.status,await r.text()]};
function rscText(h){let t='';for(const m of h.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)){try{t+=JSON.parse(m[1])}catch(e){}}return t}
for(const id of [12,102,9]){const [st,h]=await get('/forever/quest/'+id);const t=rscText(h);
  const txt=h.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<[^>]+>/g,'\n').split('\n').map(s=>s.trim()).filter(Boolean);
  const a=txt.findIndex(x=>x==='퀘스트'&&txt[txt.indexOf(x)-1]==='와우 포에버');const s0=txt.findIndex(x=>/^Lv \d+$/.test(x));
  out.push('### '+id+' '+st+' TEXT '+txt.slice(Math.max(0,s0-4),s0+140).join(' / '));
  const i=t.indexOf('"quest":{');out.push('QOBJ '+(i>=0?t.slice(i,i+3500):'none'));
}
fs.writeFileSync('data/_probe.txt',out.join('\n\n'));
