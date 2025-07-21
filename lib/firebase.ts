import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAZvsnKO6IvMmdz2V508qTC5qsoZJt9mYs",
  authDomain: "crewsync-f84e4.firebaseapp.com",
  projectId: "crewsync-f84e4",
  storageBucket: "crewsync-f84e4.firebasestorage.app",
  messagingSenderId: "932428108546",
  appId: "1:932428108546:web:b45931b5ad3828f440e81b",
  measurementId: "G-32CGSCWW0R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Performance Monitoring (only in browser)
let perf = null;
if (typeof window !== 'undefined') {
  try {
    const { getPerformance } = require('firebase/performance');
    perf = getPerformance(app);
  } catch (error) {
    console.log('Performance monitoring not available:', error);
  }
}

// Initialize Analytics (only in browser and with dynamic import)
let analytics = null;
if (typeof window !== 'undefined') {
  // Use dynamic import to avoid SSR issues and undici dependencies
  import('firebase/analytics').then(({ getAnalytics }) => {
    try {
      analytics = getAnalytics(app);
    } catch (error) {
      console.log('Analytics initialization failed:', error);
    }
  }).catch((error) => {
    console.log('Analytics module not available:', error);
  });
}

export { analytics, perf };
export default app; 