import { db, isConfigured } from "./firebase";
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp } from "firebase/firestore";
import type { Application, ApplicationData } from "@/data/mockData";

export type { Application, ApplicationData };

const COLLECTION = "applications";

function generateApplicationNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `APP${year}${random}`;
}

function docToApplication(d: { id: string; data: () => Record<string, unknown> }): Application {
  const data = d.data() as Record<string, unknown>;
  return {
    id: d.id,
    first_name: (data.first_name as string) || "", middle_name: data.middle_name as string | undefined,
    last_name: (data.last_name as string) || "", date_of_birth: (data.date_of_birth as string) || "",
    gender: (data.gender as string) || "", blood_group: data.blood_group as string | undefined,
    religion: data.religion as string | undefined, nationality: data.nationality as string | undefined,
    aadhar_number: data.aadhar_number as string | undefined, photo_url: data.photo_url as string | undefined,
    father_name: (data.father_name as string) || "", father_occupation: data.father_occupation as string | undefined,
    father_phone: data.father_phone as string | undefined, mother_name: (data.mother_name as string) || "",
    mother_occupation: data.mother_occupation as string | undefined, mother_phone: data.mother_phone as string | undefined,
    emergency_contact: (data.emergency_contact as string) || "",
    applying_for_class: (data.applying_for_class as string) || "", academic_year: (data.academic_year as string) || "",
    previous_school: data.previous_school as string | undefined, previous_class: data.previous_class as string | undefined,
    previous_percentage: data.previous_percentage as string | undefined,
    email: (data.email as string) || "", phone: (data.phone as string) || "",
    current_address: (data.current_address as string) || "",
    reason_to_join: data.reason_to_join as string | undefined, medical_conditions: data.medical_conditions as string | undefined,
    application_number: (data.application_number as string) || "",
    status: (data.status as Application["status"]) || "pending",
    rejection_reason: data.rejection_reason as string | undefined,
    reviewed_by: data.reviewed_by as string | undefined, reviewed_at: data.reviewed_at as string | undefined,
    created_user_id: data.created_user_id as string | undefined,
    created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : (data.created_at as string) || new Date().toISOString(),
    updated_at: data.updated_at instanceof Timestamp ? data.updated_at.toDate().toISOString() : (data.updated_at as string) || new Date().toISOString(),
  };
}

export async function submitApplication(data: ApplicationData): Promise<{ data: Application | null; error: string | null }> {
  if (!isConfigured || !db) return { data: null, error: "Firebase not configured" };
  try {
    const appNumber = generateApplicationNumber();
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data, application_number: appNumber, status: "pending",
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    });
    const snap = await getDoc(docRef);
    if (!snap.exists()) return { data: null, error: "Failed to submit" };
    return { data: docToApplication({ id: snap.id, data: () => snap.data() as Record<string, unknown> }), error: null };
  } catch (err) { return { data: null, error: err instanceof Error ? err.message : "Submit failed" }; }
}

export async function getApplications(status?: string): Promise<{ data: Application[]; error: string | null }> {
  if (!isConfigured || !db) return { data: [], error: null };
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    let data = snap.docs.map(d => docToApplication({ id: d.id, data: () => d.data() as Record<string, unknown> }));
    if (status && status !== "all") data = data.filter(a => a.status === status);
    data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return { data, error: null };
  } catch (err) { return { data: [], error: err instanceof Error ? err.message : "Fetch failed" }; }
}

export async function getApplicationById(id: string): Promise<{ data: Application | null; error: string | null }> {
  if (!isConfigured || !db) return { data: null, error: "Firebase not configured" };
  try {
    const snap = await getDoc(doc(db, COLLECTION, id));
    if (!snap.exists()) return { data: null, error: "Not found" };
    return { data: docToApplication({ id: snap.id, data: () => snap.data() as Record<string, unknown> }), error: null };
  } catch (err) { return { data: null, error: err instanceof Error ? err.message : "Fetch failed" }; }
}

export async function approveApplication(id: string, adminId: string, assignedClass: string, section?: string): Promise<{ data: Application | null; error: string | null }> {
  if (!isConfigured || !db) return { data: null, error: "Firebase not configured" };
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, { status: "approved", reviewed_by: adminId, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    const snap = await getDoc(docRef);
    if (!snap.exists()) return { data: null, error: "Not found" };
    return { data: docToApplication({ id: snap.id, data: () => snap.data() as Record<string, unknown> }), error: null };
  } catch (err) { return { data: null, error: err instanceof Error ? err.message : "Approve failed" }; }
}

export async function rejectApplication(id: string, adminId: string, reason: string): Promise<{ data: Application | null; error: string | null }> {
  if (!isConfigured || !db) return { data: null, error: "Firebase not configured" };
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, { status: "rejected", rejection_reason: reason, reviewed_by: adminId, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    const snap = await getDoc(docRef);
    if (!snap.exists()) return { data: null, error: "Not found" };
    return { data: docToApplication({ id: snap.id, data: () => snap.data() as Record<string, unknown> }), error: null };
  } catch (err) { return { data: null, error: err instanceof Error ? err.message : "Reject failed" }; }
}

export async function updateApplicationUserId(id: string, userId: string): Promise<{ error: string | null }> {
  if (!isConfigured || !db) return { error: "Firebase not configured" };
  try { await updateDoc(doc(db, COLLECTION, id), { created_user_id: userId, updated_at: new Date().toISOString() }); return { error: null }; }
  catch (err) { return { error: err instanceof Error ? err.message : "Update failed" }; }
}

export async function searchApplications(searchTerm: string): Promise<{ data: Application[]; error: string | null }> {
  // Firestore doesn't support ilike — fetch all and filter client-side
  const { data, error } = await getApplications();
  if (error) return { data: [], error };
  const term = searchTerm.toLowerCase();
  const filtered = data.filter(a =>
    a.first_name.toLowerCase().includes(term) || a.last_name.toLowerCase().includes(term) ||
    a.application_number.toLowerCase().includes(term) || a.email.toLowerCase().includes(term)
  );
  return { data: filtered, error: null };
}

export async function deleteApplication(id: string): Promise<{ error: string | null }> {
  if (!isConfigured || !db) return { error: "Firebase not configured" };
  try { await deleteDoc(doc(db, COLLECTION, id)); return { error: null }; }
  catch (err) { return { error: err instanceof Error ? err.message : "Delete failed" }; }
}
