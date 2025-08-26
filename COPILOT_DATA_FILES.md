# Copilot読み込み推奨データファイル

## 📋 必須読み込みファイル（全員共通）

### 1. システム設定ファイル
```
📄 amplify_outputs.json
- AWS Amplifyの設定情報
- API エンドポイント
- 認証設定
- ストレージ設定

📄 package.json
- プロジェクト依存関係
- スクリプト設定
- バージョン情報

📄 tsconfig.json
- TypeScript設定
- コンパイルオプション
- パス設定
```

### 2. プロジェクト構成ファイル
```
📄 README.md
- プロジェクト概要
- 技術スタック
- セットアップ手順

📄 TEAM_DEVELOPMENT.md
- チーム開発ガイド
- ファイル構成
- 役割分担

📄 AGILE_DEVELOPMENT_PLAN.md
- スプリント計画
- タスク詳細
- 成功基準
```

### 3. データベース構成
```
📄 amplify/data/resource.ts
- データベーススキーマ
- テーブル定義
- リレーション設定

📄 src/utils/seedData.ts
- 初期データ定義
- タグマスタデータ
- サンプルデータ
```

---

## 🎯 担当別追加読み込みファイル

### メンバーA: 認証・ユーザー担当

#### 必須ファイル
```
📁 src/components/auth/
├── UserProfile.vue - プロフィール管理画面

📁 src/services/
├── authService.ts - 認証サービス

📁 amplify/auth/
├── resource.ts - 認証設定
```

#### サンプルデータ
```json
// ユーザープロフィールサンプル
{
  "id": "user001",
  "userId": "cognito-user-id",
  "name": "田中太郎",
  "department": "IT統括部",
  "section": "IT統括グループ",
  "hobbyTags": ["プログラミング", "読書", "映画鑑賞"],
  "profileImageUrl": "profile-images/user001.jpg"
}
```

---

### メンバーB: イベント担当

#### 必須ファイル
```
📁 src/components/events/
├── EventTimeline.vue - イベント一覧・作成
├── EventDetail.vue - イベント詳細・参加

📁 src/services/
├── eventService.ts - イベントサービス
```

#### サンプルデータ
```json
// イベントサンプル
{
  "id": "event001",
  "title": "プログラミング勉強会",
  "description": "Vue.jsの基礎を学ぶ勉強会です",
  "date": "2024-02-15T19:00:00Z",
  "endDate": "2024-02-15T21:00:00Z",
  "location": "会議室A",
  "maxParticipants": 20,
  "tags": ["プログラミング", "勉強会"],
  "targetAudience": "初心者歓迎",
  "recruitmentDeadline": "2024-02-14T17:00:00Z",
  "representativeEmail": "organizer@example.com",
  "createdBy": "user001"
}
```

---

### メンバーC: 部活動担当

#### 必須ファイル
```
📁 src/components/clubs/
├── ClubList.vue - 部活動一覧・作成
├── WikiPage.vue - Wiki表示・編集
├── ClubParticipants.vue - 申請者一覧
├── ClubApplications.vue - 申請管理

📁 src/services/
├── clubService.ts - 部活動サービス
```

#### サンプルデータ
```json
// 部活動サンプル
{
  "id": "club001",
  "name": "プログラミング部",
  "description": "プログラミングを楽しく学ぶ部活動",
  "category": "IT・技術",
  "representativeEmail": "club-leader@example.com",
  "isActive": true,
  "createdBy": "user001"
}

// Wikiページサンプル
{
  "id": "wiki001",
  "clubId": "club001",
  "title": "プログラミング部 Wiki",
  "content": "## 部活動について\nプログラミングを楽しく学ぶ部活動です。\n\n## 活動内容\n- 週1回の勉強会\n- プロジェクト開発\n- 技術共有",
  "lastEditedBy": "user001"
}
```

---

### メンバーD: 通知担当

#### 必須ファイル
```
📁 src/services/
├── notificationService.ts - 通知サービス

📁 amplify/functions/email-notification/
├── handler.ts - Lambda関数
├── resource.ts - 関数設定
├── package.json - 依存関係
```

#### 設定サンプル
```json
// メール通知設定
{
  "fromEmail": "noreply@zbbs-events.com",
  "templates": {
    "clubApplication": {
      "subject": "【ZBBS部】{clubName}への参加申請",
      "body": "部活動「{clubName}」に新しい参加申請が届きました。"
    },
    "eventParticipation": {
      "subject": "【ZBBS部】{eventTitle}への参加通知",
      "body": "イベント「{eventTitle}」に新しい参加者が登録されました。"
    }
  }
}
```

---

### メンバーE: UI担当

#### 必須ファイル
```
📁 src/components/shared/
├── BaseButton.vue - ボタンコンポーネント
├── BaseCard.vue - カードコンポーネント
├── BaseInput.vue - 入力コンポーネント
├── BaseModal.vue - モーダルコンポーネント
├── BaseTag.vue - タグコンポーネント

📁 src/styles/
├── common.css - 共通スタイル

📁 src/services/
├── uiService.ts - UIユーティリティ
```

#### デザインシステム
```css
/* カラーパレット */
:root {
  --primary-color: #4285f4;
  --secondary-color: #34a853;
  --warning-color: #ff8c00;
  --danger-color: #ea4335;
  --info-color: #17a2b8;
  --success-color: #28a745;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
}

/* フォントサイズ */
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.text-base { font-size: 1rem; }
.text-lg { font-size: 1.125rem; }
.text-xl { font-size: 1.25rem; }
```

---

### メンバーF: 設定・管理担当

#### 必須ファイル
```
📁 amplify/
├── backend.ts - バックエンド設定
├── data/resource.ts - データベース設定
├── auth/resource.ts - 認証設定
├── storage/resource.ts - ストレージ設定

📁 src/utils/
├── seedData.ts - 初期データ
├── idGenerator.ts - ID生成

📄 vite.config.ts - ビルド設定
📄 .env - 環境変数
```

#### システム設定
```typescript
// データベーステーブル一覧
const tables = {
  Event: "イベント情報",
  UserProfile: "ユーザープロフィール", 
  EventParticipant: "イベント参加者",
  TagMaster: "タグマスタ",
  Counter: "ID生成カウンター",
  Club: "部活動情報",
  WikiPage: "Wikiページ",
  ClubApplication: "部活動申請"
};

// 環境設定
const environments = {
  development: "開発環境",
  staging: "ステージング環境", 
  production: "本番環境"
};
```

---

## 🔍 データ構造リファレンス

### タグマスタデータ
```json
{
  "categories": [
    {
      "name": "IT・技術",
      "tags": ["プログラミング", "AI・機械学習", "データ分析", "クラウド", "セキュリティ"]
    },
    {
      "name": "デザイン・クリエイティブ", 
      "tags": ["UI/UXデザイン", "グラフィックデザイン", "動画編集", "写真撮影", "イラスト"]
    },
    {
      "name": "ビジネス・マーケティング",
      "tags": ["マーケティング", "営業", "企画", "プロジェクト管理", "データ分析"]
    }
  ]
}
```

### API エンドポイント
```json
{
  "graphql": "https://xxx.appsync-api.ap-northeast-1.amazonaws.com/graphql",
  "functions": {
    "emailNotification": "https://xxx.lambda-url.ap-northeast-1.on.aws/"
  },
  "storage": {
    "bucket": "amplify-xxx-profileimagesbucket-xxx",
    "region": "ap-northeast-1"
  }
}
```

---

## 📝 開発時のベストプラクティス

### コード品質
- TypeScript strict mode使用
- ESLint + Prettier設定準拠
- 適切なエラーハンドリング
- 日本語コメント追加

### パフォーマンス
- 不要な再レンダリング回避
- 適切なキャッシュ利用
- 画像最適化
- バンドルサイズ最小化

### セキュリティ
- 入力値検証
- XSS対策
- 個人情報保護
- 適切な権限管理