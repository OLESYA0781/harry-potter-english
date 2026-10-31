// Author-created oral activities. No grades, recording or mandatory written answers.
export type Scene={id:string;alt:string;questions?:string[];facts?:string[];answers?:string[]};
export const whoScenes:Scene[]=[
 {id:'harry-ron',alt:'Harry and Ron together as friends in Hogwarts school uniform.',questions:['Who are they?','Are they friends?','Are they Hogwarts students?','Are they enemies?',"Is Ron Harry’s best friend?"]},
 {id:'harry-draco',alt:'Harry and Draco face each other as school rivals.',questions:['Who are they?','Are they friends?','Are they enemies?',"Is Draco Harry’s best friend?",'Are they happy to see each other?']},
 {id:'hermione-draco',alt:'Hermione and Draco in school uniform, with unfriendly expressions.',questions:['Who are they?','Are they friends?','Is Hermione clever?',"Is Draco Hermione’s best friend?",'Are they Hogwarts students?']},
 {id:'harry-voldemort',alt:'Harry looks worried as he faces the adult Voldemort in a castle courtyard.',questions:['Who are they?','Are they friends?','Are they enemies?',"Is Voldemort Harry’s teacher?",'Is Harry afraid?']},
];
export const roomQuestions=['Is the room big or small?','Are the books on the table?','Is the owl near the window?','Is the wand on the desk?','Are there three chairs?','Is the cat near the fireplace?','Is the room dark?','Where is the owl?','Is that a park outside?','Is there a café near the park?','Is that a bus or a train?'];
export const falseScenes:Scene[]=[
 {id:'rivals',alt:'Harry and Draco stand apart as rivals in a Hogwarts corridor.',facts:['Harry and Draco are best friends.',"Draco is Harry’s brother.","Draco is Harry’s best friend."],answers:['Harry and Draco are not best friends. They are rivals.',"Draco is not Harry’s brother.","Draco is not Harry’s best friend."]},
 {id:'common-room',alt:'Hogwarts students and professors in a common room with books, seats and a fireplace.',facts:['The students are in the garden.','The room is empty.','There are no books in the room.'],answers:['The students are in the common room.','The room is not empty.','There are books in the room.']},
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
export const oralKeys={who:'visual:v1:who:scene',falseFacts:'visual:v1:false:scene',townGroup:'visual:v1:town:group'};
export const wordKey=(id:string)=>`visual:v1:town:reveal:${id}`;
