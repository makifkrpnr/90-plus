'use strict';
// v8 ek parti — v7 ile aynı kurallar (tekilleştirme + kalite eşiği).
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'js', 'players.js');
const data = require(FILE);

const RAW = `
Fatih Terim|Türkiye|CB|1969|1985|Süper Lig|80
Cuneyt Tanman|Türkiye|CM|1974|1992|Süper Lig|76
Muhammet Altintas|Türkiye|ST|1965|1980|Süper Lig|74
Ali Kemal Denizci|Türkiye|RW|1968|1984|Süper Lig|75
Fethi Heper|Türkiye|ST|1962|1976|Süper Lig|78
Fevzi Zemzem|Türkiye|ST|1957|1974|Süper Lig|77
Ogun Altiparmak|Türkiye|AM|1958|1974|Süper Lig|77
Sanli Sarialioglu|Türkiye|RW|1963|1979|Süper Lig|74
Yasin Ozdenak|Türkiye|GK|1966|1980|Süper Lig;MLS|73
Turgay Seren|Türkiye|GK|1947|1966|Süper Lig|82
Coskun Ozari|Türkiye|CM|1950|1963|Süper Lig|73
Suat Mamat|Türkiye|ST|1953|1967|Süper Lig|76
Naci Erdem|Türkiye|CM|1950|1966|Süper Lig|73
Sukru Gulesin|Türkiye|ST|1943|1957|Süper Lig;Serie A|79
Zeki Riza Sporel|Türkiye|ST|1915|1934|Süper Lig|84
Baris Ozbek|Türkiye|CM|2005|2018|Bundesliga;Süper Lig|73
Colin Kazim-Richards|Türkiye|ST|2004|2021|Premier Lig;Süper Lig|74
Mevlut Erdinc|Türkiye|ST|2005|2020|Ligue 1;Süper Lig|75
Olcay Sahan|Türkiye|LW|2005|2021|Bundesliga;Süper Lig|74
Gokdeniz Karadeniz|Türkiye|RW|1998|2018|Süper Lig;Rusya Ligi|79
Fatih Tekke|Türkiye|ST|1995|2012|Süper Lig;Rusya Ligi|78
Ersen Martin|Türkiye|ST|1998|2012|Süper Lig|73
Umit Karan|Türkiye|ST|1996|2012|Süper Lig|75
Hasan Sas|Türkiye|LW|1994|2009|Süper Lig|80
Ergun Berisha|Türkiye|ST|1993|2008|Süper Lig|71
Suat Kaya|Türkiye|CM|1988|2004|Süper Lig|75
Evren Turhan|Türkiye|LB|1992|2006|Süper Lig|70
Tayfun Korkut|Türkiye|CM|1992|2005|Süper Lig;La Liga|75
Abdullah Ercan|Türkiye|LB|1989|2006|Süper Lig|76
Tayfur Havutcu|Türkiye|CM|1990|2007|Süper Lig|77
Ilhan Mansiz|Türkiye|ST|1997|2007|Süper Lig;Japonya Ligi|79
Umit Ozat|Türkiye|CB|1994|2008|Süper Lig;Bundesliga|76
Fatih Akyel|Türkiye|RB|1995|2009|Süper Lig|75
Ali Eren Beserler|Türkiye|CM|1998|2011|Süper Lig|70
Serkan Balci|Türkiye|RB|2000|2015|Süper Lig|71
Gokhan Zan|Türkiye|CB|1999|2014|Süper Lig|75
Serdar Kesimal|Türkiye|CB|2007|2017|Süper Lig|72
Egemen Korkmaz|Türkiye|CB|2001|2016|Süper Lig|74
Sinan Gumus|Türkiye|LW|2012|2024|Süper Lig;Serie A|72
Adem Buyuk|Türkiye|ST|2005|2023|Süper Lig|72
Jem Karacan|Türkiye|CM|2007|2018|Premier Lig;Süper Lig|70
Nuri Kamburoglu|Türkiye|RB|1990|2005|Süper Lig|69
Kerem Tunceri|Türkiye|CM|1997|2013|Süper Lig|72
Ibrahim Uzulmez|Türkiye|LB|1996|2013|Süper Lig|75
Okan Koc|Türkiye|GK|1996|2010|Süper Lig|69
Hakan Arikan|Türkiye|GK|2000|2020|Süper Lig|71
Cenk Gonen|Türkiye|GK|2007|2021|Süper Lig|72
Harun Tekin|Türkiye|GK|2008|2024|Süper Lig|71
Ismail Kartal Oyuncu|Türkiye|RB|1979|1996|Süper Lig|72
Bulent Uygun|Türkiye|ST|1989|2004|Süper Lig|75
Elvir Bolic|Bosna-Hersek|ST|1990|2007|Süper Lig|79
Kennet Andersson Yedek|İsveç|ST|1988|2001|Serie A|79
Mert Nobre|Brezilya|ST|1999|2016|Süper Lig|75
Marco Aurelio|Brezilya|DM|1996|2012|Süper Lig|78
Fabio Luciano|Brezilya|CB|1997|2010|Süper Lig|75
Roberto Carlos Yedek|Brezilya|LB|1991|2012|Brezilya Ligi;La Liga;Süper Lig|93
Guti|İspanya|AM|1995|2011|La Liga;Süper Lig|83
Harry Kane Yedek|İngiltere|ST|2010|2026|Premier Lig;Bundesliga|91
Wayne Bridge|İngiltere|LB|1998|2014|Premier Lig|75
Glen Johnson|İngiltere|RB|2001|2018|Premier Lig|78
Peter Crouch|İngiltere|ST|1998|2019|Premier Lig|78
Gabriel Agbonlahor|İngiltere|ST|2005|2018|Premier Lig|75
Aaron Lennon|İngiltere|RW|2003|2021|Premier Lig;Süper Lig|76
Tom Huddlestone|İngiltere|CM|2003|2022|Premier Lig|73
Fabian Delph|İngiltere|CM|2006|2022|Premier Lig|74
Jack Rodwell|İngiltere|CM|2007|2023|Premier Lig|71
Danny Drinkwater|İngiltere|CM|2008|2023|Premier Lig|74
Danny Ings|İngiltere|ST|2011|2026|Premier Lig|75
Callum Wilson|İngiltere|ST|2010|2026|Premier Lig|77
Dominic Calvert-Lewin|İngiltere|ST|2014|2026|Premier Lig|76
Harvey Barnes|İngiltere|LW|2016|2026|Premier Lig|78
Jacob Ramsey|İngiltere|CM|2019|2026|Premier Lig|76
James Maddison|İngiltere|AM|2014|2026|Premier Lig|80
Jarrod Bowen|İngiltere|RW|2014|2026|Premier Lig|80
Tino Livramento|İngiltere|RB|2020|2026|Premier Lig|78
Levi Colwill|İngiltere|CB|2021|2026|Premier Lig|79
Jamal Musiala Yedek|Almanya|AM|2019|2026|Bundesliga|89
Florian Wirtz Yedek|Almanya|AM|2019|2026|Bundesliga;Premier Lig|90
Kai Havertz Yedek|Almanya|ST|2016|2026|Bundesliga;Premier Lig|83
Serge Gnabry|Almanya|RW|2012|2026|Bundesliga;Premier Lig|80
Karim Adeyemi|Almanya|LW|2018|2026|Avusturya Ligi;Bundesliga|79
Jamie Leweling|Almanya|RW|2019|2026|Bundesliga|76
Nick Woltemade|Almanya|ST|2020|2026|Bundesliga;Premier Lig|80
Tom Bischof|Almanya|CM|2021|2026|Bundesliga|76
Rocco Reitz|Almanya|CM|2020|2026|Bundesliga|75
Brajan Gruda|Almanya|RW|2021|2026|Bundesliga;Premier Lig|74
Cesc Fabregas Yedek|İspanya|CM|2003|2023|Premier Lig;La Liga;Serie B|88
Isco|İspanya|AM|2010|2026|La Liga|84
Jose Callejon|İspanya|RW|2008|2024|La Liga;Serie A|79
Pablo Fornals|İspanya|CM|2015|2026|La Liga;Premier Lig|77
Pablo Sarabia|İspanya|RW|2010|2026|La Liga;Ligue 1;Premier Lig|77
Sergio Canales|İspanya|AM|2008|2026|La Liga;Meksika Ligi|79
Iago Aspas|İspanya|ST|2008|2026|La Liga;Premier Lig|81
Borja Iglesias|İspanya|ST|2014|2026|La Liga|75
Gerard Moreno|İspanya|ST|2010|2026|La Liga|80
Raul de Tomas|İspanya|ST|2014|2026|La Liga|74
Oihan Sancet|İspanya|AM|2019|2026|La Liga|79
Javi Puado|İspanya|ST|2018|2026|La Liga|74
Aleix Garcia|İspanya|CM|2015|2026|La Liga;Bundesliga|77
Sergi Darder|İspanya|CM|2013|2026|La Liga|75
Ivan Rakitic Yedek|Hırvatistan|CM|2005|2025|Bundesliga;La Liga;Suudi Ligi|86
Marco Verratti|İtalya|CM|2011|2026|Ligue 1;Katar Ligi|85
Lorenzo Insigne|İtalya|LW|2009|2026|Serie A;MLS|82
Lorenzo Pellegrini|İtalya|AM|2014|2026|Serie A|79
Federico Chiesa|İtalya|RW|2016|2026|Serie A;Premier Lig|81
Nicolo Zaniolo|İtalya|AM|2018|2026|Serie A;Süper Lig|75
Davide Calabria|İtalya|RB|2015|2026|Serie A|76
Alessandro Buongiorno|İtalya|CB|2019|2026|Serie A|80
Destiny Udogie|İtalya|LB|2020|2026|Serie A;Premier Lig|78
Andrea Cambiaso|İtalya|LB|2019|2026|Serie A|78
Samuele Ricci|İtalya|DM|2019|2026|Serie A|77
Nicolo Rovella|İtalya|DM|2019|2026|Serie A|76
Giovanni Di Lorenzo|İtalya|RB|2014|2026|Serie A|81
Matteo Darmian|İtalya|RB|2006|2026|Serie A;Premier Lig|76
Francesco Acerbi|İtalya|CB|2010|2026|Serie A|78
Luiz Felipe|İtalya|CB|2016|2026|Serie A;La Liga|75
Wilfried Singo|Fildişi Sahili|RB|2019|2026|Serie A;Ligue 1|76
Ousmane Diomande|Fildişi Sahili|CB|2021|2026|Portekiz Ligi|77
Yves Bissouma Yedek|Mali|DM|2016|2026|Premier Lig|76
Cheick Doucoure|Mali|DM|2018|2026|Ligue 1;Premier Lig|76
Dango Ouattara|Burkina Faso|RW|2020|2026|Ligue 1;Premier Lig|76
Bertrand Traore|Burkina Faso|RW|2013|2026|Premier Lig;Ligue 1|74
Edmond Tapsoba|Burkina Faso|CB|2017|2026|Bundesliga|80
Issa Kabore|Burkina Faso|RB|2019|2026|Ligue 1|72
Emmanuel Agbadou|Fildişi Sahili|CB|2019|2026|Ligue 1|75
Terem Moffi|Nijerya|ST|2018|2026|Ligue 1|76
Akor Adams|Nijerya|ST|2020|2026|Ligue 1;La Liga|73
Raphael Onyedika|Nijerya|DM|2020|2026|Belçika Ligi|76
Fiston Mayele|Kongo DC|ST|2018|2026|Mısır Ligi|73
Cedric Bakambu|Kongo DC|ST|2010|2026|La Liga;Çin Ligi|75
Chancel Mbemba|Kongo DC|CB|2012|2026|Premier Lig;Ligue 1|76
Axel Tuanzebe|Kongo DC|CB|2016|2026|Premier Lig|72
Yoane Wissa|Kongo DC|ST|2015|2026|Ligue 1;Premier Lig|79
Frank Kessie Yedek|Fildişi Sahili|CM|2015|2026|Suudi Ligi|79
Krepin Diatta|Senegal|RW|2017|2026|Belçika Ligi;Ligue 1|74
Iliman Ndiaye|Senegal|AM|2019|2026|Premier Lig;Ligue 1|78
Lamine Camara|Senegal|CM|2022|2026|Ligue 1|76
Assane Diao|Senegal|RW|2022|2026|La Liga;Serie A|75
Ismael Saibari|Fas|AM|2020|2026|Hollanda Ligi|78
Couhaib Driouech|Fas|LW|2021|2026|Hollanda Ligi|73
Neil El Aynaoui|Fas|CM|2021|2026|Ligue 1;Serie A|76
Chemsdine Talbi|Fas|RW|2022|2026|Belçika Ligi;Premier Lig|75
Anass Zaroury|Fas|LW|2020|2026|Premier Lig;Ligue 1|73
Oussama Idrissi|Fas|LW|2016|2026|Hollanda Ligi;La Liga|73
Zakaria Aboukhlal|Fas|RW|2019|2026|Ligue 1|74
Munir El Haddadi|Fas|ST|2014|2026|La Liga|74
Ayoub El Kaabi|Fas|ST|2015|2026|Fas Ligi;Yunanistan Ligi|76
Mehdi Benatia Yedek|Fas|CB|2005|2021|Serie A;Bundesliga;Katar Ligi|82
Ali Maaloul|Tunus|LB|2010|2026|Tunus Ligi;Mısır Ligi|73
Wahbi Khazri|Tunus|AM|2009|2024|Ligue 1;Premier Lig|76
Youssef Msakni|Tunus|LW|2008|2026|Tunus Ligi;Katar Ligi|74
Ellyes Skhiri|Tunus|DM|2014|2026|Ligue 1;Bundesliga|76
Hannibal Mejbri|Tunus|CM|2019|2026|Premier Lig|73
Aissa Laidouni|Tunus|CM|2016|2026|Süper Lig|73
Naim Sliti|Tunus|LW|2013|2026|Ligue 1;Suudi Ligi|73
Riyad Boudebouz|Cezayir|AM|2008|2024|Ligue 1;La Liga|73
Farid Boulaya|Cezayir|AM|2013|2025|Ligue 1|72
Nabil Bentaleb|Cezayir|CM|2013|2026|Premier Lig;Bundesliga|74
Saad Agouzoul|Fas|CB|2018|2025|Ligue 1|69
Hakim Ziyech Efsane|Fas|AM|2012|2026|Süper Lig|82
Sofiane Boufal|Fas|LW|2013|2026|Ligue 1;Premier Lig|75
Selim Amallah|Fas|AM|2017|2026|Belçika Ligi;La Liga|73
Steven Berghuis|Hollanda|RW|2011|2026|Hollanda Ligi;Premier Lig|78
Guus Til|Hollanda|AM|2015|2026|Hollanda Ligi;Rusya Ligi|75
Joey Veerman|Hollanda|CM|2018|2026|Hollanda Ligi|78
Mats Wieffer|Hollanda|DM|2020|2026|Hollanda Ligi;Premier Lig|77
Sven Botman|Hollanda|CB|2019|2026|Ligue 1;Premier Lig|79
Marten de Roon|Hollanda|DM|2010|2026|Serie A|77
Teun Koopmeiners|Hollanda|CM|2017|2026|Hollanda Ligi;Serie A|79
Sam Lammers|Hollanda|ST|2016|2026|Hollanda Ligi;Serie A|72
Vangelis Pavlidis|Yunanistan|ST|2016|2026|Hollanda Ligi;Portekiz Ligi|79
Fotis Ioannidis|Yunanistan|ST|2019|2026|Yunanistan Ligi|75
Giorgos Masouras|Yunanistan|RW|2014|2026|Yunanistan Ligi|72
Anastasios Bakasetas|Yunanistan|AM|2012|2026|Yunanistan Ligi;Süper Lig|75
Manolis Siopis|Yunanistan|DM|2012|2026|Yunanistan Ligi;Süper Lig|72
Konstantinos Tsimikas|Yunanistan|LB|2015|2026|Yunanistan Ligi;Premier Lig|76
Odysseas Vlachodimos|Yunanistan|GK|2012|2026|Portekiz Ligi;Premier Lig|76
Konstantinos Karetsas|Yunanistan|AM|2023|2026|Belçika Ligi|74
Christos Tzolis|Yunanistan|LW|2019|2026|Belçika Ligi;Bundesliga|75
Giannis Konstantelias|Yunanistan|AM|2021|2026|Yunanistan Ligi|75
Sotiris Alexandropoulos|Yunanistan|CM|2020|2026|Yunanistan Ligi;Portekiz Ligi|72
Kostas Fortounis|Yunanistan|AM|2010|2026|Yunanistan Ligi|75
Theofanis Gekas|Yunanistan|ST|2001|2019|Bundesliga;Süper Lig|76
Giorgos Karagounis|Yunanistan|CM|1996|2014|Yunanistan Ligi;Serie A;Premier Lig|80
Angelos Charisteas|Yunanistan|ST|1997|2014|Yunanistan Ligi;Bundesliga|76
Theodoros Zagorakis|Yunanistan|DM|1992|2007|Yunanistan Ligi;Premier Lig|78
Antonios Nikopolidis|Yunanistan|GK|1989|2011|Yunanistan Ligi|77
Traianos Dellas|Yunanistan|CB|1994|2011|Yunanistan Ligi;Serie A|77
Stelios Giannakopoulos|Yunanistan|RW|1992|2010|Yunanistan Ligi;Premier Lig|76
Dimitris Salpingidis|Yunanistan|RW|1999|2017|Yunanistan Ligi|74
Vassilis Torosidis|Yunanistan|RB|2003|2020|Yunanistan Ligi;Serie A|76
Sokratis Papastathopoulos|Yunanistan|CB|2005|2025|Bundesliga;Premier Lig;Yunanistan Ligi|81
Kostas Manolas|Yunanistan|CB|2010|2025|Serie A;Yunanistan Ligi|80
Nikola Vlasic|Hırvatistan|AM|2014|2026|Premier Lig;Serie A|76
Toma Basic|Hırvatistan|CM|2016|2026|Ligue 1;Serie A|72
Kristijan Jakic|Hırvatistan|DM|2018|2026|Bundesliga|74
Marco Pasalic|Hırvatistan|RW|2020|2026|Hırvatistan Ligi;MLS|73
Igor Matanovic|Hırvatistan|ST|2020|2026|Bundesliga|73
Franjo Ivanovic|Hırvatistan|ST|2021|2026|Belçika Ligi;Portekiz Ligi|75
Roko Simic|Hırvatistan|ST|2020|2026|Avusturya Ligi|72
Luka Vuskovic|Hırvatistan|CB|2021|2026|Hırvatistan Ligi;Premier Lig|76
Joe Gomez|İngiltere|CB|2015|2026|Premier Lig|77
Jarell Quansah|İngiltere|CB|2021|2026|Premier Lig;Bundesliga|76
Archie Gray|İngiltere|CM|2021|2026|Premier Lig|75
Kobbie Mainoo|İngiltere|CM|2022|2026|Premier Lig|79
Angel Gomes|İngiltere|AM|2017|2026|Ligue 1;Premier Lig|75
Noni Madueke|İngiltere|RW|2019|2026|Hollanda Ligi;Premier Lig|78
Liam Delap|İngiltere|ST|2020|2026|Premier Lig|76
Jean-Clair Todibo|Fransa|CB|2018|2026|Ligue 1;Premier Lig|77
Castello Lukeba|Fransa|CB|2020|2026|Ligue 1;Bundesliga|79
Loic Bade|Fransa|CB|2019|2026|Ligue 1;La Liga;Bundesliga|77
Kiliann Sildillia|Fransa|RB|2020|2026|Bundesliga|74
Quentin Merlin|Fransa|LB|2020|2026|Ligue 1|74
Arnaud Kalimuendo|Fransa|ST|2019|2026|Ligue 1;Premier Lig|76
Elye Wahi|Fransa|ST|2020|2026|Ligue 1;Bundesliga|75
Mathys Tel|Fransa|ST|2021|2026|Ligue 1;Bundesliga;Premier Lig|76
Wilson Odobert|Fransa|LW|2021|2026|Ligue 1;Premier Lig|75
Lucas Stassin|Belçika|ST|2021|2026|Belçika Ligi;Ligue 1|74
Maxim De Cuyper|Belçika|LB|2020|2026|Belçika Ligi;Premier Lig|75
Ardon Jashari Yedek|İsviçre|DM|2019|2026|İsviçre Ligi;Serie A|80
Fabian Rieder|İsviçre|AM|2020|2026|İsviçre Ligi;Ligue 1|74
Zeki Amdouni|İsviçre|ST|2020|2026|İsviçre Ligi;Premier Lig|74
Filip Ugrinic|İsviçre|CM|2018|2026|İsviçre Ligi|72
Simon Sohm|İsviçre|CM|2019|2026|Serie A|74
Johan Manzambi|İsviçre|CM|2023|2026|Bundesliga|74
Albert Gudmundsson|İzlanda|AM|2016|2026|Hollanda Ligi;Serie A|78
Hakon Haraldsson|İzlanda|AM|2020|2026|Danimarka Ligi;Ligue 1|75
Orri Oskarsson|İzlanda|ST|2021|2026|Danimarka Ligi;La Liga|74
Gylfi Sigurdsson|İzlanda|AM|2008|2024|Premier Lig|79
Eidur Gudjohnsen|İzlanda|ST|1994|2016|Premier Lig;La Liga|83
Kolbeinn Sigthorsson|İzlanda|ST|2008|2021|Hollanda Ligi;Ligue 1|73
Aron Gunnarsson|İzlanda|DM|2006|2024|Premier Lig;Katar Ligi|73
Birkir Bjarnason|İzlanda|CM|2006|2025|Serie A;Premier Lig|73
Emre Can|Almanya|DM|2012|2026|Premier Lig;Serie A;Bundesliga|79
Suat Serdar|Almanya|CM|2015|2026|Bundesliga|75
Kenan Karaman|Türkiye|ST|2012|2026|Bundesliga;Süper Lig|74
Kaan Kurt|Türkiye|LB|2019|2026|Bundesliga;Süper Lig|71
Atakan Karazor|Türkiye|DM|2016|2026|Bundesliga|75
Salih Ozcan Yedek|Türkiye|DM|2016|2026|Bundesliga;Süper Lig|76
Malik Fatih Talabidi|Türkiye|CB|2021|2026|Hollanda Ligi|70
Can Bozdogan|Türkiye|CM|2019|2026|Bundesliga;Süper Lig|71
Ahmed Kutucu|Türkiye|ST|2018|2026|Bundesliga;Süper Lig|72
Isa Kaykun|Türkiye|GK|2021|2026|Süper Lig|67
Ravil Tagir|Türkiye|CB|2019|2026|Süper Lig|71
Arda Kizildag|Türkiye|LB|2021|2026|Süper Lig|68
Bertug Ozgur Yildirim|Türkiye|ST|2020|2026|Süper Lig;Ligue 1|71
Muhammed Sengezer|Türkiye|GK|2015|2026|Süper Lig|72
Deniz Turuc|Türkiye|LW|2011|2026|Süper Lig|72
Onur Bulut|Türkiye|RB|2013|2026|Bundesliga;Süper Lig|71
Emre Colak|Türkiye|AM|2008|2022|Süper Lig;La Liga|73
Alper Potuk|Türkiye|AM|2008|2023|Süper Lig|74
Mehmet Ekici|Türkiye|AM|2008|2021|Bundesliga;Süper Lig|74
Volkan Sen|Türkiye|LW|2005|2020|Süper Lig|73
Musa Aydin|Türkiye|RW|2000|2014|Süper Lig|69
Sercan Yildirim|Türkiye|ST|2007|2019|Süper Lig|71
Mustafa Pektemek|Türkiye|ST|2007|2021|Süper Lig|70
Caner Erkin|Türkiye|LB|2006|2023|Süper Lig;Serie A;Rusya Ligi|79
Ismail Koybasi|Türkiye|LB|2007|2021|Süper Lig|72
Sener Ozbayrakli|Türkiye|RB|2009|2021|Süper Lig|72
Mert Cetin|Türkiye|CB|2016|2026|Serie A;Süper Lig|72
Berkay Ozcan|Türkiye|CM|2015|2026|Bundesliga;Süper Lig|72
Abdulkadir Omur|Türkiye|AM|2015|2026|Süper Lig;Premier Lig|74
Abdulkadir Parmak|Türkiye|CM|2015|2025|Süper Lig|70
Dorukhan Tokoz Yedek|Türkiye|CM|2014|2025|Süper Lig|72
Emre Kilinc Yedek|Türkiye|RW|2013|2025|Süper Lig|71
Taylan Antalyali|Türkiye|DM|2013|2026|Süper Lig|72
Muhammed Kerem Akturkoglu Yedek|Türkiye|LW|2019|2026|Süper Lig|79
Atalay Babacan|Türkiye|AM|2018|2026|Süper Lig|69
Yusuf Erdogan|Türkiye|LW|2010|2025|Süper Lig|70
Anthony Nwakaeme|Nijerya|LW|2011|2024|Süper Lig|75
Marek Hamsik Yedek|Slovakya|CM|2004|2023|Serie A|85
Jose Sosa|Arjantin|CM|2004|2022|Süper Lig;La Liga;Serie A|77
Mauro Zarate|Arjantin|ST|2004|2022|Arjantin Ligi;Serie A|75
Ezequiel Lavezzi|Arjantin|LW|2003|2019|Serie A;Ligue 1|82
Erik Lamela|Arjantin|RW|2009|2026|Serie A;Premier Lig;La Liga|78
Angel Correa|Arjantin|ST|2013|2026|La Liga;Meksika Ligi|78
Paulo Dybala Yedek|Arjantin|ST|2011|2026|Serie A|86
Emiliano Buendia|Arjantin|AM|2014|2026|Premier Lig;Bundesliga|76
Alejandro Garnacho|Arjantin|LW|2021|2026|Premier Lig|78
Facundo Buonanotte|Arjantin|AM|2021|2026|Premier Lig|75
Thiago Almada|Arjantin|AM|2019|2026|MLS;Ligue 1;La Liga|79
Matias Soule|Arjantin|RW|2021|2026|Serie A|78
Benjamin Rollheiser|Arjantin|RW|2020|2026|Arjantin Ligi;Portekiz Ligi|74
Equi Fernandez|Arjantin|DM|2020|2026|Arjantin Ligi;Suudi Ligi|76
Alan Varela|Arjantin|DM|2020|2026|Arjantin Ligi;Portekiz Ligi|77
Aaron Anselmino|Arjantin|CB|2023|2026|Arjantin Ligi;Premier Lig|74
Leonardo Balerdi|Arjantin|CB|2018|2026|Ligue 1|78
Marcos Senesi|Arjantin|CB|2016|2026|Hollanda Ligi;Premier Lig|77
Gonzalo Montiel|Arjantin|RB|2016|2026|Arjantin Ligi;La Liga|76
Lucas Martinez Quarta|Arjantin|CB|2015|2026|Serie A;Arjantin Ligi|75
German Pezzella|Arjantin|CB|2011|2026|Serie A;La Liga|75
Juan Musso|Arjantin|GK|2014|2026|Serie A|76
Kaoru Mitoma Yedek|Japonya|LW|2020|2026|Premier Lig|81
Yukinari Sugawara|Japonya|RB|2018|2026|Hollanda Ligi;Premier Lig|74
Kota Takai|Japonya|CB|2022|2026|Japonya Ligi;Premier Lig|74
Takumi Kamada|Japonya|CM|2015|2026|Bundesliga|77
`;

const TR_MAP = { 'ç':'c','Ç':'c','ğ':'g','Ğ':'g','ı':'i','İ':'i','ö':'o','Ö':'o','ş':'s','Ş':'s','ü':'u','Ü':'u','á':'a','â':'a','ã':'a','é':'e','í':'i','ó':'o','ú':'u','ñ':'n',"'":'' };
const slugify = name => name.toLowerCase().split('').map(ch => TR_MAP[ch] ?? ch).join('').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const STRIP_WORDS = /\s+(yedek|efsane|oyuncu)$/i;
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
  if (Number(rating) < 62) continue;
  existingIds.add(id);
  existingNames.add(normName(cleanName));
  added.push({
    id, name: cleanName, nationality: nationality.trim(), position: position.trim(),
    activeStart: Number(start), activeEnd: Number(end),
    leagues: leagues.split(';').map(item => item.trim()).filter(Boolean),
    rating: Number(rating), source: 'v8-curated'
  });
}

const all = [...data.players, ...added];
const body = all.map(p => JSON.stringify(p)).join(',');
const out = `(function(root,factory){const data=factory();if(typeof module==="object"&&module.exports)module.exports=data;if(root){root.KRONOMETRE_PLAYERS=Object.freeze(data.players);root.KRONOMETRE_EXCLUDED_PLAYER_IDS=Object.freeze(data.excluded);}})(typeof window!=="undefined"?window:globalThis,function(){"use strict";const EXCLUDED=${JSON.stringify(data.excluded)};const players=[${body}];return Object.freeze({players:Object.freeze(players),excluded:Object.freeze(EXCLUDED)});});`;
fs.writeFileSync(FILE, out);
console.log(`Eklenen: ${added.length} · Toplam: ${all.length}`);
