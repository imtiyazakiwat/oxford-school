/**
 * In-memory rate limiter
 */

import { NextRequest, NextResponse } from "next/server";

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
// IN-MEMORY STORE
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
 * In-memory rate limit check
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
// PUBLIC API
// =============================================================================

/**
 * Check if a request should be rate limited
 * 
 * @param identifier - Unique identifier (IP address, email, etc.)
 * @param config - Rate limit configuration
 * @param endpoint - Optional endpoint name
 * @returns RateLimitResult
 */
export async function checkRateLimitAsync(
  identifier: string,
  config: RateLimitConfig,
  endpoint: string = "default"
): Promise<RateLimitResult> {
  return checkRateLimitInMemory(`${endpoint}:${identifier}`, config);
}

/**
 * Synchronous rate limit check
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
 */
export function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map(ip => ip.trim());
    if (ips[0]) return ips[0];
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) return realIP;

  return "unknown";
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
