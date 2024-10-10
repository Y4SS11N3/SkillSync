import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  MicrophoneIcon,
  VideoCameraIcon,
  PhoneIcon,
  ArrowsPointingOutIcon,
  ChatBubbleLeftRightIcon,
  ComputerDesktopIcon,
  CodeBracketIcon
} from '@heroicons/react/24/solid';
import {
  toggleVideo,
  toggleAudio,
  relaySignal,
  startScreenShare,
  stopScreenShare,
  endSession
} from '../../redux/actions/liveExchangeActions';
import liveExchangeService from '../../services/liveExchangeService';
import ScreenShare from './ScreenShare';
import SyncEditor from './SyncEditor';
import ChatWindow from './ChatWindow';

// VideoCall component for handling video calls and screen sharing
const VideoCall = ({ isInitiator, onToggleChat, isChatOpen, onCallEnded }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { session, isScreenSharing } = useSelector(state => state.liveExchange);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [localAudioLevel, setLocalAudioLevel] = useState(0);
  const [remoteAudioLevel, setRemoteAudioLevel] = useState(0);
  const [isRemoteScreenSharing, setIsRemoteScreenSharing] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const screenShareRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const localAudioAnalyserRef = useRef(null);
  const remoteAudioAnalyserRef = useRef(null);
  const iceCandidatesQueue = useRef([]);
  const isInitialized = useRef(false);
  const [localIsScreenSharing, setLocalIsScreenSharing] = useState(false);
  const [remoteScreenShareStream, setRemoteScreenShareStream] = useState(null);
  const screenStreamRef = useRef(null);
  const [localScreenShareStream, setLocalScreenShareStream] = useState(null);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isSyncEditorOpen, setIsSyncEditorOpen] = useState(false);
  const [dataChannel, setDataChannel] = useState(null);
  const exchange = session?.Exchange || {};
  const { user1, user2 } = session.Exchange;
  const localUserName = isInitiator ? user1.name : user2.name;
  const remoteUserName = isInitiator ? user2.name : user1.name;

  // Logging function
  const log = useCallback((message, ...args) => {
    console.log(`[VideoCall${isInitiator ? '-Initiator' : ''}] ${message}`, ...args);
  }, [isInitiator]);

  // Create peer connection
  const createPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      log('PeerConnection already exists. Skipping creation.');
      return peerConnectionRef.current;
    }
    log('Creating new PeerConnection');
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
      ],
      iceTransportPolicy: 'all',
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        log('New ICE candidate:', event.candidate);
        dispatch(relaySignal({
          to: isInitiator ? session.providerId : session.initiatorId,
          signal: { type: 'ice-candidate', candidate: event.candidate },
          sessionId: session.id
        }));
      }
    };

    peerConnection.ontrack = (event) => {
      log('Received remote track', event.track.kind);
      if (event.track.kind === 'video') {
        if (remoteVideoRef.current) {
          const newStream = new MediaStream([event.track]);
          if (remoteVideoRef.current.srcObject) {
            remoteVideoRef.current.srcObject.getAudioTracks().forEach(track => {
              newStream.addTrack(track);
            });
          }
          remoteVideoRef.current.srcObject = newStream;
        }
      } else if (event.track.kind === 'audio') {
        if (remoteVideoRef.current) {
          const currentStream = remoteVideoRef.current.srcObject || new MediaStream();
          currentStream.addTrack(event.track);
          remoteVideoRef.current.srcObject = currentStream;
        }
        setupRemoteAudioAnalyser(new MediaStream([event.track]));
      }
    };

    if (isInitiator) {
      const channel = peerConnection.createDataChannel('syncEditor');
      channel.onopen = () => {
        log('Data channel opened');
        setDataChannel(channel);
      };
      channel.onclose = () => {
        log('Data channel closed');
        setDataChannel(null);
      };
    } else {
      peerConnection.ondatachannel = (event) => {
        const channel = event.channel;
        channel.onopen = () => {
          log('Data channel opened');
          setDataChannel(channel);
        };
        channel.onclose = () => {
          log('Data channel closed');
          setDataChannel(null);
        };
      };
    }

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  }, [dispatch, isInitiator, session, log]);

  // Start local stream
  const startLocalStream = useCallback(async () => {
    if (localStreamRef.current) {
      log('Local stream already exists. Skipping initialization.');
      return localStreamRef.current;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      log('Local stream obtained', { streamId: stream.id });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        log('Local video stream attached to video element');
      }
      localStreamRef.current = stream;
      setupLocalAudioAnalyser(stream);
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  }, [log]);

  // Setup local audio analyser
  const setupLocalAudioAnalyser = useCallback((stream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    
    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-50, audioContext.currentTime);
    compressor.knee.setValueAtTime(40, audioContext.currentTime);
    compressor.ratio.setValueAtTime(12, audioContext.currentTime);
    compressor.attack.setValueAtTime(0, audioContext.currentTime);
    compressor.release.setValueAtTime(0.25, audioContext.currentTime);

    microphone.connect(compressor);
    compressor.connect(analyser);
    
    analyser.fftSize = 1024;
    localAudioAnalyserRef.current = analyser;

    const checkAudioLevel = () => {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setLocalAudioLevel(average);
      requestAnimationFrame(checkAudioLevel);
    };
    checkAudioLevel();
  }, []);

  // Setup remote audio analyser
  const setupRemoteAudioAnalyser = useCallback((stream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 256;
    remoteAudioAnalyserRef.current = analyser;

    const checkAudioLevel = () => {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setRemoteAudioLevel(average);
      requestAnimationFrame(checkAudioLevel);
    };
    checkAudioLevel();
  }, []);

  // Initialize peer connection
  const initializePeerConnection = useCallback(async () => {
    if (isInitialized.current) {
      log('Already initialized. Skipping.');
      return;
    }

    log('Initializing peer connection');
    const stream = await startLocalStream();
    if (!stream) return;

    const peerConnection = createPeerConnection();
  
    if (peerConnection.signalingState === 'closed') {
      console.error('PeerConnection is closed. Cannot add tracks.');
      return;
    }
  
    stream.getTracks().forEach(track => {
      log('Adding track to peer connection:', track.kind);
      peerConnection.addTrack(track, stream);
    });

    if (isInitiator) {
      try {
        log('Creating offer as initiator');
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        log('Local description set. Sending offer.');
        dispatch(relaySignal({
          to: session.providerId,
          signal: { type: 'offer', sdp: offer.sdp },
          sessionId: session.id
        }));
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    }

    isInitialized.current = true;
  }, [createPeerConnection, startLocalStream, isInitiator, session, dispatch, log]);

  // Handle ICE candidate
  const handleICECandidate = useCallback(async (candidate) => {
    const peerConnection = peerConnectionRef.current;
    if (peerConnection && peerConnection.remoteDescription && peerConnection.remoteDescription.type) {
      try {
        await peerConnection.addIceCandidate(candidate);
        log('Added ICE candidate');
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    } else {
      iceCandidatesQueue.current.push(candidate);
      log('ICE candidate queued');
    }
  }, [log]);

  // Process ICE candidate queue
  const processIceCandidateQueue = useCallback(async () => {
    const peerConnection = peerConnectionRef.current;
    if (peerConnection && peerConnection.remoteDescription && peerConnection.remoteDescription.type) {
      log(`Processing ICE candidate queue. ${iceCandidatesQueue.current.length} candidates in queue.`);
      while (iceCandidatesQueue.current.length > 0) {
        const candidate = iceCandidatesQueue.current.shift();
        try {
          await peerConnection.addIceCandidate(candidate);
          log('Queued ICE candidate added');
        } catch (error) {
          console.error('Error adding queued ICE candidate:', error);
        }
      }
    }
  }, [log]);

  // Handle screen share started
  const handleScreenShareStarted = useCallback((data) => {
    log('Remote screen share started:', data);
    setIsRemoteScreenSharing(true);
    if (screenShareRef.current) {
      screenShareRef.current.handleRemoteScreenShareStarted(data);
    }
    setRemoteScreenShareStream(null);
  }, [log, setRemoteScreenShareStream]);
  
  // Handle screen share stopped
  const handleScreenShareStopped = useCallback((data) => {
    log('Remote screen share stopped:', data);
    setIsRemoteScreenSharing(false);
    if (remoteVideoRef.current) {
      const videoTrack = remoteVideoRef.current.srcObject.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.stop();
        remoteVideoRef.current.srcObject.removeTrack(videoTrack);
      }
    }
  }, [log]);

  // Handle incoming signal
  const handleSignal = useCallback(async (data) => {
    const peerConnection = peerConnectionRef.current;
    if (!peerConnection) {
      log('No PeerConnection available. Ignoring signal.');
      return;
    }
  
    const { signal, isScreenSharing } = data;
    log('Received signal:', signal.type, 'isScreenSharing:', isScreenSharing);
  
    try {
      if (signal.type === 'offer') {
        log('Processing offer');
        await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
        log('Remote description set for offer');
  
        const answer = await peerConnection.createAnswer();
        log('Created answer');
        await peerConnection.setLocalDescription(answer);
        log('Local description set for answer');
        
        dispatch(relaySignal({
          to: isInitiator ? session.providerId : session.initiatorId,
          signal: { type: 'answer', sdp: answer.sdp },
          sessionId: session.id,
          isScreenSharing
        }));
        log('Relayed answer signal');
  
        if (isScreenSharing) {
          log('Setting isRemoteScreenSharing to true');
          setIsRemoteScreenSharing(true);
          if (screenShareRef.current) {
            screenShareRef.current.handleRemoteScreenShareStarted({ from: data.from });
          }
        }
      } else if (signal.type === 'answer') {
        log('Processing answer');
        await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
        log('Remote description set for answer');
      } else if (signal.type === 'ice-candidate') {
        log('Processing ICE candidate');
        await peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
        log('ICE candidate added');
      }
  
      await processIceCandidateQueue();
      log('Processed ICE candidate queue');
    } catch (error) {
      console.error('Error handling signal:', error);
    }
  }, [dispatch, isInitiator, session, processIceCandidateQueue, log]);

  // Initialize peer connection on session change
  useEffect(() => {
    if (session && !isInitialized.current) {
      initializePeerConnection();
    }
  
    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      isInitialized.current = false;
    };
  }, [session, initializePeerConnection]);

  // Set up signal receiver
  useEffect(() => {
    liveExchangeService.onReceiveSignal(handleSignal);
    return () => {
      liveExchangeService.offReceiveSignal(handleSignal);
    };
  }, [handleSignal]);

  // Toggle video
  const handleToggleVideo = useCallback(() => {
    setIsVideoEnabled(prev => {
      const newState = !prev;
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach(track => {
          track.enabled = newState;
        });
      }
      dispatch(toggleVideo(session.id, newState));
      return newState;
    });
  }, [dispatch, session.id]);

  // Toggle audio
  const handleToggleAudio = useCallback(() => {
    setIsAudioEnabled(prev => {
      const newState = !prev;
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach(track => {
          track.enabled = newState;
          log(`Local audio track ${track.id} ${newState ? 'enabled' : 'disabled'}`);
          
          if (newState) {
            track.applyConstraints({
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }).catch(e => console.error('Error applying audio constraints:', e));
          }
        });
      }
      dispatch(toggleAudio(session.id, newState));
      return newState;
    });
  }, [dispatch, session.id, log]);

  // Handle remote track
  const handleRemoteTrack = useCallback((event) => {
    log('Received remote track', { kind: event.track.kind, id: event.track.id, label: event.track.label });
  
    const isScreenShare = event.track.label.includes('screen');
  
    if (event.track.kind === 'video') {
      log('Processing remote video track');
      if (isScreenShare) {
        log('Received screen sharing track');
        setRemoteScreenShareStream(new MediaStream([event.track]));
        if (screenShareRef.current) {
          screenShareRef.current.updateRemoteScreenShare(new MediaStream([event.track]));
        }
      } else {
        if (remoteVideoRef.current) {
          const currentStream = remoteVideoRef.current.srcObject || new MediaStream();
          const videoTracks = currentStream.getVideoTracks();
          videoTracks.forEach(track => currentStream.removeTrack(track));
          currentStream.addTrack(event.track);
          remoteVideoRef.current.srcObject = currentStream;
          log('Updated video track in remote video element');
        } else {
          log('Warning: remoteVideoRef is not available');
        }
      }
    } else if (event.track.kind === 'audio') {
      log('Processing remote audio track');
      if (remoteVideoRef.current) {
        const currentStream = remoteVideoRef.current.srcObject || new MediaStream();
        const audioTracks = currentStream.getAudioTracks();
        audioTracks.forEach(track => currentStream.removeTrack(track));
        currentStream.addTrack(event.track);
        remoteVideoRef.current.srcObject = currentStream;
        log('Updated audio track in remote video element');
      } else {
        log('Warning: remoteVideoRef is not available for audio');
      }
    }
  
    if (isScreenShare) {
      setIsRemoteScreenSharing(true);
    }
  }, [log, setRemoteScreenShareStream, setIsRemoteScreenSharing]);

  // Set up remote track handler
  useEffect(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.ontrack = handleRemoteTrack;
    }
  }, [handleRemoteTrack]);

  // Toggle screen share
  const handleToggleScreenShare = useCallback(async () => {
    log(`Toggling screen share. Current state: ${localIsScreenSharing}`);
    if (localIsScreenSharing) {
      dispatch(stopScreenShare(session.id));
      if (screenShareRef.current) {
        screenShareRef.current.handleStopScreenShare();
      }
      setLocalScreenShareStream(null);
      log('Screen share stopped');
    } else {
      dispatch(startScreenShare(session.id));
      if (screenShareRef.current) {
        try {
          const stream = await screenShareRef.current.startScreenShareProcess();
          setLocalScreenShareStream(stream);
          log('Screen share started', { streamId: stream.id });
        } catch (error) {
          console.error('Error starting screen share:', error);
        }
      }
    }
    setLocalIsScreenSharing(!localIsScreenSharing);
  }, [dispatch, localIsScreenSharing, session.id, log]);

  // Clean up screen share stream
  useEffect(() => {
    return () => {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }
    };
  }, []);

  // Update screen share state
  useEffect(() => {
    log(`Screen sharing state updated: local=${localIsScreenSharing}, remote=${isRemoteScreenSharing}`);
    if (isScreenSharing || isRemoteScreenSharing) {
      if (screenShareRef.current) {
        screenShareRef.current.updateScreenShareState(isScreenSharing, isRemoteScreenSharing);
      }
    }
  }, [isScreenSharing, isRemoteScreenSharing, localIsScreenSharing, log]);

  // Set up signal and screen share event listeners
  useEffect(() => {
    liveExchangeService.onReceiveSignal(handleSignal);
    liveExchangeService.onScreenShareStarted(handleScreenShareStarted);
    liveExchangeService.onScreenShareStopped(handleScreenShareStopped);

    return () => {
      liveExchangeService.offReceiveSignal(handleSignal);
      liveExchangeService.offScreenShareStarted(handleScreenShareStarted);
      liveExchangeService.offScreenShareStopped(handleScreenShareStopped);
    };
  }, [handleSignal, handleScreenShareStarted, handleScreenShareStopped]);

  // Handle sync editor signals
  useEffect(() => {
    const handleSyncEditorSignal = (data) => {
      if (data.type === 'sync_editor_operation' && dataChannel && dataChannel.readyState === 'open') {
        dataChannel.send(JSON.stringify(data));
      }
    };

    liveExchangeService.onReceiveSignal(handleSyncEditorSignal);

    return () => {
      liveExchangeService.offReceiveSignal(handleSyncEditorSignal);
    };
  }, [dataChannel]);

  // Handle ending the call
  const handleEndCall = useCallback(async () => {
    if (session && session.id) {
      try {
        await dispatch(endSession(session.id));
        
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(track => track.stop());
        }

        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
        }

        setIsVideoEnabled(false);
        setIsAudioEnabled(false);
        setLocalIsScreenSharing(false);
        setIsRemoteScreenSharing(false);

        navigate('/chat');
      } catch (error) {
        console.error('Error ending call:', error);
      }
    }
  }, [dispatch, session, navigate]);

  // Check if user is speaking
  const isSpeaking = (audioLevel) => audioLevel > 20;

  // Speaking border component
  const SpeakingBorder = ({ isActive }) => (
    <div className={`absolute inset-0 pointer-events-none ${isActive ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
      <div className="absolute inset-0 border-2 border-blue-500 rounded-lg"></div>
      <div className="absolute inset-0 border-2 border-blue-300 rounded-lg animate-pulse"></div>
    </div>
  );

  if (!session || !session.Exchange) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-gray-800 overflow-hidden">
      <div className="flex-grow flex justify-center items-center p-2 relative">
        <div className={`grid gap-4 w-full transition-all duration-300 ease-in-out ${
          localIsScreenSharing || isRemoteScreenSharing ? 'grid-cols-3' : 'grid-cols-2'
        }`} style={{ maxWidth: localIsScreenSharing || isRemoteScreenSharing ? '95%' : '1100px' }}>
          {(localIsScreenSharing || isRemoteScreenSharing) && (
            <div className="col-span-2 row-span-2 relative bg-black rounded-lg overflow-hidden shadow-md" style={{ aspectRatio: '16/9' }}>
              <ScreenShare
                ref={screenShareRef}
                isScreenSharing={localIsScreenSharing}
                isRemoteScreenSharing={isRemoteScreenSharing}
                session={session}
                peerConnection={peerConnectionRef.current}
                isInitiator={isInitiator}
                onScreenShareStart={handleScreenShareStarted}
                onScreenShareStop={handleScreenShareStopped}
                localVideoRef={localVideoRef}
                localStreamRef={localStreamRef}
                remoteScreenShareStream={remoteScreenShareStream}
                localScreenShareStream={localScreenShareStream}
              />
            </div>
          )}
          <div className="relative bg-black rounded-lg overflow-hidden shadow-md" style={{ aspectRatio: '16/9' }}>
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            <SpeakingBorder isActive={isSpeaking(localAudioLevel)} />
            <div className="absolute bottom-2 left-2 bg-gray-900 bg-opacity-75 text-white rounded-md py-0.5 px-2 text-xs font-medium">
              {localUserName} (You)
            </div>
          </div>
          <div className="relative bg-black rounded-lg overflow-hidden shadow-md" style={{ aspectRatio: '16/9' }}>
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <SpeakingBorder isActive={isSpeaking(remoteAudioLevel)} />
            <div className="absolute bottom-2 left-2 bg-gray-900 bg-opacity-75 text-white rounded-md py-0.5 px-2 text-xs font-medium">
              {remoteUserName}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-sm p-4 flex justify-center space-x-6">
        <button
          onClick={handleToggleAudio}
          className={`rounded-full p-4 focus:outline-none transition-colors duration-200 ease-in-out ${
            isAudioEnabled ? 'bg-white text-gray-800 hover:bg-gray-200' : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          <MicrophoneIcon className="h-8 w-8" />
        </button>
        <button
          onClick={handleToggleVideo}
          className={`rounded-full p-4 focus:outline-none transition-colors duration-200 ease-in-out ${
            isVideoEnabled ? 'bg-white text-gray-800 hover:bg-gray-200' : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          <VideoCameraIcon className="h-8 w-8" />
        </button>
        <button 
          onClick={handleEndCall}
          className="rounded-full bg-red-500 text-white p-4 focus:outline-none hover:bg-red-600 transition-colors duration-200 ease-in-out"
        >
          <PhoneIcon className="h-8 w-8 transform rotate-135" />
        </button>
        <button
          onClick={handleToggleScreenShare}
          className={`rounded-full p-4 focus:outline-none transition-colors duration-200 ease-in-out ${
            localIsScreenSharing ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-white text-gray-800 hover:bg-gray-200'
          }`}
        >
          <ComputerDesktopIcon className="h-8 w-8" />
        </button>
        <button
          onClick={onToggleChat}
          className={`rounded-full p-4 focus:outline-none transition-colors duration-200 ease-in-out ${
            isChatOpen ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-white text-gray-800 hover:bg-gray-200'
          }`}
        >
          <ChatBubbleLeftRightIcon className="h-8 w-8" />
        </button>
        <button
          onClick={() => setIsSyncEditorOpen(prev => !prev)}
          className={`rounded-full p-4 focus:outline-none transition-colors duration-200 ease-in-out ${
            isSyncEditorOpen ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-white text-gray-800 hover:bg-gray-200'
          }`}
        >
          <CodeBracketIcon className="h-8 w-8" />
        </button>
      </div>
      {isSyncEditorOpen && (
        <div className="absolute inset-0 pointer-events-auto">
          <SyncEditor
            isVisible={isSyncEditorOpen}
            onClose={() => setIsSyncEditorOpen(false)}
            dataChannel={dataChannel}
          />
        </div>
      )}
      {isChatOpen && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="pointer-events-auto h-full">
            <ChatWindow onClose={onToggleChat} isOpen={isChatOpen} />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;