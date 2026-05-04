import { db, isConfigured } from "./firebase";
import { collection, doc, getDocs, getDoc, setDoc, query, where, orderBy, limit, Timestamp } from "firebase/firestore";
import type { AdmissionBanner } from "@/data/mockData";

export type { AdmissionBanner };

const COLLECTION = "admission_banner";

function docToBanner(d: { id: string; data: () => Record<string, unknown> }): AdmissionBanner {
  const data = d.data() as Record<string, unknown>;
  return {
    id: d.id, text: (data.text as string) || "", emoji: (data.emoji as string) || "🎓",
    is_active: data.is_active !== false,
    updated_at: data.updated_at instanceof Timestamp ? data.updated_at.toDate().toISOString() : (data.updated_at as string) || new Date().toISOString(),
    updated_by: (data.updated_by as string) || null,
  };
}

export async function getAdmissionBanner(): Promise<{ data: AdmissionBanner | null; error: string | null }> {
  if (!isConfigured || !db) return { data: null, error: "Firebase not configured" };
  try {
    const q = query(collection(db, COLLECTION), where("is_active", "==", true), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return { data: null, error: null };
    return { data: docToBanner({ id: snap.docs[0].id, data: () => snap.docs[0].data() as Record<string, unknown> }), error: null };
  } catch (err) { return { data: null, error: err instanceof Error ? err.message : "Fetch failed" }; }
}

export async function updateAdmissionBanner(id: string, updates: Partial<Omit<AdmissionBanner, "id">>): Promise<{ data: AdmissionBanner | null; error: string | null }> {
  if (!isConfigured || !db) return { data: null, error: "Firebase not configured" };
  try {
    const docRef = doc(db, COLLECTION, id);
    await setDoc(docRef, { ...updates, updated_at: new Date().toISOString() }, { merge: true });
    const snap = await getDoc(docRef);
    if (!snap.exists()) return { data: null, error: "Not found" };
    return { data: docToBanner({ id: snap.id, data: () => snap.data() as Record<string, unknown> }), error: null };
  } catch (err) { return { data: null, error: err instanceof Error ? err.message : "Update failed" }; }
}

export async function getOrCreateAdmissionBanner(): Promise<{ data: AdmissionBanner | null; error: string | null }> {
  if (!isConfigured || !db) return { data: null, error: "Firebase not configured" };
  try {
    const q = query(collection(db, COLLECTION), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) return { data: docToBanner({ id: snap.docs[0].id, data: () => snap.docs[0].data() as Record<string, unknown> }), error: null };
    
    const docRef = doc(collection(db, COLLECTION));
    await setDoc(docRef, { text: "Admissions are open for 2025 and 2026 — Hurry up to register!", emoji: "🎓", is_active: true, updated_at: new Date().toISOString() });
    const newSnap = await getDoc(docRef);
    if (!newSnap.exists()) return { data: null, error: "Failed to create" };
    return { data: docToBanner({ id: newSnap.id, data: () => newSnap.data() as Record<string, unknown> }), error: null };
  } catch (err) { return { data: null, error: err instanceof Error ? err.message : "Failed" }; }
}
