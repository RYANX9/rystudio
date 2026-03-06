import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const budgets = await sql`SELECT * FROM tag_budgets ORDER BY tag ASC`;
    return NextResponse.json(budgets);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { tag, daily_limit_min } = await request.json();
    if (!tag || !daily_limit_min) {
      return NextResponse.json({ error: 'tag and daily_limit_min required' }, { status: 400 });
    }
    const [budget] = await sql`
      INSERT INTO tag_budgets (tag, daily_limit_min)
      VALUES (${tag}, ${daily_limit_min})
      ON CONFLICT (tag) DO UPDATE SET daily_limit_min = ${daily_limit_min}
      RETURNING *
    `;
    return NextResponse.json(budget);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
