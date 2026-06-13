import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAr3arskRQdXyBhC1WBQBhFiPIA3l-fWzA',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'madhayana-80f71.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'madhayana-80f71',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'madhayana-80f71.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '948236566177',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:948236566177:web:c39b7a78876e72760d7ae0',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-8C0DB7EGYZ'
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logoutGoogle = () => signOut(auth);
export const listenAuth = (callback) => onAuthStateChanged(auth, callback);

export default app;
