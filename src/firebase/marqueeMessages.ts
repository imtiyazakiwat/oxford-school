import { db, isConfigured } from "./firebase";
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy, Timestamp } from "firebase/firestore";
import type { MarqueeMessage } from "@/data/mockData";

export type { MarqueeMessage };

const COLLECTION = "marquee_messages";

function docToMarquee(d: { id: string; data: () => Record<string, unknown> }): MarqueeMessage {
  const data = d.data() as Record<string, unknown>;
  return {
    id: d.id, text: (data.text as string) || "", icon: (data.icon as string) || "Bell",
    highlight: (data.highlight as boolean) || false, is_active: data.is_active !== false,
    display_order: (data.display_order as number) || 0,
    created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : (data.created_at as string) || new Date().toISOString(),
    updated_at: data.updated_at instanceof Timestamp ? data.updated_at.toDate().toISOString() : (data.updated_at as string) || new Date().toISOString(),
    created_by: (data.created_by as string) || null,
  };
}

export async function getActiveMarqueeMessages(): Promise<{ data: MarqueeMessage[]; error: string | null }> {
  if (!isConfigured || !db) return { data: [], error: "Firebase not configured" };
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    const data = snap.docs.map(d => docToMarquee({ id: d.id, data: () => d.data() as Record<string, unknown> }))
      .filter(m => m.is_active)
      .sort((a, b) => a.display_order - b.display_order);
    return { data, error: null };
  } catch (err) { return { data: [], error: err instanceof Error ? err.message : "Fetch failed" }; }
}

export async function getAllMarqueeMessages(): Promise<{ data: MarqueeMessage[]; error: string | null }> {
  if (!isConfigured || !db) return { data: [], error: null };
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    const data = snap.docs.map(d => docToMarquee({ id: d.id, data: () => d.data() as Record<string, unknown> }))
      .sort((a, b) => a.display_order - b.display_order);
    return { data, error: null };
  } catch (err) { return { data: [], error: err instanceof Error ? err.message : "Fetch failed" }; }
}

export async function createMarqueeMessage(message: Omit<MarqueeMessage, "id" | "created_at" | "updated_at">): Promise<{ data: MarqueeMessage | null; error: string | null }> {
  if (!isConfigured || !db) return { data: null, error: "Firebase not configured" };
  try {
    const docRef = await addDoc(collection(db, COLLECTION), { ...message, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    const snap = await getDoc(docRef);
    if (!snap.exists()) return { data: null, error: "Failed to create" };
    return { data: docToMarquee({ id: snap.id, data: () => snap.data() as Record<string, unknown> }), error: null };
  } catch (err) { return { data: null, error: err instanceof Error ? err.message : "Create failed" }; }
}

export async function updateMarqueeMessage(id: string, updates: Partial<Omit<MarqueeMessage, "id" | "created_at">>): Promise<{ data: MarqueeMessage | null; error: string | null }> {
  if (!isConfigured || !db) return { data: null, error: "Firebase not configured" };
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, { ...updates, updated_at: new Date().toISOString() });
    const snap = await getDoc(docRef);
    if (!snap.exists()) return { data: null, error: "Not found" };
    return { data: docToMarquee({ id: snap.id, data: () => snap.data() as Record<string, unknown> }), error: null };
  } catch (err) { return { data: null, error: err instanceof Error ? err.message : "Update failed" }; }
}

export async function deleteMarqueeMessage(id: string): Promise<{ error: string | null }> {
  if (!isConfigured || !db) return { error: "Firebase not configured" };
  try { await deleteDoc(doc(db, COLLECTION, id)); return { error: null }; }
  catch (err) { return { error: err instanceof Error ? err.message : "Delete failed" }; }
}

export async function reorderMarqueeMessages(orderedIds: string[]): Promise<{ error: string | null }> {
  if (!isConfigured || !db) return { error: "Firebase not configured" };
  try {
    for (let i = 0; i < orderedIds.length; i++) {
      await updateDoc(doc(db, COLLECTION, orderedIds[i]), { display_order: i + 1, updated_at: new Date().toISOString() });
    }
    return { error: null };
  } catch (err) { return { error: err instanceof Error ? err.message : "Reorder failed" }; }
}
