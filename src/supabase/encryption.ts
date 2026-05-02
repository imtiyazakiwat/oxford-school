/**
 * Encryption utilities for sensitive PII data (Aadhar numbers)
 * Uses pgcrypto extension for database-level encryption
 */

import { supabaseAdmin } from "./supabase";

// Encryption key should be stored in Supabase Vault or environment variable
const ENCRYPTION_KEY = process.env.AADHAR_ENCRYPTION_KEY || "";

/**
 * Encrypt an Aadhar number before storing
 * Should only be called from server-side (API routes)
 */
export async function encryptAadhar(plainAadhar: string): Promise<string | null> {
  if (!plainAadhar || !ENCRYPTION_KEY) return null;

  const { data, error } = await supabaseAdmin.rpc("encrypt_aadhar", {
    plain_aadhar: plainAadhar,
    encryption_key: ENCRYPTION_KEY,
  });

  if (error) {
    console.error("Error encrypting Aadhar:", error);
    return null;
  }

  return data;
}

/**
 * Decrypt an Aadhar number (admin only)
 * Should only be called from server-side (API routes)
 */
export async function decryptAadhar(
  encryptedAadhar: string
): Promise<string | null> {
  if (!encryptedAadhar || !ENCRYPTION_KEY) return null;

  const { data, error } = await supabaseAdmin.rpc("decrypt_aadhar", {
    encrypted_aadhar: encryptedAadhar,
    encryption_key: ENCRYPTION_KEY,
  });

  if (error) {
    console.error("Error decrypting Aadhar:", error);
    return null;
  }

  return data;
}

/**
 * Get masked Aadhar (shows only last 4 digits)
 * Safe to use client-side
 */
export function maskAadhar(aadhar: string | null): string {
  if (!aadhar || aadhar.length < 4) return "N/A";
  return `XXXX-XXXX-${aadhar.slice(-4)}`;
}

/**
 * Validate Aadhar number format (12 digits)
 */
export function isValidAadhar(aadhar: string): boolean {
  const cleaned = aadhar.replace(/\D/g, "");
  return cleaned.length === 12;
}

/**
 * Format Aadhar for display (XXXX-XXXX-XXXX)
 */
export function formatAadhar(aadhar: string): string {
  const cleaned = aadhar.replace(/\D/g, "");
  if (cleaned.length !== 12) return aadhar;
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}`;
}
