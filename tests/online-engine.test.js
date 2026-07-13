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
  durationMinutes: 5,
  cards: true,
  injury: false,
  extraTime: true,
  shootout: true,
  soundIntensity: 'medium'
};

test('online match starts with two teams and home possession', () => {
  const match = Engine.createMatch([team('A', 'a'), team('B', 'b')], settings, 1000);
  assert.equal(match.mode, 'friend');
  assert.equal(match.context.owner, 0);
  assert.equal(match.teams[0].lineup.length, 11);
  assert.ok(match.activePlayerId[0]);
});

test('only active side can stop and digit zero scores a goal', () => {
  const match = Engine.createMatch([team('A', 'a'), team('B', 'b')], settings, 1000);
  assert.equal(Engine.stopRoll(match, 1, 0, 1100).ok, false);
  const result = Engine.stopRoll(match, 0, 0, 1100);
  assert.equal(result.ok, true);
  assert.deepEqual(match.scores, [1, 0]);
  assert.equal(match.transition.owner, 1);
});

test('third corner schedules a penalty', () => {
  const match = Engine.createMatch([team('A', 'a'), team('B', 'b')], settings, 1000);
  match.teams[0].corners = 2;
  Engine.stopRoll(match, 0, 6, 1100);
  assert.equal(match.teams[0].corners, 0);
  assert.equal(match.transition.context.type, 'shot');
  assert.equal(match.transition.context.reason, 'penalty');
});

test('third time violation gives the opponent a penalty', () => {
  const match = Engine.createMatch([team('A', 'a'), team('B', 'b')], settings, 1000);
  match.teams[0].timeouts = 2;
  match.turnElapsedMs = 9999;
  match.lastTickAt = 1000;
  Engine.tickMatch(match, 1010);
  assert.equal(match.teams[0].timeouts, 3);
  assert.equal(match.transition.owner, 1);
  assert.equal(match.transition.context.reason, 'penalty');
});

test('host pause toggles an active match', () => {
  const match = Engine.createMatch([team('A', 'a'), team('B', 'b')], settings, 1000);
  assert.equal(Engine.togglePause(match, 1100), true);
  assert.equal(match.paused, true);
  assert.equal(Engine.togglePause(match, 1200), true);
  assert.equal(match.paused, false);
});
