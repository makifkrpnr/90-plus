'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { Server } = require('socket.io');
const Engine = require('./server/online-engine.js');

const PORT = Number(process.env.PORT) || 8080;
const ROOT = __dirname;
const rooms = new Map();
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8',
  '.ttf': 'font/ttf'
};

function safeText(value, fallback, max = 24) {
  const text = String(value ?? '').replace(/[<>\u0000-\u001F]/g, '').trim().slice(0, max);
  return text || fallback;
}

function randomCode() {
  let code = '';
  do {
    code = Array.from({ length: 6 }, () => CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function normalizeCode(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

function validateTeam(raw) {
  if (!raw || !Array.isArray(raw.lineup) || raw.lineup.length !== 11) return null;
  const seen = new Set();
  const lineup = [];
  for (const player of raw.lineup) {
    const id = safeText(player.id, '', 60);
    if (!id || seen.has(id)) return null;
    seen.add(id);
    lineup.push({
      id,
      name: safeText(player.name, 'Oyuncu', 40),
      nationality: safeText(player.nationality, '—', 30),
      position: safeText(player.position, 'CM', 4),
      slot: safeText(player.slot, 'CM', 4),
      rating: Math.max(40, Math.min(99, Number(player.rating) || 70)),
      activeStart: Number(player.activeStart) || 1950,
      activeEnd: Number(player.activeEnd) || 2026,
      leagues: Array.isArray(player.leagues) ? player.leagues.slice(0, 8).map(item => safeText(item, '', 30)).filter(Boolean) : []
    });
  }
  if (!lineup.some(player => player.slot === 'GK')) return null;
  return { name: safeText(raw.name, '90+ XI', 22), lineup };
}

function validateSettings(raw) {
  return {
    durationMinutes: Math.max(1, Math.min(10, Number(raw?.durationMinutes) || 5)),
    cards: raw?.cards !== false,
    injury: Boolean(raw?.injury),
    extraTime: raw?.extraTime !== false,
    shootout: raw?.shootout !== false,
    soundIntensity: ['low', 'medium', 'high'].includes(raw?.soundIntensity) ? raw.soundIntensity : 'medium'
  };
}

function playerSummary(player, side) {
  if (!player) return { side, present: false, connected: false, ready: false, name: side === 0 ? 'Ev sahibi' : 'Misafir', teamName: null };
  return {
    side,
    present: true,
    connected: player.connected,
    ready: Boolean(player.team),
    name: player.name,
    teamName: player.team?.name || null
  };
}

function lobbyPayload(room) {
  return {
    code: room.code,
    phase: room.phase,
    players: [playerSummary(room.players[0], 0), playerSummary(room.players[1], 1)],
    settings: room.settings,
    canStart: Boolean(room.players[0]?.team && room.players[1]?.team && room.players[0]?.connected && room.players[1]?.connected && room.phase === 'lobby'),
    createdAt: room.createdAt
  };
}

function touch(room) {
  room.updatedAt = Date.now();
}

function emitLobby(io, room) {
  io.to(room.code).emit('room:lobby', lobbyPayload(room));
}

function attachPlayer(socket, room, side, player) {
  player.socketId = socket.id;
  player.connected = true;
  room.players[side] = player;
  socket.join(room.code);
  socket.data.roomCode = room.code;
  socket.data.side = side;
  socket.data.playerToken = player.token;
  touch(room);
}

function currentRoom(socket) {
  const code = socket.data.roomCode;
  return code ? rooms.get(code) : null;
}

function isHost(socket) {
  return socket.data.side === 0;
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (requestUrl.pathname === '/health') {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, rooms: rooms.size }));
    return;
  }

  let pathname = decodeURIComponent(requestUrl.pathname);
  if (pathname === '/') pathname = '/index.html';
  const absolute = path.resolve(ROOT, `.${pathname}`);
  if (!absolute.startsWith(ROOT) || absolute.includes(`${path.sep}node_modules${path.sep}`)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.stat(absolute, (statError, stat) => {
    if (statError || !stat.isFile()) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, {
      'content-type': MIME[path.extname(absolute)] || 'application/octet-stream',
      'cache-control': pathname.endsWith('.html') ? 'no-cache' : 'public, max-age=3600'
    });
    fs.createReadStream(absolute).pipe(res);
  });
});

const io = new Server(server, {
  cors: { origin: true, credentials: false },
  pingTimeout: 20000,
  pingInterval: 10000
});

io.on('connection', socket => {
  socket.on('room:create', (payload, ack = () => {}) => {
    const token = safeText(payload?.token, crypto.randomUUID(), 80);
    const name = safeText(payload?.name, 'Oyuncu 1', 22);
    const code = randomCode();
    const room = {
      code,
      phase: 'lobby',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      players: [null, null],
      settings: validateSettings(null),
      match: null,
      lastBroadcastAt: 0
    };
    rooms.set(code, room);
    attachPlayer(socket, room, 0, { token, name, team: null, connected: true, socketId: socket.id });
    ack({ ok: true, code, side: 0, lobby: lobbyPayload(room) });
    emitLobby(io, room);
  });

  socket.on('room:join', (payload, ack = () => {}) => {
    const code = normalizeCode(payload?.code);
    const room = rooms.get(code);
    if (!room) return ack({ ok: false, error: 'Oda bulunamadı. Kodu kontrol et.' });
    const token = safeText(payload?.token, crypto.randomUUID(), 80);
    const name = safeText(payload?.name, 'Oyuncu 2', 22);

    let side = room.players.findIndex(player => player?.token === token);
    if (side < 0) {
      if (room.phase !== 'lobby') return ack({ ok: false, error: 'Maç başlamış; yeni oyuncu alınmıyor.' });
      side = room.players[1] ? -1 : 1;
      if (side < 0) return ack({ ok: false, error: 'Oda dolu.' });
      room.players[1] = { token, name, team: null, connected: true, socketId: socket.id };
    }
    const player = room.players[side];
    player.name = name || player.name;
    attachPlayer(socket, room, side, player);
    ack({ ok: true, code, side, lobby: lobbyPayload(room), match: room.match });
    emitLobby(io, room);
    if (room.match) socket.emit('match:state', { match: room.match, serverNow: Date.now() });
  });

  socket.on('room:submitTeam', (payload, ack = () => {}) => {
    const room = currentRoom(socket);
    if (!room || room.code !== normalizeCode(payload?.code)) return ack({ ok: false, error: 'Oda bağlantısı bulunamadı.' });
    if (room.phase !== 'lobby') return ack({ ok: false, error: 'Maç başladıktan sonra kadro değiştirilemez.' });
    const team = validateTeam(payload?.team);
    if (!team) return ack({ ok: false, error: 'Kadro 11 benzersiz oyuncudan ve bir kaleciden oluşmalı.' });
    room.players[socket.data.side].team = team;
    touch(room);
    ack({ ok: true, lobby: lobbyPayload(room) });
    emitLobby(io, room);
  });

  socket.on('room:updateSettings', (payload, ack = () => {}) => {
    const room = currentRoom(socket);
    if (!room || !isHost(socket)) return ack({ ok: false, error: 'Ayarları yalnızca oda sahibi değiştirebilir.' });
    if (room.phase !== 'lobby') return ack({ ok: false, error: 'Maç başladı.' });
    room.settings = validateSettings(payload?.settings);
    touch(room);
    ack({ ok: true, lobby: lobbyPayload(room) });
    emitLobby(io, room);
  });

  socket.on('room:start', (_payload, ack = () => {}) => {
    const room = currentRoom(socket);
    if (!room || !isHost(socket)) return ack({ ok: false, error: 'Maçı yalnızca oda sahibi başlatabilir.' });
    if (room.phase !== 'lobby') return ack({ ok: false, error: 'Maç zaten başladı.' });
    if (!room.players[0]?.team || !room.players[1]?.team) return ack({ ok: false, error: 'İki takım da hazır olmalı.' });
    if (!room.players[0]?.connected || !room.players[1]?.connected) return ack({ ok: false, error: 'İki oyuncu da bağlı olmalı.' });
    room.match = Engine.createMatch([room.players[0].team, room.players[1].team], room.settings, Date.now());
    room.phase = 'match';
    touch(room);
    ack({ ok: true });
    io.to(room.code).emit('match:start', { match: room.match, serverNow: Date.now() });
    emitLobby(io, room);
  });

  socket.on('match:stop', (payload, ack = () => {}) => {
    const room = currentRoom(socket);
    if (!room?.match || room.phase !== 'match') return ack({ ok: false, error: 'Aktif maç bulunamadı.' });
    const result = Engine.stopRoll(room.match, socket.data.side, payload?.digit, Date.now());
    if (!result.ok) return ack(result);
    touch(room);
    ack({ ok: true, digit: result.digit });
    io.to(room.code).emit('match:state', { match: room.match, serverNow: Date.now() });
  });

  socket.on('match:startPeriod', (_payload, ack = () => {}) => {
    const room = currentRoom(socket);
    if (!room?.match || room.phase !== 'match') return ack({ ok: false, error: 'Aktif maç bulunamadı.' });
    const result = Engine.startWaitingPeriod(room.match, socket.data.side, Date.now());
    if (!result.ok) return ack(result);
    touch(room);
    ack({ ok: true });
    io.to(room.code).emit('match:state', { match: room.match, serverNow: Date.now() });
  });

  socket.on('match:pause', (_payload, ack = () => {}) => {
    const room = currentRoom(socket);
    if (!room?.match || !isHost(socket)) return ack({ ok: false, error: 'Maçı yalnızca oda sahibi duraklatabilir.' });
    const changed = Engine.togglePause(room.match, Date.now());
    if (!changed) return ack({ ok: false, error: 'Maç şu anda duraklatılamıyor.' });
    touch(room);
    ack({ ok: true, paused: room.match.paused });
    io.to(room.code).emit('match:state', { match: room.match, serverNow: Date.now() });
  });

  socket.on('room:rematch', (_payload, ack = () => {}) => {
    const room = currentRoom(socket);
    if (!room || !isHost(socket)) return ack({ ok: false, error: 'Rövanşı yalnızca oda sahibi başlatabilir.' });
    if (!room.match || room.match.phase !== 'finished') return ack({ ok: false, error: 'Önce mevcut maç bitmeli.' });
    room.match = Engine.createMatch([room.players[0].team, room.players[1].team], room.settings, Date.now());
    room.phase = 'match';
    touch(room);
    ack({ ok: true });
    io.to(room.code).emit('match:start', { match: room.match, serverNow: Date.now() });
  });

  socket.on('room:leave', () => {
    const room = currentRoom(socket);
    if (!room) return;
    const side = socket.data.side;
    if (room.phase === 'lobby') {
      if (side === 0) {
        io.to(room.code).emit('room:closed', { reason: 'Oda sahibi ayrıldı.' });
        rooms.delete(room.code);
      } else {
        room.players[1] = null;
        socket.leave(room.code);
        emitLobby(io, room);
      }
    } else if (room.players[side]) {
      room.players[side].connected = false;
      emitLobby(io, room);
    }
    socket.data.roomCode = null;
    socket.data.side = null;
  });

  socket.on('disconnect', () => {
    const room = currentRoom(socket);
    if (!room) return;
    const side = socket.data.side;
    const player = room.players[side];
    if (player && player.socketId === socket.id) {
      player.connected = false;
      touch(room);
      emitLobby(io, room);
    }
  });
});

setInterval(() => {
  const now = Date.now();
  for (const room of rooms.values()) {
    if (room.match && room.phase === 'match') {
      const changed = Engine.tickMatch(room.match, now);
      if (room.match.phase === 'finished') room.phase = 'finished';
      if (changed || now - room.lastBroadcastAt >= 100) {
        room.lastBroadcastAt = now;
        io.to(room.code).emit('match:state', { match: room.match, serverNow: now });
      }
    }
  }
}, 50).unref();

setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    const nobodyConnected = room.players.every(player => !player?.connected);
    const ttl = nobodyConnected ? 10 * 60 * 1000 : 6 * 60 * 60 * 1000;
    if (now - room.updatedAt > ttl) rooms.delete(code);
  }
}, 60 * 1000).unref();

const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`90+ çalışıyor: http://${HOST}:${PORT}`);
});

function shutdown(signal) {
  console.log(`${signal} alındı, 90+ sunucusu güvenli biçimde kapatılıyor...`);
  io.close(() => {
    server.close(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 25_000).unref();
}

process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));

