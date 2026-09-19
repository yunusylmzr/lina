/* Okul Yolu: sahil boyunca koşu — dokun: zıpla, aşağı kaydır: kay */
G.scenes.school = (() => {
  const DUR = 55; // saniye: okula varış
  const ITEMS = ['✏️', '📒', '🍎', '🧃', '📐', '🖍️', '📚', '🎒'];
  const SIGNS = ['LİNA TOWERS', 'TURUNCU KULE', 'LİNA MARİNA', 'PORTAKAL PLAZA', 'SAHİL REZİDANS', 'LİNA KONAKLARI'];
  let hair, t, speed, dist, lina, obs, items, score, bag, hits, state, walkT, endX, camShake, msgs, spawnT, cloudsY;
  const groundY = () => G.H * .80;
  function reset() { hair = Art.makeHair(7); t = 0; speed = 330; dist = 0; lina = { y: 0, vy: 0, jumps: 0, slide: 0, hurt: 0 }; obs = []; items = []; score = 0; bag = 0; hits = 0; state = 'intro'; walkT = 0; camShake = 0; msgs = []; spawnT = 1.2; }
  function spawn() {
    const x = G.W + 120; const r = Math.random();
    if (r < .5) { const kind = G.pick(['puddle', 'scooter', 'bench', 'gull', 'sign']); obs.push({ kind, x, w: kind === 'bench' ? 110 : kind === 'puddle' ? 120 : 70, low: kind === 'gull' || kind === 'sign', bob: Math.random() * 6 }); }
    else { const n = 3 + Math.floor(Math.random() * 3); const arc = Math.random() < .4; for (let i = 0; i < n; i++) items.push({ x: x + i * 62, y: arc ? -120 - Math.sin(i / (n - 1) * Math.PI) * 90 : -70 - (Math.random() < .3 ? 110 : 0), em: G.pick(ITEMS), got: 0, ph: Math.random() * 6.28 }); }
  }
  function jump() { if (state !== 'run') return; if (lina.jumps < 2 && lina.slide <= 0) { lina.vy = lina.jumps === 0 ? -820 : -680; lina.jumps++; lina.y -= 1; Audio.sfx('jump'); } }
  function slide() { if (state !== 'run') return; if (lina.y >= -1) { lina.slide = .75; Audio.sfx('whoosh'); } else { lina.vy = Math.max(lina.vy, 900); } }
  function end() {
    state = 'done'; Audio.sfx('bell');
    const stars = bag >= 14 ? 3 : bag >= 8 ? 2 : 1; const sc = bag * 10 + Math.max(0, 30 - hits * 10);
    setTimeout(() => G.finish('school', sc, stars, `Çantana <b>${bag}</b> eşya girdi${hits ? `, <b>${hits}</b> kez tökezledin` : ', hiç düşmedin!'}. Zil tam zamanında çaldı.`), 1400);
  }
  return {
    landscape: true, showHome: true, showStars: true,
    enter() { reset(); Audio.ambience(true); const p = G.panel(`<h2>Okul Yolu</h2><p class="lead">Tuzla sahilinden okula koş. <b>Dokun</b> → zıpla (iki kez zıplayabilirsin). <b>Aşağı kaydır</b> → martı ve tabelaların altından kay.</p><p>Çanta eşyalarını topla, su birikintilerine basma. ${DUR} saniyede okuldasın.</p><div class="actions center"><button class="btn big" id="go">Koş!</button></div>`); p.querySelector('#go').onclick = () => { G.closePanels(); state = 'run'; Audio.sfx('whoosh'); }; },
    down(p) { if (state !== 'run') return; p.t0 = G.T; },
    up(p) { if (state !== 'run') return; const dy = p.y - (p.sy ?? p.y); if (dy > 40) { if (!p.meta?.slid) slide(); } else if (Math.abs(dy) < 60) jump(); },
    move(p) { if (state !== 'run' || p.sy == null || !p.meta) return; if (p.y - p.sy > 60 && !p.meta.slid) { p.meta.slid = 1; slide(); } },
    key(e) { if (e.code === 'Space' || e.code === 'ArrowUp') jump(); if (e.code === 'ArrowDown') slide(); },
    update(dt) {
      if (state !== 'run' && state !== 'done') return;
      t += dt; if (state === 'run') { speed = 330 + Math.min(260, t * 6); dist += speed * dt; }
      // fizik
      lina.vy += 2200 * dt; lina.y += lina.vy * dt; if (lina.y > 0) { lina.y = 0; lina.vy = 0; lina.jumps = 0; }
      if (lina.slide > 0) lina.slide -= dt; if (lina.hurt > 0) lina.hurt -= dt; if (camShake > 0) camShake -= dt;
      walkT += dt * (speed / 120);
      if (state === 'run') { spawnT -= dt; if (spawnT <= 0) { spawn(); spawnT = .9 + Math.random() * .9 - Math.min(.4, t * .008); } if (t >= DUR) { end(); endX = G.W + 200; } }
      const px = G.W * .28;
      for (const o of obs) o.x -= speed * dt; for (const it of items) it.x -= speed * dt;
      obs = obs.filter(o => o.x > -200); items = items.filter(i => i.x > -60 && !(i.got && i.got > .4));
      // çarpışma
      const ly = groundY() + lina.y, lh = lina.slide > 0 ? 60 : 150;
      for (const o of obs) { if (o.hit) continue; const ox = o.x - o.w / 2, ox2 = o.x + o.w / 2; if (px + 25 > ox && px - 25 < ox2) {
        let hit = false; if (o.low) { const oy = groundY() - 105; hit = ly - lh < oy + 25 && lina.slide <= 0 && !(ly - lh < oy - 40 && false); if (lina.y < -150) hit = false; } else { hit = lina.y > -(o.kind === 'puddle' ? 30 : 55); }
        if (hit) { o.hit = 1; hits++; lina.hurt = .8; camShake = .35; bag = Math.max(0, bag - 1); Audio.sfx('hit'); msgs.push({ x: px, y: ly - 180, s: o.kind === 'puddle' ? 'Şlap!' : 'Tak!', t: 1 }); G.burst(px, ly - 60, o.kind === 'puddle' ? '#7cc4f5' : '#ff9f80', 10); } } }
      for (const it of items) { if (it.got) { it.got += dt; it.y -= 120 * dt; continue; } const iy = groundY() + it.y; if (Math.abs(it.x - px) < 46 && Math.abs(iy - (ly - lh / 2)) < lh / 2 + 24) { it.got = .01; bag++; score += 10; Audio.sfx('coin'); G.burst(it.x, iy, '#ffd166', 6, 160); } }
      for (const m of msgs) m.t -= dt; msgs = msgs.filter(m => m.t > 0);
      if (state === 'done') { endX -= speed * dt; if (endX < G.W * .62) { speed *= .9; if (speed < 20) speed = 0; } }
    },
    draw(c, W, H, T) {
      const gy = groundY(); const dayT = .22;
      c.save(); if (camShake > 0) c.translate((Math.random() - .5) * 10 * camShake, (Math.random() - .5) * 8 * camShake);
      Art.sky(c, W, H, dayT, gy - 120); Art.clouds(c, W, 90, dayT, 30, .9);
      // uzak: skyline
      Art.skyline(c, W, gy - 118, dayT, '#6f93bf', dist * .15, SIGNS);
      Art.sea(c, W, gy - 120, gy - 40, dayT); Art.sailboats(c, W, gy - 70, dayT);
      // korkuluk
      c.fillStyle = '#e9eef5'; c.fillRect(0, gy - 60, W, 6); for (let x = -(dist * .8 % 60); x < W; x += 60) c.fillRect(x, gy - 60, 6, 22);
      // kaldırım
      c.fillStyle = '#f0d9b5'; c.fillRect(0, gy - 38, W, H - gy + 38); c.fillStyle = 'rgba(0,0,0,.06)'; for (let x = -(dist % 140); x < W; x += 140) c.fillRect(x, gy - 38, 4, H); c.fillStyle = '#e2c59a'; c.fillRect(0, gy, W, 5);
      // palmiyeler
      for (let i = 0; i < 5; i++) { const x = ((i * 420 - dist * .55) % (W + 300) + W + 300) % (W + 300) - 150; c.strokeStyle = '#8b5a2b'; c.lineWidth = 10; c.beginPath(); c.moveTo(x, gy - 40); c.quadraticCurveTo(x + 10, gy - 160, x + 4, gy - 230); c.stroke(); c.strokeStyle = '#3f9e4a'; c.lineWidth = 9; c.lineCap = 'round'; for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * .5; c.beginPath(); c.moveTo(x + 4, gy - 230); c.quadraticCurveTo(x + 4 + Math.cos(a) * 60, gy - 230 + Math.sin(a) * 60 - 20, x + 4 + Math.cos(a) * 95, gy - 230 + Math.sin(a) * 95 + 30); c.stroke(); } }
      // eşyalar
      for (const it of items) { const bob = Math.sin(T * 3 + it.ph) * 4, y = gy + it.y + bob; c.globalAlpha = it.got ? Math.max(0, 1 - it.got * 2.5) : 1; c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.arc(it.x, y, 26, 0, 7); c.fill(); c.fillStyle = '#000'; c.font = '30px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(it.em, it.x, y + 2); c.globalAlpha = 1; }
      // engeller
      for (const o of obs) { c.save(); c.translate(o.x, gy); c.globalAlpha = o.hit ? .45 : 1;
        if (o.kind === 'puddle') { c.fillStyle = '#7cc4f5'; c.beginPath(); c.ellipse(0, 0, 60, 12, 0, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(-15, -3, 20, 4, 0, 0, 7); c.fill(); }
        else if (o.kind === 'scooter') { c.fillStyle = '#1b1b2f'; c.beginPath(); c.arc(-24, -10, 11, 0, 7); c.arc(24, -10, 11, 0, 7); c.fill(); c.fillStyle = '#ff5c8a'; c.fillRect(-26, -22, 52, 8); c.fillRect(20, -70, 6, 50); c.fillRect(6, -70, 34, 6); }
        else if (o.kind === 'bench') { c.fillStyle = '#8b5a2b'; c.fillRect(-52, -40, 104, 10); c.fillRect(-52, -58, 104, 8); c.fillStyle = '#4a4a5a'; c.fillRect(-46, -30, 8, 30); c.fillRect(38, -30, 8, 30); }
        else if (o.kind === 'gull') { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(0, -110 + Math.sin(T * 6 + o.bob) * 5, 24, 12, 0, 0, 7); c.fill(); c.fillStyle = '#ffb347'; c.beginPath(); c.moveTo(22, -112); c.lineTo(36, -108); c.lineTo(22, -104); c.fill(); Art.seagull(c, -4, -122 + Math.sin(T * 6 + o.bob) * 5, T + o.bob, 1.6); }
        else if (o.kind === 'sign') { c.fillStyle = '#4a4a5a'; c.fillRect(-4, -150, 8, 60); c.fillStyle = '#2e8bc0'; c.beginPath(); c.roundRect(-46, -170, 92, 40, 8); c.fill(); G.txt(c, 'Tuzla Sahil', 0, -150, 15, '#fff'); c.fillStyle = '#4a4a5a'; c.fillRect(-4, -190, 8, 20); }
        c.restore(); }
      // okul (bitişte)
      if (state === 'done') { const x = endX; c.fillStyle = '#fbe3c0'; c.fillRect(x - 130, gy - 220, 260, 220); c.fillStyle = '#d9534f'; c.beginPath(); c.moveTo(x - 145, gy - 220); c.lineTo(x, gy - 290); c.lineTo(x + 145, gy - 220); c.fill(); c.fillStyle = '#2e8bc0'; for (let r = 0; r < 2; r++) for (let k = -2; k <= 2; k++) if (r || k) c.fillRect(x + k * 48 - 16, gy - 195 + r * 70, 32, 40); c.fillStyle = '#8b5a2b'; c.fillRect(x - 28, gy - 80, 56, 80); c.fillStyle = '#fff'; c.beginPath(); c.arc(x, gy - 250, 18, 0, 7); c.fill(); G.txt(c, 'OKUL', x, gy - 150, 26, '#d9534f'); }
      // Lina
      const px = W * .28, ly = gy + lina.y;
      c.save(); if (lina.hurt > 0 && Math.sin(T * 40) > 0) c.globalAlpha = .5;
      if (lina.slide > 0) { c.translate(px, ly); c.rotate(-1.25); c.translate(-px, -ly + 20); }
      Art.lina(c, px, ly, .78, { hair, dt: 1 / 60, wind: -speed * .45, vx: speed, walk: lina.y < 0 ? undefined : walkT, arms: lina.y < 0 ? 'up' : undefined, face: lina.hurt > 0 ? 'sad' : state === 'done' ? 'wow' : (lina.y < -80 ? 'wow' : 'happy'), blink: Math.sin(T * 3) > .96 });
      c.restore();
      c.restore();
      // yazılar
      for (const m of msgs) { G.txtShadow(c, m.s, m.x, m.y - (1 - m.t) * 60, 30, '#fff', 'rgba(0,0,0,.4)'); }
      // HUD
      const left = Math.max(0, DUR - t);
      c.fillStyle = 'rgba(15,42,68,.7)'; c.beginPath(); c.roundRect(W / 2 - 150, Math.max(10, H * .02), 300, 46, 23); c.fill();
      G.txt(c, `🎒 ${bag}`, W / 2 - 80, Math.max(10, H * .02) + 23, 22, '#fff');
      G.txt(c, state === 'done' ? 'Zil çaldı!' : `🔔 ${Math.ceil(left)} sn`, W / 2 + 60, Math.max(10, H * .02) + 23, 22, left < 10 && state === 'run' ? '#ffd166' : '#fff');
      // ilerleme çubuğu
      c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(W * .2, H - 18, W * .6, 8); c.fillStyle = '#ff7a1a'; c.fillRect(W * .2, H - 18, W * .6 * G.clamp(t / DUR, 0, 1), 8); c.font = '20px serif'; c.textAlign = 'center'; c.fillText('🏫', W * .8 + 14, H - 12);
    }
  };
})();
