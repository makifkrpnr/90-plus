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

function finishOverlay(match, time) {
  Engine.tickMatch(match, time);
}

function selectPlayer(match, side, digit, now) {
  const selected = Engine.stopRoll(match, side, digit, now);
  assert.equal(selected.ok, true);
  finishOverlay(match, now + 1800);
  assert.equal(match.context.type, 'main');
}

test('online maç oyuncu seçimiyle ve ev sahibiyle başlar', () => {
  const match = Engine.createMatch([team('A', 'a'), team('B', 'b')], settings, 1000);
  assert.equal(match.mode, 'friend');
  assert.equal(match.context.owner, 0);
  assert.equal(match.context.type, 'playerSelect');
  assert.equal(match.activePlayerId[0], null);
  assert.equal(match.teams[0].lineup.length, 11);
});

test('önce oyuncu seçilir, sonraki atış sıfırsa gol olur', () => {
  const match = Engine.createMatch([team('A', 'a'), team('B', 'b')], settings, 1000);
  assert.equal(Engine.stopRoll(match, 1, 0, 1100).ok, false);
  selectPlayer(match, 0, 3, 1100);
  const scorerId = match.activePlayerId[0];
  const result = Engine.stopRoll(match, 0, 0, 3000);
  assert.equal(result.ok, true);
  assert.deepEqual(match.scores, [1, 0]);
  assert.equal(match.transition.owner, 1);
  assert.equal(match.transition.context.type, 'playerSelect');
  assert.equal(match.teams[0].lineup.find(player => player.id === scorerId).goals, 1);
});

test('pas sonrası aynı takım yeni oyuncu seçimine döner', () => {
  const match = Engine.createMatch([team('A', 'a'), team('B', 'b')], settings, 1000);
  selectPlayer(match, 0, 5, 1100);
  Engine.stopRoll(match, 0, 1, 3000);
  assert.equal(match.transition.owner, 0);
  assert.equal(match.transition.context.type, 'playerSelect');
});

test('üçüncü korner penaltı planlar', () => {
  const match = Engine.createMatch([team('A', 'a'), team('B', 'b')], settings, 1000);
  selectPlayer(match, 0, 2, 1100);
  match.teams[0].corners = 2;
  Engine.stopRoll(match, 0, 6, 3000);
  assert.equal(match.teams[0].corners, 0);
  assert.equal(match.transition.context.type, 'shot');
  assert.equal(match.transition.context.reason, 'penalty');
});

test('üçüncü süre ihlali rakibe penaltı verir', () => {
  const match = Engine.createMatch([team('A', 'a'), team('B', 'b')], settings, 1000);
  match.teams[0].timeouts = 2;
  match.turnElapsedMs = 9999;
  match.lastTickAt = 1000;
  Engine.tickMatch(match, 1010);
  assert.equal(match.teams[0].timeouts, 3);
  assert.equal(match.transition.owner, 1);
  assert.equal(match.transition.context.reason, 'penalty');
});

test('ilk devre bittiğinde ikinci devreyi yalnız deplasman başlatır', () => {
  const match = Engine.createMatch([team('A', 'a'), team('B', 'b')], settings, 1000);
  match.periodElapsedMs = match.periodDurationsMs[0] - 1;
  match.lastTickAt = 1000;
  Engine.tickMatch(match, 1010);
  assert.equal(match.awaitingPeriodStart, true);
  assert.equal(match.periodIndex, 1);
  assert.equal(match.awaitingPeriodSide, 1);
  assert.equal(Engine.startWaitingPeriod(match, 0, 1100).ok, false);
  assert.equal(Engine.startWaitingPeriod(match, 1, 1100).ok, true);
  assert.equal(match.context.owner, 1);
  assert.equal(match.context.type, 'playerSelect');
});

test('oda sahibi aktif maçı duraklatabilir', () => {
  const match = Engine.createMatch([team('A', 'a'), team('B', 'b')], settings, 1000);
  assert.equal(Engine.togglePause(match, 1100), true);
  assert.equal(match.paused, true);
  assert.equal(Engine.togglePause(match, 1200), true);
  assert.equal(match.paused, false);
});
