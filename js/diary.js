/* Günlük: bugünün ilerlemesi + şifreli Gizli Günlük (sırlar) */
const Diary = (() => {
  const ENT = [
    'Bugün babam bana “küçük prensesim” dedi. Baba, ben büyüdüm! Küçük değilim. Prenses kısmı kalabilir.',
    'Annem brokoli yaptı. Yorum yok. Günlüğe bile yazmak istemiyorum.',
    'Kedi istedim. Cevap: “Bakarız.” Bu 47. bakarız. Sayıyorum.',
    'Babam bugün oyunda bana kaybetti ve “tablet bozuk” dedi. Tablet gayet iyi baba.',
    'Anneannemin kurabiyesi > her şey. Bu bilimsel bir gerçek.',
    'Babamla takım olduk ve KAZANDIK. Babam “ben taşıdım” dedi. Ben taşıdım.',
    'Odamı topladım. Annem üç kere kontrol etti. Yatağın altına bakmadı 😌'
  ];
  let stops = [], tab = 'bugun', pin = '', unlocked = false;
  const fmt = ts => new Date(ts).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });

  function head(extra) {
    return `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><h2>Günlük</h2>${extra || ''}</div>
      <div class="tabs"><button class="tab ${tab === 'bugun' ? 'sel' : ''}" data-t="bugun">Bugün</button><button class="tab ${tab === 'sir' ? 'sel' : ''}" data-t="sir">🔒 Sırlar</button></div>`;
  }
  function wire(p) {
    p.querySelectorAll('.tab').forEach(b => b.onclick = () => { tab = b.dataset.t; Audio.sfx('tap'); open(); });
    p.querySelector('[data-a=x]')?.addEventListener('click', () => { G.closePanels(); Audio.sfx('tap'); });
  }
  function bugun() {
    const n = stops.filter(s => G.S.done[s.id]).length;
    const p = G.panel(head() + `<div class="diary">Gün <b>${G.S.days + 1}</b> · ${n}/${stops.length} durak · bugün ★ ${Object.values(G.S.done).reduce((a, b) => a + b, 0)}<br>
      ${stops.map(s => `${G.S.done[s.id] ? '✅' : '⬜️'} ${s.name}${G.S.best[s.id] ? ` <span style="color:#6b7a90">(en iyi ${G.S.best[s.id]})</span>` : ''}`).join('<br>')}
      ${G.S.diary.length ? '<br><br>' + G.S.diary.slice(0, 5).join('<br>') : ''}</div>
      <div class="actions"><button class="btn ghost" data-a="x">Kapat</button></div>`, 'bottom');
    wire(p);
  }
  function lock() {
    pin = '';
    const p = G.panel(head() + `<div class="pinbox">
        <div class="lockem">🔒</div>
        <h3 style="margin:0">Şifreni gir, Lina</h3>
        <div class="dots">${'<i></i>'.repeat(4)}</div>
        <div class="pinpad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map(k => `<button ${k === '' ? 'style="visibility:hidden"' : ''} data-k="${k}">${k}</button>`).join('')}</div>
        <p style="font-size:13px;color:var(--muted);text-align:center">Son başarısız denemeler: Serkan (7 kez) 😏<br>İpucu: her şifre çalışır, yeter ki Lina girsin.</p>
      </div>
      <div class="actions"><button class="btn ghost" data-a="x">Kapat</button></div>`, 'bottom');
    wire(p);
    p.querySelectorAll('.pinpad button').forEach(b => b.onclick = () => {
      const k = b.dataset.k;
      if (k === '⌫') pin = pin.slice(0, -1); else if (pin.length < 4) pin += k;
      Audio.sfx('tick');
      p.querySelectorAll('.dots i').forEach((d, i) => d.classList.toggle('on', i < pin.length));
      if (pin.length === 4) setTimeout(() => {
        if (pin === '1234') G.toast('Baba? Sen misin? 1234 çok kolay. Yine de aç.', 2600);
        Audio.sfx('good'); unlocked = true; open();
      }, 260);
    });
  }
  function secrets() {
    const mine = (G.S.secrets || []).map((e, i) => ({ ...e, mine: 1, i }));
    const all = mine.concat(ENT.map((x, i) => ({ t: Date.now() - (i + 1) * 2 * 86400000, x })));
    const p = G.panel(head(`<span class="badge">📔 ${all.length} sayfa</span>`) + `
      <div class="newpage"><h3>Yeni sayfa ✍️</h3><textarea id="dtx" rows="3" placeholder="Bugün ne oldu, Lina?"></textarea>
        <div class="actions" style="margin-top:6px"><button class="btn mint" data-a="add">Kaydet</button></div></div>
      <div class="entries">${all.map(e => `<div class="entry"><small>${fmt(e.t)}${e.mine ? ` · <b data-del="${e.i}">sil</b>` : ''}</small><p>${e.x.replace(/[<>&]/g, '')}</p></div>`).join('')}</div>
      <div class="logbox"><h3>🕵️ Giriş günlüğü</h3><p>✅ Lina — şimdi<br>❌ Serkan — “1234” (başarısız)<br>❌ Serkan — “lina” (başarısız)<br>❌ Serkan — “0000” (başarısız, ayrıca yaratıcı değil)<br>❌ Serkan — “hacer” (başarısız, anne bilgilendirildi)</p></div>
      <div class="actions"><button class="btn ghost" data-a="x">Kapat</button></div>`, 'bottom');
    wire(p);
    p.querySelector('[data-a=add]').onclick = () => {
      const v = p.querySelector('#dtx').value.trim();
      if (!v) { Audio.sfx('wrong'); return G.toast('Bir şey yaz 😊'); }
      G.S.secrets.unshift({ t: Date.now(), x: v.slice(0, 400) }); G.save(); Audio.sfx('good');
      G.toast('Kaydedildi. Kimse göremez. Baba hariç… şaka, o da göremez.', 2600); open();
    };
    p.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { G.S.secrets.splice(+b.dataset.del, 1); G.save(); Audio.sfx('whoosh'); open(); });
  }
  function open(list) {
    if (list) stops = list;
    G.closePanels();
    if (tab === 'bugun') bugun();
    else if (unlocked) secrets();
    else lock();
  }
  return { open, reset() { unlocked = false; tab = 'bugun'; } };
})();
