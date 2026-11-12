// 용현님이 준 사이트들이 자동으로 읽히는지 확인
import fs from 'node:fs';
const S=['https://wythic.com/ko/forever/dungeons/721','https://wowf.io/ko','https://forever-tool.com','https://eternadex.com/en/','https://bindonforever.com','https://db.icy-veins.com/wow-forever/','https://wowguildhub.com/wow-forever/guide','https://zephras.com','https://tradly.co.kr/wowf/dungeons','https://tradly.co.kr/wowf/legacy'];
const out=[];
for(const u of S){try{const r=await fetch(u,{headers:{'user-agent':'Mozilla/5.0 (WOWF-helper)','accept-language':'ko'}});const h=await r.text();
  const txt=h.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<style[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  const nd=/__NEXT_DATA__|self\.__next_f|__NUXT__|window\.__INITIAL|application\/json/.test(h);
  const apis=[...new Set([...h.matchAll(/["'`](\/?(?:api|_next\/data|data)\/[^"'`\s]{3,80})["'`]/g)].map(m=>m[1]))].slice(0,8);
  out.push(['##',u,'status',r.status,'html',h.length,'text',txt.length,'embedded',nd,'apis',apis.join(' ')].join(' '));out.push('  '+txt.slice(0,400))}
  catch(e){out.push('## '+u+' ERR '+e.message)}}
fs.writeFileSync('data/_probe.txt',out.join('\n'));
