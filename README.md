# 90+

90+; kronometrenin son rakamıyla pas, gol, faul, kart, korner, frikik ve penaltı olaylarını üreten mobil öncelikli retro futbol oyunudur.

## Bu sürümde neler var?

- Yapay zekaya karşı tek oyuncu
- Aynı cihazda sırayla oynanan Co-op
- **Play With a Friend:** oda oluşturma, 6 haneli kodla katılma ve iki farklı cihazdan canlı maç
- Karışık, manuel ve kriter bazlı kadro kurma
- 10 saniyelik tur sınırı ve kademeli vakit ihlali cezaları
- 3 korner = penaltı, bağımsız faul/kart alt atışları, ikinci sarıdan kırmızı
- İki devre, uzatma ve seri penaltı
- PWA/offline yapı: AI ve aynı cihaz modları internet olmadan çalışır

## Hızlı kurulum

Gereksinim: **Node.js 18 veya üzeri**.

```bash
npm install
npm start
```

Tarayıcıda aç:

```text
http://localhost:8080
```

Mac'te `start-mac.command`, Windows'ta `start-windows.bat` dosyası da kullanılabilir.

> Arkadaş modu çift tıklanan tek bir HTML dosyasıyla çalışmaz. Oda kodları ve maç senkronizasyonu için `npm start` ile açılan Node.js sunucusu gerekir.

## Play With a Friend akışı

1. İlk oyuncu **Play With a Friend → Create a Room** seçer.
2. Oluşan 6 haneli kodu arkadaşına gönderir.
3. İkinci oyuncu **Join With a Code** alanına kodu girer.
4. İki oyuncu kendi cihazında kendi kadrosunu kurar.
5. Ev sahibi maç ayarlarını seçer.
6. İki kadro da hazır ve iki oyuncu da bağlıysa ev sahibi maçı başlatır.

Maç motoru sunucuda otoriter çalışır. Skor, tur, kartlar, kornerler, vakit ihlalleri ve olay zaman çizelgesi iki cihaza aynı oyun durumu olarak gönderilir.

## Aynı Wi-Fi üzerinde iki cihazla test

Sunucuyu bilgisayarda çalıştırdıktan sonra bilgisayarın yerel IP adresini bulun. İki cihazdan da örneğin şu adresi açın:

```text
http://192.168.1.25:8080
```

İşletim sistemi güvenlik duvarının 8080 portuna izin vermesi gerekebilir.

## İnternetten uzaktan oynatma

Projeyi WebSocket destekleyen herhangi bir Node.js barındırma hizmetine yükleyin ve başlangıç komutu olarak şunu kullanın:

```text
npm start
```

Sunucu `PORT` ortam değişkenini otomatik kullanır. İki oyuncu da dağıtım sonrasında oluşan aynı HTTPS adresini açmalıdır.

### Mevcut altyapı sınırı

Odalar sunucu belleğinde tutulur. Sunucu yeniden başlatılırsa açık odalar silinir. MVP için bu bilinçli olarak sade tutuldu; kalıcı oda, kullanıcı hesabı, lig ve sezon özellikleri için Redis/veritabanı eklenebilir.

## Testler

```bash
npm test
```

Test paketi hem temel futbol kurallarını hem de online sunucu maç motorunu doğrular.

## Önemli dosyalar

- `server.js` — statik web sunucusu, oda kodları ve Socket.IO bağlantıları
- `server/online-engine.js` — uzaktan maçların sunucu tarafı oyun motoru
- `js/app.js` — ekranlar, yerel modlar ve online istemci
- `js/core.js` — ortak saf kural fonksiyonları
- `tests/` — temel ve online motor testleri
- `docs/tasarim-plani-v2.md` — özgün detaylı oyun tasarım dokümanı

## Telif notu

Bu oyun fantasy/eğitim amaçlıdır. Marka ve oyuncu isimleri ilgili sahiplerine aittir; resmi bağlantı yoktur. Kulüp logosu ve oyuncu fotoğrafı kullanılmaz.

## Render'a ücretsiz yayınlama

Bu proje Render için hazırdır. Kök dizindeki `render.yaml` şu ayarları otomatik tanımlar:

- Web Service / Node.js
- Ücretsiz instance
- Frankfurt bölgesi
- `npm ci --omit=dev` build komutu
- `npm start` başlangıç komutu
- `/health` sağlık kontrolü
- Her GitHub commit'inde otomatik yeniden yayınlama

### GitHub üzerinden kurulum

1. GitHub'da boş bir depo oluşturun (ör. `90-plus`).
2. Bu klasörün **içindeki dosyaları** deponun kök dizinine yükleyin. ZIP dosyasını doğrudan repo içine koymayın.
3. Render Dashboard'da **New → Blueprint** seçin.
4. GitHub hesabınızı bağlayıp `90-plus` deposunu seçin.
5. Render, `render.yaml` dosyasını okuyunca **Apply** seçeneğine basın.
6. Dağıtım tamamlandığında oluşan `https://...onrender.com` adresini iki oyuncu da açsın.

Alternatif olarak **New → Web Service** ile manuel kurulum yapılabilir:

```text
Runtime: Node
Region: Frankfurt
Branch: main
Build Command: npm ci --omit=dev
Start Command: npm start
Health Check Path: /health
Instance Type: Free
```

### Render ücretsiz plan notları

- Servis 15 dakika boyunca HTTP isteği veya WebSocket mesajı almazsa uykuya geçebilir.
- İlk açılışta uyanması yaklaşık bir dakika sürebilir.
- Aktif bir Socket.IO bağlantısında ping/pong trafiği bulunduğu için devam eden maç sırasında uykuya geçmemesi beklenir.
- Odalar RAM'de tutulur. Yeni deploy, platform bakımı veya servis yeniden başlatması açık odaları siler.
