# チーム開発ガイド

## 📁 新しいファイル構成

```
src/
├── components/
│   ├── auth/              # Aさん担当：認証関連
│   │   └── UserProfile.vue
│   ├── events/            # Bさん担当：イベント関連
│   │   ├── EventTimeline.vue
│   │   └── EventDetail.vue
│   ├── clubs/             # Cさん担当：部活・Wiki関連
│   │   ├── ClubList.vue
│   │   ├── WikiPage.vue
│   │   ├── ClubParticipants.vue
│   │   └── ClubApplications.vue
│   └── shared/            # Eさん担当：共通UI
│       ├── BaseButton.vue
│       ├── BaseCard.vue
│       ├── BaseInput.vue
│       ├── BaseModal.vue
│       └── BaseTag.vue
├── services/              # ビジネスロジック層
│   ├── authService.ts     # 認証サービス
│   ├── eventService.ts    # イベントサービス
│   ├── clubService.ts     # 部活サービス
│   ├── notificationService.ts # 通知サービス
│   └── uiService.ts       # UIユーティリティサービス
├── styles/
│   └── common.css         # 共通スタイル
└── utils/
    ├── idGenerator.ts     # ID生成ユーティリティ
    └── seedData.ts        # 初期データ投入
```

## 🔧 リファクタリング内容

### 1. サービス層の分離
- ビジネスロジックをコンポーネントから分離
- 各担当者が独立して作業可能
- テストしやすい構造

### 2. 共通コンポーネント化
- `BaseButton.vue`: 統一されたボタンコンポーネント
- `BaseCard.vue`: 統一されたカードコンポーネント
- `BaseInput.vue`: 統一された入力フィールドコンポーネント
- `BaseModal.vue`: 統一されたモーダルコンポーネント
- `BaseTag.vue`: 統一されたタグコンポーネント
- 一貫したUI/UX

### 3. 機能の保持
- 既存の全機能を維持
- Wiki表示・編集機能
- 部活申請・承認機能
- メール通知機能

## 🚀 開発手順

### 1. ブランチ作成
```bash
git checkout teamdev
git checkout -b feature/your-name-feature
```

### 2. 担当フォルダで作業
```bash
# 例：Aさんの場合
src/components/auth/
src/services/authService.ts
```

### 3. 共通コンポーネント使用
```vue
<template>
  <BaseButton variant="primary" @click="handleClick">
    ボタンテキスト
  </BaseButton>
  
  <BaseCard :rounded="true">
    カード内容
  </BaseCard>
  
  <BaseInput v-model="inputValue" label="ラベル" type="text" />
  
  <BaseModal v-model:show="showModal" title="タイトル">
    モーダル内容
  </BaseModal>
  
  <BaseTag text="タグテキスト" variant="info" />
</template>

<script setup>
import BaseButton from '../shared/BaseButton.vue';
import BaseCard from '../shared/BaseCard.vue';
import BaseInput from '../shared/BaseInput.vue';
import BaseModal from '../shared/BaseModal.vue';
import BaseTag from '../shared/BaseTag.vue';
</script>
```

### 4. サービス層の活用
```typescript
// 認証サービス
import { AuthService } from '../../services/authService';
const profile = await AuthService.getUserProfile(userId);

// イベントサービス
import { EventService } from '../../services/eventService';
const events = await EventService.getEvents();
const success = await EventService.createEvent(eventData);

// 部活サービス
import { ClubService } from '../../services/clubService';
const club = await ClubService.getClub(clubId);
const success = await ClubService.saveWikiPage(wikiData);

// 通知サービス
import { NotificationService } from '../../services/notificationService';
await NotificationService.sendApplicationNotification(notification);

// UIユーティリティサービス
import { UIService } from '../../services/uiService';
const tags = await UIService.getTagsByCategory();
UIService.showAlert('メッセージ');
```

## ⚠️ 重要なルール

### 触ってはいけないファイル
- 他人の担当フォルダ
- `amplify/`フォルダ全体（Fさん管理）
- `package.json`（Fさん管理）
- `tsconfig.*.json`（Fさん管理）
- `vite.config.ts`（Fさん管理）

### 共有が必要な場合
- 新しい共通コンポーネントが必要
- サービス層の変更が必要
- データベーススキーマの変更が必要

## 🔄 マージ手順

1. 機能完成後、プルリクエスト作成
2. 他メンバーによるコードレビュー
3. 問題なければマージ
4. 全員が最新コードをpull

## 🔧 トラブルシューティング

### ビルドエラーが発生した場合

1. **TypeScriptエラー**: 型安全性を緩和しているため、`any`型を使用して回避可能
2. **インポートエラー**: 相対パスを確認し、正しいパスでインポート
3. **コンポーネントエラー**: 共通コンポーネントのプロパティを確認

### メール通知が動作しない場合

1. **SES設定**: 送信元メールアドレスがSESで検証済みか確認
2. **環境変数**: `FROM_EMAIL`が正しく設定されているか確認
3. **コンソールログ**: ブラウザのコンソールでエラーメッセージを確認

## 📞 サポート

困った時は遠慮なく相談してください！
- コンフリクトが発生した場合
- 共通コンポーネントの使い方がわからない場合
- サービス層の使い方がわからない場合
- ビルドエラーが解決できない場合