import { useState } from 'react';
import LearnLibrary from './LearnLibrary';
import LearnPlay from './LearnPlay';

const YARN_PALETTE = ['#6fa8e6', '#f3e08c', '#e1c2ef', '#a4d24f', '#9a79da', '#f4a23c', '#f25b96', '#5b5b5b'];

// ── yarn reference data (kept here so Learn is self-contained) ───────────────
const WEIGHTS = [
  { id: 'lace', number: '0', name: 'Lace', aka: 'Fingering 10-count, thread', hook: '1.5 – 2.25 mm', thickness: 1, goodFor: 'Doilies, delicate lace, fine shawls' },
  { id: 'superfine', number: '1', name: 'Super Fine', aka: 'Sock, Fingering, Baby', hook: '2.25 – 3.5 mm', thickness: 2, goodFor: 'Socks, lightweight shawls, baby items' },
  { id: 'fine', number: '2', name: 'Fine', aka: 'Sport, Baby', hook: '3.5 – 4.5 mm', thickness: 3, goodFor: 'Light garments, soft accessories' },
  { id: 'light', number: '3', name: 'Light', aka: 'DK, Light Worsted', hook: '4.5 – 5.5 mm', thickness: 4, goodFor: 'Garments, amigurumi, everyday projects' },
  { id: 'medium', number: '4', name: 'Medium', aka: 'Worsted, Aran, Afghan', hook: '5.5 – 6.5 mm', thickness: 5, goodFor: 'Blankets, hats — the best place to start' },
  { id: 'bulky', number: '5', name: 'Bulky', aka: 'Chunky, Craft, Rug', hook: '6.5 – 9 mm', thickness: 6, goodFor: 'Quick scarves, cozy blankets, winter wear' },
  { id: 'superbulky', number: '6', name: 'Super Bulky', aka: 'Super Chunky, Roving', hook: '9 – 15 mm', thickness: 7, goodFor: 'Fast, squishy throws and big stitches' },
  { id: 'jumbo', number: '7', name: 'Jumbo', aka: 'Roving, Giant', hook: '15 mm and up', thickness: 8, goodFor: 'Arm crochet, giant blankets' },
];

const FIBERS = [
  { id: 'acrylic', name: 'Acrylic', feel: 'Soft, springy, lightweight', pros: 'Cheap, machine-washable, huge color range, forgiving', cons: 'Can feel squeaky; not very breathable', bestFor: 'Beginners, blankets, amigurumi' },
  { id: 'cotton', name: 'Cotton', feel: 'Smooth, cool, sturdy with no stretch', pros: 'Strong, holds shape, crisp stitch definition', cons: 'Less forgiving; can be hard on the hands', bestFor: 'Amigurumi, dishcloths, bags, summer wear' },
  { id: 'wool', name: 'Wool', feel: 'Warm, stretchy, slightly fuzzy', pros: 'Cozy, elastic and forgiving, blocks beautifully', cons: 'Can itch; may shrink or felt if washed wrong', bestFor: 'Hats, sweaters, winter accessories' },
  { id: 'cottonblend', name: 'Cotton / Bamboo blends', feel: 'Silky, drapey, gentle sheen', pros: 'Soft against skin, lovely drape, breathable', cons: 'Can be splitty; a bit pricier', bestFor: 'Wearables, shawls, baby items' },
  { id: 'woolblend', name: 'Wool blends', feel: 'Warm but lighter than pure wool', pros: 'Warmth of wool with easier care; often less itchy', cons: 'Varies a lot by blend — check the label', bestFor: 'Everyday garments and accessories' },
  { id: 'chenille', name: 'Chenille / Velvet', feel: 'Plush, fuzzy, super soft', pros: 'Irresistibly soft, great for stuffed toys', cons: 'Can twist ("worming") and be tricky to work', bestFor: 'Plushies, cozy pillows, baby blankets' },
];

const LABEL_TIPS = [
  { term: 'Weight symbol', meaning: 'A little yarn-skein icon with a number 0–7 — the thickness category.' },
  { term: 'Recommended hook', meaning: 'A hook icon with a size (e.g. 5.0 mm / H-8). A great starting point.' },
  { term: 'Gauge', meaning: 'How many stitches and rows fit in a 4-inch (10 cm) square.' },
  { term: 'Yardage & weight', meaning: 'How much yarn is in the ball (e.g. 170 g / 364 yds).' },
  { term: 'Dye lot', meaning: 'A batch number — buy enough of the same lot so colors match.' },
  { term: 'Care symbols', meaning: 'Washing/drying icons. Acrylic is usually machine-safe; wool often needs hand-washing.' },
];

function ThicknessBar({ level, color }: { level: number; color: string }) {
  return (
    <div className="weight-bar">
      {Array.from({ length: 8 }, (_, i) => {
        const h = 20 + Math.min(level, 8) * 1.5 + (i % 2 === 0 ? 0 : 4);
        return <span key={i} className="weight-seg" style={{ height: `${Math.min(34, h)}px`, background: color }} />;
      })}
    </div>
  );
}

type Section = 'stitches' | 'weights' | 'fibers' | 'labels' | 'play';

const TABS: { key: Section; label: string; heading: string }[] = [
  { key: 'stitches', label: 'Stitches', heading: 'The stitch library' },
  { key: 'weights', label: 'Yarn weights', heading: 'Know your yarn — weights' },
  { key: 'fibers', label: 'Fibers', heading: 'Know your yarn — fibers' },
  { key: 'labels', label: 'Reading a label', heading: 'Reading a yarn label' },
  { key: 'play', label: 'Play', heading: 'Name that stitch' },
];

export default function Learn() {
  const [sec, setSec] = useState<Section>('stitches');
  const heading = TABS.find((t) => t.key === sec)?.heading ?? 'Learn';

  return (
    <section className="section-pad">
      <div className="wrap">
        <p className="label">Learn</p>
        <h1 className="heading" style={{ marginBottom: '1.5rem' }}>{heading}</h1>

        <div className="tabs" style={{ marginBottom: '2rem' }}>
          {TABS.map((t) => (
            <button key={t.key} className={`tab ${sec === t.key ? 'active' : ''}`} onClick={() => setSec(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {sec === 'stitches' && <LearnLibrary />}
        {sec === 'play' && <LearnPlay />}

        {sec === 'weights' && (
          <div className="yarn-grid">
            {WEIGHTS.map((w, wi) => (
              <div key={w.id} className="card yarn-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="yarn-num" style={{ background: YARN_PALETTE[wi % YARN_PALETTE.length] }}>{w.number}</span>
                  <span className="tag">{w.hook}</span>
                </div>
                <ThicknessBar level={w.thickness} color={YARN_PALETTE[wi % YARN_PALETTE.length]} />
                <div className="yarn-name">{w.name}</div>
                <p className="muted" style={{ fontSize: '0.78rem', marginBottom: '0.6rem' }}>{w.aka}</p>
                <div className="yarn-row"><span>Good for</span></div>
                <p style={{ fontSize: '0.86rem', marginTop: '0.3rem' }}>{w.goodFor}</p>
              </div>
            ))}
          </div>
        )}

        {sec === 'fibers' && (
          <div className="yarn-grid">
            {FIBERS.map((f) => (
              <div key={f.id} className="card yarn-card">
                <div className="yarn-name" style={{ marginBottom: '0.2rem' }}>{f.name}</div>
                <p className="muted" style={{ fontSize: '0.82rem', marginBottom: '0.8rem' }}>{f.feel}</p>
                <div className="yarn-row"><span>Pros</span></div>
                <p style={{ fontSize: '0.84rem', margin: '0.2rem 0 0.6rem' }}>{f.pros}</p>
                <div className="yarn-row"><span>Watch out</span></div>
                <p style={{ fontSize: '0.84rem', margin: '0.2rem 0 0.6rem' }}>{f.cons}</p>
                <div className="yarn-row"><span>Best for</span></div>
                <p style={{ fontSize: '0.84rem', marginTop: '0.2rem', color: 'var(--accent)' }}>{f.bestFor}</p>
              </div>
            ))}
          </div>
        )}

        {sec === 'labels' && (
          <div style={{ maxWidth: 720 }}>
            <p className="muted" style={{ marginBottom: '1.2rem' }}>A yarn label looks busy, but it's really just six pieces of info:</p>
            {LABEL_TIPS.map((t, i) => (
              <div key={i} className="card" style={{ padding: '1rem 1.2rem', marginBottom: '0.8rem' }}>
                <div className="field-label" style={{ marginBottom: '0.3rem' }}>{t.term}</div>
                <p style={{ fontSize: '0.9rem' }}>{t.meaning}</p>
              </div>
            ))}
            <p className="notice" style={{ marginTop: '1rem' }}>
              Beginner tip: a medium / worsted (#4) acrylic yarn with a 5.0–6.0 mm hook is the friendliest combo to learn on.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
