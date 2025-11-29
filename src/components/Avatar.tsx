'use client'

interface AvatarProps {
  avatar: string | null
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isActive?: boolean
  showActiveIndicator?: boolean
  className?: string
  badgeName?: string | null  // バッジ名（画像アイコンの場合にホバーで表示）
}

const sizeClasses = {
  sm: 'w-10 h-10 text-lg',
  md: 'w-12 h-12 text-2xl',
  lg: 'w-16 h-16 text-3xl',
  xl: 'w-20 h-20 text-4xl',
}

const initialSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-2xl',
}

export default function Avatar({
  avatar,
  name,
  size = 'md',
  isActive = false,
  showActiveIndicator = false,
  className = '',
  badgeName = null,
}: AvatarProps) {
  const isImageUrl = avatar && (avatar.startsWith('/') || avatar.startsWith('http'))

  // ホバー時に表示するタイトルを決定
  // 画像アイコンの場合はバッジ名があればそれを表示、なければユーザー名
  const hoverTitle = isImageUrl && badgeName ? `${name} (${badgeName})` : name

  return (
    <div className="relative">
      <div
        className={`rounded-full bg-gray-300 flex items-center justify-center font-bold overflow-hidden ${
          sizeClasses[size]
        } ${isActive ? 'ring-4 ring-green-400' : ''} ${className}`}
        title={hoverTitle}
      >
        {avatar ? (
          isImageUrl ? (
            <img src={avatar} alt={badgeName || name} className="w-full h-full object-cover" />
          ) : (
            <span>{avatar}</span>
          )
        ) : (
          <span className={`text-white ${initialSizeClasses[size]}`}>
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      {showActiveIndicator && isActive && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
      )}
    </div>
  )
}
