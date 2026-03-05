'use client';
import { useState, useEffect } from 'react';

const GOAL = 180;

const TAG_COLORS = {
  study:   '#22c55e',
  Wasting: '#ef4444',
  prayer:  '#60a5fa',
  food:    '#f97316',
  sleep:   '#a78bfa',
  other:   '#6b7280',
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
      const [entriesRes, streakRes] = await Promise.all([
        fetch(`/api/entries?from=${from}&to=${to}&tz=${tz}`),
        fetch(`/api/streak?tz=${tz}`),
      ]);
      const rawEntries = await entriesRes.json();
      const streakData = await streakRes.json();
      setStreak(streakData);
      setWeekData(buildWeekData(from, to, Array.isArray(rawEntries) ? rawEntries : [], tz));
      setSelectedDay(todayStr());
    } catch (_) {
      setWeekData([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div style={s.loading}>loading...</div>;

  const selected = weekData.find((d) => d.date === selectedDay);

  const weekStudyTotal = weekData.reduce((sum, d) => sum + (d.tags.study || 0), 0);
  const weekGoalDays = weekData.filter((d) => (d.tags.study || 0) >= GOAL).length;

  return (
    <div style={s.wrapper}>

      {/* streak row — now shows more */}
      <div style={s.streakRow}>
        <div style={s.streakItem}>
          <span style={{ ...s.streakNum, color: '#22c55e' }}>{streak?.streak ?? 0}</span>
          <span style={s.streakLabel}>streak</span>
        </div>
        <div style={s.streakDivider} />
        <div style={s.streakItem}>
          <span style={{ ...s.streakNum, color: '#f59e0b' }}>{streak?.longest_streak ?? 0}</span>
          <span style={s.streakLabel}>best</span>
        </div>
        <div style={s.streakDivider} />
        <div style={s.streakItem}>
          <span style={s.streakNum}>{weekGoalDays}/7</span>
          <span style={s.streakLabel}>goal days</span>
        </div>
        <div style={s.streakDivider} />
        <div style={s.streakItem}>
          <span style={{ ...s.streakNum, color: '#a78bfa' }}>{fmtDur(weekStudyTotal)}</span>
          <span style={s.streakLabel}>this week</span>
        </div>
      </div>

      {/* day bars */}
      <div style={s.barsWrap}>
        {weekData.map((day) => {
          const studyMin = day.tags.study || 0;
          const pct = Math.min(100, Math.round((studyMin / GOAL) * 100));
          const isSelected = day.date === selectedDay;
          const isToday = day.date === todayStr();

          return (
            <div key={day.date} style={s.barCol} onClick={() => setSelectedDay(day.date)}>
              <div style={s.barTrack}>
                <div style={{
                  ...s.barFill,
                  height: `${Math.max(pct, pct > 0 ? 3 : 0)}%`,
                  background:
                    pct >= 100 ? '#22c55e' :
                    pct >= 50  ? '#84cc16' :
                    pct > 0    ? '#f59e0b' : 'transparent',
                  opacity: isSelected ? 1 : 0.5,
                }} />
                {pct >= 100 && <div style={s.goalDot} />}
              </div>
              <span style={{
                ...s.barDay,
                fontWeight: isToday ? '700' : '500',
                color: isSelected ? '#e8e8e0' : '#444',
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
            <span style={{ ...s.detailStudy, color: (selected.tags.study || 0) >= GOAL ? '#22c55e' : '#888' }}>
              {fmtDur(selected.tags.study || 0)} studied
            </span>
          </div>

          {/* study progress bar */}
          <div style={s.dayProgressWrap}>
            <div style={s.dayProgressTrack}>
              <div style={{
                ...s.dayProgressFill,
                width: `${Math.min(100, Math.round(((selected.tags.study || 0) / GOAL) * 100))}%`,
                background: (selected.tags.study || 0) >= GOAL ? '#22c55e' : '#f59e0b',
              }} />
            </div>
            <span style={s.dayProgressLabel}>
              {Math.min(100, Math.round(((selected.tags.study || 0) / GOAL) * 100))}% of 3h goal
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
                      <div style={{ ...s.tagDot, background: TAG_COLORS[tag] || '#555' }} />
                      <span style={s.tagName}>{tag}</span>
                    </div>
                    <div style={s.tagBarWrap}>
                      <div style={{
                        ...s.tagBarFill,
                        width: `${Math.round((min / maxMin) * 100)}%`,
                        background: TAG_COLORS[tag] || '#555',
                        opacity: 0.4,
                      }} />
                    </div>
                    <span style={s.tagMin}>{fmtDur(min)}</span>
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
  const done = BLOCK_WINDOWS.map((block) => {
    if (!entries?.length) return false;
    const covered = entries.reduce((acc, e) => {
      const startMin = timeToLocalMin(e.started_at);
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
    const lines = [
      `Chronicle — week summary`,
      `streak: ${streak?.streak ?? 0}d | best: ${streak?.longest_streak ?? 0}d`,
      '',
    ];
    weekData.forEach((day) => {
      const label = day.date === todayStr() ? 'today' : formatDate(day.date);
      const study = fmtDur(day.tags.study || 0);
      const parts = Object.entries(day.tags)
        .filter(([t]) => t !== 'study')
        .map(([t, m]) => `${t}:${fmtDur(m)}`).join(' ');
      lines.push(`${label}: ${study} study  ${parts}`);
    });
    lines.push('');
    const total = weekData.reduce((s, d) => s + (d.tags.study || 0), 0);
    lines.push(`week study total: ${fmtDur(total)}`);
    return lines.join('\n');
  }

  return (
    <button style={s.exportBtn} onClick={() => navigator.clipboard.writeText(generate()).catch(() => {})}>
      copy week summary
    </button>
  );
}

function buildWeekData(from, to, entries, tzOffsetMinutes) {
  const days = [];
  const cursor = new Date(from + 'T12:00:00Z');
  const end = new Date(to + 'T12:00:00Z');
  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const tagsByDate = {};
  const studyEntriesByDate = {};
  for (const entry of entries) {
    const localDate = utcToLocalDate(entry.started_at, tzOffsetMinutes);
    if (!tagsByDate[localDate]) tagsByDate[localDate] = {};
    tagsByDate[localDate][entry.tag] = (tagsByDate[localDate][entry.tag] || 0) + entry.duration_minutes;
    if (entry.tag === 'study') {
      if (!studyEntriesByDate[localDate]) studyEntriesByDate[localDate] = [];
      studyEntriesByDate[localDate].push(entry);
    }
  }

  return days.map((date) => ({
    date,
    tags: tagsByDate[date] || {},
    studyEntries: studyEntriesByDate[date] || [],
  }));
}

function utcToLocalDate(isoString, tzOffsetMinutes) {
  return new Date(new Date(isoString).getTime() + tzOffsetMinutes * 60000)
    .toISOString().slice(0, 10);
}

function timeToLocalMin(isoString) {
  const d = new Date(isoString);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.getUTCHours() * 60 + local.getUTCMinutes();
}

function todayStr() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function weekRange() {
  const today = new Date(todayStr() + 'T12:00:00Z');
  const day = today.getUTCDay();
  const monday = new Date(today);
  monday.setUTCDate(today.getUTCDate() - ((day + 6) % 7));
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return { from: monday.toISOString().slice(0, 10), to: sunday.toISOString().slice(0, 10) };
}

function dayLabel(dateStr) {
  return new Date(dateStr + 'T12:00:00Z').toLocaleDateString([], { weekday: 'short' }).slice(0, 2);
}

function formatDate(str) {
  return new Date(str + 'T12:00:00Z').toLocaleDateString([], {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

function fmtDur(min) {
  if (!min) return '0m';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

const s = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: '14px' },
  loading: { fontSize: '13px', color: '#555', textAlign: 'center', padding: '32px 0' },
  streakRow: {
    display: 'flex', alignItems: 'center',
    background: '#111', border: '1px solid #1e1e1a', borderRadius: '10px', overflow: 'hidden',
  },
  streakItem: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', padding: '12px 4px', gap: '2px',
  },
  streakNum: { fontSize: '18px', fontWeight: '700', color: '#e8e8e0', lineHeight: 1 },
  streakLabel: { fontSize: '9px', color: '#444', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' },
  streakDivider: { width: '1px', background: '#1e1e1a', height: '40px' },
  barsWrap: {
    display: 'flex', gap: '5px', alignItems: 'flex-end',
    padding: '12px 14px', background: '#111',
    border: '1px solid #1e1e1a', borderRadius: '10px', height: '100px',
  },
  barCol: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '5px', height: '100%', cursor: 'pointer',
  },
  barTrack: {
    flex: 1, width: '100%', background: '#1a1a16',
    borderRadius: '3px', overflow: 'hidden', position: 'relative',
    display: 'flex', alignItems: 'flex-end',
  },
  barFill: { width: '100%', borderRadius: '3px', transition: 'height 0.4s ease' },
  goalDot: {
    position: 'absolute', top: '3px', left: '50%', transform: 'translateX(-50%)',
    width: '4px', height: '4px', borderRadius: '50%', background: '#22c55e',
  },
  barDay: { fontSize: '10px', letterSpacing: '0.02em' },
  detail: {
    display: 'flex', flexDirection: 'column', gap: '10px',
    padding: '14px', background: '#111',
    border: '1px solid #1e1e1a', borderRadius: '10px',
  },
  detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  detailDate: { fontSize: '14px', fontWeight: '700', color: '#e8e8e0' },
  detailStudy: { fontSize: '13px', fontWeight: '600' },
  dayProgressWrap: { display: 'flex', flexDirection: 'column', gap: '3px' },
  dayProgressTrack: { height: '3px', background: '#1a1a16', borderRadius: '2px', overflow: 'hidden' },
  dayProgressFill: { height: '100%', borderRadius: '2px', transition: 'width 0.4s ease' },
  dayProgressLabel: { fontSize: '10px', color: '#444', fontWeight: '600' },
  tagBreakdown: { display: 'flex', flexDirection: 'column', gap: '6px' },
  tagRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  tagRowLeft: { display: 'flex', alignItems: 'center', gap: '6px', minWidth: '70px' },
  tagDot: { width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0 },
  tagName: { fontSize: '12px', color: '#666', fontWeight: '600' },
  tagBarWrap: {
    flex: 1, height: '7px', background: '#1a1a16',
    borderRadius: '3px', overflow: 'hidden', position: 'relative',
  },
  tagBarFill: {
    position: 'absolute', top: 0, left: 0,
    height: '100%', borderRadius: '3px', transition: 'width 0.4s ease',
  },
  tagMin: { fontSize: '11px', color: '#666', fontWeight: '600', minWidth: '36px', textAlign: 'right' },
  noData: { fontSize: '12px', color: '#444', padding: '4px 0' },
  blocks: { display: 'flex', gap: '6px' },
  blockPill: {
    flex: 1, textAlign: 'center', padding: '5px 0',
    fontSize: '11px', fontWeight: '700', borderRadius: '5px',
  },
  blockDone: { background: '#052e16', color: '#22c55e', border: '1px solid #166534' },
  blockMiss: { background: '#1a1a16', color: '#333', border: '1px solid #222' },
  exportBtn: {
    background: '#111', border: '1px solid #1e1e1a', color: '#555',
    padding: '11px', fontSize: '13px', fontWeight: '600',
    fontFamily: "'Cairo', sans-serif", cursor: 'pointer', borderRadius: '10px', textAlign: 'center',
  },
};
