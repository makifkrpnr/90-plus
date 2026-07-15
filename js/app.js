(function () {
  'use strict';

  const Core = window.GameCore;
  const Audio = window.GameAudio;
  let PLAYERS = [];
  const AppSettings = window.AppSettings;
  const UIShell = window.UIShell;
  const TournamentCore = window.TournamentCore;
  const SAVE_KEY = '90-plus-save-v6';
  const SETTINGS_KEY = '90-plus-match-settings-v6';
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
    settingsButton: $('#settingsButton'),
    themeButton: $('#themeButton'),
    soundButton: $('#soundButton'),
    startButton: $('#startButton'),
    howToButton: $('#howToButton'),
    continueButton: $('#continueButton'),
    modeButtons: $$('.mode-card[data-mode]'),
    competitionCards: $$('.competition-card[data-competition]'),
    roomTypeOptions: $$('.room-type-option[data-room-type]'),
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
    lobbyPlayer2: $('#lobbyPlayer2'),
    lobbyPlayer3: $('#lobbyPlayer3'),
    lobbyPlayersGrid: $('#lobbyPlayersGrid'),
    lobbySettingsSummary: $('#lobbySettingsSummary'),
    lobbyMessage: $('#lobbyMessage'),
    leaveRoomButton: $('#leaveRoomButton'),
    lobbyBuildSquadButton: $('#lobbyBuildSquadButton'),
    editOnlineSettingsButton: $('#editOnlineSettingsButton'),
    startOnlineMatchButton: $('#startOnlineMatchButton'),
    remoteMatchBar: $('#remoteMatchBar'),
    remoteRoomCode: $('#remoteRoomCode'),
    remoteConnectionText: $('#remoteConnectionText'),
    builderTabs: $$('.builder-tab'),
    setupTeamLabel: $('#setupTeamLabel'),
    teamNameInput: $('#teamNameInput'),
    teamColorPalette: $('#teamColorPalette'),
    teamColorHint: $('#teamColorHint'),
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
    duelWatchDisplay: $('#duelWatchDisplay'), duelStopButton: $('#duelStopButton'), duelWatchHint: $('#duelWatchHint'),
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
    openAppSettingsButton: $('#openAppSettingsButton'), saveGlobalSettingsButton: $('#saveGlobalSettingsButton'),
    globalMenuMusicToggle: $('#globalMenuMusicToggle'), globalStadiumToggle: $('#globalStadiumToggle'), globalEventSoundsToggle: $('#globalEventSoundsToggle'),
    globalVibrationToggle: $('#globalVibrationToggle'), globalReducedMotionToggle: $('#globalReducedMotionToggle'), globalEventDurationSelect: $('#globalEventDurationSelect'),
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
    matchDurationLabel: $('#matchDurationLabel'),
    aggregateScoreLabel: $('#aggregateScoreLabel'),
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
    tournamentDurationRange: $('#tournamentDurationRange'), tournamentDurationValue: $('#tournamentDurationValue'), tournamentKindSummary: $('#tournamentKindSummary'),
    tournamentLegOptions: $$('.tournament-leg-option'), tournamentSquadOptions: $$('.tournament-squad-option'), fourSquadMethod: $('#fourSquadMethod'), confirmTournamentButton: $('#confirmTournamentButton'),
    tournamentBracket: $('#tournamentBracket'), tournamentStageText: $('#tournamentStageText'), tournamentLiveMessage: $('#tournamentLiveMessage'), tournamentNextButton: $('#tournamentNextButton'), tournamentHomeButton: $('#tournamentHomeButton'),
    podiumStage: $('#podiumStage'), tournamentStats: $('#tournamentStats'), finishTournamentButton: $('#finishTournamentButton'),
    appToast: $('#appToast')
  };

  const setup = {
    mode: null,
    builder: 'random',
    side: 0,
    teams: [null, null],
    selectedPeriods: ['1996-2005'],
    manualSelected: new Set(),
    criteria: { nationality: '', league: '', position: '', rating: '' },
    competition: 'single',
    roomType: 'single',
    selectedColors: ['#d44735', '#2878c8'],
    tournamentOptions: { legs: 1, durationMinutes: 3, squadMethod: 'random' }
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
  let duelWatchRaf = null;
  let duelCoinTimer = null;
  let localTournament = null;
  let localDuelPairs = null;
  let localDuelPairIndex = 0;
  let localDuelUsedIds = new Set();
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
    startReady: [false, false, false, false],
    startDeadline: null,
    roomType: 'single',
    matchSide: null,
    tournament: null,
    fixtureId: null
  };

  function isFriendMode() {
    return setup.mode === 'friend' || match?.mode === 'friend';
  }


  function updateCompetitionScreen() {
    const ai = setup.mode === 'ai';
    const multiplayer = setup.mode === 'coop';
    els.competitionCards.forEach(card => {
      card.classList.toggle('hidden', card.classList.contains('ai-only') ? !ai : card.classList.contains('multiplayer-only') ? !multiplayer : false);
    });
  }

  function selectCompetition(type) {
    setup.competition = type;
    if (['classicUcl','worldCup','fourCup'].includes(type)) {
      els.tournamentKindSummary.innerHTML = `<b>${type === 'worldCup' ? 'DÜNYA KUPASI' : type === 'classicUcl' ? 'KLASİK ŞAMPİYONLAR KUPASI' : '4 KİŞİLİK KUPA'}</b><small>${type === 'fourCup' ? 'İki yarı final, final ve üçüncülük maçı.' : 'Grup atmosferi ve eleme turları.'}</small>`;
      els.fourSquadMethod.classList.toggle('hidden', type !== 'fourCup');
      showScreen('tournament-config');
      return;
    }
    setup.teams = [null, null]; setup.side = 0; setup.manualSelected.clear();
    renderSetupState(); showScreen('squad');
  }

  function tournamentTeamLabel(index) { return localTournament?.teams?.[index]?.name || `Takım ${index + 1}`; }

  function renderTournamentBracket() {
    if (!localTournament || !els.tournamentBracket) return;
    const stageText = localTournament.stage === 'finished' ? 'TURNUVA TAMAMLANDI' : localTournament.stage === 'groups' ? 'GRUP AŞAMASI' : localTournament.stage === 'semifinals' ? 'YARI FİNALLER' : localTournament.stage === 'finals' ? 'FİNAL GECESİ' : 'ELEME TURLARI';
    els.tournamentStageText.textContent = stageText;
    const groupHtml = localTournament.stage === 'groups' ? (localTournament.groups || []).map(group => {
      const rows = TournamentCore.sortedTable(group);
      return `<article class="group-table"><h3>GRUP ${escapeHtml(group.name)}</h3><div class="group-row heading"><span>TAKIM</span><b>O</b><b>AV</b><b>P</b></div>${rows.map((row,index)=>`<div class="group-row${index<2?' qualified':''}"><span>${escapeHtml(tournamentTeamLabel(row.team))}</span><b>${row.played}</b><b>${row.gd}</b><b>${row.pts}</b></div>`).join('')}</article>`;
    }).join('') : '';
    const relevant = (localTournament.fixtures || []).filter(fixture => localTournament.stage === 'groups' ? fixture.group : !fixture.group);
    const fixtureHtml = relevant.map(f => {
      const score = Array.isArray(f.scores) && f.scores.length ? (Array.isArray(f.scores[0]) ? f.scores.map(item=>item.join('–')).join(' / ') : f.scores.join('–')) : '—';
      const leg = Number(f.legs) === 2 ? ` · ${f.leg || 1}. AYAK` : '';
      return `<article class="bracket-fixture ${f.status}"><small>${escapeHtml(f.round)}${leg}</small><div><span>${escapeHtml(tournamentTeamLabel(f.home))}</span><b>${escapeHtml(score)}</b><span>${escapeHtml(tournamentTeamLabel(f.away))}</span></div><em>${f.status === 'finished' ? `${escapeHtml(tournamentTeamLabel(f.winner))} tur atladı` : f.status === 'live' ? 'CANLI' : 'BEKLİYOR'}</em></article>`;
    }).join('');
    els.tournamentBracket.innerHTML = groupHtml ? `<div class="group-tables">${groupHtml}</div><div class="fixture-list">${fixtureHtml}</div>` : fixtureHtml || '<div class="empty-state">Fikstür hazırlanıyor.</div>';
    const next = (localTournament.fixtures || []).find(f => f.status === 'pending');
    els.tournamentNextButton.classList.toggle('hidden', !next || localTournament.stage === 'finished');
    if (next) els.tournamentNextButton.textContent = localTournament.stage === 'groups' ? 'SIRADAKİ GRUP MAÇI →' : `${String(next.round).toLocaleUpperCase('tr')} →`;
  }

  function simulateScore() {
    let a=Math.floor(Math.random()*4),b=Math.floor(Math.random()*4);
    if(a===b && Math.random()>.45) a+=1;
    return [a,b];
  }

  function buildTournamentTeams(count) {
    const teams=[setup.teams[0]];
    const used=new Set(setup.teams[0]?.lineup?.map(p=>p.id)||[]);
    while(teams.length<count){
      const lineup=buildRandomLineup(PLAYERS.filter(p=>!used.has(p.id)));
      lineup.forEach(p=>used.add(p.id));
      teams.push({name:`Retro Kulüp ${teams.length}`,color:TEAM_COLORS[teams.length%TEAM_COLORS.length].value,lineup});
    }
    return teams;
  }

  function initializeLocalTournament() {
    if (setup.competition === 'fourCup') localTournament=TournamentCore.createKnockout4(setup.teams.slice(0,4),setup.tournamentOptions);
    else localTournament=TournamentCore.createGroupTournament(setup.competition,buildTournamentTeams(setup.competition==='worldCup'?16:8),setup.tournamentOptions);
    renderTournamentBracket(); showScreen('tournament');
  }

  function nextRoundName(current,count) {
    if (current === 'Çeyrek final') return 'Yarı final';
    if (current === 'Yarı final') return 'Final';
    if (count === 8) return 'Çeyrek final';
    if (count === 4) return 'Yarı final';
    return 'Final';
  }

  function addKnockoutRound(winners, round) {
    for(let i=0;i<winners.length;i+=2){
      localTournament.fixtures.push({id:`ko-${round}-${i/2}-${Date.now().toString(36)}`,round,home:winners[i],away:winners[i+1],status:'pending',scores:[],winner:null,legs:localTournament.options?.legs===2&&round!=='3.lük'?2:1,leg:1,aggregate:[0,0]});
    }
  }

  function advanceGenericTournament(fixture,result) {
    if (fixture.group) {
      fixture.status='finished';fixture.scores=[...result.scores];fixture.winner=result.scores[0]===result.scores[1]?null:result.winner;
      TournamentCore.applyGroupResult(localTournament,fixture,result.scores);
      if(localTournament.fixtures.filter(item=>item.group).every(item=>item.status==='finished')) TournamentCore.buildKnockout(localTournament);
      return;
    }
    const legs=Number(fixture.legs)||1;
    if(legs===2 && Number(fixture.leg||1)===1){
      fixture.aggregate=[...result.scores];fixture.scores=[[...result.scores]];fixture.leg=2;fixture.status='pending';fixture.winner=null;return;
    }
    if(legs===2){
      fixture.scores.push([...result.scores]);fixture.aggregate=[(fixture.aggregate?.[0]||0)+result.scores[0],(fixture.aggregate?.[1]||0)+result.scores[1]];
    }else{fixture.scores=[...result.scores];fixture.aggregate=[...result.scores];}
    fixture.status='finished';fixture.winner=result.winner;
    const roundFixtures=localTournament.fixtures.filter(item=>item.round===fixture.round&&!item.group);
    if(!roundFixtures.every(item=>item.status==='finished'))return;
    if(fixture.round==='Final'||fixture.round==='3.lük'){
      const final=localTournament.fixtures.find(item=>item.round==='Final');
      const third=localTournament.fixtures.find(item=>item.round==='3.lük');
      if(!final||final.status!=='finished'||(third&&third.status!=='finished'))return;
      localTournament.podium={champion:final.winner,runnerUp:final.winner===final.home?final.away:final.home,third:third?.winner??null};localTournament.stage='finished';return;
    }
    const winners=roundFixtures.map(item=>item.winner);
    if(winners.length===2){
      const losers=roundFixtures.map(item=>item.winner===item.home?item.away:item.home);
      addKnockoutRound(winners,'Final');
      if(localTournament.type==='worldCup'||localTournament.type==='knockout4') addKnockoutRound(losers,'3.lük');
      localTournament.stage='finals';
    }else{
      addKnockoutRound(winners,nextRoundName(fixture.round,winners.length));localTournament.stage=winners.length===4?'semifinals':'knockout';
    }
  }

  function simulateTournamentFixture(fixture) {
    let scores=simulateScore();
    if(fixture.group){advanceGenericTournament(fixture,{scores,winner:scores[0]>scores[1]?fixture.home:scores[1]>scores[0]?fixture.away:null});return;}
    if(Number(fixture.legs)===2&&Number(fixture.leg||1)===2){
      const aggregate=[(fixture.aggregate?.[0]||0)+scores[0],(fixture.aggregate?.[1]||0)+scores[1]];
      if(aggregate[0]===aggregate[1])scores[0]+=1;
    }else if(Number(fixture.legs)!==2&&scores[0]===scores[1])scores[0]+=1;
    const winner=scores[0]>scores[1]?fixture.home:fixture.away;
    advanceGenericTournament(fixture,{scores,winner});
  }

  function openNextTournamentMatch() {
    if (!localTournament) return;
    let guard=0;
    while(guard++<80){
      const next=localTournament.fixtures.find(f=>f.status==='pending');
      if(!next){
        if(localTournament.stage==='finished')renderTournamentResults();
        else renderTournamentBracket();
        return;
      }
      if(next.home!==0&&next.away!==0){simulateTournamentFixture(next);continue;}
      next.status='live';
      const reversed=Number(next.legs)===2&&Number(next.leg||1)===2;
      const homeIndex=reversed?next.away:next.home,awayIndex=reversed?next.home:next.away;
      const home=localTournament.teams[homeIndex],away=localTournament.teams[awayIndex];
      setup.teams=[home,away];setup.side=0;setup.tournamentFixtureId=next.id;setup.tournamentLegReversed=reversed;
      applySettingsToUi({durationMinutes:setup.tournamentOptions.durationMinutes,cards:true,extraTime:reversed||Number(next.legs)!==2,shootout:reversed||Number(next.legs)!==2,teamColors:[home.color,away.color]});
      showBrief();return;
    }
  }

  function onlineSeatName(seat) {
    const player = online.lobby?.players?.[seat];
    return player?.teamName || player?.name || `Oyuncu ${Number(seat) + 1}`;
  }

  function renderOnlineTournament() {
    const tournament = online.tournament;
    if (!tournament || !els.tournamentBracket) return;
    const stageLabels = { semifinals:'YARI FİNALLER', finals:'FİNAL GECESİ', finished:'TURNUVA TAMAMLANDI' };
    els.tournamentStageText.textContent = stageLabels[tournament.stage] || '4 KİŞİLİK KUPA';
    els.tournamentBracket.innerHTML = (tournament.fixtures || []).map(fixture => {
      const [home, away] = fixture.seats || [];
      const live = fixture.status === 'live';
      return `<article class="bracket-fixture ${escapeHtml(fixture.status || 'pending')}"><small>${escapeHtml(fixture.round || 'MAÇ')}</small><div><span>${escapeHtml(onlineSeatName(home))}</span><b>${Array.isArray(fixture.scores) ? fixture.scores.join('–') : '—'}</b><span>${escapeHtml(onlineSeatName(away))}</span></div><em>${live ? 'CANLI · AYNI ANDA' : fixture.status === 'finished' ? `${escapeHtml(onlineSeatName(fixture.winnerSeat))} kazandı` : 'BEKLİYOR'}</em></article>`;
    }).join('');
    els.tournamentLiveMessage.textContent = tournament.stage === 'semifinals'
      ? 'İki yarı final aynı anda oynanıyor. Kendi eşleşmen açıldığında maç ekranına geçeceksin.'
      : tournament.stage === 'finals'
        ? 'Final ve üçüncülük maçı aynı anda oynanıyor.'
        : 'Turnuva tamamlandı.';
    els.tournamentNextButton.classList.add('hidden');
    els.tournamentHomeButton.textContent = 'LOBİYE DÖN';
    if (currentScreenName !== 'match' && tournament.stage !== 'finished') showScreen('tournament');
  }

  function renderOnlineTournamentResults(players = []) {
    const tournament = online.tournament;
    if (!tournament?.podium) return;
    const label = seat => players?.[seat]?.teamName || players?.[seat]?.name || onlineSeatName(seat);
    const podium = tournament.podium;
    els.podiumStage.innerHTML = `<div class="podium second"><small>2.</small><b>${escapeHtml(label(podium.runnerUp))}</b></div><div class="podium first"><small>ŞAMPİYON</small><b>${escapeHtml(label(podium.champion))}</b><span>🏆</span></div><div class="podium third"><small>3.</small><b>${escapeHtml(label(podium.third))}</b></div>`;
    const goals = Object.entries(tournament.stats?.goals || {}).sort((a,b)=>b[1]-a[1]);
    const assists = Object.entries(tournament.stats?.assists || {}).sort((a,b)=>b[1]-a[1]);
    const cards = Object.entries(tournament.stats?.cards || {}).sort((a,b)=>b[1]-a[1]);
    els.tournamentStats.innerHTML = `<article><small>GOL KRALI</small><b>${escapeHtml(goals[0]?.[0] || '—')}</b><span>${goals[0]?.[1] || 0} gol</span></article><article><small>ASİST KRALI</small><b>${escapeHtml(assists[0]?.[0] || '—')}</b><span>${assists[0]?.[1] || 0} asist</span></article><article><small>KART İSTATİSTİĞİ</small><b>${escapeHtml(cards[0]?.[0] || '—')}</b><span>${cards[0]?.[1] || 0} kart</span></article><article><small>TAMAMLANAN MAÇ</small><b>${(tournament.fixtures || []).filter(f=>f.status==='finished').length}</b><span>4 maçlık kupa</span></article>`;
    showScreen('tournament-results');
  }

  function renderTournamentResults() {
    if (!localTournament?.podium) return;
    const p=localTournament.podium;
    els.podiumStage.innerHTML=`<div class="podium second"><small>2.</small><b>${escapeHtml(tournamentTeamLabel(p.runnerUp))}</b></div><div class="podium first"><small>ŞAMPİYON</small><b>${escapeHtml(tournamentTeamLabel(p.champion))}</b><span>🏆</span></div>${p.third!==null&&p.third!==undefined?`<div class="podium third"><small>3.</small><b>${escapeHtml(tournamentTeamLabel(p.third))}</b></div>`:''}`;
    const scorer=Object.entries(localTournament.stats?.goals||{}).sort((a,b)=>b[1]-a[1])[0];
    const assister=Object.entries(localTournament.stats?.assists||{}).sort((a,b)=>b[1]-a[1])[0];
    const carded=Object.entries(localTournament.stats?.cards||{}).sort((a,b)=>b[1]-a[1])[0];
    els.tournamentStats.innerHTML=`<article><small>GOL KRALI</small><b>${scorer?escapeHtml(scorer[0]):'—'}</b><span>${scorer?scorer[1]:0} gol</span></article><article><small>ASİST KRALI</small><b>${assister?escapeHtml(assister[0]):'—'}</b><span>${assister?assister[1]:0} asist</span></article><article><small>KART İSTATİSTİĞİ</small><b>${carded?escapeHtml(carded[0]):'—'}</b><span>${carded?carded[1]:0} kart</span></article><article><small>TOPLAM MAÇ</small><b>${(localTournament.fixtures||[]).filter(f=>f.status==='finished').length}</b><span>tamamlandı</span></article>`;
    showScreen('tournament-results');
  }

  function showScreen(name, options = {}) {
    const target = document.querySelector(`#screen-${name}`) ? name : 'home';
    els.screens.forEach(screen => screen.classList.toggle('active', screen.id === `screen-${target}`));
    currentScreenName = target;
    UIShell?.activateScreen?.(target);
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
    const source = AppSettings?.get?.() || {};
    return { menuMusic: source.menuMusic !== false, stadiumAmbience: source.stadiumAmbience !== false, eventSounds: source.eventSounds !== false };
  }

  function ensureAudio() {
    Audio?.configure(currentAudioSettings());
    Audio?.unlock();
    Audio?.setMuted(muted);
  }

  function soundGain() { return 1; }

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
    if (Array.isArray(cue)) Audio.playFirst(cue, { ...options, replace: true, channel: options.channel || 'event' });
    else if (cue) Audio.play(cue, { ...options, replace: true, channel: options.channel || 'event' });
  }

  function playMatchEventAudio(type, detail = '') {
    const normalized = String(type || '').toLowerCase();
    const prefs = AppSettings?.get?.() || {};
    if (prefs.vibration !== false && navigator.vibrate && ['goal','yellow','red','secondyellow','timeout','post'].includes(normalized)) {
      navigator.vibrate(normalized === 'goal' ? [70,40,110] : normalized === 'red' ? [120,50,120] : 70);
    }
    const cueMap = {
      goal:['crowd.goal','ball.net'], pass:['ball.pass1','ball.pass2','ball.pass3'], player:['ball.playerSelect'], foul:['whistle.foul','ball.tackle'],
      corner:['ball.corner'], throwin:['ball.throwIn'], turnover:['ball.turnover'], shot:['ball.shot'], save:['ball.save'], post:['ball.post'], wide:['crowd.disappointment','ball.goalKick'],
      indirect:['whistle.freeKick'], yellow:['cards.yellow'], secondyellow:['cards.secondYellow'], red:[String(detail).toLowerCase().includes('ihlal')?'violation.red':'cards.red'],
      timeout:['timer.timeout'], penalty:['whistle.penalty'], freekick:['whistle.freeKick']
    };
    if (normalized === 'goal') Audio?.duckAmbience(.08, 4200);
    const cues = cueMap[normalized];
    if (cues) playAudioCue(cues, { channel: normalized === 'pass' || normalized === 'player' ? 'ball' : 'event' });
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

  function positionScore(slot, player) { return SquadBuilder.positionScore(slot, player); }

  function assignPlayersToSlots(selectedPlayers) { return SquadBuilder.assignPlayersToSlots(selectedPlayers, SLOTS); }

  function buildRandomLineup(source = PLAYERS) { return SquadBuilder.randomLineup(source, SLOTS); }

  function positionGroupMatch(player, group) { return SquadBuilder.positionGroupMatch(player, group); }

  function ratingRangeMatch(player, range) { return SquadBuilder.ratingRangeMatch(player, range); }

  function criteriaFilteredPlayers(criteria = setup.criteria, periodsInput = setup.selectedPeriods) {
    return SquadBuilder.filterPlayers(PLAYERS, criteria, periodsInput, PERIODS);
  }

  function buildCriteriaPool() { return SquadBuilder.criteriaPool(PLAYERS, setup.criteria, setup.selectedPeriods, PERIODS); }

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

  function renderTeamColorPalette() {
    if (!els.teamColorPalette) return;
    const side = setup.side;
    const used = new Set(setup.teams.map((team,index)=>index === side ? null : team?.color).filter(Boolean));
    if (setup.mode === 'friend') {
      (online.lobby?.players || []).forEach(player => {
        if (player?.side !== online.side && player?.teamColor) used.add(player.teamColor);
      });
    }
    const selected = setup.teams[side]?.color || setup.selectedColors[side] || TEAM_COLORS[side]?.value;
    els.teamColorPalette.innerHTML = TEAM_COLORS.map(color => {
      const disabled = used.has(color.value);
      return `<button class="team-color-swatch${selected===color.value?' selected':''}${disabled?' unavailable':''}" type="button" data-team-color="${color.value}" style="--swatch:${color.value}" aria-label="${escapeHtml(color.label)}" aria-pressed="${selected===color.value}" ${disabled?'disabled':''}><i style="--swatch:${color.value}"></i><span>${escapeHtml(color.label)}</span></button>`;
    }).join('');
    if (els.teamColorHint) els.teamColorHint.textContent = used.size ? 'Diğer takımın rengi pasif gösterilir.' : 'Renk skor tabelasında ve maç akışında görünür.';
  }

  function renderSetupState() {
    const side = setup.side;
    els.duelBuilderTab?.classList.remove('hidden');
    if (setup.mode === 'coop') els.setupTeamLabel.textContent = setup.competition === 'fourCup' ? `OYUNCU ${side + 1} · KUPA KADROSU` : `TAKIM ${side + 1}`;
    else if (setup.mode === 'friend') els.setupTeamLabel.textContent = `UZAKTAN OYUNCU · ${side === 0 ? 'İÇ SAHA' : 'DEPLASMAN'}`;
    else els.setupTeamLabel.textContent = 'SENİN TAKIMIN';

    const fallbackName = setup.mode === 'friend'
      ? `${online.name || (side === 0 ? 'İç Saha' : 'Deplasman')} XI`
      : (side === 0 ? '90+ XI' : 'İkinci Takım');
    els.teamNameInput.value = setup.teams[side]?.name || fallbackName;
    renderTeamColorPalette();
    const built = setup.teams[side];
    els.builtStatus.textContent = built ? `${built.lineup.length} oyuncu hazır` : 'Henüz kurulmadı';
    els.builtStatus.classList.toggle('done', Boolean(built));
    els.squadPreview.classList.toggle('hidden', !built);
    if (built) {
      els.squadPreview.innerHTML = `<h3>${escapeHtml(built.name)}</h3><ul class="lineup-list">${built.lineup.map(player => `<li><span><b>${player.slot}</b> ${escapeHtml(player.name)}</span><small>${player.rating}</small></li>`).join('')}</ul>`;
    }
    if (setup.mode === 'coop' && setup.competition === 'fourCup' && built && setup.side < 3) {
      els.nextSetupButton.textContent = `OYUNCU ${setup.side + 2} KADROSU →`;
      els.nextSetupButton.classList.remove('hidden');
    } else if (setup.mode === 'coop' && setup.side === 0 && built) {
      els.nextSetupButton.textContent = 'TAKIM 2’Yİ KUR →';
      els.nextSetupButton.classList.remove('hidden');
    } else if (setup.mode === 'friend' && built) {
      els.nextSetupButton.textContent = 'TAKIMI ODAYA GÖNDER →';
      els.nextSetupButton.classList.remove('hidden');
    } else if (built && (setup.mode === 'ai' || setup.side === 1 || (setup.mode === 'coop' && setup.competition === 'fourCup' && setup.side === 3))) {
      els.nextSetupButton.textContent = ['classicUcl','worldCup','fourCup'].includes(setup.competition) ? 'TURNUVAYI BAŞLAT →' : 'AYARLARA GEÇ →';
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
      color: setup.selectedColors[side] || TEAM_COLORS[side]?.value,
      lineup: lineup.map(player => ({ ...player, yellowCards: 0, red: false, injured: false }))
    };
    if (setup.mode === 'ai' && side === 0 && !setup.teams[1]) {
      setup.teams[1] = {
        name: 'Retro Makine',
        color: TEAM_COLORS.find(color => color.value !== setup.selectedColors[0])?.value || '#2878c8',
        lineup: buildRandomLineup().map(player => ({ ...player, yellowCards: 0, red: false, injured: false }))
      };
    }
    renderSetupState();
  }

  function candidateSetForSlot(slot, pool, usedIds) { return SquadBuilder.candidateSet(slot, pool, usedIds); }

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
      durationMinutes: Number(els.durationRange.value), cards: els.cardsToggle.checked, injury: els.injuryToggle.checked,
      extraTime: els.extraToggle.checked, shootout: els.shootoutToggle.checked,
      vibration: (AppSettings?.get?.().vibration) !== false,
      eventDuration: AppSettings?.get?.().eventDuration || 'long',
      teamColors: [...setup.selectedColors], competition: setup.competition
    };
  }

  function applySettingsToUi(settings = {}) {
    els.durationRange.value = settings.durationMinutes ?? 5; els.durationValue.textContent = `${els.durationRange.value} dk`;
    els.cardsToggle.checked = settings.cards !== false; els.injuryToggle.checked = Boolean(settings.injury);
    els.extraToggle.checked = settings.extraTime !== false; els.shootoutToggle.checked = settings.shootout !== false;
    if (Array.isArray(settings.teamColors)) setup.selectedColors = [settings.teamColors[0] || setup.selectedColors[0], settings.teamColors[1] || setup.selectedColors[1]];
    Audio?.configure(currentAudioSettings());
  }

  function saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsFromUi())); } catch (_) {}
  }

  function syncGlobalSettingsUi() {
    const prefs = AppSettings?.get?.() || {};
    if (els.globalMenuMusicToggle) els.globalMenuMusicToggle.checked = prefs.menuMusic !== false;
    if (els.globalStadiumToggle) els.globalStadiumToggle.checked = prefs.stadiumAmbience !== false;
    if (els.globalEventSoundsToggle) els.globalEventSoundsToggle.checked = prefs.eventSounds !== false;
    if (els.globalVibrationToggle) els.globalVibrationToggle.checked = prefs.vibration !== false;
    if (els.globalReducedMotionToggle) els.globalReducedMotionToggle.checked = Boolean(prefs.reducedMotion);
    if (els.globalEventDurationSelect) els.globalEventDurationSelect.value = prefs.eventDuration || 'long';
  }

  function saveGlobalSettings() {
    const next = AppSettings?.set?.({
      menuMusic: els.globalMenuMusicToggle?.checked !== false, stadiumAmbience: els.globalStadiumToggle?.checked !== false,
      eventSounds: els.globalEventSoundsToggle?.checked !== false, vibration: els.globalVibrationToggle?.checked !== false,
      reducedMotion: Boolean(els.globalReducedMotionToggle?.checked), eventDuration: els.globalEventDurationSelect?.value || 'long'
    }) || {};
    document.documentElement.classList.toggle('reduced-motion', Boolean(next.reducedMotion));
    Audio?.configure(currentAudioSettings());
    Audio?.setAmbience(currentScreenName === 'match' ? 'ambience.stadium' : 'ambience.menu');
    showEventOverlay('AYARLAR KAYDEDİLDİ', 'Ses sistemi sadeleştirildi: aynı anda tek olay efekti çalır.', 'green', '90+', 1600);
  }

  function initializeSettings() {
    let stored = {};
    try { stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); } catch (_) {}
    applySettingsToUi(stored); syncGlobalSettingsUi();
    document.documentElement.classList.toggle('reduced-motion', Boolean(AppSettings?.get?.().reducedMotion));
  }

  function makeRuntimeTeam(team, side = 0, settings = settingsFromUi()) {
    return {
      name: team.name,
      color: team.color || settings.teamColors?.[side] || (side === 0 ? '#d44735' : '#2878c8'),
      lineup: team.lineup.map(player => ({ ...player, yellowCards: 0, red: false, injured: false, goals: 0, assists: 0, sentOffReason: null })),
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
    const lobby=online.lobby,required=Number(lobby.maxPlayers||2);
    const ready=Array.isArray(lobby.startReady)?lobby.startReady.slice(0,required):Array(required).fill(false);
    const meReady=Boolean(ready[online.side]),readyCount=ready.filter(Boolean).length,allReady=readyCount===required;
    const deadline=Number(lobby.startDeadline)||0;
    online.startReady=ready;online.startDeadline=deadline||null;
    if(allReady){els.onlineReadyMessage.textContent=`${required} oyuncu da hazır. ${required===4?'Eşleşmeler':'Saha'} açılıyor…`;els.briefStartButton.disabled=true;els.briefStartButton.textContent='HERKES HAZIR ✓';}
    else if(meReady){els.onlineReadyMessage.textContent=`Hazırlığın bildirildi. ${required-readyCount} oyuncu bekleniyor; süre dolarsa organizasyon otomatik başlar.`;els.briefStartButton.disabled=true;els.briefStartButton.textContent='HAZIRLIK BİLDİRİLDİ ✓';}
    else if(readyCount>0){els.onlineReadyMessage.textContent=`${readyCount}/${required} oyuncu hazır. Sen de 30 saniye içinde onaylayabilirsin.`;els.briefStartButton.disabled=false;els.briefStartButton.textContent='BEN DE HAZIRIM';}
    else{els.onlineReadyMessage.textContent=`Hazır olduğunda bildir. İlk onaydan sonra diğer oyunculara 30 saniye verilir.`;els.briefStartButton.disabled=false;els.briefStartButton.textContent='MAÇA HAZIRIM';}
    clearInterval(readyTicker);
    const tick=()=>{if(!online.startDeadline){els.readyCountdown.textContent='—';return;}els.readyCountdown.textContent=`${Math.max(0,Math.ceil((online.startDeadline-Date.now())/1000))} sn`;};
    tick();readyTicker=setInterval(tick,250);
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
    const tournamentFixture = localTournament && setup.tournamentFixtureId ? localTournament.fixtures.find(item=>item.id===setup.tournamentFixtureId) : null;
    const series = tournamentFixture && setup.tournamentLegReversed ? { type:'twoLeg', leg:2, aggregateBase:[tournamentFixture.aggregate?.[1]||0,tournamentFixture.aggregate?.[0]||0] } : null;
    match = {
      version: 5,
      mode: setup.mode,
      teams: setup.teams.map((team, side) => makeRuntimeTeam(team, side, settings)),
      settings,
      scores: [0, 0], activeSide: 0, activePlayerId: [null, null],
      context: { type: 'coinToss', owner: 0 }, pendingFoul: null, phase: 'kickoff',
      kickoff: { winner: null, readyToStart: false, face: null },
      firstHalfStarter: null, secondHalfStarter: null, passStreak: [0, 0], lastPasserId: [null, null],
      periodIndex: 0, periodElapsedMs: 0,
      periodDurationsMs: [totalSeconds * 500, totalSeconds * 500],
      regulationPeriodDurationsMs: [totalSeconds * 500, totalSeconds * 500], regulationSeconds: totalSeconds,
      totalElapsedMs: 0, possessionMs: [0, 0], rollElapsedMs: 0, turnElapsedMs: 0,
      delayWasteMs: [0, 0], stoppageMs: 0, stoppageAnnounced: false,
      lastFrame: performance.now(), running: true, paused: false, pausedBy: null, pauseStartedAt: null,
      pauseBudgetsMs: [60000, 60000], resolving: false, awaitingPeriodStart: false, awaitingPeriodSide: null,
      periodStartKey: null, events: [], winnerSide: null, shootout: null, series
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


  function clearAssistChain(side) {
    if (!match) return;
    match.lastPasserId ||= [null, null];
    match.lastPasserId[side] = null;
  }

  function registerGoalContribution(side, actor, allowAssist = true) {
    if (!match) return;
    match.lastPasserId ||= [null, null];
    if (actor) actor.goals = (Number(actor.goals) || 0) + 1;
    const passerId = match.lastPasserId[side];
    if (allowAssist && passerId && passerId !== actor?.id) {
      const passer = getPlayer(side, passerId);
      if (passer) passer.assists = (Number(passer.assists) || 0) + 1;
    }
    match.lastPasserId[side] = null;
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

    const regulationTargetMs = Math.max(60000, Number(match.regulationSeconds || match.settings?.durationMinutes * 60 || 300) * 1000);
    const addedMs = Number(match.stoppageMs) || 0;
    const showAdded = match.phase === 'regulation' && match.periodIndex === 1 && (match.stoppageAnnounced || addedMs > 0);
    let scoreboardElapsed = Number(match.totalElapsedMs || 0) + (match.phase === 'regulation' ? remoteDelta : 0);
    let scoreboardTarget = regulationTargetMs + (match.stoppageAnnounced ? addedMs : 0);
    if (match.phase === 'extra') {
      const completedExtra = (match.periodDurationsMs || []).slice(0, match.periodIndex).reduce((sum,value)=>sum+Number(value||0),0);
      scoreboardElapsed = regulationTargetMs + addedMs + completedExtra + displayPeriod;
      scoreboardTarget = regulationTargetMs + addedMs + (match.periodDurationsMs || []).reduce((sum,value)=>sum+Number(value||0),0);
    }
    if (kickoffPhase) {
      els.periodLabel.textContent = 'YAZI TURA';
      els.matchClock.textContent = '00:00';
    } else if (match.phase === 'shootout') {
      els.periodLabel.textContent = 'PENALTILAR';
      els.matchClock.textContent = `${match.shootout.scores[0]} — ${match.shootout.scores[1]}`;
    } else if (match.phase === 'finished') {
      els.periodLabel.textContent = 'MAÇ SONU';
      els.matchClock.textContent = formatClock(scoreboardElapsed);
    } else {
      els.periodLabel.textContent = match.phase === 'extra' ? `UZATMA ${match.periodIndex + 1}` : `${match.periodIndex + 1}. DEVRE`;
      els.matchClock.textContent = formatClock(scoreboardElapsed);
    }
    els.matchDurationLabel.textContent = `/ ${formatClock(scoreboardTarget)}`;
    els.addedTimeLabel.classList.toggle('hidden', !showAdded);
    els.addedTimeLabel.textContent = showAdded ? `HAKEM +${formatClock(addedMs)}` : '';
    if (match.series?.leg === 2) {
      const base=match.series.aggregateBase||[0,0], aggregate=[(base[0]||0)+(match.scores[0]||0),(base[1]||0)+(match.scores[1]||0)];
      els.periodLabel.textContent = `${els.periodLabel.textContent} · 2. AYAK`;
      els.aggregateScoreLabel.classList.remove('hidden');
      els.aggregateScoreLabel.textContent=`TOPLAM ${aggregate[0]}–${aggregate[1]}`;
    } else els.aggregateScoreLabel.classList.add('hidden');

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
    const canRemoteStop = remoteTurn && online.connected && (Number.isInteger(online.matchSide) ? online.matchSide : online.side) === owner;
    els.matchStopButton.disabled = Boolean(match.awaitingPeriodStart) || (remoteTurn
      ? (!canRemoteStop || match.paused || match.resolving || !match.running)
      : (aiTurn || match.paused || match.resolving || !match.running));

    if (remoteTurn) {
      els.aiHint.textContent = (Number.isInteger(online.matchSide) ? online.matchSide : online.side) === owner ? 'Sıra sende — kronometreyi durdur.' : 'Rakibin kronometreyi kolluyor…';
      els.aiHint.classList.toggle('hidden', match.paused || match.resolving || !match.running || match.awaitingPeriodStart || match.context?.type === 'kickoffReady');
      els.remoteMatchBar.classList.remove('hidden');
      els.remoteRoomCode.textContent = online.code || '------';
      els.remoteConnectionText.textContent = online.connected ? ((Number.isInteger(online.matchSide) ? online.matchSide : online.side) === owner ? 'SIRA SENDE' : 'RAKİP OYNUYOR') : 'BAĞLANTI KESİLDİ';
      els.remoteConnectionText.classList.toggle('offline', !online.connected);
    } else {
      els.remoteMatchBar.classList.add('hidden');
      els.aiHint.textContent = selecting ? 'Rakip oyuncusunu seçiyor…' : 'Rakip olay sonucunu belirliyor…';
      els.aiHint.classList.toggle('hidden', !aiTurn || match.paused || match.resolving || match.awaitingPeriodStart || kickoffPhase);
    }

    const pauseSide = remoteTurn ? (Number.isInteger(online.matchSide) ? online.matchSide : online.side) : owner;
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
      const assists = player.assists ? `<span class="assist-count" title="Asist">A ${player.assists}</span>` : '';
      const injury = player.injured ? '<span class="injury-icon" title="Sakat">✚</span>' : '';
      return `<div class="match-player-row${player.red || player.injured ? ' dismissed' : ''}"><span class="player-slot-badge">${escapeHtml(player.slot)}</span><div class="match-player-info"><strong>${escapeHtml(player.name)}</strong><small>${escapeHtml(player.nationality)} · ${player.rating} puan${secondYellow ? ' · 2. sarıdan atıldı' : player.sentOffReason === 'directRed' ? ' · direkt kırmızı' : player.sentOffReason === 'timeoutRed' ? ' · süre ihlali kırmızısı' : player.injured ? ' · sakatlandı' : ''}</small></div><div class="player-statuses">${goals}${assists}${card}${injury}</div></div>`;
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
      match.scores[side] += 1; registerGoalContribution(side, actor, true);
      addEvent(`${actor?.name || match.teams[side].name} gol attı`, true, { type:'goal', side, playerId:actor?.id, title:actor?.name || match.teams[side].name, detail:'Gol' });
      playMatchEventAudio('goal');
      transitionTo(other, { type:'playerSelect' }, { title:'GOL!', subtitle:`${actor?.name || match.teams[side].name} ağları buldu. Başlama rakipte.`, tone:'red', kicker:`RAKAM ${digit}`, duration:5200 }); return;
    }
    if (event.key === 'pass') {
      match.passStreak[side] += 1;
      match.lastPasserId ||= [null, null]; match.lastPasserId[side] = actor?.id || null;
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
      clearAssistChain(side);
      addEvent(`${match.teams[other].name} taç kazandı`, false, { type:'throwIn', side:other, title:'Taç', detail:'Top rakibe geçti' }); playMatchEventAudio('throwIn');
      transitionTo(other, { type:'playerSelect' }, { title:'TAÇ', subtitle:`Top ${match.teams[other].name} tarafına geçti.`, tone:'navy', kicker:`RAKAM ${digit}`, duration:3000 }); return;
    }
    if (event.key === 'turnover') {
      clearAssistChain(side);
      addEvent(`${actor?.name || match.teams[side].name} topu kaybetti`, false, { type:'turnover', side, playerId:actor?.id, title:'Aut / top kaybı', detail:actor?.name || '' }); playMatchEventAudio('turnover');
      transitionTo(other, { type:'playerSelect' }, { title:'AUT', subtitle:`Top ${match.teams[other].name} takımında.`, tone:'navy', kicker:`RAKAM ${digit}`, duration:3000 }); return;
    }
    if (event.key === 'corner') {
      clearAssistChain(side);
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
      clearAssistChain(side);
      match.pendingFoul = { foulerSide:side, victimSide:other, foulerId:actor?.id || null, result:null };
      addEvent(`${actor?.name || match.teams[side].name} faul yaptı`, true, { type:'foul', side, playerId:actor?.id, title:'Faul', detail:actor?.name || '' }); playMatchEventAudio('foul'); pickRestartPlayer(other);
      transitionTo(other, { type:'foulResult' }, { title:'FAUL!', subtitle:`${match.teams[other].name} önce faul sonucunu, sonra kartı belirleyecek.`, tone:'yellow', kicker:`RAKAM ${digit}`, duration:4200 }); return;
    }
    if (event.key === 'freeKick') {
      clearAssistChain(side);
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
      match.scores[side] += 1; registerGoalContribution(side, actor, true);
      addEvent(`${actor?.name || match.teams[side].name} şuttan gol attı`, true, { type:'goal', side, playerId:actor?.id, title:actor?.name || 'Gol', detail:'Açık oyun şutu' }); playMatchEventAudio('goal');
      transitionTo(other, { type:'playerSelect' }, { title:'GOL!', subtitle:`${actor?.name || match.teams[side].name} şutu ağlara gönderdi.`, tone:'red', kicker:`ŞUT SONUCU · ${digit}`, duration:5200 }); return;
    }
    if (result === 'corner') {
      clearAssistChain(side);
      const outcome = Core.registerCorner(match.teams[side].corners); match.teams[side].corners = outcome.corners;
      if (outcome.penalty) {
        addEvent(`${match.teams[side].name}: şuttan gelen 3. korner penaltı`, true, { type:'penalty', side, title:'Penaltı', detail:'3. korner' }); playAudioCue('whistle.penalty');
        transitionTo(side, { type:'setPieceShot', reason:'penalty' }, { title:'PENALTI!', subtitle:'Şuttan çıkan korner üçüncü kornerdi; sayaç sıfırlandı.', tone:'yellow', kicker:'ŞUT · RAKAM 0', duration:4300 });
      } else {
        addEvent(`${match.teams[side].name} şuttan korner kazandı (${outcome.corners}/3)`, true, { type:'corner', side, title:'Korner', detail:`${outcome.corners}/3` }); playMatchEventAudio('corner');
        transitionTo(other, { type:'playerSelect' }, { title:'KORNER', subtitle:`Korner sayacı ${outcome.corners}/3 oldu. Şut sonucu sonrası top rakibe geçer.`, tone:'green', kicker:'ŞUT · RAKAM 0', duration:3700 });
      } return;
    }
    clearAssistChain(side);
    const copy = shotOutcomeCopy(result, 'Şut'); addEvent(`${actor?.name || 'Oyuncu'}: ${copy.title.toLocaleLowerCase('tr')}`, true, { type:copy.type, side, playerId:actor?.id, title:copy.title, detail:actor?.name || '' }); playAudioCue(copy.audio, { stagger:100 });
    transitionTo(other, { type:'playerSelect' }, { title:copy.title, subtitle:copy.detail, tone:copy.tone, kicker:`ŞUT · RAKAM ${digit}`, duration:4300 });
  }

  function resolveSetPieceShot(digit) {
    const side = match.context.owner, other = side === 0 ? 1 : 0, reason = match.context.reason;
    const actor = currentActor() || pickRestartPlayer(side); const result = Core.setPieceOutcomeForDigit(digit);
    if (result === 'goal') {
      match.scores[side] += 1; registerGoalContribution(side, actor, false);
      addEvent(`${actor?.name || match.teams[side].name} ${reason === 'penalty' ? 'penaltıdan' : 'frikikten'} gol attı`, true, { type:'goal', side, playerId:actor?.id, title:actor?.name || 'Gol', detail:reason === 'penalty' ? 'Penaltı golü' : 'Frikik golü' });
      reason === 'penalty' ? playAudioCue('setPiece.penaltyGoal') : playMatchEventAudio('goal');
      transitionTo(other, { type:'playerSelect' }, { title:'GOL!', subtitle:`Çift rakam gol getirdi. Başlama ${match.teams[other].name} takımında.`, tone:'red', kicker:`RAKAM ${digit} · ÇİFT`, duration:5200 }); return;
    }
    clearAssistChain(side);
    const label = reason === 'penalty' ? 'Penaltı' : 'Frikik'; const copy = shotOutcomeCopy(result, label);
    addEvent(`${label}: ${copy.title.toLocaleLowerCase('tr')}`, true, { type:copy.type, side, playerId:actor?.id, title:copy.title, detail:label });
    if (reason === 'penalty') playAudioCue(result === 'saved' ? 'setPiece.penaltySave' : 'setPiece.penaltyMiss'); else playAudioCue(copy.audio, { stagger:100 });
    transitionTo(other, { type:'playerSelect' }, { title:copy.title, subtitle:`Tek rakam gol olmadı: ${copy.detail}`, tone:copy.tone, kicker:`RAKAM ${digit} · TEK`, duration:4400 });
  }


  function handleTurnTimeout() {
    if (match?.context?.type === 'coinToss') {
      match.running = false;
      match.resolving = true;
      resolveCoinToss();
      return;
    }
    if (!match || match.resolving) return;
    clearAiTimer();
    match.running = false;
    match.resolving = true;
    const side = match.context.owner;
    const other = side === 0 ? 1 : 0;
    clearAssistChain(side);
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
    const base = Array.isArray(match.series?.aggregateBase) ? match.series.aggregateBase : [0,0];
    const effective = [(base[0]||0)+(match.scores[0]||0),(base[1]||0)+(match.scores[1]||0)];
    const tied = effective[0] === effective[1];
    if (phase === 'regulation' && tied && match.settings.extraTime) {
      const extraTotal = Core.roundExtraTimeSeconds(match.regulationSeconds) * 1000;
      match.periodDurationsMs = [extraTotal / 2, extraTotal / 2];
      preparePeriodStart(match.firstHalfStarter ?? 0, 'extra', 0);
      return;
    }
    if (tied && match.settings.shootout) startShootout();
    else {
      playAudioCue('whistle.fulltime', { replace: true, channel: 'whistle' });
      finishMatch(tied ? null : (effective[0] > effective[1] ? 0 : 1));
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
    const viewerSide = match.mode === 'friend' ? (Number.isInteger(online.matchSide) ? online.matchSide : online.side) : 0;
    if (winnerSide === null) playAudioCue('matchEnd.draw', { replace: true, channel: 'match-end' });
    else if (match.shootout && winnerSide === viewerSide) playAudioCue('matchEnd.shootoutVictory', { replace: true, channel: 'match-end' });
    else playAudioCue(winnerSide === viewerSide ? 'matchEnd.victory' : 'matchEnd.defeat', { replace: true, channel: 'match-end' });
    const possession = Core.possessionPercent(match.possessionMs);
    els.possessionResult.textContent = `${possession[0]}% — ${possession[1]}%`;
    renderResultTimeline();
    const canRequest = match.mode !== 'friend' || match.winnerSide === null || (Number.isInteger(online.matchSide) ? online.matchSide : online.side) !== match.winnerSide;
    els.rematchButton.textContent = match.mode === 'friend' ? 'RÖVANŞ İSTE' : 'RÖVANŞ';
    els.rematchButton.disabled = !canRequest;
    if (match.mode === 'friend' && online.roomType === 'four') {
      els.rematchButton.classList.add('hidden');
      els.newGameButton.textContent = 'TURNUVA MERKEZİ →';
    }
    if (localTournament && setup.tournamentFixtureId) {
      const fixture = localTournament.fixtures.find(f => f.id === setup.tournamentFixtureId);
      if (fixture) {
        const reversed = Boolean(setup.tournamentLegReversed);
        const orientedScores = reversed ? [match.scores[1], match.scores[0]] : [...match.scores];
        const winner = winnerSide === null ? null : (reversed ? (winnerSide === 0 ? fixture.away : fixture.home) : (winnerSide === 0 ? fixture.home : fixture.away));
        const result = { scores:orientedScores, winner };
        match.teams.forEach(team => team.lineup.forEach(player => { if(player.goals) localTournament.stats.goals[player.name]=(localTournament.stats.goals[player.name]||0)+player.goals; if(player.assists) localTournament.stats.assists[player.name]=(localTournament.stats.assists[player.name]||0)+player.assists; if(player.yellowCards) localTournament.stats.cards[player.name]=(localTournament.stats.cards[player.name]||0)+player.yellowCards; }));
        advanceGenericTournament(fixture, result);
      }
      setup.tournamentFixtureId = null; setup.tournamentLegReversed = false;
      els.rematchButton.classList.add('hidden');
      els.newGameButton.textContent = localTournament.stage === 'finished' ? 'KUPA SONUÇLARI →' : 'TURNUVAYA DÖN →';
    } else {
      els.rematchButton.classList.remove('hidden');
      els.newGameButton.textContent = 'YENİ OYUN';
    }
    showScreen('results');
  }

  function resetSetup(full = true) {
    if (full) {
      setup.mode = null;
      setup.teams = [null, null];
      setup.competition = 'single';
      setup.roomType = 'single';
      setup.selectedColors = ['#d44735', '#2878c8'];
      setup.tournamentOptions = { legs: 1, durationMinutes: 3, squadMethod: 'random' };
      localTournament = null;
      duel = null;
      localDuelPairs = null;
      localDuelPairIndex = 0;
      localDuelUsedIds = new Set();
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
    else if (target === 'competition') showScreen('competition');
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
    const map = { results:'home',match:'home',brief:setup.mode==='friend'?'lobby':'settings',settings:'squad',draft:'squad',squad:setup.mode==='friend'?'lobby':'competition',duel:'squad',lobby:'online',online:'mode',competition:'mode','tournament-config':'competition',tournament:'home','tournament-results':'home','app-settings':'home',howto:'home',mode:'home' };
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

  function duelSeat(localSide) {
    return Number.isInteger(duel?.seats?.[localSide]) ? duel.seats[localSide] : localSide;
  }

  function duelLocalSideForSeat(seat) {
    const index = duel?.seats?.indexOf(seat);
    return index >= 0 ? index : seat;
  }

  function duelTeamName(localSide) {
    if (setup.mode === 'friend') {
      const seat = duelSeat(localSide);
      return online.lobby?.players?.[seat]?.name || `OYUNCU ${seat + 1}`;
    }
    if (setup.mode === 'ai') return localSide === 0 ? (setup.teams[0]?.name || 'SEN') : 'RETRO MAKİNE';
    const seat = duelSeat(localSide);
    return setup.teams?.[seat]?.name || `TAKIM ${seat + 1}`;
  }

  function selectedPeriodIds(value) {
    if (!value || value === 'all') return [];
    return String(value).split('+').filter(id => PERIODS.some(period => period.id === id)).slice(0,2);
  }

  function duelOptions(key, selections = {}) {
    let base = PLAYERS;
    const periods = selectedPeriodIds(selections.period);
    if (periods.length) base = base.filter(player => periods.some(id => { const p=PERIODS.find(x=>x.id===id); return p && player.activeStart<=p.end && player.activeEnd>=p.start; }));
    if (key === 'period') {
      const singles=PERIODS.map(p=>({value:p.id,label:p.label}));
      const pairs=[]; for(let i=0;i<PERIODS.length;i++)for(let j=i+1;j<PERIODS.length;j++)pairs.push({value:`${PERIODS[i].id}+${PERIODS[j].id}`,label:`${PERIODS[i].label} + ${PERIODS[j].label}`});
      return [{value:'all',label:'Tüm dönemler'},...singles,...pairs];
    }
    if (key === 'nationality') { const counts=new Map();base.forEach(p=>counts.set(p.nationality,(counts.get(p.nationality)||0)+1));return [{value:'all',label:'Tüm milliyetler'},...[...counts].sort((a,b)=>b[1]-a[1]).slice(0,30).map(([value,count])=>({value,label:`${value} · ${count}`}))]; }
    if (key === 'league') { const counts=new Map();base.forEach(p=>(p.leagues||[]).forEach(x=>counts.set(x,(counts.get(x)||0)+1)));return [{value:'all',label:'Tüm ligler'},...[...counts].sort((a,b)=>b[1]-a[1]).slice(0,30).map(([value,count])=>({value,label:`${value} · ${count}`}))]; }
    if (key === 'rating') return [{value:'all',label:'Tüm puanlar'},{value:'60-79',label:'60–79 · Sürpriz havuz'},{value:'70-89',label:'70–89 · Dengeli'},{value:'80-99',label:'80–99 · Elit'},{value:'86-99',label:'86–99 · Efsaneler'}];
    return [{value:'balanced',label:'Dengeli kadro'},{value:'legends',label:'Efsane ağırlıklı'},{value:'modern',label:'Modern dönem ağırlıklı'},{value:'surprise',label:'Sürpriz transferler'}];
  }

  function filterDuelPool(selections = {}) {
    const periods=selectedPeriodIds(selections.period);
    return PLAYERS.filter(player => {
      if(periods.length && !periods.some(id=>{const p=PERIODS.find(x=>x.id===id);return p&&player.activeStart<=p.end&&player.activeEnd>=p.start;}))return false;
      if (selections.nationality && selections.nationality !== 'all' && player.nationality !== selections.nationality) return false;
      if (selections.league && selections.league !== 'all' && !(player.leagues||[]).includes(selections.league)) return false;
      if (selections.rating && selections.rating !== 'all' && !ratingRangeMatch(player, selections.rating)) return false;
      return true;
    });
  }

  function duelCandidatesFor(state) {
    const side = state.turn;
    const slot = SLOTS[state.picks[side].length];
    const used = new Set([...state.picks.flat().map(p => p.id), ...(state.globalUsedIds || [])]);
    const shown = new Set(state.shownIds || []);
    let pool = filterDuelPool(state.selections).filter(p => !used.has(p.id) && !shown.has(p.id));
    if (state.selections.style === 'legends') pool.sort((a,b)=>b.rating-a.rating);
    else if (state.selections.style === 'modern') pool.sort((a,b)=>b.activeEnd-a.activeEnd || b.rating-a.rating);
    else if (state.selections.style === 'surprise') pool = shuffle(pool).sort((a,b)=>a.rating-b.rating);
    let candidates = candidateSetForSlot(slot, pool, new Set([...used,...shown])).slice(0,3);
    if (candidates.length < 3) candidates = candidateSetForSlot(slot, filterDuelPool(state.selections).filter(p=>!used.has(p.id)), used).slice(0,3);
    state.shownIds = [...shown, ...candidates.map(p=>p.id)];
    return candidates;
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
    return { ...raw, picks: (raw.picks || [[],[]]).map(list => list || []), candidates: raw.candidates || [], shownIds: raw.shownIds || [] };
  }

  function scheduleLocalDuelCoinTimeout() {
    if (duelCoinTimer) clearTimeout(duelCoinTimer);
    duelCoinTimer = null;
    if (setup.mode === 'friend' || !duel || duel.phase !== 'coin') return;
    const remaining = Math.max(100, Number(duel.coinDeadline || (Date.now() + 10000)) - Date.now());
    duelCoinTimer = setTimeout(() => {
      if (duel?.phase === 'coin') flipLocalDuelCoin(true);
    }, remaining);
  }

  function renderDuel() {
    if (!duel) return;
    els.duelTeam0Name.textContent = duelTeamName(0); els.duelTeam1Name.textContent = duelTeamName(1);
    els.coinStage.classList.toggle('hidden', duel.phase !== 'coin');
    els.duelCriteriaStage.classList.toggle('hidden', duel.phase !== 'criteria');
    els.duelPickStage.classList.toggle('hidden', duel.phase !== 'picks' && duel.phase !== 'done');
    if (duel.phase === 'coin') {
      els.duelStatusText.textContent = 'YAZI TURA İLK KRİTERİ VE İLK TRANSFERİ BELİRLER';
      els.flipCoinButton.disabled = setup.mode === 'friend' && !duel.seats?.includes(online.side);
      scheduleLocalDuelCoinTimeout();
    }
    if (duel.phase === 'criteria') {
      const criterion = DUEL_CRITERIA[duel.criteriaIndex];
      els.duelTurnName.textContent = duelTeamName(duel.turn); els.duelCriteriaProgress.textContent = `${duel.criteriaIndex + 1} / ${DUEL_CRITERIA.length} · ${criterion.label}`;
      els.duelStatusText.textContent = `${duelTeamName(duel.turn)} KRİTER SEÇİYOR`;
      const myTurn = setup.mode !== 'friend' || online.side === duelSeat(duel.turn);
      els.duelCriteriaChoices.innerHTML = duelOptions(criterion.key, duel.selections).map(opt=>`<button class="duel-choice" data-duel-value="${escapeHtml(opt.value)}" ${myTurn?'':'disabled'}><b>${escapeHtml(opt.label)}</b></button>`).join('');
      els.duelCriteriaSummary.innerHTML = DUEL_CRITERIA.slice(0,duel.criteriaIndex).map(item=>`<span><b>${item.label}</b> ${escapeHtml(duel.selections[item.key] || '—')}</span>`).join('');
    }
    if (duel.phase === 'picks' || duel.phase === 'done') {
      els.duelPickTurnName.textContent = duel.phase === 'done' ? 'KADROLAR TAMAM' : duelTeamName(duel.turn);
      const picked = duel.picks[0].length + duel.picks[1].length;
      els.duelPickProgress.textContent = `${picked} / 22 OYUNCU`;
      const myTurn = setup.mode === 'friend' ? online.side === duelSeat(duel.turn) : !(setup.mode === 'ai' && duel.turn === 1);
      els.duelPickCandidates.innerHTML = duel.phase === 'done' ? '<div class="duel-complete-card">İki kadro da hazır. Formasyonları kontrol et ve devam et.</div>' : (duel.candidates || []).map((player,index)=>`<article class="duel-player-card" data-duel-index="${index}"><span>${escapeHtml(SLOTS[duel.picks[duel.turn].length])}</span><strong>${escapeHtml(player.name)}</strong><small>${escapeHtml(player.nationality)} · ${escapeHtml(player.position)}</small><b>${player.rating}</b></article>`).join('');
      if(els.duelStopButton){els.duelStopButton.disabled=!myTurn||duel.phase==='done';els.duelStopButton.classList.toggle('hidden',duel.phase==='done');}
      if(duel.phase==='picks'&&myTurn) startDuelWatch(); else stopDuelWatchLoop();
      renderDuelPitch(els.duelPitch0, duel.picks[0]); renderDuelPitch(els.duelPitch1, duel.picks[1]);
      els.duelFinishButton.classList.toggle('hidden', duel.phase !== 'done');
    } else els.duelFinishButton.classList.add('hidden');
    scheduleLocalDuelAi();
  }

  function stopDuelWatchLoop(){ if(duelWatchRaf) cancelAnimationFrame(duelWatchRaf); duelWatchRaf=null; }
  function startDuelWatch(){
    stopDuelWatchLoop(); if(!duel||duel.phase!=='picks'||!(duel.candidates||[]).length)return;
    const started=performance.now();
    const loop=now=>{ if(!duel||duel.phase!=='picks')return; const elapsed=now-started; const index=Math.floor(elapsed/720)%duel.candidates.length; duel.liveCandidateIndex=index; if(els.duelWatchDisplay)els.duelWatchDisplay.textContent=formatStopwatch(elapsed); $$('.duel-player-card').forEach((card,i)=>card.classList.toggle('candidate-live',i===index)); duelWatchRaf=requestAnimationFrame(loop); };
    duelWatchRaf=requestAnimationFrame(loop);
  }
  function stopDuelCandidate(){
    if(!duel||duel.phase!=='picks')return; stopDuelWatchLoop(); const index=Number.isInteger(duel.liveCandidateIndex)?duel.liveCandidateIndex:0; const player=duel.candidates[index]; if(!player)return;
    playAudioCue('timer.stop',{channel:'timer'});
    if(setup.mode==='friend') online.socket?.emit('duel:pick',{playerId:player.id},response=>{if(!response?.ok)showEventOverlay('TRANSFER OLMADI',response?.error||'','red');}); else chooseLocalDuelPlayer(player.id);
  }
  function scheduleLocalDuelAi(){
    if(setup.mode!=='ai'||!duel||duel.turn!==1)return;
    clearTimeout(duel.aiTimer);
    duel.aiTimer=setTimeout(()=>{
      if(!duel||duel.turn!==1)return;
      if(duel.phase==='criteria'){ const criterion=DUEL_CRITERIA[duel.criteriaIndex]; const options=duelOptions(criterion.key,duel.selections); chooseLocalDuelCriterion(randomItem(options).value); }
      else if(duel.phase==='picks'&&duel.candidates.length) chooseLocalDuelPlayer(randomItem(duel.candidates).id);
    },900+Math.random()*900);
  }

  function startLocalDuel() {
    if (setup.competition === 'fourCup' && setup.mode === 'coop') {
      if (!localDuelPairs) {
        localDuelPairs = [[0,1],[2,3]];
        localDuelPairIndex = 0;
        localDuelUsedIds = new Set();
      }
    } else {
      localDuelPairs = null;
      localDuelPairIndex = 0;
      localDuelUsedIds = new Set();
    }
    const seats = localDuelPairs?.[localDuelPairIndex] || [0,1];
    duel = { phase:'coin', requestedBy:seats[0], winner:null, turn:0, seats, criteriaIndex:0, selections:{}, picks:[[],[]], candidates:[], shownIds:[], globalUsedIds:[...localDuelUsedIds], coinDeadline:Date.now()+10000 };
    showScreen('duel'); renderDuel();
  }

  function flipLocalDuelCoin(auto = false) {
    if (!duel || duel.phase !== 'coin') return;
    if (duelCoinTimer) clearTimeout(duelCoinTimer); duelCoinTimer = null;
    els.duelCoin.classList.add('flipping'); els.flipCoinButton.disabled = true;
    setTimeout(()=>{
      duel.winner = Math.random() < .5 ? 0 : 1; duel.turn = duel.winner; duel.phase = 'criteria';
      els.duelCoin.classList.remove('flipping');
      showEventOverlay(auto ? 'OTOMATİK YAZI TURA' : 'YAZI TURA', `${duelTeamName(duel.winner)} ilk kriteri ve ilk oyuncuyu seçecek.`, 'yellow', 'TRANSFER DÜELLOSU', 3600, renderDuel);
    }, 1300);
  }

  function chooseLocalDuelCriterion(value) {
    const key = DUEL_CRITERIA[duel.criteriaIndex].key; duel.selections[key] = value; duel.criteriaIndex += 1;
    if (duel.criteriaIndex >= DUEL_CRITERIA.length) {
      const pool = filterDuelPool(duel.selections);
      if (pool.length < 22 || !pool.some(p=>p.position==='GK')) { showEventOverlay('HAVUZ DAR', 'Bu kriterlerle iki kadro kurulamıyor. Düello dengeli havuzla devam edecek.', 'navy', `${pool.length} OYUNCU`, 4200); duel.selections = { period:'all', nationality:'all', league:'all', rating:'all', style:duel.selections.style || 'balanced' }; }
      duel.phase = 'picks'; duel.turn = duel.winner; duel.shownIds=[]; duel.candidates = duelCandidatesFor(duel);
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
    if (setup.mode === 'friend') {
      duel = null;
      renderOnlineLobby();
      showScreen('lobby');
      return;
    }
    const seats = duel.seats || [0,1];
    seats.forEach((seat,localSide) => {
      setup.teams[seat] = { name:`${duelTeamName(localSide)} XI`, color:setup.selectedColors[seat]||TEAM_COLORS[seat%TEAM_COLORS.length].value, lineup:duel.picks[localSide].map((p,i)=>({ ...p, slot:p.slot || SLOTS[i] })) };
      duel.picks[localSide].forEach(player=>localDuelUsedIds.add(player.id));
    });
    if (localDuelPairs && localDuelPairIndex + 1 < localDuelPairs.length) {
      localDuelPairIndex += 1;
      const nextSeats = localDuelPairs[localDuelPairIndex];
      duel = { phase:'coin', requestedBy:nextSeats[0], winner:null, turn:0, seats:nextSeats, criteriaIndex:0, selections:{}, picks:[[],[]], candidates:[], shownIds:[], globalUsedIds:[...localDuelUsedIds], coinDeadline:Date.now()+10000 };
      showEventOverlay('İKİNCİ DÜELLO', `${nextSeats[0]+1}. ve ${nextSeats[1]+1}. oyuncular transfer masasına geliyor.`, 'navy', '4 KİŞİLİK KUPA', 3600, renderDuel);
      return;
    }
    localDuelPairs = null;
    localDuelPairIndex = 0;
    if (setup.competition === 'fourCup') initializeLocalTournament();
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
          online.matchSide = Number.isInteger(response.localSide) ? response.localSide : response.side;
          online.fixtureId = response.fixtureId || null;
          online.tournament = response.tournament || null;
          online.lobby = response.lobby;
          renderOnlineLobby();
          if (response.match) { online.matchSide=Number.isInteger(response.localSide)?response.localSide:response.side; online.fixtureId=response.fixtureId||null; online.tournament=response.tournament||online.tournament; receiveRemoteMatch(response.match, Date.now()); }
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
        const requesterLocal = duelLocalSideForSeat(duel.requestedBy);
        els.duelRequestText.textContent = incoming ? `${duelTeamName(requesterLocal)} Transfer Düellosu önerdi.` : 'Rakibin cevabı bekleniyor.';
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

    socket.on('room:legComplete', payload => {
      const scores = Array.isArray(payload?.firstLegScores) ? payload.firstLegScores : [0, 0];
      const teams = Array.isArray(payload?.firstTeams) ? payload.firstTeams : ['İç saha', 'Deplasman'];
      showEventOverlay('İLK AYAK TAMAMLANDI', `${teams[0]} ${scores[0]}–${scores[1]} ${teams[1]}. Sahalar değişiyor; ikinci ayak birazdan başlayacak.`, 'navy', 'TOPLAM SKOR KORUNACAK', 6800);
      els.rematchButton?.classList.add('hidden');
      if (els.newGameButton) { els.newGameButton.textContent = '2. AYAK HAZIRLANIYOR…'; els.newGameButton.disabled = true; }
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

    socket.on('tournament:update', payload => {
      online.tournament = payload?.tournament || null;
      renderOnlineTournament();
    });

    socket.on('tournament:complete', payload => {
      online.tournament = payload?.tournament || online.tournament;
      renderOnlineTournamentResults(payload?.players || online.lobby?.players || []);
    });

    socket.on('match:start', payload => {
      online.matchSide = Number.isInteger(payload?.localSide) ? payload.localSide : online.side;
      online.fixtureId = payload?.fixtureId || null;
      online.tournament = payload?.tournament || online.tournament;
      remoteFinishedRendered = false;
      if (els.newGameButton) els.newGameButton.disabled = false;
      lastRemoteOverlayId = null;
      receiveRemoteMatch(payload.match, payload.serverNow);
      showScreen('match');
      if (!remoteLoopRunning) startMatchLoop();
    });

    socket.on('match:state', payload => { if(Number.isInteger(payload?.localSide)) online.matchSide=payload.localSide; if(payload?.fixtureId) online.fixtureId=payload.fixtureId; if(payload?.tournament) online.tournament=payload.tournament; receiveRemoteMatch(payload.match, payload.serverNow); });
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
    const maxPlayers = Number(lobby.maxPlayers || (lobby.roomType === 'four' ? 4 : 2));
    [els.lobbyPlayer0,els.lobbyPlayer1,els.lobbyPlayer2,els.lobbyPlayer3].forEach((element,index)=>{ if(!element)return; element.classList.toggle('hidden',index>=maxPlayers); if(index<maxPlayers)renderLobbyPlayer(element,lobby.players[index],`${index+1}. KOLTUK`); });
    els.lobbyPlayersGrid?.classList.toggle('four-player-lobby',maxPlayers===4);
    const settings = lobby.settings || {};
    els.lobbySettingsSummary.innerHTML = [
      lobby.roomType === 'four' ? '4 KİŞİLİK KUPA' : lobby.roomType === 'twoLeg' ? 'ÇİFT AYAK' : 'TEK MAÇ',
      `${settings.durationMinutes || 5} DK`,
      settings.cards ? 'KART AÇIK' : 'KART KAPALI',
      settings.extraTime ? 'UZATMA AÇIK' : 'UZATMA KAPALI',
      settings.shootout ? 'PENALTILAR AÇIK' : 'PENALTILAR KAPALI'
    ].map(item => `<span>${item}</span>`).join('');

    const bothReady = Boolean(lobby.canStart);
    const required = Number(lobby.maxPlayers || 2);
    const presentCount = (lobby.players||[]).filter(player=>player?.present).length;
    const guestPresent = presentCount >= Math.min(2,required);
    if (lobby.phase === 'brief') {
      els.lobbyMessage.textContent = 'Kural ekranı açık. Hazır olan oyuncu onay verdikten sonra diğer tarafa 30 saniye tanınır.';
    } else if (!guestPresent) {
      els.lobbyMessage.textContent = required===4 ? `Katılımcılar bekleniyor: ${presentCount}/4 bağlı.` : 'Arkadaşının kodla odaya katılması bekleniyor.';
    } else if (!bothReady) {
      els.lobbyMessage.textContent = required===4 ? 'Oda yöneticisi turnuva formatını ve kadro yöntemini belirlemeli.' : 'İki oyuncunun da kadrosu hazır olmalı.';
    } else {
      els.lobbyMessage.textContent = online.side === 0 ? 'Her şey hazır. Kural brifingini iki oyuncu için açabilirsin.' : 'Her şey hazır. İç saha oyuncusunun kural brifingini açması bekleniyor.';
    }
    if(els.lobbyBuildSquadButton){
      const four=lobby.roomType==='four';
      const canConfigureFour=four&&online.side===0&&presentCount===4&&lobby.phase==='lobby';
      els.lobbyBuildSquadButton.classList.toggle('hidden', four ? !canConfigureFour : lobby.phase!=='lobby');
      els.lobbyBuildSquadButton.textContent = four ? (lobby.tournamentOptions ? 'TURNUVA KADROLARINI YENİLE' : 'TURNUVAYI VE KADROLARI KUR') : (online.side !== null && lobby.players?.[online.side]?.ready ? 'KADROYU DÜZENLE' : 'KADROYA GEÇ');
    }
    els.startOnlineMatchButton.textContent = lobby.roomType === 'four' ? 'KUPA BRİFİNGİNİ AÇ →' : 'KURALLARA GEÇ →';
    els.startOnlineMatchButton.classList.toggle('hidden', online.side !== 0 || lobby.phase === 'brief');
    els.editOnlineSettingsButton.classList.toggle('hidden', online.side !== 0 || lobby.phase !== 'lobby' || lobby.roomType==='four');
    els.startOnlineMatchButton.disabled = !bothReady || lobby.phase !== 'lobby';
    els.networkBadge.classList.toggle('hidden', !online.code);
    if (lobby.phase === 'brief') renderOnlineReadyState();
  }

  function resetOnlineState() {
    online.code = null;
    online.side = null;
    online.matchSide = null;
    online.fixtureId = null;
    online.tournament = null;
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
      socket.emit('room:create', { name, token: online.token, roomType: setup.roomType }, response => {
        online.joining = false;
        els.createRoomButton.disabled = false;
        if (!response?.ok) return setOnlineStatus(response?.error || 'Oda oluşturulamadı.', 'error');
        online.code = response.code;
        online.side = response.side;
        online.matchSide = Number.isInteger(response.localSide) ? response.localSide : response.side;
        online.fixtureId = response.fixtureId || null;
        online.tournament = response.tournament || null;
        online.name = name;
        online.lobby = response.lobby;
        online.roomType = response.lobby?.roomType || setup.roomType;
        setup.competition = online.roomType === 'twoLeg' ? 'twoLeg' : online.roomType === 'four' ? 'fourCup' : 'single';
        setup.mode = 'friend';
        setup.side = response.side;
        setup.teams = online.roomType === 'four' ? [null,null,null,null] : [null,null];
        setup.manualSelected.clear();
        renderOnlineLobby(); renderSetupState(); playAudioCue('online.roomCreated');
        setOnlineStatus(`Oda ${response.code} oluşturuldu. Kodu paylaş, sonra kadroya geç.`, 'success');
        showScreen('lobby');
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
        online.matchSide = Number.isInteger(response.localSide) ? response.localSide : response.side;
        online.fixtureId = response.fixtureId || null;
        online.tournament = response.tournament || null;
        online.name = name;
        online.lobby = response.lobby;
        online.roomType = response.lobby?.roomType || 'single';
        setup.competition = online.roomType === 'twoLeg' ? 'twoLeg' : online.roomType === 'four' ? 'fourCup' : 'single';
        setup.mode = 'friend';
        setup.side = response.side;
        setup.teams = online.roomType === 'four' ? [null,null,null,null] : [null,null];
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
          renderOnlineLobby(); renderSetupState();
          setOnlineStatus(`Oda ${response.code} bağlantısı kuruldu. Önce odadaki oyuncuları gör, sonra kadroya geç.`, 'success');
          showScreen('lobby');
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

  function configureOnlineTournament() {
    if (!online.socket || online.side !== 0 || online.lobby?.roomType !== 'four') return;
    const payload = {
      durationMinutes: setup.tournamentOptions.durationMinutes,
      legs: setup.tournamentOptions.legs,
      squadMethod: setup.tournamentOptions.squadMethod,
      settings: { ...settingsFromUi(), durationMinutes: setup.tournamentOptions.durationMinutes, competition: 'fourCup' }
    };
    els.confirmTournamentButton.disabled = true;
    online.socket.emit('room:configureTournament', payload, response => {
      els.confirmTournamentButton.disabled = false;
      if (!response?.ok) return showEventOverlay('TURNUVA KURULAMADI', response?.error || 'Tekrar dene.', 'red', '', 3600);
      online.lobby = response.lobby;
      if (response.duel) { duel = normalizeRemoteDuel(response.duel); showScreen('duel'); renderDuel(); }
      else { renderOnlineLobby(); showScreen('lobby'); showEventOverlay('KADROLAR HAZIR', 'Dört takım için benzersiz rastgele kadrolar kuruldu.', 'navy', '4 KİŞİLİK KUPA', 3600); }
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
    els.settingsButton?.addEventListener('click', () => { syncGlobalSettingsUi(); showScreen('app-settings'); });
    els.openAppSettingsButton?.addEventListener('click', () => { syncGlobalSettingsUi(); showScreen('app-settings'); });
    els.saveGlobalSettingsButton?.addEventListener('click', saveGlobalSettings);
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
      const mode = button.dataset.mode; setup.mode = mode; setup.side=0; setup.manualSelected.clear(); els.shootoutToggle.checked=true;
      if (mode === 'friend') { setOnlineStatus('Önce oda türünü seç; kod oda kurulur kurulmaz görünür.'); showScreen('online'); return; }
      setup.teams=[null,null]; updateCompetitionScreen(); showScreen('competition');
    }));
    els.competitionCards.forEach(card=>card.addEventListener('click',()=>selectCompetition(card.dataset.competition)));
    els.roomTypeOptions.forEach(option=>option.addEventListener('click',()=>{ setup.roomType=option.dataset.roomType; online.roomType=setup.roomType; els.roomTypeOptions.forEach(x=>x.classList.toggle('active',x===option)); }));

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
    els.lobbyBuildSquadButton?.addEventListener('click',()=>{ if(online.lobby?.roomType==='four'){ if(online.side!==0)return; setup.competition='fourCup'; els.fourSquadMethod.classList.remove('hidden'); els.tournamentKindSummary.innerHTML='<b>4 KİŞİLİK ÇEVRİMİÇİ KUPA</b><small>Dört oyuncu · iki eşzamanlı maç · final ve üçüncülük.</small>'; showScreen('tournament-config'); return;} setup.side=online.side||0; renderSetupState(); showScreen('squad'); });
    els.editOnlineSettingsButton.addEventListener('click', () => showScreen('settings'));
    els.startOnlineMatchButton.addEventListener('click', startOnlineMatch);

    els.builderTabs.forEach(tab => tab.addEventListener('click', () => switchBuilder(tab.dataset.builder)));
    els.duelStartButton?.addEventListener('click', () => {
      if (setup.mode === 'ai') { startLocalDuel(); return; }
      if (setup.mode === 'coop') {
        openDialog('ORTAK KADRO ÖNERİSİ', 'TRANSFER DÜELLOSU', 'Telefonu diğer oyuncuya ver. Kriterleri ve futbolcuları sırayla kronometreyle seçerek benzersiz kadrolar kurmayı kabul ediyor musunuz?', 'KABUL ET', startLocalDuel, { text:'REDDET', action:() => { switchBuilder('random'); showEventOverlay('DÜELLO REDDEDİLDİ', 'Klasik kadro seçeneklerine dönüldü.', 'navy', '', 2600); } }); return;
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
    els.duelStopButton?.addEventListener('click', stopDuelCandidate);
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

    els.teamColorPalette?.addEventListener('click',event=>{const button=event.target.closest('[data-team-color]');if(!button||button.disabled)return;setup.selectedColors[setup.side]=button.dataset.teamColor;if(setup.teams[setup.side])setup.teams[setup.side].color=button.dataset.teamColor;renderSetupState();});

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
      if (setup.mode === 'coop' && setup.competition === 'fourCup' && setup.side < 3) {
        setup.side += 1; setup.manualSelected.clear(); els.manualSearch.value=''; renderManualList(); renderSetupState();
      } else if (setup.mode === 'coop' && setup.side === 0) {
        setup.side = 1; setup.manualSelected.clear(); els.manualSearch.value = ''; renderManualList(); renderSetupState();
      } else if (setup.mode === 'friend') {
        submitOnlineTeam();
      } else if (['classicUcl','worldCup','fourCup'].includes(setup.competition)) {
        initializeLocalTournament();
      } else {
        showScreen('settings');
      }
    });

    els.durationRange.addEventListener('input', () => { els.durationValue.textContent = `${els.durationRange.value} dk`; });
    els.tournamentDurationRange?.addEventListener('input',()=>{setup.tournamentOptions.durationMinutes=Number(els.tournamentDurationRange.value);els.tournamentDurationValue.textContent=`${els.tournamentDurationRange.value} dk`;});
    els.tournamentLegOptions.forEach(btn=>btn.addEventListener('click',()=>{setup.tournamentOptions.legs=Number(btn.dataset.legs);els.tournamentLegOptions.forEach(x=>x.classList.toggle('active',x===btn));}));
    els.tournamentSquadOptions.forEach(btn=>btn.addEventListener('click',()=>{setup.tournamentOptions.squadMethod=btn.dataset.squadMethod;els.tournamentSquadOptions.forEach(x=>x.classList.toggle('active',x===btn));}));
    els.confirmTournamentButton?.addEventListener('click',()=>{ if(setup.mode==='friend'&&online.lobby?.roomType==='four'){ configureOnlineTournament(); return; } if(setup.competition==='fourCup'){setup.teams=[null,null,null,null];setup.selectedColors=TEAM_COLORS.slice(0,4).map(x=>x.value);}else setup.teams=[null,null];setup.side=0;renderSetupState();showScreen('squad');});
    els.tournamentNextButton?.addEventListener('click',openNextTournamentMatch);
    els.tournamentHomeButton?.addEventListener('click',()=>{localTournament=null;resetSetup(true);showScreen('home');});
    els.finishTournamentButton?.addEventListener('click',()=>{localTournament=null;resetSetup(true);showScreen('home');});

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
      if(localTournament){ match=null; if(localTournament.stage==='finished')renderTournamentResults();else{renderTournamentBracket();showScreen('tournament');} return; }
      if (match?.mode === 'friend') {
        if (online.roomType === 'four' && online.tournament) { renderOnlineTournament(); showScreen(online.tournament.stage === 'finished' ? 'tournament-results' : 'tournament'); return; }
        leaveOnlineRoom(); return;
      }
      match = null; resetSetup(true); showScreen('mode');
    });
  }

  async function init() {
    UIShell?.install?.();
    initializeTheme();
    initializeNavigationGuard();
    initializeOnlineToken();
    initializeSettings();
    syncGlobalSettingsUi();
    Audio?.configure?.(currentAudioSettings());
    Audio?.setAmbience('ambience.menu');
    Audio?.tryAutoplay?.().catch(() => false);
    try {
      PLAYERS = await window.PlayerStore.load();
      initializeFilters();
      renderManualList();
      renderSetupState();
      bindEvents();
      if (localStorage.getItem(SAVE_KEY)) els.continueButton.classList.remove('hidden');
    } catch (error) {
      console.error(error);
      els.appToast.textContent = 'Oyuncu verisi yüklenemedi. Sayfayı yenile.';
      els.appToast.classList.remove('hidden');
      return;
    }
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }

  init();
})();
