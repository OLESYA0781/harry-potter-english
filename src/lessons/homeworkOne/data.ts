export const homeworkOnePrefix='@vika/lesson/lesson-1-homework/v1/';
export const agencyKey=`${homeworkOnePrefix}job-agency`;
export const notebookKey=(id:'town'|'transport'|'routine')=>`${homeworkOnePrefix}notebook/${id}`;
export const answerKey=(task:'interview'|'negatives'|'detective',id:string)=>`${homeworkOnePrefix}written/${task}/${id}`;
export const agencyJobs=[
 ['artist','artist'],['builder','builder'],['bus-driver','bus driver'],['chef','chef'],['doctor','doctor'],['farmer','farmer'],['footballer','footballer'],['nurse','nurse'],['office-worker','office worker'],['pilot','pilot'],['police-officer','police officer'],['shop-assistant','shop assistant'],['singer','singer'],['teacher','teacher'],['vet','vet'],
].map(([id,label])=>({id,label}));
// Owner-requested topics, with authored vocabulary variations. No answer map or grading.
export const agencyDescriptions=[
 ['paint','I paint pictures.'],['houses','I build houses.'],['bus','I drive a bus.'],['restaurant-cook','I cook food in a restaurant.'],['hospital-help','I help sick people at a hospital.'],['farm-vegetables','I grow vegetables on a farm.'],['stadium-football','I play football at a stadium.'],['patient-care','I look after patients and help doctors.'],['office-emails','I work at a bank and write emails.'],['planes','I fly planes.'],['town-safe','I help people and keep the town safe.'],['shop-customers','I help customers in a shop.'],['stage-songs','I sing songs at the theatre.'],['school-children','I teach children at school.'],['sick-animals','I help sick animals.'],
].map(([id,text])=>({id,text}));
export const townSentences=[
 'Художник рисует картины в музее.','Повар готовит ужин в ресторане.','Продавец иногда ездит в кинотеатр на метро.','Футболист тренируется на стадионе.','Гермиона ест кашу на завтрак.','Полицейский обычно обедает в кафе.','Пилот останавливается в отеле после работы.','Офисный работник пишет письма в банке.','Певица выступает в театре по субботам.','Строитель отдыхает в парке после работы.',
];
export const transportSentences=[
 'Певец ездит в театр на трамвае.','Медсестра ездит на работу на велосипеде.','Строитель ездит на работу на автобусе.','Продавец ездит в кафе на такси.','Офисный работник путешествует на самолёте.','Ветеринар иногда путешествует на лодке.','Учитель ездит в музей на метро.','Полицейский ездит в парк на машине.','Фермер ездит на работу на мотоцикле.','Повар ездит в отель на поезде.',
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
 ['morning-tea','A farmer usually eats breakfast at six.'],['nurse-hospital','A singer often goes to the theatre by taxi.'],['plane-travel','Office workers sometimes travel by plane.'],['brother-football','A footballer always trains at the stadium.'],['emma-bike','A teacher usually goes to school by bike.'],
].map(([id,text])=>({id,text}));
export const detectiveSentences=[
 ['she-works','The artist is works at a museum.'],['harry-plays','The builder is travel by train every day.'],['they-go','The nurses are go to work by tram.'],['mother-teacher','My father a bus driver.'],['hermione-studies','The shop assistant studies is English.'],['we-visit','The vets are usually visit the park.'],
].map(([id,text])=>({id,text}));
export const taskTitles=['The Hogwarts Job Agency','The Magic Town','How Do They Get to Work?','The Secret Interview','My Magical Weekly Routine','The Magic of Negatives','The Grammar Detective — Find and Correct the Mistake'];
