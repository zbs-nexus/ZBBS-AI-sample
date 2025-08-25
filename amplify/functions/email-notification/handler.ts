export const handler = async (event: any) => {
  console.log('Email notification triggered:', event);
  
  try {
    const { SESClient, SendEmailCommand } = await import('@aws-sdk/client-ses');
    
    const ses = new SESClient({ region: 'ap-northeast-1' });
    
    const requestBody = JSON.parse(event.body || '{}');
    const { type = 'application' } = requestBody;
    
    let subject: string;
    let message: string;
    let representativeEmail: string;
    
    if (type === 'event') {
      const { 
        representativeEmail: eventEmail, 
        participantName, 
        participantDepartment, 
        participantSection, 
        eventTitle,
        eventDate,
        isJoining
      } = requestBody;
      
      representativeEmail = eventEmail;
      subject = isJoining ? `【ZBBS部】${eventTitle}への参加通知` : `【ZBBS部】${eventTitle}への参加キャンセル通知`;
      message = isJoining 
        ? `【イベント参加通知】

イベント「${eventTitle}」に新しい参加者が登録されました。

参加者情報：
・名前: ${participantName}
・所属: ${participantDepartment} / ${participantSection}
・開催日時: ${new Date(eventDate).toLocaleString('ja-JP')}

イベント詳細画面で参加者一覧をご確認ください。`
        : `【イベント参加キャンセル通知】

イベント「${eventTitle}」への参加がキャンセルされました。

参加者情報：
・名前: ${participantName}
・所属: ${participantDepartment} / ${participantSection}
・開催日時: ${new Date(eventDate).toLocaleString('ja-JP')}

イベント詳細画面で参加者一覧をご確認ください。`;
    } else {
      const { 
        representativeEmail: clubEmail, 
        applicantName, 
        applicantDepartment, 
        applicantSection, 
        clubName
      } = requestBody;
      
      representativeEmail = clubEmail;
      const isCancel = type === 'cancel';
      subject = isCancel ? `【ZBBS部】${clubName}への参加申請取り消し` : `【ZBBS部】${clubName}への参加申請`;
      message = isCancel 
        ? `【部活動参加申請取り消し通知】

部活動「${clubName}」への参加申請が取り消されました。

申請者情報：
・名前: ${applicantName}
・所属: ${applicantDepartment} / ${applicantSection}

申請者一覧で確認できます。`
        : `【部活動参加申請通知】

部活動「${clubName}」に新しい参加申請が届きました。

申請者情報：
・名前: ${applicantName}
・所属: ${applicantDepartment} / ${applicantSection}

申請者一覧から詳細をご確認ください。`;
    }

    await ses.send(new SendEmailCommand({
      Source: 'hieitom777@gmail.com',
      Destination: {
        ToAddresses: [representativeEmail]
      },
      Message: {
        Subject: {
          Data: subject,
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
    
    console.log(`Email sent to ${representativeEmail}`);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Email sent successfully' })
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Failed to send email' })
    };
  }
};