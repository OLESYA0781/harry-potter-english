import {affirmativeRows,negativeRows,questionRows} from './data';
const form=(text:string)=>text.split(/\b(am|is|are|not|isn't|aren't)\b/gi).map((part,i)=>/^(am|is|are|not|isn't|aren't)$/i.test(part)?<strong className="tb-key" key={i}>{part}</strong>:part);
export function ToBeTable({headers,rows}:{headers:string[];rows:string[][]}) {
 return <div className="tb-table" role="table"><div className="tb-table-head" role="row">{headers.map(title=><strong role="columnheader" key={title}>{title}</strong>)}</div>{rows.map((row,i)=><div className="tb-table-row" role="row" key={i}>{row.map((value,j)=><div role="cell" key={j}><span className="tb-cell-label" aria-hidden="true">{headers[j]}</span>{form(value)}</div>)}</div>)}</div>;
}
export default function ToBeTheory({step}:{step:number}) {
 return <section className="tb-theory">
  {step===1 && <><div className="tb-formula">Subject <span>+</span> <strong>am / is / are</strong> <span>+</span> …</div><ToBeTable headers={['Полная форма','Сокращение']} rows={affirmativeRows} /></>}
  {step===2 && <><div className="tb-transformation"><p>She {form('is')} happy.</p><span aria-hidden="true">→</span><p>She {form('is not')} happy.</p></div><div className="tb-formula">Subject <span>+</span> <strong>am / is / are</strong> <span>+</span> <strong>not</strong> <span>+</span> …</div><ToBeTable headers={['Полная форма','Сокращение']} rows={negativeRows} /></>}
  {step===3 && <><div className="tb-transformation"><p>She {form('is')} happy.</p><span aria-hidden="true">↘</span><p>{form('Is')} she happy?</p></div><div className="tb-formula"><strong>Am / Is / Are</strong> <span>→</span> Subject <span>→</span> … ?</div><p>Перенеси am / is / are в начало предложения.</p><ToBeTable headers={['Вопрос','Да','Нет']} rows={questionRows} /></>}
  {step===4 && <><ToBeTable headers={['Question','Yes','No']} rows={[
   ['Is she a student?','Yes, she is.',"No, she isn't."],['Are they friends?','Yes, they are.',"No, they aren't."],['Are you ready?','Yes, I am.',"No, I'm not."],
  ]} /><div className="tb-note">В кратком положительном ответе не сокращаем глагол: <strong>Yes, I am.</strong> Нельзя: <s>Yes, I'm.</s></div></>}
  {step===12 && <><ToBeTable headers={['Subject','Affirmative','Negative','Question']} rows={[
   ['I','I am','I am not','Am I...?'],['He / She / It','She is',"She isn't",'Is she...?'],['You / We / They','They are',"They aren't",'Are they...?'],
  ]} /><h2>Short answers</h2><ToBeTable headers={['Вопрос','Да','Нет']} rows={questionRows} /></>}
 </section>;
}
