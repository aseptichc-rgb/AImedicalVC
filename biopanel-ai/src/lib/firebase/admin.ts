import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Build and public pages must not require server credentials at module import.
export function getAdminServices() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) throw new Error('Firebase server credentials are not configured.');
  const app = getApps().find(app => app.name === 'biopanel-server') || initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  }, 'biopanel-server');
  return { adminAuth: getAuth(app), adminDb: getFirestore(app) };
}
