import { NextRequest, NextResponse } from "next/server";
import { createOTP } from "@/firebase/otpVerification";
import { sendOTPEmail } from "@/utils/emailService";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Create OTP in Firestore
    const { otp, error: otpError } = await createOTP(email);
    if (otpError || !otp) {
      return NextResponse.json(
        { error: otpError || "Failed to generate OTP" },
        { status: 500 }
      );
    }

    // Send OTP via email
    const { success, error: emailError } = await sendOTPEmail(email, otp);
    if (!success) {
      return NextResponse.json(
        { error: emailError || "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email",
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
