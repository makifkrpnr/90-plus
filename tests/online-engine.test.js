'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Engine = require('../server/online-engine.js');

function team(name, prefix) {
  const slots = ['GK', 'LB', 'CB', 'CB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST'];
  return {
    name,
    lineup: slots.map((slot, index) => ({
      id: `${prefix}-${index}`,
      name: `${name} ${index + 1}`,
      nationality: 'Türkiye',
      position: slot,
      slot,
      rating: 80,
      activeStart: 2000,
      activeEnd: 2026,
      leagues: ['Süper Lig']
    }))
  };
}

const settings = {
  durationMinutes: 1,
  cards: true,
  injury: false,
  extraTime: true,
  shootout: true,
  soundIntensity: 'medium'
};

function settle(match, now) {
  Engine.tickMatch(match, now + 5000);
}

function completeKickoff(match, homeDigit = 5, awayDigit = 7, now = 1000) {
  assert.equal(Engine.stopRoll(match, 0, homeDigit, now + 100).ok, true);
  settle(match, now + 100);
  assert.equal(match.context.type, 'kickoffRoll');
  assert.equal(match.context.owner, 1);
  assert.equal(Engine.stopRoll(match, 1, awayDigit, now + 5200).ok, true);
  settle(match, now + 5200);
  assert.equal(match.context.type, 'kickoffReady');
  const starter = awayDigit > homeDigit ? 1 : 0;
  assert.equal(match.context.owner, starter);
  assert.equal(Engine.stopRoll(match, starter, 0, now + 10300).ok, true);
  assert.equal(match.phase, 'regulation');
  assert.equal(match.context.type, 'playerSelect');
  assert.equal(match.context.owner, starter);
  return starter;
}

function selectPlayer(match, side, digit, now) {
  const selected = Engine.stopRoll(match, side, digit, now);
  assert.equal(selected.ok, true);
  settle(match, now);
  assert.equal(match.context.type, 'main');
}

test('online maç 10 saniyelik başlama hakkı atışıyla açılır', () => {
  const match = Engine.createMatch([team('A', 'a'), team('B', 'b')], settings, 1000);
  assert.equal(match.version, 4);
  assert.equal(match.phase, 'kickoff');
  assert.equal(match.context.type, 'kickoffRoll');
  assert.deepEqual(match.kickoff.rolls, [null, null]);
  assert.deepEqual(match.pauseBudgetsMs, [60000, 60000]);
});

test('yüksek rakam ilk yarıyı, diğer taraf ikinci yarıyı başlatır', () => {
  const match = Engine.createMatch([team('A', 'a'), team('B', 'b')], settings, 1000);
  const starter = completeKickoff(match, 5, 7, 1000);
  assert.equal(starter, 1);
  assert.equal(match.firstHalfStarter, 1);
  assert.equal(match.secondHalfStarter, 0);
});

test('başlama atışında eşitlik olursa iki taraf yeniden atar', () => {
  const match = Engine.createMatch([team('A', 'a'), team('B', 'b')], settings, 1000);
  Engine.stopRoll(match, 0, 4, 1100); settle(match, 1100);
  Engine.stopRoll(match, 1, 4, 6200); settle(match, 6200);
  assert.equal(match.context.type, 'kickoffRoll');
  assert.equal(match.context.owner, 0);
  assert.equal(match.kickoff.round, 2);
  assert.deepEqual(match.kickoff.rolls, [null, null]);
});

test('önce oyuncu seçilir, sonraki atış sıfırsa gol olur', () => {
  const match = Engine.createMatch([team('A', 'a'), team('B', 'b')], settings, 1000);
  const side = completeKickoff(match, 8, 3, 1000);
  selectPlayer(match, side, 3, 12000);
  const scorerId = match.activePlayerId[side];
  const result = Engine.stopRoll(match, side, 0, 18000);
  assert.equal(result.ok, true);
  assert.equal(match.scores[side], 1);
  assert.equal(match.transition.owner, side === 0 ? 1 : 0);
  assert.equal(match.teams[side].lineup.find(player => player.id === scorerId).goals, 1);
});

test('üçüncü korner kullanılmadan penaltıya dönüşür', () => {
  const match = Engine.createMatch([team('A', 'a'), team('B', 'b')], settings, 1000);
  const side = completeKickoff(match, 8, 3, 1000);
  selectPlayer(match, side, 2, 12000);
  match.teams[side].corners = 2;
  Engine.stopRoll(match, side, 6, 18000);
  assert.equal(match.teams[side].corners, 0);
  assert.equal(match.transition.context.type, 'shot');
  assert.equal(match.transition.context.reason, 'penalty');
});

test('başlama hakkı atışında 10 saniye dolarsa cezasız otomatik rakam gelir', () => {
  const match = Engine.createMatch([team('A', 'a'), team('B', 'b')], settings, 1000);
  match.turnElapsedMs = 9999;
  match.lastTickAt = 1000;
  Engine.tickMatch(match, 1010);
  assert.notEqual(match.kickoff.rolls[0], null);
  assert.equal(match.teams[0].timeouts, 0);
  assert.deepEqual(match.delayWasteMs, [0, 0]);
});

test('ilk devreyi kaybeden taraf ikinci devreyi kendi düğmesiyle başlatır', () => {
  const match = Engine.createMatch([team('A', 'a'), team('B', 'b')], settings, 1000);
  completeKickoff(match, 5, 7, 1000);
  match.periodElapsedMs = match.periodDurationsMs[0] - 1;
  match.lastTickAt = 15000;
  Engine.tickMatch(match, 15010);
  assert.equal(match.awaitingPeriodStart, true);
  assert.equal(match.periodIndex, 1);
  assert.equal(match.awaitingPeriodSide, 0);
  assert.equal(Engine.startWaitingPeriod(match, 1, 16000).ok, false);
  assert.equal(Engine.startWaitingPeriod(match, 0, 16000).ok, true);
});

test('her oyuncu yalnız kendi sırasında toplam 60 saniyelik mola bütçesini kullanır', () => {
  const match = Engine.createMatch([team('A', 'a'), team('B', 'b')], settings, 1000);
  const starter = completeKickoff(match, 8, 3, 1000);
  const other = starter === 0 ? 1 : 0;
  assert.equal(Engine.togglePause(match, other, 12000).ok, false);
  assert.equal(Engine.togglePause(match, starter, 12000).ok, true);
  assert.equal(match.pausedBy, starter);
  match.lastTickAt = 12000;
  for (let t = 12250; t <= 17000; t += 250) Engine.tickMatch(match, t);
  assert.ok(match.pauseBudgetsMs[starter] <= 55000);
  assert.equal(Engine.togglePause(match, other, 17100).ok, false);
  assert.equal(Engine.togglePause(match, starter, 17200).ok, true);
  assert.equal(match.paused, false);
});

test('gecikmeler ikinci yarı sonunda hesaplanan ek süre üretir', () => {
  const match = Engine.createMatch([team('A', 'a'), team('B', 'b')], settings, 1000);
  completeKickoff(match, 8, 3, 1000);
  match.phase = 'regulation';
  match.periodIndex = 1;
  match.periodElapsedMs = match.periodDurationsMs[1] - 1;
  match.delayWasteMs = [10000, 10000];
  match.stoppageAnnounced = false;
  match.lastTickAt = 20000;
  Engine.tickMatch(match, 20010);
  assert.equal(match.stoppageAnnounced, true);
  assert.ok(match.stoppageMs >= 5000);
  assert.equal(match.resolving, true);
});
