/**
 * CSRF Protection utilities
 * Uses double-submit cookie pattern
 */

import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const CSRF_COOKIE_NAME = "__csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";
const TOKEN_LENGTH = 32;

/**
 * Generate a cryptographically secure random token
 */
function generateToken(): string {
  const array = new Uint8Array(TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Get or create CSRF token (for server components)
 */
export async function getCSRFToken(): Promise<string> {
  const cookieStore = await cookies();
  let token = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  
  if (!token) {
    token = generateToken();
    // Note: Cookie will be set by middleware or API route
  }
  
  return token;
}

/**
 * Validate CSRF token from request
 */
export function validateCSRFToken(request: NextRequest): boolean {
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  
  // Both must exist and match
  if (!cookieToken || !headerToken) {
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  if (cookieToken.length !== headerToken.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < cookieToken.length; i++) {
    result |= cookieToken.charCodeAt(i) ^ headerToken.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Create CSRF cookie value for response
 */
export function createCSRFCookie(): { name: string; value: string; options: object } {
  const token = generateToken();
  return {
    name: CSRF_COOKIE_NAME,
    value: token,
    options: {
      httpOnly: false, // Must be readable by JavaScript
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    },
  };
}
