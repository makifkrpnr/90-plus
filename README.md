# 90+ v6 — Premium Turnuva

Mobil öncelikli, retro kronometre futbol oyunu. Yapay zekâ, aynı cihaz Co-op, oda kodlu uzaktan arkadaş maçı, iki ayaklı eşleşmeler ve turnuva modları içerir.

## v6 ile gelen ana yenilikler

### Mimari ve performans

- Oyuncu havuzu `data/players.json` dosyasına taşındı ve tarayıcıda yalnız kadro kurulacağı zaman yükleniyor.
- Oyuncu verisi artık ilk açılış paketinin parçası değil; servis worker ayrı önbellekler.
- Ses motoru `js/audio.js`, uygulama tercihleri `js/modules/settings.js`, turnuva hesapları `js/modules/tournament.js`, kadro kurma mantığı `js/modules/squad-builder.js`, genel arayüz kabuğu `js/modules/ui-shell.js` içinde ayrıldı.
- Eski `kronometre-futbol-tek-dosya.html` kaldırıldı.
- `.DS_Store`, ZIP, WAV, `node_modules` ve geçici dosyalar `.gitignore` ile dışlandı.
- `app.js` hâlâ ana ekran denetleyicisidir; ağır veri, ses, ayar, turnuva ve kadro sorumlulukları ayrılmıştır. Sonraki güvenli mimari adım maç ve online ekran denetleyicilerini de ayrı modüllere taşımaktır.

Ayrıntı: [`MIMARI.md`](MIMARI.md)

### Ses sistemi

- Ses ayarları maç ayarlarından çıkarılarak ana menüde bağımsız **Ayarlar** ekranına alındı.
- İnce ses seviyesi karıştırıcıları kaldırıldı.
- Sade aç/kapat seçenekleri:
  - Menü müziği
  - Stadyum atmosferi
  - Olay sesleri
- Bir olayda yalnızca bir öncelikli efekt çalınır; farklı efektlerin üst üste binmesi engellenir.
- Olay efekti çalarken arka plan ambiyansı kısa süreliğine kısılır ve sonra yumuşakça geri gelir.
- Tanımlı 67 ses dosyasından hangisi varsa çalınır; eksik dosya oyunu durdurmaz.
- Mobil tarayıcı otomatik sesi engellerse müzik ilk kullanıcı dokunuşundan sonra başlar.

Ses yolları: [`SES-DOSYA-LISTESI.md`](SES-DOSYA-LISTESI.md)

### Oyun modları ve organizasyonlar

Her kadro kurma yönteminde **Rastgele**, **Kriter**, **Manuel** ve **Transfer Düellosu** kullanılabilir.

- **Tek maç:** AI, Co-op ve Arkadaşınla Oyna
- **Çift ayaklı eşleşme:** AI, Co-op ve Arkadaşınla Oyna
- **Klasik Şampiyonlar Kupası:** yalnız AI; eski Avrupa kupası atmosferinde grup + eleme
- **Dünya Kupası:** yalnız AI; grup + eleme
- **4 kişilik kupa:** Co-op ve Arkadaşınla Oyna

### 4 kişilik çevrim içi kupa

- Odaya toplam dört kişi katılabilir.
- İki yarı final aynı anda yürütülür.
- Yarı finaller bitince final ve üçüncülük maçı açılır.
- Oda yöneticisi turnuva süresi, tek/çift maç eleme ve kadro yöntemini belirler.
- Kadro yöntemleri: **Rastgele** veya **Transfer Düellosu**.
- Rastgele kadrolarda aynı futbolcu iki takımda yer alamaz.
- Düelloda ilk iki eşleşme animasyonlu kura ile belirlenir; bütün seçimlerde futbolcular benzersiz kalır.
- Turnuva sonunda şampiyon, ikinci, üçüncü, gol kralı, asist kralı ve kart istatistikleri gösterilir.

### Transfer Düellosu

- Bütün ana modlarda kullanılabilir.
- Çevrim içi kullanımda karşı tarafın kabulü gerekir; reddedilirse klasik yöntemlere dönülür.
- Yazı turayı kazanan ilk kriteri ve ilk futbolcuyu seçer.
- Dönem kriterinde en fazla iki dönem; diğer kriterlerde tek seçim yapılır.
- Oyuncu seçimi doğrudan tıklamayla değil, üç aday arasındaki kronometre atışıyla yapılır.
- Her yeni seçim turunda tamamen yeni ve daha önce seçilmemiş üç aday gösterilir.
- Seçilen futbolcu başka takımın adaylarına bir daha giremez.
- Oyuncular mevkilerine göre canlı saha planına otomatik yerleşir.

### Oda akışı

- Oda kodu **kadro kurmadan önce**, oda oluşturulur oluşturulmaz görünür.
- Arkadaş önce odaya katılır; ardından taraflar kadro, takım adı ve renk aşamalarına geçer.
- Aynı takım rengi ikinci oyuncuya pasif gösterilir ve sunucu tarafından da reddedilir.
- Çevrim içi çift ayak seçildiyse ilk ayak tamamlandıktan sonra taraflar otomatik değişir ve ikinci ayak toplam skor korunarak açılır.

### Oyuncu havuzu

- `data/players.json` içinde **2.264 benzersiz futbolcu** bulunur.
- Dönem, milliyet, lig, mevki ve puan alanları kadro filtrelerinde birlikte uygulanır.
- Veride yinelenen ID bulunmaz.
- Kullanıcının açıkça dışlanmasını istediği Hakan Şükür havuzda bulunmaz.
- Sistem kişiler hakkında otomatik siyasi veya hukuki ilişki tahmini üretmez; dışlama yalnız açık kimlik listesiyle yapılır.

### Premium mobil arayüz

- Üst uygulama başlığı ve ekranın ilgili alt eylem çubuğu mobilde sabittir.
- Alt düğmelere ulaşmak için sayfanın sonuna kaydırmak gerekmez.
- Maç ekranı mobilde tek kokpit düzenindedir: skor tabelası üstte, saha ve kronometre ortada, maç araçları altta.
- Skor tabelası; maç dakikası, toplam süre, devre, ek süre ve iki ayaklı toplam skoru gösterebilir.
- Sırası gelen takım kendi renginde retro glow ile vurgulanır.
- Takım renkleri takım adı belirlenirken 10 görünür renk kartından seçilir; açılır liste kullanılmaz.
- Maç sahnesindeki gereksiz öğeler azaltıldı.
- Yazı tura verilen süre içinde tamamlanmazsa cezasız olarak otomatik sonuçlanır.

### Oynanış

- Önce futbolcu, sonra olay kronometresi kullanılır.
- `7 = Şut`; şut için ikinci kronometre atışı yapılır.
- Açık oyun şut sonucu: `0 korner`, `9 gol`; diğer rakamlar kurtarış, direk veya auttur.
- Frikik ve penaltıda çift rakam gol; tek rakam kurtarış, direk veya auttur.
- Aynı hücumda üst üste en fazla iki pas yapılabilir; üçüncü olay atışında pas rakamları taç/auta dönüşür.
- Üçüncü korner kullanılmaz, doğrudan penaltıya dönüşür.
- Gecikmeler maç süresiyle orantılı ve üst sınırı olan `90+` ek süre üretir.
- Gol ve asistler oyuncu bazında tutulur. Duran top golünde önceki açık oyun pası asist sayılmaz.

## Yerel çalıştırma

Node.js 20 önerilir.

```bash
npm install --registry=https://registry.npmjs.org/
npm start
```

Oyun:

```text
http://localhost:8080
```

Sağlık kontrolü:

```text
http://localhost:8080/health
```

Testler:

```bash
npm test
npm run audio:check
```

## Render

Yeni kurulum için [`RENDER-KURULUM.md`](RENDER-KURULUM.md), mevcut projeyi yükseltmek için [`GUNCELLEME-KURULUM.md`](GUNCELLEME-KURULUM.md) dosyasını kullan.

## Bilinen altyapı sınırı

Odalar sunucunun belleğindeki `Map` yapısında tutulur. Render ücretsiz servisi yeniden başlar veya uyuyup yeni instance ile açılırsa aktif odalar kaybolabilir. Hobi ve test maçları için uygundur; kalıcı lig, hesap ve yarım kalan maça dönme için Redis/veritabanı gerekir.
