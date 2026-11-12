// forg.gg 레벨링 경로(얼라이언스 출발 3곳)에서 구간·퀘스트(레벨, 받는 곳, 할 일, 연속/앞 단계) 수집 → data/forg/leveling.txt
import fs from 'node:fs';
const BASE='https://forg.gg';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function get(u){for(let k=0;k<3;k++){try{const r=await fetch(BASE+u,{headers:{'user-agent':'WOWF-helper data sync (github.com/Misfits980/WOWF-helper-)','accept-language':'ko'}});if(r.ok){await sleep(700);return await r.text()}}catch(e){}await sleep(2000)}throw new Error('fetch fail '+u)}
function rscText(h){let t='';for(const m of h.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)){try{t+=JSON.parse(m[1])}catch(e){}}return t}
function grabAt(t,i){const st=i;let d=0,ins=false,esc=false;for(;i<t.length;i++){const c=t[i];if(ins){if(esc)esc=false;else if(c==='\\')esc=true;else if(c==='"')ins=false;continue}if(c==='"'){ins=true;continue}if(c==='['||c==='{')d++;else if(c===']'||c==='}'){d--;if(d===0){i++;break}}}return JSON.parse(t.slice(st,i))}
const clean=s=>String(s??'').replace(/[|\n\r]/g,' ').trim();
const out=[];
for(const start of ['dwarf-gnome','human','nightelf']){
  const t=rscText(await get('/forever/leveling?faction=alliance&start='+start));
  const ev=[];
  for(const m of t.matchAll(/"children":"Lv (\d+)[–-](\d+)"\}\]," ",\["\$","span",null,\{"children":"([^"]+)"\}\]/g))ev.push({i:m.index,h:[m[1],m[2],m[3]]});
  for(const m of t.matchAll(/"view":\{"name":"/g)){let v;try{v=grabAt(t,m.index+7)}catch(e){continue}if(v&&v.meta&&/^Lv /.test(v.meta))ev.push({i:m.index,v})}
  ev.sort((a,b)=>a.i-b.i);
  out.push('@'+start);
  for(let k=0;k<ev.length;k++){const e=ev[k];
    if(e.h){out.push('#'+e.h.join('|'));continue}
    const v=e.v;const seg=t.slice(e.i,k+1<ev.length?ev[k+1].i:e.i+3000);
    const ch=(seg.match(/연속 (\d+)개/)||[])[1]||'';const pre=(seg.match(/앞 단계 (\d+)개/)||[])[1]||'';
    const mm=v.meta.match(/Lv (\d+)(?: · (\d+)레벨부터)?(?: · (.+))?/)||[];
    const side=mm[3]||'';if(/호드/.test(side)&&!/얼라이언스/.test(side))continue;
    const st=clean(v.start);const sm=st.match(/^(.*?) · (.*?)(?: \(([\d.]+), ([\d.]+)\))?$/)||[];
    out.push([mm[1]||'',mm[2]||'',clean(v.name),sm[1]||'',sm[2]||st,sm[3]?sm[3]+','+sm[4]:'',ch,pre,clean(v.objective)].join('|'));
  }
}
fs.mkdirSync('data/forg',{recursive:true});
fs.writeFileSync('data/forg/leveling.txt',out.join('\n')+'\n');
console.log('lines',out.length);
