/*
 * QS World University Rankings 2027 - the first five hundred institutions, from
 * the spreadsheet QS supplies to publishers ("2027 QS World University Rankings
 * 1.3 (For qs.com).xlsx").
 *
 * One line per institution: 2027 rank | name | country, in the sheet's order.
 * QS publishes tied ranks, so a rank repeats when universities are equal.
 *
 * This is the ranking only. It carries names, countries and scores - never a
 * supervisor, a research area or an email address. Those still come from each
 * university's own staff pages, which is why the page shows a supervisor count
 * of zero for almost every institution here.
 */

export const QS_2027_RAW = `
1|Massachusetts Institute of Technology (MIT)|United States of America
2|Imperial College London|United Kingdom
2|Stanford University|United States of America
4|University of Oxford|United Kingdom
5|Harvard University|United States of America
6|University of Cambridge|United Kingdom
7|California Institute of Technology (Caltech)|United States of America
8|ETH Zurich|Switzerland
8|UCL|United Kingdom
10|National University of Singapore (NUS)|Singapore
11|The University of Hong Kong|Hong Kong SAR, China
12|Nanyang Technological University, Singapore (NTU Singapore)|Singapore
13|Peking University|China (Mainland)
14|Tsinghua University|China (Mainland)
15|University of Pennsylvania|United States of America
16|Cornell University|United States of America
16|Yale University|United States of America
18|The Chinese University of Hong Kong (CUHK)|Hong Kong SAR, China
19|The University of New South Wales (UNSW Sydney)|Australia
20|Johns Hopkins University|United States of America
20|University of California, Berkeley (UCB)|United States of America
22|EPFL – École polytechnique fédérale de Lausanne|Switzerland
22|The University of Melbourne|Australia
24|University of Chicago|United States of America
25|Technical University of Munich|Germany
26|Fudan University|China (Mainland)
27|Princeton University|United States of America
28|The University of Sydney|Australia
29|Australian National University (ANU)|Australia
30|McGill University|Canada
31|Monash University|Australia
32|University of Toronto|Canada
33|The Hong Kong University of Science and Technology|Hong Kong SAR, China
34|Université PSL|France
35|The University of Edinburgh|United Kingdom
36|Shanghai Jiao Tong University|China (Mainland)
37|King's College London|United Kingdom
38|Seoul National University|Republic of Korea
39|The University of Tokyo|Japan
40|The University of Manchester|United Kingdom
40|The University of Queensland|Australia
42|Yonsei University|Republic of Korea
43|Columbia University|United States of America
43|Institut Polytechnique de Paris|France
45|Northwestern University|United States of America
45|University of British Columbia|Canada
47|Zhejiang University|China (Mainland)
48|Delft University of Technology|Netherlands
49|University of California, Los Angeles (UCLA)|United States of America
50|The Hong Kong Polytechnic University|Hong Kong SAR, China
51|University of Michigan-Ann Arbor|United States of America
52|City University of Hong Kong (CityUHK)|Hong Kong SAR, China
52|Korea University|Republic of Korea
54|National Taiwan University (NTU)|Taiwan
55|Carnegie Mellon University|United States of America
56|Universiti Malaya (UM)|Malaysia
57|University of Bristol|United Kingdom
58|New York University (NYU)|United States of America
59|KU Leuven|Belgium
60|University of Amsterdam|Netherlands
61|Ludwig-Maximilians-Universität München|Germany
62|The London School of Economics and Political Science (LSE)|United Kingdom
63|KFUPM|Saudi Arabia
64|Kyoto University|Japan
65|KAIST|Republic of Korea
66|Brown University|United States of America
67|The University of Auckland|New Zealand
68|The University of Warwick|United Kingdom
68|University of Birmingham|United Kingdom
70|Duke University|United States of America
71|Lund University|Sweden
72|University of Texas at Austin|United States of America
73|Sorbonne University|France
74|University of Illinois Urbana-Champaign|United States of America
75|Trinity College Dublin, The University of Dublin|Ireland
76|Université Paris-Saclay|France
77|The University of Western Australia|Australia
77|University of Leeds|United Kingdom
79|Adelaide University|Australia
80|University of Glasgow|United Kingdom
81|University of California, San Diego (UCSD)|United States of America
82|KTH Royal Institute of Technology|Sweden
82|The University of Sheffield|United Kingdom
84|Universidad de Buenos Aires (UBA)|Argentina
85|Durham University|United Kingdom
86|Universität Heidelberg|Germany
87|Politecnico di Milano|Italy
87|University of Technology Sydney|Australia
87|Uppsala University|Sweden
90|Nanjing University|China (Mainland)
90|University of Copenhagen|Denmark
92|Pennsylvania State University|United States of America
92|University of Washington|United States of America
94|Boston University|United States of America
95|The University of Osaka|Japan
96|University of Alberta|Canada
97|Institute of Science Tokyo|Japan
97|University of Nottingham|United Kingdom
98|Freie Universitaet Berlin|Germany
98|University of Zurich|Switzerland
100|Purdue University|United States of America
100|University College Dublin|Ireland
102|Tohoku University|Japan
103|Queen Mary University of London|United Kingdom
104|RWTH Aachen University|Germany
105|Technical University of Denmark|Denmark
106|Pohang University of Science And Technology (POSTECH)|Republic of Korea
107|King Saud University|Saudi Arabia
108|Sungkyunkwan University (SKKU)|Republic of Korea
109|Qatar University|Qatar
110|KIT, Karlsruhe Institute of Technology|Germany
111|Sapienza University of Rome|Italy
111|University of Southampton|United Kingdom
113|University of Waterloo|Canada
113|Utrecht University|Netherlands
115|Lomonosov Moscow State University|Russian Federation
115|University of St Andrews|United Kingdom
118|Indian Institute of Technology Delhi (IITD)|India
119|Leiden University|Netherlands
119|Pontificia Universidad Católica de Chile (UC)|Chile
119|RMIT University|Australia
122|Rice University|United States of America
123|Alma Mater Studiorum - Università di Bologna|Italy
123|University of Helsinki|Finland
125|University of Bath|United Kingdom
126|Aalto University|Finland
126|Macquarie University (Sydney, Australia)|Australia
128|Aarhus University|Denmark
128|Universiti Sains Malaysia (USM)|Malaysia
130|Universiti Kebangsaan Malaysia (UKM)|Malaysia
131|University of Oslo|Norway
131|University of Wisconsin-Madison|United States of America
133|Universidade de São Paulo|Brazil
134|Indian Institute of Technology Bombay (IITB)|India
134|University of Science and Technology of China|China (Mainland)
136|University of Exeter|United Kingdom
137|University of California, Davis|United States of America
138|Universiti Putra Malaysia (UPM)|Malaysia
139|University of Liverpool|United Kingdom
140|Humboldt-Universität zu Berlin|Germany
140|University of Vienna|Austria
142|Georgia Institute of Technology|United States of America
142|National Tsing Hua University - NTHU|Taiwan
142|Western University|Canada
145|Universidad Nacional Autónoma de México  (UNAM)|Mexico
146|Tongji University|China (Mainland)
147|Khalifa University|United Arab Emirates
148|Erasmus University Rotterdam|Netherlands
149|Newcastle University|United Kingdom
150|Ghent University|Belgium
150|University of Basel|Switzerland
152|Eindhoven University of Technology|Netherlands
153|University of Southern California|United States of America
154|Wageningen University & Research|Netherlands
155|Hanyang University|Republic of Korea
156|Nagoya University|Japan
157|University of Groningen|Netherlands
158|Technische Universität Berlin (TU Berlin)|Germany
158|Universiti Teknologi Malaysia|Malaysia
158|University of North Carolina at Chapel Hill|United States of America
158|University of York|United Kingdom
162|Université de Montréal|Canada
162|Washington University in St. Louis|United States of America
164|Lancaster University|United Kingdom
165|Universitat de Barcelona|Spain
165|Wuhan University|China (Mainland)
167|Stockholm University|Sweden
168|University of Geneva|Switzerland
169|Texas A&M University|United States of America
170|Indian Institute of Technology Madras (IITM)|India
171|Kyushu University|Japan
172|Arizona State University|United States of America
173|University of California, Santa Barbara (UCSB)|United States of America
174|Chalmers University of Technology|Sweden
174|McMaster University|Canada
174|Queen's University Belfast|United Kingdom
177|Al-Farabi Kazakh National University|Kazakhstan
177|National Yang Ming Chiao Tung University (NYCU Taiwan)|Taiwan
179|Cardiff University|United Kingdom
179|Hokkaido University|Japan
179|Queen's University at Kingston|Canada
182|Michigan State University|United States of America
183|Emory University|United States of America
184|University of Cape Town|South Africa
185|Technische Universität Dresden|Germany
185|Universidad de Chile|Chile
185|Vrije Universiteit Amsterdam|Netherlands
188|Tecnológico de Monterrey|Mexico
189|Curtin University|Australia
190|Harbin Institute of Technology|China (Mainland)
191|National Cheng Kung University (NCKU)|Taiwan
191|Technische Universität Wien|Austria
191|Universitas Indonesia|Indonesia
191|University of Bern|Switzerland
195|University of Wollongong|Australia
196|Université catholique de Louvain (UCLouvain)|Belgium
196|University of Reading|United Kingdom
198|University of Otago|New Zealand
199|Complutense University of Madrid|Spain
200|King Abdulaziz University (KAU)|Saudi Arabia
201|The Ohio State University|United States of America
201|Waseda University|Japan
203|Loughborough University|United Kingdom
204|Università di Padova|Italy
205|Indian Institute of Technology Kharagpur (IIT-KGP)|India
206|Gadjah Mada University|Indonesia
206|Politecnico di Torino|Italy
208|Tel Aviv University|Israel
209|Rheinische Friedrich-Wilhelms-Universität Bonn|Germany
209|Universität Hamburg|Germany
211|Universitat Autònoma de Barcelona|Spain
212|Chulalongkorn University|Thailand
213|Hamad Bin Khalifa University (HBKU)|Qatar
213|Keio University|Japan
215|Massey University|New Zealand
216|Hong Kong Baptist University|Hong Kong SAR, China
217|United Arab Emirates University|United Arab Emirates
218|Friedrich-Alexander-Universität Erlangen-Nürnberg|Germany
218|The Hebrew University of Jerusalem|Israel
220|University College Cork|Ireland
221|Indian Institute of Science (IISc) Bangalore|India
221|Indian Institute of Technology Kanpur (IITK)|India
223|American University of Beirut (AUB)|Lebanon
223|University of Twente|Netherlands
225|University of Gothenburg|Sweden
226|Universidad Autónoma de Madrid|Spain
227|Deakin University|Australia
228|University of Florida|United States of America
228|University of Ottawa|Canada
230|Eberhard Karls Universität Tübingen|Germany
230|Griffith University|Australia
230|University of Strathclyde|United Kingdom
233|Universidad de los Andes|Colombia
233|University of Lausanne|Switzerland
235|École Normale Supérieure de Lyon|France
235|Tianjin University|China (Mainland)
237|Beijing Normal University|China (Mainland)
237|University of Lisbon|Portugal
239|Central European University|Austria
240|Queensland University of Technology (QUT)|Australia
241|La Trobe University|Australia
241|Victoria University of Wellington|New Zealand
243|Beijing Institute of Technology|China (Mainland)
244|The University of Newcastle, Australia (UON)|Australia
245|Albert-Ludwigs-Universitaet Freiburg|Germany
246|Université Paris 1 Panthéon-Sorbonne|France
246|University of Surrey|United Kingdom
248|Universite libre de Bruxelles|Belgium
249|University of Calgary|Canada
250|Technical University of Darmstadt|Germany
251|University of Rochester|United States of America
252|University of California, Irvine|United States of America
252|University of Maryland, College Park|United States of America
254|Maastricht University|Netherlands
255|University of Minnesota (System)|United States of America
255|University of Porto|Portugal
257|University of Canterbury|New Zealand
258|American University of Sharjah|United Arab Emirates
258|Sun Yat-sen University|China (Mainland)
260|University of Massachusetts Amherst|United States of America
261|Universiti Teknologi PETRONAS (UTP)|Malaysia
261|University of Göttingen|Germany
263|Universitat Pompeu Fabra (Barcelona)|Spain
264|Norwegian University of Science And Technology|Norway
265|Vanderbilt University|United States of America
266|Singapore University of Technology and Design|Singapore
267|University of Macau|Macao SAR, China
268|University of Virginia|United States of America
269|University of Cologne|Germany
270|Dartmouth College|United States of America
270|University of Milan|Italy
272|Taylor's University|Malaysia
273|Charles University|Czechia
273|University of Sussex|United Kingdom
275|University of Galway|Ireland
276|Universitas Airlangga|Indonesia
277|Universidade Estadual de Campinas (Unicamp)|Brazil
277|University of Antwerp|Belgium
279|Istanbul Technical University|Türkiye
279|University of Navarra|Spain
279|University of Pittsburgh|United States of America
282|UCSI University|Malaysia
283|Radboud University|Netherlands
283|University of Bergen|Norway
283|University of Sharjah|United Arab Emirates
283|University of Southern Denmark (SDU)|Denmark
287|Institut Teknologi Bandung (ITB)|Indonesia
288|University of Aberdeen|United Kingdom
289|Georgetown University|United States of America
289|University of Warsaw|Poland
291|Swinburne University of Technology|Australia
292|University of Johannesburg|South Africa
293|Universidad Nacional de Colombia|Colombia
293|University of Waikato|New Zealand
295|Vrije Universiteit Brussel (VUB)|Belgium
296|Stellenbosch University|South Africa
296|Xi’an Jiaotong University|China (Mainland)
298|Dalhousie University|Canada
299|Ulsan National Institute of Science and Technology (UNIST)|Republic of Korea
300|Sichuan University|China (Mainland)
300|University of Notre Dame|United States of America
302|University of Witwatersrand|South Africa
303|Université Paris Cité|France
303|Xiamen University|China (Mainland)
305|Middle East Technical University|Türkiye
306|Sultan Qaboos University|Oman
307|Huazhong University of Science and Technology|China (Mainland)
308|Linköping University|Sweden
309|Kyung Hee University|Republic of Korea
309|Shandong University|China (Mainland)
311|University of Tasmania|Australia
312|Simon Fraser University|Canada
313|The University of Arizona|United States of America
314|Rutgers University–New Brunswick|United States of America
314|Universidad Carlos III de Madrid (UC3M)|Spain
314|University of Leicester|United Kingdom
317|Southern University of Science and Technology (SUSTech)|China (Mainland)
318|Bauman Moscow State Technical University|Russian Federation
318|Universität Stuttgart|Germany
320|North Carolina State University|United States of America
320|University of Colorado Boulder|United States of America
322|Swansea University|United Kingdom
322|University of Delhi|India
322|York University|Canada
325|Heriot-Watt University|United Kingdom
326|Case Western Reserve University|United States of America
326|University of Jordan|Jordan
326|University of Pretoria|South Africa
329|Aalborg University|Denmark
329|Jagiellonian University|Poland
329|Koç University|Türkiye
329|Nankai University|China (Mainland)
333|Universität Innsbruck|Austria
334|Technion - Israel Institute of Technology|Israel
335|Indian Institute of Technology Roorkee (IITR)|India
335|Southeast University|China (Mainland)
337|Universidade Nova de Lisboa|Portugal
338|L.N. Gumilyov Eurasian National University (ENU)|Kazakhstan
338|Tufts University|United States of America
338|University of Miami|United States of America
341|University of Pisa|Italy
342|South China University of Technology|China (Mainland)
342|University of Coimbra|Portugal
342|University of Rome "Tor Vergata"|Italy
345|Boğaziçi University|Türkiye
345|Mahidol University|Thailand
345|Universiti Brunei Darussalam (UBD)|Brunei Darussalam
348|Abu Dhabi University|United Arab Emirates
349|Beihang University (former BUAA)|China (Mainland)
349|Indian Institute of Technology Guwahati (IITG)|India
351|Satbayev University|Kazakhstan
351|University of Tsukuba|Japan
353|Brunel University of London|United Kingdom
354|Birkbeck, University of London|United Kingdom
354|Sciences Po|France
354|Sunway University|Malaysia
357|Pontificia Universidad Catolica del Peru (PUCP)|Peru
357|Sabanci University|Türkiye
359|RUDN University|Russian Federation
360|Indiana University Bloomington|United States of America
360|University of Chinese Academy of Sciences (UCAS)|China (Mainland)
360|University of Oulu|Finland
361|City St George’s, University of London|United Kingdom
363|Cairo University|Egypt
364|Universidad Politécnica de Madrid (UPM)|Spain
364|Université de Liège|Belgium
366|Virginia Polytechnic Institute and State University|United States of America
367|Universidade Federal do Rio de Janeiro|Brazil
367|University of Tartu|Estonia
367|University of Tehran|Iran (Islamic Republic of)
370|University of Illinois Chicago (UIC)|United States of America
370|University of Münster|Germany
370|University of Victoria (UVic)|Canada
370|Western Sydney University|Australia
374|Flinders University|Australia
376|Goethe-University Frankfurt am Main|Germany
376|University of Luxembourg|Luxembourg
378|National Technical University of Athens|Greece
379|Gwangju Institute of Science and Technology (GIST)|Republic of Korea
379|National Taiwan University of Science and Technology (Taiwan Tech)|Taiwan
381|George Washington University|United States of America
381|Quaid-i-Azam University|Pakistan
381|University of East Anglia (UEA)|United Kingdom
384|National University of Sciences & Technology (NUST) Islamabad|Pakistan
385|Daegu Gyeongbuk Institute of Science and Technology (DGIST)|Republic of Korea
385|Northeastern University|United States of America
387|Université Grenoble Alpes|France
388|Università Cattolica del Sacro Cuore|Italy
388|University of Limerick|Ireland
390|LUT University|Finland
390|Saint Petersburg State University|Russian Federation
390|Sharif University of Technology|Iran (Islamic Republic of)
390|The American University in Cairo|Egypt
394|East China Normal University|China (Mainland)
395|Pontificia Universidad Javeriana|Colombia
395|Università degli Studi di Pavia|Italy
397|Ajman University|United Arab Emirates
397|University of Turin|Italy
398|Macau University of Science and Technology|Macao SAR, China
398|Sejong University|Republic of Korea
398|University of California, Riverside|United States of America
398|University of Turku|Finland
401|University of Naples - Federico II|Italy
402|National and Kapodistrian University of Athens|Greece
402|Ruhr-Universität Bochum|Germany
402|University of the Philippines|Philippines
406|INTI International University|Malaysia
406|The Education University of Hong Kong|Hong Kong SAR, China
408|Dublin City University|Ireland
409|Graz University of Technology|Austria
409|University of Florence|Italy
411|Oxford Brookes University|United Kingdom
411|Singapore Management University|Singapore
411|University of Saskatchewan|Canada
411|University of Southern Queensland|Australia
415|University of Kent|United Kingdom
416|Aston University|United Kingdom
416|Shenzhen University|China (Mainland)
416|University at Buffalo SUNY|United States of America
419|IPB University (aka Bogor Agricultural University)|Indonesia
419|Lincoln University|New Zealand
421|Prince Mohammad Bin Fahd university|Saudi Arabia
422|Murdoch University|Australia
423|HSE University|Russian Federation
423|National Taiwan Normal University (NTNU)|Taiwan
425|Northwestern Polytechnical University|China (Mainland)
425|Universität Konstanz|Germany
425|Universität Mannheim|Germany
425|University of Aveiro|Portugal
429|Tilburg University|Netherlands
430|Julius-Maximilians-Universität Würzburg|Germany
431|Auckland University of Technology (AUT)|New Zealand
432|Chung-Ang University (CAU)|Republic of Korea
432|Czech Technical University in Prague|Czechia
434|Universitat Politècnica de Catalunya · BarcelonaTech (UPC)|Spain
434|Universitat Politecnica de Valencia|Spain
436|Central Queensland University (CQUniversity Australia)|Australia
436|Tampere University|Finland
438|Essex, University of|United Kingdom
438|James Cook University|Australia
438|National Sun Yat-sen University (NSYSU)|Taiwan
438|Umea University|Sweden
438|University of Trento|Italy
443|Aix-Marseille University|France
443|Shanghai University|China (Mainland)
443|University of Science and Technology Beijing|China (Mainland)
446|IE University|Spain
447|University of Dundee|United Kingdom
447|University of Granada|Spain
449|Jordan University of Science & Technology|Jordan
449|Pusan National University|Republic of Korea
449|Universitat de Valencia|Spain
452|Central South University|China (Mainland)
452|Shoolini University of Biotechnology and Management Sciences|India
454|Bilkent University|Türkiye
454|Masaryk University|Czechia
456|Université de Strasbourg|France
456|USI - Università della Svizzera italiana|Switzerland
458|Johannes Kepler University Linz|Austria
458|SOAS University of London|United Kingdom
458|Tashkent Institute of Irrigation and Agricultural Mechanization Engineers - National Research University (TIIAME-NRU)|Uzbekistan
458|University of California, Santa Cruz|United States of America
458|University of Connecticut|United States of America
463|Dalian University of Technology|China (Mainland)
463|Universidad de Costa Rica|Costa Rica
465|Chongqing University|China (Mainland)
465|Università Vita-Salute San Raffaele|Italy
465|Vilnius University|Lithuania
468|Kazan (Volga region) Federal University|Russian Federation
468|Stony Brook University, State University of New York|United States of America
470|Anna University|India
470|Leibniz University Hannover|Germany
472|University of Bayreuth|Germany
473|Université de Montpellier|France
474|Imam Abdulrahman Bin Faisal University (IAU)|Saudi Arabia
474|Universidad Nacional de La Plata (UNLP)|Argentina
474|Universitat Ramon Llull|Spain
477|China Agricultural University|China (Mainland)
477|Hunan University|China (Mainland)
477|Lebanese American University|Lebanon
477|University of Canberra|Australia
481|Hiroshima University|Japan
481|Kyungpook National University|Republic of Korea
483|Amirkabir University of Technology|Iran (Islamic Republic of)
483|Jinan University (China)|China (Mainland)
485|Royal Holloway, University of London|United Kingdom
485|Universidad de Sevilla|Spain
485|University of Bordeaux|France
488|Ewha Womans University|Republic of Korea
488|Jilin University|China (Mainland)
488|Novosibirsk State University|Russian Federation
488|Prince Sultan University|Saudi Arabia
488|University of Electronic Science and Technology of China|China (Mainland)
494|National Taipei University of Technology|Taiwan
494|Sogang University|Republic of Korea
496|Universitas Padjadjaran (UNPAD)|Indonesia
497|Concordia University|Canada
497|Institut Teknologi Sepuluh Nopember (ITS Surabaya)|Indonesia
497|University of Bradford|United Kingdom
500|Johannes Gutenberg Universität Mainz|Germany
`
