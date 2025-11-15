# Member' (めんばーだっしゅ) - プログラミング時間管理

プログラミングの開発時間を管理する打刻サービス

## 機能

- ユーザー認証（ログイン・新規登録）
- 開発時間の記録（開始・終了）
- 開発内容の記録
- 同じスクールのユーザーの週間ランキング表示
- リアルタイムタイマー表示
- 開発中ユーザーの視覚的表示（緑の縁）

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **認証**: NextAuth.js
- **データベース**: PostgreSQL (Neon) / Prisma ORM
- **UI**: shadcn/ui + Tailwind CSS
- **言語**: TypeScript
- **デプロイ**: Vercel

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env` ファイルを作成します：

```bash
cp .env.example .env
```

その後、`.env` ファイルを編集して、実際の値を設定してください：

```env
# Database (Neon PostgreSQL - development branch)
# Neonダッシュボードから開発用ブランチの接続文字列を取得
DATABASE_URL="postgresql://user:password@host.neon.tech/database?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"  # openssl rand -base64 32 で生成

# Admin Account (シード用)
ADMIN_USER_ID="admin_lit_mentor"
ADMIN_PASSWORD="your-secure-password"

# Node Environment
NODE_ENV="development"
```

### 3. データベースのセットアップ

開発用Neon PostgreSQLデータベースを使用します：

```bash
# スキーマをデータベースにプッシュ
npx prisma db push

# 初期データの投入（管理者アカウント、スクール、テストユーザーなど）
npm run seed
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

## 使い方

### 1. アカウント作成

- `/register` から新規登録
- 名前、メールアドレス、パスワード、スクール、コースを入力

### 2. ログイン

- `/login` からログイン
- 登録したメールアドレスとパスワードを入力

### 3. 開発時間の記録

- 「開発開始」ボタンを押すと時間の記録が開始
- 「開発終了」ボタンを押すとポップアップが表示
- 開発内容を入力して記録を完了

### 4. ランキング確認

- ダッシュボードに同じスクールのユーザーの週間ランキングが表示
- 開発中のユーザーは緑の縁で表示

## デプロイ

### Vercelへのデプロイ

1. GitHubリポジトリにプッシュ
2. Vercelプロジェクトを作成
3. 環境変数を設定（`.env.prod` を参照）：
   - `DATABASE_URL`: Neon PostgreSQL本番ブランチの接続文字列
   - `NEXTAUTH_URL`: デプロイ先のURL（例: `https://your-app.vercel.app`）
   - `NEXTAUTH_SECRET`: ランダムな秘密鍵
   - `ADMIN_USER_ID`: 管理者ユーザーID
   - `ADMIN_PASSWORD`: 管理者パスワード
   - `NODE_ENV`: `production`
4. デプロイ後、Vercel上でシードコマンドを実行（初回のみ）

### 環境の分離

- **開発環境**: `.env` ファイル (Neon development branch)
- **本番環境**: Vercel環境変数 (Neon production branch)

**重要**: `.env` ファイルはGitで無視されます。本番環境の機密情報は絶対にGitHubにプッシュしないでください。

本番データベースと開発データベースは完全に分離されています。

## データベーススキーマ

### School

- スクール情報を管理

### User

- ユーザー情報（名前、メール、コース、アバター等）
- スクールに所属

### Session

- 開発セッション（開始時刻、終了時刻、時間、開発内容）
- ユーザーに紐づく

## ライセンス

MIT
# Schema updated with mentor role
