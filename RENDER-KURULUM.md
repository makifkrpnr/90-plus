# Render Kurulumu — 90+ v3

## Yeni kurulum

1. Proje dosyalarını GitHub reposunun köküne yükle.
2. Render’da `New → Blueprint` seç.
3. GitHub reposunu bağla.
4. `render.yaml` otomatik okununca `Apply` düğmesine bas.

Hazır ayarlar:

```text
Runtime: Node
Plan: Free
Region: Frankfurt
Health Check: /health
Start: npm start
```

Build sırasında logda şunu görmelisin:

```text
socket.io@4.8.1
```

## Mevcut servisi güncelleme

GitHub’a v3 dosyalarını Commit ettikten sonra otomatik deploy başlamazsa:

```text
Manual Deploy → Clear build cache & deploy
```

## Test

Deploy bittikten sonra:

```text
https://SERVIS-ADRESIN.onrender.com/health
```

Beklenen cevap:

```json
{"ok":true,"rooms":0}
```

Daha sonra aynı ana bağlantıyı iki cihazda aç. Bir cihaz oda oluşturur, diğer cihaz kodla katılır.
