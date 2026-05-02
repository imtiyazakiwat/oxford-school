# Pre-Production Security Audit: Fees Management System
**Prepared by:** Principal Security Engineer (25+ Years Experience)
**Status:** DRAFT (FOR IMMEDIATE REMEDIATION)
**Date:** 2025-12-22

---

## 1. System Scorecard (Total: 48/100)

| Category | Score | Justification |
| :--- | :--- | :--- |
| **Authentication & Sessions** | 12/20 | Proper OTP flow and session timeouts are present. However, administrative API routes lack server-side session/role verification, relying dangerously on the client. |
| **Authorization & RLS** | 10/25 | RLS is enabled on fee tables. However, critical identity spoofing is possible in `fee_payments` due to `recorded_by = auth.uid()` which allows any authenticated user (including students) to forge their own payment records if they bypass the UI. |
| **SQL Injection & Data Safety** | 12/15 | Usage of Supabase Client (PostgREST) provides inherent protection against basic SQLi. Input sanitization is used, but missing for several critical numeric inputs. |
| **XSS & Frontend Security** | 12/15 | No `dangerouslySetInnerHTML` found. Sanitization logic exists for strings. |
| **Abuse & Financial Integrity** | 2/15 | The core financial logic (updating balances) is handled in the client file `fees.ts`. A compromise of the browser session allows any user to manually update their `paid_fees` and `due_fees` without actual payment. |
| **Logging & Monitoring** | 0/10 | No evidence of server-side tamper-proof logging or immutable history for the most critical actions like fee structure changes. |

**Final Verdict:** 🚩 **NOT SAFE FOR PRODUCTION**.
Critical vulnerabilities in financial integrity and administrative API authorization must be remediated immediately.

---

## 2. Findings & Severity Ranking

### [CRITICAL] C-01: Financial Integrity Bypass via Client-Side Logic
- **Location:** `sarvodaya-college/src/supabase/fees.ts` (Client functions)
- **Scenario:** The application calculates `paid_fees` and `due_fees` on the client and pushes them to the database. An attacker can intercept the network request or use the console to send a `supabase.from('fee_records').update({ paid_fees: 100000 })` call.
- **Impact:** Total loss of financial integrity. Students can mark their fees as "Paid" without providing actual currency.

### [CRITICAL] C-02: Missing Authorization on Administrative APIs
- **Location:** `/api/admin/create-student-user/route.ts`, `/api/admin/reset-student-password/route.ts`
- **Scenario:** These routes use an `adminClient` (service role) but **do not verify** if the requesting user has an 'admin' role. Any student with the API endpoint URL can create new admin accounts or reset other users' passwords.
- **Impact:** Complete system takeover (Privilege Escalation).

### [HIGH] H-01: IDOR & Identity Spoofing in Fee Payments
- **Location:** `fee_payments` table RLS Policy: `Admins can insert payments`
- **Scenario:** The policy check `recorded_by = auth.uid()` only verifies that the user is authenticated. It does not verify that the user is an **Admin**. A student could POST to `fee_payments` and credit their own account.
- **Impact:** Unauthorized credit of payments.

### [HIGH] H-02: Lack of Atomic Transactions for Payments
- **Location:** `recordPayment` function in `fees.ts`
- **Scenario:** Payment recording and balance updating are separate operations (or handled via non-atomic client-side calls). If one fails, the database is left in an inconsistent state.
- **Impact:** Inconsistent financial records.

---

## 3. Remediation Plan

### IMMEDIATE FIXES (Required before Launch)

#### 1. Secure Admin APIs
Create a server-side role check utility and apply it to all `/api/admin/*` routes.

```typescript
// Add to src/utils/auth.ts
export async function verifyAdmin(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const { data: role } = await supabase.rpc("get_user_role", { user_uuid: user.id });
  if (role !== 'admin') throw new Error("Forbidden");
}
```

#### 2. Move Financial Logic to Database Functions (RPC)
The database must be the source of truth for calculations.

```sql
-- Move logic to a Postgres Function
CREATE OR REPLACE FUNCTION record_fee_payment(
  p_fee_record_id UUID,
  p_amount NUMERIC,
  p_notes TEXT
) RETURNS VOID AS $$
BEGIN
  -- 1. Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- 2. Update fee record (Atomic)
  UPDATE fee_records 
  SET paid_fees = paid_fees + p_amount,
      due_fees = total_fees - (paid_fees + p_amount),
      fee_status = CASE ... END
  WHERE id = p_fee_record_id;

  -- 3. Record payment
  INSERT INTO fee_payments (fee_record_id, amount, notes, recorded_by)
  VALUES (p_fee_record_id, p_amount, p_notes, auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 3. Harden RLS Policies
Restrict `INSERT` on `fee_payments` and `UPDATE` on `fee_records` strictly to users with the 'admin' role.

```sql
ALTER POLICY "Admins can insert payments" ON fee_payments 
WITH CHECK (is_admin(auth.uid()));
```

### SHORT-TERM IMPROVEMENTS
- **Audit Logs:** Implement a trigger-based audit log that captures the `OLD` and `NEW` JSON state for every change in `fee_records`.
- **Encryption:** Ensure PII (Aadhar, phone numbers) are encrypted at rest (if not already handled by Supabase Vault).

### LONG-TERM HARDENING
- **Immutable Receipts:** Move receipt generation to a separate microservice or dedicated DB trigger to prevent receipt number collision/forging.
- **Rate Limiting:** Transition the in-memory rate limiter to Redis to prevent bypass via serverless instance restarts.
