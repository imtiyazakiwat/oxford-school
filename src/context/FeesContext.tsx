"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { supabase } from "@/supabase/supabase";
import {
  FeeStructure,
  FeeRecord,
  FeePayment,
  FeeAuditLog,
  FeeStatistics,
  FeeStatus,
  FeeRecordFilters,
  AuditLogFilters,
  getFeeStructures as fetchFeeStructures,
  getFeeRecords as fetchFeeRecords,
  getPaymentsByDateRange,
  getFeeStatistics as fetchFeeStatistics,
  getFeeAuditLogs as fetchFeeAuditLogs,
} from "@/supabase/fees";
import { getCurrentAcademicYear } from "@/components/admin/modules/fees/shared";

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Cache Entry - A cached data item with timestamp for TTL validation
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  academicYear: string;
}

/**
 * Filter State - Persisted filter selections for each tab
 */
export interface FilterState {
  classFilter?: string;
  statusFilter?: FeeStatus;
  dateRange?: { start: string; end: string };
  searchQuery?: string;
  actionFilter?: "INSERT" | "UPDATE" | "DELETE";
}

/**
 * Tab types for the Fees Module
 */
export type TabType = "overview" | "structures" | "students" | "payments" | "audit" | "reports";

/**
 * Fee Structure Filters
 */
export interface FeeStructureFilters {
  academic_year?: string;
  class?: string;
  is_active?: boolean;
}

/**
 * Payment Filters
 */
export interface PaymentFilters {
  start_date?: string;
  end_date?: string;
  student_id?: string;
}

// =============================================================================
// TTL CONFIGURATION
// =============================================================================

/**
 * Time-To-Live constants for each data type (in milliseconds)
 * - Fee structures and statistics: 5 minutes (relatively static)
 * - Fee records and payments: 2 minutes (more volatile)
 * - Audit logs: 1 minute (real-time tracking)
 */
export const CACHE_TTL = {
  FEE_STRUCTURES: 5 * 60 * 1000,  // 5 minutes
  STATISTICS: 5 * 60 * 1000,      // 5 minutes
  FEE_RECORDS: 2 * 60 * 1000,     // 2 minutes
  PAYMENTS: 2 * 60 * 1000,        // 2 minutes
  AUDIT_LOGS: 1 * 60 * 1000,      // 1 minute
};

// =============================================================================
// CACHE VALIDATION HELPER
// =============================================================================

/**
 * Validates if a cache entry is still valid based on TTL and academic year
 * @param cache - The cache entry to validate
 * @param ttl - Time-to-live in milliseconds
 * @param currentYear - Current academic year to compare against
 * @returns true if cache is valid, false otherwise
 */
export function isCacheValid<T>(
  cache: CacheEntry<T> | null,
  ttl: number,
  currentYear: string
): boolean {
  if (!cache) return false;
  if (cache.academicYear !== currentYear) return false;
  return Date.now() - cache.timestamp < ttl;
}

// =============================================================================
// CONTEXT VALUE INTERFACE
// =============================================================================

export interface FeesContextValue {
  // Shared state
  academicYear: string;
  setAcademicYear: (year: string) => void;
  userId: string | null;

  // Cached data (exposed for testing/debugging)
  feeStructuresCache: CacheEntry<FeeStructure[]> | null;
  feeRecordsCache: CacheEntry<FeeRecord[]> | null;
  paymentsCache: CacheEntry<FeePayment[]> | null;
  statisticsCache: CacheEntry<FeeStatistics> | null;
  auditLogsCache: CacheEntry<FeeAuditLog[]> | null;

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

// =============================================================================
// CONTEXT CREATION
// =============================================================================

const FeesContext = createContext<FeesContextValue | undefined>(undefined);

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

export interface FeesContextProviderProps {
  children: ReactNode;
  initialAcademicYear?: string;
}

export function FeesContextProvider({
  children,
  initialAcademicYear,
}: FeesContextProviderProps) {
  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================

  // Shared state
  const [academicYear, setAcademicYearState] = useState(
    initialAcademicYear || getCurrentAcademicYear()
  );
  const [userId, setUserId] = useState<string | null>(null);

  // Cache entries
  const [feeStructuresCache, setFeeStructuresCache] = useState<CacheEntry<FeeStructure[]> | null>(null);
  const [feeRecordsCache, setFeeRecordsCache] = useState<CacheEntry<FeeRecord[]> | null>(null);
  const [paymentsCache, setPaymentsCache] = useState<CacheEntry<FeePayment[]> | null>(null);
  const [statisticsCache, setStatisticsCache] = useState<CacheEntry<FeeStatistics> | null>(null);
  const [auditLogsCache, setAuditLogsCache] = useState<CacheEntry<FeeAuditLog[]> | null>(null);

  // Filter states per tab
  const [filterStates, setFilterStates] = useState<Record<TabType, FilterState>>({
    overview: {},
    structures: {},
    students: {},
    payments: {},
    audit: {},
    reports: {},
  });

  // Loading states
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({
    feeStructures: false,
    feeRecords: false,
    payments: false,
    statistics: false,
    auditLogs: false,
  });

  // Track previous academic year for invalidation
  const [prevAcademicYear, setPrevAcademicYear] = useState(academicYear);

  // ==========================================================================
  // USER ID FETCHING (single fetch on mount)
  // ==========================================================================

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  // ==========================================================================
  // ACADEMIC YEAR CHANGE HANDLER
  // ==========================================================================

  const setAcademicYear = useCallback((year: string) => {
    setPrevAcademicYear(academicYear);
    setAcademicYearState(year);
  }, [academicYear]);

  // Invalidate all cache when academic year changes
  useEffect(() => {
    if (prevAcademicYear !== academicYear) {
      // Invalidate all cached data for the previous year
      setFeeStructuresCache(null);
      setFeeRecordsCache(null);
      setPaymentsCache(null);
      setStatisticsCache(null);
      setAuditLogsCache(null);
    }
  }, [academicYear, prevAcademicYear]);

  // ==========================================================================
  // LOADING STATE HELPERS
  // ==========================================================================

  const setLoading = useCallback((key: string, value: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ==========================================================================
  // CACHED DATA FETCHING FUNCTIONS
  // ==========================================================================

  /**
   * Get fee structures with cache check and background refresh
   */
  const getFeeStructures = useCallback(
    async (filters?: FeeStructureFilters, forceRefresh = false): Promise<FeeStructure[]> => {
      const cacheKey = "feeStructures";

      // Check if cache is valid and no force refresh
      if (!forceRefresh && isCacheValid(feeStructuresCache, CACHE_TTL.FEE_STRUCTURES, academicYear)) {
        // Return cached data immediately
        const cachedData = feeStructuresCache!.data;

        // Check if cache is stale (older than half TTL) - trigger background refresh
        const isStale = Date.now() - feeStructuresCache!.timestamp > CACHE_TTL.FEE_STRUCTURES / 2;
        if (isStale) {
          // Background refresh without blocking
          fetchFeeStructures({ ...filters, academic_year: academicYear }, true)
            .then(({ data }) => {
              if (data) {
                setFeeStructuresCache({
                  data,
                  timestamp: Date.now(),
                  academicYear,
                });
              }
            })
            .catch((error) => {
              console.error("Background refresh failed for fee structures:", error);
              // Retain existing cached data on failure
            });
        }

        return cachedData;
      }

      // No valid cache - fetch fresh data
      setLoading(cacheKey, true);
      try {
        const { data, error } = await fetchFeeStructures(
          { ...filters, academic_year: academicYear },
          true
        );

        if (error) {
          console.error("Error fetching fee structures:", error);
          return feeStructuresCache?.data || [];
        }

        setFeeStructuresCache({
          data: data || [],
          timestamp: Date.now(),
          academicYear,
        });

        return data || [];
      } finally {
        setLoading(cacheKey, false);
      }
    },
    [academicYear, feeStructuresCache, setLoading]
  );

  /**
   * Get fee records with cache check and background refresh
   */
  const getFeeRecords = useCallback(
    async (filters?: FeeRecordFilters, forceRefresh = false): Promise<FeeRecord[]> => {
      const cacheKey = "feeRecords";

      // Check if cache is valid and no force refresh
      if (!forceRefresh && isCacheValid(feeRecordsCache, CACHE_TTL.FEE_RECORDS, academicYear)) {
        const cachedData = feeRecordsCache!.data;

        // Check if cache is stale - trigger background refresh
        const isStale = Date.now() - feeRecordsCache!.timestamp > CACHE_TTL.FEE_RECORDS / 2;
        if (isStale) {
          fetchFeeRecords({ ...filters, academic_year: academicYear })
            .then(({ data }) => {
              if (data) {
                setFeeRecordsCache({
                  data,
                  timestamp: Date.now(),
                  academicYear,
                });
              }
            })
            .catch((error) => {
              console.error("Background refresh failed for fee records:", error);
            });
        }

        return cachedData;
      }

      // No valid cache - fetch fresh data
      setLoading(cacheKey, true);
      try {
        const { data, error } = await fetchFeeRecords({
          ...filters,
          academic_year: academicYear,
        });

        if (error) {
          console.error("Error fetching fee records:", error);
          return feeRecordsCache?.data || [];
        }

        setFeeRecordsCache({
          data: data || [],
          timestamp: Date.now(),
          academicYear,
        });

        return data || [];
      } finally {
        setLoading(cacheKey, false);
      }
    },
    [academicYear, feeRecordsCache, setLoading]
  );

  /**
   * Get payments with cache check and background refresh
   */
  const getPayments = useCallback(
    async (filters?: PaymentFilters, forceRefresh = false): Promise<FeePayment[]> => {
      const cacheKey = "payments";

      // Check if cache is valid and no force refresh
      if (!forceRefresh && isCacheValid(paymentsCache, CACHE_TTL.PAYMENTS, academicYear)) {
        const cachedData = paymentsCache!.data;

        // Check if cache is stale - trigger background refresh
        const isStale = Date.now() - paymentsCache!.timestamp > CACHE_TTL.PAYMENTS / 2;
        if (isStale && filters?.start_date && filters?.end_date) {
          getPaymentsByDateRange(filters.start_date, filters.end_date)
            .then(({ data }) => {
              if (data) {
                setPaymentsCache({
                  data,
                  timestamp: Date.now(),
                  academicYear,
                });
              }
            })
            .catch((error) => {
              console.error("Background refresh failed for payments:", error);
            });
        }

        return cachedData;
      }

      // No valid cache - fetch fresh data
      setLoading(cacheKey, true);
      try {
        // Default to current month if no date range provided
        const now = new Date();
        const startDate = filters?.start_date || 
          new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
        const endDate = filters?.end_date || 
          new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

        const { data, error } = await getPaymentsByDateRange(startDate, endDate);

        if (error) {
          console.error("Error fetching payments:", error);
          return paymentsCache?.data || [];
        }

        setPaymentsCache({
          data: data || [],
          timestamp: Date.now(),
          academicYear,
        });

        return data || [];
      } finally {
        setLoading(cacheKey, false);
      }
    },
    [academicYear, paymentsCache, setLoading]
  );

  /**
   * Get statistics with cache check and background refresh
   */
  const getStatistics = useCallback(
    async (forceRefresh = false): Promise<FeeStatistics | null> => {
      const cacheKey = "statistics";

      // Check if cache is valid and no force refresh
      if (!forceRefresh && isCacheValid(statisticsCache, CACHE_TTL.STATISTICS, academicYear)) {
        const cachedData = statisticsCache!.data;

        // Check if cache is stale - trigger background refresh
        const isStale = Date.now() - statisticsCache!.timestamp > CACHE_TTL.STATISTICS / 2;
        if (isStale) {
          fetchFeeStatistics(academicYear)
            .then(({ data }) => {
              if (data) {
                setStatisticsCache({
                  data,
                  timestamp: Date.now(),
                  academicYear,
                });
              }
            })
            .catch((error) => {
              console.error("Background refresh failed for statistics:", error);
            });
        }

        return cachedData;
      }

      // No valid cache - fetch fresh data
      setLoading(cacheKey, true);
      try {
        const { data, error } = await fetchFeeStatistics(academicYear);

        if (error) {
          console.error("Error fetching statistics:", error);
          return statisticsCache?.data || null;
        }

        if (data) {
          setStatisticsCache({
            data,
            timestamp: Date.now(),
            academicYear,
          });
        }

        return data;
      } finally {
        setLoading(cacheKey, false);
      }
    },
    [academicYear, statisticsCache, setLoading]
  );

  /**
   * Get audit logs with cache check and background refresh
   */
  const getAuditLogs = useCallback(
    async (filters?: AuditLogFilters, forceRefresh = false): Promise<FeeAuditLog[]> => {
      const cacheKey = "auditLogs";

      // Check if cache is valid and no force refresh
      if (!forceRefresh && isCacheValid(auditLogsCache, CACHE_TTL.AUDIT_LOGS, academicYear)) {
        const cachedData = auditLogsCache!.data;

        // Check if cache is stale - trigger background refresh
        const isStale = Date.now() - auditLogsCache!.timestamp > CACHE_TTL.AUDIT_LOGS / 2;
        if (isStale) {
          fetchFeeAuditLogs(filters)
            .then(({ data }) => {
              if (data) {
                setAuditLogsCache({
                  data,
                  timestamp: Date.now(),
                  academicYear,
                });
              }
            })
            .catch((error) => {
              console.error("Background refresh failed for audit logs:", error);
            });
        }

        return cachedData;
      }

      // No valid cache - fetch fresh data
      setLoading(cacheKey, true);
      try {
        const { data, error } = await fetchFeeAuditLogs(filters);

        if (error) {
          console.error("Error fetching audit logs:", error);
          return auditLogsCache?.data || [];
        }

        setAuditLogsCache({
          data: data || [],
          timestamp: Date.now(),
          academicYear,
        });

        return data || [];
      } finally {
        setLoading(cacheKey, false);
      }
    },
    [academicYear, auditLogsCache, setLoading]
  );

  // ==========================================================================
  // CACHE INVALIDATION FUNCTIONS
  // ==========================================================================

  const invalidateFeeStructures = useCallback(() => {
    setFeeStructuresCache(null);
  }, []);

  const invalidateFeeRecords = useCallback(() => {
    setFeeRecordsCache(null);
  }, []);

  const invalidatePayments = useCallback(() => {
    setPaymentsCache(null);
  }, []);

  const invalidateStatistics = useCallback(() => {
    setStatisticsCache(null);
  }, []);

  const invalidateAuditLogs = useCallback(() => {
    setAuditLogsCache(null);
  }, []);

  const invalidateAll = useCallback(() => {
    setFeeStructuresCache(null);
    setFeeRecordsCache(null);
    setPaymentsCache(null);
    setStatisticsCache(null);
    setAuditLogsCache(null);
  }, []);

  // ==========================================================================
  // FILTER STATE MANAGEMENT
  // ==========================================================================

  const setFilterState = useCallback((tab: TabType, filters: FilterState) => {
    setFilterStates((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], ...filters },
    }));
  }, []);

  // ==========================================================================
  // CONTEXT VALUE
  // ==========================================================================

  const contextValue: FeesContextValue = {
    // Shared state
    academicYear,
    setAcademicYear,
    userId,

    // Cached data
    feeStructuresCache,
    feeRecordsCache,
    paymentsCache,
    statisticsCache,
    auditLogsCache,

    // Data fetching
    getFeeStructures,
    getFeeRecords,
    getPayments,
    getStatistics,
    getAuditLogs,

    // Cache invalidation
    invalidateFeeStructures,
    invalidateFeeRecords,
    invalidatePayments,
    invalidateStatistics,
    invalidateAuditLogs,
    invalidateAll,

    // Filter state
    filterStates,
    setFilterState,

    // Loading states
    loadingStates,
  };

  return (
    <FeesContext.Provider value={contextValue}>
      {children}
    </FeesContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook to access the FeesContext
 * @throws Error if used outside of FeesContextProvider
 */
export function useFeesContext(): FeesContextValue {
  const context = useContext(FeesContext);
  if (context === undefined) {
    throw new Error("useFeesContext must be used within a FeesContextProvider");
  }
  return context;
}
