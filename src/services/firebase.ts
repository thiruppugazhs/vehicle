import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getMessaging, Messaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// Public Firebase Client configuration (Server secrets never exposed)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD-demo-key-fleetpulse-2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fleetpulse-prod.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fleetpulse-prod",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "fleetpulse-prod.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "102938475610",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:102938475610:web:8c9d2f4e6a1b",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-FPULSE2026"
};

// Initialize Firebase instance
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Messaging instance for Web Push Notifications (Requirement 7 & 64)
export let messaging: Messaging | null = null;

export async function initializeWebMessaging(): Promise<string | null> {
  try {
    const supported = await isSupported();
    if (!supported) return null;
    messaging = getMessaging(app);

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || 'BNd9283f...demo-vapid'
      });
      if (currentToken) {
        console.log('FCM Web Device Token generated:', currentToken);
        return currentToken;
      }
    }
  } catch (err) {
    console.log('Web push messaging registration skipped (fallback mode active):', err);
  }
  return null;
}

/**
 * Registers active device token to Firestore `device_tokens` collection (Requirement 8)
 */
export async function registerDeviceTokenInFirestore(
  userId: string,
  organizationId: string,
  fcmToken: string,
  platform: 'web' | 'android' | 'ios' = 'web'
): Promise<void> {
  try {
    const tokenDocRef = doc(db, 'device_tokens', `${userId}_${platform}`);
    await setDoc(tokenDocRef, {
      userId,
      organizationId,
      fcmToken,
      platform,
      active: true,
      lastActive: serverTimestamp(),
      createdAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('Could not register device token in Firestore:', err);
  }
}

/**
 * Subscribes to real-time changes in Firestore for a given organization collection
 */
export function subscribeToOrgCollection<T>(
  collectionName: string,
  organizationId: string,
  onData: (items: T[]) => void
): Unsubscribe {
  try {
    const q = query(
      collection(db, collectionName),
      where('organizationId', '==', organizationId)
    );
    return onSnapshot(q, snapshot => {
      const items: T[] = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() } as T);
      });
      onData(items);
    }, err => {
      console.warn(`Realtime Firestore listener for ${collectionName} warning (using cached state):`, err.message);
    });
  } catch (e) {
    console.warn(`Failed to attach listener for ${collectionName}:`, e);
    return () => {};
  }
}
