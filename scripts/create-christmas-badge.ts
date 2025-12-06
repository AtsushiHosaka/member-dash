import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createChristmasBadge() {
  try {
    // 7日継続バッジが既に存在するかチェック
    const existingBadge = await prisma.badge.findFirst({
      where: {
        icon: {
          contains: 'christmas-25-7-days-continuous'
        }
      }
    })

    if (existingBadge) {
      console.log('7日継続バッジは既に存在します:', existingBadge)
      return
    }

    // バッジを作成
    const badge = await prisma.badge.create({
      data: {
        name: '🎄 7日継続ログイン達成 2025',
        icon: '/badges/christmas-25-7-days-continuous.png',
        isPublic: true,
        allowedUserIds: []
      }
    })

    console.log('7日継続バッジを作成しました:', badge)
  } catch (error) {
    console.error('エラー:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createChristmasBadge()
