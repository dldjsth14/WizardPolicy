/* Aggregate only; store no IP, email, full user agent or referrer. */
(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  if (params.has('noanalytics') || params.has('preview') || navigator.doNotTrack === '1' || navigator.globalPrivacyControl || navigator.webdriver) return;
  if (!['dldjsth14.github.io', 'icecow-visionwizard-play.blackyak256.chatgpt.site'].includes(location.hostname)) return;
  const endpoint = 'https://icecow-visionwizard-play.blackyak256.chatgpt.site/api/visit';
  let memoryDay = '', memoryId = '';
  const uuid = () => {
    if (crypto.randomUUID) return crypto.randomUUID();
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
  };
  const visitor = () => {
    const day = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
    if (memoryDay !== day) { memoryDay = day; memoryId = uuid(); }
    try {
      const key = 'vw-visit-' + day;
      const stored = localStorage.getItem(key);
      if (/^[a-f0-9-]{36}$/.test(stored || '')) memoryId = stored;
      else localStorage.setItem(key, memoryId);
      for (const old of Object.keys(localStorage)) if (old.startsWith('vw-visit-') && old !== key) localStorage.removeItem(old);
    } catch (_) { /* Private browsing/storage failures keep an in-memory ID. */ }
    return memoryId;
  };
  const send = kind => {
    try {
      const payload = JSON.stringify({id:uuid(), visitor:visitor(), kind});
      if (navigator.sendBeacon && navigator.sendBeacon(endpoint, payload)) return;
      fetch(endpoint, {method:'POST', body:payload, credentials:'omit', keepalive:true, referrerPolicy:'no-referrer'}).catch(() => {});
    } catch (_) { /* Analytics must never block the store links or copy button. */ }
  };
  const view = () => send('view');
  if (document.visibilityState === 'hidden') {
    const visible = () => { if (document.visibilityState === 'visible') { document.removeEventListener('visibilitychange', visible); view(); } };
    document.addEventListener('visibilitychange', visible);
  } else view();
  for (const [id, kind] of [['web-link','web'], ['android-link','app'], ['copy-link','copy']]) document.getElementById(id)?.addEventListener('click', () => send(kind), {passive:true});
})();
