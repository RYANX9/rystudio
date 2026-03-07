'use client';

const TAG = {
  study:   { color: 'var(--study)', bg: 'var(--study-bg)' },
  Wasting: { color: 'var(--waste)', bg: 'var(--waste-bg)' },
  prayer:  { color: 'var(--pray)',  bg: 'var(--pray-bg)'  },
  food:    { color: 'var(--food)',  bg: 'var(--food-bg)'  },
  sleep:   { color: 'var(--sleep)', bg: 'var(--sleep-bg)' },
  other:   { color: 'var(--other)', bg: 'var(--other-bg)' },
};

function fmtDur(m) {
  if (!m) return '0m';
  const h = Math.floor(m / 60), mm = m % 60;
  if (!h) return `${mm}m`;
  if (!mm) return `${h}h`;
  return `${h}h ${mm}m`;
}
function fmt(iso, tz) {
  const d = new Date(new Date(iso).getTime() + tz * 60000);
  return d.toISOString().slice(11, 16);
}

export default function Timeline({ entries, onDelete, tz = 0 }) {
  if (!entries.length) {
    return (
      <div style={s.empty}>
        <span style={s.emptyTxt}>Nothing logged yet today</span>
      </div>
    );
  }

  const sorted   = [...entries].sort((a, b) => new Date(b.started_at) - new Date(a.started_at));
  const totalMin = entries.reduce((a, e) => a + e.duration_minutes, 0);

  // tag distribution strip
  const tagMin = {};
  entries.forEach(e => { tagMin[e.tag] = (tagMin[e.tag] || 0) + e.duration_minutes; });

  return (
    <div style={s.wrap}>
      {/* summary line */}
      <div style={s.summary}>
        <span style={s.summaryTxt}>{entries.length} entries · {fmtDur(totalMin)} total</span>
        <div style={s.tagStrip}>
          {Object.entries(tagMin).sort((a,b) => b[1]-a[1]).map(([tag, min]) => (
            <div key={tag} style={{
              ...s.stripSlice,
              flex: min,
              background: TAG[tag]?.color || 'var(--other)',
            }} />
          ))}
        </div>
      </div>

      {/* entry list — Option C style: dot + row */}
      <div style={s.list}>
        {sorted.map((entry, i) => {
          const t    = TAG[entry.tag] || TAG.other;
          const startT = fmt(entry.started_at, tz);
          const endT   = fmt(
            new Date(new Date(entry.started_at).getTime() + entry.duration_minutes * 60000).toISOString(),
            tz,
          );
          const isLast = i === sorted.length - 1;

          return (
            <div key={entry.id} style={{
              ...s.row,
              borderBottom: isLast ? 'none' : '1px solid var(--border2)',
            }}>
              {/* dot + connector */}
              <div style={s.dotCol}>
                <div style={{ ...s.dot, background: t.color }} />
                {!isLast && <div style={s.connector} />}
              </div>

              {/* time */}
              <div style={s.timeCol}>
                <span style={s.timeStart}>{startT}</span>
                <span style={s.timeSep}>↓</span>
                <span style={s.timeEnd}>{endT}</span>
              </div>

              {/* content */}
              <div style={s.mid}>
                <div style={s.activity}>{entry.activity}</div>
                <div style={s.metaRow}>
                  <span style={{ ...s.chip, color: t.color, background: t.bg }}>
                    {entry.tag}
                  </span>
                  <span style={s.dur}>{entry.duration_minutes}m</span>
                </div>
              </div>

              <button style={s.del} onClick={() => onDelete(entry.id)} aria-label="delete">
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  wrap: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r)',
    overflow: 'hidden',
  },
  summary: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
    borderBottom: '1px solid var(--border)',
  },
  summaryTxt: {
    fontSize: 11, color: 'var(--ink2)', fontWeight: 500, whiteSpace: 'nowrap',
  },
  tagStrip: {
    flex: 1, display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', gap: 1,
  },
  stripSlice: { height: '100%', minWidth: 3 },

  list: { display: 'flex', flexDirection: 'column' },

  row: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '13px 16px',
  },
  dotCol: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 4,
    width: 12, flexShrink: 0,
  },
  dot: {
    width: 9, height: 9,
    borderRadius: '50%',
    flexShrink: 0,
  },
  connector: {
    width: 1, flex: 1, minHeight: 18,
    background: 'var(--border)',
    marginTop: 4,
  },
  timeCol: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 1,
    minWidth: 40, flexShrink: 0, paddingTop: 1,
  },
  timeStart: { fontSize: 11, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.2 },
  timeSep:   { fontSize: 9,  color: 'var(--ink3)', lineHeight: 1 },
  timeEnd:   { fontSize: 11, color: 'var(--ink3)', lineHeight: 1.2 },

  mid: { flex: 1, minWidth: 0, paddingTop: 1 },
  activity: {
    fontSize: 14, fontWeight: 500, color: 'var(--ink)',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    marginBottom: 4,
  },
  metaRow: { display: 'flex', alignItems: 'center', gap: 7 },
  chip: {
    fontSize: 10, fontWeight: 600,
    padding: '2px 9px', borderRadius: 'var(--r-pill)',
    letterSpacing: '0.03em',
  },
  dur: { fontSize: 11, color: 'var(--ink3)' },

  del: {
    fontSize: 18, color: 'var(--ink4)',
    padding: '0 2px',
    lineHeight: 1, flexShrink: 0,
    paddingTop: 2,
    transition: 'color 0.15s',
  },

  empty: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r)',
    padding: '40px 20px',
    textAlign: 'center',
  },
  emptyTxt: { fontSize: 13, color: 'var(--ink3)' },
};
