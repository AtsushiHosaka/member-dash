import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('絵文字バッジを検索中...')

  // 絵文字バッジ（URLでないアイコン）を取得
  const emojiBadges = await prisma.badge.findMany({
    where: {
      icon: {
        not: {
          startsWith: 'http'
        }
      }
    },
    include: {
      _count: {
        select: {
          userBadges: true
        }
      }
    }
  })

  console.log(`\n見つかった絵文字バッジ: ${emojiBadges.length}個`)
  emojiBadges.forEach(badge => {
    console.log(`- ${badge.name} (${badge.icon}) - 使用ユーザー数: ${badge._count.userBadges}`)
  })

  if (emojiBadges.length === 0) {
    console.log('\n削除する絵文字バッジはありません。')
    return
  }

  console.log('\n絵文字バッジを削除中...')

  // 絵文字バッジを削除（カスケードでUserBadgeも削除される）
  const result = await prisma.badge.deleteMany({
    where: {
      icon: {
        not: {
          startsWith: 'http'
        }
      }
    }
  })

  console.log(`\n✅ ${result.count}個の絵文字バッジを削除しました。`)
}

main()
  .catch((e) => {
    console.error('エラー:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
