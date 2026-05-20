import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, enableMultiTabIndexedDbPersistence, collection, doc, setDoc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";

// Parse firebase config from env vars
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if config exists, to avoid crashing when previewing without setup
const isConfigured = !!firebaseConfig.apiKey;

export const app = getApps().length === 0 && isConfigured ? initializeApp(firebaseConfig) : (isConfigured ? getApp() : null);
export const db = app ? getFirestore(app) : null;

if (db) {
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    console.error("Firebase persistence error", err);
  });
}

// Helper to provide a completely local fallback if Firebase isn't set up yet, 
// so the UI can be showcased without requiring instant backend setup.
class LocalMockDB {
  private data: any = {
    teams: {},
    games: {},
    submissions: {},
    interactions: {}
  };
  private listeners: any = {};

  doc(path: string) {
    return { path };
  }
  
  onSnapshot(path: string, callback: any) {
    if (!this.listeners[path]) this.listeners[path] = [];
    this.listeners[path].push(callback);
    callback({ data: () => this.data[path] || null, exists: () => !!this.data[path] });
    return () => {
      this.listeners[path] = this.listeners[path].filter((cb: any) => cb !== callback);
    };
  }

  set(path: string, val: any) {
    this.data[path] = val;
    this.trigger(path);
  }

  update(path: string, val: any) {
    if (!this.data[path]) this.data[path] = {};
    this.data[path] = { ...this.data[path], ...val };
    this.trigger(path);
  }

  get(path: string) {
    return { data: () => this.data[path], exists: () => !!this.data[path] };
  }

  trigger(path: string) {
    if (this.listeners[path]) {
      this.listeners[path].forEach((cb: any) => {
        cb({ data: () => this.data[path], exists: () => !!this.data[path] });
      });
    }
  }
}

export const mockDb = new LocalMockDB();
