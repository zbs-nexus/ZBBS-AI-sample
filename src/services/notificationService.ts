export interface EmailNotification {
  representativeEmail: string;
  applicantName: string;
  applicantDepartment: string;
  applicantSection: string;
  clubName: string;
  type?: string;
}

export class NotificationService {
  static async sendApplicationNotification(notification: EmailNotification): Promise<boolean> {
    try {
      const outputs = await import('../../amplify_outputs.json');
      const functionUrl = (outputs as any).custom?.functionUrl;
      
      if (!functionUrl) {
        console.log('メール通知ログ出力:', notification);
        return true;
      }

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
}