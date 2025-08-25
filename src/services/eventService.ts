import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { generateEventId } from '../utils/idGenerator';

const client = generateClient<Schema>();

export interface Event {
  id?: string;
  title: string;
  description?: string | null;
  date: string;
  endDate?: string | null;
  location?: string | null;
  maxParticipants?: number | null;
  tags?: (string | null)[] | null;
  targetAudience?: string | null;
  recruitmentDeadline?: string | null;
  representativeEmail?: string | null;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventParticipant {
  id?: string;
  eventId: string;
  userId: string;
}

export interface ParticipantInfo {
  name: string;
  department: string;
  section: string;
  hobbyTags: string[];
}

export class EventService {
  static async getEvents(): Promise<Event[]> {
    try {
      const { data } = await client.models.Event.list();
      return data;
    } catch (error) {
      console.error('イベント一覧取得エラー:', error);
      return [];
    }
  }

  static async getEvent(eventId: string): Promise<Event | null> {
    try {
      const { data } = await client.models.Event.get({ id: eventId });
      return data;
    } catch (error) {
      console.error('イベント取得エラー:', error);
      return null;
    }
  }

  static async createEvent(eventData: Omit<Event, 'id'>): Promise<boolean> {
    try {
      const customId = await generateEventId();
      await client.models.Event.create({
        ...eventData,
        id: customId
      });
      return true;
    } catch (error) {
      console.error('イベント作成エラー:', error);
      return false;
    }
  }

  static async updateEvent(eventData: Event): Promise<boolean> {
    try {
      if (!eventData.id) return false;
      
      await client.models.Event.update({
        id: eventData.id,
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        endDate: eventData.endDate,
        location: eventData.location,
        maxParticipants: eventData.maxParticipants,
        tags: eventData.tags,
        targetAudience: eventData.targetAudience,
        recruitmentDeadline: eventData.recruitmentDeadline,
        representativeEmail: eventData.representativeEmail,
        createdBy: eventData.createdBy
      });
      return true;
    } catch (error) {
      console.error('イベント更新エラー:', error);
      return false;
    }
  }

  static async deleteEvent(eventId: string): Promise<boolean> {
    try {
      await client.models.Event.delete({ id: eventId });
      return true;
    } catch (error) {
      console.error('イベント削除エラー:', error);
      return false;
    }
  }

  static async joinEvent(eventId: string, userId: string): Promise<boolean> {
    try {
      await client.models.EventParticipant.create({
        eventId,
        userId
      });
      return true;
    } catch (error) {
      console.error('イベント参加エラー:', error);
      return false;
    }
  }

  static async sendEventParticipationNotification(eventId: string, userId: string, isJoining: boolean): Promise<void> {
    try {
      const event = await this.getEvent(eventId);
      if (!event?.representativeEmail) return;

      const { AuthService } = await import('./authService');
      const userProfile = await AuthService.getUserProfile(userId);
      if (!userProfile) return;

      const { NotificationService } = await import('./notificationService');
      await NotificationService.sendEventNotification({
        representativeEmail: event.representativeEmail,
        participantName: userProfile.name,
        participantDepartment: userProfile.department || '',
        participantSection: userProfile.section || '',
        eventTitle: event.title,
        eventDate: event.date,
        isJoining
      });
    } catch (error) {
      console.error('イベント通知エラー:', error);
    }
  }

  static async leaveEvent(eventId: string, userId: string): Promise<boolean> {
    try {
      const { data: participants } = await client.models.EventParticipant.list({
        filter: { 
          eventId: { eq: eventId },
          userId: { eq: userId }
        }
      });
      
      if (participants.length > 0) {
        await client.models.EventParticipant.delete({ id: participants[0].id });
        return true;
      }
      return false;
    } catch (error) {
      console.error('イベント退会エラー:', error);
      return false;
    }
  }

  static async getParticipationStatus(eventId: string, userId: string): Promise<boolean> {
    try {
      const { data } = await client.models.EventParticipant.list({
        filter: { 
          eventId: { eq: eventId },
          userId: { eq: userId }
        }
      });
      return data.length > 0;
    } catch (error) {
      console.error('参加状況取得エラー:', error);
      return false;
    }
  }

  static async getEventParticipants(eventId: string): Promise<ParticipantInfo[]> {
    try {
      const { data: participants } = await client.models.EventParticipant.list({
        filter: { eventId: { eq: eventId } }
      });

      const participantInfos: ParticipantInfo[] = [];
      for (const participant of participants) {
        const { data: profiles } = await client.models.UserProfile.list({
          filter: { userId: { eq: participant.userId } }
        });
        
        if (profiles.length > 0) {
          const profile = profiles[0];
          participantInfos.push({
            name: profile.name || '名前未設定',
            department: profile.department || '部門未設定',
            section: profile.section || '課未設定',
            hobbyTags: (profile.hobbyTags || []).filter((tag): tag is string => tag !== null)
          });
        }
      }
      
      return participantInfos;
    } catch (error) {
      console.error('参加者一覧取得エラー:', error);
      return [];
    }
  }

  static async getUserEvents(userId: string): Promise<Event[]> {
    try {
      const { data: participants } = await client.models.EventParticipant.list({
        filter: { userId: { eq: userId } }
      });

      const events: Event[] = [];
      for (const participant of participants) {
        const event = await this.getEvent(participant.eventId);
        if (event) {
          events.push(event);
        }
      }
      
      return events;
    } catch (error) {
      console.error('ユーザーイベント取得エラー:', error);
      return [];
    }
  }
}