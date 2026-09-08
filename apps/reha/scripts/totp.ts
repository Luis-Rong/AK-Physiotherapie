/**
 * `pnpm totp` – gibt den aktuellen Code für den festen Test-TOTP-Schlüssel aus
 * (Praxis-Konto physio@example.test, nur lokal/Staging).
 */
import { seedAccounts, seedTotpSecret } from "@ak-physio/testdata";
import { base32Encode, totpCode, totpSecondsLeft, totpUri } from "./lib/totp";

const account = seedAccounts.find((a) => a.twoFactorSeeded);
if (!account) {
  console.error("Kein Seed-Konto mit twoFactorSeeded.");
  process.exit(1);
}

console.log(`Konto:      ${account.email}`);
console.log(`Code:       ${totpCode(seedTotpSecret)}   (noch ${totpSecondsLeft()} s gültig)`);
console.log(`Schlüssel:  ${base32Encode(seedTotpSecret)}   (für die Authenticator-App)`);
console.log(`URI:        ${totpUri(seedTotpSecret, "AK Physio Reha", account.email)}`);
