import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const sessions = await sql`
      SELECT * FROM locked_sessions
      ORDER BY started_at DESC
      LIMIT 1
    `;
    return NextResponse.json(sessions[0] || null);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { activity, tag, started_at, note } = await request.json();

    if (!activity) {
      return NextResponse.json({ error: 'activity required' }, { status: 400 });
    }

    // Clear any existing unlocked session first
    await sql`DELETE FROM locked_sessions`;

    const [session] = await sql`
      INSERT INTO locked_sessions (activity, tag, started_at, note)
      VALUES (
        ${activity},
        ${tag || 'study'},
        ${started_at || new Date().toISOString()},
        ${note || null}
      )
      RETURNING *
    `;
    return NextResponse.json(session, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await sql`DELETE FROM locked_sessions`;
    return NextResponse.json({ cleared: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
