# 90+ — v3 Maç Merkezi

Tarayıcıda çalışan, mobil öncelikli retro kronometre futbol oyunu.

## Oyun modları

- Yapay zekaya karşı
- Aynı cihazda iki oyuncu
- Oda koduyla uzaktan arkadaş maçı (Socket.IO)
- Çevrimdışı PWA desteği (online arkadaş modu hariç)

## v3 yenilikleri

- Yeni iki aşamalı oynanış: **önce oyuncu seçimi, sonra olay atışı**
- Pas sonrası aynı takım için yeniden oyuncu seçimi
- İlk devreyi Takım 1, ikinci devreyi Takım 2 başlatır
- Devre arası manuel “İkinci Devreyi Başlat” düğmesi
- Uzaktan maçta düğmeyi yalnız başlama hakkı olan oyuncu kullanabilir
- Okunabilir, uzun olay animasyonları
- Mobilde sabit skor alanı ve sabit alt maç çubuğu
- Büyük devre, dakika ve skor tipografisi
- Sırası gelen takımın skor alanında işaretlenmesi
- Maç sırasında açılabilir kadro ekranı
- Oyuncu bazında gol, sarı kart, direkt kırmızı ve ikinci sarıdan kırmızı işaretleri
- Retro/SofaScore esintili maç sonu zaman çizelgesi
- Açık ve koyu tema
- Tamamen Türkçe arayüz
- “Nasıl Oynanır?” sayfası
- 1–10 dakika arasında maç süresi
- Oyuncu havuzu 101’den **174 oyuncuya** çıkarıldı

## Yerelde çalıştırma

Node.js 20 önerilir.

```bash
npm install
npm start
```

Ardından:

```text
http://localhost:8080
```

Sağlık kontrolü:

```text
http://localhost:8080/health
```

## Render

Projede `render.yaml` hazırdır. GitHub reposunu Render Blueprint olarak bağlayabilirsin.

Build komutu:

```bash
npm install --registry=https://registry.npmjs.org/ --package-lock=false --include=prod && npm ls socket.io
```

Start komutu:

```bash
npm start
```

## Nippo font kurulumu

Arayüz Nippo font yollarına hazırdır. Kendi font dosyalarını GitHub reposunda şu klasöre ekle:

```text
assets/fonts/
```

Dosya adları:

```text
Nippo-Regular.ttf
Nippo-Light.ttf
Nippo-Medium.ttf
Nippo-Bold.ttf
Nippo-Extralight.ttf
```

Fontlar eklenmezse oyun sistem yazı tipiyle çalışmaya devam eder.

## Testler

```bash
npm test
```

Testler; iki aşamalı atış, gol, pas sonrası oyuncu seçimi, korner penaltısı, süre ihlali ve ikinci devre başlangıç yetkisini kapsar.
