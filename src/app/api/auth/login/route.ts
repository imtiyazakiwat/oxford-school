import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import {
  checkRateLimit,
  getClientIP,
  rateLimitResponse,
  RATE_LIMIT_CONFIGS,
} from "@/utils/rateLimit";
import { logSecurityEvent } from "@/utils/securityLogger";

/**
 * Secure login endpoint with account lockout protection
 * Refactored for Firebase
 */

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get("user-agent") || undefined;

  try {
    const rateLimitResult = checkRateLimit(
      `login:${clientIP}`,
      RATE_LIMIT_CONFIGS.login
    );

    if (!rateLimitResult.success) {
      await logSecurityEvent({
        type: "rate_limit_exceeded",
        ip: clientIP,
        endpoint: "/api/auth/login",
        userAgent,
        details: { resetIn: rateLimitResult.resetIn },
      });
      return rateLimitResponse(rateLimitResult.resetIn);
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const db = getAdminDb();
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

    // Check account lockout status in Firestore
    const lockoutRef = db.collection("account_lockouts").doc(normalizedEmail);
    const lockoutDoc = await lockoutRef.get();
    
    if (lockoutDoc.exists) {
      const data = lockoutDoc.data();
      if (data?.locked_until && data.locked_until.toDate() > new Date()) {
        const minutesRemaining = Math.ceil(
          (data.locked_until.toDate().getTime() - Date.now()) / 60000
        );

        await logSecurityEvent({
          type: "account_locked",
          ip: clientIP,
          email: normalizedEmail,
          endpoint: "/api/auth/login",
          userAgent,
          details: { lockedUntil: data.locked_until.toDate() },
        });

        return NextResponse.json({
          error: `Account temporarily locked. Try again in ${minutesRemaining} minute(s).`,
          locked: true,
          lockedUntil: data.locked_until.toDate().toISOString(),
        }, { status: 423 });
      }
    }

    // Attempt login via Firebase Identity Toolkit REST API
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const authData = await response.json();

    if (!response.ok) {
      // Record failed attempt
      let attempts = 1;
      let isNowLocked = false;
      let lockedUntil = null;

      if (lockoutDoc.exists) {
        attempts = (lockoutDoc.data()?.attempts || 0) + 1;
      }

      if (attempts >= 5) {
        isNowLocked = true;
        const until = new Date();
        until.setMinutes(until.getMinutes() + 15);
        lockedUntil = Timestamp.fromDate(until);
      }

      await lockoutRef.set({
        attempts,
        last_attempt: Timestamp.now(),
        locked_until: lockedUntil,
      }, { merge: true });

      await logSecurityEvent({
        type: "auth_failure",
        ip: clientIP,
        email: normalizedEmail,
        endpoint: "/api/auth/login",
        userAgent,
        details: {
          reason: "invalid_credentials",
          attempts,
        },
      });

      if (isNowLocked) {
        return NextResponse.json({
          error: "Too many failed attempts. Account temporarily locked for 15 minutes.",
          locked: true,
          lockedUntil: lockedUntil?.toDate().toISOString(),
        }, { status: 423 });
      }

      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Successful login - clear lockout
    await lockoutRef.delete();

    await logSecurityEvent({
      type: "auth_success",
      ip: clientIP,
      email: normalizedEmail,
      userId: authData.localId,
      endpoint: "/api/auth/login",
      userAgent,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: authData.localId,
        email: authData.email,
      },
      session: {
        access_token: authData.idToken,
        refresh_token: authData.refreshToken,
        expires_at: Math.floor(Date.now() / 1000) + parseInt(authData.expiresIn),
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    await logSecurityEvent({
      type: "auth_failure",
      ip: clientIP,
      endpoint: "/api/auth/login",
      userAgent,
      details: { error: "internal_error" },
    });

    return NextResponse.json({ error: "An error occurred during login" }, { status: 500 });
  }
}
