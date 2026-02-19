import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { sendPushNotification } from '@/lib/push';

export async function GET() {
  try {
    const reminders = await sql`
      SELECT * FROM reminders
      ORDER BY remind_at ASC
    `;
    return NextResponse.json(reminders);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { label, remind_at } = await request.json();

    if (!label || !remind_at) {
      return NextResponse.json({ error: 'label and remind_at are required' }, { status: 400 });
    }

    const [reminder] = await sql`
      INSERT INTO reminders (label, remind_at)
      VALUES (${label}, ${remind_at})
      RETURNING *
    `;

    return NextResponse.json(reminder, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// mark reminder as sent, or trigger push manually
export async function PATCH(request) {
  try {
    const { id, action } = await request.json();

    if (action === 'send') {
      const subscriptions = await sql`SELECT subscription FROM push_subscriptions`;

      const [reminder] = await sql`SELECT * FROM reminders WHERE id = ${id}`;
      if (!reminder) return NextResponse.json({ error: 'not found' }, { status: 404 });

      await Promise.all(
        subscriptions.map(({ subscription }) =>
          sendPushNotification(subscription, {
            title: 'Reminder',
            body: reminder.label,
            tag: `reminder-${id}`,
          })
        )
      );

      await sql`UPDATE reminders SET sent = true WHERE id = ${id}`;
      return NextResponse.json({ sent: true });
    }

    if (action === 'delete') {
      await sql`DELETE FROM reminders WHERE id = ${id}`;
      return NextResponse.json({ deleted: true });
    }

    return NextResponse.json({ error: 'unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
