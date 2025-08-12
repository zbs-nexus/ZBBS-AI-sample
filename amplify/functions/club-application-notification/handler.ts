import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import type { Handler } from 'aws-lambda';

const sns = new SNSClient({ region: process.env.AWS_REGION });

export const handler: Handler = async (event) => {
  try {
    const { 
      representativeEmail, 
      applicantName, 
      applicantDepartment, 
      applicantSection, 
      clubName 
    } = JSON.parse(event.body);

    const message = `
【部活動参加申請通知】

部活動「${clubName}」に新しい参加申請が届きました。

申請者情報：
・名前: ${applicantName}
・所属: ${applicantDepartment} / ${applicantSection}

申請者一覧から詳細をご確認ください。
    `;

    const params = {
      Message: message,
      Subject: `【ZBBS部】${clubName}への参加申請`,
      TopicArn: process.env.SNS_TOPIC_ARN,
      MessageAttributes: {
        email: {
          DataType: 'String',
          StringValue: representativeEmail
        }
      }
    };

    await sns.send(new PublishCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Notification sent successfully' })
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send notification' })
    };
  }
};