import '../toBe.css';

/** One read-only slide. No exercises, grades or student-data mutations. */
export default function ToBeDiagram() {
  return <div className="to-be-lesson">
    <section className="to-be-diagram" aria-label="Формы глагола to be">
      <div className="to-be-source" aria-hidden="true">TO BE</div>
      <svg className="to-be-arrows" viewBox="0 0 600 130" aria-hidden="true" focusable="false">
        <defs><marker id="to-be-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M1 1L9 5L1 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></marker></defs>
        <path d="M282 8C282 60 100 50 100 112" /><path d="M300 8V112" /><path d="M318 8C318 60 500 50 500 112" />
      </svg>
      <div className="to-be-groups">
        {[{pronouns:['I'],form:'AM'},{pronouns:['HE','SHE','IT'],form:'IS'},{pronouns:['YOU','WE','THEY'],form:'ARE'}].map(({pronouns,form})=><article className="to-be-group" key={form}><h2>{pronouns.map((word,i)=><span key={word}>{i>0 && <span className="to-be-divider"> / </span>}{word}</span>)}</h2><strong>{form}</strong></article>)}
      </div>
    </section>
  </div>;
}
