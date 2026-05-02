import crypto from "crypto";

const ENCRYPTION_KEY = process.env.AADHAR_ENCRYPTION_KEY || "temporary-key-at-least-32-chars-long-123456";
const ALGORITHM = "aes-256-cbc";

export async function encryptAadhar(plainAadhar: string): Promise<string | null> {
  if (!plainAadhar) return null;
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv);
    let encrypted = cipher.update(plainAadhar);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
}

export async function decryptAadhar(encryptedAadhar: string): Promise<string | null> {
  if (!encryptedAadhar) return null;
  try {
    const [ivHex, encryptedHex] = encryptedAadhar.split(":");
    if (!ivHex || !encryptedHex) return null;
    const iv = Buffer.from(ivHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
}

export function maskAadhar(aadhar: string | null): string {
  if (!aadhar || aadhar.length < 4) return "N/A";
  return `XXXX-XXXX-${aadhar.slice(-4)}`;
}

export function isValidAadhar(aadhar: string): boolean {
  const cleaned = aadhar.replace(/\D/g, "");
  return cleaned.length === 12;
}

export function formatAadhar(aadhar: string): string {
  const cleaned = aadhar.replace(/\D/g, "");
  if (cleaned.length !== 12) return aadhar;
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}`;
}
