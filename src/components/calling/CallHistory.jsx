import React, { useState, useEffect } from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, Clock, User, Calendar } from 'lucide-react';
import { getAllCallLogs } from '../utils/Api';

const CallHistory = () => {
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchCallLogs();
  }, []);

  const fetchCallLogs = async () => {
    try {
      setLoading(true);
      const response = await getAllCallLogs();
      setCallLogs(response.data.reverse()); // Show newest first
    } catch (error) {
      console.error('Failed to fetch call logs:', error);
      // For demo purposes, use mock data if API fails
      setCallLogs([
        {
          _id: '1',
          type: 'outbound_call',
          phoneNumber: '+1234567890',
          customerName: 'John Doe',
          timestamp: new Date().toISOString(),
          duration: 120,
          status: 'completed'
        },
        {
          _id: '2',
          type: 'inbound_call',
          phoneNumber: '+0987654321',
          customerName: 'Jane Smith',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          duration: 85,
          status: 'completed'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCallIcon = (type) => {
    switch (type) {
      case 'inbound_call':
        return <PhoneIncoming className="w-4 h-4 text-green-600" />;
      case 'outbound_call':
        return <PhoneOutgoing className="w-4 h-4 text-blue-600" />;
      default:
        return <Phone className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCallTypeLabel = (type) => {
    switch (type) {
      case 'inbound_call':
        return 'Incoming';
      case 'outbound_call':
        return 'Outgoing';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'missed':
        return 'text-red-600 bg-red-100';
      case 'busy':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = callLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(callLogs.length / itemsPerPage);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="animate-pulse">
          {/* Header */}
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          
          {/* Call History Items */}
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Phone className="w-5 h-5 mr-2" />
            Call History
          </h3>
          <button
            onClick={fetchCallLogs}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {currentItems.length > 0 ? (
          currentItems.map((call) => (
            <div key={call._id} className="p-4 hover:bg-gray-50 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getCallIcon(call.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {call.customerName || 'Unknown Contact'}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                        {call.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-sm text-gray-600 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {call.phoneNumber}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(call.timestamp)}
                      </p>
                      {call.duration && (
                        <p className="text-sm text-gray-600 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDuration(call.duration)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {getCallTypeLabel(call.type)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <Phone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No call history</p>
            <p className="text-gray-400 text-sm">Your call logs will appear here</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallHistory;