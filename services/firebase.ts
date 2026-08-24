import { getApps, initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
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

// Firebase Auth
//
// Keep getAuth(app) here because Firebase v12.18.0's default
// TypeScript entrypoint does not expose getReactNativePersistence,
// while Metro's React Native bundle does have RN-specific behavior.
//
// Most importantly, this keeps the existing anonymous-auth flow
// used by AppContext intact.
//
// Explicit Auth type prevents the previous:
//
//   Variable 'auth' implicitly has type 'any'
//
// TypeScript error.

export const auth: Auth = getAuth(app);

export default app;
