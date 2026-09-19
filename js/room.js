/* Oda Toplama: dağınık eşyaları doğru yere sürükle. Anne gelmeden bitir. */
G.scenes.room = (() => {
  const KIND = {
    toy: { name: 'Oyuncak sandığı', em: '🧸', color: '#5cd6a9', items: ['🧸', '🪀', '🧩', '🪁', '🦄', '🎲', '⚽️', '🚗', '🎏'] },
    book: { name: 'Kitaplık', em: '📚', color: '#2e8bc0', items: ['📚', '📕', '📗', '📒', '📓', '📖', '✏️', '📐'] },
    cloth: { name: 'Çamaşır sepeti', em: '🧺', color: '#ff5c8a', items: ['🧦', '👕', '👗', '🧢', '🧥', '🩳', '🧣', '🧤'] }
  };
  const KEYS = Object.keys(KIND);
  const WRONG = [
    'Çorap kitaplığa girmez, kabul et.',
    'Hacer: “O oraya mı ait?” Sesi yan odadan geliyor.',
    'Yanlış kutu. Anne bunu görseydi kaşını kaldırırdı.',
    'Hmm. Emin misin? Emin değilsin.',
    'Bu sepette yeri yok. Bir daha bak.'
  ];
  const DONE_LINES = [
    'Hacer: “İnanmıyorum, gerçekten topladın.”',
    'Serkan: “Ben olsam yatağın altına süpürürdüm.” Anne duymadı.',
    'Hacer: “Bir de kendi gerçek odanı toplasan.”'
  ];
  let items, bins, drag, t, limit, state, mistakes, placed, total, hair, msg, phase, bedLift, shake;
  const bonus = () => (G.S.owned.includes('x_degnek') ? 15 : 0) + (G.S.owned.includes('x_30sn') ? 30 : 0);
  function layout() {
    const W = G.W, H = G.H;
    const binH = Math.min(120, H * .2), binY = H - binH - 12, bw = Math.min(240, (W - 60) / 3);
    bins = KEYS.map((k, i) => ({ k, x: (W - bw * 3 - 24) / 2 + i * (bw + 12), y: binY, w: bw, h: binH }));
    return { binY, binH };
  }
  function scatter(n, under) {
    const L = layout(); const out = [];
    for (let i = 0; i < n; i++) {
      const k = KEYS[i % 3], list = KIND[k].items;
      out.push({
        k, em: list[Math.floor(Math.random() * list.length)],
        x: G.rnd(70, G.W - 70),
        y: under ? G.rnd(G.H * .60, G.H * .68) : G.rnd(G.H * .44, L.binY - 56),
        r: G.rnd(-.4, .4), s: .9 + Math.random() * .3, under: under ? 1 : 0, gone: 0, pop: 0
      });
    }
    return out;
  }
  function start() {
    state = 'play'; t = 0; limit = 60 + bonus(); mistakes = 0; placed = 0; phase = 1; bedLift = 0; shake = 0;
    items = scatter(9, false); total = 9; msg = null;
  }
  function secondWave() {
    phase = 2; const extra = scatter(4, true); items = items.concat(extra); total += extra.length;
    msg = { s: 'Hacer: “Yatağın altı da sayılır!”', t: 3.2 }; Audio.sfx('bell');
  }
  function finish(timeout) {
    state = 'done';
    const left = Math.max(0, limit - t);
    const score = placed * 10 + Math.round(left) * 2 - mistakes * 5;
    const stars = (!timeout && mistakes <= 1 && left > 12) ? 3 : !timeout ? 2 : placed >= total * .6 ? 1 : 0;
    setTimeout(() => G.finish('room', Math.max(0, score), stars, timeout
      ? `Süre doldu, <b>${total - placed}</b> eşya ortada kaldı. Anne kapıda.`
      : `${total} eşya yerine girdi, <b>${mistakes}</b> yanlış kutu. ${G.pick(DONE_LINES)}`), 900);
  }
  function drop(p) {
    const b = bins.find(b => p.x > b.x && p.x < b.x + b.w && p.y > b.y - 20 && p.y < b.y + b.h);
    if (!b) return false;
    if (b.k === drag.k) {
      drag.gone = 1; drag.pop = .35; placed++; Audio.sfx('pop');
      G.burst(b.x + b.w / 2, b.y + 20, KIND[b.k].color, 10, 200);
      const left = items.filter(i => !i.gone);
      if (phase === 1 && left.length === 0) setTimeout(secondWave, 500);
      else if (phase === 2 && left.length === 0) finish(false);
      return true;
    }
    mistakes++; t += 3; shake = .4; Audio.sfx('wrong'); msg = { s: G.pick(WRONG), t: 2.2 };
    return false;
  }
  return {
    landscape: true, showHome: true, showStars: true,
    enter() {
      hair = Art.makeHair(6); Audio.ambience(false); state = 'intro'; items = []; drag = null; t = 0; limit = 60 + bonus();
      const b = bonus();
      const p = G.panel(`<div class="who"><canvas id="av"></canvas><div><div class="name">Hacer</div><h2 style="font-size:28px">Oda Toplama</h2></div></div>
        <p class="lead">“Lina, oda yine savaş alanı. Eşyaları doğru yere koy: oyuncaklar sandığa, kitaplar kitaplığa, kıyafetler sepete. Ben çayı demleyip geliyorum.”</p>
        <p>Eşyayı tut ve doğru kutuya sürükle. Yanlış kutu 3 saniye götürür. Ortalık temizlenince yatağın altına da bakacağız.</p>
        ${b ? `<span class="badge">Serkan Dijital: +${b} saniye ek süre</span>` : '<p style="font-size:14px;color:var(--muted)">İpucu: Serkan Dijital’de süre uzatan şeyler var.</p>'}
        <div class="actions center"><button class="btn big" id="go">Toplamaya başla</button></div>`);
      p.querySelector('#av').replaceWith(Art.avatar('hacer'));
      p.querySelector('#go').onclick = () => { G.closePanels(); start(); Audio.sfx('pop'); };
    },
    resize() { if (items) layout(); },
    down(p) {
      if (state !== 'play') return;
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i]; if (it.gone || (it.under && phase < 2)) continue;
        if (Math.hypot(p.x - it.x, p.y - it.y) < 34) { drag = it; it.grab = 1; items.splice(i, 1); items.push(it); Audio.sfx('tap'); return; }
      }
    },
    move(p) { if (drag) { drag.x = p.x; drag.y = p.y; } },
    up(p) { if (!drag) return; drop(p); drag.grab = 0; drag = null; },
    update(dt) {
      if (msg) msg.t -= dt; if (shake > 0) shake -= dt;
      for (const it of items) if (it.pop > 0) it.pop -= dt;
      if (phase === 2 && bedLift < 1) bedLift = Math.min(1, bedLift + dt * 2);
      if (state !== 'play') return;
      t += dt; if (t >= limit) finish(true);
    },
    draw(c, W, H, T) {
      const L = layout();
      // duvar + zemin
      const g = c.createLinearGradient(0, 0, 0, H * .7); g.addColorStop(0, '#ffe8d4'); g.addColorStop(1, '#ffd9bd');
      c.fillStyle = g; c.fillRect(0, 0, W, H * .7);
      c.fillStyle = 'rgba(255,255,255,.35)'; for (let x = 0; x < W; x += 54) c.fillRect(x, 0, 22, H * .7);
      c.fillStyle = '#c99a63'; c.fillRect(0, H * .7, W, H * .3);
      c.fillStyle = 'rgba(0,0,0,.06)'; for (let x = -((T * 0) % 90); x < W; x += 90) c.fillRect(x, H * .7, 3, H);
      // halı
      c.fillStyle = '#ffb3c6'; c.beginPath(); c.ellipse(W * .5, H * .78, W * .28, H * .07, 0, 0, 7); c.fill();
      // pencere
      c.save(); c.beginPath(); c.roundRect(W * .06, H * .10, W * .2, H * .28, 14); c.clip();
      Art.sky(c, W, H, .3, H * .3); Art.sea(c, W, H * .26, H * .4, .3); c.restore();
      c.strokeStyle = '#fff'; c.lineWidth = 9; c.beginPath(); c.roundRect(W * .06, H * .10, W * .2, H * .28, 14); c.stroke();
      c.fillStyle = '#fff'; c.fillRect(W * .16 - 3, H * .10, 6, H * .28);
      // raf
      c.fillStyle = '#a9713f'; c.fillRect(W * .62, H * .26, W * .3, 12);
      c.fillStyle = '#000'; c.font = '26px serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      ['🪴', '🏆', '🐚'].forEach((e, i) => c.fillText(e, W * .66 + i * 46, H * .26 - 16));
      // yatak
      const by = H * .52 - bedLift * 26;
      c.save(); c.translate(0, phase === 2 ? -bedLift * 18 : 0);
      c.fillStyle = '#8b5a2b'; c.fillRect(W * .60, by, W * .34, H * .16);
      c.fillStyle = '#a77cf0'; c.beginPath(); c.roundRect(W * .60, by - 18, W * .34, 32, 8); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.roundRect(W * .62, by - 34, 74, 30, 10); c.fill();
      c.restore();
      if (phase === 2) { c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(W * .77, H * .70, W * .17, 12, 0, 0, 7); c.fill(); }
      // Lina
      Art.lina(c, W * .40, H * .70, Math.min(.62, H / 900), { hair, dt: 1 / 60, wind: 8, arms: drag ? 'up' : 'hold', face: state === 'done' ? 'wow' : mistakes && msg && msg.t > 0 ? 'sad' : 'happy', blink: Math.sin(T * 3) > .96 });
      // kutular
      for (const b of bins) {
        const K = KIND[b.k]; const hot = drag && drag.k === b.k;
        c.save(); if (shake > 0) c.translate(Math.sin(T * 40) * 3 * shake, 0);
        c.fillStyle = hot ? K.color : Art.shade(K.color, -.15);
        c.beginPath(); c.roundRect(b.x, b.y, b.w, b.h, 16); c.fill();
        c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.roundRect(b.x + 8, b.y + 8, b.w - 16, b.h * .34, 10); c.fill();
        c.fillStyle = '#000'; c.font = `${Math.round(b.h * .36)}px serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(K.em, b.x + b.w / 2, b.y + b.h * .42);
        G.txt(c, K.name, b.x + b.w / 2, b.y + b.h * .8, 15, '#fff');
        if (hot) { c.strokeStyle = '#fff'; c.lineWidth = 4; c.setLineDash([10, 8]); c.lineDashOffset = -T * 30; c.beginPath(); c.roundRect(b.x + 3, b.y + 3, b.w - 6, b.h - 6, 14); c.stroke(); c.setLineDash([]); }
        c.restore();
      }
      // eşyalar
      for (const it of items) {
        if (it.gone && it.pop <= 0) continue;
        if (it.under && phase < 2) continue;
        const sc = it.gone ? Math.max(0, it.pop * 3) : it.s * (it.grab ? 1.25 : 1);
        c.save(); c.translate(it.x, it.y + (it.grab ? -16 : Math.sin(T * 2 + it.x) * 0)); c.rotate(it.grab ? 0 : it.r); c.scale(sc, sc);
        if (it.grab) { c.fillStyle = 'rgba(0,0,0,.15)'; c.beginPath(); c.ellipse(0, 26, 22, 7, 0, 0, 7); c.fill(); }
        c.fillStyle = '#000'; c.font = '40px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(it.em, 0, 0);
        c.restore();
      }
      // üst bilgi
      if (state === 'play' || state === 'done') {
        const left = Math.max(0, Math.ceil(limit - t));
        c.fillStyle = 'rgba(15,42,68,.8)'; c.beginPath(); c.roundRect(W / 2 - 170, Math.max(10, H * .02), 340, 46, 23); c.fill();
        G.txt(c, `🧺 ${placed}/${total}`, W / 2 - 80, Math.max(10, H * .02) + 23, 20, '#fff');
        G.txt(c, `Anne gelmesine ${left} sn`, W / 2 + 62, Math.max(10, H * .02) + 23, 17, left < 12 ? '#ff9f80' : '#fff');
      }
      if (msg && msg.t > 0) { c.globalAlpha = Math.min(1, msg.t); G.txtShadow(c, msg.s, W / 2, H * .18, 22, '#fff', 'rgba(0,0,0,.45)'); c.globalAlpha = 1; }
    },
    exit() { G.closePanels(); }
  };
})();
