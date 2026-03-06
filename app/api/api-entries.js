import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date  = searchParams.get('date');
  const from  = searchParams.get('from');
  const to    = searchParams.get('to');
  const tz    = parseInt(searchParams.get('tz') || '0', 10);
  const tzH   = tz / 60.0;

  try {
    let rows;
    if (date) {
      rows = await sql`
        SELECT * FROM entries
        WHERE DATE(started_at + make_interval(hours => ${tzH})) = ${date}::date
        ORDER BY started_at ASC
      `;
    } else if (from && to) {
      rows = await sql`
        SELECT * FROM entries
        WHERE DATE(started_at + make_interval(hours => ${tzH})) BETWEEN ${from}::date AND ${to}::date
        ORDER BY started_at ASC
      `;
    } else {
      rows = await sql`SELECT * FROM entries ORDER BY started_at DESC LIMIT 100`;
    }
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { activity, tag, started_at, duration_minutes, tz = 0 } = await request.json();
    if (!activity?.trim() || !tag || !started_at || !duration_minutes) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const start = new Date(started_at);
    const end   = new Date(start.getTime() + duration_minutes * 60000);
    const tzOff = tz * 60000;

    const startLocal = new Date(start.getTime() + tzOff);
    const endLocal   = new Date(end.getTime() + tzOff);

    // midnight split in user's timezone
    if (startLocal.toISOString().slice(0, 10) !== endLocal.toISOString().slice(0, 10)) {
      const midnight = new Date(endLocal.toISOString().slice(0, 10) + 'T00:00:00.000Z');
      const midnightUTC = new Date(midnight.getTime() - tzOff);
      const dur1 = Math.round((midnightUTC - start) / 60000);
      const dur2 = duration_minutes - dur1;
      const results = await Promise.all([
        dur1 > 0 ? sql`INSERT INTO entries (activity,tag,started_at,duration_minutes) VALUES (${activity.trim()},${tag},${start.toISOString()},${dur1}) RETURNING *` : null,
        dur2 > 0 ? sql`INSERT INTO entries (activity,tag,started_at,duration_minutes) VALUES (${activity.trim()},${tag},${midnightUTC.toISOString()},${dur2}) RETURNING *` : null,
      ]);
      return NextResponse.json(results.filter(Boolean).flatMap(r => r));
    }

    const [row] = await sql`
      INSERT INTO entries (activity, tag, started_at, duration_minutes)
      VALUES (${activity.trim()}, ${tag}, ${start.toISOString()}, ${duration_minutes})
      RETURNING *
    `;
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  try {
    await sql`DELETE FROM entries WHERE id = ${parseInt(id)}`;
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
