# KRONOMETRE FUTBOL OYUNU — DETAYLI TASARIM VE UYGULAMA PLANI (v2)

Bu doküman, oyunun tüm kurallarını, veri mimarisini ve geliştirme adımlarını en ince ayrıntısına
kadar açıklar. Hedef: Hiç bağlam bilmeyen biri bu dosyayı okuyup projeyi baştan sona anlayabilsin
ve kodlamaya başlayabilsin.

---

## BÖLÜM 1 — OYUNUN TEMEL KONSEPTİ

### 1.1 Ne Yapıyoruz?
90'lar/2000'ler kronometre saatlerinden esinlenen, tarayıcı üzerinden çalışan (PWA — Progressive
Web App) bir futbol simülasyon oyunu yapıyoruz. Oyuncu, ekrandaki bir kronometreyi durdurarak
maç içindeki her olayı (pas, gol, faul, kart, korner vs.) tetikler. Oyun tamamen şansa dayalıdır,
yetenek/reaksiyon hızı sonucu belirler ama futbol mantığı (kurallar, kartlar, penaltılar) gerçek
futbol kurallarına sadık kalır.

### 1.2 Platform
- Web tabanlı, mobil öncelikli (responsive tasarım).
- PWA yapısı: hesap oluşturma zorunlu değil, kullanıcı ana ekrana uygulamayı ekleyebilir.
- Offline çalışabilir olmalı (AI ve Co-op modları için internet gerekmiyor, sadece Online lig
  modu internet ister).

### 1.3 Görsel Kimlik
- Stil adı: "Retro-Grain Minimalizm"
- Kağıt/grain doku efekti tüm arka planlarda kullanılır.
- Halftone (yarım-ton, noktalı) desenler illüstrasyonlarda kullanılır.
- Renk paleti sınırlı ve cesur: kırmızı, koyu mavi, çimen yeşili, krem/bej.
- Tipografi: büyük, kalın, bold başlıklar + ince/serif ikincil metinler.
- Gol/kart/penaltı anlarında tam ekran, animasyonlu, efektli (ışık huzmesi/rays, doku titreşimi)
  geçiş sahneleri gösterilir. Amaç: "minimalist ama premium" hissi.

---

## BÖLÜM 2 — OYUN MODLARI

| Mod | Açıklama | Geliştirme Önceliği | Teknik Gereksinim |
|---|---|---|---|
| Yapay Zekaya Karşı | Tek oyuncu, AI rakibe karşı oynanır | MVP (İlk sürüm) | Yok, tamamen client-side |
| Co-op (Aynı Cihaz) | İki kişi sırayla aynı cihazdan oynar | MVP (İlk sürüm) | Yok, tamamen client-side |
| Online (Lig) | Asenkron, sezon/lig yapısı, kullanıcılar birbirine karşı oynar | Faz 2 (İlk sürümden SONRA) | Backend + veritabanı + matchmaking gerekir |

### 2.1 AI Modu Detayı
AI'nın kadrosu, oyuncunun kullandığı ile AYNI Kriter/Random sistemiyle otomatik oluşturulur.
AI, kendi turunda otomatik olarak "rastgele bir zamanda" kronometreyi durdurur (gerçek insan
davranışını simüle eden rastgele bir gecikme ile, örneğin 1.5-4 saniye arası).

### 2.2 Co-op Modu Detayı
Co-op modu, AI modu ile TEK FARKLA aynı sistemi kullanır: AI'nın turunu artık gerçek bir insan
oynar. Yani kod mimarisinde "sıradaki oyuncu AI mi insan mı" diye bir bayrak (flag) tutulur,
oyun mantığının %100'ü aynı kalır. Ekstra network/senkronizasyon gerekmez çünkü aynı cihazdan
oynanıyor, sırayla el değiştirilir (pass-and-play).

### 2.3 Online Lig Modu Detayı (Faz 2 — İleride Detaylandırılacak)
- Asenkron oynanış: rakipler aynı anda online olmak zorunda değil.
- Lig/sezon yapısı: puan tablosu, haftalık fikstür.
- Bu mod ilk sürümde YOK, sadece mimarinin ileride buna izin verecek şekilde kurulması gerekiyor
  (örneğin oyun state'inin JSON olarak serialize edilebilir olması).

---

## BÖLÜM 3 — VERİ MİMARİSİ: OYUNCU VERİTABANI

### 3.1 Veri Kaynağı: Wikidata (SPARQL)
Wikidata, ücretsiz, API key gerektirmeyen, halka açık bir bilgi grafiği. "Futbolcu" mesleğine
sahip (occupation = Q937857) yaklaşık 134.000+ kişi barındırıyor. Bu, bizim 1950-2026 aralığını
kapsayacak tek gerçekçi ücretsiz kaynak.

### 3.2 Çekilecek Alanlar (SPARQL ile)
Her oyuncu için şu alanları Wikidata'dan çekeceğiz:
1. Ad-soyad (label)
2. Doğum tarihi (P569)
3. Milliyet (P27)
4. Oynadığı kulüpler / kariyer geçmişi (P54 — member of sports team)
5. Pozisyon (P413 — position played)
6. Aldığı ödüller (P166 — award received) → Ballon d'Or, dünya kupası vb. kontrolü için
7. Wikipedia'da kaç dilde makalesi var (sitelinks sayısı) → ünlülük/etki göstergesi olarak

### 3.3 Veri Toplama Adımları (Adım Adım)
1. Wikidata Query Service (query.wikidata.org) üzerinden SPARQL endpoint'ine bağlan.
2. Doğum tarihi 1930-2010 arası olan futbolcuları filtrele (1930 doğumlu biri 1950'de 20
   yaşında oynayabilir, 2010 doğumlu biri 2026'da 16 yaşında oynayabilir — dönem aralığımızı
   tam kapsar).
3. Sonuçları CSV olarak dışa aktar (Python + SPARQLWrapper kütüphanesi kullanılabilir).
4. Eksik/bozuk veri satırlarını temizle (isim eksik olanlar, doğum tarihi olmayanlar elenir).
5. Her oyuncuya benzersiz bir player_id ata.
6. Bu CSV'yi projenin "master veritabanı" olarak sakla (players_master.csv).

### 3.4 Örnek Veri Şeması (CSV Kolonları)
```
player_id, full_name, birth_year, nationality, position, clubs (liste, ; ile ayrılmış),
awards (liste, ; ile ayrılmış), wiki_language_count, computed_rating
```

---

## BÖLÜM 4 — OYUNCU RATING SİSTEMİ (0-99 ARASI, FIFA/PES TARZI)

### 4.1 Neden Hibrit Sistem Gerekiyor?
1950-1990 dönemi oyuncuları için detaylı istatistik verisi (pas başarı oranı, xG vb.) mevcut
DEĞİL. Bu yüzden tüm dönemler için AYNI formülü kullanamayız. Onun yerine, "kariyer onuru"
temelli bir puanlama sistemi kuruyoruz — bu, hem eski hem yeni oyunculara uygulanabilir.

### 4.2 Puanlama Formülü (Ham Puan Hesaplama)
Her oyuncu için önce bir "ham puan" (raw_score) hesaplanır, sonra bu puan 0-99 skalasına
normalize edilir.

```
raw_score =
    (Ballon d'Or kazanma sayısı x 25) +
    (Ballon d'Or aday olma sayısı x 10) +
    (Dünya Kupası şampiyonluğu sayısı x 20) +
    (Şampiyonlar Ligi / kıta kupası şampiyonluğu sayısı x 15) +
    (Milli takım caps sayısı / 10 x 2) +
    (Kulüp lig şampiyonluğu sayısı x 3) +
    (Wikipedia dil sayısı / 10 x 1)
```

### 4.3 Normalizasyon (0-99 Skalasına Çevirme)
1. Tüm oyuncu havuzundaki raw_score değerlerini hesapla.
2. En yüksek raw_score değerini bul (max_score).
3. En düşük raw_score değerini bul (min_score).
4. Her oyuncu için şu formülü uygula:
```
final_rating = 40 + ((raw_score - min_score) / (max_score - min_score)) x 59
```
Bu formül, en zayıf oyuncuya 40 civarı, en güçlü oyuncuya (Pelé, Maradona, Messi gibi) 99'a
yakın bir puan verir. 40 alt sınırı, hiçbir oyuncunun aşırı düşük/anlamsız bir puana
düşmemesini sağlar (FIFA/PES oyunlarında da alt sınır genelde 40-50 civarındadır).

### 4.4 24+3 Kadro Diliminde Kullanım
Havuzdaki oyuncular rating'e göre sıralanır ve şu şekilde 3 dilime bölünür:
- **Zayıf-Orta Dilim** (rating 40-65 arası): İlk 10-12 aday
- **Orta-Güçlü Dilim** (rating 66-85 arası): Sonraki 10-12 aday
- **Yıldız/Efsane Dilim** (rating 86-99 arası): Son 3 aday (garanti yıldız oyuncu)

Kullanıcı kronometreyi durdurup bir pozisyon için aday seçtiğinde, bu 3 dilimden kademeli
olarak (senin önceki tasarımına göre) adaylar sunulur.

### 4.5 Rating Hesaplama — Adım Adım Kod Akışı
1. players_master.csv dosyasını oku.
2. Her satır (oyuncu) için raw_score hesapla (Bölüm 4.2 formülü).
3. Tüm raw_score'ların min ve max değerini bul.
4. Her oyuncu için final_rating hesapla (Bölüm 4.3 formülü).
5. Sonucu players_master.csv'ye yeni bir kolon olarak ekle (computed_rating).
6. Bu işlemi bir defa yap, sonucu kaydet — oyun çalışırken tekrar tekrar hesaplama YAPMA
   (performans için, rating'ler önceden hesaplanmış olmalı).

---

## BÖLÜM 5 — KADRO KURMA MODLARI

### 5.1 Üç Mod
1. **Karışık (Random):** Tüm havuzdan tamamen rastgele 11 oyuncu seçilir. Hiç filtre yok.
2. **Manuel:** Kullanıcı tüm player veritabanından istediği oyuncuları elle arayıp seçer.
3. **Kriter Bazlı:** Aşağıda detaylandırılan slot sistemiyle kadro oluşturulur.

### 5.2 Kriter Bazlı Mod — Detaylı Kurallar
- Toplam 5 slot vardır: 1 zorunlu + 4 opsiyonel.
  1. **Dönem Aralığı (ZORUNLU):** 1950-2026 arası 7 bloğa bölünmüş dönemlerden en fazla 2 tanesi
     seçilebilir (örnek bloklar: 1950-1965, 1966-1980, 1981-1995, 1996-2005, 2006-2013,
     2014-2020, 2021-2026). Kullanıcı 2 dönem seçerse, havuz bu 2 dönemden gelen oyuncuların
     BİRLEŞİMİ olur (örneğin Ronaldinho + Haaland aynı kadroda yer alabilir).
  2. **Milliyet (OPSİYONEL):** Kullanıcı belirli bir ülke seçerse, havuz o milliyetteki
     oyuncularla sınırlanır.
  3. **Lig (OPSİYONEL):** Kullanıcı belirli bir lig seçerse, havuz o ligde oynamış oyuncularla
     sınırlanır.
  4. **Takım (OPSİYONEL — KOZMETİK):** Kullanıcı bir takım seçerse, bu SADECE kadronun görünen
     ismini/temasını belirler (örneğin "Barcelona 1999-2010"). Oyuncu havuzunu HİÇBİR ŞEKİLDE
     etkilemez. Bu, milli takım + dönem kombinasyonunun saçma sonuçlar vermesini önlemek için
     alınan bir karardır (örn. "Ronaldinho + Haaland'lı Türkiye Milli Takımı" gibi mantıksız
     kombinasyonlar oluşmaz).
  5. (4. slot şu an tanımsız, ileride eklenebilir — örn. pozisyon ağırlıklı filtre)

- Havuz büyüklüğü: 24+3 = 27 oyuncu. İlk 24'ü zayıftan güçlüye kademeli dilimlerden gelir,
  son 3'ü GARANTİ yıldız/efsane dilimden gelir (rating 86-99 arası).
- Kimya/uyum bonusu YOK — oyun tamamen şansa dayalı kaldığı için bu ek strateji katmanı
  bilerek eklenmemiştir.
- Yedek oyuncu YOK — direkt ilk 11 kurulur, değişiklik hakkı bulunmaz.

---

## BÖLÜM 6 — KRONOMETRE → OYUNCU EŞLEME MEKANİĞİ

### 6.1 Problem
Kronometre tek hane (0-9) durdurulduğunda 10 farklı sonuç elde edilir. Ama kadroda 11 pozisyon
var. Bu sayısal uyumsuzluğu çözmek gerekiyor.

### 6.2 Çözüm: Kaleciyi Ayır
- Kaleci, "kimin topla oynadığı" rotasyonuna DAHİL EDİLMEZ.
- Geriye kalan 10 saha oyuncusu, kronometrenin 0-9 çıktısına BİRE BİR eşlenir.
- Kaleci sadece penaltı/frikik anlarında ayrı bir mekanizmayla devreye girer (bkz. Bölüm 10.5).
- Bu sürümde kaleci "yer tutucu/süs" rolündedir, detaylı bir kurtarış yeteneği/mekaniği
  bulunmaz. (v2'de geliştirilecek.)

### 6.3 Pozisyon İçi Aday Seçimi (Mod Alma Yöntemi)
Bir pozisyon için sunulan aday sayısına göre, kronometreden çıkan rakam mod alınarak
eşlenir:
- 3 aday varsa: rakam mod 3 → 0, 1 veya 2. index'teki aday seçilir.
- 2 aday varsa: rakam mod 2 → çift/tek durumuna göre seçim yapılır.
- Daha büyük dilimlerde (örn. 8 kişilik zayıf-orta dilim), iki hane (00-99 salise) kullanılıp
  mod 8 alınarak seçim yapılır.

---

## BÖLÜM 7 — MAÇ KURALLARI

### 7.1 Süre
- Gerçek kronometre süresi kullanılır (sanal/sıkıştırılmış süre DEĞİL).
- Kullanıcı 5-10 dakika arası bir süre seçebilir (slider ile).

### 7.2 Periyotlar (2 Devre)
- Seçilen toplam süre otomatik olarak 2 devreye bölünür.
- Hesaplama mantığı: 90 dakikalık gerçek maç 2x45 dakikalık devrelere bölünür. Seçilen süre
  bu 90 dakikalık referansa ORANTILANIR.
- Örnek: Kullanıcı 10 dakika seçerse, her devre 5 dakika sürer.
- Devre arasında kısa bir "soyunma odası" geçiş ekranı gösterilir.

### 7.3 Uzatma (Ayardan Açılıp Kapatılabilir)
- Gerçek futbolda 90 dakikalık maç sonunda 2x15 dakikalık uzatma oynanır. Bu oran (15/90 =
  %16.6) kullanılarak, seçilen maç süresine göre uzatma süresi hesaplanır.
- Hesaplama Adımları:
  1. Seçilen toplam maç süresini al (örn. 10 dakika).
  2. Bu süreyi 90 dakikalık referansa oranla (10/90 = 0.111).
  3. Bu oranı 15 dakikalık uzatma referansına uygula (15 x 0.111 = 1.66 dakika).
  4. Sonucu kullanıcı dostu bir değere yuvarla (örn. 1.5 veya 2 dakika).
  5. Bu süre, 2 devre halinde (uzatmanın 1. ve 2. devresi) uygulanır.

### 7.4 Seri Penaltı (Berabere Sonuç Çözümü — Ayardan Açılıp Kapatılabilir)
- AI/Co-op modunda VARSAYILAN: AÇIK (net kazanan garantilenir).
- Online Lig modunda VARSAYILAN: KAPALI (gerçek beraberlik puanı — galibiyet 3, beraberlik 1,
  mağlubiyet 0 puan sistemi işler).

### 7.5 Gol Sonrası Akış
- Gol olduğunda, top/sıra OTOMATİK OLARAK rakip tarafa geçer (gerçek futboldaki kick-off
  mantığı).

---

## BÖLÜM 8 — OYUNCU TURU VE VAKİT GEÇİRME (TIME-WASTING) KURALI

### 8.1 Temel Kural
- Her oyuncunun kendi turunu tamamlaması (kronometreyi durdurması) için 10 SANİYE süresi
  vardır.
- Bu 10 saniye dolarsa VE oyuncu kronometreyi durdurmamışsa, o tur otomatik olarak "top kaybı"
  sayılır.

### 8.2 Escalation (Kademeli Ceza) Sistemi
Bu sayaç MAÇ BOYU KÜMÜLATİFTİR — devre arasında veya herhangi bir noktada SIFIRLANMAZ.
Bir takımın 10 saniyeyi doldurma sayısı arttıkça ceza ağırlaşır:

| Doldurma Sayısı (Maç Boyu Toplam) | Sonuç |
|---|---|
| 1. kez | Sadece top kaybı (normal kural, ek ceza yok) |
| 2. kez | Sadece top kaybı (normal kural, ek ceza yok) |
| 3. kez | Rakip takıma PENALTI verilir |
| 4. kez | O oyuncuya/takıma KIRMIZI KART verilir (oyuncu oyun dışı kalır) |
| 5. kez | Takım HÜKMEN MAĞLUP sayılır, maç biter |

### 8.3 Uygulama Notu
Bu sayaç, HER TAKIM İÇİN AYRI AYRI tutulmalıdır (Takım A'nın doldurma sayısı, Takım B'nin
doldurma sayısından bağımsızdır).

---

## BÖLÜM 9 — ANA OLAY TABLOSU (KRONOMETRENİN SON RAKAMI 0-9)

Kronometre durdurulduğunda, salisenin (veya seçilen hane biriminin) son rakamı şu tabloya göre
yorumlanır:

| Rakam | Sonuç | Ne Olur? |
|---|---|---|
| 0 | GOL | Topu tutan oyuncu direkt gol atar. Skor güncellenir, sıra rakibe geçer (Bölüm 7.5). |
| 1 | PAS | Olay yok, aynı oyuncu için kronometre YENİDEN çalışır (oyuncu topu tutmaya devam eder). |
| 2 | PAS | Aynı yukarıdaki gibi. |
| 3 | TAÇ | Sıra rakibe geçer. Taçı kullanan taraf, KENDİ rotasyon havuzundan bir oyuncu seçip
       (otomatik/rastgele, taç mekaniğinde ekstra sub-roll yoktur) devam eder. |
| 4 | FAUL | Bölüm 10'daki tüm faul zinciri tetiklenir. |
| 5 | PAS | Aynı yukarıdaki gibi. |
| 6 | KORNER | Korner sayacı 1 artar (bkz. Bölüm 9.1). |
| 7 | PAS | Aynı yukarıdaki gibi. |
| 8 | FRİKİK/SERBEST VURUŞ | Bölüm 10'daki faul zincirinin devamı gibi işler (bu rakam DOĞRUDAN
       faul olayının bir alt sonucu değil, ana tablo üzerinden de tetiklenebilir — bkz. not). |
| 9 | AUT / TOP KAYBI | Sıra rakibe geçer, top kaybı sayılır. |

**ÖNEMLİ NOT:** Rakam 8 hem ana tabloda hem faul alt-roll'unda (Bölüm 10.2) görünür. Ana
tablodan gelen 8, faul olmadan direkt "serbest vuruş" tipi bir olay olarak değerlendirilir.
Faul alt-roll'undan gelen 8, farklı bir bağlamdır (Bölüm 10.2'deki tabloya bakınız — orada 8
"serbest vuruş" kategorisine dahildir, faul sonrası özel bir sub-roll'dur).

### 9.1 Korner Biriktirme Kuralı
- Her korner (rakam 6) geldiğinde, o takımın korner sayacı 1 artar.
- Korner sayacı 3'e ulaştığında, OTOMATİK OLARAK PENALTI tetiklenir VE korner sayacı sıfırlanır.
- Bu sayaç takıma özeldir (Takım A'nın kornerleri, Takım B'ninkinden bağımsız sayılır).

---

## BÖLÜM 10 — FAUL ZİNCİRİ (RAKAM 4 GELDİĞİNDE TETİKLENEN TÜM ADIMLAR)

### 10.1 Genel Akış
1. Topu tutan taraf (bizim örnekte "Takım A") faul yapmış sayılır.
2. Takım A, top hakkını ve tur hakkını kaybeder.
3. Rakip taraf (Takım B), İKİ AYRI kronometre sub-roll'unu ÇALIŞTIRMA hakkı kazanır:
   a. Sonuç Tipi Sub-Roll'u (Bölüm 10.2)
   b. Kart Sub-Roll'u (Bölüm 10.3)
4. Bu iki sub-roll BİRBİRİNDEN BAĞIMSIZDIR — biri sonucu (frikik/penaltı/serbest vuruş), diğeri
   kart durumunu (sarı/kırmızı/yok) belirler. İkisi aynı anda geçerli olabilir (örn. hem
   penaltı HEM sarı kart aynı faulden çıkabilir).

### 10.2 Sonuç Tipi Sub-Roll'u (Takım B Çalıştırır)
| Rakam | Sonuç |
|---|---|
| 1, 3 | FRİKİK |
| 9 | PENALTI |
| 0, 2, 5, 6, 7, 8 | SERBEST VURUŞ (direkt kaleye şut YOKTUR, top Takım B'de devam eder, normal
     oyun akışına döner — taç mekaniğiyle aynı mantık, Takım B kendi rotasyon havuzundan
     oyuncu seçip devam eder) |

### 10.3 Kart Sub-Roll'u (Takım B Çalıştırır, Sonuç Tipinden BAĞIMSIZ)
| Rakam | Sonuç |
|---|---|
| 1, 3, 5 | SARI KART (Takım A'nın faul yapan oyuncusuna) |
| 9 | KIRMIZI KART (Takım A'nın faul yapan oyuncusuna, direkt) |
| 0, 2, 4, 6, 7, 8 | KART YOK |

### 10.4 İkinci Sarı Kart Kuralı
- Bir oyuncu maç içinde 2. sarı kartını görürse, bu OTOMATİK OLARAK kırmızı kart sayılır.
- Kırmızı kartlı oyuncu (direkt kırmızı veya 2. sarıdan gelen) rotasyon havuzundan ÇIKARILIR.
- Takım, o oyuncu olmadan (bir kişi eksik) oynamaya devam eder.

### 10.5 Frikik / Penaltı Sonucu (Tek/Çift Kuralı)
- Eğer Bölüm 10.2'de sonuç FRİKİK veya PENALTI olarak belirlendiyse, final bir sub-roll daha
  çalışır:
  - Çıkan rakam TEK ise → Kaleci kurtarır, gol OLMAZ.
  - Çıkan rakam ÇİFT ise → GOL olur.
- Bu adımda "gol olasılığını zorlaştırma" (dar aralık, ağırlıklı olasılık) ŞU AŞAMADA
  UYGULANMAYACAK. İlk sürüm basit tek/çift kuralıyla test edilecek, gerekirse ilerideki bir
  sürümde zorlaştırma eklenebilir (bu KARAR DEĞİL, sadece bir not).

### 10.6 Vuruşu Kim Kullanır?
- Kazanan taraf (frikik/penaltı/serbest vuruş hakkı kazanan), KENDİ rotasyon havuzundan bir
  oyuncu seçer (taç mekaniğiyle AYNI mantık — otomatik/rastgele, ekstra sub-roll yok).

---

## BÖLÜM 11 — KALECİ (BU SÜRÜMDE SINIRLI ROL)

- Kaleci, saha oyuncusu rotasyonuna (kronometre 0-9 eşlemesine) DAHİL DEĞİLDİR.
- Kaleci SADECE penaltı/frikik final sub-roll'unda (Bölüm 10.5) "kurtarma" veya "gol olma"
  sonucunun bir parçası olarak SEMBOLİK şekilde var olur.
- Bu sürümde kalecinin kendi ayrı bir yeteneği, kendi kronometre etkileşimi YOKTUR.
- v2'de (bu dokümanın kapsamı DIŞINDA) detaylı bir kaleci kurtarış mekaniği eklenebilir.

---

## BÖLÜM 12 — AYARLAR EKRANI (AÇIK/KAPALI SEÇENEKLER)

| Ayar | Seçenekler | Varsayılan |
|---|---|---|
| Maç Süresi | 5-10 dakika (slider) | 5 dakika |
| Kart Sistemi | Açık / Kapalı | Açık |
| Sakatlık Riski | Açık / Kapalı | Kapalı |
| Uzatma | Açık / Kapalı | Açık |
| Seri Penaltı | Açık / Kapalı | AI/Co-op: Açık, Online: Kapalı |
| Ses Efektleri Yoğunluğu | Düşük / Orta / Yüksek | Orta |

---

## BÖLÜM 13 — ARAYÜZ EKRAN AKIŞI

```
[Ana Menü]
    ↓
[Mod Seçimi] → (Yapay Zekaya Karşı / Co-op / Online*)
    ↓
[Kadro Kurma] → (Karışık / Manuel / Kriter Bazlı)
    ↓
[Ayarlar Ekranı] → (Süre, Kart, Sakatlık, Uzatma, Seri Penaltı, Ses)
    ↓
[Maç Ekranı] → (Kronometre merkezde, skor üstte, saha arka planda)
    ↓
[Devre Arası] → (Kısa geçiş ekranı, "soyunma odası" teması)
    ↓
[2. Devre — Maç Ekranına Geri Dön]
    ↓
[Maç Sonu / İstatistik Ekranı]

* Online mod Faz 2'de eklenecek, ilk sürümde sadece placeholder/kilitli buton olabilir.
```

---

## BÖLÜM 14 — SES TASARIMI

| An | Ses |
|---|---|
| Kronometre çalışırken | Hafif "tik-tak" arka plan sesi |
| Kronometre durdurulduğunda | Net bir "klik/durma" sesi |
| Gol anında | Kısa, coşkulu zil/boru sesi |
| Kart anında | Sert, kısa düdük sesi |

**Genel Kural:** Tüm sesler KISA ve NET olmalı, üst üste binmemeli (bir ses biterken diğeri
başlamalı, çakışma olmamalı).

---

## BÖLÜM 15 — MAÇ SONU İSTATİSTİK EKRANI

Gösterilecek içerik (BASİT ve SADE tutulmalı):
1. Final skor (büyük, net).
2. Kronolojik olay zaman çizelgesi (gol dakikaları, kartlar — sırayla listelenir).
3. TEK bir öne çıkan basit istatistik (örn. "Top Sende Kalma %: Takım A 55 - Takım B 45").

Karmaşık grafikler, çoklu sekmeler EKLENMEYECEK — kullanıcıların bu ekranı hızlıca tarayıp
geçmesi hedeflenir.

---

## BÖLÜM 16 — TELİF/LİSANS STRATEJİSİ

- Gerçek oyuncu isim + istatistik/onur verisi KULLANILACAK (kamuya açık bilgi, nispeten
  güvenli).
- Kulüp LOGOSU KULLANILMAYACAK.
- Oyuncu FOTOĞRAFI KULLANILMAYACAK.
- Forma/kıyafet TASARIMI orijinal (kendi illüstrasyon tarzımız) OLACAK, gerçek forma birebir
  KOPYALANMAYACAK.
- Uygulama içinde şu ibare bulunacak: "Bu oyun eğitim/fantasy amaçlıdır, tüm marka ve oyuncu
  isimleri ilgili sahiplerine aittir, resmi bir bağlantı yoktur."

---

## BÖLÜM 17 — GELİŞTİRME YOL HARİTASI (ADIM ADIM, SIRALI)

Bu bölüm, projeye SIFIRDAN başlayan biri için hangi sırayla ne yapılacağını anlatır.

### AŞAMA 0 — Hazırlık
1. Proje deposu (repo) oluştur (Git).
2. Temel klasör yapısını kur: `/data`, `/src`, `/assets`, `/docs`.
3. Bu tasarım dokümanını `/docs` klasörüne koy.

### AŞAMA 1 — Veri Katmanı
1. Wikidata SPARQL sorgusu yaz, futbolcuları çek (Bölüm 3.3).
2. Veriyi `players_master.csv` olarak `/data` klasörüne kaydet.
3. Rating hesaplama scriptini yaz (Bölüm 4.5), `computed_rating` kolonunu ekle.
4. Veriyi temizle — eksik/bozuk satırları ele.
5. Bu aşamanın çıktısı: eksiksiz, rating'i hesaplanmış bir CSV dosyası.

### AŞAMA 2 — Oyun Mantığı (Core Engine) — Görsel Arayüz OLMADAN
Bu aşamada hiç arayüz yazılmaz, sadece mantık (backend/logic) kodlanır ve konsoldan test
edilir.
1. Kronometre simülasyon fonksiyonu yaz (rastgele bir sayı üretip "durdurma" anını simüle et).
2. Ana Olay Tablosu'nu (Bölüm 9) kodla — bir fonksiyon, rakam alır, olay döndürür.
3. Faul zincirini (Bölüm 10) kodla — alt fonksiyonlar: sonuç tipi belirleme, kart belirleme,
   final gol/kurtarış belirleme.
4. Kadro kurma mantığını (Bölüm 5) kodla — Kriter Bazlı mod, dönem filtreleme, dilim sistemi.
5. Kronometre-oyuncu eşleme mantığını (Bölüm 6) kodla.
6. Vakit geçirme escalation sistemini (Bölüm 8) kodla.
7. Maç süresi/devre/uzatma hesaplama mantığını (Bölüm 7) kodla.
8. TÜM BU FONKSİYONLARI birim testlerle (unit test) doğrula — her kural senaryosu için ayrı
   test yaz (örn. "3. korner geldiğinde penaltı tetikleniyor mu?" testi).

### AŞAMA 3 — AI Modu (Basit Arayüzle)
1. Çok basit, süssüz bir arayüz kur (sadece skor, kronometre, "durdur" butonu).
2. AI modunu bağla — AI otomatik rastgele bir sürede "durdur" tetikler.
3. Tam bir maçı baştan sona (2 devre) oynatıp test et.

### AŞAMA 4 — Co-op Modu
1. AI modundaki "otomatik durdurma" mantığını, "insan dokunuşu" ile değiştirecek bir bayrak
   sistemi ekle.
2. İki oyuncunun sırayla aynı cihazdan oynamasını test et.

### AŞAMA 5 — Görsel Kimlik ve Animasyonlar
1. Retro-grain görsel dilini (Bölüm 1.3) arayüze uygula.
2. Gol/kart/penaltı anları için tam ekran animasyonlar ekle.
3. Ses efektlerini (Bölüm 14) entegre et.

### AŞAMA 6 — Ayarlar Ekranı
1. Bölüm 12'deki tüm ayarları arayüze ekle.
2. Ayarların oyun mantığına doğru şekilde bağlandığını test et (örn. "Kart Sistemi Kapalı"
   seçiliyken kart mekaniği devre dışı kalıyor mu?).

### AŞAMA 7 — Maç Sonu ve İstatistik Ekranı
1. Bölüm 15'teki basit istatistik ekranını kodla.

### AŞAMA 8 — PWA Dönüşümü
1. Uygulamayı PWA'ya çevir (manifest.json, service worker ekle).
2. Ana ekrana ekleme ve offline çalışma özelliklerini test et.

### AŞAMA 9 — Test ve Yayın Hazırlığı
1. Telif/lisans ibaresini (Bölüm 16) uygulamaya ekle.
2. Kapsamlı manuel test yap (tüm modlar, tüm ayarlar).
3. Yayına hazırla.

**NOT:** Online Lig Modu (Faz 2) bu yol haritasının DIŞINDADIR, ilk sürüm yayınlandıktan
sonra ayrı bir planla ele alınacaktır.

---

## BÖLÜM 18 — OYNANIŞ SENARYOLARI (ÖRNEK MAÇ ANLATIMLARI)

Bu bölüm, oyunun mantığını somutlaştırmak için üç farklı mod için örnek, adım adım anlatılan
senaryolar içerir.

### 18.1 SENARYO A — Yapay Zekaya Karşı Mod (Tam Maç Örneği)

**Kurulum:**
- Kullanıcı "Yapay Zekaya Karşı" modunu seçer.
- Kadro Kurma: "Kriter Bazlı" seçilir. Dönem: 1996-2005 VE 2014-2020 (iki dönem, örn.
  Ronaldinho + Haaland aynı kadroda). Takım adı (kozmetik): "Efsaneler XI".
- AI, kendi kadrosunu aynı sistemle otomatik oluşturur (farklı bir dönem/kriter kombinasyonu
  seçer, örn. sadece 1950-1965 dönemi — Pelé, Di Stéfano tarzı bir kadro).
- Ayarlar: Süre 5 dakika, Kart Sistemi Açık, Uzatma Açık, Seri Penaltı Açık.
- Sistem, 5 dakikalık maçı 2 devreye böler: her devre 2.5 dakika. Uzatma hesaplanır:
  (5/90) x 15 = 0.83 dakika ≈ 1 dakika, 2 devre halinde uygulanır.

**Maç Başlıyor (1. Devre):**
1. Kullanıcının kadrosu topla başlar. Sıra kullanıcıda.
2. Kullanıcı kronometreyi başlatır, 10 saniye içinde durdurur. Rakam: 3 → TAÇ.
   - Sıra AI'ya (rakibe) geçer. AI kendi rotasyon havuzundan bir oyuncu seçer, devam eder.
3. AI'nın turu. AI otomatik olarak 2 saniye içinde durdurur. Rakam: 4 → FAUL.
   - Kullanıcının takımı (faule uğrayan taraf) hem sonuç tipi hem kart sub-roll'unu çalıştırır.
   - Sonuç Tipi Sub-Roll'u: Rakam 9 → PENALTI.
   - Kart Sub-Roll'u: Rakam 1 → SARI KART (AI'nın faul yapan oyuncusuna).
   - Final Sub-Roll (penaltı): Rakam 4 (ÇİFT) → GOL! Kullanıcı 1-0 öne geçer.
   - Gol sonrası sıra AI'ya geçer (Bölüm 7.5).
4. AI'nın turu. Rakam: 1 → PAS. Aynı oyuncu için kronometre tekrar çalışır.
5. AI'nın turu (devam). Rakam: 6 → KORNER. AI'nın korner sayacı 1 olur.
6. ... (oyun bu şekilde devam eder, her tur 10 saniyelik sınırla)
7. 1. Devre biter (2.5 dakika doldu). Skor: 1-0. Devre arası ekranı gösterilir.

**2. Devre:**
8. Sıra, 1. devreyi kimin bitirdiğine bakılmaksızın normal akışla devam eder.
9. Örnek olay: AI 3. kez 10 saniyeyi doldurur (maç boyu kümülatif sayaç). Kural: 3. doldurma
   → Kullanıcıya OTOMATİK PENALTI verilir (Bölüm 8.2). Kullanıcı final sub-roll'unu çalıştırır:
   Rakam 7 (TEK) → Kaleci kurtarır, gol OLMAZ. Skor değişmez: 1-0.
10. Maç 2.5 dakika sonra biter (2. devre tamamlanır). Skor: 1-0, kullanıcı önde.
11. Uzatma AÇIK olduğu için, uzatma oynanır (2x0.5 dakikalık iki mini devre). Skor değişmezse
    (uzatma sonunda da 1-0 kalırsa), maç kullanıcının galibiyetiyle biter (zaten önde olduğu
    için seri penaltıya gerek kalmaz).
12. Maç Sonu Ekranı: Final skor "1-0", olay zaman çizelgesi (Kullanıcı Gol - 1. devre, AI Sarı
    Kart - 1. devre), Top Sende Kalma oranı gösterilir.

### 18.2 SENARYO B — Co-op Modu (İki Kişi Aynı Cihazda)

**Kurulum:**
- İki arkadaş (Ali ve Veli) aynı telefonu paylaşarak oynuyor.
- Ali "Co-op" modunu seçer. Her ikisi de kendi kadrosunu Kriter Bazlı modla kurar.
- Ayarlar: Süre 10 dakika, Kart Sistemi Açık, Sakatlık Riski Açık, Seri Penaltı Kapalı
  (arkadaşlar berabereliği kabul etmeye karar verdi).

**Maç Akışı:**
1. Sıra Ali'de. Ekranda "ALİ'NİN SIRASI" yazısı belirir, telefon Ali'ye geçirilir (fiziksel
   olarak, uygulama bunu bilmez, sadece kimin sırası olduğunu gösterir).
2. Ali kronometreyi durdurur, bir olay gerçekleşir (örn. PAS). Ali turunu bitirene kadar
   (kronometre PAS döndürdüğü için, aynı oyuncu için tekrar tekrar kendi turunu oynar) devam
   eder.
3. Bir olay Ali'nin sırasını Veli'ye geçirdiğinde (örn. AUT), ekranda "VELİ'NİN SIRASI" yazısı
   belirir, telefon Veli'ye geçirilir.
4. Bu şekilde, AI modundaki TÜM mantık (olay tablosu, faul zinciri, kart sistemi, vakit
   geçirme kuralı) BİREBİR aynı şekilde işler — sadece "AI turu otomatik durdurur" yerine
   "gerçek insan kendi durdurur" farkı vardır.
5. Eğer Veli, kendi turunda 10 saniye içinde dokunmazsa, TIPKI AI modundaki gibi "top kaybı"
   sayılır ve escalation sayacı işler (Bölüm 8.2).
6. Maç sonunda (10 dakika + varsa uzatma), Maç Sonu Ekranı gösterilir. Seri penaltı kapalı
   olduğu için, skor berabere kalırsa (örn. 2-2), maç BERABERE sonuçlanır, ek atış yapılmaz.

### 18.3 SENARYO C — Kadro Kurma Anı (Kriter Bazlı Mod, Detaylı Adımlar)

1. Kullanıcı "Kriter Bazlı" kadro kurma modunu seçer.
2. Ekranda 5 slot görünür: Dönem (zorunlu), Milliyet, Lig, Takım, (4. slot boş/pasif).
3. Kullanıcı "Dönem" slotuna dokunur, 7 blok listelenir. Kullanıcı "1996-2005" ve
   "2014-2020" olmak üzere İKİ blok seçer (sistem en fazla 2 seçime izin verir, 3.
   seçim denenirse uyarı verilir).
4. Kullanıcı "Milliyet" slotunu BOŞ bırakır (opsiyonel, doldurmak zorunda değil).
5. Kullanıcı "Lig" slotunu BOŞ bırakır.
6. Kullanıcı "Takım" slotuna "Barcelona" yazar/seçer — bu SADECE görsel tema içindir, havuzu
   etkilemez.
7. Kullanıcı "Kadroyu Oluştur" butonuna basar.
8. Sistem arka planda: players_master.csv'den doğum_yılı bilgisine göre 1996-2005 VEYA
   2014-2020 aralığında aktif olabilecek oyuncuları filtreler (iki dönemin BİRLEŞİMİ).
9. Bu filtrelenmiş havuzdan, rating'e göre sıralanmış 24+3 oyuncu seçilir (Bölüm 5.2).
10. Kullanıcıya kadro sunulur, kadronun başlığında "Barcelona" ismi ve teması görünür (logo
    YOKTUR, sadece isim/renk teması).
11. Kullanıcı, ilk 11'i belirlemek için (Bölüm 6.3'teki mod alma yöntemiyle) kronometreyi her
    pozisyon için sırayla çalıştırır.

---

## BÖLÜM 19 — ÖZET KONTROL LİSTESİ (KESİNLEŞEN KARARLAR)

- [x] Platform: Web/PWA, mobil öncelikli
- [x] 3 oyun modu: AI, Co-op (MVP), Online Lig (Faz 2)
- [x] 3 kadro kurma modu: Karışık, Manuel, Kriter Bazlı
- [x] Kriter Bazlı: 5 slot, dönem zorunlu (en fazla 2 seçim), takım kozmetik
- [x] Havuz: 24+3 oyuncu, dilim sistemi
- [x] Veri kaynağı: Wikidata SPARQL
- [x] Rating sistemi: 0-99, hibrit onur bazlı formül
- [x] Kronometre-oyuncu eşleme: kaleci ayrı, mod alma yöntemi
- [x] Maç süresi: 5-10 dk, gerçek kronometre, 2 devre
- [x] Uzatma: oranlı hesaplama, açık/kapalı ayar
- [x] Seri penaltı: açık/kapalı ayar, mod bazlı varsayılan
- [x] Gol sonrası: sıra rakibe geçer
- [x] Vakit geçirme: 10 saniye, 5 kademeli escalation, maç boyu kümülatif
- [x] Ana olay tablosu: 0-9 arası 10 sonuç
- [x] Korner biriktirme: 3 korner = 1 penaltı
- [x] Faul zinciri: sonuç tipi + kart, iki bağımsız sub-roll
- [x] Frikik/penaltı final: tek/çift kuralı (kaleci kurtarır/gol)
- [x] Kaleci: bu sürümde sınırlı/sembolik rol
- [x] Görsel kimlik: retro-grain, halftone, tam ekran animasyonlu olaylar
- [x] Ses tasarımı: kısa, net, dört ana ses tipi
- [x] Maç sonu ekranı: basit, 3 öğe
- [x] Telif stratejisi: isim+istatistik var, logo/foto/forma yok

---

*Doküman Sonu — v2*
