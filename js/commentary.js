(function (root) {
  'use strict';

  /*
   * 90+ Spiker Modülü
   *  - Olay başına ~10 cümlelik havuzdan rastgele, üst üste tekrar etmeyen anlatım.
   *  - Yer tutucular: {p} oyuncu, {gk} kaleci, {t} olayın takımı, {o} rakip takım.
   *  - İsim bilgisi yoksa yalnız isimsiz cümleler kullanılır (online güvenli).
   *  - Bayrak veritabanı: milliyet → emoji + bayrak renkleri (oyuncu kartı temalı).
   */

  const POOLS = {
    goal: [
      'GOOOL! {p} topu ağlarla buluşturuyor!',
      '{p} vurdu, kaleci sadece baktı! Muhteşem gol!',
      'Ağlar havalandı! {p} sahneye imzasını attı!',
      '{p} soğukkanlı, köşeyi buldu! {t} öne geçmek için haykırıyor!',
      'İnanılmaz bir vuruş {p} imzalı! Tribünler yıkılıyor!',
      'Top ağlarda! Stadyum ayakta!',
      'Bu nasıl bir bitiricilik! Skora yansıyan saf yetenek!',
      '{p} bunu kaçırmazdı! File bekçisi çaresiz!',
      'Kalecinin uzandığı köşeye çakıldı top! Enfes bir an!',
      'Golün adresi belli: {p}! {o} savunması yıkıldı!'
    ],
    save: [
      '{gk} uçarak topu çıkarıyor! Ne kurtarış!',
      'Mutlak golü {gk} önledi! Eldivenler alev alev!',
      '{p} vurdu ama {gk} duvar gibi!',
      'Kaleci köşeye yattı, top oyun alanında! Alkışlar file bekçisine!',
      'Refleks desen refleks! Kurtaran adam sahnede!',
      '{gk} bugün geçit vermiyor!',
      'Şık bir plonjonla kurtardı! Tribünlerden "ooo" sesleri!',
      'Vuruş sertti ama eldiven daha sertti!',
      '{p} elini başına götürdü, kaleci gülümsüyor!',
      'Kalecinin parmak uçları maçın kaderini değiştirdi!'
    ],
    post: [
      'DİREK! Sadece santimetreler golü engelledi!',
      '{p} vurdu, top direkten döndü! Stadyum inledi!',
      'Kale direği bugün {o} takımının en iyi savunmacısı!',
      'Metalin sesi hâlâ yankılanıyor! Direk!',
      'Top direkte patladı, kaleci sadece izledi!',
      'Şanssızlığın böylesi! {p} kafasını tutuyor!',
      'Az kalsın! Direkten dönen topa yürekler ağza geldi!',
      'Direkler bugün sınavda! Bir kez daha "ooo"!',
      '{p} çok yaklaştı ama direk "hayır" dedi!',
      'Gole en yakın an: direkten dönen o top!'
    ],
    wide: [
      'Auta gitti! {p} çerçeveyi bulamadı.',
      'Top üst ağlarda... Fırsat kaçtı!',
      '{p} vurdu ama isabet yok!',
      'Tribünlere giden bir vuruş, iç çekişler duyuluyor.',
      'Pozisyon vardı, isabet yoktu!',
      'Az farkla dışarı! {t} adına yazık oldu.',
      'Kaleci topun autuna sadece baktı.',
      'Vuruşun gücü vardı, adresi yoktu!',
      '{p} bu pozisyonun tekrar gelmesini bekleyecek.',
      'Uzaklara giden top, kaçan umutlar...'
    ],
    shot: [
      '{p} pozisyonda! Vuruş geliyor!',
      'Şut çekiyor {p}! Nefesler tutuldu!',
      'Topla buluştu ve gözü kalede!',
      'Ceza sahası hareketlendi, {p} tetikte!',
      'Fırsat kokusu var! {t} atakta!',
      'Vuruş hakkı {p} ayağında!',
      'Kalabalık ayakta, şut geliyor!',
      'Savunma açık kaldı, {p} boşlukta!',
      'Bu pozisyondan şut düşünülür mü? {p} düşünmedi bile!',
      'Gerilim tavan yaptı, top {p} önünde!'
    ],
    pass: [
      '{p} güzel bir pasla oyunu sürdürüyor.',
      'Top {t} ayaklarında dolaşıyor.',
      'Sakin bir kurulum, pas trafiği işliyor.',
      '{p} arkadaşını gördü, isabetli pas!',
      'Orta sahada hakimiyet {t} tarafında.',
      'Pas! Oyun hızlanıyor.',
      'Topa sahip olan taraf ritmi buldu.',
      '{p} yönü değiştirdi, atak devam ediyor.',
      'Kısa pas, akıllı futbol.',
      'Top kaybetmeden ilerliyorlar.'
    ],
    foul: [
      'Sert müdahale! Hakem düdüğü çaldı!',
      '{p} rakibini durdurmak için faule başvurdu.',
      'Oyun sertleşiyor, faul kararı!',
      'Tribünler itiraz ediyor ama karar net: faul!',
      '{o} serbest vuruş kullanacak.',
      'Kural dışı müdahale, oyun durdu.',
      '{p} topu değil rakibini buldu!',
      'Hakem oyunu durdurdu, gergin anlar!',
      'Bu müdahaleye düdük gecikmedi!',
      'Faul! Şimdi gözler hakemin vereceği kararda.'
    ],
    corner: [
      'Korner! Sayaç işliyor: unutmayın, üçüncü korner penaltı!',
      'Top kornere gitti, {t} baskısı sürüyor.',
      'Köşe vuruşu kazanıldı! Tehlike çanları!',
      'Savunma topu kornere tokatladı!',
      'Korner sayacı yükseliyor, {o} savunması diken üstünde!',
      'Bir korner daha! Baskı hissediliyor!',
      'Bayrak dibinden merkeze doğru tehlike büyüyor.',
      '{t} kornerlerle rakibi bunaltıyor!',
      'Sayaç ilerledi! Penaltıya bir adım daha!',
      'Korner! Tribünler öne eğildi.'
    ],
    throwIn: [
      'Top taca çıktı, oyun kenardan devam edecek.',
      'Taç atışı {o} tarafında.',
      'Top çizgiyi geçti, kısa bir mola.',
      'Kenar çizgisinden oyun yeniden başlıyor.',
      'Taç! Toplar yön değiştiriyor.',
      'Oyun kenara taştı, top el değiştirdi.',
      'Hakem taç işareti verdi.',
      'Top dışarıda, {o} kullanacak.',
      'Kenardan devam, tempo düşmüyor.',
      'Taç atışıyla oyun akıyor.'
    ],
    turnover: [
      'Top kaybı! {o} kontrolü aldı.',
      '{p} topu rakibe kaptırdı!',
      'Hatalı pas, top el değiştirdi!',
      'Savunma araya girdi, atak kesildi.',
      '{o} topu kapıp hızla dönüyor!',
      'Kontrolsüz dokunuş, top rakipte!',
      'Bu kayıp pahalıya mal olabilir!',
      'Hücum dağıldı, top karşı tarafta.',
      '{p} bir daha denemek için topu geri bekleyecek.',
      'Top sahibini değiştirdi, oyun dönüyor!'
    ],
    penalty: [
      'PENALTI! Hakem beyaz noktayı gösteriyor!',
      'Stadyum bir anda sessizliğe gömüldü: penaltı kararı!',
      'Bu büyük bir fırsat! Penaltı!',
      'Karar net: top noktada!',
      'Ceza sahasında ihlal, penaltı düdüğü!',
      'Kader anı yaklaşıyor: penaltı vuruşu!',
      'Nokta atışı zamanı! Yürekler ağızda!',
      '{t} penaltı kazandı! İnanılmaz gerilim!',
      'Hakem kararlı: penaltı! İtirazlar sonuç vermez!',
      'Beyaz nokta sahnede, gözler vuruşu yapacak oyuncuda!'
    ],
    freeKick: [
      'Frikik! Tehlikeli bir noktadan kullanılacak!',
      'Duran top fırsatı {t} önünde!',
      'Baraj kuruluyor, vuruş hazırlığı sürüyor.',
      'Bu mesafeden gol olur mu? Birazdan göreceğiz!',
      'Frikik noktasında hareketlilik!',
      'Serbest vuruş! Kaleci barajı dizmekle meşgul.',
      'Topun başında düşünen bir oyuncu var...',
      'Duran toplar bu maçın kaderini yazabilir!',
      'Frikik kazanıldı, tribünler umutlu!',
      'Vuruş öncesi derin bir nefes...'
    ],
    indirect: [
      'Serbest vuruş, oyun yeniden kuruluyor.',
      'Hakem devam ettiriyor, top serbest vuruşla oyunda.',
      'Kısa kullanıldı, atak yeniden örgütleniyor.',
      'Serbest vuruş {t} lehine.',
      'Oyun duran topla akmaya devam ediyor.',
      'Vuruş kullanıldı, mücadele sürüyor.',
      'Topun başına geçildi, oyun devam ediyor.',
      'Serbest vuruşla yeni bir sayfa açılıyor.',
      'Sakin kullanım, kontrollü başlangıç.',
      'Hakemin işaretiyle top yeniden oyunda.'
    ],
    yellow: [
      'Sarı kart! {p} artık dikkatli oynamak zorunda.',
      'Hakem cebine gitti: sarı kart {p} adına!',
      'İhtar geldi! Bir sonraki faul çok pahalı olabilir.',
      'Kart çıktı! {p} isyan etse de karar kesin.',
      'Sarıyla kurtardı aslında {p}, pozisyon sertti!',
      'Hakemden net mesaj: sarı kart!',
      'Defter açıldı, {p} kaydedildi!',
      'Bu kart maçın geri kalanını etkiler!',
      'Tribünler kartı alkışlıyor... ya da yuhalıyor!',
      'İhtar tabelası kalktı: sarı!'
    ],
    red: [
      'KIRMIZI KART! {p} oyun dışı!',
      'İhraç! {t} on kişi kaldı!',
      'Hakem hiç tereddüt etmedi: direkt kırmızı!',
      'Soyunma odasının yolu göründü!',
      'Maçın dengesini değiştiren an: kırmızı kart!',
      'Sert müdahalenin bedeli ağır oldu!',
      '{p} sahayı terk ediyor, takımı çaresiz!',
      'Kırmızı! Tribünler ayağa kalktı!',
      'Bu karta kimsenin itirazı olamaz!',
      'On kişilik uzun bir mücadele başlıyor!'
    ],
    secondYellow: [
      'İkinci sarıdan kırmızı! {p} için oyun bitti!',
      'Bir sarı daha ve yolun sonu! İhraç!',
      'Defterdeki isim ikinci kez yazıldı: kırmızı!',
      'Riskli oyunun faturası kesildi: ikinci sarı!',
      '{p} ilk karttan ders çıkarmadı, cezası ihraç!',
      'İki sarı bir kırmızı eder! Oyun dışı!',
      'Hakem önce sarıyı sonra kırmızıyı gösterdi!',
      'Takımı şimdi on kişiyle direnecek!',
      'Kural kuraldır: ikinci sarı, ihraç!',
      'Dikkatsizliğin bedeli: erken duş!'
    ],
    timeout: [
      'Süre doldu! 10 saniye kuralı işledi!',
      'Kronometre affetmedi: ihlal!',
      'Zaman yönetimi hatası! Top rakibe geçiyor!',
      'Beklemenin bedeli: süre ihlali!',
      'Hakem süre ihlalini kaydetti!',
      'On saniye çabuk geçiyor! İhlal!',
      'Sayaç doldu, düdük çaldı!',
      'Kararsızlık pahalıya patladı!',
      'İhlal hanesi kabarıyor, dikkat!',
      'Zaman bu oyunda en acımasız rakip!'
    ],
    kickoff: [
      'Ve maç başlıyor! İlk düdük çaldı!',
      'Top santrada, mücadele resmen start aldı!',
      'Kronometreler kuruldu, futbol şöleni başlasın!',
      'Hakem işaret verdi, oyun başladı!',
      'İlk topa dokunuş, ilk heyecan!',
      'Doksan artı dakikalık macera başlıyor!',
      'Santra yapıldı! Herkes yerinde!',
      'Maç başladı, ilk atak kimden gelecek?',
      'Sahne hazır, oyuncular sahada, top oyunda!',
      'Başlama vuruşuyla birlikte tempo yükseliyor!'
    ],
    penaltyGoal: [
      'Penaltı gole dönüştü! Soğukkanlı vuruş!',
      'Noktadan şaşmadı! GOOOL!',
      'Kaleci köşeyi bildi ama top daha hızlıydı!',
      '{p} penaltıyı buz gibi kullandı!',
      'Nokta atışı tam isabet!',
      'Topu köşeye yerleştirdi, kaleci çaresiz!',
      'Penaltıdan gelen gol skoru değiştiriyor!',
      'Baskıya rağmen mükemmel vuruş!',
      'File bekçisi ters köşe! Gol!',
      'Beyaz noktadan ağlara: GOL!'
    ],
    penaltySave: [
      '{gk} penaltıyı çıkardı! İNANILMAZ!',
      'Kaleci kahraman! Penaltı kurtarışı!',
      'Köşeyi doğru bildi {gk}! Muhteşem!',
      'Penaltı kaçtı! Eldivenler geçit vermedi!',
      'Vuruş iyiydi, kurtarış efsaneydi!',
      '{gk} takımını maçta tuttu!',
      'Nokta vuruşuna kapı kapalı!',
      'Kalecinin sezgisi golü çaldı!',
      'Penaltı kurtaran kaleci: maçların gizli galibi!',
      'Tribünler kalecinin adını haykırıyor!'
    ],
    penaltyMiss: [
      'Penaltı kaçtı! Top dışarıda!',
      'Noktadan aut! Büyük şok!',
      'Bu kaçar mı?! Kaçtı!',
      'Vuruş çerçeveyi bulamadı!',
      'Baskı ağır geldi, top auta!',
      'Penaltıyı harcadı! Eller başlarda!',
      'Kaleci yanlış köşeye gitti ama top da dışarı!',
      'Fırsat noktada eridi!',
      'Kaçan penaltı, yükselen gerilim!',
      'O kadar yoldan gelip noktadan dönmek...'
    ],
    injury: [
      'Sakatlık! Oyuncu yerde kaldı!',
      'Sağlık ekipleri sahada, durum ciddi görünüyor.',
      'Oyuna devam edemiyor, değişiklik kaçınılmaz.',
      'Talihsiz bir sakatlık yaşandı.',
      'Sedye geliyor, tribünler alkışlıyor.',
      'Mücadelenin bedeli: sakatlık.',
      'Takım arkadaşları endişeli, oyuncu çıkıyor.',
      'Bu sakatlık planları bozar!',
      'Sahada üzücü dakikalar...',
      'Oyuncu sahayı gözyaşlarıyla terk ediyor.'
    ],
    stoppage: [
      'Hakem ek süreyi gösterdi!',
      'Uzatma dakikaları geliyor!',
      'Tabela kalktı: ek süre!',
      'Maç uzuyor, umutlar sürüyor!',
      'Son dakika savaşları başlamak üzere!',
      'Ek süre! Her şey olabilir!',
      'Kronometre henüz durmadı!',
      'Hakem oyunun uzayacağını işaret etti!',
      'Dakikalar eklendi, dramlar bekleniyor!',
      'Ek süre tabelası tribünleri ayağa kaldırdı!'
    ],
    forfeit: [
      'Hükmen sonuç! Maç burada bitti!',
      'Kurallar konuştu: hükmen mağlubiyet!',
      'Maç hükmen sonuçlandı!',
      'Beşinci ihlal, otomatik hüküm!',
      'Bu şekilde bitmesini kimse istemezdi: hükmen!',
      'Skor tabelasına hükmen yazıldı!',
      'Oyun kurallarının acı yüzü: hükmen!',
      'Maçın kaderini ihlaller belirledi!',
      'Hakem maçı hükmen tescil etti!',
      'Hükmen karar: itiraz yok!'
    ]
  };

  const FLAGS = {
    'Türkiye': { emoji: '🇹🇷', colors: ['#e30a17', '#ffffff'], ink: '#ffffff', dark: true },
    'Almanya': { emoji: '🇩🇪', colors: ['#111111', '#dd0000', '#ffcc00'], ink: '#ffffff', dark: true },
    'İngiltere': { emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', colors: ['#ffffff', '#ce1124'], ink: '#1a1a1a' },
    'İtalya': { emoji: '🇮🇹', colors: ['#009246', '#ffffff', '#ce2b37'], ink: '#1a1a1a' },
    'İspanya': { emoji: '🇪🇸', colors: ['#aa151b', '#f1bf00'], ink: '#3b1212', dark: true },
    'Fransa': { emoji: '🇫🇷', colors: ['#0055a4', '#ffffff', '#ef4135'], ink: '#1a1a1a' },
    'Portekiz': { emoji: '🇵🇹', colors: ['#046a38', '#da291c'], ink: '#ffffff', dark: true },
    'Hollanda': { emoji: '🇳🇱', colors: ['#ae1c28', '#ffffff', '#21468b'], ink: '#1a1a1a' },
    'Belçika': { emoji: '🇧🇪', colors: ['#111111', '#fdda24', '#ef3340'], ink: '#ffffff', dark: true },
    'Brezilya': { emoji: '🇧🇷', colors: ['#009739', '#fedd00', '#012169'], ink: '#0b2d13', dark: true },
    'Arjantin': { emoji: '🇦🇷', colors: ['#6cace4', '#ffffff'], ink: '#173a5e' },
    'Uruguay': { emoji: '🇺🇾', colors: ['#7bafd4', '#ffffff'], ink: '#1c3a54' },
    'Şili': { emoji: '🇨🇱', colors: ['#0032a0', '#ffffff', '#da291c'], ink: '#1a1a1a' },
    'Kolombiya': { emoji: '🇨🇴', colors: ['#ffcd00', '#003087', '#c8102e'], ink: '#2b2000' },
    'Peru': { emoji: '🇵🇪', colors: ['#d91023', '#ffffff'], ink: '#5c0710' },
    'Paraguay': { emoji: '🇵🇾', colors: ['#d52b1e', '#ffffff', '#0038a8'], ink: '#1a1a1a' },
    'Meksika': { emoji: '🇲🇽', colors: ['#006341', '#ffffff', '#c8102e'], ink: '#1a1a1a' },
    'ABD': { emoji: '🇺🇸', colors: ['#b31942', '#ffffff', '#0a3161'], ink: '#1a1a1a' },
    'Ekvador': { emoji: '🇪🇨', colors: ['#ffd100', '#0072ce', '#ef3340'], ink: '#332900' },
    'Kosta Rika': { emoji: '🇨🇷', colors: ['#002b7f', '#ffffff', '#ce1126'], ink: '#1a1a1a' },
    'Honduras': { emoji: '🇭🇳', colors: ['#00bce4', '#ffffff'], ink: '#093a47' },
    'Trinidad ve Tobago': { emoji: '🇹🇹', colors: ['#da1a35', '#ffffff', '#1a1a1a'], ink: '#ffffff', dark: true },
    'Japonya': { emoji: '🇯🇵', colors: ['#ffffff', '#bc002d'], ink: '#1a1a1a' },
    'Güney Kore': { emoji: '🇰🇷', colors: ['#ffffff', '#cd2e3a', '#0047a0'], ink: '#1a1a1a' },
    'İran': { emoji: '🇮🇷', colors: ['#239f40', '#ffffff', '#da0000'], ink: '#1a1a1a' },
    'Suudi Arabistan': { emoji: '🇸🇦', colors: ['#165d31', '#ffffff'], ink: '#ffffff', dark: true },
    'Avustralya': { emoji: '🇦🇺', colors: ['#00247d', '#ffffff', '#cf142b'], ink: '#ffffff', dark: true },
    'Kamerun': { emoji: '🇨🇲', colors: ['#007a5e', '#ce1126', '#fcd116'], ink: '#ffffff', dark: true },
    'Nijerya': { emoji: '🇳🇬', colors: ['#008751', '#ffffff'], ink: '#0b3323' },
    'Gana': { emoji: '🇬🇭', colors: ['#ce1126', '#fcd116', '#006b3f'], ink: '#2b1200', dark: true },
    'Senegal': { emoji: '🇸🇳', colors: ['#00853f', '#fdef42', '#e31b23'], ink: '#0b2d13', dark: true },
    'Fildişi Sahili': { emoji: '🇨🇮', colors: ['#ff8200', '#ffffff', '#009a44'], ink: '#1a1a1a' },
    'Mali': { emoji: '🇲🇱', colors: ['#14b53a', '#fcd116', '#ce1126'], ink: '#0c2d12', dark: true },
    'Cezayir': { emoji: '🇩🇿', colors: ['#006233', '#ffffff'], ink: '#0b3323' },
    'Fas': { emoji: '🇲🇦', colors: ['#c1272d', '#006233'], ink: '#ffffff', dark: true },
    'Mısır': { emoji: '🇪🇬', colors: ['#ce1126', '#ffffff', '#111111'], ink: '#1a1a1a' },
    'Güney Afrika': { emoji: '🇿🇦', colors: ['#007749', '#ffb81c', '#001489'], ink: '#ffffff', dark: true },
    'Zambiya': { emoji: '🇿🇲', colors: ['#198a00', '#ef7d00'], ink: '#ffffff', dark: true },
    'Zimbabve': { emoji: '🇿🇼', colors: ['#319400', '#ffd200', '#d40000'], ink: '#1f2a00', dark: true },
    'Liberya': { emoji: '🇱🇷', colors: ['#bf0a30', '#ffffff', '#002868'], ink: '#1a1a1a' },
    'Danimarka': { emoji: '🇩🇰', colors: ['#c8102e', '#ffffff'], ink: '#ffffff', dark: true },
    'İsveç': { emoji: '🇸🇪', colors: ['#006aa7', '#fecc02'], ink: '#ffffff', dark: true },
    'Norveç': { emoji: '🇳🇴', colors: ['#ba0c2f', '#ffffff', '#00205b'], ink: '#ffffff', dark: true },
    'Finlandiya': { emoji: '🇫🇮', colors: ['#ffffff', '#002f6c'], ink: '#12233f' },
    'Polonya': { emoji: '🇵🇱', colors: ['#ffffff', '#dc143c'], ink: '#1a1a1a' },
    'Çekya': { emoji: '🇨🇿', colors: ['#ffffff', '#d7141a', '#11457e'], ink: '#1a1a1a' },
    'Slovakya': { emoji: '🇸🇰', colors: ['#ffffff', '#0b4ea2', '#ee1c25'], ink: '#1a1a1a' },
    'Macaristan': { emoji: '🇭🇺', colors: ['#ce2939', '#ffffff', '#477050'], ink: '#1a1a1a' },
    'Romanya': { emoji: '🇷🇴', colors: ['#002b7f', '#fcd116', '#ce1126'], ink: '#ffffff', dark: true },
    'Bulgaristan': { emoji: '🇧🇬', colors: ['#ffffff', '#00966e', '#d62612'], ink: '#1a1a1a' },
    'Yunanistan': { emoji: '🇬🇷', colors: ['#0d5eaf', '#ffffff'], ink: '#ffffff', dark: true },
    'Hırvatistan': { emoji: '🇭🇷', colors: ['#ff0000', '#ffffff', '#171796'], ink: '#1a1a1a' },
    'Sırbistan': { emoji: '🇷🇸', colors: ['#c6363c', '#0c4076', '#ffffff'], ink: '#ffffff', dark: true },
    'Bosna-Hersek': { emoji: '🇧🇦', colors: ['#002395', '#fecb00'], ink: '#ffffff', dark: true },
    'Karadağ': { emoji: '🇲🇪', colors: ['#c40308', '#d3ae3b'], ink: '#ffffff', dark: true },
    'Slovenya': { emoji: '🇸🇮', colors: ['#ffffff', '#005da4', '#ed1c24'], ink: '#1a1a1a' },
    'Yugoslavya': { emoji: '🏳️', colors: ['#003893', '#ffffff', '#de0000'], ink: '#ffffff', dark: true },
    'SSCB': { emoji: '🚩', colors: ['#cc0000', '#ffd700'], ink: '#ffffff', dark: true },
    'Rusya': { emoji: '🇷🇺', colors: ['#ffffff', '#0033a0', '#da291c'], ink: '#1a1a1a' },
    'Ukrayna': { emoji: '🇺🇦', colors: ['#0057b7', '#ffd700'], ink: '#ffffff', dark: true },
    'Gürcistan': { emoji: '🇬🇪', colors: ['#ffffff', '#ff0000'], ink: '#1a1a1a' },
    'Ermenistan': { emoji: '🇦🇲', colors: ['#d90012', '#0033a0', '#f2a800'], ink: '#ffffff', dark: true },
    'İskoçya': { emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', colors: ['#005eb8', '#ffffff'], ink: '#ffffff', dark: true },
    'Galler': { emoji: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', colors: ['#00b140', '#ffffff', '#c8102e'], ink: '#1a1a1a' },
    'Kuzey İrlanda': { emoji: '🇬🇧', colors: ['#ffffff', '#c8102e'], ink: '#1a1a1a' },
    'İrlanda': { emoji: '🇮🇪', colors: ['#169b62', '#ffffff', '#ff883e'], ink: '#1a1a1a' },
    'Avusturya': { emoji: '🇦🇹', colors: ['#ed2939', '#ffffff'], ink: '#5c0e15' },
    'İsviçre': { emoji: '🇨🇭', colors: ['#da291c', '#ffffff'], ink: '#ffffff', dark: true },
    'İzlanda': { emoji: '🇮🇸', colors: ['#02529c', '#ffffff', '#dc1e35'], ink: '#ffffff', dark: true }
  };

  const FALLBACK_FLAG = { emoji: '⚽', colors: ['#13233f', '#c93b32'], ink: '#ffffff', dark: true };

  const recent = new Map(); // type -> son kullanılan indeksler

  function line(type, ctx = {}) {
    const pool = POOLS[type];
    if (!pool || !pool.length) return '';
    const hasActor = Boolean(ctx.p || ctx.actor);
    const hasKeeper = Boolean(ctx.gk || ctx.keeper);
    const usable = pool
      .map((text, index) => ({ text, index }))
      .filter(({ text }) => (hasActor || !text.includes('{p}')) && (hasKeeper || !text.includes('{gk}')));
    const candidates = usable.length ? usable : pool.map((text, index) => ({ text, index }));
    const used = recent.get(type) || [];
    const fresh = candidates.filter(({ index }) => !used.includes(index));
    const chosen = (fresh.length ? fresh : candidates)[Math.floor(Math.random() * (fresh.length ? fresh.length : candidates.length))];
    const nextUsed = [...used, chosen.index].slice(-4);
    recent.set(type, nextUsed);
    return chosen.text
      .replaceAll('{p}', ctx.p || ctx.actor || 'Oyuncu')
      .replaceAll('{gk}', ctx.gk || ctx.keeper || 'Kaleci')
      .replaceAll('{t}', ctx.t || ctx.team || 'takım')
      .replaceAll('{o}', ctx.o || ctx.other || 'rakip');
  }

  function flag(nationality) {
    return FLAGS[String(nationality || '').trim()] || FALLBACK_FLAG;
  }

  root.Commentary = Object.freeze({ line, flag, POOLS, FLAGS });
})(typeof window !== 'undefined' ? window : globalThis);
