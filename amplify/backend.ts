import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { clubApplicationNotification } from './functions/club-application-notification/resource';

defineBackend({
  auth,
  data,
  storage,
  clubApplicationNotification
});
