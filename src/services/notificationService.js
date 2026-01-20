import { requestNotificationPermission, getMessagingToken } from '../utils/firebase';
import Api from '../components/utils/Api';

// Function to register device token with backend
export const registerDeviceToken = async (token, userId) => {
  try {
    const response = await Api.post(`/notifications/register-token`, {
      token,
      userId
    });
    return response.data;
  } catch (error) {
    console.error('Error registering device token:', error);
    throw error;
  }
};

// Function to subscribe user to notifications
export const subscribeToNotifications = async (userId) => {
  try {
    // Request notification permission
    const token = await requestNotificationPermission();
    
    if (token) {
      console.log('FCM Token:', token);
      
      // Register token with backend
      await registerDeviceToken(token, userId);
      
      return { success: true, token };
    } else {
      console.log('No token obtained, permission denied');
      return { success: false, token: null };
    }
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    return { success: false, error };
  }
};

// Function to fetch user notifications
export const getUserNotifications = async (userId, page = 1, limit = 20) => {
  try {
    const response = await Api.get(`/notifications`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Function to fetch current user notifications
export const getCurrentUserNotifications = async (page = 1, limit = 20) => {
  try {
    const response = await Api.get(`/notifications`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Function to mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await Api.put(
      `/notifications/${notificationId}/read`,
      {}
    );
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Function to mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await Api.put(
      `/notifications/read-all`,
      {}
    );
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Function to get unread count
export const getUnreadCount = async () => {
  try {
    const response = await Api.get(`/notifications/unread-count`);
    // Return just the count value, not the whole response
    return response.data?.data || { count: 0 };
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
};