import { NextResponse } from 'next/server';
import sql from '@/lib/db';

const DEFAULTS = {
  study:   180,
  Wasting: 30,
  prayer:  60,
  food:    60,
  sleep:   480,
  other:   120,
};

export async function GET() {
  try {
    const rows = await sql`SELECT * FROM tag_budgets ORDER BY tag`;
    if (rows.length === 0) {
      const defaults = Object.entries(DEFAULTS).map(([tag, daily_minutes]) => ({ tag, daily_minutes }));
      return NextResponse.json(defaults);
    }
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { tag, daily_minutes } = await request.json();
    if (!tag || !daily_minutes) {
      return NextResponse.json({ error: 'tag and daily_minutes required' }, { status: 400 });
    }
    const [row] = await sql`
      INSERT INTO tag_budgets (tag, daily_minutes)
      VALUES (${tag}, ${daily_minutes})
      ON CONFLICT (tag) DO UPDATE SET daily_minutes = EXCLUDED.daily_minutes
      RETURNING *
    `;
    return NextResponse.json(row);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
