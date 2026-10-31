import { Landmark, Coffee, Clapperboard, HeartPulse, BedDouble, Columns3, Trees, Utensils, Trophy, Theater, Bike, Sailboat, Bus, Car, Plane, CarTaxiFront, TrainFront, TramFront, TrainFrontTunnel } from 'lucide-react';
const symbols={bank:Landmark,'café':Coffee,cinema:Clapperboard,hospital:HeartPulse,hotel:BedDouble,museum:Columns3,park:Trees,restaurant:Utensils,stadium:Trophy,theatre:Theater,bike:Bike,boat:Sailboat,bus:Bus,car:Car,plane:Plane,taxi:CarTaxiFront,train:TrainFront,tram:TramFront,underground:TrainFrontTunnel};
export function Symbol({name,...rest}:{name:string;x?:number;y?:number;size?:number}){
 const Icon=symbols[name as keyof typeof symbols];
 return Icon?<Icon {...rest} strokeWidth={1.7} />:<svg x={rest.x} y={rest.y} width={rest.size||24} height={rest.size||24} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="15" cy="46" r="10"/><circle cx="50" cy="46" r="10"/><path d="m15 46 13-18h11l11 18M22 25h13l-3-6h-8M39 28l-4 18H15M38 19h7l5 27M29 29l6 17"/><path d="M29 30h13l-5 8H23" fill="currentColor"/></svg>;
}
export default function WordArt({name,label}:{name:string;label:string}){
 return <svg className="ps2-word-art" role="img" aria-label={label} viewBox="0 0 180 125"><rect x="2" y="2" width="176" height="121" rx="24" fill="#e8f0e6"/><circle cx="136" cy="31" r="17" fill="#f4d780"/><path d="M15 108Q70 83 166 108" fill="none" stroke="#c9d9c1" strokeWidth="12"/><g color="#315a46"><Symbol name={name} x={56} y={27} size={70}/></g><path d="m26 28 3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#c29a40"/></svg>;
}
export function TownArt(){
 const buildings=['bank','hospital','hotel','theatre','café'];
 return <svg className="ps2-town" role="img" aria-label="Волшебный город с пятью пронумерованными зданиями. Определи места по рисункам на фасадах." viewBox="0 0 760 285"><rect width="760" height="285" rx="24" fill="#e9f2ed"/><circle cx="684" cy="43" r="24" fill="#f5d882"/><path d="M0 264Q200 200 380 255T760 245" stroke="#dcc89c" strokeWidth="24" fill="none"/>{buildings.map((name,i)=><g key={name} transform={`translate(${18+i*149},58)`}><rect x="2" y="45" width="128" height="145" rx="12" fill={i%2?'#f9e7bb':'#fff9e8'} stroke="#ac9870" strokeWidth="2"/><path d="M-3 47 66 0l72 47Z" fill="#3f6b54"/><rect x="50" y="149" width="30" height="41" rx="8" fill="#6c9ba5"/><g color="#315a46"><Symbol name={name} x={35} y={70} size={60}/></g><circle cx="22" cy="174" r="18" fill="#f1d27c"/><text x="22" y="181" textAnchor="middle" fontSize="22" fontFamily="system-ui" fill="#294534" fontWeight="800">{i+1}</text></g>)}</svg>;
}
