'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { Server } = require('socket.io');
const Engine = require('./server/online-engine.js');
const PlayerData = require('./data/players.json');
const ALL_PLAYERS = PlayerData.players;
const SLOTS = ['GK','LB','CB','CB','RB','DM','CM','AM','LW','RW','ST'];
const DUEL_KEYS = ['period','nationality','league','rating','style'];
const TEAM_COLORS=['#d44735','#172842','#2878c8','#5aa8d8','#2f8a5b','#d8a91e','#d46f2a','#704aa1','#242424','#e7e1d2'];

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
  const color=/^#[0-9a-f]{6}$/i.test(String(raw.color||''))?String(raw.color):null;
  return { name: safeText(raw.name, '90+ XI', 22), color, lineup };
}

function validateSettings(raw) {
  const colors = Array.isArray(raw?.teamColors) ? raw.teamColors.slice(0,4).map(value => /^#[0-9a-f]{6}$/i.test(String(value)) ? String(value) : null) : [];
  return {
    durationMinutes: Math.max(1, Math.min(10, Number(raw?.durationMinutes) || 5)), cards: raw?.cards !== false,
    injury: Boolean(raw?.injury), extraTime: raw?.extraTime !== false, shootout: raw?.shootout !== false,
    vibration: raw?.vibration !== false, eventDuration: ['normal','long','extra'].includes(raw?.eventDuration) ? raw.eventDuration : 'long',
    competition: ['single','twoLeg','fourCup'].includes(raw?.competition) ? raw.competition : 'single',
    teamColors: [colors[0] || TEAM_COLORS[0], colors[1] || TEAM_COLORS[1], colors[2] || TEAM_COLORS[2], colors[3] || TEAM_COLORS[3]]
  };
}

function playerSummary(player, side) {
  if (!player) return { side, present: false, connected: false, ready: false, name: `Oyuncu ${side+1}`, teamName: null };
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

function lobbyPayload(room) {
  const players=room.players.map((player,side)=>playerSummary(player,side));
  const connectedRequired=players.slice(0,room.maxPlayers).every(player=>player.present&&player.connected);
  const teamsReady=players.slice(0,room.maxPlayers).every(player=>player.ready);
  return {
    code: room.code, phase: room.phase, roomType: room.roomType, maxPlayers: room.maxPlayers, players,
    settings: room.settings, tournamentOptions: room.tournamentOptions || null,
    startReady: Array.isArray(room.startReady) ? [...room.startReady] : Array(room.maxPlayers).fill(false),
    startDeadline: room.startDeadline || null, canStart: Boolean(connectedRequired && teamsReady && room.phase === 'lobby'),
    createdAt: room.createdAt, duel: room.duel ? JSON.parse(JSON.stringify(room.duel)) : null,
    tournament: room.tournament ? tournamentPublic(room.tournament) : null, rematchRequest: room.rematchRequest || null
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

function canPrepareMatch(room) { return Boolean(room && room.players.slice(0,room.maxPlayers).every(player=>player?.team&&player.connected)); }


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
  if (room.roomType === 'four') return beginFourTournament(io, room);
  clearStartTimer(room);
  room.startReady = Array(room.maxPlayers).fill(false);
  room.startDeadline = null;
  const initialSeries = room.pendingSeries || (room.roomType === 'twoLeg' ? {type:'twoLeg',leg:1,firstLegScores:null,aggregateBase:[0,0]} : null);
  room.match = Engine.createMatch([room.players[0].team, room.players[1].team], room.settings, Date.now(), initialSeries);
  room.pendingSeries = null; room.phase = 'match'; touch(room);
  io.to(room.code).emit('match:start', { match: room.match, serverNow: Date.now() }); emitLobby(io, room); return true;
}

function scheduleAutomaticSecondLeg(io, room) {
  if (!room?.match || room.roomType !== 'twoLeg' || room.match.series?.leg !== 1 || room.interlegTimer) return false;
  const firstLegScores = [...room.match.scores];
  const firstTeams = [room.players[0]?.team?.name || 'İç saha', room.players[1]?.team?.name || 'Deplasman'];
  room.phase = 'interleg';
  room.seriesHistory = { firstLegScores, firstTeams };
  touch(room);
  io.to(room.code).emit('room:legComplete', { firstLegScores, firstTeams, nextLegInMs: 8000 });
  emitLobby(io, room);
  room.interlegTimer = setTimeout(() => {
    room.interlegTimer = null;
    if (!rooms.has(room.code) || !canPrepareMatch(room)) return;
    swapRoomSides(io, room);
    room.pendingSeries = {
      type: 'twoLeg', leg: 2,
      firstLegScores,
      firstTeams,
      aggregateBase: [firstLegScores[1], firstLegScores[0]]
    };
    room.match = null;
    room.phase = 'brief';
    beginRoomMatch(io, room);
  }, 8000);
  room.interlegTimer.unref?.();
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
function duelPeriodIds(value){if(!value||value==='all')return[];return String(value).split('+').filter(x=>/^\d{4}-\d{4}$/.test(x)).slice(0,2);}
function duelPool(selections={}) {
  const periods=duelPeriodIds(selections.period);
  return ALL_PLAYERS.filter(player => {
    if(periods.length&&!periods.some(period=>{const [a,b]=period.split('-').map(Number);return player.activeStart<=b&&player.activeEnd>=a;}))return false;
    if (selections.nationality && selections.nationality !== 'all' && player.nationality !== selections.nationality) return false;
    if (selections.league && selections.league !== 'all' && !(player.leagues || []).includes(selections.league)) return false;
    if (selections.rating && selections.rating !== 'all') { const [a,b]=selections.rating.split('-').map(Number); if (player.rating<a || player.rating>b) return false; }
    return true;
  });
}
function nextDuelCandidates(duel,globalUsed=[]) {
  const side=duel.turn, slot=SLOTS[duel.picks[side].length], used=new Set([...duel.picks.flat().map(p=>p.id),...globalUsed]);
  const shown=new Set(duel.shownIds||[]);
  let pool=duelPool(duel.selections).filter(p=>!used.has(p.id)&&!shown.has(p.id));
  if (duel.selections.style==='legends') pool.sort((a,b)=>b.rating-a.rating);
  else if (duel.selections.style==='modern') pool.sort((a,b)=>b.activeEnd-a.activeEnd || b.rating-a.rating);
  else if (duel.selections.style==='surprise') pool=shuffle(pool).sort((a,b)=>a.rating-b.rating);
  else pool=shuffle(pool);
  const compatible=pool.filter(p=>positionScore(slot,p)>0).sort((a,b)=>positionScore(slot,b)-positionScore(slot,a)||b.rating-a.rating);
  const combined=[...compatible,...pool.filter(p=>!compatible.includes(p))];
  let unique=[]; const ids=new Set(); for(const p of combined){if(!ids.has(p.id)){ids.add(p.id);unique.push(p);} if(unique.length===3)break;}
  if(unique.length<3){const fallback=shuffle(duelPool(duel.selections).filter(p=>!used.has(p.id)));for(const p of fallback){if(!ids.has(p.id)){ids.add(p.id);unique.push(p);}if(unique.length===3)break;}}
  duel.shownIds=[...shown,...unique.map(p=>p.id)];
  return unique;
}
function safeDuelChoice(key, value) {
  const text=safeText(value,'all',80);
  if (key==='period' && text!=='all' && !/^\d{4}-\d{4}(\+\d{4}-\d{4})?$/.test(text)) return null;
  if (key==='rating' && text!=='all' && !/^\d{2}-\d{2}$/.test(text)) return null;
  if (key==='style' && !['balanced','legends','modern','surprise'].includes(text)) return null;
  return text;
}


function createDuelState(seats,requestedBy,extra={}){
  return {status:extra.status||'accepted',phase:extra.phase||'coin',requestedBy,winner:null,turn:0,seats:[...seats],criteriaIndex:0,selections:{},picks:[[],[]],candidates:[],shownIds:[],pairs:extra.pairs||null,pairIndex:extra.pairIndex||0,coinDeadline:Date.now()+10000};
}
function activeDuelSeat(duel){return duel?.seats?.[duel.turn] ?? duel?.turn;}
function scheduleDuelCoin(io,room){
  clearTimeout(room.duelCoinTimer); if(!room.duel||room.duel.phase!=='coin')return;
  const expected=room.duel;
  room.duelCoinTimer=setTimeout(()=>{if(room.duel!==expected||expected.phase!=='coin')return;expected.winner=crypto.randomInt(2);expected.turn=expected.winner;expected.phase='criteria';expected.criteriaIndex=0;touch(room);io.to(room.code).emit('room:duel',expected);emitLobby(io,room);},10050);room.duelCoinTimer.unref?.();
}

function assignLineup(pool, excluded = new Set()) {
  const chosen=[];
  for(const slot of SLOTS){
    const candidates=pool.filter(player=>!excluded.has(player.id)&&!chosen.some(x=>x.id===player.id));
    candidates.sort((a,b)=>positionScore(slot,b)-positionScore(slot,a)||b.rating-a.rating);
    const top=candidates.slice(0,Math.min(30,candidates.length));
    const player=top.length?top[crypto.randomInt(top.length)]:candidates[0];
    if(!player)throw new Error('Yeterli oyuncu bulunamadı.');
    chosen.push({...player,slot}); excluded.add(player.id);
  }
  return chosen;
}
function assignUniqueRandomTeams(room){
  const used=new Set();
  room.players.slice(0,room.maxPlayers).forEach((player,index)=>{
    const lineup=assignLineup(ALL_PLAYERS,used);
    player.team={name:`${player.name} XI`,color:TEAM_COLORS[index%TEAM_COLORS.length],lineup};
  });
}
function fixturePublic(fixture){return {id:fixture.id,round:fixture.round,seats:[...fixture.seats],activeSeats:[...(fixture.activeSeats||fixture.seats)],status:fixture.status,leg:fixture.leg||1,legs:fixture.legs||1,aggregate:fixture.aggregate||[0,0],scores:fixture.match?[...fixture.match.scores]:(fixture.scores||[0,0]),winnerSeat:fixture.winnerSeat??null};}
function tournamentPublic(tournament){
  if(!tournament)return null;
  return {stage:tournament.stage,fixtures:tournament.fixtures.map(fixturePublic),podium:tournament.podium||null,stats:tournament.stats||{goals:{},assists:{},cards:{}}};
}
function emitTournament(io,room){io.to(room.code).emit('tournament:update',{tournament:tournamentPublic(room.tournament)});}
function emitFixtureMatch(io,room,fixture,event='match:start'){
  (fixture.activeSeats||fixture.seats).forEach((seat,localSide)=>{
    const player=room.players[seat]; if(!player?.socketId)return;
    const client=io.sockets.sockets.get(player.socketId);
    if(client)client.emit(event,{match:fixture.match,serverNow:Date.now(),fixtureId:fixture.id,localSide,tournament:tournamentPublic(room.tournament)});
  });
}
function currentFixtureForSeat(room,seat){return room?.tournament?.fixtures?.find(f=>f.status==='live'&&f.seats.includes(seat))||null;}
function matchTargetForSocket(room,socket){
  if(!room)return null;
  if(room.roomType==='four'){
    const fixture=currentFixtureForSeat(room,socket.data.side);
    if(!fixture?.match)return null;
    return {match:fixture.match,fixture,localSide:(fixture.activeSeats||fixture.seats).indexOf(socket.data.side)};
  }
  return room.match?{match:room.match,fixture:null,localSide:socket.data.side}:null;
}
function emitMatchTarget(io,room,target,event='match:state'){
  if(!target)return;
  if(target.fixture) emitFixtureMatch(io,room,target.fixture,event);
  else io.to(room.code).emit(event,{match:target.match,serverNow:Date.now()});
}
function finishDuelPair(io,room,duel){
  const seats=duel.seats||[0,1];
  for(let local=0;local<2;local+=1){
    const seat=seats[local];
    const player=room.players[seat];
    if(!player)continue;
    const color=TEAM_COLORS[seat%TEAM_COLORS.length];
    player.team={name:`${player.name} XI`,color,lineup:duel.picks[local].map((p,index)=>({...p,slot:p.slot||SLOTS[index]}))};
  }
  room.tournamentUsedIds=[...(room.tournamentUsedIds||[]),...duel.picks.flat().map(p=>p.id)];
  if(Array.isArray(duel.pairs)&&duel.pairIndex+1<duel.pairs.length){
    const nextIndex=duel.pairIndex+1;
    room.duel=createDuelState(duel.pairs[nextIndex],duel.pairs[nextIndex][0],{pairs:duel.pairs,pairIndex:nextIndex});
    scheduleDuelCoin(io,room);
    io.to(room.code).emit('room:duel',room.duel);
  }else{
    duel.phase='done';duel.candidates=[];
    room.duel=duel;
    io.to(room.code).emit('room:duel',duel);
  }
  touch(room);emitLobby(io,room);
}
function collectTournamentStats(tournament,fixture){
  if(!fixture?.match)return;
  for(const team of fixture.match.teams||[])for(const player of team.lineup||[]){
    if(player.goals)tournament.stats.goals[player.name]=(tournament.stats.goals[player.name]||0)+player.goals;
    if(player.assists)tournament.stats.assists[player.name]=(tournament.stats.assists[player.name]||0)+player.assists;
    if(player.yellowCards)tournament.stats.cards[player.name]=(tournament.stats.cards[player.name]||0)+player.yellowCards;
  }
}
function makeTournamentFixture(id,round,seats,room){
  const teams=seats.map(seat=>room.players[seat].team),legs=room.tournamentOptions?.legs===2?2:1;
  return {id,round,seats:[...seats],activeSeats:[...seats],status:'live',winnerSeat:null,scores:[],aggregate:[0,0],leg:1,legs,match:Engine.createMatch(teams,{...room.settings,competition:'single',extraTime:legs===1,shootout:legs===1},Date.now(),null)};
}
function beginFourTournament(io,room){
  if(!canPrepareMatch(room)||room.maxPlayers!==4)return false;
  const draw=shuffle([0,1,2,3]);
  room.tournament={stage:'semifinals',fixtures:[makeTournamentFixture('sf1','Yarı final 1',[draw[0],draw[1]],room),makeTournamentFixture('sf2','Yarı final 2',[draw[2],draw[3]],room)],stats:{goals:{},assists:{},cards:{}},podium:null};
  room.phase='tournament';touch(room);emitTournament(io,room);
  room.tournament.fixtures.forEach(f=>emitFixtureMatch(io,room,f));emitLobby(io,room);return true;
}
function resolveTournamentStage(io,room){
  const t=room.tournament;if(!t)return;
  if(t.stage==='semifinals'&&t.fixtures.filter(f=>f.round.startsWith('Yarı')).every(f=>f.status==='finished')){
    const semis=t.fixtures.filter(f=>f.round.startsWith('Yarı'));
    const winners=semis.map(f=>f.winnerSeat),losers=semis.map(f=>f.seats.find(s=>s!==f.winnerSeat));
    t.fixtures.push(makeTournamentFixture('final','Final',[winners[0],winners[1]],room));
    t.fixtures.push(makeTournamentFixture('third','3.lük',[losers[0],losers[1]],room));
    t.stage='finals';emitTournament(io,room);t.fixtures.filter(f=>f.status==='live').forEach(f=>emitFixtureMatch(io,room,f));return;
  }
  if(t.stage==='finals'&&t.fixtures.filter(f=>['Final','3.lük'].includes(f.round)).every(f=>f.status==='finished')){
    const final=t.fixtures.find(f=>f.id==='final'),third=t.fixtures.find(f=>f.id==='third');
    t.stage='finished';t.podium={champion:final.winnerSeat,runnerUp:final.seats.find(s=>s!==final.winnerSeat),third:third.winnerSeat};room.phase='finished';
    emitTournament(io,room);io.to(room.code).emit('tournament:complete',{tournament:tournamentPublic(t),players:room.players.map((p,i)=>({seat:i,name:p?.name,teamName:p?.team?.name}))});emitLobby(io,room);
  }
}
function finishTournamentFixture(io,room,fixture){
  if(!fixture||fixture.status==='finished')return;
  collectTournamentStats(room.tournament,fixture);
  if(fixture.legs===2&&fixture.leg===1){
    fixture.scores.push([...fixture.match.scores]);fixture.aggregate=[...fixture.match.scores];fixture.leg=2;fixture.activeSeats=[fixture.seats[1],fixture.seats[0]];
    const teams=fixture.activeSeats.map(seat=>room.players[seat].team);
    fixture.match=Engine.createMatch(teams,{...room.settings,competition:'single',extraTime:true,shootout:true},Date.now(),{type:'twoLeg',leg:2,aggregateBase:[fixture.aggregate[1],fixture.aggregate[0]]});
    fixture.status='live';emitTournament(io,room);emitFixtureMatch(io,room,fixture);return;
  }
  fixture.scores.push([...fixture.match.scores]);
  if(fixture.legs===2)fixture.aggregate=[fixture.aggregate[0]+fixture.match.scores[1],fixture.aggregate[1]+fixture.match.scores[0]];
  else fixture.aggregate=[...fixture.match.scores];
  fixture.status='finished';
  const active=fixture.activeSeats||fixture.seats;fixture.winnerSeat=fixture.match.winnerSide===0?active[0]:active[1];
  emitTournament(io,room);resolveTournamentStage(io,room);
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
    const roomType = ['single','twoLeg','four'].includes(payload?.roomType) ? payload.roomType : 'single';
    const maxPlayers = roomType === 'four' ? 4 : 2;
    const room = {
      code,
      phase: 'lobby',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      roomType, maxPlayers,
      players: Array(maxPlayers).fill(null),
      settings: validateSettings({competition:roomType==='twoLeg'?'twoLeg':roomType==='four'?'fourCup':'single'}),
      match: null,
      startReady: Array(maxPlayers).fill(false),
      startDeadline: null,
      startTimer: null,
      lastBroadcastAt: 0,
      interlegTimer: null,
      duel: null, tournament:null, tournamentOptions:null, tournamentUsedIds:[], rematchRequest: null, seriesHistory: null
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
      if (!['lobby','brief'].includes(room.phase)) return ack({ ok: false, error: 'Organizasyon başlamış; yeni oyuncu alınmıyor.' });
      side = room.players.findIndex(player => !player);
      if (side < 0) return ack({ ok: false, error: 'Oda dolu.' });
      room.players[side] = { token, name, team: null, connected: true, socketId: socket.id };
    }
    const player = room.players[side];
    player.name = name || player.name;
    attachPlayer(socket, room, side, player);
    const fixture=currentFixtureForSeat(room,side);
    ack({ ok: true, code, side, lobby: lobbyPayload(room), match: fixture?.match || room.match, localSide: fixture ? (fixture.activeSeats||fixture.seats).indexOf(side) : side, fixtureId:fixture?.id||null, tournament:tournamentPublic(room.tournament) });
    emitLobby(io, room);
    if (fixture?.match) socket.emit('match:state', { match: fixture.match, serverNow: Date.now(), fixtureId:fixture.id, tournament:tournamentPublic(room.tournament) });
    else if (room.match) socket.emit('match:state', { match: room.match, serverNow: Date.now() });
  });

  socket.on('room:submitTeam', (payload, ack = () => {}) => {
    const room = currentRoom(socket);
    if (!room || room.code !== normalizeCode(payload?.code)) return ack({ ok: false, error: 'Oda bağlantısı bulunamadı.' });
    if (room.phase !== 'lobby') return ack({ ok: false, error: 'Maç başladıktan sonra kadro değiştirilemez.' });
    const team = validateTeam(payload?.team);
    if (!team) return ack({ ok: false, error: 'Kadro 11 benzersiz oyuncudan ve bir kaleciden oluşmalı.' });
    const colorUsed = room.players.some((player, side) => side !== socket.data.side && player?.team?.color && player.team.color.toLowerCase() === team.color?.toLowerCase());
    if (colorUsed) return ack({ ok: false, error: 'Bu takım rengi odadaki başka bir takım tarafından seçildi. Farklı bir renk seç.' });
    room.players[socket.data.side].team = team;
    touch(room);
    ack({ ok: true, lobby: lobbyPayload(room) });
    emitLobby(io, room);
  });

  socket.on('room:configureTournament', (payload, ack = () => {}) => {
    const room=currentRoom(socket);
    if(!room||!isHost(socket)||room.roomType!=='four'||room.phase!=='lobby')return ack({ok:false,error:'Dörtlü turnuvayı yalnız oda yöneticisi ayarlayabilir.'});
    if(!room.players.slice(0,4).every(player=>player?.connected))return ack({ok:false,error:'Dört oyuncunun da odaya katılması gerekiyor.'});
    const squadMethod=payload?.squadMethod==='duel'?'duel':'random';
    room.tournamentOptions={durationMinutes:Math.max(1,Math.min(10,Number(payload?.durationMinutes)||3)),legs:Number(payload?.legs)===2?2:1,squadMethod};
    room.settings=validateSettings({...payload?.settings,durationMinutes:room.tournamentOptions.durationMinutes,competition:'fourCup',extraTime:true,shootout:true});
    room.tournamentUsedIds=[];
    room.players.forEach(player=>{if(player)player.team=null;});
    if(squadMethod==='random'){
      try{assignUniqueRandomTeams(room);}catch(error){return ack({ok:false,error:error.message});}
      room.duel=null;
    }else{
      const draw=shuffle([0,1,2,3]);
      const pairs=[[draw[0],draw[1]],[draw[2],draw[3]]];
      room.duel=createDuelState(pairs[0],pairs[0][0],{pairs,pairIndex:0});
      scheduleDuelCoin(io,room);
      io.to(room.code).emit('room:duel',room.duel);
    }
    touch(room);const lobby=lobbyPayload(room);ack({ok:true,lobby,duel:room.duel});emitLobby(io,room);
  });

  socket.on('room:duelRequest', (_payload, ack = () => {}) => {
    const room=currentRoom(socket);
    if(!room||room.phase!=='lobby'||room.maxPlayers!==2||!room.players.slice(0,2).every(player=>player?.connected))return ack({ok:false,error:'İki oyuncu da lobide ve bağlı olmalı.'});
    room.duel={...createDuelState([0,1],socket.data.side,{status:'pending',phase:'request'}),turn:null,coinDeadline:null};
    touch(room);ack({ok:true,duel:room.duel});io.to(room.code).emit('room:duel',room.duel);emitLobby(io,room);
  });

  socket.on('room:duelRespond', (payload, ack = () => {}) => {
    const room=currentRoom(socket),duel=room?.duel;
    if(!room||!duel||duel.status!=='pending'||socket.data.side===duel.requestedBy)return ack({ok:false,error:'Bekleyen geçerli bir düello isteği yok.'});
    if(!payload?.accept){room.duel=null;touch(room);ack({ok:true,rejected:true});io.to(room.code).emit('room:duel',null);emitLobby(io,room);return;}
    duel.status='accepted';duel.phase='coin';duel.seats=[0,1];duel.coinDeadline=Date.now()+10000;
    scheduleDuelCoin(io,room);touch(room);ack({ok:true,duel});io.to(room.code).emit('room:duel',duel);emitLobby(io,room);
  });

  socket.on('duel:flip', (_payload, ack = () => {}) => {
    const room=currentRoom(socket),duel=room?.duel;
    if(!duel||duel.phase!=='coin')return ack({ok:false,error:'Yazı tura aşaması açık değil.'});
    if(!duel.seats?.includes(socket.data.side))return ack({ok:false,error:'Bu düellonun tarafı değilsin.'});
    clearTimeout(room.duelCoinTimer);
    duel.winner=crypto.randomInt(2);duel.turn=duel.winner;duel.phase='criteria';duel.criteriaIndex=0;duel.coinDeadline=null;
    touch(room);ack({ok:true,duel});io.to(room.code).emit('room:duel',duel);emitLobby(io,room);
  });

  socket.on('duel:criterion', (payload, ack = () => {}) => {
    const room=currentRoom(socket),duel=room?.duel;
    if(!duel||duel.phase!=='criteria'||socket.data.side!==activeDuelSeat(duel))return ack({ok:false,error:'Kriter sırası sende değil.'});
    const key=DUEL_KEYS[duel.criteriaIndex],value=safeDuelChoice(key,payload?.value);
    if(!value)return ack({ok:false,error:'Geçersiz kriter.'});
    duel.selections[key]=value;duel.criteriaIndex+=1;
    if(duel.criteriaIndex>=DUEL_KEYS.length){
      const pool=duelPool(duel.selections);
      if(pool.length<22||!pool.some(player=>player.position==='GK'))duel.selections={period:'all',nationality:'all',league:'all',rating:'all',style:duel.selections.style||'balanced'};
      duel.phase='picks';duel.turn=duel.winner;duel.candidates=nextDuelCandidates(duel,room.tournamentUsedIds);
    }else duel.turn=duel.turn===0?1:0;
    touch(room);ack({ok:true,duel});io.to(room.code).emit('room:duel',duel);emitLobby(io,room);
  });

  socket.on('duel:pick', (payload, ack = () => {}) => {
    const room=currentRoom(socket),duel=room?.duel;
    if(!duel||duel.phase!=='picks'||socket.data.side!==activeDuelSeat(duel))return ack({ok:false,error:'Transfer sırası sende değil.'});
    const player=duel.candidates.find(candidate=>candidate.id===payload?.playerId);
    if(!player)return ack({ok:false,error:'Bu futbolcu mevcut üç aday arasında değil.'});
    const localSide=duel.turn,slot=SLOTS[duel.picks[localSide].length];duel.picks[localSide].push({...player,slot});
    if(duel.picks[0].length===11&&duel.picks[1].length===11){
      finishDuelPair(io,room,duel);
    }else{
      duel.turn=localSide===0?1:0;if(duel.picks[duel.turn].length>=11)duel.turn=localSide;
      duel.candidates=nextDuelCandidates(duel,room.tournamentUsedIds);touch(room);io.to(room.code).emit('room:duel',duel);emitLobby(io,room);
    }
    ack({ok:true,duel:room.duel,lobby:lobbyPayload(room)});
  });

  socket.on('room:updateSettings', (payload, ack = () => {}) => {
    const room = currentRoom(socket);
    if (!room || !isHost(socket)) return ack({ ok: false, error: 'Ayarları yalnızca oda sahibi değiştirebilir.' });
    if (room.phase !== 'lobby') return ack({ ok: false, error: 'Maç başladı.' });
    room.settings = validateSettings({...payload?.settings,competition:room.roomType==='twoLeg'?'twoLeg':room.roomType==='four'?'fourCup':'single'});
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
    room.startReady = Array(room.maxPlayers).fill(false);
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
    if (room.startReady.slice(0,room.maxPlayers).every(Boolean)) beginRoomMatch(io, room);
  });

  socket.on('match:stop', (payload, ack = () => {}) => {
    const room=currentRoom(socket),target=matchTargetForSocket(room,socket);
    if(!target||!['match','tournament'].includes(room.phase))return ack({ok:false,error:'Aktif maç bulunamadı.'});
    const result=Engine.stopRoll(target.match,target.localSide,payload?.digit,Date.now());
    if(!result.ok)return ack(result);
    touch(room);ack({ok:true,digit:result.digit});emitMatchTarget(io,room,target);
  });

  socket.on('match:startPeriod', (_payload, ack = () => {}) => {
    const room=currentRoom(socket),target=matchTargetForSocket(room,socket);
    if(!target||!['match','tournament'].includes(room.phase))return ack({ok:false,error:'Aktif maç bulunamadı.'});
    const result=Engine.startWaitingPeriod(target.match,target.localSide,Date.now());
    if(!result.ok)return ack(result);
    touch(room);ack({ok:true});emitMatchTarget(io,room,target);
  });

  socket.on('match:pause', (_payload, ack = () => {}) => {
    const room=currentRoom(socket),target=matchTargetForSocket(room,socket);
    if(!target||!['match','tournament'].includes(room.phase))return ack({ok:false,error:'Aktif maç bulunamadı.'});
    const result=Engine.togglePause(target.match,target.localSide,Date.now());
    if(!result.ok)return ack(result);
    touch(room);ack(result);emitMatchTarget(io,room,target);
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
    const room=currentRoom(socket);if(!room)return;
    const side=socket.data.side;
    if(['lobby','brief'].includes(room.phase)){
      if(side===0){io.to(room.code).emit('room:closed',{reason:'Oda sahibi ayrıldı.'});clearStartTimer(room);clearTimeout(room.duelCoinTimer);clearTimeout(room.interlegTimer);rooms.delete(room.code);}
      else{
        room.players[side]=null;
        if(room.phase==='brief'){clearStartTimer(room);room.phase='lobby';room.startReady=Array(room.maxPlayers).fill(false);room.startDeadline=null;}
        if(room.duel?.seats?.includes(side)){room.duel=null;io.to(room.code).emit('room:duel',null);}
        socket.leave(room.code);touch(room);emitLobby(io,room);
      }
    }else if(room.players[side]){room.players[side].connected=false;touch(room);emitLobby(io,room);}
    socket.data.roomCode=null;socket.data.side=null;
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
  const now=Date.now();
  for(const room of rooms.values()){
    if(room.phase==='tournament'&&room.tournament){
      for(const fixture of room.tournament.fixtures.filter(item=>item.status==='live'&&item.match)){
        const changed=Engine.tickMatch(fixture.match,now);
        if(fixture.match.phase==='finished')finishTournamentFixture(io,room,fixture);
        if(changed||now-(fixture.lastBroadcastAt||0)>=100){fixture.lastBroadcastAt=now;emitFixtureMatch(io,room,fixture,'match:state');}
      }
      continue;
    }
    if(room.match&&room.phase==='match'){
      const changed=Engine.tickMatch(room.match,now);
      if(room.match.phase==='finished'){
        if(!scheduleAutomaticSecondLeg(io,room)) room.phase='finished';
      }
      if(changed||now-room.lastBroadcastAt>=100){room.lastBroadcastAt=now;io.to(room.code).emit('match:state',{match:room.match,serverNow:now});}
    }
  }
},50).unref();

setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    const nobodyConnected = room.players.every(player => !player?.connected);
    const ttl = nobodyConnected ? 10 * 60 * 1000 : 6 * 60 * 60 * 1000;
    if (now - room.updatedAt > ttl) { clearStartTimer(room); clearTimeout(room.duelCoinTimer); clearTimeout(room.interlegTimer); rooms.delete(code); }
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

