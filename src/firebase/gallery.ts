import { db, storage, isConfigured } from "./firebase";
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { compressImage, generateFileName } from "@/utils/imageUtils";
import { MOCK_GALLERY, MOCK_GALLERY_IMAGES } from "@/data/mockData";
import type { GalleryImage, GalleryImageInput } from "@/data/mockData";

export type { GalleryImage, GalleryImageInput };

const COLLECTION = "gallery";
const STORAGE_FOLDER = "gallery";

const CACHE_KEYS = { ALL_GALLERY: "gallery_all", FEATURED_GALLERY: "gallery_featured" };
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
export function clearGalleryCache(): void {
  if (typeof window === "undefined") return;
  Object.values(CACHE_KEYS).forEach(k => localStorage.removeItem(k));
}

function docToGalleryImage(d: { id: string; data: () => Record<string, unknown> }): GalleryImage {
  const data = d.data() as Record<string, unknown>;
  return {
    id: d.id, title: (data.title as string) || "",
    category: (data.category as GalleryImage["category"]) || "Events",
    image_path: (data.image_path as string) || "",
    is_featured: (data.is_featured as boolean) || false,
    display_order: (data.display_order as number) || 0,
    created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : (data.created_at as string) || new Date().toISOString(),
    created_by: (data.created_by as string) || null,
  };
}

export async function uploadGalleryImage(file: File, userId: string): Promise<{ path: string; error: string | null }> {
  if (!isConfigured || !storage) return { path: "", error: "Firebase not configured" };
  try {
    const blob = await compressImage(file, 1200, 0.85);
    const fileName = generateFileName(userId, "webp");
    const filePath = `${STORAGE_FOLDER}/${fileName}`;
    await uploadBytes(ref(storage, filePath), blob, { contentType: "image/webp" });
    return { path: filePath, error: null };
  } catch (err) { return { path: "", error: err instanceof Error ? err.message : "Upload failed" }; }
}

export function getGalleryImageUrl(imagePath: string): string {
  if (!imagePath || !isConfigured || !storage) return "";
  return `https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent(imagePath)}?alt=media`;
}

export function getMockGalleryImage(id: string): string {
  return MOCK_GALLERY_IMAGES[id] || "/img/congactulations/congracts2.jpeg";
}

export async function createGalleryImage(input: GalleryImageInput, imagePath: string, userId: string): Promise<{ data: GalleryImage | null; error: string | null }> {
  if (!isConfigured || !db) return { data: null, error: "Firebase not configured" };
  try {
    const docRef = await addDoc(collection(db, COLLECTION), { ...input, image_path: imagePath, created_by: userId, created_at: new Date().toISOString() });
    const snap = await getDoc(docRef);
    if (!snap.exists()) return { data: null, error: "Failed to create" };
    clearGalleryCache();
    return { data: docToGalleryImage({ id: snap.id, data: () => snap.data() as Record<string, unknown> }), error: null };
  } catch (err) { return { data: null, error: err instanceof Error ? err.message : "Create failed" }; }
}

export async function getAllGalleryImages(skipCache = false): Promise<{ data: GalleryImage[]; error: string | null }> {
  if (!skipCache) { const cached = getFromCache<GalleryImage[]>(CACHE_KEYS.ALL_GALLERY); if (cached) return { data: cached, error: null }; }
  if (!isConfigured || !db) return { data: MOCK_GALLERY, error: null };
  try {
    const q = query(collection(db, COLLECTION), orderBy("created_at", "desc"));
    const snap = await getDocs(q);
    if (snap.empty) return { data: MOCK_GALLERY, error: null };
    const data = snap.docs.map(d => docToGalleryImage({ id: d.id, data: () => d.data() as Record<string, unknown> }));
    saveToCache(CACHE_KEYS.ALL_GALLERY, data);
    return { data, error: null };
  } catch { return { data: MOCK_GALLERY, error: null }; }
}

export async function getFeaturedGalleryImages(skipCache = false): Promise<{ data: GalleryImage[]; error: string | null }> {
  if (!skipCache) { const cached = getFromCache<GalleryImage[]>(CACHE_KEYS.FEATURED_GALLERY); if (cached) return { data: cached, error: null }; }
  if (!isConfigured || !db) return { data: MOCK_GALLERY, error: null };
  try {
    const q = query(collection(db, COLLECTION), where("is_featured", "==", true), orderBy("display_order", "asc"), limit(6));
    const snap = await getDocs(q);
    if (snap.empty) return { data: MOCK_GALLERY, error: null };
    const data = snap.docs.map(d => docToGalleryImage({ id: d.id, data: () => d.data() as Record<string, unknown> }));
    saveToCache(CACHE_KEYS.FEATURED_GALLERY, data);
    return { data, error: null };
  } catch { return { data: MOCK_GALLERY, error: null }; }
}

export async function getGalleryByCategory(category: string): Promise<{ data: GalleryImage[]; error: string | null }> {
  if (!isConfigured || !db) return { data: MOCK_GALLERY.filter(g => g.category === category), error: null };
  try {
    const q = query(collection(db, COLLECTION), where("category", "==", category), orderBy("created_at", "desc"));
    const snap = await getDocs(q);
    return { data: snap.docs.map(d => docToGalleryImage({ id: d.id, data: () => d.data() as Record<string, unknown> })), error: null };
  } catch { return { data: [], error: "Failed to fetch" }; }
}

export async function deleteGalleryImage(id: string, imagePath: string): Promise<{ error: string | null }> {
  if (!isConfigured || !db) return { error: "Firebase not configured" };
  try {
    if (imagePath && storage) { try { await deleteObject(ref(storage, imagePath)); } catch {} }
    await deleteDoc(doc(db, COLLECTION, id));
    clearGalleryCache();
    return { error: null };
  } catch (err) { return { error: err instanceof Error ? err.message : "Delete failed" }; }
}

export async function toggleGalleryFeatured(id: string, isFeatured: boolean): Promise<{ error: string | null }> {
  if (!isConfigured || !db) return { error: "Firebase not configured" };
  try { await updateDoc(doc(db, COLLECTION, id), { is_featured: isFeatured }); clearGalleryCache(); return { error: null }; }
  catch (err) { return { error: err instanceof Error ? err.message : "Update failed" }; }
}
