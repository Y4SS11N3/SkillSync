import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import Draggable from 'react-draggable';
import { Resizable } from 're-resizable';
import { sendChatMessage, setupChatListener, cleanupChatListener } from '../../redux/actions/liveExchangeActions';

const ChatWindow = ({ onClose, isOpen }) => {
  const [inputMessage, setInputMessage] = useState('');
  const { session, chatMessages } = useSelector(state => state.liveExchange);
  const { Exchange: { user1, user2 } } = useSelector(state => state.liveExchange.session);
  const currentUser = useSelector(state => state.auth.user);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isOpen) {
      dispatch(setupChatListener());
      inputRef.current?.focus();
    }

    return () => {
      if (isOpen) {
        dispatch(cleanupChatListener());
      }
    };
  }, [dispatch, isOpen]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    console.log('Sending message:', inputMessage);
    if (!inputMessage.trim()) return;

    dispatch(sendChatMessage(session.id, inputMessage));
    console.log('Message dispatched');
    
    setInputMessage('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    console.log('Input cleared. Current state:', inputMessage);
    console.log('Input field value:', inputRef.current ? inputRef.current.value : 'N/A');
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    console.log('Input changed to:', newValue);
    setInputMessage(newValue);
  };

  useEffect(() => {
    console.log('inputMessage state updated:', inputMessage);
  }, [inputMessage]);

  const getParticipantName = (userId) => {
    if (userId === currentUser.id) {
      return 'You';
    } else if (userId === user1.id) {
      return user1.name;
    } else if (userId === user2.id) {
      return user2.name;
    } else {
      return 'Unknown';
    }
  };

  return (
    <Draggable handle=".chat-handle" bounds="parent">
      <Resizable
        defaultSize={{ width: 320, height: 480 }}
        minWidth={280}
        minHeight={400}
        maxWidth={800}
        maxHeight={600}
        className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200"
      >
        <div className="flex flex-col h-full">
          <div className="chat-handle bg-gray-100 text-gray-800 px-4 py-3 cursor-move flex justify-between items-center border-b border-gray-200">
            <h2 className="text-lg font-semibold">Chat</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {chatMessages.map((message, index) => (
              <div 
                key={index}
                className={`flex ${message.sender === currentUser.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === currentUser.id 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-800'
                }`}>
                  <p className="text-sm font-semibold mb-1">
                    {getParticipantName(message.sender)}
                  </p>
                  <p>{message.message}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={handleInputChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type a message..."
              />
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </Resizable>
    </Draggable>
  );
};

export default ChatWindow;