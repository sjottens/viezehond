'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dog } from './Dog';

// Een hond vol modder die je schoon kunt vegen met muis of vinger.
// Het canvas ligt over de SVG-hond; vegen = gaten in de modder gummen.

const MUD = ['#5c3a1e', '#6e4526', '#7d5230', '#4a2e17'];
const DONE_AT = 0.12; // minder dan 12% modder over = schoon
const BRUSH = 0.085; // penseeldikte als deel van de breedte

// Vaste "willekeur", zodat de modder er elke keer hetzelfde uitziet
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function paintMud(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width: w, height: h } = canvas;
  const rand = seeded(7);
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, w, h);

  // Grote klodders over de hond
  for (let i = 0; i < 17; i++) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * 0.36;
    const cx = (0.5 + Math.cos(a) * d) * w;
    const cy = (0.5 + Math.sin(a) * d * 1.05) * h;
    const r = (0.05 + rand() * 0.06) * w;
    ctx.fillStyle = MUD[i % MUD.length];
    ctx.beginPath();
    for (let k = 0; k < 5; k++) {
      ctx.moveTo(cx + (rand() - 0.5) * r, cy + (rand() - 0.5) * r);
      ctx.arc(cx + (rand() - 0.5) * r, cy + (rand() - 0.5) * r, r * (0.5 + rand() * 0.5), 0, Math.PI * 2);
    }
    ctx.fill();
  }
  // Druppels die naar beneden lopen
  for (let i = 0; i < 7; i++) {
    const x = (0.22 + rand() * 0.56) * w;
    const y = (0.3 + rand() * 0.35) * h;
    const len = (0.06 + rand() * 0.12) * h;
    const dw = (0.012 + rand() * 0.014) * w;
    ctx.fillStyle = MUD[3];
    ctx.fillRect(x - dw / 2, y, dw, len);
    ctx.beginPath();
    ctx.arc(x, y + len, dw * 0.9, 0, Math.PI * 2);
    ctx.fill();
  }
  // Spetters
  for (let i = 0; i < 70; i++) {
    ctx.fillStyle = MUD[i % MUD.length];
    ctx.beginPath();
    ctx.arc((0.08 + rand() * 0.84) * w, (0.08 + rand() * 0.84) * h, (0.004 + rand() * 0.014) * w, 0, Math.PI * 2);
    ctx.fill();
  }
}

function mudLeft(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return 0;
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let filled = 0;
  let total = 0;
  for (let i = 3; i < data.length; i += 4 * 16) {
    total++;
    if (data[i] > 64) filled++;
  }
  return filled / total;
}

export function MudWipe() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const bubbles = useRef<HTMLDivElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const startMud = useRef(1);
  const moves = useRef(0);
  const lastBubble = useRef(0);
  const [cleaned, setCleaned] = useState(0);
  const [done, setDone] = useState(false);

  const reset = useCallback(() => {
    const c = canvas.current;
    const box = wrap.current;
    if (!c || !box) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.round(box.clientWidth * dpr);
    c.height = Math.round(box.clientHeight * dpr);
    paintMud(c);
    startMud.current = mudLeft(c) || 1;
    last.current = null;
    setCleaned(0);
    setDone(false);
  }, []);

  useEffect(() => {
    reset();
    // Alleen bij een andere breedte opnieuw tekenen; op mobiel wijzigt de hoogte al bij scrollen
    let width = wrap.current?.clientWidth;
    const onResize = () => {
      const w = wrap.current?.clientWidth;
      if (w && w !== width) {
        width = w;
        reset();
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [reset]);

  const measure = useCallback(() => {
    const c = canvas.current;
    if (!c) return;
    const left = mudLeft(c) / startMud.current;
    setCleaned(Math.min(100, Math.round((1 - left) * 100)));
    if (left < DONE_AT) {
      setCleaned(100);
      setDone(true);
    }
  }, []);

  const bubble = (x: number, y: number) => {
    const host = bubbles.current;
    const now = performance.now();
    if (!host || now - lastBubble.current < 70 || host.childElementCount > 24) return;
    lastBubble.current = now;
    const b = document.createElement('span');
    const size = 8 + Math.random() * 18;
    b.className = 'bubble';
    b.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;--drift:${(Math.random() - 0.5) * 60}px`;
    b.addEventListener('animationend', () => b.remove());
    host.appendChild(b);
  };

  const wipe = (clientX: number, clientY: number) => {
    const c = canvas.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx || done) return;
    const rect = c.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const sx = c.width / rect.width;
    const x = px * sx;
    const y = py * sx;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = c.width * BRUSH;
    ctx.beginPath();
    const from = last.current ?? { x: x - 0.1, y };
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    last.current = { x, y };
    bubble(px, py);
    if (++moves.current % 12 === 0) measure();
  };

  // Voor toetsenbord en wie geen zin heeft om te vegen: automatisch wassen
  const autoWash = () => {
    const c = canvas.current;
    if (!c || done) return;
    const rect = c.getBoundingClientRect();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      c.getContext('2d')?.clearRect(0, 0, c.width, c.height);
      measure();
      return;
    }
    const rows = 9;
    const steps = 90;
    let i = 0;
    last.current = null;
    const tick = () => {
      const t = i / steps;
      const row = Math.floor(t * rows);
      const within = (t * rows) % 1;
      const dir = row % 2 === 0 ? within : 1 - within;
      wipe(rect.left + rect.width * (0.08 + dir * 0.84), rect.top + rect.height * (0.08 + (row / (rows - 1)) * 0.84));
      if (++i <= steps) requestAnimationFrame(tick);
      else {
        c.getContext('2d')?.clearRect(0, 0, c.width, c.height);
        measure();
      }
    };
    tick();
  };

  return (
    <div className={done ? 'wash done' : 'wash'}>
      <div className="wash-stage" ref={wrap}>
        <div className="wash-tub" aria-hidden="true" />
        <Dog />
        <canvas
          ref={canvas}
          className="mud"
          aria-hidden="true"
          onPointerMove={(e) => wipe(e.clientX, e.clientY)}
          onPointerLeave={() => (last.current = null)}
          onPointerUp={() => {
            last.current = null;
            measure();
          }}
        />
        <div className="bubbles" ref={bubbles} aria-hidden="true" />
        <div className="sparkles" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      </div>

      <div className="wash-controls">
        <div className="meter" role="img" aria-label={`${cleaned}% schoon`}>
          <span className="meter-label">{done ? 'Blinkend schoon!' : 'Schoonmaakmeter'}</span>
          <span className="meter-track"><span className="meter-fill" style={{ width: `${cleaned}%` }} /></span>
          <strong>{cleaned}%</strong>
        </div>
        {done ? (
          <button type="button" className="btn btn-small btn-ghost" onClick={reset}>Nog een keer vies maken</button>
        ) : (
          <button type="button" className="btn btn-small btn-ghost" onClick={autoWash}>Was de hond voor me</button>
        )}
      </div>
    </div>
  );
}
