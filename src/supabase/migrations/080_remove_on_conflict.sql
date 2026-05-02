-- Migration: Remove ON CONFLICT clause from auto-assign functions
-- Rely on explicit checks instead

-- Fix auto-assign function
CREATE OR REPLACE FUNCTION auto_assign_student_fee()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_fee_structure_id UUID;
    v_total_fee NUMERIC;
    v_tuition_fee NUMERIC;
    v_lab_fee NUMERIC;
    v_library_fee NUMERIC;
    v_sports_fee NUMERIC;
    v_exam_fee NUMERIC;
    v_other_fee NUMERIC;
    v_academic_year TEXT;
    v_exists BOOLEAN;
BEGIN
    -- Check if record already exists
    SELECT EXISTS (
        SELECT 1 FROM fee_records 
        WHERE student_id = NEW.id AND academic_year = NEW.academic_year
    ) INTO v_exists;
    
    IF v_exists THEN
        RETURN NEW;
    END IF;

    -- Find matching fee structure for student's class and academic year
    SELECT id, total_fee, tuition_fee, lab_fee, library_fee, sports_fee, exam_fee, other_fee, academic_year 
    INTO v_fee_structure_id, v_total_fee, v_tuition_fee, v_lab_fee, v_library_fee, v_sports_fee, v_exam_fee, v_other_fee, v_academic_year
    FROM fee_structures
    WHERE applicable_class = NEW.class 
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
            fee_status,
            tuition_fee,
            lab_fee,
            library_fee,
            sports_fee,
            exam_fee,
            other_fee
        ) VALUES (
            NEW.id,
            v_fee_structure_id,
            v_academic_year,
            v_total_fee,
            0,
            v_total_fee,
            'Pending',
            v_tuition_fee,
            v_lab_fee,
            v_library_fee,
            v_sports_fee,
            v_exam_fee,
            v_other_fee
        );
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
    INSERT INTO fee_records (
        student_id, 
        fee_structure_id, 
        academic_year, 
        total_fees, 
        paid_fees, 
        due_fees, 
        fee_status,
        tuition_fee,
        lab_fee,
        library_fee,
        sports_fee,
        exam_fee,
        other_fee
    )
    SELECT 
        s.id,
        fs.id,
        fs.academic_year,
        fs.total_fee,
        0,
        fs.total_fee,
        'Pending',
        fs.tuition_fee,
        fs.lab_fee,
        fs.library_fee,
        fs.sports_fee,
        fs.exam_fee,
        fs.other_fee
    FROM students s
    JOIN fee_structures fs ON fs.applicable_class = s.class AND fs.academic_year = s.academic_year AND fs.is_active = true
    WHERE s.academic_year = p_academic_year
    AND NOT EXISTS (
        SELECT 1 FROM fee_records fr 
        WHERE fr.student_id = s.id AND fr.academic_year = p_academic_year
    );
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;
