# 90+ v7 — Mobil Arena

Mobil öncelikli retro kronometre futbol oyunu. AI, aynı cihaz Co-op ve oda kodlu uzaktan arkadaş maçı desteklenir.

## v7 yenilikleri

- **Oyun akışı sözleşmesi:** Tüm modların davranışı `docs/oyun-akisi.md` altında senaryo senaryo tanımlandı; 4 gerçek soket istemcisiyle otomatik simüle ediliyor (`tests/quad-flow.test.js`).
- **4'lü turnuva düzeltmeleri:** Oda tipi seçimi kadro sekmeleriyle çakışmıyor; her oyuncu yalnız kendi maçını görür ve yönetir (maç izolasyonu testle doğrulandı); düello seyircileri durumu net görür.
- **Ayrılma/grace:** Ortak kadro kurulurken ayrılan oyuncuya 10 sn süre; dönmezse düello iptal, herkes lobiye. Online moddayken geri tuşu artık lobiye döner.
- **Maçtan çıkış = maç biter:** Onay diyaloğu; online'da hükmen (0-3), turnuvada hükmen kayıt. Arka planda hayalet maç kalmaz.
- **Ses v3:** Katmanlı olay sahneleri geri geldi (top + düdük + tribün ayrı kanallarda), maç sonu müziği ambiyansla karışmaz, throttle kaldırıldı.
- **Yeni yazı tura:** Takım yüzlü 3D para; bir yüz bir takımı temsil eder, flip animasyonu motorun rastgele sonucunda durur (maç + düello + online).
- **Retro futbolcu kartı:** Tam ekran, ülke bayrağı renkleriyle çizgili gradyan, bayrak emojisi, rating rozeti, kronometre rakamı — her bayrakta okunur metin.
- **Spikerli olay kartları:** Olay başına ~10 cümlelik havuzdan tekrarsız spiker anlatımı; gol/kurtarışlarda oyuncu ve kaleci isimleri (`js/commentary.js`). Baş döndüren ışın animasyonu kaldırıldı.
- **Draft/düello seçimi:** Rakam→aday eşleşmesi her turda karıştırılır, ışık daha hızlı (520 ms), 15 sn'de basılmazsa otomatik seçim.
- **Skorboard v7 + tema denetimi:** Açık/koyu temada tutarlı; mobilde uygulama tarzı alt dock, kadro yöntemi butonları dock'ta.
- Oyuncu havuzu 2.532 → **3.184** (186 Türk futbolcu; efsaneler + güncel kadro).
- Önbellek kırıcı sürümleme (`?v7`) ve yenilenen service worker cache'i.

## v6 yenilikleri

- Ses sistemi sadeleştirildi: müzik / atmosfer / efektler yalnız aç-kapa; seviyeler sabit kalibre. Ses ve titreşim tercihleri sağ üstteki ⚙ Ayarlar ekranına taşındı.
- Yazı tura ve ilk düdük süresinde tamamlanmazsa otomatik sonuçlanır; maç kilitlenmez.
- Arkadaş modunda oda kurulur kurulmaz lobi ve oda kodu gösterilir; kadro sonra kurulur.
- Transfer Düellosu artık TÜM modlarda (AI dahil) oynanır; oyuncu seçimi kriter draftındaki gibi kronometre durdurarak yapılır, her turda taze adaylar gelir, dönem kriterinde en fazla 2 dönem seçilir.
- Takım rengi kadro ekranında görsel yuvarlaklarla seçilir; rakibin rengi kilitlenir.
- Skorboard sıfırdan: takım renkleri, canlı dakika, maç uzunluğu, uzatmada süren kümülatif saat, sıradaki takımda parlarken animasyonlu skor.
- Oyun sistemleri: Tek Maç, Çift Ayaklı Maç ve (AI'ya karşı) Şampiyonlar Turnuvası (çift maçlı eleme) ile Dünya Kupası (2 grup + eleme). Gol/asist kralı ve podyum ekranı.
- 4 kişilik online turnuva odası: rastgele benzersiz kadrolar veya kura + sıralı transfer düellosu, eşzamanlı yarı finaller, final + üçüncülük, şampiyon ve istatistik ekranı.
- Oyuncu havuzu 2.121 → **2.532** benzersiz futbolcu.
- Mobilde yapışkan alt aksiyon çubuğu; scriptler `defer` ile yüklenir.

## v5 yenilikleri

- Mobil maç ekranı tek görünümde çalışır: skor üstte, saha ortada, olay/kural/kadro/mola araçları altta sabittir.
- Oyun duraklatıldığında **Olaylar, Kurallar, Kadrolar ve Devam Et** kullanılabilir.
- 0–9 cetvelinde **7 = Şut**. Şut alt atışında 0 korner, 9 gol; diğer rakamlar kurtarış, direk veya auttur.
- Frikik ve penaltıda çift rakam gol; tek rakam kaleci kurtarışı, direk veya aut ayrıntısıyla sonuçlanır.
- Aynı hücumda en fazla iki art arda pas mümkündür. Sonraki atışta pas rakamları geçici olarak taç/auta dönüşür.
- Oyuncu havuzu **2.121 benzersiz futbolcuya** çıkarıldı. Kullanıcının açıkça dışlanmasını istediği isim engel listesinde tutulur.
- Kriter filtreleri dönem, milliyet, lig, mevki grubu ve puan aralığını birlikte uygular.
- Kriter draftı yavaşlatılmış, aday eşleme açıklaması ve rakam haritası eklenmiştir.
- Co-op ve arkadaş modu için **Transfer Düellosu**: karşılıklı onay, yazı tura, sırayla kriter ve benzersiz oyuncu seçimi, canlı formasyon sahaları.
- Maç başlama hakkı kronometre yerine animasyonlu yazı turayla belirlenir.
- 10 takım rengi; skor tabelasında yalnız sırası gelen takımın renginde retro glow.
- Menü müziği, stadyum atmosferi ve efektler ayrı ayrı açılıp kapatılabilir ve ses seviyeleri ayarlanabilir.
- 67 isteğe bağlı ses yolu vardır: dosya varsa çalınır, yoksa oyun sessiz devam eder.
- Online maçta her oyuncunun parçalı kullanabildiği 60 saniyelik mola bütçesi bulunur.
- Maç sonunda mağlup oyuncu yeni maç veya iki ayaklı rövanş isteyebilir. İkinci ayakta iç/deplasman tarafları değişir; toplam skor eşitse uzatma ve seri penaltı uygulanır. Deplasman golü ayrıcalığı kullanılmaz.
- PWA geri tuşu uygulama içi ekranları kapatır; menüye dönüldüğünde mola perdesi ekranda kalmaz.

## Yerel çalıştırma

Node.js 20 önerilir.

```bash
npm install --registry=https://registry.npmjs.org/
npm start
```

Tarayıcı: `http://localhost:8080`

Test:

```bash
npm test
npm run audio:check
```

## Sesler

Bütün sesleri `assets/audio/` altında `SES-DOSYA-LISTESI.md` dosyasındaki adlarla yerleştir. Menü müziği ve ambiyans Web Audio ile oynatılır; böylece kalıcı sistem medya oynatıcısı açılması azaltılır. Tarayıcı sesli otomatik oynatmayı engellerse müzik ilk dokunuşta başlar.

## Render

`render.yaml` hazırdır. Mevcut servisi yükseltmek için `GUNCELLEME-KURULUM.md` dosyasını takip et.
