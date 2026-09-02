import { NextResponse, type NextRequest } from "next/server";

/**
 * Zwei Aufgaben am Rand jeder Anfrage:
 *
 * 1. Content-Security-Policy mit Nonce (ADR 0003): Next.js braucht Inline-Skripte
 *    für Hydration; statt 'unsafe-inline' bekommt jede Antwort eine frische Nonce,
 *    die Next automatisch an seine Skripte hängt. Externe Quellen bleiben verboten.
 *    Im Dev-Modus braucht Turbopack zusätzlich 'unsafe-eval' für HMR.
 *
 * 2. Grobe Weiche: ohne Sitzungscookie kein Zugriff auf /app und /praxis. Die
 *    eigentliche Prüfung (Rolle, Passwortwechsel, 2FA, Einwilligung) läuft
 *    serverseitig in den Layouts über requireViewer().
 */
const SESSION_COOKIES = ["reha.session_token", "__Secure-reha.session_token"];
const isDev = process.env.NODE_ENV !== "production";

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = SESSION_COOKIES.some((c) => req.cookies.has(c));
  const protectedArea = pathname.startsWith("/app") || pathname.startsWith("/praxis");

  if (protectedArea && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  if (pathname === "/login" && hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/app";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("base64");
  const csp = buildCsp(nonce);
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("Content-Security-Policy", csp);
  return res;
}

export const config = {
  matcher: [
    // alles außer statischen Assets; API-Antworten bekommen die CSP ebenfalls (schadet nicht)
    "/((?!_next/static|_next/image|fonts/|icon.svg|robots.txt).*)",
  ],
};
