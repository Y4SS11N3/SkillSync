import React from 'react';
import { motion } from 'framer-motion';
import { UserCircleIcon } from '@heroicons/react/24/solid';

const ChatMessage = ({ message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} items-end space-x-2`}
    >
      {!message.isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
        </div>
      )}
      <div
        className={`max-w-xs px-4 py-2 rounded-t-2xl ${
          message.isUser
            ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-bl-2xl'
            : 'bg-white text-gray-800 rounded-br-2xl shadow-md'
        }`}
      >
        <p className="text-sm">{message.text}</p>
      </div>
      {message.isUser && (
        <div className="flex-shrink-0">
          <UserCircleIcon className="w-8 h-8 text-sky-500" />
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;
