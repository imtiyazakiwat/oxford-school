-- Migration: Fix record_fee_payment function overload conflict
-- Created: 2025-12-22
-- Issue: Two versions of the function existed causing PGRST203 error

-- Drop the older function version (without p_receipt_number parameter)
-- This resolves the ambiguity when calling the RPC
DROP FUNCTION IF EXISTS public.record_fee_payment(uuid, uuid, numeric, date, text);

-- The remaining function has signature:
-- record_fee_payment(p_fee_record_id uuid, p_student_id uuid, p_amount numeric, 
--                    p_payment_date date, p_notes text, p_receipt_number text)
