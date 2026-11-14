import type {LessonState} from '../../data';
export const questPrefix='golden-key/v1/';
export const places=[
 {id:'hospital',name:'Hospital',job:'doctor',cell:0,person:1,question:'Where do you work?',tokens:['work?','you','Where','do'],reply:'I work at a hospital.',letter:'The key is not at the hospital.'},
 {id:'restaurant',name:'Restaurant',job:'chef',cell:1,person:6,question:'What do you do?',tokens:['do?','you','What','do'],reply:'I am a chef.',letter:'The key is not at the restaurant.'},
 {id:'museum',name:'Museum',job:'artist',cell:2,person:4,question:'Where does the artist work?',tokens:['artist','Where','work?','the','does'],reply:'The artist works at a museum.',letter:'The artist works at the museum.'},
 {id:'bank',name:'Bank',job:'office worker',cell:3,person:-1,question:'Who works at the bank?',tokens:['bank?','at','Who','the','works'],reply:'An office worker works at the bank.',letter:'The key is not at the bank.'},
 {id:'theatre',name:'Theatre',job:'singer',cell:4,person:5,question:'How does the singer go to work?',tokens:['work?','singer','How','to','go','the','does'],reply:'The singer goes to work by bus.',letter:'The key is not at the theatre.'},
 {id:'school',name:'School',job:'teacher',cell:5,person:3,question:'When does the teacher start work?',tokens:['teacher','When','work?','start','the','does'],reply:'The teacher starts work at eight.',letter:'The key is not at the school.'},
];
export const guardian=[['Where are you?','I am at the museum.'],['Who works at the museum?','An artist works at the museum.'],['Where does a doctor work?','A doctor works at a hospital.'],['What does a chef do?','A chef cooks food.'],['How does the singer go to work?','The singer goes to work by bus.'],['Where is the golden key?','The golden key is in the museum.']];
export const locks=[['She is ___ artist.','an'],['I see an artist. ___ artist works at a museum.','the'],['He works at ___ museum.','a']];
export function questionText(tokens:unknown,place:typeof places[number]){return Array.isArray(tokens)?tokens.map(id=>place.tokens[Number(String(id).slice(1))]||'').join(' '):'';}
export function questProgress(state:LessonState){const a=state.answers,g=(k:string)=>a[questPrefix+k];let done=0;for(const place of places){if(g('match/'+place.id)===place.job)done++;if(g('interview/'+place.id)===true)done++;if(g('letter/'+place.id)===true)done++;if(place.id!=='museum'&&g('exclude/'+place.id)===true)done++;}locks.forEach((l,i)=>{if(g('lock/'+i)===l[1])done++;});guardian.forEach((_,i)=>{if(typeof g('guardian/'+i)==='string'&&(g('guardian/'+i) as string).trim())done++;});if(g('completed')===true)done++;return {done,total:33};}
