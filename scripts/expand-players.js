'use strict';

/*
 * Oyuncu havuzu genişletme scripti (v6).
 * Format: "İsim|Milliyet|Mevki|Başlangıç|Bitiş|Lig1;Lig2|Puan"
 * - Kimlik ve isim bazında tekilleştirme yapar; mevcut kayıtlara dokunmaz.
 * - Engel listesi (EXCLUDED) korunur ve o isimler asla eklenmez.
 * Çalıştır: node scripts/expand-players.js
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'js', 'players.js');
const data = require(FILE);

const RAW = `
Gyula Grosics|Macaristan|GK|1947|1962|Macaristan Ligi|87
Antonio Carbajal|Meksika|GK|1948|1966|Meksika Ligi|84
Vladimir Beara|Yugoslavya|GK|1947|1960|Yugoslav Ligi|86
Gilmar|Brezilya|GK|1951|1969|Brezilya Ligi|88
Hilderaldo Bellini|Brezilya|CB|1952|1966|Brezilya Ligi|85
Nilton Santos|Brezilya|LB|1948|1964|Brezilya Ligi|92
Djalma Santos|Brezilya|RB|1948|1968|Brezilya Ligi|91
Jose Santamaria|Uruguay|CB|1949|1966|La Liga;Uruguay Ligi|88
Ernst Ocwirk|Avusturya|DM|1947|1961|Avusturya Ligi;Serie A|86
Juan Alberto Schiaffino|Uruguay|AM|1943|1962|Uruguay Ligi;Serie A|91
Jose Leandro Andrade|Uruguay|DM|1921|1933|Uruguay Ligi|89
Zizinho|Brezilya|AM|1939|1957|Brezilya Ligi|89
Ademir|Brezilya|ST|1942|1956|Brezilya Ligi|88
Jair da Rosa Pinto|Brezilya|LW|1943|1956|Brezilya Ligi|85
Telmo Zarra|İspanya|ST|1939|1957|La Liga|88
Laszlo Kubala|Macaristan|AM|1943|1961|La Liga;Macaristan Ligi|90
Nandor Hidegkuti|Macaristan|AM|1943|1958|Macaristan Ligi|90
Jozsef Bozsik|Macaristan|CM|1943|1962|Macaristan Ligi|89
Zoltan Czibor|Macaristan|LW|1943|1959|Macaristan Ligi;La Liga|87
Fritz Walter|Almanya|AM|1937|1959|Bundesliga|89
Helmut Rahn|Almanya|RW|1948|1963|Bundesliga|86
Karl-Heinz Schnellinger|Almanya|LB|1957|1974|Serie A;Bundesliga|85
Giacinto Facchetti|İtalya|LB|1960|1978|Serie A|91
Tarcisio Burgnich|İtalya|RB|1958|1977|Serie A|86
Sandro Salvadore|İtalya|CB|1957|1974|Serie A|84
Gianni Rivera|İtalya|AM|1958|1979|Serie A|90
Sandro Mazzola|İtalya|AM|1960|1977|Serie A|89
Luis Suarez Miramontes|İspanya|CM|1953|1973|La Liga;Serie A|90
Francisco Gento|İspanya|LW|1952|1971|La Liga|89
Jose Maria Zarraga|İspanya|CM|1949|1962|La Liga|80
Raymond Kopa|Fransa|AM|1949|1967|Ligue 1;La Liga|89
Just Fontaine|Fransa|ST|1950|1962|Ligue 1|88
Jean Tigana|Fransa|CM|1975|1991|Ligue 1|86
Luis Fernandez|Fransa|DM|1978|1993|Ligue 1|84
Alain Giresse|Fransa|AM|1970|1988|Ligue 1|86
Maxime Bossis|Fransa|CB|1973|1991|Ligue 1|83
Joel Bats|Fransa|GK|1976|1992|Ligue 1|83
Dominique Rocheteau|Fransa|ST|1971|1990|Ligue 1|83
Bobby Moore|İngiltere|CB|1958|1978|Premier Lig|93
Ray Wilson|İngiltere|LB|1952|1971|Premier Lig|84
George Cohen|İngiltere|RB|1956|1969|Premier Lig|83
Nobby Stiles|İngiltere|DM|1960|1975|Premier Lig|82
Martin Peters|İngiltere|AM|1959|1981|Premier Lig|84
Roger Hunt|İngiltere|ST|1958|1972|Premier Lig|85
Tom Finney|İngiltere|RW|1946|1960|Premier Lig|90
Nat Lofthouse|İngiltere|ST|1946|1960|Premier Lig|86
Duncan Edwards|İngiltere|CM|1953|1958|Premier Lig|90
John Charles|Galler|ST|1948|1966|Premier Lig;Serie A|89
Ivor Allchurch|Galler|AM|1947|1968|Premier Lig|82
Danny Blanchflower|Kuzey İrlanda|CM|1945|1964|Premier Lig|85
Jimmy McIlroy|Kuzey İrlanda|AM|1950|1968|Premier Lig|82
Billy Bremner|İskoçya|CM|1959|1982|Premier Lig|85
Denis Law|İskoçya|ST|1956|1974|Premier Lig;Serie A|90
Jim Baxter|İskoçya|CM|1957|1970|İskoçya Ligi|85
Willie Henderson|İskoçya|RW|1960|1979|İskoçya Ligi|80
John Greig|İskoçya|CB|1960|1978|İskoçya Ligi|81
Billy McNeill|İskoçya|CB|1957|1975|İskoçya Ligi|83
Jimmy Johnstone|İskoçya|RW|1961|1979|İskoçya Ligi|87
Bobby Lennox|İskoçya|LW|1961|1980|İskoçya Ligi|81
Tommy Gemmell|İskoçya|LB|1961|1977|İskoçya Ligi|81
Amancio Amaro|İspanya|RW|1958|1976|La Liga|85
Pirri|İspanya|CM|1964|1982|La Liga|85
Jose Angel Iribar|İspanya|GK|1962|1980|La Liga|86
Marcelino|İspanya|ST|1959|1974|La Liga|80
Wolfgang Overath|Almanya|AM|1962|1977|Bundesliga|87
Jurgen Grabowski|Almanya|RW|1962|1980|Bundesliga|84
Bernd Holzenbein|Almanya|LW|1967|1985|Bundesliga|82
Hans-Hubert Vogts|Almanya|RB|1965|1981|Bundesliga|87
Georg Schwarzenbeck|Almanya|CB|1966|1981|Bundesliga|83
Rainer Bonhof|Almanya|DM|1970|1986|Bundesliga|84
Manfred Kaltz|Almanya|RB|1971|1991|Bundesliga|85
Klaus Fischer|Almanya|ST|1968|1988|Bundesliga|85
Ulrich Stielike|Almanya|DM|1972|1988|Bundesliga;La Liga|84
Felix Magath|Almanya|AM|1972|1986|Bundesliga|83
Hans-Peter Briegel|Almanya|LB|1975|1988|Bundesliga;Serie A|84
Pierre Littbarski|Almanya|RW|1978|1997|Bundesliga;Japonya Ligi|85
Andreas Brehme|Almanya|LB|1980|1998|Bundesliga;Serie A|88
Guido Buchwald|Almanya|CB|1980|1999|Bundesliga;Japonya Ligi|84
Thomas Hassler|Almanya|AM|1984|2004|Bundesliga;Serie A|85
Karl-Heinz Riedle|Almanya|ST|1983|2001|Bundesliga;Serie A;Premier Lig|83
Andreas Moller|Almanya|AM|1985|2004|Bundesliga;Serie A|85
Ubaldo Fillol|Arjantin|GK|1966|1991|Arjantin Ligi|88
Daniel Passarella|Arjantin|CB|1971|1989|Arjantin Ligi;Serie A|90
Osvaldo Ardiles|Arjantin|CM|1973|1991|Arjantin Ligi;Premier Lig|85
Ricardo Villa|Arjantin|AM|1970|1988|Arjantin Ligi;Premier Lig|80
Leopoldo Luque|Arjantin|ST|1970|1984|Arjantin Ligi|82
Americo Gallego|Arjantin|DM|1973|1988|Arjantin Ligi|82
Jorge Olguin|Arjantin|RB|1970|1986|Arjantin Ligi|80
Alberto Tarantini|Arjantin|LB|1973|1989|Arjantin Ligi;Premier Lig|80
Rene Houseman|Arjantin|RW|1971|1985|Arjantin Ligi|83
Ramon Diaz|Arjantin|ST|1978|1995|Arjantin Ligi;Serie A;Japonya Ligi|85
Jorge Burruchaga|Arjantin|AM|1979|1998|Arjantin Ligi;Ligue 1|85
Sergio Batista|Arjantin|DM|1981|1999|Arjantin Ligi|82
Oscar Ruggeri|Arjantin|CB|1980|1997|Arjantin Ligi;La Liga|86
Nery Pumpido|Arjantin|GK|1976|1993|Arjantin Ligi|82
Claudio Caniggia|Arjantin|ST|1985|2004|Arjantin Ligi;Serie A;İskoçya Ligi|86
Fernando Redondo|Arjantin|DM|1985|2004|Arjantin Ligi;La Liga;Serie A|89
Abel Balbo|Arjantin|ST|1986|2003|Serie A;Arjantin Ligi|83
Diego Simeone|Arjantin|DM|1987|2006|Arjantin Ligi;Serie A;La Liga|87
Ariel Ortega|Arjantin|AM|1991|2012|Arjantin Ligi;La Liga|85
Roberto Ayala|Arjantin|CB|1992|2010|Serie A;La Liga|86
Walter Samuel|Arjantin|CB|1996|2014|Arjantin Ligi;Serie A|85
Esteban Cambiasso|Arjantin|DM|1995|2015|Serie A;La Liga|85
Rivelino|Brezilya|LW|1965|1981|Brezilya Ligi|92
Tostao|Brezilya|ST|1963|1973|Brezilya Ligi|90
Gerson|Brezilya|CM|1959|1974|Brezilya Ligi|89
Clodoaldo|Brezilya|DM|1966|1979|Brezilya Ligi|85
Felix|Brezilya|GK|1957|1978|Brezilya Ligi|78
Emerson Leao|Brezilya|GK|1966|1986|Brezilya Ligi|84
Ze Maria|Brezilya|RB|1966|1983|Brezilya Ligi|80
Luis Pereira|Brezilya|CB|1968|1984|Brezilya Ligi;La Liga|83
Toninho Cerezo|Brezilya|DM|1972|1997|Brezilya Ligi;Serie A|86
Eder|Brezilya|LW|1977|1993|Brezilya Ligi|84
Serginho Chulapa|Brezilya|ST|1973|1993|Brezilya Ligi|80
Junior|Brezilya|LB|1974|1993|Brezilya Ligi;Serie A|87
Leandro|Brezilya|RB|1978|1990|Brezilya Ligi|85
Oscar Bernardi|Brezilya|CB|1974|1990|Brezilya Ligi|82
Casagrande|Brezilya|ST|1980|1996|Brezilya Ligi;Serie A|81
Muller|Brezilya|RW|1983|2000|Brezilya Ligi;Serie A|83
Alemao|Brezilya|CM|1982|1996|Brezilya Ligi;Serie A|83
Branco|Brezilya|LB|1980|1997|Brezilya Ligi;Serie A|83
Jorginho|Brezilya|RB|1983|2002|Brezilya Ligi;Bundesliga;Japonya Ligi|84
Rai|Brezilya|AM|1984|2000|Brezilya Ligi;Ligue 1|86
Mauro Silva|Brezilya|DM|1988|2005|Brezilya Ligi;La Liga|85
Aldair|Brezilya|CB|1985|2005|Brezilya Ligi;Serie A|86
Claudio Taffarel|Brezilya|GK|1985|2003|Brezilya Ligi;Serie A;Süper Lig|86
Cesar Sampaio|Brezilya|DM|1987|2003|Brezilya Ligi;Japonya Ligi|81
Edmundo|Brezilya|ST|1992|2008|Brezilya Ligi;Serie A|83
Savio|Brezilya|LW|1993|2011|Brezilya Ligi;La Liga|82
Ze Roberto|Brezilya|LW|1994|2017|Brezilya Ligi;Bundesliga|85
Gilberto Silva|Brezilya|DM|1997|2013|Brezilya Ligi;Premier Lig;Yunanistan Ligi|85
Juan|Brezilya|CB|1995|2016|Brezilya Ligi;Bundesliga;Serie A|83
Belletti|Brezilya|RB|1994|2011|Brezilya Ligi;La Liga;Premier Lig|82
Grzegorz Lato|Polonya|RW|1966|1984|Polonya Ligi;Meksika Ligi|87
Kazimierz Deyna|Polonya|AM|1966|1984|Polonya Ligi;Premier Lig|88
Wlodzimierz Lubanski|Polonya|ST|1962|1985|Polonya Ligi;Belçika Ligi|86
Zbigniew Boniek|Polonya|AM|1975|1988|Polonya Ligi;Serie A|88
Andrzej Szarmach|Polonya|ST|1969|1985|Polonya Ligi;Ligue 1|83
Jan Tomaszewski|Polonya|GK|1966|1984|Polonya Ligi|83
Antonin Panenka|Çekya|AM|1967|1985|Çek Ligi;Avusturya Ligi|86
Ivo Viktor|Çekya|GK|1961|1977|Çek Ligi|84
Zdenek Nehoda|Çekya|ST|1969|1987|Çek Ligi|81
Pavel Nedved|Çekya|AM|1991|2009|Çek Ligi;Serie A|92
Karel Poborsky|Çekya|RW|1991|2007|Çek Ligi;Premier Lig;Portekiz Ligi|83
Vladimir Smicer|Çekya|AM|1992|2009|Çek Ligi;Ligue 1;Premier Lig|81
Patrik Berger|Çekya|AM|1991|2010|Çek Ligi;Bundesliga;Premier Lig|82
Milan Baros|Çekya|ST|1998|2020|Çek Ligi;Premier Lig;Süper Lig|82
Tomas Rosicky|Çekya|AM|1998|2017|Çek Ligi;Bundesliga;Premier Lig|85
Petr Cech|Çekya|GK|1999|2019|Çek Ligi;Ligue 1;Premier Lig|91
Oleg Blokhin|SSCB|LW|1969|1990|Sovyet Ligi|90
Rinat Dasayev|SSCB|GK|1976|1991|Sovyet Ligi;La Liga|88
Igor Belanov|SSCB|ST|1981|1997|Sovyet Ligi;Bundesliga|85
Aleksandr Zavarov|SSCB|AM|1977|1995|Sovyet Ligi;Serie A;Ligue 1|84
Vasiliy Rats|SSCB|LW|1979|1998|Sovyet Ligi;La Liga|81
Andrei Kanchelskis|Rusya|RW|1988|2006|Sovyet Ligi;Premier Lig;İskoçya Ligi|84
Valeri Karpin|Rusya|RW|1988|2005|Rusya Ligi;La Liga|82
Aleksandr Mostovoi|Rusya|AM|1987|2005|Rusya Ligi;La Liga|85
Viktor Onopko|Rusya|CB|1988|2006|Rusya Ligi;La Liga|81
Andrey Arshavin|Rusya|AM|1999|2018|Rusya Ligi;Premier Lig|85
Roman Pavlyuchenko|Rusya|ST|1999|2015|Rusya Ligi;Premier Lig|80
Igor Akinfeev|Rusya|GK|2003|2026|Rusya Ligi|84
Dragan Dzajic|Sırbistan|LW|1963|1979|Yugoslav Ligi;Ligue 1|89
Safet Susic|Bosna-Hersek|AM|1973|1992|Yugoslav Ligi;Ligue 1|88
Dragan Stojkovic|Sırbistan|AM|1981|2001|Yugoslav Ligi;Ligue 1;Japonya Ligi|88
Dejan Savicevic|Karadağ|AM|1982|2001|Yugoslav Ligi;Serie A|88
Predrag Mijatovic|Karadağ|ST|1987|2003|Yugoslav Ligi;La Liga|85
Sinisa Mihajlovic|Sırbistan|LB|1988|2006|Yugoslav Ligi;Serie A|85
Vladimir Jugovic|Sırbistan|CM|1989|2005|Yugoslav Ligi;Serie A|82
Alen Boksic|Hırvatistan|ST|1987|2003|Hırvatistan Ligi;Serie A;Premier Lig|85
Robert Prosinecki|Hırvatistan|AM|1987|2004|Yugoslav Ligi;La Liga;Hırvatistan Ligi|87
Robert Jarni|Hırvatistan|LB|1986|2003|Hırvatistan Ligi;Serie A;La Liga|82
Goran Vlaovic|Hırvatistan|ST|1990|2005|Hırvatistan Ligi;La Liga|79
Mario Stanic|Hırvatistan|RW|1989|2004|Hırvatistan Ligi;Premier Lig|79
Milan Rapaic|Hırvatistan|LW|1993|2008|Hırvatistan Ligi;Süper Lig|78
Hristo Bonev|Bulgaristan|AM|1963|1985|Bulgaristan Ligi|84
Dimitar Berbatov|Bulgaristan|ST|1996|2018|Bulgaristan Ligi;Bundesliga;Premier Lig|87
Krasimir Balakov|Bulgaristan|AM|1985|2003|Bulgaristan Ligi;Portekiz Ligi;Bundesliga|86
Yordan Letchkov|Bulgaristan|AM|1986|2003|Bulgaristan Ligi;Bundesliga;Süper Lig|81
Emil Kostadinov|Bulgaristan|RW|1985|2001|Bulgaristan Ligi;Portekiz Ligi;Bundesliga|81
Trifon Ivanov|Bulgaristan|CB|1984|2000|Bulgaristan Ligi;Avusturya Ligi|79
Gheorghe Popescu|Romanya|CB|1984|2003|Romanya Ligi;Hollanda Ligi;La Liga;Süper Lig|85
Dan Petrescu|Romanya|RB|1985|2003|Romanya Ligi;Premier Lig|83
Ilie Dumitrescu|Romanya|LW|1986|1999|Romanya Ligi;Premier Lig|80
Florin Raducioiu|Romanya|ST|1986|2001|Romanya Ligi;Serie A;Premier Lig|80
Miodrag Belodedici|Romanya|CB|1982|2001|Romanya Ligi;Yugoslav Ligi;La Liga|84
Adrian Mutu|Romanya|ST|1996|2016|Romanya Ligi;Serie A;Premier Lig|84
Cosmin Contra|Romanya|RB|1993|2011|Romanya Ligi;La Liga|79
Viorel Moldovan|Romanya|ST|1990|2006|Romanya Ligi;Süper Lig;Ligue 1|78
Ruud Krol|Hollanda|CB|1968|1986|Hollanda Ligi;Serie A|89
Wim Suurbier|Hollanda|RB|1964|1985|Hollanda Ligi|82
Arie Haan|Hollanda|CM|1968|1984|Hollanda Ligi;Belçika Ligi|84
Wim van Hanegem|Hollanda|CM|1963|1983|Hollanda Ligi|87
Rob Rensenbrink|Hollanda|LW|1965|1982|Hollanda Ligi;Belçika Ligi|87
Johnny Rep|Hollanda|RW|1969|1987|Hollanda Ligi;Ligue 1|84
Jan Jongbloed|Hollanda|GK|1962|1986|Hollanda Ligi|76
Wim Jansen|Hollanda|DM|1965|1982|Hollanda Ligi|82
Jan Wouters|Hollanda|DM|1980|1996|Hollanda Ligi;Bundesliga|82
Aron Winter|Hollanda|CM|1985|2003|Hollanda Ligi;Serie A|81
Wim Kieft|Hollanda|ST|1979|1994|Hollanda Ligi;Serie A|80
John van 't Schip|Hollanda|RW|1981|1996|Hollanda Ligi;Serie A|79
Bryan Roy|Hollanda|LW|1987|2000|Hollanda Ligi;Serie A;Premier Lig|79
Pierre van Hooijdonk|Hollanda|ST|1989|2007|Hollanda Ligi;Premier Lig;Süper Lig|82
Jaap Stam|Hollanda|CB|1992|2007|Hollanda Ligi;Premier Lig;Serie A|89
Michael Reiziger|Hollanda|RB|1990|2007|Hollanda Ligi;La Liga|81
Boudewijn Zenden|Hollanda|LW|1993|2011|Hollanda Ligi;La Liga;Premier Lig|80
Paul Van Himst|Belçika|AM|1959|1977|Belçika Ligi|87
Jan Ceulemans|Belçika|AM|1974|1992|Belçika Ligi|86
Eric Gerets|Belçika|RB|1971|1992|Belçika Ligi;Hollanda Ligi|84
Jean-Marie Pfaff|Belçika|GK|1972|1991|Belçika Ligi;Bundesliga|87
Michel Preud'homme|Belçika|GK|1977|1999|Belçika Ligi;Portekiz Ligi|86
Franky Van der Elst|Belçika|DM|1977|1999|Belçika Ligi|81
Enzo Scifo|Belçika|AM|1982|2001|Belçika Ligi;Serie A;Ligue 1|87
Luc Nilis|Belçika|ST|1984|2000|Belçika Ligi;Hollanda Ligi|84
Marc Wilmots|Belçika|ST|1985|2003|Belçika Ligi;Bundesliga|82
Daniel Van Buyten|Belçika|CB|1997|2014|Belçika Ligi;Ligue 1;Bundesliga|82
Timmy Simons|Belçika|DM|1995|2017|Belçika Ligi;Hollanda Ligi|78
Henning Jensen|Danimarka|ST|1968|1982|Danimarka Ligi;Bundesliga;La Liga|82
Allan Simonsen|Danimarka|RW|1966|1989|Danimarka Ligi;Bundesliga;La Liga|88
Frank Arnesen|Danimarka|AM|1975|1988|Hollanda Ligi;La Liga|83
Soren Lerby|Danimarka|CM|1975|1993|Hollanda Ligi;Bundesliga|83
Morten Olsen|Danimarka|CB|1970|1989|Belçika Ligi;Bundesliga|84
Preben Elkjaer|Danimarka|ST|1976|1990|Belçika Ligi;Serie A|88
Jesper Olsen|Danimarka|LW|1977|1992|Hollanda Ligi;Premier Lig|81
John Sivebaek|Danimarka|RB|1979|1995|Danimarka Ligi;Premier Lig|78
Jan Molby|Danimarka|CM|1980|1998|Hollanda Ligi;Premier Lig|83
Flemming Povlsen|Danimarka|ST|1984|1995|Danimarka Ligi;Bundesliga|81
John Jensen|Danimarka|CM|1983|1999|Danimarka Ligi;Premier Lig|78
Thomas Helveg|Danimarka|RB|1989|2010|Danimarka Ligi;Serie A|81
Ebbe Sand|Danimarka|ST|1992|2006|Danimarka Ligi;Bundesliga|82
Jon Dahl Tomasson|Danimarka|ST|1992|2011|Danimarka Ligi;Hollanda Ligi;Serie A|83
Dennis Rommedahl|Danimarka|RW|1996|2015|Hollanda Ligi;Premier Lig|79
Gunnar Nordahl|İsveç|ST|1940|1958|İsveç Ligi;Serie A|91
Gunnar Gren|İsveç|AM|1937|1958|İsveç Ligi;Serie A|88
Nils Liedholm|İsveç|CM|1942|1961|İsveç Ligi;Serie A|89
Kurt Hamrin|İsveç|RW|1951|1971|İsveç Ligi;Serie A|88
Ove Kindvall|İsveç|ST|1962|1976|İsveç Ligi;Hollanda Ligi|82
Ralf Edstrom|İsveç|ST|1969|1984|İsveç Ligi;Hollanda Ligi|81
Glenn Hysen|İsveç|CB|1977|1992|İsveç Ligi;Serie A;Premier Lig|81
Glenn Stromberg|İsveç|CM|1978|1992|İsveç Ligi;Serie A|80
Anders Limpar|İsveç|LW|1985|2001|İsveç Ligi;Premier Lig|80
Jonas Thern|İsveç|CM|1984|1998|İsveç Ligi;Portekiz Ligi;Serie A|80
Martin Dahlin|İsveç|ST|1988|2000|İsveç Ligi;Bundesliga|80
Kennet Andersson|İsveç|ST|1988|2001|İsveç Ligi;Serie A|80
Patrik Andersson|İsveç|CB|1988|2004|İsveç Ligi;Bundesliga;La Liga|82
Stefan Schwarz|İsveç|DM|1987|2003|İsveç Ligi;Premier Lig;La Liga|80
Freddie Ljungberg|İsveç|RW|1994|2012|İsveç Ligi;Premier Lig|85
Olof Mellberg|İsveç|CB|1995|2014|İsveç Ligi;La Liga;Premier Lig|82
Kim Kallstrom|İsveç|CM|1999|2017|İsveç Ligi;Ligue 1|79
Rune Bratseth|Norveç|CB|1980|1995|Norveç Ligi;Bundesliga|83
Erik Thorstvedt|Norveç|GK|1982|1996|Norveç Ligi;Premier Lig|79
Oyvind Leonhardsen|Norveç|CM|1989|2007|Norveç Ligi;Premier Lig|78
Tore Andre Flo|Norveç|ST|1993|2012|Norveç Ligi;Premier Lig;İskoçya Ligi|81
Steffen Iversen|Norveç|ST|1995|2011|Norveç Ligi;Premier Lig|78
John Carew|Norveç|ST|1998|2011|Norveç Ligi;La Liga;Premier Lig|81
Matthias Sindelar|Avusturya|ST|1924|1939|Avusturya Ligi|91
Gerhard Hanappi|Avusturya|CM|1947|1965|Avusturya Ligi|85
Hans Krankl|Avusturya|ST|1970|1989|Avusturya Ligi;La Liga|86
Herbert Prohaska|Avusturya|CM|1972|1989|Avusturya Ligi;Serie A|84
Toni Polster|Avusturya|ST|1982|2000|Avusturya Ligi;La Liga;Bundesliga|83
Andreas Herzog|Avusturya|AM|1986|2004|Avusturya Ligi;Bundesliga|83
Anton Ondrus|Slovakya|CB|1968|1984|Çek Ligi|82
Marek Hamsik|Slovakya|CM|2004|2023|Serie A;Çin Ligi|86
Martin Skrtel|Slovakya|CB|2001|2022|Rusya Ligi;Premier Lig;Süper Lig|82
Milan Skriniar|Slovakya|CB|2012|2026|Serie A;Ligue 1|85
Jozef Adamec|Slovakya|ST|1959|1977|Çek Ligi|80
Ferenc Bene|Macaristan|ST|1961|1985|Macaristan Ligi|83
Florian Albert|Macaristan|ST|1958|1974|Macaristan Ligi|88
Lajos Detari|Macaristan|AM|1980|2000|Macaristan Ligi;Bundesliga;Yunanistan Ligi|83
Tibor Nyilasi|Macaristan|AM|1972|1988|Macaristan Ligi;Avusturya Ligi|83
Mehmet Oguz Cetin|Türkiye|CM|1987|2001|Süper Lig|78
Ridvan Dilmen|Türkiye|ST|1979|1994|Süper Lig|84
Tanju Colak|Türkiye|ST|1980|1996|Süper Lig|85
Metin Oktay|Türkiye|ST|1954|1969|Süper Lig|87
Lefter Kucukandonyadis|Türkiye|AM|1943|1965|Süper Lig|87
Can Bartu|Türkiye|AM|1955|1970|Süper Lig;Serie A|85
Cemil Turan|Türkiye|ST|1968|1981|Süper Lig|81
Senol Gunes|Türkiye|GK|1970|1987|Süper Lig|81
Tugay Kerimoglu|Türkiye|CM|1990|2009|Süper Lig;İskoçya Ligi;Premier Lig|83
Alpay Ozalan|Türkiye|CB|1991|2008|Süper Lig;Premier Lig|80
Okan Buruk|Türkiye|RW|1991|2011|Süper Lig;Serie A|80
Ergun Penbe|Türkiye|LB|1992|2007|Süper Lig|76
Umit Davala|Türkiye|RW|1991|2004|Süper Lig;Serie A;Bundesliga|79
Yildiray Basturk|Türkiye|AM|1997|2013|Bundesliga|82
Nihat Kahveci|Türkiye|ST|1997|2011|Süper Lig;La Liga|82
Tuncay Sanli|Türkiye|ST|1999|2013|Süper Lig;Premier Lig|80
Hamit Altintop|Türkiye|CM|2000|2017|Bundesliga;La Liga;Süper Lig|82
Nuri Sahin|Türkiye|CM|2005|2021|Bundesliga;La Liga;Süper Lig|82
Volkan Demirel|Türkiye|GK|2000|2019|Süper Lig|79
Gokhan Gonul|Türkiye|RB|2003|2021|Süper Lig|78
Selcuk Inan|Türkiye|CM|2003|2021|Süper Lig|78
Burak Yilmaz|Türkiye|ST|2002|2023|Süper Lig;Ligue 1|82
Caglar Soyuncu|Türkiye|CB|2014|2026|Bundesliga;Premier Lig;La Liga|81
Salih Ucan|Türkiye|CM|2011|2026|Süper Lig;Serie A|74
Roger Milla|Kamerun|ST|1970|1996|Kamerun Ligi;Ligue 1|87
Thomas Nkono|Kamerun|GK|1973|1997|Kamerun Ligi;La Liga|85
Joseph-Antoine Bell|Kamerun|GK|1975|1994|Kamerun Ligi;Ligue 1|82
Cyrille Makanaky|Kamerun|AM|1983|1997|Ligue 1;La Liga|77
Francois Omam-Biyik|Kamerun|ST|1984|2003|Ligue 1;Meksika Ligi|80
Patrick Mboma|Kamerun|ST|1992|2005|Ligue 1;Japonya Ligi;Serie A|82
Geremi|Kamerun|CM|1995|2011|La Liga;Premier Lig|80
Lauren|Kamerun|RB|1995|2010|La Liga;Premier Lig|81
Rigobert Song|Kamerun|CB|1993|2010|Ligue 1;Premier Lig;Süper Lig|80
Abedi Pele|Gana|AM|1978|2000|Gana Ligi;Ligue 1;Süper Lig|88
Tony Yeboah|Gana|ST|1981|2002|Gana Ligi;Bundesliga;Premier Lig|84
Anthony Baffoe|Gana|CB|1983|1999|Bundesliga|75
Sammy Kuffour|Gana|CB|1991|2009|Bundesliga;Serie A|83
Stephen Appiah|Gana|CM|1995|2015|Serie A;Süper Lig|81
Sulley Muntari|Gana|CM|2000|2019|Serie A;Premier Lig|81
Kwadwo Asamoah|Gana|LB|2008|2022|Serie A|80
Andre Ayew|Gana|LW|2007|2026|Ligue 1;Premier Lig|79
Rashidi Yekini|Nijerya|ST|1981|2005|Nijerya Ligi;Portekiz Ligi|82
Daniel Amokachi|Nijerya|ST|1988|2002|Nijerya Ligi;Belçika Ligi;Premier Lig|80
Emmanuel Amuneke|Nijerya|LW|1987|2002|Nijerya Ligi;Portekiz Ligi;La Liga|80
Sunday Oliseh|Nijerya|DM|1989|2006|Nijerya Ligi;Serie A;Hollanda Ligi|81
Finidi George|Nijerya|RW|1989|2004|Nijerya Ligi;Hollanda Ligi;La Liga|82
Taribo West|Nijerya|CB|1991|2008|Ligue 1;Serie A|79
Celestine Babayaro|Nijerya|LB|1994|2008|Belçika Ligi;Premier Lig|79
Nwankwo Kanu|Nijerya|ST|1992|2012|Hollanda Ligi;Serie A;Premier Lig|85
Victor Ikpeba|Nijerya|ST|1990|2004|Ligue 1|78
Wilson Oruma|Nijerya|CM|1993|2009|Ligue 1|76
Obafemi Martins|Nijerya|ST|2000|2018|Serie A;Premier Lig;MLS|80
Vincent Enyeama|Nijerya|GK|1999|2018|Nijerya Ligi;Ligue 1|81
Mikel John Obi|Nijerya|DM|2004|2022|Premier Lig;Çin Ligi|81
Ahmed Musa|Nijerya|LW|2008|2026|Rusya Ligi;Premier Lig;Suudi Ligi|77
Kalusha Bwalya|Zambiya|LW|1980|2000|Zambiya Ligi;Hollanda Ligi;Meksika Ligi|83
Hossam Hassan|Mısır|ST|1985|2008|Mısır Ligi;Yunanistan Ligi|82
Mohamed Aboutrika|Mısır|AM|1998|2013|Mısır Ligi|84
Essam El-Hadary|Mısır|GK|1993|2018|Mısır Ligi|80
Ahmed Hassan|Mısır|CM|1995|2013|Mısır Ligi;Süper Lig;Belçika Ligi|80
Mohamed Barakat|Mısır|AM|1996|2012|Mısır Ligi|77
Rabah Madjer|Cezayir|ST|1976|1992|Cezayir Ligi;Portekiz Ligi|85
Lakhdar Belloumi|Cezayir|AM|1976|1993|Cezayir Ligi|84
Salah Assad|Cezayir|LW|1976|1990|Cezayir Ligi;Ligue 1|79
Riyad Mahrez|Cezayir|RW|2009|2026|Ligue 1;Premier Lig;Suudi Ligi|87
Islam Slimani|Cezayir|ST|2008|2025|Portekiz Ligi;Premier Lig|78
Yacine Brahimi|Cezayir|LW|2008|2025|La Liga;Portekiz Ligi;Katar Ligi|79
George Weah|Liberya|ST|1985|2003|Ligue 1;Serie A;Premier Lig|93
Hugo Sanchez|Meksika|ST|1976|1997|Meksika Ligi;La Liga|91
Rafael Marquez|Meksika|CB|1996|2018|Meksika Ligi;Ligue 1;La Liga|86
Cuauhtemoc Blanco|Meksika|AM|1992|2015|Meksika Ligi;La Liga|84
Jorge Campos|Meksika|GK|1988|2004|Meksika Ligi;MLS|81
Claudio Suarez|Meksika|CB|1988|2009|Meksika Ligi;MLS|80
Luis Garcia Postigo|Meksika|ST|1987|2002|Meksika Ligi;La Liga|79
Carlos Hermosillo|Meksika|ST|1983|2001|Meksika Ligi|80
Luis Hernandez|Meksika|ST|1991|2004|Meksika Ligi;MLS|79
Pavel Pardo|Meksika|DM|1993|2012|Meksika Ligi;Bundesliga|79
Gerardo Torrado|Meksika|DM|1997|2017|Meksika Ligi;La Liga|77
Andres Guardado|Meksika|CM|2005|2024|Meksika Ligi;La Liga;Hollanda Ligi|81
Hector Herrera|Meksika|CM|2011|2026|Portekiz Ligi;La Liga;MLS|80
Guillermo Ochoa|Meksika|GK|2004|2026|Meksika Ligi;Ligue 1;La Liga|82
Carlos Vela|Meksika|LW|2007|2024|La Liga;MLS|82
Hirving Lozano|Meksika|LW|2014|2026|Meksika Ligi;Hollanda Ligi;Serie A|82
Raul Jimenez|Meksika|ST|2011|2026|Meksika Ligi;Premier Lig|81
Elias Figueroa|Şili|CB|1964|1982|Şili Ligi;Brezilya Ligi;Uruguay Ligi|90
Ivan Zamorano|Şili|ST|1985|2003|Şili Ligi;La Liga;Serie A|86
Marcelo Salas|Şili|ST|1993|2008|Şili Ligi;Arjantin Ligi;Serie A|86
Jorge Valdivia|Şili|AM|2001|2020|Şili Ligi;Brezilya Ligi|79
Claudio Bravo|Şili|GK|2002|2024|Şili Ligi;La Liga;Premier Lig|83
Gary Medel|Şili|DM|2006|2026|Şili Ligi;La Liga;Serie A|80
Charles Aranguiz|Şili|CM|2007|2025|Şili Ligi;Bundesliga|80
Eduardo Vargas|Şili|ST|2008|2026|Şili Ligi;Meksika Ligi|78
Mauricio Isla|Şili|RB|2007|2025|Serie A;Süper Lig|78
Carlos Valderrama|Kolombiya|AM|1981|2002|Kolombiya Ligi;Ligue 1;MLS|89
Freddy Rincon|Kolombiya|CM|1986|2004|Kolombiya Ligi;Brezilya Ligi;Serie A|83
Faustino Asprilla|Kolombiya|ST|1989|2004|Kolombiya Ligi;Serie A;Premier Lig|84
Rene Higuita|Kolombiya|GK|1985|2010|Kolombiya Ligi|82
Andres Escobar|Kolombiya|CB|1985|1994|Kolombiya Ligi|81
Ivan Cordoba|Kolombiya|CB|1993|2012|Kolombiya Ligi;Serie A|83
Mario Yepes|Kolombiya|CB|1997|2016|Kolombiya Ligi;Ligue 1;Serie A|80
Juan Pablo Angel|Kolombiya|ST|1993|2014|Kolombiya Ligi;Premier Lig;MLS|79
Giovanni Hernandez|Kolombiya|AM|1997|2015|Kolombiya Ligi|76
Abel Aguilar|Kolombiya|CM|2002|2019|Kolombiya Ligi;La Liga|76
Teofilo Gutierrez|Kolombiya|ST|2005|2024|Kolombiya Ligi;Arjantin Ligi|78
Carlos Bacca|Kolombiya|ST|2006|2025|Kolombiya Ligi;La Liga;Serie A|81
Hector Chumpitaz|Peru|CB|1963|1984|Peru Ligi|85
Teofilo Cubillas|Peru|AM|1966|1989|Peru Ligi;MLS|89
Hugo Sotil|Peru|ST|1968|1984|Peru Ligi;La Liga|81
Cesar Cueto|Peru|AM|1972|1992|Peru Ligi;Kolombiya Ligi|80
Nolberto Solano|Peru|RW|1992|2012|Peru Ligi;Premier Lig|81
Claudio Pizarro|Peru|ST|1996|2020|Peru Ligi;Bundesliga|84
Jefferson Farfan|Peru|RW|2001|2021|Peru Ligi;Hollanda Ligi;Bundesliga|80
Paolo Guerrero|Peru|ST|2002|2024|Bundesliga;Brezilya Ligi|81
Romerito|Paraguay|AM|1977|1995|Paraguay Ligi;Brezilya Ligi;MLS|84
Jose Luis Chilavert|Paraguay|GK|1982|2004|Paraguay Ligi;Arjantin Ligi;Ligue 1|87
Carlos Gamarra|Paraguay|CB|1991|2008|Paraguay Ligi;Brezilya Ligi;Serie A|83
Celso Ayala|Paraguay|CB|1991|2006|Paraguay Ligi;Arjantin Ligi|79
Roque Santa Cruz|Paraguay|ST|1997|2021|Paraguay Ligi;Bundesliga;Premier Lig|81
Nelson Valdez|Paraguay|ST|2002|2018|Bundesliga;La Liga|76
Justo Villar|Paraguay|GK|1996|2018|Paraguay Ligi;Şili Ligi|78
Enzo Francescoli|Uruguay|AM|1980|1997|Uruguay Ligi;Arjantin Ligi;Ligue 1;Serie A|90
Ruben Sosa|Uruguay|ST|1982|2002|Uruguay Ligi;La Liga;Serie A|84
Ruben Paz|Uruguay|AM|1977|1996|Uruguay Ligi;Brezilya Ligi;Arjantin Ligi|82
Paolo Montero|Uruguay|CB|1990|2007|Uruguay Ligi;Serie A|84
Alvaro Recoba|Uruguay|AM|1994|2015|Uruguay Ligi;Serie A|85
Dario Silva|Uruguay|ST|1991|2005|Uruguay Ligi;La Liga;Premier Lig|78
Diego Lugano|Uruguay|CB|1999|2017|Uruguay Ligi;Brezilya Ligi;Süper Lig|81
Maxi Pereira|Uruguay|RB|2002|2021|Uruguay Ligi;Portekiz Ligi|79
Cristian Rodriguez|Uruguay|LW|2002|2021|Uruguay Ligi;Portekiz Ligi;La Liga|78
Egidio Arevalo Rios|Uruguay|DM|2003|2019|Uruguay Ligi;Meksika Ligi|76
Fernando Muslera|Uruguay|GK|2007|2026|Uruguay Ligi;Serie A;Süper Lig|83
Martin Caceres|Uruguay|CB|2007|2025|Uruguay Ligi;La Liga;Serie A|79
Kazuyoshi Miura|Japonya|ST|1986|2024|Japonya Ligi;Brezilya Ligi|80
Hidetoshi Nakata|Japonya|AM|1995|2006|Japonya Ligi;Serie A|85
Shunsuke Nakamura|Japonya|AM|1997|2022|Japonya Ligi;Serie A;İskoçya Ligi|83
Shinji Ono|Japonya|AM|1998|2023|Japonya Ligi;Hollanda Ligi|81
Junichi Inamoto|Japonya|DM|1997|2019|Japonya Ligi;Premier Lig|77
Keisuke Honda|Japonya|AM|2005|2021|Japonya Ligi;Rusya Ligi;Serie A|83
Shinji Kagawa|Japonya|AM|2006|2024|Japonya Ligi;Bundesliga;Premier Lig|84
Makoto Hasebe|Japonya|DM|2002|2024|Japonya Ligi;Bundesliga|80
Yuto Nagatomo|Japonya|LB|2007|2026|Japonya Ligi;Serie A;Süper Lig|79
Maya Yoshida|Japonya|CB|2007|2026|Japonya Ligi;Premier Lig;MLS|78
Cha Bum-kun|Güney Kore|ST|1971|1989|Güney Kore Ligi;Bundesliga|88
Hong Myung-bo|Güney Kore|CB|1990|2004|Güney Kore Ligi;Japonya Ligi;MLS|84
Yoo Sang-chul|Güney Kore|CM|1994|2006|Güney Kore Ligi;Japonya Ligi|78
Ahn Jung-hwan|Güney Kore|ST|1998|2012|Güney Kore Ligi;Serie A|78
Park Ji-sung|Güney Kore|CM|2000|2014|Japonya Ligi;Hollanda Ligi;Premier Lig|84
Lee Young-pyo|Güney Kore|LB|2000|2013|Hollanda Ligi;Premier Lig|78
Ki Sung-yueng|Güney Kore|CM|2007|2025|İskoçya Ligi;Premier Lig|78
Ali Daei|İran|ST|1988|2007|İran Ligi;Bundesliga|84
Khodadad Azizi|İran|ST|1990|2005|İran Ligi;Bundesliga|77
Mehdi Mahdavikia|İran|RW|1994|2013|İran Ligi;Bundesliga|81
Ali Karimi|İran|AM|1996|2014|İran Ligi;Bundesliga;BAE Ligi|82
Javad Nekounam|İran|CM|1998|2015|İran Ligi;La Liga|79
Sardar Azmoun|İran|ST|2011|2026|Rusya Ligi;Bundesliga|79
Mehdi Taremi|İran|ST|2010|2026|İran Ligi;Portekiz Ligi;Serie A|82
Majed Abdullah|Suudi Arabistan|ST|1977|1998|Suudi Ligi|84
Sami Al-Jaber|Suudi Arabistan|ST|1988|2008|Suudi Ligi|80
Saeed Al-Owairan|Suudi Arabistan|AM|1988|2001|Suudi Ligi|79
Mohamed Al-Deayea|Suudi Arabistan|GK|1988|2010|Suudi Ligi|78
Yasser Al-Qahtani|Suudi Arabistan|ST|1999|2019|Suudi Ligi|78
Salem Al-Dawsari|Suudi Arabistan|LW|2011|2026|Suudi Ligi|79
Harry Kewell|Avustralya|LW|1995|2014|Premier Lig;Süper Lig|83
Mark Viduka|Avustralya|ST|1993|2009|Hırvatistan Ligi;İskoçya Ligi;Premier Lig|82
Tim Cahill|Avustralya|AM|1997|2018|Premier Lig;MLS;Çin Ligi|81
Mark Schwarzer|Avustralya|GK|1990|2016|Avustralya Ligi;Premier Lig|81
Lucas Neill|Avustralya|CB|1995|2014|Premier Lig;Süper Lig|77
Brett Emerton|Avustralya|RW|1996|2014|Hollanda Ligi;Premier Lig|77
Mile Jedinak|Avustralya|DM|2006|2019|Avustralya Ligi;Süper Lig;Premier Lig|77
Mathew Ryan|Avustralya|GK|2010|2026|Belçika Ligi;La Liga;Premier Lig|78
Landon Donovan|ABD|AM|1999|2016|MLS;Bundesliga|83
Clint Dempsey|ABD|ST|2004|2018|MLS;Premier Lig|81
Tim Howard|ABD|GK|1998|2019|MLS;Premier Lig|82
Kasey Keller|ABD|GK|1990|2011|MLS;Premier Lig;Bundesliga|80
Brad Friedel|ABD|GK|1992|2015|MLS;Premier Lig;Süper Lig|82
Claudio Reyna|ABD|CM|1994|2008|Bundesliga;İskoçya Ligi;Premier Lig|79
Tab Ramos|ABD|AM|1988|2002|MLS;La Liga|76
Eric Wynalda|ABD|ST|1989|2002|MLS;Bundesliga|76
DaMarcus Beasley|ABD|LW|1999|2019|MLS;Hollanda Ligi;İskoçya Ligi|77
Michael Bradley|ABD|DM|2004|2021|MLS;Serie A;Süper Lig|78
Jozy Altidore|ABD|ST|2006|2023|MLS;Hollanda Ligi;Premier Lig|77
Hristo Stoichkov|Bulgaristan|LW|1982|2003|Bulgaristan Ligi;La Liga;MLS|93
Peter Rufai|Nijerya|GK|1981|2000|Nijerya Ligi;Portekiz Ligi;La Liga|78
Jay-Jay Okocha|Nijerya|AM|1990|2008|Nijerya Ligi;Bundesliga;Ligue 1;Premier Lig|87
Bruce Grobbelaar|Zimbabve|GK|1979|1998|Premier Lig|80
Peter Ndlovu|Zimbabve|ST|1988|2011|Premier Lig;Güney Afrika Ligi|76
Doctor Khumalo|Güney Afrika|AM|1987|2004|Güney Afrika Ligi;MLS|78
Lucas Radebe|Güney Afrika|CB|1989|2005|Güney Afrika Ligi;Premier Lig|81
Benni McCarthy|Güney Afrika|ST|1995|2013|Güney Afrika Ligi;Hollanda Ligi;Portekiz Ligi;Premier Lig|82
Steven Pienaar|Güney Afrika|AM|1999|2017|Güney Afrika Ligi;Hollanda Ligi;Premier Lig|79
Quinton Fortune|Güney Afrika|LW|1995|2010|La Liga;Premier Lig|77
Aaron Mokoena|Güney Afrika|DM|1998|2013|Belçika Ligi;Premier Lig|75
Didier Zokora|Fildişi Sahili|DM|1998|2016|Belçika Ligi;Premier Lig;Süper Lig|79
Kolo Toure|Fildişi Sahili|CB|1999|2017|Premier Lig|83
Emmanuel Eboue|Fildişi Sahili|RB|2002|2016|Belçika Ligi;Premier Lig;Süper Lig|78
Aruna Dindane|Fildişi Sahili|ST|1999|2013|Belçika Ligi;Ligue 1|76
Salomon Kalou|Fildişi Sahili|LW|2003|2021|Hollanda Ligi;Premier Lig;Bundesliga|80
Gervinho|Fildişi Sahili|LW|2005|2023|Ligue 1;Premier Lig;Serie A|80
Wilfried Zaha|Fildişi Sahili|LW|2010|2026|Premier Lig;Süper Lig|81
Frederic Kanoute|Mali|ST|1997|2013|Ligue 1;Premier Lig;La Liga|82
Seydou Keita|Mali|CM|1997|2017|Ligue 1;La Liga|81
Mahamadou Diarra|Mali|DM|1998|2014|Ligue 1;La Liga|80
Mohamed Sissoko|Mali|DM|2003|2019|La Liga;Premier Lig;Serie A|77
El Hadji Diouf|Senegal|ST|1998|2015|Ligue 1;Premier Lig|79
Khalilou Fadiga|Senegal|AM|1994|2010|Belçika Ligi;Ligue 1|77
Henri Camara|Senegal|ST|1998|2014|Ligue 1;Premier Lig|76
Papa Bouba Diop|Senegal|DM|1998|2013|Ligue 1;Premier Lig|78
Tony Sylva|Senegal|GK|1995|2011|Ligue 1;Süper Lig|75
Demba Ba|Senegal|ST|2005|2021|Bundesliga;Premier Lig;Süper Lig|81
Papiss Cisse|Senegal|ST|2004|2021|Bundesliga;Premier Lig;Çin Ligi|78
Idrissa Gueye|Senegal|DM|2008|2026|Ligue 1;Premier Lig|82
Ivan Hurtado|Ekvador|CB|1992|2014|Kolombiya Ligi;Meksika Ligi|78
Agustin Delgado|Ekvador|ST|1994|2010|Meksika Ligi;Premier Lig|76
Antonio Valencia|Ekvador|RW|2003|2021|Premier Lig|82
Enner Valencia|Ekvador|ST|2010|2026|Meksika Ligi;Premier Lig;Süper Lig|80
Jaouad Zairi|Fas|RW|1999|2013|Ligue 1;Süper Lig|74
Mustapha Hadji|Fas|AM|1992|2010|Ligue 1;Premier Lig|81
Noureddine Naybet|Fas|CB|1989|2006|Fas Ligi;La Liga;Premier Lig|82
Marouane Chamakh|Fas|ST|2002|2016|Ligue 1;Premier Lig|76
Mbark Boussoufa|Fas|AM|2004|2020|Belçika Ligi;Rusya Ligi|78
Mehdi Benatia|Fas|CB|2005|2021|Serie A;Bundesliga|82
Nordin Amrabat|Fas|RW|2006|2023|Hollanda Ligi;Süper Lig;La Liga|76
Younes Belhanda|Fas|AM|2009|2024|Ligue 1;Süper Lig|78
Hakim Ziyech|Fas|AM|2012|2026|Hollanda Ligi;Premier Lig;Süper Lig|84
Romain Saiss|Fas|CB|2012|2026|Ligue 1;Premier Lig;Süper Lig|78
Sofyan Amrabat|Fas|DM|2015|2026|Hollanda Ligi;Serie A|80
Wilson Palacios|Honduras|DM|2003|2016|Premier Lig|77
Amado Guevara|Honduras|AM|1994|2012|Honduras Ligi;MLS|76
Carlos Pavon|Honduras|ST|1993|2011|Honduras Ligi;Meksika Ligi|75
Paulo Wanchope|Kosta Rika|ST|1993|2007|Kosta Rika Ligi;Premier Lig|79
Bryan Ruiz|Kosta Rika|AM|2003|2022|Kosta Rika Ligi;Hollanda Ligi;Premier Lig|79
Keylor Navas|Kosta Rika|GK|2005|2026|Kosta Rika Ligi;La Liga;Ligue 1|87
Celso Borges|Kosta Rika|CM|2005|2026|Kosta Rika Ligi;La Liga|75
Dwight Yorke|Trinidad ve Tobago|ST|1989|2009|Premier Lig;Avustralya Ligi|83
Russell Latapy|Trinidad ve Tobago|AM|1988|2009|Portekiz Ligi;İskoçya Ligi|76
Shaka Hislop|Trinidad ve Tobago|GK|1992|2007|Premier Lig|76
Stern John|Trinidad ve Tobago|ST|1995|2012|MLS;Premier Lig|74
Georgi Kinkladze|Gürcistan|AM|1991|2006|Premier Lig|80
Kakha Kaladze|Gürcistan|CB|1993|2012|Ukrayna Ligi;Serie A|83
Shota Arveladze|Gürcistan|ST|1990|2008|Hollanda Ligi;İskoçya Ligi;Süper Lig|79
Levan Kobiashvili|Gürcistan|CM|1995|2014|Bundesliga|77
Khvicha Kvaratskhelia|Gürcistan|LW|2017|2026|Rusya Ligi;Serie A;Ligue 1|87
Andriy Husin|Ukrayna|CM|1993|2012|Ukrayna Ligi|75
Serhiy Rebrov|Ukrayna|ST|1992|2009|Ukrayna Ligi;Premier Lig;Süper Lig|82
Oleh Luzhnyi|Ukrayna|RB|1988|2003|Ukrayna Ligi;Premier Lig|77
Anatoliy Tymoshchuk|Ukrayna|DM|1995|2016|Ukrayna Ligi;Rusya Ligi;Bundesliga|80
Yevhen Konoplyanka|Ukrayna|LW|2007|2022|Ukrayna Ligi;La Liga;Bundesliga|79
Andriy Yarmolenko|Ukrayna|RW|2008|2026|Ukrayna Ligi;Bundesliga;Premier Lig|80
Henrikh Mkhitaryan|Ermenistan|AM|2006|2026|Ukrayna Ligi;Bundesliga;Premier Lig;Serie A|85
Valentin Iordanescu|Romanya|CM|1968|1982|Romanya Ligi|76
Marius Lacatus|Romanya|RW|1982|2000|Romanya Ligi;Serie A|82
Stefan Iovan|Romanya|RB|1978|1995|Romanya Ligi|76
Helmuth Duckadam|Romanya|GK|1978|1991|Romanya Ligi|78
Eusebio|Portekiz|ST|1957|1979|Portekiz Ligi;MLS|95
Mario Coluna|Portekiz|CM|1954|1970|Portekiz Ligi|88
Jose Aguas|Portekiz|ST|1947|1964|Portekiz Ligi|84
Antonio Simoes|Portekiz|LW|1958|1976|Portekiz Ligi;MLS|83
Jaime Graca|Portekiz|CM|1960|1975|Portekiz Ligi|79
Vitor Baia|Portekiz|GK|1988|2007|Portekiz Ligi;La Liga|87
Fernando Couto|Portekiz|CB|1987|2008|Portekiz Ligi;Serie A;La Liga|85
Paulo Sousa|Portekiz|CM|1989|2002|Portekiz Ligi;Serie A;Bundesliga|84
Joao Pinto|Portekiz|AM|1988|2008|Portekiz Ligi|82
Sergio Conceicao|Portekiz|RW|1991|2010|Portekiz Ligi;Serie A|81
Abel Xavier|Portekiz|RB|1990|2008|Portekiz Ligi;Premier Lig|75
Maniche|Portekiz|CM|1995|2011|Portekiz Ligi;Rusya Ligi;La Liga|82
Simao Sabrosa|Portekiz|LW|1997|2016|Portekiz Ligi;La Liga|82
Raul Meireles|Portekiz|CM|2000|2016|Portekiz Ligi;Premier Lig;Süper Lig|81
Jose Bosingwa|Portekiz|RB|2000|2016|Portekiz Ligi;Premier Lig;Süper Lig|78
Hugo Almeida|Portekiz|ST|2002|2019|Portekiz Ligi;Bundesliga;Süper Lig|77
Danny|Portekiz|AM|2001|2018|Portekiz Ligi;Rusya Ligi|79
Joao Moutinho|Portekiz|CM|2004|2026|Portekiz Ligi;Ligue 1;Premier Lig|83
William Carvalho|Portekiz|DM|2011|2026|Portekiz Ligi;La Liga|81
Ivan Rakitic|Hırvatistan|CM|2005|2025|Bundesliga;La Liga|86
Mario Mandzukic|Hırvatistan|ST|2007|2021|Hırvatistan Ligi;Bundesliga;Serie A|84
Dejan Lovren|Hırvatistan|CB|2006|2024|Hırvatistan Ligi;Premier Lig;Rusya Ligi|80
Sime Vrsaljko|Hırvatistan|RB|2010|2023|Hırvatistan Ligi;Serie A;La Liga|79
Danijel Subasic|Hırvatistan|GK|2003|2020|Hırvatistan Ligi;Ligue 1|80
Nikola Kalinic|Hırvatistan|ST|2007|2023|Hırvatistan Ligi;Serie A|77
Andrej Kramaric|Hırvatistan|ST|2009|2026|Hırvatistan Ligi;Bundesliga|82
Marcelo Brozovic|Hırvatistan|DM|2010|2026|Hırvatistan Ligi;Serie A;Suudi Ligi|84
Mateo Kovacic|Hırvatistan|CM|2010|2026|Hırvatistan Ligi;Serie A;Premier Lig|84
Josko Gvardiol|Hırvatistan|CB|2019|2026|Hırvatistan Ligi;Bundesliga;Premier Lig|85
Milan Galic|Sırbistan|ST|1955|1972|Yugoslav Ligi|82
Velibor Vasovic|Sırbistan|CB|1958|1971|Yugoslav Ligi;Hollanda Ligi|82
Branko Oblak|Slovenya|CM|1965|1983|Yugoslav Ligi;Bundesliga|79
Srecko Katanec|Slovenya|DM|1981|1994|Yugoslav Ligi;Serie A|79
Zlatko Zahovic|Slovenya|AM|1989|2005|Portekiz Ligi;La Liga|82
Samir Handanovic|Slovenya|GK|2003|2023|Serie A|85
Jan Oblak|Slovenya|GK|2009|2026|Portekiz Ligi;La Liga|91
Josip Ilicic|Slovenya|AM|2007|2025|Serie A|82
Benjamin Sesko|Slovenya|ST|2019|2026|Avusturya Ligi;Bundesliga|82
`;

const TR_MAP = { 'ç':'c','Ç':'c','ğ':'g','Ğ':'g','ı':'i','İ':'i','ö':'o','Ö':'o','ş':'s','Ş':'s','ü':'u','Ü':'u','á':'a','â':'a','ã':'a','ä':'a','é':'e','è':'e','ê':'e','í':'i','î':'i','ï':'i','ó':'o','ô':'o','õ':'o','ú':'u','û':'u','ñ':'n',"'":'' };
const slugify = name => name.toLowerCase().split('').map(ch => TR_MAP[ch] ?? ch).join('')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const normName = name => slugify(name);

const existingIds = new Set(data.players.map(p => p.id));
const existingNames = new Set(data.players.map(p => normName(p.name)));
const excluded = new Set(data.excluded);

const added = [];
for (const line of RAW.trim().split('\n')) {
  const [name, nationality, position, start, end, leagues, rating] = line.split('|');
  if (!name || !rating) continue;
  const id = slugify(name);
  if (excluded.has(id) || existingIds.has(id) || existingNames.has(normName(name))) continue;
  existingIds.add(id);
  existingNames.add(normName(name));
  added.push({
    id, name: name.trim(), nationality: nationality.trim(), position: position.trim(),
    activeStart: Number(start), activeEnd: Number(end),
    leagues: leagues.split(';').map(s => s.trim()).filter(Boolean),
    rating: Number(rating), source: 'v6-curated'
  });
}

const all = [...data.players, ...added];
const body = all.map(p => JSON.stringify(p)).join(',');
const out = `(function(root,factory){const data=factory();if(typeof module==="object"&&module.exports)module.exports=data;if(root){root.KRONOMETRE_PLAYERS=Object.freeze(data.players);root.KRONOMETRE_EXCLUDED_PLAYER_IDS=Object.freeze(data.excluded);}})(typeof window!=="undefined"?window:globalThis,function(){"use strict";const EXCLUDED=${JSON.stringify(data.excluded)};const players=[${body}];return Object.freeze({players:Object.freeze(players),excluded:Object.freeze(EXCLUDED)});});`;
fs.writeFileSync(FILE, out);
console.log(`Eklenen: ${added.length} · Toplam: ${all.length}`);
