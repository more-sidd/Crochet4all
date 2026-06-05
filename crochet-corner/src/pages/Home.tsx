import { BookOpen, LayoutGrid, Users } from 'lucide-react';
import type { Route } from '../components/Nav';
import PixelSparkle from '../components/PixelSparkle';

interface Props {
  go: (r: Route) => void;
}

const FEATURES = [
  {
    key: 'learn' as Route,
    icon: BookOpen,
    title: 'Learn',
    body: 'Browse a library of crochet stitches with clear diagrams and step-by-step guides, get to know your yarn weights and fibers, then test yourself with a quick guessing game.',
  },
  {
    key: 'create' as Route,
    icon: LayoutGrid,
    title: 'Create',
    body: 'Design tapestry and pixel patterns. Paint your own grid, or drop in a photo and watch it turn into a chart. Pick colors by wheel or hex.',
  },
  {
    key: 'blog' as Route,
    icon: Users,
    title: 'Blog',
    body: 'Share photos of your makes and cheer each other on. No sign-up walls — just pick a name and join the circle.',
  },
];

export default function Home({ go }: Props) {
  return (
    <>
      <section className="hero">
        <div className="hero-glow" />
        <div className="wrap" style={{ position: 'relative' }}>
          <p className="label fade-up">Learn · Create · Share</p>
          <h1 className="hero-title fade-up" style={{ animationDelay: '0.08s' }}>
            A cozy place
            <br />
            to <span className="text-accent">crochet</span>{' '}
            <PixelSparkle size={34} className="sparkle twinkle" color="var(--accent-2)" />
            <br />
            together.
          </h1>
          <p
            className="fade-up"
            style={{ animationDelay: '0.18s', maxWidth: 560, marginTop: '1.4rem', color: 'var(--muted)', fontSize: '1.05rem' }}
          >
            crochet4all is a free, friendly corner of the internet for crocheters of every level — pick up a
            new stitch, design a pattern, and show off what you made. No accounts, no fuss.
          </p>
          <div className="fade-up" style={{ animationDelay: '0.28s', marginTop: '2rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => go('learn')}>Start learning</button>
            <button className="btn-ghost" onClick={() => go('create')}>Make a pattern</button>
          </div>
        </div>
      </section>

      <section className="section-pad" style={{ background: 'var(--bg-alt)' }}>
        <div className="wrap">
          <div className="feature-grid">
            {FEATURES.map(({ key, icon: Icon, title, body }) => (
              <div key={key} className="card card-hover feature" onClick={() => go(key)}>
                <Icon className="feature-icon" strokeWidth={1.6} />
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
