import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Masthead } from '@/components/masthead'
import { TemaVerskaffer } from '@/components/tema-verskaffer'
import { Voetskrif } from '@/components/voetskrif'
import { OORSPRONG } from '@/lib/konfig'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(OORSPRONG),
  title: {
    default: 'Die Transvaler — fopnuus wat jy kan vertrou',
    template: '%s | Die Transvaler',
  },
  description: 'Afrikaanse satiriese nuus. Alles hierin is versin.',
  openGraph: {
    siteName: 'Die Transvaler — fopnuus wat jy kan vertrou',
  },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="af" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TemaVerskaffer>
          <Masthead />
          <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
          <Voetskrif />
        </TemaVerskaffer>
        <Analytics />
      </body>
    </html>
  )
}
