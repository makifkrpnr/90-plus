# 90+ v5 — Render Kurulumu

GitHub reposuna dosyaları yükledikten sonra Render'da **New → Blueprint** seç ve repoyu bağla. `render.yaml` şu ayarları uygular:

- Node.js Web Service
- Free plan, Frankfurt
- Build: Socket.IO kurulumu ve doğrulaması
- Start: `npm start`
- Health: `/health`

Yayın adresinde önce `/health`, sonra normal oyun bağlantısını aç. Ücretsiz servis hareketsizlikten sonra uyuyabilir; ilk açılışta kısa süre beklemek normaldir.
