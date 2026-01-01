'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface OmikujiResult {
  type: string
  title: string
  message: string
  color: string
  bgGradient: string
}

const OMIKUJI_RESULTS: OmikujiResult[] = [
  {
    type: 'daidaikichi',
    title: '大大吉',
    message: '全てのエラーが治る！最強の年！',
    color: 'text-yellow-400',
    bgGradient: 'from-yellow-500 via-amber-400 to-yellow-300'
  },
  {
    type: 'daikichi',
    title: '大吉',
    message: 'リリースしたら万バズ確定！',
    color: 'text-red-500',
    bgGradient: 'from-red-500 via-rose-400 to-pink-400'
  },
  {
    type: 'chukichi',
    title: '中吉',
    message: '突然最強のアイデアが降ってくる',
    color: 'text-orange-500',
    bgGradient: 'from-orange-500 via-amber-400 to-yellow-400'
  },
  {
    type: 'shokichi',
    title: '小吉',
    message: '寿司打の点数が100円上がる',
    color: 'text-green-500',
    bgGradient: 'from-green-500 via-emerald-400 to-teal-400'
  },
  {
    type: 'kyo',
    title: '凶',
    message: 'エラーがいつまでも出てくる',
    color: 'text-purple-500',
    bgGradient: 'from-purple-600 via-violet-500 to-purple-400'
  },
  {
    type: 'daikyo',
    title: '大凶',
    message: 'PCが突然のフリーズ！',
    color: 'text-gray-600',
    bgGradient: 'from-gray-700 via-gray-600 to-gray-500'
  }
]

interface OmikujiModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function OmikujiModal({ isOpen, onClose }: OmikujiModalProps) {
  const [phase, setPhase] = useState<'loading' | 'shaking' | 'result'>('loading')
  const [result, setResult] = useState<OmikujiResult | null>(null)

  useEffect(() => {
    if (isOpen) {
      setPhase('loading')
      setResult(null)

      // ローディング後にシェイクアニメーション
      const loadTimer = setTimeout(() => {
        setPhase('shaking')
      }, 1500)

      // シェイク後に結果表示
      const resultTimer = setTimeout(() => {
        // ランダムに結果を選択（重み付け）
        const weights = [5, 15, 25, 30, 20, 5] // 大大吉5%, 大吉15%, 中吉25%, 小吉30%, 凶20%, 大凶5%
        const totalWeight = weights.reduce((a, b) => a + b, 0)
        let random = Math.random() * totalWeight
        let selectedIndex = 0

        for (let i = 0; i < weights.length; i++) {
          random -= weights[i]
          if (random <= 0) {
            selectedIndex = i
            break
          }
        }

        setResult(OMIKUJI_RESULTS[selectedIndex])
        setPhase('result')
      }, 4000)

      return () => {
        clearTimeout(loadTimer)
        clearTimeout(resultTimer)
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="bg-gradient-to-b from-red-50 to-amber-50 rounded-2xl p-6 w-full max-w-md shadow-2xl border-4 border-red-600 relative overflow-hidden"
        >
          {/* 装飾 */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

          {/* ヘッダー */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-4xl mb-2"
            >
              🎍
            </motion.div>
            <h2 className="text-2xl font-bold text-red-700">
              新年おみくじ
            </h2>
            <p className="text-sm text-gray-600 mt-1">2026年の運勢は...？</p>
          </div>

          {/* ローディング・シェイク状態 */}
          {(phase === 'loading' || phase === 'shaking') && (
            <div className="text-center py-8">
              <motion.div
                animate={phase === 'shaking' ? {
                  rotate: [-5, 5, -5, 5, -3, 3, -2, 2, 0],
                  x: [-10, 10, -10, 10, -5, 5, -2, 2, 0]
                } : {}}
                transition={{
                  duration: 2,
                  repeat: phase === 'shaking' ? 1 : 0,
                  ease: 'easeInOut'
                }}
                className="inline-block"
              >
                <Image
                  src="/omikuji.png"
                  alt="おみくじ"
                  width={200}
                  height={200}
                  className="mx-auto"
                  priority
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6"
              >
                {phase === 'loading' ? (
                  <div className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-lg text-gray-600"
                    >
                      おみくじを準備中...
                    </motion.span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="text-lg text-red-600 font-bold"
                    >
                      ガラガラガラ...
                    </motion.span>
                  </div>
                )}
              </motion.div>

              {/* キラキラエフェクト */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: Math.random() * 300 - 150,
                      y: Math.random() * 300 - 150
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.3,
                      repeat: Infinity
                    }}
                    className="absolute top-1/2 left-1/2 text-2xl"
                  >
                    ✨
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* 結果表示 */}
          {phase === 'result' && result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ type: 'spring', damping: 12, duration: 0.8 }}
              className="text-center"
            >
              {/* 結果カード */}
              <motion.div
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', damping: 10 }}
                className={`bg-gradient-to-br ${result.bgGradient} rounded-xl p-8 mb-6 shadow-lg relative overflow-hidden`}
              >
                {/* 背景エフェクト */}
                <div className="absolute inset-0 opacity-20">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: [0.3, 0.8, 0.3],
                        scale: [1, 1.5, 1]
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.15,
                        repeat: Infinity
                      }}
                      className="absolute text-4xl"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`
                      }}
                    >
                      ⭐
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="relative z-10"
                >
                  <div className="text-7xl font-black text-white drop-shadow-lg mb-2" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.3)' }}>
                    {result.title}
                  </div>
                </motion.div>
              </motion.div>

              {/* メッセージ */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl p-4 mb-6 shadow-inner border-2 border-gray-100"
              >
                <p className="text-lg font-medium text-gray-800">
                  {result.message}
                </p>
              </motion.div>

              {/* お正月装飾 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex justify-center gap-4 mb-6 text-3xl"
              >
                <motion.span
                  animate={{ rotate: [-10, 10, -10] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎍
                </motion.span>
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  🎌
                </motion.span>
                <motion.span
                  animate={{ rotate: [10, -10, 10] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ⛩️
                </motion.span>
              </motion.div>

              {/* 閉じるボタン */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold rounded-xl hover:from-red-700 hover:to-amber-600 transition shadow-lg"
              >
                開発を始める！
              </motion.button>
            </motion.div>
          )}

          {/* 装飾：和風模様 */}
          <div className="absolute -top-4 -right-4 text-6xl opacity-20 pointer-events-none">🎌</div>
          <div className="absolute -bottom-4 -left-4 text-6xl opacity-20 pointer-events-none">⛩️</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
