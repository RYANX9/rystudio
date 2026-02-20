'use client';

const TAG_COLORS = {
  study: '#fff',
  break: '#555',
  prayer: '#888',
  food: '#666',
  other: '#444',
};

export default function Timeline({ entries, onDelete }) {
  if (!entries.length) {
    return <div style={styles.empty}>nothing logged yet</div>;
  }

  // total study minutes today
  const studyMinutes = entries
    .filter((e) => e.tag === 'study')
    .reduce((sum, e) => sum + e.duration_minutes, 0);

  return (
    <div style={styles.wrapper}>
      <div style={styles.stat}>
        {formatDuration(studyMinutes)} studied today
      </div>

      <div style={styles.list}>
        {entries.map((entry) => {
          const start = new Date(entry.started_at);
          const end = new Date(start.getTime() + entry.duration_minutes * 60000);

          return (
            <div key={entry.id} style={styles.entry}>
              <div style={styles.times}>
                <span style={styles.time}>{formatTime(start)}</span>
                <span style={styles.arrow}>→</span>
                <span style={styles.time}>{formatTime(end)}</span>
                <span style={styles.dur}>{entry.duration_minutes}m</span>
              </div>

              <div style={styles.middle}>
                <span style={{ ...styles.tag, color: TAG_COLORS[entry.tag] || '#444' }}>
                  {entry.tag}
                </span>
                <span style={styles.activity}>{entry.activity}</span>
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
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  stat: {
    fontSize: '12px',
    color: '#7a7a7a',
    padding: '0 4px',
    fontFamily: 'monospace',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  entry: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    background: '#1a1a1a',
    border: '1px solid #242424',
    borderRadius: '3px',
  },
  times: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    minWidth: '130px',
    flexShrink: 0,
  },
  time: {
    fontSize: '12px',
    color: '#7a7a7a',
    fontFamily: 'monospace',
  },
  arrow: {
    fontSize: '10px',
    color: '#444',
  },
  dur: {
    fontSize: '11px',
    color: '#4a4a4a',
    marginLeft: '4px',
    fontFamily: 'monospace',
  },
  middle: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },
  tag: {
    fontSize: '10px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  activity: {
    fontSize: '14px',
    color: '#d0d0d0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  del: {
    background: 'none',
    border: 'none',
    color: '#3a3a3a',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '0 4px',
    flexShrink: 0,
    lineHeight: 1,
  },
  empty: {
    fontSize: '13px',
    color: '#444',
    padding: '20px 0',
    textAlign: 'center',
  },
};
