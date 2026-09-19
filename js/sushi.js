/* Suşi Şefi: aile siparişleri — malzemeleri sırayla sürükle, sar, dilimle */
G.scenes.sushi = (() => {
  const ING = { yosun: { n: 'Yosun', em: '🟩', c: '#1f5a3a' }, pirinc: { n: 'Pirinç', em: '🍚', c: '#fff' }, somon: { n: 'Somon', em: '🐟', c: '#ff9f80' }, avokado: { n: 'Avokado', em: '🥑', c: '#7fc86a' }, salatalik: { n: 'Salatalık', em: '🥒', c: '#3f9e4a' }, peynir: { n: 'Krem peynir', em: '🧀', c: '#fff3c4' }, susam: { n: 'Susam', em: '⚪', c: '#f3e2b3' }, karides: { n: 'Karides', em: '🦐', c: '#ff7a6b' } };
  const ROLLS = [
    { n: 'Somon Rulo', seq: ['yosun', 'pirinc', 'somon'], say: 'Bol somonlu olsun, en sevdiğim!' },
    { n: 'Kaliforniya', seq: ['yosun', 'pirinc', 'avokado', 'salatalik', 'susam'], say: 'Avokadolu olsun, susamı da unutma.' },
    { n: 'Filadelfiya', seq: ['yosun', 'pirinc', 'somon', 'peynir'], say: 'Krem peynirli, benim favorim.' },
    { n: 'Karides Rulo', seq: ['yosun', 'pirinc', 'karides', 'avokado'], say: 'Karidesli lütfen, çok açım!' },
    { n: 'Gökkuşağı', seq: ['yosun', 'pirinc', 'somon', 'avokado', 'salatalik', 'karides'], say: 'Renkli olanı yap, içinde her şey olsun.' }
  ];
  let orders, cur, placed, drag, state, t, score, served, hair, roll, slices, tick, fails, msg;
  const trayY = () => G.H - 90;
  const matX = () => G.W * .5, matY = () => G.H * .55;
  function newOrder() { const r = G.pick(ROLLS); const who = G.pick(G.cast()); cur = { roll: r, who, t: 0, limit: 14 + r.seq.length * 3 }; placed = []; roll = 0; slices = 0; state = 'build'; msg = { s: r.say, t: 3 }; Audio.sfx('bell'); }
  function ingList() { return Object.keys(ING); }
  function ingAt(x, y) { const ks = ingList(); const w = Math.min(96, (G.W - 40) / ks.length); const x0 = (G.W - w * ks.length) / 2; if (y > trayY() - 50 && y < trayY() + 50) { const i = Math.floor((x - x0) / w); if (i >= 0 && i < ks.length) return ks[i]; } return null; }
  function place(k) {
    const need = cur.roll.seq[placed.length];
    if (k === need) { placed.push(k); score += 10; Audio.sfx('pop'); G.burst(matX(), matY(), ING[k].c, 8, 160); if (placed.length === cur.roll.seq.length) { state = 'roll'; msg = { s: 'Şimdi yukarı kaydır: sar!', t: 3 }; } }
    else { fails++; cur.t += 2; Audio.sfx('wrong'); msg = { s: `${G.PEOPLE[cur.who].name}: “Hmm, ${ING[need].n.toLowerCase()} lazımdı.”`, t: 2 }; }
  }
  function serve() {
    state = 'served'; served++; const bonus = Math.max(0, Math.round((cur.limit - cur.t) * 3)); score += 30 + bonus; Audio.sfx('good'); msg = { s: `${G.PEOPLE[cur.who].name}: “Afiyet! +${30 + bonus}”`, t: 2 };
    G.burst(matX(), matY(), '#ffd166', 20, 320);
    setTimeout(() => { if (served >= 6) end(); else newOrder(); }, 1400);
  }
  function end() { state = 'done'; const stars = fails === 0 ? 3 : fails <= 3 ? 2 : 1; G.finish('sushi', score, stars, `<b>${served}</b> sipariş servis edildi${fails ? `, <b>${fails}</b> yanlış malzeme` : ', hiç hata yok!'}. Serkan: “Bu şef Tuzla'nın en iyisi.”`); }
  return {
    landscape: true, showHome: true, showStars: true,
    enter() { orders = []; score = 0; served = 0; fails = 0; hair = Art.makeHair(6); state = 'intro'; t = 0; drag = null; Audio.ambience(false);
      const p = G.panel(`<div class="who"><canvas id="av"></canvas><div><div class="name">Serkan</div><h2 style="font-size:28px">Suşi Şefi</h2></div></div><p class="lead">“Bugün şef sensin Lina! Her sipariş için tarife bak, malzemeleri alttaki tepsiden <b>sırayla</b> hasıra sürükle. Sonra yukarı kaydırarak sar ve dokunarak dilimle.”</p><p>6 sipariş, hata yaparsan süre gider.</p><div class="actions center"><button class="btn big" id="go">Mutfağa!</button></div>`);
      p.querySelector('#av').replaceWith(Art.avatar('serkan')); p.querySelector('#go').onclick = () => { G.closePanels(); newOrder(); }; },
    down(p) { if (state === 'build') { const k = ingAt(p.x, p.y); if (k) { drag = { k, x: p.x, y: p.y }; Audio.sfx('tap'); } } else if (state === 'cut') { if (Math.abs(p.x - matX()) < 220 && Math.abs(p.y - matY()) < 90) { slices++; Audio.sfx('slice'); G.burst(p.x, matY(), '#fff', 6, 120); if (slices >= 6) serve(); } } },
    move(p) { if (drag) { drag.x = p.x; drag.y = p.y; } },
    up(p) { if (drag) { if (Math.abs(p.x - matX()) < 200 && Math.abs(p.y - matY()) < 110) place(drag.k); drag = null; } else if (state === 'roll' && (p.sy ?? p.y) - p.y > 60) { roll = 1; state = 'cut'; Audio.sfx('whoosh'); msg = { s: 'Dokunarak 6 dilim kes!', t: 3 }; } },
    update(dt) { t += dt; if (msg) msg.t -= dt; if (state === 'build' || state === 'roll' || state === 'cut') { cur.t += dt; if (cur.t > cur.limit) { fails++; Audio.sfx('lose'); msg = { s: `${G.PEOPLE[cur.who].name}: “Çok bekledim, sıradaki sipariş!”`, t: 2 }; state = 'served'; setTimeout(() => served >= 6 ? end() : newOrder(), 1200); served++; } } },
    draw(c, W, H, T) {
      // mutfak
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2b2118'); g.addColorStop(.5, '#3a2c20'); c.fillStyle = g; c.fillRect(0, 0, W, H * .42);
      c.fillStyle = '#e63946'; for (let i = 0; i < 6; i++) { const x = W * (.1 + i * .16); c.beginPath(); c.roundRect(x - 16, 30 + Math.sin(T + i) * 3, 32, 44, 12); c.fill(); } c.fillStyle = '#ffd166'; for (let i = 0; i < 6; i++) { const x = W * (.1 + i * .16); c.fillRect(x - 8, 22 + Math.sin(T + i) * 3, 16, 8); }
      G.txt(c, 'Lina Suşi · Tuzla', W / 2, H * .13, 34, '#fff3e0'); G.txt(c, '寿司', W / 2, H * .13 + 34, 20, 'rgba(255,243,224,.6)');
      // tezgâh
      const cg = c.createLinearGradient(0, H * .42, 0, H); cg.addColorStop(0, '#d9b98a'); cg.addColorStop(1, '#b8945f'); c.fillStyle = cg; c.fillRect(0, H * .42, W, H); c.fillStyle = 'rgba(0,0,0,.08)'; for (let x = 0; x < W; x += 60) c.fillRect(x, H * .42, 2, H);
      // müşteri (sol) ve Lina (sağ)
      if (cur) { const s = Math.min(.75, H / 800); Art.char(c, cur.who, W * .14, H * .46, s, { face: state === 'served' ? 'wow' : msg && msg.t > 0 && msg.s.includes('Hmm') ? 'sad' : 'happy', arms: state === 'served' ? 'up' : undefined });
        // konuşma balonu
        if (msg && msg.t > 0) { c.globalAlpha = Math.min(1, msg.t); c.font = '700 17px Nunito'; const tw = Math.min(W * .5, c.measureText(msg.s).width + 30); c.fillStyle = '#fff'; c.beginPath(); c.roundRect(W * .14 - 40, H * .46 - 200 * s - 60, tw, 44, 16); c.fill(); c.beginPath(); c.moveTo(W * .14, H * .46 - 200 * s - 16); c.lineTo(W * .14 + 16, H * .46 - 200 * s - 16); c.lineTo(W * .14 + 10, H * .46 - 200 * s); c.fill(); c.fillStyle = '#1b1b2f'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(msg.s, W * .14 - 26, H * .46 - 200 * s - 38, tw - 26); c.globalAlpha = 1; } }
      Art.lina(c, W * .86, H * .48, Math.min(.75, H / 800), { hair, dt: 1 / 60, wind: 8, arms: drag ? 'up' : 'hold', face: state === 'served' ? 'wink' : 'happy', blink: Math.sin(T * 3) > .96 });
      // şef şapkası
      { const s = Math.min(.75, H / 800); const hx = W * .86, hy = H * .48 - 150 * s * .92 - 40 * .92 * s; c.fillStyle = '#fff'; c.beginPath(); c.roundRect(hx - 30 * s, hy - 26 * s, 60 * s, 30 * s, 6); c.fill(); c.beginPath(); c.arc(hx - 18 * s, hy - 30 * s, 16 * s, 0, 7); c.arc(hx, hy - 38 * s, 18 * s, 0, 7); c.arc(hx + 18 * s, hy - 30 * s, 16 * s, 0, 7); c.fill(); }
      // tarif kartı
      if (cur) { const rx = W * .5 - 150, ry = H * .2; c.fillStyle = '#fffdf8'; c.beginPath(); c.roundRect(rx, ry, 300, 74, 14); c.fill(); c.fillStyle = '#e63946'; c.fillRect(rx, ry, 300, 6); G.txt(c, `${cur.roll.n} — ${G.PEOPLE[cur.who].name} için`, rx + 150, ry + 22, 17, '#1b1b2f');
        cur.roll.seq.forEach((k, i) => { const x = rx + 150 + (i - (cur.roll.seq.length - 1) / 2) * 44; c.fillStyle = i < placed.length ? '#5cd6a9' : i === placed.length && state === 'build' ? '#ffd166' : '#eee'; c.beginPath(); c.arc(x, ry + 52, 17, 0, 7); c.fill(); c.font = '20px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ING[k].em, x, ry + 53); });
        // süre
        const frac = G.clamp(1 - cur.t / cur.limit, 0, 1); c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(rx, ry + 80, 300, 8); c.fillStyle = frac < .3 ? '#e63946' : '#5cd6a9'; c.fillRect(rx, ry + 80, 300 * frac, 8); }
      // hasır
      const mx = matX(), my = matY(); c.fillStyle = '#7fb069'; c.beginPath(); c.roundRect(mx - 210, my - 90, 420, 180, 12); c.fill(); c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 2; for (let x = mx - 200; x < mx + 210; x += 14) { c.beginPath(); c.moveTo(x, my - 86); c.lineTo(x, my + 86); c.stroke(); }
      // yerleştirilen katmanlar / rulo
      if (cur && state !== 'served' || (cur && state === 'served')) {
        if (!roll) { placed.forEach((k, i) => { c.fillStyle = ING[k].c; if (i === 0) { c.beginPath(); c.roundRect(mx - 170, my - 60, 340, 120, 6); c.fill(); } else if (i === 1) { c.beginPath(); c.roundRect(mx - 160, my - 50, 320, 100, 8); c.fill(); c.fillStyle = 'rgba(0,0,0,.05)'; for (let j = 0; j < 60; j++) { c.beginPath(); c.arc(mx - 150 + (j * 37) % 300, my - 40 + (j * 53) % 80, 3, 0, 7); c.fill(); } } else { c.beginPath(); c.roundRect(mx - 150, my - 14 + (i - 2) * 12 - 12, 300, 22, 10); c.fill(); } }); }
        else { // sarılmış rulo + dilimler
          const n = Math.max(1, slices); const segW = 340 / 6;
          for (let i = 0; i < 6; i++) { const sx = mx - 170 + i * segW + (i < slices ? (i - 2.5) * 6 : 0); c.fillStyle = '#1f5a3a'; c.beginPath(); c.roundRect(sx + 2, my - 44, segW - 4, 88, i < slices ? 14 : 4); c.fill(); if (i < slices) { c.fillStyle = '#fff'; c.beginPath(); c.arc(sx + segW / 2, my, 30, 0, 7); c.fill(); let a = 0; for (const k of cur.roll.seq.slice(2)) { c.fillStyle = ING[k].c; c.beginPath(); c.arc(sx + segW / 2 + Math.cos(a) * 9, my + Math.sin(a) * 9, 11, 0, 7); c.fill(); a += 2.1; } } }
          if (state === 'cut') G.txt(c, 'dokun → dilimle', mx, my + 70, 16, '#1b1b2f');
        }
        if (state === 'roll') { G.txtShadow(c, '↑ yukarı kaydır: sar', mx, my - 110 + Math.sin(T * 4) * 6, 24, '#fff', 'rgba(0,0,0,.4)'); }
      }
      // tepsi
      const ks = ingList(); const w = Math.min(96, (W - 40) / ks.length); const x0 = (W - w * ks.length) / 2;
      c.fillStyle = 'rgba(43,33,24,.85)'; c.beginPath(); c.roundRect(x0 - 10, trayY() - 46, w * ks.length + 20, 92, 20); c.fill();
      ks.forEach((k, i) => { const x = x0 + i * w + w / 2; c.fillStyle = 'rgba(255,255,255,.1)'; c.beginPath(); c.arc(x, trayY() - 6, 28, 0, 7); c.fill(); c.fillStyle = '#000'; c.font = '34px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ING[k].em, x, trayY() - 6); G.txt(c, ING[k].n, x, trayY() + 32, 12, '#fff3e0', 'center', 'Fredoka', 600); });
      if (drag) { c.fillStyle = '#000'; c.font = '44px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ING[drag.k].em, drag.x, drag.y - 30); }
      // skor
      c.fillStyle = 'rgba(15,42,68,.8)'; c.beginPath(); c.roundRect(W - 190, Math.max(10, H * .02) + 56, 170, 40, 20); c.fill(); G.txt(c, `${served}/6 · ${score}`, W - 105, Math.max(10, H * .02) + 76, 18, '#ffd166');
    },
    exit() { G.closePanels(); }
  };
})();
