import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  UserPlusIcon,
  EllipsisHorizontalIcon,
  PaperClipIcon,
  PhotoIcon,
  PaperAirplaneIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { sendMessage } from '../../redux/actions/chatActions';
import { initializeSession } from '../../redux/actions/liveExchangeActions';

/**
 * ChatArea component for displaying and managing chat messages
 * @param {Object} props - Component props
 * @param {Object} props.selectedChat - The currently selected chat
 * @param {Object} props.selectedUser - The user of the selected chat
 * @param {Object} props.user - The current user
 * @param {Object} props.messages - Object containing chat messages
 * @param {Function} props.acceptLiveExchangeInvitation - Function to accept live exchange invitation
 * @param {Function} props.joinLiveExchange - Function to join live exchange
 * @param {string|number} props.exchangeId - ID of the exchange
 * @param {boolean} props.isInitiator - Whether the current user is the initiator of the exchange
 */
const ChatArea = ({
  selectedChat,
  selectedUser,
  user,
  messages,
  acceptLiveExchangeInvitation,
  joinLiveExchange,
  exchangeId,
  isInitiator
}) => {
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() && selectedChat && user) {
      const messageContent = {
        type: 'text',
        content: messageInput.trim()
      };
      dispatch(sendMessage(selectedChat, JSON.stringify(messageContent)))
        .then(() => {
          setMessageInput('');
        })
        .catch(error => {
          console.error('Error sending message:', error);
        });
    }
  };

  const sendLiveExchangeInvitation = () => {
    if (!exchangeId || (typeof exchangeId !== 'number' && (typeof exchangeId !== 'string' || exchangeId.trim() === ''))) {
      console.error('Invalid exchangeId:', exchangeId);
      alert('Invalid exchange ID. Unable to start live exchange.');
      return;
    }
  
    if (!user) {
      console.error('Missing user information');
      alert('User information is missing. Please try logging in again.');
      return;
    }
  
    if (!selectedChat) {
      console.error('No chat selected');
      alert('Please select a chat before starting a live exchange.');
      return;
    }
  
    dispatch(initializeSession(exchangeId))
      .then((session) => {
        if (session && session.id) {
          const invitationMessage = JSON.stringify({
            type: 'LIVE_EXCHANGE_INVITATION',
            content: {
              message: 'I would like to start a live exchange. Do you accept?',
              sessionId: session.id,
              exchangeId: session.exchangeId,
              status: session.status,
              isInitiator: true
            }
          });
          return dispatch(sendMessage(selectedChat, invitationMessage));
        } else {
          throw new Error('Failed to initialize live exchange session: Invalid session data');
        }
      })
      .then(() => {
        // Success handling can be added here if needed
      })
      .catch(error => {
        console.error('Error sending live exchange invitation:', error);
        alert(`Failed to start live exchange: ${error.message}`);
      });
  };

  const renderMessage = (message) => {
    let content = message.content;
    
    const parseContent = (rawContent) => {
      if (typeof rawContent === 'string') {
        try {
          const decodedContent = decodeHTMLEntities(rawContent);
          let parsedContent = JSON.parse(decodedContent);
          return parsedContent;
        } catch (error) {
          console.error('[ChatArea] Failed to parse content:', error);
          return { type: 'text', content: rawContent };
        }
      }
      return rawContent;
    };
  
    content = parseContent(content);
  
    const messageType = content.type || message.type || 'text';
    const renderContent = content.content || content;
  
    switch (messageType) {
      case 'LIVE_EXCHANGE_INVITATION':
        return (
          <div className="bg-yellow-100 p-4 rounded-lg">
            <p>{renderContent.message}</p>
            <p>Session ID: {renderContent.sessionId}</p>
            <p>Exchange ID: {renderContent.exchangeId}</p>
            <p>Status: {renderContent.status}</p>
            {message.senderId !== user.id && renderContent.status === 'waiting' && (
              <button
                onClick={() => acceptLiveExchangeInvitation(message)}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
              >
                Accept
              </button>
            )}
          </div>
        );
      case 'LIVE_EXCHANGE_ACCEPTED':
        return (
          <div className="bg-green-100 p-4 rounded-lg">
            <p>{renderContent.message || 'Live exchange invitation accepted.'}</p>
            <button
              onClick={() => joinLiveExchange(renderContent.sessionId, renderContent.token, renderContent.isInitiator)}
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
            >
              Join Live Exchange
            </button>
          </div>
        );
      default:
        return <p className="text-sm">{typeof renderContent === 'string' ? renderContent : JSON.stringify(renderContent)}</p>;
    }
  };
  
  // Helper function to decode HTML entities
  const decodeHTMLEntities = (text) => {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {selectedChat ? (
        <>
          <div className="h-16 border-b bg-white flex justify-between items-center px-6">
            <div className="flex items-center">
              <img 
                className="h-10 w-10 rounded-full object-cover"
                src={selectedUser?.avatar}
                alt={selectedUser?.name || 'User avatar'} 
              />
              <p className="font-semibold ml-3 text-gray-800">
                {selectedUser?.name || 'Unknown User'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <UserPlusIcon className="h-6 w-6 text-gray-500" />
              <EllipsisHorizontalIcon className="h-6 w-6 text-gray-500" />
            </div>
          </div>
          <div className="flex-1 px-6 py-4 overflow-y-auto">
            {messages[selectedChat] && messages[selectedChat].map((message) => (
              <div key={`${message.id}-${message.createdAt}`} className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className={`max-w-xs lg:max-w-md ${message.senderId === user.id ? 'bg-blue-500 text-white' : 'bg-white'} rounded-lg px-4 py-2 shadow`}>
                  {renderMessage(message)}
                  <p className="text-xs text-gray-300 mt-1">{new Date(message.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 bg-white">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Message ${selectedUser?.name || 'Unknown User'}`}
              />
              <PaperClipIcon className="h-6 w-6 text-gray-500 cursor-pointer" />
              <PhotoIcon className="h-6 w-6 text-gray-500 cursor-pointer" />
              {isInitiator && (
                <button onClick={sendLiveExchangeInvitation} type="button" className="text-blue-500">
                  <VideoCameraIcon className="h-6 w-6" />
                </button>
              )}
              <button type="submit" className="bg-blue-500 text-white rounded-full p-2">
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Select a chat to start messaging</p>
        </div>
      )}
    </div>
  );
};

export default ChatArea;