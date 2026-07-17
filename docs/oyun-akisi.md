# 90+ Oyun Akışı ve Senaryo Sözleşmesi (v7)

Bu doküman tüm modların **olması gereken** davranışını tanımlar. Kod bu dokümana uyar;
uymayan her davranış hatadır. Otomatik doğrulama: `npm test` (motor) +
`tests/quad-flow.test.js` (4 istemcili soket simülasyonu).

---

## 1. Ortak kurallar (her mod)

- **Yazı tura:** Paranın bir yüzü ev sahibi, diğer yüzü deplasman takımını temsil eder
  (takım rengi + baş harf). Animasyonlu flip sonucu, motorun rastgele seçtiği kazanan
  yüzde durur. Kullanıcı süresi (10 sn) içinde flip başlatmazsa otomatik atılır.
  Kazanan 1. yarıya, kaybeden 2. yarıya başlar.
- **İlk düdük:** 15 sn içinde basılmazsa maç otomatik başlar.
- **Atış süresi:** 10 sn. Dolarsa ihlal merdiveni: 1-2 top kaybı, 3 penaltı,
  4 kırmızı, 5 hükmen.
- **Draft/düello adayı seçimi:** Işık **rastgele karışık** sırayla gezer (rakam→aday
  eşleşmesi her slotta yeniden karılır), adım süresi 520 ms. Seçim için **15 sn** süre
  vardır; dolarsa o anki rakamla otomatik seçilir.
- **Maçtan çıkış:** Maç ekranından ana menüye/lobiye dönmek onay ister. Onaylanırsa
  **maç sona erer** (kayıt silinir, arka planda hayalet maç kalmaz). Online'da çıkan
  taraf hükmen kaybeder (bkz. 4.4/5.6).
- **Ses:** Menü müziği ve stadyum ambiyansı aynı anda asla çalmaz (tek döngü yuvası).
  Maç sonu müziği çalarken döngü kısılır; ekran değişince stinger susturulur.

## 2. AI'ya Karşı

Akış: Mod → Oyun Sistemi (Tek Maç / Çift Ayak / Şampiyonlar / Dünya Kupası) → Kadro
(renk seçimi dahil) → Maç Ayarları → Brifing → Yazı Tura → Maç → Sonuç.

- Düello dahil tüm kadro yöntemleri kullanılabilir; AI kriter ve transferlerini
  kendisi seçer (1.4–2.6 sn arayla).
- **Çift ayak:** İlk ayak berabere bitebilir (uzatma/penaltı yok). İkinci ayakta
  toplam skor; eşitse uzatma + seri penaltı.
- **Turnuvalar:** Kullanıcının maçları oynanır, diğerleri simüle edilir. Turnuvadan
  maç ekranındayken çıkılırsa o maç hükmen (0-3) kaybedilir ve turnuva kaydına işlenir.
- Kaydetme: Tek maç/çift ayak `localStorage`'a kaydedilir, "Kayıtlı Maça Dön" ile
  sürdürülür. **Ana menüye bilinçli çıkış = maç biter, kayıt silinir.**

## 3. Aynı Cihaz Co-op

- Akış AI ile aynı; iki kadroyu iki oyuncu sırayla kurar. Turnuva yok (Tek/Çift ayak).
- Düelloda iki taraf da aynı cihazdan sırayla oynar; süre dolunca otomatik seçim.
- Maçtan çıkış onaylanırsa maç biter (kayıt silinir).

## 4. Arkadaşınla Oyna — 2 Kişilik Oda

### 4.1 Lobi
- Oda kurulur kurulmaz lobi + kod görünür. Her online ekranda **Lobi** kısayolu vardır.
- Oyuncular kadrosunu istediği an kurar; renk çakışması sunucuda reddedilir.

### 4.2 Ortak kadro kurma (Transfer Düellosu)
- İstek → kabul → yazı tura → 5 kriter (dönem max 2) → sırayla kronometreli transfer.
- **Ayrılma/grace:** Düello sırasında bir katılımcı düello ekranından ayrılırsa veya
  bağlantısı koparsa: düello **duraklar**, diğer oyuncuya "X ayrıldı, 10 sn" uyarısı
  gider. 10 sn içinde dönerse kaldığı yerden devam. Dönmezse düello **iptal**,
  iki taraf da lobiye döner, kurulan kadrolar geçersiz sayılmaz (önceki team'ler korunur).

### 4.3 Maç
- Sunucu otoritatif. Yazı tura sunucuda atılır, istemci animasyonu sonucu gösterir.
- Kopan oyuncunun süresi işler; ihlaller hükmene kadar gider (bilinçli terk = hükmen).

### 4.4 Maçtan çıkış
- "Maçtan çık" onayı → `match:forfeit` → çıkan 0-3 hükmen kaybeder, maç biter,
  iki istemci de sonuç ekranını görür.

## 5. Arkadaşınla Oyna — 4'lü Turnuva Odası

### 5.1 Oda ve lobi
- Oda tipi seçimi (2 kişilik / 4'lü) yalnız oda kurarken yapılır ve **yalnız bu
  butonlar** bu seçimi değiştirir (kadro sekmeleriyle çakışmaz).
- 4 oyuncu; 0. oyuncu yönetici. Yönetici: maç süresi, eleme usulü (tek/çift maç),
  kadro yöntemi (rastgele / düello), turnuvayı başlatma.

### 5.2 Kadro kurma
- **Rastgele:** Sunucu 4 kadroyu kurar; bir futbolcu yalnız bir kadroda yer alır.
- **Düello:** Kura animasyonu ilk çifti belirler. 1. çift düello yapar (taze havuz),
  ardından 2. çift kalan havuzla. Düelloda olmayan iki oyuncu **seyirci**dir: ekranda
  kimin oynadığı yazar, butonları pasiftir, istedikleri an lobiye dönebilirler.
- Grace kuralı (4.2) katılımcılar için aynen geçerli; seyircinin ayrılması düelloyu
  etkilemez.

### 5.3 Yarı finaller
- İki maç **aynı anda** başlar. Her oyuncu **yalnız kendi maçını** görür ve yönetir;
  bir maçtaki olay diğerini etkilemez (maç kimliği `matchId` ile izole).
- Maçını bitiren çift sonuç ekranını görür; diğer maç sürerken "diğer yarı final
  sürüyor" durumu turnuva ekranında gösterilir.

### 5.4 Ara ve finaller
- İki yarı final de bitince eleme (bracket) ekranı herkese gösterilir; 15 sn sonra
  final (kazananlar) ve üçüncülük (kaybedenler) **aynı anda** başlar.

### 5.5 Podyum
- İki final maçı bitince: şampiyon/2./3. podyumu + gol kralı + turnuva istatistikleri.

### 5.6 Kopma/ayrılma
- Maç sırasında çıkan hükmen kaybeder (`match:forfeit`), turnuva kalanlarla sürer.
- Lobide (turnuva başlamadan) çıkan olursa koltuk boşalır; yeni oyuncu katılabilir.
- Yönetici lobide odayı kapatırsa herkes ana menüye döner.

## 6. Hata ihtimalleri ve beklenen davranış

| Senaryo | Beklenen |
| --- | --- |
| Yazı turada süre dolması | Otomatik atılır, ihlal yazılmaz |
| İlk düdükte bekleme | 15 sn sonra otomatik başlar |
| Draft/düello seçiminde süre dolması | O anki rakamla otomatik seçim |
| Düelloda katılımcı ayrılır | 10 sn grace → dönmezse iptal, herkes lobiye |
| Düelloda seyirci ayrılır | Düello etkilenmez |
| Maç ekranından çıkış (her mod) | Onay → maç biter (online: hükmen) |
| Quad'da diğer maçın verisi gelirse | `matchId` uyuşmazsa yok sayılır |
| Aynı renk seçimi | Sunucu reddeder, istemci kilitler |
| Ses üst üste binmesi | Aynı kanal kesme, farklı kanal katman; tek döngü yuvası |
| Oda süresi (kimse yok) | 10 dk sonra silinir |
