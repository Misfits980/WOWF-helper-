// 던전 동선·공략: wowf.io 공략 페이지(진행 순서·준비·지도 핀) + forg.gg 보스 기술(끊기·해제 표시)·택틱
// 결과: data/forg/dungeon-guide.json
import fs from 'node:fs';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function get(u){for(let k=0;k<3;k++){try{const r=await fetch(u,{headers:{'user-agent':'WOWF-helper data sync (github.com/Misfits980/WOWF-helper-)','accept-language':'ko'}});if(r.status===404)return null;if(r.ok){await sleep(600);return await r.text()}}catch(e){}await sleep(2500)}return null}
const dec=s=>String(s||'').replace(/<!-- -->/g,'').replace(/<[^>]+>/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#x27;|&#39;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const norm=s=>String(s||'').replace(/[:\s·]/g,'').replace(/^the/i,'');
export function parseWowf(h){if(!h)return null;const out={sum:'',prep:[],floors:[],steps:[]};
  const main=h.slice(h.indexOf('<main'),h.indexOf('</main>'));
  // 요약: '공략' 탭 다음 첫 문단
  const pS=main.indexOf('준비 · 주의 사항');
  {const before=main.slice(0,pS>0?pS:main.indexOf('던전 지도'));const ps=[...before.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map(m=>dec(m[1])).filter(x=>x.length>25);out.sum=ps.pop()||''}
  if(pS>0){const seg=main.slice(pS,main.indexOf('던전 지도',pS));out.prep=[...seg.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map(m=>dec(m[1])).filter(Boolean)}
  for(const f of main.matchAll(/<figure id="map-floor-(\d+)"[\s\S]*?<\/figure>/g)){const fx=f[0];
    const name=dec((fx.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/)||[])[1]);const img=(fx.match(/<img src="([^"]+)"/)||[])[1]||'';
    const pins=[];for(const p of fx.matchAll(/<(?:span|a)([^>]*?)data-pin="\d+"([^>]*?)style="left:([\d.]+)%;top:([\d.]+)%"([^>]*)>([\s\S]*?)(?=<(?:span|a)[^>]*data-pin=|<\/div><\/figure>|$)/g)){
      const attrs=p[1]+p[2]+p[5];const title=(attrs.match(/title="([^"]*)"/)||[])[1]||'';const head=dec((p[6].match(/data-head="true"[^>]*>([\s\S]*?)<\/span>/)||[])[1]||'');
      pins.push({x:+p[3],y:+p[4],t:head||dec(title),link:/data-detach/.test(attrs)?1:0})}
    out.floors.push({n:+f[1],name,img,pins})}
  const sS=main.indexOf('진행 순서');if(sS>0){const ol=main.slice(sS,main.indexOf('</ol>',sS));
    for(const li of ol.matchAll(/<li id="stop-(\d+)"[\s\S]*?(?=<li id="stop-|$)/g)){const x=li[0];const first=(x.match(/<p class="flex flex-wrap[^"]*">([\s\S]*?)<\/p>/)||[])[1]||'';
      const spans=[...first.matchAll(/<span class="([^"]*)">([^<]*)<\/span>/g)].map(m=>[m[1],dec(m[2])]);
      const lv=+((first.match(/레벨 (\d+)/)||[])[1]||0);const nm=(spans.find(s=>/font-serif/.test(s[0]))||[])[1]||'';
      const en=(spans.find(s=>/text-xs text-muted/.test(s[0]))||[])[1]||'';const smalls=spans.filter(s=>/text-\[11px\]/.test(s[0])).map(s=>s[1]);
      const type=smalls.find(s=>!/건너뛰/.test(s))||'';const skip=smalls.some(s=>/건너뛰/.test(s));
      const note=dec((x.match(/<p class="mt-1 text-sm[^"]*">([\s\S]*?)<\/p>/)||[])[1]||'');
      const q=[...x.matchAll(/<li class="flex items-baseline[^"]*">([\s\S]*?)<\/li>/g)].map(m=>{const id=+((m[1].match(/\/quests\/(\d+)/)||[])[1]||0);const horde=/alt="호드"/.test(m[1]);return [id,dec(m[1]).replace(/^!\s*/,''),horde?1:0]}).filter(r=>!r[2]).map(r=>[r[0],r[1]]);
      out.steps.push({n:+li[1],lv,nm,en,type,skip:skip?1:0,note,q})}}
  return out}
function rsc(h){let t='';for(const m of h.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)){try{t+=JSON.parse(m[1])}catch(e){}}return t}
function grabAt(t,i){const st=i;let d=0,ins=false,esc=false;for(;i<t.length;i++){const c=t[i];if(ins){if(esc)esc=false;else if(c==='\\')esc=true;else if(c==='"')ins=false;continue}if(c==='"'){ins=true;continue}if(c==='['||c==='{')d++;else if(c===']'||c==='}'){d--;if(d===0)return t.slice(st,i+1)}}return null}
const flat=v=>typeof v==='string'?(/^\$/.test(v)?'':v):Array.isArray(v)?(v[0]==='$'&&v[3]?(v[3].chip?v[3].chip.name:flat(v[3].children)):v.map(flat).join('')):v&&typeof v==='object'?flat(v.children||''):'';
export function parseForg(h){if(!h)return null;const t=rsc(h);let B=null;for(const m of t.matchAll(/"bosses":\{"[a-z0-9-]+":\{"slug"/g)){const raw=grabAt(t,m.index+'"bosses":'.length);try{B=JSON.parse(raw);break}catch(e){}}
  if(!B)return null;const out={};
  for(const b of Object.values(B)){if(!b||!b.name)continue;out[b.name]={en:b.nameEn||'',rare:b.rare?1:0,tac:flat(b.tactic).replace(/\s+/g,' ').trim(),sp:(b.spells||[]).map(s=>[s.name,(s.desc||'').slice(0,140),(s.tags||[]).join(',')])}}
  return out}
if(process.argv[1]&&process.argv[1].endsWith('dungeon-guide.mjs')){
  const ours=fs.readFileSync('data/forg/dungeons.txt','utf8').split('\n').filter(Boolean).map(l=>l.split('|'));
  const list=await get('https://wowf.io/ko/dungeons');const wslugs=[...new Set([...(list||'').matchAll(/href="\/ko\/dungeons\/([a-z0-9-]+)"/g)].map(m=>m[1]))];
  // wowf 이름 → 슬러그
  const wname={};for(const s of wslugs){const m=(list||'').match(new RegExp('href="/ko/dungeons/'+s+'"[\\s\\S]{0,600}?>([^<>]{2,30})</'));if(m)wname[norm(dec(m[1]))]=s}
  const out={};
  const FIX={'whelgar-excavation':'excavation-site','city-of-dalaran':'dalaran','sm-graveyard':'scarlet-monastery-graveyard','sm-library':'scarlet-monastery-library','sm-armory':'scarlet-monastery-armory','sm-cathedral':'scarlet-monastery-cathedral','temple-of-atal-hakkar':'sunken-temple','stratholme-dead':'stratholme-service-gate','stratholme-live':'stratholme-main-gate'};
  for(const r of ours){const slug=r[0],ko=r[1];const ws=FIX[slug]||wname[norm(ko)]||(wslugs.includes(slug)?slug:wslugs.find(w=>w.replace(/^the-/,'')===slug.replace(/^the-/,'')));
    const g={};if(ws){const w=parseWowf(await get('https://wowf.io/ko/dungeons/'+ws+'/guide'));if(w)Object.assign(g,w,{ws})}
    const f=parseForg(await get('https://forg.gg/forever/dungeons/'+slug));if(f)g.boss=f;
    if(Object.keys(g).length){out[slug]=g;console.log(slug,ws||'-',(g.steps||[]).length,'단계',Object.keys(g.boss||{}).length,'보스')}}
  fs.writeFileSync('data/forg/dungeon-guide.json',JSON.stringify(out));console.log('끝',Object.keys(out).length)}
