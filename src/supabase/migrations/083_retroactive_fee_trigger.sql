-- Function to retroactively assign fees to existing students when a new fee structure is created
CREATE OR REPLACE FUNCTION public.retroactive_fee_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_due_date DATE;
BEGIN
    -- Calculate due date: March 31st of the ending year, or 30 days from now
    IF NEW.academic_year IS NOT NULL THEN
        BEGIN
            v_due_date := (split_part(NEW.academic_year, '-', 2) || '-03-31')::DATE;
        EXCEPTION WHEN OTHERS THEN
            v_due_date := (CURRENT_DATE + INTERVAL '30 days')::DATE;
        END;
    END IF;

    -- Insert fee records for all active students in the class who don't have a record yet
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
        other_fee,
        due_date,
        created_by
    )
    SELECT 
        s.id,
        NEW.id,
        NEW.academic_year,
        NEW.total_fee,
        0,
        NEW.total_fee,
        'Pending',
        NEW.tuition_fee,
        NEW.lab_fee,
        NEW.library_fee,
        NEW.sports_fee,
        NEW.exam_fee,
        NEW.other_fee,
        v_due_date,
        NEW.created_by
    FROM students s
    WHERE s.class = NEW.applicable_class
      AND s.status = 'active'
      AND NOT EXISTS (
          SELECT 1 FROM fee_records fr 
          WHERE fr.student_id = s.id 
          AND fr.academic_year = NEW.academic_year
      );

    RETURN NEW;
END;
$function$;

-- Trigger to run after a new fee structure is created
DROP TRIGGER IF EXISTS on_fee_structure_created ON fee_structures;
CREATE TRIGGER on_fee_structure_created
    AFTER INSERT ON fee_structures
    FOR EACH ROW
    EXECUTE FUNCTION public.retroactive_fee_assignment();
