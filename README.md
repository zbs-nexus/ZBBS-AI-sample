# ZBBS 部イベント管理システム

社内部活・同好会のイベント管理を効率化する Web アプリケーションです。Vue.js + AWS Amplify で構築されたモダンな SPA アプリケーションです。

## 概要

このシステムは、社内の部活動やサークル活動におけるイベントの作成・管理・参加を一元化するプラットフォームです。ユーザーは趣味に基づいてイベントを検索し、興味のあるイベントに参加できます。

## 主な機能

### 🎯 イベント管理

- **イベント作成・編集・削除** - 日時、場所、参加人数制限の設定
- **タグベース分類** - 9 カテゴリ 200+の趣味タグで分類
- **参加者管理** - リアルタイムな参加状況の確認
- **検索・フィルタリング** - タグによる柔軟な検索機能
- **メール通知** - イベント参加・キャンセル時の自動通知

### 👤 ユーザー管理

- **プロフィール管理** - 名前、部門、課、趣味タグの設定
- **プロフィール画像** - S3による安全な画像アップロード・表示
- **認証システム** - Amazon Cognito による安全な認証（日本語対応）
- **参加履歴** - 過去の参加イベント履歴

### 🏷️ タグシステム

- **9 つのカテゴリ**
  - IT・技術
  - デザイン・クリエイティブ
  - ビジネス・マーケティング
  - 趣味・エンターテイメント
  - スポーツ・健康
  - 学習・教育
  - アート・クラフト
  - 音楽・演奏
  - 旅行・アウトドア

## 技術スタック

### フロントエンド

- **Vue.js 3** - Composition API 使用
- **TypeScript** - 型安全な開発
- **Vite** - 高速ビルドツール
- **AWS Amplify UI Vue** - 認証 UI（日本語化済み）

### バックエンド

- **AWS Amplify Gen2** - フルスタックフレームワーク
- **AWS AppSync** - GraphQL API
- **Amazon DynamoDB** - NoSQL データベース
- **Amazon Cognito** - ユーザー認証・管理
- **Amazon S3** - プロフィール画像ストレージ
- **AWS Lambda** - サーバーレス関数
- **Amazon SES** - メール通知サービス

## データベース設計

### テーブル構成

#### Event（イベント）

```typescript
{
  id: string
  title: string          // イベント名
  description?: string   // 説明
  date: DateTime         // 開催日時
  location?: string      // 開催場所
  maxParticipants?: number // 最大参加者数
  tags: string[]         // タグ配列
  createdBy: string      // 作成者
}
```

#### UserProfile（ユーザープロフィール）

```typescript
{
  id: string
  userId: string         // Cognito User ID
  name: string          // 表示名
  department?: string   // 部門
  section?: string      // 課
  hobbyTags: string[]   // 趣味タグ配列
  profileImageUrl?: string // S3画像キー（動的URL生成）
}
```

#### EventParticipant（イベント参加）

```typescript
{
	id: string;
	eventId: string; // イベントID
	userId: string; // ユーザーID
}
```

#### TagMaster（タグマスタ）

```typescript
{
	id: string;
	name: string; // タグ名
	category: string; // カテゴリ
	isActive: boolean; // 有効フラグ
}
```

#### Counter（ID生成カウンター）

```typescript
{
	id: string;
	type: string; // カウンタータイプ
	currentValue: number; // 現在値
}
```

## セットアップ

### 前提条件

- Node.js 18 以上
- AWS CLI 設定済み
- AWS Amplify CLI

### インストール

```bash
# リポジトリクローン
git clone https://github.com/zbs-nexus/ZBBS-AI-sample.git
cd ZBBS-AI-sample

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

### AWS Amplify セットアップ

```bash
# Amplifyプロジェクト初期化
npx ampx sandbox

# バックエンドデプロイ
npx ampx pipeline-deploy --branch main --app-id YOUR_APP_ID
```

## 開発

### ローカル開発

```bash
npm run dev
```

### ビルド

```bash
npm run build
```

### 型チェック

```bash
npm run type-check
```

## デプロイ

### 自動デプロイ

- GitHub の main ブランチへのプッシュで自動デプロイ
- AWS Amplify Hosting によるフロントエンド配信

### 手動デプロイ

```bash
# フロントエンドビルド
npm run build

# バックエンドデプロイ
npx ampx pipeline-deploy --branch main --app-id YOUR_APP_ID
```

## データ管理

### 初期データ投入

```typescript
// 初期タグマスタデータ投入
seedTagMaster();

// 新規タグ追加
addNewTags();
```

### タグマスタ更新手順

1. `src/utils/seedData.ts`の`addNewTags`関数に新しいタグを追加
2. `src/App.vue`で`addNewTags()`のコメントアウトを外す
3. デプロイ実行
4. 更新後、`addNewTags()`を再度コメントアウト

## システム構成

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   フロントエンド   │    │   バックエンド    │    │   ストレージ     │
│                 │    │                 │    │                 │
│ Vue.js 3        │◄──►│ AWS AppSync     │◄──►│ Amazon DynamoDB │
│ TypeScript      │    │ GraphQL API     │    │ ・Event         │
│ Amplify UI      │    │                 │    │ ・UserProfile   │
│                 │    │ Amazon Cognito  │    │ ・EventParticipant│
│                 │    │ (認証)          │    │ ・TagMaster     │
│                 │    │                 │    │ ・Counter       │
│                 │    │ AWS Lambda      │    │                 │
│                 │    │ (メール通知)     │    │ Amazon S3       │
│                 │    │                 │    │ ・プロフィール画像│
│                 │    │ Amazon SES      │    │                 │
│                 │    │ (メール送信)     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 主要コンポーネント

### App.vue

- メインアプリケーション
- 認証状態管理
- ナビゲーション制御

### EventTimeline.vue

- イベント一覧表示
- イベント作成・編集
- タグフィルタリング

### EventDetail.vue

- イベント詳細表示
- 参加・キャンセル機能
- 参加者一覧

### UserProfile.vue

- プロフィール編集
- 趣味タグ選択
- 部門・課情報管理
- プロフィール画像アップロード（S3連携）

## セキュリティ

- **認証**: Amazon Cognito による多要素認証対応
- **認可**: IAM ロールベースのアクセス制御
- **API**: API Key + Cognito User Pools による二重認証
- **データ**: DynamoDB 暗号化ストレージ
- **画像**: S3 Pre-signed URL による安全なアクセス制御
- **メール**: SES による検証済みドメインからの送信

## ライセンス

このプロジェクトは MIT-0 ライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 貢献

プロジェクトへの貢献を歓迎します。詳細は[CONTRIBUTING](CONTRIBUTING.md)を参照してください。

## サポート

問題や質問がある場合は、[Issues](https://github.com/zbs-nexus/ZBBS-AI-sample/issues)で報告してください。
