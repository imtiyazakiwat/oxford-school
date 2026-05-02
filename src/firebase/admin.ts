// Firebase Admin SDK - for server-side (Vercel Functions / Next.js API routes)
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;

function getAdminApp(): App | null {
  if (adminApp) return adminApp;

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    console.warn("Firebase Admin: FIREBASE_SERVICE_ACCOUNT_KEY not configured");
    return null;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    if (getApps().length === 0) {
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } else {
      adminApp = getApps()[0];
    }
    return adminApp;
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    return null;
  }
}

export function getAdminAuth(): Auth | null {
  if (adminAuth) return adminAuth;
  const app = getAdminApp();
  if (!app) return null;
  adminAuth = getAuth(app);
  return adminAuth;
}

export function getAdminDb(): Firestore | null {
  if (adminDb) return adminDb;
  const app = getAdminApp();
  if (!app) return null;
  adminDb = getFirestore(app);
  return adminDb;
}

export function getAdminStorage() {
  const app = getAdminApp();
  if (!app) return null;
  return getStorage(app);
}

export function isAdminConfigured(): boolean {
  return !!getAdminApp();
}
