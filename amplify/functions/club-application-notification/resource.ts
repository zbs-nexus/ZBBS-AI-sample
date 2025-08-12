import { defineFunction } from '@aws-amplify/backend';

export const clubApplicationNotification = defineFunction({
  name: 'club-application-notification',
  entry: './handler.ts',
  environment: {
    FROM_EMAIL: 'noreply@your-domain.com'
  }
});

// Function URLを有効化
clubApplicationNotification.addFunctionUrl({
  authType: 'NONE',
  cors: {
    allowCredentials: false,
    allowHeaders: ['Content-Type'],
    allowMethods: ['POST'],
    allowOrigins: ['*']
  }
});