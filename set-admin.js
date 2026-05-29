/**
 * Set custom admin claims on a Firebase user
 * 
 * Usage:
 *   1. Download serviceAccountKey.json from Firebase Console:
 *      - Go to Project Settings -> Service Accounts
 *      - Click "Generate New Private Key"
 *      - Save as ./serviceAccountKey.json (add to .gitignore)
 * 
 *   2. Run: node set-admin.js <USER_UID>
 *      Example: node set-admin.js VVws5IFJMOZrHxZbllQw2cc45py2
 * 
 *   3. After setting claims, user should log out and log in again,
 *      or call getIdToken(true) to refresh the token.
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Load service account key
const keyPath = resolve(__dirname, 'serviceAccountKey.json');
let serviceAccount;

try {
  const keyData = readFileSync(keyPath, 'utf-8');
  serviceAccount = JSON.parse(keyData);
} catch (err) {
  console.error(`❌ Error: Cannot find ${keyPath}`);
  console.error('\nPlease download your Firebase service account key:');
  console.error('1. Go to https://console.firebase.google.com/');
  console.error('2. Select your project (momofund-97bc5)');
  console.error('3. Click Project Settings (gear icon)');
  console.error('4. Go to "Service Accounts" tab');
  console.error('5. Click "Generate New Private Key"');
  console.error('6. Save the JSON file as serviceAccountKey.json in this directory');
  process.exit(1);
}

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'momofund-97bc5',
});

const uid = process.argv[2];

if (!uid) {
  console.error('❌ Usage: node set-admin.js <USER_UID>');
  console.error('\nGet USER_UID from:');
  console.error('1. Firebase Console -> Authentication -> Users');
  console.error('2. Copy the UID column for your user');
  process.exit(1);
}

async function setAdminClaim() {
  try {
    console.log(`⏳ Setting admin claim for user ${uid}...`);
    
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    
    console.log(`✅ Admin claim set successfully!`);
    console.log('\n📝 Next steps:');
    console.log('1. User should log out and log in again');
    console.log('2. Or call getIdToken(true) to refresh token immediately');
    console.log('\n💡 Verify claim in browser console:');
    console.log('   const idTokenResult = await getIdTokenResult(currentUser);');
    console.log('   console.log(idTokenResult.claims.admin); // should be true');
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

setAdminClaim().finally(() => process.exit(0));
