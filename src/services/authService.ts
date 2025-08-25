import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export interface UserProfile {
  id?: string;
  userId: string;
  name: string;
  department?: string | null;
  section?: string | null;
  hobbyTags?: (string | null)[] | null;
  profileImageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export class AuthService {
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data } = await client.models.UserProfile.list({
        filter: { userId: { eq: userId } }
      });
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('ユーザープロフィール取得エラー:', error);
      return null;
    }
  }

  static async updateUserProfile(profile: UserProfile): Promise<boolean> {
    try {
      if (profile.id) {
        await client.models.UserProfile.update({
          id: profile.id,
          userId: profile.userId,
          name: profile.name,
          department: profile.department,
          section: profile.section,
          hobbyTags: profile.hobbyTags,
          profileImageUrl: profile.profileImageUrl
        });
      } else {
        await client.models.UserProfile.create(profile);
      }
      return true;
    } catch (error) {
      console.error('ユーザープロフィール更新エラー:', error);
      return false;
    }
  }

  static async createUserProfile(profile: Omit<UserProfile, 'id'>): Promise<boolean> {
    try {
      await client.models.UserProfile.create(profile);
      return true;
    } catch (error) {
      console.error('ユーザープロフィール作成エラー:', error);
      return false;
    }
  }
}