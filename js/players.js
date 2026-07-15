(function (root) {
  'use strict';

  const rows = [
    ['lev-yashin','Lev Yaşin','SSCB','GK',1950,1970,['Sovyet Ligi'],96],
    ['gordon-banks','Gordon Banks','İngiltere','GK',1958,1978,['Premier Lig'],91],
    ['dino-zoff','Dino Zoff','İtalya','GK',1961,1983,['Serie A'],93],
    ['peter-schmeichel','Peter Schmeichel','Danimarka','GK',1981,2003,['Premier Lig','Danimarka Ligi'],92],
    ['oliver-kahn','Oliver Kahn','Almanya','GK',1987,2008,['Bundesliga'],92],
    ['gianluigi-buffon','Gianluigi Buffon','İtalya','GK',1995,2023,['Serie A','Ligue 1'],96],
    ['iker-casillas','Iker Casillas','İspanya','GK',1998,2020,['La Liga','Portekiz Ligi'],94],
    ['manuel-neuer','Manuel Neuer','Almanya','GK',2005,2026,['Bundesliga'],95],
    ['alisson','Alisson Becker','Brezilya','GK',2013,2026,['Premier Lig','Serie A'],90],
    ['courtois','Thibaut Courtois','Belçika','GK',2009,2026,['La Liga','Premier Lig'],91],
    ['rustu','Rüştü Reçber','Türkiye','GK',1988,2012,['Süper Lig','La Liga'],87],

    ['bobby-moore','Bobby Moore','İngiltere','CB',1958,1978,['Premier Lig'],93],
    ['beckenbauer','Franz Beckenbauer','Almanya','CB',1964,1983,['Bundesliga','ABD Ligi'],97],
    ['carlos-alberto','Carlos Alberto','Brezilya','RB',1963,1982,['Brezilya Ligi','ABD Ligi'],93],
    ['facchetti','Giacinto Facchetti','İtalya','LB',1960,1978,['Serie A'],92],
    ['baresi','Franco Baresi','İtalya','CB',1977,1997,['Serie A'],96],
    ['maldini','Paolo Maldini','İtalya','LB',1984,2009,['Serie A'],97],
    ['koeman','Ronald Koeman','Hollanda','CB',1980,1997,['La Liga','Hollanda Ligi'],92],
    ['cafu','Cafu','Brezilya','RB',1989,2008,['Serie A','Brezilya Ligi'],94],
    ['roberto-carlos','Roberto Carlos','Brezilya','LB',1991,2015,['La Liga','Süper Lig','Brezilya Ligi'],94],
    ['nesta','Alessandro Nesta','İtalya','CB',1993,2014,['Serie A','MLS'],93],
    ['cannavaro','Fabio Cannavaro','İtalya','CB',1992,2011,['Serie A','La Liga'],94],
    ['thuram','Lilian Thuram','Fransa','RB',1991,2008,['Serie A','La Liga','Ligue 1'],92],
    ['puyol','Carles Puyol','İspanya','CB',1999,2014,['La Liga'],93],
    ['daniel-alves','Dani Alves','Brezilya','RB',2001,2023,['La Liga','Serie A','Ligue 1'],93],
    ['lahm','Philipp Lahm','Almanya','LB',2002,2017,['Bundesliga'],93],
    ['sergio-ramos','Sergio Ramos','İspanya','CB',2004,2026,['La Liga','Ligue 1'],94],
    ['marcelo','Marcelo','Brezilya','LB',2005,2024,['La Liga','Brezilya Ligi'],91],
    ['van-dijk','Virgil van Dijk','Hollanda','CB',2011,2026,['Premier Lig','İskoçya Ligi'],92],
    ['hakimi','Achraf Hakimi','Fas','RB',2016,2026,['Ligue 1','Serie A','Bundesliga'],89],
    ['alphonso-davies','Alphonso Davies','Kanada','LB',2016,2026,['Bundesliga','MLS'],88],
    ['bulent-korkmaz','Bülent Korkmaz','Türkiye','CB',1987,2005,['Süper Lig'],87],
    ['alpay','Alpay Özalan','Türkiye','CB',1992,2008,['Süper Lig','Premier Lig','Bundesliga'],82],

    ['didi','Didi','Brezilya','CM',1946,1966,['Brezilya Ligi','La Liga'],93],
    ['bobby-charlton','Bobby Charlton','İngiltere','AM',1956,1980,['Premier Lig'],95],
    ['gerson','Gérson','Brezilya','CM',1959,1974,['Brezilya Ligi'],90],
    ['cruyff','Johan Cruyff','Hollanda','AM',1964,1984,['Hollanda Ligi','La Liga'],98],
    ['zico','Zico','Brezilya','AM',1971,1994,['Brezilya Ligi','Serie A'],95],
    ['socrates','Sócrates','Brezilya','CM',1974,1989,['Brezilya Ligi','Serie A'],92],
    ['platini','Michel Platini','Fransa','AM',1972,1987,['Serie A','Ligue 1'],96],
    ['matthaus','Lothar Matthäus','Almanya','DM',1979,2000,['Bundesliga','Serie A'],95],
    ['gullit','Ruud Gullit','Hollanda','AM',1979,1998,['Serie A','Premier Lig','Hollanda Ligi'],94],
    ['hagi','Gheorghe Hagi','Romanya','AM',1982,2001,['La Liga','Süper Lig'],93],
    ['rijkaard','Frank Rijkaard','Hollanda','DM',1980,1995,['Serie A','Hollanda Ligi','La Liga'],93],
    ['zidane','Zinedine Zidane','Fransa','AM',1989,2006,['Serie A','La Liga','Ligue 1'],98],
    ['figo','Luís Figo','Portekiz','RW',1989,2009,['La Liga','Serie A'],95],
    ['beckham','David Beckham','İngiltere','CM',1992,2013,['Premier Lig','La Liga','MLS','Ligue 1'],91],
    ['rivaldo','Rivaldo','Brezilya','AM',1991,2015,['La Liga','Serie A','Brezilya Ligi'],94],
    ['riquelme','Juan Román Riquelme','Arjantin','AM',1996,2014,['Arjantin Ligi','La Liga'],92],
    ['pirlo','Andrea Pirlo','İtalya','CM',1995,2017,['Serie A','MLS'],94],
    ['vieira','Patrick Vieira','Fransa','DM',1994,2011,['Premier Lig','Serie A','Ligue 1'],91],
    ['makelele','Claude Makélélé','Fransa','DM',1991,2011,['La Liga','Premier Lig','Ligue 1'],90],
    ['kaka','Kaká','Brezilya','AM',2001,2017,['Serie A','La Liga','MLS'],94],
    ['xavi','Xavi Hernández','İspanya','CM',1998,2019,['La Liga','Katar Ligi'],96],
    ['iniesta','Andrés Iniesta','İspanya','AM',2002,2024,['La Liga','Japonya Ligi'],96],
    ['busquets','Sergio Busquets','İspanya','DM',2008,2026,['La Liga','MLS'],92],
    ['modric','Luka Modrić','Hırvatistan','CM',2003,2026,['La Liga','Premier Lig'],96],
    ['kroos','Toni Kroos','Almanya','CM',2007,2024,['Bundesliga','La Liga'],94],
    ['de-bruyne','Kevin De Bruyne','Belçika','AM',2008,2026,['Premier Lig','Bundesliga'],94],
    ['rodri','Rodri','İspanya','DM',2015,2026,['Premier Lig','La Liga'],92],
    ['bellingham','Jude Bellingham','İngiltere','AM',2019,2026,['La Liga','Bundesliga'],91],
    ['hakan-calhanoglu','Hakan Çalhanoğlu','Türkiye','CM',2010,2026,['Serie A','Bundesliga'],88],
    ['sergen','Sergen Yalçın','Türkiye','AM',1991,2008,['Süper Lig'],88],
    ['arda-turan','Arda Turan','Türkiye','AM',2005,2020,['Süper Lig','La Liga'],87],

    ['di-stefano','Alfredo Di Stéfano','Arjantin','ST',1945,1966,['La Liga','Arjantin Ligi'],98],
    ['puskas','Ferenc Puskás','Macaristan','ST',1943,1966,['Macaristan Ligi','La Liga'],98],
    ['pele','Pelé','Brezilya','ST',1956,1977,['Brezilya Ligi','ABD Ligi'],99],
    ['garrincha','Garrincha','Brezilya','RW',1953,1972,['Brezilya Ligi'],96],
    ['eusebio','Eusébio','Portekiz','ST',1957,1979,['Portekiz Ligi','ABD Ligi'],97],
    ['george-best','George Best','Kuzey İrlanda','LW',1963,1984,['Premier Lig','ABD Ligi'],95],
    ['metin-oktay','Metin Oktay','Türkiye','ST',1955,1969,['Süper Lig','Serie A'],92],
    ['lefter','Lefter Küçükandonyadis','Türkiye','RW',1947,1964,['Süper Lig','Serie A','Ligue 1'],92],
    ['maradona','Diego Maradona','Arjantin','AM',1976,1997,['Arjantin Ligi','La Liga','Serie A'],99],
    ['van-basten','Marco van Basten','Hollanda','ST',1981,1995,['Hollanda Ligi','Serie A'],97],
    ['romario','Romário','Brezilya','ST',1985,2009,['Brezilya Ligi','La Liga','Hollanda Ligi'],96],
    ['stoichkov','Hristo Stoichkov','Bulgaristan','LW',1982,2003,['La Liga','Bulgaristan Ligi'],92],
    ['batistuta','Gabriel Batistuta','Arjantin','ST',1988,2005,['Serie A','Arjantin Ligi'],94],
    ['weah','George Weah','Liberya','ST',1985,2003,['Serie A','Ligue 1','Premier Lig'],93],
    ['ronaldo','Ronaldo Nazário','Brezilya','ST',1993,2011,['La Liga','Serie A','Hollanda Ligi'],98],
    ['shevchenko','Andriy Shevchenko','Ukrayna','ST',1994,2012,['Serie A','Premier Lig','Ukrayna Ligi'],94],
    ['henry','Thierry Henry','Fransa','LW',1994,2014,['Premier Lig','La Liga','Ligue 1','MLS'],96],
    ['ronaldinho','Ronaldinho','Brezilya','LW',1998,2015,['La Liga','Serie A','Ligue 1','Brezilya Ligi'],97],
    ['eto-o','Samuel Eto’o','Kamerun','ST',1997,2019,['La Liga','Serie A','Premier Lig'],94],
    ['drogba','Didier Drogba','Fildişi Sahili','ST',1998,2018,['Premier Lig','Ligue 1','Süper Lig','MLS'],93],
    ['hakan-sukur','Hakan Şükür','Türkiye','ST',1987,2008,['Süper Lig','Serie A','Premier Lig'],90],
    ['n-ihat','Nihat Kahveci','Türkiye','ST',1997,2012,['Süper Lig','La Liga'],87],
    ['cristiano','Cristiano Ronaldo','Portekiz','LW',2002,2026,['Premier Lig','La Liga','Serie A','Suudi Ligi'],99],
    ['messi','Lionel Messi','Arjantin','RW',2004,2026,['La Liga','Ligue 1','MLS'],99],
    ['rooney','Wayne Rooney','İngiltere','ST',2002,2018,['Premier Lig','MLS'],93],
    ['robben','Arjen Robben','Hollanda','RW',2000,2021,['Premier Lig','La Liga','Bundesliga'],94],
    ['ribery','Franck Ribéry','Fransa','LW',2000,2022,['Bundesliga','Serie A','Ligue 1','Süper Lig'],93],
    ['suarez','Luis Suárez','Uruguay','ST',2005,2026,['La Liga','Premier Lig','Hollanda Ligi','MLS'],95],
    ['lewandowski','Robert Lewandowski','Polonya','ST',2006,2026,['Bundesliga','La Liga'],96],
    ['benzema','Karim Benzema','Fransa','ST',2004,2026,['Ligue 1','La Liga','Suudi Ligi'],96],
    ['neymar','Neymar','Brezilya','LW',2009,2026,['Brezilya Ligi','La Liga','Ligue 1','Suudi Ligi'],95],
    ['salah','Mohamed Salah','Mısır','RW',2010,2026,['Premier Lig','Serie A'],94],
    ['mbappe','Kylian Mbappé','Fransa','ST',2015,2026,['Ligue 1','La Liga'],96],
    ['haaland','Erling Haaland','Norveç','ST',2016,2026,['Bundesliga','Premier Lig'],94],
    ['vinicius','Vinícius Júnior','Brezilya','LW',2017,2026,['La Liga','Brezilya Ligi'],93],
    ['saka','Bukayo Saka','İngiltere','RW',2018,2026,['Premier Lig'],90],
    ['yamal','Lamine Yamal','İspanya','RW',2023,2026,['La Liga'],90],

    ['sepp-maier','Sepp Maier','Almanya','GK',1962,1980,['Bundesliga'],92],
    ['van-der-sar','Edwin van der Sar','Hollanda','GK',1990,2011,['Hollanda Ligi','Serie A','Premier Lig'],92],
    ['petr-cech','Petr Čech','Çekya','GK',1999,2019,['Premier Lig','Fransa Ligi'],92],
    ['dida','Dida','Brezilya','GK',1992,2015,['Serie A','Brezilya Ligi'],90],
    ['taffarel','Cláudio Taffarel','Brezilya','GK',1985,2003,['Brezilya Ligi','Serie A','Süper Lig'],90],
    ['keylor-navas','Keylor Navas','Kosta Rika','GK',2005,2026,['La Liga','Ligue 1','Premier Lig'],89],
    ['ederson','Ederson','Brezilya','GK',2011,2026,['Premier Lig','Portekiz Ligi'],90],
    ['donnarumma','Gianluigi Donnarumma','İtalya','GK',2015,2026,['Serie A','Ligue 1'],90],
    ['oblak','Jan Oblak','Slovenya','GK',2009,2026,['La Liga','Portekiz Ligi'],91],
    ['victor-valdes','Víctor Valdés','İspanya','GK',2002,2017,['La Liga','Premier Lig'],88],

    ['passarella','Daniel Passarella','Arjantin','CB',1971,1989,['Arjantin Ligi','Serie A'],94],
    ['scirea','Gaetano Scirea','İtalya','CB',1972,1988,['Serie A'],94],
    ['gentile','Claudio Gentile','İtalya','RB',1971,1988,['Serie A'],90],
    ['sammer','Matthias Sammer','Almanya','CB',1985,1998,['Bundesliga','Serie A'],92],
    ['hierro','Fernando Hierro','İspanya','CB',1987,2005,['La Liga','Premier Lig'],91],
    ['desailly','Marcel Desailly','Fransa','CB',1986,2006,['Serie A','Premier Lig','Ligue 1'],92],
    ['jaap-stam','Jaap Stam','Hollanda','CB',1992,2007,['Premier Lig','Serie A','Hollanda Ligi'],91],
    ['rio-ferdinand','Rio Ferdinand','İngiltere','CB',1996,2015,['Premier Lig'],91],
    ['john-terry','John Terry','İngiltere','CB',1998,2018,['Premier Lig'],91],
    ['vidic','Nemanja Vidić','Sırbistan','CB',2000,2016,['Premier Lig','Serie A'],91],
    ['chiellini','Giorgio Chiellini','İtalya','CB',2000,2023,['Serie A','MLS'],91],
    ['kompany','Vincent Kompany','Belçika','CB',2003,2020,['Premier Lig','Bundesliga'],90],
    ['ashley-cole','Ashley Cole','İngiltere','LB',1999,2019,['Premier Lig','Serie A','MLS'],90],
    ['zanetti','Javier Zanetti','Arjantin','RB',1992,2014,['Serie A','Arjantin Ligi'],93],
    ['carvajal','Dani Carvajal','İspanya','RB',2010,2026,['La Liga','Bundesliga'],90],
    ['rudiger','Antonio Rüdiger','Almanya','CB',2011,2026,['La Liga','Premier Lig','Serie A'],89],
    ['ruben-dias','Rúben Dias','Portekiz','CB',2015,2026,['Premier Lig','Portekiz Ligi'],90],
    ['saliba','William Saliba','Fransa','CB',2018,2026,['Premier Lig','Ligue 1'],89],
    ['theo-hernandez','Theo Hernández','Fransa','LB',2015,2026,['Serie A','La Liga'],89],
    ['trent','Trent Alexander-Arnold','İngiltere','RB',2016,2026,['Premier Lig','La Liga'],89],

    ['rivelino','Rivelino','Brezilya','AM',1965,1981,['Brezilya Ligi','Suudi Ligi'],94],
    ['neeskens','Johan Neeskens','Hollanda','CM',1968,1991,['Hollanda Ligi','La Liga','ABD Ligi'],92],
    ['falcao-mid','Paulo Roberto Falcão','Brezilya','CM',1972,1986,['Brezilya Ligi','Serie A'],93],
    ['redondo','Fernando Redondo','Arjantin','DM',1985,2004,['La Liga','Serie A'],92],
    ['davids','Edgar Davids','Hollanda','DM',1991,2014,['Serie A','La Liga','Premier Lig'],90],
    ['seedorf','Clarence Seedorf','Hollanda','CM',1992,2014,['Hollanda Ligi','La Liga','Serie A'],93],
    ['scholes','Paul Scholes','İngiltere','CM',1993,2013,['Premier Lig'],92],
    ['lampard','Frank Lampard','İngiltere','CM',1995,2016,['Premier Lig','MLS'],92],
    ['gerrard','Steven Gerrard','İngiltere','CM',1998,2016,['Premier Lig','MLS'],93],
    ['yaya-toure','Yaya Touré','Fildişi Sahili','CM',2001,2020,['Premier Lig','La Liga','Ligue 1'],91],
    ['sneijder','Wesley Sneijder','Hollanda','AM',2002,2019,['Hollanda Ligi','La Liga','Serie A','Süper Lig'],91],
    ['ozil','Mesut Özil','Almanya','AM',2005,2023,['Bundesliga','La Liga','Premier Lig','Süper Lig'],90],
    ['david-silva','David Silva','İspanya','AM',2003,2023,['La Liga','Premier Lig'],92],
    ['fabregas','Cesc Fàbregas','İspanya','CM',2003,2023,['Premier Lig','La Liga','Ligue 1','Serie A'],91],
    ['casemiro','Casemiro','Brezilya','DM',2010,2026,['La Liga','Premier Lig','Portekiz Ligi'],91],
    ['kante','N’Golo Kanté','Fransa','DM',2011,2026,['Premier Lig','Ligue 1','Suudi Ligi'],92],
    ['bruno-fernandes','Bruno Fernandes','Portekiz','AM',2012,2026,['Premier Lig','Serie A','Portekiz Ligi'],89],
    ['odegaard','Martin Ødegaard','Norveç','AM',2014,2026,['Premier Lig','La Liga'],89],
    ['pedri','Pedri','İspanya','CM',2019,2026,['La Liga'],89],
    ['musiala','Jamal Musiala','Almanya','AM',2020,2026,['Bundesliga'],90],
    ['arda-guler','Arda Güler','Türkiye','AM',2021,2026,['Süper Lig','La Liga'],86],
    ['okocha','Jay-Jay Okocha','Nijerya','AM',1990,2008,['Bundesliga','Ligue 1','Premier Lig','Süper Lig'],89],
    ['nakata','Hidetoshi Nakata','Japonya','AM',1995,2006,['Serie A','Japonya Ligi'],87],

    ['gerd-muller','Gerd Müller','Almanya','ST',1964,1982,['Bundesliga','ABD Ligi'],97],
    ['jairzinho','Jairzinho','Brezilya','RW',1959,1982,['Brezilya Ligi','Ligue 1'],94],
    ['kempes','Mario Kempes','Arjantin','ST',1970,1996,['Arjantin Ligi','La Liga'],94],
    ['rummenigge','Karl-Heinz Rummenigge','Almanya','ST',1974,1989,['Bundesliga','Serie A'],95],
    ['baggio','Roberto Baggio','İtalya','AM',1982,2004,['Serie A'],96],
    ['bergkamp','Dennis Bergkamp','Hollanda','ST',1986,2006,['Hollanda Ligi','Serie A','Premier Lig'],94],
    ['del-piero','Alessandro Del Piero','İtalya','ST',1991,2014,['Serie A','Avustralya Ligi'],94],
    ['raul','Raúl González','İspanya','ST',1994,2015,['La Liga','Bundesliga','Katar Ligi'],94],
    ['totti','Francesco Totti','İtalya','AM',1992,2017,['Serie A'],95],
    ['inzaghi','Filippo Inzaghi','İtalya','ST',1991,2012,['Serie A'],91],
    ['van-nistelrooy','Ruud van Nistelrooy','Hollanda','ST',1993,2012,['Hollanda Ligi','Premier Lig','La Liga','Bundesliga'],93],
    ['ibrahimovic','Zlatan Ibrahimović','İsveç','ST',1999,2023,['Hollanda Ligi','Serie A','La Liga','Ligue 1','MLS'],95],
    ['aguero','Sergio Agüero','Arjantin','ST',2003,2021,['La Liga','Premier Lig'],94],
    ['harry-kane','Harry Kane','İngiltere','ST',2009,2026,['Premier Lig','Bundesliga'],94],
    ['griezmann','Antoine Griezmann','Fransa','ST',2009,2026,['La Liga'],92],
    ['son','Son Heung-min','Güney Kore','LW',2010,2026,['Premier Lig','Bundesliga'],91],
    ['mane','Sadio Mané','Senegal','LW',2011,2026,['Premier Lig','Bundesliga','Suudi Ligi'],91],
    ['mahrez','Riyad Mahrez','Cezayir','RW',2009,2026,['Premier Lig','Ligue 1','Suudi Ligi'],90],
    ['osimhen','Victor Osimhen','Nijerya','ST',2015,2026,['Serie A','Ligue 1','Süper Lig'],89],
    ['lautaro','Lautaro Martínez','Arjantin','ST',2015,2026,['Serie A','Arjantin Ligi'],91]
  ];

  const supplementalRows = [
    [
        "ricardo-zamora",
        "Ricardo Zamora",
        "İspanya",
        "GK",
        1916,
        1938,
        [
            "La Liga"
        ],
        94
    ],
    [
        "jose-luis-chilavert",
        "José Luis Chilavert",
        "Paraguay",
        "GK",
        1982,
        2004,
        [
            "Arjantin Ligi",
            "La Liga",
            "Fransa Ligi"
        ],
        90
    ],
    [
        "rene-higuita",
        "René Higuita",
        "Kolombiya",
        "GK",
        1985,
        2010,
        [
            "Kolombiya Ligi",
            "La Liga"
        ],
        88
    ],
    [
        "jorge-campos",
        "Jorge Campos",
        "Meksika",
        "GK",
        1988,
        2004,
        [
            "Meksika Ligi",
            "MLS"
        ],
        88
    ],
    [
        "walter-zenga",
        "Walter Zenga",
        "İtalya",
        "GK",
        1978,
        1999,
        [
            "Serie A",
            "MLS"
        ],
        90
    ],
    [
        "angelo-peruzzi",
        "Angelo Peruzzi",
        "İtalya",
        "GK",
        1986,
        2007,
        [
            "Serie A"
        ],
        89
    ],
    [
        "francesco-toldo",
        "Francesco Toldo",
        "İtalya",
        "GK",
        1990,
        2010,
        [
            "Serie A"
        ],
        90
    ],
    [
        "andoni-zubizarreta",
        "Andoni Zubizarreta",
        "İspanya",
        "GK",
        1981,
        1998,
        [
            "La Liga"
        ],
        90
    ],
    [
        "jose-angel-iribar",
        "José Ángel Iribar",
        "İspanya",
        "GK",
        1962,
        1980,
        [
            "La Liga"
        ],
        91
    ],
    [
        "ubaldo-fillol",
        "Ubaldo Fillol",
        "Arjantin",
        "GK",
        1965,
        1991,
        [
            "Arjantin Ligi",
            "La Liga",
            "Brezilya Ligi"
        ],
        92
    ],
    [
        "amadeo-carrizo",
        "Amadeo Carrizo",
        "Arjantin",
        "GK",
        1945,
        1970,
        [
            "Arjantin Ligi",
            "Kolombiya Ligi"
        ],
        93
    ],
    [
        "rinat-dasayev",
        "Rinat Dasayev",
        "SSCB",
        "GK",
        1976,
        1991,
        [
            "Sovyet Ligi",
            "La Liga"
        ],
        92
    ],
    [
        "claudio-bravo",
        "Cláudio Bravo",
        "Şili",
        "GK",
        2002,
        2024,
        [
            "La Liga",
            "Premier Lig"
        ],
        88
    ],
    [
        "julio-cesar",
        "Júlio César",
        "Brezilya",
        "GK",
        1997,
        2018,
        [
            "Brezilya Ligi",
            "Serie A",
            "Premier Lig",
            "Portekiz Ligi"
        ],
        90
    ],
    [
        "pepe-reina",
        "Pepe Reina",
        "İspanya",
        "GK",
        1999,
        2025,
        [
            "La Liga",
            "Premier Lig",
            "Serie A",
            "Bundesliga"
        ],
        88
    ],
    [
        "hugo-lloris",
        "Hugo Lloris",
        "Fransa",
        "GK",
        2005,
        2024,
        [
            "Ligue 1",
            "Premier Lig",
            "MLS"
        ],
        89
    ],
    [
        "fabien-barthez",
        "Fabien Barthez",
        "Fransa",
        "GK",
        1990,
        2007,
        [
            "Ligue 1",
            "Premier Lig"
        ],
        90
    ],
    [
        "thomas-n-kono",
        "Thomas N'Kono",
        "Kamerun",
        "GK",
        1974,
        1997,
        [
            "Kamerun Ligi",
            "La Liga"
        ],
        89
    ],
    [
        "bruce-grobbelaar",
        "Bruce Grobbelaar",
        "Zimbabve",
        "GK",
        1973,
        2007,
        [
            "Premier Lig",
            "Güney Afrika Ligi"
        ],
        87
    ],
    [
        "neville-southall",
        "Neville Southall",
        "Galler",
        "GK",
        1980,
        2002,
        [
            "Premier Lig"
        ],
        90
    ],
    [
        "nilton-santos",
        "Nilton Santos",
        "Brezilya",
        "LB",
        1948,
        1964,
        [
            "Brezilya Ligi"
        ],
        95
    ],
    [
        "djalma-santos",
        "Djalma Santos",
        "Brezilya",
        "RB",
        1948,
        1970,
        [
            "Brezilya Ligi"
        ],
        95
    ],
    [
        "jose-maria-gimenez",
        "José María Giménez",
        "Uruguay",
        "CB",
        2013,
        2025,
        [
            "La Liga"
        ],
        88
    ],
    [
        "domingos-da-guia",
        "Domingos da Guia",
        "Brezilya",
        "CB",
        1929,
        1950,
        [
            "Brezilya Ligi",
            "Arjantin Ligi"
        ],
        94
    ],
    [
        "elias-figueroa",
        "Elías Figueroa",
        "Şili",
        "CB",
        1964,
        1982,
        [
            "Şili Ligi",
            "Uruguay Ligi",
            "Brezilya Ligi"
        ],
        95
    ],
    [
        "jose-santamaria",
        "José Santamaría",
        "Uruguay",
        "CB",
        1948,
        1966,
        [
            "Uruguay Ligi",
            "La Liga"
        ],
        93
    ],
    [
        "armando-picchi",
        "Armando Picchi",
        "İtalya",
        "CB",
        1954,
        1969,
        [
            "Serie A"
        ],
        92
    ],
    [
        "tarcisio-burgnich",
        "Tarcisio Burgnich",
        "İtalya",
        "RB",
        1958,
        1977,
        [
            "Serie A"
        ],
        91
    ],
    [
        "antonio-cabrini",
        "Antonio Cabrini",
        "İtalya",
        "LB",
        1973,
        1991,
        [
            "Serie A"
        ],
        91
    ],
    [
        "giuseppe-bergomi",
        "Giuseppe Bergomi",
        "İtalya",
        "RB",
        1979,
        1999,
        [
            "Serie A"
        ],
        92
    ],
    [
        "ciro-ferrara",
        "Ciro Ferrara",
        "İtalya",
        "CB",
        1984,
        2005,
        [
            "Serie A"
        ],
        91
    ],
    [
        "alessandro-costacurta",
        "Alessandro Costacurta",
        "İtalya",
        "CB",
        1986,
        2007,
        [
            "Serie A"
        ],
        91
    ],
    [
        "mauro-tassotti",
        "Mauro Tassotti",
        "İtalya",
        "RB",
        1978,
        1997,
        [
            "Serie A"
        ],
        89
    ],
    [
        "giacinto-scirea",
        "Giacinto Scirea",
        "İtalya",
        "CB",
        1972,
        1988,
        [
            "Serie A"
        ],
        94
    ],
    [
        "bruno-conti",
        "Bruno Conti",
        "İtalya",
        "RB",
        1973,
        1991,
        [
            "Serie A"
        ],
        88
    ],
    [
        "laurent-blanc",
        "Laurent Blanc",
        "Fransa",
        "CB",
        1983,
        2003,
        [
            "Ligue 1",
            "Serie A",
            "La Liga",
            "Premier Lig"
        ],
        92
    ],
    [
        "bixente-lizarazu",
        "Bixente Lizarazu",
        "Fransa",
        "LB",
        1988,
        2006,
        [
            "Ligue 1",
            "La Liga",
            "Bundesliga"
        ],
        91
    ],
    [
        "manuel-amoros",
        "Manuel Amoros",
        "Fransa",
        "RB",
        1980,
        1996,
        [
            "Ligue 1"
        ],
        90
    ],
    [
        "raphael-varane",
        "Raphaël Varane",
        "Fransa",
        "CB",
        2010,
        2024,
        [
            "Ligue 1",
            "La Liga",
            "Premier Lig"
        ],
        92
    ],
    [
        "william-gallas",
        "William Gallas",
        "Fransa",
        "CB",
        1995,
        2014,
        [
            "Ligue 1",
            "Premier Lig"
        ],
        88
    ],
    [
        "patrice-evra",
        "Patrice Evra",
        "Fransa",
        "LB",
        1998,
        2018,
        [
            "Ligue 1",
            "Premier Lig",
            "Serie A"
        ],
        90
    ],
    [
        "eric-abidal",
        "Eric Abidal",
        "Fransa",
        "LB",
        1999,
        2014,
        [
            "Ligue 1",
            "La Liga"
        ],
        89
    ],
    [
        "marcel-desailly",
        "Marcel Desailly",
        "Fransa",
        "CB",
        1986,
        2006,
        [
            "Ligue 1",
            "Serie A",
            "Premier Lig"
        ],
        92
    ],
    [
        "lucio",
        "Lúcio",
        "Brezilya",
        "CB",
        1997,
        2020,
        [
            "Brezilya Ligi",
            "Bundesliga",
            "Serie A"
        ],
        92
    ],
    [
        "aldair",
        "Aldair",
        "Brezilya",
        "CB",
        1985,
        2009,
        [
            "Brezilya Ligi",
            "Serie A"
        ],
        91
    ],
    [
        "juan",
        "Juan",
        "Brezilya",
        "CB",
        1996,
        2019,
        [
            "Brezilya Ligi",
            "Bundesliga",
            "Serie A"
        ],
        89
    ],
    [
        "maicon",
        "Maicon",
        "Brezilya",
        "RB",
        2001,
        2021,
        [
            "Brezilya Ligi",
            "Ligue 1",
            "Serie A",
            "Premier Lig"
        ],
        91
    ],
    [
        "branco",
        "Branco",
        "Brezilya",
        "LB",
        1979,
        1998,
        [
            "Brezilya Ligi",
            "Serie A",
            "Portekiz Ligi"
        ],
        89
    ],
    [
        "junior",
        "Júnior",
        "Brezilya",
        "LB",
        1974,
        1993,
        [
            "Brezilya Ligi",
            "Serie A"
        ],
        91
    ],
    [
        "leandro",
        "Leandro",
        "Brezilya",
        "RB",
        1978,
        1990,
        [
            "Brezilya Ligi"
        ],
        90
    ],
    [
        "ricardo-carvalho",
        "Ricardo Carvalho",
        "Portekiz",
        "CB",
        1997,
        2017,
        [
            "Portekiz Ligi",
            "Premier Lig",
            "La Liga",
            "Ligue 1"
        ],
        91
    ],
    [
        "pepe",
        "Pepe",
        "Portekiz",
        "CB",
        2001,
        2024,
        [
            "Portekiz Ligi",
            "La Liga",
            "Süper Lig"
        ],
        91
    ],
    [
        "joao-cancelo",
        "João Cancelo",
        "Portekiz",
        "RB",
        2012,
        2025,
        [
            "Portekiz Ligi",
            "La Liga",
            "Serie A",
            "Premier Lig",
            "Bundesliga"
        ],
        89
    ],
    [
        "nuno-mendes",
        "Nuno Mendes",
        "Portekiz",
        "LB",
        2020,
        2025,
        [
            "Portekiz Ligi",
            "Ligue 1"
        ],
        87
    ],
    [
        "fernando-couto",
        "Fernando Couto",
        "Portekiz",
        "CB",
        1988,
        2008,
        [
            "Portekiz Ligi",
            "La Liga",
            "Serie A"
        ],
        89
    ],
    [
        "miguel",
        "Miguel",
        "Portekiz",
        "RB",
        1999,
        2012,
        [
            "Portekiz Ligi",
            "La Liga"
        ],
        87
    ],
    [
        "roberto-ayala",
        "Roberto Ayala",
        "Arjantin",
        "CB",
        1991,
        2010,
        [
            "Arjantin Ligi",
            "Serie A",
            "La Liga"
        ],
        92
    ],
    [
        "javier-mascherano",
        "Javier Mascherano",
        "Arjantin",
        "CB",
        2003,
        2020,
        [
            "Arjantin Ligi",
            "Brezilya Ligi",
            "Premier Lig",
            "La Liga",
            "Çin Ligi"
        ],
        91
    ],
    [
        "walter-samuel",
        "Walter Samuel",
        "Arjantin",
        "CB",
        1996,
        2016,
        [
            "Arjantin Ligi",
            "Serie A",
            "La Liga"
        ],
        91
    ],
    [
        "nicolas-otamendi",
        "Nicolás Otamendi",
        "Arjantin",
        "CB",
        2008,
        2025,
        [
            "Arjantin Ligi",
            "Portekiz Ligi",
            "La Liga",
            "Premier Lig"
        ],
        89
    ],
    [
        "pablo-zabaleta",
        "Pablo Zabaleta",
        "Arjantin",
        "RB",
        2002,
        2020,
        [
            "Arjantin Ligi",
            "La Liga",
            "Premier Lig"
        ],
        88
    ],
    [
        "juan-pablo-sorin",
        "Juan Pablo Sorín",
        "Arjantin",
        "LB",
        1994,
        2009,
        [
            "Arjantin Ligi",
            "Brezilya Ligi",
            "La Liga",
            "Ligue 1",
            "Bundesliga"
        ],
        88
    ],
    [
        "oscar-ruggeri",
        "Oscar Ruggeri",
        "Arjantin",
        "CB",
        1980,
        1997,
        [
            "Arjantin Ligi",
            "La Liga",
            "Serie A"
        ],
        91
    ],
    [
        "diego-godin",
        "Diego Godín",
        "Uruguay",
        "CB",
        2003,
        2023,
        [
            "Uruguay Ligi",
            "La Liga",
            "Serie A",
            "Brezilya Ligi"
        ],
        91
    ],
    [
        "paolo-montero",
        "Paolo Montero",
        "Uruguay",
        "CB",
        1990,
        2007,
        [
            "Uruguay Ligi",
            "Serie A"
        ],
        89
    ],
    [
        "martin-caceres",
        "Martín Cáceres",
        "Uruguay",
        "CB",
        2006,
        2025,
        [
            "Uruguay Ligi",
            "La Liga",
            "Serie A",
            "Premier Lig",
            "MLS"
        ],
        87
    ],
    [
        "ronald-araujo",
        "Ronald Araújo",
        "Uruguay",
        "CB",
        2016,
        2025,
        [
            "Uruguay Ligi",
            "La Liga"
        ],
        89
    ],
    [
        "jaap-stam",
        "Jaap Stam",
        "Hollanda",
        "CB",
        1992,
        2007,
        [
            "Hollanda Ligi",
            "Premier Lig",
            "Serie A"
        ],
        91
    ],
    [
        "frank-de-boer",
        "Frank de Boer",
        "Hollanda",
        "CB",
        1988,
        2006,
        [
            "Hollanda Ligi",
            "La Liga",
            "Premier Lig"
        ],
        91
    ],
    [
        "ronald-de-boer",
        "Ronald de Boer",
        "Hollanda",
        "RB",
        1987,
        2008,
        [
            "Hollanda Ligi",
            "La Liga",
            "İskoçya Ligi"
        ],
        86
    ],
    [
        "ruud-krol",
        "Ruud Krol",
        "Hollanda",
        "LB",
        1968,
        1986,
        [
            "Hollanda Ligi",
            "Serie A",
            "Ligue 1"
        ],
        93
    ],
    [
        "wim-suurbier",
        "Wim Suurbier",
        "Hollanda",
        "RB",
        1964,
        1987,
        [
            "Hollanda Ligi",
            "La Liga",
            "ABD Ligi"
        ],
        89
    ],
    [
        "adri-van-tiggelen",
        "Adri van Tiggelen",
        "Hollanda",
        "LB",
        1978,
        1995,
        [
            "Hollanda Ligi",
            "Belçika Ligi"
        ],
        87
    ],
    [
        "ron-vlaar",
        "Ron Vlaar",
        "Hollanda",
        "CB",
        2004,
        2021,
        [
            "Hollanda Ligi",
            "Premier Lig"
        ],
        87
    ],
    [
        "mats-hummels",
        "Mats Hummels",
        "Almanya",
        "CB",
        2007,
        2025,
        [
            "Bundesliga",
            "Serie A"
        ],
        91
    ],
    [
        "jerome-boateng",
        "Jérôme Boateng",
        "Almanya",
        "CB",
        2007,
        2024,
        [
            "Bundesliga",
            "Premier Lig",
            "Ligue 1",
            "Serie A"
        ],
        90
    ],
    [
        "per-mertesacker",
        "Per Mertesacker",
        "Almanya",
        "CB",
        2003,
        2018,
        [
            "Bundesliga",
            "Premier Lig"
        ],
        89
    ],
    [
        "andreas-brehme",
        "Andreas Brehme",
        "Almanya",
        "LB",
        1978,
        1998,
        [
            "Bundesliga",
            "Serie A",
            "La Liga"
        ],
        92
    ],
    [
        "jurgen-kohler",
        "Jürgen Kohler",
        "Almanya",
        "CB",
        1983,
        2002,
        [
            "Bundesliga",
            "Serie A"
        ],
        92
    ],
    [
        "hans-georg-schwarzenbeck",
        "Hans-Georg Schwarzenbeck",
        "Almanya",
        "CB",
        1966,
        1981,
        [
            "Bundesliga"
        ],
        90
    ],
    [
        "karl-heinz-forster",
        "Karl-Heinz Förster",
        "Almanya",
        "CB",
        1975,
        1990,
        [
            "Bundesliga",
            "Ligue 1"
        ],
        91
    ],
    [
        "joshua-kimmich",
        "Joshua Kimmich",
        "Almanya",
        "RB",
        2013,
        2025,
        [
            "Bundesliga"
        ],
        91
    ],
    [
        "jonathan-tah",
        "Jonathan Tah",
        "Almanya",
        "CB",
        2013,
        2025,
        [
            "Bundesliga"
        ],
        88
    ],
    [
        "sol-campbell",
        "Sol Campbell",
        "İngiltere",
        "CB",
        1992,
        2011,
        [
            "Premier Lig"
        ],
        91
    ],
    [
        "tony-adams",
        "Tony Adams",
        "İngiltere",
        "CB",
        1983,
        2002,
        [
            "Premier Lig"
        ],
        92
    ],
    [
        "gary-neville",
        "Gary Neville",
        "İngiltere",
        "RB",
        1992,
        2011,
        [
            "Premier Lig"
        ],
        89
    ],
    [
        "ashley-young",
        "Ashley Young",
        "İngiltere",
        "LB",
        2003,
        2024,
        [
            "Premier Lig",
            "Serie A"
        ],
        86
    ],
    [
        "kyle-walker",
        "Kyle Walker",
        "İngiltere",
        "RB",
        2008,
        2025,
        [
            "Premier Lig",
            "Serie A"
        ],
        90
    ],
    [
        "stuart-pearce",
        "Stuart Pearce",
        "İngiltere",
        "LB",
        1983,
        2002,
        [
            "Premier Lig"
        ],
        89
    ],
    [
        "terry-butcher",
        "Terry Butcher",
        "İngiltere",
        "CB",
        1976,
        1993,
        [
            "Premier Lig",
            "İskoçya Ligi"
        ],
        89
    ],
    [
        "des-walker",
        "Des Walker",
        "İngiltere",
        "CB",
        1984,
        2004,
        [
            "Premier Lig",
            "Serie A"
        ],
        88
    ],
    [
        "sami-hyypia",
        "Sami Hyypiä",
        "Finlandiya",
        "CB",
        1989,
        2011,
        [
            "Finlandiya Ligi",
            "Hollanda Ligi",
            "Premier Lig",
            "Bundesliga"
        ],
        90
    ],
    [
        "branislav-ivanovic",
        "Branislav Ivanović",
        "Sırbistan",
        "RB",
        2002,
        2021,
        [
            "Rusya Ligi",
            "Premier Lig"
        ],
        89
    ],
    [
        "dejan-stankovic",
        "Dejan Stanković",
        "Sırbistan",
        "CB",
        1994,
        2013,
        [
            "Sırbistan Ligi",
            "Serie A"
        ],
        86
    ],
    [
        "nemanja-matic",
        "Nemanja Matić",
        "Sırbistan",
        "CB",
        2005,
        2025,
        [
            "Sırbistan Ligi",
            "Portekiz Ligi",
            "Premier Lig",
            "Serie A",
            "Ligue 1"
        ],
        86
    ],
    [
        "ivan-cordoba",
        "Ivan Córdoba",
        "Kolombiya",
        "CB",
        1993,
        2012,
        [
            "Kolombiya Ligi",
            "Arjantin Ligi",
            "Serie A"
        ],
        90
    ],
    [
        "mario-yepes",
        "Mario Yepes",
        "Kolombiya",
        "CB",
        1994,
        2016,
        [
            "Kolombiya Ligi",
            "Arjantin Ligi",
            "Ligue 1",
            "Serie A"
        ],
        87
    ],
    [
        "rafael-marquez",
        "Rafael Márquez",
        "Meksika",
        "CB",
        1996,
        2018,
        [
            "Meksika Ligi",
            "Ligue 1",
            "La Liga",
            "MLS",
            "Serie A"
        ],
        91
    ],
    [
        "hector-moreno",
        "Héctor Moreno",
        "Meksika",
        "CB",
        2006,
        2024,
        [
            "Meksika Ligi",
            "Hollanda Ligi",
            "La Liga",
            "Serie A"
        ],
        87
    ],
    [
        "hong-myung-bo",
        "Hong Myung-bo",
        "Güney Kore",
        "CB",
        1992,
        2004,
        [
            "Güney Kore Ligi",
            "Japonya Ligi",
            "MLS"
        ],
        89
    ],
    [
        "yuto-nagatomo",
        "Yuto Nagatomo",
        "Japonya",
        "LB",
        2007,
        2025,
        [
            "Japonya Ligi",
            "Serie A",
            "Süper Lig",
            "Ligue 1"
        ],
        86
    ],
    [
        "obdulio-varela",
        "Obdulio Varela",
        "Uruguay",
        "DM",
        1938,
        1955,
        [
            "Uruguay Ligi"
        ],
        95
    ],
    [
        "nandor-hidegkuti",
        "Nandor Hidegkuti",
        "Macaristan",
        "AM",
        1942,
        1958,
        [
            "Macaristan Ligi"
        ],
        95
    ],
    [
        "sandor-kocsis",
        "Sándor Kocsis",
        "Macaristan",
        "ST",
        1943,
        1965,
        [
            "Macaristan Ligi",
            "La Liga"
        ],
        96
    ],
    [
        "jozsef-bozsik",
        "József Bozsik",
        "Macaristan",
        "CM",
        1943,
        1962,
        [
            "Macaristan Ligi"
        ],
        94
    ],
    [
        "laszlo-kubala",
        "László Kubala",
        "Macaristan",
        "AM",
        1944,
        1967,
        [
            "La Liga"
        ],
        95
    ],
    [
        "luis-suarez-miramontes",
        "Luis Suárez Miramontes",
        "İspanya",
        "CM",
        1953,
        1973,
        [
            "La Liga",
            "Serie A"
        ],
        96
    ],
    [
        "paco-gento",
        "Paco Gento",
        "İspanya",
        "LW",
        1952,
        1971,
        [
            "La Liga"
        ],
        96
    ],
    [
        "amancio-amaro",
        "Amancio Amaro",
        "İspanya",
        "RW",
        1958,
        1976,
        [
            "La Liga"
        ],
        93
    ],
    [
        "pirri",
        "Pirri",
        "İspanya",
        "CM",
        1963,
        1982,
        [
            "La Liga",
            "Meksika Ligi"
        ],
        92
    ],
    [
        "jose-antonio-camacho",
        "José Antonio Camacho",
        "İspanya",
        "DM",
        1973,
        1989,
        [
            "La Liga"
        ],
        89
    ],
    [
        "pep-guardiola",
        "Pep Guardiola",
        "İspanya",
        "DM",
        1990,
        2006,
        [
            "La Liga",
            "Serie A",
            "Katar Ligi",
            "Meksika Ligi"
        ],
        90
    ],
    [
        "xabi-alonso",
        "Xabi Alonso",
        "İspanya",
        "DM",
        1999,
        2017,
        [
            "La Liga",
            "Premier Lig",
            "Bundesliga"
        ],
        93
    ],
    [
        "david-villa",
        "David Villa",
        "İspanya",
        "ST",
        2000,
        2020,
        [
            "La Liga",
            "MLS",
            "Japonya Ligi"
        ],
        94
    ],
    [
        "fernando-torres",
        "Fernando Torres",
        "İspanya",
        "ST",
        2001,
        2019,
        [
            "La Liga",
            "Premier Lig",
            "Serie A",
            "Japonya Ligi"
        ],
        92
    ],
    [
        "juan-mata",
        "Juan Mata",
        "İspanya",
        "AM",
        2006,
        2025,
        [
            "La Liga",
            "Premier Lig",
            "Süper Lig",
            "Japonya Ligi"
        ],
        88
    ],
    [
        "santi-cazorla",
        "Santi Cazorla",
        "İspanya",
        "AM",
        2003,
        2025,
        [
            "La Liga",
            "Premier Lig",
            "Katar Ligi"
        ],
        89
    ],
    [
        "thiago-alcantara",
        "Thiago Alcântara",
        "İspanya",
        "CM",
        2009,
        2024,
        [
            "La Liga",
            "Bundesliga",
            "Premier Lig"
        ],
        91
    ],
    [
        "david-de-gea",
        "David de Gea",
        "İspanya",
        "GK",
        2008,
        2025,
        [
            "La Liga",
            "Premier Lig",
            "Serie A"
        ],
        90
    ],
    [
        "emilio-butragueno",
        "Emilio Butragueño",
        "İspanya",
        "ST",
        1982,
        1998,
        [
            "La Liga",
            "Meksika Ligi"
        ],
        93
    ],
    [
        "telmo-zarra",
        "Telmo Zarra",
        "İspanya",
        "ST",
        1939,
        1957,
        [
            "La Liga"
        ],
        95
    ],
    [
        "raymond-kopa",
        "Raymond Kopa",
        "Fransa",
        "AM",
        1949,
        1967,
        [
            "Ligue 1",
            "La Liga"
        ],
        95
    ],
    [
        "just-fontaine",
        "Just Fontaine",
        "Fransa",
        "ST",
        1950,
        1962,
        [
            "Ligue 1"
        ],
        95
    ],
    [
        "jean-tigana",
        "Jean Tigana",
        "Fransa",
        "CM",
        1975,
        1991,
        [
            "Ligue 1"
        ],
        91
    ],
    [
        "alain-giresse",
        "Alain Giresse",
        "Fransa",
        "AM",
        1970,
        1988,
        [
            "Ligue 1"
        ],
        92
    ],
    [
        "didier-deschamps",
        "Didier Deschamps",
        "Fransa",
        "DM",
        1985,
        2001,
        [
            "Ligue 1",
            "Serie A",
            "Premier Lig",
            "La Liga"
        ],
        92
    ],
    [
        "emmanuel-petit",
        "Emmanuel Petit",
        "Fransa",
        "DM",
        1988,
        2004,
        [
            "Ligue 1",
            "Premier Lig",
            "La Liga"
        ],
        89
    ],
    [
        "robert-pires",
        "Robert Pirès",
        "Fransa",
        "LW",
        1993,
        2015,
        [
            "Ligue 1",
            "Premier Lig",
            "La Liga"
        ],
        91
    ],
    [
        "franck-ribery",
        "Franck Ribéry",
        "Fransa",
        "LW",
        2000,
        2022,
        [
            "Ligue 1",
            "Süper Lig",
            "Bundesliga",
            "Serie A"
        ],
        93
    ],
    [
        "david-trezeguet",
        "David Trezeguet",
        "Fransa",
        "ST",
        1994,
        2015,
        [
            "Ligue 1",
            "Serie A",
            "La Liga",
            "Arjantin Ligi"
        ],
        92
    ],
    [
        "nicolas-anelka",
        "Nicolas Anelka",
        "Fransa",
        "ST",
        1996,
        2015,
        [
            "Ligue 1",
            "Premier Lig",
            "La Liga",
            "Süper Lig",
            "Çin Ligi"
        ],
        89
    ],
    [
        "karim-benzema",
        "Karim Benzema",
        "Fransa",
        "ST",
        2004,
        2025,
        [
            "Ligue 1",
            "La Liga",
            "Suudi Ligi"
        ],
        96
    ],
    [
        "olivier-giroud",
        "Olivier Giroud",
        "Fransa",
        "ST",
        2005,
        2025,
        [
            "Ligue 1",
            "Premier Lig",
            "Serie A",
            "MLS"
        ],
        89
    ],
    [
        "paul-pogba",
        "Paul Pogba",
        "Fransa",
        "CM",
        2011,
        2024,
        [
            "Premier Lig",
            "Serie A"
        ],
        91
    ],
    [
        "eduardo-camavinga",
        "Eduardo Camavinga",
        "Fransa",
        "CM",
        2019,
        2025,
        [
            "Ligue 1",
            "La Liga"
        ],
        89
    ],
    [
        "aurelien-tchouameni",
        "Aurélien Tchouaméni",
        "Fransa",
        "DM",
        2018,
        2025,
        [
            "Ligue 1",
            "La Liga"
        ],
        89
    ],
    [
        "gianni-rivera",
        "Gianni Rivera",
        "İtalya",
        "AM",
        1959,
        1979,
        [
            "Serie A"
        ],
        96
    ],
    [
        "sandro-mazzola",
        "Sandro Mazzola",
        "İtalya",
        "AM",
        1960,
        1977,
        [
            "Serie A"
        ],
        94
    ],
    [
        "roberto-boninsegna",
        "Roberto Boninsegna",
        "İtalya",
        "ST",
        1963,
        1980,
        [
            "Serie A"
        ],
        92
    ],
    [
        "paolo-rossi",
        "Paolo Rossi",
        "İtalya",
        "ST",
        1973,
        1987,
        [
            "Serie A"
        ],
        95
    ],
    [
        "marco-tardelli",
        "Marco Tardelli",
        "İtalya",
        "CM",
        1972,
        1988,
        [
            "Serie A"
        ],
        92
    ],
    [
        "carlo-ancelotti",
        "Carlo Ancelotti",
        "İtalya",
        "CM",
        1976,
        1992,
        [
            "Serie A"
        ],
        91
    ],
    [
        "demetrio-albertini",
        "Demetrio Albertini",
        "İtalya",
        "CM",
        1988,
        2005,
        [
            "Serie A",
            "La Liga"
        ],
        90
    ],
    [
        "gianfranco-zola",
        "Gianfranco Zola",
        "İtalya",
        "AM",
        1984,
        2005,
        [
            "Serie A",
            "Premier Lig"
        ],
        92
    ],
    [
        "christian-vieri",
        "Christian Vieri",
        "İtalya",
        "ST",
        1991,
        2009,
        [
            "Serie A",
            "La Liga",
            "Ligue 1"
        ],
        93
    ],
    [
        "luca-toni",
        "Luca Toni",
        "İtalya",
        "ST",
        1994,
        2016,
        [
            "Serie A",
            "Bundesliga"
        ],
        90
    ],
    [
        "antonio-di-natale",
        "Antonio Di Natale",
        "İtalya",
        "ST",
        1996,
        2016,
        [
            "Serie A"
        ],
        91
    ],
    [
        "daniele-de-rossi",
        "Daniele De Rossi",
        "İtalya",
        "DM",
        2001,
        2020,
        [
            "Serie A",
            "Arjantin Ligi"
        ],
        91
    ],
    [
        "gennaro-gattuso",
        "Gennaro Gattuso",
        "İtalya",
        "DM",
        1995,
        2013,
        [
            "Serie A",
            "İskoçya Ligi"
        ],
        89
    ],
    [
        "claudio-marchisio",
        "Claudio Marchisio",
        "İtalya",
        "CM",
        2006,
        2019,
        [
            "Serie A",
            "Rusya Ligi"
        ],
        89
    ],
    [
        "marco-verratti",
        "Marco Verratti",
        "İtalya",
        "CM",
        2008,
        2025,
        [
            "Serie B",
            "Ligue 1",
            "Katar Ligi"
        ],
        90
    ],
    [
        "federico-chiesa",
        "Federico Chiesa",
        "İtalya",
        "RW",
        2016,
        2025,
        [
            "Serie A",
            "Premier Lig"
        ],
        88
    ],
    [
        "gunter-netzer",
        "Günter Netzer",
        "Almanya",
        "AM",
        1963,
        1977,
        [
            "Bundesliga",
            "La Liga"
        ],
        94
    ],
    [
        "wolfgang-overath",
        "Wolfgang Overath",
        "Almanya",
        "CM",
        1962,
        1977,
        [
            "Bundesliga"
        ],
        93
    ],
    [
        "uwe-seeler",
        "Uwe Seeler",
        "Almanya",
        "ST",
        1953,
        1978,
        [
            "Bundesliga"
        ],
        96
    ],
    [
        "paul-breitner",
        "Paul Breitner",
        "Almanya",
        "DM",
        1970,
        1983,
        [
            "Bundesliga",
            "La Liga"
        ],
        95
    ],
    [
        "bernd-schuster",
        "Bernd Schuster",
        "Almanya",
        "CM",
        1978,
        1997,
        [
            "Bundesliga",
            "La Liga",
            "Meksika Ligi"
        ],
        94
    ],
    [
        "rudi-voller",
        "Rudi Völler",
        "Almanya",
        "ST",
        1977,
        1996,
        [
            "Bundesliga",
            "Serie A",
            "Ligue 1"
        ],
        93
    ],
    [
        "jurgen-klinsmann",
        "Jürgen Klinsmann",
        "Almanya",
        "ST",
        1981,
        2003,
        [
            "Bundesliga",
            "Serie A",
            "Ligue 1",
            "Premier Lig",
            "MLS"
        ],
        93
    ],
    [
        "thomas-haler",
        "Thomas Häßler",
        "Almanya",
        "AM",
        1984,
        2004,
        [
            "Bundesliga",
            "Serie A"
        ],
        90
    ],
    [
        "michael-ballack",
        "Michael Ballack",
        "Almanya",
        "CM",
        1995,
        2012,
        [
            "Bundesliga",
            "Premier Lig"
        ],
        93
    ],
    [
        "bastian-schweinsteiger",
        "Bastian Schweinsteiger",
        "Almanya",
        "CM",
        2002,
        2019,
        [
            "Bundesliga",
            "Premier Lig",
            "MLS"
        ],
        93
    ],
    [
        "mesut-ozil",
        "Mesut Özil",
        "Almanya",
        "AM",
        2005,
        2023,
        [
            "Bundesliga",
            "La Liga",
            "Premier Lig",
            "Süper Lig"
        ],
        90
    ],
    [
        "thomas-muller",
        "Thomas Müller",
        "Almanya",
        "AM",
        2008,
        2025,
        [
            "Bundesliga"
        ],
        93
    ],
    [
        "ilkay-gundogan",
        "Ilkay Gündoğan",
        "Almanya",
        "CM",
        2008,
        2025,
        [
            "Bundesliga",
            "Premier Lig",
            "La Liga"
        ],
        91
    ],
    [
        "florian-wirtz",
        "Florian Wirtz",
        "Almanya",
        "AM",
        2020,
        2025,
        [
            "Bundesliga"
        ],
        89
    ],
    [
        "stanley-matthews",
        "Stanley Matthews",
        "İngiltere",
        "RW",
        1932,
        1965,
        [
            "Premier Lig"
        ],
        96
    ],
    [
        "tom-finney",
        "Tom Finney",
        "İngiltere",
        "LW",
        1946,
        1963,
        [
            "Premier Lig"
        ],
        95
    ],
    [
        "jimmy-greaves",
        "Jimmy Greaves",
        "İngiltere",
        "ST",
        1957,
        1971,
        [
            "Premier Lig",
            "Serie A"
        ],
        96
    ],
    [
        "kevin-keegan",
        "Kevin Keegan",
        "İngiltere",
        "ST",
        1968,
        1985,
        [
            "Premier Lig",
            "Bundesliga"
        ],
        94
    ],
    [
        "glenn-hoddle",
        "Glenn Hoddle",
        "İngiltere",
        "AM",
        1975,
        1995,
        [
            "Premier Lig",
            "Ligue 1"
        ],
        92
    ],
    [
        "bryan-robson",
        "Bryan Robson",
        "İngiltere",
        "CM",
        1972,
        1997,
        [
            "Premier Lig"
        ],
        92
    ],
    [
        "gary-lineker",
        "Gary Lineker",
        "İngiltere",
        "ST",
        1978,
        1994,
        [
            "Premier Lig",
            "La Liga",
            "Japonya Ligi"
        ],
        93
    ],
    [
        "paul-gascoigne",
        "Paul Gascoigne",
        "İngiltere",
        "AM",
        1985,
        2004,
        [
            "Premier Lig",
            "Serie A",
            "İskoçya Ligi"
        ],
        91
    ],
    [
        "alan-shearer",
        "Alan Shearer",
        "İngiltere",
        "ST",
        1988,
        2006,
        [
            "Premier Lig"
        ],
        94
    ],
    [
        "michael-owen",
        "Michael Owen",
        "İngiltere",
        "ST",
        1996,
        2013,
        [
            "Premier Lig",
            "La Liga"
        ],
        92
    ],
    [
        "ian-wright",
        "Ian Wright",
        "İngiltere",
        "ST",
        1985,
        2000,
        [
            "Premier Lig",
            "İskoçya Ligi"
        ],
        90
    ],
    [
        "teddy-sheringham",
        "Teddy Sheringham",
        "İngiltere",
        "ST",
        1983,
        2008,
        [
            "Premier Lig"
        ],
        89
    ],
    [
        "david-platt",
        "David Platt",
        "İngiltere",
        "CM",
        1982,
        2001,
        [
            "Premier Lig",
            "Serie A"
        ],
        89
    ],
    [
        "joe-cole",
        "Joe Cole",
        "İngiltere",
        "AM",
        1998,
        2018,
        [
            "Premier Lig",
            "Ligue 1",
            "MLS"
        ],
        87
    ],
    [
        "jadon-sancho",
        "Jadon Sancho",
        "İngiltere",
        "RW",
        2017,
        2025,
        [
            "Bundesliga",
            "Premier Lig"
        ],
        87
    ],
    [
        "cole-palmer",
        "Cole Palmer",
        "İngiltere",
        "AM",
        2020,
        2025,
        [
            "Premier Lig"
        ],
        89
    ],
    [
        "phil-foden",
        "Phil Foden",
        "İngiltere",
        "AM",
        2017,
        2025,
        [
            "Premier Lig"
        ],
        91
    ],
    [
        "declan-rice",
        "Declan Rice",
        "İngiltere",
        "DM",
        2017,
        2025,
        [
            "Premier Lig"
        ],
        90
    ],
    [
        "dragan-dzajic",
        "Dragan Džajić",
        "Sırbistan",
        "LW",
        1963,
        1978,
        [
            "Yugoslav Ligi",
            "Ligue 1"
        ],
        95
    ],
    [
        "dejan-savicevic",
        "Dejan Savićević",
        "Karadağ",
        "AM",
        1983,
        2001,
        [
            "Yugoslav Ligi",
            "Serie A"
        ],
        92
    ],
    [
        "predrag-mijatovic",
        "Predrag Mijatović",
        "Karadağ",
        "ST",
        1987,
        2004,
        [
            "Yugoslav Ligi",
            "La Liga",
            "Serie A"
        ],
        91
    ],
    [
        "robert-prosinecki",
        "Robert Prosinečki",
        "Hırvatistan",
        "AM",
        1986,
        2004,
        [
            "Yugoslav Ligi",
            "La Liga",
            "Süper Lig"
        ],
        90
    ],
    [
        "davor-suker",
        "Davor Šuker",
        "Hırvatistan",
        "ST",
        1984,
        2003,
        [
            "Yugoslav Ligi",
            "La Liga",
            "Premier Lig",
            "Bundesliga"
        ],
        93
    ],
    [
        "zvonimir-boban",
        "Zvonimir Boban",
        "Hırvatistan",
        "AM",
        1985,
        2002,
        [
            "Yugoslav Ligi",
            "Serie A"
        ],
        92
    ],
    [
        "ivan-rakitic",
        "Ivan Rakitić",
        "Hırvatistan",
        "CM",
        2005,
        2025,
        [
            "İsviçre Ligi",
            "Bundesliga",
            "La Liga",
            "Suudi Ligi"
        ],
        91
    ],
    [
        "mario-mandzukic",
        "Mario Mandžukić",
        "Hırvatistan",
        "ST",
        2004,
        2021,
        [
            "Hırvatistan Ligi",
            "Bundesliga",
            "Serie A",
            "La Liga"
        ],
        91
    ],
    [
        "alen-boksic",
        "Alen Bokšić",
        "Hırvatistan",
        "ST",
        1987,
        2003,
        [
            "Yugoslav Ligi",
            "Ligue 1",
            "Serie A",
            "Premier Lig"
        ],
        90
    ],
    [
        "hristo-bonev",
        "Hristo Bonev",
        "Bulgaristan",
        "AM",
        1967,
        1982,
        [
            "Bulgaristan Ligi",
            "Yunanistan Ligi"
        ],
        91
    ],
    [
        "dimitar-berbatov",
        "Dimitar Berbatov",
        "Bulgaristan",
        "ST",
        1999,
        2018,
        [
            "Bulgaristan Ligi",
            "Bundesliga",
            "Premier Lig",
            "Ligue 1"
        ],
        91
    ],
    [
        "georgi-asparuhov",
        "Georgi Asparuhov",
        "Bulgaristan",
        "ST",
        1959,
        1971,
        [
            "Bulgaristan Ligi"
        ],
        93
    ],
    [
        "andriy-shevchenko",
        "Andriy Shevchenko",
        "Ukrayna",
        "ST",
        1994,
        2012,
        [
            "Ukrayna Ligi",
            "Serie A",
            "Premier Lig"
        ],
        94
    ],
    [
        "oleg-blokhin",
        "Oleg Blokhin",
        "Ukrayna",
        "LW",
        1969,
        1990,
        [
            "Sovyet Ligi",
            "Avusturya Ligi"
        ],
        95
    ],
    [
        "igor-belanov",
        "Igor Belanov",
        "Ukrayna",
        "ST",
        1981,
        1997,
        [
            "Sovyet Ligi",
            "Bundesliga",
            "Ukrayna Ligi"
        ],
        92
    ],
    [
        "anatoliy-tymoshchuk",
        "Anatoliy Tymoshchuk",
        "Ukrayna",
        "DM",
        1995,
        2016,
        [
            "Ukrayna Ligi",
            "Rusya Ligi",
            "Bundesliga"
        ],
        87
    ],
    [
        "hugo-sanchez",
        "Hugo Sánchez",
        "Meksika",
        "ST",
        1976,
        1997,
        [
            "Meksika Ligi",
            "La Liga",
            "MLS"
        ],
        95
    ],
    [
        "cuauhtemoc-blanco",
        "Cuauhtémoc Blanco",
        "Meksika",
        "AM",
        1992,
        2016,
        [
            "Meksika Ligi",
            "La Liga",
            "MLS"
        ],
        89
    ],
    [
        "rafael-marquez-lugo",
        "Rafael Márquez Lugo",
        "Meksika",
        "ST",
        2000,
        2015,
        [
            "Meksika Ligi"
        ],
        85
    ],
    [
        "javier-hernandez",
        "Javier Hernández",
        "Meksika",
        "ST",
        2006,
        2025,
        [
            "Meksika Ligi",
            "Premier Lig",
            "La Liga",
            "Bundesliga",
            "MLS"
        ],
        89
    ],
    [
        "carlos-vela",
        "Carlos Vela",
        "Meksika",
        "RW",
        2005,
        2024,
        [
            "Premier Lig",
            "La Liga",
            "MLS"
        ],
        89
    ],
    [
        "teofilo-cubillas",
        "Teófilo Cubillas",
        "Peru",
        "AM",
        1966,
        1989,
        [
            "Peru Ligi",
            "Portekiz Ligi",
            "ABD Ligi"
        ],
        94
    ],
    [
        "claudio-pizarro",
        "Claudio Pizarro",
        "Peru",
        "ST",
        1996,
        2020,
        [
            "Peru Ligi",
            "Bundesliga",
            "Premier Lig"
        ],
        91
    ],
    [
        "jefferson-farfan",
        "Jefferson Farfán",
        "Peru",
        "RW",
        2001,
        2021,
        [
            "Peru Ligi",
            "Hollanda Ligi",
            "Bundesliga",
            "Rusya Ligi"
        ],
        88
    ],
    [
        "carlos-valderrama",
        "Carlos Valderrama",
        "Kolombiya",
        "AM",
        1981,
        2002,
        [
            "Kolombiya Ligi",
            "Ligue 1",
            "La Liga",
            "MLS"
        ],
        92
    ],
    [
        "radamel-falcao",
        "Radamel Falcao",
        "Kolombiya",
        "ST",
        2005,
        2025,
        [
            "Arjantin Ligi",
            "Portekiz Ligi",
            "La Liga",
            "Ligue 1",
            "Premier Lig",
            "Süper Lig"
        ],
        92
    ],
    [
        "james-rodriguez",
        "James Rodríguez",
        "Kolombiya",
        "AM",
        2006,
        2025,
        [
            "Kolombiya Ligi",
            "Arjantin Ligi",
            "Portekiz Ligi",
            "Ligue 1",
            "La Liga",
            "Bundesliga",
            "Premier Lig"
        ],
        91
    ],
    [
        "freddy-rincon",
        "Freddy Rincón",
        "Kolombiya",
        "CM",
        1986,
        2004,
        [
            "Kolombiya Ligi",
            "Brezilya Ligi",
            "Serie A",
            "La Liga"
        ],
        89
    ],
    [
        "faustino-asprilla",
        "Faustino Asprilla",
        "Kolombiya",
        "ST",
        1988,
        2004,
        [
            "Kolombiya Ligi",
            "Serie A",
            "Premier Lig",
            "Brezilya Ligi"
        ],
        89
    ],
    [
        "enzo-francescoli",
        "Enzo Francescoli",
        "Uruguay",
        "AM",
        1980,
        1997,
        [
            "Uruguay Ligi",
            "Arjantin Ligi",
            "Ligue 1",
            "Serie A"
        ],
        94
    ],
    [
        "diego-forlan",
        "Diego Forlán",
        "Uruguay",
        "ST",
        1997,
        2018,
        [
            "Arjantin Ligi",
            "Premier Lig",
            "La Liga",
            "Serie A",
            "Japonya Ligi"
        ],
        93
    ],
    [
        "edinson-cavani",
        "Edinson Cavani",
        "Uruguay",
        "ST",
        2005,
        2025,
        [
            "Uruguay Ligi",
            "Serie A",
            "Ligue 1",
            "Premier Lig",
            "La Liga",
            "Arjantin Ligi"
        ],
        93
    ],
    [
        "alvaro-recoba",
        "Álvaro Recoba",
        "Uruguay",
        "AM",
        1994,
        2015,
        [
            "Uruguay Ligi",
            "Serie A"
        ],
        91
    ],
    [
        "luis-cubilla",
        "Luis Cubilla",
        "Uruguay",
        "RW",
        1957,
        1976,
        [
            "Uruguay Ligi",
            "La Liga",
            "Arjantin Ligi"
        ],
        91
    ],
    [
        "arthur-friedenreich",
        "Arthur Friedenreich",
        "Brezilya",
        "ST",
        1909,
        1935,
        [
            "Brezilya Ligi"
        ],
        94
    ],
    [
        "leonidas-da-silva",
        "Leônidas da Silva",
        "Brezilya",
        "ST",
        1929,
        1950,
        [
            "Brezilya Ligi",
            "Uruguay Ligi"
        ],
        95
    ],
    [
        "ademir-de-menezes",
        "Ademir de Menezes",
        "Brezilya",
        "ST",
        1939,
        1957,
        [
            "Brezilya Ligi"
        ],
        94
    ],
    [
        "zizinho",
        "Zizinho",
        "Brezilya",
        "AM",
        1939,
        1961,
        [
            "Brezilya Ligi"
        ],
        95
    ],
    [
        "tostao",
        "Tostão",
        "Brezilya",
        "ST",
        1963,
        1973,
        [
            "Brezilya Ligi"
        ],
        94
    ],
    [
        "careca",
        "Careca",
        "Brezilya",
        "ST",
        1978,
        1999,
        [
            "Brezilya Ligi",
            "Serie A",
            "Japonya Ligi"
        ],
        93
    ],
    [
        "bebeto",
        "Bebeto",
        "Brezilya",
        "ST",
        1983,
        2002,
        [
            "Brezilya Ligi",
            "La Liga",
            "Japonya Ligi"
        ],
        93
    ],
    [
        "adriano",
        "Adriano",
        "Brezilya",
        "ST",
        2000,
        2016,
        [
            "Brezilya Ligi",
            "Serie A",
            "Paraguay Ligi"
        ],
        91
    ],
    [
        "juninho-pernambucano",
        "Juninho Pernambucano",
        "Brezilya",
        "CM",
        1993,
        2013,
        [
            "Brezilya Ligi",
            "Ligue 1",
            "Katar Ligi"
        ],
        92
    ],
    [
        "juninho-paulista",
        "Juninho Paulista",
        "Brezilya",
        "AM",
        1993,
        2010,
        [
            "Brezilya Ligi",
            "Premier Lig",
            "La Liga",
            "İskoçya Ligi"
        ],
        89
    ],
    [
        "dunga",
        "Dunga",
        "Brezilya",
        "DM",
        1980,
        2000,
        [
            "Brezilya Ligi",
            "Serie A",
            "Bundesliga",
            "Japonya Ligi"
        ],
        92
    ],
    [
        "gilberto-silva",
        "Gilberto Silva",
        "Brezilya",
        "DM",
        1997,
        2013,
        [
            "Brezilya Ligi",
            "Premier Lig",
            "Yunanistan Ligi"
        ],
        90
    ],
    [
        "fernandinho",
        "Fernandinho",
        "Brezilya",
        "DM",
        2002,
        2025,
        [
            "Brezilya Ligi",
            "Ukrayna Ligi",
            "Premier Lig"
        ],
        89
    ],
    [
        "lucas-paqueta",
        "Lucas Paquetá",
        "Brezilya",
        "AM",
        2016,
        2025,
        [
            "Brezilya Ligi",
            "Serie A",
            "Ligue 1",
            "Premier Lig"
        ],
        87
    ],
    [
        "rodrygo",
        "Rodrygo",
        "Brezilya",
        "RW",
        2017,
        2025,
        [
            "Brezilya Ligi",
            "La Liga"
        ],
        90
    ],
    [
        "raphinha",
        "Raphinha",
        "Brezilya",
        "RW",
        2015,
        2025,
        [
            "Brezilya Ligi",
            "Portekiz Ligi",
            "Ligue 1",
            "Premier Lig",
            "La Liga"
        ],
        89
    ],
    [
        "omar-sivori",
        "Omar Sívori",
        "Arjantin",
        "ST",
        1954,
        1969,
        [
            "Arjantin Ligi",
            "Serie A"
        ],
        96
    ],
    [
        "jose-manuel-moreno",
        "José Manuel Moreno",
        "Arjantin",
        "AM",
        1935,
        1961,
        [
            "Arjantin Ligi",
            "Meksika Ligi",
            "Şili Ligi",
            "Kolombiya Ligi"
        ],
        96
    ],
    [
        "adolfo-pedernera",
        "Adolfo Pedernera",
        "Arjantin",
        "AM",
        1935,
        1955,
        [
            "Arjantin Ligi",
            "Kolombiya Ligi"
        ],
        95
    ],
    [
        "angel-labruna",
        "Ángel Labruna",
        "Arjantin",
        "ST",
        1939,
        1961,
        [
            "Arjantin Ligi",
            "Uruguay Ligi"
        ],
        94
    ],
    [
        "rene-houseman",
        "René Houseman",
        "Arjantin",
        "RW",
        1971,
        1985,
        [
            "Arjantin Ligi",
            "Şili Ligi"
        ],
        91
    ],
    [
        "daniel-bertoni",
        "Daniel Bertoni",
        "Arjantin",
        "RW",
        1971,
        1987,
        [
            "Arjantin Ligi",
            "La Liga",
            "Serie A"
        ],
        91
    ],
    [
        "jorge-valdano",
        "Jorge Valdano",
        "Arjantin",
        "ST",
        1975,
        1987,
        [
            "Arjantin Ligi",
            "La Liga"
        ],
        91
    ],
    [
        "claudio-caniggia",
        "Claudio Caniggia",
        "Arjantin",
        "RW",
        1985,
        2004,
        [
            "Arjantin Ligi",
            "Serie A",
            "Portekiz Ligi",
            "İskoçya Ligi"
        ],
        90
    ],
    [
        "ariel-ortega",
        "Ariel Ortega",
        "Arjantin",
        "AM",
        1991,
        2012,
        [
            "Arjantin Ligi",
            "La Liga",
            "Serie A",
            "Süper Lig"
        ],
        90
    ],
    [
        "juan-sebastian-veron",
        "Juan Sebastián Verón",
        "Arjantin",
        "CM",
        1994,
        2014,
        [
            "Arjantin Ligi",
            "Serie A",
            "Premier Lig"
        ],
        92
    ],
    [
        "pablo-aimar",
        "Pablo Aimar",
        "Arjantin",
        "AM",
        1996,
        2015,
        [
            "Arjantin Ligi",
            "La Liga",
            "Portekiz Ligi"
        ],
        91
    ],
    [
        "esteban-cambiasso",
        "Esteban Cambiasso",
        "Arjantin",
        "DM",
        1998,
        2017,
        [
            "Arjantin Ligi",
            "La Liga",
            "Serie A",
            "Premier Lig",
            "Yunanistan Ligi"
        ],
        90
    ],
    [
        "angel-di-maria",
        "Ángel Di María",
        "Arjantin",
        "RW",
        2005,
        2025,
        [
            "Arjantin Ligi",
            "Portekiz Ligi",
            "La Liga",
            "Premier Lig",
            "Ligue 1",
            "Serie A"
        ],
        94
    ],
    [
        "carlos-tevez",
        "Carlos Tévez",
        "Arjantin",
        "ST",
        2001,
        2021,
        [
            "Arjantin Ligi",
            "Brezilya Ligi",
            "Premier Lig",
            "Serie A",
            "Çin Ligi"
        ],
        93
    ],
    [
        "gonzalo-higuain",
        "Gonzalo Higuaín",
        "Arjantin",
        "ST",
        2005,
        2022,
        [
            "Arjantin Ligi",
            "La Liga",
            "Serie A",
            "Premier Lig",
            "MLS"
        ],
        92
    ],
    [
        "julian-alvarez",
        "Julián Álvarez",
        "Arjantin",
        "ST",
        2018,
        2025,
        [
            "Arjantin Ligi",
            "Premier Lig",
            "La Liga"
        ],
        90
    ],
    [
        "george-weah",
        "George Weah",
        "Liberya",
        "ST",
        1985,
        2003,
        [
            "Ligue 1",
            "Serie A",
            "Premier Lig"
        ],
        93
    ],
    [
        "abedi-pele",
        "Abedi Pelé",
        "Gana",
        "AM",
        1980,
        2000,
        [
            "Gana Ligi",
            "Ligue 1",
            "Serie A",
            "Bundesliga"
        ],
        92
    ],
    [
        "michael-essien",
        "Michael Essien",
        "Gana",
        "DM",
        2000,
        2019,
        [
            "Ligue 1",
            "Premier Lig",
            "La Liga",
            "Serie A"
        ],
        90
    ],
    [
        "asamoah-gyan",
        "Asamoah Gyan",
        "Gana",
        "ST",
        2003,
        2021,
        [
            "Serie A",
            "Ligue 1",
            "Premier Lig",
            "BAE Ligi",
            "Çin Ligi"
        ],
        88
    ],
    [
        "roger-milla",
        "Roger Milla",
        "Kamerun",
        "ST",
        1965,
        1996,
        [
            "Kamerun Ligi",
            "Ligue 1"
        ],
        93
    ],
    [
        "samuel-eto-o",
        "Samuel Eto'o",
        "Kamerun",
        "ST",
        1997,
        2019,
        [
            "La Liga",
            "Serie A",
            "Premier Lig",
            "Süper Lig",
            "Katar Ligi"
        ],
        94
    ],
    [
        "thomas-partey",
        "Thomas Partey",
        "Gana",
        "DM",
        2013,
        2025,
        [
            "La Liga",
            "Premier Lig"
        ],
        88
    ],
    [
        "yaya-toure",
        "Yaya Touré",
        "Fildişi Sahili",
        "CM",
        2001,
        2020,
        [
            "Ligue 1",
            "La Liga",
            "Premier Lig",
            "Yunanistan Ligi",
            "Çin Ligi"
        ],
        91
    ],
    [
        "kolo-toure",
        "Kolo Touré",
        "Fildişi Sahili",
        "CB",
        1999,
        2017,
        [
            "Premier Lig",
            "İskoçya Ligi"
        ],
        88
    ],
    [
        "didier-zokora",
        "Didier Zokora",
        "Fildişi Sahili",
        "DM",
        1999,
        2017,
        [
            "Ligue 1",
            "Premier Lig",
            "La Liga",
            "Süper Lig"
        ],
        87
    ],
    [
        "kalusha-bwalya",
        "Kalusha Bwalya",
        "Zambiya",
        "AM",
        1979,
        2000,
        [
            "Zambiya Ligi",
            "Belçika Ligi",
            "Hollanda Ligi",
            "Meksika Ligi"
        ],
        90
    ],
    [
        "riyad-mahrez",
        "Riyad Mahrez",
        "Cezayir",
        "RW",
        2009,
        2025,
        [
            "Ligue 1",
            "Premier Lig",
            "Suudi Ligi"
        ],
        90
    ],
    [
        "lakhdar-belloumi",
        "Lakhdar Belloumi",
        "Cezayir",
        "AM",
        1973,
        1999,
        [
            "Cezayir Ligi",
            "Katar Ligi"
        ],
        91
    ],
    [
        "rabah-madjer",
        "Rabah Madjer",
        "Cezayir",
        "ST",
        1975,
        1992,
        [
            "Cezayir Ligi",
            "Portekiz Ligi",
            "La Liga"
        ],
        92
    ],
    [
        "sadio-mane",
        "Sadio Mané",
        "Senegal",
        "LW",
        2011,
        2025,
        [
            "Ligue 2",
            "Avusturya Ligi",
            "Premier Lig",
            "Bundesliga",
            "Suudi Ligi"
        ],
        91
    ],
    [
        "el-hadji-diouf",
        "El Hadji Diouf",
        "Senegal",
        "ST",
        1998,
        2015,
        [
            "Ligue 1",
            "Premier Lig",
            "İskoçya Ligi"
        ],
        86
    ],
    [
        "jay-jay-okocha",
        "Jay-Jay Okocha",
        "Nijerya",
        "AM",
        1990,
        2008,
        [
            "Bundesliga",
            "Ligue 1",
            "Premier Lig",
            "Süper Lig",
            "Katar Ligi"
        ],
        89
    ],
    [
        "nwankwo-kanu",
        "Nwankwo Kanu",
        "Nijerya",
        "ST",
        1992,
        2012,
        [
            "Hollanda Ligi",
            "Serie A",
            "Premier Lig"
        ],
        90
    ],
    [
        "rashidi-yekini",
        "Rashidi Yekini",
        "Nijerya",
        "ST",
        1981,
        2003,
        [
            "Nijerya Ligi",
            "Portekiz Ligi",
            "La Liga",
            "Yunanistan Ligi"
        ],
        89
    ],
    [
        "john-obi-mikel",
        "John Obi Mikel",
        "Nijerya",
        "DM",
        2004,
        2021,
        [
            "Premier Lig",
            "Çin Ligi",
            "Süper Lig"
        ],
        87
    ],
    [
        "victor-ikpeba",
        "Victor Ikpeba",
        "Nijerya",
        "ST",
        1989,
        2005,
        [
            "Belçika Ligi",
            "Ligue 1",
            "Bundesliga"
        ],
        87
    ],
    [
        "mohamed-aboutrika",
        "Mohamed Aboutrika",
        "Mısır",
        "AM",
        1997,
        2013,
        [
            "Mısır Ligi",
            "BAE Ligi"
        ],
        91
    ],
    [
        "mohamed-salah",
        "Mohamed Salah",
        "Mısır",
        "RW",
        2010,
        2025,
        [
            "İsviçre Ligi",
            "Premier Lig",
            "Serie A"
        ],
        94
    ],
    [
        "cha-bum-kun",
        "Cha Bum-kun",
        "Güney Kore",
        "ST",
        1976,
        1989,
        [
            "Güney Kore Ligi",
            "Bundesliga"
        ],
        92
    ],
    [
        "park-ji-sung",
        "Park Ji-sung",
        "Güney Kore",
        "CM",
        2000,
        2014,
        [
            "Japonya Ligi",
            "Hollanda Ligi",
            "Premier Lig"
        ],
        89
    ],
    [
        "son-heung-min",
        "Son Heung-min",
        "Güney Kore",
        "LW",
        2010,
        2025,
        [
            "Bundesliga",
            "Premier Lig"
        ],
        91
    ],
    [
        "hidetoshi-nakata",
        "Hidetoshi Nakata",
        "Japonya",
        "AM",
        1995,
        2006,
        [
            "Japonya Ligi",
            "Serie A",
            "Premier Lig"
        ],
        87
    ],
    [
        "shunsuke-nakamura",
        "Shunsuke Nakamura",
        "Japonya",
        "AM",
        1997,
        2022,
        [
            "Japonya Ligi",
            "Serie A",
            "İskoçya Ligi",
            "La Liga"
        ],
        88
    ],
    [
        "keisuke-honda",
        "Keisuke Honda",
        "Japonya",
        "AM",
        2005,
        2021,
        [
            "Japonya Ligi",
            "Hollanda Ligi",
            "Rusya Ligi",
            "Serie A",
            "Meksika Ligi",
            "Brezilya Ligi"
        ],
        87
    ],
    [
        "shinji-kagawa",
        "Shinji Kagawa",
        "Japonya",
        "AM",
        2006,
        2025,
        [
            "Japonya Ligi",
            "Bundesliga",
            "Premier Lig",
            "Süper Lig",
            "La Liga"
        ],
        88
    ],
    [
        "kazuyoshi-miura",
        "Kazuyoshi Miura",
        "Japonya",
        "ST",
        1986,
        2025,
        [
            "Brezilya Ligi",
            "Japonya Ligi",
            "Serie A",
            "Hırvatistan Ligi",
            "Portekiz Ligi"
        ],
        86
    ],
    [
        "ali-daei",
        "Ali Daei",
        "İran",
        "ST",
        1988,
        2007,
        [
            "İran Ligi",
            "Bundesliga",
            "Katar Ligi"
        ],
        91
    ],
    [
        "mehdi-mahdavikia",
        "Mehdi Mahdavikia",
        "İran",
        "RW",
        1995,
        2013,
        [
            "İran Ligi",
            "Bundesliga"
        ],
        87
    ],
    [
        "tim-cahill",
        "Tim Cahill",
        "Avustralya",
        "AM",
        1998,
        2019,
        [
            "Premier Lig",
            "MLS",
            "Çin Ligi",
            "Avustralya Ligi"
        ],
        88
    ],
    [
        "harry-kewell",
        "Harry Kewell",
        "Avustralya",
        "LW",
        1996,
        2014,
        [
            "Premier Lig",
            "Süper Lig",
            "Avustralya Ligi"
        ],
        88
    ],
    [
        "mark-viduka",
        "Mark Viduka",
        "Avustralya",
        "ST",
        1993,
        2009,
        [
            "Avustralya Ligi",
            "Hırvatistan Ligi",
            "İskoçya Ligi",
            "Premier Lig"
        ],
        88
    ],
    [
        "wynton-rufer",
        "Wynton Rufer",
        "Yeni Zelanda",
        "ST",
        1980,
        1997,
        [
            "İsviçre Ligi",
            "Bundesliga",
            "Japonya Ligi"
        ],
        87
    ],
    [
        "landon-donovan",
        "Landon Donovan",
        "ABD",
        "AM",
        1999,
        2018,
        [
            "MLS",
            "Bundesliga",
            "Premier Lig",
            "Meksika Ligi"
        ],
        90
    ],
    [
        "clint-dempsey",
        "Clint Dempsey",
        "ABD",
        "AM",
        2004,
        2018,
        [
            "MLS",
            "Premier Lig"
        ],
        88
    ],
    [
        "christian-pulisic",
        "Christian Pulisic",
        "ABD",
        "RW",
        2015,
        2025,
        [
            "Bundesliga",
            "Premier Lig",
            "Serie A"
        ],
        89
    ],
    [
        "tim-howard",
        "Tim Howard",
        "ABD",
        "GK",
        1997,
        2019,
        [
            "MLS",
            "Premier Lig"
        ],
        88
    ],
    [
        "alphonso-davies",
        "Alphonso Davies",
        "Kanada",
        "LB",
        2016,
        2025,
        [
            "MLS",
            "Bundesliga"
        ],
        88
    ],
    [
        "dwight-yorke",
        "Dwight Yorke",
        "Trinidad ve Tobago",
        "ST",
        1989,
        2009,
        [
            "Premier Lig",
            "Avustralya Ligi"
        ],
        89
    ],
    [
        "keylor-navas",
        "Keylor Navas",
        "Kosta Rika",
        "GK",
        2005,
        2025,
        [
            "Kosta Rika Ligi",
            "La Liga",
            "Ligue 1",
            "Premier Lig"
        ],
        89
    ],
    [
        "paulo-wanchope",
        "Paulo Wanchope",
        "Kosta Rika",
        "ST",
        1994,
        2007,
        [
            "Kosta Rika Ligi",
            "Premier Lig",
            "La Liga",
            "MLS"
        ],
        86
    ],
    [
        "gheorghe-popescu",
        "Gheorghe Popescu",
        "Romanya",
        "CB",
        1984,
        2003,
        [
            "Romanya Ligi",
            "Hollanda Ligi",
            "La Liga",
            "Premier Lig",
            "Süper Lig"
        ],
        91
    ],
    [
        "adrian-mutu",
        "Adrian Mutu",
        "Romanya",
        "ST",
        1996,
        2016,
        [
            "Romanya Ligi",
            "Serie A",
            "Premier Lig",
            "Ligue 1"
        ],
        88
    ],
    [
        "miodrag-belodedici",
        "Miodrag Belodedici",
        "Romanya",
        "CB",
        1978,
        2001,
        [
            "Romanya Ligi",
            "Yugoslav Ligi",
            "La Liga",
            "Meksika Ligi"
        ],
        90
    ],
    [
        "lefter-kucukandonyadis",
        "Lefter Küçükandonyadis",
        "Türkiye",
        "RW",
        1947,
        1964,
        [
            "Süper Lig",
            "Serie A",
            "Ligue 1"
        ],
        92
    ],
    [
        "metin-oktay",
        "Metin Oktay",
        "Türkiye",
        "ST",
        1955,
        1969,
        [
            "Süper Lig",
            "Serie A"
        ],
        92
    ],
    [
        "can-bartu",
        "Can Bartu",
        "Türkiye",
        "AM",
        1955,
        1970,
        [
            "Süper Lig",
            "Serie A"
        ],
        91
    ],
    [
        "tanju-colak",
        "Tanju Çolak",
        "Türkiye",
        "ST",
        1982,
        1994,
        [
            "Süper Lig"
        ],
        89
    ],
    [
        "rdvan-dilmen",
        "Rıdvan Dilmen",
        "Türkiye",
        "RW",
        1979,
        1995,
        [
            "Süper Lig"
        ],
        89
    ],
    [
        "oguz-cetin",
        "Oğuz Çetin",
        "Türkiye",
        "CM",
        1981,
        2000,
        [
            "Süper Lig"
        ],
        88
    ],
    [
        "tugay-kerimoglu",
        "Tugay Kerimoğlu",
        "Türkiye",
        "CM",
        1987,
        2009,
        [
            "Süper Lig",
            "İskoçya Ligi",
            "Premier Lig"
        ],
        89
    ],
    [
        "emre-belozoglu",
        "Emre Belözoğlu",
        "Türkiye",
        "CM",
        1996,
        2020,
        [
            "Süper Lig",
            "Serie A",
            "Premier Lig",
            "La Liga"
        ],
        88
    ],
    [
        "yldray-basturk",
        "Yıldıray Baştürk",
        "Türkiye",
        "AM",
        1996,
        2010,
        [
            "Bundesliga",
            "Premier Lig"
        ],
        87
    ],
    [
        "nuri-sahin",
        "Nuri Şahin",
        "Türkiye",
        "CM",
        2005,
        2021,
        [
            "Bundesliga",
            "La Liga",
            "Premier Lig",
            "Hollanda Ligi",
            "Süper Lig"
        ],
        87
    ],
    [
        "burak-ylmaz",
        "Burak Yılmaz",
        "Türkiye",
        "ST",
        2002,
        2023,
        [
            "Süper Lig",
            "Çin Ligi",
            "Ligue 1",
            "Hollanda Ligi"
        ],
        88
    ],
    [
        "hamit-altntop",
        "HamIt Altıntop",
        "Türkiye",
        "CM",
        2000,
        2018,
        [
            "Bundesliga",
            "La Liga",
            "Süper Lig"
        ],
        87
    ],
    [
        "umit-davala",
        "Ümit Davala",
        "Türkiye",
        "RW",
        1994,
        2006,
        [
            "Süper Lig",
            "Serie A",
            "Bundesliga"
        ],
        86
    ],
    [
        "fatih-terim",
        "Fatih Terim",
        "Türkiye",
        "CB",
        1969,
        1985,
        [
            "Süper Lig"
        ],
        85
    ],
    [
        "senol-gunes",
        "Şenol Güneş",
        "Türkiye",
        "GK",
        1967,
        1987,
        [
            "Süper Lig"
        ],
        87
    ],
    [
        "volkan-demirel",
        "Volkan Demirel",
        "Türkiye",
        "GK",
        2000,
        2019,
        [
            "Süper Lig"
        ],
        86
    ],
    [
        "tuncay-sanl",
        "Tuncay Şanlı",
        "Türkiye",
        "ST",
        2000,
        2015,
        [
            "Süper Lig",
            "Premier Lig",
            "Bundesliga",
            "Katar Ligi"
        ],
        86
    ],
    [
        "semih-senturk",
        "Semih Şentürk",
        "Türkiye",
        "ST",
        1999,
        2018,
        [
            "Süper Lig"
        ],
        85
    ],
    [
        "gokdeniz-karadeniz",
        "Gökdeniz Karadeniz",
        "Türkiye",
        "RW",
        1997,
        2018,
        [
            "Süper Lig",
            "Rusya Ligi"
        ],
        87
    ],
    [
        "mehmet-aurelio",
        "Mehmet Aurelio",
        "Türkiye",
        "DM",
        1995,
        2013,
        [
            "Brezilya Ligi",
            "Süper Lig",
            "La Liga"
        ],
        86
    ]
];

  // İçerik denetimi için açık dışlama listesi. Yalnızca açıkça eklenen kimlikler filtrelenir;
  // uygulama hukuki veya siyasi ilişki tahmini yapmaz.
  const EXCLUDED_PLAYER_IDS = new Set(['hakan-sukur']);
  const normalizeName = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('tr').replace(/[^a-z0-9]+/g, ' ').trim();
  const seenNames = new Set();
  const players = [...rows, ...supplementalRows]
    .filter(([id]) => !EXCLUDED_PLAYER_IDS.has(id))
    .map(([id, name, nationality, position, activeStart, activeEnd, leagues, rating]) => ({
      id, name, nationality, position, activeStart, activeEnd, leagues, rating
    }))
    .filter(player => {
      const key = normalizeName(player.name);
      if (seenNames.has(key)) return false;
      seenNames.add(key);
      return true;
    });

  root.KRONOMETRE_EXCLUDED_PLAYER_IDS = Object.freeze([...EXCLUDED_PLAYER_IDS]);
  root.KRONOMETRE_PLAYERS = Object.freeze(players);
})(typeof window !== 'undefined' ? window : globalThis);
