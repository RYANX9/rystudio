import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const notes = await sql`
      SELECT * FROM now_notes ORDER BY created_at DESC
    `;
    return NextResponse.json(notes);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { body, local_date, local_time } = await request.json();
    if (!body?.trim()) {
      return NextResponse.json({ error: 'body required' }, { status: 400 });
    }
    const [note] = await sql`
      INSERT INTO now_notes (body, local_date, local_time)
      VALUES (${body.trim()}, ${local_date}, ${local_time})
      RETURNING *
    `;
    return NextResponse.json(note, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
