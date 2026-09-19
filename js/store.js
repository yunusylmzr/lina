/* Serkan Dijital: oyunun içindeki eğlenceli mağaza. Para yok, yıldızla açılır. */
const Store = (() => {
  // Piyano için ek şarkılar (geleneksel ezgiler)
  const SONGS = [
    { id: 's_ali', name: "Ali Baba'nın Çiftliği", bpm: 116, em: '🐓', cost: 6, seq: 'C4 C4 C4 G4 A4 A4 G4- E4 E4 D4 D4 C4-- G4 C4 C4 C4 G4 A4 A4 G4- E4 E4 D4 D4 C4--' },
    { id: 's_portakal', name: 'Portakalı Soydum', bpm: 108, em: '🍊', cost: 6, seq: 'G4 G4 G4 E4 G4 A4 G4- F4 F4 F4 D4 F4 G4 F4- E4 E4 F4 G4 E4 D4 C4--' },
    { id: 's_deniz', name: 'Deniz Türküsü', bpm: 96, em: '⛵', cost: 8, seq: 'E4 G4 A4 G4 E4- D4 E4 G4 E4-- C4 D4 E4 D4 C4- G4 A4 G4 E4-- E4 G4 A4 C5 A4 G4 E4--' }
  ];
  // Atölye için damga paketleri
  const PACKS = [
    { id: 'p_deniz', name: 'Deniz paketi', cost: 5, em: '🐙', items: ['🐙', '🐬', '🦀', '🐚', '🌊', '🦈'] },
    { id: 'p_uzay', name: 'Uzay paketi', cost: 5, em: '🚀', items: ['🚀', '🪐', '👽', '🌙', '☄️', '🛸'] },
    { id: 'p_tatli', name: 'Tatlı paketi', cost: 4, em: '🧁', items: ['🧁', '🍪', '🍫', '🍬', '🍰', '🍯'] },
    { id: 'p_hayvan', name: 'Hayvan paketi', cost: 4, em: '🦊', items: ['🦊', '🐼', '🦋', '🐢', '🦉', '🐶'] }
  ];
  const has = id => (G.S.unlocked.songs.includes(id) || G.S.unlocked.stamps.includes(id) || G.S.owned.includes(id));
  const extraSongs = () => SONGS.filter(s => G.S.unlocked.songs.includes(s.id));
  const extraStamps = () => PACKS.filter(p => G.S.unlocked.stamps.includes(p.id)).flatMap(p => p.items);
  function catalog() {
    const out = [];
    for (const [id, o] of Object.entries(Art.OUTFITS)) if (o.cost > 0) out.push({ id, cat: 'Kıyafet', name: o.name, cost: o.cost, kind: 'outfit', color: o.color, print: o.print, sub: 'Lina için kıyafet' });
    for (const [id, a] of Object.entries(Art.ACC)) if (a.cost > 0) out.push({ id, cat: 'Saç', name: a.name, cost: a.cost, kind: 'acc', em: a.em, sub: 'Saç aksesuarı' });
    for (const s of SONGS) out.push({ id: s.id, cat: 'Şarkı', name: s.name, cost: s.cost, kind: 'song', em: s.em, sub: 'Piyano parçası' });
    for (const p of PACKS) out.push({ id: p.id, cat: 'Damga', name: p.name, cost: p.cost, kind: 'stamp', em: p.em, sub: p.items.slice(0, 4).join(' ') });
    return out;
  }
  function unlock(it) {
    if (it.kind === 'song') G.S.unlocked.songs.push(it.id);
    else if (it.kind === 'stamp') G.S.unlocked.stamps.push(it.id);
    else G.S.owned.push(it.id);
    G.save();
  }
  function use(it) {
    if (it.kind === 'outfit') { G.S.outfit = it.id; G.save(); G.toast(`${it.name} giydin`); }
    else if (it.kind === 'acc') { G.S.hair = it.id; G.save(); G.toast(`${it.name} taktın`); }
    else if (it.kind === 'song') G.go('piano');
    else if (it.kind === 'stamp') G.go('paint');
  }
  function iconEl(it) {
    if (it.kind === 'outfit') {
      const cv = document.createElement('canvas'); cv.width = cv.height = 108; const c = cv.getContext('2d'); c.scale(2, 2);
      c.fillStyle = it.color; c.beginPath(); c.moveTo(14, 10); c.lineTo(40, 10); c.lineTo(48, 20); c.lineTo(41, 26); c.lineTo(41, 46); c.lineTo(13, 46); c.lineTo(13, 26); c.lineTo(6, 20); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(19, 10, 6, 36);
      if (it.print) { c.font = '18px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(it.print, 27, 32); }
      cv.className = 'ico'; return cv;
    }
    const d = document.createElement('div'); d.className = 'ico em'; d.textContent = it.em; return d;
  }
  return { SONGS, PACKS, extraSongs, extraStamps, catalog, unlock, use, has, iconEl };
})();

G.scenes.store = (() => {
  const TABS = ['Öne çıkanlar', 'Kıyafet', 'Saç', 'Şarkı', 'Damga'];
  let state, tab, tiles, logoT, box, featured;
  function build() {
    G.closePanels();
    const items = Store.catalog();
    if (!featured) { const f = items.filter(i => !Store.has(i.id)).sort((a, b) => a.cost - b.cost); featured = (f.length ? f : items.slice().sort((a, b) => a.cost - b.cost)).slice(0, 6).map(i => i.id); }
    const list = tab === 'Öne çıkanlar' ? featured.map(id => items.find(i => i.id === id)).filter(Boolean) : items.filter(i => i.cat === tab);
    const p = G.panel(`<div class="store-head">
        <div class="store-logo"><span>▶</span></div>
        <div><h2>Serkan Dijital</h2><p>Lina'ya özel uygulamalar, yıldızla açılır</p></div>
        <span class="badge big">★ ${G.S.stars}</span>
      </div>
      <div class="tabs">${TABS.map(t => `<button class="tab ${t === tab ? 'sel' : ''}" data-t="${t}">${t}</button>`).join('')}</div>
      <div class="apps">${list.map(i => `<div class="app" data-id="${i.id}"><span class="ico-slot"></span>
        <div class="meta"><div class="name">${i.name}</div><div class="sub">${i.sub}</div><div class="bar"><i></i></div></div>
        <button class="act ${Store.has(i.id) ? 'own' : ''}">${Store.has(i.id) ? (i.kind === 'outfit' || i.kind === 'acc' ? 'Giy' : 'Aç') : '★ ' + i.cost}</button></div>`).join('')}
      </div>
      <div class="actions"><button class="btn ghost" data-a="back">Haritaya dön</button></div>`, 'bottom store');
    p.querySelectorAll('.tab').forEach(b => b.onclick = () => { tab = b.dataset.t; Audio.sfx('tap'); build(); });
    p.querySelectorAll('.app').forEach(el => {
      const it = items.find(i => i.id === el.dataset.id);
      el.querySelector('.ico-slot').replaceWith(Store.iconEl(it));
      el.querySelector('.act').onclick = e => {
        const btn = e.currentTarget;
        if (Store.has(it.id)) { Store.use(it); Audio.sfx('pop'); if (it.kind === 'outfit' || it.kind === 'acc') build(); return; }
        if (G.S.stars < it.cost) { Audio.sfx('wrong'); G.toast(`${it.cost - G.S.stars} yıldız daha lazım`); return; }
        G.S.stars -= it.cost; G.save(); G.updateStars();
        btn.disabled = true; btn.textContent = 'İniyor…'; el.classList.add('dl');
        Audio.sfx('tick');
        let n = 0; const iv = setInterval(() => { n++; if (n % 2 === 0) Audio.sfx('tick'); }, 140);
        setTimeout(() => {
          clearInterval(iv); Store.unlock(it); Audio.sfx('star');
          const r = el.getBoundingClientRect(); G.burst(r.left + r.width / 2, r.top + r.height / 2, '#ffd166', 18, 280);
          build();
        }, 1050);
      };
    });
    p.querySelector('[data-a=back]').onclick = () => G.go('hub');
    box = p;
  }
  return {
    landscape: true, showHome: true, showStars: true,
    enter() {
      tab = 'Öne çıkanlar'; logoT = 0; featured = null; Audio.ambience(false);
      tiles = Array.from({ length: 14 }, (_, i) => ({ x: Math.random(), y: Math.random(), s: .5 + Math.random() * .7, v: .01 + Math.random() * .03, em: ['🎹', '🍣', '🎨', '⭐', '👗', '🎀', '🚀', '🐙', '🧁', '🎧', '🌈', '⛵', '🦊', '🍊'][i], ph: Math.random() * 6 }));
      if (!G.S.storeSeen) {
        state = 'splash';
        const p = G.panel(`<div class="result">
          <p class="lead">Serkan: “Kendi mağazamı kurdum Lina! Burada kıyafetler, şarkılar ve boyama damgaları var. Ödeme yok, her şey topladığın yıldızlarla.”</p></div>
          <div class="actions center"><button class="btn big" id="go">Mağazaya gir</button></div>`, 'bottom');
        p.style.width = 'min(560px,calc(100vw - 32px))';
        p.querySelector('#go').onclick = () => { G.S.storeSeen = 1; G.save(); state = 'browse'; Audio.sfx('pop'); build(); };
      } else { state = 'browse'; build(); }
    },
    update(dt) { logoT += dt; for (const t of tiles) { t.y -= t.v * dt * 4; if (t.y < -.1) { t.y = 1.1; t.x = Math.random(); } } },
    draw(c, W, H, T) {
      const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#1a1040'); g.addColorStop(.55, '#2b1a5e'); g.addColorStop(1, '#0f2a44');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      // ışık huzmesi
      const rg = c.createRadialGradient(W * .28, H * .3, 0, W * .28, H * .3, Math.max(W, H) * .6);
      rg.addColorStop(0, 'rgba(255,122,26,.25)'); rg.addColorStop(1, 'rgba(255,122,26,0)'); c.fillStyle = rg; c.fillRect(0, 0, W, H);
      // yüzen uygulama kutuları
      for (const t of tiles) {
        const x = t.x * W, y = t.y * H + Math.sin(T + t.ph) * 8, s = 46 * t.s;
        c.save(); c.translate(x, y); c.rotate(Math.sin(T * .4 + t.ph) * .12);
        c.fillStyle = 'rgba(255,255,255,.10)'; c.beginPath(); c.roundRect(-s / 2, -s / 2, s, s, s * .26); c.fill();
        c.strokeStyle = 'rgba(255,255,255,.16)'; c.lineWidth = 2; c.stroke();
        c.fillStyle = '#000'; c.font = `${s * .55}px serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t.em, 0, s * .03);
        c.restore();
      }
      if (state === 'splash') {
        const k = Math.min(1, logoT * 2), e = G.ease(k), cx = W / 2, cy = H * .30;
        c.save(); c.translate(cx, cy); c.scale(e, e); c.rotate((1 - e) * .5);
        const s = Math.min(150, H * .2);
        const lg = c.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2); lg.addColorStop(0, '#ffb570'); lg.addColorStop(1, '#ff5c8a');
        c.fillStyle = lg; c.beginPath(); c.roundRect(-s / 2, -s / 2, s, s, s * .28); c.fill();
        c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-s * .12, -s * .2); c.lineTo(s * .24, 0); c.lineTo(-s * .12, s * .2); c.closePath(); c.fill();
        c.restore();
        c.globalAlpha = k; G.txtShadow(c, 'SERKAN DİJİTAL', cx, cy + Math.min(150, H * .2) * .75, Math.min(46, W * .06), '#fff', 'rgba(0,0,0,.4)');
        c.globalAlpha = 1;
        for (let i = 0; i < 6; i++) { const a = T * .8 + i; c.fillStyle = 'rgba(255,209,102,.9)'; G.star(c, cx + Math.cos(a) * (140 + Math.sin(T + i) * 20), cy + Math.sin(a * 1.3) * 90, 5 + Math.sin(T * 3 + i) * 2, a); }
        Art.char(c, 'serkan', W * .82, H * .95, Math.min(.85, H / 700), { arms: 'wave', face: 'happy' });
      } else {
        G.txt(c, 'Serkan Dijital', W * .5, Math.max(70, H * .1), Math.min(40, W * .05), 'rgba(255,255,255,.9)');
        G.txt(c, 'yıldızlarını harca, yenilerini kazan', W * .5, Math.max(70, H * .1) + 30, 17, 'rgba(255,255,255,.5)');
        Art.char(c, 'serkan', W * .12, H * .98, Math.min(.6, H / 900), { arms: 'wave', face: 'happy' });
      }
    },
    exit() { G.closePanels(); }
  };
})();
