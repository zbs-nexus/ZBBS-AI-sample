import { defineFunction } from '@aws-amplify/backend';

export const emailNotification = defineFunction({
  name: 'email-notification',
  environment: {
    FROM_EMAIL: 'hieitom777@gmail.com'
  }
});