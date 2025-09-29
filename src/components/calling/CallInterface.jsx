import React, { useState, useEffect } from 'react';
import { Phone, PhoneCall, PhoneOff, Mic, MicOff, Settings } from 'lucide-react';
import callService from './CallService';

const CallInterface = ({ onCallLog }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callStatus, setCallStatus] = useState('idle');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [sipConfig, setSipConfig] = useState({
    sipServer: 'localhost',
    username: '',
    password: '',
    domain: 'localhost'
  });

  useEffect(() => {
    // Set up call service callbacks
    callService.setCallbacks({
      onRegistered: () => {
        setIsConnected(true);
        setCallStatus('registered');
      },
      onUnregistered: () => {
        setIsConnected(false);
        setCallStatus('disconnected');
      },
      onCallReceived: (callerNumber) => {
        setCallStatus('incoming');
        setPhoneNumber(callerNumber);
      },
      onCallStarted: () => {
        setIsInCall(true);
        setCallStatus('active');
        // Log call start
        if (onCallLog) {
          onCallLog({
            type: 'call_started',
            phoneNumber,
            timestamp: new Date(),
            duration: 0
          });
        }
      },
      onCallEnded: () => {
        setIsInCall(false);
        setCallStatus('registered');
        // Log call end
        if (onCallLog) {
          onCallLog({
            type: 'call_ended',
            phoneNumber,
            timestamp: new Date()
          });
        }
        setPhoneNumber('');
      },
      onCallFailed: (error) => {
        setCallStatus('failed');
        console.error('Call failed:', error);
      }
    });

    return () => {
      callService.disconnect();
    };
  }, [onCallLog, phoneNumber]);

  const handleConnect = async () => {
    try {
      await callService.initialize(sipConfig);
    } catch (error) {
      console.error('Connection failed:', error);
      setCallStatus('failed');
    }
  };

  const handleDisconnect = async () => {
    await callService.disconnect();
    setIsConnected(false);
    setCallStatus('idle');
  };

  const handleMakeCall = async () => {
    if (!phoneNumber.trim()) return;
    
    try {
      setCallStatus('calling');
      await callService.makeCall(phoneNumber);
    } catch (error) {
      setCallStatus('failed');
    }
  };

  const handleAnswerCall = async () => {
    try {
      await callService.answerCall();
    } catch (error) {
      console.error('Failed to answer:', error);
    }
  };

  const handleHangup = async () => {
    await callService.hangup();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Implement mute functionality with WebRTC
  };

  const getStatusColor = () => {
    switch (callStatus) {
      case 'registered': return 'text-green-600';
      case 'calling': return 'text-yellow-600';
      case 'active': return 'text-blue-600';
      case 'incoming': return 'text-purple-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'registered': return 'Connected';
      case 'calling': return 'Calling...';
      case 'active': return 'In Call';
      case 'incoming': return 'Incoming Call';
      case 'failed': return 'Failed';
      case 'disconnected': return 'Disconnected';
      default: return 'Not Connected';
    }
  };

  if (showSettings) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">SIP Settings</h3>
          <button
            onClick={() => setShowSettings(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SIP Server
            </label>
            <input
              type="text"
              value={sipConfig.sipServer}
              onChange={(e) => setSipConfig({...sipConfig, sipServer: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="localhost or your.asterisk.server"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={sipConfig.username}
              onChange={(e) => setSipConfig({...sipConfig, username: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="SIP extension number"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={sipConfig.password}
              onChange={(e) => setSipConfig({...sipConfig, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="SIP password"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain
            </label>
            <input
              type="text"
              value={sipConfig.domain}
              onChange={(e) => setSipConfig({...sipConfig, domain: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="SIP domain"
            />
          </div>
          
          <button
            onClick={() => setShowSettings(false)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            Save Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Phone</h3>
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          <button
            onClick={() => setShowSettings(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isConnected ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Configure SIP settings and connect to start making calls
          </p>
          <button
            onClick={handleConnect}
            disabled={!sipConfig.username || !sipConfig.password}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            <div className="flex items-center justify-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>Connect</span>
            </div>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {callStatus === 'incoming' ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Incoming call from: {phoneNumber}</p>
              <div className="flex space-x-2">
                <button
                  onClick={handleAnswerCall}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <PhoneCall className="w-4 h-4" />
                    <span>Answer</span>
                  </div>
                </button>
                <button
                  onClick={handleHangup}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <PhoneOff className="w-4 h-4" />
                    <span>Decline</span>
                  </div>
                </button>
              </div>
            </div>
          ) : isInCall ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Connected to: {phoneNumber}</p>
              <div className="flex space-x-2">
                <button
                  onClick={toggleMute}
                  className={`flex-1 py-2 px-4 rounded-md transition ${
                    isMuted ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                  </div>
                </button>
                <button
                  onClick={handleHangup}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <PhoneOff className="w-4 h-4" />
                    <span>Hang Up</span>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleMakeCall}
                  disabled={!phoneNumber.trim() || callStatus === 'calling'}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <PhoneCall className="w-4 h-4" />
                    <span>{callStatus === 'calling' ? 'Calling...' : 'Call'}</span>
                  </div>
                </button>
                <button
                  onClick={handleDisconnect}
                  className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition"
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CallInterface;