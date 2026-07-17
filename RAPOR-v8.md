# 90+ v8 — Düzeltme ve Geliştirme Raporu

## 1. Amaç

v8'in amacı yeni kurallar yığmak değil; kullanıcının özellikle işaret ettiği beş alanı düzeltmektir:

1. Katmanlı futbol ses sistemini geri getirmek.
2. v6'daki güçlü kadro seçimi estetiğini, v7'nin düzeltilmiş mantığıyla birleştirmek.
3. Mola ve yazı tura hatalarını gidermek.
4. Oyuncu ve olay bildirimlerini premium, okunabilir ve eğlenceli hâle getirmek.
5. Oyuncu havuzunu yaklaşık 4.000 seviyesine çıkarmak.

## 2. Ses sistemi

### Önce

v7'de her olay için çoğunlukla tek bir öncelikli ses çalıyor, bazı üretilmiş dosyalar hiçbir tarifte kullanılmıyor ve ilk tasarlanan stadyum sahnesi hissi kayboluyordu.

### Şimdi

Ses motoru tekrar katmanlı çalışır:

- Gol: şut + file + tribün patlaması + isteğe bağlı gol kornası + kutlama kuyruğu
- Kurtarış: şut + eldiven teması + tribün tepkisi + alkış
- Direk: şut + metal direk + toplu şaşkınlık
- Aut: şut + topun dışarı çıkışı + hayal kırıklığı
- Faul: temas + düdük + protesto
- Sarı/kırmızı: düdük + kart sesi + tribün tepkisi
- Penaltı/frikik: karar düdüğü + gerilim + sonuca uygun şut sahnesi
- Süre ihlali: buzzer + ihlal kademesine uygun sonuç
- Maç sonu: final düdüğü + galibiyet, beraberlik veya mağlubiyet atmosferi

Arka plan stadyum sesi olay sırasında otomatik kısılır, ardından geri yükselir. Eksik dosya bütün tarifi iptal etmez; bulunan katmanlar çalar.

## 3. Kadro seçimi

### Önce

Üç aday metin kutularına yakın, görsel hiyerarşisi zayıf biçimde gösteriliyordu. Kronometrenin o anda hangi adayı seçeceği yeterince hissedilmiyordu.

### Şimdi

Kriterli seçim ve Transfer Düellosu aynı premium kart sistemini kullanır:

- Üç kart aynı ekranda görünür.
- Her kartta puan, mevki, milliyet, lig ve futbolcu adı bulunur.
- Kronometrenin son rakamına göre aktif kart kırmızı ışık/glow ile vurgulanır.
- Üst bilgi satırı `7 → Futbolcu adı · 2. kart` biçiminde canlı güncellenir.
- `rakam mod 3` eşleşmesi ekranda görünür.
- Seçilmeyen Transfer Düellosu adayları sonraki turda tamamen yenilenir.

Mobil görünümde kartlar üçlü düzeni korur fakat metin ve rozetler sıkıştırılmış, okunabilir bir ölçüye geçer.

## 4. Oyuncu tanıtım ekranı

Oyuncu seçildiğinde artık yalnızca büyük isim gösterilmez.

Yeni tam ekran sahnede:

- Kronometre rakamı
- Oyuncu puanı
- Mevki
- Milliyet
- Lig
- Retro forma/siluet alanı
- Spiker tarzı kısa tanıtım cümlesi
- Sonraki adımı açıklayan metin
- Kalan gösterim süresini gösteren ilerleme çubuğu

bulunur.

Mobilde dikey retro futbolcu kartı, masaüstünde iki sütunlu editoryal spor kartı kullanılır. Baş döndüren dönen ışın animasyonu kaldırılmıştır; yalnızca giriş, hafif parlama ve ilerleme animasyonları vardır.

## 5. Maç olayı ekranları

Her olay için tek tip dev başlık yerine ayrı, renk kontrollü premium maç bileti tasarımı kullanılır.

- Olay simgesi
- Kronometre rakamı
- Olay başlığı
- Spiker cümlesi
- Teknik açıklama
- Kapanma çubuğu
- Okunabilir gösterim süresi

bulunur.

Gol, kurtarış, direk, aut, pas, faul, kart, penaltı, frikik, korner, taç, top kaybı, süre ihlali, yazı tura ve ek süre için ayrı cümle havuzları vardır. Yaygın olayların her birinde yaklaşık 10 farklı cümle bulunur. Cümlelere ilgili futbolcu, takım, rakip ve uygun durumlarda kaleci adı yerleştirilir.

## 6. Yazı tura

### Önce

Maç açılır açılmaz sonuç otomatik belirleniyor, oyuncu animasyonu görmeden başlama hakkı atanıyordu.

### Şimdi

- Maç ekranı önce yazı tura aşamasında açılır.
- İç saha oyuncusu `YAZI TURAYI AT` düğmesine basar.
- Para animasyonla döner.
- Sonuç iki tarafta da premium olay kartıyla gösterilir.
- Kazanan ilk yarıya, diğer takım ikinci yarıya başlar.
- 10 saniye içinde düğmeye basılmazsa sunucu/maç motoru cezasız otomatik atar.
- Bu süre maç süresine, ek süreye ve ihlal sayacına eklenmez.

## 7. Mola sistemi

### Düzeltilen hatalar

- Devre arası `paused=true` olduğu için yanlışlıkla kullanıcı molası gibi gösteriliyordu.
- Mola penceresinden Olaylar, Kurallar veya Kadrolar açılınca ana mola penceresi her animasyon karesinde yeniden yazılıyor, düğmeler çalışmıyordu.
- Bazı AI maçlarında bu durum sebepsiz otomatik mola gibi algılanıyordu.

### Yeni davranış

- Kullanıcı molası yalnız `pausedBy` geçerli bir takım olduğunda gösterilir.
- Olaylar, Kurallar ve Kadrolar mola sırasında bağımsız modal olarak açılır.
- `MOLAYA DÖN` ile ana mola ekranına dönülür.
- Molayı yalnız alan taraf bitirebilir.
- Devre arası, yazı tura ve olay animasyonları kullanıcı molası değildir.
- AI hiçbir zaman kendiliğinden mola talep etmez.

## 8. Oyuncu havuzu

- Toplam: 4.100 benzersiz futbolcu
- Türkiye: 128 futbolcu
- Eski efsaneler, yakın dönem oyuncuları ve güncel popüler isimler birlikte yer alır.
- Açık engel listesinde bulunan isimler havuza alınmaz.
- ID benzersizliği ve 4.000 alt sınırı otomatik testte doğrulanır.
- Oyuncu verisi yalnız kadro aşamasında yüklenir.

## 9. Test sonucu

```text
27 test
27 başarılı
0 başarısız
```

Test kapsamı:

- Ana olay ve şut tabloları
- İki pas sınırı
- Korner ve duran top
- Etkileşimli/otomatik yazı tura
- Oyuncu seçimi ve gol
- Mola yetkisi ve bütçesi
- Dört kişilik düello izolasyonu
- İki yarı finalin bağımsız state'i
- Aynı takım renginin reddi
- 4.100 oyuncu ve Türk havuzu alt sınırı
- Kriter filtreleri
- Benzersiz dört kadro
- Turnuva ve çift ayak akışları

## 10. Bilinen sınırlar

- Aktif odalar hâlâ RAM'de saklanır.
- Ses dosyalarının kendisi pakete gömülmez; kullanıcı kendi hazırladığı MP3 dosyalarını aynı adlarla yerleştirir.
- Oyuncu fotoğrafı ve kulüp logosu kullanılmaz.
