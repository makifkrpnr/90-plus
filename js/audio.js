(function (root) {
  'use strict';

  const BASE = 'assets/audio/';
  const manifest = {
    // Ambiyans (kullanıcı sonradan ekleyebilir)
    'ambience.menu': 'ambience/menu-loop.mp3',
    'ambience.stadium': 'ambience/stadium-loop.mp3',

    // Hakem düdükleri
    'whistle.kickoff': 'whistle/kickoff.mp3',
    'whistle.secondHalf': 'whistle/second-half.mp3',
    'whistle.foul': 'whistle/foul.mp3',
    'whistle.penalty': 'whistle/penalty.mp3',
    'whistle.halftime': 'whistle/halftime.mp3',
    'whistle.fulltime': 'whistle/fulltime.mp3',
    'whistle.freeKick': 'whistle/free-kick.mp3',

    // Kronometre
    'timer.start': 'timer/start-click.mp3',
    'timer.stop': 'timer/stop-click.mp3',
    'timer.tick': 'timer/tick.mp3',
    'timer.warning': 'timer/warning.mp3',
    'timer.timeout': 'timer/timeout.mp3',

    // Top ve saha
    'ball.playerSelect': 'ball/player-select.mp3',
    'ball.pass1': 'ball/pass-01.mp3',
    'ball.pass2': 'ball/pass-02.mp3',
    'ball.pass3': 'ball/pass-03.mp3',
    'ball.shot': 'ball/shot.mp3',
    'ball.net': 'ball/net.mp3',
    'ball.save': 'ball/save.mp3',
    'ball.post': 'ball/post.mp3',
    'ball.tackle': 'ball/tackle.mp3',
    'ball.throwIn': 'ball/throw-in.mp3',
    'ball.goalKick': 'ball/goal-kick.mp3',
    'ball.turnover': 'ball/turnover.mp3',
    'ball.corner': 'ball/corner-kick.mp3',

    // Tribün
    'crowd.goal': 'crowd/goal-cheer.mp3',
    'crowd.winningGoal': 'crowd/winning-goal-cheer.mp3',
    'crowd.bigCheer': 'crowd/big-cheer.mp3',
    'crowd.applause': 'crowd/applause.mp3',
    'crowd.boo': 'crowd/boo.mp3',
    'crowd.protest': 'crowd/protest.mp3',
    'crowd.disappointment': 'crowd/disappointment.mp3',
    'crowd.gasp': 'crowd/gasp.mp3',
    'crowd.tenseHush': 'crowd/tense-hush.mp3',
    'crowd.draw': 'crowd/draw-applause.mp3',
    'crowd.defeat': 'crowd/defeat-murmur.mp3',
    'crowd.goalHorn': 'crowd/goal-horn.mp3',
    'crowd.goalAfterglow': 'crowd/goal-afterglow.mp3',

    // Kartlar
    'cards.yellow': 'cards/yellow.mp3',
    'cards.red': 'cards/red.mp3',
    'cards.secondYellow': 'cards/second-yellow.mp3',
    'cards.none': 'cards/no-card.mp3',

    // Duran toplar
    'setPiece.penaltyRunup': 'set-piece/penalty-run-up.mp3',
    'setPiece.freeKickWall': 'set-piece/free-kick-wall.mp3',
    'setPiece.penaltyGoal': 'set-piece/penalty-goal.mp3',
    'setPiece.penaltySave': 'set-piece/penalty-save.mp3',
    'setPiece.penaltyMiss': 'set-piece/penalty-miss.mp3',

    // İhlaller
    'violation.first': 'violation/first-warning.mp3',
    'violation.penalty': 'violation/penalty-awarded.mp3',
    'violation.red': 'violation/red-card.mp3',
    'violation.forfeit': 'violation/forfeit.mp3',

    // Online
    'online.roomCreated': 'online/room-created.mp3',
    'online.roomJoined': 'online/room-joined.mp3',
    'online.opponentReady': 'online/opponent-ready.mp3',
    'online.yourTurn': 'online/your-turn.mp3',
    'online.connectionLost': 'online/connection-lost.mp3',
    'online.reconnected': 'online/reconnected.mp3',

    // Arayüz
    'ui.select': 'ui/select.mp3',
    'ui.confirm': 'ui/confirm.mp3',
    'ui.back': 'ui/back.mp3',
    'ui.invalid': 'ui/invalid.mp3',

    // Maç sonu
    'matchEnd.victory': 'match-end/victory.mp3',
    'matchEnd.draw': 'match-end/draw.mp3',
    'matchEnd.defeat': 'match-end/defeat.mp3',
    'matchEnd.shootoutVictory': 'match-end/shootout-victory.mp3'
  };

  const channels = new Map();
  const missing = new Set();
  let muted = false;
  let intensity = 'medium';
  let ambienceKey = null;
  let ambience = null;
  let unlocked = false;

  function volume(category, multiplier = 1) {
    const base = intensity === 'low' ? 0.35 : intensity === 'high' ? 0.92 : 0.65;
    const categoryScale = category === 'ambience' ? 0.42 : category === 'ui' ? 0.55 : 1;
    return Math.max(0, Math.min(1, base * categoryScale * multiplier));
  }

  function categoryFor(key) {
    return String(key).split('.')[0];
  }

  function pathFor(key) {
    return manifest[key] ? `${BASE}${manifest[key]}` : null;
  }

  function makeAudio(key, loop = false) {
    const src = pathFor(key);
    if (!src || missing.has(key)) return null;
    const audio = new Audio(src);
    audio.preload = loop ? 'auto' : 'metadata';
    audio.loop = loop;
    audio.playsInline = true;
    audio.addEventListener('error', () => missing.add(key), { once: true });
    return audio;
  }

  function unlock() {
    unlocked = true;
    if (ambience && !muted) ambience.play().catch(() => {});
  }

  async function play(key, options = {}) {
    if (muted || !unlocked || missing.has(key)) return false;
    const src = pathFor(key);
    if (!src) return false;
    const category = categoryFor(key);
    const audio = makeAudio(key, false);
    if (!audio) return false;
    audio.volume = volume(category, Number(options.volume ?? 1));
    audio.playbackRate = Number(options.rate || 1);
    const channel = options.channel || category;
    if (options.replace && channels.get(channel)) {
      try { channels.get(channel).pause(); } catch (_) {}
    }
    channels.set(channel, audio);
    audio.addEventListener('ended', () => {
      if (channels.get(channel) === audio) channels.delete(channel);
    }, { once: true });
    try {
      await audio.play();
      return true;
    } catch (_) {
      return false;
    }
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
    if (ambienceKey === key) return;
    if (ambience) {
      try { ambience.pause(); ambience.currentTime = 0; } catch (_) {}
    }
    ambienceKey = key;
    ambience = key ? makeAudio(key, true) : null;
    if (!ambience) return;
    ambience.volume = volume('ambience');
    if (!muted && unlocked) ambience.play().catch(() => {});
  }

  function duckAmbience(level = 0.18, duration = 1800) {
    if (!ambience) return;
    const normal = volume('ambience');
    ambience.volume = Math.min(normal, level);
    clearTimeout(ambience._duckTimer);
    ambience._duckTimer = setTimeout(() => {
      if (ambience) ambience.volume = normal;
    }, duration);
  }

  function setMuted(value) {
    muted = Boolean(value);
    if (muted) {
      channels.forEach(audio => { try { audio.pause(); } catch (_) {} });
      channels.clear();
      if (ambience) ambience.pause();
    } else if (ambience && unlocked) {
      ambience.volume = volume('ambience');
      ambience.play().catch(() => {});
    }
  }

  function setIntensity(value) {
    intensity = ['low', 'medium', 'high'].includes(value) ? value : 'medium';
    if (ambience) ambience.volume = volume('ambience');
  }

  function has(key) {
    return Boolean(manifest[key]) && !missing.has(key);
  }

  root.GameAudio = Object.freeze({
    manifest,
    unlock,
    play,
    playRandom,
    stop,
    setAmbience,
    duckAmbience,
    setMuted,
    setIntensity,
    has,
    pathFor
  });
})(typeof window !== 'undefined' ? window : globalThis);
