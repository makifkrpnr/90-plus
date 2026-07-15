'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Core = require('../js/core.js');

test('ana olay tablosunda 7 şut, 0 gol, 4 faul ve 9 top kaybıdır', () => {
  assert.equal(Core.mainEventForDigit(0).key, 'goal');
  assert.equal(Core.mainEventForDigit(4).key, 'foul');
  assert.equal(Core.mainEventForDigit(7).key, 'shot');
  assert.equal(Core.mainEventForDigit(9).key, 'turnover');
});

test('iki üst üste pastan sonra pas rakamları geçici olarak taç ve auta dönüşür', () => {
  assert.equal(Core.mainEventForDigit(1, 1).key, 'pass');
  assert.equal(Core.mainEventForDigit(1, 2).key, 'throwIn');
  assert.equal(Core.mainEventForDigit(2, 2).key, 'turnover');
  assert.equal(Core.mainEventForDigit(5, 2).key, 'throwIn');
});

test('üçüncü korner penaltı üretir ve sayaç sıfırlanır', () => {
  assert.deepEqual(Core.registerCorner(0), { corners: 1, penalty: false });
  assert.deepEqual(Core.registerCorner(1), { corners: 2, penalty: false });
  assert.deepEqual(Core.registerCorner(2), { corners: 0, penalty: true });
});

test('faul sonuç ve kart alt tabloları kurallara uyar', () => {
  assert.equal(Core.foulResultForDigit(1), 'freeKick');
  assert.equal(Core.foulResultForDigit(9), 'penalty');
  assert.equal(Core.foulResultForDigit(8), 'indirect');
  assert.equal(Core.cardForDigit(5), 'yellow');
  assert.equal(Core.cardForDigit(9), 'red');
  assert.equal(Core.cardForDigit(4), 'none');
});

test('açık oyun şutunda 0 korner, 9 gol ve diğerleri ayrıntılı sonuç verir', () => {
  assert.equal(Core.shotForDigit(0), 'corner');
  assert.equal(Core.shotForDigit(9), 'goal');
  assert.equal(Core.shotForDigit(1), 'saved');
  assert.equal(Core.shotForDigit(2), 'post');
  assert.equal(Core.shotForDigit(3), 'wide');
});

test('frikik ve penaltıda çift gol, tek rakam ayrıntılı başarısız sonuçtur', () => {
  [0,2,4,6,8].forEach(d => assert.equal(Core.setPieceOutcomeForDigit(d), 'goal'));
  assert.equal(Core.setPieceOutcomeForDigit(1), 'saved');
  assert.equal(Core.setPieceOutcomeForDigit(3), 'post');
  assert.equal(Core.setPieceOutcomeForDigit(5), 'wide');
});

test('ikinci sarı kart otomatik kırmızıya dönüşür', () => {
  const first = Core.applyCard({ id:'x', yellowCards:0, red:false }, 'yellow');
  const second = Core.applyCard(first, 'yellow');
  assert.equal(first.red, false); assert.equal(second.yellowCards, 2); assert.equal(second.red, true);
});

test('vakit geçirme cezaları beş kademede yükselir', () => {
  const expected = ['turnover','turnover','penaltyAgainst','redCard','forfeit']; let count=0;
  expected.forEach(consequence => { const r=Core.registerTimeout(count); count=r.count; assert.equal(r.consequence,consequence); });
});

test('5 dakikalık maç için uzatma toplamı 60 saniyeye yuvarlanır', () => assert.equal(Core.roundExtraTimeSeconds(300),60));
test('hükmen skor en az üç fark üretir', () => { assert.deepEqual(Core.forfeitScore([2,1],0),[2,5]); assert.deepEqual(Core.forfeitScore([0,0],1),[3,0]); });
test('mod yöntemi aday seçer', () => { const items=['a','b','c']; assert.equal(Core.chooseByModulo(items,5),'c'); });
test('gecikme kaynaklı ek süre maç uzunluğuna göre sınırlandırılır', () => { assert.equal(Core.calculateStoppageTimeMs([0,0],5),0); assert.equal(Core.calculateStoppageTimeMs([10000,10000],5),15000); assert.equal(Core.calculateStoppageTimeMs([999999,999999],5),60000); });
test('iki ayaklı eşleşmede toplam skor hesaplanır ve deplasman golü ayrıcalığı yoktur', () => { assert.deepEqual(Core.aggregateWinner([2,1],[0,1]),{aggregate:[2,2],winner:null}); });
