import { db, isConfigured } from "./firebase";
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp, limit } from "firebase/firestore";

export interface StudentAuditLog {
    id: string;
    student_id: string;
    action: string;
    table_name: string;
    old_data: Record<string, unknown> | null;
    new_data: Record<string, unknown> | null;
    description: string | null;
    admin_user?: {
        email: string;
        name?: string;
    };
    changed_at: string;
}

export type AuditAction =
    | "profile_update"
    | "fee_update"
    | "payment_recorded"
    | "status_change"
    | "created"
    | "deleted";

export interface AuditLogFilters {
    table_name?: string;
    record_id?: string;
    action?: string;
    changed_by?: string;
    start_date?: string;
    end_date?: string;
    student_id?: string;
}

export async function logStudentAudit(
    studentId: string,
    action: AuditAction,
    options?: {
        fieldChanged?: string;
        oldValue?: string;
        newValue?: string;
        description?: string;
    }
): Promise<{ data: { id: string } | null; error: Error | null }> {
    if (!isConfigured || !db) return { data: null, error: new Error("Firebase not configured") };
    
    try {
        const docRef = await addDoc(collection(db, "student_audit_log"), {
            student_id: studentId,
            action,
            field_changed: options?.fieldChanged || null,
            old_value: options?.oldValue || null,
            new_value: options?.newValue || null,
            description: options?.description || null,
            created_at: Timestamp.now(),
        });
        return { data: { id: docRef.id }, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

export async function getStudentAuditLogs(
    studentIdOrFilters?: string | AuditLogFilters,
    limitCount: number = 50
): Promise<{ data: StudentAuditLog[] | null; error: Error | null }> {
    if (!isConfigured || !db) return { data: [], error: null };
    
    try {
        let q;
        const colRef = collection(db, "student_audit_log");
        
        if (typeof studentIdOrFilters === "string") {
            q = query(
                colRef,
                where("student_id", "==", studentIdOrFilters),
                orderBy("created_at", "desc"),
                limit(limitCount)
            );
        } else if (studentIdOrFilters) {
            const constraints: any[] = [];
            if (studentIdOrFilters.student_id) constraints.push(where("student_id", "==", studentIdOrFilters.student_id));
            if (studentIdOrFilters.action) constraints.push(where("action", "==", studentIdOrFilters.action));
            constraints.push(orderBy("created_at", "desc"));
            constraints.push(limit(limitCount));
            q = query(colRef, ...constraints);
        } else {
            q = query(colRef, orderBy("created_at", "desc"), limit(limitCount));
        }
        
        const snap = await getDocs(q);
        const logs = snap.docs.map(d => {
            const data = d.data();
            const createdAt = data.created_at instanceof Timestamp ? 
                data.created_at.toDate().toISOString() : 
                (data.created_at as string) || new Date().toISOString();
            
            return {
                id: d.id,
                ...data,
                changed_at: createdAt,
            };
        }) as StudentAuditLog[];
        return { data: logs, error: null };
    } catch (error) {
        return { data: null, error: error as Error };
    }
}

export function formatAuditAction(action: string): string {
    const actionMap: Record<string, string> = {
        profile_update: "Updated Profile",
        fee_update: "Updated Fee",
        payment_recorded: "Recorded Payment",
        status_change: "Changed Status",
        created: "Created Record",
        deleted: "Deleted Record",
    };
    return actionMap[action] || action;
}

export function formatFieldName(field: string | null): string {
    if (!field) return "";
    const fieldMap: Record<string, string> = {
        first_name: "First Name",
        middle_name: "Middle Name",
        last_name: "Last Name",
        class: "Class",
        section: "Section",
        roll_number: "Roll Number",
        phone: "Phone",
        email: "Email",
        current_address: "Address",
        status: "Status",
        fee_amount: "Fee Amount",
        paid_amount: "Paid Amount",
        due_amount: "Due Amount",
        father_name: "Father's Name",
        mother_name: "Mother's Name",
        father_phone: "Father's Phone",
        mother_phone: "Mother's Phone",
        emergency_contact: "Emergency Contact",
    };
    return fieldMap[field] || field.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
