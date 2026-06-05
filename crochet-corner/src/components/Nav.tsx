import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import PixelSparkle from './PixelSparkle';

export type Route = 'home' | 'learn' | 'create' | 'blog';

interface Props {
  route: Route;
  go: (r: Route) => void;
}

const LINKS: { key: Route; label: string }[] = [
  { key: 'learn', label: 'Learn' },
  { key: 'create', label: 'Create' },
  { key: 'blog', label: 'Blog' },
];

export default function Nav({ route, go }: Props) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('loop.theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      setDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('loop.theme', next ? 'dark' : 'light'); } catch { /* ignore */ }
  };

  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        <button className="nav-logo" onClick={() => go('home')} aria-label="crochet4all home">
          <PixelSparkle size={26} color="var(--accent)" />
          <span className="nav-logo-text">crochet4all</span>
        </button>

        <div className="nav-links">
          {LINKS.map((l) => (
            <button
              key={l.key}
              className={`nav-link ${route === l.key ? 'active' : ''}`}
              onClick={() => go(l.key)}
            >
              {l.label}
            </button>
          ))}
          <button className="nav-link" onClick={toggleTheme} aria-label="Toggle dark mode" style={{ display: 'flex' }}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
