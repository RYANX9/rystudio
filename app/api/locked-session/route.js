import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const [session] = await sql`
      SELECT * FROM locked_sessions ORDER BY started_at DESC LIMIT 1
    `;
    return NextResponse.json(session || null);
  } catch {
    return NextResponse.json(null);
  }
}

export async function POST(request) {
  try {
    const { activity, tag, started_at } = await request.json();
    await sql`DELETE FROM locked_sessions`;
    const [session] = await sql`
      INSERT INTO locked_sessions (activity, tag, started_at)
      VALUES (${activity}, ${tag}, ${started_at})
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
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
