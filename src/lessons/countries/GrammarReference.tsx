import type { ReactNode } from 'react';
import { OriginalReference } from './Controls';
function Examples({children}:{children:ReactNode}){return <p className="ct-examples">{children}</p>;}
function RuleTable({headers,rows}:{headers:readonly string[];rows:readonly (readonly string[])[]}){return <table className="ct-readable-table"><thead><tr>{headers.map(header=><th key={header} scope="col">{header}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i}>{row.map((value,j)=><td key={j} data-label={headers[j]}>{value}</td>)}</tr>)}</tbody></table>;}
export function ReminderIYou(){return <aside className="ct-rule" aria-label="Grammar Reminder — To be: I and you"><h2>Grammar Reminder — To be: I and you</h2>
 <RuleTable headers={['Affirmative','Negative','Question']} rows={[['I am / I’m','I’m not','Am I?'],['You are / You’re','You aren’t','Are you?']]}/>
 <p>Use <strong>be</strong> to talk about your name, country or age. Put <strong>am / are</strong> before the subject in a question.</p>
 <ul><li>I’m from Russia.</li><li>You’re from Canada.</li><li>I’m not from London.</li><li>Are you British?</li><li>Where are you from?</li></ul>
 <h3>Short answers</h3><p>Yes, I am. · No, I’m not. · Yes, you are. · No, you aren’t.</p>
 </aside>;}
export function ReminderWeYouThey(){return <aside className="ct-rule" aria-label="Grammar Reminder — To be: We, You, They"><h2>Affirmative, negative and questions</h2>
 <RuleTable headers={['Subject','Affirmative','Negative','Question']} rows={['We','You','They'].map(subject=>[subject,subject+' are / '+subject+'’re',subject+' aren’t','Are '+subject.toLowerCase()+'?'])}/>
 <h3>Short answers</h3><ul><li>Yes, we are. / No, we aren’t.</li><li>Yes, you are. / No, you aren’t.</li><li>Yes, they are. / No, they aren’t.</li></ul>
 <h3>Wh-questions</h3><p className="ct-formula"><span>Question word</span> + <span>are</span> + <span>subject</span> + … ?</p>
 <ul><li>Where are they from?</li><li>Who are they?</li><li>How old are they?</li><li>Where are you now?</li><li>Why are they tired?</li></ul>
 <h3>To be or Present Simple?</h3><p>Use <strong>are</strong> to ask about identity, location or a state. Use <strong>do</strong> with another verb, such as <strong>work, live</strong> or <strong>have</strong>.</p>
 <RuleTable headers={['To be','Present Simple with do']} rows={[['Are they students?','Do they work here?'],['Where are they from?','Where do they live?'],['Are they tired?','Do they have a car?']]}/>
 </aside>;}
export function Reference92(){return <div className="ct-reference-text"><h3>1A present simple be: I, you</h3>
 <p>Use <em>be</em> in the present simple to say your name, your country and your age.</p><Examples>I’m Nadia. I’m from Argentina. I’m seven.</Examples>
 <p>We use <em>be</em> with a subject pronoun.</p><Examples>I’m from Canada. NOT <s>Am from Canada.</s></Examples>
 <h4>Positive (+)</h4><table><thead><tr><th>subject</th><th>be</th><th>phrase</th></tr></thead><tbody><tr><td>I</td><td>’m<br/>am</td><td>Ottavia.<br/>nine.</td></tr><tr><td>You</td><td>’re<br/>are</td><td>a student.<br/>from the UK.</td></tr></tbody></table>
 <p>We use ’ for a missing letter.</p><Examples>I am → I’m · You are → You’re</Examples>
 <p>We use contractions (I’m, you’re) in speaking and in emails and messages to friends.</p><Examples>I’m Tracy. You’re a teacher.</Examples>
 <h4>Negative (-)</h4><table><thead><tr><th>subject</th><th>be + not</th><th>phrase</th></tr></thead><tbody><tr><td>I</td><td>’m not<br/>am not</td><td>John.<br/>in Paris.</td></tr><tr><td>You</td><td>aren’t<br/>are not</td><td>from Spain.<br/>American.</td></tr></tbody></table>
 <p>We use a contraction (aren’t) in speaking and in emails and messages to friends.</p><Examples>You aren’t in Italy.</Examples><p>We can also say <strong>You’re not.</strong></p><Examples>You’re not American.</Examples>
 <h4>Yes/No questions</h4><Examples>You are a student. → Are you a student?</Examples><table><thead><tr><th>be</th><th>subject</th><th>phrase</th></tr></thead><tbody><tr><td>Am</td><td>I</td><td>in class A1?</td></tr><tr><td>Are</td><td>you</td><td>OK?</td></tr></tbody></table>
 <h4>Short answers</h4><table><thead><tr><th>Yes/No</th><th>subject</th><th>be</th></tr></thead><tbody><tr><td>Yes,</td><td>I</td><td>am.</td></tr><tr><td>No,</td><td>I</td><td>’m not.</td></tr><tr><td>Yes,</td><td>you</td><td>are.</td></tr><tr><td>No,</td><td>you</td><td>aren’t.</td></tr></tbody></table>
 <p>We don’t use contractions with short answers with <em>yes</em>.</p><Examples>Yes, I am. NOT <s>Yes, I’m.</s> · Yes, you are. NOT <s>Yes, you’re.</s></Examples><p>We can also say <strong>No, you’re not.</strong></p>
 <h4>Wh- questions with Where</h4><table><thead><tr><th>Where</th><th>be</th><th>subject</th></tr></thead><tbody><tr><td>Where</td><td>am</td><td>I?</td></tr><tr><td>Where</td><td>are</td><td>you from?</td></tr></tbody></table><OriginalReference page={92}/>
 </div>;}
export function Reference96(){return <div className="ct-reference-text"><h3>2A present simple be: we, you, they</h3><p>We use <em>you</em> for one person or for two, three, four, etc., people.</p>
 <h4>Positive (+)</h4><table><thead><tr><th>subject</th><th>be</th><th>phrase</th></tr></thead><tbody><tr><td>We<br/>You<br/>They</td><td>’re<br/>are</td><td>Spanish.<br/>actors.<br/>married.</td></tr></tbody></table>
 <p>We use ’ for a missing letter.</p><Examples>We are → We’re · You are → You’re · They are → They’re</Examples><p>We use contractions (we’re, you’re, they’re) in speaking and in emails and messages to friends.</p><Examples>We’re waiters. You’re happy. They’re from Italy.</Examples>
 <h4>Negative (-)</h4><table><thead><tr><th>subject</th><th>be + not</th><th>phrase</th></tr></thead><tbody><tr><td>We<br/>You<br/>They</td><td>aren’t<br/>are not</td><td>from the UK.<br/>students.<br/>old.</td></tr></tbody></table><p>We use a contraction (they aren’t) in speaking and in emails and messages to friends.</p><Examples>They aren’t Polish.</Examples>
 <p>We can also say <em>We’re not, You’re not, They’re not.</em></p><Examples>We’re not tired. You’re not young. They’re not new.</Examples>
 <h4>Yes/No questions</h4><Examples>They are actors. → Are they actors?</Examples><table><thead><tr><th>be</th><th>subject</th><th>phrase</th></tr></thead><tbody><tr><td>Are</td><td>we<br/>you<br/>they</td><td>in Paris?<br/>from Colombia?<br/>office workers?</td></tr></tbody></table>
 <h4>Short answers</h4><table><thead><tr><th>Yes/No</th><th>subject</th><th>be</th></tr></thead><tbody><tr><td>Yes,</td><td>we<br/>you<br/>they</td><td>are.</td></tr><tr><td>No,</td><td>we<br/>you<br/>they</td><td>aren’t.</td></tr></tbody></table><p>We don’t use contractions with short answers with <em>yes</em>.</p><Examples>Yes, we are. NOT <s>Yes, we’re.</s></Examples><p>We can also say <strong>No, we’re not.</strong></p>
 <h4>Wh- questions</h4><table><thead><tr><th>Wh- question word</th><th>be</th><th>subject</th></tr></thead><tbody><tr><td>Who</td><td>are</td><td>we?</td></tr><tr><td>Where</td><td>are</td><td>they from?</td></tr></tbody></table><OriginalReference page={96}/>
 </div>;}
