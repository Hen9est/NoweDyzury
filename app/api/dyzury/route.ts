import { sql } from '@vercel/postgres'
import { NextRequest, NextResponse } from 'next/server'

const STREFY_MAP: Record<string, string> = {
  zielony: 'Zielone', fiolet: 'Fioletowe', poma: 'Pomarańczowe',
  undrg: 'Underground', zolty: 'Żółty', czerw: 'Czerwony',
  nieb: 'Niebieski', parter: 'Parter', sg: 'SG', obiad: 'Obiad',
}

function zawieraNauczyciela(val: string | null, nauczyciel: string): boolean {
  if (!val) return false
  return val.split('/').some(p => p.trim().toLowerCase() === nauczyciel.toLowerCase())
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dzien = searchParams.get('dzien')
  const nauczyciel = searchParams.get('nauczyciel')

  const { rows } = dzien
    ? await sql`SELECT * FROM duties WHERE day = ${dzien} ORDER BY time ASC`
    : await sql`SELECT * FROM duties ORDER BY CASE day WHEN 'poniedzialek' THEN 1 WHEN 'wtorek' THEN 2 WHEN 'sroda' THEN 3 WHEN 'czwartek' THEN 4 WHEN 'piatek' THEN 5 END, time ASC`

  const result = rows.map(row => {
    const mojeStrefy: string[] = []
    if (nauczyciel) {
      for (const [key, label] of Object.entries(STREFY_MAP)) {
        if (zawieraNauczyciela(row[key] as string, nauczyciel)) {
          mojeStrefy.push(label)
        }
      }
    }
    return { ...row, mojeStrefy }
  })

  const filtered = nauczyciel
    ? result.filter(r => r.mojeStrefy.length > 0)
    : result

  return NextResponse.json(filtered)
}
