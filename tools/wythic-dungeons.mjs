// wythic.com 포에버 던전 페이지에서 보스별 공략 한 줄(우두머리 기술 설명)·드랍·일반 몹 드랍을 가져와 data/wythic/dungeons.json 으로 저장
// (페이지 안에 들어 있는 자료만 읽음. 외부 코드를 실행하지 않음)
import fs from 'node:fs';
const B = 'https://wythic.com';
const UA = { 'user-agent': 'Mozilla/5.0 (WOWF-helper data sync; github.com/Misfits980/WOWF-helper-)', 'accept-language': 'ko' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function get(u) { for (let i = 0; i < 3; i++) { try { const r = await fetch(u, { headers: UA }); if (r.ok) return await r.text(); console.log('HTTP', r.status, u) } catch (e) { console.log('ERR', e.message, u) } await sleep(1500 * (i + 1)) } return '' }
function rsc(h) { let t = ''; for (const m of h.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)) { try { t += JSON.parse(m[1]) } catch (e) {} } return t }
function grab(t, i) { const st = i; let d = 0, ins = false, esc = false; for (; i < t.length; i++) { const c = t[i]; if (ins) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') ins = false; continue } if (c === '"') { ins = true; continue } if (c === '[' || c === '{') d++; else if (c === ']' || c === '}') { d--; if (d === 0) { i++; break } } } return { v: JSON.parse(t.slice(st, i)), end: i } }
const U = v => (v === '$undefined' || v == null) ? undefined : v;
const item = (d, src) => { const a = [d.id, d.name, U(d.slot) || '', U(d.level) || 0, d.quality || 0, U(d.icon) || '']; if (src) a.push(src); return a };

const idx = await get(B + '/ko/forever/dungeons');
const ids = [...new Set([...idx.matchAll(/\/ko\/forever\/dungeons\/(\d+)/g)].map(m => +m[1]))];
console.log('dungeons', ids.length);
const out = [];
for (const id of ids) {
  const h = await get(B + '/ko/forever/dungeons/' + id); if (!h) continue;
  const t = rsc(h);
  try {
    const name = (t.match(new RegExp('"zoneId":' + id + ',"name":"([^"]+)"')) || [])[1] || '';
    const lv = (t.match(/"children":\["Lv ",(\d+),"–",(\d+)\]/) || []).slice(1).map(Number);
    let route = null; const iR = t.indexOf('"route":{"zoneId":' + id); if (iR >= 0) route = grab(t, iR + 8).v;
    const steps = route ? route.floors.flatMap(f => (f.steps || []).map(s => ({ ...s, fl: f.label }))) : [];
    let bosses = [], trash = [];
    const iB = t.indexOf('"bosses":[{"key"');
    if (iB >= 0) {
      const g = grab(t, iB + 9); bosses = g.v;
      const iT = t.indexOf('{"items":[', g.end); if (iT >= 0 && iT - g.end < 400) trash = grab(t, iT + 9).v;
    }
    const D = {
      id, name, lv, sum: U(route && route.summary) || '',
      bosses: bosses.map(b => { const s = steps.find(x => x.npc === b.npc) || {}; return { n: b.n, npc: b.npc, id: U(s.npcId) || 0, fl: U(b.floor) || '', opt: !!U(b.optional), tip: U(b.tip) || U(s.tip) || '', drops: (b.drops || []).map(d => item(d)) } }),
      // 지도에만 있고 드랍 목록엔 없는 보스(희귀·이벤트)도 공략 한 줄은 남김
      extra: steps.filter(s => !bosses.some(b => b.npc === s.npc) && U(s.tip)).map(s => ({ n: s.n, npc: s.npc, id: U(s.npcId) || 0, fl: s.fl, opt: !!U(s.optional), tip: s.tip })),
      trash: trash.map(d => item(d, U(d.npc) || ''))
    };
    out.push(D); console.log(id, name, lv.join('-'), 'bosses', D.bosses.length, 'tips', D.bosses.filter(b => b.tip).length, 'trash', D.trash.length);
  } catch (e) { console.log('parse fail', id, e.message) }
  await sleep(700);
}
if (out.length < 10) { console.log('too few, keep old'); process.exit(0) }
fs.mkdirSync('data/wythic', { recursive: true });
fs.writeFileSync('data/wythic/dungeons.json', JSON.stringify({ src: 'https://wythic.com/ko/forever/dungeons', fetched: new Date().toISOString().slice(0, 10), dungeons: out }));
console.log('saved', out.length);
