/*
 * QS World University Rankings 2027 - the first two hundred institutions, from
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
 *
 * Ranks 201-500 are not in this file yet; the page says so rather than pretending
 * the list stops at the top two hundred.
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
`
