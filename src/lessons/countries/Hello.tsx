import { useState } from 'react';
import { assetUrl } from '../../assetUrl';
import { bank92a, bank92b, cityOptions, countryOptions, hello2a, hello3a } from './data';
import { Audio, Done, Exercise, Field, GapLines, Select, Written } from './Controls';
import { Reference92, ReminderIYou } from './GrammarReference';
export default function Hello(){
 const [bankOpen,setBankOpen]=useState(false);
 return <>
  <Exercise id="p8-1a" number="1A" instruction="Listen and match the conversations (1 and 2) with the photos (A and B)."><Audio track="1.01"/><div className="ct-photo-pair">{['A','B'].map(letter=><figure key={letter}><img src={assetUrl(`/art/lesson-4/textbook/p8-${letter.toLowerCase()}.webp`)} alt={`Photo ${letter}`} loading="lazy"/><figcaption>{letter}</figcaption></figure>)}</div><div className="ct-matches">{[1,2].map(number=><label key={number}>Conversation {number}<Select id={'p8/1a/'+number} label={`Page 8, Exercise 1A, conversation ${number}`} options={['A','B']}/></label>)}</div></Exercise>
  <Exercise id="p8-1b" number="1B" instruction="Work in pairs. Match the names with the countries and cities.">
   <div className="ct-options-table"><div><strong>name</strong><p>James</p><p>Sonia</p><p>Jack</p></div><div><strong>country</strong>{countryOptions.map(country=><p key={country}>{country}</p>)}</div><div><strong>city</strong>{cityOptions.map(city=><p key={city}>{city}</p>)}</div></div>
   <p className="ct-given">James → Canada → Vancouver</p>
   <div className="ct-matches">{['Sonia','Jack'].map(person=><div key={person}><h3>{person}</h3><label>country<Select id={`p8/1b/${person.toLowerCase()}/country`} label={`Page 8, Exercise 1B, ${person}, country`} options={countryOptions}/></label><label>city<Select id={`p8/1b/${person.toLowerCase()}/city`} label={`Page 8, Exercise 1B, ${person}, city`} options={cityOptions}/></label></div>)}</div>
  </Exercise>
  <Exercise id="p8-1c" number="1C" instruction="Listen again and check."><Audio track="1.01"/><Done id="p8/1c/done"/></Exercise>
  <ReminderIYou/>
  <Exercise id="p8-2a" number="2A" instruction="Complete the sentences with am, ’m or are."><GapLines id="p8/2a" lines={hello2a} label="Page 8, Exercise 2A"/></Exercise>
  <Exercise id="p8-2b" number="2B" instruction="Learn and practise. Go to the Grammar Bank."><button type="button" className="ct-book-link" aria-expanded={bankOpen} onClick={()=>setBankOpen(value=>!value)}>page 92 GRAMMAR BANK</button>
   {bankOpen&&<div className="ct-bank"><Reference92/>
    <Exercise id="p92-1" number="1" instruction="Complete the conversation with the words in the box."><p className="ct-word-bank">am · are (x2) · I (x2) · <s>’m</s> · not · you</p><GapLines id="p92/1" lines={bank92a} label="Page 92, Exercise 1"/></Exercise>
    <Exercise id="p92-2" number="2" instruction="Change five verbs (am, are) to contractions (’m, ’re) in each conversation.">{bank92b.map((conversation,i)=><article className="ct-dialogue-card" key={i}><h3>{i+1}</h3>{conversation.map((line,j)=><p key={j}>{i===0&&j===1?<>B: Hey Leah. <s>I am</s> <span className="ct-given">I’m</span> well, thanks. Where are you?</>:line}</p>)}<Written id={`p92/2/${i+1}`} label={`Page 92, Exercise 2, conversation ${i+1}`} rows={7}/></article>)}</Exercise>
    <img className="ct-bank-photo" src={assetUrl('/art/lesson-4/textbook/p92-photo.webp')} alt="Original photograph from Grammar Bank page 92" loading="lazy"/>
   </div>}
  </Exercise>
  <Exercise id="p8-3a" number="3A" instruction="Complete the conversation."><GapLines id="p8/3a" lines={hello3a} label="Page 8, Exercise 3A"/></Exercise>
  <Exercise id="p8-3b" number="3B" instruction="Listen and check."><Audio track="1.02"/><Done id="p8/3b/done"/></Exercise>
  <Exercise id="p8-3c" number="3C" instruction="Complete the sentence about you."><p className="ct-about-me">I’m <label><Field id="p8/3c/name" label="Page 8, Exercise 3C, first name"/><small>(first name)</small></label>. I’m from <label><Field id="p8/3c/city" label="Page 8, Exercise 3C, city"/><small>(city)</small></label> in <label><Field id="p8/3c/country" label="Page 8, Exercise 3C, country"/><small>(country)</small></label>.</p></Exercise>
  <Exercise id="p8-3d" number="3D" instruction="Work in pairs. Say your name, country and town or city. Use Ex 3A to help you."><p>A: Hello, I’m …</p><p>B: Hi, I’m …</p><Done id="p8/3d/done" label="Done with my teacher"/></Exercise>
 </>;
}
