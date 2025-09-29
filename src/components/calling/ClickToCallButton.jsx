import React, { useState } from 'react';
import { Phone, PhoneCall } from 'lucide-react';
import callService from './CallService';

const ClickToCallButton = ({ phoneNumber, customerName, onCallLog, size = 'sm' }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCall = async (e) => {
    e.stopPropagation(); // Prevent row click events
    
    if (!phoneNumber) {
      alert('No phone number available');
      return;
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    
    if (!callService.isRegistered) {
      alert('Please connect to SIP server first using the Phone interface');
      return;
    }

    setIsLoading(true);
    
    try {
      await callService.makeCall(cleanNumber);
      
      // Log the call attempt
      if (onCallLog) {
        onCallLog({
          type: 'outbound_call',
          phoneNumber: cleanNumber,
          customerName: customerName || 'Unknown',
          timestamp: new Date(),
          status: 'initiated'
        });
      }
      
    } catch (error) {
      console.error('Failed to make call:', error);
      alert('Failed to make call: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'xs':
        return 'p-1 text-xs';
      case 'sm':
        return 'p-2 text-sm';
      case 'md':
        return 'p-3 text-base';
      case 'lg':
        return 'p-4 text-lg';
      default:
        return 'p-2 text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'xs':
        return 'w-3 h-3';
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-5 h-5';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-4 h-4';
    }
  };

  if (!phoneNumber) {
    return (
      <button
        disabled
        className={`${getButtonSize()} text-gray-400 cursor-not-allowed rounded-full`}
        title="No phone number available"
      >
        <Phone className={getIconSize()} />
      </button>
    );
  }

  return (
    <button
      onClick={handleCall}
      disabled={isLoading}
      className={`${getButtonSize()} text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-all duration-200 ${
        isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      title={`Call ${phoneNumber}${customerName ? ` (${customerName})` : ''}`}
    >
      {isLoading ? (
        <div className={`${getIconSize()} animate-spin rounded-full border-2 border-green-600 border-t-transparent`}></div>
      ) : (
        <PhoneCall className={getIconSize()} />
      )}
    </button>
  );
};

export default ClickToCallButton;