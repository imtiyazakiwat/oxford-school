import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, isAdminConfigured } from "@/firebase/admin";
import { verifyOTP } from "@/firebase/otpVerification";

export async function POST(request: NextRequest) {
  try {
    const { email, otp, userId } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const { success, error } = await verifyOTP(email, otp);

    if (!success) {
      return NextResponse.json(
        { error: error || "Verification failed" },
        { status: 400 }
      );
    }

    // If userId is provided, mark the user's email as verified
    if (userId) {
      try {
        const adminAuth = getAdminAuth();
        if (adminAuth && isAdminConfigured()) {
          await adminAuth.updateUser(userId, {
            emailVerified: true,
          });
        }
      } catch (adminError) {
        console.error("Failed to confirm email:", adminError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
