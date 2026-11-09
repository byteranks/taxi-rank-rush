// Lets the game open offline and load faster. Online scores always go straight to the internet.
const CACHE='trr-v1';
const CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.hostname.endsWith('supabase.co'))return;
  const save=res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res};
  // The game page: newest version when online, saved copy when offline
  if(r.mode==='navigate'||u.pathname.endsWith('.html')||u.pathname.endsWith('/')){
    e.respondWith(fetch(r).then(save).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))));return}
  // Icons and fonts: saved copy first
  if(u.origin===location.origin||/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(save)))}
});
