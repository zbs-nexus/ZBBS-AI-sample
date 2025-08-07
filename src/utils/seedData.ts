import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

// 初期タグデータ
const initialTags = [
  // イベント用タグ
  { name: 'プログラミング', category: 'event', isActive: true },
  { name: 'デザイン', category: 'event', isActive: true },
  { name: 'ゲーム開発', category: 'event', isActive: true },
  { name: 'AI・機械学習', category: 'event', isActive: true },
  { name: 'Web開発', category: 'event', isActive: true },
  { name: 'モバイルアプリ', category: 'event', isActive: true },
  { name: 'データベース', category: 'event', isActive: true },
  { name: 'セキュリティ', category: 'event', isActive: true },
  { name: 'クラウド', category: 'event', isActive: true },
  { name: 'ネットワーク', category: 'event', isActive: true },

  // 趣味用タグ
  { name: '読書', category: 'hobby', isActive: true },
  { name: '映画鑑賞', category: 'hobby', isActive: true },
  { name: '音楽', category: 'hobby', isActive: true },
  { name: '料理', category: 'hobby', isActive: true },
  { name: '旅行', category: 'hobby', isActive: true },
  { name: 'スポーツ', category: 'hobby', isActive: true },
  { name: '写真', category: 'hobby', isActive: true },
  { name: 'アニメ', category: 'hobby', isActive: true },
  { name: 'ゲーム', category: 'hobby', isActive: true },
  { name: 'アート', category: 'hobby', isActive: true },
];

export async function seedTagMaster() {
  try {
    // 既存のタグをチェック
    const { data: existingTags } = await client.models.TagMaster.list();
    
    if (existingTags.length > 0) {
      console.log('タグマスタは既に初期化されています');
      return;
    }

    // 初期タグを作成
    for (const tag of initialTags) {
      await client.models.TagMaster.create(tag);
    }
    
    console.log('タグマスタの初期化が完了しました');
  } catch (error) {
    console.error('タグマスタの初期化エラー:', error);
  }
}