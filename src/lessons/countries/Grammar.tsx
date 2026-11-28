import { bank96choices, bank96conversation, bank96pronouns, grammar6a } from './data';
import { Choice, Exercise, GapLines, StrongText, Written } from './Controls';
import { Reference96, ReminderWeYouThey } from './GrammarReference';
export default function Grammar(){return <>
 <ReminderWeYouThey/>
 <Exercise id="p19-6a" number="6A" instruction="Complete the sentences with the words in the box. Use the blog to help you."><p className="ct-word-bank">are · ’re (x2) · we · aren’t</p><ol className="ct-numbered">{grammar6a.map((sentence,i)=><li key={sentence}><span>{i+1}.</span><GapLines id="p19/6a" lines={[sentence]} label="Page 19, Exercise 6A"/></li>)}</ol></Exercise>
 <Exercise id="p19-6b" number="6B" instruction="Learn and practise. Go to the Grammar Bank."><p className="ct-source-link">page 96 GRAMMAR BANK</p>
  <details className="ct-bank-reference"><summary>REFERENCE — page 96</summary><Reference96/></details>
  <div className="ct-bank"><h3>Grammar Bank — page 96</h3>
   <Exercise id="p96-1" number="1" instruction="Choose the correct alternative."><p>A: This is a photo of Ruby and Max.</p><div className="ct-lines">{bank96choices.map(line=><p key={line.id}><sup>{line.id}</sup>{line.before}{'given' in line?<><span className="ct-given">{line.options[0]}</span> / {line.options[1]}</>:<Choice id={`p96/1/${line.id}`} label={`Page 96, Exercise 1, alternative ${line.id}`} options={line.options}/>} {line.after}</p>)}</div></Exercise>
   <Exercise id="p96-2" number="2" instruction="Change the phrases in bold to we, they or you. Write the complete sentence."><ol className="ct-numbered ct-sentence-writing">{bank96pronouns.map((sentence,i)=><li key={sentence}><p>{i+1}. <StrongText text={sentence}/></p>{i===0?<p className="ct-given">They’re singers.</p>:<Written id={`p96/2/${i+1}`} label={`Page 96, Exercise 2, sentence ${i+1}`}/>}</li>)}</ol></Exercise>
   <Exercise id="p96-3" number="3" instruction="Complete the conversation with the words in the box."><p className="ct-word-bank">are (x2) · <s>’s</s> · I · it’s · ’m · n’t · ’re · what · where · we · we’re · you</p><GapLines id="p96/3" lines={bank96conversation} label="Page 96, Exercise 3"/></Exercise>
  </div>
 </Exercise>
 </>;}
