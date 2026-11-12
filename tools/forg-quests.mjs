// forg.gg 퀘스트 상세(할 일·모을 아이템·처치 대상·받는/반납 NPC·연계 단계)를 data/forg/quests.jsonl 로 저장
// 이미 받은 퀘스트는 건너뛰어서 forg에 부담을 줄인다 (FULL=1 이면 전부 다시)
import fs from 'node:fs';
const BASE='https://forg.gg';const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function get(u){for(let k=0;k<3;k++){try{const r=await fetch(BASE+u,{headers:{'user-agent':'WOWF-helper data sync (github.com/Misfits980/WOWF-helper-)','accept-language':'ko'}});if(r.status===404)return null;if(r.ok){await sleep(450);return await r.text()}}catch(e){}await sleep(2500)}return null}
const dec=s=>s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#x27;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&');
const ids=new Set();
for(const l of fs.readFileSync('data/forg/leveling.txt','utf8').split('\n')){const f=l.split('|');if(f.length>=10&&/^\d+$/.test(f[9]))ids.add(f[9])}
for(const l of fs.readFileSync('data/forg/dungeon-quests.txt','utf8').split('\n')){const f=l.split('|');if(f[0]==='Q'&&f[3]!=='horde')ids.add(f[2])}
const file='data/forg/quests.jsonl';const have=new Map();
if(fs.existsSync(file)&&!process.env.FULL)for(const l of fs.readFileSync(file,'utf8').split('\n')){if(!l)continue;try{const o=JSON.parse(l);have.set(String(o.id),l)}catch(e){}}
const TYPES=new Set(['처치','수집','사용','대화','탐험','획득','호위','상호작용','전달','이동','방어','조사','배달','파괴','시전']);
function locOf(tok){const m=tok.match(/^(.*?) \(([\d.]+), ([\d.]+)\)$/);return m?[m[1],m[2]+','+m[3]]:null}
function parse(id,h){
  const txt=dec(h.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<[^>]+>/g,'\n')).split('\n').map(s=>s.trim()).filter(Boolean);
  const o={id:+id};const at=k=>txt.indexOf(k);
  const iObj=at('할 일과 위치');if(iObj>=0)o.obj=txt[iObj+1];
  const iG=at('받기'),iD=at('하기'),iR=at('반납');
  const npc=(from,to)=>{let n=null,ti=null,loc=null,same=false;for(let k=from+1;k<to&&k<from+12;k++){const t=txt[k];if(/^[!?]+$/.test(t)||t==='·')continue;if(t==='<'){ti=txt[k+1];k+=2;continue}if(t==='받은 곳과 같아요'){same=true;break}const L=locOf(t);if(L){loc=L;break}if(!n)n=t}return {n,ti,loc,same}};
  if(iG>=0){const g=npc(iG,iD>0?iD:iG+10);o.g=[g.n,g.loc?g.loc[0]:'',g.loc?g.loc[1]:'',g.ti||'']}
  if(iR>=0){const end=txt.findIndex((t,k)=>k>iR&&/지도 · 위치는|^전체 지도|^길 찾기/.test(t));const r=npc(iR,end>0?end:iR+10);o.r=[r.n,r.same?'':r.loc?r.loc[0]:'',r.same?'':r.loc?r.loc[1]:'',r.same?1:0]}
  if(iD>=0&&iR>iD){const T=[];let cur=null;let mode='';
    for(let k=iD+1;k<iR;k++){const t=txt[k];
      if(TYPES.has(t)){let j=k+1;while(j<iR&&(/^\d+$/.test(txt[j])||/^지도 \d+번 핀$/.test(txt[j])||txt[j]==='·'))j++;const nm=txt[j];
        if(nm&&j<iR&&!TYPES.has(nm)&&!/^(반납|받기|하기)$/.test(nm)){cur={t,n:nm,drop:[],where:''};T.push(cur);k=j;mode='';continue}}
      if(!cur)continue;
      if(t==='떨구는 몹'||t==='나오는 곳'||t==='주는 곳'){mode='drop';continue}
      if(/^가장 많은 곳/.test(t)){cur.where=(t.match(/\([\d.]+, [\d.]+\)/g)||[]).slice(0,2).join(' ');mode='';continue}
      if(/^그 밖 /.test(t)){if(/종$/.test(t))cur.more=t;mode='x';continue}
      if(/^지도 \d+번 핀$|^\d+$|^·$/.test(t))continue;
      if(mode==='drop'&&cur.drop.length<4)cur.drop.push(t)}
    o.t=T.map(x=>[x.t,x.n,x.where,x.drop.join(', ')+(x.more?' '+x.more:'')])}
  const iC=at('연계 퀘스트');
  if(iC>=0){const m=(txt[iC+1]||'').match(/(\d+)단계 중 (\d+)단계/);if(m){o.cn=+m[1];o.cc=+m[2];const rows=[];
    for(let k=iC+2;k<txt.length;k++){if(/^(광고|이 퀘스트 이야기|함께 볼 페이지)$/.test(txt[k]))break;
      if(/^\d+$/.test(txt[k])&&/^\d+단계$/.test(txt[k+1]||'')){const row={s:+txt[k],nm:txt[k+2]};let j=k+3;if(txt[j]==='지금 보는 퀘스트'){row.cur=1;j++}
        if(txt[j]==='Lv'){row.lv=+txt[j+1];j+=2}if(TYPES.has(txt[j])){row.t=txt[j]+' '+(txt[j+1]||'');j+=2;if(/^외 \d+$/.test(txt[j]||'')){row.t+=' '+txt[j];j++}}
        if(txt[j]&&!/^\d+$/.test(txt[j]))row.npc=txt[j];rows.push([row.s,row.nm,row.lv||'',row.t||'',row.npc||'',row.cur?1:0]);k=j-1}}
    const as=[...h.slice(h.indexOf('연계 퀘스트')).matchAll(/href="\/forever\/quest\/(\d+)"/g)].map(x=>+x[1]);let ai=0;rows.forEach(r=>{if(!r[5])r.push(as[ai++]||0);else r.push(+id)});o.ch=rows}}
  return o}
const out=[];let n=0,skip=0;
const bad=l=>{try{const o=JSON.parse(l);return (o.t||[]).some(t=>/^\d+$|^(반납|받기|하기)$/.test(t[1]))}catch(e){return true}};
for(const id of ids){if(have.has(id)&&!bad(have.get(id))){out.push(have.get(id));skip++;continue}
  const h=await get('/forever/quest/'+id);if(!h)continue;try{out.push(JSON.stringify(parse(id,h)));n++}catch(e){console.log('parse fail',id,e.message)}
  if(n%100===0&&n)console.log('fetched',n)}
fs.writeFileSync(file,out.join('\n')+'\n');console.log('quests',out.length,'new',n,'cached',skip);
