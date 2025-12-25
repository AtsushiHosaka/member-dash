'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { ThemeType } from '@/lib/theme'

interface ThemeContextType {
  theme: ThemeType
  isNewYear: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'newyear',
  isNewYear: true,
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // ドキュメントにテーマクラスを追加
    document.documentElement.classList.remove('theme-christmas', 'theme-newyear')
    document.documentElement.classList.add('theme-newyear')
  }, [])

  const value: ThemeContextType = {
    theme: 'newyear',
    isNewYear: true,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
