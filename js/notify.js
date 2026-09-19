/* Aileden gelen mesajlar: haritada arada bir tepeden düşen bildirim kartı */
const Notify = (() => {
  const M = [
    ['Mesajlar', 'hacer', 'Yemek hazır 🍲 Tableti bırak, geliyorum.'],
    ['Mesajlar', 'serkan', 'Akşam turnuva var. Yine mi kaybedeceğim 😅'],
    ['Hatırlatıcılar', '⏰', 'Odanı topla (Anne ekledi) (3. hatırlatma)'],
    ['Mesajlar', 'hacer', 'Piyano çalıştın mı? Duyduğuma göre hayır 🎹'],
    ['Serkan Dijital', '▶', 'Yeni şeyler eklendi. Yıldızların duruyor mu? 👀'],
    ['Mesajlar', '👵', 'Kızım kurabiye yaptım, hafta sonu gel 🍪'],
    ['Mesajlar', 'serkan', 'Kurabiyeleri ben almadım. Kanıt yok. 🍪'],
    ['Ekran Süresi', '⏳', 'Bugün 1 sa 47 dk. Anne “yeter” demek üzere.'],
    ['Mesajlar', 'hacer', 'Kedi konusunu akşam konuşuruz dedim. Bakarız.'],
    ['Mesajlar', 'serkan', 'Suşi siparişimi unutma: bol somon 🍣'],
    ['Hatırlatıcılar', '⏰', 'Çorapları sepete at (Anne ekledi) (1. hatırlatma)'],
    ['Mesajlar', 'hacer', 'AVM’de fazla dolanmayın, akşam yemeği erken 🛍️']
  ];
  const GUEST = [
    'Sırrı kimseye söylemedim (Zeynep hariç) 🙊',
    'Yarın parka gidelim mi? ⚽️',
    'Suşi yapmayı bana da öğret 🍣',
    'Bugün çizdiğin resmi çok beğendim 🎨'
  ];
  const SCENES = ['hub', 'store', 'wardrobe'];
  let i = Math.floor(Math.random() * M.length), timer = null, el = null;
  function pick() {
    const g = G.guests();
    if (g.length && Math.random() < .3) return ['Mesajlar', G.pick(g), G.pick(GUEST)];
    return M[i++ % M.length];
  }
  function show(msg) {
    if (!SCENES.includes(G.scene) || document.querySelector('#ui .panel')) return;
    hide();
    const [kind, who, text] = msg || pick();
    const known = G.PEOPLE[who];
    el = document.createElement('div'); el.className = 'notifcard';
    el.innerHTML = `<span class="av"></span><div class="t"><b>${kind}<small>şimdi</small></b><div>${known ? `<b>${known.name}</b> ` : ''}${text}</div></div>`;
    const av = el.querySelector('.av');
    if (known) av.replaceWith(Art.avatar(who, 44));
    else { av.className = 'av em'; av.textContent = who; }
    el.onclick = () => { Audio.sfx('tap'); hide(); };
    document.getElementById('ui').appendChild(el);
    Audio.sfx('coin');
    setTimeout(() => { if (el) { el.classList.add('out'); setTimeout(hide, 400); } }, 6000);
  }
  function hide() { el?.remove(); el = null; }
  function start() {
    stop();
    const next = () => { timer = setTimeout(() => { show(); next(); }, 55000 + Math.random() * 60000); };
    next();
  }
  function stop() { clearTimeout(timer); hide(); }
  // bir bölüm bitince ara sıra
  function maybeAfterGame() { if (Math.random() < .45) setTimeout(() => show(), 1200); }
  return { show, start, stop, hide, maybeAfterGame };
})();
