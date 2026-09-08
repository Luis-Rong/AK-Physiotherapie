import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth/auth";
import { recordLoginEvent } from "@/lib/auth/loginEvents";

const handler = toNextJsHandler(auth);

export const GET = handler.GET;

/**
 * Anmeldeversuche werden protokolliert, auch Fehlversuche (ADR 0005).
 * Der Body wird geklont, damit better-auth ihn weiterhin lesen kann.
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const isSignIn = url.pathname.endsWith("/sign-in/email");
  const isTotp = url.pathname.endsWith("/two-factor/verify-totp");
  let email: string | null = null;
  if (isSignIn) {
    try {
      const body = (await req.clone().json()) as { email?: string };
      email = typeof body.email === "string" ? body.email.toLowerCase() : null;
    } catch {
      email = null;
    }
  }
  const res = await handler.POST(req);
  if (isSignIn || isTotp) {
    await recordLoginEvent({
      request: req,
      email,
      success: res.ok,
      reason: res.ok ? (isTotp ? "totp" : "password") : `http_${res.status}`,
    });
  }
  return res;
}
