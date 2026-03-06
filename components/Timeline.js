'use client';

const TAG_STYLE = {
  study:   { bg: 'var(--accent2-bg)', color: 'var(--accent2)', dot: '#2D7A4F' },
  Wasting: { bg: '#FEF2F2',           color: '#DC2626',         dot: '#DC2626' },
  prayer:  { bg: '#EFF6FF',           color: '#2563EB',         dot: '#2563EB' },
  food:    { bg: '#FFF7ED',           color: '#C2410C',         dot: '#EA580C' },
  sleep:   { bg: '#F5F3FF',           color: '#7C3AED',         dot: '#7C3AED' },
  other:   { bg: 'var(--surface2)',   color: 'var(--ink2)',     dot: '#9CA3AF' },
};

function fmtDur(m) {
  const h = Math.floor(m / 60), mm = m % 60;
  if (h === 0) return `${mm}m`;
  if (mm === 0) return `${h}h`;
  return `${h}h\u202f${mm}m`;
}

export default function Timeline({ entries, onDelete }) {
  if (!entries.length) {
    return (
      <div style={s.empty}>
        <div style={s.emptyIcon}>○</div>
        <div>Nothing logged yet</div>
      </div>
    );
  }

  const studyMin = entries.filter(e => e.tag === 'study').reduce((sum, e) => sum + e.duration_minutes, 0);
  const totalMin = entries.reduce((sum, e) => sum + e.duration_minutes, 0);
  const tz = -new Date().getTimezoneOffset();

  const sorted = [...entries].sort((a, b) => new Date(b.started_at) - new Date(a.started_at));

  return (
    <div style={s.wrapper}>
      {/* Stat cards */}
      <div style={s.statRow}>
        <div style={s.statCard}>
          <span style={{ ...s.statVal, color: 'var(--accent2)' }}>{fmtDur(studyMin)}</span>
          <span style={s.statLabel}>studied</span>
        </div>
        <div style={s.statCard}>
          <span style={s.statVal}>{fmtDur(totalMin)}</span>
          <span style={s.statLabel}>total</span>
        </div>
        <div style={s.statCard}>
          <span style={s.statVal}>{entries.length}</span>
          <span style={s.statLabel}>entries</span>
        </div>
      </div>

      {/* Entry list */}
      <div style={s.list}>
        {sorted.map(entry => {
          const start = new Date(new Date(entry.started_at).getTime() + tz * 60000);
          const end = new Date(start.getTime() + entry.duration_minutes * 60000);
          const ts = TAG_STYLE[entry.tag] || TAG_STYLE.other;
          const fmt = d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <div key={entry.id} style={s.card}>
              <div style={{ ...s.tagAccent, background: ts.dot }} />
              <div style={s.timeCol}>
                <span style={s.timeEnd}>{fmt(end)}</span>
                <span style={s.timeSep}>↑</span>
                <span style={s.timeStart}>{fmt(start)}</span>
              </div>
              <div style={s.middle}>
                <span style={s.activity}>{entry.activity}</span>
                <div style={s.meta}>
                  <span style={{ ...s.tagBadge, background: ts.bg, color: ts.color }}>
                    {entry.tag}
                  </span>
                  <span style={s.dur}>{entry.duration_minutes}m</span>
                </div>
              </div>
              <button style={s.del} onClick={() => onDelete(entry.id)}>×</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: 10 },
  statRow: { display: 'flex', gap: 8 },
  statCard: {
    flex: 1,
    background: 'var(--surface)',
    borderRadius: 'var(--radius)',
    padding: '12px 8px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
    boxShadow: 'var(--shadow)',
  },
  statVal: {
    fontSize: 17, fontWeight: 700, color: 'var(--ink)',
    fontFamily: "'DM Mono', monospace",
  },
  statLabel: { fontSize: 10, color: 'var(--ink3)', fontWeight: 500, letterSpacing: '0.04em' },
  list: { display: 'flex', flexDirection: 'column', gap: 6 },
  card: {
    background: 'var(--surface)',
    borderRadius: 'var(--radius)',
    padding: '12px 14px',
    display: 'flex', alignItems: 'center', gap: 12,
    boxShadow: 'var(--shadow)',
    overflow: 'hidden',
    position: 'relative',
  },
  tagAccent: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 3, borderRadius: '0 3px 3px 0',
  },
  timeCol: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 1, minWidth: 44, flexShrink: 0, paddingLeft: 4,
  },
  timeEnd: { fontSize: 11, fontWeight: 600, color: 'var(--ink)', fontFamily: "'DM Mono', monospace" },
  timeSep: { fontSize: 8, color: 'var(--ink3)' },
  timeStart: { fontSize: 11, fontWeight: 400, color: 'var(--ink3)', fontFamily: "'DM Mono', monospace" },
  middle: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 },
  activity: {
    fontSize: 14, fontWeight: 500, color: 'var(--ink)',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  meta: { display: 'flex', alignItems: 'center', gap: 8 },
  tagBadge: {
    fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
    padding: '2px 7px', borderRadius: 100,
  },
  dur: { fontSize: 11, color: 'var(--ink3)', fontFamily: "'DM Mono', monospace" },
  del: {
    background: 'none', border: 'none', color: 'var(--border)',
    fontSize: 18, padding: '0 2px', lineHeight: 1, flexShrink: 0,
    transition: 'color 0.15s',
  },
  empty: {
    textAlign: 'center', color: 'var(--ink3)', fontSize: 13,
    padding: '48px 0', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 8,
  },
  emptyIcon: { fontSize: 28, opacity: 0.3 },
};
