import './globals.css'
import type { Metadata } from 'next'
import { DM_Sans, DM_Mono } from 'next/font/google'

const dmSans = DM_Sans({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-dm-mono',
})

export const metadata: Metadata = {
  title: 'Plan Dyżurów',
  description: 'System zarządzania planem dyżurów szkolnych',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <body className={`${dmSans.variable} ${dmMono.variable}`}>{children}</body>
    </html>
  )
}
