# Mevcut Render Projesini v3’e Güncelleme

1. ZIP dosyasını bilgisayarında aç.
2. İçindeki tüm dosya ve klasörleri GitHub’daki mevcut `90-plus` reposunun köküne yükle.
3. GitHub eski dosyaların üzerine yazmayı sorarsa onayla.
4. Eski `kronometre-futbol-tek-dosya.html` dosyası repoda kalmışsa silebilirsin.
5. Kendi Nippo font dosyalarını `assets/fonts/` klasörüne ayrıca yükle.
6. Değişiklikleri Commit et.
7. Render otomatik deploy başlatmazsa:
   - `Manual Deploy`
   - `Clear build cache & deploy`
8. Deploy sonunda `/health` adresini kontrol et.

Örnek:

```text
https://senin-adresin.onrender.com/health
```

Beklenen cevap:

```json
{"ok":true,"rooms":0}
```
