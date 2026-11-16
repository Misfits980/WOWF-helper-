const SIM_KO={Moonkin:'조화 · 달빛야수',Bear:'야성 · 곰',Cat:'야성 · 표범',BM:'야수',"MM Weave":'사격',"SV Weave":'생존',Arcane:'비전',Fire:'화염',Default:'보호',"Shadow Testing":'암흑',"Asn Muti":'암살',"Combat SS":'전투',"Subtlety Hemo":'잠행',Testing:'정기',"SM/Ruin":'고통',"Demo (Shadow Brand)":'악마',Destro:'파괴',Arms:'무기',Fury:'분노',Protection:'방어'};
const FS_KEY='wowf_fs',FS_OPT=[[0.92,'작게'],[1,'보통'],[1.12,'크게'],[1.25,'아주 크게']];function fsGet(){try{return +localStorage.getItem(FS_KEY)||1}catch(e){return 1}}function fsApply(v){document.documentElement.style.setProperty('--fs',String(v))}fsApply(fsGet());
const BUILD='__BUILD__';
'use strict';
/* ===================== 기본 자료 ===================== */
const CL=['warrior','paladin','hunter','rogue','priest','shaman','mage','warlock','druid'];
const CINFO={warrior:['전사','#C79C6E'],paladin:['성기사','#F58CBA'],hunter:['사냥꾼','#ABD473'],rogue:['도적','#FFF569'],priest:['사제','#FFFFFF'],shaman:['주술사','#2a8cff'],mage:['마법사','#69CCF0'],warlock:['흑마법사','#9482C9'],druid:['드루이드','#FF7D0A']};
const RACES=[['human','인간','achievement_character_human_male'],['dwarf','드워프','achievement_character_dwarf_male'],['gnome','노움','achievement_character_gnome_male'],['nightelf','나이트엘프','achievement_character_nightelf_male'],['skyborne','고등 마법원 스카이본','spell_nature_cyclone']];
const RACE_START={human:'human',dwarf:'dwarf-gnome',gnome:'dwarf-gnome',nightelf:'nightelf',skyborne:'skyborne-alliance'};
/* 종족별 가능한 직업 (forg.gg 종족 페이지) */
const RACE_CLS={human:['warrior','paladin','hunter','rogue','priest','mage','warlock'],dwarf:['warrior','paladin','hunter','rogue','priest','shaman'],nightelf:['warrior','hunter','rogue','priest','druid'],gnome:['warrior','rogue','priest','mage','warlock'],skyborne:['warrior','hunter','rogue','mage','druid']};
const DW=new Set(['warrior','rogue','hunter']);/* 포에버 주술사는 쌍수 없음(양손 고양) */
const DWLV={rogue:10,warrior:20,hunter:20};
const STAT_KO={exp:'회피·막기 당할 확률 감소 %',rap:'원거리 전투력',crit:'치명타 %',hit:'적중 %',scrit:'치명타 %',shit:'적중 %',dodge:'회피 %',parry:'무기 막기 %',blockp:'방패 막기 %',str:'힘',agi:'민첩',sta:'체력',int:'지능',spi:'정신력',sp:'주문력',heal:'치유량',mp5:'5초당 마나',ap:'전투력',dps:'무기 초당 공격력',def:'방어 숙련',block:'방패 막기',armor:'방어도',fire:'화염 주문력',frost:'냉기 주문력',nature:'자연 주문력',shadow:'암흑 주문력',arcane:'비전 주문력',holy:'신성 주문력'};
const SLOTS=[['head','머리',['he']],['neck','목',['ne']],['shoulder','어깨',['sh']],['back','등',['ba']],['chest','가슴',['ch']],['wrist','손목',['wr']],['hands','손',['ha']],['waist','허리',['wa']],['legs','다리',['le']],['feet','발',['fe']],['ring1','반지 1',['fi']],['ring2','반지 2',['fi']],['trink1','장신구 1',['tr']],['trink2','장신구 2',['tr']],['main','주무기',['2h','mh','1h']],['off','보조',['oh','ho','1h']],['ranged','원거리',['ra']]];
const SLOT_KO=Object.fromEntries(SLOTS.map(s=>[s[0],s[1]]));
const SL_KO={he:'머리',ne:'목',sh:'어깨',ba:'등',ch:'가슴',wr:'손목',ha:'손',wa:'허리',le:'다리',fe:'발',fi:'반지',tr:'장신구','2h':'양손 무기',mh:'주장비 무기','1h':'한손 무기',oh:'보조 장비',ho:'보조 손',ra:'원거리'};
const CS_KO={'4.1':'천','4.2':'가죽','4.3':'사슬','4.4':'판금','4.6':'방패','2.0':'한손 도끼','2.1':'양손 도끼','2.2':'활','2.3':'총','2.4':'한손 둔기','2.5':'양손 둔기','2.6':'장창','2.7':'한손 검','2.8':'양손 검','2.10':'지팡이','2.13':'장착 무기','2.15':'단검','2.18':'석궁','2.19':'마법봉','2.20':'낚싯대'};
/* 전문화별 능력치 가중치 (클래식 기준 대략값, 1 = 가장 중요한 능력치) */
const HEAL={heal:1,sp:.15,int:.8,spi:.5,mp5:1.2,sta:.1};
const W={
 warrior:{arms:{str:1,agi:.8,ap:.5,sta:.25,dps:2.4,rdps:.2},fury:{str:1,agi:.8,ap:.5,sta:.25,dps:2.2,rdps:.2},protection:{sta:1,def:.9,armor:.03,block:.35,str:.5,agi:.5,ap:.2,dps:.8,rdps:.1}},
 paladin:{holy:{heal:1,sp:1,int:1,mp5:1.3,spi:.25,sta:.1},protection:{sta:1,def:.9,armor:.03,block:.3,str:.5,agi:.35,sp:.12,holy:.12,int:.15,ap:.2,dps:.7},retribution:{str:1,agi:.6,ap:.5,int:.3,sp:.3,holy:.3,sta:.25,dps:2.4}},
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

const WHY={rogue:'주무기 DPS가 딜을 가장 크게 정해요. 포에버는 「회피·막기 당할 확률 감소」(6.5%까지)와 적중(8%까지)이 민첩보다 먼저예요. 원거리는 당기기용이라 점수에 안 넣어요.',
  warrior:{arms:'양손 무기 DPS가 딜을 정해요. 그다음 적중(8%까지)·회피·막기 감소·치명타·힘 순이에요.',fury:'무기 DPS 다음으로 적중(8%까지)·회피·막기 감소·치명타·힘 순이에요.',protection:'체력·방어 숙련·회피로 덜 맞는 게 먼저예요.'},
  hunter:'원거리 무기 공격력이 딜 대부분이에요. 그다음 적중(8%까지)·치명타·민첩 순이에요. 지능도 특성으로 전투력이 돼요.',priest:{discipline:'치유량·5초당 마나·정신력·지능 순이에요. 마법봉은 레벨업 사냥용이에요.',holy:'치유량·5초당 마나·정신력·지능 순이에요. 마법봉은 레벨업 사냥용이에요.','shadow-magic':'주문력·암흑 주문력·적중 순이에요. 포에버는 적중·치명타가 근접·주문 하나로 합쳐졌어요. 마법봉은 마나 아끼는 용도예요.'},
  mage:'적중(17%까지)·주문력·치명타·지능 순이에요. 마법봉은 마나 아끼는 용도예요.',warlock:'적중·주문력·치명타 순이에요(파괴는 치명타가 먼저). 체력도 생명력 전환에 좋아요.',
  paladin:{holy:'치유량·지능·5초당 마나 순이에요.',protection:'체력·방어 숙련·방패 막기 순이에요.',retribution:'양손 무기 DPS·힘·치명타 순이에요. 포에버는 징벌 특성 「빛의 용사」로 지능이 주문력이 돼서 지능·주문력도 조금 봐요.'},
  shaman:{'elemental-combat':'주문력·지능·치명타 순이에요.',enhancement:'무기 DPS·힘이 먼저예요. 포에버는 고양 특성 「교묘한 정신」으로 지능이 전투력이 돼요. 11월 10일 핫픽스로 비율이 150%→100%로 줄어 힘이 1순위예요.',restoration:'치유량·치명타·지능·정신력 순이에요.'},
  druid:{balance:'적중(17%까지)·치명타·주문력·지능 순이에요.','feral-cat':'포에버에서는 표범도 무기 DPS가 점수에 들어가요. 무기 DPS·회피·막기 감소·적중·민첩·힘 순이에요.','feral-bear':'체력·민첩·방어 숙련 순이에요.',restoration:'치유량·지능·정신력·5초당 마나 순이에요.'}};
/* ===== 점수 공식 = forg.gg와 같은 틀 =====
   1) 기본 가중치: forg.gg 장비 추천 기본표(역할별)
   2) 시뮬이 있는 특성은 포에버 시뮬레이터(wowsims/forever, 60레벨) 값으로 덮음 — 무기 DPS·적중·치명타 1% 가치 포함
   3) 탱커는 시뮬이 딜 기준이라 생존 능력치(forg 탱커 표)를 쓰고 적중·치명타만 조금 더함 */
const FB={str:{str:1,agi:.6,ap:.5,sta:.25},agi:{agi:1,str:.5,ap:.5,sta:.2},tank:{str:1,agi:.6,ap:.5,sta:.6,def:.4,armor:.01,block:.2},heal:{heal:1,int:.6,spi:.5,mp5:1.5,sta:.1,dpsWand:.5},cast:{sp:1,int:.5,spi:.3,sta:.15,dpsWand:1},ranged:{agi:1,ap:.4,int:.3,sta:.2,dpsRanged:2.5}};
const FL={dpsMain:1.5,dpsOff:.75};
const FS={warrior:{arms:['str',{dps2h:2}],fury:['str',FL],protection:['tank',{dps1h:1.2}]},paladin:{holy:['heal'],protection:['tank',{str:.7,agi:.35,sp:.55,int:.3,sta:1,def:.6,armor:.02,block:.3,dps1h:.7}],retribution:['str',{agi:.5,int:.35,sp:.3,holy:.3,sta:.2,dps2h:2}]},
  hunter:{'beast-mastery':['ranged'],marksmanship:['ranged'],survival:['ranged']},rogue:{assassination:['agi',FL],combat:['agi',FL],subtlety:['agi',FL]},
  priest:{discipline:['heal',{spi:.65,int:.5}],holy:['heal',{spi:.65,int:.5}],'shadow-magic':['cast',{shadow:.9}]},shaman:{'elemental-combat':['cast',{spi:.1,mp5:1,nature:.6,fire:.4}],enhancement:['str',{agi:.5,int:.35,sp:.12,sta:.2,dps2h:2}],restoration:['heal',{spi:.2}]},
  mage:{arcane:['cast',{arcane:.9}],fire:['cast',{fire:1}],frost:['cast',{frost:.8}]},warlock:{affliction:['cast',{sta:.3,shadow:.9}],demonology:['cast',{sta:.3,shadow:.8,fire:.2}],destruction:['cast',{sta:.3,shadow:.7,fire:.3}]},
  druid:{balance:['cast',{dpsWand:0,nature:.5,arcane:.5}],'feral-cat':['str',{agi:.8,dps2h:2}],'feral-bear':[null,{str:1,agi:.8,ap:.5,sta:.5,armor:.02,def:.4,dps2h:2}],restoration:['heal',{dpsWand:0}]}};
const WSRC={};
for(const c in FS)for(const s in FS[c]){if(!W[c]||!W[c][s])continue;const [b,ex]=FS[c][s];let w=Object.assign({},b?FB[b]:{},ex||{});const role=b==='tank'||s==='feral-bear'?'tank':b==='heal'?'heal':b==='cast'?'cast':'phys';
  const sim=(typeof D_SIMW!=='undefined'&&D_SIMW.specs||{})[c+'/'+s];let src='forg 기본표';
  if(sim&&role!=='tank'){const keep={sta:w.sta||0};w=Object.assign({},sim.weights,keep);const u=sim.unscored||{};
    if(role==='cast'){w.scrit=u.crit||0;w.shit=u.hit||0}else{w.crit=u.crit||0;w.hit=u.hit||0}src='포에버 시뮬레이터 ('+(SIM_KO[sim.preset]||sim.preset)+')'}
  else if(role==='tank'){const u=sim&&sim.unscored||{};Object.assign(w,{dodge:12,hit:(u.hit||14)*.4,crit:(u.crit||12)*.25});if(s!=='feral-bear')Object.assign(w,{parry:10,blockp:6})}
  else if(role==='heal')w.scrit=6;
  else if(role==='cast')Object.assign(w,{scrit:10,shit:15});
  else Object.assign(w,{crit:13,hit:15});
  /* 포에버 새 능력치: 회피·막기 당할 확률 감소(근접·원거리 물리 딜) · 원거리 전투력(사냥꾼) */
  if(role==='phys'||role==='tank')w.exp=(w.hit||0)*(c==='rogue'||s==='feral-cat'?1.1:.85);if(c==='hunter')w.rap=w.ap??.5;
  /* Icy Veins 포에버 우선순위(11/4): 복원 주술사는 치명타가 지능보다 위, 파괴 흑마는 치명타 > 지능 > 적중 */
  if(c==='shaman'&&s==='restoration')w.scrit=10;
  if(c==='warlock'&&s==='destruction'){w.scrit=Math.max(w.scrit||0,12);w.shit=Math.min(w.shit||9,9)}
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
/* 포에버: 적중·치명타는 근접·원거리·주문이 하나 → 두 칸에 같은 값 (직업마다 보는 칸이 달라서) */
function normST(st){const h=Math.max(st.hit||0,st.shit||0),c=Math.max(st.crit||0,st.scrit||0);if(h){st.hit=st.shit=h}if(c){st.crit=st.scrit=c}return st}
const ITEMS=D_ITEMS.split('\n').filter(Boolean).map(l=>{const f=l.split('|');const st={};for(const tok of (f[5]||'').split(' ')){const m=tok.match(/^(mp5|[a-z]+)(-?[\d.]+)$/);if(m)st[m[1]]=+m[2]}normST(st);
  return {id:+f[0],lv:parseInt(f[1])||1,est:f[1].endsWith('?'),sl:f[2],cs:f[3],q:f[4]||'c',st,eff:f[6]==='1',src:f[7]?f[7].split(';').map(Number):[],mask:+f[8],ph:f[9]||'',allow:f[10]?f[10].split(','):null,prof:f[11]||'',nm:f[12],ic:f[13]||''}}).filter(i=>i.lv<=60);/* 착용 레벨 60 넘는 템(다른 확장팩 자료)은 뺌 */
const IT=new Map(ITEMS.map(i=>[i.id,i]));
const ICO=n=>n?'https://wow.zamimg.com/images/wow/icons/medium/'+String(n).toLowerCase()+'.jpg':'';
/* 카드 제목 앞 이모지 → 게임 아이콘 (제목 글자는 그대로) */
const H_ICO={'🧹':'inv_misc_bag_08','🎒':'inv_misc_bag_08','🧩':'trade_engineering','📱💻':'inv_misc_enggizmos_19','📜':'inv_misc_note_06','📌':'inv_misc_pocketwatch_02','📅':'img/ui-book.png','💾':'inv_misc_book_11','💡':'inv_misc_book_09','🏳️':'inv_shirt_guildtabard_01','🏰':'img/ui-eye.png','🎁':'inv_misc_gift_01','⭐':'img/ui-target.png','⬆️':'img/ui-shield.png','⚖️':'inv_misc_gear_01','⚔️':'inv_sword_04','⏱️':'inv_misc_pocketwatch_01'};
const H_RE=new RegExp('<h3([^>]*)>('+Object.keys(H_ICO).map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')\\s*','g');
function hIco(h){return h.replace(H_RE,(m,a,e)=>'<h3'+a+'>'+gic(H_ICO[e],'h'))}
/* 버튼용 게임 아이콘: img/ 로 시작하면 앱 안 그림, 아니면 와우 아이콘 이름 */
const gic=(n,cls)=>n?'<span class="gic'+(cls?' '+cls:'')+'" style="background-image:url('+(/^img\//.test(n)?n:ICO(n))+')"></span>':'';

/* ----- 던전 ----- */
const DGS=D_DGL.split('\n').filter(Boolean).map(l=>{const [slug,ko,en,loc,fit,rg,cnt,st,wy]=l.split('|');const r=(rg||'').split(/[–-]/).map(Number);return {slug,ko,en,loc,fit:+fit||r[0]||0,lo:r[0]||+fit,hi:r[1]||r[0]||+fit,cnt,bosses:[],q:[],soon:st==='soon',wy:+wy||0}}).filter(d=>!/오그리마|언더시티|썬더 블러프/.test(d.loc));
const DG=Object.fromEntries(DGS.map(d=>[d.slug,d]));
D_DQ.split('\n').filter(Boolean).forEach(l=>{const f=l.split('|');const d=DG[f[1]];if(!d)return;
  if(f[0]==='B'){d.bosses=(f[2]||'').split(';').filter(Boolean).map(x=>{const i=x.indexOf('=');return {slug:x.slice(0,i),nm:x.slice(i+1)}});return}
  if(f[3]==='horde')return;
  d.q.push({id:+f[2],side:f[3],lv:+f[4],min:+f[5],nm:f[6],obj:f[7],start:f[8],pre:+f[9]||0,rw:(f[10]||'').split(',').filter(Boolean).map(Number),boss:(f[11]||'').split(';').filter(Boolean),choose:f[12]==='1',kind:f[13],cls:+f[14]||0})});
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
/* 포에버 배(2026-11 기준, 블리자드 발표·method.gg·conquestcapped): 스톰윈드 항구↔아우버다인(새) · 메네실 → 사우스쇼어 → 아우버다인 → 메네실 한쪽 방향 순환(새) · 메네실↔테라모어 · 아우버다인↔루테란 · 톱니항↔무법항 · 스팀휘들 항구(타나리스)↔화약심지 항구(강물터, 새, 양 진영) */
const BOAT='동부 왕국 ↔ 칼림도어: <b>스톰윈드 항구</b>에서 어둠의 해안 <b>아우버다인</b>으로 바로 가는 배가 생겼어요(포에버). 저습지 <b>메네실 항구</b> 배는 <b>사우스쇼어</b>(힐스브래드)를 거쳐 아우버다인으로 돌아요(한쪽 방향). 메네실 ↔ 테라모어 배도 그대로예요.';
/* 지역 사이를 배로 건너면 빠른 곳 — 동선 단계가 이 두 지역 사이를 오가면 안내 */
const BOATS=[[['힐스브래드 구릉지'],['저습지','어둠의 해안','가시덤불 골짜기','스톰윈드','엘윈 숲'],'사우스쇼어(힐스브래드)는 저습지 메네실 항구에서 배를 타면 바로 가요(메네실 → 사우스쇼어 → 아우버다인 순서로 도는 배).'],
  [['강물터'],['타나리스'],'강물터 화약심지 항구 ↔ 타나리스 스팀휘들 항구 사이에 배가 있어요(양 진영).'],
  [['어둠의 해안','텔드랏실','잿빛 골짜기'],['스톰윈드','엘윈 숲','서부 몰락지대','붉은마루 산맥','그늘숲'],'스톰윈드 항구 ↔ 아우버다인(어둠의 해안) 배가 새로 생겼어요.'],
  [['가시덤불 골짜기'],['불모의 땅','먼지진흙 습지대','타나리스'],'가시덤불 골짜기 무법항 ↔ 불모의 땅 톱니항 배를 타면 빨라요.']];
function boatTip(za,zb){if(!za||!zb||za===zb)return '';for(const [A,B,t] of BOATS)if((A.includes(za)&&B.includes(zb))||(A.includes(zb)&&B.includes(za)))return t;return ''}


/* ===================== 저장 ===================== */
const KEY='wowf2';
let DB=(()=>{try{const o=JSON.parse(localStorage.getItem(KEY));if(o&&o.list)return o}catch(e){}return {cur:null,list:[]}})();
/* 예전 전투정보실 연결로 레벨이 글자('38')로 저장된 캐릭터 → 숫자로 (레벨+3 같은 계산이 '383'이 되던 문제) */
DB.list.forEach(c=>{if(c&&typeof c.lv!=='number')c.lv=Math.max(1,Math.min(60,parseInt(c.lv)||1))});
const saveRaw=()=>{try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){}};
/* 저장할 때 지금 캐릭터에 고친 시각을 남기고(기기 연동 합치기용), 연동 중이면 몇 초 뒤 올림 */
const save=()=>{const c=DB.list.find(x=>x.id===DB.cur);if(c)c._t=Date.now();saveRaw();syQueue()};
/* ===== 📱💻 휴대폰·컴퓨터 자동 연동: 내 GitHub 비공개 Gist 한 개에 기록을 두고 서로 맞춤 =====
   토큰(gist 권한만)은 이 기기 브라우저에만 저장. 캐릭터마다 더 늦게 고친 쪽이 이김. 지운 캐릭터는 지운 시각을 같이 남김 */
const SYNC_K='wfh_sync',SYNC_DESC='wowf-helper sync (와포 도우미 기록)',SYNC_F='wowf-helper.json';
let SY=(()=>{try{return JSON.parse(localStorage.getItem(SYNC_K))||{}}catch(e){return {}}})();
const sySave=()=>{try{localStorage.setItem(SYNC_K,JSON.stringify(SY))}catch(e){}};
let syT=null,syBusy=false,syHold=0;
const syOn=()=>!!(SY.bid&&SY.key)||!!(SY.tok&&SY.gid);
/* 「되돌리기」 알림이 떠 있는 동안(6초)은 올리지 않고 기다림: 되돌릴 수 있는 바뀜이 다른 기기로 먼저 퍼지지 않게 */
function syQueue(){if(!syOn())return;clearTimeout(syT);syT=setTimeout(()=>syPush(),Math.max(4000,syHold-Date.now()+300))}
async function syGh(path,opt){const r=await fetch('https://api.github.com'+path,Object.assign({cache:'no-store'},opt||{},{headers:{'Authorization':'Bearer '+SY.tok,'Accept':'application/vnd.github+json','Content-Type':'application/json'}}));
  if(!r.ok){const e=new Error(String(r.status));e.status=r.status;throw e}return r.status===204?null:r.json()}
/* 캐릭터 말고도 애드온으로 받은 계정 공용 자료(게임 퀘스트 위치·동굴 입구·받은/반납한 자리)도 같이 맞춤 */
const syBody=()=>JSON.stringify({v:1,t:Date.now(),cur:DB.cur,list:DB.list,del:DB.del||{},gq:DB.gq||{},ent:DB.ent||[],gobs:DB.gobs||{},gql:DB.gql||{},gjp:DB.gjp||{}});
function syMergeGame(R){let local=false,remote=false;
  const A=DB.gq||{},B=R.gq||{},q={...A};
  for(const id in B){const a=A[id],b=B[id];if(b&&(!a||(b.at||0)>(a.at||0))){q[id]=b;local=true}}
  for(const id in A){const b=B[id];if(!b||(A[id].at||0)>(b.at||0))remote=true}
  if(Object.keys(q).length)DB.gq=q;
  const GA=DB.gobs||{},GB=R.gobs||{},go=JSON.parse(JSON.stringify(GA));
  for(const id in GB){go[id]=go[id]||{};for(const k in GB[id])if(go[id][k]===undefined){go[id][k]=GB[id][k];local=true}}
  for(const id in GA)for(const k in GA[id])if(!GB[id]||GB[id][k]===undefined)remote=true;
  if(Object.keys(go).length)DB.gobs=go;
  /* v3.8: 받을 수 있었던 레벨은 낮은 쪽, 목표 자리는 없는 것만 더함 */
  {const LA=DB.gql||{},LB=R.gql||{},lo={...LA};for(const id in LB){if(!(lo[id]<=LB[id])){lo[id]=LB[id];local=true}}for(const id in LA)if(!(LB[id]<=LA[id]))remote=true;if(Object.keys(lo).length){DB.gql=lo;if(local)gObsApply()}}
  {const JA=DB.gjp||{},JB=R.gjp||{},jo=JSON.parse(JSON.stringify(JA));for(const id in JB){jo[id]=jo[id]||{};for(const j in JB[id])if(!jo[id][j]){jo[id][j]=JB[id][j];local=true}}for(const id in JA)for(const j in JA[id])if(!JB[id]||!JB[id][j])remote=true;if(Object.keys(jo).length)DB.gjp=jo}
  const EA=DB.ent||[],EB=Array.isArray(R.ent)?R.ent:[],eo=EA.map(e=>({...e}));const same=(x,y)=>x.z===y.z&&x.n===y.n&&Math.hypot(x.x-y.x,x.y-y.y)<4;
  EB.forEach(e=>{const o=eo.find(y=>same(y,e));if(o){if((e.c||1)>(o.c||1)){o.c=e.c;local=true}}else{eo.push({...e});local=true}});
  EA.forEach(e=>{const o=EB.find(y=>same(y,e));if(!o||(e.c||1)>(o.c||1))remote=true});
  if(eo.length)DB.ent=eo.slice(-400);
  return {local,remote}}
/* 게임에서 불러온 것(애드온 코드)은 「불러온 시각」으로 따로 비교: 다른 기기에서 나중에 사소한 걸 고쳐도 더 새로 불러온 장비·가방이 지워지지 않게 */
const SY_IMP=['eq','eqv','bag','bank','gold','rep','ql','qp','lv','tal','wsk','taxi','sess','xp','profLv','profs','imported','spec','fsT','fsName'];
const impT=c=>(c&&c.imported&&c.imported.t)||0;
/* 둘 중 이긴 쪽(w)에 진 쪽(o)의 더 새 불러오기와 끝낸 퀘스트 표시를 합침. 바뀌면 true */
function syFold(w,o){let ch=false;
  if(impT(o)>impT(w)){SY_IMP.forEach(k=>{if(k in o&&JSON.stringify(w[k])!==JSON.stringify(o[k])){w[k]=JSON.parse(JSON.stringify(o[k]));ch=true}})}
  ['mq','dq','fq'].forEach(k=>{const A=o[k];if(!A||typeof A!=='object')return;const B=w[k]=w[k]||{};for(const id in A)if(A[id]&&!B[id]){B[id]=A[id];ch=true}});
  /* 플레이 일지: 두 기기 줄을 시각(t)으로 합침 */
  if(Array.isArray(o.jl)&&o.jl.length){const A=w.jl=Array.isArray(w.jl)?w.jl:[];const has=new Set(A.map(x=>x&&x.t));const add=o.jl.filter(x=>x&&!has.has(x.t));
    if(add.length){w.jl=A.concat(JSON.parse(JSON.stringify(add))).sort((x,y)=>x.t-y.t).slice(-300);ch=true}}
  /* 메모: 퀘스트 메모는 이긴 쪽에 없는 번호만 더함(지운 메모는 ''로 남겨 되살아나지 않음) · 지도 핀은 만든 시각(at)으로 합치고 지운 핀(x)은 양쪽에서 지움 */
  if(o.notes&&typeof o.notes==='object'){const a=o.notes,N=w.notes=w.notes&&typeof w.notes==='object'?w.notes:{};
    if(a.q&&typeof a.q==='object'){N.q=N.q||{};for(const id in a.q)if(!(id in N.q)){N.q[id]=a.q[id];ch=true}}
    const X=new Set([...(N.x||[]),...(a.x||[])]);if(X.size>(N.x||[]).length){N.x=[...X].slice(-300);ch=true}
    const P=N.p=Array.isArray(N.p)?N.p:[];for(let i=P.length-1;i>=0;i--)if(P[i]&&X.has(P[i].at)){P.splice(i,1);ch=true}
    (Array.isArray(a.p)?a.p:[]).forEach(n=>{if(n&&n.at&&!X.has(n.at)&&!P.some(y=>y&&y.at===n.at)){P.push(JSON.parse(JSON.stringify(n)));ch=true}})}
  return ch}
const syNm=c=>((c&&c.name)||'').trim().toLowerCase()+'|'+((c&&c.cls)||'');
function syMerge(R,join){if(!R||!Array.isArray(R.list))return {local:false,remote:false};
  const del=Object.assign({},DB.del||{});for(const k in R.del||{})del[k]=Math.max(del[k]||0,R.del[k]);
  const rm={};R.list.forEach(x=>{rm[x.id]=x});const out=[];let local=false,remote=false;const seen=new Set();
  DB.list.forEach(l=>{seen.add(l.id);const r=rm[l.id];
    if(r&&(r._t||0)>(l._t||0)){const w=JSON.parse(JSON.stringify(r));if(syFold(w,l))remote=true;out.push(w);local=true}
    else{const ch=!!r&&syFold(l,r);out.push(l);if(ch)local=true;if(!r||(l._t||0)>(r._t||0)||ch)remote=true}});
  R.list.forEach(r=>{if(!seen.has(r.id)){out.push(r);local=true}});
  out.forEach(c=>{if(c&&typeof c.lv!=='number')c.lv=Math.max(1,Math.min(60,parseInt(c.lv)||1))});
  let list=out.filter(x=>{const dd=del[x.id];if(dd&&dd>=(x._t||0)){if(rm[x.id])remote=true;if(DB.list.some(y=>y.id===x.id))local=true;return false}return true});
  /* 같은 이름·직업 캐릭터가 두 기기에서 따로 만들어졌으면 하나로: 게임에서 더 늦게 불러온 쪽(없으면 더 늦게 고친 쪽)을 남기고 나머지는 합친 뒤 지움 */
  const grp={};list.forEach(c=>{const k=syNm(c);if(k.length>1)(grp[k]=grp[k]||[]).push(c)});
  const drop=new Set();let curTo=null;
  Object.values(grp).forEach(g=>{if(g.length<2)return;g.sort((a,b)=>(impT(b)-impT(a))||((b._t||0)-(a._t||0)));const keep=g[0];
    g.slice(1).forEach(x=>{syFold(keep,x);drop.add(x.id);del[x.id]=Math.max(del[x.id]||0,x._t||0,Date.now());if(x.id===DB.cur)curTo=keep.id});keep._t=Math.max(keep._t||0,...g.map(x=>x._t||0));local=true;remote=true});
  if(drop.size)list=list.filter(c=>!drop.has(c.id));
  if(JSON.stringify(del)!==JSON.stringify(R.del||{}))remote=true;
  DB.list=list;DB.del=del;if(curTo)DB.cur=curTo;
  {const gm=syMergeGame(R);if(gm.local)local=true;if(gm.remote)remote=true}
  /* QR·링크로 처음 연결할 때는 다른 기기에서 보던 캐릭터를 바로 보여 줌 */
  if(join&&R.cur&&list.some(x=>x.id===R.cur)&&DB.cur!==R.cur){DB.cur=R.cur;local=true}
  if(!DB.cur||!list.some(x=>x.id===DB.cur))DB.cur=(list.find(x=>x.id===R.cur)||list[0]||{}).id||null;
  return {local,remote}}
/* --- 연동 코드 방식: textdb.dev 에 「암호화한」 기록을 둠. 코드 = 저장 번호-열쇠, 열쇠는 기기 밖으로 안 나감 --- */
const JB='https://jsonblob.com/api/jsonBlob';
const b64=u=>btoa(String.fromCharCode(...new Uint8Array(u))),unb64=s=>Uint8Array.from(atob(s),ch=>ch.charCodeAt(0));
let _syK=null;async function syCK(){if(_syK&&_syK.k===SY.key+SY.bid)return _syK.c;const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(SY.key),'PBKDF2',false,['deriveKey']);
  const c=await crypto.subtle.deriveKey({name:'PBKDF2',salt:new TextEncoder().encode('wfh-sync:'+SY.bid),iterations:150000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);_syK={k:SY.key+SY.bid,c};return c}
async function syZip(txt,zip){if(typeof CompressionStream==='undefined')return null;const s=new Blob([txt]).stream().pipeThrough(zip?new CompressionStream('gzip'):new DecompressionStream('gzip'));return new Uint8Array(await new Response(s).arrayBuffer())}
async function syEnc(txt){const iv=crypto.getRandomValues(new Uint8Array(12));const z=await syZip(txt,true);const data=z||new TextEncoder().encode(txt);
  const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},await syCK(),data);return {v:1,z:z?1:0,iv:b64(iv),d:b64(ct)}}
async function syDec(o){if(!o||!o.d)return null;const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(o.iv)},await syCK(),unb64(o.d));
  return JSON.parse(o.z?new TextDecoder().decode(await syZip(new Blob([pt]),false)):new TextDecoder().decode(pt))}
/* 오류 원인을 짧게 (화면에 그대로 보여 줘서 캡처로 알 수 있게) */
const syWhy=e=>!e?'알 수 없는 오류':e.status?('저장 서비스 응답 '+e.status+(e.status===403||e.status===429?' (요청이 막혔어요)':'')):e.message==='noid'?'저장 번호를 못 받았어요':e.name==='TypeError'?'저장 서비스에 접속하지 못했어요 ('+(e.message||'').slice(0,40)+')':(e.name+': '+(e.message||'')).slice(0,60);
const syErr=(e,mode)=>e&&e.name==='OperationError'?'연동 코드가 맞지 않아요 · 다시 넣어 주세요':e&&e.status===404?'연동 기록이 사라졌어요 · 「새 연동 코드」를 만들어 주세요':e&&e.status===401?'토큰이 맞지 않거나 만료됐어요':'인터넷 연결을 확인해 주세요 · '+syWhy(e);
/* 저장 서비스: textdb.dev (번호를 앱이 정함, t로 시작) · 예전 jsonblob(숫자 번호)도 읽기 */
const TD='https://textdb.dev/api/data/';
/* 전투정보실 명단 넣기 요청: textdb 대기열(wfh-armreq)에 「지역|이름-서버」 한 줄 → GitHub armory 작업이 20분마다 확인하고 명단에 넣음 */
let ARMRQ=(()=>{try{return JSON.parse(localStorage.getItem('wfh_armrq')||'[]')}catch(e){return []}})();
async function armReq(rg,raw){const n=String(raw||'').trim().replace(/\s+/g,'').replace(/[–—]/g,'-');
  if(!/^[^\s|/\\-]{2,12}-[^\s|/\\]{2,24}$/.test(n))return '「이름-서버」 모양으로 넣어 주세요 (예: 개추-피추)';
  if(!/^(kr|us|eu|tw)$/.test(rg))rg='kr';const line=rg+'|'+n;
  if(Object.values(ARM||{}).some(A=>A&&A.key===rg+'/'+n.toLowerCase()))return '이미 명단에 있어요';
  try{const r=await fetch(TD+'wfh-armreq',{cache:'no-store'});let t=r.ok?(await r.text()):'';const L=t.split('\n').map(x=>x.trim()).filter(Boolean);
    if(!L.includes(line))L.push(line);const w=await fetch(TD+'wfh-armreq',{method:'POST',headers:{'Content-Type':'text/plain'},body:L.slice(-200).join('\n')});if(!w.ok)throw new Error(w.status);
    if(!ARMRQ.includes(n)){ARMRQ.push(n);try{localStorage.setItem('wfh_armrq',JSON.stringify(ARMRQ.slice(-10)))}catch(e){}}
    return '보냈어요! 20분 안에 명단에 들어가요'}catch(e){return '보내지 못했어요 · 잠시 뒤 다시 해 주세요'}}const isTD=()=>/^t/.test(SY.bid||'');
async function syGet(){if(SY.bid&&isTD()){const r=await fetch(TD+'wfh-'+SY.bid,{cache:'no-store'});if(!r.ok){const e=new Error(r.status);e.status=r.status;throw e}const t=(await r.text()).trim();if(!t)return null;return await syDec(JSON.parse(t))}
  if(SY.bid){const r=await fetch(JB+'/'+SY.bid,{cache:'no-store',headers:{Accept:'application/json'}});if(!r.ok){const e=new Error(r.status);e.status=r.status;throw e}const ex=r.headers.get('X-jsonblob-expires-at');if(ex)SY.exp=ex;return await syDec(await r.json())}
  const g=await syGh('/gists/'+SY.gid);const f=g.files&&g.files[SYNC_F];let txt=f?f.content:'';if(f&&f.truncated)txt=await (await fetch(f.raw_url,{cache:'no-store'})).text();return txt?JSON.parse(txt):null}
async function syPut(){if(SY.bid&&isTD()){const r=await fetch(TD+'wfh-'+SY.bid,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(await syEnc(syBody()))});if(!r.ok){const e=new Error(r.status);e.status=r.status;throw e}return}
  if(SY.bid){const r=await fetch(JB+'/'+SY.bid,{method:'PUT',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(await syEnc(syBody()))});if(!r.ok){const e=new Error(r.status);e.status=r.status;throw e}return}
  await syGh('/gists/'+SY.gid,{method:'PATCH',body:JSON.stringify({files:{[SYNC_F]:{content:syBody()}}})})}
async function syPull(quiet,join){if(!syOn()||syBusy)return;syBusy=true;
  try{const R=await syGet();const m=syMerge(R||{list:[]},join);SY.at=Date.now();SY.err=null;sySave();
    if(m.local){saveRaw();if(!quiet)toast('다른 기기의 기록을 가져왔어요');if(DB.list.length&&ui.onb){ui.onb=null;render()}else rerender(true)}
    syBusy=false;if(m.remote||!R)await syPush(true)}
  catch(e){syBusy=false;SY.err=syErr(e);sySave()}}
async function syPush(fresh){if(!syOn()||syBusy)return;if(Date.now()<syHold){clearTimeout(syT);syT=setTimeout(()=>syPush(),syHold-Date.now()+300);return}syBusy=true;
  /* 올리기 전에 서버 기록을 먼저 받아 합침: 그 사이 다른 기기가 올린 것(예: PC 자동 맞춤)을 덮어쓰지 않게. 방금 받았으면(fresh) 건너뜀 */
  try{if(!fresh){const R=await syGet();if(R&&Array.isArray(R.list)){const m=syMerge(R);if(m.local){saveRaw();if(!document.querySelector('input:focus,textarea:focus'))rerender(true)}}}
    await syPut();SY.at=Date.now();SY.err=null}catch(e){SY.err=e&&e.status===404?syErr(e):'올리지 못했어요 · 다음에 다시 해요'}
  syBusy=false;sySave()}
/* 새 연동 코드 만들기 (이 기기 기록을 올리고 코드 받기) */
async function syMake(){const rnd=n=>Array.from(crypto.getRandomValues(new Uint8Array(n)),b=>'23456789ABCDEFGHJKLMNPQRSTUVWXYZ'[b%32]).join('');
  SY={bid:'t'+rnd(15).toLowerCase(),key:rnd(10)};_syK=null;
  try{await syPut();const back=await syGet();if(!back||!Array.isArray(back.list))throw new Error('verify');SY.at=Date.now();SY.err=null;sySave();return true}
  catch(e){SY={err:'연동 코드를 만들지 못했어요 · '+(e.message==='verify'?'올린 기록을 다시 읽지 못했어요':syWhy(e))};sySave();return false}}
const syCode=()=>SY.bid?SY.bid+'-'+SY.key:'';
const syLink=()=>location.origin+location.pathname+'#sync='+syCode();
/* 홈 화면에 깐 앱(아이폰은 늘, 갤럭시는 삼성 인터넷으로 열었을 때)은 브라우저와 기록 칸이 따로라 한 번 더 연결해야 함 */
const isApp=()=>{try{return matchMedia('(display-mode: standalone)').matches||navigator.standalone===true}catch(e){return false}};
/* 복사해 둔 연동 링크·코드를 읽어 바로 연결 (아이폰은 「붙여넣기」 확인 창이 한 번 뜸) */
async function syPaste(){let t='';try{t=await navigator.clipboard.readText()}catch(e){}
  t=String(t||'').trim();if(!/([A-Za-z0-9]+-[2-9A-Z]{10})\s*$/.test(t)){toast('복사한 연동 코드가 없어요 · 다른 기기에서 「🔗 링크 복사」를 먼저 눌러 주세요');return false}
  toast('연결하는 중…');const ok=await syJoin(t.match(/([A-Za-z0-9]+-[2-9A-Z]{10})\s*$/)[1]);toast(ok?'연결됐어요! 다른 기기에서 보던 캐릭터를 가져왔어요':(SY.err||'연결하지 못했어요'));if(ok){ui.onb=null}render();return ok}
/* 다른 기기에서 받은 코드로 연결 */
async function syJoin(code){const m=String(code||'').trim().replace(/^.*#sync=/,'').match(/^([A-Za-z0-9]+)-([2-9A-Z]{10})$/);if(!m){toast('코드 모양이 달라요. 처음부터 끝까지 넣어 주세요');return false}
  SY={bid:m[1],key:m[2]};_syK=null;sySave();await syPull(true,true);if(SY.err){const er=SY.err;SY={err:er};sySave();return false}return true}
async function syConnect(tok){SY={tok:tok.trim()};
  try{const L=await syGh('/gists?per_page=100');let g=(L||[]).find(x=>x.description===SYNC_DESC);
    if(!g)g=await syGh('/gists',{method:'POST',body:JSON.stringify({description:SYNC_DESC,public:false,files:{[SYNC_F]:{content:syBody()}}})});
    SY.gid=g.id;sySave();await syPull(true);return true}
  catch(e){SY={err:e.status===401?'토큰이 맞지 않아요. gist 권한으로 다시 만들어 주세요':'연결하지 못했어요 · 인터넷을 확인해 주세요'};sySave();return false}}
/* ===== QR 코드 (바이트 모드 · 오류 정정 L · 1~10버전) — 연동 링크를 다른 기기 카메라로 찍기 ===== */
function qrMatrix(text){const data=Array.from(new TextEncoder().encode(text));
  const ECC=[-1,7,10,15,20,26,18,20,24,30,18],NB=[-1,1,1,1,1,1,2,2,2,2,4];
  const rawMods=v=>{let r=(16*v+128)*v+64;if(v>=2){const n=Math.floor(v/7)+2;r-=(25*n-10)*n-55;if(v>=7)r-=36}return r};
  const dataCw=v=>Math.floor(rawMods(v)/8)-ECC[v]*NB[v];
  let ver=1;for(;ver<=10;ver++){const cc=ver<10?8:16;if(4+cc+data.length*8<=dataCw(ver)*8)break}if(ver>10)return null;
  /* 비트 만들기 */
  const bits=[];const put=(val,len)=>{for(let i=len-1;i>=0;i--)bits.push((val>>>i)&1)};
  put(4,4);put(data.length,ver<10?8:16);data.forEach(b=>put(b,8));const cap=dataCw(ver)*8;put(0,Math.min(4,cap-bits.length));put(0,(8-bits.length%8)%8);
  for(let p=0xEC;bits.length<cap;p^=0xEC^0x11)put(p,8);
  const dcw=[];for(let i=0;i<bits.length;i+=8){let b=0;for(let j=0;j<8;j++)b=(b<<1)|bits[i+j];dcw.push(b)}
  /* 리드-솔로몬 */
  const mul=(x,y)=>{let z=0;for(let i=7;i>=0;i--){z=(z<<1)^((z>>>7)*0x11D);z^=((y>>>i)&1)*x}return z&255};
  const div=d=>{const r=new Array(d).fill(0);r[d-1]=1;let root=1;for(let i=0;i<d;i++){for(let j=0;j<r.length;j++){r[j]=mul(r[j],root);if(j+1<r.length)r[j]^=r[j+1]}root=mul(root,2)}return r};
  const rem=(dat,dv)=>{const r=new Array(dv.length).fill(0);for(const b of dat){const f=b^r.shift();r.push(0);dv.forEach((c,i)=>r[i]^=mul(c,f))}return r};
  const nb=NB[ver],ec=ECC[ver],raw=Math.floor(rawMods(ver)/8),nShort=nb-raw%nb,shortLen=Math.floor(raw/nb),dv=div(ec);const blocks=[];
  for(let i=0,k=0;i<nb;i++){const dat=dcw.slice(k,k+shortLen-ec+(i<nShort?0:1));k+=dat.length;const e=rem(dat,dv);if(i<nShort)dat.push(0);blocks.push(dat.concat(e))}
  const all=[];for(let i=0;i<blocks[0].length;i++)blocks.forEach((b,j)=>{if(i!==shortLen-ec||j>=nShort)all.push(b[i])});
  /* 모듈 그리기 */
  const N=ver*4+17;const M=[...Array(N)].map(()=>new Array(N).fill(false)),F=[...Array(N)].map(()=>new Array(N).fill(false));
  const set=(x,y,d)=>{M[y][x]=d;F[y][x]=true};
  for(let i=0;i<N;i++){set(6,i,i%2===0);set(i,6,i%2===0)}
  [[3,3],[N-4,3],[3,N-4]].forEach(([cx,cy])=>{for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const x=cx+dx,y=cy+dy;if(x<0||y<0||x>=N||y>=N)continue;const d=Math.max(Math.abs(dx),Math.abs(dy));set(x,y,d!==2&&d!==4)}});
  if(ver>1){const n=Math.floor(ver/7)+2,step=Math.ceil((ver*4+4)/(n*2-2))*2;const pos=[6];for(let p=N-7;pos.length<n;p-=step)pos.splice(1,0,p);
    pos.forEach((y,i)=>pos.forEach((x,j)=>{if((i===0&&j===0)||(i===0&&j===n-1)||(i===n-1&&j===0))return;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)set(x+dx,y+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1)}))}
  const fmt=mask=>{const d=(1<<3)|mask;let r=d;for(let i=0;i<10;i++)r=(r<<1)^((r>>>9)*0x537);const b=((d<<10)|r)^0x5412;const g=i=>((b>>>i)&1)===1;
    for(let i=0;i<=5;i++)set(8,i,g(i));set(8,7,g(6));set(8,8,g(7));set(7,8,g(8));for(let i=9;i<15;i++)set(14-i,8,g(i));
    for(let i=0;i<8;i++)set(N-1-i,8,g(i));for(let i=8;i<15;i++)set(8,N-15+i,g(i));set(8,N-8,true)};
  fmt(0);
  if(ver>=7){let r=ver;for(let i=0;i<12;i++)r=(r<<1)^((r>>>11)*0x1F25);const b=(ver<<12)|r;for(let i=0;i<18;i++){const d=((b>>>i)&1)===1,a=N-11+i%3,c=Math.floor(i/3);set(a,c,d);set(c,a,d)}}
  let i=0;for(let right=N-1;right>=1;right-=2){if(right===6)right=5;for(let v=0;v<N;v++)for(let j=0;j<2;j++){const x=right-j,up=((right+1)&2)===0,y=up?N-1-v:v;if(!F[y][x]&&i<all.length*8){M[y][x]=((all[i>>>3]>>>(7-(i&7)))&1)===1;i++}}}
  /* 마스크 0: (x+y)%2==0 뒤집기 */
  for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(!F[y][x]&&(x+y)%2===0)M[y][x]=!M[y][x];
  return M}
function qrSvg(text){const M=qrMatrix(text);if(!M)return '';const N=M.length,q=4;let p='';
  for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(M[y][x])p+='M'+(x+q)+','+(y+q)+'h1v1h-1z';
  return '<svg viewBox="0 0 '+(N+q*2)+' '+(N+q*2)+'" shape-rendering="crispEdges" role="img" aria-label="연동 QR"><rect width="100%" height="100%" fill="#fff"/><path d="'+p+'" fill="#000"/></svg>'}
function syncBox(){let h='<div class="card syc"><h3>📱💻 휴대폰·컴퓨터 자동 연동</h3>';
  if(SY.bid&&SY.key){h+='<p class="note">✅ 연결됐어요'+(SY.at?' · 마지막으로 맞춘 때 <b>'+armAgo(SY.at)+'</b>':'')+'. 고치면 몇 초 뒤 올라가고, 앱을 열거나 돌아올 때 다른 기기 기록을 가져와요.</p>'+(SY.err?'<p class="adw">⚠ '+esc(SY.err)+'</p>':'');
    h+='<div class="syq">'+(ui.syqr?'<div class="qr">'+qrSvg(syLink())+'</div>':'')+'<div class="syt"><small>다른 기기에 넣을 연동 코드</small><b class="sycode">'+esc(syCode())+'</b><div class="bkb"><button class="btn sm" data-a="sycp">🔗 링크 복사</button><button class="btn sm ghost" data-a="syqr">'+(ui.syqr?'QR 닫기':'📷 QR 보기')+'</button></div></div></div>'
      +'<p class="mute" style="font-size:12px">다른 기기에서 QR을 찍거나, 링크를 카톡 「나와의 채팅」으로 보내서 열면 바로 연결돼요. 코드를 아는 사람은 기록을 볼 수 있으니 남한테는 보내지 마세요.</p>'
      +(isApp()?'':'<p class="note">📲 <b>홈 화면에 깐 앱</b>으로 쓰시면: 위 「🔗 링크 복사」 → 홈 화면 앱 열기 → 「📋 복사한 코드로 연결」. 아이폰은 브라우저와 앱의 기록 칸이 따로라 한 번 더 연결해야 해요.</p>')
      +'<div class="bkb"><button class="btn sm" data-a="sygo">🔄 지금 맞추기</button><button class="btn sm ghost" data-a="syoff">연결 끊기</button></div></div>';return h}
  if(SY.tok&&SY.gid)return h+'<p class="note">✅ GitHub로 연결됐어요'+(SY.at?' · 마지막으로 맞춘 때 <b>'+armAgo(SY.at)+'</b>':'')+'.</p>'+(SY.err?'<p class="adw">⚠ '+esc(SY.err)+'</p>':'')+'<div class="bkb"><button class="btn sm" data-a="sygo">🔄 지금 맞추기</button><button class="btn sm ghost" data-a="syoff">연결 끊기</button></div></div>';
  h+='<p class="note">휴대폰과 컴퓨터에서 같은 캐릭터·장비·끝낸 퀘스트를 자동으로 맞춰요. 로그인은 필요 없어요.</p>'
    +'<div class="sy2"><div><b>① 처음 기기에서</b><small>지금 기록을 올리고 연동 코드를 만들어요</small><button class="btn full" data-a="symk">연동 코드 만들기</button></div>'
    +'<div><b>② 다른 기기에서</b><small>받은 링크를 열거나 QR을 찍으면 끝 · 홈 화면 앱은 복사한 링크로 한 번에</small><button class="btn full" data-a="sypaste">📋 복사한 코드로 연결</button><input style="margin-top:6px" class="inp" autocomplete="off" autocapitalize="characters" placeholder="연동 코드 (예: 1234…-7K3Q…)" data-c="syjoin"><button class="btn ghost full" style="margin-top:6px" data-a="syjn">코드로 연결</button></div></div>'
    +(SY.err?'<p class="adw">⚠ '+esc(SY.err)+'</p>':'')
    +'<p class="mute" style="font-size:12px">기록은 무료 저장 서비스(textdb.dev)에 <b>암호화해서</b> 올려요. 열쇠는 연동 코드 안에만 있어서 서비스에서도 내용을 못 봐요. 오래 안 쓰면 지워질 수 있지만 각 기기 기록은 그대로 남아요.</p>'
    +'</div>';
  return h}
const me=()=>DB.list.find(c=>c.id===DB.cur)||null;
const newId=()=>'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
function specOf(c){const C=D_CLS[c.cls];return (C&&C.specs.find(s=>s.id===c.spec))||(C&&C.specs[0])}
const SOLO={priest:{sp:1,shadow:.6,holy:.4,int:.6,spi:.6,mp5:.6,sta:.25,heal:.3,dpsWand:1.2,scrit:8,shit:10},
  paladin:{str:1,agi:.5,ap:.5,sta:.3,int:.3,heal:.2,dps2h:2.2,dpsMain:1.6,crit:13,hit:15},
  shaman:{str:.8,agi:.4,ap:.4,int:.5,sp:.5,nature:.3,heal:.2,sta:.25,dps2h:1.8,dpsMain:1.4,crit:10,hit:12},
  druid:{sp:1,nature:.5,arcane:.5,int:.5,spi:.3,heal:.25,sta:.2,scrit:8,shit:10}};
const _wc={};
/* 레벨업 중(58 미만)엔 혼자 사냥하니 체력·정신력을 조금 더 쳐요 (60레벨 시뮬 값 그대로면 체력이 너무 낮게 잡힘) */
/* 포에버 등급(적중·치명타·회피)은 아이템에 60레벨 %로 넣어 둠 → 레벨이 낮으면 같은 등급이 % 더 큼 (60레벨 등급 × (레벨-8)/52) */
const RATEK=['hit','crit','scrit','shit','dodge','parry','exp'];const rateF=L=>L>=58?1:Math.min(2.6,52/Math.max(2,L-8));
/* 종족 특성(포에버): 인간 정신력 +10%, 노움 최대 마나 +5% → 정신력·지능 가치가 그만큼 조금 오름. 적중·치명타 +1%(드워프·인간)는 순위를 안 바꿔서 뺌 */
const RACEW={human:{spi:1.1},gnome:{int:1.03}};const _wr={};
function wRace(w,c){const m=RACEW[c.race];if(!m)return w;const k=c.race+'|'+c.cls+'/'+c.spec+'/'+(c.gmode||'')+'/'+(c.lv||60);if(_wr[k]&&_wr[k].b===w)return _wr[k].r;const r=Object.assign({},w);for(const x in m)if(r[x]&&(x!=='int'||r.int>=.2))r[x]=+(r[x]*m[x]).toFixed(3);_wr[k]={b:w,r};return r}
/* 적중·회피막기감소 상한 (포에버): 60레벨 보스 기준 근접 8%·주문 17%·회피막기감소 6.5%, 레벨업(몹 1~2레벨 위) 근접 6%·주문 5%·회피막기감소 5%.
   착용 장비 + 종족(드워프 적중 1%)만 셈 — 특성 적중은 모름 */
const RACE_HIT={dwarf:1};let _hc={k:'',v:null};
function hitInfo(c){const k=(c.eq?Object.values(c.eq).join(','):'')+'|'+c.lv+'|'+c.race+'|'+c.cls+'|'+c.spec;if(_hc.k===k)return _hc.v;
  const w=wOf0(c);const cast=(w.shit||0)>(w.hit||0);const L=c.lv||60;const f=rateF(L);const tot={};SLOTS.forEach(([s])=>{const it=eqIt(c,s);if(it)for(const x of ['hit','exp'])if(it.st[x])tot[x]=(tot[x]||0)+it.st[x]});
  const end=L>=58;const v={cast,hit:+((tot.hit||0)*f+(RACE_HIT[c.race]||0)).toFixed(1),cap:cast?(end?17:5):(end?8:6),exp:+((tot.exp||0)*f).toFixed(1),ecap:end?6.5:5,phys:!cast&&!w.heal};_hc={k,v};return v}
const capF=(cur,cap)=>cur>=cap?.15:cur>=cap-1?.6:1;
const _wcap={};function wOf(c){const w=wRace(wOf1(c),c);if(w.def)return w;const h=hitInfo(c);const fh=capF(h.hit,h.cap),fe=h.phys?capF(h.exp,h.ecap):1;if(fh===1&&fe===1)return w;
  const k=fh+'|'+fe;if(_wcap.b===w&&_wcap.k===k)return _wcap.r;const r=Object.assign({},w);if(fh<1){if(r.hit)r.hit*=fh;if(r.shit)r.shit*=fh}if(fe<1&&r.exp)r.exp*=fe;_wcap.b=w;_wcap.k=k;_wcap.r=r;return r}
const _wl={};
function wOf1(c){const w=wOf0(c);if((c.lv||60)>=58||w.def)return w;const L=c.lv||60;const k=c.cls+'/'+c.spec+'/'+(c.gmode||'')+'/'+L;if(_wl[k]&&_wl[k].b===w)return _wl[k].r;
  const r=Object.assign({},w,{sta:Math.max(w.sta||0,.4)});if(w.sp>=1||w.heal>=1)r.spi=Math.max(w.spi||0,.3);const f=rateF(L);RATEK.forEach(x=>{if(r[x])r[x]=+(r[x]*f).toFixed(2)});_wl[k]={b:w,r};return r}
/* 탱커: Wowhead WoW Forever 탱커 능력치 가이드의 생존·균형·위협(TPS) 우선순위를 점수표로.
   적중 1% = 전투력 60(전사)·주문력 21(성기사), 치명타 1% = 전투력 34·주문력 12 (가이드 계산값). 힘 1 = 전투력 2 */
const TW={
 'warrior/protection':{def:{sta:1,def:.9,armor:.03,agi:.6,dodge:14,parry:12,block:.25,blockp:6,str:.4,ap:.2,hit:6,crit:3,dps1h:1},
   bal:{sta:1,hit:15,def:.6,armor:.02,str:.7,ap:.35,agi:.45,dodge:9,parry:8,crit:8,blockp:4,block:.2,dps1h:1.5},
   off:{hit:30,crit:17,str:1,ap:.5,sta:.6,agi:.4,dps1h:2.5,def:.3,armor:.01,dodge:5,parry:5,blockp:2,block:.1}},
 'paladin/protection':{def:{sta:1,def:.9,armor:.03,agi:.5,blockp:7,block:.3,sp:.5,holy:.5,dodge:12,parry:10,str:.2,hit:5,int:.1,dps1h:.6},
   bal:{sta:1,sp:.9,holy:.9,hit:18,def:.6,armor:.02,agi:.35,blockp:4,block:.2,dodge:8,parry:7,crit:8,str:.15,int:.1,dps1h:.8},
   off:{sp:1,holy:1,hit:21,crit:12,sta:.6,str:.15,agi:.2,def:.3,armor:.01,blockp:2,dodge:4,parry:4,int:.1,dps1h:1}},
 'druid/feral-bear':{def:{sta:1,def:.8,armor:.04,agi:.9,dodge:12,str:.4,ap:.2,hit:5,crit:2},
   bal:{sta:1,agi:.8,str:.7,ap:.35,armor:.03,def:.5,hit:12,crit:6,dodge:9},
   off:{hit:25,str:1,agi:.7,ap:.5,crit:12,sta:.6,armor:.015,def:.2,dodge:4}}};
const TMODE=[['def','생존','안 죽게','ability_warrior_defensivestance'],['bal','균형','처음엔 이것','inv_shield_06'],['off','위협','어그로·TPS','ability_warrior_sunder']];
const isTank=c=>!!TW[c.cls+'/'+c.spec];
const shieldTank=c=>c.spec==='protection'&&(c.cls==='warrior'||c.cls==='paladin');
const _tw={};function tankW(c){const k=c.cls+'/'+c.spec+'/'+(c.tmode||'bal');if(_tw[k])return _tw[k];const w=Object.assign({},TW[c.cls+'/'+c.spec][c.tmode||'bal']);w.dps=w.dps1h||0;w.rdps=.03;return _tw[k]=w}
function wOf0(c){if(isTank(c))return tankW(c);const w=(W[c.cls]||{})[c.spec]||Object.values(W[c.cls]||{})[0]||{};
  if(!w.heal||!SOLO[c.cls])return w;const m=c.gmode==='solo'?'solo':'heal';const k=c.cls+'/'+c.spec+'/'+m;if(_wc[k])return _wc[k];
  let r;if(m==='heal'){r=Object.assign({},w,{dpsWand:0,rdps:0})}else{r=Object.assign({},SOLO[c.cls]);r.dps=r.dpsMain??r.dps2h??0;r.rdps=r.dpsWand??0}
  return _wc[k]=r}

/* ===================== 전투정보실 (깃허브가 3시간마다 data/armory/chars.json 으로 가져옴) ===================== */
let ARM={};let ARM_OK=false;
const ARM_SLOT={HEAD:'head',NECK:'neck',SHOULDER:'shoulder',BACK:'back',CHEST:'chest',WRIST:'wrist',HANDS:'hands',WAIST:'waist',LEGS:'legs',FEET:'feet',FINGER_1:'ring1',FINGER_2:'ring2',TRINKET_1:'trink1',TRINKET_2:'trink2',MAIN_HAND:'main',OFF_HAND:'off',RANGED:'ranged'};
const ARM_INV={CLOAK:'ba',CHEST:'ch',ROBE:'ch',FEET:'fe',HAND:'ha',HEAD:'he',FINGER:'fi',LEGS:'le',SHOULDER:'sh',WAIST:'wa',WRIST:'wr',NECK:'ne',TRINKET:'tr',TWOHWEAPON:'2h',WEAPON:'1h',WEAPONMAINHAND:'mh',WEAPONOFFHAND:'oh',SHIELD:'oh',HOLDABLE:'ho',RANGED:'ra',RANGEDRIGHT:'ra',THROWN:'ra',RELIC:'ra'};
/* 등급(rating)은 60레벨 %로: 적중 10·치명타 14·회피 12·무기 막기 15 */
const ARM_RATE={HIT_RATING:['hit',10],CRIT_RATING:['crit',14],CRITICAL_STRIKE_RATING:['crit',14],DODGE_RATING:['dodge',12],PARRY_RATING:['parry',15]};
const ARM_STAT={SPELL_DAMAGE_DONE:'sp',SPELL_HEALING_DONE:'heal',STRENGTH:'str',AGILITY:'agi',STAMINA:'sta',INTELLECT:'int',SPIRIT:'spi',SPELL_POWER:'sp',BONUS_HEALING:'heal',SPELL_HEALING:'heal',HEALING:'heal',MANA_REGENERATION:'mp5',ATTACK_POWER:'ap',RANGED_ATTACK_POWER:'ap',DEFENSE_SKILL_RATING:'def',DEFENSE:'def',BLOCK_VALUE:'block',FIRE_SPELL_POWER:'fire',FROST_SPELL_POWER:'frost',NATURE_SPELL_POWER:'nature',SHADOW_SPELL_POWER:'shadow',ARCANE_SPELL_POWER:'arcane',HOLY_SPELL_POWER:'holy'};
const ARM_Q={POOR:'p',COMMON:'c',UNCOMMON:'u',RARE:'r',EPIC:'e',LEGENDARY:'l'};
function armRace(r){r=String(r||'').toLowerCase();return /night|나이트/.test(r)?'nightelf':/gnome|노움/.test(r)?'gnome':/dwarf|드워프/.test(r)?'dwarf':/human|인간/.test(r)?'human':'skyborne'}
function armSt(g){const st={};(g.stats||[]).forEach(([k,v])=>{const m=ARM_STAT[k];if(m)st[m]=(st[m]||0)+v;const r=ARM_RATE[k];if(r)st[r[0]]=+((st[r[0]]||0)+v/r[1]).toFixed(2)});
  (g.spells||[]).forEach(t=>{let m=t.match(/치유량이 최대 (\d+)/);if(m)st.heal=(st.heal||0)+ +m[1];m=t.match(/피해와 치유량이 최대 (\d+)/);if(m)st.sp=(st.sp||0)+ +m[1];m=t.match(/5초마다 (\d+)의 마나/);if(m)st.mp5=(st.mp5||0)+ +m[1]});
  if(g.dps)st.dps=g.dps;return normST(st)}
function armItem(g){let it=IT.get(g.id);if(it)return it;const st=armSt(g);
  it={id:g.id,lv:g.req||1,est:false,sl:ARM_INV[g.inv]||'',cs:g.cls+'.'+g.sub,q:ARM_Q[g.q]||'c',st,eff:false,src:[],mask:511,ph:'',allow:null,prof:'',nm:g.nm,ic:'',icUrl:g.icon,ob:g.req||1,arm:true};
  ITEMS.push(it);IT.set(it.id,it);return it}
function armApply(c,silent){const A=ARM[c.arm];if(!A||!A.gear)return false;c.eq={};
  for(const g of Object.values(A.gear)){const s=ARM_SLOT[g.slot];if(!s)continue;armItem(g);c.eq[s]=g.id}
  if(A.level)c.lv=+A.level||c.lv;if(A.cls&&CL.includes(A.cls)&&c.cls!==A.cls){c.cls=A.cls;c.spec=D_CLS[A.cls].specs[0].id}
  /* 전투정보실 특성 → 「내 특성」 (게임 애드온으로 더 최근에 불러온 게 있으면 그대로 둠) */
  if(A.tal&&A.tal.length&&c.cls===A.cls){const C=D_CLS[c.cls];const T=Object.entries(C.talents);const M={};
    A.tal.forEach(tr=>{const tree=C.trees.includes(tr.name)?tr.name:null;(tr.t||[]).forEach(([nm,rk,ic])=>{let e=T.find(([k,v])=>(!tree||v[1]===tree)&&v[0]===nm);if(!e&&ic)e=T.find(([k,v])=>(!tree||v[1]===tree)&&String(v[3])===String(ic));if(e&&rk>0)M[e[0]]=Math.min(e[1][2],rk)})});
    const at=Date.parse(A.checked)||Date.now();if(Object.keys(M).length&&!(c.tal&&c.tal.src==='game'&&c.tal.at>at))c.tal={cls:c.cls,r:M,src:'armory',at}}
  c.armAt=A.checked;save();if(!silent)toast('전투정보실에서 불러왔어요');return true}
function armAgo(t){if(!t)return '';const m=Math.round((Date.now()-new Date(t))/60000);return m<1?'방금':m<60?m+'분 전':m<1440?Math.round(m/60)+'시간 전':Math.round(m/1440)+'일 전'}
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
  h+='<details class="fold"'+(ui.armreqOpen?' open':'')+'><summary>명단에 내 캐릭터가 없어요 → 여기서 바로 넣기</summary><p class="note">게임 캐릭터 <b>이름-서버</b>를 넣고 보내면, 전투정보실에서 진짜 있는 캐릭터인지 확인한 뒤 <b>20분 안에 자동으로</b> 명단에 들어가요.</p>'
    +'<div class="armrq"><select class="inp" data-c="armrgn"><option value="kr">한국</option><option value="us">미국</option><option value="eu">유럽</option><option value="tw">대만</option></select><input class="inp" maxlength="40" autocomplete="off" placeholder="이름-서버 (예: 개추-피추)" data-c="armrqn"><button class="btn sm" data-a="armrq">명단에 넣기</button></div>'
    +(ARMRQ.length?'<p class="note">보낸 것: '+ARMRQ.map(x=>'<b>'+esc(x)+'</b>').join(', ')+' · 들어가면 위 명단에 나타나요</p>':'')+'</details>';
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
/* 둘 중 하나만 할 수 있는 퀘스트(Questie exclusiveTo → ex)·길잡이 퀘스트(bc): 짝을 이미 끝냈거나 퀘스트창에 있으면 이 퀘스트는 못 받음.
   추천·받기 목록에서만 뺌(앞 퀘스트 판정에는 안 씀 — 갈래가 합쳐지는 뒤 퀘스트를 막지 않으려고) */
/* 받으려면 전문기술이 필요한 퀘스트(sk=[기술 번호, 숙련도]): 게임에서 전문기술을 가져온 캐릭터(c.profLv)만 판단 — 없거나 숙련도가 모자라면 못 받음 */
const SKILL_KO={164:'대장기술',165:'가죽세공',171:'연금술',182:'약초채집',185:'요리',186:'채광',197:'재봉술',202:'기계공학',333:'마법부여',393:'무두질',129:'응급치료',356:'낚시'};
function skOut(c,q){if(!q||!q.sk||!c.profLv)return false;const nm=SKILL_KO[q.sk[0]];if(!nm)return false;const v=c.profLv[nm];return !v||(+v[0]||0)<(q.sk[1]||0)}
function exOut(c,q){if(!q)return false;const gone=id=>{if((c.ql||{})[id])return true;const X=QDB&&QDB.get(id);return !!(X&&mqDone(c,X))};
  /* 길잡이 퀘스트(bc): 가리키는 퀘스트를 이미 받았거나 끝냈으면 길잡이는 못 받음 */
  return !!((q.ex&&q.ex.some(gone))||(q.bc&&gone(q.bc))||skOut(c,q))}
function qdbOk(c,q){if(q.cls&&!(q.cls&(CLS_BIT[c.cls]||0)))return false;if(q.rc){const b=RACE_BIT[c.race]||0;if(b&&Math.floor(q.rc/b)%2===0)return false}return true}
function qdbLoad(){if(QDB_LOAD)return;QDB_LOAD=true;
  fetch('data/qdb/quests.jsonl?v='+D_VER.qdb).then(r=>r.ok?r.text():'').then(t=>{const M=new Map();
    t.split('\n').forEach(l=>{if(!l)return;try{const o=JSON.parse(l);for(const k of ['g','r'])if(o[k]&&NPC_KO[o[k][0]])o[k][0]=NPC_KO[o[k][0]];M.set(o.id,o)}catch(e){}});
    /* 자료 정리: 좌표 -1(던전 안 등 모름) 지우기 · 없는 선행 퀘스트(호드용 등) 지우기 · 최소 레벨>퀘스트 레벨이면 맞추기 · 한글이 하나도 없는 퀘스트(다른 시즌 자료) 빼기 */
    const lat=t=>/[A-Za-z]{3}/.test(t||'')&&!/[가-힣]/.test(t||'');
    for(const [id,o] of M){if(lat(o.n)&&lat(o.o)){M.delete(id);continue}
      for(const k of ['g','r'])if(o[k]&&o[k][2]&&/-/.test(String(o[k][2])))o[k][2]='';
      for(const k of ['pre','pre1'])if(Array.isArray(o[k])){o[k]=o[k].filter(x=>M.has(x));if(!o[k].length)delete o[k]}
      if(o.nx&&!M.has(o.nx))delete o.nx;if(o.m>o.lv&&o.lv>0)o.lv=o.m;
      /* 최소 레벨 자료가 없는 퀘스트(포에버 새 퀘스트 188개 등): 0이면 아무 레벨에나 받는 것처럼 보이므로 퀘스트 레벨-5로 어림하고 「추정」 표시 */
      if(!o.m&&o.lv>1){o.m=Math.max(1,o.lv-5);o.mEst=1}}
    {const HZ=/^(듀로타|멀고어|티리스팔 숲|은빛소나무 숲|오그리마|언더시티|썬더 블러프)$/;const byN=new Map();for(const o of M.values()){const k=o.n+'|'+o.z;if(!byN.has(k))byN.set(k,[]);byN.get(k).push(o)}
      for(const L of byN.values()){if(L.length<2)continue;const ok=L.filter(o=>!(o.g&&HZ.test(o.g[1]||'')));if(ok.length&&ok.length<L.length)L.forEach(o=>{if(!ok.includes(o))M.delete(o.id)})}}
    QDB=M;qdbChains();
    /* 최소 레벨을 어림한 퀘스트가 던전 퀘스트 자료(forg)에 있으면 그 값으로 (예: 아감마간의 피 45) */
    for(const d of DGS)for(const q of d.q){const X=M.get(+q.id);if(X&&X.mEst&&q.min>0){X.m=q.min;delete X.mEst}
      /* 던전 퀘스트 자료(forg)의 영어 이름·목표는 퀘스트 자료의 한글로 (예: Bring Loremaster Dibbs' … → 현자 딥스의 이랄라이 번역본을 …) */
      if(X){if(lat(q.nm)&&!lat(X.n))q.nm=X.n;if((!q.obj||lat(q.obj))&&X.o&&!lat(X.o))q.obj=X.o;
        /* 시작 글이 비었거나 호드 도시(예: 타베사의 임무 → 언더시티 아나스타샤)면 얼라이언스 받는 곳으로 */
        if(X.g&&X.g[0]&&X.g[1]&&X.g[3]!=='item'&&!/^(동부 왕국|칼림도어)$/.test(X.g[1])&&(!(q.start||'').trim()||/언더시티|오그리마|썬더 블러프/.test(q.start||'')))q.start=X.g[0]+' · '+X.g[1]+(X.g[2]?' '+String(X.g[2]).replace(',',', '):'')}}
    /* 애드온 v3.8 기록(받을 수 있었던 레벨)으로 「몇 레벨부터」 바로잡기 */
    try{gObsApply()}catch(e){}
    /* 던전 퀘스트 순서: 앞 퀘스트가 적은 것(바로 받을 수 있는 것) 먼저, 같으면 낮은 레벨 — 연계 퀘스트는 앞 단계가 위에 */
    for(const d of DGS){const dep=new Map(d.q.map(q=>[q.id,preChain(+q.id).length]));d.q.sort((a,b)=>dep.get(a.id)-dep.get(b.id)||(a.lv||0)-(b.lv||0))}
    for(const q of M.values()){const d=QD.get(q.id);if(!d)QD.set(q.id,qdbToQD(q));else if(!(d.ch&&d.ch.length>1)&&q._ch)d.ch=q._ch}
    /* 홈(마을 할 일·내 메모)·장비(가방 정리)도 퀘스트 자료를 써서 다 받으면 다시 그림 */
    if(ui.tab==='quest'||ui.tab==='home'||ui.tab==='gear'||ui.sheet)rerender(true)}).catch(()=>{QDB=new Map();rerender(true)})}
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
function mqDone(c,q){return !!((c.mq||{})[q.id]||(c.dq||{})[q.id]||(c.fq||{})[q.z+'|'+q.n])}
function mapView(c){const L=c.lv;
  if(!QDB){qdbLoad();return '<p class="empty-st">맵 전체 퀘스트를 불러오는 중이에요…</p>'}
  if(!QDB.size)return '<p class="empty-st">퀘스트 자료를 못 불러왔어요. 잠시 뒤에 다시 열어 주세요.</p>';
  const all=[...QDB.values()].filter(q=>qdbOk(c,q)&&!exOut(c,q)&&q.z&&q.c!=='던전');
  const Z={};for(const q of all){const k=q.c+'|'+q.z;(Z[k]=Z[k]||{c:q.c||'기타',z:q.z,q:[]}).q.push(q)}
  const zs=Object.values(Z).map(o=>{const lv=o.q.filter(q=>q.m>0&&q.lv-q.m<=12).map(q=>q.lv).filter(x=>x>0).sort((a,b)=>a-b);o.lo=lv[Math.floor(lv.length*.1)]||0;o.hi=lv[Math.min(lv.length-1,Math.floor(lv.length*.9))]||0;o.mid=lv[Math.floor(lv.length/2)]||0;o.done=o.q.filter(q=>mqDone(c,q)).length;return o});
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
  {const zi=zoneItems(c,o.z);const gN=zi.list.filter(x=>x.g>.01).length;h+='<details class="card zinfo"'+(ui.zinfo?' open':'')+'><summary>🗺️ 이 지역 정보'+(gN?' · <span class="zg">⭐ 좋은 장비 '+gN+'개</span>':' · 얻는 장비')+'</summary>'+(ui.zinfo?zoneInfo(c,o.z,{n:5}):'')+'</details>'}
  h+='<div class="chips seg">'+[['now','지금 할 수 있는 것',nNow],['left','안 끝낸 것',nLeft],['all','전부',o.q.length]].map(x=>'<button class="chip'+(f===x[0]?' on':'')+'" data-a="mf" data-k="'+x[0]+'">'+x[1]+' <span class="n">'+x[2]+'</span></button>').join('')+'</div>';
  if(!qs.length){h+='<p class="empty-st">'+(f==='now'?'레벨 '+L+'에 지금 받을 수 있는 퀘스트가 여기엔 없어요.':'남은 퀘스트가 없어요.')+'</p>';if(f==='now'&&nLeft)h+='<button class="btn ghost full sm" data-a="mf" data-k="left">안 끝낸 퀘스트 '+nLeft+'개 보기</button>';return h}
  /* 연계는 한 묶음, 같은 이름은 한 줄 */
  const zoneIds=new Set(o.q.map(q=>q.id));const shownIds=new Set(qs.map(q=>q.id));const G=[];const seenCh=new Set();
  for(const q of qs){const root=q._root;const tree=root!=null&&(QKIDS[root]||root!==q.id);if(tree){if(seenCh.has(root))continue;seenCh.add(root);
    const nx=treeIds(root).map(id=>QDB.get(id)).find(x=>x&&zoneIds.has(x.id)&&shownIds.has(x.id)&&!mqDone(c,x)&&qdbOk(c,x));G.push({root,lv:(QDB.get(root)||q).lv,at:nx||q})}else G.push({q,lv:q.lv,at:q})}
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
    let b='<div class="st'+(open?' open':'')+'"><button class="sh2" data-a="mh" data-k="'+esc(k)+'"><span class="no">'+(H.i>=998?'·':ix+1)+'</span><span class="hn"><b>'+esc(nm)+'</b><span>'+(H.lv>0?'Lv '+H.lv+'부터':'레벨 제한 없음')+'</span></span><span class="hc">'+H.cnt+'개</span><span class="cv">'+(open?'⌃':'⌄')+'</span></button>';
    if(open){/* 연계는 한 줄 전체, 이어진 낱개 퀘스트는 묶어서 PC에선 두세 칸으로 */let o='',run='';const flush=()=>{if(run){o+='<div class="sgl">'+run+'</div>';run=''}};
      H.g.forEach(g=>{if(!g.q){flush();o+=chainTree(c,g.root,zoneIds,shownIds,{hub:H.n,hubOf:x=>hubOf(x)[0]})}else{const same=byNm[g.q.n];run+=mqRow(c,g.q,0,same.length>1?same.length:0)}});flush();
      b+='<div class="sb">'+o+'</div>'}
    return b+'</div>'}).join('')+'</div>';
  if(f==='now'&&nLeft>nNow)h+='<button class="btn ghost full sm more2" data-a="mf" data-k="left">레벨이 안 맞는 퀘스트 '+(nLeft-nNow)+'개 더 보기</button>';
  return h}
function treeIds(root){const out=[];const st=[root];while(st.length&&out.length<80){const x=st.pop();out.push(x);(QKIDS[x]||[]).slice().reverse().forEach(y=>st.push(y))}return out}
function chainTree(c,root,zoneIds,shownIds,opt){opt=opt||{};const L=c.lv;const all=treeIds(root).filter(id=>QDB.get(id)&&qdbOk(c,QDB.get(id)));const n=all.length;
  const doneN=all.filter(id=>mqDone(c,QDB.get(id))).length;const lvs=all.map(id=>QDB.get(id).lv).filter(Boolean);
  const nextId=all.find(id=>!mqDone(c,QDB.get(id)));const branchy=all.some(id=>(QKIDS[id]||[]).filter(k=>all.includes(k)).length>1);
  const rootQ=QDB.get(root);ui.chopen=ui.chopen||{};const full=n<=4||!!ui.chopen[root]||(ui.chopen[root]!==false&&window.matchMedia&&matchMedia('(min-width:1000px)').matches);const pct=n?Math.round(doneN/n*100):0;
  let h='<div class="chainb'+(full?'':' sum')+'"><div class="chh"><span>'+qico('chain')+' <b>'+esc(rootQ?rootQ.n:'연계')+'</b> 연계 · '+n+'단계'+(branchy?' · 갈래 있음':'')+'</span><span class="mute">Lv '+Math.min(...lvs)+'→'+Math.max(...lvs)+' · '+doneN+'/'+n+'</span></div><div class="chbar"><i style="width:'+pct+'%"></i></div>';
  const where=x=>{if(!opt.hubOf||!x)return '';const w=opt.hubOf(x);return w&&w!==opt.hub?w.replace(/ \(\d+, \d+\)$/,''):''};
  if(!full){/* 긴 연계는 다음 단계만 */const nx=nextId!=null?QDB.get(nextId):null;const si=nx?all.indexOf(nextId)+1:0;
    h+=nx?'<div class="chs cur"><span class="stp">'+si+'</span>'+(zoneIds.has(nx.id)?mqRow(c,nx,1,0,where(nx)):'<button class="awayb" data-a="qopen" data-k="'+nx.id+'">['+(nx.lv||'?')+'] '+esc(nx.n)+'<span>다른 지역 · '+esc(nx.z||'')+' ›</span></button>')+'</div>':'<p class="mute" style="padding:2px 6px">이 연계는 다 끝냈어요 ✓</p>';
    return h+'<button class="chx" data-a="chx" data-k="'+root+'">전체 '+n+'단계 보기 ⌄</button></div>'}
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
      if(ks.length>1)return r0+'<div class="chfork"><div class="fk">↳ 여기서 '+ks.length+'갈래로 나뉘어요</div>'+ks.map((k,i)=>'<div class="chbr"><div class="bl">갈래 '+brL(i)+'</div><div class="chflow">'+node(k,st2)+'</div></div>').join('')+'</div>';
      return r0}
    const body=zoneIds.has(id)?mqRow(c,x,1,0,where(x)):'<button class="awayb" data-a="qopen" data-k="'+id+'">['+(x.lv||'?')+'] '+esc(x.n)+'<span>다른 지역 · '+esc(x.z||'')+' ›</span></button>';
    let r='<div class="'+cls+(zoneIds.has(id)?'':' away')+'"><span class="stp">'+step+'</span>'+body+'</div>';
    const kids=(QKIDS[id]||[]).filter(k=>all.includes(k));
    if(kids.length===1)r+=node(kids[0],step+1);
    else if(kids.length>1)r+='<div class="chfork"><div class="fk">↳ 여기서 '+kids.length+'갈래로 나뉘어요 (따로따로 받을 수 있어요)</div>'+kids.map((k,i)=>'<div class="chbr"><div class="bl">갈래 '+brL(i)+'</div><div class="chflow">'+node(k,step+1)+'</div></div>').join('')+'</div>';
    return r};
  return h+'<div class="chflow">'+node(root,1)+'</div>'+(n>4?'<button class="chx" data-a="chx" data-k="'+root+'" data-f="1">접기 ⌃</button>':'')+'</div>'}
function qStar(c,id){const R=qRw(id);for(const x of [...(R.ch||[]),...(R.fx||[])]){const it=IT.get(x[0]);if(it&&usable(it,c)){const b=bestSlot(it,c);if(b&&b.g>.01)return true}}return false}
/* 둘(셋) 중 하나만 하는 퀘스트(ex): 길잡이(bc)로 이어지는 짝은 고르는 게 아니라서 뺌 · 내 캐릭터가 받을 수 있는 짝만 */
function exPeers(c,q){if(!q||!q.ex||!q.ex.length||!QDB)return [];return q.ex.map(i=>QDB.get(i)).filter(x=>x&&x.id!==q.id&&x.id!==q.bc&&x.bc!==q.id&&qdbOk(c,x))}
function exLine(c,q){const P=exPeers(c,q);if(!P.length)return '';const nm=P.slice(0,3).map(x=>'「'+x.n+'」').join('·')+(P.length>3?' 외 '+(P.length-3)+'개':'');return '하나만 고르는 퀘스트 — 이걸 하면 '+nm+'은(는) 못 받아요'}
function mqRow(c,q,inCh,same,where){const d=mqDone(c,q),L=c.lv,lock=q.m>L;const ch=inCh?null:q._ch;
  const pf=d?null:preFirst(c,q.id);const tags=(pf?'<span class="tag pre">먼저 「'+esc(pf.n)+'」</span>':'')+(ch?'<span class="tag">🔗 연계 '+(ch.findIndex(r=>r[6]===q.id)+1)+'/'+ch.length+'</span>':'')+(lock?'<span class="tag">'+q.m+'레벨부터</span>':'')+(q.rep?'<span class="tag">반복</span>':'')+(q.cls?'<span class="tag">직업 전용</span>':'')+(q.rc?'<span class="tag">종족 전용</span>':'')+(!d&&exPeers(c,q).length?'<span class="tag" title="'+esc(exLine(c,q))+'">택1</span>':'');
  const body=parch(c,q.id,{nm:q.n,obj:q.o,place:esc(q.z),tags,done:d,kind:'mq',ck:String(q.id),pre:q.pre||q.pre1});
  let sub=taskShort({id:q.id,obj:q.o});if(!sub)sub=(q.o||'').slice(0,40);if(lock)sub='🔒 '+mTxt(q)+' · '+sub;else if(pf)sub='🔒 먼저 「'+pf.n+'」 · '+sub;if(where)sub='📍 '+where+' · '+sub;
  return qFold({key:'m'+q.id,qd:q.id,lite:1,sub,done:d,lock:lock||(!!pf&&!!c.imported),lv:q.lv,nm:q.n,body,side:(qStar(c,q.id)?'<span class="qstar" title="나한테 좋은 장비 보상">⭐</span>':'')+(q.id>=10000?qico('fnew'):'')+(q.cls?qico('cls'):'')+(same?'<span class="lk">같은 퀘 '+same+'개</span>':ch?qico('chain'):'')})}
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
/* 할 일 이름이 영어로만 남은 경우(번역 안 된 아이템·물체) → 퀘스트 목표 문장 앞부분으로 대신 */
const objClause=o=>{const raw=(o||'').replace(/<[^>]+>/g,'');let c=raw.split(/ 다음|,|\.|\n/)[0].trim();if(/[은는]$/.test(c)&&raw.includes(c+' 다음'))c+=' 뒤 …';return c.length>28?c.slice(0,27)+'…':c};
/* 게임에서 확인한 한국어 이름 (포에버 신규 퀘스트 아이템) */
const ITEM_KO={'Unstudied Artifact':'연구되지 않은 유물',"Explorers' League Mining Helmet":'탐험가 연맹 채굴용 안전모','Pristine Mattock':'온전한 곡괭이'};
function npcKoL(s){const K=typeof D_NPCKO!=='undefined'?D_NPCKO:{},seen=new Set();return String(s||'').split(/,\s*(?![^()]*\))/).map(p=>{const m=p.match(/^(.*?)(\s*\(Lv [\d\-]+\))?$/);const n=(m[1]||'').trim();return (K[n]||n)+(m[2]||'')}).filter(p=>{const k=p.replace(/\s*\(Lv [\d\-]+\)$/,'');if(!k||seen.has(k))return false;seen.add(k);return true}).join(', ')}
function tasksOf(d,obj){const T=tasksOfK(d,obj);T.forEach(t=>{if(ITEM_KO[t.nm])t.nm=ITEM_KO[t.nm];if(typeof D_NPCKO!=='undefined'&&D_NPCKO[t.nm])t.nm=D_NPCKO[t.nm];if(t.drop)t.drop=npcKoL(t.drop.replace(/ ?그 밖 지역$/,'').trim());const nm=(t.nm||'').replace(/<[^>]+>/g,'');if(nm&&!/[가-힣]/.test(nm)&&obj&&/[가-힣]/.test(obj)){t.nm=objClause(obj);t.cnt=0;t.en=nm}});return T}
function tasksOfK(d,obj){const op=objPairs(obj);const wt0=(d.wf&&d.wf.t)||[];
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
const NPC_KO2={'Locked Chest':'잠긴 상자','An Empty Jar':'빈 항아리','Twilight Tome':'황혼의 고서','Hidden Shrine':'숨겨진 제단','Beached Sea Creature':'해변으로 올라온 바다 생물','Wanted: ORCS!':'현상수배: 오크!','Mysterious Deadmines Chest':'수상한 죽음의 폐광 상자','Mysterious Wailing Caverns Chest':'수상한 통곡의 동굴 상자','Battered Tackle Box':'낡은 낚시 도구함','Crystalline Tear':'수정 눈물','Sandy Cookbook':'모래투성이 요리책','Strange Orb':'이상한 구슬','Spear of Mannoroth':'만노로스의 창','Shattered Orb':'부서진 구슬','Alonso':'알론소',"Illari's Loot Cache":'일라리의 전리품 상자','Essene Villard':'에센 빌라드','Ketharas':'케타라스','Fraxinus':'프락시누스','Tiala Whitemane':'티알라 화이트메인','Unmarked Grave':'표시 없는 무덤','Sefira Everbright':'세피라 에버브라이트','Daythor Brellan':'데이소르 브렐란',"Zet'gan":'제트간','Eluneth':'엘루네스','Thisalee Crow':'티살리 크로우','Barkskin Matriarch':'나무껍질 우두머리','Osi Mistpaw':'오시 미스트포','Elder Mistpaw':'장로 미스트포','Hyacinth':'히아신스','Curious Crow':'호기심 많은 까마귀','Skylord Omnuron':'하늘군주 옴누론','Thylaen':'틸라엔','Kaylaena Springwhisper':'케일라에나 스프링위스퍼','Nami':'나미','Johun "Punchy" Dillas':'"주먹" 조훈 딜라스','Marn Euhorn':'마른 유혼','Fenwick Togglespring':'펜윅 토글스프링','Veteran of the Third War':'3차 대전쟁 참전 용사','Embroidered Scabbard':'수놓은 칼집','Carving':'조각','Brerufa':'브레루파','Phoebe Highfeather':'피비 하이페더','Marrosis':'마로시스','Renalard':'레날라드','Commander Truesong':'사령관 트루송','Hnaz Blunderflame':'흐나즈 블런더플레임','Toron Rockhoof':'토론 락후프','Halea':'할레아','Quintus Wainworth':'퀸투스 웨인워스','WANTED!':'현상수배 게시판','Groundskeeper Lomar':'관리인 로마르','Elaena Moonwhisper':'엘라에나 문위스퍼','Ancient Hilt':'고대의 칼자루','Khan Jehn':'칸 젠','Sebelia':'세벨리아','Personal Survival Pack':'개인 생존 꾸러미','Rhylin Stonethorn':'릴린 스톤손','Fayran Elthas':'파이란 엘타스','Vindael':'빈다엘','Weathered Anchor':'낡은 닻','Bookshelf':'책장','Quolga the Wise':'현자 콜가',"Shalla'kal":'샬라칼',"Kala'th":'칼라스','Suma Mossmane':'수마 모스메인','Elder Pinespeaker':'장로 파인스피커','Thobon Sapclaw':'토본 샙클로',"Sos'mol":'소스몰','Cowardly Peon':'겁쟁이 일꾼','Battered Trunk':'낡은 궤짝','Grembly':'그렘블리','Hekshi':'헥시','Scout Raroul':'정찰병 라룰','Durganon':'두르가논','Mukomonji':'무코몬지','Juo':'주오','Hastings':'헤이스팅스','Brazier of the Dormant Flame':'잠든 불꽃의 화로','Loose Cog':'헐거운 톱니','Cedric Dalton':'세드릭 돌턴','Apprentice Claire':'견습생 클레어','Robbie Holmsby':'로비 홈스비','Dunston Willis':'던스턴 윌리스',"Krol'dok Moulding":'크롤독 조각','Alphonse Dumas':'알퐁스 뒤마','Melanie Sable':'멜라니 세이블','Watcher Fredericks':'감시관 프레드릭스','Sully McCleary':'설리 매클리어리','Felflick':'펠플릭','Venture Co. Ledger':'투자개발회사 장부','Tessa Dawnbright':'테사 던브라이트','Odd Totem':'이상한 토템',"Kal'tinzan":'칼틴잔','Witherbeard':'위더비어드','Abra Cadabra':'아브라 카다브라','Wanted':'현상수배 게시판','Wheatley':'휘틀리','Brother Lowley':'로울리 수사','Lisbael Highfeather':'리스바엘 하이페더','Bone Pile':'뼈 더미','Corrupted Growth':'타락한 덩굴','Velician':'벨리시안','Ghostly Attendant':'유령 시종','Broken Warhammer':'부러진 전투망치','Slain Scarlet Crusader':'쓰러진 붉은십자군','Battle Cache':'전투 보급 상자','Mirt':'미르트','Syndicate Footlocker':'비밀결사단 사물함','Orphan Matron Aria':'고아원장 아리아','Lieutenant Connar':'부관 코나르','Sergeant Danneth':'하사관 다네스','Wizzik Dustfizz':'위직 더스트피즈','Jereman':'제레만','Yashiro':'야시로','Galvinquam Leafsyre':'갈빈쾀 리프사이어','Maerion Thaelemaches':'마에리온 탈레마케스','"Flipfin"':'"지느러미"','Ekkal':'에칼','Dorgaron':'도르가론','Argent Medic':'은빛십자군 의무병','Brelinda McFarry':'브렐린다 맥패리'};
Object.assign(NPC_KO,NPC_KO2);
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
  const G=(X&&X.g&&X.g[2])?X.g:(d.g&&d.g[2]?d.g:null);const R=(X&&X.r&&X.r[2])?X.r:(d.r&&d.r[2]&&!d.r[3]?d.r:null);
  const gz=G&&G[1]||(X&&X.z)||'';
  const add=(kind,zone,xy,name,r)=>{const a=toAtlas(zone,xy);if(!a)return;let rx=0;if(r){const [x,y]=String(xy).split(',').map(Number);const b=toAtlas(zone,(x+r)+','+(y+r));if(b&&b.c===a.c)rx=(Math.abs(b.x-a.x)+Math.abs(b.y-a.y))/2}P.push(Object.assign(a,{kind,nm:name,zone,rx}))};
  if(G)add('g',G[1]||gz,G[2],npcKo(d,'g')||G[0]);
  const QP=X?obPlaces(X).filter(o=>o.r):[];
  if(QP.length)QP.slice(0,3).forEach(o=>add('ob',o.zone,o.xy,o.nm,o.r));
  else if(QD.get(id))for(const t of tasksOf(QD.get(id),d.obj||(X&&X.o)||'')){const m=(t.where||'').match(/([\d.]+),\s*([\d.]+)/);if(m)add('ob',gz,m[1]+','+m[2],t.nm)}
  if(R&&!(G&&R[2]===G[2]&&R[0]===G[0]))add('r',R[1]||gz,R[2],npcKo(d,'r')||R[0]);
  if(!P.length)return mmNoAtlas(id,X,d,G,R,gz);const c0=P[0].c;let Q=P.filter(p=>p.c===c0);
  const MW=Math.min(560,Math.max(180,Math.min(window.innerWidth,720)-130));/* 폰에서는 칸이 좁으니 핀이 칸 밖으로 안 나가게 더 멀리서 보기 */
  const fitZ=L=>{const xs=L.map(p=>p.x),ys=L.map(p=>p.y);const w=Math.max(...xs)-Math.min(...xs),hh=Math.max(...ys)-Math.min(...ys);let z=3;while(z>0&&(w*2**(z-3)>MW||hh*2**(z-3)>170))z--;return {z,ok:w*2**(z-3)<=MW&&hh*2**(z-3)<=170&&z>=1}};
  /* 받는 곳과 반납 곳이 멀리 떨어진 다른 지역이면(예: 다르나서스 → 달의 숲) 한 칸에 다 넣으면 핀이 가장자리로 밀려 잘림 → 받는 지역만 보이고 나머지는 글로 */
  let away=[];{const f=fitZ(Q);if(!f.ok&&Q.length>1){const z0=zn(Q[0].zone);const same=Q.filter(p=>zn(p.zone)===z0);if(same.length&&same.length<Q.length){away=Q.filter(p=>zn(p.zone)!==z0);Q=same}}}
  /* 다른 대륙에 있는 곳도 글로 */P.filter(p=>p.c!==c0).forEach(p=>away.push(p));
  const xs=Q.map(p=>p.x),ys=Q.map(p=>p.y);let z=fitZ(Q).z;const s=2**(z-3),span=256*2**(3-z);
  const cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2;const T=ATL[c0];const [nx,ny]=AMNT[c0][z];
  const tx0=Math.max(0,Math.floor((cx-460/s)/span)),tx1=Math.min(nx-1,Math.floor((cx+460/s)/span)),ty0=Math.max(0,Math.floor((cy-140/s)/span)),ty1=Math.min(ny-1,Math.floor((cy+140/s)/span));
  let t='';for(let x=tx0;x<=tx1;x++)for(let y=ty0;y<=ty1;y++)t+='<img src="https://assets.wowf.io/world/atlas/'+T.n+'/'+z+'/'+x+'_'+y+'.webp" style="left:'+((x*span-cx)*s)+'px;top:'+((y*span-cy)*s)+'px" alt="" loading="lazy" draggable="false" onerror="this.style.visibility=\'hidden\'">';
  const ic={g:QMK.g,r:QMK.r,ob:'⚔️'};
  const pins=Q.filter(p=>p.rx).map(p=>{const R=Math.max(12,p.rx*s);return '<span class="mma" style="left:'+((p.x-cx)*s)+'px;top:'+((p.y-cy)*s)+'px;width:'+2*R+'px;height:'+2*R+'px"></span>'}).join('')+Q.map(p=>'<span class="mmp k-'+p.kind+'" style="left:'+((p.x-cx)*s)+'px;top:'+((p.y-cy)*s)+'px"><i>'+ic[p.kind]+'</i><b>'+esc(p.nm||'')+'</b></span>').join('');
  const zl=gz?'<span class="mmz">'+esc(gz)+(G?' · '+xyTxt(G[2]):'')+'</span>':'';
  const ax=away.length?'<span class="mmx">'+away.map(p=>(p.kind==='r'?QMK.r+' 반납':p.kind==='g'?QMK.g+' 받기':'⚔️')+' <b>'+esc(p.nm||'')+'</b> · '+esc(zn(p.zone||''))+' (다른 지역)').join('<br>')+'</span>':'';
  return '<div class="mm'+(away.length?' hasx':'')+'" data-a="mmgo" data-k="'+id+'" title="눌러서 큰 지도로"><div class="mmc">'+t+pins+'</div>'+zl+ax+'<button class="mmgo" data-a="mmgo" data-k="'+id+'">지도에서 크게 ›</button></div>'}
/* 큰 지도에 없는 지역(제프라스 섬 등): 지도 그림 없이 좌표만으로 받기·할 일 구역·반납을 그림 */
function mmNoAtlas(id,X,d,G,R,gz){const zz=gz||(X&&X.z)||'';if(!zz)return '';const pins=[];const same=z=>zn(z||zz)===zn(zz);
  if(G&&G[2]&&same(G[1])){const p=xyOf(G[2]);if(p)pins.push({x:p[0],y:p[1],k:'sget',t:'!',lab:(npcKo(d,'g')||G[0]||'').slice(0,12)})}
  ((X&&X.t)||[]).filter(t=>t[3]&&same(t[3][0])).forEach(t=>t[3].slice(1,3).forEach(c=>{if(pins.filter(p=>p.k==='sdo').length<3)pins.push({x:c[0],y:c[1],k:'sdo',t:'⚔',lab:(t[1]||'').slice(0,12),rad:c[2]})}));
  if(R&&R[2]&&same(R[1])&&!(G&&R[2]===G[2])){const p=xyOf(R[2]);if(p)pins.push({x:p[0],y:p[1],k:'sturn',t:'?',lab:(npcKo(d,'r')||R[0]||'').slice(0,12)})}
  if(!pins.length)return '';
  return '<div class="mmna">'+gmapHtml(zz,pins,null,0,1,1)+'<p class="note">'+esc(zz)+'은(는) 큰 지도가 없어서 좌표로만 그렸어요. 게임 지도와 같은 좌표예요.</p></div>'}
/* 양피지 모양 퀘스트 상세 */
function chainOf0(id){const d=QD.get(id);if(d&&d.ch&&d.ch.length>1)return d.ch;for(const o of QD.values())if(o.ch&&o.ch.length>1&&o.ch.some(r=>r[6]===id))return o.ch.map(r=>{r=r.slice();r[5]=r[6]===id?1:0;return r});return null}
/* 갈래 이름: A~Z, 그 뒤는 숫자 (해안 표류물처럼 9갈래 넘는 연계가 있음) */
const brL=i=>'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[i]||String(i+1);
/* 연계 정보는 한 곳 기준: Questie 포에버 자료(갈래·보정 포함)가 있으면 그걸, 없을 때만 forg·wowf 연계 표 */
function chainOf(id){const X=QDB&&QDB.get(id);if(X){const b=X._ch;return b?b.map(r=>{r=r.slice();r[5]=r[6]===id?1:0;return r}):(QKIDS[id]?null:(X._root!==id?null:null))}return chainOf0(id)}
/* 퀘스트 번호 → 출처가 그 퀘스트인 장비 (forg 아이템 출처). 퀘스트 자료를 불러온 뒤에 한 번 만듦 */
let _QRI=null,_QRI0=null;function qRwItems(id){if(!_QRI){if(!QDB&&_QRI0)return _QRI0.get(id)||[];const M=new Map();for(const it of IT.values())for(const i of it.src||[]){const s=SRC[i];if(!s||s.k!==1)continue;const q=srcQid(s);if(q){if(!M.has(q))M.set(q,[]);if(!M.get(q).includes(it.id))M.get(q).push(it.id)}}if(!QDB){_QRI0=M;return M.get(id)||[]}_QRI=M}return _QRI.get(id)||[]}
/* 퀘스트 보상 = 보상표(forg/wowf) + 던전 퀘스트 보상 + 출처가 이 퀘스트인 장비(보상표가 한 직업 것만 담긴 경우 등) */
function qRw(id){let R=RWD.get(id)||{};
  if(!(R.ch&&R.ch.length)&&!(R.fx&&R.fx.length)){const dd=dgOfQ(id);const dq=dd&&dd.q.find(x=>x.id===id);if(dq&&dq.rw.length){const its=dq.rw.map(i=>IT.get(i)).filter(Boolean).map(it=>[it.id,it.nm,it.ic,it.q,1]);if(its.length)R=Object.assign({},R,dq.choose&&its.length>1?{ch:its}:{fx:its})}}
  {const have=new Set([...(R.ch||[]),...(R.fx||[])].map(x=>x[0]));const its=qRwItems(id).filter(i=>!have.has(i)).map(i=>IT.get(i)).filter(Boolean).map(it=>[it.id,it.nm,it.ic,it.q,1]);
    if(its.length){R=Object.assign({},R);if(R.ch&&R.ch.length)R.ch=R.ch.concat(its);else if(R.fx&&R.fx.length||its.length<2)R.fx=(R.fx||[]).concat(its);else R.ch=its}}
  return R}
function parch(c,id,base){const d=Object.assign({},QD.get(id)||{});
  /* 양 진영 퀘스트인데 받는·반납 NPC가 호드 도시로 적힌 자료(예: 타베사의 임무 → 언더시티)면 QuestieDB의 얼라이언스 NPC로 */
  {const X=QDB&&QDB.get(id);if(X)for(const k of ['g','r'])if(d[k]&&/^(언더시티|오그리마|썬더 블러프)$/.test(d[k][1]||'')&&X[k]&&X[k][0]&&X[k][1]&&X[k][1]!==d[k][1])d[k]=[X[k][0],X[k][1],X[k][2]||'',X[k][3]||'npc']}
const chx=chainOf(id);if(chx){d.ch=chx;d.cn=chx.length;d.cc=(chx.find(r=>r[5])||[0])[0]}let R=qRw(id);const L=c.lv;
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
  else h+=preBlock(id,base.pre);{const X=QDB&&QDB.get(id);const xl=X&&!mqDone(c,X)?exLine(c,X):'';if(xl)h+='<p class="exn">⚖️ '+esc(xl)+'</p>'}h+='<p class="npc">'+QMK.g+' 받는 곳: <b>'+esc(g?npcKo(d,'g'):(base.gv||'—'))+'</b>'+(g&&g[1]?' · '+esc(placeTxt(g[1],g[2],id)):(base.xy?' ('+esc(base.xy.replace(',',', '))+')':''))+'</p>';
  if(base.extra)h+=base.extra;
  {const TS=tasksOf(d,obj);if(TS.length)h+='<h5>챙길 것 · 할 일</h5><ul class="ptask">'+TS.map(t=>{const drop=(t.drop||'').replace(/ ?그 밖 지역$/,'').trim();const unit=t.type==='처치'?'마리':'개';
    return '<li>'+(T_IC[t.type]||'•')+' <b>'+esc(t.nm)+(t.cnt?' '+t.cnt+unit:'')+'</b> '+(T_KO[t.type]||t.type)+(drop?'<br><span>'+(t.type==='수집'?'떨구는 몹: ':'')+esc(drop)+'</span>':'')+(t.where?'<br><span>많은 곳 '+esc(qWhere(id,t.nm,t.where))+'</span>':(()=>{const J=GJP(id,TS.indexOf(t)+1)||(TS.length===1?GJP(id):null);return J&&J[0]?'<br><span>📍 내가 한 곳 '+esc(J[0][0]+' '+J[0][1]+', '+J[0][2])+' <small>(애드온 기록)</small></span>':''})())+'</li>'}).join('')+'</ul>';if(!TS.length){const J=GJP(id);if(J&&J[0])h+='<p class="npc">📍 내가 목표를 한 곳: <b>'+esc(J[0][0]+' '+J[0][1]+', '+J[0][2])+'</b> <small>(애드온 기록)</small></p>'}}
  if(d.r&&d.r[0]&&!d.r[3])h+='<p class="npc">'+QMK.r+' 반납하는 곳: <b>'+esc(npcKo(d,'r'))+'</b>'+(d.r[1]?' · '+esc(placeTxt(d.r[1],d.r[2],id)):'')+'</p>';
  else if(d.r&&d.r[3])h+='<p class="npc">'+QMK.r+' 반납하는 곳: 받은 NPC에게 다시</p>';
  /* 보상 */
  const tile=(x,best)=>{const it=IT.get(x[0]);const use=it&&usable(it,c);const b=use?bestSlot(it,c):null;
    return '<button class="rt2'+(best?' best':'')+(it&&!use?' no':'')+'" data-a="'+(it?'info':'')+'" data-k="'+x[0]+'"><span class="ic q-'+x[3]+'" style="background-image:url('+ICO(x[2])+')"></span><span class="rn q'+x[3]+'">'+esc(x[1])+(x[4]>1?' ×'+x[4]:'')+'</span>'+(best?'<span class="rb">★ 추천</span>':b&&b.g>.01?'<span class="rb s">좋아짐</span>':it&&!use?'<span class="rb nx">못 씀</span>':'')+'</button>'};
  if(R.ch||R.fx||R.xp||R.money||R.rep){h+='<h5>보상</h5>';
    if(R.ch&&R.ch.length){let bi=-1,bg=.01;R.ch.forEach((x,i)=>{const it=IT.get(x[0]);if(it&&usable(it,c)){const b=bestSlot(it,c);if(b&&b.g>bg){bg=b.g;bi=i}}});
      /* 보상 카드를 누르면 그게 「고를 템」 (다시 누르면 앱 추천으로) · 템 정보는 오른쪽 ⓘ */
      const pk=(c.rwPick||{})[id];const cur=pk&&R.ch.some(x=>x[0]===pk)?pk:(bi>=0?R.ch[bi][0]:0);
      const ptile=(x,best,on)=>{const it=IT.get(x[0]);const use=it&&usable(it,c);const b=use?bestSlot(it,c):null;
        return '<div class="rt2 pk'+(on?' on':'')+(best?' best':'')+(it&&!use?' no':'')+'"><button class="rpb" data-a="rwpick" data-k="'+id+':'+x[0]+'" aria-pressed="'+(on?'true':'false')+'"><span class="ic q-'+x[3]+'" style="background-image:url('+ICO(x[2])+')"></span><span class="rn q'+x[3]+'">'+esc(x[1])+(x[4]>1?' ×'+x[4]:'')+'</span></button>'
          +(it?'<button class="rinf" data-a="info" data-k="'+x[0]+'" aria-label="템 정보">i</button>':'')
          +(on?'<span class="rb pk">📌 고를 템'+(best?' · ★ 추천':'')+'</span>':best?'<span class="rb">★ 추천</span>':b&&b.g>.01?'<span class="rb s">좋아짐</span>':it&&!use?'<span class="rb nx">못 씀</span>':'')+'</div>'};
      h+='<p>아래의 보상 중 한 가지를 선택할 수 있습니다:</p><div class="rgrid">'+R.ch.map((x,i)=>ptile(x,i===bi,x[0]===cur)).join('')+'</div>'
        +'<p class="rpkn">'+(pk?'📌 직접 골랐어요 · 다시 누르면 앱 추천으로':'📌 카드를 누르면 고를 템으로 정해져요'+(cur?' · 지금은 앱 추천':''))+' · 애드온에 「추천 코드」를 넣으면 반납할 때 게임에서 알려 줘요</p>'}
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
    h+=parch(c,id,{nm:X.n,obj:X.o,place:esc(X.z||''),tags:(X.m>c.lv?'<span class="tag">'+mTxt(X)+'</span>':''),done:mqDone(c,X),kind:'mq',ck:String(id),pre:X.pre});
    {const dd=dgOfQ(id);if(dd)h+='<button class="btn full" style="margin-top:8px" data-a="dgo" data-k="'+dd.slug+'">🏰 '+esc(dd.ko)+' 던전 보기</button>'}
    h+=qNoteBox(c,id);
    return h+'<button class="btn ghost full" style="margin-top:8px" data-a="mzgo" data-k="'+esc((X.c||'기타')+'|'+X.z)+'">'+esc(X.z||'')+' 퀘스트 전체 보기</button>'}
  let h='<div class="sh"><h2>['+(q.lv||'?')+'] '+esc(q.nm)+'</h2><button class="x" data-a="close">✕</button></div>';
  const place=f&&f.dg?'🏰 '+esc(f.dg.ko)+' 퀘스트':f?esc(f.z)+' '+(CONT[f.z]?CONT_IC[CONT[f.z]]:''):'';
  const ck=f&&!f.dg?f.z+'|'+q.nm:String(id);const kind=f&&!f.dg?'fq':'dq';const done=f?!!((f.dg?c.dq:c.fq)||{})[ck]:null;
  h+=parch(c,id,{nm:q.nm,obj:q.obj,gv:q.gv,xy:q.xy,place,tags:chainTag(id,q)+(q.min>c.lv?'<span class="tag">'+q.min+'레벨부터</span>':''),done:f?done:null,kind,ck});
  if(f&&!f.dg)h+='<button class="btn ghost full" style="margin-top:8px" data-a="goz" data-k="'+esc(f.z)+'">'+esc(f.z)+' 퀘스트 목록으로</button>';
  if(f&&f.dg)h+='<button class="btn full" style="margin-top:8px" data-a="dgo" data-k="'+f.dg.slug+'">🏰 '+esc(f.dg.ko)+' 던전 보기</button>';
  h+=qNoteBox(c,id);
  return h}
const T_IC={'처치':'⚔️','수집':'📦','사용':'✋','대화':'💬','탐험':'🧭','획득':'📦','호위':'🛡️','상호작용':'✋','전달':'📨','파괴':'💥','조사':'🔍'};
const T_KO={'처치':'잡기','수집':'모으기','사용':'사용하기','대화':'대화하기','탐험':'찾아가기','획득':'얻기','호위':'호위하기','상호작용':'눌러서 조사','전달':'전달하기','파괴':'부수기','조사':'조사하기'};
function chainTag(id,q){const ch=typeof chainOf==='function'?chainOf(id):null;if(ch)return '<span class="tag lk">연계 '+((ch.find(r=>r[6]===id)||[0])[0]||'?')+'/'+ch.length+'단계</span>';const d=QD.get(id);if(d&&d.cn>1)return '<span class="tag lk">연계 '+(d.cc||'?')+'/'+d.cn+'단계</span>';return q.ch?'<span class="tag lk">연계 · 이어서 '+q.ch+'개 더</span>':''}

/* ===================== 화면 상태 ===================== */
const ui={tab:'home',sheet:null,qz:null,qmode:'rec',dg:null,csec:'tal',srch:'',onb:null,isrch:'',ifil:'ok',pf:null};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=s=>document.querySelector(s);
function toastUndo(t,fn){syHold=Date.now()+6000;document.querySelectorAll('.toast.undo').forEach(e=>e.remove());const e=document.createElement('div');e.className='toast undo';e.innerHTML='<span></span><button type="button">되돌리기</button>';e.firstChild.textContent=t;const b=e.querySelector('button');b.onclick=ev=>{ev.stopPropagation();e.remove();syHold=0;fn()};document.body.appendChild(e);setTimeout(()=>e.remove(),6000)}
function toast(t){document.querySelectorAll('.toast:not(.undo)').forEach(e=>e.remove());const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),1600)}

/* ===================== 아이템 계산 ===================== */
const ci=c=>CL.indexOf(c.cls);
/* 무기·방어구 숙련 (얼라이언스 기준). 사슬·판금은 40레벨부터 */
const WPN={warrior:[0,1,2,3,4,5,6,7,8,10,13,15,16,18],paladin:[0,1,4,5,6,7,8],hunter:[0,1,2,3,6,7,8,10,13,15,16,18],/* 포에버: 도적도 한손 도끼 */rogue:[0,2,3,4,7,13,15,16,18],priest:[4,10,15,19],shaman:[0,1,4,5,10,13,15],mage:[7,10,15,19],warlock:[7,10,15,19],druid:[4,5,6,10,13,15]};
const ARMOR={warrior:[3,4],paladin:[3,4],hunter:[2,3],shaman:[2,3],rogue:[2,2],druid:[2,2],priest:[1,1],mage:[1,1],warlock:[1,1]};
const SHIELD=new Set(['warrior','paladin','shaman']);
function profOk(it,cls,lv){const [a,b]=(it.cs||'').split('.').map(Number);
  if(a===2)return b!==20&&WPN[cls].includes(b);
  if(a===4){if(b===6)return SHIELD.has(cls);if(b>=1&&b<=4){if(it.sl==='ba')return true;const m=ARMOR[cls];return b<=(lv>=40?m[1]:m[0])}}
  return true}
function usable(it,c,lv){if(!(it.mask&(1<<ci(c))))return false;if(it.allow&&!it.allow.includes(c.cls))return false;return profOk(it,c.cls,Math.max(lv||c.lv,it.lv))}
function fits(it,slot,c,lv){const S=SLOTS.find(s=>s[0]===slot);if(!S||!S[2].includes(it.sl))return false;
  if(slot==='main'&&it.sl==='2h'&&c&&shieldTank(c))return false;/* 방패 탱커는 한손 무기 + 방패 */
  if(slot==='off'&&c&&shieldTank(c)&&it.cs!=='4.6')return false;
  /* 도적 암살(절단)·잠행(기습·암습)은 단검이 있어야 기술을 써요 */
  if(c&&c.cls==='rogue'&&(slot==='main'&&(c.spec==='assassination'||c.spec==='subtlety')||slot==='off'&&c.spec==='assassination')&&it.cs!=='2.15')return false;
  if(slot==='off'){if(it.sl==='1h'||(it.sl==='oh'&&it.cs!=='4.6'))return DW.has(c.cls)&&DWLV[c.cls]<=Math.max(lv||0,c.lv||1);return true}
  return true}
function slotsFor(it,c){return SLOTS.filter(s=>fits(it,s[0],c)).map(s=>s[0])}
function sc(it,slot,w){if(!it)return 0;let s=0;for(const k in it.st){const v=it.st[k];if(k==='ap'&&it.sl==='ra'&&!(w.dpsRanged>0)&&/^2\.(2|3|18|16)$/.test(it.cs||''))continue;/* 활·총·석궁·투척의 전투력은 원거리 전투력 → 사냥꾼만 */if(k==='dps'){s+=v*dpsW(it,slot,w);continue}s+=v*(w[k]||0)}return s}
/* 착용 장비: 앱 자료 + 게임(애드온·전투정보실)이 읽은 실제 능력치. 무작위 옵션(「산적의 궁수 장화」)·포에버에서 바뀐 템을 맞추려고.
   주 능력치(힘·민첩·체력·지능·정신)는 게임 값을 그대로, 나머지는 게임이 알려 준 것만 덮고 적중·치명타 같은 건 앱 자료 유지 */
const GPRI=['str','agi','sta','int','spi'];
function mergeGameSt(db,g){const r=Object.assign({},db||{});GPRI.forEach(k=>{if(g[k])r[k]=g[k];else delete r[k]});for(const k in g)if(!GPRI.includes(k))r[k]=g[k];return normST(r)}
function varDiff(it,nm,g){if(!it)return false;if(nm&&nm!==it.nm)return true;const m=mergeGameSt(it.st,g);return [...new Set([...Object.keys(m),...Object.keys(it.st||{})])].some(k=>Math.abs((m[k]||0)-((it.st||{})[k]||0))>.5)}
const VARC=new WeakMap();
function eqIt(c,slot){const id=c.eq&&c.eq[slot];if(!id)return null;const it=IT.get(id);const v=c.eqv&&c.eqv[slot];if(!it||!v||v.id!==id)return it||null;
  let r=VARC.get(v);if(!r){r=Object.assign({},it,{nm:v.nm||it.nm,st:mergeGameSt(it.st,v.st||{}),gv:1});VARC.set(v,r)}return r}
/* 이 아이템을 낄 때 가장 이득인 칸과 이득 */
function bestSlot(it,c){const w=wOf(c);let best=null;
  for(const s of slotsFor(it,c)){let base;
    if(s==='main'&&it.sl==='2h')base=sc(eqIt(c,'main'),'main',w)+sc(eqIt(c,'off'),'off',w);
    else if(s==='off'&&eqIt(c,'main')&&eqIt(c,'main').sl==='2h')continue;
    else base=sc(eqIt(c,s),s,w);
    const g=sc(it,s,w)-base;const empty=!eqIt(c,s);
    if(!best||g>best.g)best={s,g,base,empty}}
  return best}
/* 확실히 얻는 곳: 던전 보스(0) · 퀘스트(1) · 상인(5) · 알려진 몹(3). 월드 드랍(2) · 경매장·제작(4) · 어디서 나오는지 모르는 몹 드랍은 「운」 */
const srcSure=s=>!!s&&!(s.k===0&&DG[s.dg]&&DG[s.dg].soon)&&(s.k===0||s.k===1||s.k===5||(s.k===3&&!/미공개/.test(s.label||'')));
/* 아이템 → 그걸 주는 던전 퀘스트 번호 (끝낸 퀘스트 보상은 다시 못 받으니 빼기 위해) */
const IT_Q={};DGS.forEach(d=>d.q.forEach(q=>q.rw.forEach(id=>{(IT_Q[id]=IT_Q[id]||[]).push(q.id)})));
const srcQid=s=>{const m=(s.href||'').match(/(?:quest=|\/quest\/)(\d+)/);if(m)return +m[1];/* 번호가 없으면 이름으로 찾기 */const n=QDB&&s.qn?qByName(s.qn):null;return n&&n.length?n[0]:0};
/* 이 캐릭터가 받을 수 없는 퀘스트: 호드만 받는 퀘스트(QuestieDB 종족 조건) · 직업·종족이 안 맞음 · 짝 퀘스트를 이미 함
   · 포에버 퀘스트 자료(QuestieDB)에 아예 없는 퀘스트(옛 호드 퀘스트·시험용). 시작 자료가 없어 앱 목록에서만 빠진 공용 퀘스트(예: 부분적인 신비한 기록)는 얻을 수 있음으로 둠 */
let _HQ=null;const hordeQ=q=>(_HQ||(_HQ=new Set(typeof D_HQ!=='undefined'?D_HQ:[]))).has(q);
let _QX=null;const nolistQ=q=>(_QX||(_QX=new Set(typeof D_QX!=='undefined'?D_QX:[]))).has(q);
function qGone(c,q){if(!q)return false;if(hordeQ(q))return true;if(!QDB)return false;const X=QDB.get(q);if(!X)return !(dgOfQ(q)||nolistQ(q));return !qdbOk(c,X)||exOut(c,X)}
function srcLeft(it,c){const S=it.src.map(i=>SRC[i]).filter(Boolean);if(!c)return S;const done=id=>!!((c.mq||{})[id]||(c.dq||{})[id]);
  return S.filter(s=>{if(s.k!==1)return true;const q=srcQid(s);if(q)return !done(q)&&!qGone(c,q);if(/^dg:/.test(s.href||'')){const qs=IT_Q[it.id]||[];return !qs.length||qs.some(x=>!done(x))}return true})}
const questDoneOnly=(it,c)=>it.src.length>0&&srcLeft(it,c).length===0;
const inLogQ=(it,c)=>{const ql=c.ql||{};return srcLeft(it,c).some(s=>s.k===1&&(ql[srcQid(s)]||(IT_Q[it.id]||[]).some(x=>ql[x])))};
function srcKind(it,c){const S=c?srcLeft(it,c):it.src.map(i=>SRC[i]).filter(Boolean);if(!S.length)return 'none';if(S.some(srcSure))return 'sure';if(S.some(s=>s.k===0&&DG[s.dg]&&DG[s.dg].soon))return 'soon';if(S.some(s=>s.k===4))return 'ah';if(S.some(s=>s.k===2))return 'world';return 'unknown'}
const luckTag=(it,c)=>{if(c&&ownedOf(c,it.id))return '';if(c&&inLogQ(it,c))return '<span class="lkt log">📜 퀘스트창에 있어요</span>';const k=srcKind(it,c);return k==='sure'?'':'<span class="lkt '+k+'">'+({soon:'🚧 개방 예정 던전',ah:'💰 경매장·제작',world:'🎲 아무 몹에서 (운)',unknown:'❓ 나오는 곳 몰라요',none:'❓ 얻는 곳 정보 없음'})[k]+'</span>'};
function srcOk(it,mode,c){if(c&&questDoneOnly(it,c))return false;if(mode==='all')return true;return srcKind(it,c)==='sure'}
/* Wowhead 포에버 20·30레벨 가이드에 나온 템 */
function guideHas(c,id,L){const G=(typeof D_GUIDE!=='undefined'&&D_GUIDE[c.cls+'/'+c.spec])||null;if(!G)return false;L=L||c.lv;return (L<=27&&(G['20']||[]).includes(id))||(L>=22&&L<=40&&(G['30']||[]).includes(id))}
/* 무기 숙련: 처음부터 아는 것 말고는 무기 전문가에게 배워야 함 (얼라이언스, 10실버) */
const WSK0={rogue:[15,16],priest:[4,19],mage:[10,19],warlock:[15,19],druid:[4,10],paladin:[4,5],shaman:[4,10]};
const WTR={0:'불리위프 스톤헤드 (아이언포지)',1:'불리위프 스톤헤드 (아이언포지)',4:'불리위프 스톤헤드 (아이언포지)',5:'불리위프 스톤헤드 (아이언포지)',3:'불리위프 스톤헤드 (아이언포지)',13:'불리위프 스톤헤드 (아이언포지) · 일예니아 문파이어 (다르나서스)',
  7:'우 핑 (스톰윈드)',8:'우 핑 (스톰윈드)',6:'우 핑 (스톰윈드)',10:'우 핑 (스톰윈드) · 일예니아 문파이어 (다르나서스)',15:'우 핑 (스톰윈드) · 빅시 와블봉크 (아이언포지) · 일예니아 문파이어 (다르나서스)',18:'우 핑 (스톰윈드) · 빅시 와블봉크 (아이언포지)',2:'일예니아 문파이어 (다르나서스)',16:'빅시 와블봉크 (아이언포지)'};
const wskNeed=(it,c)=>{const [a,b]=(it.cs||'').split('.').map(Number);if(a!==2||!WTR[b])return null;
  if(c.wsk){const k=c.wsk[b];if(k)return k[1]&&k[0]<k[1]*.7?{ko:CS_KO[it.cs]||'무기',at:WTR[b],low:k}:null;return {ko:CS_KO[it.cs]||'무기',at:WTR[b]}}
  if(!WSK0[c.cls]||WSK0[c.cls].includes(b))return null;return {ko:CS_KO[it.cs]||'무기',at:WTR[b],guess:1}};
const skTag=(it,c)=>{const n=wskNeed(it,c);if(!n)return '';if(n.low)return ' <span class="lkt sk" title="숙련도 '+n.low[0]+'/'+n.low[1]+'">🎓 '+esc(n.ko)+' 숙련 '+n.low[0]+'/'+n.low[1]+'</span>';return ' <span class="lkt sk" title="'+esc(n.ko)+' 숙련은 '+esc(n.at)+'에게 배워요">🎓 '+esc(n.ko)+' 숙련 필요</span>'};
const guideTag=(it,c)=>guideHas(c,it.id)?' <span class="lkt gd" title="Wowhead WoW Forever 직업 가이드 추천">📘 공략 추천</span>':'';
function cands(c,slot,maxLv,mode){const w=wOf(c);return ITEMS.filter(it=>it.ob<=maxLv&&usable(it,c)&&fits(it,slot,c,maxLv)&&(srcOk(it,mode,c)||ownedOf(c,it.id)||(guideHas(c,it.id,maxLv)&&!questDoneOnly(it,c)))&&it.ph!=='x').map(it=>({it,s:sc(it,slot,w),g:guideHas(c,it.id,maxLv)})).filter(x=>x.s>0).sort((a,b)=>(b.s*(b.g?1.04:1))-(a.s*(a.g?1.04:1)))}
function upgrades(c,L,mode,minLv){const out=[];const w=wOf(c);const ng=new Set(c.nogo||[]);/* 「못 얻어요」로 뺀 템은 건너뛰고 다음 추천 */
  for(const [slot] of SLOTS){if(slot==='ring2'||slot==='trink2')continue;
    const pair=slot==='ring1'?['ring1','ring2']:slot==='trink1'?['trink1','trink2']:[slot];
    const curS=Math.min(...pair.map(p=>sc(eqIt(c,p),p,w)));const tgt=pair.reduce((a,p)=>sc(eqIt(c,p),p,w)<=sc(eqIt(c,a),a,w)?p:a,pair[0]);
    let base=curS;if(slot==='main')base=sc(eqIt(c,'main'),'main',w)+(0);
    if(slot==='off'&&eqIt(c,'main')&&eqIt(c,'main').sl==='2h')continue;
    const have=new Set(pair.map(p=>c.eq[p]).filter(Boolean));
    const list=cands(c,slot,L,mode).filter(x=>!have.has(x.it.id)&&!ng.has(x.it.id)&&(minLv==null||x.it.ob>=minLv)&&!(slot==='off'&&out.some(o=>o.slot==='main'&&o.it.id===x.it.id)));
    for(const x of list.slice(0,1)){let g;
      if(slot==='main'&&x.it.sl==='2h')g=x.s-(sc(eqIt(c,'main'),'main',w)+sc(eqIt(c,'off'),'off',w));else g=x.s-base;
      if(g>.01)out.push({slot:tgt,it:x.it,g,base:slot==='main'&&x.it.sl==='2h'?sc(eqIt(c,'main'),'main',w)+sc(eqIt(c,'off'),'off',w):base,empty:!eqIt(c,tgt)})}}
  /* 양손 무기 추천과 보조 추천이 같이 나오지 않게: 양손 vs (한손+보조) 중 나은 쪽만 */
  const mi=out.findIndex(o=>o.slot==='main'&&o.it.sl==='2h'),oi=out.findIndex(o=>o.slot==='off');
  if(mi>=0&&oi>=0){const m=out[mi],o=out[oi];const two=m.base+m.g;const offS=o.base+o.g;
    const m1=cands(c,'main',L,mode).find(x=>x.it.sl!=='2h'&&x.it.id!==o.it.id&&!ng.has(x.it.id)&&(minLv==null||x.it.ob>=minLv));const curM=eqIt(c,'main');
    const oneS=Math.max(m1?m1.s:0,curM&&curM.sl!=='2h'?sc(curM,'main',w):0);
    if(two>=oneS+offS)out.splice(oi,1);
    else{if(m1&&(!curM||m1.s>sc(curM,'main',w)+.01)){const b0=sc(curM,'main',w);out[mi]={slot:'main',it:m1.it,g:m1.s-b0,base:b0,empty:!curM}}else out.splice(mi,1)}}
  return out.sort((a,b)=>(b.empty-a.empty)||(b.g/Math.max(b.base,4))-(a.g/Math.max(a.base,4)))}
function gainTag(g,base,empty){if(empty)return '<span class="gain new">빈 칸 채우기</span>';if(g<-.5)return '<span class="gain no" style="color:var(--bad)">나빠짐</span>';if(!(g>.01))return '<span class="gain no">변화 없음</span>';const r=g/Math.max(base,4);const n=' <b class="gp">+'+(g>=10?Math.round(g):g.toFixed(1))+'</b>';return r>=.5?'<span class="gain big">크게 좋아짐'+n+'</span>':r>=.2?'<span class="gain mid">좋아짐'+n+'</span>':'<span class="gain sm">조금 좋아짐'+n+'</span>'}
const PCTK={crit:1,hit:1,scrit:1,shit:1,dodge:1,parry:1,blockp:1,exp:1};
function diffHtml(a,b,c){const w=wOf(c);const ks=new Set([...Object.keys(a?a.st:{}),...Object.keys(b?b.st:{})]);const arr=[];
  for(const k of ks){if(!STAT_KO[k])continue;if(k==='armor'&&!(w.armor))continue;if((k==='shit'&&ks.has('hit')&&(w.hit||0)>=(w.shit||0))||(k==='hit'&&ks.has('shit')&&(w.shit||0)>(w.hit||0))||(k==='scrit'&&ks.has('crit')&&(w.crit||0)>=(w.scrit||0))||(k==='crit'&&ks.has('scrit')&&(w.scrit||0)>(w.crit||0)))continue;const d=((a&&a.st[k])||0)-((b&&b.st[k])||0);if(Math.abs(d)<.05)continue;if(k==='dps'){const ra=(a||b).sl==='ra';if(!(ra?w.rdps:w.dps))continue}arr.push([k,d,Math.abs(d*(w[k]||(k==='dps'?(w.dps||w.rdps):0)))+(w[k]?1:0)])}
  arr.sort((x,y)=>y[2]-x[2]);if(!arr.length)return '';
  return '<span class="dif">'+arr.slice(0,4).map(([k,d])=>'<span class="'+(d>0?'p':'n')+'">'+STAT_KO[k]+' '+(d>0?'+':'−')+(k==='dps'||(PCTK[k]&&Math.abs(d)%1)?Math.abs(d).toFixed(1):Math.round(Math.abs(d)))+'</span>').join(' · ')+'</span>'}
function srcTxt(it,n){if(!it.src.length)return '출처 정보 없음';return it.src.slice(0,n||2).map(i=>{const s=SRC[i];if(!s)return '';
  if(s.k===0)return (DG[s.dg]?DG[s.dg].ko:s.dn)+' · '+s.boss;if(s.k===1)return '퀘스트 「'+s.qn+'」';if(s.k===2)return '월드 드랍 (경매장)';if(s.k===3)return /미공개/.test(s.label)?'몹 드랍 (어디서 나오는지 아직 몰라요)':s.label.replace('드랍 · ','')+' 처치';if(s.k===4)return s.label.replace(/ · 경매장 거래$/,'')+' (경매장)';if(s.k===5)return s.label.replace('상인 · ','상인 ');return s.label}).filter(Boolean).join(' / ')}
function srcList(it){if(!it.src.length)return '<p class="note">어디서 나오는지 아직 몰라요.</p>';
  return '<div class="srcl">'+it.src.slice(0,6).map(i=>{const s=SRC[i];if(!s)return '';const d=s.k===0&&DG[s.dg];
    const ico={0:'🏰',1:'📜',2:'🌍',3:'⚔️',4:'🧪',5:'🛒'}[s.k]||'•';const bn=d&&d.bosses?bossNo(d,s.boss):null;
    return '<div class="srci"><span class="si">'+ico+'</span><span class="sx">'+esc(srcTxt({src:[i]},1))+(d?'<small>'+d.lo+'–'+d.hi+'레벨 던전'+(bn?' · '+bn+'번째 보스':'')+'</small>':'')+'</span>'+(d?'<button class="btn sm ghost" data-a="dgo" data-k="'+s.dg+'">던전 ›</button>':s.k===1&&srcQid(s)?(()=>{const qi=srcQid(s);const dd=dgOfQ(qi);return dd?'<button class="btn sm ghost" data-a="dgo" data-k="'+dd.slug+'">던전 ›</button>':'<button class="btn sm ghost" data-a="qopen" data-k="'+qi+'">퀘스트 ›</button>'})():'')+'</div>'}).join('')+'</div>'}
/* ===== 🖱️ PC: 아이템 아이콘에 마우스를 올리면 와우 툴팁처럼 전체 능력치 ===== */
const TIP_BASE=['str','agi','sta','int','spi'];
function itemTipHtml(c,it,slot){const st=it.st||{};const QC={p:'qp',c:'qc',u:'qu',r:'qr',e:'qe',l:'ql'}[it.q]||'qc';
  const eqd=slot&&c.eq&&c.eq[slot]===it.id;const cur=slot&&!eqd?eqIt(c,slot):null;
  let h='<div class="tt-n '+QC+'">'+esc(it.nm)+'</div>'+(eqd?'<div class="tt-eq">지금 끼고 있어요</div>':'');
  h+='<div class="tt-m"><span>'+esc(SL_KO[it.sl]||it.sl||'')+'</span><span>'+esc(CS_KO[it.cs]&&!['4.0',''].includes(it.cs)?CS_KO[it.cs]:'')+'</span></div>';
  if(st.dps)h+='<div class="tt-l">초당 공격력 '+st.dps.toFixed(1)+'</div>';
  if(st.armor)h+='<div class="tt-l">방어도 '+Math.round(st.armor)+'</div>';
  TIP_BASE.forEach(k=>{if(st[k])h+='<div class="tt-l">'+(st[k]>0?'+':'')+Math.round(st[k])+' '+STAT_KO[k]+'</div>'});
  Object.keys(st).filter(k=>!TIP_BASE.includes(k)&&k!=='dps'&&k!=='armor'&&STAT_KO[k]&&!SHDUP(k,st)).forEach(k=>{h+='<div class="tt-g">착용 효과: '+STAT_KO[k].replace(/ %$/,'')+' '+(/%$/.test(STAT_KO[k])?st[k]+'%':'+'+Math.round(st[k]))+'</div>'});
  if(it.eff)h+='<div class="tt-g">착용 효과: 특수 효과 있음 (게임 툴팁 확인)</div>';
  h+='<div class="tt-lv">'+(it.lv>1?'최소 레벨 '+it.lv+(it.est?'?':''):'')+'</div>';
  if(cur){const d=diffHtml(it,cur,c);h+='<div class="tt-cmp"><div class="tt-ch">지금 낀 것과 비교 <small>'+esc(cur.nm)+'</small></div>'+(d||'<span class="dif">달라지는 능력치 없음</span>')+'</div>'}
  else if(slot&&!c.eq?.[slot])h+='<div class="tt-cmp"><div class="tt-ch">이 칸은 비어 있어요</div></div>';
  if(eqd){const b=bestFor(c,slot,c.lv,ui.ifil||'ok')[0];if(b&&b.it&&b.it.id!==it.id)h+='<div class="tt-cmp"><div class="tt-ch">추천으로 바꾸면 <small>'+esc(b.it.nm)+'</small></div>'+(diffHtml(b.it,it,c)||'')+'</div>'}
  h+='<div class="tt-src">얻는 곳: '+esc(srcTxt(it,3))+'</div>';
  return h}
/* 퀘스트 툴팁: 할 일 · 받는 곳/반납 · 경험치 · 보상 · 연계 */
function questTipHtml(c,id){const q=QDB&&QDB.get(id);const d=QD.get(id)||{};if(!q&&!d.g)return '';const nm=q?q.n:(d.nm||'');const L=c.lv;
  let h='<div class="tt-n qe2">'+esc(nm)+'</div><div class="tt-m"><span>'+(q?'권장 '+q.lv+' · '+(q.m||1)+'레벨부터':'')+'</span><span>'+esc(q?q.z:'')+'</span></div>';
  const o=(q&&q.o)||d.obj||'';if(o)h+='<div class="tt-o">'+esc(o.length>140?o.slice(0,139)+'…':o)+'</div>';
  const T=tasksOf(d,(q&&q.o)||d.obj||'').filter(t=>t.nm);if(T.length)h+=T.slice(0,4).map(t=>'<div class="tt-l">· '+esc(t.nm)+(t.cnt?' '+t.cnt+(t.type==='처치'?'마리':'개'):'')+(t.type?' <small>'+esc(T_KO[t.type]||t.type)+'</small>':'')+'</div>').join('');
  if(q&&q.g)h+='<div class="tt-gv"><span class="k">받기</span>'+esc(q.g[0])+' <small>'+esc(q.g[1]||'')+'</small></div>';
  if(q&&q.r)h+='<div class="tt-gv"><span class="k r">반납</span>'+esc(q.r[0])+' <small>'+esc(q.r[1]||'')+'</small></div>';
  const rw=RWD.get(id)||{};if(rw.xp){const x=qxpAt(q||{id,lv:L},L);h+='<div class="tt-xp">경험치 '+x.toLocaleString()+(xpPct(x,L)?' <small>(레벨의 '+xpPct(x,L)+'%)</small>':'')+'</div>'}
  if(rw.ch&&rw.ch.length)h+='<div class="tt-ch">보상 하나 고르기</div>'+rw.ch.slice(0,5).map(r=>'<div class="tt-rw q'+(r[3]||'c')+'">'+esc(r[1])+'</div>').join('');
  const ch=typeof chainOf==='function'?chainOf(id):null;if(ch&&ch.length>1){const i=ch.findIndex(r=>r[6]===id);h+='<div class="tt-src">연계 퀘스트 '+(i+1)+'/'+ch.length+'단계</div>'}
  return h}
(()=>{if(!(window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches))return;let tip=null,cur=null;
  const hide=()=>{if(tip)tip.style.display='none';cur=null};
  document.addEventListener('mouseover',e=>{const el=e.target.closest&&(e.target.closest('[data-tip]')||e.target.closest('[data-a=qopen],[data-qtip]'));if(!el){if(cur)hide();return}if(el===cur)return;const c=me();if(!c){hide();return}
    let html='';if(el.dataset.tip){const it=IT.get(+el.dataset.tip);if(!it){hide();return}const slot=el.dataset.ts||((el.closest('[data-k*=":"]')||{dataset:{}}).dataset.k||'').split(':')[0]||'';html=itemTipHtml(c,it,SLOT_KO[slot]?slot:'')}
    else{html=questTipHtml(c,+(el.dataset.qtip||el.dataset.k));if(!html){hide();return}}
    cur=el;if(!tip){tip=document.createElement('div');tip.className='ttip';document.body.appendChild(tip)}
    tip.innerHTML=html;tip.style.display='block';
    const r=el.getBoundingClientRect(),tw=tip.offsetWidth,th=tip.offsetHeight;let x=r.right+10,y=r.top;if(x+tw>innerWidth-8)x=r.left-tw-10;if(x<8)x=8;if(y+th>innerHeight-8)y=innerHeight-th-8;if(y<8)y=8;tip.style.left=x+'px';tip.style.top=y+'px'});
  document.addEventListener('scroll',hide,true);document.addEventListener('click',hide,true)})();
function itIcon(it,cls){return it&&(it.ic||it.icUrl)?'<span class="ic '+(cls||'')+' q-'+it.q+'" data-tip="'+it.id+'" style="background-image:url('+(it.icUrl||ICO(it.ic))+')"></span>':'<span class="ic empty '+(cls||'')+'">–</span>'}
function itName(it){return '<span class="q'+it.q+'">'+esc(it.nm)+'</span>'}
function itMeta(it){return esc([(SL_KO[it.sl]||it.sl),(CS_KO[it.cs]&&!['4.0',''].includes(it.cs)?CS_KO[it.cs]:''),(it.lv<=1&&it.ob>1?'착용 레벨 제한 없음 · '+it.ob+'레벨쯤 얻음':(it.lv>0?'Lv '+it.lv+(it.est?'?':''):''))].filter(Boolean).join(' · '))+(it.ph==='extra'?' <span class="tag sm" title="클래식 자료로 더한 장비라 능력치가 조금 다를 수 있어요">능력치 대략</span>':'')}

function bossNo(d,boss){const i=d.bosses.findIndex(b=>b.nm===boss);return i>=0?i+1:null}
function findZoneQuest(name){for(const k of [RACE_START[(me()||{}).race]||'dwarf-gnome',...Object.keys(ROUTE)])for(const S of ROUTE[k]||[])for(const q of S.q)if(q.nm===name)return {q,S};return null}
function findDgQuestByReward(id){for(const d of DGS)for(const q of d.q)if(q.rw.includes(id))return {d,q};return null}
function infoBtn(it){return '<button class="ib" data-a="info" data-k="'+it.id+'" aria-label="어디서 얻는지 보기">ⓘ</button>'}
const isWish=(c,id)=>((c&&c.wish)||[]).includes(id);
const wishMark=(c,id)=>isWish(c,id)?'<span class="wsh">⭐</span>':'';
/* 장비 하나에 대한 버튼 묶음: ⚖ 비교 · ⭐ 찜 · ⓘ */
function itActs(c,id){const on=(c.cmp||[]).includes(id),w=isWish(c,id);return '<div class="cmpa"><button class="btn sm '+(w?'':'ghost')+'" data-a="wish" data-k="'+id+'">'+(w?'⭐ 찜함':'☆ 찜하기')+'</button><button class="btn sm ghost" data-a="cmpadd" data-k="'+id+'">'+(on?'⚖ 비교에서 빼기':'⚖ 비교에 담기')+'</button><button class="btn sm ghost" data-a="info" data-k="'+id+'">ⓘ 얻는 곳</button></div>'}
/* ===== 장비 비교: 최대 3개 나란히 (지금 착용 장비와도) ===== */
function cmpSlot(it,c){const b=bestSlot(it,c);if(b)return b.s;const S=SLOTS.find(x=>x[2].includes(it.sl));return S?S[0]:null}
function cmpW(c){const C=D_CLS[c.cls];const csp=(ui.cmpsp&&C.specs.some(x=>x.id===ui.cmpsp))?ui.cmpsp:c.spec;return {csp,w:wOf(Object.assign({},c,{spec:csp}))}}
function cmpBasis(c,csp){const C=D_CLS[c.cls];const role=ROLE[c.cls+'/'+csp]||'';const src=WSRC[c.cls+'/'+csp]||'';
  return '<div class="cmpb2"><span class="k">점수 기준</span><div class="cmpsp">'+C.specs.map(x=>{const r=ROLE[c.cls+'/'+x.id]||'';return '<button class="'+(x.id===csp?'on':'')+'" data-a="cmpsp" data-k="'+x.id+'">'+(RLEMO[r]||'')+esc(x.name)+'</button>'}).join('')+'</div>'
   +'<p class="mute cmpsrc">'+(/시뮬레이터/.test(src)?'⚔️ 딜러: <b>wowsims 포에버 시뮬레이터</b> 능력치 가치':role==='치유'?'💚 힐러: <b>치유량·지능·정신력·5초당 마나</b> 위주':role==='탱커'?'🛡️ 탱커: 방어도·체력·방어 위주':'forg 기본표')+(csp!==c.spec?' · <span class="warn">내 전문화가 아닌 기준</span>':'')+'</p></div>'}
/* 비교 표: 결론(🏆) → 점수 막대 → 능력치 줄 */
function cmpTable(c,cols,w,opt){opt=opt||{};const L=c.lv;
  const S=x=>{const sl=x.slot||cmpSlot(x.it,c);return sl?sc(x.it,sl,w):0};cols.forEach(x=>x.s=S(x));
  const eq=cols.find(x=>x.eq);const best=cols.slice().sort((a,b)=>b.s-a.s)[0];const mx=Math.max(1,...cols.map(x=>x.s));
  const ks=[...new Set(cols.flatMap(x=>Object.keys(x.it.st)))].filter(k=>STAT_KO[k]&&!cols.every(x=>SHDUP(k,x.it.st))).sort((a,b)=>(w[b]||0)-(w[a]||0));
  /* 결론 한 줄 */
  let verdict='';
  if(cols.length>1){const other=eq&&eq!==best?eq:cols.filter(x=>x!==best).sort((a,b)=>b.s-a.s)[0];const d=best.s-other.s;
    const why=ks.map(k=>[k,(best.it.st[k]||0)-(other.it.st[k]||0)]).filter(([k,v])=>v>0&&(w[k]||0)>0).sort((a,b)=>b[1]*(w[b[0]]||0)-a[1]*(w[a[0]]||0)).slice(0,2).map(([k,v])=>STAT_KO[k]+' +'+(k==='dps'?v.toFixed(1):Math.round(v)));
    verdict=d<.5?'<div class="cvd eq">🤝 거의 같아요 · 점수 차이 '+d.toFixed(1)+'</div>':'<div class="cvd">🏆 <b>'+esc(best.it.nm)+'</b>'+(best.eq?' (지금 착용)':'')+'이 '+(other.eq?'착용 장비':esc(other.it.nm))+'보다 <b class="good">+'+d.toFixed(1)+'점</b>'+(why.length?'<small>'+why.join(' · ')+' 덕분</small>':'')+'</div>'}
  const whyOf=x=>{const o=eq&&eq!==x?eq:null;if(!o&&eq)return '';return ks.map(k=>[k,(x.it.st[k]||0)-(o?o.it.st[k]||0:0)]).filter(([k,v])=>v>0&&(w[k]||0)>0).sort((a,b)=>b[1]*(w[b[0]]||0)-a[1]*(w[a[0]]||0)).slice(0,2).map(([k,v])=>STAT_KO[k]+' +'+(k==='dps'?v.toFixed(1):Math.round(v))).join(' · ')};
  const OPEN=ui.cmpopen;
  let h=verdict+'<div class="cbars">'+cols.map((x,ci)=>'<div class="cbar'+(x===best&&cols.length>1?' best':'')+(x.eq?' eqd':'')+(OPEN===x.it.id?' open':'')+'" data-a="cmpopen" data-k="'+x.it.id+'" role="button" aria-expanded="'+(OPEN===x.it.id)+'"><span class="cn"><span class="cno">'+(ci+1)+'</span>'+itIcon(x.it)+'<span class="ct"><b>'+itName(x.it)+'</b><small>'+(x.eq?'지금 착용':x.it.ob>c.lv?'🔒 '+x.it.ob+'레벨':(whyOf(x)||esc(SL_KO[x.it.sl]||'')))+'</small></span></span><span class="cg"><i style="width:'+Math.max(3,Math.round(x.s/mx*100))+'%"></i></span><span class="cv">'+x.s.toFixed(1)+(eq&&!x.eq?'<small class="'+(x.s-eq.s>=0?'p':'n')+'">'+(x.s-eq.s>=0?'+'+(x.s-eq.s).toFixed(1):'−'+(eq.s-x.s).toFixed(1))+'</small>':'')+'</span>'+(opt.del&&!x.eq?'<button class="cx" data-a="cmpdel" data-k="'+x.it.id+'" aria-label="비교에서 빼기">✕</button>':'<span class="cvv">'+(OPEN===x.it.id?'⌃':'⌄')+'</span>')+'</div>'+(OPEN===x.it.id?cmpDetail(c,x):'')).join('')+'</div><p class="cmph">줄을 누르면 얻는 곳·능력치가 바로 아래 펼쳐져요</p>';
  h+='<div class="cmpt" style="--n:'+cols.length+'"><div class="cr ch"><span>능력치</span>'+cols.map((x,ci)=>'<span class="cc"><i class="cno">'+(ci+1)+'</i>'+itIcon(x.it,'sm')+(x.eq?'<em class="tag gd">착용</em>':'')+'</span>').join('')+'</div>'
   +ks.map(k=>{const vs=cols.map(x=>x.it.st[k]||0);const m=Math.max(...vs);const imp=(w[k]||0)>0;return '<div class="cr'+(imp?'':' lo')+'"><span>'+STAT_KO[k]+'</span>'+vs.map(v=>'<span class="'+(v&&v===m&&cols.length>1&&vs.filter(y=>y===m).length<cols.length?'bst':'')+'">'+(v?(k==='dps'?v.toFixed(1):Math.round(v)):'–')+'</span>').join('')+'</div>'}).join('')
   +'<div class="cr"><span>종류</span>'+cols.map(x=>'<span class="sm">'+itMeta(x.it)+'</span>').join('')+'</div>'
   +'<div class="cr"><span>얻는 레벨</span>'+cols.map(x=>'<span class="'+(x.it.ob>L?'n':'')+'">'+(x.it.ob||x.it.lv)+(x.it.ob>L?' 🔒':'')+'</span>').join('')+'</div>'
   +'<div class="cr"><span></span>'+cols.map(x=>{const sl=x.slot||cmpSlot(x.it,c);return '<span>'+(x.eq?'':sl&&usable(x.it,c)?'<button class="btn sm" data-a="equip" data-k="'+sl+'" data-id="'+x.it.id+'">착용</button>':'<small class="n">못 씀</small>')+'</span>'}).join('')+'</div></div>';
  return h}
/* 비교 줄을 누르면 바로 아래: 능력치 전체 · 끼면 바뀌는 것 · 얻는 곳 · 버튼 */
function cmpDetail(c,x){const it=x.it;const sl=x.slot||cmpSlot(it,c);
  return '<div class="cdet"><div class="cdm">'+itMeta(it)+' · '+(it.ob>c.lv?'🔒 '+it.ob+'레벨부터':'지금 낄 수 있어요')+'</div>'+statLine(it)
   +(!x.eq&&sl&&usable(it,c)?statChange(c,sl,it):'')
   +'<div class="cdsrc">'+srcParts(c,it)+'</div>'
   +'<div class="cdb">'+(!x.eq&&sl&&usable(it,c)?'<button class="btn sm" data-a="equip" data-k="'+sl+'" data-id="'+it.id+'">착용</button>':'')+'<button class="btn sm ghost" data-a="wish" data-k="'+it.id+'">'+(isWish(c,it.id)?'⭐ 찜함':'☆ 찜하기')+'</button><button class="btn sm ghost" data-a="info" data-k="'+it.id+'">ⓘ 템 정보</button></div></div>'}
function wishView(c){const ids=(c.wish||[]).filter(id=>IT.get(id));const L=c.lv;
  let h='<div class="card wishc"><h3>⭐ 찜한 장비 <small class="mute">'+ids.length+'</small></h3>';
  if(!ids.length)return h+'<p class="note">장비를 누르면 나오는 창에서 <b>☆ 찜하기</b>를 누르면 여기 모여요. 던전 템 목록에도 ⭐로 표시돼요.</p></div>';
  const rows=ids.map(id=>{const it=IT.get(id);const b=usable(it,c)?bestSlot(it,c):null;return {it,b}}).sort((a,b)=>(a.it.ob||a.it.lv)-(b.it.ob||b.it.lv));
  h+=rows.map(({it,b})=>{const lock=(it.ob||it.lv)>L;const eqd=b&&eqIt(c,b.s)&&eqIt(c,b.s).id===it.id;return '<div class="row tap wrow" data-a="'+(b?'cmpq':'info')+'" data-k="'+(b?b.s+':'+it.id:it.id)+'">'+itIcon(it)+'<span class="m"><span class="nm">'+itName(it)+(eqd?' <span class="tag gd">착용 중</span>':'')+'</span><span class="sub">'+esc(SL_KO[it.sl]||'')+' · '+(lock?'🔒 '+(it.ob||it.lv)+'레벨부터':'지금 낄 수 있어요')+'</span><span class="sub">'+esc(srcTxt(it,1))+'</span></span><span class="r">'+(b&&!eqd?gainTag(b.g,b.base,b.empty):'')+'<button class="ib" data-a="wish" data-k="'+it.id+'" aria-label="찜 빼기">✕</button></span></div>'}).join('');
  return h+'</div>'}
function cmpView(c){const {csp,w}=cmpW(c);const ids=(c.cmp||[]).filter(id=>IT.get(id));const L=c.lv;
  let h=wishView(c)+'<div class="card cmpc"><h3>⚖️ 장비 비교</h3>'+cmpBasis(c,csp);
  /* 칸 골라 후보 3개 자동으로 담기 */
  /* 칸을 한 번 누르면 「지금 장비 + 추천 3개」 바로 비교 (드롭다운 없이) */
  const SL=SLOT_ORDER().filter(s=>!offLocked(c,s));
  h+='<div class="cslh">칸을 누르면 <b>지금 장비와 추천 3개</b>를 바로 비교해요</div><div class="csl">'+SL.map(s=>{const it=eqIt(c,s);const b=bestFor(c,s,L,ui.ifil)[0];const own=c.bag&&bagAll(c).some(x=>x.ok&&x.slot===s&&x.g>.5);
    return '<button class="'+(ui.cmpslot===s&&ids.length?'on':'')+'" data-a="cmpslot" data-k="'+s+'" title="'+SLOT_KO[s]+'">'+(it?'<span class="ic q-'+it.q+'" style="background-image:url('+(it.icUrl||ICO(it.ic))+')"></span>':'<span class="ic empty">'+SLOT_KO[s].replace(/ \d/,'').slice(0,2)+'</span>')+'<small>'+SLOT_KO[s]+'</small>'+(b?'<em>+'+(b.g>=10?Math.round(b.g):b.g.toFixed(1))+'</em>':'')+(own?'<i>🎒</i>':'')+'</button>'}).join('')+'</div>'
   +'<input class="inp csr" placeholder="🔍 이름으로 찾아서 담기" value="'+esc(ui.csrch||'')+'" data-c="csrch"><div id="csres">'+cmpSearch(c)+'</div>';
  if(!ids.length)return h+'<p class="note">숫자(+12) = 그 칸에서 가장 좋은 추천이 얼마나 좋아지는지 · 🎒 = 내 가방·은행에 더 좋은 템이 있어요</p></div>';
  const its=ids.map(id=>IT.get(id));const slot=cmpSlot(its[0],c);const same=its.every(it=>cmpSlot(it,c)===slot);
  const cur=same&&slot?eqIt(c,slot):null;const cols=(cur&&!ids.includes(cur.id)?[{it:cur,eq:1,slot}]:[]).concat(its.map(it=>({it,slot:same?slot:null})));
  h+=cmpTable(c,cols,w,{del:1});
  h+='<p class="note">초록 = 가장 높음 · 흐린 줄은 내게 안 중요한 능력치 · 🔒 = 아직 레벨이 모자라요'+(same?'':' · 서로 다른 부위라 착용 장비는 빼고 견줘요')+'</p><button class="btn ghost sm" data-a="cmpclr">비교 비우기</button></div>';
  return h}
/* 추천 장비를 누르면 바로 「지금 착용 vs 이 장비」 */
function cmpSheet(c,slot,id){const it=IT.get(+id);if(!it)return '';const {csp,w}=cmpW(c);const cur=eqIt(c,slot);
  let h='<div class="sh"><h2>⚖️ '+SLOT_KO[slot]+' 비교</h2><button class="x" data-a="close">✕</button></div>'+cmpBasis(c,csp);
  const cols=(cur?[{it:cur,eq:1,slot}]:[]).concat([{it,slot}]);
  h+=cmpTable(c,cols,w);
  if(!cur)h+='<p class="note">지금 이 칸이 비어 있어요. 끼기만 해도 좋아져요.</p>';
  h+='<p class="note">끼면 내 능력치가 이렇게 바뀌어요</p>'+statChange(c,slot,it);
  h+=itActs(c,it.id);
  return h}
/* ===== 👥 친구 장비 (전투정보실) ===== */
function frList(c){return Object.keys(ARM).filter(k=>k!==c.arm&&ARM[k]&&ARM[k].gear&&CL.includes(ARM[k].cls))}
/* 전문화는 전투정보실에 없어서 장비 능력치로 짐작 (바꿀 수 있음) */
function frGuess(A){const C=D_CLS[A.cls];const t={};Object.values(A.gear).forEach(g=>{const it=armItem(g);for(const k in it.st)t[k]=(t[k]||0)+it.st[k]});
  const role=(t.heal||0)>=8?'치유':((t.def||0)+(t.dodge||0)+(t.parry||0)+(t.block||0))>=6?'탱커':((t.int||0)+(t.sp||0)+(t.shadow||0)+(t.fire||0)+(t.frost||0)+(t.arcane||0)+(t.nature||0))>((t.str||0)+(t.agi||0)+(t.ap||0))?'원거리 딜':'근접 딜';
  const S=C.specs.find(x=>ROLE[A.cls+'/'+x.id]===role)||C.specs.find(x=>/딜/.test(role)&&/딜/.test(ROLE[A.cls+'/'+x.id]||''))||C.specs[0];return S.id}
function frChar(k){const A=ARM[k];ui.frsp=ui.frsp||{};const spec=ui.frsp[k]||frGuess(A);const eq={},eqv={};Object.values(A.gear).forEach(g=>{const s=ARM_SLOT[g.slot];if(s){const base=IT.get(g.id);armItem(g);eq[s]=g.id;if(base){const gs=armSt(g);if(varDiff(base,g.nm,gs))eqv[s]={id:g.id,nm:g.nm,st:gs}}}});
  return {cls:A.cls,spec,lv:A.level||1,race:A.race,eq,eqv,gmode:'heal',name:A.name,key:k}}
function eqScore(c){const w=wOf(c);return SLOTS.reduce((a,[sl])=>a+(offLocked(c,sl)?0:sc(eqIt(c,sl),sl,w)),0)}
function frScore(fc){const w=wOf(fc);return Object.entries(fc.eq).reduce((a,[s,id])=>a+sc(IT.get(id),s,w),0)}
function frView(c){const ks=frList(c);if(!ARM_OK)return '<p class="note">전투정보실 자료를 불러오는 중…</p>';
  if(!ks.length)return '<div class="card"><p class="note">전투정보실에 등록된 친구가 없어요. data/armory/chars.txt에 이름을 넣으면 20분마다 불러와요.</p></div>';
  ui.fropen=ui.fropen||{};const mw=wOf(c);
  let h='<div class="card frme">'+clsIcon(c.cls)+'<span class="m"><b>나 ('+esc(c.name||CINFO[c.cls][0])+')</b><span>'+c.lv+' · '+esc((specOf(c)||{}).name||'')+' '+esc(CINFO[c.cls][0])+'</span></span><span class="frs"><b>'+Math.round(eqScore(c))+'</b><small>장비 점수</small></span></div>';
  h+='<p class="note">전투정보실에 있는 친구 '+ks.length+'명 · 점수는 각자 직업·전문화 기준이라 같은 직업·전문화끼리 견줘야 정확해요 · 전투정보실은 로그아웃할 때 바뀌어요</p>';
  h+=ks.map(k=>{const A=ARM[k];const fc=frChar(k);const C=D_CLS[fc.cls];const sp=C.specs.find(x=>x.id===fc.spec);const role=ROLE[fc.cls+'/'+fc.spec]||'';
    const U=upgrades(fc,fc.lv,'ok');const tot=frScore(fc);const op=!!ui.fropen[k];
    /* 내가 끼면 좋은 친구 템 */
    const mine=Object.entries(fc.eq).map(([s,id])=>{const it=IT.get(id);if(!it||!usable(it,c))return null;const b=bestSlot(it,c);return b&&b.g>.5?{it,b}:null}).filter(Boolean).sort((a,b)=>b.b.g-a.b.g);
    let r='<div class="card frc'+(op?' open':'')+'"><button class="frh" data-a="fro" data-k="'+esc(k)+'">'+clsIcon(fc.cls)+'<span class="m"><b style="color:'+CINFO[fc.cls][1]+'">'+esc(A.name||k)+'</b><span>'+fc.lv+' · '+esc(sp?sp.name:'')+' '+esc(CINFO[fc.cls][0])+' '+(RLEMO[role]||'')+(A.checked?' · '+armAgo(A.checked):'')+'</span></span>'
      +'<span class="frs"><b>'+Math.round(tot)+'</b><small>장비 점수</small></span>'+(U.length?'<span class="tbg" title="바꾸면 좋은 칸">'+U.length+'</span>':'<span class="tok">✓</span>')+'<span class="cv">'+(op?'⌃':'⌄')+'</span></button>';
    if(op){r+='<div class="cmpsp frsp">'+C.specs.map(x=>'<button class="'+(x.id===fc.spec?'on':'')+'" data-a="frsp" data-k="'+esc(k)+'|'+x.id+'">'+(RLEMO[ROLE[fc.cls+'/'+x.id]]||'')+esc(x.name)+'</button>').join('')+'</div>';
      r+='<h4>⬆️ '+esc(A.name)+'님이 바꾸면 좋은 칸 '+(U.length?U.length+'개':'')+'</h4>'+(U.length?U.slice(0,ui.frmore===k?20:4).map(x=>{const cur=eqIt(fc,x.slot);return '<div class="frr"><span class="sl">'+SLOT_KO[x.slot]+'</span><span class="m"><span class="fo">'+(cur?esc(cur.nm):'비어 있음')+' →</span><b>'+itName(x.it)+'</b><small>'+esc(srcTxt(x.it,1))+'</small></span>'+gainTag(x.g,x.base,!cur)+'</div>'}).join('')+(U.length>4&&ui.frmore!==k?'<button class="btn ghost sm" data-a="frmore" data-k="'+esc(k)+'">'+(U.length-4)+'개 더</button>':''):'<p class="note">지금 레벨에서 바꿀 게 없어요 👍</p>');
      r+='<h4>🎁 내가 끼면 좋은 '+esc(A.name)+'님 템</h4>'+(mine.length?mine.slice(0,3).map(x=>'<div class="frr tap" data-a="cmpq" data-k="'+x.b.s+':'+x.it.id+'"><span class="sl">'+SLOT_KO[x.b.s]+'</span><span class="m"><b>'+itName(x.it)+'</b><small>나한테 '+(eqIt(c,x.b.s)?esc(eqIt(c,x.b.s).nm)+'보다':'빈 칸에')+'</small></span>'+gainTag(x.b.g,x.b.base,x.b.empty)+'</div>').join(''):'<p class="note">'+esc(A.name)+'님 템 중 나한테 더 좋은 건 없어요.</p>');
      r+='<div class="cmpa"><button class="btn sm" data-a="frcopy" data-k="'+esc(k)+'">📋 추천 목록 복사</button></div>'}
    return r+'</div>'}).join('');
  return h}
function frText(k){const A=ARM[k];const fc=frChar(k);const U=upgrades(fc,fc.lv,'ok').slice(0,6);const sp=D_CLS[fc.cls].specs.find(x=>x.id===fc.spec);
  return '['+A.name+' '+fc.lv+' '+(sp?sp.name:'')+' '+CINFO[fc.cls][0]+'] 바꾸면 좋은 장비\n'+(U.length?U.map(x=>'· '+SLOT_KO[x.slot]+': '+x.it.nm+' (+'+(x.g>=10?Math.round(x.g):x.g.toFixed(1))+'점) — '+srcTxt(x.it,1)).join('\n'):'· 지금은 없어요')+'\n— 와포 도우미'}
function cmpSearch(c){const q=(ui.csrch||'').replace(/\s+/g,'');if(q.length<1)return '';const L=ITEMS.filter(it=>it.nm.replace(/\s+/g,'').includes(q)).sort((a,b)=>(usable(b,c)?1:0)-(usable(a,c)?1:0)||b.lv-a.lv).slice(0,8);
  return L.length?'<div class="csl">'+L.map(it=>'<div class="row">'+itIcon(it)+'<span class="m"><span class="nm">'+itName(it)+'</span><span class="sub">'+itMeta(it)+(usable(it,c)?'':' · <span style="color:var(--bad)">못 씀</span>')+'</span></span><button class="btn sm'+(((c.cmp||[]).includes(it.id))?' ghost':'')+'" data-a="cmpadd" data-k="'+it.id+'">'+(((c.cmp||[]).includes(it.id))?'담음':'담기')+'</button></div>').join('')+'</div>':'<p class="note">찾는 장비가 없어요.</p>'}
/* ===== 세트 장비 (wowf.io 툴팁의 세트 정보) ===== */
let _SETS=null;function setsIdx(){if(_SETS)return _SETS;const byNm={};ITEMS.forEach(it=>{(byNm[it.nm]=byNm[it.nm]||[]).push(it)});const S=[];const of={};
  (typeof D_SETS!=='undefined'?D_SETS:[]).forEach(([n,parts,bon])=>{const ps=parts.map(pn=>{const a=byNm[pn]||[];return a.sort((x,y)=>y.lv-x.lv)[0]||null});if(!ps.some(Boolean))return;const o={n,parts,ps,bon};S.push(o);ps.forEach(it=>{if(it)of[it.id]=o})});
  _SETS={S,of};return _SETS}
const setOf=id=>setsIdx().of[id]||null;
const ownSet=(c,it)=>!!it&&(Object.values(c.eq||{}).includes(it.id)||!!ownedOf(c,it.id));
function setHtml(c,o,full){const have=o.ps.filter(it=>ownSet(c,it)).length;const N=o.parts.length;
  let h='<div class="setc"><div class="seth"><b>🧩 '+esc(o.n)+'</b><em>'+have+'/'+N+'</em></div><div class="setp">'+o.parts.map((pn,i)=>{const it=o.ps[i];const own=ownSet(c,it);return it?'<button class="setpi'+(own?' own':'')+'" data-a="info" data-k="'+it.id+'">'+(own?'✓ ':'')+esc(pn)+'</button>':'<span class="setpi">'+esc(pn)+'</span>'}).join('')+'</div>';
  if(full||have)h+='<div class="setb">'+o.bon.map(([n,t])=>'<p class="'+(have>=n?'on':'')+'"><b>('+n+')</b> '+esc(t)+'</p>').join('')+'</div>';
  return h+'</div>'}
function setCard(c){const {S}=setsIdx();const mine=S.filter(o=>o.ps.some(it=>ownSet(c,it)));if(!mine.length)return '';
  return '<div class="card"><h3>🧩 세트 장비 <small class="mute">'+mine.length+'세트 모으는 중</small></h3>'+mine.map(o=>setHtml(c,o)).join('')+'</div>'}
/* 「어디서 얻나요」 칸 (템 정보 창·비교 펼치기에서 같이 씀) */
function srcParts(c,it){let h='';
  const parts=[];const seen=new Set();
  const dq=findDgQuestByReward(it.id);
  if(dq){seen.add('dq');const q=dq.q,d=dq.d;parts.push('<div class="src"><b>📜 던전 퀘스트 보상</b><div class="nm">「'+esc(q.nm)+'」 <span class="lvb '+lvCls(q.lv,c.lv)+'">'+q.lv+'</span></div><div class="obj">'+esc(q.obj)+'</div><div class="sub">'+esc(startTxt(q.start))+' · '+q.min+'레벨부터'+(q.pre?' · 앞 퀘스트 먼저':'')+'</div><div class="sub">던전: '+esc(d.ko)+' ('+esc(d.loc)+' · 권장 '+d.lo+'–'+d.hi+')'+(q.boss.length?' · 목표: '+q.boss.map(x=>esc(x.replace(/^(\d+) /,'$1번 '))).join(', '):'')+'</div>'+(()=>{const t0=((QD.get(q.id)||{}).t||[]).find(t=>t&&t[2]);const w=qWhere(q.id,t0?t0[1]:'',t0?t0[2]:'');return w?'<div class="sub">📍 할 일 위치: '+esc(w)+'</div>':''})()+(q.choose&&q.rw.length>1?'<div class="sub">보상 '+q.rw.length+'개 중 하나를 골라요</div>':'')+'<div class="bkb"><button class="btn sm" data-a="qopen" data-k="'+q.id+'">퀘스트·위치 보기</button><button class="btn sm ghost" data-a="dgo" data-k="'+d.slug+'">던전 보기</button></div></div>')}
  for(const i of it.src){const s=SRC[i];if(!s)continue;
    if(s.k===0){const d=DG[s.dg];const n=d?bossNo(d,s.boss):null;parts.push('<div class="src"><b>🏰 던전 보스 드랍</b><div class="nm">'+esc(d?d.ko:s.dn)+(n?' · '+n+'번째 보스':'')+' 「'+esc(s.boss)+'」</div>'+(d?'<div class="sub">'+esc(d.loc)+' · 권장 레벨 '+d.lo+'–'+d.hi+(d.bosses.length?' · 보스 '+d.bosses.length+'마리'+(n?' 중 '+n+'번째':''):'')+'</div><button class="btn sm" data-a="dgo" data-k="'+d.slug+'">던전 보기</button>':'')+'</div>')}
    else if(s.k===1){if(dq&&srcQid(s)===dq.q.id)continue;const m=s.qn.match(/^(.+?) · 퀘스트 보상$/);if(m){if(seen.has('dq'))continue;const d=DGS.find(x=>x.ko===m[1]);parts.push('<div class="src"><b>📜 던전 퀘스트 보상</b><div class="nm">'+esc(m[1])+' 퀘스트 중 하나</div>'+(d?'<button class="btn sm" data-a="dgo" data-k="'+d.slug+'">던전 퀘스트 보기</button>':'')+'</div>');continue}
      const f=findZoneQuest(s.qn);if(f){const q=f.q;const z=q.gz||q.sz;parts.push('<div class="src"><b>📜 퀘스트 보상</b><div class="nm">「'+esc(q.nm)+'」 <span class="lvb '+lvCls(q.lv,c.lv)+'">'+q.lv+'</span></div>'+(q.obj?'<div class="obj">'+esc(q.obj)+'</div>':'')+'<div class="sub">'+esc(z)+' '+contTag(z)+'</div><div class="sub">'+(q.gv?esc(q.gv)+(q.xy?' ('+esc(q.xy.replace(',',', '))+')':''):'아이템을 줍거나 필드에서 시작')+' · '+q.min+'레벨부터'+(q.pre?' · 앞 퀘스트 '+q.pre+'개 먼저':'')+(q.ch?' · 연계 '+q.ch+'개 이어짐':'')+'</div><div class="bkb">'+(q.id?'<button class="btn sm" data-a="qopen" data-k="'+q.id+'">퀘스트·위치 보기</button>':'')+'<button class="btn sm ghost" data-a="goz" data-k="'+esc(z)+'">이 지역 퀘스트</button></div></div>')}
      else if(QDB&&QDB.get(srcQid(s))){const X=QDB.get(srcQid(s));parts.push('<div class="src"><b>📜 퀘스트 보상</b><div class="nm">「'+esc(X.n)+'」 <span class="lvb '+lvCls(X.lv,c.lv)+'">'+(X.lv||'?')+'</span></div><div class="sub">'+(X.g&&X.g[0]?'받는 곳 '+esc(X.g[0])+(X.g[1]?' ('+esc(X.g[1])+')':'')+(X.z&&X.g[1]&&X.g[1]!==X.z?' · 하는 곳 '+esc(X.z):''):esc(X.z||''))+' · '+(X.m||1)+'레벨부터'+(mqDone(c,X)?' · ✅ 했어요':'')+'</div><div class="bkb"><button class="btn sm" data-a="qopen" data-k="'+X.id+'">퀘스트·위치 보기</button>'+(X.z?'<button class="btn sm ghost" data-a="goz" data-k="'+esc(X.z)+'">이 지역 퀘스트</button>':'')+'</div></div>')}
      else parts.push('<div class="src"><b>📜 퀘스트 보상</b><div class="nm">「'+esc(s.qn)+'」</div>'+(QDB?'':'<div class="sub">퀘스트 자료를 불러오는 중…</div>')+'<div class="sub">앱 자료에 없는 퀘스트예요. <a href="https://www.wowhead.com/forever/ko/'+esc(s.href.replace('wh:','').replace('=','='))+'" target="_blank" rel="noopener">와우헤드에서 보기 ↗</a></div></div>')}
    else if(s.k===3)parts.push('<div class="src"><b>⚔️ 몹 드랍</b><div class="nm">'+esc(s.label.replace('드랍 · ',''))+'</div><div class="sub">이 몹을 잡으면 낮은 확률로 나와요.</div></div>');
    else if(s.k===2)parts.push('<div class="src"><b>🎲 월드 드랍</b><div class="sub">레벨 맞는 필드 몹에게서 무작위로 나와요. 경매장에서 사는 게 빨라요.</div></div>');
    else if(s.k===4)parts.push('<div class="src"><b>🔨 제작</b><div class="nm">'+esc(s.label.replace(/^제작 · /,''))+'</div><div class="sub">전문기술로 만들거나 경매장에서 사요.</div></div>');
    else if(s.k===5)parts.push('<div class="src"><b>🪙 상인 판매</b><div class="nm">'+esc(s.label.replace(/^상인 · /,''))+'</div></div>');
    else parts.push('<div class="src">'+esc(s.label)+'</div>')}
  h+=parts.length?parts.join(''):'<p class="note">출처 정보가 없어요.</p>';
  return h}
function infoSheet(c,id){const it=IT.get(+id);if(!it)return '';if(!QDB)qdbLoad();const b=bestSlot(it,c);const cur=b?eqIt(c,b.s):null;
  let h='<div class="sh"><h2>'+itName(it)+'</h2><button class="x" data-a="close">✕</button></div>';
  h+='<div class="row wtip">'+itIcon(it,'lg')+'<span class="m"><span class="sub">'+itMeta(it)+'</span>'+statLine(it)+(usable(it,c)?'':'<span class="sub" style="color:var(--bad)">내 직업은 못 써요</span>')+'</span>'+(b&&usable(it,c)?'<span class="r">'+gainTag(b.g,b.base,b.empty)+'</span>':'')+'</div>';
  if(b&&usable(it,c))h+='<p class="note">'+SLOT_KO[b.s]+' 칸에 끼면 (지금: '+(cur?esc(cur.nm):'비어 있음')+')</p>'+statChange(c,b.s,it);
  h+=itActs(c,it.id).replace('<button class="btn sm ghost" data-a="info" data-k="'+it.id+'">ⓘ 얻는 곳</button>',(c.cmp||[]).length?'<button class="btn sm ghost" data-a="cmpgo">비교 보기 ('+c.cmp.length+')</button>':'');
  {const so=setOf(it.id);if(so)h+=setHtml(c,so,1)}
  h+='<h3>어디서 얻나요</h3>'+srcParts(c,it);
  {const n=wskNeed(it,c);if(n)h+=n.low?'<div class="src"><b>🎓 '+esc(n.ko)+' 숙련도 '+n.low[0]+'/'+n.low[1]+'</b><div class="nm">숙련도가 낮으면 빗나감·스치는 공격이 많아요. 낄 거라면 사냥하면서 숙련도부터 올리세요.</div></div>'
    :'<div class="src"><b>🎓 '+esc(n.ko)+' 숙련이 필요해요</b><div class="nm">'+(n.guess?'처음부터 배우는 무기가 아니에요. 아직 안 배웠다면':'게임에서 불러온 무기 숙련에 없어요.')+' 무기 전문가 '+esc(n.at)+'에게 배우세요 (10실버). 배운 뒤엔 숙련도를 1부터 올려야 해요.'+(n.guess?' 애드온으로 불러오면 배운 숙련을 정확히 알 수 있어요.':'')+'</div></div>'}
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
  /* 처음 여는 기기(특히 홈 화면에 깐 앱): 다른 기기 기록을 한 번에 가져오기 */
  if(first)h+='<div class="step card"><div class="q">📱💻 다른 기기에서 쓰던 기록이 있나요?</div><p class="note">다른 기기의 「내 캐릭터 → 휴대폰·컴퓨터 자동 연동」에서 <b>🔗 링크 복사</b>를 누른 뒤(카톡 「나와의 채팅」으로 받아 복사해도 돼요) 아래 버튼을 누르면 캐릭터·장비·끝낸 퀘스트를 그대로 가져와요.</p><button class="btn full" data-a="sypaste">📋 복사한 코드로 연결</button></div>';
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
function dgNow(L){return DGS.filter(d=>!d.soon&&L>=d.lo-1&&L<=d.hi).sort((a,b)=>a.fit-b.fit)}
/* ⏱️ 사냥 기록 · 골드 (애드온) */
function playCard(c){const r=xpRate(c);const X=myXp(c);if(!r&&c.gold==null)return '';const S=c.sess||{};
  let h='<div class="card plc"><div class="hd"><h3>⏱️ 사냥 기록 <small>'+(c.sess?armAgo(c.sess.t)+' 불러옴':'')+'</small></h3></div><div class="plg">';
  if(r)h+='<div><small>시간당 경험치</small><b>약 '+Math.round(r).toLocaleString()+'</b><span>최근 접속 '+Math.round(S.hs/60)+'분 기준</span></div>';
  if(r&&X)h+='<div><small>다음 레벨까지</small><b>약 '+Math.max(1,Math.round((X.max-X.cur)/r*60))+'분</b><span>'+(X.max-X.cur).toLocaleString()+' 남음'+(X.rest?' · 휴식 경험치 있음':'')+'</span></div>';
  if(S.secs>=60)h+='<div><small>이번 접속</small><b>'+Math.round(S.secs/60)+'분</b><span>경험치 '+(S.xp||0).toLocaleString()+'</span></div>';
  if(c.gold!=null)h+='<div><small>가진 돈</small><b class="gld">'+goldTxt(c.gold)+'</b><span>'+(c.lv<40?((c.cls==='paladin'||c.cls==='warlock')?'40레벨 탈것은 직업 퀘스트로 받아요(종족 탈것 100골드는 안 사도 돼요)':c.gold>=1000000?'40레벨 탈것 100골드 준비됐어요':'40레벨 탈것은 100골드 · '+Math.min(99,Math.floor(c.gold/10000))+'% 모았어요'):c.lv>=58&&c.lv<60?'60레벨 빠른 탈것 훈련은 1,000골드예요':'불러온 때 기준')+'</span></div>';
  return h+'</div></div>'}
/* 📝 내 메모: 퀘스트 메모(c.notes.q[번호]) · 지도 핀 메모(c.notes.p[{c,x,y,t}]) — 캐릭터 기록이라 연동으로 같이 맞춰짐 */
function noteClean(c){if(!c||!ui.sheet||!String(ui.sheet).startsWith('note:'))return;const ta=document.querySelector('textarea[data-c=pinTxt]');const L=(c.notes&&c.notes.p)||[];const i=+ui.sheet.slice(5);if(ta&&L[i])L[i].t=ta.value.trim();if(L[i]&&!L[i].t&&ui.noteNew){pinGone(c,L[i],true);L.splice(i,1)}ui.noteNew=0;save()}
/* 지운 지도 핀은 만든 시각(at)을 남겨, 다른 기기와 맞출 때 되살아나지 않게 */
function pinGone(c,n,on){if(!n||!n.at)return;const N=c.notes=c.notes||{};const X=(N.x||[]).filter(t=>t!==n.at);if(on)X.push(n.at);N.x=X.slice(-300)}
function qnTag(c,id){const t=qNote(c,id);return t?'<em class="qnt">📝 '+esc(t.length>40?t.slice(0,38)+'…':t)+'</em>':''}
function qNote(c,id){return ((c.notes&&c.notes.q)||{})[id]||''}
function qNoteBox(c,id){return '<div class="qnote"><b>📝 내 메모</b><textarea class="inp" rows="2" maxlength="300" data-c="qnote" data-k="'+id+'" placeholder="예: 근처 희귀몹 · 이 퀘 버그 있음 · 파티 필요">'+esc(qNote(c,id))+'</textarea></div>'}
function noteSheet(c,i){const n=((c.notes&&c.notes.p)||[])[+i];if(!n)return '<div class="sh"><h2>📍 지도 메모</h2><button class="x" data-a="close">✕</button></div><p class="note">지워진 메모예요.</p>';
  const z=ATL[n.c]?ATL[n.c].ko:'';
  return '<div class="sh"><h2>📍 지도 메모</h2><button class="x" data-a="close">✕</button></div><p class="note">'+esc(z)+' · '+new Date(n.at||Date.now()).toLocaleDateString('ko-KR')+(ui.noteNew?' · 새 메모':'')+'</p>'
    +'<textarea class="inp" rows="3" maxlength="300" data-c="pinTxt" data-k="'+i+'" placeholder="예: 여기 희귀몹 · 동굴 입구 · 상자 자주 나옴"'+(ui.noteNew?' autofocus':'')+'>'+esc(n.t||'')+'</textarea>'
    +'<div class="bkb" style="margin-top:8px"><button class="btn sm" data-a="close">저장하고 닫기</button><button class="btn sm danger" data-a="pindel" data-k="'+i+'">지우기</button></div>'}
function notesList(c){const Q=Object.entries((c.notes&&c.notes.q)||{}).filter(([,t])=>t);if(Q.length&&!QDB)qdbLoad();const P=((c.notes&&c.notes.p)||[]).map((n,i)=>[i,n]).filter(([,n])=>n.t);if(!Q.length&&!P.length)return '';
  return '<div class="card nlist"><div class="hd"><h3>📝 내 메모 <small>'+(Q.length+P.length)+'개</small></h3></div>'
    +Q.slice(0,ui.nAll?99:5).map(([id,t])=>{const X=QDB&&QDB.get(+id);return '<button class="nrow" data-a="qopen" data-k="'+id+'"><b>'+esc(X?X.n:'퀘스트 '+id)+'</b><span>'+esc(t)+'</span></button>'}).join('')
    +P.slice(0,ui.nAll?99:5).map(([i,n])=>'<button class="nrow" data-a="notego" data-k="'+i+'"><b>📍 '+esc(ATL[n.c]?ATL[n.c].ko:'')+' 지도</b><span>'+esc(n.t)+'</span></button>').join('')
    +((Q.length>5||P.length>5)?'<button class="btn ghost sm full" data-a="nall">'+(ui.nAll?'접기':'전부 보기')+'</button>':'')+'</div>'}
/* 📒 플레이 일지: 불러올 때마다(붙여 넣기·PC 파일·자동 맞춤) 레벨·경험치·끝낸 퀘스트·이번 접속 기록을 한 줄씩 */
function jlAdd(c,P){const X=c.xp&&c.xp.max>0?Math.round(c.xp.cur/c.xp.max*1000)/10:null;
  const e={t:Date.now(),lv:c.lv,xp:X,mq:Object.keys(c.mq||{}).length,ss:P.sess?P.sess.secs||0:0,sx:P.sess?P.sess.xp||0:0};
  const L=c.jl=c.jl||[];const b=L[L.length-1];
  if(b&&b.lv===e.lv&&b.xp===e.xp&&b.mq===e.mq&&e.t-b.t<30*60e3)return;
  L.push(e);if(L.length>300)L.splice(0,L.length-300)}
/* 하루 단위로 묶기: 접속 시간·경험치는 같은 접속(초가 줄어들면 새 접속)마다 가장 큰 값을 더함 */
function jlDays(c){const L=(c.jl||[]).slice().sort((a,b)=>a.t-b.t);const D=new Map();const key=t=>{const d=new Date(t);return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
  let prevMq=null,prev=null;
  for(const e of L){const k=key(e.t);let d=D.get(k);if(!d){d={k,t:e.t,lv0:prev?prev.lv:e.lv,xp0:prev?prev.xp:e.xp,mq0:prevMq!=null?prevMq:e.mq,secs:0,xpg:0,_s:null,_x:0,_ss:0};D.set(k,d)}
    if(d._s!=null&&e.ss<d._s){d.secs+=d._ss;d.xpg+=d._x;d._ss=0;d._x=0}
    d._s=e.ss;d._ss=Math.max(d._ss,e.ss);d._x=Math.max(d._x,e.sx);d.lv1=e.lv;d.xp1=e.xp;d.mq1=e.mq;d.t1=e.t;prevMq=e.mq;prev=e}
  return [...D.values()].map(d=>Object.assign(d,{secs:d.secs+d._ss,xpg:d.xpg+d._x})).sort((a,b)=>b.t-a.t)}
/* 최근 7일 일지로 시간당 경험치 (30분 넘게 쌓였을 때만) */
function jlRate(c){const W=jlDays(c).filter(d=>Date.now()-d.t1<7*864e5);const s=W.reduce((n,d)=>n+d.secs,0),x=W.reduce((n,d)=>n+d.xpg,0);return s>=1800&&x>0?x/s*3600:0}
function jlCard(c){const W=jlDays(c);if(!W.length)return '';const hm=s=>s<3600?Math.max(1,Math.round(s/60))+'분':Math.floor(s/3600)+'시간 '+Math.round(s%3600/60)+'분';
  const rows=W.slice(0,ui.jlAll?30:4).map(d=>{const dt=new Date(d.t);const lvTxt=d.lv1>d.lv0?d.lv0+'→'+d.lv1+'레벨':d.lv1+'레벨';const xpTxt=d.xp1!=null?' ('+(d.lv1>d.lv0||d.xp0==null||d.xp0===d.xp1?'':d.xp0+'→')+d.xp1+'%)':'';
    const mq=Math.max(0,(d.mq1||0)-(d.mq0||0));return '<div class="jlr"><b>'+(dt.getMonth()+1)+'/'+dt.getDate()+'</b><span>'+lvTxt+xpTxt+(mq?' · 퀘스트 +'+mq:'')+(d.secs>=60?' · '+hm(d.secs):'')+(d.secs>=600&&d.xpg?' · 시간당 '+(Math.round(d.xpg/d.secs*3600/100)/100)+'만':'')+'</span></div>'}).join('');
  const r=jlRate(c);
  return '<div class="card jlc"><div class="hd"><h3>📒 플레이 일지 <small>불러올 때마다 쌓여요</small></h3>'+(W.length>4?'<button class="more" data-a="jlall">'+(ui.jlAll?'접기':'전부 '+W.length+'일')+'</button>':'')+'</div>'+rows+(r?'<p class="note">최근 7일 시간당 약 <b>'+Math.round(r).toLocaleString()+'</b> 경험치 · 레벨업 탭 시간 계획에 써요</p>':'')+'</div>'}
/* 🏳️ 평판 (애드온): 다음 등급에 가까운 순 */
function repCard(c){const R=(c.rep||[]).filter(r=>r.st<8&&r.st>=3);if(!R.length)return '';
  const L=R.map(r=>{const T=REP_ST.find(x=>x[0]===r.st)||REP_ST[3];const nx=REP_ST.find(x=>x[0]===r.st+1);const span=T[3]-T[2];const p=Math.max(0,Math.min(1,(r.val-T[2])/span));return {r,T,nx,p,left:T[3]-r.val}}).filter(x=>x.p>0||x.r.st>4).sort((a,b)=>b.p-a.p).slice(0,ui.repAll?30:4);
  return '<div class="card rpc"><div class="hd"><h3>🏳️ 평판</h3>'+(R.length>4?'<button class="more" data-a="repall">'+(ui.repAll?'접기':'전체 '+R.length+'개')+' ›</button>':'')+'</div>'
    +L.map(x=>'<div class="rpr"><span class="m"><b>'+esc(x.r.nm)+'</b><small>'+x.T[1]+(x.nx?' → '+x.nx[1]+'까지 '+x.left.toLocaleString():'')+'</small></span><span class="rpb"><i style="width:'+Math.round(x.p*100)+'%"></i></span></div>').join('')+'</div>'}
/* 🧩 홈: 게임 애드온 안내 · 마지막으로 가져온 때 */
const ADDON_FEAT=[['📜','퀘스트','진행도(3/8)까지'],['🛡️','장비','17칸 자동 입력'],['🌳','특성','찍은 칸 그대로 「내 특성」'],['⚒️','전문기술','숙련도 · 지금 단계'],['⚔️','무기 숙련','배운 무기 · 숙련도'],['🦅','비행 경로','연 곳 · 안 연 곳'],['⏱️','사냥 기록','시간당 경험치'],['🎒','가방·은행','더 좋은 템 · 재료'],['💰','골드','가진 돈'],['🏳️','평판','다음 등급까지'],['👥','부캐','앱에 자동 추가'],['🎮','툴팁 추천','게임 툴팁에 표시'],['🐉','보스 공략 창','보스 기술 요약'],['🔔','알림','레벨업·반납 때'],['📍','목표 자리','몹 잡고 물건 주운 곳 · 받을 수 있었던 레벨']];
const ADDON_CMD=[['/wfh','코드 창 열기'],['/wfh 다음','앱 동선의 다음 갈 곳 보기'],['/wfh 도움','명령어 모두 보기'],['/wfh 점검','담긴 개수 확인'],['/wfh 추천','툴팁 추천 · 보상 고르기 · 동선 넣기','wfr']];
const ADDON_OFF=[['/wfh 공략','보스 공략 창 끄기 · 켜기'],['/wfh 알림','알림 · 접속 인사 끄기 · 켜기'],['/wfh 추천 지우기','툴팁 추천 지우기'],['/wfh 설정','지금 켜고 끈 상태 보기']];
/* 명령어 표: 왼쪽 명령어 칸 너비를 맞춤 */
function addonCmdTable(title,rows,foot){return '<div class="acmd">'+(title?'<div class="acmh">'+title+'</div>':'')+'<div class="acmg">'+rows.map(r=>'<code>'+r[0]+'</code><span>'+r[1]+(r[2]?' <button class="lnk" data-a="'+r[2]+'">코드 만들기</button>':'')+'</span>').join('')+'</div>'+(foot?'<p class="acmf">'+foot+'</p>':'')+'</div>'}
function addonOffHtml(){return addonCmdTable('🔕 끄는 방법 <small>게임 채팅창에 입력</small>',ADDON_OFF,'애드온 전체 끄기: 캐릭터 선택 화면 「애드온」에서 체크 해제')}
/* ===== 레벨별 할 일 (포에버, 얼라이언스) =====
   [레벨, id, 제목, 설명, 직업(없으면 전부)] — 레벨이 되면 홈 「지금 할 일」에 체크 칸으로 나와요 */
const MS=[[5,'prof5','전문기술 2개 고르기','채집 둘이나 채집+제작. 포에버는 야영지 물건(숯돌 바퀴·깃발·향초)도 전문기술로 만들어요'],
 [4,'earth4','대지의 토템 퀘스트','앤빌마 테오 해머스톰 (아이언포지 엘드룬 스톰브레이커가 보내요)',['shaman']],
 [10,'tal10','특성 포인트가 생겨요','직업 교관에게서 특성을 찍어요. 11·16·21·31점에 큰 특성이 열려요'],
 [10,'pet10','사냥꾼 야수 길들이기 퀘스트','직업 교관에게 받아요. 끝내면 펫 먹이·되살리기도 배워요',['hunter']],
 [10,'void10','공허방랑자 소환 퀘스트','흑마법사 교관에게 받아요',['warlock']],
 [10,'bear10','곰 변신 퀘스트','드루이드 교관에게 받아요',['druid']],
 [10,'stance10','방어 태세 퀘스트','전사 교관에게 받아요 · 스톰윈드(바틀비)·아이언포지(베즈렉)·다르나서스(볼루스) 세 갈래 중 하나만 하면 돼요',['warrior']],
 [10,'dw10','쌍수 배우기','도적 교관에게서 배워요 (포에버는 10레벨)',['rogue']],
 [10,'fire10','불의 토템 퀘스트','아이언포지 엘드룬 스톰브레이커 → 던 모로 브루그스 킨들본 → 모단 호수',['shaman']],
 [12,'redem12','구원 퀘스트 (신앙의 고서)','스톰윈드 두소리안 랄에게 받아요',['paladin']],
 [14,'cure14','독 치료 퀘스트 (새로운 가르침)','다르나서스 마스렌길 베어워커 → 달의 숲',['druid']],
 [16,'aqua16','수중 변신 퀘스트 (귀중한 교훈)','다르나서스 마스렌길 베어워커 → 달의 숲 덴드리트 스타블레이즈 → 엘룬아라 호수의 시험',['druid']],
 [14,'bag14','포근한 침낭 퀘스트','쉬고 나면 경험치 최대 +3% 버프. 14레벨부터 받을 수 있어요'],
 [20,'pole20','장창 숙련 배우기','스톰윈드 무기 전문가 우 핑 (20레벨부터)',['warrior','paladin','hunter','druid']],
 [20,'dw20','쌍수 배우기','직업 교관에게서 배워요 (20레벨)',['warrior','hunter']],
 [20,'succ20','서큐버스 소환 퀘스트','스톰윈드 대흑마법사 게이킨 → 잿빛 골짜기 사랑나무',['warlock']],
 [20,'poison20','독 퀘스트 (잔질의 손길)','스톰윈드 단장 마티아스 쇼에게 받아요 (마티아스와 데피아즈단 다음)',['rogue']],
 [20,'water20','물의 토템 퀘스트','아이언포지 엘드룬 스톰브레이커 → 모단 호수 노릭 록세인 → 저습지',['shaman']],
 [20,'cat20','표범 변신 퀘스트 (거대한 살쾡이의 혼)','포에버는 표범 변신도 퀘스트로 배워요 · 다르나서스 마스렌길 베어워커 → 달의 숲',['druid']],
 [30,'stance30','광폭 태세 퀘스트 (섬 사람)','아이언포지 켈브 스턴해머 → 불모의 땅 격투의 섬',['warrior']],
 [30,'fel30','지옥사냥개 소환 퀘스트','불모의 땅 스트라드 파선 → 아이언포지 크롬 스타우트암 (비밀의 고서)',['warlock']],
 [30,'air30','바람의 토템 퀘스트','아이언포지 엘드룬 스톰브레이커 → 아라시 고원 베이릭 썬더헤임',['shaman']],
 [20,'prof20','전문기술 전문 등급','숙련도 125까지 올리고 교관에게서 전문 등급을 배워요'],
 [35,'prof35','전문기술 장인 등급','숙련도 200 · 장인 등급 교관에게 배워요'],
 [40,'mount40','탈것 배우기 (100골드)','종족 탈것 교관에게서 훈련하면 탈것을 함께 받아요. 평판 우호면 10% 할인',['warrior','hunter','rogue','priest','shaman','mage','druid']],
 [40,'horse40','군마 소환 퀘스트 (고결함의 고서)','스톰윈드 두소리안 랄에게 받아요 · 직업 탈것이라 종족 탈것(100골드)은 안 사도 돼요',['paladin']],
 [40,'felsteed40','지옥마 소환 퀘스트','톱니항 스트라드 파선 · 끝내면 승마 기술도 생겨서 종족 탈것(100골드)은 안 사도 돼요',['warlock']],
 [40,'dual40','이중 특성 열기','직업 교관에게서 둘째 특성을 열 수 있어요. 앱 장비 화면에서 두 특성 추천을 같이 볼 수 있어요'],
 [40,'mail40','사슬 갑옷 배우기','직업 교관에게서 배워요. 이제 사슬 템도 추천에 나와요',['hunter','shaman']],
 [40,'plate40','판금 갑옷 배우기','직업 교관에게서 배워요. 이제 판금 템도 추천에 나와요',['warrior','paladin']],
 [60,'mount60','빠른 탈것 (1,000골드)','종족 탈것 교관 · 평판 우호면 10% 할인'],
 [60,'raid60','레이드 준비','12월 9일 레이드 열림 · 던전 장비 모으기·적중 상한(근접 8%·주문 17%) 맞추기']];
MS.sort((a,b)=>a[0]-b[0]);
function msRows(c){const L=c.lv||1,ms=c.ms||{};const mine=MS.filter(m=>!m[4]||m[4].includes(c.cls));
  const due=mine.filter(m=>m[0]<=L&&!ms[m[1]]&&m[0]>=L-15).slice(0,3);const nx=mine.find(m=>m[0]>L);
  let h=due.map(m=>'<div class="trow ms"><span class="ti">📌</span><span class="m"><b>'+esc(m[2])+' <small>'+m[0]+'레벨</small></b><span>'+esc(m[3])+'</span></span><button class="btn sm tbtn" data-a="msok" data-k="'+m[1]+'">했어요</button></div>').join('');
  if(nx&&nx[0]<=L+5)h+='<div class="trow soon"><span class="ti">🔜</span><span class="m"><b>'+nx[0]+'레벨 · '+esc(nx[2])+'</b><span>'+esc(nx[3])+'</span></span></div>';return h}
function addonCard(c){const im=c.imported;const ago=im?armAgo(im.t):'';
  let h='<div class="card adc"><div class="hd"><h3>🧩 게임 애드온 <small>와포 도우미 v3.8</small></h3>'+(im?'<button class="more" data-a="imp">다시 가져오기 ›</button>':'')+'</div>';
  if(im){const got=['끝낸 퀘스트 '+(im.n||0)+'개'];if(c.ql&&Object.keys(c.ql).length)got.push('퀘스트창 '+Object.keys(c.ql).length+'개');if(c.qp&&Object.keys(c.qp).length)got.push('진행도');if((im.v||1)>=2){if(c.eq&&Object.keys(c.eq).length)got.push('장비');if(c.profLv)got.push('전문기술');if(c.xp)got.push('경험치')}if((im.v||1)>=3){if(c.bag)got.push('가방');if(c.rep)got.push('평판');if(c.gold!=null)got.push('골드');if(c.wsk)got.push('무기 숙련');if(c.tal&&/^game/.test(c.tal.src||''))got.push('내 특성')}
    h+='<p class="adl"><b>'+ago+'</b>에 가져왔어요 · '+got.join(' · ')+'</p>';
    if((im.v||1)<3)h+='<p class="adw">'+((im.v||1)<2?'옛 애드온':'v2 애드온')+' 코드예요. 새 애드온(v3)을 받으면 아래 기능을 모두 쓸 수 있어요. <a class="lnk" href="addon/WowfHelper.zip" download>새로 받기</a></p>';
    else if(c.eq&&Object.keys(c.eq).length&&c.eqv===undefined)h+='<p class="adw">새 애드온(v3.5)은 <b>끼고 있는 장비의 실제 능력치</b>도 가져와요. 「산적의 ○○」 같은 무작위 옵션 장비나 포에버에서 능력치가 바뀐 장비도 점수가 맞게 나와요. 새로 받아 <code>/wfh</code> 코드를 다시 넣어 주세요. <a class="lnk" href="addon/WowfHelper.zip" download>새로 받기</a></p>';
    else if(!DB.gq)h+='<p class="adw">새 애드온(v3.4)은 <b>게임이 알려 주는 퀘스트 위치</b>(목표·반납·동굴 입구 같은 길안내 지점)도 가져와요. 지도 동선이 게임과 같아져요. 새로 받아 <code>/wfh</code> 코드를 다시 넣어 주세요. <a class="lnk" href="addon/WowfHelper.zip" download>새로 받기</a></p>';
    else if(!(c.tal&&/^game/.test(c.tal.src||''))&&c.lv>=10)h+='<p class="adw">새 애드온(v3.3)은 <b>찍은 특성</b>도 가져와요. 직업 탭에 「🎮 내 특성」으로 나오고 가이드와 다른 칸을 알려 줘요. <a class="lnk" href="addon/WowfHelper.zip" download>새로 받기</a></p>';
    else if(!c.taxi&&(im.v||1)>=3)h+='<p class="adw">새 애드온(v3.2)은 연 비행 경로도 가져와요. 게임에서 비행 조련사 창을 한 번 열고 <code>/wfh</code> 하면 동선에 안 연 비행 경로를 알려 줘요. <a class="lnk" href="addon/WowfHelper.zip" download>새로 받기</a></p>';
    else if(!c.wsk&&['warrior','rogue','hunter','paladin','shaman'].includes(c.cls))h+='<p class="adw">새 애드온(v3.1)은 배운 무기 숙련과 숙련도도 가져와요. 도적 한손 도끼처럼 「숙련 필요」를 정확히 알려 줘요. <a class="lnk" href="addon/WowfHelper.zip" download>새로 받기</a></p>';
    else if(Date.now()-im.t>36e5)h+='<p class="adw">한 시간 넘게 지났어요. 게임에서 <code>/wfh</code> 로 새 코드를 가져오면 퀘스트·장비·가방이 다시 맞춰져요.'+(FSA?' PC라면 <button class="lnk" data-a="fsload">📂 파일에서 바로 불러오기</button>도 돼요.':'')+'</p>'}
  else h+='<p class="note">게임 정보를 앱으로 한 번에 가져오는 애드온이에요. 인터넷으로 보내는 건 없고, 게임에 뜬 글자를 복사해서 붙여 넣는 방식이에요.</p>';
  const sec=(id,title,sub,body,open)=>'<details class="adsec"'+(open?' open':'')+'><summary><b>'+title+'</b><small>'+sub+'</small><i>⌄</i></summary><div class="adsb">'+body+'</div></details>';
  const h0=h;h='';
  h+=sec('feat','✨ 할 수 있는 것',ADDON_FEAT.length+'가지','<div class="adfg">'+ADDON_FEAT.map(f=>'<div><i>'+f[0]+'</i><b>'+f[1]+'</b><span>'+f[2]+'</span></div>').join('')+'</div>',false);
  h+=sec('start','🚀 시작하기','3단계 · 받기 → /wfh → 붙여 넣기','<div class="adst2">'
   +'<div><em>1</em><span class="t"><b>애드온 받기</b><small><b>WowfHelper</b> 폴더를 <b>Interface/AddOns</b> 에 넣기 · 원래 폴더는 지우고</small></span><a class="btn sm" href="addon/WowfHelper.zip" download>zip 받기</a></div>'
   +'<div><em>2</em><span class="t"><b>게임에서 <code>/wfh</code></b><small>채팅창에 치면 코드 창이 떠요 → Ctrl+C</small></span></div>'
   +'<div><em>3</em><span class="t"><b>앱에 붙여 넣기</b><small>붙여 넣으면 바로 맞춰져요</small></span><button class="btn sm ghost" data-a="imp">붙여 넣기</button></div></div>',!im);
  h+=sec('cmd','⌨️ 게임 명령어','/wfh · 점검 · 추천',addonCmdTable('',ADDON_CMD),false);
  h+=sec('off','🔕 끄는 방법','공략 창 · 알림 · 추천',addonCmdTable('',ADDON_OFF,'애드온 전체 끄기: 캐릭터 선택 화면 「애드온」에서 체크 해제'),false);
  h+='<p class="adt">은행은 게임에서 한 번 열어야 담겨요 · 부캐는 그 캐릭터로 한 번 접속해야 담겨요'+(isPC()?'':' · PC에서 하는 게 편해요')+'</p>';
  /* 이미 가져온 적 있으면 안내는 접어 둠 */
  h=im?h0+'<details class="adsec adall"><summary><b>📖 애드온 안내</b><small>할 수 있는 것 · 명령어 · 끄는 방법</small><i>⌄</i></summary><div class="adsb">'+h+'</div></details>':h0+h;
  return h+'</div>'}
/* 8) 이번 주 직업 변경 — 블리자드 포에버 핫픽스·개발 노트에서 직업별로 골라 둔 것 (화요일마다 갱신) */
const CHG=[
 ['2026-11-13','*','','던전: 파티원 한 명에게라도 너무 낮은(회색) 몹은 파티 모두 경험치 0 — 레벨 차이가 큰 친구와 돌면 경험치가 안 나와요'],
 ['2026-11-13','*','','가라앉은 도시: 보스 아닌 몹이 2시간 뒤에 다시 나와요(전엔 1시간)'],
 ['2026-11-13','priest','','유산 「The Quick and the Dead」가 천상의 정신 마나 소모도 제대로 줄여 줘요'],
 ['2026-11-13','*','','가시덤불 골짜기 호랑이·표범·랩터, 황야의 땅 작은 바위 정령이 더 자주 나와요 · 강물터 퀘스트 오류 몇 개 고침(징글스프로킷이 퀘스트를 안 주던 것 등)'],
 ['2026-11-13','druid','restoration','회복 드루: 급속 성장 치유량 2배(계수 3.3→6.6%) · 움직이면서는 못 써요'],
 ['2026-11-13','paladin','','지휘의 심판이 다시 근접 공격으로 판정돼요'],
 ['2026-11-13','shaman','','질풍의 토템이 주무기가 아닌 근접 기술로도 발동해요'],
 ['2026-11-13','mage','','얼음 회오리가 발동 효과 피해·눈보라 피해에도 제대로 풀려요(얼려 놓고 눈보라 쓰면 풀림)'],
 ['2026-11-13','warrior','','광전사의 격노가 기절시키기(도적)를 제대로 풀어 줘요'],
 ['2026-11-11','*','','강물터 정예 몹 피해 줄임 · 재봉 가방이 옷감 한 필 더 들어가게'],
 ['2026-11-11','paladin','','심판이 원거리 공격으로 판정돼요 — 근접 발동 효과(무기 마법부여 등)가 안 걸리고 원거리 적중률을 써요 (11/13에 지휘의 심판만 다시 근접)'],
 ['2026-11-11','paladin','retribution','징벌: 분노 봉인 해제가 질풍의 토템 공격으로는 메아리를 만들지 않아요'],
 ['2026-11-11','hunter','','일제 사격: 움직여도 계속 정신 집중되던 것·발동 효과를 일으키던 것 고침'],
 ['2026-11-11','priest','','노움 교란의 섬광을 어둠의 형상에서도 써요 · 황혼의 집중(신성)도 어둠의 형상에서 적용돼요'],
 ['2026-11-11','*','','아라시 고원 「The Giant in the Den」 앞 퀘스트가 막히던 것 고침 · 셴드랄라스 일부 지역에서 탈것을 못 타던 것 고침'],
 ['2026-11-10','*','','종족 상인에게 사는 탈것이 획득 시 귀속으로 바뀌었어요 — 다른 캐릭터에게 사서 넘길 수 없어요'],
 ['2026-11-10','*','','강물터 「Poison Tips」 독사 수를 크게 늘림'],
 ['2026-11-10','*','','48레벨 넘는 퀘스트 대부분에 골드 보상이 생겼어요 (11/15 공식 포럼엔 아직 빠진 퀘스트가 있다는 제보도 있어요)'],
 ['2026-11-10','shaman','enhancement','고양: 무기 강화와 무기 토템을 같이 써요(질풍의 무기+질풍의 토템) · 소용돌이치는 무기는 중첩마다 20%, 분당 6~10번 · 폭풍의 일격 피해 150→100%, 대기 6→8초'],
 ['2026-11-10','shaman','enhancement','고양: 교묘한 정신(지능→전투력) 비율을 낮춰 힘이 가장 좋은 능력치가 됐어요 — 장비 추천도 힘 우선이에요'],
 ['2026-11-10','druid','restoration','회복 드루: 자연의 신속함이 급속 성장도 즉시 시전으로 만들어요'],
 ['2026-11-10','hunter','','펫 생명력이 실수로 1.5배였던 것을 1.15배로 낮췄어요(전보다 약해짐) · 신비한 사격 마나 = 기본 마나 11% · 매 소환(야수 특성) 매의 근접 피해 약 +80%'],
 ['2026-11-10','warlock','','공허방랑자 기본 생명력 약 15% 늘림'],
 ['2026-11-10','warlock','affliction','고통: 괴멸 피해 30% 줄임 · 영혼 착취는 대상에 걸린 부패·생명력 착취·고통의 파멸 하나당 생명력 흡수·영혼 흡수·괴멸을 강화(최대 36%)'],
 ['2026-11-09','*','','던전에서 몹 잡을 때 경험치 +50% · 가라앉은 도시 몹이 30% 세게 때리던 것 고침 · 죽지 않는 골수 체력 −25%'],
 ['2026-11-09','warlock','','40레벨 지옥마 소환 퀘스트를 끝내면 승마 기술이 제대로 생겨요'],
 ['2026-11-09','priest','','어둠의 형상 중 공포의 수호물을 써도 형상이 안 풀려요 · 마력 주입이 아군에게 제대로 유지돼요'],
 ['2026-11-06','warlock','','공허방랑자 기본 생명력 +40 · 일부 펫 기술이 오크 종족 특성을 너무 많이 받던 문제 수정'],
 ['2026-11-06','*','','가죽세공 무두질 틀 요구 숙련도 125로 낮춤'],
 ['2026-11-06','*','','강물터 퀘스트 아이템이 파티원 모두에게 떨어져요 · 가라앉은 도시 입구 차원문 고침'],
 ['2026-11-04','*','','와우 포에버 출시 — 출시 전 노트에서 직업 피해량과 몹 생명력이 같이 올랐어요']];
function chgCard(c){const now=Date.now(),D=864e5;const L=CHG.filter(x=>(x[1]==='*'||x[1]===c.cls)&&(!x[2]||x[2]===c.spec)&&now-Date.parse(x[0])<21*D);
  if(!L.length)return '';const mine=L.filter(x=>x[1]!=='*');
  /* 「마을 들를 때 할 일」과 같은 모양: 날짜별로 묶고, 처음엔 최근 2일치만(더 보기로 전부) · 「지역: 내용」은 앞부분만 굵게 */
  const days=[...new Set(L.map(x=>x[0]))];const show=ui.chgAll?days:days.slice(0,2);const more=L.filter(x=>!show.includes(x[0])).length;
  const tx=t=>{const m=t.match(/^([^:·—]{2,14}): (.+)$/);return m?'<b>'+esc(m[1])+'</b> '+esc(m[2]):esc(t)};
  const chip=x=>x[1]==='*'?'':'<em class="ctag" style="--cc:'+((CINFO[x[1]]||[])[1]||'#e8c06a')+'">'+esc((CINFO[x[1]]||[''])[0])+'</em>';
  let h='<div class="card town chgc"><div class="hd"><h3>📰 최근 직업·게임 변경 <small class="mute">'+(mine.length?esc(CINFO[c.cls][0])+' '+mine.length+' · ':'')+'전체 '+L.length+'</small></h3>'+(more||ui.chgAll?'<button class="more" data-a="chgall">'+(ui.chgAll?'접기':'더 보기 ('+more+')')+'</button>':'')+'</div>';
  h+=show.map(d=>{const R=L.filter(x=>x[0]===d).sort((a,b)=>(a[1]==='*')-(b[1]==='*'));
    return '<div class="twn"><b class="tn">'+d.slice(5).replace('-','/')+'</b><ul>'+R.map(x=>'<li><span class="ti">'+(x[1]==='*'?'🌍':'⚔️')+'</span><span>'+chip(x)+tx(x[3])+'</span></li>').join('')+'</ul></div>'}).join('');
  return h+'<p class="note chgn">블리자드는 화요일 점검 때 직업을 조정해요 · 원문: 공식 포럼 「WoW: Forever Hotfixes」</p></div>'}
function home(c){const L=c.lv;const C=D_CLS[c.cls];let h='<div class="wrap">';
  if(c.seenLv==null||c.seenLv>L)c.seenLv=L;const up=L>c.seenLv;
  h+='<h2 class="hh">레벨 '+L+' <small>지금 할 일</small>'+(myXp(c)?'<span class="hxp" title="게임에서 불러온 경험치"><i style="width:'+Math.round(myXp(c).cur/myXp(c).max*100)+'%"></i><b>경험치 '+Math.round(myXp(c).cur/myXp(c).max*100)+'%</b>'+(myXp(c).rest?'<em>휴식 '+Math.round(myXp(c).rest/myXp(c).max*100)+'%</em>':'')+'</span>':'')+'</h2>';
  if(up)h+='<div class="lvup"><b>🎉 레벨 '+L+' 달성!</b><button class="btn sm" data-a="lvseen">확인</button></div>';
  /* 1. 퀘스트: 다음 갈 곳 (홈의 중심) */
  const sec=routeOf(c).find(S=>L>=S.a&&L<=S.b);const i1=h.length;
  if(sec){const P=nowPlan(c,sec);const PS=planStats(c,P);const all=PS.all,dn=PS.dn;
    const next=P.filter(x=>x.get.some(y=>!y.done&&!y.prof&&y.q.min<=L)||x.turn.some(y=>!y.done&&!y.prof)).slice(0,3);
    h+='<div class="card hq"><div class="hd"><h3><img class="hic" src="img/qget.png" alt="">다음 갈 곳</h3><button class="more" data-a="tab" data-k="quest"><b>'+dn+'/'+all+'</b> 퀘스트 ›</button></div>'
     +'<div class="pbar"><i style="width:'+(all?Math.round(dn/all*100):0)+'%"></i></div>'
     +(next.length?next.map((x,i)=>{const g=x.get.filter(y=>!y.done&&!y.prof&&y.q.min<=L).length,t=x.turn.filter(y=>!y.done&&!y.prof).length;const m=x.n.match(/^(.*?) \((\d+), (\d+)\)$/);return '<button class="row" data-a="tab" data-k="quest"><span class="hno">'+(i+1)+'</span><span class="m"><span class="nm">'+esc(x.npc?x.npc+' 근처':m?m[1]:x.n)+(x.again?' <small class="agn2">다시 들르기</small>':'')+'</span><span class="sub">'+esc(x.z)+(x.npc?' '+esc(x.n):'')+'</span></span><span class="hqb">'+(g?'<span>'+QMK.g+g+'</span>':'')+(t?'<span>'+QMK.r+t+'</span>':'')+'</span></button>'}).join(''):'<p class="note">이 구간 퀘스트를 다 끝냈어요 👍 레벨을 올려 보세요.</p>')+'</div>'}
  else h+='<div class="card"><p class="note">이 레벨 동선 자료가 없어요. 퀘스트 탭 지도에서 찾아보세요.</p></div>';
  /* 2. 챙길 것: 기술 · 장비 · 던전 · 곧 생기는 것 */
  const ls=(C?C.learns:[]).filter(l=>(!l[4]||l[4]==='alliance')&&(!l[7]||l[7]===c.race));const from=c.trn!=null?c.trn:L-2;const todo=ls.filter(l=>l[0]>from&&l[0]<=L);const nextLearn=ls.find(l=>l[0]>L);
  const U=upgrades(c,L,'ok');
  /* 지금 갈 던전: 내게 좋은 템(보스 드랍+퀘스트 보상)·남은 퀘스트가 많은 순 */
  const D=dgNow(L).map(d=>{const S=dgState(c,d);const qg=S.left.reduce((n,q)=>n+q.rw.map(id=>IT.get(id)).filter(it=>it&&usable(it,c)&&!ownedOf(c,it.id)&&((bestSlot(it,c)||{}).g||0)>.01).length,0);d._v={g:S.ups.length+qg,q:S.left.length,all:S.all};return d}).sort((a,b)=>(a._v.all-b._v.all)||(b._v.g*2+b._v.q)-(a._v.g*2+a._v.q)||(a.fit-b.fit));
  const tip=[[5,'전문기술(수습)을 배울 수 있어요'],[10,'전문기술 숙련 등급과 특성이 열려요'],[20,'전문기술 전문 등급을 배울 수 있어요'],[35,'전문기술 장인 등급을 배울 수 있어요'],[40,(c.cls==='paladin'||c.cls==='warlock')?'직업 탈것 퀘스트와 이중 특성이 열려요':'탈것(훈련 100골드, 말 함께 받음)과 이중 특성이 열려요'],[60,'만렙! 빠른 탈것 훈련은 1,000골드 · 던전 장비와 레이드 준비']].find(t=>t[0]>=L&&t[0]<=L+3);
  const row=(ic,t,sub,a,k,right,dim)=>'<div class="trow'+(dim?' dim':'')+'" data-a="'+a+'" data-k="'+k+'"><img class="ti" src="'+ic+'" alt=""><span class="m"><b>'+t+'</b><span>'+sub+'</span></span>'+(right||'')+'<span class="r">›</span></div>';
  /* 챙길 것: 기술·장비·던전을 한눈에 보는 세 칸(숫자 크게) + 레벨별 할 일 */
  const tile=(ic,t,big,sub,a,k,btn,dim)=>'<div class="htile'+(dim?' dim':'')+'" data-a="'+a+'" data-k="'+k+'"><span class="hth"><img src="'+ic+'" alt=""><b>'+t+'</b></span><span class="hbig">'+big+'</span><small>'+sub+'</small>'+(btn||'')+'</div>';
  const i2=h.length;h+='<div class="htiles">';
  h+=todo.length?tile('img/ui-book.png','배울 기술',todo.length+'<i>개</i>',esc(todo.filter(l=>l[3]).map(l=>l[1]).slice(0,2).join(', ')||'랭크 올리기'),'goc','learn','<button class="btn sm tbtn" data-a="trn">배웠어요</button>')
    :tile('img/ui-book.png','배울 기술','✓','다 배웠어요'+(nextLearn?' · 다음 '+nextLearn[0]+'레벨':''),'goc','learn','',1);
  const NEW=U.filter(x=>(x.it.ob||x.it.lv)>=L-1);
  h+=U.length?tile('img/ui-shield.png','바꿀 장비',U.length+'<i>칸</i>',NEW.length?'🆕 새 템 '+NEW.length+'개 · '+esc(NEW[0].it.nm):esc(U[0].it.nm),'tab','gear'):tile('img/ui-shield.png','바꿀 장비','✓','지금 장비가 제일 좋아요','tab','gear','',1);
  h+=D.length?tile('img/eye.png','갈 던전',D.length+'<i>곳</i>',esc(D[0].ko)+(D[0]._v.g?' · ⭐ 좋은 템 '+D[0]._v.g:''),'dgo',D[0].slug):tile('img/eye.png','갈 던전','–',L<13?'13레벨쯤부터':'맞는 던전 없음','tab','dungeon','',1);
  h+='</div>';
  {const ms=msRows(c);if(ms)h+='<div class="card todo"><div class="hd"><h3>📌 레벨별 할 일</h3></div>'+ms+'</div>'}
  try{h+=townCard(c)}catch(e){}
  const i3=h.length;const adC=chgCard(c)+playCard(c)+jlCard(c)+notesList(c)+repCard(c)+addonCard(c)+'<button class="syl'+(syOn()?' on':'')+'" data-a="chars">'+(syOn()?'📱💻 기기 연동 켜짐'+(SY.err?' · ⚠ '+esc(SY.err):SY.at?' · '+armAgo(SY.at)+' 맞춤':''):'📱💻 휴대폰·컴퓨터 자동 연동 켜기')+' ›</button>';
  /* PC: 빈 공간에 퀘스트창 · 바꿀 장비 · 던전 → 왼쪽(갈 곳·퀘스트창·던전) / 오른쪽(할 일·장비) 두 줄 */
  if(window.innerWidth>=1000){const hq=h.slice(i1,i2),td=h.slice(i2,i3);h=h.slice(0,i1);let qlC='',gC='',dC='';const ql=c.ql||{};const ids=Object.keys(ql).map(Number);
    if(ids.length&&QDB){const R=ids.filter(id=>ql[id]===2&&QDB.has(id)).map(id=>QDB.get(id));const G={};R.forEach(q=>{const z=(q.r&&q.r[1])||q.z;G[z]=(G[z]||0)+1});
      qlC+='<div class="card hpc"><div class="hd"><h3>🎒 퀘스트창</h3><button class="more" data-a="hgo" data-k="log"><b>'+ids.length+'/40</b> 보기 ›</button></div><p class="note">반납 가능 <b>'+R.length+'</b>개 · 하는 중 '+(ids.length-R.length)+'개</p>'
        +(R.length?'<div class="hpz">'+Object.entries(G).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([z,n])=>'<span>'+esc(z)+' <b>'+n+'</b></span>').join('')+'</div>':'')+'</div>'}
    else qlC+='<div class="card hpc"><div class="hd"><h3>🎒 퀘스트창</h3></div><p class="note">게임 퀘스트창을 가져오면 반납할 곳·정리할 퀘스트를 알려 줘요.</p><button class="btn sm ghost" data-a="imp">🧩 게임에서 불러오기</button></div>';
    if(U.length)gC+='<div class="card hpc"><div class="hd"><h3>⬆️ 바꾸면 좋은 장비</h3><button class="more" data-a="tab" data-k="gear">'+U.length+'개 ›</button></div>'+U.slice(0,3).map(x=>upRow(c,x)).join('')+'</div>';
    if(D.length)dC+='<div class="card hpc"><div class="hd"><h3>🏰 지금 갈 만한 던전</h3><button class="more" data-a="tab" data-k="dungeon">던전 ›</button></div>'+D.map(d=>[d,dgState(c,d)]).sort((x,y)=>x[1].all-y[1].all).slice(0,4).map(([d,S])=>'<div class="trow" data-a="dgo" data-k="'+d.slug+'"><span class="m"><b>'+esc(d.ko)+(S.all?' <span class="dgok">✅ 퀘스트 다 함</span>':'')+'</b><span>'+d.lo+'–'+d.hi+'레벨 · '+esc(d.loc||'')+(S.Q.length?' · 퀘스트 '+S.done.length+'/'+S.Q.length:'')+(S.inLog.length?' · 퀘스트창 '+S.inLog.length:'')+(d._v&&d._v.g?' · <b class="hl">⭐ 좋은 템 '+d._v.g+'</b>':'')+'</span></span><span class="r">›</span></div>').join('')+'</div>';
    h+='<div class="hcols"><div>'+hq+qlC+dC+'</div><div>'+td+gC+adC+'</div></div>'}
  else h+=adC;
  return h+'</div>'}
function groupBy(arr,f){const m=new Map();arr.forEach(x=>{const k=f(x);if(!m.has(k))m.set(k,[]);m.get(k).push(x)});return [...m.entries()]}
function abIcon(name,C){if(!C)return '';const l=C.learns.find(x=>x[1]===name);return l?l[5]:''}
function abChip(name,icon,extra,dim){return '<span class="ab'+(dim?' no':'')+'">'+(icon?'<span class="ic" style="background-image:url('+ICO(icon)+')"></span>':'')+esc(name)+(extra?' <span class="l">'+esc(extra)+'</span>':'')+'</span>'}
/* 애드온으로 가져온 가방·은행에 있는지 */
const ownedOf=(c,id)=>c.bag&&c.bag[id]?'bag':c.bank&&c.bank[id]?'bank':null;
const ownTag=(c,id)=>{const o=ownedOf(c,id);return o?'<span class="owt">'+(o==='bag'?'🎒 가방에 있어요':'🏦 은행에 있어요')+'</span>':''};
/* 내 가방·은행의 낄 수 있는 템 전부: 칸마다 지금 것과 비교 */
function bagAll(c){const w=wOf(c);const out=[];
  [['bag',c.bag||{}],['bank',c.bank||{}]].forEach(([where,B])=>Object.keys(B).forEach(k=>{const id=+k;const it=IT.get(id);if(!it||out.some(x=>x.it.id===id)||Object.values(c.eq||{}).includes(id))return;
    const ok=usable(it,c)&&!(it.lv>c.lv&&!it.est);const lvUp=usable(it,c)&&it.lv>c.lv&&!it.est;let best=null;SLOTS.forEach(([sl])=>{if(!fits(it,sl,c))return;const cur=eqIt(c,sl);const g=sc(it,sl,w)-sc(cur,sl,w);if(!best||g>best.g)best={slot:sl,g,cur}});
    if(!best)return;out.push({it,slot:best.slot,g:best.g,cur:best.cur,where,ok,lvUp,n:B[k]})}));
  return out}
/* 🏘️ 마을 들를 때 할 일: 마을(거점)별로 기술 배우기 · 반납 · 받을 퀘스트 · 팔 것 · 은행 · 전문기술 승급을 한 장에 */
const TOWN_CAP=new Set(['스톰윈드','아이언포지','다르나서스']);
function townOf(zone,xy){if(!zone)return null;if(TOWN_CAP.has(zone))return zone;if(!xy)return null;const x=Array.isArray(xy)?xy[0]+','+xy[1]:String(xy);const h=qHub(zone,{xy:x,gz:zone,gv:''});return h&&h[1]<50?h[0]+' · '+zone:null}
function townCard(c){if(!QDB){qdbLoad();return ''}if(!WLD)wldLoad();const L=c.lv;const T=new Map();const add=(town,k,v)=>{if(!town)return;let t=T.get(town);if(!t){t={town,cap:TOWN_CAP.has(town),e:{}};T.set(town,t)}(t.e[k]=t.e[k]||[]).push(v)};
  const rt=myRoute(c);const here=new Set(rt.zs);if(c.lpos&&c.lpos.z)here.add(c.lpos.z);
  /* 반납: 다 한 퀘스트 */for(const [id,v] of Object.entries(c.ql||{})){if(v!==2)continue;const X=QDB.get(+id);if(!X||!X.r||!X.r[2])continue;add(townOf(X.r[1]||X.z,X.r[2]),'turn',{id:+id,nm:X.n})}
  /* 받을 퀘스트: 레벨업 동선 앞 12단계 */
  {if(!ui._st)try{recView(c)}catch(e){}(ui._st||[]).slice(0,12).forEach(s=>{if(s.type!=='get')return;const tw=townOf(s.zone,s.xy);s.items.forEach(it=>add(tw,'get',{id:it.q.id,nm:it.q.nm}))})}
  /* 기술 배우기: 내 직업 교관이 있는 마을 (지금 지역·수도) */
  {const C=D_CLS[c.cls];const ls=(C?C.learns:[]).filter(l=>(!l[4]||l[4]==='alliance')&&(!l[7]||l[7]===c.race));const from=c.trn!=null?c.trn:L-2;const todo=ls.filter(l=>l[0]>from&&l[0]<=L);
   if(todo.length&&WLD)((WLD.tr||{})[c.cls]||[]).forEach(t=>{const tw=townOf(t[1],t[2]);if(tw&&(here.has(t[1])||TOWN_CAP.has(t[1])))add(tw,'learn',{n:todo.length,who:t[0],names:todo.map(l=>l[1])})})}
  /* 전문기술 승급: 숙련도가 등급 끝에 닿음 → 수도 */
  {const up=Object.entries(c.profLv||{}).filter(([,v])=>v&&v[1]<300&&v[0]>=v[1]-5);if(up.length)TOWN_CAP.forEach(z=>up.forEach(([nm,v])=>add(z,'prof',{nm,cur:v[0],max:v[1]})))}
  /* 가방: 팔 것은 어느 마을 상인이든 · 은행은 수도 */
  {const R=c.bag&&BAGDB?bagSort(c):null;if(c.bag&&!BAGDB)bagDbLoad();if(R){const sb=R.G.sell.filter(x=>x.where==='bag');const bk=R.G.bank.filter(x=>x.where==='bag');
    if(bk.length)TOWN_CAP.forEach(z=>add(z,'bank',{n:bk.length}));ui._townSell=sb.length?{n:sb.length,sum:sb.reduce((n,x)=>n+x.I.sell*x.n,0)}:null}}
  const W={turn:3,get:2,learn:3,prof:2,bank:1,sell:0};
  let L2=[...T.values()].map(t=>{let sc=0;for(const k in t.e)sc+=W[k]*(k==='learn'||k==='bank'?1:t.e[k].length);if(t.e.learn)t.e.learn=[t.e.learn[0]];const zn=t.town.split(' · ').pop();return Object.assign(t,{sc,near:here.has(zn)})}).filter(t=>t.sc>0);
  /* 지금 지역 마을 2곳(점수 순) + 할 일이 가장 많은 수도 1곳 · 더 보기면 전부 */
  L2.sort((a,b)=>(b.near-a.near)||(b.sc-a.sc));
  if(!ui.townAll){const nr=L2.filter(t=>t.near&&!t.cap).slice(0,2);const cp=L2.filter(t=>t.cap).sort((a,b)=>b.sc-a.sc)[0];const rest=L2.filter(t=>!nr.includes(t)&&t!==cp);L2=nr.concat(cp?[cp]:[]);while(L2.length<3&&rest.length)L2.push(rest.shift())}else L2=L2.slice(0,8);
  if(!L2.length&&!ui._townSell)return '';
  /* 팔 것은 어느 마을 상인이든 되니 맨 위 마을에만 */if(ui._townSell&&L2[0])L2[0].e.sell=[ui._townSell];
  if(!L2.length)return '';
  const qa=L=>L.slice(0,3).map(x=>'<button class="lnk" data-a="qopen" data-k="'+x.id+'">'+esc(x.nm)+'</button>').join(', ')+(L.length>3?' 외 '+(L.length-3)+'개':'');
  const line=(ic,txt)=>'<li><span class="ti">'+ic+'</span><span>'+txt+'</span></li>';
  let h='<div class="card town"><div class="hd"><h3>🏘️ 마을 들를 때 할 일</h3>'+(T.size>3?'<button class="more" data-a="townall">'+(ui.townAll?'접기':'더 보기')+'</button>':'')+'</div>';
  h+=L2.map(t=>{const e=t.e;let li='';
    if(e.turn)li+=line('📜','반납 <b>'+e.turn.length+'개</b>: '+qa(e.turn));
    if(e.get)li+=line('❗','받기 <b>'+e.get.length+'개</b>: '+qa(e.get));
    if(e.learn)li+=line('📘','기술 <b>'+e.learn[0].n+'개</b> 배우기 · '+esc(e.learn[0].who)+' <small>'+esc(e.learn[0].names.slice(0,3).join(', '))+'</small>');
    if(e.prof)li+=line('⚒️',e.prof.map(p=>esc(p.nm)+' <b>승급</b> ('+p.cur+'/'+p.max+')').join(' · '));
    if(e.bank)li+=line('🏦','은행에 넣을 재료 <b>'+e.bank[0].n+'개</b>');
    if(e.sell)li+=line('💰','상인에게 팔 것 <b>'+e.sell[0].n+'개</b>'+(e.sell[0].sum?' · 약 '+goldTxt(e.sell[0].sum):''));
    return '<div class="twn"><b class="tn">'+esc(t.town)+(t.near?' <span class="tag gd">지금 지역</span>':'')+'</b><ul>'+li+'</ul></div>'}).join('');
  return h+'</div>'}
/* 🧹 가방 정리 도우미: 불러온 가방·은행을 「퀘스트에 씀 · 팔아도 됨 · 내 전문기술 재료 · 은행·경매장」으로 (item-bag.txt는 열 때 받음) */
let BAGDB=null,BAGL=false;
function bagDbLoad(){if(BAGL)return;BAGL=true;fetch('data/qdb/item-bag.txt?v='+((D_VER&&D_VER.bag)||'0')).then(r=>r.ok?r.text():'').then(t=>{const M=new Map();t.split('\n').forEach(l=>{if(!l)return;const f=l.split('|');M.set(+f[0],{nm:f[1],q:+f[2],cls:+f[3],sell:+f[4],ic:f[5]||''})});BAGDB=M;rerender(true)}).catch(()=>{BAGDB=new Map();rerender(true)})}
function myMatIds(c){const S=new Set();const mine=new Set(c.profs||[]);(typeof PROFS!=='undefined'?PROFS:[]).filter(p=>mine.has(p.ko)).forEach(p=>(p.steps||[]).forEach(st=>String(st[4]||'').split(/\s*,\s*|\s*\/\s*/).forEach(t=>{const nm=t.replace(/\s*\(.*\)$/,'').replace(/\s+\d+(?:~\d+)?(\s*등)?$/,'').trim();const id=(typeof D_MATID!=='undefined')&&(D_MATID[nm]||D_MATID[nm.replace(/\s*(꽃잎|잎사귀)$/,'')]);if(id)S.add(id)})));return S}
function questItemNames(c){const N=new Set();for(const id of Object.keys(c.ql||{})){const X=QDB&&QDB.get(+id);((X&&X.t)||[]).forEach(t=>{if(t[0]==='수집'&&t[1])N.add(t[1])});/* 아이템으로 시작한 퀘스트(장인의 계약서 등)는 그 아이템도 있어야 끝낼 수 있음 */if(X&&X.g&&X.g[3]==='item'&&X.g[0])N.add(X.g[0]);const d=QD.get(+id);((d&&d.wf&&d.wf.t)||[]).forEach(t=>{if(t[0])N.add(t[0])})}
  (ui._st||[]).forEach(s=>s.items.forEach(it=>(it.q.cnt||[]).forEach(o=>N.add(o[0]))));return N}
/* 아이템 이름 → 그 아이템을 쓰는 퀘스트(모으기 목표 · 아이템으로 시작) — 가방 정리에서 「어느 퀘스트·몇 레벨」 보여 주기 */
let QIX=null,QIX_SRC=null;
function qItemIdx(){if(!QDB)return null;if(QIX&&QIX_SRC===QDB)return QIX;const M=new Map();
  const add=(nm,id,how)=>{if(!nm)return;let a=M.get(nm);if(!a)M.set(nm,a=[]);if(!a.some(y=>y.id===id))a.push({id,how})};
  QDB.forEach((X,id)=>{(X.t||[]).forEach(t=>{if(t[0]==='수집')add(t[1],id,'모으기')});if(X.g&&X.g[3]==='item')add(X.g[0],id,'시작')});
  QD.forEach((d,id)=>{((d&&d.wf&&d.wf.t)||[]).forEach(t=>add(t[0],+id,'모으기'))});
  QIX=M;QIX_SRC=QDB;return M}
/* 상태: 1 퀘스트창 · 2 반납만 남음 · 0 아직 안 받음 · 3 끝냄 — 퀘스트창 → 안 받음 → 끝냄 순, 같으면 낮은 레벨부터 */
function itemQuests(c,nm){const M=qItemIdx();if(!M)return [];const ql=c.ql||{},mq=c.mq||{};const st=id=>ql[id]===2?2:ql[id]?1:mq[id]?3:0;
  return (M.get(nm)||[]).map(y=>({...y,X:QDB.get(y.id),s:st(y.id)})).filter(y=>y.X&&(y.s===1||y.s===2||(qdbOk(c,y.X)&&!exOut(c,y.X)))).sort(iqCmp)}
const iqCmp=(a,b)=>{const rk=s=>s===1||s===2?0:s===0?1:2;return rk(a.s)-rk(b.s)||(a.X.lv||0)-(b.X.lv||0)||String(a.X.n).localeCompare(String(b.X.n),'ko',{numeric:true})};
function bagSort(c){if(!BAGDB)return null;const eqd=new Set(Object.values(c.eq||{}).map(Number));const E=new Map(bagAll(c).map(x=>[x.it.id,x]));const QN=questItemNames(c);const MM=myMatIds(c);const W=new Set((c.wish||[]).map(Number));
  const G={q:[],sell:[],mat:[],bank:[],other:[]};let sellSum=0;
  [['bag',c.bag||{}],['bank',c.bank||{}]].forEach(([where,B])=>Object.entries(B).forEach(([k,n])=>{const id=+k;if(eqd.has(id))return;const T0=IT.get(id)||{};const I=BAGDB.get(id)||{nm:T0.nm||('아이템 #'+id),q:{p:0,c:1,u:2,r:3,e:4,l:5}[T0.q]??1,cls:T0.sl?(T0.cs&&T0.cs[0]==='2'?2:4):-1,sell:0,ic:T0.ic||''};const x={id,n,where,I};
    if(I.cls===12||QN.has(I.nm)){G.q.push(x);return}
    const e=E.get(id);
    if(e){if(e.ok&&e.g>.5||e.lvUp||W.has(id)||(I.q||0)>=3){G.other.push(x);return}if(I.sell>0){G.sell.push(x);sellSum+=I.sell*n;x.why=e.ok?'지금 낀 게 더 좋아요':'못 끼는 장비'}else G.other.push(x);return}
    if(I.q===0&&I.sell>0){G.sell.push(x);sellSum+=I.sell*n;x.why='잡동사니';return}
    if(I.cls===7||I.cls===5){if(MM.has(id))G.mat.push(x);else G.bank.push(x);return}
    G.other.push(x)}));
  return {G,sellSum}}
/* 아이콘 그림이 안 열릴 때 밑에 깔리는 물음표 그림 */
const IC_Q='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#2a241b"/><text x="16" y="23" font-size="20" font-family="sans-serif" font-weight="700" text-anchor="middle" fill="#8a7a5a">?</text></svg>');
function bagSortCard(c){if(!c.bag)return '';if(!QDB)qdbLoad();if(!BAGDB){bagDbLoad();return '<div class="card bgs"><h3>🧹 가방 정리</h3><p class="note">아이템 자료를 불러오는 중…</p></div>'}
  const R=bagSort(c);if(!R)return '';const {G,sellSum}=R;
  const ql=q=>['p','c','u','r','e','l'][q]||'c';
  /* 아이콘: 게임 아이콘(자료에 있으면) · 없으면 종류별 기본 그림 */
  const DEF={0:'inv_potion_51',1:'inv_misc_bag_07',2:'inv_sword_04',4:'inv_chest_cloth_21',5:'inv_misc_dust_02',7:'inv_fabric_linen_01',9:'inv_scroll_03',12:'inv_misc_note_01',15:'inv_misc_gear_01'};
  const icOf=x=>{const it=IT.get(x.id);const n=x.I.ic||(it&&it.ic)||DEF[x.I.cls]||'inv_misc_questionmark';return 'url('+ICO(n)+'),url('+IC_Q+')'};
  /* 「책 이름 - 10쪽」처럼 쪽만 다른 것은 한 줄로 */
  const grp=L=>{const M=new Map(),out=[];L.forEach(x=>{const m=x.I.nm.match(/^(.+?)\s*-\s*(\d+)쪽$/);if(!m){out.push(x);return}let g=M.get(m[1]);if(!g){g={...x,I:{...x.I,nm:m[1]},pages:[],n:0,qs:[]};M.set(m[1],g);out.push(g)}g.pages.push(+m[2]);(x.qs||[]).forEach(y=>{if(!g.qs.some(z=>z.id===y.id))g.qs.push(y)});g.n+=x.n;if(x.where==='bank')g.where='bank'});
    M.forEach(g=>{g.pages.sort((a,b)=>a-b);g.qs.sort(iqCmp)});return out};
  const row=(x,k)=>{const q=x.I.q==null?1:x.I.q;const sub=[];
    if(x.pages)sub.push(x.pages.length+'장 · '+x.pages.join('·')+'쪽');
    if(x.where==='bank')sub.push('<i class="bk">은행</i>');
    if(x.why)sub.push('<i class="why">'+esc(x.why)+'</i>');
    const pr=k==='sell'&&x.I.sell?'<span class="pr">'+goldTxt(x.I.sell*x.n)+'</span>':'';
    const Q=k==='q'&&x.qs&&x.qs.length?x.qs:null;
    if(Q){const t=Q[0],allDone=Q.every(y=>y.s===3);
      sub.unshift('<span class="qln">「'+esc(t.X.n)+'」 '+(t.X.lv||'?')+'레벨'+(Q.length>1?' 외 '+(Q.length-1)+'개':'')+'</span>'+(t.s===1||t.s===2?'<i class="qst s'+t.s+'">'+QST[t.s]+'</i>':allDone?'<i class="qst s3">끝낸 퀘스트</i>':''));
      return '<details class="bgq"><summary class="bgi"><span class="ic q-'+ql(q)+'" style="background-image:'+icOf(x)+'">'+(x.n>1&&!x.pages?'<em>'+x.n+'</em>':'')+'</span><span class="m"><b class="q'+q+'">'+esc(x.I.nm)+'</b><small>'+sub.join(' ')+'</small></span><i class="cv"></i></summary><div class="bgqs">'
        +Q.map(y=>'<button class="bgqq" data-a="qopen" data-k="'+y.id+'"><b>'+esc(y.X.n)+'</b><small>'+(y.X.lv||'?')+'레벨'+(y.X.m?' (받기 '+y.X.m+'레벨부터)':'')+' · '+esc(y.X.z||'')+(y.how==='시작'?' · 이 아이템으로 시작':'')+' <i class="qst s'+y.s+'">'+QST[y.s]+'</i></small></button>').join('')+'</div></details>'}
    return '<div class="bgi"><span class="ic q-'+ql(q)+'" style="background-image:'+icOf(x)+'">'+(x.n>1&&!x.pages?'<em>'+x.n+'</em>':'')+'</span><span class="m"><b class="q'+q+'">'+esc(x.I.nm)+'</b>'+(sub.length?'<small>'+sub.join(' ')+'</small>':'')+'</span>'+pr+'</div>'};
  /* 나머지(물약·음식·도안·열쇠·장비 등)도 빠짐없이: 종류 이름을 붙여 「가방에 두기」로 */
  const QST=['아직 안 받음','퀘스트창','반납만 남음','끝냄'];
  G.q.forEach(x=>{x.qs=itemQuests(c,x.I.nm)});
  const KIND={0:'물약·음식',1:'가방',2:'장비',4:'장비',9:'도안·조리법',13:'열쇠',15:'기타'};
  G.other.forEach(x=>{if(!x.why)x.why=KIND[x.I.cls]||'기타'});
  const SEC=[['q','inv_misc_note_06','퀘스트에 써요','누르면 어느 퀘스트에 쓰는지 · 몇 레벨인지 나와요',G.q,true],['sell','inv_misc_coin_01','팔아도 돼요',sellSum?'상점에 팔면 약 '+goldTxt(sellSum):'',G.sell,true],
    ['mat','inv_fabric_linen_01','내 전문기술 재료',(c.profs||[]).join('·'),G.mat,false],['bank','inv_box_01','은행·경매장으로',(c.profs||[]).length?'내 전문기술에 안 쓰는 재료':'전문기술을 앱에 넣으면 쓰는 재료는 따로 빼 줘요',G.bank,false],['keep','inv_misc_bag_10','가방에 두기','물약·음식·도안·열쇠·장비 등 — 장비는 아래 「내 가방·은행 장비」에서 비교',G.other,false]];
  const sec=([k,e,t,sub,L,open])=>{if(!L.length)return '';const R2=grp(L.slice().sort((a,b)=>a.I.nm.localeCompare(b.I.nm,'ko')));
    return '<details class="bgsg g-'+k+'"'+(open?' open':'')+'><summary>'+gic(e,'e')+'<b>'+t+'</b><span class="n">'+L.length+'</span>'+(sub?'<small>'+sub+'</small>':'')+'<i class="cv"></i></summary><div class="bgl">'+R2.map(x=>row(x,k)).join('')+'</div></details>'};
  let h='<div class="card bgs"><div class="bgh"><h3>🧹 가방 정리</h3>'+(c.imported?'<small>'+armAgo(c.imported.t)+' 가져온 가방·은행</small>':'')+'</div>';
  const tiles=SEC.filter(x=>x[4].length);
  const TL={q:'퀘스트',sell:'팔 것',mat:'내 재료',bank:'은행·경매',keep:'가방에 두기'};
  if(tiles.length)h+='<div class="bgt">'+tiles.map(([k,e,t,,L])=>'<span class="t g-'+k+'">'+gic(e,'lg')+'<b>'+L.length+'</b><small>'+TL[k]+'</small></span>').join('')+'</div>';
  h+=SEC.map(sec).join('');
  if(!tiles.length)h+='<p class="note">정리할 게 없어요.</p>';
  return h+'<p class="note bgn">장비 비교는 아래 「내 가방·은행 장비」에서 봐요 · 고급(파랑) 이상·찜한 템은 팔 것에서 뺐어요.</p></div>'}
function bagView(c){return bagSortCard(c)+bagView0(c)}
function bagView0(c){const A=bagAll(c);if(!c.bag)return '<div class="card"><p class="note">게임 애드온으로 가방·은행을 가져오면, 안에 든 장비를 지금 낀 것과 비교해 줘요.</p><button class="btn sm" data-a="imp">🧩 게임에서 가져오기</button></div>';
  const up=A.filter(x=>x.ok&&x.g>.5).sort((a,b)=>b.g-a.g),same=A.filter(x=>x.ok&&x.g<=.5&&x.g>=-.5),down=A.filter(x=>x.ok&&x.g<-.5).sort((a,b)=>a.g-b.g),soon=A.filter(x=>x.lvUp).sort((a,b)=>a.it.lv-b.it.lv),no=A.filter(x=>!x.ok&&!x.lvUp);
  const row=x=>'<div class="row tap bgr" data-a="cmpq" data-k="'+x.slot+':'+x.it.id+'">'+itIcon(x.it)+'<span class="m"><span class="sub">'+(x.where==='bank'?'🏦 은행':'🎒 가방')+(x.cur?' · 지금: '+esc(x.cur.nm):' · 지금 비어 있음')+'</span><span class="nm"><em class="slc">'+SLOT_KO[x.slot]+'</em>'+itName(x.it)+'</span>'+diffHtml(x.it,x.cur,c)+'</span>'
    +(x.ok?(x.g>.5?'<button class="btn sm" data-a="equip" data-k="'+x.slot+'" data-id="'+x.it.id+'">끼기 +'+(x.g>=10?Math.round(x.g):x.g.toFixed(1))+'</button>':'<span class="gain '+(x.g<-.5?'no" style="color:var(--bad)':'no')+'">'+(x.g<-.5?'−'+(x.g<=-10?Math.round(-x.g):(-x.g).toFixed(1))+'점':'비슷해요')+'</span>'):'<span class="gain no">'+(x.lvUp?x.it.lv+'레벨부터':'못 껴요')+'</span>')+'</div>';
  const at=c.imported?armAgo(c.imported.t)+' 가져온 가방·은행':'';
  let h='<div class="card"><h3>🎒 내 가방·은행 장비 <small class="mute">'+A.length+'개 · '+at+'</small></h3>'+(c.bank?'':'<p class="note">은행은 게임에서 한 번 열고 다시 가져오면 같이 보여요.</p>');
  if(!A.length)h+='<p class="note">가방·은행에 낄 수 있는 장비가 없어요.</p>';
  if(up.length)h+=gSec('good','끼면 좋아져요',up.length,'')+up.map(row).join('');
  if(same.length)h+=gSec('same','비슷해요',same.length,'')+same.map(row).join('');
  if(soon.length)h+=gSec('soon','레벨 오르면 낄 수 있어요',soon.length,'')+soon.map(row).join('');
  if(down.length)h+=gSec('bad','지금 게 더 좋아요',down.length,'팔거나 정리해도 돼요')+down.map(row).join('');
  if(no.length)h+='<details class="bgno"><summary>🚫 이 직업·레벨로 못 끼는 것 '+no.length+'개</summary>'+no.map(row).join('')+'</details>';
  return h+'</div>'}
/* 바꿀 것들을 얻는 곳별로 묶기: 던전 한 번 · 퀘스트 · 몹 · 상인 */
/* 지금 레벨 구간 동선: 지역·퀘스트·계획에 넣은 던전 */
function myRoute(c){const L=c.lv;const R=routeOf(c);const S=R.find(S=>L>=S.a&&L<=S.b)||R.find(S=>S.a>L);const N=S?R[R.indexOf(S)+1]:null;
  const zs=new Set([].concat(S?S.z.split(' · '):[],N&&N.a<=L+3?N.z.split(' · '):[]));const q=new Set([].concat(S?S.q.map(x=>x.id):[],N&&N.a<=L+3?N.q.map(x=>x.id):[]));
  return {zs,q,dg:new Set(c.pdg||[])}}
const onRouteQ=(rt,q)=>!!q&&(rt.q.has(q)||(QDB&&QDB.get(q)&&rt.zs.has(QDB.get(q).z)));
function upPlaces(c,U){const M=new Map();const rt=myRoute(c);
  U.forEach(x=>{if(ownedOf(c,x.it.id)||!(x.g>=.5||x.empty))return;const S=srcLeft(x.it,c).filter(srcSure);const s=S.find(s=>s.k===0)||S.find(s=>s.k===1)||S[0];if(!s)return;
    let k,nm,ic,a=null,ak=null;
    let on=false;
    if(s.k===0||(s.k===1&&/^dg:/.test(s.href||''))){const dg=s.dg||(s.href||'').replace('dg:','').split('#')[0];const d=DG[dg];k='dg:'+dg;nm=(d?d.ko:s.dn||'던전')+(d?' · '+d.lo+'–'+d.hi:'');ic='🏰';a='dgo';ak=dg;on=rt.dg.has(dg)}
    else if(s.k===1){const q=srcQid(s);k='q:'+(q||s.qn);nm='퀘스트 「'+s.qn+'」'+((c.ql||{})[q]?' · 퀘스트창에 있어요':'');ic='📜';if(q){a='qopen';ak=q};on=!!(c.ql||{})[q]||onRouteQ(rt,q)}
    else if(s.k===5){k='v:'+s.label;nm=s.label.replace('상인 · ','상인 ');ic='🛒'}
    else{k='m:'+s.label;nm=s.label.replace('드랍 · ','')+' 잡기';ic='⚔️'}
    const g=M.get(k)||{k:ak,a,nm,ic,its:[],g:0,on};g.its.push(x);g.g+=x.g;M.set(k,g)});
  return [...M.values()].sort((a,b)=>(b.on-a.on)||b.its.length-a.its.length||b.g-a.g)}
/* 가방·은행 템 중 지금보다 좋은 것 */
function bagUps(c){const w=wOf(c);const out=[];const seen=new Set();
  [['bag',c.bag||{}],['bank',c.bank||{}]].forEach(([where,B])=>Object.keys(B).forEach(k=>{const id=+k;const it=IT.get(id);if(!it||seen.has(id)||!usable(it,c)||(it.lv>c.lv&&!it.est)||Object.values(c.eq||{}).includes(id))return;
    let best=null;SLOTS.forEach(([sl])=>{if(!fits(it,sl,c)||offLocked(c,sl))return;const cur=eqIt(c,sl);if(cur&&cur.id===id)return;const g=sc(it,sl,w)-sc(cur,sl,w);if(g>.5&&(!best||g>best.g))best={it,slot:sl,g,base:sc(cur,sl,w),where}});
    if(best){seen.add(id);out.push(best)}}));
  return out.sort((a,b)=>b.g-a.g)}
/* 🎮 애드온 툴팁용 추천 코드: WFR1;U:번호-점수×10-칸.…;W:찜 */
function wfrCode(c){const U=[];const seen=new Set();SLOTS.forEach(([sl])=>{if(offLocked(c,sl))return;bestFor(c,sl,c.lv,ui.ifil||'ok').slice(0,6).forEach(x=>{if(seen.has(x.it.id))return;seen.add(x.it.id);U.push(x.it.id.toString(36)+'-'+Math.max(1,Math.round(x.g*10))+'-'+sl)})});
  const W=(c.wish||[]).map(id=>(+id).toString(36));const P=rwPicks(c).map(([q,i])=>q.toString(36)+'-'+i.toString(36));
  const N=nextStops(c).map(x=>x.join('~'));
  /* 게임 안 길 안내(애드온 v3.7): 레벨업 탭 단계 = 종류~곳~지역~x~y~퀘스트번호들 */
  const S=navSteps(c).map(x=>x.join('~'));
  return {code:'WFR1;U:'+U.join('.')+';W:'+W.join('.')+';P:'+P.join('.')+';N:'+N.join('^')+';S:'+S.join('^'),n:U.length,w:W.length,p:P.length,nx:N.length,ns:S.length}}
function navSteps(c){try{if(!QDB)return [];if(ui.tab!=='quest'||ui.qmode!=='rec'||!ui._st)recView(c);const ST=ui._st||[];const cl=t=>String(t||'').replace(/[~^;]/g,' ').trim();const T={get:'g',do:'d',turn:'t'};
  return ST.slice(0,25).map(s=>[T[s.type]||'d',cl(s.place).slice(0,40),cl(s.zone),s.xy?Math.round(s.xy[0]*10)/10:'',s.xy?Math.round(s.xy[1]*10)/10:'',[...new Set(s.items.map(it=>it.q.id))].map(i=>i.toString(36)).join('.')])}catch(e){return []}}
/* 게임 /wfh 다음 용: 지금 구간에서 남은 들를 곳 6개 [곳, 지역, x, y, 할 퀘스트 수] */
function nextStops(c){const L=c.lv;const S0=routeOf(c).find(S=>L>=S.a&&L<=S.b);if(!S0)return [];const cl=t=>String(t||'').replace(/[~^;]/g,' ').trim();
  return nowPlan(c,S0).filter(H=>H.i<97&&(H.get.some(x=>!x.done&&!x.prof)||H.turn.some(x=>!x.done))).slice(0,6).map(H=>{const m=String(H.n).match(/^(.*?) \((\d+), (\d+)\)$/);const xy=H.xy||(m?[+m[2],+m[3]]:null);
    return [cl(H.npc?H.npc:(m?m[1]:H.n)),cl(H.z),xy?Math.round(xy[0]):'',xy?Math.round(xy[1]):'',H.get.filter(x=>!x.done&&!x.prof).length+H.turn.filter(x=>!x.done).length]})}
/* 퀘스트 보상 고르기: 퀘스트창·지금/다음 구간·던전 퀘스트 중 「골라 받는 보상」이 있는 것 → [퀘스트, 템] */
function rwChoices(id){const R=qRw(id);if(R&&R.ch&&R.ch.length)return R.ch.map(x=>x[0]);const d=dgOfQ(id);const q=d&&d.q.find(x=>x.id===id);return q&&q.choose&&q.rw.length>1?q.rw:[]}
function rwPickFor(c,id){const ch=rwChoices(id);if(ch.length<2)return 0;const pk=(c.rwPick||{})[id];if(pk&&ch.includes(pk))return pk;let bi=0,bg=.01;ch.forEach(i=>{const it=IT.get(i);if(it&&usable(it,c)){const b=bestSlot(it,c);if(b&&b.g>bg){bg=b.g;bi=i}}});return bi}
function rwPicks(c){const L=c.lv;const ids=new Set(Object.keys(c.ql||{}).map(Number));Object.keys(c.rwPick||{}).forEach(k=>ids.add(+k));
  routeOf(c).filter(S=>S.b>=L-1&&S.a<=L+6).forEach(S=>S.q.forEach(q=>{if(q.id)ids.add(q.id)}));dgNow(L).forEach(d=>dqOf(c,d).forEach(q=>ids.add(q.id)));
  const out=[];ids.forEach(id=>{const i=rwPickFor(c,id);if(i)out.push([id,i])});return out.slice(0,150)}
function wfrSheet(c){const R=wfrCode(c);return '<div class="sh"><h2>🎮 게임 툴팁에 앱 추천 넣기</h2><button class="x" data-a="close">✕</button></div>'
  +'<p class="note">게임에서 템에 마우스를 올리면 「<b>와포 추천 · 머리 지금보다 +11</b>」, 찜한 템은 「⭐ 앱에서 찜한 템」이 붙어요. 칸마다 추천 6개까지, 모두 <b>'+R.n+'개</b>'+(R.w?' · 찜 '+R.w+'개':'')+'.'+(R.p?' 퀘스트 보상 고르기 <b>'+R.p+'개</b>도 들어 있어서, 퀘스트를 반납할 때 고를 템을 알려 줘요 (애드온 v3.2).':'')+(R.nx?' 게임에서 <code>/wfh 다음</code> 하면 앱 동선의 다음 갈 곳 '+R.nx+'곳을 보여 줘요.':'')+'</p>'+(R.ns?'<p class="note ok">🧭 <b>게임 안 길 안내 '+R.ns+'단계</b>도 들어 있어요. 넣으면 화면에 다음 목적지와 방향 화살표가 뜨고, 퀘스트를 받거나 반납하면 저절로 다음 단계로 넘어가요. 끄고 켜기: <code>/wfh 길</code> (애드온 v3.7)</p>':'')
  +'<ol class="imps"><li>아래 코드를 <b>복사</b></li><li>게임 채팅창에 <code>/wfh 추천</code> → 뜬 칸에 <b>Ctrl+V</b> → 확인</li></ol>'
  +'<textarea class="inp" rows="4" readonly onclick="this.select()">'+esc(R.code)+'</textarea><button class="btn full" data-a="wfrcp">코드 복사</button>'
  +'<p class="note">장비를 바꾸거나 레벨이 오르면 추천이 달라지니, 가끔 새로 넣어 주세요. 애드온 v3부터 돼요.</p>'}
/* 템 능력치 한 줄 (내 직업에 중요한 순) — 점수만 보면 감이 안 와서 */
const dif2=(a,b,c)=>b?diffHtml(a,b,c).replace('<span class="dif">','<span class="dif"><em>지금보다</em> '):'';
/* 주문력·치유량이 같이 붙은 템: 힐러는 치유량, 나머지는 주문력 하나만 */
/* 포에버는 적중·치명타가 근접·주문 공통(normST)이라 같은 값이면 「적중 %」를 한 번만 보여 줌 */
const SHDUP=(k,st)=>(k==='shit'&&Math.abs((st.hit||0)-(st.shit||0))<.01)||(k==='scrit'&&Math.abs((st.crit||0)-(st.scrit||0))<.01);
const dupSH=(k,st,w)=>(k==='shit'&&st.hit===st.shit&&(w.hit||0)>=(w.shit||0))||(k==='hit'&&st.hit===st.shit&&(w.shit||0)>(w.hit||0))||(k==='scrit'&&st.crit===st.scrit&&(w.crit||0)>=(w.scrit||0))||(k==='crit'&&st.crit===st.scrit&&(w.scrit||0)>(w.crit||0))||(w.heal&&!(w.sp>0)?(k==='sp'&&st.heal>=st.sp):(k==='heal'&&st.sp>=st.heal));
function itStats(it,c){if(!it||!it.st)return '';const w=wOf(c);const st=it.st;const ks=Object.keys(st).filter(k=>STAT_KO[k]&&st[k]&&!dupSH(k,st,w)&&!(k==='armor'&&!w.armor&&it.cs!=='4.6'));
  if(!ks.length)return '';ks.sort((a,b)=>((w[b]||0)*Math.abs(st[b])+(b==='dps'?99:0))-((w[a]||0)*Math.abs(st[a])+(a==='dps'?99:0)));
  return '<span class="its">'+ks.map(k=>{const v=st[k];const pct=/ %$/.test(STAT_KO[k]);const nm=k==='dps'?'초당 공격력':pct?STAT_KO[k].slice(0,-2):STAT_KO[k];const use=(w[k]||(k==='dps'&&(w.dps||w.rdps)))?'':' class="dim"';
    return '<i'+use+'>'+nm+' '+(v<0?'−':'')+(k==='dps'||(pct&&Math.abs(v)%1)?Math.abs(v).toFixed(1):Math.round(Math.abs(v)))+(pct?'%':'')+'</i>'}).join('')+'</span>'}
/* 바꿀 것 한 줄 (접힘): 칸·템·핵심 능력치·이득 → 누르면 지금보다·얻는 곳·버튼 */
/* 바꿀 것 한 화면: 가방 템 + 지금 바꿀 것(곧 더 좋은 게 오면 한 줄 덧붙임) + 곧만 있는 칸, 위에 얻는 곳 칩 */
function upAll(c,nowU,soonU){const nE=SLOTS.filter(([sl])=>!offLocked(c,sl)).length;
  const BU=bagUps(c);const bagBy={};BU.forEach(x=>{if(!bagBy[x.slot])bagBy[x.slot]=x});
  const soonBy={};soonU.forEach(x=>{soonBy[x.slot]=x});
  let rows=[];const used=new Set();
  nowU.forEach(x=>{const b=bagBy[x.slot];if(b&&b.g>=x.g*.7){rows.push(Object.assign({bag:1},b));used.add(x.slot);return}const s=soonBy[x.slot];rows.push(Object.assign({},x,{nx:s&&s.it.id!==x.it.id&&s.g>x.g+1?s:null}));used.add(x.slot)});
  BU.forEach(b=>{if(!used.has(b.slot)){rows.push(Object.assign({bag:1},b));used.add(b.slot)}});
  rows.sort((a,b)=>(b.bag||0)-(a.bag||0)||(b.empty-a.empty)||b.g-a.g);
  const later=soonU.filter(x=>!used.has(x.slot)).sort((a,b)=>b.g-a.g);
  /* 얻는 곳 칩 */
  const G=upPlaces(c,rows.filter(x=>!x.bag));const f=ui.upf&&G.find(g=>g.nm===ui.upf)?ui.upf:null;const fG=f?G.find(g=>g.nm===f):null;const inF=x=>!fG||fG.its.some(y=>y.it.id===x.it.id);
  let h='<div class="card ulist"><div class="ulh"><h3>⬆️ 바꿀 것 <small class="mute">'+rows.length+'칸'+(later.length?' · 곧 '+later.length+'칸':'')+'</small></h3><span class="mute">큰 순서 · 눌러서 자세히</span></div>';
  if(G.length>1)h+='<div class="upf"><button class="'+(f?'':'on')+'" data-a="upf" data-k="">전체</button>'+G.slice(0,6).map(g=>'<button class="'+(f===g.nm?'on':'')+(g.on?' rt':'')+'" data-a="upf" data-k="'+esc(g.nm)+'">'+g.ic+' '+esc(g.nm.replace(/ · \d+–\d+$/,'').replace(/^퀘스트 「(.+)」.*$/,'「$1」').replace(/^붉은십자군 수도원: /,'붉은십자군 '))+' <b>'+g.its.length+'</b></button>').join('')+'</div>'
    +(fG&&fG.a?'<button class="upgo" data-a="'+fG.a+'" data-k="'+esc(String(fG.k))+'">'+fG.ic+' '+esc(fG.nm)+' 보러 가기 ›</button>':'');
  const R=rows.filter(inF);
  h+=(R.length?R.map(x=>uRow(c,x)).join(''):'<p class="note">'+(f?'이 곳에서 바꿀 건 없어요.':'지금 레벨에서 더 좋은 장비가 없어요 👍')+'</p>');
  if(!f&&later.length)h+=gSec('soon','레벨 오르면 바꿀 것',later.length,'')+later.map(x=>uRow(c,x,1)).join('');
  if(!f&&nE-rows.length-later.length>0)h+='<p class="uok">✓ 나머지 '+(nE-rows.length-later.length)+'칸은 지금 장비가 제일 좋아요</p>';
  if(!f&&(c.nogo||[]).length)h+='<p class="note">🚫 「못 얻어요」로 뺀 장비 '+c.nogo.length+'개는 추천에서 빼고 있어요 · <button class="lnk" data-a="nogoclr" data-k="*">모두 다시 넣기</button></p>';
  return h+'</div>'}
/* 장비 목록의 묶음 제목(가방 정리 카드와 같은 모양): 색 띠 · 제목 · 개수 · 설명 */
function gSec(k,t,n,sub){return '<div class="gsec g-'+k+'"><b>'+t+'</b><span class="n">'+n+'</span>'+(sub?'<small>'+sub+'</small>':'')+'</div>'}
function uRow(c,x,soon){const cur=eqIt(c,x.slot);const it=x.it;const st=it.st||{};const w=wOf(c);
  const top=Object.keys(st).filter(k=>STAT_KO[k]&&st[k]>0&&(w[k]||(k==='dps'&&(it.sl==='ra'?w.rdps:w.dps)))&&!dupSH(k,st,w)).sort((a,b)=>(k=>k==='dps'?1e3:(w[k]||0)*st[k])(b)-(k=>k==='dps'?1e3:(w[k]||0)*st[k])(a)).slice(0,3)
    .map(k=>{const pct=/ %$/.test(STAT_KO[k]);return (k==='dps'?'초당':pct?STAT_KO[k].slice(0,-2):STAT_KO[k].replace(' 주문력',''))+' '+(k==='dps'||(pct&&st[k]%1)?st[k].toFixed(1):Math.round(st[k]))+(pct?'%':'')}).join(' · ');
  const r=x.g/Math.max(x.base,4);const cls=x.empty?'new':r>=.5?'big':r>=.2?'mid':'sm';
  return '<details class="ur"><summary>'+itIcon(it)+'<span class="m"><span class="t"><em>'+esc(SLOT_KO[x.slot])+'</em>'+itName(it)+'</span><span class="s">'+(top?esc(top):'')+(guideHas(c,it.id)?' <i class="gd">📘</i>':'')+(soon?' · '+(it.ob||it.lv)+'레벨':'')+'</span>'+(x.bag?'<span class="s bagt">'+(x.where==='bank'?'🏦 은행에 있어요':'🎒 가방에 있어요')+' · 바로 끼세요</span>':'')+(x.nx?'<span class="s nxl">🔜 '+(x.nx.it.ob||x.nx.it.lv)+'레벨 '+esc(x.nx.it.nm)+' <b>+'+(x.nx.g>=10?Math.round(x.nx.g):x.nx.g.toFixed(1))+'</b></span>':'')+'</span><span class="ug '+cls+'">'+(x.empty?'빈 칸':'+'+(x.g>=10?Math.round(x.g):x.g.toFixed(1)))+'</span></summary>'
    +'<div class="urb">'+itStats(it,c)+dif2(it,cur,c)+'<p class="sub">'+(cur?'지금: '+esc(cur.nm)+' · ':'')+esc(srcTxt(it,1))+' · '+(it.ob>it.lv?it.ob+'레벨쯤 얻음':'Lv '+it.lv)+luckTag(it,c)+guideTag(it,c)+skTag(it,c)+bothTag(it)+'</p>'
    +(x.nx?'<p class="sub">🔜 '+(x.nx.it.ob||x.nx.it.lv)+'레벨쯤: <b>'+esc(x.nx.it.nm)+'</b> · '+esc(srcTxt(x.nx.it,1))+' <button class="lnk" data-a="cmpq" data-k="'+x.slot+':'+x.nx.it.id+'">보기</button></p>':'')+'<div class="ura"><button class="btn sm" data-a="cmpq" data-k="'+x.slot+':'+it.id+'">비교·자세히</button><button class="btn sm ghost" data-a="wish" data-k="'+it.id+'">'+(isWish(c,it.id)?'⭐ 찜함':'☆ 찜')+'</button><button class="btn sm ghost" data-a="nogo" data-k="'+it.id+'">🚫 못 얻어요</button></div></div></details>'}
function upRow(c,x){const cur=eqIt(c,x.slot);return '<div class="row tap" data-a="cmpq" data-k="'+x.slot+':'+x.it.id+'">'+itIcon(x.it)+'<span class="m"><span class="sub">'+SLOT_KO[x.slot]+(cur?' · 지금: '+esc(cur.nm):'')+'</span><span class="nm">'+wishMark(c,x.it.id)+itName(x.it)+ownTag(c,x.it.id)+luckTag(x.it,c)+guideTag(x.it,c)+skTag(x.it,c)+bothTag(x.it)+(x.it.id>=200000?' <span class="tag fv" title="와우 포에버에서 새로 생긴 템">포에버 신규</span>':'')+((x.it.ob||x.it.lv)>=c.lv-1&&(x.it.ob||x.it.lv)<=c.lv?' <span class="tag new">🆕</span>':'')+'</span>'+itStats(x.it,c)+dif2(x.it,cur,c)+'<span class="sub">'+esc(srcTxt(x.it,1))+' · '+(x.it.ob>x.it.lv?x.it.ob+'레벨쯤 얻음':'Lv '+x.it.lv)+'</span></span><span class="r">'+gainTag(x.g,x.base,x.empty)+'<br>'+infoBtn(x.it)+'</span></div>'}

/* ===================== 장비 (전투정보실 모양) ===================== */
const DOLL_L=['head','neck','shoulder','back','chest','wrist'],DOLL_R=['hands','waist','legs','feet','ring1','ring2','trink1','trink2'],DOLL_B=['main','off','ranged'];
const HEALER_NOTE={paladin:1,shaman:1,druid:1};
function offLocked(c,s){return s==='off'&&eqIt(c,'main')&&eqIt(c,'main').sl==='2h'}
function bestFor(c,slot,L,mode){const w=wOf(c);const cur=eqIt(c,slot);const other=slot==='ring1'?'ring2':slot==='ring2'?'ring1':slot==='trink1'?'trink2':slot==='trink2'?'trink1':null;const skip=other&&c.eq[other];
  const base=slot==='main'?sc(cur,'main',w):sc(cur,slot,w);
  const ng=c.nogo||[];return cands(c,slot,L,mode).filter(x=>x.it.id!==(cur&&cur.id)&&x.it.id!==skip&&!ng.includes(x.it.id)).map(x=>{const b=slot==='main'&&x.it.sl==='2h'?sc(cur,'main',w)+sc(eqIt(c,'off'),'off',w):base;return {it:x.it,s:x.s,g:x.s-b,base:b}}).filter(x=>x.g>.01).sort((a,b)=>b.g-a.g)}
function dollCell(c,s,ups){const it=eqIt(c,s);const sel=ui.gslot===s;const lock=offLocked(c,s);
  return '<button class="dc'+(sel?' sel':'')+(it?'':' empty')+'" data-a="gsel" data-k="'+s+'"'+(lock?' disabled':'')+' aria-label="'+SLOT_KO[s]+(it?' '+esc(it.nm):' 비어 있음')+'">'
   +(it?'<span class="ic lg q-'+it.q+'" data-tip="'+it.id+'" data-ts="'+s+'" style="background-image:url('+(it.icUrl||ICO(it.ic))+')"></span>':'<span class="ic lg empty">'+(lock?'2H':SLOT_KO[s].replace(/ \d/,''))+'</span>')
   +(ups.has(s)?'<span class="up">▲</span>':'')+'</button>'}
function hitCapHtml(c){if(isTank(c))return '';const h=hitInfo(c);const row=(nm,v,cap)=>{const st=v>=cap?'full':v>=cap-1?'near':'low';return '<div class="hcap '+st+'"><span>'+nm+'</span><b>'+v+'%</b><i style="width:'+Math.min(100,v/cap*100)+'%"></i><small>상한 '+cap+'%'+(st==='full'?' · 다 찼어요':st==='near'?' · 거의':'')+'</small></div>'};
  return '<div class="hcaps">'+row('적중',h.hit,h.cap)+(h.phys?row('회피·막기 감소',h.exp,h.ecap):'')+'<p class="note">'+((c.lv||60)>=58?'보스 기준':'레벨업 기준(몹 1~2레벨 위)')+' · 장비'+(RACE_HIT[c.race]?'+종족':'')+'만 셈, 특성 적중은 빼고 · 상한 넘으면 그 능력치 점수를 낮춰요</p></div>'}
function statTotals(c,extra,minus,slotOf){const tot={};SLOTS.forEach(([s])=>{let it=eqIt(c,s);if(slotOf&&s===slotOf)it=extra;if(slotOf==='main'&&extra&&extra.sl==='2h'&&s==='off')it=null;if(it)for(const k in it.st){if(k==='dps'||k==='armor')continue;tot[k]=(tot[k]||0)+it.st[k]}});return tot}
/* 이중 특성 (40레벨~): 둘째 특성으로 보기 · 두 특성 다 좋은 템 표시 */
function dspOn(c){return (c.lv||1)>=40&&c.spec2&&c.spec2!==c.spec}
function dspView(c){if(ui.dsp==='2'&&dspOn(c))return Object.assign({},c,{spec:c.spec2,_dsp:2});return c}
function dspOther(c){if(!dspOn(me()||c))return null;const r=me();return c._dsp===2?r:Object.assign({},r,{spec:r.spec2,_dsp:2})}
function dspSeg(c){if((c.lv||1)<40)return '';const r=me();const C=D_CLS[r.cls];if(!C)return '';const nm=id=>(C.specs.find(x=>x.id===id)||{}).name||id;const ic=id=>gic((C.specs.find(x=>x.id===id)||{}).icon);
  return '<span class="gseg dsp"><button class="'+(c._dsp===2?'':'on')+'" data-a="dsp" data-k="1">'+ic(r.spec)+'<span>'+esc(nm(r.spec))+'</span></button><button class="'+(c._dsp===2?'on':'')+'" data-a="dsp" data-k="2">'+(r.spec2&&r.spec2!==r.spec?ic(r.spec2)+'<span>'+esc(nm(r.spec2))+'</span>':'<span>둘째 특성 +</span>')+'</button>'+(c._dsp===2?'<button data-a="dsp2" data-k="" title="둘째 특성 바꾸기">↺</button>':'')+'</span>'}
function dspPick(c){const r=me();const C=D_CLS[r.cls];return '<div class="card dspk"><b>둘째 특성 고르기</b><p class="note">40레벨부터 직업 교관에게서 이중 특성을 열 수 있어요. 고르면 그 특성 기준 추천을 따로 보고, 두 특성에 다 좋은 템은 🔁 로 표시해요.</p><div class="chips">'+C.specs.filter(x=>x.id!==r.spec).map(x=>'<button class="chip" data-a="dsp2" data-k="'+x.id+'">'+esc(x.name)+'</button>').join('')+'</div></div>'}
const bothTag=it=>ui._both&&ui._both.has(it.id)?' <span class="lkt both" title="다른 특성에도 바꾸면 좋은 템이에요">🔁 두 특성 다</span>':'';
function gear(c){const L=c.lv,w=wOf(c);const C=CINFO[c.cls];const sp=specOf(c);
  {const oc=dspOther(c);ui._both=oc?new Set(SLOTS.flatMap(([s])=>offLocked(oc,s)?[]:bestFor(oc,s,L,ui.ifil||'ok').slice(0,6).map(x=>x.it.id))):null}
  const ups=new Set(SLOTS.map(x=>x[0]).filter(s=>!offLocked(c,s)&&bestFor(c,s,L,ui.ifil).length));
  const tot=statTotals(c);const keys=Object.entries(w).filter(([k,v])=>STAT_KO[k]&&k!=='armor'&&k!=='dps'&&k!=='rdps'&&v>=.2).sort((a,b)=>b[1]-a[1]).map(([k])=>k).slice(0,6);
  const nEq=SLOTS.filter(([sl])=>eqIt(c,sl)).length,nAll=SLOTS.filter(([sl])=>!offLocked(c,sl)).length;
  const nowU=upgrades(c,L,ui.ifil),myS=Math.round(eqScore(c)),upS=Math.round(nowU.reduce((a,x)=>a+(x.g||0),0));
  let h='<div class="wrap g2"><div class="gL"><details class="dollf"'+((isPC()||(ui.dollf??false))?' open':'')+' data-tg="dollf"><summary><span class="ic" style="background-image:url('+ICO('classicon_'+c.cls)+')"></span><b>내 장비 칸</b><small>착용 '+nEq+'/'+nAll+' · 점수 <b class="gscs">'+myS+'</b>'+(ups.size?' · <em>▲ '+ups.size+'칸 더 좋은 게 있어요</em>':'')+'</small><span class="chev">⌄</span></summary><div class="armory"><div class="acol">'+DOLL_L.map(s=>dollCell(c,s,ups)).join('')+'</div>'
   +'<div class="amid"><span class="ic xl" style="background-image:url('+ICO('classicon_'+c.cls)+')"></span><b style="color:'+C[1]+'">'+esc(c.name||C[0])+'</b><small>레벨 '+L+' '+esc((sp?sp.name+' ':'')+C[0])+'</small>'
   +'<div class="gsc" title="착용 장비 능력치 × 내 전문화 점수표를 모두 더한 값"><b>'+myS+'</b><span>장비 점수</span>'+(upS>=1?'<em>추천대로 바꾸면 +'+upS+'</em>':'')+'</div>'
   +'<div class="ast">'+keys.map(k=>'<div><span>'+STAT_KO[k].replace(' 주문력','')+'</span><b>'+Math.round(tot[k]||0)+'</b></div>').join('')+'</div>'+hitCapHtml(c)
   +'<button class="btn sm ghost" data-a="autofill" style="margin-top:8px">추천으로 빈 칸 채우기</button></div>'
   +'<div class="acol">'+DOLL_R.map(s=>dollCell(c,s,ups)).join('')+'</div></div>'
   +'<div class="abot">'+DOLL_B.map(s=>dollCell(c,s,ups)).join('')+'</div>';
  h+='<p class="note" style="text-align:center">칸을 누르면 그 칸 추천이 나와요 · <span style="color:var(--good)">▲</span> = 더 좋은 게 있어요</p></details>';
  h+='</div><div class="gR">';
  const soonU=upgrades(c,Math.min(60,L+5),ui.ifil,L+1);const cmpN=(c.cmp||[]).length;
  if(ui.gsub==='soon'||ui.gsub==='stat')ui.gsub='up';const gs=ui.gslot&&!offLocked(c,ui.gslot)?'me':(ui.gsub||'up');
  h+='<div class="gsub">'+[['up','img/ui-shield.png','바꿀 것',nowU.length]].concat(c.bag?[['bag','inv_misc_bag_08','내 가방',bagAll(c).filter(x=>x.ok&&x.g>.5).length||'']]:[]).concat([['cmp','img/ui-target.png','찜·비교',((c.wish||[]).length+cmpN)||''],['fr','spell_holy_prayeroffortitude','친구',frList(c).length||'']]).map(x=>'<button class="'+(gs===x[0]?'on':'')+'" data-a="gsub" data-k="'+x[0]+'">'+gic(x[1],'lg')+'<span>'+x[2]+(x[3]!==''&&x[3]!==undefined?' <b>'+x[3]+'</b>':'')+'</span></button>').join('')+'</div>';
  if(gs==='cmp'){h+=cmpView(c);return h+'</div></div>'}
  if(gs==='bag'){h+=bagView(c);return h+'</div></div>'}
  if(gs==='fr'){h+=frView(c);return h+'</div></div>'}
  if(gs==='up'||gs==='me'){const seg=(a,cur,opts)=>'<span class="gseg">'+opts.map(o=>'<button class="'+(cur===o[0]?'on':'')+'" data-a="'+a+'" data-k="'+o[0]+'" title="'+esc(o[2]||'')+'">'+gic(o[3])+'<span>'+o[1]+'</span></button>').join('')+'</span>';
    h+='<div class="gopt">'+dspSeg(c)+seg('ifil',ui.ifil||'ok',[['ok','확실한 것만','퀘스트·던전 보스·상인'],['all','경매장·운 포함','경매장·월드 드랍도']])
      +(isTank(c)?seg('tmode',c.tmode||'bal',TMODE):(W[c.cls]||{})[c.spec]&&W[c.cls][c.spec].heal&&SOLO[c.cls]?seg('gmode',c.gmode||'heal',[['heal','힐','파티·던전','img/role-hl.png'],['solo','사냥','혼자 레벨업','img/role-dp.png']]):'')+'</div>'}
  if(gs==='up'&&ui.dsp==='2'&&!dspOn(me())&&(c.lv||1)>=40){h+=dspPick(c);return h+'</div></div>'}
  if(gs==='me')h+=slotPanel(c,ui.gslot);
  const prioCard=(()=>{const P=prioLine(c);return '<div class="card prio"><div class="ph2"><b>📊 '+esc((CINFO[c.cls]||[])[0]||'')+' '+esc(sp?sp.name:'')+' 능력치 우선순위</b></div><div class="pl">'+P.map((x,i)=>'<span><i>'+(i+1)+'</i>'+esc(x)+'</span>').join('<em>›</em>')+'</div>'+(whyOf(c)?'<p class="note">'+esc(whyOf(c))+'</p>':'')+'<p class="mute src">기준: '+esc(c.gmode==='solo'&&W[c.cls][c.spec].heal&&SOLO[c.cls]?'사냥용 표(forg 기본표 바탕)':(WSRC[c.cls+'/'+c.spec]||'forg 기본표'))+' · forg.gg와 같은 공식</p></div>'})();
  if(gs==='up')h+=upAll(c,nowU,soonU);
  if(gs!=='up')return h+'</div></div>';
  h+=setCard(c);
  h+='<details class="card fold statf"'+(ui.statf?' open':'')+' data-tg="statf"><summary>📊 내 능력치 · 점수 매기는 법</summary>'+prioCard;
  /* 능력치 전체 */
  const all=Object.keys(tot).sort((a,b)=>(w[b]||0)-(w[a]||0));
  h+='<div class="card"><h3>능력치 합계 (장비)</h3>'+(all.length?'<div class="stats">'+all.map(k=>'<div><span'+(w[k]?'':' class="mute"')+'>'+STAT_KO[k]+'</span><b>'+Math.round(tot[k])+'</b></div>').join('')+'</div>':'<p class="note">장비를 넣으면 합계가 나와요.</p>')
   +'<p class="note">중요한 순서 (위 우선순위와 같음): '+prioLine(c).map(esc).join(' > ')+'</p>'
   +(w.heal&&HEALER_NOTE[c.cls]?'<p class="note">💡 힐러는 레벨업 동안 방어도보다 <b>치유량·지능</b>이 중요해서 천·가죽 옷도 추천에 많이 나와요. 다른 직업과 겹치지 않게 파티에서 미리 얘기해 두세요.</p>':'')+'</div>';
  {const rows=Object.entries(w).filter(([k,v])=>v>0&&(STAT_KO[k]||k==='rdps')&&k!=='armor').sort((a,b)=>b[1]-a[1]);
   const nm=k=>k==='dps'?'무기 초당 공격력 1':k==='rdps'?'원거리 무기 초당 공격력 1':/crit|hit|dodge|parry|blockp/.test(k)?STAT_KO[k].replace(' %','')+' 1%':STAT_KO[k]+' 1';
   h+='<details class="card fold sform"><summary>📐 점수는 어떻게 매겨요? ('+esc(sp?sp.name:'')+')</summary><p class="note">점수 = 능력치 × 아래 숫자를 모두 더한 값이에요. forg.gg와 같은 틀이에요: 딜러는 <b>포에버 시뮬레이터(wowsims/forever, 60레벨)</b> 값, 힐러·시뮬 없는 특성은 forg 기본표예요. 지금 기준: <b>'+esc(WSRC[c.cls+'/'+c.spec]||'forg 기본표')+'</b></p>'
    +'<div class="stats">'+rows.map(([k,v])=>'<div><span>'+nm(k)+'</span><b>'+(v>=1?Math.round(v*10)/10:v.toFixed(2).replace(/0$/,''))+'점</b></div>').join('')+'</div>'
    +'<p class="note">'+(c.cls==='hunter'?'사냥꾼은 원거리 무기 DPS가 제일 중요해요.':w.rdps&&w.rdps<.1?'원거리 칸은 당기기용이라 DPS는 거의 안 세고, 힘·민첩 같은 능력치를 봐요. 활·총의 전투력은 원거리 전투력이라 빼요.':'')
    +' 치명타·적중 같은 % 효과는 "착용 효과" 글에서 읽어서 넣어요. 그 밖의 특수 효과(발동 효과 등)는 점수에 안 들어가니 <b>효과</b> 표시 장비는 직접 견줘 보세요.</p></details>'}
  return h+'</details><button class="wfrb" data-a="wfr">🎮 게임 툴팁에 앱 추천 넣기 <small>애드온 /wfh 추천</small></button></div></div>'}
function statChange(c,slot,it){const a=statTotals(c),b=statTotals(c,it,null,slot);const w=wOf(c);const ks=new Set([...Object.keys(a),...Object.keys(b)]);const arr=[];
  ks.forEach(k=>{const d=(b[k]||0)-(a[k]||0);if(Math.abs(d)>=.5&&STAT_KO[k])arr.push([k,d])});{const dm=Object.fromEntries(arr);for(let i=arr.length-1;i>=0;i--){const [k,d]=arr[i];if((k==='shit'&&dm.hit!=null&&Math.abs(dm.hit-d)<.01)||(k==='scrit'&&dm.crit!=null&&Math.abs(dm.crit-d)<.01))arr.splice(i,1)}}arr.sort((x,y)=>(w[y[0]]||0)-(w[x[0]]||0));
  return arr.length?'<div class="chg">'+arr.map(([k,d])=>'<span class="'+(d>0?'p':'n')+'">'+STAT_KO[k]+' '+(d>0?'+':'−')+Math.round(Math.abs(d))+' <i>→ '+Math.round(b[k]||0)+'</i></span>').join('')+'</div>':''}
/* 장비 칸 넘기기: ‹ › 버튼 · 옆으로 밀기 (머리 → … → 원거리 순서) */
const SLOT_ORDER=()=>DOLL_L.concat(DOLL_R,DOLL_B);
function slotStep(c,slot,d){const O=SLOT_ORDER().filter(s=>!offLocked(c,s));let i=O.indexOf(slot);if(i<0)i=0;return O[(i+d+O.length)%O.length]}
function slotNav(c,slot){const O=SLOT_ORDER().filter(s=>!offLocked(c,s));const i=O.indexOf(slot)+1;
  return '<span class="snav"><button data-a="slotnav" data-k="-1" aria-label="이전 칸 '+SLOT_KO[slotStep(c,slot,-1)]+'">‹</button><small>'+i+'/'+O.length+'</small><button data-a="slotnav" data-k="1" aria-label="다음 칸 '+SLOT_KO[slotStep(c,slot,1)]+'">›</button></span>'}
function slotGo(d){const c=me();if(!c)return;const dd=+d;ui.swd=dd>0?'l':'r';
  if(ui.sheet&&ui.sheet.startsWith('slot:')){ui.sheet='slot:'+slotStep(c,ui.sheet.slice(5),dd);ui.isrch='';rerender(true);const sh=document.querySelector('.sheet');if(sh)sh.scrollTop=0;return}
  if(ui.gslot){ui.gslot=slotStep(c,ui.gslot,dd);rerender(true)}}
{let sx=0,sy=0,on=false;
  document.addEventListener('touchstart',e=>{const t=e.target.closest&&e.target.closest('.spanel,.sheet');if(!t||!t.querySelector('[data-swslot]')&&!t.matches('[data-swslot]')){on=false;return}
    /* 옆으로 스크롤되는 표 안에서는 넘기지 않음 */
    let p=e.target;while(p&&p!==t){if(p.scrollWidth>p.clientWidth+4&&/auto|scroll/.test(getComputedStyle(p).overflowX)){on=false;return}p=p.parentElement}
    on=true;sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
  document.addEventListener('touchend',e=>{if(!on)return;on=false;const t=e.changedTouches[0];const dx=t.clientX-sx,dy=t.clientY-sy;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.6)slotGo(dx<0?1:-1)},{passive:true})}
function slotPanel(c,slot){const L=c.lv;const cur=eqIt(c,slot);const best=bestFor(c,slot,L,ui.ifil).slice(0,3);const {w}=cmpW(c);
  let h='<div class="card hl spanel'+(ui.swd?' sw'+ui.swd:'')+'" data-swslot="1"><div class="hd"><h3>'+SLOT_KO[slot]+' · 지금 장비와 추천 비교</h3>'+slotNav(c,slot)+'<button class="x" data-a="gsel" data-k="">✕</button></div>';ui.swd=null;
  if(!best.length){h+='<div class="row">'+itIcon(cur)+'<span class="m"><span class="sub">지금 착용</span><span class="nm">'+(cur?itName(cur):'<span class="mute">비어 있음</span>')+'</span>'+(cur?'<span class="sub">'+itMeta(cur)+'</span>'+statLine(cur):'')+'</span>'+(cur?'<button class="btn sm ghost" data-a="unequip" data-k="'+slot+'">빼기</button>':'')+'</div><p class="note">지금보다 좋은 게 없어요 👍</p>'}
  else{const cols=(cur?[{it:cur,eq:1,slot}]:[]).concat(best.map(x=>({it:x.it,slot})));h+=cmpTable(c,cols,w);h+='<div class="picks"><h4>🎯 추천 3개 · 어디서 얻나요?</h4>'+best.map((x,i)=>'<details class="cpk"'+(i===0?' open':'')+'><summary>'+itIcon(x.it)+'<span class="m"><b>'+itName(x.it)+ownTag(c,x.it.id)+luckTag(x.it,c)+'</b><small>'+esc(srcTxt(x.it,1))+'</small></span><span class="g">+'+x.g.toFixed(1)+'</span><span class="ar">▾</span></summary>'+srcList(x.it)+'<div class="pka"><button class="btn sm ghost" data-a="wish" data-k="'+x.it.id+'">'+(isWish(c,x.it.id)?'⭐ 찜함':'☆ 찜하기')+'</button><button class="btn sm ghost" data-a="nogo" data-k="'+x.it.id+'">🚫 못 얻어요 · 다음 추천</button></div></details>').join('')+'</div>';if(cur)h+='<button class="btn sm ghost" data-a="unequip" data-k="'+slot+'">지금 장비 빼기</button>'}
  if(c.bag){const w2=wOf(c);const O=bagAll(c).filter(x=>x.ok&&fits(x.it,slot,c)&&x.it.id!==(cur&&cur.id)).map(x=>Object.assign({},x,{g:sc(x.it,slot,w2)-sc(cur,slot,w2)})).sort((a,b)=>b.g-a.g);
    h+='<div class="owb"><h4>🎒 내 가방·은행의 '+SLOT_KO[slot]+' 템 <small>'+(O.length?O.length+'개':'없어요')+'</small></h4>'+O.slice(0,5).map(x=>'<div class="row">'+itIcon(x.it)+'<span class="m"><span class="sub">'+(x.where==='bank'?'🏦 은행':'🎒 가방')+'</span><span class="nm">'+itName(x.it)+'</span>'+itStats(x.it,c)+dif2(x.it,cur,c)+'</span>'+(x.g>.5?'<button class="btn sm" data-a="equip" data-k="'+slot+'" data-id="'+x.it.id+'">끼기 +'+(x.g>=10?Math.round(x.g):x.g.toFixed(1))+'</button>':'<span class="gain no">'+(x.g<-.5?'−'+(x.g<=-10?Math.round(-x.g):(-x.g).toFixed(1))+'점':'비슷해요')+'</span>')+'</div>').join('')+'</div>'}
  {const ng=(c.nogo||[]).filter(id=>{const it=IT.get(id);return it&&fits(it,slot,c)});if(ng.length)h+='<p class="note">🚫 못 얻는다고 뺀 장비 '+ng.length+'개 · <button class="lnk" data-a="nogoclr" data-k="'+slot+'">다시 넣기</button></p>'}
  h+='<button class="btn ghost full" style="margin-top:8px" data-a="slot" data-k="'+slot+'">후보 전체 보기 · 이름으로 찾기</button></div>';
  return h}
function statLine(it){const ks=Object.keys(it.st).filter(k=>STAT_KO[k]&&k!=='armor'&&!SHDUP(k,it.st));return ks.length?'<span class="dif">'+ks.map(k=>STAT_KO[k]+' '+(k==='dps'?it.st[k].toFixed(1):(it.st[k]<0?'−'+Math.abs(Math.round(it.st[k])):'+'+Math.round(it.st[k])))).join(' · ')+'</span>':''}
function slotSheet(c,slot){const L=c.lv;const cur=eqIt(c,slot);const w=wOf(c);const q=ui.isrch.trim();const srt=ui.gsort||'lv';
  const base=it=>slot==='main'&&it.sl==='2h'?sc(eqIt(c,'main'),'main',w)+sc(eqIt(c,'off'),'off',w):sc(cur,slot,w);
  const nq=q.replace(/\s+/g,'');const hit=it=>it.nm.replace(/\s+/g,'').includes(nq);
  let list;if(q)list=ITEMS.filter(it=>usable(it,c)&&fits(it,slot,c)&&hit(it)).slice(0,60).map(it=>({it,s:sc(it,slot,w)}));
  else list=cands(c,slot,Math.min(60,L+3),ui.ifil);
  list.forEach(x=>{x.g=x.s-base(x.it)});
  const sorter=srt==='lv'?(a,b)=>b.it.ob-a.it.ob||b.it.lv-a.it.lv||b.g-a.g:(a,b)=>b.g-a.g;
  const now=list.filter(x=>x.it.ob<=L).sort(sorter),later=list.filter(x=>x.it.ob>L).sort((a,b)=>a.it.ob-b.it.ob||b.g-a.g);
  let h='<div class="sh" data-swslot="1"><h2>'+SLOT_KO[slot]+'</h2>'+slotNav(c,slot)+'<button class="x" data-a="close">✕</button></div>';
  h+='<div class="card hl"><div class="row">'+itIcon(cur)+'<span class="m"><span class="sub">지금 착용</span><span class="nm">'+(cur?itName(cur):'<span class="mute">비어 있음</span>')+'</span>'+(cur?'<span class="sub">'+itMeta(cur)+'</span>'+statLine(cur):'')+'</span>'+(cur?'<button class="btn sm ghost" data-a="unequip" data-k="'+slot+'">빼기</button>':'')+'</div></div>';
  h+='<div class="srch"><input class="inp" placeholder="이름으로 찾기 (지금 끼고 있는 장비 넣기)" value="'+esc(ui.isrch)+'" data-c="isrch"></div>';
  h+='<div id="isres">';h+='<div class="chips">'+[['lv','레벨 높은 순'],['g','좋아지는 순']].map(f=>'<button class="chip'+(srt===f[0]?' on':'')+'" data-a="gsort" data-k="'+f[0]+'">'+f[1]+'</button>').join('')+'</div>';
  const row=x=>{const it=x.it;const lock=it.ob>L;return '<div class="row'+(lock?'" style="opacity:.55':'')+'">'+itIcon(it)+'<span class="m"><span class="nm">'+itName(it)+(it.id===(cur&&cur.id)?' <span class="tag gd">착용 중</span>':'')+'</span><span class="sub">'+itMeta(it)+(it.ob>it.lv?' · '+it.ob+'레벨쯤 얻음':'')+'</span>'+itStats(it,c)+dif2(it,cur,c)+'<span class="sub">'+esc(srcTxt(it,2))+'</span></span><span class="r">'+gainTag(x.g,base(it),!cur)+'<br>'+infoBtn(it)+' <button class="btn sm" style="margin-top:6px" data-a="equip" data-k="'+slot+'" data-id="'+it.id+'">착용</button></span></div>'};
  h+='<h3>지금 낄 수 있어요 ('+now.length+')</h3>'+(now.length?now.map(row).join(''):'<p class="note">'+(q?'찾는 장비가 없어요. 이 직업이 못 끼는 장비일 수 있어요.':'후보가 없어요.')+'</p>');
  if(q){const no=ITEMS.filter(it=>!usable(it,c)&&SLOTS.find(x=>x[0]===slot)[2].includes(it.sl)&&hit(it)).slice(0,12);if(no.length)h+='<h3>이 직업은 못 끼는 장비 ('+no.length+')</h3>'+no.map(it=>'<div class="row" style="opacity:.5">'+itIcon(it)+'<span class="m"><span class="nm">'+itName(it)+'</span><span class="sub">'+itMeta(it)+'</span></span><span class="r">'+infoBtn(it)+'</span></div>').join('')}
  if(later.length)h+='<h3>곧 낄 수 있어요 (레벨 '+(L+1)+'~'+Math.min(60,L+3)+')</h3>'+later.map(row).join('');
  return h+'</div>'}

/* ===================== 퀘스트 ===================== */
/* ===== 빠른 레벨업: 지금 할 일 (거점별 받기·반납 묶음, 동선 순서) ===== */
function impOf(c,q,ctx){const B=[];const R=qRw(q.id);
  const its=[...(R.ch||[]),...(R.fx||[])].map(x=>IT.get(x[0])).filter(it=>it&&usable(it,c));
  if(its.some(it=>{const b=bestSlot(it,c);return b&&b.g>.01}))B.push(['gear','⭐ 내 장비']);
  const ch=chainOf(q.id);if(ch){const st=(ch.find(r=>r[6]===q.id)||[0])[0];if(st===1)B.push(['chain','🔗 연계 시작 ('+ch.length+'단계)'])}
  if(ctx.dq.has(q.id))B.push(['dg','🏰 던전']);
  if(R.xp&&ctx.xpHi&&R.xp>=ctx.xpHi)B.push(['xp','✨ 경험치 많음']);
  return B}
function hubOfXY(zone,xy,gv){return qHub(zone,{xy,gv:gv||'',gz:zone})}
/* 전문기술·야영 입문 퀘스트 (레벨업에 꼭 필요 없음 → 따로 묶음) */
const PROFZ=new Set(['야영','제작','대장기술','기계공학','낚시','가죽세공','요리','재봉술','응급치료','약초채집','연금술','마법부여','채광','무두질']);
const isProf=q=>/^(캠핑 입문|드넓은 야외)/.test(q.nm||q.n||'')||!!(QDB&&QDB.get(q.id)&&PROFZ.has(QDB.get(q.id).z));
function nowPlan(c,S){const fq=c.fq||{};const seen=new Set();const Q=S.q.filter(q=>{if(seen.has(q.nm))return false;seen.add(q.nm);return true});
  const dq=new Set();DGS.forEach(d=>d.q.forEach(x=>dq.add(x.id)));
  const xs=Q.map(q=>(RWD.get(q.id)||{}).xp||0).filter(Boolean).sort((a,b)=>a-b);const xpHi=xs.length>4?xs[Math.floor(xs.length*.8)]:0;
  const ctx={dq,xpHi};const H=new Map();let ord=0;
  const hub=(z,xy,gv)=>{const [n,i]=xy?hubOfXY(z,xy,gv):['필드·아이템에서 시작',99];const k=z+'|'+n;if(!H.has(k))H.set(k,{k,z,n,i,o:ord++,get:[],turn:[],same:0});return H.get(k)};
  for(const q of Q){const z=q.gz||q.sz;const d=QD.get(q.id)||{};const done=qd(c,z,q);
    const g=hub(z,q.xy||(d.g&&d.g[2])||'',q.gv);const it={q,z,done,imp:impOf(c,q,ctx),prof:isProf(q)};g.get.push(it);
    if(d.r&&d.r[0]&&!d.r[3]){const rn=npcKo(d,'r')||d.r[0];if(!d.r[2]){it.to=rn}else{const rz=d.r[1]||z;const r=hub(rz,d.r[2],rn);if(r!==g){r.turn.push(Object.assign({},it,{rv:rn,gh:g}));it.to=r.n+(r.z!==z?' ('+r.z+')':'')}else g.same++}}
    else g.same++}
  const main=new Set(S.z.split(' · '));
  const L=[...H.values()].filter(h=>h.get.length||h.turn.length).sort((a,b)=>(a.i>=97)-(b.i>=97)||(!main.has(a.z))-(!main.has(b.z))||a.o-b.o);
  /* 반납할 곳이 받는 곳보다 앞에 나오면, 받은 뒤에 「다시 들르기」로 옮김 */
  const RV=new Map();
  for(const h of L.slice()){const keep=[];for(const t of h.turn){const gi=L.indexOf(t.gh),ti=L.indexOf(h);if(gi>ti&&!h.k.endsWith('#다시')){const k=h.k+'#다시';let r=RV.get(k);if(!r){r={k,z:h.z,n:h.n,again:1,i:h.i,o:h.o,get:[],turn:[],same:0};RV.set(k,r);L.splice(gi+1,0,r)}else{const ri=L.indexOf(r);if(gi>ri){L.splice(ri,1);L.splice(L.indexOf(t.gh)+1,0,r)}}r.turn.push(t)}else keep.push(t)}h.turn=keep}
  /* 「북쪽」「동쪽」처럼 방향만 있는 이름 → 그 근처에서 퀘스트 주는 NPC 이름을 제목으로 */
  const DIR=/^(중앙|(북|남)?(동|서)?(북|남)?쪽?)( 끝| 해안| 길)?$/;
  for(const h of L){if(!DIR.test(h.n)||h.i>=97)continue;const cnt={};const xs=[];h.get.concat(h.turn).forEach(x=>{const d=QD.get(x.q.id)||{};const nm=h.get.includes(x)?(x.q.gv||npcKo(d,'g')):x.rv;if(nm&&!latin(nm)){const n1=nm.split('/')[0].trim();cnt[n1]=(cnt[n1]||0)+1}const p=xyOf(h.get.includes(x)?(x.q.xy||(d.g&&d.g[2])):(d.r&&d.r[2]));if(p)xs.push(p)});
    const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];if(top&&top[0]){h.npc=top[0];if(xs.length)h.xy=[Math.round(xs.reduce((n,p)=>n+p[0],0)/xs.length),Math.round(xs.reduce((n,p)=>n+p[1],0)/xs.length)]}}
  /* 「 근처 (36, 30)」처럼 NPC 이름이 빈 곳 → 퀘스트 자료에서 주는 사람 이름 */
  for(const h of L){if(!/^\s*근처/.test(h.n)||h.npc)continue;for(const x of h.get.concat(h.turn)){const X=QDB&&QDB.get(x.q.id);const d=QD.get(x.q.id)||{};const nm=(h.get.includes(x)?((X&&X.g&&X.g[0])||npcKo(d,'g')):x.rv)||'';if(nm&&!latin(nm)){h.npc=nm.split('/')[0].trim();break}}
    if(!h.npc){const m=h.n.match(/\((\d+), (\d+)\)$/);h.npc='이름 없는 곳';if(m)h.xy=[+m[1],+m[2]]}else{const m=h.n.match(/\((\d+), (\d+)\)$/);if(m)h.xy=[+m[1],+m[2]]}}
  /* 지도에 찍을 위치: 이름에 좌표가 없으면 그 마을 퀘스트 주는 곳 좌표 평균 */
  for(const h of L){if(h.xy||h.i>=97)continue;const m=h.n.match(/\((\d+), (\d+)\)$/);if(m){h.xy=[+m[1],+m[2]];continue}const xs=[];h.get.forEach(x=>{const d=QD.get(x.q.id)||{};const p=xyOf(x.q.xy||(d.g&&d.g[2]));if(p)xs.push(p)});h.turn.forEach(x=>{const d=QD.get(x.q.id)||{};const p=xyOf(d.r&&d.r[2]);if(p)xs.push(p)});
    if(xs.length){xs.sort((a,b)=>a[0]-b[0]);const md=xs[Math.floor(xs.length/2)];const near=xs.filter(p=>Math.hypot(p[0]-md[0],p[1]-md[1])<8);h.xy=[Math.round(near.reduce((n,p)=>n+p[0],0)/near.length),Math.round(near.reduce((n,p)=>n+p[1],0)/near.length)]}}
  return L.filter(h=>h.get.length||h.turn.length)}
const wa=w=>{const ch=(w||'').trim().slice(-1).charCodeAt(0);return ch>=0xAC00&&ch<=0xD7A3&&(ch-0xAC00)%28?'과':'와'};
function taskShort(q){const d=QD.get(q.id)||{};const T=tasksOf(d,q.obj||d.obj||((QDB&&QDB.get(q.id))||{}).o||'');if(!T.length)return '';const t=Object.assign({},T[0]);if(t.en)return '🎯 '+t.nm+(T.length>1?' 외 '+(T.length-1)+'개':'');
  if(t.type==='대화'||/이야기하면 끝/.test(t.nm)){const nm=d.r&&d.r[0]?npcKo(d,'r'):'';return '💬 '+(nm?nm+wa(nm)+' 대화':'대화하기')}
  if(latin(t.nm)){const X=QDB&&QDB.get(q.id);const k=X&&X.t&&X.t.find(x=>x[1]&&!latin(x[1]));if(k)t.nm=k[1]}
  return (T_IC[t.type]||'•')+' '+t.nm+(t.cnt?' '+t.cnt+(t.type==='처치'?'마리':'개'):'')+' '+(T_KO[t.type]||'')+(T.length>1?' 외 '+(T.length-1)+'개':'')}
/* 「끝내면 다음 퀘스트가 N개 더 이어져요」 누르면 이어지는 퀘스트를 그 자리에서 펼침/접음 */
function nchain(c,id,more){ui.nch=ui.nch||{};const open=!!ui.nch[id];
  let h='<button class="nchb'+(open?' on':'')+'" data-a="nch" data-k="'+id+'">'+qico('chain')+' 끝내면 다음 퀘스트가 '+more+'개 더 이어져요 <span class="cv">'+(open?'⌃':'⌄')+'</span></button>';
  if(!open)return h;
  const ids=(typeof treeIds==='function'&&QDB&&QDB.get(id)?treeIds(id).slice(1):[]).filter(x=>QDB.get(x)&&qdbOk(c,QDB.get(x)));
  if(!ids.length)return h+'<p class="mute nchl">이어지는 퀘스트 자료를 불러오는 중이에요</p>';
  const cr=chainOf(id);const base=cr?Math.max(1,cr.findIndex(r=>r[6]===id)+1):1;
  const lvOf=x=>QDB.get(x).lv;const kidsOf=x=>(QKIDS[x]||[]).filter(k=>ids.includes(k));
  h+='<ol class="nchl">'+ids.map((x,i)=>{const o=QDB.get(x);const d=mqDone(c,o);const g=o.g||[];const br=kidsOf(QPAR[x]!=null?QPAR[x]:-1).length>1;
    return '<li class="'+(d?'fin':'')+'"><button data-a="qopen" data-k="'+x+'"><span class="sn">'+(base+i+1)+'</span><span class="t"><b>'+esc(o.n)+'</b><span>'+(g[0]?esc(g[0])+(g[1]?' · '+esc(g[1]):''):'')+(br?' · 갈래':'')+'</span></span><span class="qlv '+lvCls(lvOf(x),c.lv)+'">'+(lvOf(x)||'?')+'</span>'+(d?'<em>✓</em>':'')+'</button></li>'}).join('')+'</ol>';
  return h}
/* 클래식 레벨별 다음 레벨까지 경험치 (포에버도 거의 같다고 보고 '약'으로 표시) */
/* 애드온에서 가져온 경험치 (그 레벨일 때만 유효) */
const goldTxt=cp=>{cp=Math.max(0,Math.floor(cp||0));const g=Math.floor(cp/10000),sv=Math.floor(cp%10000/100),cu=cp%100;return (g?'<b class="gg">'+g+'</b>골드 ':'')+(g||sv?'<b class="gs">'+sv+'</b>실버 ':'')+(g?'':'<b class="gc">'+cu+'</b>코퍼')};
const xpRate=c=>c.sess&&c.sess.hs>=600?c.sess.hx/c.sess.hs*3600:0;
const REP_ST=[[1,'적대',-42000,-6000],[2,'적대적',-6000,-3000],[3,'약간 적대적',-3000,0],[4,'중립',0,3000],[5,'우호적',3000,9000],[6,'존경',9000,21000],[7,'매우 존경',21000,42000],[8,'확고한 동맹',42000,42999]];
const myXp=c=>c.xp&&c.xp.lv===c.lv&&c.xp.max>0?c.xp:null;
/* 애드온에서 가져온 퀘스트 목표 진행도 */
const qpHtml=(c,id)=>{const P=(c.qp||{})[id];if(!P||!P.length||!(c.ql||{})[id])return '';return '<span class="qpg'+(P.every(o=>o[0]>=o[1])?' ok':'')+'">'+P.map(o=>o[0]+'/'+o[1]).join(' · ')+'</span>'};
const XPT=[0,400,900,1400,2100,2800,3600,4500,5400,6500,7600,8800,10100,11400,12900,14400,16000,17700,19400,21300,23200,25200,27300,29400,31700,34000,36400,38900,41400,44300,47400,50800,54500,58600,62800,67100,71600,76100,80800,85700,90700,95800,101000,106300,111800,117500,123200,129100,135100,141200,147500,153900,160400,167100,173900,180800,187900,195000,202300,209800];
const qxpAt=(q,L)=>{const x=(RWD.get(q.id)||{}).xp||0;if(!x)return 0;const d=L-(q.lv||L);return Math.round(x*(d<=5?1:d===6?.8:d===7?.6:d===8?.4:d===9?.2:.1))};
const xpPct=(xp,L)=>L>=60||!XPT[L]?0:Math.round(xp/XPT[L]*100);
function planStats(c,P){const QK=new Map();P.forEach(h=>h.get.concat(h.turn).forEach(x=>{if(x.prof)return;const k=x.q.id||x.z+'|'+x.q.nm;QK.set(k,(QK.get(k)||0)||x.done)}));return {all:QK.size,dn:[...QK.values()].filter(Boolean).length}}
function nowCard(c,S){let P=nowPlan(c,S);const PS=planStats(c,P);const all=PS.all,dn=PS.dn;
  const lk=x=>x.q.min>c.lv&&!x.prof;const isNew=x=>!x.done&&!x.prof&&c.lv>1&&x.q.min===c.lv;const left=H=>H.get.filter(x=>!x.done&&!lk(x)&&!x.prof).length+H.turn.filter(x=>!x.done&&!x.prof).length;
  const firstOpen=(P.filter(H=>!ui.rz||(ui.rz==='*'?!S.z.split(' · ').includes(H.z):H.z===ui.rz)).find(H=>left(H))||{}).k;ui.hopen=ui.hopen||{};
  const used=new Set();
  const zs0=S.z.split(' · ');let h='<div class="card now nwr"><div class="nh nh2"><span class="zics">'+zs0.slice(0,3).map(z=>'<span class="ic" style="background-image:url('+ICO(zIco(z))+')"></span>').join('')+'</span><div class="m"><small>지금 구간 '+S.a+'–'+S.b+'레벨</small><h3>'+esc(zs0[0])+'</h3><span class="mute">'+(()=>{const axp=(()=>{const seen=new Set();let n=0;P.forEach(H=>H.get.forEach(x=>{if(x.done||lk(x)||x.prof||seen.has(x.q.id))return;seen.add(x.q.id);n+=qxpAt(x.q,c.lv)}));return n})();const nwN=new Set(P.flatMap(H=>H.get.filter(isNew).map(x=>x.q.id||x.q.nm))).size;const av=new Set(P.flatMap(H=>H.get.filter(x=>!x.done&&!lk(x)&&!x.prof).concat(H.turn.filter(x=>!x.done&&!x.prof)).map(x=>x.q.id||x.q.nm))).size,lh=P.filter(H=>left(H)).length,lq=all-dn;return (c.lv>=60?'만렙이에요 · 남은 건 평판·장비·연계용 퀘스트 · ':'')+(av?'지금 할 수 있는 퀘스트 <b>'+av+'</b> · 들를 곳 '+lh+'곳'+(lq>av?' · 레벨 오르면 '+(lq-av)+'개 더':'')+(axp&&c.lv<60?(()=>{const xc=myXp(c);let L=c.lv,x=axp+(xc?xc.cur:0);while(L<60&&x>=XPT[L]){x-=XPT[L];L++}const f=L<60?x/XPT[L]:0;if(xc)return ' · 다 하면 약 <b>'+(L>=60?'60레벨':L+'레벨 '+Math.round(f*100)+'%')+'</b>까지';const g=(L-c.lv)+f;return ' · 다 하면 약 <b>'+(g>=1?g.toFixed(1)+'레벨':Math.round(g*100)+'%')+'</b> 오름'})():'')+(xpRate(c)&&myXp(c)?' · 이 속도면 다음 레벨까지 약 <b>'+Math.max(1,Math.round((myXp(c).max-myXp(c).cur)/xpRate(c)*60))+'분</b>':'')+(nwN?' · <span class="newq">🆕 '+c.lv+'레벨에 새로 열린 '+nwN+'개</span>':''):lq?'지금은 레벨이 모자라요 · '+lq+'개는 레벨을 올리면 열려요':'이 구간 퀘스트를 다 했어요')})()+'</span></div><div class="ring" style="--p:'+(all?Math.round(dn/all*100):0)+'"><b>'+dn+'</b><span>/'+all+'</span></div></div>';
  const zMain=z=>zs0.includes(z);const zOf=H=>zMain(H.z)?H.z:'*';
  const zl=[...new Set(P.map(zOf))].map(z=>[z,P.filter(H=>zOf(H)===z).reduce((n,H)=>n+left(H),0)]).filter(x=>x[1]).sort((a,b)=>(a[0]==='*')-(b[0]==='*')||zs0.indexOf(a[0])-zs0.indexOf(b[0]));
  if(ui.rz&&!zl.some(x=>x[0]===ui.rz))ui.rz=null;
  if(zl.length>1)h+='<div class="rzc"><button class="'+(ui.rz?'':'on')+'" data-a="rz" data-k="">전체</button>'+zl.map(x=>'<button class="'+(ui.rz===x[0]?'on':'')+'" data-a="rz" data-k="'+esc(x[0])+'">'+(x[0]==='*'?'⛵ 다른 지역 반납·심부름':'<span class="ic" style="background-image:url('+ICO(zIco(x[0]))+')"></span>'+esc(x[0]))+' <small>'+x[1]+'</small></button>').join('')+'</div>';
  P=ui.rz?P.filter(H=>zOf(H)===ui.rz):P;ui._hubs={};
  {let k=0;ui._rmp=[];P.forEach(H=>{if(!left(H)||H.i>=97)return;k++;const m=H.n.match(/^(.*?) \((\d+), (\d+)\)$/);const xy=H.xy||(m?[+m[2],+m[3]]:null);ui._rmp.push({k:H.k,n:k,z:H.z,xy,nm:H.npc?(H.npc==='이름 없는 곳'?H.npc:H.npc+' 근처'):m?m[1]:H.n})})}
  let n=0;
  const row=(x,turn)=>{const q=x.q;const lock=q.min>c.lv;x.imp.forEach(b=>{if(b[0]!=='chain')used.add(b[0])});
    const chn=x.imp.find(b=>b[0]==='chain');const more=chn?((chn[1].match(/\((\d+)단계\)/)||[])[1]-1):0;
    const ts=turn?'다른 곳에서 받은 퀘스트 · '+(x.rv||'')+'에게 반납':x.prof?(()=>{const o=((QDB&&QDB.get(q.id))||{}).o||'';const m=o.match(/^(.+?)(?: 근처)?에서 (.+?)[와과] 대화/);if(m)return '💬 '+m[2]+wa(m[2])+' 대화 · '+m[1];return o?'🎯 '+objClause(o):taskShort(q)})():taskShort(q);
    return '<div class="nr'+(x.done?' done':'')+(lock?' lock':'')+'"><label class="ck"><input type="checkbox" data-c="fq" data-id="'+(q.id||'')+'" data-k="'+esc(x.z+'|'+q.nm)+'"'+(x.done?' checked':'')+'></label>'
     +'<div class="nbw"><button class="nb" data-a="qopen" data-k="'+q.id+'"><span class="l1"><span class="qnm">'+esc(q.nm)+'</span>'+qpHtml(c,q.id)+(isNew(x)?'<span class="newq">🆕 새로 열림</span>':'')+x.imp.filter(b=>b[0]!=='chain').map(b=>qico(b[0],b[1])).join('')+(q.id>=10000?qico('fnew'):'')+'<span class="qlv '+lvCls(q.lv,c.lv)+'">'+q.lv+'</span></span>'
     +(ts||lock?'<span class="l2">'+(turn?QMK.r+' ':'')+(lock?'🔒 '+q.min+'레벨부터 · ':'')+esc(ts)+'</span>':'')+'</button>'+(more>0?nchain(c,q.id,more):'')+'</div></div>'};
  const LIM=ui.hall?99:3;let shown=0,hid=0;
  h+='<div class="steps">'+P.map(H=>{if(left(H)){if(shown>=LIM){hid++;return ''}shown++}else if(!ui.hall){return ''}const real=H.i<97;const L=left(H);if(real&&L)n++;const todo=H.get.filter(x=>!x.done).sort((a,b)=>a.q.lv-b.q.lv),turn=H.turn.filter(x=>!x.done),done=H.get.filter(x=>x.done);
    const open=ui.hopen[H.k]!=null?ui.hopen[H.k]:H.k===(ui.hfocus&&P.some(x=>x.k===ui.hfocus)?ui.hfocus:firstOpen);
    const prN=todo.filter(x=>x.prof);const lkN=todo.filter(lk);const lkOnly=!L&&lkN.length;const prOnly=!L&&!lkN.length&&prN.length;
    const nA=todo.length-lkN.length-prN.length;const hxp=xpPct(todo.filter(x=>!lk(x)&&!x.prof).reduce((n,x)=>n+qxpAt(x.q,c.lv),0),c.lv);const cnt=prOnly?'<span class="hp">🛠️ 전문기술 '+prN.length+'</span>':lkOnly?'<span class="hp">🔒 '+Math.min(...lkN.map(x=>x.q.min))+'레벨부터</span>':L?(nA?'<span class="hp g">받기 '+nA+'</span>':'')+(turn.length?'<span class="hp r">반납 '+turn.length+'</span>':'')+(todo.some(isNew)?'<span class="hp nw">🆕 '+todo.filter(isNew).length+'</span>':'')+(hxp>=5?'<span class="hp xp">경험치 '+hxp+'%</span>':''):'<span class="hp">완료</span>';
    ui._hubs[H.k]=todo.filter(x=>!lk(x)&&!x.prof).concat(turn.filter(x=>!x.prof)).map(x=>[x.z+'|'+x.q.nm,x.q.id]);const fid=(turn[0]||todo[0]||H.get[0]||{}).q;
    const pvn=turn.map(x=>x.q.nm).concat(todo.filter(x=>!lk(x)&&!x.prof).map(x=>x.q.nm),prN.length?['🛠️전문기술 '+prN.length+'개']:[],todo.filter(lk).map(x=>'🔒'+x.q.nm));const pv=(L||prN.length)&&!open?'<span class="pv">'+esc(pvn.slice(0,2).join(', '))+(pvn.length>2?' 외 '+(pvn.length-2):'')+'</span>':'';
    let b='<div class="st'+(L?'':lkOnly||prOnly?' lkh':' fin')+(open?' open':'')+'" data-hk="'+esc(H.k)+'"><button class="sh2" data-a="hub" data-k="'+esc(H.k)+'"><span class="no">'+(L?(real?n:'·'):lkOnly?'🔒':prOnly?'🛠️':'✓')+'</span><span class="hn">'+(()=>{const m=H.n.match(/^(.*?) \((\d+), (\d+)\)$/);const here=(H.again?'<i class="agn">다시 들르기</i>':'')+(H.k===firstOpen?'<i class="here">지금 여기</i>':'');if(H.npc)return '<b>'+esc(H.npc)+(H.npc==='이름 없는 곳'?'':' 근처')+here+'</b><span>'+esc(H.z)+(/근처/.test(H.n)?'':' '+esc(H.n))+(H.xy?' · '+H.xy[0]+', '+H.xy[1]:'')+'</span>'+pv;return m?'<b>'+esc(m[1])+here+'</b><span>'+esc(H.z)+' · '+m[2]+', '+m[3]+'</span>'+pv:'<b>'+esc(H.n)+here+'</b><span>'+esc(H.z)+'</span>'+pv})()+'</span><span class="hc">'+cnt+'</span><span class="cv">'+(open?'⌃':'⌄')+'</span></button>';
    if(open){const tA=todo.filter(x=>!lk(x)&&!x.prof);ui.hmore=ui.hmore||{};const all2=turn.map(x=>[x,1]).concat(tA.map(x=>[x,0]));const cap=ui.hmore[H.k]||all2.length<=10?99:8;
      b+='<div class="sb">'+all2.slice(0,cap).map(([x,t])=>row(x,t)).join('')+(all2.length>cap?'<button class="hmore" data-a="hmore" data-k="'+esc(H.k)+'">이 마을 퀘스트 '+(all2.length-cap)+'개 더 보기 ⌄</button>':'')+(lkN.length?(tA.length||turn.length?'<details class="lkd"><summary>🔒 레벨 오르면 여기서 '+lkN.length+'개 더 <small>'+Math.min(...lkN.map(x=>x.q.min))+'레벨부터</small></summary>'+lkN.map(x=>row(x,0)).join('')+'</details>':lkN.map(x=>row(x,0)).join('')):'')+(prN.length?(()=>{const my=c.profs||[];const pk=x=>{const m=x.q.nm.match(/: (.+)$/);return m?m[1]:''};const mine=x=>!my.length||!pk(x)||my.includes(pk(x));const show=prN.filter(mine).sort((a,b)=>a.q.nm.localeCompare(b.q.nm,'ko'));const hidN=prN.length-show.length;
        const names=[...new Set(prN.map(pk).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ko'));
        return '<details class="lkd prf"'+(ui.prfo&&ui.prfo[H.k]?' open':'')+' data-k="'+esc(H.k)+'"><summary>🛠️ '+(my.length?'내 전문기술 퀘스트 '+show.length+'개 <small>'+esc(my.join('·'))+(hidN?' · 다른 기술 '+hidN+'개 숨김':'')+'</small>':'전문기술·야영 퀘스트 '+prN.length+'개 <small>아래에서 내 기술을 고르면 그것만 보여요 · 레벨업 숫자엔 안 세요</small>')+'</summary>'
          +'<div class="mypf">'+names.map(n=>'<button class="'+(my.includes(n)?'on':'')+'" data-a="myprof" data-k="'+esc(n)+'">'+(my.includes(n)?'★ ':'')+esc(n)+'</button>').join('')+'</div>'+show.map(x=>row(x,0)).join('')+'</details>'})():'')+(L?'<div class="hft">'+(fid&&fid.id?'<button class="btn sm ghost" data-a="mmgo" data-k="'+fid.id+'">📍 지도에서 위치</button>':'')+'<button class="btn sm" data-a="hubok" data-k="'+esc(H.k)+'">✓ 여기 다 했어요</button></div>':'')+(done.length?'<div class="dn">끝낸 것 '+done.length+'개</div>'+done.map(x=>row(x,0)).join(''):'')+'</div>'}
    return b+'</div>'}).join('')+'</div>';
  const finN=P.filter(H=>!left(H)&&!H.get.some(x=>!x.done&&(lk(x)||x.prof))).length;
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
  /* 던전·장비도 같이 찾기 */
  const DH=DGS.filter(d=>hit(d.ko)||(d.en||'').toLowerCase().replace(/\s+/g,'').includes(nq.toLowerCase())).slice(0,5);
  const IH=nq.length<2?[]:ITEMS.filter(it=>hit(it.nm)).map(it=>({it,u:usable(it,c),b:usable(it,c)?bestSlot(it,c):null})).map(x=>Object.assign(x,{now:x.u&&(x.it.ob||x.it.lv)<=L+3})).sort((x,y)=>(y.now-x.now)||(y.u-x.u)||(((y.b||{}).g||0)-((x.b||{}).g||0))||(Math.abs(x.it.lv-L)-Math.abs(y.it.lv-L))).slice(0,8);
  let ex='';
  if(DH.length)ex+='<p class="mute sr">던전 '+DH.length+'개</p><div class="srl">'+DH.map(d=>{const S=dgState(c,d);return '<button class="srow" data-a="dgo" data-k="'+d.slug+'"><span class="qlv '+lvCls(d.fit||d.lo,L)+'">'+d.lo+'</span><span class="t"><b>🏰 '+esc(d.ko)+'</b><span>'+d.lo+'–'+d.hi+'레벨 · '+esc(d.loc||'')+(S.Q.length?' · 퀘스트 '+S.done.length+'/'+S.Q.length:'')+'</span></span></button>'}).join('')+'</div>';
  if(IH.length)ex+='<p class="mute sr">장비 '+IH.length+'개'+(IH.length>=8?' (나한테 맞는 순 8개)':'')+'</p><div class="srl">'+IH.map(({it,u,b})=>'<button class="srow" data-a="'+(b&&b.g>.01?'cmpq':'info')+'" data-k="'+(b&&b.g>.01?b.s+':'+it.id:it.id)+'"><span class="sric">'+itIcon(it)+'</span><span class="t"><b class="q'+it.q+'">'+esc(it.nm)+'</b><span>'+esc((SL_KO[it.sl]||'')+(it.lv<=1&&it.ob>1?' · '+it.ob+'레벨쯤 얻음':it.lv>0?' · Lv '+it.lv:'')+(u?'':' · 못 씀')+' · '+srcTxt(it,1))+'</span></span>'+(b&&b.g>.01?'<em class="g">+'+Math.round(b.g)+'</em>':'')+'</button>').join('')+'</div>';
  const exD=DH.length?ex.slice(0,ex.indexOf('<p class="mute sr">장비')>=0?ex.indexOf('<p class="mute sr">장비'):ex.length):'';const exI=ex.slice(exD.length);const QN=IH.length?15:40;
  if(!n)return ex+(ex?'':'<p class="empty-st">"'+esc(q)+'"(으)로 찾은 퀘스트·던전·장비가 없어요.</p>');
  return exD+'<p class="mute sr">퀘스트 '+n+'개 찾음'+(n>QN?' · 가까운 레벨 '+QN+'개만':'')+'</p><div class="srl">'+R.slice(0,QN).map(({x})=>{const d=mqDone(c,x);
    return '<button class="srow'+(d?' done':'')+'" data-a="qopen" data-k="'+x.id+'"><span class="qlv '+lvCls(x.lv,L)+'">'+(x.lv||'?')+'</span><span class="t"><b>'+esc(x.n)+'</b><span>'+esc(x.z||'')+(x.g&&x.g[0]?' · '+esc(x.g[0]):'')+(x.m>L?' · 🔒'+x.m+'레벨부터':'')+'</span></span>'+(d?'<span class="ok">✓</span>':'')+'</button>'}).join('')+'</div>'+exI}
/* ===================== 📍 지도로 퀘스트 보기 (대륙 지도: wowf.io 지도 그림) ===================== */
/* 지역 좌표(%) → 대륙 지도 좌표: [a,b,c,d] → x=a+b·X, y=c+d·Y (wowf.io 지점으로 맞춘 값, 오차 1픽셀 안) */
const MAPZ={'그늘숲':[9543.8,12.96,7040.3,8.635],'타나리스':[2080.5,33.131,8515.3,22.092],'엘윈 숲':[9206.6,16.666,6186.9,11.112],'서부 몰락지대':[8495.7,16.808,6888,11.199],'붉은마루 산맥':[10750.7,10.426,6492.2,6.946],'모단 호수':[10900.9,13.242,4530,8.829],'황야의 땅':[10941.6,11.946,5203.3,7.952],'썬더 블러프':[1727.7,5.015,6104,3.34],'달의 숲':[2637.9,11.103,1620.1,7.383],'스톰윈드':[9117,8.338,6214.2,5.559],'가시덤불 골짜기':[8878.1,30.622,7736.9,20.421],'저습지':[10130.7,19.857,3407.1,13.229],'다르나서스':[565.3,5.089,781.4,3.39],'던 모로':[9078.9,23.643,4236.8,15.763],'서부 역병지대':[9743.5,20.65,760.3,13.757],'잊혀진 땅':[-55.9,21.58,5479.2,14.386],'아이언포지':[10286.4,3.8,4569.2,2.535],'텔드랏실':[144.8,24.444,16.9,16.289],'동부 내륙지':[10699.8,18.49,1672.2,12.313],'아라시 고원':[10359.9,17.28,2440,11.518],'힐스브래드 구릉지':[9432.3,15.352,2183.6,10.243],'알터랙 산맥':[9567.9,13.443,1656.5,8.951],'먼지진흙 습지대':[2444.4,25.196,6672,16.797],'어둠의 해안':[564.6,31.425,1696.1,20.958],'불모의 땅':[715.8,48.659,4921.8,32.438],'잿빛 골짜기':[1160.1,27.675,3452.8,18.454],'악령의 숲':[1187.9,27.602,2272,18.403],'여명의 설원':[2128.4,34.075,1600.1,22.719],'운고로 분화구':[1719.8,17.765,8560.3,11.836],'돌발톱 산맥':[418.8,23.426,4296.1,15.629],'페랄라스':[-636.2,33.36,6831.9,22.243],'버섯구름 봉우리':[2185.3,21.101,7599.4,14.089],'실리더스':[758,16.72,8556.2,11.146],'슬픔의 늪':[11011.1,11.008,6994.2,7.336],'저주받은 땅':[10538.7,16.104,7448.3,10.712],'멀고어':[786.9,29.517,5567.5,19.699],'오그리마':[3742.5,6.733,4604.4,4.492],'언더시티':[9523.9,4.622,1474.7,3.07],'아즈샤라':[3548.6,24.349,3132.2,16.226],'이글거리는 협곡':[10099.1,10.707,5304.2,7.137],'불타는 평원':[10072.6,14.051,5750.8,9.375],'티리스팔 숲':[8486.6,21.72,535.7,14.433],'동부 역병지대':[11026.6,20.657,604,13.763],'듀로타':[2921.6,25.31,4828.3,16.905],'은빛소나무 숲':[8287.4,20.169,1573.2,13.5],'셴드랄라스':[1004.4,9.84,6607.6,6.569],'강물터':[10852.1,23.271,5478.4,15.542],'죽음의 고개':[10343.8,12,7111.8,8]};
const ZALIAS={'먼지진흙 슾지대':'먼지진흙 습지대'};const zn=z=>ZALIAS[z]||z;const zEq=(a,b)=>!!a&&zn(a)===zn(b);
const ATL={ek:{n:'eastern-kingdoms',w:5120,h:9728,ko:'동부 왕국'},ka:{n:'kalimdor',w:6400,h:10240,ko:'칼림도어'}};
/* 지도 범위 더하기: 하이잘 산(wowf.io 지도 좌표로 맞춤), '동부 왕국' 전체 좌표 */
Object.assign(MAPZ,{'하이잘 산':[2418.4,16.68,2671,11.09],'동부 왕국':[8192,51.2,0,97.28]});
/* 던전·공격대 안 NPC는 지도에 못 찍으니 입구 자리로 (대략) */
const DGENT={'크롤도크 보루':['강물터','37.5,37.2'],'검은바위 나락':['불타는 평원','29.2,38.2'],'검은바위 첨탑':['불타는 평원','29.2,38.2'],'화산 심장부':['불타는 평원','29.2,38.2'],'검은날개 둥지':['불타는 평원','29.2,38.2'],
 '혈투의 전장':['페랄라스','59.0,44.8'],'줄구룹':['가시덤불 골짜기','53.9,17.6'],'놈리건':['던 모로','24.4,39.8'],'울다만':['황야의 땅','42.6,10.8'],'스트라솔름':['동부 역병지대','27.0,11.5'],'스트라솔룸':['동부 역병지대','27.0,11.5'],
 '스칼로맨스':['서부 역병지대','69.7,73.2'],'아탈학카르 신전':['슬픔의 늪','69.6,53.6'],'가시덩굴 구릉':['불모의 땅','49.0,93.9'],'가시덩굴 우리':['불모의 땅','42.3,89.9'],'죽음의 폐광':['서부 몰락지대','42.6,71.8'],
 '검은심연의 나락':['잿빛 골짜기','14.1,13.9'],'검은심연 나락':['잿빛 골짜기','14.1,13.9'],'마라우돈':['잊혀진 땅','29.1,62.6'],'줄파락':['타나리스','38.7,20.0'],'통곡의 동굴':['불모의 땅','46.0,36.5'],'로데론의 폐허':['티리스팔 숲','61.9,72.0'],
 '영주의 전당':['아이언포지','40.0,55.0'],'깊은굴 지하철':['아이언포지','76.6,51.2'],'오닉시아의 둥지':['먼지진흙 습지대','52.5,76.6'],'안퀴라즈':['실리더스','28.6,92.4'],'안퀴라즈 폐허':['실리더스','36.5,93.5'],"Temple of Ahn'Qiraj":['실리더스','28.6,92.4'],
 '낙스라마스':['동부 역병지대','39.9,25.8'],'그림자송곳니 성채':['은빛소나무 숲','44.8,67.8'],'스톰윈드 지하감옥':['스톰윈드','50.5,66.3']};
function toAtlas(zone,xy){const E=DGENT[zone];if(E&&!MAPZ[zone])return toAtlas(E[0],E[1]);const t=MAPZ[ZALIAS[zone]||zone];if(!t||!xy)return null;const p=String(xy).split(',').map(Number);if(p.length<2||isNaN(p[0]))return null;
  let x=t[0]+t[1]*p[0],y=t[2]+t[3]*p[1];const c=x>=8192?'ek':'ka';if(c==='ek')x-=8192;return {c,x,y}}
function amCanQ(c,q){const L=c.lv;const f=(ui.amf||{}).lv||'now';if(mqDone(c,q)||!qdbOk(c,q)||exOut(c,q))return false;if(f==='all')return (q.m||0)<=L+5;return (q.m||0)<=L&&q.lv>=L-5&&q.lv<=L+3}
const AMF0={g:1,r:0,rt:1,tr:0,fp:0,inn:0,my:1,dg:1,lv:'now'};
const amF=()=>Object.assign({},AMF0,ui.amf||{});
/* 지도 표식 아이콘 (SVG) */
const MKS={gate:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4.5 21V11a7.5 7.5 0 0 1 15 0v10h-3.6v-9.2a3.9 3.9 0 0 0-7.8 0V21z"/><path fill="currentColor" d="M2.5 20.2h19v1.9h-19z"/><circle cx="12" cy="5.6" r="1.1" fill="currentColor"/></svg>',
 check:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M5 12.5l4.6 4.6L19.5 7"/></svg>',
 swords:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M5 4.5l10.5 10.5M19 4.5L8.5 15"/><path d="M13 17.5l4.5-4.5M6.5 13l4.5 4.5"/><path d="M16.8 16.8l2.4 2.4M7.2 16.8l-2.4 2.4"/></svg>'};
const mk=(k,svg)=>'<span class="mk mk-'+k+'">'+svg+'</span>';
const AMIC={g:()=>QMK.g,r:()=>QMK.r,fp:()=>'🦅',inn:()=>'🏠',tr:()=>'<img class="qmk" src="img/ui-book.png" alt="교관">',ob:()=>'⚔️',mo:()=>mk('mo',MKS.swords),mr:()=>QMK.r,mrd:()=>QMK.r,dg:()=>mk('dg',MKS.gate),dgd:()=>mk('dgd',MKS.check)};
/* 지도에 찍을 점: 받는 곳(!)·반납(?)·교관(책)·비행(🦅)·여관(🏠) — 같은 NPC는 하나로 묶음 */
/* 던전 입구 (대략, 지도 핀용) */
const DGLOC={'hall-of-thanes':['아이언포지','40,55'],'ruins-of-lordaeron':['티리스팔 숲','61.9,72'],'wailing-caverns':['불모의 땅','46,36.5'],'deadmines':['서부 몰락지대','42.6,71.8'],'shadowfang-keep':['은빛소나무 숲','44.8,67.8'],
 'blackfathom-deeps':['잿빛 골짜기','14.1,13.9'],'stockade':['스톰윈드','50.5,66.3'],'whelgar-excavation':['저습지','38.5,48.5'],'city-of-dalaran':['알터랙 산맥','17.5,66'],'gnomeregan':['던 모로','24.4,39.8'],
 'razorfen-kraul':['불모의 땅','42.3,89.9'],'sm-graveyard':['티리스팔 숲','82.6,33.8'],'sm-library':['티리스팔 숲','82.6,33.8'],'sm-armory':['티리스팔 숲','82.6,33.8'],'sm-cathedral':['티리스팔 숲','82.6,33.8'],
 'razorfen-downs':['불모의 땅','49,93.9'],'uldaman':['황야의 땅','42.6,10.8'],'zul-farrak':['타나리스','38.7,20'],'maraudon':['잊혀진 땅','29.1,62.6'],'temple-of-atal-hakkar':['슬픔의 늪','69.6,53.6'],
 'blackrock-depths':['불타는 평원','29.2,38.2'],'lower-blackrock-spire':['불타는 평원','29.2,38.2'],'upper-blackrock-spire':['불타는 평원','29.2,38.2'],'dire-maul-east':['페랄라스','59,44.8'],'dire-maul-north':['페랄라스','59,44.8'],'dire-maul-west':['페랄라스','59,44.8'],
 'scholomance':['서부 역병지대','69.7,73.2'],'stratholme-live':['동부 역병지대','27,11.5'],'stratholme-dead':['동부 역병지대','43.7,19.4'],'drowned-city':['가시덤불 골짜기','21,28'],'alcaz-prison':['먼지진흙 습지대','75.5,13.7'],
 'blackmaw-hold':['아즈샤라','38.7,33.4'],'shapers-terrace':['운고로 분화구','48.1,6.1'],'kroldok-stronghold':['강물터','37.5,37.2']};
/* NPC가 던전 안에 있으면(지역 이름이 던전) 지도에는 던전 입구로 */
function dgOfZone(z){if(!z)return null;const n=String(z).replace(/\s/g,'');return DGS.find(d=>d.ko.replace(/\s/g,'')===n||d.ko.split(/[:：]/)[0].replace(/\s/g,'')===n)||null}
function toAtlasDg(zone,xy){if(DGENT[zone]&&!MAPZ[zone]){const e=toAtlas(zone,'50,50');return e?Object.assign(e,{dgIn:zone}):null}const a=toAtlas(zone,xy);if(a)return a;const d=dgOfZone(zone);const L=d&&DGLOC[d.slug];if(!L)return null;const b=toAtlas(L[0],L[1]);return b?Object.assign(b,{dgIn:d.ko}):null}
const dqIsDone=(c,q)=>!!((c.dq||{})[q.id]||(c.mq||{})[q.id]);
/* 입구 하나에 여러 날개(붉은십자군·검은바위·혈투·스트라솔름) → 핀 하나로 */
const dgGroupName=ds=>{if(ds.length<2)return ds[0].ko;const a=ds.map(d=>d.ko.split(/[:：]/)[0].trim());return a.every(x=>x===a[0])?a[0]:ds[0].ko.replace(/\s*(하층|상층|동쪽|서쪽|북쪽)$/,'')}
/* 던전 한눈 상태: 내 퀘스트(퀘스트창)·남은 던전 퀘스트·얻을 장비 */
/* 던전 퀘스트 중 내 직업이 할 수 있는 것만 (호드 전용 제외) */
const dqOf=(c,d)=>d.q.filter(q=>q.side!=='horde'&&(!q.cls||(q.cls&(CLS_BIT[c.cls]||0))));
function dgState(c,d){const Q=dqOf(c,d);const done=Q.filter(q=>dqIsDone(c,q));const inLog=Q.filter(q=>(c.ql||{})[q.id]&&!dqIsDone(c,q));
  const ups=dgUps(c,d).filter(x=>!ownedOf(c,x.it.id)).sort((a,b)=>b.b.g-a.b.g);return {Q,done,inLog,left:Q.filter(q=>!dqIsDone(c,q)),ups,all:Q.length>0&&done.length===Q.length}}
function amPoints(c){const F=amF();const P=new Map();
  const add=(kind,zone,xy,nm,q)=>{const a=toAtlas(zone,xy);if(!a)return;const k=kind+'|'+a.c+'|'+Math.round(a.x/6)+'|'+Math.round(a.y/6);let o=P.get(k);if(!o){o={kind,zone,nm,c:a.c,x:a.x,y:a.y,qs:[]};P.set(k,o)}if(q)o.qs.push(q)};
  if(QDB)for(const q of QDB.values()){if(!amCanQ(c,q))continue;if(F.g&&q.g&&q.g[3]==='npc')add('g',q.g[1],q.g[2],q.g[0],q);if(F.r&&q.r&&q.r[1])add('r',q.r[1],q.r[2],q.r[0],q)}
  /* 내 퀘스트(퀘스트창): 할 일 자리 ⚔️ · 반납 ❓ (다 했으면 ✅) */
  if(F.my&&QDB)Object.keys(c.ql||{}).forEach(k=>{const q=QDB.get(+k);if(!q||mqDone(c,q))return;const FO=amFocus(+k);if(!FO)return;const pg=(c.qp||{})[k]||[];const rdy=(c.ql||{})[k]===2||(pg.length>0&&pg.every(o=>o[0]>=o[1]));
    FO.P.forEach(p=>{if(p.kind==='g'||(p.dg&&F.dg))return;const kind=p.kind==='r'?(rdy?'mrd':'mr'):(rdy?null:'mo');if(!kind)return;const kk=kind+'|'+p.c+'|'+Math.round(p.x/6)+'|'+Math.round(p.y/6);let o=P.get(kk);if(!o){o={kind,zone:p.zone||(p.kind==='r'&&q.r&&q.r[1])||q.z,nm:p.nm,mob:p.mob,c:p.c,x:p.x,y:p.y,qs:[]};P.set(kk,o)}if(!o.qs.includes(q))o.qs.push(q)})});
  /* 던전 입구: 다 했으면 ✅, 아니면 🏰 (같은 입구는 옆으로 조금씩) */
  if(F.dg)DGS.forEach(d=>{const E=DGLOC[d.slug];if(!E)return;const a=toAtlas(E[0],E[1]);if(!a)return;const k='dg|'+E[0]+'|'+E[1];let o=P.get(k);
    if(!o){o={kind:'dg',zone:E[0],nm:'',c:a.c,x:a.x,y:a.y,qs:[],ds:[]};P.set(k,o)}o.ds.push(d);o.d=o.ds[0];o.nm=dgGroupName(o.ds);o.kind=o.ds.every(x=>dgState(c,x).all)?'dgd':'dg'});
  if(WLD){if(F.fp)WLD.fp.forEach(f=>add('fp',f[1],f[2],f[0]));if(F.inn)WLD.inn.forEach(f=>add('inn',f[1],f[2],f[0]));if(F.tr)(WLD.tr[c.cls]||[]).forEach(f=>add('tr',f[1],f[2],f[0]))}
  return [...P.values()]}
/* 지금 할 일 동선: 마을 순서대로 번호 */
function amRoute(c){
  /* 레벨업 탭과 같은 순서: 레벨업 단계(recStages)에서 다음 곳 10군데. 같은 자리에서 이어지는 단계는 한 곳으로 묶음 */
  if(!ui._st){try{recView(c)}catch(e){}}const ST=ui._st;
  if(ST&&ST.length){const out=[];let k=0;
    for(const s0 of ST){k++;if(!s0.xy)continue;const a=toAtlas(s0.zone,s0.xy[0]+','+s0.xy[1]);if(!a)continue;const L=out[out.length-1];
      if(L&&zEq(L.zone,s0.zone)&&Math.hypot(L.zx-s0.xy[0],L.zy-s0.xy[1])<2.5){L.S.push(s0);L.ks.push(k);continue}
      if(out.length>=10)break;out.push({kind:'hub',no:out.length+1,nm:s0.place,zone:s0.zone,zx:s0.xy[0],zy:s0.xy[1],c:a.c,x:a.x,y:a.y,S:[s0],ks:[k]})}
    return out}
  /* 레벨업 단계가 없으면 예전처럼 마을 순서 */
  const S=routeOf(c).find(S=>c.lv>=S.a&&c.lv<=S.b);if(!S)return [];const out=[];let n=0;
  for(const H of nowPlan(c,S)){const left=H.get.filter(x=>!x.done&&!x.prof&&x.q.min<=c.lv).length+H.turn.filter(x=>!x.done&&!x.prof).length;if(!left||H.i>=97)continue;n++;
    const m=H.n.match(/^(.*?) \((\d+), (\d+)\)$/);const xy=m?m[2]+','+m[3]:H.xy?H.xy.join(','):'';if(!xy)continue;const a=toAtlas(H.z,xy);if(!a)continue;const zp=xy.split(',').map(Number);out.push({kind:'hub',no:n,nm:H.npc?H.npc+' 근처':m?m[1]:H.n,zone:H.z,zx:zp[0],zy:zp[1],c:a.c,x:a.x,y:a.y,H})}
  return out}
/* 고른 퀘스트: 받는 곳 → 할 일 위치 → 반납 */
/* 아이템으로 시작하는 퀘스트: 「아이템 · ○○ 처치로 얻음」 */
const gItemNote=g=>g&&g[3]==='item'?(g[4]&&g[4]!==g[0]?' · '+g[4]+'에게서 얻음':' · 아이템을 주우면 시작'):'';
/* 지역 판별용 실제 지점들 (몹 위치 + 퀘스트 NPC) */
const BIGZ=/^(동부 왕국|칼림도어)$/;
/* 지역 이름 자리: 실제 지점들의 가운데(중앙값) — 상자 가운데는 바다일 때가 많아서 */
let _ZCT=null;function zoneCenters(){if(_ZCT)return _ZCT;const S=zoneSamples();if(!S)return null;const G={};S.forEach(p=>{(G[p[0]]=G[p[0]]||[]).push(p)});const med=a=>{a.sort((x,y)=>x-y);return a[a.length>>1]};const R={};
  for(const z in G){const L=G[z];if(L.length<3)continue;R[z]={c:L[0][1],x:med(L.map(p=>p[2])),y:med(L.map(p=>p[3]))}}return _ZCT=R}let _ZS=null;function zoneSamples(){if(_ZS)return _ZS;if(!WLD||!QDB)return null;const S=[];const add=(z,xy)=>{z=zn(z);const t=MAPZ[z];if(!t||BIGZ.test(z))return;const a=toAtlas(z,xy);if(a)S.push([z,a.c,a.x,a.y])};
  for(const z in (WLD.mob||{}))for(const m of WLD.mob[z])add(z,m[4]+','+m[5]);for(const q of QDB.values()){if(q.g&&q.g[2]&&q.g[3]==='npc')add(q.g[1],q.g[2]);if(q.r&&q.r[2])add(q.r[1],q.r[2])}return _ZS=S}
/* 할 일 자리 찾기: 퀘스트 자료 좌표 → (없으면) 던전 퀘스트는 던전 입구 → 잡아야 할 몹이 사는 곳(world.json 몹 위치) */
let _DGQ=null;const dgOfQ=id=>(_DGQ||(_DGQ=new Map(DGS.flatMap(d=>d.q.map(q=>[q.id,d])))) ).get(id);
/* 「지역 (x, y)」 글. 자료가 대륙 지도 좌표(예: 검은바위 산 보들리 = 동부 왕국 48.9, 63.9)면 퀘스트 지역 이름을 앞에 */
function contPlace(z,xy){const a=xy?toAtlas(z,String(xy)):null;if(!a)return '';let best=null;for(const slug in DGLOC){const L=DGLOC[slug];const b=toAtlas(L[0],L[1]);if(!b||b.c!==a.c)continue;const d=Math.hypot(a.x-b.x,a.y-b.y);if(!best||d<best.d)best={d,slug}}
  if(!best||best.d>250)return '';return /blackrock|molten-core|blackwing/.test(best.slug)?'검은바위 산':(DG[best.slug]?DG[best.slug].ko:best.slug)+' 입구 근처'}
function placeTxt(z,xy,id){const c=String(xy||'').replace(',',', ');if(/^(동부 왕국|칼림도어)$/.test(z||'')){const p=contPlace(z,xy);return (p?p+' ':'')+'('+z+' 지도'+(c?' '+c:'')+')'}return (z||'')+(c?' ('+c+')':'')}
/* 할 일 위치를 「지역 좌표」로: 좌표만 있으면 받는 곳 지역으로 착각하기 쉬움(예: 아그몬드의 운명 — 받는 곳은 모단 호수, 단지는 황야의 땅 울다만 입구)
   던전 퀘스트면 던전 안인지 · 입구 근처(15 이내)인지도 붙임 */
function qWhere(id,nm,where){let w=(where||'').replace(/[()]/g,'').trim();const X=QDB&&QDB.get(id);let z='',tt=null;
  if(X){const T=(X.t||[]).filter(t=>t[3]&&t[3][0]);tt=T.find(t=>nm&&t[1]===nm)||T[0];z=tt?tt[3][0]:(X.z||'');if(!w&&tt&&tt[3][1])w=tt[3][1][0]+', '+tt[3][1][1]}
  const m=w.match(/(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)/);const cont=/^(동부 왕국|칼림도어)$/.test(z);
  /* 자료 자리(QuestieDB 몹·물건 자리)와 20 넘게 떨어진 좌표면 다른 자료 자리도 같이 */
  let alt='';if(m&&tt&&tt[3].length>1&&!cont){const C=tt[3].slice(1);const ds=C.map(k=>Math.hypot(k[0]-m[1],k[1]-m[2]));const i=ds.indexOf(Math.min(...ds));if(ds[i]>20)alt=' (다른 자료엔 '+C[0][0]+', '+C[0][1]+')'}
  if(z&&w&&/^\d/.test(w)&&!w.includes(z)&&!cont)w=z+' '+w;
  const dd=dgOfQ(id);if(dd&&w){const L=DGLOC[dd.slug];
    if(z===dd.ko)return w+' · '+dd.ko+' 던전 안';
    const a=m&&z?toAtlas(z,m[1]+','+m[2]):null,b=L?toAtlas(L[0],L[1]):null;
    if(a&&b&&a.c===b.c&&Math.hypot(a.x-b.x,a.y-b.y)<=150)return (cont?L[0]+' '+L[1]+' 근처':w)+' · '+dd.ko+' 입구 근처 (던전 밖)';
    if(cont)return dd.ko+' 쪽 (정확한 자리 자료 없음)'}
  if(cont){const p=m?contPlace(z,m[1]+','+m[2]):'';return p||('정확한 지역 자료 없음 ('+z+' 지도 '+(m?m[1]+', '+m[2]:'')+')')}
  return w+alt}
function mobAt(nm,pz){if(!WLD||!WLD.mob||!nm)return null;let best=null;for(const z in WLD.mob){if(!MAPZ[z]&&!ZALIAS[z])continue;for(const m of WLD.mob[z]){if(m[0]!==nm)continue;const sc=(zEq(z,pz)?1e6:0)+(m[3]||0);if(!best||sc>best.sc)best={z,xy:m[4]+','+m[5],sc}}}return best}
/* 퀘스트 자료(Questie)의 할 일 자리: 몹·물건이 나오는 점들을 묶은 구역 [지역, [x,y,반지름,점 수]…] */
/* 애드온(v3.4)으로 받은 게임 퀘스트 위치 · 받은/반납한 자리 (계정 공용) */
const GQ=id=>DB.gq&&DB.gq[id]||null;
const GOB=id=>DB.gobs&&DB.gobs[id]||null;
/* v3.8 애드온 기록: 이 레벨에 퀘스트를 받을 수 있었음 → 「몇 레벨부터」가 그보다 높게 잡혀 있으면(대개 어림한 값) 내림 */
const GQL=id=>DB.gql&&DB.gql[id]||0;
function gObsApply(){if(!QDB||!DB.gql)return;for(const id in DB.gql){const q=QDB.get(+id);const lv=DB.gql[id];if(q&&lv>0&&lv<(q.m||99)){q.m=lv;q.mObs=1;delete q.mEst}}}
/* 목표 진행도가 오른 자리(애드온 v3.8): 퀘스트 목표 순서(1부터) → [지역, x, y] 최근 3곳 */
const GJP=(id,j)=>{const g=DB.gjp&&DB.gjp[id];if(!g)return null;if(j)return g[j]||null;const k=Object.keys(g).sort()[0];return k?g[k]:null};
function qPlace(q){const G=q&&GQ(q.id);if(G&&G.ph==='o'&&G.o)return {zone:G.o[0],xy:[G.o[1],G.o[2]],nm:'게임 표시 목표',r:3,gm:1};for(const t of (q&&q.t)||[]){const P=t[3];if(!P||!P[0])continue;/* 동선 지도는 지역 좌표(%)로 그려서 큰 지도 좌표가 없는 지역(제프라스 섬)도 됨 */const c=P[1];if(c)return {zone:P[0],xy:[c[0],c[1]],nm:t[1],r:c[2]}}const J=q&&GJP(q.id);if(J&&J[0])return {zone:J[0][0],xy:[J[0][1],J[0][2]],nm:'내가 목표를 한 곳',r:3,gm:1};return null}
function obPlaces(q){const z=(q.g&&q.g[1])||q.z;const out=[];const d=QD.get(q.id);
  /* 게임이 알려 준 목표 위치(퀘스트 목록에 있을 때 애드온이 읽음) → 맨 앞. 길안내 다음 지점이 따로 있으면(동굴 입구 등) 경유지로 */
  {const G=GQ(q.id);if(G&&G.ph==='o'&&G.o&&MAPZ[zn(G.o[0])]){out.push({zone:G.o[0],xy:G.o[1]+','+G.o[2],nm:'게임이 알려 준 목표 위치',r:3,gm:1});
    if(G.w&&zEq(G.w[0],G.o[0])&&Math.hypot(G.w[1]-G.o[1],G.w[2]-G.o[2])>2.5)out.push({zone:G.w[0],xy:G.w[1]+','+G.w[2],nm:'먼저 여기로'+(G.t?': '+G.t:''),via:1})}}
  for(const t of (q.t||[])){const P=t[3];
    if(P&&P[0]&&MAPZ[zn(P[0])]){P.slice(1,3).forEach((c,i)=>{if(out.length<4&&c)out.push({zone:P[0],xy:c[0]+','+c[1],nm:(t[1]||'할 일')+(i?' (여기도 있어요)':''),r:c[2],n:c[3]})});continue}
    /* 이 할 일만 자리가 없으면: 잡을 몹·떨구는 몹 이름으로 사냥터 위치(world.json) */
    if(out.length>=4||dgOfQ(q.id))continue;const names=(t[0]==='처치'&&t[1]?[t[1]]:[]).concat((t[2]||[]).map(m=>m[0]));
    for(const nm of names){const L=mobAt(nm,q.z);if(L&&MAPZ[zn(L.z)]){out.push({zone:L.z,xy:L.xy,nm:t[1]||nm,mob:nm,r:4});break}}}
  if(out.length)return out;
  if(d)for(const t of tasksOf(d,d.obj||q.o||'')){const m=(t.where||'').match(/([\d.]+),\s*([\d.]+)/);if(m)out.push({zone:z,xy:m[1]+','+m[2],nm:t.nm})}
  if(out.length)return out;
  {const g=DB.gjp&&DB.gjp[q.id];if(g){for(const j of Object.keys(g).sort()){const p=(g[j]||[])[0];if(p&&MAPZ[zn(p[0])]&&out.length<4)out.push({zone:p[0],xy:p[1]+','+p[2],nm:'내가 목표를 한 곳',r:3,gm:1})}if(out.length)return out}}
  const dg=dgOfQ(q.id);if(dg&&DGLOC[dg.slug])return [{zone:DGLOC[dg.slug][0],xy:DGLOC[dg.slug][1],nm:dg.ko+' 안에서',dg}];
  const seen=new Set();for(const t of (q.t||[]))for(const m of (t[2]||[])){if(out.length>=3)break;const L=mobAt(m[0],q.z);if(!L)continue;const k=L.z+L.xy;if(seen.has(k))continue;seen.add(k);out.push({zone:L.z,xy:L.xy,nm:t[1]||m[0],mob:m[0]})}
  return out}
function amFocus(id){const q=QDB&&QDB.get(id);if(!q)return null;const z=(q.g&&q.g[1])||q.z;const P=[];
  if(q.g&&(q.g[2]||dgOfZone(q.g[1])||DGENT[q.g[1]])){const a=toAtlasDg(q.g[1],q.g[2]);if(a)P.push(Object.assign(a,{kind:'g',nm:(q.g[3]==='item'&&q.g[4]&&q.g[4]!==q.g[0]?q.g[4]+' (시작 아이템)':q.g[0])+(a.dgIn?' · '+a.dgIn+' 안':''),zone:a.dgIn?null:q.g[1],zxy:a.dgIn?null:q.g[2]}))}
  for(const o of obPlaces(q)){const a=toAtlas(o.zone,o.xy);if(!a)continue;let rx=0,ry=0;if(o.r){const [x,y]=o.xy.split(',').map(Number);const b=toAtlas(o.zone,(x+o.r)+','+(y+o.r));if(b&&b.c===a.c){rx=Math.abs(b.x-a.x);ry=Math.abs(b.y-a.y)}}P.push(Object.assign(a,{kind:'ob',nm:o.nm,mob:o.mob,dg:o.dg,zone:o.zone,zxy:o.xy,rx,ry}))}
  if(q.r&&(q.r[2]||dgOfZone(q.r[1])||DGENT[q.r[1]])){const a=toAtlasDg(q.r[1]||z,q.r[2]);if(a)P.push(Object.assign(a,{kind:'r',nm:q.r[0]+(a.dgIn?' · '+a.dgIn+' 안':''),zone:a.dgIn?null:(q.r[1]||z),zxy:a.dgIn?null:q.r[2]}))}
  return P.length?{q,P}:null}
/* 퀘스트를 눌렀을 때 보기: 「단계」(wythic처럼 목표·받는 곳·할 일·반납 + 이전/다음 단계 + 연계 목록) / 「간단히」(예전) */
function amStyleSeg(){const st=(me().amst||'step');return '<span class="amseg2">'+[['step','단계'],['simple','간단히']].map(x=>'<button class="'+(st===x[0]?'on':'')+'" data-a="amst" data-k="'+x[0]+'">'+x[1]+'</button>').join('')+'</span>'}
function amStepPanel(c,FO){const q=FO.q;const d=QD.get(q.id)||{};const ch=(chainOf(q.id)||[]).filter(r=>r[6]);const ids=ch.map(r=>r[6]);const i=ids.indexOf(q.id);
  const T=tasksOf(d,d.obj||q.o||'');const dn=mqDone(c,q);const MIN=!!ui.ampmin;const where=(x,xy)=>x?' <small>'+esc(x)+(xy?' '+esc(String(xy).split(',').map(v=>Math.round(+v)).join(', ')):'')+'</small>':'';
  let h='<div class="card amcard ams'+(MIN?' min':'')+'"><div class="amsh"><b>'+esc(q.n)+'</b><span class="qlv '+lvCls(q.lv,c.lv)+'">'+(q.lv||'?')+'</span>'+(dn?'<span class="tok">✓</span>':'')
    +'<button class="amsmin" data-a="ampmin" aria-label="'+(MIN?'펼치기':'접기')+'">'+(MIN?'▴ 펼치기':'▾ 접기')+'</button></div>';
  if(!MIN){const obj=d.obj||q.o;if(obj)h+='<p class="amso">'+esc(obj)+'</p>';
    h+='<div class="amsl">'+(q.g?'<div><span class="k g">'+QMK.g+'받는 곳</span><span>'+esc((q.g[0]||'')+gItemNote(q.g))+where(q.g[1],q.g[2])+'</span></div>':'')
      +T.map(t=>'<div><span class="k o">◎ 할 일</span><span>'+esc(t.nm)+(t.where?' <small>'+esc(t.where)+'</small>':'')+'</span></div>').join('')
      +(q.r?'<div><span class="k r">'+QMK.r+'반납</span><span>'+esc(q.r[0]||'')+where(q.r[1],q.r[2])+'</span></div>':'')+'</div>';
    if(!FO.P.some(x=>x.kind==='ob')&&T.length&&!/반납하는 NPC와 이야기/.test(T.map(t=>t.nm).join('')))h+='<p class="mute amsx">할 일 위치 자료가 없어 지도엔 받는 곳·반납만 보여요.</p>'}
  if(ids.length>1){h+='<div class="amsn"><button class="btn sm ghost" data-a="amstep" data-k="'+(ids[i-1]||'')+'"'+(i>0?'':' disabled')+'>← 이전</button><span>연계 <b>'+(i+1)+'</b> / '+ids.length+'</span><button class="btn sm" data-a="amstep" data-k="'+(ids[i+1]||'')+'"'+(i>=0&&i<ids.length-1?'':' disabled')+'>다음 단계 →</button></div>';
    const CO=amChainOn();h+='<div class="amscb"><button class="btn sm'+(CO?'':' ghost')+'" data-a="amchain">🔗 연계 동선 '+(CO?'켜짐':'꺼짐')+'</button><small>'+(CO?'지도에 '+ids.length+'단계 길을 이어서 보여요 · 번호를 누르면 그 단계로':'지금 단계 길만 보여요')+'</small></div>';
    if(!MIN)h+='<details class="amscd"'+(window.innerWidth>=1000||CO?' open':'')+'><summary>연계 '+ids.length+'단계 전체 보기</summary><ol class="amsc">'+ch.map((r,j)=>{const o=QDB.get(r[6]);return '<li class="'+(r[6]===q.id?'on':'')+(o&&mqDone(c,o)?' fin':'')+'"><button data-a="amstep" data-k="'+r[6]+'"><span class="n">'+(o&&mqDone(c,o)&&r[6]!==q.id?'✓':j+1)+'</span><b>'+esc(r[1])+'</b><em>'+(o&&o.z&&o.z!==q.z?esc(o.z)+' · ':'')+(r[2]||'')+'</em></button></li>'}).join('')+'</ol></details>'}
  if(!MIN)h+='<div class="amsb"><button class="btn sm ghost" data-a="qopen" data-k="'+q.id+'">퀘스트 자세히</button><button class="btn sm ghost'+(ui.amall?' on':'')+'" data-a="amall">'+(ui.amall?'이 퀘스트만 보기':'다른 퀘스트도 보기')+'</button>'+amStyleSeg()+'</div>';
  return h+'</div>'}

/* 정보 칸·버튼줄을 뺀 「보이는 곳」 안에 고른 퀘스트를 맞춤. 받는 곳=반납처럼 한 점이면 주변이 보이게 너무 당기지 않음 */
/* 🧭 고른 퀘스트 점들(받는 곳·할 일·반납) 사이 길: 같은 지역이면 길·지형 격자(rgPath)로, 아니면 직선 */
function amNavLegs(fp,cont){const out=[];
  for(let i=1;i<fp.length;i++){const a=fp[i-1],b=fp[i];let pts=null,far=false,est=false;
    if(a.zone&&b.zone&&a.zxy&&b.zxy&&zn(a.zone)===zn(b.zone)){const pa=String(a.zxy).split(',').map(Number),pb=String(b.zxy).split(',').map(Number);
      const rp=Math.hypot(pb[0]-pa[0],pb[1]-pa[1])>=1?rgPath(a.zone,pa,pb):null;
      if(rp&&!rp.far){pts=[a];rp.p.slice(1,-1).forEach(p=>{const q=toAtlas(a.zone,p[0]+','+p[1]);if(q&&q.c===cont)pts.push(q)});pts.push(b)}else if(rp&&rp.far)far=true}
    if(!pts){pts=[a,b];est=true}
    let L=0;for(let k=1;k<pts.length;k++)L+=Math.hypot(pts[k].x-pts[k-1].x,pts[k].y-pts[k-1].y);
    out.push({pts,far,est,L})}
  return out}
/* 지도에서 옆 정보 칸(PC 오른쪽)에 안 가리는 부분의 가운데 x */
function amVisCx(el){const W=el.clientWidth;const pn=document.getElementById('ampanel');if(pn&&pn.offsetHeight){const R=el.getBoundingClientRect(),pr=pn.getBoundingClientRect();if(pr.width<W*.7&&pr.left>R.left)return Math.round((pr.left-R.left)/2)}return Math.round(W/2)}
/* 🔗 연계 퀘스트 전체 동선: 고른 퀘스트가 연계 중 하나면 앞뒤 단계 점들도 순서대로 (ui.amchain 0이면 끔) */
const amChainOn=()=>me()&&(me().amchain===undefined?true:!!me().amchain);
function amChainSteps(id){if(!amChainOn())return null;const ch=(chainOf(id)||[]).filter(r=>r[6]);if(ch.length<2)return null;
  return ch.map((r,j)=>{const F=amFocus(r[6]);return F?{id:r[6],no:j+1,q:F.q,P:F.P}:null}).filter(Boolean)}
/* 지도 맞춤에 쓸 점: 연계 동선이 켜져 있으면 연계 전체, 아니면 이 퀘스트만 */
function amFitPts(FO){const S=amChainSteps(FO.q.id);const c0=FO.P[0].c;const P0=S?[].concat(...S.map(x=>x.P)).filter(p=>p.c===c0):FO.P.filter(p=>p.c===c0);
  return P0.concat(...amNavLegs(P0,c0).filter(g=>!g.far).map(g=>g.pts))}
function amFitV(FO){const el=document.getElementById('amap');if(!el||!FO||!FO.P.length)return null;
  /* 길 안내 선이 핀 밖으로 돌아 나가도, 연계 전체 동선도 화면에 다 들어오게 */const P=amFitPts(FO);
  const R=el.getBoundingClientRect(),W=el.clientWidth,H=el.clientHeight;const top=el.querySelector('.amtop'),pn=document.getElementById('ampanel'),ctl=el.querySelector('.amctl');
  let pT=top?Math.max(0,top.getBoundingClientRect().bottom-R.top)+40:60,pB=24,pL=56,pR=ctl?Math.max(30,R.right-ctl.getBoundingClientRect().left)+44:60;/* 오른쪽 버튼에 핀 이름·단계 번호가 가리지 않게 넉넉히 */
  if(pn&&pn.offsetHeight){const pr=pn.getBoundingClientRect();if(pr.width>W*.7)pB=Math.max(pB,R.bottom-pr.top+16);else pR=Math.max(pR,R.right-pr.left+16)}
  const vw=Math.max(80,W-pL-pR),vh=Math.max(80,H-pT-pB);
  const xs=P.map(p=>p.x),ys=P.map(p=>p.y);const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  const s=Math.min((vw-60)/Math.max(170,x1-x0),(vh-60)/Math.max(140,y1-y0));const z=Math.max(W<600?.4:1.2,Math.min(2.7,3+Math.log2(s)));/* 폰은 좁아서 먼 퀘스트(지역 끝↔끝)도 다 보이게 더 멀리까지 */const s2=2**(z-3);
  const vcx=pL+vw/2,vcy=pT+vh/2;return {c:P[0].c,z,cx:(x0+x1)/2-(vcx-W/2)/s2,cy:(y0+y1)/2-(vcy-H/2)/s2}}
/* 고른 퀘스트의 받는 곳·할 일·반납이 다 보이게 지도 맞추기 */
function amFit(FO){const el=document.getElementById('amap');const W=el?el.clientWidth:380,H=el?el.clientHeight:420;const P=amFitPts(FO);
  const xs=P.map(p=>p.x),ys=P.map(p=>p.y);const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  const ph=window.matchMedia&&matchMedia('(min-width:1000px)').matches?0:.5;/* 폰은 아래 절반이 정보 칸 */
  const s=Math.min((W-90)/Math.max(60,x1-x0),(H*(1-ph)-90)/Math.max(60,y1-y0));const z=Math.max(W<600?.4:1.2,Math.min(3.3,3+Math.log2(s)));const s2=2**(z-3);
  return {c:P[0].c,z,cx:(x0+x1)/2,cy:(y0+y1)/2+(H*ph/2)/s2}}
function amLegend(F){const r=(ic,t)=>'<li><span class="lgi">'+ic+'</span>'+t+'</li>';
  return '<div class="amleg'+(ui.amleg?' on':'')+'" data-am="legx"><b>지도 표시 <small>눌러서 닫기</small></b><ul>'
   +(F.my?r('<span class="amk k-mo">'+AMIC.mo()+'</span>','내 퀘스트 할 일 (몹·물건 있는 곳)')+r('<span class="amk k-mr">'+QMK.r+'</span>','내 퀘스트 반납하는 곳')+r('<span class="amk k-mrd">'+QMK.r+'</span>','다 했어요 · 반납하러 가기'):'')
   +(F.dg?r('<span class="amk k-dg">'+AMIC.dg()+'</span>','던전 입구')+r('<span class="amk k-dgd">'+AMIC.dgd()+'</span>','던전 퀘스트 다 함'):'')
   +(F.g?r('<span class="amk">'+QMK.g+'</span>','받을 수 있는 퀘스트'):'')+(F.r?r('<span class="amk">'+QMK.r+'</span>','반납할 곳'):'')
   +(F.rt?r('<span class="amh lg">1</span>','지금 할 일 마을 순서 (점선 = 이동)'):'')+'</ul></div>'}
function amView(c){if(!QDB)qdbLoad();if(!WLD)wldLoad();const F=amF();
  if(!ui.am)ui.am=amHome(c);
  const A=ui.am;const chip=(k,lab)=>'<button class="chip'+(F[k]?' on':'')+'" data-a="amf" data-k="'+k+'">'+lab+'</button>';
  const nOn=['rt','g','r','tr','fp','inn','my','dg'].filter(k=>F[k]).length;
  return '<div class="am'+(ui.amfull?' full':'')+'"><div id="amap" class="amap"><div class="amL"></div><div class="amP"></div>'
   +'<div class="amtop">'+(ui.amback?'<button class="amback" data-a="amback">← 퀘스트로</button>':'')+'<div class="amseg">'+['ek','ka'].map(k=>'<button class="'+(A.c===k?'on':'')+'" data-a="amc" data-k="'+k+'">'+ATL[k].ko+'</button>').join('')+'</div>'
   +'<button class="amfb'+(ui.amfo?' on':'')+'" data-a="amfo">표시 '+nOn+' ▾</button>'+gmStyleSeg(c)+'</div>'
   +(ui.amfo?'<div class="ampop"><div class="chips">'+chip('my','📜 내 퀘스트')+chip('dg','🏰 던전')+chip('rt','① 동선')+chip('g',QMK.g+'받는 곳')+chip('r',QMK.r+'반납')+chip('tr',AMIC.tr()+'교관')+chip('fp','🦅 비행')+chip('inn','🏠 여관')+'</div>'
     +'<div class="ampopr"><small>퀘스트 누르면</small>'+amStyleSeg()+'</div><div class="chips seg">'+[['now','내 레벨 ±'],['all','모든 레벨']].map(x=>'<button class="chip'+((F.lv||'now')===x[0]?' on':'')+'" data-a="amlv2" data-k="'+x[0]+'">'+x[1]+'</button>').join('')+'</div></div>':'')
   +'<div class="amctl"><button data-am="full" aria-label="전체 화면">'+(ui.amfull?'✕':'⛶')+'</button><button data-am="in" aria-label="확대">+</button><button data-am="out" aria-label="축소">−</button><button data-am="me" aria-label="지금 구간으로">◎</button><button data-am="pin" class="ampinb'+(ui.ampin?' on':'')+'" aria-label="지도에 메모 남기기">📍</button><button data-am="leg" class="amlegb'+(ui.amleg?' on':'')+'" aria-label="지도 표시 설명">?</button></div>'+amLegend(F)
   +(QDB?'':'<div class="amload">퀘스트 자료를 불러오는 중…</div>')+(ui.amfull?'<button class="amexit" data-am="full">✕ 작게 보기</button>':ui.amback?'<button class="amexit" data-a="amback">← 보던 퀘스트로 돌아가기</button>':'')+'<div id="ampanel"></div></div>'
   +'<p class="mute src amhint">끌어서 움직이고, 두 손가락·두 번 톡·+/− 로 확대 · 번호는 레벨업 탭 단계 순서 · 기본은 한 곳씩(아래 카드의 이전·다음) · 지도: wowf.io</p></div>'}
function amHome(c){const R=amRoute(c);if(R.length){const r=R[Math.max(0,Math.min(ui.amall?0:ui.amstep||0,R.length-1))];return {c:r.c,z:2.6,cx:r.x,cy:r.y}}
  const S=routeOf(c).find(S=>c.lv>=S.a&&c.lv<=S.b);const z=S?S.z.split(' · ')[0]:'';const a=toAtlas(z,'50,50');return a?{c:a.c,z:2,cx:a.x,cy:a.y}:{c:'ek',z:0.3,cx:2560,cy:4864}}
let AM=null;
function amInit(){const el=document.getElementById('amap');if(!el)return;const c=me();if(!c)return;const F=amF();
  const st={el,L:el.querySelector('.amL'),P:el.querySelector('.amP'),pts:amPoints(c),route:F.rt?amRoute(c):[],drag:null,ptr:new Map(),tap:0};AM=st;
  const NT={ek:[[3,5],[5,10],[10,19],[20,38]],ka:[[4,6],[7,12],[13,23],[25,40]]};
  const clamp=()=>{const A=ui.am,T=ATL[A.c];A.z=Math.max(0,Math.min(3.6,A.z));A.cx=Math.max(0,Math.min(T.w,A.cx));A.cy=Math.max(0,Math.min(T.h,A.cy))};
  function draw(){clamp();const A=ui.am,T=ATL[A.c],W=el.clientWidth,H=el.clientHeight,s=2**(A.z-3),left=A.cx-W/2/s,top=A.cy-H/2/s;
    /* 지도 그림: 화면 밀도(레티나)에 맞춰 더 선명한 단계를 일찍 받고, 이미 받은 칸은 그대로 두고 자리만 옮김(깜빡임·흐림 줄임).
       맨 아래엔 0단계(작은 전체 그림)를 깔아 새 칸이 오기 전에도 빈칸이 안 보이게 함 */
    const dpr=Math.min(1,Math.log2(Math.max(1,window.devicePixelRatio||1)));
    const tz=Math.max(0,Math.min(3,Math.ceil(A.z+dpr-0.3)));
    const TL=st.tiles||(st.tiles=new Map());if(st.tc!==A.c){TL.forEach(i=>i.remove());TL.clear();st.tc=A.c}
    const want=new Set();
    const lay=(z,base)=>{const span=256*2**(3-z),ts=256*2**(A.z-z);const [nx,ny]=NT[A.c][z];
      const tx0=Math.max(0,Math.floor(left/span)),ty0=Math.max(0,Math.floor(top/span)),tx1=Math.min(nx-1,Math.floor((left+W/s)/span)),ty1=Math.min(ny-1,Math.floor((top+H/s)/span));
      for(let x=tx0;x<=tx1;x++)for(let y=ty0;y<=ty1;y++){const k=z+'/'+x+'_'+y;want.add(k);let im=TL.get(k);
        if(!im){im=document.createElement('img');im.alt='';im.draggable=false;im.decoding='async';im.onerror=()=>{im.style.visibility='hidden'};im.onload=()=>{im.dataset.ok=1;sweep()};im.src='https://assets.wowf.io/world/atlas/'+T.n+'/'+k+'.webp';im.dataset.z=z;TL.set(k,im);st.L.appendChild(im)}
        im.style.cssText='left:'+(x*span-left)*s+'px;top:'+(y*span-top)*s+'px;width:'+(ts+.6)+'px;height:'+(ts+.6)+'px;z-index:'+(base?0:z===tz?2:1)+(im.style.visibility==='hidden'?';visibility:hidden':'')}};
    if(tz>0)lay(0,1);lay(tz,0);
    /* 지금 단계 칸이 다 오면 그 전 단계 칸은 치움 (오기 전엔 아래에 남겨 흐린 칸이라도 보이게) */
    function sweep(){const cur=[...TL.entries()].filter(([k,i])=>want.has(k)&&+i.dataset.z===tz);const done=cur.every(([k,i])=>i.dataset.ok||i.style.visibility==='hidden');
      TL.forEach((i,k)=>{if(want.has(k))return;if(done||+i.dataset.z===tz){i.remove();TL.delete(k)}})}
    /* 남겨 둔 이전 단계 칸도 같이 움직이게 */
    TL.forEach((im,k)=>{if(want.has(k))return;const z=+im.dataset.z;const [xy]=[k.split('/')[1]];const [x,y]=xy.split('_').map(Number);const span=256*2**(3-z),ts=256*2**(A.z-z);
      im.style.left=(x*span-left)*s+'px';im.style.top=(y*span-top)*s+'px';im.style.width=im.style.height=(ts+.6)+'px';im.style.zIndex=1});
    sweep();if(TL.size>400){TL.forEach((i,k)=>{if(!want.has(k)){i.remove();TL.delete(k)}})}
    st.L.style.transform=st.P.style.transform='';
    const X=p=>(p.x-left)*s,Y=p=>(p.y-top)*s,inV=(x,y,m)=>x>-m&&y>-m&&x<W+m&&y<H+m;
    const vis=st.pts.filter(p=>p.c===A.c);let pins='',svg='';
    /* 땅 이름 (와우 지도처럼): 화면에서 지역이 충분히 크면 이름, 멀리서 보면 받을 퀘스트 수도 */
    const zoneNames=(Z,RZ)=>{const ZC=zoneCenters()||{};let o='';const seen=[];
      /* 화면에 보이는 실제 지점들 (지역 가운데가 화면 밖이면 보이는 부분 가운데에 이름) */const VS={};(zoneSamples()||[]).forEach(p=>{if(p[1]!==A.c)return;const x=X({x:p[2]}),y=Y({y:p[3]});if(x<30||y<80||x>W-70||y>H-50)return;(VS[p[0]]=VS[p[0]]||[]).push([x,y])});
      const med=a=>{a=a.slice().sort((u,v)=>u-v);return a[a.length>>1]};
      /* 동선 번호·던전 표식과 겹치면 이름을 위/아래로 비켜 놓기 */const OB=[...st.route.filter(r=>r.c===A.c),...vis.filter(p=>/^(dg|mo)/.test(p.kind))].map(p=>[X(p),Y(p)]).filter(p=>inV(p[0],p[1],80));
      for(const z in MAPZ){if(ZALIAS[z]||BIGZ.test(z))continue;const t=MAPZ[z];const wpx=100*t[1]*s;if(wpx<(Z?150:120))continue;const q=ZC[z]||toAtlas(z,'50,50');if(!q||q.c!==A.c)continue;let x=X(q),y=Y(q);
        if(!(x>20&&y>70&&x<W-60&&y<H-40)){const L=VS[z];if(!L||L.length<2)continue;x=med(L.map(p=>p[0]));y=med(L.map(p=>p[1]))}
        const n=Z&&Z[z]?Z[z].n:0;const fs=Math.round(Math.max(12,Math.min(A.z<1.5?17:24,wpx/11)));const hw=z.length*fs*.55+16,hh=fs/2+(n?20:14);
        let y2=y;for(const k of [0,-1,1,-2,2]){const yy=y+k*(hh+8);if(!OB.some(p=>Math.abs(p[0]-x)<hw&&Math.abs(p[1]-yy)<hh)){y2=yy;break}}
        if(seen.some(p=>Math.abs(p[0]-x)<60&&Math.abs(p[1]-y2)<fs+6))continue;seen.push([x,y2]);const y_=y2;
        o+='<button class="amzn'+(RZ&&RZ.has(z)?' now':'')+(A.z>=2.6?' far':'')+'" '+(n?'data-amz':'data-amzi')+'="'+esc(z)+'" style="left:'+x+'px;top:'+y_+'px;font-size:'+fs+'px"><span>'+esc(z)+'</span>'+(n?'<small>'+QMK.g+n+'</small>':'')+'</button>'}
      return o};
    const FOC=ui.amq&&!ui.amall;/* 퀘스트 하나 보기: 다른 퀘스트 핀·마을 동선은 숨기고 지역 이름만 */
    if(FOC){if(A.z<3.6)pins+=zoneNames(null,null)}
    else if(A.z<1.5){const Z={};vis.forEach(p=>{if(p.kind!=='g'&&p.kind!=='r')return;const o=Z[p.zone]||(Z[p.zone]={n:0,x:0,y:0,k:0});o.n+=p.qs.length;o.x+=p.x;o.y+=p.y;o.k++});
      const RZ=new Set(st.route.map(r=>r.zone));
      vis.filter(p=>!p.qs.length).forEach(p=>{const x=X(p),y=Y(p);if(inV(x,y,20))pins+='<span class="amd" style="left:'+x+'px;top:'+y+'px">'+AMIC[p.kind]()+'</span>'})
      pins+=zoneNames(Z,RZ)}
    else{if(A.z<3.6)pins+=zoneNames(null,null);
      const lab=A.z>=3.3;
      /* 화면에서 26px 안에 겹치는 점은 하나로 묶음 */const HS=st.route.filter(r=>r.c===A.c).map(r=>[X(r),Y(r)]);const CL=[];vis.forEach((p,i)=>{const x=X(p),y=Y(p);if(!inV(x,y,20)||/^dg/.test(p.kind))return;if((p.kind==='g'||p.kind==='r')&&HS.some(h=>Math.abs(h[0]-x)<16&&Math.abs(h[1]-y)<16))return;const k=CL.find(o=>Math.abs(o.x-x)<26&&Math.abs(o.y-y)<26);if(k)k.m.push(i);else CL.push({x,y,m:[i]})});st.cl=CL;
      CL.forEach((o,ci)=>{if(o.m.length<2)return;const ps=o.m.map(i=>vis[i]);const n=ps.reduce((a,p)=>a+p.qs.length,0);const kinds=[...new Set(ps.map(p=>p.kind))];
        pins+='<button class="amk amcl'+(ui.amcl===ci?' sel':'')+'" data-amcl="'+ci+'" style="left:'+o.x+'px;top:'+o.y+'px">'+(kinds.length===1?AMIC[kinds[0]]():QMK.g)+'<b>'+(n||ps.length)+'</b><s>'+ps.length+'곳</s></button>'});
      const solo=new Set(CL.filter(o=>o.m.length===1).map(o=>o.m[0]));
      vis.forEach((p,i)=>{const isDg=/^dg/.test(p.kind);if(!solo.has(i)&&!isDg)return;const x=X(p),y=Y(p);if(!inV(x,y,20))return;const n=p.qs.length;const lv=n?Math.min(...p.qs.map(q=>q.lv||c.lv)):0;
        pins+='<button class="amk k-'+p.kind+(n?' '+lvCls(lv,c.lv):'')+(ui.amsel===i?' sel':'')+'" data-amk="'+i+'" title="'+esc(p.nm||'')+'" style="left:'+x+'px;top:'+y+'px">'+AMIC[p.kind]()+(n>1?'<b>'+n+'</b>':'')+(/^m/.test(p.kind)&&p.qs.length===1&&(c.qp||{})[p.qs[0].id]&&p.kind!=='mrd'?'<em>'+(c.qp[p.qs[0].id]).map(o=>o[0]+'/'+o[1]).join(' ')+'</em>':'')+((lab||isDg&&A.z>=2)&&p.nm?'<i>'+esc(p.nm)+'</i>':'')+'</button>'})}
    /* 동선 번호와 선 */
    /* 동선 번호와 선 — 기본은 「한 곳씩」: 지금 갈 곳(크게) · 지나온 곳 · 다음 곳(흐리게)만, 「전체 보기」면 다음 10곳 모두 */
    const RA=FOC?[]:st.route;const STEP=!ui.amall&&RA.length>0;const si=Math.max(0,Math.min(ui.amstep||0,RA.length-1));
    const role=r=>!STEP?'':r===RA[si]?' cur':r===RA[si-1]?' pv':' nx';
    const R=(STEP?[RA[si-1],RA[si],RA[si+1]].filter(Boolean):RA).filter(r=>r.c===A.c);
    const segs=(L,cls)=>{if(L.length<2)return;let run=[L[0]];const flush=()=>{if(run.length>1)svg+='<polyline points="'+run.map(r=>X(r)+','+Y(r)).join(' ')+'" class="'+cls+'"/>'};
      for(let i=1;i<L.length;i++){const a=L[i-1],b=L[i];if(zn(a.zone)!==zn(b.zone)){flush();svg+='<line x1="'+X(a)+'" y1="'+Y(a)+'" x2="'+X(b)+'" y2="'+Y(b)+'" class="'+cls+' far"/>';run=[b]}
        else{/* 같은 지역 안: 길 따라(격자가 있으면). 배·비행으로 보이는 먼 길은 흐린 직선 */const rp=a.zx!=null&&b.zx!=null?rgPath(a.zone,[a.zx,a.zy],[b.zx,b.zy]):null;
          if(rp&&rp.far){flush();svg+='<line x1="'+X(a)+'" y1="'+Y(a)+'" x2="'+X(b)+'" y2="'+Y(b)+'" class="'+cls+' far"/>';run=[b]}
          else{if(rp)rp.p.slice(1,-1).forEach(p=>{const q=toAtlas(a.zone,p[0]+','+p[1]);if(q&&q.c===A.c)run.push(q)});run.push(b)}}}flush()};
    if(R.length){
      if(STEP){const pv=RA[si-1],cu=RA[si],nx=RA[si+1];if(pv&&pv.c===A.c&&cu.c===A.c)segs([pv,cu],'amrt');if(nx&&nx.c===A.c&&cu.c===A.c)segs([cu,nx],'amrt nx')}else segs(R,'amrt');
      const RG=[];R.forEach(r=>{const x=X(r),y=Y(r);const g=STEP?null:RG.find(o=>Math.hypot(o.x-x,o.y-y)<26);if(g){g.m.push(r);r.grp=g.m}else{const m=[r];r.grp=m;RG.push({x,y,m})}});
      RG.forEach(o=>{if(!inV(o.x,o.y,30))return;const nos=o.m.map(r=>r.no);const cu=STEP&&o.m[0]===RA[si];pins+='<button class="amh'+(nos.length>1?' multi':'')+role(o.m[0])+(!STEP&&nos.includes(ui.amhub)?' sel':'')+'" data-amh="'+nos[0]+'" style="left:'+o.x+'px;top:'+o.y+'px">'+nos.join('·')+'</button>'+(cu?'<span class="amhl" style="left:'+o.x+'px;top:'+(o.y+22)+'px">'+esc(o.m[0].nm)+'</span>':'')})}
    /* 고른 퀘스트 */
    const FO=ui.amq&&amFocus(ui.amq);let chainTot=0,chainN=0;
    /* 🔗 연계 전체 동선: 다른 단계는 흐린 선, 단계 번호 동그라미(누르면 그 단계로) */
    if(FO){const CS=amChainSteps(FO.q.id);if(CS){const cur=CS.findIndex(x=>x.id===FO.q.id);let prev=null;const BADG=[];
      CS.forEach((st2,j)=>{const P=st2.P.filter(p=>p.c===A.c);if(!P.length){prev=null;return}const done=mqDone(c,st2.q);
        const seq=(prev?[prev]:[]).concat(P);if(j!==cur){for(const g of amNavLegs(seq,A.c)){if(!g.far){chainTot+=g.L}const pl=g.pts.map(p=>X(p).toFixed(1)+','+Y(p).toFixed(1)).join(' ');
            svg+='<polyline points="'+pl+'" class="amch'+(done?' done':'')+(g.far?' far':'')+'"/>'}}
        else if(prev){for(const g of amNavLegs([prev,P[0]],A.c)){if(!g.far)chainTot+=g.L;svg+='<polyline points="'+g.pts.map(p=>X(p).toFixed(1)+','+Y(p).toFixed(1)).join(' ')+'" class="amch'+(g.far?' far':'')+'"/>'}}
        chainN++;const g0=P[0];let x=X(g0);const y=Y(g0);/* 같은 NPC에서 시작하는 단계가 여럿이면 번호를 옆으로 나란히 */while(BADG.some(b=>Math.abs(b[0]-x)<22&&Math.abs(b[1]-y)<18))x+=24;BADG.push([x,y]);if(inV(x,y,20))pins+='<button class="amcs'+(j===cur?' on':'')+(done?' fin':'')+'" data-amst="'+st2.id+'" style="left:'+x+'px;top:'+y+'px" title="'+esc(st2.q.n)+'">'+(done&&j!==cur?'✓':st2.no)+'</button>';
        prev=P[P.length-1]})}}
    if(FO){const fp=FO.P.filter(p=>p.c===A.c);
      /* 할 일 구역: 노란 점선 동그라미 (wythic처럼) */const rr=Math.max(16,Math.min(70,11*2**(A.z-2)));fp.filter(p=>p.kind==='ob').forEach(p=>{const ex=p.rx?Math.max(14,p.rx*s):rr*1.35,ey=p.ry?Math.max(12,p.ry*s):rr;svg+='<ellipse cx="'+X(p)+'" cy="'+Y(p)+'" rx="'+ex+'" ry="'+ey+'" class="amob"/>'});
      /* 🧭 길 안내(내비처럼): 같은 지역 안이면 실제 길·지형 격자로 경로를 그리고, 가운데에 방향 화살표, 위에 거리·시간 */
      if(fp.length>1){let tot=0,est=false;const AR=[];
        for(const g of amNavLegs(fp,A.c)){const pts=g.pts,far=g.far,L=g.L;if(!far)tot+=L;if(g.est)est=true;
          const pl=pts.map(p=>X(p).toFixed(1)+','+Y(p).toFixed(1)).join(' ');
          if(far)svg+='<polyline points="'+pl+'" class="amfq far"/>';
          else if(pts.length>2)svg+='<polyline points="'+pl+'" class="amnv0"/><polyline points="'+pl+'" class="amnv"/>';
          else svg+='<polyline points="'+pl+'" class="amfq"/>';
          /* 구간 가운데 화살표 */if(!far&&L*s>60){let h=L/2;for(let k=1;k<pts.length;k++){const d=Math.hypot(pts[k].x-pts[k-1].x,pts[k].y-pts[k-1].y);if(h<=d||k===pts.length-1){const f=d?Math.min(1,h/d):0,mx=pts[k-1].x+(pts[k].x-pts[k-1].x)*f,my=pts[k-1].y+(pts[k].y-pts[k-1].y)*f;AR.push([(mx-left)*s,(my-top)*s,Math.atan2(pts[k].y-pts[k-1].y,pts[k].x-pts[k-1].x)]);break}h-=d}}}
        AR.forEach(r=>{if(inV(r[0],r[1],10))pins+='<i class="amar" style="left:'+r[0].toFixed(1)+'px;top:'+r[1].toFixed(1)+'px;--a:'+r[2].toFixed(3)+'rad"></i>'});
        /* 거리·시간: 우리 지도 0.48칸 = 1야드, 달리기 7야드/초, 40레벨 탈것(60%) 11.2야드/초 */
        const yd=tot/0.48;if(yd>=60||chainTot){const mn=v=>Math.max(1,Math.round(yd/v/60));const cy=(tot+chainTot)/0.48,cm=v=>Math.max(1,Math.round(cy/v/60));
          if(chainTot&&chainN>1){const tb=el.querySelector('.amtop');const nTop=tb?Math.max(8,Math.round(tb.getBoundingClientRect().bottom-el.getBoundingClientRect().top)-14):10;
            pins+='<div class="amnvi" style="top:'+nTop+'px;left:'+amVisCx(el)+'px">🔗 연계 '+chainN+'단계 전체 · <b>약 '+Math.round(cy/10)*10+'야드</b> · 걸어서 '+cm(7)+'분'+(c.lv>=40?' · 탈것 '+cm(11.2)+'분':'')+'<br><small>이번 단계 '+Math.round(yd/10)*10+'야드 · 걸어서 '+mn(7)+'분</small></div>'}else{
          /* 위쪽 조작 줄(동부 왕국/칼림도어·표시)에 가리지 않게 그 바로 아래에 */const tb=el.querySelector('.amtop');const nTop=tb?Math.max(8,Math.round(tb.getBoundingClientRect().bottom-el.getBoundingClientRect().top)-14):10;
          pins+='<div class="amnvi" style="top:'+nTop+'px;left:'+amVisCx(el)+'px">🧭 '+(fp.length>2?'받기 → 할 일 → 반납':'다음 곳까지')+' · <b>'+(est?'약 ':'')+Math.round(yd/10)*10+'야드</b> · 걸어서 '+mn(7)+'분'+(c.lv>=40?' · 탈것 '+mn(11.2)+'분':'')+'</div>'}}}
      const put=[];fp.forEach(p=>{let x=X(p),y=Y(p);const x0=x,y0=y;let k=0;while(put.some(q=>Math.abs(q[0]-x)<30&&Math.abs(q[1]-y)<30)&&k<6){x+=(k%2?-1:1)*(34+17*k);k++}
        /* 받는 NPC=반납 NPC처럼 같은 이름이 바로 옆에 있으면 이름은 한 번만 */const dup=k>0&&put.some(q=>q[2]===p.nm&&Math.abs(q[3]-x0)<4&&Math.abs(q[4]-y0)<4);put.push([x,y,p.nm,x0,y0]);/* 받는 곳=반납처럼 같은 자리면 옆으로 비켜 둘 다 보이게 */
        pins+='<span class="amf k-'+p.kind+(k%2?' up':'')+'" style="left:'+x+'px;top:'+y+'px">'+AMIC[p.kind]()+(dup?'':'<i>'+esc(p.nm||'')+'</i>')+'</span>'})}
    /* 지금 보고 있는 지역 (가운데 기준) */let cur='';if(A.z>=1.5){let best=1e9;const ZC=new Set();for(const z in MAPZ){const t=MAPZ[z];const ox=A.c==='ek'?A.cx+8192:A.cx;const px=(ox-t[0])/t[1],py=(A.cy-t[2])/t[3];if(px<0||px>100||py<0||py>100)continue;const q=toAtlas(z,'50,50');if(!q||q.c!==A.c)continue;if(BIGZ.test(z)||ZALIAS[z])continue;ZC.add(z);/* 겹치는 지역 상자 중 가운데 쪽에 더 깊이 들어간 지역 */const sc=-Math.min(px,100-px,py,100-py);if(sc<best){best=sc;cur=z}}
      /* 상자가 겹치면: 가장 가까운 실제 지점(퀘스트 NPC·몹)이 속한 지역 */if(ZC.size>1){const S=zoneSamples();if(S){let bd=1e18,bz='';for(const p of S){if(p[1]!==A.c||!ZC.has(p[0]))continue;const d=(p[2]-A.cx)**2+(p[3]-A.cy)**2;if(d<bd){bd=d;bz=p[0]}}if(bz)cur=bz}}}
    pins+=cur?'<button class="amcur" data-amzi="'+esc(cur)+'">🗺️ '+esc(cur)+' <b>정보 ›</b></button>':'';
    /* 📍 내 지도 메모 */((c.notes&&c.notes.p)||[]).forEach((n,i)=>{if(n.c!==A.c)return;const x=(n.x-left)*s,y=(n.y-top)*s;if(x<-40||y<-40||x>W+40||y>H+40)return;pins+='<button class="amk amnote" data-amnote="'+i+'" style="left:'+x+'px;top:'+y+'px">📍<i>'+esc((n.t||'메모').slice(0,14))+'</i></button>'});
    st.P.innerHTML=(svg?'<svg class="amsvg" width="'+W+'" height="'+H+'">'+svg+'</svg>':'')+pins;st.vis=vis}
  st.draw=draw;draw();
  const zoomAt=(dz,px,py)=>{const A=ui.am,s=2**(A.z-3),W=el.clientWidth,H=el.clientHeight;const ax=A.cx+(px-W/2)/s,ay=A.cy+(py-H/2)/s;A.z+=dz;clamp();const s2=2**(A.z-3);A.cx=ax-(px-W/2)/s2;A.cy=ay-(py-H/2)/s2;draw()};
  st.zoomAt=zoomAt;
  el.addEventListener('pointerdown',e=>{if(e.target.closest('.amctl,#ampanel,.amtop,.ampop,.amexit,.amleg'))return;el.setPointerCapture(e.pointerId);st.ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(st.ptr.size===1)st.drag={x:e.clientX,y:e.clientY,dx:0,dy:0,t:e.target};else{const [a,b]=[...st.ptr.values()];const r=el.getBoundingClientRect();st.pinch={d:Math.hypot(a.x-b.x,a.y-b.y),r:1,cx:(a.x+b.x)/2-r.left,cy:(a.y+b.y)/2-r.top};st.drag=null}});
  el.addEventListener('pointermove',e=>{if(!st.ptr.has(e.pointerId))return;st.ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(st.pinch&&st.ptr.size>=2){const [a,b]=[...st.ptr.values()];st.pinch.r=Math.hypot(a.x-b.x,a.y-b.y)/st.pinch.d;const o=st.pinch.cx+'px '+st.pinch.cy+'px';st.L.style.transformOrigin=st.P.style.transformOrigin=o;st.L.style.transform=st.P.style.transform='scale('+st.pinch.r+')';return}
    if(st.drag){st.drag.dx=e.clientX-st.drag.x;st.drag.dy=e.clientY-st.drag.y;st.L.style.transform=st.P.style.transform='translate('+st.drag.dx+'px,'+st.drag.dy+'px)'}});
  const up=e=>{if(!st.ptr.has(e.pointerId))return;st.ptr.delete(e.pointerId);const r=el.getBoundingClientRect();
    if(st.pinch){if(st.ptr.size===0){const p=st.pinch;st.pinch=null;st.L.style.transformOrigin=st.P.style.transformOrigin='';zoomAt(Math.log2(Math.max(.2,p.r)),p.cx,p.cy)}return}
    const d=st.drag;st.drag=null;if(!d)return;
    if(Math.abs(d.dx)+Math.abs(d.dy)<6){const nb=d.t.closest&&d.t.closest('[data-amnote]');if(nb){ui.sheet='note:'+nb.dataset.amnote;rerender(true);return}
      if(ui.ampin&&!(d.t.closest&&d.t.closest('.amctl,.amtop,#ampanel,.ampop,.amexit,.amcur,.amleg,.amnvi'))){const A=ui.am,s=2**(A.z-3),W=el.clientWidth,H=el.clientHeight;const ax=A.cx-W/2/s+(e.clientX-r.left)/s,ay=A.cy-H/2/s+(e.clientY-r.top)/s;
        c.notes=c.notes||{};c.notes.p=c.notes.p||[];c.notes.p.push({c:A.c,x:Math.round(ax*10)/10,y:Math.round(ay*10)/10,t:'',at:Date.now()});ui.ampin=false;save();ui.sheet='note:'+(c.notes.p.length-1);ui.noteNew=1;rerender(true);return}
      const k=d.t.closest&&d.t.closest('[data-amk],[data-amz],[data-amh],[data-amzi],[data-amcl],[data-amst]');
      if(k&&k.dataset.amcl){ui.amcl=+k.dataset.amcl;ui.amsel=null;ui.amhub=null;ui.amzone=null;const o=st.cl[ui.amcl];if(ui.am.z<3.2){zoomAt(Math.min(1,3.4-ui.am.z),o.x,o.y);ui.amcl=null}else{draw();amPanel({kind:'cl',ps:o.m.map(i=>st.vis[i])})}return}
      if(k&&k.dataset.amst){ui.amq=+k.dataset.amst;ui.amsel=null;ui.amhub=null;ui.amzone=null;draw();amPanel({kind:'focus'});return}
      if(k&&k.dataset.amzi){ui.amzone=k.dataset.amzi;ui.amsel=null;ui.amhub=null;draw();amPanel({kind:'zone',zone:ui.amzone});return}
      if(k&&k.dataset.amz){const a=toAtlas(k.dataset.amz,'50,50');if(a){ui.am={c:a.c,z:2,cx:a.x,cy:a.y};ui.amsel=null;ui.amzone=k.dataset.amz;draw();amPanel({kind:'zone',zone:ui.amzone})}return}
      if(k&&k.dataset.amh){ui.amzone=null;ui.amsel=null;if(!ui.amall&&!ui.amq){ui.amstep=Math.max(0,st.route.findIndex(x=>x.no===+k.dataset.amh));ui.amhub=null;draw();amPanel(amStepP(st.route));return}ui.amhub=+k.dataset.amh;draw();amPanel(st.route.find(x=>x.no===ui.amhub));return}
      if(k&&k.dataset.amk){ui.amzone=null;ui.amsel=+k.dataset.amk;ui.amhub=null;draw();amPanel(st.vis[ui.amsel]);return}
      const now=Date.now();if(now-st.tap<320){st.tap=0;zoomAt(1,e.clientX-r.left,e.clientY-r.top)}else{st.tap=now;st.L.style.transform=st.P.style.transform=''}return}
    const s=2**(ui.am.z-3);ui.am.cx-=d.dx/s;ui.am.cy-=d.dy/s;draw()};
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  el.addEventListener('wheel',e=>{if(e.target.closest('#ampanel,.ampop'))return;e.preventDefault();const r=el.getBoundingClientRect();zoomAt(e.deltaY<0?.5:-.5,e.clientX-r.left,e.clientY-r.top)},{passive:false});
  el.querySelectorAll('[data-am]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const r=el.getBoundingClientRect();const k=b.dataset.am;
    if(k==='full'){ui.amfull=!ui.amfull;document.body.classList.toggle('amfull',!!ui.amfull);if(ui.amfull){try{history.pushState({amfull:1},'')}catch(e){}}else if(history.state&&history.state.amfull){try{history.back()}catch(e){}}rerender(true);return}
    if(k==='pin'){ui.ampin=!ui.ampin;b.classList.toggle('on',!!ui.ampin);el.classList.toggle('pinmode',!!ui.ampin);toast(ui.ampin?'📍 메모를 남길 자리를 지도에서 눌러 주세요':'메모 남기기를 껐어요');return}
    if(k==='leg'||k==='legx'){ui.amleg=!ui.amleg;const LB=el.querySelector('.amlegb');if(LB)LB.classList.toggle('on',!!ui.amleg);const L=el.querySelector('.amleg');if(L)L.classList.toggle('on',!!ui.amleg);return}
    if(k==='in')zoomAt(1,r.width/2,r.height/2);else if(k==='out')zoomAt(-1,r.width/2,r.height/2);else{ui.am=amHome(c);ui.amq=null;draw();amPanel(null)}}));
  if(ui.amq)amPanel({kind:'focus'});else if(ui.amzone)amPanel({kind:'zone',zone:ui.amzone});else if(ui.amhub&&st.route.find(x=>x.no===ui.amhub))amPanel(st.route.find(x=>x.no===ui.amhub));else if(ui.amsel!=null&&st.vis&&st.vis[ui.amsel])amPanel(st.vis[ui.amsel]);else if(!ui.amall&&st.route.length&&st.route[0].S)amPanel(amStepP(st.route));else if(ui.amall&&st.route.length&&st.route[0].S)amPanel({kind:'allhint',n:st.route.length})}
/* 한 곳씩 보기 카드: 지금 곳 + 이전·다음 */
function amStepP(R){const i=Math.max(0,Math.min(ui.amstep||0,R.length-1));return Object.assign({},R[i],{grp:null,step:{i,n:R.length}})}
function amRow(c,q,id){return '<div class="amrow"><button class="lhq" data-a="qopen" data-k="'+(id||q.id)+'"><span class="qlv '+lvCls(q.lv,c.lv)+'">'+q.lv+'</span><span class="t"><b>'+esc(q.n||q.nm)+'</b><span>'+esc(((q.o||'').length>60?(q.o||'').slice(0,58)+'…':(q.o||'')))+'</span></span></button>'+(QDB&&QDB.get(id||q.id)?'<button class="amgo" data-a="amq" data-k="'+(id||q.id)+'" title="지도에 할 일 위치 보기">📍</button>':'')+'</div>'}
function amPx(box){const cd=box.querySelector('.card');if(cd&&!cd.querySelector('.ampx'))cd.insertAdjacentHTML('afterbegin','<button class="ampx" data-a="ampx" aria-label="닫기">✕</button>')}
function amPanel(p){const box=document.getElementById('ampanel');if(!box)return;const c=me();if(p!==ui._amp){ui.amdg=null;ui._amp=p}if(!p){box.innerHTML='';const am=document.querySelector('.am');if(am)am.classList.remove('amfoc');return}setTimeout(()=>amPx(box),0);
  {const am=document.querySelector('.am');if(am)am.classList.toggle('amfoc',p.kind==='focus')}
  if(p.kind==='focus'){const FO=amFocus(ui.amq);if(!FO){box.innerHTML='';return}const q=FO.q;
    const refit=()=>{if(!ui.amfit)return;ui.amfit=0;const v=amFitV(FO);if(v&&AM&&AM.draw){ui.am=v;AM.draw()}};
    if((me().amst||'step')==='step'){box.innerHTML=amStepPanel(me(),FO);requestAnimationFrame(refit);return}
    box.innerHTML='<div class="card amcard"><div class="amh2"><b>📍 '+esc(q.n)+'</b>'+amStyleSeg()+'<button class="btn sm ghost" data-a="amq" data-k="">끄기</button></div><p class="mute">'+FO.P.map(x=>AMIC[x.kind]()+' '+esc(x.nm||'')).join(' → ')+'</p>'
     +(FO.P.some(x=>x.kind==='ob')?'':'<p class="mute">할 일 위치 자료가 없어서 받는 곳·반납하는 곳만 보여요.</p>')+'</div>';requestAnimationFrame(refit);return}
  if(p.kind==='cl'){box.innerHTML='<div class="card amcard">'+p.ps.map(x=>'<div class="amh"><b>'+AMIC[x.kind]()+' '+esc(x.nm||'')+'</b><span class="mute">'+esc(x.zone)+'</span></div>'+x.qs.sort((a,b)=>a.lv-b.lv).map(q=>amRow(c,q)).join('')).join('<hr class="amhr">')+'</div>';amPx(box);return}
  if(p.kind==='zone'){box.innerHTML='<div class="card amcard">'+zoneInfo(c,p.zone,{title:1,btn:1})+'</div>';return}
  if(p.kind==='allhint'){box.innerHTML='<div class="card amcard"><div class="amh"><b>레벨업 다음 '+p.n+'곳</b><span class="mute">번호를 누르면 그 곳에서 할 일이 나와요</span></div><div class="amnav"><button class="btn sm pri" data-a="amall">한 곳씩 보기</button></div></div>';return}
  if(p.kind==='hub'&&p.S){const G=(p.grp||[p]);
    box.innerHTML='<div class="card amcard"><div class="amh"><b>'+G.map(g=>g.no).join('·')+'. '+esc(p.nm)+'</b><span class="mute">'+esc(p.zone)+' · 레벨업 단계 '+G.flatMap(g=>g.ks).join('·')+'번째</span></div>'
     +G.flatMap(g=>g.S).flatMap(s0=>s0.items.map(it=>amRow(c,{n:RST[s0.type][0]+' · '+it.q.nm,lv:it.q.lv,o:s0.type==='do'?s0.place:''},it.q.id))).join('')
     +(p.step?'<div class="amnav"><button class="btn sm" data-a="amstp" data-k="-1"'+(p.step.i?'':' disabled')+'>◀ 이전</button><b>'+(p.step.i+1)+' / '+p.step.n+'</b><button class="btn sm pri" data-a="amstp" data-k="1"'+(p.step.i<p.step.n-1?'':' disabled')+'>다음 ▶</button><button class="btn sm ghost" data-a="amall">전체 보기</button></div>':(ui.amall&&!ui.amq?'<div class="amnav"><button class="btn sm ghost" data-a="amall">한 곳씩 보기</button></div>':''))+'</div>';return}
  if(p.kind==='hub'){const H=p.H;const rows=[...H.turn.filter(x=>!x.done).map(x=>[x,1]),...H.get.filter(x=>!x.done).map(x=>[x,0])];
    box.innerHTML='<div class="card amcard"><div class="amh"><b>'+p.no+'. '+esc(p.nm)+'</b><span class="mute">'+esc(p.zone)+' · '+QMK.g+'받기 '+H.get.filter(x=>!x.done).length+(H.turn.filter(x=>!x.done).length?' · '+QMK.r+'반납 '+H.turn.filter(x=>!x.done).length:'')+'</span></div>'
     +rows.map(([x,t])=>amRow(c,{n:(t?'❓ ':'')+x.q.nm,lv:x.q.lv,o:t?((x.rv||'')+'에게 반납'):''},x.q.id)).join('')+'</div>';return}
  if((p.kind==='dg'||p.kind==='dgd')&&p.ds&&p.ds.length>1&&!ui.amdg){
    box.innerHTML='<div class="card amcard"><div class="amh"><b>🏰 '+esc(p.nm)+'</b><span class="mute">'+esc(p.zone)+' 입구 근처 · 안에 던전 '+p.ds.length+'곳</span></div>'
     +p.ds.map(d=>{const S=dgState(c,d);return '<button class="amdgw" data-a="amdg" data-k="'+d.slug+'"><b>'+esc(d.ko)+'</b><small>Lv '+d.lo+'–'+d.hi+' · '+(S.Q.length?'퀘스트 '+S.done.length+'/'+S.Q.length:'던전 퀘스트 없음')+(S.inLog.length?' · 퀘스트창 '+S.inLog.length:'')+(S.ups.length?' · 내 장비 '+S.ups.length:'')+'</small>'+(S.all?'<span class="dgok">✅</span>':'')+'<i>›</i></button>'}).join('')+'</div>';return}
  if(p.kind==='dg'||p.kind==='dgd'){const d=(ui.amdg&&p.ds&&p.ds.find(x=>x.slug===ui.amdg))||p.d,S=dgState(c,d);
    box.innerHTML='<div class="card amcard"><div class="amh"><b>🏰 '+esc(d.ko)+(S.all?' <span class="dgok">✅ 던전 퀘스트 다 했어요</span>':'')+'</b><span class="mute">Lv '+d.lo+'–'+d.hi+' · '+esc(p.zone)+' 입구 근처 · '+(S.Q.length?'퀘스트 '+S.done.length+'/'+S.Q.length:'던전 퀘스트 없음')+'</span></div>'
     +(S.inLog.length?'<h4 class="amh4">📜 퀘스트창에 있는 것 '+S.inLog.length+'</h4>'+S.inLog.map(q=>amRow(c,{n:((QDB&&QDB.get(q.id))||{}).n||q.nm,lv:q.lv,o:(qpHtml(c,q.id)?'진행 '+((c.qp||{})[q.id]||[]).map(o=>o[0]+'/'+o[1]).join(' · '):'')},q.id)).join(''):'')
     +(!S.all&&S.left.length>S.inLog.length?'<p class="mute">아직 안 받은 던전 퀘스트 '+(S.left.length-S.inLog.length)+'개 — 던전 화면 퀘스트 탭에서 볼 수 있어요</p>':'')
     +(S.ups.length?'<h4 class="amh4">⚔️ 여기서 얻을 내 장비 '+S.ups.length+'</h4>'+S.ups.slice(0,4).map(x=>'<div class="amit">'+itIcon(x.it)+'<span><b>'+itName(x.it)+'</b><small>'+esc(SLOT_KO[x.b.s]||'')+' · +'+(x.b.g>=10?Math.round(x.b.g):x.b.g.toFixed(1))+'</small></span></div>').join(''):'<p class="mute">여기서 바꿀 장비는 없어요</p>')
     +'<div class="amdgb">'+(p.ds&&p.ds.length>1?'<button class="btn sm ghost" data-a="amdg" data-k="">‹ 다른 날개</button>':'')+'<button class="btn sm" data-a="dgo" data-k="'+d.slug+'">던전 공략·템 보기 ›</button></div></div>';return}
  if(p.kind==='mo'||p.kind==='mr'||p.kind==='mrd'){box.innerHTML='<div class="card amcard"><div class="amh"><b>'+AMIC[p.kind]()+' '+esc(p.nm||'')+'</b><span class="mute">📜 내 퀘스트 · '+(p.kind==='mo'?(p.mob&&p.mob!==p.nm?esc(p.mob)+' 잡으면 나와요':'할 일 자리'):p.kind==='mrd'?'다 했어요 · 반납하러 가세요':'반납하는 곳')+' · '+esc(zn(p.zone||''))+'</span></div>'
     +p.qs.map(q=>amRow(c,{n:q.n,lv:q.lv,o:((c.qp||{})[q.id]?'진행 '+((c.qp||{})[q.id]).map(o=>o[0]+'/'+o[1]).join(' · ')+' · ':'')+(q.o||'')},q.id)).join('')+'</div>';return}
  const t=p.kind==='fp'?'🦅 비행 조련사':p.kind==='inn'?'🏠 여관 주인':p.kind==='tr'?AMIC.tr()+' 직업 교관':p.kind==='r'?QMK.r+' 반납하는 곳':QMK.g+' 받는 곳';
  box.innerHTML='<div class="card amcard"><div class="amh"><b>'+esc(p.nm||'')+'</b><span class="mute">'+t+' · '+esc(zn(p.zone))+'</span></div>'
   +(p.qs.length?p.qs.sort((a,b)=>a.lv-b.lv).map(q=>amRow(c,q)).join(''):'<p class="mute">'+(p.kind==='fp'?'처음 가면 말 걸어서 비행 경로를 열어 두세요':p.kind==='tr'?'새 기술을 배우러 오는 곳이에요':'귀환석을 여기 맞출 수 있어요')+'</p>')+'</div>'}

/* ===== 지역 정보: 이 지역에서 얻는 장비(퀘스트 보상·몹 드랍)·이동·사냥터 ===== */
let SRCIT=null;function srcItems(){if(SRCIT)return SRCIT;SRCIT=new Map();ITEMS.forEach(it=>it.src.forEach(i=>{let a=SRCIT.get(i);if(!a)SRCIT.set(i,a=[]);a.push(it)}));return SRCIT}
function zoneItems(c,zone){const L=c.lv;const out=new Map();let nq=0,nd=0;
  const put=(it,how,lv,kind)=>{if(!it||!it.sl||!usable(it,c)||it.ob>L+4)return;if(kind==='q')nq++;else nd++;const b=bestSlot(it,c);const o={it,how,lv:Math.max(lv||0,it.ob||0),g:b?b.g:0,s:b&&b.s,kind};const p=out.get(it.id);if(!p||o.g>p.g)out.set(it.id,o)};
  if(QDB)for(const q of QDB.values()){if(!(zEq(q.z,zone)||(q.g&&zEq(q.g[1],zone)))||!qdbOk(c,q)||mqDone(c,q)||exOut(c,q))continue;const r=qRw(q.id);
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
function clsQuests(c){if(!QDB)return null;const L=c.lv;const dn=id=>{const q=QDB.get(id);return !q||!qdbOk(c,q)||mqDone(c,q)};
  const out=[],seen=new Set();for(const q of QDB.values()){if(!q.cls||!qdbOk(c,q)||mqDone(c,q)||exOut(c,q)||/행사|축제|침공/.test(q.z||''))continue;if((q.m||0)>L+1||(q.lv||0)>L+5||(q.lv||0)<L-10)continue;
    /* 앞 퀘스트: pre는 모두 끝내야, pre1은 그중 하나만 끝내면 받을 수 있음 (preFirst와 같은 규칙) */
    if(q.pre1&&q.pre1.length&&!q.pre1.some(dn))continue;if(q.pre&&q.pre.length&&!q.pre.every(dn))continue;if(seen.has(q.n))continue;seen.add(q.n);out.push(q)}
  return out.sort((a,b)=>(a.m||0)-(b.m||0)||a.lv-b.lv)}
/* 야영지 전문기술 물건(1단계, 숙련 20) — 블리자드·가이드에 나온 것만 */
const CAMP={'대장기술':['숯돌 바퀴','힘'],'재봉술':['진영 깃발','정신력 (같은 진영)'],'약초채집':['향초','지능'],'연금술':['마나 샘','마나 회복'],'채광':['자석석','근접 전투력'],'무두질':['야영 의자','치명타 2%'],'응급치료':['응급 상자','체력']};
function restHtml(c){const L=c.lv,X=myXp(c);let h='';
  if(X){const pct=Math.round(X.rest/X.max*100);h+='<p><b>휴식 경험치 '+pct+'%</b> '+(pct>=10?'남았어요 — 쓰는 동안 <b>몹 경험치 2배</b> (퀘스트 보상은 그대로)':'거의 없어요 — 여관·대도시에서 접속을 끊으면 8시간마다 레벨의 5%씩, 최대 150%까지 쌓여요')+'</p>'}
  else h+='<p><b>휴식 경험치</b> 여관·대도시에서 접속을 끊으면 8시간마다 레벨의 5%씩(최대 150%) 쌓이고, 쓰는 동안 몹 경험치가 2배예요. 부캐는 여관에 세워 두세요.</p>';
  h+='<p><b>포근한 침낭</b> '+(L>=14?'':'(14레벨부터) ')+'퀘스트로 얻어요. 쉬면 1분마다 경험치 +1%, 최대 +3% · 1시간마다 쓸 수 있어요.</p>';
  h+='<p><b>야영지</b> 모닥불(요리)을 피우고 앉아서 쉬면 1시간 버프. 한 사람이 물건 1개씩, 모닥불 하나에 3개까지 · 직업 버프와는 겹치지 않아요.</p>';
  const mine=(c.profs||[]).filter(p=>CAMP[p]);if(mine.length)h+='<p class="mute">내 전문기술 물건(숙련 20부터): '+mine.map(p=>esc(p)+' → <b>'+CAMP[p][0]+'</b>('+CAMP[p][1]+')').join(' · ')+'</p>';
  else h+='<p class="mute">전문기술 숙련 20이면 야영지 물건을 만들어요: 대장기술 숯돌 바퀴(힘) · 재봉술 진영 깃발(정신력) · 약초채집 향초(지능) · 채광 자석석(전투력) · 무두질 야영 의자(치명타) 등</p>';
  h+='<p><b>요리 음식</b> 능력치 버프 음식을 먹고 나가세요.</p>';return h}
/* 레거시(포에버 계정 진척도): 캐릭터당 16점. 모험 트리 — Well Rested 5, Thrill of Adventure 5, Talented 5(Well Rested 5 필요) */
function legacyHtml(c){const L=c.lv;const reag=['mage','priest','paladin','shaman','warlock','druid','rogue'].includes(c.cls);
  const plan=L<15?[['Well Rested',5,'휴식 경험치가 최대 20% 더 빨리·더 많이 쌓여요'],['Talented',5,'특성 포인트를 더 일찍(최대 5레벨부터) 받아요'],['Thrill of Adventure',5,'몹을 잡을 때마다 생명력·마나 5% 회복 (던전 제외)']]
    :[['Well Rested',5,'휴식 경험치가 최대 20% 더 빨리·더 많이 쌓여요'],['Thrill of Adventure',5,'몹을 잡을 때마다 생명력·마나 5% 회복 → 쉬는 시간이 줄어요 (던전 제외)'],['Gourmand',3,'음식 버프가 더 오래가요']];
  if(reag)plan.push(['Reagent Economy',1,'직업 기술 재료 부담이 줄어요']);
  const sp='<p class="mute">점수 얻는 곳(모두 65점): 직업마다 25·45·60레벨 27점 · 제작 전문기술 18점 · PvP 12점 · 탐험 2점 · 레이드 3점 · 던전 3점 — '+SPELUNK.map(S=>S[1]+' '+S[2].filter(x=>spDone(c,x)).length+'/'+S[2].length).join(' · ')+' (던전 화면에서 확인)</p>';
  let n=0;return sp+'<p>레벨업용으로 이 순서로 찍으세요 (캐릭터당 16점까지):</p>'+plan.map(p=>{n+=p[1];return '<p><b>'+p[0]+' '+p[1]+'점</b> <span class="mute">누적 '+n+'</span><br><span class="mute">'+p[2]+'</span></p>'}).join('')
   +'<p class="mute">'+(L<15?'새로 키우는 부캐는 재능(Talented)이 좋아요. 60레벨이 되면 빼고 다른 데 쓰세요.':'15레벨이 넘으면 재능(Talented)은 효과가 거의 없어요.')+''+' 재능은 휴식(Well Rested)을 5점 다 찍어야 열려요.</p>'}
/* 비행 경로를 열었나: 애드온 이름(「마을, 지역」) 지역이 같거나, 직접 표시 */
function fpKnown(c,f){if((c.fpk||{})[f[0]+'|'+f[1]])return 'm';if(!c.taxi)return false;const z=zn(f[1]);return c.taxi.some(t=>{const p=t.split(/,\s*/);return zn(p[p.length-1])===z||zn(p[0])===z})?'a':false}
/* 몹 이름 → 그 몹이 떨구는 장비 (forg 출처 「드랍 · 몹」) */
let _MDI=null;function mobDropsById(){if(_MDI)return _MDI;_MDI={};ITEMS.forEach(it=>it.src.forEach(i=>{const s=SRC[i];if(s&&s.k===3){const m=(s.href||'').match(/npc=(\d+)/);if(m){const o=_MDI[m[1]]=_MDI[m[1]]||{nm:s.label.replace(/^드랍 · /,'').trim(),its:[]};o.its.push(it)}}}));return _MDI}
let _MD=null;function mobDrops(){if(_MD)return _MD;_MD={};ITEMS.forEach(it=>it.src.forEach(i=>{const s=SRC[i];if(s&&s.k===3){const nm=s.label.replace(/^드랍 · /,'').trim();if(nm&&!/미공개/.test(nm))(_MD[nm]=_MD[nm]||[]).push(it)}}));return _MD}
function lvHelp(c,S,NX){if(!WLD)wldLoad();if(!QDB)qdbLoad();const L=c.lv;const C=D_CLS[c.cls];const zs=S?S.z.split(' · '):[];
  const CKO=(CINFO[c.cls]||[])[0]||'';let rows=[];
  /* 1) 직업 퀘스트 */
  const cq=clsQuests(c);
  if(cq===null)rows.push(['cls',qico('cls'),CKO+' 직업 퀘스트','<p class="mute">퀘스트 자료를 불러오는 중…</p>']);
  else if(cq.length){const now=cq.filter(q=>(q.m||0)<=L),soon=cq.filter(q=>(q.m||0)>L);
    rows.push(['cls',qico('cls'),CKO+' 직업 퀘스트 '+now.length+'개'+(soon.length?' · 곧 '+soon.length+'개':''),
      now.slice(0,4).map(q=>'<button class="lhq" data-a="qopen" data-k="'+q.id+'"><span class="qlv '+lvCls(q.lv,L)+'">'+q.lv+'</span><span class="t"><b>'+esc(q.n)+'</b><span>'+(q.g&&q.g[3]==='item'?'📦 아이템으로 시작 · '+esc(q.z||''):q.g&&q.g[0]?esc(q.g[0])+' · '+esc(q.g[1]||'')+(q.g[2]?' '+xyTxt(q.g[2]):''):'')+(exPeers(c,q).length?' · <b class="ex1">택1: '+exPeers(c,q).slice(0,2).map(x=>esc(x.n)).join('·')+(exPeers(c,q).length>2?' 등':'')+'과 하나만</b>':'')+'</span></span>'+(q.id>=10000?qico('fnew'):'')+'</button>').join('')
      +(now.length>4?'<button class="lhm" data-a="qmode" data-k="map">나머지 '+(now.length-4)+'개는 맵 전체 › 직업에서</button>':'')
      +(soon.length?'<p class="mute">🔒 '+soon.slice(0,3).map(q=>esc(q.n)+' ('+q.m+'레벨)').join(' · ')+'</p>':'')])}
  else{let nm=99,nq=null;for(const q of QDB.values()){if(q.cls&&qdbOk(c,q)&&!mqDone(c,q)&&!exOut(c,q)&&!/행사|축제|침공/.test(q.z||'')&&(q.m||0)>L&&(q.m||0)<nm&&!q.pre1&&!(q.pre&&q.pre.length)){nm=q.m;nq=q}}
    rows.push(['cls',qico('cls'),CKO+' 직업 퀘스트','<p class="mute">지금 레벨에 할 직업 퀘스트는 없어요.'+(nq?' 다음은 <b>'+nm+'레벨</b> 「'+esc(nq.n)+'」('+esc(nq.g&&nq.g[1]||nq.z||'')+')부터예요.':'')+'</p>'])}
  /* 2) 교관 */
  if(C&&C.learns){const from=c.trn!=null?c.trn:L-2;const ls=C.learns.filter(l=>l[0]>from&&l[0]<=L&&(!l[4]||l[4]==='alliance')&&(!l[7]||l[7]===c.race));
    const nx=C.learns.filter(l=>l[0]>L&&(!l[4]||l[4]==='alliance')&&(!l[7]||l[7]===c.race));const nxL=nx.length?nx[0][0]:0;
    const T=(WLD&&WLD.tr[c.cls])||[];const t=T.find(x=>zs.includes(x[1]))||T.find(x=>x[1]===CAPITAL[c.race])||T[0];
    if(ls.length)rows.push(['trn','<img class="hic" src="img/ui-book.png" alt="">','교관에게 배울 기술 '+ls.length+'개',
      '<div class="lhs">'+ls.map(l=>'<span>'+esc(l[1])+(l[2]>1?' '+l[2]+'단계':'')+(l[3]?' <em>새 기술</em>':'')+'</span>').join('')+'</div>'
      +(t?'<p class="mute">가까운 교관: <b>'+esc(t[0])+'</b> · '+esc(t[1])+' '+xyTxt(t[2])+'</p>':'')
      +'<button class="btn sm ghost" data-a="trn">교관 다녀왔어요</button>']);
    else if(nxL)rows.push(['trn','<img class="hic" src="img/ui-book.png" alt="">','교관','<p class="mute">다음 기술은 <b>'+nxL+'레벨</b>에 배워요 ('+nx.filter(l=>l[0]===nxL).map(l=>esc(l[1])).join(' · ')+')</p>'])}
  /* 3) 던전 */
  const dq=c.dq||{};const D=DGS.filter(d=>d.lo&&d.lo<=L+1&&d.hi>=L&&d.lo>=10).sort((a,b)=>a.lo-b.lo).slice(0,3);
  if(D.length)rows.push(['dg','<img class="hic" src="img/eye.png" alt="">','지금 갈 만한 던전',D.map(d=>{const n=dqOf(c,d).filter(q=>(q.min||0)<=L&&!dqIsDone(c,q)).length;
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
  /* 비행 경로: 이 구간·다음 구간 지역에서 아직 안 연 곳 */
  if(WLD&&WLD.fp){const zz=[...new Set(zs.concat(NX?NX.z.split(' · '):[]).map(zn))];const F=WLD.fp.filter(f=>zz.includes(zn(f[1])));
    const st0=F.map(f=>({f,k:fpKnown(c,f)}));if(F.length&&st0.some(x=>!x.k)){const st=st0;const un=st.filter(x=>!x.k);
      rows.push(['fp','🦅',un.length?'안 연 비행 경로 '+un.length+'곳':'비행 경로 다 열었어요',
        '<p class="mute">'+(c.taxi?'애드온에서 가져온 비행 경로로 확인했어요.':'애드온(v3.2 이상)으로 가져오면 자동으로 확인해요. 연 곳은 「열었어요」를 눌러 주세요.')+' 지나가는 길에 비행 조련사와 대화하면 열려요.</p>'
        +st.sort((a,b)=>(!!a.k)-(!!b.k)).map(({f,k})=>'<div class="fpr'+(k?' ok':'')+'"><span class="m"><b>'+(k?'✅ ':'🦅 ')+esc(f[1])+'</b><small>'+esc(f[0])+' · '+esc(f[2].replace(',',', '))+'</small></span>'+(k==='m'||!k?'<button class="btn sm '+(k?'ghost':'')+'" data-a="fpk" data-k="'+esc(f[0]+'|'+f[1])+'">'+(k?'취소':'열었어요')+'</button>':'')+'</div>').join('')])}}
  /* 네임드·희귀 몹: 이 구간 지역에서 장비를 떨구는 몹 (자리: 퀘스트 자료의 몹 위치) */
  if(WLD){const zz=zs.map(zn);const out=[];
    if(WLD.np){const M=mobDropsById();for(const id in M){const p=WLD.np[id];if(!p||!zz.includes(zn(p[0])))continue;if(p[5]&&(p[5]<L-4||p[4]>L+5))continue;out.push({z:p[0],m:[p[6]||M[id].nm,p[4],p[5],p[7],p[1],p[2]],rank:p[3],its:M[id].its})}}
    else{const M=mobDrops();zs.forEach(z=>(WLD.mob[z]||WLD.mob[zn(z)]||[]).forEach(m=>{const its=M[m[0]];if(!its||m[2]<L-4||m[1]>L+5)return;out.push({z,m,rank:0,its})}))}
    out.forEach(o=>{o.best=o.its.map(it=>({it,b:usable(it,c)?bestSlot(it,c):null})).sort((x,y)=>((y.b||{}).g||0)-((x.b||{}).g||0))});
    if(out.length){out.sort((a,b)=>(((b.best[0].b||{}).g||0)-((a.best[0].b||{}).g||0))||(a.m[3]-b.m[3]));const top=out.slice(0,6);const nG=out.filter(o=>((o.best[0].b||{}).g||0)>.01).length;
      const RK={1:'정예',2:'희귀 정예',4:'희귀'};
      rows.push(['rare','👑','네임드·희귀 몹 '+out.length+'마리'+(nG?' <small class="lhg">⭐ 좋은 템 '+nG+'</small>':''),
        '<p class="mute">이 구간에서 장비를 떨구는 몹이에요. 희귀 몹은 자주 안 보이니 보이면 잡으세요.</p>'+top.map(({z,m,rank,best})=>'<div class="rmr"><span class="m"><span class="mt"><b>'+esc(m[0])+'</b> <span class="qlv '+lvCls(m[2]||L,L)+'">'+(m[1]===m[2]?m[1]:m[1]+'–'+m[2])+'</span>'+(RK[rank]?' <i class="rk">'+RK[rank]+'</i>':'')+'</span><small>'+esc(z)+' '+m[4]+', '+m[5]+(m[3]&&m[3]<=3&&!RK[rank]?' · 자리 '+m[3]+'곳':'')+'</small></span>'
          +best.slice(0,2).map(x=>'<button class="rmi" data-a="'+(x.b&&x.b.g>.01?'cmpq':'info')+'" data-k="'+(x.b&&x.b.g>.01?x.b.s+':'+x.it.id:x.it.id)+'">'+itIcon(x.it)+'<span class="q'+x.it.q+'">'+esc(x.it.nm)+'</span>'+(x.b&&x.b.g>.01?'<em>+'+Math.round(x.b.g)+'</em>':'')+'</button>').join('')+'</div>').join('')])}}
  /* 몹이 떨구는 퀘스트 시작 아이템 */
  if(QDB){const IQ=[];for(const q of QDB.values()){if(!q.g||q.g[3]!=='item'||!qdbOk(c,q)||mqDone(c,q)||exOut(c,q))continue;const z=zn(q.g[1]||q.z);if(!zs.map(zn).includes(z))continue;if((q.m||1)>L+1||(q.lv||L)<L-6)continue;IQ.push(q)}
    if(IQ.length)rows.push(['itq','📜','주워서 시작하는 퀘스트 '+IQ.length+'개',
      '<p class="mute">몹이 떨구거나 바닥에 있는 아이템을 주우면 시작돼요. 보이면 꼭 챙기세요.</p>'+IQ.sort((a,b)=>(a.lv||0)-(b.lv||0)).slice(0,8).map(q=>'<button class="iqr" data-a="qopen" data-k="'+q.id+'"><span class="qlv '+lvCls(q.lv,L)+'">'+(q.lv||'?')+'</span><span class="m"><b>📦 '+esc(q.g[0])+'</b><small>'+(q.g[4]?esc(q.g[4])+'에게서 · ':'')+esc(q.g[1]||'')+(q.g[2]?' '+esc(q.g[2].replace(',',', ')):'')+' → 「'+esc(q.n)+'」</small></span></button>').join('')])}
  /* 6) 사냥 전에 챙길 것 (포에버: 휴식 경험치·침낭·야영지·음식) */
  /* 레벨업 팁: 휴식·야영지·음식 + 레거시 포인트 (한 칸으로) */
  rows.push(['tip','💡','레벨업 팁 · 휴식·레거시','<h4 class="lhh4">💤 사냥 전에 챙길 것</h4>'+restHtml(c)+'<h4 class="lhh4">🏅 레거시 포인트 추천</h4>'+legacyHtml(c)]);
  if(!rows.length)return '';ui.lhopen=ui.lhopen||{};
  {const PR={trn:0,cls:1,dg:2,mv:3,fp:4,rare:5,itq:6,grd:7,tip:9};rows.sort((a,b)=>(PR[a[0]]??8)-(PR[b[0]]??8))}
  const TI={tip:ICO('inv_misc_book_09'),fp:ICO('ability_hunter_pet_wolf'),rare:ICO('inv_misc_head_dragon_01'),itq:ICO('inv_misc_note_02'),rest:ICO('spell_nature_sleep'),leg:ICO('inv_misc_book_07'),cls:ICO('classicon_'+c.cls),trn:ICO('spell_holy_holybolt'),dg:ICO('inv_misc_bone_humanskull_01'),mv:ICO('ability_mount_gryphon_01'),grd:ICO('ability_hunter_snipershot')};
  const sel=ui.lhsel&&rows.some(r=>r[0]===ui.lhsel)?ui.lhsel:null;
  return '<div class="lh2"><div class="lh2h"><b>레벨업 도우미</b><small>'+L+'레벨 · '+esc(CKO)+'</small></div><div class="lh2g">'+rows.map(r=>'<button class="lh2t'+(sel===r[0]?' on':'')+(r[0]==='trn'&&/배울 기술/.test(r[2])?' hot':'')+'" data-a="lhsel" data-k="'+r[0]+'"><span class="ic" style="background-image:url('+TI[r[0]]+')"></span><b>'+r[2]+'</b></button>').join('')+'</div>'
    +(sel?'<div class="lh2b">'+rows.find(r=>r[0]===sel)[3]+'</div>':'')+'</div>'}
function routeGear(c){if(!QDB)return '';const rt=myRoute(c);const U=upgrades(c,Math.min(60,c.lv+3),'ok').filter(x=>x.g>.5&&!ownedOf(c,x.it.id));
  const R=[];U.forEach(x=>{const s=srcLeft(x.it,c).find(s=>s.k===1&&onRouteQ(rt,srcQid(s)));if(s)R.push({x,s,q:srcQid(s)})});if(!R.length)return '';R.sort((a,b)=>b.x.g-a.x.g);
  return '<div class="card rtg"><h3>🎁 이 구간 퀘스트로 바뀌는 장비 <small class="mute">'+R.length+'칸</small></h3>'+R.slice(0,ui.rtgm?12:4).map(({x,s,q})=>'<div class="rtgr" data-a="qopen" data-k="'+q+'">'+itIcon(x.it)+'<span class="m"><span class="sub">'+esc(SLOT_KO[x.slot])+' · 퀘스트 「'+esc(s.qn)+'」'+((c.ql||{})[q]?' <span class="lkt log">📜 퀘스트창</span>':'')+'</span><span class="nm">'+itName(x.it)+'</span>'+itStats(x.it,c)+'</span><span class="r">'+gainTag(x.g,x.base,x.empty)+'</span></div>').join('')
    +(R.length>4&&!ui.rtgm?'<button class="btn ghost full" data-a="rtgm">'+(R.length-4)+'개 더 보기</button>':'')+'</div>'}
function routeView(c,emb){const L=c.lv;const R=routeOf(c);let prevC=null;const fq=c.fq||{};
  let h='';
  let pastN=0;const rows=R.map(S=>{const zs=S.z.split(' · ');const cs=[...new Set(zs.map(z=>CONT[z]).filter(Boolean))];const now=L>=S.a&&L<=S.b;const past=L>S.b;
    let move='';if(prevC&&cs.length&&!cs.includes(prevC)&&cs.every(x=>x!=='제프라스 섬'))move='<div class="mv">⛵ '+BOAT+'</div>';prevC=cs[cs.length-1]||prevC;
    const cnt=z=>{const qs=S.q.filter(q=>(q.gz||q.sz)===z);return [qs.length,qs.filter(q=>qd(c,z,q)).length]};
    return move+'<div class="rt'+(now?' now':past?' past':'')+'"><div class="rl"><span class="lvb '+(now?'lv-y':past?'lv-x':'')+'">'+S.a+'–'+S.b+'</span>'+(now?'<span class="tag gd">지금</span>':'')+'</div><div class="m">'+zs.map(z=>{const [n,d]=cnt(z);return '<button class="zr" data-a="goz" data-k="'+esc(z)+'"><b>'+esc(z)+'</b> '+contTag(z)+'<span class="sub">퀘스트 '+n+'개'+(d?' · '+d+'개 끝냄':'')+'</span></button>'}).join('')+'</div></div>'});
  R.forEach(S=>{if(L>S.b)pastN++});
  const pastLv=pastN?R[pastN-1].b:0;
  if(pastN){const trail=[];R.slice(0,pastN).forEach(S=>S.z.split(' · ').forEach(z=>{if(trail[trail.length-1]!==z)trail.push(z)}));
    h+='<details class="rpast"><summary><span class="lvb lv-x">1–'+pastLv+'</span> ✓ 지나온 길 '+trail.length+'곳<span class="more">펼치기</span></summary><p class="trail">'+trail.map(esc).join(' → ')+'</p>'+rows.slice(0,pastN).join('')+'</details>'}
  const curS=R.find(S=>L>=S.a&&L<=S.b);const nxS=R.find(S=>S.a>L);const nc=curS?nowCard(c,curS):'';
  if(emb){/* 레벨업 한 화면: 위는 한 단계씩, 여기는 마을별 체크 (접힘) */
    const PS=curS?planStats(c,nowPlan(c,curS)):null;
    h+='<div class="lvx"><div class="lvxl">'+(nc?'<details class="lvhub"'+((ui.lvhub??isPC())?' open':'')+' data-tg="lvhub"><summary><span class="lvhi">📋</span><b>마을별로 한눈에 보기</b><small>'+esc(curS.z.split(' · ')[0])+(PS?' · 퀘스트 '+PS.dn+'/'+PS.all:'')+' · 체크해 가며 보기</small><span class="chev">⌄</span></summary>'+nc+'</details>':'')+'</div><div class="lvxr">'+routeGear(c)+lvHelp(c,curS,nxS)+'</div></div>';
    if(pastN)h=h.replace(/<details class="rpast">[\s\S]*?<\/details>/,'');}
  else h+='<div class="q2">'+nc+'<div class="q2r">'+(isPC()&&curS?routeMapPanel(c):'')+lvHelp(c,curS,nxS)+'</div></div>';
  if(nxS)h+='<div class="nextln"><span class="lvb">'+nxS.a+'–'+nxS.b+'</span><span>다음 구간 · <b>'+esc(nxS.z)+'</b></span></div>';
  h+='<button class="impl" data-a="imp">🧩 게임에서 이미 한 퀘스트 불러오기 <small>애드온</small></button>';
  h+='<details class="rall"><summary>🗺️ 1–60 전체 레벨 루트 보기</summary>'+(emb?rows.join(''):rows.slice(pastN).join(''))+'<p class="note">⛵ 배 타는 곳: '+BOAT+'</p></details>';
  return h}
/* PC(넓은 화면)에서만 옆에 지도 */
const isPC=()=>window.innerWidth>=1240;
/* 지도 같이 보기: 고른 적 없으면 넓은 PC 화면(1240px 이상)에서 기본으로 켬 */
function recMapOn(c){return c.recMap!=null?!!c.recMap:isPC()}
{const bp=()=>window.innerWidth>=1240?2:window.innerWidth>=1000?1:0;let was=bp();addEventListener('resize',()=>{const n=bp();if(n!==was){was=n;try{if(me())rerender(true)}catch(e){}}})}
/* 마을 카드 ↔ 지도 핀 서로 강조 */
document.addEventListener('mouseover',e=>{const t=e.target.closest&&e.target.closest('.st[data-hk],.gp[data-hk]');const k=t?t.dataset.hk:null;if(k===ui._hlk)return;ui._hlk=k;
  document.querySelectorAll('.gp.hl,.st.hlc').forEach(x=>x.classList.remove('hl','hlc'));if(!k)return;
  document.querySelectorAll('[data-hk]').forEach(x=>{if(x.dataset.hk===k)x.classList.add(x.classList.contains('gp')?'hl':'hlc')})});
/* 레벨업 동선 옆 지도: 마을 번호를 지도에 */
function routeMapPanel(c){const L0=ui._rmp||[];if(!L0.length)return '';const zs=[...new Set(L0.map(x=>x.z))];const z=ui.rmz&&zs.includes(ui.rmz)?ui.rmz:L0[0].z;
  const open=Object.entries(ui.hopen||{}).filter(([k,v])=>v).map(([k])=>k).concat(ui.hfocus?[ui.hfocus]:[]);const pins=L0.filter(x=>x.z===z&&x.xy).map(x=>({x:x.xy[0],y:x.xy[1],k:'hub',t:String(x.n),a:'hubgo',id:x.k,hk:x.k,on:open.includes(x.k)||(!open.length&&x.n===L0[0].n),lab:x.n<=6?x.nm.slice(0,12):''}));
  const line=L0.filter(x=>x.z===z&&x.xy).map(x=>x.xy);
  return '<div class="card rmp"><div class="rmph"><b>🗺️ 들를 곳 지도</b>'+gmStyleSeg(c,1)+(zs.length>1?'<span class="rmpz">'+zs.map(x=>'<button class="'+(x===z?'on':'')+'" data-a="rmz" data-k="'+esc(x)+'">'+esc(x)+' <small>'+L0.filter(y=>y.z===x).length+'</small></button>').join('')+'</span>':'')+'</div>'
    +gmapHtml(z,pins.reverse(),line.length>1?line:null,0,0,miniStyle(c)!=='game')+'<p class="note">번호 = 왼쪽 마을 순서 · 핀을 누르면 그 마을이 열려요'+(L0.some(x=>x.z===z&&!x.xy)?' · 좌표 없는 곳은 빠져요':'')+'</p></div>'}
/* ===== 🗺️ 게임 지도 (와우 지역 지도 그림 위에 핀 · wythic처럼) ===== */
const ZID={'엘윈 숲':12,'던 모로':1,'모단 호수':38,'서부 몰락지대':40,'붉은마루 산맥':44,'그늘숲':10,'가시덤불 골짜기':33,'저습지':11,'아라시 고원':45,'힐스브래드 구릉지':267,'알터랙 산맥':36,'황야의 땅':3,'슬픔의 늪':8,'저주받은 땅':4,'이글거리는 협곡':51,'불타는 평원':46,'동부 내륙지':47,'서부 역병지대':28,'동부 역병지대':139,'티리스팔 숲':85,'은빛소나무 숲':130,'스톰윈드':1519,'아이언포지':1537,
 '텔드랏실':141,'다르나서스':1657,'어둠의 해안':148,'잿빛 골짜기':331,'돌발톱 산맥':406,'불모의 땅':17,'잊혀진 땅':405,'버섯구름 봉우리':400,'먼지진흙 습지대':15,'먼지진흙 슾지대':15,'페랄라스':357,'타나리스':440,'운고로 분화구':490,'악령의 숲':361,'여명의 설원':618,'아즈샤라':16,'실리더스':1377,'듀로타':14,'멀고어':215,'달의 숲':493,'오그리마':1637,'썬더 블러프':1638,'언더시티':1497,'죽음의 고개':41,'강물터':16591,'셴드랄라스':16651};
/* 포에버 새 지역(번호 1만 넘음: 강물터·셴드랄라스)은 와우헤드 지도 그림이 없어 우리 지도로 */
const gmUrl=z=>ZID[z]&&ZID[z]<10000?'https://wow.zamimg.com/images/wow/classic/maps/kokr/original/'+ZID[z]+'.jpg':'';
/* 와우헤드 지도 그림이 없는 지역(포에버 신규 등) → 우리 지도 타일을 그 지역 크기로 잘라서 */
function gmAtlasBg(z){const t=MAPZ[ZALIAS[z]||z];if(!t)return null;let x0=t[0];const y0=t[2],w=100*t[1],h=100*t[3];const c=x0>=8192?'ek':'ka';if(c==='ek')x0-=8192;
  let zz=3;while(zz>0&&w*2**(zz-3)>1400)zz--;const span=256*2**(3-zz);const [nx,ny]=AMNT[c][zz];
  let im='';for(let tx=Math.max(0,Math.floor(x0/span));tx<=Math.min(nx-1,Math.floor((x0+w)/span));tx++)for(let ty=Math.max(0,Math.floor(y0/span));ty<=Math.min(ny-1,Math.floor((y0+h)/span));ty++)
    im+='<img class="gt" src="https://assets.wowf.io/world/atlas/'+ATL[c].n+'/'+zz+'/'+tx+'_'+ty+'.webp" style="left:'+((tx*span-x0)/w*100).toFixed(3)+'%;top:'+((ty*span-y0)/h*100).toFixed(3)+'%;width:'+(span/w*100).toFixed(3)+'%;height:'+(span/h*100).toFixed(3)+'%" alt="" loading="lazy" onerror="this.style.visibility=\'hidden\'">';
  return {im,ar:(w/h).toFixed(3)}}
const lo_=(v,m)=>v-m;
/* ── 길 따라 동선 ──
   data/route/<지역번호>.png = 걷기 비용 격자(지도 3px = 1칸). 1 길·순찰 길, 5~40 걸을 수 있는 땅(비탈일수록 큼), 70 험한 비탈, 150 물(헤엄), 200 깊은 바다, 255 절벽·용암·지역 밖.
   tools/terrain/build_terrain.py 가 포에버 게임 지형(높이·물)으로 만든다(도시는 tools/route/build_grid.py 것 그대로). 지역을 처음 그릴 때 그 지역 것만 받는다. */
const RG={};let rgT=0;
/* 동굴·광산처럼 보이는 하위 지역 이름 (여관·건물 안은 빼려고) */
const CAVE_RE=/광산|동굴|굴|갱도|채석장|지하|무덤|구덩이|은신처|하수도|납골당|소굴|틈새|우물/;
const rgId=z=>{const id=ZID[z]||ZID[zn(z)];return id&&(D_VER.rgz||[]).includes(id)?id:0};
function rgGrid(z){const id=rgId(z);if(!id)return null;const g=RG[id];if(g)return g.c?g:null;
  RG[id]={wait:1};const im=new Image();
  im.onload=()=>{try{const w=im.naturalWidth,h=im.naturalHeight,cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d',{willReadFrequently:true});x.drawImage(im,0,0);const d=x.getImageData(0,0,w,h).data;const c=new Uint8Array(w*h);for(let i=0;i<c.length;i++)c[i]=Math.max(1,d[i*4]);RG[id]={w,h,c,P:new Map()};clearTimeout(rgT);rgT=setTimeout(rgRedraw,60)}catch(e){RG[id]={bad:1}}};
  im.onerror=()=>{RG[id]={bad:1}};im.src='data/route/'+id+'.png?v='+D_VER.rg;return null}
/* 격자를 받으면 지금 화면의 동선만 다시 그림 */
function rgRedraw(){if(AM&&AM.draw&&document.getElementById('amap'))AM.draw();else if(document.querySelector('.gmap'))rerender(true)}
/* 두 점(지역 % 좌표) 사이 길: A* → 곧게 펴기 → 모서리 다듬기. 산·지역 밖을 꼭 지나야 하거나 너무 돌아가면 far(배·비행으로 보고 흐린 직선) */
function rgPath(z,a,b){const g=rgGrid(z);if(!g)return null;const key=(+a[0]).toFixed(1)+','+(+a[1]).toFixed(1)+'>'+(+b[0]).toFixed(1)+','+(+b[1]).toFixed(1);const hit=g.P.get(key);if(hit)return hit;
  const {w,h}=g;let c=g.c;const gx=v=>Math.max(0,Math.min(w-1,Math.floor(v/100*w))),gy=v=>Math.max(0,Math.min(h-1,Math.floor(v/100*h)));
  const s=gy(a[1])*w+gx(a[0]),t=gy(b[1])*w+gx(b[0]),tx=t%w,ty=(t/w)|0,N=w*h;
  /* 출발·도착점 바로 둘레(4칸)의 절벽·물은 걸을 수 있다고 봄: NPC가 언덕 위·건물 안·물가에 서 있어도 그 둘레 때문에 멀리 돌아가지 않게 */
  /* 격자 크기가 지역마다 달라서(341칸·682칸) 칸 수로 정한 값은 341칸 기준에 맞춰 늘림 */
  const GK=Math.max(1,w/341),RR=Math.round(4*GK);
  [s,t].forEach(e=>{const ex=e%w,ey=(e/w)|0;for(let y=Math.max(0,ey-RR);y<=Math.min(h-1,ey+RR);y++)for(let x=Math.max(0,ex-RR);x<=Math.min(w-1,ex+RR);x++){const j=y*w+x;if(c[j]>=150&&(x-ex)**2+(y-ey)**2<=RR*RR){if(c===g.c)c=g.c.slice();c[j]=8}}});
  const G=new Float32Array(N).fill(1e30),PV=new Int32Array(N).fill(-1),CL=new Uint8Array(N);const HF=[],HI=[];
  const push=(f,i)=>{let k=HF.length;HF.push(f);HI.push(i);while(k>0){const p=(k-1)>>1;if(HF[p]<=f)break;HF[k]=HF[p];HI[k]=HI[p];k=p}HF[k]=f;HI[k]=i};
  const pop=()=>{const top=HI[0],f=HF.pop(),i=HI.pop(),n=HF.length;if(n){let k=0;for(;;){const l=2*k+1;if(l>=n)break;const r=l+1,m=r<n&&HF[r]<HF[l]?r:l;if(HF[m]>=f)break;HF[k]=HF[m];HI[k]=HI[m];k=m}HF[k]=f;HI[k]=i}return top};
  const DX=[1,-1,0,0,1,1,-1,-1],DY=[0,0,1,-1,1,-1,1,-1],DD=[1,1,1,1,1.4142,1.4142,1.4142,1.4142];
  G[s]=0;push(0,s);let ok=false;
  while(HF.length){const i=pop();if(CL[i])continue;CL[i]=1;if(i===t){ok=true;break}const x=i%w,y=(i/w)|0,gi=G[i];
    for(let k=0;k<8;k++){const nx=x+DX[k],ny=y+DY[k];if(nx<0||ny<0||nx>=w||ny>=h)continue;const j=ny*w+nx;if(CL[j])continue;const ng=gi+DD[k]*(c[i]+c[j])/2;if(ng<G[j]){G[j]=ng;PV[j]=i;push(ng+Math.hypot(tx-nx,ty-ny),j)}}}
  if(!ok){g.P.set(key,null);return null}
  const P=[];for(let i=t;;i=PV[i]){P.push(i);if(i===s||PV[i]<0)break}P.reverse();
  const acc=[0];let blk=0;for(let k=1;k<P.length;k++){const i=P[k-1],j=P[k];acc.push(acc[k-1]+Math.hypot(i%w-j%w,((i/w)|0)-((j/w)|0))*(c[i]+c[j])/2);if(c[j]>=200)blk++}
  const lc=(i,j)=>{const x0=i%w,y0=(i/w)|0,x1=j%w,y1=(j/w)|0,L=Math.hypot(x1-x0,y1-y0),n=Math.max(1,Math.ceil(L*2));let sm=0;for(let q=0;q<=n;q++)sm+=c[Math.round(y0+(y1-y0)*q/n)*w+Math.round(x0+(x1-x0)*q/n)];return sm/(n+1)*L};
  /* 곧게 펴기: 직선으로 가도 비용이 거의 같으면 중간 칸을 뺌(격자 계단 모양 없애기) */
  /* 여유를 작게(2% + 0.5): 크면 굽은 길 안쪽 풀밭으로 질러가서 점선이 길에서 벗어나 보임 */
  const K=[P[0]];for(let i=0;i<P.length-1;){let j=P.length-1;while(j>i+1&&lc(P[i],P[j])>(acc[j]-acc[i])*1.02+.5)j-=j-i<40?1:Math.max(1,(j-i)>>3);K.push(P[j]);i=j}
  let Q=K.map(i=>[((i%w)+.5)/w*100,(((i/w)|0)+.5)/h*100]);Q[0]=[+a[0],+a[1]];Q[Q.length-1]=[+b[0],+b[1]];
  /* 모서리 다듬기: 모서리에서 최대 0.6%(약 2칸)까지만 깎음 — 긴 직선 사이 모서리를 크게 깎으면 길에서 벗어남 */
  for(let it=0;it<2&&Q.length>2;it++){const R=[Q[0]];for(let k=0;k<Q.length-1;k++){const p=Q[k],q=Q[k+1],d=Math.hypot(q[0]-p[0],q[1]-p[1]),f=d>0?Math.min(.25,.6/d):.25;R.push([p[0]+(q[0]-p[0])*f,p[1]+(q[1]-p[1])*f],[q[0]+(p[0]-q[0])*f,q[1]+(p[1]-q[1])*f])}R.push(Q[Q.length-1]);Q=R}
  let len=0;for(let k=1;k<Q.length;k++)len+=Math.hypot(Q[k][0]-Q[k-1][0],Q[k][1]-Q[k-1][1]);const st=Math.hypot(b[0]-a[0],b[1]-a[1]);
  /* 가운데 지점·방향(화살표) */let half=len/2,mid=null;for(let k=1;k<Q.length;k++){const d=Math.hypot(Q[k][0]-Q[k-1][0],Q[k][1]-Q[k-1][1]);if(half<=d||k===Q.length-1){const f=d?Math.min(1,half/d):0;mid=[Q[k-1][0]+(Q[k][0]-Q[k-1][0])*f,Q[k-1][1]+(Q[k][1]-Q[k-1][1])*f,Q[k][0]-Q[k-1][0],Q[k][1]-Q[k-1][1]];break}half-=d}
  const r={p:Q,len,mid,far:blk>4*GK||(st>8&&len>st*2.6)};g.P.set(key,r);return r}
function gmapHtml(z,pins,line,big,zoom,ours){const u=ours&&MAPZ[ZALIAS[z]||z]?'':gmUrl(z);const A=u?null:gmAtlasBg(z);
  let tf='',sc=1,TX=0;if(zoom){const xs=pins.map(p=>p.x),ys=pins.map(p=>p.y);if(xs.length){const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);sc=Math.max(1,Math.min(2.6,100/(Math.max(x1-x0,(y1-y0)*1.2)+24)));
    /* 지도 가장자리에 붙은 핀도 반쯤 잘리지 않게 바깥으로 조금(최대 9%) 비켜 보일 수 있게 함 */
    const M=4;/* 가장자리 핀이 반쯤 잘리지 않게 최대 4%만 바깥으로 비킴(빈 바탕이 크게 보이지 않게) */
    let tx=50-(x0+x1)/2*sc,ty=50-(y0+y1)/2*sc;tx=Math.max(lo_(100-100*sc,M),Math.min(M,tx));ty=Math.max(lo_(100-100*sc,M),Math.min(M,ty));
    /* 핀이 모두 화면 안(가로 5~95%, 세로 6~94%)에 들어오게. 예전엔 min/max가 거꾸로라 핀이 한쪽 가장자리로 쏠렸음 */
    tx=Math.min(Math.max(tx,5-x0*sc),95-x1*sc);ty=Math.min(Math.max(ty,6-y0*sc),94-y1*sc);
    TX=tx;if(sc>1.05||y0<5||x0<5||x1>95||y1>95)tf=' style="--s:'+sc.toFixed(2)+';transform:translate('+tx.toFixed(1)+'%,'+ty.toFixed(1)+'%) scale('+sc.toFixed(2)+')"';else{sc=1;TX=0}}}
  /* 이름표가 겹치면 뒤의 것은 숨기기 */
  const lab=[];pins.forEach(p=>{if(!p.lab)return;if(lab.some(q=>Math.abs(q.x-p.x)*sc<16&&Math.abs(q.y-p.y)*sc<7)||lab.some(q=>q.lab===p.lab&&Math.abs(q.x-p.x)*sc<30&&Math.abs(q.y-p.y)*sc<14)||pins.some(q=>q!==p&&(q.x-p.x)*sc>1&&(q.x-p.x)*sc<15&&Math.abs(q.y-p.y)*sc<4))p.lab='';else lab.push(p)});/* 이름표가 오른쪽 다른 핀을 덮어도 숨김 */
  let s='<div class="gmap'+(big?' big':'')+(!u&&!A?' nomap':'')+(A?' atl':'')+'"'+(A?' style="aspect-ratio:'+A.ar+'"':'')+'><div class="gin"'+tf+'>'+(u?'<img src="'+u+'" alt="'+esc(z)+' 지도" loading="lazy" onerror="this.parentNode.classList.add(\'noimg\')">':A?A.im:'');
  /* 동선 선: 가는 순서만 보여 주는 직선이라, 먼 이동(산·물을 돌아가거나 배·비행)은 흐리게 + 가운데에 방향 화살표 */
  if(line&&line.length>1){let sv='';const AR=A?+A.ar:1024/683;const arr=[];/* 길 따라 그리기: 우리 지도(아틀라스 바탕)는 좌표가 같아 그대로 씀. 격자를 아직 안 받았으면 직선으로 먼저 그리고, 받으면 다시 그림 */
    for(let i=1;i<line.length;i++){const a=line[i-1],b=line[i];const d=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d<.5)continue;
      const rp=d>=1.5&&!line.noRoute?rgPath(z,a,b):null;
      if(rp&&!rp.far){const pt=rp.p.map(p=>p[0].toFixed(2)+','+p[1].toFixed(2)).join(' ');
        sv+='<polyline points="'+pt+'" fill="none" stroke="#2a1a06" stroke-opacity=".7" stroke-width="4.6" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/><polyline class="grt" points="'+pt+'" fill="none" stroke="#ffd65a" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>';
        if(rp.len>=7&&rp.mid)arr.push([rp.mid[0],rp.mid[1],rp.mid[2],rp.mid[3]]);continue}
      const far=(rp&&rp.far)||d>32;
      sv+='<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" stroke="'+(far?'#ffd65a88':'#ffd65a')+'" stroke-width="'+(far?1.6:2.5)+'" stroke-dasharray="'+(far?'3 6':'7 6')+'" vector-effect="non-scaling-stroke"/>';
      if(d>=7)arr.push([(a[0]+b[0])/2,(a[1]+b[1])/2,b[0]-a[0],b[1]-a[1]])}
    s+='<svg viewBox="0 0 100 100" preserveAspectRatio="none">'+sv+'</svg>';
    /* 방향 화살표(가운데) — 지도가 늘어나도 모양이 안 찌그러지게 HTML로 */
    arr.forEach(m=>{s+='<i class="gar" style="left:'+m[0].toFixed(2)+'%;top:'+m[1].toFixed(2)+'%;--a:'+Math.atan2(m[3],m[2]*AR).toFixed(3)+'rad"></i>'})}
  /* 애드온(v3.4)이 기억한 동굴·광산 입구 */
  (DB.ent||[]).forEach(e=>{if(!zEq(e.z,z)||!CAVE_RE.test(e.n||''))return;s+='<span class="gpe" style="left:'+e.x+'%;top:'+e.y+'%" title="'+esc(e.n)+' 입구">'+MKS.gate+(big?'<i>'+esc(e.n)+' 입구</i>':'')+'</span>'});
  pins.forEach(p=>{if(p.rad)s+='<span class="gpa" style="left:'+p.x+'%;top:'+p.y+'%;width:'+2*p.rad+'%;height:'+2*p.rad+'%"></span>'});
  pins.forEach(p=>{s+=(p.k==='o'?'<span class="gpo" style="left:'+p.x+'%;top:'+p.y+'%"></span>':'<button class="gp k-'+p.k+(p.on?' on':'')+'" style="left:'+p.x+'%;top:'+p.y+'%"'+(p.a?' data-a="'+p.a+'" data-k="'+esc(String(p.id))+'"':'')+(p.hk?' data-hk="'+esc(p.hk)+'"':'')+'>'+(p.ic||esc(p.t||''))+(p.more&&p.more.length?'<small class="gpm">·'+p.more.join('·')+'</small>':'')+(p.c>1?'<em>'+p.c+'</em>':'')+'</button>')+(p.lab?'<span class="gl'+(p.x*sc+TX>64?' rt':'')+'" style="left:'+p.x+'%;top:'+p.y+'%">'+esc(p.lab)+'</span>':'')});
  return s+'</div><span class="gz">'+esc(z)+(sc>1?' · 확대':'')+(!u&&!A?' · 지도 그림 없음 (좌표만)':'')+'</span></div>'}
function gmQuests(c,z){if(!QDB)return [];const L=c.lv;return [...QDB.values()].filter(q=>q.z===z&&qdbOk(c,q)&&!mqDone(c,q)&&!exOut(c,q)&&(q.m||0)<=L+1&&(q.lv||0)>=L-6&&(q.lv||0)<=L+5).sort((a,b)=>(a.lv||0)-(b.lv||0))}
/* 작은 동선 지도는 기본 「게임 지도」(우리 지도는 바다 쪽이 검은 네모로 보여서) · 큰 지도는 따로 */
const miniStyle=c=>c.miniStyle||'game';
function gmStyleSeg(c,mini){const st=mini?miniStyle(c):(c.mapStyle||'atlas');return '<span class="gmseg">'+[['game','게임 지도'],['atlas','우리 지도']].map(x=>'<button class="'+(st===x[0]?'on':'')+'" data-a="mapst" data-k="'+x[0]+'"'+(mini?' data-f="mini"':'')+'>'+x[1]+'</button>').join('')+'</span>'}
function gameView(c){if(!QDB){qdbLoad();return '<p class="note">퀘스트 자료를 불러오는 중…</p>'}
  const L=c.lv;const fq=ui.amq&&QDB.get(ui.amq);
  const R=routeOf(c);const S=R.find(s=>L>=s.a&&L<=s.b)||R.find(s=>s.a>L);const myZ=(S?S.z.split(' · '):[]);
  let z=fq?((fq.g&&fq.g[1])||fq.z):(ui.gz||myZ[0]||'엘윈 숲');
  const zs=[...new Set([z,...myZ])];
  let h='<div class="gmtop">'+(ui.amback?'<button class="amback" data-a="amback">← 돌아가기</button>':'')+gmStyleSeg(c)+'<div class="gzs">'+zs.map(x=>'<button class="'+(x===z?'on':'')+'" data-a="gz" data-k="'+esc(x)+'">'+esc(x)+'</button>').join('')+'</div></div>';
  const list=gmQuests(c,z);
  if(fq){const P=[];const g=xyOf(fq.g&&fq.g[2]);if(g)P.push({x:g[0],y:g[1],k:'g',t:'!',lab:fq.g[0]});
    const d=QD.get(fq.id)||{};const T=tasksOf(d,d.obj||fq.o||'');T.forEach((t,ti)=>{const ms=[...(t.where||'').matchAll(/([\d.]+),\s*([\d.]+)/g)].slice(0,8);ms.forEach((m,j)=>P.push({x:+m[1],y:+m[2],k:'o'}));if(ms[0])P.push({x:+ms[0][1],y:+ms[0][2],k:'d',t:String(ti+1),lab:t.nm})});
    const rz=(fq.r&&fq.r[1])||z;const r=xyOf(fq.r&&fq.r[2]);if(r&&rz===z)P.push({x:r[0],y:r[1],k:'r',t:'?',lab:fq.r[0]});
    const i=list.findIndex(q=>q.id===fq.id);const prev=i>0?list[i-1]:null,next=i>=0&&i<list.length-1?list[i+1]:(i<0&&list[0]?list[0]:null);
    h+='<div class="gmw'+(ui.gfull?' full':'')+'">'+gmapHtml(z,P,null,1,!ui.gall)+'<button class="gmf2" data-a="gall">'+(ui.gall?'퀘스트 쪽 확대':'지역 전체')+'</button><button class="gmf" data-a="gfull">'+(ui.gfull?'작게':'큰 화면')+'</button><div class="gmnav"><button data-a="amq" data-k="'+(prev?prev.id:'')+'"'+(prev?'':' disabled')+'>◀</button><button data-a="amq" data-k="'+(next?next.id:'')+'"'+(next?'':' disabled')+'>▶</button></div><button class="gmx" data-a="'+(ui.amback?'amback':'amq')+'" data-k="">✕</button></div>';
    const lvc=lvCls(fq.lv,L);
    h+='<div class="card gmq"><div class="h"><b>'+esc(fq.n)+'</b><span class="gmlv '+lvc+'">권장 Lv '+(fq.lv||'?')+'</span><small>'+(fq.m||1)+'레벨부터 수락</small></div>'
      +'<p class="obj">'+esc(fq.o||'')+'</p>'
      +'<div class="gst"><span class="k g">! 받는 곳</span><span>'+esc((fq.g&&fq.g[0])||'')+' <small>'+esc((fq.g&&fq.g[1])||'')+(g?' '+g[0]+', '+g[1]:'')+'</small></span></div>'
      +T.slice(0,3).map((t,ti)=>'<div class="gst"><span class="k o">'+(ti+1)+' 할 일</span><span>'+esc(t.nm||'')+' <small>'+esc(t.where||'')+'</small></span></div>').join('')
      +'<div class="gst"><span class="k r">? 반납</span><span>'+esc((fq.r&&fq.r[0])||'')+' <small>'+esc(rz)+(r?' '+r[0]+', '+r[1]:'')+'</small></span></div>'
      +'<div class="gmb"><button class="btn sm ghost" data-a="qopen" data-k="'+fq.id+'">자세히</button><button class="btn sm ghost" data-a="mapst" data-k="atlas">우리 지도에서</button><button class="btn sm" data-a="qldone" data-k="'+fq.id+'">끝냈어요</button></div>'
      +(i>=0?'<p class="note">이 지역 지금 할 만한 퀘스트 '+(i+1)+'/'+list.length+' · ◀ ▶ 로 넘겨 보세요</p>':'')+'</div>';
    return h}
  /* 퀘스트를 안 골랐을 때: 받을 수 있는 곳(!) · 반납할 곳(?) */
  const G=[];list.forEach(q=>{const p=xyOf(q.g&&q.g[2]);if(!p||(q.g[1]&&q.g[1]!==z))return;const o=G.find(x=>Math.hypot(x.x-p[0],x.y-p[1])<3);if(o){o.c++;o.qs.push(q)}else G.push({x:p[0],y:p[1],c:1,qs:[q]})});
  const pins=G.map(o=>({x:o.x,y:o.y,k:'g',t:'!',c:o.c,a:'amq',id:o.qs[0].id}));
  Object.keys(c.ql||{}).forEach(id=>{if(c.ql[id]!==2)return;const q=QDB.get(+id);if(!q||!q.r)return;const p=xyOf(q.r[2]);if(p&&(q.r[1]||q.z)===z)pins.push({x:p[0],y:p[1],k:'r',t:'?',a:'amq',id:q.id})});
  /* 내 퀘스트(아직 진행 중): 할 일 자리 ⚔ · 이 지역 던전 입구 🏰 (다 했으면 ✓) */
  Object.keys(c.ql||{}).forEach(id=>{if(c.ql[id]===2)return;const q=QDB.get(+id);if(!q||mqDone(c,q))return;obPlaces(q).forEach(o=>{if(o.dg||!zEq(o.zone,z))return;const p=xyOf(o.xy);if(p&&!pins.some(x=>x.k==='mo'&&x.id===q.id&&Math.hypot(x.x-p[0],x.y-p[1])<3))pins.push({x:p[0],y:p[1],k:'mo',ic:MKS.swords,a:'amq',id:q.id,lab:o.nm})})});
  {const seen={};DGS.forEach(d=>{const E=DGLOC[d.slug];if(!E||!zEq(E[0],z))return;const p=xyOf(E[1]);if(!p)return;const S=dgState(c,d);const o=seen[E[1]];if(o){o.ds.push(d);o.all=o.all&&S.all;o.n+=S.inLog.length;return}seen[E[1]]={p,ds:[d],all:S.all,n:S.inLog.length}});
    Object.values(seen).forEach(o=>pins.push({x:o.p[0],y:o.p[1],k:o.all?'dgd':'dg',ic:o.all?MKS.check:MKS.gate,c:o.n||0,a:'dgo',id:o.ds[0].slug,lab:dgGroupName(o.ds)}))}
  h+='<div class="gmw'+(ui.gfull?' full':'')+'">'+gmapHtml(z,pins,null,1)+'<button class="gmf" data-a="gfull">'+(ui.gfull?'작게':'큰 화면')+'</button></div><p class="note">! 를 누르면 그 퀘스트를 지도와 함께 보여 줘요 · 숫자 = 같은 곳에서 받는 퀘스트 수'+(Object.values(c.ql||{}).includes(2)?' · ? = 반납할 곳':'')+(pins.some(x=>x.k==='mo')?' · ⚔ = 내 퀘스트 할 일':'')+(pins.some(x=>/^dg/.test(x.k))?' · 🏰 = 던전 입구 (✓ 퀘스트 다 함)':'')+'</p>';
  h+='<div class="gml">'+list.slice(0,8).map(q=>'<button class="lgq" data-a="amq" data-k="'+q.id+'"><span class="lvq2">'+(q.lv||'?')+'</span><span class="m"><b>'+esc(q.n)+'</b><small>'+esc((q.g&&q.g[0])||'')+'</small></span></button>').join('')+(list.length>8?'<p class="note">외 '+(list.length-8)+'개</p>':'')+'</div>';
  return h}

/* ===== ⭐ 추천 레벨업 (계획 · 여정 · 지금 할 일 · 단계) ===== */
const ZIC=[['엘윈','achievement_zone_elwynnforest'],['서부 몰락','achievement_zone_westfall_01'],['붉은마루','achievement_zone_redridgemountains'],['그늘숲','achievement_zone_duskwood'],['가시덤불','achievement_zone_stranglethorn_01'],['던 모로','achievement_zone_dunmorogh'],['모단','achievement_zone_lochmodan'],['저습지','achievement_zone_wetlands_01'],['아라시','achievement_zone_arathihighlands_01'],['힐스브래드','achievement_zone_hillsbradfoothills'],['알터랙','achievement_zone_alteracmountains_01'],['황야의 땅','achievement_zone_badlands_01'],['슬픔의 늪','achievement_zone_swampsorrows_01'],['저주받은','achievement_zone_blastedlands_01'],['이글거리는','achievement_zone_searinggorge_01'],['불타는 평원','achievement_zone_burningsteppes_01'],['동부 내륙','achievement_zone_hinterlands_01'],['서부 역병','achievement_zone_westernplaguelands_01'],['동부 역병','achievement_zone_easternplaguelands'],['티리스팔','achievement_zone_tirisfalglades_01'],['은빛소나무','achievement_zone_silverpine_01'],['텔드랏실','achievement_zone_darnassus'],['어둠의 해안','achievement_zone_darkshore_01'],['잿빛','achievement_zone_ashenvale_01'],['돌발톱','achievement_zone_stonetalon_01'],['불모','achievement_zone_barrens_01'],['잊혀진 땅','achievement_zone_desolace'],['버섯구름','achievement_zone_thousandneedles_01'],['먼지진흙','achievement_zone_dustwallowmarsh'],['페랄라스','achievement_zone_feralas'],['타나리스','achievement_zone_tanaris_01'],['운고로','achievement_zone_ungorocrater_01'],['악령의 숲','achievement_zone_felwood'],['여명의 설원','achievement_zone_winterspring'],['아즈샤라','achievement_zone_azshara_01'],['실리더스','achievement_zone_silithus_01'],['듀로타','achievement_zone_durotar'],['멀고어','achievement_zone_mulgore_01'],['달의 숲','spell_arcane_teleportmoonglade'],['아이언포지','inv_misc_tournaments_banner_dwarf'],['스톰윈드','inv_misc_tournaments_banner_human']];
const zIco=z=>{const f=ZIC.find(x=>String(z||'').includes(x[0]));return f?f[1]:'inv_misc_map_01'};
/* 계획: 앱 추천(기존 루트) · 퀘스트 많은 곳 */
function recPlans(c){const L=c.lv;const R=routeOf(c);const out=[];
  const segs=R.filter(S=>S.b>=L).slice(0,3);
  if(segs.length)out.push({k:'app',name:'앱 추천 루트',nodes:segs.map(S=>({z:S.z.split(' · ')[0],a:S.a,b:S.b,S})),n:segs.reduce((n,S)=>n+S.q.length,0)});
  if(QDB){const Z={};for(const q of QDB.values()){if(!q.z||q.c==='던전'||q.c==='기타'||!qdbOk(c,q)||mqDone(c,q)||exOut(c,q))continue;if(/스톰윈드|아이언포지|다르나서스|특별/.test(q.z))continue;if((q.lv||0)<L-2||(q.lv||0)>L+4||(q.m||0)>L)continue;(Z[q.z]=Z[q.z]||[]).push(q)}
    const top=Object.entries(Z).sort((a,b)=>b[1].length-a[1].length).slice(0,3).map(([z,qs])=>{const lv=qs.map(q=>q.lv).sort((a,b)=>a-b);return {z,a:lv[0],b:lv[lv.length-1],qs}}).sort((a,b)=>a.a-b.a);
    if(top.length)out.push({k:'many',name:'퀘스트 많은 곳',nodes:top,n:top.reduce((n,t)=>n+t.qs.length,0)})}
  return out}
/* 퀘스트 하나 → 받기·하기·반납 위치 */
function recQ(id,z0){const q=QDB&&QDB.get(id);const d=QD.get(id)||{};if(!q&&!d.g)return null;
  const G=(q&&q.g)||d.g||[],R=(q&&q.r)||d.r||[];const t=(d.t||[])[0];const wf=(d.wf&&d.wf.t)||[];const qp=qPlace(q);const txy=t?xyOf(t[2]):null;
  const GO=GOB(id)||{},GG=GQ(id);
  const talk=t&&t[0]==='대화'&&/반납하는 NPC와 이야기/.test(t[1]||'');
  const gxy=xyOf(G[2])||(GO.g&&zEq(GO.g[0],G[1]||(q&&q.z)||z0)?[GO.g[1],GO.g[2]]:null);
  const rT=GG&&GG.ph==='t'&&GG.o&&zEq(GG.o[0],R[1]||(q&&q.z)||z0)?[GG.o[1],GG.o[2]]:null;const rxy=xyOf(R[2])||rT||(GO.r&&zEq(GO.r[0],R[1]||(q&&q.z)||z0)?[GO.r[1],GO.r[2]]:null);
  let o=talk?null:t&&t[1]?{nm:t[1],xy:txy||(qp&&qp.xy),z:txy?null:qp&&qp.zone}:qp&&!(d.t&&d.t.length)?{nm:qp.nm,xy:qp.xy,z:qp.zone}:null;
  /* 게임이 알려 준 목표 위치가 있으면 그 자리로, 길안내 다음 지점(동굴 입구 등)이 따로 있으면 경유지(via)로 */
  if(o&&GG&&GG.ph==='o'&&GG.o){o={nm:o.nm,xy:[GG.o[1],GG.o[2]],z:GG.o[0]};if(GG.w&&zEq(GG.w[0],GG.o[0])&&Math.hypot(GG.w[1]-GG.o[1],GG.w[2]-GG.o[2])>2.5)o.via=[GG.w[1],GG.w[2]]}
  const qt=(q&&q.o)||'',zq=(q&&q.z)||z0;
  if(o&&o.nm&&!/[가-힣]/.test(o.nm)){const k=qCountObj(qt);if(k)o=Object.assign({},o,{nm:k.replace(/\s\d+(개|마리|명|장)$/,'')})}
  /* 「평판을 유지하면서 …를 처치」는 평판이 조건일 뿐이고 할 일은 따로 있음 → 평판 올리기는 「올리고/높이고」일 때만 */
  const repUp=/평판/.test(qt)&&!/평판을?\s?유지/.test(qt);
  /* 목표 자료가 없는데 글에 할 일(처치·모으기·구출…)이 있으면 글 속 장소로 「하기」 단계를 만듦 (장소 좌표는 그 지역 거점 이름과 맞을 때만) */
  if(!o&&!talk&&qt&&qObjAct(qt)){const pl=qTextPlace(qt,zq);o={nm:pl?pl.nm:'퀘스트 목표',xy:pl&&pl.xy||null,z:zq,tx:1}}
  return {id,nm:(q&&q.n)||'',lv:(q&&q.lv)||0,z:zq,g:[G[0],G[1]||zq,gxy],r:[R[0],R[1]||zq,rxy],o,/* 대화만 하면 끝나는 퀘스트는 '하기' 단계를 만들지 않음 */rep:repUp&&!o,cnt:wf.filter(x=>x[1]>0)}}
/* 게임에서 불러온 기록이 있을 때만: 앞 퀘스트를 아직 안 했으면 「먼저 ○○」 (불러온 적 없으면 끝낸 퀘스트를 몰라서 안 보여 줌) */
/* 「N레벨부터」 — 자료에 없어 어림한 값이면 (추정) */
function mTxt(q){return ((q&&q.m)||1)+'레벨부터'+(q&&q.mEst?' (추정)':'')}
/* 아직 안 한 앞 퀘스트(받을 수 있는 것) 하나 — 목록에 「먼저 「…」」로 */
function preFirst(c,id){const X=QDB&&QDB.get(id);if(!X)return null;const dn=p=>{const P=QDB.get(p);return !P||!qdbOk(c,P)||mqDone(c,P)};
  for(const g of [...(X.pre||[]).map(p=>[p]),...(X.pre1&&X.pre1.length?[X.pre1]:[])]){if(g.some(dn))continue;const P=QDB.get(g.find(p=>QDB.has(p)));if(P)return P}return null}
function preHint(c,id){if(!QDB)return '';const D=QDB.get(id);if(!D)return '';const ql=c.ql||{};
  const P=[...new Set([...(D.pre||[]),...((D.pre1&&D.pre1.length===1)?D.pre1:[]),...(QPAR[id]!=null?[QPAR[id]]:[])])].filter(p=>p!==id);
  for(const p of P){const X=QDB.get(p);if(!X||mqDone(c,X)||(ql[p]||0)>=1)continue;return ' · <b class="prh">먼저 「'+esc(X.n||'')+'」</b>'}return ''}
/* 퀘스트 글에 직접 할 일이 있는지 (처치·모으기·구출·호위… 또는 「6개·8마리」 같은 개수) */
function qObjAct(t){return /(처치|모아|모으|모집|구출|해제|호위|회수|채취|획득|수집|파괴|제거|불태|죽여|잡아|조사해)/.test(t)||/\d+\s?(개|마리|명|장|곳|번)/.test(t)}
/* 글 속 「○○에서·○○ 곳곳·○○ 근처·○○에 있는 (대상)」 장소 → 이름과(그 지역 거점과 맞으면) 좌표. 「…에 있는 ○○에게」처럼 NPC 자리를 말하는 것은 뺌 */
function qTextPlace(t,zone){const H=(typeof QHUB!=='undefined'&&QHUB[zone])||[];const nz=s=>String(s).replace(/\s|의/g,'');
  const re=/((?:[가-힣A-Za-z'’]+\s){0,3}[가-힣A-Za-z'’]+?)(에서|의? 곳곳| 근처에서| 근처| 주위에|에 있는| 밖으로| 안에서)/g;let m;const C=[];
  while((m=re.exec(t))){const after=t.slice(m.index+m[0].length,m.index+m[0].length+18);if(/에게/.test(after)&&!/에게서/.test(after))continue;
    const nm=qLastWords(m[1]);if(!nm||nm.length<2||/에게서$/.test(nm))continue;
    const k=nz(nm);let hit=null;for(const h of H){const hk=nz(h[0]);let p=0;while(p<hk.length&&p<k.length&&hk[p]===k[p])p++;if(k.includes(hk)||hk.includes(k)||p>=3){hit=h;break}}
    C.push({nm,xy:hit?[hit[1],hit[2]]:null})}
  const best=C.find(x=>x.xy)||C[0];if(best)return best;
  /* 장소가 없으면 「도둑맞은 보급품 6개」처럼 할 일 이름으로 */
  const c=qCountObj(t);return c?{nm:c,xy:null}:null}
/* 글 속 「○○ 6개·8마리」가 하나뿐이면 그 이름 */
function qCountObj(t){const M=[...t.matchAll(/([가-힣][가-힣]*(?:\s[가-힣]+){0,2})\s?(\d+)\s?(개|마리|명|장)/g)];if(M.length!==1)return null;const w=qLastWords(M[0][1]);return w?w+' '+M[0][2]+M[0][3]:null}
/* 「○○을 위해 □□」「도구를 사용해 □□」처럼 앞에 붙은 말을 떼고 마지막 이름 덩어리만 */
function qLastWords(x){const w=String(x).trim().split(/\s+/);let i=-1;w.forEach((v,k)=>{if(k<w.length-1&&/(을|를|위해|에게|에게서|하고|하며|면서|해|하여|가서|후|다음|그런|로|으로|에|에서)$/.test(v))i=k});const r=w.slice(i+1);const last=r[r.length-1]||'';if(/(에게서|에게|에|로)$/.test(last))return '';return r.join(' ')}
function recStages(c,list,start){const ql=c.ql||{};const St=[];const near=(a,b)=>a&&b&&Math.hypot(a[0]-b[0],a[1]-b[1])<6;
  const add=(type,zone,xy,place,q,need)=>{let s0=St.find(s=>s.type===type&&s.zone===zone&&((xy&&near(s.xy,xy))||(!xy&&!s.xy&&s.place===place)));if(!s0){s0={type,zone,xy,place,items:[],need:new Set()};St.push(s0)}if(place&&!s0.place.split(' · ').includes(place)&&s0.place.split(' · ').length<2)s0.place+=' · '+place;s0.items.push({q,type,need});if(need)[].concat(need).forEach(x=>s0.need.add(x));return s0};
  /* 선행 퀘스트가 같은 목록에 있으면 그걸 반납한 뒤에 받기 (예: 은둔자 → 다크샤이어로부터의 보급품) */
  const inL=new Set(list.map(q=>q.id));const preOf=id=>{const o=QDB&&QDB.get(id);if(!o)return [];const P=new Set(o.pre||[]);if(o.pre1&&o.pre1.length===1)P.add(o.pre1[0]);if(QPAR[id]!=null)P.add(QPAR[id]);return [...P].filter(x=>x!==id&&inL.has(x)&&(ql[x]||0)<3)};
  list.forEach(q=>{const st=ql[q.id]||0;const hasDo=q.o||q.rep;
    if(st<1){const pr=preOf(q.id);add('get',q.g[1],q.g[2],(q.g[2]?hubOfXY(q.g[1],q.g[2].join(','),q.g[0])[0]:'')||q.g[0]||'받는 곳',q,pr.length?pr.map(x=>'t'+x):null)}
    if(st<2&&hasDo){const s0=add('do',(q.o&&q.o.z)||q.z,q.o?q.o.xy:null,q.o?q.o.nm:'평판 올리기',q,'g'+q.id);if(q.o&&q.o.via&&!s0.via)s0.via=q.o.via}
    add('turn',q.r[1],q.r[2],q.r[0]||'반납',q,(hasDo?'d':'g')+q.id)});
  /* 순서: 받기 → 하기 → 반납 조건을 지키며 가까운 곳부터 */
  const done=new Set(Object.keys(ql).flatMap(id=>ql[id]>=2?['g'+id,'d'+id]:ql[id]>=1?['g'+id]:[]));const out=[];const left=St.slice();
  const ok=it=>!it.need||(Array.isArray(it.need)?it.need.every(x=>done.has(x)):done.has(it.need));const dist=(a,b)=>a&&b?Math.hypot(a[0]-b[0],a[1]-b[1]):999;
  /* 줄 세울 때만 쓰는 자리: 위치 모르는 「하기」는 그 퀘스트를 받은 곳 근처로 어림(화면·길 안내 좌표는 그대로 「위치 없음」) */
  St.forEach(s=>{if(!s.xy&&s.type==='do'){const g=s.items.map(it=>it.q.g).find(g=>g&&g[2]&&g[1]===s.zone);if(g)s.sxy=g[2]}});
  const AC=new Map();const atl=s=>{const p=s.sxy||s.xy;if(!p)return null;const k=s.zone+'|'+p.join(',');if(!AC.has(k))AC.set(k,toAtlas(s.zone,p.join(',')));return AC.get(k)};
  /* 같은 지역이면 지역 좌표, 다른 지역이면 큰 지도 거리(다른 대륙은 맨 뒤) — 지역마다 좌표 기준이 달라서 그냥 빼면 안 됨 */
  const gap=(a,b)=>{if(a.zone===b.zone)return dist(a.sxy||a.xy,b.sxy||b.xy);const p=atl(a),q=atl(b);if(!p||!q)return 5e5;if(p.c!==q.c)return 1e6;return Math.hypot(p.x-q.x,p.y-q.y)};
  let cur=null;if(start&&start.xy){const av=left.filter(s=>s.items.some(ok));const S0={zone:start.z,xy:start.xy};cur=av.slice().sort((a,b)=>(a.zone!==start.z)-(b.zone!==start.z)||gap(S0,a)-gap(S0,b))[0]}
  cur=cur||left.find(s=>s.type==='get'&&s.items.every(ok))||left.find(s=>s.items.some(ok));let g=0;
  while(cur&&g++<120){const R=cur.items.filter(ok),W=cur.items.filter(it=>!ok(it));
    if(R.length){out.push(Object.assign({},cur,{items:R}));R.forEach(it=>{done.add((it.type==='get'?'g':'d')+it.q.id);if(it.type==='turn')done.add('t'+it.q.id)})}
    left.splice(left.indexOf(cur),1);if(W.length)left.push(Object.assign({},cur,{items:W}));if(!left.length)break;
    const av=left.filter(s=>s.items.some(ok));const pool=av.length?av:left;const from=cur;cur=pool.slice().sort((a,b)=>(a.zone!==from.zone)-(b.zone!==from.zone)||gap(from,a)-gap(from,b))[0]}
  /* 붙어 있는 같은 곳·같은 종류는 하나로 */
  const M=[];out.forEach(s=>{const p=M[M.length-1];if(p&&p.type===s.type&&p.zone===s.zone&&(near(p.xy,s.xy)||(!p.xy&&!s.xy&&p.place===s.place)))p.items=p.items.concat(s.items);else M.push(s)});return M}
const RST={get:['받기','g'],do:['하기','o'],turn:['반납','r']};
/* 📱 옆 화면 모드: 게임하는 동안 폰을 세워 두면 「지금 단계」만 크게 · 화면 안 꺼짐 · 30초마다 PC와 맞춤 */
let sideWL=null,sideIv=null,sideKey='';
async function sideLock(on){try{if(on){if('wakeLock' in navigator&&!document.hidden&&!sideWL){sideWL=await navigator.wakeLock.request('screen');sideWL.addEventListener('release',()=>{sideWL=null;if(ui.side)rerender(true)});if(ui.side)rerender(true)}}else if(sideWL){const w=sideWL;sideWL=null;await w.release()}}catch(e){sideWL=null}}
function sideOn(v){ui.side=!!v;clearInterval(sideIv);sideIv=null;sideKey='';
  if(v){try{history.pushState({side:1},'')}catch(e){}sideLock(true);sideIv=setInterval(()=>{if(ui.side&&!document.hidden){(syOn()?syPull(true):Promise.resolve()).then(()=>{if(ui.side)rerender(true)})}},30e3);if(syOn())syPull(true)}
  else sideLock(false);
  document.body.classList.toggle('sidem',!!v);rerender(true)}
function sideView(c){if(!QDB){qdbLoad();return '<div class="sdh"><b>📱 옆 화면</b><button class="x" data-a="side" data-k="0">✕</button></div><p class="note">퀘스트 자료를 불러오는 중…</p>'}
  recView(c);const ST=ui._st||[];const s0=ST[0];
  const wl=sideWL?'<span class="ok">화면 켜 둠</span>':'wakeLock' in navigator?'<span class="warn">화면 켜 두기 안 됨 · 화면을 한 번 눌러 주세요</span>':'<span class="warn">이 브라우저는 화면 켜 두기를 못 해요</span>';
  const sy=syOn()?'PC와 맞춤 '+(SY.at?armAgo(SY.at):'준비 중'):'PC와 연동 안 됨';
  let h='<div class="sdh"><b>📱 옆 화면</b><span>'+wl+' · '+sy+'</span><button class="x" data-a="side" data-k="0">✕</button></div>';
  if(!s0)return h+'<div class="sdc"><h1>이 구간 단계를 다 했어요 🎉</h1><p>레벨업 탭에서 다음 구간을 골라 주세요.</p></div>';
  const key=s0.type+'|'+s0.place+'|'+s0.items.map(i=>i.q.id).join(',');const flash=sideKey&&sideKey!==key;if(flash){try{navigator.vibrate&&navigator.vibrate(60)}catch(e){}}sideKey=key;
  const qp=c.qp||{},qc=c.qc||{};
  const li=s0.items.map(it=>{const q=it.q;let o='';
    if(it.type==='do'&&q.cnt&&q.cnt.length)o=q.cnt.map((x,i)=>{const g=(qp[q.id]||[])[i];const cur=g?g[0]:(qc[q.id+'|'+i]||0),mx=g?g[1]:(x[1]||0);return '<span class="'+(mx&&cur>=mx?'dn':'')+'">'+esc(x[0])+' <b>'+cur+(mx?'/'+mx:'')+'</b></span>'}).join('');
    else if(it.type==='turn'){const xp=(RWD.get(q.id)||{}).xp;o=xp?'<span>경험치 <b>+'+xp.toLocaleString()+'</b></span>':''}
    else if(it.type==='get')o='<span>'+esc(q.g&&q.g[0]||'')+'</span>';
    return '<li><b>'+esc(q.nm)+'</b>'+(o?'<div class="so">'+o+'</div>':'')+qnTag(c,q.id)+'</li>'}).join('');
  const sx=s0.items.filter(i=>i.type==='turn').reduce((n,i)=>n+((RWD.get(i.q.id)||{}).xp||0),0);
  h+='<div class="sdc t-'+s0.type+(flash?' flash':'')+'"><div class="sk">1단계 · '+RST[s0.type][0]+'</div><h1>'+esc(s0.place)+'</h1><div class="sz">'+esc(s0.zone)+(s0.xy?' <b>'+s0.xy[0].toFixed(0)+', '+s0.xy[1].toFixed(0)+'</b>':'')+'</div><ul>'+li+'</ul>'+(sx?'<div class="sxp">이 단계 경험치 <b>+'+sx.toLocaleString()+'</b></div>':'')+'</div>';
  h+='<div class="sdb"><button class="btn sdgo" data-a="rsdone">다 했어요 · 다음 단계</button><button class="btn ghost" data-a="mmgo" data-k="'+s0.items[0].q.id+'">지도</button></div>';
  h+='<div class="sdn">'+ST.slice(1,4).map((s,i)=>'<div><span class="n t-'+s.type+'">'+(i+2)+'</span><b>'+RST[s.type][0]+'</b> '+esc(s.place)+'</div>').join('')+'</div>';
  h+=syOn()?'<p class="sdf">PC에서 게임 파일을 맞추면 30초 안에 이 화면도 저절로 바뀌어요.</p>':'<p class="sdf">PC와 연동하면 PC에서 맞춘 내용이 30초마다 저절로 들어와요 · <button class="lnk" data-a="side" data-k="chars">연동하러 가기</button></p>';
  return h}
/* ⏱ 시간 계획: 단계마다 이동(지도 거리)+할 일 시간을 어림 → 「N분이면 여기까지」·「여기서 레벨업」 */
function recTime(c,ST){const L=c.lv,spd=(L>=40?11.2:7)/1.35;/* 길이 꼬불꼬불해서 직선보다 35% 더 걸림 */
  const at=(z,xy)=>xy?toAtlas(z,xy[0]+','+xy[1]):null;let prev=c.lpos?at(c.lpos.z,c.lpos.xy):null;const M=[],X=[];
  for(const s of ST){const a=at(s.zone,s.xy);let m=0,x=0;
    if(a&&prev){if(a.c!==prev.c)m+=6;else m+=Math.hypot(a.x-prev.x,a.y-prev.y)/0.48/spd/60}
    if(a)prev=a;
    for(const it of s.items){const q=it.q;if(it.type==='turn'){m+=0.4;x+=(RWD.get(q.id)||{}).xp||0}
      else if(it.type==='get')m+=0.4;
      else{const C=(q.cnt||[]);let k=0;if(!C.length){m+=3;k=8}C.forEach(o=>{const n=Math.min(30,+o[1]||1);k+=n;m+=Math.min(12,n*0.45)+0.5});x+=Math.min(40,k)*(45+5*L)}}
    M.push(m);X.push(Math.round(x))}
  const r=jlRate(c)||xpRate(c);let f=1;if(r){const tm=M.reduce((a,b)=>a+b,0),tx=X.reduce((a,b)=>a+b,0);if(tm>5&&tx>0)f=Math.max(0.4,Math.min(2.5,(tx/tm*60)/r))}
  return {M:M.map(v=>v*f),X,cal:f!==1}}
function recTimeCard(c,ST){const T=recTime(c,ST);const B=c.tbud||0;const cum=[];let t=0,x=0;const cx=[];T.M.forEach((m,i)=>{t+=m;x+=T.X[i];cum.push(t);cx.push(x)});
  const mm=v=>v<60?Math.max(1,Math.round(v))+'분':Math.floor(v/60)+'시간'+(Math.round(v%60)?' '+Math.round(v%60)+'분':'');
  const X=myXp(c);let lvI=-1;if(X){const need=X.max-X.cur;lvI=cx.findIndex(v=>v>=need)}
  let cut=-1;if(B){cut=cum.findIndex(v=>v>B);cut=cut<0?ST.length-1:Math.max(0,cut-1)}
  let h='<div class="tplan"><div class="tph"><b>⏱ 시간 계획</b><span>'+[[30,'30분'],[60,'1시간'],[120,'2시간'],[180,'3시간']].map(o=>'<button class="'+(B===o[0]?'on':'')+'" data-a="tbud" data-k="'+(B===o[0]?0:o[0])+'">'+o[1]+'</button>').join('')+'</span></div>';
  if(B){h+=cum[ST.length-1]<=B?'<p>이 구간 '+ST.length+'단계를 다 해도 <b>약 '+mm(cum[ST.length-1])+'</b> · 경험치 <b>+'+cx[ST.length-1].toLocaleString()+'</b></p>'
    :'<p>'+mm(B)+'이면 <b>'+(cut+1)+'단계</b>까지 · 경험치 <b>+'+cx[cut].toLocaleString()+'</b></p>'}
  if(lvI>=0)h+='<p>⬆ '+(c.lv+1)+'레벨은 <b>'+(lvI+1)+'단계</b>쯤 · 약 <b>'+mm(cum[lvI])+'</b> 뒤</p>';
  else if(X)h+='<p>이 구간을 다 하면 경험치 <b>'+Math.round(Math.min(100,(X.cur+cx[ST.length-1])/X.max*100))+'%</b>까지 차요</p>';
  if(!B&&!X)h+='<p class="mute">시간을 고르면 거기까지 할 수 있는 단계를 표시해 줘요.</p>';
  h+='<small>'+(T.cal?'내 사냥 기록 속도에 맞춘 어림이에요':'걷기·사냥 시간을 어림한 값이에요'+(X?'':' · 애드온으로 경험치를 불러오면 레벨업 지점도 보여 줘요'))+'</small></div>';
  return {h,cut:B&&cut<ST.length-1?cut:-1,lvI,mm,cum}}
function recView(c){const L=c.lv;if(!QDB){qdbLoad();return '<p class="note">퀘스트 자료를 불러오는 중…</p>'}
  const P=recPlans(c);if(!P.length)return '<p class="empty-st">이 레벨에 맞는 계획을 못 만들었어요.</p>';
  const pk=P.find(p=>p.k===c.plan)||P[0];c.pdg=c.pdg||[];
  let h=P.length>1?'<div class="plsc"><span>루트</span>'+P.map(p=>'<button class="'+(p===pk?'on':'')+'" data-a="plan" data-k="'+p.k+'">'+esc(p.name)+' <small>'+p.n+'</small></button>').join('')+'</div>':'';
  /* 여정 줄: 지역 + 넣은 던전 */
  const curN=pk.nodes.find(n=>L>=n.a&&L<=n.b)||pk.nodes[0];
  /* 고른 구간: 같은 지역이 여정 줄에 두 번 나올 수 있어서(어둠의 해안 12–17 · 18–22) 지역+시작 레벨로 찾음 */
  const nKey=n=>n.z+'|'+n.a;const selN=ui.pz!=null?(pk.nodes.find(n=>nKey(n)===ui.pz)||pk.nodes.find(n=>n.z===ui.pz)||null):null;
  const dgs=c.pdg.map(s=>DG[s]).filter(Boolean);
  const nodes=pk.nodes.map(n=>({t:'z',lv:n.a,n})).concat(dgs.map(d=>({t:'d',lv:Math.max(L,d.lo),d}))).sort((a,b)=>a.lv-b.lv);
  h+='<div class="jy2">'+nodes.map(x=>x.t==='z'?'<button class="jn2'+(x.n===curN?' now':'')+(x.n===selN&&selN!==curN?' sel':'')+'" data-a="pnode" data-k="'+esc(nKey(x.n))+'"><span class="c" style="background-image:url('+ICO(zIco(x.n.z))+')"></span>'+(x.n===curN?'<span class="nb">지금</span>':'')+'<b>'+esc(x.n.z)+'</b><small>'+x.n.a+'–'+x.n.b+'</small></button>'
    :'<button class="jn2 dg" data-a="dgo" data-k="'+x.d.slug+'"><span class="c" style="background-image:url('+DG_IMG(x.d.slug)+')"></span><b>'+esc(x.d.ko.replace(/^붉은십자군 수도원: /,'붉은십자군 '))+'</b><small>'+x.d.lo+' 던전</small></button>').join('')
    +'<button class="jn2 add" data-a="pdgo"><span class="c">＋</span><b>던전 넣기</b><small>&nbsp;</small></button></div>';
  if(ui.pdgo){const mx=Math.max(...pk.nodes.map(n=>n.b));const cand=DGS.filter(d=>d.lo<=mx&&d.hi>=L).sort((a,b)=>a.lo-b.lo);
    h+='<div class="card pdg"><h3>계획에 던전 넣기 <small class="mute">'+L+'–'+mx+'레벨</small></h3>'+cand.map(d=>{const on=c.pdg.includes(d.slug);const ups=dgUps(c,d).length;return '<button class="pdgr'+(on?' on':'')+'" data-a="pdgt" data-k="'+d.slug+'"><span class="ic" style="background-image:url('+DG_IMG(d.slug)+')"></span><span class="m"><b>'+esc(d.ko)+(d.soon?' <em class="soonm">🚧 개방 예정</em>':'')+'</b><small>'+d.lo+'–'+d.hi+' · 내 템 '+ups+' · 퀘스트 '+dqOf(c,d).length+'</small></span><span class="sw2"></span></button>'}).join('')+'<p class="note">넣은 던전은 여정 줄에 나오고, 누르면 던전 공략으로 가요. 던전 퀘스트는 던전 화면의 퀘스트 탭에서 미리 받아 두세요.</p></div>'}
  /* 편의 칩 */
  const rdy=Object.values(c.ql||{}).filter(v=>v===2).length;const fr=frList(c).map(k=>ARM[k]).filter(A=>A&&Math.abs((A.level||0)-L)<=3);
  h+='<div class="qa2">'+(rdy?'<button data-a="qmode" data-k="log">🎒 반납 가능 <b>'+rdy+'</b></button>':'')+(fr.length?'<span title="'+esc(fr.map(A=>A.name+' '+A.level).join(', '))+'">👥 같은 구간 친구 <b>'+fr.length+'</b> · '+esc(fr.slice(0,3).map(A=>A.name).join(' · '))+'</span>':'')+'</div>';
  /* 지금 지역의 단계 */
  const qsOf=n=>{const z=n.z;if(pk.k==='app'){const S=n.S;const seen=new Set();return (S?S.q:[]).filter(q=>(q.gz||q.sz)===z||!q.gz).filter(q=>{if(seen.has(q.id))return false;seen.add(q.id);return q.id&&!qd(c,q.gz||q.sz,q)}).map(q=>recQ(q.id,z)).filter(Boolean)}
    return (n.qs||[]).slice(0,18).map(q=>recQ(q.id,z)).filter(Boolean)};
  /* 아직 받을 수 없는 퀘스트(최소 레벨이 내 레벨보다 높음)는 단계에서 빼고 따로 셈 */
  const minLv=q=>((QDB&&QDB.get(q.id))||{}).m||0;
  /* 장인의 계약서(전문기술로 만든 물건 120개를 내는 퀘스트)는 누구에게나 권하지 않음 */
  const prof=q=>/^장인의 계약서/.test(q.nm||'');
  /* 앞 퀘스트 맞추기(게임 기록을 불러왔을 때): 앞 퀘스트를 안 했고 이 구간에도 없으면 받을 수 있는 앞 퀘스트를 구간에 끌어오고(4단계까지),
     그래도 안 되면 단계에서 빼고 「먼저 「…」」로 알려 줌 — 예: 마이조스는 트롤의 마법·대령 쿠르젠을 끝내야 받을 수 있음 */
  const preFix=(n,list)=>{if(!c.imported||!QDB)return {list,blk:[]};const ids=new Set(list.map(q=>q.id)),out=list.slice(),blk=[],ql=c.ql||{};
    const dn=p=>{const P=QDB.get(p);return !P||!qdbOk(c,P)||mqDone(c,P)};
    const groups=id=>{const X=QDB.get(id);if(!X)return [];const G=(X.pre||[]).map(p=>[p]);if(X.pre1&&X.pre1.length)G.push(X.pre1);return G.filter(g=>!g.some(dn))};
    const pull=(id,d)=>{for(const g of groups(id)){if(g.some(p=>ids.has(p)))continue;let ok=false;
        for(const p of g){const P=QDB.get(p);if(!P||(P.m||0)>L||d>4||prof({nm:P.n}))continue;if(!pull(p,d+1))continue;const r=recQ(p,n.z);if(!r)continue;out.push(r);ids.add(p);ok=true;break}
        if(!ok)return false}return true};
    for(const q of list){if((ql[q.id]||0)>=1)continue;if(!pull(q.id,0)){const g=groups(q.id).find(g=>!g.some(p=>ids.has(p)));blk.push({q,need:g&&QDB.get(g[0])})}}
    /* 앞 퀘스트가 목록에 있어도 그게 막혔으면 이것도 막힘 — 바뀌지 않을 때까지 반복 */
    const B=new Set(blk.map(x=>x.q.id));for(let more=true,k=0;more&&k<20;k++){more=false;
      for(const q of out){if(B.has(q.id)||(ql[q.id]||0)>=1)continue;const g=groups(q.id).find(g=>!g.some(p=>ids.has(p)&&!B.has(p)));if(g){B.add(q.id);blk.push({q,need:QDB.get(g.find(p=>B.has(p))||g[0])});more=true}}}
    return {list:out.filter(q=>!B.has(q.id)),blk}};
  const baseOf=n=>qsOf(n).filter(q=>q.lv<=Math.max(L,n.a)+3&&minLv(q)<=L&&(!QDB||QDB.has(q.id))&&!prof(q));
  const blkOf=n=>preFix(n,baseOf(n)).blk;
  const stOf=n=>recStages(c,preFix(n,baseOf(n)).list,c.lpos);
  const lockOf=n=>qsOf(n).filter(q=>q.lv<=Math.max(L,n.a)+3&&minLv(q)>L&&(c.ql||{})[q.id]==null);
  let node=selN||curN,ST=stOf(node),moved=null;
  /* 이 구간 퀘스트를 다 했으면 다음 구간으로 자동으로 넘어감 (레벨을 안 올렸어도) */
  if(!ST.length&&(!selN||selN===curN))for(const n of pk.nodes.slice(pk.nodes.indexOf(curN)+1)){const st=stOf(n);if(st.length){moved=node;node=n;ST=st;break}}
  const z=node.z;ui._st=ST;
  if(moved){const kk=esc(nKey(node));h=h.replace('class="jn2" data-a="pnode" data-k="'+kk+'"','class="jn2 sel" data-a="pnode" data-k="'+kk+'"')}
  /* 레벨이 모자라 아직 못 받는 퀘스트: 「다 했어요」 대신 몇 레벨부터인지 알려 줌 */
  const lk=lockOf(moved||node);const lkMsg=lk.length?' · 남은 '+lk.length+'개는 '+Math.min(...lk.map(minLv))+'레벨부터 받을 수 있어요':'';
  if(!ST.length)return h+'<div class="card"><p class="note">'+esc(z)+' '+node.a+'–'+node.b+(lk.length?' 지금 받을 수 있는 퀘스트를 다 했어요'+lkMsg+'. ':' 퀘스트를 다 했어요 🎉 ')+(pk.nodes.indexOf(node)<pk.nodes.length-1?'여정 줄에서 다음 구간을 눌러 보세요.':'이 루트 끝까지 왔어요.')+'</p></div>';
  if(moved)h+='<p class="note mvn">✓ '+esc(moved.z)+' '+moved.a+'–'+moved.b+(lk.length?' 지금 받을 수 있는 퀘스트를 다 했어요'+lkMsg:' 퀘스트를 다 했어요')+' · 다음 구간으로 넘어갔어요: <b>'+esc(node.z)+' '+node.a+'–'+node.b+'</b>'+(node.a>L+2?' · 몹 레벨이 조금 높으니 조심하세요':'')+'</p>';
  {const bk=blkOf(moved||node);if(bk.length)h+='<div class="card blkq"><p class="note">🔒 <b>앞 퀘스트를 먼저 끝내야 받을 수 있는 퀘스트 '+bk.length+'개</b> — 단계에서 뺐어요.</p><ul>'+bk.slice(0,6).map(x=>'<li><button class="lnk" data-a="qopen" data-k="'+x.q.id+'">「'+esc(x.q.nm)+'」</button>'+(x.need?' ← 먼저 <button class="lnk" data-a="qopen" data-k="'+x.need.id+'">「'+esc(x.need.n)+'」</button> <small class="mute">'+esc(x.need.z||'')+' · '+mTxt(x.need)+'</small>':'')+'</li>').join('')+'</ul></div>'}
  const s0=ST[0];const xpOf=s=>s.items.filter(i=>i.type==='turn').reduce((n,i)=>n+((RWD.get(i.q.id)||{}).xp||0),0);
  const xy=s=>s.xy?' '+s.xy[0].toFixed(0)+', '+s.xy[1].toFixed(0):'';
  h+='<button class="swrow" data-a="rmap"><span class="sw'+(recMapOn(c)?' on':'')+'"></span><b>지도 같이 보기</b><small>단계 순서를 지도에 길 따라</small></button>';
  if(recMapOn(c))h+='<!--RM--><div class="gmrow">'+gmStyleSeg(c,1)+'</div>';
  if(recMapOn(c)){let pts=ST.slice(0,10).filter(s=>s.xy&&s.zone===ST[0].zone);{const k=pts.findIndex((s,i)=>i>=3&&Math.hypot(s.xy[0]-pts[i-1].xy[0],s.xy[1]-pts[i-1].xy[1])>40);if(k>0)pts=pts.slice(0,k)}/* 먼 곳으로 넘어가는 단계는 빼서 지도를 크게 */const P=[];
    const SP={};ui._stp=SP;pts.forEach((s,i)=>{const n=ST.indexOf(s)+1;const j=pts.slice(0,i).findIndex(p=>Math.hypot(p.xy[0]-s.xy[0],p.xy[1]-s.xy[1])<2.5);if(j>=0){SP[n]=SP[ST.indexOf(pts[j])+1];const pp=P.find(x=>x.t===SP[n]);if(pp)(pp.more=pp.more||[]).push(n);return}SP[n]=String(n);P.push({x:s.xy[0],y:s.xy[1],k:'s'+s.type,t:String(n),on:i===0,lab:i<4?s.place.split(' · ')[0].slice(0,12):''})});/* 같은 자리 단계는 한 핀에 「1·2·7」처럼 */
    {const q0=(ST.find(s=>s.items&&s.items[0])||{items:[]}).items[0];h+='<div class="rmap gm'+(q0?' tap':'')+'"'+(q0?' data-a="mmgo" data-k="'+q0.q.id+'"':'')+'>'}h+=gmapHtml(ST[0].zone,P.reverse(),pts.flatMap(s=>s.via?[s.via,s.xy]:[s.xy]),0,1,miniStyle(c)!=='game')+'<div class="rmapf"><span><i style="background:#ffd65a"></i>받기</span><span><i style="background:#ff9a4a"></i>하기</span><span><i style="background:#7ec8ff"></i>반납</span><small class="rmn">선은 걸어가는 길(산·물은 피해서) · 흐린 점선은 배·비행 같은 먼 길</small><button class="btn sm ghost" data-a="mmgo" data-k="'+ST[0].items[0].q.id+'">크게 보기 ›</button></div></div>'}
  else if(recMapOn(c)){const pts=ST.slice(0,10).filter(s=>s.xy&&s.zone===ST[0].zone);const W=366,H=230;const x=v=>8+v/100*(W-16),y=v=>8+v/100*(H-16);
    let m='<svg viewBox="0 0 '+W+' '+H+'" class="rmapsvg"><rect width="'+W+'" height="'+H+'" rx="12" fill="#221c14"/>';
    for(let i=10;i<100;i+=10)m+='<line x1="'+x(i)+'" y1="0" x2="'+x(i)+'" y2="'+H+'" stroke="#2c251b"/><line x1="0" y1="'+y(i)+'" x2="'+W+'" y2="'+y(i)+'" stroke="#2c251b"/>';
    if(pts.length>1)m+='<polyline points="'+pts.map(s=>x(s.xy[0])+','+y(s.xy[1])).join(' ')+'" fill="none" stroke="#e8c06a" stroke-width="2.5" stroke-dasharray="7 6"/>';
    const col={get:'#ffd65a',do:'#ff9a4a',turn:'#7ec8ff'};pts.slice().reverse().forEach(s=>{const i=pts.indexOf(s);const n=ST.indexOf(s)+1;if(i>0&&pts.slice(0,i).some(p=>Math.hypot(p.xy[0]-s.xy[0],p.xy[1]-s.xy[1])<3))return;m+='<circle cx="'+x(s.xy[0])+'" cy="'+y(s.xy[1])+'" r="'+(i?11:14)+'" fill="'+col[s.type]+'" stroke="#1a140a" stroke-width="2.5"/><text x="'+x(s.xy[0])+'" y="'+(y(s.xy[1])+4)+'" text-anchor="middle" font-size="12" font-weight="900" fill="#1a140a">'+n+'</text>'+(i<5?'<text x="'+(x(s.xy[0])+(s.xy[0]>70?-16:16))+'" y="'+(y(s.xy[1])+4)+'" text-anchor="'+(s.xy[0]>70?'end':'start')+'" font-size="10.5" font-weight="700" fill="#fff" style="paint-order:stroke;stroke:#000;stroke-width:3px">'+esc(s.place.split(' · ')[0]).slice(0,12)+'</text>':'')});
    m+='<text x="12" y="'+(H-10)+'" font-size="11" fill="#a59d8c">'+esc(ST[0].zone)+' · 좌표 기준 · 단계 1–'+Math.min(10,ST.length)+'</text></svg>';
    h+='<div class="rmap">'+m+'<div class="rmapf"><span><i style="background:#ffd65a"></i>받기</span><span><i style="background:#ff9a4a"></i>하기</span><span><i style="background:#7ec8ff"></i>반납</span><button class="btn sm ghost" data-a="mmgo" data-k="'+ST[0].items[0].q.id+'">진짜 지도에서 크게 ›</button></div></div>'}
  if(recMapOn(c))h+='<!--/RM-->';
  h+='<div class="scroll2"><div class="k">1단계 · 지금 할 일 · '+RST[s0.type][0]+'</div><h3>'+esc(s0.place)+'</h3><div class="wh">'+esc(s0.zone)+xy(s0)+' · '+s0.items.length+'개</div>';
  {/* 섬(배로 건너가는 곳) ↔ 뭍 사이를 오가면 알려 주기 */const ISL=[['페더문','페더문 요새는 섬이에요. 페랄라스 서쪽 해안 선착장(31, 39 근처)에서 배를 타고 건너요.']];const isl=x=>x?ISL.find(i=>x.place.includes(i[0])):null;
   const hit=isl(s0)||isl(ST[1]);if(hit)h+='<div class="isl">⛵ '+esc(hit[1])+'</div>';
   else{const bt=boatTip(s0.zone,ST[1]&&ST[1].zone);if(bt)h+='<div class="isl">⛵ '+esc(bt)+'</div>'}}
  h+=s0.items.map(it=>{const q=it.q;if(it.type==='do'&&q.cnt.length)return q.cnt.map((o,i)=>{const k=q.id+'|'+i;const v=(c.qc||{})[k]||0;return '<div class="ob4"><span class="m">'+esc(o[0])+'<small>'+esc(q.nm)+'</small>'+(i===0?qnTag(c,q.id):'')+'</span><span class="cn"><button data-a="qcn" data-k="'+k+'" data-d="-1">−</button><b>'+v+'/'+o[1]+'</b><button data-a="qcn" data-k="'+k+'" data-d="1">＋</button></span></div>'}).join('');
    return '<div class="ob4"><span class="m">'+esc(q.nm)+'<small>'+(it.type==='get'?esc(q.g[0]||'')+(q.lv>0?' · Lv '+q.lv:'')+preHint(c,q.id):it.type==='turn'?'반납 · '+esc(q.r[0]||''):esc(q.o?q.o.nm:'평판 올리기'))+'</small>'+qnTag(c,q.id)+'</span>'+(it.type==='turn'&&(RWD.get(q.id)||{}).xp?'<span class="xp">+'+((RWD.get(q.id)||{}).xp).toLocaleString()+'</span>':'')+'</div>'}).join('');
  const sx=xpOf(s0);if(sx)h+='<div class="xpl">이 단계 경험치 <b>+'+sx.toLocaleString()+'</b></div>';
  h+='<div class="ft"><button class="q" data-a="mmgo" data-k="'+s0.items[0].q.id+'">지도</button><button class="p" data-a="rsdone">다 했어요 · 다음 단계</button></div></div>';
  const more=ui.rsall?ST.slice(1):ST.slice(1,5);
  const TC=recTimeCard(c,ST);h+=TC.h;h+='<button class="btn sm ghost full navgo" data-a="side" data-k="1">📱 옆 화면 모드 <small>게임하면서 폰 세워 두기 · 화면 안 꺼짐</small></button>';if(isPC()||FSA)h+='<button class="btn sm ghost full navgo" data-a="wfr">🧭 게임 화면에 이 단계 길 안내 띄우기 <small>애드온 /wfh 추천</small></button>';const h0=h.length;
  h+='<div class="nxl3"><div class="hd"><b>다음 단계</b><small>'+(ST.length-1)+'개</small></div>'+more.map((s,i)=>'<div class="nxr3" data-st="'+(i+2)+'"><span class="n t-'+s.type+'">'+(i+2)+'</span><span class="m"><b>'+RST[s.type][0]+' · '+esc(s.place)+'</b><small>'+esc(s.items.map(it=>it.q.nm).filter((v,j,a)=>a.indexOf(v)===j).slice(0,3).join(' · '))+(s.items.length>3?' 외 '+(s.items.length-3):'')+'</small></span>'+(xpOf(s)?'<span class="xv">+'+xpOf(s).toLocaleString()+'</span>':'')+'</div>').join('')
   +(ST.length>5?'<button class="btn ghost sm full" data-a="rsall">'+(ui.rsall?'접기':'모든 단계 보기 ('+(ST.length-1)+')')+'</button>':'')+'</div>';
  {const mk=(k,t)=>{const a='<div class="nxr3" data-st="'+(k+2)+'"';const p=h.indexOf(a,h0);if(p>0)h=h.slice(0,p)+t+h.slice(p)};
   if(TC.cut>=0)mk(TC.cut,'<div class="tcut">⏱ '+TC.mm(c.tbud)+'이면 여기까지</div>');
   if(TC.lvI>=0&&TC.lvI<ST.length-1)mk(TC.lvI,'<div class="tcut lv">⬆ 여기서 '+(c.lv+1)+'레벨 · 약 '+TC.mm(TC.cum[TC.lvI])+'</div>')}
  /* PC: 단계는 왼쪽, 지도는 오른쪽 */
  if(recMapOn(c)&&isPC()){const a=h.indexOf('<!--RM-->'),b=h.indexOf('<!--/RM-->');if(a>=0&&b>a){const mp=h.slice(a+9,b);h=h.slice(0,a)+'<div class="rec2"><div class="rec2l">'+h.slice(b+10)+'</div><div class="rec2r">'+mp+'</div></div>'}}
  return h}

/* ===== 🎒 지금 퀘스트창 (게임에서 불러온 목록) → 동선 · 목록 ===== */
function xyOf(t){const m=String(t||'').match(/(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)/);return m?[+m[1],+m[2]]:null}
function logStops(c,ids){const St=[];const near=(a,b)=>a&&b&&Math.hypot(a[0]-b[0],a[1]-b[1])<6;
  const add=(type,zone,xy,place,q,need)=>{let s0=St.find(s=>s.zone===zone&&((xy&&near(s.xy,xy))||(!xy&&!s.xy&&s.place===place)));if(!s0){s0={type,zone,xy,place,items:[],need:new Set()};St.push(s0)}else{if(s0.type!==type)s0.type='mix';if(place&&!s0.place.split(' · ').includes(place))s0.place+=' · '+place}s0.items.push({q,type});if(need)s0.need.add(need);return s0};
  ids.forEach(id=>{const q=QDB.get(id);if(!q)return;const st=c.ql[id];const d=QD.get(id)||{};const R=q.r||[];const G=q.g||[];
    const rz=R[1]||q.z,rxy=xyOf(R[2]);
    if(st===2){add('turn',rz,rxy,R[0]||'반납',q)}
    else{const t=(d.t||[])[0];const qp=qPlace(q);const txy=t?xyOf(t[2]):null;const oxy=txy||(qp&&qp.xy);const oz=txy?q.z:(qp?qp.zone:q.z);const rep=/평판/.test(q.o||'');if(t&&t[1]||rep||qp&&!(d.t&&d.t.length)){const place=t&&t[1]?t[1]:qp?qp.nm:'평판 올리기 (켄타우로스 등 처치)';add('do',oz,oxy,place,q);add('turn',rz,rxy,R[0]||'반납',q,id)}else add('turn',rz,rxy,R[0]||'가는 곳',q)}});
  /* 가까운 곳부터, 반납은 할 일 끝난 뒤 */
  const byZ={};St.forEach(s=>(byZ[s.zone]=byZ[s.zone]||[]).push(s));
  const dist=(a,b)=>a&&b?Math.hypot(a[0]-b[0],a[1]-b[1]):999;
  return Object.entries(byZ).sort((a,b)=>b[1].length-a[1].length).map(([z,L])=>{const out=[];const doneQ=new Set();const left=L.slice();
    const readyItems=s=>s.items.filter(it=>it.type!=='turn'||!s.need.size||!it.q||!s.need.has(it.q.id)||doneQ.has(it.q.id));
    /* 시작: 지금 반납할 게 제일 많은 곳(보통 지금 있는 마을) */
    let cur=left.filter(s=>s.xy).sort((a,b)=>readyItems(b).filter(i=>i.type==='turn').length-readyItems(a).filter(i=>i.type==='turn').length)[0]||left[0];
    let guard=0;
    while(cur&&guard++<80){const R=readyItems(cur);const W=cur.items.filter(it=>!R.includes(it));
      if(R.length){out.push(Object.assign({},cur,{items:R,type:R.every(i=>i.type==='turn')?'turn':R.every(i=>i.type==='do')?'do':'mix'}));R.forEach(it=>{if(it.type==='do')doneQ.add(it.q.id)})}
      left.splice(left.indexOf(cur),1);
      if(W.length){const rest=Object.assign({},cur,{items:W,type:'turn',need:new Set(W.map(i=>i.q.id))});left.push(rest)}
      if(!left.length)break;
      const avail=left.filter(s=>readyItems(s).length);const pool=avail.length?avail:left;
      cur=pool.slice().sort((a,b)=>dist(cur.xy,a.xy)-dist(cur.xy,b.xy))[0]}
    return [z,out]})}
/* 퀘스트창 목록: 같은 연계끼리 붙여서 단계 순서대로 (연계 없는 건 레벨 순) */
function chInfo(id){let ch=null;try{ch=chainOf(id)}catch(e){}if(!ch||ch.length<2)return null;const r=ch.find(x=>x[6]===id)||ch.find(x=>x[5]);return {root:String(ch[0][6]||ch[0][1]),br:String((ch[1]||ch[0])[6]||''),step:r?r[0]:0,n:ch.length,first:ch[0][1]}}/* 같은 시작 퀘스트끼리, 그 안에서 갈래(둘째 단계)별로 */
function chSort(L){const k=q=>{const I=chInfo(q.id);return I?[String(I.root),I.step]:['~'+String(q.lv||0).padStart(2,'0')+q.id,0]};
  const lvOf={};L.forEach(q=>{const I=chInfo(q.id);const r=I?String(I.root):'x'+q.id;lvOf[r]=Math.min(lvOf[r]??99,q.lv||99)});
  return L.slice().sort((a,b)=>{const A=chInfo(a.id),B=chInfo(b.id);const ra=A?String(A.root):'x'+a.id,rb=B?String(B.root):'x'+b.id;if(ra===rb)return (A.br<B.br?-1:A.br>B.br?1:0)||(A.step-B.step);return (lvOf[ra]-lvOf[rb])||(ra<rb?-1:1)})}
function chRows(L,f){const S=chSort(L);return S.map((q,i)=>{let h=f(q);const A=i?chInfo(S[i-1].id):null,B=chInfo(q.id);if(A&&B&&A.root===B.root)h=h.replace('class="lg3r','class="lg3r lgcont');return h}).join('')}
/* 연계 퀘스트 표시: 🔗 연계 2/5 */
function chTag(id){let ch=null;try{ch=chainOf(id)}catch(e){}if(!ch||ch.length<2){const d=QD.get(id);ch=d&&d.ch&&d.ch.length>1?d.ch:null}if(!ch)return '';const r=ch.find(x=>x[6]===id)||ch.find(x=>x[5]);return '<i class="chtag">🔗 연계'+(r?' '+r[0]+'/'+ch.length:'')+'</i>'}
function logView(c){const ql=c.ql||{};const ids=Object.keys(ql).map(Number);
  if(!ids.length)return '<div class="card lgempty"><h3>🎒 지금 퀘스트창</h3><p class="note">게임 퀘스트창에 있는 퀘스트를 가져오면, 어디서 하고 어디서 반납하는지 <b>동선</b>으로 정리해 줘요.</p><button class="btn" data-a="imp">🧩 게임에서 불러오기</button></div>';
  if(!QDB){qdbLoad();return '<p class="note">퀘스트 자료를 불러오는 중…</p>'}
  const rdy=ids.filter(id=>ql[id]===2).length;const known=ids.filter(id=>QDB.has(id));const unk=ids.length-known.length;const v=c.lgRoute?'route':'list';
  const QLMAX=40,free=QLMAX-ids.length;
  /* 다음에 들를 마을에서 받을 퀘스트 수 → 자리 모자라면 경고 */
  const S0=routeOf(c).find(S=>c.lv>=S.a&&c.lv<=S.b);let nextGet=0,nextHub='';if(S0){const H=nowPlan(c,S0).find(H=>H.get.some(x=>!x.done&&!x.prof&&x.q.min<=c.lv&&!ql[x.q.id]));if(H){nextGet=H.get.filter(x=>!x.done&&!x.prof&&x.q.min<=c.lv&&!ql[x.q.id]).length;nextHub=H.npc?H.npc+' 근처':H.n.replace(/ \(\d+, \d+\)$/,'')}}
  let h='<div class="lgh2 lg3h"><span class="big">'+ids.length+'<small>/'+QLMAX+'</small></span><span class="m"><b>지금 퀘스트창 <i class="lgfree'+(free<=5?' low':'')+'">'+(free>0?free+'칸 남음':'꽉 찼어요')+'</i></b><span class="lgbar"><i style="width:'+Math.min(100,ids.length/QLMAX*100)+'%"></i></span><small>반납 가능 '+rdy+' · 하는 중 '+(ids.length-rdy)+(c.imported?' · '+new Date(c.imported.t).toLocaleDateString('ko-KR')+' 불러옴':'')+'</small></span><button class="btn sm ghost" data-a="imp">다시 불러오기</button></div>';
  if(nextGet)h+='<p class="lgwarn'+(nextGet>free?' bad':'')+'">'+(nextGet>free?'⚠ ':'📥 ')+'다음 갈 곳 <b>'+esc(nextHub)+'</b>에서 받을 퀘스트 '+nextGet+'개 · '+(nextGet>free?'자리가 '+(nextGet-free)+'칸 모자라요. 아래 「정리해도 되는 퀘스트」를 먼저 버려 보세요':'자리는 충분해요')+'</p>';
  h+='<button class="swrow" data-a="lgv"><span class="sw'+(v==='route'?' on':'')+'"></span><b>동선으로 보기</b><small>하는 순서대로 정리</small></button>';
  const qline=(q,type)=>{const st=ql[q.id];return '<button class="lgq" data-a="qopen" data-k="'+q.id+'"><span class="lvq2">'+(q.lv||'?')+'</span><span class="m"><b class="qnb"><span class="qn">'+esc(q.n)+'</span>'+chTag(q.id)+'</b>'+(type?'<small>'+(type==='turn'?'반납'+(st===2?'':' (할 일 끝난 뒤)'):'할 일: '+esc(((QD.get(q.id)||{}).t||[]).map(t=>t[1]).filter(Boolean).slice(0,2).join(' · ')||String(q.o||'').slice(0,40)))+'</small>':'')+'</span>'+(st===2?'<em class="rdy">반납 가능</em>':'')+'</button>'};
  if(v==='route'){
    logStops(c,known).forEach(([z,L])=>{h+='<div class="lgz"><b>'+esc(z)+'</b><small>'+L.length+'곳</small></div><div class="lgr2">'+L.map((s,i)=>'<div class="lgs t-'+s.type+'"><span class="n">'+(i+1)+'</span><div class="b"><div class="h"><span class="k">'+(s.type==='turn'?'반납':s.type==='do'?'하기':'하기·반납')+'</span><b>'+esc(s.place)+'</b><small>'+(s.xy?s.xy[0].toFixed(0)+', '+s.xy[1].toFixed(0):'')+'</small>'+(s.items[0]?'<button class="mp" data-a="mmgo" data-k="'+s.items[0].q.id+'">지도</button>':'')+'</div>'+s.items.map(it=>qline(it.q,it.type)).join('')+'</div></div>').join('')+'</div>'})}
  else{const L=c.lv;const DQ={};DGS.forEach(d=>d.q.forEach(x=>{DQ[x.id]=d}));
    const why=q=>{const d=(q.lv||L)-L;if(d<=-8)return ['old','경험치 거의 없음 ('+q.lv+')'];if(d>=5)return ['hard',d+'레벨 높음 · 나중에'];return null};
    const row=(q,extra,rm)=>{const st=ql[q.id];const d0=QD.get(q.id)||{};const tk=tasksOf(d0,q.o||d0.obj||'').map(t=>t.nm).filter(Boolean).slice(0,2).join(' · ')||objClause(q.o||'');const talk=/반납하는 NPC와 이야기하면 끝나요/.test(tk);
      const r=q.r||[];return '<div class="lg3r'+(st===2?' rdy':'')+'"><button class="lg3m" data-a="qopen" data-k="'+q.id+'"><span class="lvq2 '+lvCls(q.lv||L,L)+'">'+(q.lv||'?')+'</span><span class="m"><b class="qnb"><span class="qn">'+esc(q.n)+'</span>'+chTag(q.id)+'</b><small>'+(st===2||talk?(talk&&st!==2?'대화만 하면 끝 → ':'반납 → ')+esc(r[0]||'?'):'할 일: '+esc(tk))+'</small></span>'+qpHtml(c,q.id)+(extra||'')+'</button><span class="lg3a"><button class="ib" data-a="mmgo" data-k="'+q.id+'" title="지도">📍</button>'+(rm?'<button class="ib rm" data-a="qlrm" data-k="'+q.id+'" title="게임에서 포기했어요">🗑</button>':'<button class="ib ok" data-a="qldone" data-k="'+q.id+'" title="끝냈어요">✓</button>')+'</span></div>'};
    const Q=known.map(id=>QDB.get(id));const used=new Set();const cur=S0?S0.z.split(' · '):[];
    /* 1) 반납하러 가기: 반납할 곳(지역·NPC)별로 */
    const R=Q.filter(q=>ql[q.id]===2);if(R.length){const G={};R.forEach(q=>{const r=q.r||[];const k=(r[1]||q.z);(G[k]=G[k]||[]).push(q);used.add(q.id)});
      h+='<div class="lg3s"><h4>🔔 반납하러 가기 <small>'+R.length+'개 · 한 번에 들르면 좋은 곳끼리</small></h4>'+'<div class="lg3gs">'+Object.entries(G).sort((a,b)=>(cur.includes(b[0])-cur.includes(a[0]))||b[1].length-a[1].length).map(([z,L2])=>'<div class="lg3g"><div class="lg3gh"><b>'+esc(z)+'</b>'+(cur.includes(z)?'<i class="here">지금 구간</i>':'')+'<em>'+L2.length+'개</em></div><div class="lg3l">'+chRows(L2,q=>row(q))+'</div></div>').join('')+'</div></div>'}
    /* 2) 정리해도 되는 퀘스트 (회색 = 경험치 거의 없음 / 너무 높음) */
    const X=Q.filter(q=>!used.has(q.id)&&why(q));X.forEach(q=>used.add(q.id));
    /* 자리가 모자라면: 동선에서 먼 곳 · 경험치 적은 퀘스트도 후보로 (던전 퀘스트 제외) */
    const XW={};if(free<=8){const nxt=new Set(routeOf(c).filter(S=>S.b>=L&&S.a<=L+4).flatMap(S=>S.z.split(' · ')).map(zn));const cc=cur.length?CONT[cur[0]]:null;
      const xs=Q.filter(q=>!used.has(q.id)&&!DQ[q.id]&&ql[q.id]!==2).map(q=>{const z=zn(q.z);const far=!nxt.has(z);const other=cc&&CONT[z]&&CONT[z]!==cc;const x=qxpAt(q,L);return {q,far,other,x}});
      const med=xs.map(o=>o.x).filter(Boolean).sort((a,b)=>a-b)[Math.floor(xs.length/2)]||0;
      xs.filter(o=>o.far||(med&&o.x&&o.x<med*.5)).sort((a,b)=>(b.other-a.other)||(b.far-a.far)||(a.x-b.x)).slice(0,Math.max(3,10-free)).forEach(o=>{XW[o.q.id]=o.other?['far','다른 대륙 ('+zn(o.q.z)+')']:o.far?['far','동선에서 먼 곳 ('+zn(o.q.z)+')']:['old','경험치 적음'+(o.x?' (+'+o.x.toLocaleString()+')':'')];X.push(o.q);used.add(o.q.id)})}
    /* 3) 던전 퀘스트 */
    const D=Q.filter(q=>!used.has(q.id)&&DQ[q.id]);D.forEach(q=>used.add(q.id));
    /* 4) 하는 중: 지역별 */
    const W=Q.filter(q=>!used.has(q.id));const byZ={};/* 할 일 하는 지역 기준 (받은 지역과 다르면 몹 있는 곳) */const doZ=q=>{const o=obPlaces(q).find(o=>!o.dg);return zn(o?o.zone:q.z)};W.forEach(q=>{const z=doZ(q);(byZ[z]=byZ[z]||[]).push(q)});
    if(W.length)h+='<div class="lg3s"><h4>⚔️ 하는 중 <small>'+W.length+'개 · 지역별</small></h4><div class="lg3gs">'+Object.entries(byZ).sort((a,b)=>(cur.includes(b[0])-cur.includes(a[0]))||b[1].length-a[1].length).map(([z,L2])=>'<div class="lg3g"><div class="lg3gh"><b>'+esc(z)+'</b>'+(cur.includes(z)?'<i class="here">지금 구간</i>':'')+'<em>'+L2.length+'개</em></div><div class="lg3l">'+chRows(L2,q=>row(q))+'</div></div>').join('')+'</div></div>';
    if(D.length){const G={};D.forEach(q=>{const d=DQ[q.id];(G[d.slug]=G[d.slug]||{d,L:[]}).L.push(q)});
      h+='<div class="lg3s"><h4>🏰 던전 퀘스트 <small>'+D.length+'개 · 던전 갈 때 한꺼번에</small></h4><div class="lg3gs">'+Object.values(G).map(({d,L:L2})=>'<div class="lg3g"><div class="lg3gh"><b>'+esc(d.ko)+'</b><small>'+d.lo+'–'+d.hi+'</small><button class="btn sm ghost" data-a="dgo" data-k="'+d.slug+'">던전 공략 ›</button></div><div class="lg3l">'+chRows(L2,q=>row(q))+'</div></div>').join('')+'</div></div>'}
    if(X.length)h+='<div class="lg3s lg3x"><h4>🗑️ 정리해도 되는 퀘스트 <small>'+X.length+'개 · 자리가 모자랄 때 게임에서 먼저 포기</small></h4><div class="lg3l">'+X.map(q=>{const w=why(q)||XW[q.id];return row(q,'<span class="lgwhy '+w[0]+'">'+w[1]+'</span>',1)}).join('')+'</div><p class="note">앱에서 지워도 게임 퀘스트창은 그대로예요. 게임에서 포기한 뒤 🗑 를 누르면 앱에서도 빠져요 (끝낸 걸로 치지 않아요).</p></div>'}
  if(unk)h+='<p class="note">앱 자료에 없는 퀘스트 '+unk+'개는 빼고 보여 줘요.</p>';
  return h}
function quest(c){const L=c.lv;if(ui.qmode==='route')ui.qmode='rec';const qm=ui.qmode||'rec';const q0=(ui.qsrch||'').trim();
  let h='<div class="wrap"><div class="qsearch"><span>'+qico('quest')+'</span><input class="inp" placeholder="퀘스트·장비·던전·NPC·지역 이름으로 찾기" value="'+esc(ui.qsrch||'')+'" data-c="qsrch">'+(q0?'<button class="x2" data-a="qsclr">✕</button>':'')+'</div>';
  h+='<div id="qsres">'+(q0?qSearchHtml(c,q0):'')+'</div><div id="qbody"'+(q0?' hidden':'')+'>';
  h+='<div class="chips seg">'+[['rec','레벨업','img/qget.png'],['log','퀘스트창'+(c.ql&&Object.keys(c.ql).length?' '+Object.keys(c.ql).length:''),'img/qturn.png'],['atlas','지도','inv_misc_map_01'],['map','지역 목록','inv_misc_map02']].map(m=>'<button class="chip'+(qm===m[0]?' on':'')+'" data-a="qmode" data-k="'+m[0]+'">'+gic(m[2])+m[1]+'</button>').join('')+'</div>';
  const end='</div></div>';
  if(qm==='rec')return h+recView(c)+routeView(c,1)+end;
  if(qm==='log')return h+logView(c)+end;
  if(qm==='map')return h+mapView(c)+end;
  if(qm==='atlas')return h+((c.mapStyle||'atlas')==='game'?gameView(c):amView(c))+end;
  ui.qmode='map';return h+mapView(c)+end}
/* 펼치는 퀘스트 한 줄: 접혀 있을 땐 [레벨] 이름만, 누르면 할 일·위치·연계·보상 */
function qFold(o){const open=ui.qopen===o.key;
  return '<details class="qf'+(o.lite?' lite':'')+(o.done?' done':'')+(o.lock?' lock':'')+'"'+(open?' open':'')+' data-k="'+esc(o.key)+'"><summary><span class="qi'+(o.qd?' qck':'')+'"'+(o.qd?' data-qd="'+o.qd+'" title="눌러서 끝냄 표시"':'')+'>'+(o.done?'✓':QMK.g)+'</span><span class="qn">'+(o.lite?'<span class="t1">'+esc(o.nm)+'</span>'+(o.sub?'<span class="t2">'+esc(o.sub)+'</span>':''):'['+o.lv+'] '+esc(o.nm))+'</span>'+(o.lite?'<span class="qlv '+lvCls(o.lv,(me()||{}).lv||1)+'">'+o.lv+'</span>':'')
   +(o.side?'<span class="qs">'+o.side+'</span>':'')+'<span class="chev">⌄</span></summary>'+o.body+'</details>'}
function dqCard(c,d,open){const done=dqOf(c,d).filter(q=>dqIsDone(c,q)).length;
  return '<details class="card"'+(open?' open':'')+'><summary style="cursor:pointer;list-style:none"><div class="hd"><h3 style="margin:0">'+esc(d.ko)+'</h3><span class="mute" style="font-size:12px">'+done+'/'+dqOf(c,d).length+' · 권장 '+d.lo+'–'+d.hi+'</span></div></summary>'+dqList(c,d)+'<button class="more" data-a="dgo" data-k="'+d.slug+'">던전 보스·드랍 보기 ›</button></details>'}
/* 던전 퀘스트를 받으려면 먼저 해야 하는 연계 */
function preChain(id){const ch=chainOf(id);if(ch){const i=ch.findIndex(r=>r[6]===id);if(i>0)return ch.slice(0,i).map(r=>r[6]).filter(i=>QDB&&QDB.get(i))}const out=[];let x=id,k=0;while(QPAR[x]!=null&&k++<30){x=QPAR[x];out.unshift(x)}
  if(!out.length){const X=QDB&&QDB.get(id);const p=X&&((X.pre&&X.pre.length===1&&X.pre[0])||(X.pre1&&X.pre1.length===1&&X.pre1[0]));if(p){out.push(p);let y=p,j=0;while(QPAR[y]!=null&&j++<30){y=QPAR[y];out.unshift(y)}}}
  return out.filter(i=>QDB&&QDB.get(i))}
function preChainBox(c,id){const P=preChain(id);if(!P.length)return '';const left=P.filter(i=>!mqDone(c,QDB.get(i)));
  return '<div class="pchainbox'+(left.length?'':' ok')+'"><b>'+(left.length?'⚠️ 앞 연계 '+P.length+'개를 먼저 끝내야 받을 수 있어요':'✓ 앞 연계 다 끝냈어요')+'</b>'
   +P.map((i,n)=>{const x=QDB.get(i);const dn=mqDone(c,x);return '<button class="pcb'+(dn?' done':'')+'" data-a="qopen" data-k="'+i+'"><span class="n">'+(dn?'✓':n+1)+'</span><span class="t"><b>['+(x.lv||'?')+'] '+esc(x.n)+'</b><span>'+esc(x.z||'')+(x.g&&x.g[0]?' · '+esc(x.g[0]):'')+'</span></span><span class="cv">›</span></button>'}).join('')+'</div>'}
function dqList(c,d,flat){const L=c.lv;const dq=c.dq||{};
  const outQ=dqOf(c,d).filter(q=>!/던전 안/.test(q.start)&&q.start),inQ=dqOf(c,d).filter(q=>/던전 안/.test(q.start)||!q.start);
  const row=q=>{const dn=dqIsDone(c,q);const QX=QDB&&QDB.get(+q.id);const m2=QX&&!QX.mEst?QX.m||0:0;const mEff=Math.max(q.min||0,m2);const mDif=m2&&q.min&&m2!==q.min;const lock=mEff>L;const pf=dn?null:preFirst(c,+q.id);const lg=dn?0:((c.ql||{})[q.id]||0);const rw=q.rw.map(id=>IT.get(id)).filter(Boolean);
    const pc=preChain(q.id),pcl=pc.filter(i=>!mqDone(c,QDB.get(i))).length;
    const tags=(pf?'<span class="tag pre">먼저 「'+esc(pf.n)+'」</span>':'')+chainTag(q.id,q)+(lock?'<span class="tag">'+mEff+'레벨부터'+(mDif?' (자료마다 '+Math.min(q.min,m2)+'·'+Math.max(q.min,m2)+')':'')+'</span>':'');
    const inside=/던전 안/.test(q.start||'')||/아이템/.test(q.start||'')||!q.start;
    const extra=(q.boss.length?'<p class="npc">🎯 던전 안 목표: <b>'+q.boss.map(b=>esc(b.replace(/^(\d+) /,'$1번 '))).join(', ')+'</b></p>':'')+((QD.get(q.id)||{}).g&&(QD.get(q.id)||{}).g[0]&&!inside?'':'<p class="npc">'+esc((()=>{let t=startTxt(q.start);const o=QD.get(q.id);if(o&&o.g&&latin(o.g[0])){const k=npcKo(o,'g');if(k&&!latin(k))t=t.split(o.g[0]).join(k)}return t})())+'</p>');
    const rwHtml=rw.length?'<div class="rgrid">'+rw.map(it=>'<button class="rt2" data-a="info" data-k="'+it.id+'">'+itIcon(it)+'<span class="rn q'+it.q+'">'+esc(it.nm)+'</span></button>').join('')+'</div>':'';
    const body=(chainOf(q.id)||((QD.get(q.id)||{}).ch||[]).length>1?'':preChainBox(c,q.id))+parch(c,q.id,{nm:q.nm,obj:q.obj,place:inside?'던전 안에서 시작':'던전 외부 시작',tags,extra,rwHtml,done:dn,kind:'dq',ck:String(q.id),pre:q.pre});
    return qFold({key:'d'+q.id,done:dn,lock,lv:q.lv,nm:q.nm,body,side:(rw.some(it=>usable(it,c)&&((bestSlot(it,c)||{}).g||0)>.01)?'<span class="qstar" title="나한테 좋은 장비 보상">⭐</span>':'')+(lg?'<span class="dqlg'+(lg===2?' rdy':'')+'">'+(lg===2?'🔔 반납 가능':'🎒 받음')+'</span>':'')+(dn&&(c.mq||{})[q.id]&&!(c.dq||{})[q.id]?'<span class="dqlg gm">🎮 게임에서 끝냄</span>':'')+(pc.length&&!dn&&!lg?'<span class="pcw'+(pcl?'':' ok')+'">'+(pcl?'⚠️ 앞 연계 '+pcl+'개':'✓ 연계 끝')+'</span>':'')+(q.cls?esc((CINFO[c.cls]||[''])[0])+' 직업':'')})};/* 앱은 얼라이언스 전용이라 「얼라이언스」 표시는 뺌 */
  if(flat)return dqOf(c,d).map(row).join('');
  return (outQ.length?'<h3>던전 가기 전에 받기</h3>'+outQ.map(row).join(''):'')+(inQ.length?'<h3>던전 안에서 시작</h3>'+inQ.map(row).join(''):'')}
function startTxt(s){if(!s)return '아이템을 주워서 시작';if(/^시작 · 던전 안/.test(s))return '던전 안에서 받아요';const m=s.match(/^시작 (.+) · 던전 안$/);if(m)return '던전 안 '+m[1]+'에게 받아요';if(/^시작 · /.test(s))return s.replace(/^시작 · /,'')+'에서 시작';return '받는 곳: '+s}

/* ===================== 던전 ===================== */
function dgItems(c,d){return ITEMS.filter(it=>it.src.some(i=>SRC[i]&&SRC[i].k===0&&SRC[i].dg===d.slug))}
/* 🎯 이 던전에서 노릴 템: 내 착용 장비보다 좋은 것 + 찜한 것, 점수순 5개 */
function dgTargets(c,d,dt){if(dt==='quest')return '';
  const U=dgUps(c,d).sort((a,b)=>b.b.g-a.b.g);const W=dgItems(c,d).filter(it=>isWish(c,it.id)&&!U.some(x=>x.it.id===it.id)).map(it=>({it,b:usable(it,c)?bestSlot(it,c):null}));
  const L=W.concat(U).slice(0,5);if(!L.length)return '';
  return '<div class="card dgt2"><button class="hd" data-a="dtab" data-k="loot"><span class="ic" style="background-image:url('+ICO('ability_hunter_snipershot')+')"></span><b>여기서 노릴 템</b><small>내 장비보다 좋은 순 '+U.length+'개 ›</small></button><div class="ltg">'
   +L.map(x=>'<button class="lt" data-a="'+(x.b?'cmpq':'info')+'" data-k="'+(x.b?x.b.s+':'+x.it.id:x.it.id)+'">'+itIcon(x.it)+(x.b&&x.b.g>.01?'<em class="g">+'+Math.round(x.b.g)+'</em>':isWish(c,x.it.id)?'<em class="g w">⭐</em>':'')+'<span class="q'+x.it.q+'">'+esc(x.it.nm)+'</span></button>').join('')+'</div></div>'}
/* 🏁 던전 끝나고 정리: 끝낸 퀘스트·얻은 템·다음 던전 */
function dgEndItems(c,d){const its=dgItems(c,d).concat(dqOf(c,d).flatMap(q=>q.rw.map(i=>IT.get(i)).filter(Boolean)));const seen=new Set();
  return its.filter(it=>{if(seen.has(it.id))return false;seen.add(it.id);return usable(it,c)}).map(it=>({it,b:bestSlot(it,c)})).filter(x=>x.b&&x.b.g>.01).sort((a,b)=>b.b.g-a.b.g)}
function dgEndSheet(c,slug){const d=DG[slug];if(!d||!ui.de)return '';const L=c.lv;let h='<div class="sh"><h2>🏁 '+esc(d.ko)+' 정리</h2><button class="x" data-a="close">✕</button></div>';
  const R=ui.de.res;
  if(R){h+='<div class="der"><p>🎉 수고했어요!'+(R.dur?' <b>'+R.dur+'분</b>':'')+' · 보스 <b>'+R.nk+'</b> · 퀘스트 <b>'+R.nq+'개</b> 끝냄'+(R.eqd.length?' · 착용 <b>'+R.eqd.length+'개</b>':'')+'</p>'+(R.eqd.length?'<p class="mute">'+R.eqd.map(esc).join(' · ')+'</p>':'')+'</div>';
    const nx=dgNow(L).filter(x=>x.slug!==slug).map(x=>{const S=dgState(c,x);return {x,S,g:S.ups.length,q:S.left.length}}).filter(o=>!o.S.all||o.g).sort((a,b)=>(b.g*2+b.q)-(a.g*2+a.q)).slice(0,3);
    h+='<h3>다음 던전 추천</h3>'+(nx.length?nx.map(({x,g,q})=>'<button class="srow" data-a="dgo" data-k="'+x.slug+'"><span class="qlv '+lvCls(x.fit||x.lo,L)+'">'+x.lo+'</span><span class="t"><b>🏰 '+esc(x.ko)+'</b><span>'+x.lo+'–'+x.hi+'레벨'+(g?' · ⭐ 좋은 템 '+g:'')+(q?' · 퀘스트 '+q:'')+'</span></span></button>').join(''):'<p class="note">지금 레벨에 더 갈 던전이 없어요. 퀘스트로 레벨을 올려요.</p>');
    return h+'<button class="btn ghost full" data-a="close">닫기</button>'}
  const kl=killOf(c,slug);const nk=Object.keys(kl).filter(x=>x!=='_s').length;const dur=kl._s?Math.round((Date.now()-kl._s)/60000):0;
  h+='<p class="note">'+(dur?'⏱️ '+dur+'분 · ':'')+'보스 '+nk+'마리 잡음. 끝낸 퀘스트와 얻은 템을 고르고 「정리하기」를 눌러요.</p>';
  const S=dgState(c,d);
  if(S.left.length)h+='<h3>끝낸 던전 퀘스트</h3><div class="dechk">'+S.left.map(q=>'<button class="'+(ui.de.q.has(q.id)?'on':'')+'" data-a="deq" data-k="'+q.id+'"><i>'+(ui.de.q.has(q.id)?'✓':'')+'</i><span>'+esc(q.nm)+((c.ql||{})[q.id]?' <small>퀘스트창에 있음</small>':'')+'</span></button>').join('')+'</div>';
  const U=dgEndItems(c,d).slice(0,12);
  if(U.length)h+='<h3>얻은 템 <small class="mute">고르면 바로 껴요 (칸마다 하나)</small></h3><div class="dechk">'+U.map(({it,b})=>'<button class="'+(ui.de.i.has(it.id)?'on':'')+'" data-a="dei" data-k="'+it.id+'"><i>'+(ui.de.i.has(it.id)?'✓':'')+'</i>'+itIcon(it)+'<span><b class="q'+it.q+'">'+esc(it.nm)+'</b> <small>'+esc(SL_KO[it.sl]||'')+' · +'+Math.round(b.g)+'</small></span></button>').join('')+'</div>';
  return h+'<button class="btn full" data-a="deok" data-k="'+slug+'">정리하기</button><button class="btn ghost full" style="margin-top:6px" data-a="rkclr">체크만 지우기</button>'}
function dgUps(c,d){const L=c.lv;return dgItems(c,d).filter(it=>usable(it,c)&&it.lv<=Math.max(L,d.hi)).map(it=>({it,b:bestSlot(it,c)})).filter(x=>x.b&&x.b.g>.01)}
const DG_NOFORG={'alcaz-prison':16620,'blackmaw-hold':16554,'shapers-terrace':16667};/* forg 로딩 그림이 없는 신규 던전(404 확인) → wythic 그림 */
const DG_IMG=slug=>(typeof DG!=='undefined'&&DG[slug]&&(DG[slug].wy||DG_NOFORG[slug])?'https://wythic.com/dungeons/'+(DG[slug].wy||DG_NOFORG[slug])+'.jpg?v=2':'https://forg.gg/images/wow-forever/dungeons/'+slug+'-loading.webp')/* 신규 던전은 forg 그림이 없어 wythic.com 그림 */;
function dgChips(c,cur){const L=c.lv;
  const near=DGS.filter(d=>L>=d.lo-1&&L<=d.hi).sort((a,b)=>b.fit-a.fit),up=DGS.filter(d=>d.lo-1>L).sort((a,b)=>a.fit-b.fit),past=DGS.filter(d=>d.hi<L).sort((a,b)=>b.fit-a.fit);
  const grp=(t,arr)=>arr.length?'<span class="dgl">'+t+'</span>'+arr.map(chip).join(''):'';
  const chip=d=>{const inr=L>=d.lo-1&&L<=d.hi;return '<button class="dchip'+(d.slug===cur?' on':'')+(inr?' near':'')+'" data-a="dgo" data-k="'+d.slug+'"><img src="'+DG_IMG(d.slug)+'" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),{className:\'dno\',textContent:\'🏰\'}))"><span class="t"><b>'+esc(d.ko)+'</b><small>'+d.lo+'–'+d.hi+(d.soon?' · 🚧 개방 예정':inr?' · 지금':'')+(()=>{const S=dgState(c,d);return S.all?' · ✅ 퀘스트 다 함':S.inLog.length?' · 📜 '+S.inLog.length:''})()+'</small></span></button>'};
  return '<div class="dcw"><button class="dcb l" data-a="dcs" data-k="-1" aria-label="왼쪽">‹</button><div class="dchips">'+grp('지금 레벨',near)+grp('다음 던전',up)+grp('지나간 던전',past)+'</div><button class="dcb r" data-a="dcs" data-k="1" aria-label="오른쪽">›</button></div>'}
function dungeon(c){const L=c.lv;
  if(!ui.dg||!DG[ui.dg]){const n=dgNow(L).sort((a,b)=>b.fit-a.fit);ui.dg=(n[0]||DGS.slice().sort((a,b)=>Math.abs(a.fit-L)-Math.abs(b.fit-L))[0]).slug}
  return dgChips(c,ui.dg)+dgDetail(c,DG[ui.dg])}
/* 보스 모습 (wythic.com → 와우헤드 모델 썸네일) */
const BIMG={};{const nz=x=>String(x||'').replace(/[\s:·,'"!.\-]/g,'').replace(/의/g,'');D_BOSS.split('\n').filter(Boolean).forEach(l=>{const [dn,bn,u]=l.split('|');(BIMG[nz(dn)]=BIMG[nz(dn)]||[]).push({n:nz(bn),u})});
  window.bossImg=(d,boss,i)=>{const L=BIMG[nz(d.ko)]||BIMG[nz(d.ko.split(':')[0])]||[];const f=L.find(x=>x.n&&(x.n===nz(boss)||x.n.includes(nz(boss))||nz(boss).includes(x.n)));return f?f.u:(L.length===d.bosses.length&&!d.ko.includes(':')&&L[i]?L[i].u:'')}}
function statTop(it,c,n){const w=wOf(c);return Object.keys(it.st).filter(k=>STAT_KO[k]&&k!=='armor'&&!SHDUP(k,it.st)).sort((a,b)=>(w[b]||0)*it.st[b]-(w[a]||0)*it.st[a]).slice(0,n||3).map(k=>STAT_KO[k].replace('무기 초당 공격력','DPS')+' '+(k==='dps'?it.st[k].toFixed(1):'+'+Math.round(it.st[k]))).join(' · ')}
function dropLine(c,it){const use=usable(it,c);const b=use?bestSlot(it,c):null;
  const g=b&&b.g>.01?'<span class="gp'+(b.g>=20?' hi':'')+'">+'+Math.round(b.g)+'</span>':use?'':'<span class="gp no">못 씀</span>';
  return '<div class="dl"><button class="dlb" data-a="info" data-k="'+it.id+'">'+itIcon(it)+'<span class="m"><span class="nm">'+wishMark(c,it.id)+itName(it)+'</span><span class="sub">'+esc((SL_KO[it.sl]||'')+(CS_KO[it.cs]&&!['4.0',''].includes(it.cs)?' '+CS_KO[it.cs]:''))+(!(b&&b.g>.01)&&statTop(it,c)?' · '+esc(statTop(it,c)):'')+'</span>'+(b&&b.g>.01?diffHtml(it,eqIt(c,b.s),c):'')+'</span>'+g+'</button>'+(b&&b.g>.01?'<button class="btn sm eqb" data-a="equip" data-k="'+b.s+'" data-id="'+it.id+'">끼기</button>':'')+'</div>'}
/* ===== 던전 동선·공략 (wowf.io 진행 순서 + forg.gg 보스 기술) ===== */
/* wythic.com 던전 자료: 보스별 우두머리 기술·공략 한 줄, 일반 몹 드랍 (매주 받아 옴) */
const WYID={'deadmines':1581,'hall-of-thanes':16919,'ragefire-chasm':2437,'ruins-of-lordaeron':16611,'wailing-caverns':718,'shadowfang-keep':209,'stockade':717,'blackfathom-deeps':719,'whelgar-excavation':16732,'drowned-city':16550,'kroldok-stronghold':16842,'alcaz-prison':16620,'blackmaw-hold':16554,'shapers-terrace':16667,'gnomeregan':721,'sm-graveyard':90018,'sm-armory':90163,'sm-cathedral':90164,'sm-library':90165,'city-of-dalaran':16544,'razorfen-kraul':491,'razorfen-downs':722,'uldaman':1337,'maraudon':2100,'dire-maul-east':90034,'dire-maul-west':90036,'dire-maul-north':90038,'zul-farrak':1176,'stratholme-live':90040,'stratholme-dead':90274,'temple-of-atal-hakkar':1417,'blackrock-depths':1584,'scholomance':2057,'lower-blackrock-spire':90032,'upper-blackrock-spire':90044};
let WY=null,WY_LOAD=false;
function wyLoad(){if(WY_LOAD||!D_VER.wy||D_VER.wy==='0')return;WY_LOAD=true;fetch('data/wythic/dungeons.json?v='+D_VER.wy).then(r=>r.ok?r.json():null).then(j=>{WY={};((j&&j.dungeons)||[]).forEach(x=>WY[x.id]=x);if(ui.tab==='dungeon')rerender(true)}).catch(()=>{WY={}})}
const wnz=x=>String(x||'').replace(/[\s:·,'"!.\-]/g,'').replace(/의/g,'');
function wyOf(d){return WY&&d?WY[WYID[d.slug]||d.wy]:null}
/* 보스 기술 (data/guides/abilities.txt) */
const AB={};{let cu=null,bo=null;(typeof D_AB==='string'?D_AB:'').split('\n').forEach(l=>{if(l[0]==='@'){cu=AB[l.slice(1)]={};return}if(l[0]==='#'){bo=cu[l.slice(1)]=[];return}const f=l.split('|');if(f.length<5||!bo)return;const [t,k]=f[0].split(':');bo.push({t,k:k||'',n:f[1],e:f[2],w:f[3].split(','),x:f[4]})})}
const ABK={dz:'위험',int:'끊기',dis:'해제',av:'피하기',add:'쫄',tk:'탱커',hl:'치유',info:'참고'};
const ABDK={magic:'마법',curse:'저주',poison:'독',disease:'질병',purge:'정화'};
const DISP={magic:['priest','paladin'],curse:['mage','druid'],poison:['druid','paladin','shaman'],disease:['priest','paladin','shaman'],purge:['shaman','priest']};
/* 기술 아이콘: 영어 이름으로 찾고, 없으면 종류별 기본 아이콘 */
const ABICO=[[/cleave|frontal|arcing smash|sweeping/i,'ability_warrior_cleave'],[/fire nova|flame vents|fiery burst|avatar of flame/i,'spell_fire_sealoffire'],[/flamestrike|fire storm|flame spike|combust/i,'spell_fire_immolation'],[/fireball|immolate|flame shock|flame breath|dragon gun/i,'spell_fire_fireball02'],
 [/polymorph|manamorph/i,'spell_nature_polymorph'],[/bloodlust/i,'spell_nature_bloodlust'],[/beast|hound|worg|chomper|ferra|verek|boar/i,'ability_hunter_beastcall'],[/shadow word: pain/i,'spell_shadow_shadowwordpain'],[/curse of weakness|enfeeble/i,'spell_shadow_curseofmannoroth'],[/curse of tongues/i,'spell_shadow_curseoftounges'],[/curse/i,'spell_shadow_curseofsargeras'],
 [/poison|saliva|toxic|venom|mother's milk|acid splash/i,'spell_nature_corrosivebreath'],[/psychic scream|fear|terrify|intimidating|roar/i,'spell_shadow_psychicscream'],[/sleep|slumber/i,'spell_nature_sleep'],[/healing touch|healing wave|holy light|heal|cooking|regeneration|healing ward/i,'spell_nature_healingtouch'],
 [/chain|bolt\b.*chain|megavolt|forked/i,'spell_nature_chainlightning'],[/lightning|thundershock/i,'spell_nature_lightning'],[/frost nova|freeze|chill/i,'spell_frost_frostnova'],[/frostbolt|frost armor|ice tomb|icicle/i,'spell_frost_frostbolt02'],[/amnennar|wrath/i,'spell_frost_frostshock'],
 [/drain life|soul drain|drain vitality|butcher drain|leech/i,'spell_shadow_lifedrain02'],[/shadow bolt|void bolt|mind blast/i,'spell_shadow_shadowbolt'],[/dominate|domination|insanity|possess|hex|arugal's curse/i,'spell_shadow_charm'],[/root|entangle|vines|net\b/i,'spell_nature_stranglevines'],
 [/whirlwind|barrage/i,'ability_whirlwind'],[/charge/i,'ability_warrior_charge'],[/thunderclap|thundercrack/i,'ability_thunderclap'],[/stomp|trample|tremor|slam|knockout/i,'ability_warstomp'],[/knock|uppercut|repulsive/i,'ability_kick'],
 [/divine shield|divine|purity|immun/i,'spell_holy_divineintervention'],[/hammer of justice/i,'spell_holy_sealofmight'],[/shield/i,'spell_holy_powerwordshield'],[/arcane explosion|bounding mana|focal|arcane bolt|arcane blast|counterspell|mass polymorph|detonation|bubble/i,'spell_nature_wispsplode'],
 [/raise dead|skeleton|zombie|spawn|summon|spectre|elemental|guardian|shard|totem|reinforcement|adds?\b|waves?|minion|seven|cronies|horde|golem|broodling|spider|murloc|naga|trainee|warder|illusion/i,'spell_shadow_raisedead'],[/unholy frenzy|frenzy|enrage|rage|howling/i,'ability_druid_challangingroar'],
 [/disarm/i,'ability_warrior_disarm'],[/rend|bite|claw|puncture/i,'ability_gouge'],[/plague|disease/i,'spell_shadow_creepingplague'],[/anti-magic/i,'spell_shadow_antimagicshell'],[/mana burn|debilitate|silence|sand storm|sonic/i,'spell_shadow_manaburn'],[/smoke bomb|bomb/i,'inv_misc_bomb_02'],
 [/teleport|shadow port|portal/i,'spell_shadow_teleport'],[/thorns/i,'spell_nature_thorns'],[/dust|storm/i,'spell_nature_cyclone'],[/acid breath|breath/i,'spell_nature_acid_01'],[/strike|thrash|hits|smash|sunder|mortal/i,'ability_warrior_savageblow'],[/fel timbers|cloud|vent/i,'spell_shadow_corpseexplode'],[/sacrifice/i,'spell_shadow_sacrificialshield'],[/sinister/i,'spell_shadow_ritualofsacrifice'],[/underwater/i,'spell_shadow_demonbreath'],[/shoot|multi-shot|volley|throw/i,'ability_marksmanship']];
const ABDEF={dz:'spell_fire_selfdestruct',int:'ability_kick',av:'ability_rogue_sprint',add:'spell_shadow_raisedead',tk:'ability_warrior_defensivestance',hl:'spell_holy_flashheal',info:'inv_misc_questionmark',magic:'spell_holy_dispelmagic',curse:'spell_nature_removecurse',poison:'spell_nature_nullifypoison',disease:'spell_nature_nullifydisease',purge:'spell_nature_purge'};
function abIco(a){const f=ABICO.find(x=>x[0].test(a.e));return f?f[1]:(a.t==='dis'?ABDEF[a.k]:ABDEF[a.t])||'inv_misc_questionmark'}
const abIc=(a,cl)=>'<span class="ic'+(cl?' '+cl:'')+'" style="background-image:url('+ICO(abIco(a))+')"></span>';
function abOf(d,st){const A=AB[d.slug];if(!A)return null;return A[st.en]||A[st.nm]||null}
/* 직업별로 할 수 있는 것 (클래식 기준 기술 이름) */
const CAN={magic:[['priest','마법 무효화'],['paladin','정화']],curse:[['mage','하급 저주 해제'],['druid','저주 해제']],poison:[['druid','해독'],['paladin','정화'],['shaman','해독']],disease:[['priest','질병 치료'],['paladin','정화'],['shaman','질병 치료']],
 purge:[['shaman','정화'],['priest','마법 무효화']],tranq:[['hunter','평정의 사격']],int:[['warrior','자루 공격'],['rogue','발차기'],['shaman','대지 충격'],['mage','마법 차단'],['paladin','심판의 망치'],['druid','강타(곰)'],['warlock','마법 잠금(지옥사냥개)']],
 fear:[['shaman','진동의 토템'],['warrior','광전사의 격노'],['priest','공포의 수호물']],root:[['paladin','자유의 축복'],['druid','변신으로 풀기']]};
function abKinds(a){const K=[];if(a.t==='dis'&&a.k)K.push(a.k);if(a.t==='int')K.push('int');if(/frenzy|enrage|rage\b/i.test(a.e)&&a.t==='dis')K.push('tranq');if(/fear|scream|terrify|intimidating|roar|psychic/i.test(a.e))K.push('fear');if(/root|entangle|vines|\bnet\b/i.test(a.e))K.push('root');return K}
function abCan(a){const m=new Map();abKinds(a).forEach(k=>(CAN[k]||[]).forEach(([cl,sp])=>{if(!m.has(cl))m.set(cl,sp)}));return m}
function abMine(a,c,me){const can=abCan(a);if(a.t==='dis')return can.has(c.cls);return a.w.includes(me)||(can.has(c.cls)&&a.t==='int'&&me!=='hl')||(can.has(c.cls)&&abKinds(a).some(k=>k==='fear'||k==='root'))}
function abClsLine(a,c){const can=abCan(a);if(!can.size)return '';const my=can.get(c.cls);
  return '<span class="acl">'+[...can.keys()].map(cl=>'<span class="ic'+(cl===c.cls?' on':'')+'" title="'+CINFO[cl][0]+' · '+esc(can.get(cl))+'" style="background-image:url('+ICO('classicon_'+cl)+')"></span>').join('')+(my?'<em>내 기술: <b>'+esc(my)+'</b></em>':'<em class="no">'+[...can.keys()].map(cl=>CINFO[cl][0]).join('·')+'만 가능</em>')+'</span>'}

function abChips(L){const o=['dz','int','dis','av','add'];const ts=[...new Set(L.map(a=>a.t))].filter(t=>o.includes(t)).sort((a,b)=>o.indexOf(a)-o.indexOf(b)).slice(0,2);return ts.map(t=>'<i class="abk k-'+t+' wi">'+abIc(L.find(a=>a.t===t))+ABK[t]+'</i>').join('')}
function abList(L,c,me){const ord={dz:0,int:2,dis:2,av:3,add:4,tk:5,hl:6,info:7};
  const dz=L.filter(a=>a.t==='dz'),rest=L.filter(a=>a.t!=='dz').map(a=>({a,m:abMine(a,c,me)})).sort((x,y)=>(y.m-x.m)||(ord[x.a.t]-ord[y.a.t]));
  const sp=x=>{const i=x.indexOf('→');return i<0?[x,'']:[x.slice(0,i).trim(),x.slice(i+1).trim()]};
  let h='<div class="abl">';
  h+=dz.map(a=>{const [w,dd]=sp(a.x);return '<div class="abdz">'+abIc(a)+'<div><b>⚠ '+esc(a.n)+'</b><p>'+esc(w)+(dd?'<br><strong>→ '+esc(dd)+'</strong>':'')+'</p>'+abClsLine(a,c)+'</div></div>'}).join('');
  h+=rest.map(({a,m})=>{const [w,dd]=sp(a.x);return '<div class="abr k-'+a.t+(m?' mine':'')+'">'+abIc(a)+'<span class="m"><b>'+esc(a.n)+(m?'<em class="mi">'+ricon(me,'sm')+'내 일</em>':'')+'</b><small>'+esc(w)+(dd?' → <span class="do">'+esc(dd)+'</span>':'')+'</small>'+abClsLine(a,c)+'</span><i class="abk k-'+a.t+'">'+(a.t==='dis'&&a.k?ABDK[a.k]+' 해제':ABK[a.t])+'</i></div>'}).join('');
  return h+'</div>'}
function wyBoss(d,nm){const W=wyOf(d);if(!W)return null;const n=wnz(nm);if(!n)return null;const all=(W.bosses||[]).concat(W.extra||[]);
  return all.find(b=>wnz(b.npc)===n)||all.find(b=>{const m=wnz(b.npc);return m.length>1&&(m.includes(n)||n.includes(m))})||null}
const NOTHUMB=new Set([10997]);/* 와우헤드에 썸네일이 없는 NPC(404 확인) */
const npcThumb=id=>id&&id<200000&&!NOTHUMB.has(id)?'https://wow.zamimg.com/modelviewer/classic/webthumbs/npc/'+(id&255)+'/'+id+'.webp':'';
let DGG=null,DGG_LOAD=false;
function dggLoad(){wyLoad();if(DGG_LOAD)return;DGG_LOAD=true;fetch('data/forg/dungeon-guide.json?v='+D_VER.dgg).then(r=>r.ok?r.json():{}).then(j=>{DGG=j||{};if(ui.tab==='dungeon')rerender(true)}).catch(()=>{DGG={};})}
const TAGKO={interrupt:'끊기','dispel-magic':'마법 해제','dispel-curse':'저주 해제','dispel-poison':'독 해제','dispel-disease':'질병 치료','no-dispel':'해제 안 됨',avoid:'피하기',spread:'흩어지기',away:'떨어져 서기',wall:'벽 등지기',front:'정면 공격'};
/* 역할 아이콘: 게임 파티 찾기 둥근 배지처럼 (탱커 파랑 방패 · 딜러 빨강 칼 · 힐러 초록 십자) */
const RIP={tk:'M12 2.5 19.5 5.2V11c0 5-3.2 8.6-7.5 10.3C7.7 19.6 4.5 16 4.5 11V5.2Z',dp:'M18.6 3H21v2.4L11.2 15.2 8.8 12.8ZM5.4 12.6l6 6-1.3 1.3-1.6-1.6-3 3-1.8-1.8 3-3-1.6-1.6Z',hl:'M9.6 3.5h4.8v6.1h6.1v4.8h-6.1v6.1H9.6v-6.1H3.5V9.6h6.1Z',al:'M12 4.5c4.6 0 8 4.4 9 7.5-1 3.1-4.4 7.5-9 7.5S4 15.1 3 12c1-3.1 4.4-7.5 9-7.5Zm0 3.6a3.9 3.9 0 1 0 0 7.8 3.9 3.9 0 0 0 0-7.8Z'};
const RNM={tk:'탱커',dp:'딜러',hl:'힐러',al:'모두'};
const QMK={g:'<img class="qmk" src="img/qget.png" alt="받기">',r:'<img class="qmk" src="img/qturn.png" alt="반납">'};
const ricon=(r,cl)=>r==='al'?'<img class="ri rimg'+(cl?' '+cl:'')+'" src="img/eye.png" alt="모두" title="모두">':'<img class="ri rimg'+(cl?' '+cl:'')+'" src="img/role-'+r+'.png" alt="'+RNM[r]+'" title="'+RNM[r]+'">';
function myRole(c){if(c&&c.drole)return c.drole;const r=ROLE[(c&&c.cls)+'/'+(c&&c.spec)]||'';return r==='치유'?'hl':r==='탱커'?'tk':'dp'}
function roleSplit(texts,sp){/* 공략 문장을 역할별로: tk 탱커 · dp 딜러 · hl 힐러 · al 모두 · loc 위치 */
  const R={tk:[],dp:[],hl:[],al:[],loc:[],how:[]};const S=[];
  const HOW=/(?:쓰|사용하|걸|누르|가져가|넣|켜|부르|올리|가져오|모으|부수|열|건드리|잡으|처치하)면[^.]*?(?:나옵|나와|나타|등장|순간이동|열립|열려|불러|깨어|내려|올라)|만나려면|불러내야|소환해야|있어야 (?:나|등장|만날)|해야 (?:나|등장|만날)|이벤트|숨은 (?:우두머리|보스)|희귀 우두머리|가끔 나(?:타|오)|만드는 법|준비 칸/;
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
  for(const t of S){if(HOW.test(t)&&!/^(?:잡으면|잡은 뒤|처치하면)/.test(t)){R.how.push(t);continue}let hit=0;const add=k=>{if(!R[k].includes(t))R[k].push(t);hit=1};
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
  for(const r of ['tk','dp','hl','al','how']){R[r]=R[r].map((t,i)=>({t:t.replace(/\s*\((?=[A-Za-z]|\d+% [A-Za-z])[^)]*\)/g,''),i})).sort((a,b)=>act(a.t)-act(b.t)||a.i-b.i).map(x=>x.t)}
  return R}
const RNONE={tk:'공략에 따로 적힌 건 없어요. 보스를 잡고 파티 반대쪽으로 돌려 세우면 돼요.',dp:'공략에 따로 적힌 건 없어요. 탱커가 자리 잡은 뒤 보스에 집중하세요.',hl:'공략에 해제할 것이 따로 없어요. 탱커 체력 위주로 치유하세요.'};
/* 보스 펼침 내용: 기술 → 역할별 할 일(내 역할 강조) → 모두 알아 둘 것 → (안 보인 말만) 더 자세히 */
function bossBody(R,me,AB,c,WB){const shown=[];let h='';
  const nz=x=>String(x||'').replace(/\([^)]*\)/g,'').replace(/[^가-힣a-zA-Z0-9]/g,'');
  const bg=x=>{const b=new Set();for(let i=0;i<x.length-1;i++)b.add(x.slice(i,i+2));return b};
  const seen=t=>{const L=bg(nz(t));if(!L.size)return true;const P=bg(nz(shown.join(' ')));let n=0;L.forEach(x=>{if(P.has(x))n++});return n/L.size>.72};
  if(R.how&&R.how.length){h+='<div class="rb-how"><b>🔑 만나는 법</b><ul>'+R.how.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul></div>';shown.push(...R.how)}
  if(WB&&WB.tip&&WB.full){h+='<div class="rb-wy"><b>⚔️ 실제로 잡은 기록</b><p>'+esc(WB.tip)+'</p><small>wythic.com</small></div>';shown.push(WB.tip)}
  if(AB.length){h+=abList(AB,c,me);AB.forEach(a=>shown.push(a.n+' '+a.x))}
  else if(WB&&WB.tip&&!WB.full){h+='<div class="rb-wy"><b>⚔️ 우두머리 기술 · 공략</b><p>'+esc(WB.tip)+'</p><small>wythic.com</small></div>';shown.push(WB.tip)}
  const doOf=a=>{const i=a.x.indexOf('→');return (i<0?a.x:a.x.slice(i+1)).trim()};
  const fromAB=r=>AB.filter(a=>(a.t==='dis'?(r===me?abCan(a).has(c.cls):r==='hl'):r===me?abMine(a,c,me):a.w.includes(r))).map(a=>{const sp=r===me&&abCan(a).get(c.cls);return '<b>'+esc(a.n)+'</b> '+(sp?'→ <u>'+esc(sp)+'</u>':esc(doOf(a)))});
  const NONE={tk:'보스를 일행 반대로 돌리고 어그로 유지',dp:'쫄 먼저, 보스는 그다음',hl:'탱커 위주로 치유'};
  const ord=[me,...['tk','dp','hl'].filter(r=>r!==me)];
  /* 역할 칸: 위 기술 목록과 같은 말은 다시 쓰지 않고 이름만, 공략 글에서 새로운 말만 문장으로 */
  const abN=r=>AB.filter(a=>(a.t==='dis'?(r===me?abCan(a).has(c.cls):r==='hl'):r===me?abMine(a,c,me):a.w.includes(r)));
  h+='<div class="rtk">'+ord.map(r=>{const mine=r===me;const N=abN(r);const raw=(R[r]||[]).filter(t=>!seen(t)).slice(0,mine?3:2);raw.forEach(t=>shown.push(t));
      const nm=N.length?'<div class="rtn"><span>'+(mine?'위 「내 일」':'위 기술')+'</span>'+N.map(a=>'<i class="abk k-'+a.t+' wi">'+abIc(a)+esc(a.n)+(mine&&abCan(a).get(c.cls)?' · '+esc(abCan(a).get(c.cls)):'')+'</i>').join('')+'</div>':'';
      return '<div class="rtr'+(mine?' me':'')+'">'+ricon(r)+'<div class="rb-t"><b>'+RNM[r]+(mine?' · 내 할 일':'')+'</b>'+nm+(raw.length?'<ul>'+raw.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>':N.length?'':'<p>'+NONE[r]+'</p>')+'</div></div>'}).join('')+'</div>';
  const al=(R.al||[]).filter(t=>!seen(t)).slice(0,3);
  if(al.length){h+='<div class="rtr al">'+ricon('al')+'<div class="rb-t"><b>모두 알아 둘 것</b><ul>'+al.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul></div></div>';shown.push(...al)}
  /* 위에 안 나온 말만 「더 자세히」로 */
  const ex=[];['tk','dp','hl','al'].forEach(r=>(R[r]||[]).forEach(t=>{if(!seen(t)){ex.push([r,t]);shown.push(t)}}));
  const wy=AB.length&&WB&&WB.tip&&!seen(WB.tip)?WB.tip:'';
  if(ex.length||wy)h+='<details class="more3"><summary>더 자세히 '+(ex.length+(wy?1:0))+'</summary>'+(ex.length?'<ul class="exl">'+ex.map(([r,t])=>'<li>'+ricon(r,'sm')+esc(t)+'</li>').join('')+'</ul>':'')+(wy?'<p class="wyp"><b>wythic</b> '+esc(wy)+'</p>':'')+'</details>';
  return '<div class="rbox">'+h+'</div>'}
function roleBox(R,me){/* 내 역할 먼저, 나머지는 한 줄씩 */
  const ord=[me,...['tk','dp','hl'].filter(r=>r!==me)];let h='<div class="rbox">'+(R.how&&R.how.length?'<div class="rb-how"><b>🔑 만나는 법</b><ul>'+R.how.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul></div>':'');
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
function stepFlags(st,fb){if(!/우두머리|희귀/.test(st.type||''))return [];const t=[st.note,st.tip,fb&&fb.tac,...(fb&&fb.sp||[]).map(x=>x[0]+' '+x[1]+' '+(x[2]||''))].join(' ');const F=[];
  if(roleSplit([fb&&fb.tac,st.note],[]).how.length)F.push(['how','🔑','만나는 법 있음']);
  if(/끊(?:으세요|으면|어 ?주|습니다|기|고 )|반드시 끊|꼭 끊|interrupt/.test(t))F.push(['it','⚡','끊기']);
  if(/(?<!무장 )해제(?!될)|해독|dispel|(?<![가-힣])독 |저주|질병/.test(t))F.push(['hl','💚','해제']);
  if(/탱커|기절|정면|어그로|방어도|무장 해제/.test(t))F.push(['tk','🛡️','탱커 주의']);
  if(/쫄|불러(?! 일으)|소환(?!사)|합류|호위병/.test(t)&&!/퀘스트로 불러/.test(t))F.push(['ad','👥','쫄 나옴']);
  if(/피하|바닥 ?(?:불|의 불|에 남|웅덩이|장판)|흩어(?:져|지)|떨어져 서|avoid|spread/.test(t))F.push(['mv','🏃','피하기']);
  return F}
function stepFloor(g){/* 지도 핀 번호로 단계가 몇 층인지 */const m={};(g.floors||[]).forEach(f=>f.pins.forEach(p=>{const n=parseInt(p.t);if(/^\d+!?$/.test(p.t||'')&&!m[n])m[n]=f}));return m}
function dgPrep(g){if(!g)return '';return (g.prep&&g.prep.length?'<details class="warn2"><summary><span class="ic" style="background-image:url('+ICO('inv_misc_book_09')+')"></span>들어가기 전에 알아 둘 것 '+g.prep.length+'개<i>⌄</i></summary><ul>'+g.prep.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></details>':'')+(g.src?'<p class="mute src">📝 '+esc(g.src)+'</p>':'')}
function dgRoute(c,d,tg){if(!DGG){dggLoad();return '<p class="note">동선 자료를 불러오는 중…</p>'}
  const g=DGG[d.slug];if(!g||!(g.steps&&g.steps.length)){
    const W2=wyOf(d);if(!(g&&g.boss)&&W2&&W2.bosses&&W2.bosses.length){/* 신규 던전: wythic.com 공략(입구·보스 순서·기술 한 줄) */const its=dgItems(c,d);
      return '<div class="card"><p class="note">'+esc(W2.sum||'')+'</p><p class="mute src">자료: wythic.com 공략 · 지도 위치는 추정일 수 있어요</p><ol class="route">'
        +W2.bosses.map((b,i)=>{const n=its.filter(it=>it.src.some(x=>SRC[x]&&SRC[x].k===0&&SRC[x].dg===d.slug&&SRC[x].boss===b.npc)).length;return '<li class="rs boss"><span class="no">'+(i+1)+'</span><div class="rb2"><div class="rt3"><b>'+esc(b.npc)+'</b>'+(b.opt?' <small class="mute">선택</small>':'')+(n?' <small class="mute">드랍 '+n+'</small>':'')+'</div>'+(b.tip?'<p class="bt">'+esc(b.tip)+'</p>':'')+'</div></li>'}).join('')+'</ol></div>'}
    if(!(g&&g.boss)&&d.bosses.length){/* 신규·개방 예정 던전: wowf.io 보스 순서만 */const its=dgItems(c,d);if(!WY)wyLoad();
      return (tg||'')+dgPrep(g)+'<div class="card">'+(g&&g.sum?'<p>'+esc(g.sum)+'</p>':'')+'<p class="note">'+(g&&g.prep&&g.prep.length?'보스 순서는 아직 정리된 곳이 없어서 게임 목록 순서로 보여 줘요. 길이 여러 갈래라 순서는 파티와 정하세요.':d.soon?'🚧 아직 열리지 않은 던전이에요. 열리면 동선·보스 기술을 채울게요. 지금은 wowf.io에 나온 <b>보스 순서</b>와 드랍만 보여 줘요.':'진행 순서 자료가 아직 없어요. 보스 순서와 드랍만 보여 줘요.')+'</p><ol class="route">'
        +d.bosses.map((b,i)=>{const n=its.filter(it=>it.src.some(x=>SRC[x]&&SRC[x].k===0&&SRC[x].dg===d.slug&&SRC[x].boss===b.nm)).length;const rare=/^mob-/.test(b.slug);return '<li class="rs boss"><span class="no">'+(rare?'◆':i+1)+'</span><div class="rb2"><div class="rt3"><b>'+esc(b.nm)+'</b>'+(rare?' <small class="mute">희귀몹</small>':'')+(n?' <small class="mute">드랍 '+n+'</small>':'')+'</div></div></li>'}).join('')+'</ol></div>'}
    return '<p class="empty-st">이 던전 진행 순서 자료가 아직 없어요. 보스 공략만 보여 줘요.</p>'+(g&&g.boss?bossTacOnly(g):'')}
  const B=g.boss||{};const items=dgItems(c,d);ui.stopen=ui.stopen||{};const me=myRole(c);
  const fbOf=st=>B[st.nm]||Object.values(B).find(b=>b.en&&b.en===st.en);
  const goodOf=nm=>items.filter(it=>usable(it,c)&&it.src.some(i=>{const s=SRC[i];return s&&s.k===0&&s.dg===d.slug&&s.boss===nm})).map(it=>bestSlot(it,c)).filter(b=>b&&b.g>.01).length;
  const KL=killOf(c,d.slug);const BL=S0=>S0.filter(x=>x.kind!=='obj');
  const S=g.steps.map(st=>{const fb=fbOf(st);return {st,fb,F:stepFlags(st,fb),AB:abOf(d,st),kind:/우두머리/.test(st.type)?'boss':/희귀/.test(st.type)?'rare':'obj'}});
  const cnt=k=>S.filter(x=>x.F.some(f=>f[0]===k)).length;
  const nBoss=S.filter(x=>x.kind==='boss').length,nSkip=S.filter(x=>x.st.skip).length,nQ=S.filter(x=>x.st.q&&x.st.q.length).length;
  const B2=BL(S);const nk=B2.filter(x=>KL[x.st.nm]).length;const on=!!KL._s;
  let h='<div class="card ready2"><div class="ready"><div class="roles">'+['tk','dp','hl'].map(r=>'<button class="'+(r===me?'on':'')+'" data-a="drole" data-k="'+r+'" aria-label="'+RNM[r]+'">'+ricon(r)+'</button>').join('')+'</div>'
   +(on?'<div class="prog2'+(nk===B2.length?' all':'')+'"><span>보스 <b>'+nk+'/'+B2.length+'</b>'+(nk===B2.length?' 🎉':'')+'</span><span class="bar"><i style="width:'+Math.round(nk/Math.max(1,B2.length)*100)+'%"></i></span><button class="btn sm '+(nk===B2.length?'':'ghost')+'" data-a="rkend">끝내고 정리</button></div>'
       :'<button class="go" data-a="rkgo"><span class="ic" style="background-image:url('+ICO('ability_warrior_charge')+')"></span>던전 시작</button>')+'</div>'
   +(on?'':'<p class="rhint">'+RNM[me]+' 기준으로 보여 줘요 · 시작하면 보스 잡을 때마다 ✓'+(()=>{const r=(c.dgRuns||[]).filter(x=>x.d===d.slug);return r.length?' · 지난번 '+new Date(r[0].t).toLocaleDateString('ko-KR',{month:'numeric',day:'numeric'})+(r[0].m?' '+r[0].m+'분':'')+(r.length>1?' (모두 '+r.length+'번)':''):''})()+'</p>')+'</div>';
  h+=tg||'';
  h+=dgPrep(g);
  if(g.sum)h+='<details class="card sum2"><summary><p>'+esc(g.sum)+'</p><span class="more">더 보기 ›</span></summary><p>'+esc(g.sum)+'</p></details>';
  h+='<div class="dg2"><div class="dgL">';
  /* 지도: 기본으로 1층만 펼쳐 둠, 핀 누르면 그 단계로 */
  const FL=stepFloor(g);
  if(g.floors&&g.floors.length){const fi=Math.min(ui.dfloor||0,g.floors.length-1);const f=g.floors[fi];
    h+='<div class="rmap2">'+(g.floors.length>1?'<div class="chips seg fl">'+g.floors.map((x,i)=>'<button class="chip'+(i===fi?' on':'')+'" data-a="dfl" data-k="'+i+'">'+(i+1)+'층 '+esc(x.name)+'</button>').join('')+'</div>':'')
     +'<div class="mapw"><img src="'+esc(f.img)+'" alt="" loading="lazy" onerror="this.parentNode.classList.add(\'noimg\')">'
     +f.pins.map(p=>{const num=/^\d+!?$/.test(p.t||'');const n=parseInt(p.t);const x=num?S.find(y=>y.st.n===n):null;
        if(num)return '<button class="pin n '+(x?'k-'+x.kind:'')+(/!/.test(p.t)?' q':'')+(x&&x.kind!=='obj'&&KL[x.st.nm]?' kd':'')+(ui.stopen[n]?' on':'')+'" style="left:'+p.x+'%;top:'+p.y+'%" data-a="stp" data-k="'+n+'">'+n+'</button>';
        const t=(p.t||'').replace(/\d+$/,'');const to=t.match(/→\s*(.+)$/);return '<span class="pin l" style="left:'+p.x+'%;top:'+p.y+'%">'+esc(to?'↗ '+to[1]:t.replace(/←.*$/,'↙ 들어옴'))+'</span>'}).join('')+'</div><p class="mute src">번호를 누르면 아래 그 단계가 펼쳐져요 · 지도: wowf.io</p></div>'}
  h+='</div><div class="dgR">';
  /* 진행 순서: 한 줄씩, 누르면 펼침 */
  let lastF=null;
  {const nO=S.filter(x=>x.kind==='obj').length;h+='<div class="tlh"><b>보스 동선</b><small>보스 '+B2.length+(nO?' · 물건 '+nO:'')+'</small><button class="btn sm ghost" data-a="stall" data-k="'+(S.some(x=>!ui.stopen[x.st.n])?1:0)+'">'+(S.some(x=>!ui.stopen[x.st.n])?'모두 펼치기':'모두 접기')+'</button></div><p class="legend ableg">'+['dz','int','dis','av','add'].map(t=>'<i class="abk k-'+t+'">'+ABK[t]+'</i>').join('')+'</p>'}
  h+='<div class="rlist tl2">'+S.map(x=>{const st=x.st,fb=x.fb;let r='';const f=FL[st.n];
    if(f&&f!==lastF&&g.floors.length>1){const fi=g.floors.indexOf(f);r+='<div class="rfl"><span class="fln"><b>'+(fi+1)+'</b>층</span><span class="flt"><b>'+esc(f.name)+'</b><small>'+(()=>{const on=S.filter(y=>FL[y.st.n]===f);const nb=on.filter(y=>y.kind==='boss').length,nr=on.filter(y=>y.kind==='rare').length,no=on.filter(y=>y.kind==='obj').length;return [nb?'우두머리 '+nb:'',nr?'희귀 '+nr:'',no?'물건·NPC '+no:''].filter(Boolean).join(' · ')||(fi+1)+' / '+g.floors.length+'층'})()+'</small></span><i></i></div>';lastF=f}
    const open=!!ui.stopen[st.n];const good=x.kind==='boss'?goodOf(st.nm):0;
    const kd=x.kind!=='obj'&&KL[st.nm];const ckOn=KL._s&&x.kind!=='obj';
    r+='<div class="rr k-'+x.kind+(st.skip?' skip':'')+(open?' open':'')+(kd?' kd':'')+'" id="stp-'+st.n+'"><div class="rrw">'+(ckOn?'<button class="rck'+(kd?' on':'')+'" data-a="rk" data-k="'+esc(st.nm)+'" aria-label="잡음 표시">'+(kd?'✓':'')+'</button>':'')+'<button class="rrh" data-a="stp" data-k="'+st.n+'">'+(x.kind==='obj'?'<span class="no">'+st.n+'</span>':(()=>{const bi=d.bosses.findIndex(b=>b.nm===st.nm);const im=bossImg(d,st.nm,bi)||npcThumb((wyBoss(d,st.nm)||{}).id);return '<span class="por"'+(im?' style="background-image:url('+im+'),url('+ICO('inv_misc_bone_humanskull_01')+')"':'')+'>'+(im?'':'👹')+'<span class="no">'+st.n+'</span></span>'})())+'<span class="t"><b>'+esc(st.nm)+'</b><span>'+(st.lv?'Lv '+st.lv+' · ':'')+esc(st.type)+(st.skip?' · 건너뛰어도 됨':'')+(good?' · '+good+'개 내 템':'')+'</span></span><span class="fl2">'+(x.AB&&x.AB.length?abChips(x.AB):x.F.map(f=>(f[0]==='tk'?ricon('tk','sm'):f[0]==='hl'?ricon('hl','sm'):'<i class="f-'+f[0]+'" title="'+f[2]+'">'+f[1]+'</i>')).join(''))+(st.q&&st.q.length?qico('dg','퀘스트 목표'):'')+'</span><span class="cv">'+(open?'⌃':'⌄')+'</span></button></div>';
    if(open){const RS=roleSplit([fb&&fb.tac,st.note],fb&&fb.sp);
      if(RS.how.some(t=>/준비 칸|만드는 법/.test(t))&&g.prep){/* 준비 칸에서 같은 물건 얘기를 찾아 같이 보여 줌 */const W=(RS.how.join(' ').match(/[가-힣]{2,}/g)||[]).map(w=>w.replace(/(?:에서|으로|을|를|이|가|은|는|의|에|로)$/,'')).filter(w=>w.length>=2&&!(d.ko||'').includes(w)&&!/^(희귀|우두머리|입니다|나옵니다|하수도|작은|원형|의식진|쓰면|만드는|법은|준비|칸|있습니다|위)$/.test(w));
        g.prep.filter(x=>W.some(w=>x.includes(w))).forEach(x=>{if(!RS.how.includes(x))RS.how.push(x)});RS.how=RS.how.filter(t=>!/위 준비 칸에 있/.test(t)||RS.how.length===1)}const full=[fb&&fb.tac,st.note!==(fb&&fb.tac)?st.note:''].filter(Boolean);
      const WB=x.kind!=='obj'?wyBoss(d,st.nm):null;
      r+='<div class="rrb">'+(RS.loc.length?'<p class="rloc">📍 '+esc(RS.loc.join(' '))+'</p>':'')+(x.kind==='obj'?(full.length?'<p class="onote">'+esc(full.join(' '))+'</p>':''):bossBody(RS,me,x.AB||[],c,WB&&st.wy?Object.assign({},WB,{full:1}):WB))
      +(!(x.AB&&x.AB.length)&&fb&&fb.sp&&fb.sp.length?'<div class="spl">'+fb.sp.map(y=>'<span class="sp" title="'+esc(y[1])+'">'+esc(y[0])+(y[2]?y[2].split(',').map(t=>'<em class="t-'+t+'">'+(TAGKO[t]||t)+'</em>').join(''):'')+'</span>').join('')+'</div>':'')
      +(st.q||[]).map(q=>'<button class="rq" data-a="qopen" data-k="'+q[0]+'">'+qico('dg')+' '+esc(q[1])+'</button>').join('')
      +(good?'<button class="rgood" data-a="dtab" data-k="loot">'+qico('gear')+' 이 보스 내 템 '+good+'개 보기 ›</button>':'')+'</div>'}
    return r+'</div>'}).join('')+'</div>';
  h+='<p class="mute src">초록 「내 일」 = 내 역할·직업이 할 일 · 보스 기술: method.gg·warcrafttavern·wow.gg·wythic 모음(오리지널 던전은 클래식 자료로 보충) · 공략: wowf.io 진행 순서 · forg.gg 보스 기술 (패치로 달라졌을 수 있어요)</p>';
  h+='</div></div>';
  return h}
function bossTacOnly(g){return '<ol class="route">'+Object.entries(g.boss).map(([nm,b],i)=>'<li class="rs boss"><span class="no">'+(i+1)+'</span><div class="rb2"><div class="rt3"><b>'+esc(nm)+'</b></div>'+(b.tac?'<ul class="roles">'+roleLines(b.tac)+'</ul>':'')+'</div></li>').join('')+'</ol>'}
/* 포에버 던전 경험치: 10/1 던전 퀘스트의 추가 경험치 절반으로 · 10/8 몹 +20% · 11/8 핫픽스 몹 +50% (블리자드) → 그래도 퀘스트 먼저 받고 가기 */
function dgQBanner(c,d){const S=dgState(c,d);if(!S.Q.length)return '';const notTaken=S.left.length-S.inLog.length;
  if(S.all)return '<div class="dqb done"><b>✅ 던전 퀘스트 '+S.Q.length+'개를 다 했어요</b><small>11월 9일 핫픽스로 던전 몹 경험치가 50% 올라서 다시 돌아도 경험치를 꽤 받아요. 다만 파티원 한 명에게라도 회색인 몹은 경험치가 0이에요(11/13).</small></div>';
  return '<div class="dqb"><b>📜 퀘스트 먼저 받고 가세요</b><span>던전 퀘스트 '+S.done.length+'/'+S.Q.length+' 했어요'+(S.inLog.length?' · 퀘스트창에 '+S.inLog.length+'개':'')+(notTaken>0?' · <em>안 받은 퀘스트 '+notTaken+'개</em>':'')+'</span><small>던전 퀘스트 경험치가 커서 받고 가는 게 좋아요 · 11월 9일부터 던전 몹 경험치 +50% · 파티원 한 명에게라도 회색인 몹은 모두 경험치 0(11/13).</small>'+(notTaken>0&&ui.dtab!=='quest'?'<button class="btn sm" data-a="dtab" data-k="quest">안 받은 퀘스트 보기 ›</button>':'')+'</div>'}
/* 유산(Legacy) 던전 도전: 목록의 던전마다 마지막 보스를 잡으면 인정, 도전마다 1점 (allthings.how 던전별 정리, 게임 문구 「Complete the following dungeons」) */
const SPELUNK=[['Novice Spelunker','초급',['hall-of-thanes','ruins-of-lordaeron','deadmines','wailing-caverns','shadowfang-keep','whelgar-excavation']],
 ['Experienced Spelunker','중급',['blackfathom-deeps','razorfen-kraul','gnomeregan','city-of-dalaran','sm-graveyard','sm-library','sm-armory','sm-cathedral','drowned-city','kroldok-stronghold']],
 ['Master Spelunker','고급',['razorfen-downs','uldaman','zul-farrak','maraudon','temple-of-atal-hakkar','alcaz-prison','blackrock-depths','lower-blackrock-spire','upper-blackrock-spire','dire-maul-east','dire-maul-north','dire-maul-west','scholomance','stratholme-live','stratholme-dead','blackmaw-hold','shapers-terrace']]];
function spDone(c,slug){return !!((c.legDg&&c.legDg[slug])||(c.dgRuns||[]).some(r=>r.d===slug&&r.k>0))}
function spOf(slug){return SPELUNK.find(x=>x[2].includes(slug))}
function spCard(c,d){const S=spOf(d.slug);if(!S)return '';const n=S[2].filter(x=>spDone(c,x)).length,me=spDone(c,d.slug);
  return '<details class="legsp'+(n===S[2].length?' all':'')+'"><summary><span class="ic" style="background-image:url('+ICO('achievement_dungeon_gloryofthehero')+'),url('+IC_Q+')"></span><span class="m"><b>유산 1점 · '+S[0]+'</b><small>'+S[1]+' 던전 '+S[2].length+'곳 중 <b>'+n+'</b>곳 · 이 던전 '+(me?'✓ 깼음':'아직')+'</small></span><i class="cv"></i></summary>'
   +'<p class="mute">목록의 던전마다 마지막 보스를 잡으면 인정돼요. 「끝내고 정리」로 기록한 던전은 자동으로 ✓, 앱 밖에서 깬 던전은 아래 버튼으로 표시하세요. 실제 점수는 게임 유산 창(Y)이 기준이에요.</p>'
   +'<div class="lspc">'+S[2].map(x=>DG[x]?'<button class="lsp'+(spDone(c,x)?' on':'')+(x===d.slug?' cur':'')+'" data-a="dgo" data-k="'+x+'">'+(spDone(c,x)?'✓ ':'')+esc(DG[x].ko)+'</button>':'').join('')+'</div>'
   +((c.dgRuns||[]).some(r=>r.d===d.slug&&r.k>0)?'':'<button class="btn sm ghost" data-a="legdg" data-k="'+d.slug+'">'+(me?'↩ 깼음 표시 지우기':'✓ 이 던전 깼어요')+'</button>')+'</details>'}
function dgDetail(c,d){const L=c.lv;const items=dgItems(c,d);
  const byBoss={};items.forEach(it=>{const s=it.src.map(i=>SRC[i]).find(s=>s&&s.k===0&&s.dg===d.slug);const b=s?s.boss:'기타';(byBoss[b]=byBoss[b]||[]).push(it)});
  const order=d.bosses.map(b=>b.nm);Object.keys(byBoss).forEach(b=>{if(!order.includes(b))order.push(b)});
  const myUps=items.filter(it=>usable(it,c)).map(it=>({it,b:bestSlot(it,c)})).filter(x=>x.b&&x.b.g>.01);
  const pcN=dqOf(c,d).filter(q=>preChain(q.id).some(i=>!mqDone(c,QDB.get(i)))).length;
  let h='<div class="wrap"><div class="dhero2"><img src="'+DG_IMG(d.slug)+'" alt="" onerror="this.remove()"><div class="dt"><h2>'+esc(d.ko)+'</h2><small>'+esc(d.en)+'</small><div class="meta"><span class="pill lvp">Lv '+d.lo+'–'+d.hi+'</span>'+(d.soon?'<span class="pill soonp">🚧 개방 예정</span>':'')+(d.loc?'<span class="pill"><span class="ic" style="background-image:url('+ICO('inv_misc_map_01')+')"></span>'+esc(d.loc)+'</span>':'')+'<span class="pill"><span class="ic" style="background-image:url('+ICO('inv_misc_bone_humanskull_01')+')"></span>보스 '+order.length+'</span></div></div></div>';
  const dt=ui.dtab||'route';h+=dgQBanner(c,d)+spCard(c,d);
  h+='<div class="tabs3">'+[['route','inv_misc_map02','공략',''],['loot','inv_misc_bag_10','템',myUps.length?'⭐'+myUps.length:''],['quest','inv_misc_note_01','퀘스트',(()=>{const Q=dqOf(c,d),lf=Q.filter(q=>!dqIsDone(c,q)).length;return !Q.length?'':!lf?'✓':(pcN?'⚠':'')+lf})()]].map(x=>'<button class="'+(dt===x[0]?'on':'')+'" data-a="dtab" data-k="'+x[0]+'"><span class="ic" style="background-image:url('+ICO(x[1])+')"></span>'+x[2]+(x[3]!==''?' <em>'+x[3]+'</em>':'')+'</button>').join('')+'</div>';
  if(dt==='route')return h+dgRoute(c,d,dgTargets(c,d,dt))+'</div>';
  /* 1. 퀘스트 */
  if(dt==='quest'){const outN=dqOf(c,d).filter(q=>!/던전 안/.test(q.start)&&q.start).length;const dn=dqOf(c,d).filter(q=>dqIsDone(c,q)).length;const nLg=dqOf(c,d).filter(q=>!dqIsDone(c,q)&&(c.ql||{})[q.id]).length,nRd=dqOf(c,d).filter(q=>!dqIsDone(c,q)&&(c.ql||{})[q.id]===2).length;
    if(dqOf(c,d).length)h+='<div class="qtop"><span class="ic" style="background-image:url('+ICO('inv_misc_note_01')+')"></span><span class="m"><b>'+(outN?'미리 받아 갈 퀘스트 '+outN+'개':'던전 안에서 받는 퀘스트')+'</b><small>'+(outN?'던전 들어가기 전에 받아 두세요':'들어가서 받아요')+(pcN?' · ⚠ 앞 연계가 필요한 퀘스트 '+pcN+'개':'')+(nLg?' · 🎒 퀘스트창에 '+nLg+'개'+(nRd?'(반납 가능 '+nRd+')':''):'')+'</small></span><span class="ok">끝냄 '+dn+'/'+dqOf(c,d).length+'</span></div>'+(c.imported?'<p class="dqsync">🎮 게임에서 불러온 기록으로 표시했어요 · '+armAgo(c.imported.t)+' 불러옴</p>':'');
    h+=dqOf(c,d).length?'<div class="card">'+dqList(c,d)+'</div>':'<p class="empty-st">이 던전 퀘스트가 없어요.</p>';return h+'</div>'}
  if(false)h+='<div class="card"><h3>📜 퀘스트 '+d.q.length+'개</h3>'+dqList(c,d)+'</div>';
  /* 2. 템: 맨 위 최고 템 → 거르기 → 보스별 2칸 */
  const lf=ui.lf||'good';const why=(it,b)=>{const cur=eqIt(c,b.s);const w=wOf(c);return Object.keys(it.st).filter(k=>STAT_KO[k]&&(w[k]||0)>0&&!SHDUP(k,it.st)).map(k=>[k,(it.st[k]||0)-((cur&&cur.st[k])||0)]).filter(x=>x[1]>0).sort((x,y)=>y[1]*(w[y[0]]||0)-x[1]*(w[x[0]]||0)).slice(0,2).map(([k,v])=>STAT_KO[k].replace('무기 초당 공격력','DPS')+' +'+(k==='dps'?v.toFixed(1):Math.round(v))).join(' · ')};
  const top=myUps.slice().sort((x,y)=>y.b.g-x.b.g)[0];const bossOf=it=>{const s2=it.src.map(i=>SRC[i]).find(z=>z&&z.k===0&&z.dg===d.slug);return s2?s2.boss:''};
  if(top)h+='<button class="lsum" data-a="cmpq" data-k="'+top.b.s+':'+top.it.id+'">'+itIcon(top.it)+'<span class="m"><b class="q'+top.it.q+'">'+esc(top.it.nm)+'</b><small>이 던전 최고 · '+esc(bossOf(top.it)||'몹 드랍')+' · '+esc(SL_KO[top.it.sl]||'')+'</small>'+(why(top.it,top.b)?'<small class="why">'+esc(why(top.it,top.b))+' 덕분</small>':'')+'</span><span class="g">+'+Math.round(top.b.g)+'</span></button>';
  h+='<div class="flt2">'+[['good','⭐ 내게 좋은 것 '+myUps.length],['all','전부 '+items.length]].map(x=>'<button class="'+(lf===x[0]?'on':'')+'" data-a="lf" data-k="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>';
  const tile=(it)=>{const use=usable(it,c);const b=use?bestSlot(it,c):null;const gd=b&&b.g>.01;const wy=why(it,b||{s:''});
    return '<button class="ci'+(gd&&top&&top.it.id===it.id?' best':'')+(use?'':' no')+'" data-a="'+(gd?'cmpq':'info')+'" data-k="'+(gd?b.s+':'+it.id:it.id)+'">'+itIcon(it)+'<span class="m"><b class="q'+it.q+'">'+wishMark(c,it.id)+esc(it.nm)+'</b><small>'+esc((SL_KO[it.sl]||'')+(use?((it.ob||it.lv)>0?' · Lv '+(it.ob||it.lv):''):' · 못 씀'))+'</small>'+(gd&&wy?'<small class="why">'+esc(wy)+'</small>':'')+'</span>'+(gd?'<em class="g">+'+Math.round(b.g)+'</em>':'')+'</button>'};
  const B=order.map((nm,i)=>{const its=byBoss[nm]||[];const good=its.filter(it=>myUps.some(x=>x.it.id===it.id)).sort((x,y)=>bestSlot(y,c).g-bestSlot(x,c).g);return {nm,i,its,good}});
  h+=B.map(x=>{const show=lf==='all'?x.its.slice().sort((p,q)=>(x.good.includes(q)-x.good.includes(p))||(usable(q,c)-usable(p,c))):x.good;
    const bi=d.bosses.findIndex(b=>b.nm===x.nm);const im=x.nm==='기타'?'':(bossImg(d,x.nm,bi)||npcThumb((wyBoss(d,x.nm)||{}).id));
    return '<div class="bs2"><div class="h"><span class="por"'+(im?' style="background-image:url('+im+'),url('+ICO('inv_misc_bone_humanskull_01')+')"':'')+'>'+(im?'':'👹')+'</span><span class="m"><b>'+esc(x.nm==='기타'?'보스 외 드랍':x.nm)+(killOf(c,d.slug)[x.nm]?' <em class="kdm">✓ 잡음</em>':'')+'</b><small>'+(bi>=0?(bi+1)+'번째 보스 · ':'')+'드랍 '+x.its.length+'</small></span><span class="cnt'+(x.good.length?'':' none')+'">'+(x.good.length?'좋은 템 '+x.good.length:'좋은 템 없음')+'</span></div>'
     +(show.length?'<div class="dgg2">'+show.map(tile).join('')+'</div>':'')+'</div>'}).join('');
  /* 던전 퀘스트 보상 템 (보스 드랍과 따로) */
  {const QR=dqOf(c,d).map(q=>({q,its:q.rw.map(id=>IT.get(id)).filter(Boolean),oth:q.rw.filter(id=>!IT.get(id)&&D_RWNM[id]).map(id=>D_RWNM[id])})).filter(x=>x.its.length||x.oth.length);
   if(QR.length){const gd=it=>{if(!usable(it,c))return 0;const b=bestSlot(it,c);return b&&b.g>.01?b.g:0};const nG=QR.reduce((n,x)=>n+x.its.filter(gd).length,0);
    h+='<div class="bs2 dqr"><div class="h"><span class="por">📜</span><span class="m"><b>던전 퀘스트 보상</b><small>퀘스트 '+QR.length+'개 · 하나 골라 받는 건 「택1」</small></span><span class="cnt'+(nG?'':' none')+'">'+(nG?'좋은 템 '+nG:'좋은 템 없음')+'</span></div>'
     +QR.map(x=>{const show=lf==='all'?x.its:x.its.filter(gd);if(!show.length&&!(lf==='all'&&x.oth.length))return '';return '<p class="dqrn">'+(dqIsDone(c,x.q)?'✅ ':'')+esc(x.q.nm)+(x.q.choose&&x.its.length+x.oth.length>1?' <em>택1</em>':'')+(x.q.lv>0?' <span class="mute">Lv '+x.q.lv+'</span>':'')+'</p>'+(show.length?'<div class="dgg2">'+show.map(tile).join('')+'</div>':'')+(x.oth.length?'<p class="dqro">🎁 '+x.oth.map(esc).join(' · ')+'</p>':'')}).join('')+'</div>'}}
  const W=wyOf(d);if(!WY)wyLoad();
  if(W&&W.trash&&W.trash.length){const T=W.trash;
    h+='<details class="trash2"><summary>🗡️ 그 밖의 몹 드랍 '+T.length+'<span class="ics">'+T.slice(0,4).map(t=>{const it=IT.get(t[0]);return it?itIcon(it):''}).join('')+'</span><i>›</i></summary><div class="sb">'+T.map(t=>{const it=IT.get(t[0]);return it?dropLine(c,it)+(t[6]?'<p class="wysrc">↳ '+esc(t[6])+'</p>':''):'<div class="wyit q'+t[4]+'"><b>'+esc(t[1])+'</b><span>'+esc([t[2],t[3]?'iLv '+t[3]:'',t[6]].filter(Boolean).join(' · '))+'</span></div>'}).join('')+'</div></details>'}
  h+='<p class="note"><a href="https://forg.gg/forever/dungeons/'+d.slug+'" target="_blank" rel="noopener">forg.gg에서 지도·보스 공략 보기 ↗</a>'+(W?' · <a href="https://wythic.com/ko/forever/dungeons/'+W.id+'" target="_blank" rel="noopener">wythic.com에서 보기 ↗</a>':'')+'</p>';
  return h+'</div>'}

/* ===== 보스 잡음 표시 (던전마다, 다시 돌 때 지우기) ===== */
function killOf(c,slug){c.dk=c.dk||{};return c.dk[slug]||{}}
/* ===================== 직업 ===================== */
const CSEC=[['tal','','특성'],['rot','inv_misc_pocketwatch_01','운영 순서'],['learn','img/ui-book.png','기술 습득'],['prof','img/ui-prof.png','전문기술']];
const RLIC={'치유':'hl','탱커':'tk','원거리 딜':'dp','근접 딜':'dp'};
const RLEMO=new Proxy({},{get:(o,k)=>RLIC[k]?'<img class="rli" src="img/role-'+RLIC[k]+'.png" alt="">':''});
const PICON={alch:'trade_alchemy',bs:'trade_blacksmithing',ench:'trade_engraving',eng:'trade_engineering',lw:'trade_leatherworking',tail:'trade_tailoring',cook:'inv_misc_food_15',fa:'spell_holy_sealofsacrifice',mine:'trade_mining',herb:'trade_herbalism',skin:'inv_misc_pelt_wolf_01',fish:'trade_fishing'};
const pIco=id=>'<span class="pic" style="background-image:url('+ICO(PICON[id]||'inv_misc_questionmark')+')"></span>';
/* 전문기술: 이름 → 아이콘 (만드는 것·재료) */
const pnm=t=>String(t||'').trim().replace(/\s+[+]?\d+(?:~\d+)?(?:\s*등)?$/,'');
function picoOf(t){const P=(typeof PICO!=='undefined'&&PICO)||{};return P[pnm(t)]||''}
function pMade(name){const parts=String(name).split(/\s*→\s*/);return parts.map(p=>{const ic=picoOf(p.replace(/\s*\(.*$/,''));return (ic?'<span class="pic sm" style="background-image:url('+ICO(ic)+')"></span>':'')+'<b>'+esc(p)+'</b>'}).join('<i class="par">→</i>')}
function pMat1(t){t=t.trim();const _c=me();const ex=(t.match(/\s*(\(.*\))$/)||[])[1]||'';t=t.replace(/\s*\(.*\)$/,'');const m=t.match(/^(.*?)\s+(\d+(?:~\d+)?)(\s*등)?$/);const nm=m?m[1]:t,q=m?m[2]:'';const ic=picoOf(nm)||picoOf(nm.replace(/\s*(꽃잎|잎사귀)$/,''));
  const mid=(typeof D_MATID!=='undefined'&&(D_MATID[nm]||D_MATID[nm.replace(/\s*(꽃잎|잎사귀)$/,'')]))||0;const have=mid&&_c?((_c.bag||{})[mid]||0)+((_c.bank||{})[mid]||0):0;
  return '<span class="pmat'+(have?' have':'')+'">'+(ic?'<span class="pic xs" style="background-image:url('+ICO(ic)+')"></span>':'')+esc(nm)+(q?'<em>×'+q+'</em>':'')+(ex?'<small>'+esc(ex)+'</small>':'')+(have?'<b class="hv" title="게임에서 불러온 가방·은행">가진 것 '+have+'</b>':'')+'</span>'}
function pMats(txt){return String(txt||'').split(/\s*,\s*/).filter(Boolean).map(t=>t.split(/\s+\/\s+|\//).map(pMat1).join('<i class="por">또는</i>')).join('')}
const PEMO={alch:'⚗️',bs:'🔨',ench:'✨',eng:'⚙️',lw:'👜',tail:'🧵',cook:'🍳',fa:'🩹',mine:'⛏️',herb:'🌿',skin:'🔪',fish:'🎣'};
const PGRP=[['제작',['alch','bs','ench','eng','lw','tail']],['채집',['herb','mine','skin']],['보조',['cook','fa','fish']]];
const ROTEMO=[[/항상/,'♾️'],[/전투 ?전|직전|당기기/,'⏳'],[/시작|여는/,'▶️'],[/이어서|다음/,'➡️'],[/레벨부터|이후/,'🔓'],[/던전|파티/,'🏰'],[/채우|마나|회복/,'💧'],[/다치|위급|생존|급하/,'🩹'],[/광역|여럿|다수/,'💥'],[/단일|하나/,'🎯'],[/마무리|처형|끝/,'🏁'],[/펫|소환수|하수인/,'🐾'],[/쿨|폭딜|강화/,'🔥']];
const rotEmo=t=>{for(const [re,e] of ROTEMO)if(re.test(t))return e;return '•'};
function talRow(C,s,L){const t=C.talents[s[1]]||[s[1],'',1];return '<div class="tl'+(s[0]===L?' now':s[0]<L?' done':'')+'"><span class="lvb '+lvCls(s[0],L)+'">'+s[0]+'</span><span class="m"><b>'+esc(t[0])+'</b> <span class="mute">'+s[2]+'/'+t[2]+' · '+esc(t[1])+'</span>'+(t[4]&&s[0]>=L-1&&s[0]<=L+1?'<span class="sub">'+esc(t[4])+'</span>':'')+'</span></div>'}
function rotHtml(C,txt,L){return esc(txt).replace(/\[([^\]@*]+)(?:@(\d+))?(\*)?\]/g,(m,n,lv,t)=>{const icon=abIcon(n,C);const no=lv&&+lv>L;return '<span class="ab'+(no?' no':'')+'">'+(icon?'<span class="ic" style="background-image:url('+ICO(icon)+')"></span>':'')+n+(lv?' <span class="l">'+lv+'</span>':'')+(t?' <span class="l">특성</span>':'')+'</span>'})}
function klass(c){const C=D_CLS[c.cls],sp=specOf(c),L=c.lv,sec=ui.csec;
  const role=ROLE[c.cls+'/'+c.spec]||'';
  let h='<div class="wrap"><div class="khead" style="--cc:'+CINFO[c.cls][1]+'">'+clsIcon(c.cls,1)+'<div class="kt"><b>'+esc(CINFO[c.cls][0])+'</b><span>'+esc(sp.name)+' · '+(RLEMO[role]||'')+' '+esc(role)+' · 레벨 '+L+'</span></div></div>';
  h+='<div class="kspec">'+C.specs.map(s=>{const r=ROLE[c.cls+'/'+s.id]||'';return '<button class="'+(s.id===c.spec?'on':'')+'" data-a="spec" data-k="'+s.id+'"><span class="ic" style="background-image:url('+ICO(s.icon)+')"></span><b>'+esc(s.name)+'</b><small>'+(RLEMO[r]||'')+' '+esc(r)+'</small></button>'}).join('')+'</div>';
  h+='<div class="ksec">'+CSEC.map(x=>'<button class="'+(sec===x[0]?'on':'')+'" data-a="csec" data-k="'+x[0]+'">'+gic(x[0]==='tal'?((sp&&sp.icon)||'ability_marksmanship'):x[1],'lg')+'<span>'+x[2]+'</span></button>').join('')+'</div>';
  if(sec==='tal')h+=talView(c,C,sp,L);
  if(sec==='rot'){const blk=(t,arr,sub)=>arr.length?'<div class="card krot"><h3>'+t+'</h3>'+(sub?'<p class="note">'+sub+'</p>':'')+arr.map(r=>'<div class="rot2"><div class="w"><i>'+rotEmo(r[0])+'</i>'+esc(r[0])+'</div><div class="v">'+rotHtml(C,r[1],L)+'</div></div>').join('')+'</div>':'';
    h+='<p class="note kn">흐린 기술은 아직 못 배운 거예요 · 작은 숫자는 배우는 레벨</p>'+(L<30?blk('🌱 초반 (레벨업)',sp.early,'혼자 사냥하며 올릴 때')+blk('🔁 기본 운영',sp.rot,'던전·만렙까지 쓰는 기본 순서'):blk('🔁 기본 운영',sp.rot,'던전·만렙까지 쓰는 기본 순서')+blk('🌱 초반 (레벨업)',sp.early,'혼자 사냥하며 올릴 때'))+blk('🏰 후반',sp.late,'60레벨·레이드')}
  if(sec==='learn')h+=learnView(c,C,L);
  if(sec==='prof')h+=profView(c);
  h+='<p class="note kn">출처: forg.gg 직업 가이드 (Wowhead·Mobalytics 빌드 정리) · 게임 업데이트로 바뀔 수 있어요</p>';
  return h+'</div>'}

/* ===== 직업: 특성 칸 (게임 특성 창처럼 3개 트리, 칸·선행 화살표) ===== */
const TICO=n=>/^\d+$/.test(String(n))?'https://forg.gg/wow/forever/icons/'+n+'.jpg':ICO(n);
/* 직접 찍기: 트리 포인트 5개마다 다음 줄, 선행 특성, 최대 51 */
function talOk(C,M){const T=C.talents;for(const k in M){const r=M[k];if(!r)continue;const v=T[k];if(!v)return false;if(r>v[2])return false;
    const low=Object.keys(M).filter(j=>T[j]&&T[j][1]===v[1]&&T[j][5]<v[5]).reduce((a,j)=>a+M[j],0);if(low<(v[5]-1)*5)return false;
    if(v[7]&&(M[v[7][0]]||0)<v[7][1])return false}
  return Object.values(M).reduce((a,x)=>a+x,0)<=51}
function talCan(C,M,k){const v=C.talents[k];const r=M[k]||0;if(r>=v[2])return false;const N=Object.assign({},M);N[k]=r+1;return talOk(C,N)}
function talGrid(c,C,sp,L){const st=sp.steps.filter(s=>s[0]<=60);const GM=c.tal&&(c.tal.src==='game'||c.tal.src==='armory')&&c.tal.cls===c.cls;const ME=ui.tlv==='me'||(ui.tlv==null&&GM);const V=ui.tlv==='60'?60:L;
  const rk=lv=>{const m={};st.forEach(s=>{if(s[0]<=lv)m[s[1]]=Math.max(m[s[1]]||0,s[2])});return m};
  const M=(c.tal=c.tal&&c.tal.cls===c.cls?c.tal:{cls:c.cls,r:{}}).r;
  const R=ME?M:rk(V),F=ME?M:rk(60);const used=Object.values(M).reduce((a,x)=>a+x,0);
  const T=Object.entries(C.talents);const pts=t=>T.filter(([k,v])=>v[1]===t).reduce((a,[k])=>a+(R[k]||0),0);
  const finPts=t=>T.filter(([k,v])=>v[1]===t).reduce((a,[k])=>a+(F[k]||0),0);
  let main=ui.ttree;if(!C.trees.includes(main))main=C.trees.slice().sort((a,b)=>finPts(b)-finPts(a))[0];
  const P=58,CS=44,O=7;const nowIds=ME?new Set():new Set(st.filter(s=>s[0]>=L&&s[0]<=L+1).map(s=>s[1]));
  let h='<div class="card talsum"><h3>🌳 '+esc(sp.name)+' 특성</h3>'
    +(ME&&GM?(()=>{const g=rk(L);const ks=new Set([...Object.keys(g),...Object.keys(M)]);const df=[...ks].filter(k=>(g[k]||0)!==(M[k]||0)).length;return '<p class="tgame">'+(c.tal.src==='armory'?'⚔️ <b>전투정보실에서 불러온 내 특성</b> · ':'🎮 <b>게임에서 불러온 내 특성</b> · ')+used+'점'+(c.tal.at?' · '+((d=>(d.getMonth()+1)+'/'+d.getDate())(new Date(c.tal.at)))+' 불러옴':'')+'<br><small>'+(df?'가이드(Lv '+L+')와 다른 칸 <b>'+df+'개</b> · 「지금 Lv '+L+'」 버튼으로 비교해 보세요':'가이드와 똑같이 찍었어요 ✓')+' · 칸을 누르면 고칠 수 있어요</small></p>'})()
     :ME?'<p class="note">칸을 누르면 1포인트씩 찍혀요 · 쓴 포인트 <b>'+used+'</b>/51 · 필요 레벨 <b>'+(used?used+9:'-')+'</b>'+(used>Math.max(0,L-9)?' <span class="warn">(지금 Lv '+L+'보다 높아요)</span>':'')+'</p>'
      :'<p class="note">레벨 '+V+' · 특성 포인트 <b>'+Math.max(0,V-9)+'개</b>'+(V<10?' (10레벨부터 1개씩 생겨요)':'')+' · 가이드대로 찍은 모습'+(V!==L?' <span class="mute">(지금은 Lv '+L+')</span>':'')+'</p>')
    +'<div class="chips seg tlv"><button class="chip'+(!ME&&V===L?' on':'')+'" data-a="tlv" data-k="now">지금 Lv '+L+'</button><button class="chip'+(!ME&&V===60?' on':'')+'" data-a="tlv" data-k="60">60 완성</button><button class="chip'+(ME?' on':'')+'" data-a="tlv" data-k="me">'+(GM?'🎮 내 특성':'✏️ 직접 찍기')+'</button></div>'
    +(ME?'<div class="tcbtn"><button class="btn sm ghost" data-a="tfill" data-k="'+L+'">가이드대로 Lv '+L+'까지 채우기</button><button class="btn sm ghost" data-a="tfill" data-k="60">가이드 60 완성으로</button><button class="btn sm ghost" data-a="tclr">모두 지우기</button></div>':'')
    +'<div class="chips seg ttabs">'+C.trees.map((t,i)=>'<button class="chip'+(t===main?' on':'')+'" data-a="ttree" data-k="'+esc(t)+'"><img src="'+TICO(C.tic&&C.tic[i])+'" alt="" onerror="this.remove()">'+esc(t)+' <b>'+pts(t)+'</b></button>').join('')+'</div>';
  h+='<div class="tgr">'+C.trees.map((t,i)=>{const L2=T.filter(([k,v])=>v[1]===t&&v[5]);if(!L2.length)return '';const rows=Math.max(7,...L2.map(([k,v])=>v[5]));const W=4*P,H=rows*P;const pos={};L2.forEach(([k,v])=>pos[k]=v);
    let svg='';L2.forEach(([k,v])=>{const q=v[7];if(!q||!pos[q[0]])return;const s0=pos[q[0]];const on=(R[q[0]]||0)>=q[1];const col=on?'#e8c06a':'#6b6457';
      const x1=(s0[6]-1)*P+O+CS/2,y1=(s0[5]-1)*P+O+CS/2,x2=(v[6]-1)*P+O+CS/2,y2=(v[5]-1)*P+O+CS/2;let d,hd;
      if(s0[6]===v[6]){d='M'+x1+' '+(y1+CS/2)+'V'+(y2-CS/2-6);hd=[x2,y2-CS/2,'v']}
      else if(s0[5]===v[5]){const dir=x2>x1?1:-1;d='M'+(x1+dir*CS/2)+' '+y1+'H'+(x2-dir*(CS/2+6));hd=[x2-dir*CS/2,y2,dir>0?'r':'l']}
      else{const dir=x2>x1?1:-1;d='M'+(x1+dir*CS/2)+' '+y1+'H'+x2+'V'+(y2-CS/2-6);hd=[x2,y2-CS/2,'v']}
      const [hx,hy,o]=hd;const tri=o==='v'?[hx-6,hy-8,hx+6,hy-8,hx,hy]:o==='r'?[hx-8,hy-6,hx-8,hy+6,hx,hy]:[hx+8,hy-6,hx+8,hy+6,hx,hy];
      svg+='<path d="'+d+'" stroke="'+col+'" stroke-width="3" fill="none"/><polygon points="'+tri.join(',')+'" fill="'+col+'"/>'});
    let cells=L2.map(([k,v])=>{const r=R[k]||0,f=F[k]||0;const cls=(r?' has':'')+(r>=v[2]?' max':'')+(!ME&&f>r?' plan':'')+(ME&&!r&&talCan(C,M,k)?' av':'')+(V===L&&nowIds.has(k)?' now':'')+(ui.tsel===k?' sel':'');
      return '<button class="tcl'+cls+'" style="left:'+((v[6]-1)*P+O)+'px;top:'+((v[5]-1)*P+O)+'px" data-a="'+(ME?'tadd':'tsel')+'" data-k="'+esc(k)+'" title=""'+esc(v[0])+'"><img src="'+TICO(v[3])+'" alt="" loading="lazy" onerror="this.style.visibility=\'hidden\'"><span class="trk">'+r+'/'+v[2]+'</span></button>'}).join('');
    let info='';const sel=ui.tsel&&pos[ui.tsel]?ui.tsel:null;
    if(sel){const v=C.talents[sel];const lvs=st.filter(s=>s[1]===sel).map(s=>s[0]);const q=v[7]&&C.talents[v[7][0]];
      info='<div class="tinfo"><div class="tih"><img src="'+TICO(v[3])+'" alt=""><b>'+esc(v[0])+'</b><span class="rk">'+(R[sel]||0)+'/'+v[2]+'</span><button class="x" data-a="tsel" data-k="">✕</button></div>'+(v[4]?'<p>'+esc(v[4])+'</p>':'')
        +(q?'<p class="mute">선행: '+esc(q[0])+' '+v[7][1]+'포인트</p>':'')
        +(ME?'<div class="tpm"><button class="btn sm ghost" data-a="tsub" data-k="'+esc(sel)+'">− 빼기</button><b>'+(R[sel]||0)+'/'+v[2]+'</b><button class="btn sm" data-a="tadd" data-k="'+esc(sel)+'">+ 찍기</button></div>':'')+'<p class="tlvs">'+(lvs.length?'📌 가이드: Lv '+lvs.join(', ')+'에 찍어요'+(lvs.every(x=>x<=L)?' · 다 찍음 ✓':''):'가이드에서는 안 찍어요')+'</p></div>'}
    return '<div class="tt3'+(t===main?' main':'')+'"><div class="tth"><img src="'+TICO(C.tic&&C.tic[i])+'" alt="" onerror="this.remove()"><b>'+esc(t)+'</b><span class="tp">'+pts(t)+'</span></div><div class="tbox" style="width:'+W+'px;height:'+H+'px"><svg width="'+W+'" height="'+H+'">'+svg+'</svg>'+cells+'</div>'+info+'</div>'}).join('')+'</div>';
  h+=ME?'<p class="legend"><span class="lg has"></span>찍음 <span class="lg max"></span>다 찍음 <span class="lg av"></span>지금 찍을 수 있음 · 빼려면 칸을 누른 뒤 아래 「− 빼기」</p>'
    :'<p class="legend"><span class="lg has"></span>찍음 <span class="lg max"></span>다 찍음 <span class="lg plan"></span>나중에 찍을 것'+(V===L?' <span class="lg now"></span>이번 레벨':'')+' · 칸을 누르면 설명</p>';
  return h+'</div>'}
/* ===== 직업: 특성 ===== */
function talView(c,C,sp,L){const pts=Math.max(0,L-9);const st=sp.steps.filter(s=>s[0]<=60);
  const by=lv=>{const m={};st.filter(s=>s[0]<=lv).forEach(s=>{const t=C.talents[s[1]];if(t)m[t[1]]=(m[t[1]]||0)+1});return m};
  const now=by(L),fin=by(60);
  const row=(s,big,rep)=>{const t=C.talents[s[1]]||[s[1],'',1,'',''];const st_=s[0]<L?'done':s[0]===L?'now':'soon';
    return '<div class="tr2 '+st_+(big?' big':'')+'"><span class="lvb '+lvCls(s[0],L)+'">'+s[0]+'</span><span class="m"><span class="l1"><b>'+esc(t[0])+'</b><span class="rk">'+s[2]+'/'+t[2]+'</span><span class="tt">'+esc(t[1])+'</span>'+(st_==='done'?'<span class="ok">✓</span>':st_==='now'?'<span class="nw">지금</span>':'')+'</span>'+(t[4]&&!rep?'<span class="d">'+esc(t[4])+'</span>':'')+'</span></div>'};
  const rows=(a,big)=>a.map((s,i)=>row(s,big,i>0&&a[i-1][1]===s[1])).join('');
  let h=talGrid(c,C,sp,L);
  const cur=st.filter(s=>s[0]>=L-1&&s[0]<=L+3);
  if(L>=9&&cur.length)h+='<div class="card"><h3>📌 지금 찍을 특성</h3>'+rows(cur,1)+'</div>';
  const grp={};st.forEach(s=>{const k=Math.floor(s[0]/10)*10;(grp[k]=grp[k]||[]).push(s)});
  h+='<div class="card"><h3>📜 10~60 레벨별 순서</h3>'+Object.entries(grp).map(([k,arr])=>{const open=L>=+k&&L<+k+10;return '<details class="tg"'+(open?' open':'')+'><summary><b>'+(+k>=60?'60레벨':k+'~'+(+k+9)+'레벨')+'</b><span class="mute">'+arr.length+'개'+(arr.every(s=>s[0]<L)?' · 다 찍음 ✓':'')+'</span></summary>'+rows(arr,0)+'</details>'}).join('')
   +'<p class="note"><a href="https://forg.gg/forever/classes/'+c.cls+'?spec='+sp.id+'" target="_blank" rel="noopener">forg.gg에서 특성 트리로 보기 ↗</a></p></div>';
  return h}
/* ===== 직업: 기술 습득 (교관 다녀온 레벨 기준) ===== */
function learnView(c,C,L){if(!WLD)wldLoad();const R=rotSet(specOf(c));const ls=C.learns.filter(l=>(!l[4]||l[4]==='alliance')&&(!l[7]||l[7]===c.race));const from=c.trn!=null?c.trn:L-2;
  const todo=ls.filter(l=>l[0]>from&&l[0]<=L);const T=(WLD&&WLD.tr[c.cls])||[];const S=routeOf(c).find(S=>L>=S.a&&L<=S.b);const zs=S?S.z.split(' · '):[];
  const t=T.find(x=>zs.includes(x[1]))||T.find(x=>x[1]===CAPITAL[c.race])||T[0];
  let h='<div class="card lnow'+(todo.length?'':' ok')+'"><h3>'+(todo.length?'🧑‍🏫 교관에게 배울 기술 '+todo.length+'개':'✅ 지금 배울 기술은 다 배웠어요')+'</h3>'
   +(todo.length?groupBy(todo,l=>l[0]).map(([lv,arr])=>skRow(lv,arr,L,R,'now')).join(''):'')
   +(t?'<p class="note">📍 가까운 교관: <b>'+esc(t[0])+'</b> · '+esc(t[1])+' '+xyTxt(t[2])+'</p>':'')
   +(todo.length?'<button class="btn sm" data-a="trn">교관 다녀왔어요 ✓</button>':'<p class="mute">'+(c.trn!=null?c.trn+'레벨에 교관에 다녀왔다고 표시돼 있어요.':'')+'</p>')+'</div>';
  const G=groupBy(ls,l=>l[0]);const nextG=G.filter(([lv])=>lv>L).slice(0,3);const doneG=G.filter(([lv])=>lv<=from);
  const nextNew=G.find(([lv,arr])=>lv>L&&arr.some(l=>l[3]));
  h+='<div class="card"><h3>📅 앞으로 배울 기술</h3>'
   +(nextNew?'<p class="sknext">✨ 다음 새 기술: <b>'+nextNew[0]+'레벨</b> '+esc(nextNew[1].filter(l=>l[3]).map(l=>l[1]).join(', '))+'</p>':'')
   +(nextG.length?nextG.map(([lv,arr])=>skRow(lv,arr,L,R)).join(''):'<p class="note">더 배울 기술이 없어요.</p>')
   +'<p class="note">랭크 올리기는 교관에서 전부 배우면 돼요 · <span class="myk">금테</span> = 내 운영에 쓰는 기술</p>'
   +(doneG.length?'<details class="fold"><summary>✓ 지난 레벨에 배운 기술</summary>'+doneG.slice().reverse().map(([lv,arr])=>skRow(lv,arr,L,R,'done')).join('')+'</details>':'')
   +'<details class="fold"><summary>1~60 전체 보기</summary>'+G.map(([lv,arr])=>skRow(lv,arr,L,R)).join('')+'</details></div>';
  return h}
/* 기술 한 레벨 줄: 새 기술은 크게(아이콘+이름), 랭크 올리기는 「랭크↑ N개」+아이콘만 — 누르면 이름 펼침. 내 운영에 쓰는 기술은 금테 */
function rotSet(sp){if(!sp)return new Set();const t=[].concat(sp.rot||[],sp.early||[],sp.late||[]).map(r=>r[1]).join(' ');return new Set([...t.matchAll(/\[([^\]@*]+)/g)].map(m=>m[1].trim()))}
function skRow(lv,arr,L,R,cls){const nw=arr.filter(l=>l[3]),rk=arr.filter(l=>!l[3]);const dim=lv>L;ui.skx=ui.skx||{};const op=!!ui.skx[lv];
  rk.sort((a,b)=>(R.has(b[1])?1:0)-(R.has(a[1])?1:0));const mine=rk.filter(l=>R.has(l[1])).length;
  return '<div class="sk2 '+(cls||'')+(dim?' later':'')+'"><span class="lvb '+lvCls(lv,L)+'">'+lv+'</span><div class="m">'
   +nw.map(l=>'<span class="skn'+(R.has(l[1])?' my':'')+'">'+(l[5]?'<span class="ic" style="background-image:url('+ICO(l[5])+')"></span>':'')+'<b>'+esc(l[1])+'</b><small>새 기술</small></span>').join('')
   +(rk.length?'<button class="skr'+(op?' on':'')+'" data-a="skx" data-k="'+lv+'"><span class="skl">랭크↑ '+rk.length+'개'+(mine?' · 내 기술 '+mine:'')+'</span><span class="ics">'+rk.slice(0,window.innerWidth<400?3:5).map(l=>'<span class="ic'+(R.has(l[1])?' my':'')+'" style="background-image:url('+ICO(l[5]||'inv_misc_questionmark')+')"></span>').join('')+(rk.length>(window.innerWidth<400?3:5)?'<em>+'+(rk.length-(window.innerWidth<400?3:5))+'</em>':'')+'</span><span class="cv">'+(op?'⌃':'⌄')+'</span></button>'
     +(op?'<div class="skrl">'+rk.map(l=>'<span'+(R.has(l[1])?' class="my"':'')+'>'+esc(l[1])+' <small>'+l[2]+'</small></span>').join('')+'</div>':''):'')
   +'</div></div>'}
function profView(c){const sel=PROFS.find(p=>p.id===ui.pf)||PROFS[0];
  let h='<div class="kprof">'+PGRP.map(([g,ids])=>'<div class="kpg"><span class="kpl">'+g+'</span><div class="kpb">'+ids.map(id=>PROFS.find(p=>p.id===id)).filter(Boolean).map(p=>'<button class="'+(p===sel?'on':'')+'" data-a="pf" data-k="'+p.id+'">'+pIco(p.id)+esc(p.ko)+((c.profs||[]).includes(p.ko)?' ★':'')+'</button>').join('')+'</div></div>').join('')+'</div>';
  const myp=(c.profs||[]).includes(sel.ko);h+='<div class="card"><h3 class="pht">'+pIco(sel.id)+esc(sel.ko)+'<button class="btn sm '+(myp?'':'ghost')+' mypb" data-a="myprof" data-k="'+esc(sel.ko)+'">'+(myp?'★ 내 전문기술':'☆ 내 전문기술로')+'</button></h3>'+(sel.pair?'<p class="note">🤝 같이 하면 좋은 기술: <b>'+esc(sel.pair)+'</b></p>':'');
  h+='<div class="kranks">'+PROF_RANK.map(r=>'<span><b>'+r[0]+'</b>'+r[1]+'–'+r[2]+'<small>'+esc(r[3])+'</small></span>').join('')+'</div>';
  const myR=((c.profLv||{})[sel.ko]||[])[0];if(myR!=null)h+='<p class="pmy">내 숙련도 <b>'+myR+'</b> / '+(((c.profLv||{})[sel.ko]||[])[1]||'?')+' <small>게임에서 불러옴 · 지금 할 단계에 표시</small></p>';
  if(sel.steps)h+=sel.steps.map(s=>'<div class="pr2'+(myR!=null&&myR>=+s[0]&&myR<+s[1]?' now':'')+'"><span class="pl">'+s[0]+'<i>→</i>'+s[1]+'</span><span class="m"><span class="l1 pmk">'+pMade(s[2])+'<span class="cnt">'+esc(s[3])+'번</span>'+(s[5]?'<span class="nt">'+esc(s[5])+'</span>':'')+'</span><span class="pmats"><span class="pml">1번에</span>'+pMats(s[4])+'</span></span></div>').join('');
  if(sel.gather)h+=sel.gather.map((g,gi,GA)=>'<div class="pr2'+(myR!=null&&+g[0]<=myR&&!(GA[gi+1]&&+GA[gi+1][0]<=myR)?' now':'')+'"><span class="pl">'+g[0]+'</span><span class="m"><span class="l1"><b>'+esc(g[1])+'</b></span><span class="rg">'+esc(g[2])+'</span></span></div>').join('');
  if(sel.tips)h+='<h3>💡 팁</h3>'+sel.tips.map(t=>'<p class="note">• '+esc(t)+'</p>').join('');
  return h+'<p class="note"><a href="'+esc(sel.src)+'" target="_blank" rel="noopener">원본 가이드 ↗</a></p></div>'}

/* ===================== 캐릭터 관리 시트 ===================== */
/* ===== 🧩 게임에서 불러오기 (애드온 코드 붙여넣기) ===== */
/* 애드온 코드: WFH1(퀘스트만) / WFH2(+ 진행도 · 장비 · 전문기술 · 특성 · 경험치) 둘 다 읽어요 */
const GSTAT={STRENGTH:'str',AGILITY:'agi',STAMINA:'sta',INTELLECT:'int',SPIRIT:'spi',ATTACK_POWER:'ap',RANGED_ATTACK_POWER:'ap',SPELL_POWER:'sp',SPELL_DAMAGE_DONE:'sp',SPELL_HEALING_DONE:'heal',MANA_REGENERATION:'mp5',POWER_REGEN0:'mp5',DEFENSE_SKILL_RATING:'def',BLOCK_VALUE:'block',DAMAGE_PER_SECOND:'dps'};
const INV_SLOT={1:'head',2:'neck',3:'shoulder',15:'back',5:'chest',9:'wrist',10:'hands',6:'waist',7:'legs',8:'feet',11:'ring1',12:'ring2',13:'trink1',14:'trink2',16:'main',17:'off',18:'ranged'};
/* 애드온 무기 숙련 이름 → 무기 종류 번호 (한글·영어, 띄어쓰기 없이 와요) */
function wskCs(n){n=String(n||'');const two=/양손|Two-?Handed/i.test(n);const R=[[/석궁|Crossbow/i,18],[/마법봉|Wand/i,19],[/투척|Thrown/i,16],[/단검|Dagger/i,15],[/장착|Fist/i,13],[/지팡이|Stav|Staff/i,10],[/장창|Polearm/i,6],[/총|Gun/i,3],[/활|Bow/i,2],[/도끼|Axe/i,two?1:0],[/둔기|Mace/i,two?5:4],[/검|Sword/i,two?8:7]];
  for(const [r,v] of R)if(r.test(n))return v;return null}
function impParse(txt){const m=(txt||'').match(/WFH([12]);/);if(!m)return null;const ver=+m[1];
  /* 서버 이름에 띄어쓰기가 있을 수 있어서(예: CAMWOW KR 서버 1 PvE) 칸(;)으로 먼저 나누고, 숫자 부분만 공백·줄바꿈을 지움 */
  const f=txt.slice(m.index).split(';').map(x=>x.trim());if(f.length<9)return null;
  const sec={};f.slice(7).forEach(x=>{const y=x.replace(/\s+/g,'');const k=y.match(/^([A-Z]):/);if(!k)return;let v=y.slice(2);if('DLEKBTXSGU'.includes(k[1]))v=v.replace(/[^0-9a-zA-Z.*:,~\-].*$/,'');sec[k[1]]=v});
  const d=[];let cur=0;(sec.D||'').split('.').filter(Boolean).forEach(x=>{if(x[0]==='~'){const n=parseInt(x.slice(1),36)||0;for(let k=0;k<n;k++){cur+=1;d.push(cur)}return}const v=parseInt(x,36);if(!isNaN(v)){cur+=v;d.push(cur)}});
  const l=(sec.L||'').split('.').filter(Boolean).map(x=>{const [a,ob]=x.split(':');const id=parseInt(a.replace('*',''),36);
    return {id,done:a.endsWith('*'),obj:ob?ob.split(',').map(o=>o.split('-').map(Number)).filter(o=>o.length===2&&!isNaN(o[1])):[]}}).filter(x=>!isNaN(x.id));
  const eq=(sec.E||'').split('.').filter(Boolean).map(x=>{const [sl,id]=x.split('-');return [INV_SLOT[+sl],parseInt(id,36)]}).filter(x=>x[0]&&x[1]>0);
  const pf=(sec.P||'').split('.').filter(Boolean).map(x=>{const a=x.split('-');return [a[0],+a[1]||0,+a[2]||0]}).filter(x=>x[0]);
  /* v3.5: 게임이 읽은 착용 장비 능력치(값×10) · 무작위 옵션 이름(띄어쓰기는 _) */
  const eqv=sec.V==null?null:{};(sec.V||'').split('.').filter(Boolean).forEach(x=>{const [sl,id,nm,ss]=x.split('~');const s=INV_SLOT[+sl];const n=parseInt(id,36);if(!s||!(n>0))return;const st={};(ss||'').split(',').forEach(p=>{const [k,v]=p.split(':');const m=GSTAT[k];if(m&&+v)st[m]=+((st[m]||0)+ +v/10).toFixed(2)});eqv[s]={id:n,nm:(nm||'').replace(/_/g,' '),st}});
  const tl=sec.T?sec.T.split('-').map(Number).filter(x=>!isNaN(x)):[];
  const tu=(sec.U||'').split('.').filter(Boolean).map(x=>{const a=x.split('-');return {t:+a[0],r:+a[1],c:+a[2],k:+a[3],ic:a[4]&&a[4]!=='0'?parseInt(a[4],36):0}}).filter(x=>x.t>0&&x.r>0&&x.k>0);
  const xp=sec.X?sec.X.split('-').map(Number):null;
  const items=t=>{const o={};(t||'').split('.').filter(Boolean).forEach(x=>{const [a,b]=x.split('-');const id=parseInt(a,36);if(id>0)o[id]=(o[id]||0)+(+b||1)});return o};
  const S=sec.S?sec.S.split('-').map(Number):null;
  const rp=(sec.R||'').split('.').filter(Boolean).map(x=>{const a=x.split('-');return {id:+a[0]||0,st:+a[1]||0,val:+a[2]||0,nm:(a.slice(3).join('-')||'').replace(/_/g,' ')}}).filter(r=>r.nm&&r.st);
  const ws=(sec.W||'').split(',').filter(Boolean).map(x=>{const a=x.split(':');return [wskCs(a[0]),+a[1]||0,+a[2]||0,a[0]]}).filter(x=>x[0]!=null);
  const al=(sec.A||'').split('.').filter(Boolean).map(x=>{const a=x.split('-');return {name:a[0],cls:(a[1]||'').toLowerCase(),lv:+a[2]||1,race:(a[3]||'').toLowerCase()}}).filter(a=>a.name&&CINFO[a.cls]);
  /* v3.4: 게임이 알려 준 퀘스트 위치(Q) · 동굴 입구(N) · 받은/반납한 자리(O) · 지도 번호=이름(M). 좌표는 천분율(412 = 41.2%) */
  const MN={};(sec.M||'').split('^').filter(Boolean).forEach(x=>{const i=x.indexOf('=');if(i>0)MN[x.slice(0,i)]=x.slice(i+1).replace(/_/g,' ')});
  const gp=t=>{const a=(t||'').split(',');if(a.length<3||!MN[a[0]])return null;const x=+a[1]/10,y=+a[2]/10;return x>0&&x<100&&y>0&&y<100?[zn(MN[a[0]]),+x.toFixed(1),+y.toFixed(1)]:null};
  const gq=(sec.Q||'').split('.').filter(Boolean).map(e=>{const a=e.split('-');return {id:parseInt(a[0],36),ph:a[1]==='t'?'t':'o',o:gp(a[2]),w:gp(a[3]),t:(a[4]||'').replace(/_/g,' ')}}).filter(x=>x.id>0&&(x.o||x.w));
  const ent=(sec.N||'').split('.').filter(Boolean).map(e=>{const i=e.indexOf('-');if(i<0)return null;const p=gp(e.slice(0,i));const c=+(e.slice(0,i).split(',')[3])||1;return p?{z:p[0],x:p[1],y:p[2],c,n:e.slice(i+1).replace(/_/g,' ')}:null}).filter(Boolean);
  const obs=(sec.O||'').split('.').filter(Boolean).map(e=>{const a=e.split('-');const id=parseInt(a[0],36);const p=gp(a[2]);return id>0&&p&&(a[1]==='g'||a[1]==='r')?{id,k:a[1],p}:null}).filter(Boolean);
  /* v3.8: Y = 퀘스트를 받을 수 있었던 레벨(번호36-레벨) · J = 목표 진행도가 오른 자리(번호36-목표순서-지도,x,y-…) */
  const qlv={};(sec.Y||'').split('.').filter(Boolean).forEach(e=>{const a=e.split('-');const id=parseInt(a[0],36),lv=+a[1];if(id>0&&lv>0&&lv<=60)qlv[id]=Math.min(qlv[id]||99,lv)});
  const qop=(sec.J||'').split('.').filter(Boolean).map(e=>{const a=e.split('-');const id=parseInt(a[0],36),j=+a[1];const pts=a.slice(2).map(gp).filter(Boolean);return id>0&&j>0&&pts.length?{id,j,pts}:null}).filter(Boolean);
  return {ver:sec.S||sec.B||sec.R?3:ver,name:f[1],realm:f[2],cls:(f[3]||'').toLowerCase(),lv:+f[4]||0,race:(f[5]||'').toLowerCase(),fac:f[6],done:d,log:l,eq,eqv,pf,tl,tu,xp:xp&&xp.length>=2&&xp[1]>0?{cur:xp[0],max:xp[1],rest:xp[2]||0}:null,
    sess:S&&S.length>=4?{xp:S[0],secs:S[1],hx:S[2],hs:S[3]}:null,gold:sec.G?+sec.G:null,bag:sec.B!=null?items(sec.B):null,bank:sec.K?items(sec.K):null,rep:rp,alts:al,wsk:sec.W!=null?ws:null,taxi:sec.F!=null?sec.F.split('^').filter(Boolean):null,gq,ent,obs,qlv,qop}}
/* 특성 칸 순서 → 앱 특성 (드루이드는 야성이 둘이라 지금 고른 쪽 유지) */
/* 게임 특성(트리-줄-칸-랭크-아이콘) → 앱 특성 번호. 줄·칸이 같은 칸, 없으면 같은 트리에서 아이콘이 같은 칸 */
function impTal(cls,tu){const C=D_CLS[cls];if(!C||!tu||!tu.length)return null;const T=Object.entries(C.talents);const M={};let miss=0;
  tu.forEach(x=>{const tree=C.trees[x.t-1];let e=T.find(([k,v])=>v[1]===tree&&v[5]===x.r&&v[6]===x.c);if(!e&&x.ic)e=T.find(([k,v])=>v[1]===tree&&String(v[3])===String(x.ic));if(!e){miss++;return}M[e[0]]=Math.min(e[1][2],x.k)});
  return {r:M,miss,n:Object.values(M).reduce((a,b)=>a+b,0)}}
function impSpec(c,P){if(!P.tl||!P.tl.length)return null;const tot=P.tl.reduce((a,b)=>a+b,0);if(tot<10)return null;const i=P.tl.indexOf(Math.max(...P.tl));const C=D_CLS[c.cls];if(!C)return null;
  if(c.cls==='druid'){if(i===1)return /^feral/.test(c.spec)?c.spec:'feral-cat';return [C.specs[0].id,null,C.specs[3]&&C.specs[3].id][i]||null}
  return C.specs[i]?C.specs[i].id:null}
function impPreview(c){const P=ui.imp;if(!P)return ui.impraw?'<p class="note warn">코드를 못 읽었어요. 게임 창의 글자를 처음부터 끝까지 다 복사했는지 봐 주세요 (WFH1; 또는 WFH2; 로 시작해요).</p>':'';
  const known=P.done.filter(id=>QDB&&QDB.has(id)).length;const ld=P.log.filter(x=>x.done).length;const nObj=P.log.reduce((n,x)=>n+x.obj.length,0);
  const eqK=P.eq.filter(([s,id])=>IT.has(id)).length;const sp=impSpec(c,P);const spN=sp&&(D_CLS[c.cls].specs.find(x=>x.id===sp)||{}).name;
  if(ui.impEq==null)ui.impEq=true;if(ui.impSp==null)ui.impSp=true;
  return '<div class="impok"><b>'+esc(P.name)+'</b> · '+(CINFO[P.cls]?CINFO[P.cls][0]:esc(P.cls))+' '+P.lv+'레벨'+(P.realm?' · '+esc(P.realm):'')+(P.ver===1?' <span class="tag sm">옛 애드온</span>':'')
   +'<ul><li>끝낸 퀘스트 <b>'+P.done.length+'개</b>'+(QDB?' (앱 자료에 있는 것 '+known+'개)':'')+'</li><li>지금 퀘스트 목록 <b>'+P.log.length+'개</b>'+(ld?' · 다 해서 반납만 남은 것 '+ld+'개':'')+(nObj?' · 목표 진행도 '+nObj+'개':'')+'</li>'
   +(P.lv&&P.lv!==c.lv?'<li>레벨을 <b>'+c.lv+' → '+P.lv+'</b>로 맞춰요</li>':'')
   +(P.xp?'<li>경험치 <b>'+Math.round(P.xp.cur/P.xp.max*100)+'%</b>'+(P.xp.rest?' · 휴식 '+Math.round(P.xp.rest/P.xp.max*100)+'%':'')+'</li>':'')
   +(P.pf.length?'<li>전문기술 '+P.pf.map(p=>'<b>'+esc(p[0])+'</b> '+p[1]+'/'+p[2]).join(' · ')+'</li>':'')
   +(P.sess&&P.sess.hs>=600?'<li>사냥 기록 · 시간당 약 <b>'+Math.round(P.sess.hx/P.sess.hs*3600).toLocaleString()+'</b> 경험치</li>':'')
   +(P.gold!=null?'<li>골드 '+goldTxt(P.gold)+'</li>':'')
   +(P.bag?'<li>가방 '+Object.keys(P.bag).length+'종'+(P.bank?' · 은행 '+Object.keys(P.bank).length+'종':' · 은행은 게임에서 한 번 열어야 담겨요')+'</li>':'')
   +(P.rep.length?'<li>평판 '+P.rep.length+'개</li>':'')
   +(P.gq&&(P.gq.length||P.ent.length||P.obs.length)?'<li>게임이 알려 준 퀘스트 위치 <b>'+P.gq.length+'개</b>'+(P.ent.length?' · 동굴·광산 입구 <b>'+P.ent.length+'곳</b>':'')+(P.obs.length?' · 받은·반납한 자리 '+P.obs.length+'개':'')+'</li>':'')+'</ul>'
   +(P.alts.length?'<label class="impck"><input type="checkbox" data-c="impAlt"'+(ui.impAlt!==false?' checked':'')+'> 부캐 '+P.alts.length+'명도 앱에 넣기 <small>'+P.alts.map(a=>esc(a.name)+' '+a.lv).join(' · ')+' · 이미 있으면 레벨만 맞춰요</small></label>':'')
   +(P.eq.length?'<label class="impck"><input type="checkbox" data-c="impEq"'+(ui.impEq?' checked':'')+'> 장비 칸을 게임 장비로 바꾸기 <small>'+P.eq.length+'칸'+(eqK<P.eq.length?' · 앱 자료에 없는 '+(P.eq.length-eqK)+'개는 빼요':'')+'</small></label>':'')
   +(sp?'<label class="impck"><input type="checkbox" data-c="impSp"'+(ui.impSp?' checked':'')+'> 특성을 <b>'+esc(spN||sp)+'</b>(으)로 맞추기 <small>특성 '+P.tl.join('/')+(sp===c.spec?' · 지금과 같아요':'')+'</small></label>':'')
   +(()=>{const T=impTal(P.cls||c.cls,P.tu);return T&&T.n?'<label class="impck"><input type="checkbox" data-c="impTl"'+(ui.impTl!==false?' checked':'')+'> 찍은 특성 <b>'+T.n+'점</b>을 직업 탭 「내 특성」으로 불러오기'+(T.miss?' <small>앱 자료와 안 맞는 칸 '+T.miss+'개는 빼요</small>':'')+'</label>':(P.tl.length&&!P.tu.length?'<p class="note">애드온을 v3.3으로 바꾸면 찍은 특성 하나하나도 불러와요.</p>':'')})()
   +(P.cls&&P.cls!==c.cls?'<p class="warn">⚠ 지금 캐릭터('+CINFO[c.cls][0]+')와 직업이 달라요. 맞는 캐릭터를 골랐는지 확인해 주세요.</p>':'')
   +(P.ver===1?'<p class="note">새 애드온(v2)을 쓰면 퀘스트 진행도·장비·전문기술·특성·경험치도 같이 옮겨져요.</p>':'')
   +'<button class="btn full" data-a="impgo">이 캐릭터에 적용하기</button><p class="note">이미 체크한 건 그대로 두고, 끝낸 것만 더해요.</p></div>'}
/* 애드온 코드 적용 (붙여 넣기·PC 파일·자동 맞춤이 같이 씀) */
function impApply(c,P,o){o=o||{};const U={eq:o.eq!=null?o.eq:ui.impEq,sp:o.sp!=null?o.sp:ui.impSp,tl:o.tl!=null?o.tl:ui.impTl,alt:o.alt!=null?o.alt:ui.impAlt};
    c.mq=c.mq||{};c.dq=c.dq||{};let n=0;const dqIds=new Set(DGS.flatMap(d=>d.q.map(q=>+q.id)));P.done.forEach(id=>{if(!c.mq[id]){c.mq[id]=1;n++}if(dqIds.has(id))c.dq[id]=1});
    c.ql={};c.qp={};P.log.forEach(x=>{c.ql[x.id]=x.done?2:1;if(x.obj.length)c.qp[x.id]=x.obj});if(P.lv>0&&P.lv<=60)c.lv=P.lv;c.imported={t:Date.now(),n:P.done.length,v:P.ver};
    const extra=[];if(P.eq.length&&U.eq){const ne={};P.eq.forEach(([sl,id])=>{if(IT.has(id))ne[sl]=id});c.eq=ne;extra.push('장비 '+Object.keys(ne).length+'칸');
      if(P.eqv){c.eqv={};for(const sl in ne){const v=P.eqv[sl];if(v&&v.id===ne[sl]&&varDiff(IT.get(v.id),v.nm,v.st))c.eqv[sl]={id:v.id,nm:v.nm||undefined,st:v.st}}const nv=Object.keys(c.eqv).length;if(nv)extra.push('게임 능력치로 맞춘 장비 '+nv+'칸')}}
    if(U.sp){const sp=impSpec(c,P);if(sp&&sp!==c.spec){c.spec=sp;extra.push('특성')}}
    if(U.tl!==false){const T=impTal(c.cls,P.tu);if(T&&T.n){c.tal={cls:c.cls,r:T.r,src:'game',at:Date.now()};ui.tlv='me';extra.push('내 특성 '+T.n+'점')}}
    if(P.wsk){c.wsk={};P.wsk.forEach(w=>{c.wsk[w[0]]=[w[1],w[2]]});extra.push('무기 숙련 '+P.wsk.length+'개')}
    if(P.taxi&&P.taxi.length){c.taxi=P.taxi;extra.push('비행 경로 '+P.taxi.length+'곳')}
    if(P.gq&&P.gq.length){DB.gq=DB.gq||{};P.gq.forEach(x=>{DB.gq[x.id]={ph:x.ph,o:x.o,w:x.w,t:x.t,at:Date.now()}});extra.push('게임 퀘스트 위치 '+P.gq.length+'개')}
    if(P.ent&&P.ent.length){DB.ent=DB.ent||[];P.ent.forEach(e=>{const o=DB.ent.find(y=>y.z===e.z&&y.n===e.n&&Math.hypot(y.x-e.x,y.y-e.y)<4);if(o){o.c=Math.max(o.c||1,e.c)}else DB.ent.push(e)});if(DB.ent.length>400)DB.ent=DB.ent.slice(-400);extra.push('동굴 입구 '+P.ent.length+'곳')}
    if(P.obs&&P.obs.length){DB.gobs=DB.gobs||{};P.obs.forEach(o=>{(DB.gobs[o.id]=DB.gobs[o.id]||{})[o.k]=o.p})}
    if(P.qlv&&Object.keys(P.qlv).length){DB.gql=DB.gql||{};let n=0;for(const id in P.qlv){if(!(DB.gql[id]<=P.qlv[id])){DB.gql[id]=P.qlv[id];n++}}if(n)extra.push('받을 수 있었던 레벨 '+n+'개');gObsApply()}
    if(P.qop&&P.qop.length){DB.gjp=DB.gjp||{};P.qop.forEach(o=>{(DB.gjp[o.id]=DB.gjp[o.id]||{})[o.j]=o.pts.slice(0,3)});extra.push('목표 자리 '+P.qop.length+'개')}
    if(P.pf.length){const ok=new Set(PROFS.map(p=>p.ko));c.profLv={};P.pf.forEach(p=>{if(ok.has(p[0]))c.profLv[p[0]]=[p[1],p[2]]});c.profs=Object.keys(c.profLv);extra.push('전문기술 '+c.profs.length+'개')}
    if(P.xp){c.xp=Object.assign({lv:P.lv,t:Date.now()},P.xp);extra.push('경험치')}
    if(P.sess)c.sess=Object.assign({t:Date.now()},P.sess);if(P.gold!=null)c.gold=P.gold;if(P.bag)c.bag=P.bag;if(P.bank)c.bank=P.bank;if(P.rep.length){c.rep=P.rep;extra.push('평판')}
    if(P.alts.length&&U.alt!==false){let na=0,ua=0;P.alts.forEach(a=>{const x=DB.list.find(y=>y.name===a.name);if(x){if(x.lv!==a.lv){x.lv=a.lv;ua++}}else{DB.list.push({id:newId(),name:a.name,race:RACES.some(r=>r[0]===a.race)?a.race:c.race,cls:a.cls,spec:D_CLS[a.cls].specs[0].id,lv:a.lv,eq:{},fq:{},dq:{}});na++}});if(na||ua)extra.push('부캐 '+(na?na+'명 추가':'')+(na&&ua?' · ':'')+(ua?ua+'명 레벨':''))}
    
    jlAdd(c,P);
    return {n,extra}}
/* 📂 PC에서 애드온 저장 파일 바로 읽기 (크롬·엣지 PC: 폴더를 한 번 고르면 다음부터 버튼 하나)
   게임은 /reload·접속 종료 때 WTF/Account/계정/서버/캐릭터/SavedVariables/WowfHelper.lua 에 「last」 코드를 저장함 */
const FSA=typeof window.showDirectoryPicker==='function'&&!/Android|iPhone|iPad/i.test(navigator.userAgent);
function idbH(op,val){return new Promise(res=>{try{const r=indexedDB.open('wfh-fs',1);r.onupgradeneeded=()=>r.result.createObjectStore('h');
  r.onsuccess=()=>{try{const tx=r.result.transaction('h',op==='get'?'readonly':'readwrite');const st=tx.objectStore('h');const q=op==='get'?st.get('wtf'):op==='del'?st.delete('wtf'):st.put(val,'wtf');q.onsuccess=()=>res(q.result);q.onerror=()=>res(null)}catch(e){res(null)}};r.onerror=()=>res(null)}catch(e){res(null)}})}
const FS_SKIP=/^(Interface|Data|Cache|Logs|Errors|Screenshots|Fonts|Utils|WebCache|BlizzardBrowser.*|_retail_|_ptr_|_beta_|_xptr_|Textures|Movies|Sounds?)$/i;
function luaStr(t){return t.replace(/\\(\d{1,3}|.)/g,(m,e)=>/^\d/.test(e)?String.fromCharCode(+e):e==='n'?'\n':e==='t'?'\t':e)}
async function fsScan(root){const out=[];let seen=0;
  const walk=async(d,path,depth)=>{if(depth>7||seen>30000)return;for await(const [n,e] of d.entries()){seen++;
      if(e.kind==='directory'){if(!FS_SKIP.test(n))await walk(e,path.concat(n),depth+1)}
      else if(n==='WowfHelper.lua'&&path[path.length-1]==='SavedVariables'&&path.length>=3&&path[path.length-3]!=='Account'){const f=await e.getFile();const t=await f.text();
        const m=t.match(/\["last"\]\s*=\s*"((?:[^"\\]|\\[\s\S])*)"/);if(m){const code=luaStr(m[1]);if(/^WFH[12];/.test(code)){const F=code.split(';');out.push({name:F[1]||path[path.length-2].split('-')[0],realm:F[2]||'',code,t:f.lastModified,fh:e})}}}}};
  await walk(root,[root.name],0);return out.sort((a,b)=>b.t-a.t)}
async function fsLoad(repick,silent){try{let h=repick?null:await idbH('get');
    if(!h){h=await window.showDirectoryPicker({id:'wfh-wtf',mode:'read'});await idbH('put',h)}
    if(h.queryPermission&&(await h.queryPermission({mode:'read'}))!=='granted'&&(await h.requestPermission({mode:'read'}))!=='granted'){toast('폴더를 읽게 허락해 주세요');return}
    toast('애드온 파일 찾는 중…');const L=await fsScan(h);ui.fsList=L;ui.fsDir=h.name;
    if(!L.length){ui.sheet='imp';ui.fsMsg='「'+h.name+'」 폴더에서 애드온 저장 파일을 못 찾았어요. 내 PC의 와우 설치 폴더(배틀넷 앱 → 와우 → 톱니바퀴 → 「탐색기에서 보기」로 찾을 수 있어요)나 그 안의 WTF 폴더를 골라 주세요. 게임에서 /reload 를 한 번 해야 파일이 생겨요.';rerender(true);return}
    fsAutoSet(true);ui.fsNeed=false;
    const c=me();if(silent){await fsAuto(true);rerender(true);return}const nm=c&&(c.fsName||c.name);const i=Math.max(0,L.findIndex(x=>nm&&x.name===nm));fsPick(i)}
  catch(e){if(e&&e.name==='AbortError')return;toast('파일을 못 읽었어요: '+((e&&e.message)||e))}}
function fsPick(i){const x=(ui.fsList||[])[i];if(!x)return;ui.fsCur=i;ui.fsMsg='';ui.fsPickCode=x.code;ui.fsPickT=x.t;ui.sheet='imp';ui.impraw=x.code;ui.imp=impParse(x.code);if(!QDB)qdbLoad();rerender(true)}
/* 🔄 PC 자동 맞춤: 게임에서 /reload·접속 종료 → 브라우저로 돌아오면 저장 파일이 바뀌었는지 보고 저절로 불러옴 */
const fsAutoOn=()=>{try{return localStorage.getItem('wowf_fsauto')!=='0'}catch(e){return true}};
function fsAutoSet(v){try{localStorage.setItem('wowf_fsauto',v?'1':'0')}catch(e){}}
let fsBusy=false,fsLastChk=0;
async function fsAuto(force){if(!FSA||!fsAutoOn()||fsBusy)return;const c=me();if(!c||!(c.fsName||c.name)||ui.sheet==='imp')return;
  if(!force&&Date.now()-fsLastChk<2500)return;fsLastChk=Date.now();fsBusy=true;
  try{let L=ui.fsList;
    if(!L||!L.length){const h=await idbH('get');if(!h)return;
      const st=h.queryPermission?await h.queryPermission({mode:'read'}):'granted';
      if(st!=='granted'){if(!ui.fsNeed){ui.fsNeed=true;rerender(true)}return}
      L=await fsScan(h);ui.fsList=L;ui.fsDir=h.name}
    const nm=c.fsName||c.name;const x=L.find(y=>y.name===nm);if(!x||!x.fh)return;
    const f=await x.fh.getFile();if(f.lastModified<=(c.fsT||0))return;
    const t=await f.text();const m=t.match(/\["last"\]\s*=\s*"((?:[^"\\]|\\[\s\S])*)"/);if(!m)return;
    const code=luaStr(m[1]);x.code=code;x.t=f.lastModified;const P=impParse(code);if(!P||P.name!==nm){c.fsT=f.lastModified;return}
    const snap=JSON.stringify(DB);const lv0=c.lv;
    const r=impApply(c,P,{eq:true,sp:false});c.fsT=f.lastModified;save();rerender(true);
    const got=[];if(c.lv>lv0)got.push(c.lv+'레벨');if(r.n)got.push('끝낸 퀘스트 +'+r.n);got.push('퀘스트창 '+P.log.length+'개');
    toastUndo('🎮 게임 파일에서 맞췄어요 · '+got.join(' · '),()=>{const o=JSON.parse(snap);Object.keys(DB).forEach(k=>delete DB[k]);Object.assign(DB,o);save();rerender(true);toast('되돌렸어요')})}
  catch(e){}finally{fsBusy=false}}
function fsNeedBar(){return FSA&&ui.fsNeed&&fsAutoOn()?'<button class="fsneed" data-a="fsload" data-k="auto">🔄 게임 파일 자동 맞춤을 다시 켜려면 눌러 주세요 <small>브라우저를 새로 열면 한 번 허락이 필요해요</small></button>':''}
function fsBox(){if(!FSA)return '';const L=ui.fsList||[];let h='<div class="card fsimp"><h3>📂 PC에서 바로 불러오기 <small class="mute">크롬·엣지</small></h3>';
  h+='<p class="note">처음 한 번 <b>내 PC의 와우 설치 폴더</b>(보통 <b>C:\\Program Files (x86)\\World of Warcraft</b> · 다른 곳에 깔았으면 배틀넷 앱 → 와우 → 톱니바퀴 → 「탐색기에서 보기」)를 고르면, 다음부터는 버튼 하나로 불러와요. 계정·서버·캐릭터 폴더는 알아서 찾아요. 고른 폴더는 이 브라우저에만 기억돼요. 복사·붙여 넣기 필요 없어요. 게임에서 <code>/reload</code> 하거나 접속을 끝내면 새 내용이 저장돼요.</p>';
  h+='<div class="bkb"><button class="btn sm" data-a="fsload">📂 '+(L.length?'다시 읽기':'불러오기')+'</button>'+(ui.fsDir?'<button class="btn sm ghost" data-a="fsload" data-k="re">다른 폴더 고르기</button>':'')+'</div>';
  if(ui.fsDir||L.length)h+='<label class="impck"><input type="checkbox" data-c="fsauto"'+(fsAutoOn()?' checked':'')+'> 🔄 게임에서 돌아오면 자동으로 맞추기 <small>/reload·접속 종료 뒤 이 창으로 오면 저절로 불러와요 · 바로 「되돌리기」도 돼요</small></label>';
  if(ui.fsMsg)h+='<p class="note warn">'+esc(ui.fsMsg)+'</p>';
  if(L.length){const x=L[ui.fsCur||0];h+='<p class="note">「'+esc(ui.fsDir||'')+'」에서 <b>'+esc(x.name)+'</b> 파일을 읽었어요 · 게임이 저장한 때 '+new Date(x.t).toLocaleString('ko-KR')+(Date.now()-x.t>3*3600e3?' <b>(오래됐어요 · 게임에서 /reload)</b>':'')+'</p>';
    if(L.length>1)h+='<div class="chips wr">'+L.map((y,i)=>'<button class="chip'+(i===(ui.fsCur||0)?' on':'')+'" data-a="fspick" data-k="'+i+'">'+esc(y.name)+'</button>').join('')+'</div>'}
  return h+'</div>'}
function impSheet(c){let h='<div class="sh"><h2>🧩 게임에서 불러오기</h2><button class="x" data-a="close">✕</button></div>';
  h+='<p class="note">애드온으로 게임 안의 <b>끝낸 퀘스트 · 퀘스트 목록(진행도) · 장비 · 전문기술 · 특성 · 경험치</b>를 한 번에 옮겨요. 인터넷으로 보내는 건 없고, 게임에 뜬 글자를 직접 복사해서 붙여 넣는 방식이에요. PC에서 하는 게 편해요.</p>';
  h+='<ol class="imps"><li><b>애드온 받기</b> <a class="btn sm" href="addon/WowfHelper.zip" download>WowfHelper.zip 받기</a><br><small>압축을 풀어 나온 <b>WowfHelper</b> 폴더를 와우 포에버 설치 폴더의 <b>Interface/AddOns</b> 안에 넣어요. 캐릭터 고르는 화면의 「애드온」에 안 보이면 「오래된 애드온 불러오기」를 켜 주세요.</small></li>'
   +'<li><b>게임에서</b> 채팅창에 <code>/wfh</code> 입력 → 코드 창이 떠요 (이미 글자가 다 골라져 있어요)<br><small>잘 되는지 보려면 <code>/wfh 점검</code> → 담긴 개수가 채팅창에 나와요. 레벨업·퀘스트 반납 때 「앱 코드가 바뀌었어요」 알림도 떠요.</small></li><li><b>Ctrl+C</b>로 복사 → 아래 칸에 붙여 넣기</li></ol>';
  h+=fsBox();
  h+=addonOffHtml();
  h+='<textarea class="inp impta" rows="4" placeholder="여기에 붙여 넣기 (WFH2; 로 시작)" data-c="impta">'+esc(ui.impraw||'')+'</textarea><div id="impres">'+impPreview(c)+'</div>';
  if(c.imported)h+='<p class="note">마지막으로 불러온 때: '+new Date(c.imported.t).toLocaleString('ko-KR')+' · 끝낸 퀘스트 '+c.imported.n+'개</p>';
  return h}
function charsSheet(){const c=me();let h='<div class="sh"><h2>내 캐릭터</h2><button class="x" data-a="close">✕</button></div>';
  h+=DB.list.map(x=>{const sp=specOf(x);return '<div class="row">'+clsIcon(x.cls)+'<span class="m"><span class="nm" style="color:'+CINFO[x.cls][1]+'">'+esc(x.name||CINFO[x.cls][0])+(x.id===DB.cur?' <span class="tag gd">지금</span>':'')+'</span><span class="sub">'+esc((sp?sp.name+' ':'')+CINFO[x.cls][0])+' · 레벨 '+x.lv+'</span></span>'+(x.id===DB.cur?'':'<button class="btn sm" data-a="pick" data-k="'+x.id+'">이 캐릭터로</button>')+'</div>'}).join('');
  h+='<button class="btn full" style="margin-top:10px" data-a="add">＋ 부캐 추가</button>';
  if(c){h+='<h3>지금 캐릭터 고치기</h3><label class="flab">캐릭터 이름</label><input class="inp" maxlength="12" value="'+esc(c.name)+'" placeholder="비우면 「'+esc(CINFO[c.cls][0])+'」로 보여요" data-c="cname"><label class="flab">종족</label><div class="chips wr">'+RACES.map(r=>'<button class="chip'+(c.race===r[0]?' on':'')+'" data-a="crace" data-k="'+r[0]+'">'+r[1]+'</button>').join('')+'</div>';
    h+='<label class="flab">직업</label><div class="chips wr">'+CL.map(k=>'<button class="chip'+(c.cls===k?' on':'')+'" data-a="ccls" data-k="'+k+'">'+CINFO[k][0]+'</button>').join('')+'</div><p class="note">직업을 바꾸면 장비 칸이 비워져요.</p>';
    h+='<div class="card">'+armBox(c)+'</div>';
    /* (개발용 「최근 화면 이동 기록」은 정리함) */
    h+='<div class="card"><h3>🔠 글씨 크기</h3><p class="note">이 기기에서만 바뀌어요.</p><div class="chips wr">'+FS_OPT.map(o=>'<button class="chip'+(Math.abs(fsGet()-o[0])<.01?' on':'')+'" data-a="fs" data-k="'+o[0]+'" style="font-size:'+Math.round(13*o[0])+'px">'+o[1]+'</button>').join('')+'</div></div>';
    h+='<div class="card"><h3>🧩 게임에서 불러오기</h3><p class="note">애드온 코드를 붙여 넣으면 게임에서 끝낸 퀘스트가 한 번에 체크돼요.</p><div class="bkb"><button class="btn sm" data-a="imp">불러오기 열기</button>'+(FSA?'<button class="btn sm" data-a="fsload">📂 PC 파일에서 바로</button>':'')+'</div></div>';
    h+=syncBox();
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
/* 🧾 화면 이동 기록: 탭이 저절로 바뀌는 일이 생기면 원인을 볼 수 있게 (이 탭에만, 최근 30개) */
let NAVW='처음',NAVP=null;
function navLog(){const k=ui.tab+(ui.tab==='quest'?'/'+(ui.qmode||''):ui.tab==='dungeon'&&ui.dg?'/'+ui.dg:'');if(k===NAVP)return;
  try{const L=JSON.parse(sessionStorage.getItem('wfh_nav')||'[]');L.push([new Date().toTimeString().slice(0,8),NAVP||'-',k,NAVW]);sessionStorage.setItem('wfh_nav',JSON.stringify(L.slice(-30)));
    sessionStorage.setItem('wfh_view',JSON.stringify({tab:ui.tab,qmode:ui.qmode,dg:ui.dg}))}catch(e){}
  NAVP=k;NAVW='?'}
function render(){const app=$('#app');{const t=document.querySelector('.ttip');if(t)t.style.display='none'}const c=me();app.className='t-'+(c?ui.tab:'onb')+(ui.tab==='quest'?' q-'+(ui.qmode||'route'):'');if(ui._tin){app.className+=' tin-'+ui._tin;ui._tin=null}
  if(ui.onb||!c){if(!ui.onb)ui.onb={name:'',race:'',cls:'',spec:'',lv:1};setTabs(false);app.innerHTML=onboard()+(ui.sheet==='bkask'?'<div class="sheet-bg" data-a="bg"><div class="sheet"><div class="grab"></div>'+bkAskSheet()+'</div></div>':'');return}
  let v='';if(ui.tab==='home')v=home(c);else if(ui.tab==='gear')v=gear(dspView(c));else if(ui.tab==='quest')v=quest(c);else if(ui.tab==='dungeon')v=dungeon(c);else v=klass(c);
  app.innerHTML=hIco(topBar(c)+fsNeedBar()+v+'<p class="foot">자료: <a href="https://forg.gg/forever" target="_blank" rel="noopener">forg.gg</a> (와우헤드 포에버·Questie 정리) · 입력한 내용은 이 기기에만 저장돼요<br><span class="bld">사이트 업데이트 '+BUILD+'</span></p>'
    +(ui.sheet?'<div class="sheet-bg" data-a="bg"><div class="sheet"><div class="grab"></div>'+(ui.sheet==='chars'?charsSheet():ui.sheet==='imp'?impSheet(c):ui.sheet==='wfr'?wfrSheet(c):ui.sheet.startsWith('note:')?noteSheet(c,ui.sheet.slice(5)):ui.sheet==='bkask'?bkAskSheet():ui.sheet.startsWith('info:')?infoSheet(c,ui.sheet.slice(5)):ui.sheet.startsWith('q:')?questSheet(c,ui.sheet.slice(2)):ui.sheet.startsWith('dgend:')?dgEndSheet(c,ui.sheet.slice(6)):ui.sheet.startsWith('cmp:')?cmpSheet(c,ui.sheet.split(':')[1],ui.sheet.split(':')[2]):slotSheet(c,ui.sheet.slice(5)))+'</div></div>':''))
  setTabs(true);
  if(ui.side&&c)app.insertAdjacentHTML('beforeend','<div class="sidev">'+sideView(c)+'</div>');
  if(ui.tab==='quest'&&ui.qmode==='atlas')amInit();if(me()&&!ui.onb)navLog();fitsCheck();mmFix()}
/* 작은 지도: 가장자리 핀의 이름표가 칸 밖으로 잘리면 안쪽으로 밀기 */
function mmFix(){requestAnimationFrame(()=>document.querySelectorAll('.mm').forEach(m=>{const R=m.getBoundingClientRect();if(!R.width)return;m.querySelectorAll('.mmp b').forEach(b=>{b.style.transform='';const r=b.getBoundingClientRect();let d=0;if(r.right>R.right-4)d=R.right-4-r.right;else if(r.left<R.left+4)d=R.left+4-r.left;if(d)b.style.transform='translateX('+Math.round(d)+'px)'})}))}
document.addEventListener('toggle',()=>mmFix(),true);
function fitsCheck(){requestAnimationFrame(()=>{const d=document.documentElement;d.classList.toggle('fits',d.scrollHeight<=window.innerHeight+2)})}
addEventListener('resize',()=>fitsCheck());
/* iOS 사파리: 키보드가 닫히거나 내용이 짧아져 문서 끝보다 더 내려간 채로 남으면 아래 탭바가 화면 중간에 떠 있는 문제 → 스크롤을 끝에 맞추고 다시 그리게 함 */
function vpFix(){requestAnimationFrame(()=>{const d=document.documentElement;const max=Math.max(0,d.scrollHeight-window.innerHeight);if(window.scrollY>max)window.scrollTo(0,max);else window.scrollTo(window.scrollX,window.scrollY);const t=document.querySelector('.tabs');if(t){t.style.bottom='1px';requestAnimationFrame(()=>{t.style.bottom=''})}})}
addEventListener('focusout',e=>{if(e.target&&/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))setTimeout(vpFix,60)});
if(window.visualViewport)visualViewport.addEventListener('resize',()=>setTimeout(vpFix,60));
addEventListener('pageshow',vpFix);
/* 폰: 아래에서 올라온 창(시트)은 맨 위에서 아래로 끌어내리면 닫힘 */
{let d=null;
 document.addEventListener('touchstart',e=>{d=null;if(e.touches.length!==1||window.innerWidth>=1000)return;const sh=e.target.closest&&e.target.closest('.sheet');if(!sh||sh.scrollTop>2)return;
   if(e.target.closest('input,textarea,select,[data-swslot] .tgr'))return;d={sh,y:e.touches[0].clientY,x:e.touches[0].clientX,t:Date.now(),dy:0,on:false}},{passive:true});
 document.addEventListener('touchmove',e=>{if(!d)return;const t=e.touches[0];const dy=t.clientY-d.y,dx=t.clientX-d.x;
   if(!d.on){if(dy>10&&dy>Math.abs(dx)*1.3&&d.sh.scrollTop<=2){d.on=true;d.sh.style.transition='none'}else if(Math.abs(dx)>10||dy<-6){d=null;return}else return}
   e.preventDefault();d.dy=Math.max(0,dy);d.sh.style.transform='translateY('+d.dy+'px)'},{passive:false});
 document.addEventListener('touchend',()=>{if(!d)return;const o=d;d=null;if(!o.on)return;const v=o.dy/Math.max(1,Date.now()-o.t);o.sh.style.transition='transform .18s ease-out';
   if(o.dy>110||(o.dy>45&&v>.5)){o.sh.style.transform='translateY(100%)';setTimeout(()=>{ui.sheet=null;ui.delAsk=0;rerender(true)},170)}else o.sh.style.transform=''},{passive:true})}
/* 폰: 화면을 좌우로 밀어 옆 탭으로 (지도·가로로 넘기는 줄·창 안에서는 안 함) */
{let sx=0,sy=0,st=0,ok=false;
 const blocked=el=>{for(let e=el;e&&e!==document.body;e=e.parentElement){if(e.matches&&e.matches('input,textarea,select,.sheet,.sheet-bg,.spanel,.gmap,.amap,.mapw,.rmap2,.dchips,.chips,.tgr,.tg,.dgg2,.cmpc,.csl,.cbars,.cmpt,.doll,.gL,.ltg,.lgr2,[data-noswipe]'))return true;const cs=getComputedStyle(e);if((cs.overflowX==='auto'||cs.overflowX==='scroll')&&e.scrollWidth>e.clientWidth+4)return true}return false};
 document.addEventListener('touchstart',e=>{if(e.touches.length!==1||window.innerWidth>=1000||!me()||ui.onb||ui.sheet||(ui.tab==='quest'&&ui.qmode==='atlas')){ok=false;return}const t=e.touches[0];sx=t.clientX;sy=t.clientY;st=Date.now();ok=!blocked(e.target)&&sx>18&&sx<window.innerWidth-18},{passive:true});
 document.addEventListener('touchend',e=>{if(!ok)return;ok=false;const t=e.changedTouches[0];const dx=t.clientX-sx,dy=t.clientY-sy;if(Date.now()-st>650||Math.abs(dx)<80||Math.abs(dy)>Math.abs(dx)*.45)return;
   const i=TABS.findIndex(x=>x[0]===ui.tab);const n=i+(dx<0?1:-1);if(i<0||n<0||n>=TABS.length)return;const b=document.querySelector('.tabs [data-a="tab"][data-k="'+TABS[n][0]+'"]');if(b){NAVW='밀기';b.click()}},{passive:true})}
/* 아래 탭 줄은 화면을 다시 그려도 그대로 두고(폰에서 내리다가 탭 줄이 가운데 뜨는 현상 막기) 고른 탭만 바꿈 */
function setTabs(on){let tb=document.getElementById('tabbar');if(!tb){tb=document.createElement('div');tb.id='tabbar';document.body.appendChild(tb)}
  const k=on?ui.tab:'';if(tb.dataset.k===k)return;tb.dataset.k=k;if(!on){tb.innerHTML='';return}
  const nav=tb.querySelector('.tabs');if(nav){nav.querySelectorAll('button[data-k]').forEach(b=>b.classList.toggle('on',b.dataset.k===ui.tab))}else tb.innerHTML=tabs()}
function rerender(keepScroll){const y=window.scrollY;const sh=document.querySelector('.sheet');const sy=sh?sh.scrollTop:0;render();if(keepScroll){window.scrollTo(0,y);vpFix()}const s2=document.querySelector('.sheet');if(s2&&keepScroll)s2.scrollTop=sy}
function setLv(c,v){v=Math.max(1,Math.min(60,parseInt(v,10)||c.lv));if(v!==c.lv){c.lv=v;save()}}

/* ===================== 이벤트 ===================== */
function isrchUpd(){const box=document.getElementById('isres');const c=me();if(!box||!c||!ui.sheet||!ui.sheet.startsWith('slot:')){return}
  const tmp=document.createElement('div');tmp.innerHTML=slotSheet(c,ui.sheet.slice(5));const nb=tmp.querySelector('#isres');if(nb)box.innerHTML=nb.innerHTML}
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,k=b.dataset.k;const c=me();NAVW='누름 '+a+(k?':'+String(k).slice(0,20):'');
  if(a==='bg'){if(e.target===b){noteClean(c);ui.sheet=null;ui.delAsk=0;rerender(true)}return}
  if(a==='close'){noteClean(c);ui.sheet=null;ui.delAsk=0;rerender(true);return}
  if(a==='bkpend'){const code=ui.bkpend;ui.bkpend=null;ui.sheet=null;bkImport(code,k);return}
  if(a==='sypaste'){syPaste();return}
  if(a==='fsload'){fsLoad(k==='re',k==='auto');return}
  if(a==='fspick'){fsPick(+k);return}
  if(a==='fs'){const v=+k||1;try{localStorage.setItem(FS_KEY,String(v))}catch(e){}fsApply(v);render();toast('글씨 크기를 바꿨어요');return}
  /* 시작 화면 */
  const o=ui.onb;
  if(a==='onb-race'){o.race=k;if(o.cls&&!RACE_CLS[k].includes(o.cls)){o.cls='';o.spec=''}rerender(true);return}
  if(a==='onb-cls'){o.cls=k;o.spec='';rerender(true);return}
  if(a==='onb-spec'){o.spec=k;rerender(true);return}
  if(a==='onb-lv-'||a==='onb-lv+'){o.lv=Math.max(1,Math.min(60,(+o.lv||1)+(a==='onb-lv+'?1:-1)));rerender(true);return}
  if(a==='onb-x'){ui.onb=null;rerender();return}
  if(a==='onb-arm'){const A=ARM[k];if(A){o.arm=k;o.name=A.name;o.race=armRace(A.race);if(CL.includes(A.cls)){o.cls=A.cls;o.spec=''}o.lv=+A.level||o.lv}rerender(true);return}
  if(a==='onb-go'){if(!(o.race&&o.cls&&o.spec))return;const n={id:newId(),name:(o.name||'').trim(),race:o.race,cls:o.cls,spec:o.spec,lv:Math.max(1,Math.min(60,+o.lv||1)),eq:{},fq:{},dq:{}};DB.list.push(n);DB.cur=n.id;if(o.arm){n.arm=o.arm;armApply(n,true);n.spec=o.spec}save();ui.onb=null;ui.tab='home';ui.sheet=null;render();window.scrollTo(0,0);toast('캐릭터를 만들었어요');return}
  if(!c)return;
  if(a==='cmpopen'){ui.cmpopen=ui.cmpopen===+k?null:+k;rerender(true);return}
  if(a==='tab'){{const o=TABS.findIndex(t=>t[0]===ui.tab),n=TABS.findIndex(t=>t[0]===k);if(o>=0&&n>=0&&o!==n)ui._tin=n>o?'l':'r'}ui.tab=k;ui.amback=null;if(k==='quest'||k==='dungeon')qdbLoad();if(k==='dungeon')dggLoad();if(k!=='dungeon')ui.dg=null;render();window.scrollTo(0,0);const dc=document.querySelector('.dchips');if(dc){const on=dc.querySelector('.on');if(on)dc.scrollLeft=on.offsetLeft-20}return}
  if(a==='lv-'||a==='lv+'){setLv(c,c.lv+(a==='lv+'?1:-1));rerender(true);return}
  if(a==='chars'){ui.sheet='chars';rerender(true);return}
  if(a==='imp'){ui.sheet='imp';rerender(true);if(!QDB)qdbLoad();return}
  if(a==='plan'){c.plan=k;ui.pz=null;save();rerender(true);return}
  if(a==='pnode'){ui.pz=k;rerender(true);return}
  if(a==='pdgo'){ui.pdgo=!ui.pdgo;rerender(true);return}
  if(a==='pdgt'){c.pdg=c.pdg||[];const i=c.pdg.indexOf(k);if(i>=0)c.pdg.splice(i,1);else c.pdg.push(k);save();rerender(true);return}
  if(a==='rsall'){ui.rsall=!ui.rsall;rerender(true);return}
  if(a==='qcn'){c.qc=c.qc||{};c.qc[k]=Math.max(0,(c.qc[k]||0)+(+b.dataset.d||0));save();rerender(true);return}
  if(a==='rsdone'){const P=recPlans(c);const pk=P.find(p=>p.k===c.plan)||P[0];if(!pk)return;/* 지금 단계 다시 계산해서 적용 */
    const html=recView(c);const ST=ui._st;if(!ST||!ST[0])return;c.ql=c.ql||{};c.mq=c.mq||{};
    ST[0].items.forEach(it=>{const id=it.q.id;if(it.type==='get')c.ql[id]=Math.max(c.ql[id]||0,1);else if(it.type==='do')c.ql[id]=2;else{c.mq[id]=1;delete c.ql[id]}});
    if(ST[0].xy)c.lpos={z:ST[0].zone,xy:ST[0].xy};    save();toast('✓ '+RST[ST[0].type][0]+' 끝 · 다음 단계로');rerender(true);return}
  if(a==='mapst'&&b.dataset.f==='mini'){c.miniStyle=k;save();rerender(true);return}
  if(a==='mapst'){c.mapStyle=k;save();rerender(true);if(ui.qmode==='atlas'&&k==='atlas')setTimeout(()=>{try{amInit()}catch(e){}},30);return}
  if(a==='gz'){ui.gz=k;ui.amq=null;rerender(true);return}
  if(a==='rmap'){c.recMap=!recMapOn(c);save();rerender(true);return}
  if(a==='lhsel'){ui.lhsel=ui.lhsel===k?null:k;rerender(true);return}
  if(a==='side'&&k==='chars'){ui.side=false;sideLock(false);clearInterval(sideIv);sideIv=null;document.body.classList.remove('sidem');ui.sheet='chars';rerender(true);return}
  if(a==='side'){if(k==='0'&&history.state&&history.state.side){try{history.back();return}catch(e){}}sideOn(k!=='0');return}
  if(a==='pindel'){const L=(c.notes&&c.notes.p)||[];const i=+k;const n=L[i];if(!n)return;L.splice(i,1);pinGone(c,n,true);save();ui.sheet=null;ui.noteNew=0;rerender(true);toastUndo('지도 메모를 지웠어요',()=>{const M=c.notes.p=c.notes.p||[];M.splice(Math.min(i,M.length),0,n);pinGone(c,n,false);save();rerender(true)});return}
  if(a==='nall'){ui.nAll=!ui.nAll;rerender(true);return}
  if(a==='notego'){const n=((c.notes&&c.notes.p)||[])[+k];if(!n)return;ui.sheet=null;ui.tab='quest';ui.qmode='atlas';ui.amq=null;ui.am={c:n.c,z:2.6,cx:n.x,cy:n.y};render();return}
  if(a==='townall'){ui.townAll=!ui.townAll;rerender(true);return}
  if(a==='chgall'){ui.chgAll=!ui.chgAll;rerender(true);return}
  if(a==='jlall'){ui.jlAll=!ui.jlAll;rerender(true);return}
  if(a==='tbud'){c.tbud=+k||0;save();rerender(true);return}
  if(a==='rwpick'){const [q,i]=k.split(':').map(Number);c.rwPick=c.rwPick||{};const back=c.rwPick[q]===i;if(back)delete c.rwPick[q];else c.rwPick[q]=i;save();toast(back?'앱 추천으로 되돌렸어요':'고를 템으로 정했어요 · 게임 툴팁 코드를 다시 넣으면 반영돼요');rerender(true);return}
  if(a==='fpk'){c.fpk=c.fpk||{};if(c.fpk[k])delete c.fpk[k];else c.fpk[k]=1;save();rerender(true);return}
  if(a==='lgv'){c.lgRoute=!c.lgRoute;save();rerender(true);return}
  if(a==='qlrm'){if(c.ql){const was=c.ql[+k];delete c.ql[+k];save();rerender(true);toastUndo('퀘스트창에서 뺐어요 (포기)',()=>{const cc=me();cc.ql=cc.ql||{};cc.ql[+k]=was;save();rerender(true)})}return}
  if(a==='qldone'){c.mq=c.mq||{};c.mq[+k]=1;if(c.ql)delete c.ql[+k];save();toast('끝냄으로 표시하고 퀘스트창에서 뺐어요');rerender(true);return}
  if(a==='impgo'){const P=ui.imp;if(!P)return;const {n,extra}=impApply(c,P);if(ui.fsPickCode&&ui.impraw===ui.fsPickCode){c.fsT=ui.fsPickT;c.fsName=P.name}
    ui.impExtra=extra.join(' · ');ui.imp=null;ui.impraw='';ui.sheet=null;if(P.log.length){ui.tab='quest';ui.qmode='log'}save();toast('✓ 끝낸 퀘스트 '+P.done.length+'개를 불러왔어요 (새로 '+n+'개)'+(ui.impExtra?' · '+ui.impExtra:''));ui.impEq=null;ui.impSp=null;rerender(true);return}
  if(a==='pick'){DB.cur=k;save();ui.sheet=null;ui.dg=null;ui.qz=null;render();window.scrollTo(0,0);toast('캐릭터를 바꿨어요');return}
  if(a==='add'){ui.sheet=null;ui.onb={name:'',race:c.race,cls:'',spec:'',lv:1};render();window.scrollTo(0,0);return}
  if(a==='del'){if(!ui.delAsk){ui.delAsk=1;rerender(true);return}DB.del=DB.del||{};DB.del[c.id]=Date.now();DB.list=DB.list.filter(x=>x.id!==c.id);DB.cur=DB.list[0]?DB.list[0].id:null;save();ui.delAsk=0;ui.sheet=null;render();toast('지웠어요');return}
  if(a==='crace'){c.race=k;save();rerender(true);return}
  if(a==='armlink'){c.arm=k;armApply(c);rerender(true);return}
  if(a==='armnow'){armApply(c);rerender(true);return}
  if(a==='armoff'){delete c.arm;save();rerender(true);return}
  if(a==='ccls'){if(c.cls!==k){c.cls=k;c.spec=D_CLS[k].specs[0].id;c.eq={};save()}rerender(true);return}
  if(a==='spec'){c.spec=k;save();rerender(true);return}
  if(a==='csec'){ui.csec=k;rerender(true);return}
  if(a==='tlv'){ui.tlv=k;rerender(true);return}
  if(a==='ttree'){ui.ttree=k;ui.tsel=null;rerender(true);return}
  if(a==='tsel'){ui.tsel=ui.tsel===k?null:k;rerender(true);return}
  if(a==='tadd'||a==='tsub'){const C=D_CLS[c.cls];if(!c.tal||c.tal.cls!==c.cls)c.tal={cls:c.cls,r:{}};if(c.tal.src==='game'||c.tal.src==='armory')c.tal.src=c.tal.src+'-edit';ui.tlv='me';const M=c.tal.r;const v=C.talents[k];ui.tsel=k;
    if(a==='tadd'){if(talCan(C,M,k)){M[k]=(M[k]||0)+1}else{const r=M[k]||0;const low=Object.keys(M).filter(j=>C.talents[j]&&C.talents[j][1]===v[1]&&C.talents[j][5]<v[5]).reduce((x,j)=>x+M[j],0);
        toast(r>=v[2]?'이미 다 찍었어요':Object.values(M).reduce((x,y)=>x+y,0)>=51?'포인트 51개를 다 썼어요':low<(v[5]-1)*5?v[1]+'에 '+((v[5]-1)*5-low)+'포인트 더 찍어야 열려요':v[7]?'먼저 '+C.talents[v[7][0]][0]+' '+v[7][1]+'포인트가 필요해요':'찍을 수 없어요')}}
    else{const r=M[k]||0;if(r){const N=Object.assign({},M);N[k]=r-1;if(!N[k])delete N[k];if(talOk(C,N)){c.tal.r=N}else toast('이 특성이 있어야 하는 다른 특성이 있어서 못 빼요')}}
    save();rerender(true);return}
  if(a==='tfill'){const C=D_CLS[c.cls];const sp=specOf(c);const M={};sp.steps.forEach(s=>{if(s[0]<=+k&&C.talents[s[1]])M[s[1]]=Math.max(M[s[1]]||0,s[2])});c.tal={cls:c.cls,r:M};save();toast('가이드대로 채웠어요');rerender(true);return}
  if(a==='tclr'){c.tal={cls:c.cls,r:{}};ui.tsel=null;save();toast('다 지웠어요');rerender(true);return}
  if(a==='lvseen'){c.seenLv=c.lv;save();rerender(true);return}
  if(a==='skx'){ui.skx=ui.skx||{};ui.skx[k]=!ui.skx[k];rerender(true);return}
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
  if(a==='tmode'){c.tmode=k;save();rerender(true);toast({def:'생존 위주(덜 맞고 안 죽게)로 추천해요',bal:'생존·위협 균형으로 추천해요',off:'위협(TPS) 위주로 추천해요 — 적중·치명타·힘을 먼저 봐요'}[k]);return}
  if(a==='gmode'){c.gmode=k;save();rerender(true);toast(k==='solo'?'사냥용 기준으로 추천해요':'힐 위주 기준으로 추천해요');return}
  if(a==='bkout'||a==='bklink'){bkEncode({v:1,cur:DB.cur,list:DB.list}).then(code=>{const txt=a==='bklink'?location.origin+location.pathname+'#bk='+code:code;ui.bkcode=txt;rerender(true);
      (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>toast(a==='bklink'?'링크를 복사했어요. 다른 기기에서 열면 돼요':'백업 코드를 복사했어요')).catch(()=>toast('아래 칸을 길게 눌러 복사하세요'))});return}
  if(a==='syon'){const t=document.querySelector('[data-c=sytok]');const v=t&&t.value.trim();if(!v){toast('토큰을 먼저 붙여 넣으세요');return}toast('연결하는 중…');syConnect(v).then(ok=>{toast(ok?'연결됐어요! 다른 기기에도 같은 토큰을 넣어 주세요':'연결하지 못했어요');rerender(true)});return}
  if(a==='sygo'){toast('맞추는 중…');syPull().then(()=>{toast(SY.err?SY.err:'맞췄어요');rerender(true)});return}
  if(a==='syoff'){SY={};_syK=null;sySave();toast('연결을 끊었어요');rerender(true);return}
  if(a==='symk'){toast('연동 코드를 만드는 중…');syMake().then(ok=>{ui.syqr=ok&&isPC();toast(ok?'만들었어요! 다른 기기에서 링크를 열거나 QR을 찍어 주세요':'만들지 못했어요');rerender(true)});return}
  if(a==='armrq'){const n=(document.querySelector('[data-c=armrqn]')||{}).value||'',rg=(document.querySelector('[data-c=armrgn]')||{}).value||'kr';ui.armreqOpen=1;armReq(rg,n).then(m=>{toast(m);rerender(true)});return}
  if(a==='syjn'){const t=document.querySelector('[data-c=syjoin]');const v=t&&t.value.trim();if(!v){toast('연동 코드를 먼저 넣어 주세요');return}toast('연결하는 중…');syJoin(v).then(ok=>{toast(ok?'연결됐어요! 기록을 맞췄어요':(SY.err||'연결하지 못했어요'));rerender(true)});return}
  if(a==='sycp'){const t=syLink();(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast('링크를 복사했어요 · 다른 기기에서 열면 연결돼요'),()=>{prompt('이 링크를 복사하세요',t)});return}
  if(a==='syqr'){ui.syqr=!ui.syqr;rerender(true);return}
  if(a==='bkin'){const t=document.querySelector('[data-c=bkin]');if(t&&t.value.trim())bkImport(t.value,k);else toast('코드를 먼저 붙여 넣으세요');return}
  if(a==='dtab'){ui.dtab=k;rerender(true);return}
  if(a==='lf'){ui.lf=k;rerender(true);return}
  if(a==='legdg'){c.legDg=c.legDg||{};if(c.legDg[k])delete c.legDg[k];else c.legDg[k]=Date.now();save();toast(c.legDg[k]?'✓ 깼음으로 표시했어요':'표시를 지웠어요');rerender(true);return}
  if(a==='rk'){c.dk=c.dk||{};const m=c.dk[ui.dg]=c.dk[ui.dg]||{};if(!m._s)m._s=Date.now();if(m[k])delete m[k];else{m[k]=Date.now();toast('✓ '+k+' 잡음')}save();rerender(true);return}
  if(a==='rkgo'){c.dk=c.dk||{};c.dk[ui.dg]={_s:Date.now()};save();toast('시작! 보스 잡으면 ✓ 눌러 주세요');rerender(true);return}
  if(a==='rkend'){const d=DG[ui.dg];if(!d)return;const S=dgState(c,d);const ups=dgEndItems(c,d);
    ui.de={q:new Set(S.left.filter(q=>(c.ql||{})[q.id]).map(q=>q.id)),i:new Set(),res:null};ui.sheet='dgend:'+d.slug;rerender(true);return}
  if(a==='rkclr'){if(c.dk)delete c.dk[ui.dg];save();ui.sheet=null;toast('체크를 지웠어요');rerender(true);return}
  if(a==='deq'||a==='dei'){const S=a==='deq'?ui.de.q:ui.de.i;const v=+k;if(S.has(v))S.delete(v);else{if(a==='dei'){const it=IT.get(v);const bs=bestSlot(it,c);[...S].forEach(o=>{const b2=bestSlot(IT.get(o),c);if(b2&&bs&&b2.s===bs.s)S.delete(o)})}S.add(v)}rerender(true);return}
  if(a==='deok'){const d=DG[k];if(!d)return;const kl=killOf(c,d.slug);const nk=Object.keys(kl).filter(x=>x!=='_s').length;const dur=kl._s?Math.round((Date.now()-kl._s)/60000):0;
    c.dq=c.dq||{};ui.de.q.forEach(id=>{c.dq[id]=1;if(c.ql)delete c.ql[id]});const eqd=[];c.eq=c.eq||{};
    ui.de.i.forEach(id=>{const it=IT.get(id);const b2=it&&bestSlot(it,c);if(b2){c.eq[b2.s]=id;if(b2.s==='main'&&it.sl==='2h')delete c.eq.off;eqd.push(it.nm)}});
    c.dgRuns=c.dgRuns||[];c.dgRuns.unshift({d:d.slug,t:Date.now(),m:dur,k:nk,q:ui.de.q.size,i:eqd.length});c.dgRuns=c.dgRuns.slice(0,30);if(c.dk)delete c.dk[d.slug];save();
    ui.de.res={d:d.slug,dur,nk,nq:ui.de.q.size,eqd};rerender(true);return}
  if(a==='nch'){ui.nch=ui.nch||{};ui.nch[k]=!ui.nch[k];rerender(true);return}
  if(a==='chx'){ui.chopen=ui.chopen||{};ui.chopen[k]=b.dataset.f?false:true;rerender(true);return}
  if(a==='mmgo'&&ui.side){ui.side=false;sideLock(false);clearInterval(sideIv);sideIv=null;document.body.classList.remove('sidem');ui._sideRet=1}
  if(a==='mmgo'&&QDB&&QDB.get(+k)&&!amFocus(+k)){ui.sheet='q:'+k;render();toast('이 지역은 큰 지도가 없어서 퀘스트 창 지도로 보여 줘요');return}
  if(a==='mmgo'){ui.amback={side:ui._sideRet?1:0,sheet:ui.sheet,tab:ui.tab,qmode:ui.qmode,dg:ui.dg,dtab:ui.dtab,y:window.scrollY,id:+k};try{history.pushState({amback:1},'')}catch(e){}ui.sheet=null;ui.tab='quest';ui.qmode='atlas';ui.amq=+k;ui.amall=0;ui.ampmin=0;ui.amfit=1;if(window.innerWidth<1000){ui.amfull=true;document.body.classList.add('amfull')}/* 폰: 「크게 보기」는 화면 가득 */const FO=amFocus(+k);if(FO&&FO.P[0])ui.am=amFit(FO);render();window.scrollTo(0,0);return}
  if(a==='zq'){ui.qmode='map';ui.mz='?|'+k;ui.mf='now';render();window.scrollTo(0,0);return}
  if(a==='dcs'){const dc=document.querySelector('.dchips');if(dc)dc.scrollBy({left:(+k)*dc.clientWidth*.8,behavior:'smooth'});return}
  if(a==='amc'){if(ui.am&&ui.am.c!==k)ui.am={c:k,z:0,cx:ATL[k].w/2,cy:ATL[k].h/2};ui.amsel=null;rerender(true);return}
  if(a==='amfo'){ui.amfo=!ui.amfo;rerender(true);return}
  if(a==='amstp'){const R=(AM&&AM.route)||[];if(!R.length)return;ui.amstep=Math.max(0,Math.min((ui.amstep||0)+(+k),R.length-1));const r=R[ui.amstep];if(ui.am&&r)ui.am={c:r.c,z:Math.max(ui.am.z||0,2.6),cx:r.x,cy:r.y};ui.amhub=null;ui.amsel=null;ui.amzone=null;rerender(true);return}
  if(a==='amall'){ui.amall=!ui.amall;ui.amhub=null;rerender(true);return}
  if(a==='amlv2'){ui.amf=Object.assign({},AMF0,ui.amf||{});ui.amf.lv=k;ui.amsel=null;rerender(true);return}
  if(a==='amback'){amBack(true);return}
  if(a==='ampx'){ui.amsel=null;ui.amhub=null;ui.amzone=null;ui.amq=null;ui.amcl=null;if(AM&&AM.draw)AM.draw();amPanel(null);return}
  if(a==='amdg'){ui.amdg=k||null;if(ui._amp)amPanel(ui._amp);return}
  if(a==='amst'){c.amst=k;save();if(AM&&AM.draw){AM.draw();amPanel(ui.amq?{kind:'focus'}:null)}else rerender(true);return}
  if(a==='amchain'){const cc=me();cc.amchain=amChainOn()?0:1;save();ui.amfit=1;const FO=ui.amq&&amFocus(ui.amq);if(FO&&FO.P[0])ui.am=amFit(FO);if(AM&&AM.draw){AM.draw();amPanel({kind:'focus'})}return}
  if(a==='amall'){ui.amall=ui.amall?0:1;if(AM&&AM.draw){AM.draw();amPanel({kind:'focus'})}return}
  if(a==='ampmin'){ui.ampmin=ui.ampmin?0:1;ui.amfit=1;if(AM&&AM.draw)amPanel({kind:'focus'});return}
  if(a==='amstep'){if(!k)return;ui.amq=+k;ui.amfit=1;const FO=amFocus(ui.amq);if(FO&&FO.P[0])ui.am=amFit(FO);if(AM&&AM.draw){AM.draw();amPanel({kind:'focus'})}else rerender(true);return}
  if(a==='gall'){ui.gall=!ui.gall;rerender(true);return}
  if(a==='gfull'){ui.gfull=!ui.gfull;rerender(true);return}
  if(a==='amq'&&(me().mapStyle||'atlas')==='game'&&ui.qmode==='atlas'){ui.amq=k?+k:null;rerender(true);return}
  if(a==='amq'){ui.amq=k?+k:null;ui.amfit=1;ui.amall=0;if(ui.amq){const FO=amFocus(ui.amq);if(FO&&FO.P[0])ui.am=amFit(FO)}if(AM&&AM.draw){AM.draw();amPanel(ui.amq?{kind:'focus'}:null)}return}
  if(a==='amf'){ui.amf=Object.assign({},AMF0,ui.amf||{});ui.amf[k]=ui.amf[k]?0:1;ui.amsel=null;rerender(true);return}
  if(a==='amlv'){ui.amf=Object.assign({},AMF0,ui.amf||{});ui.amf.lv=ui.amf.lv==='all'?'now':'all';ui.amsel=null;rerender(true);return}
  if(a==='armref'){toast('전투정보실 자료 확인 중…');armFetch(true).then(n=>{const A=ARM[c.arm];toast(n<0?'자료를 못 받았어요. 잠시 뒤 다시 해 보세요':n>0?'새 자료로 맞췄어요 (레벨 '+(A&&A.level||'?')+')':'바뀐 게 없어요 · 마지막 갱신 '+armAgo(A&&A.checked))});return}
  if(a==='lh'){ui.lhopen=ui.lhopen||{};const cur=b.closest('.lhr').classList.contains('open');ui.lhopen[k]=!cur;rerender(true);return}
  if(a==='dsp'){ui.dsp=k;rerender(true);return}
  if(a==='dsp2'){c.spec2=k||null;ui.dsp='2';save();if(k)toast('둘째 특성을 정했어요');rerender(true);return}
  if(a==='msok'){c.ms=c.ms||{};c.ms[k]=c.ms[k]?0:1;save();if(c.ms[k])toast('했어요로 표시했어요');rerender(true);return}
  if(a==='trn'){c.trn=c.lv;save();toast('교관에서 배운 걸로 표시했어요');rerender(true);return}
  if(a==='drole'){c.drole=k;save();rerender(true);return}
  if(a==='bo'){ui.bopen=ui.bopen||{};const cur=b.closest('.st').classList.contains('open');ui.bopen[k]=!cur;rerender(true);return}
  if(a==='mh'){ui.mhopen=ui.mhopen||{};const cur=b.closest('.st').classList.contains('open');ui.mhopen[k]=!cur;rerender(true);return}
  if(a==='myprof'){c.profs=c.profs||[];const i=c.profs.indexOf(k);if(i>=0)c.profs.splice(i,1);else{c.profs.push(k);if(c.profs.length>2&&!['요리','응급치료','낚시'].includes(k)){const pri=c.profs.filter(x=>!['요리','응급치료','낚시'].includes(x));if(pri.length>2)c.profs.splice(c.profs.indexOf(pri[0]),1)}}
    const d=b.closest('details.prf');if(d){ui.prfo=ui.prfo||{};ui.prfo[d.dataset.k]=1}save();rerender(true);toast(c.profs.length?'내 전문기술: '+c.profs.join(' · '):'전문기술 선택을 지웠어요');return}
  if(a==='hgo'){ui.tab='quest';ui.qmode=k;rerender(true);window.scrollTo(0,0);return}
  if(a==='rmz'){ui.rmz=k;rerender(true);return}
  if(a==='hubgo'){ui.hopen={};ui.hfocus=k;
    const r=(ui._rmp||[]).find(x=>x.k===k);if(r&&ui.hall!==true&&r.n>3)ui.hall=true;rerender(true);
    setTimeout(()=>{const el=[...document.querySelectorAll('.st[data-hk]')].find(e=>e.dataset.hk===k);if(el)el.scrollIntoView({behavior:'smooth',block:'center'})},50);return}
  if(a==='hmore'){ui.hmore=ui.hmore||{};ui.hmore[k]=1;rerender(true);return}
  if(a==='rz'){ui.rz=k||null;ui.hall=false;rerender(true);return}
  if(a==='hubok'){const it=(ui._hubs||{})[k]||[];c.fq=c.fq||{};c.mq=c.mq||{};const prev=it.map(([fk,id])=>[fk,id,c.fq[fk],id?c.mq[id]:undefined]);it.forEach(([fk,id])=>{c.fq[fk]=1;if(id)c.mq[id]=1});ui.hopen=ui.hopen||{};const ho=ui.hopen[k];ui.hopen[k]=false;ui.hfocus=null;save();rerender(true);
    toastUndo(it.length+'개 끝냄으로 표시했어요',()=>{const cc=me();if(!cc)return;prev.forEach(([fk,id,a1,a2])=>{if(a1)cc.fq[fk]=a1;else delete cc.fq[fk];if(id){if(a2)cc.mq[id]=a2;else delete cc.mq[id]}});ui.hopen[k]=ho==null?true:ho;save();rerender(true);toast('되돌렸어요')});return}
  if(a==='hall'){ui.hall=!ui.hall;rerender(true);return}
  if(a==='qsclr'){ui.qsrch='';render();return}
  if(a==='hub'){ui.hopen=ui.hopen||{};const st=b.closest('.st');const cur=st?st.classList.contains('open'):!!ui.hopen[k];ui.hopen[k]=!cur;rerender(true);return}
  if(a==='mzgo'){ui.tab='quest';ui.qmode='map';ui.mc=k.split('|')[0];ui.mz=k;ui.mf='all';ui.sheet=null;render();window.scrollTo(0,0);return}
  if(a==='goz'){ui.tab='quest';ui.qmode='map';ui.mz='?|'+k;ui.mc=null;ui.mf='near';ui.sheet=null;render();window.scrollTo(0,0);return}
  if(a==='dgo'){const fromChip=b.classList.contains('dchip');const sx=fromChip?document.querySelector('.dchips').scrollLeft:0;ui.tab='dungeon';if(ui.dg!==k){ui.stopen={};ui.dfloor=0}ui.dg=k;ui.sheet=null;render();window.scrollTo(0,0);const dc=document.querySelector('.dchips');if(dc){if(fromChip)dc.scrollLeft=sx;else{const on=dc.querySelector('.on');if(on)dc.scrollLeft=on.offsetLeft-20}}return}
  if(a==='dgback'){ui.dg=null;render();window.scrollTo(0,0);return}
  if(a==='dgf'){ui.dgf=k;rerender(true);return}
  if(a==='upf'){ui.upf=k||null;rerender(true);return}
  if(a==='rtgm'){ui.rtgm=1;rerender(true);return}
  if(a==='gsub'){ui.gsub=k;ui.gslot=null;ui.gmore=0;rerender(true);return}
  if(a==='gmore'){ui.gmore=1;rerender(true);return}
  if(a==='cmpadd'){const id=+k;c.cmp=c.cmp||[];const i=c.cmp.indexOf(id);if(i>=0){c.cmp.splice(i,1);toast('비교에서 뺐어요')}else{c.cmp.push(id);if(c.cmp.length>3)c.cmp.shift();toast('⚖ 비교에 담았어요 ('+c.cmp.length+'/3) · 장비 › 비교')}save();rerender(true);return}
  if(a==='cmpgo'){ui.sheet=null;ui.tab='gear';ui.gsub='cmp';ui.gslot=null;render();window.scrollTo(0,0);return}
  if(a==='cmpsp'){ui.cmpsp=k;rerender(true);return}
  if(a==='cmpq'){ui.sheet='cmp:'+k;rerender(true);return}
  if(a==='cmpslot'){ui.cmpslot=k;const own=c.bag?bagAll(c).filter(x=>x.ok&&fits(x.it,k,c)&&x.g>.5).map(x=>x.it.id):[];const rec=bestFor(c,k,c.lv,ui.ifil).map(x=>x.it.id).filter(id=>!own.includes(id));
    c.cmp=own.slice(0,1).concat(rec).slice(0,3);if(!c.cmp.length){const cur=eqIt(c,k);const alt=cands(c,k,c.lv,ui.ifil).filter(x=>!cur||x.it.id!==cur.id).sort((a,b)=>b.s-a.s).slice(0,2).map(x=>x.it.id);c.cmp=alt.length?alt:(cur?[cur.id]:[]);toast(SLOT_KO[k]+' · 지금 게 제일 좋아요 👍 '+(alt.length?'다음 후보와 견줘요':''))}save();rerender(true);
    setTimeout(()=>{const t=document.querySelector('.cmpc .cmpt,.cmpc table');if(t&&t.getBoundingClientRect().top>innerHeight-80)t.scrollIntoView({behavior:'smooth',block:'start'})},30);return}
  if(a==='fro'){ui.fropen=ui.fropen||{};ui.fropen[k]=!ui.fropen[k];rerender(true);return}
  if(a==='frsp'){const [kk,sp]=k.split('|');ui.frsp=ui.frsp||{};ui.frsp[kk]=sp;rerender(true);return}
  if(a==='frmore'){ui.frmore=k;rerender(true);return}
  if(a==='frcopy'){const t=frText(k);(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast('복사했어요 · 디스코드·카톡에 붙여 넣으세요')).catch(()=>{ui.sheet=null;prompt('복사해서 쓰세요',t)});return}
  if(a==='nogo'){const id=+k;c.nogo=c.nogo||[];if(!c.nogo.includes(id))c.nogo.push(id);const it=IT.get(id);toast('🚫 '+(it?it.nm:'')+' 뺐어요 · 다음 추천을 넣었어요');save();rerender(true);return}
  if(a==='nogoclr'){c.nogo=k==='*'?[]:(c.nogo||[]).filter(id=>{const it=IT.get(id);return !(it&&fits(it,k,c))});toast('뺀 장비를 다시 넣었어요');save();rerender(true);return}
  if(a==='wish'){const id=+k;c.wish=c.wish||[];const i=c.wish.indexOf(id);if(i>=0){c.wish.splice(i,1);toast('찜에서 뺐어요')}else{c.wish.push(id);toast('⭐ 찜했어요 · 장비 › 찜·비교')}save();rerender(true);return}
  if(a==='dgt'){ui.dgt=ui.dgt||{};ui.dgt[k]=ui.dgt[k]===false;rerender(true);return}
  if(a==='cmpdel'){c.cmp=(c.cmp||[]).filter(x=>x!==+k);save();rerender(true);return}
  if(a==='cmpclr'){c.cmp=[];save();rerender(true);return}
  if(a==='ifil'){ui.ifil=k;rerender(true);return}
  if(a==='slot'){ui.sheet='slot:'+k;ui.isrch='';rerender(true);return}
  if(a==='repall'){ui.repAll=!ui.repAll;rerender(true);return}
  if(a==='wfr'){ui.sheet='wfr';rerender(true);return}
  if(a==='wfrcp'){const t=document.querySelector('.sheet textarea');if(t){t.select();try{navigator.clipboard.writeText(t.value).then(()=>toast('복사했어요 · 게임에서 /wfh 추천'),()=>{document.execCommand('copy');toast('복사했어요')})}catch(e){document.execCommand('copy');toast('복사했어요')}}return}
  if(a==='slotnav'){slotGo(k);return}
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
  if(f==='qnote'){const v=t.value.trim();c.notes=c.notes||{};c.notes.q=c.notes.q||{};c.notes.q[t.dataset.k]=v;save();return}
  if(f==='pinTxt'){const n=((c.notes&&c.notes.p)||[])[+t.dataset.k];if(n){n.t=t.value.trim();save()}return}
  if(f==='fsauto'){fsAutoSet(t.checked);toast(t.checked?'자동 맞춤을 켰어요':'자동 맞춤을 껐어요');return}
  if(f==='impEq'){ui.impEq=t.checked;return}
  if(f==='impAlt'){ui.impAlt=t.checked;return}
  if(f==='impSp'){ui.impSp=t.checked;return}
  if(f==='impTl'){ui.impTl=t.checked;return}
  if(f==='fq'){c.fq=c.fq||{};c.mq=c.mq||{};const qi=t.dataset.id;if(t.checked){c.fq[t.dataset.k]=1;if(qi)c.mq[qi]=1}else{delete c.fq[t.dataset.k];if(qi)delete c.mq[qi]}save();rerender(true);return}
  if(f==='mq'){c.mq=c.mq||{};c.fq=c.fq||{};if(t.checked)c.mq[t.dataset.k]=1;else{delete c.mq[t.dataset.k];const f0=questById(+t.dataset.k);if(f0)delete c.fq[f0.z+'|'+f0.q.nm]}save();rerender(true);return}
  if(f==='dq'){c.dq=c.dq||{};if(t.checked)c.dq[t.dataset.k]=1;else{delete c.dq[t.dataset.k];if(c.mq)delete c.mq[t.dataset.k]}save();rerender(true);return}
});
let srchT=null;
document.addEventListener('change',e=>{const t=e.target;if(t.dataset&&t.dataset.c==='cmpslot'){const c=me();if(!c||!t.value)return;ui.cmpslot=t.value;c.cmp=bestFor(c,t.value,c.lv,ui.ifil).slice(0,3).map(x=>x.it.id);save();rerender(true)}});
document.addEventListener('input',e=>{const t=e.target;if(t.dataset.c==='onb-name'){ui.onb.name=t.value;return}
  if(t.dataset.c==='impta'){ui.impraw=t.value;ui.imp=impParse(t.value);const b=document.getElementById('impres');const c=me();if(b&&c)b.innerHTML=impPreview(c);return}
  if(t.dataset.c==='qsrch'){ui.qsrch=t.value;clearTimeout(srchT);srchT=setTimeout(()=>{const box=document.getElementById('qsres'),bd=document.getElementById('qbody');const c=me();if(!box||!c)return;const q=ui.qsrch.trim();box.innerHTML=q?qSearchHtml(c,q):'';if(bd)bd.hidden=!!q},250);return}
  if(t.dataset.c==='csrch'){ui.csrch=t.value;clearTimeout(srchT);srchT=setTimeout(()=>{const b=document.getElementById('csres');const c=me();if(b&&c)b.innerHTML=cmpSearch(c)},250);return}
  if(t.dataset.c==='isrch'){ui.isrch=t.value;clearTimeout(srchT);srchT=setTimeout(isrchUpd,250)}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.dataset&&(e.target.dataset.c==='lv'||e.target.dataset.c==='onb-lv'))e.target.blur()});
try{const v=JSON.parse(sessionStorage.getItem('wfh_view')||'null');if(v&&['home','gear','quest','dungeon','class'].includes(v.tab)){ui.tab=v.tab;if(v.qmode)ui.qmode=v.qmode;if(v.tab==='dungeon'&&v.dg)ui.dg=v.dg;NAVW='새로고침 복원';if(v.tab==='quest'||v.tab==='dungeon')qdbLoad();if(v.tab==='dungeon')dggLoad()}}catch(e){}
/* 앱 아이콘 꾹 눌러 바로가기(manifest shortcuts): ./?go=rec|side|gear|imp */
{const go=new URLSearchParams(location.search).get('go');if(go){try{history.replaceState(null,'',location.pathname+location.hash)}catch(e){}
  if(me()){if(go==='rec'||go==='side'){ui.tab='quest';ui.qmode='rec';ui.sheet=null}else if(go==='gear'){ui.tab='gear';ui.sheet=null}else if(go==='imp'){ui.sheet='imp'}
    if(go==='side')setTimeout(()=>{if(!QDB)qdbLoad();sideOn(true)},400)}}}
render();
/* 기기 연동: 열 때 · 다시 돌아올 때 · 켜 둔 동안 2분마다 다른 기기 기록 가져오기 */
{/* 받은 연동 링크(#sync=코드)로 열면 바로 연결 */
  /* 앱이 이미 열려 있는 탭으로 링크가 들어오면 새로 읽지 않고 주소 끝(#)만 바뀜 → hashchange도 봄 */
  const syHash=()=>{const hm=decodeURIComponent(location.hash||'').match(/#sync=([A-Za-z0-9]+-[2-9A-Z]{10})/);if(!hm)return;history.replaceState(null,'',location.pathname+location.search);
    if(SY.bid&&SY.key&&syCode()===hm[1]){toast('이미 연결된 코드예요 · 기록을 맞추는 중…');syPull(true).then(()=>{toast(SY.err||'맞췄어요');render()});return}
    toast('연동 코드로 연결하는 중…');syJoin(hm[1]).then(ok=>{toast(ok?'연결됐어요! 다른 기기에서 보던 캐릭터를 가져왔어요':(SY.err||'연결하지 못했어요'));render()})};
  syHash();window.addEventListener('hashchange',syHash);
  setTimeout(()=>syPull(),1500);let syLast=Date.now();
  document.addEventListener('visibilitychange',()=>{if(!syOn())return;if(!document.hidden&&Date.now()-syLast>20e3){syLast=Date.now();syPull()}else if(document.hidden&&syT){clearTimeout(syT);syPush()}});
  setInterval(()=>{if(syOn()&&!document.hidden&&!document.querySelector('input:focus,textarea:focus')){syLast=Date.now();syPull(true)}},120e3)}

/* 옆으로 넘기는 줄(던전·바꿀 것·지역 칩 등, 스크롤바 숨김): PC 마우스 휠·끌기로도 넘기기.
   스크롤바를 숨긴 줄은 마우스로 옆으로 갈 방법이 없어서(터치만 됨) 모든 가로 줄에 같이 적용 */
const hsOf=t=>{for(let el=t&&t.nodeType===1?t:t&&t.parentElement;el&&el.id!=='app'&&el!==document.body;el=el.parentElement){if(el.scrollWidth>el.clientWidth+1&&el.scrollHeight<=el.clientHeight+2){const ox=getComputedStyle(el).overflowX;if(ox==='auto'||ox==='scroll')return el}}return null};
document.addEventListener('wheel',e=>{if(e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;if(e.target.closest&&e.target.closest('#amap'))return;const dc=hsOf(e.target);if(!dc)return;
  const max=dc.scrollWidth-dc.clientWidth;/* 끝까지 갔으면 원래대로 화면이 위아래로 */if((e.deltaY>0&&dc.scrollLeft>=max-1)||(e.deltaY<0&&dc.scrollLeft<=0))return;
  e.preventDefault();dc.scrollLeft+=e.deltaMode===1?e.deltaY*32:e.deltaY},{passive:false});
{let dd=null;document.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;if(e.target.closest&&e.target.closest('#amap,input,textarea,select'))return;const dc=hsOf(e.target);if(dc)dd={dc,x:e.clientX,sl:dc.scrollLeft,moved:false}});
 document.addEventListener('pointermove',e=>{if(!dd)return;const dx=e.clientX-dd.x;if(!dd.moved&&Math.abs(dx)>5){dd.moved=true;dd.dc.classList.add('drag')}if(dd.moved)dd.dc.scrollLeft=dd.sl-dx});
 document.addEventListener('pointerup',()=>{if(dd&&dd.moved){const dc=dd.dc;setTimeout(()=>dc.classList.remove('drag'),0);const stop=ev=>{ev.stopPropagation();ev.preventDefault()};dc.addEventListener('click',stop,{capture:true,once:true});setTimeout(()=>dc.removeEventListener('click',stop,{capture:true}),50)}dd=null})}

/* 퀘스트 줄 왼쪽 ❗ 누르면 바로 끝냄 표시 (펼치지 않고) */
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-qd]');if(!t)return;e.preventDefault();e.stopPropagation();const c=me();if(!c)return;
  const id=+t.dataset.qd;const q=QDB&&QDB.get(id);c.mq=c.mq||{};if(q&&mqDone(c,q)){delete c.mq[id];if(c.fq)delete c.fq[q.z+'|'+q.n]}else c.mq[id]=1;save();rerender(true);toast(c.mq[id]?'끝냄으로 표시했어요':'끝냄 표시를 뺐어요')},true);
document.addEventListener('toggle',e=>{const t=e.target;if(t.classList&&t.classList.contains('zinfo')){const was=!!ui.zinfo;ui.zinfo=t.open;if(t.open&&!was)rerender(true)}},true);

/* 전체 화면 지도: 뒤로 가기·Esc로도 작게 */
if(FSA){window.addEventListener('focus',()=>fsAuto());document.addEventListener('visibilitychange',()=>{if(!document.hidden)fsAuto()});setTimeout(()=>fsAuto(true),1200)}
window.addEventListener('popstate',()=>{if(ui.side)sideOn(false)});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&ui.side){sideLock(true);if(syOn())syPull(true)}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ui.side){if(history.state&&history.state.side){try{history.back()}catch(x){sideOn(false)}}else sideOn(false)}});
window.addEventListener('popstate',()=>{if(ui.amfull){ui.amfull=false;document.body.classList.remove('amfull');rerender(true)}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ui.amfull){ui.amfull=false;document.body.classList.remove('amfull');if(history.state&&history.state.amfull){try{history.back()}catch(x){}}rerender(true)}});

/* 퀘스트 창 → 「지도에서 크게」 → 다시 보던 퀘스트 창으로 (버튼·뒤로 가기) */
function amBack(fromBtn){const b=ui.amback;if(!b)return;ui.amback=null;ui.amq=null;ui.amfull=false;document.body.classList.remove('amfull');
  ui.tab=b.tab;ui.qmode=b.qmode;ui.dg=b.dg;ui.dtab=b.dtab;ui.sheet=b.side?null:(b.sheet||('q:'+b.id));ui._sideRet=0;render();window.scrollTo(0,b.y||0);if(b.side)setTimeout(()=>sideOn(true),0);
  if(fromBtn&&history.state&&history.state.amback){try{history.back()}catch(e){}}}
window.addEventListener('popstate',()=>{if(history.state&&history.state.amback)return;if(ui.amback){NAVW='뒤로가기';amBack(false)}});
/* ⌨️ 단축키 (PC): 1~5 탭 · / 검색 · Esc 닫기 · [ ] 레벨 */
document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||e.repeat)return;const t=e.target;if(t&&t.tagName==='SELECT')return;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable)){if(e.key==='Escape')t.blur();return}
  const c=me();if(!c||ui.onb)return;
  const TB={'1':'home','2':'gear','3':'quest','4':'dungeon','5':'class'};
  if(TB[e.key]){e.preventDefault();NAVW='단축키 '+e.key;ui.tab=TB[e.key];ui.sheet=null;ui.amback=null;if(ui.tab==='quest'||ui.tab==='dungeon')qdbLoad();if(ui.tab==='dungeon')dggLoad();render();window.scrollTo(0,0);return}
  if(e.key==='/'){e.preventDefault();if(ui.tab!=='quest'){ui.tab='quest';render()}setTimeout(()=>{const i=document.querySelector('.qsearch input');if(i){i.focus();i.select()}},30);return}
  if(e.key==='Escape'){if(ui.gfull){ui.gfull=false;rerender(true);return}if(ui.sheet){ui.sheet=null;rerender(true);return}if(ui.amq&&ui.qmode==='atlas'&&!ui.amfull){ui.amq=null;rerender(true)}return}
  if(e.key==='?'){toast('단축키: 1~5 탭 이동 · / 퀘스트 찾기 · Esc 닫기');return}});
/* 접는 칸 열림 상태 기억 (다시 그려도 그대로) */
document.addEventListener('toggle',e=>{const t=e.target;if(t.dataset&&t.dataset.tg)ui[t.dataset.tg]=t.open},true);

/* 추천 레벨업: 「다음 단계」 줄을 누르거나(폰) 올리면(PC) 지도에서 그 번호 핀이 빛나요 */
function stGlow(n,on){const map=document.querySelector('.rmap');if(!map)return;const t=(ui._stp||{})[n]||String(n);
  map.querySelectorAll('.gp.hl').forEach(x=>x.classList.remove('hl'));document.querySelectorAll('.nxr3.sel').forEach(x=>x.classList.remove('sel'));if(!on)return;
  const pin=[...map.querySelectorAll('.gp')].find(b=>b.textContent.trim().replace(/\d+$/,m=>m)===t||b.firstChild&&b.firstChild.textContent===t);
  const row=document.querySelector('.nxr3[data-st="'+n+'"]');if(row)row.classList.add('sel');
  if(pin){pin.classList.add('hl');const r=map.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)map.scrollIntoView({block:'center',behavior:'smooth'})}
  else if(on==='tap'&&!(ui._stp||{})[n])toast('이 단계는 지금 지도(같은 지역) 밖이에요')}
document.addEventListener('click',e=>{const r=e.target.closest&&e.target.closest('.nxr3[data-st]');if(!r)return;const n=r.dataset.st;ui._stsel=ui._stsel===n?null:n;stGlow(ui._stsel||0,ui._stsel?'tap':false)});
document.addEventListener('mouseover',e=>{if(!isPC())return;const r=e.target.closest&&e.target.closest('.nxr3[data-st]');if(r)stGlow(r.dataset.st,'hover')});
document.addEventListener('mouseout',e=>{if(!isPC())return;const r=e.target.closest&&e.target.closest('.nxr3[data-st]');if(r&&!(e.relatedTarget&&r.contains(e.relatedTarget)))stGlow(ui._stsel||0,ui._stsel?'hover':false)});
