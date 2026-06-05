import { useState } from 'react';
import { X } from 'lucide-react';
import { STITCHES, Stitch } from '../data/stitches';
import StitchDiagram, { StitchSymbol } from '../components/StitchDiagram';

const LEGEND: { id: string; abbr: string; full: string }[] = [
  { id: 'ch', abbr: 'ch', full: 'chain' },
  { id: 'sl', abbr: 'sl st', full: 'slip stitch' },
  { id: 'sc', abbr: 'sc', full: 'single crochet' },
  { id: 'hdc', abbr: 'hdc', full: 'half double crochet' },
  { id: 'dc', abbr: 'dc', full: 'double crochet' },
  { id: 'tr', abbr: 'tr', full: 'treble crochet' },
];

function Legend() {
  return (
    <div className="card" style={{ padding: '1rem 1.2rem', marginBottom: '1.6rem' }}>
      <div className="field-label" style={{ marginBottom: '0.6rem' }}>Symbol chart</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem 1.2rem' }}>
        {LEGEND.map((l) => (
          <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ color: 'var(--accent)', flexShrink: 0 }}><StitchSymbol id={l.id} size={20} /></span>
            <span style={{ fontSize: '0.82rem' }}><strong>{l.abbr}</strong> <span className="muted">{l.full}</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Difficulty({ level }: { level: number }) {
  return (
    <span className="difficulty" title={`Difficulty ${level} of 3`}>
      {[1, 2, 3].map((n) => (
        <span key={n} className={`diff-dot ${n <= level ? 'on' : ''}`} />
      ))}
    </span>
  );
}

export default function LearnLibrary() {
  const [active, setActive] = useState<Stitch | null>(null);

  return (
    <>
      <Legend />
      <div className="stitch-grid">
        {STITCHES.map((s) => (
          <div key={s.id} className="card card-hover stitch-card" onClick={() => setActive(s)}>
            <div className="stitch-diagram">
              <StitchDiagram id={s.id} height={70} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="stitch-name">{s.name}</span>
              <span className="stitch-abbr">{s.abbr}</span>
            </div>
            <div style={{ marginTop: '0.5rem', marginBottom: '0.6rem' }}>
              <Difficulty level={s.difficulty} />
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{s.blurb}</p>
          </div>
        ))}
      </div>

      {active && (
        <div className="modal-overlay" onClick={() => setActive(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <p className="label" style={{ marginBottom: '0.2rem' }}>{active.abbr}</p>
                <h2 className="font-display" style={{ fontSize: '2rem', lineHeight: 1 }}>{active.name}</h2>
              </div>
              <button className="icon-btn" onClick={() => setActive(null)} aria-label="Close"><X size={20} /></button>
            </div>

            <div className="stitch-diagram" style={{ margin: '1.2rem 0' }}>
              <StitchDiagram id={active.id} height={110} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
              <Difficulty level={active.difficulty} />
              <span className="muted" style={{ fontSize: '0.85rem' }}>{active.blurb}</span>
            </div>

            <p className="field-label">How to make it</p>
            <ol style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.92rem' }}>
              {active.steps.map((step, i) => (
                <li key={i} style={{ paddingLeft: '0.3rem' }}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </>
  );
}
