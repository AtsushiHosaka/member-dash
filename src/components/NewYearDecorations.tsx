'use client'

import { useEffect, useState } from 'react'

// 日本っぽいアイコン・絵文字
const DECORATIONS = [
  '🎍', // 門松
  '🎌', // 日の丸
  '⛩️', // 鳥居
  '🌸', // 桜
  '🏯', // 城
  '🎎', // ひな人形
  '🍡', // 団子
  '🎐', // 風鈴
  '🪭', // 扇子
  '🐉', // 龍（2024年干支）
]

interface Decoration {
  id: number
  emoji: string
  left: number
  top: number
  size: number
  delay: number
  duration: number
}

export default function NewYearDecorations() {
  const [decorations, setDecorations] = useState<Decoration[]>([])

  useEffect(() => {
    // ランダムに装飾を配置
    const items: Decoration[] = []
    const count = 15 // 装飾の数

    for (let i = 0; i < count; i++) {
      items.push({
        id: i,
        emoji: DECORATIONS[Math.floor(Math.random() * DECORATIONS.length)],
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 20 + Math.random() * 20, // 20-40px
        delay: Math.random() * 5,
        duration: 4 + Math.random() * 4, // 4-8秒
      })
    }

    setDecorations(items)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* 装飾アイテム */}
      {decorations.map((item) => (
        <div
          key={item.id}
          className="absolute opacity-20 animate-float"
          style={{
            left: `${item.left}%`,
            top: `${item.top}%`,
            fontSize: `${item.size}px`,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
          }}
        >
          {item.emoji}
        </div>
      ))}

      {/* 左上の門松 */}
      <div className="absolute top-20 left-4 text-5xl opacity-30 animate-sway">
        🎍
      </div>

      {/* 右上の門松 */}
      <div className="absolute top-20 right-4 text-5xl opacity-30 animate-sway" style={{ animationDelay: '1s' }}>
        🎍
      </div>

      {/* 金色のグラデーションオーバーレイ（上部） */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(245, 158, 11, 0.1) 0%, transparent 100%)',
        }}
      />

      {/* 紅白の縁起物パターン（下部） */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(220, 38, 38, 0.05) 0%, transparent 100%)',
        }}
      />
    </div>
  )
}
