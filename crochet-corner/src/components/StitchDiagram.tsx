interface Props {
  id: string;
  height?: number;
  mode?: 'card' | 'yarn' | 'symbol';
}

// ── palette (from the sketch) ────────────────────────────────────────────────
const PALETTE = {
  blue:   '#6fa8e6',
  yellow: '#f3e08c',
  lilac:  '#e1c2ef',
  green:  '#a4d24f',
  purple: '#9a79da',
  orange: '#f4a23c',
  pink:   '#f25b96',
};
const BLUE = PALETTE.blue;
// each stitch keeps the blue strand and pairs it with a rotating palette colour
const PAIR: Record<string, string> = {
  ch: PALETTE.yellow, sl: PALETTE.lilac, sc: PALETTE.green, hdc: PALETTE.purple,
  dc: PALETTE.orange, tr: PALETTE.pink, dtr: PALETTE.yellow, mr: PALETTE.green,
  inc: PALETTE.orange, dec: PALETTE.purple, vst: PALETTE.pink, pop: PALETTE.green,
};

// ── soft two-tone yarn strand (hand-drawn / crayon look) ─────────────────────
// Each stitch gets a strand whose loop count / orientation roughly echoes it.
const STRAND: Record<string, { dir: 'h' | 'v' | 'ring'; loops: number; amp: number }> = {
  ch:  { dir: 'h', loops: 3.5, amp: 15 },
  sl:  { dir: 'h', loops: 4.5, amp: 9 },
  sc:  { dir: 'v', loops: 1.5, amp: 16 },
  hdc: { dir: 'v', loops: 2,   amp: 16 },
  dc:  { dir: 'v', loops: 2.5, amp: 16 },
  tr:  { dir: 'v', loops: 3,   amp: 16 },
  dtr: { dir: 'v', loops: 3.5, amp: 16 },
  mr:  { dir: 'ring', loops: 1, amp: 0 },
  inc: { dir: 'v', loops: 1.5, amp: 16 },
  dec: { dir: 'v', loops: 1.5, amp: 16 },
  vst: { dir: 'v', loops: 2,   amp: 16 },
  pop: { dir: 'ring', loops: 1, amp: 0 },
};

function wavePath(dir: 'h' | 'v', loops: number, amp: number, phase: number): string {
  const steps = 70;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const swing = amp * Math.sin(t * Math.PI * 2 * loops + phase);
    if (dir === 'h') {
      const x = 20 + t * 160;
      pts.push(`${x.toFixed(1)} ${(60 + swing).toFixed(1)}`);
    } else {
      const y = 22 + t * 78;
      pts.push(`${(100 + swing).toFixed(1)} ${y.toFixed(1)}`);
    }
  }
  return 'M' + pts.join(' L');
}

function YarnStrand({ id, height = 96 }: { id: string; height?: number }) {
  const cfg = STRAND[id] ?? STRAND.ch;
  const PARTNER = PAIR[id] ?? PALETTE.yellow;
  const wob = `wob-${id}`;
  const grain = `grain-${id}`;
  const mask = `mask-${id}`;
  const sw = 11;

  let blue: JSX.Element;
  let yellow: JSX.Element;
  let maskShapes: JSX.Element;

  if (cfg.dir === 'ring') {
    blue = <circle cx={96} cy={60} r={28} fill="none" stroke={BLUE} strokeWidth={sw} strokeLinecap="round" />;
    yellow = <circle cx={104} cy={60} r={28} fill="none" stroke={PARTNER} strokeWidth={sw} strokeLinecap="round" strokeDasharray="120 60" />;
    maskShapes = (
      <>
        <circle cx={96} cy={60} r={28} fill="none" stroke="#fff" strokeWidth={sw + 2} />
        <circle cx={104} cy={60} r={28} fill="none" stroke="#fff" strokeWidth={sw + 2} />
      </>
    );
  } else {
    const dBlue = wavePath(cfg.dir, cfg.loops, cfg.amp, 0);
    const dYellow = wavePath(cfg.dir, cfg.loops, cfg.amp, Math.PI);
    blue = <path d={dBlue} fill="none" stroke={BLUE} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />;
    yellow = <path d={dYellow} fill="none" stroke={PARTNER} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />;
    maskShapes = (
      <>
        <path d={dBlue} fill="none" stroke="#fff" strokeWidth={sw + 2} strokeLinecap="round" />
        <path d={dYellow} fill="none" stroke="#fff" strokeWidth={sw + 2} strokeLinecap="round" />
      </>
    );
  }

  return (
    <svg viewBox="0 0 200 120" style={{ width: '100%', height, display: 'block' }} role="img" aria-label={`Yarn illustration of the ${id} stitch`}>
      <defs>
        {/* wobble = hand-drawn edges */}
        <filter id={wob} x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={2} seed={4} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={4} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {/* fine grain = crayon texture */}
        <filter id={grain}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={8} />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1 1" />
        </filter>
        <mask id={mask}>{maskShapes}</mask>
      </defs>

      <g filter={`url(#${wob})`}>
        {blue}
        {yellow}
      </g>
      {/* grain speckle, kept inside the strand shapes */}
      <rect x="0" y="0" width="200" height="120" filter={`url(#${grain})`} mask={`url(#${mask})`} opacity={0.22} style={{ mixBlendMode: 'multiply' }} />
    </svg>
  );
}

// ── standard chart symbol (kept, small) ──────────────────────────────────────
export function StitchSymbol({ id, size = 110, full = false }: { id: string; size?: number; full?: boolean }) {
  const stroke = 'currentColor';
  const sw = 3;
  const row = (n: number) => {
    const gap = 200 / (n + 1);
    return Array.from({ length: n }, (_, i) => gap * (i + 1));
  };
  let content: JSX.Element;

  switch (id) {
    case 'ch':
      content = (<g stroke={stroke} strokeWidth={sw} fill="none">{row(5).map((x, i) => <ellipse key={i} cx={x} cy={55} rx={16} ry={9} transform={`rotate(-20 ${x} 55)`} />)}</g>);
      break;
    case 'sl':
      content = (<g stroke={stroke} strokeWidth={sw} fill={stroke}>{row(6).map((x, i) => <ellipse key={i} cx={x} cy={55} rx={7} ry={4.5} />)}</g>);
      break;
    case 'sc':
      content = (<g stroke={stroke} strokeWidth={sw} strokeLinecap="round">{row(4).map((x, i) => <g key={i}><line x1={x - 12} y1={38} x2={x + 12} y2={72} /><line x1={x - 12} y1={72} x2={x + 12} y2={38} /></g>)}</g>);
      break;
    case 'hdc':
      content = (<g stroke={stroke} strokeWidth={sw} strokeLinecap="round">{row(4).map((x, i) => <g key={i}><line x1={x} y1={28} x2={x} y2={82} /><line x1={x - 11} y1={28} x2={x + 11} y2={28} /></g>)}</g>);
      break;
    case 'dc':
    case 'tr':
    case 'dtr': {
      const slashes = id === 'dc' ? 1 : id === 'tr' ? 2 : 3;
      content = (<g stroke={stroke} strokeWidth={sw} strokeLinecap="round">{row(4).map((x, i) => <g key={i}><line x1={x} y1={24} x2={x} y2={86} /><line x1={x - 11} y1={24} x2={x + 11} y2={24} />{Array.from({ length: slashes }, (_, k) => { const cy = 42 + k * 16; return <line key={k} x1={x - 9} y1={cy + 6} x2={x + 9} y2={cy - 6} />; })}</g>)}</g>);
      break;
    }
    case 'mr':
      content = (<g stroke={stroke} strokeWidth={sw} strokeLinecap="round" fill="none"><circle cx={100} cy={55} r={26} />{Array.from({ length: 6 }, (_, i) => { const a = (Math.PI * 2 * i) / 6 - Math.PI / 2; return <line key={i} x1={100 + Math.cos(a) * 26} y1={55 + Math.sin(a) * 26} x2={100 + Math.cos(a) * 46} y2={55 + Math.sin(a) * 46} />; })}</g>);
      break;
    case 'inc':
      content = (<g stroke={stroke} strokeWidth={sw} strokeLinecap="round"><line x1={100} y1={84} x2={78} y2={30} /><line x1={100} y1={84} x2={122} y2={30} /></g>);
      break;
    case 'dec':
      content = (<g stroke={stroke} strokeWidth={sw} strokeLinecap="round"><line x1={78} y1={84} x2={100} y2={30} /><line x1={122} y1={84} x2={100} y2={30} /></g>);
      break;
    case 'vst':
      content = (<g stroke={stroke} strokeWidth={sw} strokeLinecap="round"><line x1={100} y1={84} x2={76} y2={26} /><line x1={100} y1={84} x2={124} y2={26} /><line x1={82} y1={60} x2={94} y2={48} /><line x1={118} y1={60} x2={106} y2={48} /><ellipse cx={100} cy={86} rx={7} ry={4.5} fill={stroke} stroke="none" /></g>);
      break;
    case 'pop':
      content = (<g stroke={stroke} strokeWidth={sw} strokeLinecap="round" fill="none"><ellipse cx={100} cy={55} rx={26} ry={20} />{[-14, -5, 5, 14].map((dx, i) => <line key={i} x1={100 + dx} y1={40} x2={100 + dx} y2={70} />)}</g>);
      break;
    default:
      content = <g />;
  }

  return (
    <svg viewBox="0 0 200 110" style={{ width: full ? '100%' : size * 1.8, height: size, color: 'var(--accent)', display: 'block' }} role="img" aria-label={`Chart symbol for the ${id} stitch`}>
      {content}
    </svg>
  );
}

// ── default: yarn drawing + small symbol badge ───────────────────────────────
export default function StitchDiagram({ id, height = 96, mode = 'card' }: Props) {
  if (mode === 'symbol') return <StitchSymbol id={id} size={height} full />;
  if (mode === 'yarn') return <YarnStrand id={id} height={height} />;

  return (
    <div style={{ position: 'relative' }}>
      <YarnStrand id={id} height={height} />
      <div style={{ position: 'absolute', right: 4, bottom: 2, background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 6, padding: '2px 5px', lineHeight: 0 }}>
        <StitchSymbol id={id} size={Math.max(22, height * 0.34)} />
      </div>
    </div>
  );
}
