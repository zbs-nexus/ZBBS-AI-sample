# チーム開発ガイド

## 📁 新しいファイル構成

```
src/
├── components/
│   ├── auth/              # Aさん担当：認証関連
│   ├── events/            # Bさん担当：イベント関連
│   ├── clubs/             # Cさん担当：部活・Wiki関連
│   │   ├── WikiPage.vue
│   │   └── ClubApplications.vue
│   ├── notifications/     # Dさん担当：通知関連
│   └── shared/            # Eさん担当：共通UI
│       ├── BaseButton.vue
│       └── BaseCard.vue
├── services/              # ビジネスロジック層
│   ├── authService.ts     # 認証サービス
│   ├── clubService.ts     # 部活サービス
│   └── notificationService.ts # 通知サービス
└── styles/
    └── common.css         # 共通スタイル
```

## 🔧 リファクタリング内容

### 1. サービス層の分離
- ビジネスロジックをコンポーネントから分離
- 各担当者が独立して作業可能
- テストしやすい構造

### 2. 共通コンポーネント化
- `BaseButton.vue`: 統一されたボタンコンポーネント
- `BaseCard.vue`: 統一されたカードコンポーネント
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
</template>

<script setup>
import BaseButton from '../shared/BaseButton.vue';
import BaseCard from '../shared/BaseCard.vue';
</script>
```

### 4. サービス層の活用
```typescript
import { ClubService } from '../../services/clubService';

// 部活情報取得
const club = await ClubService.getClub(clubId);

// Wiki保存
const success = await ClubService.saveWikiPage(wikiData);
```

## ⚠️ 重要なルール

### 触ってはいけないファイル
- 他人の担当フォルダ
- `amplify/data/resource.ts`（Fさん管理）
- `package.json`（Fさん管理）

### 共有が必要な場合
- 新しい共通コンポーネントが必要
- サービス層の変更が必要
- データベーススキーマの変更が必要

## 🔄 マージ手順

1. 機能完成後、プルリクエスト作成
2. 他メンバーによるコードレビュー
3. 問題なければマージ
4. 全員が最新コードをpull

## 📞 サポート

困った時は遠慮なく相談してください！
- コンフリクトが発生した場合
- 共通コンポーネントの使い方がわからない場合
- サービス層の使い方がわからない場合