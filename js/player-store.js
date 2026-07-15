(function (root) {
  'use strict';
  let cache = null;
  let pending = null;
  const url = 'data/players.json';
  async function load() {
    if (cache) return cache;
    if (pending) return pending;
    pending = fetch(url, { cache: 'force-cache' })
      .then(response => { if (!response.ok) throw new Error(`Oyuncu verisi yüklenemedi (${response.status})`); return response.json(); })
      .then(payload => {
        const players = Array.isArray(payload) ? payload : payload.players;
        if (!Array.isArray(players) || !players.length) throw new Error('Oyuncu verisi boş.');
        cache = Object.freeze(players);
        root.KRONOMETRE_EXCLUDED_PLAYER_IDS = Object.freeze((payload.excluded || []).slice());
        return cache;
      })
      .finally(() => { pending = null; });
    return pending;
  }
  function get() { return cache || []; }
  function ready() { return Boolean(cache); }
  root.PlayerStore = Object.freeze({ load, get, ready, url });
})(typeof window !== 'undefined' ? window : globalThis);
