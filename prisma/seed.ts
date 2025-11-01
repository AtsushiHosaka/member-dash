import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // 既存のデータをクリア（開発環境のみ）
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
    })
  ])

  console.log('Created schools:', schools)

  // パスワードのハッシュ化
  const hashedPassword = await bcrypt.hash('password123', 10)

  // 土曜白金のユーザー作成
  const users = await Promise.all([
    // 開発中のメンバー1
    prisma.user.create({
      data: {
        userId: 'tanaka',
        name: '田中太郎',
        password: hashedPassword,
        course: 'iPhone',
        role: 'member',
        schoolId: schools[3].id // 土曜白金
      }
    }),
    // 開発中のメンバー2
    prisma.user.create({
      data: {
        userId: 'suzuki',
        name: '鈴木花子',
        password: hashedPassword,
        course: 'WebS',
        role: 'member',
        schoolId: schools[3].id // 土曜白金
      }
    }),
    // 非開発中のメンバー1
    prisma.user.create({
      data: {
        userId: 'yamada',
        name: '山田次郎',
        password: hashedPassword,
        course: 'Android',
        role: 'member',
        schoolId: schools[3].id // 土曜白金
      }
    }),
    // 非開発中のメンバー2
    prisma.user.create({
      data: {
        userId: 'sato',
        name: '佐藤美咲',
        password: hashedPassword,
        course: 'Unity',
        role: 'member',
        schoolId: schools[3].id // 土曜白金
      }
    })
  ])

  console.log('Created users:', users.length)

  // セッションデータの作成（過去1週間分）
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

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

  console.log('Created sessions:', sessions.length + 2)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
