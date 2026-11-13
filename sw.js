/* 와포 도우미 서비스 워커
   - 첫 화면(index.html): 인터넷 먼저 → 안 되면 저장해 둔 것 (업데이트가 바로 보이게)
   - app-data.js·data/…?v= : 주소에 버전이 붙어 있어서 한 번 받으면 저장본 사용 (다시 열 때 빠름)
   - 아이템 아이콘(외부 그림)은 브라우저 기본 캐시에 맡김 */
const APP='wfh-app-v1';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==APP)await caches.delete(k);await self.clients.claim()})())});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(u.origin===location.origin){
    if(r.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('index.html')){
      e.respondWith((async()=>{const c=await caches.open(APP);try{const res=await fetch(r.url,{cache:'no-cache',credentials:'same-origin'});if(res.ok)c.put('./',res.clone());return res}catch(_){return (await c.match('./'))||Response.error()}})());return}
    if(u.searchParams.has('v')&&!u.pathname.includes('/armory/')){
      e.respondWith((async()=>{const c=await caches.open(APP);const hit=await c.match(r);if(hit)return hit;const res=await fetch(r);
        if(res.ok){/* 같은 파일의 예전 버전은 지움 */for(const k of await c.keys()){const ku=new URL(k.url);if(ku.pathname===u.pathname&&ku.search!==u.search)await c.delete(k)}await c.put(r,res.clone())}return res})());return}
    if(/\/img\/[^/]+\.(png|jpg|svg)$/.test(u.pathname)){
      e.respondWith((async()=>{const c=await caches.open(APP);const hit=await c.match(r);const net=fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res}).catch(()=>hit);return hit||net})());return}
    return}
});
