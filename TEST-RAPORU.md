# 90+ v4 — Test Raporu

## Otomatik oyun motoru testleri

Komut:

```bash
npm test
```

Sonuç: **19/19 test geçti.**

Kapsanan başlıklar:

- 0–9 ana olay tablosu
- Üçüncü kornerin kullanılmadan penaltıya dönüşmesi
- Faul sonucu ve bağımsız kart alt atışları
- Tek/çift kurtarış-gol kuralı
- İkinci sarıdan kırmızı
- Beş kademeli 10 saniye ihlal sistemi
- Uzatma ve gecikmeye bağlı ek süre sınırları
- Hükmen skor
- Aday seçiminde mod yöntemi
- Online başlama hakkı kronometresi
- Eşitlikte yeniden başlama atışı
- Başlama atışında cezasız otomatik rakam
- Önce oyuncu, sonra olay akışı
- İlk ve ikinci yarı başlangıç yetkileri
- Her oyuncu için ayrı ve kümülatif 60 saniyelik mola bütçesi

## Statik kontroller

- `js/*.js`, `server/*.js`, `server.js` ve `sw.js` dosyaları `node --check` ile doğrulandı.
- HTML içinde 149 benzersiz `id` bulundu; yinelenen `id` yok.
- Yerel script, stil, manifest ve ikon bağlantıları mevcut.
- Oyuncu havuzu: 472 benzersiz futbolcu, 54 milliyet, 52 lig.
- Ses manifesti: 67 isteğe bağlı dosya yolu.
- Pakette `package-lock.json`, `node_modules` veya font dosyası bulunmuyor.

## Mobil arayüz kontrolü

390×844 mobil görünümde şu akış tarayıcı motoruyla çalıştırıldı:

```text
Ana Menü → AI → Karışık Kadro → Ayarlar → Maç Brifingi → Başlama Atışı
```

Kontrol edilenler:

- Sabit mobil üst başlık
- Sabit alt eylem çubuğu
- Dikey saha çizgileri
- Açık ve koyu tema kontrastı
- Başlama hakkı kartı ve kronometre
- Oyuncu seçimi → olay atışı akışı

## Çevrim içi test notu

Sunucu ve çevrim içi motorun sözdizimi ile 9 çevrim içi/motor senaryosu yerelde test edildi. Bu çalışma ortamında npm kayıt deposuna ağ erişimi olmadığı için Socket.IO paketinin sıfırdan indirilmesini gerektiren tam iki-tarayıcılı uçtan uca test yeniden çalıştırılamadı. `package.json` ve `render.yaml`, Render’ın resmî npm deposundan `socket.io@4.8.1` kuracağı şekilde hazırlanmıştır.
