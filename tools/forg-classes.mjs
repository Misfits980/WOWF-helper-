// forg.gg 직업 가이드에서 9직업·전문화별 기술 습득표, 운영 순서, 레벨별 특성 순서를 data/forg/classes.json 으로 저장
import fs from 'node:fs';
const BASE='https://forg.gg';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function get(u){for(let k=0;k<3;k++){try{const r=await fetch(BASE+u,{headers:{'user-agent':'WOWF-helper data sync (github.com/Misfits980/WOWF-helper-)','accept-language':'ko'}});if(r.ok){await sleep(700);return await r.text()}}catch(e){}await sleep(2000)}throw new Error('fetch fail '+u)}
function rscText(h){let t='';for(const m of h.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)){try{t+=JSON.parse(m[1])}catch(e){}}return t}
function grabAt(t,i){const st=i;let d=0,ins=false,esc=false;for(;i<t.length;i++){const c=t[i];if(ins){if(esc)esc=false;else if(c==='\\')esc=true;else if(c==='"')ins=false;continue}if(c==='"'){ins=true;continue}if(c==='['||c==='{')d++;else if(c===']'||c==='}'){d--;if(d===0){i++;break}}}return JSON.parse(t.slice(st,i))}
function grabVal(t,key){const re=new RegExp('"'+key+'":(?=[\\[{])','g');const m=re.exec(t);if(!m)return null;try{return grabAt(t,m.index+m[0].length)}catch(e){return null}}
function refMap(t){const M={};for(const l of t.split('\n')){const m=l.match(/^([0-9a-f]+):([\[{"].*)$/);if(m){try{M[m[1]]=JSON.parse(m[2])}catch(e){}}}return M}
function res(v,M,d=0){if(d>8)return v;if(typeof v==='string'&&/^\$[0-9a-f]+$/.test(v)){const r=M[v.slice(1)];return r===undefined?v:res(r,M,d+1)}if(Array.isArray(v))return v.map(x=>res(x,M,d+1));if(v&&typeof v==='object'){const o={};for(const k in v)o[k]=res(v[k],M,d+1);return o}return v}
const ico=s=>String(s||'').split('/').pop().replace(/\.(jpg|png)$/,'');
function partsTxt(parts){return (parts||[]).map(p=>{if(!p)return '';if(p.kind==='text')return p.text||'';if(p.kind==='chip'&&p.chip)return '['+p.chip.name+(p.level?'@'+p.level:'')+(p.talent?'*':'')+']';return typeof p==='string'?p:''}).join('').replace(/\s+/g,' ').trim()}
function rot(list){return (Array.isArray(list)?list:[]).map(r=>({when:(r.when||[]).join(' · '),txt:partsTxt(r.parts),lv:r.level||null,icons:(r.parts||[]).filter(p=>p&&p.kind==='chip'&&p.chip).map(p=>[p.chip.name,ico(p.chip.icon),p.level||null])}))}
const CL=['warrior','paladin','hunter','rogue','priest','shaman','mage','warlock','druid'];
const OUT={};
for(const c of CL){
  const t0=rscText(await get('/forever/classes/'+c));
  const specs=(grabVal(t0,'specs')||[]).filter(s=>s&&s.id).map(s=>({id:s.id,name:s.name,icon:s.icon}));
  const M0=refMap(t0);
  const learnsRaw=res(grabVal(t0,'learns')||{},M0);
  const learns=[];for(const [lv,arr] of Object.entries(learnsRaw)){for(const x of (Array.isArray(arr)?arr:[])){if(!x||!x.chip)continue;learns.push([+lv,x.chip.name,x.rank||1,x.first?1:0,x.faction||'',x.only||'',ico(x.chip.icon),String(x.chip.desc||'').replace(/\s+/g,' ').slice(0,160)])}}
  const td=res(grabVal(t0,'talentData')||{},M0);
  const tal={};(td.trees||[]).forEach(tr=>(tr.talents||[]).forEach(x=>{tal[x.id]={n:x.name,t:tr.name,max:x.maxRank,tier:x.tier,col:x.column,icon:ico(x.icon),d:(x.ranks||[])[ (x.ranks||[]).length-1 ]||''}}));
  const trees=(td.trees||[]).map(tr=>tr.name);
  const cls={name:td.className||c,color:td.classColor||'',specs:[],learns,trees,talents:tal};
  for(const s of specs){
    const t=s===specs[0]?t0:rscText(await get('/forever/classes/'+c+'?spec='+s.id));
    const M=refMap(t);
    const order=grabVal(t,'codeOrder')||[];const lb=grabVal(t,'levelBuilds')||{};
    // 레벨별 코드 → 그 레벨에 오른 특성
    const steps=[];let prev=[];
    for(const lv of Object.keys(lb).map(Number).sort((a,b)=>a-b)){const code=String(lb[lv].code||'');const cur=order.map((id,i)=>+(code[i]||0));
      order.forEach((id,i)=>{if((cur[i]||0)>(prev[i]||0))steps.push([lv,id,cur[i]])});prev=cur}
    const summary=res(grabVal(t,'why')||null,M);
    cls.specs.push({id:s.id,name:s.name,icon:s.icon,steps,
      rotation:rot(res(grabVal(t,'rotation'),M)),early:rot(res(grabVal(t,'rotationEarly'),M)),late:rot(res(grabVal(t,'rotationLate'),M))});
  }
  OUT[c]=cls;console.log(c,specs.map(s=>s.id).join(','),'learns',learns.length,'talents',Object.keys(tal).length);
}
fs.mkdirSync('data/forg',{recursive:true});
fs.writeFileSync('data/forg/classes.json',JSON.stringify(OUT));
