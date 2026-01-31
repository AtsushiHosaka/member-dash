'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { ThemeType, getCurrentTheme, isValentinePeriod, isValentineResultPeriod } from '@/lib/theme'

interface ThemeContextType {
  theme: ThemeType
  isNewYear: boolean
  isValentine: boolean
  isValentinePeriod: boolean
  isValentineResultPeriod: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'default',
  isNewYear: false,
  isValentine: false,
  isValentinePeriod: false,
  isValentineResultPeriod: false,
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = getCurrentTheme()
  const valentinePeriod = isValentinePeriod()
  const valentineResultPeriod = isValentineResultPeriod()

  useEffect(() => {
    // ドキュメントにテーマクラスを追加
    document.documentElement.classList.remove('theme-christmas', 'theme-newyear', 'theme-valentine')
    if (theme === 'valentine') {
      document.documentElement.classList.add('theme-valentine')
    } else if (theme === 'newyear') {
      document.documentElement.classList.add('theme-newyear')
    }
  }, [theme])

  const value: ThemeContextType = {
    theme,
    isNewYear: theme === 'newyear',
    isValentine: theme === 'valentine',
    isValentinePeriod: valentinePeriod,
    isValentineResultPeriod: valentineResultPeriod,
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
