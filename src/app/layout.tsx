import type { Metadata } from 'next'
import './globals.css'
import SessionProvider from '@/components/SessionProvider'
import GlobalHeader from '@/components/GlobalHeader'
import PageTransition from '@/components/PageTransition'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: "Hash - プログラミング時間管理",
  description: 'プログラミングの開発時間を管理する打刻サービス',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <SessionProvider>
          <GlobalHeader />
          <PageTransition>
            {children}
          </PageTransition>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  )
}
