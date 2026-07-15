'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const data=require('../data/players.json');

test('oyuncu havuzu 2000 üstü benzersiz futbolcu içerir',()=>{
  assert.ok(Array.isArray(data.players));
  assert.ok(data.players.length>=2000);
  const ids=new Set(data.players.map(p=>p.id));
  assert.equal(ids.size,data.players.length);
});

test('açık engel listesinde bulunan Hakan Şükür oyuncu havuzunda yer almaz',()=>{
  assert.ok(data.excluded.includes('hakan-sukur'));
  assert.equal(data.players.some(p=>String(p.name).toLocaleLowerCase('tr').includes('hakan şükür')),false);
});

test('oyuncu verisi kadro filtreleri için gerekli alanları taşır',()=>{
  for(const player of data.players.slice(0,250)){
    assert.ok(player.id&&player.name&&player.nationality&&player.position);
    assert.ok(Number.isFinite(player.rating));
    assert.ok(Array.isArray(player.leagues));
  }
});
