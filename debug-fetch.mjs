import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, where } from 'firebase/firestore';

// Firebase config (copied from project)
const firebaseConfig = {
  apiKey: "AIzaSyDiYJ009yk0NUNU5y-ywIy0KEit9cRNk2Y",
  authDomain: "momofund-97bc5.firebaseapp.com",
  projectId: "momofund-97bc5",
  storageBucket: "momofund-97bc5.firebasestorage.app",
  messagingSenderId: "711783635774",
  appId: "1:711783635774:web:66f746206c34840b6e6a6f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debug() {
  try {
    const colNames = ['users','funds','transactions','reports','fund_members','activity_logs'];
    for (const name of colNames) {
      try {
        const snap = await getDocs(collection(db, name));
        console.log(`${name}: ${snap.size} documents`);
        if (snap.size > 0) {
          const d = snap.docs[0].data();
          console.log(`  sample keys: ${Object.keys(d).slice(0,20).join(', ')}`);
        }
      } catch (e) {
        console.error(`Error reading ${name}:`, e && e.message ? e.message : e);
      }
    }
  } catch (err) {
    console.error('Fatal error:', err);
  }
}

debug();
