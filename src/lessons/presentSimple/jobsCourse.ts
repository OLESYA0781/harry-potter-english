import type {Task,Unit} from './course';
import {jobs,jobCategories} from './jobsData';
const source=(n:number)=>`Go Getter 3 Student’s Book, p. 6, Exercise ${n}. Учебная цель сохранена; интерактивный формат и дополнительные формулировки авторские.`;
const jobTasks=(kind:string,make:(job:typeof jobs[number])=>string):Task[]=>jobs.map(job=>({id:`jobs-${kind}-${job.id}`,prompt:make(job),job:job.id}));
export const jobQuestions:Unit={id:'jobs-questions',title:'Ask about their jobs',text:'Преврати утверждение в вопрос с Does. Напиши вопрос целиком.',book:source(4),tasks:jobTasks('question',job=>`A${job.name==='artist'?'n':''} ${job.name} ${job.action} ${job.place}.`)};
export const jobFrequency:Unit={id:'jobs-frequency',title:'A working day',text:'Вставь наречие в правильное место и перепиши предложение целиком.',book:source(5),tasks:jobs.slice(10).map((job,i)=>({id:`jobs-frequency-${job.id}`,prompt:`The ${job.name} goes to work ${job.transport}. (${['always','usually','often','sometimes','never'][i]})`,job:job.id}))};
const mini=(id:string,prompt:string,options?:string[]):Task=>({id:`qw-${id}`,prompt,options});
export const questionWordUnits:Unit[]=[
 {id:'qw-formula',title:'Question Words',text:'Чтобы узнать что-то конкретное, поставь вопросительное слово перед do / does. После does основной глагол остаётся без -s.',formula:['Question word','do / does','subject','verb?'],examples:[['What does your dad do?','Кем работает твой папа?'],['Where does a doctor work?','Где работает врач?'],['What does a nurse wear at work?','Что медсестра или медбрат носит на работе?'],['When does a teacher start work?','Когда учитель начинает работу?'],['How does a pilot travel to work?','Как пилот добирается до работы?']],book:source(4)},
 {id:'qw-what',title:'What — что? какой?',text:'What помогает спросить о вещи или действии. What does … do? — вопрос о профессии: «Кем работает …?»',examples:[['What does a chef cook?','Что готовит повар?']],tasks:[mini('what','___ does a nurse wear at work?',['When','What','Where'])],book:source(4)},
 {id:'qw-where',title:'Where — где? куда?',text:'Where спрашивает о месте или направлении.',examples:[['Where does a farmer work?','Где работает фермер?']],tasks:[mini('where','Составь вопрос: where / does / a builder / work?')],book:source(4)},
 {id:'qw-when',title:'When — когда?',text:'When спрашивает о времени: дне, дате или часе.',examples:[['When does a shop assistant start work?','Когда продавец начинает работу?']],tasks:[mini('when','___ does a teacher start work? — At eight.',['Who','When','How'])],book:source(4)},
 {id:'qw-who',title:'Who — кто?',text:'Who спрашивает о человеке. Если Who само выполняет действие, do / does не нужен: Who + verb. В Present Simple обычно используем форму с -s: Who works …?',formula:['Who','verb (+ s/es)','…?'],examples:[['Who works at a hospital?','Кто работает в больнице?'],['Who helps animals?','Кто помогает животным?']],tasks:[mini('who','Составь вопрос без does: who / helps / animals?')],book:source(4)},
 {id:'qw-how',title:'How — как?',text:'How спрашивает о способе действия. Для дороги на работу ответ может начинаться с by: by bus, by bike. On foot — пешком.',examples:[['How does an office worker travel to work?','Как офисный работник добирается до работы?']],tasks:[mini('how','___ does a pilot travel to work? — By taxi.',['Where','How','What'])],book:source(4)},
 {id:'qw-choose',title:'Choose the question word',text:'Выбери вопросительное слово по смыслу ответа.',tasks:[
  mini('choose-job','___ does your mum do? — She is a singer.',['What','Where','When','Who','How']),
  mini('choose-place','___ does a vet work? — At an animal hospital.',['What','Where','When','Who','How']),
  mini('choose-time','___ does a bus driver start work? — At six.',['What','Where','When','Who','How']),
  mini('choose-person','___ builds houses? — A builder.',['What','Where','When','Who','How']),
  mini('choose-travel','___ does a footballer go to work? — By train.',['What','Where','When','Who','How']),
 ],book:source(4)},
];
const interviewFields=['Job','Workplace','Clothes','Start time','Transport'];
const harryQuestions=['___ does your dad do?','___ does he work?','___ does he wear at work?','___ does he start work?','___ does he travel to work?'];
export const jobsLabUnits:Unit[]=[
 {id:'emma-uncle',title:'Emma’s Uncle',text:'Прочитай короткий диалог, затем заполни пропуски одним словом. Это текстовое задание. Studio — студия, own — свой, summer — лето.',dialogue:[['Poppy','Who is the man in the photo?'],['Emma','He is my Uncle Eric. He is an artist. He paints in his studio in Madrid.'],['Poppy','What does Aunt Eva do?'],['Emma','She is a chef. She has her own restaurant in Madrid.'],['Poppy','When do they visit you?'],['Emma','They usually visit us in the summer.']],tasks:[
 {id:'gg6-reading-artist',prompt:'Uncle Eric is an ___.'},
 {id:'gg6-reading-madrid',prompt:'Uncle Eric lives in ___.'},
 {id:'gg6-reading-chef',prompt:'Aunt Eva is a ___.'},
 {id:'gg6-reading-restaurant',prompt:'Eva has her own ___.'},
 {id:'gg6-reading-studio',prompt:'Where does Eric paint? Write a full sentence.'},
 {id:'gg6-reading-summer',prompt:'When do Eric and Eva visit Emma? Write a full sentence.'},
 ],book:source(1)+' Краткий авторский пересказ диалога; аудио не используется.',teacherHints:['Eric is an artist. He lives in Madrid and paints in his studio.','Eva is a chef and has her own restaurant.','They usually visit Emma in the summer.']},
 {id:'jobs-groups',title:'Where Do People Work?',text:'Для каждой профессии отметь все подходящие группы. Одна профессия может попасть в несколько групп. Условия работы бывают разными. Outdoors — на улице; indoors — в помещении; with children — с детьми; with animals — с животными; help other people — помогать другим людям.',tasks:jobs.map(job=>({id:`gg6-groups-${job.id}`,prompt:job.name,job:job.id,categories:jobCategories})),book:source(3),teacherHints:['Не требуйте единственного распределения: например, vet работает в помещении и на улице, с животными и помогает людям.','Попросите объяснить выбор: A farmer works outdoors. A teacher works with children.']},
 {id:'harry-interview',title:'Questions about Harry’s dad',text:'Выбери What, Where, When или How, затем напиши полный вопрос.',tasks:harryQuestions.flatMap((prompt,i)=>[
  {id:`gg6-harry-word-${i+1}`,prompt,options:['What','Where','When','How']},
  {id:`gg6-harry-question-${i+1}`,prompt:`Напиши вопрос ${i+1} целиком: ${prompt}`},
 ]),book:source(4),teacherHints:['What does your dad do?','Where does he work?','What does he wear at work?','When does he start work?','How does he travel to work?']},
 {id:'peter-factfile',title:'Job Factfile — Peter Nichols',text:'Рассмотри анкету и ответь на пять вопросов полными предложениями. White coat — белый халат, wear — носить, start work — начинать работу.',factfile:true,tasks:[
 {id:'gg6-peter-job',prompt:'What does Peter Nichols do?'},
 {id:'gg6-peter-place',prompt:'Where does he work?'},
 {id:'gg6-peter-clothes',prompt:'What does he wear at work?'},
 {id:'gg6-peter-time',prompt:'When does he usually start work?'},
 {id:'gg6-peter-transport',prompt:'How does he travel to work?'},
 ],book:source(5),teacherHints:['He is a doctor.','He works at Park Hill General Hospital.','He wears a white coat.','He usually starts work at 8 a.m.','He travels to work by motorbike.']},
 {id:'job-interview',title:'Job Interview',text:'Работа в паре с преподавателем: выберите профессию, задайте вопросы и заполните анкету. Затем поменяйтесь ролями.',teacherOnly:true,jobInterview:true,tasks:[1,2].flatMap(round=>interviewFields.map(field=>({id:`gg6-interview-r${round}-${field.toLowerCase().replaceAll(' ','-')}`,prompt:field,optional:true}))),book:source(6),teacherHints:['Раунд 1: ученица выбирает профессию; учитель задаёт What do you do? Where do you work? What do you wear? When do you start work? How do you travel to work?','Раунд 2: поменяйтесь ролями. Ученица задаёт вопросы, учитель отвечает; заполните вторую анкету. Используйте воображаемые ответы.']},
 {id:'guess-job',title:'Guess My Job',text:'Рассмотри картинку и прочитай подсказку. Назови профессию и напиши один или два вопроса о персонаже.',tasks:jobs.map(job=>({id:`gg6-guess-${job.id}`,prompt:`${job.hint} Who am I? Write the job and one or two questions.`,job:job.id})),book:'Авторская игровая практика лексики Go Getter 3, p. 6.',teacherHints:['Закройте подпись профессии и попросите ученицу назвать её по картинке и подсказке.','Устно задайте один-два вопроса: Where does this person work? What does this person do? How does this person travel to work?','Пройдите все 15 профессий. Не требуйте единственного варианта места работы.']},
 {id:'question-machine',title:'The Question Machine',text:'Собери вопрос из отдельных частей. Нажимай на карточки по порядку; выбранную часть можно убрать, нажав на неё ещё раз.',tasks:[
 {id:'gg6-machine-where',prompt:'Спроси, где работает ветеринар.',chunks:['work?','a vet','Where','does']},
 {id:'gg6-machine-what',prompt:'Спроси, что носит медсестра или медбрат.',chunks:['wear?','does','a nurse','What']},
 {id:'gg6-machine-when',prompt:'Спроси, когда певица начинает работать.',chunks:['the singer','start work?','When','does']},
 {id:'gg6-machine-who',prompt:'Спроси, кто работает на ферме.',chunks:['on a farm?','Who','works']},
 {id:'gg6-machine-how',prompt:'Спроси, как полицейский добирается до работы.',chunks:['travel to work?','the police officer','does','How']},
 ],book:'Авторский конструктор по Question Words, Go Getter 3, p. 6.',teacherHints:['После сборки задайте вопрос ученице и выслушайте полный устный ответ. Затем поменяйтесь ролями.','Where does a vet work? What does a nurse wear? When does the singer start work? Who works on a farm? How does the police officer travel to work?']},
];
