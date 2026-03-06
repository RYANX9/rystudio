'use client';
import { useEffect, useRef, useState } from 'react';

const TAG_C = {
  study:   '#2A7A50',
  Wasting: '#D13A3A',
  prayer:  '#2B5BB8',
  food:    '#C05D1A',
  sleep:   '#6B3FC0',
  other:   '#9CA3AF',
};

function minOfDay(isoStr, tzMin) {
  const local = new Date(new Date(isoStr).getTime() + tzMin * 60000);
  return local.getUTCHours() * 60 + local.getUTCMinutes();
}

export default function Ribbon24h({ entries = [], tz = 0 }) {
  const [nowMin, setNowMin] = useState(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  });

  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date();
      setNowMin(n.getHours() * 60 + n.getMinutes());
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const DAY = 24 * 60;
  const nowPct = (nowMin / DAY) * 100;

  const HOURS = [0, 3, 6, 9, 12, 15, 18, 21];

  return (
    <div style={s.wrap}>
      <div style={s.label}>24h</div>
      <div style={s.track}>
        {/* entry blocks */}
        {entries.map(e => {
          const start = minOfDay(e.started_at, tz);
          const end   = Math.min(DAY, start + e.duration_minutes);
          const left  = (start / DAY) * 100;
          const width = ((end - start) / DAY) * 100;
          return (
            <div
              key={e.id}
              title={`${e.activity} (${e.duration_minutes}m)`}
              style={{
                ...s.block,
                left: `${left}%`,
                width: `${Math.max(width, 0.5)}%`,
                background: TAG_C[e.tag] || TAG_C.other,
              }}
            />
          );
        })}

        {/* now cursor */}
        <div style={{ ...s.nowLine, left: `${nowPct}%` }} />
      </div>

      {/* hour labels */}
      <div style={s.hours}>
        {HOURS.map(h => (
          <div key={h} style={{ ...s.hourLabel, left: `${(h / 24) * 100}%` }}>
            {h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`}
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  wrap: {
    background: 'var(--surface)',
    borderRadius: 'var(--r)',
    padding: '14px 16px 20px',
    boxShadow: 'var(--sh)',
    position: 'relative',
  },
  label: {
    fontSize: 10, fontWeight: 700, color: 'var(--ink3)',
    letterSpacing: '0.08em', textTransform: 'uppercase',
    marginBottom: 10,
  },
  track: {
    position: 'relative',
    height: 20,
    background: 'var(--surface2)',
    borderRadius: 6,
    overflow: 'visible',
  },
  block: {
    position: 'absolute',
    top: 0, height: '100%',
    borderRadius: 3,
    opacity: 0.85,
    minWidth: 2,
  },
  nowLine: {
    position: 'absolute',
    top: -3, bottom: -3,
    width: 2,
    background: 'var(--orange)',
    borderRadius: 2,
    zIndex: 2,
  },
  hours: {
    position: 'relative',
    height: 16,
    marginTop: 6,
  },
  hourLabel: {
    position: 'absolute',
    transform: 'translateX(-50%)',
    fontSize: 9,
    color: 'var(--ink3)',
    fontFamily: "'DM Mono', monospace",
    whiteSpace: 'nowrap',
  },
};
