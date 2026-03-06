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
        <div style={s.emptyInner}>
          <div style={s.emptyIcon}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="var(--ink4)" strokeWidth="2"/>
              <path d="M16 9v7l4 4" stroke="var(--ink4)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <p style={s.emptyTxt}>Nothing logged yet</p>
          <p style={s.emptyHint}>Add your first entry above</p>
        </div>
      </div>
    );
  }

  const studyMin = entries.filter(e => e.tag === 'study').reduce((a, e) => a + e.duration_minutes, 0);
  const totalMin = entries.reduce((a, e) => a + e.duration_minutes, 0);
  const sorted   = [...entries].sort((a, b) => new Date(b.started_at) - new Date(a.started_at));

  // tag breakdown for the 24h ribbon
  const tagMin = {};
  entries.forEach(e => { tagMin[e.tag] = (tagMin[e.tag] || 0) + e.duration_minutes; });
  const ribbonTags = Object.entries(tagMin).sort((a, b) => b[1] - a[1]);

  return (
    <div style={s.wrap}>

      {/* ── stat card — dark top half / light bottom half, exactly like reference ── */}
      <div style={s.statCard}>
        <div style={s.statDark}>
          <div style={s.statLeft}>
            <div style={s.statBolt}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M8 1.5L3 8h4.5L6 12.5l5-6.5H7L8 1.5z" fill="var(--orange)"/>
              </svg>
            </div>
            <div>
              <div style={s.statBig}>{fmtDur(studyMin)}</div>
              <div style={s.statSub}>studied today</div>
            </div>
          </div>
          <div style={s.statArrow}>›</div>
        </div>
        <div style={s.statLight}>
          <div style={s.statMini}>
            <div style={s.statMiniVal}>{fmtDur(totalMin)}</div>
            <div style={s.statMiniLbl}>total logged</div>
          </div>
          <div style={s.statDivider} />
          <div style={s.statMini}>
            <div style={s.statMiniVal}>{entries.length}</div>
            <div style={s.statMiniLbl}>entries</div>
          </div>
          <div style={s.statDivider} />
          <div style={s.statMini}>
            <div style={s.statMiniVal}>{ribbonTags[0]?.[0] || '—'}</div>
            <div style={s.statMiniLbl}>top tag</div>
          </div>
        </div>

        {/* horizontal tag bar — like the energy usage breakdown in reference */}
        {ribbonTags.length > 1 && (
          <div style={s.tagBar}>
            {ribbonTags.map(([tag, min]) => {
              const t = TAG[tag] || TAG.other;
              const w = (min / totalMin) * 100;
              return (
                <div
                  key={tag}
                  title={`${tag}: ${fmtDur(min)}`}
                  style={{ ...s.tagBarSlice, width: `${w}%`, background: t.dot }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* ── entry list ── */}
      <div style={s.list}>
        {sorted.map(entry => {
          const t   = TAG[entry.tag] || TAG.other;
          const lo  = new Date(new Date(entry.started_at).getTime() + tz * 60000);
          const end = new Date(lo.getTime() + entry.duration_minutes * 60000);

          return (
            <div key={entry.id} style={s.card}>
              {/* left accent bar — same width/style as reference device cards */}
              <div style={{ ...s.accent, background: t.dot }} />

              {/* time column */}
              <div style={s.timeCol}>
                <span style={s.timeEnd}>{fmt(end)}</span>
                <span style={s.timeSep}>│</span>
                <span style={s.timeStart}>{fmt(lo)}</span>
              </div>

              {/* content */}
              <div style={s.mid}>
                <div style={s.activity}>{entry.activity}</div>
                <div style={s.meta}>
                  <span style={{ ...s.tagPill, background: t.bg, color: t.c }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: t.dot, display: 'inline-block', flexShrink: 0 }} />
                    {entry.tag}
                  </span>
                  <span style={s.dur}>{entry.duration_minutes}m</span>
                </div>
              </div>

              <button style={s.del} onClick={() => onDelete(entry.id)} aria-label="delete">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
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

  /* stat card: dark top + light bottom, mimics reference energy card structure */
  statCard: {
    background: 'var(--surface)',
    borderRadius: 'var(--r)',
    overflow: 'hidden',
    boxShadow: 'var(--sh)',
  },
  statDark: {
    background: 'var(--dark)',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  statBolt: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'rgba(232,98,42,0.15)',
    border: '1.5px solid rgba(232,98,42,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statBig: {
    fontSize: 26,
    fontWeight: 800,
    color: '#fff',
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '-0.03em',
    lineHeight: 1,
  },
  statSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 3,
  },
  statArrow: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 22,
  },

  statLight: {
    display: 'flex',
    padding: '14px 20px',
  },
  statMini: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  statMiniVal: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--ink)',
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '-0.02em',
  },
  statMiniLbl: {
    fontSize: 10,
    color: 'var(--ink3)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statDivider: {
    width: 1,
    background: 'var(--ink4)',
    margin: '0 16px',
    alignSelf: 'stretch',
  },

  tagBar: {
    display: 'flex',
    height: 4,
    overflow: 'hidden',
  },
  tagBarSlice: {
    height: '100%',
    flexShrink: 0,
  },

  /* entry list */
  list: { display: 'flex', flexDirection: 'column', gap: 8 },

  card: {
    background: 'var(--surface)',
    borderRadius: 'var(--r)',
    padding: '13px 14px 13px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    boxShadow: 'var(--sh)',
    position: 'relative',
    overflow: 'hidden',
  },
  accent: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 4,
  },
  timeCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    minWidth: 46,
    flexShrink: 0,
  },
  timeEnd: {
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--ink)',
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '0.01em',
  },
  timeSep: { fontSize: 9, color: 'var(--ink4)', lineHeight: 1 },
  timeStart: {
    fontSize: 11,
    color: 'var(--ink3)',
    fontFamily: "'DM Mono', monospace",
  },
  mid: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 },
  activity: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--ink)',
    lineHeight: 1.3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  meta: { display: 'flex', alignItems: 'center', gap: 8 },
  tagPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 10,
    fontWeight: 600,
    padding: '3px 8px 3px 6px',
    borderRadius: 'var(--r-pill)',
    letterSpacing: '0.02em',
  },
  dur: {
    fontSize: 11,
    color: 'var(--ink3)',
    fontFamily: "'DM Mono', monospace",
  },
  del: {
    color: 'var(--ink4)',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    borderRadius: 8,
    transition: 'color 0.15s',
  },

  empty: {
    background: 'var(--surface)',
    borderRadius: 'var(--r)',
    boxShadow: 'var(--sh)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
  },
  emptyInner: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  emptyIcon: { opacity: 0.5 },
  emptyTxt: { fontSize: 16, fontWeight: 700, color: 'var(--ink2)' },
  emptyHint: { fontSize: 13, color: 'var(--ink3)' },
};
