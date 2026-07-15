# 90+ v6 — Mevcut Render Projesini Güncelleme

## 1. Güvenli yedek

GitHub Desktop'ta mevcut `90-plus` reposunu aç ve önce **Fetch origin / Pull origin** yap.

İstersen mevcut çalışan sürüme geri dönebilmek için GitHub'da `v5-backup` etiketi veya ayrı bir branch oluştur.

## 2. Ses ve fontları yedekle

Mevcut repondaki şu iki klasörü geçici olarak masaüstüne kopyala:

```text
assets/audio/
assets/fonts/
```

Güncelleme paketi kullanıcının özel ses ve font dosyalarını tekrar dağıtmaz. Bu yedek, Finder'ın klasörü tamamen değiştirmesi hâlinde dosyalarını korur.

## 3. Dosyaları değiştir

Bu paketteki `90-plus-v6` klasörünün içeriğini, klonlanmış repo klasörünün köküne kopyala. ZIP dosyasının kendisini repoya koyma.

Ardından yedeklediğin `assets/audio/` ve `assets/fonts/` klasörlerini aynı yerlere geri kopyala. Böylece yeni kod gelirken kendi seslerin ve Nippo fontların korunur.

Eski sürümden aşağıdakiler varsa sil:

```text
kronometre-futbol-tek-dosya.html
js/players.js
package-lock.json
.DS_Store
```

Nippo fontların mevcut repoda zaten bulunuyorsa `assets/fonts/` klasörünü koru. Güncelleme ZIP'i font dosyalarını tekrar dağıtmayabilir.

Seslerini şu yapıda koru:

```text
assets/audio/<kategori>/<dosya>.mp3
```

Tam liste: `SES-DOSYA-LISTESI.md`.

## 4. GitHub Desktop

Summary:

```text
90+ v6 premium turnuva güncellemesi
```

Ardından:

```text
Commit to main
Push origin
```

## 5. Render

Push sonrasında otomatik deploy başlamalı. Başlamazsa:

```text
Manual Deploy
Clear build cache & deploy
```

Build komutu `render.yaml` içinde hazırdır:

```bash
npm install --omit=dev --no-package-lock --registry=https://registry.npmjs.org/ && npm ls socket.io
```

Başarılı logda `socket.io@4.8.1` ve ardından şu satır görünür:

```text
90+ çalışıyor: http://0.0.0.0:10000
```

## 6. Hızlı kontrol listesi

- `/health` adresi `{"ok":true,...}` döndürüyor mu?
- Ana menüde ayrı Ayarlar ekranı açılıyor mu?
- Oda oluşturur oluşturmaz kod görünüyor mu?
- İkinci kullanıcı kadro kurulmadan odaya girebiliyor mu?
- Aynı takım rengi ikinci kullanıcıda pasif mi?
- Transfer Düellosunda her tur üç yeni aday geliyor mu?
- Mobilde üst başlık ve alt eylemler sabit mi?
- Dörtlü odada dört kişi görünüyor mu?

PWA eski dosyaları gösterirse uygulamayı tamamen kapatıp yeniden aç veya tarayıcı site verilerini bir kez temizle. Service worker önbellek adı v6 için yenilenmiştir.
