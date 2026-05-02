import { supabase } from "./supabase";
import { sanitizeString } from "@/utils/sanitize";

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Fee Structure - Template defining fee components for a class/category
 */
export interface FeeStructure {
  id: string;
  name: string;
  academic_year: string;
  applicable_class: string;
  tuition_fee: number;
  lab_fee: number;
  library_fee: number;
  sports_fee: number;
  exam_fee: number;
  other_fee: number;
  total_fee: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FeeStructureInput {
  name: string;
  academic_year: string;
  applicable_class: string;
  tuition_fee?: number;
  lab_fee?: number;
  library_fee?: number;
  sports_fee?: number;
  exam_fee?: number;
  other_fee?: number;
  total_fee: number;
  is_active?: boolean;
}

/**
 * Fee Record - Individual student's fee assignment
 */
export interface FeeRecord {
  id: string;
  student_id: string;
  fee_structure_id: string | null;
  academic_year: string;
  total_fees: number;
  paid_fees: number;
  due_fees: number;
  due_date: string;
  fee_status: FeeStatus;
  tuition_fee: number;
  lab_fee: number;
  library_fee: number;
  sports_fee: number;
  exam_fee: number;
  other_fee: number;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    student_id: string;
    class: string;
    email: string;
  };
}

export type FeeStatus = "Paid" | "Partial" | "Pending" | "Overdue";

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

export interface FeeRecordFilters {
  academic_year?: string;
  class?: string;
  fee_status?: FeeStatus;
  student_id?: string;
}

/**
 * Fee Payment - Individual payment transaction
 */
export interface FeePayment {
  id: string;
  fee_record_id: string;
  student_id: string;
  amount: number;
  payment_date: string;
  payment_method: "cash";
  receipt_number: string;
  notes: string | null;
  recorded_by: string;
  created_at: string;
  // Joined data
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    student_id: string;
    class: string;
  };
  recorded_by_user?: {
    email: string;
  };
}

export interface PaymentInput {
  fee_record_id: string;
  student_id: string;
  amount: number;
  payment_date?: string;
  notes?: string;
}

/**
 * Fee Audit Log - Immutable audit trail entry
 */
export interface FeeAuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: "INSERT" | "UPDATE" | "DELETE";
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  changed_by: string;
  changed_at: string;
  description: string | null;
  // Joined data
  admin_user?: {
    email: string;
    name?: string;
  };
}

export interface AuditLogFilters {
  table_name?: string;
  record_id?: string;
  action?: "INSERT" | "UPDATE" | "DELETE";
  changed_by?: string;
  start_date?: string;
  end_date?: string;
  student_id?: string;
}

/**
 * Dashboard Statistics
 */
export interface FeeStatistics {
  totalExpected: number;
  totalCollectedThisMonth: number;
  totalOutstanding: number;
  overdueStudentCount: number;
  recentPayments: FeePayment[];
  topDefaulters: FeeRecord[];
  monthlyTrend: { month: string; amount: number }[];
}

/**
 * Report Types
 */
export interface CollectionReport {
  totalCollected: number;
  paymentCount: number;
  payments: FeePayment[];
  byDate: { date: string; amount: number; count: number }[];
  byClass: { class: string; amount: number; count: number }[];
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

export interface ReportFilters {
  start_date?: string;
  end_date?: string;
  class?: string;
  fee_status?: FeeStatus;
  academic_year?: string;
}

// =============================================================================
// CACHE CONFIGURATION
// =============================================================================

const CACHE_KEYS = {
  FEE_STRUCTURES: "fee_structures_all",
  FEE_STATISTICS: "fee_statistics",
};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes for fee data (shorter TTL for financial data)

interface CachedData<T> {
  data: T;
  timestamp: number;
}

/**
 * Get cached data from localStorage
 */
function getFromCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const parsed: CachedData<T> = JSON.parse(cached);
    const isExpired = Date.now() - parsed.timestamp > CACHE_TTL;

    if (isExpired) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

/**
 * Save data to localStorage cache
 */
function saveToCache<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;

  try {
    const cacheData: CachedData<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch {
    // localStorage might be full or disabled
  }
}

/**
 * Clear fees cache (call after admin makes changes)
 */
export function clearFeesCache(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CACHE_KEYS.FEE_STRUCTURES);
  localStorage.removeItem(CACHE_KEYS.FEE_STATISTICS);
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generate unique receipt number in format RCP-YYYY-NNNNNN
 */
export function generateReceiptNumber(): string {
  const year = new Date().getFullYear();
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const sequence = ((timestamp + random) % 1000000).toString().padStart(6, "0");
  return `RCP-${year}-${sequence}`;
}

/**
 * Calculate fee status based on paid amount and due date
 */
export function calculateFeeStatus(
  totalFees: number,
  paidFees: number,
  dueDate: Date | string
): FeeStatus {
  if (paidFees >= totalFees) return "Paid";
  if (paidFees > 0) return "Partial";

  const dueDateObj = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDateObj.setHours(0, 0, 0, 0);

  if (today > dueDateObj) return "Overdue";
  return "Pending";
}

/**
 * Validate fee amount is positive
 */
function validatePositiveAmount(amount: number, fieldName: string): string | null {
  if (typeof amount !== "number" || isNaN(amount)) {
    return `${fieldName} must be a valid number`;
  }
  if (amount < 0) {
    return `${fieldName} must be a positive number`;
  }
  return null;
}



// =============================================================================
// FEE STRUCTURE OPERATIONS
// =============================================================================

/**
 * Create a new fee structure
 */
export async function createFeeStructure(
  input: FeeStructureInput,
  userId: string
): Promise<{ data: FeeStructure | null; error: string | null }> {
  // Validate total_fee
  const totalError = validatePositiveAmount(input.total_fee, "Total fee");
  if (totalError) return { data: null, error: totalError };

  // Sanitize text inputs
  const sanitizedInput = {
    ...input,
    name: sanitizeString(input.name),
    academic_year: sanitizeString(input.academic_year),
    applicable_class: sanitizeString(input.applicable_class),
  };

  const { data, error } = await supabase
    .from("fee_structures")
    .insert({
      ...sanitizedInput,
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  clearFeesCache();
  return { data, error: null };
}

/**
 * Update a fee structure
 */
export async function updateFeeStructure(
  id: string,
  input: Partial<FeeStructureInput>
): Promise<{ data: FeeStructure | null; error: string | null }> {
  // Validate total_fee if provided
  if (input.total_fee !== undefined) {
    const totalError = validatePositiveAmount(input.total_fee, "Total fee");
    if (totalError) return { data: null, error: totalError };
  }

  // Sanitize text inputs if provided
  const sanitizedInput: Partial<FeeStructureInput> = { ...input };
  if (input.name) sanitizedInput.name = sanitizeString(input.name);
  if (input.academic_year) sanitizedInput.academic_year = sanitizeString(input.academic_year);
  if (input.applicable_class) sanitizedInput.applicable_class = sanitizeString(input.applicable_class);

  const { data, error } = await supabase
    .from("fee_structures")
    .update(sanitizedInput)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  clearFeesCache();
  return { data, error: null };
}

/**
 * Delete a fee structure (fails if assigned to students)
 */
export async function deleteFeeStructure(
  id: string
): Promise<{ error: string | null }> {
  // Check if any fee_records reference this structure
  const { data: records, error: checkError } = await supabase
    .from("fee_records")
    .select("id")
    .eq("fee_structure_id", id)
    .limit(1);

  if (checkError) {
    return { error: checkError.message };
  }

  if (records && records.length > 0) {
    return { error: "Cannot delete fee structure: It is assigned to students" };
  }

  const { error } = await supabase.from("fee_structures").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  clearFeesCache();
  return { error: null };
}

/**
 * Get all fee structures with optional filters
 */
export async function getFeeStructures(
  filters?: { academic_year?: string; class?: string; is_active?: boolean },
  skipCache = false
): Promise<{ data: FeeStructure[]; error: string | null }> {
  // Check cache if no filters and not skipping
  if (!filters && !skipCache) {
    const cached = getFromCache<FeeStructure[]>(CACHE_KEYS.FEE_STRUCTURES);
    if (cached) return { data: cached, error: null };
  }

  let query = supabase
    .from("fee_structures")
    .select("*")
    .order("academic_year", { ascending: false })
    .order("applicable_class", { ascending: true });

  if (filters?.academic_year) {
    query = query.eq("academic_year", filters.academic_year);
  }
  if (filters?.class) {
    query = query.eq("applicable_class", filters.class);
  }
  if (filters?.is_active !== undefined) {
    query = query.eq("is_active", filters.is_active);
  }

  const { data, error } = await query;

  if (error) {
    return { data: [], error: error.message };
  }

  // Cache only if no filters
  if (!filters && data) {
    saveToCache(CACHE_KEYS.FEE_STRUCTURES, data);
  }

  return { data: data || [], error: null };
}

/**
 * Get fee structure by ID
 */
export async function getFeeStructureById(
  id: string
): Promise<{ data: FeeStructure | null; error: string | null }> {
  const { data, error } = await supabase
    .from("fee_structures")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}


// =============================================================================
// FEE RECORD OPERATIONS
// =============================================================================

/**
 * Assign fee to a student (creates a new fee record)
 * Initializes with paid_fees=0 and due_fees=total_fees
 */
export async function assignFeeToStudent(
  input: FeeAssignmentInput,
  userId: string
): Promise<{ data: FeeRecord | null; error: string | null }> {
  // Validate total_fees
  const totalError = validatePositiveAmount(input.total_fees, "Total fees");
  if (totalError) return { data: null, error: totalError };

  // Check for existing fee assignment for this student and academic year
  const { data: existing, error: checkError } = await supabase
    .from("fee_records")
    .select("id")
    .eq("student_id", input.student_id)
    .eq("academic_year", input.academic_year)
    .limit(1);

  if (checkError) {
    return { data: null, error: checkError.message };
  }

  if (existing && existing.length > 0) {
    return {
      data: null,
      error: "Student already has a fee assignment for this academic year",
    };
  }

  // Sanitize notes if provided
  const sanitizedNotes = input.notes ? sanitizeString(input.notes) : null;

  const { data, error } = await supabase
    .from("fee_records")
    .insert({
      student_id: input.student_id,
      fee_structure_id: input.fee_structure_id || null,
      academic_year: sanitizeString(input.academic_year),
      total_fees: input.total_fees,
      paid_fees: 0, // Always start with 0 paid
      due_fees: input.total_fees, // Due equals total initially
      due_date: input.due_date,
      fee_status: "Pending",
      tuition_fee: input.tuition_fee || 0,
      lab_fee: input.lab_fee || 0,
      library_fee: input.library_fee || 0,
      sports_fee: input.sports_fee || 0,
      exam_fee: input.exam_fee || 0,
      other_fee: input.other_fee || 0,
      notes: sanitizedNotes,
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  clearFeesCache();
  return { data, error: null };
}

/**
 * Update a fee record
 */
export async function updateFeeRecord(
  id: string,
  input: Partial<{
    total_fees: number;
    due_fees: number;
    due_date: string;
    notes: string;
    fee_status: FeeStatus;
    tuition_fee: number;
    lab_fee: number;
    library_fee: number;
    sports_fee: number;
    exam_fee: number;
    other_fee: number;
  }>
): Promise<{ data: FeeRecord | null; error: string | null }> {
  const updateData: Record<string, unknown> = {};

  if (input.total_fees !== undefined) updateData.total_fees = input.total_fees;
  if (input.due_fees !== undefined) updateData.due_fees = input.due_fees;
  if (input.due_date) updateData.due_date = input.due_date;
  if (input.notes !== undefined) updateData.notes = input.notes ? sanitizeString(input.notes) : null;
  if (input.fee_status) updateData.fee_status = input.fee_status;
  if (input.tuition_fee !== undefined) updateData.tuition_fee = input.tuition_fee;
  if (input.lab_fee !== undefined) updateData.lab_fee = input.lab_fee;
  if (input.library_fee !== undefined) updateData.library_fee = input.library_fee;
  if (input.sports_fee !== undefined) updateData.sports_fee = input.sports_fee;
  if (input.exam_fee !== undefined) updateData.exam_fee = input.exam_fee;
  if (input.other_fee !== undefined) updateData.other_fee = input.other_fee;

  const { data, error } = await supabase
    .from("fee_records")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  clearFeesCache();
  return { data, error: null };
}

/**
 * Get fee record for a specific student
 */
export async function getFeeRecordByStudent(
  studentId: string,
  academicYear?: string
): Promise<{ data: FeeRecord | null; error: string | null }> {
  let query = supabase
    .from("fee_records")
    .select(
      `
      *,
      student:students(id, first_name, last_name, student_id, class, email)
    `
    )
    .eq("student_id", studentId);

  if (academicYear) {
    query = query.eq("academic_year", academicYear);
  }

  // Get the most recent record
  query = query.order("created_at", { ascending: false }).limit(1);

  const { data, error } = await query.maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Get fee records with filters
 */
export async function getFeeRecords(
  filters?: FeeRecordFilters
): Promise<{ data: FeeRecord[]; error: string | null }> {
  let query = supabase
    .from("fee_records")
    .select(
      `
      *,
      student:students(id, first_name, last_name, student_id, class, email)
    `
    )
    .order("created_at", { ascending: false });

  if (filters?.academic_year) {
    query = query.eq("academic_year", filters.academic_year);
  }
  if (filters?.fee_status) {
    query = query.eq("fee_status", filters.fee_status);
  }
  if (filters?.student_id) {
    query = query.eq("student_id", filters.student_id);
  }

  const { data, error } = await query;

  if (error) {
    return { data: [], error: error.message };
  }

  // Filter by class if needed (requires join data)
  let filteredData = data || [];
  if (filters?.class) {
    filteredData = filteredData.filter(
      (record) => record.student?.class === filters.class
    );
  }

  return { data: filteredData, error: null };
}

/**
 * Get all overdue fee records
 */
export async function getOverdueRecords(): Promise<{
  data: FeeRecord[];
  error: string | null;
}> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("fee_records")
    .select(
      `
      *,
      student:students(id, first_name, last_name, student_id, class, email)
    `
    )
    .lt("due_date", today)
    .gt("due_fees", 0)
    .order("due_fees", { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: data || [], error: null };
}

// =============================================================================
// PAYMENT OPERATIONS
// =============================================================================

/**
 * Record a payment against a fee record
 * Uses Supabase RPC for atomic and secure processing in the database
 */
export async function recordPayment(
  input: PaymentInput,
  userId: string
): Promise<{ data: FeePayment | null; error: string | null }> {
  // Sanitize notes
  const sanitizedNotes = input.notes ? sanitizeString(input.notes) : null;

  // Call the database function for atomic processing
  const { data, error } = await supabase.rpc("record_fee_payment", {
    p_fee_record_id: input.fee_record_id,
    p_student_id: input.student_id,
    p_amount: input.amount,
    p_payment_date: input.payment_date || new Date().toISOString().split("T")[0],
    p_notes: sanitizedNotes,
  });

  if (error) {
    console.error("RPC Error recording payment:", error);
    return { data: null, error: error.message };
  }

  const result = data as {
    success: boolean;
    error?: string;
    payment_id?: string;
    receipt_number?: string;
  };

  if (!result.success) {
    return { data: null, error: result.error || "Failed to record payment" };
  }

  // Fetch the created payment record to return it
  const { data: payment, error: fetchError } = await supabase
    .from("fee_payments")
    .select("*")
    .eq("id", result.payment_id)
    .single();

  if (fetchError) {
    console.warn("Payment recorded but failed to fetch for return:", fetchError);
  }

  // Log payment to student audit
  if (payment) {
    // Import dynamically to avoid circular dependencies if needed, or assume imported at top
    // For now, I will add the import at the top of the file in a separate edit if not present.
    // Actually, let's just use the imported function. I need to ensure it is imported.
    const { logStudentAudit } = await import("./studentAudit");
    await logStudentAudit(payment.student_id, "payment_recorded", {
      fieldChanged: "paid_amount",
      oldValue: "Unknown",
      newValue: String(payment.amount),
      description: `Recorded payment of ₹${payment.amount} via ${payment.payment_method}`
    });
  }

  clearFeesCache();
  return { data: payment, error: null };
}

/**
 * Get payments for a specific student (ordered by date descending)
 */
export async function getPaymentsByStudent(
  studentId: string
): Promise<{ data: FeePayment[]; error: string | null }> {
  const { data, error } = await supabase
    .from("fee_payments")
    .select(
      `
      *,
      student:students(id, first_name, last_name, student_id, class)
    `
    )
    .eq("student_id", studentId)
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: data || [], error: null };
}

/**
 * Get payments within a date range
 */
export async function getPaymentsByDateRange(
  startDate: string,
  endDate: string
): Promise<{ data: FeePayment[]; error: string | null }> {
  const { data, error } = await supabase
    .from("fee_payments")
    .select(
      `
      *,
      student:students(id, first_name, last_name, student_id, class)
    `
    )
    .gte("payment_date", startDate)
    .lte("payment_date", endDate)
    .order("payment_date", { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: data || [], error: null };
}


// =============================================================================
// FEE STATUS MANAGEMENT
// =============================================================================

/**
 * Update overdue statuses for all fee records
 * Should be called periodically (e.g., daily cron job or on dashboard load)
 */
export async function updateOverdueStatuses(): Promise<{
  updatedCount: number;
  error: string | null;
}> {
  const today = new Date().toISOString().split("T")[0];

  // Find records that should be marked as overdue
  const { data: records, error: fetchError } = await supabase
    .from("fee_records")
    .select("id")
    .lt("due_date", today)
    .gt("due_fees", 0)
    .in("fee_status", ["Pending", "Partial"]);

  if (fetchError) {
    return { updatedCount: 0, error: fetchError.message };
  }

  if (!records || records.length === 0) {
    return { updatedCount: 0, error: null };
  }

  const recordIds = records.map((r) => r.id);

  const { error: updateError } = await supabase
    .from("fee_records")
    .update({ fee_status: "Overdue" })
    .in("id", recordIds);

  if (updateError) {
    return { updatedCount: 0, error: updateError.message };
  }

  clearFeesCache();
  return { updatedCount: records.length, error: null };
}

// =============================================================================
// STATISTICS AND REPORTING
// =============================================================================

/**
 * Get fee statistics for dashboard
 */
export async function getFeeStatistics(
  academicYear: string
): Promise<{ data: FeeStatistics | null; error: string | null }> {
  try {
    // Get all fee records for the academic year
    const { data: feeRecords, error: recordsError } = await supabase
      .from("fee_records")
      .select("*")
      .eq("academic_year", academicYear);

    if (recordsError) throw recordsError;

    // Calculate totals
    const totalExpected = (feeRecords || []).reduce(
      (sum, r) => sum + Number(r.total_fees),
      0
    );
    const totalOutstanding = (feeRecords || []).reduce(
      (sum, r) => sum + Number(r.due_fees),
      0
    );
    const overdueStudentCount = (feeRecords || []).filter(
      (r) => r.fee_status === "Overdue"
    ).length;

    // Get this month's payments
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];

    const { data: monthPayments, error: monthError } = await supabase
      .from("fee_payments")
      .select("amount")
      .gte("payment_date", firstDayOfMonth)
      .lte("payment_date", lastDayOfMonth);

    if (monthError) throw monthError;

    const totalCollectedThisMonth = (monthPayments || []).reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );

    // Get recent payments (last 10)
    const { data: recentPayments, error: recentError } = await supabase
      .from("fee_payments")
      .select(
        `
        *,
        student:students(id, first_name, last_name, student_id, class)
      `
      )
      .order("created_at", { ascending: false })
      .limit(10);

    if (recentError) throw recentError;

    // Get top defaulters (highest outstanding dues)
    const { data: defaulters, error: defaultersError } = await supabase
      .from("fee_records")
      .select(
        `
        *,
        student:students(id, first_name, last_name, student_id, class, email)
      `
      )
      .eq("academic_year", academicYear)
      .gt("due_fees", 0)
      .order("due_fees", { ascending: false })
      .limit(10);

    if (defaultersError) throw defaultersError;

    // Get monthly trend (last 6 months)
    const monthlyTrend: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = date.toISOString().split("T")[0];
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

      const { data: monthData } = await supabase
        .from("fee_payments")
        .select("amount")
        .gte("payment_date", monthStart)
        .lte("payment_date", monthEnd);

      const monthTotal = (monthData || []).reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );

      monthlyTrend.push({
        month: date.toLocaleString("default", { month: "short", year: "numeric" }),
        amount: monthTotal,
      });
    }

    return {
      data: {
        totalExpected,
        totalCollectedThisMonth,
        totalOutstanding,
        overdueStudentCount,
        recentPayments: recentPayments || [],
        topDefaulters: defaulters || [],
        monthlyTrend,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error fetching fee statistics:", error);
    return { data: null, error: "Failed to fetch fee statistics" };
  }
}

/**
 * Get collection report
 */
export async function getCollectionReport(
  filters: ReportFilters
): Promise<{ data: CollectionReport | null; error: string | null }> {
  try {
    let query = supabase
      .from("fee_payments")
      .select(
        `
        *,
        student:students(id, first_name, last_name, student_id, class)
      `
      )
      .order("payment_date", { ascending: false });

    if (filters.start_date) {
      query = query.gte("payment_date", filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte("payment_date", filters.end_date);
    }

    const { data: payments, error } = await query;

    if (error) throw error;

    // Filter by class if needed
    let filteredPayments = payments || [];
    if (filters.class) {
      filteredPayments = filteredPayments.filter(
        (p) => p.student?.class === filters.class
      );
    }

    const totalCollected = filteredPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );

    // Group by date
    const byDateMap = new Map<string, { amount: number; count: number }>();
    filteredPayments.forEach((p) => {
      const date = p.payment_date;
      const existing = byDateMap.get(date) || { amount: 0, count: 0 };
      byDateMap.set(date, {
        amount: existing.amount + Number(p.amount),
        count: existing.count + 1,
      });
    });
    const byDate = Array.from(byDateMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));

    // Group by class
    const byClassMap = new Map<string, { amount: number; count: number }>();
    filteredPayments.forEach((p) => {
      const cls = p.student?.class || "Unknown";
      const existing = byClassMap.get(cls) || { amount: 0, count: 0 };
      byClassMap.set(cls, {
        amount: existing.amount + Number(p.amount),
        count: existing.count + 1,
      });
    });
    const byClass = Array.from(byClassMap.entries()).map(([cls, data]) => ({
      class: cls,
      ...data,
    }));

    return {
      data: {
        totalCollected,
        paymentCount: filteredPayments.length,
        payments: filteredPayments,
        byDate,
        byClass,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error generating collection report:", error);
    return { data: null, error: "Failed to generate collection report" };
  }
}

/**
 * Get defaulters report
 */
export async function getDefaultersReport(
  filters: ReportFilters
): Promise<{ data: DefaultersReport | null; error: string | null }> {
  try {
    let query = supabase
      .from("fee_records")
      .select(
        `
        *,
        student:students(id, first_name, last_name, student_id, class, email)
      `
      )
      .eq("fee_status", "Overdue")
      .order("due_fees", { ascending: false });

    if (filters.academic_year) {
      query = query.eq("academic_year", filters.academic_year);
    }

    const { data: defaulters, error } = await query;

    if (error) throw error;

    // Filter by class if needed
    let filteredDefaulters = defaulters || [];
    if (filters.class) {
      filteredDefaulters = filteredDefaulters.filter(
        (d) => d.student?.class === filters.class
      );
    }

    const totalOverdueAmount = filteredDefaulters.reduce(
      (sum, d) => sum + Number(d.due_fees),
      0
    );

    return {
      data: {
        totalDefaulters: filteredDefaulters.length,
        totalOverdueAmount,
        defaulters: filteredDefaulters,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error generating defaulters report:", error);
    return { data: null, error: "Failed to generate defaulters report" };
  }
}

/**
 * Get class-wise report
 */
export async function getClassWiseReport(
  academicYear: string
): Promise<{ data: ClassWiseReport | null; error: string | null }> {
  try {
    const { data: feeRecords, error } = await supabase
      .from("fee_records")
      .select(
        `
        *,
        student:students(id, first_name, last_name, student_id, class, email)
      `
      )
      .eq("academic_year", academicYear);

    if (error) throw error;

    // Group by class
    const classMap = new Map<
      string,
      {
        totalStudents: number;
        totalExpected: number;
        totalCollected: number;
        totalOutstanding: number;
        paidCount: number;
        partialCount: number;
        pendingCount: number;
        overdueCount: number;
      }
    >();

    (feeRecords || []).forEach((record) => {
      const cls = record.student?.class || "Unknown";
      const existing = classMap.get(cls) || {
        totalStudents: 0,
        totalExpected: 0,
        totalCollected: 0,
        totalOutstanding: 0,
        paidCount: 0,
        partialCount: 0,
        pendingCount: 0,
        overdueCount: 0,
      };

      existing.totalStudents += 1;
      existing.totalExpected += Number(record.total_fees);
      existing.totalCollected += Number(record.paid_fees);
      existing.totalOutstanding += Number(record.due_fees);

      switch (record.fee_status) {
        case "Paid":
          existing.paidCount += 1;
          break;
        case "Partial":
          existing.partialCount += 1;
          break;
        case "Pending":
          existing.pendingCount += 1;
          break;
        case "Overdue":
          existing.overdueCount += 1;
          break;
      }

      classMap.set(cls, existing);
    });

    const classes = Array.from(classMap.entries())
      .map(([cls, data]) => ({
        class: cls,
        ...data,
      }))
      .sort((a, b) => a.class.localeCompare(b.class));

    return {
      data: { classes },
      error: null,
    };
  } catch (error) {
    console.error("Error generating class-wise report:", error);
    return { data: null, error: "Failed to generate class-wise report" };
  }
}

/**
 * Export report data to CSV format
 */
export function exportReportToCSV(
  data: FeeRecord[] | FeePayment[],
  type: "records" | "payments"
): string {
  if (data.length === 0) return "";

  if (type === "records") {
    const records = data as FeeRecord[];
    const headers = [
      "Student ID",
      "Student Name",
      "Class",
      "Academic Year",
      "Total Fees",
      "Paid Fees",
      "Due Fees",
      "Due Date",
      "Status",
    ];
    const rows = records.map((r) => [
      r.student?.student_id || "",
      r.student ? `${r.student.first_name} ${r.student.last_name}` : "",
      r.student?.class || "",
      r.academic_year,
      r.total_fees.toString(),
      r.paid_fees.toString(),
      r.due_fees.toString(),
      r.due_date,
      r.fee_status,
    ]);
    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  } else {
    const payments = data as FeePayment[];
    const headers = [
      "Receipt Number",
      "Student ID",
      "Student Name",
      "Class",
      "Amount",
      "Payment Date",
      "Payment Method",
    ];
    const rows = payments.map((p) => [
      p.receipt_number,
      p.student?.student_id || "",
      p.student ? `${p.student.first_name} ${p.student.last_name}` : "",
      p.student?.class || "",
      p.amount.toString(),
      p.payment_date,
      p.payment_method,
    ]);
    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }
}


// =============================================================================
// AUDIT LOG OPERATIONS
// =============================================================================

/**
 * Get fee audit logs with filters
 */
export async function getFeeAuditLogs(
  filters?: AuditLogFilters
): Promise<{ data: FeeAuditLog[]; error: string | null }> {
  try {
    let query = supabase
      .from("fee_audit_log")
      .select("*")
      .order("changed_at", { ascending: false });

    if (filters?.table_name) {
      query = query.eq("table_name", filters.table_name);
    }
    if (filters?.record_id) {
      query = query.eq("record_id", filters.record_id);
    }
    if (filters?.action) {
      query = query.eq("action", filters.action);
    }
    if (filters?.changed_by) {
      query = query.eq("changed_by", filters.changed_by);
    }
    if (filters?.start_date) {
      query = query.gte("changed_at", filters.start_date);
    }
    if (filters?.end_date) {
      query = query.lte("changed_at", filters.end_date);
    }

    const { data: logs, error } = await query;

    if (error) throw error;

    // Filter by student_id if provided (check in old_data or new_data)
    let filteredLogs = logs || [];
    if (filters?.student_id) {
      filteredLogs = filteredLogs.filter((log) => {
        const oldStudentId = log.old_data?.student_id;
        const newStudentId = log.new_data?.student_id;
        return oldStudentId === filters.student_id || newStudentId === filters.student_id;
      });
    }

    // Get admin user emails and names for the logs
    const adminIds = [...new Set(filteredLogs.map((log) => log.changed_by))];
    if (adminIds.length > 0) {
      const { data: users } = await supabase
        .from("users")
        .select("id, email, full_name")
        .in("id", adminIds);

      const userMap = new Map(users?.map((u) => [u.id, { email: u.email, name: u.full_name }]) || []);

      filteredLogs = filteredLogs.map((log) => ({
        ...log,
        admin_user: userMap.has(log.changed_by)
          ? userMap.get(log.changed_by)!
          : undefined,
      }));
    }

    return { data: filteredLogs, error: null };
  } catch (error) {
    console.error("Error fetching fee audit logs:", error);
    return { data: [], error: "Failed to fetch fee audit logs" };
  }
}

// Get total fee collection
export async function getTotalFeeCollection(): Promise<{ total: number; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("fee_payments")
      .select("amount");

    if (error) throw error;

    const total = data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
    return { total, error: null };
  } catch (error) {
    console.error("Error getting total fee collection:", error);
    return { total: 0, error: "Failed to get total fees" };
  }
}

// Get recent payments
export async function getRecentPayments(limit = 5): Promise<{ data: FeePayment[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("fee_payments")
      .select(`
        *,
        student:students(first_name, last_name)
      `)
      .order("payment_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error getting recent payments:", error);
    return { data: [], error: "Failed to get recent payments" };
  }
}
