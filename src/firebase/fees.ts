import { db, isConfigured } from "./firebase";
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp, limit } from "firebase/firestore";
import { sanitizeString } from "@/utils/sanitize";

// =============================================================================
// INTERFACES
// =============================================================================

export interface FeeStructure {
  id: string;
  name: string;
  academic_year: string;
  applicable_class: string;
  tuition_fee: number;
  total_fee: number;
  lab_fee: number;
  library_fee: number;
  sports_fee: number;
  exam_fee: number;
  other_fee: number;
  is_active: boolean;
  created_at: string;
}

export interface FeeStructureInput {
  name: string;
  academic_year: string;
  applicable_class: string;
  tuition_fee: number;
  total_fee: number;
  lab_fee?: number;
  library_fee?: number;
  sports_fee?: number;
  exam_fee?: number;
  other_fee?: number;
  is_active: boolean;
}

export async function createFeeStructure(input: FeeStructureInput, userId: string) {
    if (!isConfigured || !db) return { data: null, error: "Firebase not configured" };
    try {
        const docRef = await addDoc(collection(db, "fee_structures"), {
            ...input,
            created_by: userId,
            created_at: new Date().toISOString(),
        });
        return { data: { id: docRef.id }, error: null };
    } catch (err) { return { data: null, error: err instanceof Error ? err.message : "Create failed" }; }
}

export async function updateFeeStructure(id: string, input: Partial<FeeStructureInput>, userId: string) {
    if (!isConfigured || !db) return { data: null, error: "Firebase not configured" };
    try {
        await updateDoc(doc(db, "fee_structures", id), {
            ...input,
            updated_by: userId,
            updated_at: new Date().toISOString(),
        });
        return { data: { id }, error: null };
    } catch (err) { return { data: null, error: err instanceof Error ? err.message : "Update failed" }; }
}

export async function deleteFeeStructure(id: string) {
    if (!isConfigured || !db) return { error: "Firebase not configured" };
    try {
        await deleteDoc(doc(db, "fee_structures", id));
        return { error: null };
    } catch (err) { return { error: err instanceof Error ? err.message : "Delete failed" }; }
}

export interface FeeRecord {
  id: string;
  student_id: string;
  academic_year: string;
  total_fees: number;
  paid_fees: number;
  due_fees: number;
  due_date: string;
  fee_status: FeeStatus;
  created_at: string;
  tuition_fee: number;
  lab_fee: number;
  library_fee: number;
  sports_fee: number;
  exam_fee: number;
  other_fee: number;
  notes?: string;
  student?: {
    first_name: string;
    last_name: string;
    student_id: string;
    class: string;
  };
}

export type FeeStatus = "Paid" | "Partial" | "Pending" | "Overdue";

export interface FeeRecordFilters {
  academic_year?: string;
  class?: string;
  fee_status?: FeeStatus;
  student_id?: string;
}

export interface FeeAssignmentInput {
  student_id: string;
  fee_structure_id?: string;
  academic_year: string;
  total_fees: number;
  due_date: string;
  tuition_fee?: number;
  lab_fee?: number;
  library_fee?: number;
  sports_fee?: number;
  exam_fee?: number;
  other_fee?: number;
  notes?: string;
}

export interface PaymentInput {
  fee_record_id: string;
  student_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  receipt_number: string;
  notes?: string;
  academic_year: string;
}

export async function recordPayment(input: PaymentInput, userId: string) {
    if (!isConfigured || !db) return { data: null, error: "Firebase not configured" };
    try {
        // 1. Create payment record
        const paymentRef = await addDoc(collection(db, "fee_payments"), {
            ...input,
            created_by: userId,
            created_at: new Date().toISOString(),
        });

        // 2. Update fee record (Simplified: in a real app this should be a transaction)
        const feeRecordRef = doc(db, "fee_records", input.fee_record_id);
        const feeRecordSnap = await getDoc(feeRecordRef);
        
        if (feeRecordSnap.exists()) {
            const feeData = feeRecordSnap.data();
            const newPaid = (feeData.paid_fees || 0) + input.amount;
            const newDue = feeData.total_fees - newPaid;
            const newStatus = newDue <= 0 ? "Paid" : (newPaid > 0 ? "Partial" : "Pending");

            await updateDoc(feeRecordRef, {
                paid_fees: newPaid,
                due_fees: newDue,
                fee_status: newStatus,
                updated_at: new Date().toISOString(),
            });
        }

        const paymentData = {
            id: paymentRef.id,
            ...input,
            created_by: userId,
            created_at: new Date().toISOString(),
        } as FeePayment;

        return { data: paymentData, error: null };
    } catch (err) { return { data: null, error: err instanceof Error ? err.message : "Payment failed" }; }
}

export interface FeePayment {
  id: string;
  fee_record_id: string;
  student_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  receipt_number: string;
  notes?: string;
  created_at: string;
  student?: {
    first_name: string;
    last_name: string;
    student_id: string;
    class: string;
  };
}

export interface FeeStatistics {
  totalExpected: number;
  totalCollectedThisMonth: number;
  totalOutstanding: number;
  overdueStudentCount: number;
  recentPayments: FeePayment[];
  topDefaulters: FeeRecord[];
  monthlyTrend: { month: string; amount: number }[];
}

export async function updateOverdueStatuses() {
    return { error: null };
}

export async function assignFeeToStudent(input: FeeAssignmentInput, userId: string) {
    if (!isConfigured || !db) return { data: null, error: "Firebase not configured" };
    try {
        const docRef = await addDoc(collection(db, "fee_records"), {
            ...input,
            paid_fees: 0,
            due_fees: input.total_fees,
            fee_status: "Pending",
            created_by: userId,
            created_at: new Date().toISOString(),
        });
        return { data: { id: docRef.id }, error: null };
    } catch (err) { return { data: null, error: err instanceof Error ? err.message : "Assign failed" }; }
}

export async function updateFeeRecord(id: string, input: any) {
    if (!isConfigured || !db) return { data: null, error: "Firebase not configured" };
    try {
        await updateDoc(doc(db, "fee_records", id), {
            ...input,
            updated_at: new Date().toISOString(),
        });
        return { data: { id }, error: null };
    } catch (err) { return { data: null, error: err instanceof Error ? err.message : "Update failed" }; }
}

// =============================================================================
// OPERATIONS
// =============================================================================

export async function getFeeStructures(filters?: any, skipCache: boolean = false) {
  if (!isConfigured || !db) return { data: [], error: null };
  try {
    let q = query(collection(db, "fee_structures"), orderBy("academic_year", "desc"));
    if (filters?.academic_year) {
      q = query(collection(db, "fee_structures"), where("academic_year", "==", filters.academic_year));
    }
    if (filters?.is_active !== undefined) {
      q = query(q, where("is_active", "==", filters.is_active));
    }
    const snap = await getDocs(q);
    return { data: snap.docs.map(d => ({ id: d.id, ...d.data() })) as FeeStructure[], error: null };
  } catch (err) { return { data: [], error: err instanceof Error ? err.message : "Fetch failed" }; }
}

export async function getFeeRecords(filters?: FeeRecordFilters) {
  if (!isConfigured || !db) return { data: [], error: null };
  try {
    let q = query(collection(db, "fee_records"), orderBy("created_at", "desc"));
    if (filters?.student_id) {
      q = query(collection(db, "fee_records"), where("student_id", "==", filters.student_id));
    }
    const snap = await getDocs(q);
    return { data: snap.docs.map(d => ({ id: d.id, ...d.data() })) as FeeRecord[], error: null };
  } catch (err) { return { data: [], error: err instanceof Error ? err.message : "Fetch failed" }; }
}

export async function getPaymentsByStudent(studentId: string) {
  if (!isConfigured || !db) return { data: [], error: null };
  try {
    const q = query(collection(db, "fee_payments"), where("student_id", "==", studentId), orderBy("payment_date", "desc"));
    const snap = await getDocs(q);
    return { data: snap.docs.map(d => ({ id: d.id, ...d.data() })) as FeePayment[], error: null };
  } catch (err) { return { data: [], error: err instanceof Error ? err.message : "Fetch failed" }; }
}

export function clearFeesCache() {
  // No-op for now
}

export async function getFeeRecordByStudent(studentId: string, academicYear?: string) {
    const { data } = await getFeeRecords({ student_id: studentId });
    return { data: data[0] || null, error: null };
}

export type { StudentAuditLog as FeeAuditLog, AuditLogFilters } from "./studentAudit";
export { getStudentAuditLogs as getFeeAuditLogs } from "./studentAudit";

export async function getPaymentsByDateRange(startDate: string, endDate: string) {
    if (!isConfigured || !db) return { data: [], error: null };
    try {
        const q = query(
            collection(db, "fee_payments"),
            where("payment_date", ">=", startDate),
            where("payment_date", "<=", endDate),
            orderBy("payment_date", "desc")
        );
        const snap = await getDocs(q);
        return { data: snap.docs.map(d => ({ id: d.id, ...d.data() })) as FeePayment[], error: null };
    } catch (err) { return { data: [], error: err instanceof Error ? err.message : "Fetch failed" }; }
}

export async function getOverdueRecords() {
    return { data: [], error: null };
}

export interface CollectionReport {
    totalCollected: number;
    paymentCount: number;
    byClass: { class: string; amount: number; count: number }[];
    payments: FeePayment[];
}

export interface DefaultersReport {
    totalDefaulters: number;
    totalOverdueAmount: number;
    defaulters: FeeRecord[];
}

export interface ClassWiseReport {
    classes: {
        class: string;
        totalStudents: number;
        totalExpected: number;
        totalCollected: number;
        totalOutstanding: number;
        paidCount: number;
        partialCount: number;
        pendingCount: number;
        overdueCount: number;
    }[];
}

export async function getCollectionReport(filters: { start_date: string; end_date: string; class?: string }) {
    return { 
        data: { 
            totalCollected: 0, 
            paymentCount: 0, 
            byClass: [], 
            payments: [] 
        } as CollectionReport, 
        error: null 
    };
}

export async function getDefaultersReport(filters: { academic_year: string; class?: string }) {
    return { 
        data: { 
            totalDefaulters: 0, 
            totalOverdueAmount: 0, 
            defaulters: [] 
        } as DefaultersReport, 
        error: null 
    };
}

export async function getClassWiseReport(academicYear: string) {
    return { 
        data: { 
            classes: [] 
        } as ClassWiseReport, 
        error: null 
    };
}

export function exportReportToCSV(data: any[], type: string) {
    // Basic CSV converter
    if (!data || data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => headers.map(header => JSON.stringify(obj[header] || "")).join(","));
    return [headers.join(","), ...rows].join("\n");
}

export async function getFeeStatistics(academicYear: string) {
    return { data: null, error: null };
}
