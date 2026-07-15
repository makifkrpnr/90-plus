# 90+ v5 — Mobil Arena

Mobil öncelikli retro kronometre futbol oyunu. AI, aynı cihaz Co-op ve oda kodlu uzaktan arkadaş maçı desteklenir.

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
