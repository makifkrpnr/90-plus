# 90+ v6 — Render'a İlk Kurulum

## GitHub

1. Yeni bir GitHub reposu oluştur.
2. Proje klasörünün içindeki dosyaları repo köküne koy.
3. `node_modules`, ZIP, WAV ve `.DS_Store` yükleme; `.gitignore` bunları dışlar.
4. GitHub Desktop ile Commit ve Push yap.

## Render Blueprint

1. Render'da **New → Blueprint** seç.
2. GitHub reposunu bağla.
3. Kökteki `render.yaml` bulunduğunda **Apply** seç.

Hazır ayarlar:

```text
Runtime: Node
Plan: Free
Region: Frankfurt
Build: npm install --omit=dev --no-package-lock --registry=https://registry.npmjs.org/ && npm ls socket.io
Start: npm start
Health: /health
```

## Kontrol

Render adresinin sonuna `/health` ekle:

```text
https://<servis-adı>.onrender.com/health
```

Beklenen biçim:

```json
{"ok":true,"rooms":0}
```

Sonra aynı adresi iki farklı tarayıcı/cihazda açarak oda kodlu modu dene.

## Ücretsiz servis notu

Sunucu yeniden başlarsa bellekteki aktif odalar silinir. Uzun vadeli kalıcılık için Redis veya veritabanı eklenmelidir.
