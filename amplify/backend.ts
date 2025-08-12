import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { clubApplicationNotification } from './functions/club-application-notification/resource';

const backend = defineBackend({
  auth,
  data,
  storage,
  clubApplicationNotification
});

// SNSトピック作成とLambda関数にSNS権限を付与
backend.clubApplicationNotification.addEnvironment('SNS_TOPIC_ARN', 'arn:aws:sns:ap-northeast-1:YOUR_ACCOUNT_ID:club-application-notifications');
backend.clubApplicationNotification.addToRolePolicy({
  Effect: 'Allow',
  Action: ['sns:Publish'],
  Resource: 'arn:aws:sns:ap-northeast-1:YOUR_ACCOUNT_ID:club-application-notifications'
});
