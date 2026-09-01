importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyD-demo-key-fleetpulse-2026",
  authDomain: "fleetpulse-prod.firebaseapp.com",
  projectId: "fleetpulse-prod",
  storageBucket: "fleetpulse-prod.appspot.com",
  messagingSenderId: "102938475610",
  appId: "1:102938475610:web:8c9d2f4e6a1b"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background push:', payload);
  const notificationTitle = payload.notification.title || 'FleetPulse Alert';
  const notificationOptions = {
    body: payload.notification.body || 'A service or repair milestone requires attention.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
