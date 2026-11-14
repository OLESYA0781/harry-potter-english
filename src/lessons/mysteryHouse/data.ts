export type Round = {id:string;kind:'characters'|'jobs'|'gap'|'sentence';prompt?:string;options:string[];answer:string;read:string;guide:string};
export type Room = {id:string;title:string;symbol:string;color:string;rounds:Round[]};
export const rooms:Room[]=[
 {id:'who',title:'Who Is It?',symbol:'book',color:'#5c8570',rounds:[
  {id:'library',kind:'characters',options:['Harry','Hermione','Ron','Draco'],answer:'Hermione',read:'She is a pupil. She is in the library.',guide:'Прочитайте описание. Предложите выбрать персонажа и объяснить выбор.'},
  {id:'tired',kind:'characters',options:['Draco','Ron','Harry','Hermione'],answer:'Ron',read:'He is a pupil. He is tired.',guide:'Прочитайте описание. Усталый рыжеволосый Рон изображён с закрывающимися глазами.'},
 ]},
 {id:'be',title:'Fix the Magic',symbol:'wand',color:'#7c6999',rounds:[
  {id:'harry',kind:'gap',prompt:'Harry ___ tired.',options:['am','is','are'],answer:'is',read:'Harry … tired.',guide:'Попросите вставить форму to be. Карточку можно перетащить или выбрать нажатием.'},
  {id:'school',kind:'gap',prompt:'They ___ at school.',options:['am','is','are'],answer:'are',read:'They … at school.',guide:'Попросите вставить форму to be и прочитать всё предложение.'},
 ]},
 {id:'listen',title:'Listen & Find',symbol:'ear',color:'#b1814f',rounds:[
  {id:'hospital',kind:'jobs',options:['pilot','doctor','farmer','teacher'],answer:'doctor',read:'He works at a hospital.',guide:'Прочитайте фразу. Среди этих четырёх профессий только врач работает в больнице.'},
  {id:'restaurant',kind:'jobs',options:['artist','singer','chef','shop-assistant'],answer:'chef',read:'She works at a restaurant. She cooks food.',guide:'Прочитайте обе фразы. Предложите найти повара с белым колпаком и едой.'},
 ]},
 {id:'word',title:'The Missing Word',symbol:'quill',color:'#567b9c',rounds:[
  {id:'reads',kind:'gap',prompt:'Hermione ___ books every day.',options:['read','reads'],answer:'reads',read:'Hermione … books every day.',guide:'Предложите выбрать форму глагола и объяснить окончание -s.'},
  {id:'play',kind:'gap',prompt:'They ___ football after school.',options:['plays','play'],answer:'play',read:'They … football after school.',guide:'Попросите прочитать предложение целиком. They требует play.'},
 ]},
 {id:'negative',title:'Make It Negative',symbol:'moon',color:'#a26f7e',rounds:[
  {id:'ron',kind:'sentence',prompt:'Ron plays football.',options:['football.','play','Ron',"doesn't"],answer:"Ron doesn't play football.",read:'Ron plays football.',guide:'Попросите собрать отрицание. После doesn’t нужна форма play без -s.'},
  {id:'bus',kind:'sentence',prompt:'They go to school by bus.',options:['school','by',"don't",'They','bus.','go','to'],answer:"They don't go to school by bus.",read:'They go to school by bus.',guide:'Карточки должны образовать отрицание с don’t. Их можно вернуть или переставить.'},
 ]},
 {id:'question',title:'The Secret Question',symbol:'key',color:'#6c8e8b',rounds:[
  {id:'harry',kind:'sentence',prompt:'Harry goes to school by bus.',options:['school','Harry','by','Does','bus?','go','to'],answer:'Does Harry go to school by bus?',read:'Harry goes to school by bus.',guide:'Попросите собрать вопрос. Does стоит перед Harry, основной глагол — go.'},
  {id:'they',kind:'sentence',prompt:'They play football after school.',options:['after','they','school?','Do','football','play'],answer:'Do they play football after school?',read:'They play football after school.',guide:'Предложите собрать вопрос с Do. Проверьте порядок слов вместе.'},
 ]},
];
export const roundKey=(room:string,round:string)=>`mystery-house/v1/${room}/${round}`;
