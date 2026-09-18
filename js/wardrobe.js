/* Gardırop: yıldızla saç aksesuarı ve elbise al, Lina'da dene */
G.scenes.wardrobe = (() => {
  let hair, tab = 'hair';
  function render() {
    G.closePanels();
    const items = tab === 'hair' ? Art.ACC : Art.OUTFITS; const cur = tab === 'hair' ? G.S.hair : G.S.outfit;
    const p = G.panel(`<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><h2>Gardırop</h2><span class="badge">★ ${G.S.stars} yıldızın var</span></div>
      <div class="actions" style="justify-content:flex-start;margin:4px 0 0"><button class="btn ${tab === 'hair' ? '' : 'ghost'}" data-tab="hair">Saç</button><button class="btn ${tab === 'outfit' ? 'coral' : 'ghost'}" data-tab="outfit">Kıyafet</button></div>
      <div class="grid">${Object.entries(items).map(([id, it]) => { const own = G.S.owned.includes(id); return `<div class="item ${cur === id ? 'sel' : ''} ${own ? '' : 'lock'}" data-id="${id}">${tab === 'hair' ? `<div class="em">${it.em}</div>` : `<div class="em" style="width:44px;height:44px;border-radius:50%;background:${it.color};display:flex;align-items:center;justify-content:center;font-size:22px">${it.print || ''}</div>`}${it.name}<div class="cost">${own ? (cur === id ? 'giyiyor' : 'sende') : `★ ${it.cost}`}</div></div>`; }).join('')}</div>
      <div class="actions"><button class="btn ghost" data-a="back">Haritaya dön</button></div>`, 'bottom');
    p.style.width = 'min(560px,calc(100vw - 32px))'; p.style.left = 'auto'; p.style.right = '16px'; p.style.transform = 'none'; p.style.maxHeight = 'calc(100vh - 100px)';
    p.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; Audio.sfx('tap'); render(); });
    p.querySelectorAll('.item').forEach(el => el.onclick = () => {
      const id = el.dataset.id, it = items[id];
      if (!G.S.owned.includes(id)) { if (G.S.stars >= it.cost) { G.S.stars -= it.cost; G.S.owned.push(id); Audio.sfx('fanfare'); G.toast(`${it.name} artık senin!`); G.burst(G.W * .3, G.H * .4, '#ffd166', 30, 400); } else { Audio.sfx('wrong'); G.toast(`${it.cost - G.S.stars} yıldız daha lazım`); return render(); } }
      else Audio.sfx('pop');
      if (tab === 'hair') G.S.hair = id; else G.S.outfit = id; G.save(); G.updateStars(); render();
    });
    p.querySelector('[data-a=back]').onclick = () => G.go('hub');
  }
  return {
    landscape: true, showHome: true, showStars: true,
    enter() { hair = Art.makeHair(9); tab = 'hair'; render(); },
    draw(c, W, H, T) {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#ffe8d4'); g.addColorStop(1, '#ffc9a8'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      // podyum
      const px = Math.min(W * .3, 320);
      c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(px, H * .82, 170, 34, 0, 0, 7); c.fill();
      // ayna
      c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.roundRect(px - 150, H * .1, 300, H * .74, 150); c.fill(); c.strokeStyle = '#ffd166'; c.lineWidth = 10; c.stroke();
      Art.lina(c, px, H * .82, Math.min(1.7, H / 450), { hair, dt: 1 / 60, wind: 20 + Math.sin(T) * 15, arms: Math.sin(T * .7) > 0 ? 'wave' : undefined, face: Math.sin(T * 1.7) > .9 ? 'wink' : 'happy', blink: Math.sin(T * 3) > .96 });
      G.txt(c, 'Lina', px, H * .92, 26, '#d95a00');
    },
    exit() { G.closePanels(); }
  };
})();
