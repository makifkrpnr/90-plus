# 90+ v5 — Test Raporu

## Otomatik testler

`npm test` sonucu: **24/24 geçti.**

Kapsam: olay tablosu, şut alt atışı, ayrıntılı frikik/penaltı sonucu, iki pas kilidi, üçüncü korner penaltısı, kartlar, ihlaller, ek süre, yazı tura, devre başlangıçları, online mola ve iki ayaklı toplam skor.

## Veri ve statik kontroller

- 2.121 benzersiz futbolcu; yinelenen ID yok.
- Kullanıcının açıkça dışlanmasını istediği isim havuzda yok.
- 67 opsiyonel ses yolu tanımlı.
- HTML'de yinelenen `id` yok.
- `app.js`, `core.js`, `audio.js`, `players.js`, `server.js` ve online motor sözdizimi doğrulandı.

## Mobil tarayıcı testi

412×915 görünümde şu akış çalıştırıldı:

`Ana Menü → AI/Co-op → Kadro → Ayarlar → Brifing → Yazı Tura → Maç`

Doğrulananlar:

- Sabit header ve alt işlem çubukları
- Kaydırmasız mobil maç kokpiti
- Doğru dikey saha çizgileri
- Mola perdesinde Olaylar/Kurallar/Kadrolar/Devam Et
- Moladan devam etme
- Transfer Düellosu onay penceresi ve eğitim kartı
- Yazı tura sonrası doğru ilk/ikinci yarı başlangıcı
- Açık/koyu tema temel kontrastları

Tam Socket.IO iki cihaz testi bu çalışma ortamında npm indirmesi zaman aşımına uğradığı için yeniden koşturulamadı. Sunucu/online motor testleri geçti; Render yapılandırması Socket.IO'yu resmi npm deposundan kurar.
