import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const tz = parseInt(searchParams.get('tz') || '0', 10);
  const format = searchParams.get('format') || 'csv';

  if (!from || !to) {
    return NextResponse.json({ error: 'from and to required' }, { status: 400 });
  }

  const tzHours = tz / 60.0;

  try {
    const rows = await sql`
      SELECT
        id,
        activity,
        tag,
        started_at,
        duration_minutes,
        DATE(started_at + make_interval(hours => ${tzHours})) AS local_date,
        (started_at + make_interval(hours => ${tzHours}))::time AS local_time
      FROM entries
      WHERE DATE(started_at + make_interval(hours => ${tzHours})) BETWEEN ${from}::date AND ${to}::date
      ORDER BY started_at ASC
    `;

    if (format === 'json') {
      return NextResponse.json(rows);
    }

    const header = 'id,date,time,activity,tag,duration_minutes\n';
    const body = rows.map((r) => {
      const date = String(r.local_date).slice(0, 10);
      const time = String(r.local_time).slice(0, 5);
      const activity = `"${r.activity.replace(/"/g, '""')}"`;
      return `${r.id},${date},${time},${activity},${r.tag},${r.duration_minutes}`;
    }).join('\n');

    return new NextResponse(header + body, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="tracker-${from}-${to}.csv"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
