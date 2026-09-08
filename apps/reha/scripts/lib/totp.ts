/**
 * TOTP nach RFC 6238 (HMAC-SHA1, 6 Stellen, 30 s) – identisch zu dem, was better-auth
 * beim Verifizieren rechnet. Eigenständig mit node:crypto, damit `pnpm totp` und
 * `pnpm dev` keinen Auth-/DB-Stack hochfahren müssen.
 * Nur für den festen Test-Schlüssel aus packages/testdata gedacht.
 */
import { createHmac } from "node:crypto";

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/** Base32 (RFC 4648, ohne Padding) – so tragen Authenticator-Apps den Schlüssel ein. */
export function base32Encode(input: string): string {
  const bytes = Buffer.from(input, "utf8");
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31];
  return out;
}

export function totpCode(secret: string, now = Date.now(), period = 30, digits = 6): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(now / 1000 / period)));
  const mac = createHmac("sha1", Buffer.from(secret, "utf8")).update(counter).digest();
  const offset = mac[mac.length - 1]! & 15;
  const code = ((mac[offset]! & 127) << 24) | (mac[offset + 1]! << 16) | (mac[offset + 2]! << 8) | mac[offset + 3]!;
  return String(code % 10 ** digits).padStart(digits, "0");
}

/** Restlaufzeit des aktuellen Codes in Sekunden. */
export function totpSecondsLeft(now = Date.now(), period = 30): number {
  return period - (Math.floor(now / 1000) % period);
}

export function totpUri(secret: string, issuer: string, account: string): string {
  const params = new URLSearchParams({ secret: base32Encode(secret), issuer, digits: "6", period: "30" });
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?${params}`;
}
