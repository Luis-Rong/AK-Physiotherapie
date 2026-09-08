import { redirect } from "next/navigation";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireSessionUser } from "@/lib/auth/session";
import { EnableTwoFactor } from "./enable";

export default async function EnableTwoFactorPage() {
  const { user } = await requireSessionUser();
  if (user.role !== "praxis") redirect("/app");
  if (user.mustChangePassword) redirect("/passwort-aendern");
  if (user.twoFactorEnabled) redirect("/praxis");
  return (
    <Card>
      <CardTitle>Zweiten Faktor einrichten</CardTitle>
      <CardDescription className="mt-1">
        Praxiszugänge sehen Gesundheitsdaten aller Patientinnen und Patienten. Deshalb ist ein zweiter Faktor
        Pflicht. Sie brauchen eine Authenticator-App (z. B. Aegis, FreeOTP, Microsoft oder Google Authenticator).
      </CardDescription>
      <EnableTwoFactor />
    </Card>
  );
}
