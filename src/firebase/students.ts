import { db, isConfigured } from "./firebase";
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp } from "firebase/firestore";
import type { Student, StudentData } from "@/data/mockData";

export type { Student, StudentData };

const COLLECTION = "students";

function generateStudentId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `STU${year}${random}`;
}

function docToStudent(d: { id: string; data: () => Record<string, unknown> }): Student {
  const data = d.data() as Record<string, unknown>;
  return {
    id: d.id, user_id: data.user_id as string | undefined, application_id: data.application_id as string | undefined,
    student_id: data.student_id as string | undefined, first_name: (data.first_name as string) || "",
    middle_name: data.middle_name as string | undefined, last_name: (data.last_name as string) || "",
    date_of_birth: data.date_of_birth as string | undefined, gender: data.gender as string | undefined,
    blood_group: data.blood_group as string | undefined, religion: data.religion as string | undefined,
    nationality: data.nationality as string | undefined, aadhar_number: data.aadhar_number as string | undefined,
    photo_url: data.photo_url as string | undefined, father_name: data.father_name as string | undefined,
    father_occupation: data.father_occupation as string | undefined, father_phone: data.father_phone as string | undefined,
    mother_name: data.mother_name as string | undefined, mother_occupation: data.mother_occupation as string | undefined,
    mother_phone: data.mother_phone as string | undefined, emergency_contact: data.emergency_contact as string | undefined,
    class: (data.class as string) || "", section: data.section as string | undefined,
    roll_number: data.roll_number as string | undefined, academic_year: data.academic_year as string | undefined,
    admission_date: data.admission_date as string | undefined, previous_school: data.previous_school as string | undefined,
    email: (data.email as string) || "", phone: data.phone as string | undefined,
    current_address: data.current_address as string | undefined, permanent_address: data.permanent_address as string | undefined,
    medical_conditions: data.medical_conditions as string | undefined,
    total_fees: data.total_fees as string | undefined, paid_fees: data.paid_fees as string | undefined,
    due_fees: data.due_fees as string | undefined, fee_status: data.fee_status as string | undefined,
    status: (data.status as string) || "active",
    created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : (data.created_at as string) || new Date().toISOString(),
    updated_at: data.updated_at instanceof Timestamp ? data.updated_at.toDate().toISOString() : (data.updated_at as string) || new Date().toISOString(),
  };
}

export async function createStudent(data: StudentData): Promise<{ data: Student | null; error: string | null }> {
  if (!isConfigured || !db) return { data: null, error: "Firebase not configured" };
  try {
    const studentId = generateStudentId();
    const docRef = await addDoc(collection(db, COLLECTION), { ...data, student_id: studentId, status: "active", created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    const snap = await getDoc(docRef);
    if (!snap.exists()) return { data: null, error: "Failed to create" };
    return { data: docToStudent({ id: snap.id, data: () => snap.data() as Record<string, unknown> }), error: null };
  } catch (err) { return { data: null, error: err instanceof Error ? err.message : "Create failed" }; }
}

export async function getStudents(filters?: { class?: string; section?: string; status?: string }): Promise<{ data: Student[]; error: string | null }> {
  if (!isConfigured || !db) return { data: [], error: null };
  try {
    const constraints: Parameters<typeof where>[] = [];
    if (filters?.class && filters.class !== "all") constraints.push(["class", "==", filters.class] as unknown as Parameters<typeof where>);
    if (filters?.section) constraints.push(["section", "==", filters.section] as unknown as Parameters<typeof where>);
    if (filters?.status) constraints.push(["status", "==", filters.status] as unknown as Parameters<typeof where>);
    
    let q;
    if (constraints.length > 0) {
      const whereConstraints = constraints.map(c => where(c[0] as string, c[1] as any, c[2]));
      q = query(collection(db, COLLECTION), ...whereConstraints, orderBy("created_at", "desc"));
    } else {
      q = query(collection(db, COLLECTION), orderBy("created_at", "desc"));
    }
    const snap = await getDocs(q);
    return { data: snap.docs.map(d => docToStudent({ id: d.id, data: () => d.data() as Record<string, unknown> })), error: null };
  } catch (err) { return { data: [], error: err instanceof Error ? err.message : "Fetch failed" }; }
}

export async function getStudentById(id: string): Promise<{ data: Student | null; error: string | null }> {
  if (!isConfigured || !db) return { data: null, error: "Firebase not configured" };
  try {
    const snap = await getDoc(doc(db, COLLECTION, id));
    if (!snap.exists()) return { data: null, error: "Not found" };
    return { data: docToStudent({ id: snap.id, data: () => snap.data() as Record<string, unknown> }), error: null };
  } catch (err) { return { data: null, error: err instanceof Error ? err.message : "Fetch failed" }; }
}

export async function getStudentByUserId(userId: string): Promise<{ data: Student | null; error: string | null }> {
  if (!isConfigured || !db) return { data: null, error: null };
  try {
    const q = query(collection(db, COLLECTION), where("user_id", "==", userId));
    const snap = await getDocs(q);
    if (snap.empty) return { data: null, error: null };
    const d = snap.docs[0];
    return { data: docToStudent({ id: d.id, data: () => d.data() as Record<string, unknown> }), error: null };
  } catch (err) { return { data: null, error: err instanceof Error ? err.message : "Fetch failed" }; }
}

export async function updateStudent(id: string, data: Partial<StudentData>): Promise<{ data: Student | null; error: string | null }> {
  if (!isConfigured || !db) return { data: null, error: "Firebase not configured" };
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, { ...data, updated_at: new Date().toISOString() });
    const snap = await getDoc(docRef);
    if (!snap.exists()) return { data: null, error: "Not found" };
    return { data: docToStudent({ id: snap.id, data: () => snap.data() as Record<string, unknown> }), error: null };
  } catch (err) { return { data: null, error: err instanceof Error ? err.message : "Update failed" }; }
}

export async function deactivateStudent(id: string): Promise<{ error: string | null }> {
  if (!isConfigured || !db) return { error: "Firebase not configured" };
  try { await updateDoc(doc(db, COLLECTION, id), { status: "inactive", updated_at: new Date().toISOString() }); return { error: null }; }
  catch (err) { return { error: err instanceof Error ? err.message : "Update failed" }; }
}

export async function reactivateStudent(id: string): Promise<{ error: string | null }> {
  if (!isConfigured || !db) return { error: "Firebase not configured" };
  try { await updateDoc(doc(db, COLLECTION, id), { status: "active", updated_at: new Date().toISOString() }); return { error: null }; }
  catch (err) { return { error: err instanceof Error ? err.message : "Update failed" }; }
}

export async function searchStudents(searchTerm: string): Promise<{ data: Student[]; error: string | null }> {
  const { data, error } = await getStudents();
  if (error) return { data: [], error };
  const term = searchTerm.toLowerCase();
  return { data: data.filter(s => s.first_name.toLowerCase().includes(term) || s.last_name.toLowerCase().includes(term) || (s.student_id || "").toLowerCase().includes(term) || s.email.toLowerCase().includes(term)), error: null };
}

export async function getStudentCountByClass(): Promise<{ data: { class: string; count: number }[]; error: string | null }> {
  if (!isConfigured || !db) return { data: [], error: null };
  try {
    const q = query(collection(db, COLLECTION), where("status", "==", "active"));
    const snap = await getDocs(q);
    const counts: Record<string, number> = {};
    snap.docs.forEach(d => { const cls = (d.data().class as string) || "Unknown"; counts[cls] = (counts[cls] || 0) + 1; });
    return { data: Object.entries(counts).map(([cls, count]) => ({ class: cls, count })), error: null };
  } catch (err) { return { data: [], error: err instanceof Error ? err.message : "Fetch failed" }; }
}

export async function deleteStudent(id: string): Promise<{ error: string | null }> {
  if (!isConfigured || !db) return { error: "Firebase not configured" };
  try { await deleteDoc(doc(db, COLLECTION, id)); return { error: null }; }
  catch (err) { return { error: err instanceof Error ? err.message : "Delete failed" }; }
}
