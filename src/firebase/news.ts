import { db, storage, isConfigured } from "./firebase";
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { compressImage, generateFileName } from "@/utils/imageUtils";
import type { NewsItem, NewsInput } from "@/data/mockData";

export type { NewsItem, NewsInput };

const COLLECTION = "news";
const STORAGE_FOLDER = "news";

// Cache configuration
const CACHE_KEYS = { ALL_NEWS: "news_all", ACTIVE_NEWS: "news_active", FEATURED_NEWS: "news_featured" };
const CACHE_TTL = 30 * 60 * 1000;

interface CachedData<T> { data: T; timestamp: number; }

function getFromCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    const parsed: CachedData<T> = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > CACHE_TTL) { localStorage.removeItem(key); return null; }
    return parsed.data;
  } catch { return null; }
}

function saveToCache<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() })); } catch {}
}

export function clearNewsCache(): void {
  if (typeof window === "undefined") return;
  Object.values(CACHE_KEYS).forEach(k => localStorage.removeItem(k));
}

function docToNewsItem(docSnap: { id: string; data: () => Record<string, unknown> }): NewsItem {
  const d = docSnap.data() as Record<string, unknown>;
  return {
    id: docSnap.id,
    title: (d.title as string) || "",
    description: (d.description as string) || "",
    content: (d.content as string) || null,
    image_path: (d.image_path as string) || null,
    category: (d.category as NewsItem["category"]) || "Events",
    is_featured: (d.is_featured as boolean) || false,
    is_active: d.is_active !== false,
    published_at: d.published_at instanceof Timestamp ? d.published_at.toDate().toISOString() : (d.published_at as string) || new Date().toISOString(),
    created_at: d.created_at instanceof Timestamp ? d.created_at.toDate().toISOString() : (d.created_at as string) || new Date().toISOString(),
    created_by: (d.created_by as string) || null,
  };
}

/** Upload news image to Firebase Storage */
export async function uploadNewsImage(file: File, userId: string): Promise<{ path: string; error: string | null }> {
  if (!isConfigured || !storage) return { path: "", error: "Firebase not configured" };
  try {
    const compressedBlob = await compressImage(file, 1200, 0.85);
    const fileName = generateFileName(userId, "webp");
    const filePath = `${STORAGE_FOLDER}/${fileName}`;
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, compressedBlob, { contentType: "image/webp" });
    return { path: filePath, error: null };
  } catch (err) {
    return { path: "", error: err instanceof Error ? err.message : "Upload failed" };
  }
}

/** Get download URL for news image */
export function getNewsImageUrl(imagePath: string): string {
  if (!imagePath) return "";
  // Local images from public/
  if (imagePath.startsWith("/")) return imagePath;
  if (!isConfigured || !storage) return "";
  return `https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent(imagePath)}?alt=media`;
}

/** Get async download URL for news image */
export async function getNewsImageUrlAsync(imagePath: string): Promise<string> {
  if (!imagePath) return "";
  if (imagePath.startsWith("/")) return imagePath;
  if (!isConfigured || !storage) return "";
  try {
    const storageRef = ref(storage, imagePath);
    return await getDownloadURL(storageRef);
  } catch {
    return "";
  }
}

/** Create a new news item */
export async function createNews(input: NewsInput, imagePath: string | null, userId: string): Promise<{ data: NewsItem | null; error: string | null }> {
  if (!isConfigured || !db) return { data: null, error: "Firebase not configured" };
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...input, image_path: imagePath, is_active: true,
      published_at: new Date().toISOString(), created_at: new Date().toISOString(), created_by: userId,
    });
    const snap = await getDoc(docRef);
    if (!snap.exists()) return { data: null, error: "Failed to create" };
    clearNewsCache();
    return { data: docToNewsItem({ id: snap.id, data: () => snap.data() as Record<string, unknown> }), error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Failed to create news" };
  }
}

/** Get all news (for admin) */
export async function getAllNews(skipCache = false): Promise<{ data: NewsItem[]; error: string | null }> {
  if (!skipCache) { const cached = getFromCache<NewsItem[]>(CACHE_KEYS.ALL_NEWS); if (cached) return { data: cached, error: null }; }
  if (!isConfigured || !db) return { data: [], error: "Firebase not configured" };
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    const data = snap.docs.map(d => docToNewsItem({ id: d.id, data: () => d.data() as Record<string, unknown> }));
    data.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    saveToCache(CACHE_KEYS.ALL_NEWS, data);
    return { data, error: null };
  } catch (err) { return { data: [], error: err instanceof Error ? err.message : "Fetch failed" }; }
}

/** Get active news */
export async function getActiveNews(skipCache = false): Promise<{ data: NewsItem[]; error: string | null }> {
  if (!skipCache) { const cached = getFromCache<NewsItem[]>(CACHE_KEYS.ACTIVE_NEWS); if (cached) return { data: cached, error: null }; }
  if (!isConfigured || !db) return { data: [], error: "Firebase not configured" };
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    const data = snap.docs.map(d => docToNewsItem({ id: d.id, data: () => d.data() as Record<string, unknown> }))
      .filter(n => n.is_active)
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    saveToCache(CACHE_KEYS.ACTIVE_NEWS, data);
    return { data, error: null };
  } catch (err) { return { data: [], error: err instanceof Error ? err.message : "Fetch failed" }; }
}

/** Get featured news for homepage */
export async function getFeaturedNews(skipCache = false): Promise<{ data: NewsItem[]; error: string | null }> {
  if (!skipCache) { const cached = getFromCache<NewsItem[]>(CACHE_KEYS.FEATURED_NEWS); if (cached) return { data: cached, error: null }; }
  if (!isConfigured || !db) return { data: [], error: "Firebase not configured" };
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    const data = snap.docs.map(d => docToNewsItem({ id: d.id, data: () => d.data() as Record<string, unknown> }))
      .filter(n => n.is_active && n.is_featured)
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 3);
    saveToCache(CACHE_KEYS.FEATURED_NEWS, data);
    return { data, error: null };
  } catch (err) { return { data: [], error: err instanceof Error ? err.message : "Fetch failed" }; }
}

/** Get news by ID */
export async function getNewsById(id: string): Promise<{ data: NewsItem | null; error: string | null }> {
  if (!isConfigured || !db) return { data: null, error: "Firebase not configured" };
  try {
    const docRef = doc(db, COLLECTION, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) return { data: docToNewsItem({ id: snap.id, data: () => snap.data() as Record<string, unknown> }), error: null };
    return { data: null, error: "News not found" };
  } catch (err) { return { data: null, error: err instanceof Error ? err.message : "Fetch failed" }; }
}

/** Get news by category */
export async function getNewsByCategory(category: string): Promise<{ data: NewsItem[]; error: string | null }> {
  if (!isConfigured || !db) return { data: [], error: "Firebase not configured" };
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    const data = snap.docs.map(d => docToNewsItem({ id: d.id, data: () => d.data() as Record<string, unknown> }))
      .filter(n => n.category === category && n.is_active)
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    return { data, error: null };
  } catch { return { data: [], error: "Failed to fetch news" }; }
}

/** Delete a news item */
export async function deleteNews(id: string, imagePath: string | null): Promise<{ error: string | null }> {
  if (!isConfigured || !db) return { error: "Firebase not configured" };
  try {
    if (imagePath && storage) { try { await deleteObject(ref(storage, imagePath)); } catch {} }
    await deleteDoc(doc(db, COLLECTION, id));
    clearNewsCache();
    return { error: null };
  } catch (err) { return { error: err instanceof Error ? err.message : "Delete failed" }; }
}

/** Toggle news active status */
export async function toggleNewsActive(id: string, isActive: boolean): Promise<{ error: string | null }> {
  if (!isConfigured || !db) return { error: "Firebase not configured" };
  try { await updateDoc(doc(db, COLLECTION, id), { is_active: isActive }); clearNewsCache(); return { error: null }; }
  catch (err) { return { error: err instanceof Error ? err.message : "Update failed" }; }
}

/** Toggle news featured status */
export async function toggleNewsFeatured(id: string, isFeatured: boolean): Promise<{ error: string | null }> {
  if (!isConfigured || !db) return { error: "Firebase not configured" };
  try { await updateDoc(doc(db, COLLECTION, id), { is_featured: isFeatured }); clearNewsCache(); return { error: null }; }
  catch (err) { return { error: err instanceof Error ? err.message : "Update failed" }; }
}

/** Update a news item */
export async function updateNews(id: string, input: Partial<NewsInput & { image_path?: string | null }>): Promise<{ data: NewsItem | null; error: string | null }> {
  if (!isConfigured || !db) return { data: null, error: "Firebase not configured" };
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, { ...input });
    const snap = await getDoc(docRef);
    if (!snap.exists()) return { data: null, error: "Not found" };
    clearNewsCache();
    return { data: docToNewsItem({ id: snap.id, data: () => snap.data() as Record<string, unknown> }), error: null };
  } catch (err) { return { data: null, error: err instanceof Error ? err.message : "Update failed" }; }
}
