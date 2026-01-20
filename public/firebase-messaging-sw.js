// Give the service worker access to Firebase Messaging
// Note: This cannot be an ES module (uses importScripts)
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Your web app's Firebase configuration
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
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});