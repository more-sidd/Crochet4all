import { useMemo } from 'react';
import PixelSparkle from './PixelSparkle';

const COLORS = ['#6fa8e6', 'var(--accent-2)', 'var(--accent)'];

// A fixed, ever-present field of pixel stars that slowly drift and twinkle.
export default function StarField({ count = 24 }: { count?: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        top: Math.round(Math.random() * 100),
        left: Math.round(Math.random() * 100),
        size: 8 + Math.round(Math.random() * 16),
        dur: 6 + Math.random() * 8,
        delay: -Math.random() * 10,
        color: COLORS[i % COLORS.length],
      })),
    [count],
  );

  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', overflow: 'hidden' }}>
      <style>{`@keyframes c4a-float {
        0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.22; }
        25% { opacity: 0.6; }
        50% { transform: translate(8px, -16px) scale(0.85); opacity: 0.4; }
        75% { opacity: 0.6; }
      }`}</style>
      {stars.map((s) => (
        <span
          key={s.id}
          style={{
            position: 'absolute',
            top: `${s.top}%`,
            left: `${s.left}%`,
            animation: `c4a-float ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        >
          <PixelSparkle size={s.size} color={s.color} />
        </span>
      ))}
    </div>
  );
}