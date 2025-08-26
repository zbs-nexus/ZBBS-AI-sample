import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { generateTagId } from './idGenerator';

const client = generateClient<Schema>();

// 初期タグデータ（更新版）
const initialTags = [
  // IT・技術系（詳細化）
  { name: 'JavaScript', category: 'IT・技術', isActive: true },
  { name: 'TypeScript', category: 'IT・技術', isActive: true },
  { name: 'Python', category: 'IT・技術', isActive: true },
  { name: 'Java', category: 'IT・技術', isActive: true },
  { name: 'C#', category: 'IT・技術', isActive: true },
  { name: 'C++', category: 'IT・技術', isActive: true },
  { name: 'Go', category: 'IT・技術', isActive: true },
  { name: 'Rust', category: 'IT・技術', isActive: true },
  { name: 'PHP', category: 'IT・技術', isActive: true },
  { name: 'Ruby', category: 'IT・技術', isActive: true },
  { name: 'Swift', category: 'IT・技術', isActive: true },
  { name: 'Kotlin', category: 'IT・技術', isActive: true },
  { name: 'React', category: 'IT・技術', isActive: true },
  { name: 'Vue.js', category: 'IT・技術', isActive: true },
  { name: 'Angular', category: 'IT・技術', isActive: true },
  { name: 'Node.js', category: 'IT・技術', isActive: true },
  { name: 'Flutter', category: 'IT・技術', isActive: true },
  { name: 'React Native', category: 'IT・技術', isActive: true },
  { name: 'AWS', category: 'IT・技術', isActive: true },
  { name: 'Azure', category: 'IT・技術', isActive: true },
  { name: 'GCP', category: 'IT・技術', isActive: true },
  { name: 'Docker', category: 'IT・技術', isActive: true },
  { name: 'Kubernetes', category: 'IT・技術', isActive: true },
  { name: 'AI・機械学習', category: 'IT・技術', isActive: true },
  { name: 'データサイエンス', category: 'IT・技術', isActive: true },
  { name: 'ブロックチェーン', category: 'IT・技術', isActive: true },
  { name: 'IoT', category: 'IT・技術', isActive: true },
  { name: 'サイバーセキュリティ', category: 'IT・技術', isActive: true },
  { name: 'DevOps', category: 'IT・技術', isActive: true },
  { name: 'データベース設計', category: 'IT・技術', isActive: true },
  { name: 'システム設計', category: 'IT・技術', isActive: true },
  { name: 'ネットワーク', category: 'IT・技術', isActive: true },
  { name: 'Linux', category: 'IT・技術', isActive: true },
  { name: 'Windows', category: 'IT・技術', isActive: true },
  { name: 'macOS', category: 'IT・技術', isActive: true },
  { name: 'Git', category: 'IT・技術', isActive: true },
  { name: 'GitHub', category: 'IT・技術', isActive: true },
  { name: 'SQL', category: 'IT・技術', isActive: true },
  { name: 'NoSQL', category: 'IT・技術', isActive: true },
  { name: 'MongoDB', category: 'IT・技術', isActive: true },
  { name: 'PostgreSQL', category: 'IT・技術', isActive: true },
  { name: 'MySQL', category: 'IT・技術', isActive: true },
  { name: 'Redis', category: 'IT・技術', isActive: true },
  { name: 'Elasticsearch', category: 'IT・技術', isActive: true },
  { name: 'Apache', category: 'IT・技術', isActive: true },
  { name: 'Nginx', category: 'IT・技術', isActive: true },
  { name: 'Jenkins', category: 'IT・技術', isActive: true },
  { name: 'Terraform', category: 'IT・技術', isActive: true },
  { name: 'Ansible', category: 'IT・技術', isActive: true },
  { name: 'Prometheus', category: 'IT・技術', isActive: true },
  { name: 'Grafana', category: 'IT・技術', isActive: true },
  
  // エンターテイメント（旧：趣味・エンターテイメント）
  { name: '読書', category: 'エンターテイメント', isActive: true },
  { name: '映画鑑賞', category: 'エンターテイメント', isActive: true },
  { name: '音楽鑑賞', category: 'エンターテイメント', isActive: true },
  { name: '写真撮影', category: 'エンターテイメント', isActive: true },
  { name: 'PCゲーム', category: 'エンターテイメント', isActive: true },
  { name: 'コンシューマーゲーム', category: 'エンターテイメント', isActive: true },
  { name: 'スマホゲーム', category: 'エンターテイメント', isActive: true },
  { name: 'eスポーツ', category: 'エンターテイメント', isActive: true },
  { name: 'アニメ', category: 'エンターテイメント', isActive: true },
  { name: '漫画', category: 'エンターテイメント', isActive: true },
  { name: 'ライトノベル', category: 'エンターテイメント', isActive: true },
  { name: 'ドラマ鑑賞', category: 'エンターテイメント', isActive: true },
  { name: 'Netflix', category: 'エンターテイメント', isActive: true },
  { name: 'YouTube', category: 'エンターテイメント', isActive: true },
  { name: 'ライブ参戦', category: 'エンターテイメント', isActive: true },
  { name: 'カラオケ', category: 'エンターテイメント', isActive: true },
  { name: '舞台鑑賞', category: 'エンターテイメント', isActive: true },
  { name: 'ボードゲーム', category: 'エンターテイメント', isActive: true },
  { name: 'カードゲーム', category: 'エンターテイメント', isActive: true },
  { name: 'TRPG', category: 'エンターテイメント', isActive: true },
  { name: 'パズル', category: 'エンターテイメント', isActive: true },
  { name: 'クイズ', category: 'エンターテイメント', isActive: true },
  { name: 'コレクション', category: 'エンターテイメント', isActive: true },
  { name: 'フィギュア', category: 'エンターテイメント', isActive: true },
  { name: 'プラモデル', category: 'エンターテイメント', isActive: true },
  { name: 'ガンプラ', category: 'エンターテイメント', isActive: true },
  { name: 'コスプレ', category: 'エンターテイメント', isActive: true },
  { name: 'アイドル', category: 'エンターテイメント', isActive: true },
  { name: 'K-POP', category: 'エンターテイメント', isActive: true },
  { name: 'J-POP', category: 'エンターテイメント', isActive: true },
  { name: '声優', category: 'エンターテイメント', isActive: true },
  { name: 'ラジオ', category: 'エンターテイメント', isActive: true },
  { name: 'ポッドキャスト', category: 'エンターテイメント', isActive: true },
  { name: 'VTuber', category: 'エンターテイメント', isActive: true },
  { name: 'ストリーミング', category: 'エンターテイメント', isActive: true },
  { name: 'ゲーム実況', category: 'エンターテイメント', isActive: true },
  { name: 'ゲーム配信', category: 'エンターテイメント', isActive: true },
  { name: 'レトロゲーム', category: 'エンターテイメント', isActive: true },
  { name: 'インディーゲーム', category: 'エンターテイメント', isActive: true },
  { name: 'MMO', category: 'エンターテイメント', isActive: true },
  { name: 'FPS', category: 'エンターテイメント', isActive: true },
  { name: 'RPG', category: 'エンターテイメント', isActive: true },
  { name: 'シミュレーションゲーム', category: 'エンターテイメント', isActive: true },
  { name: 'ホラー映画', category: 'エンターテイメント', isActive: true },
  { name: 'SF映画', category: 'エンターテイメント', isActive: true },
  { name: 'アクション映画', category: 'エンターテイメント', isActive: true },
  { name: 'コメディ映画', category: 'エンターテイメント', isActive: true },
  { name: 'ドキュメンタリー', category: 'エンターテイメント', isActive: true },
  { name: '海外ドラマ', category: 'エンターテイメント', isActive: true },
  { name: '韓国ドラマ', category: 'エンターテイメント', isActive: true },
  { name: '中国ドラマ', category: 'エンターテイメント', isActive: true },
  { name: 'タイドラマ', category: 'エンターテイメント', isActive: true },
  { name: 'ミュージカル', category: 'エンターテイメント', isActive: true },
  { name: 'オペラ', category: 'エンターテイメント', isActive: true },
  { name: '落語', category: 'エンターテイメント', isActive: true },
  { name: '演芸', category: 'エンターテイメント', isActive: true },
  
  // スポーツ・健康
  { name: 'ランニング', category: 'スポーツ・健康', isActive: true },
  { name: 'ヨガ', category: 'スポーツ・健康', isActive: true },
  { name: 'フィットネス', category: 'スポーツ・健康', isActive: true },
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
  { name: 'クライミング', category: 'スポーツ・健康', isActive: true },
  { name: 'ボルダリング', category: 'スポーツ・健康', isActive: true },
  { name: 'フットサル', category: 'スポーツ・健康', isActive: true },
  { name: 'バレーボール', category: 'スポーツ・健康', isActive: true },
  { name: 'ハンドボール', category: 'スポーツ・健康', isActive: true },
  { name: 'ラグビー', category: 'スポーツ・健康', isActive: true },
  { name: 'アメフト', category: 'スポーツ・健康', isActive: true },
  { name: 'ホッケー', category: 'スポーツ・健康', isActive: true },
  { name: 'アイスホッケー', category: 'スポーツ・健康', isActive: true },
  { name: 'フィギュアスケート', category: 'スポーツ・健康', isActive: true },
  { name: 'スケートボード', category: 'スポーツ・健康', isActive: true },
  { name: 'ローラースケート', category: 'スポーツ・健康', isActive: true },
  { name: 'アーチェリー', category: 'スポーツ・健康', isActive: true },
  { name: 'フェンシング', category: 'スポーツ・健康', isActive: true },
  { name: 'ライフル射撃', category: 'スポーツ・健康', isActive: true },
  { name: 'パラグライダー', category: 'スポーツ・健康', isActive: true },
  { name: 'ハンググライダー', category: 'スポーツ・健康', isActive: true },
  { name: 'スカイダイビング', category: 'スポーツ・健康', isActive: true },
  { name: 'バンジージャンプ', category: 'スポーツ・健康', isActive: true },
  { name: 'カヤック', category: 'スポーツ・健康', isActive: true },
  { name: 'カヌー', category: 'スポーツ・健康', isActive: true },
  { name: 'セーリング', category: 'スポーツ・健康', isActive: true },
  { name: 'ウインドサーフィン', category: 'スポーツ・健康', isActive: true },
  { name: 'キックボクシング', category: 'スポーツ・健康', isActive: true },
  { name: '総合格闘技', category: 'スポーツ・健康', isActive: true },
  { name: 'ブラジリアン柔術', category: 'スポーツ・健康', isActive: true },
  { name: 'ムエタイ', category: 'スポーツ・健康', isActive: true },
  { name: 'カポエイラ', category: 'スポーツ・健康', isActive: true },
  { name: 'スパ', category: 'スポーツ・健康', isActive: true },
  
  // 料理・グルメ
  { name: '料理', category: '料理・グルメ', isActive: true },
  { name: 'お菓子作り', category: '料理・グルメ', isActive: true },
  { name: 'パン作り', category: '料理・グルメ', isActive: true },
  { name: 'ワイン', category: '料理・グルメ', isActive: true },
  { name: '日本酒', category: '料理・グルメ', isActive: true },
  { name: 'ビール', category: '料理・グルメ', isActive: true },
  { name: 'コーヒー', category: '料理・グルメ', isActive: true },
  { name: '紅茶', category: '料理・グルメ', isActive: true },
  { name: '食べ歩き', category: '料理・グルメ', isActive: true },
  { name: 'ラーメン', category: '料理・グルメ', isActive: true },
  { name: 'カフェ巡り', category: '料理・グルメ', isActive: true },
  { name: 'スイーツ', category: '料理・グルメ', isActive: true },
  { name: 'バーベキュー', category: '料理・グルメ', isActive: true },
  { name: '居酒屋', category: '料理・グルメ', isActive: true },
  { name: 'イタリア料理', category: '料理・グルメ', isActive: true },
  { name: 'フランス料理', category: '料理・グルメ', isActive: true },
  { name: '中華料理', category: '料理・グルメ', isActive: true },
  { name: '韓国料理', category: '料理・グルメ', isActive: true },
  { name: 'タイ料理', category: '料理・グルメ', isActive: true },
  { name: 'インド料理', category: '料理・グルメ', isActive: true },
  { name: 'メキシコ料理', category: '料理・グルメ', isActive: true },
  { name: 'スペイン料理', category: '料理・グルメ', isActive: true },
  { name: '和食', category: '料理・グルメ', isActive: true },
  { name: '寿司', category: '料理・グルメ', isActive: true },
  { name: 'そば', category: '料理・グルメ', isActive: true },
  { name: 'うどん', category: '料理・グルメ', isActive: true },
  { name: '焼き肉', category: '料理・グルメ', isActive: true },
  { name: '焼き鳥', category: '料理・グルメ', isActive: true },
  { name: 'お好み焼き', category: '料理・グルメ', isActive: true },
  { name: 'たこ焼き', category: '料理・グルメ', isActive: true },
  { name: 'カレー', category: '料理・グルメ', isActive: true },
  { name: 'パスタ', category: '料理・グルメ', isActive: true },
  { name: 'ピザ', category: '料理・グルメ', isActive: true },
  { name: 'ハンバーガー', category: '料理・グルメ', isActive: true },
  { name: 'サンドイッチ', category: '料理・グルメ', isActive: true },
  { name: 'サラダ', category: '料理・グルメ', isActive: true },
  { name: 'スープ', category: '料理・グルメ', isActive: true },
  { name: 'デザート', category: '料理・グルメ', isActive: true },
  { name: 'アイスクリーム', category: '料理・グルメ', isActive: true },
  { name: 'チョコレート', category: '料理・グルメ', isActive: true },
  { name: 'ケーキ', category: '料理・グルメ', isActive: true },
  { name: 'クッキー', category: '料理・グルメ', isActive: true },
  { name: 'パンケーキ', category: '料理・グルメ', isActive: true },
  
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

  { name: 'ワークショップ', category: '学習・教育', isActive: true },
  { name: 'メンタリング', category: '学習・教育', isActive: true },
  { name: 'コーチング', category: '学習・教育', isActive: true },
  { name: 'スキルアップ', category: '学習・教育', isActive: true },
  { name: '自己啓発', category: '学習・教育', isActive: true },
  { name: 'キャリアアップ', category: '学習・教育', isActive: true },
  { name: 'イタリア語', category: '学習・教育', isActive: true },
  { name: 'ポルトガル語', category: '学習・教育', isActive: true },
  { name: 'ロシア語', category: '学習・教育', isActive: true },
  { name: 'アラビア語', category: '学習・教育', isActive: true },
  { name: 'タイ語', category: '学習・教育', isActive: true },
  { name: 'ベトナム語', category: '学習・教育', isActive: true },
  { name: 'インドネシア語', category: '学習・教育', isActive: true },
  { name: '統計学', category: '学習・教育', isActive: true },
  { name: '会計学', category: '学習・教育', isActive: true },
  { name: '経営学', category: '学習・教育', isActive: true },
  { name: '社会学', category: '学習・教育', isActive: true },
  { name: '政治学', category: '学習・教育', isActive: true },
  { name: '国際関係学', category: '学習・教育', isActive: true },
  { name: '文学', category: '学習・教育', isActive: true },
  { name: '言語学', category: '学習・教育', isActive: true },
  { name: '人類学', category: '学習・教育', isActive: true },
  { name: '考古学', category: '学習・教育', isActive: true },
  { name: '天文学', category: '学習・教育', isActive: true },
  { name: '地質学', category: '学習・教育', isActive: true },
  { name: '環境学', category: '学習・教育', isActive: true },
  { name: '教育学', category: '学習・教育', isActive: true },
  { name: 'コミュニケーション', category: '学習・教育', isActive: true },
  { name: 'リーダーシップ', category: '学習・教育', isActive: true },
  { name: 'マネジメント', category: '学習・教育', isActive: true },
  { name: 'ファシリテーション', category: '学習・教育', isActive: true },
  { name: 'ネゴシエーション', category: '学習・教育', isActive: true },
  { name: 'タイムマネジメント', category: '学習・教育', isActive: true },
  
  // アート・クラフト（デザイン・クリエイティブを統合）
  { name: 'Webデザイン', category: 'アート・クラフト', isActive: true },
  { name: 'グラフィックデザイン', category: 'アート・クラフト', isActive: true },
  { name: 'UI/UXデザイン', category: 'アート・クラフト', isActive: true },
  { name: '動画編集', category: 'アート・クラフト', isActive: true },

  { name: 'フォトレタッチ', category: 'アート・クラフト', isActive: true },
  { name: '絵画', category: 'アート・クラフト', isActive: true },
  { name: 'イラスト', category: 'アート・クラフト', isActive: true },
  { name: 'デジタルアート', category: 'アート・クラフト', isActive: true },
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
  { name: '3Dプリンター', category: 'アート・クラフト', isActive: true },
  { name: '油絵', category: 'アート・クラフト', isActive: true },
  { name: '水彩画', category: 'アート・クラフト', isActive: true },
  { name: 'アクリル画', category: 'アート・クラフト', isActive: true },
  { name: 'パステル画', category: 'アート・クラフト', isActive: true },
  { name: '銅版画', category: 'アート・クラフト', isActive: true },
  { name: '版画', category: 'アート・クラフト', isActive: true },
  { name: 'スケッチ', category: 'アート・クラフト', isActive: true },
  { name: 'デッサン', category: 'アート・クラフト', isActive: true },
  { name: 'マンガイラスト', category: 'アート・クラフト', isActive: true },
  { name: 'キャラクターデザイン', category: 'アート・クラフト', isActive: true },
  { name: 'ロゴデザイン', category: 'アート・クラフト', isActive: true },
  { name: 'ポスターデザイン', category: 'アート・クラフト', isActive: true },
  { name: 'パッケージデザイン', category: 'アート・クラフト', isActive: true },
  { name: 'タイポグラフィ', category: 'アート・クラフト', isActive: true },
  { name: 'フォトショップ', category: 'アート・クラフト', isActive: true },
  { name: 'イラストレーター', category: 'アート・クラフト', isActive: true },
  { name: 'アニメーション', category: 'アート・クラフト', isActive: true },
  { name: '3DCG', category: 'アート・クラフト', isActive: true },
  { name: 'VFX', category: 'アート・クラフト', isActive: true },
  { name: 'モーショングラフィックス', category: 'アート・クラフト', isActive: true },
  { name: '織物', category: 'アート・クラフト', isActive: true },
  { name: '染物', category: 'アート・クラフト', isActive: true },
  { name: 'ビーズアクセサリー', category: 'アート・クラフト', isActive: true },
  { name: 'シルバーアクセサリー', category: 'アート・クラフト', isActive: true },
  { name: 'レジンアート', category: 'アート・クラフト', isActive: true },
  { name: 'ポーセラーツ', category: 'アート・クラフト', isActive: true },
  { name: 'ミニチュア', category: 'アート・クラフト', isActive: true },
  { name: 'ドールハウス', category: 'アート・クラフト', isActive: true },
  
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
  { name: 'レゲエ', category: '音楽・演奏', isActive: true },
  { name: 'ヒップホップ', category: '音楽・演奏', isActive: true },
  
  // 旅行・アウトドア
  { name: '国内旅行', category: '旅行・アウトドア', isActive: true },
  { name: '海外旅行', category: '旅行・アウトドア', isActive: true },
  { name: 'バックパッカー', category: '旅行・アウトドア', isActive: true },
  { name: '温泉', category: '旅行・アウトドア', isActive: true },
  { name: 'グルメ旅', category: '旅行・アウトドア', isActive: true },
  { name: '武将巡り', category: '旅行・アウトドア', isActive: true },
  { name: '神社仏閣巡り', category: '旅行・アウトドア', isActive: true },
  { name: '美術館巡り', category: '旅行・アウトドア', isActive: true },
  { name: 'ドライブ', category: '旅行・アウトドア', isActive: true },
  { name: 'ツーリング', category: '旅行・アウトドア', isActive: true },
  { name: '登山', category: '旅行・アウトドア', isActive: true },
  { name: 'トレッキング', category: '旅行・アウトドア', isActive: true },
  { name: 'キャンプ', category: '旅行・アウトドア', isActive: true },
  { name: 'グランピング', category: '旅行・アウトドア', isActive: true },
  { name: 'ピクニック', category: '旅行・アウトドア', isActive: true },
  { name: '星空観察', category: '旅行・アウトドア', isActive: true },
  { name: 'バードウォッチング', category: '旅行・アウトドア', isActive: true },
  { name: '植物観察', category: '旅行・アウトドア', isActive: true },
  { name: '写真散歩', category: '旅行・アウトドア', isActive: true },
  { name: 'ジオキャッシング', category: '旅行・アウトドア', isActive: true },
  { name: 'オリエンテーリング', category: '旅行・アウトドア', isActive: true },
  { name: '釣り', category: '旅行・アウトドア', isActive: true },
  { name: 'ハイキング', category: '旅行・アウトドア', isActive: true },
];

// カテゴリー一覧（更新版）
// - IT・技術
// - エンターテイメント
// - スポーツ・健康
// - 料理・グルメ
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
    { name: '新しい趣味1', category: 'エンターテイメント', isActive: true },
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