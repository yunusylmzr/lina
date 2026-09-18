/* Çekirdek: durum, kayıt, tuval, döngü, sahneler, giriş, UI yardımcıları */
const G = (() => {
  const SAVE_KEY = 'lina-turuncu-gun-v1';
  const defaults = () => ({
    stars: 0, totalStars: 0,
    best: {},            // mini oyun -> en iyi skor
    done: {},            // mini oyun -> bugün tamamlandı mı (yıldız sayısı)
    hair: 'none', outfit: 'orange',
    owned: ['none', 'orange'],
    gallery: [],         // küçük resim dataURL listesi
    diary: [],
    days: 0,
    muted: false,
    seen: {}             // tanıtım paneli görüldü mü
  });
  let S = defaults();
  const load = () => { try { const j = JSON.parse(localStorage.getItem(SAVE_KEY)); if (j) S = Object.assign(defaults(), j); } catch (e) {} };
  const save = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} };
  load();

  // --- tuval
  const cv = document.getElementById('cv');
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, DPR = 1;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2.5);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const rot = document.getElementById('rotate');
    rot.hidden = !(H > W * 1.15 && scene && scene.landscape);
    if (scene && scene.resize) scene.resize();
  }
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 120));

  // --- sahneler
  const scenes = {};
  let scene = null, sceneName = '';
  let last = performance.now(), T = 0;
  function go(name, arg) {
    if (scene && scene.exit) scene.exit();
    ui.innerHTML = '';
    document.getElementById('paintbar')?.remove();
    sceneName = name; scene = scenes[name];
    T = 0;
    document.getElementById('btn-home').hidden = !scene.showHome;
    document.getElementById('stars').hidden = !scene.showStars;
    updateStars();
    if (scene.enter) scene.enter(arg);
    resize();
  }
  function loop(now) {
    requestAnimationFrame(loop);
    let dt = (now - last) / 1000; last = now;
    if (dt > 0.1) dt = 0.1;
    T += dt;
    if (!scene) return;
    if (scene.update) scene.update(dt, T);
    ctx.save();
    if (scene.draw) scene.draw(ctx, W, H, T);
    ctx.restore();
    // uçan yıldız parçacıkları
    drawFx(ctx, dt);
  }

  // --- giriş (dokunma + fare tek arayüz)
  const pointers = new Map();
  function pt(e) { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, id: e.pointerId }; }
  cv.addEventListener('pointerdown', e => { cv.setPointerCapture?.(e.pointerId); const p = pt(e); pointers.set(p.id, p); Audio.unlock(); scene?.down?.(p, e); });
  cv.addEventListener('pointermove', e => { const p = pt(e); if (pointers.has(p.id)) { const o = pointers.get(p.id); p.dx = p.x - o.x; p.dy = p.y - o.y; p.sx = o.sx ?? o.x; p.sy = o.sy ?? o.y; p.meta = o.meta || (o.meta = {}); pointers.set(p.id, p); } scene?.move?.(p, e); });
  const up = e => { const p = pt(e); const o = pointers.get(p.id); if (o) { p.sx = o.sx ?? o.x; p.sy = o.sy ?? o.y; p.meta = o.meta || {}; } pointers.delete(p.id); scene?.up?.(p, e); };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  window.addEventListener('keydown', e => scene?.key?.(e));
  document.addEventListener('gesturestart', e => e.preventDefault());

  // --- UI
  const ui = document.getElementById('ui');
  function panel(html, cls = '') {
    const d = document.createElement('div'); d.className = 'panel ' + cls; d.innerHTML = html; ui.appendChild(d); return d;
  }
  function closePanels() { ui.querySelectorAll('.panel').forEach(p => p.remove()); }
  let toastT;
  function toast(msg, ms = 1800) {
    const t = document.getElementById('toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, ms);
  }
  function updateStars() { const el = document.querySelector('#stars b'); if (el) el.textContent = S.stars; }

  // yıldız kazanma efekti + puan
  const fx = [];
  function addStars(n, x, y) {
    S.stars += n; S.totalStars += n; save(); updateStars();
    for (let i = 0; i < n * 6; i++) fx.push({ x: x ?? W / 2, y: y ?? H / 2, vx: (Math.random() - .5) * 320, vy: -Math.random() * 380 - 80, life: 1 + Math.random() * .5, r: 6 + Math.random() * 8, hue: 40 + Math.random() * 20 });
  }
  function burst(x, y, color = '#ffd166', n = 14, sp = 260) {
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = Math.random() * sp; fx.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60, life: .5 + Math.random() * .6, r: 3 + Math.random() * 6, color }); }
  }
  function drawFx(c, dt) {
    for (let i = fx.length - 1; i >= 0; i--) {
      const p = fx[i]; p.life -= dt; if (p.life <= 0) { fx.splice(i, 1); continue; }
      p.vy += 700 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      c.globalAlpha = Math.min(1, p.life);
      if (p.color) { c.fillStyle = p.color; c.beginPath(); c.arc(p.x, p.y, p.r * Math.min(1, p.life * 2), 0, 7); c.fill(); }
      else { c.fillStyle = `hsl(${p.hue} 100% 65%)`; star(c, p.x, p.y, p.r, p.life * 4); }
    }
    c.globalAlpha = 1;
  }
  function star(c, x, y, r, rot = 0, pts = 5) {
    c.beginPath();
    for (let i = 0; i < pts * 2; i++) { const a = rot + i * Math.PI / pts - Math.PI / 2, rr = i % 2 ? r * .45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    c.closePath(); c.fill();
  }

  // mini oyun sonucu: yıldız hesabı + panel
  function finish(game, score, starsEarned, lines, extra = {}) {
    const prevDone = S.done[game] || 0;
    const gain = Math.max(0, starsEarned - prevDone); // aynı gün tekrar oynayınca sadece fark
    S.done[game] = Math.max(prevDone, starsEarned);
    S.best[game] = Math.max(S.best[game] || 0, score);
    if (gain > 0) addStars(gain, W / 2, H / 2); else save();
    Audio.sfx(starsEarned >= 3 ? 'fanfare' : starsEarned >= 1 ? 'win' : 'lose');
    const st = [1, 2, 3].map(i => `<span class="${i <= starsEarned ? 'on' : ''}">★</span>`).join('');
    const p = panel(`<div class="result">
      <h2>${extra.title || (starsEarned >= 3 ? 'Muhteşem, Lina!' : starsEarned >= 1 ? 'Aferin Lina!' : 'Bir daha dene!')}</h2>
      <div class="big-stars">${st}</div>
      <div class="score">${score}</div>
      <div class="sub">${extra.unit || 'puan'} · en iyi ${S.best[game]}</div>
      ${lines ? `<p class="lead" style="margin-top:10px">${lines}</p>` : ''}
      ${gain > 0 ? `<span class="badge">+${gain} yıldız kazandın</span>` : ''}
    </div>
    <div class="actions center">
      <button class="btn ghost" data-a="home">Haritaya dön</button>
      <button class="btn" data-a="again">Tekrar oyna</button>
    </div>`);
    p.querySelector('[data-a=home]').onclick = () => go('hub');
    p.querySelector('[data-a=again]').onclick = () => go(game);
    return p;
  }

  // yardımcılar
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const ease = t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  function rrect(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
  function txt(c, s, x, y, size, color = '#fff', align = 'center', font = 'Fredoka', weight = 700) {
    c.font = `${weight} ${size}px ${font}, sans-serif`; c.textAlign = align; c.textBaseline = 'middle'; c.fillStyle = color; c.fillText(s, x, y);
  }
  function txtShadow(c, s, x, y, size, color, shadow = 'rgba(0,0,0,.35)', align = 'center', off = 3) {
    txt(c, s, x, y + off, size, shadow, align); txt(c, s, x, y, size, color, align);
  }

  // Aile
  const PEOPLE = {
    lina: { name: 'Lina', hair: '#ff7a1a', skin: '#ffd9b8', top: '#ff5c8a', eyes: '#3b6b3a', kind: 'girl' },
    serkan: { name: 'Serkan', hair: '#2b2118', skin: '#f2c9a6', top: '#2e8bc0', eyes: '#3a2a20', kind: 'dad', beard: true },
    hacer: { name: 'Hacer', hair: '#3a2419', skin: '#ffd9b8', top: '#8e5cd6', eyes: '#3a2a20', kind: 'mom' },
    yunus: { name: 'Yunus', hair: '#1e1a1a', skin: '#e9bf9b', top: '#5cd6a9', eyes: '#2a2a2a', kind: 'dad', glasses: true },
    betul: { name: 'Betül', hair: '#5a3a26', skin: '#ffe0c4', top: '#ffd166', eyes: '#3a2a20', kind: 'mom' },
    doruk: { name: 'Mehmet Doruk', hair: '#4a3222', skin: '#ffd9b8', top: '#ff9f80', eyes: '#3a2a20', kind: 'boy' }
  };

  return { S, save, load, cv, ctx, get W() { return W; }, get H() { return H; }, get T() { return T; }, get scene() { return sceneName; },
    scenes, go, panel, closePanels, toast, addStars, burst, star, finish, clamp, lerp, rnd, pick, ease, rrect, txt, txtShadow, PEOPLE, resize, updateStars, pointers,
    start() { resize(); requestAnimationFrame(loop); } };
})();
