/* Açılış: şafak, deniz, Lina ve dalgalanan saçları + karakter ekleme */
G.scenes.title = (() => {
  let hair, bird = [];
  function home() {
    G.closePanels();
    const p = G.panel(`<div style="text-align:center">
      <p class="lead" style="color:#b6c6d8;margin:0">Tuzla, İstanbul</p>
      <h2 style="font-size:clamp(34px,6vw,58px);color:#fff">Lina'nın<br><span style="color:var(--orange)">Turuncu</span> Günü</h2>
      <p style="color:#d9e4f0">Sabah okul yolu, öğleden sonra piyano ve resim, akşam AVM turu ve suşi… Bugün Tuzla'da Lina'nın günü.</p>
      <div class="actions center"><button class="btn big" id="start">${G.S.days > 0 || G.S.totalStars > 0 ? 'Devam et' : 'Güne başla'}</button></div>
      ${G.S.totalStars > 0 ? `<p style="color:#b6c6d8;font-size:15px;margin:10px 0 0">Toplam ★ ${G.S.totalStars} · ${G.S.days} gün tamamlandı</p>` : ''}
    </div>`, 'dark bottom');
    p.style.width = 'min(520px,calc(100vw - 32px))';
    if (G.W > 700) { p.style.left = 'auto'; p.style.right = '24px'; p.style.transform = 'none'; p.style.bottom = '50%'; p.style.translate = '0 50%'; }
    p.querySelector('#start').onclick = () => { Audio.unlock(); Audio.sfx('pop'); G.go('hub'); };
  }
  return {
    landscape: false,
    enter() {
      hair = Art.makeHair(11);
      bird = Array.from({ length: 4 }, (_, i) => ({ x: Math.random() * G.W, y: 60 + i * 40, s: .7 + Math.random() * .6, v: 30 + Math.random() * 30, ph: Math.random() * 6 }));
      Audio.ambience(true); home();
    },
    update(dt) { for (const b of bird) { b.x += b.v * dt; if (b.x > G.W + 40) b.x = -40; } },
    draw(c, W, H, T) {
      const hz = H * .62; const t = .06 + Math.sin(T * .15) * .04;
      Art.sky(c, W, H, t, hz);
      Art.clouds(c, W, hz * .35, t, 10, .8);
      for (const b of bird) Art.seagull(c, b.x, b.y, T + b.ph, b.s);
      Art.skyline(c, W, hz + 2, t, 'rgba(60,70,120,.55)');
      Art.sea(c, W, hz, H, t);
      Art.sailboats(c, W, hz + 40, t);
      c.fillStyle = '#5a3a26'; c.fillRect(W * .3 - 160, hz + 60, 320, 14); for (let i = 0; i < 5; i++) c.fillRect(W * .3 - 150 + i * 75, hz + 70, 10, 40);
      const s = Math.min(1.5, H / 520);
      Art.lina(c, W * .3, hz + 62, s, { hair, dt: 1 / 60, wind: 90 + Math.sin(T * .8) * 70, arms: 'wave', face: Math.sin(T * 1.3) > .85 ? 'wink' : 'happy', blink: Math.sin(T * 3.1) > .97 });
    },
    exit() { G.closePanels(); }
  };
})();
