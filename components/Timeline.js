//Timeline.js
'use client';

const TAG_COLORS = {
  study:  { bg: '#e8f4e8', text: '#2d7a2d' },
  break:  { bg: '#f0f0e8', text: '#666633' },
  prayer: { bg: '#e8eef8', text: '#2d4d99' },
  food:   { bg: '#fdf0e8', text: '#994d00' },
  other:  { bg: '#f0f0f0', text: '#555555' },
};

export default function Timeline({ entries, onDelete }) {
  if (!entries.length) {
    return <div style={styles.empty}>nothing logged yet — add your first entry above</div>;
  }

  const studyMinutes = entries
    .filter((e) => e.tag === 'study')
    .reduce((sum, e) => sum + e.duration_minutes, 0);

  const totalMinutes = entries.reduce((sum, e) => sum + e.duration_minutes, 0);

  // newest first
  const sorted = [...entries].sort((a, b) => new Date(b.started_at) - new Date(a.started_at));

  return (
    <div style={styles.wrapper}>
      <div style={styles.statsRow}>
        <div style={styles.stat}>
          <span style={styles.statVal}>{formatDuration(studyMinutes)}</span>
          <span style={styles.statLabel}>studied</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <span style={styles.statVal}>{formatDuration(totalMinutes)}</span>
          <span style={styles.statLabel}>total logged</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <span style={styles.statVal}>{entries.length}</span>
          <span style={styles.statLabel}>entries</span>
        </div>
      </div>

      <div style={styles.list}>
        {sorted.map((entry) => {
          const start = new Date(entry.started_at);
          const end = new Date(start.getTime() + entry.duration_minutes * 60000);
          const colors = TAG_COLORS[entry.tag] || TAG_COLORS.other;

          return (
            <div key={entry.id} style={styles.entry}>
              <div style={styles.timeCol}>
                <span style={styles.time}>{formatTime(start)}</span>
                <span style={styles.timeSep}>↓</span>
                <span style={styles.time}>{formatTime(end)}</span>
              </div>

              <div style={styles.middle}>
                <span style={styles.activity}>{entry.activity}</span>
                <div style={styles.meta}>
                  <span style={{ ...styles.tag, background: colors.bg, color: colors.text }}>
                    {entry.tag}
                  </span>
                  <span style={styles.dur}>{entry.duration_minutes} min</span>
                </div>
              </div>

              <button
                style={styles.del}
                onClick={() => onDelete(entry.id)}
                aria-label="delete"
              >
                ×
              </button>
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
  wrapper: { display: 'flex', flexDirection: 'column', gap: '12px' },
  statsRow: {
    display: 'flex',
    background: '#fff',
    border: '1px solid #e0dfd8',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  stat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px 8px',
    gap: '2px',
  },
  statVal: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: '10px',
    color: '#aaa',
    fontWeight: '600',
    letterSpacing: '0.05em',
  },
  statDivider: {
    width: '1px',
    background: '#e0dfd8',
    margin: '10px 0',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '6px' },
  entry: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    background: '#fff',
    border: '1px solid #e0dfd8',
    borderRadius: '10px',
  },
  timeCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1px',
    minWidth: '44px',
    flexShrink: 0,
  },
  time: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#555',
  },
  timeSep: {
    fontSize: '9px',
    color: '#ccc',
  },
  middle: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: 0,
  },
  activity: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  tag: {
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    padding: '2px 7px',
    borderRadius: '4px',
  },
  dur: {
    fontSize: '11px',
    color: '#aaa',
    fontWeight: '500',
  },
  del: {
    background: 'none',
    border: 'none',
    color: '#ccc',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '0 2px',
    flexShrink: 0,
    lineHeight: 1,
    borderRadius: '4px',
  },
  empty: {
    fontSize: '13px',
    color: '#bbb',
    padding: '32px 0',
    textAlign: 'center',
    lineHeight: 1.6,
  },
};
