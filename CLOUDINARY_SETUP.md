# Cloudinaryセットアップ手順

このドキュメントでは、バッジ画像アップロード機能を有効にするためのCloudinaryセットアップ手順を説明します。

## 1. Cloudinaryアカウント作成

1. [Cloudinary公式サイト](https://cloudinary.com/)にアクセス
2. **Sign Up for Free** をクリック
3. メールアドレス、パスワードを入力してアカウント作成
4. メール認証を完了

## 2. APIキーの取得

1. Cloudinaryダッシュボードにログイン
2. 左側メニューから **Dashboard** を選択
3. 以下の情報をメモ：
   - **Cloud Name**（例: `dxyz12abc`）
   - **API Key**（例: `123456789012345`）
   - **API Secret**（例: `abcdefghijklmnopqrstuvwxyz123`）

## 3. ローカル環境設定

### 3.1 環境変数ファイルの作成

プロジェクトルートにある `.env` ファイルに以下を追加：

```bash
# Cloudinary (画像アップロード用)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

**例:**
```bash
CLOUDINARY_CLOUD_NAME="dxyz12abc"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="abcdefghijklmnopqrstuvwxyz123"
```

### 3.2 動作確認

開発サーバーを起動して動作確認：

```bash
npm run dev
```

1. メンターまたは管理者アカウントでログイン
2. `/badges` にアクセス
3. 「新しいバッジを追加」をクリック
4. 画像をアップロード（2MB以下）
5. Cloudinaryにアップロードされることを確認

## 4. Vercelデプロイ設定

### 4.1 Vercel環境変数の追加

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. プロジェクトを選択
3. **Settings** → **Environment Variables** に移動
4. 以下の3つの環境変数を追加：

| Key | Value | Environment |
|-----|-------|-------------|
| `CLOUDINARY_CLOUD_NAME` | `dxyz12abc`（あなたのCloud Name） | Production, Preview, Development |
| `CLOUDINARY_API_KEY` | `123456789012345`（あなたのAPI Key） | Production, Preview, Development |
| `CLOUDINARY_API_SECRET` | `abcdefghijklmnopqrstuvwxyz123`（あなたのAPI Secret） | Production, Preview, Development |

### 4.2 再デプロイ

環境変数を追加したら、Vercelで再デプロイ：

```bash
git add .
git commit -m "Add Cloudinary integration"
git push
```

または、Vercelダッシュボードから **Deployments** → **Redeploy** をクリック

## 5. Cloudinary設定の確認

### 5.1 アップロードプリセット（オプション）

デフォルト設定で動作しますが、より詳細な設定が必要な場合：

1. Cloudinaryダッシュボードで **Settings** → **Upload** を選択
2. **Upload presets** で **Add upload preset** をクリック
3. 以下を設定：
   - **Preset name**: `badges`
   - **Signing mode**: `Signed`
   - **Folder**: `badges`
   - **Transformation**:
     - Width: `200`
     - Height: `200`
     - Crop: `limit`

### 5.2 ストレージ容量の確認

無料プランの制限：
- **ストレージ**: 25GB
- **月間画像変換**: 25万回
- **帯域幅**: 25GB/月

現在の使用量を確認：
1. Cloudinaryダッシュボード
2. 左側メニュー **Reports** → **Usage**

## 6. トラブルシューティング

### エラー: "Upload error"

**原因**: 環境変数が設定されていない

**解決策**:
```bash
# .env ファイルを確認
cat .env | grep CLOUDINARY

# 環境変数が正しく読み込まれているか確認
node -e "console.log(process.env.CLOUDINARY_CLOUD_NAME)"
```

### エラー: "ファイルサイズは2MB以下にしてください"

**原因**: アップロードしようとしている画像が2MBを超えている

**解決策**:
- 画像を圧縮（[TinyPNG](https://tinypng.com/)など）
- または、サイズ制限を変更（`src/app/api/upload/route.ts:33`）

### エラー: "Invalid API Key"

**原因**: APIキーが間違っている

**解決策**:
1. Cloudinaryダッシュボードでキーを再確認
2. `.env` ファイルの値を修正
3. 開発サーバーを再起動 (`Ctrl+C` → `npm run dev`)

## 7. セキュリティ注意事項

⚠️ **重要**: 以下のファイルは`.gitignore`に含まれていることを確認してください：

```
.env
.env.local
```

APIシークレットは**絶対に**公開リポジトリにコミットしないでください。

## 8. 料金プラン

### 無料プラン (Free)
- ストレージ: 25GB
- 帯域幅: 25GB/月
- 画像変換: 25万回/月
- **推奨**: 小規模プロジェクト、個人開発

### 有料プラン (Plus - $99/月〜)
- ストレージ: 追加購入可能
- 帯域幅: 追加購入可能
- 高度な画像処理機能
- **推奨**: 本番運用、画像が大量になる場合

## 9. バッジ画像の仕様

アップロードAPIの仕様（`src/app/api/upload/route.ts`）:

| 項目 | 設定値 |
|------|--------|
| **最大ファイルサイズ** | 2MB |
| **対応フォーマット** | JPG, PNG, GIF, WebP |
| **自動リサイズ** | 最大200x200px（アスペクト比維持） |
| **自動最適化** | 有効（品質、フォーマット） |
| **保存先フォルダ** | `badges/` |

## 10. 参考リンク

- [Cloudinary公式ドキュメント](https://cloudinary.com/documentation)
- [Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [画像変換リファレンス](https://cloudinary.com/documentation/image_transformations)
- [無料プラン詳細](https://cloudinary.com/pricing)

---

**セットアップ完了後、バッジ画像アップロード機能が利用可能になります！** 🎉
