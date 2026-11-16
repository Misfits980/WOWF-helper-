// wowf.io·forg.gg 같은 사이트를 긁을 때 쓰는 공통 get
// - 성공: 본문 글자 / 없는 페이지(404): '' / 받지 못함(사이트가 닫힘·막힘·시간 초과): null
// - 같은 사이트가 연달아 6번 실패하면 그 사이트는 「닫힘」으로 보고 더 묻지 않음(null)
//   → 받은 자료가 없을 때 예전 자료를 지우거나 「없음」으로 덮어쓰지 않게, 부르는 쪽이 null을 구별해서 씀
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fails = new Map();
const LIMIT = 6;

export function hostDown(u) {
  try { return (fails.get(new URL(u).host) || 0) >= LIMIT; } catch (e) { return false; }
}

export function makeGet(pause = 550) {
  return async function get(u) {
    let host = '';
    try { host = new URL(u).host; } catch (e) { return null; }
    if ((fails.get(host) || 0) >= LIMIT) return null;
    for (let k = 0; k < 3; k++) {
      try {
        const r = await fetch(u, { headers: { 'user-agent': 'WOWF-helper data sync (github.com/Misfits980/WOWF-helper-)', 'accept-language': 'ko' } });
        if (r.status === 404) { fails.set(host, 0); return ''; }
        if (r.ok) { fails.set(host, 0); await sleep(pause); return await r.text(); }
      } catch (e) { /* 다시 시도 */ }
      await sleep(2500);
    }
    const n = (fails.get(host) || 0) + 1;
    fails.set(host, n);
    if (n === LIMIT) console.log('⚠️', host, '연달아 받지 못함 — 닫힌 것으로 보고 이번에는 예전 자료를 그대로 둠');
    return null;
  };
}
