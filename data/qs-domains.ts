/*
 * Official websites for the QS 2027 institutions that are not already in
 * data/universities.ts. Source: Wikidata property P856 (official website),
 * matched on the institution's English label. Only rows that matched are here;
 * anything absent keeps the search link instead of a guessed address.
 *
 * Every host below was requested and its page title checked before this file was
 * committed: label matching alone pointed at branch campuses and shared names
 * (University of Chicago to a China office, Western University to a Thai
 * college, La Trobe to a football club), and those were corrected or dropped.
 */

export const QS_DOMAINS_RAW = `
Stanford University|stanford.edu
University of Oxford|ox.ac.uk
Harvard University|harvard.edu
University of Cambridge|cam.ac.uk
ETH Zurich|ethz.ch
National University of Singapore (NUS)|nus.edu.sg
The University of Hong Kong|hku.hk
Peking University|pku.edu.cn
University of Pennsylvania|upenn.edu
Cornell University|cornell.edu
Yale University|yale.edu
Johns Hopkins University|jhu.edu
University of California, Berkeley (UCB)|berkeley.edu
The University of Melbourne|unimelb.edu.au
University of Chicago|uchicago.edu
Technical University of Munich|tum.de
Fudan University|fudan.edu.cn
Princeton University|princeton.edu
The University of Sydney|sydney.edu.au
Australian National University (ANU)|anu.edu.au
McGill University|mcgill.ca
Monash University|monash.edu
University of Toronto|utoronto.ca
The Hong Kong University of Science and Technology|hkust.edu.hk
The University of Edinburgh|ed.ac.uk
King's College London|kcl.ac.uk
Seoul National University|snu.ac.kr
The University of Tokyo|u-tokyo.ac.jp
The University of Queensland|uq.edu.au
Yonsei University|yonsei.ac.kr
Columbia University|columbia.edu
Northwestern University|northwestern.edu
University of British Columbia|ubc.ca
Delft University of Technology|tudelft.nl
University of California, Los Angeles (UCLA)|ucla.edu
City University of Hong Kong (CityUHK)|cityu.edu.hk
Korea University|korea.ac.kr
National Taiwan University (NTU)|ntu.edu.tw
Carnegie Mellon University|cmu.edu
University of Bristol|bristol.ac.uk
New York University (NYU)|nyu.edu
KAIST|kaist.ac.kr
Brown University|brown.edu
The University of Auckland|auckland.ac.nz
The University of Warwick|warwick.ac.uk
University of Birmingham|birmingham.ac.uk
Lund University|lu.se
University of Texas at Austin|utexas.edu
Sorbonne University|sorbonne-universite.fr
University of Illinois Urbana-Champaign|illinois.edu
Université Paris-Saclay|universite-paris-saclay.fr
University of Leeds|leeds.ac.uk
Adelaide University|adelaide.edu.au
University of Glasgow|gla.ac.uk
University of California, San Diego (UCSD)|ucsd.edu
The University of Sheffield|sheffield.ac.uk
Durham University|durham.ac.uk
Politecnico di Milano|polimi.it
University of Technology Sydney|uts.edu.au
Nanjing University|nju.edu.cn
University of Copenhagen|ku.dk
Boston University|bu.edu
University of Alberta|ualberta.ca
Institute of Science Tokyo|isct.ac.jp
University of Nottingham|nottingham.ac.uk
Purdue University|purdue.edu
University College Dublin|ucd.ie
Tohoku University|tohoku.ac.jp
Queen Mary University of London|qmul.ac.uk
RWTH Aachen University|rwth-aachen.de
Technical University of Denmark|dtu.dk
Sungkyunkwan University (SKKU)|skku.edu
Qatar University|qu.edu.qa
Sapienza University of Rome|uniroma1.it
University of Southampton|southampton.ac.uk
University of Waterloo|uwaterloo.ca
Utrecht University|uu.nl
Lomonosov Moscow State University|msu.ru
University of St Andrews|st-andrews.ac.uk
Indian Institute of Technology Delhi (IITD)|iitd.ac.in
RMIT University|rmit.edu.au
Rice University|rice.edu
University of Helsinki|helsinki.fi
Aalto University|aalto.fi
Macquarie University (Sydney, Australia)|mq.edu.au
Aarhus University|au.dk
University of Oslo|uio.no
Indian Institute of Technology Bombay (IITB)|iitb.ac.in
University of Exeter|exeter.ac.uk
University of Liverpool|liverpool.ac.uk
Humboldt-Universität zu Berlin|hu-berlin.de
Western University|uwo.ca
Khalifa University|ku.ac.ae
Erasmus University Rotterdam|eur.nl
Ghent University|ugent.be
University of Basel|unibas.ch
University of Southern California|usc.edu
Wageningen University & Research|wur.nl
Hanyang University|hanyang.ac.kr
Nagoya University|nagoya-u.ac.jp
University of Groningen|rug.nl
Technische Universität Berlin (TU Berlin)|tu.berlin
University of North Carolina at Chapel Hill|unc.edu
University of York|york.ac.uk
Université de Montréal|umontreal.ca
Wuhan University|en.whu.edu.cn
Stockholm University|su.se
University of Geneva|unige.ch
Texas A&M University|tamu.edu
Indian Institute of Technology Madras (IITM)|iitm.ac.in
University of California, Santa Barbara (UCSB)|ucsb.edu
McMaster University|mcmaster.ca
National Yang Ming Chiao Tung University (NYCU Taiwan)|nycu.edu.tw
Cardiff University|cardiff.ac.uk
Emory University|emory.edu
Curtin University|curtin.edu.au
National Cheng Kung University (NCKU)|ncku.edu.tw
University of Bern|unibe.ch
University of Wollongong|uow.edu.au
University of Otago|otago.ac.nz
Complutense University of Madrid|ucm.es
Al-Farabi Kazakh National University|farabi.university
The Ohio State University|osu.edu
Waseda University|waseda.jp
Loughborough University|lboro.ac.uk
Indian Institute of Technology Kharagpur (IIT-KGP)|iitkgp.ac.in
Tel Aviv University|tau.ac.il
Chulalongkorn University|chula.ac.th
Hamad Bin Khalifa University (HBKU)|hbku.edu.qa
Keio University|keio.ac.jp
Massey University|massey.ac.nz
Hong Kong Baptist University|hkbu.edu.hk
University College Cork|ucc.ie
Indian Institute of Technology Kanpur (IITK)|iitk.ac.in
American University of Beirut (AUB)|aub.edu.lb
Deakin University|deakin.edu.au
University of Florida|ufl.edu
University of Ottawa|uottawa.ca
Griffith University|griffith.edu.au
University of Strathclyde|strath.ac.uk
University of Lausanne|unil.ch
École Normale Supérieure de Lyon|ens-lyon.fr
Beijing Normal University|bnu.edu.cn
University of Lisbon|ulisboa.pt
Central European University|ceu.edu
Queensland University of Technology (QUT)|qut.edu.au
La Trobe University|latrobe.edu.au
Victoria University of Wellington|victoria.ac.nz
University of Calgary|ucalgary.ca
Technical University of Darmstadt|tu-darmstadt.de
University of California, Irvine|uci.edu
University of Minnesota (System)|twin-cities.umn.edu
University of Porto|up.pt
American University of Sharjah|aus.edu
Sun Yat-sen University|sysu.edu.cn
University of Göttingen|uni-goettingen.de
Vanderbilt University|vanderbilt.edu
Singapore University of Technology and Design|sutd.edu.sg
University of Virginia|virginia.edu
University of Cologne|uni-koeln.de
Dartmouth College|home.dartmouth.edu
University of Milan|unimi.it
Taylor's University|taylors.edu.my
University of Sussex|sussex.ac.uk
University of Galway|universityofgalway.ie
Istanbul Technical University|itu.edu.tr
University of Pittsburgh|pitt.edu
UCSI University|ucsiuniversity.edu.my
University of Sharjah|sharjah.ac.ae
University of Southern Denmark (SDU)|sdu.dk
University of Aberdeen|abdn.ac.uk
Georgetown University|georgetown.edu
Swinburne University of Technology|swinburne.edu.au
University of Waikato|waikato.ac.nz
Dalhousie University|dal.ca
Ulsan National Institute of Science and Technology (UNIST)|unist.ac.kr
University of Notre Dame|nd.edu
Xiamen University|xmu.edu.cn
Huazhong University of Science and Technology|hust.edu.cn
Kyung Hee University|khu.ac.kr
University of Tasmania|utas.edu.au
Simon Fraser University|sfu.ca
The University of Arizona|arizona.edu
Rutgers University–New Brunswick|rutgers.edu
Southern University of Science and Technology (SUSTech)|sustech.edu.cn
Bauman Moscow State Technical University|bmstu.ru
North Carolina State University|ncsu.edu
University of Colorado Boulder|colorado.edu
Swansea University|swansea.ac.uk
York University|yorku.ca
Case Western Reserve University|case.edu
University of Jordan|ju.edu.jo
Koç University|kocuniversity.cn
Nankai University|nankai.edu.cn
Indian Institute of Technology Roorkee (IITR)|iitr.ac.in
Southeast University|seu.edu.cn
University of Pisa|unipi.it
South China University of Technology|scut.edu.cn
University of Coimbra|uc.pt
Boğaziçi University|bogazici.edu.tr
Abu Dhabi University|adu.ac.ae
Indian Institute of Technology Guwahati (IITG)|iitg.ac.in
University of Tsukuba|tsukuba.ac.jp
Birkbeck, University of London|bbk.ac.uk
Sunway University|sunway.edu.my
Indiana University Bloomington|bloomington.iu.edu
University of Chinese Academy of Sciences (UCAS)|ucas.ac.cn
University of Oulu|oulu.fi
University of Tehran|ut.ac.ir
University of Illinois Chicago (UIC)|uic.edu
University of Münster|uni-muenster.de
University of Victoria (UVic)|uvic.ca
Western Sydney University|westernsydney.edu.au
Flinders University|flinders.edu.au
University of Luxembourg|uni.lu
Gwangju Institute of Science and Technology (GIST)|gist.ac.kr
National Taiwan University of Science and Technology (Taiwan Tech)|ntust.edu.tw
George Washington University|gwu.edu
Quaid-i-Azam University|qau.edu.pk
University of East Anglia (UEA)|uea.ac.uk
Daegu Gyeongbuk Institute of Science and Technology (DGIST)|dgist.ac.kr
Saint Petersburg State University|spbu.ru
Sharif University of Technology|sharif.ir
The American University in Cairo|aucegypt.edu
East China Normal University|ecnu.edu.cn
Ajman University|ajman.ac.ae
Macau University of Science and Technology|must.edu.mo
Sejong University|sejong.ac.kr
University of California, Riverside|ucr.edu
University of Turku|utu.fi
University of the Philippines|up.edu.ph
INTI International University|newinti.edu.my
The Education University of Hong Kong|eduhk.hk
Dublin City University|dcu.ie
Graz University of Technology|tugraz.at
University of Saskatchewan|usask.ca
University of Southern Queensland|usq.edu.au
University of Kent|kent.ac.uk
Aston University|aston.ac.uk
IPB University (aka Bogor Agricultural University)|ipb.ac.id
Lincoln University|lincoln.ac.nz
Murdoch University|murdoch.edu.au
National Taiwan Normal University (NTNU)|ntnu.edu.tw
Northwestern Polytechnical University|nwpu.edu.cn
University of Aveiro|ua.pt
Tilburg University|tilburguniversity.edu
Chung-Ang University (CAU)|cau.ac.kr
Czech Technical University in Prague|cvut.cz
Central Queensland University (CQUniversity Australia)|cqu.edu.au
Tampere University|tuni.fi
James Cook University|jcu.edu.au
National Sun Yat-sen University (NSYSU)|nsysu.edu.tw
Aix-Marseille University|univ-amu.fr
Shanghai University|shu.edu.cn
University of Science and Technology Beijing|ustb.edu.cn
IE University|ie.edu
University of Granada|ugr.es
Central South University|csu.edu.cn
Bilkent University|bilkent.edu.tr
Masaryk University|muni.cz
Johannes Kepler University Linz|jku.at
University of Connecticut|uconn.edu
Dalian University of Technology|dlut.edu.cn
Vilnius University|vu.lt
Leibniz University Hannover|uni-hannover.de
University of Bayreuth|uni-bayreuth.de
Imam Abdulrahman Bin Faisal University (IAU)|uqu.edu.sa
Hunan University|hnu.edu.cn
Lebanese American University|lau.edu.lb
Amirkabir University of Technology|aut.ac.ir
Jinan University (China)|english.jnu.edu.cn
University of Bordeaux|u-bordeaux.fr
Ewha Womans University|ewha.ac.kr
Novosibirsk State University|nsu.ru
Prince Sultan University|psu.edu.sa
University of Electronic Science and Technology of China|uestc.edu.cn
National Taipei University of Technology|ntut.edu.tw
Sogang University|sogang.ac.kr
Concordia University|concordia.ca
`
