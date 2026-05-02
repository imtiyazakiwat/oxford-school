# Implementation Plan: Fees Management System

## Overview

This implementation plan breaks down the Fees Management System into discrete, incremental tasks. Each task builds on previous work, ensuring no orphaned code. The implementation uses TypeScript with Next.js and Supabase, following existing patterns in the codebase.

## Tasks

- [x] 1. Create database schema and migrations
  - [x] 1.1 Create fee_structures table migration
    - Create migration file `061_create_fee_structures_table.sql`
    - Define table with all fee component columns (tuition, lab, library, sports, exam, other)
    - Use NUMERIC(10,2) for monetary values
    - Enable RLS and create admin-only policies
    - Add indexes for academic_year and applicable_class
    - _Requirements: 1.1, 10.3, 10.6_

  - [x] 1.2 Create fee_records table migration
    - Create migration file `062_create_fee_records_table.sql`
    - Define table with foreign keys to students and fee_structures
    - Add fee_status CHECK constraint for valid statuses
    - Enable RLS with admin manage and student view-own policies
    - Add indexes for student_id, academic_year, fee_status
    - _Requirements: 2.1, 7.6, 10.3, 10.4_

  - [x] 1.3 Create fee_payments table migration
    - Create migration file `063_create_fee_payments_table.sql`
    - Define table with foreign keys to fee_records and students
    - Add CHECK constraint for positive amounts
    - Add UNIQUE constraint on receipt_number
    - Enable RLS with admin manage and student view-own policies
    - _Requirements: 3.1, 3.3, 10.1, 10.3_

  - [x] 1.4 Create fee_audit_log table and triggers migration
    - Create migration file `064_create_fee_audit_log.sql`
    - Define immutable audit log table
    - Create audit trigger function with SECURITY DEFINER
    - Attach triggers to fee_structures, fee_records, fee_payments
    - Create RLS policies: admin read-only, block all modifications
    - _Requirements: 5.1, 5.3, 5.5, 10.5_

- [x] 2. Checkpoint - Verify database migrations
  - Apply migrations to Supabase
  - Verify tables created with correct structure
  - Test RLS policies manually
  - Ensure all tests pass, ask the user if questions arise

- [x] 3. Implement fees service layer
  - [x] 3.1 Create fees.ts service file with TypeScript interfaces
    - Create `sarvodaya-college/src/supabase/fees.ts`
    - Define FeeStructure, FeeRecord, FeePayment, FeeAuditLog interfaces
    - Define FeeStatistics interface for dashboard
    - Add cache constants and helper functions
    - _Requirements: 1.1, 2.1, 3.1, 5.1_

  - [x] 3.2 Implement fee structure CRUD operations
    - Implement createFeeStructure with validation
    - Implement updateFeeStructure
    - Implement deleteFeeStructure with assignment check
    - Implement getFeeStructures with filters
    - Implement getFeeStructureById
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 3.3 Write property test for fee structure deletion protection
    - **Property 11: Fee Structure Deletion Protection**
    - Test that deletion fails when fee_records reference the structure
    - **Validates: Requirements 1.4**

  - [x] 3.4 Implement fee record operations
    - Implement assignFeeToStudent with initial values (paid=0, due=total)
    - Implement updateFeeRecord
    - Implement getFeeRecordByStudent
    - Implement getFeeRecords with filters
    - Implement getOverdueRecords
    - _Requirements: 2.1, 2.2, 2.3, 9.1_

  - [x] 3.5 Write property test for fee record initialization
    - **Property 1: Fee Record Initialization Invariant**
    - Test that new fee records have paid_fees=0 and due_fees=total_fees
    - **Validates: Requirements 2.1**

  - [x] 3.6 Implement payment operations
    - Implement generateReceiptNumber function
    - Implement recordPayment with validation (amount <= due_fees)
    - Implement automatic fee_record update (paid_fees, due_fees, status)
    - Implement getPaymentsByStudent with ordering
    - Implement getPaymentsByDateRange
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.4_

  - [x] 3.7 Write property tests for payment operations
    - **Property 2: Payment Amount Invariant**
    - **Property 3: Fee Status Calculation**
    - **Property 4: Payment Validation**
    - **Property 5: Receipt Number Format**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6**

  - [x] 3.8 Implement fee status calculation
    - Implement calculateFeeStatus function
    - Handle Paid, Partial, Pending, Overdue states
    - Implement updateOverdueStatuses for batch updates
    - _Requirements: 3.4, 3.5, 7.5, 9.2_

  - [x] 3.9 Write property test for fee status calculation
    - **Property 3: Fee Status Calculation**
    - Test all status transitions based on paid_fees and due_date
    - **Validates: Requirements 3.4, 3.5, 7.5, 9.2**

  - [x] 3.10 Implement statistics and reporting functions
    - Implement getFeeStatistics for dashboard
    - Implement getCollectionReport
    - Implement getDefaultersReport
    - Implement getClassWiseReport
    - Implement exportReportToCSV
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 3.11 Implement audit log retrieval
    - Implement getFeeAuditLogs with filters
    - Join with users table to get admin names
    - _Requirements: 5.2, 5.4_

- [x] 4. Checkpoint - Verify service layer
  - Run all unit tests
  - Run all property tests
  - Verify CRUD operations work correctly
  - Ensure all tests pass, ask the user if questions arise

- [x] 5. Implement admin fees module UI
  - [x] 5.1 Create admin FeesModule component structure
    - Update `sarvodaya-college/src/components/admin/modules/FeesModule.tsx`
    - Add tab navigation: Overview, Fee Structures, Student Fees, Payments, Audit Log
    - Import fees service functions
    - Set up state management for each tab
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 5.2 Implement fees dashboard overview tab
    - Display total fees expected, collected this month, outstanding
    - Display overdue student count
    - Display recent payments list (last 10)
    - Display top defaulters list
    - Add collection trend chart (last 6 months)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [x] 5.3 Implement fee structures management tab
    - Display list of fee structures with components
    - Add create fee structure form/modal
    - Add edit fee structure functionality
    - Add delete with confirmation (check for assignments)
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 5.4 Implement student fees management tab
    - Display students list with fee status
    - Add search and filter by class, status
    - Highlight overdue students
    - Add assign fee structure modal
    - Add edit fee assignment modal
    - Display fee breakdown for selected student
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 9.4_

  - [x] 5.5 Implement payment recording tab
    - Add record payment form with student search
    - Display payment amount validation
    - Show receipt preview after recording
    - Display payment history with filters
    - Add print receipt functionality
    - _Requirements: 3.1, 3.2, 3.3, 3.6, 4.1, 4.2, 4.3_

  - [x] 5.6 Implement audit log viewer tab
    - Display audit log entries with filters
    - Show admin name, action, timestamp, changes
    - Add filter by admin, student, date range, action type
    - _Requirements: 5.2, 5.4_

  - [x] 5.7 Implement reports tab
    - Add collection report with date range filter
    - Add defaulters report
    - Add class-wise report
    - Add CSV export functionality
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 6. Checkpoint - Verify admin module
  - Test all admin UI functionality manually
  - Verify fee structure CRUD works
  - Verify payment recording works
  - Verify audit log displays correctly
  - Ensure all tests pass, ask the user if questions arise

- [ ] 7. Implement student fees module UI
  - [ ] 7.1 Update student FeesModule component
    - Update `sarvodaya-college/src/components/student/modules/FeesModule.tsx`
    - Fetch fee record for logged-in student
    - Display fee summary (total, paid, due, due date)
    - Display fee breakdown by component
    - Display fee status with visual emphasis for overdue
    - _Requirements: 7.1, 7.2, 7.4, 7.5_

  - [ ] 7.2 Implement student payment history view
    - Display payment history with dates, amounts, receipt numbers
    - Order by date descending (newest first)
    - _Requirements: 7.3, 4.4_

- [ ] 8. Checkpoint - Verify student module
  - Test student fee view with different statuses
  - Verify student can only see own data
  - Verify payment history displays correctly
  - Ensure all tests pass, ask the user if questions arise

- [ ] 9. Security and RLS verification
  - [ ] 9.1 Write property tests for RLS policies
    - **Property 7: Audit Log Immutability**
    - **Property 8: Student Data Isolation**
    - **Property 9: Admin-Only Write Access**
    - **Validates: Requirements 5.3, 7.6, 10.3, 10.4, 10.5**

  - [ ] 9.2 Run security advisor checks
    - Run Supabase security advisors
    - Verify no missing RLS policies
    - Verify no excessive permissions
    - _Requirements: 10.3, 10.4, 10.5_

- [ ] 10. Final checkpoint
  - Run all tests (unit + property)
  - Verify complete flow: create structure → assign to student → record payment → view audit log
  - Verify student can view their fees
  - Ensure all tests pass, ask the user if questions arise

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Follow existing code patterns in the codebase (see `achievers.ts`, `gallery.ts` for service patterns)
- Use the project's color scheme: primary `#c41e3a`, secondary `#f7c52d`
