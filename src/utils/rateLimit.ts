/**
 * Hybrid rate limiter with in-memory fallback and database persistence
 * Uses database for production reliability, in-memory for development speed
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// =============================================================================
// TYPES
// =============================================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number; // seconds until reset
}

// =============================================================================
// CONFIGURATION
// =============================================================================

export const RATE_LIMIT_CONFIGS = {
  contactForm: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5, // 5 submissions per hour per IP
  },
  application: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20, // 20 applications per hour per IP
  },
  otp: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5, // 5 OTP requests per hour
  },
  otpVerify: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 verification attempts per 15 minutes
  },
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5, // 5 password reset attempts per hour
  },
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 login attempts per 15 minutes
  },
} as const;

// =============================================================================
// IN-MEMORY STORE (Fallback)
// =============================================================================

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries from in-memory store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * In-memory rate limit check (fallback when database unavailable)
 */
function checkRateLimitInMemory(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();

  // Periodic cleanup (10% chance per request)
  if (Math.random() < 0.1) {
    cleanupExpiredEntries();
  }

  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // First request or window expired
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });

    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetIn: Math.ceil(config.windowMs / 1000),
    };
  }

  // Within window - check count
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetIn: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  // Increment counter
  entry.count++;

  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  };
}

// =============================================================================
// DATABASE RATE LIMITING
// =============================================================================

/**
 * Get admin Supabase client for rate limiting
 */
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Database-backed rate limit check
 */
async function checkRateLimitDatabase(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): Promise<RateLimitResult | null> {
  const client = getAdminClient();
  if (!client) return null;

  try {
    const windowSeconds = Math.ceil(config.windowMs / 1000);

    const { data, error } = await client.rpc("check_rate_limit", {
      p_identifier: identifier,
      p_endpoint: endpoint,
      p_max_requests: config.maxRequests,
      p_window_seconds: windowSeconds,
    });

    if (error) {
      console.warn("Database rate limit check failed:", error.message);
      return null;
    }

    const result = data as { allowed: boolean; remaining: number; reset_at: string };
    const resetAt = new Date(result.reset_at).getTime();
    const resetIn = Math.max(0, Math.ceil((resetAt - Date.now()) / 1000));

    return {
      success: result.allowed,
      remaining: result.remaining,
      resetIn,
    };
  } catch (error) {
    console.warn("Database rate limit error:", error);
    return null;
  }
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Check if a request should be rate limited
 * Uses database when available, falls back to in-memory
 * 
 * @param identifier - Unique identifier (IP address, email, etc.)
 * @param config - Rate limit configuration
 * @param endpoint - Optional endpoint name for database tracking
 * @returns RateLimitResult
 */
export async function checkRateLimitAsync(
  identifier: string,
  config: RateLimitConfig,
  endpoint: string = "default"
): Promise<RateLimitResult> {
  // Try database first (production)
  const dbResult = await checkRateLimitDatabase(identifier, endpoint, config);
  if (dbResult) return dbResult;

  // Fall back to in-memory (development or database unavailable)
  return checkRateLimitInMemory(`${endpoint}:${identifier}`, config);
}

/**
 * Synchronous rate limit check (in-memory only)
 * Use this when async is not possible
 * 
 * @param identifier - Unique identifier (IP address, email, etc.)
 * @param config - Rate limit configuration
 * @returns RateLimitResult
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  return checkRateLimitInMemory(identifier, config);
}

/**
 * Extract client IP from request
 * Handles various proxy headers
 */
export function getClientIP(request: NextRequest): string {
  // Check various headers in order of preference
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Take the first IP (original client)
    const ips = forwardedFor.split(",").map(ip => ip.trim());
    if (ips[0]) return ips[0];
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) return realIP;

  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  if (cfConnectingIP) return cfConnectingIP;

  // Fallback to a hash of user agent + accept headers for some uniqueness
  const userAgent = request.headers.get("user-agent") || "";
  const accept = request.headers.get("accept") || "";
  return `unknown-${hashString(userAgent + accept)}`;
}

/**
 * Simple string hash for fallback IP identification
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Create a rate limit exceeded response
 */
export function rateLimitResponse(resetIn: number): NextResponse {
  return NextResponse.json(
    {
      error: "Too many requests. Please try again later.",
      retryAfter: resetIn,
    },
    {
      status: 429,
      headers: {
        "Retry-After": resetIn.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": new Date(Date.now() + resetIn * 1000).toISOString(),
      },
    }
  );
}

/**
 * Add rate limit headers to a response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult,
  maxRequests: number
): NextResponse {
  response.headers.set("X-RateLimit-Limit", maxRequests.toString());
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
  response.headers.set(
    "X-RateLimit-Reset",
    new Date(Date.now() + result.resetIn * 1000).toISOString()
  );
  return response;
}
