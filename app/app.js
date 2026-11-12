'use strict';
/* ===================== 기본 자료 ===================== */
const CL=['warrior','paladin','hunter','rogue','priest','shaman','mage','warlock','druid'];
const CINFO={warrior:['전사','#C79C6E'],paladin:['성기사','#F58CBA'],hunter:['사냥꾼','#ABD473'],rogue:['도적','#FFF569'],priest:['사제','#FFFFFF'],shaman:['주술사','#2a8cff'],mage:['마법사','#69CCF0'],warlock:['흑마법사','#9482C9'],druid:['드루이드','#FF7D0A']};
const RACES=[['human','인간','achievement_character_human_male'],['dwarf','드워프','achievement_character_dwarf_male'],['gnome','노움','achievement_character_gnome_male'],['nightelf','나이트엘프','achievement_character_nightelf_male'],['skyborne','고등 마법원 스카이본','spell_nature_cyclone']];
const RACE_START={human:'human',dwarf:'dwarf-gnome',gnome:'dwarf-gnome',nightelf:'nightelf',skyborne:'skyborne-alliance'};
/* 종족별 가능한 직업 (forg.gg 종족 페이지) */
const RACE_CLS={human:['warrior','paladin','hunter','rogue','priest','mage','warlock'],dwarf:['warrior','paladin','hunter','rogue','priest','shaman'],nightelf:['warrior','hunter','rogue','priest','druid'],gnome:['warrior','rogue','priest','mage','warlock'],skyborne:['warrior','hunter','rogue','mage','druid']};
const DW=new Set(['warrior','rogue','hunter','shaman']);
const STAT_KO={crit:'치명타 %',hit:'적중 %',scrit:'주문 극대화 %',shit:'주문 적중 %',dodge:'회피 %',parry:'무기 막기 %',blockp:'방패 막기 %',str:'힘',agi:'민첩',sta:'체력',int:'지능',spi:'정신력',sp:'주문력',heal:'치유량',mp5:'5초당 마나',ap:'전투력',dps:'무기 초당 공격력',def:'방어 숙련',block:'방패 막기',armor:'방어도',fire:'화염 주문력',frost:'냉기 주문력',nature:'자연 주문력',shadow:'암흑 주문력',arcane:'비전 주문력',holy:'신성 주문력'};
const SLOTS=[['head','머리',['he']],['neck','목',['ne']],['shoulder','어깨',['sh']],['back','등',['ba']],['chest','가슴',['ch']],['wrist','손목',['wr']],['hands','손',['ha']],['waist','허리',['wa']],['legs','다리',['le']],['feet','발',['fe']],['ring1','반지 1',['fi']],['ring2','반지 2',['fi']],['trink1','장신구 1',['tr']],['trink2','장신구 2',['tr']],['main','주무기',['2h','mh','1h']],['off','보조',['oh','ho','1h']],['ranged','원거리',['ra']]];
const SLOT_KO=Object.fromEntries(SLOTS.map(s=>[s[0],s[1]]));
const SL_KO={he:'머리',ne:'목',sh:'어깨',ba:'등',ch:'가슴',wr:'손목',ha:'손',wa:'허리',le:'다리',fe:'발',fi:'반지',tr:'장신구','2h':'양손 무기',mh:'주장비 무기','1h':'한손 무기',oh:'보조 장비',ho:'보조 손',ra:'원거리'};
const CS_KO={'4.1':'천','4.2':'가죽','4.3':'사슬','4.4':'판금','4.6':'방패','2.0':'한손 도끼','2.1':'양손 도끼','2.2':'활','2.3':'총','2.4':'한손 둔기','2.5':'양손 둔기','2.6':'장창','2.7':'한손 검','2.8':'양손 검','2.10':'지팡이','2.13':'장착 무기','2.15':'단검','2.18':'석궁','2.19':'마법봉','2.20':'낚싯대'};
/* 전문화별 능력치 가중치 (클래식 기준 대략값, 1 = 가장 중요한 능력치) */
const HEAL={heal:1,sp:.15,int:.8,spi:.5,mp5:1.2,sta:.1};
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
const ROLE={};for(const c in W)for(const s in W[c]){const w=W[c][s];ROLE[c+'/'+s]=w.heal?'치유':w.def?'탱커':(w.sp&&!(w.str>=1||w.agi>=1)?'원거리 딜':'근접 딜')}
if(W.hunter)for(const s in W.hunter)ROLE['hunter/'+s]='원거리 딜';
/* 추가효과(%) 가중치: 1% = 주 능력치 몇 점인지 (클래식 EP 표를 레벨업 기준으로 단순화)
   원거리 무기 DPS는 사냥꾼만 크게, 전사·도적은 당기기용이라 거의 안 셈 */
for(const c in W)for(const s in W[c]){const w=W[c][s];const r=ROLE[c+'/'+s];
  if(c==='hunter')Object.assign(w,{crit:10,hit:9});
  else if(r==='근접 딜')Object.assign(w,{crit:10,hit:9,rdps:.05});
  else if(r==='탱커')Object.assign(w,{dodge:12,parry:10,blockp:6,hit:4,crit:3,rdps:.03});
  else if(r==='치유')Object.assign(w,{scrit:6,rdps:Math.min(w.rdps||.35,.35)});
  else Object.assign(w,{scrit:9,shit:8,crit:c==='druid'&&s.startsWith('feral')?10:0})}
if(W.druid){Object.assign(W.druid['feral-cat'],{crit:10,hit:9});Object.assign(W.druid['feral-bear'],{dodge:12,hit:4,crit:3})}
/* 특성별 세부: 도적은 쌍수라 적중이 1순위, 무기 DPS 비중도 큼 / 무기 전사는 양손 무기 DPS·치명타 */

const WHY={rogue:'주무기 DPS가 딜을 가장 크게 정해요. 적중·치명타 1%는 민첩 10~12점만큼이에요. 원거리는 당기기용이라 점수에 안 넣어요.',
  warrior:{arms:'양손 무기 DPS가 딜을 정해요. 적중 1%는 힘 19점, 치명타 1%는 힘 15점만큼이에요.',fury:'주무기 DPS 다음으로 치명타(힘 17점)·적중(힘 14점)이 커요.',protection:'체력·방어 숙련·회피로 덜 맞는 게 먼저예요.'},
  hunter:'원거리 무기 DPS가 딜 대부분이에요. 그다음 민첩·적중.',priest:{discipline:'치유량·지능·정신력 순이에요. 마법봉은 레벨업 사냥용이에요.',holy:'치유량·정신력·지능 순이에요. 마법봉은 레벨업 사냥용이에요.','shadow-magic':'주문력·암흑 주문력·주문 적중 순이에요. 마법봉은 마나 아끼는 용도예요.'},
  mage:'주문력과 지능이 중심이에요. 마법봉은 마나 아끼는 용도예요.',warlock:'주문력과 체력(생명력 전환)이 중요해요.',
  paladin:{holy:'치유량·지능·5초당 마나 순이에요.',protection:'체력·방어 숙련·방패 막기 순이에요.',retribution:'양손 무기 DPS·힘·치명타 순이에요.'},
  shaman:{'elemental-combat':'주문력·지능·주문 극대화 순이에요.',enhancement:'양손 무기 DPS·힘·민첩 순이에요.',restoration:'치유량·5초당 마나·지능 순이에요.'},
  druid:{balance:'주문력·지능 순이에요.','feral-cat':'포에버에서는 표범도 무기 DPS가 점수에 들어가요. 민첩·힘·치명타 순이에요.','feral-bear':'체력·민첩·방어 숙련 순이에요.',restoration:'치유량·정신력·지능 순이에요.'}};
/* ===== 점수 공식 = forg.gg와 같은 틀 =====
   1) 기본 가중치: forg.gg 장비 추천 기본표(역할별)
   2) 시뮬이 있는 특성은 포에버 시뮬레이터(wowsims/forever, 60레벨) 값으로 덮음 — 무기 DPS·적중·치명타 1% 가치 포함
   3) 탱커는 시뮬이 딜 기준이라 생존 능력치(forg 탱커 표)를 쓰고 적중·치명타만 조금 더함 */
const FB={str:{str:1,agi:.6,ap:.5,sta:.25},agi:{agi:1,str:.5,ap:.5,sta:.2},tank:{str:1,agi:.6,ap:.5,sta:.6,def:.4,armor:.01,block:.2},heal:{heal:1,int:.6,spi:.5,mp5:1.5,sta:.1,dpsWand:.5},cast:{sp:1,int:.5,spi:.3,sta:.15,dpsWand:1},ranged:{agi:1,ap:.4,int:.3,sta:.2,dpsRanged:2.5}};
const FL={dpsMain:1.5,dpsOff:.75};
const FS={warrior:{arms:['str',{dps2h:2}],fury:['str',FL],protection:['tank',{dps1h:1.2}]},paladin:{holy:['heal'],protection:['tank',{str:.6,agi:.3,sp:1.2,int:.5,sta:.8,def:.6,armor:.015,block:.3,dps1h:.6}],retribution:['str',{agi:.5,int:.2,sta:.2,dps2h:2}]},
  hunter:{'beast-mastery':['ranged'],marksmanship:['ranged'],survival:['ranged']},rogue:{assassination:['agi',FL],combat:['agi',FL],subtlety:['agi',FL]},
  priest:{discipline:['heal'],holy:['heal'],'shadow-magic':['cast',{shadow:.9}]},shaman:{'elemental-combat':['cast',{spi:.1,mp5:1,nature:.6,fire:.4}],enhancement:['str',{agi:.5,int:.2,sta:.2,dps2h:2}],restoration:['heal',{spi:.2}]},
  mage:{arcane:['cast',{arcane:.9}],fire:['cast',{fire:1}],frost:['cast',{frost:.8}]},warlock:{affliction:['cast',{sta:.3,shadow:.9}],demonology:['cast',{sta:.3,shadow:.8,fire:.2}],destruction:['cast',{sta:.3,shadow:.7,fire:.3}]},
  druid:{balance:['cast',{dpsWand:0,nature:.5,arcane:.5}],'feral-cat':['str',{agi:.8,dps2h:2}],'feral-bear':[null,{str:1,agi:.8,ap:.5,sta:.5,armor:.02,def:.4,dps2h:2}],restoration:['heal',{dpsWand:0}]}};
const WSRC={};
for(const c in FS)for(const s in FS[c]){if(!W[c]||!W[c][s])continue;const [b,ex]=FS[c][s];let w=Object.assign({},b?FB[b]:{},ex||{});const role=b==='tank'||s==='feral-bear'?'tank':b==='heal'?'heal':b==='cast'?'cast':'phys';
  const sim=(typeof D_SIMW!=='undefined'&&D_SIMW.specs||{})[c+'/'+s];let src='forg 기본표';
  if(sim&&role!=='tank'){const keep={sta:w.sta||0};w=Object.assign({},sim.weights,keep);const u=sim.unscored||{};
    if(role==='cast'){w.scrit=u.crit||0;w.shit=u.hit||0}else{w.crit=u.crit||0;w.hit=u.hit||0}src='포에버 시뮬레이터 ('+sim.preset+')'}
  else if(role==='tank'){const u=sim&&sim.unscored||{};Object.assign(w,{dodge:12,hit:(u.hit||14)*.4,crit:(u.crit||12)*.25});if(s!=='feral-bear')Object.assign(w,{parry:10,blockp:6})}
  else if(role==='heal')w.scrit=6;
  else if(role==='cast')Object.assign(w,{scrit:10,shit:15});
  else Object.assign(w,{crit:13,hit:15});
  /* 화면 표시·예전 계산용 */
  w.dps=w.dpsMain??w.dps2h??w.dps1h??0;w.rdps=w.dpsRanged??w.dpsWand??0;
  W[c][s]=w;WSRC[c+'/'+s]=src}
function dpsW(it,slot,w){if(slot==='ranged')return it.cs==='2.19'?(w.dpsWand??0):(w.dpsRanged??0);
  if(slot==='off')return w.dpsOff??((w.dpsMain??w.dps1h??0)*.35);
  if(it.sl==='2h')return w.dps2h??w.dpsMain??w.dps1h??0;
  return w.dpsMain??w.dps1h??(w.dps2h!=null?w.dps2h*.6:0)}
function whyOf(c){if(c.gmode==='solo'&&SOLO[c.cls]&&(W[c.cls]||{})[c.spec]&&W[c.cls][c.spec].heal)return {priest:'사냥용: 마법봉 DPS와 주문력·지능·정신력을 봐요. 힐 템보다 딜 템이 위로 와요.',paladin:'사냥용: 양손 무기 DPS와 힘을 봐요. 신성 성기사도 레벨업은 근접으로 해요.',shaman:'사냥용: 무기 DPS·힘과 주문력을 함께 봐요.',druid:'사냥용: 주문력·지능을 봐요(조화처럼 사냥).'}[c.cls];const v=WHY[c.cls];return typeof v==='string'?v:(v&&v[c.spec])||''}
function prioLine(c){const w=wOf(c);const nm=k=>k==='dps'?'무기 DPS':k==='rdps'?'원거리 DPS':/crit|hit|dodge|parry|blockp/.test(k)?STAT_KO[k].replace(' %',' %'):STAT_KO[k];
  /* %·DPS는 1당 값이 커서, '장비 한 칸에서 흔히 붙는 양' 기준으로 줄 세움 */
  const typ={crit:1,hit:1,scrit:1,shit:1,dodge:1,parry:1,blockp:1,dps:4,rdps:4,mp5:3};
  return Object.entries(w).filter(([k,v])=>v>0&&(STAT_KO[k]||k==='rdps')&&k!=='armor').map(([k,v])=>[k,v*(typ[k]||5)]).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k])=>nm(k))}

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
     else if(s.k===1){const m=s.qn.match(/^(.+?) · 퀘스트 보상$/);const qm=(s.href||'').match(/quest=(\d+)/);if(m&&DGKO[m[1]])v=Math.max(DGKO[m[1]].lo-2,RW[it.id]??0);else if(qm&&typeof D_QLV!=='undefined'&&D_QLV[qm[1]]!=null)v=Math.max(it.lv,D_QLV[qm[1]]);else if(QMIN[s.qn]!=null)v=QMIN[s.qn]}
     ob=Math.min(ob,v)}
   it.ob=Math.max(it.lv,ob===99?it.lv:ob);
   /* 착용 레벨·얻는 레벨을 모르는 장비(Lv 1로 잡힌 것)는 능력치 총량으로 레벨을 어림 */
   if(it.ob<=1){const t=it.st;const S=['str','agi','sta','int','spi'].reduce((a,k)=>a+(t[k]||0),0)+Math.max(t.sp||0,t.heal||0)*.45+(t.ap||0)*.5+(t.dps||0)*.6+(t.mp5||0)*2+((t.crit||0)+(t.hit||0)+(t.scrit||0)+(t.shit||0))*8;
     if(S>8){it.ob=Math.min(60,Math.round(S*(it.sl==='2h'?.6:.85)));it.lv=it.ob;it.est=true}}}}

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
const SOLO={priest:{sp:1,shadow:.6,holy:.4,int:.6,spi:.6,mp5:.6,sta:.25,heal:.3,dpsWand:1.2,scrit:8,shit:10},
  paladin:{str:1,agi:.5,ap:.5,sta:.3,int:.3,heal:.2,dps2h:2.2,dpsMain:1.6,crit:13,hit:15},
  shaman:{str:.8,agi:.4,ap:.4,int:.5,sp:.5,nature:.3,heal:.2,sta:.25,dps2h:1.8,dpsMain:1.4,crit:10,hit:12},
  druid:{sp:1,nature:.5,arcane:.5,int:.5,spi:.3,heal:.25,sta:.2,scrit:8,shit:10}};
const _wc={};
function wOf(c){const w=(W[c.cls]||{})[c.spec]||Object.values(W[c.cls]||{})[0]||{};
  if(!w.heal||!SOLO[c.cls])return w;const m=c.gmode==='solo'?'solo':'heal';const k=c.cls+'/'+c.spec+'/'+m;if(_wc[k])return _wc[k];
  let r;if(m==='heal'){r=Object.assign({},w,{dpsWand:0,rdps:0})}else{r=Object.assign({},SOLO[c.cls]);r.dps=r.dpsMain??r.dps2h??0;r.rdps=r.dpsWand??0}
  return _wc[k]=r}

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
/* 전투정보실 자료 받기: 앱 열 때 · 10분마다 · 다시 볼 때 · 「새로 고침」 버튼 */
let ARM_AT=0;
function armFetch(manual){ARM_AT=Date.now();
  return fetch('data/armory/chars.json?t='+(manual?Date.now():Math.floor(Date.now()/300000)),{cache:manual?'no-store':'default'}).then(r=>r.ok?r.json():{}).then(j=>{ARM=j||{};ARM_OK=true;
  /* 이미 연결된 캐릭터는 새 자료가 오면 자동으로 맞춤 */
  let ch=0;DB.list.forEach(c=>{const A=ARM[c.arm];if(A&&A.checked&&A.checked!==c.armAt&&A.gear){armApply(c,true);ch++}});
  DB.list.forEach(c=>{const A=ARM[c.arm];if(A&&A.gear)Object.values(A.gear).forEach(armItem)});
  if(manual||ch)render();return ch}).catch(()=>{ARM_OK=true;return -1})}
armFetch().then(()=>render());
setInterval(()=>{if(!document.hidden)armFetch()},10*60e3);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-ARM_AT>5*60e3)armFetch()});
function armBox(c){const keys=Object.keys(ARM).filter(k=>ARM[k]&&ARM[k].gear);const A=c&&ARM[c.arm];
  let h='<h3>⚔️ 전투정보실 연결</h3>';
  if(A)h+='<p class="note">연결됨: <b>'+esc(A.name)+'</b> ('+esc(A.key)+') · 레벨 '+(A.level||'?')+' · 마지막 갱신 '+armAgo(A.checked)+'<br>20분마다, 그리고 매일 밤 12시에 전투정보실을 다시 읽어 레벨과 장비를 맞춰요. 게임에서 <b>로그아웃해야</b> 전투정보실이 바뀌어요.</p><button class="btn sm" data-a="armref">🔄 새로 고침</button> <button class="btn sm ghost" data-a="armnow">지금 자료로 다시 맞추기</button> <button class="btn sm ghost" data-a="armoff">연결 끊기</button>';
  else{h+='<p class="note">명단에 있는 캐릭터를 고르면 레벨과 착용 장비를 전투정보실에서 그대로 가져와요.</p>';
    h+=keys.length?'<div class="chips" style="flex-wrap:wrap">'+keys.map(k=>'<button class="chip" data-a="armlink" data-k="'+esc(k)+'">'+esc(ARM[k].name)+' <span class="n">Lv'+(ARM[k].level||'?')+' '+esc(ARM[k].clsName||'')+'</span></button>').join('')+'</div>':'<p class="note">'+(ARM_OK?'아직 명단에 캐릭터가 없어요.':'명단을 불러오는 중…')+'</p>'}
  h+='<details class="fold"><summary>명단에 내 캐릭터가 없어요</summary><p class="note">용현님에게 <b>지역(한국이면 kr)과 이름-성</b>을 알려 주세요. 명단 파일(data/armory/chars.txt)에 한 줄 넣으면 몇 분 안에 생겨요.</p><p class="note"><a href="https://github.com/Misfits980/WOWF-helper-/edit/main/data/armory/chars.txt" target="_blank" rel="noopener">명단 고치기 (저장소 주인만) ↗</a></p></details>';
  return h}

/* ===================== 퀘스트 상세 (할 일·모을 것·연계) — 필요할 때 불러옴 ===================== */
const QD=new Map();let QD_OK=false;
fetch('data/forg/quests.jsonl?v='+D_VER.fq).then(r=>r.ok?r.text():'').then(t=>{t.split('\n').forEach(l=>{if(!l)return;try{const o=JSON.parse(l);QD.set(o.id,o)}catch(e){}});QD_OK=true;if(me()&&(ui.tab==='quest'||ui.tab==='dungeon'))rerender(true)}).catch(()=>{QD_OK=true});
const RWD=new Map();
fetch('data/forg/rewards.jsonl?v='+D_VER.rw).then(r=>r.ok?r.text():'').then(t=>{t.split('\n').forEach(l=>{if(!l)return;try{const o=JSON.parse(l);RWD.set(o.id,o)}catch(e){}});if(me()&&(ui.tab==='quest'||ui.tab==='dungeon'||ui.sheet))rerender(true)}).catch(()=>{});
/* 퀘스트 번호로 찾기 (지역 루트 → 던전 퀘스트 순) */
/* 사용자가 고른 퀘스트 표시 아이콘 (icons.html: 1 2 6 1 3 5 3) */
const QIC={gear:'inv_shield_06',chain:'inv_scroll_05',xp:'inv_misc_book_09',dg:'inv_misc_key_03',fnew:'spell_holy_holybolt',cls:'spell_holy_sealofmight',quest:'inv_misc_map_01'};
const QIC_KO={gear:'내 장비 보상',chain:'연계 퀘스트',xp:'경험치 많음',dg:'던전 퀘스트',fnew:'포에버 신규',cls:'직업 퀘스트',quest:'퀘스트'};
const qico=(k,t)=>'<i class="qico" title="'+esc(t||QIC_KO[k])+'" style="background-image:url('+ICO(QIC[k])+')"></i>';
/* ===== 맵 전체 퀘스트 (QuestieDB 포에버 자료) ===== */
let QDB=null,QDB_LOAD=false;
const CLS_BIT={warrior:1,paladin:2,hunter:4,rogue:8,priest:16,shaman:64,mage:128,warlock:256,druid:1024};
const RACE_BIT={human:1,dwarf:4,nightelf:8,gnome:64,skyborne:4294967296};
function qdbOk(c,q){if(q.cls&&!(q.cls&(CLS_BIT[c.cls]||0)))return false;if(q.rc){const b=RACE_BIT[c.race]||0;if(b&&Math.floor(q.rc/b)%2===0)return false}return true}
function qdbLoad(){if(QDB_LOAD)return;QDB_LOAD=true;
  fetch('data/qdb/quests.jsonl?v='+D_VER.qdb).then(r=>r.ok?r.text():'').then(t=>{const M=new Map();
    t.split('\n').forEach(l=>{if(!l)return;try{const o=JSON.parse(l);M.set(o.id,o)}catch(e){}});QDB=M;qdbChains();
    for(const q of M.values()){const d=QD.get(q.id);if(!d)QD.set(q.id,qdbToQD(q));else if(!(d.ch&&d.ch.length>1)&&q._ch)d.ch=q._ch}
    if(ui.tab==='quest'||ui.sheet)rerender(true)}).catch(()=>{QDB=new Map();rerender(true)})}
let QKIDS={},QPAR={};
function qdbChains(){const P={};const K={};const add=(a,b)=>{if(a===b||!QDB.has(a)||!QDB.has(b))return;if(P[b]!=null)return;{const la=QDB.get(a).lv||0,lb=QDB.get(b).lv||0;if(la>0&&lb>0&&la-lb>=8)return}/* 8레벨 넘게 거꾸로 이어진 건 자료 오류로 보고 끊음 */P[b]=a;(K[a]=K[a]||[]).push(b)};
  /* 1) 앞 퀘스트가 하나뿐이면 그게 부모  2) 다음 퀘스트(nx)  3) 안내 퀘스트(bc)는 대상 퀘스트 앞에 */
  for(const q of QDB.values()){const pp=(q.pre&&q.pre.length===1)?q.pre[0]:(q.pre1&&q.pre1.length===1)?q.pre1[0]:null;if(pp)add(pp,q.id)}
  for(const q of QDB.values())if(q.nx)add(q.id,q.nx);
  for(const q of QDB.values())if(q.bc&&!P[q.bc]&&!K[q.id])add(q.id,q.bc);
  /* 고리 끊기 */
  for(const id in P){let x=+id,k=0;const seen=new Set();while(P[x]!=null&&k++<40){if(seen.has(x)){delete P[id];break}seen.add(x);x=P[x]}}
  for(const a in K){K[a]=K[a].filter(b=>P[b]===+a).sort((x,y)=>(QDB.get(x).lv-QDB.get(y).lv)||x-y);if(!K[a].length)delete K[a]}
  QKIDS=K;QPAR=P;
  const row=(id,i)=>{const o=QDB.get(id);const t=o.t&&o.t[0];return [i+1,o.n,o.lv,t?t[0]+' '+(t[1]||''):'',o.g?o.g[0]+(o.g[1]?' · '+o.g[1]+(o.g[2]?' ('+o.g[2].replace(',',', ')+')':''):''):'',0,id]};
  for(const q of QDB.values()){delete q._ch;delete q._root;
    const back=[q.id];let x=q.id,k=0;while(P[x]!=null&&k++<30){x=P[x];back.unshift(x)}
    const fwd=[];x=q.id;k=0;while(K[x]&&K[x].length===1&&k++<30){x=K[x][0];fwd.push(x)}
    const ids=[...back,...fwd];q._root=back[0];
    if(ids.length>1||K[q.id])q._ch=ids.length>1?ids.map(row):null}}
function qdbToQD(q){const drop=t=>t[2]&&t[2].length?t[2].map(x=>x[0]+(x[1]?' (Lv '+x[1]+')':'')).join(', '):'';
  return {id:q.id,src:'qdb',obj:q.o,g:q.g?[q.g[0],q.g[1]||'',q.g[2]||'','']:null,
    r:q.r?[q.r[0],q.r[1]||'',q.r[2]||'',q.g&&q.r[0]===q.g[0]&&q.r[2]===q.g[2]?'same':'']:null,
    t:(q.t||[]).map(t=>[t[0],t[1],'',drop(t)]),ch:q._ch||null}}
const MC_ORDER=['동부 왕국','칼림도어','리버글레이드','제프라스 섬','직업','기타'];
const MC_IC={'동부 왕국':'🏰','칼림도어':'🌴','리버글레이드':'🌊','제프라스 섬':'🏝️','던전':'⚔️','직업':'🎓','기타':'🎉'};
function qd(c,z,q){return !!((c.fq||{})[z+'|'+q.nm]||(q.id&&(c.mq||{})[q.id]))}
function mqDone(c,q){return !!((c.mq||{})[q.id]||(c.fq||{})[q.z+'|'+q.n])}
function mapView(c){const L=c.lv;
  if(!QDB){qdbLoad();return '<p class="empty-st">맵 전체 퀘스트를 불러오는 중이에요…</p>'}
  if(!QDB.size)return '<p class="empty-st">퀘스트 자료를 못 불러왔어요. 잠시 뒤에 다시 열어 주세요.</p>';
  const all=[...QDB.values()].filter(q=>qdbOk(c,q)&&q.z&&q.c!=='던전');
  const Z={};for(const q of all){const k=q.c+'|'+q.z;(Z[k]=Z[k]||{c:q.c||'기타',z:q.z,q:[]}).q.push(q)}
  const zs=Object.values(Z).map(o=>{const lv=o.q.map(q=>q.lv).filter(x=>x>0).sort((a,b)=>a-b);o.lo=lv[Math.floor(lv.length*.1)]||0;o.hi=lv[Math.min(lv.length-1,Math.floor(lv.length*.9))]||0;o.mid=lv[Math.floor(lv.length/2)]||0;o.done=o.q.filter(q=>mqDone(c,q)).length;return o});
  const sec=routeOf(c).find(S=>L>=S.a&&L<=S.b);const myZ=sec?sec.z.split(' · ')[0]:'';
  let mc=ui.mc||(zs.find(o=>o.z===myZ)||{}).c||'동부 왕국';
  let h='<p class="note">포에버 퀘스트 <b>'+all.length.toLocaleString()+'개</b>를 지역마다 모았어요. ⚡ 빠른 레벨업 루트에 없는 퀘스트도 다 있어요.</p>';
  h+='<div class="chips">'+MC_ORDER.filter(m=>zs.some(o=>o.c===m)).map(m=>'<button class="chip'+(mc===m?' on':'')+'" data-a="mc" data-k="'+m+'">'+(MC_IC[m]||'')+' '+m+'</button>').join('')+'</div>';
  if(ui.mz&&ui.mz.startsWith('?|')){const zn=ui.mz.slice(2);const k=Object.keys(Z).find(k=>k.endsWith('|'+zn));ui.mz=k||null;if(k)mc=ui.mc=Z[k].c}
  const zk=ui.mz&&Z[ui.mz]?ui.mz:null;
  const CKO={warrior:'전사',paladin:'성기사',hunter:'사냥꾼',rogue:'도적',priest:'사제',shaman:'주술사',mage:'마법사',warlock:'흑마법사',druid:'드루이드'}[c.cls]||'';
  if(!zk){const list=zs.filter(o=>o.c===mc&&(mc!=='직업'||o.z.startsWith(CKO+' '))).sort((a,b)=>a.mid-b.mid||a.z.localeCompare(b.z));
    return h+list.map(o=>{const n=o.q.filter(q=>q.lv>=L-3&&q.lv<=L+3&&q.m<=L&&!mqDone(c,q)).length;const fit=n>=3;
      return '<button class="zr mz'+(fit?' fit':'')+'" data-a="mz" data-k="'+esc(o.c+'|'+o.z)+'"><span class="lvb '+(fit?'lv-y':L>o.hi?'lv-x':'')+'">'+(o.lo&&o.hi?o.lo+'–'+o.hi:'—')+'</span><b>'+esc(o.z)+'</b><span class="sub">퀘스트 '+o.q.length+'개'+(o.done?' · '+o.done+'개 끝냄':'')+(fit&&n?' · <b class="gd">지금 할 만한 것 '+n+'개</b>':'')+'</span></button>'}).join('')}
  const o=Z[zk];let f=ui.mf||'now';if(f==='near')f='now';
  const can=q=>!mqDone(c,q)&&q.m<=L&&q.lv>=L-5&&q.lv<=L+3;
  const nNow=o.q.filter(can).length,nLeft=o.q.filter(q=>!mqDone(c,q)).length;
  let qs=o.q.slice().sort((a,b)=>a.lv-b.lv||a.m-b.m||a.id-b.id);
  if(f==='now')qs=qs.filter(can);else if(f==='left')qs=qs.filter(q=>!mqDone(c,q));
  h='<div class="mzh"><button class="btn sm ghost" data-a="mz" data-k="">◀</button><h3>'+esc(o.z)+' <small class="mute">Lv '+o.lo+'–'+o.hi+'</small></h3></div>';
  h+='<details class="card zinfo"'+(ui.zinfo===false?'':' open')+'><summary>🗺️ 이 지역 정보 · 얻는 장비</summary>'+zoneInfo(c,o.z,{n:5})+'</details>';
  h+='<div class="chips seg">'+[['now','지금 할 수 있는 것',nNow],['left','안 끝낸 것',nLeft],['all','전부',o.q.length]].map(x=>'<button class="chip'+(f===x[0]?' on':'')+'" data-a="mf" data-k="'+x[0]+'">'+x[1]+' <span class="n">'+x[2]+'</span></button>').join('')+'</div>';
  if(!qs.length){h+='<p class="empty-st">'+(f==='now'?'레벨 '+L+'에 지금 받을 수 있는 퀘스트가 여기엔 없어요.':'남은 퀘스트가 없어요.')+'</p>';if(f==='now'&&nLeft)h+='<button class="btn ghost full sm" data-a="mf" data-k="left">안 끝낸 퀘스트 '+nLeft+'개 보기</button>';return h}
  /* 연계는 한 묶음, 같은 이름은 한 줄 */
  const zoneIds=new Set(o.q.map(q=>q.id));const shownIds=new Set(qs.map(q=>q.id));const G=[];const seenCh=new Set();
  for(const q of qs){const root=q._root;const tree=root!=null&&(QKIDS[root]||root!==q.id);if(tree){if(seenCh.has(root))continue;seenCh.add(root);G.push({root,lv:(QDB.get(root)||q).lv,at:q})}else G.push({q,lv:q.lv,at:q})}
  const byNm={};G.forEach(g=>{if(g.q)(byNm[g.q.n]=byNm[g.q.n]||[]).push(g)});
  const G2=G.filter(g=>!g.q||byNm[g.q.n][0]===g);
  /* 마을(거점)별로 묶기 */
  const CL=[];const hubOf=q=>{const g=q.g||[];if(g[1]&&g[1]!==o.z)return ['다른 지역에서 받기',998];if(!g[2])return ['아이템·필드에서 시작',999];
    const [x,y]=g[2].split(',').map(Number);const H=QHUB[o.z];if(H){let bi=-1,bd=1e9;H.forEach((h,i)=>{const d=Math.hypot(h[1]-x,h[2]-y);if(d<bd){bd=d;bi=i}});if(bd<12)return [H[bi][0],bi]}
    let cl=CL.find(k=>Math.hypot(k.x-x,k.y-y)<9);if(!cl){cl={x,y,n:(g[0]||'?')+' 근처',i:100+CL.length};CL.push(cl)}return [cl.n,cl.i]};
  const HB={};G2.forEach(g=>{const [n,i]=hubOf(g.at);(HB[n]=HB[n]||{n,i,g:[],lv:99,now:0}).g.push(g);HB[n].lv=Math.min(HB[n].lv,g.at.lv)});
  const hubs=Object.values(HB);hubs.forEach(H=>{H.cnt=H.g.reduce((a,g)=>a+(g.q?1:treeIds(g.root).filter(id=>shownIds.has(id)).length),0)});
  hubs.sort((a,b)=>(a.i>=998)-(b.i>=998)||a.lv-b.lv);
  ui.mhopen=ui.mhopen||{};const firstK=hubs.length?o.z+'|'+hubs[0].n:'';
  h+='<div class="steps">'+hubs.map((H,ix)=>{const k=o.z+'|'+H.n;const open=ui.mhopen[k]!=null?ui.mhopen[k]:(k===firstK);
    const nm=H.n.replace(/ \(\d+, \d+\)$/,'');
    let b='<div class="st'+(open?' open':'')+'"><button class="sh2" data-a="mh" data-k="'+esc(k)+'"><span class="no">'+(H.i>=998?'·':ix+1)+'</span><span class="hn"><b>'+esc(nm)+'</b><span>Lv '+H.lv+'부터</span></span><span class="hc">'+H.cnt+'개</span><span class="cv">'+(open?'⌃':'⌄')+'</span></button>';
    if(open)b+='<div class="sb">'+H.g.map(g=>{if(!g.q)return chainTree(c,g.root,zoneIds,shownIds);const same=byNm[g.q.n];return mqRow(c,g.q,0,same.length>1?same.length:0)}).join('')+'</div>';
    return b+'</div>'}).join('')+'</div>';
  if(f==='now'&&nLeft>nNow)h+='<button class="btn ghost full sm more2" data-a="mf" data-k="left">레벨이 안 맞는 퀘스트 '+(nLeft-nNow)+'개 더 보기</button>';
  return h}
function treeIds(root){const out=[];const st=[root];while(st.length&&out.length<80){const x=st.pop();out.push(x);(QKIDS[x]||[]).slice().reverse().forEach(y=>st.push(y))}return out}
function chainTree(c,root,zoneIds,shownIds){const L=c.lv;const all=treeIds(root).filter(id=>QDB.get(id)&&qdbOk(c,QDB.get(id)));const n=all.length;
  const doneN=all.filter(id=>mqDone(c,QDB.get(id))).length;const lvs=all.map(id=>QDB.get(id).lv).filter(Boolean);
  const nextId=all.find(id=>!mqDone(c,QDB.get(id)));const branchy=all.some(id=>(QKIDS[id]||[]).filter(k=>all.includes(k)).length>1);
  let h='<div class="chainb"><div class="chh"><span>'+qico('chain')+' 연계 퀘스트 <b>'+n+'개</b>'+(branchy?' · 갈래 있음':'')+'</span><span class="mute">Lv '+Math.min(...lvs)+' → '+Math.max(...lvs)+' · '+doneN+'/'+n+' 끝냄</span></div>';
  const big=n>10;
  const node=(id,step)=>{const x=QDB.get(id);const cls='chs'+(id===nextId?' cur':'')+(mqDone(c,x)?' fin':'');
    const hidden=y=>big&&(!zoneIds.has(y)||(shownIds&&!shownIds.has(y)));
    if(hidden(id)){/* 지금 거르기에 안 맞는 단계가 이어지면 한 묶음으로 접기 */
      const run=[];let y=id,st=step;while(y!=null&&hidden(y)){run.push([y,st]);const ks=(QKIDS[y]||[]).filter(k=>all.includes(k));if(ks.length!==1){y=null;break}y=ks[0];st++}
      const last=run[run.length-1][0];const lvs=run.map(r=>QDB.get(r[0]).lv);const dn=run.filter(r=>mqDone(c,QDB.get(r[0]))).length;
      const lo=Math.min(...lvs),hi=Math.max(...lvs);const why=hi<L-5?'레벨이 낮아 접어 뒀어요':lo>L+3?'아직 레벨이 높아 접어 뒀어요':'접어 뒀어요';
      let r0='<details class="chrun"><summary><span class="stp">'+run[0][1]+(run.length>1?'–'+run[run.length-1][1]:'')+'</span><span class="t"><b>'+(run.length>1?run.length+'단계':'['+lvs[0]+'] '+esc(QDB.get(run[0][0]).n))+'</b><span>Lv '+lo+(hi>lo?'–'+hi:'')+' · '+dn+'/'+run.length+' 끝냄 · '+why+'</span></span><span class="cv">⌄</span></summary>'
        +run.map(([z,sn])=>{const x2=QDB.get(z);const c2='chs'+(mqDone(c,x2)?' fin':'');return '<div class="'+c2+(zoneIds.has(z)?'':' away')+'"><span class="stp">'+sn+'</span>'+(zoneIds.has(z)?mqRow(c,x2,1):'<button class="awayb" data-a="qopen" data-k="'+z+'">['+(x2.lv||'?')+'] '+esc(x2.n)+'<span>다른 지역 · '+esc(x2.z||'')+' ›</span></button>')+'</div>'}).join('')+'</details>';
      const ks=(QKIDS[last]||[]).filter(k=>all.includes(k));const st2=run[run.length-1][1]+1;
      if(ks.length===1)return r0+node(ks[0],st2);
      if(ks.length>1)return r0+'<div class="chfork"><div class="fk">↳ 여기서 '+ks.length+'갈래로 나뉘어요</div>'+ks.map((k,i)=>'<div class="chbr"><div class="bl">갈래 '+'ABCDEFGH'[i]+'</div><div class="chflow">'+node(k,st2)+'</div></div>').join('')+'</div>';
      return r0}
    const body=zoneIds.has(id)?mqRow(c,x,1):'<button class="awayb" data-a="qopen" data-k="'+id+'">['+(x.lv||'?')+'] '+esc(x.n)+'<span>다른 지역 · '+esc(x.z||'')+' ›</span></button>';
    let r='<div class="'+cls+(zoneIds.has(id)?'':' away')+'"><span class="stp">'+step+'</span>'+body+'</div>';
    const kids=(QKIDS[id]||[]).filter(k=>all.includes(k));
    if(kids.length===1)r+=node(kids[0],step+1);
    else if(kids.length>1)r+='<div class="chfork"><div class="fk">↳ 여기서 '+kids.length+'갈래로 나뉘어요 (따로따로 받을 수 있어요)</div>'+kids.map((k,i)=>'<div class="chbr"><div class="bl">갈래 '+'ABCDEFGH'[i]+'</div><div class="chflow">'+node(k,step+1)+'</div></div>').join('')+'</div>';
    return r};
  return h+'<div class="chflow">'+node(root,1)+'</div></div>'}
function mqRow(c,q,inCh,same){const d=mqDone(c,q),L=c.lv,lock=q.m>L;const ch=inCh?null:q._ch;
  const tags=(q.pre||q.pre1?'<span class="tag pre">앞 퀘스트 먼저</span>':'')+(ch?'<span class="tag">🔗 연계 '+(ch.findIndex(r=>r[6]===q.id)+1)+'/'+ch.length+'</span>':'')+(lock?'<span class="tag">'+q.m+'레벨부터</span>':'')+(q.rep?'<span class="tag">반복</span>':'')+(q.cls?'<span class="tag">직업 전용</span>':'')+(q.rc?'<span class="tag">종족 전용</span>':'');
  const body=parch(c,q.id,{nm:q.n,obj:q.o,place:esc(q.z),tags,done:d,kind:'mq',ck:String(q.id),pre:q.pre||q.pre1});
  let sub=taskShort({id:q.id,obj:q.o});if(!sub)sub=(q.o||'').slice(0,40);if(lock)sub='🔒 '+q.m+'레벨부터 · '+sub;
  return qFold({key:'m'+q.id,lite:1,sub,done:d,lock,lv:q.lv,nm:q.n,body,side:(q.id>=10000?qico('fnew'):'')+(q.cls?qico('cls'):'')+(same?'<span class="lk">같은 퀘 '+same+'개</span>':ch?qico('chain'):'')})}
(window.requestIdleCallback||((f)=>setTimeout(f,1)))(()=>setTimeout(qdbLoad,4000));
function questById(id){for(const k of [RACE_START[(me()||{}).race]||'dwarf-gnome',...Object.keys(ROUTE)])for(const S of ROUTE[k]||[])for(const q of S.q)if(q.id===id)return {q,z:q.gz||q.sz};
  for(const d of DGS)for(const q of d.q)if(q.id===id)return {q:Object.assign({},q,{dg:d}),z:d.ko,dg:d};return null}
function money(c){if(!c)return '';const g=Math.floor(c/10000),s=Math.floor(c%10000/100),k=c%100;return (g?g+'골드 ':'')+(s?s+'실버 ':'')+(k?k+'코퍼':'')}
const latin=x=>/[A-Za-z]{3}/.test(x||'');
/* forg 할 일 + wowf 대상·개수를 합침 */
function objPairs(obj){const out=[];if(!obj)return out;const re=/(\d+)\s*(마리|개|명)/g;let m;
  while((m=re.exec(obj))){const bf=obj.slice(0,m.index).trim().split(/\s+/);const nm=[];
    for(let i=bf.length-1;i>=0&&nm.length<4;i--){const w=bf[i];if(/\d/.test(w)||/[,.]$/.test(w))break;
      if(/(에서|에게|위해|해서|하여|으로|을|를|에|과|와|및)$/.test(w))break;if(nm.length&&w.length>=3&&/[가이]$/.test(w))break;nm.unshift(w)}
    while(nm.length&&/^(그리고|또|각각)$/.test(nm[0]))nm.shift();
    if(nm.length)out.push([nm.join(' '),+m[1],m[2]])}
  return out}
function tasksOf(d,obj){const op=objPairs(obj);const wt0=(d.wf&&d.wf.t)||[];
  if(op.length&&!wt0.some(w=>w[1]>0)){const ok=t=>t&&t[1]&&!/^\d+$|^(반납|받기|하기)$/.test(t[1]);const ft=(d.t||[]).filter(ok);const kill=/처치|잡|죽|퇴치|사냥|쓰러/.test(obj);
    return op.map((p,i)=>{const w=wt0.find(w=>!latin(w[0])&&(p[0].endsWith(w[0])||w[0].endsWith(p[0])));const nm=w?(w[0].length>p[0].length?w[0]:p[0]):p[0];
      const f=ft.find(t=>t[1]===nm)||(ft.length===op.length?ft[i]:null);
      return {type:f?f[0]:(p[2]==='개'?'수집':kill?'처치':'수집'),nm,cnt:p[1],where:f?f[2]:'',drop:f?f[3]:''}})}
  return tasksOf0(d,obj)}
function tasksOf0(d,obj){const ok=t=>t&&t[1]&&!/^\d+$|^(반납|받기|하기)$/.test(t[1]);const ft=(d.t||[]).filter(ok);const wt=(d.wf&&d.wf.t)||[];
  if(!wt.length)return ft.map(t=>({type:t[0],nm:t[1],cnt:0,where:t[2],drop:t[3]}));
  const used=new Set();const guess=/처치|잡아|죽/.test(obj||'')?'처치':'수집';
  return wt.map(w=>{let j=ft.findIndex((t,k)=>!used.has(k)&&t[1]===w[0]);if(j<0)j=ft.findIndex((t,k)=>!used.has(k)&&latin(t[1]));const f=j>=0?ft[j]:null;if(j>=0)used.add(j);
    return {type:f?f[0]:guess,nm:w[0],cnt:w[1],where:f?f[2]:'',drop:f?f[3]:''}})}
const NPC_KO={'Howin Kindfeather':'호윈 킨드페더','Corrupted Night Dragon':'타락한 밤용','Image of Archmage Modera':'대마법사 모데라의 환영','Grund Drokda':'그룬드 드록다','Arbal':'아르발','Corrupted Songflower':'타락한 노래꽃','Corrupted Windblossom':'타락한 바람꽃','The Scarab Gong':'스카라베 징','A Dwarven Corpse':'드워프의 시체','Tom "Half-fish" Wilson':'톰 "반쪽물고기" 윌슨','Sylessa Duskwhisper':'실레사 더스크위스퍼','Dragonmaw Armaments':'용아귀 무기더미','Tattered Spellbook':'너덜너덜한 주문서','Gleaming Crescent Pendant':'반짝이는 초승달 펜던트','Buzzbox 411':'버즈박스 411','Night Elf Courier':'나이트 엘프 전령','Lady Dena Kennedy':'데나 케네디 부인','Daewyn Songblade':'대윈 송블레이드'};
function npcKo(d,which){const a=which==='g'?d.g:d.r;const nm0=a&&a[0];const nm=NPC_KO[nm0]||nm0;if((!nm||latin(nm))&&d.wf&&d.wf[which]&&!latin(d.wf[which]))return d.wf[which];return nm}
/* 앞 퀘스트 */
function preBlock(id,flag){const X=QDB&&QDB.get(id);const c0=me();const ok=o=>!c0||qdbOk(c0,o);
  const PG=(X&&X.pre||[]).map(i=>QDB.get(i)).filter(o=>o&&ok(o)),P1=(X&&X.pre1||[]).map(i=>QDB.get(i)).filter(o=>o&&ok(o));
  const P=PG.length?PG:P1;
  if(P.length){return '<div class="pre"><b>🔒 먼저 끝내야 하는 퀘스트</b>'+(!PG.length&&P1.length>1?'<div class="mute">아래 중 <b>하나만</b> 끝내면 돼요.</div>':'')+P.map(o=>'<div>['+(o.lv||'?')+'] <b>'+esc(o.n)+'</b>'+(o.g?' · '+esc(o.g[0])+(o.g[1]?' ('+esc(o.g[1])+(o.g[2]?' '+esc(o.g[2].replace(',',', ')):'')+')':''):'')+' <button class="pbtn sm" data-a="qopen" data-k="'+o.id+'">보기</button></div>').join('')+(PG.length>1?'<div class="mute">위 퀘스트를 <b>모두</b> 끝내야 해요.</div>':'')+'</div>'}
  const ch=chainOf(id);if(ch){const cur=ch.find(r=>r[6]===id);const pv=cur&&ch.find(r=>r[0]===cur[0]-1);if(pv){const o=QD.get(pv[6])||{};const g=npcKo(o,'g');
    return '<div class="pre"><b>🔒 먼저 끝내야 하는 퀘스트</b><div>['+(pv[2]||'?')+'] <b>'+esc(pv[1])+'</b>'+(g?' · '+esc(g)+(o.g&&o.g[1]?' ('+esc(o.g[1])+(o.g[2]?' '+esc(o.g[2].replace(',',', ')):'')+')':''):'')+'</div>'+(pv[6]?'<button class="pbtn sm" data-a="qopen" data-k="'+pv[6]+'">앞 퀘스트 보기</button>':'')+'</div>'}}
  if(!flag)return '';
  return '<div class="pre"><b>🔒 앞 퀘스트가 있어요</b><div>이 퀘스트는 다른 퀘스트를 먼저 끝내야 받을 수 있어요. 어떤 퀘스트인지는 자료에 없어서, 받는 NPC 머리 위에 <b>!</b>가 안 보이면 같은 지역의 다른 퀘스트를 먼저 해 보세요.</div></div>'}
/* forg 연계 표는 퀘스트 번호가 밀린 줄이 있어 이름으로 맞춤 */
let QNAME=null,QNAME_N=0;const nkey=n=>String(n||'').replace(/\s/g,'');
function qByName(n){if(!QDB)return null;if(!QNAME||QNAME_N!==QDB.size){QNAME=new Map();QNAME_N=QDB.size;for(const q of QDB.values()){const k=nkey(q.n);if(!QNAME.has(k))QNAME.set(k,[]);QNAME.get(k).push(q.id)}}return QNAME.get(nkey(n))}
function fixChain(ch){if(!ch||!QDB)return ch;const ids=new Set(ch.map(r=>r[6]));return ch.map(r=>{if(!r[6])return r;const x=QDB.get(r[6]);if(x&&nkey(x.n)===nkey(r[1]))return r;const c=qByName(r[1]);if(!c||!c.length)return r;
  const pick=c.find(i=>ids.has(i)&&i!==r[6])||c.slice().sort((a,b)=>Math.abs(a-r[6])-Math.abs(b-r[6]))[0];r=r.slice();r[6]=pick;return r})}

/* ===== 퀘스트 창 안 작은 지도: 받는 곳 ❗ · 할 일 ⚔️ · 반납 ❓ ===== */
const AMNT={ek:[[3,5],[5,10],[10,19],[20,38]],ka:[[4,6],[7,12],[13,23],[25,40]]};
function miniMap(id,d,nm){const X=QDB&&QDB.get(id);const P=[];
  const G=(X&&X.g&&X.g[2]&&X.g[3]!=='item')?X.g:(d.g&&d.g[2]?d.g:null);const R=(X&&X.r&&X.r[2])?X.r:(d.r&&d.r[2]&&!d.r[3]?d.r:null);
  const gz=G&&G[1]||(X&&X.z)||'';
  const add=(kind,zone,xy,name)=>{const a=toAtlas(zone,xy);if(a)P.push(Object.assign(a,{kind,nm:name}))};
  if(G)add('g',G[1]||gz,G[2],npcKo(d,'g')||G[0]);
  if(QD.get(id))for(const t of tasksOf(QD.get(id),d.obj||(X&&X.o)||'')){const m=(t.where||'').match(/([\d.]+),\s*([\d.]+)/);if(m)add('ob',gz,m[1]+','+m[2],t.nm)}
  if(R&&!(G&&R[2]===G[2]&&R[0]===G[0]))add('r',R[1]||gz,R[2],npcKo(d,'r')||R[0]);
  if(!P.length)return '';const c0=P[0].c;const Q=P.filter(p=>p.c===c0);
  const xs=Q.map(p=>p.x),ys=Q.map(p=>p.y);const w=Math.max(...xs)-Math.min(...xs),hh=Math.max(...ys)-Math.min(...ys);
  let z=3;while(z>0&&(w*2**(z-3)>560||hh*2**(z-3)>170))z--;const s=2**(z-3),span=256*2**(3-z);
  const cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2;const T=ATL[c0];const [nx,ny]=AMNT[c0][z];
  const tx0=Math.max(0,Math.floor((cx-460/s)/span)),tx1=Math.min(nx-1,Math.floor((cx+460/s)/span)),ty0=Math.max(0,Math.floor((cy-140/s)/span)),ty1=Math.min(ny-1,Math.floor((cy+140/s)/span));
  let t='';for(let x=tx0;x<=tx1;x++)for(let y=ty0;y<=ty1;y++)t+='<img src="https://assets.wowf.io/world/atlas/'+T.n+'/'+z+'/'+x+'_'+y+'.webp" style="left:'+((x*span-cx)*s)+'px;top:'+((y*span-cy)*s)+'px" alt="" loading="lazy" draggable="false" onerror="this.style.visibility=\'hidden\'">';
  const ic={g:QMK.g,r:QMK.r,ob:'⚔️'};
  const pins=Q.map(p=>'<span class="mmp k-'+p.kind+'" style="left:'+((p.x-cx)*s)+'px;top:'+((p.y-cy)*s)+'px"><i>'+ic[p.kind]+'</i><b>'+esc(p.nm||'')+'</b></span>').join('');
  const zl=gz?'<span class="mmz">'+esc(gz)+(G?' · '+xyTxt(G[2]):'')+'</span>':'';
  return '<div class="mm"><div class="mmc">'+t+pins+'</div>'+zl+'<button class="mmgo" data-a="mmgo" data-k="'+id+'">지도에서 크게 ›</button></div>'}
/* 양피지 모양 퀘스트 상세 */
function chainOf0(id){const d=QD.get(id);if(d&&d.ch&&d.ch.length>1)return d.ch;for(const o of QD.values())if(o.ch&&o.ch.length>1&&o.ch.some(r=>r[6]===id))return o.ch.map(r=>{r=r.slice();r[5]=r[6]===id?1:0;return r});return null}
/* 연계 정보는 한 곳 기준: Questie 포에버 자료(갈래·보정 포함)가 있으면 그걸, 없을 때만 forg·wowf 연계 표 */
function chainOf(id){const X=QDB&&QDB.get(id);if(X){const b=X._ch;return b?b.map(r=>{r=r.slice();r[5]=r[6]===id?1:0;return r}):(QKIDS[id]?null:(X._root!==id?null:null))}return chainOf0(id)}
function parch(c,id,base){const d=Object.assign({},QD.get(id)||{});const chx=chainOf(id);if(chx){d.ch=chx;d.cn=chx.length;d.cc=(chx.find(r=>r[5])||[0])[0]}const R=RWD.get(id)||{};const L=c.lv;
  const nm=base.nm,obj=base.obj||d.obj||'';let h='<div class="parch"><div class="ph"><h4>'+esc(nm)+'</h4>'+(base.place?'<span class="ptag">'+base.place+'</span>':'')+'</div>';
  {let tg=base.tags||'';if(chx||(d.ch&&d.ch.length>1))tg=tg.replace('<span class="tag pre">앞 퀘스트 먼저</span>','');if(tg.trim())h+='<div class="ptags">'+tg+'</div>'}
  h+='<h5>퀘스트 임무</h5><p>'+esc(obj)+'</p>';
  if(base.mm!==false&&typeof toAtlas==='function')h+=miniMap(id,Object.assign({obj},d),nm);
  const g=d.g&&d.g[0]?d.g:null;
  if(d.ch&&d.ch.length>1)d.ch=fixChain(d.ch);const CH=d.ch&&d.ch.length>1?d.ch:null;const ci0=CH?(((()=>{const byN=CH.filter(r=>nkey(r[1])===nkey(nm));return byN.find(r=>r[6]===id)||byN[0]})()||CH.find(r=>r[6]===id)||CH.find(r=>r[5])||[0])[0]||d.cc||0):0;
  if(CH&&ci0){/* 선행 퀘스트 1/4 · 2/4 … 한 상자에 */
    const dnOf=r=>{const x=r[6]&&QDB&&QDB.get(r[6]);if(x)return mqDone(c,x);const f=r[6]&&questById(r[6]);return f?!!((f.dg?c.dq:c.fq)||{})[f.dg?String(r[6]):f.z+'|'+r[1]]:false};
    const prior=CH.filter(r=>r[0]<ci0),left=prior.filter(r=>!dnOf(r)).length,n=CH.length;
    h+='<div class="prech'+(left?'':' ok')+'"><b>'+(prior.length?(left?'⚠️ 선행 퀘스트 '+left+'개를 먼저 끝내야 받을 수 있어요':'✓ 선행 퀘스트를 다 끝냈어요'):'🔗 연계 퀘스트의 첫 단계예요')+'</b>'
     +(()=>{const row=r=>{const me_=r[0]===ci0,dn=dnOf(r),past=r[0]<ci0;return '<'+(me_||!r[6]?'div':'button data-a="qopen" data-k="'+r[6]+'"')+' class="pcs'+(me_?' me':'')+(dn?' dn':'')+(past?'':' nx')+'"><span class="f">'+r[0]+'/'+n+'</span><span class="t"><b>'+(r[2]?'['+r[2]+'] ':'')+esc(r[1])+'</b>'+(me_?'<i>지금 이 퀘스트</i>':past?(dn?'<i>끝냄 ✓</i>':'<i>선행 퀘스트</i>'):'<i>다음</i>')+'</span>'+(me_?'':'<span class="cv">›</span>')+'</'+(me_||!r[6]?'div':'button')+'>'};
       if(n<=7)return CH.map(row).join('');/* 길면 지금 단계 주변만, 나머지는 접기 */
       const win=r=>r[0]===1||r[0]===n||(r[0]>=ci0-2&&r[0]<=ci0+2);let out='',buf=[];const flush=()=>{if(buf.length){out+='<details class="pcfold"><summary>… '+buf[0][0]+(buf.length>1?'–'+buf[buf.length-1][0]:'')+'단계 '+buf.length+'개 더 보기</summary>'+buf.map(row).join('')+'</details>';buf=[]}};
       CH.forEach(r=>{if(win(r)){flush();out+=row(r)}else buf.push(r)});flush();return out})()+'</div>'}
  else h+=preBlock(id,base.pre);h+='<p class="npc">'+QMK.g+' 받는 곳: <b>'+esc(g?npcKo(d,'g'):(base.gv||'—'))+'</b>'+(g&&g[1]?' · '+esc(g[1])+(g[2]?' ('+esc(g[2].replace(',',', '))+')':''):(base.xy?' ('+esc(base.xy.replace(',',', '))+')':''))+'</p>';
  if(base.extra)h+=base.extra;
  {const TS=tasksOf(d,obj);if(TS.length)h+='<h5>챙길 것 · 할 일</h5><ul class="ptask">'+TS.map(t=>{const drop=(t.drop||'').replace(/ ?그 밖 지역$/,'').trim();const unit=t.type==='처치'?'마리':'개';
    return '<li>'+(T_IC[t.type]||'•')+' <b>'+esc(t.nm)+(t.cnt?' '+t.cnt+unit:'')+'</b> '+(T_KO[t.type]||t.type)+(drop?'<br><span>'+(t.type==='수집'?'떨구는 몹: ':'')+esc(drop)+'</span>':'')+(t.where?'<br><span>많은 곳 '+esc(t.where.replace(/[()]/g,''))+'</span>':'')+'</li>'}).join('')+'</ul>'}
  if(d.r&&d.r[0]&&!d.r[3])h+='<p class="npc">'+QMK.r+' 반납하는 곳: <b>'+esc(npcKo(d,'r'))+'</b>'+(d.r[1]?' · '+esc(d.r[1])+(d.r[2]?' ('+esc(d.r[2].replace(',',', '))+')':''):'')+'</p>';
  else if(d.r&&d.r[3])h+='<p class="npc">'+QMK.r+' 반납하는 곳: 받은 NPC에게 다시</p>';
  /* 보상 */
  const tile=(x,best)=>{const it=IT.get(x[0]);const use=it&&usable(it,c);const b=use?bestSlot(it,c):null;
    return '<button class="rt2'+(best?' best':'')+(it&&!use?' no':'')+'" data-a="'+(it?'info':'')+'" data-k="'+x[0]+'"><span class="ic q-'+x[3]+'" style="background-image:url('+ICO(x[2])+')"></span><span class="rn q'+x[3]+'">'+esc(x[1])+(x[4]>1?' ×'+x[4]:'')+'</span>'+(best?'<span class="rb">★ 추천</span>':b&&b.g>.01?'<span class="rb s">좋아짐</span>':it&&!use?'<span class="rb nx">못 씀</span>':'')+'</button>'};
  if(R.ch||R.fx||R.xp||R.money||R.rep){h+='<h5>보상</h5>';
    if(R.ch&&R.ch.length){let bi=-1,bg=.01;R.ch.forEach((x,i)=>{const it=IT.get(x[0]);if(it&&usable(it,c)){const b=bestSlot(it,c);if(b&&b.g>bg){bg=b.g;bi=i}}});
      h+='<p>아래의 보상 중 한 가지를 선택할 수 있습니다:</p><div class="rgrid">'+R.ch.map((x,i)=>tile(x,i===bi)).join('')+'</div>'}
    if(R.fx&&R.fx.length)h+='<p>받게 될 아이템:</p><div class="rgrid">'+R.fx.map(x=>tile(x,false)).join('')+'</div>';
    const ex=[];if(R.xp)ex.push('경험치 <b>'+R.xp.toLocaleString()+'</b>');if(R.money)ex.push('<b>'+money(R.money).trim()+'</b>');(R.rep||[]).forEach(r=>ex.push(esc(r[0])+' 평판 <b>'+esc(r[1])+'</b>'));
    if(ex.length)h+='<p>추가로 받게 될 보상:</p><p class="pex">'+ex.join(' · ')+'</p>'}
  else if(base.rwHtml)h+='<h5>보상</h5>'+base.rwHtml;
  /* 연계 */
  /* 연계 줄에 빠진 할 일·NPC는 그 퀘스트 상세에서 채움 */
  const fill=r=>{const o=QD.get(r[6]);if(o){if(!r[3]&&o.t&&o.t[0])r=r.slice(),r[3]=o.t[0][0]+' '+o.t[0][1]+(o.t.length>1?' 외 '+(o.t.length-1):'');if((!r[4]||r[4]==='받기')&&o.g&&o.g[0])r=r.slice(),r[4]=o.g[0]+(o.g[1]?' · '+o.g[1]+(o.g[2]?' ('+o.g[2].replace(',',', ')+')':''):'')}return r};
  if(d.ch&&d.ch.length>1)d.ch=d.ch.map(fill);
  if(!(d.ch&&d.ch.length>1)&&base.chN)h+='<p class="npc">🔗 연계 퀘스트예요. 끝내면 이어서 '+base.chN+'개가 더 나와요. (단계 정보는 자료를 다시 모으는 중이에요)</p>';
  if(d.ch&&d.ch.length>1){const ci=ci0||d.cc;const nx=d.ch.find(r=>r[0]===ci+1);
    /* 연계 전체는 위 「선행 퀘스트」 상자에 */
    if(nx&&nx[6])h+='<button class="pbtn" data-a="qopen" data-k="'+nx[6]+'">다음 연계 퀘스트 ▶ <b>['+(nx[2]||'?')+'] '+esc(nx[1])+'</b></button>';
  }
  return h+(base.done!=null?'<label class="qdone"><input type="checkbox" data-c="'+base.kind+'" data-k="'+esc(base.ck)+'" data-id="'+(id||'')+'"'+(base.done?' checked':'')+'> 끝냈어요</label>':'')+'</div>'}
function questSheet(c,id){id=+id;const f=questById(id);const d=QD.get(id)||{};const cr=d.ch&&d.ch.find(r=>r[6]===id);
  const X=!f&&QDB&&QDB.get(id);
  const q=f?f.q:X?{nm:X.n,lv:X.lv,obj:X.o,min:X.m}:{nm:cr?cr[1]:'퀘스트 '+id,lv:cr?cr[2]:'',obj:d.obj};
  if(X){let h='<div class="sh"><h2>['+(X.lv||'?')+'] '+esc(X.n)+'</h2><button class="x" data-a="close">✕</button></div>';
    h+=parch(c,id,{nm:X.n,obj:X.o,place:esc(X.z||''),tags:(X.m>c.lv?'<span class="tag">'+X.m+'레벨부터</span>':''),done:mqDone(c,X),kind:'mq',ck:String(id),pre:X.pre});
    return h+'<button class="btn ghost full" style="margin-top:8px" data-a="mzgo" data-k="'+esc((X.c||'기타')+'|'+X.z)+'">'+esc(X.z||'')+' 퀘스트 전체 보기</button>'}
  let h='<div class="sh"><h2>['+(q.lv||'?')+'] '+esc(q.nm)+'</h2><button class="x" data-a="close">✕</button></div>';
  const place=f&&f.dg?'🏰 '+esc(f.dg.ko)+' 퀘스트':f?esc(f.z)+' '+(CONT[f.z]?CONT_IC[CONT[f.z]]:''):'';
  const ck=f&&!f.dg?f.z+'|'+q.nm:String(id);const kind=f&&!f.dg?'fq':'dq';const done=f?!!((f.dg?c.dq:c.fq)||{})[ck]:null;
  h+=parch(c,id,{nm:q.nm,obj:q.obj,gv:q.gv,xy:q.xy,place,tags:chainTag(id,q)+(q.min>c.lv?'<span class="tag">'+q.min+'레벨부터</span>':''),done:f?done:null,kind,ck});
  if(f&&!f.dg)h+='<button class="btn ghost full" style="margin-top:8px" data-a="goz" data-k="'+esc(f.z)+'">'+esc(f.z)+' 퀘스트 목록으로</button>';
  return h}
const T_IC={'처치':'⚔️','수집':'📦','사용':'✋','대화':'💬','탐험':'🧭','획득':'📦','호위':'🛡️','상호작용':'✋','전달':'📨','파괴':'💥','조사':'🔍'};
const T_KO={'처치':'잡기','수집':'모으기','사용':'사용하기','대화':'대화하기','탐험':'찾아가기','획득':'얻기','호위':'호위하기','상호작용':'눌러서 조사','전달':'전달하기','파괴':'부수기','조사':'조사하기'};
function chainTag(id,q){const ch=typeof chainOf==='function'?chainOf(id):null;if(ch)return '<span class="tag lk">연계 '+((ch.find(r=>r[6]===id)||[0])[0]||'?')+'/'+ch.length+'단계</span>';const d=QD.get(id);if(d&&d.cn>1)return '<span class="tag lk">연계 '+(d.cc||'?')+'/'+d.cn+'단계</span>';return q.ch?'<span class="tag lk">연계 · 이어서 '+q.ch+'개 더</span>':''}

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
function sc(it,slot,w){if(!it)return 0;let s=0;for(const k in it.st){const v=it.st[k];if(k==='ap'&&it.sl==='ra'&&!(w.dpsRanged>0)&&/^2\.(2|3|18|16)$/.test(it.cs||''))continue;/* 활·총·석궁·투척의 전투력은 원거리 전투력 → 사냥꾼만 */if(k==='dps'){s+=v*dpsW(it,slot,w);continue}s+=v*(w[k]||0)}return s}
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
function itMeta(it){return esc((SL_KO[it.sl]||it.sl)+(CS_KO[it.cs]&&!['4.0',''].includes(it.cs)?' · '+CS_KO[it.cs]:'')+' · Lv '+it.lv+(it.est?'?':''))+(it.ph==='extra'?' <span class="tag sm" title="클래식 자료로 더한 장비라 능력치가 조금 다를 수 있어요">능력치 대략</span>':'')}

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
const TABS=[['home','<img src="img/ui-banner.png" alt="">','홈'],['gear','<img src="img/ui-shield.png" alt="">','장비'],['quest','<img src="img/ui-quest.png" alt="">','퀘스트'],['dungeon','<img src="img/ui-eye.png" alt="">','던전'],['class','<img src="img/ui-book.png" alt="">','직업']];
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
function dgNow(L){return DGS.filter(d=>L>=d.lo-1&&L<=d.hi).sort((a,b)=>a.fit-b.fit)}
function home(c){const L=c.lv;const C=D_CLS[c.cls];const sp=specOf(c);let h='<div class="wrap">';
  h+='<h2>레벨 '+L+' — 지금 할 것</h2>';
  /* 퀘스트 지역 */
  {const sec=routeOf(c).find(S=>L>=S.a&&L<=S.b);
   h+='<div class="card"><div class="hd"><h3><img class="hic" src="img/qget.png" alt="">지금 할 퀘스트</h3><button class="more" data-a="tab" data-k="quest">체크리스트 ›</button></div>';
   if(!sec)h+='<p class="note">이 레벨 레벨링 루트 자료가 없어요. 퀘스트 탭의 🗺️ 맵 전체에서 찾아보세요.</p>';
   else{const P=nowPlan(c,sec);const all=P.reduce((n,x)=>n+x.get.length,0),dn=P.reduce((n,x)=>n+x.get.filter(y=>y.done).length,0);
     h+='<p class="note">레벨 '+sec.a+'–'+sec.b+' 구간 · '+esc(sec.z)+' · <b>'+dn+'/'+all+'</b> 끝냄</p><div class="pbar"><i style="width:'+(all?Math.round(dn/all*100):0)+'%"></i></div>';
     const next=P.filter(x=>x.get.some(y=>!y.done)||x.turn.some(y=>!y.done)).slice(0,3);let n=0;
     h+=next.length?next.map(x=>{const g=x.get.filter(y=>!y.done).length,t=x.turn.filter(y=>!y.done).length;n++;return '<button class="row" data-a="tab" data-k="quest"><span class="m"><span class="nm">'+n+'. '+esc(x.n)+'</span><span class="sub">'+esc(x.z)+' · '+(g?QMK.g+'받기 '+g:'')+(g&&t?' · ':'')+(t?QMK.r+'반납 '+t:'')+'</span></span><span class="r">›</span></button>'}).join(''):'<p class="note">이 구간 퀘스트를 다 끝냈어요 👍 레벨을 올려 보세요.</p>'}
   h+='</div>'}
  /* 던전 */
  const D=dgNow(L).slice(0,3);
  h+='<div class="card"><div class="hd"><h3><img class="hic" src="img/eye.png" alt="">갈 만한 던전</h3><button class="more" data-a="tab" data-k="dungeon">전체 ›</button></div>'+(D.length?D.map(d=>{const myq=d.q.filter(q=>q.min<=L).length;const ups=dgUps(c,d).length;
     return '<button class="row" data-a="dgo" data-k="'+d.slug+'"><span class="m"><span class="nm">'+esc(d.ko)+'</span><span class="sub">권장 '+d.lo+'–'+d.hi+' · '+esc(d.loc)+'</span><span class="sub">'+(myq?'받을 퀘스트 '+myq+'개':'')+(myq&&ups?' · ':'')+(ups?'내 장비 '+ups+'개':'')+'</span></span><span class="r">›</span></button>'}).join(''):'<p class="note">레벨 '+(L<13?'13쯤부터 첫 던전(영주의 전당)을 갈 수 있어요.':'에 맞는 던전이 없어요.')+'</p>')+'</div>';
  /* 장비 */
  const U=upgrades(c,L,'ok').slice(0,4);
  h+='<div class="card"><div class="hd"><h3>🛡️ 바꾸면 좋은 장비</h3><button class="more" data-a="tab" data-k="gear">장비 ›</button></div>'+(U.length?U.map(x=>upRow(c,x)).join(''):'<p class="note">지금 레벨에서 더 좋은 장비를 못 찾았어요. 장비 탭에서 착용 중인 장비를 넣으면 더 정확해져요.</p>')+'</div>';
  /* 기술 */
  const learn=(C?C.learns:[]).filter(l=>l[0]>=L-1&&l[0]<=L+2&&(!l[4]||l[4]==='alliance'));
  if(learn.length)h+='<div class="card"><h3><img class="hic" src="img/ui-book.png" alt="">배울 기술 (직업 상급자)</h3>'+groupBy(learn,l=>l[0]).map(([lv,arr])=>'<div class="tl'+(lv<=L?'':' ')+'"><span class="lvb '+lvCls(lv,L)+'">'+lv+'</span><span class="m">'+arr.map(l=>abChip(l[1],l[5],l[3]?'':'랭크 '+l[2],lv>L)).join(' ')+'</span></div>').join('')+'<p class="note">'+(L%2?'홀수 레벨이라 새 기술은 다음 레벨에 나와요.':'짝수 레벨마다 상급자에게 가서 배우세요.')+'</p></div>';
  /* 특성 */
  if(sp&&L>=10){const st=sp.steps.filter(s=>s[0]===L||s[0]===L+1);if(st.length)h+='<div class="card"><div class="hd"><h3><img class="hic" src="img/ui-target.png" alt="">특성 ('+esc(sp.name)+')</h3><button class="more" data-a="goc" data-k="tal">순서 전체 ›</button></div>'+st.map(s=>talRow(C,s,L)).join('')+'</div>'}
  else if(L<10)h+='<div class="card"><h3><img class="hic" src="img/ui-target.png" alt="">특성</h3><p class="note">10레벨부터 특성 포인트가 1개씩 생겨요.</p></div>';
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
  let h='<div class="wrap g2"><div class="gL"><div class="armory"><div class="acol">'+DOLL_L.map(s=>dollCell(c,s,ups)).join('')+'</div>'
   +'<div class="amid"><span class="ic xl" style="background-image:url('+ICO('classicon_'+c.cls)+')"></span><b style="color:'+C[1]+'">'+esc(c.name||C[0])+'</b><small>레벨 '+L+' '+esc((sp?sp.name+' ':'')+C[0])+'</small>'
   +'<div class="ast">'+keys.map(k=>'<div><span>'+STAT_KO[k].replace(' 주문력','')+'</span><b>'+Math.round(tot[k]||0)+'</b></div>').join('')+'</div>'
   +'<button class="btn sm ghost" data-a="autofill" style="margin-top:8px">추천으로 빈 칸 채우기</button></div>'
   +'<div class="acol">'+DOLL_R.map(s=>dollCell(c,s,ups)).join('')+'</div></div>'
   +'<div class="abot">'+DOLL_B.map(s=>dollCell(c,s,ups)).join('')+'</div>';
  h+='<p class="note" style="text-align:center">칸을 누르면 아래에 지금 장비와 추천이 나와요. <span style="color:var(--good)">▲</span> = 더 좋은 게 있어요</p>';
  h+='</div><div class="gR">';
  h+='<div class="chips">'+[['ok','던전·퀘스트로 얻는 것만'],['all','경매장·제작 포함']].map(f=>'<button class="chip'+(ui.ifil===f[0]?' on':'')+'" data-a="ifil" data-k="'+f[0]+'">'+f[1]+'</button>').join('')+'</div>';
  if((W[c.cls]||{})[c.spec]&&W[c.cls][c.spec].heal&&SOLO[c.cls])h+='<div class="chips seg gmode">'+[['heal','💚 힐 위주','파티·던전'],['solo','⚔️ 사냥용','혼자 레벨업']].map(x=>'<button class="chip'+((c.gmode||'heal')===x[0]?' on':'')+'" data-a="gmode" data-k="'+x[0]+'">'+x[1]+' <span class="n">'+x[2]+'</span></button>').join('')+'</div>';
  {const P=prioLine(c);h+='<div class="card prio"><div class="ph2"><b>📊 '+esc((CINFO[c.cls]||[])[0]||'')+' '+esc(sp?sp.name:'')+' 능력치 우선순위</b></div><div class="pl">'+P.map((x,i)=>'<span><i>'+(i+1)+'</i>'+esc(x)+'</span>').join('<em>›</em>')+'</div>'+(whyOf(c)?'<p class="note">'+esc(whyOf(c))+'</p>':'')+'<p class="mute src">기준: '+esc(c.gmode==='solo'&&W[c.cls][c.spec].heal&&SOLO[c.cls]?'사냥용 표(forg 기본표 바탕)':(WSRC[c.cls+'/'+c.spec]||''))+' · forg.gg와 같은 공식</p></div>'}
  if(ui.gslot&&!offLocked(c,ui.gslot))h+=slotPanel(c,ui.gslot);
  else{const U=upgrades(c,L,ui.ifil).slice(0,6);h+='<div class="card"><h3>지금 바꾸면 좋은 것</h3>'+(U.length?U.map(x=>upRow(c,x)).join(''):'<p class="note">지금 레벨에서 더 좋은 장비가 없어요.</p>')+'</div>'}
  /* 능력치 전체 */
  const all=Object.keys(tot).sort((a,b)=>(w[b]||0)-(w[a]||0));
  h+='<div class="card"><h3>능력치 합계 (장비)</h3>'+(all.length?'<div class="stats">'+all.map(k=>'<div><span'+(w[k]?'':' class="mute"')+'>'+STAT_KO[k]+'</span><b>'+Math.round(tot[k])+'</b></div>').join('')+'</div>':'<p class="note">장비를 넣으면 합계가 나와요.</p>')
   +'<p class="note">중요한 순서 (위 우선순위와 같음): '+prioLine(c).map(esc).join(' > ')+'</p>'
   +(w.heal&&HEALER_NOTE[c.cls]?'<p class="note">💡 힐러는 레벨업 동안 방어도보다 <b>치유량·지능</b>이 중요해서 천·가죽 옷도 추천에 많이 나와요. 다른 직업과 겹치지 않게 파티에서 미리 얘기해 두세요.</p>':'')+'</div>';
  {const rows=Object.entries(w).filter(([k,v])=>v>0&&(STAT_KO[k]||k==='rdps')&&k!=='armor').sort((a,b)=>b[1]-a[1]);
   const nm=k=>k==='dps'?'무기 초당 공격력 1':k==='rdps'?'원거리 무기 초당 공격력 1':/crit|hit|dodge|parry|blockp/.test(k)?STAT_KO[k].replace(' %','')+' 1%':STAT_KO[k]+' 1';
   h+='<details class="card fold sform"><summary>📐 점수는 어떻게 매겨요? ('+esc(sp?sp.name:'')+')</summary><p class="note">점수 = 능력치 × 아래 숫자를 모두 더한 값이에요. forg.gg와 같은 틀이에요: 딜러는 <b>포에버 시뮬레이터(wowsims/forever, 60레벨)</b> 값, 힐러·시뮬 없는 특성은 forg 기본표예요. 지금 기준: <b>'+esc(WSRC[c.cls+'/'+c.spec]||'')+'</b></p>'
    +'<div class="stats">'+rows.map(([k,v])=>'<div><span>'+nm(k)+'</span><b>'+(v>=1?Math.round(v*10)/10:v.toFixed(2).replace(/0$/,''))+'점</b></div>').join('')+'</div>'
    +'<p class="note">'+(c.cls==='hunter'?'사냥꾼은 원거리 무기 DPS가 제일 중요해요.':w.rdps&&w.rdps<.1?'원거리 칸은 당기기용이라 DPS는 거의 안 세고, 힘·민첩 같은 능력치를 봐요. 활·총의 전투력은 원거리 전투력이라 빼요.':'')
    +' 치명타·적중 같은 % 효과는 "착용 효과" 글에서 읽어서 넣어요. 그 밖의 특수 효과(발동 효과 등)는 점수에 안 들어가니 <b>효과</b> 표시 장비는 직접 견줘 보세요.</p></details>'}
  const soon=upgrades(c,Math.min(60,L+5),ui.ifil,L+1).slice(0,8);
  if(soon.length)h+='<div class="card"><h3>앞으로 5레벨 안에 낄 장비</h3>'+soon.map(x=>upRow(c,x)).join('')+'</div>';
  return h+'</div></div>'}
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
  const nq=q.replace(/\s+/g,'');const hit=it=>it.nm.replace(/\s+/g,'').includes(nq);
  let list;if(q)list=ITEMS.filter(it=>usable(it,c)&&fits(it,slot,c)&&hit(it)).slice(0,60).map(it=>({it,s:sc(it,slot,w)}));
  else list=cands(c,slot,Math.min(60,L+3),ui.ifil);
  list.forEach(x=>{x.g=x.s-base(x.it)});
  const sorter=srt==='lv'?(a,b)=>b.it.ob-a.it.ob||b.it.lv-a.it.lv||b.g-a.g:(a,b)=>b.g-a.g;
  const now=list.filter(x=>x.it.ob<=L).sort(sorter),later=list.filter(x=>x.it.ob>L).sort((a,b)=>a.it.ob-b.it.ob||b.g-a.g);
  let h='<div class="sh"><h2>'+SLOT_KO[slot]+'</h2><button class="x" data-a="close">✕</button></div>';
  h+='<div class="card hl"><div class="row">'+itIcon(cur)+'<span class="m"><span class="sub">지금 착용</span><span class="nm">'+(cur?itName(cur):'<span class="mute">비어 있음</span>')+'</span>'+(cur?'<span class="sub">'+itMeta(cur)+'</span>'+statLine(cur):'')+'</span>'+(cur?'<button class="btn sm ghost" data-a="unequip" data-k="'+slot+'">빼기</button>':'')+'</div></div>';
  h+='<div class="srch"><input class="inp" placeholder="이름으로 찾기 (지금 끼고 있는 장비 넣기)" value="'+esc(ui.isrch)+'" data-c="isrch"></div>';
  h+='<div id="isres">';h+='<div class="chips">'+[['lv','레벨 높은 순'],['g','좋아지는 순']].map(f=>'<button class="chip'+(srt===f[0]?' on':'')+'" data-a="gsort" data-k="'+f[0]+'">'+f[1]+'</button>').join('')+'</div>';
  const row=x=>{const it=x.it;const lock=it.ob>L;return '<div class="row'+(lock?'" style="opacity:.55':'')+'">'+itIcon(it)+'<span class="m"><span class="nm">'+itName(it)+(it.id===(cur&&cur.id)?' <span class="tag gd">착용 중</span>':'')+'</span><span class="sub">'+itMeta(it)+(it.ob>it.lv?' · '+it.ob+'레벨쯤 얻음':'')+'</span>'+diffHtml(it,cur,c)+'<span class="sub">'+esc(srcTxt(it,2))+'</span></span><span class="r">'+gainTag(x.g,base(it),!cur)+'<br>'+infoBtn(it)+' <button class="btn sm" style="margin-top:6px" data-a="equip" data-k="'+slot+'" data-id="'+it.id+'">착용</button></span></div>'};
  h+='<h3>지금 낄 수 있어요 ('+now.length+')</h3>'+(now.length?now.map(row).join(''):'<p class="note">'+(q?'찾는 장비가 없어요. 이 직업이 못 끼는 장비일 수 있어요.':'후보가 없어요.')+'</p>');
  if(q){const no=ITEMS.filter(it=>!usable(it,c)&&SLOTS.find(x=>x[0]===slot)[2].includes(it.sl)&&hit(it)).slice(0,12);if(no.length)h+='<h3>이 직업은 못 끼는 장비 ('+no.length+')</h3>'+no.map(it=>'<div class="row" style="opacity:.5">'+itIcon(it)+'<span class="m"><span class="nm">'+itName(it)+'</span><span class="sub">'+itMeta(it)+'</span></span><span class="r">'+infoBtn(it)+'</span></div>').join('')}
  if(later.length)h+='<h3>곧 낄 수 있어요 (레벨 '+(L+1)+'~'+Math.min(60,L+3)+')</h3>'+later.map(row).join('');
  return h+'</div>'}

/* ===================== 퀘스트 ===================== */
/* ===== 빠른 레벨업: 지금 할 일 (거점별 받기·반납 묶음, 동선 순서) ===== */
function impOf(c,q,ctx){const B=[];const R=RWD.get(q.id)||{};
  const its=[...(R.ch||[]),...(R.fx||[])].map(x=>IT.get(x[0])).filter(it=>it&&usable(it,c));
  if(its.some(it=>{const b=bestSlot(it,c);return b&&b.g>.01}))B.push(['gear','⭐ 내 장비']);
  const ch=chainOf(q.id);if(ch){const st=(ch.find(r=>r[6]===q.id)||[0])[0];if(st===1)B.push(['chain','🔗 연계 시작 ('+ch.length+'단계)'])}
  if(ctx.dq.has(q.id))B.push(['dg','🏰 던전']);
  if(R.xp&&ctx.xpHi&&R.xp>=ctx.xpHi)B.push(['xp','✨ 경험치 많음']);
  return B}
function hubOfXY(zone,xy,gv){return qHub(zone,{xy,gv:gv||'',gz:zone})}
function nowPlan(c,S){const fq=c.fq||{};const seen=new Set();const Q=S.q.filter(q=>{if(seen.has(q.nm))return false;seen.add(q.nm);return true});
  const dq=new Set();DGS.forEach(d=>d.q.forEach(x=>dq.add(x.id)));
  const xs=Q.map(q=>(RWD.get(q.id)||{}).xp||0).filter(Boolean).sort((a,b)=>a-b);const xpHi=xs.length>4?xs[Math.floor(xs.length*.8)]:0;
  const ctx={dq,xpHi};const H=new Map();let ord=0;
  const hub=(z,xy,gv)=>{const [n,i]=xy?hubOfXY(z,xy,gv):['필드·아이템에서 시작',99];const k=z+'|'+n;if(!H.has(k))H.set(k,{k,z,n,i,o:ord++,get:[],turn:[],same:0});return H.get(k)};
  for(const q of Q){const z=q.gz||q.sz;const d=QD.get(q.id)||{};const done=qd(c,z,q);
    const g=hub(z,q.xy||(d.g&&d.g[2])||'',q.gv);const it={q,z,done,imp:impOf(c,q,ctx)};g.get.push(it);
    if(d.r&&d.r[0]&&!d.r[3]){const rn=npcKo(d,'r')||d.r[0];if(!d.r[2]){it.to=rn}else{const rz=d.r[1]||z;const r=hub(rz,d.r[2],rn);if(r!==g){r.turn.push(Object.assign({},it,{rv:rn}));it.to=r.n+(r.z!==z?' ('+r.z+')':'')}else g.same++}}
    else g.same++}
  return [...H.values()].filter(h=>h.get.length||h.turn.length).sort((a,b)=>(a.i>=97)-(b.i>=97)||a.o-b.o)}
const wa=w=>{const ch=(w||'').trim().slice(-1).charCodeAt(0);return ch>=0xAC00&&ch<=0xD7A3&&(ch-0xAC00)%28?'과':'와'};
function taskShort(q){const d=QD.get(q.id)||{};const T=tasksOf(d,q.obj||d.obj||'');if(!T.length)return '';const t=Object.assign({},T[0]);
  if(t.type==='대화'||/이야기하면 끝/.test(t.nm)){const nm=d.r&&d.r[0]?npcKo(d,'r'):'';return '💬 '+(nm?nm+wa(nm)+' 대화':'대화하기')}
  if(latin(t.nm)){const X=QDB&&QDB.get(q.id);const k=X&&X.t&&X.t.find(x=>x[1]&&!latin(x[1]));if(k)t.nm=k[1]}
  return (T_IC[t.type]||'•')+' '+t.nm+(t.cnt?' '+t.cnt+(t.type==='처치'?'마리':'개'):'')+' '+(T_KO[t.type]||'')+(T.length>1?' 외 '+(T.length-1)+'개':'')}
function nowCard(c,S){const P=nowPlan(c,S);const all=P.reduce((n,h)=>n+h.get.length,0),dn=P.reduce((n,h)=>n+h.get.filter(x=>x.done).length,0);
  const left=H=>H.get.filter(x=>!x.done).length+H.turn.filter(x=>!x.done).length;
  const firstOpen=(P.find(H=>left(H))||{}).k;ui.hopen=ui.hopen||{};
  const used=new Set();
  let h='<div class="card now"><div class="nh"><div><h3>지금 할 일</h3><span class="mute">'+S.a+'–'+S.b+'레벨 · 위에서부터 차례로</span></div><div class="ring" style="--p:'+(all?Math.round(dn/all*100):0)+'"><b>'+dn+'</b><span>/'+all+'</span></div></div>';
  let n=0;
  const row=(x,turn)=>{const q=x.q;const lock=q.min>c.lv;x.imp.forEach(b=>{if(b[0]!=='chain')used.add(b[0])});
    const chn=x.imp.find(b=>b[0]==='chain');const more=chn?((chn[1].match(/\((\d+)단계\)/)||[])[1]-1):0;
    const ts=turn?'다른 곳에서 받은 퀘스트 · '+(x.rv||'')+'에게 반납':taskShort(q);
    return '<div class="nr'+(x.done?' done':'')+(lock?' lock':'')+'"><label class="ck"><input type="checkbox" data-c="fq" data-id="'+(q.id||'')+'" data-k="'+esc(x.z+'|'+q.nm)+'"'+(x.done?' checked':'')+'></label>'
     +'<button class="nb" data-a="qopen" data-k="'+q.id+'"><span class="l1"><span class="qnm">'+esc(q.nm)+'</span>'+x.imp.filter(b=>b[0]!=='chain').map(b=>qico(b[0],b[1])).join('')+(q.id>=10000?qico('fnew'):'')+'<span class="qlv '+lvCls(q.lv,c.lv)+'">'+q.lv+'</span></span>'
     +(ts||lock?'<span class="l2">'+(turn?QMK.r+' ':'')+(lock?'🔒 '+q.min+'레벨부터 · ':'')+esc(ts)+'</span>':'')+(more>0?'<span class="l3">'+qico('chain')+' 끝내면 다음 퀘스트가 '+more+'개 더 이어져요</span>':'')+'</button></div>'};
  const LIM=ui.hall?99:3;let shown=0,hid=0;
  h+='<div class="steps">'+P.map(H=>{if(left(H)){if(shown>=LIM){hid++;return ''}shown++}else if(!ui.hall){return ''}const real=H.i<97;if(real)n++;const L=left(H);const todo=H.get.filter(x=>!x.done).sort((a,b)=>a.q.lv-b.q.lv),turn=H.turn.filter(x=>!x.done),done=H.get.filter(x=>x.done);
    const open=ui.hopen[H.k]!=null?ui.hopen[H.k]:H.k===firstOpen;
    const cnt=L?(todo.length?QMK.g+'받을 퀘 '+todo.length:'')+(todo.length&&turn.length?'<br>':'')+(turn.length?QMK.r+'반납할 퀘 '+turn.length:''):'완료';
    let b='<div class="st'+(L?'':' fin')+(open?' open':'')+'"><button class="sh2" data-a="hub" data-k="'+esc(H.k)+'"><span class="no">'+(L?(real?n:'·'):'✓')+'</span><span class="hn">'+(()=>{const m=H.n.match(/^(.*?) \((\d+), (\d+)\)$/);return m?'<b>'+esc(m[1])+'</b><span>'+esc(H.z)+' · 좌표 '+m[2]+', '+m[3]+'</span>':'<b>'+esc(H.n)+'</b><span>'+esc(H.z)+'</span>'})()+'</span><span class="hc">'+cnt+'</span><span class="cv">'+(open?'⌃':'⌄')+'</span></button>';
    if(open){b+='<div class="sb">'+(turn.length?turn.map(x=>row(x,1)).join(''):'')+todo.map(x=>row(x,0)).join('')+(done.length?'<div class="dn">끝낸 것 '+done.length+'개</div>'+done.map(x=>row(x,0)).join(''):'')+'</div>'}
    return b+'</div>'}).join('')+'</div>';
  const finN=P.filter(H=>!left(H)).length;
  if(hid||(!ui.hall&&finN))h+='<button class="btn ghost full sm more2" data-a="hall">'+(hid?'다음 마을 '+hid+'곳 더 보기':'')+(hid&&finN?' · ':'')+(finN?'끝낸 마을 '+finN+'곳':'')+'</button>';
  else if(ui.hall)h+='<button class="btn ghost full sm more2" data-a="hall">접기</button>';
  if(used.size)h+='<p class="legend">'+[...used].map(k=>qico(k)+' '+QIC_KO[k]).join(' · ')+'</p>';
  return h+'</div>'}
/* ===== 퀘스트 검색 ===== */
function qSearchHtml(c,q){const nq=q.replace(/\s+/g,'');if(nq.length<1)return '';
  if(!QDB){qdbLoad();return '<p class="note">퀘스트 자료를 불러오는 중…</p>'}
  const L=c.lv;const hit=s=>(s||'').replace(/\s+/g,'').includes(nq);const R=[];
  for(const x of QDB.values()){if(!qdbOk(c,x))continue;const a=hit(x.n),b=x.g&&hit(x.g[0]),z=hit(x.z);if(!(a||b||z))continue;
    R.push({x,sc:(x.n.replace(/\s+/g,'').startsWith(nq)?0:a?1:b?2:3)*100+Math.abs((x.lv||L)-L)})}
  R.sort((a,b)=>a.sc-b.sc);const n=R.length;
  if(!n)return '<p class="empty-st">"'+esc(q)+'"(으)로 찾은 퀘스트가 없어요.</p>';
  return '<p class="mute sr">'+n+'개 찾음'+(n>40?' · 가까운 레벨 40개만':'')+'</p><div class="srl">'+R.slice(0,40).map(({x})=>{const d=mqDone(c,x);
    return '<button class="srow'+(d?' done':'')+'" data-a="qopen" data-k="'+x.id+'"><span class="qlv '+lvCls(x.lv,L)+'">'+(x.lv||'?')+'</span><span class="t"><b>'+esc(x.n)+'</b><span>'+esc(x.z||'')+(x.g&&x.g[0]?' · '+esc(x.g[0]):'')+(x.m>L?' · 🔒'+x.m+'레벨부터':'')+'</span></span>'+(d?'<span class="ok">✓</span>':'')+'</button>'}).join('')+'</div>'}
/* ===================== 📍 지도로 퀘스트 보기 (대륙 지도: wowf.io 지도 그림) ===================== */
/* 지역 좌표(%) → 대륙 지도 좌표: [a,b,c,d] → x=a+b·X, y=c+d·Y (wowf.io 지점으로 맞춘 값, 오차 1픽셀 안) */
const MAPZ={'그늘숲':[9543.8,12.96,7040.3,8.635],'타나리스':[2080.5,33.131,8515.3,22.092],'엘윈 숲':[9206.6,16.666,6186.9,11.112],'서부 몰락지대':[8495.7,16.808,6888,11.199],'붉은마루 산맥':[10750.7,10.426,6492.2,6.946],'모단 호수':[10900.9,13.242,4530,8.829],'황야의 땅':[10941.6,11.946,5203.3,7.952],'썬더 블러프':[1727.7,5.015,6104,3.34],'달의 숲':[2637.9,11.103,1620.1,7.383],'스톰윈드':[9117,8.338,6214.2,5.559],'가시덤불 골짜기':[8878.1,30.622,7736.9,20.421],'저습지':[10130.7,19.857,3407.1,13.229],'다르나서스':[565.3,5.089,781.4,3.39],'던 모로':[9078.9,23.643,4236.8,15.763],'서부 역병지대':[9743.5,20.65,760.3,13.757],'잊혀진 땅':[-55.9,21.58,5479.2,14.386],'아이언포지':[10286.4,3.8,4569.2,2.535],'텔드랏실':[144.8,24.444,16.9,16.289],'동부 내륙지':[10699.8,18.49,1672.2,12.313],'아라시 고원':[10359.9,17.28,2440,11.518],'힐스브래드 구릉지':[9432.3,15.352,2183.6,10.243],'알터랙 산맥':[9567.9,13.443,1656.5,8.951],'먼지진흙 습지대':[2444.4,25.196,6672,16.797],'어둠의 해안':[564.6,31.425,1696.1,20.958],'불모의 땅':[715.8,48.659,4921.8,32.438],'잿빛 골짜기':[1160.1,27.675,3452.8,18.454],'악령의 숲':[1187.9,27.602,2272,18.403],'여명의 설원':[2128.4,34.075,1600.1,22.719],'운고로 분화구':[1719.8,17.765,8560.3,11.836],'돌발톱 산맥':[418.8,23.426,4296.1,15.629],'페랄라스':[-636.2,33.36,6831.9,22.243],'버섯구름 봉우리':[2185.3,21.101,7599.4,14.089],'실리더스':[758,16.72,8556.2,11.146],'슬픔의 늪':[11011.1,11.008,6994.2,7.336],'저주받은 땅':[10538.7,16.104,7448.3,10.712],'멀고어':[786.9,29.517,5567.5,19.699],'오그리마':[3742.5,6.733,4604.4,4.492],'언더시티':[9523.9,4.622,1474.7,3.07],'아즈샤라':[3548.6,24.349,3132.2,16.226],'이글거리는 협곡':[10099.1,10.707,5304.2,7.137],'불타는 평원':[10072.6,14.051,5750.8,9.375],'티리스팔 숲':[8486.6,21.72,535.7,14.433],'동부 역병지대':[11026.6,20.657,604,13.763],'듀로타':[2921.6,25.31,4828.3,16.905],'은빛소나무 숲':[8287.4,20.169,1573.2,13.5],'셴드랄라스':[1004.4,9.84,6607.6,6.569],'강물터':[10852.1,23.271,5478.4,15.542]};
const ZALIAS={'먼지진흙 슾지대':'먼지진흙 습지대'};const zn=z=>ZALIAS[z]||z;const zEq=(a,b)=>!!a&&zn(a)===zn(b);
const ATL={ek:{n:'eastern-kingdoms',w:5120,h:9728,ko:'동부 왕국'},ka:{n:'kalimdor',w:6400,h:10240,ko:'칼림도어'}};
function toAtlas(zone,xy){const t=MAPZ[ZALIAS[zone]||zone];if(!t||!xy)return null;const p=String(xy).split(',').map(Number);if(p.length<2||isNaN(p[0]))return null;
  let x=t[0]+t[1]*p[0],y=t[2]+t[3]*p[1];const c=x>=8192?'ek':'ka';if(c==='ek')x-=8192;return {c,x,y}}
function amCanQ(c,q){const L=c.lv;const f=(ui.amf||{}).lv||'now';if(mqDone(c,q)||!qdbOk(c,q))return false;if(f==='all')return (q.m||0)<=L+5;return (q.m||0)<=L&&q.lv>=L-5&&q.lv<=L+3}
const AMF0={g:1,r:0,rt:1,tr:0,fp:0,inn:0,lv:'now'};
const amF=()=>Object.assign({},AMF0,ui.amf||{});
const AMIC={g:()=>QMK.g,r:()=>QMK.r,fp:()=>'🦅',inn:()=>'🏠',tr:()=>'<img class="qmk" src="img/ui-book.png" alt="교관">',ob:()=>'⚔️'};
/* 지도에 찍을 점: 받는 곳(!)·반납(?)·교관(책)·비행(🦅)·여관(🏠) — 같은 NPC는 하나로 묶음 */
function amPoints(c){const F=amF();const P=new Map();
  const add=(kind,zone,xy,nm,q)=>{const a=toAtlas(zone,xy);if(!a)return;const k=kind+'|'+a.c+'|'+Math.round(a.x/6)+'|'+Math.round(a.y/6);let o=P.get(k);if(!o){o={kind,zone,nm,c:a.c,x:a.x,y:a.y,qs:[]};P.set(k,o)}if(q)o.qs.push(q)};
  if(QDB)for(const q of QDB.values()){if(!amCanQ(c,q))continue;if(F.g&&q.g&&q.g[3]==='npc')add('g',q.g[1],q.g[2],q.g[0],q);if(F.r&&q.r&&q.r[1])add('r',q.r[1],q.r[2],q.r[0],q)}
  if(WLD){if(F.fp)WLD.fp.forEach(f=>add('fp',f[1],f[2],f[0]));if(F.inn)WLD.inn.forEach(f=>add('inn',f[1],f[2],f[0]));if(F.tr)(WLD.tr[c.cls]||[]).forEach(f=>add('tr',f[1],f[2],f[0]))}
  return [...P.values()]}
/* 지금 할 일 동선: 마을 순서대로 번호 */
function amRoute(c){const S=routeOf(c).find(S=>c.lv>=S.a&&c.lv<=S.b);if(!S)return [];const out=[];let n=0;
  for(const H of nowPlan(c,S)){const left=H.get.filter(x=>!x.done).length+H.turn.filter(x=>!x.done).length;if(!left||H.i>=97)continue;
    const m=H.n.match(/^(.*?) \((\d+), (\d+)\)$/);if(!m)continue;const a=toAtlas(H.z,m[2]+','+m[3]);if(!a)continue;n++;out.push({kind:'hub',no:n,nm:m[1],zone:H.z,c:a.c,x:a.x,y:a.y,H})}
  return out}
/* 고른 퀘스트: 받는 곳 → 할 일 위치 → 반납 */
function amFocus(id){const q=QDB&&QDB.get(id);if(!q)return null;const z=(q.g&&q.g[1])||q.z;const P=[];
  if(q.g&&q.g[2]){const a=toAtlas(q.g[1],q.g[2]);if(a)P.push(Object.assign(a,{kind:'g',nm:q.g[0]}))}
  const d=QD.get(id);if(d){for(const t of tasksOf(d,d.obj||q.o||'')){const m=(t.where||'').match(/([\d.]+),\s*([\d.]+)/);if(!m)continue;const a=toAtlas(z,m[1]+','+m[2]);if(a)P.push(Object.assign(a,{kind:'ob',nm:t.nm}))}}
  if(q.r&&q.r[2]){const a=toAtlas(q.r[1]||z,q.r[2]);if(a)P.push(Object.assign(a,{kind:'r',nm:q.r[0]}))}
  return P.length?{q,P}:null}
function amView(c){if(!QDB)qdbLoad();if(!WLD)wldLoad();const F=amF();
  if(!ui.am)ui.am=amHome(c);
  const A=ui.am;const chip=(k,lab)=>'<button class="chip'+(F[k]?' on':'')+'" data-a="amf" data-k="'+k+'">'+lab+'</button>';
  let h='<div class="am"><div class="chips seg">'+['ek','ka'].map(k=>'<button class="chip'+(A.c===k?' on':'')+'" data-a="amc" data-k="'+k+'">'+CONT_IC[ATL[k].ko]+' '+ATL[k].ko+'</button>').join('')+'</div>'
   +'<div class="chips amfl">'+chip('rt','① 동선')+chip('g',QMK.g+'받는 곳')+chip('r',QMK.r+'반납')+chip('tr',AMIC.tr()+'교관')+chip('fp','🦅 비행')+chip('inn','🏠 여관')
   +'<button class="chip'+(F.lv==='all'?' on':'')+'" data-a="amlv">'+(F.lv==='all'?'모든 레벨':'내 레벨 ±')+'</button></div>'
   +'<div id="amap" class="amap"><div class="amL"></div><div class="amP"></div><div class="amctl"><button data-am="in" aria-label="확대">+</button><button data-am="out" aria-label="축소">−</button><button data-am="me" aria-label="지금 구간으로">◎</button></div>'
   +(QDB?'':'<div class="amload">퀘스트 자료를 불러오는 중…</div>')+'</div><div id="ampanel"></div>'
   +'<p class="mute src">끌어서 움직이고, 두 손가락·두 번 톡·+/− 로 확대해요 · 번호는 「지금 할 일」 마을 순서 · 지도 그림: wowf.io</p></div>';
  return h}
function amHome(c){const R=amRoute(c);if(R.length)return {c:R[0].c,z:2.6,cx:R[0].x,cy:R[0].y};
  const S=routeOf(c).find(S=>c.lv>=S.a&&c.lv<=S.b);const z=S?S.z.split(' · ')[0]:'';const a=toAtlas(z,'50,50');return a?{c:a.c,z:2,cx:a.x,cy:a.y}:{c:'ek',z:0.3,cx:2560,cy:4864}}
let AM=null;
function amInit(){const el=document.getElementById('amap');if(!el)return;const c=me();if(!c)return;const F=amF();
  const st={el,L:el.querySelector('.amL'),P:el.querySelector('.amP'),pts:amPoints(c),route:F.rt?amRoute(c):[],drag:null,ptr:new Map(),tap:0};AM=st;
  const NT={ek:[[3,5],[5,10],[10,19],[20,38]],ka:[[4,6],[7,12],[13,23],[25,40]]};
  const clamp=()=>{const A=ui.am,T=ATL[A.c];A.z=Math.max(0,Math.min(4,A.z));A.cx=Math.max(0,Math.min(T.w,A.cx));A.cy=Math.max(0,Math.min(T.h,A.cy))};
  function draw(){clamp();const A=ui.am,T=ATL[A.c],W=el.clientWidth,H=el.clientHeight,s=2**(A.z-3),left=A.cx-W/2/s,top=A.cy-H/2/s;
    const tz=Math.max(0,Math.min(3,Math.ceil(A.z-0.2))),ts=256*2**(A.z-tz),span=256*2**(3-tz);
    const [nx,ny]=NT[A.c][tz];const tx0=Math.max(0,Math.floor(left/span)),ty0=Math.max(0,Math.floor(top/span)),tx1=Math.min(nx-1,Math.floor((left+W/s)/span)),ty1=Math.min(ny-1,Math.floor((top+H/s)/span));
    let t='';for(let x=tx0;x<=tx1;x++)for(let y=ty0;y<=ty1;y++)t+='<img src="https://assets.wowf.io/world/atlas/'+T.n+'/'+tz+'/'+x+'_'+y+'.webp" style="left:'+(x*span-left)*s+'px;top:'+(y*span-top)*s+'px;width:'+(ts+.5)+'px;height:'+(ts+.5)+'px" alt="" draggable="false" onerror="this.style.visibility=\'hidden\'">';
    st.L.innerHTML=t;st.L.style.transform=st.P.style.transform='';
    const X=p=>(p.x-left)*s,Y=p=>(p.y-top)*s,inV=(x,y,m)=>x>-m&&y>-m&&x<W+m&&y<H+m;
    const vis=st.pts.filter(p=>p.c===A.c);let pins='',svg='';
    if(A.z<1.5){const Z={};vis.forEach(p=>{if(p.kind!=='g'&&p.kind!=='r')return;const o=Z[p.zone]||(Z[p.zone]={n:0,x:0,y:0,k:0});o.n+=p.qs.length;o.x+=p.x;o.y+=p.y;o.k++});
      const RZ=new Set(st.route.map(r=>r.zone));
      for(const [z,o] of Object.entries(Z)){const x=(o.x/o.k-left)*s,y=(o.y/o.k-top)*s;if(!inV(x,y,40))continue;
        pins+='<button class="amz'+(RZ.has(z)?' now':'')+'" data-amz="'+esc(z)+'" style="left:'+x+'px;top:'+y+'px">'+QMK.g+'<b>'+o.n+'</b> '+esc(z)+'</button>'}
      vis.filter(p=>!p.qs.length).forEach(p=>{const x=X(p),y=Y(p);if(inV(x,y,20))pins+='<span class="amd" style="left:'+x+'px;top:'+y+'px">'+AMIC[p.kind]()+'</span>'})}
    else{for(const z in MAPZ){const q=toAtlas(z,'50,50');if(!q||q.c!==A.c)continue;const x=X(q),y=Y(q);if(inV(x,y,60))pins+='<button class="amn" data-amzi="'+esc(z)+'" style="left:'+x+'px;top:'+y+'px">'+esc(z)+'</button>'}
      const lab=A.z>=3.3;
      vis.forEach((p,i)=>{const x=X(p),y=Y(p);if(!inV(x,y,20))return;const n=p.qs.length;const lv=n?Math.min(...p.qs.map(q=>q.lv||c.lv)):0;
        pins+='<button class="amk k-'+p.kind+(n?' '+lvCls(lv,c.lv):'')+(ui.amsel===i?' sel':'')+'" data-amk="'+i+'" title="'+esc(p.nm||'')+'" style="left:'+x+'px;top:'+y+'px">'+AMIC[p.kind]()+(n>1?'<b>'+n+'</b>':'')+(lab&&p.nm?'<i>'+esc(p.nm)+'</i>':'')+'</button>'})}
    /* 동선 번호와 선 */
    const R=st.route.filter(r=>r.c===A.c);if(R.length){svg+='<polyline points="'+R.map(r=>X(r)+','+Y(r)).join(' ')+'" class="amrt"/>';
      R.forEach(r=>{const x=X(r),y=Y(r);if(inV(x,y,30))pins+='<button class="amh'+(ui.amhub===r.no?' sel':'')+'" data-amh="'+r.no+'" style="left:'+x+'px;top:'+y+'px">'+r.no+'</button>'})}
    /* 고른 퀘스트 */
    const FO=ui.amq&&amFocus(ui.amq);if(FO){const fp=FO.P.filter(p=>p.c===A.c);if(fp.length>1)svg+='<polyline points="'+fp.map(p=>X(p)+','+Y(p)).join(' ')+'" class="amfq"/>';
      fp.forEach(p=>{pins+='<span class="amf k-'+p.kind+'" style="left:'+X(p)+'px;top:'+Y(p)+'px">'+AMIC[p.kind]()+'<i>'+esc(p.nm||'')+'</i></span>'})}
    /* 지금 보고 있는 지역 (가운데 기준) */let cur='';if(A.z>=1.5){let best=1e9;for(const z in MAPZ){const t=MAPZ[z];const ox=A.c==='ek'?A.cx+8192:A.cx;const px=(ox-t[0])/t[1],py=(A.cy-t[2])/t[3];if(px<0||px>100||py<0||py>100)continue;const q=toAtlas(z,'50,50');if(!q||q.c!==A.c)continue;const sc=t[1];if(sc<best){best=sc;cur=z}}}
    pins+=cur?'<button class="amcur" data-amzi="'+esc(cur)+'">🗺️ '+esc(cur)+' <b>정보 ›</b></button>':'';
    st.P.innerHTML=(svg?'<svg class="amsvg" width="'+W+'" height="'+H+'">'+svg+'</svg>':'')+pins;st.vis=vis}
  st.draw=draw;draw();
  const zoomAt=(dz,px,py)=>{const A=ui.am,s=2**(A.z-3),W=el.clientWidth,H=el.clientHeight;const ax=A.cx+(px-W/2)/s,ay=A.cy+(py-H/2)/s;A.z+=dz;clamp();const s2=2**(A.z-3);A.cx=ax-(px-W/2)/s2;A.cy=ay-(py-H/2)/s2;draw()};
  st.zoomAt=zoomAt;
  el.addEventListener('pointerdown',e=>{if(e.target.closest('.amctl'))return;el.setPointerCapture(e.pointerId);st.ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(st.ptr.size===1)st.drag={x:e.clientX,y:e.clientY,dx:0,dy:0,t:e.target};else{const [a,b]=[...st.ptr.values()];const r=el.getBoundingClientRect();st.pinch={d:Math.hypot(a.x-b.x,a.y-b.y),r:1,cx:(a.x+b.x)/2-r.left,cy:(a.y+b.y)/2-r.top};st.drag=null}});
  el.addEventListener('pointermove',e=>{if(!st.ptr.has(e.pointerId))return;st.ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(st.pinch&&st.ptr.size>=2){const [a,b]=[...st.ptr.values()];st.pinch.r=Math.hypot(a.x-b.x,a.y-b.y)/st.pinch.d;const o=st.pinch.cx+'px '+st.pinch.cy+'px';st.L.style.transformOrigin=st.P.style.transformOrigin=o;st.L.style.transform=st.P.style.transform='scale('+st.pinch.r+')';return}
    if(st.drag){st.drag.dx=e.clientX-st.drag.x;st.drag.dy=e.clientY-st.drag.y;st.L.style.transform=st.P.style.transform='translate('+st.drag.dx+'px,'+st.drag.dy+'px)'}});
  const up=e=>{if(!st.ptr.has(e.pointerId))return;st.ptr.delete(e.pointerId);const r=el.getBoundingClientRect();
    if(st.pinch){if(st.ptr.size===0){const p=st.pinch;st.pinch=null;st.L.style.transformOrigin=st.P.style.transformOrigin='';zoomAt(Math.log2(Math.max(.2,p.r)),p.cx,p.cy)}return}
    const d=st.drag;st.drag=null;if(!d)return;
    if(Math.abs(d.dx)+Math.abs(d.dy)<6){const k=d.t.closest&&d.t.closest('[data-amk],[data-amz],[data-amh],[data-amzi]');
      if(k&&k.dataset.amzi){ui.amzone=k.dataset.amzi;ui.amsel=null;ui.amhub=null;draw();amPanel({kind:'zone',zone:ui.amzone});return}
      if(k&&k.dataset.amz){const a=toAtlas(k.dataset.amz,'50,50');if(a){ui.am={c:a.c,z:2,cx:a.x,cy:a.y};ui.amsel=null;ui.amzone=k.dataset.amz;draw();amPanel({kind:'zone',zone:ui.amzone})}return}
      if(k&&k.dataset.amh){ui.amzone=null;ui.amhub=+k.dataset.amh;ui.amsel=null;draw();amPanel(st.route.find(x=>x.no===ui.amhub));return}
      if(k&&k.dataset.amk){ui.amzone=null;ui.amsel=+k.dataset.amk;ui.amhub=null;draw();amPanel(st.vis[ui.amsel]);return}
      const now=Date.now();if(now-st.tap<320){st.tap=0;zoomAt(1,e.clientX-r.left,e.clientY-r.top)}else{st.tap=now;st.L.style.transform=st.P.style.transform=''}return}
    const s=2**(ui.am.z-3);ui.am.cx-=d.dx/s;ui.am.cy-=d.dy/s;draw()};
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  el.addEventListener('wheel',e=>{e.preventDefault();const r=el.getBoundingClientRect();zoomAt(e.deltaY<0?.5:-.5,e.clientX-r.left,e.clientY-r.top)},{passive:false});
  el.querySelectorAll('[data-am]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const r=el.getBoundingClientRect();const k=b.dataset.am;
    if(k==='in')zoomAt(1,r.width/2,r.height/2);else if(k==='out')zoomAt(-1,r.width/2,r.height/2);else{ui.am=amHome(c);ui.amq=null;draw();amPanel(null)}}));
  if(ui.amq)amPanel({kind:'focus'});else if(ui.amzone)amPanel({kind:'zone',zone:ui.amzone});else if(ui.amhub&&st.route.find(x=>x.no===ui.amhub))amPanel(st.route.find(x=>x.no===ui.amhub));else if(ui.amsel!=null&&st.vis&&st.vis[ui.amsel])amPanel(st.vis[ui.amsel])}
function amRow(c,q,id){return '<div class="amrow"><button class="lhq" data-a="qopen" data-k="'+(id||q.id)+'"><span class="qlv '+lvCls(q.lv,c.lv)+'">'+q.lv+'</span><span class="t"><b>'+esc(q.n||q.nm)+'</b><span>'+esc(((q.o||'').length>60?(q.o||'').slice(0,58)+'…':(q.o||'')))+'</span></span></button>'+(QDB&&QDB.get(id||q.id)?'<button class="amgo" data-a="amq" data-k="'+(id||q.id)+'" title="지도에 할 일 위치 보기">📍</button>':'')+'</div>'}
function amPanel(p){const box=document.getElementById('ampanel');if(!box)return;const c=me();if(!p){box.innerHTML='';return}
  if(p.kind==='focus'){const FO=amFocus(ui.amq);if(!FO){box.innerHTML='';return}const q=FO.q;
    box.innerHTML='<div class="card amcard"><div class="amh2"><b>📍 '+esc(q.n)+'</b><button class="btn sm ghost" data-a="amq" data-k="">끄기</button></div><p class="mute">'+FO.P.map(x=>AMIC[x.kind]()+' '+esc(x.nm||'')).join(' → ')+'</p>'
     +(FO.P.some(x=>x.kind==='ob')?'':'<p class="mute">할 일 위치 자료가 없어서 받는 곳·반납하는 곳만 보여요.</p>')+'</div>';return}
  if(p.kind==='zone'){box.innerHTML='<div class="card amcard">'+zoneInfo(c,p.zone,{title:1,btn:1})+'</div>';return}
  if(p.kind==='hub'){const H=p.H;const rows=[...H.turn.filter(x=>!x.done).map(x=>[x,1]),...H.get.filter(x=>!x.done).map(x=>[x,0])];
    box.innerHTML='<div class="card amcard"><div class="amh"><b>'+p.no+'. '+esc(p.nm)+'</b><span class="mute">'+esc(p.zone)+' · '+QMK.g+'받기 '+H.get.filter(x=>!x.done).length+(H.turn.filter(x=>!x.done).length?' · '+QMK.r+'반납 '+H.turn.filter(x=>!x.done).length:'')+'</span></div>'
     +rows.map(([x,t])=>amRow(c,{n:(t?'❓ ':'')+x.q.nm,lv:x.q.lv,o:t?((x.rv||'')+'에게 반납'):''},x.q.id)).join('')+'</div>';return}
  const t=p.kind==='fp'?'🦅 비행 조련사':p.kind==='inn'?'🏠 여관 주인':p.kind==='tr'?AMIC.tr()+' 직업 교관':p.kind==='r'?QMK.r+' 반납하는 곳':QMK.g+' 받는 곳';
  box.innerHTML='<div class="card amcard"><div class="amh"><b>'+esc(p.nm||'')+'</b><span class="mute">'+t+' · '+esc(p.zone)+'</span></div>'
   +(p.qs.length?p.qs.sort((a,b)=>a.lv-b.lv).map(q=>amRow(c,q)).join(''):'<p class="mute">'+(p.kind==='fp'?'처음 가면 말 걸어서 비행 경로를 열어 두세요':p.kind==='tr'?'새 기술을 배우러 오는 곳이에요':'귀환석을 여기 맞출 수 있어요')+'</p>')+'</div>'}

/* ===== 지역 정보: 이 지역에서 얻는 장비(퀘스트 보상·몹 드랍)·이동·사냥터 ===== */
let SRCIT=null;function srcItems(){if(SRCIT)return SRCIT;SRCIT=new Map();ITEMS.forEach(it=>it.src.forEach(i=>{let a=SRCIT.get(i);if(!a)SRCIT.set(i,a=[]);a.push(it)}));return SRCIT}
function zoneItems(c,zone){const L=c.lv;const out=new Map();let nq=0,nd=0;
  const put=(it,how,lv,kind)=>{if(!it||!it.sl||!usable(it,c)||it.ob>L+4)return;if(kind==='q')nq++;else nd++;const b=bestSlot(it,c);const o={it,how,lv:Math.max(lv||0,it.ob||0),g:b?b.g:0,s:b&&b.s,kind};const p=out.get(it.id);if(!p||o.g>p.g)out.set(it.id,o)};
  if(QDB)for(const q of QDB.values()){if(!(zEq(q.z,zone)||(q.g&&zEq(q.g[1],zone)))||!qdbOk(c,q)||mqDone(c,q))continue;const r=RWD.get(q.id);if(!r)continue;
    for(const x of [...(r.ch||[]),...(r.fx||[])])put(IT.get(x[0]),'퀘스트 「'+q.n+'」',Math.max(q.m||0,(q.lv||0)-3),'q')}
  const nz=(WLD&&WLD.nz)||{};const SI=srcItems();
  SRC.forEach((s,i)=>{if(!s||s.k!==3)return;const m=s.label.match(/\(([^)]+)\)$/);const id=(s.href.match(/npc=(\d+)/)||[])[1];const z=m?m[1]:id?nz[id]:null;if(!zEq(z,zone))return;
    (SI.get(i)||[]).forEach(it=>put(it,s.label.replace(/^드랍 · /,'').replace(/ \([^)]+\)$/,'')+' 처치',0,'d'))});
  return {list:[...out.values()],nq,nd}}
function zoneInfo(c,zone,opt){opt=opt||{};const L=c.lv;
  const qs=QDB?[...QDB.values()].filter(q=>(zEq(q.z,zone)||(q.g&&zEq(q.g[1],zone)))&&qdbOk(c,q)):[];const lv=qs.map(q=>q.lv).filter(x=>x>0).sort((a,b)=>a-b);
  const lo=lv[Math.floor(lv.length*.1)]||0,hi=lv[Math.min(lv.length-1,Math.floor(lv.length*.9))]||0;const left=qs.filter(q=>!mqDone(c,q)).length;
  const now=qs.filter(q=>!mqDone(c,q)&&(q.m||0)<=L&&q.lv>=L-5&&q.lv<=L+3).length;
  const Z=zoneItems(c,zone);const good=Z.list.filter(x=>x.g>.01).sort((a,b)=>b.g-a.g);
  let h=(opt.title?'<div class="amh"><b>'+esc(zone)+(lo?' <small class="mute">Lv '+lo+'–'+hi+'</small>':'')+'</b><span class="mute">'+QMK.g+' 지금 할 퀘 '+now+' · 남은 퀘 '+left+'</span></div>':'');
  h+='<h5 class="zh">⭐ 나한테 좋은 장비 '+(good.length?good.length+'개':'')+'</h5>';
  h+=good.length?good.slice(0,opt.n||6).map(x=>'<button class="zit" data-a="info" data-k="'+x.it.id+'">'+itIcon(x.it)+'<span class="t">'+itName(x.it)+'<span>'+esc(SLOT_KO[x.s]||'')+' · '+esc(x.how)+'</span></span><span class="qlv '+lvCls(x.lv,L)+'">'+(x.lv||'?')+'</span></button>').join('')
    :'<p class="mute">지금 끼고 있는 것보다 좋은 장비는 여기 없어요.</p>';
  h+='<p class="mute zsum">지금 레벨(+4까지)에 이 지역에서 얻는 장비: 퀘스트 보상 '+Z.nq+'개 · 몹 드랍 '+Z.nd+'개 · 내 직업이 쓸 수 있는 것만</p>';
  if(WLD){const f=WLD.fp.find(x=>zEq(x[1],zone)),i=WLD.inn.find(x=>zEq(x[1],zone)),T=(WLD.tr[c.cls]||[]).find(x=>zEq(x[1],zone));
    if(f||i||T)h+='<h5 class="zh">🧭 이동·편의</h5><p class="zmv">'+(f?'🦅 '+esc(f[0])+' '+xyTxt(f[2])+'<br>':'')+(i?'🏠 '+esc(i[0])+' '+xyTxt(i[2])+'<br>':'')+(T?'<img class="qmk" src="img/ui-book.png" alt=""> '+esc(T[0])+' '+xyTxt(T[2]):'')+'</p>';
    const M=(WLD.mob[zone]||WLD.mob[Object.keys(WLD.mob).find(k=>zEq(k,zone))]||[]).filter(m=>m[1]<=L+1&&m[2]>=L-1).slice(0,3);if(M.length)h+='<h5 class="zh">⚔️ 내 레벨 사냥터</h5><p class="zmv">'+M.map(m=>esc(m[0])+' <span class="qlv '+lvCls(m[2],L)+'">'+(m[1]===m[2]?m[1]:m[1]+'–'+m[2])+'</span> '+m[4]+', '+m[5]+' · '+m[3]+'마리쯤').join('<br>')+'</p>'}
  if(opt.btn)h+='<button class="btn sm ghost full" data-a="zq" data-k="'+esc(zone)+'">이 지역 퀘스트 목록 ›</button>';
  return h}

/* ===== 레벨업 도우미: 직업 퀘스트 · 교관 · 던전 · 이동 · 사냥터 ===== */
let WLD=null,WLD_LOAD=false;
function wldLoad(){if(WLD_LOAD)return;WLD_LOAD=true;fetch('data/qdb/world.json?v='+D_VER.world).then(r=>r.ok?r.json():null).then(j=>{WLD=j||{fp:[],inn:[],tr:{},mob:{}};if(ui.tab==='quest')rerender(true)}).catch(()=>{WLD={fp:[],inn:[],tr:{},mob:{}}})}
const CAPITAL={human:'스톰윈드',dwarf:'아이언포지',gnome:'아이언포지',nightelf:'다르나서스',skyborne:'스톰윈드'};
const xyTxt=xy=>{const p=(xy||'').split(',');return p.length===2?Math.round(+p[0])+', '+Math.round(+p[1]):''};
function clsQuests(c){if(!QDB)return null;const L=c.lv;const dn=id=>{const q=QDB.get(id);return q?mqDone(c,q):true};
  const out=[],seen=new Set();for(const q of QDB.values()){if(!q.cls||!qdbOk(c,q)||mqDone(c,q)||/행사|축제|침공/.test(q.z||''))continue;if((q.m||0)>L+1||(q.lv||0)>L+5||(q.lv||0)<L-10)continue;
    if(q.pre1&&!dn(q.pre1))continue;if(q.pre&&q.pre.length&&!q.pre.some(dn))continue;if(seen.has(q.n))continue;seen.add(q.n);out.push(q)}
  return out.sort((a,b)=>(a.m||0)-(b.m||0)||a.lv-b.lv)}
function lvHelp(c,S,NX){if(!WLD)wldLoad();if(!QDB)qdbLoad();const L=c.lv;const C=D_CLS[c.cls];const zs=S?S.z.split(' · '):[];
  const CKO=(CINFO[c.cls]||[])[0]||'';let rows=[];
  /* 1) 직업 퀘스트 */
  const cq=clsQuests(c);
  if(cq===null)rows.push(['cls',qico('cls'),CKO+' 직업 퀘스트','<p class="mute">퀘스트 자료를 불러오는 중…</p>']);
  else if(cq.length){const now=cq.filter(q=>(q.m||0)<=L),soon=cq.filter(q=>(q.m||0)>L);
    rows.push(['cls',qico('cls'),CKO+' 직업 퀘스트 '+now.length+'개'+(soon.length?' · 곧 '+soon.length+'개':''),
      now.slice(0,4).map(q=>'<button class="lhq" data-a="qopen" data-k="'+q.id+'"><span class="qlv '+lvCls(q.lv,L)+'">'+q.lv+'</span><span class="t"><b>'+esc(q.n)+'</b><span>'+(q.g&&q.g[3]==='item'?'📦 아이템으로 시작 · '+esc(q.z||''):q.g&&q.g[0]?esc(q.g[0])+' · '+esc(q.g[1]||'')+(q.g[2]?' '+xyTxt(q.g[2]):''):'')+'</span></span>'+(q.id>=10000?qico('fnew'):'')+'</button>').join('')
      +(now.length>4?'<button class="lhm" data-a="qmode" data-k="map">나머지 '+(now.length-4)+'개는 맵 전체 › 직업에서</button>':'')
      +(soon.length?'<p class="mute">🔒 '+soon.slice(0,3).map(q=>esc(q.n)+' ('+q.m+'레벨)').join(' · ')+'</p>':'')])}
  else{let nm=99,nq=null;for(const q of QDB.values()){if(q.cls&&qdbOk(c,q)&&!mqDone(c,q)&&!/행사|축제|침공/.test(q.z||'')&&(q.m||0)>L&&(q.m||0)<nm&&!q.pre1&&!(q.pre&&q.pre.length)){nm=q.m;nq=q}}
    rows.push(['cls',qico('cls'),CKO+' 직업 퀘스트','<p class="mute">지금 레벨에 할 직업 퀘스트는 없어요.'+(nq?' 다음은 <b>'+nm+'레벨</b> 「'+esc(nq.n)+'」('+esc(nq.g&&nq.g[1]||nq.z||'')+')부터예요.':'')+'</p>'])}
  /* 2) 교관 */
  if(C&&C.learns){const from=c.trn!=null?c.trn:L-2;const ls=C.learns.filter(l=>l[0]>from&&l[0]<=L&&(!l[4]||l[4]==='alliance'));
    const nx=C.learns.filter(l=>l[0]>L&&(!l[4]||l[4]==='alliance'));const nxL=nx.length?nx[0][0]:0;
    const T=(WLD&&WLD.tr[c.cls])||[];const t=T.find(x=>zs.includes(x[1]))||T.find(x=>x[1]===CAPITAL[c.race])||T[0];
    if(ls.length)rows.push(['trn','<img class="hic" src="img/ui-book.png" alt="">','교관에게 배울 기술 '+ls.length+'개',
      '<div class="lhs">'+ls.map(l=>'<span>'+esc(l[1])+(l[2]>1?' '+l[2]+'단계':'')+(l[3]?' <em>새 기술</em>':'')+'</span>').join('')+'</div>'
      +(t?'<p class="mute">가까운 교관: <b>'+esc(t[0])+'</b> · '+esc(t[1])+' '+xyTxt(t[2])+'</p>':'')
      +'<button class="btn sm ghost" data-a="trn">교관 다녀왔어요</button>']);
    else if(nxL)rows.push(['trn','<img class="hic" src="img/ui-book.png" alt="">','교관','<p class="mute">다음 기술은 <b>'+nxL+'레벨</b>에 배워요 ('+nx.filter(l=>l[0]===nxL).map(l=>esc(l[1])).join(' · ')+')</p>'])}
  /* 3) 던전 */
  const dq=c.dq||{};const D=DGS.filter(d=>d.lo&&d.lo<=L+1&&d.hi>=L&&d.lo>=10).sort((a,b)=>a.lo-b.lo).slice(0,3);
  if(D.length)rows.push(['dg','<img class="hic" src="img/eye.png" alt="">','지금 갈 만한 던전',D.map(d=>{const n=d.q.filter(q=>(q.min||0)<=L&&!dq[q.id]).length;
    return '<button class="lhq" data-a="dgo" data-k="'+d.slug+'"><span class="qlv">'+d.lo+'–'+d.hi+'</span><span class="t"><b>'+esc(d.ko)+'</b><span>'+(n?'던전 퀘스트 '+n+'개 · 들어가기 전에 받아 두세요':'던전 퀘스트 없음')+'</span></span></button>'}).join('')]);
  /* 4) 이동: 이 구간 비행 조련사·여관, 구간 끝나면 다음 구간 */
  if(WLD&&zs.length){const fpIn=z=>WLD.fp.find(x=>x[1]===z),innIn=z=>WLD.inn.find(x=>x[1]===z);
    const near=S&&L>=S.b-1&&NX;const tz=near?NX.z.split(' · '):zs;
    const f=tz.map(fpIn).filter(Boolean)[0],i=tz.map(innIn).filter(Boolean)[0];
    if(f||i)rows.push(['mv','🦅',near?'다음 구간 가는 길 ('+esc(tz[0])+')':'이 구간 이동',
      (f?'<p>🦅 비행 조련사 <b>'+esc(f[0])+'</b> · '+esc(f[1])+' '+xyTxt(f[2])+'<br><span class="mute">처음 가면 꼭 말 걸어서 비행 경로를 열어 두세요</span></p>':'')
      +(i?'<p>🏠 귀환석 <b>'+esc(i[0])+'</b> · '+esc(i[1])+' '+xyTxt(i[2])+'<br><span class="mute">'+(near?'옮겨 가면 여기 여관에 귀환석을 맞추세요':'이 구간 동안 여기 여관에 귀환석을 맞춰 두면 반납하러 오기 편해요')+'</span></p>':'')])}
  /* 5) 사냥터 (퀘스트가 모자랄 때) */
  if(WLD&&zs.length){const M=[];zs.forEach(z=>(WLD.mob[z]||[]).forEach(m=>{if(m[1]<=L+1&&m[2]>=L-1)M.push([z,...m])}));M.sort((a,b)=>b[4]-a[4]);
    if(M.length)rows.push(['grd','⚔️','퀘스트가 모자라면 여기서 사냥',M.slice(0,3).map(m=>'<p><b>'+esc(m[1])+'</b> <span class="qlv '+lvCls(m[3],L)+'">'+(m[2]===m[3]?m[2]:m[2]+'–'+m[3])+'</span><br><span class="mute">'+esc(m[0])+' '+m[5]+', '+m[6]+' 근처 · '+m[4]+'마리쯤</span></p>').join('')])}
  if(!rows.length)return '';ui.lhopen=ui.lhopen||{};
  return '<div class="card lh"><h3>🧭 레벨업 도우미 <span class="mute">'+L+'레벨 · '+esc(CKO)+'</span></h3>'+rows.map(r=>{const op=ui.lhopen[r[0]]!=null?ui.lhopen[r[0]]:(r[0]==='cls'||r[0]==='trn');
    return '<div class="lhr'+(op?' open':'')+'"><button class="lhh" data-a="lh" data-k="'+r[0]+'"><span class="lhi">'+r[1]+'</span><b>'+r[2]+'</b><span class="cv">'+(op?'⌃':'⌄')+'</span></button>'+(op?'<div class="lhb">'+r[3]+'</div>':'')+'</div>'}).join('')+'</div>'}
function routeView(c){const L=c.lv;const R=routeOf(c);let prevC=null;const fq=c.fq||{};
  let h='';
  let pastN=0;const rows=R.map(S=>{const zs=S.z.split(' · ');const cs=[...new Set(zs.map(z=>CONT[z]).filter(Boolean))];const now=L>=S.a&&L<=S.b;const past=L>S.b;
    let move='';if(prevC&&cs.length&&!cs.includes(prevC)&&cs.every(x=>x!=='제프라스 섬'))move='<div class="mv">⛵ '+BOAT+'</div>';prevC=cs[cs.length-1]||prevC;
    const cnt=z=>{const qs=S.q.filter(q=>(q.gz||q.sz)===z);return [qs.length,qs.filter(q=>qd(c,z,q)).length]};
    return move+'<div class="rt'+(now?' now':past?' past':'')+'"><div class="rl"><span class="lvb '+(now?'lv-y':past?'lv-x':'')+'">'+S.a+'–'+S.b+'</span>'+(now?'<span class="tag gd">지금</span>':'')+'</div><div class="m">'+zs.map(z=>{const [n,d]=cnt(z);return '<button class="zr" data-a="goz" data-k="'+esc(z)+'"><b>'+esc(z)+'</b> '+contTag(z)+'<span class="sub">퀘스트 '+n+'개'+(d?' · '+d+'개 끝냄':'')+'</span></button>'}).join('')+'</div></div>'});
  R.forEach(S=>{if(L>S.b)pastN++});
  const pastLv=pastN?R[pastN-1].b:0;
  if(pastN){const trail=[];R.slice(0,pastN).forEach(S=>S.z.split(' · ').forEach(z=>{if(trail[trail.length-1]!==z)trail.push(z)}));
    h+='<details class="rpast"><summary><span class="lvb lv-x">1–'+pastLv+'</span> ✓ 지나온 길 '+trail.length+'곳<span class="more">펼치기</span></summary><p class="trail">'+trail.map(esc).join(' → ')+'</p>'+rows.slice(0,pastN).join('')+'</details>'}
  const curS=R.find(S=>L>=S.a&&L<=S.b);const nxS=R.find(S=>S.a>L);h+='<div class="q2">'+(curS?nowCard(c,curS):'')+lvHelp(c,curS,nxS)+'</div>';
  if(nxS)h+='<div class="nextln"><span class="lvb">'+nxS.a+'–'+nxS.b+'</span><span>다음 구간 · <b>'+esc(nxS.z)+'</b></span></div>';
  h+='<details class="rall"><summary>🗺️ 1–60 전체 레벨 루트 보기</summary>'+rows.slice(pastN).join('')+'<p class="note">⛵ 배 타는 곳: '+BOAT+'</p></details>';
  return h}
function quest(c){const L=c.lv;const qm=ui.qmode||'route';const q0=(ui.qsrch||'').trim();
  let h='<div class="wrap"><div class="qsearch"><span>'+qico('quest')+'</span><input class="inp" placeholder="퀘스트·NPC·지역 이름으로 찾기" value="'+esc(ui.qsrch||'')+'" data-c="qsrch">'+(q0?'<button class="x2" data-a="qsclr">✕</button>':'')+'</div>';
  h+='<div id="qsres">'+(q0?qSearchHtml(c,q0):'')+'</div><div id="qbody"'+(q0?' hidden':'')+'>';
  h+='<div class="chips seg">'+[['route','⚡ 빠른 레벨업'],['atlas','📍 지도'],['map','🗺️ 지역 목록']].map(m=>'<button class="chip'+(qm===m[0]?' on':'')+'" data-a="qmode" data-k="'+m[0]+'">'+m[1]+'</button>').join('')+'</div>';
  const end='</div></div>';
  if(qm==='route')return h+routeView(c)+end;
  if(qm==='map')return h+mapView(c)+end;
  if(qm==='atlas')return h+amView(c)+end;
  ui.qmode='map';return h+mapView(c)+end}
/* 펼치는 퀘스트 한 줄: 접혀 있을 땐 [레벨] 이름만, 누르면 할 일·위치·연계·보상 */
function qFold(o){const open=ui.qopen===o.key;
  return '<details class="qf'+(o.lite?' lite':'')+(o.done?' done':'')+(o.lock?' lock':'')+'"'+(open?' open':'')+' data-k="'+esc(o.key)+'"><summary><span class="qi">'+(o.done?'✓':QMK.g)+'</span><span class="qn">'+(o.lite?'<span class="t1">'+esc(o.nm)+'</span>'+(o.sub?'<span class="t2">'+esc(o.sub)+'</span>':''):'['+o.lv+'] '+esc(o.nm))+'</span>'+(o.lite?'<span class="qlv '+lvCls(o.lv,(me()||{}).lv||1)+'">'+o.lv+'</span>':'')
   +(o.side?'<span class="qs">'+o.side+'</span>':'')+'<span class="chev">⌄</span></summary>'+o.body+'</details>'}
function dqCard(c,d,open){const dq=c.dq||{};const done=d.q.filter(q=>dq[q.id]).length;
  return '<details class="card"'+(open?' open':'')+'><summary style="cursor:pointer;list-style:none"><div class="hd"><h3 style="margin:0">'+esc(d.ko)+'</h3><span class="mute" style="font-size:12px">'+done+'/'+d.q.length+' · 권장 '+d.lo+'–'+d.hi+'</span></div></summary>'+dqList(c,d)+'<button class="more" data-a="dgo" data-k="'+d.slug+'">던전 보스·드랍 보기 ›</button></details>'}
/* 던전 퀘스트를 받으려면 먼저 해야 하는 연계 */
function preChain(id){const ch=chainOf(id);if(ch){const i=ch.findIndex(r=>r[6]===id);if(i>0)return ch.slice(0,i).map(r=>r[6]).filter(i=>QDB&&QDB.get(i))}const out=[];let x=id,k=0;while(QPAR[x]!=null&&k++<30){x=QPAR[x];out.unshift(x)}
  if(!out.length){const X=QDB&&QDB.get(id);const p=X&&((X.pre&&X.pre.length===1&&X.pre[0])||(X.pre1&&X.pre1.length===1&&X.pre1[0]));if(p){out.push(p);let y=p,j=0;while(QPAR[y]!=null&&j++<30){y=QPAR[y];out.unshift(y)}}}
  return out.filter(i=>QDB&&QDB.get(i))}
function preChainBox(c,id){const P=preChain(id);if(!P.length)return '';const left=P.filter(i=>!mqDone(c,QDB.get(i)));
  return '<div class="pchainbox'+(left.length?'':' ok')+'"><b>'+(left.length?'⚠️ 앞 연계 '+P.length+'개를 먼저 끝내야 받을 수 있어요':'✓ 앞 연계 다 끝냈어요')+'</b>'
   +P.map((i,n)=>{const x=QDB.get(i);const dn=mqDone(c,x);return '<button class="pcb'+(dn?' done':'')+'" data-a="qopen" data-k="'+i+'"><span class="n">'+(dn?'✓':n+1)+'</span><span class="t"><b>['+(x.lv||'?')+'] '+esc(x.n)+'</b><span>'+esc(x.z||'')+(x.g&&x.g[0]?' · '+esc(x.g[0]):'')+'</span></span><span class="cv">›</span></button>'}).join('')+'</div>'}
function dqList(c,d,flat){const L=c.lv;const dq=c.dq||{};
  const outQ=d.q.filter(q=>!/던전 안/.test(q.start)&&q.start),inQ=d.q.filter(q=>/던전 안/.test(q.start)||!q.start);
  const row=q=>{const dn=!!dq[q.id],lock=q.min>L;const rw=q.rw.map(id=>IT.get(id)).filter(Boolean);
    const pc=preChain(q.id),pcl=pc.filter(i=>!mqDone(c,QDB.get(i))).length;
    const tags=(q.pre&&!pc.length?'<span class="tag pre">앞 퀘스트 먼저</span>':'')+chainTag(q.id,q)+(lock?'<span class="tag">'+q.min+'레벨부터</span>':'');
    const inside=/던전 안/.test(q.start||'')||/아이템/.test(q.start||'')||!q.start;
    const extra=(q.boss.length?'<p class="npc">🎯 던전 안 목표: <b>'+q.boss.map(b=>esc(b.replace(/^(\d+) /,'$1번 '))).join(', ')+'</b></p>':'')+((QD.get(q.id)||{}).g&&(QD.get(q.id)||{}).g[0]&&!inside?'':'<p class="npc">'+esc((()=>{let t=startTxt(q.start);const o=QD.get(q.id);if(o&&o.g&&latin(o.g[0])){const k=npcKo(o,'g');if(k&&!latin(k))t=t.split(o.g[0]).join(k)}return t})())+'</p>');
    const rwHtml=rw.length?'<div class="rgrid">'+rw.map(it=>'<button class="rt2" data-a="info" data-k="'+it.id+'">'+itIcon(it)+'<span class="rn q'+it.q+'">'+esc(it.nm)+'</span></button>').join('')+'</div>':'';
    const body=(chainOf(q.id)||((QD.get(q.id)||{}).ch||[]).length>1?'':preChainBox(c,q.id))+parch(c,q.id,{nm:q.nm,obj:q.obj,place:inside?'던전 안에서 시작':'던전 외부 시작',tags,extra,rwHtml,done:dn,kind:'dq',ck:String(q.id),pre:q.pre});
    return qFold({key:'d'+q.id,done:dn,lock,lv:q.lv,nm:q.nm,body,side:(pc.length?'<span class="pcw'+(pcl?'':' ok')+'">'+(pcl?'⚠️ 앞 연계 '+pcl+'개':'✓ 연계 끝')+'</span>':'')+(q.side==='alliance'?'얼라이언스':'')})};
  if(flat)return d.q.map(row).join('');
  return (outQ.length?'<h3>던전 가기 전에 받기</h3>'+outQ.map(row).join(''):'')+(inQ.length?'<h3>던전 안에서 시작</h3>'+inQ.map(row).join(''):'')}
function startTxt(s){if(!s)return '아이템을 주워서 시작';if(/^시작 · 던전 안/.test(s))return '던전 안에서 받아요';const m=s.match(/^시작 (.+) · 던전 안$/);if(m)return '던전 안 '+m[1]+'에게 받아요';if(/^시작 · /.test(s))return s.replace(/^시작 · /,'')+'에서 시작';return '받는 곳: '+s}

/* ===================== 던전 ===================== */
function dgItems(c,d){return ITEMS.filter(it=>it.src.some(i=>SRC[i]&&SRC[i].k===0&&SRC[i].dg===d.slug))}
function dgUps(c,d){const L=c.lv;return dgItems(c,d).filter(it=>usable(it,c)&&it.lv<=Math.max(L,d.hi)).map(it=>({it,b:bestSlot(it,c)})).filter(x=>x.b&&x.b.g>.01)}
const DG_IMG=slug=>'https://forg.gg/images/wow-forever/dungeons/'+slug+'-loading.webp';
function dgChips(c,cur){const L=c.lv;
  const near=DGS.filter(d=>L>=d.lo-1&&L<=d.hi).sort((a,b)=>b.fit-a.fit),up=DGS.filter(d=>d.lo-1>L).sort((a,b)=>a.fit-b.fit),past=DGS.filter(d=>d.hi<L).sort((a,b)=>b.fit-a.fit);
  const grp=(t,arr)=>arr.length?'<span class="dgl">'+t+'</span>'+arr.map(chip).join(''):'';
  const chip=d=>{const inr=L>=d.lo-1&&L<=d.hi;return '<button class="dchip'+(d.slug===cur?' on':'')+(inr?' near':'')+'" data-a="dgo" data-k="'+d.slug+'"><img src="'+DG_IMG(d.slug)+'" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),{className:\'dno\',textContent:\'🏰\'}))"><span class="t"><b>'+esc(d.ko)+'</b><small>'+d.lo+'–'+d.hi+(inr?' · 지금':'')+'</small></span></button>'};
  return '<div class="dcw"><button class="dcb l" data-a="dcs" data-k="-1" aria-label="왼쪽">‹</button><div class="dchips">'+grp('지금 레벨',near)+grp('다음 던전',up)+grp('지나간 던전',past)+'</div><button class="dcb r" data-a="dcs" data-k="1" aria-label="오른쪽">›</button></div>'}
function dungeon(c){const L=c.lv;
  if(!ui.dg||!DG[ui.dg]){const n=dgNow(L).sort((a,b)=>b.fit-a.fit);ui.dg=(n[0]||DGS.slice().sort((a,b)=>Math.abs(a.fit-L)-Math.abs(b.fit-L))[0]).slug}
  return dgChips(c,ui.dg)+dgDetail(c,DG[ui.dg])}
/* 보스 모습 (wythic.com → 와우헤드 모델 썸네일) */
const BIMG={};{const nz=x=>String(x||'').replace(/[\s:·,'"!.\-]/g,'').replace(/의/g,'');D_BOSS.split('\n').filter(Boolean).forEach(l=>{const [dn,bn,u]=l.split('|');(BIMG[nz(dn)]=BIMG[nz(dn)]||[]).push({n:nz(bn),u})});
  window.bossImg=(d,boss,i)=>{const L=BIMG[nz(d.ko)]||BIMG[nz(d.ko.split(':')[0])]||[];const f=L.find(x=>x.n&&(x.n===nz(boss)||x.n.includes(nz(boss))||nz(boss).includes(x.n)));return f?f.u:(L.length===d.bosses.length&&!d.ko.includes(':')&&L[i]?L[i].u:'')}}
function statTop(it,c,n){const w=wOf(c);return Object.keys(it.st).filter(k=>STAT_KO[k]&&k!=='armor').sort((a,b)=>(w[b]||0)*it.st[b]-(w[a]||0)*it.st[a]).slice(0,n||3).map(k=>STAT_KO[k].replace('무기 초당 공격력','DPS')+' '+(k==='dps'?it.st[k].toFixed(1):'+'+Math.round(it.st[k]))).join(' · ')}
function dropLine(c,it){const use=usable(it,c);const b=use?bestSlot(it,c):null;
  const g=b&&b.g>.01?'<span class="gp'+(b.g>=20?' hi':'')+'">+'+Math.round(b.g)+'</span>':use?'':'<span class="gp no">못 씀</span>';
  return '<div class="dl"><button class="dlb" data-a="info" data-k="'+it.id+'">'+itIcon(it)+'<span class="m"><span class="nm">'+itName(it)+'</span><span class="sub">'+esc((SL_KO[it.sl]||'')+(CS_KO[it.cs]&&!['4.0',''].includes(it.cs)?' '+CS_KO[it.cs]:''))+(statTop(it,c)?' · '+esc(statTop(it,c)):'')+'</span></span>'+g+'</button>'+(b&&b.g>.01?'<button class="btn sm eqb" data-a="equip" data-k="'+b.s+'" data-id="'+it.id+'">끼기</button>':'')+'</div>'}
/* ===== 던전 동선·공략 (wowf.io 진행 순서 + forg.gg 보스 기술) ===== */
let DGG=null,DGG_LOAD=false;
function dggLoad(){if(DGG_LOAD)return;DGG_LOAD=true;fetch('data/forg/dungeon-guide.json?v='+D_VER.dgg).then(r=>r.ok?r.json():{}).then(j=>{DGG=j||{};if(ui.tab==='dungeon')rerender(true)}).catch(()=>{DGG={};})}
const TAGKO={interrupt:'끊기','dispel-magic':'마법 해제','dispel-curse':'저주 해제','dispel-poison':'독 해제','dispel-disease':'질병 치료','no-dispel':'해제 안 됨',avoid:'피하기',spread:'흩어지기',away:'떨어져 서기',wall:'벽 등지기',front:'정면 공격'};
/* 역할 아이콘: 게임 파티 찾기 둥근 배지처럼 (탱커 파랑 방패 · 딜러 빨강 칼 · 힐러 초록 십자) */
const RIP={tk:'M12 2.5 19.5 5.2V11c0 5-3.2 8.6-7.5 10.3C7.7 19.6 4.5 16 4.5 11V5.2Z',dp:'M18.6 3H21v2.4L11.2 15.2 8.8 12.8ZM5.4 12.6l6 6-1.3 1.3-1.6-1.6-3 3-1.8-1.8 3-3-1.6-1.6Z',hl:'M9.6 3.5h4.8v6.1h6.1v4.8h-6.1v6.1H9.6v-6.1H3.5V9.6h6.1Z',al:'M12 4.5c4.6 0 8 4.4 9 7.5-1 3.1-4.4 7.5-9 7.5S4 15.1 3 12c1-3.1 4.4-7.5 9-7.5Zm0 3.6a3.9 3.9 0 1 0 0 7.8 3.9 3.9 0 0 0 0-7.8Z'};
const RNM={tk:'탱커',dp:'딜러',hl:'힐러',al:'모두'};
const QMK={g:'<img class="qmk" src="img/qget.png" alt="받기">',r:'<img class="qmk" src="img/qturn.png" alt="반납">'};
const ricon=(r,cl)=>r==='al'?'<img class="ri rimg'+(cl?' '+cl:'')+'" src="img/eye.png" alt="모두" title="모두">':'<img class="ri rimg'+(cl?' '+cl:'')+'" src="img/role-'+r+'.png" alt="'+RNM[r]+'" title="'+RNM[r]+'">';
function myRole(c){if(c&&c.drole)return c.drole;const r=ROLE[(c&&c.cls)+'/'+(c&&c.spec)]||'';return r==='치유'?'hl':r==='탱커'?'tk':'dp'}
function roleSplit(texts,sp){/* 공략 문장을 역할별로: tk 탱커 · dp 딜러 · hl 힐러 · al 모두 · loc 위치 */
  const R={tk:[],dp:[],hl:[],al:[],loc:[]};const S=[];
  /* 두 사이트가 같은 말을 조금 다르게 쓴 문장은 하나로 (영어 괄호·말끝·띄어쓰기 무시하고 글자쌍 비교) */
  const nrm=x=>x.replace(/\([^)]*\)/g,'').replace(/[\s.·,!?「」'"—–-]/g,'').replace(/(?:습니다|니다|어요|아요|해요|예요|이에요|요|다)$/,'');
  const bg=x=>{const b=new Set();for(let i=0;i<x.length-1;i++)b.add(x.slice(i,i+2));return b};
  const sim=(a,b)=>{if(!a.length||!b.length)return 0;if(a.includes(b)||b.includes(a))return 1;const A=bg(a),B=bg(b);let n=0;A.forEach(x=>{if(B.has(x))n++});return n/Math.min(A.size,B.size)};
  const lcs=(a,b)=>{let m=0;for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++){let k=0;while(a[i+k]&&a[i+k]===b[j+k])k++;if(k>m)m=k}return m};
  /* 얼라이언스만 보니 호드 쪽 말은 지우거나 빼기 */
  const ally=x=>{if(!/호드/.test(x))return x;if(!/얼라이언스/.test(x))return '';return x.replace(/호드 [^·,()]+ · /,'').replace(/,\s*호드는 '[^']*'/,'').replace(/\(\s*·\s*/,'(')};
  /* 「~고, 탱커는 …」처럼 한 문장에 여러 역할이 섞이면 역할마다 나눔 */
  const SUBJ=/(?:탱커|치유사|힐러|원거리(?: 딜러)?(?:와 (?:힐러|치유사))?|근접(?: 딜러)?|딜러)(?:는|은|가|도) /;
  const endGo=c=>c.replace(/([가-힣])고$/,(m,ch)=>{const code=ch.charCodeAt(0)-0xAC00;return code>=0&&code%28!==0&&code%28!==8?ch+'으세요.':ch+'세요.'});
  const NS=[];const push=x=>{const k=nrm(x);if(k.length<4)return;const j=NS.findIndex(y=>sim(y,k)>=.72);if(j<0){NS.push(k);S.push(x)}else if(/[A-Za-z]{3}/.test(S[j])&&!/[A-Za-z]{3}/.test(x))S[j]=x};
  for(const t of texts){let prev=null;const parts=[];
    for(const s of (t||'').split(/(?<=[.!?])\s+|(?<=(?:니다|어요|아요|세요|해요|워요|져요|돼요|에요|예요))\s+(?=[가-힣「'"])/)){let x=ally(s.trim().replace(/^[—–-]\s*/,''));if(!x)continue;
      if(/^(?:그 뒤로|그 뒤|그동안|그때|그러면|이때|이후|그러니)/.test(x)&&parts.length){parts[parts.length-1]+=' '+x;continue}parts.push(x)}
    for(const x of parts){const cl=x.split(/(?<=[가-힣]고),\s+/);
      if(cl.length>1&&cl.slice(0,-1).every(c=>SUBJ.test(c)&&!/있고$|(?:가|이) [^ ]+ (?:걸|주|하|쓰)고$/.test(c))&&cl.every(c=>c.length>=12)){cl.forEach((c,i)=>push(i<cl.length-1?endGo(c):c))}else push(x)}}
  for(const t of S){let hit=0;const add=k=>{if(!R[k].includes(t))R[k].push(t);hit=1};
    const it=/끊(?:으세요|으면|어 ?주|습니다|고 |기|으며 ?(?:네|잡))|반드시 끊|꼭 끊/.test(t)&&!/(?:가|이) [^ ]*(?:시전을|주문을) 끊/.test(t);
    const healDo=/치유(?:를|는)? ?(?:몰아|넉넉|더 주|하지 마)|탱커 치유|탱커를 챙기|마나를 (?:채|아껴)|치유 마나|힐을 더/.test(t);
    const sub=t.match(new RegExp(SUBJ.source,'g'))||[];
    if(sub.length||healDo){/* 누가 할 일인지 적혀 있으면 그 역할에만 */
      for(const m of sub){if(/^탱커/.test(m)&&!/탱커가 (?:받는|잠들|기절)/.test(t))add('tk');if(/^(?:치유사|힐러)/.test(m)||/(?:와|과) (?:힐러|치유사)/.test(m))add('hl');if(/^원거리/.test(m)){add('dp');if(!/원거리 딜러/.test(m)||/힐러|치유사/.test(m))add('hl')}if(/^(?:근접|딜러)/.test(m))add('dp')}
      if(healDo)add('hl');if(it)add('dp')}
    else{
      if(/탱커|탱이|어그로|위협 수준|위협을|도발|정면|등지|벽을|벽 쪽|밀쳐|날려버리|방어도를 깎|방어구 가르기|생존기|방향을|돌려 세|회전베기|앞쪽(?:에|을|으로)|앞을 (?:치|베)|끌어|끌고 |데려오/.test(t))add('tk');
      if(it||/딜을|근접 공격을 하지|쫄|먼저 잡|부터 잡|부터 정리|점사|광역기로|광역으로|빨리 잡|먼저 마무리|몰아 |부수세요|부숴|근접 공격하는|먼저 처리|부터 처리|부터 치우|바로 정리|정리하세요|나오는 대로 잡|바로 잡/.test(t))add('dp');
      if(/(?<!무장 )해제(?!될)|해독|정화|저주|질병|(?<![가-힣])독(?:을| 피해| 공격|이 )|지속 피해|광역 피해|크게 (?:쳐|아파)|아픕|치유 효과를|출혈/.test(t)&&!(/치유|회복/.test(t)&&it&&!/해제/.test(t)))add('hl')}
    if(!hit){if(/(?:[^수] 있|서 있|돌아다닙|만납)(?:습니다|어요)\.?$|에 있어요|곳에 있습니다/.test(t)&&!/수 있/.test(t)&&t.length<60)R.loc.push(t);else add('al')}}
  /* 모두 칸: 기술 이름만 늘어놓은 문장(아래 기술 칩과 같음)·역할 칸과 겹치는 문장은 뺌 */
  const roleK=[...R.tk,...R.dp,...R.hl].map(nrm);
  R.al=R.al.filter(t=>!((t.match(/\([A-Za-z][^)]*\)/g)||[]).length>=2)&&!/^[^.]*(?:을|를) 씁니다\.?$/.test(t.replace(/\([^)]*\)/g,'').length<40?t:'x')&&(/흩어|피하|벗어나|떨어져|비키/.test(t)||!roleK.some(k=>sim(k,nrm(t))>=.5)));
  const val=t=>(/세요|마세요|주세요/.test(t)?20:0)+(/\([A-Za-z]/.test(t)?0:10)-(/수 있으면|있으면 끊/.test(t)?8:0)+Math.min(t.length,60)/10;
  for(const r of ['tk','dp','hl','al']){const L=R[r];for(let i=L.length-1;i>0;i--)for(let j=0;j<i;j++){const a=nrm(L[i]),b=nrm(L[j]);if(sim(a,b)>=.45||lcs(a,b)>=6||(a.length<15&&b.length<15&&sim(a,b)>=.38)){if(val(L[i])>val(L[j]))L[j]=L[i];L.splice(i,1);break}}}
  if(R.tk.some(t=>/밀쳐|날려|넉백/.test(t))&&!R.tk.some(t=>/벽|등지/.test(t)))R.tk.push('↳ 벽이나 구석을 등지고 잡으면 덜 밀려나요.');
  const has=(k,n)=>R[k].some(t=>t.includes(n));
  for(const s of sp||[]){const tg=(s[2]||'').split(',');const nm='「'+s[0]+'」';
    if(tg.includes('interrupt')&&!has('dp',s[0]))R.dp.push(nm+' 시전은 끊으세요.');
    for(const d of ['dispel-magic','dispel-curse','dispel-poison','dispel-disease'])if(tg.includes(d)&&!has('hl',s[0]))R.hl.push(nm+'은(는) '+TAGKO[d]+'하세요.');
    if((tg.includes('front')||tg.includes('wall'))&&!has('tk',s[0]))R.tk.push(nm+(tg.includes('wall')?' 때문에 벽을 등지고 잡으세요.':' — 보스 얼굴을 파티 반대쪽으로 돌리세요.'));
    if((tg.includes('avoid')||tg.includes('spread')||tg.includes('away'))&&!has('al',s[0]))R.al.unshift(nm+' '+(tg.includes('spread')?'— 흩어져 서세요.':tg.includes('away')?'— 떨어져 서세요.':'— 피하세요.'))}
  /* 할 일(~세요) 먼저, 설명은 뒤로 · 영어 괄호는 지움 */
  const act=t=>/세요|마세요|주세요|조심|↳/.test(t)?0:1;
  for(const r of ['tk','dp','hl','al']){R[r]=R[r].map((t,i)=>({t:t.replace(/\s*\((?=[A-Za-z]|\d+% [A-Za-z])[^)]*\)/g,''),i})).sort((a,b)=>act(a.t)-act(b.t)||a.i-b.i).map(x=>x.t)}
  return R}
const RNONE={tk:'공략에 따로 적힌 건 없어요. 보스를 잡고 파티 반대쪽으로 돌려 세우면 돼요.',dp:'공략에 따로 적힌 건 없어요. 탱커가 자리 잡은 뒤 보스에 집중하세요.',hl:'공략에 해제할 것이 따로 없어요. 탱커 체력 위주로 치유하세요.'};
function roleBox(R,me){/* 내 역할 먼저, 나머지는 한 줄씩 */
  const ord=[me,...['tk','dp','hl'].filter(r=>r!==me)];let h='<div class="rbox">';
  for(const r of ord){const L=R[r];const mine=r===me;if(!mine&&!L.length)continue;
    h+='<div class="rb-r'+(mine?' me':'')+'">'+ricon(r)+'<div class="rb-t"><b>'+RNM[r]+(mine?' (나)':'')+'</b>'+(L.length?'<ul>'+L.slice(0,mine?4:2).map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>'+(L.length>(mine?4:2)?'<span class="mute">+'+(L.length-(mine?4:2))+'개 더 (설명 전체 보기)</span>':''):'<p>'+RNONE[r]+'</p>')+'</div></div>'}
  if(R.al.length)h+='<div class="rb-r al">'+ricon('al')+'<div class="rb-t"><b>모두 알아 둘 것</b><ul>'+R.al.slice(0,3).map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul></div></div>';
  return h+'</div>'}
function roleLines(txt,max){/* 문장마다 역할 표시: 🛡️ 탱커 · 💚 힐러 · ⚡ 끊기 · 나머지는 • */
  const S=(txt||'').split(/(?<=[.다요])\s+/).map(t=>t.trim()).filter(Boolean);
  const kind=t=>/탱커|어그로|도발|정면/.test(t)?'tk':/끊/.test(t)?'it':/힐러|독 해제|저주 해제|마법 해제|질병|해독/.test(t)?'hl':'';
  const IC={tk:'🛡️',it:'⚡',hl:'💚','':'•'};const rank={tk:0,it:1,hl:2,'':3};
  let L=S.map((t,i)=>({t,k:kind(t),i}));if(max&&L.length>max)L=L.sort((a,b)=>rank[a.k]-rank[b.k]||a.i-b.i).slice(0,max).sort((a,b)=>a.i-b.i);
  return L.map(x=>'<li class="'+x.k+'"><i>'+IC[x.k]+'</i><span>'+esc(x.t)+'</span></li>').join('')}
/* 단계마다 무엇을 조심할지 아이콘으로 */
function stepFlags(st,fb){if(!/우두머리|희귀/.test(st.type||''))return [];const t=[st.note,fb&&fb.tac,...(fb&&fb.sp||[]).map(x=>x[0]+' '+x[1]+' '+(x[2]||''))].join(' ');const F=[];
  if(/끊(?:으세요|으면|어 ?주|습니다|기|고 )|반드시 끊|꼭 끊|interrupt/.test(t))F.push(['it','⚡','끊기']);
  if(/(?<!무장 )해제(?!될)|해독|dispel|(?<![가-힣])독 |저주|질병/.test(t))F.push(['hl','💚','해제']);
  if(/탱커|기절|정면|어그로|방어도|무장 해제/.test(t))F.push(['tk','🛡️','탱커 주의']);
  if(/쫄|불러(?! 일으)|소환(?!사)|합류|호위병/.test(t)&&!/퀘스트로 불러/.test(t))F.push(['ad','👥','쫄 나옴']);
  if(/피하|바닥 ?(?:불|의 불|에 남|웅덩이|장판)|흩어(?:져|지)|떨어져 서|avoid|spread/.test(t))F.push(['mv','🏃','피하기']);
  return F}
function stepFloor(g){/* 지도 핀 번호로 단계가 몇 층인지 */const m={};(g.floors||[]).forEach(f=>f.pins.forEach(p=>{const n=parseInt(p.t);if(/^\d+!?$/.test(p.t||'')&&!m[n])m[n]=f}));return m}
function dgRoute(c,d){if(!DGG){dggLoad();return '<p class="note">동선 자료를 불러오는 중…</p>'}
  const g=DGG[d.slug];if(!g||!(g.steps&&g.steps.length)){return '<p class="empty-st">이 던전 진행 순서 자료가 아직 없어요. 보스 공략만 보여 줘요.</p>'+(g&&g.boss?bossTacOnly(g):'')}
  const B=g.boss||{};const items=dgItems(c,d);ui.stopen=ui.stopen||{};const me=myRole(c);
  const fbOf=st=>B[st.nm]||Object.values(B).find(b=>b.en&&b.en===st.en);
  const goodOf=nm=>items.filter(it=>usable(it,c)&&it.src.some(i=>{const s=SRC[i];return s&&s.k===0&&s.dg===d.slug&&s.boss===nm})).map(it=>bestSlot(it,c)).filter(b=>b&&b.g>.01).length;
  const S=g.steps.map(st=>{const fb=fbOf(st);return {st,fb,F:stepFlags(st,fb),kind:/우두머리/.test(st.type)?'boss':/희귀/.test(st.type)?'rare':'obj'}});
  const cnt=k=>S.filter(x=>x.F.some(f=>f[0]===k)).length;
  const nBoss=S.filter(x=>x.kind==='boss').length,nSkip=S.filter(x=>x.st.skip).length,nQ=S.filter(x=>x.st.q&&x.st.q.length).length;
  let h='<div class="card rsum2">';
  if(g.sum)h+='<p class="sum">'+esc(g.sum)+'</p>';
  h+='<div class="rchips"><span>👹 보스 '+nBoss+'</span>'+(nSkip?'<span>⏭️ 건너뛰기 가능 '+nSkip+'</span>':'')+(cnt('it')?'<span class="it">⚡ 끊기 '+cnt('it')+'곳</span>':'')+(cnt('hl')?'<span class="hl">'+ricon('hl','sm')+' 해제 '+cnt('hl')+'곳</span>':'')+(cnt('tk')?'<span class="tk">'+ricon('tk','sm')+' 탱커 주의 '+cnt('tk')+'곳</span>':'')+(nQ?'<span>'+qico('dg')+' 퀘스트 목표 '+nQ+'곳</span>':'')+'</div>';
  h+='<div class="rme"><span>내 역할</span>'+['tk','dp','hl'].map(r=>'<button class="rmb'+(r===me?' on':'')+'" data-a="drole" data-k="'+r+'">'+ricon(r)+RNM[r]+'</button>').join('')+'</div>';
  if(g.prep&&g.prep.length)h+='<details class="rprep2"><summary>⚠️ 들어가기 전에 알아 둘 것 '+g.prep.length+'개</summary><ul>'+g.prep.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></details>';
  h+='</div>';
  h+='<div class="dg2"><div class="dgL">';
  /* 지도: 기본으로 1층만 펼쳐 둠, 핀 누르면 그 단계로 */
  const FL=stepFloor(g);
  if(g.floors&&g.floors.length){const fi=Math.min(ui.dfloor||0,g.floors.length-1);const f=g.floors[fi];
    h+='<div class="rmap2">'+(g.floors.length>1?'<div class="chips seg fl">'+g.floors.map((x,i)=>'<button class="chip'+(i===fi?' on':'')+'" data-a="dfl" data-k="'+i+'">'+(i+1)+'층 '+esc(x.name)+'</button>').join('')+'</div>':'')
     +'<div class="mapw"><img src="'+esc(f.img)+'" alt="" loading="lazy" onerror="this.parentNode.classList.add(\'noimg\')">'
     +f.pins.map(p=>{const num=/^\d+!?$/.test(p.t||'');const n=parseInt(p.t);const x=num?S.find(y=>y.st.n===n):null;
        if(num)return '<button class="pin n '+(x?'k-'+x.kind:'')+(/!/.test(p.t)?' q':'')+(ui.stopen[n]?' on':'')+'" style="left:'+p.x+'%;top:'+p.y+'%" data-a="stp" data-k="'+n+'">'+n+'</button>';
        const t=(p.t||'').replace(/\d+$/,'');const to=t.match(/→\s*(.+)$/);return '<span class="pin l" style="left:'+p.x+'%;top:'+p.y+'%">'+esc(to?'↗ '+to[1]:t.replace(/←.*$/,'↙ 들어옴'))+'</span>'}).join('')+'</div><p class="mute src">번호를 누르면 아래 그 단계가 펼쳐져요 · 지도: wowf.io</p></div>'}
  h+='</div><div class="dgR">';
  /* 진행 순서: 한 줄씩, 누르면 펼침 */
  let lastF=null;
  h+='<div class="rlist">'+S.map(x=>{const st=x.st,fb=x.fb;let r='';const f=FL[st.n];
    if(f&&f!==lastF&&g.floors.length>1){r+='<div class="rfl">'+(g.floors.indexOf(f)+1)+'층 · '+esc(f.name)+'</div>';lastF=f}
    const open=!!ui.stopen[st.n];const good=x.kind==='boss'?goodOf(st.nm):0;
    r+='<div class="rr k-'+x.kind+(st.skip?' skip':'')+(open?' open':'')+'" id="stp-'+st.n+'"><button class="rrh" data-a="stp" data-k="'+st.n+'"><span class="no">'+st.n+'</span><span class="t"><b>'+esc(st.nm)+'</b><span>'+(st.lv?'Lv '+st.lv+' · ':'')+esc(st.type)+(st.skip?' · 건너뛰어도 됨':'')+(good?' · '+good+'개 내 템':'')+'</span></span><span class="fl2">'+x.F.map(f=>(f[0]==='tk'?ricon('tk','sm'):f[0]==='hl'?ricon('hl','sm'):'<i class="f-'+f[0]+'" title="'+f[2]+'">'+f[1]+'</i>')).join('')+(st.q&&st.q.length?qico('dg','퀘스트 목표'):'')+'</span><span class="cv">'+(open?'⌃':'⌄')+'</span></button>';
    if(open){const RS=roleSplit([fb&&fb.tac,st.note],fb&&fb.sp);const full=[fb&&fb.tac,st.note!==(fb&&fb.tac)?st.note:''].filter(Boolean);
      r+='<div class="rrb">'+(RS.loc.length?'<p class="rloc">📍 '+esc(RS.loc.join(' '))+'</p>':'')+(x.kind==='obj'?(full.length?'<p class="onote">'+esc(full.join(' '))+'</p>':''):roleBox(RS,me))
      +(x.kind!=='obj'&&full.length?'<details class="more3"><summary>설명 전체 보기</summary>'+full.map(t=>'<p>'+esc(t)+'</p>').join('')+'</details>':'')
      +(fb&&fb.sp&&fb.sp.length?'<div class="spl">'+fb.sp.map(y=>'<span class="sp" title="'+esc(y[1])+'">'+esc(y[0])+(y[2]?y[2].split(',').map(t=>'<em class="t-'+t+'">'+(TAGKO[t]||t)+'</em>').join(''):'')+'</span>').join('')+'</div>':'')
      +(st.q||[]).map(q=>'<button class="rq" data-a="qopen" data-k="'+q[0]+'">'+qico('dg')+' '+esc(q[1])+'</button>').join('')
      +(good?'<button class="rgood" data-a="dtab" data-k="loot">'+qico('gear')+' 이 보스 내 템 '+good+'개 보기 ›</button>':'')+'</div>'}
    return r+'</div>'}).join('')+'</div>';
  h+='<div class="rbtns"><button class="btn sm ghost" data-a="stall" data-k="1">모두 펼치기</button><button class="btn sm ghost" data-a="stall" data-k="0">모두 접기</button></div>';
  h+='<p class="legend">⚡ 끊기 · '+ricon('hl','sm')+' 해제 · '+ricon('tk','sm')+' 탱커 주의 · 👥 쫄 나옴 · 🏃 피하기</p><p class="mute src">공략: wowf.io 진행 순서 · forg.gg 보스 기술 (패치로 달라졌을 수 있어요)</p>';
  h+='</div></div>';
  return h}
function bossTacOnly(g){return '<ol class="route">'+Object.entries(g.boss).map(([nm,b],i)=>'<li class="rs boss"><span class="no">'+(i+1)+'</span><div class="rb2"><div class="rt3"><b>'+esc(nm)+'</b></div>'+(b.tac?'<ul class="roles">'+roleLines(b.tac)+'</ul>':'')+'</div></li>').join('')+'</ol>'}
function dgDetail(c,d){const L=c.lv;const items=dgItems(c,d);
  const byBoss={};items.forEach(it=>{const s=it.src.map(i=>SRC[i]).find(s=>s&&s.k===0&&s.dg===d.slug);const b=s?s.boss:'기타';(byBoss[b]=byBoss[b]||[]).push(it)});
  const order=d.bosses.map(b=>b.nm);Object.keys(byBoss).forEach(b=>{if(!order.includes(b))order.push(b)});
  const myUps=items.filter(it=>usable(it,c)).map(it=>({it,b:bestSlot(it,c)})).filter(x=>x.b&&x.b.g>.01);
  let h='<div class="wrap"><div class="dhero"><img src="'+DG_IMG(d.slug)+'" alt="" onerror="this.remove()"><div class="dt"><h2>'+esc(d.ko)+'</h2><small>'+esc(d.en)+'</small></div></div>';
  h+='<div class="dinfo"><span>📍 '+esc(d.loc)+'</span><span>🎯 권장 '+d.lo+'–'+d.hi+'</span><span>👹 보스 '+order.length+'</span><span>📜 퀘스트 '+d.q.length+'</span>'+(()=>{const n=d.q.filter(q=>preChain(q.id).some(i=>!mqDone(c,QDB.get(i)))).length;return n?'<span class="warn">⚠️ 앞 연계 필요 '+n+'</span>':''})()+'<span>⭐ 내게 좋은 템 '+myUps.length+'</span></div>';
  const dt=ui.dtab||'route';
  h+='<div class="chips seg dtabs">'+[['route','🧭 동선·공략'],['loot','🎁 템'+(myUps.length?' '+myUps.length:'')],['quest','📜 퀘스트 '+d.q.length]].map(x=>'<button class="chip'+(dt===x[0]?' on':'')+'" data-a="dtab" data-k="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>';
  if(dt==='route')return h+dgRoute(c,d)+'</div>';
  /* 1. 퀘스트 */
  if(dt==='quest'){h+=d.q.length?'<div class="card">'+dqList(c,d)+'</div>':'<p class="empty-st">이 던전 퀘스트가 없어요.</p>';return h+'</div>'}
  if(false)h+='<div class="card"><h3>📜 퀘스트 '+d.q.length+'개</h3>'+dqList(c,d)+'</div>';
  /* 2. 보스 순서대로 */
  h+='<h3 style="margin-top:16px">👹 보스 '+order.length+' <small class="mute">들어가는 순서 · 숫자는 내 장비보다 좋아지는 점수</small></h3>';
  ui.bopen=ui.bopen||{};let firstGood=null;
  const B=order.map((b,i)=>{const its=byBoss[b]||[];const good=its.filter(it=>usable(it,c)).map(it=>({it,b:bestSlot(it,c)})).filter(x=>x.b&&x.b.g>.01).sort((x,y)=>y.b.g-x.b.g);if(good.length&&firstGood==null)firstGood=i;return {b,i,its,good,rest:its.filter(it=>!good.some(g=>g.it===it))}});
  h+='<div class="steps">'+B.map(x=>{const k=d.slug+'|'+x.b;const open=ui.bopen[k]!=null?ui.bopen[k]:x.i===firstGood;const img=bossImg(d,x.b,x.i);
    let r='<div class="st bst'+(open?' open':'')+'"><button class="sh2" data-a="bo" data-k="'+esc(k)+'">'+(img?'<span class="bimg sm" style="background-image:url('+img+')"></span>':'<span class="bimg sm none">👹</span>')+'<span class="hn"><b><span class="bno">'+(x.i+1)+'</span>'+esc(x.b)+'</b><span>'+(x.good.length?'⭐ 좋은 템 '+x.good.length+'개':'내게 좋은 템 없음')+' · 드랍 '+x.its.length+'</span></span><span class="cv">'+(open?'⌃':'⌄')+'</span></button>';
    if(open)r+='<div class="sb">'+x.good.map(g=>dropLine(c,g.it)).join('')+(x.rest.length?'<details class="fold"><summary>다른 드랍 '+x.rest.length+'개</summary>'+x.rest.map(it=>dropLine(c,it)).join('')+'</details>':'')+'</div>';
    return r+'</div>'}).join('')+'</div>';
  h+='<p class="note"><a href="https://forg.gg/forever/dungeons/'+d.slug+'" target="_blank" rel="noopener">forg.gg에서 지도·보스 공략 보기 ↗</a></p>';
  return h+'</div>'}

/* ===================== 직업 ===================== */
const CSEC=[['tal','특성 순서'],['rot','운영·딜 순서'],['learn','기술 습득'],['prof','전문기술']];
function talRow(C,s,L){const t=C.talents[s[1]]||[s[1],'',1];return '<div class="tl'+(s[0]===L?' now':s[0]<L?' done':'')+'"><span class="lvb '+lvCls(s[0],L)+'">'+s[0]+'</span><span class="m"><b>'+esc(t[0])+'</b> <span class="mute">'+s[2]+'/'+t[2]+' · '+esc(t[1])+'</span>'+(t[4]&&s[0]>=L-1&&s[0]<=L+1?'<span class="sub">'+esc(t[4])+'</span>':'')+'</span></div>'}
function rotHtml(C,txt,L){return esc(txt).replace(/\[([^\]@*]+)(?:@(\d+))?(\*)?\]/g,(m,n,lv,t)=>{const icon=abIcon(n,C);const no=lv&&+lv>L;return '<span class="ab'+(no?' no':'')+'">'+(icon?'<span class="ic" style="background-image:url('+ICO(icon)+')"></span>':'')+n+(lv?' <span class="l">'+lv+'</span>':'')+(t?' <span class="l">특성</span>':'')+'</span>'})}
function klass(c){const C=D_CLS[c.cls],sp=specOf(c),L=c.lv,sec=ui.csec;
  let h='<div class="wrap"><h2>'+esc(CINFO[c.cls][0])+'</h2><div class="chips">'+C.specs.map(s=>'<button class="chip'+(s.id===c.spec?' on':'')+'" data-a="spec" data-k="'+s.id+'">'+esc(s.name)+'</button>').join('')+'</div>';
  h+='<div class="chips">'+CSEC.map(x=>'<button class="chip'+(sec===x[0]?' on':'')+'" data-a="csec" data-k="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>';
  if(sec==='tal')h+=talView(c,C,sp,L);
  if(sec==='rot'){const blk=(t,arr)=>arr.length?'<div class="card"><h3>'+t+'</h3>'+arr.map(r=>'<div class="rot"><div class="w">'+esc(r[0])+'</div><div>'+rotHtml(C,r[1],L)+'</div></div>').join('')+'</div>':'';
    h+='<p class="note">흐린 기술은 아직 못 배운 거예요. 숫자는 배우는 레벨이에요.</p>'+(L<30?blk('초반 (레벨업)',sp.early)+blk('기본 운영',sp.rot):blk('기본 운영',sp.rot)+blk('초반 (레벨업)',sp.early))+blk('후반',sp.late)}
  if(sec==='learn')h+=learnView(c,C,L);
  if(sec==='prof')h+=profView(c);
  h+='<p class="note">출처: forg.gg 직업 가이드(Wowhead·Mobalytics 빌드를 정리한 것). 게임 업데이트로 바뀔 수 있어요.</p>';
  return h+'</div>'}

/* ===== 직업: 특성 ===== */
function talView(c,C,sp,L){const pts=Math.max(0,L-9);const st=sp.steps.filter(s=>s[0]<=60);
  const by=lv=>{const m={};st.filter(s=>s[0]<=lv).forEach(s=>{const t=C.talents[s[1]];if(t)m[t[1]]=(m[t[1]]||0)+1});return m};
  const now=by(L),fin=by(60);
  const row=(s,big)=>{const t=C.talents[s[1]]||[s[1],'',1,'',''];const st_=s[0]<L?'done':s[0]===L?'now':'soon';
    return '<div class="tr2 '+st_+(big?' big':'')+'"><span class="lvb '+lvCls(s[0],L)+'">'+s[0]+'</span><span class="m"><span class="l1"><b>'+esc(t[0])+'</b><span class="rk">'+s[2]+'/'+t[2]+'</span><span class="tt">'+esc(t[1])+'</span>'+(st_==='done'?'<span class="ok">✓</span>':st_==='now'?'<span class="nw">지금</span>':'')+'</span>'+(t[4]?'<span class="d">'+esc(t[4])+'</span>':'')+'</span></div>'};
  let h='<div class="card talsum"><h3><img class="hic" src="img/ui-target.png" alt="">'+esc(sp.name)+' 특성</h3><p class="note">레벨 '+L+' · 특성 포인트 <b>'+pts+'개</b>'+(L<10?' (10레벨부터 1개씩 생겨요)':'')+'</p>'
   +'<div class="tbars">'+C.trees.map(t=>{const n=now[t]||0,f=fin[t]||0;return '<div class="tb"><span class="tn">'+esc(t)+'</span><span class="bar"><i style="width:'+(f?Math.round(n/Math.max(f,1)*100):0)+'%"></i></span><span class="tc"><b>'+n+'</b>'+(f?' / '+f:'')+'</span></div>'}).join('')+'</div>'
   +'<p class="mute src">지금 레벨까지 가이드대로 찍었을 때 / 60레벨 완성</p></div>';
  const cur=st.filter(s=>s[0]>=L-1&&s[0]<=L+3);
  if(L>=9&&cur.length)h+='<div class="card"><h3>지금 찍을 특성</h3>'+cur.map(s=>row(s,1)).join('')+'</div>';
  const grp={};st.forEach(s=>{const k=Math.floor(s[0]/10)*10;(grp[k]=grp[k]||[]).push(s)});
  h+='<div class="card"><h3>10~60 전체 순서</h3>'+Object.entries(grp).map(([k,arr])=>{const open=L>=+k&&L<+k+10;return '<details class="tg"'+(open?' open':'')+'><summary><b>'+k+'~'+(+k+9)+'레벨</b><span class="mute">'+arr.length+'개'+(arr.every(s=>s[0]<L)?' · 다 찍음 ✓':'')+'</span></summary>'+arr.map(s=>row(s,0)).join('')+'</details>'}).join('')
   +'<p class="note"><a href="https://forg.gg/forever/classes/'+c.cls+'?spec='+sp.id+'" target="_blank" rel="noopener">forg.gg에서 특성 트리로 보기 ↗</a></p></div>';
  return h}
/* ===== 직업: 기술 습득 (교관 다녀온 레벨 기준) ===== */
function learnView(c,C,L){if(!WLD)wldLoad();const ls=C.learns.filter(l=>!l[4]||l[4]==='alliance');const from=c.trn!=null?c.trn:L-2;
  const todo=ls.filter(l=>l[0]>from&&l[0]<=L);const T=(WLD&&WLD.tr[c.cls])||[];const S=routeOf(c).find(S=>L>=S.a&&L<=S.b);const zs=S?S.z.split(' · '):[];
  const t=T.find(x=>zs.includes(x[1]))||T.find(x=>x[1]===CAPITAL[c.race])||T[0];
  let h='<div class="card lnow'+(todo.length?'':' ok')+'"><h3><img class="hic" src="img/ui-book.png" alt="">'+(todo.length?'교관에게 배울 기술 '+todo.length+'개':'지금 배울 기술은 다 배웠어요')+'</h3>'
   +(todo.length?'<div class="abw">'+todo.map(l=>abChip(l[1],l[5],l[3]?'새 기술':'랭크 '+l[2],false)).join('')+'</div>':'')
   +(t?'<p class="note">가까운 교관: <b>'+esc(t[0])+'</b> · '+esc(t[1])+' '+xyTxt(t[2])+'</p>':'')
   +(todo.length?'<button class="btn sm" data-a="trn">교관 다녀왔어요 ✓</button>':'<p class="mute">'+(c.trn!=null?c.trn+'레벨에 교관에 다녀왔다고 표시돼 있어요.':'')+'</p>')+'</div>';
  const near=groupBy(ls,l=>l[0]).filter(([lv])=>lv>=L-4&&lv<=L+6);
  const st=lv=>lv<=from?'done':lv<=L?'go':'later';
  h+='<div class="card"><h3>레벨별 배우는 기술</h3><p class="note">✓ 배움 · 🔸 지금 배우러 가기 · 흐림 = 아직 레벨이 모자라요</p>'
   +near.map(([lv,arr])=>'<div class="tl '+st(lv)+'"><span class="lvb '+lvCls(lv,L)+'">'+lv+'</span><span class="m">'+(st(lv)==='done'?'<span class="lst ok">✓ 배움</span>':st(lv)==='go'?'<span class="lst go">🔸 배우러 가기</span>':'')+arr.map(l=>abChip(l[1],l[5],l[3]?'새 기술':'랭크 '+l[2],lv>L)).join(' ')+'</span></div>').join('')
   +'<details class="fold"><summary>1~60 전체 보기</summary>'+groupBy(ls,l=>l[0]).map(([lv,arr])=>'<div class="tl '+st(lv)+'"><span class="lvb '+lvCls(lv,L)+'">'+lv+'</span><span class="m">'+arr.map(l=>abChip(l[1],l[5],l[3]?'':'랭크 '+l[2],lv>L)).join(' ')+'</span></div>').join('')+'</details></div>';
  return h}
function profView(c){const sel=PROFS.find(p=>p.id===ui.pf)||PROFS[0];let h='<div class="chips">'+PROFS.map(p=>'<button class="chip'+(p===sel?' on':'')+'" data-a="pf" data-k="'+p.id+'">'+esc(p.ko)+'</button>').join('')+'</div>';
  h+='<div class="card"><h3>'+esc(sel.ko)+'</h3>'+(sel.pair?'<p class="note">같이 하면 좋은 기술: '+esc(sel.pair)+'</p>':'');
  h+='<p class="note">등급: '+PROF_RANK.map(r=>r[0]+' '+r[1]+'–'+r[2]+' ('+r[3]+')').join(' · ')+'</p>';
  if(sel.steps)h+=sel.steps.map(s=>'<div class="pr2"><span class="pl">'+s[0]+'<i>→</i>'+s[1]+'</span><span class="m"><span class="l1"><b>'+esc(s[2])+'</b><span class="cnt">'+esc(s[3])+'번 만들기</span>'+(s[5]?'<span class="nt">'+esc(s[5])+'</span>':'')+'</span><span class="rg">재료(1번에): '+esc(s[4])+'</span></span></div>').join('');
  if(sel.gather)h+=sel.gather.map(g=>'<div class="pr2"><span class="pl">'+g[0]+'</span><span class="m"><span class="l1"><b>'+esc(g[1])+'</b></span><span class="rg">'+esc(g[2])+'</span></span></div>').join('');
  if(sel.tips)h+='<h3>팁</h3>'+sel.tips.map(t=>'<p class="note">• '+esc(t)+'</p>').join('');
  return h+'<p class="note"><a href="'+esc(sel.src)+'" target="_blank" rel="noopener">원본 가이드 ↗</a></p></div>'}

/* ===================== 캐릭터 관리 시트 ===================== */
function charsSheet(){const c=me();let h='<div class="sh"><h2>내 캐릭터</h2><button class="x" data-a="close">✕</button></div>';
  h+=DB.list.map(x=>{const sp=specOf(x);return '<div class="row">'+clsIcon(x.cls)+'<span class="m"><span class="nm" style="color:'+CINFO[x.cls][1]+'">'+esc(x.name||CINFO[x.cls][0])+(x.id===DB.cur?' <span class="tag gd">지금</span>':'')+'</span><span class="sub">'+esc((sp?sp.name+' ':'')+CINFO[x.cls][0])+' · 레벨 '+x.lv+'</span></span>'+(x.id===DB.cur?'':'<button class="btn sm" data-a="pick" data-k="'+x.id+'">이 캐릭터로</button>')+'</div>'}).join('');
  h+='<button class="btn full" style="margin-top:10px" data-a="add">＋ 부캐 추가</button>';
  if(c){h+='<h3>지금 캐릭터 고치기</h3><input class="inp" maxlength="12" value="'+esc(c.name)+'" placeholder="이름" data-c="cname"><div class="chips" style="margin-top:6px">'+RACES.map(r=>'<button class="chip'+(c.race===r[0]?' on':'')+'" data-a="crace" data-k="'+r[0]+'">'+r[1]+'</button>').join('')+'</div>';
    h+='<div class="chips">'+CL.map(k=>'<button class="chip'+(c.cls===k?' on':'')+'" data-a="ccls" data-k="'+k+'">'+CINFO[k][0]+'</button>').join('')+'</div><p class="note">직업을 바꾸면 장비 칸이 비워져요.</p>';
    h+='<div class="card">'+armBox(c)+'</div>';
    h+='<div class="card bk2"><h3>💾 기록 백업</h3><p class="note">캐릭터·장비·끝낸 퀘스트는 이 휴대폰 브라우저에만 저장돼요. 캐시를 지우거나 폰을 바꾸기 전에 내보내 두세요.</p>'
      +'<div class="bkb"><button class="btn sm" data-a="bkout">📤 내보내기 (코드 복사)</button><button class="btn sm ghost" data-a="bklink">🔗 링크로 옮기기</button></div>'
      +(ui.bkcode?'<textarea class="inp bkta" readonly rows="3">'+esc(ui.bkcode)+'</textarea>':'')
      +'<textarea class="inp bkta" rows="2" placeholder="받은 백업 코드를 붙여 넣으세요" data-c="bkin"></textarea><div class="bkb"><button class="btn sm" data-a="bkin" data-k="merge">📥 불러오기 (합치기)</button><button class="btn sm ghost" data-a="bkin" data-k="replace">전부 바꾸기</button></div></div>';
    h+='<button class="btn danger full" style="margin-top:14px" data-a="del">'+(ui.delAsk?'정말 지울까요? 한 번 더 누르면 지워져요':'이 캐릭터 지우기')+'</button>'}
  return h}

/* ===== 기록 백업: 내보내기·불러오기 (압축 지원하면 압축) ===== */
async function bkEncode(obj){const js=JSON.stringify(obj);try{if(window.CompressionStream){const cs=new Blob([js]).stream().pipeThrough(new CompressionStream('deflate-raw'));const buf=new Uint8Array(await new Response(cs).arrayBuffer());let b='';buf.forEach(x=>b+=String.fromCharCode(x));return 'WF1z'+btoa(b).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}}catch(e){}
  return 'WF1j'+btoa(unescape(encodeURIComponent(js))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
async function bkDecode(code){code=(code||'').trim().replace(/^.*#?bk=/,'');if(!/^WF1[zj][A-Za-z0-9_-]+$/.test(code))throw new Error('bad');const kind=code.slice(0,4),b=code.slice(4).replace(/-/g,'+').replace(/_/g,'/');const raw=atob(b+'==='.slice((b.length+3)%4));
  if(kind==='WF1z'){const u=new Uint8Array([...raw].map(ch=>ch.charCodeAt(0)));const ds=new Blob([u]).stream().pipeThrough(new DecompressionStream('deflate-raw'));return JSON.parse(await new Response(ds).text())}
  if(kind==='WF1j')return JSON.parse(decodeURIComponent(escape(raw)));throw new Error('코드 모양이 달라요')}
async function bkImport(code,mode){try{const o=await bkDecode(code);if(!o||!Array.isArray(o.list))throw new Error('캐릭터 자료가 없어요');
    if(mode==='replace'){DB.list=o.list;DB.cur=o.cur||(o.list[0]||{}).id}else{for(const x of o.list){const i=DB.list.findIndex(y=>y.id===x.id);if(i>=0){const y=DB.list[i];for(const k of ['fq','mq','dq'])x[k]=Object.assign({},y[k]||{},x[k]||{});DB.list[i]=Object.assign({},y,x)}else DB.list.push(x)}if(!DB.cur)DB.cur=o.cur}
    save();ui.bkcode='';ui.onb=null;toast('기록을 불러왔어요 ('+o.list.length+'명)');render();return true}catch(e){toast('불러오지 못했어요. 코드를 처음부터 끝까지 다 복사했는지 확인해 주세요');return false}}
if(location.hash.startsWith('#bk=')){const code=location.hash.slice(1);history.replaceState(null,'',location.pathname);setTimeout(()=>{ui.bkpend=code;ui.sheet='bkask';render()},300)}
function bkAskSheet(){return '<div class="sh"><h2>기록 불러오기</h2><button class="x" data-a="close">✕</button></div><p class="note">링크에 다른 기기의 캐릭터 기록이 들어 있어요. 이 기기에 불러올까요?</p><div class="bkb"><button class="btn" data-a="bkpend" data-k="merge">합치기 (지금 기록 유지)</button><button class="btn ghost" data-a="bkpend" data-k="replace">전부 바꾸기</button></div>'}
/* ===================== 그리기 ===================== */
function render(){const app=$('#app');const c=me();app.className='t-'+(c?ui.tab:'onb')+(ui.tab==='quest'?' q-'+(ui.qmode||'route'):'');
  if(ui.onb||!c){if(!ui.onb)ui.onb={name:'',race:'',cls:'',spec:'',lv:1};app.innerHTML=onboard()+(ui.sheet==='bkask'?'<div class="sheet-bg" data-a="bg"><div class="sheet"><div class="grab"></div>'+bkAskSheet()+'</div></div>':'');return}
  let v='';if(ui.tab==='home')v=home(c);else if(ui.tab==='gear')v=gear(c);else if(ui.tab==='quest')v=quest(c);else if(ui.tab==='dungeon')v=dungeon(c);else v=klass(c);
  app.innerHTML=topBar(c)+v+'<p class="foot">자료: <a href="https://forg.gg/forever" target="_blank" rel="noopener">forg.gg</a> (와우헤드 포에버·Questie 정리) · 입력한 내용은 이 기기에만 저장돼요</p>'+tabs()
    +(ui.sheet?'<div class="sheet-bg" data-a="bg"><div class="sheet"><div class="grab"></div>'+(ui.sheet==='chars'?charsSheet():ui.sheet==='bkask'?bkAskSheet():ui.sheet.startsWith('info:')?infoSheet(c,ui.sheet.slice(5)):ui.sheet.startsWith('q:')?questSheet(c,ui.sheet.slice(2)):slotSheet(c,ui.sheet.slice(5)))+'</div></div>':'')
  if(ui.tab==='quest'&&ui.qmode==='atlas')amInit()}
function rerender(keepScroll){const y=window.scrollY;const sh=document.querySelector('.sheet');const sy=sh?sh.scrollTop:0;render();if(keepScroll)window.scrollTo(0,y);const s2=document.querySelector('.sheet');if(s2&&keepScroll)s2.scrollTop=sy}
function setLv(c,v){v=Math.max(1,Math.min(60,parseInt(v,10)||c.lv));if(v!==c.lv){c.lv=v;save()}}

/* ===================== 이벤트 ===================== */
function isrchUpd(){const box=document.getElementById('isres');const c=me();if(!box||!c||!ui.sheet||!ui.sheet.startsWith('slot:')){return}
  const tmp=document.createElement('div');tmp.innerHTML=slotSheet(c,ui.sheet.slice(5));const nb=tmp.querySelector('#isres');if(nb)box.innerHTML=nb.innerHTML}
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,k=b.dataset.k;const c=me();
  if(a==='bg'){if(e.target===b){ui.sheet=null;ui.delAsk=0;rerender(true)}return}
  if(a==='close'){ui.sheet=null;ui.delAsk=0;rerender(true);return}
  if(a==='bkpend'){const code=ui.bkpend;ui.bkpend=null;ui.sheet=null;bkImport(code,k);return}
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
  if(a==='tab'){ui.tab=k;if(k==='quest'||k==='dungeon')qdbLoad();if(k==='dungeon')dggLoad();if(k!=='dungeon')ui.dg=null;render();window.scrollTo(0,0);const dc=document.querySelector('.dchips');if(dc){const on=dc.querySelector('.on');if(on)dc.scrollLeft=on.offsetLeft-20}return}
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
  if(a==='mc'){ui.mc=k;ui.mz=null;rerender(true);return}
  if(a==='mz'){ui.mz=k||null;ui.mf=ui.mf||'near';render();window.scrollTo(0,0);return}
  if(a==='mf'){ui.mf=k;rerender(true);return}
  if(a==='stp'){ui.stopen=ui.stopen||{};ui.stopen[k]=!ui.stopen[k];rerender(true);if(ui.stopen[k]){const e=document.getElementById('stp-'+k);if(e&&b.classList.contains('pin'))e.scrollIntoView({block:'center',behavior:'smooth'})}return}
  if(a==='stall'){const d=DG[ui.dg];const g=DGG&&d&&DGG[d.slug];ui.stopen={};if(k==='1'&&g)g.steps.forEach(x=>ui.stopen[x.st?x.st.n:x.n]=1);rerender(true);return}
  if(a==='dfl'){ui.dfloor=+k;rerender(true);return}
  if(a==='gmode'){c.gmode=k;save();rerender(true);toast(k==='solo'?'사냥용 기준으로 추천해요':'힐 위주 기준으로 추천해요');return}
  if(a==='bkout'||a==='bklink'){bkEncode({v:1,cur:DB.cur,list:DB.list}).then(code=>{const txt=a==='bklink'?location.origin+location.pathname+'#bk='+code:code;ui.bkcode=txt;rerender(true);
      (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>toast(a==='bklink'?'링크를 복사했어요. 다른 기기에서 열면 돼요':'백업 코드를 복사했어요')).catch(()=>toast('아래 칸을 길게 눌러 복사하세요'))});return}
  if(a==='bkin'){const t=document.querySelector('[data-c=bkin]');if(t&&t.value.trim())bkImport(t.value,k);else toast('코드를 먼저 붙여 넣으세요');return}
  if(a==='dtab'){ui.dtab=k;rerender(true);return}
  if(a==='mmgo'){ui.sheet=null;ui.tab='quest';ui.qmode='atlas';ui.amq=+k;const FO=amFocus(+k);if(FO&&FO.P[0])ui.am={c:FO.P[0].c,z:2.6,cx:FO.P.reduce((a,p)=>a+p.x,0)/FO.P.length,cy:FO.P.reduce((a,p)=>a+p.y,0)/FO.P.length};render();window.scrollTo(0,0);return}
  if(a==='zq'){ui.qmode='map';ui.mz='?|'+k;ui.mf='now';render();window.scrollTo(0,0);return}
  if(a==='dcs'){const dc=document.querySelector('.dchips');if(dc)dc.scrollBy({left:(+k)*dc.clientWidth*.8,behavior:'smooth'});return}
  if(a==='amc'){if(ui.am&&ui.am.c!==k)ui.am={c:k,z:0,cx:ATL[k].w/2,cy:ATL[k].h/2};ui.amsel=null;rerender(true);return}
  if(a==='amq'){ui.amq=k?+k:null;if(ui.amq){const FO=amFocus(ui.amq);if(FO&&FO.P[0])ui.am={c:FO.P[0].c,z:Math.max(ui.am?ui.am.z:2,2.4),cx:FO.P.reduce((a,p)=>a+p.x,0)/FO.P.length,cy:FO.P.reduce((a,p)=>a+p.y,0)/FO.P.length}}if(AM&&AM.draw){AM.draw();amPanel(ui.amq?{kind:'focus'}:null)}return}
  if(a==='amf'){ui.amf=Object.assign({},AMF0,ui.amf||{});ui.amf[k]=ui.amf[k]?0:1;ui.amsel=null;rerender(true);return}
  if(a==='amlv'){ui.amf=Object.assign({},AMF0,ui.amf||{});ui.amf.lv=ui.amf.lv==='all'?'now':'all';ui.amsel=null;rerender(true);return}
  if(a==='armref'){toast('전투정보실 자료 확인 중…');armFetch(true).then(n=>{const A=ARM[c.arm];toast(n<0?'자료를 못 받았어요. 잠시 뒤 다시 해 보세요':n>0?'새 자료로 맞췄어요 (레벨 '+(A&&A.level||'?')+')':'바뀐 게 없어요 · 마지막 갱신 '+armAgo(A&&A.checked))});return}
  if(a==='lh'){ui.lhopen=ui.lhopen||{};const cur=b.closest('.lhr').classList.contains('open');ui.lhopen[k]=!cur;rerender(true);return}
  if(a==='trn'){c.trn=c.lv;save();toast('교관에서 배운 걸로 표시했어요');rerender(true);return}
  if(a==='drole'){c.drole=k;save();rerender(true);return}
  if(a==='bo'){ui.bopen=ui.bopen||{};const cur=b.closest('.st').classList.contains('open');ui.bopen[k]=!cur;rerender(true);return}
  if(a==='mh'){ui.mhopen=ui.mhopen||{};const cur=b.closest('.st').classList.contains('open');ui.mhopen[k]=!cur;rerender(true);return}
  if(a==='hall'){ui.hall=!ui.hall;rerender(true);return}
  if(a==='qsclr'){ui.qsrch='';render();return}
  if(a==='hub'){ui.hopen=ui.hopen||{};const cur=b.closest('.st').classList.contains('open');ui.hopen[k]=!cur;rerender(true);return}
  if(a==='mzgo'){ui.tab='quest';ui.qmode='map';ui.mc=k.split('|')[0];ui.mz=k;ui.mf='all';ui.sheet=null;render();window.scrollTo(0,0);return}
  if(a==='goz'){ui.tab='quest';ui.qmode='map';ui.mz='?|'+k;ui.mc=null;ui.mf='near';ui.sheet=null;render();window.scrollTo(0,0);return}
  if(a==='dgo'){const fromChip=b.classList.contains('dchip');const sx=fromChip?document.querySelector('.dchips').scrollLeft:0;ui.tab='dungeon';if(ui.dg!==k){ui.stopen={};ui.dfloor=0}ui.dg=k;ui.sheet=null;render();window.scrollTo(0,0);const dc=document.querySelector('.dchips');if(dc){if(fromChip)dc.scrollLeft=sx;else{const on=dc.querySelector('.on');if(on)dc.scrollLeft=on.offsetLeft-20}}return}
  if(a==='dgback'){ui.dg=null;render();window.scrollTo(0,0);return}
  if(a==='dgf'){ui.dgf=k;rerender(true);return}
  if(a==='ifil'){ui.ifil=k;rerender(true);return}
  if(a==='slot'){ui.sheet='slot:'+k;ui.isrch='';rerender(true);return}
  if(a==='gsel'){ui.gslot=k||null;rerender(true);if(k){const p=document.querySelector('.spanel');if(p&&p.getBoundingClientRect().top>window.innerHeight-120)p.scrollIntoView({behavior:'smooth',block:'start'})}return}
  if(a==='gopanel'){ui.tab='gear';ui.gslot=k;render();const p=document.querySelector('.spanel');if(p)p.scrollIntoView({block:'start'});return}
  if(a==='qopen'){ui.sheet='q:'+k;rerender(true);const sh=document.querySelector('.sheet');if(sh)sh.scrollTop=0;return}
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
  if(f==='fq'){c.fq=c.fq||{};c.mq=c.mq||{};const qi=t.dataset.id;if(t.checked){c.fq[t.dataset.k]=1;if(qi)c.mq[qi]=1}else{delete c.fq[t.dataset.k];if(qi)delete c.mq[qi]}save();rerender(true);return}
  if(f==='mq'){c.mq=c.mq||{};c.fq=c.fq||{};if(t.checked)c.mq[t.dataset.k]=1;else{delete c.mq[t.dataset.k];const f0=questById(+t.dataset.k);if(f0)delete c.fq[f0.z+'|'+f0.q.nm]}save();rerender(true);return}
  if(f==='dq'){c.dq=c.dq||{};if(t.checked)c.dq[t.dataset.k]=1;else delete c.dq[t.dataset.k];save();rerender(true);return}
});
let srchT=null;
document.addEventListener('input',e=>{const t=e.target;if(t.dataset.c==='onb-name'){ui.onb.name=t.value;return}
  if(t.dataset.c==='qsrch'){ui.qsrch=t.value;clearTimeout(srchT);srchT=setTimeout(()=>{const box=document.getElementById('qsres'),bd=document.getElementById('qbody');const c=me();if(!box||!c)return;const q=ui.qsrch.trim();box.innerHTML=q?qSearchHtml(c,q):'';if(bd)bd.hidden=!!q},250);return}
  if(t.dataset.c==='isrch'){ui.isrch=t.value;clearTimeout(srchT);srchT=setTimeout(isrchUpd,250)}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.dataset&&(e.target.dataset.c==='lv'||e.target.dataset.c==='onb-lv'))e.target.blur()});
render();

/* 던전 고르는 줄: 마우스 휠·끌기로 옆으로 넘기기 (PC) */
document.addEventListener('wheel',e=>{const dc=e.target.closest&&e.target.closest('.dchips');if(!dc||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
  const max=dc.scrollWidth-dc.clientWidth;if(max<=0)return;e.preventDefault();dc.scrollLeft+=e.deltaY},{passive:false});
{let dd=null;document.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;const dc=e.target.closest&&e.target.closest('.dchips');if(dc)dd={dc,x:e.clientX,sl:dc.scrollLeft,moved:false}});
 document.addEventListener('pointermove',e=>{if(!dd)return;const dx=e.clientX-dd.x;if(Math.abs(dx)>5){dd.moved=true;dd.dc.classList.add('drag')}if(dd.moved)dd.dc.scrollLeft=dd.sl-dx});
 document.addEventListener('pointerup',()=>{if(dd&&dd.moved){const dc=dd.dc;setTimeout(()=>dc.classList.remove('drag'),0);const stop=ev=>{ev.stopPropagation();ev.preventDefault()};dc.addEventListener('click',stop,{capture:true,once:true});setTimeout(()=>dc.removeEventListener('click',stop,{capture:true}),50)}dd=null})}
