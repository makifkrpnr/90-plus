(function (root) {
  'use strict';

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

  const missing = new Set();
  const channels = new Map();
  const ambienceBuffers = new Map();
  let ctx = null;
  let unlocked = false;
  let masterMuted = false;
  let ambienceKey = null;
  let ambienceSource = null;
  let ambienceGain = null;
  let ambienceDuckTimer = null;
  let settings = {
    menuMusic: true,
    stadiumAmbience: true,
    sfx: true,
    menuVolume: 0.55,
    stadiumVolume: 0.5,
    sfxVolume: 0.75,
    intensity: 'medium'
  };

  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number(value) || 0));
  const categoryFor = key => String(key).split('.')[0];
  const pathFor = key => manifest[key] ? `${BASE}${manifest[key]}` : null;
  const intensityScale = () => settings.intensity === 'low' ? .72 : settings.intensity === 'high' ? 1 : .9;

  function ensureContext() {
    if (ctx) return ctx;
    const AudioContextCtor = root.AudioContext || root.webkitAudioContext;
    if (!AudioContextCtor) return null;
    ctx = new AudioContextCtor();
    return ctx;
  }

  function ambienceAllowed(key) {
    if (masterMuted) return false;
    if (key === 'ambience.menu') return settings.menuMusic;
    if (key === 'ambience.stadium') return settings.stadiumAmbience;
    return true;
  }

  function ambienceVolumeFor(key) {
    if (key === 'ambience.menu') return clamp(settings.menuVolume);
    return clamp(settings.stadiumVolume);
  }

  async function loadBuffer(key) {
    if (ambienceBuffers.has(key)) return ambienceBuffers.get(key);
    const audioCtx = ensureContext();
    const src = pathFor(key);
    if (!audioCtx || !src || missing.has(key)) return null;
    try {
      const response = await fetch(src, { cache: 'force-cache' });
      if (!response.ok) throw new Error(String(response.status));
      const buffer = await audioCtx.decodeAudioData(await response.arrayBuffer());
      ambienceBuffers.set(key, buffer);
      return buffer;
    } catch (_) {
      missing.add(key);
      return null;
    }
  }

  function stopAmbience() {
    if (ambienceSource) {
      try { ambienceSource.stop(); } catch (_) {}
      try { ambienceSource.disconnect(); } catch (_) {}
    }
    if (ambienceGain) {
      try { ambienceGain.disconnect(); } catch (_) {}
    }
    ambienceSource = null;
    ambienceGain = null;
  }

  async function startAmbience() {
    stopAmbience();
    if (!unlocked || !ambienceKey || !ambienceAllowed(ambienceKey)) return false;
    const audioCtx = ensureContext();
    if (!audioCtx) return false;
    if (audioCtx.state === 'suspended') {
      try { await audioCtx.resume(); } catch (_) {}
    }
    const buffer = await loadBuffer(ambienceKey);
    if (!buffer || ambienceKey === null) return false;
    const source = audioCtx.createBufferSource();
    const gain = audioCtx.createGain();
    source.buffer = buffer;
    source.loop = true;
    gain.gain.value = ambienceVolumeFor(ambienceKey);
    source.connect(gain).connect(audioCtx.destination);
    source.start(0);
    ambienceSource = source;
    ambienceGain = gain;
    return true;
  }

  function unlock() {
    unlocked = true;
    const audioCtx = ensureContext();
    if (audioCtx?.state === 'suspended') audioCtx.resume().catch(() => {});
    startAmbience().catch(() => {});
  }

  function tryAutoplay() {
    unlocked = true;
    const audioCtx = ensureContext();
    if (!audioCtx) return Promise.resolve(false);
    return audioCtx.resume().then(() => startAmbience()).catch(() => {
      unlocked = false;
      return false;
    });
  }

  function oneShotVolume(category, multiplier) {
    const categoryScale = category === 'ui' ? .65 : 1;
    return clamp(settings.sfxVolume * intensityScale() * categoryScale * Number(multiplier ?? 1));
  }

  function makeAudio(key) {
    const src = pathFor(key);
    if (!src || missing.has(key)) return null;
    const audio = new Audio(src);
    audio.preload = 'metadata';
    audio.playsInline = true;
    audio.disableRemotePlayback = true;
    audio.addEventListener('error', () => missing.add(key), { once: true });
    return audio;
  }

  async function play(key, options = {}) {
    if (masterMuted || !settings.sfx || !unlocked || missing.has(key)) return false;
    const audio = makeAudio(key);
    if (!audio) return false;
    const category = categoryFor(key);
    audio.volume = oneShotVolume(category, options.volume);
    audio.playbackRate = Number(options.rate || 1);
    const channel = options.channel || category;
    if (options.replace && channels.get(channel)) {
      try { channels.get(channel).pause(); channels.get(channel).currentTime = 0; } catch (_) {}
    }
    channels.set(channel, audio);
    audio.addEventListener('ended', () => { if (channels.get(channel) === audio) channels.delete(channel); }, { once: true });
    try { await audio.play(); return true; } catch (_) { return false; }
  }

  function playRandom(keys, options = {}) {
    const available = keys.filter(key => manifest[key] && !missing.has(key));
    if (!available.length) return Promise.resolve(false);
    return play(available[Math.floor(Math.random() * available.length)], options);
  }

  function stop(channel) {
    const audio = channels.get(channel);
    if (!audio) return;
    try { audio.pause(); audio.currentTime = 0; } catch (_) {}
    channels.delete(channel);
  }

  function setAmbience(key) {
    if (ambienceKey === key) {
      if (ambienceGain) ambienceGain.gain.value = ambienceAllowed(key) ? ambienceVolumeFor(key) : 0;
      return;
    }
    ambienceKey = key || null;
    startAmbience().catch(() => {});
  }

  function duckAmbience(level = .18, duration = 1800) {
    if (!ambienceGain || !ctx) return;
    const normal = ambienceAllowed(ambienceKey) ? ambienceVolumeFor(ambienceKey) : 0;
    const now = ctx.currentTime;
    ambienceGain.gain.cancelScheduledValues(now);
    ambienceGain.gain.setTargetAtTime(Math.min(normal, clamp(level)), now, .04);
    clearTimeout(ambienceDuckTimer);
    ambienceDuckTimer = setTimeout(() => {
      if (!ambienceGain || !ctx) return;
      ambienceGain.gain.setTargetAtTime(normal, ctx.currentTime, .12);
    }, duration);
  }

  function setMuted(value) {
    masterMuted = Boolean(value);
    if (masterMuted) {
      channels.forEach(audio => { try { audio.pause(); } catch (_) {} });
      channels.clear();
      if (ambienceGain) ambienceGain.gain.value = 0;
    } else {
      if (ambienceGain) ambienceGain.gain.value = ambienceAllowed(ambienceKey) ? ambienceVolumeFor(ambienceKey) : 0;
      else startAmbience().catch(() => {});
    }
  }

  function setIntensity(value) {
    settings.intensity = ['low', 'medium', 'high'].includes(value) ? value : 'medium';
  }

  function configure(next = {}) {
    settings = {
      ...settings,
      ...next,
      menuMusic: next.menuMusic !== undefined ? Boolean(next.menuMusic) : settings.menuMusic,
      stadiumAmbience: next.stadiumAmbience !== undefined ? Boolean(next.stadiumAmbience) : settings.stadiumAmbience,
      sfx: next.sfx !== undefined ? Boolean(next.sfx) : settings.sfx,
      menuVolume: next.menuVolume !== undefined ? clamp(next.menuVolume) : settings.menuVolume,
      stadiumVolume: next.stadiumVolume !== undefined ? clamp(next.stadiumVolume) : settings.stadiumVolume,
      sfxVolume: next.sfxVolume !== undefined ? clamp(next.sfxVolume) : settings.sfxVolume,
      intensity: ['low','medium','high'].includes(next.intensity) ? next.intensity : settings.intensity
    };
    if (ambienceGain) ambienceGain.gain.value = ambienceAllowed(ambienceKey) ? ambienceVolumeFor(ambienceKey) : 0;
    if (!ambienceGain && unlocked) startAmbience().catch(() => {});
  }

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

  root.GameAudio = Object.freeze({ manifest, unlock, tryAutoplay, play, playRandom, stop, setAmbience, duckAmbience, setMuted, setIntensity, configure, has, pathFor });
})(typeof window !== 'undefined' ? window : globalThis);
