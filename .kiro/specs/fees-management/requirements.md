# Requirements Document

## Introduction

This document defines the requirements for a comprehensive Fees Management System for Sarvodaya College. The system enables administrators to manage student fee structures, record cash payments, track payment history, and generate financial reports. Students can view their fee status, payment history, and due dates through their dashboard. A critical feature is the complete audit trail of all fee-related modifications to ensure accountability and transparency.

## Glossary

- **Fee_Management_System**: The complete module handling all fee-related operations including structure definition, payment recording, and reporting
- **Fee_Structure**: A template defining fee types and amounts applicable to students based on class/category
- **Fee_Record**: An individual student's fee assignment including total fees, paid amount, due amount, and due date
- **Payment**: A single cash payment transaction recorded against a student's fee record
- **Payment_Receipt**: A generated document confirming a payment transaction with unique receipt number
- **Fee_Audit_Log**: An immutable record tracking all fee-related modifications with admin identity and timestamp
- **Admin**: An authenticated user with admin role who can manage fees and record payments
- **Student**: An authenticated user who can view their own fee information
- **Due_Date**: The deadline by which a fee payment should be made
- **Fee_Status**: The current state of a student's fees (Paid, Partial, Pending, Overdue)

## Requirements

### Requirement 1: Fee Structure Management

**User Story:** As an admin, I want to define and manage fee structures for different classes and categories, so that I can apply consistent fee templates to students.

#### Acceptance Criteria

1. WHEN an admin creates a fee structure, THE Fee_Management_System SHALL store the structure with name, applicable class, fee components (tuition, lab, library, sports, exam fees), and total amount
2. WHEN an admin updates a fee structure, THE Fee_Management_System SHALL update the structure and log the change in Fee_Audit_Log
3. WHEN an admin views fee structures, THE Fee_Management_System SHALL display all structures with their components and applicable classes
4. IF an admin attempts to delete a fee structure that is assigned to students, THEN THE Fee_Management_System SHALL prevent deletion and display an error message
5. WHEN a fee structure is created or modified, THE Fee_Management_System SHALL record the admin ID, timestamp, and changes in Fee_Audit_Log

### Requirement 2: Student Fee Assignment

**User Story:** As an admin, I want to assign fee structures to individual students, so that each student has a clear fee obligation.

#### Acceptance Criteria

1. WHEN an admin assigns a fee structure to a student, THE Fee_Management_System SHALL create a Fee_Record with total fees, zero paid amount, full due amount, and specified due date
2. WHEN an admin modifies a student's fee assignment, THE Fee_Management_System SHALL update the Fee_Record and log the modification with old and new values
3. WHEN viewing a student's profile, THE Fee_Management_System SHALL display their current fee status, total fees, paid amount, due amount, and due date
4. IF a student already has an active fee assignment for the academic year, THEN THE Fee_Management_System SHALL warn the admin before allowing a new assignment
5. WHEN a fee assignment is created or modified, THE Fee_Management_System SHALL record the admin ID, student ID, timestamp, and all changes in Fee_Audit_Log

### Requirement 3: Cash Payment Recording

**User Story:** As an admin, I want to record cash payments from students, so that I can track fee collections accurately.

#### Acceptance Criteria

1. WHEN an admin records a cash payment, THE Fee_Management_System SHALL create a Payment record with amount, payment date, payment method (cash), and optional notes
2. WHEN a payment is recorded, THE Fee_Management_System SHALL automatically update the student's Fee_Record (paid_fees increased, due_fees decreased)
3. WHEN a payment is recorded, THE Fee_Management_System SHALL generate a unique receipt number in format RCP-YYYY-NNNNNN
4. WHEN a payment brings due_fees to zero, THE Fee_Management_System SHALL update fee_status to "Paid"
5. WHEN a payment reduces but does not eliminate due_fees, THE Fee_Management_System SHALL update fee_status to "Partial"
6. IF an admin attempts to record a payment exceeding the due amount, THEN THE Fee_Management_System SHALL prevent the transaction and display an error
7. WHEN a payment is recorded, THE Fee_Management_System SHALL log the admin ID, student ID, amount, timestamp, and receipt number in Fee_Audit_Log

### Requirement 4: Payment History and Receipts

**User Story:** As an admin, I want to view payment history and generate receipts, so that I can provide documentation to students and maintain records.

#### Acceptance Criteria

1. WHEN an admin views a student's payment history, THE Fee_Management_System SHALL display all payments with date, amount, receipt number, and recording admin
2. WHEN an admin requests a receipt, THE Fee_Management_System SHALL display a printable receipt with student details, payment details, and receipt number
3. WHEN viewing payment history, THE Fee_Management_System SHALL allow filtering by date range and payment status
4. THE Fee_Management_System SHALL display payments in reverse chronological order (newest first)

### Requirement 5: Fee Audit Trail

**User Story:** As an admin, I want to view a complete audit trail of all fee modifications, so that I can ensure accountability and investigate discrepancies.

#### Acceptance Criteria

1. WHEN any fee-related data is created, updated, or deleted, THE Fee_Management_System SHALL record the action in Fee_Audit_Log with action type, old values, new values, admin ID, and timestamp
2. WHEN an admin views the audit log, THE Fee_Management_System SHALL display entries with admin name, action description, affected student, timestamp, and changed values
3. THE Fee_Management_System SHALL prevent any modification or deletion of Fee_Audit_Log entries
4. WHEN viewing audit logs, THE Fee_Management_System SHALL allow filtering by admin, student, date range, and action type
5. THE Fee_Audit_Log SHALL be accessible only to admin users

### Requirement 6: Admin Dashboard Statistics

**User Story:** As an admin, I want to see fee collection statistics on my dashboard, so that I can monitor financial health at a glance.

#### Acceptance Criteria

1. WHEN an admin views the fees dashboard, THE Fee_Management_System SHALL display total fees expected for current academic year
2. WHEN an admin views the fees dashboard, THE Fee_Management_System SHALL display total fees collected this month
3. WHEN an admin views the fees dashboard, THE Fee_Management_System SHALL display total outstanding dues
4. WHEN an admin views the fees dashboard, THE Fee_Management_System SHALL display count of students with overdue fees
5. WHEN an admin views the fees dashboard, THE Fee_Management_System SHALL display collection trend chart for last 6 months
6. WHEN an admin views the fees dashboard, THE Fee_Management_System SHALL display list of recent payments (last 10)
7. WHEN an admin views the fees dashboard, THE Fee_Management_System SHALL display list of students with highest outstanding dues

### Requirement 7: Student Fee View

**User Story:** As a student, I want to view my fee status and payment history, so that I can track my financial obligations.

#### Acceptance Criteria

1. WHEN a student views their fees module, THE Fee_Management_System SHALL display their total fees, paid amount, due amount, and due date
2. WHEN a student views their fees module, THE Fee_Management_System SHALL display fee breakdown by component (tuition, lab, library, etc.)
3. WHEN a student views their fees module, THE Fee_Management_System SHALL display their payment history with dates, amounts, and receipt numbers
4. WHEN a student views their fees module, THE Fee_Management_System SHALL display their current fee status (Paid, Partial, Pending, Overdue)
5. IF a student's due date has passed and fees are unpaid, THEN THE Fee_Management_System SHALL display the status as "Overdue" with visual emphasis
6. THE Fee_Management_System SHALL only allow students to view their own fee information

### Requirement 8: Fee Reports

**User Story:** As an admin, I want to generate fee reports, so that I can analyze collections and identify defaulters.

#### Acceptance Criteria

1. WHEN an admin generates a collection report, THE Fee_Management_System SHALL display total collections grouped by date, class, or payment method
2. WHEN an admin generates a defaulters report, THE Fee_Management_System SHALL display students with overdue fees sorted by due amount
3. WHEN an admin generates a class-wise report, THE Fee_Management_System SHALL display fee statistics grouped by class
4. WHEN generating reports, THE Fee_Management_System SHALL allow filtering by date range, class, and fee status
5. WHEN an admin exports a report, THE Fee_Management_System SHALL generate a downloadable format (CSV)

### Requirement 9: Due Date Management

**User Story:** As an admin, I want to set and manage fee due dates, so that students know their payment deadlines.

#### Acceptance Criteria

1. WHEN an admin sets a due date for a student's fees, THE Fee_Management_System SHALL store the due date in the Fee_Record
2. WHEN the current date exceeds a student's due date and fees are unpaid, THE Fee_Management_System SHALL automatically update fee_status to "Overdue"
3. WHEN an admin modifies a due date, THE Fee_Management_System SHALL log the change with old and new dates in Fee_Audit_Log
4. WHEN viewing students list, THE Fee_Management_System SHALL highlight students with overdue fees

### Requirement 10: Data Validation and Security

**User Story:** As a system administrator, I want the fee system to validate all inputs and enforce security, so that data integrity is maintained.

#### Acceptance Criteria

1. WHEN any fee amount is entered, THE Fee_Management_System SHALL validate it is a positive number
2. WHEN a payment is recorded, THE Fee_Management_System SHALL validate the amount does not exceed the due amount
3. THE Fee_Management_System SHALL enforce that only authenticated admin users can create, update, or delete fee data
4. THE Fee_Management_System SHALL enforce that students can only read their own fee data
5. THE Fee_Management_System SHALL prevent any direct modification of audit log entries through RLS policies
6. WHEN storing fee amounts, THE Fee_Management_System SHALL use numeric types to prevent calculation errors
