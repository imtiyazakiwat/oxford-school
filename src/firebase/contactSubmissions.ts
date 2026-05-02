import { db, isConfigured } from "./firebase";
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp } from "firebase/firestore";
import type { ContactSubmission, ContactFormInput } from "@/data/mockData";

export type { ContactSubmission, ContactFormInput };

const COLLECTION = "contact_submissions";

function docToContact(d: { id: string; data: () => Record<string, unknown> }): ContactSubmission {
  const data = d.data() as Record<string, unknown>;
  return {
    id: d.id, full_name: (data.full_name as string) || "", email: (data.email as string) || "",
    phone: (data.phone as string) || null, subject: (data.subject as string) || "",
    message: (data.message as string) || "", status: (data.status as ContactSubmission["status"]) || "new",
    created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : (data.created_at as string) || new Date().toISOString(),
  };
}

export async function submitContactForm(input: ContactFormInput): Promise<{ success: boolean; error: string | null }> {
  if (!isConfigured || !db) return { success: false, error: "Firebase not configured" };
  try {
    await addDoc(collection(db, COLLECTION), { ...input, phone: input.phone || null, status: "new", created_at: new Date().toISOString() });
    return { success: true, error: null };
  } catch (err) { return { success: false, error: err instanceof Error ? err.message : "Submit failed" }; }
}

export async function getAllContactSubmissions(): Promise<{ data: ContactSubmission[]; error: string | null }> {
  if (!isConfigured || !db) return { data: [], error: null };
  try {
    const q = query(collection(db, COLLECTION), orderBy("created_at", "desc"));
    const snap = await getDocs(q);
    return { data: snap.docs.map(d => docToContact({ id: d.id, data: () => d.data() as Record<string, unknown> })), error: null };
  } catch (err) { return { data: [], error: err instanceof Error ? err.message : "Fetch failed" }; }
}

export async function getContactSubmissionsByStatus(status: ContactSubmission["status"]): Promise<{ data: ContactSubmission[]; error: string | null }> {
  if (!isConfigured || !db) return { data: [], error: null };
  try {
    const q = query(collection(db, COLLECTION), where("status", "==", status), orderBy("created_at", "desc"));
    const snap = await getDocs(q);
    return { data: snap.docs.map(d => docToContact({ id: d.id, data: () => d.data() as Record<string, unknown> })), error: null };
  } catch (err) { return { data: [], error: err instanceof Error ? err.message : "Fetch failed" }; }
}

export async function updateContactStatus(id: string, status: ContactSubmission["status"]): Promise<{ error: string | null }> {
  if (!isConfigured || !db) return { error: "Firebase not configured" };
  try { await updateDoc(doc(db, COLLECTION, id), { status }); return { error: null }; }
  catch (err) { return { error: err instanceof Error ? err.message : "Update failed" }; }
}

export async function deleteContactSubmission(id: string): Promise<{ error: string | null }> {
  if (!isConfigured || !db) return { error: "Firebase not configured" };
  try { await deleteDoc(doc(db, COLLECTION, id)); return { error: null }; }
  catch (err) { return { error: err instanceof Error ? err.message : "Delete failed" }; }
}

export async function getUnreadCount(): Promise<{ count: number; error: string | null }> {
  if (!isConfigured || !db) return { count: 0, error: null };
  try {
    const q = query(collection(db, COLLECTION), where("status", "==", "new"));
    const snap = await getDocs(q);
    return { count: snap.size, error: null };
  } catch (err) { return { count: 0, error: err instanceof Error ? err.message : "Fetch failed" }; }
}
