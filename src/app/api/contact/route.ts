import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  checkRateLimit,
  getClientIP,
  rateLimitResponse,
  RATE_LIMIT_CONFIGS,
} from "@/utils/rateLimit";
import { sanitizeString, sanitizeEmail, sanitizePhone } from "@/utils/sanitize";

// Use anon key with RLS for public submissions
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
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

    // Validate required fields
    if (!full_name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Sanitize and validate email
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Sanitize all inputs
    const sanitizedData = {
      full_name: sanitizeString(full_name).slice(0, 100),
      email: sanitizedEmail,
      phone: phone ? sanitizePhone(phone).slice(0, 20) : null,
      subject: sanitizeString(subject).slice(0, 200),
      message: sanitizeString(message).slice(0, 5000),
    };

    // Validate sanitized data
    if (sanitizedData.full_name.length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    if (sanitizedData.subject.length < 3) {
      return NextResponse.json(
        { error: "Subject must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (sanitizedData.message.length < 10) {
      return NextResponse.json(
        { error: "Message must be at least 10 characters" },
        { status: 400 }
      );
    }

    // Insert into database
    const { data, error } = await supabase
      .from("contact_submissions")
      .insert({
        full_name: sanitizedData.full_name,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        subject: sanitizedData.subject,
        message: sanitizedData.message,
        status: "new",
      })
      .select()
      .single();

    if (error) {
      console.error("Contact submission error:", error);
      return NextResponse.json(
        { error: "Failed to submit contact form" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Contact form submitted successfully",
        remaining: rateLimitResult.remaining,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
