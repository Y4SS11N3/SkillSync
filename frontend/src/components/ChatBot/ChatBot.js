import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  ChatBubbleOvalLeftIcon,
} from '@heroicons/react/24/outline';

/**
 * ChatMessage Component
 * 
 * Renders a single chat message.
 */
const ChatMessage = ({ message }) => {
  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start space-x-2 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {message.isUser ? (
          <UserCircleIcon className="h-8 w-8 text-blue-500" />
        ) : (
          <ChatBubbleOvalLeftIcon className="h-8 w-8 text-green-500" />
        )}
        <div className={`rounded-lg p-3 ${message.isUser ? 'bg-blue-100' : 'bg-green-100'}`}>
          <p>{message.text}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * ChatBot Component
 */
const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isChatEnded, setIsChatEnded] = useState(false);
  const [rating, setRating] = useState(null);
  const messagesEndRef = useRef(null);

  const toggleChat = () => {
    if (isOpen && !isChatEnded) {
      setIsChatEnded(true);
    } else if (!isOpen) {
      setIsOpen(true);
      setIsChatEnded(false);
      setRating(null);
      setMessages([]);
    }
  };

  const handleInputChange = (e) => setInput(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    setMessages([...messages, { text: input, isUser: true }]);
    setInput('');

    if (input.toLowerCase().includes('hello') || input.toLowerCase().includes('hi')) {
      setTimeout(() => {
        setMessages(prevMessages => [
          ...prevMessages, 
          { text: `Hello! Welcome to SkillSync ChatBot. How can I assist you today?`, isUser: false }
        ]);
      }, 1000);
    } else {
      setTimeout(() => {
        setMessages(prevMessages => [
          ...prevMessages, 
          { text: `You said: ${input}. How can I help you with that?`, isUser: false }
        ]);
      }, 1000);
    }
  };

  const handleRating = (value) => {
    setRating(value);
    setTimeout(() => {
      setIsOpen(false);
      setIsChatEnded(false);
    }, 1500);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const emojis = ['😞', '😐', '🙂', '😄', '😃'];

  return (
    <>
      {/* Chat toggle button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        className="fixed bottom-5 right-5 z-50"
      >
        <button
          onClick={toggleChat}
          className="bg-[#0088cc] hover:bg-[#006699] text-white rounded-full p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0088cc] transition-all duration-300 transform hover:scale-110"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        </button>
      </motion.div>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-5 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 border border-gray-200"
          >
            {/* Chat header */}
            <div className="bg-[#0088cc] text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg">SkillSync ChatBot</h3>
              <button onClick={toggleChat} className="text-white hover:text-gray-200 focus:outline-none transition-colors duration-300">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            {/* Chat messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4 bg-[#e6f3ff]">
              {messages.length === 0 && !isChatEnded && (
                <div className="text-center text-gray-700 mt-32">
                  <ChatBubbleOvalLeftIcon className="h-12 w-12 mx-auto mb-4 text-[#0088cc]" />
                  <p>Welcome to SkillSync ChatBot! How can I assist you today?</p>
                </div>
              )}
              {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}
              {isChatEnded && !rating && (
                <div className="text-center">
                  <p className="mb-4">How would you rate your experience?</p>
                  <div className="flex justify-center space-x-2">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => handleRating(index + 1)}
                        className="text-2xl hover:scale-125 transition-transform duration-200"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {rating && (
                <div className="text-center">
                  <p>Thank you for your feedback!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Chat input */}
            {!isChatEnded && (
              <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 flex items-center bg-white">
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0088cc] bg-[#e6f3ff]"
                />
                <button
                  type="submit"
                  className="ml-2 bg-[#0088cc] hover:bg-[#006699] text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0088cc] transition-colors duration-300"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
