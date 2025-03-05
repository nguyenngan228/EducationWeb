import React, { useState } from 'react';
import dialogflowService from './dialogflowService';
import './chat.css'

const Chatbot = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [sessionId] = useState(Date.now()); 

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setChatHistory([...chatHistory, { sender: 'user', text: message }]);

    try {
      const response = await dialogflowService(message, sessionId);
      const botMessage = response.queryResult.fulfillmentText;

      setChatHistory([...chatHistory, { sender: 'user', text: message }, { sender: 'bot', text: botMessage }]);
    } catch (error) {
      console.error('Error fetching response from Dialogflow:', error);
    }

    setMessage('');
  };

  return (
    <div>
      <div className="chat-history">
        {chatHistory.map((chat, index) => (
          <div key={index} className={chat.sender === 'user' ? 'user-message' : 'bot-message'}>
            {chat.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter to start..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;
