import React, { useEffect, useRef, useCallback, forwardRef, useState, useImperativeHandle } from 'react';
import { useDispatch } from 'react-redux';
import { startScreenShare, stopScreenShare } from '../../redux/actions/liveExchangeActions';
import liveExchangeService from '../../services/liveExchangeService';

// ScreenShare component for handling screen sharing functionality
const ScreenShare = forwardRef(({ 
  peerConnection, 
  isInitiator, 
  isScreenSharing, 
  isRemoteScreenSharing: propIsRemoteScreenSharing, 
  session, 
  onScreenShareStart, 
  onScreenShareStop,
  localVideoRef,
  localStreamRef,
  remoteScreenShareStream,
  localScreenShareStream
}, ref) => {
  const dispatch = useDispatch();
  const [localIsScreenSharing, setLocalIsScreenSharing] = useState(isScreenSharing);
  const [isRemoteScreenSharing, setIsRemoteScreenSharing] = useState(propIsRemoteScreenSharing);
  const containerRef = useRef(null);
  const screenVideoRef = useRef(null);
  const screenStreamRef = useRef(null);
  const isStartingScreenShare = useRef(false);
  const [isScreenShareInitiated, setIsScreenShareInitiated] = useState(false);

  // Logging function
  const log = useCallback((message, ...args) => {
    console.log(`[ScreenShare] ${message}`, ...args);
  }, []);

  // Handle screen share signal
  const handleScreenShareSignal = useCallback(async ({ from, signal, isScreenSharing }) => {
    log('Received screen share signal', { from, signalType: signal.type, isScreenSharing });
  
    try {
      if (signal.type === 'offer') {
        log('Processing screen share offer');
        await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
        log('Remote description set for screen share offer');
        
        const answer = await peerConnection.createAnswer();
        log('Created answer for screen share offer');
        
        await peerConnection.setLocalDescription(answer);
        log('Local description set for screen share answer');
        
        liveExchangeService.emitScreenShareSignal({
          to: from,
          signal: answer,
          sessionId: session.id,
          isScreenSharing: true
        });
        log('Emitted screen share answer');
        
        setIsRemoteScreenSharing(true);
      } else if (signal.type === 'answer') {
        log('Processing screen share answer');
        await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
        log('Remote description set for screen share answer');
      } else if (signal.type === 'ice-candidate') {
        log('Adding ICE candidate for screen share');
        await peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
        log('ICE candidate added for screen share');
      }
  
      // Handle both local and remote screen sharing
      if (isScreenSharing) {
        log('Handling screen share video track');
        let screenTrack;
  
        if (localIsScreenSharing) {
          screenTrack = screenStreamRef.current.getVideoTracks()[0];
          log('Using local screen share track', { trackId: screenTrack.id });
        } else {
          screenTrack = peerConnection.getReceivers()
            .find(receiver => receiver.track.kind === 'video')
            ?.track;
          log('Found remote screen share track', { trackId: screenTrack?.id });
        }
  
        if (screenTrack) {
          if (screenVideoRef.current) {
            const newStream = new MediaStream([screenTrack]);
            screenVideoRef.current.srcObject = newStream;
            try {
              await screenVideoRef.current.play();
              log('Started playing screen share');
            } catch (error) {
              log('Error playing screen share:', error);
            }
            log('Set new stream to video element');
          } else {
            log('Warning: screenVideoRef is not available');
          }
        } else {
          log('No screen share video track found');
        }
      }
    } catch (error) {
      console.error('Error handling screen share signal:', error);
    }
  }, [log, session.id, peerConnection, localIsScreenSharing]);

  // Update screen share state
  const updateScreenShareState = useCallback((isLocalScreenSharing, isRemoteScreenSharing) => {
    log(`Updating screen share state: local=${isLocalScreenSharing}, remote=${isRemoteScreenSharing}`);
    setLocalIsScreenSharing(isLocalScreenSharing);
    setIsRemoteScreenSharing(isRemoteScreenSharing);
  }, [log]);

  // Start screen share process
  const startScreenShareProcess = useCallback(async () => {
    if (isStartingScreenShare.current) return;
    isStartingScreenShare.current = true;
    setIsScreenShareInitiated(true);
  
    try {
      log('Starting screen share process');
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = stream;
      
      log('Screen share stream obtained', { streamId: stream.id });
      
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
        log('Set screen share stream to screen video element', { streamId: stream.id });
      }
  
      const screenTrack = stream.getVideoTracks()[0];
      log('Screen track obtained', { trackId: screenTrack.id });
  
      // Store the original video track
      const originalVideoTrack = localStreamRef.current.getVideoTracks()[0];
      log('Original video track', { trackId: originalVideoTrack.id });
      
      // Replace the existing video track with the screen share track
      const sender = peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
      if (sender) {
        await sender.replaceTrack(screenTrack);
        log('Replaced existing video track with screen share track', { senderId: sender.id });
      } else {
        peerConnection.addTrack(screenTrack, stream);
        log('Added new screen share track to peer connection');
      }
  
      // Update local video display to show the original camera feed
      if (localVideoRef.current) {
        const localStream = new MediaStream([originalVideoTrack]);
        localVideoRef.current.srcObject = localStream;
        log('Set original video track to local video element', { streamId: localStream.id });
      }
  
      log('Creating offer for screen share');
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
  
      log('Emitting screen share signal');
      liveExchangeService.emitScreenShareSignal({
        to: isInitiator ? session.providerId : session.initiatorId,
        signal: peerConnection.localDescription,
        sessionId: session.id,
        isScreenSharing: true
      });
  
      log('Emitting start screen share event');
      liveExchangeService.emitStartScreenShare({ sessionId: session.id, userId: session.initiatorId });
      
      screenTrack.onended = () => {
        log('Screen share track ended');
        handleStopScreenShare();
      };
  
      dispatch(startScreenShare());
      onScreenShareStart();
      setLocalIsScreenSharing(true);
  
    } catch (error) {
      console.error('Error starting screen share:', error);
      dispatch(stopScreenShare());
      setIsScreenShareInitiated(false);
    } finally {
      isStartingScreenShare.current = false;
    }
  }, [dispatch, isInitiator, peerConnection, session, onScreenShareStart, log, setLocalIsScreenSharing, localVideoRef, localStreamRef]);

  // Handle stopping screen share
  const handleStopScreenShare = useCallback(() => {
    log('Stopping screen share');
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => {
        track.stop();
        const sender = peerConnection.getSenders().find(s => s.track === track);
        if (sender) {
          peerConnection.removeTrack(sender);
        }
      });
      screenStreamRef.current = null;
    }
  
    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = null;
    }
  
    // Restore original video track
    const originalVideoTrack = localStreamRef.current.getVideoTracks()[0];
    const sender = peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
    if (sender && originalVideoTrack) {
      sender.replaceTrack(originalVideoTrack);
      log('Restored original video track', { trackId: originalVideoTrack.id });
    }
  
    // Update local video display
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      log('Restored local video display', { streamId: localStreamRef.current.id });
    }
  
    dispatch(stopScreenShare());
    liveExchangeService.emitStopScreenShare({ sessionId: session.id, userId: session.initiatorId });
    onScreenShareStop();
    setLocalIsScreenSharing(false);
  }, [dispatch, onScreenShareStop, session.id, log, peerConnection, localVideoRef, localStreamRef]);

  // Update screen video source
  useEffect(() => {
    if (screenVideoRef.current) {
      if (localIsScreenSharing && localScreenShareStream) {
        screenVideoRef.current.srcObject = localScreenShareStream;
        log('Set local screen share stream to video element', { streamId: localScreenShareStream.id });
      } else if (isRemoteScreenSharing && remoteScreenShareStream) {
        screenVideoRef.current.srcObject = remoteScreenShareStream;
        log('Set remote screen share stream to video element', { streamId: remoteScreenShareStream.id });
      } else {
        screenVideoRef.current.srcObject = null;
        log('Cleared screen share video element');
      }
    }
  }, [localIsScreenSharing, isRemoteScreenSharing, localScreenShareStream, remoteScreenShareStream, log]);

  // Handle remote screen share started
  const handleRemoteScreenShareStarted = useCallback(async (data) => {
    log('Remote screen share started', data);
    setIsRemoteScreenSharing(true);

    log('Waiting for screen sharing track');
    const screenTrack = await new Promise((resolve) => {
      const onTrack = (event) => {
        log('Received new track', { kind: event.track.kind, id: event.track.id });
        if (event.track.kind === 'video' && event.track.label.includes('screen')) {
          peerConnection.removeEventListener('track', onTrack);
          resolve(event.track);
        }
      };
      peerConnection.addEventListener('track', onTrack);
    });

    log('Screen sharing track received', { trackId: screenTrack.id });

    if (screenVideoRef.current) {
      const newStream = new MediaStream([screenTrack]);
      screenVideoRef.current.srcObject = newStream;
      log('Set new stream to video element', { streamId: newStream.id });
    } else {
      log('Warning: screenVideoRef is not available');
    }
  }, [log, peerConnection]);

  // Handle remote screen share stopped
  const handleRemoteScreenShareStopped = useCallback((data) => {
    log('Remote screen share stopped', data);
    setIsRemoteScreenSharing(false);
    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = null;
      log('Cleared screen video element');
    }
  }, [log]);

  // Set up event listeners
  useEffect(() => {
    log('Setting up event listeners');
    liveExchangeService.onScreenShareSignal(handleScreenShareSignal);
    liveExchangeService.onScreenShareStarted(handleRemoteScreenShareStarted);
    liveExchangeService.onScreenShareStopped(handleRemoteScreenShareStopped);

    return () => {
      log('Removing event listeners');
      liveExchangeService.offScreenShareSignal(handleScreenShareSignal);
      liveExchangeService.offScreenShareStarted(handleRemoteScreenShareStarted);
      liveExchangeService.offScreenShareStopped(handleRemoteScreenShareStopped);
    };
  }, [handleScreenShareSignal, handleRemoteScreenShareStarted, handleRemoteScreenShareStopped, log]);

  // Handle screen sharing state changes
  useEffect(() => {
    if (isScreenSharing && !screenStreamRef.current && !isStartingScreenShare.current) {
      log('Triggering screen share start process');
      startScreenShareProcess();
    } else if (!isScreenSharing && screenStreamRef.current) {
      log('Triggering screen share stop process');
      handleStopScreenShare();
    }
  }, [isScreenSharing, startScreenShareProcess, handleStopScreenShare, log]);

  // Update local screen sharing state
  useEffect(() => {
    setLocalIsScreenSharing(isScreenSharing);
  }, [isScreenSharing]);

  // Update remote screen sharing state
  useEffect(() => {
    setIsRemoteScreenSharing(propIsRemoteScreenSharing);
  }, [propIsRemoteScreenSharing]);

  // Update remote screen share stream
  useEffect(() => {
    if (isRemoteScreenSharing && remoteScreenShareStream && screenVideoRef.current) {
      log('Setting remote screen share stream to video element');
      screenVideoRef.current.srcObject = remoteScreenShareStream;
    }
  }, [isRemoteScreenSharing, remoteScreenShareStream, log]);

  // Update remote screen share
  const updateRemoteScreenShare = useCallback((stream) => {
    log('Updating remote screen share');
    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = stream;
      log('Set remote screen share stream to video element');
    }
  }, [log]);

  // Render screen content
  const renderScreenContent = () => {
    if (localIsScreenSharing) {
      return (
        <video
          ref={screenVideoRef}
          autoPlay
          playsInline
          className="absolute w-full h-full object-contain"
          srcObject={localScreenShareStream}
        />
      );
    } else if (isRemoteScreenSharing) {
      return (
        <video
          ref={screenVideoRef}
          autoPlay
          playsInline
          className="absolute w-full h-full object-contain"
        />
      );
    }
    return null;
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    startScreenShareProcess,
    handleStopScreenShare,
    handleRemoteScreenShareStarted,
    handleRemoteScreenShareStopped,
    updateScreenShareState,
    updateRemoteScreenShare
  }));

  return (
    <div ref={containerRef} className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {(localIsScreenSharing || isRemoteScreenSharing) && (
        <div className="relative w-full h-full">
          <video
            ref={screenVideoRef}
            autoPlay
            playsInline
            className="absolute w-full h-full object-contain"
          />
          {localIsScreenSharing && (
            <button
              onClick={handleStopScreenShare}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors z-10"
            >
              Stop Sharing
            </button>
          )}
          <div className="absolute bottom-2 left-2 bg-gray-900 bg-opacity-75 text-white rounded-lg py-1 px-3 text-sm font-medium">
            {localIsScreenSharing ? 'Your Screen' : 'Remote Screen'}
          </div>
        </div>
      )}
      {!localIsScreenSharing && !isRemoteScreenSharing && (
        <div className="p-4 h-full flex items-center justify-center">
          <button
            onClick={startScreenShareProcess}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded transition-colors"
          >
            Start Screen Share
          </button>
        </div>
      )}
    </div>
  );
});

export default ScreenShare;