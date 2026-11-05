import type {Task,Unit} from './course';
import {jobs} from './jobsData';
const source=(n:number)=>`Go Getter 3 Student’s Book, p. 6, Exercise ${n}. Учебная цель сохранена; интерактивный формат и дополнительные формулировки авторские.`;
const jobTasks=(kind:string,make:(job:typeof jobs[number])=>string):Task[]=>jobs.map(job=>({id:`jobs-${kind}-${job.id}`,prompt:make(job),job:job.id}));
export const jobQuestions:Unit={id:'jobs-questions',title:'Ask about their jobs',text:'Преврати утверждение в вопрос с Does. Напиши вопрос целиком.',book:source(4),tasks:jobTasks('question',job=>`A${job.name==='artist'?'n':''} ${job.name} ${job.action} ${job.place}.`)};
const mini=(id:string,prompt:string,options?:string[]):Task=>({id:`qw-${id}`,prompt,options});
export const questionWordUnits:Unit[]=[
 {id:'qw-formula',title:'Question Words',text:'Чтобы узнать что-то конкретное, поставь вопросительное слово перед do / does. После does основной глагол остаётся без -s.',formula:['Question word','do / does','subject','verb?'],examples:[['What does your dad do?','Кем работает твой папа?'],['Where does a doctor work?','Где работает врач?'],['What does a nurse wear at work?','Что медсестра или медбрат носит на работе?'],['When does a teacher start work?','Когда учитель начинает работу?'],['How does a pilot travel to work?','Как пилот добирается до работы?']],book:source(4)},
 {id:'qw-what',title:'What — что? какой?',text:'What помогает спросить о вещи или действии. What does … do? — вопрос о профессии: «Кем работает …?»',examples:[['What does a chef cook?','Что готовит повар?']],book:source(4)},
 {id:'qw-where',title:'Where — где? куда?',text:'Where спрашивает о месте или направлении.',examples:[['Where does a farmer work?','Где работает фермер?']],book:source(4)},
 {id:'qw-when',title:'When — когда?',text:'When спрашивает о времени: дне, дате или часе.',examples:[['When does a shop assistant start work?','Когда продавец начинает работу?']],book:source(4)},
 {id:'qw-who',title:'Who — кто?',text:'Who спрашивает о человеке. Если Who само выполняет действие, do / does не нужен: Who + verb. В Present Simple обычно используем форму с -s: Who works …?',formula:['Who','verb (+ s/es)','…?'],examples:[['Who works at a hospital?','Кто работает в больнице?'],['Who helps animals?','Кто помогает животным?']],book:source(4)},
 {id:'qw-how',title:'How — как?',text:'How спрашивает о способе действия. Для дороги на работу ответ может начинаться с by: by bus, by bike. On foot — пешком.',examples:[['How does an office worker travel to work?','Как офисный работник добирается до работы?']],book:source(4)},
 {id:'qw-choose',title:'Choose the question word',text:'Выбери вопросительное слово по смыслу ответа.',tasks:[
  mini('choose-job','___ does your mum do? — She is a singer.',['What','Where','When','Who','How']),
  mini('choose-place','___ does a vet work? — At an animal hospital.',['What','Where','When','Who','How']),
  mini('choose-time','___ does a bus driver start work? — At six.',['What','Where','When','Who','How']),
  mini('choose-person','___ builds houses? — A builder.',['What','Where','When','Who','How']),
  mini('choose-travel','___ does a footballer go to work? — By train.',['What','Where','When','Who','How']),
 ],book:source(4)},
];
export const questionMachineUnit:Unit={id:'question-machine',title:'The Question Machine',text:'Собери вопрос из отдельных частей. Нажимай на карточки по порядку; выбранную часть можно убрать, нажав на неё ещё раз.',tasks:[
 {id:'gg6-machine-where',prompt:'Спроси, где работает ветеринар.',chunks:['work?','a vet','Where','does']},
 {id:'gg6-machine-what',prompt:'Спроси, что носит медсестра или медбрат.',chunks:['wear?','does','a nurse','What']},
 {id:'gg6-machine-when',prompt:'Спроси, когда певица начинает работать.',chunks:['the singer','start work?','When','does']},
 {id:'gg6-machine-who',prompt:'Спроси, кто работает на ферме.',chunks:['on a farm?','Who','works']},
 {id:'gg6-machine-how',prompt:'Спроси, как полицейский добирается до работы.',chunks:['travel to work?','the police officer','does','How']},
 ],book:'Авторский конструктор по Question Words, Go Getter 3, p. 6.',teacherHints:['После сборки задайте вопрос ученице и выслушайте полный устный ответ. Затем поменяйтесь ролями.','Where does a vet work? What does a nurse wear? When does the singer start work? Who works on a farm? How does the police officer travel to work?']};
