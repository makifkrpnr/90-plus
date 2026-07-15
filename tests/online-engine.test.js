'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Engine = require('../server/online-engine.js');
function team(name,prefix){const slots=['GK','LB','CB','CB','RB','DM','CM','AM','LW','RW','ST'];return{name,lineup:slots.map((slot,i)=>({id:`${prefix}-${i}`,name:`${name} ${i+1}`,nationality:'Türkiye',position:slot,slot,rating:80,activeStart:2000,activeEnd:2026,leagues:['Süper Lig']}))};}
const settings={durationMinutes:1,cards:true,injury:false,extraTime:true,shootout:true,soundIntensity:'medium',teamColors:['#d44735','#2878c8']};
function settle(match,now){Engine.tickMatch(match,now+5000);}
function completeKickoff(match,now=1000){const starter=match.context.owner;assert.equal(match.context.type,'kickoffReady');assert.equal(Engine.stopRoll(match,starter,0,now+100).ok,true);assert.equal(match.phase,'regulation');assert.equal(match.context.type,'playerSelect');return starter;}
function selectPlayer(match,side,digit,now){assert.equal(Engine.stopRoll(match,side,digit,now).ok,true);settle(match,now);assert.equal(match.context.type,'main');}

test('online maç yazı tura sonucu ve iki ayrı mola bütçesiyle açılır',()=>{const m=Engine.createMatch([team('A','a'),team('B','b')],settings,1000);assert.equal(m.version,5);assert.equal(m.phase,'kickoff');assert.equal(m.context.type,'kickoffReady');assert.ok([0,1].includes(m.firstHalfStarter));assert.equal(m.secondHalfStarter,m.firstHalfStarter===0?1:0);assert.deepEqual(m.pauseBudgetsMs,[60000,60000]);});

test('yazı tura kazananı ilk yarıyı, diğer taraf ikinci yarıyı başlatır',()=>{const m=Engine.createMatch([team('A','a'),team('B','b')],settings,1000);const starter=completeKickoff(m);assert.equal(starter,m.firstHalfStarter);assert.equal(m.secondHalfStarter,starter===0?1:0);});

test('başlama ekranında beklemek maç süresine, ihlale ve ek süreye yazılmaz',()=>{const m=Engine.createMatch([team('A','a'),team('B','b')],settings,1000);m.lastTickAt=1000;Engine.tickMatch(m,15000);assert.equal(m.turnElapsedMs,0);assert.deepEqual(m.delayWasteMs,[0,0]);assert.deepEqual(m.teams.map(t=>t.timeouts),[0,0]);});

test('önce oyuncu seçilir, sonraki atış sıfırsa gol olur',()=>{const m=Engine.createMatch([team('A','a'),team('B','b')],settings,1000);const side=completeKickoff(m);selectPlayer(m,side,3,2000);const id=m.activePlayerId[side];assert.equal(Engine.stopRoll(m,side,0,8000).ok,true);assert.equal(m.scores[side],1);assert.equal(m.teams[side].lineup.find(p=>p.id===id).goals,1);});

test('7 şut alt atışına geçer; 9 gol, 0 korner olur',()=>{const m=Engine.createMatch([team('A','a'),team('B','b')],settings,1000);const side=completeKickoff(m);selectPlayer(m,side,3,2000);Engine.stopRoll(m,side,7,8000);assert.equal(m.transition.context.type,'shotOpenPlay');settle(m,8000);assert.equal(m.context.type,'shotOpenPlay');Engine.stopRoll(m,side,9,14000);assert.equal(m.scores[side],1);});

test('üçüncü korner kullanılmadan penaltıya dönüşür',()=>{const m=Engine.createMatch([team('A','a'),team('B','b')],settings,1000);const side=completeKickoff(m);selectPlayer(m,side,2,2000);m.teams[side].corners=2;Engine.stopRoll(m,side,6,8000);assert.equal(m.teams[side].corners,0);assert.equal(m.transition.context.type,'setPieceShot');assert.equal(m.transition.context.reason,'penalty');});

test('iki pastan sonra üçüncü olayda pas rakamı taça dönüşür',()=>{const m=Engine.createMatch([team('A','a'),team('B','b')],settings,1000);const side=completeKickoff(m);for(let i=0;i<2;i++){selectPlayer(m,side,2,2000+i*12000);Engine.stopRoll(m,side,1,8000+i*12000);settle(m,8000+i*12000);}selectPlayer(m,side,2,30000);Engine.stopRoll(m,side,1,36000);assert.equal(m.transition.owner,side===0?1:0);assert.match(m.overlay.title,/TAÇ/);});

test('ikinci devreyi diğer taraf kendi düğmesiyle başlatır',()=>{const m=Engine.createMatch([team('A','a'),team('B','b')],settings,1000);completeKickoff(m);m.periodElapsedMs=m.periodDurationsMs[0]-1;m.lastTickAt=15000;Engine.tickMatch(m,15010);assert.equal(m.awaitingPeriodStart,true);assert.equal(m.awaitingPeriodSide,m.secondHalfStarter);assert.equal(Engine.startWaitingPeriod(m,m.firstHalfStarter,16000).ok,false);assert.equal(Engine.startWaitingPeriod(m,m.secondHalfStarter,16000).ok,true);});

test('her oyuncu yalnız kendi sırasında toplam 60 saniyelik mola kullanır',()=>{const m=Engine.createMatch([team('A','a'),team('B','b')],settings,1000);const starter=completeKickoff(m);const other=starter===0?1:0;assert.equal(Engine.togglePause(m,other,2000).ok,false);assert.equal(Engine.togglePause(m,starter,2000).ok,true);m.lastTickAt=2000;for(let t=2250;t<=7000;t+=250)Engine.tickMatch(m,t);assert.ok(m.pauseBudgetsMs[starter]<=55000);assert.equal(Engine.togglePause(m,starter,7100).ok,true);});

test('gecikmeler ikinci yarı sonunda hesaplanan ek süre üretir',()=>{const m=Engine.createMatch([team('A','a'),team('B','b')],settings,1000);completeKickoff(m);m.phase='regulation';m.periodIndex=1;m.periodElapsedMs=m.periodDurationsMs[1]-1;m.delayWasteMs=[10000,10000];m.stoppageAnnounced=false;m.lastTickAt=20000;Engine.tickMatch(m,20010);assert.equal(m.stoppageAnnounced,true);assert.ok(m.stoppageMs>=5000);});

test('ikinci ayakta toplam skor üstünlüğü uzatmasız kazandırır',()=>{const series={type:'twoLeg',leg:2,aggregateBase:[1,2]};const m=Engine.createMatch([team('B','b'),team('A','a')],settings,1000,series);completeKickoff(m);m.phase='regulation';m.periodIndex=1;m.scores=[0,0];m.periodElapsedMs=m.periodDurationsMs[1]-1;m.lastTickAt=5000;Engine.tickMatch(m,5010);assert.equal(m.phase,'finished');assert.equal(m.winnerSide,1);});
