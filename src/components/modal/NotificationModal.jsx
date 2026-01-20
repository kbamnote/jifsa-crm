import React, { useState, useEffect } from 'react';
import { X, Bell, CheckCircle, AlertCircle, Users, BarChart3, Info, Clock, Mail, DollarSign, Briefcase, GraduationCap } from 'lucide-react';
import { getCurrentUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../services/notificationService';

const NotificationModal = ({ onClose, onMarkAsRead }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadNotifications(currentPage);
  }, [activeTab]);

  const loadNotifications = async (page) => {
    try {
      setLoading(true);
      const response = await getCurrentUserNotifications(page, 10);
      console.log('Notification API Response:', response); // Debug log
      
      // Check if response has the expected structure
      if (response && response.success) {
        setNotifications(prev => page === 1 ? response.data : [...prev, ...response.data]);
        
        // Check if response has pagination info
        if (response.pagination) {
          setHasMore(response.pagination.currentPage < response.pagination.totalPages);
        } else {
          // If no pagination info, assume no more data
          setHasMore(false);
        }
      } else {
        console.error('Unexpected response format:', response);
        setNotifications([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadNotifications(nextPage);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      onMarkAsRead && onMarkAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'lead': return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'team': return <Users className="w-5 h-5 text-green-500" />;
      case 'report': return <BarChart3 className="w-5 h-5 text-purple-500" />;
      case 'system': return <Info className="w-5 h-5 text-yellow-500" />;
      case 'payment': return <DollarSign className="w-5 h-5 text-emerald-500" />;
      case 'b2b': return <Briefcase className="w-5 h-5 text-indigo-500" />;
      case 'enrollment': return <GraduationCap className="w-5 h-5 text-orange-500" />;
      case 'intern': return <Users className="w-5 h-5 text-teal-500" />;
      case 'social_media': return <Mail className="w-5 h-5 text-pink-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'lead': return 'Lead';
      case 'team': return 'Team';
      case 'report': return 'Report';
      case 'system': return 'System';
      case 'payment': return 'Payment';
      case 'b2b': return 'B2B';
      case 'enrollment': return 'Enrollment';
      case 'intern': return 'Intern';
      case 'social_media': return 'Social Media';
      default: return 'General';
    }
  };

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'high': return 'border-l-4 border-red-500 bg-red-50';
      case 'medium': return 'border-l-4 border-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-4 border-green-500 bg-green-50';
      default: return 'border-l-4 border-gray-300 bg-gray-50';
    }
  };

  const filteredNotifications = activeTab === 'all' 
    ? (notifications || [])
    : (notifications || []).filter(n => n.type === activeTab);

  const unreadCount = (notifications || []).filter(n => !n.isRead).length;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Mark All Read
            </button>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex px-6">
            {[
              { key: 'all', label: 'All' },
              { key: 'lead', label: 'Leads' },
              { key: 'team', label: 'Team' },
              { key: 'report', label: 'Reports' },
              { key: 'system', label: 'System' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setCurrentPage(1);
                  setNotifications([]);
                }}
                className={`px-4 py-3 text-sm font-medium capitalize ${
                  activeTab === tab.key
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No notifications yet</p>
              <p className="text-gray-400 text-sm mt-1">New notifications will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map(notification => (
                <div 
                  key={notification._id}
                  className={`${getPriorityClass(notification.priority)} p-4 transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(notification.createdAt).toLocaleString()}</span>
                        <span>•</span>
                        <span className="capitalize">{getTypeLabel(notification.type)}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasMore && !loading && (
            <div className="p-4 text-center">
              <button 
                onClick={handleLoadMore}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              View All Notifications
            </button>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;