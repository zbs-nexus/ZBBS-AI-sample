import { defineFunction } from '@aws-amplify/backend';

export const clubApplicationNotification = defineFunction({
  name: 'club-application-notification',
  entry: './handler.ts'
});