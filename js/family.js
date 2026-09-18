/* Aile Akşamı: aynı iPad'de iki kişilik — ekranın iki yarısı, üç tur farklı oyun */
G.scenes.family = (() => {
  const GAMES = ['color', 'count', 'sushi'];
  let rival, round, state, t, target, sides, scores, roundT, hair, feed, cue, winner, roundGame, items;
  const half = () => G.W / 2;
  function startRound() {
    roundGame = GAMES[round % GAMES.length]; state = 'ready'; roundT = 0; cue = null; items = [];
    setTimeout(() => { state = 'play'; roundT = 0; makeCue(); }, 1200);
  }
  function makeCue() {
    if (roundGame === 'color') { // turuncu göründüğünde dokun
      cue = { at: 1 + Math.random() * 2.5, shown: 0, color: G.pick(['#ff7a1a', '#2e8bc0', '#5cd6a9', '#a77cf0']), fakeAt: Math.random() < .5 ? .5 + Math.random() * .6 : 99, fakeShown: 0 };
    } else if (roundGame === 'count') { // kaç balık var: doğru sayıya dokun
      const n = 3 + Math.floor(Math.random() * 6); cue = { n, opts: [n, n + 1, Math.max(1, n - 1)].sort(() => Math.random() - .5), fish: Array.from({ length: n }, () => ({ x: .1 + Math.random() * .8, y: .2 + Math.random() * .5, d: Math.random() < .5 ? 1 : -1, ph: Math.random() * 6 })) };
    } else { // düşen suşileri yakala: kendi yarısında dokun (10 sn)
      cue = { spawn: 0 };
    }
  }
  function tap(side, p) {
    if (state !== 'play') return;
    const s = scores;
    if (roundGame === 'color') { if (cue.shown && cue.color === '#ff7a1a') { s[side]++; win(side, 'Turuncuya ilk dokunan!'); } else if (!cue.shown || cue.color !== '#ff7a1a') { s[side] = Math.max(0, s[side] - 1); Audio.sfx('wrong'); G.toast(side === 0 ? 'Lina erken dokundu!' : `${G.PEOPLE[rival].name} erken dokundu!`); } }
    else if (roundGame === 'count') { // seçenek düğmeleri her yarının altında
      const lx = side === 0 ? p.x : p.x - half(); const bw = half() / 3; const i = Math.floor(lx / bw); if (p.y > G.H - 120 && i >= 0 && i < 3) { if (cue.opts[i] === cue.n) { s[side]++; win(side, `${cue.n} balık vardı!`); } else { s[side] = Math.max(0, s[side] - 1); Audio.sfx('wrong'); } } }
    else { for (const it of items) { if (it.side === side && !it.got && Math.hypot(p.x - it.x, p.y - it.y) < 40) { it.got = 1; s[side]++; Audio.sfx('coin'); G.burst(it.x, it.y, '#ffd166', 6, 150); } } }
  }
  function win(side, why) { state = 'between'; Audio.sfx('good'); winner = side; G.burst(side === 0 ? half() / 2 : half() * 1.5, G.H / 2, side === 0 ? '#ff7a1a' : '#2e8bc0', 24, 350); setTimeout(next, 1500); }
  function next() { round++; if (round >= 6) return finish(); startRound(); }
  function finish() { state = 'done'; const [a, b] = scores; const stars = a > b ? 3 : a === b ? 2 : 1; G.finish('family', a * 10, stars, a > b ? `Lina <b>${a}</b> – ${G.PEOPLE[rival].name} <b>${b}</b>. ${G.PEOPLE[rival].name}: “Bir daha oynayalım, bu sefer ben kazanırım!”` : a === b ? `Berabere! <b>${a}</b> – <b>${b}</b>. Sarılma zamanı.` : `${G.PEOPLE[rival].name} <b>${b}</b> – Lina <b>${a}</b>. Lina: “Rövanş!”`, { unit: 'puan' }); }
  return {
    landscape: true, showHome: true, showStars: true,
    enter() { hair = Art.makeHair(6); round = 0; scores = [0, 0]; state = 'pick'; Audio.ambience(false);
      const p = G.panel(`<h2>Aile Akşamı</h2><p class="lead">İki kişilik! iPad'i aranıza koyun: sol yarı Lina'nın, sağ yarı rakibin. Kiminle oynuyorsun?</p><div class="grid" id="r">${['serkan', 'hacer', 'yunus', 'betul', 'doruk'].map(w => `<div class="item" data-w="${w}"><canvas></canvas>${G.PEOPLE[w].name}</div>`).join('')}</div>`);
      p.querySelectorAll('.item').forEach(el => { el.querySelector('canvas').replaceWith(Art.avatar(el.dataset.w, 72)); el.onclick = () => { rival = el.dataset.w; G.closePanels(); Audio.sfx('pop'); startRound(); }; }); },
    down(p) { if (state !== 'play') return; tap(p.x < half() ? 0 : 1, p); },
    update(dt) { if (state === 'play') { roundT += dt;
      if (roundGame === 'color') { if (!cue.fakeShown && roundT > cue.fakeAt) { cue.fakeShown = 1; cue.shownFake = roundT; } if (!cue.shown && roundT > cue.at) { cue.shown = 1; cue.color = '#ff7a1a'; Audio.sfx('tick'); } }
      else if (roundGame === 'sushi') { cue.spawn -= dt; if (cue.spawn <= 0) { cue.spawn = .55; for (const side of [0, 1]) items.push({ side, x: side * half() + 60 + Math.random() * (half() - 120), y: -30, vy: 160 + Math.random() * 120, got: 0, em: G.pick(['🍣', '🍣', '🍣', '🐟', '🍤']) }); }
        for (const it of items) it.y += it.vy * dt; items = items.filter(i => i.y < G.H + 40 && !i.got); if (roundT > 10) { state = 'between'; winner = -1; Audio.sfx('win'); setTimeout(next, 1200); } }
      else if (roundGame === 'count') { for (const f of cue.fish) f.x += f.d * dt * .04; if (roundT > 12) { state = 'between'; winner = -1; setTimeout(next, 800); } } } },
    draw(c, W, H, T) {
      const hw = half();
      // iki yarı
      c.fillStyle = '#ffe8d4'; c.fillRect(0, 0, hw, H); c.fillStyle = '#dbeeff'; c.fillRect(hw, 0, hw, H);
      c.fillStyle = '#1b1b2f'; c.fillRect(hw - 3, 0, 6, H);
      // isim + skor
      for (const side of [0, 1]) { const x = side ? hw * 1.5 : hw / 2; const who = side ? rival : 'lina'; if (!who) continue;
        c.save(); c.translate(x, 0); if (side) { /* rakip tarafı ters (karşıda oturuyor) */ c.translate(0, H); c.rotate(Math.PI); c.translate(-x, 0); c.translate(x, 0); }
        G.txt(c, G.PEOPLE[who].name, 0, 40, 26, side ? '#1b5e8f' : '#d95a00'); G.txt(c, `${scores[side]}`, 0, 84, 48, side ? '#1b5e8f' : '#d95a00');
        c.restore(); }
      // karakterler ortada küçük
      if (rival) { Art.lina(c, hw / 2, H * .97, .45, { hair, dt: 1 / 60, wind: 6, face: winner === 0 && state === 'between' ? 'wow' : 'happy', arms: winner === 0 && state === 'between' ? 'up' : undefined }); c.save(); c.translate(hw * 1.5, H * .03); c.rotate(Math.PI); Art.char(c, rival, 0, 0, .45, { face: winner === 1 && state === 'between' ? 'wow' : 'happy', arms: winner === 1 && state === 'between' ? 'up' : undefined }); c.restore(); }
      if (state === 'ready') { G.txtShadow(c, `${round + 1}. tur`, W / 2, H / 2 - 40, 54, '#fff', 'rgba(0,0,0,.35)'); G.txt(c, roundGame === 'color' ? 'Turuncu görününce dokun!' : roundGame === 'count' ? 'Kaç balık var? Doğru sayıya dokun' : '10 saniye: suşileri yakala!', W / 2, H / 2 + 20, 26, '#1b1b2f'); }
      if (state === 'play' || state === 'between') {
        if (roundGame === 'color') { const col = cue.shown ? '#ff7a1a' : (cue.fakeShown && roundT - cue.shownFake < .5 ? cue.color : null); if (col) { for (const side of [0, 1]) { c.fillStyle = col; c.beginPath(); c.arc(side ? hw * 1.5 : hw / 2, H / 2, Math.min(hw, H) * .28, 0, 7); c.fill(); } } else { for (const side of [0, 1]) { c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = 6; c.setLineDash([12, 10]); c.beginPath(); c.arc(side ? hw * 1.5 : hw / 2, H / 2, Math.min(hw, H) * .28, 0, 7); c.stroke(); c.setLineDash([]); } G.txt(c, 'bekle…', W / 2, H / 2, 22, 'rgba(0,0,0,.35)'); } }
        else if (roundGame === 'count') { c.fillStyle = '#000'; c.font = '38px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; for (const side of [0, 1]) { for (const f of cue.fish) { c.save(); c.translate(side * hw + f.x * hw, f.y * H + Math.sin(T * 2 + f.ph) * 8); if (f.d < 0) c.scale(-1, 1); c.fillText('🐟', 0, 0); c.restore(); }
          const bw = hw / 3; cue.opts.forEach((o, i) => { const x = side * hw + i * bw + bw / 2; c.fillStyle = side ? '#2e8bc0' : '#ff7a1a'; c.beginPath(); c.roundRect(x - bw / 2 + 12, H - 110, bw - 24, 90, 18); c.fill(); G.txt(c, o, x, H - 65, 44, '#fff'); }); } }
        else { c.fillStyle = '#000'; c.font = '40px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; for (const it of items) c.fillText(it.em, it.x, it.y); G.txt(c, `${Math.max(0, Math.ceil(10 - roundT))}`, W / 2, H / 2, 60, 'rgba(0,0,0,.2)'); }
      }
      if (state === 'between' && winner >= 0) G.txtShadow(c, winner === 0 ? 'Lina aldı!' : `${G.PEOPLE[rival].name} aldı!`, W / 2, H / 2, 46, winner ? '#1b5e8f' : '#d95a00', 'rgba(255,255,255,.6)');
    },
    exit() { G.closePanels(); }
  };
})();
