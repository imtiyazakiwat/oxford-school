import { db, storage, isConfigured } from "./firebase";
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, deleteObject } from "firebase/storage";
import { compressImage, generateFileName } from "@/utils/imageUtils";
import { MOCK_ACHIEVERS, MOCK_ACHIEVER_IMAGES } from "@/data/mockData";
import type { Achiever, AchieverInput } from "@/data/mockData";

export type { Achiever, AchieverInput };

const COLLECTION = "achievers";
const STORAGE_FOLDER = "achievers";

const CACHE_KEYS = { ALL: "achievers_all", FEATURED: "achievers_featured" };
const CACHE_TTL = 60 * 60 * 1000;

interface CachedData<T> { data: T; timestamp: number; }
function getFromCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try { const c = localStorage.getItem(key); if (!c) return null; const p: CachedData<T> = JSON.parse(c); if (Date.now() - p.timestamp > CACHE_TTL) { localStorage.removeItem(key); return null; } return p.data; } catch { return null; }
}
function saveToCache<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() })); } catch {}
}
export function clearAchieversCache(): void {
  if (typeof window === "undefined") return;
  Object.values(CACHE_KEYS).forEach(k => localStorage.removeItem(k));
}

function docToAchiever(d: { id: string; data: () => Record<string, unknown> }): Achiever {
  const data = d.data() as Record<string, unknown>;
  return {
    id: d.id, name: (data.name as string) || "", stream: (data.stream as string) || "",
    year: (data.year as number) || new Date().getFullYear(),
    percentage: (data.percentage as string) || "", rank: (data.rank as string) || null,
    image_path: (data.image_path as string) || "",
    is_featured: (data.is_featured as boolean) || false,
    display_order: (data.display_order as number) || 0,
    created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : (data.created_at as string) || new Date().toISOString(),
    created_by: (data.created_by as string) || null,
  };
}

export async function uploadAchieverImage(file: File, userId: string): Promise<{ path: string; error: string | null }> {
  if (!isConfigured || !storage) return { path: "", error: "Firebase not configured" };
  try {
    const blob = await compressImage(file, 512, 0.8);
    const fileName = generateFileName(userId, "webp");
    const filePath = `${STORAGE_FOLDER}/${fileName}`;
    await uploadBytes(ref(storage, filePath), blob, { contentType: "image/webp" });
    return { path: filePath, error: null };
  } catch (err) { return { path: "", error: err instanceof Error ? err.message : "Upload failed" }; }
}

export function getAchieverImageUrl(imagePath: string, id?: string): string | null {
  if (!imagePath || imagePath === "") {
    if (id) return getMockAchieverImage(id);
    return null;
  }
  if (!isConfigured || !storage) return getMockAchieverImage(id || "");
  return `https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent(imagePath)}?alt=media`;
}

export function getMockAchieverImage(id: string): string {
  return MOCK_ACHIEVER_IMAGES[id] || "/img/congactulations/congracts2.jpeg";
}

export async function createAchiever(input: AchieverInput, imagePath: string, userId: string): Promise<{ data: Achiever | null; error: string | null }> {
  if (!isConfigured || !db) return { data: null, error: "Firebase not configured" };
  try {
    const docRef = await addDoc(collection(db, COLLECTION), { ...input, image_path: imagePath, created_by: userId, created_at: new Date().toISOString() });
    const snap = await getDoc(docRef);
    if (!snap.exists()) return { data: null, error: "Failed to create" };
    clearAchieversCache();
    return { data: docToAchiever({ id: snap.id, data: () => snap.data() as Record<string, unknown> }), error: null };
  } catch (err) { return { data: null, error: err instanceof Error ? err.message : "Create failed" }; }
}

export async function getAllAchievers(skipCache = false): Promise<{ data: Achiever[]; error: string | null }> {
  if (!skipCache) { const cached = getFromCache<Achiever[]>(CACHE_KEYS.ALL); if (cached) return { data: cached, error: null }; }
  if (!isConfigured || !db) return { data: MOCK_ACHIEVERS, error: null };
  try {
    const q = query(collection(db, COLLECTION), orderBy("year", "desc"), orderBy("created_at", "desc"));
    const snap = await getDocs(q);
    if (snap.empty) return { data: MOCK_ACHIEVERS, error: null };
    const data = snap.docs.map(d => docToAchiever({ id: d.id, data: () => d.data() as Record<string, unknown> }));
    saveToCache(CACHE_KEYS.ALL, data);
    return { data, error: null };
  } catch { return { data: MOCK_ACHIEVERS, error: null }; }
}

export async function getFeaturedAchievers(skipCache = false): Promise<{ data: Achiever[]; error: string | null }> {
  if (!skipCache) { const cached = getFromCache<Achiever[]>(CACHE_KEYS.FEATURED); if (cached) return { data: cached, error: null }; }
  if (!isConfigured || !db) return { data: MOCK_ACHIEVERS, error: null };
  try {
    const q = query(collection(db, COLLECTION), where("is_featured", "==", true), orderBy("display_order", "asc"), limit(6));
    const snap = await getDocs(q);
    if (snap.empty) return { data: MOCK_ACHIEVERS, error: null };
    const data = snap.docs.map(d => docToAchiever({ id: d.id, data: () => d.data() as Record<string, unknown> }));
    saveToCache(CACHE_KEYS.FEATURED, data);
    return { data, error: null };
  } catch { return { data: MOCK_ACHIEVERS, error: null }; }
}

export async function updateAchiever(id: string, input: Partial<AchieverInput & { image_path?: string }>): Promise<{ data: Achiever | null; error: string | null }> {
  if (!isConfigured || !db) return { data: null, error: "Firebase not configured" };
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, { ...input });
    const snap = await getDoc(docRef);
    if (!snap.exists()) return { data: null, error: "Not found" };
    clearAchieversCache();
    return { data: docToAchiever({ id: snap.id, data: () => snap.data() as Record<string, unknown> }), error: null };
  } catch (err) { return { data: null, error: err instanceof Error ? err.message : "Update failed" }; }
}

export async function deleteAchieverImage(imagePath: string): Promise<{ error: string | null }> {
  if (!isConfigured || !storage) return { error: "Firebase not configured" };
  try { await deleteObject(ref(storage, imagePath)); return { error: null }; }
  catch (err) { return { error: err instanceof Error ? err.message : "Delete failed" }; }
}

export async function deleteAchiever(id: string, imagePath: string): Promise<{ error: string | null }> {
  if (!isConfigured || !db) return { error: "Firebase not configured" };
  try {
    if (imagePath && storage) { try { await deleteObject(ref(storage, imagePath)); } catch {} }
    await deleteDoc(doc(db, COLLECTION, id));
    clearAchieversCache();
    return { error: null };
  } catch (err) { return { error: err instanceof Error ? err.message : "Delete failed" }; }
}

export async function toggleFeatured(id: string, isFeatured: boolean): Promise<{ error: string | null }> {
  if (!isConfigured || !db) return { error: "Firebase not configured" };
  try { await updateDoc(doc(db, COLLECTION, id), { is_featured: isFeatured }); clearAchieversCache(); return { error: null }; }
  catch (err) { return { error: err instanceof Error ? err.message : "Update failed" }; }
}
