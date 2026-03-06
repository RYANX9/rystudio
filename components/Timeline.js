'use client';

const TAG = {
  study:   { c: 'var(--study-c)',  bg: 'var(--study-bg)',  dot: 'var(--study-dot)'  },
  Wasting: { c: 'var(--waste-c)',  bg: 'var(--waste-bg)',  dot: 'var(--waste-dot)'  },
  prayer:  { c: 'var(--pray-c)',   bg: 'var(--pray-bg)',   dot: 'var(--pray-dot)'   },
  food:    { c: 'var(--food-c)',   bg: 'var(--food-bg)',   dot: 'var(--food-dot)'   },
  sleep:   { c: 'var(--sleep-c)', bg: 'var(--sleep-bg)',  dot: 'var(--sleep-dot)'  },
  other:   { c: 'var(--other-c)', bg: 'var(--other-bg)',  dot: 'var(--other-dot)'  },
};

function fmtDur(m) {
  if (!m) return '0m';
  const h = Math.floor(m / 60), mm = m % 60;
  if (!h) return `${mm}m`;
  if (!mm) return `${h}h`;
  return `${h}h ${mm}m`;
}

const fmt = d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function Timeline({ entries, onDelete, tz = 0 }) {
  if (!entries.length) {
    return (
      <div style={s.empty}>
        <div style={s.emptyCircle}>○</div>
        <p style={s.emptyTxt}>Nothing logged yet</p>
        <p style={s.emptyHint}>Use the form above to add your first entry.</p>
      </div>
    );
  }

  const studyMin = entries.filter(e => e.tag === 'study').reduce((a, e) => a + e.duration_minutes, 0);
  const totalMin = entries.reduce((a, e) => a + e.duration_minutes, 0);
  const sorted = [...entries].sort((a, b) => new Date(b.started_at) - new Date(a.started_at));

  return (
    <div style={s.wrap}>

      {/* ── stat strip like the "932kwh" dark card in reference ── */}
      <div style={s.statStrip}>
        <div style={s.statDark}>
          <div style={s.statBig}>{fmtDur(studyMin)}</div>
          <div style={s.statSub}>studied today</div>
        </div>
        <div style={s.statRow}>
          <div style={s.statMini}>
            <div style={s.statMiniVal}>{fmtDur(totalMin)}</div>
            <div style={s.statMiniLbl}>total</div>
          </div>
          <div style={s.statDivider} />
          <div style={s.statMini}>
            <div style={s.statMiniVal}>{entries.length}</div>
            <div style={s.statMiniLbl}>entries</div>
          </div>
        </div>
      </div>

      {/* ── entries ── */}
      <div style={s.list}>
        {sorted.map(entry => {
          const t   = TAG[entry.tag] || TAG.other;
          const lo  = new Date(new Date(entry.started_at).getTime() + tz * 60000);
          const end = new Date(lo.getTime() + entry.duration_minutes * 60000);

          return (
            <div key={entry.id} style={s.card}>
              {/* left accent bar */}
              <div style={{ ...s.accent, background: t.dot }} />

              {/* times */}
              <div style={s.times}>
                <span style={s.timeEnd}>{fmt(end)}</span>
                <span style={s.timeLine}>│</span>
                <span style={s.timeStart}>{fmt(lo)}</span>
              </div>

              {/* main */}
              <div style={s.mid}>
                <div style={s.activity}>{entry.activity}</div>
                <div style={s.metaRow}>
                  <span style={{ ...s.tagBadge, background: t.bg, color: t.c }}>
                    {entry.tag}
                  </span>
                  <span style={s.dur}>{entry.duration_minutes}m</span>
                </div>
              </div>

              <button style={s.del} onClick={() => onDelete(entry.id)}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 10 },

  statStrip: {
    background: 'var(--surface)',
    borderRadius: 'var(--r)',
    overflow: 'hidden',
    boxShadow: 'var(--sh)',
  },
  statDark: {
    background: 'var(--dark)',
    padding: '16px 20px',
    display: 'flex', alignItems: 'baseline', gap: 10,
  },
  statBig: {
    fontSize: 28,
    fontWeight: 800,
    color: '#fff',
    fontFamily: "'DM Mono',monospace",
    letterSpacing: '-0.02em',
    lineHeight: 1,
  },
  statSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: 400,
  },
  statRow: {
    display: 'flex',
    padding: '12px 20px',
    gap: 0,
  },
  statMini: {
    flex: 1,
    display: 'flex', flexDirection: 'column', gap: 2,
  },
  statMiniVal: {
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--ink)',
    fontFamily: "'DM Mono',monospace",
    letterSpacing: '-0.02em',
  },
  statMiniLbl: {
    fontSize: 11,
    color: 'var(--ink3)',
    fontWeight: 400,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statDivider: {
    width: 1, background: 'var(--ink4)', margin: '0 20px', alignSelf: 'stretch',
  },

  list: { display: 'flex', flexDirection: 'column', gap: 8 },

  card: {
    background: 'var(--surface)',
    borderRadius: 'var(--r)',
    padding: '14px 16px 14px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    boxShadow: 'var(--sh)',
    position: 'relative',
    overflow: 'hidden',
  },
  accent: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 4,
    borderRadius: '0 4px 4px 0',
  },
  times: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    minWidth: 48,
    flexShrink: 0,
  },
  timeEnd: {
    fontSize: 12, fontWeight: 700, color: 'var(--ink)',
    fontFamily: "'DM Mono',monospace",
  },
  timeLine: { fontSize: 10, color: 'var(--ink4)', lineHeight: 1 },
  timeStart: {
    fontSize: 12, fontWeight: 400, color: 'var(--ink3)',
    fontFamily: "'DM Mono',monospace",
  },
  mid: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 },
  activity: {
    fontSize: 14, fontWeight: 600, color: 'var(--ink)',
    lineHeight: 1.3,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  metaRow: { display: 'flex', alignItems: 'center', gap: 8 },
  tagBadge: {
    fontSize: 10, fontWeight: 600,
    padding: '3px 8px', borderRadius: 'var(--r-pill)',
    letterSpacing: '0.03em',
  },
  dur: {
    fontSize: 11, color: 'var(--ink3)',
    fontFamily: "'DM Mono',monospace",
  },
  del: {
    color: 'var(--ink4)', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 4, borderRadius: 6,
    transition: 'color 0.15s',
  },

  empty: {
    background: 'var(--surface)',
    borderRadius: 'var(--r)',
    padding: '48px 24px',
    textAlign: 'center',
    boxShadow: 'var(--sh)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
  },
  emptyCircle: { fontSize: 40, color: 'var(--ink4)' },
  emptyTxt: { fontSize: 16, fontWeight: 700, color: 'var(--ink2)' },
  emptyHint: { fontSize: 13, color: 'var(--ink3)' },
};
