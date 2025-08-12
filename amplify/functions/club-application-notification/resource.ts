import { defineFunction } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

export const clubApplicationNotification = defineFunction({
  name: 'club-application-notification',
  entry: './handler.ts',
  environment: {
    FROM_EMAIL: 'noreply@your-domain.com'
  }
});

// SES権限を追加
clubApplicationNotification.addToRolePolicy(
  new PolicyStatement({
    actions: ['ses:SendEmail'],
    resources: ['*']
  })
);