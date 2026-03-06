import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const from   = searchParams.get('from');
  const to     = searchParams.get('to');
  const tz     = parseInt(searchParams.get('tz') || '0', 10);
  const format = searchParams.get('format') || 'csv';
  const tzH    = tz / 60.0;

  if (!from || !to) {
    return NextResponse.json({ error: 'from and to required' }, { status: 400 });
  }

  try {
    const rows = await sql`
      SELECT
        id,
        activity,
        tag,
        started_at,
        duration_minutes,
        DATE(started_at + make_interval(hours => ${tzH})) AS local_date,
        TO_CHAR(started_at + make_interval(hours => ${tzH}), 'HH24:MI') AS local_time
      FROM entries
      WHERE DATE(started_at + make_interval(hours => ${tzH})) BETWEEN ${from}::date AND ${to}::date
      ORDER BY started_at ASC
    `;

    if (format === 'csv') {
      const header = 'id,date,time,activity,tag,duration_minutes\n';
      const body   = rows.map(r =>
        `${r.id},${r.local_date},${r.local_time},"${r.activity.replace(/"/g, '""')}",${r.tag},${r.duration_minutes}`
      ).join('\n');
      return new Response(header + body, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="chronicle-${from}-${to}.csv"`,
        },
      });
    }

    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
