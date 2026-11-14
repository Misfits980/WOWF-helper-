// 앱에서 보낸 「명단에 넣어 주세요」 요청(textdb.dev wfh-armreq 대기열)을 읽어
// 전투정보실에 진짜 있는 캐릭터만 data/armory/chars.txt 에 더하고, 대기열을 비움.
import fs from 'node:fs';
const Q='https://textdb.dev/api/data/wfh-armreq';const F='data/armory/chars.txt';const MAX=80;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let raw='';try{const r=await fetch(Q,{cache:'no-store'});raw=r.ok?await r.text():''}catch(e){console.log('대기열 못 읽음',e.message);process.exit(0)}
const req=[...new Set(raw.split('\n').map(s=>s.trim()).filter(Boolean))];
if(!req.length){console.log('요청 없음');process.exit(0)}
const txt=fs.readFileSync(F,'utf8');const have=new Set(txt.split('\n').map(s=>s.trim().toLowerCase()).filter(s=>s&&!s.startsWith('#')));
let n=have.size;const add=[],keep=[];
for(const l of req.slice(0,30)){
  const m=l.match(/^(kr|us|eu|tw)\|([^\s|/\\-]{2,12})-([^\s|/\\]{2,24})$/);if(!m){console.log('모양 틀림',l);continue}
  const line=m[1]+'|'+m[2]+'-'+m[3];if(have.has(line.toLowerCase())){console.log('이미 있음',line);continue}
  if(n>=MAX){console.log('명단 꽉 참',line);keep.push(l);continue}
  const url='https://worldofwarcraft.blizzard.com/ko-kr/forever/'+m[1]+'/armory/character/'+encodeURIComponent((m[2]+'-'+m[3]).toLowerCase());
  try{const r=await fetch(url,{headers:{'user-agent':'Mozilla/5.0 (WOWF-helper armory request; github.com/Misfits980/WOWF-helper-)','accept-language':'ko'}});
    const h=r.ok?await r.text():'';if(r.ok&&h.includes('characterProfileInitialState')&&/"level":\d+/.test(h)){add.push(line);have.add(line.toLowerCase());n++;console.log('더함',line)}
    else console.log('전투정보실에 없음',line,r.status)}
  catch(e){console.log('확인 실패(다음에 다시)',line,e.message);keep.push(l)}
  await sleep(1500)}
if(add.length)fs.writeFileSync(F,txt.replace(/\n*$/,'\n')+add.join('\n')+'\n');
try{await fetch(Q,{method:'POST',headers:{'Content-Type':'text/plain'},body:keep.join('\n')||' '})}catch(e){}
console.log('끝: 더함',add.length,'남김',keep.length);
