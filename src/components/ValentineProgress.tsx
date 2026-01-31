'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface BadgeInfo {
  id: string
  name: string
  icon: string
}

interface ValentineProgressProps {
  totalHours: number
  chocolateCount: number
  progressStage: string
  isEventPeriod: boolean
  isResultPeriod: boolean
  badges?: {
    chocolate1?: BadgeInfo
    chocolate10?: BadgeInfo
    chocolate20?: BadgeInfo
  }
}

// 進捗ステージの定義
const STAGES = [
  { key: 'none', label: 'チョコを買っている', hours: 0, image: '/valentine/chocolate-buying.png' },
  { key: 'ingredients', label: '素材が揃う', hours: 2, image: '/valentine/chocolate-ingredients.png' },
  { key: 'melting', label: '湯煎する', hours: 4, image: '/valentine/chocolate-melting.png' },
  { key: 'molding', label: '型に流し込む', hours: 6, image: '/valentine/chocolate-mold.png' },
  { key: 'cooling', label: '固める', hours: 8, image: '/valentine/chocolate-cooling.png' },
  { key: 'complete', label: 'チョコ完成！', hours: 10, image: '/valentine/chocolate-complete.png' },
]

export default function ValentineProgress({
  totalHours,
  chocolateCount,
  progressStage,
  isEventPeriod,
  isResultPeriod,
  badges
}: ValentineProgressProps) {
  const currentStageIndex = STAGES.findIndex(s => s.key === progressStage)
  const currentStage = STAGES[currentStageIndex] || STAGES[0]

  return (
    <div className="space-y-8">
      {/* 開発時間表示 */}
      <div className="text-center">
        <div className="text-6xl font-bold text-[#8A0000] mb-2">
          {totalHours.toFixed(1)}
          <span className="text-3xl ml-2">時間</span>
        </div>
        <p className="text-[#3B060A]/70">
          {isEventPeriod ? 'バレンタイン期間中の開発時間' : '最終開発時間'}
        </p>
      </div>

      {/* 進捗バー */}
      <div className="bg-white/80 rounded-xl p-6 shadow-md">
        <div className="flex justify-between mb-4">
          {STAGES.slice(1).map((stage, index) => (
            <div
              key={stage.key}
              className={`text-center flex-1 ${
                currentStageIndex > index ? 'text-[#8A0000]' : 'text-gray-400'
              }`}
            >
              <div className="text-xs mb-1">{stage.hours}h</div>
              <div className="text-xs font-medium truncate px-1">{stage.label}</div>
            </div>
          ))}
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#8A0000] to-[#D4A574]"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((totalHours / 10) * 100, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* 現在のステージ表示 */}
      <div className="bg-white/80 rounded-xl p-8 shadow-md text-center">
        {currentStage.image ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative w-48 h-48 mx-auto mb-4"
          >
            <Image
              src={currentStage.image}
              alt={currentStage.label}
              fill
              className="object-contain"
            />
          </motion.div>
        ) : null}
        <h3 className="text-2xl font-bold text-[#3B060A] mb-2">
          {currentStage.label}
        </h3>
        {progressStage !== 'complete' && (
          <p className="text-[#8A0000]/70">
            次のステージまで: あと {(STAGES[currentStageIndex + 1]?.hours || 10) - totalHours > 0
              ? ((STAGES[currentStageIndex + 1]?.hours || 10) - totalHours).toFixed(1)
              : 0} 時間
          </p>
        )}
      </div>

      {/* 完成チョコ表示 */}
      {chocolateCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#3B060A] to-[#8A0000] rounded-xl p-8 shadow-lg text-center"
        >
          <h3 className="text-xl font-bold text-white mb-4">
            完成したチョコ
          </h3>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {Array.from({ length: Math.min(chocolateCount, 50) }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05, type: 'spring' }}
                className="text-3xl"
              >
                🍫
              </motion.span>
            ))}
            {chocolateCount > 50 && (
              <span className="text-white text-xl self-center">
                +{chocolateCount - 50}
              </span>
            )}
          </div>
          <div className="text-4xl font-bold text-[#D4A574]">
            {chocolateCount} 個
          </div>
          <p className="text-white/70 text-sm mt-2">
            2/14にチョコ数×3のガチャチケットがもらえます！
          </p>
        </motion.div>
      )}

      {/* バッジ獲得条件 */}
      <div className="bg-white/80 rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-[#3B060A] mb-4 text-center">
          バッジ獲得条件
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className={`p-4 rounded-lg ${chocolateCount >= 1 ? 'bg-[#D4A574]/30' : 'bg-gray-100'}`}>
            {badges?.chocolate1?.icon ? (
              <div className="relative w-12 h-12 mx-auto mb-2">
                <Image
                  src={badges.chocolate1.icon}
                  alt={badges.chocolate1.name || 'チョコ1個'}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="text-3xl mb-2">🏅</div>
            )}
            <div className="text-sm font-medium text-[#3B060A]">チョコ1個</div>
            <div className="text-xs text-gray-500">10h開発</div>
            {chocolateCount >= 1 && <div className="text-green-600 text-xs mt-1">達成！</div>}
          </div>
          <div className={`p-4 rounded-lg ${chocolateCount >= 10 ? 'bg-[#D4A574]/30' : 'bg-gray-100'}`}>
            {badges?.chocolate10?.icon ? (
              <div className="relative w-12 h-12 mx-auto mb-2">
                <Image
                  src={badges.chocolate10.icon}
                  alt={badges.chocolate10.name || 'チョコ10個'}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="text-3xl mb-2">🥇</div>
            )}
            <div className="text-sm font-medium text-[#3B060A]">チョコ10個</div>
            <div className="text-xs text-gray-500">20h開発</div>
            {chocolateCount >= 10 && <div className="text-green-600 text-xs mt-1">達成！</div>}
          </div>
          <div className={`p-4 rounded-lg ${chocolateCount >= 20 ? 'bg-[#D4A574]/30' : 'bg-gray-100'}`}>
            {badges?.chocolate20?.icon ? (
              <div className="relative w-12 h-12 mx-auto mb-2">
                <Image
                  src={badges.chocolate20.icon}
                  alt={badges.chocolate20.name || 'チョコ20個'}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="text-3xl mb-2">👑</div>
            )}
            <div className="text-sm font-medium text-[#3B060A]">チョコ20個</div>
            <div className="text-xs text-gray-500">30h開発</div>
            {chocolateCount >= 20 && <div className="text-green-600 text-xs mt-1">達成！</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
