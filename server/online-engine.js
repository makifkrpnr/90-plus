'use strict';

const Core = require('../js/core.js');

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const randomItem = items => items[Math.floor(Math.random() * items.length)];

function makeRuntimeTeam(team) {
  return {
    name: team.name,
    lineup: team.lineup.map(player => ({
      ...player,
      yellowCards: 0,
      red: false,
      injured: false
    })),
    corners: 0,
    timeouts: 0
  };
}

function availableOutfield(match, side) {
  return match.teams[side].lineup.filter(player => player.slot !== 'GK' && !player.red && !player.injured);
}

function getPlayer(match, side, playerId) {
  return match.teams[side].lineup.find(player => player.id === playerId) || null;
}

function currentActor(match) {
  return getPlayer(match, match.context.owner, match.activePlayerId[match.context.owner]);
}

function pickRestartPlayer(match, side, digit = Math.floor(Math.random() * 10)) {
  const candidates = availableOutfield(match, side);
  const chosen = Core.chooseByModulo(candidates, digit) || match.teams[side].lineup.find(player => player.slot === 'GK');
  match.activePlayerId[side] = chosen?.id || null;
  return chosen || null;
}

function mapActivePlayerFromDigit(match, digit) {
  if (match.context.type !== 'main') return currentActor(match);
  const side = match.context.owner;
  const chosen = Core.chooseByModulo(availableOutfield(match, side), digit);
  if (chosen) match.activePlayerId[side] = chosen.id;
  return chosen || null;
}

function eventMinute(match) {
  if (match.phase === 'shootout') return 'P';
  const elapsed = match.phase === 'extra'
    ? match.periodElapsedMs + match.periodIndex * match.periodDurationsMs[0]
    : match.totalElapsedMs;
  return Core.matchMinute(elapsed / 1000, match.regulationSeconds, match.phase === 'extra' ? 'extra' : 'regulation');
}

function addEvent(match, text, important = false) {
  match.events.push({ minute: eventMinute(match), text, important, timestamp: Date.now() });
  if (match.events.length > 120) match.events.shift();
}

function resetRoll(match, owner, context, now) {
  match.activeSide = owner;
  match.context = { ...context, owner };
  match.rollElapsedMs = 0;
  match.turnElapsedMs = 0;
  match.resolving = false;
  match.running = true;
  match.paused = false;
  match.transition = null;
  match.overlay = null;
  match.lastTickAt = now;
  if (context.type !== 'main' || !match.activePlayerId[owner]) pickRestartPlayer(match, owner);
}

function transitionTo(match, owner, context, overlay, now) {
  match.running = false;
  match.resolving = true;
  match.transition = { owner, context };
  const duration = Math.max(150, Number(overlay?.duration) || 900);
  match.overlay = overlay ? {
    id: `${now}-${Math.random().toString(36).slice(2, 7)}`,
    title: overlay.title || '',
    subtitle: overlay.subtitle || '',
    tone: overlay.tone || 'red',
    kicker: overlay.kicker || '',
    until: now + duration
  } : { id: `${now}`, title: '', subtitle: '', tone: 'navy', kicker: '', until: now };
  match.lastTickAt = now;
}

function finishMatch(match, winnerSide) {
  match.running = false;
  match.paused = true;
  match.resolving = false;
  match.phase = 'finished';
  match.winnerSide = winnerSide;
  match.transition = null;
  match.overlay = null;
}

function createMatch(teams, settings, now = Date.now()) {
  const totalSeconds = settings.durationMinutes * 60;
  const match = {
    version: 2,
    mode: 'friend',
    teams: teams.map(makeRuntimeTeam),
    settings: { ...settings },
    scores: [0, 0],
    activeSide: 0,
    activePlayerId: [null, null],
    context: { type: 'main', owner: 0 },
    pendingFoul: null,
    phase: 'regulation',
    periodIndex: 0,
    periodElapsedMs: 0,
    periodDurationsMs: [totalSeconds * 500, totalSeconds * 500],
    regulationSeconds: totalSeconds,
    totalElapsedMs: 0,
    possessionMs: [0, 0],
    rollElapsedMs: 0,
    turnElapsedMs: 0,
    lastTickAt: now,
    running: true,
    paused: false,
    resolving: false,
    events: [],
    winnerSide: null,
    shootout: null,
    transition: null,
    overlay: null
  };
  pickRestartPlayer(match, 0);
  return match;
}

function markPlayerUnavailable(match, side, playerId, reason) {
  const index = match.teams[side].lineup.findIndex(player => player.id === playerId);
  if (index < 0) return null;
  match.teams[side].lineup[index] = { ...match.teams[side].lineup[index], [reason]: true };
  return match.teams[side].lineup[index];
}

function resolveMainEvent(match, digit, now) {
  const side = match.context.owner;
  const other = side === 0 ? 1 : 0;
  const actor = currentActor(match) || pickRestartPlayer(match, side, digit);
  const event = Core.mainEventForDigit(digit);

  if (event.key === 'goal') {
    match.scores[side] += 1;
    addEvent(match, `${match.teams[side].name}: ${actor?.name || 'Oyuncu'} gol`, true);
    pickRestartPlayer(match, other);
    transitionTo(match, other, { type: 'main' }, {
      title: 'GOL!', subtitle: `${actor?.name || match.teams[side].name} ağları buldu`, tone: 'red', kicker: `Rakam ${digit}`, duration: 1250
    }, now);
    return;
  }

  if (event.key === 'pass') {
    transitionTo(match, side, { type: 'main' }, {
      title: 'PAS', subtitle: `${actor?.name || 'Oyuncu'} topu korudu`, tone: 'green', kicker: `Rakam ${digit}`, duration: 480
    }, now);
    return;
  }

  if (event.key === 'throwIn') {
    addEvent(match, `${match.teams[other].name} taç kazandı`);
    pickRestartPlayer(match, other);
    transitionTo(match, other, { type: 'main' }, { title: 'TAÇ', subtitle: `Top ${match.teams[other].name} tarafında`, tone: 'navy', kicker: `Rakam ${digit}`, duration: 700 }, now);
    return;
  }

  if (event.key === 'turnover') {
    addEvent(match, `${actor?.name || match.teams[side].name} topu kaybetti`);
    pickRestartPlayer(match, other);
    transitionTo(match, other, { type: 'main' }, { title: 'AUT', subtitle: `Sıra ${match.teams[other].name} takımında`, tone: 'navy', kicker: `Rakam ${digit}`, duration: 700 }, now);
    return;
  }

  if (event.key === 'corner') {
    const outcome = Core.registerCorner(match.teams[side].corners);
    match.teams[side].corners = outcome.corners;
    if (outcome.penalty) {
      addEvent(match, `${match.teams[side].name}: 3. kornerden penaltı`, true);
      transitionTo(match, side, { type: 'shot', reason: 'penalty' }, { title: 'PENALTI!', subtitle: 'Üç korner, bir beyaz nokta', tone: 'yellow', kicker: '3. KORNER', duration: 1050 }, now);
    } else {
      addEvent(match, `${match.teams[side].name} korner kazandı (${outcome.corners}/3)`);
      transitionTo(match, side, { type: 'main' }, { title: 'KORNER', subtitle: `${outcome.corners} / 3`, tone: 'green', kicker: `Rakam ${digit}`, duration: 700 }, now);
    }
    return;
  }

  if (event.key === 'foul') {
    match.pendingFoul = { foulerSide: side, victimSide: other, foulerId: actor?.id || null, result: null };
    addEvent(match, `${actor?.name || match.teams[side].name} faul yaptı`, true);
    pickRestartPlayer(match, other);
    transitionTo(match, other, { type: 'foulResult' }, { title: 'FAUL!', subtitle: `${match.teams[other].name} sonuç atışını kullanacak`, tone: 'yellow', kicker: `Rakam ${digit}`, duration: 1000 }, now);
    return;
  }

  if (event.key === 'freeKick') {
    addEvent(match, `${match.teams[side].name} frikik kazandı`, true);
    transitionTo(match, side, { type: 'shot', reason: 'freeKick' }, { title: 'FRİKİK!', subtitle: 'Tek rakam kurtarış, çift rakam gol', tone: 'yellow', kicker: `Rakam ${digit}`, duration: 950 }, now);
  }
}

function continueAfterFoulCard(match, cardOverlay, now) {
  const foul = match.pendingFoul;
  if (!foul) {
    transitionTo(match, match.context.owner, { type: 'main' }, cardOverlay, now);
    return;
  }
  const owner = foul.victimSide;
  const result = foul.result;
  match.pendingFoul = null;
  if (result === 'freeKick' || result === 'penalty') {
    transitionTo(match, owner, { type: 'shot', reason: result }, cardOverlay || {
      title: result === 'penalty' ? 'PENALTI' : 'FRİKİK', subtitle: 'Final atışı', tone: 'yellow'
    }, now);
  } else {
    pickRestartPlayer(match, owner);
    transitionTo(match, owner, { type: 'main' }, cardOverlay || { title: 'SERBEST', subtitle: `${match.teams[owner].name} topu kullanıyor`, tone: 'green' }, now);
  }
}

function resolveFoulResult(match, digit, now) {
  const foul = match.pendingFoul;
  if (!foul) {
    transitionTo(match, match.context.owner, { type: 'main' }, null, now);
    return;
  }
  foul.result = Core.foulResultForDigit(digit);
  const labels = { freeKick: 'FRİKİK', penalty: 'PENALTI', indirect: 'SERBEST VURUŞ' };
  addEvent(match, `Faul sonucu: ${labels[foul.result]}`);
  if (match.settings.cards) {
    transitionTo(match, foul.victimSide, { type: 'foulCard' }, {
      title: labels[foul.result], subtitle: 'Şimdi kart atışı', tone: foul.result === 'penalty' ? 'yellow' : 'navy', kicker: `Rakam ${digit}`, duration: 850
    }, now);
  } else {
    continueAfterFoulCard(match, null, now);
  }
}

function resolveFoulCard(match, digit, now) {
  const foul = match.pendingFoul;
  if (!foul) {
    transitionTo(match, match.context.owner, { type: 'main' }, null, now);
    return;
  }
  const card = Core.cardForDigit(digit);
  const foulerIndex = match.teams[foul.foulerSide].lineup.findIndex(player => player.id === foul.foulerId);
  let cardedPlayer = null;
  if (foulerIndex >= 0) {
    const before = match.teams[foul.foulerSide].lineup[foulerIndex];
    const after = Core.applyCard(before, card);
    match.teams[foul.foulerSide].lineup[foulerIndex] = after;
    cardedPlayer = after;
    if (card === 'yellow') addEvent(match, `${after.name} sarı kart gördü${after.red ? ' ve ikinci sarıdan atıldı' : ''}`, true);
    else if (card === 'red') addEvent(match, `${after.name} direkt kırmızı kart gördü`, true);
  }

  if (match.settings.injury && Math.random() < 0.10) {
    const injured = randomItem(availableOutfield(match, foul.victimSide));
    if (injured) {
      markPlayerUnavailable(match, foul.victimSide, injured.id, 'injured');
      addEvent(match, `${injured.name} sakatlandı ve oyundan çıktı`, true);
    }
  }

  const cardTitle = card === 'yellow' ? (cardedPlayer?.red ? 'KIRMIZI!' : 'SARI KART') : card === 'red' ? 'KIRMIZI!' : 'KART YOK';
  const tone = card === 'yellow' ? 'yellow' : card === 'red' ? 'red' : 'green';
  continueAfterFoulCard(match, { title: cardTitle, subtitle: cardedPlayer?.name || 'Hakem devam dedi', tone, kicker: `Rakam ${digit}`, duration: 950 }, now);
}

function resolveShot(match, digit, now) {
  const side = match.context.owner;
  const other = side === 0 ? 1 : 0;
  const reason = match.context.reason;
  const result = Core.shotForDigit(digit);
  const actor = currentActor(match) || pickRestartPlayer(match, side);
  if (result === 'goal') {
    match.scores[side] += 1;
    addEvent(match, `${match.teams[side].name}: ${reason === 'penalty' ? 'penaltı' : 'frikik'} golü — ${actor?.name || 'Oyuncu'}`, true);
    pickRestartPlayer(match, other);
    transitionTo(match, other, { type: 'main' }, { title: 'GOL!', subtitle: `${actor?.name || match.teams[side].name} çift rakamı buldu`, tone: 'red', kicker: `Rakam ${digit} · ÇİFT`, duration: 1250 }, now);
  } else {
    addEvent(match, `${reason === 'penalty' ? 'Penaltı' : 'Frikik'} kurtarıldı — ${match.teams[side].name}`);
    pickRestartPlayer(match, other);
    transitionTo(match, other, { type: 'main' }, { title: 'KURTARDI!', subtitle: 'Tek rakam kaleciden yana', tone: 'navy', kicker: `Rakam ${digit} · TEK`, duration: 1050 }, now);
  }
}

function shootoutWinner(match) {
  const [s0, s1] = match.shootout.scores;
  const [k0, k1] = match.shootout.kicks;
  const remaining0 = Math.max(0, 5 - k0);
  const remaining1 = Math.max(0, 5 - k1);
  if (s0 > s1 + remaining1) return 0;
  if (s1 > s0 + remaining0) return 1;
  if (k0 >= 5 && k1 >= 5 && k0 === k1 && s0 !== s1) return s0 > s1 ? 0 : 1;
  return null;
}

function resolveShootoutShot(match, digit, now) {
  const side = match.context.owner;
  const result = Core.shotForDigit(digit);
  match.shootout.kicks[side] += 1;
  if (result === 'goal') match.shootout.scores[side] += 1;
  addEvent(match, `${match.teams[side].name} seri penaltı: ${result === 'goal' ? 'GOL' : 'KAÇTI'}`, true);
  const winner = shootoutWinner(match);
  if (winner !== null) {
    finishMatch(match, winner);
    return;
  }
  const next = side === 0 ? 1 : 0;
  pickRestartPlayer(match, next);
  transitionTo(match, next, { type: 'shootoutShot' }, {
    title: result === 'goal' ? 'GOL' : 'KURTARDI',
    subtitle: `Seri: ${match.shootout.scores[0]} — ${match.shootout.scores[1]}`,
    tone: result === 'goal' ? 'red' : 'navy',
    kicker: `Rakam ${digit}`,
    duration: 850
  }, now);
}

function resolveRoll(match, digit, now) {
  if (match.context.type === 'main') resolveMainEvent(match, digit, now);
  else if (match.context.type === 'foulResult') resolveFoulResult(match, digit, now);
  else if (match.context.type === 'foulCard') resolveFoulCard(match, digit, now);
  else if (match.context.type === 'shot') resolveShot(match, digit, now);
  else if (match.context.type === 'shootoutShot') resolveShootoutShot(match, digit, now);
}

function stopRoll(match, side, digit, now = Date.now()) {
  if (!match || match.phase === 'finished' || !match.running || match.paused || match.resolving) return { ok: false, error: 'Atış şu anda kullanılamıyor.' };
  if (match.context.owner !== side) return { ok: false, error: 'Sıra sende değil.' };
  const normalized = Core.normalizeDigit(digit);
  if (match.context.type === 'main') mapActivePlayerFromDigit(match, normalized);
  match.running = false;
  match.resolving = true;
  resolveRoll(match, normalized, now);
  return { ok: true, digit: normalized };
}

function handleTurnTimeout(match, now) {
  if (match.resolving) return;
  match.running = false;
  match.resolving = true;
  const side = match.context.owner;
  const other = side === 0 ? 1 : 0;
  const outcome = Core.registerTimeout(match.teams[side].timeouts);
  match.teams[side].timeouts = outcome.count;
  addEvent(match, `${match.teams[side].name}: 10 saniye ihlali (${outcome.count})`, true);

  if (outcome.consequence === 'turnover') {
    pickRestartPlayer(match, other);
    transitionTo(match, other, { type: 'main' }, { title: 'SÜRE DOLDU', subtitle: 'Top rakibe geçti', tone: 'navy', kicker: `${outcome.count}. İHLAL`, duration: 950 }, now);
  } else if (outcome.consequence === 'penaltyAgainst') {
    pickRestartPlayer(match, other);
    transitionTo(match, other, { type: 'shot', reason: 'penalty' }, { title: 'PENALTI!', subtitle: 'Üçüncü vakit ihlali', tone: 'yellow', kicker: '3. İHLAL', duration: 1050 }, now);
  } else if (outcome.consequence === 'redCard') {
    const actor = currentActor(match) || randomItem(availableOutfield(match, side));
    if (actor) markPlayerUnavailable(match, side, actor.id, 'red');
    addEvent(match, `${actor?.name || match.teams[side].name} vakit ihlalinden kırmızı kart gördü`, true);
    pickRestartPlayer(match, other);
    transitionTo(match, other, { type: 'main' }, { title: 'KIRMIZI!', subtitle: 'Dördüncü vakit ihlali', tone: 'red', kicker: '4. İHLAL', duration: 1100 }, now);
  } else {
    match.scores = Core.forfeitScore(match.scores, side);
    addEvent(match, `${match.teams[side].name} hükmen mağlup`, true);
    finishMatch(match, other);
  }
}

function startShootout(match, now) {
  match.phase = 'shootout';
  match.shootout = { scores: [0, 0], kicks: [0, 0] };
  pickRestartPlayer(match, 0);
  transitionTo(match, 0, { type: 'shootoutShot' }, {
    title: 'SERİ PENALTI', subtitle: 'Çift rakam gol, tek rakam kurtarış', tone: 'yellow', kicker: 'BERABERLİK', duration: 1800
  }, now);
}

function endCurrentPeriod(match, now) {
  if (match.resolving || match.phase === 'shootout' || match.phase === 'finished') return;
  match.running = false;
  match.resolving = true;
  const phase = match.phase;
  const index = match.periodIndex;

  if (index === 0) {
    match.periodIndex = 1;
    match.periodElapsedMs = 0;
    transitionTo(match, match.context.owner, { ...match.context }, {
      title: phase === 'extra' ? 'UZATMA ARASI' : 'DEVRE ARASI',
      subtitle: `${match.scores[0]} — ${match.scores[1]} · Kronometre kısa bir nefes alıyor`,
      tone: 'navy',
      kicker: phase === 'extra' ? 'SON 15’' : 'SOYUNMA ODASI',
      duration: 2200
    }, now);
    return;
  }

  if (phase === 'regulation' && match.scores[0] === match.scores[1] && match.settings.extraTime) {
    const extraTotal = Core.roundExtraTimeSeconds(match.regulationSeconds) * 1000;
    match.phase = 'extra';
    match.periodIndex = 0;
    match.periodElapsedMs = 0;
    match.periodDurationsMs = [extraTotal / 2, extraTotal / 2];
    transitionTo(match, match.context.owner, { ...match.context }, {
      title: 'UZATMALAR', subtitle: `${match.scores[0]} — ${match.scores[1]} · Mücadele devam ediyor`, tone: 'yellow', kicker: '90 DAKİKA BİTTİ', duration: 2200
    }, now);
    return;
  }

  if (match.scores[0] === match.scores[1] && match.settings.shootout) {
    startShootout(match, now);
  } else {
    finishMatch(match, match.scores[0] === match.scores[1] ? null : (match.scores[0] > match.scores[1] ? 0 : 1));
  }
}

function tickMatch(match, now = Date.now()) {
  if (!match || match.phase === 'finished') return false;
  const dt = clamp(now - (match.lastTickAt || now), 0, 250);
  match.lastTickAt = now;

  if (match.resolving) {
    if (match.overlay && now >= match.overlay.until && match.transition) {
      resetRoll(match, match.transition.owner, match.transition.context, now);
      return true;
    }
    return false;
  }

  if (!match.running || match.paused) return false;

  match.rollElapsedMs += dt;
  match.turnElapsedMs += dt;
  if (match.phase !== 'shootout') {
    match.periodElapsedMs += dt;
    match.totalElapsedMs += match.phase === 'regulation' ? dt : 0;
    match.possessionMs[match.context.owner] += dt;
  }

  const digit = Math.floor(Math.max(0, match.rollElapsedMs) / 10) % 10;
  if (match.context.type === 'main') mapActivePlayerFromDigit(match, digit);

  if (match.turnElapsedMs >= 10000) {
    handleTurnTimeout(match, now);
    return true;
  }
  if (match.phase !== 'shootout' && match.periodElapsedMs >= match.periodDurationsMs[match.periodIndex]) {
    endCurrentPeriod(match, now);
    return true;
  }
  return false;
}

function togglePause(match, now = Date.now()) {
  if (!match || match.phase === 'finished' || match.resolving) return false;
  match.paused = !match.paused;
  match.running = !match.paused;
  match.lastTickAt = now;
  return true;
}

module.exports = {
  createMatch,
  tickMatch,
  stopRoll,
  togglePause,
  availableOutfield,
  pickRestartPlayer
};
