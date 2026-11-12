import fs from 'node:fs';
const out=[];
for(const u of ['https://www.wowhead.com/forever/ko/quest=12','https://www.wowhead.com/forever/ko/quest=783']){
  try{const r=await fetch(u,{headers:{'user-agent':'Mozilla/5.0 (WOWF-helper)','accept-language':'ko'}});const h=await r.text();
    out.push('### '+u+' '+r.status+' '+h.length+' title '+(h.match(/<title>([^<]*)/)||[])[1]);
    for(const kw of ['class="series"','iconlist','g_quests[','"reqitems"','WH.markup','Requirements','필요','Provided','objectives','진행 상황','완료','<h2 class="heading-size-3">']){let i=-1,n=0;while((i=h.indexOf(kw,i+1))>=0&&n<2){out.push('['+kw+'] '+h.slice(Math.max(0,i-150),i+900).replace(/\s+/g,' '));n++}}
  }catch(e){out.push('ERR '+e)}}
fs.mkdirSync('data/armory',{recursive:true});fs.writeFileSync('data/_probe.txt',out.join('\n\n'));
