# 90+ — İsteğe Bağlı Ses Dosyaları

Ses sistemi toplam **67 dosya yolunu** tanır: 65 olay/arayüz efekti ve 2 sürekli ambiyans. Bir dosya bulunursa çalınır; bulunmazsa oyun hiçbir hata göstermeden sessiz devam eder.

Bütün dosyaları şu kökün altına yerleştir:

```text
assets/audio/
```

Dosya adlarında büyük/küçük harf ve tireler önemlidir.

## Ambiyans

```text
assets/audio/ambience/menu-loop.mp3
assets/audio/ambience/stadium-loop.mp3
```

## Hakem düdükleri

```text
assets/audio/whistle/kickoff.mp3
assets/audio/whistle/second-half.mp3
assets/audio/whistle/foul.mp3
assets/audio/whistle/penalty.mp3
assets/audio/whistle/halftime.mp3
assets/audio/whistle/fulltime.mp3
assets/audio/whistle/free-kick.mp3
```

## Kronometre

```text
assets/audio/timer/start-click.mp3
assets/audio/timer/stop-click.mp3
assets/audio/timer/tick.mp3
assets/audio/timer/warning.mp3
assets/audio/timer/timeout.mp3
```

## Top ve saha

```text
assets/audio/ball/player-select.mp3
assets/audio/ball/pass-01.mp3
assets/audio/ball/pass-02.mp3
assets/audio/ball/pass-03.mp3
assets/audio/ball/shot.mp3
assets/audio/ball/net.mp3
assets/audio/ball/save.mp3
assets/audio/ball/post.mp3
assets/audio/ball/tackle.mp3
assets/audio/ball/throw-in.mp3
assets/audio/ball/goal-kick.mp3
assets/audio/ball/turnover.mp3
assets/audio/ball/corner-kick.mp3
```

## Tribün

```text
assets/audio/crowd/goal-cheer.mp3
assets/audio/crowd/winning-goal-cheer.mp3
assets/audio/crowd/big-cheer.mp3
assets/audio/crowd/applause.mp3
assets/audio/crowd/boo.mp3
assets/audio/crowd/protest.mp3
assets/audio/crowd/disappointment.mp3
assets/audio/crowd/gasp.mp3
assets/audio/crowd/tense-hush.mp3
assets/audio/crowd/draw-applause.mp3
assets/audio/crowd/defeat-murmur.mp3
assets/audio/crowd/goal-horn.mp3
assets/audio/crowd/goal-afterglow.mp3
```

## Kartlar

```text
assets/audio/cards/yellow.mp3
assets/audio/cards/red.mp3
assets/audio/cards/second-yellow.mp3
assets/audio/cards/no-card.mp3
```

## Duran toplar

```text
assets/audio/set-piece/penalty-run-up.mp3
assets/audio/set-piece/free-kick-wall.mp3
assets/audio/set-piece/penalty-goal.mp3
assets/audio/set-piece/penalty-save.mp3
assets/audio/set-piece/penalty-miss.mp3
```

## İhlaller

```text
assets/audio/violation/first-warning.mp3
assets/audio/violation/penalty-awarded.mp3
assets/audio/violation/red-card.mp3
assets/audio/violation/forfeit.mp3
```

## Çevrim içi oda

```text
assets/audio/online/room-created.mp3
assets/audio/online/room-joined.mp3
assets/audio/online/opponent-ready.mp3
assets/audio/online/your-turn.mp3
assets/audio/online/connection-lost.mp3
assets/audio/online/reconnected.mp3
```

## Arayüz

```text
assets/audio/ui/select.mp3
assets/audio/ui/confirm.mp3
assets/audio/ui/back.mp3
assets/audio/ui/invalid.mp3
```

## Maç sonu

```text
assets/audio/match-end/victory.mp3
assets/audio/match-end/draw.mp3
assets/audio/match-end/defeat.mp3
assets/audio/match-end/shootout-victory.mp3
```

## Dosyaları kontrol etme

Proje klasöründe:

```bash
npm run audio:check
```

Komut bulunan ve eksik dosyaları ayrı ayrı listeler.

## Önerilen dışa aktarma

- Biçim: MP3
- Kısa efektler: 160–192 kbps yeterli
- Ambiyans ve kalabalık: 192 kbps veya üzeri
- Klik/top seslerinin başında sessizlik bırakma
- Loop ambiyanslarının başlangıç ve bitiş noktalarını birbirine yakın düzenle
- Aynı dosyanın içine uzun sessizlik veya yorumcu konuşması ekleme
