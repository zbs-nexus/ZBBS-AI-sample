import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export interface TagMaster {
  id?: string;
  name: string;
  category: string;
  isActive?: boolean | null;
}

export interface TagCategory {
  name: string;
  tags: string[];
}

export class UIService {
  static async getTagMaster(): Promise<TagMaster[]> {
    try {
      const { data } = await client.models.TagMaster.list({
        filter: { isActive: { eq: true } }
      });
      return data;
    } catch (error) {
      console.error('タグマスタ取得エラー:', error);
      return [];
    }
  }

  static async getTagsByCategory(): Promise<TagCategory[]> {
    try {
      const tags = await this.getTagMaster();
      const categoryMap = new Map<string, string[]>();

      tags.forEach(tag => {
        if (!categoryMap.has(tag.category)) {
          categoryMap.set(tag.category, []);
        }
        categoryMap.get(tag.category)!.push(tag.name);
      });

      return Array.from(categoryMap.entries()).map(([name, tags]) => ({
        name,
        tags
      }));
    } catch (error) {
      console.error('カテゴリ別タグ取得エラー:', error);
      return [];
    }
  }

  static formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  }

  static formatDateOnly(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  }

  static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  static getTagColor(category: string): string {
    const colorMap: Record<string, string> = {
      'IT・技術': '#e3f2fd',
      'デザイン・クリエイティブ': '#f3e5f5',
      'ビジネス・マーケティング': '#e8f5e8',
      '趣味・エンターテイメント': '#fff3e0',
      'スポーツ・健康': '#ffebee',
      '学習・教育': '#e0f2f1',
      'アート・クラフト': '#fce4ec',
      '音楽・演奏': '#f1f8e9',
      '旅行・アウトドア': '#e8eaf6'
    };
    return colorMap[category] || '#f5f5f5';
  }

  static getTagTextColor(category: string): string {
    const colorMap: Record<string, string> = {
      'IT・技術': '#1976d2',
      'デザイン・クリエイティブ': '#7b1fa2',
      'ビジネス・マーケティング': '#388e3c',
      '趣味・エンターテイメント': '#f57c00',
      'スポーツ・健康': '#d32f2f',
      '学習・教育': '#00796b',
      'アート・クラフト': '#c2185b',
      '音楽・演奏': '#689f38',
      '旅行・アウトドア': '#303f9f'
    };
    return colorMap[category] || '#666666';
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateRequired(value: string): boolean {
    return value.trim().length > 0;
  }

  static showConfirm(message: string): boolean {
    return confirm(message);
  }

  static showAlert(message: string): void {
    alert(message);
  }

  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }
}