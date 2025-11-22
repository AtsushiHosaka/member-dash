# Poll コンポーネント使用ガイド

## 概要

`Poll` コンポーネントは、様々な種類のアンケート・投票機能を簡単に実装できる汎用コンポーネントです。

## 基本的な使い方

```tsx
import Poll from '@/components/Poll'

export default function MyPage() {
  return (
    <Poll
      title="命名投票"
      apiEndpoint="/api/naming-poll"
    />
  )
}
```

## プロパティ一覧

### 必須プロパティ

| プロパティ | 型 | 説明 |
|----------|------|------|
| `title` | `string` | アンケートのタイトル（例: "命名投票", "次回イベントアンケート"） |
| `apiEndpoint` | `string` | APIエンドポイント（例: "/api/naming-poll", "/api/event-poll"） |

### オプショナルプロパティ

| プロパティ | 型 | デフォルト値 | 説明 |
|----------|------|------------|------|
| `maxVotes` | `number` | `2` | 1人あたりの投票可能数 |
| `onVoteComplete` | `() => void` | - | 投票完了時のコールバック関数 |
| `shuffleOptions` | `boolean` | `true` | 選択肢をランダムに表示するか |
| `voteLabels` | `string[]` | `['1票目', '2票目', ...]` | 各投票のラベル |
| `voteButtonTexts` | `string[]` | `['1票目を投票する', ...]` | 各投票のボタンテキスト |
| `voteColors` | `Array<'blue' \| 'green' \| 'purple' \| 'orange'>` | `['blue', 'green']` | 各投票のカラーテーマ |

## 使用例

### 例1: 命名投票（デフォルト設定）

```tsx
<Poll
  title="命名投票"
  apiEndpoint="/api/naming-poll"
/>
```

- 2票まで投票可能
- 選択肢はシャッフルされる
- 1票目は青、2票目は緑のテーマカラー

### 例2: 1人1票のイベントアンケート

```tsx
<Poll
  title="次回イベントアンケート"
  apiEndpoint="/api/event-poll"
  maxVotes={1}
  shuffleOptions={false}
  voteLabels={['投票']}
  voteButtonTexts={['投票する']}
  voteColors={['purple']}
/>
```

### 例3: カスタムラベルと色

```tsx
<Poll
  title="ランチ投票"
  apiEndpoint="/api/lunch-poll"
  maxVotes={3}
  voteLabels={['第1希望', '第2希望', '第3希望']}
  voteButtonTexts={['第1希望を投票', '第2希望を投票', '第3希望を投票']}
  voteColors={['blue', 'green', 'purple']}
  onVoteComplete={() => {
    console.log('投票完了!')
  }}
/>
```

## APIエンドポイントの要件

Pollコンポーネントを使用するには、以下の仕様に従ったAPIエンドポイントが必要です。

### GET エンドポイント

投票情報を取得します。

**レスポンス形式:**

```typescript
{
  poll: {
    id: string
    options: Array<{
      id: string
      text: string
      _count: {
        votes: number
      }
    }>
  } | null
  voteCount: number  // このユーザーが投票した回数
  votes: Array<{
    optionId: string
    voteNumber: number
  }>
}
```

**例:**

```json
{
  "poll": {
    "id": "poll-123",
    "options": [
      {
        "id": "opt-1",
        "text": "オプション1",
        "_count": {
          "votes": 5
        }
      },
      {
        "id": "opt-2",
        "text": "オプション2",
        "_count": {
          "votes": 3
        }
      }
    ]
  },
  "voteCount": 1,
  "votes": [
    {
      "optionId": "opt-1",
      "voteNumber": 1
    }
  ]
}
```

### POST エンドポイント

投票を記録します。

**リクエスト形式:**

```typescript
{
  optionId: string
}
```

**レスポンス形式:**

```typescript
{
  success: true
  vote: object
  voteNumber: number
}
```

**エラーレスポンス:**

- `400`: 不正なリクエスト（選択肢未選択、投票上限到達など）
- `401`: 未認証
- `500`: サーバーエラー

## データベーススキーマの例

命名投票の実装を参考にした、汎用的なスキーマ例：

```prisma
model Poll {
  id        String   @id @default(cuid())
  name      String   // 投票の識別名
  isActive  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  options   PollOption[]
  votes     PollVote[]
}

model PollOption {
  id        String   @id @default(cuid())
  text      String   // 選択肢のテキスト
  pollId    String
  poll      Poll     @relation(fields: [pollId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  votes     PollVote[]
}

model PollVote {
  id         String     @id @default(cuid())
  pollId     String
  optionId   String
  userId     String
  voteNumber Int        // 1票目、2票目など
  createdAt  DateTime   @default(now())

  poll       Poll       @relation(fields: [pollId], references: [id], onDelete: Cascade)
  option     PollOption @relation(fields: [optionId], references: [id], onDelete: Cascade)
  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([pollId, userId, voteNumber])
}
```

## 新しいアンケートを追加する手順

1. **データベーススキーマの作成** (必要に応じて上記のスキーマを参考に)

2. **APIエンドポイントの作成**
   - `/src/app/api/[poll-name]/route.ts` を作成
   - GET と POST メソッドを実装
   - 上記のレスポンス形式に従う

3. **ページでコンポーネントを使用**
   ```tsx
   import Poll from '@/components/Poll'

   export default function MyPollPage() {
     return (
       <Poll
         title="あなたのアンケート"
         apiEndpoint="/api/your-poll"
         maxVotes={1}
       />
     )
   }
   ```

## カラーテーマ

利用可能なカラー:

- `blue` - 青系（デフォルト1票目）
- `green` - 緑系（デフォルト2票目）
- `purple` - 紫系
- `orange` - オレンジ系

各カラーは、ボーダー、背景、ボタン、バッジに一貫したテーマカラーを適用します。

## 投票結果の表示

全投票完了後（`voteCount >= maxVotes`）、以下が表示されます：

1. **横棒グラフ** - 全体の投票割合を視覚化
2. **詳細リスト** - 各オプションの票数と割合
3. **あなたの投票マーカー** - ユーザーが投票したオプションにバッジ表示

## 注意事項

- コンポーネントは `'use client'` ディレクティブを使用しています
- 認証が必要です（NextAuthセッションを使用）
- APIエンドポイントは401/403エラーを適切に返す必要があります
