// wythic.com 전문기술 제작법 자료(/data/professions/{slug}.json)에서 제작법·만드는 아이템·재료의 한글 이름과 아이콘만 모아
// data/wythic/profs.json 으로 저장 (영어 이름 한글화 + 아이콘 표시용)
import fs from 'node:fs';
const B = 'https://wythic.com';
const UA = { 'user-agent': 'Mozilla/5.0 (WOWF-helper data sync; github.com/Misfits980/WOWF-helper-)' };
const SL = ['alchemy', 'blacksmithing', 'enchanting', 'engineering', 'leatherworking', 'tailoring', 'cooking', 'first-aid', 'mining'];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const N = {};   // 이름(영어/한글) → [한글, 아이콘, 영어]
const put = (en, ko, icon) => { if (!en && !ko) return; const v = [ko || '', icon || '', en || '']; if (en && !N[en]) N[en] = v; if (ko && !N[ko]) N[ko] = v };
let n = 0;
for (const s of SL) {
  let j = null;
  for (let i = 0; i < 3 && !j; i++) { try { const r = await fetch(B + '/data/professions/' + s + '.json', { headers: UA }); if (r.ok) j = await r.json(); else console.log('HTTP', r.status, s) } catch (e) { console.log('ERR', e.message) } if (!j) await sleep(1500) }
  if (!j) continue;
  for (const m of Object.values(j.mats || {})) put(m.name, m.nameKo, m.icon);
  for (const sp of j.spells || []) { put(sp.name, sp.nameKo, sp.icon); if (sp.creates) put(sp.creates.name, sp.creates.nameKo, sp.creates.icon || sp.icon); n++ }
  console.log(s, (j.spells || []).length, Object.keys(j.mats || {}).length);
  await sleep(500);
}
if (n < 100) { console.log('too few, keep old'); process.exit(0) }
fs.mkdirSync('data/wythic', { recursive: true });
fs.writeFileSync('data/wythic/profs.json', JSON.stringify({ src: B + '/ko/forever/professions', n: N }));
console.log('saved names', Object.keys(N).length);
