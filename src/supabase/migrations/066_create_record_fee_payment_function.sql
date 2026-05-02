-- Migration: Create record_fee_payment RPC function for atomic payment processing
-- Created: December 2024
-- Purpose: Secure, atomic payment recording with validation and audit trail

-- =============================================================================
-- FUNCTION PURPOSE
-- =============================================================================
-- Provides atomic payment recording that:
-- 1. Validates admin authorization
-- 2. Validates payment amount against due fees
-- 3. Creates payment record with unique receipt number
-- 4. Updates fee_record with new paid/due amounts
-- 5. Updates fee status automatically
-- All within a single transaction for data integrity

-- =============================================================================
-- THREAT MODEL
-- =============================================================================
-- Risks mitigated:
-- 1. Race conditions: Uses FOR UPDATE lock on fee_record
-- 2. Unauthorized access: Checks is_admin() before processing
-- 3. Invalid amounts: Validates positive and <= due_fees
-- 4. Data inconsistency: Single transaction ensures atomicity
-- 5. Receipt forgery: Server-generated unique receipt numbers

-- =============================================================================
-- FUNCTION DEFINITION
-- =============================================================================
CREATE OR REPLACE FUNCTION public.record_fee_payment(
  p_fee_record_id UUID,
  p_student_id UUID,
  p_amount NUMERIC(10,2),
  p_payment_date DATE DEFAULT CURRENT_DATE,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fee_record fee_records%ROWTYPE;
  v_new_paid NUMERIC(10,2);
  v_new_due NUMERIC(10,2);
  v_new_status TEXT;
  v_receipt_number TEXT;
  v_payment_id UUID;
  v_user_id UUID;
  v_today DATE;
BEGIN
  -- Get current authenticated user
  v_user_id := auth.uid();
  
  -- Security check: Verify admin authorization
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Authentication required'
    );
  END IF;
  
  IF NOT is_admin(v_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: Admin access required'
    );
  END IF;
  
  -- Validate amount is positive
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Payment amount must be greater than zero'
    );
  END IF;
  
  -- Lock and fetch fee record to prevent race conditions
  SELECT * INTO v_fee_record
  FROM fee_records
  WHERE id = p_fee_record_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Fee record not found'
    );
  END IF;
  
  -- Validate student_id matches the fee record
  IF v_fee_record.student_id != p_student_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Student ID does not match fee record'
    );
  END IF;
  
  -- Validate amount doesn't exceed due fees
  IF p_amount > v_fee_record.due_fees THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format('Payment amount (%.2f) exceeds due fees (%.2f)', p_amount, v_fee_record.due_fees)
    );
  END IF;
  
  -- Calculate new values
  v_new_paid := v_fee_record.paid_fees + p_amount;
  v_new_due := v_fee_record.total_fees - v_new_paid;
  
  -- Determine new status based on payment
  v_today := CURRENT_DATE;
  IF v_new_due <= 0 THEN
    v_new_status := 'Paid';
  ELSIF v_new_paid > 0 THEN
    -- Check if overdue
    IF v_fee_record.due_date < v_today AND v_new_due > 0 THEN
      v_new_status := 'Overdue';
    ELSE
      v_new_status := 'Partial';
    END IF;
  ELSE
    v_new_status := v_fee_record.fee_status;
  END IF;
  
  -- Generate unique receipt number: RCP-YYYY-NNNNNN
  -- Uses timestamp + random for uniqueness
  v_receipt_number := 'RCP-' || 
    EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-' ||
    LPAD(
      ((EXTRACT(EPOCH FROM clock_timestamp())::BIGINT * 1000 + FLOOR(RANDOM() * 1000)::BIGINT) % 1000000)::TEXT,
      6, '0'
    );
  
  -- Insert payment record
  INSERT INTO fee_payments (
    fee_record_id,
    student_id,
    amount,
    payment_date,
    payment_method,
    receipt_number,
    notes,
    recorded_by
  ) VALUES (
    p_fee_record_id,
    p_student_id,
    p_amount,
    COALESCE(p_payment_date, CURRENT_DATE),
    'cash',
    v_receipt_number,
    p_notes,
    v_user_id
  ) RETURNING id INTO v_payment_id;
  
  -- Update fee record with new amounts and status
  UPDATE fee_records
  SET 
    paid_fees = v_new_paid,
    due_fees = v_new_due,
    fee_status = v_new_status,
    updated_at = NOW()
  WHERE id = p_fee_record_id;
  
  -- Return success with payment details
  RETURN jsonb_build_object(
    'success', true,
    'payment_id', v_payment_id,
    'receipt_number', v_receipt_number,
    'new_paid_fees', v_new_paid,
    'new_due_fees', v_new_due,
    'new_status', v_new_status
  );
  
EXCEPTION
  WHEN unique_violation THEN
    -- Handle rare case of receipt number collision
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Receipt number collision. Please retry.'
    );
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'An unexpected error occurred: ' || SQLERRM
    );
END;
$$;

-- =============================================================================
-- SECURE FUNCTION PERMISSIONS
-- =============================================================================
-- Revoke from public roles (security best practice)
REVOKE EXECUTE ON FUNCTION public.record_fee_payment(UUID, UUID, NUMERIC, DATE, TEXT) FROM public;
REVOKE EXECUTE ON FUNCTION public.record_fee_payment(UUID, UUID, NUMERIC, DATE, TEXT) FROM anon;

-- Grant only to authenticated (RLS + function checks handle authorization)
GRANT EXECUTE ON FUNCTION public.record_fee_payment(UUID, UUID, NUMERIC, DATE, TEXT) TO authenticated;

-- Service role needs access for any backend operations
GRANT EXECUTE ON FUNCTION public.record_fee_payment(UUID, UUID, NUMERIC, DATE, TEXT) TO service_role;

-- =============================================================================
-- SECURITY NOTES
-- =============================================================================
-- 1. SECURITY DEFINER: Function runs with owner privileges to bypass RLS for atomic updates
-- 2. SET search_path: Prevents search_path manipulation attacks
-- 3. Admin check: Explicit is_admin() verification before any operations
-- 4. FOR UPDATE lock: Prevents race conditions on concurrent payments
-- 5. Input validation: All inputs validated before processing
-- 6. Atomic transaction: All changes succeed or fail together
-- 7. Audit trail: Triggers on fee_payments and fee_records capture all changes
