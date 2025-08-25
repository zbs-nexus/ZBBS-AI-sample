import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { generateWikiId } from '../utils/idGenerator';

const client = generateClient<Schema>();

export interface Club {
  id?: string;
  name: string;
  description?: string;
  category?: string;
  representativeEmail?: string;
  isActive?: boolean;
  createdBy: string;
}

export interface WikiPage {
  id?: string;
  clubId: string;
  title: string;
  content?: string;
  lastEditedBy: string;
}

export interface ClubApplication {
  id?: string;
  clubId: string;
  applicantUserId: string;
  status?: string;
}

export interface Participant {
  name: string;
  department: string;
  section: string;
  hobbyTags: string[];
}

export class ClubService {
  static async getClub(clubId: string): Promise<Club | null> {
    try {
      const { data } = await client.models.Club.get({ id: clubId });
      return data;
    } catch (error) {
      console.error('部活取得エラー:', error);
      return null;
    }
  }

  static async getWikiPage(clubId: string): Promise<WikiPage | null> {
    try {
      const { data } = await client.models.WikiPage.list({
        filter: { clubId: { eq: clubId } }
      });
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Wiki取得エラー:', error);
      return null;
    }
  }

  static async saveWikiPage(wikiData: WikiPage): Promise<boolean> {
    try {
      if (wikiData.id) {
        await client.models.WikiPage.update(wikiData);
      } else {
        const customId = await generateWikiId();
        await client.models.WikiPage.create({
          ...wikiData,
          id: customId
        });
      }
      return true;
    } catch (error) {
      console.error('Wiki保存エラー:', error);
      return false;
    }
  }

  static async applyToClub(application: Omit<ClubApplication, 'id'>): Promise<boolean> {
    try {
      await client.models.ClubApplication.create({
        ...application,
        status: 'pending'
      });
      return true;
    } catch (error) {
      console.error('部活申請エラー:', error);
      return false;
    }
  }

  static async cancelApplication(clubId: string, userId: string): Promise<boolean> {
    try {
      const { data: applications } = await client.models.ClubApplication.list({
        filter: { 
          clubId: { eq: clubId },
          applicantUserId: { eq: userId }
        }
      });
      
      if (applications.length > 0) {
        await client.models.ClubApplication.delete({ id: applications[0].id });
        return true;
      }
      return false;
    } catch (error) {
      console.error('申請取り消しエラー:', error);
      return false;
    }
  }

  static async getApplicationStatus(clubId: string, userId: string): Promise<string> {
    try {
      const { data } = await client.models.ClubApplication.list({
        filter: { 
          clubId: { eq: clubId },
          applicantUserId: { eq: userId }
        }
      });
      return data.length > 0 ? (data[0].status || 'pending') : '';
    } catch (error) {
      console.error('申請状況取得エラー:', error);
      return '';
    }
  }

  static async getApprovedParticipants(clubId: string): Promise<Participant[]> {
    try {
      const { data: applications } = await client.models.ClubApplication.list({
        filter: { 
          clubId: { eq: clubId },
          status: { eq: 'approved' }
        }
      });

      const participants: Participant[] = [];
      for (const app of applications) {
        const { data: profiles } = await client.models.UserProfile.list({
          filter: { userId: { eq: app.applicantUserId } }
        });
        
        if (profiles.length > 0) {
          const profile = profiles[0];
          participants.push({
            name: profile.name || '名前未設定',
            department: profile.department || '部門未設定',
            section: profile.section || '課未設定',
            hobbyTags: (profile.hobbyTags || []).filter((tag): tag is string => tag !== null)
          });
        }
      }
      
      return participants;
    } catch (error) {
      console.error('参加者一覧取得エラー:', error);
      return [];
    }
  }
}