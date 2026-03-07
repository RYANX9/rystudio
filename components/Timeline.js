'use client';

const TAG = {
  study:   { color: 'var(--study)', dim: 'var(--study-dim)' },
  Wasting: { color: 'var(--waste)', dim: 'var(--waste-dim)' },
  prayer:  { color: 'var(--pray)',  dim: 'var(--pray-dim)'  },
  food:    { color: 'var(--food)',  dim: 'var(--food-dim)'  },
  sleep:   { color: 'var(--sleep)', dim: 'var(--sleep-dim)' },
  other:   { color: 'var(--other)', dim: 'var(--other-dim)' },
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
        <div style={s.emptyLine} />
        <span style={s.emptyTxt}>no entries logged</span>
        <div style={s.emptyLine} />
      </div>
    );
  }

  const studyMin = entries.filter(e => e.tag === 'study').reduce((a, e) => a + e.duration_minutes, 0);
  const totalMin = entries.reduce((a, e) => a + e.duration_minutes, 0);
  const sorted   = [...entries].sort((a, b) => new Date(b.started_at) - new Date(a.started_at));

  // tag distribution for the mini bar
  const tagMin = {};
  entries.forEach(e => { tagMin[e.tag] = (tagMin[e.tag] || 0) + e.duration_minutes; });

  return (
    <div style={s.wrap}>

      {/* ── stat strip — monospace instrument readout ── */}
      <div style={s.statStrip}>
        <div style={s.statMain}>
          <span style={s.statBigNum}>{fmtDur(studyMin)}</span>
          <span style={s.statBigLabel}>STUDY</span>
        </div>

        <div style={s.statDivider} />

        <div style={s.statSub}>
          <div style={s.statSubRow}>
            <span style={s.statSubVal}>{fmtDur(totalMin)}</span>
            <span style={s.statSubLabel}>TOTAL</span>
          </div>
          <div style={s.statSubRow}>
            <span style={s.statSubVal}>{entries.length}</span>
            <span style={s.statSubLabel}>ENTRIES</span>
          </div>
        </div>

        {/* tag distribution bar */}
        <div style={s.tagBar}>
          {Object.entries(tagMin)
            .sort((a, b) => b[1] - a[1])
            .map(([tag, min]) => {
              const t = TAG[tag] || TAG.other;
              return (
                <div key={tag}
                  title={`${tag}: ${fmtDur(min)}`}
                  style={{
                    ...s.tagBarSlice,
                    width: `${(min / totalMin) * 100}%`,
                    background: t.color,
                  }}
                />
              );
            })}
        </div>
      </div>

      {/* ── entries ── */}
      <div style={s.list}>
        {sorted.map((entry, i) => {
          const t    = TAG[entry.tag] || TAG.other;
          const lo   = new Date(new Date(entry.started_at).getTime() + tz * 60000);
          const end  = new Date(lo.getTime() + entry.duration_minutes * 60000);
          const isLast = i === 0;

          return (
            <div key={entry.id} style={s.card}>
              {/* color rail */}
              <div style={{ ...s.rail, background: t.color, boxShadow: isLast ? `0 0 8px ${t.color}60` : 'none' }} />

              {/* time column */}
              <div style={s.timeCol}>
                <span style={s.timeEnd}>{fmt(end)}</span>
                <span style={s.timeSep}>╎</span>
                <span style={s.timeStart}>{fmt(lo)}</span>
              </div>

              {/* content */}
              <div style={s.mid}>
                <div style={s.activity}>{entry.activity}</div>
                <div style={s.meta}>
                  <span style={{
                    ...s.tagChip,
                    color:      t.color,
                    background: t.dim,
                    border:     `1px solid ${t.color}30`,
                  }}>
                    {entry.tag}
                  </span>
                  <span style={s.dur}>{entry.duration_minutes}m</span>
                </div>
              </div>

              <button style={s.del} onClick={() => onDelete(entry.id)} aria-label="delete">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M1.5 1.5l8 8M9.5 1.5l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
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
  wrap: { display: 'flex', flexDirection: 'column', gap: 8 },

  statStrip: {
    background: 'var(--s1)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r)',
    padding: '14px 18px 0',
    overflow: 'hidden',
  },
  statMain: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 12,
  },
  statBigNum: {
    fontSize: 36,
    fontWeight: 400,
    color: 'var(--study)',
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '-0.04em',
    lineHeight: 1,
  },
  statBigLabel: {
    fontSize: 9, fontWeight: 700, color: 'var(--study)',
    letterSpacing: '0.14em', opacity: 0.7,
    fontFamily: "'DM Mono', monospace",
  },
  statDivider: { height: 1, background: 'var(--border)', marginBottom: 12 },
  statSub: {
    display: 'flex',
    gap: 24,
    marginBottom: 14,
  },
  statSubRow: { display: 'flex', alignItems: 'baseline', gap: 6 },
  statSubVal: {
    fontSize: 18, fontWeight: 400, color: 'var(--ink)',
    fontFamily: "'DM Mono', monospace", letterSpacing: '-0.02em',
  },
  statSubLabel: {
    fontSize: 8, fontWeight: 700, color: 'var(--ink3)',
    letterSpacing: '0.12em', fontFamily: "'DM Mono', monospace",
  },
  tagBar: {
    display: 'flex',
    height: 3,
    overflow: 'hidden',
    marginLeft: -18,
    marginRight: -18,
  },
  tagBarSlice: { height: '100%', flexShrink: 0 },

  list: { display: 'flex', flexDirection: 'column', gap: 6 },

  card: {
    background: 'var(--s1)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r)',
    padding: '12px 14px 12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  rail: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 3,
  },
  timeCol: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 1,
    minWidth: 46, flexShrink: 0,
  },
  timeEnd: {
    fontSize: 11, fontWeight: 500, color: 'var(--ink)',
    fontFamily: "'DM Mono', monospace",
  },
  timeSep: { fontSize: 9, color: 'var(--ink4)', lineHeight: 1 },
  timeStart: {
    fontSize: 11, color: 'var(--ink3)',
    fontFamily: "'DM Mono', monospace",
  },
  mid: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 },
  activity: {
    fontSize: 14, fontWeight: 500, color: 'var(--ink)',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  meta: { display: 'flex', alignItems: 'center', gap: 8 },
  tagChip: {
    fontSize: 9, fontWeight: 700,
    padding: '3px 8px',
    borderRadius: 'var(--r-pill)',
    letterSpacing: '0.08em',
    fontFamily: "'DM Mono', monospace",
    textTransform: 'uppercase',
  },
  dur: {
    fontSize: 10, color: 'var(--ink3)',
    fontFamily: "'DM Mono', monospace",
  },
  del: {
    color: 'var(--ink4)', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 5, borderRadius: 6,
    transition: 'color 0.15s',
  },

  empty: {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '40px 0',
  },
  emptyLine: { flex: 1, height: 1, background: 'var(--border)' },
  emptyTxt: {
    fontSize: 10, color: 'var(--ink3)',
    letterSpacing: '0.1em', fontFamily: "'DM Mono', monospace",
    whiteSpace: 'nowrap',
  },
};
