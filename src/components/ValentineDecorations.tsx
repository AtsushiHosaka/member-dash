'use client'

import { useEffect, useState } from 'react'

// バレンタインらしいアイコン・絵文字
const DECORATIONS = [
  '💝', // ハートリボン
  '🍫', // チョコレート
  '💕', // ダブルハート
  '🎀', // リボン
  '💗', // ピンクハート
  '🤎', // 茶色ハート
  '✨', // キラキラ
  '🌹', // バラ
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

export default function ValentineDecorations() {
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
        size: 18 + Math.random() * 18, // 18-36px
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

      {/* 左上のチョコ */}
      <div className="absolute top-20 left-4 text-5xl opacity-30 animate-sway">
        🍫
      </div>

      {/* 右上のハート */}
      <div className="absolute top-20 right-4 text-5xl opacity-30 animate-sway" style={{ animationDelay: '1s' }}>
        💝
      </div>

      {/* チョコレート色のグラデーションオーバーレイ（上部） */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(138, 0, 0, 0.08) 0%, transparent 100%)',
        }}
      />

      {/* ミルクチョコ色のグラデーション（下部） */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(212, 165, 116, 0.1) 0%, transparent 100%)',
        }}
      />
    </div>
  )
}
