/* WebAudio sentez: efektler, piyano notaları, hafif deniz ambiyansı */
const Audio = (() => {
  let ac = null, master = null, amb = null, ambGain = null;
  function unlock() {
    if (document.hidden) return;
    if (ac) { if (ac.state === 'suspended' && !asleep) ac.resume(); return; }
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain(); master.gain.value = G.S.muted ? 0 : 0.9; master.connect(ac.destination);
    startAmbience();
  }
  // sekme arkaplana alınınca sesi tamamen durdur (Android'de sekme açık kalınca çalmaya devam ediyordu)
  let asleep = false;
  function setActive(on) {
    if (!ac) return;
    if (on) { asleep = false; if (!G.S.muted && ac.state === 'suspended') ac.resume(); if (ambOn) ambience(true); }
    else { asleep = true; ambience(false, false); if (ac.state === 'running') ac.suspend(); }
  }
  function setMuted(m) { G.S.muted = m; G.save(); if (master) master.gain.setTargetAtTime(m ? 0 : 0.9, ac.currentTime, .05); }
  function tone(freq, dur = .2, type = 'sine', vol = .3, t0 = 0, slide = 0) {
    if (!ac) return; const t = ac.currentTime + t0;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .02);
  }
  // piyano benzeri nota: birkaç harmonik + hızlı sönüm
  function note(freq, dur = .9, vol = .35, t0 = 0) {
    if (!ac) return; const t = ac.currentTime + t0;
    [[1, 1], [2, .4], [3, .18], [4, .08]].forEach(([h, a]) => {
      const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = freq * h;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol * a, t + .008); g.gain.exponentialRampToValueAtTime(.0005, t + dur * (h === 1 ? 1 : .6));
      o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .05);
    });
  }
  function noise(dur = .15, vol = .2, hp = 1000) {
    if (!ac) return; const t = ac.currentTime;
    const buf = ac.createBuffer(1, ac.sampleRate * dur, ac.sampleRate); const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = ac.createBufferSource(); s.buffer = buf; const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp;
    const g = ac.createGain(); g.gain.value = vol; s.connect(f); f.connect(g); g.connect(master); s.start(t);
  }
  const N = { C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, C6: 1046.5 };
  function sfx(name) {
    if (!ac) return;
    switch (name) {
      case 'tap': tone(600, .08, 'triangle', .18, 0, 200); break;
      case 'pop': tone(420, .12, 'sine', .3, 0, 380); break;
      case 'coin': tone(N.E5, .09, 'square', .12); tone(N.A5, .18, 'square', .12, .07); break;
      case 'jump': tone(300, .22, 'triangle', .22, 0, 420); break;
      case 'hit': noise(.18, .35, 300); tone(140, .25, 'sawtooth', .25, 0, -80); break;
      case 'good': note(N.C5, .4, .3); note(N.E5, .4, .3, .06); break;
      case 'win': [N.C4, N.E4, N.G4, N.C5].forEach((f, i) => note(f, .6, .3, i * .09)); break;
      case 'fanfare': [N.C4, N.E4, N.G4, N.C5, N.E5, N.G5, N.C6].forEach((f, i) => note(f, .8, .28, i * .08)); [N.C5, N.E5, N.G5].forEach(f => note(f, 1.4, .25, .7)); break;
      case 'lose': tone(300, .4, 'triangle', .25, 0, -120); tone(220, .5, 'triangle', .25, .25, -100); break;
      case 'whoosh': noise(.25, .25, 600); break;
      case 'slice': noise(.09, .3, 2500); tone(1200, .06, 'sine', .15, 0, -600); break;
      case 'bell': note(N.A5, 1.2, .3); note(N.E5, 1.2, .18, .02); break;
      case 'tick': tone(900, .04, 'square', .08); break;
      case 'wrong': tone(180, .18, 'square', .18); break;
      case 'star': [N.G5, N.C6].forEach((f, i) => tone(f, .25, 'sine', .25, i * .08)); break;
    }
  }
  // deniz ambiyansı: filtreli gürültü, yavaş dalga LFO
  function startAmbience() {
    const buf = ac.createBuffer(1, ac.sampleRate * 4, ac.sampleRate); const d = buf.getChannelData(0);
    let b = 0; for (let i = 0; i < d.length; i++) { b = (b + (Math.random() * 2 - 1) * .02) * .995; d[i] = b * 4; }
    amb = ac.createBufferSource(); amb.buffer = buf; amb.loop = true;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 500;
    ambGain = ac.createGain(); ambGain.gain.value = 0;
    const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = .11; lg.gain.value = .045; lfo.connect(lg); lg.connect(ambGain.gain);
    amb.connect(f); f.connect(ambGain); ambGain.connect(master); amb.start(); lfo.start();
  }
  let ambOn = false;
  function ambience(on, remember = true) { if (remember) ambOn = on; if (ambGain) ambGain.gain.setTargetAtTime(on ? .06 : 0, ac.currentTime, .8); }
  return { unlock, sfx, note, tone, N, setMuted, setActive, ambience, get asleep() { return asleep; }, get ctx() { return ac; } };
})();
