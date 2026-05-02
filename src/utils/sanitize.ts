/**
 * Input sanitization utilities for security
 */

/**
 * Sanitize string input - removes potential XSS vectors
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== "string") return "";
  
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim();
}

/**
 * Sanitize email - validates and normalizes
 * Uses a more comprehensive regex pattern
 */
export function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== "string") return null;
  
  const sanitized = email.toLowerCase().trim();
  
  // More comprehensive email regex
  // Allows: letters, numbers, dots, hyphens, underscores, plus signs in local part
  // Requires: @ symbol, domain with at least one dot, TLD of 2-10 chars
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,10}$/;
  
  // Additional checks
  if (sanitized.length > 254) return null; // RFC 5321 max length
  if (sanitized.split("@")[0]?.length > 64) return null; // Local part max length
  if (sanitized.includes("..")) return null; // No consecutive dots
  
  return emailRegex.test(sanitized) ? sanitized : null;
}

/**
 * Sanitize phone number - keeps only digits and common separators
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== "string") return "";
  
  return phone.replace(/[^\d+\-\s()]/g, "").trim();
}

/**
 * Validate and sanitize UUID
 */
export function sanitizeUUID(uuid: string): string | null {
  if (!uuid || typeof uuid !== "string") return null;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const sanitized = uuid.toLowerCase().trim();
  
  return uuidRegex.test(sanitized) ? sanitized : null;
}

/**
 * Sanitize HTML content - escape special characters
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== "string") return "";
  
  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

/**
 * Validate file name - prevent path traversal
 */
export function sanitizeFileName(fileName: string): string | null {
  if (!fileName || typeof fileName !== "string") return null;
  
  // Remove path traversal attempts
  const sanitized = fileName
    .replace(/\.\./g, "")
    .replace(/[/\\]/g, "")
    .replace(/[<>:"|?*]/g, "")
    .trim();
  
  // Must have valid extension
  const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
  const hasValidExtension = validExtensions.some((ext) =>
    sanitized.toLowerCase().endsWith(ext)
  );
  
  return hasValidExtension && sanitized.length > 0 ? sanitized : null;
}

/**
 * Truncate string to max length safely
 */
export function truncate(str: string, maxLength: number): string {
  if (!str || typeof str !== "string") return "";
  return str.length > maxLength ? str.slice(0, maxLength) : str;
}
