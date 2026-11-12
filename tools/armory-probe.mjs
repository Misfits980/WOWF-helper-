// 전투정보실 페이지 구조 확인용 (키 없이 공개 페이지만 읽음)
import fs from 'node:fs';
const urls=['https://worldofwarcraft.blizzard.com/en-gb/forever/eu/armory/character/judgement-judy','https://worldofwarcraft.blizzard.com/ko-kr/forever/eu/armory/character/judgement-judy'];
const out=[];
for(const u of urls){
  try{const r=await fetch(u,{headers:{'user-agent':'Mozilla/5.0 (WOWF-helper)','accept-language':'ko'}});const h=await r.text();
    out.push('### '+u+' status '+r.status+' len '+h.length);
    out.push('title: '+(h.match(/<title>([^<]*)/)||[])[1]);
    const vars=[...h.matchAll(/(?:var|window\.)\s*([A-Za-z_$][\w$]*)\s*=\s*[\[{]/g)].map(m=>m[1]);out.push('vars: '+[...new Set(vars)].join(','));
    for(const kw of ['equipment','equippedItems','"items"','inventoryType','itemLevel','"slot"']){const i=h.indexOf(kw);out.push('['+kw+'] @'+i+': '+(i>=0?h.slice(Math.max(0,i-200),i+600).replace(/\s+/g,' '):''))}
    const srcs=[...h.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m=>m[1]).slice(0,15);out.push('srcs: '+srcs.join(' '));
    const apis=[...new Set([...h.matchAll(/["'](\/[a-z-]+\/[^"']*(?:api|json|summary|equipment)[^"']*)["']/gi)].map(m=>m[1]))].slice(0,20);out.push('apis: '+apis.join(' '));
  }catch(e){out.push('ERR '+u+' '+e)}
}
fs.mkdirSync('data/armory',{recursive:true});fs.writeFileSync('data/armory/_probe.txt',out.join('\n'));
