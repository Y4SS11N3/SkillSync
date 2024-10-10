import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  initializeSocket, 
  getChatByExchange, 
  getMessages, 
  sendMessage, 
  openChat,
  RECEIVE_MESSAGE
} from '../../redux/actions/chatActions';
import { loadUser } from '../../redux/actions/authActions';
import { fetchExchanges } from '../../redux/actions/exchangeActions';
import { initializeSession, acceptLiveExchangeInvitation as acceptInvitation } from '../../redux/actions/liveExchangeActions';
import chatService from '../../services/chatService';
import DashboardHeader from '../Header/AuthenticatedHeader';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import Toast from '../common/Toast';
import ChatList from './ChatList';
import ChatArea from './ChatArea';

/**
 * ChatContent component for managing chat interactions
 */
const ChatContent = () => {
  console.log('[ChatContent] Component rendering');
  
  const { exchangeId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, user } = useSelector(state => state.auth);
  const { chats, messages, loading, error } = useSelector(state => state.chat);
  const { exchanges } = useSelector(state => state.exchanges);

  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [socketInitialized, setSocketInitialized] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [exchangesLoading, setExchangesLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [acceptedSession, setAcceptedSession] = useState(null);

  useEffect(() => {
    console.log('[ChatContent] useEffect for authentication and socket initialization');
    console.log('[ChatContent] isAuthenticated:', isAuthenticated, 'authLoading:', authLoading);
    
    if (!isAuthenticated && !authLoading) {
      console.log('[ChatContent] Dispatching loadUser');
      dispatch(loadUser());
    } else if (isAuthenticated && !authLoading) {
      console.log('[ChatContent] User authenticated, initializing socket');
      const token = localStorage.getItem('accessToken');
      chatService.initSocket(token)
        .then(() => {
          console.log('[ChatContent] Socket initialized successfully');
          setSocketInitialized(true);
          return dispatch(fetchExchanges());
        })
        .then(() => {
          console.log('[ChatContent] Exchanges fetched successfully');
          setExchangesLoading(false);
          if (exchangeId) {
            console.log(`[ChatContent] Opening chat for exchangeId: ${exchangeId}`);
            handleOpenChat(parseInt(exchangeId));
          }
        })
        .catch((error) => {
          console.error('[ChatContent] Error initializing socket or fetching exchanges:', error);
          setToastMessage('Error connecting to chat. Please try refreshing the page.');
          setToastType('error');
          setShowToast(true);
          setSocketInitialized(false);
          setExchangesLoading(false);
        });
    }
  }, [isAuthenticated, authLoading, dispatch, exchangeId]);

  const isInitiator = useMemo(() => {
    console.log('[ChatContent] Calculating isInitiator');
    if (selectedExchange && user) {
      const result = selectedExchange.user1Id === user.id;
      console.log(`[ChatContent] isInitiator: ${result}`);
      return result;
    }
    console.log('[ChatContent] isInitiator: false (no selectedExchange or user)');
    return false;
  }, [selectedExchange, user]);

  useEffect(() => {
    console.log('[ChatContent] useEffect for chat messages and joining chat');
    console.log('[ChatContent] socketInitialized:', socketInitialized, 'selectedChat:', selectedChat);
    
    if (socketInitialized && selectedChat) {
      console.log(`[ChatContent] Fetching messages for chat: ${selectedChat}`);
      dispatch(getMessages(selectedChat))
        .catch(error => {
          console.error('[ChatContent] Error getting messages:', error);
          setToastMessage(error.message);
          setToastType('error');
          setShowToast(true);
        });

      console.log(`[ChatContent] Joining chat: ${selectedChat}`);
      chatService.joinChat(selectedChat);

      setUnreadMessages(prev => {
        console.log(`[ChatContent] Resetting unread messages for chat ${selectedChat}`);
        return { ...prev, [selectedChat]: 0 };
      });

      return () => {
        console.log(`[ChatContent] Leaving chat: ${selectedChat}`);
        chatService.leaveChat(selectedChat);
      };
    }
  }, [socketInitialized, selectedChat, dispatch]);

  useEffect(() => {
    console.log('[ChatContent] useEffect for handling new messages');
    if (socketInitialized && user) {
      const handleNewMessage = (message) => {
        console.log('[ChatContent] New message received:', message);
        
        let messageContent;
        try {
          messageContent = typeof message.content === 'string' ? JSON.parse(message.content) : message.content;
        } catch (error) {
          console.error('[ChatContent] Error parsing message content:', error);
          messageContent = { type: 'text', content: message.content };
        }
        
        console.log('[ChatContent] Dispatching RECEIVE_MESSAGE action');
        dispatch({ type: RECEIVE_MESSAGE, payload: { ...message, content: messageContent } });
        
        if (messageContent.type === 'LIVE_EXCHANGE_ACCEPTED' && message.senderId !== user.id) {
          console.log('[ChatContent] Live exchange invitation accepted');
          setToastMessage('Live exchange invitation accepted. You can now join the session.');
          setToastType('success');
          setShowToast(true);
          setAcceptedSession({
            sessionId: messageContent.content.sessionId,
            token: messageContent.content.token,
            exchangeId: messageContent.content.exchangeId,
            isInitiator: true
          });
        } else if (messageContent.type === 'LIVE_EXCHANGE_INVITATION' && message.senderId !== user.id) {
          console.log('[ChatContent] Received live exchange invitation');
          setToastMessage('You have received a live exchange invitation.');
          setToastType('info');
          setShowToast(true);
        }
        
        if (message.chatId !== selectedChat) {
          console.log(`[ChatContent] Updating unread messages for chat ${message.chatId}`);
          setUnreadMessages(prev => ({
            ...prev,
            [message.chatId]: (prev[message.chatId] || 0) + 1
          }));
        }
      };
  
      console.log('[ChatContent] Setting up new message listener');
      chatService.onNewMessage(handleNewMessage);
  
      return () => {
        console.log('[ChatContent] Removing new message listener');
        chatService.offNewMessage(handleNewMessage);
      };
    }
  }, [socketInitialized, dispatch, selectedChat, user]);

  const handleOpenChat = useCallback((exchangeId) => {
    console.log(`[ChatContent] handleOpenChat called with exchangeId: ${exchangeId}`);
    if (!exchanges) {
      console.error('[ChatContent] No exchanges available');
      setToastMessage('Unable to load chats. Please try again later.');
      setToastType('error');
      setShowToast(true);
      return;
    }

    const exchange = exchanges.find(e => e.id === exchangeId);
    if (!exchange) {
      console.error(`[ChatContent] Exchange not found for id: ${exchangeId}`);
      setToastMessage('Chat not found. Please try again.');
      setToastType('error');
      setShowToast(true);
      return;
    }

    console.log('[ChatContent] Setting selected exchange:', exchange);
    setSelectedExchange(exchange);
    dispatch(openChat(exchangeId))
      .then(chat => {
        if (!chat || !chat.id) {
          throw new Error('Invalid chat data received');
        }
        console.log('[ChatContent] Chat opened successfully:', chat);
        setSelectedChat(chat.id);
        const otherUser = exchange.user1Id === user.id ? exchange.user2 : exchange.user1;
        if (!otherUser || !otherUser.id) {
          throw new Error('Invalid user data in exchange');
        }
        console.log('[ChatContent] Setting selected user:', otherUser);
        setSelectedUser(otherUser);
        setUnreadMessages(prev => ({ ...prev, [chat.id]: 0 }));
      })
      .catch(error => {
        console.error('[ChatContent] Error opening chat:', error);
        setToastMessage(error.message || 'Error opening chat. Please try again.');
        setToastType('error');
        setShowToast(true);
      });
  }, [dispatch, exchanges, user, setToastMessage, setToastType, setShowToast]);

  const acceptLiveExchangeInvitation = async (message) => {
    console.log('[ChatContent] acceptLiveExchangeInvitation called with message:', message);
    try {
      let content;
      if (typeof message.content === 'string') {
        try {
          const decodedContent = decodeHTMLEntities(message.content);
          content = JSON.parse(decodedContent);
        } catch (error) {
          console.error('[ChatContent] Failed to parse message content:', error);
          throw new Error('Invalid message content');
        }
      } else if (typeof message.content === 'object') {
        content = message.content;
      } else {
        throw new Error('Invalid message content type');
      }
      
      if (content.type !== 'LIVE_EXCHANGE_INVITATION') {
        throw new Error('Invalid message type');
      }
  
      const { sessionId, exchangeId } = content.content;
      
      if (!sessionId || !exchangeId) {
        console.error('[ChatContent] Invalid session data in the invitation:', content);
        throw new Error('Invalid session data in the invitation');
      }
  
      console.log('[ChatContent] Accepting invitation for sessionId:', sessionId);
      const result = await dispatch(acceptInvitation(sessionId));
      
      console.log('[ChatContent] Sending acceptance message');
      const acceptanceMessage = JSON.stringify({
        type: 'LIVE_EXCHANGE_ACCEPTED',
        content: {
          message: 'Live exchange invitation accepted.',
          sessionId,
          exchangeId,
          token: result.token,
          isInitiator: false
        }
      });
      await dispatch(sendMessage(message.chatId, acceptanceMessage));
      
      console.log('[ChatContent] Setting accepted session:', {
        sessionId,
        token: result.token,
        exchangeId,
        isInitiator: false
      });
      setAcceptedSession({
        sessionId,
        token: result.token,
        exchangeId,
        isInitiator: false
      });
      
      setToastMessage('Invitation accepted. Click "Join Live Exchange" to start the session.');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('[ChatContent] Error accepting live exchange invitation:', error);
      setToastMessage(`Failed to accept live exchange invitation: ${error.message}`);
      setToastType('error');
      setShowToast(true);
    }
  };
  
  const decodeHTMLEntities = (text) => {
    console.log('[ChatContent] Decoding HTML entities');
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
  };

  const joinLiveExchange = (sessionId, token, isInitiator) => {
    console.log(`[ChatContent] joinLiveExchange called with sessionId: ${sessionId}, token: ${token}, isInitiator: ${isInitiator}`);
    if (sessionId && token) {
      console.log(`[ChatContent] Navigating to live exchange: /live-exchange/${sessionId}/${token}`);
      navigate(`/live-exchange/${sessionId}/${token}`, { state: { isInitiator } });
    } else {
      console.error('[ChatContent] Invalid sessionId or token for live exchange');
      setToastMessage('Unable to join live exchange. Missing session information.');
      setToastType('error');
      setShowToast(true);
    }
  };

  if (loading || authLoading || exchangesLoading || !user) {
    console.log('[ChatContent] Rendering loader');
    return <Loader />;
  }
  if (error) {
    console.error('[ChatContent] Error:', error);
    return <ErrorMessage message={error} />;
  }
  
  if (!exchanges || exchanges.length === 0) {
    console.log('[ChatContent] No exchanges available');
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">No exchanges available.</p>
      </div>
    );
  }

  console.log('[ChatContent] Rendering main component');
  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-100">
      <DashboardHeader />
      <div className="flex-1 flex overflow-hidden">
        <ChatList 
          exchanges={exchanges}
          selectedChat={selectedChat}
          handleOpenChat={handleOpenChat}
          unreadMessages={unreadMessages}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
        />
        <ChatArea 
          selectedChat={selectedChat}
          selectedUser={selectedUser}
          user={user}
          messages={messages}
          dispatch={dispatch}
          acceptLiveExchangeInvitation={acceptLiveExchangeInvitation}
          joinLiveExchange={joinLiveExchange}
          exchangeId={selectedExchange ? selectedExchange.id : null}
          isInitiator={isInitiator}
        />
      </div>
      {showToast && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setShowToast(false)} 
        />
      )}
    </div>
  );
};

export default ChatContent;