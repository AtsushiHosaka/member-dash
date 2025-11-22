'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, Users, School, Award, UserCircle, Settings, MessageCircle, Vote } from 'lucide-react'
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
}

export default function Header({ userName, userId, isAdmin, isMentor, gachaTickets }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

  const menuItems = [
    ...(isAdmin
      ? [
          { label: 'ユーザー管理', icon: Users, path: '/admin/users' },
          { label: 'スクール管理', icon: School, path: '/admin/schools' },
          { label: 'バッジ管理', icon: Award, path: '/admin/badges' },
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

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition"
          >
            Dash β
          </button>
        </div>

        {/* Desktop: User name and hamburger menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleUserNameClick}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <UserCircle className="w-4 h-4" />
            {userName}
          </button>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle className="text-left">メニュー</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-1">
                {/* User Info - clickable */}
                <button
                  onClick={handleUserNameClick}
                  className="w-full px-3 py-4 bg-gray-50 rounded-lg mb-4 hover:bg-gray-100 transition text-left"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <UserCircle className="w-4 h-4" />
                    ログイン中
                  </div>
                  <div className="font-semibold text-gray-800">{userName}</div>
                </button>

                {/* Menu Items */}
                {menuItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}

                {/* Divider */}
                <div className="border-t border-gray-200 my-3"></div>

                {/* 命名投票設定（管理者・メンターのみ） */}
                {(isAdmin || isMentor) && (
                  <button
                    onClick={() => handleNavigation('/naming-poll-settings')}
                    className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
                  >
                    <Vote className="w-5 h-5" />
                    命名投票設定
                  </button>
                )}

                {/* お問い合わせフォーム */}
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfFklaMUPlK98-JfHPVJW23MDKkjSE-5OHbllkidx4K6ZRSmg/viewform?usp=header"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
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
