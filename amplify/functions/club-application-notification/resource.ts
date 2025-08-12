import { defineFunction } from '@aws-amplify/backend';

export const clubApplicationNotification = defineFunction({
  name: 'club-application-notification',
  entry: './handler.ts',
  environment: {
    FROM_EMAIL: 'hiei-tom@z-bs.co.jp'
  }
});