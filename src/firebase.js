import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAr3arskRQdXyBhC1WBQBhFiPIA3l-fWzA',
  authDomain: 'madhayana-80f71.firebaseapp.com',
  projectId: 'madhayana-80f71',
  storageBucket: 'madhayana-80f71.firebasestorage.app',
  messagingSenderId: '948236566177',
  appId: '1:948236566177:web:c39b7a78876e72760d7ae0',
  measurementId: 'G-8C0DB7EGYZ'
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logoutGoogle = () => signOut(auth);
export const listenAuth = (callback) => onAuthStateChanged(auth, callback);
export default app;
