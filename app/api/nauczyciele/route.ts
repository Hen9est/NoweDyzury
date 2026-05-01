import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

const STREFY = ['zielony', 'fiolet', 'poma', 'undrg', 'zolty', 'czerw', 'nieb', 'parter', 'sg', 'obiad'] as const

export async function GET() {
  const { rows } = await sql`SELECT zielony, fiolet, poma, undrg, zolty, czerw, nieb, parter, sg, obiad FROM duties`

  const names = new Set<string>()
  for (const row of rows) {
    for (const strefa of STREFY) {
      const val = row[strefa] as string | null
      if (!val) continue
      for (const part of val.split('/')) {
        const name = part.trim()
        if (name && name !== '-' && name !== '—') names.add(name)
      }
    }
  }

  return NextResponse.json([...names].sort())
}
