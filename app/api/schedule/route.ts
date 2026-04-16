import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const duties = db.prepare('SELECT * FROM duties').all();
    return NextResponse.json(duties);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch duties' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, field, value } = body;

    const allowedFields = [
      'nr', 'time', 'zielony', 'fiolet', 'poma', 'undrg', 
      'zolty', 'czerw', 'nieb', 'parter', 'sg', 'obiad'
    ];

    if (!allowedFields.includes(field)) {
      return NextResponse.json({ error: 'Invalid field' }, { status: 400 });
    }

    const statement = db.prepare(`UPDATE duties SET ${field} = ? WHERE id = ?`);
    statement.run(value, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update duty' }, { status: 500 });
  }
}
