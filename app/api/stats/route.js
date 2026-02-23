import { NextResponse } from 'next/server';
import sql from '@/lib/db';

// GET /api/stats?from=YYYY-MM-DD&to=YYYY-MM-DD&tz=60
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const tz = parseInt(searchParams.get('tz') || '0', 10); // minutes east of UTC

  if (!from || !to) {
    return NextResponse.json({ error: 'from and to required' }, { status: 400 });
  }

  try {
    // Add tz offset as interval to shift UTC timestamps into local time before DATE()
    const rows = await sql`
      SELECT
        DATE(started_at + (${tz} || ' minutes')::interval) AS date,
        tag,
        SUM(duration_minutes)::int AS total_minutes
      FROM entries
      WHERE DATE(started_at + (${tz} || ' minutes')::interval) BETWEEN ${from} AND ${to}
      GROUP BY DATE(started_at + (${tz} || ' minutes')::interval), tag
      ORDER BY date ASC, tag ASC
    `;
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
