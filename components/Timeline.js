'use client';

const TAG_COLORS = {
  study:   { bg: '#052e16', text: '#22c55e', border: '#166534' },
  Wasting: { bg: '#2d0a0a', text: '#ef4444', border: '#7f1d1d' },
  prayer:  { bg: '#0c1a3a', text: '#60a5fa', border: '#1e3a8a' },
  food:    { bg: '#1c0e04', text: '#f97316', border: '#7c2d12' },
  sleep:   { bg: '#150d2e', text: '#a78bfa', border: '#4c1d95' },
  other:   { bg: '#111',    text: '#9ca3af', border: '#374151' },
};

export default function Timeline({ entries, onDelete, budgets = {} }) {
  if (!entries.length) {
    return <div style={styles.empty}>nothing logged yet</div>;
  }

  const studyMinutes = entries.filter((e) => e.tag === 'study').reduce((s, e) => s + e.duration_minutes, 0);
  const totalMinutes = entries.reduce((s, e) => s + e.duration_minutes, 0);

  const tagTotals = entries.reduce((acc, e) => {
    acc[e.tag] = (acc[e.tag] || 0) + e.duration_minutes;
    return acc;
  }, {});

  const sorted = [...entries].sort((a, b) => new Date(b.started_at) - new Date(a.started_at));

  return (
    <div style={styles.wrapper}>
      <div style={styles.statsRow}>
        <div style={styles.stat}>
          <span style={{ ...styles.statVal, color: '#22c55e' }}>{formatDuration(studyMinutes)}</span>
          <span style={styles.statLabel}>studied</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <span style={styles.statVal}>{formatDuration(totalMinutes)}</span>
          <span style={styles.statLabel}>total</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <span style={styles.statVal}>{entries.length}</span>
          <span style={styles.statLabel}>entries</span>
        </div>
      </div>

      {/* budget warnings */}
      {Object.entries(budgets).map(([tag, limit]) => {
        const used = tagTotals[tag] || 0;
        if (used <= limit) return null;
        const c = TAG_COLORS[tag] || TAG_COLORS.other;
        return (
          <div key={tag} style={{ ...styles.budgetAlert, background: c.bg, borderColor: c.border, color: c.text }}>
            {tag}: {formatDuration(used)} / {formatDuration(limit)} limit exceeded
          </div>
        );
      })}

      <div style={styles.list}>
        {sorted.map((entry) => {
          const tz = -new Date().getTimezoneOffset();
          const start = new Date(new Date(entry.started_at).getTime() + tz * 60000);
          const end = new Date(start.getTime() + entry.duration_minutes * 60000);
          const colors = TAG_COLORS[entry.tag] || TAG_COLORS.other;

          return (
            <div key={entry.id} style={{ ...styles.entry, borderColor: colors.border }}>
              <div style={styles.timeCol}>
                <span style={styles.time}>{formatTime(end)}</span>
                <span style={styles.timeSep}>|</span>
                <span style={styles.time}>{formatTime(start)}</span>
              </div>
              <div style={styles.middle}>
                <span style={styles.activity}>{entry.activity}</span>
                <div style={styles.meta}>
                  <span style={{ ...styles.tag, background: colors.bg, color: colors.text }}>
                    {entry.tag}
                  </span>
                  <span style={styles.dur}>{entry.duration_minutes}m</span>
                </div>
              </div>
              <button style={styles.del} onClick={() => onDelete(entry.id)}>×</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

const styles = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: '10px' },
  statsRow: {
    display: 'flex', background: '#111', border: '1px solid #1e1e1a',
    borderRadius: '10px', overflow: 'hidden',
  },
  stat: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', padding: '12px 8px', gap: '2px',
  },
  statVal: { fontSize: '16px', fontWeight: '700', color: '#e8e8e0' },
  statLabel: { fontSize: '10px', color: '#444', fontWeight: '600', letterSpacing: '0.05em' },
  statDivider: { width: '1px', background: '#1e1e1a', margin: '10px 0' },
  budgetAlert: {
    fontSize: '11px', fontWeight: '700', padding: '7px 12px',
    borderRadius: '8px', border: '1px solid', letterSpacing: '0.03em',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '5px' },
  entry: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '11px 13px', background: '#111',
    border: '1px solid', borderRadius: '10px',
  },
  timeCol: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '1px', minWidth: '44px', flexShrink: 0,
  },
  time: { fontSize: '11px', fontWeight: '600', color: '#666' },
  timeSep: { fontSize: '8px', color: '#333' },
  middle: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 },
  activity: {
    fontSize: '14px', fontWeight: '600', color: '#e8e8e0',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  meta: { display: 'flex', alignItems: 'center', gap: '8px' },
  tag: {
    fontSize: '10px', fontWeight: '700', letterSpacing: '0.06em',
    textTransform: 'uppercase', padding: '2px 7px', borderRadius: '4px',
  },
  dur: { fontSize: '11px', color: '#555', fontWeight: '500' },
  del: {
    background: 'none', border: 'none', color: '#333', fontSize: '20px',
    cursor: 'pointer', padding: '0 2px', flexShrink: 0, lineHeight: 1,
  },
  empty: {
    fontSize: '13px', color: '#444', padding: '32px 0',
    textAlign: 'center', lineHeight: 1.6,
  },
};
