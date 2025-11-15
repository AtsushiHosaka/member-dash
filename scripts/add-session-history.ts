import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function addSessionHistory() {
  try {
    console.log('開発履歴追加スクリプトを開始します...')

    // 全てのユーザーを取得（adminとmentorを除く）
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['member']
        }
      },
      select: {
        id: true,
        userId: true,
        name: true
      }
    })

    console.log(`対象ユーザー数: ${users.length}名`)

    // 2025/11/15 18:15 ~ 20:15 のセッションを作成
    const startTime = new Date('2025-11-15T18:15:00+09:00')
    const endTime = new Date('2025-11-15T20:15:00+09:00')
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000) // 7200秒 = 2時間

    let successCount = 0
    let errorCount = 0

    for (const user of users) {
      try {
        // セッションを作成
        const session = await prisma.session.create({
          data: {
            userId: user.id,
            startTime: startTime,
            endTime: endTime,
            duration: duration,
            isActive: false,
            goal: '開発作業',
            achievement: 100,
            whatIDid: '各種開発タスクを実施しました',
            whatILearned: '新しい技術を学びました',
            whatIWantToDo: '引き続き開発を進めます'
          }
        })

        // ユーザーの総学習時間を更新（2時間追加）
        await prisma.user.update({
          where: { id: user.id },
          data: {
            totalStudyHours: {
              increment: 2.0
            }
          }
        })

        console.log(`✓ ${user.name} (${user.userId}): セッション追加完了`)
        successCount++
      } catch (error) {
        console.error(`✗ ${user.name} (${user.userId}): エラー`, error)
        errorCount++
      }
    }

    console.log('\n=== 完了 ===')
    console.log(`成功: ${successCount}件`)
    console.log(`エラー: ${errorCount}件`)
    console.log(`合計: ${users.length}件`)

  } catch (error) {
    console.error('スクリプト実行エラー:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addSessionHistory()
