import { NextResponse } from 'next/server';
import sql from '@/lib/db';

const GOAL_MINUTES = 360;

// GET /api/streak?tz=60
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tz = parseInt(searchParams.get('tz') || '0', 10);

  try {
    const rows = await sql`
      SELECT
        DATE(started_at + (${tz} || ' minutes')::interval) AS date,
        SUM(duration_minutes)::int AS study_minutes
      FROM entries
      WHERE tag = 'study'
        AND started_at >= NOW() - INTERVAL '60 days'
      GROUP BY DATE(started_at + (${tz} || ' minutes')::interval)
      ORDER BY date DESC
    `;

    const todayStr = localDateStr(new Date(), tz);
    const byDate = Object.fromEntries(
      rows.map((r) => [normalizeDate(r.date), r.study_minutes])
    );

    const todayMinutes = byDate[todayStr] || 0;

    let streak = 0;
    const cursor = new Date(todayStr + 'T12:00:00Z');
    if (todayMinutes < GOAL_MINUTES) cursor.setUTCDate(cursor.getUTCDate() - 1);

    for (let i = 0; i < 60; i++) {
      const d = cursor.toISOString().slice(0, 10);
      if ((byDate[d] || 0) >= GOAL_MINUTES) {
        streak++;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
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
  return new Date(date.getTime() + tzOffsetMinutes * 60000)
    .toISOString().slice(0, 10);
}

function normalizeDate(val) {
  if (!val) return '';
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val).slice(0, 10);
}
