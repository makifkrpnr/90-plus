(function () {
  'use strict';

  const Core = window.GameCore;
  const Audio = window.GameAudio;
  const PLAYERS = window.KRONOMETRE_PLAYERS || [];
  const SAVE_KEY = '90-plus-save-v5';
  const SETTINGS_KEY = '90-plus-settings-v5';
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
    positionSelect: $('#positionSelect'),
    ratingSelect: $('#ratingSelect'),
    randomBuildButton: $('#randomBuildButton'),
    criteriaBuildButton: $('#criteriaBuildButton'),
    criteriaSummary: $('#criteriaSummary'),
    manualSearch: $('#manualSearch'),
    manualCount: $('#manualCount'),
    manualPlayerList: $('#manualPlayerList'),
    manualBuildButton: $('#manualBuildButton'),
    squadPreview: $('#squadPreview'),
    nextSetupButton: $('#nextSetupButton'),
    duelBuilderTab: $('#duelBuilderTab'), duelStartButton: $('#duelStartButton'), duelRequestText: $('#duelRequestText'),
    duelResponseButtons: $('#duelResponseButtons'), duelAcceptButton: $('#duelAcceptButton'), duelRejectButton: $('#duelRejectButton'),
    duelStatusText: $('#duelStatusText'), coinStage: $('#coinStage'), duelCoin: $('#duelCoin'), flipCoinButton: $('#flipCoinButton'),
    duelCriteriaStage: $('#duelCriteriaStage'), duelTurnName: $('#duelTurnName'), duelCriteriaProgress: $('#duelCriteriaProgress'),
    duelCriteriaChoices: $('#duelCriteriaChoices'), duelCriteriaSummary: $('#duelCriteriaSummary'), duelPickStage: $('#duelPickStage'),
    duelPickTurnName: $('#duelPickTurnName'), duelPickProgress: $('#duelPickProgress'), duelPickCandidates: $('#duelPickCandidates'),
    duelTeam0Name: $('#duelTeam0Name'), duelTeam1Name: $('#duelTeam1Name'), duelPitch0: $('#duelPitch0'), duelPitch1: $('#duelPitch1'),
    duelCancelButton: $('#duelCancelButton'), duelFinishButton: $('#duelFinishButton'),
    draftProgress: $('#draftProgress'),
    draftCandidates: $('#draftCandidates'),
    draftWatchDisplay: $('#draftWatchDisplay'),
    draftStopButton: $('#draftStopButton'),
    draftRuleText: $('#draftRuleText'),
    draftDigitMap: $('#draftDigitMap'),
    durationRange: $('#durationRange'),
    durationValue: $('#durationValue'),
    cardsToggle: $('#cardsToggle'),
    injuryToggle: $('#injuryToggle'),
    extraToggle: $('#extraToggle'),
    shootoutToggle: $('#shootoutToggle'),
    menuMusicToggle: $('#menuMusicToggle'), menuVolumeRange: $('#menuVolumeRange'), menuVolumeValue: $('#menuVolumeValue'),
    stadiumAmbienceToggle: $('#stadiumAmbienceToggle'), stadiumVolumeRange: $('#stadiumVolumeRange'), stadiumVolumeValue: $('#stadiumVolumeValue'),
    sfxToggle: $('#sfxToggle'), sfxVolumeRange: $('#sfxVolumeRange'), sfxVolumeValue: $('#sfxVolumeValue'),
    soundIntensity: $('#soundIntensity'), vibrationToggle: $('#vibrationToggle'), eventDurationSelect: $('#eventDurationSelect'),
    homeColorSelect: $('#homeColorSelect'), awayColorSelect: $('#awayColorSelect'),
    kickoffButton: $('#kickoffButton'),
    briefSettingsSummary: $('#briefSettingsSummary'),
    briefBackButton: $('#briefBackButton'),
    briefStartButton: $('#briefStartButton'),
    onlineReadyPanel: $('#onlineReadyPanel'),
    onlineReadyMessage: $('#onlineReadyMessage'),
    readyCountdown: $('#readyCountdown'),
    homeTeamBox: $('#homeTeamBox'),
    awayTeamBox: $('#awayTeamBox'),
    homeTeamName: $('#homeTeamName'),
    awayTeamName: $('#awayTeamName'),
    homeScore: $('#homeScore'),
    awayScore: $('#awayScore'),
    periodLabel: $('#periodLabel'),
    matchClock: $('#matchClock'),
    addedTimeLabel: $('#addedTimeLabel'),
    kickoffScoreCard: $('#kickoffScoreCard'),
    kickoffHomeDigit: $('#kickoffHomeDigit'),
    kickoffAwayDigit: $('#kickoffAwayDigit'),
    turnTeam: $('#turnTeam'),
    rollInstruction: $('#rollInstruction'),
    activePlayerCaption: $('#activePlayerCaption'),
    rollContextLabel: $('#rollContextLabel'),
    activePlayerName: $('#activePlayerName'),
    activePlayerMeta: $('#activePlayerMeta'),
    matchWatchDisplay: $('#matchWatchDisplay'),
    turnCountdown: $('#turnCountdown'),
    matchStopButton: $('#matchStopButton'),
    matchStopEyebrow: $('#matchStopEyebrow'),
    matchStopText: $('#matchStopText'),
    eventsButton: $('#eventsButton'),
    squadsButton: $('#squadsButton'),
    rulesButton: $('#rulesButton'),
    rulesOverlay: $('#rulesOverlay'),
    closeRulesButton: $('#closeRulesButton'),
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
    pauseButtonLabel: $('#pauseButtonLabel'),
    pauseBudgetMini: $('#pauseBudgetMini'),
    pauseOverlay: $('#pauseOverlay'),
    pauseOverlayTitle: $('#pauseOverlayTitle'),
    pauseOverlayText: $('#pauseOverlayText'),
    pauseOverlayCountdown: $('#pauseOverlayCountdown'),
    pauseEventsButton: $('#pauseEventsButton'), pauseRulesButton: $('#pauseRulesButton'), pauseSquadsButton: $('#pauseSquadsButton'), resumePauseButton: $('#resumePauseButton'),
    liveTimeline: $('#liveTimeline'),
    eventsOverlay: $('#eventsOverlay'), closeEventsButton: $('#closeEventsButton'), overlayTimeline: $('#overlayTimeline'),
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
    rematchButton: $('#rematchButton'), rematchOverlay: $('#rematchOverlay'), simpleRematchButton: $('#simpleRematchButton'), twoLegRematchButton: $('#twoLegRematchButton'), closeRematchButton: $('#closeRematchButton'),
    newGameButton: $('#newGameButton'),
    appToast: $('#appToast')
  };

  const setup = {
    mode: null,
    builder: 'random',
    side: 0,
    teams: [null, null],
    selectedPeriods: ['1996-2005'],
    manualSelected: new Set(),
    criteria: { nationality: '', league: '', position: '', rating: '' }
  };

  let draft = null;
  let draftRaf = null;
  let match = null;
  let matchRaf = null;
  let aiTimer = null;
  let overlayTimer = null;
  let dialogAction = null;
  let dialogSecondaryAction = null;
  let audioContext = null;
  let muted = false;
  let remoteSnapshotAt = 0;
  let lastRemoteOverlayId = null;
  let remoteFinishedRendered = false;
  let remoteLoopRunning = false;
  let selectedSquadSide = 0;
  let halftimeDialogKey = null;
  let currentScreenName = 'home';
  let navigationReady = false;
  let lastBackPromptAt = 0;
  let readyTicker = null;
  let lastAudioEventId = null;
  let duel = null;
  const TEAM_COLORS = [
    { id: 'red', label: 'Kırmızı', value: '#d44735' }, { id: 'navy', label: 'Lacivert', value: '#172842' },
    { id: 'blue', label: 'Mavi', value: '#2878c8' }, { id: 'sky', label: 'Gökyüzü', value: '#5aa8d8' },
    { id: 'green', label: 'Yeşil', value: '#2f8a5b' }, { id: 'yellow', label: 'Sarı', value: '#d8a91e' },
    { id: 'orange', label: 'Turuncu', value: '#d46f2a' }, { id: 'purple', label: 'Mor', value: '#704aa1' },
    { id: 'black', label: 'Siyah', value: '#242424' }, { id: 'white', label: 'Beyaz', value: '#e7e1d2' }
  ];

  const online = {
    socket: null,
    connected: false,
    code: null,
    side: null,
    token: null,
    name: '',
    lobby: null,
    joining: false,
    startReady: [false, false],
    startDeadline: null
  };

  function isFriendMode() {
    return setup.mode === 'friend' || match?.mode === 'friend';
  }

  function showScreen(name, options = {}) {
    const target = document.querySelector(`#screen-${name}`) ? name : 'home';
    els.screens.forEach(screen => screen.classList.toggle('active', screen.id === `screen-${target}`));
    document.body.classList.toggle('match-active', target === 'match');
    currentScreenName = target;
    Audio?.setAmbience(target === 'match' ? 'ambience.stadium' : 'ambience.menu');
    if (target !== 'match') {
      els.pauseOverlay?.classList.add('hidden');
      els.eventOverlay?.classList.add('hidden');
      els.eventsOverlay?.classList.add('hidden');
      els.rulesOverlay?.classList.add('hidden');
      els.squadsOverlay?.classList.add('hidden');
    }
    if (!options.preserveScroll) window.scrollTo({ top: 0, behavior: 'auto' });
    if (navigationReady && !options.fromPop) {
      const state = { screen: target, at: Date.now() };
      if (options.replace) history.replaceState(state, '', `#${target}`);
      else if (history.state?.screen !== target) history.pushState(state, '', `#${target}`);
    }
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

  function currentAudioSettings() {
    const source = match?.settings || settingsFromUi();
    return {
      menuMusic: source.menuMusic !== false,
      stadiumAmbience: source.stadiumAmbience !== false,
      sfx: source.sfx !== false,
      menuVolume: Number(source.menuVolume ?? .55),
      stadiumVolume: Number(source.stadiumVolume ?? .5),
      sfxVolume: Number(source.sfxVolume ?? .75),
      intensity: source.soundIntensity || 'medium'
    };
  }

  function ensureAudio() {
    Audio?.configure(currentAudioSettings());
    Audio?.unlock();
    Audio?.setMuted(muted);
  }

  function soundGain() {
    const intensity = match?.settings?.soundIntensity || els.soundIntensity?.value || 'medium';
    return intensity === 'low' ? 0.3 : intensity === 'high' ? 1 : 0.68;
  }

  function beep(kind) {
    if (muted) return;
    ensureAudio();
    const map = {
      click: 'ui.select',
      whistle: 'whistle.foul',
      goal: 'crowd.goal',
      card: 'cards.yellow',
      save: 'ball.save'
    };
    Audio?.play(map[kind] || 'ui.select', { volume: soundGain(), replace: kind === 'click', channel: kind === 'click' ? 'ui' : 'event' });
  }

  function playAudioCue(cue, options = {}) {
    if (muted || !Audio) return;
    ensureAudio();
    if (Array.isArray(cue)) {
      cue.forEach((key, index) => setTimeout(() => Audio.play(key, { volume: soundGain(), ...options }), index * Number(options.stagger || 90)));
    } else if (cue) {
      Audio.play(cue, { volume: soundGain(), ...options });
    }
  }

  function playMatchEventAudio(type, detail = '') {
    const normalized = String(type || '').toLowerCase();
    const text = String(detail || '').toLowerCase();
    if (match?.settings?.vibration !== false && navigator.vibrate && ['goal','yellow','red','secondyellow','timeout','post'].includes(normalized)) {
      navigator.vibrate(normalized === 'goal' ? [70,40,110] : normalized === 'red' ? [120,50,120] : 70);
    }
    if (normalized === 'goal') {
      Audio?.duckAmbience(.12, 5200);
      playAudioCue(['ball.shot', 'ball.net', 'crowd.goal'], { stagger: 120 });
    } else if (normalized === 'pass') Audio?.playRandom(['ball.pass1', 'ball.pass2', 'ball.pass3'], { volume: .75, channel: 'ball' });
    else if (normalized === 'player') playAudioCue('ball.playerSelect', { channel: 'ball', replace: true });
    else if (normalized === 'foul') playAudioCue(['ball.tackle', 'whistle.foul', 'crowd.gasp'], { stagger: 110 });
    else if (normalized === 'corner') playAudioCue('ball.corner', { channel: 'ball' });
    else if (normalized === 'throwin') playAudioCue('ball.throwIn', { channel: 'ball' });
    else if (normalized === 'turnover') playAudioCue('ball.turnover', { channel: 'ball' });
    else if (normalized === 'shot') playAudioCue('ball.shot', { channel:'ball' });
    else if (normalized === 'save') playAudioCue(['ball.shot', 'ball.save', 'crowd.bigCheer'], { stagger: 100 });
    else if (normalized === 'post') playAudioCue(['ball.shot','ball.post','crowd.disappointment'], { stagger:100 });
    else if (normalized === 'wide') playAudioCue(['ball.shot','crowd.disappointment'], { stagger:100 });
    else if (normalized === 'indirect') playAudioCue('whistle.freeKick', { replace:true, channel:'whistle' });
    else if (normalized === 'yellow') playAudioCue('cards.yellow', { replace: true, channel: 'card' });
    else if (normalized === 'secondyellow') playAudioCue('cards.secondYellow', { replace: true, channel: 'card' });
    else if (normalized === 'red') playAudioCue(text.includes('ihlal') ? 'violation.red' : 'cards.red', { replace: true, channel: 'card' });
    else if (normalized === 'timeout') playAudioCue('timer.timeout', { replace: true, channel: 'timer' });
    else if (normalized === 'penalty') playAudioCue('whistle.penalty', { replace: true, channel: 'whistle' });
    else if (normalized === 'freekick') playAudioCue('whistle.freeKick', { replace: true, channel: 'whistle' });
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
    const nationalities = [...new Set(PLAYERS.map(player => player.nationality).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'tr'));
    const leagues = [...new Set(PLAYERS.flatMap(player => player.leagues || []).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'tr'));
    els.nationalitySelect.innerHTML = '<option value="">Tümü</option>' + nationalities.map(item => `<option>${escapeHtml(item)}</option>`).join('');
    els.leagueSelect.innerHTML = '<option value="">Tümü</option>' + leagues.map(item => `<option>${escapeHtml(item)}</option>`).join('');
    if (els.positionSelect) els.positionSelect.innerHTML = '<option value="">Tüm mevkiler</option><option value="GK">Kaleci</option><option value="DEF">Savunma</option><option value="MID">Orta saha</option><option value="ATT">Hücum</option>';
    if (els.ratingSelect) els.ratingSelect.innerHTML = '<option value="">Tüm puanlar</option><option value="60-69">60–69</option><option value="70-79">70–79</option><option value="80-89">80–89</option><option value="90-99">90–99</option>';
    els.nationalitySelect.value = setup.criteria.nationality || '';
    els.leagueSelect.value = setup.criteria.league || '';
    if (els.positionSelect) els.positionSelect.value = setup.criteria.position || '';
    if (els.ratingSelect) els.ratingSelect.value = setup.criteria.rating || '';
    updateCriteriaSummary();
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

  function positionGroupMatch(player, group) {
    if (!group) return true;
    if (group === 'GK') return player.position === 'GK';
    if (group === 'DEF') return ['LB','RB','CB'].includes(player.position);
    if (group === 'MID') return ['DM','CM','AM'].includes(player.position);
    if (group === 'ATT') return ['LW','RW','ST'].includes(player.position);
    return true;
  }

  function ratingRangeMatch(player, range) {
    if (!range) return true;
    const [min,max] = range.split('-').map(Number);
    return Number(player.rating) >= min && Number(player.rating) <= max;
  }

  function criteriaFilteredPlayers(criteria = setup.criteria, periodsInput = setup.selectedPeriods) {
    const periods = periodsInput.map(id => PERIODS.find(period => period.id === id)).filter(Boolean);
    if (!periods.length) return [];
    return PLAYERS.filter(player => {
      const periodMatch = periods.some(period => player.activeStart <= period.end && player.activeEnd >= period.start);
      const nationalityMatch = !criteria.nationality || player.nationality === criteria.nationality;
      const leagueMatch = !criteria.league || (player.leagues || []).includes(criteria.league);
      return periodMatch && nationalityMatch && leagueMatch && positionGroupMatch(player, criteria.position) && ratingRangeMatch(player, criteria.rating);
    });
  }

  function buildCriteriaPool() {
    const filtered = criteriaFilteredPlayers();
    const sorted = [...filtered].sort((a, b) => a.rating - b.rating);
    if (sorted.length <= 27) return sorted;
    const starCandidates = sorted.filter(player => player.rating >= 86);
    const guaranteed = shuffle(starCandidates.slice(-Math.min(30, starCandidates.length))).slice(0, 3);
    const guaranteedIds = new Set(guaranteed.map(player => player.id));
    const rest = sorted.filter(player => !guaranteedIds.has(player.id));
    const split = Math.ceil(rest.length / 2);
    const weak = shuffle(rest.slice(0, split)).slice(0, 12);
    const strong = shuffle(rest.slice(split)).slice(0, 12);
    return uniqueById([...weak, ...strong, ...guaranteed]).slice(0, 27);
  }

  function updateCriteriaSummary() {
    if (!els.criteriaSummary) return;
    const count = criteriaFilteredPlayers().length;
    const periodNames = setup.selectedPeriods.map(id => PERIODS.find(period => period.id === id)?.label).filter(Boolean).join(' + ');
    const filters = [periodNames || 'Dönem yok', setup.criteria.nationality || 'Tüm milliyetler', setup.criteria.league || 'Tüm ligler', setup.criteria.position || 'Tüm mevkiler', setup.criteria.rating ? `${setup.criteria.rating} puan` : 'Tüm puanlar'];
    els.criteriaSummary.textContent = `${filters.join(' · ')} — ${count} futbolcu bulundu. Filtre dışından oyuncu eklenmez.`;
    els.criteriaSummary.dataset.tone = count >= 11 ? 'success' : 'error';
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
    els.duelBuilderTab?.classList.toggle('hidden', !['coop','friend'].includes(setup.mode));
    if (setup.mode === 'coop') els.setupTeamLabel.textContent = `TAKIM ${side + 1}`;
    else if (setup.mode === 'friend') els.setupTeamLabel.textContent = `UZAKTAN OYUNCU · ${side === 0 ? 'İÇ SAHA' : 'DEPLASMAN'}`;
    else els.setupTeamLabel.textContent = 'SENİN TAKIMIN';

    const fallbackName = setup.mode === 'friend'
      ? `${online.name || (side === 0 ? 'İç Saha' : 'Deplasman')} XI`
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
      ? `${online.name || (side === 0 ? 'İç Saha' : 'Deplasman')} XI`
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
    const remaining = pool.filter(player => !usedIds.has(player.id));
    const compatible = shuffle(remaining.filter(player => positionScore(slot, player) > 0))
      .sort((a, b) => positionScore(slot, b) - positionScore(slot, a) || b.rating - a.rating);
    const fallback = shuffle(remaining).sort((a, b) => b.rating - a.rating);
    return uniqueById([...compatible, ...fallback]).slice(0, Math.min(3, remaining.length));
  }

  function startDraft(pool) {
    const strictPool = uniqueById(pool || []);
    if (strictPool.length < 11) {
      showEventOverlay('HAVUZ YETERSİZ', `Bu filtrelerle ${strictPool.length} oyuncu bulundu. En az 11 oyuncu gerekli.`, 'navy', 'FİLTREYİ GENİŞLET', 3600);
      return;
    }
    if (!strictPool.some(player => player.position === 'GK')) {
      showEventOverlay('KALECİ YOK', 'Seçtiğin kriterlerde kaleci bulunmuyor. Dönem, milliyet veya ligi genişlet.', 'navy', 'KADRO KURULAMAZ', 3600);
      return;
    }
    draft = { pool: strictPool, slotIndex: 0, lineup: [], candidates: [], elapsedMs: 0, lastFrame: performance.now(), running: true, lastPredictedIndex: -1 };
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
    if (!draft.candidates.length) {
      showEventOverlay('ADAY KALMADI', 'Bu filtreyle 11 benzersiz oyuncu tamamlanamadı.', 'red', 'FİLTREYİ DEĞİŞTİR', 3200, () => { draft = null; showScreen('squad'); });
      return;
    }
    draft.elapsedMs = 0;
    draft.lastFrame = performance.now();
    draft.running = true;
    draft.lastPredictedIndex = -1;
    els.draftProgress.textContent = `${draft.slotIndex + 1} / 11 · ${slot}`;
    els.draftCandidates.innerHTML = draft.candidates.map((player, index) => `<article class="candidate-card" data-candidate-index="${index}"><span class="candidate-index">${index + 1}</span><strong>${escapeHtml(player.name)}</strong><small>${escapeHtml(player.position)} · ${escapeHtml(player.nationality)}</small><b>${player.rating}</b></article>`).join('');
    const groups = Array.from({ length: 10 }, (_, digit) => digit % draft.candidates.length);
    els.draftDigitMap.innerHTML = groups.map((candidateIndex, digit) => `<span data-map-candidate="${candidateIndex}" data-map-digit="${digit}">${digit}</span>`).join('');
    els.draftRuleText.textContent = draft.candidates.length === 3
      ? 'Işık yaklaşık 0,65 saniyede bir ilerler. 0-3-6-9 birinci, 1-4-7 ikinci, 2-5-8 üçüncü oyuncuyu seçer.'
      : draft.candidates.length === 2
        ? 'Çift rakamlar birinci, tek rakamlar ikinci oyuncuyu seçer.'
        : 'Kronometrenin son rakamı listedeki tek adayı seçer.';
    els.draftWatchDisplay.textContent = formatStopwatch(0);
    els.draftStopButton.disabled = false;
    updateDraftPrediction(0);
  }

  function updateDraftPrediction(digit) {
    if (!draft?.candidates?.length) return;
    const index = digit % draft.candidates.length;
    if (draft.lastPredictedIndex === index) return;
    draft.lastPredictedIndex = index;
    els.draftCandidates.querySelectorAll('.candidate-card').forEach((card, cardIndex) => card.classList.toggle('predicted', cardIndex === index));
    els.draftDigitMap.querySelectorAll('[data-map-digit]').forEach(item => item.classList.toggle('active', Number(item.dataset.mapDigit) === digit));
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
        updateDraftPrediction(Math.floor(draft.elapsedMs / 650) % 10);
      } else draft.lastFrame = now;
      draftRaf = requestAnimationFrame(loop);
    };
    draftRaf = requestAnimationFrame(loop);
  }

  function stopDraft() {
    if (!draft || !draft.running) return;
    draft.running = false;
    els.draftStopButton.disabled = true;
    playAudioCue('timer.stop', { replace: true, channel: 'timer' });
    const digit = Math.floor(draft.elapsedMs / 650) % 10;
    const chosenIndex = digit % draft.candidates.length;
    const chosen = draft.candidates[chosenIndex];
    const slot = SLOTS[draft.slotIndex];
    const card = $(`[data-candidate-index="${chosenIndex}"]`);
    if (card) card.classList.add('chosen');
    draft.lineup.push({ ...chosen, slot });
    showEventOverlay(chosen.name, `${slot} · ${chosen.rating} puan · Rakam ${digit}`, 'navy', `${draft.slotIndex + 1}. SEÇİM`, 1900, () => {
      if (!draft) return;
      draft.slotIndex += 1;
      prepareDraftSlot();
    });
  }

  function settingsFromUi() {
    return {
      durationMinutes: Number(els.durationRange.value),
      cards: els.cardsToggle.checked,
      injury: els.injuryToggle.checked,
      extraTime: els.extraToggle.checked,
      shootout: els.shootoutToggle.checked,
      menuMusic: els.menuMusicToggle?.checked !== false,
      menuVolume: Number(els.menuVolumeRange?.value || 55) / 100,
      stadiumAmbience: els.stadiumAmbienceToggle?.checked !== false,
      stadiumVolume: Number(els.stadiumVolumeRange?.value || 50) / 100,
      sfx: els.sfxToggle?.checked !== false,
      sfxVolume: Number(els.sfxVolumeRange?.value || 75) / 100,
      soundIntensity: els.soundIntensity.value,
      vibration: els.vibrationToggle?.checked !== false,
      eventDuration: els.eventDurationSelect?.value || 'long',
      teamColors: [els.homeColorSelect?.value || '#d44735', els.awayColorSelect?.value || '#2878c8']
    };
  }

  function applySettingsToUi(settings = {}) {
    els.durationRange.value = settings.durationMinutes ?? 5; els.durationValue.textContent = `${els.durationRange.value} dk`;
    els.cardsToggle.checked = settings.cards !== false; els.injuryToggle.checked = Boolean(settings.injury);
    els.extraToggle.checked = settings.extraTime !== false; els.shootoutToggle.checked = settings.shootout !== false;
    if (els.menuMusicToggle) els.menuMusicToggle.checked = settings.menuMusic !== false;
    if (els.menuVolumeRange) { els.menuVolumeRange.value = Math.round((settings.menuVolume ?? .55) * 100); els.menuVolumeValue.textContent = `${els.menuVolumeRange.value}%`; }
    if (els.stadiumAmbienceToggle) els.stadiumAmbienceToggle.checked = settings.stadiumAmbience !== false;
    if (els.stadiumVolumeRange) { els.stadiumVolumeRange.value = Math.round((settings.stadiumVolume ?? .5) * 100); els.stadiumVolumeValue.textContent = `${els.stadiumVolumeRange.value}%`; }
    if (els.sfxToggle) els.sfxToggle.checked = settings.sfx !== false;
    if (els.sfxVolumeRange) { els.sfxVolumeRange.value = Math.round((settings.sfxVolume ?? .75) * 100); els.sfxVolumeValue.textContent = `${els.sfxVolumeRange.value}%`; }
    els.soundIntensity.value = settings.soundIntensity || 'medium';
    if (els.vibrationToggle) els.vibrationToggle.checked = settings.vibration !== false;
    if (els.eventDurationSelect) els.eventDurationSelect.value = settings.eventDuration || 'long';
    if (els.homeColorSelect) els.homeColorSelect.value = settings.teamColors?.[0] || '#d44735';
    if (els.awayColorSelect) els.awayColorSelect.value = settings.teamColors?.[1] || '#2878c8';
    Audio?.configure(currentAudioSettings());
  }

  function saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsFromUi())); } catch (_) {}
    Audio?.configure(currentAudioSettings());
  }

  function initializeSettings() {
    const options = TEAM_COLORS.map(color => `<option value="${color.value}">${color.label}</option>`).join('');
    if (els.homeColorSelect) els.homeColorSelect.innerHTML = options;
    if (els.awayColorSelect) els.awayColorSelect.innerHTML = options;
    let stored = {};
    try { stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); } catch (_) {}
    applySettingsToUi(stored);
  }

  function makeRuntimeTeam(team, side = 0, settings = settingsFromUi()) {
    return {
      name: team.name,
      color: team.color || settings.teamColors?.[side] || (side === 0 ? '#d44735' : '#2878c8'),
      lineup: team.lineup.map(player => ({ ...player, yellowCards: 0, red: false, injured: false, goals: 0, sentOffReason: null })),
      corners: 0,
      timeouts: 0
    };
  }

  function renderBrief() {
    const settings = setup.mode === 'friend' ? (online.lobby?.settings || settingsFromUi()) : settingsFromUi();
    const home = setup.teams[0]?.name || online.lobby?.players?.[0]?.teamName || 'İç saha';
    const away = setup.teams[1]?.name || online.lobby?.players?.[1]?.teamName || 'Deplasman';
    els.briefSettingsSummary.innerHTML = [
      `${home} — ${away}`,
      `${settings.durationMinutes} dakika`,
      settings.cards ? 'Kartlar açık' : 'Kartlar kapalı',
      settings.extraTime ? 'Uzatma açık' : 'Uzatma kapalı',
      settings.shootout ? 'Seri penaltı açık' : 'Beraberlik mümkün'
    ].map(item => `<span>${escapeHtml(item)}</span>`).join('');
    const remote = setup.mode === 'friend';
    els.briefStartButton.disabled = false;
    els.onlineReadyPanel.classList.toggle('hidden', !remote);
    els.briefBackButton.textContent = remote ? '← LOBİ' : '← AYARLAR';
    els.briefStartButton.textContent = remote ? 'MAÇA HAZIRIM' : 'SAHAYA ÇIK →';
    renderOnlineReadyState();
  }

  function showBrief() {
    renderBrief();
    showScreen('brief');
  }

  function renderOnlineReadyState() {
    if (setup.mode !== 'friend' || !online.lobby) return;
    const lobby = online.lobby;
    const ready = Array.isArray(lobby.startReady) ? lobby.startReady : [false, false];
    const meReady = Boolean(ready[online.side]);
    const otherSide = online.side === 0 ? 1 : 0;
    const otherName = lobby.players?.[otherSide]?.name || 'Diğer oyuncu';
    const myName = lobby.players?.[online.side]?.name || 'Sen';
    const deadline = Number(lobby.startDeadline) || 0;
    online.startReady = ready;
    online.startDeadline = deadline || null;
    if (ready[0] && ready[1]) {
      els.onlineReadyMessage.textContent = 'İki oyuncu da hazır. Başlama atışı ekranı açılıyor…';
      els.briefStartButton.disabled = true;
      els.briefStartButton.textContent = 'İKİNİZ DE HAZIRSINIZ';
    } else if (meReady) {
      els.onlineReadyMessage.textContent = `${otherName} isimli oyuncu bekleniyor. 30 saniye dolarsa maç otomatik hazırlanır.`;
      els.briefStartButton.disabled = true;
      els.briefStartButton.textContent = 'HAZIRLIK BİLDİRİLDİ ✓';
    } else if (ready[otherSide]) {
      els.onlineReadyMessage.textContent = `${otherName} hazır. Sen de 30 saniye içinde onaylayabilirsin; süre dolarsa saha otomatik açılır.`;
      els.briefStartButton.disabled = false;
      els.briefStartButton.textContent = 'BEN DE HAZIRIM';
    } else {
      els.onlineReadyMessage.textContent = `${myName}, hazır olduğunda bildir. İlk onaydan sonra diğer oyuncuya 30 saniye verilir.`;
      els.briefStartButton.disabled = false;
      els.briefStartButton.textContent = 'MAÇA HAZIRIM';
    }
    clearInterval(readyTicker);
    const tick = () => {
      if (!online.startDeadline) { els.readyCountdown.textContent = '—'; return; }
      const left = Math.max(0, Math.ceil((online.startDeadline - Date.now()) / 1000));
      els.readyCountdown.textContent = `${left} sn`;
    };
    tick();
    readyTicker = setInterval(tick, 250);
  }

  function startFromBrief() {
    ensureAudio();
    if (setup.mode === 'friend') {
      if (!online.socket || online.side === null) return;
      els.briefStartButton.disabled = true;
      online.socket.emit('room:readyStart', {}, response => {
        if (!response?.ok) {
          els.briefStartButton.disabled = false;
          els.onlineReadyMessage.textContent = response?.error || 'Hazırlık bilgisi gönderilemedi.';
        }
      });
      return;
    }
    createMatch();
  }

  function createMatch() {
    if (setup.mode === 'friend') return;
    const settings = settingsFromUi();
    saveSettings();
    const totalSeconds = settings.durationMinutes * 60;
    match = {
      version: 5,
      mode: setup.mode,
      teams: setup.teams.map((team, side) => makeRuntimeTeam(team, side, settings)),
      settings,
      scores: [0, 0], activeSide: 0, activePlayerId: [null, null],
      context: { type: 'coinToss', owner: 0 }, pendingFoul: null, phase: 'kickoff',
      kickoff: { winner: null, readyToStart: false, face: null },
      firstHalfStarter: null, secondHalfStarter: null, passStreak: [0, 0],
      periodIndex: 0, periodElapsedMs: 0,
      periodDurationsMs: [totalSeconds * 500, totalSeconds * 500],
      regulationPeriodDurationsMs: [totalSeconds * 500, totalSeconds * 500], regulationSeconds: totalSeconds,
      totalElapsedMs: 0, possessionMs: [0, 0], rollElapsedMs: 0, turnElapsedMs: 0,
      delayWasteMs: [0, 0], stoppageMs: 0, stoppageAnnounced: false,
      lastFrame: performance.now(), running: true, paused: false, pausedBy: null, pauseStartedAt: null,
      pauseBudgetsMs: [60000, 60000], resolving: false, awaitingPeriodStart: false, awaitingPeriodSide: null,
      periodStartKey: null, events: [], winnerSide: null, shootout: null, series: null
    };
    showScreen('match');
    els.remoteMatchBar.classList.add('hidden');
    playAudioCue('ui.confirm');
    updateMatchUi(); startMatchLoop(); saveMatch();
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
      coinToss: 'YAZI TURA', kickoffReady: 'İLK DÜDÜK', playerSelect: 'OYUNCU SEÇİMİ', main: 'OLAY ATIŞI',
      foulResult: 'FAUL SONUCU', foulCard: 'KART ATIŞI', shotOpenPlay: 'ŞUT SONUCU',
      setPieceShot: match.context.reason === 'penalty' ? 'PENALTI' : 'FRİKİK', shootoutShot: 'SERİ PENALTI'
    };
    return labels[match.context.type] || 'ATIŞ';
  }


  function contextInstruction() {
    if (!match) return '';
    const actor = currentActor();
    const labels = {
      coinToss: 'Tek dokunuşla yazı tura atılır. Kazanan ilk yarıya, diğer takım ikinci yarıya başlar.',
      kickoffReady: `${match.teams[match.firstHalfStarter]?.name || 'Takım'} ilk düdüğü vermeli.`,
      playerSelect: 'Son rakam, topla buluşacak saha oyuncusunu belirler.',
      main: `${actor?.name || 'Seçilen oyuncu'} için olay sonucunu belirle.`,
      foulResult: 'Faulün frikik, penaltı veya serbest vuruş sonucunu belirle.', foulCard: 'Hakemin kart kararını belirle.',
      shotOpenPlay: '0 korner, 9 gol; diğer rakamlar kurtarış, direk veya aut.',
      setPieceShot: 'Çift rakam gol; tek rakam kurtarış, direk veya aut.',
      shootoutShot: 'Çift rakam gol; tek rakam kurtarış, direk veya aut.'
    };
    return labels[match.context.type] || 'Kronometreyi durdur.';
  }


  function stopButtonLabel() {
    if (!match) return 'DURDUR';
    const labels = {
      coinToss: 'YAZI TURA AT', kickoffReady: 'MAÇI BAŞLAT', playerSelect: 'OYUNCUYU BELİRLE', main: 'OLAYI BELİRLE',
      foulResult: 'FAUL SONUCUNU BELİRLE', foulCard: 'KARTI BELİRLE', shotOpenPlay: 'ŞUTU SONUÇLANDIR',
      setPieceShot: match.context.reason === 'penalty' ? 'PENALTIYI KULLAN' : 'FRİKİĞİ KULLAN', shootoutShot: 'PENALTIYI KULLAN'
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
        if (!response?.ok) { els.dialogButton.disabled = false; els.dialogText.textContent = response?.error || 'Devre başlatılamadı.'; }
      });
      return;
    }
    if (!canStartWaitingPeriod() && match.mode !== 'ai') return;
    const side = match.awaitingPeriodSide;
    match.awaitingPeriodStart = false;
    match.awaitingPeriodSide = null;
    match.periodStartKey = null;
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
    playAudioCue(match.phase === 'regulation' && match.periodIndex === 1 ? 'whistle.secondHalf' : 'whistle.kickoff', { replace: true, channel: 'whistle' });
    addEvent(`${match.teams[side].name} ${match.periodIndex === 1 ? 'ikinci devreye' : 'yeni devreye'} başladı`, true, { type: 'kickoff', side, title: 'Başlama vuruşu', detail: match.teams[side].name });
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
    const remoteTurn = match.mode === 'friend';
    const remoteDelta = remoteTurn && match.running && !match.paused && !match.resolving
      ? clamp(performance.now() - remoteSnapshotAt, 0, 350)
      : 0;
    const displayRoll = Number(match.rollElapsedMs || 0) + remoteDelta;
    const displayTurn = Number(match.turnElapsedMs || 0) + remoteDelta;
    const displayPeriod = Number(match.periodElapsedMs || 0) + ((match.phase === 'regulation' || match.phase === 'extra') ? remoteDelta : 0);
    const owner = Number.isInteger(match.context?.owner) ? match.context.owner : 0;
    const kickoffPhase = match.phase === 'kickoff' || ['coinToss', 'kickoffReady'].includes(match.context?.type);

    els.homeTeamName.textContent = match.teams[0].name;
    els.awayTeamName.textContent = match.teams[1].name;
    els.homeTeamBox.style.setProperty('--team-color', match.teams[0].color || match.settings?.teamColors?.[0] || '#d44735');
    els.awayTeamBox.style.setProperty('--team-color', match.teams[1].color || match.settings?.teamColors?.[1] || '#2878c8');
    els.homeScore.textContent = match.scores[0];
    els.awayScore.textContent = match.scores[1];
    els.homeCorners.textContent = match.teams[0].corners;
    els.awayCorners.textContent = match.teams[1].corners;
    els.homeTimeouts.textContent = match.teams[0].timeouts;
    els.awayTimeouts.textContent = match.teams[1].timeouts;

    if (kickoffPhase) {
      els.periodLabel.textContent = 'YAZI TURA';
      els.matchClock.textContent = match.context?.type === 'kickoffReady' ? 'HAZIR' : '90+';
    } else if (match.phase === 'shootout') {
      els.periodLabel.textContent = 'PENALTILAR';
      els.matchClock.textContent = `${match.shootout.scores[0]} — ${match.shootout.scores[1]}`;
    } else if (match.phase === 'finished') {
      els.periodLabel.textContent = 'MAÇ SONU';
      els.matchClock.textContent = formatClock(match.periodElapsedMs);
    } else {
      els.periodLabel.textContent = match.phase === 'extra' ? `UZATMA ${match.periodIndex + 1}` : `${match.periodIndex + 1}. DEVRE`;
      els.matchClock.textContent = formatClock(displayPeriod);
    }
    if (match.series?.leg === 2) {
      const base = match.series.aggregateBase || [0,0];
      const aggregate = [(base[0]||0)+(match.scores[0]||0),(base[1]||0)+(match.scores[1]||0)];
      els.periodLabel.textContent = `${els.periodLabel.textContent} · 2. AYAK`;
      els.addedTimeLabel.classList.remove('hidden');
      els.addedTimeLabel.textContent = `TOPLAM ${aggregate[0]}–${aggregate[1]}`;
    }

    const addedMs = Number(match.stoppageMs) || 0;
    const showAdded = match.phase === 'regulation' && match.periodIndex === 1 && (match.stoppageAnnounced || addedMs > 0);
    if (match.series?.leg === 2) {
      const base=match.series.aggregateBase||[0,0], aggregate=[(base[0]||0)+(match.scores[0]||0),(base[1]||0)+(match.scores[1]||0)];
      els.addedTimeLabel.classList.remove('hidden'); els.addedTimeLabel.textContent=`TOPLAM ${aggregate[0]}–${aggregate[1]}${showAdded ? ` · +${formatClock(addedMs)}` : ''}`;
    } else { els.addedTimeLabel.classList.toggle('hidden', !showAdded); els.addedTimeLabel.textContent = showAdded ? `+${formatClock(addedMs)}` : ''; }

    els.kickoffScoreCard.classList.toggle('hidden', !kickoffPhase);
    els.kickoffHomeDigit.textContent = Number.isInteger(match.firstHalfStarter) ? (match.firstHalfStarter === 0 ? '1. DEVRE' : '2. DEVRE') : '—';
    els.kickoffAwayDigit.textContent = Number.isInteger(match.firstHalfStarter) ? (match.firstHalfStarter === 1 ? '1. DEVRE' : '2. DEVRE') : '—';

    els.homeTeamBox.classList.toggle('active-turn', owner === 0 && match.phase !== 'finished');
    els.awayTeamBox.classList.toggle('active-turn', owner === 1 && match.phase !== 'finished');
    els.turnTeam.textContent = match.teams[owner]?.name || '90+ XI';
    els.rollContextLabel.textContent = contextLabel();
    els.rollInstruction.textContent = contextInstruction();
    els.matchStopEyebrow.textContent = match.context?.type === 'kickoffReady' ? 'İLK DÜDÜK' : 'KRONOMETRE';
    els.matchStopText.textContent = stopButtonLabel();

    const actor = currentActor();
    const selecting = match.context?.type === 'playerSelect';
    if (match.context?.type === 'coinToss') {
      els.activePlayerCaption.textContent = 'BAŞLAMA HAKKI';
      els.activePlayerName.textContent = 'YAZI · TURA';
      els.activePlayerMeta.textContent = 'Kazanan ilk yarıya, diğer taraf ikinci yarıya başlar';
    } else if (match.context?.type === 'kickoffReady') {
      els.activePlayerCaption.textContent = 'İLK DÜDÜK';
      els.activePlayerName.textContent = match.teams[match.firstHalfStarter]?.name || '—';
      els.activePlayerMeta.textContent = `${match.teams[match.secondHalfStarter]?.name || 'Rakip'} ikinci devreye başlayacak`;
    } else {
      els.activePlayerCaption.textContent = selecting ? 'SIRADAKİ OYUNCU' : 'TOPLA OYNAYAN';
      els.activePlayerName.textContent = selecting ? '—' : (actor?.name || '—');
      els.activePlayerMeta.textContent = selecting ? 'Kronometrenin son rakamı belirleyecek' : (actor ? `${actor.slot} · ${actor.rating} puan` : '—');
    }
    els.matchWatchDisplay.textContent = formatStopwatch(displayRoll);
    els.turnCountdown.textContent = match.context?.type === 'kickoffReady' ? '—' : Math.max(0, (10000 - displayTurn) / 1000).toFixed(1);

    const aiTurn = isAiSide(owner);
    const canRemoteStop = remoteTurn && online.connected && online.side === owner;
    els.matchStopButton.disabled = Boolean(match.awaitingPeriodStart) || (remoteTurn
      ? (!canRemoteStop || match.paused || match.resolving || !match.running)
      : (aiTurn || match.paused || match.resolving || !match.running));

    if (remoteTurn) {
      els.aiHint.textContent = online.side === owner ? 'Sıra sende — kronometreyi durdur.' : 'Rakibin kronometreyi kolluyor…';
      els.aiHint.classList.toggle('hidden', match.paused || match.resolving || !match.running || match.awaitingPeriodStart || match.context?.type === 'kickoffReady');
      els.remoteMatchBar.classList.remove('hidden');
      els.remoteRoomCode.textContent = online.code || '------';
      els.remoteConnectionText.textContent = online.connected ? (online.side === owner ? 'SIRA SENDE' : 'RAKİP OYNUYOR') : 'BAĞLANTI KESİLDİ';
      els.remoteConnectionText.classList.toggle('offline', !online.connected);
    } else {
      els.remoteMatchBar.classList.add('hidden');
      els.aiHint.textContent = selecting ? 'Rakip oyuncusunu seçiyor…' : 'Rakip olay sonucunu belirliyor…';
      els.aiHint.classList.toggle('hidden', !aiTurn || match.paused || match.resolving || match.awaitingPeriodStart || kickoffPhase);
    }

    const pauseSide = remoteTurn ? online.side : owner;
    const pauseBudget = Number.isInteger(pauseSide) ? Math.max(0, Number(match.pauseBudgetsMs?.[pauseSide]) || 0) : 0;
    els.pauseBudgetMini.textContent = `${Math.ceil(pauseBudget / 1000)} sn`;
    const ownPause = match.paused && match.pausedBy === pauseSide;
    const canPauseNow = Number.isInteger(pauseSide) && !kickoffPhase && !match.resolving && !match.awaitingPeriodStart && match.phase !== 'finished' && (
      ownPause || (!match.paused && match.context?.owner === pauseSide && pauseBudget > 0 && (!remoteTurn || online.connected))
    );
    els.pauseButton.disabled = !canPauseNow;
    els.pauseButtonLabel.textContent = ownPause ? 'DEVAM ET' : 'MOLA';
    els.pauseBudgetMini.textContent = `${Math.ceil(pauseBudget / 1000)} sn`;

    if (match.paused && Number.isInteger(match.pausedBy) && !match.awaitingPeriodStart) {
      const pauser = match.teams[match.pausedBy]?.name || 'Bir oyuncu';
      const remaining = Math.max(0, Number(match.pauseBudgetsMs?.[match.pausedBy]) || 0);
      els.pauseOverlayTitle.textContent = `${pauser} OYUNU DURAKLATTI`;
      els.pauseOverlayText.textContent = match.pausedBy === pauseSide ? 'Hazır olduğunda “Devam Et” düğmesine basabilirsin.' : 'Rakibin mola süresi boyunca maç saati durur.';
      els.pauseOverlayCountdown.textContent = formatClock(remaining);
      if (els.resumePauseButton) {
        const canResume = match.pausedBy === pauseSide;
        els.resumePauseButton.disabled = !canResume;
        els.resumePauseButton.textContent = canResume ? 'DEVAM ET' : `${pauser.toLocaleUpperCase('tr')} BEKLENİYOR`;
      }
      els.pauseOverlay.classList.remove('hidden');
    } else {
      els.pauseOverlay.classList.add('hidden');
    }

    renderLiveTimeline();
    syncPeriodStartDialog();
    if (!els.squadsOverlay.classList.contains('hidden')) renderMatchSquad();
  }

  function eventIcon(event) {
    const icons = { goal:'⚽', yellow:'▰', red:'■', secondYellow:'▰', foul:'!', corner:'⌜', throwIn:'↗', turnover:'×', save:'🧤', post:'▥', wide:'↗', shot:'➤', timeout:'⏱', player:'●', pass:'→', freeKick:'★', penalty:'●', kickoff:'◉', stoppage:'+' };
    return icons[event.type] || '•';
  }

  function renderLiveTimeline() {
    if (!match) return;
    const markup = items => items.map(event => `<li><time>${event.minute}’</time><span><b>${eventIcon(event)}</b> ${escapeHtml(event.text)}</span></li>`).join('');
    els.liveTimeline.innerHTML = markup(match.events.slice(-5).reverse());
    if (els.overlayTimeline) els.overlayTimeline.innerHTML = markup([...match.events].reverse());
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


  function clearAiTimer() {
    if (aiTimer) clearTimeout(aiTimer);
    aiTimer = null;
  }

  function scheduleAiIfNeeded() {
    clearAiTimer();
    if (!match || match.paused || match.resolving || match.awaitingPeriodStart) return;
    const side = match.context.owner;
    if (!isAiSide(side)) return;
    if (match.context.type === 'coinToss' && match.mode !== 'friend') { clearAiTimer(); match.running = false; match.resolving = true; resolveCoinToss(); return; }
    if (match.context.type === 'kickoffReady') {
      aiTimer = setTimeout(() => stopMatchRoll('ai'), 1200);
      return;
    }
    if (!match.running) return;
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
      if (match.paused && Number.isInteger(match.pausedBy)) {
        match.pauseBudgetsMs[match.pausedBy] = Math.max(0, match.pauseBudgetsMs[match.pausedBy] - dt);
        if (match.pauseBudgetsMs[match.pausedBy] <= 0) resumePausedMatch(true);
        updateMatchUi();
      } else if (match.running && !match.resolving && !match.awaitingPeriodStart) {
        match.rollElapsedMs += dt;
        if (match.context.type !== 'kickoffReady') match.turnElapsedMs += dt;
        if (match.phase === 'regulation' || match.phase === 'extra') {
          match.periodElapsedMs += dt;
          if (match.phase === 'regulation') match.totalElapsedMs += dt;
          match.possessionMs[match.context.owner] += dt;
        }
        if (match.context.type !== 'kickoffReady' && match.turnElapsedMs >= 10000) {
          handleTurnTimeout();
        } else if ((match.phase === 'regulation' || match.phase === 'extra') && match.periodElapsedMs >= currentPeriodTargetMs()) {
          if (!maybeAnnounceStoppage()) endCurrentPeriod();
        }
        updateMatchUi();
      }
      matchRaf = requestAnimationFrame(loop);
    };
    matchRaf = requestAnimationFrame(loop);
  }

  function currentPeriodTargetMs() {
    if (!match) return 0;
    const base = Number(match.periodDurationsMs?.[match.periodIndex]) || 0;
    if (match.phase === 'regulation' && match.periodIndex === 1) return base + (Number(match.stoppageMs) || 0);
    return base;
  }

  function maybeAnnounceStoppage() {
    if (!match || match.phase !== 'regulation' || match.periodIndex !== 1 || match.stoppageAnnounced) return false;
    match.stoppageAnnounced = true;
    match.stoppageMs = Core.calculateStoppageTimeMs(match.delayWasteMs, match.settings.durationMinutes);
    if (!match.stoppageMs) return false;
    const shown = Core.formatAddedTimeMinutes(match.stoppageMs);
    addEvent(`Hakem ${shown} dakika ek süre gösterdi`, true, { type: 'stoppage', side: null, title: `+${shown}`, detail: 'Hakemin ek süresi' });
    transitionTo(match.context.owner, { ...match.context }, { title: `+${shown}`, subtitle: `${Math.round(match.stoppageMs / 1000)} saniye ek süre oynanacak`, tone: 'navy', kicker: '90+ HAKEM KARARI', duration: 3200 });
    return true;
  }

  function recordRollDelay(side) {
    if (!match || match.phase === 'kickoff' || match.context.type === 'kickoffReady') return;
    const excess = Math.max(0, Number(match.turnElapsedMs) - 1000);
    match.delayWasteMs[side] = (Number(match.delayWasteMs[side]) || 0) + excess;
  }

  function resolveCoinToss() {
    const winner = Math.random() < .5 ? 0 : 1;
    match.kickoff.winner = winner; match.kickoff.face = winner === 0 ? 'YAZI' : 'TURA';
    match.firstHalfStarter = winner; match.secondHalfStarter = winner === 0 ? 1 : 0;
    match.kickoff.readyToStart = true;
    addEvent(`${match.teams[winner].name} yazı turayı kazandı`, true, { type: 'kickoff', side: winner, title: 'Yazı tura', detail: 'İlk yarı başlangıcı' });
    transitionTo(winner, { type: 'kickoffReady' }, { title: match.kickoff.face, subtitle: `${match.teams[winner].name} ilk yarıya başlayacak. ${match.teams[match.secondHalfStarter].name} ikinci yarıya başlayacak.`, tone: 'yellow', kicker: 'BAŞLAMA HAKKI', duration: 4200, type: 'kickoff' });
  }

  function beginAfterKickoff() {
    const side = match.firstHalfStarter ?? 0;
    match.phase = 'regulation'; match.periodIndex = 0; match.periodElapsedMs = 0; match.totalElapsedMs = 0;
    match.stoppageAnnounced = false; match.stoppageMs = 0;
    addEvent(`${match.teams[side].name} ilk yarıya başladı`, true, { type: 'kickoff', side, title: 'Başlama vuruşu', detail: match.teams[side].name });
    playAudioCue('whistle.kickoff', { replace: true, channel: 'whistle' });
    resetRoll(side, { type: 'playerSelect' });
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
    match.pausedBy = null;
    match.pauseStartedAt = null;
    if (context.type === 'playerSelect') match.activePlayerId[owner] = null;
    if (['foulResult', 'foulCard', 'setPieceShot', 'shotOpenPlay', 'shootoutShot'].includes(context.type) && !match.activePlayerId[owner]) pickRestartPlayer(owner);
    updateMatchUi();
    scheduleAiIfNeeded();
    saveMatch();
  }

  function showEventOverlay(title, subtitle, tone = 'red', kicker = '', duration = 3000, callback) {
    clearTimeout(overlayTimer);
    const titleText = String(title || 'OLAY');
    const important = /GOL|KIRMIZI|PENALTI|FAUL|KURTARDI|HÜKMEN|EŞİTLİK|BAŞLAMA/i.test(titleText);
    const pref = match?.settings?.eventDuration || els.eventDurationSelect?.value || 'long';
    const multiplier = pref === 'normal' ? .9 : pref === 'extra' ? 1.55 : 1.2;
    const readableDuration = Math.round(Math.max(important ? 3400 : 2600, Number(duration) || 3000) * multiplier);
    els.eventOverlay.className = `event-overlay ${tone}`;
    els.eventOverlay.classList.remove('hidden');
    els.overlayTitle.textContent = titleText;
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
    if (!match || match.paused || match.resolving || match.awaitingPeriodStart) return;
    if (match.context.type === 'coinToss' && match.mode !== 'friend') { clearAiTimer(); match.running = false; match.resolving = true; resolveCoinToss(); return; }
    if (match.context.type === 'kickoffReady') {
      if (match.mode === 'friend') {
        if (!online.socket || !online.connected || online.side !== match.context.owner) return;
        els.matchStopButton.disabled = true;
        online.socket.emit('match:stop', { digit: 0 }, response => { if (!response?.ok) updateMatchUi(); });
      } else {
        if (source !== 'ai' && isAiSide(match.context.owner)) return;
        beginAfterKickoff();
      }
      return;
    }
    if (!match.running) return;
    if (match.mode === 'friend') {
      if (!online.socket || !online.connected || online.side !== match.context.owner) return;
      const elapsed = match.rollElapsedMs + clamp(performance.now() - remoteSnapshotAt, 0, 350);
      const digit = digitFromMs(elapsed);
      els.matchStopButton.disabled = true;
      playAudioCue('timer.stop', { replace: true, channel: 'timer' });
      online.socket.emit('match:stop', { digit }, response => {
        if (!response?.ok) { setOnlineStatus(response?.error || 'Atış gönderilemedi.', 'error'); updateMatchUi(); }
      });
      return;
    }
    if (source !== 'ai' && isAiSide(match.context.owner)) return;
    clearAiTimer();
    playAudioCue('timer.stop', { replace: true, channel: 'timer' });
    const side = match.context.owner;
    const digit = digitFromMs(match.rollElapsedMs);
    recordRollDelay(side);
    match.running = false;
    match.resolving = true;
    resolveRoll(digit);
  }

  function resolveRoll(digit) {
    const type = match.context.type;
    if (type === 'coinToss') resolveCoinToss();
    else if (type === 'playerSelect') resolvePlayerSelection(digit);
    else if (type === 'main') resolveMainEvent(digit);
    else if (type === 'foulResult') resolveFoulResult(digit);
    else if (type === 'foulCard') resolveFoulCard(digit);
    else if (type === 'shotOpenPlay') resolveOpenPlayShot(digit);
    else if (type === 'setPieceShot') resolveSetPieceShot(digit);
    else if (type === 'shootoutShot') resolveShootoutShot(digit);
  }

  function resolvePlayerSelection(digit) {
    const side = match.context.owner;
    const chosen = mapActivePlayerFromDigit(digit) || pickRestartPlayer(side, digit);
    addEvent(`${chosen?.name || 'Oyuncu'} topla buluştu`, false, { type: 'player', side, playerId: chosen?.id, title: chosen?.name || 'Oyuncu', detail: `${match.teams[side].name} · Topla buluştu` });
    playMatchEventAudio('player');
    transitionTo(side, { type: 'main' }, { title: chosen?.name || 'OYUNCU', subtitle: `${chosen?.slot || ''} · ${chosen?.rating || ''} puan. Şimdi bu oyuncunun olayını belirle.`, tone: 'navy', kicker: `OYUNCU SEÇİMİ · RAKAM ${digit}`, duration: 3000 });
  }

  function resolveMainEvent(digit) {
    const side = match.context.owner, other = side === 0 ? 1 : 0;
    const actor = currentActor() || pickRestartPlayer(side, digit);
    match.passStreak ||= [0, 0];
    const event = Core.mainEventForDigit(digit, match.passStreak[side]);
    if (event.key !== 'pass') match.passStreak[side] = 0;

    if (event.key === 'goal') {
      match.scores[side] += 1; if (actor) actor.goals = (Number(actor.goals) || 0) + 1;
      addEvent(`${actor?.name || match.teams[side].name} gol attı`, true, { type:'goal', side, playerId:actor?.id, title:actor?.name || match.teams[side].name, detail:'Gol' });
      playMatchEventAudio('goal');
      transitionTo(other, { type:'playerSelect' }, { title:'GOL!', subtitle:`${actor?.name || match.teams[side].name} ağları buldu. Başlama rakipte.`, tone:'red', kicker:`RAKAM ${digit}`, duration:5200 }); return;
    }
    if (event.key === 'pass') {
      match.passStreak[side] += 1;
      addEvent(`${actor?.name || 'Oyuncu'} pas yaptı`, false, { type:'pass', side, playerId:actor?.id, title:actor?.name || 'Oyuncu', detail:`${match.passStreak[side]}. pas` });
      playMatchEventAudio('pass');
      const warning = match.passStreak[side] >= 2 ? ' İki pas sınırına ulaşıldı; sonraki olay atışında pas rakamları taç ve auta dönüşecek.' : '';
      transitionTo(side, { type:'playerSelect' }, { title:'PAS', subtitle:`${actor?.name || 'Oyuncu'} pasını verdi.${warning}`, tone:'green', kicker:`RAKAM ${digit} · ${match.passStreak[side]}/2`, duration: match.passStreak[side] >= 2 ? 4200 : 2800 }); return;
    }
    if (event.key === 'shot') {
      addEvent(`${actor?.name || match.teams[side].name} şut pozisyonuna girdi`, true, { type:'shot', side, playerId:actor?.id, title:'Şut', detail:actor?.name || '' });
      playAudioCue('ball.shot', { channel:'ball' });
      transitionTo(side, { type:'shotOpenPlay' }, { title:'ŞUT!', subtitle:'Sonuç için yeniden kronometreyi durdur: 0 korner, 9 gol; diğerleri kurtarış, direk veya aut.', tone:'yellow', kicker:`RAKAM ${digit}`, duration:4200 }); return;
    }
    if (event.key === 'throwIn') {
      addEvent(`${match.teams[other].name} taç kazandı`, false, { type:'throwIn', side:other, title:'Taç', detail:'Top rakibe geçti' }); playMatchEventAudio('throwIn');
      transitionTo(other, { type:'playerSelect' }, { title:'TAÇ', subtitle:`Top ${match.teams[other].name} tarafına geçti.`, tone:'navy', kicker:`RAKAM ${digit}`, duration:3000 }); return;
    }
    if (event.key === 'turnover') {
      addEvent(`${actor?.name || match.teams[side].name} topu kaybetti`, false, { type:'turnover', side, playerId:actor?.id, title:'Aut / top kaybı', detail:actor?.name || '' }); playMatchEventAudio('turnover');
      transitionTo(other, { type:'playerSelect' }, { title:'AUT', subtitle:`Top ${match.teams[other].name} takımında.`, tone:'navy', kicker:`RAKAM ${digit}`, duration:3000 }); return;
    }
    if (event.key === 'corner') {
      const outcome = Core.registerCorner(match.teams[side].corners); match.teams[side].corners = outcome.corners;
      if (outcome.penalty) {
        addEvent(`${match.teams[side].name}: 3. kornerden penaltı`, true, { type:'penalty', side, title:'Penaltı', detail:'3. korner' }); playMatchEventAudio('penalty');
        transitionTo(side, { type:'setPieceShot', reason:'penalty' }, { title:'PENALTI!', subtitle:'Üçüncü korner penaltıya dönüştü; sayaç sıfırlandı.', tone:'yellow', kicker:'3 KORNER = 1 PENALTI', duration:4300 });
      } else {
        addEvent(`${match.teams[side].name} korner sayacını ${outcome.corners}/3 yaptı`, false, { type:'corner', side, title:'Korner sayacı', detail:`${outcome.corners}/3` }); playMatchEventAudio('corner');
        transitionTo(side, { type:'playerSelect' }, { title:'KORNER SAYACI', subtitle:`Korner kullanılmaz. Sayaç ${outcome.corners}/3; üçüncü korner penaltıdır.`, tone:'green', kicker:`RAKAM ${digit}`, duration:3600 });
      } return;
    }
    if (event.key === 'foul') {
      match.pendingFoul = { foulerSide:side, victimSide:other, foulerId:actor?.id || null, result:null };
      addEvent(`${actor?.name || match.teams[side].name} faul yaptı`, true, { type:'foul', side, playerId:actor?.id, title:'Faul', detail:actor?.name || '' }); playMatchEventAudio('foul'); pickRestartPlayer(other);
      transitionTo(other, { type:'foulResult' }, { title:'FAUL!', subtitle:`${match.teams[other].name} önce faul sonucunu, sonra kartı belirleyecek.`, tone:'yellow', kicker:`RAKAM ${digit}`, duration:4200 }); return;
    }
    if (event.key === 'freeKick') {
      addEvent(`${match.teams[side].name} frikik kazandı`, true, { type:'freeKick', side, playerId:actor?.id, title:'Frikik', detail:actor?.name || '' }); playMatchEventAudio('freeKick');
      transitionTo(side, { type:'setPieceShot', reason:'freeKick' }, { title:'FRİKİK!', subtitle:'Çift rakam gol; tek rakam kurtarış, direk veya aut.', tone:'yellow', kicker:`RAKAM ${digit}`, duration:3600 });
    }
  }


  function resolveFoulResult(digit) {
    const foul = match.pendingFoul;
    if (!foul) { transitionTo(match.context.owner, { type:'playerSelect' }); return; }
    foul.result = Core.foulResultForDigit(digit);
    const labels = { freeKick:'FRİKİK', penalty:'PENALTI', indirect:'SERBEST VURUŞ' };
    addEvent(`Faul sonucu: ${labels[foul.result]}`, false, { type:foul.result === 'penalty' ? 'penalty' : 'freeKick', side:foul.victimSide, title:labels[foul.result], detail:'Hakem kararı' });
    if (foul.result === 'penalty') playAudioCue('whistle.penalty', { replace:true, channel:'whistle' });
    else playAudioCue('whistle.freeKick', { replace:true, channel:'whistle' });
    if (match.settings.cards) transitionTo(foul.victimSide, { type:'foulCard' }, { title:labels[foul.result], subtitle:'Şimdi hakemin kart kararını belirle.', tone:foul.result === 'penalty' ? 'yellow' : 'navy', kicker:`RAKAM ${digit}`, duration:3200 });
    else continueAfterFoulCard(null);
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
    if (card === 'yellow') playMatchEventAudio(cardedPlayer?.red ? 'secondYellow' : 'yellow');
    else if (card === 'red') playMatchEventAudio('red');
    else playAudioCue('cards.none', { replace:true, channel:'card' });
    continueAfterFoulCard({ title: cardTitle, subtitle: cardedPlayer?.name || 'Hakem devam dedi', tone, kicker: `Rakam ${digit}`, duration: 2300 }, digit);
  }

  function continueAfterFoulCard(cardOverlay) {
    const foul = match.pendingFoul;
    if (!foul) { transitionTo(match.context.owner, { type:'playerSelect' }, cardOverlay); return; }
    const owner = foul.victimSide, result = foul.result; match.pendingFoul = null;
    if (result === 'freeKick' || result === 'penalty') {
      transitionTo(owner, { type:'setPieceShot', reason:result }, cardOverlay || { title:result === 'penalty' ? 'PENALTI' : 'FRİKİK', subtitle:'Final atışı için kronometreyi durdur.', tone:'yellow', duration:3300 });
    } else {
      pickRestartPlayer(owner);
      transitionTo(owner, { type:'playerSelect' }, cardOverlay || { title:'SERBEST VURUŞ', subtitle:`${match.teams[owner].name} topa sahip; yeni oyuncu seçilecek.`, tone:'green', duration:3000 });
    }
  }


  function shotOutcomeCopy(result, contextLabel) {
    if (result === 'saved') return { title:'KALECİ KURTARDI', detail:`${contextLabel} kalecinin ellerinde kaldı.`, type:'save', tone:'navy', audio:['ball.shot','ball.save','crowd.bigCheer'] };
    if (result === 'post') return { title:'DİREKTE PATLADI', detail:`${contextLabel} direkten oyun alanı dışına çıktı.`, type:'post', tone:'yellow', audio:['ball.shot','ball.post','crowd.disappointment'] };
    return { title:'AUT', detail:`${contextLabel} kaleyi bulmadı; top rakibe geçti.`, type:'wide', tone:'navy', audio:['ball.shot','crowd.disappointment'] };
  }

  function resolveOpenPlayShot(digit) {
    const side = match.context.owner, other = side === 0 ? 1 : 0;
    const actor = currentActor() || pickRestartPlayer(side); const result = Core.shotForDigit(digit);
    match.passStreak[side] = 0;
    if (result === 'goal') {
      match.scores[side] += 1; if (actor) actor.goals = (actor.goals || 0) + 1;
      addEvent(`${actor?.name || match.teams[side].name} şuttan gol attı`, true, { type:'goal', side, playerId:actor?.id, title:actor?.name || 'Gol', detail:'Açık oyun şutu' }); playMatchEventAudio('goal');
      transitionTo(other, { type:'playerSelect' }, { title:'GOL!', subtitle:`${actor?.name || match.teams[side].name} şutu ağlara gönderdi.`, tone:'red', kicker:`ŞUT SONUCU · ${digit}`, duration:5200 }); return;
    }
    if (result === 'corner') {
      const outcome = Core.registerCorner(match.teams[side].corners); match.teams[side].corners = outcome.corners;
      if (outcome.penalty) {
        addEvent(`${match.teams[side].name}: şuttan gelen 3. korner penaltı`, true, { type:'penalty', side, title:'Penaltı', detail:'3. korner' }); playAudioCue('whistle.penalty');
        transitionTo(side, { type:'setPieceShot', reason:'penalty' }, { title:'PENALTI!', subtitle:'Şuttan çıkan korner üçüncü kornerdi; sayaç sıfırlandı.', tone:'yellow', kicker:'ŞUT · RAKAM 0', duration:4300 });
      } else {
        addEvent(`${match.teams[side].name} şuttan korner kazandı (${outcome.corners}/3)`, true, { type:'corner', side, title:'Korner', detail:`${outcome.corners}/3` }); playMatchEventAudio('corner');
        transitionTo(other, { type:'playerSelect' }, { title:'KORNER', subtitle:`Korner sayacı ${outcome.corners}/3 oldu. Şut sonucu sonrası top rakibe geçer.`, tone:'green', kicker:'ŞUT · RAKAM 0', duration:3700 });
      } return;
    }
    const copy = shotOutcomeCopy(result, 'Şut'); addEvent(`${actor?.name || 'Oyuncu'}: ${copy.title.toLocaleLowerCase('tr')}`, true, { type:copy.type, side, playerId:actor?.id, title:copy.title, detail:actor?.name || '' }); playAudioCue(copy.audio, { stagger:100 });
    transitionTo(other, { type:'playerSelect' }, { title:copy.title, subtitle:copy.detail, tone:copy.tone, kicker:`ŞUT · RAKAM ${digit}`, duration:4300 });
  }

  function resolveSetPieceShot(digit) {
    const side = match.context.owner, other = side === 0 ? 1 : 0, reason = match.context.reason;
    const actor = currentActor() || pickRestartPlayer(side); const result = Core.setPieceOutcomeForDigit(digit);
    if (result === 'goal') {
      match.scores[side] += 1; if (actor) actor.goals = (actor.goals || 0) + 1;
      addEvent(`${actor?.name || match.teams[side].name} ${reason === 'penalty' ? 'penaltıdan' : 'frikikten'} gol attı`, true, { type:'goal', side, playerId:actor?.id, title:actor?.name || 'Gol', detail:reason === 'penalty' ? 'Penaltı golü' : 'Frikik golü' });
      reason === 'penalty' ? playAudioCue('setPiece.penaltyGoal') : playMatchEventAudio('goal');
      transitionTo(other, { type:'playerSelect' }, { title:'GOL!', subtitle:`Çift rakam gol getirdi. Başlama ${match.teams[other].name} takımında.`, tone:'red', kicker:`RAKAM ${digit} · ÇİFT`, duration:5200 }); return;
    }
    const label = reason === 'penalty' ? 'Penaltı' : 'Frikik'; const copy = shotOutcomeCopy(result, label);
    addEvent(`${label}: ${copy.title.toLocaleLowerCase('tr')}`, true, { type:copy.type, side, playerId:actor?.id, title:copy.title, detail:label });
    if (reason === 'penalty') playAudioCue(result === 'saved' ? 'setPiece.penaltySave' : 'setPiece.penaltyMiss'); else playAudioCue(copy.audio, { stagger:100 });
    transitionTo(other, { type:'playerSelect' }, { title:copy.title, subtitle:`Tek rakam gol olmadı: ${copy.detail}`, tone:copy.tone, kicker:`RAKAM ${digit} · TEK`, duration:4400 });
  }


  function handleTurnTimeout() {
    if (!match || match.resolving) return;
    clearAiTimer();
    match.running = false;
    match.resolving = true;
    const side = match.context.owner;
    const other = side === 0 ? 1 : 0;
    match.delayWasteMs[side] = (Number(match.delayWasteMs[side]) || 0) + 9000;
    const outcome = Core.registerTimeout(match.teams[side].timeouts);
    match.teams[side].timeouts = outcome.count;
    addEvent(`${match.teams[side].name}: 10 saniye ihlali (${outcome.count})`, true, { type: 'timeout', side, title: 'Süre ihlali', detail: `${outcome.count}. ihlal` });
    playMatchEventAudio('timeout', `${outcome.count}. ihlal`);
    if (outcome.consequence === 'turnover') {
      transitionTo(other, { type: 'playerSelect' }, { title: 'SÜRE DOLDU', subtitle: `${outcome.count}. ihlal: yalnızca top kaybı.`, tone: 'navy', kicker: `${outcome.count}. İHLAL`, duration: 3600 });
    } else if (outcome.consequence === 'penaltyAgainst') {
      pickRestartPlayer(other);
      playAudioCue('violation.penalty');
      transitionTo(other, { type: 'setPieceShot', reason: 'penalty' }, { title: 'PENALTI!', subtitle: 'Üçüncü vakit ihlali rakibe penaltı verdi.', tone: 'yellow', kicker: '3. İHLAL', duration: 4300 });
    } else if (outcome.consequence === 'redCard') {
      const actor = currentActor() || randomItem(availableOutfield(side));
      if (actor) { markPlayerUnavailable(side, actor.id, 'red'); actor.sentOffReason = 'timeoutRed'; }
      addEvent(`${actor?.name || match.teams[side].name} vakit ihlalinden kırmızı kart gördü`, true, { type: 'red', side, playerId: actor?.id, title: actor?.name || match.teams[side].name, detail: 'Süre ihlali kırmızısı' });
      playAudioCue('violation.red');
      transitionTo(other, { type: 'playerSelect' }, { title: 'KIRMIZI!', subtitle: 'Dördüncü vakit ihlali: takım bir kişi eksildi.', tone: 'red', kicker: '4. İHLAL', duration: 4500 });
    } else {
      match.scores = Core.forfeitScore(match.scores, side);
      addEvent(`${match.teams[side].name} hükmen mağlup`, true, { type: 'forfeit', side, title: 'Hükmen mağlubiyet', detail: '5. süre ihlali' });
      playAudioCue('violation.forfeit');
      showEventOverlay('HÜKMEN!', 'Beşinci vakit ihlali — maç bitti.', 'red', '5. İHLAL', 5200, () => finishMatch(other));
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
    match.pausedBy = null;
    match.resolving = false;
    match.awaitingPeriodStart = true;
    match.awaitingPeriodSide = side;
    match.periodStartKey = `${phase}-${periodIndex}-${Date.now()}`;
    if (phase === 'regulation' && periodIndex === 1) {
      match.stoppageAnnounced = false;
      match.stoppageMs = 0;
      playAudioCue('whistle.halftime', { replace: true, channel: 'whistle' });
    }
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
      const starter = phase === 'regulation' ? (match.secondHalfStarter ?? 1) : (match.firstHalfStarter === 0 ? 1 : 0);
      preparePeriodStart(starter, phase, 1);
      return;
    }
    if (phase === 'regulation' && match.scores[0] === match.scores[1] && match.settings.extraTime) {
      const extraTotal = Core.roundExtraTimeSeconds(match.regulationSeconds) * 1000;
      match.periodDurationsMs = [extraTotal / 2, extraTotal / 2];
      preparePeriodStart(match.firstHalfStarter ?? 0, 'extra', 0);
      return;
    }
    if (match.scores[0] === match.scores[1] && match.settings.shootout) startShootout();
    else {
      playAudioCue('whistle.fulltime', { replace: true, channel: 'whistle' });
      finishMatch(match.scores[0] === match.scores[1] ? null : (match.scores[0] > match.scores[1] ? 0 : 1));
    }
  }

  function openDialog(eyebrow, title, text, buttonText, action, secondary = null) {
    els.dialogEyebrow.textContent = eyebrow;
    els.dialogTitle.textContent = title;
    els.dialogText.textContent = text;
    els.dialogButton.textContent = buttonText;
    els.dialogButton.disabled = false;
    dialogAction = action;
    dialogSecondaryAction = secondary?.action || null;
    if (els.dialogSecondaryButton) {
      els.dialogSecondaryButton.textContent = secondary?.text || 'VAZGEÇ';
      els.dialogSecondaryButton.classList.toggle('hidden', !secondary);
    }
    els.dialogOverlay.classList.remove('hidden');
  }

  function closeDialog() {
    els.dialogOverlay.classList.add('hidden');
    els.dialogSecondaryButton?.classList.add('hidden');
    const action = dialogAction;
    dialogAction = null;
    dialogSecondaryAction = null;
    if (action) action();
  }

  function closeDialogSecondary() {
    els.dialogOverlay.classList.add('hidden');
    els.dialogSecondaryButton?.classList.add('hidden');
    const action = dialogSecondaryAction;
    dialogAction = null;
    dialogSecondaryAction = null;
    if (action) action();
  }

  function startShootout() {
    clearAiTimer();
    match.phase = 'shootout';
    match.shootout = { scores: [0, 0], kicks: [0, 0] };
    pickRestartPlayer(0);
    openDialog('BERABERLİK', 'SERİ PENALTI', 'Beşer vuruş. Çift rakam gol; tek rakamda kaleci kurtarışı, direk veya aut görülebilir.', 'İLK VURUŞ', () => {
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
    const actor = currentActor(side) || pickRestartPlayer(side);
    const result = Core.setPieceOutcomeForDigit(digit);
    match.shootout.kicks[side] += 1;
    if (result === 'goal') match.shootout.scores[side] += 1;
    const resultLabel = result === 'goal' ? 'GOL' : result === 'saved' ? 'KALECİ KURTARDI' : result === 'post' ? 'DİREKTE PATLADI' : 'AUT';
    addEvent(`${match.teams[side].name} seri penaltı: ${resultLabel}`, true, { type: result === 'goal' ? 'goal' : result === 'saved' ? 'save' : result, side, playerId: actor?.id, title: resultLabel, detail: 'Seri penaltı' });
    if (result === 'goal') playAudioCue('setPiece.penaltyGoal');
    else if (result === 'saved') playAudioCue('setPiece.penaltySave');
    else if (result === 'post') playAudioCue(['ball.shot','ball.post','crowd.disappointment'], { stagger: 100 });
    else playAudioCue('setPiece.penaltyMiss');

    const winner = shootoutWinner();
    if (winner !== null) {
      showEventOverlay('BİTTİ!', `${match.teams[winner].name} penaltılarla kazandı`, 'red', `${match.shootout.scores[0]} — ${match.shootout.scores[1]}`, 2300, () => finishMatch(winner));
      return;
    }

    const next = side === 0 ? 1 : 0;
    pickRestartPlayer(next);
    transitionTo(next, { type: 'shootoutShot' }, {
      title: result === 'goal' ? 'GOL!' : result === 'saved' ? 'KALECİ KURTARDI!' : result === 'post' ? 'DİREKTE PATLADI!' : 'AUT!',
      subtitle: `${resultLabel} · Seri ${match.shootout.scores[0]} — ${match.shootout.scores[1]}`,
      tone: result === 'goal' ? 'red' : result === 'post' ? 'yellow' : 'navy',
      kicker: `SERİ PENALTI · Rakam ${digit}`,
      duration: 3900
    });
  }

  function resumePausedMatch(automatic = false) {
    if (!match?.paused || !Number.isInteger(match.pausedBy)) return;
    const side = match.pausedBy;
    match.paused = false;
    match.running = true;
    match.pausedBy = null;
    match.pauseStartedAt = null;
    match.lastFrame = performance.now();
    els.pauseOverlay.classList.add('hidden');
    if (automatic) showEventOverlay('MOLA BİTTİ', `${match.teams[side].name} takımının mola hakkı tükendi.`, 'navy', '60 SANİYE', 2800);
    scheduleAiIfNeeded();
    updateMatchUi();
    saveMatch();
  }

  function pauseMatch() {
    if (!match || match.resolving || match.awaitingPeriodStart || match.phase === 'kickoff' || match.context.type === 'kickoffReady') return;
    const requestingSide = match.mode === 'friend' ? online.side : match.context.owner;
    if (!Number.isInteger(requestingSide)) return;
    if (match.mode === 'friend') {
      if (!online.socket || !online.connected) return;
      online.socket.emit('match:pause', {}, response => {
        if (!response?.ok) setOnlineStatus(response?.error || 'Maç duraklatılamadı.', 'error');
      });
      return;
    }
    if (isAiSide(requestingSide)) return;
    if (match.paused) {
      if (match.pausedBy !== requestingSide) return;
      resumePausedMatch(false);
      return;
    }
    if (match.context.owner !== requestingSide) return;
    if ((match.pauseBudgetsMs?.[requestingSide] || 0) <= 0) {
      showEventOverlay('MOLA HAKKI BİTTİ', 'Bu takım 60 saniyelik mola bütçesini kullandı.', 'navy', '', 3000);
      return;
    }
    clearAiTimer();
    match.paused = true;
    match.running = false;
    match.pausedBy = requestingSide;
    match.pauseStartedAt = performance.now();
    playAudioCue('ui.confirm');
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
    const eventColor = Number.isInteger(event.side) ? (match?.teams?.[event.side]?.color || TEAM_COLORS[event.side]?.value || '#cf3832') : '#17213a';
    return `<div class="timeline-event ${sideClass}" style="--event-color:${escapeHtml(eventColor)}"><span class="timeline-icon">${icon}</span><div><strong>${escapeHtml(title)}</strong>${detail ? `<small>${escapeHtml(detail)}</small>` : ''}</div></div>`;
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
    if (match.series?.leg === 2) { const b=match.series.aggregateBase||[0,0], a=[b[0]+match.scores[0],b[1]+match.scores[1]]; els.finalScore.textContent=`${match.scores[0]} — ${match.scores[1]} · TOPLAM ${a[0]}—${a[1]}${shootoutSuffix}`; }
    else els.finalScore.textContent = `${match.scores[0]} — ${match.scores[1]}${shootoutSuffix}`;
    els.winnerText.textContent = winnerSide === null ? 'BERABERE' : `${match.teams[winnerSide].name} KAZANDI`;
    const viewerSide = match.mode === 'friend' ? online.side : 0;
    if (winnerSide === null) playAudioCue('matchEnd.draw', { replace: true, channel: 'match-end' });
    else if (match.shootout && winnerSide === viewerSide) playAudioCue('matchEnd.shootoutVictory', { replace: true, channel: 'match-end' });
    else playAudioCue(winnerSide === viewerSide ? 'matchEnd.victory' : 'matchEnd.defeat', { replace: true, channel: 'match-end' });
    const possession = Core.possessionPercent(match.possessionMs);
    els.possessionResult.textContent = `${possession[0]}% — ${possession[1]}%`;
    renderResultTimeline();
    const canRequest = match.mode !== 'friend' || match.winnerSide === null || online.side !== match.winnerSide;
    els.rematchButton.textContent = match.mode === 'friend' ? 'RÖVANŞ İSTE' : 'RÖVANŞ';
    els.rematchButton.disabled = !canRequest;
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
    setup.criteria = { nationality: '', league: '', position: '', rating: '' };
    els.nationalitySelect.value = '';
    els.leagueSelect.value = '';
    if (els.positionSelect) els.positionSelect.value = '';
    if (els.ratingSelect) els.ratingSelect.value = '';
    els.manualSearch.value = '';
    initializeFilters();
    initializeSettings();
    Audio?.setAmbience('ambience.menu');
    Audio?.tryAutoplay?.().catch(() => false);
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
    else if (target === 'settings') showScreen('settings');
    else if (target === 'lobby') showScreen('lobby');
  }

  function browserBackTarget() {
    if (els.eventOverlay && !els.eventOverlay.classList.contains('hidden')) { els.eventOverlay.classList.add('hidden'); return currentScreenName; }
    if (els.eventsOverlay && !els.eventsOverlay.classList.contains('hidden')) { els.eventsOverlay.classList.add('hidden'); return currentScreenName; }
    if (els.rematchOverlay && !els.rematchOverlay.classList.contains('hidden')) { els.rematchOverlay.classList.add('hidden'); return currentScreenName; }
    if (els.dialogOverlay && !els.dialogOverlay.classList.contains('hidden')) { els.dialogOverlay.classList.add('hidden'); els.dialogSecondaryButton?.classList.add('hidden'); dialogAction = null; dialogSecondaryAction = null; return currentScreenName; }
    if (!els.rulesOverlay.classList.contains('hidden')) { els.rulesOverlay.classList.add('hidden'); return currentScreenName; }
    if (!els.squadsOverlay.classList.contains('hidden')) { els.squadsOverlay.classList.add('hidden'); return currentScreenName; }
    const map = { results: 'home', match: 'home', brief: setup.mode === 'friend' ? 'lobby' : 'settings', settings: 'squad', draft: 'squad', squad: 'mode', lobby: 'online', online: 'mode', howto: 'home', mode: 'home' };
    return map[currentScreenName] || 'home';
  }

  function initializeNavigationGuard() {
    history.replaceState({ screen: 'home', app: true }, '', '#home');
    history.pushState({ screen: 'home', app: true }, '', '#home');
    navigationReady = true;
    window.addEventListener('popstate', () => {
      const target = browserBackTarget();
      if (currentScreenName === 'home' && target === 'home') {
        els.appToast.textContent = '90+ ana ekranındasın.';
        els.appToast.classList.remove('hidden');
        setTimeout(() => els.appToast.classList.add('hidden'), 1600);
      } else {
        if (currentScreenName === 'match' && match && match.mode !== 'friend' && !match.paused && !match.resolving) pauseMatch();
        showScreen(target, { fromPop: true });
      }
      history.pushState({ screen: currentScreenName, app: true }, '', `#${currentScreenName}`);
    });
  }

  const DUEL_CRITERIA = [
    { key: 'period', label: 'DÖNEM' }, { key: 'nationality', label: 'MİLLİYET' },
    { key: 'league', label: 'LİG' }, { key: 'rating', label: 'PUAN ARALIĞI' },
    { key: 'style', label: 'KADRO PROFİLİ' }
  ];

  function duelTeamName(side) {
    if (setup.mode === 'friend') return online.lobby?.players?.[side]?.name || `OYUNCU ${side + 1}`;
    return side === 0 ? 'TAKIM 1' : 'TAKIM 2';
  }

  function duelOptions(key, selections = {}) {
    let base = PLAYERS;
    if (selections.period && selections.period !== 'all') {
      const p = PERIODS.find(item => item.id === selections.period);
      if (p) base = base.filter(player => player.activeStart <= p.end && player.activeEnd >= p.start);
    }
    if (key === 'period') return [{ value:'all', label:'Tüm dönemler' }, ...PERIODS.map(p => ({ value:p.id, label:p.label }))];
    if (key === 'nationality') {
      const counts = new Map(); base.forEach(p => counts.set(p.nationality, (counts.get(p.nationality)||0)+1));
      return [{value:'all',label:'Tüm milliyetler'}, ...[...counts].sort((a,b)=>b[1]-a[1]).slice(0,18).map(([value,count])=>({value,label:`${value} · ${count}`}))];
    }
    if (key === 'league') {
      const counts = new Map(); base.forEach(p => (p.leagues||[]).forEach(x => counts.set(x,(counts.get(x)||0)+1)));
      return [{value:'all',label:'Tüm ligler'}, ...[...counts].sort((a,b)=>b[1]-a[1]).slice(0,18).map(([value,count])=>({value,label:`${value} · ${count}`}))];
    }
    if (key === 'rating') return [{value:'all',label:'Tüm puanlar'},{value:'60-79',label:'60–79 · Sürpriz havuz'},{value:'70-89',label:'70–89 · Dengeli'},{value:'80-99',label:'80–99 · Elit'},{value:'86-99',label:'86–99 · Efsaneler'}];
    return [{value:'balanced',label:'Dengeli kadro'},{value:'legends',label:'Efsane ağırlıklı'},{value:'modern',label:'Modern dönem ağırlıklı'},{value:'surprise',label:'Sürpriz transferler'}];
  }

  function filterDuelPool(selections = {}) {
    return PLAYERS.filter(player => {
      if (selections.period && selections.period !== 'all') {
        const p = PERIODS.find(x => x.id === selections.period);
        if (p && !(player.activeStart <= p.end && player.activeEnd >= p.start)) return false;
      }
      if (selections.nationality && selections.nationality !== 'all' && player.nationality !== selections.nationality) return false;
      if (selections.league && selections.league !== 'all' && !(player.leagues||[]).includes(selections.league)) return false;
      if (selections.rating && selections.rating !== 'all' && !ratingRangeMatch(player, selections.rating)) return false;
      return true;
    });
  }

  function duelCandidatesFor(state) {
    const side = state.turn;
    const slot = SLOTS[state.picks[side].length];
    const used = new Set(state.picks.flat().map(p => p.id));
    let pool = filterDuelPool(state.selections).filter(p => !used.has(p.id));
    if (state.selections.style === 'legends') pool.sort((a,b)=>b.rating-a.rating);
    else if (state.selections.style === 'modern') pool.sort((a,b)=>b.activeEnd-a.activeEnd || b.rating-a.rating);
    else if (state.selections.style === 'surprise') pool = shuffle(pool).sort((a,b)=>a.rating-b.rating);
    return candidateSetForSlot(slot, pool, used).slice(0,3);
  }

  function pitchPosition(index) {
    const positions = [[50,91],[16,75],[38,78],[62,78],[84,75],[50,62],[32,51],[68,48],[17,29],[83,29],[50,16]];
    return positions[index] || [50,50];
  }

  function renderDuelPitch(element, picks) {
    if (!element) return;
    element.innerHTML = picks.map((player,index)=>{ const [x,y]=pitchPosition(index); return `<div class="formation-token" style="left:${x}%;top:${y}%"><b>${escapeHtml(player.slot || SLOTS[index])}</b><span>${escapeHtml(player.name)}</span><small>${player.rating}</small></div>`; }).join('');
  }

  function normalizeRemoteDuel(raw) {
    if (!raw) return null;
    return { ...raw, picks: (raw.picks || [[],[]]).map(list => list || []), candidates: raw.candidates || [] };
  }

  function renderDuel() {
    if (!duel) return;
    els.duelTeam0Name.textContent = duelTeamName(0); els.duelTeam1Name.textContent = duelTeamName(1);
    els.coinStage.classList.toggle('hidden', duel.phase !== 'coin');
    els.duelCriteriaStage.classList.toggle('hidden', duel.phase !== 'criteria');
    els.duelPickStage.classList.toggle('hidden', duel.phase !== 'picks' && duel.phase !== 'done');
    if (duel.phase === 'coin') {
      els.duelStatusText.textContent = 'YAZI TURA İLK KRİTERİ VE İLK TRANSFERİ BELİRLER';
      els.flipCoinButton.disabled = setup.mode === 'friend' && online.side !== duel.requestedBy;
    }
    if (duel.phase === 'criteria') {
      const criterion = DUEL_CRITERIA[duel.criteriaIndex];
      els.duelTurnName.textContent = duelTeamName(duel.turn); els.duelCriteriaProgress.textContent = `${duel.criteriaIndex + 1} / ${DUEL_CRITERIA.length} · ${criterion.label}`;
      els.duelStatusText.textContent = `${duelTeamName(duel.turn)} KRİTER SEÇİYOR`;
      const myTurn = setup.mode !== 'friend' || online.side === duel.turn;
      els.duelCriteriaChoices.innerHTML = duelOptions(criterion.key, duel.selections).map(opt=>`<button class="duel-choice" data-duel-value="${escapeHtml(opt.value)}" ${myTurn?'':'disabled'}><b>${escapeHtml(opt.label)}</b></button>`).join('');
      els.duelCriteriaSummary.innerHTML = DUEL_CRITERIA.slice(0,duel.criteriaIndex).map(item=>`<span><b>${item.label}</b> ${escapeHtml(duel.selections[item.key] || '—')}</span>`).join('');
    }
    if (duel.phase === 'picks' || duel.phase === 'done') {
      els.duelPickTurnName.textContent = duel.phase === 'done' ? 'KADROLAR TAMAM' : duelTeamName(duel.turn);
      const picked = duel.picks[0].length + duel.picks[1].length;
      els.duelPickProgress.textContent = `${picked} / 22 OYUNCU`;
      const myTurn = setup.mode !== 'friend' || online.side === duel.turn;
      els.duelPickCandidates.innerHTML = duel.phase === 'done' ? '<div class="duel-complete-card">İki kadro da hazır. Formasyonları kontrol et ve devam et.</div>' : (duel.candidates || []).map(player=>`<button class="duel-player-card" data-duel-player="${player.id}" ${myTurn?'':'disabled'}><span>${escapeHtml(SLOTS[duel.picks[duel.turn].length])}</span><strong>${escapeHtml(player.name)}</strong><small>${escapeHtml(player.nationality)} · ${escapeHtml(player.position)}</small><b>${player.rating}</b></button>`).join('');
      renderDuelPitch(els.duelPitch0, duel.picks[0]); renderDuelPitch(els.duelPitch1, duel.picks[1]);
      els.duelFinishButton.classList.toggle('hidden', duel.phase !== 'done');
    } else els.duelFinishButton.classList.add('hidden');
  }

  function startLocalDuel() {
    duel = { phase:'coin', requestedBy:0, winner:null, turn:0, criteriaIndex:0, selections:{}, picks:[[],[]], candidates:[] };
    showScreen('duel'); renderDuel();
  }

  function flipLocalDuelCoin() {
    if (!duel || duel.phase !== 'coin') return;
    els.duelCoin.classList.add('flipping'); els.flipCoinButton.disabled = true;
    setTimeout(()=>{
      duel.winner = Math.random() < .5 ? 0 : 1; duel.turn = duel.winner; duel.phase = 'criteria';
      els.duelCoin.classList.remove('flipping');
      showEventOverlay('YAZI TURA', `${duelTeamName(duel.winner)} ilk kriteri ve ilk oyuncuyu seçecek.`, 'yellow', 'TRANSFER DÜELLOSU', 3600, renderDuel);
    }, 1300);
  }

  function chooseLocalDuelCriterion(value) {
    const key = DUEL_CRITERIA[duel.criteriaIndex].key; duel.selections[key] = value; duel.criteriaIndex += 1;
    if (duel.criteriaIndex >= DUEL_CRITERIA.length) {
      const pool = filterDuelPool(duel.selections);
      if (pool.length < 22 || !pool.some(p=>p.position==='GK')) { showEventOverlay('HAVUZ DAR', 'Bu kriterlerle iki kadro kurulamıyor. Düello dengeli havuzla devam edecek.', 'navy', `${pool.length} OYUNCU`, 4200); duel.selections = { period:'all', nationality:'all', league:'all', rating:'all', style:duel.selections.style || 'balanced' }; }
      duel.phase = 'picks'; duel.turn = duel.winner; duel.candidates = duelCandidatesFor(duel);
    } else duel.turn = duel.turn === 0 ? 1 : 0;
    renderDuel();
  }

  function chooseLocalDuelPlayer(playerId) {
    const player = (duel.candidates || []).find(p=>p.id===playerId); if (!player) return;
    const side = duel.turn, slot = SLOTS[duel.picks[side].length]; duel.picks[side].push({ ...player, slot });
    if (duel.picks[0].length === 11 && duel.picks[1].length === 11) { duel.phase='done'; duel.candidates=[]; }
    else { duel.turn = side === 0 ? 1 : 0; if (duel.picks[duel.turn].length >= 11) duel.turn = side; duel.candidates = duelCandidatesFor(duel); }
    renderDuel();
  }

  function finishDuel() {
    if (!duel || duel.phase !== 'done') return;
    setup.teams = [0,1].map(side => ({ name:`${duelTeamName(side)} XI`, lineup:duel.picks[side].map((p,i)=>({ ...p, slot:p.slot || SLOTS[i] })) }));
    setup.side = setup.mode === 'friend' ? online.side : 1;
    if (setup.mode === 'friend') { renderSetupState(); showScreen(online.side === 0 ? 'settings' : 'lobby'); }
    else showScreen('settings');
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
      const wasDisconnected = online.socket && !online.connected;
      online.connected = true;
      if (wasDisconnected) playAudioCue('online.reconnected');
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
      playAudioCue('online.connectionLost');
      els.networkBadge.textContent = 'BAĞLANTI YOK';
      if (match?.mode === 'friend') updateMatchUi();
    });

    socket.on('room:lobby', lobby => {
      online.lobby = lobby;
      if (lobby?.duel) duel = normalizeRemoteDuel(lobby.duel);
      renderOnlineLobby();
      if (lobby?.phase === 'brief' && match?.phase !== 'finished') {
        renderBrief();
        if (currentScreenName !== 'brief') showScreen('brief');
      }
    });

    socket.on('room:duel', payload => {
      duel = normalizeRemoteDuel(payload);
      if (!duel) {
        els.duelResponseButtons?.classList.add('hidden');
        els.duelRequestText.textContent = 'Düello isteği reddedildi veya iptal edildi. Diğer kadro yöntemlerinden birini seçebilirsiniz.';
        if (currentScreenName === 'duel') showScreen('squad');
        return;
      }
      if (duel.status === 'pending') {
        const incoming = online.side !== duel.requestedBy;
        els.duelRequestText.textContent = incoming ? `${duelTeamName(duel.requestedBy)} Transfer Düellosu önerdi.` : `${duelTeamName(online.side === 0 ? 1 : 0)} oyuncusunun cevabı bekleniyor.`;
        els.duelResponseButtons.classList.toggle('hidden', !incoming);
        els.duelStartButton.classList.toggle('hidden', incoming || duel.status === 'pending');
        showScreen('squad'); switchBuilder('duel');
      } else {
        showScreen('duel'); renderDuel();
      }
    });

    socket.on('room:brief', payload => {
      if (payload?.lobby) online.lobby = payload.lobby;
      renderOnlineLobby();
      renderBrief();
      showScreen('brief');
      playAudioCue('online.opponentReady');
    });

    socket.on('room:closed', payload => {
      setOnlineStatus(payload?.reason || 'Oda kapatıldı.', 'error');
      resetOnlineState();
      match = null;
      setup.mode = null;
      showScreen('online');
    });

    socket.on('room:side', payload => {
      if (Number.isInteger(payload?.side)) { online.side = payload.side; setup.side = payload.side; renderOnlineLobby(); }
    });

    socket.on('room:rematchRequest', request => {
      if (!request) return;
      if (request.from === online.side) {
        els.appToast.textContent = 'Rövanş isteği rakibe gönderildi.'; els.appToast.classList.remove('hidden'); setTimeout(()=>els.appToast.classList.add('hidden'),2200); return;
      }
      const kind = request.type === 'secondLeg' ? 'İlk maçın skoru korunacak; sahalar değişecek ve toplam skor geçerli olacak.' : 'Aynı kadro ve kurallarla yeni, bağımsız bir maç oynanacak.';
      openDialog('RÖVANŞ İSTEĞİ', request.type === 'secondLeg' ? 'İKİNCİ AYAK' : 'YENİ MAÇ', kind, 'KABUL ET', () => online.socket?.emit('room:rematchRespond', { accept:true }, response => { if(!response?.ok) showEventOverlay('RÖVANŞ AÇILMADI',response?.error||'','red'); }));
      els.dialogOverlay.querySelector('.dialog-card')?.insertAdjacentHTML('beforeend','<button id="rejectRematchInline" class="text-button" type="button">REDDET</button>');
      $('#rejectRematchInline')?.addEventListener('click',()=>{ online.socket?.emit('room:rematchRespond',{accept:false}); els.dialogOverlay.classList.add('hidden'); $('#rejectRematchInline')?.remove(); },{once:true});
    });

    socket.on('room:rematchResult', payload => {
      if (!payload?.accepted) { showEventOverlay('RÖVANŞ REDDEDİLDİ','Rakip yeni maçı kabul etmedi.','navy','',3200); return; }
      if (payload.lobby) online.lobby=payload.lobby;
      match=null; remoteFinishedRendered=false; renderBrief(); showScreen('brief');
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
      const audioType = overlay.type || (/GOL/i.test(title) ? 'goal' : /İKİNCİ SARI/i.test(title) ? 'secondYellow' : /KIRMIZI/i.test(title) ? 'red' : /SARI/i.test(title) ? 'yellow' : /KURTARDI/i.test(title) ? 'save' : /DİREK/i.test(title) ? 'post' : /AUT/i.test(title) ? 'wide' : /ŞUT/i.test(title) ? 'shot' : /FAUL/i.test(title) ? 'foul' : /PENALTI/i.test(title) ? 'penalty' : /FRİKİK|SERBEST/i.test(title) ? 'freeKick' : '');
      if (audioType) playMatchEventAudio(audioType, overlay.subtitle || title);
      showEventOverlay(title, overlay.subtitle, overlay.tone, overlay.kicker, duration);
    }

    if (match.phase === 'finished') {
      if (!remoteFinishedRendered) {
        remoteFinishedRendered = true;
        finishMatch(match.winnerSide);
      }
      return;
    }

    if (!$('#screen-match').classList.contains('active') && online.lobby?.phase === 'match') showScreen('match');
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
    renderLobbyPlayer(els.lobbyPlayer0, lobby.players[0], 'İÇ SAHA');
    renderLobbyPlayer(els.lobbyPlayer1, lobby.players[1], 'DEPLASMAN');
    const settings = lobby.settings || {};
    els.lobbySettingsSummary.innerHTML = [
      `${settings.durationMinutes || 5} DK`,
      settings.cards ? 'KART AÇIK' : 'KART KAPALI',
      settings.extraTime ? 'UZATMA AÇIK' : 'UZATMA KAPALI',
      settings.shootout ? 'PENALTILAR AÇIK' : 'PENALTILAR KAPALI'
    ].map(item => `<span>${item}</span>`).join('');

    const bothReady = Boolean(lobby.canStart);
    const guestPresent = Boolean(lobby.players?.[1]?.present);
    if (lobby.phase === 'brief') {
      els.lobbyMessage.textContent = 'Kural ekranı açık. Hazır olan oyuncu onay verdikten sonra diğer tarafa 30 saniye tanınır.';
    } else if (!guestPresent) {
      els.lobbyMessage.textContent = 'Arkadaşının kodla odaya katılması bekleniyor.';
    } else if (!bothReady) {
      els.lobbyMessage.textContent = 'İki oyuncunun da kadrosu hazır olmalı.';
    } else {
      els.lobbyMessage.textContent = online.side === 0 ? 'Her şey hazır. Kural brifingini iki oyuncu için açabilirsin.' : 'Her şey hazır. İç saha oyuncusunun kural brifingini açması bekleniyor.';
    }
    els.startOnlineMatchButton.textContent = 'KURALLARA GEÇ →';
    els.startOnlineMatchButton.classList.toggle('hidden', online.side !== 0 || lobby.phase === 'brief');
    els.editOnlineSettingsButton.classList.toggle('hidden', online.side !== 0 || lobby.phase !== 'lobby');
    els.startOnlineMatchButton.disabled = !bothReady || lobby.phase !== 'lobby';
    els.networkBadge.classList.toggle('hidden', !online.code);
    if (lobby.phase === 'brief') renderOnlineReadyState();
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
        playAudioCue('online.roomCreated');
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
        playAudioCue('online.roomJoined');
        if (response.match) {
          receiveRemoteMatch(response.match, Date.now());
          showScreen(response.match.phase === 'finished' ? 'results' : 'match');
        } else if (response.lobby?.phase === 'brief') {
          renderBrief();
          setOnlineStatus(`Oda ${response.code} bağlantısı yeniden kuruldu.`, 'success');
          showScreen('brief');
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
    online.socket.emit('room:openBrief', {}, response => {
      if (!response?.ok) {
        els.startOnlineMatchButton.disabled = false;
        els.lobbyMessage.textContent = response?.error || 'Kural ekranı açılamadı.';
        return;
      }
      if (response.lobby) online.lobby = response.lobby;
      renderBrief();
      showScreen('brief');
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
    document.addEventListener('pointerdown', ensureAudio, { once: true });
    els.soundButton.addEventListener('click', () => {
      muted = !muted;
      Audio?.setMuted(muted);
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
    els.duelStartButton?.addEventListener('click', () => {
      if (setup.mode === 'coop') {
        openDialog('ORTAK KADRO ÖNERİSİ', 'TRANSFER DÜELLOSU', 'Telefonu ikinci oyuncuya ver. Kriterleri ve futbolcuları sırayla seçerek iki benzersiz kadro kurmayı kabul ediyor musun?', 'KABUL ET', startLocalDuel, { text:'REDDET', action:() => { switchBuilder('random'); showEventOverlay('DÜELLO REDDEDİLDİ', 'İki taraf klasik kadro kurma seçeneklerine döndü.', 'navy', 'KARIŞIK · KRİTER · MANUEL', 3300); } });
        return;
      }
      if (!online.socket) return;
      online.socket.emit('room:duelRequest', {}, response => { if (!response?.ok) showEventOverlay('DÜELLO AÇILMADI', response?.error || 'Tekrar dene', 'red', '', 3200); });
    });
    els.duelAcceptButton?.addEventListener('click', () => online.socket?.emit('room:duelRespond', { accept:true }, response => { if (!response?.ok) showEventOverlay('KABUL EDİLEMEDİ', response?.error || '', 'red'); }));
    els.duelRejectButton?.addEventListener('click', () => online.socket?.emit('room:duelRespond', { accept:false }));
    els.flipCoinButton?.addEventListener('click', () => {
      if (setup.mode === 'friend') online.socket?.emit('duel:flip', {}, response => { if (!response?.ok) showEventOverlay('YAZI TURA BEKLİYOR', response?.error || '', 'navy'); });
      else flipLocalDuelCoin();
    });
    els.duelCriteriaChoices?.addEventListener('click', event => {
      const button=event.target.closest('[data-duel-value]'); if(!button||!duel)return;
      if(setup.mode==='friend') online.socket?.emit('duel:criterion',{value:button.dataset.duelValue},response=>{if(!response?.ok)showEventOverlay('KRİTER SEÇİLEMEDİ',response?.error||'','red');});
      else chooseLocalDuelCriterion(button.dataset.duelValue);
    });
    els.duelPickCandidates?.addEventListener('click', event => {
      const button=event.target.closest('[data-duel-player]'); if(!button||!duel)return;
      if(setup.mode==='friend') online.socket?.emit('duel:pick',{playerId:button.dataset.duelPlayer},response=>{if(!response?.ok)showEventOverlay('TRANSFER OLMADI',response?.error||'','red');});
      else chooseLocalDuelPlayer(button.dataset.duelPlayer);
    });
    els.duelCancelButton?.addEventListener('click', () => { duel=null; showScreen('squad'); switchBuilder('random'); });
    els.duelFinishButton?.addEventListener('click', finishDuel);
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
    els.nationalitySelect.addEventListener('change', () => { setup.criteria.nationality = els.nationalitySelect.value; updateCriteriaSummary(); });
    els.leagueSelect.addEventListener('change', () => { setup.criteria.league = els.leagueSelect.value; updateCriteriaSummary(); });
    els.positionSelect?.addEventListener('change', () => { setup.criteria.position = els.positionSelect.value; updateCriteriaSummary(); });
    els.ratingSelect?.addEventListener('change', () => { setup.criteria.rating = els.ratingSelect.value; updateCriteriaSummary(); });

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
    [els.menuMusicToggle,els.stadiumAmbienceToggle,els.sfxToggle,els.soundIntensity,els.vibrationToggle,els.eventDurationSelect,els.homeColorSelect,els.awayColorSelect].filter(Boolean).forEach(input=>input.addEventListener('change',saveSettings));
    [[els.menuVolumeRange,els.menuVolumeValue],[els.stadiumVolumeRange,els.stadiumVolumeValue],[els.sfxVolumeRange,els.sfxVolumeValue]].forEach(([range,label])=>range?.addEventListener('input',()=>{label.textContent=`${range.value}%`;saveSettings();}));
    els.kickoffButton.addEventListener('click', () => {
      ensureAudio();
      if (setup.mode === 'friend') submitOnlineSettings();
      else showBrief();
    });
    els.briefBackButton.addEventListener('click', () => showScreen(setup.mode === 'friend' ? 'lobby' : 'settings'));
    els.briefStartButton.addEventListener('click', startFromBrief);
    els.matchStopButton.addEventListener('click', () => stopMatchRoll('human'));
    els.pauseButton.addEventListener('click', pauseMatch);
    els.resumePauseButton?.addEventListener('click', pauseMatch);
    const openEvents = () => { renderLiveTimeline(); els.eventsOverlay.classList.remove('hidden'); };
    const openRules = () => els.rulesOverlay.classList.remove('hidden');
    const openSquads = () => { selectedSquadSide = match?.context?.owner ?? 0; renderMatchSquad(); els.squadsOverlay.classList.remove('hidden'); };
    els.eventsButton?.addEventListener('click', openEvents); els.pauseEventsButton?.addEventListener('click', openEvents);
    els.closeEventsButton?.addEventListener('click', () => els.eventsOverlay.classList.add('hidden'));
    els.eventsOverlay?.addEventListener('click', event => { if(event.target===els.eventsOverlay)els.eventsOverlay.classList.add('hidden'); });
    els.pauseRulesButton?.addEventListener('click', openRules); els.pauseSquadsButton?.addEventListener('click', openSquads);
    els.rulesButton.addEventListener('click', () => els.rulesOverlay.classList.remove('hidden'));
    els.closeRulesButton.addEventListener('click', () => els.rulesOverlay.classList.add('hidden'));
    els.rulesOverlay.addEventListener('click', event => { if (event.target === els.rulesOverlay) els.rulesOverlay.classList.add('hidden'); });
    els.squadsButton.addEventListener('click', openSquads);
    els.closeSquadsButton.addEventListener('click', () => els.squadsOverlay.classList.add('hidden'));
    els.squadsOverlay.addEventListener('click', event => { if (event.target === els.squadsOverlay) els.squadsOverlay.classList.add('hidden'); });
    els.squadMatchTabs.forEach(tab => tab.addEventListener('click', () => { selectedSquadSide = Number(tab.dataset.side); renderMatchSquad(); }));
    els.dialogButton.addEventListener('click', closeDialog);
    els.dialogSecondaryButton?.addEventListener('click', closeDialogSecondary);
    els.rematchButton.addEventListener('click', () => {
      if (!match) return;
      if (match.mode === 'friend') { els.rematchOverlay.classList.remove('hidden'); return; }
      setup.mode = match.mode;
      setup.teams = match.teams.map(team => ({ name:team.name, color:team.color, lineup:team.lineup.map(({yellowCards,red,injured,goals,sentOffReason,...player})=>player) }));
      showScreen('settings');
    });
    const requestRematch = type => {
      els.rematchOverlay.classList.add('hidden');
      online.socket?.emit('room:rematchRequest',{type},response=>{if(!response?.ok)showEventOverlay('RÖVANŞ İSTEĞİ GİTMEDİ',response?.error||'','red','',3500);});
    };
    els.simpleRematchButton?.addEventListener('click',()=>requestRematch('simple'));
    els.twoLegRematchButton?.addEventListener('click',()=>requestRematch('secondLeg'));
    els.closeRematchButton?.addEventListener('click',()=>els.rematchOverlay.classList.add('hidden'));
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
    initializeNavigationGuard();
    initializeOnlineToken();
    initializeFilters();
    initializeSettings();
    Audio?.setAmbience('ambience.menu');
    Audio?.tryAutoplay?.().catch(() => false);
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
