/* Açılış: şafak, deniz, Lina ve dalgalanan saçları + karakter ekleme */
G.scenes.title = (() => {
  const HAIR = ['#2b2118', '#3a2419', '#8b5a2b', '#d9a066', '#ff7a1a', '#a44a2a', '#1e1a1a', '#f0d9a0'];
  const SKIN = ['#ffe3c8', '#ffd9b8', '#f2c9a6', '#e9bf9b', '#c98e63', '#8d5a3b'];
  const TOPS = ['#2e8bc0', '#ff5c8a', '#5cd6a9', '#ffd166', '#a77cf0', '#ff9f80', '#3f9e4a', '#1b1b2f'];
  const KINDS = [['girl', 'Kız'], ['boy', 'Oğlan'], ['mom', 'Kadın'], ['dad', 'Erkek']];
  let hair, bird = [], draft;

  function newDraft() { return { id: 'c' + Date.now().toString(36), name: '', kind: 'boy', hair: HAIR[0], skin: SKIN[2], top: TOPS[0], eyes: '#3a2a20', glasses: false, beard: false }; }
  function drawPreview(cv) {
    const c = cv.getContext('2d'); c.setTransform(2, 0, 0, 2, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
    Art.char(c, draft, cv.width / 4, cv.height / 2 - 6, Math.min(.72, cv.height / 2 / 210), { face: 'happy', arms: 'wave' });
  }
  function maker() {
    G.closePanels(); draft = newDraft();
    const p = G.panel(`<h2>Karakter ekle</h2><p>Lina'nın dünyasına katılsın. Adını yaz, görünüşünü seç.</p>
      <div class="maker">
        <div class="prev"><canvas id="pv" width="260" height="380" style="width:130px;height:190px"></canvas></div>
        <div class="fields">
          <div class="field"><label>Adı</label><input type="text" id="nm" maxlength="14" placeholder="örn. Elif" autocomplete="off"></div>
          <div class="field"><label>Kim</label><div class="chips" id="kind">${KINDS.map(([k, n]) => `<button class="chip-sm ${k === 'boy' ? 'sel' : ''}" data-k="${k}">${n}</button>`).join('')}</div></div>
          <div class="field"><label>Saç rengi</label><div class="sws" id="hair">${HAIR.map((h, i) => `<button class="sw2 ${i === 0 ? 'sel' : ''}" data-c="${h}" style="background:${h}"></button>`).join('')}</div></div>
          <div class="field"><label>Ten rengi</label><div class="sws" id="skin">${SKIN.map((h, i) => `<button class="sw2 ${i === 2 ? 'sel' : ''}" data-c="${h}" style="background:${h}"></button>`).join('')}</div></div>
          <div class="field"><label>Kıyafet</label><div class="sws" id="top">${TOPS.map((h, i) => `<button class="sw2 ${i === 0 ? 'sel' : ''}" data-c="${h}" style="background:${h}"></button>`).join('')}</div></div>
          <div class="field"><div class="chips"><button class="chip-sm" data-o="glasses">Gözlük</button><button class="chip-sm" data-o="beard">Sakal</button></div></div>
        </div>
      </div>
      <div class="actions"><button class="btn ghost" data-a="x">Vazgeç</button><button class="btn mint" data-a="ok">Ekle</button></div>`);
    const cv = p.querySelector('#pv'), up = () => drawPreview(cv); up();
    p.querySelector('#nm').oninput = e => { draft.name = e.target.value.trim(); };
    p.querySelectorAll('#kind .chip-sm').forEach(b => b.onclick = () => { draft.kind = b.dataset.k; if (draft.kind !== 'dad') draft.beard = false; p.querySelectorAll('#kind .chip-sm').forEach(x => x.classList.toggle('sel', x === b)); p.querySelector('[data-o=beard]').classList.toggle('sel', draft.beard); Audio.sfx('tap'); up(); });
    for (const key of ['hair', 'skin', 'top']) p.querySelectorAll(`#${key} .sw2`).forEach(b => b.onclick = () => { draft[key] = b.dataset.c; p.querySelectorAll(`#${key} .sw2`).forEach(x => x.classList.toggle('sel', x === b)); Audio.sfx('tap'); up(); });
    p.querySelectorAll('[data-o]').forEach(b => b.onclick = () => { const k = b.dataset.o; if (k === 'beard' && draft.kind !== 'dad') return G.toast('Sakal sadece “Erkek” için');
      draft[k] = !draft[k]; b.classList.toggle('sel', draft[k]); Audio.sfx('tap'); up(); });
    p.querySelector('[data-a=x]').onclick = () => cast();
    p.querySelector('[data-a=ok]').onclick = () => {
      if (!draft.name) { Audio.sfx('wrong'); return G.toast('Bir isim yaz'); }
      G.S.people.push(draft); G.save(); G.invalidate(); Audio.sfx('fanfare'); G.toast(`${draft.name} oyuna katıldı!`); cast();
    };
  }
  function cast() {
    G.closePanels();
    const mine = G.S.people || [];
    const p = G.panel(`<h2>Oyuncular</h2><p>Lina, annesi Hacer ve babası Serkan her zaman oyunda. Yanlarına en fazla üç kişi ekleyebilirsin: arkadaşı, kuzeni, kim istersen.</p>
      <div class="cast" id="c">${['lina', 'serkan', 'hacer'].map(k => `<div class="one" data-k="${k}"><span class="av"></span>${G.PEOPLE[k].name}</div>`).join('')}
        ${mine.map(c => `<div class="one" data-k="${c.id}"><span class="av"></span>${c.name}<button class="x" data-del="${c.id}" aria-label="Çıkar">×</button></div>`).join('')}</div>
      <div class="actions"><button class="btn ghost" data-a="rst">Baştan başla</button>${mine.length < 3 ? '<button class="btn" data-a="add">Karakter ekle</button>' : '<span class="badge">Üç kişi tamam</span>'}<button class="btn coral" data-a="ok">Tamam</button></div>`);
    p.querySelectorAll('.one').forEach(el => el.querySelector('.av').replaceWith(Art.avatar(el.dataset.k, 56)));
    p.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { G.S.people = G.S.people.filter(c => c.id !== b.dataset.del); G.save(); G.invalidate(); Audio.sfx('whoosh'); cast(); });
    p.querySelector('[data-a=add]')?.addEventListener('click', maker);
    p.querySelector('[data-a=rst]').onclick = resetAsk;
    p.querySelector('[data-a=ok]').onclick = () => { G.closePanels(); Audio.sfx('pop'); home(); };
  }
  function resetAsk() {
    G.closePanels();
    const p = G.panel(`<h2>Baştan başla</h2>
      <p class="lead">Lina'ya vermeden önce oyunu sıfırlayabilirsin.</p>
      <p><b>İlerlemeyi sil:</b> yıldızlar, bölüm yıldızları, en iyi skorlar, gün sayısı ve mağazadan açılanlar sıfırlanır. Eklediğin karakterler ve çizdiğin resimler kalır.<br><b>Her şeyi sil:</b> karakterler ve resim galerisi de gider.</p>
      <div class="actions"><button class="btn ghost" data-a="x">Vazgeç</button><button class="btn" data-a="p">İlerlemeyi sil</button><button class="btn coral" data-a="f">Her şeyi sil</button></div>`);
    p.querySelector('[data-a=x]').onclick = () => { Audio.sfx('tap'); cast(); };
    const go = full => { G.reset(full); G.invalidate(); G.updateStars(); Audio.sfx('whoosh'); G.toast(full ? 'Oyun tamamen sıfırlandı' : 'İlerleme sıfırlandı'); G.go('title'); };
    p.querySelector('[data-a=p]').onclick = () => go(false);
    p.querySelector('[data-a=f]').onclick = () => go(true);
  }
  function home() {
    G.closePanels();
    const p = G.panel(`<div style="text-align:center">
      <p class="lead" style="color:#b6c6d8;margin:0">Tuzla, İstanbul</p>
      <h2 style="font-size:clamp(34px,6vw,58px);color:#fff">Lina'nın<br><span style="color:var(--orange)">Turuncu</span> Günü</h2>
      <p style="color:#d9e4f0">Sabah okul yolu, öğleden sonra piyano ve resim, akşam AVM turu ve suşi… Bugün Tuzla'da Lina'nın günü.</p>
      <div class="actions center"><button class="btn big" id="start">${G.S.days > 0 || G.S.totalStars > 0 ? 'Devam et' : 'Güne başla'}</button></div>
      <div class="actions center" style="margin-top:6px"><button class="btn ghost" id="cast">Oyuncular${G.S.people.length ? ` · ${G.S.people.length + 3}` : ''}</button>${G.S.totalStars > 0 || G.S.days > 0 ? '<button class="btn ghost" id="rst">Baştan başla</button>' : ''}</div>
      ${G.S.totalStars > 0 ? `<p style="color:#b6c6d8;font-size:15px;margin:6px 0 0">Toplam ★ ${G.S.totalStars} · ${G.S.days} gün tamamlandı</p>` : ''}
    </div>`, 'dark bottom');
    p.style.width = 'min(520px,calc(100vw - 32px))';
    if (G.W > 700) { p.style.left = 'auto'; p.style.right = '24px'; p.style.transform = 'none'; p.style.bottom = '50%'; p.style.translate = '0 50%'; }
    p.querySelector('#start').onclick = () => { Audio.unlock(); Audio.sfx('pop'); G.go('hub'); };
    p.querySelector('#cast').onclick = () => { Audio.unlock(); Audio.sfx('tap'); cast(); };
    p.querySelector('#rst')?.addEventListener('click', () => { Audio.unlock(); Audio.sfx('tap'); resetAsk(); });
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
