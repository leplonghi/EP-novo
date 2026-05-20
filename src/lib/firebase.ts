import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);

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
