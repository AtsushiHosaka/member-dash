'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Header from './Header'

export default function GlobalHeader() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [gachaTickets, setGachaTickets] = useState(0)

  // ログインページやレジスタページではヘッダーを表示しない
  const hideHeader = pathname === '/login' || pathname === '/register'

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserTickets()
    }
  }, [status])

  const fetchUserTickets = async () => {
    try {
      const response = await fetch('/api/user')
      if (response.ok) {
        const data = await response.json()
        setGachaTickets(data.gachaTickets || 0)
      } else {
        // ユーザーが見つからない場合は0枚として扱う
        setGachaTickets(0)
      }
    } catch (error) {
      console.error('Failed to fetch user tickets:', error)
      setGachaTickets(0)
    }
  }

  if (hideHeader || status === 'loading' || status === 'unauthenticated') {
    return null
  }

  const userName = session?.user?.name || ''
  const isAdmin = (session?.user as any)?.role === 'admin'

  return <Header userName={userName} isAdmin={isAdmin} gachaTickets={gachaTickets} />
}
