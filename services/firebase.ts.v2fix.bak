import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import {
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCSUFhcnN5zZgRjxNvylglQiMeNSVu0Zvs',
  authDomain: 'bookmyslot-1264c.firebaseapp.com',
  projectId: 'bookmyslot-1264c',
  storageBucket: 'bookmyslot-1264c.firebasestorage.app',
  messagingSenderId: '139153043703',
  appId: '1:139153043703:web:95935dfaf328eeef1fe3f2',
  measurementId: 'G-EGSJ3Q87D2',
};

// Firebase App — Singleton
const app = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseConfig);

// Firestore
export const db = getFirestore(app);

// Firebase Auth — React Native persistent auth
let auth: Auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error: any) {
  // If Auth was already initialized by another module,
  // retrieve the existing Auth instance.
  if (error?.code === 'auth/already-initialized') {
    const { getAuth } = require('firebase/auth');
    auth = getAuth(app);
  } else {
    throw error;
  }
}

export { auth };

export default app;