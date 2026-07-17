# 90+ v8 — Yayın Öncesi Manuel Test Planı

## A. Genel

- [ ] Ana menü açık ve koyu temada okunuyor.
- [ ] Ses düğmesi bütün sesi açıp kapatıyor.
- [ ] Tarayıcı geri tuşu overlay varken önce overlay'i kapatıyor.
- [ ] PWA ana ekrandan açılıyor.
- [ ] Eski service worker cache'i görünmüyor.

## B. Mobil

Aşağıdaki ölçülerde test et:

- [ ] 360×740
- [ ] 390×844
- [ ] 412×915

Her ölçüde:

- [ ] Header üstte sabit.
- [ ] Dock altta sabit.
- [ ] Ana eylem için sayfa sonuna kaydırmak gerekmiyor.
- [ ] Maç ekranında dikey kaydırma yok.
- [ ] Üç draft adayı ve kronometre birlikte görünüyor.
- [ ] Klavye açıldığında takım adı alanı ve devam düğmesi kullanılabiliyor.

## C. Tek maç

- [ ] Yazı tura iki tarafı gösteriyor.
- [ ] 10 saniyede basılmazsa otomatik tamamlanıyor.
- [ ] Kazanan ilk, kaybeden ikinci yarıya başlıyor.
- [ ] Oyuncu seçimi olaydan önce geliyor.
- [ ] İki pas sonrası üçüncü pas engelleniyor.
- [ ] 7 sonucu şut alt atışını açıyor.
- [ ] Üçüncü korner penaltı oluyor.
- [ ] Faul sonucu ve kart ayrı belirleniyor.
- [ ] İkinci sarı kırmızıya dönüşüyor.
- [ ] Ek süre makul ve sınırlı.

## D. Mola

- [ ] Yalnız sıradaki taraf mola alabiliyor.
- [ ] Kalan bütçe ikinci molada devam ediyor.
- [ ] Olaylar açılıyor.
- [ ] Kurallar açılıyor.
- [ ] Kadrolar açılıyor.
- [ ] Devam Et çalışıyor.
- [ ] Ana menüye dönünce mola perdesi kalmıyor.

## E. Çift ayak

- [ ] İlk ayakta uzatma/penaltı yok.
- [ ] İkinci ayakta iç saha/deplasman değişiyor.
- [ ] Toplam skor doğru.
- [ ] Toplam eşitse uzatma/penaltı işliyor.
- [ ] Deplasman golü üstünlüğü yok.

## F. Transfer Düellosu

- [ ] Dönem en fazla iki seçiliyor.
- [ ] Diğer kriterler tek seçiliyor.
- [ ] Her tur üç aday tamamen yenileniyor.
- [ ] Seçilen aday tekrar gelmiyor.
- [ ] Kronometre rakamının mod 3 eşlemesi doğru.
- [ ] Oyuncu uygun mevki yuvasına yerleşiyor.

## G. 1v1 online

İki farklı tarayıcı/gizli pencere:

- [ ] Oda kodu kadrodan önce alınıyor.
- [ ] Kodla katılım çalışıyor.
- [ ] Aynı renk seçilemiyor.
- [ ] Ready sayacı 30 saniye.
- [ ] Maç state'i iki tarafta aynı.
- [ ] Mola karşı tarafa yansıyor.
- [ ] Yeniden bağlanma çalışıyor.
- [ ] Mağlup taraf rövanş isteyebiliyor.

## H. Dört kişilik online kupa

Dört ayrı tarayıcı profili:

- [ ] Dört kişi dolmadan başlatılamıyor.
- [ ] İki düello çifti ayrı ekran görüyor.
- [ ] Düellolar aynı anda ilerliyor.
- [ ] Bir çiftin seçtiği oyuncu diğer çifte gelmiyor.
- [ ] İki yarı final ayrı başlıyor.
- [ ] Bir yarı finalde mola diğerini durdurmuyor.
- [ ] Final ve üçüncülük ayrı başlıyor.
- [ ] Podyum iki maç tamamlanmadan açılmıyor.

## I. Ses

- [ ] Menü loop'u menüde çalıyor.
- [ ] Maçta stadyum loop'una geçiyor.
- [ ] Golde tek gol efekti duyuluyor.
- [ ] Faulde düdük duyuluyor.
- [ ] Kartta ilgili tek efekt duyuluyor.
- [ ] Direk/kurtarış/aut sesleri doğru.
- [ ] Efektler üst üste kakofoni oluşturmuyor.
- [ ] Eksik dosyada oyun hata vermiyor.
