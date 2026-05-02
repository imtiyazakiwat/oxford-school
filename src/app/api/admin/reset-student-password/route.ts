import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, isAdminConfigured } from "@/firebase/admin";

// Generate random password
function generatePassword(length: number = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function POST(request: NextRequest) {
  try {
    const adminAuth = getAdminAuth();
    if (!adminAuth || !isAdminConfigured()) {
      return NextResponse.json(
        { error: "Backend not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Generate new temporary password
    const newPassword = generatePassword(8);

    // Update user password with Firebase Admin Auth
    await adminAuth.updateUser(userId, {
      password: newPassword,
    });

    return NextResponse.json({
      success: true,
      newPassword,
    });
  } catch (error: unknown) {
    console.error("Error in reset-student-password:", error);
    const errMsg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
}
