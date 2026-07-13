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
      injured: false,
      goals: 0,
      sentOffReason: null
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
  if (match.context.type !== 'playerSelect') return currentActor(match);
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

function addEvent(match, text, important = false, meta = {}) {
  match.events.push({
    minute: eventMinute(match), text, important, timestamp: Date.now(),
    type: meta.type || 'event',
    side: Number.isInteger(meta.side) ? meta.side : null,
    playerId: meta.playerId || null,
    title: meta.title || text,
    detail: meta.detail || ''
  });
  if (match.events.length > 160) match.events.shift();
}

function resetRoll(match, owner, context, now) {
  match.activeSide = owner;
  match.context = { ...context, owner };
  match.rollElapsedMs = 0;
  match.turnElapsedMs = 0;
  match.resolving = false;
  match.running = true;
  match.paused = false;
  match.awaitingPeriodStart = false;
  match.awaitingPeriodSide = null;
  match.transition = null;
  match.overlay = null;
  match.lastTickAt = now;
  if (context.type === 'playerSelect') match.activePlayerId[owner] = null;
  if (['foulResult', 'foulCard', 'shot', 'shootoutShot'].includes(context.type) && !match.activePlayerId[owner]) pickRestartPlayer(match, owner);
}

function transitionTo(match, owner, context, overlay, now) {
  match.running = false;
  match.resolving = true;
  match.transition = { owner, context };
  const duration = Math.max(1500, Number(overlay?.duration) || 1900);
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
    version: 3,
    mode: 'friend',
    teams: teams.map(makeRuntimeTeam),
    settings: { ...settings },
    scores: [0, 0],
    activeSide: 0,
    activePlayerId: [null, null],
    context: { type: 'playerSelect', owner: 0 },
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
    awaitingPeriodStart: false,
    awaitingPeriodSide: null,
    periodStartKey: null,
    events: [],
    winnerSide: null,
    shootout: null,
    transition: null,
    overlay: null
  };
  return match;
}

function markPlayerUnavailable(match, side, playerId, reason) {
  const index = match.teams[side].lineup.findIndex(player => player.id === playerId);
  if (index < 0) return null;
  match.teams[side].lineup[index] = { ...match.teams[side].lineup[index], [reason]: true };
  return match.teams[side].lineup[index];
}

function resolvePlayerSelection(match, digit, now) {
  const side = match.context.owner;
  const chosen = mapActivePlayerFromDigit(match, digit) || pickRestartPlayer(match, side, digit);
  addEvent(match, `${match.teams[side].name}: ${chosen?.name || 'Oyuncu'} topla buluştu`, false, { type: 'player', side, playerId: chosen?.id, title: chosen?.name || 'Oyuncu', detail: 'Topla buluştu' });
  transitionTo(match, side, { type: 'main' }, { title: chosen?.name || 'OYUNCU', subtitle: 'Şimdi olay sonucunu belirle', tone: 'navy', kicker: `Rakam ${digit} · ${chosen?.slot || ''}`, duration: 1700 }, now);
}

function resolveMainEvent(match, digit, now) {
  const side = match.context.owner;
  const other = side === 0 ? 1 : 0;
  const actor = currentActor(match) || pickRestartPlayer(match, side, digit);
  const event = Core.mainEventForDigit(digit);

  if (event.key === 'goal') {
    match.scores[side] += 1;
    if (actor) actor.goals = (Number(actor.goals) || 0) + 1;
    addEvent(match, `${actor?.name || match.teams[side].name} gol attı`, true, { type: 'goal', side, playerId: actor?.id, title: actor?.name || match.teams[side].name, detail: 'Gol' });
    transitionTo(match, other, { type: 'playerSelect' }, { title: 'GOL!', subtitle: `${actor?.name || match.teams[side].name} ağları buldu`, tone: 'red', kicker: `Rakam ${digit}`, duration: 2600 }, now);
    return;
  }
  if (event.key === 'pass') {
    addEvent(match, `${actor?.name || 'Oyuncu'} pas yaptı`, false, { type: 'pass', side, playerId: actor?.id, title: actor?.name || 'Oyuncu', detail: 'Pas' });
    transitionTo(match, side, { type: 'playerSelect' }, { title: 'PAS', subtitle: 'Yeni pasın hedefini seç', tone: 'green', kicker: `${actor?.name || 'Oyuncu'} · Rakam ${digit}`, duration: 1700 }, now);
    return;
  }
  if (event.key === 'throwIn') {
    addEvent(match, `${match.teams[other].name} taç kazandı`, false, { type: 'throwIn', side: other, title: 'Taç', detail: match.teams[other].name });
    transitionTo(match, other, { type: 'playerSelect' }, { title: 'TAÇ', subtitle: `Top ${match.teams[other].name} tarafında`, tone: 'navy', kicker: `Rakam ${digit}`, duration: 1800 }, now);
    return;
  }
  if (event.key === 'turnover') {
    addEvent(match, `${actor?.name || match.teams[side].name} topu kaybetti`, false, { type: 'turnover', side, playerId: actor?.id, title: actor?.name || match.teams[side].name, detail: 'Top kaybı' });
    transitionTo(match, other, { type: 'playerSelect' }, { title: 'AUT', subtitle: `Sıra ${match.teams[other].name} takımında`, tone: 'navy', kicker: `Rakam ${digit}`, duration: 1800 }, now);
    return;
  }
  if (event.key === 'corner') {
    const outcome = Core.registerCorner(match.teams[side].corners);
    match.teams[side].corners = outcome.corners;
    if (outcome.penalty) {
      addEvent(match, `${match.teams[side].name}: 3. kornerden penaltı`, true, { type: 'penalty', side, title: 'Penaltı', detail: '3. korner' });
      transitionTo(match, side, { type: 'shot', reason: 'penalty' }, { title: 'PENALTI!', subtitle: 'Üç korner, bir beyaz nokta', tone: 'yellow', kicker: '3. KORNER', duration: 2300 }, now);
    } else {
      addEvent(match, `${match.teams[side].name} korner kazandı (${outcome.corners}/3)`, false, { type: 'corner', side, title: 'Korner', detail: `${outcome.corners}/3` });
      transitionTo(match, side, { type: 'playerSelect' }, { title: 'KORNER', subtitle: `${outcome.corners} / 3 · Yeni oyuncuyu seç`, tone: 'green', kicker: `Rakam ${digit}`, duration: 1800 }, now);
    }
    return;
  }
  if (event.key === 'foul') {
    match.pendingFoul = { foulerSide: side, victimSide: other, foulerId: actor?.id || null, result: null };
    addEvent(match, `${actor?.name || match.teams[side].name} faul yaptı`, true, { type: 'foul', side, playerId: actor?.id, title: actor?.name || match.teams[side].name, detail: 'Faul' });
    pickRestartPlayer(match, other);
    transitionTo(match, other, { type: 'foulResult' }, { title: 'FAUL!', subtitle: `${match.teams[other].name} sonuç atışını kullanacak`, tone: 'yellow', kicker: `Rakam ${digit}`, duration: 2200 }, now);
    return;
  }
  if (event.key === 'freeKick') {
    addEvent(match, `${match.teams[side].name} frikik kazandı`, true, { type: 'freeKick', side, playerId: actor?.id, title: actor?.name || match.teams[side].name, detail: 'Frikik' });
    transitionTo(match, side, { type: 'shot', reason: 'freeKick' }, { title: 'FRİKİK!', subtitle: 'Tek rakam kurtarış, çift rakam gol', tone: 'yellow', kicker: `Rakam ${digit}`, duration: 2100 }, now);
  }
}

function continueAfterFoulCard(match, cardOverlay, now) {
  const foul = match.pendingFoul;
  if (!foul) {
    transitionTo(match, match.context.owner, { type: 'playerSelect' }, cardOverlay, now);
    return;
  }
  const owner = foul.victimSide;
  const result = foul.result;
  match.pendingFoul = null;
  if (result === 'freeKick' || result === 'penalty') {
    transitionTo(match, owner, { type: 'shot', reason: result }, cardOverlay || {
      title: result === 'penalty' ? 'PENALTI' : 'FRİKİK', subtitle: 'Final atışı', tone: 'yellow', duration: 2100
    }, now);
  } else {
    transitionTo(match, owner, { type: 'playerSelect' }, cardOverlay || { title: 'SERBEST', subtitle: `${match.teams[owner].name} yeni oyuncuyu seçiyor`, tone: 'green', duration: 1900 }, now);
  }
}

function resolveFoulResult(match, digit, now) {
  const foul = match.pendingFoul;
  if (!foul) {
    transitionTo(match, match.context.owner, { type: 'playerSelect' }, null, now);
    return;
  }
  foul.result = Core.foulResultForDigit(digit);
  const labels = { freeKick: 'FRİKİK', penalty: 'PENALTI', indirect: 'SERBEST VURUŞ' };
  addEvent(match, `Faul sonucu: ${labels[foul.result]}`, false, { type: foul.result === 'penalty' ? 'penalty' : 'freeKick', side: foul.victimSide, title: labels[foul.result], detail: 'Faul sonucu' });
  if (match.settings.cards) {
    transitionTo(match, foul.victimSide, { type: 'foulCard' }, {
      title: labels[foul.result], subtitle: 'Şimdi kart atışı', tone: foul.result === 'penalty' ? 'yellow' : 'navy', kicker: `Rakam ${digit}`, duration: 1900
    }, now);
  } else {
    continueAfterFoulCard(match, null, now);
  }
}

function resolveFoulCard(match, digit, now) {
  const foul = match.pendingFoul;
  if (!foul) {
    transitionTo(match, match.context.owner, { type: 'playerSelect' }, null, now);
    return;
  }
  const card = Core.cardForDigit(digit);
  const foulerIndex = match.teams[foul.foulerSide].lineup.findIndex(player => player.id === foul.foulerId);
  let cardedPlayer = null;
  if (foulerIndex >= 0) {
    const before = match.teams[foul.foulerSide].lineup[foulerIndex];
    const after = Core.applyCard(before, card);
    if (card === 'yellow' && after.red) after.sentOffReason = 'secondYellow';
    if (card === 'red') after.sentOffReason = 'directRed';
    match.teams[foul.foulerSide].lineup[foulerIndex] = after;
    cardedPlayer = after;
    if (card === 'yellow') addEvent(match, `${after.name} ${after.red ? 'ikinci sarıdan kırmızı gördü' : 'sarı kart gördü'}`, true, { type: after.red ? 'secondYellow' : 'yellow', side: foul.foulerSide, playerId: after.id, title: after.name, detail: after.red ? 'İkinci sarıdan kırmızı' : 'Sarı kart' });
    else if (card === 'red') addEvent(match, `${after.name} direkt kırmızı kart gördü`, true, { type: 'red', side: foul.foulerSide, playerId: after.id, title: after.name, detail: 'Direkt kırmızı kart' });
  }

  if (match.settings.injury && Math.random() < 0.10) {
    const injured = randomItem(availableOutfield(match, foul.victimSide));
    if (injured) {
      markPlayerUnavailable(match, foul.victimSide, injured.id, 'injured');
      addEvent(match, `${injured.name} sakatlandı ve oyundan çıktı`, true, { type: 'injury', side: foul.victimSide, playerId: injured.id, title: injured.name, detail: 'Sakatlık' });
    }
  }

  const cardTitle = card === 'yellow' ? (cardedPlayer?.red ? 'KIRMIZI!' : 'SARI KART') : card === 'red' ? 'KIRMIZI!' : 'KART YOK';
  const tone = card === 'yellow' ? 'yellow' : card === 'red' ? 'red' : 'green';
  continueAfterFoulCard(match, { title: cardTitle, subtitle: cardedPlayer?.name || 'Hakem devam dedi', tone, kicker: `Rakam ${digit}`, duration: 2300 }, now);
}

function resolveShot(match, digit, now) {
  const side = match.context.owner;
  const other = side === 0 ? 1 : 0;
  const reason = match.context.reason;
  const result = Core.shotForDigit(digit);
  const actor = currentActor(match) || pickRestartPlayer(match, side);
  if (result === 'goal') {
    match.scores[side] += 1;
    if (actor) actor.goals = (Number(actor.goals) || 0) + 1;
    addEvent(match, `${actor?.name || match.teams[side].name} ${reason === 'penalty' ? 'penaltıdan' : 'frikikten'} gol attı`, true, { type: 'goal', side, playerId: actor?.id, title: actor?.name || match.teams[side].name, detail: reason === 'penalty' ? 'Penaltı golü' : 'Frikik golü' });
    transitionTo(match, other, { type: 'playerSelect' }, { title: 'GOL!', subtitle: `${actor?.name || match.teams[side].name} çift rakamı buldu`, tone: 'red', kicker: `Rakam ${digit} · ÇİFT`, duration: 2600 }, now);
  } else {
    addEvent(match, `${reason === 'penalty' ? 'Penaltı' : 'Frikik'} kurtarıldı`, true, { type: 'save', side, playerId: actor?.id, title: actor?.name || match.teams[side].name, detail: 'Kaleci kurtardı' });
    transitionTo(match, other, { type: 'playerSelect' }, { title: 'KURTARDI!', subtitle: 'Tek rakam kaleciden yana', tone: 'navy', kicker: `Rakam ${digit} · TEK`, duration: 2300 }, now);
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
  if (match.context.type === 'playerSelect') resolvePlayerSelection(match, digit, now);
  else if (match.context.type === 'main') resolveMainEvent(match, digit, now);
  else if (match.context.type === 'foulResult') resolveFoulResult(match, digit, now);
  else if (match.context.type === 'foulCard') resolveFoulCard(match, digit, now);
  else if (match.context.type === 'shot') resolveShot(match, digit, now);
  else if (match.context.type === 'shootoutShot') resolveShootoutShot(match, digit, now);
}

function stopRoll(match, side, digit, now = Date.now()) {
  if (!match || match.phase === 'finished' || !match.running || match.paused || match.resolving) return { ok: false, error: 'Atış şu anda kullanılamıyor.' };
  if (match.context.owner !== side) return { ok: false, error: 'Sıra sende değil.' };
  const normalized = Core.normalizeDigit(digit);
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
  addEvent(match, `${match.teams[side].name}: 10 saniye ihlali (${outcome.count})`, true, { type: 'timeout', side, title: 'Süre ihlali', detail: `${outcome.count}. ihlal` });

  if (outcome.consequence === 'turnover') {
    transitionTo(match, other, { type: 'playerSelect' }, { title: 'SÜRE DOLDU', subtitle: 'Top rakibe geçti', tone: 'navy', kicker: `${outcome.count}. İHLAL`, duration: 1900 }, now);
  } else if (outcome.consequence === 'penaltyAgainst') {
    pickRestartPlayer(match, other);
    transitionTo(match, other, { type: 'shot', reason: 'penalty' }, { title: 'PENALTI!', subtitle: 'Üçüncü vakit ihlali', tone: 'yellow', kicker: '3. İHLAL', duration: 2300 }, now);
  } else if (outcome.consequence === 'redCard') {
    const actor = currentActor(match) || randomItem(availableOutfield(match, side));
    if (actor) {
      markPlayerUnavailable(match, side, actor.id, 'red');
      actor.red = true;
      actor.sentOffReason = 'timeoutRed';
    }
    addEvent(match, `${actor?.name || match.teams[side].name} vakit ihlalinden kırmızı kart gördü`, true, { type: 'red', side, playerId: actor?.id, title: actor?.name || match.teams[side].name, detail: 'Süre ihlali kırmızısı' });
    transitionTo(match, other, { type: 'playerSelect' }, { title: 'KIRMIZI!', subtitle: 'Dördüncü vakit ihlali', tone: 'red', kicker: '4. İHLAL', duration: 2400 }, now);
  } else {
    match.scores = Core.forfeitScore(match.scores, side);
    addEvent(match, `${match.teams[side].name} hükmen mağlup`, true, { type: 'red', side, title: 'Hükmen mağlubiyet', detail: '5. süre ihlali' });
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

function preparePeriodStart(match, side, phase, periodIndex, now) {
  match.phase = phase;
  match.periodIndex = periodIndex;
  match.periodElapsedMs = 0;
  match.context = { type: 'playerSelect', owner: side };
  match.activeSide = side;
  match.activePlayerId[side] = null;
  match.rollElapsedMs = 0;
  match.turnElapsedMs = 0;
  match.running = false;
  match.paused = true;
  match.resolving = false;
  match.awaitingPeriodStart = true;
  match.awaitingPeriodSide = side;
  match.periodStartKey = `${phase}-${periodIndex}-${now}`;
  match.transition = null;
  match.overlay = null;
  match.lastTickAt = now;
}

function startWaitingPeriod(match, side, now = Date.now()) {
  if (!match?.awaitingPeriodStart) return { ok: false, error: 'Başlatılmayı bekleyen devre yok.' };
  if (match.awaitingPeriodSide !== side) return { ok: false, error: 'Bu devreyi diğer oyuncu başlatmalı.' };
  resetRoll(match, side, { type: 'playerSelect' }, now);
  match.periodStartKey = null;
  return { ok: true };
}

function endCurrentPeriod(match, now) {
  if (match.resolving || match.phase === 'shootout' || match.phase === 'finished' || match.awaitingPeriodStart) return;
  match.running = false;
  match.resolving = false;
  const phase = match.phase;
  const index = match.periodIndex;

  if (index === 0) {
    preparePeriodStart(match, 1, phase, 1, now);
    return;
  }
  if (phase === 'regulation' && match.scores[0] === match.scores[1] && match.settings.extraTime) {
    const extraTotal = Core.roundExtraTimeSeconds(match.regulationSeconds) * 1000;
    match.periodDurationsMs = [extraTotal / 2, extraTotal / 2];
    preparePeriodStart(match, 0, 'extra', 0, now);
    return;
  }
  if (match.scores[0] === match.scores[1] && match.settings.shootout) startShootout(match, now);
  else finishMatch(match, match.scores[0] === match.scores[1] ? null : (match.scores[0] > match.scores[1] ? 0 : 1));
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

  if (!match.running || match.paused || match.awaitingPeriodStart) return false;

  match.rollElapsedMs += dt;
  match.turnElapsedMs += dt;
  if (match.phase !== 'shootout') {
    match.periodElapsedMs += dt;
    match.totalElapsedMs += match.phase === 'regulation' ? dt : 0;
    match.possessionMs[match.context.owner] += dt;
  }


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
  if (!match || match.phase === 'finished' || match.resolving || match.awaitingPeriodStart) return false;
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
  startWaitingPeriod,
  availableOutfield,
  pickRestartPlayer
};
