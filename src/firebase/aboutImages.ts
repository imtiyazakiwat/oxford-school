import { db, storage, isConfigured } from "./firebase";
import { collection, doc, getDocs, getDoc, setDoc, query, orderBy, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, deleteObject } from "firebase/storage";
import { compressImage, generateFileName } from "@/utils/imageUtils";
import type { AboutImage } from "@/data/mockData";

export type { AboutImage };

const COLLECTION = "about_images";
const STORAGE_FOLDER = "about";

function docToAboutImage(d: { id: string; data: () => Record<string, unknown> }): AboutImage {
  const data = d.data() as Record<string, unknown>;
  return {
    id: d.id, position: (data.position as number) || 0,
    image_path: (data.image_path as string) || "", alt_text: (data.alt_text as string) || "",
    created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : (data.created_at as string) || new Date().toISOString(),
    updated_at: data.updated_at instanceof Timestamp ? data.updated_at.toDate().toISOString() : (data.updated_at as string) || new Date().toISOString(),
  };
}

export async function getAboutImages(): Promise<{ data: AboutImage[]; error: string | null }> {
  if (!isConfigured || !db) return { data: [], error: null };
  try {
    const q = query(collection(db, COLLECTION), orderBy("position", "asc"));
    const snap = await getDocs(q);
    return { data: snap.docs.map(d => docToAboutImage({ id: d.id, data: () => d.data() as Record<string, unknown> })), error: null };
  } catch (err) { return { data: [], error: err instanceof Error ? err.message : "Fetch failed" }; }
}

export async function uploadAboutImage(file: File, userId: string): Promise<{ path: string; error: string | null }> {
  if (!isConfigured || !storage) return { path: "", error: "Firebase not configured" };
  try {
    const blob = await compressImage(file, 800, 0.85);
    const fileName = generateFileName(userId, "webp");
    const filePath = `${STORAGE_FOLDER}/${fileName}`;
    await uploadBytes(ref(storage, filePath), blob, { contentType: "image/webp" });
    return { path: filePath, error: null };
  } catch (err) { return { path: "", error: err instanceof Error ? err.message : "Upload failed" }; }
}

export function getAboutImageUrl(imagePath: string): string {
  if (!imagePath || !isConfigured || !storage) return "";
  return `https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent(imagePath)}?alt=media`;
}

export async function saveAboutImage(position: number, imagePath: string, altText: string, userId: string): Promise<{ data: AboutImage | null; error: string | null }> {
  if (!isConfigured || !db) return { data: null, error: "Firebase not configured" };
  try {
    const docRef = doc(db, COLLECTION, `position_${position}`);
    await setDoc(docRef, { position, image_path: imagePath, alt_text: altText, updated_at: new Date().toISOString(), created_at: new Date().toISOString() }, { merge: true });
    const snap = await getDoc(docRef);
    if (!snap.exists()) return { data: null, error: "Failed to save" };
    return { data: docToAboutImage({ id: snap.id, data: () => snap.data() as Record<string, unknown> }), error: null };
  } catch (err) { return { data: null, error: err instanceof Error ? err.message : "Save failed" }; }
}

export async function deleteAboutImage(imagePath: string): Promise<{ error: string | null }> {
  if (!isConfigured || !storage) return { error: "Firebase not configured" };
  try { await deleteObject(ref(storage, imagePath)); return { error: null }; }
  catch (err) { return { error: err instanceof Error ? err.message : "Delete failed" }; }
}
