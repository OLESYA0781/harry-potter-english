// Author-created oral activities. No grades, recording or mandatory written answers.
export type Scene={id:string;previousId?:string;alt:string;questions?:string[];facts?:string[];answers?:string[];picture?:{atlas:'pairs'|'places'|'transport';index:number}};
export const whoScenes:Scene[]=[
 {id:'harry-ron',alt:'Harry and Ron together as friends in Hogwarts school uniform.',questions:['Who are they?','Are they friends?','Are they Hogwarts students?','Are they enemies?',"Is Ron Harry’s best friend?"]},
 {id:'harry-draco',alt:'Harry and Draco face each other as school rivals.',questions:['Who are they?','Are they friends?','Are they enemies?',"Is Draco Harry’s best friend?",'Are they happy to see each other?']},
 {id:'hermione-draco',alt:'Hermione and Draco in school uniform, with unfriendly expressions.',questions:['Who are they?','Are they friends?','Is Hermione clever?',"Is Draco Hermione’s best friend?",'Are they Hogwarts students?']},
 {id:'harry-voldemort',alt:'Harry looks worried as he faces the adult Voldemort in a castle courtyard.',questions:['Who are they?','Are they friends?','Are they enemies?',"Is Voldemort Harry’s teacher?",'Is Harry afraid?']},
];
// Reuses the exact finished Magic Town artwork; prompts match each visible scene.
export const describeScenes:Scene[]=[
 {id:'cafe',picture:{atlas:'places',index:1},alt:'A café beside a green park, with students at an outdoor table.',questions:['What is this?','Is this a café or a hospital?','Is the café near the park?','Are they at the café?'],answers:['This is a café.','It is not a hospital.','The café is near the park.','They are at the café.']},
 {id:'museum',picture:{atlas:'places',index:5},alt:'Students inside a museum with a dinosaur fossil and statues.',questions:['Is this a museum?','Are they in the museum?','Are they at the cinema?'],answers:['This is a museum.','They are in the museum.','They are not at the cinema.']},
 {id:'park',picture:{atlas:'places',index:6},alt:'A green park with children, trees, benches and a pond.',questions:['Is this a park or a stadium?','Is the park green?','Are they in the park?'],answers:['This is a park.','It is green.','They are in the park.']},
 {id:'bus',picture:{atlas:'transport',index:2},alt:'Students on a red bus on a town road.',questions:['Is this a bus or a tram?','Is the bus red?','Are they on the bus?'],answers:['This is a bus.','It is red.','They are on the bus.']},
 {id:'car',picture:{atlas:'transport',index:3},alt:'A blue car with students inside.',questions:['Is this a car or a taxi?','Is the car blue?','Are they in the car?'],answers:['This is a car.','It is blue.','They are in the car.']},
 {id:'train',picture:{atlas:'transport',index:7},alt:'Students in a red train on railway tracks.',questions:['Is this a train?','Is it a bus?','Are they on the train?'],answers:['This is a train.','It is not a bus.','They are on the train.']},
 {id:'boat',picture:{atlas:'transport',index:1},alt:'Two students in a boat beside a green park.',questions:['Is this a boat?','Is the boat near the park?','Are they in the boat?'],answers:['This is a boat.','The boat is near the park.','They are in the boat.']},
 {id:'bikes',picture:{atlas:'transport',index:0},alt:'Harry and Ron on two pedal bikes near a park.',questions:['Are these bikes?','Are they motorbikes?','Are Harry and Ron friends?'],answers:['These are bikes.','They are not motorbikes.','Harry and Ron are friends.']},
];
export const describeFrames=['This is a … .','It is … .','It is not a … .','They are … .','They are not … .','I am … .'];
export const falseScenes:Scene[]=[
 {id:'rivals',alt:'Harry and Draco stand apart as rivals in a Hogwarts corridor.',facts:['Harry and Draco are best friends.',"Draco is Harry’s brother.","Draco is Harry’s best friend."],answers:['Harry and Draco are not best friends. They are rivals.',"Draco is not Harry’s brother.","Draco is not Harry’s best friend."]},
 {id:'hospital',previousId:'common-room',picture:{atlas:'places',index:3},alt:'A hospital with a medical cross and an ambulance.',facts:['This is a hotel.','This is a museum.','This is a bank.'],answers:['This is a hospital.','It is not a museum.','It is not a bank.']},
 {id:'library',alt:'Hermione and Ron, both schoolchildren, in a library with bookshelves.',facts:['Hermione is a teacher.',"Ron is Hermione’s father.",'They are in a swimming pool.'],answers:['Hermione is a student.',"Ron is not Hermione’s father. He is her friend.",'They are in the library.']},
];
export type TownWord={id:string;en:string;ru:string;alt:string;questions:string[]};
export const townPlaces:TownWord[]=[
 ['bank','bank','банк','A magical bank with a coin emblem and teller counter.',['Is this a bank?','Is this a museum?']],
 ['cafe','café','кафе','A café with coffee tables beside a green park.',['Is this a café?','Is the café near the park?']],
 ['cinema','cinema','кинотеатр','A cinema with a film screen and cinema seats.',['Is this a cinema or a theatre?']],
 ['hospital','hospital','больница','A hospital with a medical cross and ambulance.',['Is this a hotel or a hospital?']],
 ['hotel','hotel','отель','A welcoming hotel with luggage and a bed emblem.',['Is this a hotel?']],
 ['museum','museum','музей','A museum with a statue and dinosaur fossil.',['Is this a museum?']],
 ['park','park','парк','A green park with trees and benches.',['Is this a park?']],
 ['restaurant','restaurant','ресторан','A restaurant with dining tables, plates and a chef.',['Is this a restaurant?']],
 ['stadium','stadium','стадион','A football stadium with a field and spectator stands.',['Is this a stadium?']],
 ['theatre','theatre','театр','A theatre with red curtains and a stage.',['Is this a theatre or a cinema?']],
].map(([id,en,ru,alt,questions])=>({id,en,ru,alt,questions}) as TownWord);
export const townTransport:TownWord[]=[
 ['bike','bike','велосипед','Two pedal bicycles side by side.',['Are these bikes?']],
 ['boat','boat','лодка','A boat on a river beside a green park.',['Is this a boat?','Is the boat near the park?']],
 ['bus','bus','автобус','A red bus on a road without rails.',['Is this a bus or a tram?']],
 ['car','car','машина','A blue car.',['Is the car blue?']],
 ['motorbike','motorbike','мотоцикл','A motorcycle with an engine.',['Is this a motorbike or a bike?']],
 ['plane','plane','самолёт','A plane in the sky.',['Is this a plane?']],
 ['taxi','taxi','такси','A yellow taxi with a checker stripe.',['Is this a taxi?']],
 ['train','train','поезд','A train on railway tracks beside a station.',['Is this a train?']],
 ['tram','tram','трамвай','A tram on street rails with an overhead electric wire.',['Is this a bus or a tram?']],
 ['underground','underground','метро','A metro train in a below-street underground station.',['Is this the underground?']],
].map(([id,en,ru,alt,questions])=>({id,en,ru,alt,questions}) as TownWord);
export const oralKeys={who:'visual:v1:who:scene',falseFacts:'visual:v1:false:scene',townGroup:'visual:v1:town:group',describe:'visual:v1:describe:scene'};
export const wordKey=(id:string)=>`visual:v1:town:reveal:${id}`;

export const sceneIndex=(scenes:Scene[],selected:unknown)=>Math.max(0,scenes.findIndex(scene=>scene.id===selected || scene.previousId!==undefined && scene.previousId===selected));
