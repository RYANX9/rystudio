'use client';
import { useState, useEffect } from 'react';

const GOAL = 360;

const TAG_COLORS = {
  study:  '#2d7a2d',
  prayer: '#2d4d99',
  food:   '#994d00',
  break:  '#666633',
  other:  '#999',
};

const BLOCK_WINDOWS = [
  { label: 'B1', start: 13 * 60 + 5,  end: 16 * 60 },
  { label: 'B2', start: 17 * 60,       end: 18 * 60 + 20 },
  { label: 'B3', start: 22 * 60 + 30,  end: 25 * 60 },
];

export default function WeeklyView() {
  const [weekData, setWeekData] = useState([]);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const tz = -new Date().getTimezoneOffset();
    const { from, to } = weekRange();

    try {
      const [statsRes, streakRes] = await Promise.all([
        fetch(`/api/stats?from=${from}&to=${to}&tz=${tz}`),
        fetch(`/api/streak?tz=${tz}`),
      ]);

      const stats = await statsRes.json();
      const streakData = await streakRes.json();

      // log to confirm what we're getting
      console.log('stats raw:', stats);
      console.log('weekRange:', from, to);

      setStreak(streakData);
      setWeekData(buildWeekData(from, to, Array.isArray(stats) ? stats : []));
      setSelectedDay(todayStr());
    } catch (err) {
      console.error('WeeklyView load error:', err);
      setWeekData([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div style={s.loading}>loading...</div>;

  const selected = weekData.find((d) => d.date === selectedDay);

  return (
    <div style={s.wrapper}>

      <div style={s.streakRow}>
        <div style={s.streakBox}>
          <span style={s.streakNum}>{streak?.streak ?? 0}</span>
          <span style={s.streakLabel}>day streak</span>
        </div>
        <div style={s.streakNote}>
          {streak?.streak === 0
            ? 'hit 6h today to start a streak'
            : `${streak?.streak} consecutive day${streak?.streak === 1 ? '' : 's'} at 6h+`}
        </div>
      </div>

      <div style={s.barsWrap}>
        {weekData.map((day) => {
          const studyMin = day.tags.study || 0;
          const pct = Math.min(100, Math.round((studyMin / GOAL) * 100));
          const isSelected = day.date === selectedDay;
          const isToday = day.date === todayStr();

          return (
            <div key={day.date} style={s.barCol} onClick={() => setSelectedDay(day.date)}>
              <div style={s.barTrack}>
                <div
                  style={{
                    ...s.barFill,
                    height: `${Math.max(pct, pct > 0 ? 3 : 0)}%`,
                    background:
                      pct >= 100 ? '#2d7a2d' :
                      pct >= 50  ? '#5a9a40' :
                      pct > 0    ? '#c8a030' : 'transparent',
                    opacity: isSelected ? 1 : 0.65,
                  }}
                />
                {pct >= 100 && <div style={s.goalDot} />}
              </div>
              <span style={{
                ...s.barDay,
                fontWeight: isToday ? '700' : '500',
                color: isSelected ? '#1a1a1a' : '#aaa',
              }}>
                {dayLabel(day.date)}
              </span>
            </div>
          );
        })}
      </div>

      {selected && (
        <div style={s.detail}>
          <div style={s.detailHeader}>
            <span style={s.detailDate}>
              {selected.date === todayStr() ? 'today' : formatDate(selected.date)}
            </span>
            <span style={s.detailStudy}>
              {formatDur(selected.tags.study || 0)} studied
            </span>
          </div>

          <div style={s.tagBreakdown}>
            {Object.keys(selected.tags).length === 0 && (
              <div style={s.noData}>nothing logged</div>
            )}
            {Object.entries(selected.tags)
              .sort((a, b) => b[1] - a[1])
              .map(([tag, min]) => {
                const maxMin = Math.max(...Object.values(selected.tags));
                return (
                  <div key={tag} style={s.tagRow}>
                    <div style={s.tagRowLeft}>
                      <div style={{ ...s.tagDot, background: TAG_COLORS[tag] || '#999' }} />
                      <span style={s.tagName}>{tag}</span>
                    </div>
                    <div style={s.tagBarWrap}>
                      <div
                        style={{
                          ...s.tagBarFill,
                          width: `${Math.round((min / maxMin) * 100)}%`,
                          background: TAG_COLORS[tag] || '#999',
                          opacity: 0.3,
                        }}
                      />
                    </div>
                    <span style={s.tagMin}>{formatDur(min)}</span>
                  </div>
                );
              })}
          </div>

          <BlockStatus entries={selected.studyEntries} />
        </div>
      )}

      <ExportButton weekData={weekData} streak={streak} />
    </div>
  );
}

function BlockStatus({ entries }) {
  if (!entries || entries.length === 0) {
    return (
      <div style={s.blocks}>
        {BLOCK_WINDOWS.map((b) => (
          <div key={b.label} style={{ ...s.blockPill, ...s.blockMiss }}>{b.label}</div>
        ))}
      </div>
    );
  }

  const done = BLOCK_WINDOWS.map((block) => {
    const covered = entries.reduce((acc, e) => {
      const startMin = timeToMin(e.started_at);
      const endMin = startMin + e.duration_minutes;
      const overlapStart = Math.max(startMin, block.start);
      const overlapEnd = Math.min(endMin, block.end);
      return acc + Math.max(0, overlapEnd - overlapStart);
    }, 0);
    return covered >= 20;
  });

  return (
    <div style={s.blocks}>
      {BLOCK_WINDOWS.map((b, i) => (
        <div key={b.label} style={{ ...s.blockPill, ...(done[i] ? s.blockDone : s.blockMiss) }}>
          {done[i] ? '✓ ' : ''}{b.label}
        </div>
      ))}
    </div>
  );
}

function ExportButton({ weekData, streak }) {
  function generate() {
    const lines = [`Week summary — streak: ${streak?.streak ?? 0} days`, ''];
    weekData.forEach((day) => {
      const label = day.date === todayStr() ? 'today' : formatDate(day.date);
      const study = formatDur(day.tags.study || 0);
      const other = day.tags.other ? ` | other: ${formatDur(day.tags.other)}` : '';
      lines.push(`${label}: ${study} study${other}`);
    });
    lines.push('');
    lines.push(`total study: ${formatDur(weekData.reduce((sum, d) => sum + (d.tags.study || 0), 0))}`);
    return lines.join('\n');
  }

  return (
    <button style={s.exportBtn} onClick={() => navigator.clipboard.writeText(generate()).catch(() => {})}>
      copy week summary
    </button>
  );
}

// THE FIX: normalize date keys consistently using UTC date string
function normalizeDate(val) {
  if (!val) return '';
  // Postgres DATE comes back as a JS Date object at midnight UTC
  // e.g. 2025-02-23T00:00:00.000Z → '2025-02-23'
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  // If it's already a string like '2025-02-23' or '2025-02-23T00:00:00.000Z'
  return String(val).slice(0, 10);
}

function buildWeekData(from, to, rows) {
  // build all days in range
  const days = [];
  const cursor = new Date(from + 'T12:00:00Z');
  const end = new Date(to + 'T12:00:00Z');
  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  // group by normalized date key
  const map = {};
  rows.forEach((r) => {
    const d = normalizeDate(r.date);
    if (!d) return;
    if (!map[d]) map[d] = {};
    map[d][r.tag] = r.total_minutes;
  });

  console.log('buildWeekData days:', days);
  console.log('buildWeekData map keys:', Object.keys(map));

  return days.map((date) => ({
    date,
    tags: map[date] || {},
    studyEntries: [],
  }));
}

function timeToMin(isoString) {
  const d = new Date(isoString);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.getUTCHours() * 60 + local.getUTCMinutes();
}

function todayStr() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString().slice(0, 10);
}

function weekRange() {
  const today = new Date(todayStr() + 'T12:00:00Z');
  const day = today.getUTCDay();
  const monday = new Date(today);
  monday.setUTCDate(today.getUTCDate() - ((day + 6) % 7));
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return {
    from: monday.toISOString().slice(0, 10),
    to:   sunday.toISOString().slice(0, 10),
  };
}

function dayLabel(dateStr) {
  return new Date(dateStr + 'T12:00:00Z')
    .toLocaleDateString([], { weekday: 'short' })
    .slice(0, 2);
}

function formatDate(str) {
  return new Date(str + 'T12:00:00Z').toLocaleDateString([], {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

function formatDur(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

const s = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: '14px' },
  loading: { fontSize: '13px', color: '#aaa', textAlign: 'center', padding: '32px 0' },
  streakRow: {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '14px 16px', background: '#fff',
    border: '1px solid #e0dfd8', borderRadius: '10px',
  },
  streakBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '48px' },
  streakNum: { fontSize: '28px', fontWeight: '700', color: '#1a1a1a', lineHeight: 1 },
  streakLabel: { fontSize: '10px', color: '#aaa', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' },
  streakNote: { fontSize: '13px', color: '#666', lineHeight: 1.4 },
  barsWrap: {
    display: 'flex', gap: '6px', alignItems: 'flex-end',
    padding: '14px 16px', background: '#fff',
    border: '1px solid #e0dfd8', borderRadius: '10px',
    height: '110px',
  },
  barCol: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '5px', height: '100%', cursor: 'pointer',
  },
  barTrack: {
    flex: 1, width: '100%', background: '#f0f0e8',
    borderRadius: '4px', overflow: 'hidden', position: 'relative',
    display: 'flex', alignItems: 'flex-end',
  },
  barFill: { width: '100%', borderRadius: '4px', transition: 'height 0.4s ease' },
  goalDot: {
    position: 'absolute', top: '4px', left: '50%', transform: 'translateX(-50%)',
    width: '5px', height: '5px', borderRadius: '50%', background: '#2d7a2d',
  },
  barDay: { fontSize: '11px', letterSpacing: '0.02em' },
  detail: {
    display: 'flex', flexDirection: 'column', gap: '10px',
    padding: '14px 16px', background: '#fff',
    border: '1px solid #e0dfd8', borderRadius: '10px',
  },
  detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  detailDate: { fontSize: '14px', fontWeight: '700', color: '#1a1a1a' },
  detailStudy: { fontSize: '13px', color: '#2d7a2d', fontWeight: '600' },
  tagBreakdown: { display: 'flex', flexDirection: 'column', gap: '6px' },
  tagRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  tagRowLeft: { display: 'flex', alignItems: 'center', gap: '6px', minWidth: '70px' },
  tagDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  tagName: { fontSize: '12px', color: '#555', fontWeight: '600' },
  tagBarWrap: {
    flex: 1, height: '8px', background: '#f0f0e8',
    borderRadius: '4px', overflow: 'hidden', position: 'relative',
  },
  tagBarFill: {
    position: 'absolute', top: 0, left: 0,
    height: '100%', borderRadius: '4px', transition: 'width 0.4s ease',
  },
  tagMin: { fontSize: '11px', color: '#888', fontWeight: '600', minWidth: '36px', textAlign: 'right' },
  noData: { fontSize: '12px', color: '#bbb', padding: '4px 0' },
  blocks: { display: 'flex', gap: '8px' },
  blockPill: {
    flex: 1, textAlign: 'center', padding: '6px 0',
    fontSize: '12px', fontWeight: '700', borderRadius: '6px',
  },
  blockDone: { background: '#e8f4e8', color: '#2d7a2d' },
  blockMiss: { background: '#f0f0e8', color: '#bbb' },
  exportBtn: {
    background: '#f5f5f0', border: '1px solid #e0dfd8', color: '#555',
    padding: '11px', fontSize: '13px', fontWeight: '600',
    fontFamily: "'Cairo', sans-serif", cursor: 'pointer', borderRadius: '10px', textAlign: 'center',
  },
};
          
