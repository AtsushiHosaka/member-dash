'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Header from './Header'
import { useTheme } from '@/contexts/ThemeContext'

export default function GlobalHeader() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const { isValentine, isValentinePeriod } = useTheme()
  const [gachaTickets, setGachaTickets] = useState(0)
  const [valentineHours, setValentineHours] = useState(0)

  // ログインページやレジスタページではヘッダーを表示しない
  const hideHeader = pathname === '/login' || pathname === '/register'

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserTickets()
      if (isValentine) {
        fetchValentineProgress()
      }
    }
  }, [status, isValentine])

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

  const fetchValentineProgress = async () => {
    try {
      const response = await fetch('/api/valentine/progress')
      if (response.ok) {
        const data = await response.json()
        setValentineHours(data.totalHours || 0)
      }
    } catch (error) {
      console.error('Failed to fetch valentine progress:', error)
    }
  }

  if (hideHeader || status === 'loading' || status === 'unauthenticated') {
    return null
  }

  const userName = session?.user?.name || ''
  const userId = (session?.user as any)?.id || ''
  const userRole = (session?.user as any)?.role || 'member'
  const isAdmin = userRole === 'admin'
  const isMentor = userRole === 'mentor'

  return (
    <Header
      userName={userName}
      userId={userId}
      isAdmin={isAdmin}
      isMentor={isMentor}
      gachaTickets={gachaTickets}
      isValentine={isValentine}
      valentineHours={valentineHours}
    />
  )
}
