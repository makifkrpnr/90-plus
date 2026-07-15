# 90+ v4 — Mevcut Render Projesini Güncelleme

Bu yöntem, daha önce Render’da yayınladığın `90-plus` servisini v4’e yükseltir.

## 1. Yedek al

GitHub reposunun mevcut hâlini bir branch veya ZIP olarak saklaman iyi olur.

## 2. Eski kilit ve yedek dosyaları kaldır

Repo kökünde varsa şunları sil:

```text
package-lock.json
js/app.v3.backup.js
server/online-engine.v3.backup.js
server.v3.backup.js
```

`package-lock.json` özellikle kaldırılmalıdır; Render bağımlılıkları resmî npm deposundan yeniden kuracaktır.

## 3. v4 dosyalarını yükle

ZIP’i aç. `90-plus-v4` klasörünün içindeki bütün dosya ve klasörleri GitHub reposunun köküne yükle ve eskilerinin üzerine yaz.

Önemli dosyalar:

```text
index.html
styles.css
js/app.js
js/audio.js
js/core.js
js/players.js
server.js
server/online-engine.js
package.json
render.yaml
sw.js
```

## 4. Kendi fontlarını ekle

Kendi Nippo font dosyalarını şu klasöre yerleştir:

```text
assets/fonts/
```

Fontlar pakette bulunmaz. Dosya adlarını değiştirme.

## 5. Hazır sesleri ekle

Ürettiğin sesleri şu kökün altında ilgili klasörlere koy:

```text
assets/audio/
```

Dosya varsa oyun çalar; yoksa hata göstermez. Tam yollar `SES-DOSYA-LISTESI.md` içindedir.

Yerelde hangi seslerin bulunduğunu görmek için:

```bash
npm run audio:check
```

## 6. GitHub’a Commit et

Örnek mesaj:

```text
90+ v4 stadium update
```

## 7. Render’ı temiz kurulumla yeniden yayınla

Render servisinde:

```text
Manual Deploy
→ Clear build cache & deploy
```

Build logunda `socket.io@4.8.1` görünmelidir. Ardından sunucu `npm start` ile açılır.

## 8. Sağlık kontrolü

```text
https://SENIN-SERVISIN.onrender.com/health
```

Beklenen temel cevap:

```json
{"ok":true,"rooms":0}
```

## 9. Hızlı çevrim içi test

1. Bağlantıyı normal tarayıcıda aç ve oda oluştur.
2. Aynı bağlantıyı gizli pencerede veya ikinci telefonda aç.
3. Kodla katıl.
4. İki taraf da kadrosunu hazırlasın.
5. Brifing ekranında bir taraf “Maça Hazırım” desin.
6. Diğer tarafın 30 saniyelik uyarıyı gördüğünü doğrula.
7. Maç ekranında iki taraf da başlama hakkı kronometresini kullansın.
8. Sırası gelen taraf mola alsın; diğer ekranda saydam mola perdesini kontrol et.

## PWA önbelleği

Eski sürüm görünürse uygulamayı tamamen kapatıp yeniden aç. Gerekirse tarayıcı site verilerini temizle veya ana ekrandaki eski uygulamayı kaldırıp yeniden ekle. Service worker önbelleği v4 olarak güncellenmiştir.
