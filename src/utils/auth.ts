/**
 * Server-side authentication utilities for API routes
 * Provides secure admin verification with Firebase ID tokens
 */

import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

/**
 * Verify that the request is from an authenticated admin user
 */
export async function verifyAdmin(request: Request | NextRequest) {
  const auth = getAdminAuth();
  if (!auth) {
    return { authorized: false, error: "Firebase Admin not configured" };
  }

  // Extract token from Authorization header
  let token: string | null = null;
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  // Fallback to cookies
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("firebase-token")?.value || null;
    } catch {
      // Ignore cookie errors
    }
  }

  if (!token) {
    return { authorized: false, error: "No authentication token provided" };
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Check user role in Firestore
    const db = getAdminDb();
    if (!db) return { authorized: false, error: "Firestore not configured" };

    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();
    const role = userData?.role || null;

    if (role !== "admin" && role !== "super_admin") {
      return { authorized: false, error: "Access denied: Admin privileges required" };
    }

    return {
      authorized: true,
      user: {
        id: userId,
        email: decodedToken.email,
        role: role,
      },
    };
  } catch (error) {
    console.error("Auth verification error:", error);
    return { authorized: false, error: "Invalid or expired authentication token" };
  }
}

/**
 * Verify that the request is from an authenticated user (any role)
 */
export async function verifyAuthenticated(request: Request | NextRequest) {
  const auth = getAdminAuth();
  if (!auth) {
    return { authorized: false, error: "Firebase Admin not configured" };
  }

  let token: string | null = null;
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("firebase-token")?.value || null;
    } catch {
      // Ignore
    }
  }

  if (!token) {
    return { authorized: false, error: "No authentication token provided" };
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    return {
      authorized: true,
      user: {
        id: decodedToken.uid,
        email: decodedToken.email,
      },
    };
  } catch (error) {
    return { authorized: false, error: "Invalid or expired authentication token" };
  }
}
