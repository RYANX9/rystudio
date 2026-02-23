import { NextResponse } from 'next/server';
import sql from '@/lib/db';

const GOAL_MINUTES = 360;

// GET /api/streak?tz=60
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tz = parseInt(searchParams.get('tz') || '0', 10);

  const sign = tz >= 0 ? '+' : '-';
  const absH = Math.floor(Math.abs(tz) / 60);
  const absM = Math.abs(tz) % 60;
  const interval = `${sign}${String(absH).padStart(2, '0')}:${String(absM).padStart(2, '0')}`;

  try {
    // get last 60 days of study totals, newest first
    const rows = await sql`
      SELECT
        DATE(started_at AT TIME ZONE ${interval}) AS date,
        SUM(duration_minutes)::int AS study_minutes
      FROM entries
      WHERE tag = 'study'
        AND started_at >= NOW() - INTERVAL '60 days'
      GROUP BY DATE(started_at AT TIME ZONE ${interval})
      ORDER BY date DESC
    `;

    // count consecutive days from today backwards that hit goal
    const today = new Date();
    const todayStr = localDateStr(today, tz);
    const byDate = Object.fromEntries(rows.map((r) => [r.date.toISOString().slice(0, 10), r.study_minutes]));

    let streak = 0;
    let cursor = new Date(todayStr + 'T12:00:00Z');

    // if today hasn't hit goal yet, start checking from yesterday
    const todayMinutes = byDate[todayStr] || 0;
    if (todayMinutes < GOAL_MINUTES) {
      cursor.setDate(cursor.getDate() - 1);
    }

    for (let i = 0; i < 60; i++) {
      const d = cursor.toISOString().slice(0, 10);
      if ((byDate[d] || 0) >= GOAL_MINUTES) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }

    return NextResponse.json({ streak, today_minutes: todayMinutes, goal: GOAL_MINUTES });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function localDateStr(date, tzOffsetMinutes) {
  const local = new Date(date.getTime() + tzOffsetMinutes * 60000);
  return local.toISOString().slice(0, 10);
}
