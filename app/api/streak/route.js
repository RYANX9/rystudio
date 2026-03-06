import { NextResponse } from 'next/server';
import sql from '@/lib/db';

const GOAL_MINUTES = 180;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tz = parseInt(searchParams.get('tz') || '0', 10);
  const tzHours = tz / 60.0;

  try {
    const rows = await sql`
      SELECT
        DATE(started_at + make_interval(hours => ${tzHours})) AS date,
        SUM(duration_minutes)::int AS study_minutes
      FROM entries
      WHERE tag = 'study'
        AND started_at >= NOW() - INTERVAL '180 days'
      GROUP BY DATE(started_at + make_interval(hours => ${tzHours}))
      ORDER BY date DESC
    `;

    const todayStr = localDateStr(new Date(), tz);
    const byDate = Object.fromEntries(
      rows.map((r) => [normalizeDate(r.date), r.study_minutes])
    );

    const todayMinutes = byDate[todayStr] || 0;

    // current streak
    let streak = 0;
    const cursor = new Date(todayStr + 'T12:00:00Z');
    if (todayMinutes < GOAL_MINUTES) cursor.setUTCDate(cursor.getUTCDate() - 1);
    for (let i = 0; i < 180; i++) {
      const d = cursor.toISOString().slice(0, 10);
      if ((byDate[d] || 0) >= GOAL_MINUTES) {
        streak++;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      } else break;
    }

    // longest streak
    const sorted = Object.keys(byDate).sort();
    let longest = 0, temp = 0;
    for (const d of sorted) {
      if ((byDate[d] || 0) >= GOAL_MINUTES) { temp++; if (temp > longest) longest = temp; }
      else temp = 0;
    }

    const totalGoalDays = Object.values(byDate).filter((m) => m >= GOAL_MINUTES).length;

    return NextResponse.json({
      streak,
      longest_streak: longest,
      total_goal_days: totalGoalDays,
      today_minutes: todayMinutes,
      goal: GOAL_MINUTES,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function localDateStr(date, tzOffsetMinutes) {
  return new Date(date.getTime() + tzOffsetMinutes * 60000).toISOString().slice(0, 10);
}

function normalizeDate(val) {
  if (!val) return '';
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val).slice(0, 10);
}
