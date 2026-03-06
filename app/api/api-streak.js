import { NextResponse } from 'next/server';
import sql from '@/lib/db';

const GOAL = 180;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tz   = parseInt(searchParams.get('tz') || '0', 10);
  const tzH  = tz / 60.0;

  try {
    const rows = await sql`
      SELECT
        DATE(started_at + make_interval(hours => ${tzH})) AS date,
        SUM(duration_minutes)::int AS study_minutes
      FROM entries
      WHERE tag = 'study'
        AND started_at >= NOW() - INTERVAL '180 days'
      GROUP BY 1
      ORDER BY 1 DESC
    `;

    const today = localDate(new Date(), tz);
    const byDate = {};
    rows.forEach(r => { byDate[String(r.date).slice(0,10)] = r.study_minutes; });

    const todayMin = byDate[today] || 0;

    // current streak
    let streak = 0;
    const cur = new Date(today + 'T12:00:00Z');
    if (todayMin < GOAL) cur.setUTCDate(cur.getUTCDate() - 1);
    for (let i = 0; i < 180; i++) {
      const d = cur.toISOString().slice(0, 10);
      if ((byDate[d] || 0) >= GOAL) { streak++; cur.setUTCDate(cur.getUTCDate() - 1); }
      else break;
    }

    // longest streak
    const sorted = Object.keys(byDate).sort();
    let longest = 0, temp = 0;
    sorted.forEach(d => {
      if ((byDate[d] || 0) >= GOAL) { temp++; if (temp > longest) longest = temp; }
      else temp = 0;
    });

    return NextResponse.json({
      streak,
      longest_streak: longest,
      today_minutes: todayMin,
      goal: GOAL,
      total_goal_days: Object.values(byDate).filter(m => m >= GOAL).length,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function localDate(date, tzMin) {
  return new Date(date.getTime() + tzMin * 60000).toISOString().slice(0, 10);
}
