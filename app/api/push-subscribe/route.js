import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(request) {
  try {
    const subscription = await request.json();

    await sql`
      INSERT INTO push_subscriptions (subscription)
      VALUES (${JSON.stringify(subscription)})
      ON CONFLICT DO NOTHING
    `;

    return NextResponse.json({ subscribed: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
