/**
 * Server-side authentication utilities
 * Provides secure patterns for API route authentication using Firebase
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { validateCSRFToken } from "./csrf";

/**
 * Validate that the request is from an authenticated admin user
 */
export async function validateAdminRequest(request: NextRequest) {
  const auth = getAdminAuth();
  const db = getAdminDb();
  if (!auth || !db) return null;

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) return null;

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();

    if (userData?.role !== "admin" && userData?.role !== "super_admin") {
      return null;
    }

    return { id: userId, email: decodedToken.email, role: userData.role };
  } catch (error) {
    return null;
  }
}

/**
 * Middleware helper for protected API routes
 */
export async function protectApiRoute(
  request: NextRequest,
  options: {
    requireAuth?: boolean;
    requireAdmin?: boolean;
    requireCSRF?: boolean;
  } = {}
): Promise<{ error: NextResponse | null; user: { id: string; email?: string; role?: string } | null }> {
  const { requireAuth = true, requireAdmin = false, requireCSRF = false } = options;

  // CSRF validation
  if (requireCSRF && ["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    if (!validateCSRFToken(request)) {
      return {
        error: NextResponse.json({ error: "Invalid or missing CSRF token" }, { status: 403 }),
        user: null,
      };
    }
  }

  if (requireAuth) {
    const auth = getAdminAuth();
    if (!auth) return { error: NextResponse.json({ error: "Auth not configured" }, { status: 500 }), user: null };

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return { error: NextResponse.json({ error: "Authentication required" }, { status: 401 }), user: null };
    }

    try {
      const decodedToken = await auth.verifyIdToken(token);
      const user = { id: decodedToken.uid, email: decodedToken.email };

      if (requireAdmin) {
        const db = getAdminDb();
        if (!db) return { error: NextResponse.json({ error: "DB not configured" }, { status: 500 }), user: null };

        const userDoc = await db.collection("users").doc(user.id).get();
        const userData = userDoc.data();

        if (userData?.role !== "admin" && userData?.role !== "super_admin") {
          return { error: NextResponse.json({ error: "Admin access required" }, { status: 403 }), user: null };
        }
        return { error: null, user: { ...user, role: userData.role } };
      }

      return { error: null, user };
    } catch (error) {
      return { error: NextResponse.json({ error: "Invalid token" }, { status: 401 }), user: null };
    }
  }

  return { error: null, user: null };
}

export function apiError(message: string, status: number = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function apiSuccess<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}
