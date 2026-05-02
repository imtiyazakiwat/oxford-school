import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import {
  checkRateLimit,
  getClientIP,
  rateLimitResponse,
  RATE_LIMIT_CONFIGS,
} from "@/utils/rateLimit";
import { sanitizeString, sanitizeEmail, sanitizePhone } from "@/utils/sanitize";

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(
      `contact:${clientIP}`,
      RATE_LIMIT_CONFIGS.contactForm
    );

    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult.resetIn);
    }

    const body = await request.json();
    const { full_name, email, phone, subject, message } = body;

    if (!full_name || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const sanitizedData = {
      full_name: sanitizeString(full_name).slice(0, 100),
      email: sanitizedEmail,
      phone: phone ? sanitizePhone(phone).slice(0, 20) : null,
      subject: sanitizeString(subject).slice(0, 200),
      message: sanitizeString(message).slice(0, 5000),
    };

    if (sanitizedData.full_name.length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    }

    const db = getAdminDb();
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

    await db.collection("contact_submissions").add({
      full_name: sanitizedData.full_name,
      email: sanitizedData.email,
      phone: sanitizedData.phone,
      subject: sanitizedData.subject,
      message: sanitizedData.message,
      status: "new",
      created_at: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      message: "Contact form submitted successfully",
      remaining: rateLimitResult.remaining,
    }, { status: 201 });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
