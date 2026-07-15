# 90+ v4 — Render Kurulumu

## Yeni servis oluşturma

1. ZIP’i aç ve klasörün içindeki bütün dosyaları GitHub reposunun köküne yükle.
2. GitHub reposunda `package-lock.json` bulunmadığını kontrol et.
3. Render’da **New → Blueprint** seç.
4. GitHub reposunu bağla.
5. Render `render.yaml` dosyasını bulduğunda **Apply** seç.

Blueprint ayarları:

```text
Servis: Web Service
Runtime: Node
Plan: Free
Region: Frankfurt
Health Check: /health
Start Command: npm start
```

Build komutu:

```bash
npm install --omit=dev --no-package-lock --registry=https://registry.npmjs.org/ && npm ls socket.io
```

Bu komut Socket.IO’yu üretim bağımlılığı olarak kurar ve build sırasında gerçekten bulunduğunu doğrular.

## Başarılı log örneği

```text
socket.io@4.8.1
Running 'npm start'
90+ çalışıyor: http://0.0.0.0:10000
```

Port numarasını Render belirler; `server.js` otomatik olarak `process.env.PORT` değerini kullanır.

## Sağlık kontrolü

Deploy tamamlandıktan sonra:

```text
https://SENIN-SERVISIN.onrender.com/health
```

Beklenen temel cevap:

```json
{"ok":true,"rooms":0}
```

## Arkadaşınla test

- İki oyuncu da aynı `onrender.com` adresini açar.
- Bir oyuncu oda oluşturur.
- Diğeri altı haneli kodla katılır.
- Oda sahibi iç saha, katılan oyuncu deplasman olur.
- Brifingde ilk hazır olan taraf 30 saniyelik sayacı başlatır.
- Maç ekranında iki taraf ayrı ayrı başlangıç kronometresi atışı yapar.

## Deploy hatasında

Önce şu üç noktayı kontrol et:

1. Render’ın bağlı olduğu branch GitHub’daki güncel branch mi?
2. `package.json` sürümü `4.0.0` görünüyor mu?
3. Build logunda uzun `npm install --omit=dev ...` komutu çalışıyor mu?

Ardından:

```text
Manual Deploy → Clear build cache & deploy
```

seçeneğini kullan.
