import type { Metadata, Viewport } from "next";
import "./globals.css";

/**
 * Nichts vorrendern: Die CSP in src/proxy.ts erlaubt Skripte nur mit der Nonce der
 * jeweiligen Anfrage ('strict-dynamic'). Eine beim Build statisch erzeugte Seite trägt
 * diese Nonce nicht – ihre Skripte würden blockiert und die Seite bliebe ohne Hydration
 * (so passiert bei /2fa). Deshalb ist der gesamte geschützte Bereich dynamisch.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "AK Physio Reha", template: "%s · AK Physio Reha" },
  description: "Rehabilitationstagebuch der Praxis AK Physiotherapie",
  robots: { index: false, follow: false },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#FBF8F3",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
