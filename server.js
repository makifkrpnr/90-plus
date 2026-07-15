'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { Server } = require('socket.io');
const Engine = require('./server/online-engine.js');
const PlayerData = require('./js/players.js');
const ALL_PLAYERS = PlayerData.players;
const SLOTS = ['GK','LB','CB','CB','RB','DM','CM','AM','LW','RW','ST'];
const DUEL_KEYS = ['period','nationality','league','rating','style'];

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
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4'
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
  const colors = Array.isArray(raw?.teamColors) ? raw.teamColors.slice(0,2).map(value => /^#[0-9a-f]{6}$/i.test(String(value)) ? String(value) : null) : [];
  return {
    durationMinutes: Math.max(1, Math.min(10, Number(raw?.durationMinutes) || 5)), cards: raw?.cards !== false,
    injury: Boolean(raw?.injury), extraTime: raw?.extraTime !== false, shootout: raw?.shootout !== false,
    menuMusic: raw?.menuMusic !== false, menuVolume: Math.max(0,Math.min(1,Number(raw?.menuVolume) || .55)),
    stadiumAmbience: raw?.stadiumAmbience !== false, stadiumVolume: Math.max(0,Math.min(1,Number(raw?.stadiumVolume) || .5)),
    sfx: raw?.sfx !== false, sfxVolume: Math.max(0,Math.min(1,Number(raw?.sfxVolume) || .75)),
    soundIntensity: ['low','medium','high'].includes(raw?.soundIntensity) ? raw.soundIntensity : 'medium',
    vibration: raw?.vibration !== false, eventDuration: ['normal','long','extra'].includes(raw?.eventDuration) ? raw.eventDuration : 'long',
    teamColors: [colors[0] || '#d44735', colors[1] || '#2878c8']
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
    startReady: Array.isArray(room.startReady) ? [...room.startReady] : [false, false],
    startDeadline: room.startDeadline || null,
    canStart: Boolean(room.players[0]?.team && room.players[1]?.team && room.players[0]?.connected && room.players[1]?.connected && room.phase === 'lobby'),
    createdAt: room.createdAt,
    duel: room.duel ? JSON.parse(JSON.stringify(room.duel)) : null,
    rematchRequest: room.rematchRequest || null
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

function clearStartTimer(room) {
  if (room?.startTimer) clearTimeout(room.startTimer);
  if (room) room.startTimer = null;
}

function canPrepareMatch(room) {
  return Boolean(room?.players?.[0]?.team && room?.players?.[1]?.team && room.players[0].connected && room.players[1].connected);
}

function swapRoomSides(io, room) {
  const first = room.players[0]; room.players[0] = room.players[1]; room.players[1] = first;
  room.players.forEach((player, side) => {
    if (!player?.socketId) return;
    const client = io.sockets.sockets.get(player.socketId);
    if (client) { client.data.side = side; client.emit('room:side', { side }); }
  });
}

function beginRoomMatch(io, room) {
  if (!room || !canPrepareMatch(room)) return false;
  clearStartTimer(room);
  room.startReady = [false, false];
  room.startDeadline = null;
  room.match = Engine.createMatch([room.players[0].team, room.players[1].team], room.settings, Date.now(), room.pendingSeries || null);
  room.pendingSeries = null;
  room.phase = 'match';
  touch(room);
  io.to(room.code).emit('match:start', { match: room.match, serverNow: Date.now() });
  emitLobby(io, room);
  return true;
}

function scheduleBriefDeadline(io, room) {
  clearStartTimer(room);
  room.startDeadline = Date.now() + 30000;
  room.startTimer = setTimeout(() => {
    if (room.phase === 'brief') beginRoomMatch(io, room);
  }, 30050);
  room.startTimer.unref?.();
}


function positionScore(slot, player) {
  if (slot === player.position) return 10;
  const groups = { GK:['GK'], LB:['LB','RB','CB'], RB:['RB','LB','CB'], CB:['CB','LB','RB','DM'], DM:['DM','CM','CB'], CM:['CM','DM','AM'], AM:['AM','CM','LW','RW'], LW:['LW','RW','AM','ST'], RW:['RW','LW','AM','ST'], ST:['ST','LW','RW','AM'] };
  const index = (groups[slot] || []).indexOf(player.position);
  return index < 0 ? 0 : Math.max(1, 7-index*2);
}
function shuffle(items) { const a=[...items]; for(let i=a.length-1;i>0;i--){const j=crypto.randomInt(i+1);[a[i],a[j]]=[a[j],a[i]];} return a; }
function duelPool(selections={}) {
  return ALL_PLAYERS.filter(player => {
    if (selections.period && selections.period !== 'all') {
      const [a,b] = selections.period.split('-').map(Number);
      if (!(player.activeStart <= b && player.activeEnd >= a)) return false;
    }
    if (selections.nationality && selections.nationality !== 'all' && player.nationality !== selections.nationality) return false;
    if (selections.league && selections.league !== 'all' && !(player.leagues || []).includes(selections.league)) return false;
    if (selections.rating && selections.rating !== 'all') { const [a,b]=selections.rating.split('-').map(Number); if (player.rating<a || player.rating>b) return false; }
    return true;
  });
}
function nextDuelCandidates(duel) {
  const side=duel.turn, slot=SLOTS[duel.picks[side].length], used=new Set(duel.picks.flat().map(p=>p.id));
  let pool=duelPool(duel.selections).filter(p=>!used.has(p.id));
  if (duel.selections.style==='legends') pool.sort((a,b)=>b.rating-a.rating);
  else if (duel.selections.style==='modern') pool.sort((a,b)=>b.activeEnd-a.activeEnd || b.rating-a.rating);
  else if (duel.selections.style==='surprise') pool=shuffle(pool).sort((a,b)=>a.rating-b.rating);
  else pool=shuffle(pool);
  const compatible=pool.filter(p=>positionScore(slot,p)>0).sort((a,b)=>positionScore(slot,b)-positionScore(slot,a)||b.rating-a.rating);
  const combined=[...compatible,...pool.filter(p=>!compatible.includes(p))];
  const unique=[]; const ids=new Set(); for(const p of combined){if(!ids.has(p.id)){ids.add(p.id);unique.push(p);} if(unique.length===3)break;}
  return unique;
}
function safeDuelChoice(key, value) {
  const text=safeText(value,'all',40);
  if (key==='period' && text!=='all' && !/^\d{4}-\d{4}$/.test(text)) return null;
  if (key==='rating' && text!=='all' && !/^\d{2}-\d{2}$/.test(text)) return null;
  if (key==='style' && !['balanced','legends','modern','surprise'].includes(text)) return null;
  return text;
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
      startReady: [false, false],
      startDeadline: null,
      startTimer: null,
      lastBroadcastAt: 0,
      duel: null, rematchRequest: null, seriesHistory: null
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

  socket.on('room:duelRequest', (_payload, ack = () => {}) => {
    const room = currentRoom(socket);
    if (!room || room.phase !== 'lobby' || !room.players[0]?.connected || !room.players[1]?.connected) return ack({ ok:false, error:'İki oyuncu da lobide ve bağlı olmalı.' });
    room.duel = { status:'pending', phase:'request', requestedBy:socket.data.side, winner:null, turn:null, criteriaIndex:0, selections:{}, picks:[[],[]], candidates:[] };
    touch(room); ack({ok:true,duel:room.duel}); io.to(room.code).emit('room:duel', room.duel); emitLobby(io,room);
  });

  socket.on('room:duelRespond', (payload, ack = () => {}) => {
    const room=currentRoom(socket), duel=room?.duel;
    if (!room || !duel || duel.status!=='pending' || socket.data.side===duel.requestedBy) return ack({ok:false,error:'Bekleyen geçerli bir düello isteği yok.'});
    if (!payload?.accept) { room.duel=null; touch(room); ack({ok:true,rejected:true}); io.to(room.code).emit('room:duel', null); emitLobby(io,room); return; }
    duel.status='accepted'; duel.phase='coin'; touch(room); ack({ok:true,duel}); io.to(room.code).emit('room:duel',duel); emitLobby(io,room);
  });

  socket.on('duel:flip', (_payload, ack = () => {}) => {
    const room=currentRoom(socket), duel=room?.duel;
    if (!duel || duel.phase!=='coin') return ack({ok:false,error:'Yazı tura aşaması açık değil.'});
    if (socket.data.side!==duel.requestedBy) return ack({ok:false,error:'Yazı turayı düelloyu öneren oyuncu atmalı.'});
    duel.winner=crypto.randomInt(2); duel.turn=duel.winner; duel.phase='criteria'; duel.criteriaIndex=0;
    touch(room); ack({ok:true,duel}); io.to(room.code).emit('room:duel',duel); emitLobby(io,room);
  });

  socket.on('duel:criterion', (payload, ack = () => {}) => {
    const room=currentRoom(socket), duel=room?.duel;
    if (!duel || duel.phase!=='criteria' || socket.data.side!==duel.turn) return ack({ok:false,error:'Kriter sırası sende değil.'});
    const key=DUEL_KEYS[duel.criteriaIndex]; const value=safeDuelChoice(key,payload?.value);
    if (!value) return ack({ok:false,error:'Geçersiz kriter.'});
    duel.selections[key]=value; duel.criteriaIndex+=1;
    if (duel.criteriaIndex>=DUEL_KEYS.length) {
      let pool=duelPool(duel.selections);
      if (pool.length<22 || !pool.some(p=>p.position==='GK')) duel.selections={period:'all',nationality:'all',league:'all',rating:'all',style:duel.selections.style||'balanced'};
      duel.phase='picks'; duel.turn=duel.winner; duel.candidates=nextDuelCandidates(duel);
    } else duel.turn=duel.turn===0?1:0;
    touch(room); ack({ok:true,duel}); io.to(room.code).emit('room:duel',duel); emitLobby(io,room);
  });

  socket.on('duel:pick', (payload, ack = () => {}) => {
    const room=currentRoom(socket), duel=room?.duel;
    if (!duel || duel.phase!=='picks' || socket.data.side!==duel.turn) return ack({ok:false,error:'Transfer sırası sende değil.'});
    const player=duel.candidates.find(p=>p.id===payload?.playerId); if(!player) return ack({ok:false,error:'Bu futbolcu mevcut üç aday arasında değil.'});
    const side=duel.turn, slot=SLOTS[duel.picks[side].length]; duel.picks[side].push({...player,slot});
    if (duel.picks[0].length===11 && duel.picks[1].length===11) {
      duel.phase='done'; duel.candidates=[];
      room.players[0].team={name:`${room.players[0].name} XI`,lineup:duel.picks[0]}; room.players[1].team={name:`${room.players[1].name} XI`,lineup:duel.picks[1]};
    } else {
      duel.turn=side===0?1:0; if(duel.picks[duel.turn].length>=11)duel.turn=side; duel.candidates=nextDuelCandidates(duel);
    }
    touch(room); ack({ok:true,duel,lobby:lobbyPayload(room)}); io.to(room.code).emit('room:duel',duel); emitLobby(io,room);
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

  const openBrief = (ack = () => {}) => {
    const room = currentRoom(socket);
    if (!room || !isHost(socket)) return ack({ ok: false, error: 'Kural ekranını yalnızca oda sahibi açabilir.' });
    if (room.phase !== 'lobby') return ack({ ok: false, error: 'Oda artık lobi aşamasında değil.' });
    if (!canPrepareMatch(room)) return ack({ ok: false, error: 'İki takım hazır ve iki oyuncu bağlı olmalı.' });
    room.phase = 'brief';
    room.startReady = [false, false];
    room.startDeadline = null;
    clearStartTimer(room);
    touch(room);
    const lobby = lobbyPayload(room);
    ack({ ok: true, lobby });
    io.to(room.code).emit('room:brief', { lobby });
    emitLobby(io, room);
  };

  socket.on('room:openBrief', (_payload, ack = () => {}) => openBrief(ack));
  socket.on('room:start', (_payload, ack = () => {}) => openBrief(ack));

  socket.on('room:readyStart', (_payload, ack = () => {}) => {
    const room = currentRoom(socket);
    if (!room || room.phase !== 'brief') return ack({ ok: false, error: 'Kural brifingi açık değil.' });
    if (!canPrepareMatch(room)) return ack({ ok: false, error: 'İki oyuncu da bağlı ve kadrolar hazır olmalı.' });
    const side = socket.data.side;
    room.startReady[side] = true;
    if (!room.startDeadline) scheduleBriefDeadline(io, room);
    touch(room);
    const lobby = lobbyPayload(room);
    ack({ ok: true, lobby });
    emitLobby(io, room);
    if (room.startReady[0] && room.startReady[1]) beginRoomMatch(io, room);
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
    if (!room?.match || room.phase !== 'match') return ack({ ok: false, error: 'Aktif maç bulunamadı.' });
    const result = Engine.togglePause(room.match, socket.data.side, Date.now());
    if (!result.ok) return ack(result);
    touch(room);
    ack(result);
    io.to(room.code).emit('match:state', { match: room.match, serverNow: Date.now() });
  });

  socket.on('room:rematchRequest', (payload, ack = () => {}) => {
    const room=currentRoom(socket);
    if(!room?.match || room.match.phase!=='finished') return ack({ok:false,error:'Önce mevcut maç bitmeli.'});
    const winner=room.match.winnerSide;
    if(Number.isInteger(winner) && socket.data.side===winner) return ack({ok:false,error:'Rövanş isteğini yalnız mağlup oyuncu gönderebilir.'});
    const type=payload?.type==='secondLeg'?'secondLeg':'simple';
    room.rematchRequest={from:socket.data.side,type,firstLegScores:[...room.match.scores],firstTeams:[room.players[0].team.name,room.players[1].team.name]};
    touch(room); ack({ok:true,request:room.rematchRequest}); io.to(room.code).emit('room:rematchRequest',room.rematchRequest); emitLobby(io,room);
  });

  socket.on('room:rematchRespond', (payload, ack = () => {}) => {
    const room=currentRoom(socket), request=room?.rematchRequest;
    if(!room || !request || request.from===socket.data.side) return ack({ok:false,error:'Yanıtlanacak rövanş isteği yok.'});
    if(!payload?.accept){room.rematchRequest=null;touch(room);ack({ok:true,rejected:true});io.to(room.code).emit('room:rematchResult',{accepted:false});emitLobby(io,room);return;}
    const oldMatch=room.match;
    room.rematchRequest=null; clearStartTimer(room); room.startReady=[false,false]; room.startDeadline=null;
    if(request.type==='secondLeg'){
      swapRoomSides(io,room);
      room.pendingSeries={type:'twoLeg',leg:2,firstLegScores:[...request.firstLegScores],aggregateBase:[request.firstLegScores[1],request.firstLegScores[0]],firstTeams:[...request.firstTeams]};
    } else room.pendingSeries=null;
    room.match=null; room.phase='brief'; touch(room);
    const lobby=lobbyPayload(room); ack({ok:true,lobby}); io.to(room.code).emit('room:rematchResult',{accepted:true,type:request.type,lobby}); io.to(room.code).emit('room:brief',{lobby}); emitLobby(io,room);
  });

  socket.on('room:leave', () => {
    const room = currentRoom(socket);
    if (!room) return;
    const side = socket.data.side;
    if (room.phase === 'lobby' || room.phase === 'brief') {
      if (side === 0) {
        io.to(room.code).emit('room:closed', { reason: 'Oda sahibi ayrıldı.' });
        clearStartTimer(room);
        rooms.delete(room.code);
      } else {
        room.players[1] = null;
        if (room.phase === 'brief') {
          clearStartTimer(room);
          room.phase = 'lobby';
          room.startReady = [false, false];
          room.startDeadline = null;
        }
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
    if (now - room.updatedAt > ttl) { clearStartTimer(room); rooms.delete(code); }
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

