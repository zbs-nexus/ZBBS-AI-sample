import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({
  auth,
  data,
  storage
});

// Cognitoの認証ユーザーにSES権限を付与
backend.auth.resources.authenticatedUserIamRole.addToPrincipalPolicy(
  new PolicyStatement({
    actions: ['ses:SendEmail'],
    resources: ['*']
  })
);

// SES設定を出力（フロントエンドで直接SES SDKを使用）
// 注意: 現在SESはサンドボックス環境です。本格運用には以下が必要です：
// 1. AWS SESコンソールで「Request production access」を申請
// 2. 申請が承認されると任意のメールアドレスに送信可能
backend.addOutput({
  custom: {
    sesRegion: 'ap-northeast-1',
    fromEmail: 'hieitom777@gmail.com'
  }
});
