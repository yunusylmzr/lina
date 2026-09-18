/* AVM Turu: Anadolu Yakası AVM'lerinde vitrinlerde gizli eşya avı — Mehmet Doruk'la */
G.scenes.mall = (() => {
  const MALLS = [
    { name: 'Viaport Marina', where: 'Tuzla', floors: 2, color: '#2e8bc0' },
    { name: 'Hilltown', where: 'Küçükyalı', floors: 3, color: '#a77cf0' },
    { name: 'Emaar Square', where: 'Üsküdar', floors: 3, color: '#ff5c8a' },
    { name: 'Akasya', where: 'Acıbadem', floors: 3, color: '#5cd6a9' },
    { name: 'Buyaka', where: 'Ümraniye', floors: 3, color: '#ffd166' },
    { name: 'Piazza', where: 'Maltepe', floors: 3, color: '#ff9f80' }
  ];
  const POOL = ['🍦', '📚', '🎀', '👟', '🧸', '🍿', '🎧', '🕶️', '🧢', '🍩', '🎈', '🧩', '🍕', '🎮', '💄', '🧣', '⌚', '🥨', '🎁', '🍭', '🧃', '🪀', '🎨', '🍣'];
  const SHOPS = ['Kitap', 'Oyuncak', 'Dondurma', 'Spor', 'Moda', 'Kafe', 'Sinema', 'Şeker', 'Müzik', 'Hobi', 'Fırın', 'Suşi'];
  let mall, level, windows, list, found, t, timeLimit, state, hair, lina, doruk, hint, esc, total, wrongT;
  const layout = () => { const top = Math.max(70, G.H * .12), bottom = G.H - 40; const fh = (bottom - top) / mall.floors; return { top, bottom, fh }; };
  function build() {
    mall = MALLS[level % MALLS.length]; const L = layout(); windows = []; const perFloor = Math.max(5, Math.min(9, Math.floor(G.W / 150)));
    const items = POOL.slice().sort(() => Math.random() - .5);
    let k = 0;
    for (let f = 0; f < mall.floors; f++) for (let i = 0; i < perFloor; i++) {
      const w = (G.W - 60) / perFloor; const x = 30 + i * w + w / 2, y = L.top + f * L.fh;
      const n = 2 + Math.floor(Math.random() * 3); const its = [];
      for (let j = 0; j < n; j++) its.push({ em: items[(k++) % items.length], dx: (j - (n - 1) / 2) * Math.min(40, (w - 30) / n) + (Math.random() - .5) * 10, dy: (j % 2 ? -1 : 1) * L.fh * .14 + (Math.random() - .5) * L.fh * .2 + 10, found: 0, sc: .9 + Math.random() * .4 });
      windows.push({ x, y, w: w - 14, h: L.fh - 18, name: SHOPS[(f * perFloor + i) % SHOPS.length], items: its, awning: (f + i) % 2 });
    }
    const all = windows.flatMap(w => w.items); const need = 5 + level; list = [];
    const uniq = [...new Set(all.map(i => i.em))].sort(() => Math.random() - .5).slice(0, need); list = uniq.map(e => ({ em: e, done: 0 }));
    found = 0; t = 0; timeLimit = 40 + need * 4; state = 'play'; hint = 0; esc = 0; wrongT = 0;
    lina = { x: G.W * .5, y: L.bottom - 8, f: mall.floors - 1 }; doruk = { x: G.W * .5 + 70 };
  }
  function finishLevel() {
    state = 'done'; Audio.sfx('win'); total += Math.round(timeLimit - t) * 2 + list.length * 20;
    const p = G.panel(`<h2>${mall.name} bitti!</h2><p class="lead">Mehmet Doruk: “Sıradaki AVM'ye gidelim mi?”</p><p>Süreden <b>${Math.max(0, Math.round(timeLimit - t))}</b> saniye kaldı. Toplam <b>${total}</b> puan.</p>
      <div class="actions"><button class="btn ghost" data-a="end">Bugünlük yeter</button><button class="btn mint" data-a="next">Sıradaki: ${MALLS[(level + 1) % MALLS.length].name}</button></div>`);
    p.querySelector('[data-a=next]').onclick = () => { G.closePanels(); level++; build(); Audio.sfx('whoosh'); };
    p.querySelector('[data-a=end]').onclick = () => { G.closePanels(); done(); };
  }
  function done() { const stars = level >= 3 ? 3 : level >= 1 ? 2 : found > 0 ? 1 : 0; G.finish('mall', total, stars, `<b>${level + (state === 'done' ? 1 : 0)}</b> AVM gezdiniz: ${MALLS.slice(0, Math.min(MALLS.length, level + 1)).map(m => m.name).join(', ')}. Mehmet Doruk yorgun ama mutlu.`); }
  function timeUp() { state = 'over'; Audio.sfx('lose'); setTimeout(done, 700); }
  return {
    landscape: true, showHome: true, showStars: true,
    enter() { level = 0; total = 0; hair = Art.makeHair(6); Audio.ambience(false); build(); state = 'intro';
      const p = G.panel(`<div class="who"><canvas id="av"></canvas><div><div class="name">Mehmet Doruk</div><h2 style="font-size:28px">AVM Turu</h2></div></div><p class="lead">“Anadolu Yakası'nın AVM'lerini geziyoruz! Alttaki listede ne varsa vitrinlerde bul ve dokun. Süre bitmeden hepsini bulursak sıradaki AVM'ye geçeriz.”</p><p>Yanlış vitrine dokunursan 2 saniye kaybedersin.</p><div class="actions center"><button class="btn big" id="go">Viaport'a gidelim</button></div>`);
      p.querySelector('#av').replaceWith(Art.avatar('doruk')); p.querySelector('#go').onclick = () => { G.closePanels(); state = 'play'; Audio.sfx('pop'); }; },
    down(p) { if (state !== 'play') return;
      // eşyaya dokunuş
      for (const w of windows) for (const it of w.items) { if (it.found) continue; const ix = w.x + it.dx, iy = w.y + w.h / 2 + it.dy; if (Math.hypot(p.x - ix, p.y - iy) < 26) {
        const li = list.find(l => l.em === it.em && !l.done); if (li) { li.done = 1; it.found = 1; found++; Audio.sfx('coin'); G.burst(ix, iy, mall.color, 12, 260); lina.x = w.x; lina.f = Math.floor((w.y - layout().top) / layout().fh); if (list.every(l => l.done)) setTimeout(finishLevel, 400); }
        else { t += 2; wrongT = .5; Audio.sfx('wrong'); }
        return; } }
    },
    update(dt) { if (state !== 'play') return; t += dt; if (wrongT > 0) wrongT -= dt; if (t >= timeLimit) timeUp(); esc += dt; },
    draw(c, W, H, T) {
      const L = layout();
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, Art.shade(mall.color, .75)); g.addColorStop(1, '#fff3e0'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      // cam tavan
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 3; for (let x = 0; x < W; x += 80) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 40, L.top - 10); c.stroke(); }
      // katlar
      for (let f = 0; f < mall.floors; f++) { const y = L.top + f * L.fh; c.fillStyle = f % 2 ? '#f6e7d2' : '#efdcc2'; c.fillRect(0, y, W, L.fh); c.fillStyle = '#d8b892'; c.fillRect(0, y + L.fh - 10, W, 10); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(0, y + L.fh - 10, W, 2); }
      // yürüyen merdiven (dekor)
      c.strokeStyle = '#8a94a8'; c.lineWidth = 6; for (let f = 0; f < mall.floors - 1; f++) { const y = L.top + f * L.fh; c.beginPath(); c.moveTo(W * .5 - 60, y + L.fh - 12); c.lineTo(W * .5 + 60, y + L.fh * 2 - 12); c.stroke(); }
      // vitrinler
      for (const w of windows) {
        const x = w.x - w.w / 2, y = w.y + 8, h = w.h - 6;
        c.fillStyle = '#fff'; c.beginPath(); c.roundRect(x, y, w.w, h, 10); c.fill();
        const gg = c.createLinearGradient(x, y, x + w.w, y + h); gg.addColorStop(0, 'rgba(180,220,255,.35)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gg; c.beginPath(); c.roundRect(x + 6, y + 30, w.w - 12, h - 40, 8); c.fill();
        // tente
        c.fillStyle = w.awning ? mall.color : Art.shade(mall.color, -.3); c.beginPath(); c.roundRect(x - 4, y, w.w + 8, 26, [10, 10, 0, 0]); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; for (let k = 0; k < w.w / 18; k++) if (k % 2) c.fillRect(x - 4 + k * 18, y, 18, 26);
        G.txt(c, w.name, w.x, y + 13, 13, '#fff', 'center', 'Fredoka', 600);
        for (const it of w.items) { const ix = w.x + it.dx, iy = w.y + w.h / 2 + it.dy; c.save(); c.translate(ix, iy); c.scale(it.sc, it.sc); if (it.found) { c.globalAlpha = .25; } c.font = '30px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(it.em, 0, 0); c.restore(); if (it.found) { c.strokeStyle = '#5cd6a9'; c.lineWidth = 4; c.beginPath(); c.moveTo(ix - 12, iy); c.lineTo(ix - 3, iy + 9); c.lineTo(ix + 13, iy - 10); c.stroke(); } }
        c.strokeStyle = 'rgba(0,0,0,.08)'; c.lineWidth = 3; c.beginPath(); c.roundRect(x, y, w.w, h, 10); c.stroke();
      }
      // Lina ve Doruk mevcut katta
      const fy = L.top + (lina.f + 1) * L.fh - 10;
      const s = Math.min(.5, L.fh / 240);
      c.save(); c.globalAlpha = .95; Art.lina(c, lina.x - 20, fy, s, { hair, dt: 1 / 60, wind: 10, face: 'happy', blink: Math.sin(T * 3) > .96 }); Art.char(c, 'doruk', lina.x + 40, fy, s, { face: wrongT > 0 ? 'wow' : 'happy', arms: 'wave' }); c.restore();
      // üst bilgi
      c.fillStyle = 'rgba(15,42,68,.8)'; c.beginPath(); c.roundRect(W / 2 - 200, Math.max(10, H * .02), 400, 46, 23); c.fill();
      G.txt(c, `${mall.name} · ${mall.where}`, W / 2 - 60, Math.max(10, H * .02) + 23, 18, '#fff');
      const left = Math.max(0, Math.ceil(timeLimit - t)); G.txt(c, `⏱ ${left}`, W / 2 + 140, Math.max(10, H * .02) + 23, 22, left < 10 ? '#ffd166' : '#fff');
      if (wrongT > 0) G.txtShadow(c, '-2 sn', W / 2 + 140, Math.max(10, H * .02) + 60, 22, '#ff5c8a');
      // alışveriş listesi
      const lw = list.length * 56 + 20; c.fillStyle = 'rgba(15,42,68,.82)'; c.beginPath(); c.roundRect(W / 2 - lw / 2, H - 70, lw, 60, 30); c.fill();
      list.forEach((l, i) => { const x = W / 2 - lw / 2 + 38 + i * 56; c.fillStyle = l.done ? '#5cd6a9' : 'rgba(255,255,255,.12)'; c.beginPath(); c.arc(x, H - 40, 22, 0, 7); c.fill(); c.globalAlpha = l.done ? .5 : 1; c.fillStyle = '#000'; c.font = '26px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(l.em, x, H - 38); c.globalAlpha = 1; });
    },
    exit() { G.closePanels(); }
  };
})();
