import { useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { STITCHES, Stitch } from '../data/stitches';
import StitchDiagram from '../components/StitchDiagram';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Round {
  answer: Stitch;
  options: Stitch[];
}

function makeRound(exclude?: string): Round {
  const pool = exclude ? STITCHES.filter((s) => s.id !== exclude) : STITCHES;
  const answer = pool[Math.floor(Math.random() * pool.length)];
  const distractors = shuffle(STITCHES.filter((s) => s.id !== answer.id)).slice(0, 3);
  return { answer, options: shuffle([answer, ...distractors]) };
}

export default function LearnPlay() {
  const [round, setRound] = useState<Round>(() => makeRound());
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [asked, setAsked] = useState(1);

  useEffect(() => {
    const saved = Number(localStorage.getItem('loop.bestStreak') || 0);
    setBest(saved);
  }, []);

  const answered = picked !== null;
  const correct = picked === round.answer.id;

  const choose = (id: string) => {
    if (answered) return;
    setPicked(id);
    if (id === round.answer.id) {
      setScore((s) => s + 1);
      setStreak((st) => {
        const next = st + 1;
        if (next > best) {
          setBest(next);
          try { localStorage.setItem('loop.bestStreak', String(next)); } catch { /* ignore */ }
        }
        return next;
      });
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    setRound(makeRound(round.answer.id));
    setPicked(null);
    setAsked((n) => n + 1);
  };

  const accuracy = useMemo(() => (asked > 1 || answered ? Math.round((score / Math.max(1, answered ? asked : asked - 1)) * 100) : 0), [score, asked, answered]);

  return (
    <div style={{ maxWidth: 620, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.2rem' }}>
        <span className="font-mono muted" style={{ fontSize: '0.72rem', letterSpacing: '0.1em' }}>SCORE {score}</span>
        <span className="font-mono muted" style={{ fontSize: '0.72rem', letterSpacing: '0.1em' }}>STREAK {streak} · BEST {best}</span>
        <span className="font-mono muted" style={{ fontSize: '0.72rem', letterSpacing: '0.1em' }}>ACCURACY {accuracy}%</span>
      </div>

      <div className="card" style={{ padding: '1.6rem', textAlign: 'center' }}>
        <p className="label">Which stitch is this?</p>
        <div className="stitch-diagram" style={{ margin: '1rem auto', maxWidth: 320 }}>
          <StitchDiagram id={round.answer.id} height={120} mode="symbol" />
        </div>

        <div className="quiz-options">
          {round.options.map((opt) => {
            let cls = 'quiz-btn';
            if (answered && opt.id === round.answer.id) cls += ' correct';
            else if (answered && opt.id === picked) cls += ' wrong';
            return (
              <button key={opt.id} className={cls} disabled={answered} onClick={() => choose(opt.id)}>
                {opt.name} <span className="muted" style={{ fontSize: '0.78rem' }}>({opt.abbr})</span>
              </button>
            );
          })}
        </div>

        {answered && (
          <div style={{ marginTop: '1.3rem' }}>
            <p style={{ fontWeight: 600, color: correct ? 'var(--accent-2)' : 'var(--accent)', marginBottom: '0.8rem' }}>
              {correct ? 'Nice one!' : `It was ${round.answer.name} (${round.answer.abbr}).`}
            </p>
            <button className="btn-primary" onClick={next}>
              <RefreshCw size={14} /> Next stitch
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
