import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM duties ORDER BY id ASC`;
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch duties:', error);
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

    // Postgres update syntax with dynamic field name using string interpolation (safe here due to whitelist)
    const query = `UPDATE duties SET ${field} = $1 WHERE id = $2`;
    await sql.query(query, [value, id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update duty:', error);
    return NextResponse.json({ error: 'Failed to update duty' }, { status: 500 });
  }
}
