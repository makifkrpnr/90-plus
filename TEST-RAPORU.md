# 90+ v6 — Test Raporu

## Otomatik testler

Komut:

```bash
npm test
```

Sonuç: **37 test geçti, 0 test başarısız.**

Doğrulanan başlıklar:

- Ana olay cetveli ve `7 = Şut`
- Şut alt atışı
- İki pas sınırı
- Üçüncü kornerden penaltı
- Faul ve kart alt tabloları
- İkinci sarıdan kırmızı
- 10 saniye ihlal kademeleri
- Maç süresine göre ek süre sınırı
- İki ayaklı toplam skor
- Gol ve asist zinciri
- Duran top golünde hatalı asist yazılmaması
- Yazı tura / otomatik başlama zaman aşımı
- İki ayrı 60 saniyelik mola bütçesi
- İkinci devre başlangıç yetkisi
- 2.264 benzersiz oyuncu
- Açık dışlama listesinin uygulanması
- Katı dönem, milliyet, lig, mevki ve puan filtreleri
- Kullanılmış oyuncunun adaylara yeniden girmemesi
- Otomatik mevki yerleşimi
- Klasik kupa, Dünya Kupası ve 4 kişilik kupa fikstürleri

## Sözdizimi ve statik kontroller

Aşağıdaki dosyalar `node --check` ile doğrulandı:

- `server.js`
- `server/online-engine.js`
- `js/app.js`
- `js/audio.js`
- `js/core.js`
- `js/player-store.js`
- `js/modules/*.js`
- `sw.js`

Oyuncu verisi kontrolü:

```text
version: 6
oyuncu: 2264
benzersiz ID: 2264
Hakan Şükür eşleşmesi: 0
```

Eski `js/players.js`, tek dosyalı HTML ve `.DS_Store` bulunmadığı doğrulandı.

## Socket.IO entegrasyon testi

Yerel gerçek sunucu ve altı Socket.IO istemcisiyle doğrulandı:

- Oda kodu anında oluşturuldu.
- İkinci oyuncu kodla katıldı.
- Aynı takım rengi sunucu tarafından reddedildi.
- Farklı renkli iki kadro kabul edildi.
- Dört kişilik oda dört bağlantıyı kabul etti.
- Oda yöneticisinin rastgele kadro ayarı dört benzersiz kadroyu hazırladı.

## Sağlık kontrolü

Yerel `/health` cevabı başarıyla alındı:

```json
{"ok":true,"rooms":0}
```

## Ses kontrolü

`npm run audio:check` 67 isteğe bağlı yolu tarar. Test paketinde ses dosyası yoksa `0/67` göstermesi hata değildir; mevcut dosyalar isimleri doğruysa otomatik kullanılır.

## Görsel test notu

Bu çalışma ortamındaki Chromium yerel siteyi ekran görüntüsüyle açarken kurum politikası nedeniyle takıldı. Bu nedenle son piksel ve gerçek cihaz görsel kontrolü kullanıcı cihazında yapılmalıdır. Kod tarafında responsive CSS, sabit mobil header/footer ve ekran kimlikleri statik olarak kontrol edildi; otomatik motor ve ağ testleri bundan bağımsız olarak geçti.
