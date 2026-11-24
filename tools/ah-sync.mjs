// 💰 와우 포에버 경매장 시세 받기 — .github/workflows/ah.yml 이 1시간마다 돌림 (전투정보실 불러오기와 같은 방식)
// 블리자드 개발자 API(경매장)를 키(BNET_ID · BNET_SECRET, GitHub Secrets에만 둠)로 읽어서 앱이 읽는 작은 파일로 줄임.
// 매물 하나하나·판매자 정보는 남기지 않음: 경매장마다 아이템별 「매물 개수」와 「싼 것부터 1·5·20·50·100·200·500·1000번째 한 개 값」만.
// 나오는 곳: ah-out/index.json(경매장 목록) · ah-out/h-<연결서버>-<경매장>.txt → 워크플로가 ah-data 가지에 덮어씀(기록이 쌓이지 않음)
// 시험: node tools/ah-sync.mjs --sample 샘플.json  (블리자드 경매장 응답 모양 파일로 줄이기만 해 봄, 키 필요 없음)
import fs from 'node:fs';

const R = (process.env.AH_REGION || 'kr').toLowerCase();
const OUT = process.env.AH_OUT || 'ah-out';
const K = [1, 5, 20, 50, 100, 200, 500, 1000];
const API = process.env.AH_API || `https://${R}.api.blizzard.com`; // AH_API·AH_OAUTH는 시험용(가짜 서버)
const LOC = { kr: 'ko_KR', tw: 'zh_TW', eu: 'en_GB', us: 'en_US' }[R] || 'en_US';
const HORDE = process.env.AH_HORDE === '1'; // 앱은 얼라이언스용이라 기본은 얼라이언스·중립만
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b36 = n => Math.max(0, Math.round(n)).toString(36);

/* 경매장 응답(auctions 배열) → 「번호:매물 개수:값,…」|… · 값은 한 개 값(즉시 구매가 ÷ 개수, 코퍼) */
export function squeeze(auctions) {
  const P = new Map();
  let n = 0;
  for (const a of auctions || []) {
    const id = a && a.item && a.item.id, q = +(a && a.quantity) || 1;
    const unit = a && a.unit_price ? +a.unit_price : a && a.buyout ? +a.buyout / q : 0;
    if (!id || !(unit > 0)) continue;
    let L = P.get(id); if (!L) P.set(id, L = []);
    L.push([Math.round(unit), q]); n++;
  }
  const parts = [];
  for (const id of [...P.keys()].sort((a, b) => a - b)) {
    const L = P.get(id).sort((a, b) => a[0] - b[0]);
    let q = 0, ki = 0; const out = [];
    for (const [u, c] of L) { q += c; while (ki < K.length && q >= K[ki]) { out.push(b36(u)); ki++ } }
    parts.push(b36(id) + ':' + b36(q) + ':' + out.join(','));
  }
  return { body: parts.join('|'), n, ni: parts.length };
}
const facOf = (id, name) => /얼라이언스|alliance/i.test(name || '') ? 'a' : /호드|horde/i.test(name || '') ? 'h' : id === 2 ? 'a' : id === 6 ? 'h' : 'n';

async function sample(file) {
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  const s = squeeze(j.auctions);
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(OUT + '/h-sample.txt', s.body);
  console.log('매물', s.n, '아이템', s.ni, '글자', s.body.length);
}

let TOK = '';
async function token(id, sec) {
  const r = await fetch(process.env.AH_OAUTH || 'https://oauth.battle.net/token', { method: 'POST', headers: { Authorization: 'Basic ' + Buffer.from(id + ':' + sec).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials' });
  if (!r.ok) throw new Error('토큰을 못 받았어요 ' + r.status + ' ' + (await r.text()).slice(0, 200));
  return (await r.json()).access_token;
}
async function get(path, ns, raw) {
  const u = API + path + (path.includes('?') ? '&' : '?') + 'namespace=' + ns + '&locale=' + LOC;
  for (let i = 0; i < 4; i++) {
    const r = await fetch(u, { headers: { Authorization: 'Bearer ' + TOK } });
    if (r.status === 404) return null;
    if (r.ok) return raw ? { j: await r.json(), lm: r.headers.get('last-modified') } : r.json();
    if (r.status === 429 || r.status >= 500) { await sleep(2000 * (i + 1)); continue }
    throw new Error(path + ' ' + ns + ' → ' + r.status);
  }
  return null;
}
const idOf = href => +((String(href || '').match(/connected-realm\/(\d+)/) || [])[1] || 0);

/* 연결 서버 목록과 서버 이름(한글) */
async function realmsOf(ns, max) {
  const I = await get('/data/wow/connected-realm/index', ns);
  if (!I || !Array.isArray(I.connected_realms)) return null;
  const out = [];
  for (const x of I.connected_realms.slice(0, max || 80)) {
    const cr = idOf(x.href); if (!cr) continue;
    const D = await get('/data/wow/connected-realm/' + cr, ns);
    if (!D) continue;
    out.push({ cr, rl: (D.realms || []).map(r => r.name).filter(Boolean), slug: (D.realms || []).map(r => r.slug), cat: (D.realms || []).map(r => r.category).filter(Boolean), ty: ((D.realms || [])[0] || {}).type && D.realms[0].type.type });
    await sleep(60);
  }
  return out;
}

/* 포에버가 어느 네임스페이스인지: 이름에 forever가 들어간 것 → 전투정보실 명단(chars.txt)의 서버 이름이 있는 것 → 서버 분류에 Forever·포에버 */
async function findNs() {
  const want = new Set();
  try {
    for (const l of fs.readFileSync('data/armory/chars.txt', 'utf8').split('\n')) {
      const m = l.trim().match(/^([a-z]{2})\|[^-]+-(.+)$/); if (m && m[1] === R) want.add(m[2].toLowerCase());
    }
  } catch (e) {}
  const C = ['forever', 'classicforever', 'classic1x', 'classic', 'classicann', 'classic60', 'classic2x'].map(x => 'dynamic-' + x + '-' + R);
  let best = null;
  for (const ns of C) {
    const L = await realmsOf(ns, 80);
    if (!L) { console.log('네임스페이스', ns, '없음'); continue }
    const names = L.flatMap(x => x.rl.concat(x.slug)).map(s => String(s).toLowerCase());
    const hit = [...want].filter(w => names.includes(w)).length;
    const cat = L.some(x => x.cat.some(c => /forever|포에버/i.test(c)));
    console.log('네임스페이스', ns, '연결 서버', L.length, '명단 서버 맞음', hit + '/' + want.size, '분류 포에버', cat, '예:', L.slice(0, 4).map(x => x.rl.join('·') + '(' + x.cat.join(',') + ')').join(' / '));
    const score = (/forever/.test(ns) ? 4 : 0) + (hit ? 2 + hit : 0) + (cat ? 3 : 0);
    if (score && (!best || score > best.score)) best = { ns, L, score };
  }
  return best;
}

async function main() {
  const si = process.argv.indexOf('--sample');
  if (si > 0) return sample(process.argv[si + 1]);
  const id = process.env.BNET_ID, sec = process.env.BNET_SECRET;
  if (!id || !sec) { console.log('BNET_ID · BNET_SECRET 키가 아직 없어요 (저장소 Settings → Secrets → Actions). 이번엔 건너뛰어요.'); return }
  TOK = await token(id, sec);
  let prev = null;
  if (process.env.AH_PREV) { try { const r = await fetch(process.env.AH_PREV + '?t=' + Date.now()); if (r.ok) prev = await r.json() } catch (e) {} }
  let ns = process.env.AH_NS || (prev && prev.ns) || '', L = null;
  if (ns) L = await realmsOf(ns, 120);
  if (!L || !L.length) { const b = await findNs(); if (!b) throw new Error('포에버 경매장 네임스페이스를 못 찾았어요 (위 기록을 보고 AH_NS로 직접 넣기)'); ns = b.ns; L = await realmsOf(ns, 120) || b.L }
  console.log('쓰는 네임스페이스', ns, '연결 서버', L.length);
  fs.mkdirSync(OUT, { recursive: true });
  const H = [];
  for (const x of L) {
    const A = await get('/data/wow/connected-realm/' + x.cr + '/auctions/index', ns);
    const houses = A && Array.isArray(A.auctions) ? A.auctions : [];
    if (!houses.length) { console.log('연결 서버', x.cr, x.rl.join('·'), '경매장 목록 없음'); continue }
    for (const h of houses) {
      const f = facOf(h.id, h.name);
      if (f === 'h' && !HORDE) continue;
      const g = await get('/data/wow/connected-realm/' + x.cr + '/auctions/' + h.id, ns, true);
      const list = g && g.j && g.j.auctions;
      if (!Array.isArray(list)) { console.log('경매장', x.cr, h.id, h.name, '매물 못 받음'); continue }
      const s = squeeze(list); if (!s.ni) continue;
      const k = x.cr + '-' + h.id;
      fs.writeFileSync(OUT + '/h-' + k + '.txt', s.body);
      const t = Date.parse(g.lm || '') || Date.now();
      H.push({ k, cr: x.cr, ah: h.id, f, nm: h.name || '', rl: x.rl, ty: x.ty || '', n: s.n, ni: s.ni, t });
      console.log('경매장', k, x.rl.join('·'), h.name, '매물', s.n, '아이템', s.ni, '글자', s.body.length);
      await sleep(200);
    }
  }
  if (!H.length) throw new Error('받은 경매장이 하나도 없어요');
  fs.writeFileSync(OUT + '/index.json', JSON.stringify({ v: 1, t: Date.now(), region: R, ns, h: H }));
  fs.writeFileSync(OUT + '/README.md', '와포 도우미 경매장 시세 (tools/ah-sync.mjs가 1시간마다 덮어씀 · 블리자드 개발자 API)\n');
}
if (import.meta.url === 'file://' + process.argv[1] || process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) main().catch(e => { console.error(String(e && e.stack || e)); process.exit(1) });
