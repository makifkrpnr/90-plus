# 90+ v6 — Mimari Notları

## İstemci

```text
index.html
styles.css
js/
├── app.js                     # Ekran akışı ve ana uygulama denetleyicisi
├── audio.js                   # Ses manifesti, tek efekt kanalı, ambiyans ve ducking
├── core.js                    # Saf maç kuralları ve hesaplar
├── player-store.js            # Oyuncu JSON'unu ihtiyaç anında lazy-load eder
└── modules/
    ├── settings.js            # Kalıcı uygulama tercihleri
    ├── squad-builder.js       # Filtre, aday, formasyon ve kadro algoritmaları
    ├── tournament.js          # Grup, fikstür, puan ve eleme hesapları
    └── ui-shell.js            # Ekran kabuğu / ortak arayüz yardımcıları
```

`app.js` artık oyuncu verisini, ses motorunu, ayar saklamayı, turnuva hesaplarını veya kadro algoritmalarını bünyesinde taşımaz. Buna rağmen ekranlar arası koordinasyon, maç görünümü ve Socket.IO olayları aynı denetleyicide olduğu için dosya hâlâ büyüktür. Bir sonraki parçalama şu sırayla güvenli yapılabilir:

1. `match-controller.js`
2. `online-controller.js`
3. `duel-controller.js`
4. `draft-controller.js`

Bu aşamada aceleyle bölüp çalışma durumunu bozmak yerine, saf ve test edilebilir ağır sorumluluklar ayrılmıştır.

## Oyuncu verisi

- Tarayıcı `data/players.json` dosyasını ilk ana menü açılışında indirmez.
- `PlayerStore.load()` yalnız kadro/draft gerektiğinde çağrılır.
- Service worker oyuncu JSON'u için stale-while-revalidate benzeri ayrı önbellek kullanır.
- Node.js sunucusu aynı JSON'u yalnız sunucu başlangıcında bir kez belleğe alır; bu, tarayıcıya otomatik gönderildiği anlamına gelmez.

## Sunucu

```text
server.js                 # HTTP, Socket.IO, oda ve turnuva orkestrasyonu
server/online-engine.js   # Yetkili çevrim içi maç motoru
```

Sunucu sonuçların iki istemcide ayrı hesaplanmasına izin vermez. Oyun durumu sunucuda hesaplanır ve taraflara aynı snapshot yayınlanır.

## Kalıcılık

Aktif odalar şu an `Map` içinde tutulur. Süreç yeniden başladığında silinir. Kalıcı sürüm için önerilen katman:

- Redis: aktif oda ve kısa süreli maç state'i
- PostgreSQL: kullanıcı, sezon, fikstür ve geçmiş maçlar
- Object storage/CDN: sesler ve büyük statik dosyalar
