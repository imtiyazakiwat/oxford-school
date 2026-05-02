/**
 * Security event logging utility
 * Logs security-relevant events to database with privacy-preserving masking
 */

import { createClient } from "@supabase/supabase-js";

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
// DATABASE CLIENT
// =============================================================================

// Cache the admin client
let adminClient: ReturnType<typeof createClient> | null = null;

function getAdminClient() {
  if (adminClient) return adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    if (process.env.NODE_ENV === "production") {
      console.error("Missing Supabase admin keys - security logging disabled");
    }
    return null;
  }

  adminClient = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}

// =============================================================================
// MASKING UTILITIES
// =============================================================================

/**
 * Mask IP address for privacy
 * IPv4: Shows first 2 octets (e.g., 192.168.xxx.xxx)
 * IPv6: Shows first 4 segments
 */
function maskIP(ip: string): string {
  if (!ip) return "unknown";

  if (ip.includes(":")) {
    // IPv6 - show first 4 segments
    const parts = ip.split(":");
    return parts.slice(0, 4).join(":") + ":****:****:****:****";
  }

  // IPv4 - show first 2 octets
  const parts = ip.split(".");
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.xxx.xxx`;
  }

  return "unknown";
}

/**
 * Mask email for privacy
 * Shows first 3 characters + domain
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
 * Falls back to console logging if database is unavailable
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  const timestamp = new Date().toISOString();

  // Try database logging first
  const client = getAdminClient();
  if (client) {
    try {
      // @ts-ignore - Types mismatch until regeneration, but RPC exists
      await client.rpc("log_security_event", {
        p_event_type: event.type,
        p_ip_address: event.ip || null,
        p_user_id: event.userId || null,
        p_email: event.email || null,
        p_endpoint: event.endpoint || null,
        p_user_agent: event.userAgent || null,
        p_details: event.details ? JSON.stringify(event.details) : null,
      });
      return;
    } catch (error) {
      console.warn("Failed to log security event to database:", error);
      // Fall through to console logging
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

  if (process.env.NODE_ENV === "development") {
    console.log("[SECURITY]", JSON.stringify(safeEvent, null, 2));
  } else {
    // In production, log without pretty printing
    console.log("[SECURITY]", JSON.stringify(safeEvent));
  }
}

/**
 * Log a synchronous security event (non-blocking)
 * Use this when you can't await the log operation
 */
export function logSecurityEventSync(event: SecurityEvent): void {
  // Fire and forget - don't block the request
  logSecurityEvent(event).catch(error => {
    console.error("Security logging failed:", error);
  });
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Log failed authentication attempt
 */
export function logAuthFailure(
  ip: string,
  email?: string,
  endpoint?: string,
  userAgent?: string,
  details?: Record<string, unknown>
): void {
  logSecurityEventSync({
    type: "auth_failure",
    ip,
    email,
    endpoint,
    userAgent,
    details,
  });
}

/**
 * Log successful authentication
 */
export function logAuthSuccess(
  ip: string,
  userId: string,
  email?: string,
  endpoint?: string,
  userAgent?: string
): void {
  logSecurityEventSync({
    type: "auth_success",
    ip,
    userId,
    email,
    endpoint,
    userAgent,
  });
}

/**
 * Log rate limit exceeded
 */
export function logRateLimitExceeded(
  ip: string,
  endpoint: string,
  userAgent?: string,
  details?: Record<string, unknown>
): void {
  logSecurityEventSync({
    type: "rate_limit_exceeded",
    ip,
    endpoint,
    userAgent,
    details,
  });
}

/**
 * Log unauthorized access attempt
 */
export function logUnauthorizedAccess(
  ip: string,
  endpoint: string,
  userId?: string,
  userAgent?: string,
  details?: Record<string, unknown>
): void {
  logSecurityEventSync({
    type: "unauthorized_access",
    ip,
    userId,
    endpoint,
    userAgent,
    details,
  });
}

/**
 * Log suspicious activity
 */
export function logSuspiciousActivity(
  ip: string,
  endpoint: string,
  details: Record<string, unknown>,
  userId?: string,
  userAgent?: string
): void {
  logSecurityEventSync({
    type: "suspicious_activity",
    ip,
    userId,
    endpoint,
    userAgent,
    details,
  });
}

/**
 * Log password reset request
 */
export function logPasswordResetRequest(
  ip: string,
  email: string,
  userAgent?: string
): void {
  logSecurityEventSync({
    type: "password_reset_request",
    ip,
    email,
    userAgent,
  });
}

/**
 * Log successful password reset
 */
export function logPasswordResetSuccess(
  ip: string,
  userId: string,
  email?: string,
  userAgent?: string
): void {
  logSecurityEventSync({
    type: "password_reset_success",
    ip,
    userId,
    email,
    userAgent,
  });
}

/**
 * Log invalid input (potential attack)
 */
export function logInvalidInput(
  ip: string,
  endpoint: string,
  details: Record<string, unknown>,
  userAgent?: string
): void {
  logSecurityEventSync({
    type: "invalid_input",
    ip,
    endpoint,
    userAgent,
    details,
  });
}
