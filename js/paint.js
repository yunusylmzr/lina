/* Karalama Atölyesi: fırçalar, sim, neon, damgalar; boyama şablonları */
G.scenes.paint = (() => {
  const COLORS = ['#ff7a1a', '#ff5c8a', '#ffd166', '#5cd6a9', '#2e8bc0', '#a77cf0', '#ff9f80', '#1b1b2f', '#ffffff', '#8b5a2b', '#3f9e4a', '#ffb3c6'];
  const STAMPS = ['🍣', '🐟', '🎹', '⭐', '🌸', '🧡', '🐱', '🦄', '🌈', '🍦', '⛵', '🎀'];
  const TOOLS = [['pen', 'Kalem', '✏️'], ['brush', 'Fırça', '🖌️'], ['glitter', 'Sim', '✨'], ['neon', 'Neon', '💡'], ['stamp', 'Damga', '🍣'], ['eraser', 'Silgi', '🧽']];
  let layer, lc, tool, color, size, stamp, undo, strokes, last, template, hair, bar, tmplCv;
  function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function ensureLayer() { const w = Math.round(G.W * 2), h = Math.round(G.H * 2); if (!layer || layer.width !== w || layer.height !== h) { const n = mk(w, h); if (layer) n.getContext('2d').drawImage(layer, 0, 0, w, h); layer = n; lc = layer.getContext('2d'); lc.lineCap = lc.lineJoin = 'round'; drawTemplate(); } }
  function drawTemplate() {
    tmplCv = mk(layer.width, layer.height); const c = tmplCv.getContext('2d'); c.scale(2, 2);
    if (template === 'lina') { Art.char(c, 'lina', G.W / 2, G.H * .82, Math.min(2.4, G.H / 300), { face: 'happy', arms: 'wave' }); }
    else if (template === 'sushi') { c.font = `${Math.min(220, G.W / 5)}px serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; ['🍣', '🍱', '🐟', '🥢'].forEach((e, i) => c.fillText(e, G.W * (.2 + i * .2), G.H * .5 + (i % 2) * 60)); }
    else if (template === 'tuzla') { Art.skyline(c, G.W, G.H * .6, .3, '#333'); Art.sailboats(c, G.W, G.H * .72, .3); }
    else return;
    // griye çevir + soluklaştır (boyama şablonu)
    const im = c.getImageData(0, 0, tmplCv.width, tmplCv.height), d = im.data;
    for (let i = 0; i < d.length; i += 4) { const g = (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) * .6 + 90; d[i] = d[i + 1] = d[i + 2] = g; d[i + 3] = d[i + 3] * .45; }
    c.setTransform(1, 0, 0, 1, 0, 0); c.putImageData(im, 0, 0);
  }
  function snapshot() { undo.push(layer.toDataURL ? lc.getImageData(0, 0, layer.width, layer.height) : null); if (undo.length > 12) undo.shift(); }
  function doUndo() { const im = undo.pop(); if (im) lc.putImageData(im, 0, 0); else lc.clearRect(0, 0, layer.width, layer.height); Audio.sfx('tap'); }
  function dot(x, y, px, py) {
    lc.save(); lc.scale(2, 2); lc.globalCompositeOperation = 'source-over';
    if (tool === 'eraser') { lc.globalCompositeOperation = 'destination-out'; lc.strokeStyle = '#000'; lc.lineWidth = size * 2.5; lc.beginPath(); lc.moveTo(px, py); lc.lineTo(x, y); lc.stroke(); }
    else if (tool === 'pen') { lc.strokeStyle = color; lc.lineWidth = size; lc.beginPath(); lc.moveTo(px, py); lc.lineTo(x, y); lc.stroke(); }
    else if (tool === 'brush') { lc.globalAlpha = .28; lc.strokeStyle = color; lc.lineWidth = size * 2.2; lc.beginPath(); lc.moveTo(px, py); lc.lineTo(x, y); lc.stroke(); lc.globalAlpha = .6; lc.lineWidth = size * 1.1; lc.stroke(); }
    else if (tool === 'neon') { lc.shadowColor = color; lc.shadowBlur = size * 1.6; lc.strokeStyle = color; lc.lineWidth = size * .9; lc.beginPath(); lc.moveTo(px, py); lc.lineTo(x, y); lc.stroke(); lc.shadowBlur = 0; lc.strokeStyle = '#fff'; lc.lineWidth = size * .3; lc.stroke(); }
    else if (tool === 'glitter') { const d = Math.hypot(x - px, y - py); const n = 2 + Math.floor(d / 4); for (let i = 0; i < n; i++) { const t = i / n, gx = px + (x - px) * t + (Math.random() - .5) * size * 2, gy = py + (y - py) * t + (Math.random() - .5) * size * 2; lc.fillStyle = Math.random() < .5 ? color : (Math.random() < .5 ? '#fff' : '#ffd166'); G.star(lc, gx, gy, 1.5 + Math.random() * size * .28, Math.random() * 6, 4); } }
    lc.restore();
  }
  function stampAt(x, y) { lc.save(); lc.scale(2, 2); lc.font = `${size * 4 + 20}px serif`; lc.textAlign = 'center'; lc.textBaseline = 'middle'; lc.translate(x, y); lc.rotate((Math.random() - .5) * .5); lc.fillText(stamp, 0, 0); lc.restore(); Audio.sfx('pop'); }
  function buildBar() {
    bar = document.createElement('div'); bar.id = 'paintbar';
    bar.innerHTML = TOOLS.map(([id, n, e]) => `<button class="tool ${id === tool ? 'sel' : ''}" data-t="${id}"><span class="em">${e}</span>${n}</button>`).join('') +
      `<div class="sep"></div>` + COLORS.map(c => `<div class="sw ${c === color ? 'sel' : ''}" data-c="${c}" style="background:${c}"></div>`).join('') +
      `<div class="sep"></div><input type="range" min="3" max="40" value="${size}" id="sz" aria-label="Kalınlık"><div class="sep"></div>
       <button class="tool" data-a="undo"><span class="em">↩️</span>Geri al</button><button class="tool" data-a="clear"><span class="em">🗑️</span>Temizle</button><button class="tool" data-a="save" style="background:var(--mint);color:#08351f"><span class="em">💾</span>Kaydet</button>`;
    document.getElementById('app').appendChild(bar);
    bar.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tool = b.dataset.t; Audio.sfx('tap'); bar.querySelectorAll('[data-t]').forEach(x => x.classList.toggle('sel', x === b)); if (tool === 'stamp') pickStamp(); });
    bar.querySelectorAll('.sw').forEach(s => s.onclick = () => { color = s.dataset.c; Audio.sfx('tap'); bar.querySelectorAll('.sw').forEach(x => x.classList.toggle('sel', x === s)); if (tool === 'eraser') { tool = 'pen'; bar.querySelectorAll('[data-t]').forEach(x => x.classList.toggle('sel', x.dataset.t === 'pen')); } });
    bar.querySelector('#sz').oninput = e => size = +e.target.value;
    bar.querySelector('[data-a=undo]').onclick = doUndo;
    bar.querySelector('[data-a=clear]').onclick = () => { snapshot(); lc.clearRect(0, 0, layer.width, layer.height); Audio.sfx('whoosh'); };
    bar.querySelector('[data-a=save]').onclick = savePic;
  }
  function pickStamp() { const p = G.panel(`<h2>Damga seç</h2><div class="grid">${STAMPS.map(s => `<div class="item ${s === stamp ? 'sel' : ''}" data-s="${s}"><div class="em">${s}</div></div>`).join('')}</div>`, 'bottom'); p.querySelectorAll('.item').forEach(el => el.onclick = () => { stamp = el.dataset.s; bar.querySelector('[data-t=stamp] .em').textContent = stamp; G.closePanels(); Audio.sfx('pop'); }); }
  function composite() { const out = mk(layer.width, layer.height); const c = out.getContext('2d'); c.fillStyle = '#fffdf8'; c.fillRect(0, 0, out.width, out.height); c.drawImage(tmplCv, 0, 0); c.drawImage(layer, 0, 0); return out; }
  function savePic() {
    const out = composite(); const th = mk(320, Math.round(320 * out.height / out.width)); th.getContext('2d').drawImage(out, 0, 0, th.width, th.height);
    G.S.gallery.unshift(th.toDataURL('image/jpeg', .7)); if (G.S.gallery.length > 12) G.S.gallery.pop(); G.save();
    const url = out.toDataURL('image/png');
    const stars = strokes >= 40 ? 3 : strokes >= 15 ? 2 : 1;
    const p = G.panel(`<h2>Resmin kaydedildi!</h2><p>Galeride saklandı. Fotoğraflara eklemek için resme uzun bas ve “Fotoğraflara Ekle”yi seç.</p>
      <img src="${url}" style="width:100%;border-radius:16px;box-shadow:0 8px 24px rgba(0,0,0,.2)" alt="Lina'nın resmi">
      <div class="actions"><button class="btn ghost" data-a="c">Çizmeye devam</button><a class="btn sea" href="${url}" download="lina-resim.png">İndir</a><button class="btn coral" data-a="f">Bitir</button></div>`);
    p.querySelector('[data-a=c]').onclick = () => G.closePanels();
    p.querySelector('[data-a=f]').onclick = () => { G.closePanels(); G.finish('paint', strokes, stars, `<b>${strokes}</b> fırça darbesi, galeride <b>${G.S.gallery.length}</b> resim. Betül: “Bu duvara asılmalı!”`, { unit: 'darbe' }); };
    Audio.sfx('good');
  }
  function gallery() { if (!G.S.gallery.length) return G.toast('Galeri boş, ilk resmini çiz!'); const p = G.panel(`<h2>Galeri</h2><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">${G.S.gallery.map(g => `<img src="${g}" style="width:100%;border-radius:12px;background:#fff">`).join('')}</div><div class="actions"><button class="btn ghost" id="x">Kapat</button></div>`); p.querySelector('#x').onclick = () => G.closePanels(); }
  return {
    landscape: false, showHome: true, showStars: true,
    enter() { tool = 'pen'; color = '#ff7a1a'; size = 12; stamp = '🍣'; undo = []; strokes = 0; template = 'blank'; hair = Art.makeHair(5); layer = null; ensureLayer(); Audio.ambience(false);
      const p = G.panel(`<h2>Karalama Atölyesi</h2><p class="lead">Ne çizmek istersin?</p><div class="grid">
        <div class="item" data-t="blank"><div class="em">⬜️</div>Boş kâğıt</div><div class="item" data-t="lina"><div class="em">👧</div>Lina'yı boya</div><div class="item" data-t="sushi"><div class="em">🍣</div>Suşi tabağı</div><div class="item" data-t="tuzla"><div class="em">⛵</div>Tuzla sahili</div></div>
        <div class="actions"><button class="btn ghost" id="gal">Galeri (${G.S.gallery.length})</button></div>`);
      p.querySelectorAll('.item').forEach(el => el.onclick = () => { template = el.dataset.t; drawTemplate(); G.closePanels(); buildBar(); Audio.sfx('pop'); });
      p.querySelector('#gal').onclick = gallery;
    },
    resize() { ensureLayer(); },
    down(p) { if (!bar || document.querySelector('#ui .panel')) return; if (p.y > G.H - 110) return; snapshot(); last = { x: p.x, y: p.y }; if (tool === 'stamp') { stampAt(p.x, p.y); strokes++; } else { dot(p.x, p.y, p.x - .1, p.y); strokes++; } },
    move(p) { if (!last || !G.pointers.has(p.id) || tool === 'stamp') return; dot(p.x, p.y, last.x, last.y); last = { x: p.x, y: p.y }; },
    up() { last = null; },
    draw(c, W, H, T) {
      // kâğıt
      c.fillStyle = '#fffdf8'; c.fillRect(0, 0, W, H); c.fillStyle = 'rgba(27,27,47,.035)'; for (let y = 0; y < H; y += 26) for (let x = ((y / 26) % 2) * 13; x < W; x += 26) { c.beginPath(); c.arc(x, y, 1.2, 0, 7); c.fill(); }
      if (tmplCv) c.drawImage(tmplCv, 0, 0, W, H); if (layer) c.drawImage(layer, 0, 0, W, H);
      // köşede küçük Lina
      if (!bar) { Art.lina(c, W * .5, H * .78, Math.min(1, H / 700), { hair, dt: 1 / 60, wind: 10, arms: 'hold', face: 'happy', blink: Math.sin(T * 3) > .96 }); }
      else { c.fillStyle = 'rgba(15,42,68,.8)'; c.beginPath(); c.roundRect(W / 2 - 80, Math.max(10, H * .02), 160, 40, 20); c.fill(); G.txt(c, `${strokes} darbe`, W / 2, Math.max(10, H * .02) + 20, 18, '#fff'); }
    },
    exit() { bar?.remove(); bar = null; }
  };
})();
