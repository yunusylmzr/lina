/* Piyano: düşen notalar, 12 beyaz tuş, Serkan dans eder */
G.scenes.piano = (() => {
  const KEYS = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5'];
  const NAMES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si', 'Do', 'Re', 'Mi', 'Fa', 'Sol'];
  const FREQ = { C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 };
  const BLACK_AFTER = [0, 1, 3, 4, 5, 7, 8, 10];
  const SONGS = [
    { name: 'Daha Dün Annemizin', bpm: 100, em: '⭐', seq: 'C4 C4 G4 G4 A4 A4 G4- F4 F4 E4 E4 D4 D4 C4- G4 G4 F4 F4 E4 E4 D4- G4 G4 F4 F4 E4 E4 D4- C4 C4 G4 G4 A4 A4 G4- F4 F4 E4 E4 D4 D4 C4-' },
    { name: 'Mutlu Yıllar', bpm: 110, em: '🎂', seq: 'G4. G4. A4- G4- C5- B4-- G4. G4. A4- G4- D5- C5-- G4. G4. G5- E5- C5- B4- A4-- F5. F5. E5- C5- D5- C5--' },
    { name: 'Neşeye Övgü', bpm: 120, em: '🎻', seq: 'E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4. D4. D4- E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4. C4. C4-' },
    { name: 'Çan Çalıyor', bpm: 130, em: '🔔', seq: 'E4 E4 E4- E4 E4 E4- E4 G4 C4. D4. E4-- F4 F4 F4. F4. F4 E4 E4 E4. E4. E4 D4 D4 E4 D4- G4-' }
  ];
  // seq: nota + süre işareti: (yok)=1 vuruş, '-'=2, '--'=3/4, '.'=0.5
  function parse(song) { const beat = 60 / song.bpm; let t = 1.2; return song.seq.split(/\s+/).map(tok => { const m = tok.match(/^([A-G]\d)(\.|--|-)?$/); const d = m[2] === '.' ? .5 : m[2] === '-' ? 2 : m[2] === '--' ? 3 : 1; const n = { key: KEYS.indexOf(m[1]), t, hit: 0, judged: 0 }; t += d * beat; return n; }); }
  const FALL = 1.9; // saniye: ekranın tepesinden çizgiye
  let song, notes, t, state, score, combo, maxCombo, hits, pressed, hair, judg, serkanT, LIST;
  const layout = () => { const kh = Math.min(200, G.H * .3), ky = G.H - kh - 10, kw = Math.min(90, (G.W - 40) / 12); const x0 = (G.W - kw * 12) / 2; return { kh, ky, kw, x0, hitY: ky - 26 }; };
  function press(i, byUser = true) {
    pressed[i] = .25; Audio.note(FREQ[KEYS[i]], 1.2, .38); Audio.unlock();
    if (state !== 'play') return;
    // en yakın yargılanmamış nota bu tuşta
    let best = null, bd = 1e9; for (const n of notes) { if (n.judged || n.key !== i) continue; const d = Math.abs(n.t - t); if (d < bd) { bd = d; best = n; } }
    const L = layout();
    if (best && bd < .28) { best.judged = 1; best.hit = bd < .1 ? 2 : 1; combo++; maxCombo = Math.max(maxCombo, combo); score += best.hit === 2 ? 100 : 60; hits++; judg = { s: best.hit === 2 ? 'Mükemmel!' : 'Güzel', t: .6, c: best.hit === 2 ? '#ffd166' : '#5cd6a9' }; G.burst(L.x0 + (i + .5) * L.kw, L.hitY, best.hit === 2 ? '#ffd166' : '#5cd6a9', 10, 220); }
    else { combo = 0; }
  }
  function finish() {
    state = 'done'; const total = notes.length; const acc = Math.round(hits / total * 100); const stars = acc >= 85 ? 3 : acc >= 60 ? 2 : acc >= 30 ? 1 : 0;
    setTimeout(() => G.finish('piano', score, stars, `<b>${song.name}</b> · doğruluk %${acc} · en uzun kombo <b>${maxCombo}</b>${acc >= 85 ? ' — Serkan alkışlıyor!' : ''}`), 800);
  }
  function choose() {
    LIST = SONGS.concat(Store.extraSongs());
    const p = G.panel(`<h2>Hangi şarkı?</h2><p>Notalar düşerken çizgiye geldiğinde tuşa dokun. Şarkı seçmeden önce tuşları deneyebilirsin.</p><div class="grid" id="songs">${LIST.map((s, i) => `<div class="item" data-i="${i}"><div class="em">${s.em}</div>${s.name}<div class="cost">${G.S.best['piano_' + i] ? 'en iyi ' + G.S.best['piano_' + i] : s.bpm + ' bpm'}</div></div>`).join('')}</div>`, 'bottom');
    p.querySelectorAll('.item').forEach(el => el.onclick = () => { G.closePanels(); startSong(+el.dataset.i); });
  }
  function startSong(i) { song = LIST[i]; song.idx = i; notes = parse(song); t = -1; state = 'play'; score = 0; combo = 0; maxCombo = 0; hits = 0; Audio.sfx('pop'); }
  return {
    landscape: true, showHome: true, showStars: true,
    enter() { hair = Art.makeHair(6); pressed = new Array(12).fill(0); state = 'free'; notes = []; t = 0; serkanT = 0; Audio.ambience(false); choose(); },
    down(p) { const L = layout(); if (p.y >= L.ky) { const i = Math.floor((p.x - L.x0) / L.kw); if (i >= 0 && i < 12) press(i); } },
    update(dt) {
      for (let i = 0; i < 12; i++) if (pressed[i] > 0) pressed[i] -= dt; if (judg) judg.t -= dt; serkanT += dt * (1 + Math.min(combo, 20) * .08);
      if (state !== 'play') return; t += dt;
      for (const n of notes) if (!n.judged && t - n.t > .28) { n.judged = 1; n.hit = 0; combo = 0; }
      if (notes.every(n => n.judged) && t > notes[notes.length - 1].t + 1) { G.S.best['piano_' + song.idx] = Math.max(G.S.best['piano_' + song.idx] || 0, score); finish(); }
    },
    draw(c, W, H, T) {
      const L = layout();
      // oda: sıcak duvar, pencereden akşamüstü
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#3b2a5a'); g.addColorStop(1, '#1b1b2f'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      // pencere
      c.save(); c.beginPath(); c.roundRect(W * .72, 40, W * .24, H * .38, 18); c.clip(); Art.sky(c, W, H, .55, H * .5); Art.sea(c, W, H * .3, H * .5, .55); c.restore(); c.strokeStyle = '#fff3e0'; c.lineWidth = 8; c.beginPath(); c.roundRect(W * .72, 40, W * .24, H * .38, 18); c.stroke();
      // lane'ler
      for (let i = 0; i < 12; i++) { c.fillStyle = i % 2 ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.06)'; c.fillRect(L.x0 + i * L.kw, 0, L.kw, L.ky); }
      // vuruş çizgisi
      c.fillStyle = '#ff7a1a'; c.fillRect(L.x0, L.hitY - 3, L.kw * 12, 6); c.fillStyle = 'rgba(255,122,26,.25)'; c.fillRect(L.x0, L.hitY - 26, L.kw * 12, 52);
      // notalar
      if (state === 'play') for (const n of notes) { const y = L.hitY - (n.t - t) / FALL * L.hitY; if (y < -40 || y > L.ky + 40) continue; if (n.judged && n.hit === 0) c.globalAlpha = .25; if (n.judged && n.hit) continue;
        const x = L.x0 + (n.key + .5) * L.kw; const gr = c.createLinearGradient(x, y - 22, x, y + 22); gr.addColorStop(0, '#ffb570'); gr.addColorStop(1, '#ff7a1a'); c.fillStyle = gr; c.beginPath(); c.roundRect(x - L.kw * .4, y - 20, L.kw * .8, 40, 12); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.roundRect(x - L.kw * .3, y - 15, L.kw * .6, 10, 5); c.fill(); G.txt(c, NAMES[n.key], x, y + 3, 16, '#fff'); c.globalAlpha = 1; }
      // klavye
      c.fillStyle = '#3a2a1a'; c.beginPath(); c.roundRect(L.x0 - 14, L.ky - 12, L.kw * 12 + 28, L.kh + 24, 12); c.fill();
      for (let i = 0; i < 12; i++) { const x = L.x0 + i * L.kw, pr = pressed[i] > 0; c.fillStyle = pr ? '#ffd9b8' : '#fffdf8'; c.beginPath(); c.roundRect(x + 2, L.ky, L.kw - 4, L.kh - (pr ? 4 : 0), [0, 0, 8, 8]); c.fill(); if (!pr) { c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(x + 2, L.ky + L.kh - 10, L.kw - 4, 10); } G.txt(c, NAMES[i], x + L.kw / 2, L.ky + L.kh - 28, 18, pr ? '#d95a00' : '#8a94a8', 'center', 'Fredoka', 600); }
      for (const i of BLACK_AFTER) { const x = L.x0 + (i + 1) * L.kw; c.fillStyle = '#1b1b2f'; c.beginPath(); c.roundRect(x - L.kw * .28, L.ky, L.kw * .56, L.kh * .58, [0, 0, 6, 6]); c.fill(); }
      // Lina (sol, piyanoya dönük) ve Serkan (sağ, dans)
      const s = Math.min(.9, H / 700);
      const bounce = combo > 0 ? Math.abs(Math.sin(serkanT * 6)) * 14 : Math.abs(Math.sin(serkanT * 2)) * 3;
      Art.lina(c, Math.max(90, L.x0 - 70), L.ky + 20, s * .85, { hair, dt: 1 / 60, wind: 10, arms: 'hold', face: state === 'done' ? 'wow' : combo > 5 ? 'sing' : 'happy', blink: Math.sin(T * 3) > .96, bobY: 0 });
      c.save(); c.translate(Math.min(W - 90, L.x0 + L.kw * 12 + 80), L.ky + 10 - bounce); if (Math.sin(serkanT * 3) < 0) c.scale(-1, 1); Art.char(c, 'serkan', 0, 0, s * .8, { arms: combo > 3 ? 'up' : 'wave', face: combo > 8 ? 'wow' : 'happy', walk: combo > 0 ? serkanT : undefined }); c.restore();
      if (combo > 3) { for (let i = 0; i < 3; i++) { const a = serkanT * 2 + i * 2.1; G.txt(c, ['♪', '♫', '♩'][i], Math.min(W - 90, L.x0 + L.kw * 12 + 80) + Math.cos(a) * 60, L.ky - 200 * s - 30 + Math.sin(a * 1.3) * 25, 26, ['#ffd166', '#ff5c8a', '#5cd6a9'][i]); } }
      // skor
      if (state === 'play' || state === 'done') { c.fillStyle = 'rgba(15,42,68,.7)'; c.beginPath(); c.roundRect(W / 2 - 170, Math.max(10, H * .02), 340, 46, 23); c.fill(); G.txt(c, `${song.name}`, W / 2 - 60, Math.max(10, H * .02) + 23, 18, '#fff'); G.txt(c, `${score}`, W / 2 + 110, Math.max(10, H * .02) + 23, 24, '#ffd166'); if (combo > 1) G.txtShadow(c, `${combo} kombo`, W / 2, L.hitY - 90, 34, '#ff5c8a', 'rgba(0,0,0,.4)'); }
      if (judg && judg.t > 0) { c.globalAlpha = Math.min(1, judg.t * 3); G.txtShadow(c, judg.s, W / 2, L.hitY - 140 - (0.6 - judg.t) * 40, 30, judg.c, 'rgba(0,0,0,.4)'); c.globalAlpha = 1; }
      if (state === 'free' && !document.querySelector('#ui .panel')) G.txt(c, 'Tuşlara dokunup dene', W / 2, L.hitY - 60, 22, 'rgba(255,255,255,.7)');
    }
  };
})();
