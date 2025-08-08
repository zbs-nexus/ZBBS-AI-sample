import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { generateTagId } from './idGenerator';

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
  { name: 'ドラマ鑑賞', category: '趣味・エンターテイメント', isActive: true },
  { name: 'ライブ参戦', category: '趣味・エンターテイメント', isActive: true },
  { name: 'カラオケ', category: '趣味・エンターテイメント', isActive: true },
  { name: '舞台鑑賞', category: '趣味・エンターテイメント', isActive: true },
  { name: 'ボードゲーム', category: '趣味・エンターテイメント', isActive: true },
  { name: 'カードゲーム', category: '趣味・エンターテイメント', isActive: true },
  { name: 'パズル', category: '趣味・エンターテイメント', isActive: true },
  { name: 'クイズ', category: '趣味・エンターテイメント', isActive: true },
  { name: 'コレクション', category: '趣味・エンターテイメント', isActive: true },
  { name: 'フィギュア', category: '趣味・エンターテイメント', isActive: true },
  { name: 'プラモデル', category: '趣味・エンターテイメント', isActive: true },
  { name: 'コスプレ', category: '趣味・エンターテイメント', isActive: true },
  { name: 'アイドル', category: '趣味・エンターテイメント', isActive: true },
  { name: '声優', category: '趣味・エンターテイメント', isActive: true },
  { name: 'ラジオ', category: '趣味・エンターテイメント', isActive: true },
  { name: 'ポッドキャスト', category: '趣味・エンターテイメント', isActive: true },
  
  // スポーツ・健康
  { name: 'ランニング', category: 'スポーツ・健康', isActive: true },
  { name: 'ヨガ', category: 'スポーツ・健康', isActive: true },
  { name: 'フィットネス', category: 'スポーツ・健康', isActive: true },
  { name: '料理', category: 'スポーツ・健康', isActive: true },
  { name: 'サッカー', category: 'スポーツ・健康', isActive: true },
  { name: '野球', category: 'スポーツ・健康', isActive: true },
  { name: 'バスケットボール', category: 'スポーツ・健康', isActive: true },
  { name: 'テニス', category: 'スポーツ・健康', isActive: true },
  { name: 'バドミントン', category: 'スポーツ・健康', isActive: true },
  { name: '卓球', category: 'スポーツ・健康', isActive: true },
  { name: 'ゴルフ', category: 'スポーツ・健康', isActive: true },
  { name: 'ボウリング', category: 'スポーツ・健康', isActive: true },
  { name: '水泳', category: 'スポーツ・健康', isActive: true },
  { name: 'サイクリング', category: 'スポーツ・健康', isActive: true },
  { name: 'スキー', category: 'スポーツ・健康', isActive: true },
  { name: 'スノーボード', category: 'スポーツ・健康', isActive: true },
  { name: 'サーフィン', category: 'スポーツ・健康', isActive: true },
  { name: 'ダイビング', category: 'スポーツ・健康', isActive: true },
  { name: 'マラソン', category: 'スポーツ・健康', isActive: true },
  { name: 'トライアスロン', category: 'スポーツ・健康', isActive: true },
  { name: 'ボクシング', category: 'スポーツ・健康', isActive: true },
  { name: '空手', category: 'スポーツ・健康', isActive: true },
  { name: '柔道', category: 'スポーツ・健康', isActive: true },
  { name: '剣道', category: 'スポーツ・健康', isActive: true },
  { name: 'ダンス', category: 'スポーツ・健康', isActive: true },
  { name: 'バレエ', category: 'スポーツ・健康', isActive: true },
  { name: 'ピラティス', category: 'スポーツ・健康', isActive: true },
  { name: 'ストレッチ', category: 'スポーツ・健康', isActive: true },
  { name: '筋トレ', category: 'スポーツ・健康', isActive: true },
  { name: 'ウォーキング', category: 'スポーツ・健康', isActive: true },
  { name: 'メディテーション', category: 'スポーツ・健康', isActive: true },
  { name: 'アロマテラピー', category: 'スポーツ・健康', isActive: true },
  { name: 'マッサージ', category: 'スポーツ・健康', isActive: true },
  
  // 学習・教育
  { name: '語学学習', category: '学習・教育', isActive: true },
  { name: '資格取得', category: '学習・教育', isActive: true },
  { name: 'セミナー', category: '学習・教育', isActive: true },
  { name: '勉強会', category: '学習・教育', isActive: true },
  { name: '英会話', category: '学習・教育', isActive: true },
  { name: '中国語', category: '学習・教育', isActive: true },
  { name: '韓国語', category: '学習・教育', isActive: true },
  { name: 'フランス語', category: '学習・教育', isActive: true },
  { name: 'ドイツ語', category: '学習・教育', isActive: true },
  { name: 'スペイン語', category: '学習・教育', isActive: true },
  { name: '日本語教育', category: '学習・教育', isActive: true },
  { name: '数学', category: '学習・教育', isActive: true },
  { name: '物理', category: '学習・教育', isActive: true },
  { name: '化学', category: '学習・教育', isActive: true },
  { name: '生物', category: '学習・教育', isActive: true },
  { name: '歴史', category: '学習・教育', isActive: true },
  { name: '地理', category: '学習・教育', isActive: true },
  { name: '哲学', category: '学習・教育', isActive: true },
  { name: '心理学', category: '学習・教育', isActive: true },
  { name: '経済学', category: '学習・教育', isActive: true },
  { name: '法学', category: '学習・教育', isActive: true },
  { name: '医学', category: '学習・教育', isActive: true },
  { name: 'プレゼンテーション', category: '学習・教育', isActive: true },
  { name: 'ディベート', category: '学習・教育', isActive: true },
  { name: '読書会', category: '学習・教育', isActive: true },
  { name: 'ワークショップ', category: '学習・教育', isActive: true },
  { name: 'メンタリング', category: '学習・教育', isActive: true },
  { name: 'コーチング', category: '学習・教育', isActive: true },
  { name: 'スキルアップ', category: '学習・教育', isActive: true },
  { name: '自己啓発', category: '学習・教育', isActive: true },
  { name: 'キャリアアップ', category: '学習・教育', isActive: true },
  
  // アート・クラフト
  { name: '絵画', category: 'アート・クラフト', isActive: true },
  { name: '書道', category: 'アート・クラフト', isActive: true },
  { name: '陶芸', category: 'アート・クラフト', isActive: true },
  { name: '彫刻', category: 'アート・クラフト', isActive: true },
  { name: '編み物', category: 'アート・クラフト', isActive: true },
  { name: '裁縫', category: 'アート・クラフト', isActive: true },
  { name: '刺繍', category: 'アート・クラフト', isActive: true },
  { name: 'キルト', category: 'アート・クラフト', isActive: true },
  { name: 'レザークラフト', category: 'アート・クラフト', isActive: true },
  { name: 'アクセサリー作り', category: 'アート・クラフト', isActive: true },
  { name: 'キャンドル作り', category: 'アート・クラフト', isActive: true },
  { name: '石鹸作り', category: 'アート・クラフト', isActive: true },
  { name: 'フラワーアレンジメント', category: 'アート・クラフト', isActive: true },
  { name: 'インテリア', category: 'アート・クラフト', isActive: true },
  { name: 'DIY', category: 'アート・クラフト', isActive: true },
  { name: '木工', category: 'アート・クラフト', isActive: true },
  { name: '金属加工', category: 'アート・クラフト', isActive: true },
  { name: 'ガラス工芸', category: 'アート・クラフト', isActive: true },
  { name: 'カリグラフィー', category: 'アート・クラフト', isActive: true },
  { name: 'イラスト', category: 'アート・クラフト', isActive: true },
  
  // 音楽・演奏
  { name: 'ピアノ', category: '音楽・演奏', isActive: true },
  { name: 'ギター', category: '音楽・演奏', isActive: true },
  { name: 'ベース', category: '音楽・演奏', isActive: true },
  { name: 'ドラム', category: '音楽・演奏', isActive: true },
  { name: 'バイオリン', category: '音楽・演奏', isActive: true },
  { name: 'チェロ', category: '音楽・演奏', isActive: true },
  { name: 'フルート', category: '音楽・演奏', isActive: true },
  { name: 'サックス', category: '音楽・演奏', isActive: true },
  { name: 'トランペット', category: '音楽・演奏', isActive: true },
  { name: 'ウクレレ', category: '音楽・演奏', isActive: true },
  { name: 'ハーモニカ', category: '音楽・演奏', isActive: true },
  { name: '歌唱', category: '音楽・演奏', isActive: true },
  { name: 'コーラス', category: '音楽・演奏', isActive: true },
  { name: '作曲', category: '音楽・演奏', isActive: true },
  { name: 'DTM', category: '音楽・演奏', isActive: true },
  { name: 'ミキシング', category: '音楽・演奏', isActive: true },
  { name: 'DJ', category: '音楽・演奏', isActive: true },
  { name: 'バンド', category: '音楽・演奏', isActive: true },
  { name: 'オーケストラ', category: '音楽・演奏', isActive: true },
  { name: 'ジャズ', category: '音楽・演奏', isActive: true },
  { name: 'クラシック', category: '音楽・演奏', isActive: true },
  { name: 'ロック', category: '音楽・演奏', isActive: true },
  { name: 'ポップス', category: '音楽・演奏', isActive: true },
  { name: 'フォーク', category: '音楽・演奏', isActive: true },
  
  // 旅行・アウトドア
  { name: '国内旅行', category: '旅行・アウトドア', isActive: true },
  { name: '海外旅行', category: '旅行・アウトドア', isActive: true },
  { name: 'バックパッカー', category: '旅行・アウトドア', isActive: true },
  { name: '温泉', category: '旅行・アウトドア', isActive: true },
  { name: 'サウナ', category: '旅行・アウトドア', isActive: true },
  { name: 'グルメ旅', category: '旅行・アウトドア', isActive: true },
  { name: '武将巡り', category: '旅行・アウトドア', isActive: true },
  { name: '神社仏閣巡り', category: '旅行・アウトドア', isActive: true },
  { name: '美術館巡り', category: '旅行・アウトドア', isActive: true },
  { name: 'ドライブ', category: '旅行・アウトドア', isActive: true },
  { name: 'ツーリング', category: '旅行・アウトドア', isActive: true },
  { name: '登山', category: '旅行・アウトドア', isActive: true },
  { name: 'トレッキング', category: '旅行・アウトドア', isActive: true },
  { name: 'グランピング', category: '旅行・アウトドア', isActive: true },
  { name: 'BBQ', category: '旅行・アウトドア', isActive: true },
  { name: 'ピクニック', category: '旅行・アウトドア', isActive: true },
  { name: '星空観察', category: '旅行・アウトドア', isActive: true },
  { name: 'バードウォッチング', category: '旅行・アウトドア', isActive: true },
  { name: '植物観察', category: '旅行・アウトドア', isActive: true },
  { name: '写真散歩', category: '旅行・アウトドア', isActive: true },
  { name: 'ジオキャッシング', category: '旅行・アウトドア', isActive: true },
  { name: 'オリエンテーリング', category: '旅行・アウトドア', isActive: true },
];

// カテゴリー一覧（参考）
// - IT・技術
// - デザイン・クリエイティブ
// - ビジネス・マーケティング
// - 趣味・エンターテイメント
// - スポーツ・健康
// - 学習・教育
// - アート・クラフト
// - 音楽・演奏
// - 旅行・アウトドア

let isSeeding = false;

export async function seedTagMaster() {
  // 既に実行中の場合はスキップ
  if (isSeeding) {
    console.log('タグマスタの初期化が既に実行中です');
    return;
  }
  
  isSeeding = true;
  
  try {
    // 既存のタグを取得
    const { data: existingTags } = await client.models.TagMaster.list();
    
    // 既にデータがある場合はスキップ
    if (existingTags.length > 0) {
      console.log(`タグマスタは既に初期化されています（${existingTags.length}件）`);
      isSeeding = false;
      return;
    }

    // 重複を除去したユニークなタグを作成
    console.log('新しいタグデータを作成中...');
    const uniqueTags = initialTags.filter((tag, index, self) => 
      index === self.findIndex(t => t.name === tag.name && t.category === tag.category)
    );
    
    for (const tag of uniqueTags) {
      const customId = await generateTagId(tag.category);
      await client.models.TagMaster.create({
        id: customId,
        ...tag
      });
    }
    
    console.log(`タグマスタの初期化が完了しました（${uniqueTags.length}件）`);
  } catch (error) {
    console.error('タグマスタの初期化エラー:', error);
  } finally {
    isSeeding = false;
  }
}

// 新しいタグを追加する関数
export async function addNewTags() {
  const newTags = [
    // 新しく追加したいタグをここに記述
    { name: '新しい趣味1', category: '趣味・エンターテイメント', isActive: true },
    { name: '新しい趣味2', category: 'スポーツ・健康', isActive: true },
  ];
  
  try {
    for (const tag of newTags) {
      // 既存チェック
      const { data: existing } = await client.models.TagMaster.list({
        filter: { name: { eq: tag.name }, category: { eq: tag.category } }
      });
      
      if (existing.length === 0) {
        const customId = await generateTagId(tag.category);
        await client.models.TagMaster.create({
          id: customId,
          ...tag
        });
        console.log(`新しいタグを追加: ${tag.name}`);
      } else {
        console.log(`タグは既に存在: ${tag.name}`);
      }
    }
    console.log('新しいタグの追加が完了しました');
  } catch (error) {
    console.error('新しいタグ追加エラー:', error);
  }
}