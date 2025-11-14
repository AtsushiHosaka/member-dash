'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, Users, School, Award, UserCircle, Ticket } from 'lucide-react'
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
  isAdmin: boolean
  gachaTickets: number
}

export default function Header({ userName, isAdmin, gachaTickets }: HeaderProps) {
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
    { label: 'アカウント設定', icon: UserCircle, path: '/account' },
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
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

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
          >
            <Ticket className="w-4 h-4" />
            ガチャ (実装中...)
          </button>

          {isAdmin && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin/users')}
                className={pathname === '/admin/users' ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : ''}
              >
                <Users className="w-4 h-4 mr-2" />
                ユーザー管理
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin/schools')}
                className={pathname === '/admin/schools' ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : ''}
              >
                <School className="w-4 h-4 mr-2" />
                スクール管理
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin/badges')}
                className={pathname === '/admin/badges' ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : ''}
              >
                <Award className="w-4 h-4 mr-2" />
                バッジ管理
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/account')}
            className={pathname === '/account' ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : ''}
          >
            <UserCircle className="w-4 h-4 mr-2" />
            {userName}
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2">
          <button
            disabled
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
          >
            <Ticket className="w-3.5 h-3.5" />
            実装中
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
                {/* User Info */}
                <div className="px-3 py-4 bg-gray-50 rounded-lg mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <UserCircle className="w-4 h-4" />
                    ログイン中
                  </div>
                  <div className="font-semibold text-gray-800">{userName}</div>
                </div>

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

                <button
                  disabled
                  className="w-full flex items-center justify-between gap-3 px-3 py-3 text-sm font-medium rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <Ticket className="w-5 h-5" />
                    ガチャ
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-500">
                    実装中...
                  </span>
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
