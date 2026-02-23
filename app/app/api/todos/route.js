import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 });

  try {
    const todos = await sql`
      SELECT * FROM todos
      WHERE date = ${date}
      ORDER BY position ASC, created_at ASC
    `;
    return NextResponse.json(todos);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { date, text, position } = await request.json();

    if (!date || !text) {
      return NextResponse.json({ error: 'date and text required' }, { status: 400 });
    }

    const [todo] = await sql`
      INSERT INTO todos (date, text, position)
      VALUES (${date}, ${text.trim()}, ${position ?? 0})
      RETURNING *
    `;
    return NextResponse.json(todo, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, done, text } = await request.json();

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    if (done !== undefined) {
      const [todo] = await sql`
        UPDATE todos SET done = ${done} WHERE id = ${id} RETURNING *
      `;
      return NextResponse.json(todo);
    }

    if (text !== undefined) {
      const [todo] = await sql`
        UPDATE todos SET text = ${text.trim()} WHERE id = ${id} RETURNING *
      `;
      return NextResponse.json(todo);
    }

    return NextResponse.json({ error: 'nothing to update' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  try {
    await sql`DELETE FROM todos WHERE id = ${id}`;
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
