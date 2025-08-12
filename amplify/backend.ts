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

// SES権限をLambda関数に追加
backend.clubApplicationNotification.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['ses:SendEmail'],
    resources: ['*']
  })
);
