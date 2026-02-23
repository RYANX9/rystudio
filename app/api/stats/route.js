import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const tz = parseInt(searchParams.get('tz') || '0', 10);

  if (!from || !to) {
    return NextResponse.json({ error: 'from and to required' }, { status: 400 });
  }

  // Convert tz offset minutes to fractional hours for multiplication
  const tzHours = tz / 60.0;

  try {
    const rows = await sql`
      SELECT
        DATE(started_at + make_interval(hours => ${tzHours})) AS date,
        tag,
        SUM(duration_minutes)::int AS total_minutes
      FROM entries
      WHERE DATE(started_at + make_interval(hours => ${tzHours})) BETWEEN ${from}::date AND ${to}::date
      GROUP BY DATE(started_at + make_interval(hours => ${tzHours})), tag
      ORDER BY date ASC, tag ASC
    `;
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
