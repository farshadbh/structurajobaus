/*
 * The coverage list: 500 universities from Wikidata - institution, country and
 * official website. Ordered by how many Wikipedia language editions carry the
 * institution, a public proxy for prominence: it is not QS, because
 * topuniversities.com blocks automated reads from a server.
 *
 * One line per institution: Name|Country|domain.
 *
 * The filters below removed 168 rows before this file was written: institutions
 * that exist only in a historical state (Soviet Union, German Reich, Abbasid
 * Caliphate...), defunct institutions, museums and abbeys, music and fine-arts
 * conservatoires, entries with no website, and duplicates.
 *
 * Wikidata typing is imperfect and so is this list: a handful of entries are
 * specialist colleges (arts, medicine, languages) rather than engineering
 * schools. Each one is a single line to fix, and corrections are welcome.
 *
 * Staff are not implied by this list. A university shows a supervisor count only
 * when people from its own staff pages have been transcribed into
 * data/academics, which is what keeps the emails on this site real.
 */

export const UNIVERSITIES_RAW = `
Massachusetts Institute of Technology|United States|mit.edu
Federal University of Science and Innovation of Minas Gerais|Brazil|cefetmg.br
State University of Minas Gerais|Brazil|uemg.br
Pontifícia Universidade Católica de Minas Gerais|Brazil|pucminas.br
University of Vienna|Austria|univie.ac.at
University of London|United Kingdom|london.ac.uk
Hebrew University of Jerusalem|Israel|international.huji.ac.il
Kyoto University|Japan|kyoto-u.ac.jp
California Institute of Technology|United States|caltech.edu
Charles University|Czech Republic|cuni.cz
Leiden University|Netherlands|universiteitleiden.nl
Jagiellonian University|Poland|uj.edu.pl
Duke University|United States|duke.edu
Uppsala University|Sweden|uu.se
University of Tartu|Estonia|ut.ee
Baku State University|Azerbaijan|bsu.edu.az
Tsinghua University|People's Republic of China|tsinghua.edu.cn
University of Pula|Croatia|unipu.hr
University of al-Qarawiyyin|Morocco|uaq.ma
University of Manchester|United Kingdom|manchester.ac.uk
University of Calcutta|India|caluniv.ac.in
Imperial College London|United Kingdom|imperial.ac.uk
University of Zurich|Switzerland|uzh.ch
University of Amsterdam|Netherlands|uva.nl
University of Warsaw|Poland|uw.edu.pl
Cairo University|Egypt|cu.edu.eg
University of Padua|Italy|unipd.it
Nanyang Technological University|Singapore|ntu.edu.sg
Karolinska Institutet|Sweden|ki.se
National Autonomous University of Mexico|Mexico|unam.mx
University of Cape Town|South Africa|uct.ac.za
University of Delhi|India|du.ac.in
University of Graz|Austria|uni-graz.at
National and Kapodistrian University of Athens|Greece|uoa.gr
University of Osaka|Japan|osaka-u.ac.jp
University of Turin|Italy|unito.it
Kim Il-sung University|North Korea|ryongnamsan.edu.kp
Michigan State University|United States|msu.edu
Moscow State Institute of International Relations|Russia|english.mgimo.ru
University of California, Davis|United States|ucdavis.edu
Trinity College|United Kingdom|trin.cam.ac.uk
Geneva Graduate Institute|Switzerland|graduateinstitute.ch
Zhejiang University|People's Republic of China|zju.edu.cn
University of Wrocław|Poland|uwr.edu.pl
Arizona State University|United States|asu.edu
University of the Witwatersrand|South Africa|wits.ac.za
Newcastle University|United Kingdom|ncl.ac.uk
Peoples' Friendship University of Russia|Russia|cn.rudn.ru
University of São Paulo|Brazil|usp.br
University of Gothenburg|Sweden|gu.se
Maastricht University|Netherlands|maastrichtuniversity.nl
University of Indonesia|Indonesia|ui.ac.id
University of Kansas|United States|ku.edu
Tufts University|United States|tufts.edu
University of Florence|Italy|unifi.it
Shanghai Jiao Tong University|People's Republic of China|en.sjtu.edu.cn
Umeå University|Sweden|umu.se
University of Leicester|United Kingdom|le.ac.uk
Université libre de Bruxelles|Belgium|ulb.be
Universiti Malaya|Malaysia|um.edu.my
Norwegian University of Science and Technology|Norway|ntnu.no
Virginia Tech|United States|vt.edu
University of Rochester|United States|rochester.edu
Institut national des langues et civilisations orientales|France|inalco.fr
University of Western Australia|Australia|uwa.edu.au
Kabul University|Afghanistan|ku.edu.af
University of California, Santa Cruz|United States|ucsc.edu
Airlangga University|Indonesia|unair.ac.id
University of Siena|Italy|unisi.it
Vrije Universiteit Brussel|Belgium|vub.be
Technion – Israel Institute of Technology|Israel|technion.ac.il
University of Bergen|Norway|uib.no
National University of Kharkiv|Ukraine|karazin.ua
The Chinese University of Hong Kong|People's Republic of China|cuhk.edu.hk
Stellenbosch University|South Africa|su.ac.za
University of Greenland|Greenland|uni.gl
University of Lancaster|United Kingdom|lancs.ac.uk
Brandeis University|United States|brandeis.edu
University of Georgia|United States|uga.edu
Linköping University|Sweden|liu.se
Vrije Universiteit Amsterdam|Netherlands|vu.nl
Kuban State University|Russia|kubsu.ru
Babeș-Bolyai University|Romania|ubbcluj.ro
University of Miami|United States|welcome.miami.edu
University of Oklahoma|United States|ou.edu
Tulane University|United States|tulane.edu
Queen's University Belfast|United Kingdom|qub.ac.uk
Tallinn University of Technology|Estonia|taltech.ee
Boston College|United States|bc.edu
University of Canterbury|New Zealand|canterbury.ac.nz
Kyushu University|Japan|kyushu-u.ac.jp
University of Bath|United Kingdom|bath.ac.uk
Adam Mickiewicz University in Poznań|Poland|amu.edu.pl
University of Pretoria|South Africa|up.ac.za
California State University|United States|calstate.edu
National University of Kyiv-Mohyla Academy|Ukraine|ukma.edu.ua
Odesa University|Ukraine|onu.edu.ua
King Saud University|Saudi Arabia|ksu.edu.sa
Royal Institute of Technology|Sweden|kth.se
Pontifical Catholic University of Chile|Chile|uc.cl
Hokkaido University|Japan|global.hokudai.ac.jp
University of Westminster|United Kingdom|westminster.ac.uk
Temple University|United States|temple.edu
Northeastern University|United States|northeastern.edu
University of Reading|United Kingdom|reading.ac.uk
Wellesley College|United States|wellesley.edu
George Mason University|United States|gmu.edu
Radboud University|Netherlands|ru.nl
University of Debrecen|Hungary|unideb.hu
University for Peace|Costa Rica|upeace.org
Auburn University|United States|auburn.edu
Chalmers University of Technology|Sweden|chalmers.se
Eindhoven University of Technology|Netherlands|tue.nl
Ca' Foscari University of Venice|Italy|unive.it
University of Tennessee|United States|utk.edu
Ritsumeikan University|Japan|ritsumei.jp
Alexandru Ioan Cuza University|Romania|uaic.ro
Gadjah Mada University|Indonesia|ugm.ac.id
Middle East Technical University|Turkey|metu.edu.tr
Addis Ababa University|Ethiopia|aau.edu.et
University of Surrey|United Kingdom|surrey.ac.uk
Malmö University|Sweden|mau.se
Beijing Foreign Studies University|People's Republic of China|global.bfsu.edu.cn
University of Antwerp|Belgium|uantwerpen.be
University of Salzburg|Austria|plus.ac.at
University of Gdańsk|Poland|en.ug.edu.pl
City, University of London|United Kingdom|web.city.ac.uk
Ain Shams University|Egypt|asu.edu.eg
University of Fort Hare|South Africa|ufh.ac.za
Gallaudet University|United States|gallaudet.edu
Heriot-Watt University|United Kingdom|hw.ac.uk
University of Genoa|Italy|unige.it
University of Palermo|Italy|unipa.it
University of Dundee|United Kingdom|dundee.ac.uk
Azerbaijan Technical University|Azerbaijan|aztu.az
University of Juba|South Sudan|jubauni.net
University of Ferrara|Italy|unife.it
University of Łódź|Poland|en.uni.lodz.pl
King Abdulaziz University|Saudi Arabia|kau.edu.sa
University of Johannesburg|South Africa|uj.ac.za
University of Neuchâtel|Switzerland|unine.ch
University of South Africa|South Africa|unisa.ac.za
University of Perugia|Italy|unipg.it
Smith College|United States|smith.edu
University of Jyväskylä|Finland|jyu.fi
University of the Basque Country|Spain|ehu.eus
University of Twente|Netherlands|utwente.nl
University of the South Pacific|Fiji|usp.ac.fj
Shenzhen University|People's Republic of China|szu.edu.cn
University of Greenwich|United Kingdom|gre.ac.uk
Visva-Bharati University|India|visvabharati.ac.in
University of Science and Technology of China|People's Republic of China|ustc.edu.cn
University of California, Merced|United States|ucmerced.edu
University of Catania|Italy|unict.it
Bandung Institute of Technology|Indonesia|itb.ac.id
Illinois Institute of Technology|United States|iit.edu
Osmania University|India|osmania.ac.in
University of Erfurt|Germany|uni-erfurt.de
National University of Mongolia|Mongolia|num.edu.mn
University of Zaragoza|Spain|unizar.es
Bryn Mawr College|United States|brynmawr.edu
Warsaw University of Technology|Poland|pw.edu.pl
Middlesex University|United Kingdom|mdx.ac.uk
University of Messina|Italy|unime.it
University of Massachusetts Amherst|United States|umass.edu
Kaunas University of Technology|Lithuania|ktu.edu
San Francisco State University|United States|sfsu.edu
University of Botswana|Botswana|ub.bw
Tongji University|People's Republic of China|en.tongji.edu.cn
French-Azerbaijani University|Azerbaijan|ufaz.az
University of Stavanger|Norway|uis.no
Coventry University|United Kingdom|coventry.ac.uk
National Technical University of Athens|Greece|ntua.gr
Ulster University|United Kingdom|ulster.ac.uk
Northern Illinois University|United States|niu.edu
Aalborg University|Denmark|aau.dk
Kingston University|United Kingdom|kingston.ac.uk
National University of Uzbekistan named after Mirzo Ulugbek|Uzbekistan|nuu.uz
Reykjavík University|Iceland|ru.is
University of KwaZulu-Natal|South Africa|ukzn.ac.za
University of Khartoum|Sudan|uofk.edu
Tribhuvan University|Nepal|tribhuvan-university.edu.np
University of Bradford|United Kingdom|brad.ac.uk
University of Colorado|United States|cu.edu
Utah State University|United States|usu.edu
Hong Kong Polytechnic University|People's Republic of China|polyu.edu.hk
Wake Forest University|United States|wfu.edu
Jilin University|People's Republic of China|jlu.edu.cn
University of Wales|United Kingdom|wales.ac.uk
University of Pécs|Hungary|international.pte.hu
Binghamton University|United States|binghamton.edu
Loyola University Chicago|United States|luc.edu
Lehigh University|United States|www2.lehigh.edu
Utah Valley University|United States|uvu.edu
National Central University|Taiwan|ncu.edu.tw
University of Zadar|Croatia|unizd.hr
University of Mostar|Bosnia and Herzegovina|sum.ba
International Islamic University Malaysia|Malaysia|iium.edu.my
Lviv Polytechnic|Ukraine|lpnu.ua
Manchester Metropolitan University|United Kingdom|mmu.ac.uk
Universidade Tecnológica Federal do Paraná|Brazil|utfpr.edu.br
University of Kinshasa|Democratic Republic of the Congo|unikin.ac.cd
Norwegian University of Life Sciences|Norway|nmbu.no
National University of Ostroh Academy|Ukraine|oa.edu.ua
Plekhanov Russian Economic University|Russia|rea.ru
University of Aleppo|Syria|alepuniv.edu.sy
University of Silesia in Katowice|Poland|us.edu.pl
Hankuk University of Foreign Studies|South Korea|hufs.ac.kr
University of Limerick|Ireland|ul.ie
Corvinus University of Budapest|Hungary|uni-corvinus.hu
San Sebastián University|Chile|uss.cl
Swedish University of Agricultural Sciences|Sweden|slu.se
Catholic University of the Most Holy Conception|Chile|ucsc.cl
University of Bari|Italy|uniba.it
Igor Sikorsky Kyiv Polytechnic Institute|Ukraine|kpi.ua
University of San Francisco|United States|usfca.edu
University of Brighton|United Kingdom|bton.ac.uk
National University of Laos|Laos|nuol.edu.la
University of Lapland|Finland|ulapland.fi
Hiroshima University|Japan|hiroshima-u.ac.jp
Tor Vergata University of Rome|Italy|web.uniroma2.it
Oxford Brookes University|United Kingdom|brookes.ac.uk
Nicolaus Copernicus University in Toruń|Poland|umk.pl
Glasgow Caledonian University|United Kingdom|gcu.ac.uk
DePaul University|United States|depaul.edu
University of Modena and Reggio Emilia|Italy|unimore.it
University of Costa Rica|Costa Rica|ucr.ac.cr
University of Canberra|Australia|canberra.edu.au
Helsinki University of Technology|Finland|hut.fi
University of Klagenfurt|Austria|aau.at
Goldsmiths, University of London|United Kingdom|gold.ac.uk
University of Akureyri|Iceland|unak.is
Estonian University of Life Sciences|Estonia|emu.ee
Pusan National University|South Korea|pusan.ac.kr
Marquette University|United States|marquette.edu
Toulouse School of Economics|France|tse-fr.eu
University of Guam|United States|uog.edu
University of Lagos|Nigeria|unilag.edu.ng
University of Macau|People's Republic of China|um.edu.mo
University of Malawi|Malawi|unima.ecampus.ac.mw
Bifröst University|Iceland|bifrost.is
University of Algiers 1|Algeria|univ-alger.dz
University of Split|Croatia|unist.hr
Prague University of Economics and Business|Czech Republic|vse.cz
Austral University of Chile|Chile|uach.cl
Örebro University|Sweden|oru.se
Pace University|United States|pace.edu
University of Plymouth|United Kingdom|plymouth.ac.uk
Keele University|United Kingdom|keele.ac.uk
Universidad Carlos III de Madrid|Spain|uc3m.es
I.M. Sechenov First Moscow State Medical University|Russia|sechenov.ru
Sultan Qaboos University|Oman|squ.edu.om
University of Osijek|Croatia|unios.hr
Gazi University|Turkey|gazi.edu.tr
Imam Hossein University|Iran|ihu.ac.ir
North-West University|South Africa|nwu.ac.za
Illinois State University|United States|illinoisstate.edu
National University of Lesotho|Lesotho|nul.ls
Auckland University of Technology|New Zealand|aut.ac.nz
Brno University of Technology|Czech Republic|vut.cz
Harbin Institute of Technology|People's Republic of China|en.hit.edu.cn
Tokyo University of Science|Japan|tus.ac.jp
Birzeit University|Palestine|birzeit.edu
University of Trento|Italy|unitn.it
Luleå University of Technology|Sweden|ltu.se
University of the Arts London|United Kingdom|arts.ac.uk
Chiang Mai University|Thailand|cmu.ac.th
Belarusian State University of Informatics and Radioelectronics|Belarus|bsuir.by
Naresuan University|Thailand|nu.ac.th
Florida Atlantic University|United States|fau.edu
Vietnam National University|Vietnam|vnuhcm.edu.vn
Rhodes University|South Africa|ru.ac.za
Al-Mustansiriya University|Iraq|uomustansiriyah.edu.iq
University of Prizren|Kosovo|uni-pz.org
NOVA University Lisbon|Portugal|unl.pt
University of Piraeus|Greece|unipi.gr
Cranfield University|United Kingdom|cranfield.ac.uk
Gakushuin University|Japan|univ.gakushuin.ac.jp
Shandong University|People's Republic of China|sdu.edu.cn
Roskilde University|Denmark|ruc.dk
University of Dubrovnik|Croatia|unidu.hr
K. N. Toosi University of Technology|Iran|kntu.ac.ir
Beihang University|People's Republic of China|ev.buaa.edu.cn
Panteion University|Greece|panteion.gr
Nottingham Trent University|United Kingdom|ntu.ac.uk
Università della Svizzera italiana|Switzerland|usi.ch
St. John's University|United States|stjohns.edu
Polytechnic University of Catalonia|Spain|upc.edu
al-Aqsa University|Palestine|alaqsa.edu.ps
Portland State University|United States|pdx.edu
I. Ya. Horbachevsky Ternopil National Medical University of Ministry of Health Care of Ukraine|Ukraine|tdmu.edu.ua
Santa Clara University|United States|scu.edu
Liverpool John Moores University|United Kingdom|ljmu.ac.uk
Hitotsubashi University|Japan|hit-u.ac.jp
Khazar University|Azerbaijan|khazar.org
University of Verona|Italy|univr.it
Umm al-Qura University|Saudi Arabia|uqu.edu.sa
University of Liechtenstein|Liechtenstein|uni.li
Irkutsk State University|Russia|isu.ru
Michigan Technological University|United States|mtu.edu
Leeds Beckett University|United Kingdom|leedsbeckett.ac.uk
University of Arts (Albania)|Albania|uart.edu.al
Hashemite University|Jordan|hu.edu.jo
Sichuan University|People's Republic of China|scu.edu.cn
University of Urbino|Italy|uniurb.it
University of Tripoli|Libya|uot.edu.ly
Robert Gordon University|United Kingdom|rgu.ac.uk
University of the Free State|South Africa|ufs.ac.za
University of Agder|Norway|uia.no
Ez-Zitouna University|Tunisia|uz.rnu.tn
University of the Andes|Colombia|uniandes.edu.co
Hunter College|United States|hunter.cuny.edu
University of Rijeka|Croatia|uniri.hr
Technical University of Moldova|Moldova|utm.md
University of the Republic of San Marino|San Marino|unirsm.sm
Singapore Management University|Singapore|smu.edu.sg
Royal Holloway, University of London|United Kingdom|royalholloway.ac.uk
Krakow University of Economics|Poland|uek.krakow.pl
Universidad del Desarrollo|Chile|udd.cl
D'Annunzio University of Chieti–Pescara|Italy|unich.it
Eduardo Mondlane University|Mozambique|uem.mz
Semmelweis University|Hungary|semmelweis.hu
Oles Honchar Dnipro National University|Ukraine|dnu.dp.ua
Athens University of Economics and Business|Greece|aueb.gr
L. N. Gumilyov Eurasian National University|Kazakhstan|enu.kz
University of Lancashire|United Kingdom|uclan.ac.uk
University of Richmond|United States|richmond.edu
Université de Lubumbashi|Democratic Republic of the Congo|unilu.ac.cd
Tampere University of Technology|Finland|tut.fi
Iceland University of the Arts|Iceland|lhi.is
Politehnica University of Bucharest|Romania|upb.ro
Albert Einstein College of Medicine|United States|einsteinmed.edu
Kyrgyz National University|Kyrgyzstan|knu.kg
Nagasaki University|Japan|nagasaki-u.ac.jp
International Space University|France|isunet.edu
University of Antananarivo|Madagascar|univ-antananarivo.mg
Royal University of Phnom Penh|Cambodia|rupp.edu.kh
Mid Sweden University|Sweden|miun.se
Arkansas State University|United States|astate.edu
American University of Armenia|Armenia|aua.am
University Joseph Ki-Zerbo|Burkina Faso|ujkz.bf
University of Basrah|Iraq|uobasrah.edu.iq
Jadavpur University|India|jadavpuruniversity.in
Ball State University|United States|bsu.edu
University of Sassari|Italy|uniss.it
University of Sunderland|United Kingdom|sunderland.ac.uk
University of N'Djaména|Chad|universite-ndjamena.td
National University of Distance Education|Spain|uned.es
Universiti Brunei Darussalam|Brunei|ubd.edu.bn
Abkhazian State University|Georgia|agu.site
University of the Western Cape|South Africa|uwc.ac.za
University of Eswatini|Eswatini|uneswa.ac.sz
Sheffield Hallam University|United Kingdom|shu.ac.uk
Veliko Tarnovo University|Bulgaria|uni-vt.bg
Latvia University of Life Sciences and Technologies|Latvia|llu.lv
University of Niš|Serbia|ni.ac.rs
University of Foggia|Italy|unifg.it
Shanghai International Studies University|People's Republic of China|en.shisu.edu.cn
Open University of Catalonia|Spain|uoc.edu
University of Lucerne|Switzerland|unilu.ch
Shota Rustaveli State University|Georgia|bsu.edu.ge
Marshall University|United States|marshall.edu
Kadyrov Chechen State University|Russia|chesu.ru
Kim Chaek University of Technology|North Korea|kut.edu.kp
Lappeenranta-Lahti University of Technology LUT|Finland|lut.fi
Mahidol University|Thailand|mahidol.ac.th
Xi'an Jiaotong University|People's Republic of China|xjtu.edu.cn
Worcester Polytechnic Institute|United States|wpi.edu
Saint Louis University|United States|slu.edu
Riga Stradiņš University|Latvia|rsu.lv
University of Białystok|Poland|uwb.edu.pl
University of Milan-Bicocca|Italy|unimib.it
Beijing Institute of Technology|People's Republic of China|bit.edu.cn
Vilnius Gediminas Technical University|Lithuania|vgtu.lt
Tajik National University|Tajikistan|tnu.tj
State University of Tetova|North Macedonia|unite.edu.mk
University of Texas at San Antonio|United States|utsa.edu
Boise State University|United States|boisestate.edu
Daugavpils University|Latvia|du.lv
University of Hartford|United States|hartford.edu
University of Zenica|Bosnia and Herzegovina|unze.ba
University of Louisiana at Lafayette|United States|louisiana.edu
University of Camerino|Italy|unicam.it
Yerevan State Medical University|Armenia|ysmu.am
Central University of Ecuador|Ecuador|uce.edu.ec
Comrat State University|Moldova|kdu.md
California State Polytechnic University, Pomona|United States|cpp.edu
Copenhagen Business School|Denmark|cbs.dk
Mendel University in Brno|Czech Republic|mendelu.cz
California State University, Los Angeles|United States|calstatela.edu
University of Liepāja|Latvia|liepu.lv
Aga Khan University|Pakistan|aku.edu
University of Texas at Dallas|United States|utdallas.edu
Félix Houphouët Boigny University|Ivory Coast|univ-fhb.edu.ci
Brawijaya University|Indonesia|ub.ac.id
University of Nigeria|Nigeria|unn.edu.ng
University of Brescia|Italy|unibs.it
Emerson College|United States|emerson.edu
Ulm School of Design|Germany|hfg-archiv.ulm.de
Tecnológico de Antioquia|Colombia|tdea.edu.co
Tianjin University|People's Republic of China|tju.edu.cn
Chinese Center for Disease Control and Prevention|People's Republic of China|chinacdc.cn
University of Miskolc|Hungary|uni-miskolc.hu
Homs University|Syria|homs-univ.edu.sy
University of Mons|Belgium|web.umons.ac.be
National University of Rwanda|Rwanda|nur.ac.rw
Institut d'études politiques de Saint-Germain-en-Laye|France|sciencespo-saintgermainenlaye.fr
University of Patras|Greece|upatras.gr
University of Udine|Italy|uniud.it
University for Information Science and Technology "St. Paul The Apostle"|North Macedonia|uist.edu.mk
University of Abertay Dundee|United Kingdom|abertay.ac.uk
Université Omar Bongo|Gabon|univuob.org
United Arab Emirates University|United Arab Emirates|uaeu.ac.ae
Kagoshima University|Japan|kagoshima-u.ac.jp
University of Zielona Góra|Poland|uz.zgora.pl
Universidade Fundação Mineira de Educação e Cultura|Brazil|fumec.br
College of the Holy Cross|United States|holycross.edu
University of Sopron|Hungary|uni-sopron.hu
University of Seoul|South Korea|uos.ac.kr
New York Institute of Technology|United States|nyit.edu
Kyiv National University of Construction and Architecture|Ukraine|knuba.edu.ua
University of Thessaly|Greece|uth.gr
Chongqing University|People's Republic of China|cqu.edu.cn
Tuskegee University|United States|tuskegee.edu
China Agricultural University|People's Republic of China|cau.edu.cn
German University in Cairo|Egypt|guc.edu.eg
Polytechnic University of Tirana|Albania|upt.edu.al
Donetsk National Technical University|Ukraine|donntu.edu.ua
American University in Bulgaria|Bulgaria|aubg.edu
Florida A&M University|United States|famu.edu
University of Bedfordshire|United Kingdom|beds.ac.uk
California State University, Fresno|United States|fresnostate.edu
University of Dayton|United States|udayton.edu
Óbuda University|Hungary|uni-obuda.hu
Universidade Federal do Paraná|Brazil|ufpr.br
University of the West of Scotland|United Kingdom|uws.ac.uk
Dagestan State University|Russia|dgu.ru
University of Arts in Belgrade|Serbia|arts.bg.ac.rs
Sepuluh Nopember Institute of Technology|Indonesia|its.ac.id
University of León|Spain|unileon.es
University of Central Arkansas|United States|uca.edu
Khon Kaen University|Thailand|kku.ac.th
An-Najah National University|Palestine|najah.edu
Old Dominion University|United States|odu.edu
University of Northern Iowa|United States|uni.edu
University of Craiova|Romania|ucv.ro
Satbayev University|Kazakhstan|satbayev.university
Al-Quds University|Palestine|alquds.edu
Nazarbayev University|Kazakhstan|nu.edu.kz
Oslo Metropolitan University|Norway|oslomet.no
University of Nouakchott Al Aasriya|Mauritania|una.mr
Wichita State University|United States|wichita.edu
Azerbaijan State Oil and Industrial University|Azerbaijan|asoa.edu.az
Russian State University for the Humanities|Russia|rsuh.ru
Kathmandu University|Nepal|ku.edu.np
Anna University|India|annauniv.edu
Universidad de los Andes|Chile|uandes.cl
University of Wolverhampton|United Kingdom|wlv.ac.uk
Georgian Technical University|Georgia|gtu.ge
Troy University|United States|troy.edu
University of Detroit Mercy|United States|udmercy.edu
Hungarian University of Fine Arts|Hungary|mke.hu
Toyo University|Japan|toyo.ac.jp
Universidad Mayor|Chile|umayor.cl
University of Prešov|Slovakia|unipo.sk
Agricultural University of Tirana|Albania|ubt.edu.al
Morgan State University|United States|morgan.edu
Gifu University|Japan|gifu-u.ac.jp
East Ukrainian Volodymyr Dahl National University|Ukraine|snu.edu.ua
The University of Texas MD Anderson Cancer Center|United States|mdanderson.org
Kanazawa University|Japan|kanazawa-u.ac.jp
University of West Bohemia|Czech Republic|zcu.cz
Universiti Sains Malaysia|Malaysia|usm.my
Universiti Tunku Abdul Rahman|Malaysia|utar.edu.my
El Colegio de México|Mexico|colmex.mx
University of Helmstedt|Germany|uni-helmstedt.hab.de
University of Peshawar|Pakistan|uop.edu.pk
University of West London|United Kingdom|uwl.ac.uk
Moscow State Linguistic University|Russia|linguanet.ru
Bogomolets National Medical University|Ukraine|nmu.university
School of Visual Arts|United States|sva.edu
Diponegoro University|Indonesia|undip.ac.id
Creighton University|United States|creighton.edu
Baku Slavic University|Azerbaijan|bsu-uni.edu.az
Baruch College|United States|baruch.cuny.edu
Korea National University of Arts|South Korea|knua.ac.kr
Mohammed V University|Morocco|um5.ac.ma
Sacred Heart University|United States|sacredheart.edu
University of the Aegean|Greece|aegean.gr
Akaki Tsereteli State University|Georgia|atsu.edu.ge
University of Northampton|United Kingdom|northampton.ac.uk
Acadia University|Canada|acadiau.ca
École des technologies numériques avancées|France|etna.io
Herzen University|Russia|herzen.spb.ru
National Autonomous University of Honduras|Honduras|unah.edu.hn
University of Chester|United Kingdom|chester.ac.uk
Moscow Pedagogical State University|Russia|mpgu.edu
University of Panama|Panama|up.ac.pa
Kyungpook National University|South Korea|knu.ac.kr
Kraków University of Technology|Poland|pk.edu.pl
`
