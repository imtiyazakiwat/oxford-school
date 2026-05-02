/**
 * Security event logging utility
 * Logs security-relevant events to database with privacy-preserving masking
 */

import { getAdminDb } from "@/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

// =============================================================================
// TYPES
// =============================================================================

export type SecurityEventType =
  | "auth_success"
  | "auth_failure"
  | "rate_limit_exceeded"
  | "invalid_input"
  | "unauthorized_access"
  | "suspicious_activity"
  | "password_reset_request"
  | "password_reset_success"
  | "account_locked"
  | "session_timeout";

export interface SecurityEvent {
  type: SecurityEventType;
  ip?: string;
  userId?: string;
  email?: string;
  endpoint?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}

// =============================================================================
// MASKING UTILITIES
// =============================================================================

/**
 * Mask IP address for privacy
 */
function maskIP(ip: string): string {
  if (!ip) return "unknown";

  if (ip.includes(":")) {
    const parts = ip.split(":");
    return parts.slice(0, 4).join(":") + ":****:****:****:****";
  }

  const parts = ip.split(".");
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.xxx.xxx`;
  }

  return "unknown";
}

/**
 * Mask email for privacy
 */
function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "***@***";

  const [local, domain] = email.split("@");
  const maskedLocal = local.length > 3
    ? local.substring(0, 3) + "***"
    : "***";

  return `${maskedLocal}@${domain}`;
}

// =============================================================================
// LOGGING FUNCTIONS
// =============================================================================

/**
 * Log a security event to the database
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  const timestamp = new Date().toISOString();
  const db = getAdminDb();

  // Try database logging first
  if (db) {
    try {
      await db.collection("security_events").add({
        type: event.type,
        ip_address: event.ip || null,
        user_id: event.userId || null,
        email: event.email || null,
        endpoint: event.endpoint || null,
        user_agent: event.userAgent || null,
        details: event.details || null,
        created_at: Timestamp.now(),
      });
      return;
    } catch (error) {
      console.warn("Failed to log security event to Firestore:", error);
    }
  }

  // Fallback: Console logging with masking
  const safeEvent = {
    type: event.type,
    ip: event.ip ? maskIP(event.ip) : undefined,
    userId: event.userId,
    email: event.email ? maskEmail(event.email) : undefined,
    endpoint: event.endpoint,
    timestamp,
    details: event.details,
  };

  console.log("[SECURITY]", JSON.stringify(safeEvent));
}

/**
 * Log a synchronous security event (non-blocking)
 */
export function logSecurityEventSync(event: SecurityEvent): void {
  logSecurityEvent(event).catch(error => {
    console.error("Security logging failed:", error);
  });
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

export function logAuthFailure(
  ip: string,
  email?: string,
  endpoint?: string,
  userAgent?: string,
  details?: Record<string, unknown>
): void {
  logSecurityEventSync({ type: "auth_failure", ip, email, endpoint, userAgent, details });
}

export function logAuthSuccess(
  ip: string,
  userId: string,
  email?: string,
  endpoint?: string,
  userAgent?: string
): void {
  logSecurityEventSync({ type: "auth_success", ip, userId, email, endpoint, userAgent });
}

export function logRateLimitExceeded(
  ip: string,
  endpoint: string,
  userAgent?: string,
  details?: Record<string, unknown>
): void {
  logSecurityEventSync({ type: "rate_limit_exceeded", ip, endpoint, userAgent, details });
}

export function logUnauthorizedAccess(
  ip: string,
  endpoint: string,
  userId?: string,
  userAgent?: string,
  details?: Record<string, unknown>
): void {
  logSecurityEventSync({ type: "unauthorized_access", ip, userId, endpoint, userAgent, details });
}

export function logSuspiciousActivity(
  ip: string,
  endpoint: string,
  details: Record<string, unknown>,
  userId?: string,
  userAgent?: string
): void {
  logSecurityEventSync({ type: "suspicious_activity", ip, userId, endpoint, userAgent, details });
}

export function logPasswordResetRequest(
  ip: string,
  email: string,
  userAgent?: string
): void {
  logSecurityEventSync({ type: "password_reset_request", ip, email, userAgent });
}

export function logPasswordResetSuccess(
  ip: string,
  userId: string,
  email?: string,
  userAgent?: string
): void {
  logSecurityEventSync({ type: "password_reset_success", ip, userId, email, userAgent });
}

export function logInvalidInput(
  ip: string,
  endpoint: string,
  details: Record<string, unknown>,
  userAgent?: string
): void {
  logSecurityEventSync({ type: "invalid_input", ip, endpoint, userAgent, details });
}
