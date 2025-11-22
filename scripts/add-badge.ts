import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // meimei.png のバッジを追加
  const badge = await prisma.badge.create({
    data: {
      name: 'めいめい',
      icon: '/icons/meimei.png',
      isPublic: true,
      allowedUserIds: []
    }
  })

  console.log('バッジを追加しました:', badge)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
