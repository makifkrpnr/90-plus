# 90+ — Render Kurulumu

## 1. GitHub deposu oluştur

1. GitHub'da **New repository** seç.
2. Depo adını örneğin `90-plus` yap.
3. Depoyu boş oluştur; README veya başka başlangıç dosyası eklemek zorunda değilsin.
4. Bu paketi aç ve klasörün **içindeki bütün dosyaları** GitHub deposunun köküne yükle.
5. `render.yaml`, `package.json`, `server.js` ve `index.html` dosyalarının depo açıldığında doğrudan görünmesi gerekir.

> ZIP dosyasını açmadan GitHub'a tek dosya olarak yüklemek çalışmaz.

## 2. Render Blueprint oluştur

1. Render Dashboard'a gir.
2. **New → Blueprint** seç.
3. GitHub hesabını bağla.
4. `90-plus` deposunu seç.
5. Render kökteki `render.yaml` dosyasını okuyacak.
6. Servis planının **Free**, bölgenin **Frankfurt** olduğunu kontrol et.
7. **Apply** düğmesine bas.

Render şu komutları otomatik kullanır:

```text
Build Command: npm ci --omit=dev
Start Command: npm start
Health Check Path: /health
```

## 3. Yayın adresini test et

Dağıtım bittikten sonra Render buna benzer bir adres verir:

```text
https://90-plus-xxxx.onrender.com
```

Şunları kontrol et:

1. Ana sayfa açılıyor mu?
2. Adresin sonuna `/health` ekleyince `{"ok":true,"rooms":0}` benzeri cevap geliyor mu?
3. Bir tarayıcıda oda oluşturup gizli sekmede kodla odaya katılabiliyor musun?
4. Gerçek uzaktan test için iki farklı cihazda aynı Render adresini aç.

## Ücretsiz plan davranışı

- Yaklaşık 15 dakika hiç HTTP veya WebSocket trafiği olmazsa servis uyuyabilir.
- İlk ziyaret servis uyurken yapılırsa açılış yaklaşık bir dakika sürebilir.
- Aktif Socket.IO bağlantısı ping/pong mesajları ürettiği için devam eden maç sırasında servis aktif kalır.
- Odalar RAM'de saklanır. Yeni deploy veya servis yeniden başlatması açık odaları siler.

## Hata olursa

Render servisinde **Logs** bölümünü aç. Başarılı başlangıçta şunu görmelisin:

```text
90+ çalışıyor: http://0.0.0.0:10000
```

Sık görülen kontroller:

- Servis türü **Static Site** değil, **Web Service** olmalı.
- `server.js` ve `package.json` depo kökünde olmalı.
- Start Command `npm start` olmalı.
- `/health` adresi 200 yanıtı vermeli.
