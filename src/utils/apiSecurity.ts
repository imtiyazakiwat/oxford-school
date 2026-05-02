/**
 * API Security utilities
 */

import { NextRequest, NextResponse } from "next/server";

// Allowed origins for API requests
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean);

/**
 * Validate request origin
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  
  // Allow requests without origin (same-origin, server-side)
  if (!origin && !referer) {
    return true;
  }
  
  // Check origin header
  if (origin && ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed || ""))) {
    return true;
  }
  
  // Check referer header as fallback
  if (referer && ALLOWED_ORIGINS.some(allowed => referer.startsWith(allowed || ""))) {
    return true;
  }
  
  return false;
}

/**
 * Create forbidden response
 */
export function forbiddenResponse(): NextResponse {
  return NextResponse.json(
    { error: "Forbidden" },
    { status: 403 }
  );
}

/**
 * Sanitize error for client response (don't leak internal details)
 */
export function sanitizeError(error: unknown): string {
  // In production, don't expose internal error details
  if (process.env.NODE_ENV === "production") {
    return "An error occurred. Please try again.";
  }
  
  // In development, show more details
  if (error instanceof Error) {
    return error.message;
  }
  
  return "Unknown error";
}

/**
 * Log error safely (redact sensitive data)
 */
export function logError(context: string, error: unknown): void {
  // Only log in development or if explicitly enabled
  if (process.env.NODE_ENV === "development" || process.env.ENABLE_ERROR_LOGGING === "true") {
    console.error(`[${context}]`, error);
  }
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: Record<string, unknown>,
  fields: string[]
): { valid: boolean; missing: string[] } {
  const missing = fields.filter(field => {
    const value = body[field];
    return value === undefined || value === null || value === "";
  });
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Create a standardized error response
 */
export function errorResponse(
  message: string,
  status: number = 400
): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Create a standardized success response
 */
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json(data, { status });
}
