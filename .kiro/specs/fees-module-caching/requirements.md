# Requirements Document

## Introduction

This feature implements in-memory caching and state persistence for the Fees Management module to prevent unnecessary data reloading when switching between sub-tabs (Overview, Fee Structures, Student Fees, Payments, Audit Log, Reports). Currently, each tab switch causes a complete component remount, triggering redundant API calls and poor user experience.

## Glossary

- **Fees_Module**: The parent component managing all fees-related sub-tabs
- **Tab_Component**: Individual tab components (FeesOverviewTab, FeeStructuresTab, etc.)
- **Fees_Context**: React Context providing shared state and caching for fees data
- **Cache_Entry**: A cached data item with timestamp for TTL validation
- **TTL**: Time-To-Live - duration before cached data is considered stale

## Requirements

### Requirement 1: Fees Context Provider

**User Story:** As an admin, I want the fees module to remember data I've already loaded, so that switching between tabs is instant and doesn't show loading spinners repeatedly.

#### Acceptance Criteria

1. THE Fees_Context SHALL provide shared state for fee structures, fee records, payments, statistics, and audit logs
2. THE Fees_Context SHALL maintain the current academic year selection across all tabs
3. THE Fees_Context SHALL maintain the current user ID across all tabs without re-fetching
4. WHEN a Tab_Component mounts, THE Fees_Context SHALL provide cached data if available and not stale
5. WHEN cached data is stale (older than TTL), THE Fees_Context SHALL trigger a background refresh

### Requirement 2: Cache Management

**User Story:** As an admin, I want cached data to automatically refresh when I make changes, so that I always see accurate information.

#### Acceptance Criteria

1. THE Fees_Context SHALL use a 5-minute TTL for fee structures and statistics
2. THE Fees_Context SHALL use a 2-minute TTL for fee records and payments (more volatile data)
3. WHEN a create, update, or delete operation succeeds, THE Fees_Context SHALL invalidate relevant cache entries
4. THE Fees_Context SHALL provide a manual refresh function for each data type
5. WHEN the academic year changes, THE Fees_Context SHALL invalidate all cached data for the previous year

### Requirement 3: Loading State Management

**User Story:** As an admin, I want to see loading indicators only when data is actually being fetched, so that the UI feels responsive.

#### Acceptance Criteria

1. WHEN cached data exists and is not stale, THE Tab_Component SHALL display data immediately without loading state
2. WHEN cached data exists but is stale, THE Tab_Component SHALL display cached data while fetching fresh data in background
3. WHEN no cached data exists, THE Tab_Component SHALL show a loading indicator
4. IF a background refresh fails, THEN THE Fees_Context SHALL retain the existing cached data and log the error

### Requirement 4: Tab State Persistence

**User Story:** As an admin, I want my filter selections and scroll positions to be remembered when I switch tabs, so that I don't lose my place.

#### Acceptance Criteria

1. THE Fees_Context SHALL persist filter selections (class filter, status filter, date range) for each tab
2. WHEN returning to a previously visited tab, THE Tab_Component SHALL restore the previous filter state
3. THE Fees_Context SHALL NOT persist form data for create/edit modals (security consideration)

### Requirement 5: Architecture Refactoring

**User Story:** As a developer, I want the fees module to use a single persistent component instance, so that React state is preserved across tab switches.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL render a single Fees_Module instance that handles internal tab switching
2. THE Fees_Module SHALL use internal state to track the active tab instead of being remounted
3. WHEN the active fees sub-tab changes in Admin_Dashboard, THE Fees_Module SHALL receive the new tab as a prop without remounting
4. THE Fees_Module SHALL render all Tab_Components but only display the active one (CSS-based hiding or conditional rendering with state preservation)
