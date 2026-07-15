# 90+ — v4 Stadyum Sürümü

Mobil öncelikli, tarayıcıda çalışan retro kronometre futbol oyunu. Oyuncu önce kronometreyle futbolcuyu, ikinci atışta maç olayını belirler. Yapay zekâ, aynı cihazda iki kişi ve oda koduyla uzaktan arkadaş maçı desteklenir.

## Oyun modları

- **Yapay zekâya karşı:** tamamen istemci tarafında oynanır.
- **Aynı cihaz:** iki oyuncu telefonu sırayla kullanır.
- **Arkadaşınla oyna:** Socket.IO üzerinden oda oluşturma ve altı haneli kodla katılma.
- **PWA:** çevrimdışı AI/aynı cihaz desteği ve ana ekrana ekleme.

## v4’ün başlıca yenilikleri

- Oyuncu havuzu **472 futbolcuya** çıkarıldı.
- Kriter bazlı kadroda dönem, milliyet ve lig filtreleri birlikte ve katı biçimde uygulanır.
- Aday seçimi ekranında kronometre rakamının `rakam mod aday sayısı` yöntemiyle kimi seçtiği açıklanır.
- Mobilde aday kartları görünür kalırken kronometreye erişilebilir.
- Doğru saha ölçülerini temsil eden dikey futbol sahası çizimi eklendi.
- Sabit mobil üst başlık, sabit alt eylem çubuğu ve maç içi sabit bilgi paneli eklendi.
- Açık/koyu tema kontrastları yenilendi.
- Zarif iki aşamalı maç butonu: **Oyuncuyu Seç → Olayı Belirle**.
- Korner artık fiziksel olarak kullanılmaz; sayaç artar, üçüncü korner otomatik penaltıya dönüşür.
- Atışlarda harcanan gecikmeye ve maç süresine göre makul **90+ ek süre** hesaplanır.
- Ayarlardan sonra kurallar ve 0–9 olay tablosunun bulunduğu maç brifingi açılır.
- Brifing sayfasına maç sırasında yeniden bakılabilir.
- Online maçta ilk hazır olan oyuncu 30 saniyelik başlangıç sayacını başlatır; ikinci oyuncu onaylamazsa maç ekranı otomatik açılır.
- Maç doğrudan başlamaz: iki taraf cezasız 10 saniyelik kronometre atışı yapar; yüksek rakam ilk yarıya, diğer taraf ikinci yarıya başlar. Eşitlikte atış tekrarlanır.
- Online maçta her oyuncunun, yalnız kendi sırasında kullanabildiği toplam **60 saniyelik mola hakkı** vardır.
- Mola süresi parça parça kullanılabilir ve rakipte saydam bilgilendirme perdesi görünür.
- Tarayıcı/PWA geri tuşu uygulama içi ekran geçmişinde çalışır.
- Toplam **67 isteğe bağlı ses yolu** hazırdır. Dosya varsa çalınır, yoksa oyun hata vermeden sessiz devam eder.

## Oyuncu veri politikası

Oyuncu listesi elle düzenlenen açık bir veri havuzudur. Kullanıcının açıkça çıkarılmasını istediği isimler kimlik tabanlı engel listesinde tutulur. Hukuki veya siyasi ilişki konusunda otomatik çıkarım yapılmaz; yeni bir dışlama gerekiyorsa açıkça listeye eklenir.

## Yerelde çalıştırma

Node.js 20 önerilir.

```bash
npm install
npm start
```

Tarayıcı:

```text
http://localhost:8080
```

Sağlık kontrolü:

```text
http://localhost:8080/health
```

Oyun motoru testleri:

```bash
npm test
```

Ses dosyası kontrolü:

```bash
npm run audio:check
```

## Ses dosyaları

Sesleri tam dosya adlarıyla şu kökün altına yerleştir:

```text
assets/audio/
```

Tam liste için `SES-DOSYA-LISTESI.md` dosyasına bak. Menü ve stadyum ambiyansı dahil bütün sesler isteğe bağlıdır.

## Nippo fontu

CSS, kullanıcının kendi Nippo font dosyalarını şu klasörden yüklemeye hazırdır:

```text
assets/fonts/
```

Beklenen dosya adları:

```text
Nippo-Regular.ttf
Nippo-Light.ttf
Nippo-Medium.ttf
Nippo-Bold.ttf
Nippo-Extralight.ttf
```

Font dosyaları pakete eklenmemiştir. Eklenmezse güvenli sistem fontları kullanılır.

## Render

Projede `render.yaml` hazırdır. Ayrıntılı kurulum için `RENDER-KURULUM.md`, mevcut projeyi güncellemek için `GUNCELLEME-KURULUM.md` dosyasını kullan.
