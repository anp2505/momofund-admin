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
          if (name === "users") console.log(`  user: ${JSON.stringify(d)}`);
          if (name === "funds") console.log(`  fund: ${JSON.stringify(d)}`);
          if (name === "transactions") console.log(`  tx: ${JSON.stringify(d)}`);
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
