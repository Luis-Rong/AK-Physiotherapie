import { randomInt } from "node:crypto";

/**
 * Temporäres Passwort (ADR 0005): gut vorlesbar und abschreibbar, ohne
 * verwechselbare Zeichen (0/O, 1/l/I), 12 Zeichen in drei Blöcken.
 * Entropie ≈ 57 Bit; zusammen mit Lockout und 7-Tage-Frist ausreichend.
 */
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

export function generateTempPassword(): string {
  const block = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return `${block()}-${block()}-${block()}`;
}
