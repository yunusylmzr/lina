/* Başlat + HUD düğmeleri */
(() => {
  const mute = document.getElementById('btn-mute');
  const sync = () => mute.classList.toggle('muted', !!G.S.muted);
  mute.onclick = () => { Audio.unlock(); Audio.setMuted(!G.S.muted); sync(); if (!G.S.muted) Audio.sfx('pop'); };
  sync();
  document.getElementById('btn-home').onclick = () => { Audio.sfx('tap'); if (G.scene === 'hub') return; G.closePanels(); G.go('hub'); };
  // iOS: ekran uyumasını engelle (dokunuş sonrasında video hilesi yerine sadece wake lock dene)
  document.addEventListener('pointerdown', async () => { try { if (navigator.wakeLock && !window._wl) window._wl = await navigator.wakeLock.request('screen'); } catch (e) {} }, { once: true });
  window.addEventListener('error', e => console.error(e.message));
  document.addEventListener('pointerdown', () => Audio.unlock(), { capture: true });
  G.start(); G.go('title');
})();
