'use client'

import { useTheme } from '@/contexts/ThemeContext'
import NewYearDecorations from './NewYearDecorations'
import ValentineDecorations from './ValentineDecorations'

interface ThemeDecorationsProps {
  isAccumulating?: boolean
}

export default function ThemeDecorations({ isAccumulating = false }: ThemeDecorationsProps) {
  const { theme } = useTheme()

  if (theme === 'valentine') {
    return <ValentineDecorations />
  }

  if (theme === 'newyear') {
    return <NewYearDecorations />
  }

  // デフォルトは装飾なし
  return null
}
