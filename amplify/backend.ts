import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';

const backend = defineBackend({
  auth,
  data,
  storage
});

// SES設定を出力（フロントエンドで直接SES SDKを使用）
backend.addOutput({
  custom: {
    sesRegion: 'ap-northeast-1',
    fromEmail: 'hiei-tom@z-bs.co.jp'
  }
});
