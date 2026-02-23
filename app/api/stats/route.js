import { NextResponse } from 'next/server';
import sql from '@/lib/db';

// GET /api/stats?from=YYYY-MM-DD&to=YYYY-MM-DD&tz=60
// Returns array of { date, tag, total_minutes } rows
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const tz = parseInt(searchParams.get('tz') || '0', 10);

  if (!from || !to) {
    return NextResponse.json({ error: 'from and to required' }, { status: 400 });
  }

  const sign = tz >= 0 ? '+' : '-';
  const absH = Math.floor(Math.abs(tz) / 60);
  const absM = Math.abs(tz) % 60;
  const interval = `${sign}${String(absH).padStart(2, '0')}:${String(absM).padStart(2, '0')}`;

  try {
    const rows = await sql`
      SELECT
        DATE(started_at AT TIME ZONE ${interval}) AS date,
        tag,
        SUM(duration_minutes)::int AS total_minutes
      FROM entries
      WHERE DATE(started_at AT TIME ZONE ${interval}) BETWEEN ${from} AND ${to}
      GROUP BY DATE(started_at AT TIME ZONE ${interval}), tag
      ORDER BY date ASC, tag ASC
    `;
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
