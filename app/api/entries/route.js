import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const tz = parseInt(searchParams.get('tz') || '0', 10);
  const tzHours = tz / 60.0;

  try {
    let entries;
    if (date) {
      entries = await sql`
        SELECT * FROM entries
        WHERE DATE(started_at + make_interval(hours => ${tzHours})) = ${date}::date
        ORDER BY started_at ASC
      `;
    } else {
      entries = await sql`
        SELECT * FROM entries
        ORDER BY started_at DESC
        LIMIT 50
      `;
    }
    return NextResponse.json(entries);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { activity, tag, started_at, duration_minutes } = await request.json();

    if (!activity || !started_at || !duration_minutes) {
      return NextResponse.json(
        { error: 'activity, started_at, duration_minutes are required' },
        { status: 400 }
      );
    }

    const start = new Date(started_at);
    const end = new Date(start.getTime() + duration_minutes * 60000);

    // Check if entry crosses local midnight
    // We detect this by checking if start and end are on different UTC dates
    // adjusted by tz offset — but since Algeria = UTC+1 and server = UTC+1,
    // we can just check the raw UTC date boundary at 23:00 UTC (= midnight local)
    const startUTCHour = start.getUTCHours();
    const endUTCHour = end.getUTCHours();
    const startUTCDay = Math.floor(start.getTime() / 86400000);
    const endUTCDay = Math.floor(end.getTime() / 86400000);

    const crossesMidnight = endUTCDay > startUTCDay;

    let inserted;

    if (crossesMidnight) {
      // Split at UTC midnight (= local midnight for UTC+1 offset of 1h... actually
      // local midnight = 23:00 UTC. We split at the actual local midnight.)
      // Local midnight in UTC = 00:00 local - 1h = 23:00 UTC previous day
      // Find the next local midnight after start:
      // local midnight = next day 00:00 local = next day 00:00 - tzOffset
      // Simple approach: find start of next UTC day that corresponds to local midnight
      const tzOffsetMs = 60 * 60000; // UTC+1 = 60 minutes
      const localStart = start.getTime() + tzOffsetMs;
      const localStartDay = Math.floor(localStart / 86400000);
      const nextLocalMidnightLocal = (localStartDay + 1) * 86400000;
      const nextLocalMidnightUTC = nextLocalMidnightLocal - tzOffsetMs;

      const firstDuration = Math.round((nextLocalMidnightUTC - start.getTime()) / 60000);
      const secondDuration = duration_minutes - firstDuration;

      if (firstDuration > 0 && secondDuration > 0) {
        const secondStart = new Date(nextLocalMidnightUTC);

        const [entry1] = await sql`
          INSERT INTO entries (activity, tag, started_at, duration_minutes)
          VALUES (${activity}, ${tag || 'other'}, ${start.toISOString()}, ${firstDuration})
          RETURNING *
        `;
        const [entry2] = await sql`
          INSERT INTO entries (activity, tag, started_at, duration_minutes)
          VALUES (${activity}, ${tag || 'other'}, ${secondStart.toISOString()}, ${secondDuration})
          RETURNING *
        `;
        // Return both — client gets an array, handleEntryAdded needs to handle this
        return NextResponse.json([entry1, entry2], { status: 201 });
      }
    }

    // Normal single entry
    const [entry] = await sql`
      INSERT INTO entries (activity, tag, started_at, duration_minutes)
      VALUES (${activity}, ${tag || 'other'}, ${started_at}, ${duration_minutes})
      RETURNING *
    `;
    return NextResponse.json(entry, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  try {
    await sql`DELETE FROM entries WHERE id = ${id}`;
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
