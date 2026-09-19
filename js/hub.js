/* Harita: Tuzla sahili boyunca günün durakları */
G.scenes.hub = (() => {
  const guest = i => G.guests()[i];
  const STOPS = [
    { id: 'school', name: 'Okul Yolu', px: .12, py: .06, host: () => 'hacer', say: 'Günaydın Lina! Zil çalmadan okula yetiş, yolda çantandan düşenleri topla.', tip: 'Zıplamak için ekrana dokun, kaymak için aşağı kaydır.' },
    { id: 'piano', name: 'Piyano', px: .29, py: .78, host: () => 'serkan', say: 'Piyano vakti! Notalar çizgiye geldiğinde tuşa dokun, ben de dans ederim.', tip: 'Tam zamanında dokun, kombo yap.' },
    { id: 'paint', name: 'Karalama Atölyesi', px: .46, py: .10, host: () => 'hacer', say: 'Atölye açık! Fırçalar, simler ve damgalar seni bekliyor. Ne istersen çiz.', tip: 'Bitirince kaydet, galerinde saklanır.' },
    { id: 'mall', name: 'AVM Turu', px: .63, py: .82, host: () => guest(0) || 'hacer', say: 'Hadi AVM turuna! Listedeki her şeyi vitrinlerde bulalım.', tip: 'Listedeki eşyaları vitrinlerde bul, yanlış dokunuş süre götürür.' },
    { id: 'sushi', name: 'Suşi Şefi', px: .79, py: .12, host: () => 'serkan', say: 'Bugün şef sensin! Herkesin siparişini hazırla, benimki bol somonlu olsun.', tip: 'Malzemeleri sırayla sürükle, sonra sar ve dilimle.' },
    { id: 'family', name: 'Aile Akşamı', px: .92, py: .84, host: () => 'serkan', say: 'Gün bitti, oyun zamanı! Rakibini seç, ekranı paylaşalım.', tip: 'İki kişilik: ekranın iki yarısı.' }
  ];
  const DOCK = 74;
  let hair, cur = 0, walkTo = null, lx = 0, walkT = 0, ly = 0, seagulls = [];
  const dayT = () => { const n = STOPS.filter(s => G.S.done[s.id]).length; return G.clamp(n / 6, 0, 1) * .92; };
  const stopXY = s => { const top = G.H * .56 + 60, bot = G.H - DOCK - 34; return { x: s.px * G.W, y: top + s.py * Math.max(40, bot - top) }; };
  function nextIdx() { const i = STOPS.findIndex(s => !G.S.done[s.id]); return i < 0 ? STOPS.length - 1 : i; }
  function intro(s) {
    const who = s.host();
    const p = G.panel(`<div class="who"><canvas id="av"></canvas><div><div class="name">${G.PEOPLE[who].name}</div><h2 style="font-size:28px">${s.name}</h2></div></div>
      <p class="lead">“${s.say}”</p><p>${s.tip}</p>
      ${G.S.done[s.id] ? `<span class="badge">Bugün ★ ${G.S.done[s.id]} · en iyi ${G.S.best[s.id] || 0}</span>` : ''}
      <div class="actions"><button class="btn ghost" data-a="x">Sonra</button><button class="btn" data-a="go">Başla</button></div>`);
    p.querySelector('#av').replaceWith(Art.avatar(who, 84));
    p.querySelector('[data-a=x]').onclick = () => { G.closePanels(); Audio.sfx('tap'); };
    p.querySelector('[data-a=go]').onclick = () => { Audio.sfx('pop'); G.go(s.id); };
  }
  function dayEnd() {
    const names = G.cast().map(k => G.PEOPLE[k].name);
    const p = G.panel(`<h2>Gün tamamlandı!</h2><div class="diary">Lina okula yetişti, piyanoda <b>${G.S.best.piano || 0}</b> puan yaptı, atölyede <b>${G.S.gallery.length}</b> resim biriktirdi, AVM'yi gezdi, herkese suşi yaptı ve akşam <b>${names.join(', ')}</b> ile oyun oynadı.<br><br>Toplam yıldız: <b>★ ${G.S.totalStars}</b></div>
      <div class="actions"><button class="btn ghost" data-a="s">Serkan Dijital</button><button class="btn coral" data-a="n">Yeni güne başla</button></div>`);
    p.querySelector('[data-a=s]').onclick = () => G.go('store');
    p.querySelector('[data-a=n]').onclick = () => { G.S.days++; G.S.diary.unshift(`Gün ${G.S.days}: ★${G.S.totalStars}`); G.S.done = {}; G.save(); Audio.sfx('fanfare'); G.go('hub'); };
  }
  function diary() {
    Audio.sfx('tap'); const n = STOPS.filter(s => G.S.done[s.id]).length;
    const p = G.panel(`<h2>Günlük</h2><div class="diary">Gün <b>${G.S.days + 1}</b> · ${n}/6 durak · bugün ★ ${Object.values(G.S.done).reduce((a, b) => a + b, 0)}<br>${STOPS.map(s => `${G.S.done[s.id] ? '✅' : '⬜️'} ${s.name}${G.S.best[s.id] ? ` <span style="color:#6b7a90">(en iyi ${G.S.best[s.id]})</span>` : ''}`).join('<br>')}${G.S.diary.length ? '<br><br>' + G.S.diary.slice(0, 5).join('<br>') : ''}</div><div class="actions"><button class="btn ghost" id="x">Kapat</button></div>`);
    p.querySelector('#x').onclick = () => G.closePanels();
  }
  function drawStop(c, s, x, y, active, done) {
    c.save(); c.translate(x, y);
    const sc = Math.min(1, G.W / 1100) * (active ? 1 + Math.sin(G.T * 3) * .03 : 1); c.scale(sc, sc);
    c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0, 6, 78, 14, 0, 0, 7); c.fill();
    const O = '#ff7a1a', C = '#ff5c8a', M = '#5cd6a9', S = '#2e8bc0', Y = '#ffd166';
    switch (s.id) {
      case 'school': c.fillStyle = '#fbe3c0'; c.fillRect(-70, -90, 140, 90); c.fillStyle = '#d9534f'; c.beginPath(); c.moveTo(-78, -90); c.lineTo(0, -128); c.lineTo(78, -90); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(0, -104, 12, 0, 7); c.fill(); c.strokeStyle = '#333'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -104); c.lineTo(0, -112); c.moveTo(0, -104); c.lineTo(6, -102); c.stroke();
        c.fillStyle = S; for (let i = -2; i <= 2; i++) if (i) c.fillRect(i * 28 - 10, -72, 20, 22); c.fillStyle = '#8b5a2b'; c.fillRect(-14, -40, 28, 40); c.fillStyle = '#d9534f'; c.fillRect(60, -150, 3, 60); c.beginPath(); c.moveTo(63, -150); c.lineTo(90, -142); c.lineTo(63, -134); c.fill(); break;
      case 'piano': c.fillStyle = '#fff'; c.beginPath(); c.roundRect(-70, -80, 140, 80, 10); c.fill(); c.fillStyle = '#1b1b2f'; c.beginPath(); c.roundRect(-58, -60, 116, 30, 6); c.fill(); c.fillStyle = '#fff'; for (let i = 0; i < 9; i++) c.fillRect(-52 + i * 13, -56, 10, 22); c.fillStyle = '#1b1b2f'; for (let i = 0; i < 8; i++) if (i % 7 !== 2 && i % 7 !== 6) c.fillRect(-46 + i * 13, -56, 6, 13);
        c.fillStyle = C; c.beginPath(); c.roundRect(-40, -115, 80, 30, 10); c.fill(); G.txt(c, '♪ ♫', 0, -100, 22, '#fff'); break;
      case 'paint': c.fillStyle = '#ffe8d4'; c.beginPath(); c.roundRect(-70, -85, 140, 85, 12); c.fill(); c.fillStyle = M; c.beginPath(); c.moveTo(-76, -85); c.lineTo(76, -85); c.lineTo(60, -110); c.lineTo(-60, -110); c.fill();
        c.fillStyle = '#8b5a2b'; c.beginPath(); c.ellipse(0, -50, 46, 30, 0, 0, 7); c.fill(); [O, C, M, S, Y, '#a77cf0'].forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.arc(-28 + (i % 3) * 28, -60 + Math.floor(i / 3) * 22, 8, 0, 7); c.fill(); }); break;
      case 'mall': { const g = c.createLinearGradient(-80, -130, 80, 0); g.addColorStop(0, '#bfe3ff'); g.addColorStop(1, '#5fa8e0'); c.fillStyle = g; c.beginPath(); c.roundRect(-85, -130, 170, 130, [20, 20, 6, 6]); c.fill();
        c.fillStyle = 'rgba(255,255,255,.35)'; for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) c.fillRect(-74 + k * 26, -118 + r * 26, 18, 16);
        c.fillStyle = O; c.beginPath(); c.roundRect(-70, -150, 140, 30, 8); c.fill(); G.txt(c, 'AVM', 0, -135, 20, '#fff'); c.fillStyle = '#fff'; c.beginPath(); c.roundRect(-30, -40, 60, 40, [8, 8, 0, 0]); c.fill(); break; }
      case 'sushi': c.fillStyle = '#2b2118'; c.beginPath(); c.roundRect(-70, -85, 140, 85, 8); c.fill(); c.fillStyle = '#d9534f'; c.fillRect(-78, -95, 156, 14); c.fillStyle = '#fbe3c0'; c.fillRect(-58, -70, 116, 40);
        for (const dx of [-60, 60]) { c.fillStyle = '#e63946'; c.beginPath(); c.roundRect(dx - 12, -125, 24, 30, 8); c.fill(); c.fillStyle = Y; c.fillRect(dx - 6, -133, 12, 8); }
        c.fillStyle = '#000'; c.font = '30px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('🍣', 0, -50); break;
      case 'family': c.fillStyle = '#fff3e0'; c.fillRect(-64, -80, 128, 80); c.fillStyle = O; c.beginPath(); c.moveTo(-76, -80); c.lineTo(0, -130); c.lineTo(76, -80); c.fill(); c.fillStyle = Y; c.fillRect(-40, -60, 26, 26); c.fillRect(14, -60, 26, 26); c.fillStyle = '#8b5a2b'; c.fillRect(-12, -36, 24, 36); c.fillStyle = '#c94a6a'; c.fillRect(30, -120, 14, 26); break;
    }
    c.fillStyle = done ? '#5cd6a9' : active ? '#ff7a1a' : 'rgba(255,255,255,.92)'; c.beginPath(); c.roundRect(-72, 16, 144, 34, 17); c.fill();
    G.txt(c, done ? `★ ${done}  ${s.name}` : s.name, 0, 33, 17, done || active ? '#fff' : '#1b1b2f');
    c.restore();
  }
  return {
    landscape: true, showHome: false, showStars: true,
    enter() {
      hair = hair || Art.makeHair(7); cur = nextIdx(); const p = stopXY(STOPS[cur]); lx = p.x; ly = p.y; walkTo = null; Audio.ambience(true);
      seagulls = Array.from({ length: 3 }, (_, i) => ({ x: Math.random() * G.W, y: 40 + i * 30, v: 25 + i * 8, s: .8, ph: Math.random() * 6 }));
      const dock = document.createElement('div'); dock.id = 'dock';
      dock.innerHTML = `<button class="chip" data-a="diary">📔 Günlük</button><button class="chip hero" data-a="store">▶ Serkan Dijital</button><button class="chip" data-a="ward">👗 Gardırop</button>`;
      dock.querySelector('[data-a=diary]').onclick = diary;
      dock.querySelector('[data-a=store]').onclick = () => { Audio.sfx('pop'); G.go('store'); };
      dock.querySelector('[data-a=ward]').onclick = () => { Audio.sfx('tap'); G.go('wardrobe'); };
      document.getElementById('ui').appendChild(dock);
      if (STOPS.every(s => G.S.done[s.id])) setTimeout(dayEnd, 600);
      else if (!G.S.seen.hub) {
        G.S.seen.hub = 1; G.save();
        const pnl = G.panel(`<div class="who"><canvas id="av"></canvas><div><div class="name">Hacer</div><h2 style="font-size:28px">Hoş geldin Lina!</h2></div></div><p class="lead">“Bu Tuzla sahili. Her durakta bir macera var. Bir yere dokun, oraya yürü ve yıldız topla. Yıldızlarla Serkan Dijital'den kıyafet, şarkı ve damga açabilirsin.”</p><div class="actions"><button class="btn" id="ok">Hadi başlayalım</button></div>`);
        pnl.querySelector('#av').replaceWith(Art.avatar('hacer')); pnl.querySelector('#ok').onclick = () => { G.closePanels(); Audio.sfx('pop'); };
      }
    },
    update(dt) {
      for (const s of seagulls) { s.x += s.v * dt; if (s.x > G.W + 40) s.x = -40; }
      if (walkTo != null) {
        const tgt = stopXY(STOPS[walkTo]); const dx = tgt.x - lx, dy = tgt.y - ly, d = Math.hypot(dx, dy); const sp = 420 * dt; walkT += dt * 2.2;
        if (d < sp) { lx = tgt.x; ly = tgt.y; cur = walkTo; walkTo = null; Audio.sfx('pop'); intro(STOPS[cur]); } else { lx += dx / d * sp; ly += dy / d * sp; }
      }
    },
    down(p) {
      if (document.querySelector('#ui .panel') || p.y > G.H - DOCK) return;
      let best = -1, bd = 1e9; STOPS.forEach((s, i) => { const q = stopXY(s); const d = Math.hypot(p.x - q.x, p.y - (q.y - 50)); if (d < bd) { bd = d; best = i; } });
      if (bd < 110) { Audio.sfx('tap'); if (best === cur && walkTo == null) intro(STOPS[best]); else walkTo = best; }
    },
    draw(c, W, H, T) {
      const t = dayT(); const hz = H * .40;
      Art.sky(c, W, H, t, hz); Art.clouds(c, W, hz * .3, t, 8, .85);
      for (const s of seagulls) Art.seagull(c, s.x, s.y, T + s.ph, s.s);
      Art.skyline(c, W, hz + 4, t, t > .7 ? '#1a2b4a' : '#4a6fa5');
      Art.sea(c, W, hz, hz + H * .16, t); Art.sailboats(c, W, hz + 50, t);
      const gy = hz + H * .16; const gg = c.createLinearGradient(0, gy, 0, H); gg.addColorStop(0, t > .7 ? '#3e5a3a' : '#7fc86a'); gg.addColorStop(1, t > .7 ? '#2a3d2a' : '#5aa84a'); c.fillStyle = gg; c.fillRect(0, gy, W, H - gy);
      c.fillStyle = t > .7 ? '#c9b08a' : '#f3e2b3'; c.beginPath(); c.moveTo(0, gy); for (let x = 0; x <= W; x += 40) c.lineTo(x, gy + Math.sin(x * .02 + T) * 4 + 6); c.lineTo(W, gy + 26); c.lineTo(0, gy + 26); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 8; c.setLineDash([16, 14]); c.lineDashOffset = -T * 30; c.beginPath(); STOPS.forEach((s, i) => { const q = stopXY(s); i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y); }); c.stroke(); c.setLineDash([]);
      for (let i = 0; i < 9; i++) { const x = (i * 131 + 60) % W, y = gy + 40 + (i % 3) * 22; c.fillStyle = '#8b5a2b'; c.fillRect(x - 4, y - 30, 8, 30); c.fillStyle = i % 2 ? '#3f9e4a' : '#5cb35a'; c.beginPath(); c.arc(x, y - 42, 22, 0, 7); c.arc(x - 14, y - 30, 16, 0, 7); c.arc(x + 14, y - 30, 16, 0, 7); c.fill(); }
      const order = STOPS.map((s, i) => i).sort((a, b) => STOPS[a].py - STOPS[b].py);
      for (const i of order) { const q = stopXY(STOPS[i]); drawStop(c, STOPS[i], q.x, q.y, i === cur && walkTo == null, G.S.done[STOPS[i].id]); }
      const walking = walkTo != null; const dir = walking ? Math.sign(stopXY(STOPS[walkTo]).x - lx) : 0;
      c.save(); if (dir < 0) { c.translate(lx, 0); c.scale(-1, 1); c.translate(-lx, 0); }
      Art.lina(c, lx, ly + 8, .62, { hair, dt: 1 / 60, wind: walking ? -dir * 80 : 15, vx: walking ? 200 : 0, walk: walking ? walkT : undefined, face: 'happy', blink: Math.sin(T * 2.7) > .96 });
      c.restore();
      const hours = ['08:00', '10:00', '13:00', '15:30', '18:00', '20:00', '21:30'][STOPS.filter(s => G.S.done[s.id]).length];
      G.txtShadow(c, hours, W / 2, Math.max(64, H * .06), 30, '#fff', 'rgba(0,0,0,.3)');
      G.txt(c, 'Tuzla sahili', W / 2, Math.max(64, H * .06) + 28, 15, 'rgba(255,255,255,.75)');
    },
    exit() { G.closePanels(); document.getElementById('dock')?.remove(); }
  };
})();
