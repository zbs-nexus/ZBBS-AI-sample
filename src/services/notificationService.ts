export interface EmailNotification {
  representativeEmail: string;
  applicantName: string;
  applicantDepartment: string;
  applicantSection: string;
  clubName: string;
  type?: string;
}

export interface EventNotification {
  representativeEmail: string;
  participantName: string;
  participantDepartment: string;
  participantSection: string;
  eventTitle: string;
  eventDate: string;
  isJoining: boolean;
}

export class NotificationService {
  static async sendApplicationNotification(notification: EmailNotification): Promise<boolean> {
    try {
      // 環境変数やグローバル設定から取得（動的インポートを避ける）
      let functionUrl: string | undefined;
      
      try {
        // ES6 importを使用してamplify_outputs.jsonを読み込み
        const outputs = await import('../../amplify_outputs.json');
        functionUrl = outputs.default?.custom?.functionUrl || outputs.custom?.functionUrl;
      } catch (error) {
        console.error('amplify_outputs.json読み込みエラー:', error);
        // フォールバック：ログ出力のみ
        console.log('メール通知ログ出力:', notification);
        return true;
      }
      
      if (!functionUrl) {
        console.error('functionUrlが取得できませんでした');
        console.log('メール通知ログ出力:', notification);
        return false;
      }
      
      console.log('メール通知送信開始:', functionUrl);

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification)
      });
      
      if (response.ok) {
        console.log('メール通知送信成功');
        return true;
      } else {
        console.error('メール通知送信エラー:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('メール通知エラー:', error);
      return false;
    }
  }

  static async sendCancellationNotification(notification: EmailNotification): Promise<boolean> {
    return this.sendApplicationNotification({
      ...notification,
      type: 'cancel'
    });
  }

  static async sendEventNotification(notification: EventNotification): Promise<boolean> {
    try {
      const outputs = await import('../../amplify_outputs.json');
      const functionUrl = outputs.default?.custom?.functionUrl || outputs.custom?.functionUrl;
      
      if (!functionUrl) {
        console.error('functionUrlが取得できませんでした');
        console.log('イベント通知ログ出力:', notification);
        return false;
      }
      
      console.log('イベント通知送信開始:', functionUrl);

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...notification,
          type: 'event'
        })
      });
      
      if (response.ok) {
        console.log('イベント通知送信成功');
        return true;
      } else {
        console.error('イベント通知送信エラー:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('イベント通知エラー:', error);
      return false;
    }
  }
}