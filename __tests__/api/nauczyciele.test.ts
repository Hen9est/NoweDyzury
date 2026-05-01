import { GET } from '@/app/api/nauczyciele/route'
import { NextRequest } from 'next/server'

jest.mock('@vercel/postgres', () => ({
  sql: Object.assign(
    jest.fn().mockResolvedValue({
      rows: [
        { zielony: 'Nowak', fiolet: 'Kowalski', poma: '-', undrg: '', zolty: 'Nowak', czerw: null, nieb: '-', parter: '', sg: '', obiad: '' },
        { zielony: 'Wiśniewska/Nowak', fiolet: '', poma: 'Kowalski', undrg: '-', zolty: '', czerw: '', nieb: '', parter: '', sg: '', obiad: '' },
      ]
    }),
    { query: jest.fn() }
  )
}))

describe('GET /api/nauczyciele', () => {
  it('zwraca posortowaną listę unikalnych nauczycieli ze wszystkich stref', async () => {
    const req = new NextRequest('http://localhost/api/nauczyciele')
    const res = await GET(req)
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data).toEqual(['Kowalski', 'Nowak', 'Wiśniewska'])
  })

  it('ignoruje wartości - — i puste komórki', async () => {
    const req = new NextRequest('http://localhost/api/nauczyciele')
    const res = await GET(req)
    const data = await res.json()
    expect(data).not.toContain('-')
    expect(data).not.toContain('—')
    expect(data).not.toContain('')
  })
})
