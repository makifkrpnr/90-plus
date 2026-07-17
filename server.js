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
// Test ortamında süreleri kısaltabilmek için ayarlanabilir gecikmeler
const QUAD_STAGE_DELAY_MS = Number(process.env.QUAD_STAGE_DELAY_MS) || 15000;
const DUEL_GRACE_MS = Number(process.env.DUEL_GRACE_MS) || 10000;
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
  const color = /^#[0-9a-f]{6}$/i.test(String(raw.color || '')) ? String(raw.color) : null;
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
  return { name: safeText(raw.name, '90+ XI', 22), color, lineup };
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
  if (!player) return { side, present: false, connected: false, ready: false, name: side === 0 ? 'Ev sahibi' : 'Misafir', teamName: null, teamColor: null };
  return {
    side,
    present: true,
    connected: player.connected,
    ready: Boolean(player.team),
    name: player.name,
    teamName: player.team?.name || null,
    teamColor: player.team?.color || null
  };
}

function isQuad(room) { return room?.mode === 'quad'; }
function roomCapacity(room) { return isQuad(room) ? 4 : 2; }

function quadPublicState(room) {
  if (!room.quad) return null;
  const q = room.quad;
  return {
    stage: q.stage,
    elimination: q.elimination,
    squadMethod: q.squadMethod,
    pairs: q.pairs || q.duelOrder || null,
    bracket: q.bracket || null,
    podium: q.podium || null,
    stats: q.stats || null,
    nextStageAt: q.nextStageAt || null
  };
}

function lobbyPayload(room) {
  return {
    code: room.code,
    mode: room.mode || 'duo',
    phase: room.phase,
    players: room.players.map((player, side) => playerSummary(player, side)),
    settings: room.settings,
    startReady: Array.isArray(room.startReady) ? [...room.startReady] : [false, false],
    startDeadline: room.startDeadline || null,
    canStart: isQuad(room)
      ? room.players.every(player => player?.team && player?.connected) && room.phase === 'lobby'
      : Boolean(room.players[0]?.team && room.players[1]?.team && room.players[0]?.connected && room.players[1]?.connected && room.phase === 'lobby'),
    createdAt: room.createdAt,
    duel: room.duel ? JSON.parse(JSON.stringify(room.duel)) : null,
    rematchRequest: room.rematchRequest || null,
    quad: quadPublicState(room)
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
function periodMatchesAny(player, periodValue) {
  if (!periodValue || periodValue === 'all') return true;
  return String(periodValue).split(',').some(part => {
    const [a, b] = part.trim().split('-').map(Number);
    return Number.isFinite(a) && Number.isFinite(b) && player.activeStart <= b && player.activeEnd >= a;
  });
}
function duelPool(selections={}) {
  return ALL_PLAYERS.filter(player => {
    if (!periodMatchesAny(player, selections.period)) return false;
    if (selections.nationality && selections.nationality !== 'all' && player.nationality !== selections.nationality) return false;
    if (selections.league && selections.league !== 'all' && !(player.leagues || []).includes(selections.league)) return false;
    if (selections.rating && selections.rating !== 'all') { const [a,b]=selections.rating.split('-').map(Number); if (player.rating<a || player.rating>b) return false; }
    return true;
  });
}
// Her turda taze adaylar: gösterilenler tekrar gelmez, mevki havuzu tükenirse geçmiş sıfırlanır.
function nextDuelCandidates(duel) {
  const side=duel.turn, slot=SLOTS[duel.picks[side].length];
  const used=new Set([...duel.picks.flat().map(p=>p.id), ...(duel.usedIds || [])]);
  duel.shownIds = Array.isArray(duel.shownIds) ? duel.shownIds : [];
  const shown = new Set(duel.shownIds);
  const pool = duelPool(duel.selections).filter(p=>!used.has(p.id));
  let compatible = pool.filter(p=>positionScore(slot,p)>0);
  if (!compatible.length) compatible = pool;
  let fresh = compatible.filter(p=>!shown.has(p.id));
  if (fresh.length < 3) {
    compatible.forEach(p => shown.delete(p.id));
    fresh = compatible;
  }
  let ranked = shuffle(fresh);
  if (duel.selections.style==='legends') ranked = ranked.sort((a,b)=>b.rating-a.rating).slice(0,12);
  else if (duel.selections.style==='modern') ranked = ranked.sort((a,b)=>b.activeEnd-a.activeEnd || b.rating-a.rating).slice(0,12);
  else if (duel.selections.style==='surprise') ranked = ranked.sort((a,b)=>a.rating-b.rating).slice(0,12);
  ranked = shuffle(ranked);
  const unique=[]; const ids=new Set();
  for (const p of ranked) { if(!ids.has(p.id)){ids.add(p.id);unique.push(p);} if(unique.length===3)break; }
  unique.forEach(p => shown.add(p.id));
  duel.shownIds = [...shown];
  duel.digitMap = shuffle(Array.from({ length: 10 }, (_, d) => d % Math.max(1, unique.length)));
  return unique;
}
function safeDuelChoice(key, value) {
  const text=safeText(value,'all',40);
  if (key==='period' && text!=='all') {
    const parts = text.split(',');
    if (parts.length > 2 || !parts.every(part => /^\d{4}-\d{4}$/.test(part.trim()))) return null;
  }
  if (key==='rating' && text!=='all' && !/^\d{2}-\d{2}$/.test(text)) return null;
  if (key==='style' && !['balanced','legends','modern','surprise'].includes(text)) return null;
  return text;
}

// ---------------------------------------------------------------------------
// 4'lü turnuva yardımcıları
// ---------------------------------------------------------------------------
const QUAD_COLORS = ['#d44735', '#2878c8', '#2f8a5b', '#d8a91e', '#704aa1', '#d46f2a'];

function duelRoomSide(duel, turn) {
  return Array.isArray(duel?.sides) ? duel.sides[turn] : turn;
}

function duelParticipant(duel, side) {
  if (!duel) return false;
  return Array.isArray(duel.sides) ? duel.sides.includes(side) : (side === 0 || side === 1);
}

function clearDuelGrace(room) {
  if (room?.duelGraceTimer) clearTimeout(room.duelGraceTimer);
  if (room) room.duelGraceTimer = null;
}

function pauseDuelForSide(io, room, side) {
  const duel = room.duel;
  if (!duel || duel.status === 'pending' || duel.phase === 'done' || duel.paused) return;
  if (!duelParticipant(duel, side)) return; // seyirci ayrılırsa düello etkilenmez
  duel.paused = true;
  duel.pausedBy = side;
  duel.pausedName = room.players[side]?.name || 'Oyuncu';
  duel.deadline = Date.now() + DUEL_GRACE_MS;
  clearDuelGrace(room);
  room.duelGraceTimer = setTimeout(() => {
    if (room.duel === duel && duel.paused) {
      room.duel = null;
      if (room.quad) { room.quad.squadMethod = null; room.quad.duelOrder = null; }
      io.to(room.code).emit('room:duel', null);
      io.to(room.code).emit('room:notice', { text: 'Düello iptal edildi — oyuncu 10 saniye içinde geri dönmedi.' });
      emitLobby(io, room);
    }
  }, DUEL_GRACE_MS + 100);
  room.duelGraceTimer.unref?.();
  touch(room);
  io.to(room.code).emit('room:duel', duel);
  emitLobby(io, room);
}

function resumeDuelForSide(io, room, side) {
  const duel = room.duel;
  if (!duel || !duel.paused || duel.pausedBy !== side) return;
  clearDuelGrace(room);
  duel.paused = false;
  duel.pausedBy = null;
  duel.pausedName = null;
  duel.deadline = null;
  touch(room);
  io.to(room.code).emit('room:duel', duel);
  emitLobby(io, room);
}

function assignQuadColors(room) {
  const used = new Set();
  room.players.forEach(player => { if (player?.team?.color) used.add(player.team.color); });
  room.players.forEach((player, index) => {
    if (!player?.team) return;
    if (!player.team.color || [...used].filter(c => c === player.team.color).length > 1) {
      const free = QUAD_COLORS.find(color => !used.has(color)) || QUAD_COLORS[index % QUAD_COLORS.length];
      player.team.color = free;
      used.add(free);
    }
  });
}

function buildQuadRandomSquads(room) {
  const used = new Set();
  room.players.forEach(player => {
    if (!player) return;
    const lineup = [];
    for (const slot of SLOTS) {
      const compatible = shuffle(ALL_PLAYERS.filter(p => !used.has(p.id) && positionScore(slot, p) > 0)).slice(0, 8);
      const pick = compatible[0] || shuffle(ALL_PLAYERS.filter(p => !used.has(p.id)))[0];
      if (!pick) break;
      used.add(pick.id);
      lineup.push({ ...pick, slot });
    }
    player.team = { name: `${player.name} XI`, color: player.team?.color || null, lineup };
  });
  assignQuadColors(room);
}

function startQuadDuel(io, room, pairIndex) {
  clearDuelGrace(room);
  const pair = room.quad.duelOrder[pairIndex];
  room.duel = {
    status: 'accepted', phase: 'coin', requestedBy: pair[0], sides: [...pair], pairIndex,
    winner: null, turn: null, criteriaIndex: 0, selections: {}, picks: [[], []], candidates: [], shownIds: [],
    usedIds: [...room.quad.usedIds]
  };
  io.to(room.code).emit('room:duel', room.duel);
}

function quadMatchSettings(room) {
  return { ...room.settings, shootout: true, extraTime: true };
}

function quadEntryFor(room, side) {
  return room.matches?.find(entry => entry.sides.includes(side) && entry.match && entry.match.phase !== 'finished') ||
    room.matches?.find(entry => entry.sides.includes(side)) || null;
}

function sendQuadMatch(io, room, entry, event) {
  const now = Date.now();
  entry.sides.forEach((roomSide, matchSide) => {
    const client = io.sockets.sockets.get(room.players[roomSide]?.socketId);
    if (client) client.emit(event, { match: entry.match, serverNow: now, matchId: entry.id, yourSide: matchSide });
  });
}

function quadBracket(room) {
  const name = side => room.players[side]?.name || `Oyuncu ${side + 1}`;
  const entrySummary = entry => ({
    id: entry.id, stage: entry.stage, leg: entry.leg || 1,
    sides: entry.sides, names: entry.sides.map(name),
    scores: entry.match ? [...entry.match.scores] : null,
    aggregate: entry.match?.series?.aggregateBase ? [entry.match.series.aggregateBase[0] + entry.match.scores[0], entry.match.series.aggregateBase[1] + entry.match.scores[1]] : null,
    shootout: entry.match?.shootout ? [...entry.match.shootout.scores] : null,
    finished: entry.match?.phase === 'finished',
    winner: Number.isInteger(entry.winner) ? entry.winner : null,
    winnerName: Number.isInteger(entry.winner) ? name(entry.winner) : null
  });
  return { history: (room.quad.matchHistory || []).map(entrySummary), current: (room.matches || []).map(entrySummary) };
}

function beginQuadMatches(io, room, entries) {
  room.matches = entries;
  room.phase = 'match';
  room.quad.nextStageAt = null;
  entries.forEach(entry => sendQuadMatch(io, room, entry, 'match:start'));
  room.quad.bracket = quadBracket(room);
  emitLobby(io, room);
}

function makeQuadEntry(room, id, stage, sides, leg = 1, series = null) {
  return {
    id, stage, leg, sides: [...sides], winner: null,
    match: Engine.createMatch([room.players[sides[0]].team, room.players[sides[1]].team], quadMatchSettings(room), Date.now(), series)
  };
}

function scheduleQuadStage(io, room, delayMs, starter) {
  clearTimeout(room.quad.stageTimer);
  room.quad.nextStageAt = Date.now() + delayMs;
  room.quad.bracket = quadBracket(room);
  io.to(room.code).emit('quad:stage', { quad: quadPublicState(room), lobby: lobbyPayload(room) });
  emitLobby(io, room);
  room.quad.stageTimer = setTimeout(() => starter(), delayMs);
  room.quad.stageTimer.unref?.();
}

function computeQuadStats(room) {
  const totals = new Map();
  const allEntries = [...(room.quad.matchHistory || []), ...(room.matches || [])];
  const seen = new Set();
  allEntries.forEach(entry => {
    if (!entry.match || seen.has(entry)) return;
    seen.add(entry);
    entry.match.teams.forEach(team => team.lineup.forEach(player => {
      const goals = Number(player.goals) || 0;
      if (!goals) return;
      const record = totals.get(player.id) || { id: player.id, name: player.name, team: team.name, goals: 0 };
      record.goals += goals;
      record.team = team.name;
      totals.set(player.id, record);
    }));
  });
  const scorers = [...totals.values()].sort((a, b) => b.goals - a.goals).slice(0, 6);
  const cards = { yellow: 0, red: 0 };
  allEntries.forEach(entry => (entry.match?.events || []).forEach(event => {
    if (event.type === 'yellow') cards.yellow += 1;
    if (event.type === 'red' || event.type === 'secondYellow') cards.red += 1;
  }));
  const totalGoals = [...totals.values()].reduce((sum, r) => sum + r.goals, 0);
  return { scorers, cards, totalGoals, matches: allEntries.length };
}

function advanceQuad(io, room) {
  const q = room.quad;
  if (!room.matches || room.matches.some(entry => entry.match.phase !== 'finished')) return;
  room.matches.forEach(entry => {
    if (!Number.isInteger(entry.winner)) entry.winner = entry.sides[entry.match.winnerSide ?? 0];
  });
  q.matchHistory = (q.matchHistory || []).concat(room.matches);

  if (q.stage === 'semis' && q.elimination === 'twoLeg') {
    const legOne = room.matches;
    q.stage = 'semis2';
    scheduleQuadStage(io, room, QUAD_STAGE_DELAY_MS, () => {
      const entries = legOne.map((entry, index) => {
        const base = [entry.match.scores[1], entry.match.scores[0]];
        const series = { type: 'twoLeg', leg: 2, firstLegScores: [...entry.match.scores], aggregateBase: base };
        return makeQuadEntry(room, index + 2, 'semi', [entry.sides[1], entry.sides[0]], 2, series);
      });
      beginQuadMatches(io, room, entries);
    });
    return;
  }

  if (q.stage === 'semis' || q.stage === 'semis2') {
    const semis = room.matches;
    const winners = semis.map(entry => entry.winner);
    const losers = semis.map(entry => entry.sides.find(side => side !== entry.winner));
    q.stage = 'break';
    room.matches = null;
    scheduleQuadStage(io, room, QUAD_STAGE_DELAY_MS, () => {
      q.stage = 'finals';
      beginQuadMatches(io, room, [
        makeQuadEntry(room, 10, 'final', winners),
        makeQuadEntry(room, 11, 'third', losers)
      ]);
    });
    return;
  }

  if (q.stage === 'finals') {
    const finalEntry = room.matches.find(entry => entry.stage === 'final');
    const thirdEntry = room.matches.find(entry => entry.stage === 'third');
    const name = side => room.players[side]?.name || `Oyuncu ${side + 1}`;
    q.stage = 'done';
    room.phase = 'finished';
    q.podium = {
      champion: { side: finalEntry.winner, name: name(finalEntry.winner) },
      runnerUp: { side: finalEntry.sides.find(s => s !== finalEntry.winner), name: name(finalEntry.sides.find(s => s !== finalEntry.winner)) },
      third: { side: thirdEntry.winner, name: name(thirdEntry.winner) }
    };
    q.stats = computeQuadStats(room);
    q.bracket = quadBracket(room);
    room.matches = null;
    io.to(room.code).emit('quad:podium', { quad: quadPublicState(room), lobby: lobbyPayload(room) });
    emitLobby(io, room);
  }
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
    const mode = payload?.mode === 'quad' ? 'quad' : 'duo';
    const code = randomCode();
    const room = {
      code,
      mode,
      phase: 'lobby',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      players: mode === 'quad' ? [null, null, null, null] : [null, null],
      settings: validateSettings(null),
      match: null,
      matches: null,
      startReady: [false, false],
      startDeadline: null,
      startTimer: null,
      lastBroadcastAt: 0,
      duel: null, rematchRequest: null, seriesHistory: null,
      quad: mode === 'quad' ? { stage: 'lobby', elimination: 'single', squadMethod: null, duelOrder: null, usedIds: [], pairs: null, bracket: null, podium: null, stats: null, nextStageAt: null, stageTimer: null } : null
    };
    rooms.set(code, room);
    attachPlayer(socket, room, 0, { token, name, team: null, connected: true, socketId: socket.id });
    ack({ ok: true, code, side: 0, mode, lobby: lobbyPayload(room) });
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
      side = room.players.findIndex(player => !player);
      if (side < 0) return ack({ ok: false, error: 'Oda dolu.' });
      room.players[side] = { token, name, team: null, connected: true, socketId: socket.id };
    }
    const player = room.players[side];
    player.name = name || player.name;
    attachPlayer(socket, room, side, player);
    const entry = isQuad(room) ? quadEntryFor(room, side) : null;
    ack({ ok: true, code, side, mode: room.mode || 'duo', lobby: lobbyPayload(room), match: entry ? entry.match : room.match, matchId: entry ? entry.id : null, yourSide: entry ? entry.sides.indexOf(side) : side });
    emitLobby(io, room);
    if (room.match && !isQuad(room)) socket.emit('match:state', { match: room.match, serverNow: Date.now() });
    if (entry) socket.emit('match:state', { match: entry.match, serverNow: Date.now(), matchId: entry.id, yourSide: entry.sides.indexOf(side) });
  });

  socket.on('room:submitTeam', (payload, ack = () => {}) => {
    const room = currentRoom(socket);
    if (!room || room.code !== normalizeCode(payload?.code)) return ack({ ok: false, error: 'Oda bağlantısı bulunamadı.' });
    if (isQuad(room)) return ack({ ok: false, error: '4\'lü turnuvada kadrolar oda yöneticisinin seçtiği yöntemle kurulur.' });
    if (room.phase !== 'lobby') return ack({ ok: false, error: 'Maç başladıktan sonra kadro değiştirilemez.' });
    const team = validateTeam(payload?.team);
    if (!team) return ack({ ok: false, error: 'Kadro 11 benzersiz oyuncudan ve bir kaleciden oluşmalı.' });
    const opponent = room.players[socket.data.side === 0 ? 1 : 0];
    if (team.color && opponent?.team?.color === team.color) return ack({ ok: false, error: 'Bu takım rengini rakibin seçti. Başka bir renk seç.' });
    room.players[socket.data.side].team = team;
    touch(room);
    ack({ ok: true, lobby: lobbyPayload(room) });
    emitLobby(io, room);
  });

  socket.on('room:duelRequest', (_payload, ack = () => {}) => {
    const room = currentRoom(socket);
    if (!room || room.phase !== 'lobby' || !room.players[0]?.connected || !room.players[1]?.connected) return ack({ ok:false, error:'İki oyuncu da lobide ve bağlı olmalı.' });
    room.duel = { status:'pending', phase:'request', requestedBy:socket.data.side, winner:null, turn:null, criteriaIndex:0, selections:{}, picks:[[],[]], candidates:[], shownIds:[] };
    touch(room); ack({ok:true,duel:room.duel}); io.to(room.code).emit('room:duel', room.duel); emitLobby(io,room);
  });

  socket.on('room:duelRespond', (payload, ack = () => {}) => {
    const room=currentRoom(socket), duel=room?.duel;
    if (!room || !duel || duel.status!=='pending' || socket.data.side===duel.requestedBy) return ack({ok:false,error:'Bekleyen geçerli bir düello isteği yok.'});
    if (!payload?.accept) { clearDuelGrace(room); room.duel=null; touch(room); ack({ok:true,rejected:true}); io.to(room.code).emit('room:duel', null); emitLobby(io,room); return; }
    duel.status='accepted'; duel.phase='coin'; touch(room); ack({ok:true,duel}); io.to(room.code).emit('room:duel',duel); emitLobby(io,room);
  });

  socket.on('duel:flip', (_payload, ack = () => {}) => {
    const room=currentRoom(socket), duel=room?.duel;
    if (!duel || duel.phase!=='coin') return ack({ok:false,error:'Yazı tura aşaması açık değil.'});
    if (duel.paused) return ack({ok:false,error:'Düello duraklatıldı; oyuncunun dönmesi bekleniyor.'});
    if (socket.data.side!==duel.requestedBy) return ack({ok:false,error:'Yazı turayı düelloyu öneren oyuncu atmalı.'});
    duel.winner=crypto.randomInt(2); duel.turn=duel.winner; duel.phase='criteria'; duel.criteriaIndex=0;
    touch(room); ack({ok:true,duel}); io.to(room.code).emit('room:duel',duel); emitLobby(io,room);
  });

  socket.on('duel:criterion', (payload, ack = () => {}) => {
    const room=currentRoom(socket), duel=room?.duel;
    if (!duel || duel.phase!=='criteria' || socket.data.side!==duelRoomSide(duel, duel.turn)) return ack({ok:false,error:'Kriter sırası sende değil.'});
    if (duel.paused) return ack({ok:false,error:'Düello duraklatıldı; oyuncunun dönmesi bekleniyor.'});
    const key=DUEL_KEYS[duel.criteriaIndex]; const value=safeDuelChoice(key,payload?.value);
    if (!value) return ack({ok:false,error:'Geçersiz kriter.'});
    duel.selections[key]=value; duel.criteriaIndex+=1;
    if (duel.criteriaIndex>=DUEL_KEYS.length) {
      const blocked = new Set(duel.usedIds || []);
      let pool=duelPool(duel.selections).filter(p=>!blocked.has(p.id));
      if (pool.length<22 || !pool.some(p=>p.position==='GK')) duel.selections={period:'all',nationality:'all',league:'all',rating:'all',style:duel.selections.style||'balanced'};
      duel.phase='picks'; duel.turn=duel.winner; duel.candidates=nextDuelCandidates(duel);
    } else duel.turn=duel.turn===0?1:0;
    touch(room); ack({ok:true,duel}); io.to(room.code).emit('room:duel',duel); emitLobby(io,room);
  });

  socket.on('duel:pick', (payload, ack = () => {}) => {
    const room=currentRoom(socket), duel=room?.duel;
    if (!duel || duel.phase!=='picks' || socket.data.side!==duelRoomSide(duel, duel.turn)) return ack({ok:false,error:'Transfer sırası sende değil.'});
    if (duel.paused) return ack({ok:false,error:'Düello duraklatıldı; oyuncunun dönmesi bekleniyor.'});
    let player = null;
    if (Number.isFinite(Number(payload?.digit)) && duel.candidates.length) {
      const digit = Math.abs(Math.trunc(Number(payload.digit))) % 10;
      const mapped = Array.isArray(duel.digitMap) && duel.digitMap.length === 10 ? duel.digitMap[digit] : digit % duel.candidates.length;
      player = duel.candidates[Math.min(duel.candidates.length - 1, Math.max(0, Number(mapped) || 0))];
    } else {
      player = duel.candidates.find(p=>p.id===payload?.playerId);
    }
    if(!player) return ack({ok:false,error:'Bu futbolcu mevcut üç aday arasında değil.'});
    const side=duel.turn, slot=SLOTS[duel.picks[side].length]; duel.picks[side].push({...player,slot});
    if (duel.picks[0].length===11 && duel.picks[1].length===11) {
      duel.phase='done'; duel.candidates=[];
      const sideA = duelRoomSide(duel, 0), sideB = duelRoomSide(duel, 1);
      room.players[sideA].team={name:`${room.players[sideA].name} XI`,color:room.players[sideA].team?.color||null,lineup:duel.picks[0]};
      room.players[sideB].team={name:`${room.players[sideB].name} XI`,color:room.players[sideB].team?.color||null,lineup:duel.picks[1]};
      if (room.quad && Array.isArray(duel.sides)) {
        room.quad.usedIds.push(...duel.picks.flat().map(p=>p.id));
        assignQuadColors(room);
        if (duel.pairIndex === 0) {
          const finishedDuel = duel;
          io.to(room.code).emit('room:duel', finishedDuel);
          setTimeout(() => { if (rooms.get(room.code) === room && room.quad) { startQuadDuel(io, room, 1); emitLobby(io, room); } }, 5000);
          touch(room); ack({ok:true,duel,lobby:lobbyPayload(room)}); emitLobby(io,room);
          return;
        }
        room.duel = null;
        touch(room); ack({ok:true,duel,lobby:lobbyPayload(room)});
        io.to(room.code).emit('room:duel', duel);
        setTimeout(() => io.to(room.code).emit('room:duel', null), 4500);
        emitLobby(io,room);
        return;
      }
    } else {
      duel.turn=side===0?1:0; if(duel.picks[duel.turn].length>=11)duel.turn=side; duel.candidates=nextDuelCandidates(duel);
    }
    touch(room); ack({ok:true,duel,lobby:lobbyPayload(room)}); io.to(room.code).emit('room:duel',duel); emitLobby(io,room);
  });

  // ---- 4'lü turnuva olayları ----
  socket.on('quad:configure', (payload, ack = () => {}) => {
    const room = currentRoom(socket);
    if (!room || !isQuad(room) || !isHost(socket) || room.phase !== 'lobby') return ack({ ok: false, error: 'Turnuva ayarını yalnız oda yöneticisi lobide yapabilir.' });
    if (payload?.settings) room.settings = validateSettings(payload.settings);
    if (payload?.elimination) room.quad.elimination = payload.elimination === 'twoLeg' ? 'twoLeg' : 'single';
    touch(room); ack({ ok: true, lobby: lobbyPayload(room) }); emitLobby(io, room);
  });

  socket.on('quad:squadMethod', (payload, ack = () => {}) => {
    const room = currentRoom(socket);
    if (!room || !isQuad(room) || !isHost(socket) || room.phase !== 'lobby') return ack({ ok: false, error: 'Kadro yöntemini yalnız oda yöneticisi seçebilir.' });
    if (room.players.some(player => !player?.connected)) return ack({ ok: false, error: 'Dört oyuncu da odada ve bağlı olmalı.' });
    const method = payload?.method === 'duel' ? 'duel' : 'random';
    room.quad.squadMethod = method;
    room.quad.usedIds = [];
    if (method === 'random') {
      buildQuadRandomSquads(room);
      touch(room); ack({ ok: true, lobby: lobbyPayload(room) }); emitLobby(io, room);
      return;
    }
    const order = shuffle([0, 1, 2, 3]);
    room.quad.duelOrder = [[order[0], order[1]], [order[2], order[3]]];
    io.to(room.code).emit('quad:draw', { pairs: room.quad.duelOrder, names: room.players.map(p => p?.name || '—') });
    setTimeout(() => { if (rooms.get(room.code) === room && room.quad) { startQuadDuel(io, room, 0); emitLobby(io, room); } }, 6500);
    touch(room); ack({ ok: true, lobby: lobbyPayload(room) }); emitLobby(io, room);
  });

  socket.on('quad:start', (_payload, ack = () => {}) => {
    const room = currentRoom(socket);
    if (!room || !isQuad(room) || !isHost(socket) || room.phase !== 'lobby') return ack({ ok: false, error: 'Turnuvayı yalnız oda yöneticisi başlatabilir.' });
    if (room.players.some(player => !player?.team || !player?.connected)) return ack({ ok: false, error: 'Dört kadro da hazır ve dört oyuncu bağlı olmalı.' });
    const pairs = room.quad.duelOrder || (() => { const order = shuffle([0, 1, 2, 3]); return [[order[0], order[1]], [order[2], order[3]]]; })();
    room.quad.pairs = pairs;
    room.quad.stage = 'semis';
    beginQuadMatches(io, room, [makeQuadEntry(room, 0, 'semi', pairs[0]), makeQuadEntry(room, 1, 'semi', pairs[1])]);
    touch(room);
    ack({ ok: true, lobby: lobbyPayload(room) });
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
    if (isQuad(room)) return ack({ ok: false, error: '4\'lü turnuva doğrudan lobiden başlatılır.' });
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

  const withActiveMatch = (ack, handler) => {
    const room = currentRoom(socket);
    if (!room || room.phase !== 'match') return ack({ ok: false, error: 'Aktif maç bulunamadı.' });
    if (isQuad(room)) {
      const entry = quadEntryFor(room, socket.data.side);
      if (!entry?.match || entry.match.phase === 'finished') return ack({ ok: false, error: 'Aktif maç bulunamadı.' });
      const matchSide = entry.sides.indexOf(socket.data.side);
      return handler(room, entry.match, matchSide, () => sendQuadMatch(io, room, entry, 'match:state'));
    }
    if (!room.match) return ack({ ok: false, error: 'Aktif maç bulunamadı.' });
    return handler(room, room.match, socket.data.side, () => io.to(room.code).emit('match:state', { match: room.match, serverNow: Date.now() }));
  };

  socket.on('match:stop', (payload, ack = () => {}) => {
    withActiveMatch(ack, (room, matchState, side, broadcast) => {
      const result = Engine.stopRoll(matchState, side, payload?.digit, Date.now());
      if (!result.ok) return ack(result);
      touch(room);
      ack({ ok: true, digit: result.digit });
      broadcast();
    });
  });

  socket.on('match:startPeriod', (_payload, ack = () => {}) => {
    withActiveMatch(ack, (room, matchState, side, broadcast) => {
      const result = Engine.startWaitingPeriod(matchState, side, Date.now());
      if (!result.ok) return ack(result);
      touch(room);
      ack({ ok: true });
      broadcast();
    });
  });

  socket.on('match:pause', (_payload, ack = () => {}) => {
    withActiveMatch(ack, (room, matchState, side, broadcast) => {
      const result = Engine.togglePause(matchState, side, Date.now());
      if (!result.ok) return ack(result);
      touch(room);
      ack(result);
      broadcast();
    });
  });

  // Bilinçli maç terki: çıkan taraf hükmen kaybeder (bkz. docs/oyun-akisi.md 4.4/5.6)
  socket.on('match:forfeit', (_payload, ack = () => {}) => {
    withActiveMatch(ack, (room, matchState, side, broadcast) => {
      const result = Engine.forfeitMatch(matchState, side);
      if (!result.ok) return ack(result);
      if (!isQuad(room)) room.phase = 'finished';
      touch(room);
      ack({ ok: true });
      broadcast();
    });
  });

  // Düello grace sistemi: katılımcı ayrılırsa 10 sn içinde dönmezse düello iptal.
  socket.on('duel:stepOut', () => {
    const room = currentRoom(socket);
    if (room) pauseDuelForSide(io, room, socket.data.side);
  });

  socket.on('duel:stepBack', () => {
    const room = currentRoom(socket);
    if (room) resumeDuelForSide(io, room, socket.data.side);
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
        room.players[side] = null;
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
      pauseDuelForSide(io, room, side);
      emitLobby(io, room);
    }
  });
});

setInterval(() => {
  const now = Date.now();
  for (const room of rooms.values()) {
    if (room.match && room.phase === 'match' && !isQuad(room)) {
      const changed = Engine.tickMatch(room.match, now);
      if (room.match.phase === 'finished') room.phase = 'finished';
      if (changed || now - room.lastBroadcastAt >= 100) {
        room.lastBroadcastAt = now;
        io.to(room.code).emit('match:state', { match: room.match, serverNow: now });
      }
    }
    if (isQuad(room) && Array.isArray(room.matches) && room.phase === 'match') {
      let stageCheck = false;
      for (const entry of room.matches) {
        if (!entry.match) continue;
        if (entry.match.phase === 'finished' && entry.notified) continue;
        const changed = Engine.tickMatch(entry.match, now);
        if (changed || now - (entry.lastBroadcastAt || 0) >= 100) {
          entry.lastBroadcastAt = now;
          sendQuadMatch(io, room, entry, 'match:state');
        }
        if (entry.match.phase === 'finished' && !entry.notified) {
          entry.notified = true;
          entry.winner = entry.sides[entry.match.winnerSide ?? 0];
          stageCheck = true;
        }
      }
      if (stageCheck) advanceQuad(io, room);
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

