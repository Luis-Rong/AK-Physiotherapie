import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, twoFactor } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";
import { db } from "@/db/client";
import * as schema from "@/db/schema";

/**
 * Auth-Konfiguration (ADR 0005, ADR 0008).
 *
 * - Konten werden ausschließlich über die Praxis-Rolle angelegt (kein Sign-up).
 * - Sessions liegen in Postgres, widerrufbar durch Nutzer und Praxis.
 * - Cookies host-only, Secure, HttpOnly, SameSite=Strict (portal-konzept.md Abschnitt 7).
 * - Zwei-Faktor (TOTP) mit Lockout; Pflicht für die Praxis-Rolle wird im Layout erzwungen.
 * - Kein Mailversand: kein Passwort-Reset-Link, keine E-Mail-Verifikation (ADR 0008).
 * - Keine externen Requests: keine Social-Provider, keine Pwned-Password-Abfrage.
 */
const isProd = process.env.NODE_ENV === "production";

export const ROLES = ["patient", "praxis"] as const;
export type Role = (typeof ROLES)[number];

export const TEMP_PASSWORD_VALIDITY_DAYS = 7;

/** Rollen für das admin-Plugin: praxis darf Konten verwalten, patient nichts davon. */
const ac = createAccessControl(defaultStatements);
const praxisRole = ac.newRole({ ...adminAc.statements });
const patientRole = ac.newRole({});

export const auth = betterAuth({
  appName: "AK Physio Reha",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    requireEmailVerification: false,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    autoSignIn: false,
    revokeSessionsOnPasswordReset: true,
  },
  user: {
    additionalFields: {
      mustChangePassword: { type: "boolean", required: false, defaultValue: true, input: false },
      tempPasswordExpiresAt: { type: "date", required: false, input: false },
      createdById: { type: "string", required: false, input: false },
    },
    changeEmail: { enabled: false },
    deleteUser: { enabled: false },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 14, // 14 Tage
    updateAge: 60 * 60 * 24, // täglich verlängern
    freshAge: 60 * 15,
    cookieCache: { enabled: false },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 30,
    storage: "memory",
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/two-factor/verify-totp": { window: 60, max: 5 },
      "/change-password": { window: 60, max: 5 },
    },
  },
  advanced: {
    useSecureCookies: isProd,
    cookiePrefix: "reha",
    defaultCookieAttributes: {
      sameSite: "strict",
      httpOnly: true,
      secure: isProd,
      path: "/",
    },
  },
  plugins: [
    admin({
      ac,
      roles: { praxis: praxisRole, patient: patientRole },
      defaultRole: "patient",
      adminRoles: ["praxis"],
      bannedUserMessage: "Dieser Zugang ist gesperrt. Bitte wenden Sie sich an Ihre Praxis.",
    }),
    twoFactor({
      issuer: "AK Physio Reha",
      accountLockout: { enabled: true, maxFailedAttempts: 5, durationSeconds: 15 * 60 },
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type SessionUser = Session["user"];
