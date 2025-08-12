import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

// カテゴリ略称マッピング
const categoryAbbreviations: { [key: string]: string } = {
  'IT・技術': 'IT',
  'デザイン・クリエイティブ': 'DS',
  'ビジネス・マーケティング': 'BZ',
  '趣味・エンターテイメント': 'EN',
  'スポーツ・健康': 'SP',
  '学習・教育': 'ED',
  'アート・クラフト': 'AR',
  '音楽・演奏': 'MU',
  '旅行・アウトドア': 'TR'
};

// カウンターを取得・更新する関数
async function getNextCounter(type: string): Promise<number> {
  try {
    // 既存のカウンターを取得
    const { data: counters } = await client.models.Counter.list({
      filter: { type: { eq: type } }
    });
    
    if (counters.length > 0) {
      // 既存のカウンターを更新
      const counter = counters[0];
      const nextValue = (counter.currentValue || 0) + 1;
      
      await client.models.Counter.update({
        id: counter.id,
        currentValue: nextValue
      });
      
      return nextValue;
    } else {
      // 新しいカウンターを作成
      const { data: newCounter } = await client.models.Counter.create({
        type,
        currentValue: 1
      });
      
      return 1;
    }
  } catch (error) {
    console.error('カウンター取得エラー:', error);
    // エラー時はタイムスタンプベースのフォールバック
    return Date.now() % 10000;
  }
}

// イベントID生成: EVT-{YYYYMMDD}-{連番4桁}
export async function generateEventId(): Promise<string> {
  const today = new Date();
  const dateStr = today.getFullYear().toString() + 
                  (today.getMonth() + 1).toString().padStart(2, '0') + 
                  today.getDate().toString().padStart(2, '0');
  
  const counter = await getNextCounter(`EVENT_${dateStr}`);
  const sequence = counter.toString().padStart(4, '0');
  
  return `EVT-${dateStr}-${sequence}`;
}

// イベント参加ID生成: PRT-{連番8桁}
export async function generateParticipantId(): Promise<string> {
  const counter = await getNextCounter('PARTICIPANT');
  const sequence = counter.toString().padStart(8, '0');
  
  return `PRT-${sequence}`;
}

// タグマスタID生成: TAG-{カテゴリ略称}-{連番3桁}
export async function generateTagId(category: string): Promise<string> {
  const abbr = categoryAbbreviations[category] || 'OT';
  const counter = await getNextCounter(`TAG_${abbr}`);
  const sequence = counter.toString().padStart(3, '0');
  
  return `TAG-${abbr}-${sequence}`;
}

// ユーザープロフィールID生成: USR-{YYYYMM}-{連番4桁}
export async function generateUserProfileId(): Promise<string> {
  const today = new Date();
  const monthStr = today.getFullYear().toString() + 
                   (today.getMonth() + 1).toString().padStart(2, '0');
  
  const counter = await getNextCounter(`USER_${monthStr}`);
  const sequence = counter.toString().padStart(4, '0');
  
  return `USR-${monthStr}-${sequence}`;
}

// 部活動ID生成: CLB-{連番4桁}
export async function generateClubId(): Promise<string> {
  const counter = await getNextCounter('CLUB');
  const sequence = counter.toString().padStart(4, '0');
  
  return `CLB-${sequence}`;
}

// WikiページID生成: WKI-{連番6桁}
export async function generateWikiId(): Promise<string> {
  const counter = await getNextCounter('WIKI');
  const sequence = counter.toString().padStart(6, '0');
  
  return `WKI-${sequence}`;
}