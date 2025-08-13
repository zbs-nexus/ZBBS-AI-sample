import { generateClient } from 'aws-amplify/data';
import outputs from '../../amplify_outputs.json';

export async function sendClubApplicationNotification(data: {
  representativeEmail: string;
  applicantName: string;
  applicantDepartment: string;
  applicantSection: string;
  clubName: string;
}) {
  try {
    // amplify_outputs.jsonからFunction URLを取得
    const functionUrl = (outputs as any).custom?.functionUrl;
    
    if (!functionUrl) {
      console.error('Function URL not found in amplify_outputs.json');
      return;
    }

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      console.log('メール通知送信成功');
    } else {
      console.error('メール通知送信エラー:', response.statusText);
    }
  } catch (error) {
    console.error('メール通知エラー:', error);
  }
}