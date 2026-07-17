(function (root) {
  'use strict';

  /*
   * 90+ ses motoru — v5.1
   * Tek AudioContext, sabit kalibre seviyeler, basit aç/kapa anahtarları.
   * Kurallar:
   *  - Aynı anda en fazla BİR olay efekti çalar (yenisi eskisini keser).
   *  - Müzik ve ambiyans tek döngü kaynağıdır; asla üst üste binmez.
   *  - Dosya yoksa oyun sessizce devam eder.
   */

  const BASE = 'assets/audio/';
  const manifest = {
    'ambience.menu': 'ambience/menu-loop.mp3', 'ambience.stadium': 'ambience/stadium-loop.mp3',
    'whistle.kickoff': 'whistle/kickoff.mp3', 'whistle.secondHalf': 'whistle/second-half.mp3',
    'whistle.foul': 'whistle/foul.mp3', 'whistle.penalty': 'whistle/penalty.mp3',
    'whistle.halftime': 'whistle/halftime.mp3', 'whistle.fulltime': 'whistle/fulltime.mp3',
    'whistle.freeKick': 'whistle/free-kick.mp3',
    'timer.start': 'timer/start-click.mp3', 'timer.stop': 'timer/stop-click.mp3',
    'timer.tick': 'timer/tick.mp3', 'timer.warning': 'timer/warning.mp3', 'timer.timeout': 'timer/timeout.mp3',
    'ball.playerSelect': 'ball/player-select.mp3', 'ball.pass1': 'ball/pass-01.mp3',
    'ball.pass2': 'ball/pass-02.mp3', 'ball.pass3': 'ball/pass-03.mp3', 'ball.shot': 'ball/shot.mp3',
    'ball.net': 'ball/net.mp3', 'ball.save': 'ball/save.mp3', 'ball.post': 'ball/post.mp3',
    'ball.tackle': 'ball/tackle.mp3', 'ball.throwIn': 'ball/throw-in.mp3', 'ball.goalKick': 'ball/goal-kick.mp3',
    'ball.turnover': 'ball/turnover.mp3', 'ball.corner': 'ball/corner-kick.mp3',
    'crowd.goal': 'crowd/goal-cheer.mp3', 'crowd.winningGoal': 'crowd/winning-goal-cheer.mp3',
    'crowd.bigCheer': 'crowd/big-cheer.mp3', 'crowd.applause': 'crowd/applause.mp3',
    'crowd.boo': 'crowd/boo.mp3', 'crowd.protest': 'crowd/protest.mp3',
    'crowd.disappointment': 'crowd/disappointment.mp3', 'crowd.gasp': 'crowd/gasp.mp3',
    'crowd.tenseHush': 'crowd/tense-hush.mp3', 'crowd.draw': 'crowd/draw-applause.mp3',
    'crowd.defeat': 'crowd/defeat-murmur.mp3', 'crowd.goalHorn': 'crowd/goal-horn.mp3',
    'crowd.goalAfterglow': 'crowd/goal-afterglow.mp3',
    'cards.yellow': 'cards/yellow.mp3', 'cards.red': 'cards/red.mp3',
    'cards.secondYellow': 'cards/second-yellow.mp3', 'cards.none': 'cards/no-card.mp3',
    'setPiece.penaltyRunup': 'set-piece/penalty-run-up.mp3', 'setPiece.freeKickWall': 'set-piece/free-kick-wall.mp3',
    'setPiece.penaltyGoal': 'set-piece/penalty-goal.mp3', 'setPiece.penaltySave': 'set-piece/penalty-save.mp3',
    'setPiece.penaltyMiss': 'set-piece/penalty-miss.mp3',
    'violation.first': 'violation/first-warning.mp3', 'violation.penalty': 'violation/penalty-awarded.mp3',
    'violation.red': 'violation/red-card.mp3', 'violation.forfeit': 'violation/forfeit.mp3',
    'online.roomCreated': 'online/room-created.mp3', 'online.roomJoined': 'online/room-joined.mp3',
    'online.opponentReady': 'online/opponent-ready.mp3', 'online.yourTurn': 'online/your-turn.mp3',
    'online.connectionLost': 'online/connection-lost.mp3', 'online.reconnected': 'online/reconnected.mp3',
    'ui.select': 'ui/select.mp3', 'ui.confirm': 'ui/confirm.mp3', 'ui.back': 'ui/back.mp3', 'ui.invalid': 'ui/invalid.mp3',
    'matchEnd.victory': 'match-end/victory.mp3', 'matchEnd.draw': 'match-end/draw.mp3',
    'matchEnd.defeat': 'match-end/defeat.mp3', 'matchEnd.shootoutVictory': 'match-end/shootout-victory.mp3'
  };

  // Sabit kalibre seviyeler — kullanıcı yalnız aç/kapa yapar.
  const LEVELS = {
    music: 0.32,      // menü müziği (arka plan, asla baskın değil)
    ambience: 0.22,   // stadyum ambiyansı (zemin sesi)
    sfx: 0.6,         // olay efektleri
    ui: 0.3,          // arayüz tıkları
    crowd: 0.4        // tribün katmanı
  };

  const missing = new Set();
  const buffers = new Map();
  const loading = new Map();
  let ctx = null;
  let masterGain = null;
  let unlocked = false;
  let masterMuted = false;
  let settings = { music: true, ambience: true, sfx: true };

  // Döngü kaynakları (music/ambience aynı yuvayı kullanır — üst üste binme imkânsız)
  let loopKey = null;
  let loopSource = null;
  let loopGain = null;
  let loopToken = 0;
  let duckTimer = null;

  // Kanal sistemi: AYNI kanaldaki yeni ses eskisini keser; FARKLI kanallar
  // katmanlanır (top + düdük + tribün aynı anda duyulabilir — ses-sistemi.md).
  const activeChannels = new Map(); // channel -> { source, gain }

  function defaultChannelFor(key) {
    const category = String(key).split('.')[0];
    if (category === 'crowd') return 'crowd';
    if (category === 'whistle' || category === 'violation') return 'whistle';
    if (category === 'ui' || category === 'timer') return 'ui';
    if (category === 'cards') return 'card';
    if (category === 'matchEnd') return 'match-end';
    return 'event';
  }

  const clamp01 = value => Math.max(0, Math.min(1, Number(value) || 0));
  const pathFor = key => manifest[key] ? `${BASE}${manifest[key]}` : null;

  function ensureContext() {
    if (ctx) return ctx;
    const Ctor = root.AudioContext || root.webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    masterGain = ctx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(ctx.destination);
    return ctx;
  }

  async function loadBuffer(key) {
    if (buffers.has(key)) return buffers.get(key);
    if (missing.has(key)) return null;
    if (loading.has(key)) return loading.get(key);
    const audioCtx = ensureContext();
    const src = pathFor(key);
    if (!audioCtx || !src) { missing.add(key); return null; }
    const promise = fetch(src, { cache: 'force-cache' })
      .then(response => { if (!response.ok) throw new Error(String(response.status)); return response.arrayBuffer(); })
      .then(data => audioCtx.decodeAudioData(data))
      .then(buffer => { buffers.set(key, buffer); loading.delete(key); return buffer; })
      .catch(() => { missing.add(key); loading.delete(key); return null; });
    loading.set(key, promise);
    return promise;
  }

  function loopAllowed(key) {
    if (masterMuted || !key) return false;
    if (key === 'ambience.menu') return settings.music;
    if (key === 'ambience.stadium') return settings.ambience;
    return true;
  }

  function loopLevel(key) {
    return key === 'ambience.menu' ? LEVELS.music : LEVELS.ambience;
  }

  function stopLoop() {
    loopToken += 1;
    if (loopSource) { try { loopSource.stop(); } catch (_) {} try { loopSource.disconnect(); } catch (_) {} }
    if (loopGain) { try { loopGain.disconnect(); } catch (_) {} }
    loopSource = null;
    loopGain = null;
  }

  async function startLoop() {
    stopLoop();
    const token = loopToken;
    if (!unlocked || !loopAllowed(loopKey)) return false;
    const audioCtx = ensureContext();
    if (!audioCtx) return false;
    if (audioCtx.state === 'suspended') { try { await audioCtx.resume(); } catch (_) {} }
    const key = loopKey;
    const buffer = await loadBuffer(key);
    // Yükleme sürerken durum değiştiyse (yeni ekran, kapatma) asla çalma
    if (!buffer || token !== loopToken || key !== loopKey || !loopAllowed(key)) return false;
    const source = audioCtx.createBufferSource();
    const gain = audioCtx.createGain();
    source.buffer = buffer;
    source.loop = true;
    gain.gain.value = loopLevel(key);
    source.connect(gain).connect(masterGain);
    source.start(0);
    loopSource = source;
    loopGain = gain;
    return true;
  }

  function setAmbience(key) {
    const next = key || null;
    if (loopKey === next) {
      if (loopGain) loopGain.gain.value = loopAllowed(next) ? loopLevel(next) : 0;
      else if (loopAllowed(next)) startLoop().catch(() => {});
      return;
    }
    loopKey = next;
    startLoop().catch(() => {});
  }

  function stopChannel(channel) {
    const active = activeChannels.get(channel);
    if (!active) return;
    try { active.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.015); } catch (_) {}
    try { active.source.stop(ctx.currentTime + 0.06); } catch (_) {}
    activeChannels.delete(channel);
  }

  function categoryLevel(key) {
    const category = String(key).split('.')[0];
    if (category === 'ui' || category === 'timer') return LEVELS.ui;
    if (category === 'crowd') return LEVELS.crowd;
    return LEVELS.sfx;
  }

  async function play(key, options = {}) {
    if (masterMuted || !settings.sfx || !unlocked || missing.has(key)) return false;
    const audioCtx = ensureContext();
    if (!audioCtx) return false;
    const buffer = await loadBuffer(key);
    if (!buffer || masterMuted || !settings.sfx) return false;
    const channel = options.channel || defaultChannelFor(key);
    stopChannel(channel); // aynı kanaldaki önceki ses her zaman kesilir
    const source = audioCtx.createBufferSource();
    const gain = audioCtx.createGain();
    source.buffer = buffer;
    source.playbackRate.value = Number(options.rate || 1);
    gain.gain.value = clamp01(categoryLevel(key) * Number(options.volume ?? 1));
    source.connect(gain).connect(masterGain);
    source.start(0);
    activeChannels.set(channel, { source, gain });
    source.onended = () => { if (activeChannels.get(channel)?.source === source) activeChannels.delete(channel); };
    return true;
  }

  function playRandom(keys, options = {}) {
    const available = keys.filter(key => manifest[key] && !missing.has(key));
    if (!available.length) return Promise.resolve(false);
    return play(available[Math.floor(Math.random() * available.length)], options);
  }

  function duckAmbience(level = 0.08, duration = 1800) {
    if (!loopGain || !ctx) return;
    const normal = loopAllowed(loopKey) ? loopLevel(loopKey) : 0;
    const now = ctx.currentTime;
    loopGain.gain.cancelScheduledValues(now);
    loopGain.gain.setTargetAtTime(Math.min(normal, clamp01(level)), now, 0.04);
    clearTimeout(duckTimer);
    duckTimer = setTimeout(() => {
      if (!loopGain || !ctx) return;
      loopGain.gain.setTargetAtTime(normal, ctx.currentTime, 0.2);
    }, duration);
  }

  function unlock() {
    unlocked = true;
    const audioCtx = ensureContext();
    if (audioCtx?.state === 'suspended') audioCtx.resume().catch(() => {});
    if (!loopSource) startLoop().catch(() => {});
  }

  function tryAutoplay() {
    unlocked = true;
    const audioCtx = ensureContext();
    if (!audioCtx) return Promise.resolve(false);
    return audioCtx.resume().then(() => startLoop()).catch(() => { unlocked = false; return false; });
  }

  function setMuted(value) {
    masterMuted = Boolean(value);
    if (!masterGain) return void (masterMuted || startLoop().catch(() => {}));
    masterGain.gain.value = masterMuted ? 0 : 1;
    if (masterMuted) {
      activeChannels.forEach((_, channel) => stopChannel(channel));
    } else if (!loopSource) {
      startLoop().catch(() => {});
    }
  }

  function configure(next = {}) {
    settings = {
      music: next.music !== undefined ? Boolean(next.music) : settings.music,
      ambience: next.ambience !== undefined ? Boolean(next.ambience) : settings.ambience,
      sfx: next.sfx !== undefined ? Boolean(next.sfx) : settings.sfx
    };
    if (loopGain) loopGain.gain.value = loopAllowed(loopKey) ? loopLevel(loopKey) : 0;
    else if (unlocked && loopAllowed(loopKey)) startLoop().catch(() => {});
  }

  function stop(channel) { stopChannel(channel); }
  function has(key) { return Boolean(manifest[key]) && !missing.has(key); }

  try {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = 'none';
      ['play','pause','seekbackward','seekforward','seekto','previoustrack','nexttrack'].forEach(action => {
        try { navigator.mediaSession.setActionHandler(action, null); } catch (_) {}
      });
    }
  } catch (_) {}

  root.GameAudio = Object.freeze({ manifest, unlock, tryAutoplay, play, playRandom, stop, setAmbience, duckAmbience, setMuted, configure, has, pathFor });
})(typeof window !== 'undefined' ? window : globalThis);
