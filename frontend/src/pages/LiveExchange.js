import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

// Action imports
import { 
  initializeSession, 
  joinSession, 
  cleanupEventListeners,
  setupEventListeners,
  initializeWebRTCConnection,
  fetchSessionDetails
} from '../redux/actions/liveExchangeActions';

// Component imports
import VideoCall from '../components/LiveExchange/VideoCall';
import ChatWindow from '../components/LiveExchange/ChatWindow';

// Service imports
import liveExchangeService from '../services/liveExchangeService';

/**
 * LiveExchange component for managing live video and chat sessions
 * @returns {JSX.Element} The LiveExchange component
 */
const LiveExchange = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId, token } = useParams();

  // Redux state
  const { session, error, isInitiator, listenersSetup } = useSelector(state => state.liveExchange);

  // Local state
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Initialize or join session
  const initSession = useCallback(async () => {
    if (session) {
      console.log('Session already initialized', session);
      setIsInitializing(false);
      setIsSessionReady(true);
      return;
    }
  
    try {
      setIsInitializing(true);
      setLocalError(null);
      const token = localStorage.getItem('accessToken');
      await liveExchangeService.initSocket(token);
  
      if (sessionId && token) {
        console.log('Joining existing session:', sessionId);
        await dispatch(joinSession(sessionId, token));
      } else if (location.state && location.state.exchangeId) {
        console.log('Initializing session for exchange:', location.state.exchangeId);
        const newSession = await dispatch(initializeSession(location.state.exchangeId));
        if (newSession && newSession.sessionUrl) {
          navigate(newSession.sessionUrl);
        }
      } else {
        throw new Error('Invalid URL parameters or missing exchange ID');
      }
      setIsSessionReady(true);
    } catch (error) {
      console.error('Failed to initialize or join session:', error.response?.data || error.message);
      setLocalError(error.response?.data?.message || error.message || 'An error occurred while joining the session');
    } finally {
      setIsInitializing(false);
    }
  }, [dispatch, sessionId, location, navigate, session]);

  // Effects
  useEffect(() => {
    initSession();
    return () => dispatch(cleanupEventListeners());
  }, [initSession, dispatch]);
  
  useEffect(() => {
    if (session && !listenersSetup) {
      dispatch(setupEventListeners());
    }
  }, [session, listenersSetup, dispatch]);

  useEffect(() => {
    if (session && isSessionReady && !session.webRTCInitialized) {
      dispatch(initializeWebRTCConnection(session));
    }
  }, [session, isSessionReady, dispatch]);

  useEffect(() => {
    if (session && !session.Exchange) {
      dispatch(fetchSessionDetails(session.id));
    }
  }, [session, dispatch]);

  // Handlers
  const toggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev);
  }, []);

  // Render content
  const renderContent = useMemo(() => {
    console.log('Rendering content. Session:', session);
    console.log('Is initializing:', isInitializing);
    console.log('Error:', error);
    console.log('Local Error:', localError);
    console.log('Is session ready:', isSessionReady);
    console.log('Exchange data:', session?.Exchange);

    if (isInitializing) {
      return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (localError || (error && !session)) {
      return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
          <div className="text-red-500 text-xl font-semibold">{localError || error}</div>
        </div>
      );
    }

    if (!session || !isSessionReady || !session.Exchange) {
      return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
          <div className="text-gray-600 text-xl font-semibold">Preparing session...</div>
        </div>
      );
    }

    return (
      <div className="h-screen bg-gray-900 relative">
        <VideoCall 
          isInitiator={isInitiator} 
          onToggleChat={toggleChat}
          isChatOpen={isChatOpen}
          session={session}
          ChatWindow={isChatOpen ? <ChatWindow onClose={toggleChat} /> : null}
        />
      </div>
    );
  }, [isInitializing, error, localError, session, isSessionReady, isInitiator, isChatOpen, toggleChat]);

  return renderContent;
};

export default React.memo(LiveExchange);