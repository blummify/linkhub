import { generateSecret, generateURI, verifySync } from "otplib";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

export function generateTotpSecret(): string {
  return generateSecret({ length: 20 });
}

export function generateOtpAuthUrl(accountName: string, secret: string): string {
  return generateURI({ issuer: "LinkHub", label: accountName, secret });
}

export function verifyTotpCode(secret: string, token: string): boolean {
  try {
    const result = verifySync({ secret, token: token.replace(/\s/g, ""), epochTolerance: 30 });
    return result.valid;
  } catch {
    return false;
  }
}

function getEncKey(): Buffer {
  const hex = process.env.TOTP_ENCRYPTION_KEY ?? "";
  if (hex.length !== 64) throw new Error("TOTP_ENCRYPTION_KEY must be a 64-char hex string (32 bytes)");
  return Buffer.from(hex, "hex");
}

export function encryptTotpSecret(plaintext: string): string {
  const key = getEncKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("hex"), tag.toString("hex"), ct.toString("hex")].join(":");
}

export function decryptTotpSecret(encoded: string): string {
  const parts = encoded.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted TOTP secret format");
  const [ivHex, tagHex, ctHex] = parts;
  const key = getEncKey();
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return decipher.update(Buffer.from(ctHex, "hex")).toString("utf8") + decipher.final("utf8");
}
