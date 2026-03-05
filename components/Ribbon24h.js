'use client';
import { useRef, useEffect } from 'react';

const TAG_COLORS = {
  study:   '#22c55e',
  Wasting: '#ef4444',
  prayer:  '#60a5fa',
  food:    '#f97316',
  sleep:   '#a78bfa',
  other:   '#6b7280',
};

export default function Ribbon24h({ entries, selectedDate }) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // background track
      ctx.fillStyle = '#1a1a16';
      ctx.beginPath();
      ctx.roundRect(0, 4, W, H - 8, 4);
      ctx.fill();

      const isToday = selectedDate === todayStr();

      // entry blocks
      for (const entry of entries) {
        const tz = -new Date().getTimezoneOffset();
        const startLocal = new Date(new Date(entry.started_at).getTime() + tz * 60000);
        const startMin = startLocal.getUTCHours() * 60 + startLocal.getUTCMinutes();
        const endMin = Math.min(startMin + entry.duration_minutes, 24 * 60);

        const x = (startMin / 1440) * W;
        const w = Math.max(2, ((endMin - startMin) / 1440) * W);

        ctx.fillStyle = TAG_COLORS[entry.tag] || TAG_COLORS.other;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(x, 4, w, H - 8);
        ctx.globalAlpha = 1;
      }

      // hour ticks
      ctx.fillStyle = '#2a2a22';
      for (let h = 0; h <= 24; h += 3) {
        const x = (h / 24) * W;
        ctx.fillRect(x, 0, 1, H);
      }

      // hour labels at 0, 6, 12, 18
      ctx.fillStyle = '#333';
      ctx.font = '8px Cairo, sans-serif';
      ctx.textAlign = 'center';
      for (const h of [0, 6, 12, 18]) {
        const x = (h / 24) * W;
        ctx.fillText(h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`, x, H - 1);
      }

      // now cursor (only for today)
      if (isToday) {
        const now = new Date();
        const tz = -new Date().getTimezoneOffset();
        const localNow = new Date(now.getTime() + tz * 60000);
        const nowMin = localNow.getUTCHours() * 60 + localNow.getUTCMinutes();
        const nowX = (nowMin / 1440) * W;

        ctx.strokeStyle = '#e8e8e0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(nowX, 0);
        ctx.lineTo(nowX, H - 10);
        ctx.stroke();

        // cursor dot
        ctx.fillStyle = '#e8e8e0';
        ctx.beginPath();
        ctx.arc(nowX, 5, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    draw();

    // tick every 30s for today
    if (selectedDate === todayStr()) {
      const interval = setInterval(draw, 30000);
      return () => clearInterval(interval);
    }
  }, [entries, selectedDate]);

  return (
    <div style={styles.wrap}>
      <canvas ref={canvasRef} style={styles.canvas} />
    </div>
  );
}

function todayStr() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString().slice(0, 10);
}

const styles = {
  wrap: {
    padding: '0 0',
    background: '#0f0f0d',
    borderBottom: '1px solid #1e1e1a',
  },
  canvas: {
    width: '100%',
    height: '36px',
    display: 'block',
    cursor: 'default',
  },
};
