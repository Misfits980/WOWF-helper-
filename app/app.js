'use strict';
/* ===================== 기본 자료 ===================== */
const CL=['warrior','paladin','hunter','rogue','priest','shaman','mage','warlock','druid'];
const CINFO={warrior:['전사','#C79C6E'],paladin:['성기사','#F58CBA'],hunter:['사냥꾼','#ABD473'],rogue:['도적','#FFF569'],priest:['사제','#FFFFFF'],shaman:['주술사','#2a8cff'],mage:['마법사','#69CCF0'],warlock:['흑마법사','#9482C9'],druid:['드루이드','#FF7D0A']};
const RACES=[['human','인간','achievement_character_human_male'],['dwarf','드워프','achievement_character_dwarf_male'],['gnome','노움','achievement_character_gnome_male'],['nightelf','나이트엘프','achievement_character_nightelf_male']];
const RACE_START={human:'human',dwarf:'dwarf-gnome',gnome:'dwarf-gnome',nightelf:'nightelf'};
const DW=new Set(['warrior','rogue','hunter','shaman']);
const STAT_KO={str:'힘',agi:'민첩',sta:'체력',int:'지능',spi:'정신력',sp:'주문력',heal:'치유량',mp5:'5초당 마나',ap:'전투력',dps:'무기 초당 공격력',def:'방어 숙련',block:'방패 막기',armor:'방어도',fire:'화염 주문력',frost:'냉기 주문력',nature:'자연 주문력',shadow:'암흑 주문력',arcane:'비전 주문력',holy:'신성 주문력'};
const SLOTS=[['head','머리',['he']],['neck','목',['ne']],['shoulder','어깨',['sh']],['back','등',['ba']],['chest','가슴',['ch']],['wrist','손목',['wr']],['hands','손',['ha']],['waist','허리',['wa']],['legs','다리',['le']],['feet','발',['fe']],['ring1','반지 1',['fi']],['ring2','반지 2',['fi']],['trink1','장신구 1',['tr']],['trink2','장신구 2',['tr']],['main','주무기',['2h','mh','1h']],['off','보조',['oh','ho','1h']],['ranged','원거리',['ra']]];
const SLOT_KO=Object.fromEntries(SLOTS.map(s=>[s[0],s[1]]));
const SL_KO={he:'머리',ne:'목',sh:'어깨',ba:'등',ch:'가슴',wr:'손목',ha:'손',wa:'허리',le:'다리',fe:'발',fi:'반지',tr:'장신구','2h':'양손 무기',mh:'주장비 무기','1h':'한손 무기',oh:'보조 장비',ho:'보조 손',ra:'원거리'};
const CS_KO={'4.1':'천','4.2':'가죽','4.3':'사슬','4.4':'판금','4.6':'방패','2.0':'한손 도끼','2.1':'양손 도끼','2.2':'활','2.3':'총','2.4':'한손 둔기','2.5':'양손 둔기','2.6':'장창','2.7':'한손 검','2.8':'양손 검','2.10':'지팡이','2.13':'장착 무기','2.15':'단검','2.18':'석궁','2.19':'마법봉','2.20':'낚싯대'};
/* 전문화별 능력치 가중치 (클래식 기준 대략값, 1 = 가장 중요한 능력치) */
const HEAL={heal:1,sp:1,int:.8,spi:.5,mp5:1.2,sta:.1};
const W={
 warrior:{arms:{str:1,agi:.8,ap:.5,sta:.25,dps:2.4,rdps:.2},fury:{str:1,agi:.8,ap:.5,sta:.25,dps:2.2,rdps:.2},protection:{sta:1,def:.9,armor:.03,block:.35,str:.5,agi:.5,ap:.2,dps:.8,rdps:.1}},
 paladin:{holy:{heal:1,sp:1,int:1,mp5:1.3,spi:.25,sta:.1},protection:{sta:1,def:.9,armor:.03,block:.3,str:.4,agi:.3,sp:.45,holy:.45,int:.35,dps:.6},retribution:{str:1,agi:.6,ap:.5,int:.3,sp:.3,holy:.3,sta:.25,dps:2.4}},
 hunter:{'beast-mastery':{agi:1,ap:.5,int:.35,sta:.25,str:.1,rdps:2.6,dps:.3},marksmanship:{agi:1,ap:.5,int:.35,sta:.2,rdps:2.8,dps:.3},survival:{agi:1,ap:.5,int:.3,sta:.25,str:.15,rdps:2.5,dps:.4}},
 rogue:{assassination:{agi:1,str:.55,ap:.5,sta:.2,dps:2.2,rdps:.2},combat:{agi:1,str:.55,ap:.5,sta:.2,dps:2.4,rdps:.2},subtlety:{agi:1,str:.55,ap:.5,sta:.2,dps:2.1,rdps:.2}},
 priest:{discipline:Object.assign({},HEAL,{spi:.6,rdps:.6}),holy:Object.assign({},HEAL,{spi:.75,rdps:.6}),'shadow-magic':{sp:1,shadow:.95,int:.4,spi:.35,mp5:.3,sta:.2,rdps:.7}},
 shaman:{'elemental-combat':{sp:1,nature:.9,fire:.4,frost:.3,int:.45,mp5:.4,spi:.1,sta:.2},enhancement:{str:1,agi:.75,ap:.5,int:.2,sta:.25,dps:2.3},restoration:Object.assign({},HEAL,{int:.85,mp5:1.3,spi:.25})},
 mage:{arcane:{sp:1,arcane:.95,int:.6,spi:.4,mp5:.3,sta:.2,rdps:.6},fire:{sp:1,fire:.95,int:.45,spi:.25,sta:.2,rdps:.6},frost:{sp:1,frost:.95,int:.45,spi:.25,sta:.25,rdps:.6}},
 warlock:{affliction:{sp:1,shadow:.95,sta:.4,int:.35,spi:.15,rdps:.6},demonology:{sp:1,shadow:.8,fire:.5,sta:.5,int:.4,rdps:.6},destruction:{sp:1,shadow:.6,fire:.6,sta:.35,int:.35,rdps:.6}},
 druid:{balance:{sp:1,arcane:.6,nature:.6,int:.5,spi:.3,mp5:.4,sta:.2},'feral-cat':{agi:1,str:.9,ap:.5,sta:.25},'feral-bear':{sta:1,agi:.8,def:.8,str:.4,ap:.2},restoration:Object.assign({},HEAL,{spi:.6})}
};
const ROLE={};for(const c in W)for(const s in W[c]){const w=W[c][s];ROLE[c+'/'+s]=w.heal?'치유':w.def?'탱커':(w.sp?'원거리 딜':'근접 딜')}
if(W.hunter)for(const s in W.hunter)ROLE['hunter/'+s]='원거리 딜';

/* ----- 아이템 ----- */
const SRC=D_SRC.split('\n').filter(Boolean).map(l=>{const [k,label,href]=l.split('~');const o={k:+k,label,href:href||''};
  if(o.k===0){o.dg=(href||'').replace('dg:','').split('#')[0];const p=label.split(' · ');o.dn=p[0];o.boss=p.slice(1).join(' · ')}
  if(o.k===1)o.qn=label.replace(/^퀘스트 · /,'');
  return o});
const ITEMS=D_ITEMS.split('\n').filter(Boolean).map(l=>{const f=l.split('|');const st={};for(const m of (f[5]||'').matchAll(/([a-z]+)([\d.]+)/g))st[m[1]]=+m[2];
  return {id:+f[0],lv:parseInt(f[1])||1,est:f[1].endsWith('?'),sl:f[2],cs:f[3],q:f[4]||'c',st,eff:f[6]==='1',src:f[7]?f[7].split(';').map(Number):[],mask:+f[8],ph:f[9]||'',allow:f[10]?f[10].split(','):null,prof:f[11]||'',nm:f[12],ic:f[13]||''}});
const IT=new Map(ITEMS.map(i=>[i.id,i]));
const ICO=n=>n?'https://wow.zamimg.com/images/wow/icons/medium/'+String(n).toLowerCase()+'.jpg':'';

/* ----- 던전 ----- */
const DGS=D_DGL.split('\n').filter(Boolean).map(l=>{const [slug,ko,en,loc,fit,rg,cnt]=l.split('|');const r=(rg||'').split(/[–-]/).map(Number);return {slug,ko,en,loc,fit:+fit||r[0]||0,lo:r[0]||+fit,hi:r[1]||r[0]||+fit,cnt,bosses:[],q:[]}}).filter(d=>!/오그리마|언더시티|썬더 블러프/.test(d.loc));
const DG=Object.fromEntries(DGS.map(d=>[d.slug,d]));
D_DQ.split('\n').filter(Boolean).forEach(l=>{const f=l.split('|');const d=DG[f[1]];if(!d)return;
  if(f[0]==='B'){d.bosses=(f[2]||'').split(';').filter(Boolean).map(x=>{const i=x.indexOf('=');return {slug:x.slice(0,i),nm:x.slice(i+1)}});return}
  if(f[3]==='horde')return;
  d.q.push({id:+f[2],side:f[3],lv:+f[4],min:+f[5],nm:f[6],obj:f[7],start:f[8],pre:+f[9]||0,rw:(f[10]||'').split(',').filter(Boolean).map(Number),boss:(f[11]||'').split(';').filter(Boolean),choose:f[12]==='1',kind:f[13]})});
DGS.forEach(d=>d.q.sort((a,b)=>a.lv-b.lv));

/* ----- 레벨링 경로 ----- */
const ROUTE={};{let cur=null,sec=null;for(const l of D_LVL.split('\n')){if(!l)continue;
  if(l[0]==='@'){cur=ROUTE[l.slice(1)]=[];continue}
  if(l[0]==='#'){const [a,b,z]=l.slice(1).split('|');sec={a:+a,b:+b,z,q:[]};cur.push(sec);continue}
  const f=l.split('|');if(!sec)continue;sec.q.push({lv:+f[0],min:+f[1]||Math.max(1,+f[0]-5),nm:f[2],gz:f[3],gv:f[4],xy:f[5],ch:+f[6]||0,pre:+f[7]||0,obj:f[8]||'',sz:sec.z.split(' · ')[0]})}}

/* ===================== 저장 ===================== */
const KEY='wowf2';
let DB=(()=>{try{const o=JSON.parse(localStorage.getItem(KEY));if(o&&o.list)return o}catch(e){}return {cur:null,list:[]}})();
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){}};
const me=()=>DB.list.find(c=>c.id===DB.cur)||null;
const newId=()=>'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
function specOf(c){const C=D_CLS[c.cls];return (C&&C.specs.find(s=>s.id===c.spec))||(C&&C.specs[0])}
function wOf(c){return (W[c.cls]||{})[c.spec]||Object.values(W[c.cls]||{})[0]||{}}

/* ===================== 화면 상태 ===================== */
const ui={tab:'home',sheet:null,qz:null,qmode:'zone',dg:null,csec:'tal',srch:'',onb:null,isrch:'',ifil:'ok',pf:null};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=s=>document.querySelector(s);
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),1600)}

/* ===================== 아이템 계산 ===================== */
const ci=c=>CL.indexOf(c.cls);
function usable(it,c){if(!(it.mask&(1<<ci(c))))return false;if(it.allow&&!it.allow.includes(c.cls))return false;return true}
function fits(it,slot,c){const S=SLOTS.find(s=>s[0]===slot);if(!S||!S[2].includes(it.sl))return false;
  if(slot==='off'){if(it.sl==='1h'||(it.sl==='oh'&&it.cs!=='4.6'))return DW.has(c.cls);return true}
  return true}
function slotsFor(it,c){return SLOTS.filter(s=>fits(it,s[0],c)).map(s=>s[0])}
function sc(it,slot,w){if(!it)return 0;let s=0;for(const k in it.st){const v=it.st[k];if(k==='dps'){s+=v*(slot==='ranged'?(w.rdps||0):(w.dps||0)*(slot==='off'?.5:1))}else s+=v*(w[k]||0)}return s}
function eqIt(c,slot){return c.eq&&c.eq[slot]?IT.get(c.eq[slot]):null}
/* 이 아이템을 낄 때 가장 이득인 칸과 이득 */
function bestSlot(it,c){const w=wOf(c);let best=null;
  for(const s of slotsFor(it,c)){let base;
    if(s==='main'&&it.sl==='2h')base=sc(eqIt(c,'main'),'main',w)+sc(eqIt(c,'off'),'off',w);
    else if(s==='off'&&eqIt(c,'main')&&eqIt(c,'main').sl==='2h')continue;
    else base=sc(eqIt(c,s),s,w);
    const g=sc(it,s,w)-base;const empty=!eqIt(c,s);
    if(!best||g>best.g)best={s,g,base,empty}}
  return best}
function srcOk(it,mode){if(mode==='all')return true;if(!it.src.length)return false;return it.src.some(i=>{const s=SRC[i];return s&&s.k!==2&&s.k!==4})}
function cands(c,slot,maxLv,mode){const w=wOf(c);return ITEMS.filter(it=>it.lv<=maxLv&&usable(it,c)&&fits(it,slot,c)&&srcOk(it,mode)&&it.ph!=='x').map(it=>({it,s:sc(it,slot,w)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s)}
function upgrades(c,L,mode,minLv){const out=[];const w=wOf(c);
  for(const [slot] of SLOTS){if(slot==='ring2'||slot==='trink2')continue;
    const pair=slot==='ring1'?['ring1','ring2']:slot==='trink1'?['trink1','trink2']:[slot];
    const curS=Math.min(...pair.map(p=>sc(eqIt(c,p),p,w)));const tgt=pair.reduce((a,p)=>sc(eqIt(c,p),p,w)<=sc(eqIt(c,a),a,w)?p:a,pair[0]);
    let base=curS;if(slot==='main')base=sc(eqIt(c,'main'),'main',w)+(0);
    if(slot==='off'&&eqIt(c,'main')&&eqIt(c,'main').sl==='2h')continue;
    const have=new Set(pair.map(p=>c.eq[p]).filter(Boolean));
    const list=cands(c,slot,L,mode).filter(x=>!have.has(x.it.id)&&(minLv==null||x.it.lv>=minLv));
    for(const x of list.slice(0,1)){let g;
      if(slot==='main'&&x.it.sl==='2h')g=x.s-(sc(eqIt(c,'main'),'main',w)+sc(eqIt(c,'off'),'off',w));else g=x.s-base;
      if(g>.01)out.push({slot:tgt,it:x.it,g,base:slot==='main'&&x.it.sl==='2h'?sc(eqIt(c,'main'),'main',w)+sc(eqIt(c,'off'),'off',w):base,empty:!eqIt(c,tgt)})}}
  return out.sort((a,b)=>(b.empty-a.empty)||(b.g/Math.max(b.base,4))-(a.g/Math.max(a.base,4)))}
function gainTag(g,base,empty){if(empty)return '<span class="gain new">빈 칸 채우기</span>';if(!(g>.01))return '<span class="gain no">변화 없음</span>';const r=g/Math.max(base,4);return r>=.5?'<span class="gain big">크게 좋아짐</span>':r>=.2?'<span class="gain mid">좋아짐</span>':'<span class="gain sm">조금 좋아짐</span>'}
function diffHtml(a,b,c){const w=wOf(c);const ks=new Set([...Object.keys(a?a.st:{}),...Object.keys(b?b.st:{})]);const arr=[];
  for(const k of ks){if(k==='armor'&&!(w.armor))continue;const d=((a&&a.st[k])||0)-((b&&b.st[k])||0);if(Math.abs(d)<.05)continue;if(k==='dps'&&!(w.dps||w.rdps))continue;arr.push([k,d,Math.abs(d*(w[k]||(k==='dps'?(w.dps||w.rdps):0)))+(w[k]?1:0)])}
  arr.sort((x,y)=>y[2]-x[2]);if(!arr.length)return '';
  return '<span class="dif">'+arr.slice(0,4).map(([k,d])=>'<span class="'+(d>0?'p':'n')+'">'+STAT_KO[k]+' '+(d>0?'+':'−')+(k==='dps'?Math.abs(d).toFixed(1):Math.round(Math.abs(d)))+'</span>').join(' · ')+'</span>'}
function srcTxt(it,n){if(!it.src.length)return '출처 정보 없음';return it.src.slice(0,n||2).map(i=>{const s=SRC[i];if(!s)return '';
  if(s.k===0)return (DG[s.dg]?DG[s.dg].ko:s.dn)+' · '+s.boss;if(s.k===1)return '퀘스트 「'+s.qn+'」';if(s.k===2)return '월드 드랍 (경매장)';if(s.k===3)return s.label.replace('드랍 · ','')+' 처치';if(s.k===4)return s.label.replace(/ · 경매장 거래$/,'')+' (경매장)';if(s.k===5)return s.label.replace('상인 · ','상인 ');return s.label}).filter(Boolean).join(' / ')}
function itIcon(it,cls){return it&&it.ic?'<span class="ic '+(cls||'')+' q-'+it.q+'" style="background-image:url('+ICO(it.ic)+')"></span>':'<span class="ic empty '+(cls||'')+'">–</span>'}
function itName(it){return '<span class="q'+it.q+'">'+esc(it.nm)+'</span>'}
function itMeta(it){return esc((SL_KO[it.sl]||it.sl)+(CS_KO[it.cs]&&!['4.0',''].includes(it.cs)?' · '+CS_KO[it.cs]:'')+' · Lv '+it.lv+(it.est?'?':''))}

/* ===================== 공통 조각 ===================== */
function lvCls(lv,L){const d=lv-L;return d>=5?'lv-r':d>=3?'lv-o':d>=-2?'lv-y':d>=-6?'lv-g':'lv-x'}
function clsIcon(cls,big){return '<span class="ic '+(big?'lg':'')+'" style="background-image:url('+ICO('classicon_'+cls)+')"></span>'}
function topBar(c){const sp=specOf(c);const C=CINFO[c.cls];
  return '<header class="top"><button class="who" data-a="chars">'+clsIcon(c.cls)+'<span class="t"><b style="color:'+C[1]+'">'+esc(c.name||C[0])+'</b><small>'+esc((sp?sp.name+' ':'')+C[0])+' · '+esc((RACES.find(r=>r[0]===c.race)||['',''])[1])+' ▾</small></span></button>'
   +'<div><div class="lvlab">내 레벨</div><div class="lvbox"><button data-a="lv-">−</button><input type="number" inputmode="numeric" min="1" max="60" value="'+c.lv+'" data-c="lv" aria-label="내 레벨"><button data-a="lv+">+</button></div></div></header>'}
const TABS=[['home','🏠','홈'],['gear','🛡️','장비'],['quest','📜','퀘스트'],['dungeon','🏰','던전'],['class','✨','직업']];
function tabs(){return '<nav class="tabs"><div class="in">'+TABS.map(t=>'<button class="'+(ui.tab===t[0]?'on':'')+'" data-a="tab" data-k="'+t[0]+'"><span class="e">'+t[1]+'</span>'+t[2]+'</button>').join('')+'</div></nav>'}

/* ===================== 시작 화면 (캐릭터 만들기) ===================== */
function onboard(){const d=ui.onb;const C=d.cls?D_CLS[d.cls]:null;const first=!DB.list.length;
  let h='<div class="hero"><div class="logo">⚔️</div><h1>와포 도우미</h1><p>와우 포에버 얼라이언스 레벨업·장비·퀘스트·던전 도우미</p></div>';
  if(!first)h='<header class="top"><button class="x" data-a="onb-x" aria-label="닫기">✕</button><b style="flex:1">새 캐릭터 만들기</b></header>';
  h+='<div class="step"><div class="q"><span>1</span>캐릭터 이름 <small class="mute">(안 써도 돼요)</small></div><input class="inp" maxlength="12" placeholder="예: 용현사제" value="'+esc(d.name)+'" data-c="onb-name"></div>';
  h+='<div class="step"><div class="q"><span>2</span>종족</div><div class="grid2">'+RACES.map(r=>'<button class="pick'+(d.race===r[0]?' on':'')+'" data-a="onb-race" data-k="'+r[0]+'"><span class="ic sm" style="background-image:url('+ICO(r[2])+')"></span>'+r[1]+'</button>').join('')+'</div><p class="note">종족에 따라 1~11레벨 시작 지역(던 모로 · 엘윈 숲 · 텔드랏실) 퀘스트가 달라져요.</p></div>';
  h+='<div class="step"><div class="q"><span>3</span>직업</div><div class="grid3">'+CL.map(k=>'<button class="pick'+(d.cls===k?' on':'')+'" data-a="onb-cls" data-k="'+k+'">'+clsIcon(k)+'<span style="color:'+CINFO[k][1]+'">'+CINFO[k][0]+'</span></button>').join('')+'</div></div>';
  if(C)h+='<div class="step"><div class="q"><span>4</span>전문화 (특성)</div><div class="grid2">'+C.specs.map(s=>'<button class="pick'+(d.spec===s.id?' on':'')+'" data-a="onb-spec" data-k="'+s.id+'"><span class="ic sm" style="background-image:url('+ICO(s.icon)+')"></span>'+esc(s.name)+'<small>'+(ROLE[d.cls+'/'+s.id]||'')+'</small></button>').join('')+'</div><p class="note">장비 추천과 특성 순서가 이걸 기준으로 바뀌어요. 나중에 바꿀 수 있어요.</p></div>';
  h+='<div class="step"><div class="q"><span>'+(C?5:4)+'</span>지금 레벨</div><div class="lvpick"><button data-a="onb-lv-">−</button><input type="number" inputmode="numeric" min="1" max="60" value="'+d.lv+'" data-c="onb-lv"><button data-a="onb-lv+">+</button></div></div>';
  const ok=d.race&&d.cls&&d.spec;
  h+='<div class="step"><button class="btn full" data-a="onb-go"'+(ok?'':' disabled style="opacity:.5"')+'>'+(ok?'시작하기':'종족·직업·전문화를 골라 주세요')+'</button><p class="note" style="text-align:center">입력한 내용은 이 기기 브라우저에만 저장돼요. 다른 사람과 섞이지 않아요.</p></div>';
  return h}

/* ===================== 홈 ===================== */
function routeOf(c){return ROUTE[RACE_START[c.race]||'dwarf-gnome']||[]}
function zonesNow(c){const L=c.lv;const fq=c.fq||{};const Z={};
  for(const S of routeOf(c)){if(S.a>L+2||S.b<L-3)continue;for(const q of S.q){if(q.lv<L-4||q.lv>L+3||q.min>L+1)continue;const z=q.gz||q.sz;const k=z+'|'+q.nm;(Z[z]=Z[z]||{z,q:[],seen:new Set()});if(Z[z].seen.has(q.nm))continue;Z[z].seen.add(q.nm);Z[z].q.push(q)}}
  return Object.values(Z).map(o=>({z:o.z,q:o.q,left:o.q.filter(q=>!fq[o.z+'|'+q.nm]).length})).filter(o=>o.q.length).sort((a,b)=>b.left-a.left)}
function dgNow(L){return DGS.filter(d=>L>=d.lo-1&&L<=d.hi).sort((a,b)=>a.fit-b.fit)}
function home(c){const L=c.lv;const C=D_CLS[c.cls];const sp=specOf(c);let h='<div class="wrap">';
  h+='<h2>레벨 '+L+' — 지금 할 것</h2>';
  /* 퀘스트 지역 */
  const Z=zonesNow(c).slice(0,3);const sec=routeOf(c).find(S=>L>=S.a&&L<=S.b);
  h+='<div class="card"><div class="hd"><h3>📜 퀘스트 할 곳</h3><button class="more" data-a="tab" data-k="quest">전체 보기 ›</button></div>'+(sec?'<p class="note">레벨 '+sec.a+'–'+sec.b+' 추천 지역: '+esc(sec.z)+'</p>':'')
   +(Z.length?Z.map(z=>'<button class="row" data-a="goz" data-k="'+esc(z.z)+'"><span class="m"><span class="nm">'+esc(z.z)+'</span><span class="sub">할 수 있는 퀘스트 '+z.left+'개 남음</span></span><span class="r">›</span></button>').join(''):'<p class="note">이 레벨 퀘스트 자료가 없어요.</p>')+'</div>';
  /* 던전 */
  const D=dgNow(L).slice(0,3);
  h+='<div class="card"><div class="hd"><h3>🏰 갈 만한 던전</h3><button class="more" data-a="tab" data-k="dungeon">전체 ›</button></div>'+(D.length?D.map(d=>{const myq=d.q.filter(q=>q.min<=L).length;const ups=dgUps(c,d).length;
     return '<button class="row" data-a="dgo" data-k="'+d.slug+'"><span class="m"><span class="nm">'+esc(d.ko)+'</span><span class="sub">권장 '+d.lo+'–'+d.hi+' · '+esc(d.loc)+'</span><span class="sub">'+(myq?'받을 퀘스트 '+myq+'개':'')+(myq&&ups?' · ':'')+(ups?'내 장비 '+ups+'개':'')+'</span></span><span class="r">›</span></button>'}).join(''):'<p class="note">레벨 '+(L<13?'13쯤부터 첫 던전(영주의 전당)을 갈 수 있어요.':'에 맞는 던전이 없어요.')+'</p>')+'</div>';
  /* 장비 */
  const U=upgrades(c,L,'ok').slice(0,4);
  h+='<div class="card"><div class="hd"><h3>🛡️ 바꾸면 좋은 장비</h3><button class="more" data-a="tab" data-k="gear">장비 ›</button></div>'+(U.length?U.map(x=>upRow(c,x)).join(''):'<p class="note">지금 레벨에서 더 좋은 장비를 못 찾았어요. 장비 탭에서 착용 중인 장비를 넣으면 더 정확해져요.</p>')+'</div>';
  /* 기술 */
  const learn=(C?C.learns:[]).filter(l=>l[0]>=L-1&&l[0]<=L+2&&(!l[4]||l[4]==='alliance'));
  if(learn.length)h+='<div class="card"><h3>✨ 배울 기술 (직업 상급자)</h3>'+groupBy(learn,l=>l[0]).map(([lv,arr])=>'<div class="tl'+(lv<=L?'':' ')+'"><span class="lvb '+lvCls(lv,L)+'">'+lv+'</span><span class="m">'+arr.map(l=>abChip(l[1],l[5],l[3]?'':'랭크 '+l[2],lv>L)).join(' ')+'</span></div>').join('')+'<p class="note">'+(L%2?'홀수 레벨이라 새 기술은 다음 레벨에 나와요.':'짝수 레벨마다 상급자에게 가서 배우세요.')+'</p></div>';
  /* 특성 */
  if(sp&&L>=10){const st=sp.steps.filter(s=>s[0]===L||s[0]===L+1);if(st.length)h+='<div class="card"><div class="hd"><h3>🌳 특성 ('+esc(sp.name)+')</h3><button class="more" data-a="goc" data-k="tal">순서 전체 ›</button></div>'+st.map(s=>talRow(C,s,L)).join('')+'</div>'}
  else if(L<10)h+='<div class="card"><h3>🌳 특성</h3><p class="note">10레벨부터 특성 포인트가 1개씩 생겨요.</p></div>';
  /* 레벨별 안내 */
  const tip=[[5,'전문기술(수습)을 배울 수 있어요. 채집 1개 + 제작 1개 조합이 무난해요.'],[10,'전문기술 숙련 등급과 특성이 열려요.'],[20,'전문기술 전문 등급을 배울 수 있어요.'],[35,'전문기술 장인 등급을 배울 수 있어요.'],[40,'탈것을 배울 수 있어요. 골드를 미리 모아 두세요.'],[60,'만렙! 던전 장비와 프리레이드 준비를 해요.']].filter(t=>t[0]>=L&&t[0]<=L+3);
  if(tip.length)h+='<div class="card"><h3>📌 곧 생기는 것</h3>'+tip.map(t=>'<div class="tl"><span class="lvb '+lvCls(t[0],L)+'">'+t[0]+'</span><span class="m">'+t[1]+'</span></div>').join('')+'</div>';
  return h+'</div>'}
function groupBy(arr,f){const m=new Map();arr.forEach(x=>{const k=f(x);if(!m.has(k))m.set(k,[]);m.get(k).push(x)});return [...m.entries()]}
function abIcon(name,C){if(!C)return '';const l=C.learns.find(x=>x[1]===name);return l?l[5]:''}
function abChip(name,icon,extra,dim){return '<span class="ab'+(dim?' no':'')+'">'+(icon?'<span class="ic" style="background-image:url('+ICO(icon)+')"></span>':'')+esc(name)+(extra?' <span class="l">'+esc(extra)+'</span>':'')+'</span>'}
function upRow(c,x){const cur=eqIt(c,x.slot);return '<button class="row" data-a="slot" data-k="'+x.slot+'">'+itIcon(x.it)+'<span class="m"><span class="sub">'+SLOT_KO[x.slot]+(cur?' · 지금: '+esc(cur.nm):'')+'</span><span class="nm">'+itName(x.it)+'</span>'+diffHtml(x.it,cur,c)+'<span class="sub">'+esc(srcTxt(x.it,1))+' · Lv '+x.it.lv+'</span></span><span class="r">'+gainTag(x.g,x.base,x.empty)+'</span></button>'}

/* ===================== 장비 ===================== */
function gear(c){const L=c.lv,w=wOf(c);let h='<div class="wrap"><h2>장비</h2><p class="note">칸을 누르면 지금 낄 수 있는 후보와 비교해요. 착용 중인 장비를 넣어 두면 추천이 정확해져요.</p>';
  const ups=upgrades(c,L,ui.ifil);const upSet=new Set(ups.map(u=>u.slot));
  h+='<div class="doll">'+SLOTS.map(([s,ko])=>{const it=eqIt(c,s);if(s==='off'&&eqIt(c,'main')&&eqIt(c,'main').sl==='2h')return '<div class="slot" style="opacity:.5"><span class="ic empty">2H</span><span class="m"><span class="sn">'+ko+'</span><span class="in mute">양손 무기 사용 중</span></span></div>';
    return '<button class="slot" data-a="slot" data-k="'+s+'">'+itIcon(it)+'<span class="m"><span class="sn">'+ko+'</span><span class="in">'+(it?itName(it):'<span class="mute">비어 있음</span>')+'</span></span>'+(upSet.has(s)?'<span class="up">▲</span>':'')+'</button>'}).join('')+'</div>';
  /* 능력치 합계 */
  const tot={};SLOTS.forEach(([s])=>{const it=eqIt(c,s);if(it)for(const k in it.st){if(k==='dps'||k==='armor')continue;tot[k]=(tot[k]||0)+it.st[k]}});
  const ks=Object.keys(tot).sort((a,b)=>(w[b]||0)-(w[a]||0));
  h+='<div class="card"><h3>착용 장비 능력치 합계</h3>'+(ks.length?'<div class="stats">'+ks.map(k=>'<div><span'+(w[k]?'':' class="mute"')+'>'+STAT_KO[k]+'</span><b>'+Math.round(tot[k])+'</b></div>').join('')+'</div>':'<p class="note">장비를 넣으면 합계가 나와요.</p>')+'<p class="note">'+esc(ROLE[c.cls+'/'+c.spec]||'')+' 기준 중요한 순서: '+Object.entries(w).filter(([k])=>STAT_KO[k]&&k!=='armor').sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k])=>k==='dps'?'무기 공격력':STAT_KO[k]).join(' > ')+'</p></div>';
  h+='<div class="chips">'+[['ok','던전·퀘스트로 얻는 것만'],['all','경매장·제작 포함']].map(f=>'<button class="chip'+(ui.ifil===f[0]?' on':'')+'" data-a="ifil" data-k="'+f[0]+'">'+f[1]+'</button>').join('')+'</div>';
  h+='<div class="card"><h3>지금 바꿀 순서</h3>'+(ups.length?ups.map(x=>upRow(c,x)).join(''):'<p class="note">지금 레벨에서 더 좋은 장비가 없어요.</p>')+'</div>';
  const soon=upgrades(c,Math.min(60,L+5),ui.ifil,L+1).slice(0,8);
  if(soon.length)h+='<div class="card"><h3>앞으로 5레벨 안에 낄 장비</h3>'+soon.map(x=>upRow(c,x)).join('')+'</div>';
  return h+'</div>'}
function slotSheet(c,slot){const L=c.lv;const cur=eqIt(c,slot);const w=wOf(c);
  const q=ui.isrch.trim();let list;
  if(q){list=ITEMS.filter(it=>usable(it,c)&&fits(it,slot,c)&&it.nm.includes(q)).slice(0,40).map(it=>({it,s:sc(it,slot,w)}))}
  else list=cands(c,slot,Math.min(60,L+3),ui.ifil).slice(0,30);
  let h='<div class="sh"><h2>'+SLOT_KO[slot]+'</h2><button class="x" data-a="close">✕</button></div>';
  h+='<div class="card hl"><div class="row">'+itIcon(cur)+'<span class="m"><span class="sub">지금 착용</span><span class="nm">'+(cur?itName(cur):'<span class="mute">비어 있음</span>')+'</span>'+(cur?'<span class="sub">'+itMeta(cur)+' · '+esc(srcTxt(cur,1))+'</span>':'')+'</span>'+(cur?'<button class="btn sm ghost" data-a="unequip" data-k="'+slot+'">빼기</button>':'')+'</div></div>';
  h+='<div class="srch"><input class="inp" placeholder="이름으로 찾기 (지금 끼고 있는 장비 넣기)" value="'+esc(ui.isrch)+'" data-c="isrch"></div>';
  if(!q)h+='<p class="note">레벨 '+Math.min(60,L+3)+'까지 낄 수 있는 후보예요. 흐린 건 아직 레벨이 모자라요.</p>';
  h+=list.length?list.map(x=>{const it=x.it;const lock=it.lv>L;const base=slot==='main'&&it.sl==='2h'?sc(eqIt(c,'main'),'main',w)+sc(eqIt(c,'off'),'off',w):sc(cur,slot,w);const g=x.s-base;
    return '<div class="row'+(lock?'" style="opacity:.55':'')+'">'+itIcon(it)+'<span class="m"><span class="nm">'+itName(it)+(it.id===(cur&&cur.id)?' <span class="tag gd">착용 중</span>':'')+'</span><span class="sub">'+itMeta(it)+'</span>'+diffHtml(it,cur,c)+'<span class="sub">'+esc(srcTxt(it,2))+'</span></span><span class="r">'+gainTag(g,base,!cur)+'<br><button class="btn sm" style="margin-top:6px" data-a="equip" data-k="'+slot+'" data-id="'+it.id+'">착용</button></span></div>'}).join(''):'<p class="note">'+(q?'찾는 장비가 없어요. 이 직업이 못 끼는 장비일 수 있어요.':'후보가 없어요.')+'</p>';
  return h}

/* ===================== 퀘스트 ===================== */
function quest(c){const L=c.lv;let h='<div class="wrap"><h2>퀘스트</h2><div class="chips"><button class="chip'+(ui.qmode==='zone'?' on':'')+'" data-a="qmode" data-k="zone">지역 퀘스트</button><button class="chip'+(ui.qmode==='dg'?' on':'')+'" data-a="qmode" data-k="dg">던전 퀘스트</button></div>';
  if(ui.qmode==='dg')return h+dqView(c)+'</div>';
  const Z=zonesNow(c);if(!Z.length)return h+'<p class="empty-st">레벨 '+L+'에 맞는 퀘스트가 없어요.</p></div>';
  const z=Z.find(x=>x.z===ui.qz)||Z[0];const fq=c.fq||{};
  h+='<p class="note">레벨 '+L+'에 받을 수 있고 경험치가 괜찮은 퀘스트예요. 지역을 고르면 <b>퀘스트 주는 마을(거점)별로</b> 묶어서 보여 줘요.</p>';
  h+='<div class="chips">'+Z.map(x=>'<button class="chip'+(x===z?' on':'')+'" data-a="qz" data-k="'+esc(x.z)+'">'+esc(x.z)+'<span class="n">'+x.left+'</span></button>').join('')+'</div>';
  const G={};z.q.forEach(q=>{const [hn,hi]=qHub(z.z,q);(G[hn]=G[hn]||{n:hn,i:hi,q:[]}).q.push(q)});
  const hubs=Object.values(G).sort((a,b)=>(a.i>=97)-(b.i>=97)||Math.min(...a.q.map(q=>q.lv))-Math.min(...b.q.map(q=>q.lv)));let n=0;
  h+=hubs.map(H=>{const todo=H.q.filter(q=>!fq[z.z+'|'+q.nm]).sort((a,b)=>a.lv-b.lv),done=H.q.filter(q=>fq[z.z+'|'+q.nm]);const real=H.i<97;if(real)n++;
    return '<div class="card"><h3 class="hubh">'+(real?'<span class="no">'+n+'</span>':'')+esc(H.n)+' <span class="mute" style="font-weight:400;font-size:13px">· '+todo.length+'개</span></h3>'+(todo.length?todo.map(q=>qRow(c,z.z,q)).join(''):'<p class="note">다 끝냈어요 👍</p>')
     +(done.length?'<details class="fold"><summary>끝낸 퀘스트 '+done.length+'개</summary>'+done.map(q=>qRow(c,z.z,q)).join('')+'</details>':'')+'</div>'}).join('');
  h+='<p class="note">퀘스트 레벨 색: <span class="lvb lv-r" style="min-width:24px;height:18px">빨</span> 어려움 · <span class="lvb lv-y" style="min-width:24px;height:18px">노</span> 적당 · <span class="lvb lv-g" style="min-width:24px;height:18px">초</span> 쉬움. <span class="tag lk">연계</span>는 끝내면 다음 퀘스트가 이어지고, <span class="tag pre">앞 퀘스트 먼저</span>는 앞 단계를 끝내야 받을 수 있어요.</p>';
  return h+'</div>'}
function qRow(c,z,q){const k=z+'|'+q.nm,d=!!(c.fq||{})[k],L=c.lv,lock=q.min>L;
  return '<label class="qrow'+(d?' done':'')+(lock?' lock':'')+'"><input type="checkbox" data-c="fq" data-k="'+esc(k)+'"'+(d?' checked':'')+'><span class="lvb '+lvCls(q.lv,L)+'">'+q.lv+'</span><span class="m"><span class="nm">'+esc(q.nm)+'</span>'+(q.pre?'<span class="tag pre">앞 퀘스트 '+q.pre+'개 먼저</span>':'')+(q.ch?'<span class="tag lk">연계 · 이어서 '+q.ch+'개 더</span>':'')
   +(q.obj?'<span class="obj">'+esc(q.obj)+'</span>':'')+'<span class="sub">'+(q.gv?esc(q.gv)+(q.xy?' ('+esc(q.xy.replace(',',', '))+')':''):'아이템을 줍거나 필드에서 시작')+(lock?' · '+q.min+'레벨부터':'')+'</span></span></label>'}
function dqView(c){const L=c.lv;const near=DGS.filter(d=>d.q.length&&d.q.some(q=>q.min<=L+2&&q.lv>=L-4)&&d.lo<=L+3);const rest=DGS.filter(d=>d.q.length&&!near.includes(d));
  let h='<p class="note">던전마다 얼라이언스가 받을 수 있는 퀘스트예요. <b>던전 가기 전에</b> 마을에서 미리 받아 두면 한 번에 끝낼 수 있어요.</p>';
  h+=near.length?near.map(d=>dqCard(c,d,true)).join(''):'<p class="empty-st">지금 레벨에 맞는 던전 퀘스트가 없어요.</p>';
  h+='<details class="fold"><summary>다른 던전 퀘스트 모두 보기 ('+rest.length+'곳)</summary>'+rest.map(d=>dqCard(c,d,false)).join('')+'</details>';
  return h}
function dqCard(c,d,open){const dq=c.dq||{};const done=d.q.filter(q=>dq[q.id]).length;
  return '<details class="card"'+(open?' open':'')+'><summary style="cursor:pointer;list-style:none"><div class="hd"><h3 style="margin:0">'+esc(d.ko)+'</h3><span class="mute" style="font-size:12px">'+done+'/'+d.q.length+' · 권장 '+d.lo+'–'+d.hi+'</span></div></summary>'+dqList(c,d)+'<button class="more" data-a="dgo" data-k="'+d.slug+'">던전 보스·드랍 보기 ›</button></details>'}
function dqList(c,d){const L=c.lv;const dq=c.dq||{};
  const outQ=d.q.filter(q=>!/던전 안/.test(q.start)&&q.start),inQ=d.q.filter(q=>/던전 안/.test(q.start)||!q.start);
  const row=q=>{const dn=!!dq[q.id],lock=q.min>L;const rw=q.rw.map(id=>IT.get(id)).filter(Boolean);
    return '<label class="qrow'+(dn?' done':'')+(lock?' lock':'')+'"><input type="checkbox" data-c="dq" data-k="'+q.id+'"'+(dn?' checked':'')+'><span class="lvb '+lvCls(q.lv,L)+'">'+q.lv+'</span><span class="m"><span class="nm">'+esc(q.nm)+'</span>'+(q.pre?'<span class="tag pre">앞 퀘스트 먼저</span>':'')+(q.side==='both'?'':'')
     +'<span class="obj">'+esc(q.obj)+'</span>'+(q.boss.length?'<span class="sub">던전 안 목표: '+q.boss.map(b=>esc(b.replace(/^(\d+) /,'$1번 '))).join(', ')+'</span>':'')
     +'<span class="sub">'+esc(startTxt(q.start))+(lock?' · '+q.min+'레벨부터':'')+'</span>'
     +(rw.length?'<span class="rewards">'+(q.choose&&rw.length>1?'<span class="sub" style="width:100%">보상 중 하나 선택:</span>':'')+rw.map(it=>'<span class="rw'+(usable(it,c)?' mine':'')+'">'+itIcon(it)+'<span class="q'+it.q+'">'+esc(it.nm)+'</span></span>').join('')+'</span>':'')+'</span></label>'};
  return (outQ.length?'<h3>던전 가기 전에 받기</h3>'+outQ.map(row).join(''):'')+(inQ.length?'<h3>던전 안에서 시작</h3>'+inQ.map(row).join(''):'')}
function startTxt(s){if(!s)return '아이템을 주워서 시작';if(/^시작 · 던전 안/.test(s))return '던전 안에서 받아요';const m=s.match(/^시작 (.+) · 던전 안$/);if(m)return '던전 안 '+m[1]+'에게 받아요';if(/^시작 · /.test(s))return s.replace(/^시작 · /,'')+'에서 시작';return '받는 곳: '+s}

/* ===================== 던전 ===================== */
function dgItems(c,d){return ITEMS.filter(it=>it.src.some(i=>SRC[i]&&SRC[i].k===0&&SRC[i].dg===d.slug))}
function dgUps(c,d){const L=c.lv;return dgItems(c,d).filter(it=>usable(it,c)&&it.lv<=Math.max(L,d.hi)).map(it=>({it,b:bestSlot(it,c)})).filter(x=>x.b&&x.b.g>.01)}
function dungeon(c){if(ui.dg&&DG[ui.dg])return dgDetail(c,DG[ui.dg]);const L=c.lv;
  let h='<div class="wrap"><h2>던전</h2><p class="note">적정 레벨 순서예요. 막대의 초록 선이 내 레벨 '+L+'이에요. 누르면 보스 순서, 내 직업 드랍, 퀘스트를 보여 줘요.</p>';
  const lst=DGS.slice().sort((a,b)=>a.fit-b.fit);
  h+=lst.map(d=>{const inr=L>=d.lo-1&&L<=d.hi;const ups=inr||L<d.lo?dgUps(c,d).length:0;const pos=Math.max(0,Math.min(100,(L-10)/50*100));
    return '<button class="card row'+(inr?' hl':'')+'" style="display:flex" data-a="dgo" data-k="'+d.slug+'"><span class="m"><span class="nm">'+esc(d.ko)+(inr?' <span class="tag gd">지금 레벨</span>':'')+'</span><span class="sub">권장 '+d.lo+'–'+d.hi+' · '+esc(d.loc)+(d.q.length?' · 퀘스트 '+d.q.length:'')+(ups?' · 내 장비 '+ups:'')+'</span>'
     +'<span class="bar"><i style="left:'+((d.lo-10)/50*100)+'%;width:'+((d.hi-d.lo)/50*100)+'%"></i><b style="left:'+pos+'%"></b></span></span><span class="r">›</span></button>'}).join('');
  return h+'</div>'}
function dgDetail(c,d){const L=c.lv;const items=dgItems(c,d);
  let h='<div class="wrap"><button class="more" data-a="dgback">‹ 던전 목록</button><h2 style="margin-top:4px">'+esc(d.ko)+'</h2><p class="note">'+esc(d.en)+' · '+esc(d.loc)+' · 권장 '+d.lo+'–'+d.hi+' (적정 '+d.fit+')</p>';
  h+='<div class="chips">'+[['me','내 직업 장비만'],['all','드랍 전부']].map(f=>'<button class="chip'+((ui.dgf||'me')===f[0]?' on':'')+'" data-a="dgf" data-k="'+f[0]+'">'+f[1]+'</button>').join('')+'</div>';
  const mine=(ui.dgf||'me')==='me';
  const byBoss={};items.forEach(it=>{const s=it.src.map(i=>SRC[i]).find(s=>s&&s.k===0&&s.dg===d.slug);const b=s?s.boss:'기타';(byBoss[b]=byBoss[b]||[]).push(it)});
  const order=d.bosses.map(b=>b.nm);Object.keys(byBoss).forEach(b=>{if(!order.includes(b))order.push(b)});
  h+='<div class="card"><h3>보스 순서와 드랍</h3>'+order.map((b,i)=>{let its=(byBoss[b]||[]);if(mine)its=its.filter(it=>usable(it,c));
     const rows=its.map(it=>{const bs=bestSlot(it,c);const cur=bs?eqIt(c,bs.s):null;return {it,bs,cur}}).sort((x,y)=>((y.bs?y.bs.g:-1)-(x.bs?x.bs.g:-1)));
     return '<div class="boss"><span class="no">'+(i+1)+'</span><b>'+esc(b)+'</b></div>'+(rows.length?rows.map(r=>'<div class="row">'+itIcon(r.it)+'<span class="m"><span class="nm">'+itName(r.it)+'</span><span class="sub">'+itMeta(r.it)+'</span>'+(usable(r.it,c)?diffHtml(r.it,r.cur,c):'<span class="sub">내 직업은 못 써요</span>')+'</span><span class="r">'+(r.bs?gainTag(r.bs.g,r.bs.base,r.bs.empty):'')+'</span></div>').join(''):'<p class="note" style="margin:2px 0 0 32px">'+(mine?'내 직업이 쓸 드랍이 없어요.':'드랍 정보가 없어요.')+'</p>')}).join('')+'</div>';
  if(d.q.length)h+='<div class="card"><h3>이 던전 퀘스트 (얼라이언스)</h3>'+dqList(c,d)+'</div>';
  h+='<p class="note"><a href="https://forg.gg/forever/dungeons/'+d.slug+'" target="_blank" rel="noopener">forg.gg에서 지도·보스 공략 보기 ↗</a></p>';
  return h+'</div>'}

/* ===================== 직업 ===================== */
const CSEC=[['tal','특성 순서'],['rot','운영·딜 순서'],['learn','기술 습득'],['prof','전문기술']];
function talRow(C,s,L){const t=C.talents[s[1]]||[s[1],'',1];return '<div class="tl'+(s[0]===L?' now':s[0]<L?' done':'')+'"><span class="lvb '+lvCls(s[0],L)+'">'+s[0]+'</span><span class="m"><b>'+esc(t[0])+'</b> <span class="mute">'+s[2]+'/'+t[2]+' · '+esc(t[1])+'</span>'+(t[4]&&s[0]>=L-1&&s[0]<=L+1?'<span class="sub">'+esc(t[4])+'</span>':'')+'</span></div>'}
function rotHtml(C,txt,L){return esc(txt).replace(/\[([^\]@*]+)(?:@(\d+))?(\*)?\]/g,(m,n,lv,t)=>{const icon=abIcon(n,C);const no=lv&&+lv>L;return '<span class="ab'+(no?' no':'')+'">'+(icon?'<span class="ic" style="background-image:url('+ICO(icon)+')"></span>':'')+n+(lv?' <span class="l">'+lv+'</span>':'')+(t?' <span class="l">특성</span>':'')+'</span>'})}
function klass(c){const C=D_CLS[c.cls],sp=specOf(c),L=c.lv,sec=ui.csec;
  let h='<div class="wrap"><h2>'+esc(CINFO[c.cls][0])+'</h2><div class="chips">'+C.specs.map(s=>'<button class="chip'+(s.id===c.spec?' on':'')+'" data-a="spec" data-k="'+s.id+'">'+esc(s.name)+'</button>').join('')+'</div>';
  h+='<div class="chips">'+CSEC.map(x=>'<button class="chip'+(sec===x[0]?' on':'')+'" data-a="csec" data-k="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>';
  if(sec==='tal'){const pts=Math.max(0,L-9);const st=sp.steps;const sum={};st.filter(s=>s[0]<=60).forEach(s=>{const t=C.talents[s[1]];if(t)sum[t[1]]=(sum[t[1]]||0)+1});
    h+='<div class="card"><h3>'+esc(sp.name)+' 특성 순서</h3><p class="note">레벨 '+L+'이면 특성 포인트 '+pts+'개예요. 60레벨 완성: '+C.trees.map(t=>esc(t)+' '+(sum[t]||0)).join(' · ')+'</p>';
    const now=st.filter(s=>s[0]>=L-1&&s[0]<=L+4);if(L>=9&&now.length)h+=now.map(s=>talRow(C,s,L)).join('');
    h+='<details class="fold"><summary>10~60 전체 순서</summary>'+st.map(s=>talRow(C,s,L)).join('')+'</details><p class="note"><a href="https://forg.gg/forever/classes/'+c.cls+'?spec='+sp.id+'" target="_blank" rel="noopener">forg.gg에서 특성 트리로 보기 ↗</a></p></div>'}
  if(sec==='rot'){const blk=(t,arr)=>arr.length?'<div class="card"><h3>'+t+'</h3>'+arr.map(r=>'<div class="rot"><div class="w">'+esc(r[0])+'</div><div>'+rotHtml(C,r[1],L)+'</div></div>').join('')+'</div>':'';
    h+='<p class="note">흐린 기술은 아직 못 배운 거예요. 숫자는 배우는 레벨이에요.</p>'+(L<30?blk('초반 (레벨업)',sp.early)+blk('기본 운영',sp.rot):blk('기본 운영',sp.rot)+blk('초반 (레벨업)',sp.early))+blk('후반',sp.late)}
  if(sec==='learn'){const ls=C.learns.filter(l=>!l[4]||l[4]==='alliance');
    h+='<div class="card"><h3>레벨별 배우는 기술</h3><p class="note">직업 상급자에게 배워요. 흐린 건 아직 레벨이 모자라요.</p>'+groupBy(ls,l=>l[0]).filter(([lv])=>lv>=L-4&&lv<=L+6).map(([lv,arr])=>'<div class="tl'+(lv===L||lv===L-1&&L%2?' now':'')+'"><span class="lvb '+lvCls(lv,L)+'">'+lv+'</span><span class="m">'+arr.map(l=>abChip(l[1],l[5],l[3]?'새 기술':'랭크 '+l[2],lv>L)).join(' ')+'</span></div>').join('')
     +'<details class="fold"><summary>1~60 전체 보기</summary>'+groupBy(ls,l=>l[0]).map(([lv,arr])=>'<div class="tl"><span class="lvb '+lvCls(lv,L)+'">'+lv+'</span><span class="m">'+arr.map(l=>abChip(l[1],l[5],l[3]?'':'랭크 '+l[2],lv>L)).join(' ')+'</span></div>').join('')+'</details></div>'}
  if(sec==='prof')h+=profView(c);
  h+='<p class="note">출처: forg.gg 직업 가이드(Wowhead·Mobalytics 빌드를 정리한 것). 게임 업데이트로 바뀔 수 있어요.</p>';
  return h+'</div>'}
function profView(c){const sel=PROFS.find(p=>p.id===ui.pf)||PROFS[0];let h='<div class="chips">'+PROFS.map(p=>'<button class="chip'+(p===sel?' on':'')+'" data-a="pf" data-k="'+p.id+'">'+esc(p.ko)+'</button>').join('')+'</div>';
  h+='<div class="card"><h3>'+esc(sel.ko)+'</h3>'+(sel.pair?'<p class="note">같이 하면 좋은 기술: '+esc(sel.pair)+'</p>':'');
  h+='<p class="note">등급: '+PROF_RANK.map(r=>r[0]+' '+r[1]+'–'+r[2]+' ('+r[3]+')').join(' · ')+'</p>';
  if(sel.steps)h+=sel.steps.map(s=>'<div class="tl"><span class="lvb">'+s[0]+'</span><span class="m"><b>'+esc(s[2])+'</b> <span class="mute">×'+esc(s[3])+' → '+s[1]+'</span><span class="sub">'+esc(s[4])+(s[5]?' · '+esc(s[5]):'')+'</span></span></div>').join('');
  if(sel.gather)h+=sel.gather.map(g=>'<div class="tl"><span class="lvb">'+g[0]+'</span><span class="m"><b>'+esc(g[1])+'</b><span class="sub">'+esc(g[2])+'</span></span></div>').join('');
  if(sel.tips)h+='<h3>팁</h3>'+sel.tips.map(t=>'<p class="note">• '+esc(t)+'</p>').join('');
  return h+'<p class="note"><a href="'+esc(sel.src)+'" target="_blank" rel="noopener">원본 가이드 ↗</a></p></div>'}

/* ===================== 캐릭터 관리 시트 ===================== */
function charsSheet(){const c=me();let h='<div class="sh"><h2>내 캐릭터</h2><button class="x" data-a="close">✕</button></div>';
  h+=DB.list.map(x=>{const sp=specOf(x);return '<div class="row">'+clsIcon(x.cls)+'<span class="m"><span class="nm" style="color:'+CINFO[x.cls][1]+'">'+esc(x.name||CINFO[x.cls][0])+(x.id===DB.cur?' <span class="tag gd">지금</span>':'')+'</span><span class="sub">'+esc((sp?sp.name+' ':'')+CINFO[x.cls][0])+' · 레벨 '+x.lv+'</span></span>'+(x.id===DB.cur?'':'<button class="btn sm" data-a="pick" data-k="'+x.id+'">이 캐릭터로</button>')+'</div>'}).join('');
  h+='<button class="btn full" style="margin-top:10px" data-a="add">＋ 부캐 추가</button>';
  if(c){h+='<h3>지금 캐릭터 고치기</h3><input class="inp" maxlength="12" value="'+esc(c.name)+'" placeholder="이름" data-c="cname"><div class="chips" style="margin-top:6px">'+RACES.map(r=>'<button class="chip'+(c.race===r[0]?' on':'')+'" data-a="crace" data-k="'+r[0]+'">'+r[1]+'</button>').join('')+'</div>';
    h+='<div class="chips">'+CL.map(k=>'<button class="chip'+(c.cls===k?' on':'')+'" data-a="ccls" data-k="'+k+'">'+CINFO[k][0]+'</button>').join('')+'</div><p class="note">직업을 바꾸면 장비 칸이 비워져요.</p>';
    h+='<button class="btn danger full" style="margin-top:14px" data-a="del">'+(ui.delAsk?'정말 지울까요? 한 번 더 누르면 지워져요':'이 캐릭터 지우기')+'</button>'}
  return h}

/* ===================== 그리기 ===================== */
function render(){const app=$('#app');const c=me();
  if(ui.onb||!c){if(!ui.onb)ui.onb={name:'',race:'',cls:'',spec:'',lv:1};app.innerHTML=onboard();return}
  let v='';if(ui.tab==='home')v=home(c);else if(ui.tab==='gear')v=gear(c);else if(ui.tab==='quest')v=quest(c);else if(ui.tab==='dungeon')v=dungeon(c);else v=klass(c);
  app.innerHTML=topBar(c)+v+'<p class="foot">자료: <a href="https://forg.gg/forever" target="_blank" rel="noopener">forg.gg</a> (와우헤드 포에버·Questie 정리) · 입력한 내용은 이 기기에만 저장돼요</p>'+tabs()
    +(ui.sheet?'<div class="sheet-bg" data-a="bg"><div class="sheet"><div class="grab"></div>'+(ui.sheet==='chars'?charsSheet():slotSheet(c,ui.sheet.slice(5)))+'</div></div>':'')}
function rerender(keepScroll){const y=window.scrollY;const sh=document.querySelector('.sheet');const sy=sh?sh.scrollTop:0;render();if(keepScroll)window.scrollTo(0,y);const s2=document.querySelector('.sheet');if(s2&&keepScroll)s2.scrollTop=sy}
function setLv(c,v){v=Math.max(1,Math.min(60,parseInt(v,10)||c.lv));if(v!==c.lv){c.lv=v;save()}}

/* ===================== 이벤트 ===================== */
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,k=b.dataset.k;const c=me();
  if(a==='bg'){if(e.target===b){ui.sheet=null;ui.delAsk=0;rerender(true)}return}
  if(a==='close'){ui.sheet=null;ui.delAsk=0;rerender(true);return}
  /* 시작 화면 */
  const o=ui.onb;
  if(a==='onb-race'){o.race=k;rerender(true);return}
  if(a==='onb-cls'){o.cls=k;o.spec='';rerender(true);return}
  if(a==='onb-spec'){o.spec=k;rerender(true);return}
  if(a==='onb-lv-'||a==='onb-lv+'){o.lv=Math.max(1,Math.min(60,(+o.lv||1)+(a==='onb-lv+'?1:-1)));rerender(true);return}
  if(a==='onb-x'){ui.onb=null;rerender();return}
  if(a==='onb-go'){if(!(o.race&&o.cls&&o.spec))return;const n={id:newId(),name:(o.name||'').trim(),race:o.race,cls:o.cls,spec:o.spec,lv:Math.max(1,Math.min(60,+o.lv||1)),eq:{},fq:{},dq:{}};DB.list.push(n);DB.cur=n.id;save();ui.onb=null;ui.tab='home';ui.sheet=null;render();window.scrollTo(0,0);toast('캐릭터를 만들었어요');return}
  if(!c)return;
  if(a==='tab'){ui.tab=k;ui.dg=null;render();window.scrollTo(0,0);return}
  if(a==='lv-'||a==='lv+'){setLv(c,c.lv+(a==='lv+'?1:-1));rerender(true);return}
  if(a==='chars'){ui.sheet='chars';rerender(true);return}
  if(a==='pick'){DB.cur=k;save();ui.sheet=null;ui.dg=null;ui.qz=null;render();window.scrollTo(0,0);toast('캐릭터를 바꿨어요');return}
  if(a==='add'){ui.sheet=null;ui.onb={name:'',race:c.race,cls:'',spec:'',lv:1};render();window.scrollTo(0,0);return}
  if(a==='del'){if(!ui.delAsk){ui.delAsk=1;rerender(true);return}DB.list=DB.list.filter(x=>x.id!==c.id);DB.cur=DB.list[0]?DB.list[0].id:null;save();ui.delAsk=0;ui.sheet=null;render();toast('지웠어요');return}
  if(a==='crace'){c.race=k;save();rerender(true);return}
  if(a==='ccls'){if(c.cls!==k){c.cls=k;c.spec=D_CLS[k].specs[0].id;c.eq={};save()}rerender(true);return}
  if(a==='spec'){c.spec=k;save();rerender(true);return}
  if(a==='csec'){ui.csec=k;rerender(true);return}
  if(a==='goc'){ui.tab='class';ui.csec=k;render();window.scrollTo(0,0);return}
  if(a==='pf'){ui.pf=k;rerender(true);return}
  if(a==='qmode'){ui.qmode=k;rerender(true);return}
  if(a==='qz'){ui.qz=k;rerender(true);return}
  if(a==='goz'){ui.tab='quest';ui.qmode='zone';ui.qz=k;render();window.scrollTo(0,0);return}
  if(a==='dgo'){ui.tab='dungeon';ui.dg=k;render();window.scrollTo(0,0);return}
  if(a==='dgback'){ui.dg=null;render();window.scrollTo(0,0);return}
  if(a==='dgf'){ui.dgf=k;rerender(true);return}
  if(a==='ifil'){ui.ifil=k;rerender(true);return}
  if(a==='slot'){ui.sheet='slot:'+k;ui.isrch='';rerender(true);return}
  if(a==='equip'){const id=+b.dataset.id;const it=IT.get(id);c.eq=c.eq||{};c.eq[k]=id;if(k==='main'&&it&&it.sl==='2h')delete c.eq.off;save();ui.sheet=null;rerender(true);toast(it.nm+' 착용');return}
  if(a==='unequip'){delete c.eq[k];save();rerender(true);return}
});
document.addEventListener('change',e=>{const t=e.target;const f=t.dataset.c;if(!f)return;const c=me();
  if(f==='onb-name'){ui.onb.name=t.value;return}
  if(f==='onb-lv'){ui.onb.lv=Math.max(1,Math.min(60,parseInt(t.value)||1));rerender(true);return}
  if(!c)return;
  if(f==='lv'){setLv(c,t.value);rerender(true);return}
  if(f==='cname'){c.name=t.value.trim();save();rerender(true);return}
  if(f==='fq'){c.fq=c.fq||{};if(t.checked)c.fq[t.dataset.k]=1;else delete c.fq[t.dataset.k];save();rerender(true);return}
  if(f==='dq'){c.dq=c.dq||{};if(t.checked)c.dq[t.dataset.k]=1;else delete c.dq[t.dataset.k];save();rerender(true);return}
});
let srchT=null;
document.addEventListener('input',e=>{const t=e.target;if(t.dataset.c==='onb-name'){ui.onb.name=t.value;return}
  if(t.dataset.c==='isrch'){ui.isrch=t.value;clearTimeout(srchT);srchT=setTimeout(()=>{const pos=t.selectionStart;rerender(true);const n=document.querySelector('[data-c=isrch]');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(_){}}},250)}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.dataset&&(e.target.dataset.c==='lv'||e.target.dataset.c==='onb-lv'))e.target.blur()});
render();
