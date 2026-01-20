// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCaPBdk78BjeKdI9jA6uU-uwQwgGKNcg30",
  authDomain: "elite-crm-800ce.firebaseapp.com",
  projectId: "elite-crm-800ce",
  storageBucket: "elite-crm-800ce.firebasestorage.app",
  messagingSenderId: "14669955388",
  appId: "1:14669955388:web:e43662df822ee5c0fcde39",
  measurementId: "G-0GEFSN65CF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request notification permission and get token
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      // Get registration token
      const token = await getToken(messaging, {
        vapidKey: window._env_?.REACT_APP_FIREBASE_VAPID_KEY || process.env.REACT_APP_FIREBASE_VAPID_KEY
      });
      
      return token;
    } else {
      console.log('Unable to get permission to notify.');
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

// Handle foreground messages
export const onForegroundMessage = () => {
  return new Promise((resolve, reject) => {
    onMessage(messaging, (payload) => {
      console.log('Foreground message received: ', payload);
      resolve(payload);
    });
  });
};

// Get token without VAPID key (alternative method)
export const getMessagingToken = async () => {
  try {
    // Ensure service worker is registered first
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered:', registration);
    }
    
    const currentToken = await getToken(messaging, {
      vapidKey: window._env_?.REACT_APP_FIREBASE_VAPID_KEY || process.env.REACT_APP_FIREBASE_VAPID_KEY
    });
    
    return currentToken;
  } catch (err) {
    console.error('An error occurred while retrieving token:', err);
    return null;
  }
};

export { messaging, app };