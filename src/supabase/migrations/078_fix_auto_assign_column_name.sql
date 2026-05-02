-- Migration: Fix column name in auto-assign functions (status -> fee_status)

-- Fix auto-assign function
CREATE OR REPLACE FUNCTION auto_assign_student_fee()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_fee_structure_id UUID;
    v_total_amount NUMERIC;
    v_academic_year TEXT;
BEGIN
    -- Find matching fee structure for student's class and academic year
    SELECT id, total_amount, academic_year 
    INTO v_fee_structure_id, v_total_amount, v_academic_year
    FROM fee_structures
    WHERE class = NEW.class 
      AND academic_year = NEW.academic_year
      AND is_active = true
    LIMIT 1;
    
    -- If a matching fee structure exists, create fee record
    IF v_fee_structure_id IS NOT NULL THEN
        INSERT INTO fee_records (
            student_id, 
            fee_structure_id, 
            academic_year, 
            total_fees, 
            paid_fees, 
            due_fees,
            fee_status
        ) VALUES (
            NEW.id,
            v_fee_structure_id,
            v_academic_year,
            v_total_amount,
            0,
            v_total_amount,
            'Pending'
        )
        ON CONFLICT (student_id, academic_year) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Fix bulk-assign function
CREATE OR REPLACE FUNCTION bulk_assign_fees_to_existing_students(p_academic_year TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_count INTEGER := 0;
BEGIN
    -- Insert fee records for students who don't have one yet
    INSERT INTO fee_records (student_id, fee_structure_id, academic_year, total_fees, paid_fees, due_fees, fee_status)
    SELECT 
        s.id,
        fs.id,
        fs.academic_year,
        fs.total_amount,
        0,
        fs.total_amount,
        'Pending'
    FROM students s
    JOIN fee_structures fs ON fs.class = s.class AND fs.academic_year = s.academic_year AND fs.is_active = true
    WHERE s.academic_year = p_academic_year
    AND NOT EXISTS (
        SELECT 1 FROM fee_records fr 
        WHERE fr.student_id = s.id AND fr.academic_year = p_academic_year
    )
    ON CONFLICT (student_id, academic_year) DO NOTHING;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;
