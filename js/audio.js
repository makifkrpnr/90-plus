(function (root) {
  'use strict';
  const BASE = 'assets/audio/';
  const manifest = {
    'ambience.menu':'ambience/menu-loop.mp3','ambience.stadium':'ambience/stadium-loop.mp3',
    'whistle.kickoff':'whistle/kickoff.mp3','whistle.secondHalf':'whistle/second-half.mp3','whistle.foul':'whistle/foul.mp3','whistle.penalty':'whistle/penalty.mp3','whistle.halftime':'whistle/halftime.mp3','whistle.fulltime':'whistle/fulltime.mp3','whistle.freeKick':'whistle/free-kick.mp3',
    'timer.start':'timer/start-click.mp3','timer.stop':'timer/stop-click.mp3','timer.tick':'timer/tick.mp3','timer.warning':'timer/warning.mp3','timer.timeout':'timer/timeout.mp3',
    'ball.playerSelect':'ball/player-select.mp3','ball.pass1':'ball/pass-01.mp3','ball.pass2':'ball/pass-02.mp3','ball.pass3':'ball/pass-03.mp3','ball.shot':'ball/shot.mp3','ball.net':'ball/net.mp3','ball.save':'ball/save.mp3','ball.post':'ball/post.mp3','ball.tackle':'ball/tackle.mp3','ball.throwIn':'ball/throw-in.mp3','ball.goalKick':'ball/goal-kick.mp3','ball.turnover':'ball/turnover.mp3','ball.corner':'ball/corner-kick.mp3',
    'crowd.goal':'crowd/goal-cheer.mp3','crowd.winningGoal':'crowd/winning-goal-cheer.mp3','crowd.bigCheer':'crowd/big-cheer.mp3','crowd.applause':'crowd/applause.mp3','crowd.boo':'crowd/boo.mp3','crowd.protest':'crowd/protest.mp3','crowd.disappointment':'crowd/disappointment.mp3','crowd.gasp':'crowd/gasp.mp3','crowd.tenseHush':'crowd/tense-hush.mp3','crowd.draw':'crowd/draw-applause.mp3','crowd.defeat':'crowd/defeat-murmur.mp3','crowd.goalHorn':'crowd/goal-horn.mp3','crowd.goalAfterglow':'crowd/goal-afterglow.mp3',
    'cards.yellow':'cards/yellow.mp3','cards.red':'cards/red.mp3','cards.secondYellow':'cards/second-yellow.mp3','cards.none':'cards/no-card.mp3',
    'setPiece.penaltyRunup':'set-piece/penalty-run-up.mp3','setPiece.freeKickWall':'set-piece/free-kick-wall.mp3','setPiece.penaltyGoal':'set-piece/penalty-goal.mp3','setPiece.penaltySave':'set-piece/penalty-save.mp3','setPiece.penaltyMiss':'set-piece/penalty-miss.mp3',
    'violation.first':'violation/first-warning.mp3','violation.penalty':'violation/penalty-awarded.mp3','violation.red':'violation/red-card.mp3','violation.forfeit':'violation/forfeit.mp3',
    'online.roomCreated':'online/room-created.mp3','online.roomJoined':'online/room-joined.mp3','online.opponentReady':'online/opponent-ready.mp3','online.yourTurn':'online/your-turn.mp3','online.connectionLost':'online/connection-lost.mp3','online.reconnected':'online/reconnected.mp3',
    'ui.select':'ui/select.mp3','ui.confirm':'ui/confirm.mp3','ui.back':'ui/back.mp3','ui.invalid':'ui/invalid.mp3',
    'matchEnd.victory':'match-end/victory.mp3','matchEnd.draw':'match-end/draw.mp3','matchEnd.defeat':'match-end/defeat.mp3','matchEnd.shootoutVictory':'match-end/shootout-victory.mp3'
  };

  const missing = new Set();
  const oneShots = new Map();
  const buffers = new Map();
  let ctx = null, unlocked = false, masterMuted = false;
  let ambienceKey = null, ambienceSource = null, ambienceGain = null, restoreTimer = null;
  let settings = { menuMusic:true, stadiumAmbience:true, eventSounds:true };
  let lastEventAt = 0;

  const pathFor = key => manifest[key] ? BASE + manifest[key] : null;
  const ensureContext = () => {
    if (ctx) return ctx;
    const Ctor = root.AudioContext || root.webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor({ latencyHint:'interactive' });
    return ctx;
  };
  const ambienceAllowed = key => !masterMuted && ((key === 'ambience.menu' && settings.menuMusic) || (key === 'ambience.stadium' && settings.stadiumAmbience));

  async function loadBuffer(key) {
    if (buffers.has(key)) return buffers.get(key);
    if (missing.has(key)) return null;
    const audioCtx = ensureContext(), src = pathFor(key);
    if (!audioCtx || !src) return null;
    try {
      const response = await fetch(src, { cache:'force-cache' });
      if (!response.ok) throw new Error(String(response.status));
      const buffer = await audioCtx.decodeAudioData(await response.arrayBuffer());
      buffers.set(key, buffer);
      return buffer;
    } catch (_) { missing.add(key); return null; }
  }

  function stopAmbience() {
    try { ambienceSource?.stop(); } catch (_) {}
    try { ambienceSource?.disconnect(); ambienceGain?.disconnect(); } catch (_) {}
    ambienceSource = null; ambienceGain = null;
  }

  async function startAmbience() {
    stopAmbience();
    if (!unlocked || !ambienceKey || !ambienceAllowed(ambienceKey)) return false;
    const audioCtx = ensureContext();
    if (!audioCtx) return false;
    try { if (audioCtx.state === 'suspended') await audioCtx.resume(); } catch (_) {}
    const buffer = await loadBuffer(ambienceKey);
    if (!buffer || !ambienceAllowed(ambienceKey)) return false;
    const source = audioCtx.createBufferSource();
    const gain = audioCtx.createGain();
    source.buffer = buffer; source.loop = true; gain.gain.value = ambienceKey === 'ambience.menu' ? .22 : .18;
    source.connect(gain).connect(audioCtx.destination); source.start();
    ambienceSource = source; ambienceGain = gain;
    return true;
  }

  function unlock() {
    unlocked = true;
    const audioCtx = ensureContext();
    if (audioCtx?.state === 'suspended') audioCtx.resume().catch(()=>{});
    startAmbience().catch(()=>{});
  }
  function tryAutoplay() { unlocked = true; return startAmbience().catch(()=>false); }

  function makeAudio(key) {
    const src = pathFor(key);
    if (!src || missing.has(key)) return null;
    const audio = new Audio(src);
    audio.preload = 'metadata'; audio.playsInline = true; audio.disableRemotePlayback = true;
    audio.addEventListener('error', () => missing.add(key), { once:true });
    return audio;
  }

  function stop(channel='event') {
    const audio = oneShots.get(channel);
    if (!audio) return;
    try { audio.pause(); audio.currentTime = 0; } catch (_) {}
    oneShots.delete(channel);
  }

  async function play(key, options={}) {
    if (masterMuted || !unlocked || missing.has(key)) return false;
    const category = String(key).split('.')[0];
    if (category !== 'ui' && !settings.eventSounds) return false;
    const channel = category === 'ui' ? 'ui' : 'event';
    if (channel === 'event') {
      const now = performance.now();
      if (!options.force && now - lastEventAt < 180) return false;
      lastEventAt = now;
    }
    if (options.replace !== false || channel === 'event') stop(channel);
    if (channel === 'event') duckAmbience(.08, Math.max(900, Number(options.duckMs) || 1700));
    const audio = makeAudio(key); if (!audio) return false;
    audio.volume = category === 'ui' ? .32 : .68;
    oneShots.set(channel, audio);
    audio.addEventListener('ended', () => { if (oneShots.get(channel) === audio) oneShots.delete(channel); }, { once:true });
    try { await audio.play(); return true; } catch (_) { return false; }
  }

  async function playFirst(keys, options={}) {
    for (const key of keys || []) {
      if (!manifest[key] || missing.has(key)) continue;
      const ok = await play(key, options);
      if (ok) return true;
    }
    return false;
  }
  function playRandom(keys, options={}) {
    const usable=(keys||[]).filter(key=>manifest[key]&&!missing.has(key));
    return usable.length ? play(usable[Math.floor(Math.random()*usable.length)], options) : Promise.resolve(false);
  }

  function setAmbience(key) {
    ambienceKey = key || null;
    startAmbience().catch(()=>{});
  }
  function duckAmbience(_level=.08, duration=1800) {
    if (!ambienceGain || !ctx) return;
    const normal = ambienceKey === 'ambience.menu' ? .22 : .18;
    const now = ctx.currentTime;
    ambienceGain.gain.cancelScheduledValues(now); ambienceGain.gain.setTargetAtTime(.035, now, .05);
    clearTimeout(restoreTimer); restoreTimer=setTimeout(()=>{ if(ambienceGain&&ctx) ambienceGain.gain.setTargetAtTime(ambienceAllowed(ambienceKey)?normal:0,ctx.currentTime,.18); }, duration);
  }
  function setMuted(value) {
    masterMuted=Boolean(value);
    if(masterMuted){ oneShots.forEach((_,key)=>stop(key)); if(ambienceGain) ambienceGain.gain.value=0; }
    else startAmbience().catch(()=>{});
  }
  function configure(next={}) {
    settings={
      menuMusic: next.menuMusic !== undefined ? Boolean(next.menuMusic) : settings.menuMusic,
      stadiumAmbience: next.stadiumAmbience !== undefined ? Boolean(next.stadiumAmbience) : settings.stadiumAmbience,
      eventSounds: next.eventSounds !== undefined ? Boolean(next.eventSounds) : (next.sfx !== undefined ? Boolean(next.sfx) : settings.eventSounds)
    };
    if (!ambienceAllowed(ambienceKey)) stopAmbience(); else startAmbience().catch(()=>{});
  }
  function stopAll() { [...oneShots.keys()].forEach(stop); stopAmbience(); }
  function has(key){ return Boolean(manifest[key])&&!missing.has(key); }
  function setIntensity() {}

  try {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata=null; navigator.mediaSession.playbackState='none';
      ['play','pause','seekbackward','seekforward','seekto','previoustrack','nexttrack'].forEach(action=>{ try{navigator.mediaSession.setActionHandler(action,null);}catch(_){}});
    }
  } catch (_) {}

  root.GameAudio=Object.freeze({manifest,unlock,tryAutoplay,play,playFirst,playRandom,stop,stopAll,setAmbience,duckAmbience,setMuted,setIntensity,configure,has,pathFor});
})(typeof window !== 'undefined' ? window : globalThis);
