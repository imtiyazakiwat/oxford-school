import { supabase } from "./supabase";

export interface StudentAuditLog {
    id: string;
    student_id: string;
    action: string;
    field_changed: string | null;
    old_value: string | null;
    new_value: string | null;
    description: string | null;
    admin_id: string | null;
    admin_name: string | null;
    created_at: string;
}

export type AuditAction =
    | "profile_update"
    | "fee_update"
    | "payment_recorded"
    | "status_change"
    | "created"
    | "deleted";

/**
 * Log an audit entry for a student
 */
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
    const { data, error } = await supabase.rpc("log_student_audit", {
        p_student_id: studentId,
        p_action: action,
        p_field_changed: options?.fieldChanged || null,
        p_old_value: options?.oldValue || null,
        p_new_value: options?.newValue || null,
        p_description: options?.description || null,
    });

    if (error) {
        console.error("Error logging student audit:", error);
        return { data: null, error };
    }

    return { data: { id: data }, error: null };
}

/**
 * Get audit logs for a specific student
 */
export async function getStudentAuditLogs(
    studentId: string,
    limit: number = 50
): Promise<{ data: StudentAuditLog[] | null; error: Error | null }> {
    const { data, error } = await supabase
        .from("student_audit_log")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching student audit logs:", error);
        return { data: null, error };
    }

    return { data, error: null };
}

/**
 * Helper to format action for display
 */
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

/**
 * Helper to format field name for display
 */
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
