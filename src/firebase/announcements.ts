import { db, storage, isConfigured } from "./firebase";
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, deleteObject } from "firebase/storage";
import { compressImage, generateFileName } from "@/utils/imageUtils";
import type { Announcement, AnnouncementInput } from "@/data/mockData";

export type { Announcement, AnnouncementInput };

const COLLECTION = "announcements";
const STORAGE_FOLDER = "announcements";

const CACHE_KEYS = { ALL: "announcements_all", ACTIVE: "announcements_active" };
const CACHE_TTL = 30 * 60 * 1000;
interface CachedData<T> { data: T; timestamp: number; }
function getFromCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try { const c = localStorage.getItem(key); if (!c) return null; const p: CachedData<T> = JSON.parse(c); if (Date.now() - p.timestamp > CACHE_TTL) { localStorage.removeItem(key); return null; } return p.data; } catch { return null; }
}
function saveToCache<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() })); } catch {}
}
export function clearAnnouncementsCache(): void {
  if (typeof window === "undefined") return;
  Object.values(CACHE_KEYS).forEach(k => localStorage.removeItem(k));
}

function docToAnnouncement(d: { id: string; data: () => Record<string, unknown> }): Announcement {
  const data = d.data() as Record<string, unknown>;
  return {
    id: d.id, title: (data.title as string) || "", content: (data.content as string) || "",
    image_path: (data.image_path as string) || null,
    priority: (data.priority as Announcement["priority"]) || "normal",
    is_active: data.is_active !== false,
    created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : (data.created_at as string) || new Date().toISOString(),
    created_by: (data.created_by as string) || null,
  };
}

export async function uploadAnnouncementImage(file: File, userId: string): Promise<{ path: string; error: string | null }> {
  if (!isConfigured || !storage) return { path: "", error: "Firebase not configured" };
  try {
    const blob = await compressImage(file, 1200, 0.85);
    const fileName = generateFileName(userId, "webp");
    const filePath = `${STORAGE_FOLDER}/${fileName}`;
    await uploadBytes(ref(storage, filePath), blob, { contentType: "image/webp" });
    return { path: filePath, error: null };
  } catch (err) { return { path: "", error: err instanceof Error ? err.message : "Upload failed" }; }
}

export function getAnnouncementImageUrl(imagePath: string): string {
  if (!imagePath || !isConfigured || !storage) return "";
  return `https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent(imagePath)}?alt=media`;
}

export async function createAnnouncement(input: AnnouncementInput, imagePath: string | null, userId: string): Promise<{ data: Announcement | null; error: string | null }> {
  if (!isConfigured || !db) return { data: null, error: "Firebase not configured" };
  try {
    const docRef = await addDoc(collection(db, COLLECTION), { ...input, image_path: imagePath, is_active: true, created_by: userId, created_at: new Date().toISOString() });
    const snap = await getDoc(docRef);
    if (!snap.exists()) return { data: null, error: "Failed to create" };
    clearAnnouncementsCache();
    return { data: docToAnnouncement({ id: snap.id, data: () => snap.data() as Record<string, unknown> }), error: null };
  } catch (err) { return { data: null, error: err instanceof Error ? err.message : "Create failed" }; }
}

export async function getAllAnnouncements(skipCache = false): Promise<{ data: Announcement[]; error: string | null }> {
  if (!skipCache) { const cached = getFromCache<Announcement[]>(CACHE_KEYS.ALL); if (cached) return { data: cached, error: null }; }
  if (!isConfigured || !db) return { data: [], error: null };
  try {
    const q = query(collection(db, COLLECTION), orderBy("created_at", "desc"));
    const snap = await getDocs(q);
    const data = snap.docs.map(d => docToAnnouncement({ id: d.id, data: () => d.data() as Record<string, unknown> }));
    if (data.length > 0) saveToCache(CACHE_KEYS.ALL, data);
    return { data, error: null };
  } catch (err) { return { data: [], error: err instanceof Error ? err.message : "Fetch failed" }; }
}

export async function getActiveAnnouncements(skipCache = false): Promise<{ data: Announcement[]; error: string | null }> {
  if (!skipCache) { const cached = getFromCache<Announcement[]>(CACHE_KEYS.ACTIVE); if (cached) return { data: cached, error: null }; }
  if (!isConfigured || !db) return { data: [], error: null };
  try {
    const q = query(collection(db, COLLECTION), where("is_active", "==", true), orderBy("created_at", "desc"));
    const snap = await getDocs(q);
    const data = snap.docs.map(d => docToAnnouncement({ id: d.id, data: () => d.data() as Record<string, unknown> }));
    const priorityOrder: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
    data.sort((a, b) => {
      const diff = (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
      if (diff !== 0) return diff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    if (data.length > 0) saveToCache(CACHE_KEYS.ACTIVE, data);
    return { data, error: null };
  } catch (err) { return { data: [], error: err instanceof Error ? err.message : "Fetch failed" }; }
}

export async function deleteAnnouncement(id: string, imagePath: string | null): Promise<{ error: string | null }> {
  if (!isConfigured || !db) return { error: "Firebase not configured" };
  try {
    if (imagePath && storage) { try { await deleteObject(ref(storage, imagePath)); } catch {} }
    await deleteDoc(doc(db, COLLECTION, id));
    clearAnnouncementsCache();
    return { error: null };
  } catch (err) { return { error: err instanceof Error ? err.message : "Delete failed" }; }
}

export async function toggleAnnouncementActive(id: string, isActive: boolean): Promise<{ error: string | null }> {
  if (!isConfigured || !db) return { error: "Firebase not configured" };
  try { await updateDoc(doc(db, COLLECTION, id), { is_active: isActive }); clearAnnouncementsCache(); return { error: null }; }
  catch (err) { return { error: err instanceof Error ? err.message : "Update failed" }; }
}

export async function getAnnouncementById(id: string): Promise<{ data: Announcement | null; error: string | null }> {
  if (!isConfigured || !db) return { data: null, error: "Firebase not configured" };
  try {
    const snap = await getDoc(doc(db, COLLECTION, id));
    if (!snap.exists()) return { data: null, error: "Not found" };
    return { data: docToAnnouncement({ id: snap.id, data: () => snap.data() as Record<string, unknown> }), error: null };
  } catch (err) { return { data: null, error: err instanceof Error ? err.message : "Fetch failed" }; }
}

export async function updateAnnouncement(id: string, input: Partial<AnnouncementInput & { image_path?: string | null }>): Promise<{ data: Announcement | null; error: string | null }> {
  if (!isConfigured || !db) return { data: null, error: "Firebase not configured" };
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, { ...input });
    const snap = await getDoc(docRef);
    if (!snap.exists()) return { data: null, error: "Not found" };
    clearAnnouncementsCache();
    return { data: docToAnnouncement({ id: snap.id, data: () => snap.data() as Record<string, unknown> }), error: null };
  } catch (err) { return { data: null, error: err instanceof Error ? err.message : "Update failed" }; }
}

export async function deleteAnnouncementImage(imagePath: string): Promise<{ error: string | null }> {
  if (!isConfigured || !storage) return { error: "Firebase not configured" };
  try { await deleteObject(ref(storage, imagePath)); return { error: null }; }
  catch (err) { return { error: err instanceof Error ? err.message : "Delete failed" }; }
}
