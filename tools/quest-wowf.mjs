// wowf.io 퀘스트 도감으로 보강: 한글 NPC 이름, 할 일(대상·개수), 앞 단계·연계 목록
// 이미 읽은 퀘스트(wf 있음)는 건너뜀. FULL=1 이면 전부 다시
import fs from 'node:fs';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function get(u){for(let k=0;k<3;k++){try{const r=await fetch(u,{headers:{'user-agent':'WOWF-helper data sync (github.com/Misfits980/WOWF-helper-)','accept-language':'ko'}});if(r.status===404)return null;if(r.ok){await sleep(550);return await r.text()}}catch(e){}await sleep(2500)}return null}
const dec=s=>s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#x27;|&#39;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&');
const file='data/forg/quests.jsonl';const byId=new Map();
for(const l of fs.readFileSync(file,'utf8').split('\n')){if(!l)continue;const o=JSON.parse(l);byId.set(o.id,o)}
let n=0;
for(const [id,o] of byId){if(o.wf&&!process.env.FULL)continue;
  const h=await get('https://wowf.io/ko/quests/'+id);if(!h){o.wf={none:1};continue}
  const body=h.replace(/<script[\s\S]*?<\/script>/g,'');
  const t=dec(body.replace(/<[^>]+>/g,'\n')).split('\n').map(x=>x.trim()).filter(Boolean);
  const s0=t.indexOf('퀘스트 목표');if(s0<0){o.wf={none:1};continue}
  const end=t.findIndex((x,k)=>k>s0&&x==='소식 & 토론');const T=t.slice(s0,end>0?end:s0+300);
  const wf={};const at=k=>T.indexOf(k);
  const npc=i=>{if(i<0)return null;let k=i+1;while(k<T.length&&/^[◉●○!?]+$/.test(T[k]))k++;const nm=T[k];let ti='';if(T[k+1]==='<'){ti=T[k+2];k+=3}return {nm,ti}};
  const g=npc(at('받기'));if(g)wf.g=g.nm;const r=npc(at('완료'));if(r)wf.r=r.nm;
  const iS=at('수행');
  if(iS>=0){const line=T[iS+1]||'';const parts=line.split(' · ').map(p=>{const m=p.match(/^(.*?) x (\d+)$/);return m?[m[1],+m[2]]:[p,0]}).filter(p=>p[0]&&p[0]!=='완료');wf.t=parts}
  const iC=at('연계');
  if(iC>=0){const rows=[];const as=[...body.slice(body.lastIndexOf('>연계<')).matchAll(/href="\/ko\/quests\/(\d+)"/g)].map(m=>+m[1]);let ai=0;
    for(let k=iC+1;k<T.length;k++){if(!/^\d+$/.test(T[k]))break;const nm=T[k+1];const lvm=(T[k+2]||'').match(/레벨 (\d+)(?: · (\d+)레벨부터)?/);if(!nm||!lvm)break;rows.push([+T[k],nm,+lvm[1],'','',0,0]);k+=2}
    const ids=[...new Set(as)];rows.forEach((r,i)=>{r[6]=ids[i]||0;if(r[6]===id)r[5]=1});
    if(!rows.some(r=>r[5])){const me=rows.find(r=>!r[6]);if(me){me[6]=id;me[5]=1}}
    if(rows.length>1)wf.ch=rows}
  o.wf=wf;
  if(wf.ch&&!(o.ch&&o.ch.length>1)){o.ch=wf.ch;o.cn=wf.ch.length;o.cc=(wf.ch.find(r=>r[5])||[0])[0]||1}
  n++;if(n%100===0)console.log('wowf',n)}
fs.writeFileSync(file,[...byId.values()].map(o=>JSON.stringify(o)).join('\n')+'\n');console.log('wowf updated',n);
