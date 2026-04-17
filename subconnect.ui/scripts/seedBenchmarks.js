// One-time script to populate the root-level `benchmarks` Firestore collection.
// Run from inside subconnect.ui/: node scripts/seedBenchmarks.js
//
// Requires VITE_FIREBASE_* env vars to be present in ../.env or set inline.

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually (Vite env vars aren't available in plain Node)
const envPath = resolve(__dirname, '../.env');
const env = Object.fromEntries(
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => l.split('=').map((s) => s.trim())),
);

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const benchmarks = [
  { serviceName: 'Netflix', billingAmount: 15.49, category: 'Entertainment' },
  { serviceName: 'Spotify', billingAmount: 9.99, category: 'Music' },
  { serviceName: 'Apple Music', billingAmount: 10.99, category: 'Music' },
  { serviceName: 'YouTube Premium', billingAmount: 13.99, category: 'Entertainment' },
  { serviceName: 'Disney+', billingAmount: 7.99, category: 'Entertainment' },
  { serviceName: 'Adobe Creative Cloud', billingAmount: 54.99, category: 'Productivity' },
  { serviceName: 'Microsoft 365', billingAmount: 9.99, category: 'Productivity' },
  { serviceName: 'iCloud+', billingAmount: 2.99, category: 'Storage' },
  { serviceName: 'Google One', billingAmount: 2.99, category: 'Storage' },
  { serviceName: 'Amazon Prime', billingAmount: 14.99, category: 'Shopping' },
  { serviceName: 'Hulu', billingAmount: 7.99, category: 'Entertainment' },
  { serviceName: 'LinkedIn Premium', billingAmount: 39.99, category: 'Career' },
  { serviceName: 'Duolingo Plus', billingAmount: 6.99, category: 'Education' },
  { serviceName: 'Notion', billingAmount: 10.0, category: 'Productivity' },
  { serviceName: 'Canva Pro', billingAmount: 14.99, category: 'Design' },
  { serviceName: 'HBO Max', billingAmount: 9.99, category: 'Entertainment' },
  { serviceName: 'Apple TV+', billingAmount: 9.99, category: 'Entertainment' },
  { serviceName: 'GitHub Copilot', billingAmount: 10.0, category: 'Productivity' },
  { serviceName: 'Dropbox', billingAmount: 11.99, category: 'Storage' },
  { serviceName: 'NordVPN', billingAmount: 4.99, category: 'Security' },
];

async function seed() {
  const benchmarksRef = collection(db, 'benchmarks');
  let count = 0;

  for (const b of benchmarks) {
    // Use serviceName (lowercase, no spaces) as document ID for idempotency
    const id = b.serviceName.toLowerCase().replace(/\s+/g, '-');
    await setDoc(doc(benchmarksRef, id), b, { merge: true });
    console.log(`  ✓ ${b.serviceName} ($${b.billingAmount}/mo)`);
    count++;
  }

  console.log(`\nDone — seeded ${count} benchmarks.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
