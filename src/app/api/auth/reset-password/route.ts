import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, isAdminConfigured } from "@/firebase/admin";
import { verifyOTP } from "@/firebase/otpVerification";

export async function POST(request: NextRequest) {
  try {
    const adminAuth = getAdminAuth();
    if (!adminAuth || !isAdminConfigured()) {
      return NextResponse.json(
        { error: "Backend not configured" },
        { status: 503 }
      );
    }

    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Email, OTP, and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Verify OTP first
    const { success, error: otpError } = await verifyOTP(email, otp);

    if (!success) {
      return NextResponse.json(
        { error: otpError || "Verification failed" },
        { status: 400 }
      );
    }

    // Find user by email using Firebase Admin
    const userRecord = await adminAuth.getUserByEmail(email.toLowerCase());

    if (!userRecord) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    // Update user password with Firebase Admin Auth
    await adminAuth.updateUser(userRecord.uid, {
      password: newPassword,
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
