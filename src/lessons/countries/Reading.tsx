import { assetUrl } from '../../assetUrl';
import { blogIntro, blogMonths, blogPictures, readingAdjectives, readingStatements } from './data';
import { BookLink, Choice, Done, Exercise, Field, GapLines, StrongText } from './Controls';
export default function Reading(){return <>
 <Exercise id="p19-5a" number="5A" instruction="Work in pairs. Look at the photos in the blog (A–C). Which countries are they?">
  <div className="ct-blog-pictures">{blogPictures.map(([letter,caption])=><figure key={letter}><figcaption>{caption}</figcaption><img src={assetUrl(`/art/lesson-4/textbook/p19-${letter.toLowerCase()}.webp`)} alt={`Photo ${letter}`} loading="lazy"/><label>{letter}<Field id={`p19/5a/${letter.toLowerCase()}`} label={`Page 19, Exercise 5A, country in photo ${letter}`} wide/></label></figure>)}</div>
 </Exercise>
 <Exercise id="p19-5b" number="5B" instruction="Read the blog and check your answers.">
  <article className="ct-blog"><div><h3>Hi and welcome!</h3><h4>Who are we?</h4>{blogIntro.map(paragraph=><p key={paragraph}><StrongText text={paragraph}/></p>)}</div><div className="ct-blog-months"><h3>2OnABikeUK</h3>{blogMonths.map(([month,text])=><p key={month}><span>{month}: </span><StrongText text={text}/></p>)}</div></article><Done id="p19/5b/done"/>
 </Exercise>
 <Exercise id="p19-5c" number="5C" instruction="Read the blog again. Are the statements True (T) or False (F)?"><ol className="ct-numbered">{readingStatements.map((statement,i)=><li key={statement}><span>{i+1}. {statement}</span>{i===0?<span className="ct-given">T</span>:<Choice id={`p19/5c/${i+1}`} label={`Page 19, Exercise 5C, statement ${i+1}`} options={['True','False']}/>}</li>)}</ol></Exercise>
 <Exercise id="p19-5d" number="5D" instruction="Complete the sentences with the words in bold in the blog."><ol className="ct-numbered">{readingAdjectives.map((sentence,i)=><li key={sentence}><span>{i+1}.</span><GapLines id="p19/5d" lines={[sentence]} label="Page 19, Exercise 5D"/></li>)}</ol></Exercise>
 <Exercise id="p19-5e" number="5E" instruction="Learn and practise. Go to the Vocabulary Bank."><BookLink block="adjectives">page 127 VOCABULARY BANK common adjectives (1)</BookLink></Exercise>
 </>;}
