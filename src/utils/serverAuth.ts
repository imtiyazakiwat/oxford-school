/**
 * Server-side authentication utilities
 * Provides secure patterns for API route authentication
 */

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { validateCSRFToken } from "./csrf";

/**
 * Create a Supabase client with the user's JWT token
 * This respects RLS policies - use for user-context operations
 */
export function createUserClient(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    }
  );

  return supabase;
}

/**
 * Create a Supabase admin client (bypasses RLS)
 * ONLY use for operations that genuinely require admin access
 * Always validate authorization BEFORE using this client
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase admin credentials");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Validate that the request is from an authenticated admin user
 * Returns the user if valid, null otherwise
 */
export async function validateAdminRequest(request: NextRequest) {
  const userClient = createUserClient(request);
  
  const { data: { user }, error } = await userClient.auth.getUser();
  
  if (error || !user) {
    return null;
  }

  // Check admin role
  const { data: roleData } = await userClient.rpc("get_user_role", {
    user_uuid: user.id,
  });

  if (roleData !== "admin") {
    return null;
  }

  return user;
}

/**
 * Middleware helper for protected API routes
 * Validates authentication and optionally CSRF
 */
export async function protectApiRoute(
  request: NextRequest,
  options: {
    requireAuth?: boolean;
    requireAdmin?: boolean;
    requireCSRF?: boolean;
  } = {}
): Promise<{ error: NextResponse | null; user: { id: string; email?: string } | null }> {
  const { requireAuth = true, requireAdmin = false, requireCSRF = false } = options;

  // CSRF validation for state-changing requests
  if (requireCSRF && ["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    if (!validateCSRFToken(request)) {
      return {
        error: NextResponse.json(
          { error: "Invalid or missing CSRF token" },
          { status: 403 }
        ),
        user: null,
      };
    }
  }

  // Authentication check
  if (requireAuth) {
    const userClient = createUserClient(request);
    const { data: { user }, error } = await userClient.auth.getUser();

    if (error || !user) {
      return {
        error: NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        ),
        user: null,
      };
    }

    // Admin check
    if (requireAdmin) {
      const { data: roleData } = await userClient.rpc("get_user_role", {
        user_uuid: user.id,
      });

      if (roleData !== "admin") {
        return {
          error: NextResponse.json(
            { error: "Admin access required" },
            { status: 403 }
          ),
          user: null,
        };
      }
    }

    return { error: null, user: { id: user.id, email: user.email } };
  }

  return { error: null, user: null };
}

/**
 * Standard error response helper
 */
export function apiError(message: string, status: number = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Standard success response helper
 */
export function apiSuccess<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}
