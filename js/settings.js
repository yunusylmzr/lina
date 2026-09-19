/* Ayarlar: oyuncular, ses, baştan başla. Haritadaki alt banttan açılır. */
const Settings = (() => {
  const HAIR = ['#2b2118', '#3a2419', '#8b5a2b', '#d9a066', '#ff7a1a', '#a44a2a', '#1e1a1a', '#f0d9a0'];
  const SKIN = ['#ffe3c8', '#ffd9b8', '#f2c9a6', '#e9bf9b', '#c98e63', '#8d5a3b'];
  const TOPS = ['#2e8bc0', '#ff5c8a', '#5cd6a9', '#ffd166', '#a77cf0', '#ff9f80', '#3f9e4a', '#1b1b2f'];
  const KINDS = [['girl', 'Kız'], ['boy', 'Oğlan'], ['mom', 'Kadın'], ['dad', 'Erkek']];
  let draft;

  const newDraft = () => ({ id: 'c' + Date.now().toString(36), name: '', kind: 'boy', hair: HAIR[0], skin: SKIN[2], top: TOPS[0], eyes: '#3a2a20', glasses: false, beard: false });
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
    p.querySelectorAll('[data-o]').forEach(b => b.onclick = () => {
      const k = b.dataset.o; if (k === 'beard' && draft.kind !== 'dad') return G.toast('Sakal sadece “Erkek” için');
      draft[k] = !draft[k]; b.classList.toggle('sel', draft[k]); Audio.sfx('tap'); up();
    });
    p.querySelector('[data-a=x]').onclick = open;
    p.querySelector('[data-a=ok]').onclick = () => {
      if (!draft.name) { Audio.sfx('wrong'); return G.toast('Bir isim yaz'); }
      G.S.people.push(draft); G.save(); G.invalidate(); Audio.sfx('fanfare'); G.toast(`${draft.name} oyuna katıldı!`); open();
    };
  }
  function resetAsk() {
    G.closePanels();
    const p = G.panel(`<h2>Baştan başla</h2>
      <p class="lead">Lina'ya vermeden önce oyunu sıfırlayabilirsin.</p>
      <p><b>İlerlemeyi sil:</b> yıldızlar, bölüm yıldızları, en iyi skorlar, gün sayısı ve mağazadan açılanlar sıfırlanır. Eklediğin karakterler ve çizdiğin resimler kalır.<br><b>Her şeyi sil:</b> karakterler ve resim galerisi de gider.</p>
      <div class="actions"><button class="btn ghost" data-a="x">Vazgeç</button><button class="btn" data-a="p">İlerlemeyi sil</button><button class="btn coral" data-a="f">Her şeyi sil</button></div>`);
    p.querySelector('[data-a=x]').onclick = open;
    const go = full => { G.reset(full); G.invalidate(); G.updateStars(); Audio.sfx('whoosh'); G.toast(full ? 'Oyun tamamen sıfırlandı' : 'İlerleme sıfırlandı'); G.go('title'); };
    p.querySelector('[data-a=p]').onclick = () => go(false);
    p.querySelector('[data-a=f]').onclick = () => go(true);
  }
  function open() {
    G.closePanels();
    const mine = G.S.people || [];
    const p = G.panel(`<h2>Ayarlar</h2>
      <h3>Oyuncular</h3>
      <p>Lina, annesi Hacer ve babası Serkan her zaman oyunda. Yanlarına en fazla üç kişi ekleyebilirsin: arkadaşı, kuzeni, kim istersen. Ekledikleri AVM turunda, suşi siparişlerinde ve aile akşamında çıkar.</p>
      <div class="cast">${['lina', 'serkan', 'hacer'].map(k => `<div class="one" data-k="${k}"><span class="av"></span>${G.PEOPLE[k].name}</div>`).join('')}
        ${mine.map(c => `<div class="one" data-k="${c.id}"><span class="av"></span>${c.name}<button class="x" data-del="${c.id}" aria-label="Çıkar">×</button></div>`).join('')}</div>
      ${mine.length < 3 ? '<div class="actions" style="justify-content:flex-start;margin-top:10px"><button class="btn mint" data-a="add">Karakter ekle</button></div>' : '<p><span class="badge">Üç kişi tamam</span></p>'}
      <h3>Oyun</h3>
      <div class="actions" style="justify-content:flex-start">
        <button class="btn sea" data-a="snd">${G.S.muted ? 'Sesi aç' : 'Sesi kapat'}</button>
        <button class="btn coral" data-a="rst">Baştan başla</button>
      </div>
      <div class="actions"><button class="btn ghost" data-a="ok">Kapat</button></div>`);
    p.querySelectorAll('.one').forEach(el => el.querySelector('.av').replaceWith(Art.avatar(el.dataset.k, 56)));
    p.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { G.S.people = G.S.people.filter(c => c.id !== b.dataset.del); G.save(); G.invalidate(); Audio.sfx('whoosh'); open(); });
    p.querySelector('[data-a=add]')?.addEventListener('click', maker);
    p.querySelector('[data-a=snd]').onclick = () => { Audio.unlock(); Audio.setMuted(!G.S.muted); document.getElementById('btn-mute').classList.toggle('muted', !!G.S.muted); if (!G.S.muted) Audio.sfx('pop'); open(); };
    p.querySelector('[data-a=rst]').onclick = resetAsk;
    p.querySelector('[data-a=ok]').onclick = () => { G.closePanels(); Audio.sfx('tap'); };
  }
  return { open, maker, resetAsk };
})();
