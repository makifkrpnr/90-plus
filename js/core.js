(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.GameCore = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const MAIN_EVENTS = Object.freeze({
    0: { key: 'goal', label: 'GOL', keepsPossession: false },
    1: { key: 'pass', label: 'PAS', keepsPossession: true },
    2: { key: 'pass', label: 'PAS', keepsPossession: true },
    3: { key: 'throwIn', label: 'TAÇ', keepsPossession: false },
    4: { key: 'foul', label: 'FAUL', keepsPossession: false },
    5: { key: 'pass', label: 'PAS', keepsPossession: true },
    6: { key: 'corner', label: 'KORNER', keepsPossession: true },
    7: { key: 'pass', label: 'PAS', keepsPossession: true },
    8: { key: 'freeKick', label: 'FRİKİK', keepsPossession: true },
    9: { key: 'turnover', label: 'AUT / TOP KAYBI', keepsPossession: false }
  });

  function normalizeDigit(value) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) return 0;
    return Math.abs(parsed) % 10;
  }

  function mainEventForDigit(digit) {
    return MAIN_EVENTS[normalizeDigit(digit)];
  }

  function foulResultForDigit(digit) {
    const d = normalizeDigit(digit);
    if (d === 1 || d === 3) return 'freeKick';
    if (d === 9) return 'penalty';
    return 'indirect';
  }

  function cardForDigit(digit) {
    const d = normalizeDigit(digit);
    if (d === 1 || d === 3 || d === 5) return 'yellow';
    if (d === 9) return 'red';
    return 'none';
  }

  function shotForDigit(digit) {
    return normalizeDigit(digit) % 2 === 0 ? 'goal' : 'saved';
  }

  function registerCorner(currentCorners) {
    const next = Math.max(0, Number(currentCorners) || 0) + 1;
    if (next >= 3) return { corners: 0, penalty: true };
    return { corners: next, penalty: false };
  }

  function registerTimeout(currentCount) {
    const count = Math.max(0, Number(currentCount) || 0) + 1;
    const results = {
      1: 'turnover',
      2: 'turnover',
      3: 'penaltyAgainst',
      4: 'redCard',
      5: 'forfeit'
    };
    return { count, consequence: results[Math.min(count, 5)] };
  }

  function applyCard(player, card) {
    const next = {
      ...player,
      yellowCards: Number(player.yellowCards) || 0,
      red: Boolean(player.red),
      injured: Boolean(player.injured)
    };

    if (card === 'yellow' && !next.red) {
      next.yellowCards += 1;
      if (next.yellowCards >= 2) next.red = true;
    }
    if (card === 'red') next.red = true;
    return next;
  }

  function roundExtraTimeSeconds(matchSeconds) {
    const raw = (Math.max(0, Number(matchSeconds) || 0) * 15) / 90;
    return Math.max(30, Math.round(raw / 30) * 30);
  }

  function calculateStoppageTimeMs(delayWasteMs, durationMinutes) {
    const totalWaste = Array.isArray(delayWasteMs)
      ? delayWasteMs.reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0)
      : Math.max(0, Number(delayWasteMs) || 0);
    const duration = Math.max(1, Math.min(10, Number(durationMinutes) || 5));
    const cap = duration * 12000; // 5 dakikalık maç için en fazla 60 sn.
    const estimated = totalWaste * 0.72;
    if (estimated < 5000) return 0;
    return Math.min(cap, Math.max(5000, Math.round(estimated / 5000) * 5000));
  }

  function formatAddedTimeMinutes(stoppageMs) {
    const seconds = Math.max(0, Number(stoppageMs) || 0) / 1000;
    return seconds ? Math.max(1, Math.round(seconds / 60)) : 0;
  }

  function matchMinute(elapsedSeconds, regulationSeconds, periodType) {
    const elapsed = Math.max(0, Number(elapsedSeconds) || 0);
    const regulation = Math.max(1, Number(regulationSeconds) || 1);
    if (periodType === 'extra') {
      return Math.min(120, 90 + Math.round((elapsed / Math.max(1, roundExtraTimeSeconds(regulation))) * 30));
    }
    return Math.min(90, Math.max(1, Math.round((elapsed / regulation) * 90)));
  }

  function possessionPercent(possessionMs) {
    const a = Math.max(0, Number(possessionMs && possessionMs[0]) || 0);
    const b = Math.max(0, Number(possessionMs && possessionMs[1]) || 0);
    const total = a + b;
    if (!total) return [50, 50];
    const first = Math.round((a / total) * 100);
    return [first, 100 - first];
  }

  function forfeitScore(scores, losingSide) {
    const next = [Number(scores[0]) || 0, Number(scores[1]) || 0];
    const winner = losingSide === 0 ? 1 : 0;
    next[winner] = Math.max(next[winner], next[losingSide] + 3, 3);
    return next;
  }

  function chooseByModulo(items, digit) {
    if (!Array.isArray(items) || !items.length) return null;
    return items[normalizeDigit(digit) % items.length];
  }

  return Object.freeze({
    MAIN_EVENTS,
    normalizeDigit,
    mainEventForDigit,
    foulResultForDigit,
    cardForDigit,
    shotForDigit,
    registerCorner,
    registerTimeout,
    applyCard,
    roundExtraTimeSeconds,
    calculateStoppageTimeMs,
    formatAddedTimeMinutes,
    matchMinute,
    possessionPercent,
    forfeitScore,
    chooseByModulo
  });
});
