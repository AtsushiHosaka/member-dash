import { v2 as cloudinary } from 'cloudinary'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Cloudinary設定
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const userRole = (session.user as any).role

    if (userRole !== 'admin' && userRole !== 'mentor') {
      return NextResponse.json(
        { error: '管理者またはメンター権限が必要です' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが必要です' },
        { status: 400 }
      )
    }

    // ファイル名がある場合のみ処理
    if (!file.name || file.size === 0) {
      return NextResponse.json(
        { error: '有効なファイルを選択してください' },
        { status: 400 }
      )
    }

    // ファイルタイプの検証
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '画像ファイル（JPG, PNG, GIF, WebP）のみアップロード可能です' },
        { status: 400 }
      )
    }

    // ファイルサイズの検証（2MB以下）
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'ファイルサイズは2MB以下にしてください' },
        { status: 400 }
      )
    }

    // ファイルをBufferに変換
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Cloudinaryにアップロード
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'badges',
          transformation: [
            { width: 200, height: 200, crop: 'limit' }, // 最大200x200にリサイズ
            { quality: 'auto' }, // 自動品質最適化
            { fetch_format: 'auto' } // 自動フォーマット変換（WebPなど）
          ]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    return NextResponse.json({ url: result.secure_url })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error?.message || 'アップロードエラー' },
      { status: 500 }
    )
  }
}
