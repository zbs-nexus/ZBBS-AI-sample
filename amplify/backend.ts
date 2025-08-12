import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { clubApplicationNotification } from './functions/club-application-notification/resource';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({
  auth,
  data,
  storage,
  clubApplicationNotification
});

// Function URLを追加
const functionUrl = backend.clubApplicationNotification.resources.lambda.addFunctionUrl({
  authType: 'NONE',
  cors: {
    allowCredentials: false,
    allowHeaders: ['Content-Type'],
    allowMethods: ['POST'],
    allowOrigins: ['*']
  }
});

// SES権限をLambda関数に追加
backend.clubApplicationNotification.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['ses:SendEmail'],
    resources: ['*']
  })
);

// Function URLを出力
backend.addOutput({
  custom: {
    functionUrl: functionUrl.url
  }
});
