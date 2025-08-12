import { defineFunction } from '@aws-amplify/backend';

export const clubApplicationNotification = defineFunction({
  name: 'club-application-notification',
  entry: './handler.ts',
  environment: {
    FROM_EMAIL: 'noreply@your-domain.com'
  }
});