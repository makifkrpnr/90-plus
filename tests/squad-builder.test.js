'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
require('../js/modules/squad-builder.js');
const S=globalThis.SquadBuilder;
const periods=[{id:'2000-2010',start:2000,end:2010},{id:'2011-2020',start:2011,end:2020}];
const players=[
{id:'gk',name:'GK',position:'GK',nationality:'Türkiye',rating:80,activeStart:2001,activeEnd:2012,leagues:['Süper Lig']},
{id:'cb',name:'CB',position:'CB',nationality:'Türkiye',rating:79,activeStart:2005,activeEnd:2015,leagues:['Süper Lig']},
{id:'st',name:'ST',position:'ST',nationality:'İspanya',rating:88,activeStart:2012,activeEnd:2020,leagues:['La Liga']}
];
test('milliyet, lig ve dönem filtreleri birlikte katı uygulanır',()=>{
 const result=S.filterPlayers(players,{nationality:'Türkiye',league:'Süper Lig',position:'',rating:''},['2000-2010'],periods);
 assert.deepEqual(result.map(p=>p.id),['gk','cb']);
});
test('aday seti kullanılmış oyuncuyu tekrar göstermez',()=>{
 const result=S.candidateSet('ST',players,new Set(['st']));
 assert.equal(result.some(p=>p.id==='st'),false);
});
test('seçilen oyuncuları mevkilere otomatik yerleştirir',()=>{
 const result=S.assignPlayersToSlots(players,['GK','CB','ST']);
 assert.deepEqual(result.map(p=>p.slot),['GK','CB','ST']);
 assert.equal(new Set(result.map(p=>p.id)).size,3);
});
