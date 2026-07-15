const test = require('node:test');
const assert = require('node:assert/strict');
const Core = require('../js/core.js');

test('ana olay tablosu 0 gol, 4 faul, 9 top kaybı döndürür', () => {
  assert.equal(Core.mainEventForDigit(0).key, 'goal');
  assert.equal(Core.mainEventForDigit(4).key, 'foul');
  assert.equal(Core.mainEventForDigit(9).key, 'turnover');
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

test('tek rakam kurtarış, çift rakam gol olur', () => {
  [0, 2, 4, 6, 8].forEach(digit => assert.equal(Core.shotForDigit(digit), 'goal'));
  [1, 3, 5, 7, 9].forEach(digit => assert.equal(Core.shotForDigit(digit), 'saved'));
});

test('ikinci sarı kart otomatik kırmızıya dönüşür', () => {
  const player = { id: 'x', yellowCards: 0, red: false };
  const first = Core.applyCard(player, 'yellow');
  const second = Core.applyCard(first, 'yellow');
  assert.equal(first.yellowCards, 1);
  assert.equal(first.red, false);
  assert.equal(second.yellowCards, 2);
  assert.equal(second.red, true);
});

test('vakit geçirme cezaları beş kademede yükselir', () => {
  const expected = ['turnover', 'turnover', 'penaltyAgainst', 'redCard', 'forfeit'];
  let count = 0;
  expected.forEach(consequence => {
    const result = Core.registerTimeout(count);
    count = result.count;
    assert.equal(result.consequence, consequence);
  });
});

test('5 dakikalık maç için uzatma toplamı 60 saniyeye yuvarlanır', () => {
  assert.equal(Core.roundExtraTimeSeconds(300), 60);
});

test('hükmen skor en az üç fark üretir', () => {
  assert.deepEqual(Core.forfeitScore([2, 1], 0), [2, 5]);
  assert.deepEqual(Core.forfeitScore([0, 0], 1), [3, 0]);
});

test('mod yöntemi aday seçer', () => {
  const items = ['a', 'b', 'c'];
  assert.equal(Core.chooseByModulo(items, 5), 'c');
  assert.equal(Core.chooseByModulo(items, 8), 'c');
});

test('gecikme kaynaklı ek süre maç uzunluğuna göre makul biçimde sınırlandırılır', () => {
  assert.equal(Core.calculateStoppageTimeMs([0, 0], 5), 0);
  assert.equal(Core.calculateStoppageTimeMs([10000, 10000], 5), 15000);
  assert.equal(Core.calculateStoppageTimeMs([999999, 999999], 5), 60000);
  assert.equal(Core.formatAddedTimeMinutes(60000), 1);
});
