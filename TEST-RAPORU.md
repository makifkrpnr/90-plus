# 90+ v7 — Test Raporu

## Otomatik testler — `npm test`: **27/27 geçti**

- 24 motor birim testi (olay tablosu, şut, kartlar, ihlaller, ek süre, mola, iki ayak…)
- 3 **soket simülasyonu** (gerçek sunucu + gerçek istemciler):
  - 4'lü turnuva tam akışı: oda → 4 katılım → rastgele benzersiz kadrolar → eşzamanlı
    yarı finaller (**maç izolasyonu doğrulandı: diğer maçın verisi sızmıyor**) →
    hükmen → bracket → finaller → podyum + istatistik.
  - Düello grace: ayrılan dönmezse 10 sn'de iptal + bildirim; duraklatılmışken hamle reddi.
  - Düello grace: geri dönen kaldığı yerden sürdürür.

## Tarayıcı duman testi (mobil 375×812, açık + koyu tema)

- AI akışı dock butonlarıyla uçtan uca: mod → sistem → kadro → ayarlar → brifing → maç.
- Yeni yazı tura: sonuçlar maçtan maça değişiyor (rastgelelik düzeldi).
- Skorboard v7 iki temada da okunaklı; aktif takım etiketi ve dakika/uzunluk çipleri çalışıyor.
- Spikerli olay kartları canlı doğrulandı (PAS ve TAÇ kartları, 🎙 cümleleriyle).
- Retro oyuncu kartı bayrak renkleri + okunabilirlik scrim'leriyle doğrulandı (Türkiye örneği).
- 3.184 oyuncu yüklendi; konsolda hata yok.

## Bilinen notlar

- Havuzu ~4.000'e çıkarmak için açık veri seti aktarımı önerilir (tüm isimler gerçek tutuldu).
- Ses dosyaları hâlâ isteğe bağlıdır: dosya yoksa oyun sessiz devam eder.
