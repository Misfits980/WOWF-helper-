'use strict';
/* ===================== 기본 자료 ===================== */
const CL=['warrior','paladin','hunter','rogue','priest','shaman','mage','warlock','druid'];
const CINFO={warrior:['전사','#C79C6E'],paladin:['성기사','#F58CBA'],hunter:['사냥꾼','#ABD473'],rogue:['도적','#FFF569'],priest:['사제','#FFFFFF'],shaman:['주술사','#2a8cff'],mage:['마법사','#69CCF0'],warlock:['흑마법사','#9482C9'],druid:['드루이드','#FF7D0A']};
const RACES=[['human','인간','achievement_character_human_male'],['dwarf','드워프','achievement_character_dwarf_male'],['gnome','노움','achievement_character_gnome_male'],['nightelf','나이트엘프','achievement_character_nightelf_male'],['skyborne','고등 마법원 스카이본','spell_nature_cyclone']];
const RACE_START={human:'human',dwarf:'dwarf-gnome',gnome:'dwarf-gnome',nightelf:'nightelf',skyborne:'skyborne-alliance'};
/* 종족별 가능한 직업 (forg.gg 종족 페이지) */
const RACE_CLS={human:['warrior','paladin','hunter','rogue','priest','mage','warlock'],dwarf:['warrior','paladin','hunter','rogue','priest','shaman'],nightelf:['warrior','hunter','rogue','priest','druid'],gnome:['warrior','rogue','priest','mage','warlock'],skyborne:['warrior','hunter','rogue','mage','druid']};
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
const ITEMS=D_ITEMS.split('\n').filter(Boolean).map(l=>{const f=l.split('|');const st={};for(const tok of (f[5]||'').split(' ')){const m=tok.match(/^(mp5|[a-z]+)(-?[\d.]+)$/);if(m)st[m[1]]=+m[2]}
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
  const f=l.split('|');if(!sec)continue;sec.q.push({lv:+f[0],min:+f[1]||Math.max(1,+f[0]-5),nm:f[2],gz:f[3],gv:f[4],xy:f[5],ch:+f[6]||0,pre:+f[7]||0,obj:f[8]||'',id:+f[9]||0,sz:sec.z.split(' · ')[0]})}}

/* ----- 얻을 수 있는 레벨: 아이템 착용 레벨보다 퀘스트·던전 레벨이 높으면 그걸 따른다 ----- */
{const QMIN={};for(const k in ROUTE)for(const S of ROUTE[k])for(const q of S.q){if(QMIN[q.nm]==null||q.min<QMIN[q.nm])QMIN[q.nm]=q.min}
 const RW={};DGS.forEach(d=>d.q.forEach(q=>q.rw.forEach(id=>{RW[id]=Math.min(RW[id]??99,Math.max(q.min,d.lo-2))})));
 const DGKO={};DGS.forEach(d=>DGKO[d.ko]=d);
 for(const it of ITEMS){let ob=99;
   if(RW[it.id]!=null)ob=Math.min(ob,RW[it.id]);
   for(const i of it.src){const s=SRC[i];if(!s)continue;let v=it.lv;
     if(s.k===0&&DG[s.dg])v=DG[s.dg].lo;
     else if(s.k===1){const m=s.qn.match(/^(.+?) · 퀘스트 보상$/);if(m&&DGKO[m[1]])v=Math.max(DGKO[m[1]].lo-2,RW[it.id]??0);else if(QMIN[s.qn]!=null)v=QMIN[s.qn]}
     ob=Math.min(ob,v)}
   it.ob=Math.max(it.lv,ob===99?it.lv:ob)}}

/* ----- 대륙 ----- */
const CONT={};'엘윈 숲,던 모로,서부 몰락지대,모단 호수,붉은마루 산맥,그늘숲,저습지,은빛소나무 숲,힐스브래드 구릉지,아라시 고원,가시덤불 골짜기,저주받은 땅,황야의 땅,슬픔의 늪,알터랙 산맥,동부 내륙지,이글거리는 협곡,불타는 평원,서부 역병지대,동부 역병지대,티리스팔 숲,스톰윈드,아이언포지'.split(',').forEach(z=>CONT[z]='동부 왕국');
'텔드랏실,어둠의 해안,잿빛 골짜기,돌발톱 산맥,불모의 땅,먼지진흙 습지대,잊혀진 땅,페랄라스,버섯구름 봉우리,타나리스,아즈샤라,악령의 숲,운고로 분화구,여명의 설원,실리더스,다르나서스'.split(',').forEach(z=>CONT[z]='칼림도어');CONT['제프라스 섬']='제프라스 섬';
const CONT_IC={'동부 왕국':'🏰','칼림도어':'🌴','제프라스 섬':'🏝️'};
const contTag=z=>CONT[z]?'<span class="tag ct">'+CONT_IC[CONT[z]]+' '+CONT[z]+'</span>':'';
/* 대륙을 넘어갈 때 (얼라이언스 배) */
const BOAT='동부 왕국 ↔ 칼림도어: 저습지 <b>메네실 항구</b>에서 배를 타면 어둠의 해안 <b>아우버다인</b>(또는 먼지진흙 습지대 테라모어)으로 가요.';

/* ===================== 저장 ===================== */
const KEY='wowf2';
let DB=(()=>{try{const o=JSON.parse(localStorage.getItem(KEY));if(o&&o.list)return o}catch(e){}return {cur:null,list:[]}})();
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){}};
const me=()=>DB.list.find(c=>c.id===DB.cur)||null;
const newId=()=>'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
function specOf(c){const C=D_CLS[c.cls];return (C&&C.specs.find(s=>s.id===c.spec))||(C&&C.specs[0])}
function wOf(c){return (W[c.cls]||{})[c.spec]||Object.values(W[c.cls]||{})[0]||{}}

/* ===================== 전투정보실 (깃허브가 3시간마다 data/armory/chars.json 으로 가져옴) ===================== */
let ARM={};let ARM_OK=false;
const ARM_SLOT={HEAD:'head',NECK:'neck',SHOULDER:'shoulder',BACK:'back',CHEST:'chest',WRIST:'wrist',HANDS:'hands',WAIST:'waist',LEGS:'legs',FEET:'feet',FINGER_1:'ring1',FINGER_2:'ring2',TRINKET_1:'trink1',TRINKET_2:'trink2',MAIN_HAND:'main',OFF_HAND:'off',RANGED:'ranged'};
const ARM_INV={CLOAK:'ba',CHEST:'ch',ROBE:'ch',FEET:'fe',HAND:'ha',HEAD:'he',FINGER:'fi',LEGS:'le',SHOULDER:'sh',WAIST:'wa',WRIST:'wr',NECK:'ne',TRINKET:'tr',TWOHWEAPON:'2h',WEAPON:'1h',WEAPONMAINHAND:'mh',WEAPONOFFHAND:'oh',SHIELD:'oh',HOLDABLE:'ho',RANGED:'ra',RANGEDRIGHT:'ra',THROWN:'ra',RELIC:'ra'};
const ARM_STAT={STRENGTH:'str',AGILITY:'agi',STAMINA:'sta',INTELLECT:'int',SPIRIT:'spi',SPELL_POWER:'sp',BONUS_HEALING:'heal',SPELL_HEALING:'heal',HEALING:'heal',MANA_REGENERATION:'mp5',ATTACK_POWER:'ap',RANGED_ATTACK_POWER:'ap',DEFENSE_SKILL_RATING:'def',DEFENSE:'def',BLOCK_VALUE:'block',FIRE_SPELL_POWER:'fire',FROST_SPELL_POWER:'frost',NATURE_SPELL_POWER:'nature',SHADOW_SPELL_POWER:'shadow',ARCANE_SPELL_POWER:'arcane',HOLY_SPELL_POWER:'holy'};
const ARM_Q={POOR:'p',COMMON:'c',UNCOMMON:'u',RARE:'r',EPIC:'e',LEGENDARY:'l'};
function armRace(r){r=String(r||'').toLowerCase();return /night|나이트/.test(r)?'nightelf':/gnome|노움/.test(r)?'gnome':/dwarf|드워프/.test(r)?'dwarf':/human|인간/.test(r)?'human':'skyborne'}
function armItem(g){let it=IT.get(g.id);if(it)return it;const st={};(g.stats||[]).forEach(([k,v])=>{const m=ARM_STAT[k];if(m)st[m]=(st[m]||0)+v});
  (g.spells||[]).forEach(t=>{let m=t.match(/치유량이 최대 (\d+)/);if(m)st.heal=(st.heal||0)+ +m[1];m=t.match(/피해와 치유량이 최대 (\d+)/);if(m)st.sp=(st.sp||0)+ +m[1];m=t.match(/5초마다 (\d+)의 마나/);if(m)st.mp5=(st.mp5||0)+ +m[1]});
  if(g.dps)st.dps=g.dps;
  it={id:g.id,lv:g.req||1,est:false,sl:ARM_INV[g.inv]||'',cs:g.cls+'.'+g.sub,q:ARM_Q[g.q]||'c',st,eff:false,src:[],mask:511,ph:'',allow:null,prof:'',nm:g.nm,ic:'',icUrl:g.icon,ob:g.req||1,arm:true};
  ITEMS.push(it);IT.set(it.id,it);return it}
function armApply(c,silent){const A=ARM[c.arm];if(!A||!A.gear)return false;c.eq={};
  for(const g of Object.values(A.gear)){const s=ARM_SLOT[g.slot];if(!s)continue;armItem(g);c.eq[s]=g.id}
  if(A.level)c.lv=A.level;if(A.cls&&CL.includes(A.cls)&&c.cls!==A.cls){c.cls=A.cls;c.spec=D_CLS[A.cls].specs[0].id}
  c.armAt=A.checked;save();if(!silent)toast('전투정보실에서 불러왔어요');return true}
function armAgo(t){if(!t)return '';const m=Math.round((Date.now()-new Date(t))/60000);return m<60?m+'분 전':m<1440?Math.round(m/60)+'시간 전':Math.round(m/1440)+'일 전'}
fetch('data/armory/chars.json?'+Math.floor(Date.now()/600000)).then(r=>r.ok?r.json():{}).then(j=>{ARM=j||{};ARM_OK=true;
  /* 이미 연결된 캐릭터는 새 자료가 오면 자동으로 맞춤 */
  let ch=false;DB.list.forEach(c=>{const A=ARM[c.arm];if(A&&A.checked&&A.checked!==c.armAt&&A.gear){armApply(c,true);ch=true}});
  DB.list.forEach(c=>{const A=ARM[c.arm];if(A&&A.gear)Object.values(A.gear).forEach(armItem)});
  render()}).catch(()=>{ARM_OK=true});
function armBox(c){const keys=Object.keys(ARM).filter(k=>ARM[k]&&ARM[k].gear);const A=c&&ARM[c.arm];
  let h='<h3>⚔️ 전투정보실 연결</h3>';
  if(A)h+='<p class="note">연결됨: <b>'+esc(A.name)+'</b> ('+esc(A.key)+') · 레벨 '+(A.level||'?')+' · 마지막 갱신 '+armAgo(A.checked)+'<br>깃허브가 3시간마다 전투정보실을 읽어서 레벨과 장비를 자동으로 맞춰요. (게임에서 로그아웃해야 전투정보실이 바뀌어요)</p><button class="btn sm" data-a="armnow">지금 자료로 다시 맞추기</button> <button class="btn sm ghost" data-a="armoff">연결 끊기</button>';
  else{h+='<p class="note">명단에 있는 캐릭터를 고르면 레벨과 착용 장비를 전투정보실에서 그대로 가져와요.</p>';
    h+=keys.length?'<div class="chips" style="flex-wrap:wrap">'+keys.map(k=>'<button class="chip" data-a="armlink" data-k="'+esc(k)+'">'+esc(ARM[k].name)+' <span class="n">Lv'+(ARM[k].level||'?')+' '+esc(ARM[k].clsName||'')+'</span></button>').join('')+'</div>':'<p class="note">'+(ARM_OK?'아직 명단에 캐릭터가 없어요.':'명단을 불러오는 중…')+'</p>'}
  h+='<details class="fold"><summary>명단에 내 캐릭터가 없어요</summary><p class="note">용현님에게 <b>지역(한국이면 kr)과 이름-성</b>을 알려 주세요. 명단 파일(data/armory/chars.txt)에 한 줄 넣으면 몇 분 안에 생겨요.</p><p class="note"><a href="https://github.com/Misfits980/WOWF-helper-/edit/main/data/armory/chars.txt" target="_blank" rel="noopener">명단 고치기 (저장소 주인만) ↗</a></p></details>';
  return h}

/* ===================== 퀘스트 상세 (할 일·모을 것·연계) — 필요할 때 불러옴 ===================== */
const QD=new Map();let QD_OK=false;
fetch('data/forg/quests.jsonl?'+Math.floor(Date.now()/3600000)).then(r=>r.ok?r.text():'').then(t=>{t.split('\n').forEach(l=>{if(!l)return;try{const o=JSON.parse(l);QD.set(o.id,o)}catch(e){}});QD_OK=true;if(me()&&(ui.tab==='quest'||ui.tab==='dungeon'))rerender(true)}).catch(()=>{QD_OK=true});
const T_IC={'처치':'⚔️','수집':'📦','사용':'✋','대화':'💬','탐험':'🧭','획득':'📦','호위':'🛡️','상호작용':'✋','전달':'📨','파괴':'💥','조사':'🔍'};
const T_KO={'처치':'잡기','수집':'모으기','사용':'사용하기','대화':'대화하기','탐험':'찾아가기','획득':'얻기','호위':'호위하기','상호작용':'눌러서 조사','전달':'전달하기','파괴':'부수기','조사':'조사하기'};
function qDetail(id,q){const d=QD.get(id);if(!d)return '';let h='';
  if(d.t&&d.t.length)h+='<span class="qt">'+d.t.map(t0=>{const t=[t0[0],t0[1],t0[2],(t0[3]||'').replace(/ ?그 밖 지역$/,'').trim()];return t}).map(t=>'<span class="ti">'+(T_IC[t[0]]||'•')+' <b>'+esc(t[1])+'</b> '+(T_KO[t[0]]||t[0])+(t[3]?'<span class="sub"> · '+(t[0]==='수집'?'떨구는 몹: ':'')+esc(t[3])+'</span>':'')+(t[2]?'<span class="sub"> · 많은 곳 '+esc(t[2].replace(/[()]/g,''))+'</span>':'')+'</span>').join('')+'</span>';
  if(d.r&&d.r[0]&&!d.r[3])h+='<span class="sub">🏁 반납: '+esc(d.r[0])+(d.r[1]?' · '+esc(d.r[1])+(d.r[2]?' ('+esc(d.r[2].replace(',',', '))+')':''):'')+'</span>';
  if(d.ch&&d.ch.length>1){const cur=d.ch.find(r=>r[5])||d.ch.find(r=>r[1]===q.nm);const ci=cur?cur[0]:d.cc;const next=d.ch.filter(r=>r[0]>ci);const prev=d.ch.filter(r=>r[0]<ci);
    h+='<span class="chn">';
    if(prev.length)h+='<span class="cp">⬅ 앞 단계: '+prev.map(r=>'<b>'+esc(r[1])+'</b>'+(r[2]?' (Lv '+r[2]+')':'')).join(' → ')+'</span>';
    h+=next.slice(0,2).map(r=>'<span class="cn">➡ <span class="lvb sm">'+(r[2]||'?')+'</span> <b>'+esc(r[1])+'</b>'+(r[3]?' · '+esc(r[3]):'')+(r[4]&&r[4]!=='받기'?'<span class="sub"> · '+esc(r[4])+'</span>':'')+'</span>').join('');
    if(next.length>2)h+='<details class="fold"><summary>뒤로 '+(next.length-2)+'단계 더 보기</summary>'+next.slice(2).map(r=>'<span class="cn">➡ <span class="lvb sm">'+(r[2]||'?')+'</span> <b>'+esc(r[1])+'</b>'+(r[3]?' · '+esc(r[3]):'')+(r[4]&&r[4]!=='받기'?'<span class="sub"> · '+esc(r[4])+'</span>':'')+'</span>').join('')+'</details>';
    h+='</span>'}
  return h}
function chainTag(id,q){const d=QD.get(id);if(d&&d.cn>1)return '<span class="tag lk">연계 '+(d.cc||'?')+'/'+d.cn+'단계</span>';return q.ch?'<span class="tag lk">연계 · 이어서 '+q.ch+'개 더</span>':''}

/* ===================== 화면 상태 ===================== */
const ui={tab:'home',sheet:null,qz:null,qmode:'route',dg:null,csec:'tal',srch:'',onb:null,isrch:'',ifil:'ok',pf:null};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=s=>document.querySelector(s);
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),1600)}

/* ===================== 아이템 계산 ===================== */
const ci=c=>CL.indexOf(c.cls);
/* 무기·방어구 숙련 (얼라이언스 기준). 사슬·판금은 40레벨부터 */
const WPN={warrior:[0,1,2,3,4,5,6,7,8,10,13,15,16,18],paladin:[0,1,4,5,6,7,8],hunter:[0,1,2,3,6,7,8,10,13,15,16,18],rogue:[2,3,4,7,13,15,16,18],priest:[4,10,15,19],shaman:[0,1,4,5,10,13,15],mage:[7,10,15,19],warlock:[7,10,15,19],druid:[4,5,6,10,13,15]};
const ARMOR={warrior:[3,4],paladin:[3,4],hunter:[2,3],shaman:[2,3],rogue:[2,2],druid:[2,2],priest:[1,1],mage:[1,1],warlock:[1,1]};
const SHIELD=new Set(['warrior','paladin','shaman']);
function profOk(it,cls,lv){const [a,b]=(it.cs||'').split('.').map(Number);
  if(a===2)return b!==20&&WPN[cls].includes(b);
  if(a===4){if(b===6)return SHIELD.has(cls);if(b>=1&&b<=4){if(it.sl==='ba')return true;const m=ARMOR[cls];return b<=(lv>=40?m[1]:m[0])}}
  return true}
function usable(it,c,lv){if(!(it.mask&(1<<ci(c))))return false;if(it.allow&&!it.allow.includes(c.cls))return false;return profOk(it,c.cls,Math.max(lv||c.lv,it.lv))}
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
function cands(c,slot,maxLv,mode){const w=wOf(c);return ITEMS.filter(it=>it.ob<=maxLv&&usable(it,c)&&fits(it,slot,c)&&srcOk(it,mode)&&it.ph!=='x').map(it=>({it,s:sc(it,slot,w)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s)}
function upgrades(c,L,mode,minLv){const out=[];const w=wOf(c);
  for(const [slot] of SLOTS){if(slot==='ring2'||slot==='trink2')continue;
    const pair=slot==='ring1'?['ring1','ring2']:slot==='trink1'?['trink1','trink2']:[slot];
    const curS=Math.min(...pair.map(p=>sc(eqIt(c,p),p,w)));const tgt=pair.reduce((a,p)=>sc(eqIt(c,p),p,w)<=sc(eqIt(c,a),a,w)?p:a,pair[0]);
    let base=curS;if(slot==='main')base=sc(eqIt(c,'main'),'main',w)+(0);
    if(slot==='off'&&eqIt(c,'main')&&eqIt(c,'main').sl==='2h')continue;
    const have=new Set(pair.map(p=>c.eq[p]).filter(Boolean));
    const list=cands(c,slot,L,mode).filter(x=>!have.has(x.it.id)&&(minLv==null||x.it.ob>=minLv));
    for(const x of list.slice(0,1)){let g;
      if(slot==='main'&&x.it.sl==='2h')g=x.s-(sc(eqIt(c,'main'),'main',w)+sc(eqIt(c,'off'),'off',w));else g=x.s-base;
      if(g>.01)out.push({slot:tgt,it:x.it,g,base:slot==='main'&&x.it.sl==='2h'?sc(eqIt(c,'main'),'main',w)+sc(eqIt(c,'off'),'off',w):base,empty:!eqIt(c,tgt)})}}
  return out.sort((a,b)=>(b.empty-a.empty)||(b.g/Math.max(b.base,4))-(a.g/Math.max(a.base,4)))}
function gainTag(g,base,empty){if(empty)return '<span class="gain new">빈 칸 채우기</span>';if(g<-.5)return '<span class="gain no" style="color:var(--bad)">나빠짐</span>';if(!(g>.01))return '<span class="gain no">변화 없음</span>';const r=g/Math.max(base,4);return r>=.5?'<span class="gain big">크게 좋아짐</span>':r>=.2?'<span class="gain mid">좋아짐</span>':'<span class="gain sm">조금 좋아짐</span>'}
function diffHtml(a,b,c){const w=wOf(c);const ks=new Set([...Object.keys(a?a.st:{}),...Object.keys(b?b.st:{})]);const arr=[];
  for(const k of ks){if(!STAT_KO[k])continue;if(k==='armor'&&!(w.armor))continue;const d=((a&&a.st[k])||0)-((b&&b.st[k])||0);if(Math.abs(d)<.05)continue;if(k==='dps'){const ra=(a||b).sl==='ra';if(!(ra?w.rdps:w.dps))continue}arr.push([k,d,Math.abs(d*(w[k]||(k==='dps'?(w.dps||w.rdps):0)))+(w[k]?1:0)])}
  arr.sort((x,y)=>y[2]-x[2]);if(!arr.length)return '';
  return '<span class="dif">'+arr.slice(0,4).map(([k,d])=>'<span class="'+(d>0?'p':'n')+'">'+STAT_KO[k]+' '+(d>0?'+':'−')+(k==='dps'?Math.abs(d).toFixed(1):Math.round(Math.abs(d)))+'</span>').join(' · ')+'</span>'}
function srcTxt(it,n){if(!it.src.length)return '출처 정보 없음';return it.src.slice(0,n||2).map(i=>{const s=SRC[i];if(!s)return '';
  if(s.k===0)return (DG[s.dg]?DG[s.dg].ko:s.dn)+' · '+s.boss;if(s.k===1)return '퀘스트 「'+s.qn+'」';if(s.k===2)return '월드 드랍 (경매장)';if(s.k===3)return s.label.replace('드랍 · ','')+' 처치';if(s.k===4)return s.label.replace(/ · 경매장 거래$/,'')+' (경매장)';if(s.k===5)return s.label.replace('상인 · ','상인 ');return s.label}).filter(Boolean).join(' / ')}
function itIcon(it,cls){return it&&(it.ic||it.icUrl)?'<span class="ic '+(cls||'')+' q-'+it.q+'" style="background-image:url('+(it.icUrl||ICO(it.ic))+')"></span>':'<span class="ic empty '+(cls||'')+'">–</span>'}
function itName(it){return '<span class="q'+it.q+'">'+esc(it.nm)+'</span>'}
function itMeta(it){return esc((SL_KO[it.sl]||it.sl)+(CS_KO[it.cs]&&!['4.0',''].includes(it.cs)?' · '+CS_KO[it.cs]:'')+' · Lv '+it.lv+(it.est?'?':''))}

function bossNo(d,boss){const i=d.bosses.findIndex(b=>b.nm===boss);return i>=0?i+1:null}
function findZoneQuest(name){for(const k of [RACE_START[(me()||{}).race]||'dwarf-gnome',...Object.keys(ROUTE)])for(const S of ROUTE[k]||[])for(const q of S.q)if(q.nm===name)return {q,S};return null}
function findDgQuestByReward(id){for(const d of DGS)for(const q of d.q)if(q.rw.includes(id))return {d,q};return null}
function infoBtn(it){return '<button class="ib" data-a="info" data-k="'+it.id+'" aria-label="어디서 얻는지 보기">ⓘ</button>'}
function infoSheet(c,id){const it=IT.get(+id);if(!it)return '';const b=bestSlot(it,c);const cur=b?eqIt(c,b.s):null;
  let h='<div class="sh"><h2>'+itName(it)+'</h2><button class="x" data-a="close">✕</button></div>';
  h+='<div class="row" style="border:0">'+itIcon(it,'lg')+'<span class="m"><span class="sub">'+itMeta(it)+'</span>'+statLine(it)+(usable(it,c)?'':'<span class="sub" style="color:var(--bad)">내 직업은 못 써요</span>')+'</span>'+(b?'<span class="r">'+gainTag(b.g,b.base,b.empty)+'</span>':'')+'</div>';
  if(b&&usable(it,c))h+='<p class="note">'+SLOT_KO[b.s]+' 칸에 끼면 (지금: '+(cur?esc(cur.nm):'비어 있음')+')</p>'+statChange(c,b.s,it);
  h+='<h3>어디서 얻나요</h3>';
  const parts=[];const seen=new Set();
  const dq=findDgQuestByReward(it.id);
  if(dq){seen.add('dq');const q=dq.q,d=dq.d;parts.push('<div class="src"><b>📜 던전 퀘스트 보상</b><div class="nm">「'+esc(q.nm)+'」 <span class="lvb '+lvCls(q.lv,c.lv)+'">'+q.lv+'</span></div><div class="obj">'+esc(q.obj)+'</div><div class="sub">'+esc(startTxt(q.start))+' · '+q.min+'레벨부터'+(q.pre?' · 앞 퀘스트 먼저':'')+'</div><div class="sub">던전: '+esc(d.ko)+' ('+esc(d.loc)+' · 권장 '+d.lo+'–'+d.hi+')'+(q.boss.length?' · 목표: '+q.boss.map(x=>esc(x.replace(/^(\d+) /,'$1번 '))).join(', '):'')+'</div>'+(q.choose&&q.rw.length>1?'<div class="sub">보상 '+q.rw.length+'개 중 하나를 골라요</div>':'')+'<button class="btn sm" data-a="dgo" data-k="'+d.slug+'">던전 보기</button></div>')}
  for(const i of it.src){const s=SRC[i];if(!s)continue;
    if(s.k===0){const d=DG[s.dg];const n=d?bossNo(d,s.boss):null;parts.push('<div class="src"><b>🏰 던전 보스 드랍</b><div class="nm">'+esc(d?d.ko:s.dn)+(n?' · '+n+'번째 보스':'')+' 「'+esc(s.boss)+'」</div>'+(d?'<div class="sub">'+esc(d.loc)+' · 권장 레벨 '+d.lo+'–'+d.hi+(d.bosses.length?' · 보스 '+d.bosses.length+'마리 중 '+(n||'?')+'번째':'')+'</div><button class="btn sm" data-a="dgo" data-k="'+d.slug+'">던전 보기</button>':'')+'</div>')}
    else if(s.k===1){const m=s.qn.match(/^(.+?) · 퀘스트 보상$/);if(m){if(seen.has('dq'))continue;const d=DGS.find(x=>x.ko===m[1]);parts.push('<div class="src"><b>📜 던전 퀘스트 보상</b><div class="nm">'+esc(m[1])+' 퀘스트 중 하나</div>'+(d?'<button class="btn sm" data-a="dgo" data-k="'+d.slug+'">던전 퀘스트 보기</button>':'')+'</div>');continue}
      const f=findZoneQuest(s.qn);if(f){const q=f.q;const z=q.gz||q.sz;parts.push('<div class="src"><b>📜 퀘스트 보상</b><div class="nm">「'+esc(q.nm)+'」 <span class="lvb '+lvCls(q.lv,c.lv)+'">'+q.lv+'</span></div>'+(q.obj?'<div class="obj">'+esc(q.obj)+'</div>':'')+'<div class="sub">'+esc(z)+' '+contTag(z)+'</div><div class="sub">'+(q.gv?esc(q.gv)+(q.xy?' ('+esc(q.xy.replace(',',', '))+')':''):'아이템을 줍거나 필드에서 시작')+' · '+q.min+'레벨부터'+(q.pre?' · 앞 퀘스트 '+q.pre+'개 먼저':'')+(q.ch?' · 연계 '+q.ch+'개 이어짐':'')+'</div><button class="btn sm" data-a="goz" data-k="'+esc(z)+'">이 지역 퀘스트 보기</button></div>')}
      else parts.push('<div class="src"><b>📜 퀘스트 보상</b><div class="nm">「'+esc(s.qn)+'」</div><div class="sub">레벨링 경로에 없는 퀘스트예요. <a href="https://www.wowhead.com/forever/ko/'+esc(s.href.replace('wh:','').replace('=','='))+'" target="_blank" rel="noopener">와우헤드에서 보기 ↗</a></div></div>')}
    else if(s.k===3)parts.push('<div class="src"><b>⚔️ 몹 드랍</b><div class="nm">'+esc(s.label.replace('드랍 · ',''))+'</div><div class="sub">이 몹을 잡으면 낮은 확률로 나와요.</div></div>');
    else if(s.k===2)parts.push('<div class="src"><b>🎲 월드 드랍</b><div class="sub">레벨 맞는 필드 몹에게서 무작위로 나와요. 경매장에서 사는 게 빨라요.</div></div>');
    else if(s.k===4)parts.push('<div class="src"><b>🔨 제작</b><div class="nm">'+esc(s.label.replace(/^제작 · /,''))+'</div><div class="sub">전문기술로 만들거나 경매장에서 사요.</div></div>');
    else if(s.k===5)parts.push('<div class="src"><b>🪙 상인 판매</b><div class="nm">'+esc(s.label.replace(/^상인 · /,''))+'</div></div>');
    else parts.push('<div class="src">'+esc(s.label)+'</div>')}
  h+=parts.length?parts.join(''):'<p class="note">출처 정보가 없어요.</p>';
  if(it.arm)h+='<p class="note">전투정보실에서 가져온 장비예요.</p>';
  return h+'<p class="note"><a href="https://www.wowhead.com/forever/ko/item='+it.id+'" target="_blank" rel="noopener">와우헤드에서 자세히 ↗</a></p>'}

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
  const ak=Object.keys(ARM).filter(k=>ARM[k]&&ARM[k].gear);
  if(ak.length)h+='<div class="step card"><div class="q">⚔️ 전투정보실에서 불러오기</div><p class="note">명단에 있으면 누르기만 하면 종족·직업·레벨·장비가 채워져요. 전문화만 골라 주세요.</p><div class="chips" style="flex-wrap:wrap">'+ak.map(k=>'<button class="chip'+(d.arm===k?' on':'')+'" data-a="onb-arm" data-k="'+esc(k)+'">'+esc(ARM[k].name)+' <span class="n">Lv'+(ARM[k].level||'?')+' '+esc(ARM[k].clsName||'')+'</span></button>').join('')+'</div></div>';
  h+='<div class="step"><div class="q"><span>1</span>캐릭터 이름 <small class="mute">(안 써도 돼요)</small></div><input class="inp" maxlength="12" placeholder="예: 용현사제" value="'+esc(d.name)+'" data-c="onb-name"></div>';
  h+='<div class="step"><div class="q"><span>2</span>종족</div><div class="grid2">'+RACES.map(r=>'<button class="pick'+(d.race===r[0]?' on':'')+'" data-a="onb-race" data-k="'+r[0]+'"><span class="ic sm" style="background-image:url('+ICO(r[2])+')"></span>'+r[1]+'</button>').join('')+'</div><p class="note">종족에 따라 1~11레벨 시작 지역(엘윈 숲 · 던 모로 · 텔드랏실 · 제프라스 섬) 퀘스트가 달라지고, 고를 수 있는 직업도 달라요.</p></div>';
  const okc=d.race?RACE_CLS[d.race]:CL;h+='<div class="step"><div class="q"><span>3</span>직업</div><div class="grid3">'+CL.map(k=>{const ok=okc.includes(k);return '<button class="pick'+(d.cls===k?' on':'')+'"'+(ok?' data-a="onb-cls" data-k="'+k+'"':' disabled style="opacity:.3"')+'>'+clsIcon(k)+'<span style="color:'+CINFO[k][1]+'">'+CINFO[k][0]+'</span>'+(ok?'':'<small>이 종족 불가</small>')+'</button>'}).join('')+'</div></div>';
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
function upRow(c,x){const cur=eqIt(c,x.slot);return '<div class="row tap" data-a="gopanel" data-k="'+x.slot+'">'+itIcon(x.it)+'<span class="m"><span class="sub">'+SLOT_KO[x.slot]+(cur?' · 지금: '+esc(cur.nm):'')+'</span><span class="nm">'+itName(x.it)+'</span>'+diffHtml(x.it,cur,c)+'<span class="sub">'+esc(srcTxt(x.it,1))+' · '+(x.it.ob>x.it.lv?x.it.ob+'레벨쯤 얻음':'Lv '+x.it.lv)+'</span></span><span class="r">'+gainTag(x.g,x.base,x.empty)+'<br>'+infoBtn(x.it)+'</span></div>'}

/* ===================== 장비 (전투정보실 모양) ===================== */
const DOLL_L=['head','neck','shoulder','back','chest','wrist'],DOLL_R=['hands','waist','legs','feet','ring1','ring2','trink1','trink2'],DOLL_B=['main','off','ranged'];
const HEALER_NOTE={paladin:1,shaman:1,druid:1};
function offLocked(c,s){return s==='off'&&eqIt(c,'main')&&eqIt(c,'main').sl==='2h'}
function bestFor(c,slot,L,mode){const w=wOf(c);const cur=eqIt(c,slot);const other=slot==='ring1'?'ring2':slot==='ring2'?'ring1':slot==='trink1'?'trink2':slot==='trink2'?'trink1':null;const skip=other&&c.eq[other];
  const base=slot==='main'?sc(cur,'main',w):sc(cur,slot,w);
  return cands(c,slot,L,mode).filter(x=>x.it.id!==(cur&&cur.id)&&x.it.id!==skip).map(x=>{const b=slot==='main'&&x.it.sl==='2h'?sc(cur,'main',w)+sc(eqIt(c,'off'),'off',w):base;return {it:x.it,s:x.s,g:x.s-b,base:b}}).filter(x=>x.g>.01).sort((a,b)=>b.g-a.g)}
function dollCell(c,s,ups){const it=eqIt(c,s);const sel=ui.gslot===s;const lock=offLocked(c,s);
  return '<button class="dc'+(sel?' sel':'')+(it?'':' empty')+'" data-a="gsel" data-k="'+s+'"'+(lock?' disabled':'')+' aria-label="'+SLOT_KO[s]+(it?' '+esc(it.nm):' 비어 있음')+'">'
   +(it?'<span class="ic lg q-'+it.q+'" style="background-image:url('+(it.icUrl||ICO(it.ic))+')"></span>':'<span class="ic lg empty">'+(lock?'2H':SLOT_KO[s].replace(/ \d/,''))+'</span>')
   +(ups.has(s)?'<span class="up">▲</span>':'')+'</button>'}
function statTotals(c,extra,minus,slotOf){const tot={};SLOTS.forEach(([s])=>{let it=eqIt(c,s);if(slotOf&&s===slotOf)it=extra;if(slotOf==='main'&&extra&&extra.sl==='2h'&&s==='off')it=null;if(it)for(const k in it.st){if(k==='dps'||k==='armor')continue;tot[k]=(tot[k]||0)+it.st[k]}});return tot}
function gear(c){const L=c.lv,w=wOf(c);const C=CINFO[c.cls];const sp=specOf(c);
  const ups=new Set(SLOTS.map(x=>x[0]).filter(s=>!offLocked(c,s)&&bestFor(c,s,L,ui.ifil).length));
  const tot=statTotals(c);const keys=Object.entries(w).filter(([k,v])=>STAT_KO[k]&&k!=='armor'&&k!=='dps'&&k!=='rdps'&&v>=.2).sort((a,b)=>b[1]-a[1]).map(([k])=>k).slice(0,6);
  let h='<div class="wrap"><div class="armory"><div class="acol">'+DOLL_L.map(s=>dollCell(c,s,ups)).join('')+'</div>'
   +'<div class="amid"><span class="ic xl" style="background-image:url('+ICO('classicon_'+c.cls)+')"></span><b style="color:'+C[1]+'">'+esc(c.name||C[0])+'</b><small>레벨 '+L+' '+esc((sp?sp.name+' ':'')+C[0])+'</small>'
   +'<div class="ast">'+keys.map(k=>'<div><span>'+STAT_KO[k].replace(' 주문력','')+'</span><b>'+Math.round(tot[k]||0)+'</b></div>').join('')+'</div>'
   +'<button class="btn sm ghost" data-a="autofill" style="margin-top:8px">추천으로 빈 칸 채우기</button></div>'
   +'<div class="acol">'+DOLL_R.map(s=>dollCell(c,s,ups)).join('')+'</div></div>'
   +'<div class="abot">'+DOLL_B.map(s=>dollCell(c,s,ups)).join('')+'</div>';
  h+='<p class="note" style="text-align:center">칸을 누르면 아래에 지금 장비와 추천이 나와요. <span style="color:var(--good)">▲</span> = 더 좋은 게 있어요</p>';
  h+='<div class="chips">'+[['ok','던전·퀘스트로 얻는 것만'],['all','경매장·제작 포함']].map(f=>'<button class="chip'+(ui.ifil===f[0]?' on':'')+'" data-a="ifil" data-k="'+f[0]+'">'+f[1]+'</button>').join('')+'</div>';
  if(ui.gslot&&!offLocked(c,ui.gslot))h+=slotPanel(c,ui.gslot);
  else{const U=upgrades(c,L,ui.ifil).slice(0,6);h+='<div class="card"><h3>지금 바꾸면 좋은 것</h3>'+(U.length?U.map(x=>upRow(c,x)).join(''):'<p class="note">지금 레벨에서 더 좋은 장비가 없어요.</p>')+'</div>'}
  /* 능력치 전체 */
  const all=Object.keys(tot).sort((a,b)=>(w[b]||0)-(w[a]||0));
  h+='<div class="card"><h3>능력치 합계 (장비)</h3>'+(all.length?'<div class="stats">'+all.map(k=>'<div><span'+(w[k]?'':' class="mute"')+'>'+STAT_KO[k]+'</span><b>'+Math.round(tot[k])+'</b></div>').join('')+'</div>':'<p class="note">장비를 넣으면 합계가 나와요.</p>')
   +'<p class="note">'+esc(ROLE[c.cls+'/'+c.spec]||'')+' 기준 중요한 순서: '+Object.entries(w).filter(([k])=>STAT_KO[k]&&k!=='armor').sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k])=>k==='dps'?'무기 공격력':STAT_KO[k]).join(' > ')+'</p>'
   +(w.heal&&HEALER_NOTE[c.cls]?'<p class="note">💡 힐러는 레벨업 동안 방어도보다 <b>치유량·지능</b>이 중요해서 천·가죽 옷도 추천에 많이 나와요. 다른 직업과 겹치지 않게 파티에서 미리 얘기해 두세요.</p>':'')+'</div>';
  const soon=upgrades(c,Math.min(60,L+5),ui.ifil,L+1).slice(0,8);
  if(soon.length)h+='<div class="card"><h3>앞으로 5레벨 안에 낄 장비</h3>'+soon.map(x=>upRow(c,x)).join('')+'</div>';
  return h+'</div>'}
function statChange(c,slot,it){const a=statTotals(c),b=statTotals(c,it,null,slot);const w=wOf(c);const ks=new Set([...Object.keys(a),...Object.keys(b)]);const arr=[];
  ks.forEach(k=>{const d=(b[k]||0)-(a[k]||0);if(Math.abs(d)>=.5&&STAT_KO[k])arr.push([k,d])});arr.sort((x,y)=>(w[y[0]]||0)-(w[x[0]]||0));
  return arr.length?'<div class="chg">'+arr.map(([k,d])=>'<span class="'+(d>0?'p':'n')+'">'+STAT_KO[k]+' '+(d>0?'+':'−')+Math.round(Math.abs(d))+' <i>→ '+Math.round(b[k]||0)+'</i></span>').join('')+'</div>':''}
function slotPanel(c,slot){const L=c.lv;const cur=eqIt(c,slot);const best=bestFor(c,slot,L,ui.ifil).slice(0,3);
  let h='<div class="card hl spanel"><div class="hd"><h3>'+SLOT_KO[slot]+'</h3><button class="x" data-a="gsel" data-k="">✕</button></div>';
  h+='<div class="row">'+itIcon(cur)+'<span class="m"><span class="sub">지금 착용</span><span class="nm">'+(cur?itName(cur):'<span class="mute">비어 있음</span>')+'</span>'+(cur?'<span class="sub">'+itMeta(cur)+'</span>'+statLine(cur)+'<span class="sub">'+esc(srcTxt(cur,1))+'</span>':'')+'</span>'+(cur?'<button class="btn sm ghost" data-a="unequip" data-k="'+slot+'">빼기</button>':'')+'</div>';
  h+='<h3>추천 (지금 낄 수 있는 것)</h3>';
  h+=best.length?best.map(x=>'<div class="rec">'+'<div class="row" style="border:0;padding-bottom:2px">'+itIcon(x.it)+'<span class="m"><span class="nm">'+itName(x.it)+'</span><span class="sub">'+itMeta(x.it)+' · '+esc(srcTxt(x.it,1))+'</span></span><span class="r">'+gainTag(x.g,x.base,!cur)+'<br>'+infoBtn(x.it)+'</span></div>'+statChange(c,slot,x.it)+'<button class="btn sm full" data-a="equip" data-k="'+slot+'" data-id="'+x.it.id+'">이걸로 바꾸기</button></div>').join(''):'<p class="note">지금보다 좋은 게 없어요 👍</p>';
  h+='<button class="btn ghost full" style="margin-top:8px" data-a="slot" data-k="'+slot+'">후보 전체 보기 · 이름으로 찾기</button></div>';
  return h}
function statLine(it){const ks=Object.keys(it.st).filter(k=>STAT_KO[k]&&k!=='armor');return ks.length?'<span class="dif">'+ks.map(k=>STAT_KO[k]+' '+(k==='dps'?it.st[k].toFixed(1):'+'+Math.round(it.st[k]))).join(' · ')+'</span>':''}
function slotSheet(c,slot){const L=c.lv;const cur=eqIt(c,slot);const w=wOf(c);const q=ui.isrch.trim();const srt=ui.gsort||'lv';
  const base=it=>slot==='main'&&it.sl==='2h'?sc(eqIt(c,'main'),'main',w)+sc(eqIt(c,'off'),'off',w):sc(cur,slot,w);
  let list;if(q)list=ITEMS.filter(it=>usable(it,c)&&fits(it,slot,c)&&it.nm.includes(q)).slice(0,40).map(it=>({it,s:sc(it,slot,w)}));
  else list=cands(c,slot,Math.min(60,L+3),ui.ifil);
  list.forEach(x=>{x.g=x.s-base(x.it)});
  const sorter=srt==='lv'?(a,b)=>b.it.ob-a.it.ob||b.it.lv-a.it.lv||b.g-a.g:(a,b)=>b.g-a.g;
  const now=list.filter(x=>x.it.ob<=L).sort(sorter),later=list.filter(x=>x.it.ob>L).sort((a,b)=>a.it.ob-b.it.ob||b.g-a.g);
  let h='<div class="sh"><h2>'+SLOT_KO[slot]+'</h2><button class="x" data-a="close">✕</button></div>';
  h+='<div class="card hl"><div class="row">'+itIcon(cur)+'<span class="m"><span class="sub">지금 착용</span><span class="nm">'+(cur?itName(cur):'<span class="mute">비어 있음</span>')+'</span>'+(cur?'<span class="sub">'+itMeta(cur)+'</span>'+statLine(cur):'')+'</span>'+(cur?'<button class="btn sm ghost" data-a="unequip" data-k="'+slot+'">빼기</button>':'')+'</div></div>';
  h+='<div class="srch"><input class="inp" placeholder="이름으로 찾기 (지금 끼고 있는 장비 넣기)" value="'+esc(ui.isrch)+'" data-c="isrch"></div>';
  h+='<div class="chips">'+[['lv','레벨 높은 순'],['g','좋아지는 순']].map(f=>'<button class="chip'+(srt===f[0]?' on':'')+'" data-a="gsort" data-k="'+f[0]+'">'+f[1]+'</button>').join('')+'</div>';
  const row=x=>{const it=x.it;const lock=it.ob>L;return '<div class="row'+(lock?'" style="opacity:.55':'')+'">'+itIcon(it)+'<span class="m"><span class="nm">'+itName(it)+(it.id===(cur&&cur.id)?' <span class="tag gd">착용 중</span>':'')+'</span><span class="sub">'+itMeta(it)+(it.ob>it.lv?' · '+it.ob+'레벨쯤 얻음':'')+'</span>'+diffHtml(it,cur,c)+'<span class="sub">'+esc(srcTxt(it,2))+'</span></span><span class="r">'+gainTag(x.g,base(it),!cur)+'<br>'+infoBtn(it)+' <button class="btn sm" style="margin-top:6px" data-a="equip" data-k="'+slot+'" data-id="'+it.id+'">착용</button></span></div>'};
  h+='<h3>지금 낄 수 있어요 ('+now.length+')</h3>'+(now.length?now.map(row).join(''):'<p class="note">'+(q?'찾는 장비가 없어요. 이 직업이 못 끼는 장비일 수 있어요.':'후보가 없어요.')+'</p>');
  if(later.length)h+='<h3>곧 낄 수 있어요 (레벨 '+(L+1)+'~'+Math.min(60,L+3)+')</h3>'+later.map(row).join('');
  return h}

/* ===================== 퀘스트 ===================== */
function routeView(c){const L=c.lv;const R=routeOf(c);let prevC=null;const fq=c.fq||{};
  let h='<p class="note">1레벨부터 60레벨까지 <b>어느 대륙의 어느 지역</b>으로 가면 되는지 순서대로예요. 지역을 누르면 그 지역 퀘스트로 가요.</p>';
  h+=R.map(S=>{const zs=S.z.split(' · ');const cs=[...new Set(zs.map(z=>CONT[z]).filter(Boolean))];const now=L>=S.a&&L<=S.b;const past=L>S.b;
    let move='';if(prevC&&cs.length&&!cs.includes(prevC)&&cs.every(x=>x!=='제프라스 섬'))move='<div class="mv">⛵ '+BOAT+'</div>';prevC=cs[cs.length-1]||prevC;
    const cnt=z=>{const qs=S.q.filter(q=>(q.gz||q.sz)===z);return [qs.length,qs.filter(q=>fq[z+'|'+q.nm]).length]};
    return move+'<div class="rt'+(now?' now':past?' past':'')+'"><div class="rl"><span class="lvb '+(now?'lv-y':past?'lv-x':'')+'">'+S.a+'–'+S.b+'</span>'+(now?'<span class="tag gd">지금</span>':'')+'</div><div class="m">'+zs.map(z=>{const [n,d]=cnt(z);return '<button class="zr" data-a="goz" data-k="'+esc(z)+'"><b>'+esc(z)+'</b> '+contTag(z)+'<span class="sub">퀘스트 '+n+'개'+(d?' · '+d+'개 끝냄':'')+'</span></button>'}).join('')+'</div></div>'}).join('');
  h+='<p class="note">⛵ 배 타는 곳: '+BOAT+'</p>';
  return h}
function quest(c){const L=c.lv;const qm=ui.qmode||'route';let h='<div class="wrap"><h2>퀘스트</h2><div class="chips">'+[['route','레벨링 루트'],['zone','지역 퀘스트'],['dg','던전 퀘스트']].map(m=>'<button class="chip'+(qm===m[0]?' on':'')+'" data-a="qmode" data-k="'+m[0]+'">'+m[1]+'</button>').join('')+'</div>';
  if(qm==='route')return h+routeView(c)+'</div>';
  if(qm==='dg')return h+dqView(c)+'</div>';
  const Z=zonesNow(c);
  if(ui.qz&&!Z.find(x=>x.z===ui.qz)){const qs=[];const seen=new Set();for(const S of routeOf(c))for(const q of S.q)if((q.gz||q.sz)===ui.qz&&!seen.has(q.nm)){seen.add(q.nm);qs.push(q)}if(qs.length)Z.unshift({z:ui.qz,q:qs,left:qs.filter(q=>!(c.fq||{})[ui.qz+'|'+q.nm]).length,all:1})}
  if(!Z.length)return h+'<p class="empty-st">레벨 '+L+'에 맞는 퀘스트가 없어요.</p></div>';
  const z=Z.find(x=>x.z===ui.qz)||Z[0];const fq=c.fq||{};
  h+='<p class="note">레벨 '+L+'에 받을 수 있고 경험치가 괜찮은 퀘스트예요. 지역을 고르면 <b>퀘스트 주는 마을(거점)별로</b> 묶어서 보여 줘요.</p>';
  h+='<div class="chips">'+Z.map(x=>'<button class="chip'+(x===z?' on':'')+'" data-a="qz" data-k="'+esc(x.z)+'">'+esc(x.z)+'<span class="n">'+x.left+'</span></button>').join('')+'</div>';
  {const secs=routeOf(c).filter(S=>S.z.split(' · ').includes(z.z));const lo=secs.length?Math.min(...secs.map(S=>S.a)):'',hi=secs.length?Math.max(...secs.map(S=>S.b)):'';
   h+='<div class="zh"><b>'+esc(z.z)+'</b> '+contTag(z.z)+(lo?'<span class="sub">레벨링 루트에서 '+lo+'–'+hi+'레벨 구간 · <button class="more" data-a="qmode" data-k="route">전체 루트 보기 ›</button></span>':'')+'</div>'}
  const G={};z.q.forEach(q=>{const [hn,hi]=qHub(z.z,q);(G[hn]=G[hn]||{n:hn,i:hi,q:[]}).q.push(q)});
  const hubs=Object.values(G).sort((a,b)=>(a.i>=97)-(b.i>=97)||Math.min(...a.q.map(q=>q.lv))-Math.min(...b.q.map(q=>q.lv)));let n=0;
  h+=hubs.map(H=>{const todo=H.q.filter(q=>!fq[z.z+'|'+q.nm]).sort((a,b)=>a.lv-b.lv),done=H.q.filter(q=>fq[z.z+'|'+q.nm]);const real=H.i<97;if(real)n++;
    return '<div class="card"><h3 class="hubh">'+(real?'<span class="no">'+n+'</span>':'')+esc(H.n)+' <span class="mute" style="font-weight:400;font-size:13px">· '+todo.length+'개</span></h3>'+(todo.length?todo.map(q=>qRow(c,z.z,q)).join(''):'<p class="note">다 끝냈어요 👍</p>')
     +(done.length?'<details class="fold"><summary>끝낸 퀘스트 '+done.length+'개</summary>'+done.map(q=>qRow(c,z.z,q)).join('')+'</details>':'')+'</div>'}).join('');
  h+='<p class="note">퀘스트 레벨 색: <span class="lvb lv-r" style="min-width:24px;height:18px">빨</span> 어려움 · <span class="lvb lv-y" style="min-width:24px;height:18px">노</span> 적당 · <span class="lvb lv-g" style="min-width:24px;height:18px">초</span> 쉬움. <span class="tag lk">연계</span>는 끝내면 다음 퀘스트가 이어지고, <span class="tag pre">앞 퀘스트 먼저</span>는 앞 단계를 끝내야 받을 수 있어요.</p>';
  return h+'</div>'}
/* 펼치는 퀘스트 한 줄: 접혀 있을 땐 [레벨] 이름만, 누르면 할 일·위치·연계·보상 */
function qFold(o){const open=ui.qopen===o.key;
  return '<details class="qf'+(o.done?' done':'')+(o.lock?' lock':'')+'"'+(open?' open':'')+' data-k="'+esc(o.key)+'"><summary><span class="qi">'+(o.done?'✓':'!')+'</span><span class="qn">['+o.lv+'] '+esc(o.nm)+'</span>'
   +(o.side?'<span class="qs">'+o.side+'</span>':'')+'<span class="chev">⌄</span></summary>'
   +'<div class="qb">'+(o.tags||'')+o.body+'<label class="qdone"><input type="checkbox" data-c="'+o.kind+'" data-k="'+esc(o.ck)+'"'+(o.done?' checked':'')+'> 끝냈어요</label></div></details>'}
function qRow(c,z,q){const k=z+'|'+q.nm,d=!!(c.fq||{})[k],L=c.lv,lock=q.min>L;
  const tags=(q.pre?'<span class="tag pre">앞 퀘스트 '+q.pre+'개 먼저</span>':'')+chainTag(q.id,q)+(lock?'<span class="tag">'+q.min+'레벨부터</span>':'');
  const body=(q.obj?'<div class="obj">'+esc(q.obj)+'</div>':'')+'<div class="sub">📍 받는 곳: '+(q.gv?esc(q.gv)+(q.xy?' ('+esc(q.xy.replace(',',', '))+')':''):'아이템을 줍거나 필드에서 시작')+'</div>'+qDetail(q.id,q);
  const isCh=q.ch||(QD.get(q.id)&&QD.get(q.id).cn>1);
  return qFold({key:'f'+k,ck:k,kind:'fq',done:d,lock,lv:q.lv,nm:q.nm,tags,body,side:isCh?'<span class="lk">연계</span>':''})}
function dqView(c){const L=c.lv;const near=DGS.filter(d=>d.q.length&&d.q.some(q=>q.min<=L+2&&q.lv>=L-4)&&d.lo<=L+3);const rest=DGS.filter(d=>d.q.length&&!near.includes(d));
  let h='<p class="note">던전마다 얼라이언스가 받을 수 있는 퀘스트예요. <b>던전 가기 전에</b> 마을에서 미리 받아 두면 한 번에 끝낼 수 있어요.</p>';
  h+=near.length?near.map(d=>dqCard(c,d,true)).join(''):'<p class="empty-st">지금 레벨에 맞는 던전 퀘스트가 없어요.</p>';
  h+='<details class="fold"><summary>다른 던전 퀘스트 모두 보기 ('+rest.length+'곳)</summary>'+rest.map(d=>dqCard(c,d,false)).join('')+'</details>';
  return h}
function dqCard(c,d,open){const dq=c.dq||{};const done=d.q.filter(q=>dq[q.id]).length;
  return '<details class="card"'+(open?' open':'')+'><summary style="cursor:pointer;list-style:none"><div class="hd"><h3 style="margin:0">'+esc(d.ko)+'</h3><span class="mute" style="font-size:12px">'+done+'/'+d.q.length+' · 권장 '+d.lo+'–'+d.hi+'</span></div></summary>'+dqList(c,d)+'<button class="more" data-a="dgo" data-k="'+d.slug+'">던전 보스·드랍 보기 ›</button></details>'}
function dqList(c,d,flat){const L=c.lv;const dq=c.dq||{};
  const outQ=d.q.filter(q=>!/던전 안/.test(q.start)&&q.start),inQ=d.q.filter(q=>/던전 안/.test(q.start)||!q.start);
  const row=q=>{const dn=!!dq[q.id],lock=q.min>L;const rw=q.rw.map(id=>IT.get(id)).filter(Boolean);
    const tags=(q.pre?'<span class="tag pre">앞 퀘스트 먼저</span>':'')+chainTag(q.id,q)+(lock?'<span class="tag">'+q.min+'레벨부터</span>':'');
    const body='<div class="obj">'+esc(q.obj)+'</div>'+(q.boss.length?'<div class="sub">🎯 던전 안 목표: '+q.boss.map(b=>esc(b.replace(/^(\d+) /,'$1번 '))).join(', ')+'</div>':'')
     +'<div class="sub">📍 '+esc(startTxt(q.start))+'</div>'+qDetail(q.id,q)
     +(rw.length?'<div class="rewards">'+(q.choose&&rw.length>1?'<span class="sub" style="width:100%">🎁 보상 중 하나 선택</span>':'<span class="sub" style="width:100%">🎁 보상</span>')+rw.map(it=>'<button class="rw'+(usable(it,c)?' mine':'')+'" data-a="info" data-k="'+it.id+'">'+itIcon(it)+'<span class="q'+it.q+'">'+esc(it.nm)+'</span></button>').join('')+'</div>':'');
    return qFold({key:'d'+q.id,ck:String(q.id),kind:'dq',done:dn,lock,lv:q.lv,nm:q.nm,tags,body,side:q.side==='alliance'?'얼라이언스':''})};
  if(flat)return d.q.map(row).join('');
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
  /* 가기 전 체크: 미리 받을 퀘스트 + 보스별 챙길 것 */
  {const dqd=c.dq||{};const pre=d.q.filter(q=>q.start&&!/던전 안|아이템/.test(q.start)&&!dqd[q.id]&&q.min<=L+1);
   const wantRw=[];d.q.forEach(q=>q.rw.forEach(id=>{const it=IT.get(id);if(it&&usable(it,c)){const bs=bestSlot(it,c);if(bs&&bs.g>.01)wantRw.push({it,bs,q})}}));
   let p='<div class="card hl"><h3>🎒 들어가기 전 체크</h3>';
   p+='<div class="ck"><b>1. 마을에서 미리 받을 퀘스트 '+pre.length+'개</b><p class="note">눌러서 펼치면 받는 곳·할 일·보상이 나와요.</p>'+(pre.length?dqList(c,{q:pre},true):'<div class="sub">없어요 (또는 다 받았어요)</div>')+'</div>';
   p+='<div class="ck"><b>2. 보스별로 챙길 것</b>'+order.map((b,i)=>{const ups=(byBoss[b]||[]).filter(it=>usable(it,c)).map(it=>({it,bs:bestSlot(it,c)})).filter(x=>x.bs&&x.bs.g>.01).sort((x,y)=>y.bs.g-x.bs.g);
      return '<div class="bk"><span class="no">'+(i+1)+'</span><span class="m"><b>'+esc(b)+'</b><span class="sub">'+(ups.length?ups.map(x=>'<button class="pk" data-a="info" data-k="'+x.it.id+'">★ <span class="q'+x.it.q+'">'+esc(x.it.nm)+'</span> <small>'+SLOT_KO[x.bs.s]+'</small></button>').join(''):'<span class="mute">챙길 것 없음</span>')+'</span></span></div>'}).join('')+'</div>';
   if(wantRw.length)p+='<div class="ck"><b>3. 퀘스트 보상으로 받을 것</b>'+wantRw.map(x=>'<div class="sub"><button class="pk" data-a="info" data-k="'+x.it.id+'">★ <span class="q'+x.it.q+'">'+esc(x.it.nm)+'</span></button> ← 「'+esc(x.q.nm)+'」</div>').join('')+'</div>';
   h+=p+'<p class="note">★를 누르면 어떤 장비인지, 얼마나 좋아지는지 보여 줘요.</p></div>'}
  h+='<div class="card"><h3>보스 순서와 드랍 (전체)</h3>'+order.map((b,i)=>{let its=(byBoss[b]||[]);if(mine)its=its.filter(it=>usable(it,c));
     const rows=its.map(it=>{const bs=bestSlot(it,c);const cur=bs?eqIt(c,bs.s):null;return {it,bs,cur}}).sort((x,y)=>((y.bs?y.bs.g:-1)-(x.bs?x.bs.g:-1)));
     return '<div class="boss"><span class="no">'+(i+1)+'</span><b>'+esc(b)+'</b></div>'+(rows.length?rows.map(r=>'<div class="row">'+itIcon(r.it)+'<span class="m"><span class="nm">'+itName(r.it)+'</span><span class="sub">'+itMeta(r.it)+'</span>'+(usable(r.it,c)?diffHtml(r.it,r.cur,c):'<span class="sub">내 직업은 못 써요</span>')+'</span><span class="r">'+(r.bs?gainTag(r.bs.g,r.bs.base,r.bs.empty):'')+'<br>'+infoBtn(r.it)+'</span></div>').join(''):'<p class="note" style="margin:2px 0 0 32px">'+(mine?'내 직업이 쓸 드랍이 없어요.':'드랍 정보가 없어요.')+'</p>')}).join('')+'</div>';
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
    h+='<div class="card">'+armBox(c)+'</div>';
    h+='<button class="btn danger full" style="margin-top:14px" data-a="del">'+(ui.delAsk?'정말 지울까요? 한 번 더 누르면 지워져요':'이 캐릭터 지우기')+'</button>'}
  return h}

/* ===================== 그리기 ===================== */
function render(){const app=$('#app');const c=me();
  if(ui.onb||!c){if(!ui.onb)ui.onb={name:'',race:'',cls:'',spec:'',lv:1};app.innerHTML=onboard();return}
  let v='';if(ui.tab==='home')v=home(c);else if(ui.tab==='gear')v=gear(c);else if(ui.tab==='quest')v=quest(c);else if(ui.tab==='dungeon')v=dungeon(c);else v=klass(c);
  app.innerHTML=topBar(c)+v+'<p class="foot">자료: <a href="https://forg.gg/forever" target="_blank" rel="noopener">forg.gg</a> (와우헤드 포에버·Questie 정리) · 입력한 내용은 이 기기에만 저장돼요</p>'+tabs()
    +(ui.sheet?'<div class="sheet-bg" data-a="bg"><div class="sheet"><div class="grab"></div>'+(ui.sheet==='chars'?charsSheet():ui.sheet.startsWith('info:')?infoSheet(c,ui.sheet.slice(5)):slotSheet(c,ui.sheet.slice(5)))+'</div></div>':'')}
function rerender(keepScroll){const y=window.scrollY;const sh=document.querySelector('.sheet');const sy=sh?sh.scrollTop:0;render();if(keepScroll)window.scrollTo(0,y);const s2=document.querySelector('.sheet');if(s2&&keepScroll)s2.scrollTop=sy}
function setLv(c,v){v=Math.max(1,Math.min(60,parseInt(v,10)||c.lv));if(v!==c.lv){c.lv=v;save()}}

/* ===================== 이벤트 ===================== */
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,k=b.dataset.k;const c=me();
  if(a==='bg'){if(e.target===b){ui.sheet=null;ui.delAsk=0;rerender(true)}return}
  if(a==='close'){ui.sheet=null;ui.delAsk=0;rerender(true);return}
  /* 시작 화면 */
  const o=ui.onb;
  if(a==='onb-race'){o.race=k;if(o.cls&&!RACE_CLS[k].includes(o.cls)){o.cls='';o.spec=''}rerender(true);return}
  if(a==='onb-cls'){o.cls=k;o.spec='';rerender(true);return}
  if(a==='onb-spec'){o.spec=k;rerender(true);return}
  if(a==='onb-lv-'||a==='onb-lv+'){o.lv=Math.max(1,Math.min(60,(+o.lv||1)+(a==='onb-lv+'?1:-1)));rerender(true);return}
  if(a==='onb-x'){ui.onb=null;rerender();return}
  if(a==='onb-arm'){const A=ARM[k];if(A){o.arm=k;o.name=A.name;o.race=armRace(A.race);if(CL.includes(A.cls)){o.cls=A.cls;o.spec=''}o.lv=A.level||o.lv}rerender(true);return}
  if(a==='onb-go'){if(!(o.race&&o.cls&&o.spec))return;const n={id:newId(),name:(o.name||'').trim(),race:o.race,cls:o.cls,spec:o.spec,lv:Math.max(1,Math.min(60,+o.lv||1)),eq:{},fq:{},dq:{}};DB.list.push(n);DB.cur=n.id;if(o.arm){n.arm=o.arm;armApply(n,true);n.spec=o.spec}save();ui.onb=null;ui.tab='home';ui.sheet=null;render();window.scrollTo(0,0);toast('캐릭터를 만들었어요');return}
  if(!c)return;
  if(a==='tab'){ui.tab=k;ui.dg=null;render();window.scrollTo(0,0);return}
  if(a==='lv-'||a==='lv+'){setLv(c,c.lv+(a==='lv+'?1:-1));rerender(true);return}
  if(a==='chars'){ui.sheet='chars';rerender(true);return}
  if(a==='pick'){DB.cur=k;save();ui.sheet=null;ui.dg=null;ui.qz=null;render();window.scrollTo(0,0);toast('캐릭터를 바꿨어요');return}
  if(a==='add'){ui.sheet=null;ui.onb={name:'',race:c.race,cls:'',spec:'',lv:1};render();window.scrollTo(0,0);return}
  if(a==='del'){if(!ui.delAsk){ui.delAsk=1;rerender(true);return}DB.list=DB.list.filter(x=>x.id!==c.id);DB.cur=DB.list[0]?DB.list[0].id:null;save();ui.delAsk=0;ui.sheet=null;render();toast('지웠어요');return}
  if(a==='crace'){c.race=k;save();rerender(true);return}
  if(a==='armlink'){c.arm=k;armApply(c);rerender(true);return}
  if(a==='armnow'){armApply(c);rerender(true);return}
  if(a==='armoff'){delete c.arm;save();rerender(true);return}
  if(a==='ccls'){if(c.cls!==k){c.cls=k;c.spec=D_CLS[k].specs[0].id;c.eq={};save()}rerender(true);return}
  if(a==='spec'){c.spec=k;save();rerender(true);return}
  if(a==='csec'){ui.csec=k;rerender(true);return}
  if(a==='goc'){ui.tab='class';ui.csec=k;render();window.scrollTo(0,0);return}
  if(a==='pf'){ui.pf=k;rerender(true);return}
  if(a==='qmode'){ui.qmode=k;rerender(true);return}
  if(a==='qz'){ui.qz=k;rerender(true);return}
  if(a==='goz'){ui.tab='quest';ui.qmode='zone';ui.qz=k;ui.sheet=null;render();window.scrollTo(0,0);return}
  if(a==='dgo'){ui.tab='dungeon';ui.dg=k;ui.sheet=null;render();window.scrollTo(0,0);return}
  if(a==='dgback'){ui.dg=null;render();window.scrollTo(0,0);return}
  if(a==='dgf'){ui.dgf=k;rerender(true);return}
  if(a==='ifil'){ui.ifil=k;rerender(true);return}
  if(a==='slot'){ui.sheet='slot:'+k;ui.isrch='';rerender(true);return}
  if(a==='gsel'){ui.gslot=k||null;rerender(true);if(k){const p=document.querySelector('.spanel');if(p&&p.getBoundingClientRect().top>window.innerHeight-120)p.scrollIntoView({behavior:'smooth',block:'start'})}return}
  if(a==='gopanel'){ui.tab='gear';ui.gslot=k;render();const p=document.querySelector('.spanel');if(p)p.scrollIntoView({block:'start'});return}
  if(a==='info'){ui.sheet='info:'+k;rerender(true);const sh=document.querySelector('.sheet');if(sh)sh.scrollTop=0;return}
  if(a==='gsort'){ui.gsort=k;rerender(true);return}
  if(a==='autofill'){let n=0;for(const [s] of SLOTS){if(c.eq[s]||offLocked(c,s))continue;const b=bestFor(c,s,c.lv,ui.ifil)[0];if(b){c.eq[s]=b.it.id;n++;if(s==='main'&&b.it.sl==='2h')delete c.eq.off}}save();rerender(true);toast(n?n+'칸을 추천 장비로 채웠어요':'채울 빈 칸이 없어요');return}
  if(a==='equip'){const id=+b.dataset.id;const it=IT.get(id);c.eq=c.eq||{};c.eq[k]=id;if(k==='main'&&it&&it.sl==='2h')delete c.eq.off;save();ui.sheet=null;rerender(true);toast(it.nm+' 착용');return}
  if(a==='unequip'){delete c.eq[k];save();rerender(true);return}
});
document.addEventListener('toggle',e=>{const t=e.target;if(t.classList&&t.classList.contains('qf')){if(t.open)ui.qopen=t.dataset.k;else if(ui.qopen===t.dataset.k)ui.qopen=null}},true);
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
