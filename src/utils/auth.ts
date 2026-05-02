/**
 * Server-side authentication utilities for API routes
 * Provides secure admin verification with multiple token extraction methods
 */

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

/**
 * Verify that the request is from an authenticated admin user
 * Uses multiple token extraction methods for reliability:
 * 1. Authorization header (Bearer token)
 * 2. Supabase auth cookies (sb-access-token, sb-refresh-token)
 * 
 * @param request - The incoming request (can be Request or NextRequest)
 * @returns Object with authorized status, error message, and user if authorized
 */
export async function verifyAdmin(request: Request | NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { authorized: false, error: "Server configuration error" };
  }

  // Try to extract token from multiple sources
  let token: string | null = null;

  // Method 1: Check Authorization header first (most reliable for API calls)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  // Method 2: Try to get from cookies if no header token
  if (!token) {
    try {
      const cookieStore = await cookies();

      // Try different cookie names that Supabase might use
      const possibleCookieNames = [
        "sb-access-token",
        `sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`,
      ];

      for (const cookieName of possibleCookieNames) {
        const cookieValue = cookieStore.get(cookieName)?.value;
        if (cookieValue) {
          // Supabase auth token cookie might be JSON encoded
          try {
            const parsed = JSON.parse(cookieValue);
            token = parsed.access_token || parsed;
          } catch {
            // Not JSON, use as-is
            token = cookieValue;
          }
          break;
        }
      }
    } catch (cookieError) {
      // Cookie access might fail in some contexts, continue without
      console.warn("Cookie access failed:", cookieError);
    }
  }

  // No token found from any source
  if (!token) {
    return { authorized: false, error: "No authentication token provided" };
  }

  // Create Supabase client with the extracted token
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  // Verify the token and get user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      authorized: false,
      error: userError?.message || "Invalid or expired authentication token"
    };
  }

  // Check user_roles table for admin role using RPC for security
  const { data: roleData, error: roleError } = await supabase.rpc("get_user_role", {
    user_uuid: user.id,
  });

  if (roleError) {
    console.error("Role check error:", roleError);
    return { authorized: false, error: "Failed to verify user role" };
  }

  // Check if user has admin or super_admin role
  if (roleData !== "admin" && roleData !== "super_admin") {
    return { authorized: false, error: "Access denied: Admin privileges required" };
  }

  return {
    authorized: true,
    user: {
      id: user.id,
      email: user.email,
      role: roleData,
    },
  };
}

/**
 * Verify that the request is from an authenticated user (any role)
 * Less strict than verifyAdmin - just checks for valid authentication
 */
export async function verifyAuthenticated(request: Request | NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { authorized: false, error: "Server configuration error" };
  }

  // Extract token (same logic as verifyAdmin)
  let token: string | null = null;

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  if (!token) {
    try {
      const cookieStore = await cookies();
      const possibleCookieNames = [
        "sb-access-token",
        `sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`,
      ];

      for (const cookieName of possibleCookieNames) {
        const cookieValue = cookieStore.get(cookieName)?.value;
        if (cookieValue) {
          try {
            const parsed = JSON.parse(cookieValue);
            token = parsed.access_token || parsed;
          } catch {
            token = cookieValue;
          }
          break;
        }
      }
    } catch {
      // Continue without cookies
    }
  }

  if (!token) {
    return { authorized: false, error: "No authentication token provided" };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      authorized: false,
      error: userError?.message || "Invalid or expired authentication token"
    };
  }

  // Get user role for context
  const { data: roleData } = await supabase.rpc("get_user_role", {
    user_uuid: user.id,
  });

  return {
    authorized: true,
    user: {
      id: user.id,
      email: user.email,
      role: roleData || null,
    },
  };
}
