import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  checkRateLimit,
  getClientIP,
  rateLimitResponse,
  RATE_LIMIT_CONFIGS,
} from "@/utils/rateLimit";
import { logSecurityEvent } from "@/utils/securityLogger";

/**
 * Secure login endpoint with account lockout protection
 * 
 * SECURITY FEATURES:
 * 1. Rate limiting by IP
 * 2. Account lockout after 5 failed attempts
 * 3. Security event logging
 * 4. Generic error messages to prevent enumeration
 */

// Admin client for lockout operations
function getAdminClient() {
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

// Regular client for auth operations
function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get("user-agent") || undefined;

  try {
    // Rate limiting by IP
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
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const adminClient = getAdminClient();

    // Check account lockout status
    const { data: lockoutData, error: lockoutError } = await adminClient.rpc(
      "check_account_lockout",
      { p_email: normalizedEmail }
    );

    if (!lockoutError && lockoutData && lockoutData.length > 0) {
      const lockout = lockoutData[0];
      if (lockout.is_locked) {
        const lockedUntil = new Date(lockout.locked_until);
        const minutesRemaining = Math.ceil(
          (lockedUntil.getTime() - Date.now()) / 60000
        );

        await logSecurityEvent({
          type: "account_locked",
          ip: clientIP,
          email: normalizedEmail,
          endpoint: "/api/auth/login",
          userAgent,
          details: { lockedUntil: lockout.locked_until },
        });

        return NextResponse.json(
          {
            error: `Account temporarily locked. Try again in ${minutesRemaining} minute(s).`,
            locked: true,
            lockedUntil: lockout.locked_until,
          },
          { status: 423 } // 423 Locked
        );
      }
    }

    // Attempt login
    const anonClient = getAnonClient();
    const { data, error } = await anonClient.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      // Record failed attempt
      const { data: failData } = await adminClient.rpc("record_failed_login", {
        p_email: normalizedEmail,
        p_max_attempts: 5,
        p_lockout_minutes: 15,
      });

      await logSecurityEvent({
        type: "auth_failure",
        ip: clientIP,
        email: normalizedEmail,
        endpoint: "/api/auth/login",
        userAgent,
        details: {
          reason: "invalid_credentials",
          attempts: failData?.[0]?.attempts || 1,
        },
      });

      // Check if account is now locked
      if (failData && failData.length > 0 && failData[0].is_now_locked) {
        return NextResponse.json(
          {
            error: "Too many failed attempts. Account temporarily locked for 15 minutes.",
            locked: true,
            lockedUntil: failData[0].locked_until,
          },
          { status: 423 }
        );
      }

      // Generic error message to prevent enumeration
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Successful login - clear lockout
    await adminClient.rpc("clear_account_lockout", { p_email: normalizedEmail });

    await logSecurityEvent({
      type: "auth_success",
      ip: clientIP,
      email: normalizedEmail,
      userId: data.user?.id,
      endpoint: "/api/auth/login",
      userAgent,
    });

    // Return session data
    return NextResponse.json({
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_at: data.session?.expires_at,
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

    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
