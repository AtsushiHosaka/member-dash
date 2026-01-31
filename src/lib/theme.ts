// テーマ判定ユーティリティ
// 日付に応じてテーマを自動切り替え

export type ThemeType = 'newyear' | 'valentine' | 'default'

// 日本時間を取得するヘルパー
function getJSTDate(): Date {
  const now = new Date()
  const jstOffset = 9 * 60 // JST is UTC+9
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
  return new Date(utc + (jstOffset * 60000))
}

export function getCurrentTheme(): ThemeType {
  const jst = getJSTDate()
  const month = jst.getMonth() + 1
  const day = jst.getDate()

  // 1/31〜2/28: バレンタイン（結果表示期間含む）
  if ((month === 1 && day === 31) || (month === 2 && day <= 28)) {
    return 'valentine'
  }
  // 1/1〜1/10: お正月
  if (month === 1 && day >= 1 && day <= 10) {
    return 'newyear'
  }
  return 'default'
}

export function isNewYearTheme(): boolean {
  return getCurrentTheme() === 'newyear'
}

export function isValentineTheme(): boolean {
  return getCurrentTheme() === 'valentine'
}

// バレンタインイベント期間（開発時間加算対象）: 1/31〜2/13
export function isValentinePeriod(): boolean {
  const jst = getJSTDate()
  const month = jst.getMonth() + 1
  const day = jst.getDate()
  return (month === 1 && day === 31) || (month === 2 && day <= 13)
}

// バレンタイン結果表示期間: 2/14〜2/28
export function isValentineResultPeriod(): boolean {
  const jst = getJSTDate()
  const month = jst.getMonth() + 1
  const day = jst.getDate()
  return month === 2 && day >= 14 && day <= 28
}

// テーマに応じた色クラスを取得
export function getThemeClasses() {
  const theme = getCurrentTheme()

  if (theme === 'valentine') {
    return {
      // 背景
      bg: 'bg-[#FFF5EB]',
      bgDark: 'bg-[#F5E6D3]',
      // ヘッダー・ボタン
      primary: 'bg-[#8A0000]',
      primaryHover: 'hover:bg-[#6A0000]',
      primaryDark: 'bg-[#3B060A]',
      // テキスト
      textOnPrimary: 'text-white',
      textPrimary: 'text-[#8A0000]',
      textAccent: 'text-[#D4A574]',
      // ボーダー
      border: 'border-[#8A0000]',
      borderLight: 'border-[#D4A574]',
      // アクセント（ミルクチョコ色）
      accent: 'bg-[#D4A574]',
      accentHover: 'hover:bg-[#C49464]',
      accentText: 'text-[#D4A574]',
    }
  }

  // デフォルト（お正月含む）
  return {
    // 背景
    bg: 'bg-white',
    bgDark: 'bg-gray-50',
    // ヘッダー・ボタン
    primary: 'bg-red-600',
    primaryHover: 'hover:bg-red-700',
    primaryDark: 'bg-red-700',
    // テキスト
    textOnPrimary: 'text-white',
    textPrimary: 'text-red-600',
    textAccent: 'text-amber-500',
    // ボーダー
    border: 'border-red-600',
    borderLight: 'border-red-200',
    // アクセント（金色）
    accent: 'bg-amber-500',
    accentHover: 'hover:bg-amber-600',
    accentText: 'text-amber-500',
  }
}
