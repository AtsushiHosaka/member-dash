// テーマ判定ユーティリティ
// お正月テーマを常に使用

export type ThemeType = 'newyear'

export function getCurrentTheme(): ThemeType {
  return 'newyear'
}

export function isNewYearTheme(): boolean {
  return true
}

// テーマに応じた色クラスを取得
export function getThemeClasses() {
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
