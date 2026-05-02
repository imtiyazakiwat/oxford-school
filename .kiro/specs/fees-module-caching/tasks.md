# Implementation Plan: Fees Module Caching

## Overview

This implementation plan refactors the Fees Management module to use React Context for shared state and TTL-based caching, preventing unnecessary data reloading when switching between sub-tabs.

## Tasks

- [x] 1. Create FeesContext and Provider
  - [x] 1.1 Create FeesContext with types and interfaces
    - Create `sarvodaya-college/src/context/FeesContext.tsx`
    - Define CacheEntry, FilterState, and FeesContextValue interfaces
    - Define TTL constants for each data type
    - Implement cache validation helper function
    - _Requirements: 1.1, 2.1, 2.2_

  - [x] 1.2 Implement FeesContextProvider with state management
    - Implement useState for all cache entries and filter states
    - Implement userId fetching on mount (single fetch)
    - Implement academicYear state with setter
    - _Requirements: 1.2, 1.3_

  - [x] 1.3 Implement cached data fetching functions
    - Implement getFeeStructures with cache check and background refresh
    - Implement getFeeRecords with cache check and background refresh
    - Implement getPayments with cache check and background refresh
    - Implement getStatistics with cache check and background refresh
    - Implement getAuditLogs with cache check and background refresh
    - _Requirements: 1.4, 1.5, 3.1, 3.2, 3.3_

  - [x] 1.4 Implement cache invalidation functions
    - Implement individual invalidation functions for each data type
    - Implement invalidateAll function
    - Implement automatic invalidation on academic year change
    - _Requirements: 2.3, 2.5_

  - [x] 1.5 Write property test for cache validation
    - **Property 1: Cache Serves Valid Data Immediately**
    - **Validates: Requirements 1.4, 3.1**

  - [x] 1.6 Write property test for academic year invalidation
    - **Property 2: Academic Year Change Invalidates Cache**
    - **Validates: Requirements 1.2, 2.5**

- [x] 2. Checkpoint - Ensure context implementation is complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Refactor FeesModule for internal tab management
  - [x] 3.1 Update FeesModule to use internal tab state
    - Add activeTab state to FeesModule
    - Accept activeTab as prop from AdminDashboard
    - Use useEffect to sync prop to internal state
    - Render tab navigation within FeesModule
    - _Requirements: 5.1, 5.2_

  - [x] 3.2 Implement tab content rendering with state preservation
    - Render all tab components but hide inactive ones with CSS
    - Or use conditional rendering with key preservation
    - Ensure tab components don't remount on switch
    - _Requirements: 5.3, 5.4_

  - [x] 3.3 Write property test for component persistence
    - **Property 7: Component Persistence Across Tab Switches**
    - **Validates: Requirements 5.2, 5.3**

- [x] 4. Update AdminDashboard integration
  - [x] 4.1 Wrap FeesModule with FeesContextProvider
    - Import FeesContextProvider in AdminDashboard
    - Wrap FeesModule rendering with provider
    - Pass activeTab prop instead of using defaultTab
    - _Requirements: 5.1_

  - [x] 4.2 Update fees sub-tab navigation
    - Change from rendering multiple FeesModule instances to single instance
    - Pass active tab as prop to FeesModule
    - Remove redundant FeesModule renders
    - _Requirements: 5.1, 5.3_

- [ ] 5. Checkpoint - Ensure architecture refactoring is complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Update Tab Components to use FeesContext
  - [ ] 6.1 Update FeeStructuresTab to use context
    - Import and use useFeesContext hook
    - Replace local data fetching with context methods
    - Use cached data for initial render
    - Call invalidateFeeStructures after mutations
    - _Requirements: 1.4, 2.3, 3.1_

  - [ ] 6.2 Update FeesOverviewTab to use context
    - Import and use useFeesContext hook
    - Replace local statistics fetching with context method
    - Use cached statistics for initial render
    - _Requirements: 1.4, 3.1_

  - [ ] 6.3 Update StudentFeesTab to use context
    - Import and use useFeesContext hook
    - Replace local data fetching with context methods
    - Use cached fee records for initial render
    - Call invalidateFeeRecords after mutations
    - _Requirements: 1.4, 2.3, 3.1_

  - [ ] 6.4 Update PaymentsTab to use context
    - Import and use useFeesContext hook
    - Replace local data fetching with context methods
    - Use cached payments for initial render
    - Call invalidatePayments and invalidateFeeRecords after recording payment
    - _Requirements: 1.4, 2.3, 3.1_

  - [ ] 6.5 Update AuditLogTab to use context
    - Import and use useFeesContext hook
    - Replace local data fetching with context method
    - Use cached audit logs for initial render
    - _Requirements: 1.4, 3.1_

  - [ ] 6.6 Update ReportsTab to use context
    - Import and use useFeesContext hook
    - Use context for academic year and shared data
    - _Requirements: 1.2_

  - [ ] 6.7 Write property test for mutation cache invalidation
    - **Property 3: Mutation Operations Invalidate Relevant Cache**
    - **Validates: Requirements 2.3**

- [ ] 7. Implement filter state persistence
  - [ ] 7.1 Add filter state management to context
    - Implement filterStates record in context
    - Implement setFilterState function
    - _Requirements: 4.1_

  - [ ] 7.2 Update tab components to use persisted filters
    - Update FeeStructuresTab to persist/restore class filter
    - Update StudentFeesTab to persist/restore class and status filters
    - Update PaymentsTab to persist/restore date range filter
    - Update AuditLogTab to persist/restore action filter
    - _Requirements: 4.2_

  - [ ] 7.3 Write property test for filter persistence
    - **Property 5: Filter State Persistence Per Tab**
    - **Validates: Requirements 4.1, 4.2**

- [ ] 8. Implement error handling and loading states
  - [ ] 8.1 Add loading state management to context
    - Implement loadingStates record in context
    - Update fetching functions to set loading states
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 8.2 Implement error handling for background refresh
    - Add try-catch to background refresh logic
    - Log errors but retain cached data
    - Optionally show toast notification on failure
    - _Requirements: 3.4_

  - [ ] 8.3 Write property test for loading state behavior
    - **Property 4: Loading State Reflects Cache State**
    - **Validates: Requirements 3.1, 3.2, 3.3**

  - [ ] 8.4 Write property test for error handling
    - **Property 6: Background Refresh Preserves Data on Failure**
    - **Validates: Requirements 3.4**

- [ ] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - Verify tab switching is instant with cached data
  - Verify data refreshes correctly after mutations
  - Verify filter states persist across tab switches

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
