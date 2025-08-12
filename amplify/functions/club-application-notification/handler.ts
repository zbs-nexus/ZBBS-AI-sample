import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({ region: process.env.AWS_REGION });

export const handler = async (event: any) => {
  console.log('Club application notification triggered:', event);
  
  try {
    const { 
      representativeEmail, 
      applicantName, 
      applicantDepartment, 
      applicantSection, 
      clubName 
    } = JSON.parse(event.body || '{}');

    const message = `【部活動参加申請通知】

部活動「${clubName}」に新しい参加申請が届きました。

申請者情報：
・名前: ${applicantName}
・所属: ${applicantDepartment} / ${applicantSection}

申請者一覧から詳細をご確認ください。`;

    await ses.send(new SendEmailCommand({
      Source: process.env.FROM_EMAIL,
      Destination: {
        ToAddresses: [representativeEmail]
      },
      Message: {
        Subject: {
          Data: `【ZBBS部】${clubName}への参加申請`,
          Charset: 'UTF-8'
        },
        Body: {
          Text: {
            Data: message,
            Charset: 'UTF-8'
          }
        }
      }
    }));
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Email sent successfully' })
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to send email' })
    };
  }
};