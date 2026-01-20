import React, { useState, useEffect } from "react";
import { Building2, Calendar, MoreVertical, Bell } from "lucide-react";
import logo from '../../assets/image.png'
import NotificationModal from '../modal/NotificationModal';
import { getUnreadCount } from '../../services/notificationService';

const Header = () => {
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Poll for unread notifications
    const fetchUnreadCount = async () => {
      try {
        const response = await getUnreadCount();
        setUnreadCount(response.count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
    
    // Set up interval to periodically check for new notifications
    const interval = setInterval(fetchUnreadCount, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Elite Dashboard</h1>
                  <p className="text-xs sm:text-sm text-gray-600">Client Management System</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotificationModal(true)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                >
                  <Bell className="w-6 h-6 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </div>
              
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-700 font-bold">
                <Calendar className="w-4 h-4" />
                <span>{new Date().toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })}</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      {showNotificationModal && (
        <NotificationModal 
          onClose={() => setShowNotificationModal(false)}
          onMarkAsRead={() => {
            // Refresh unread count after marking as read
            getUnreadCount().then(response => {
              setUnreadCount(response.count);
            }).catch(error => {
              console.error('Error refreshing unread count:', error);
            });
          }}
        />
      )}
    </div>
  );
};

export default Header;