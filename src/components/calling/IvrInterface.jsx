import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneCall, PhoneOff, Mic, MicOff, Settings, Keypad } from 'lucide-react';
import { UserAgent, Inviter } from 'sip.js';

const IvrInterface = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callStatus, setCallStatus] = useState('idle');
  const [connectionError, setConnectionError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [userAgent, setUserAgent] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const audioRef = useRef(null);

  // SIP Configuration
  const sipConfig = {
    serverIp: 'elitebmi.in',
    username: '1001',
    password: 'crm123'
  };

  // Initialize SIP UserAgent
  const initializeSip = async () => {
    try {
      setConnectionError('');
      setIsConnecting(true);
      setCallStatus('connecting');

      const uri = `sip:${sipConfig.username}@${sipConfig.serverIp}`;
      const transportOptions = {
        server: `ws://${sipConfig.serverIp}:8088/ws`,
        connectionTimeout: 10000,
      };

      const userAgentOptions = {
        uri,
        transportOptions,
        authorizationUsername: sipConfig.username,
        authorizationPassword: sipConfig.password,
        sessionDescriptionHandlerFactoryOptions: {
          constraints: {
            audio: true,
            video: false
          }
        },
      };

      const ua = new UserAgent(userAgentOptions);
      
      // Handle incoming calls
      ua.delegate = {
        onInvite: (invitation) => {
          console.log('Incoming call received');
        }
      };

      await ua.start();
      
      setUserAgent(ua);
      setIsConnected(true);
      setCallStatus('registered');
      setIsConnecting(false);
      
      console.log('SIP client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SIP:', error);
      setCallStatus('failed');
      setConnectionError(error.message || 'Failed to connect to SIP server');
      setIsConnecting(false);
    }
  };

  // Make call to IVR
  const makeIvrCall = async () => {
    if (!userAgent || !isConnected) {
      setConnectionError('SIP client not initialized');
      return;
    }

    try {
      setCallStatus('calling');
      
      const target = `sip:5000@${sipConfig.serverIp}`;
      const inviter = new Inviter(userAgent, target);
      
      setCurrentSession(inviter);
      
      // Handle session state changes
      inviter.stateChange.addListener((state) => {
        console.log('Session state:', state);
        if (state === 'Established') {
          setIsInCall(true);
          setCallStatus('active');
        } else if (state === 'Terminated') {
          setIsInCall(false);
          setCallStatus('registered');
          setCurrentSession(null);
        }
      });

      // Handle media stream
      inviter.on('trackAdded', () => {
        const sessionDescriptionHandler = inviter.sessionDescriptionHandler;
        if (sessionDescriptionHandler && sessionDescriptionHandler.remoteMediaStream) {
          const remoteStream = sessionDescriptionHandler.remoteMediaStream;
          if (audioRef.current) {
            audioRef.current.srcObject = remoteStream;
            audioRef.current.play().catch(error => {
              console.error('Error playing audio:', error);
            });
          }
        }
      });

      await inviter.invite();
      
      console.log('Call to IVR initiated');
    } catch (error) {
      console.error('Failed to make IVR call:', error);
      setCallStatus('failed');
      setConnectionError(error.message || 'Failed to make IVR call');
    }
  };

  // Hang up current call
  const hangupCall = async () => {
    if (currentSession) {
      try {
        await currentSession.bye();
        setIsInCall(false);
        setCallStatus('registered');
        setCurrentSession(null);
        console.log('Call ended');
      } catch (error) {
        console.error('Failed to hang up:', error);
      }
    }
  };

  // Send DTMF
  const sendDTMF = async (digit) => {
    if (currentSession && isInCall) {
      try {
        await currentSession.sessionDescriptionHandler.sendDtmf(digit);
        console.log(`DTMF sent: ${digit}`);
      } catch (error) {
        console.error('Failed to send DTMF:', error);
      }
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (currentSession && isInCall) {
      setIsMuted(!isMuted);
      // Mute/unmute logic would go here
      console.log(`Mute ${!isMuted ? 'enabled' : 'disabled'}`);
    }
  };

  // Disconnect SIP
  const disconnectSip = async () => {
    if (userAgent) {
      try {
        setIsConnecting(true);
        await hangupCall();
        await userAgent.stop();
        setUserAgent(null);
        setIsConnected(false);
        setCallStatus('idle');
        setConnectionError('');
        setIsConnecting(false);
        console.log('SIP client disconnected');
      } catch (error) {
        console.error('Error disconnecting:', error);
        setIsConnecting(false);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (userAgent) {
        userAgent.stop().catch(error => {
          console.error('Error stopping userAgent:', error);
        });
      }
    };
  }, [userAgent]);

  // Get status color
  const getStatusColor = () => {
    switch (callStatus) {
      case 'registered': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'calling': return 'text-yellow-600';
      case 'active': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Get status text
  const getStatusText = () => {
    switch (callStatus) {
      case 'registered': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'calling': return 'Calling IVR...';
      case 'active': return 'In IVR';
      case 'failed': return 'Failed';
      case 'idle': return 'Not Connected';
      default: return 'Unknown';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">IVR Interface</h3>
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {connectionError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          {connectionError}
        </div>
      )}

      {/* Audio element for remote media */}
      <audio ref={audioRef} autoPlay playsInline />

      {/* Connection Controls */}
      <div className="mb-6">
        {!isConnected ? (
          <button
            onClick={initializeSip}
            disabled={isConnecting}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center"
          >
            {isConnecting ? (
              <>
                <Settings className="w-5 h-5 mr-2 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Phone className="w-5 h-5 mr-2" />
                <span>Connect to IVR</span>
              </>
            )}
          </button>
        ) : (
          <div className="flex space-x-3">
            {!isInCall ? (
              <button
                onClick={makeIvrCall}
                disabled={isConnecting || callStatus === 'calling'}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center"
              >
                {callStatus === 'calling' ? (
                  <>
                    <PhoneCall className="w-5 h-5 mr-2 animate-pulse" />
                    <span>Calling...</span>
                  </>
                ) : (
                  <>
                    <PhoneCall className="w-5 h-5 mr-2" />
                    <span>Call IVR</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={hangupCall}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition flex items-center justify-center"
              >
                <PhoneOff className="w-5 h-5 mr-2" />
                <span>Hang Up</span>
              </button>
            )}
            <button
              onClick={disconnectSip}
              disabled={isConnecting}
              className="bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* In-call Controls */}
      {isInCall && (
        <div className="mb-6">
          <div className="flex justify-center space-x-4 mb-4">
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full ${isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'} hover:bg-gray-200 transition`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          </div>

          {/* DTMF Keypad */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
              <Keypad className="w-5 h-5 mr-2" />
              IVR Menu
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => sendDTMF(digit.toString())}
                  className="bg-white border border-gray-300 rounded-lg py-4 text-xl font-medium text-gray-800 hover:bg-gray-100 active:bg-gray-200 transition"
                >
                  {digit}
                </button>
              ))}
            </div>
            <div className="mt-3 text-sm text-gray-600">
              <p>Press 1 for Sales, 2 for Support</p>
            </div>
          </div>
        </div>
      )}

      {/* Connection Info */}
      {isConnected && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Connection Details</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><span className="font-medium">SIP URI:</span> sip:{sipConfig.username}@{sipConfig.serverIp}</p>
            <p><span className="font-medium">WebSocket:</span> ws://{sipConfig.serverIp}:8088/ws</p>
            <p><span className="font-medium">IVR Extension:</span> 5000</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default IvrInterface;