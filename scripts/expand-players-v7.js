'use strict';

/*
 * Oyuncu havuzu v7 genişletmesi.
 * Odak: kapsamlı Türk futbolcular (efsane + güncel) ve dünya futbolundan
 * geniş bir küratörlü ek liste. Kimlik + isim bazında tekilleştirme yapılır.
 * Çalıştır: node scripts/expand-players-v7.js
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'js', 'players.js');
const data = require(FILE);

const RAW = `
Rustu Recber|Türkiye|GK|1991|2012|Süper Lig;La Liga|88
Hakan Calhanoglu|Türkiye|CM|2013|2026|Bundesliga;Serie A|87
Arda Guler|Türkiye|AM|2021|2026|Süper Lig;La Liga|85
Kenan Yildiz|Türkiye|AM|2021|2026|Serie A|84
Bulent Korkmaz|Türkiye|CB|1987|2005|Süper Lig|84
Emre Belozoglu|Türkiye|CM|1996|2019|Süper Lig;Serie A;Premier Lig|84
Alex de Souza|Brezilya|AM|1995|2014|Brezilya Ligi;Süper Lig|89
Sergen Yalcin|Türkiye|AM|1990|2008|Süper Lig|84
Gheorghe Hagi|Romanya|AM|1982|2001|Romanya Ligi;La Liga;Süper Lig|92
Arda Turan|Türkiye|RW|2004|2020|Süper Lig;La Liga|85
Volkan Babacan|Türkiye|GK|2004|2022|Süper Lig|75
Ugur Boral|Türkiye|LW|2001|2015|Süper Lig|74
Mehmet Topal|Türkiye|DM|2004|2021|Süper Lig;La Liga|79
Gokhan Inler|Türkiye|DM|2004|2020|İsviçre Ligi;Serie A;Süper Lig|81
Hakan Balta|Türkiye|CB|2003|2019|Süper Lig|76
Sabri Sarioglu|Türkiye|RB|2001|2018|Süper Lig|75
Aykut Kocaman|Türkiye|ST|1983|2001|Süper Lig|83
Tanju Colak Efsane|Türkiye|ST|1981|1995|Süper Lig|84
Oguz Cetin|Türkiye|CM|1985|2000|Süper Lig|79
Rıdvan Yilmaz|Türkiye|LB|2019|2026|Süper Lig;İskoçya Ligi|75
Feghouli|Cezayir|RW|2007|2024|Ligue 1;La Liga;Süper Lig|79
Jay-Jay Okocha Efsane|Nijerya|AM|1990|2008|Bundesliga;Süper Lig;Premier Lig|87
Ferdi Kadioglu|Türkiye|LB|2016|2026|Hollanda Ligi;Süper Lig;Premier Lig|81
Cengiz Under|Türkiye|RW|2014|2026|Süper Lig;Serie A;Ligue 1|79
Merih Demiral|Türkiye|CB|2016|2026|Serie A;Suudi Ligi|81
Ozan Kabak|Türkiye|CB|2017|2026|Bundesliga;Premier Lig|78
Zeki Celik|Türkiye|RB|2015|2026|Ligue 1;Serie A|78
Yusuf Yazici|Türkiye|AM|2014|2026|Süper Lig;Ligue 1|78
Orkun Kokcu|Türkiye|CM|2018|2026|Hollanda Ligi;Portekiz Ligi|81
Salih Ozcan|Türkiye|DM|2016|2026|Bundesliga|77
Kaan Ayhan|Türkiye|CB|2012|2026|Bundesliga;La Liga|76
Cenk Tosun|Türkiye|ST|2008|2025|Süper Lig;Premier Lig|77
Umut Bozok|Türkiye|ST|2015|2026|Ligue 1;Süper Lig|73
Irfan Can Kahveci|Türkiye|AM|2012|2026|Süper Lig|78
Dorukhan Tokoz|Türkiye|CM|2014|2025|Süper Lig|73
Okay Yokuslu|Türkiye|DM|2010|2026|Süper Lig;La Liga;Premier Lig|76
Caglar Birinci|Türkiye|CB|2005|2019|Süper Lig|71
Mert Gunok|Türkiye|GK|2006|2026|Süper Lig;Premier Lig|79
Ugurcan Cakir|Türkiye|GK|2014|2026|Süper Lig|81
Altay Bayindir|Türkiye|GK|2016|2026|Süper Lig;Premier Lig|78
Berke Ozer|Türkiye|GK|2017|2026|Süper Lig;Ligue 1|74
Abdulkerim Bardakci|Türkiye|CB|2015|2026|Süper Lig|77
Samet Akaydin|Türkiye|CB|2014|2026|Süper Lig|75
Ahmetcan Kaplan|Türkiye|CB|2020|2026|Hollanda Ligi|74
Eren Elmali|Türkiye|LB|2019|2026|Süper Lig|75
Mert Muldur|Türkiye|RB|2017|2026|Serie A;Süper Lig|76
Baris Alper Yilmaz|Türkiye|RW|2019|2026|Süper Lig|79
Kerem Akturkoglu|Türkiye|LW|2019|2026|Süper Lig;Portekiz Ligi|80
Oguz Aydin|Türkiye|RW|2019|2026|Süper Lig|74
Yunus Akgun|Türkiye|RW|2018|2026|Süper Lig;Premier Lig|76
Ismail Yuksek|Türkiye|DM|2019|2026|Süper Lig|75
Berat Ozdemir|Türkiye|DM|2018|2025|Süper Lig|72
Enes Unal|Türkiye|ST|2014|2026|La Liga;Premier Lig|77
Bertug Yildirim|Türkiye|ST|2020|2026|Süper Lig;Ligue 1|72
Semih Kilicsoy|Türkiye|ST|2022|2026|Süper Lig|76
Can Uzun|Türkiye|AM|2022|2026|Bundesliga|78
Yusuf Sari|Türkiye|RW|2016|2026|Süper Lig|72
Emre Mor|Türkiye|RW|2015|2025|Bundesliga;Süper Lig|72
Emre Kilinc|Türkiye|RW|2013|2025|Süper Lig|72
Halil Dervisoglu|Türkiye|ST|2018|2026|Premier Lig;Süper Lig|73
Dogan Alemdar|Türkiye|GK|2019|2026|Ligue 1;Süper Lig|72
Umut Nayir|Türkiye|ST|2014|2026|Süper Lig|71
Tolgay Arslan|Türkiye|CM|2009|2025|Bundesliga;Süper Lig|75
Hasan Ali Kaldirim|Türkiye|LB|2008|2024|Süper Lig|75
Gokhan Akkan|Türkiye|GK|2014|2026|Süper Lig|72
Mahmut Tekdemir|Türkiye|DM|2006|2025|Süper Lig|73
Ozan Tufan|Türkiye|CM|2013|2026|Süper Lig;Premier Lig|77
Serdar Aziz|Türkiye|CB|2010|2025|Süper Lig|76
Serdar Gurler|Türkiye|RW|2010|2026|Süper Lig;La Liga|72
Serdar Dursun|Türkiye|ST|2010|2026|Bundesliga;Süper Lig|74
Kerem Demirbay|Türkiye|CM|2011|2026|Bundesliga;Süper Lig|77
Nazim Sangare|Türkiye|RB|2014|2025|Süper Lig|71
Efecan Karaca|Türkiye|AM|2008|2025|Süper Lig|72
Alperen Uysal|Türkiye|GK|2015|2026|Süper Lig|69
Batuhan Sen|Türkiye|GK|2019|2026|Süper Lig|68
Emirhan Ilkhan|Türkiye|CM|2020|2026|Serie A;Süper Lig|72
Yusuf Akcicek|Türkiye|CB|2022|2026|Süper Lig;Suudi Ligi|74
Bertan Kirdemir|Türkiye|GK|2018|2026|Süper Lig|66
Metehan Baltaci|Türkiye|CB|2019|2026|Süper Lig|71
Baris Yardimci|Türkiye|LB|2019|2026|Süper Lig|70
Efe Akman|Türkiye|DM|2022|2026|Süper Lig|70
Zafer Ozgultekin|Türkiye|GK|1994|2010|Süper Lig|72
Erhan Onal|Türkiye|CM|1974|1990|Bundesliga;Süper Lig|76
Tuncay Sanli Efsane|Türkiye|RW|1998|2013|Süper Lig;Premier Lig|80
Elvir Balic|Bosna-Hersek|AM|1993|2008|Süper Lig;La Liga|80
Jardel|Brezilya|ST|1993|2008|Portekiz Ligi;Süper Lig|87
Sonny Anderson|Brezilya|ST|1990|2007|Ligue 1;La Liga|84
Giovanni Silva|Brezilya|AM|1993|2007|Brezilya Ligi;La Liga;Yunanistan Ligi|83
Pierre Webo|Kamerun|ST|2002|2016|Süper Lig;La Liga|75
Dirk Kuyt|Hollanda|RW|1998|2017|Hollanda Ligi;Premier Lig;Süper Lig|82
Robin van Persie Efsane|Hollanda|ST|2001|2019|Premier Lig;Süper Lig|89
Wesley Sneijder Efsane|Hollanda|AM|2002|2019|Hollanda Ligi;La Liga;Serie A;Süper Lig|89
Lukas Podolski Efsane|Almanya|LW|2003|2022|Bundesliga;Premier Lig;Süper Lig|84
Nani|Portekiz|RW|2003|2023|Portekiz Ligi;Premier Lig;Süper Lig|83
Ricardo Quaresma|Portekiz|RW|2001|2021|Portekiz Ligi;Serie A;Süper Lig|82
Pepe Efsane|Portekiz|CB|2001|2024|Portekiz Ligi;La Liga;Süper Lig|88
Nicolas Anelka|Fransa|ST|1996|2015|Ligue 1;Premier Lig;Süper Lig|85
Dries Mertens|Belçika|LW|2005|2025|Hollanda Ligi;Serie A;Süper Lig|84
Radamel Falcao|Kolombiya|ST|2005|2024|Arjantin Ligi;Portekiz Ligi;La Liga;Süper Lig|87
Mauro Icardi|Arjantin|ST|2012|2026|Serie A;Ligue 1;Süper Lig|84
Edin Dzeko|Bosna-Hersek|ST|2003|2026|Bundesliga;Premier Lig;Serie A;Süper Lig|85
Victor Osimhen|Nijerya|ST|2016|2026|Ligue 1;Serie A;Süper Lig|87
Youssef En-Nesyri|Fas|ST|2015|2026|La Liga;Süper Lig|80
Alvaro Morata|İspanya|ST|2010|2026|La Liga;Serie A;Süper Lig|82
Ciro Immobile|İtalya|ST|2009|2026|Serie A;Süper Lig|84
Leroy Sane|Almanya|LW|2014|2026|Bundesliga;Premier Lig;Süper Lig|85
Ilkay Gundogan|Almanya|CM|2009|2026|Bundesliga;Premier Lig;La Liga|86
Sead Kolasinac|Bosna-Hersek|LB|2012|2026|Bundesliga;Premier Lig|77
Anderson Talisca|Brezilya|AM|2013|2026|Portekiz Ligi;Suudi Ligi;Süper Lig|81
Fred|Brezilya|CM|2013|2026|Ukrayna Ligi;Premier Lig;Süper Lig|79
Rafa Silva|Portekiz|AM|2012|2026|Portekiz Ligi;Süper Lig|81
Gabriel Sara|Brezilya|CM|2017|2026|Brezilya Ligi;Premier Lig;Süper Lig|78
Alexander Djiku|Gana|CB|2013|2026|Ligue 1;Süper Lig|75
Marek Saganowski|Polonya|ST|1996|2014|Polonya Ligi;Premier Lig|72
Maciej Zurawski|Polonya|ST|1994|2011|Polonya Ligi;İskoçya Ligi|75
Jerzy Dudek|Polonya|GK|1995|2011|Polonya Ligi;Premier Lig;La Liga|82
Artur Boruc|Polonya|GK|1999|2017|Polonya Ligi;İskoçya Ligi;Premier Lig|79
Lukasz Fabianski|Polonya|GK|2004|2024|Polonya Ligi;Premier Lig|79
Wojciech Szczesny|Polonya|GK|2009|2026|Premier Lig;Serie A;La Liga|86
Kamil Glik|Polonya|CB|2008|2024|Serie A;Ligue 1|78
Grzegorz Krychowiak|Polonya|DM|2008|2024|Ligue 1;La Liga;Rusya Ligi|79
Arkadiusz Milik|Polonya|ST|2011|2026|Hollanda Ligi;Serie A|79
Piotr Zielinski|Polonya|CM|2011|2026|Serie A|83
Jakub Blaszczykowski|Polonya|RW|2005|2023|Polonya Ligi;Bundesliga|80
Lukasz Piszczek|Polonya|RB|2004|2021|Bundesliga|82
Jan Bednarek|Polonya|CB|2013|2026|Premier Lig|76
Matty Cash|Polonya|RB|2016|2026|Premier Lig|78
Nicola Zalewski|Polonya|LW|2018|2026|Serie A|75
Sebastian Szymanski|Polonya|AM|2016|2026|Rusya Ligi;Süper Lig|79
Krzysztof Piatek|Polonya|ST|2014|2026|Serie A;Süper Lig|77
Karol Linetty|Polonya|CM|2012|2026|Serie A;Süper Lig|73
Damian Szymanski|Polonya|DM|2013|2026|Yunanistan Ligi|72
David Seaman|İngiltere|GK|1982|2004|Premier Lig|87
Nigel Martyn|İngiltere|GK|1987|2006|Premier Lig|78
Paul Robinson|İngiltere|GK|1998|2017|Premier Lig|75
Joe Hart|İngiltere|GK|2004|2023|Premier Lig;İskoçya Ligi|81
Jack Butland|İngiltere|GK|2010|2026|Premier Lig;İskoçya Ligi|74
Gary Neville|İngiltere|RB|1992|2011|Premier Lig|85
Phil Neville|İngiltere|RB|1994|2013|Premier Lig|77
Wes Brown|İngiltere|CB|1996|2016|Premier Lig|76
Jonathan Woodgate|İngiltere|CB|1998|2016|Premier Lig;La Liga|77
Ledley King|İngiltere|CB|1999|2012|Premier Lig|81
Joleon Lescott|İngiltere|CB|2000|2017|Premier Lig|77
Gareth Barry|İngiltere|DM|1997|2020|Premier Lig|79
Scott Parker|İngiltere|DM|1997|2017|Premier Lig|77
Owen Hargreaves|İngiltere|DM|1997|2012|Bundesliga;Premier Lig|79
Joe Cole|İngiltere|AM|1998|2018|Premier Lig;Ligue 1|81
Shaun Wright-Phillips|İngiltere|RW|1999|2015|Premier Lig|76
Stewart Downing|İngiltere|LW|2001|2021|Premier Lig|76
Adam Lallana|İngiltere|AM|2006|2024|Premier Lig|78
James Milner|İngiltere|CM|2002|2026|Premier Lig|80
Theo Walcott|İngiltere|RW|2005|2023|Premier Lig|79
Danny Welbeck|İngiltere|ST|2008|2026|Premier Lig|76
Jermain Defoe|İngiltere|ST|1999|2022|Premier Lig;İskoçya Ligi|80
Darren Bent|İngiltere|ST|2001|2018|Premier Lig|76
Andy Carroll|İngiltere|ST|2006|2026|Premier Lig;Ligue 1|73
Emile Heskey|İngiltere|ST|1995|2016|Premier Lig|76
Kieran Trippier|İngiltere|RB|2011|2026|Premier Lig;La Liga|82
Kyle Walker|İngiltere|RB|2009|2026|Premier Lig;Serie A|84
Luke Shaw|İngiltere|LB|2012|2026|Premier Lig|80
Ben Chilwell|İngiltere|LB|2015|2026|Premier Lig|78
Eric Dier|İngiltere|CB|2012|2026|Premier Lig;Bundesliga|76
Jordan Pickford|İngiltere|GK|2013|2026|Premier Lig|83
Aaron Ramsdale|İngiltere|GK|2017|2026|Premier Lig|77
Conor Coady|İngiltere|CB|2012|2026|Premier Lig|74
Kalvin Phillips|İngiltere|DM|2015|2026|Premier Lig|75
Mason Mount|İngiltere|AM|2017|2026|Premier Lig|79
Marcus Rashford|İngiltere|LW|2015|2026|Premier Lig;La Liga|83
Ollie Watkins|İngiltere|ST|2014|2026|Premier Lig|81
Ivan Toney|İngiltere|ST|2015|2026|Premier Lig;Suudi Ligi|79
Eberechi Eze|İngiltere|AM|2016|2026|Premier Lig|81
Morgan Rogers|İngiltere|AM|2020|2026|Premier Lig|79
Anthony Gordon|İngiltere|LW|2017|2026|Premier Lig|80
Adam Wharton|İngiltere|CM|2021|2026|Premier Lig|77
Marc Guehi|İngiltere|CB|2018|2026|Premier Lig|82
Ezri Konsa|İngiltere|CB|2015|2026|Premier Lig|79
Iker Munain|İspanya|LW|2009|2024|La Liga|79
Ander Herrera|İspanya|CM|2009|2024|La Liga;Premier Lig|79
Juan Mata|İspanya|AM|2006|2024|La Liga;Premier Lig;Süper Lig|82
Santi Cazorla|İspanya|AM|2003|2025|La Liga;Premier Lig|83
Jesus Navas|İspanya|RB|2003|2025|La Liga;Premier Lig|80
Nolito|İspanya|LW|2008|2023|La Liga;Premier Lig|75
Vitolo|İspanya|LW|2010|2024|La Liga|75
Koke|İspanya|CM|2009|2026|La Liga|82
Saul Niguez|İspanya|CM|2012|2026|La Liga;Premier Lig|79
Marcos Llorente|İspanya|CM|2015|2026|La Liga|81
Mikel Merino|İspanya|CM|2015|2026|La Liga;Premier Lig|81
Martin Zubimendi|İspanya|DM|2019|2026|La Liga;Premier Lig|84
Mikel Oyarzabal|İspanya|LW|2015|2026|La Liga|83
Alex Baena|İspanya|AM|2020|2026|La Liga|80
Ferran Torres|İspanya|RW|2017|2026|La Liga;Premier Lig|80
Yeremy Pino|İspanya|RW|2020|2026|La Liga|77
Alejandro Balde|İspanya|LB|2021|2026|La Liga|80
Pau Cubarsi|İspanya|CB|2023|2026|La Liga|82
Dean Huijsen|İspanya|CB|2023|2026|Serie A;Premier Lig;La Liga|81
Robin Le Normand|İspanya|CB|2016|2026|La Liga|81
Unai Simon|İspanya|GK|2016|2026|La Liga|82
David Raya|İspanya|GK|2012|2026|Premier Lig|82
Kepa Arrizabalaga|İspanya|GK|2012|2026|La Liga;Premier Lig|78
Fabian Ruiz|İspanya|CM|2015|2026|Serie A;Ligue 1|84
Dani Olmo|İspanya|AM|2014|2026|Hırvatistan Ligi;Bundesliga;La Liga|84
Nico Williams|İspanya|LW|2020|2026|La Liga|85
Oscar Mingueza|İspanya|RB|2020|2026|La Liga|76
Bryan Zaragoza|İspanya|LW|2021|2026|La Liga;Bundesliga|75
Fermin Lopez|İspanya|AM|2022|2026|La Liga|80
Gavi|İspanya|CM|2021|2026|La Liga|84
Christian Vieri|İtalya|ST|1991|2009|Serie A;La Liga|89
Filippo Inzaghi|İtalya|ST|1991|2012|Serie A|86
Vincenzo Montella|İtalya|ST|1990|2009|Serie A|82
Antonio Di Natale|İtalya|ST|1996|2016|Serie A|84
Fabio Quagliarella|İtalya|ST|2000|2023|Serie A|80
Sebastian Giovinco|İtalya|AM|2006|2022|Serie A;MLS|79
Stephan El Shaarawy|İtalya|LW|2008|2026|Serie A|78
Domenico Berardi|İtalya|RW|2012|2026|Serie A|81
Federico Bernardeschi|İtalya|RW|2012|2026|Serie A;MLS|77
Matteo Politano|İtalya|RW|2012|2026|Serie A|79
Giacomo Raspadori|İtalya|ST|2018|2026|Serie A;La Liga|78
Mateo Retegui|İtalya|ST|2018|2026|Arjantin Ligi;Serie A;Suudi Ligi|80
Moise Kean|İtalya|ST|2016|2026|Serie A;Ligue 1|80
Riccardo Calafiori|İtalya|CB|2018|2026|Serie A;Premier Lig|80
Alessandro Bastoni|İtalya|CB|2016|2026|Serie A|87
Federico Dimarco|İtalya|LB|2014|2026|Serie A|84
Davide Frattesi|İtalya|CM|2017|2026|Serie A|79
Sandro Tonali|İtalya|CM|2017|2026|Serie A;Premier Lig|84
Nicolo Barella|İtalya|CM|2015|2026|Serie A|87
Bryan Cristante|İtalya|DM|2011|2026|Serie A|77
Manuel Locatelli|İtalya|DM|2016|2026|Serie A|79
Gianluca Mancini|İtalya|CB|2015|2026|Serie A|78
Alex Meret|İtalya|GK|2015|2026|Serie A|80
Guglielmo Vicario|İtalya|GK|2014|2026|Serie A;Premier Lig|80
Michele Di Gregorio|İtalya|GK|2016|2026|Serie A|79
Oliver Bierhoff|Almanya|ST|1986|2003|Bundesliga;Serie A|84
Mario Basler|Almanya|RW|1987|2004|Bundesliga|79
Mehmet Scholl|Almanya|AM|1989|2007|Bundesliga|83
Carsten Ramelow|Almanya|DM|1992|2008|Bundesliga|77
Bernd Schneider|Almanya|RW|1991|2009|Bundesliga|80
Torsten Frings|Almanya|DM|1994|2013|Bundesliga|80
Arne Friedrich|Almanya|CB|1997|2013|Bundesliga|78
Kevin Kuranyi|Almanya|ST|1999|2016|Bundesliga;Rusya Ligi|78
Thomas Hitzlsperger|Almanya|CM|1998|2013|Bundesliga;Premier Lig|77
Piotr Trochowski|Almanya|AM|2001|2015|Bundesliga;La Liga|76
Sidney Sam|Almanya|RW|2005|2018|Bundesliga|72
Julian Draxler|Almanya|AM|2010|2026|Bundesliga;Ligue 1;Katar Ligi|79
Kevin Volland|Almanya|ST|2010|2026|Bundesliga|77
Jonathan Tah|Almanya|CB|2013|2026|Bundesliga|84
Robin Gosens|Almanya|LB|2013|2026|Serie A;Bundesliga|78
David Raum|Almanya|LB|2017|2026|Bundesliga|79
Maximilian Mittelstadt|Almanya|LB|2016|2026|Bundesliga|77
Waldemar Anton|Almanya|CB|2014|2026|Bundesliga|77
Nico Schlotterbeck|Almanya|CB|2018|2026|Bundesliga|82
Robert Andrich|Almanya|DM|2012|2026|Bundesliga|78
Pascal Gross|Almanya|CM|2009|2026|Bundesliga;Premier Lig|78
Deniz Undav|Almanya|ST|2015|2026|Bundesliga|79
Maximilian Beier|Almanya|ST|2020|2026|Bundesliga|77
Tim Kleindienst|Almanya|ST|2014|2026|Bundesliga|76
Angelo Stiller|Almanya|DM|2019|2026|Bundesliga|79
Aleksandar Pavlovic|Almanya|DM|2023|2026|Bundesliga|80
Oliver Baumann|Almanya|GK|2007|2026|Bundesliga|77
Frederik Ronnow|Danimarka|GK|2010|2026|Bundesliga|76
Kasper Schmeichel|Danimarka|GK|2005|2026|Premier Lig;Ligue 1;İskoçya Ligi|82
Simon Kjaer|Danimarka|CB|2007|2024|Serie A;Süper Lig|80
Andreas Christensen|Danimarka|CB|2012|2026|Premier Lig;La Liga|81
Joakim Maehle|Danimarka|LB|2016|2026|Serie A;Bundesliga|77
Pierre-Emile Hojbjerg|Danimarka|DM|2012|2026|Premier Lig;Ligue 1|81
Christian Norgaard|Danimarka|DM|2012|2026|Premier Lig|77
Thomas Delaney|Danimarka|CM|2009|2025|Bundesliga;La Liga|76
Mikkel Damsgaard|Danimarka|AM|2018|2026|Serie A;Premier Lig|78
Andreas Skov Olsen|Danimarka|RW|2017|2026|Serie A;Belçika Ligi|76
Jonas Wind|Danimarka|ST|2018|2026|Bundesliga|76
Rasmus Hojlund|Danimarka|ST|2020|2026|Serie A;Premier Lig|80
Yussuf Poulsen|Danimarka|ST|2013|2026|Bundesliga|76
Martin Braithwaite|Danimarka|ST|2009|2026|La Liga|74
Victor Lindelof|İsveç|CB|2013|2026|Portekiz Ligi;Premier Lig|77
Emil Forsberg|İsveç|AM|2009|2026|Bundesliga;MLS|79
Dejan Kulusevski|İsveç|RW|2019|2026|Serie A;Premier Lig|83
Alexander Isak|İsveç|ST|2016|2026|La Liga;Premier Lig|89
Viktor Gyokeres|İsveç|ST|2018|2026|Portekiz Ligi;Premier Lig|86
Lucas Bergvall|İsveç|CM|2022|2026|Premier Lig|77
Anthony Elanga|İsveç|RW|2020|2026|Premier Lig|78
Robin Olsen|İsveç|GK|2011|2026|Serie A;Premier Lig|74
Martin Odegaard|Norveç|AM|2014|2026|La Liga;Premier Lig|88
Sander Berge|Norveç|CM|2015|2026|Premier Lig|76
Fredrik Aursnes|Norveç|CM|2014|2026|Hollanda Ligi;Portekiz Ligi|77
Alexander Sorloth|Norveç|ST|2015|2026|La Liga;Bundesliga|81
Antonio Nusa|Norveç|LW|2021|2026|Belçika Ligi;Bundesliga|78
Oscar Bobb|Norveç|RW|2022|2026|Premier Lig|77
Kristoffer Ajer|Norveç|CB|2015|2026|İskoçya Ligi;Premier Lig|75
Orjan Nyland|Norveç|GK|2010|2026|Bundesliga;La Liga|72
David Hancko|Slovakya|CB|2016|2026|Hollanda Ligi;La Liga|80
Stanislav Lobotka|Slovakya|DM|2013|2026|Serie A|83
Ondrej Duda|Slovakya|AM|2012|2026|Bundesliga|74
Lukas Haraslin|Slovakya|LW|2014|2026|Serie A;Çek Ligi|74
Tomas Soucek|Çekya|CM|2014|2026|Çek Ligi;Premier Lig|79
Vladimir Coufal|Çekya|RB|2010|2026|Çek Ligi;Premier Lig|76
Patrik Schick|Çekya|ST|2014|2026|Serie A;Bundesliga|82
Adam Hlozek|Çekya|ST|2018|2026|Çek Ligi;Bundesliga|76
Antonin Barak|Çekya|AM|2014|2026|Serie A|75
Jiri Pavlenka|Çekya|GK|2012|2026|Bundesliga|74
Dominik Szoboszlai|Macaristan|AM|2017|2026|Avusturya Ligi;Bundesliga;Premier Lig|85
Milos Kerkez|Macaristan|LB|2020|2026|Hollanda Ligi;Premier Lig|80
Peter Gulacsi|Macaristan|GK|2008|2026|Bundesliga|79
Willi Orban|Macaristan|CB|2012|2026|Bundesliga|79
Roland Sallai|Macaristan|RW|2015|2026|Bundesliga;Süper Lig|77
Andras Schafer|Macaristan|CM|2018|2026|Bundesliga|74
Barnabas Varga|Macaristan|ST|2015|2026|Macaristan Ligi|73
Nicolae Stanciu|Romanya|AM|2011|2026|Romanya Ligi;Çek Ligi;Suudi Ligi|76
Radu Dragusin|Romanya|CB|2019|2026|Serie A;Premier Lig|77
Florin Nita|Romanya|GK|2007|2026|Romanya Ligi;Çek Ligi|73
Dennis Man|Romanya|RW|2016|2026|Romanya Ligi;Serie A|75
Valentin Mihaila|Romanya|LW|2018|2026|Serie A|74
Kiril Despodov|Bulgaristan|RW|2015|2026|Bulgaristan Ligi;Yunanistan Ligi|74
Luka Jovic|Sırbistan|ST|2014|2026|Bundesliga;La Liga;Serie A|77
Dusan Vlahovic|Sırbistan|ST|2016|2026|Serie A|84
Dusan Tadic|Sırbistan|AM|2008|2026|Hollanda Ligi;Premier Lig;Süper Lig|82
Sergej Milinkovic-Savic|Sırbistan|CM|2014|2026|Serie A;Suudi Ligi|84
Nemanja Gudelj|Sırbistan|DM|2010|2026|Hollanda Ligi;La Liga|75
Filip Kostic|Sırbistan|LW|2012|2026|Bundesliga;Serie A|79
Andrija Zivkovic|Sırbistan|RW|2013|2026|Portekiz Ligi;Yunanistan Ligi|75
Strahinja Pavlovic|Sırbistan|CB|2018|2026|Avusturya Ligi;Serie A|79
Nikola Milenkovic|Sırbistan|CB|2016|2026|Serie A;Premier Lig|80
Vanja Milinkovic-Savic|Sırbistan|GK|2014|2026|Serie A|78
Predrag Rajkovic|Sırbistan|GK|2013|2026|Ligue 1;Suudi Ligi|76
Edin Visca|Bosna-Hersek|RW|2010|2026|Süper Lig|77
Miralem Pjanic|Bosna-Hersek|CM|2007|2025|Ligue 1;Serie A;La Liga|84
Asmir Begovic|Bosna-Hersek|GK|2003|2025|Premier Lig|77
Ermedin Demirovic|Bosna-Hersek|ST|2017|2026|Bundesliga|77
Benjamin Sesko Yedek|Slovenya|ST|2019|2026|Bundesliga;Premier Lig|83
Andraz Sporar|Slovenya|ST|2012|2026|Portekiz Ligi;Süper Lig|73
Petar Stojanovic|Slovenya|RB|2013|2026|Hırvatistan Ligi;Serie A|72
Vid Belec|Slovenya|GK|2008|2026|Serie A|70
Luka Sucic|Hırvatistan|CM|2020|2026|Avusturya Ligi;La Liga|77
Martin Baturina|Hırvatistan|AM|2020|2026|Hırvatistan Ligi;Serie A|78
Petar Musa|Hırvatistan|ST|2016|2026|Çek Ligi;Portekiz Ligi;MLS|74
Borna Sosa|Hırvatistan|LB|2016|2026|Bundesliga|75
Josip Stanisic|Hırvatistan|RB|2020|2026|Bundesliga|78
Dominik Livakovic|Hırvatistan|GK|2012|2026|Hırvatistan Ligi;Süper Lig|81
Lovro Majer|Hırvatistan|AM|2016|2026|Ligue 1;Bundesliga|77
Mario Pasalic|Hırvatistan|CM|2013|2026|Serie A|79
Ante Budimir|Hırvatistan|ST|2013|2026|La Liga|76
Georges Mikautadze|Gürcistan|ST|2019|2026|Ligue 1|78
Giorgi Mamardashvili|Gürcistan|GK|2019|2026|La Liga;Premier Lig|83
Otar Kiteishvili|Gürcistan|AM|2015|2026|Avusturya Ligi|73
Zuriko Davitashvili|Gürcistan|LW|2018|2026|Ligue 1|74
Oleksandr Zinchenko|Ukrayna|LB|2015|2026|Premier Lig|78
Mykhailo Mudryk|Ukrayna|LW|2018|2026|Ukrayna Ligi;Premier Lig|76
Viktor Tsygankov|Ukrayna|RW|2015|2026|Ukrayna Ligi;La Liga|78
Artem Dovbyk|Ukrayna|ST|2016|2026|Ukrayna Ligi;La Liga;Serie A|79
Illia Zabarnyi|Ukrayna|CB|2019|2026|Premier Lig;Ligue 1|79
Anatoliy Trubin|Ukrayna|GK|2019|2026|Ukrayna Ligi;Portekiz Ligi|80
Ruslan Malinovskyi|Ukrayna|CM|2013|2026|Serie A;Ligue 1|76
Taras Stepanenko|Ukrayna|DM|2008|2026|Ukrayna Ligi|73
Eljif Elmas|Kuzey Makedonya|AM|2015|2026|Serie A;Bundesliga|76
Enis Bardhi|Kuzey Makedonya|AM|2014|2026|La Liga;Süper Lig|74
Ezgjan Alioski|Kuzey Makedonya|LB|2012|2026|Premier Lig|72
Goran Pandev|Kuzey Makedonya|ST|2001|2022|Serie A|80
Xherdan Shaqiri|İsviçre|RW|2009|2026|Bundesliga;Premier Lig;MLS|80
Granit Xhaka|İsviçre|DM|2011|2026|Bundesliga;Premier Lig|84
Manuel Akanji|İsviçre|CB|2015|2026|Bundesliga;Premier Lig;Serie A|83
Nico Elvedi|İsviçre|CB|2014|2026|Bundesliga|76
Ricardo Rodriguez|İsviçre|LB|2010|2026|Bundesliga;Serie A|76
Remo Freuler|İsviçre|CM|2011|2026|Serie A|77
Breel Embolo|İsviçre|ST|2014|2026|Bundesliga;Ligue 1|76
Dan Ndoye|İsviçre|RW|2019|2026|Serie A;Premier Lig|78
Yann Sommer|İsviçre|GK|2007|2026|Bundesliga;Serie A|84
Gregor Kobel|İsviçre|GK|2016|2026|Bundesliga|85
Marco Asensio|İspanya|RW|2013|2026|La Liga;Ligue 1|79
Pierre-Emerick Aubameyang|Gabon|ST|2008|2026|Bundesliga;Premier Lig;Ligue 1|84
Mario Lemina|Gabon|DM|2012|2026|Serie A;Premier Lig;Süper Lig|76
Denis Bouanga|Gabon|LW|2014|2026|Ligue 1;MLS|76
Sadio Mane Yedek|Senegal|LW|2011|2026|Premier Lig;Bundesliga;Suudi Ligi|88
Kalidou Koulibaly|Senegal|CB|2010|2026|Serie A;Premier Lig;Suudi Ligi|84
Edouard Mendy|Senegal|GK|2011|2026|Ligue 1;Premier Lig;Suudi Ligi|80
Nicolas Jackson|Senegal|ST|2019|2026|La Liga;Premier Lig;Bundesliga|79
Ismaila Sarr|Senegal|RW|2015|2026|Ligue 1;Premier Lig|77
Pape Matar Sarr|Senegal|CM|2020|2026|Premier Lig|77
Boulaye Dia|Senegal|ST|2018|2026|Ligue 1;Serie A|76
Habib Diarra|Senegal|CM|2021|2026|Ligue 1;Premier Lig|76
Achraf Hakimi|Fas|RB|2016|2026|La Liga;Bundesliga;Serie A;Ligue 1|89
Noussair Mazraoui|Fas|RB|2018|2026|Hollanda Ligi;Bundesliga;Premier Lig|79
Nayef Aguerd|Fas|CB|2018|2026|Ligue 1;Premier Lig;La Liga|78
Azzedine Ounahi|Fas|CM|2020|2026|Ligue 1;Yunanistan Ligi|75
Bilal El Khannouss|Fas|AM|2021|2026|Belçika Ligi;Premier Lig|77
Brahim Diaz|Fas|AM|2016|2026|La Liga;Serie A|82
Eliesse Ben Seghir|Fas|AM|2022|2026|Ligue 1;Bundesliga|77
Yassine Bounou|Fas|GK|2012|2026|La Liga;Suudi Ligi|83
Amir Rrahmani|Kosova|CB|2014|2026|Serie A|79
Milot Rashica|Kosova|LW|2014|2026|Bundesliga;Yunanistan Ligi|74
Vedat Muriqi|Kosova|ST|2014|2026|Süper Lig;La Liga|78
Arber Zeneli|Kosova|LW|2013|2026|Ligue 1|71
Elseid Hysaj|Arnavutluk|RB|2012|2026|Serie A|75
Berat Djimsiti|Arnavutluk|CB|2012|2026|Serie A|77
Kristjan Asllani|Arnavutluk|DM|2020|2026|Serie A|75
Armando Broja|Arnavutluk|ST|2019|2026|Premier Lig|73
Nedim Bajrami|Arnavutluk|AM|2017|2026|Serie A|73
Thomas Partey|Gana|DM|2013|2026|La Liga;Premier Lig|80
Mohammed Kudus|Gana|AM|2018|2026|Hollanda Ligi;Premier Lig|81
Antoine Semenyo|Gana|ST|2017|2026|Premier Lig|80
Iñaki Williams|Gana|RW|2014|2026|La Liga|80
Alidu Seidu|Gana|RB|2020|2026|Ligue 1|74
Serhou Guirassy|Gine|ST|2015|2026|Ligue 1;Bundesliga|84
Naby Keita|Gine|CM|2013|2026|Bundesliga;Premier Lig|77
Amadou Diawara|Gine|DM|2015|2025|Serie A|73
Wilfred Ndidi|Nijerya|DM|2015|2026|Belçika Ligi;Premier Lig|78
Alex Iwobi|Nijerya|AM|2015|2026|Premier Lig|77
Samuel Chukwueze|Nijerya|RW|2018|2026|La Liga;Serie A|76
Ademola Lookman|Nijerya|LW|2016|2026|Premier Lig;Serie A|84
Calvin Bassey|Nijerya|CB|2020|2026|İskoçya Ligi;Premier Lig|76
Frank Onyeka|Nijerya|CM|2018|2026|Premier Lig|73
Taiwo Awoniyi|Nijerya|ST|2015|2026|Premier Lig|74
Moses Simon|Nijerya|LW|2014|2026|Ligue 1|75
Zaidu Sanusi|Nijerya|LB|2017|2026|Portekiz Ligi|73
Andre Onana|Kamerun|GK|2015|2026|Hollanda Ligi;Serie A;Premier Lig|80
Carlos Baleba|Kamerun|DM|2021|2026|Ligue 1;Premier Lig|80
Bryan Mbeumo|Kamerun|RW|2017|2026|Premier Lig|82
Frank Zambo Anguissa|Kamerun|CM|2015|2026|Ligue 1;Serie A|80
Karl Toko Ekambi|Kamerun|LW|2014|2026|Ligue 1;Suudi Ligi|74
Vincent Aboubakar|Kamerun|ST|2010|2026|Ligue 1;Portekiz Ligi;Süper Lig|78
Ibrahim Sangare|Fildişi Sahili|DM|2016|2026|Ligue 1;Hollanda Ligi;Premier Lig|76
Franck Kessie|Fildişi Sahili|CM|2015|2026|Serie A;La Liga;Suudi Ligi|80
Sebastien Haller|Fildişi Sahili|ST|2015|2026|Hollanda Ligi;Bundesliga|76
Simon Adingra|Fildişi Sahili|LW|2021|2026|Premier Lig|76
Evan Ndicka|Fildişi Sahili|CB|2017|2026|Bundesliga;Serie A|79
Odilon Kossounou|Fildişi Sahili|CB|2019|2026|Bundesliga|76
Amad Diallo|Fildişi Sahili|RW|2019|2026|Serie A;Premier Lig|79
Yves Bissouma|Mali|DM|2016|2026|Ligue 1;Premier Lig|77
Amadou Haidara|Mali|CM|2017|2026|Bundesliga|75
El Bilal Toure|Mali|ST|2020|2026|La Liga;Serie A|74
Lassine Sinayoko|Mali|ST|2020|2026|Ligue 1|72
Mohamed Salah Yedek|Mısır|RW|2012|2026|Serie A;Premier Lig|93
Omar Marmoush|Mısır|ST|2017|2026|Bundesliga;Premier Lig|83
Mostafa Mohamed|Mısır|ST|2017|2026|Süper Lig;Ligue 1|75
Trezeguet|Mısır|RW|2015|2026|Süper Lig;Premier Lig|75
Mohamed Elneny|Mısır|CM|2010|2026|Premier Lig|74
Ramy Rabia|Mısır|CB|2012|2025|Mısır Ligi|71
Hakim Ziyech Yedek|Fas|AM|2012|2026|Hollanda Ligi;Premier Lig|83
Riyad Benayad|Cezayir|ST|2017|2026|Cezayir Ligi|68
Amine Gouiri|Cezayir|ST|2017|2026|Ligue 1|79
Houssem Aouar|Cezayir|CM|2016|2026|Ligue 1;Serie A;Suudi Ligi|76
Rayan Ait-Nouri|Cezayir|LB|2018|2026|Premier Lig|80
Mohamed Amoura|Cezayir|ST|2019|2026|Belçika Ligi;Bundesliga|77
Baghdad Bounedjah|Cezayir|ST|2010|2026|Katar Ligi|75
Youcef Belaili|Cezayir|LW|2010|2026|Cezayir Ligi;Ligue 1|74
Ismael Bennacer|Cezayir|DM|2015|2026|Serie A|78
Ramy Bensebaini|Cezayir|LB|2016|2026|Bundesliga|77
Denis Zakaria|İsviçre|DM|2015|2026|Bundesliga;Ligue 1|79
Keita Balde|Senegal|LW|2013|2025|Serie A;Ligue 1|74
Almoez Ali|Katar|ST|2015|2026|Katar Ligi|75
Akram Afif|Katar|LW|2014|2026|Katar Ligi|78
Salem Al-Dawsari Yedek|Suudi Arabistan|LW|2011|2026|Suudi Ligi|78
Firas Al-Buraikan|Suudi Arabistan|ST|2018|2026|Suudi Ligi|74
Mohammed Al-Owais|Suudi Arabistan|GK|2011|2026|Suudi Ligi|75
Saud Abdulhamid|Suudi Arabistan|RB|2018|2026|Suudi Ligi;Serie A|73
Mehdi Ghayedi|İran|AM|2017|2026|İran Ligi;BAE Ligi|73
Saman Ghoddos|İran|AM|2013|2026|Premier Lig|72
Alireza Jahanbakhsh|İran|RW|2013|2026|Hollanda Ligi;Premier Lig|75
Alireza Beiranvand|İran|GK|2014|2026|İran Ligi|75
Ramin Rezaeian|İran|RB|2012|2026|İran Ligi|72
Wataru Endo|Japonya|DM|2013|2026|Bundesliga;Premier Lig|79
Takumi Minamino|Japonya|AM|2012|2026|Avusturya Ligi;Premier Lig;Ligue 1|78
Takehiro Tomiyasu|Japonya|RB|2015|2026|Serie A;Premier Lig|77
Kaoru Mitoma|Japonya|LW|2020|2026|Premier Lig|82
Ritsu Doan|Japonya|RW|2017|2026|Hollanda Ligi;Bundesliga|79
Junya Ito|Japonya|RW|2015|2026|Belçika Ligi;Ligue 1|77
Hiroki Ito|Japonya|CB|2019|2026|Bundesliga|77
Ko Itakura|Japonya|CB|2017|2026|Bundesliga|77
Takefusa Kubo|Japonya|RW|2017|2026|La Liga|82
Ayase Ueda|Japonya|ST|2019|2026|Hollanda Ligi|76
Daichi Kamada|Japonya|AM|2015|2026|Bundesliga;Premier Lig|78
Zion Suzuki|Japonya|GK|2021|2026|Serie A|77
Heung-min Son Yedek|Güney Kore|LW|2010|2026|Bundesliga;Premier Lig;MLS|88
Kim Min-jae|Güney Kore|CB|2017|2026|Süper Lig;Serie A;Bundesliga|84
Lee Kang-in|Güney Kore|AM|2018|2026|La Liga;Ligue 1|80
Hwang Hee-chan|Güney Kore|ST|2015|2026|Avusturya Ligi;Premier Lig|77
Hwang In-beom|Güney Kore|CM|2015|2026|Rusya Ligi;Hollanda Ligi|75
Kim Young-gwon|Güney Kore|CB|2010|2026|Güney Kore Ligi|73
Cho Gue-sung|Güney Kore|ST|2019|2026|Danimarka Ligi|73
Mathew Leckie|Avustralya|RW|2010|2026|Bundesliga;Avustralya Ligi|72
Jackson Irvine|Avustralya|CM|2012|2026|Bundesliga|73
Harry Souttar|Avustralya|CB|2016|2026|Premier Lig|74
Awer Mabil|Avustralya|RW|2013|2026|Danimarka Ligi|71
Christian Pulisic|ABD|LW|2015|2026|Bundesliga;Premier Lig;Serie A|85
Weston McKennie|ABD|CM|2016|2026|Bundesliga;Serie A|79
Tyler Adams|ABD|DM|2015|2026|Bundesliga;Premier Lig|78
Yunus Musah|ABD|CM|2019|2026|La Liga;Serie A|76
Sergino Dest|ABD|RB|2018|2026|Hollanda Ligi;La Liga|77
Antonee Robinson|ABD|LB|2017|2026|Premier Lig|81
Chris Richards|ABD|CB|2019|2026|Bundesliga;Premier Lig|77
Folarin Balogun|ABD|ST|2020|2026|Premier Lig;Ligue 1|76
Ricardo Pepi|ABD|ST|2019|2026|Bundesliga;Hollanda Ligi|76
Matt Turner|ABD|GK|2016|2026|MLS;Premier Lig|75
Gio Reyna|ABD|AM|2019|2026|Bundesliga|75
Alphonso Davies|Kanada|LB|2016|2026|MLS;Bundesliga|85
Jonathan David|Kanada|ST|2018|2026|Belçika Ligi;Ligue 1;Serie A|84
Cyle Larin|Kanada|ST|2014|2026|Süper Lig;La Liga|75
Tajon Buchanan|Kanada|RW|2019|2026|Belçika Ligi;Serie A;La Liga|75
Stephen Eustaquio|Kanada|DM|2017|2026|Portekiz Ligi|76
Moise Bombito|Kanada|CB|2022|2026|Ligue 1|74
Ismael Kone|Kanada|CM|2021|2026|Ligue 1;Serie A|74
Hirving Lozano Yedek|Meksika|LW|2014|2026|Hollanda Ligi;Serie A;MLS|80
Edson Alvarez|Meksika|DM|2016|2026|Hollanda Ligi;Premier Lig|79
Johan Vasquez|Meksika|CB|2019|2026|Serie A|76
Santiago Gimenez|Meksika|ST|2017|2026|Hollanda Ligi;Serie A|80
Luis Chavez|Meksika|CM|2017|2026|Meksika Ligi;Rusya Ligi|74
Cesar Montes|Meksika|CB|2015|2026|Meksika Ligi;La Liga|75
Julian Alvarez Yedek|Arjantin|ST|2018|2026|Arjantin Ligi;Premier Lig;La Liga|89
Alexis Mac Allister|Arjantin|CM|2016|2026|Arjantin Ligi;Premier Lig|86
Enzo Fernandez|Arjantin|CM|2019|2026|Arjantin Ligi;Portekiz Ligi;Premier Lig|86
Cristian Romero|Arjantin|CB|2016|2026|Serie A;Premier Lig|85
Lisandro Martinez|Arjantin|CB|2017|2026|Hollanda Ligi;Premier Lig|82
Nahuel Molina|Arjantin|RB|2016|2026|Serie A;La Liga|79
Marcos Acuna|Arjantin|LB|2014|2026|Portekiz Ligi;La Liga|78
Leandro Paredes|Arjantin|DM|2010|2026|Serie A;Ligue 1|79
Exequiel Palacios|Arjantin|CM|2015|2026|Bundesliga|81
Rodrigo De Paul|Arjantin|CM|2013|2026|Serie A;La Liga;MLS|83
Giovani Lo Celso|Arjantin|AM|2015|2026|Ligue 1;Premier Lig;La Liga|79
Nicolas Gonzalez|Arjantin|LW|2016|2026|Serie A;Premier Lig|78
Valentin Carboni|Arjantin|AM|2021|2026|Serie A|75
Nico Paz|Arjantin|AM|2022|2026|La Liga;Serie A|81
Claudio Echeverri|Arjantin|AM|2022|2026|Arjantin Ligi;Bundesliga|77
Franco Mastantuono|Arjantin|RW|2023|2026|Arjantin Ligi;La Liga|79
Emiliano Martinez|Arjantin|GK|2012|2026|Premier Lig|86
Geronimo Rulli|Arjantin|GK|2013|2026|La Liga;Hollanda Ligi;Ligue 1|78
Walter Benitez|Arjantin|GK|2013|2026|Ligue 1;Hollanda Ligi|77
Federico Valverde|Uruguay|CM|2016|2026|La Liga|89
Ronald Araujo|Uruguay|CB|2018|2026|La Liga|82
Jose Maria Gimenez|Uruguay|CB|2013|2026|La Liga|82
Mathias Olivera|Uruguay|LB|2017|2026|La Liga;Serie A|77
Nahitan Nandez|Uruguay|RB|2015|2026|Serie A;Suudi Ligi|76
Manuel Ugarte|Uruguay|DM|2020|2026|Portekiz Ligi;Ligue 1;Premier Lig|80
Rodrigo Bentancur|Uruguay|CM|2015|2026|Serie A;Premier Lig|80
Giorgian De Arrascaeta|Uruguay|AM|2014|2026|Brezilya Ligi|80
Darwin Nunez|Uruguay|ST|2017|2026|Portekiz Ligi;Premier Lig;Suudi Ligi|81
Maximiliano Araujo|Uruguay|LW|2020|2026|Meksika Ligi;Portekiz Ligi|75
Facundo Pellistri|Uruguay|RW|2019|2026|Premier Lig;Yunanistan Ligi|73
Sergio Rochet|Uruguay|GK|2014|2026|Uruguay Ligi;Brezilya Ligi|75
Vinicius Junior Yedek|Brezilya|LW|2017|2026|Brezilya Ligi;La Liga|92
Rodrygo|Brezilya|RW|2017|2026|Brezilya Ligi;La Liga|85
Raphinha|Brezilya|RW|2016|2026|Ligue 1;Premier Lig;La Liga|88
Gabriel Martinelli|Brezilya|LW|2018|2026|Premier Lig|80
Gabriel Jesus|Brezilya|ST|2015|2026|Brezilya Ligi;Premier Lig|79
Matheus Cunha|Brezilya|ST|2017|2026|Bundesliga;La Liga;Premier Lig|82
Joao Pedro|Brezilya|ST|2019|2026|Premier Lig|80
Igor Jesus|Brezilya|ST|2019|2026|Brezilya Ligi;Premier Lig|76
Estevao|Brezilya|RW|2023|2026|Brezilya Ligi;Premier Lig|82
Endrick|Brezilya|ST|2022|2026|Brezilya Ligi;La Liga|78
Savinho|Brezilya|RW|2020|2026|Ligue 1;Premier Lig|79
Bruno Guimaraes|Brezilya|CM|2017|2026|Ligue 1;Premier Lig|86
Andre|Brezilya|DM|2019|2026|Brezilya Ligi;Premier Lig|77
Joelinton|Brezilya|CM|2015|2026|Bundesliga;Premier Lig|79
Lucas Paqueta|Brezilya|AM|2016|2026|Serie A;Ligue 1;Premier Lig|81
Gerson|Brezilya|CM|2015|2026|Brezilya Ligi;Ligue 1|77
Douglas Luiz|Brezilya|CM|2017|2026|Premier Lig;Serie A|78
Casemiro Yedek|Brezilya|DM|2010|2026|La Liga;Premier Lig|86
Marquinhos Yedek|Brezilya|CB|2012|2026|Serie A;Ligue 1|87
Gabriel Magalhaes|Brezilya|CB|2017|2026|Ligue 1;Premier Lig|85
Murillo|Brezilya|CB|2021|2026|Brezilya Ligi;Premier Lig|79
Beraldo|Brezilya|CB|2021|2026|Brezilya Ligi;Ligue 1|76
Wesley|Brezilya|RB|2020|2026|Brezilya Ligi;Serie A|76
Vanderson|Brezilya|RB|2019|2026|Brezilya Ligi;Ligue 1|77
Caio Henrique|Brezilya|LB|2018|2026|Ligue 1|77
Guilherme Arana|Brezilya|LB|2015|2026|Brezilya Ligi;La Liga|76
Alisson Yedek|Brezilya|GK|2013|2026|Brezilya Ligi;Serie A;Premier Lig|90
Ederson Yedek|Brezilya|GK|2012|2026|Portekiz Ligi;Premier Lig;Suudi Ligi|87
Bento|Brezilya|GK|2019|2026|Brezilya Ligi;Suudi Ligi|76
Hugo Souza|Brezilya|GK|2019|2026|Brezilya Ligi|75
Luis Diaz|Kolombiya|LW|2016|2026|Kolombiya Ligi;Portekiz Ligi;Premier Lig;Bundesliga|87
Jhon Duran|Kolombiya|ST|2021|2026|MLS;Premier Lig;Süper Lig|78
Jhon Cordoba|Kolombiya|ST|2013|2026|Bundesliga;Rusya Ligi|75
Richard Rios|Kolombiya|CM|2020|2026|Brezilya Ligi;Portekiz Ligi|78
Jefferson Lerma|Kolombiya|DM|2013|2026|La Liga;Premier Lig|77
Daniel Munoz|Kolombiya|RB|2017|2026|Belçika Ligi;Premier Lig|79
Johan Mojica|Kolombiya|LB|2013|2026|La Liga|74
Davinson Sanchez|Kolombiya|CB|2016|2026|Hollanda Ligi;Premier Lig;Süper Lig|79
Yerry Mina|Kolombiya|CB|2013|2026|Kolombiya Ligi;Premier Lig;Serie A|76
Camilo Vargas|Kolombiya|GK|2010|2026|Kolombiya Ligi;Meksika Ligi|76
James Rodriguez Yedek|Kolombiya|AM|2010|2026|Portekiz Ligi;La Liga;Bundesliga|85
Alexis Sanchez Yedek|Şili|RW|2005|2026|Şili Ligi;La Liga;Premier Lig;Serie A|85
Ben Brereton Diaz|Şili|ST|2017|2026|Premier Lig;La Liga|74
Guillermo Maripan|Şili|CB|2015|2026|Ligue 1;Serie A|75
Dario Osorio|Şili|RW|2021|2026|Şili Ligi;Danimarka Ligi|74
Moises Caicedo|Ekvador|DM|2019|2026|Premier Lig|87
Piero Hincapie|Ekvador|CB|2019|2026|Bundesliga;Premier Lig|81
Pervis Estupinan|Ekvador|LB|2016|2026|La Liga;Premier Lig;Serie A|78
Willian Pacho|Ekvador|CB|2019|2026|Bundesliga;Ligue 1|83
Kendry Paez|Ekvador|AM|2022|2026|Ekvador Ligi;Premier Lig|75
Gonzalo Plata|Ekvador|RW|2019|2026|Portekiz Ligi;Katar Ligi|74
Miguel Almiron|Paraguay|AM|2015|2026|MLS;Premier Lig|77
Julio Enciso|Paraguay|AM|2019|2026|Premier Lig|76
Omar Alderete|Paraguay|CB|2016|2026|Bundesliga;La Liga|75
Gustavo Gomez|Paraguay|CB|2013|2026|Brezilya Ligi|77
Antonio Sanabria|Paraguay|ST|2014|2026|Serie A;La Liga|74
Andres Cubas|Paraguay|DM|2016|2026|Ligue 1;MLS|73
Luis Advincula|Peru|RB|2010|2026|Peru Ligi;Arjantin Ligi|74
Renato Tapia|Peru|DM|2014|2026|Hollanda Ligi;La Liga|74
Gianluca Lapadula|Peru|ST|2011|2026|Serie A|73
Pedro Gallese|Peru|GK|2011|2026|Peru Ligi;MLS|74
Eduardo Camavinga|Fransa|CM|2019|2026|Ligue 1;La Liga|85
Aurelien Tchouameni|Fransa|DM|2018|2026|Ligue 1;La Liga|85
Youssouf Fofana|Fransa|CM|2017|2026|Ligue 1;Serie A|79
Manu Kone|Fransa|CM|2020|2026|Bundesliga;Serie A|80
Warren Zaire-Emery|Fransa|CM|2022|2026|Ligue 1|81
Desire Doue|Fransa|AM|2022|2026|Ligue 1|84
Bradley Barcola|Fransa|LW|2021|2026|Ligue 1|84
Rayan Cherki|Fransa|AM|2019|2026|Ligue 1;Premier Lig|81
Michael Olise|Fransa|RW|2019|2026|Premier Lig;Bundesliga|87
Christopher Nkunku|Fransa|ST|2015|2026|Ligue 1;Bundesliga;Premier Lig|81
Randal Kolo Muani|Fransa|ST|2018|2026|Ligue 1;Bundesliga;Serie A|79
Marcus Thuram|Fransa|ST|2015|2026|Bundesliga;Serie A|84
Hugo Ekitike|Fransa|ST|2020|2026|Ligue 1;Bundesliga;Premier Lig|82
Maghnes Akliouche|Fransa|AM|2021|2026|Ligue 1|79
Jules Kounde|Fransa|CB|2017|2026|Ligue 1;La Liga|85
William Saliba|Fransa|CB|2018|2026|Ligue 1;Premier Lig|86
Ibrahima Konate|Fransa|CB|2017|2026|Bundesliga;Premier Lig|84
Dayot Upamecano|Fransa|CB|2015|2026|Bundesliga|83
Benjamin Pavard|Fransa|RB|2015|2026|Bundesliga;Serie A|80
Theo Hernandez|Fransa|LB|2016|2026|La Liga;Serie A;Suudi Ligi|83
Lucas Hernandez|Fransa|LB|2014|2026|La Liga;Bundesliga;Ligue 1|80
Malo Gusto|Fransa|RB|2020|2026|Ligue 1;Premier Lig|77
Mike Maignan|Fransa|GK|2015|2026|Ligue 1;Serie A|87
Brice Samba|Fransa|GK|2013|2026|Ligue 1|77
Lucas Chevalier|Fransa|GK|2020|2026|Ligue 1|80
Khephren Thuram|Fransa|CM|2019|2026|Ligue 1;Serie A|78
Mattéo Guendouzi|Fransa|CM|2016|2026|Ligue 1;Serie A|76
Wesley Fofana|Fransa|CB|2019|2026|Ligue 1;Premier Lig|77
Boubacar Kamara|Fransa|DM|2016|2026|Ligue 1;Premier Lig|78
Adrien Truffert|Fransa|LB|2020|2026|Ligue 1;Premier Lig|75
Georginio Rutter|Fransa|AM|2020|2026|Premier Lig|76
Jean-Philippe Mateta|Fransa|ST|2016|2026|Premier Lig|79
Nicolas Jackson Yedek|Senegal|ST|2019|2026|La Liga;Premier Lig|78
Joao Neves|Portekiz|CM|2022|2026|Portekiz Ligi;Ligue 1|86
Vitinha|Portekiz|CM|2018|2026|Portekiz Ligi;Ligue 1|88
Nuno Mendes|Portekiz|LB|2020|2026|Portekiz Ligi;Ligue 1|86
Goncalo Ramos|Portekiz|ST|2020|2026|Portekiz Ligi;Ligue 1|80
Goncalo Inacio|Portekiz|CB|2019|2026|Portekiz Ligi|80
Antonio Silva|Portekiz|CB|2021|2026|Portekiz Ligi|79
Pedro Neto|Portekiz|LW|2017|2026|Premier Lig|79
Francisco Conceicao|Portekiz|RW|2020|2026|Portekiz Ligi;Serie A|79
Diogo Costa|Portekiz|GK|2019|2026|Portekiz Ligi|84
Jose Sa|Portekiz|GK|2013|2026|Portekiz Ligi;Premier Lig|77
Renato Veiga|Portekiz|CB|2021|2026|Premier Lig;Serie A|76
Matheus Nunes|Portekiz|CM|2019|2026|Portekiz Ligi;Premier Lig|78
Otavio|Portekiz|CM|2014|2026|Portekiz Ligi;Suudi Ligi|76
Ricardo Horta|Portekiz|LW|2013|2026|Portekiz Ligi|76
Xavi Simons|Hollanda|AM|2021|2026|Ligue 1;Bundesliga;Premier Lig|82
Tijjani Reijnders|Hollanda|CM|2018|2026|Hollanda Ligi;Serie A;Premier Lig|85
Ryan Gravenberch|Hollanda|CM|2018|2026|Hollanda Ligi;Bundesliga;Premier Lig|85
Jerdy Schouten|Hollanda|DM|2017|2026|Serie A;Hollanda Ligi|77
Micky van de Ven|Hollanda|CB|2020|2026|Bundesliga;Premier Lig|84
Jurrien Timber|Hollanda|CB|2019|2026|Hollanda Ligi;Premier Lig|82
Lutsharel Geertruida|Hollanda|RB|2018|2026|Hollanda Ligi;Bundesliga|76
Denzel Dumfries|Hollanda|RB|2015|2026|Hollanda Ligi;Serie A|82
Nathan Ake|Hollanda|CB|2013|2026|Premier Lig|80
Stefan de Vrij|Hollanda|CB|2009|2026|Hollanda Ligi;Serie A|78
Cody Gakpo|Hollanda|LW|2018|2026|Hollanda Ligi;Premier Lig|83
Noa Lang|Hollanda|LW|2018|2026|Belçika Ligi;Hollanda Ligi;Serie A|77
Donyell Malen|Hollanda|RW|2017|2026|Hollanda Ligi;Bundesliga;Premier Lig|77
Brian Brobbey|Hollanda|ST|2020|2026|Hollanda Ligi|75
Wout Weghorst|Hollanda|ST|2014|2026|Bundesliga;Hollanda Ligi|75
Justin Kluivert|Hollanda|LW|2016|2026|Serie A;Premier Lig|76
Bart Verbruggen|Hollanda|GK|2020|2026|Belçika Ligi;Premier Lig|79
Mark Flekken|Hollanda|GK|2013|2026|Bundesliga;Premier Lig|76
Jeremie Frimpong|Hollanda|RB|2019|2026|İskoçya Ligi;Bundesliga;Premier Lig|82
Quinten Timber|Hollanda|CM|2020|2026|Hollanda Ligi|76
Kenneth Taylor|Hollanda|CM|2020|2026|Hollanda Ligi|76
Jan Paul van Hecke|Hollanda|CB|2020|2026|Premier Lig|77
Amara Diouf|Senegal|ST|2023|2026|Senegal Ligi|70
Johan Bakayoko|Belçika|RW|2021|2026|Hollanda Ligi;Bundesliga|77
Jeremy Doku|Belçika|LW|2018|2026|Ligue 1;Premier Lig|83
Lois Openda|Belçika|ST|2018|2026|Ligue 1;Bundesliga;Serie A|80
Charles De Ketelaere|Belçika|AM|2019|2026|Belçika Ligi;Serie A|81
Amadou Onana|Belçika|DM|2020|2026|Premier Lig|79
Orel Mangala|Belçika|CM|2017|2026|Bundesliga;Premier Lig|75
Arthur Theate|Belçika|CB|2020|2026|Serie A;Ligue 1|76
Zeno Debast|Belçika|CB|2021|2026|Belçika Ligi;Portekiz Ligi|76
Wout Faes|Belçika|CB|2017|2026|Premier Lig|75
Koen Casteels|Belçika|GK|2011|2026|Bundesliga;Suudi Ligi|78
Senne Lammens|Belçika|GK|2021|2026|Belçika Ligi;Premier Lig|76
Malick Fofana|Belçika|LW|2022|2026|Belçika Ligi;Ligue 1|77
Nicolas Raskin|Belçika|CM|2020|2026|İskoçya Ligi|75
Scott McTominay|İskoçya|CM|2017|2026|Premier Lig;Serie A|83
John McGinn|İskoçya|CM|2012|2026|İskoçya Ligi;Premier Lig|79
Andy Robertson|İskoçya|LB|2013|2026|İskoçya Ligi;Premier Lig|83
Kieran Tierney|İskoçya|LB|2015|2026|İskoçya Ligi;Premier Lig;La Liga|76
Billy Gilmour|İskoçya|DM|2019|2026|Premier Lig;Serie A|76
Angus Gunn|İskoçya|GK|2016|2026|Premier Lig|72
Craig Gordon|İskoçya|GK|2002|2026|İskoçya Ligi|73
Che Adams|İskoçya|ST|2015|2026|Premier Lig;Serie A|75
Lyndon Dykes|İskoçya|ST|2016|2026|İskoçya Ligi;Premier Lig|72
Daniel James|Galler|RW|2017|2026|Premier Lig|75
Brennan Johnson|Galler|RW|2019|2026|Premier Lig|79
Harry Wilson|Galler|AM|2015|2026|Premier Lig|76
Ethan Ampadu|Galler|DM|2017|2026|Premier Lig;Serie A|75
Neco Williams|Galler|RB|2019|2026|Premier Lig|75
Joe Rodon|Galler|CB|2018|2026|Premier Lig|74
Danny Ward|Galler|GK|2015|2026|Premier Lig|71
Karol Swiderski|Polonya|ST|2016|2026|Yunanistan Ligi;MLS|73
Caoimhin Kelleher|İrlanda|GK|2019|2026|Premier Lig|78
Nathan Collins|İrlanda|CB|2019|2026|Premier Lig|76
Evan Ferguson|İrlanda|ST|2021|2026|Premier Lig|75
Chiedozie Ogbene|İrlanda|RW|2018|2026|Premier Lig|73
Sammie Szmodics|İrlanda|AM|2015|2026|Premier Lig|73
Erling Braut Haaland Yedek|Norveç|ST|2016|2026|Avusturya Ligi;Bundesliga;Premier Lig|94
Jorgen Strand Larsen|Norveç|ST|2018|2026|La Liga;Premier Lig|77
Felix Horn Myhre|Norveç|CM|2018|2026|Norveç Ligi|72
David Moller Wolfe|Norveç|LB|2020|2026|Norveç Ligi;Hollanda Ligi|74
Conor Bradley|Kuzey İrlanda|RB|2021|2026|Premier Lig|78
Isaac Price|Kuzey İrlanda|CM|2021|2026|Belçika Ligi|72
`;

const TR_MAP = { 'ç':'c','Ç':'c','ğ':'g','Ğ':'g','ı':'i','İ':'i','ö':'o','Ö':'o','ş':'s','Ş':'s','ü':'u','Ü':'u','á':'a','â':'a','ã':'a','ä':'a','é':'e','è':'e','ê':'e','í':'i','î':'i','ï':'i','ó':'o','ô':'o','õ':'o','ú':'u','û':'u','ñ':'n',"'":'','é':'e' };
const slugify = name => name.toLowerCase().split('').map(ch => TR_MAP[ch] ?? ch).join('')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// "Yedek"/"Efsane"/açıklama ekli satırlar mevcut kayıtlarla çakışma denemesidir;
// isim normalize edilirken bu ekler ayıklanır ve kopya girişler atlanır.
const STRIP_WORDS = /\s+(yedek|efsane|kayseri|donemi.*|es erkek.*|kardes deneme)$/i;
const normName = name => slugify(String(name).replace(STRIP_WORDS, ''));

const existingIds = new Set(data.players.map(p => p.id));
const existingNames = new Set(data.players.map(p => normName(p.name)));
const excluded = new Set(data.excluded);

const added = [];
for (const line of RAW.trim().split('\n')) {
  const parts = line.split('|');
  if (parts.length !== 7) continue;
  const [rawName, nationality, position, start, end, leagues, rating] = parts;
  const cleanName = rawName.replace(STRIP_WORDS, '').trim();
  const id = slugify(cleanName);
  if (!id || excluded.has(id) || existingIds.has(id) || existingNames.has(normName(cleanName))) continue;
  if (Number(rating) < 62) continue; // kalite eşiği
  existingIds.add(id);
  existingNames.add(normName(cleanName));
  added.push({
    id, name: cleanName, nationality: nationality.trim(), position: position.trim(),
    activeStart: Number(start), activeEnd: Number(end),
    leagues: leagues.split(';').map(item => item.trim()).filter(Boolean),
    rating: Number(rating), source: 'v7-curated'
  });
}

const all = [...data.players, ...added];
const body = all.map(p => JSON.stringify(p)).join(',');
const out = `(function(root,factory){const data=factory();if(typeof module==="object"&&module.exports)module.exports=data;if(root){root.KRONOMETRE_PLAYERS=Object.freeze(data.players);root.KRONOMETRE_EXCLUDED_PLAYER_IDS=Object.freeze(data.excluded);}})(typeof window!=="undefined"?window:globalThis,function(){"use strict";const EXCLUDED=${JSON.stringify(data.excluded)};const players=[${body}];return Object.freeze({players:Object.freeze(players),excluded:Object.freeze(EXCLUDED)});});`;
fs.writeFileSync(FILE, out);
console.log(`Eklenen: ${added.length} · Toplam: ${all.length}`);
