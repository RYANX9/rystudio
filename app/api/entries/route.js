import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const tz = parseInt(searchParams.get('tz') || '0', 10); // minutes east of UTC

  try {
    let entries;
    if (date) {
      const sign = tz >= 0 ? '+' : '-';
      const absH = Math.floor(Math.abs(tz) / 60);
      const absM = Math.abs(tz) % 60;
      const interval = `${sign}${String(absH).padStart(2, '0')}:${String(absM).padStart(2, '0')}`;

      entries = await sql`
        SELECT * FROM entries
        WHERE DATE(started_at AT TIME ZONE ${interval}) = ${date}
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
