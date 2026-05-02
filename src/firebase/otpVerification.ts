import { db, isConfigured } from "./firebase";
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, Timestamp } from "firebase/firestore";
import type { OTPVerification } from "@/data/mockData";

export type { OTPVerification };

const COLLECTION = "otp_verifications";
const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createOTP(email: string): Promise<{ otp: string | null; error: string | null }> {
  if (!isConfigured || !db) return { otp: null, error: "Firebase not configured" };
  try {
    // Delete existing OTPs for this email
    const q = query(collection(db, COLLECTION), where("email", "==", email.toLowerCase()));
    const existing = await getDocs(q);
    for (const d of existing.docs) { await deleteDoc(d.ref); }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await addDoc(collection(db, COLLECTION), {
      email: email.toLowerCase(), otp_code: otp, expires_at: expiresAt.toISOString(),
      verified: false, attempts: 0, created_at: new Date().toISOString(),
    });
    return { otp, error: null };
  } catch (err) { return { otp: null, error: err instanceof Error ? err.message : "Create OTP failed" }; }
}

export async function verifyOTP(email: string, code: string): Promise<{ success: boolean; error: string | null }> {
  if (!isConfigured || !db) return { success: false, error: "Firebase not configured" };
  try {
    const q = query(collection(db, COLLECTION), where("email", "==", email.toLowerCase()), where("verified", "==", false));
    const snap = await getDocs(q);
    if (snap.empty) return { success: false, error: "No pending verification found" };

    const docSnap = snap.docs[0];
    const data = docSnap.data();

    if (new Date(data.expires_at as string) < new Date()) {
      await deleteDoc(docSnap.ref);
      return { success: false, error: "OTP has expired. Please request a new one." };
    }
    if ((data.attempts as number) >= MAX_ATTEMPTS) {
      await deleteDoc(docSnap.ref);
      return { success: false, error: "Too many attempts. Please request a new OTP." };
    }
    if (data.otp_code !== code) {
      await updateDoc(docSnap.ref, { attempts: (data.attempts as number) + 1 });
      return { success: false, error: "Invalid OTP. Please try again." };
    }

    await updateDoc(docSnap.ref, { verified: true });
    return { success: true, error: null };
  } catch (err) { return { success: false, error: err instanceof Error ? err.message : "Verify failed" }; }
}

export async function isEmailVerified(email: string): Promise<{ verified: boolean; error: string | null }> {
  if (!isConfigured || !db) return { verified: false, error: null };
  try {
    const q = query(collection(db, COLLECTION), where("email", "==", email.toLowerCase()), where("verified", "==", true));
    const snap = await getDocs(q);
    return { verified: !snap.empty, error: null };
  } catch { return { verified: false, error: null }; }
}

export async function getOTPStatus(email: string): Promise<{ exists: boolean; expiresAt: string | null; error: string | null }> {
  if (!isConfigured || !db) return { exists: false, expiresAt: null, error: null };
  try {
    const q = query(collection(db, COLLECTION), where("email", "==", email.toLowerCase()), where("verified", "==", false));
    const snap = await getDocs(q);
    if (snap.empty) return { exists: false, expiresAt: null, error: null };
    return { exists: true, expiresAt: snap.docs[0].data().expires_at as string, error: null };
  } catch { return { exists: false, expiresAt: null, error: null }; }
}
