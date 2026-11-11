export const homeworkOnePrefix='@vika/lesson/lesson-1-homework/v1/';
export const agencyKey=`${homeworkOnePrefix}job-agency`;
export const notebookKey=(id:'town'|'transport'|'routine')=>`${homeworkOnePrefix}notebook/${id}`;
export const answerKey=(task:'interview'|'negatives'|'detective',id:string)=>`${homeworkOnePrefix}written/${task}/${id}`;
export const agencyJobs=[
 ['artist','artist'],['builder','builder'],['bus-driver','bus driver'],['chef','chef'],['doctor','doctor'],['farmer','farmer'],['footballer','footballer'],['nurse','nurse'],['office-worker','office worker'],['pilot','pilot'],['police-officer','police officer'],['shop-assistant','shop assistant'],['singer','singer'],['teacher','teacher'],['vet','vet'],
].map(([id,label])=>({id,label}));
// Prompts are supplied by the owner. No correct-answer map or grading is shipped.
export const agencyDescriptions=[
 ['paint','I paint pictures.'],['houses','I build houses.'],['bus','I drive a bus.'],['restaurant-cook','I cook food in a restaurant.'],['hospital-help','I help sick people at a hospital.'],['farm-vegetables','I grow vegetables on a farm.'],['stadium-football','I play football at a stadium.'],['patient-care','I look after patients at a hospital.'],['office-emails','I work in an office and write emails.'],['planes','I fly planes.'],['town-safe','I help people and keep the town safe.'],['shop-customers','I help customers in a shop.'],['stage-songs','I sing songs on a stage.'],['school-children','I teach children at school.'],['sick-animals','I help sick animals.'],
].map(([id,text])=>({id,text}));
export const townSentences=[
 'Художник ездит в музей на трамвае.','Повар готовит еду в ресторане.','Мы ездим в кинотеатр на поезде.','Футболист ездит на стадион на велосипеде.','Гермиона ест кашу на завтрак.','Моя семья иногда ездит в парк на машине.','Мы останавливаемся в отеле.','Мой папа работает в банке.','Певица выступает в театре.','Мы пьём чай в кафе.',
];
export const transportSentences=[
 'Учитель ездит на работу на велосипеде.','Врач ездит в больницу на автобусе.','Полицейский ездит на работу на машине.','Повар ездит в ресторан на такси.','Пилот путешествует на самолёте.','Фермер иногда путешествует на лодке.','Медсестра ездит на работу на метро.','Художник ездит в музей на трамвае.','Продавец ездит на работу на мотоцикле.','Футболист ездит на стадион на поезде.',
];
export const annaFacts=[['Name','Anna'],['Job','vet'],['Workplace','animal hospital'],['Starts work','9 a.m.'],['Travels to work','by bus'],['Usually helps','cats and dogs'],['Wears','a green coat']];
export const interviewQuestions=[
 ['job','What does Anna do?','Кем работает Анна?'],
 ['workplace','Where does Anna work?','Где работает Анна?'],
 ['start','When does Anna start work?','Когда Анна начинает работать?'],
 ['transport','How does Anna travel to work?','Как Анна добирается на работу?'],
 ['who','Who helps cats and dogs?','Кто помогает кошкам и собакам?'],
 ['clothes','What does Anna wear at work?','Что Анна носит на работе?'],
 ['restaurant','Does Anna work at a restaurant?','Анна работает в ресторане?'],
 ['bus','Does Anna travel to work by bus?','Анна ездит на работу на автобусе?'],
].map(([id,text,translation])=>({id,text,translation}));
export const frequencyWords=['always','usually','often','sometimes','never'];
export const negativeSentences=[
 ['morning-tea','I usually drink tea in the morning.'],['nurse-hospital','A singer often goes to the theatre by taxi.'],['plane-travel','They sometimes travel by plane.'],['brother-football','My brother always plays football at the stadium.'],['emma-bike','Emma usually goes to school by bike.'],
].map(([id,text])=>({id,text}));
export const detectiveSentences=[
 ['she-works','She is works at a museum.'],['harry-plays','Harry is travel by train every day.'],['they-go','They are go to the park by tram.'],['mother-teacher','My mother a teacher.'],['hermione-studies','Hermione studies is English.'],['we-visit','We are usually visit the park.'],
].map(([id,text])=>({id,text}));
export const taskTitles=['The Hogwarts Job Agency','The Magic Town','How Do They Get to Work?','The Secret Interview','My Magical Weekly Routine','The Magic of Negatives','The Grammar Detective — Find and Correct the Mistake'];
