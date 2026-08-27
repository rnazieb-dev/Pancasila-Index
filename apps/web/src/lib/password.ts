import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

/**
 * Utilitas hashing dan verifikasi kata sandi yang aman berbasis crypto.scrypt bawaan Node.js.
 * Tanpa dependensi biner tambahan (seperti bcrypt/argon2 yang butuh node-gyp), sangat portabel dan aman.
 */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, key] = combinedHash.split(":");
    if (!salt || !key) return false;

    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = scryptSync(password, salt, 64);

    return timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}
