# Oyuncu havuzu

Toplam oyuncu: **2.264**.

Veri `data/players.json` içinde tutulur. Tarayıcı bu dosyayı ana sayfa açılırken değil, kadro kurma işlemi gerektiğinde `js/player-store.js` üzerinden yükler. Böylece ilk açılış paketi küçülür.

Her kayıt kadro filtreleri için şu temel alanları taşır:

```text
id, name, nationality, position, activeStart, activeEnd, leagues, rating
```

İlk tarihî ve modern çekirdek elle dengelenmiş tanınmış oyunculardan; genişletilmiş kayıtlar temizlenmiş futbolcu profil verilerinden oluşur. Yinelenen ID'ler otomatik testle engellenir.

Açık dışlama listesi yalnız kullanıcı tarafından açıkça belirtilen kimlikleri içerir. Uygulama kişiler hakkında hukuki veya siyasi ilişki tahmini yapmaz.
