# 90+ v8 — Mimari Notları

## İstemci modülleri

- `js/app.js`: başlangıç ve ekran yönlendirme bağlantıları
- `js/state.js`: istemci state'i ve kalıcı tercihler
- `js/router.js`: ekran geçmişi
- `js/ui.js`: modal, olay kartı ve ortak arayüz yardımcıları
- `js/audio.js`: 67 dosya yolu, Web Audio ambiyansı ve katmanlı olay tarifleri
- `js/commentary.js`: olay başına spiker cümle havuzları
- `js/match-engine.js`: maç kuralları ve seri hâle getirilebilir state
- `js/squad-builder.js`: filtre, aday ve mevki yerleşimi
- `js/duel.js`: yerel Transfer Düellosu
- `js/tournament.js`: organizasyon motoru
- `js/network.js`: native WebSocket istemcisi
- `js/screens/*`: ekran sorumlulukları

## Sunucu

`server.js`:

- Statik dosyaları sunar.
- Native WebSocket odalarını yönetir.
- Hamleleri sunucuda doğrular.
- Her turnuva maçını ayrı match kaydıyla tutar.
- Oyuncu havuzunu sunucu kadro işlemleri için yükler.

## Oyuncu verisi

`data/players.json` istemcide lazy-load edilir. Ana menü açılışına dahil değildir. Sunucu ise benzersiz online kadrolar oluşturmak için başlangıçta yükler.

## Ses mimarisi

Ambiyans ile efektler farklı gain bus'larında çalışır. Bir olay olduğunda:

1. Aktif olay kaynakları temizlenir.
2. Ambiyans ducking ile kısılır.
3. Olay tarifindeki mevcut katmanlar gecikmeleriyle çalınır.
4. Ambiyans yumuşak biçimde eski seviyesine döner.

Bu yapı, eksik dosya nedeniyle oyunun çökmesini önler ve aynı olayın seslerini kontrollü biçimde üst üste bindirir.
