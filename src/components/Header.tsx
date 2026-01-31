'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { Menu, X, Users, School, Award, UserCircle, Settings, MessageCircle, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface HeaderProps {
  userName: string
  userId: string
  isAdmin: boolean
  isMentor: boolean
  gachaTickets: number
  isValentine?: boolean
  valentineHours?: number
}

export default function Header({ userName, userId, isAdmin, isMentor, gachaTickets, isValentine = false, valentineHours = 0 }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

  const menuItems = [
    { label: 'ガチャ', icon: Ticket, path: '/gacha' },
    ...(isAdmin
      ? [
          { label: 'ユーザー管理', icon: Users, path: '/admin/users' },
          { label: 'スクール管理', icon: School, path: '/admin/schools' },
        ]
      : []),
    ...(isAdmin || isMentor
      ? [
          { label: 'バッジリスト', icon: Award, path: '/badges' },
        ]
      : []),
    { label: '設定', icon: Settings, path: '/settings' },
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
    closeMenu()
  }

  const handleUserNameClick = () => {
    router.push(`/users/${userId}`)
    closeMenu()
  }

  // テーマに応じたスタイル
  const headerBg = isValentine ? 'bg-[#8A0000]' : 'bg-red-600'
  const headerBorder = isValentine ? 'border-[#3B060A]' : 'border-red-700'
  const hoverBg = isValentine ? 'hover:bg-[#6A0000]' : 'hover:bg-red-700'
  const themeEmoji = isValentine ? '🍫' : '🎍'

  return (
    <header className={`shadow-lg border-b sticky top-0 z-50 ${headerBg} ${headerBorder}`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo and Valentine Bonus */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <Image
              src="/favicon.png"
              alt="Hash Logo"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
            <span className="text-2xl font-bold text-white">Hash</span>
            <span className={`text-sm ml-1 ${isValentine ? 'text-[#D4A574]' : 'text-amber-300'}`}>{themeEmoji}</span>
          </button>

          {/* Valentine Bonus Display */}
          {isValentine && (
            <button
              onClick={() => router.push('/valentine')}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#3B060A] rounded-lg hover:bg-[#5A0A10] transition ml-2"
            >
              <span className="text-[#D4A574]">🍫</span>
              <span className="text-[#D4A574] text-sm font-medium">
                {valentineHours.toFixed(1)}h
              </span>
            </button>
          )}
        </div>

        {/* Desktop: User name and hamburger menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleUserNameClick}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-white rounded-lg transition ${hoverBg}`}
          >
            <UserCircle className="w-4 h-4" />
            {userName}
          </button>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`p-2 text-white hover:text-white ${hoverBg}`}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className={`w-[280px] sm:w-[350px] ${headerBg} ${headerBorder}`}
            >
              <SheetHeader>
                <SheetTitle className="text-left text-white">
                  {themeEmoji} メニュー
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-1">
                {/* User Info - clickable */}
                <button
                  onClick={handleUserNameClick}
                  className={`w-full px-3 py-4 rounded-lg mb-4 transition text-left ${isValentine ? 'bg-[#D4A574]/20 hover:bg-[#D4A574]/30' : 'bg-amber-500/20 hover:bg-amber-500/30'}`}
                >
                  <div className="flex items-center gap-2 text-sm text-white/80 mb-1">
                    <UserCircle className="w-4 h-4" />
                    ログイン中
                  </div>
                  <div className="font-semibold text-white">{userName}</div>
                </button>

                {/* Menu Items */}
                {menuItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-white rounded-lg transition ${hoverBg}`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}

                {/* Divider */}
                <div className={`border-t my-3 ${isValentine ? 'border-[#D4A574]/30' : 'border-amber-500/30'}`}></div>

                {/* お問い合わせフォーム */}
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfFklaMUPlK98-JfHPVJW23MDKkjSE-5OHbllkidx4K6ZRSmg/viewform?usp=header"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-white rounded-lg transition ${hoverBg}`}
                >
                  <MessageCircle className="w-5 h-5" />
                  お問い合わせ
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
