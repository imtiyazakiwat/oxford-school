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
    const { email, fullName, applicationId } = body;

    if (!email || !fullName) {
      return NextResponse.json(
        { error: "Email and full name are required" },
        { status: 400 }
      );
    }

    // Generate temporary password
    const temporaryPassword = generatePassword(8);

    // Create user with Firebase Admin Auth
    const userRecord = await adminAuth.createUser({
      email,
      password: temporaryPassword,
      emailVerified: true,
      displayName: fullName,
    });

    // Set custom claims for role
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role: "student",
      application_id: applicationId,
    });

    return NextResponse.json({
      userId: userRecord.uid,
      email: userRecord.email,
      temporaryPassword,
    });
  } catch (error: unknown) {
    console.error("Error in create-student-user:", error);
    const errMsg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
}
