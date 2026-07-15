'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
require('../js/modules/tournament.js');
const T=globalThis.TournamentCore;
const teams=n=>Array.from({length:n},(_,i)=>({name:`Takım ${i+1}`,lineup:[]}));

test('klasik kupa iki grupta sekiz takım ve 12 grup maçı üretir',()=>{
 const cup=T.createGroupTournament('classicUcl',teams(8),{legs:2,durationMinutes:4});
 assert.equal(cup.groups.length,2);assert.equal(cup.fixtures.length,12);assert.equal(cup.options.legs,2);
});

test('dünya kupası dört grup ve 24 grup maçı üretir',()=>{
 const cup=T.createGroupTournament('worldCup',teams(16),{legs:1});
 assert.equal(cup.groups.length,4);assert.equal(cup.fixtures.length,24);
});

test('grup tablosu galibiyet, averaj ve puanı doğru işler',()=>{
 const cup=T.createGroupTournament('classicUcl',teams(8));
 const fixture=cup.fixtures[0];T.applyGroupResult(cup,fixture,[3,1]);
 const group=cup.groups.find(g=>g.name===fixture.group);
 const home=group.table.find(r=>r.team===fixture.home);const away=group.table.find(r=>r.team===fixture.away);
 assert.equal(home.pts,3);assert.equal(home.gd,2);assert.equal(away.pts,0);assert.equal(away.gd,-2);
});

test('dörtlü kupa iki yarı final üretir ve istatistik alanları hazırdır',()=>{
 const cup=T.createKnockout4(teams(4),{legs:2});
 assert.equal(cup.fixtures.length,2);assert.ok(cup.fixtures.every(f=>f.legs===2));assert.deepEqual(cup.stats,{goals:{},assists:{},cards:{}});
});
