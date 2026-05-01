import { GET } from '@/app/api/dyzury/route'
import { NextRequest } from 'next/server'

jest.mock('@vercel/postgres', () => ({
  sql: Object.assign(
    jest.fn().mockResolvedValue({
      rows: [
        { id: 1, day: 'poniedzialek', nr: '3', time: '10:00-10:15', zielony: 'Nowak', fiolet: 'Kowalski', poma: '-', undrg: '', zolty: '-', czerw: '', nieb: '', parter: '', sg: '', obiad: '' },
        { id: 2, day: 'wtorek',       nr: '3', time: '10:00-10:15', zielony: 'Wiśniewska', fiolet: 'Nowak', poma: '', undrg: '', zolty: '', czerw: '', nieb: '', parter: '', sg: '', obiad: '' },
      ]
    }),
    { query: jest.fn() }
  )
}))

describe('GET /api/dyzury', () => {
  it('zwraca wszystkie wiersze bez parametrów', async () => {
    const req = new NextRequest('http://localhost/api/dyzury')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveLength(2)
    expect(data[0].mojeStrefy).toEqual([])
  })

  it('zwraca mojeStrefy gdy podano nauczyciela', async () => {
    const req = new NextRequest('http://localhost/api/dyzury?nauczyciel=Nowak')
    const res = await GET(req)
    const data = await res.json()
    const poniedzialek = data.find((r: { day: string }) => r.day === 'poniedzialek')
    expect(poniedzialek.mojeStrefy).toContain('Zielone')
  })
})
