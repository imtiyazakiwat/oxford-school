import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  checkRateLimit,
  getClientIP,
  rateLimitResponse,
  RATE_LIMIT_CONFIGS,
} from "@/utils/rateLimit";
import { sanitizeString, sanitizeEmail, sanitizePhone } from "@/utils/sanitize";

// Admin client for operations that need to bypass RLS (duplicate check, insert)
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(
      `application:${clientIP}`,
      RATE_LIMIT_CONFIGS.application
    );

    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult.resetIn);
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "first_name",
      "last_name",
      "date_of_birth",
      "gender",
      "father_name",
      "mother_name",
      "emergency_contact",
      "applying_for_class",
      "academic_year",
      "email",
      "phone",
      "current_address",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Basic email validation
    const sanitizedEmail = sanitizeEmail(body.email);
    if (!sanitizedEmail) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      first_name: sanitizeString(body.first_name).slice(0, 100),
      middle_name: body.middle_name ? sanitizeString(body.middle_name).slice(0, 100) : null,
      last_name: sanitizeString(body.last_name).slice(0, 100),
      father_name: sanitizeString(body.father_name).slice(0, 100),
      mother_name: sanitizeString(body.mother_name).slice(0, 100),
      emergency_contact: sanitizePhone(body.emergency_contact),
      phone: sanitizePhone(body.phone),
      email: sanitizedEmail,
      current_address: sanitizeString(body.current_address).slice(0, 500),
    };

    // Check for duplicate application by email in last 30 days
    // Use admin client for this check since anon can't read other applications
    const adminClient = getAdminClient();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: existingApp } = await adminClient
      .from("applications")
      .select("id")
      .eq("email", sanitizedEmail)
      .gte("created_at", thirtyDaysAgo.toISOString())
      .single();

    if (existingApp) {
      return NextResponse.json(
        { error: "An application with this email was already submitted recently" },
        { status: 409 }
      );
    }

    // Generate application number
    const applicationNumber = `APP-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // Insert application using admin client (anon can insert via RLS but we need consistent behavior)
    const { error } = await adminClient
      .from("applications")
      .insert({
        application_number: applicationNumber,
        first_name: sanitizedData.first_name,
        middle_name: sanitizedData.middle_name,
        last_name: sanitizedData.last_name,
        date_of_birth: body.date_of_birth,
        gender: body.gender,
        blood_group: body.blood_group || null,
        religion: body.religion || null,
        nationality: body.nationality || "Indian",
        // aadhar_encrypted is handled separately via encryption if needed
        photo_url: body.photo_url || null,
        father_name: sanitizedData.father_name,
        father_occupation: body.father_occupation ? sanitizeString(body.father_occupation).slice(0, 100) : null,
        father_phone: body.father_phone ? sanitizePhone(body.father_phone) : null,
        mother_name: sanitizedData.mother_name,
        mother_occupation: body.mother_occupation ? sanitizeString(body.mother_occupation).slice(0, 100) : null,
        mother_phone: body.mother_phone ? sanitizePhone(body.mother_phone) : null,
        emergency_contact: sanitizedData.emergency_contact,
        applying_for_class: body.applying_for_class,
        academic_year: body.academic_year,
        previous_school: body.previous_school ? sanitizeString(body.previous_school).slice(0, 200) : null,
        previous_class: body.previous_class || null,
        previous_percentage: body.previous_percentage || null,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        current_address: sanitizedData.current_address,
        reason_to_join: body.reason_to_join ? sanitizeString(body.reason_to_join).slice(0, 1000) : null,
        medical_conditions: body.medical_conditions ? sanitizeString(body.medical_conditions).slice(0, 500) : null,
        status: "pending",
      });

    if (error) {
      console.error("Application submission error:", error);
      return NextResponse.json(
        { error: "Failed to submit application" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully",
        applicationNumber: applicationNumber,
        remaining: rateLimitResult.remaining,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Application API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
