import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const tz = parseInt(searchParams.get('tz') || '0', 10); // offset in minutes, e.g. 60 for UTC+1

  try {
    let entries;

    if (from && to) {
      // Fetch all entries whose UTC timestamp falls within a generous window.
      // We add/subtract one day buffer so JS can do exact local-date assignment.
      const fromUTC = new Date(from + 'T00:00:00Z');
      fromUTC.setUTCMinutes(fromUTC.getUTCMinutes() - tz); // shift back by tz to catch local day start
      const toUTC = new Date(to + 'T23:59:59Z');
      toUTC.setUTCMinutes(toUTC.getUTCMinutes() - tz + 1439); // shift forward

      entries = await sql`
        SELECT * FROM entries
        WHERE started_at >= ${fromUTC.toISOString()}
          AND started_at <= ${toUTC.toISOString()}
        ORDER BY started_at ASC
      `;
    } else if (date) {
      // Convert local date boundaries to UTC for the query
      const dayStartLocal = new Date(date + 'T00:00:00Z');
      dayStartLocal.setUTCMinutes(dayStartLocal.getUTCMinutes() - tz);
      const dayEndLocal = new Date(date + 'T23:59:59Z');
      dayEndLocal.setUTCMinutes(dayEndLocal.getUTCMinutes() - tz);

      entries = await sql`
        SELECT * FROM entries
        WHERE started_at >= ${dayStartLocal.toISOString()}
          AND started_at <= ${dayEndLocal.toISOString()}
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

    const startUTCDay = Math.floor(start.getTime() / 86400000);
    const endUTCDay = Math.floor(end.getTime() / 86400000);
    const crossesMidnight = endUTCDay > startUTCDay;

    if (crossesMidnight) {
      const tzOffsetMs = 60 * 60000; // UTC+1 for Algeria
      const localStart = start.getTime() + tzOffsetMs;
      const localStartDay = Math.floor(localStart / 86400000);
      const nextLocalMidnightUTC = (localStartDay + 1) * 86400000 - tzOffsetMs;

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
        return NextResponse.json([entry1, entry2], { status: 201 });
      }
    }

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
