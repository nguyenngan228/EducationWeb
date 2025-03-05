

import cookie from 'react-cookies'
export const DialogflowService = async (message, sessionId) => {
  const projectId = 'newagent-lqd9';
//   const accessToken = 'YOUR_ACCESS_TOKEN';

  const url = `https://dialogflow.googleapis.com/v2/projects/${projectId}/agent/sessions/${sessionId}:detectIntent`;

  const headers = {
    'Authorization': `Bearer ${cookie.load('token')}`,
    'Content-Type': 'application/json',
  };

  const body = {
    queryInput: {
      text: {
        text: message,
        languageCode: 'en', 
      },
    },
  };

  try {
    const response = await axios.post(url, body, { headers });
    return response.data;
  } catch (error) {
    console.error('Error sending message to Dialogflow', error);
    throw error;
  }
};
