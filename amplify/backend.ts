import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { emailNotification } from './functions/email-notification/resource';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({
  auth,
  data,
  storage,
  emailNotification
});

// Lambda関数にSES権限を付与
backend.emailNotification.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['ses:SendEmail'],
    resources: ['*']
  })
);

// Function URLを追加
const functionUrl = backend.emailNotification.resources.lambda.addFunctionUrl({
  authType: 'NONE' as any,
  cors: {
    allowCredentials: false,
    allowedHeaders: ['Content-Type'],
    allowedMethods: ['POST'] as any,
    allowedOrigins: ['*']
  }
});

// Function URLを出力
backend.addOutput({
  custom: {
    functionUrl: functionUrl.url
  }
});
