'use strict';

/*
 * 4'lü turnuva ve düello grace soket simülasyonu.
 * Gerçek sunucu + 4 gerçek socket.io istemcisiyle docs/oyun-akisi.md §5 doğrulanır:
 *  - oda tipi, 4 oyuncu, rastgele kadrolar
 *  - eşzamanlı yarı finaller ve MAÇ İZOLASYONU (kimse başkasının maçını görmez)
 *  - hükmen ile eleme → finaller → podyum
 *  - duo odada düello grace: ayrılan dönmezse düello iptal
 */

const test = require('node:test');
const assert = require('node:assert');
const { spawn } = require('node:child_process');
const path = require('node:path');
const { io } = require('socket.io-client');

const PORT = 18790;
const URL = `http://127.0.0.1:${PORT}`;
let serverProcess = null;

function waitForEvent(socket, event, timeoutMs = 8000, filter = () => true) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(event, handler);
      reject(new Error(`${event} beklenirken zaman aşımı`));
    }, timeoutMs);
    const handler = payload => {
      if (!filter(payload)) return;
      clearTimeout(timer);
      socket.off(event, handler);
      resolve(payload);
    };
    socket.on(event, handler);
  });
}

function emitAck(socket, event, payload) {
  return new Promise(resolve => socket.emit(event, payload, resolve));
}

function connectClient() {
  return new Promise((resolve, reject) => {
    const socket = io(URL, { transports: ['websocket'], reconnection: false });
    socket.once('connect', () => resolve(socket));
    socket.once('connect_error', reject);
  });
}

test.before(async () => {
  serverProcess = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], {
    env: { ...process.env, PORT: String(PORT), QUAD_STAGE_DELAY_MS: '400', DUEL_GRACE_MS: '900' },
    stdio: 'ignore'
  });
  await new Promise(resolve => setTimeout(resolve, 900));
});

test.after(() => { serverProcess?.kill('SIGTERM'); });

test('4\'lü turnuva: kurulum, izolasyon, hükmen ile podyuma kadar tam akış', async () => {
  const [a, b, c, d] = await Promise.all([connectClient(), connectClient(), connectClient(), connectClient()]);
  const clients = [a, b, c, d];
  try {
    // 1. Oda: quad modunda kurulur
    const created = await emitAck(a, 'room:create', { name: 'Yonetici', token: 't-a', mode: 'quad' });
    assert.equal(created.ok, true);
    assert.equal(created.mode, 'quad');
    assert.equal(created.lobby.players.length, 4);

    // 2. Üç oyuncu katılır
    for (const [socket, name, token] of [[b, 'Beril', 't-b'], [c, 'Cem', 't-c'], [d, 'Derya', 't-d']]) {
      const joined = await emitAck(socket, 'room:join', { code: created.code, name, token });
      assert.equal(joined.ok, true, joined.error);
      assert.equal(joined.mode, 'quad');
    }

    // 3. Yönetici olmayan kadro yöntemi seçemez
    const rejected = await emitAck(b, 'quad:squadMethod', { method: 'random' });
    assert.equal(rejected.ok, false);

    // 4. Yönetici ayar + rastgele kadrolar
    const configured = await emitAck(a, 'quad:configure', { elimination: 'single', settings: { durationMinutes: 1 } });
    assert.equal(configured.ok, true);
    const squads = await emitAck(a, 'quad:squadMethod', { method: 'random' });
    assert.equal(squads.ok, true, squads.error);
    assert.ok(squads.lobby.players.every(player => player.ready), 'dört kadro da hazır olmalı');

    // 5. Başlat: herkes yalnız KENDİ maçını alır
    const starts = clients.map(socket => waitForEvent(socket, 'match:start'));
    const startAck = await emitAck(a, 'quad:start', {});
    assert.equal(startAck.ok, true, startAck.error);
    const payloads = await Promise.all(starts);
    payloads.forEach(payload => {
      assert.ok(Number.isInteger(payload.matchId), 'matchId gelmeli');
      assert.ok([0, 1].includes(payload.yourSide), 'yourSide 0/1 olmalı');
      assert.equal(payload.match.phase, 'kickoff');
    });
    const matchIds = payloads.map(p => p.matchId);
    assert.equal(new Set(matchIds).size, 2, 'iki farklı yarı final olmalı');

    // 6. İZOLASYON: farklı maçtaki iki istemciyi seç
    const otherIndex = matchIds.findIndex(id => id !== matchIds[0]);
    const clientM0 = clients[0];
    const clientM1 = clients[otherIndex];
    const foreignStates = [];
    const spy = payload => { if (payload.matchId === matchIds[0]) foreignStates.push(payload); };
    clientM1.on('match:state', spy);

    // 7. Maç 0 oyuncusu ilk düdüğü verir (kickoffReady → stop)
    const stop = await emitAck(clientM0, 'match:stop', { digit: 3 });
    // sıra kimin olduğuna göre reddedilebilir; kabul edilen tarafı bul
    if (!stop.ok) {
      const partnerIndex = matchIds.findIndex((id, i) => id === matchIds[0] && i !== 0);
      const stop2 = await emitAck(clients[partnerIndex], 'match:stop', { digit: 3 });
      assert.equal(stop2.ok, true, stop2.error);
    }
    await new Promise(resolve => setTimeout(resolve, 400));
    clientM1.off('match:state', spy);
    assert.equal(foreignStates.length, 0, 'diğer maçın state\'i sızmamalı');

    // 8. Yarı finaller hükmenle biter → break → finaller
    const stagePromise = waitForEvent(a, 'quad:stage', 8000, payload => payload?.quad?.stage === 'break');
    const forfeit0 = await emitAck(clientM0, 'match:forfeit', {});
    assert.equal(forfeit0.ok, true, forfeit0.error);
    const forfeit1 = await emitAck(clientM1, 'match:forfeit', {});
    assert.equal(forfeit1.ok, true, forfeit1.error);
    const stage = await stagePromise;
    assert.equal(stage.quad.stage, 'break');
    assert.equal(stage.quad.bracket.history.length >= 2, true, 'iki yarı final bracket geçmişinde olmalı');

    // 9. Finaller otomatik başlar (kısaltılmış gecikme)
    const finalStarts = clients.map(socket => waitForEvent(socket, 'match:start', 6000));
    const finalPayloads = await Promise.all(finalStarts);
    const finalIds = new Set(finalPayloads.map(p => p.matchId));
    assert.equal(finalIds.size, 2, 'final + üçüncülük aynı anda oynanmalı');

    // 10. Finalleri de hükmenle bitir → podyum
    const podiumPromise = waitForEvent(a, 'quad:podium', 8000);
    for (const socket of clients) {
      const result = await emitAck(socket, 'match:forfeit', {});
      // her maçta yalnız ilk forfeit kabul edilir; diğerleri "maç bitti" der — ikisi de geçerli
      assert.ok(result.ok || /bitti|bulunamadı/i.test(result.error || ''), result.error);
    }
    const podium = await podiumPromise;
    assert.equal(podium.quad.stage, 'done');
    assert.ok(podium.quad.podium.champion.name, 'şampiyon adı olmalı');
    assert.ok(podium.quad.podium.third.name, 'üçüncü adı olmalı');
    assert.ok(podium.quad.stats, 'istatistikler olmalı');
  } finally {
    clients.forEach(socket => socket.close());
  }
});

test('duo düello grace: ayrılan oyuncu dönmezse düello iptal edilir', async () => {
  const [a, b] = await Promise.all([connectClient(), connectClient()]);
  try {
    const created = await emitAck(a, 'room:create', { name: 'Aslı', token: 'g-a', mode: 'duo' });
    assert.equal(created.ok, true);
    const joined = await emitAck(b, 'room:join', { code: created.code, name: 'Baran', token: 'g-b' });
    assert.equal(joined.ok, true);

    const req = await emitAck(a, 'room:duelRequest', {});
    assert.equal(req.ok, true, req.error);
    const accepted = await emitAck(b, 'room:duelRespond', { accept: true });
    assert.equal(accepted.ok, true, accepted.error);
    const flipped = await emitAck(a, 'duel:flip', {});
    assert.equal(flipped.ok, true, flipped.error);

    // A ayrılır → B'ye paused düello gelir
    const pausedPromise = waitForEvent(b, 'room:duel', 4000, payload => payload?.paused === true);
    a.emit('duel:stepOut');
    const paused = await pausedPromise;
    assert.equal(paused.pausedBy, 0);
    assert.ok(paused.deadline > Date.now(), 'geri sayım olmalı');

    // Duraklatılmışken B kriter seçemez
    const blocked = await emitAck(b, 'duel:criterion', { value: 'all' });
    assert.equal(blocked.ok, false);

    // Süre dolunca düello iptal + bildirim
    const cancelPromise = waitForEvent(b, 'room:duel', 4000, payload => payload === null);
    const noticePromise = waitForEvent(b, 'room:notice', 4000);
    await cancelPromise;
    const notice = await noticePromise;
    assert.match(notice.text, /iptal/i);
  } finally {
    a.close(); b.close();
  }
});

test('duo düello grace: geri dönen oyuncu kaldığı yerden sürdürür', async () => {
  const [a, b] = await Promise.all([connectClient(), connectClient()]);
  try {
    const created = await emitAck(a, 'room:create', { name: 'Ada', token: 'h-a', mode: 'duo' });
    const joined = await emitAck(b, 'room:join', { code: created.code, name: 'Bora', token: 'h-b' });
    assert.equal(joined.ok, true);
    await emitAck(a, 'room:duelRequest', {});
    await emitAck(b, 'room:duelRespond', { accept: true });
    const flipped = await emitAck(a, 'duel:flip', {});
    assert.equal(flipped.ok, true);

    const pausedPromise = waitForEvent(b, 'room:duel', 4000, payload => payload?.paused === true);
    a.emit('duel:stepOut');
    await pausedPromise;

    const resumedPromise = waitForEvent(b, 'room:duel', 4000, payload => payload && payload.paused === false);
    a.emit('duel:stepBack');
    const resumed = await resumedPromise;
    assert.equal(resumed.paused, false);
    assert.equal(resumed.phase, 'criteria');
  } finally {
    a.close(); b.close();
  }
});
