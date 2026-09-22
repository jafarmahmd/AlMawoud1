import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  updateDoc,
  writeBatch
} from 'firebase/firestore';

// Default configuration from user's Firebase project
const defaultFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyASzyLMukZOuYT-whPgrHInsglx6LD08Tw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "scout-app-194f4.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "scout-app-194f4",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "scout-app-194f4.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1013985360894",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1013985360894:web:6082ead3a39846d2f5deaf"
};

// Check if user stored custom firebase config in localStorage or env
export const getActiveFirebaseConfig = () => {
  const localConfigStr = localStorage.getItem('scout_firebase_config');
  if (localConfigStr) {
    try {
      const parsed = JSON.parse(localConfigStr);
      if (parsed.projectId) return parsed;
    } catch (e) {
      console.error("Invalid local firebase config", e);
    }
  }
  return defaultFirebaseConfig;
};

export const isFirebaseConfigured = () => {
  const config = getActiveFirebaseConfig();
  return Boolean(config.apiKey && config.projectId);
};

let dbInstance: ReturnType<typeof getFirestore> | null = null;

export const getFirebaseDb = () => {
  if (dbInstance) return dbInstance;
  const config = getActiveFirebaseConfig();
  if (!config.projectId) return null;

  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(config);
    dbInstance = getFirestore(app);
    return dbInstance;
  } catch (err) {
    console.error("Failed to initialize Firebase:", err);
    return null;
  }
};

export { collection, doc, setDoc, getDocs, onSnapshot, deleteDoc, updateDoc, writeBatch };
