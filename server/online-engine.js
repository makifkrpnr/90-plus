'use strict';

const Core = require('../js/core.js');

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const randomItem = items => items[Math.floor(Math.random() * items.length)];

function makeRuntimeTeam(team, color) {
  return {
    name: team.name,
    color: team.color || color || '#d44735',
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
  match.pausedBy = null;
  match.awaitingPeriodStart = false;
  match.awaitingPeriodSide = null;
  match.transition = null;
  match.overlay = null;
  match.lastTickAt = now;
  if (context.type === 'playerSelect') match.activePlayerId[owner] = null;
  if (['foulResult', 'foulCard', 'setPieceShot', 'shotOpenPlay', 'shootoutShot'].includes(context.type) && !match.activePlayerId[owner]) pickRestartPlayer(match, owner);
}

function transitionTo(match, owner, context, overlay, now) {
  match.running = false;
  match.resolving = true;
  match.transition = { owner, context };
  const title = String(overlay?.title || '');
  const important = /GOL|KIRMIZI|PENALTI|FAUL|KURTARDI|HÜKMEN|EŞİTLİK|BAŞLAMA|EK SÜRE/i.test(title);
  const duration = Math.max(important ? 3600 : 2800, Number(overlay?.duration) || 3000);
  const inferredType = overlay?.type || (/GOL/i.test(title) ? 'goal' : /İKİNCİ SARI/i.test(title) ? 'secondYellow' : /KIRMIZI/i.test(title) ? 'red' : /SARI/i.test(title) ? 'yellow' : /KURTARDI/i.test(title) ? 'save' : /FAUL/i.test(title) ? 'foul' : /PENALTI/i.test(title) ? 'penalty' : /FRİKİK/i.test(title) ? 'freeKick' : /KORNER/i.test(title) ? 'corner' : /TAÇ/i.test(title) ? 'throwIn' : /AUT|TOP KAYBI/i.test(title) ? 'turnover' : '');
  match.overlay = overlay ? {
    id: `${now}-${Math.random().toString(36).slice(2, 7)}`,
    title: overlay.title || '',
    subtitle: overlay.subtitle || '',
    tone: overlay.tone || 'red',
    kicker: overlay.kicker || '',
    type: overlay.type || inferredType,
    actor: overlay.actor || null,
    keeper: overlay.keeper || null,
    playerId: overlay.playerId || null,
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

function createMatch(teams, settings, now = Date.now(), series = null) {
  const totalSeconds = settings.durationMinutes * 60;
  const coinWinner = Math.random() < 0.5 ? 0 : 1;
  const runtimeTeams = teams.map((team, side) => makeRuntimeTeam(team, settings.teamColors?.[side] || (side === 0 ? '#d44735' : '#2878c8')));
  return {
    version: 5,
    mode: 'friend',
    teams: runtimeTeams,
    settings: { ...settings },
    scores: [0, 0],
    activeSide: coinWinner,
    activePlayerId: [null, null],
    context: { type: 'kickoffReady', owner: coinWinner },
    pendingFoul: null,
    phase: 'kickoff',
    kickoff: { coinWinner, readyToStart: true, revealedAt: now },
    firstHalfStarter: coinWinner,
    secondHalfStarter: coinWinner === 0 ? 1 : 0,
    passStreak: [0, 0],
    periodIndex: 0,
    periodElapsedMs: 0,
    periodDurationsMs: [totalSeconds * 500, totalSeconds * 500],
    regulationPeriodDurationsMs: [totalSeconds * 500, totalSeconds * 500],
    regulationSeconds: totalSeconds,
    totalElapsedMs: 0,
    possessionMs: [0, 0],
    rollElapsedMs: 0,
    turnElapsedMs: 0,
    delayWasteMs: [0, 0],
    stoppageMs: 0,
    stoppageAnnounced: false,
    lastTickAt: now,
    running: true,
    paused: false,
    pausedBy: null,
    pauseBudgetsMs: [60000, 60000],
    resolving: false,
    awaitingPeriodStart: false,
    awaitingPeriodSide: null,
    periodStartKey: null,
    events: [],
    winnerSide: null,
    shootout: null,
    transition: null,
    overlay: {
      id: `coin-${now}`,
      title: 'YAZI TURA',
      subtitle: `${runtimeTeams[coinWinner].name} ilk yarıya başlayacak`,
      tone: 'yellow', kicker: 'BAŞLAMA HAKKI', type: 'kickoff', until: now + 4200
    },
    series: series ? JSON.parse(JSON.stringify(series)) : null
  };
}

function markPlayerUnavailable(match, side, playerId, reason) {
  const index = match.teams[side].lineup.findIndex(player => player.id === playerId);
  if (index < 0) return null;
  match.teams[side].lineup[index] = { ...match.teams[side].lineup[index], [reason]: true };
  return match.teams[side].lineup[index];
}

function beginAfterKickoff(match, now) {
  const side = match.firstHalfStarter;
  match.phase = 'regulation';
  match.periodIndex = 0;
  match.periodElapsedMs = 0;
  match.totalElapsedMs = 0;
  match.stoppageAnnounced = false;
  match.stoppageMs = 0;
  addEvent(match, `${match.teams[side].name} ilk yarıya başladı`, true, { type: 'kickoff', side, title: 'Başlama vuruşu', detail: match.teams[side].name });
  resetRoll(match, side, { type: 'playerSelect' }, now);
}

function resolvePlayerSelection(match, digit, now) {
  const side = match.context.owner;
  const chosen = mapActivePlayerFromDigit(match, digit) || pickRestartPlayer(match, side, digit);
  addEvent(match, `${match.teams[side].name}: ${chosen?.name || 'Oyuncu'} topla buluştu`, false, { type: 'player', side, playerId: chosen?.id, title: chosen?.name || 'Oyuncu', detail: 'Topla buluştu' });
  transitionTo(match, side, { type: 'main' }, { title: chosen?.name || 'OYUNCU', subtitle: `${match.teams[side].name} · ŞİMDİ OLAYI BELİRLE`, tone: 'navy', kicker: `Rakam ${digit} · ${chosen?.slot || ''}`, duration: 2600, type: 'player', playerId: chosen?.id || null }, now);
}

function resolveMainEvent(match, digit, now) {
  const side = match.context.owner;
  const other = side === 0 ? 1 : 0;
  const actor = currentActor(match) || pickRestartPlayer(match, side, digit);
  const event = Core.mainEventForDigit(digit, match.passStreak?.[side] || 0);

  if (event.key !== 'pass') match.passStreak = [0, 0];
  if (event.key === 'goal') {
    match.scores[side] += 1;
    if (actor) actor.goals = (Number(actor.goals) || 0) + 1;
    addEvent(match, `${actor?.name || match.teams[side].name} gol attı`, true, { type: 'goal', side, playerId: actor?.id, title: actor?.name || match.teams[side].name, detail: 'Gol' });
    transitionTo(match, other, { type: 'playerSelect' }, { title: 'GOL!', subtitle: `${actor?.name || match.teams[side].name} ağları buldu`, tone: 'red', kicker: `Rakam ${digit}`, duration: 2600, type: 'goal', actor: actor?.name || null }, now);
    return;
  }
  if (event.key === 'pass') {
    match.passStreak[side] = Math.min(2, (Number(match.passStreak[side]) || 0) + 1);
    addEvent(match, `${actor?.name || 'Oyuncu'} pas yaptı`, false, { type: 'pass', side, playerId: actor?.id, title: actor?.name || 'Oyuncu', detail: 'Pas' });
    transitionTo(match, side, { type: 'playerSelect' }, { title: 'PAS', subtitle: match.passStreak[side] >= 2 ? 'İkinci pas. Sonraki olayda paslar kilitlenecek.' : 'Yeni pasın hedefini seç', tone: 'green', kicker: `${actor?.name || 'Oyuncu'} · Rakam ${digit}`, duration: 1700 }, now);
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
      transitionTo(match, side, { type: 'setPieceShot', reason: 'penalty' }, { title: 'PENALTI!', subtitle: 'Üç korner, bir beyaz nokta', tone: 'yellow', kicker: '3. KORNER', duration: 2300 }, now);
    } else {
      addEvent(match, `${match.teams[side].name} korner kazandı (${outcome.corners}/3)`, false, { type: 'corner', side, title: 'Korner', detail: `${outcome.corners}/3` });
      transitionTo(match, side, { type: 'playerSelect' }, { title: 'KORNER', subtitle: `${outcome.corners} / 3 · Yeni oyuncuyu seç`, tone: 'green', kicker: `Rakam ${digit}`, duration: 1800 }, now);
    }
    return;
  }
  if (event.key === 'shot') {
    addEvent(match, `${actor?.name || match.teams[side].name} şut pozisyonuna girdi`, true, { type: 'shot', side, playerId: actor?.id, title: actor?.name || match.teams[side].name, detail: 'Şut' });
    transitionTo(match, side, { type: 'shotOpenPlay' }, { title: 'ŞUT!', subtitle: '0 korner · 9 gol · diğerleri kurtarış, direk veya aut', tone: 'yellow', kicker: `Rakam ${digit}`, duration: 2500, type: 'shot' }, now);
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
    transitionTo(match, side, { type: 'setPieceShot', reason: 'freeKick' }, { title: 'FRİKİK!', subtitle: 'Tek rakam kurtarış, çift rakam gol', tone: 'yellow', kicker: `Rakam ${digit}`, duration: 2100 }, now);
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
    transitionTo(match, owner, { type: 'setPieceShot', reason: result }, cardOverlay || {
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
      title: labels[foul.result], subtitle: 'Şimdi kart atışı', tone: foul.result === 'penalty' ? 'yellow' : 'navy', kicker: `Rakam ${digit}`, duration: 2600, type: foul.result === 'penalty' ? 'penalty' : 'freeKick'
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

function outcomeOverlay(outcome, actor, digit, prefix = '', keeper = null) {
  if (outcome === 'saved') return { title: 'KALECİ KURTARDI!', subtitle: `${prefix}${actor?.name || 'Oyuncu'} vuruşunda kaleci gole izin vermedi.`, tone: 'navy', type: 'save', actor: actor?.name || null, keeper };
  if (outcome === 'post') return { title: 'DİREKTE PATLADI!', subtitle: `${prefix}${actor?.name || 'Oyuncu'} direğe takıldı.`, tone: 'yellow', type: 'post', actor: actor?.name || null };
  return { title: 'AUT!', subtitle: `${prefix}${actor?.name || 'Oyuncu'} çerçeveyi bulamadı.`, tone: 'navy', type: 'wide', actor: actor?.name || null };
}

function resolveOpenPlayShot(match, digit, now) {
  const side = match.context.owner;
  const other = side === 0 ? 1 : 0;
  const actor = currentActor(match) || pickRestartPlayer(match, side);
  const result = Core.shotForDigit(digit);
  match.passStreak = [0, 0];
  if (result === 'goal') {
    match.scores[side] += 1;
    if (actor) actor.goals = (Number(actor.goals) || 0) + 1;
    addEvent(match, `${actor?.name || match.teams[side].name} şutunu gole çevirdi`, true, { type: 'goal', side, playerId: actor?.id, title: actor?.name || match.teams[side].name, detail: 'Şut golü' });
    transitionTo(match, other, { type: 'playerSelect' }, { title: 'GOL!', subtitle: `${actor?.name || match.teams[side].name} ağları buldu`, tone: 'red', kicker: `ŞUT · Rakam ${digit}`, duration: 4200, type: 'goal', actor: actor?.name || null }, now);
    return;
  }
  if (result === 'corner') {
    const outcome = Core.registerCorner(match.teams[side].corners);
    match.teams[side].corners = outcome.corners;
    if (outcome.penalty) {
      addEvent(match, `${match.teams[side].name}: şuttan gelen 3. korner ve penaltı`, true, { type: 'penalty', side, title: 'Penaltı', detail: '3. korner' });
      transitionTo(match, side, { type: 'setPieceShot', reason: 'penalty' }, { title: 'PENALTI!', subtitle: 'Şut kornere çıktı; üçüncü korner beyaz noktaya dönüştü.', tone: 'yellow', kicker: 'ŞUT · 3. KORNER', duration: 3600, type: 'penalty' }, now);
    } else {
      addEvent(match, `${match.teams[side].name} şuttan korner kazandı (${outcome.corners}/3)`, true, { type: 'corner', side, title: 'Korner', detail: `${outcome.corners}/3` });
      transitionTo(match, other, { type: 'playerSelect' }, { title: 'KORNER!', subtitle: `Sayaç ${outcome.corners}/3. Korner kullanılmaz; sıra rakibe geçer.`, tone: 'green', kicker: `ŞUT · Rakam ${digit}`, duration: 3600, type: 'corner' }, now);
    }
    return;
  }
  const overlay = outcomeOverlay(result, actor, digit, '', match.teams[other].lineup.find(p => p.slot === 'GK')?.name || null);
  addEvent(match, overlay.subtitle, true, { type: overlay.type, side, playerId: actor?.id, title: overlay.title.replace('!',''), detail: result === 'post' ? 'Direk' : result === 'saved' ? 'Kaleci kurtardı' : 'Aut' });
  transitionTo(match, other, { type: 'playerSelect' }, { ...overlay, kicker: `ŞUT · Rakam ${digit}`, duration: 3800 }, now);
}

function resolveSetPieceShot(match, digit, now) {
  const side = match.context.owner;
  const other = side === 0 ? 1 : 0;
  const reason = match.context.reason;
  const result = Core.setPieceOutcomeForDigit(digit);
  const actor = currentActor(match) || pickRestartPlayer(match, side);
  match.passStreak = [0, 0];
  const label = reason === 'penalty' ? 'Penaltı' : 'Frikik';
  if (result === 'goal') {
    match.scores[side] += 1;
    if (actor) actor.goals = (Number(actor.goals) || 0) + 1;
    addEvent(match, `${actor?.name || match.teams[side].name} ${label.toLocaleLowerCase('tr')} vuruşunu gole çevirdi`, true, { type: 'goal', side, playerId: actor?.id, title: actor?.name || match.teams[side].name, detail: `${label} golü` });
    transitionTo(match, other, { type: 'playerSelect' }, { title: 'GOL!', subtitle: `${actor?.name || match.teams[side].name} çift rakamı buldu.`, tone: 'red', kicker: `${label.toUpperCase()} · Rakam ${digit} · ÇİFT`, duration: 4200, type: reason === 'penalty' ? 'penaltyGoal' : 'goal', actor: actor?.name || null }, now);
    return;
  }
  const overlay = outcomeOverlay(result, actor, digit, `${label}: `, match.teams[other].lineup.find(p => p.slot === 'GK')?.name || null);
  addEvent(match, overlay.subtitle, true, { type: overlay.type, side, playerId: actor?.id, title: overlay.title.replace('!',''), detail: label });
  transitionTo(match, other, { type: 'playerSelect' }, { ...overlay, kicker: `${label.toUpperCase()} · Rakam ${digit} · TEK`, duration: 3900 }, now);
}

function resolveShootoutShot(match, digit, now) {
  const side = match.context.owner;
  const result = Core.setPieceOutcomeForDigit(digit);
  const actor = currentActor(match) || pickRestartPlayer(match, side);
  match.shootout.kicks[side] += 1;
  if (result === 'goal') match.shootout.scores[side] += 1;
  const resultLabel = result === 'goal' ? 'GOL' : result === 'saved' ? 'KALECİ KURTARDI' : result === 'post' ? 'DİREKTE PATLADI' : 'AUT';
  addEvent(match, `${match.teams[side].name} seri penaltı: ${resultLabel}`, true, { type: result === 'goal' ? 'goal' : result === 'saved' ? 'save' : result, side, playerId: actor?.id, title: resultLabel, detail: 'Seri penaltı' });
  const winner = shootoutWinner(match);
  if (winner !== null) {
    finishMatch(match, winner);
    return;
  }
  const next = side === 0 ? 1 : 0;
  pickRestartPlayer(match, next);
  transitionTo(match, next, { type: 'shootoutShot' }, {
    title: result === 'goal' ? 'GOL!' : result === 'saved' ? 'KALECİ KURTARDI!' : result === 'post' ? 'DİREKTE PATLADI!' : 'AUT!',
    subtitle: `${resultLabel} · Seri ${match.shootout.scores[0]} — ${match.shootout.scores[1]}`,
    tone: result === 'goal' ? 'red' : result === 'post' ? 'yellow' : 'navy',
    kicker: `SERİ PENALTI · Rakam ${digit}`,
    duration: 3900
  }, now);
}

function resolveRoll(match, digit, now) {
  if (match.context.type === 'playerSelect') resolvePlayerSelection(match, digit, now);
  else if (match.context.type === 'main') resolveMainEvent(match, digit, now);
  else if (match.context.type === 'foulResult') resolveFoulResult(match, digit, now);
  else if (match.context.type === 'foulCard') resolveFoulCard(match, digit, now);
  else if (match.context.type === 'shotOpenPlay') resolveOpenPlayShot(match, digit, now);
  else if (match.context.type === 'setPieceShot') resolveSetPieceShot(match, digit, now);
  else if (match.context.type === 'shootoutShot') resolveShootoutShot(match, digit, now);
}

function stopRoll(match, side, digit, now = Date.now()) {
  if (!match || match.phase === 'finished' || !match.running || match.paused || match.resolving) return { ok: false, error: 'Atış şu anda kullanılamıyor.' };
  if (match.context.owner !== side) return { ok: false, error: 'Sıra sende değil.' };
  if (match.context.type === 'kickoffReady') {
    beginAfterKickoff(match, now);
    return { ok: true, digit: 0 };
  }
  const normalized = Core.normalizeDigit(digit);
  if (match.phase !== 'kickoff' && match.context.type !== 'kickoffReady') {
    const excess = Math.max(0, Number(match.turnElapsedMs) - 1000);
    match.delayWasteMs[side] = (Number(match.delayWasteMs[side]) || 0) + excess;
  }
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
  match.delayWasteMs[side] = (Number(match.delayWasteMs[side]) || 0) + 9000;
  const outcome = Core.registerTimeout(match.teams[side].timeouts);
  match.teams[side].timeouts = outcome.count;
  addEvent(match, `${match.teams[side].name}: 10 saniye ihlali (${outcome.count})`, true, { type: 'timeout', side, title: 'Süre ihlali', detail: `${outcome.count}. ihlal` });

  if (outcome.consequence === 'turnover') {
    transitionTo(match, other, { type: 'playerSelect' }, { title: 'SÜRE DOLDU', subtitle: 'Top rakibe geçti', tone: 'navy', kicker: `${outcome.count}. İHLAL`, duration: 1900 }, now);
  } else if (outcome.consequence === 'penaltyAgainst') {
    pickRestartPlayer(match, other);
    transitionTo(match, other, { type: 'setPieceShot', reason: 'penalty' }, { title: 'PENALTI!', subtitle: 'Üçüncü vakit ihlali', tone: 'yellow', kicker: '3. İHLAL', duration: 2300 }, now);
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
    title: 'SERİ PENALTI', subtitle: 'Çift rakam gol; tek rakam kurtarış, direk veya aut', tone: 'yellow', kicker: 'BERABERLİK', duration: 1800
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
  match.pausedBy = null;
  match.resolving = false;
  match.awaitingPeriodStart = true;
  match.awaitingPeriodSide = side;
  match.periodStartKey = `${phase}-${periodIndex}-${now}`;
  if (phase === 'regulation' && periodIndex === 1) {
    match.stoppageAnnounced = false;
    match.stoppageMs = 0;
  }
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

function effectiveScores(match) {
  const base = Array.isArray(match.series?.aggregateBase) ? match.series.aggregateBase : [0,0];
  return [(Number(base[0])||0)+(Number(match.scores[0])||0), (Number(base[1])||0)+(Number(match.scores[1])||0)];
}

function endCurrentPeriod(match, now) {
  if (match.resolving || match.phase === 'shootout' || match.phase === 'finished' || match.awaitingPeriodStart) return;
  match.running = false; match.resolving = false;
  const phase = match.phase, index = match.periodIndex;
  if (index === 0) {
    const starter = phase === 'regulation' ? (match.secondHalfStarter ?? 1) : ((match.firstHalfStarter ?? 0) === 0 ? 1 : 0);
    preparePeriodStart(match, starter, phase, 1, now); return;
  }
  const effective = effectiveScores(match);
  const tied = effective[0] === effective[1];
  if (phase === 'regulation' && tied && match.settings.extraTime) {
    const extraTotal = Core.roundExtraTimeSeconds(match.regulationSeconds) * 1000;
    match.periodDurationsMs = [extraTotal / 2, extraTotal / 2];
    preparePeriodStart(match, match.firstHalfStarter ?? 0, 'extra', 0, now); return;
  }
  if (tied && match.settings.shootout) startShootout(match, now);
  else finishMatch(match, tied ? null : (effective[0] > effective[1] ? 0 : 1));
}


function currentPeriodTargetMs(match) {
  const base = Number(match.periodDurationsMs?.[match.periodIndex]) || 0;
  if (match.phase === 'regulation' && match.periodIndex === 1) return base + (Number(match.stoppageMs) || 0);
  return base;
}

function announceStoppage(match, now) {
  if (match.phase !== 'regulation' || match.periodIndex !== 1 || match.stoppageAnnounced) return false;
  match.stoppageAnnounced = true;
  match.stoppageMs = Core.calculateStoppageTimeMs(match.delayWasteMs, match.settings.durationMinutes);
  if (!match.stoppageMs) return false;
  const shown = Core.formatAddedTimeMinutes(match.stoppageMs);
  addEvent(match, `Hakem ${shown} dakika ek süre gösterdi`, true, { type: 'stoppage', title: `+${shown}`, detail: 'Hakemin ek süresi' });
  transitionTo(match, match.context.owner, { ...match.context }, {
    title: `+${shown}`, subtitle: `${Math.round(match.stoppageMs / 1000)} saniye ek süre oynanacak`, tone: 'navy',
    kicker: '90+ HAKEM KARARI', duration: 3600, type: 'stoppage'
  }, now);
  return true;
}

function tickMatch(match, now = Date.now()) {
  if (!match || match.phase === 'finished') return false;
  const dt = clamp(now - (match.lastTickAt || now), 0, 250);
  match.lastTickAt = now;

  if (match.paused && Number.isInteger(match.pausedBy)) {
    const side = match.pausedBy;
    match.pauseBudgetsMs[side] = Math.max(0, Number(match.pauseBudgetsMs[side]) - dt);
    if (match.pauseBudgetsMs[side] <= 0) {
      match.paused = false;
      match.running = true;
      match.pausedBy = null;
      return true;
    }
    return true;
  }

  if (match.resolving) {
    if (match.overlay && now >= match.overlay.until && match.transition) {
      resetRoll(match, match.transition.owner, match.transition.context, now);
      return true;
    }
    return false;
  }
  if (!match.running || match.awaitingPeriodStart) return false;

  match.rollElapsedMs += dt;
  if (match.context.type !== 'kickoffReady') match.turnElapsedMs += dt;
  if (match.phase === 'regulation' || match.phase === 'extra') {
    match.periodElapsedMs += dt;
    if (match.phase === 'regulation') match.totalElapsedMs += dt;
    match.possessionMs[match.context.owner] += dt;
  }

  if (match.context.type === 'kickoffReady' && match.rollElapsedMs >= 15000) {
    // İlk düdük süresinde basılmazsa maç kendiliğinden başlar.
    beginAfterKickoff(match, now);
    return true;
  }
  if (match.context.type !== 'kickoffReady' && match.turnElapsedMs >= 10000) {
    handleTurnTimeout(match, now);
    return true;
  }
  if ((match.phase === 'regulation' || match.phase === 'extra') && match.periodElapsedMs >= currentPeriodTargetMs(match)) {
    if (!announceStoppage(match, now)) endCurrentPeriod(match, now);
    return true;
  }
  return false;
}

function togglePause(match, side, now = Date.now()) {
  if (!match || match.phase === 'finished' || match.resolving || match.awaitingPeriodStart || match.phase === 'kickoff' || match.context.type === 'kickoffReady') {
    return { ok: false, error: 'Maç şu anda duraklatılamıyor.' };
  }
  if (match.paused) {
    if (match.pausedBy !== side) return { ok: false, error: 'Molayı yalnızca duraklatan oyuncu bitirebilir.' };
    match.paused = false;
    match.running = true;
    match.pausedBy = null;
    match.lastTickAt = now;
    return { ok: true, paused: false };
  }
  if (match.context.owner !== side) return { ok: false, error: 'Yalnızca kendi sıranda mola alabilirsin.' };
  if ((Number(match.pauseBudgetsMs?.[side]) || 0) <= 0) return { ok: false, error: '60 saniyelik mola hakkın tükendi.' };
  match.paused = true;
  match.running = false;
  match.pausedBy = side;
  match.lastTickAt = now;
  return { ok: true, paused: true };
}

// Bilinçli maç terki: terk eden hükmen kaybeder, maç anında biter.
function forfeitMatch(match, losingSide, reason = 'Maç terki') {
  if (!match || match.phase === 'finished') return { ok: false, error: 'Maç zaten bitti.' };
  const other = losingSide === 0 ? 1 : 0;
  match.scores = Core.forfeitScore(match.scores, losingSide);
  addEvent(match, `${match.teams[losingSide].name} maçı terk etti — hükmen mağlup`, true, { type: 'red', side: losingSide, title: 'Hükmen', detail: reason });
  finishMatch(match, other);
  return { ok: true, winner: other };
}

module.exports = {
  createMatch,
  tickMatch,
  stopRoll,
  togglePause,
  startWaitingPeriod,
  forfeitMatch,
  availableOutfield,
  pickRestartPlayer
};
