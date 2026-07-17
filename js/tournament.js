(function (root) {
  'use strict';

  /*
   * 90+ Turnuva Motoru (tek oyunculu, AI'ya karşı)
   *  - cup      : Eski UCL usulü — 8 takım, çeyrek/yarı final çift maçlı, final tek maç.
   *  - worldcup : Dünya Kupası usulü — 2 grup x 4 takım, yarı final, üçüncülük, final.
   * Kullanıcının maçları gerçek oynanır; diğer maçlar simüle edilir.
   */

  const STORAGE_KEY = '90-plus-tournament-v1';
  const AI_NAMES = [
    'Retro Krallar', 'Beton Duvar', 'Altın Kramponlar', 'Fırtına XI', 'Gece Ekspresi',
    'Kadife Dokunuş', 'Demir Yumruk', 'Rüzgar Gülü', 'Şimşek Çakımı', 'Eski Toprak',
    'Kuzey Yıldızı', 'Volkan Ateşi', 'Gümüş Ok', 'Son Dakika', 'Taç Çizgisi'
  ];

  let deps = null;
  let state = null;

  const $ = selector => document.querySelector(selector);
  const shuffle = items => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };
  const randomItem = items => items[Math.floor(Math.random() * items.length)];
  const avgRating = team => Math.round(team.lineup.reduce((sum, p) => sum + (Number(p.rating) || 70), 0) / team.lineup.length);

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  function clear() {
    state = null;
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) state = JSON.parse(raw);
    } catch (_) { state = null; }
    return state;
  }

  function hasActive() {
    if (!state) load();
    return Boolean(state && !state.finished);
  }

  // --- Takım üretimi ---------------------------------------------------
  function makeAiTeams(count, userColor) {
    const names = shuffle(AI_NAMES).slice(0, count);
    const colors = shuffle(deps.teamColors.map(c => c.value).filter(v => v !== userColor));
    return names.map((name, index) => ({
      id: `ai-${index}`,
      name,
      color: colors[index % colors.length],
      isUser: false,
      lineup: deps.buildRandomLineup().map(p => ({ ...p }))
    }));
  }

  // --- Simülasyon -------------------------------------------------------
  function simulatedGoals(myAvg, otherAvg) {
    const expected = Math.max(0.25, 1.35 + (myAvg - otherAvg) / 18);
    let goals = 0;
    for (let i = 0; i < 5; i += 1) if (Math.random() < expected / 5) goals += 1;
    return goals;
  }

  function creditGoals(team, goals) {
    const outfield = team.lineup.filter(p => p.slot !== 'GK');
    for (let i = 0; i < goals; i += 1) {
      const scorer = randomItem(outfield);
      addStat(team, scorer, 'goals');
      if (Math.random() < 0.72) {
        const others = outfield.filter(p => p.id !== scorer.id);
        if (others.length) addStat(team, randomItem(others), 'assists');
      }
    }
  }

  function addStat(team, player, key) {
    state.stats[player.id] = state.stats[player.id] || { id: player.id, name: player.name, team: team.name, goals: 0, assists: 0 };
    state.stats[player.id].team = team.name;
    state.stats[player.id][key] += 1;
  }

  function simulateMatch(teamA, teamB, allowDraw) {
    const a = simulatedGoals(avgRating(teamA), avgRating(teamB));
    const b = simulatedGoals(avgRating(teamB), avgRating(teamA));
    const result = { scores: [a, b], pens: null };
    if (!allowDraw && a === b) {
      const extraA = Math.random() < 0.35 ? 1 : 0;
      const extraB = Math.random() < 0.35 ? 1 : 0;
      result.scores = [a + extraA, b + extraB];
      if (result.scores[0] === result.scores[1]) {
        const penA = 3 + Math.floor(Math.random() * 3);
        let penB = 3 + Math.floor(Math.random() * 3);
        if (penB === penA) penB = penA + (Math.random() < 0.5 ? 1 : -1);
        result.pens = [penA, Math.max(0, penB)];
      }
    }
    creditGoals(teamA, result.scores[0]);
    creditGoals(teamB, result.scores[1]);
    return result;
  }

  function matchWinnerIndex(result) {
    if (result.scores[0] !== result.scores[1]) return result.scores[0] > result.scores[1] ? 0 : 1;
    if (result.pens) return result.pens[0] > result.pens[1] ? 0 : 1;
    return null;
  }

  // --- Kuruluş ----------------------------------------------------------
  function start(type, userTeam, settings) {
    const user = { id: 'user', name: userTeam.name, color: userTeam.color || '#d44735', isUser: true, lineup: userTeam.lineup.map(p => ({ ...p })) };
    const ai = makeAiTeams(7, user.color);
    const teams = shuffle([user, ...ai]);
    state = {
      type,
      createdAt: Date.now(),
      settings: { ...settings },
      teams,
      stats: {},
      finished: false,
      podium: null,
      history: []
    };
    if (type === 'worldcup') {
      const userIndex = teams.findIndex(t => t.isUser);
      const rest = teams.filter((_, i) => i !== userIndex);
      state.groups = {
        A: [teams[userIndex], rest[0], rest[1], rest[2]].map(t => t.id),
        B: [rest[3], rest[4], rest[5], rest[6]].map(t => t.id)
      };
      state.table = {};
      teams.forEach(t => { state.table[t.id] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }; });
      state.stage = 'groups';
      state.round = 1; // 1..3
    } else {
      state.stage = 'qf';
      state.ties = buildTies(teams.map(t => t.id), 'qf');
    }
    save();
    return state;
  }

  function buildTies(ids, stage) {
    const pairs = [];
    for (let i = 0; i < ids.length; i += 2) {
      pairs.push({ id: `${stage}-${i / 2}`, stage, home: ids[i], away: ids[i + 1], leg1: null, leg2: null, pens: null, winner: null });
    }
    return pairs;
  }

  function team(id) { return state.teams.find(t => t.id === id); }
  function userTie() { return (state.ties || []).find(t => !t.winner && (t.home === 'user' || t.away === 'user')); }

  // --- Sıradaki kullanıcı maçı -------------------------------------------
  // Dönüş: { opponent, series, label } veya null (kullanıcı elendi / maç yok)
  function nextUserFixture() {
    if (!state || state.finished) return null;
    if (state.type === 'worldcup') {
      if (state.stage === 'groups') {
        const fixtures = groupFixtures('A', state.round).concat(groupFixtures('B', state.round));
        const mine = fixtures.find(f => f.includes('user'));
        if (!mine || state.playedRounds?.includes(state.round)) return null;
        const oppId = mine[0] === 'user' ? mine[1] : mine[0];
        return { kind: 'group', round: state.round, opponent: team(oppId), series: null, label: `GRUP A · ${state.round}. MAÇ` };
      }
      if (['sf', 'third', 'final'].includes(state.stage)) {
        const fixture = state.knockout?.[state.stage]?.find(f => !f.result && (f.home === 'user' || f.away === 'user'));
        if (!fixture) return null;
        const oppId = fixture.home === 'user' ? fixture.away : fixture.home;
        const labels = { sf: 'YARI FİNAL', third: 'ÜÇÜNCÜLÜK MAÇI', final: 'FİNAL' };
        return { kind: state.stage, fixture, opponent: team(oppId), series: null, label: labels[state.stage] };
      }
      return null;
    }
    // cup
    const tie = userTie();
    if (!tie) return null;
    if (state.stage === 'final') {
      return { kind: 'final', tie, opponent: team(tie.home === 'user' ? tie.away : tie.home), series: null, label: 'FİNAL · TEK MAÇ' };
    }
    const leg = tie.leg1 ? 2 : 1;
    const oppId = tie.home === 'user' ? tie.away : tie.home;
    let series = null;
    if (leg === 2) {
      // Kullanıcı her zaman 0. tarafta oynar; ilk ayak skoru kullanıcı bakışıyla saklanır.
      series = { type: 'twoLeg', leg: 2, firstLegScores: [...tie.userLeg1], aggregateBase: [...tie.userLeg1] };
    }
    const stageLabel = state.stage === 'qf' ? 'ÇEYREK FİNAL' : 'YARI FİNAL';
    return { kind: 'tie', tie, leg, opponent: team(oppId), series, label: `${stageLabel} · ${leg}. AYAK` };
  }

  function groupFixtures(groupKey, round) {
    const [a, b, c, d] = state.groups[groupKey];
    const rounds = { 1: [[a, b], [c, d]], 2: [[a, c], [b, d]], 3: [[a, d], [b, c]] };
    return rounds[round] || [];
  }

  // --- Sonuç kaydı --------------------------------------------------------
  // userScores: [kullanıcı, rakip]; penWinner: 0|1|null (kullanıcı bakışı)
  function recordUserMatch(userScores, penWinner) {
    if (!state || state.finished) return;
    if (state.type === 'worldcup') return recordWorldcupUserMatch(userScores, penWinner);
    return recordCupUserMatch(userScores, penWinner);
  }

  function recordCupUserMatch(userScores, penWinner) {
    const tie = userTie();
    if (!tie) return;
    const opponent = team(tie.home === 'user' ? tie.away : tie.home);
    creditRealGoals(userScores, opponent);
    if (state.stage === 'final') {
      tie.leg1 = [...userScores];
      tie.userLeg1 = [...userScores];
      tie.winner = (penWinner !== null && penWinner !== undefined)
        ? (penWinner === 0 ? 'user' : opponent.id)
        : (userScores[0] > userScores[1] ? 'user' : userScores[0] < userScores[1] ? opponent.id : 'user');
      finishCup(tie);
      save();
      return;
    }
    if (!tie.leg1) {
      tie.leg1 = [...userScores];
      tie.userLeg1 = [...userScores];
      simulateCupLeg(1);
    } else {
      tie.leg2 = [...userScores];
      const aggregateUser = tie.userLeg1[0] + userScores[0];
      const aggregateOpp = tie.userLeg1[1] + userScores[1];
      tie.winner = aggregateUser > aggregateOpp ? 'user'
        : aggregateUser < aggregateOpp ? opponent.id
        : (penWinner === 0 ? 'user' : opponent.id);
      simulateCupLeg(2);
      advanceCupStage();
    }
    save();
  }

  function simulateCupLeg(leg) {
    state.ties.forEach(tie => {
      if (tie.home === 'user' || tie.away === 'user') return;
      if (leg === 1 && !tie.leg1) {
        tie.leg1 = simulateMatch(team(tie.home), team(tie.away), true).scores;
      } else if (leg === 2 && tie.leg1 && !tie.leg2) {
        const back = simulateMatch(team(tie.away), team(tie.home), true);
        tie.leg2 = [back.scores[1], back.scores[0]]; // ev sahibi bakışına çevir
        const aggHome = tie.leg1[0] + tie.leg2[0];
        const aggAway = tie.leg1[1] + tie.leg2[1];
        tie.winner = aggHome > aggAway ? tie.home : aggAway > aggHome ? tie.away : (Math.random() < 0.5 ? tie.home : tie.away);
      }
    });
  }

  function advanceCupStage() {
    if (state.ties.some(t => !t.winner)) return;
    const winners = state.ties.map(t => t.winner);
    state.history.push({ stage: state.stage, ties: state.ties });
    if (state.stage === 'qf') {
      state.stage = 'sf';
      state.ties = buildTies(shuffle(winners), 'sf');
      ensureUserPlaysLegOneFirst();
    } else if (state.stage === 'sf') {
      state.stage = 'final';
      state.ties = buildTies(winners, 'final');
      if (!winners.includes('user')) simulateRestOfCup();
    }
  }

  function ensureUserPlaysLegOneFirst() {
    if (!state.ties.some(t => t.home === 'user' || t.away === 'user')) simulateRestOfCup();
  }

  function simulateRestOfCup() {
    // Kullanıcı elendi: kalan turları simüle et ve turnuvayı bitir.
    while (!state.finished) {
      state.ties.forEach(tie => {
        if (tie.winner) return;
        if (state.stage === 'final') {
          const result = simulateMatch(team(tie.home), team(tie.away), false);
          tie.leg1 = result.scores; tie.pens = result.pens;
          tie.winner = matchWinnerIndex(result) === 0 ? tie.home : tie.away;
        } else {
          simulateCupLeg(1); simulateCupLeg(2);
          if (!tie.winner) tie.winner = Math.random() < 0.5 ? tie.home : tie.away;
        }
      });
      if (state.stage === 'final') { finishCup(state.ties[0]); break; }
      advanceCupStage();
    }
  }

  function finishCup(finalTie) {
    const champion = finalTie.winner;
    const runnerUp = finalTie.home === champion ? finalTie.away : finalTie.home;
    const sfHistory = state.history.find(h => h.stage === 'sf');
    const sfLosers = (sfHistory ? sfHistory.ties : []).map(t => (t.winner === t.home ? t.away : t.home));
    state.finished = true;
    state.podium = { champion, runnerUp, third: sfLosers[0] || null };
    state.stage = 'done';
  }

  // --- Dünya Kupası -------------------------------------------------------
  function applyTableResult(homeId, awayId, scores) {
    const home = state.table[homeId], away = state.table[awayId];
    home.p += 1; away.p += 1;
    home.gf += scores[0]; home.ga += scores[1];
    away.gf += scores[1]; away.ga += scores[0];
    if (scores[0] > scores[1]) { home.w += 1; home.pts += 3; away.l += 1; }
    else if (scores[0] < scores[1]) { away.w += 1; away.pts += 3; home.l += 1; }
    else { home.d += 1; away.d += 1; home.pts += 1; away.pts += 1; }
  }

  function recordWorldcupUserMatch(userScores, penWinner) {
    if (state.stage === 'groups') {
      state.playedRounds = state.playedRounds || [];
      const fixtures = { A: groupFixtures('A', state.round), B: groupFixtures('B', state.round) };
      ['A', 'B'].forEach(groupKey => {
        fixtures[groupKey].forEach(([homeId, awayId]) => {
          if (homeId === 'user' || awayId === 'user') {
            const scores = homeId === 'user' ? userScores : [userScores[1], userScores[0]];
            const opponent = team(homeId === 'user' ? awayId : homeId);
            creditRealGoals(userScores, opponent);
            applyTableResult(homeId, awayId, scores);
          } else {
            const result = simulateMatch(team(homeId), team(awayId), true);
            applyTableResult(homeId, awayId, result.scores);
          }
        });
      });
      state.playedRounds.push(state.round);
      if (state.round >= 3) beginWorldcupKnockout();
      else state.round += 1;
      save();
      return;
    }
    // Eleme aşaması: kullanıcının maçı
    const fixture = state.knockout[state.stage].find(f => !f.result && (f.home === 'user' || f.away === 'user'));
    if (!fixture) return;
    const opponent = team(fixture.home === 'user' ? fixture.away : fixture.home);
    creditRealGoals(userScores, opponent);
    const scores = fixture.home === 'user' ? userScores : [userScores[1], userScores[0]];
    const winnerSide = (penWinner !== null && penWinner !== undefined)
      ? (fixture.home === 'user' ? penWinner : 1 - penWinner)
      : (scores[0] > scores[1] ? 0 : scores[0] < scores[1] ? 1 : (Math.random() < .5 ? 0 : 1));
    fixture.result = { scores, pens: null };
    fixture.winner = winnerSide === 0 ? fixture.home : fixture.away;
    advanceWorldcup();
    save();
  }

  function groupStandings(groupKey) {
    return [...state.groups[groupKey]]
      .sort((a, b) => state.table[b].pts - state.table[a].pts
        || (state.table[b].gf - state.table[b].ga) - (state.table[a].gf - state.table[a].ga)
        || state.table[b].gf - state.table[a].gf);
  }

  function beginWorldcupKnockout() {
    const a = groupStandings('A');
    const b = groupStandings('B');
    state.stage = 'sf';
    state.knockout = {
      sf: [
        { id: 'sf-0', home: a[0], away: b[1], result: null, winner: null },
        { id: 'sf-1', home: b[0], away: a[1], result: null, winner: null }
      ],
      third: [], final: []
    };
    simulateAiKnockout('sf');
    if (!state.knockout.sf.some(f => !f.result && (f.home === 'user' || f.away === 'user')) &&
        state.knockout.sf.every(f => f.result)) advanceWorldcup();
  }

  function simulateAiKnockout(stage) {
    state.knockout[stage].forEach(fixture => {
      if (fixture.result || fixture.home === 'user' || fixture.away === 'user') return;
      const result = simulateMatch(team(fixture.home), team(fixture.away), false);
      fixture.result = result;
      fixture.winner = matchWinnerIndex(result) === 0 ? fixture.home : fixture.away;
    });
  }

  function advanceWorldcup() {
    const ko = state.knockout;
    if (state.stage === 'sf' && ko.sf.every(f => f.result)) {
      const winners = ko.sf.map(f => f.winner);
      const losers = ko.sf.map(f => (f.winner === f.home ? f.away : f.home));
      ko.third = [{ id: 'third', home: losers[0], away: losers[1], result: null, winner: null }];
      ko.final = [{ id: 'final', home: winners[0], away: winners[1], result: null, winner: null }];
      state.stage = losers.includes('user') ? 'third' : 'final';
      // Kullanıcının olmadığı maçı hemen simüle et
      simulateAiKnockout('third');
      simulateAiKnockout('final');
      maybeFinishWorldcup();
      return;
    }
    if (state.stage === 'third' && ko.third[0]?.result) {
      state.stage = 'final';
      simulateAiKnockout('final');
      maybeFinishWorldcup();
      return;
    }
    if (state.stage === 'final' && ko.final[0]?.result) {
      simulateAiKnockout('third');
      maybeFinishWorldcup();
    }
  }

  function maybeFinishWorldcup() {
    const ko = state.knockout;
    if (!ko.final[0]?.result || !ko.third[0]?.result) return;
    const final = ko.final[0], third = ko.third[0];
    state.finished = true;
    state.stage = 'done';
    state.podium = {
      champion: final.winner,
      runnerUp: final.winner === final.home ? final.away : final.home,
      third: third.winner
    };
  }

  function creditRealGoals(userScores, opponent) {
    // Gerçek maçın gol detayları app tarafından ayrı bildirilir; burada yalnız simülasyon payı yok.
    void userScores; void opponent;
  }

  function recordRealGoal(sideTeamName, player, assistPlayer) {
    if (!state) return;
    const teamObj = state.teams.find(t => t.name === sideTeamName);
    if (!teamObj || !player) return;
    addStat(teamObj, player, 'goals');
    if (assistPlayer) addStat(teamObj, assistPlayer, 'assists');
  }

  // --- Görselleştirme -------------------------------------------------------
  function scoreText(scores, pens) {
    if (!scores) return '—';
    return `${scores[0]}–${scores[1]}${pens ? ` (P ${pens[0]}–${pens[1]})` : ''}`;
  }

  function teamChip(id, extra = '') {
    const t = team(id);
    if (!t) return '<span class="tt-chip">—</span>';
    return `<span class="tt-chip${t.isUser ? ' user' : ''} ${extra}" style="--chip:${t.color}"><i></i>${deps.escapeHtml(t.name)}</span>`;
  }

  function renderCup(container) {
    const stageLabels = { qf: 'ÇEYREK FİNAL', sf: 'YARI FİNAL', final: 'FİNAL', done: 'TURNUVA TAMAMLANDI' };
    const rows = (state.history.map(h => h.ties).flat().concat(state.stage !== 'done' ? state.ties : (state.history.some(h => h.stage === 'final') ? [] : state.ties)))
      .filter((tie, index, all) => all.findIndex(x => x.id === tie.id) === index);
    container.innerHTML = `
      <p class="tt-stage">${stageLabels[state.stage] || ''}</p>
      <div class="tt-bracket">
        ${rows.map(tie => `
          <article class="tt-tie${tie.winner ? ' done' : ''}${(tie.home === 'user' || tie.away === 'user') ? ' mine' : ''}">
            <header>${tie.stage.toUpperCase()}</header>
            <div class="tt-tie-row">${teamChip(tie.home, tie.winner === tie.home ? 'winner' : '')}<b>${scoreText(tie.leg1, tie.pens)}</b></div>
            <div class="tt-tie-row">${teamChip(tie.away, tie.winner === tie.away ? 'winner' : '')}<b>${tie.stage === 'final' ? '' : scoreText(tie.leg2 ? [tie.leg2[1], tie.leg2[0]] : null)}</b></div>
            ${tie.stage !== 'final' && tie.leg1 ? `<footer>1. ayak ev sahibi bakışıyla · rövanş deplasman bakışıyla</footer>` : ''}
          </article>`).join('')}
      </div>`;
  }

  function renderWorldcup(container) {
    const stageLabels = { groups: `GRUP AŞAMASI · ${state.round}. TUR`, sf: 'YARI FİNAL', third: 'ÜÇÜNCÜLÜK MAÇI', final: 'FİNAL', done: 'TURNUVA TAMAMLANDI' };
    const groupTable = groupKey => `
      <div class="tt-group"><h4>GRUP ${groupKey}</h4><table class="tt-table"><thead><tr><th></th><th>O</th><th>G</th><th>B</th><th>M</th><th>AV</th><th>P</th></tr></thead><tbody>
        ${groupStandings(groupKey).map(id => { const r = state.table[id]; return `<tr class="${id === 'user' ? 'user' : ''}"><td>${teamChip(id)}</td><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gf - r.ga}</td><td><b>${r.pts}</b></td></tr>`; }).join('')}
      </tbody></table></div>`;
    let knockoutHtml = '';
    if (state.knockout) {
      const block = (title, fixtures) => fixtures?.length ? `
        <article class="tt-tie mine"><header>${title}</header>
          ${fixtures.map(f => `<div class="tt-tie-row">${teamChip(f.home, f.winner === f.home ? 'winner' : '')}<b>${scoreText(f.result?.scores, f.result?.pens)}</b>${teamChip(f.away, f.winner === f.away ? 'winner' : '')}</div>`).join('')}
        </article>` : '';
      knockoutHtml = `<div class="tt-bracket">${block('YARI FİNAL', state.knockout.sf)}${block('ÜÇÜNCÜLÜK', state.knockout.third)}${block('FİNAL', state.knockout.final)}</div>`;
    }
    container.innerHTML = `<p class="tt-stage">${stageLabels[state.stage] || ''}</p><div class="tt-groups">${groupTable('A')}${groupTable('B')}</div>${knockoutHtml}`;
  }

  function topStats(key, count = 5) {
    return Object.values(state.stats).filter(s => s[key] > 0).sort((a, b) => b[key] - a[key]).slice(0, count);
  }

  function renderStats(container) {
    const scorers = topStats('goals');
    const assists = topStats('assists');
    const list = (title, rows, key) => `
      <div class="tt-stat-block"><h4>${title}</h4>${rows.length ? rows.map((s, i) => `<div class="tt-stat-row"><span>${i + 1}. ${deps.escapeHtml(s.name)}</span><small>${deps.escapeHtml(s.team)}</small><b>${s[key]}</b></div>`).join('') : '<p class="tt-empty">Henüz veri yok.</p>'}</div>`;
    container.innerHTML = list('GOL KRALI', scorers, 'goals') + list('ASİST KRALI', assists, 'assists');
  }

  function renderPodium(container) {
    if (!state.podium) { container.innerHTML = ''; return; }
    const { champion, runnerUp, third } = state.podium;
    container.innerHTML = `
      <div class="tt-podium">
        <div class="tt-podium-slot second"><em>2</em>${teamChip(runnerUp)}</div>
        <div class="tt-podium-slot first"><em>🏆</em>${teamChip(champion)}<small>ŞAMPİYON</small></div>
        <div class="tt-podium-slot third"><em>3</em>${third ? teamChip(third) : '<span class="tt-chip">—</span>'}</div>
      </div>`;
  }

  function render() {
    if (!state) return;
    const title = $('#tournamentTitle');
    const body = $('#tournamentBody');
    const statsBox = $('#tournamentStats');
    const podium = $('#tournamentPodium');
    const action = $('#tournamentPlayButton');
    if (!body) return;
    if (title) title.textContent = state.type === 'cup' ? 'ŞAMPİYONLAR TURNUVASI' : 'DÜNYA KUPASI';
    if (state.type === 'cup') renderCup(body); else renderWorldcup(body);
    renderStats(statsBox);
    renderPodium(podium);
    const fixture = state.finished ? null : nextUserFixture();
    if (action) {
      if (state.finished) {
        action.textContent = 'TURNUVAYI KAPAT';
        action.dataset.action = 'close';
        action.classList.remove('hidden');
      } else if (fixture) {
        action.textContent = `MAÇA ÇIK — ${fixture.label}`;
        action.dataset.action = 'play';
        action.classList.remove('hidden');
      } else {
        // Kullanıcı elendi ama turnuva bitmedi (teoride kalmaz) — kapat
        action.textContent = 'TURNUVAYI KAPAT';
        action.dataset.action = 'close';
        action.classList.remove('hidden');
      }
    }
  }

  function init(nextDeps) { deps = nextDeps; }

  root.Tournament = {
    init, start, load, save, clear, hasActive, render,
    nextUserFixture, recordUserMatch, recordRealGoal,
    get state() { return state; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
