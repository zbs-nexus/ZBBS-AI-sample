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

    console.log(`【部活動参加申請通知】`);
    console.log(`部活動: ${clubName}`);
    console.log(`代表者: ${representativeEmail}`);
    console.log(`申請者: ${applicantName} (${applicantDepartment}/${applicantSection})`);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Notification logged successfully' })
    };
  } catch (error) {
    console.error('Error processing notification:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to process notification' })
    };
  }
};