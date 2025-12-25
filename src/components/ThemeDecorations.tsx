'use client'

import NewYearDecorations from './NewYearDecorations'

interface ThemeDecorationsProps {
  isAccumulating?: boolean
}

export default function ThemeDecorations({ isAccumulating = false }: ThemeDecorationsProps) {
  return <NewYearDecorations />
}
