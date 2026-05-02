# Design Document: Fees Module Caching

## Overview

This design implements in-memory caching and state persistence for the Fees Management module using React Context. The solution addresses the component remounting issue by refactoring the architecture to use a single persistent FeesModule instance with internal tab management, combined with a FeesContext provider for shared state and TTL-based caching.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     AdminDashboard                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  FeesContextProvider                   │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │              FeesModule (persistent)             │  │  │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐           │  │  │
│  │  │  │Overview │ │Structures│ │Students │  ...      │  │  │
│  │  │  │  Tab    │ │   Tab   │ │   Tab   │           │  │  │
│  │  │  └─────────┘ └─────────┘ └─────────┘           │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │              FeesContext State                   │  │  │
│  │  │  • academicYear        • userId                  │  │  │
│  │  │  • feeStructuresCache  • feeRecordsCache        │  │  │
│  │  │  • paymentsCache       • statisticsCache        │  │  │
│  │  │  • auditLogsCache      • filterStates           │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### FeesContext Interface

```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  academicYear: string;
}

interface FilterState {
  classFilter?: string;
  statusFilter?: FeeStatus;
  dateRange?: { start: string; end: string };
  searchQuery?: string;
}

interface FeesContextValue {
  // Shared state
  academicYear: string;
  setAcademicYear: (year: string) => void;
  userId: string | null;
  
  // Cached data
  feeStructures: CacheEntry<FeeStructure[]> | null;
  feeRecords: CacheEntry<FeeRecord[]> | null;
  payments: CacheEntry<FeePayment[]> | null;
  statistics: CacheEntry<FeeStatistics> | null;
  auditLogs: CacheEntry<FeeAuditLog[]> | null;
  
  // Data fetching with cache
  getFeeStructures: (filters?: FeeStructureFilters, forceRefresh?: boolean) => Promise<FeeStructure[]>;
  getFeeRecords: (filters?: FeeRecordFilters, forceRefresh?: boolean) => Promise<FeeRecord[]>;
  getPayments: (filters?: PaymentFilters, forceRefresh?: boolean) => Promise<FeePayment[]>;
  getStatistics: (forceRefresh?: boolean) => Promise<FeeStatistics | null>;
  getAuditLogs: (filters?: AuditLogFilters, forceRefresh?: boolean) => Promise<FeeAuditLog[]>;
  
  // Cache invalidation
  invalidateFeeStructures: () => void;
  invalidateFeeRecords: () => void;
  invalidatePayments: () => void;
  invalidateStatistics: () => void;
  invalidateAuditLogs: () => void;
  invalidateAll: () => void;
  
  // Filter state per tab
  filterStates: Record<TabType, FilterState>;
  setFilterState: (tab: TabType, filters: FilterState) => void;
  
  // Loading states
  loadingStates: Record<string, boolean>;
}
```

### TTL Configuration

```typescript
const CACHE_TTL = {
  FEE_STRUCTURES: 5 * 60 * 1000,  // 5 minutes - relatively static
  STATISTICS: 5 * 60 * 1000,      // 5 minutes - aggregated data
  FEE_RECORDS: 2 * 60 * 1000,     // 2 minutes - more volatile
  PAYMENTS: 2 * 60 * 1000,        // 2 minutes - frequently updated
  AUDIT_LOGS: 1 * 60 * 1000,      // 1 minute - real-time tracking
};
```

### Cache Validation Logic

```typescript
function isCacheValid<T>(cache: CacheEntry<T> | null, ttl: number, currentYear: string): boolean {
  if (!cache) return false;
  if (cache.academicYear !== currentYear) return false;
  return Date.now() - cache.timestamp < ttl;
}
```

## Data Models

### Cache Entry Structure

```typescript
interface CacheEntry<T> {
  data: T;              // The cached data
  timestamp: number;    // When the data was fetched (Date.now())
  academicYear: string; // Academic year the data belongs to
}
```

### Filter State Structure

```typescript
interface FilterState {
  classFilter?: string;           // e.g., "Class 10", "Class 11 - Science"
  statusFilter?: FeeStatus;       // "Paid" | "Partial" | "Pending" | "Overdue"
  dateRange?: {
    start: string;                // ISO date string
    end: string;                  // ISO date string
  };
  searchQuery?: string;           // Free text search
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Cache Serves Valid Data Immediately

*For any* tab component requesting data, if the cache contains valid (non-stale) data for the current academic year, the component SHALL receive that data immediately without triggering a network request.

**Validates: Requirements 1.4, 3.1**

### Property 2: Academic Year Change Invalidates Cache

*For any* academic year change, all cached data entries for the previous academic year SHALL be invalidated, ensuring no stale cross-year data is served.

**Validates: Requirements 1.2, 2.5**

### Property 3: Mutation Operations Invalidate Relevant Cache

*For any* successful create, update, or delete operation on fee structures, fee records, or payments, the corresponding cache entry SHALL be invalidated immediately after the operation completes.

**Validates: Requirements 2.3**

### Property 4: Loading State Reflects Cache State

*For any* data request, the loading state SHALL be:
- `false` if valid cache exists (data shown immediately)
- `true` only if no cache exists (initial load)
- `false` during background refresh (stale cache shown while refreshing)

**Validates: Requirements 3.1, 3.2, 3.3**

### Property 5: Filter State Persistence Per Tab

*For any* filter state change on a tab, that state SHALL be persisted and restored when returning to the same tab, maintaining user context across tab switches.

**Validates: Requirements 4.1, 4.2**

### Property 6: Background Refresh Preserves Data on Failure

*For any* background refresh that fails, the existing cached data SHALL be retained and an error SHALL be logged, ensuring the UI remains functional.

**Validates: Requirements 3.4**

### Property 7: Component Persistence Across Tab Switches

*For any* tab switch within the Fees Module, the FeesModule component SHALL NOT remount, preserving React state and preventing unnecessary re-initialization.

**Validates: Requirements 5.2, 5.3**

## Error Handling

1. **Network Failures During Initial Load**: Show error state with retry button
2. **Network Failures During Background Refresh**: Log error, retain cached data, optionally show toast notification
3. **Invalid Cache Data**: Clear cache entry and trigger fresh fetch
4. **Context Provider Missing**: Throw descriptive error in development, graceful fallback in production

## Testing Strategy

### Unit Tests
- Test cache validation logic with various timestamps and TTLs
- Test filter state persistence and restoration
- Test cache invalidation on mutations

### Property-Based Tests
- Use fast-check to generate random cache states and verify behavior
- Test academic year changes with random year values
- Test mutation operations with random data

### Integration Tests
- Test full tab switching flow with mocked API responses
- Test cache behavior across component lifecycle
- Test error handling scenarios

### Test Configuration
- Minimum 100 iterations per property test
- Use fast-check for TypeScript property-based testing
- Tag format: **Feature: fees-module-caching, Property {number}: {property_text}**
