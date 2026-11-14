// 블리자드 공개 전투정보실 페이지(키 필요 없음)에서 명단 캐릭터의 레벨·장비를 읽어 data/armory/chars.json 에 저장
import fs from 'node:fs';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function grabAt(t,i){const st=i;let d=0,ins=false,esc=false;for(;i<t.length;i++){const c=t[i];if(ins){if(esc)esc=false;else if(c==='\\')esc=true;else if(c==='"')ins=false;continue}if(c==='"'){ins=true;continue}if(c==='['||c==='{')d++;else if(c===']'||c==='}'){d--;if(d===0){i++;break}}}return JSON.parse(t.slice(st,i))}
const lines=fs.readFileSync('data/armory/chars.txt','utf8').split('\n').map(s=>s.trim()).filter(s=>s&&!s.startsWith('#'));
const prev=fs.existsSync('data/armory/chars.json')?JSON.parse(fs.readFileSync('data/armory/chars.json','utf8')):{};
const out={};const probe=[];
for(const l of lines){const [region,raw]=l.split('|').map(s=>s.trim());const slug=raw.toLowerCase();const key=region+'/'+slug;
  const url='https://worldofwarcraft.blizzard.com/ko-kr/forever/'+region+'/armory/character/'+encodeURIComponent(slug);
  try{const r=await fetch(url,{headers:{'user-agent':'Mozilla/5.0 (WOWF-helper armory sync; github.com/Misfits980/WOWF-helper-)','accept-language':'ko'}});
    if(!r.ok){out[key]=Object.assign({},prev[key]||{},{err:'페이지 없음 ('+r.status+')',checked:new Date().toISOString()});await sleep(1500);continue}
    const h=await r.text();const i=h.indexOf('characterProfileInitialState');const j=h.indexOf('{',i);const S=grabAt(h,j);
    const ch=S.character||{};
    if(probe.length<1)probe.push(JSON.stringify(Object.keys(S))+'\n'+JSON.stringify(ch).slice(0,3000)+'\n'+JSON.stringify(Object.values(ch.gear||S.gear||{})[0]||{}).slice(0,6000));
    const gear={};for(const [k,g] of Object.entries(ch.gear||S.gear||{})){if(!g||!g.id&&!(g.item&&g.item.id))continue;
      const stats=(g.stats||[]).map(s=>[s.type&&s.type.type,s.value]).filter(x=>x[0]);
      const spells=(g.spells||[]).map(s=>s.description||s.display_string||'').filter(Boolean);
      const icon=((g.media&&g.media.content&&g.media.content.assets)||[]).map(a=>a.value)[0]||'';
      gear[k]={id:g.id||g.item.id,slot:g.slot&&g.slot.type,nm:g.name,q:g.quality&&g.quality.type,icon,stats,spells,cls:g.item_class&&g.item_class.id,sub:g.item_subclass&&g.item_subclass.id,inv:g.inventory_type&&g.inventory_type.type,req:g.requirements&&g.requirements.level&&g.requirements.level.value,ilvl:g.level&&g.level.value,dps:g.weapon&&g.weapon.dps&&g.weapon.dps.value}}
    out[key]={key,region,slug,name:ch.name||raw,level:ch.level?+ch.level:null,race:(ch.race&&(ch.race.slug||ch.race.name))||'',raceName:ch.race&&ch.race.name,cls:(ch.class&&(ch.class.slug||ch.class.name))||(ch.characterClass&&ch.characterClass.slug)||'',clsName:(ch.class&&ch.class.name)||'',spec:(ch.spec&&(ch.spec.slug||ch.spec.name))||'',gear,tal:(ch.specs||S.specs||[]).map(t=>({id:t.id,name:t.name,pts:t.spentPoints||0,t:(t.talents||[]).map(x=>[x.name,x.rank||0,((x.icon&&x.icon.url||'').match(/(\d+)\.jpg/)||[])[1]||''])})),checked:new Date().toISOString()};
    console.log(key,'lv',out[key].level,'gear',Object.keys(gear).length);
  }catch(e){out[key]=Object.assign({},prev[key]||{},{err:String(e).slice(0,120),checked:new Date().toISOString()});console.log(key,'ERR',e)}
  await sleep(1500)}
fs.writeFileSync('data/armory/chars.json',JSON.stringify(out));

