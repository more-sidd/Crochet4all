import { useEffect, useRef, useState } from 'react';
import { Eraser, Image as ImageIcon, Download, Trash2, Pencil } from 'lucide-react';

const BG = '#ffffff';
const PRESETS = [
  '#c1440e', '#e8703f', '#f0a868', '#f6d186', '#7fb069', '#2f7d6e',
  '#3a6ea5', '#5e60ce', '#b5179e', '#d81159', '#6b4226', '#1a1814',
];

// ── colour maths ─────────────────────────────────────────────────────────────
function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return { h: 0, s: 0, l: 50 };
  const r = parseInt(m[1], 16) / 255, g = parseInt(m[2], 16) / 255, b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0; const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60); if (h < 0) h += 360;
  }
  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
}
function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

export default function Create() {
  const [cols, setCols] = useState(16);
  const [rows, setRows] = useState(16);
  const [grid, setGrid] = useState<string[]>(() => Array(16 * 16).fill(BG));
  const [color, setColor] = useState('#c1440e');
  const [hsl, setHsl] = useState(() => hexToHsl('#c1440e'));
  const [tool, setTool] = useState<'draw' | 'erase'>('draw');
  const [recent, setRecent] = useState<string[]>([]);

  const paintingRef = useRef(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  // keep grid array sized to cols*rows (preserve overlap when resizing)
  useEffect(() => {
    setGrid((prev) => {
      const next = Array(cols * rows).fill(BG);
      for (let i = 0; i < Math.min(prev.length, next.length); i++) next[i] = prev[i];
      return next;
    });
  }, [cols, rows]);

  useEffect(() => {
    const up = () => { paintingRef.current = false; };
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
    return () => { window.removeEventListener('mouseup', up); window.removeEventListener('touchend', up); };
  }, []);

  // ── colour selection helpers ──
  const applyColor = (hex: string) => {
    setColor(hex);
    setHsl(hexToHsl(hex));
  };
  const remember = (hex: string) => {
    setRecent((r) => [hex, ...r.filter((c) => c !== hex)].slice(0, 6));
  };

  const onWheel = (e: React.MouseEvent | React.TouchEvent) => {
    const el = wheelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pt = 'touches' in e ? e.touches[0] : e;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = pt.clientX - cx;
    const dy = pt.clientY - cy;
    const maxR = rect.width / 2;
    let h = Math.atan2(dx, -dy) * (180 / Math.PI);
    if (h < 0) h += 360;
    const s = Math.min(100, Math.round((Math.hypot(dx, dy) / maxR) * 100));
    const next = { h: Math.round(h), s, l: hsl.l };
    setHsl(next);
    setColor(hslToHex(next.h, next.s, next.l));
  };

  const setLight = (l: number) => {
    const next = { ...hsl, l };
    setHsl(next);
    setColor(hslToHex(next.h, next.s, next.l));
  };

  // wheel handle position
  const handlePos = () => {
    const theta = (hsl.h * Math.PI) / 180;
    const r = (hsl.s / 100) * 50; // percent of half-width
    return { left: `${50 + Math.sin(theta) * r}%`, top: `${50 - Math.cos(theta) * r}%` };
  };

  // ── painting ──
  const paint = (i: number) => {
    const fill = tool === 'erase' ? BG : color;
    setGrid((g) => {
      if (g[i] === fill) return g;
      const next = [...g];
      next[i] = fill;
      return next;
    });
    if (tool === 'draw') remember(color);
  };

  // ── photo -> pattern ──
  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = cols; canvas.height = rows;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        // center-crop the photo to the grid's aspect ratio so it isn't squished
        const targetAR = cols / rows;
        const srcAR = img.width / img.height;
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        if (srcAR > targetAR) { sw = img.height * targetAR; sx = (img.width - sw) / 2; }
        else { sh = img.width / targetAR; sy = (img.height - sh) / 2; }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
        const data = ctx.getImageData(0, 0, cols, rows).data;
        const next: string[] = [];
        for (let i = 0; i < cols * rows; i++) {
          next.push(rgbToHex(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]));
        }
        setGrid(next);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const clearGrid = () => setGrid(Array(cols * rows).fill(BG));

  // ── export PNG ──
  const exportPNG = () => {
    const px = 28, line = 1;
    const canvas = document.createElement('canvas');
    canvas.width = cols * px + (cols + 1) * line;
    canvas.height = rows * px + (rows + 1) * line;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#c8c2b8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = grid[r * cols + c] || BG;
        ctx.fillRect(line + c * (px + line), line + r * (px + line), px, px);
      }
    }
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `loop-pattern-${cols}x${rows}.png`;
    a.click();
  };

  const cellPx = Math.max(9, Math.min(28, Math.floor(520 / cols)));

  return (
    <section className="section-pad">
      <div className="wrap">
        <p className="label">Create</p>
        <h1 className="heading" style={{ marginBottom: '1.5rem' }}>Pattern studio</h1>

        <div className="create-layout">
          {/* ── controls ── */}
          <div className="card panel">
            <p className="field-label">Canvas size</p>
            <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '0.5rem' }}>
              <label style={{ flex: 1 }}>
                <span className="muted" style={{ fontSize: '0.7rem' }}>Width</span>
                <input type="number" className="field" min={4} max={48} value={cols}
                  onChange={(e) => setCols(Math.max(4, Math.min(48, Number(e.target.value) || 4)))} />
              </label>
              <label style={{ flex: 1 }}>
                <span className="muted" style={{ fontSize: '0.7rem' }}>Height</span>
                <input type="number" className="field" min={4} max={48} value={rows}
                  onChange={(e) => setRows(Math.max(4, Math.min(48, Number(e.target.value) || 4)))} />
              </label>
            </div>
            <p className="muted" style={{ fontSize: '0.72rem', marginBottom: '1.4rem' }}>
              Suggested: 16×16 for a coaster, 30×30 for a small tapestry square.
            </p>

            <p className="field-label">Color wheel</p>
            <div
              ref={wheelRef}
              className="color-wheel"
              onMouseDown={onWheel}
              onMouseMove={(e) => { if (e.buttons === 1) onWheel(e); }}
              onTouchStart={onWheel}
              onTouchMove={onWheel}
            >
              <span className="wheel-dot" style={handlePos()} />
            </div>

            <input type="range" min={0} max={100} value={hsl.l} onChange={(e) => setLight(Number(e.target.value))}
              style={{ width: '100%', margin: '1rem 0 0.4rem',
                background: `linear-gradient(90deg, #000, ${hslToHex(hsl.h, hsl.s, 50)}, #fff)`,
                accentColor: color }} />
            <span className="muted" style={{ fontSize: '0.7rem' }}>Lightness</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '1rem 0' }}>
              <span style={{ width: 34, height: 34, borderRadius: 7, background: color, border: '1.5px solid var(--border)' }} />
              <input type="color" value={color} onChange={(e) => applyColor(e.target.value)}
                style={{ width: 34, height: 34, border: 'none', background: 'none', cursor: 'pointer' }} title="System color picker" />
              <input className="field" style={{ flex: 1, fontFamily: 'var(--mono)', textTransform: 'uppercase' }}
                value={color} onChange={(e) => { const v = e.target.value; setColor(v); if (/^#[0-9a-f]{6}$/i.test(v)) setHsl(hexToHsl(v)); }} />
            </div>

            <p className="field-label">Palette</p>
            <div className="swatches" style={{ marginBottom: recent.length ? '0.8rem' : 0 }}>
              {PRESETS.map((c) => (
                <span key={c} className={`swatch ${color.toLowerCase() === c ? 'active' : ''}`}
                  style={{ background: c }} onClick={() => { applyColor(c); remember(c); }} />
              ))}
            </div>
            {recent.length > 0 && (
              <>
                <p className="field-label">Recent</p>
                <div className="swatches">
                  {recent.map((c) => (
                    <span key={c} className="swatch" style={{ background: c }} onClick={() => applyColor(c)} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ── canvas + toolbar ── */}
          <div>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <button className={`btn-ghost btn-sm ${tool === 'draw' ? '' : ''}`} onClick={() => setTool('draw')}
                style={tool === 'draw' ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}>
                <Pencil size={14} /> Draw
              </button>
              <button className="btn-ghost btn-sm" onClick={() => setTool('erase')}
                style={tool === 'erase' ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}>
                <Eraser size={14} /> Erase
              </button>
              <label className="btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
                <ImageIcon size={14} /> Photo → pattern
                <input type="file" accept="image/*" onChange={onPhoto} style={{ display: 'none' }} />
              </label>
              <button className="btn-ghost btn-sm" onClick={clearGrid}><Trash2 size={14} /> Clear</button>
              <button className="btn-primary btn-sm" onClick={exportPNG}><Download size={14} /> Export PNG</button>
            </div>

            <div className="grid-wrap">
              <div
                className="pattern-grid"
                style={{ gridTemplateColumns: `repeat(${cols}, ${cellPx}px)` }}
                onMouseDown={() => { paintingRef.current = true; }}
              >
                {grid.map((c, i) => (
                  <div
                    key={i}
                    className="cell"
                    style={{ width: cellPx, height: cellPx, background: c }}
                    onMouseDown={() => paint(i)}
                    onMouseEnter={() => { if (paintingRef.current) paint(i); }}
                    onClick={() => paint(i)}
                  />
                ))}
              </div>
            </div>
            <p className="muted" style={{ fontSize: '0.74rem', marginTop: '0.8rem' }}>
              Click or drag to paint. Drop in a photo to auto-generate a chart, then tweak cells by hand.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
