import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // 既存のデータをクリア（開発環境のみ）
  await prisma.userBadge.deleteMany({})
  await prisma.badge.deleteMany({})
  await prisma.session.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.school.deleteMany({})
  console.log('Cleared existing data')

  // スクールの作成
  const schools = await Promise.all([
    prisma.school.create({
      data: { name: '火曜白金' }
    }),
    prisma.school.create({
      data: { name: '水曜白金' }
    }),
    prisma.school.create({
      data: { name: '金曜白金' }
    }),
    prisma.school.create({
      data: { name: '土曜白金' }
    }),
    prisma.school.create({
      data: { name: '日曜A白金' }
    }),
    prisma.school.create({
      data: { name: '日曜B白金' }
    }),
    prisma.school.create({
      data: { name: '日曜B秋葉原' }
    }),
    prisma.school.create({
      data: { name: '日曜B池袋' }
    })
  ])

  console.log('Created schools:', schools)

  // バッジの作成
  const badges = await Promise.all([
    // Common (60%)
    prisma.badge.create({ data: { name: 'ブロンズメダル', icon: '🥉', rarity: 'common' } }),
    prisma.badge.create({ data: { name: '初心者バッジ', icon: '🔰', rarity: 'common' } }),
    prisma.badge.create({ data: { name: 'コーヒーカップ', icon: '☕', rarity: 'common' } }),
    prisma.badge.create({ data: { name: 'スタンプ', icon: '📝', rarity: 'common' } }),
    prisma.badge.create({ data: { name: '鉛筆', icon: '✏️', rarity: 'common' } }),
    prisma.badge.create({ data: { name: '電球', icon: '💡', rarity: 'common' } }),

    // Rare (25%)
    prisma.badge.create({ data: { name: 'シルバーメダル', icon: '🥈', rarity: 'rare' } }),
    prisma.badge.create({ data: { name: 'ロケット', icon: '🚀', rarity: 'rare' } }),
    prisma.badge.create({ data: { name: 'トロフィー', icon: '🏆', rarity: 'rare' } }),

    // Epic (12%)
    prisma.badge.create({ data: { name: 'ゴールドメダル', icon: '🥇', rarity: 'epic' } }),
    prisma.badge.create({ data: { name: 'ダイヤモンド', icon: '💎', rarity: 'epic' } }),

    // Legendary (3%)
    prisma.badge.create({ data: { name: '王冠', icon: '👑', rarity: 'legendary' } }),
    prisma.badge.create({ data: { name: '伝説の剣', icon: '⚔️', rarity: 'legendary' } }),
  ])

  console.log('Created badges:', badges.length)

  // パスワードのハッシュ化
  const hashedPassword = await bcrypt.hash('password123', 10)

  // 管理者アカウントの作成（環境変数から読み込み）
  const adminUserId = process.env.ADMIN_USER_ID
  const adminPassword = process.env.ADMIN_PASSWORD

  if (adminUserId && adminPassword) {
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10)
    const adminUser = await prisma.user.create({
      data: {
        userId: adminUserId,
        name: 'LIT管理者',
        password: hashedAdminPassword,
        courses: ['Admin'],
        role: 'admin'
      }
    })

    // 管理者の校舎リンクを作成
    await prisma.userSchool.create({
      data: {
        userId: adminUser.id,
        schoolId: schools[0].id // 火曜白金
      }
    })

    console.log('Created admin user:', adminUser.userId)
  } else {
    console.log('Skipped admin user creation (ADMIN_USER_ID or ADMIN_PASSWORD not set)')
  }

  // 開発環境のみテストユーザーとセッションを作成
  const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.DATABASE_URL?.includes('neon.tech')

  if (isDevelopment) {
    console.log('Development environment detected - creating test users...')

    // 土曜白金のユーザー作成
    const user1 = await prisma.user.create({
      data: {
        userId: 'tanaka',
        name: '田中太郎',
        password: hashedPassword,
        courses: ['iPhone'],
        role: 'member'
      }
    })
    await prisma.userSchool.create({
      data: { userId: user1.id, schoolId: schools[3].id }
    })

    const user2 = await prisma.user.create({
      data: {
        userId: 'suzuki',
        name: '鈴木花子',
        password: hashedPassword,
        courses: ['WebS', 'Android'], // 複数コース例
        role: 'member'
      }
    })
    await prisma.userSchool.create({
      data: { userId: user2.id, schoolId: schools[3].id }
    })

    const user3 = await prisma.user.create({
      data: {
        userId: 'yamada',
        name: '山田次郎',
        password: hashedPassword,
        courses: ['Android'],
        role: 'member'
      }
    })
    await prisma.userSchool.create({
      data: { userId: user3.id, schoolId: schools[3].id }
    })

    const user4 = await prisma.user.create({
      data: {
        userId: 'sato',
        name: '佐藤美咲',
        password: hashedPassword,
        courses: ['Unity'],
        role: 'member'
      }
    })
    await prisma.userSchool.create({
      data: { userId: user4.id, schoolId: schools[3].id }
    })

    const users = [user1, user2, user3, user4]
    console.log('Created test users:', users.length)

    // セッションデータの作成（過去1週間分）
    const now = new Date()

    // 田中太郎のセッション（アクティブ）
    await prisma.session.create({
      data: {
        userId: users[0].id,
        startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2時間前
        isActive: true
      }
    })

    // 鈴木花子のセッション（アクティブ）
    await prisma.session.create({
      data: {
        userId: users[1].id,
        startTime: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1時間前
        isActive: true
      }
    })

    // 過去の完了セッション
    const sessions = [
      // 田中太郎（開発中）
      { userId: users[0].id, hours: 3, desc: 'ログイン機能の実装', daysAgo: 1 },
      { userId: users[0].id, hours: 2.5, desc: 'UI改善', daysAgo: 2 },
      { userId: users[0].id, hours: 4, desc: 'データベース設計', daysAgo: 3 },

      // 鈴木花子（開発中）
      { userId: users[1].id, hours: 5, desc: 'API開発', daysAgo: 1 },
      { userId: users[1].id, hours: 3, desc: 'テスト作成', daysAgo: 2 },
      { userId: users[1].id, hours: 2, desc: 'バグ修正', daysAgo: 4 },

      // 山田次郎（非開発中）
      { userId: users[2].id, hours: 2, desc: 'レイアウト調整', daysAgo: 1 },
      { userId: users[2].id, hours: 4, desc: '機能追加', daysAgo: 3 },

      // 佐藤美咲（非開発中）
      { userId: users[3].id, hours: 1.5, desc: 'コードレビュー', daysAgo: 2 },
      { userId: users[3].id, hours: 3, desc: 'ドキュメント作成', daysAgo: 5 },
    ]

    for (const session of sessions) {
      const startTime = new Date(now.getTime() - session.daysAgo * 24 * 60 * 60 * 1000)
      const duration = session.hours * 3600
      const endTime = new Date(startTime.getTime() + duration * 1000)

      await prisma.session.create({
        data: {
          userId: session.userId,
          startTime,
          endTime,
          duration,
          description: session.desc,
          isActive: false
        }
      })
    }

    console.log('Created test sessions:', sessions.length + 2)
  } else {
    console.log('Production environment detected - skipping test users and sessions')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
