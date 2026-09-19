/* Çizim: karakterler, Lina'nın fizikli saçı, gökyüzü ve manzara parçaları */
const Art = (() => {
  const P = () => G.PEOPLE;
  const spec = who => (typeof who === 'string' ? (P()[who] || P().lina) : who);
  const idOf = who => (typeof who === 'string' ? who : (who && who.id) || '');
  const TAU = Math.PI * 2;
  const shade = (hex, k) => { // k<0 koyu, >0 açık
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = v => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k)));
    return `rgb(${f(r)},${f(g)},${f(b)})`;
  };

  // ---- Lina'nın saçı: verlet zincirleri
  function makeHair(n = 7) {
    const strands = [];
    for (let i = 0; i < n; i++) {
      const pts = []; const len = 9 + (i % 3);
      for (let j = 0; j < len; j++) pts.push({ x: 0, y: 0, px: 0, py: 0 });
      const side = (i / (n - 1) * 2 - 1) || (i % 2 ? .12 : -.12); strands.push({ pts, side, seg: 8.5 + Math.abs(side) * 1.5, w: 10 + (1 - Math.abs(side)) * 5, phase: Math.random() * 6 });
    }
    return {
      strands,
      update(hx, hy, r, s, dt, wind = 0, vx = 0) {
        const t = G.T; const seg0 = 1;
        for (const st of strands) {
          const sgn = st.side >= 0 ? 1 : -1;
          const ang = -Math.PI / 2 + sgn * (0.7 + Math.abs(st.side) * 0.95); // başın üst-arka yanları
          const ax = hx + Math.cos(ang) * r * .96 * s, ay = hy + Math.sin(ang) * r * .96 * s;
          const seg = st.seg * s;
          if (!st.init) { st.init = 1; st.pts.forEach((p, j) => { p.x = p.px = ax + sgn * j * seg * .3; p.y = p.py = ay + j * seg * .95; }); }
          const p0 = st.pts[0]; p0.x = ax; p0.y = ay;
          for (let j = 1; j < st.pts.length; j++) {
            const p = st.pts[j];
            const vxp = (p.x - p.px) * .92, vyp = (p.y - p.py) * .92;
            p.px = p.x; p.py = p.y;
            p.x += vxp + (wind * 2.2 + Math.sin(t * 2.4 + st.phase + j * .5) * 26 + sgn * 6) * dt * dt * s * 18;
            p.y += vyp + 2400 * dt * dt * s;
          }
          for (let k = 0; k < 5; k++) for (let j = 1; j < st.pts.length; j++) {
            const a = st.pts[j - 1], b = st.pts[j]; let dx = b.x - a.x, dy = b.y - a.y; let d = Math.hypot(dx, dy) || 1;
            const diff = (d - seg) / d;
            if (j === 1) { b.x -= dx * diff; b.y -= dy * diff; } else { b.x -= dx * diff * .5; b.y -= dy * diff * .5; a.x += dx * diff * .5; a.y += dy * diff * .5; }
            // kafanın içine girmesin: üst yarıda yana kaydır, alt yarıda dışa it
            const ddx = b.x - hx, ddy = b.y - hy, dd = Math.hypot(ddx, ddy), minr = r * s * 1.0;
            if (dd < minr) { if (ddy < 0) { const w = Math.sqrt(Math.max(0, minr * minr - ddy * ddy)); b.x = hx + (ddx >= 0 ? 1 : -1) * Math.max(w, .1); } else { b.x = hx + ddx / dd * minr; b.y = hy + ddy / dd * minr; } }
          }
        }
      },
      draw(c, s, color, back = true) {
        // arkadaki tutamlar önce
        const order = strands.slice().sort((a, b) => Math.abs(b.side) - Math.abs(a.side));
        for (const st of order) {
          const pts = st.pts; c.lineCap = 'round'; c.lineJoin = 'round';
          for (let pass = 0; pass < 2; pass++) {
            c.strokeStyle = pass ? color : shade(color, -.25);
            c.beginPath(); c.moveTo(pts[0].x, pts[0].y);
            for (let j = 1; j < pts.length - 1; j++) { const xc = (pts[j].x + pts[j + 1].x) / 2, yc = (pts[j].y + pts[j + 1].y) / 2; c.quadraticCurveTo(pts[j].x, pts[j].y, xc, yc); }
            c.lineWidth = st.w * s * (pass ? .8 : 1.1); c.stroke();
          }
          // parlak şerit
          c.strokeStyle = 'rgba(255,230,180,.35)'; c.lineWidth = st.w * s * .22; c.beginPath(); c.moveTo(pts[0].x, pts[0].y);
          for (let j = 1; j < pts.length - 2; j++) { const xc = (pts[j].x + pts[j + 1].x) / 2, yc = (pts[j].y + pts[j + 1].y) / 2; c.quadraticCurveTo(pts[j].x, pts[j].y, xc, yc); }
          c.stroke();
        }
      }
    };
  }

  // ---- yüz
  function face(c, who, x, y, r, o = {}) {
    const p = spec(who); const id = idOf(who); const mood = o.face || 'happy'; const dir = o.dir || 0; // -1..1 bakış
    // baş
    c.fillStyle = p.skin; c.beginPath(); c.ellipse(x, y, r, r * 1.04, 0, 0, TAU); c.fill();
    // kulaklar
    c.beginPath(); c.arc(x - r * .96, y + r * .1, r * .18, 0, TAU); c.arc(x + r * .96, y + r * .1, r * .18, 0, TAU); c.fill();
    // gözler
    const ey = y + r * .05, ex = r * .38, er = r * .17;
    const blink = o.blink ? .12 : 1;
    for (const sx of [-1, 1]) {
      const cx = x + sx * ex + dir * r * .06;
      c.fillStyle = '#fff'; c.beginPath(); c.ellipse(cx, ey, er, er * blink, 0, 0, TAU); c.fill();
      if (blink > .5) {
        c.fillStyle = p.eyes; c.beginPath(); c.arc(cx + dir * er * .35, ey + er * .1, er * .62, 0, TAU); c.fill();
        c.fillStyle = '#111'; c.beginPath(); c.arc(cx + dir * er * .4, ey + er * .12, er * .34, 0, TAU); c.fill();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(cx - er * .22 + dir * er * .2, ey - er * .25, er * .2, 0, TAU); c.fill();
      }
      if (mood === 'wink' && sx === 1) { c.fillStyle = p.skin; c.fillRect(cx - er - 1, ey - er - 1, er * 2 + 2, er * 2 + 2); c.strokeStyle = shade(p.skin, -.45); c.lineWidth = r * .07; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx - er, ey); c.quadraticCurveTo(cx, ey + er * .5, cx + er, ey); c.stroke(); }
    }
    // kaşlar
    c.strokeStyle = shade(p.hair, .1); c.lineWidth = r * .07; c.lineCap = 'round';
    const bu = mood === 'wow' ? -r * .12 : mood === 'sad' ? r * .04 : 0;
    for (const sx of [-1, 1]) { const cx = x + sx * ex; c.beginPath(); c.moveTo(cx - er, ey - er * 1.55 + bu + (mood === 'sad' ? -sx * r * .04 : 0)); c.quadraticCurveTo(cx, ey - er * 1.9 + bu, cx + er, ey - er * 1.55 + bu + (mood === 'sad' ? sx * r * .04 : 0)); c.stroke(); }
    // yanaklar
    c.fillStyle = 'rgba(255,120,120,.35)'; c.beginPath(); c.ellipse(x - r * .6, y + r * .42, r * .16, r * .1, 0, 0, TAU); c.ellipse(x + r * .6, y + r * .42, r * .16, r * .1, 0, 0, TAU); c.fill();
    if (id === 'lina') { c.fillStyle = 'rgba(200,110,60,.45)'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(x + (i % 3 - 1) * r * .13 + (i > 2 ? r * .6 : -r * .6), y + r * .38 + (i % 2) * r * .07, r * .025, 0, TAU); c.fill(); } }
    // burun
    c.strokeStyle = shade(p.skin, -.3); c.lineWidth = r * .05; c.beginPath(); c.moveTo(x, y + r * .25); c.quadraticCurveTo(x + r * .09, y + r * .38, x - r * .03, y + r * .4); c.stroke();
    // ağız
    const my = y + r * .62; c.lineWidth = r * .07; c.strokeStyle = '#b8465a'; c.fillStyle = '#c94a6a';
    if (mood === 'wow' || mood === 'sing') { c.beginPath(); c.ellipse(x, my, r * .18, mood === 'sing' ? r * .26 : r * .2, 0, 0, TAU); c.fill(); c.fillStyle = '#ff9aa8'; c.beginPath(); c.ellipse(x, my + r * .1, r * .1, r * .07, 0, 0, TAU); c.fill(); }
    else if (mood === 'sad') { c.beginPath(); c.moveTo(x - r * .22, my + r * .08); c.quadraticCurveTo(x, my - r * .12, x + r * .22, my + r * .08); c.stroke(); }
    else { c.beginPath(); c.moveTo(x - r * .3, my - r * .06); c.quadraticCurveTo(x, my + r * .3, x + r * .3, my - r * .06); c.closePath(); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x - r * .22, my - r * .03); c.quadraticCurveTo(x, my + r * .06, x + r * .22, my - r * .03); c.closePath(); c.fill(); }
    if (p.beard) { c.fillStyle = 'rgba(43,33,24,.55)'; c.beginPath(); c.moveTo(x - r * .75, y + r * .35); c.quadraticCurveTo(x - r * .6, y + r * 1.05, x, y + r * 1.02); c.quadraticCurveTo(x + r * .6, y + r * 1.05, x + r * .75, y + r * .35); c.quadraticCurveTo(x + r * .5, y + r * .78, x, y + r * .8); c.quadraticCurveTo(x - r * .5, y + r * .78, x - r * .75, y + r * .35); c.fill(); }
    if (p.glasses) { c.strokeStyle = '#1e1a1a'; c.lineWidth = r * .07; c.beginPath(); c.roundRect(x - ex - er * 1.4, ey - er * 1.25, er * 2.8, er * 2.4, r * .12); c.roundRect(x + ex - er * 1.4, ey - er * 1.25, er * 2.8, er * 2.4, r * .12); c.moveTo(x - ex + er * 1.4, ey); c.lineTo(x + ex - er * 1.4, ey); c.stroke(); }
  }

  // saç (ön kısım / fizikli olmayan karakterler)
  function hairFront(c, who, x, y, r, o = {}) {
    const p = spec(who); const id = idOf(who); c.fillStyle = p.hair;
    if (id === 'lina') {
      // kâkül: yandan ayrık, dalgalı
      c.beginPath(); c.moveTo(x - r * 1.02, y + r * .15); c.quadraticCurveTo(x - r * 1.05, y - r * .9, x - r * .1, y - r * 1.06); c.quadraticCurveTo(x + r * .9, y - r * 1.1, x + r * 1.03, y - r * .05);
      c.quadraticCurveTo(x + r * .8, y - r * .2, x + r * .55, y - r * .48); c.quadraticCurveTo(x + r * .2, y - r * .25, x - r * .15, y - r * .55); c.quadraticCurveTo(x - r * .45, y - r * .2, x - r * .68, y - r * .05); c.quadraticCurveTo(x - r * .85, y + r * .15, x - r * 1.02, y + r * .15); c.fill();
      c.fillStyle = 'rgba(255,220,160,.35)'; c.beginPath(); c.moveTo(x - r * .3, y - r * .95); c.quadraticCurveTo(x + r * .1, y - r * 1.02, x + r * .5, y - r * .85); c.quadraticCurveTo(x + r * .2, y - r * .8, x - r * .25, y - r * .78); c.fill();
      accessory(c, o.hairAcc || G.S.hair, x, y, r);
    } else if (p.kind === 'mom' || p.kind === 'girl') {
      // topuz / uzun saç arkası face'ten önce çizilir (hairBack), önde düz kâkül
      c.beginPath(); c.moveTo(x - r * 1.03, y + r * .2); c.quadraticCurveTo(x - r * 1.05, y - r * 1.05, x, y - r * 1.08); c.quadraticCurveTo(x + r * 1.05, y - r * 1.05, x + r * 1.03, y + r * .2); c.quadraticCurveTo(x + r * .9, y - r * .35, x + r * .3, y - r * .5); c.quadraticCurveTo(x - r * .3, y - r * .7, x - r * .8, y - r * .1); c.quadraticCurveTo(x - r * .95, y, x - r * 1.03, y + r * .2); c.fill();
    } else if (p.kind === 'dad') {
      c.beginPath(); c.moveTo(x - r * 1.0, y - r * .05); c.quadraticCurveTo(x - r * 1.02, y - r * 1.02, x, y - r * 1.06); c.quadraticCurveTo(x + r * 1.02, y - r * 1.02, x + r * 1.0, y - r * .05); c.quadraticCurveTo(x + r * .85, y - r * .55, x + r * .4, y - r * .6); c.quadraticCurveTo(x, y - r * .75, x - r * .5, y - r * .6); c.quadraticCurveTo(x - r * .85, y - r * .55, x - r * 1.0, y - r * .05); c.fill();
    } else { // boy: kabarık
      c.beginPath(); c.moveTo(x - r * 1.03, y - r * .05); c.quadraticCurveTo(x - r * 1.1, y - r * 1.15, x - r * .2, y - r * 1.12); c.quadraticCurveTo(x + r * .4, y - r * 1.3, x + r * 1.05, y - r * .6); c.quadraticCurveTo(x + r * 1.02, y - r * .2, x + r * .9, y - r * .35); c.quadraticCurveTo(x + r * .5, y - r * .7, x + r * .1, y - r * .55); c.quadraticCurveTo(x - r * .5, y - r * .45, x - r * .8, y - r * .15); c.quadraticCurveTo(x - r * .95, y, x - r * 1.03, y - r * .05); c.fill();
    }
  }
  function hairBack(c, who, x, y, r) {
    const p = spec(who); const id = idOf(who); c.fillStyle = shade(p.hair, -.15);
    if (p.kind === 'mom' || p.kind === 'girl') { c.beginPath(); c.ellipse(x, y + r * .5, r * 1.15, r * (p.kind === 'girl' ? 1.2 : 1.5), 0, 0, TAU); c.fill(); if (id === 'hacer') { c.fillStyle = p.hair; c.beginPath(); c.arc(x, y - r * .95, r * .45, 0, TAU); c.fill(); } }
    if (id === 'lina') { c.beginPath(); c.ellipse(x, y + r * .3, r * 1.08, r * 1.25, 0, 0, TAU); c.fill(); }
  }
  // saç aksesuarları
  const ACC = {
    none: { name: 'Sade', em: '✨', cost: 0 },
    toka: { name: 'Toka', em: '🎀', cost: 3 },
    cicek: { name: 'Çiçek', em: '🌸', cost: 5 },
    tac: { name: 'Taç', em: '👑', cost: 8 },
    bandana: { name: 'Bandana', em: '🧣', cost: 6 },
    kulaklik: { name: 'Kulaklık', em: '🎧', cost: 10 },
    gunes: { name: 'Güneş gözlüğü', em: '🕶️', cost: 7 },
    yildiz: { name: 'Yıldız tacı', em: '⭐', cost: 15 }
  };
  const OUTFITS = {
    orange: { name: 'Turuncu elbise', color: '#ff7a1a', cost: 0 },
    pembe: { name: 'Pembe elbise', color: '#ff5c8a', cost: 4 },
    mint: { name: 'Mint elbise', color: '#5cd6a9', cost: 4 },
    sea: { name: 'Deniz mavisi', color: '#2e8bc0', cost: 6 },
    mor: { name: 'Lila', color: '#a77cf0', cost: 6 },
    somon: { name: 'Somon tişört', color: '#ff9f80', cost: 8, print: '🍣' },
    piyano: { name: 'Piyano tişört', color: '#1b1b2f', cost: 8, print: '🎹' },
    gece: { name: 'Yıldızlı gece', color: '#0f2a44', cost: 12, print: '⭐' }
  };
  function accessory(c, id, x, y, r) {
    switch (id) {
      case 'toka': c.fillStyle = '#ff5c8a'; c.beginPath(); c.ellipse(x - r * .55, y - r * .78, r * .22, r * .13, -.5, 0, TAU); c.ellipse(x - r * .3, y - r * .9, r * .22, r * .13, .6, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x - r * .42, y - r * .82, r * .07, 0, TAU); c.fill(); break;
      case 'cicek': for (let i = 0; i < 5; i++) { c.fillStyle = '#ffb3c6'; c.beginPath(); c.ellipse(x + r * .75 + Math.cos(i / 5 * TAU) * r * .16, y - r * .72 + Math.sin(i / 5 * TAU) * r * .16, r * .12, r * .08, i / 5 * TAU, 0, TAU); c.fill(); } c.fillStyle = '#ffd166'; c.beginPath(); c.arc(x + r * .75, y - r * .72, r * .09, 0, TAU); c.fill(); break;
      case 'tac': c.fillStyle = '#ffd166'; c.beginPath(); c.moveTo(x - r * .55, y - r * .92); c.lineTo(x - r * .5, y - r * 1.35); c.lineTo(x - r * .25, y - r * 1.1); c.lineTo(x, y - r * 1.45); c.lineTo(x + r * .25, y - r * 1.1); c.lineTo(x + r * .5, y - r * 1.35); c.lineTo(x + r * .55, y - r * .92); c.closePath(); c.fill(); c.fillStyle = '#ff5c8a'; c.beginPath(); c.arc(x, y - r * 1.08, r * .07, 0, TAU); c.fill(); break;
      case 'bandana': c.fillStyle = '#2e8bc0'; c.beginPath(); c.moveTo(x - r * 1.02, y - r * .3); c.quadraticCurveTo(x, y - r * .75, x + r * 1.02, y - r * .3); c.quadraticCurveTo(x, y - r * .5, x - r * 1.02, y - r * .3); c.fill(); c.fillStyle = '#fff'; for (let i = -2; i <= 2; i++) { c.beginPath(); c.arc(x + i * r * .35, y - r * .55 + Math.abs(i) * r * .05, r * .04, 0, TAU); c.fill(); } break;
      case 'kulaklik': c.strokeStyle = '#1b1b2f'; c.lineWidth = r * .1; c.beginPath(); c.arc(x, y - r * .05, r * 1.12, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); c.fillStyle = '#ff5c8a'; for (const sx of [-1, 1]) { c.beginPath(); c.roundRect(x + sx * r * 1.0 - r * .17, y - r * .2, r * .34, r * .5, r * .1); c.fill(); } break;
      case 'gunes': c.fillStyle = '#1b1b2f'; for (const sx of [-1, 1]) { c.beginPath(); c.roundRect(x + sx * r * .38 - r * .3, y - r * .18, r * .6, r * .42, r * .12); c.fill(); } c.fillRect(x - r * .1, y - r * .05, r * .2, r * .06); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(x - r * .5, y - r * .05, r * .08, 0, TAU); c.fill(); break;
      case 'yildiz': c.fillStyle = '#ffd166'; for (let i = -1; i <= 1; i++) G.star(c, x + i * r * .55, y - r * 1.0 - (i === 0 ? r * .15 : 0), r * (i === 0 ? .26 : .18), 0); c.strokeStyle = '#ffd166'; c.lineWidth = r * .06; c.beginPath(); c.arc(x, y - r * .1, r * .98, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); break;
    }
  }

  /* Tam karakter. Orijin: ayakların ortası. s: ölçek (1 => ~200px boy). o: {face, walk(0..1 faz), dir, hair (Lina için makeHair nesnesi), arms:'up'|'wave'|'hold', hairAcc, outfit, vx} */
  function char(c, who, x, y, s, o = {}) {
    const p = spec(who); const id = idOf(who); const kid = p.kind === 'girl' || p.kind === 'boy';
    const hs = kid ? .92 : 1.05; // boy ölçeği
    c.save(); c.translate(x, y); c.scale(s * hs, s * hs);
    const walk = o.walk ?? 0, sw = Math.sin(walk * TAU), sw2 = Math.sin(walk * TAU + Math.PI);
    const R = kid ? 40 : 38, headY = kid ? -150 : -160, bodyTop = headY + R * .95, bodyBot = -34, bw = kid ? 44 : 54;
    const bob = Math.abs(Math.sin(walk * TAU * 2)) * -3 * (o.walk != null ? 1 : 0);
    c.translate(0, bob);
    // gölge
    c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0, -bob + 2, bw * .9, 9, 0, 0, TAU); c.fill();
    // arka saç
    if (!o.hair) hairBack(c, who, 0, headY, R);
    // bacaklar
    const legC = kid && p.kind === 'girl' ? p.skin : (p.kind === 'boy' ? '#3a5f8f' : '#2c3a55');
    c.strokeStyle = legC; c.lineWidth = kid ? 14 : 18; c.lineCap = 'round';
    for (const [sx, sn] of [[-1, sw], [1, sw2]]) { c.beginPath(); c.moveTo(sx * 12, bodyBot); c.lineTo(sx * 12 + sn * 14, -6); c.stroke(); }
    // ayakkabılar
    for (const [sx, sn] of [[-1, sw], [1, sw2]]) { c.fillStyle = id === 'lina' ? '#fff' : (p.kind === 'mom' ? '#c94a6a' : '#2b2118'); c.beginPath(); c.roundRect(sx * 12 + sn * 14 - 13, -10, 26, 12, 6); c.fill(); if (id === 'lina') { c.fillStyle = '#ff7a1a'; c.fillRect(sx * 12 + sn * 14 - 6, -8, 12, 3); } }
    // gövde
    const of = id === 'lina' ? (OUTFITS[o.outfit || G.S.outfit] || OUTFITS.orange) : null;
    const topColor = of ? of.color : p.top;
    c.fillStyle = topColor;
    if (p.kind === 'girl' || p.kind === 'mom') { // elbise
      c.beginPath(); c.moveTo(-bw * .5, bodyTop); c.lineTo(bw * .5, bodyTop); c.lineTo(bw * .95, bodyBot + 2); c.quadraticCurveTo(0, bodyBot + 10, -bw * .95, bodyBot + 2); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.moveTo(-bw * .1, bodyTop); c.lineTo(bw * .12, bodyTop); c.lineTo(bw * .3, bodyBot + 3); c.lineTo(-bw * .05, bodyBot + 5); c.fill();
      if (id === 'lina') { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-bw * .28, bodyTop); c.lineTo(bw * .28, bodyTop); c.lineTo(0, bodyTop + 16); c.closePath(); c.fill(); }
      if (of && of.print) { c.font = '22px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(of.print, 0, (bodyTop + bodyBot) / 2 + 4); }
    } else { // tişört/gömlek + pantolon
      c.beginPath(); c.roundRect(-bw * .5, bodyTop, bw, bodyBot - bodyTop + 6, 14); c.fill();
      c.fillStyle = shade(topColor, -.2); c.fillRect(-bw * .5, bodyBot - 6, bw, 6);
      if (p.number) { c.fillStyle = '#fff'; c.font = '600 18px Fredoka'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p.number, 0, (bodyTop + bodyBot) / 2 + 2); }
    }
    // kollar
    c.strokeStyle = p.skin; c.lineWidth = kid ? 11 : 14;
    const armY = bodyTop + 10, aL = kid ? 48 : 58;
    if (o.arms === 'up') { for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * bw * .5, armY); c.lineTo(sx * bw * .95, armY - aL * .9); c.stroke(); } }
    else if (o.arms === 'wave') { c.beginPath(); c.moveTo(-bw * .5, armY); c.lineTo(-bw * .9, armY + aL * .6); c.stroke(); c.beginPath(); c.moveTo(bw * .5, armY); c.lineTo(bw * .95, armY - aL * .5 + Math.sin(G.T * 8) * 6); c.stroke(); }
    else if (o.arms === 'hold') { for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * bw * .5, armY); c.quadraticCurveTo(sx * bw * .8, armY + aL * .5, sx * bw * .2, armY + aL * .6); c.stroke(); } }
    else { for (const [sx, sn] of [[-1, sw2], [1, sw]]) { c.beginPath(); c.moveTo(sx * bw * .5, armY); c.lineTo(sx * bw * .62 + sn * 12, armY + aL); c.stroke(); } }
    // boyun + yüz
    c.fillStyle = p.skin; c.fillRect(-9, headY + R * .8, 18, 16);
    face(c, who, 0, headY, R, o);
    hairFront(c, who, 0, headY, R, o);
    c.restore();
    // Lina fizikli saç: dünya koordinatında güncellenir/çizilir (kâkülün arkasında kalması için önce yüz çizildi; saç arkaya ayrı çağrı ile)
  }
  // Lina'yı fizikli saçla çiz: saç arkada, sonra karakter
  function lina(c, x, y, s, o = {}) {
    const hs = .92; const R = 40, headY = -150;
    const hx = x, hy = y + headY * s * hs - (o.bobY || 0);
    if (o.hair) { o.hair.update(hx, hy, R * hs, s, o.dt ?? 1 / 60, o.wind || 0, o.vx || 0); o.hair.draw(c, s, P().lina.hair); }
    char(c, 'lina', x, y, s, o);
  }

  // avatar canvas (paneller için)
  function avatar(who, size = 84, o = {}) {
    const id = idOf(who);
    const cv = document.createElement('canvas'); cv.width = cv.height = size * 2; const c = cv.getContext('2d'); c.scale(2, 2);
    const r = size * .3, x = size / 2, y = size * .55;
    c.fillStyle = id === 'lina' ? '#ffe8d4' : '#e6f1fb'; c.beginPath(); c.arc(size / 2, size / 2, size / 2, 0, TAU); c.fill();
    hairBack(c, who, x, y, r); face(c, who, x, y, r, o); hairFront(c, who, x, y, r, o);
    return cv;
  }

  // ---- gökyüzü: t 0 (şafak) → 1 (gece)
  const SKY = [
    [0, ['#ffb88c', '#ff8f6b', '#7a6aa8']],  // şafak
    [.2, ['#8fd3ff', '#5fb4f0', '#c9ecff']],  // sabah
    [.45, ['#4aa3e8', '#7cc4f5', '#e4f4ff']],  // öğle
    [.7, ['#ff9e5e', '#ff6b7a', '#5d4a8e']],  // gün batımı
    [.85, ['#2a3a75', '#1a2452', '#3a2a6e']],  // akşam
    [1, ['#0a1630', '#0f2a44', '#152b4f']]     // gece
  ];
  function mix(a, b, t) { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); const ch = sh => Math.round(((pa >> sh) & 255) + (((pb >> sh) & 255) - ((pa >> sh) & 255)) * t); return `rgb(${ch(16)},${ch(8)},${ch(0)})`; }
  function skyColors(t) {
    t = G.clamp(t, 0, 1); let i = 0; while (i < SKY.length - 2 && SKY[i + 1][0] < t) i++;
    const [t0, a] = SKY[i], [t1, b] = SKY[i + 1]; const k = G.ease(G.clamp((t - t0) / (t1 - t0), 0, 1));
    return [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];
  }
  function sky(c, W, H, t, horizon = H * .55) {
    const [top, mid, low] = skyColors(t);
    const g = c.createLinearGradient(0, 0, 0, horizon); g.addColorStop(0, top); g.addColorStop(.6, mid); g.addColorStop(1, low);
    c.fillStyle = g; c.fillRect(0, 0, W, horizon + 2);
    // güneş / ay
    const sunT = G.clamp(t / .8, 0, 1), sx = W * (.15 + sunT * .7), sy = horizon - Math.sin(sunT * Math.PI) * horizon * .8 + 20;
    if (t < .82) { const gl = c.createRadialGradient(sx, sy, 0, sx, sy, 140); gl.addColorStop(0, 'rgba(255,240,200,.85)'); gl.addColorStop(.25, 'rgba(255,220,150,.35)'); gl.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = gl; c.fillRect(sx - 140, sy - 140, 280, 280); c.fillStyle = t > .6 ? '#ffb347' : '#fff6d5'; c.beginPath(); c.arc(sx, sy, 34, 0, TAU); c.fill(); }
    if (t > .75) { c.globalAlpha = G.clamp((t - .75) / .15, 0, 1); const mx = W * .78, my = horizon * .3; c.fillStyle = '#fff7de'; c.beginPath(); c.arc(mx, my, 30, 0, TAU); c.fill(); c.fillStyle = low; c.beginPath(); c.arc(mx - 14, my - 8, 26, 0, TAU); c.fill();
      // yıldızlar
      c.fillStyle = '#fff'; for (let i = 0; i < 60; i++) { const x = (i * 97.3) % W, y = ((i * 57.7) % (horizon * .8)); const tw = .5 + .5 * Math.sin(G.T * 2 + i); c.globalAlpha = tw * G.clamp((t - .75) / .15, 0, 1); c.beginPath(); c.arc(x, y, 1.2 + (i % 3) * .6, 0, TAU); c.fill(); } c.globalAlpha = 1; }
    return { sx, sy };
  }
  function clouds(c, W, y, t, speed = 12, alpha = .9) {
    c.fillStyle = `rgba(255,255,255,${alpha})`;
    for (let i = 0; i < 6; i++) { const x = ((i * 337 + G.T * speed * (1 + i % 3 * .3)) % (W + 300)) - 150, yy = y + (i % 3) * 28 - 20, sc = .7 + (i % 3) * .3;
      for (const [dx, dy, r] of [[0, 0, 34], [30, -12, 42], [66, 0, 30], [30, 12, 30], [-24, 8, 26]]) { c.beginPath(); c.arc(x + dx * sc, yy + dy * sc, r * sc, 0, TAU); c.fill(); } }
  }
  function sea(c, W, y0, y1, t) {
    const [, , low] = skyColors(t); const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, mix('#2e8bc0', '#0f2a44', G.clamp((t - .6) / .4, 0, 1))); g.addColorStop(1, '#1b5e8f');
    c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0);
    c.fillStyle = 'rgba(255,255,255,.28)';
    for (let i = 0; i < 14; i++) { const y = y0 + 8 + (i * 13.7) % (y1 - y0 - 10); const x = ((i * 211 + G.T * (20 + i * 3)) % (W + 120)) - 60; c.beginPath(); c.ellipse(x, y, 30 + (i % 4) * 10, 2, 0, 0, TAU); c.fill(); }
    // parıltı
    c.fillStyle = 'rgba(255,240,200,.18)'; c.fillRect(0, y0, W, 3);
  }
  // Tuzla siluet: apartmanlar, marina yelkenleri, tersane vinçleri
  // par kaydırıldığında binalar kimliğini korur; signs verilirse bazı çatılara tabela konur
  function skyline(c, W, y, t, color = '#274b73', par = 0, signs = null) {
    const pitch = 132;
    const rnd = (i, n) => { const v = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453; return v - Math.floor(v); };
    const i0 = Math.floor((par - pitch) / pitch), i1 = Math.ceil((par + W + pitch) / pitch);
    const night = t > .65;
    for (let i = i0; i <= i1; i++) {
      const w = 58 + rnd(i, 1) * 56, h = 52 + rnd(i, 2) * 138;
      const x = Math.round(i * pitch - par + (pitch - w) / 2);
      c.fillStyle = color; c.fillRect(x, y - h, w, h);
      if (night) { c.fillStyle = 'rgba(255,220,140,.75)'; for (let r = 0, wy = y - h + 12; wy < y - 14; wy += 17, r++) for (let k = 0, wx = x + 8; wx < x + w - 10; wx += 16, k++) if (rnd(i, 7 + r * 9 + k) > .45) c.fillRect(wx, wy, 7, 9); }
      // çatı tabelası
      if (signs && signs.length && h > 132 && ((i % 3) + 3) % 3 === 1 && !(x + w / 2 > W * .72 && x + w / 2 < W * .95)) {
        const label = signs[(((i / 3) | 0) % signs.length + signs.length) % signs.length];
        const bw = Math.max(w + 40, 132), bh = 34, bx = x + w / 2 - bw / 2, by = y - h - bh - 14;
        c.fillStyle = 'rgba(20,26,48,.92)'; c.beginPath(); c.roundRect(bx, by, bw, bh, 7); c.fill();
        c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(bx + 4, by + 3, bw - 8, 2);
        c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 2; c.beginPath(); c.moveTo(bx + bw * .3, by + bh); c.lineTo(bx + bw * .3, y - h); c.moveTo(bx + bw * .7, by + bh); c.lineTo(bx + bw * .7, y - h); c.stroke();
        let fs = 22; c.font = `600 ${fs}px Fredoka, sans-serif`;
        while (c.measureText(label).width > bw - 18 && fs > 10) { fs -= 1; c.font = `600 ${fs}px Fredoka, sans-serif`; }
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.shadowColor = '#ff7a1a'; c.shadowBlur = night ? 16 : 6;
        c.fillStyle = '#ffb570'; c.fillText(label, bx + bw / 2, by + bh / 2 + 1);
        c.shadowBlur = 0;
      }
    }
    c.strokeStyle = color; c.lineWidth = 6; c.beginPath(); c.moveTo(W * .82, y); c.lineTo(W * .82, y - 200); c.lineTo(W * .82 + 110, y - 180); c.moveTo(W * .82, y - 200); c.lineTo(W * .82 - 50, y - 180); c.stroke();
  }
  function sailboats(c, W, y, t) {
    for (let i = 0; i < 4; i++) { const x = ((i * 290 + G.T * (8 + i * 2)) % (W + 200)) - 100, bob = Math.sin(G.T * 1.5 + i) * 3; c.save(); c.translate(x, y + bob); c.rotate(Math.sin(G.T * 1.5 + i) * .05);
      c.fillStyle = '#fff'; c.beginPath(); c.moveTo(0, -8); c.lineTo(0, -60); c.lineTo(34, -8); c.closePath(); c.fill(); c.fillStyle = i % 2 ? '#ff7a1a' : '#ff5c8a'; c.beginPath(); c.moveTo(-4, -8); c.lineTo(-4, -46); c.lineTo(-24, -8); c.closePath(); c.fill();
      c.fillStyle = '#2b2118'; c.beginPath(); c.moveTo(-30, -6); c.lineTo(38, -6); c.lineTo(28, 6); c.lineTo(-22, 6); c.closePath(); c.fill(); c.restore(); }
  }
  /* t: sabit faz — konuma bağlanırsa titrer */
  function seagull(c, x, y, t, s = 1) { c.strokeStyle = '#fff'; c.lineWidth = 3 * s; c.lineCap = 'round'; const f = Math.sin(t * 9) * 8 * s; c.beginPath(); c.moveTo(x - 16 * s, y + f); c.quadraticCurveTo(x - 8 * s, y - 6 * s, x, y); c.quadraticCurveTo(x + 8 * s, y - 6 * s, x + 16 * s, y + f); c.stroke(); }

  return { makeHair, face, hairFront, hairBack, char, lina, avatar, sky, skyColors, clouds, sea, skyline, sailboats, seagull, shade, ACC, OUTFITS, accessory };
})();
