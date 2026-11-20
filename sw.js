/* 와포 도우미 서비스 워커
   - 첫 화면(index.html): 인터넷 먼저 → 안 되면 저장해 둔 것 (업데이트가 바로 보이게)
   - app-data.js·data/…?v= : 주소에 버전이 붙어 있어서 한 번 받으면 저장본 사용 (다시 열 때 빠름)
   - 앱 그림·던전 지도 그림(data/dgmap): 저장본 먼저, 뒤에서 새로 받음
   - 아이템 아이콘(외부 그림)은 브라우저 기본 캐시에 맡김 */
const APP='wfh-app-v1';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==APP)await caches.delete(k);await self.clients.claim()})())});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(u.origin===location.origin){
    /* 새 화면 미리보기(preview/)는 건드리지 않음: 실제 앱 첫 화면 저장본이 미리보기로 바뀌지 않게 */
    if(u.pathname.includes('/preview/'))return;
    /* 앱 첫 화면(/·index.html)만 저장본으로 — 예전엔 다른 페이지(icons.html 등)를 열면 그 페이지가 앱 저장본을 덮어써 인터넷이 끊기면 앱이 안 나왔음 */
    const shell=u.pathname.endsWith('/')||u.pathname.endsWith('/index.html');if(r.mode==='navigate'&&!shell)return;
    if(shell){
      e.respondWith((async()=>{const c=await caches.open(APP);try{const res=await fetch(r.url,{cache:'no-cache',credentials:'same-origin'});if(res.ok){c.put('./',res.clone());return res}/* 서버 오류 화면(503 등)보다 저장해 둔 앱 */const hit=await c.match('./');return hit||res}catch(_){return (await c.match('./'))||Response.error()}})());return}
    if(u.searchParams.has('v')&&!u.pathname.includes('/armory/')){
      e.respondWith((async()=>{const c=await caches.open(APP);const hit=await c.match(r);if(hit)return hit;const res=await fetch(r);
        if(res.ok){/* 같은 파일의 예전 버전은 지움 */for(const k of await c.keys()){const ku=new URL(k.url);if(ku.pathname===u.pathname&&ku.search!==u.search)await c.delete(k)}await c.put(r,res.clone())}return res})());return}
    /* 앱 그림 + 던전 위에서 본 지도 그림(data/dgmap): 저장본 먼저 보이고 뒤에서 새로 받음 — 인터넷이 끊겨도 한 번 본 지도는 그림까지 나옴 */
    if(/\/img\/[^/]+\.(png|jpg|svg)$/.test(u.pathname)||/\/data\/dgmap\/[^/]+\.(webp|png)$/.test(u.pathname)){
      e.respondWith((async()=>{const c=await caches.open(APP);const hit=await c.match(r);const net=fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res}).catch(()=>hit);return hit||net})());return}
    return}
});
