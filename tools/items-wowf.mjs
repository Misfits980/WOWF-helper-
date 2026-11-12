// 능력치 자료가 없는 포에버 장비를 wowf.io 한글 아이템 도감에서 읽음 (없으면 forever-tool)
// 대상: 효과·영어 이름 장비(한글 이름 받기), 퀘스트 보상 장비, 포에버 신규 장비(번호 200000 이상) 중 아직 장비 목록에 없는 것
// 결과: data/qdb/items-wowf.jsonl  (이미 읽은 번호는 건너뜀, 40분 넘으면 다음 실행 때 이어서)
import fs from 'node:fs';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function get(u){for(let k=0;k<3;k++){try{const r=await fetch(u,{headers:{'user-agent':'WOWF-helper data sync (github.com/Misfits980/WOWF-helper-)','accept-language':'ko'}});if(r.status===404)return null;if(r.ok){await sleep(500);return await r.text()}}catch(e){}await sleep(2500)}return null}
const dec=s=>s.replace(/<!-- -->/g,'').replace(/<[^>]+>/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#x27;|&#39;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&').trim();
const have=new Set();
for(const f of ['data/forg/items.txt','data/qdb/items-extra.txt'])if(fs.existsSync(f))for(const l of fs.readFileSync(f,'utf8').split('\n'))if(l)have.add(+l.split('|')[0]);
const out='data/qdb/items-wowf.jsonl';const done=new Map();
if(fs.existsSync(out))for(const l of fs.readFileSync(out,'utf8').split('\n'))if(l){const o=JSON.parse(l);done.set(o.id,o)}
const rw=new Set();for(const l of fs.readFileSync('data/forg/rewards.jsonl','utf8').split('\n')){if(!l)continue;const o=JSON.parse(l);for(const x of [...(o.ch||[]),...(o.fx||[])])rw.add(x[0])}
const eq=fs.readFileSync('data/qdb/item-equip.txt','utf8').split('\n').filter(Boolean).map(l=>l.split('|'));
const first=[],later=[],effs=[];
for(const f of ['data/forg/items.txt','data/qdb/items-extra.txt'])if(fs.existsSync(f))for(const l of fs.readFileSync(f,'utf8').split('\n')){const p=l.split('|');if(!done.has(+p[0])&&(p[6]==='1'||/[A-Za-z]{3}/.test(p[12]||'')))effs.push(+p[0])}
for(const p of eq){const id=+p[0];if(have.has(id)||done.has(id))continue;if(rw.has(id)||p[5])first.push(id);else if(id>=200000)later.push(id)}
const todo=[...effs,...first,...later];console.log('할 일',todo.length,'(효과 장비',effs.length,'보상 장비',first.length,')');
const QC={'#9d9d9d':'p','#ffffff':'c','#1eff00':'u','#0070dd':'r','#a335ee':'e','#ff8000':'l'};
function parseWowf(h,id){const i=h.indexOf('id="item-title"');if(i<0)return null;
  const head=h.slice(i,i+800);const sub=dec((head.match(/<p class="mt-0\.5 text-sm text-muted">([\s\S]*?)<\/p>/)||[])[1]||'');
  const nm=dec((head.match(/>([^<]+)(?:<span|<\/h1>)/)||[])[1]||'');
  const tipS=h.indexOf('>wowf.io</span>',i);const tipE=h.indexOf('</div></div></div></div>',tipS);const tip=h.slice(tipS,tipE);
  const P=[...tip.matchAll(/<p([^>]*)>([\s\S]*?)<\/p>/g)].map(m=>m[1]+'>'+m[2]);
  const lines=P.map(x=>dec(x.slice(x.indexOf('>')+1)));const slotP=P.find(x=>x.includes('justify-between'));const st=slotP?[...slotP.matchAll(/<span>([^<]*)<\/span>/g)].map(m=>dec(m[1])):[];
  const bc=(h.slice(i,tipS).match(/border-color:(#[0-9a-f]{6})/i)||[])[1];const ic=(h.slice(i,tipE).match(/icons\/items\/([a-z0-9_]+)\.jpg/)||[])[1]||'';
  const srcS=h.indexOf('얻는 곳',tipE);const srcE=h.indexOf('</ul>',srcS);const src=srcS>0?[...h.slice(srcS,srcE).matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m=>{const href=(m[1].match(/href="([^"]+)"/)||[])[1]||'';return [dec(m[1]),href]}):[];
  return {id,nm,sub,q:QC[(bc||'').toLowerCase()]||'',slot:st[0]||'',type:st[1]||'',lines,ic,src}}
function parseFT(h,id){const t=(h.match(/<title[^>]*>([^<]*)<\/title>/)||[])[1]||'';const nm=dec(t).split(' (')[0].split(' - ')[0];
  const T=dec(h.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<\/(p|div|span|li|dd|dt|h\d)>/g,'\n')).split('\n').map(x=>x.trim()).filter(Boolean);
  const i=T.indexOf('획득 시 귀속')>=0?T.indexOf('획득 시 귀속'):T.indexOf(nm);const lines=T.slice(i,i+25);
  const k=T.indexOf('부위');const kt=T.indexOf('종류');const ki=T.indexOf('아이템 레벨');const kg=T.indexOf('등급');
  const typ=kt>=0?(T[kt+1]||'').split(' · ').pop():'';
  return {id,nm,sub:'',q:{'일반':'c','고급':'u','희귀':'r','영웅':'e','전설':'l','하급':'p'}[T[kg+1]]||'',slot:k>=0?T[k+1]:'',type:typ,lines,ilvl:ki>=0?+T[ki+1]:0,ic:(h.match(/icons\/(?:large|medium|items)\/([a-z0-9_]+)\.(?:jpg|png)/)||[])[1]||'',src:[],ft:1}}
let n=0;const t0=Date.now();
const flush=()=>fs.writeFileSync(out,[...done.values()].map(o=>JSON.stringify(o)).join('\n')+'\n');
for(const id of todo){if(Date.now()-t0>40*60e3){console.log('시간 다 됨, 다음에 이어서');break}
  let rec=null;const h=await get('https://wowf.io/ko/items/'+id);if(h)rec=parseWowf(h,id);
  if(!rec||!rec.nm){const h2=await get('https://forever-tool.com/items/'+id+'/');if(h2&&h2.includes('아이템 번호'))rec=parseFT(h2,id)}
  done.set(id,rec||{id,none:1});n++;if(n%100===0){console.log('읽음',n);flush()}}
flush();console.log('끝',n);
