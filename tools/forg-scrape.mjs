// forg.gg 공개 페이지에서 와우 포에버 장비·던전·던전 퀘스트 자료를 모아 data/forg/ 에 저장
import fs from 'node:fs';
const BASE='https://forg.gg';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function get(u){for(let k=0;k<3;k++){try{const r=await fetch(BASE+u,{headers:{'user-agent':'WOWF-helper data sync (github.com/Misfits980/WOWF-helper-)','accept-language':'ko'}});if(r.ok){await sleep(700);return await r.text()}}catch(e){}await sleep(2000)}throw new Error('fetch fail '+u)}
function rscText(h){let t='';for(const m of h.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)){try{t+=JSON.parse(m[1])}catch(e){}}return t}
function grabAt(t,i){const st=i;let d=0,ins=false,esc=false;for(;i<t.length;i++){const c=t[i];if(ins){if(esc)esc=false;else if(c==='\\')esc=true;else if(c==='"')ins=false;continue}if(c==='"'){ins=true;continue}if(c==='['||c==='{')d++;else if(c===']'||c==='}'){d--;if(d===0){i++;break}}}return JSON.parse(t.slice(st,i))}
function grabVal(t,key){const re=new RegExp('"'+key+'":(?=[\\[{])','g');const m=re.exec(t);return m?grabAt(t,m.index+m[0].length):null}
function refMap(t){const M={};for(const l of t.split('\n')){const m=l.match(/^([0-9a-f]+):([\[{"].*)$/);if(m){try{M[m[1]]=JSON.parse(m[2])}catch(e){}}}return M}
function res(v,M,d=0){if(d>6)return v;if(typeof v==='string'&&/^\$[0-9a-f]+$/.test(v)){const r=M[v.slice(1)];return r===undefined?v:res(r,M,d+1)}if(Array.isArray(v))return v.map(x=>res(x,M,d+1));if(v&&typeof v==='object'){const o={};for(const k in v)o[k]=res(v[k],M,d+1);return o}return v}
const clean=s=>String(s??'').replace(/[|\n\r]/g,' ').trim();

// 1) 던전 목록 (적정·권장 레벨) — HTML 텍스트에서 읽기
const listHtml=await get('/forever/dungeons');
const listTxt=listHtml.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<[^>]+>/g,'\n').replace(/&amp;/g,'&').split('\n').map(s=>s.trim()).filter(Boolean);
const slugs=[...new Set([...listHtml.matchAll(/href="\/forever\/dungeons\/([a-z0-9-]+)"/g)].map(m=>m[1]))];
const DGL=[];
{ // 텍스트 흐름: 적정 레벨 / N / 권장 a–b / 이름 / [신규] [HOT] [약어] / 영어 / 위치·입구 / 장소 / 보스 n · 드랍 n · 퀘스트 n
  let i=0;
  while(i<listTxt.length){
    if(listTxt[i]==='적정 레벨'&&/^\d+$/.test(listTxt[i+1]||'')){
      const fit=listTxt[i+1];const rg=(listTxt[i+2]||'').replace('권장 ','');const ko=listTxt[i+3];
      let j=i+4;while(j<listTxt.length&&listTxt[j]!=='위치·입구')j++;
      const mid=listTxt.slice(i+4,j).filter(x=>!['신규','HOT'].includes(x));const en=mid.filter(x=>/[a-z]/.test(x)).pop()||'';
      const loc=listTxt[j+1]||'';const cnt=((listTxt.slice(j,j+4).join(' ').match(/보스 (\d+) · 드랍 (\d+) · 퀘스트 (\d+)/))||[]).slice(1).join(',');
      DGL.push([null,ko,en,loc,fit,rg,cnt]);i=j+1;continue}
    i++}
}
// 이름 → 슬러그 매칭 (목록 순서대로)
const nameToSlug={};
for(const s of slugs){const m=listHtml.match(new RegExp('href="/forever/dungeons/'+s+'"[^>]*>([^<]+)<'));if(m)nameToSlug[m[1].trim()]=s}
DGL.forEach(r=>r[0]=nameToSlug[r[1]]||'');
const dgl=DGL.filter(r=>r[0]);

// 2) 던전별 보스 순서와 퀘스트
const DQ=[];
for(const r of dgl){const s=r[0];const t=rscText(await get('/forever/dungeons/'+s));const M=refMap(t);
  const bi=t.indexOf('"bosses":[{"slug"');const bos=bi>0?grabAt(t,bi+9):[];
  DQ.push('B|'+s+'|'+bos.map(b=>clean(b.slug)+'='+clean(b.name)).join(';'));
  const seen={};
  for(const m of t.matchAll(/\{"id":\d+,"side":"/g)){let q;try{q=grabAt(t,m.index)}catch(e){continue}if(seen[q.id])continue;seen[q.id]=1;q=res(q,M);
    const rw=[];(function walk(x){if(Array.isArray(x))x.forEach(walk);else if(x&&typeof x==='object'){if(typeof x.id==='number'&&(x.quality||x.name))rw.push(x.id);else Object.values(x).forEach(walk)}})(q.rewards);
    const bn=[];(function walk(x){if(Array.isArray(x))x.forEach(walk);else if(x&&typeof x==='object'&&x.number)bn.push(x.number+' '+clean(x.name))})(q.bosses);
    const before=Array.isArray(q.before)?q.before.length:(q.before?1:0);
    DQ.push(['Q',s,q.id,q.side,q.level,q.minLevel,clean(q.name),clean(q.objective),clean(q.start),before,[...new Set(rw)].join(','),bn.join(';'),q.choose?1:'',clean(q.kind)].join('|'))}
}

// 3) 9직업 장비 후보 (1~60)
const CL=['warrior','paladin','hunter','rogue','priest','shaman','mage','warlock','druid'];
const U={},PK=[];
for(let ci=0;ci<CL.length;ci++){const c=CL[ci];const t=rscText(await get('/forever/gear/'+c));
  const i0=t.indexOf('"items":[{"id"');const items=grabAt(t,i0+8);const stab=grabVal(t,'sourceTable')||[];const picks=grabVal(t,'picks')||[];
  picks.forEach(p=>PK.push([c,(p.specIds||[]).join(','),p.slot,p.itemId,p.fromLevel,p.toLevel,clean(p.reason)].join('|')));
  for(const it of items){const u=U[it.id]||(U[it.id]={it,cl:0,refs:new Set()});u.cl|=1<<ci;
    for(const r of it.sourceRefs||[]){const x=stab[r];if(x)u.refs.add(x.kind+'~'+clean(x.label)+'~'+String(x.href||'').replace('https://www.wowhead.com/forever/','wh:').replace('/forever/dungeons/','dg:'))}}
}
const SL={},S=[];const sIdx=l=>{if(!(l in SL)){SL[l]=S.length;S.push(l)}return SL[l]};
const SC={Head:'he',Neck:'ne',Shoulder:'sh',Back:'ba',Chest:'ch',Wrist:'wr',Hands:'ha',Waist:'wa',Legs:'le',Feet:'fe',Finger:'fi',Trinket:'tr','Main Hand':'mh','One-Hand':'1h','Two-Hand':'2h','Off Hand':'oh','Held In Off-hand':'ho',Ranged:'ra'};
const IT=Object.values(U).filter(u=>u.it.faction!=='horde'&&!u.it.pvp).sort((a,b)=>a.it.reqLevel-b.it.reqLevel||a.it.id-b.it.id).map(u=>{const it=u.it;const ph=typeof it.phase==='object'?(it.phase?.raid||'x'):it.phase;
  return [it.id,(it.reqLevel??'')+(it.reqEstimated?'?':''),SC[it.slot]||it.slot,(it.itemClass==null?'':it.itemClass+'.'+it.itemSubclass),(it.view?.quality||'')[0]||'',
    Object.entries(it.stats||{}).filter(([k])=>k!=='armor'||it.itemSubclass===6).map(([k,v])=>k+v).join(' '),it.effect?1:'',[...u.refs].map(sIdx).join(';'),u.cl,ph==='preraid'?'':(ph||''),
    (it.allowedClasses||[]).join(','),it.requiresProfession?clean(JSON.stringify(it.requiresProfession).replace(/["{}]/g,'')):'',clean(it.view?.name),it.view?.icon||''].join('|')});

fs.mkdirSync('data/forg',{recursive:true});
fs.writeFileSync('data/forg/dungeons.txt',dgl.map(r=>r.join('|')).join('\n')+'\n');
fs.writeFileSync('data/forg/dungeon-quests.txt',DQ.join('\n')+'\n');
fs.writeFileSync('data/forg/items.txt',IT.join('\n')+'\n');
fs.writeFileSync('data/forg/sources.txt',S.join('\n')+'\n');
fs.writeFileSync('data/forg/picks.txt',PK.join('\n')+'\n');
console.log('dungeons',dgl.length,'dq',DQ.length,'items',IT.length,'sources',S.length,'picks',PK.length);
