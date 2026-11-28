import { countryGroups } from './data';
import { Audio, Done, Exercise, Field } from './Controls';
import Stress from './Stress';
export default function Countries(){
 const table=(groups:typeof countryGroups)=><table className="ct-nationalities"><thead><tr><th scope="col">country</th><th scope="col">nationality</th></tr></thead>{groups.map(group=><tbody key={group.ending}><tr className="ct-ending"><th colSpan={2}>{group.ending}</th></tr>{group.rows.map(row=><tr key={row.id}><th scope="row">{row.country}</th><td>{row.given?<span className="ct-given">{row.given}</span>:<label className="ct-nationality-gap"><span>{row.gap}</span><Field id={'p125/1a/'+row.id} label={`Page 125, Exercise 1A, nationality ${row.gap}: ${row.country}`} wide/></label>}</td></tr>)}</tbody>)}</table>;
 return <>
  <aside className="ct-rule" aria-label="Nationality endings"><h2>Nationality endings</h2><ul><li><strong>-an:</strong> American, Mexican, Korean</li><li><strong>-ian:</strong> Brazilian, Italian, Australian</li><li><strong>-ish:</strong> British, Spanish, Polish, Turkish</li><li><strong>-ese:</strong> Chinese, Japanese, Vietnamese</li><li><strong>other forms:</strong> French, German, Swiss</li></ul><p>Countries and nationalities begin with a capital letter in English.</p></aside>
  <Exercise id="p125-1a" number="1A" instruction="Complete the table (1–14) with the correct nationalities."><div className="ct-nationalities-columns">{table(countryGroups.slice(0,1))}{table(countryGroups.slice(1))}</div></Exercise>
  <Exercise id="p125-1b" number="1B" instruction="Listen and underline the stressed syllable in each country or nationality."><Audio track="VB1.01"/><Stress/><Done id="p125/1b/done"/></Exercise>
  <Exercise id="p125-1c" number="1C" instruction="Listen again and repeat."><Audio track="VB1.01"/><Done id="p125/1c/done"/></Exercise>
  <Exercise id="p125-1d" number="1D" instruction="Work in pairs. Student A: Say a country. Student B: Say the nationality."><p>A: Italy.</p><p>B: Italian.</p><Done id="p125/1d/done" label="Done with my teacher"/></Exercise>
 </>;
}
