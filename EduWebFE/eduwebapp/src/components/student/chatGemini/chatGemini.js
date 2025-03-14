import React, { useState, useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { authAPI, endpoints } from "../../../configs/APIs";
import { Button } from 'react-bootstrap';

const GeminiChat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMessages([{ sender: 'bot', text: 'Hello! Can I help you today?', avatar: '/avatar.png' }]);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = { sender: 'user', text: message };
    setMessages((prev) => [...prev, newMessage]);
    setMessage('');
    setLoading(true);

    try {
      let res = await authAPI().post(endpoints['chat_gemeni'], { message });
      const botMessage = { sender: 'bot', text: res.data.response, avatar: 'https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg' };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Network is not working!', avatar: 'https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg' }]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4">
      {!isOpen ? (
        <button
          className="bg-blue-500 text-white p-3 rounded-full shadow-lg flex items-center gap-2"
          style={{position: 'fixed', bottom: '100px', right: '20px'}}
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle size={24} />
        </button>
      ) : (
        <div className="min-w-[400px] w-[450px] bg-white shadow-lg rounded-lg flex flex-col h-[500px] border p-4 relative">
          <div className="flex justify-between items-center border-b pb-2">
            <div className="flex items-center gap-2">
              <img src="https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg" 
                   alt="Avatar" className="w-10 h-10 rounded-full" />
              <h1 className="text-lg font-bold">AI Assistant</h1>
            </div>
            <button onClick={() => setIsOpen(false)}>
              <X size={24} />
            </button>
          </div>
  
          {/* Nội dung chat */}
          <div className="flex-1 overflow-y-auto p-2 bg-gray-100 mt-2 rounded-lg">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
                {msg.sender === 'bot' && <img src='https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg' alt="Avatar" className="w-6 h-6 rounded-full mr-2" />}
                <div className={`p-2 rounded-lg max-w-[80%] ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
  
          {/* Ô nhập tin nhắn */}
          <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
            <textarea
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Enter your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button type="submit" disabled={loading} className="h-12">
              {loading ? '...' : 'Send'}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}  

export default GeminiChat;
