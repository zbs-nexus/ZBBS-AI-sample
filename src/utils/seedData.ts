import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

// 初期タグデータ（更新版）
const initialTags = [
  // IT・技術系
  { name: 'プログラミング', category: 'IT・技術', isActive: true },
  { name: 'Web開発', category: 'IT・技術', isActive: true },
  { name: 'モバイルアプリ', category: 'IT・技術', isActive: true },
  { name: 'AI・機械学習', category: 'IT・技術', isActive: true },
  { name: 'データベース', category: 'IT・技術', isActive: true },
  { name: 'セキュリティ', category: 'IT・技術', isActive: true },
  { name: 'クラウド', category: 'IT・技術', isActive: true },
  
  // デザイン・クリエイティブ
  { name: 'Webデザイン', category: 'デザイン・クリエイティブ', isActive: true },
  { name: 'グラフィックデザイン', category: 'デザイン・クリエイティブ', isActive: true },
  { name: 'UI/UXデザイン', category: 'デザイン・クリエイティブ', isActive: true },
  { name: '動画編集', category: 'デザイン・クリエイティブ', isActive: true },
  { name: '写真', category: 'デザイン・クリエイティブ', isActive: true },
  
  // ビジネス・マーケティング
  { name: 'マーケティング', category: 'ビジネス・マーケティング', isActive: true },
  { name: '営業', category: 'ビジネス・マーケティング', isActive: true },
  { name: '企画', category: 'ビジネス・マーケティング', isActive: true },
  { name: 'データ分析', category: 'ビジネス・マーケティング', isActive: true },
  
  // 趣味・エンターテイメント
  { name: '読書', category: '趣味・エンターテイメント', isActive: true },
  { name: '映画鑑賞', category: '趣味・エンターテイメント', isActive: true },
  { name: '音楽鑑賞', category: '趣味・エンターテイメント', isActive: true },
  { name: 'ゲーム', category: '趣味・エンターテイメント', isActive: true },
  { name: 'アニメ', category: '趣味・エンターテイメント', isActive: true },
  { name: '漫画', category: '趣味・エンターテイメント', isActive: true },
  
  // スポーツ・健康
  { name: 'ランニング', category: 'スポーツ・健康', isActive: true },
  { name: 'ヨガ', category: 'スポーツ・健康', isActive: true },
  { name: 'フィットネス', category: 'スポーツ・健康', isActive: true },
  { name: '料理', category: 'スポーツ・健康', isActive: true },
  { name: 'サッカー', category: 'スポーツ・健康', isActive: true },
  { name: '野球', category: 'スポーツ・健康', isActive: true },
  { name: 'ゴルフ', category: 'スポーツ・健康', isActive: true },
  
  // 学習・教育
  { name: '語学学習', category: '学習・教育', isActive: true },
  { name: '資格取得', category: '学習・教育', isActive: true },
  { name: 'セミナー', category: '学習・教育', isActive: true },
  { name: '勉強会', category: '学習・教育', isActive: true },
  
  // 旅行・アウトドア
  { name: '国内旅行', category: '旅行・アウトドア', isActive: true },
  { name: '海外旅行', category: '旅行・アウトドア', isActive: true },
  { name: 'キャンプ', category: '旅行・アウトドア', isActive: true },
  { name: '釣り', category: '旅行・アウトドア', isActive: true },
];

// 部活/同好会の初期データ
const initialClubs = [
  { name: '釣り部', description: '釣りを楽しむ部活です', isActive: true },
  { name: 'ゴルフ部', description: 'ゴルフを楽しむ部活です', isActive: true },
  { name: '野球部', description: '野球を楽しむ部活です', isActive: true },
];

let isSeeding = false;

export async function seedTagMaster() {
  if (isSeeding) {
    console.log('タグマスタの初期化が既に実行中です');
    return;
  }
  
  isSeeding = true;
  
  try {
    const { data: existingTags } = await client.models.TagMaster.list();
    
    if (existingTags.length > 0) {
      console.log(`タグマスタは既に初期化されています（${existingTags.length}件）`);
      isSeeding = false;
      return;
    }

    console.log('新しいタグデータを作成中...');
    const uniqueTags = initialTags.filter((tag, index, self) => 
      index === self.findIndex(t => t.name === tag.name && t.category === tag.category)
    );
    
    for (const tag of uniqueTags) {
      await client.models.TagMaster.create(tag);
    }
    
    console.log(`タグマスタの初期化が完了しました（${uniqueTags.length}件）`);
  } catch (error) {
    console.error('タグマスタの初期化エラー:', error);
  } finally {
    isSeeding = false;
  }
}

export async function seedClubMaster() {
  try {
    const { data: existingClubs } = await client.models.ClubMaster.list();
    
    if (existingClubs.length === 0) {
      console.log('部活マスタにシードデータを投入中...');
      
      for (const club of initialClubs) {
        await client.models.ClubMaster.create(club);
      }
      
      console.log('部活マスタのシードデータ投入完了');
    } else {
      console.log('部活マスタは既にデータが存在します');
    }
  } catch (error) {
    console.error('部活マスタのシードデータ投入エラー:', error);
  }
}