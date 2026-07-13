(function () {
  'use strict';

  const Core = window.GameCore;
  const PLAYERS = window.KRONOMETRE_PLAYERS || [];
  const SAVE_KEY = '90-plus-save-v3';
  const THEME_KEY = '90-plus-theme';
  const ONLINE_TOKEN_KEY = '90-plus-online-token';
  const SLOTS = ['GK', 'LB', 'CB', 'CB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST'];
  const PERIODS = [
    { id: '1950-1965', label: '1950–1965', start: 1950, end: 1965 },
    { id: '1966-1980', label: '1966–1980', start: 1966, end: 1980 },
    { id: '1981-1995', label: '1981–1995', start: 1981, end: 1995 },
    { id: '1996-2005', label: '1996–2005', start: 1996, end: 2005 },
    { id: '2006-2013', label: '2006–2013', start: 2006, end: 2013 },
    { id: '2014-2020', label: '2014–2020', start: 2014, end: 2020 },
    { id: '2021-2026', label: '2021–2026', start: 2021, end: 2026 }
  ];

  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const randomItem = items => items[Math.floor(Math.random() * items.length)];
  const shuffle = items => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };
  const uniqueById = items => [...new Map(items.map(item => [item.id, item])).values()];

  const els = {
    screens: $$('.screen'),
    homeButton: $('#homeButton'),
    themeButton: $('#themeButton'),
    soundButton: $('#soundButton'),
    startButton: $('#startButton'),
    howToButton: $('#howToButton'),
    continueButton: $('#continueButton'),
    modeButtons: $$('.mode-card[data-mode]'),
    networkBadge: $('#networkBadge'),
    hostNameInput: $('#hostNameInput'),
    guestNameInput: $('#guestNameInput'),
    joinCodeInput: $('#joinCodeInput'),
    createRoomButton: $('#createRoomButton'),
    joinRoomButton: $('#joinRoomButton'),
    onlineStatus: $('#onlineStatus'),
    lobbyCode: $('#lobbyCode'),
    copyCodeButton: $('#copyCodeButton'),
    lobbyPlayer0: $('#lobbyPlayer0'),
    lobbyPlayer1: $('#lobbyPlayer1'),
    lobbySettingsSummary: $('#lobbySettingsSummary'),
    lobbyMessage: $('#lobbyMessage'),
    leaveRoomButton: $('#leaveRoomButton'),
    editOnlineSettingsButton: $('#editOnlineSettingsButton'),
    startOnlineMatchButton: $('#startOnlineMatchButton'),
    remoteMatchBar: $('#remoteMatchBar'),
    remoteRoomCode: $('#remoteRoomCode'),
    remoteConnectionText: $('#remoteConnectionText'),
    builderTabs: $$('.builder-tab'),
    setupTeamLabel: $('#setupTeamLabel'),
    teamNameInput: $('#teamNameInput'),
    builtStatus: $('#builtStatus'),
    periodChips: $('#periodChips'),
    nationalitySelect: $('#nationalitySelect'),
    leagueSelect: $('#leagueSelect'),
    randomBuildButton: $('#randomBuildButton'),
    criteriaBuildButton: $('#criteriaBuildButton'),
    manualSearch: $('#manualSearch'),
    manualCount: $('#manualCount'),
    manualPlayerList: $('#manualPlayerList'),
    manualBuildButton: $('#manualBuildButton'),
    squadPreview: $('#squadPreview'),
    nextSetupButton: $('#nextSetupButton'),
    draftProgress: $('#draftProgress'),
    draftCandidates: $('#draftCandidates'),
    draftWatchDisplay: $('#draftWatchDisplay'),
    draftStopButton: $('#draftStopButton'),
    durationRange: $('#durationRange'),
    durationValue: $('#durationValue'),
    cardsToggle: $('#cardsToggle'),
    injuryToggle: $('#injuryToggle'),
    extraToggle: $('#extraToggle'),
    shootoutToggle: $('#shootoutToggle'),
    soundIntensity: $('#soundIntensity'),
    kickoffButton: $('#kickoffButton'),
    homeTeamBox: $('#homeTeamBox'),
    awayTeamBox: $('#awayTeamBox'),
    homeTeamName: $('#homeTeamName'),
    awayTeamName: $('#awayTeamName'),
    homeScore: $('#homeScore'),
    awayScore: $('#awayScore'),
    periodLabel: $('#periodLabel'),
    matchClock: $('#matchClock'),
    turnTeam: $('#turnTeam'),
    rollInstruction: $('#rollInstruction'),
    activePlayerCaption: $('#activePlayerCaption'),
    rollContextLabel: $('#rollContextLabel'),
    activePlayerName: $('#activePlayerName'),
    activePlayerMeta: $('#activePlayerMeta'),
    matchWatchDisplay: $('#matchWatchDisplay'),
    turnCountdown: $('#turnCountdown'),
    matchStopButton: $('#matchStopButton'),
    squadsButton: $('#squadsButton'),
    squadsOverlay: $('#squadsOverlay'),
    closeSquadsButton: $('#closeSquadsButton'),
    squadMatchTabs: $$('.squad-match-tab'),
    matchSquadList: $('#matchSquadList'),
    aiHint: $('#aiHint'),
    homeCorners: $('#homeCorners'),
    awayCorners: $('#awayCorners'),
    homeTimeouts: $('#homeTimeouts'),
    awayTimeouts: $('#awayTimeouts'),
    pauseButton: $('#pauseButton'),
    liveTimeline: $('#liveTimeline'),
    eventOverlay: $('#eventOverlay'),
    overlayKicker: $('#overlayKicker'),
    overlayTitle: $('#overlayTitle'),
    overlaySubtitle: $('#overlaySubtitle'),
    overlayProgressBar: $('#overlayProgressBar'),
    dialogOverlay: $('#dialogOverlay'),
    dialogEyebrow: $('#dialogEyebrow'),
    dialogTitle: $('#dialogTitle'),
    dialogText: $('#dialogText'),
    dialogButton: $('#dialogButton'),
    finalHomeName: $('#finalHomeName'),
    finalAwayName: $('#finalAwayName'),
    finalScore: $('#finalScore'),
    winnerText: $('#winnerText'),
    possessionResult: $('#possessionResult'),
    resultTimeline: $('#resultTimeline'),
    rematchButton: $('#rematchButton'),
    newGameButton: $('#newGameButton')
  };

  const setup = {
    mode: null,
    builder: 'random',
    side: 0,
    teams: [null, null],
    selectedPeriods: ['1996-2005'],
    manualSelected: new Set(),
    criteria: { nationality: '', league: '' }
  };

  let draft = null;
  let draftRaf = null;
  let match = null;
  let matchRaf = null;
  let aiTimer = null;
  let overlayTimer = null;
  let dialogAction = null;
  let audioContext = null;
  let muted = false;
  let remoteSnapshotAt = 0;
  let lastRemoteOverlayId = null;
  let remoteFinishedRendered = false;
  let remoteLoopRunning = false;
  let selectedSquadSide = 0;
  let halftimeDialogKey = null;

  const online = {
    socket: null,
    connected: false,
    code: null,
    side: null,
    token: null,
    name: '',
    lobby: null,
    joining: false
  };

  function isFriendMode() {
    return setup.mode === 'friend' || match?.mode === 'friend';
  }

  function showScreen(name) {
    els.screens.forEach(screen => screen.classList.toggle('active', screen.id === `screen-${name}`));
    document.body.classList.toggle('match-active', name === 'match');
    window.scrollTo({ top: 0, behavior: name === 'match' ? 'auto' : 'smooth' });
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function formatStopwatch(ms) {
    const safe = Math.max(0, ms || 0);
    const minutes = Math.floor(safe / 60000);
    const seconds = Math.floor((safe % 60000) / 1000);
    const hundredths = Math.floor((safe % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
  }

  function formatClock(ms) {
    const total = Math.max(0, Math.floor((ms || 0) / 1000));
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  }

  function digitFromMs(ms) {
    return Math.floor(Math.max(0, ms || 0) / 10) % 10;
  }

  function ensureAudio() {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) audioContext = new AudioCtx();
    }
    if (audioContext && audioContext.state === 'suspended') audioContext.resume().catch(() => {});
  }

  function soundGain() {
    const intensity = match?.settings?.soundIntensity || els.soundIntensity.value || 'medium';
    return intensity === 'low' ? 0.025 : intensity === 'high' ? 0.09 : 0.055;
  }

  function beep(kind) {
    if (muted) return;
    ensureAudio();
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const patterns = {
      click: [[520, .055]],
      whistle: [[950, .08], [720, .1]],
      goal: [[440, .08], [660, .1], [880, .18]],
      card: [[260, .11], [180, .12]],
      save: [[360, .09], [260, .14]]
    };
    let cursor = now;
    (patterns[kind] || patterns.click).forEach(([frequency, duration]) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = kind === 'goal' ? 'triangle' : 'square';
      oscillator.frequency.setValueAtTime(frequency, cursor);
      gain.gain.setValueAtTime(soundGain(), cursor);
      gain.gain.exponentialRampToValueAtTime(0.001, cursor + duration);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(cursor);
      oscillator.stop(cursor + duration);
      cursor += duration + .025;
    });
  }

  function applyTheme(theme) {
    const safeTheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = safeTheme;
    els.themeButton.textContent = safeTheme === 'dark' ? '☀' : '◐';
    els.themeButton.setAttribute('aria-label', safeTheme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç');
    try { localStorage.setItem(THEME_KEY, safeTheme); } catch (_) {}
  }

  function initializeTheme() {
    let saved = 'light';
    try { saved = localStorage.getItem(THEME_KEY) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); } catch (_) {}
    applyTheme(saved);
  }

  function initializeFilters() {
    els.periodChips.innerHTML = PERIODS.map(period => (
      `<button class="period-chip${setup.selectedPeriods.includes(period.id) ? ' active' : ''}" type="button" data-period="${period.id}">${period.label}</button>`
    )).join('');

    const nationalities = [...new Set(PLAYERS.map(player => player.nationality))].sort((a, b) => a.localeCompare(b, 'tr'));
    els.nationalitySelect.innerHTML = '<option value="">Tümü</option>' + nationalities.map(item => `<option>${escapeHtml(item)}</option>`).join('');

    const leagues = [...new Set(PLAYERS.flatMap(player => player.leagues))].sort((a, b) => a.localeCompare(b, 'tr'));
    els.leagueSelect.innerHTML = '<option value="">Tümü</option>' + leagues.map(item => `<option>${escapeHtml(item)}</option>`).join('');
  }

  function positionScore(slot, player) {
    if (slot === player.position) return 10;
    const groups = {
      GK: ['GK'],
      LB: ['LB', 'RB', 'CB'],
      RB: ['RB', 'LB', 'CB'],
      CB: ['CB', 'LB', 'RB', 'DM'],
      DM: ['DM', 'CM', 'CB'],
      CM: ['CM', 'DM', 'AM'],
      AM: ['AM', 'CM', 'LW', 'RW'],
      LW: ['LW', 'RW', 'AM', 'ST'],
      RW: ['RW', 'LW', 'AM', 'ST'],
      ST: ['ST', 'LW', 'RW', 'AM']
    };
    const index = (groups[slot] || []).indexOf(player.position);
    return index === -1 ? 0 : Math.max(1, 7 - index * 2);
  }

  function assignPlayersToSlots(selectedPlayers) {
    const remaining = [...selectedPlayers];
    const lineup = [];
    SLOTS.forEach(slot => {
      remaining.sort((a, b) => {
        const scoreDiff = positionScore(slot, b) - positionScore(slot, a);
        return scoreDiff || b.rating - a.rating;
      });
      let chosenIndex = remaining.findIndex(player => positionScore(slot, player) > 0);
      if (chosenIndex < 0) chosenIndex = 0;
      const [chosen] = remaining.splice(chosenIndex, 1);
      if (chosen) lineup.push({ ...chosen, slot });
    });
    return lineup;
  }

  function buildRandomLineup(source = PLAYERS) {
    const remaining = shuffle(uniqueById(source));
    const lineup = [];
    SLOTS.forEach(slot => {
      const ranked = remaining
        .map((player, index) => ({ player, index, score: positionScore(slot, player) }))
        .filter(entry => entry.score > 0)
        .sort((a, b) => b.score - a.score || Math.random() - .5);
      const top = ranked.slice(0, Math.min(8, ranked.length));
      const chosenEntry = randomItem(top.length ? top : remaining.map((player, index) => ({ player, index })));
      if (!chosenEntry) return;
      lineup.push({ ...chosenEntry.player, slot });
      remaining.splice(chosenEntry.index, 1);
    });
    return lineup;
  }

  function criteriaFilteredPlayers() {
    const periods = setup.selectedPeriods.map(id => PERIODS.find(period => period.id === id)).filter(Boolean);
    return PLAYERS.filter(player => {
      const periodMatch = periods.some(period => player.activeStart <= period.end && player.activeEnd >= period.start);
      const nationalityMatch = !setup.criteria.nationality || player.nationality === setup.criteria.nationality;
      const leagueMatch = !setup.criteria.league || player.leagues.includes(setup.criteria.league);
      return periodMatch && nationalityMatch && leagueMatch;
    });
  }

  function buildCriteriaPool() {
    let filtered = criteriaFilteredPlayers();
    if (filtered.length < 27) {
      const periods = setup.selectedPeriods.map(id => PERIODS.find(period => period.id === id)).filter(Boolean);
      const periodOnly = PLAYERS.filter(player => periods.some(period => player.activeStart <= period.end && player.activeEnd >= period.start));
      filtered = uniqueById([...filtered, ...shuffle(periodOnly), ...shuffle(PLAYERS)]);
    }
    const sorted = [...filtered].sort((a, b) => a.rating - b.rating);
    const stars = sorted.filter(player => player.rating >= 86).slice(-12);
    const nonStars = sorted.filter(player => !stars.some(star => star.id === player.id));
    const weak = shuffle(nonStars.slice(0, Math.ceil(nonStars.length / 2))).slice(0, 12);
    const strong = shuffle(nonStars.slice(Math.ceil(nonStars.length / 2))).slice(0, 12);
    const guaranteed = shuffle(stars).slice(0, 3);
    let pool = uniqueById([...weak, ...strong, ...guaranteed]);
    if (pool.length < 27) pool = uniqueById([...pool, ...shuffle(filtered)]).slice(0, 27);
    return pool.slice(0, 27);
  }

  function renderManualList() {
    const query = els.manualSearch.value.trim().toLocaleLowerCase('tr');
    const visible = PLAYERS
      .filter(player => !query || `${player.name} ${player.nationality} ${player.position}`.toLocaleLowerCase('tr').includes(query))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 80);
    els.manualPlayerList.innerHTML = visible.map(player => {
      const selected = setup.manualSelected.has(player.id);
      return `<label class="manual-player${selected ? ' selected' : ''}">
        <input type="checkbox" data-player-id="${player.id}" ${selected ? 'checked' : ''}>
        <span><strong>${escapeHtml(player.name)}</strong><small>${escapeHtml(player.position)} · ${escapeHtml(player.nationality)}</small></span>
        <b>${player.rating}</b>
      </label>`;
    }).join('');
    els.manualCount.textContent = `${setup.manualSelected.size} / 11`;
    els.manualBuildButton.disabled = setup.manualSelected.size !== 11;
  }

  function renderSetupState() {
    const side = setup.side;
    if (setup.mode === 'coop') els.setupTeamLabel.textContent = `TAKIM ${side + 1}`;
    else if (setup.mode === 'friend') els.setupTeamLabel.textContent = `UZAKTAN OYUNCU · ${side === 0 ? 'EV SAHİBİ' : 'MİSAFİR'}`;
    else els.setupTeamLabel.textContent = 'SENİN TAKIMIN';

    const fallbackName = setup.mode === 'friend'
      ? `${online.name || (side === 0 ? 'Ev Sahibi' : 'Misafir')} XI`
      : (side === 0 ? '90+ XI' : 'İkinci Takım');
    els.teamNameInput.value = setup.teams[side]?.name || fallbackName;
    const built = setup.teams[side];
    els.builtStatus.textContent = built ? `${built.lineup.length} oyuncu hazır` : 'Henüz kurulmadı';
    els.builtStatus.classList.toggle('done', Boolean(built));
    els.squadPreview.classList.toggle('hidden', !built);
    if (built) {
      els.squadPreview.innerHTML = `<h3>${escapeHtml(built.name)}</h3><ul class="lineup-list">${built.lineup.map(player => `<li><span><b>${player.slot}</b> ${escapeHtml(player.name)}</span><small>${player.rating}</small></li>`).join('')}</ul>`;
    }
    if (setup.mode === 'coop' && setup.side === 0 && built) {
      els.nextSetupButton.textContent = 'TAKIM 2’Yİ KUR →';
      els.nextSetupButton.classList.remove('hidden');
    } else if (setup.mode === 'friend' && built) {
      els.nextSetupButton.textContent = 'TAKIMI ODAYA GÖNDER →';
      els.nextSetupButton.classList.remove('hidden');
    } else if (built && (setup.mode === 'ai' || setup.side === 1)) {
      els.nextSetupButton.textContent = 'AYARLARA GEÇ →';
      els.nextSetupButton.classList.remove('hidden');
    } else {
      els.nextSetupButton.classList.add('hidden');
    }
  }

  function completeTeam(lineup) {
    const side = setup.side;
    const defaultName = setup.mode === 'friend'
      ? `${online.name || (side === 0 ? 'Ev Sahibi' : 'Misafir')} XI`
      : (side === 0 ? '90+ XI' : 'İkinci Takım');
    setup.teams[side] = {
      name: els.teamNameInput.value.trim() || defaultName,
      lineup: lineup.map(player => ({ ...player, yellowCards: 0, red: false, injured: false }))
    };
    if (setup.mode === 'ai' && side === 0 && !setup.teams[1]) {
      setup.teams[1] = {
        name: 'Retro Makine',
        lineup: buildRandomLineup().map(player => ({ ...player, yellowCards: 0, red: false, injured: false }))
      };
    }
    renderSetupState();
  }

  function candidateSetForSlot(slot, pool, usedIds) {
    const fromPool = shuffle(pool.filter(player => !usedIds.has(player.id) && positionScore(slot, player) > 0))
      .sort((a, b) => positionScore(slot, b) - positionScore(slot, a));
    const fallback = shuffle(PLAYERS.filter(player => !usedIds.has(player.id) && positionScore(slot, player) > 0));
    return uniqueById([...fromPool, ...fallback]).slice(0, 3);
  }

  function startDraft(pool) {
    draft = {
      pool,
      slotIndex: 0,
      lineup: [],
      candidates: [],
      elapsedMs: 0,
      lastFrame: performance.now(),
      running: true
    };
    showScreen('draft');
    prepareDraftSlot();
    runDraftLoop();
  }

  function prepareDraftSlot() {
    if (!draft) return;
    if (draft.slotIndex >= SLOTS.length) {
      cancelAnimationFrame(draftRaf);
      completeTeam(draft.lineup);
      draft = null;
      showScreen('squad');
      return;
    }
    const slot = SLOTS[draft.slotIndex];
    const used = new Set(draft.lineup.map(player => player.id));
    draft.candidates = candidateSetForSlot(slot, draft.pool, used);
    draft.elapsedMs = 0;
    draft.lastFrame = performance.now();
    draft.running = true;
    els.draftProgress.textContent = `${draft.slotIndex + 1} / 11 · ${slot}`;
    els.draftCandidates.innerHTML = draft.candidates.map((player, index) => `<article class="candidate-card" data-candidate-index="${index}">
      <span class="candidate-index">${index}</span>
      <strong>${escapeHtml(player.name)}</strong>
      <small>${escapeHtml(player.position)} · ${escapeHtml(player.nationality)}</small>
      <b>${player.rating}</b>
    </article>`).join('');
    els.draftWatchDisplay.textContent = formatStopwatch(0);
    els.draftStopButton.disabled = false;
  }

  function runDraftLoop() {
    cancelAnimationFrame(draftRaf);
    const loop = now => {
      if (!draft) return;
      if (draft.running) {
        const dt = clamp(now - draft.lastFrame, 0, 100);
        draft.elapsedMs += dt;
        draft.lastFrame = now;
        els.draftWatchDisplay.textContent = formatStopwatch(draft.elapsedMs);
      } else {
        draft.lastFrame = now;
      }
      draftRaf = requestAnimationFrame(loop);
    };
    draftRaf = requestAnimationFrame(loop);
  }

  function stopDraft() {
    if (!draft || !draft.running) return;
    draft.running = false;
    els.draftStopButton.disabled = true;
    beep('click');
    const digit = digitFromMs(draft.elapsedMs);
    const chosenIndex = digit % draft.candidates.length;
    const chosen = draft.candidates[chosenIndex];
    const slot = SLOTS[draft.slotIndex];
    const card = $(`[data-candidate-index="${chosenIndex}"]`);
    if (card) card.classList.add('chosen');
    draft.lineup.push({ ...chosen, slot });
    setTimeout(() => {
      if (!draft) return;
      draft.slotIndex += 1;
      prepareDraftSlot();
    }, 650);
  }

  function settingsFromUi() {
    return {
      durationMinutes: Number(els.durationRange.value),
      cards: els.cardsToggle.checked,
      injury: els.injuryToggle.checked,
      extraTime: els.extraToggle.checked,
      shootout: els.shootoutToggle.checked,
      soundIntensity: els.soundIntensity.value
    };
  }

  function makeRuntimeTeam(team) {
    return {
      name: team.name,
      lineup: team.lineup.map(player => ({ ...player, yellowCards: 0, red: false, injured: false, goals: 0, sentOffReason: null })),
      corners: 0,
      timeouts: 0
    };
  }

  function createMatch() {
    if (setup.mode === 'friend') {
      submitOnlineSettings();
      return;
    }
    const settings = settingsFromUi();
    const totalSeconds = settings.durationMinutes * 60;
    match = {
      version: 3,
      mode: setup.mode,
      teams: setup.teams.map(makeRuntimeTeam),
      settings,
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
      lastFrame: performance.now(),
      running: true,
      paused: false,
      resolving: false,
      awaitingPeriodStart: false,
      awaitingPeriodSide: null,
      periodStartKey: null,
      events: [],
      winnerSide: null,
      shootout: null
    };
    showScreen('match');
    els.remoteMatchBar.classList.add('hidden');
    updateMatchUi();
    startMatchLoop();
    scheduleAiIfNeeded();
    saveMatch();
  }

  function availableOutfield(side) {
    if (!match) return [];
    return match.teams[side].lineup.filter(player => player.slot !== 'GK' && !player.red && !player.injured);
  }

  function getPlayer(side, playerId) {
    return match?.teams?.[side]?.lineup.find(player => player.id === playerId) || null;
  }

  function currentActor() {
    if (!match) return null;
    const side = match.context.owner;
    return getPlayer(side, match.activePlayerId[side]);
  }

  function pickRestartPlayer(side, digit = Math.floor(Math.random() * 10)) {
    const candidates = availableOutfield(side);
    const chosen = Core.chooseByModulo(candidates, digit) || match.teams[side].lineup.find(player => player.slot === 'GK');
    match.activePlayerId[side] = chosen?.id || null;
    return chosen;
  }

  function mapActivePlayerFromDigit(digit) {
    if (!match || match.context.type !== 'playerSelect') return currentActor();
    const side = match.context.owner;
    const candidates = availableOutfield(side);
    const chosen = Core.chooseByModulo(candidates, digit);
    if (chosen) match.activePlayerId[side] = chosen.id;
    return chosen;
  }

  function isAiSide(side) {
    return match?.mode === 'ai' && side === 1;
  }

  function contextLabel() {
    if (!match) return 'OYUNCU SEÇİMİ';
    const labels = {
      playerSelect: 'OYUNCU SEÇİMİ',
      main: 'OLAY ATIŞI',
      foulResult: 'FAUL SONUCU',
      foulCard: 'KART ATIŞI',
      shot: match.context.reason === 'penalty' ? 'PENALTI' : 'FRİKİK',
      shootoutShot: 'SERİ PENALTI'
    };
    return labels[match.context.type] || 'ATIŞ';
  }

  function contextInstruction() {
    if (!match) return '';
    const actor = currentActor();
    const labels = {
      playerSelect: 'Kronometreyi durdur ve topla buluşacak oyuncuyu seç.',
      main: `${actor?.name || 'Seçilen oyuncu'} için olay sonucunu belirle.`,
      foulResult: 'Faulün frikik, penaltı veya serbest vuruş sonucunu belirle.',
      foulCard: 'Hakemin kart kararını belirle.',
      shot: 'Çift rakam gol, tek rakam kaleci kurtarışı.',
      shootoutShot: 'Çift rakam gol, tek rakam kurtarış.'
    };
    return labels[match.context.type] || 'Kronometreyi durdur.';
  }

  function stopButtonLabel() {
    if (!match) return 'DURDUR';
    const labels = {
      playerSelect: 'OYUNCUYU SEÇ',
      main: 'OLAYI BELİRLE',
      foulResult: 'FAUL SONUCUNU BELİRLE',
      foulCard: 'KARTI BELİRLE',
      shot: match.context.reason === 'penalty' ? 'PENALTIYI KULLAN' : 'FRİKİĞİ KULLAN',
      shootoutShot: 'PENALTIYI KULLAN'
    };
    return labels[match.context.type] || 'DURDUR';
  }

  function canStartWaitingPeriod() {
    if (!match?.awaitingPeriodStart) return false;
    if (match.mode === 'friend') return online.connected && online.side === match.awaitingPeriodSide;
    if (match.mode === 'ai') return !isAiSide(match.awaitingPeriodSide);
    return true;
  }

  function startWaitingPeriod() {
    if (!match?.awaitingPeriodStart) return;
    if (match.mode === 'friend') {
      if (!online.socket || !canStartWaitingPeriod()) return;
      els.dialogButton.disabled = true;
      online.socket.emit('match:startPeriod', {}, response => {
        if (!response?.ok) {
          els.dialogButton.disabled = false;
          els.dialogText.textContent = response?.error || 'Devre başlatılamadı.';
        }
      });
      return;
    }
    if (!canStartWaitingPeriod() && match.mode !== 'ai') return;
    const side = match.awaitingPeriodSide;
    match.awaitingPeriodStart = false;
    match.awaitingPeriodSide = null;
    match.paused = false;
    match.running = true;
    match.resolving = false;
    match.context = { type: 'playerSelect', owner: side };
    match.activeSide = side;
    match.activePlayerId[side] = null;
    match.rollElapsedMs = 0;
    match.turnElapsedMs = 0;
    match.lastFrame = performance.now();
    halftimeDialogKey = null;
    els.dialogOverlay.classList.add('hidden');
    scheduleAiIfNeeded();
    saveMatch();
  }

  function syncPeriodStartDialog() {
    if (!match?.awaitingPeriodStart) {
      if (halftimeDialogKey) {
        halftimeDialogKey = null;
        els.dialogOverlay.classList.add('hidden');
      }
      return;
    }
    const key = match.periodStartKey || `${match.phase}-${match.periodIndex}-${match.awaitingPeriodSide}`;
    if (halftimeDialogKey === key) return;
    halftimeDialogKey = key;
    const team = match.teams[match.awaitingPeriodSide]?.name || 'Takım';
    const secondHalf = match.phase === 'regulation' && match.periodIndex === 1;
    const title = secondHalf ? 'İKİNCİ DEVRE' : match.phase === 'extra' ? `UZATMA ${match.periodIndex + 1}` : 'DEVAM';
    const button = secondHalf ? 'İKİNCİ DEVREYİ BAŞLAT' : 'DEVREYİ BAŞLAT';
    openDialog(secondHalf ? 'DEVRE ARASI' : 'MAÇ DURDU', title, `${match.scores[0]} — ${match.scores[1]}. Başlama vuruşu ${team} takımında.`, button, startWaitingPeriod);
    const allowed = canStartWaitingPeriod();
    els.dialogButton.disabled = !allowed;
    els.dialogButton.textContent = allowed ? button : `${team.toLocaleUpperCase('tr')} BEKLENİYOR`;
    if (match.mode === 'ai' && isAiSide(match.awaitingPeriodSide)) {
      setTimeout(() => {
        if (match?.awaitingPeriodStart && match.periodStartKey === key) {
          const side = match.awaitingPeriodSide;
          match.awaitingPeriodStart = false;
          match.awaitingPeriodSide = null;
          match.paused = false;
          match.running = true;
          match.resolving = false;
          match.context = { type: 'playerSelect', owner: side };
          match.activeSide = side;
          match.activePlayerId[side] = null;
          match.rollElapsedMs = 0;
          match.turnElapsedMs = 0;
          match.lastFrame = performance.now();
          halftimeDialogKey = null;
          els.dialogOverlay.classList.add('hidden');
          scheduleAiIfNeeded();
        }
      }, 1500);
    }
  }

  function updateMatchUi() {
    if (!match || !match.teams?.[0] || !match.teams?.[1]) return;
    els.homeTeamName.textContent = match.teams[0].name;
    els.awayTeamName.textContent = match.teams[1].name;
    els.homeScore.textContent = match.scores[0];
    els.awayScore.textContent = match.scores[1];
    els.homeCorners.textContent = match.teams[0].corners;
    els.awayCorners.textContent = match.teams[1].corners;
    els.homeTimeouts.textContent = match.teams[0].timeouts;
    els.awayTimeouts.textContent = match.teams[1].timeouts;

    const remoteDelta = match.mode === 'friend' && match.running && !match.paused && !match.resolving
      ? clamp(performance.now() - remoteSnapshotAt, 0, 350)
      : 0;
    const displayRoll = match.rollElapsedMs + remoteDelta;
    const displayTurn = match.turnElapsedMs + remoteDelta;
    const displayPeriod = match.periodElapsedMs + (match.phase !== 'shootout' ? remoteDelta : 0);

    if (match.phase === 'shootout') {
      els.periodLabel.textContent = 'PENALTILAR';
      els.matchClock.textContent = `${match.shootout.scores[0]} — ${match.shootout.scores[1]}`;
    } else if (match.phase === 'finished') {
      els.periodLabel.textContent = 'MAÇ SONU';
      els.matchClock.textContent = formatClock(match.periodElapsedMs);
    } else {
      els.periodLabel.textContent = match.phase === 'extra'
        ? `UZATMA ${match.periodIndex + 1}`
        : `${match.periodIndex + 1}. DEVRE`;
      els.matchClock.textContent = formatClock(displayPeriod);
    }

    const owner = match.context.owner;
    els.homeTeamBox.classList.toggle('active-turn', owner === 0);
    els.awayTeamBox.classList.toggle('active-turn', owner === 1);
    els.turnTeam.textContent = match.teams[owner].name;
    els.rollContextLabel.textContent = contextLabel();
    els.rollInstruction.textContent = contextInstruction();
    els.matchStopButton.textContent = stopButtonLabel();
    const actor = currentActor();
    const selecting = match.context.type === 'playerSelect';
    els.activePlayerCaption.textContent = selecting ? 'SIRADAKİ OYUNCU' : 'TOPLA OYNAYAN';
    els.activePlayerName.textContent = selecting ? '—' : (actor?.name || '—');
    els.activePlayerMeta.textContent = selecting ? 'Kronometre belirleyecek' : (actor ? `${actor.slot} · ${actor.rating} puan` : '—');
    els.matchWatchDisplay.textContent = formatStopwatch(displayRoll);
    els.turnCountdown.textContent = Math.max(0, (10000 - displayTurn) / 1000).toFixed(1);

    const aiTurn = isAiSide(owner);
    const remoteTurn = match.mode === 'friend';
    const canRemoteStop = remoteTurn && online.connected && online.side === owner;
    els.matchStopButton.disabled = match.awaitingPeriodStart || (remoteTurn
      ? (!canRemoteStop || match.paused || match.resolving || !match.running)
      : (aiTurn || match.paused || match.resolving || !match.running));

    if (remoteTurn) {
      els.aiHint.textContent = online.side === owner ? 'Sıra sende — kronometreyi durdur.' : 'Rakibin kronometreyi kolluyor…';
      els.aiHint.classList.toggle('hidden', match.paused || match.resolving || !match.running || match.awaitingPeriodStart);
      els.remoteMatchBar.classList.remove('hidden');
      els.remoteRoomCode.textContent = online.code || '------';
      els.remoteConnectionText.textContent = online.connected ? (online.side === owner ? 'SIRA SENDE' : 'RAKİP OYNUYOR') : 'BAĞLANTI KESİLDİ';
      els.remoteConnectionText.classList.toggle('offline', !online.connected);
      els.pauseButton.disabled = online.side !== 0 || match.resolving || match.awaitingPeriodStart;
      els.pauseButton.title = online.side === 0 ? '' : 'Maçı yalnızca oda sahibi duraklatabilir.';
    } else {
      els.remoteMatchBar.classList.add('hidden');
      els.aiHint.textContent = selecting ? 'Rakip oyuncusunu seçiyor…' : 'Rakip olay sonucunu belirliyor…';
      els.aiHint.classList.toggle('hidden', !aiTurn || match.paused || match.resolving || match.awaitingPeriodStart);
      els.pauseButton.disabled = match.awaitingPeriodStart;
    }
    els.pauseButton.textContent = match.paused && !match.awaitingPeriodStart ? 'DEVAM ET' : 'DURAKLAT';
    renderLiveTimeline();
    syncPeriodStartDialog();
    if (!els.squadsOverlay.classList.contains('hidden')) renderMatchSquad();
  }

  function eventIcon(event) {
    const icons = { goal: '⚽', yellow: '▰', red: '■', secondYellow: '▰', foul: '!', corner: '⌜', throwIn: '↗', turnover: '×', save: '✋', timeout: '⏱', player: '●', pass: '→', freeKick: '★', penalty: '●' };
    return icons[event.type] || '•';
  }

  function renderLiveTimeline() {
    if (!match) return;
    const items = match.events.slice(-5).reverse();
    els.liveTimeline.innerHTML = items.map(event => `<li><time>${event.minute}’</time><span><b>${eventIcon(event)}</b> ${escapeHtml(event.text)}</span></li>`).join('');
  }

  function addEvent(text, important = false, meta = {}) {
    if (!match) return;
    match.events.push({ minute: eventMinute(), text, important, timestamp: Date.now(), type: meta.type || 'event', side: Number.isInteger(meta.side) ? meta.side : null, playerId: meta.playerId || null, title: meta.title || text, detail: meta.detail || '' });
    if (match.events.length > 160) match.events.shift();
    renderLiveTimeline();
  }

  function renderMatchSquad() {
    if (!match?.teams?.[selectedSquadSide]) return;
    const team = match.teams[selectedSquadSide];
    els.squadMatchTabs.forEach(tab => {
      tab.classList.toggle('active', Number(tab.dataset.side) === selectedSquadSide);
      tab.textContent = match.teams[Number(tab.dataset.side)]?.name || `TAKIM ${Number(tab.dataset.side) + 1}`;
    });
    els.matchSquadList.innerHTML = team.lineup.map(player => {
      const secondYellow = player.sentOffReason === 'secondYellow';
      const card = secondYellow ? '<i class="card-icon double-card" title="İkinci sarıdan kırmızı"></i>' : player.red ? '<i class="card-icon red-card" title="Kırmızı kart"></i>' : player.yellowCards ? `<i class="card-icon yellow-card" title="${player.yellowCards} sarı kart"></i>` : '';
      const goals = player.goals ? `<span class="goal-count">⚽ ${player.goals}</span>` : '';
      const injury = player.injured ? '<span class="injury-icon" title="Sakat">✚</span>' : '';
      return `<div class="match-player-row${player.red || player.injured ? ' dismissed' : ''}"><span class="player-slot-badge">${escapeHtml(player.slot)}</span><div class="match-player-info"><strong>${escapeHtml(player.name)}</strong><small>${escapeHtml(player.nationality)} · ${player.rating} puan${secondYellow ? ' · 2. sarıdan atıldı' : player.sentOffReason === 'directRed' ? ' · direkt kırmızı' : player.sentOffReason === 'timeoutRed' ? ' · süre ihlali kırmızısı' : player.injured ? ' · sakatlandı' : ''}</small></div><div class="player-statuses">${goals}${card}${injury}</div></div>`;
    }).join('');
  }

  function eventMinute() {
    if (!match) return 1;
    if (match.phase === 'shootout') return 'P';
    const elapsed = match.phase === 'extra' ? match.periodElapsedMs + match.periodIndex * match.periodDurationsMs[0] : match.totalElapsedMs;
    return Core.matchMinute(elapsed / 1000, match.regulationSeconds, match.phase === 'extra' ? 'extra' : 'regulation');
  }

  function addEvent(text, important = false) {
    if (!match) return;
    match.events.push({ minute: eventMinute(), text, important, timestamp: Date.now() });
    if (match.events.length > 120) match.events.shift();
    renderLiveTimeline();
  }

  function clearAiTimer() {
    if (aiTimer) clearTimeout(aiTimer);
    aiTimer = null;
  }

  function scheduleAiIfNeeded() {
    clearAiTimer();
    if (!match || !match.running || match.paused || match.resolving) return;
    const side = match.context.owner;
    if (!isAiSide(side)) return;
    const delay = 1500 + Math.random() * 2500;
    aiTimer = setTimeout(() => {
      if (match && match.running && !match.paused && !match.resolving && match.context.owner === side) stopMatchRoll('ai');
    }, delay);
  }

  function startMatchLoop() {
    cancelAnimationFrame(matchRaf);
    if (!match) return;
    if (match.mode === 'friend') {
      remoteLoopRunning = true;
      const remoteLoop = () => {
        if (!match || match.mode !== 'friend') { remoteLoopRunning = false; return; }
        updateMatchUi();
        matchRaf = requestAnimationFrame(remoteLoop);
      };
      matchRaf = requestAnimationFrame(remoteLoop);
      return;
    }
    match.lastFrame = performance.now();
    const loop = now => {
      if (!match) return;
      const dt = clamp(now - match.lastFrame, 0, 100);
      match.lastFrame = now;
      if (match.running && !match.paused && !match.resolving && !match.awaitingPeriodStart) {
        match.rollElapsedMs += dt;
        match.turnElapsedMs += dt;
        if (match.phase !== 'shootout') {
          match.periodElapsedMs += dt;
          match.totalElapsedMs += match.phase === 'regulation' ? dt : 0;
          match.possessionMs[match.context.owner] += dt;
        }
        if (match.turnElapsedMs >= 10000) {
          handleTurnTimeout();
        } else if (match.phase !== 'shootout' && match.periodElapsedMs >= match.periodDurationsMs[match.periodIndex]) {
          endCurrentPeriod();
        }
        updateMatchUi();
      }
      matchRaf = requestAnimationFrame(loop);
    };
    matchRaf = requestAnimationFrame(loop);
  }

  function resetRoll(owner, context) {
    if (!match || match.mode === 'friend') return;
    match.activeSide = owner;
    match.context = { ...context, owner };
    match.rollElapsedMs = 0;
    match.turnElapsedMs = 0;
    match.resolving = false;
    match.running = true;
    match.paused = false;
    if (context.type === 'playerSelect') match.activePlayerId[owner] = null;
    if (['foulResult', 'foulCard', 'shot', 'shootoutShot'].includes(context.type) && !match.activePlayerId[owner]) pickRestartPlayer(owner);
    updateMatchUi();
    scheduleAiIfNeeded();
    saveMatch();
  }

  function showEventOverlay(title, subtitle, tone = 'red', kicker = '', duration = 1900, callback) {
    clearTimeout(overlayTimer);
    const readableDuration = Math.max(1500, Number(duration) || 1900);
    els.eventOverlay.className = `event-overlay ${tone}`;
    els.eventOverlay.classList.remove('hidden');
    els.overlayTitle.textContent = title;
    els.overlaySubtitle.textContent = subtitle || '';
    els.overlayKicker.textContent = kicker || '';
    els.overlayProgressBar.style.animation = 'none';
    void els.overlayProgressBar.offsetWidth;
    els.overlayProgressBar.style.animation = `overlayDrain ${readableDuration}ms linear forwards`;
    overlayTimer = setTimeout(() => {
      els.eventOverlay.classList.add('hidden');
      if (typeof callback === 'function') callback();
    }, readableDuration);
  }

  function transitionTo(owner, context, overlay) {
    if (!match) return;
    clearAiTimer();
    match.running = false;
    match.resolving = true;
    const done = () => resetRoll(owner, context);
    if (overlay) {
      showEventOverlay(overlay.title, overlay.subtitle, overlay.tone, overlay.kicker, overlay.duration || 900, done);
    } else {
      done();
    }
  }

  function stopMatchRoll(source) {
    if (!match || !match.running || match.paused || match.resolving) return;
    if (match.mode === 'friend') {
      if (!online.socket || !online.connected || online.side !== match.context.owner) return;
      const elapsed = match.rollElapsedMs + clamp(performance.now() - remoteSnapshotAt, 0, 350);
      const digit = digitFromMs(elapsed);
      els.matchStopButton.disabled = true;
      beep('click');
      online.socket.emit('match:stop', { digit }, response => {
        if (!response?.ok) {
          setOnlineStatus(response?.error || 'Atış gönderilemedi.', 'error');
          updateMatchUi();
        }
      });
      return;
    }
    if (source !== 'ai' && isAiSide(match.context.owner)) return;
    clearAiTimer();
    beep('click');
    const digit = digitFromMs(match.rollElapsedMs);
    match.running = false;
    match.resolving = true;
    resolveRoll(digit);
  }

  function resolveRoll(digit) {
    const type = match.context.type;
    if (type === 'playerSelect') resolvePlayerSelection(digit);
    else if (type === 'main') resolveMainEvent(digit);
    else if (type === 'foulResult') resolveFoulResult(digit);
    else if (type === 'foulCard') resolveFoulCard(digit);
    else if (type === 'shot') resolveShot(digit);
    else if (type === 'shootoutShot') resolveShootoutShot(digit);
  }

  function resolvePlayerSelection(digit) {
    const side = match.context.owner;
    const chosen = mapActivePlayerFromDigit(digit) || pickRestartPlayer(side, digit);
    addEvent(`${match.teams[side].name}: ${chosen?.name || 'Oyuncu'} topla buluştu`, false, { type: 'player', side, playerId: chosen?.id, title: chosen?.name || 'Oyuncu', detail: 'Topla buluştu' });
    transitionTo(side, { type: 'main' }, { title: chosen?.name || 'OYUNCU', subtitle: 'Şimdi olay sonucunu belirle', tone: 'navy', kicker: `Rakam ${digit} · ${chosen?.slot || ''}`, duration: 1700 });
  }

  function resolveMainEvent(digit) {
    const side = match.context.owner;
    const other = side === 0 ? 1 : 0;
    const actor = currentActor() || pickRestartPlayer(side, digit);
    const event = Core.mainEventForDigit(digit);

    if (event.key === 'goal') {
      match.scores[side] += 1;
      if (actor) actor.goals = (Number(actor.goals) || 0) + 1;
      addEvent(`${actor?.name || match.teams[side].name} gol attı`, true, { type: 'goal', side, playerId: actor?.id, title: actor?.name || match.teams[side].name, detail: 'Gol' });
      beep('goal');
      transitionTo(other, { type: 'playerSelect' }, {
        title: 'GOL!', subtitle: `${actor?.name || match.teams[side].name} ağları buldu`, tone: 'red', kicker: `Rakam ${digit}`, duration: 2600
      });
      return;
    }

    if (event.key === 'pass') {
      addEvent(`${actor?.name || 'Oyuncu'} pas yaptı`, false, { type: 'pass', side, playerId: actor?.id, title: actor?.name || 'Oyuncu', detail: 'Pas' });
      transitionTo(side, { type: 'playerSelect' }, {
        title: 'PAS', subtitle: 'Yeni pasın hedefini seç', tone: 'green', kicker: `${actor?.name || 'Oyuncu'} · Rakam ${digit}`, duration: 1700
      });
      return;
    }

    if (event.key === 'throwIn') {
      addEvent(`${match.teams[other].name} taç kazandı`, false, { type: 'throwIn', side: other, title: 'Taç', detail: match.teams[other].name });
      transitionTo(other, { type: 'playerSelect' }, { title: 'TAÇ', subtitle: `Top ${match.teams[other].name} tarafında`, tone: 'navy', kicker: `Rakam ${digit}`, duration: 1800 });
      return;
    }

    if (event.key === 'turnover') {
      addEvent(`${actor?.name || match.teams[side].name} topu kaybetti`, false, { type: 'turnover', side, playerId: actor?.id, title: actor?.name || match.teams[side].name, detail: 'Top kaybı' });
      transitionTo(other, { type: 'playerSelect' }, { title: 'AUT', subtitle: `Sıra ${match.teams[other].name} takımında`, tone: 'navy', kicker: `Rakam ${digit}`, duration: 1800 });
      return;
    }

    if (event.key === 'corner') {
      const outcome = Core.registerCorner(match.teams[side].corners);
      match.teams[side].corners = outcome.corners;
      if (outcome.penalty) {
        addEvent(`${match.teams[side].name}: 3. kornerden penaltı`, true, { type: 'penalty', side, title: 'Penaltı', detail: '3. korner' });
        beep('whistle');
        transitionTo(side, { type: 'shot', reason: 'penalty' }, { title: 'PENALTI!', subtitle: 'Üç korner, bir beyaz nokta', tone: 'yellow', kicker: '3. KORNER', duration: 2300 });
      } else {
        addEvent(`${match.teams[side].name} korner kazandı (${outcome.corners}/3)`, false, { type: 'corner', side, title: 'Korner', detail: `${outcome.corners}/3` });
        transitionTo(side, { type: 'playerSelect' }, { title: 'KORNER', subtitle: `${outcome.corners} / 3 · Yeni oyuncuyu seç`, tone: 'green', kicker: `Rakam ${digit}`, duration: 1800 });
      }
      return;
    }

    if (event.key === 'foul') {
      match.pendingFoul = { foulerSide: side, victimSide: other, foulerId: actor?.id || null, result: null };
      addEvent(`${actor?.name || match.teams[side].name} faul yaptı`, true, { type: 'foul', side, playerId: actor?.id, title: actor?.name || match.teams[side].name, detail: 'Faul' });
      beep('whistle');
      pickRestartPlayer(other);
      transitionTo(other, { type: 'foulResult' }, { title: 'FAUL!', subtitle: `${match.teams[other].name} sonuç atışını kullanacak`, tone: 'yellow', kicker: `Rakam ${digit}`, duration: 2200 });
      return;
    }

    if (event.key === 'freeKick') {
      addEvent(`${match.teams[side].name} frikik kazandı`, true, { type: 'freeKick', side, playerId: actor?.id, title: actor?.name || match.teams[side].name, detail: 'Frikik' });
      beep('whistle');
      transitionTo(side, { type: 'shot', reason: 'freeKick' }, { title: 'FRİKİK!', subtitle: 'Tek rakam kurtarış, çift rakam gol', tone: 'yellow', kicker: `Rakam ${digit}`, duration: 2100 });
    }
  }

  function resolveFoulResult(digit) {
    const foul = match.pendingFoul;
    if (!foul) {
      transitionTo(match.context.owner, { type: 'playerSelect' });
      return;
    }
    foul.result = Core.foulResultForDigit(digit);
    const labels = { freeKick: 'FRİKİK', penalty: 'PENALTI', indirect: 'SERBEST VURUŞ' };
    addEvent(`Faul sonucu: ${labels[foul.result]}`, false, { type: foul.result === 'penalty' ? 'penalty' : 'freeKick', side: foul.victimSide, title: labels[foul.result], detail: 'Faul sonucu' });
    if (match.settings.cards) {
      transitionTo(foul.victimSide, { type: 'foulCard' }, { title: labels[foul.result], subtitle: 'Şimdi kart atışı', tone: foul.result === 'penalty' ? 'yellow' : 'navy', kicker: `Rakam ${digit}`, duration: 1900 });
    } else {
      continueAfterFoulCard(null, digit);
    }
  }

  function markPlayerUnavailable(side, playerId, reason) {
    const index = match.teams[side].lineup.findIndex(player => player.id === playerId);
    if (index < 0) return null;
    const player = match.teams[side].lineup[index];
    match.teams[side].lineup[index] = { ...player, [reason]: true };
    return match.teams[side].lineup[index];
  }

  function resolveFoulCard(digit) {
    const foul = match.pendingFoul;
    if (!foul) {
      transitionTo(match.context.owner, { type: 'playerSelect' });
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
      if (card === 'yellow') {
        addEvent(`${after.name} ${after.red ? 'ikinci sarıdan kırmızı gördü' : 'sarı kart gördü'}`, true, { type: after.red ? 'secondYellow' : 'yellow', side: foul.foulerSide, playerId: after.id, title: after.name, detail: after.red ? 'İkinci sarıdan kırmızı' : 'Sarı kart' });
      } else if (card === 'red') {
        addEvent(`${after.name} direkt kırmızı kart gördü`, true, { type: 'red', side: foul.foulerSide, playerId: after.id, title: after.name, detail: 'Direkt kırmızı kart' });
      }
    }

    if (match.settings.injury && Math.random() < .10) {
      const victims = availableOutfield(foul.victimSide);
      const injured = randomItem(victims);
      if (injured) {
        markPlayerUnavailable(foul.victimSide, injured.id, 'injured');
        addEvent(`${injured.name} sakatlandı ve oyundan çıktı`, true, { type: 'injury', side: foul.victimSide, playerId: injured.id, title: injured.name, detail: 'Sakatlık' });
      }
    }

    const cardTitle = card === 'yellow' ? (cardedPlayer?.red ? 'KIRMIZI!' : 'SARI KART') : card === 'red' ? 'KIRMIZI!' : 'KART YOK';
    const tone = card === 'yellow' ? 'yellow' : card === 'red' ? 'red' : 'green';
    if (card !== 'none') beep('card');
    continueAfterFoulCard({ title: cardTitle, subtitle: cardedPlayer?.name || 'Hakem devam dedi', tone, kicker: `Rakam ${digit}`, duration: 2300 }, digit);
  }

  function continueAfterFoulCard(cardOverlay) {
    const foul = match.pendingFoul;
    if (!foul) {
      transitionTo(match.context.owner, { type: 'playerSelect' }, cardOverlay);
      return;
    }
    const owner = foul.victimSide;
    const result = foul.result;
    match.pendingFoul = null;
    if (result === 'freeKick' || result === 'penalty') {
      transitionTo(owner, { type: 'shot', reason: result }, cardOverlay || { title: result === 'penalty' ? 'PENALTI' : 'FRİKİK', subtitle: 'Final atışı', tone: 'yellow' });
    } else {
      pickRestartPlayer(owner);
      transitionTo(owner, { type: 'playerSelect' }, cardOverlay || { title: 'SERBEST', subtitle: `${match.teams[owner].name} yeni oyuncuyu seçiyor`, tone: 'green', duration: 1900 });
    }
  }

  function resolveShot(digit) {
    const side = match.context.owner;
    const other = side === 0 ? 1 : 0;
    const reason = match.context.reason;
    const result = Core.shotForDigit(digit);
    const actor = currentActor() || pickRestartPlayer(side);
    if (result === 'goal') {
      match.scores[side] += 1;
      if (actor) actor.goals = (Number(actor.goals) || 0) + 1;
      addEvent(`${actor?.name || match.teams[side].name} ${reason === 'penalty' ? 'penaltıdan' : 'frikikten'} gol attı`, true, { type: 'goal', side, playerId: actor?.id, title: actor?.name || match.teams[side].name, detail: reason === 'penalty' ? 'Penaltı golü' : 'Frikik golü' });
      beep('goal');
      transitionTo(other, { type: 'playerSelect' }, { title: 'GOL!', subtitle: `${actor?.name || match.teams[side].name} çift rakamı buldu`, tone: 'red', kicker: `Rakam ${digit} · ÇİFT`, duration: 2600 });
    } else {
      addEvent(`${reason === 'penalty' ? 'Penaltı' : 'Frikik'} kurtarıldı`, true, { type: 'save', side, playerId: actor?.id, title: actor?.name || match.teams[side].name, detail: 'Kaleci kurtardı' });
      beep('save');
      transitionTo(other, { type: 'playerSelect' }, { title: 'KURTARDI!', subtitle: 'Tek rakam kaleciden yana', tone: 'navy', kicker: `Rakam ${digit} · TEK`, duration: 2300 });
    }
  }

  function handleTurnTimeout() {
    if (!match || match.resolving) return;
    clearAiTimer();
    match.running = false;
    match.resolving = true;
    const side = match.context.owner;
    const other = side === 0 ? 1 : 0;
    const outcome = Core.registerTimeout(match.teams[side].timeouts);
    match.teams[side].timeouts = outcome.count;
    addEvent(`${match.teams[side].name}: 10 saniye ihlali (${outcome.count})`, true, { type: 'timeout', side, title: 'Süre ihlali', detail: `${outcome.count}. ihlal` });

    if (outcome.consequence === 'turnover') {
      transitionTo(other, { type: 'playerSelect' }, { title: 'SÜRE DOLDU', subtitle: 'Top rakibe geçti', tone: 'navy', kicker: `${outcome.count}. İHLAL`, duration: 1900 });
    } else if (outcome.consequence === 'penaltyAgainst') {
      pickRestartPlayer(other);
      transitionTo(other, { type: 'shot', reason: 'penalty' }, { title: 'PENALTI!', subtitle: 'Üçüncü vakit ihlali', tone: 'yellow', kicker: '3. İHLAL', duration: 2300 });
    } else if (outcome.consequence === 'redCard') {
      const actor = currentActor() || randomItem(availableOutfield(side));
      if (actor) { markPlayerUnavailable(side, actor.id, 'red'); actor.sentOffReason = 'timeoutRed'; }
      addEvent(`${actor?.name || match.teams[side].name} vakit ihlalinden kırmızı kart gördü`, true, { type: 'red', side, playerId: actor?.id, title: actor?.name || match.teams[side].name, detail: 'Süre ihlali kırmızısı' });
      beep('card');
      transitionTo(other, { type: 'playerSelect' }, { title: 'KIRMIZI!', subtitle: 'Dördüncü vakit ihlali', tone: 'red', kicker: '4. İHLAL', duration: 2400 });
    } else {
      match.scores = Core.forfeitScore(match.scores, side);
      addEvent(`${match.teams[side].name} hükmen mağlup`, true);
      showEventOverlay('HÜKMEN!', 'Beşinci vakit ihlali — maç bitti', 'red', '5. İHLAL', 2800, () => finishMatch(other));
    }
  }

  function preparePeriodStart(side, phase, periodIndex) {
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
    match.periodStartKey = `${phase}-${periodIndex}-${Date.now()}`;
    updateMatchUi();
    saveMatch();
  }

  function endCurrentPeriod() {
    if (!match || match.resolving || match.phase === 'shootout' || match.awaitingPeriodStart) return;
    clearAiTimer();
    match.running = false;
    match.resolving = false;
    const phase = match.phase;
    const index = match.periodIndex;

    if (index === 0) {
      preparePeriodStart(1, phase, 1);
      return;
    }

    if (phase === 'regulation' && match.scores[0] === match.scores[1] && match.settings.extraTime) {
      const extraTotal = Core.roundExtraTimeSeconds(match.regulationSeconds) * 1000;
      match.periodDurationsMs = [extraTotal / 2, extraTotal / 2];
      preparePeriodStart(0, 'extra', 0);
      return;
    }

    if (match.scores[0] === match.scores[1] && match.settings.shootout) {
      startShootout();
    } else {
      finishMatch(match.scores[0] === match.scores[1] ? null : (match.scores[0] > match.scores[1] ? 0 : 1));
    }
  }

  function openDialog(eyebrow, title, text, buttonText, action) {
    els.dialogEyebrow.textContent = eyebrow;
    els.dialogTitle.textContent = title;
    els.dialogText.textContent = text;
    els.dialogButton.textContent = buttonText;
    els.dialogButton.disabled = false;
    els.dialogOverlay.classList.remove('hidden');
    dialogAction = action;
  }

  function closeDialog() {
    els.dialogOverlay.classList.add('hidden');
    const action = dialogAction;
    dialogAction = null;
    if (action) action();
  }

  function startShootout() {
    clearAiTimer();
    match.phase = 'shootout';
    match.shootout = { scores: [0, 0], kicks: [0, 0] };
    pickRestartPlayer(0);
    openDialog('BERABERLİK', 'SERİ PENALTI', 'Beşer vuruş. Çift rakam gol, tek rakam kurtarış.', 'İLK VURUŞ', () => {
      resetRoll(0, { type: 'shootoutShot' });
    });
  }

  function shootoutWinner() {
    const shootout = match.shootout;
    const [s0, s1] = shootout.scores;
    const [k0, k1] = shootout.kicks;
    const remaining0 = Math.max(0, 5 - k0);
    const remaining1 = Math.max(0, 5 - k1);
    if (s0 > s1 + remaining1) return 0;
    if (s1 > s0 + remaining0) return 1;
    if (k0 >= 5 && k1 >= 5 && k0 === k1 && s0 !== s1) return s0 > s1 ? 0 : 1;
    return null;
  }

  function resolveShootoutShot(digit) {
    const side = match.context.owner;
    const result = Core.shotForDigit(digit);
    match.shootout.kicks[side] += 1;
    if (result === 'goal') match.shootout.scores[side] += 1;
    addEvent(`${match.teams[side].name} seri penaltı: ${result === 'goal' ? 'GOL' : 'KAÇTI'}`, true);
    result === 'goal' ? beep('goal') : beep('save');

    const winner = shootoutWinner();
    if (winner !== null) {
      showEventOverlay('BİTTİ!', `${match.teams[winner].name} penaltılarla kazandı`, 'red', `${match.shootout.scores[0]} — ${match.shootout.scores[1]}`, 1300, () => finishMatch(winner));
      return;
    }

    const next = side === 0 ? 1 : 0;
    pickRestartPlayer(next);
    transitionTo(next, { type: 'shootoutShot' }, {
      title: result === 'goal' ? 'GOL' : 'KURTARDI',
      subtitle: `Seri: ${match.shootout.scores[0]} — ${match.shootout.scores[1]}`,
      tone: result === 'goal' ? 'red' : 'navy',
      kicker: `Rakam ${digit}`,
      duration: 850
    });
  }

  function pauseMatch() {
    if (!match || match.resolving || match.awaitingPeriodStart) return;
    if (match.mode === 'friend') {
      if (!online.socket || online.side !== 0) return;
      online.socket.emit('match:pause', {}, response => {
        if (!response?.ok) setOnlineStatus(response?.error || 'Maç duraklatılamadı.', 'error');
      });
      return;
    }
    if (match.paused) {
      match.paused = false;
      match.running = true;
      match.lastFrame = performance.now();
      scheduleAiIfNeeded();
    } else {
      match.paused = true;
      match.running = false;
      clearAiTimer();
    }
    updateMatchUi();
    saveMatch();
  }

  function saveMatch() {
    if (!match || match.mode === 'friend') return;
    try {
      const snapshot = JSON.parse(JSON.stringify(match));
      snapshot.running = false;
      snapshot.paused = true;
      snapshot.resolving = false;
      snapshot.lastFrame = 0;
      localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
      els.continueButton.classList.remove('hidden');
    } catch (_) {}
  }

  function restoreMatch() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      match = JSON.parse(raw);
      if (match.mode === 'friend') {
        localStorage.removeItem(SAVE_KEY);
        return;
      }
      match.running = false;
      match.paused = true;
      match.resolving = false;
      match.lastFrame = performance.now();
      showScreen('match');
      updateMatchUi();
      startMatchLoop();
      openDialog('KAYITLI MAÇ', 'YENİDEN SAHADA', 'Maç duraklatılmış noktadan devam edecek.', 'DEVAM ET', () => {
        match.paused = false;
        match.running = true;
        match.lastFrame = performance.now();
        scheduleAiIfNeeded();
        updateMatchUi();
      });
    } catch (_) {
      localStorage.removeItem(SAVE_KEY);
    }
  }

  function resultEventMarkup(event, sideClass) {
    const type = event.type || 'event';
    let icon = eventIcon(event);
    if (type === 'yellow') icon = '🟨';
    if (type === 'red') icon = '🟥';
    if (type === 'secondYellow') icon = '🟨🟥';
    const title = event.title || event.text || 'Maç olayı';
    const detail = event.detail || (event.title && event.text !== event.title ? event.text : '');
    return `<div class="timeline-event ${sideClass}"><span class="timeline-icon">${icon}</span><div><strong>${escapeHtml(title)}</strong>${detail ? `<small>${escapeHtml(detail)}</small>` : ''}</div></div>`;
  }

  function renderResultTimeline() {
    const hiddenTypes = new Set(['player', 'pass']);
    const events = (match.events || []).filter(event => !hiddenTypes.has(event.type));
    if (!events.length) {
      els.resultTimeline.innerHTML = '<li><div class="timeline-event center"><span class="timeline-icon">•</span><div><strong>Sakin maç</strong><small>Kronometre bile şaşırdı.</small></div></div></li>';
      return;
    }
    els.resultTimeline.innerHTML = events.map(event => {
      const minute = `<span class="timeline-minute">${escapeHtml(event.minute)}’</span>`;
      if (event.side === 0) return `<li>${resultEventMarkup(event, 'home')}${minute}<span></span></li>`;
      if (event.side === 1) return `<li><span></span>${minute}${resultEventMarkup(event, 'away')}</li>`;
      return `<li>${minute}${resultEventMarkup(event, 'center')}</li>`;
    }).join('');
  }

  function finishMatch(winnerSide) {
    clearAiTimer();
    cancelAnimationFrame(matchRaf);
    remoteLoopRunning = false;
    halftimeDialogKey = null;
    els.dialogOverlay.classList.add('hidden');
    if (!match) return;
    match.running = false;
    match.paused = true;
    match.phase = 'finished';
    match.winnerSide = winnerSide;
    if (match.mode !== 'friend') {
      localStorage.removeItem(SAVE_KEY);
      els.continueButton.classList.add('hidden');
    }

    els.finalHomeName.textContent = match.teams[0].name;
    els.finalAwayName.textContent = match.teams[1].name;
    const shootoutSuffix = match.shootout ? ` (P: ${match.shootout.scores[0]}–${match.shootout.scores[1]})` : '';
    els.finalScore.textContent = `${match.scores[0]} — ${match.scores[1]}${shootoutSuffix}`;
    els.winnerText.textContent = winnerSide === null ? 'BERABERE' : `${match.teams[winnerSide].name} KAZANDI`;
    const possession = Core.possessionPercent(match.possessionMs);
    els.possessionResult.textContent = `${possession[0]}% — ${possession[1]}%`;
    renderResultTimeline();
    els.rematchButton.textContent = match.mode === 'friend' ? (online.side === 0 ? 'RÖVANŞI BAŞLAT' : 'RÖVANŞI BEKLE') : 'RÖVANŞ';
    els.rematchButton.disabled = match.mode === 'friend' && online.side !== 0;
    showScreen('results');
  }

  function resetSetup(full = true) {
    if (full) {
      setup.mode = null;
      setup.teams = [null, null];
    }
    setup.side = 0;
    setup.builder = 'random';
    setup.manualSelected.clear();
    setup.selectedPeriods = ['1996-2005'];
    setup.criteria = { nationality: '', league: '' };
    els.nationalitySelect.value = '';
    els.leagueSelect.value = '';
    els.manualSearch.value = '';
    initializeFilters();
    renderManualList();
    switchBuilder('random');
    renderSetupState();
  }

  function switchBuilder(builder) {
    setup.builder = builder;
    els.builderTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.builder === builder));
    $$('.builder-panel').forEach(panel => panel.classList.toggle('active', panel.id === `builder-${builder}`));
    if (builder === 'manual') renderManualList();
  }

  function handleBack(target) {
    if (target === 'home') showScreen('home');
    else if (target === 'mode') {
      if (setup.mode === 'friend' && online.code) leaveOnlineRoom();
      else showScreen('mode');
    } else if (target === 'squad') showScreen('squad');
  }

  function initializeOnlineToken() {
    try {
      let token = localStorage.getItem(ONLINE_TOKEN_KEY);
      if (!token) {
        token = (window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);
        localStorage.setItem(ONLINE_TOKEN_KEY, token);
      }
      online.token = token;
    } catch (_) {
      online.token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
  }

  function setOnlineStatus(message, tone = '') {
    els.onlineStatus.textContent = message;
    els.onlineStatus.classList.remove('error', 'success');
    if (tone) els.onlineStatus.classList.add(tone);
  }

  function loadSocketClient() {
    if (window.io) return Promise.resolve();
    if (location.protocol === 'file:') {
      return Promise.reject(new Error('Arkadaş modu için oyunu npm start ile sunucu üzerinden açmalısın.'));
    }
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-socket-client]');
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', () => reject(new Error('Socket istemcisi yüklenemedi.')), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = '/socket.io/socket.io.js';
      script.dataset.socketClient = 'true';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Online sunucuya ulaşılamadı.'));
      document.head.appendChild(script);
    });
  }

  async function connectOnline() {
    initializeOnlineToken();
    await loadSocketClient();
    if (online.socket) {
      if (!online.socket.connected) online.socket.connect();
      return online.socket;
    }

    const socket = window.io({ autoConnect: true, reconnection: true, reconnectionAttempts: 12 });
    online.socket = socket;

    socket.on('connect', () => {
      online.connected = true;
      els.networkBadge.classList.remove('hidden');
      els.networkBadge.textContent = 'ÇEVRİMİÇİ';
      if (match?.mode === 'friend') updateMatchUi();
      if (online.code && online.side !== null) {
        socket.emit('room:join', { code: online.code, name: online.name, token: online.token }, response => {
          if (!response?.ok) return;
          online.side = response.side;
          online.lobby = response.lobby;
          renderOnlineLobby();
          if (response.match) receiveRemoteMatch(response.match, Date.now());
        });
      }
    });

    socket.on('disconnect', () => {
      online.connected = false;
      els.networkBadge.textContent = 'BAĞLANTI YOK';
      if (match?.mode === 'friend') updateMatchUi();
    });

    socket.on('room:lobby', lobby => {
      online.lobby = lobby;
      renderOnlineLobby();
    });

    socket.on('room:closed', payload => {
      setOnlineStatus(payload?.reason || 'Oda kapatıldı.', 'error');
      resetOnlineState();
      match = null;
      setup.mode = null;
      showScreen('online');
    });

    socket.on('match:start', payload => {
      remoteFinishedRendered = false;
      lastRemoteOverlayId = null;
      receiveRemoteMatch(payload.match, payload.serverNow);
      showScreen('match');
      if (!remoteLoopRunning) startMatchLoop();
    });

    socket.on('match:state', payload => receiveRemoteMatch(payload.match, payload.serverNow));
    return socket;
  }

  function receiveRemoteMatch(nextMatch, serverNow = Date.now()) {
    if (!nextMatch) return;
    match = nextMatch;
    setup.mode = 'friend';
    remoteSnapshotAt = performance.now();
    const overlay = match.overlay;
    if (overlay && overlay.id !== lastRemoteOverlayId) {
      lastRemoteOverlayId = overlay.id;
      const duration = Math.max(180, Number(overlay.until) - Number(serverNow));
      const title = overlay.title || '';
      if (/GOL/i.test(title)) beep('goal');
      else if (/KIRMIZI|SARI/i.test(title)) beep('card');
      else if (/KURTARDI/i.test(title)) beep('save');
      else if (/FAUL|PENALTI|FRİKİK/i.test(title)) beep('whistle');
      showEventOverlay(title, overlay.subtitle, overlay.tone, overlay.kicker, duration);
    }

    if (match.phase === 'finished') {
      if (!remoteFinishedRendered) {
        remoteFinishedRendered = true;
        finishMatch(match.winnerSide);
      }
      return;
    }

    if (!$('#screen-match').classList.contains('active') && online.lobby?.phase !== 'lobby') showScreen('match');
    if (!remoteLoopRunning) startMatchLoop();
    updateMatchUi();
  }

  function renderLobbyPlayer(element, player, role) {
    if (!element || !player) return;
    element.classList.toggle('connected', Boolean(player.connected));
    element.classList.toggle('ready', Boolean(player.ready));
    const connection = player.present ? (player.connected ? 'Bağlı' : 'Bağlantı koptu') : 'Bekleniyor…';
    const team = player.ready ? `${player.teamName} · Kadro hazır` : 'Kadro hazırlanmadı';
    element.innerHTML = `<span>${role} · ${connection}</span><strong>${escapeHtml(player.name || 'Bekleniyor…')}</strong><small>${escapeHtml(team)}</small>`;
  }

  function renderOnlineLobby() {
    const lobby = online.lobby;
    if (!lobby) return;
    els.lobbyCode.textContent = lobby.code;
    renderLobbyPlayer(els.lobbyPlayer0, lobby.players[0], 'EV SAHİBİ');
    renderLobbyPlayer(els.lobbyPlayer1, lobby.players[1], 'MİSAFİR');
    const settings = lobby.settings || {};
    els.lobbySettingsSummary.innerHTML = [
      `${settings.durationMinutes || 5} DK`,
      settings.cards ? 'KART AÇIK' : 'KART KAPALI',
      settings.extraTime ? 'UZATMA AÇIK' : 'UZATMA KAPALI',
      settings.shootout ? 'PENALTILAR AÇIK' : 'PENALTILAR KAPALI'
    ].map(item => `<span>${item}</span>`).join('');

    const bothReady = Boolean(lobby.canStart);
    const guestPresent = Boolean(lobby.players[1]?.present);
    els.lobbyMessage.textContent = !guestPresent
      ? 'Arkadaşının kodla odaya katılması bekleniyor.'
      : !bothReady
        ? 'İki oyuncunun da kadrosu hazır olmalı.'
        : online.side === 0 ? 'Her şey hazır. İlk düdük sende.' : 'Her şey hazır. Oda sahibinin maçı başlatması bekleniyor.';
    els.startOnlineMatchButton.classList.toggle('hidden', online.side !== 0);
    els.editOnlineSettingsButton.classList.toggle('hidden', online.side !== 0);
    els.startOnlineMatchButton.disabled = !bothReady || lobby.phase !== 'lobby';
    els.networkBadge.classList.toggle('hidden', !online.code);
  }

  function resetOnlineState() {
    online.code = null;
    online.side = null;
    online.name = '';
    online.lobby = null;
    online.joining = false;
    els.networkBadge.classList.add('hidden');
    els.remoteMatchBar.classList.add('hidden');
    remoteLoopRunning = false;
    remoteFinishedRendered = false;
    lastRemoteOverlayId = null;
  }

  async function createOnlineRoom() {
    if (online.joining) return;
    online.joining = true;
    els.createRoomButton.disabled = true;
    setOnlineStatus('Oda hazırlanıyor…');
    try {
      const socket = await connectOnline();
      const name = els.hostNameInput.value.trim() || 'Ev Sahibi';
      socket.emit('room:create', { name, token: online.token }, response => {
        online.joining = false;
        els.createRoomButton.disabled = false;
        if (!response?.ok) return setOnlineStatus(response?.error || 'Oda oluşturulamadı.', 'error');
        online.code = response.code;
        online.side = response.side;
        online.name = name;
        online.lobby = response.lobby;
        setup.mode = 'friend';
        setup.side = response.side;
        setup.teams = [null, null];
        setup.manualSelected.clear();
        renderOnlineLobby();
        renderSetupState();
        setOnlineStatus(`Oda ${response.code} oluşturuldu.`, 'success');
        showScreen('squad');
      });
    } catch (error) {
      online.joining = false;
      els.createRoomButton.disabled = false;
      setOnlineStatus(error.message || 'Online sunucuya bağlanılamadı.', 'error');
    }
  }

  async function joinOnlineRoom() {
    if (online.joining) return;
    const code = els.joinCodeInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (code.length !== 6) return setOnlineStatus('Altı haneli oda kodunu gir.', 'error');
    online.joining = true;
    els.joinRoomButton.disabled = true;
    setOnlineStatus('Odaya bağlanılıyor…');
    try {
      const socket = await connectOnline();
      const name = els.guestNameInput.value.trim() || 'Misafir';
      socket.emit('room:join', { code, name, token: online.token }, response => {
        online.joining = false;
        els.joinRoomButton.disabled = false;
        if (!response?.ok) return setOnlineStatus(response?.error || 'Odaya katılamadın.', 'error');
        online.code = response.code;
        online.side = response.side;
        online.name = name;
        online.lobby = response.lobby;
        setup.mode = 'friend';
        setup.side = response.side;
        setup.teams = [null, null];
        setup.manualSelected.clear();
        renderOnlineLobby();
        if (response.match) {
          receiveRemoteMatch(response.match, Date.now());
          showScreen(response.match.phase === 'finished' ? 'results' : 'match');
        } else {
          renderSetupState();
          setOnlineStatus(`Oda ${response.code} bağlantısı kuruldu.`, 'success');
          showScreen('squad');
        }
      });
    } catch (error) {
      online.joining = false;
      els.joinRoomButton.disabled = false;
      setOnlineStatus(error.message || 'Online sunucuya bağlanılamadı.', 'error');
    }
  }

  function submitOnlineTeam() {
    const team = setup.teams[setup.side];
    if (!team || !online.socket || !online.code) return;
    els.nextSetupButton.disabled = true;
    online.socket.emit('room:submitTeam', { code: online.code, team }, response => {
      els.nextSetupButton.disabled = false;
      if (!response?.ok) {
        showEventOverlay('KADRO GİTMEDİ', response?.error || 'Tekrar dene', 'red', '', 1100);
        return;
      }
      online.lobby = response.lobby;
      renderOnlineLobby();
      if (online.side === 0) showScreen('settings');
      else showScreen('lobby');
    });
  }

  function submitOnlineSettings() {
    if (!online.socket || online.side !== 0) return;
    online.socket.emit('room:updateSettings', { settings: settingsFromUi() }, response => {
      if (!response?.ok) {
        showEventOverlay('AYAR HATASI', response?.error || 'Tekrar dene', 'red', '', 1000);
        return;
      }
      online.lobby = response.lobby;
      renderOnlineLobby();
      showScreen('lobby');
    });
  }

  function startOnlineMatch() {
    if (!online.socket || online.side !== 0) return;
    els.startOnlineMatchButton.disabled = true;
    online.socket.emit('room:start', {}, response => {
      if (!response?.ok) {
        els.startOnlineMatchButton.disabled = false;
        els.lobbyMessage.textContent = response?.error || 'Maç başlatılamadı.';
      }
    });
  }

  function leaveOnlineRoom() {
    online.socket?.emit('room:leave');
    resetOnlineState();
    match = null;
    resetSetup(true);
    showScreen('mode');
  }

  async function copyRoomCode() {
    if (!online.code) return;
    try {
      await navigator.clipboard.writeText(online.code);
      els.copyCodeButton.textContent = 'KOPYALANDI ✓';
      setTimeout(() => { els.copyCodeButton.textContent = 'KODU KOPYALA'; }, 1200);
    } catch (_) {
      window.prompt('Oda kodunu kopyala:', online.code);
    }
  }

  function bindEvents() {
    els.startButton.addEventListener('click', () => { ensureAudio(); showScreen('mode'); });
    els.howToButton.addEventListener('click', () => showScreen('howto'));
    els.themeButton.addEventListener('click', () => applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
    els.continueButton.addEventListener('click', restoreMatch);
    els.homeButton.addEventListener('click', () => {
      if (match && match.mode !== 'friend' && !match.paused && !match.resolving) pauseMatch();
      showScreen('home');
    });
    els.soundButton.addEventListener('click', () => {
      muted = !muted;
      els.soundButton.classList.toggle('muted', muted);
      els.soundButton.textContent = muted ? '×' : '♪';
      if (!muted) beep('click');
    });
    $$('[data-back]').forEach(button => button.addEventListener('click', () => handleBack(button.dataset.back)));

    els.modeButtons.forEach(button => button.addEventListener('click', () => {
      const mode = button.dataset.mode;
      if (mode === 'friend') {
        setup.mode = 'friend';
        setOnlineStatus('Oda oluşturabilir veya arkadaşının koduyla katılabilirsin.');
        showScreen('online');
        return;
      }
      setup.mode = mode;
      setup.teams = [null, null];
      setup.side = 0;
      setup.manualSelected.clear();
      els.shootoutToggle.checked = true;
      renderSetupState();
      showScreen('squad');
    }));

    els.createRoomButton.addEventListener('click', createOnlineRoom);
    els.joinRoomButton.addEventListener('click', joinOnlineRoom);
    els.joinCodeInput.addEventListener('input', () => {
      els.joinCodeInput.value = els.joinCodeInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    });
    els.joinCodeInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') joinOnlineRoom();
    });
    els.copyCodeButton.addEventListener('click', copyRoomCode);
    els.leaveRoomButton.addEventListener('click', leaveOnlineRoom);
    els.editOnlineSettingsButton.addEventListener('click', () => showScreen('settings'));
    els.startOnlineMatchButton.addEventListener('click', startOnlineMatch);

    els.builderTabs.forEach(tab => tab.addEventListener('click', () => switchBuilder(tab.dataset.builder)));
    els.periodChips.addEventListener('click', event => {
      const button = event.target.closest('[data-period]');
      if (!button) return;
      const id = button.dataset.period;
      if (setup.selectedPeriods.includes(id)) {
        if (setup.selectedPeriods.length > 1) setup.selectedPeriods = setup.selectedPeriods.filter(item => item !== id);
      } else if (setup.selectedPeriods.length < 2) {
        setup.selectedPeriods.push(id);
      } else {
        showEventOverlay('EN FAZLA 2', 'Dönemlerden birini kaldırıp yeniden seç', 'navy', '', 850);
      }
      initializeFilters();
      els.nationalitySelect.value = setup.criteria.nationality;
      els.leagueSelect.value = setup.criteria.league;
    });
    els.nationalitySelect.addEventListener('change', () => { setup.criteria.nationality = els.nationalitySelect.value; });
    els.leagueSelect.addEventListener('change', () => { setup.criteria.league = els.leagueSelect.value; });

    els.randomBuildButton.addEventListener('click', () => {
      completeTeam(buildRandomLineup());
      beep('click');
    });
    els.criteriaBuildButton.addEventListener('click', () => {
      if (!setup.selectedPeriods.length) return;
      startDraft(buildCriteriaPool());
    });
    els.draftStopButton.addEventListener('click', stopDraft);

    els.manualSearch.addEventListener('input', renderManualList);
    els.manualPlayerList.addEventListener('change', event => {
      const checkbox = event.target.closest('[data-player-id]');
      if (!checkbox) return;
      const id = checkbox.dataset.playerId;
      if (checkbox.checked) {
        if (setup.manualSelected.size >= 11) {
          checkbox.checked = false;
          showEventOverlay('11 TAMAM', 'Önce bir oyuncuyu çıkar', 'navy', '', 650);
        } else {
          setup.manualSelected.add(id);
        }
      } else {
        setup.manualSelected.delete(id);
      }
      renderManualList();
    });
    els.manualBuildButton.addEventListener('click', () => {
      const selected = [...setup.manualSelected].map(id => PLAYERS.find(player => player.id === id)).filter(Boolean);
      if (!selected.some(player => player.position === 'GK')) {
        showEventOverlay('KALECİ LAZIM', 'Manuel kadroda en az bir kaleci seçmelisin', 'navy', '', 900);
        return;
      }
      completeTeam(assignPlayersToSlots(selected));
    });

    els.nextSetupButton.addEventListener('click', () => {
      if (setup.mode === 'coop' && setup.side === 0) {
        setup.side = 1;
        setup.manualSelected.clear();
        els.manualSearch.value = '';
        renderManualList();
        renderSetupState();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (setup.mode === 'friend') {
        submitOnlineTeam();
      } else {
        showScreen('settings');
      }
    });

    els.durationRange.addEventListener('input', () => { els.durationValue.textContent = `${els.durationRange.value} dk`; });
    els.kickoffButton.addEventListener('click', () => { ensureAudio(); createMatch(); });
    els.matchStopButton.addEventListener('click', () => stopMatchRoll('human'));
    els.pauseButton.addEventListener('click', pauseMatch);
    els.squadsButton.addEventListener('click', () => { selectedSquadSide = match?.context?.owner ?? 0; renderMatchSquad(); els.squadsOverlay.classList.remove('hidden'); });
    els.closeSquadsButton.addEventListener('click', () => els.squadsOverlay.classList.add('hidden'));
    els.squadsOverlay.addEventListener('click', event => { if (event.target === els.squadsOverlay) els.squadsOverlay.classList.add('hidden'); });
    els.squadMatchTabs.forEach(tab => tab.addEventListener('click', () => { selectedSquadSide = Number(tab.dataset.side); renderMatchSquad(); }));
    els.dialogButton.addEventListener('click', closeDialog);
    els.rematchButton.addEventListener('click', () => {
      if (!match) return;
      if (match.mode === 'friend') {
        if (online.side !== 0 || !online.socket) return;
        els.rematchButton.disabled = true;
        online.socket.emit('room:rematch', {}, response => {
          if (!response?.ok) {
            els.rematchButton.disabled = false;
            showEventOverlay('RÖVANŞ YOK', response?.error || 'Tekrar dene', 'red', '', 950);
          }
        });
        return;
      }
      setup.mode = match.mode;
      setup.teams = match.teams.map(team => ({ name: team.name, lineup: team.lineup.map(({ yellowCards, red, injured, ...player }) => player) }));
      showScreen('settings');
    });
    els.newGameButton.addEventListener('click', () => {
      if (match?.mode === 'friend') {
        leaveOnlineRoom();
        return;
      }
      match = null;
      resetSetup(true);
      showScreen('mode');
    });
  }

  function init() {
    initializeTheme();
    initializeOnlineToken();
    initializeFilters();
    renderManualList();
    renderSetupState();
    bindEvents();
    try {
      if (localStorage.getItem(SAVE_KEY)) els.continueButton.classList.remove('hidden');
    } catch (_) {}
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }

  init();
})();
