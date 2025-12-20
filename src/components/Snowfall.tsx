'use client'

import { useEffect, useState, useCallback } from 'react'

interface Snowflake {
  id: number
  x: number
  size: number
  duration: number
  delay: number
  opacity: number
}

interface AccumulatedSnow {
  id: number
  x: number
  size: number
  bottom: number
}

interface SnowfallProps {
  isAccumulating?: boolean // 開発中かどうか（雪が積もるかどうか）
}

export default function Snowfall({ isAccumulating = false }: SnowfallProps) {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([])
  const [accumulatedSnow, setAccumulatedSnow] = useState<AccumulatedSnow[]>([])
  const [snowLevel, setSnowLevel] = useState(0) // 積もった雪の高さ（vh単位）

  // 初期の雪片を生成
  useEffect(() => {
    const flakes: Snowflake[] = []
    for (let i = 0; i < 50; i++) {
      flakes.push({
        id: i,
        x: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 10,
        opacity: Math.random() * 0.5 + 0.5,
      })
    }
    setSnowflakes(flakes)
  }, [])

  // 雪が積もる効果（開発中のみ）
  useEffect(() => {
    if (!isAccumulating) {
      // 開発終了時は雪を徐々に消す
      const timer = setInterval(() => {
        setSnowLevel(prev => {
          if (prev <= 0) {
            clearInterval(timer)
            return 0
          }
          return prev - 0.5
        })
        setAccumulatedSnow(prev => prev.slice(0, -5))
      }, 100)
      return () => clearInterval(timer)
    }

    // 開発中は雪が積もる
    const interval = setInterval(() => {
      // 積もった雪を追加
      const newSnow: AccumulatedSnow = {
        id: Date.now() + Math.random(),
        x: Math.random() * 100,
        size: Math.random() * 8 + 4,
        bottom: snowLevel,
      }
      setAccumulatedSnow(prev => [...prev.slice(-200), newSnow]) // 最大200個まで

      // 雪の高さを徐々に上げる（最大20vh）
      setSnowLevel(prev => Math.min(prev + 0.05, 20))
    }, 200)

    return () => clearInterval(interval)
  }, [isAccumulating, snowLevel])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* 降る雪 */}
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${flake.x}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            animation: `snowfall ${flake.duration}s linear ${flake.delay}s infinite`,
          }}
        />
      ))}

      {/* 積もった雪のベース層 */}
      {snowLevel > 0 && (
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/90 to-white/30 transition-all duration-500"
          style={{
            height: `${snowLevel}vh`,
          }}
        />
      )}

      {/* 積もった雪の粒 */}
      {accumulatedSnow.map((snow) => (
        <div
          key={snow.id}
          className="absolute rounded-full bg-white animate-snow-accumulate"
          style={{
            left: `${snow.x}%`,
            bottom: `${snow.bottom}vh`,
            width: `${snow.size}px`,
            height: `${snow.size}px`,
            opacity: 0.9,
          }}
        />
      ))}

      {/* CSS for snowfall animation */}
      <style jsx global>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-10vh) translateX(0) rotate(0deg);
            opacity: 1;
          }
          25% {
            transform: translateY(22vh) translateX(10px) rotate(90deg);
          }
          50% {
            transform: translateY(45vh) translateX(-5px) rotate(180deg);
          }
          75% {
            transform: translateY(67vh) translateX(15px) rotate(270deg);
          }
          100% {
            transform: translateY(100vh) translateX(0) rotate(360deg);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  )
}
