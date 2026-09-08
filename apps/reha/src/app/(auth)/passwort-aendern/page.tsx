import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireSessionUser } from "@/lib/auth/session";
import { PasswordForm } from "./password-form";

export default async function ChangePasswordPage() {
  const { user } = await requireSessionUser();
  return (
    <Card>
      <CardTitle>{user.mustChangePassword ? "Neues Passwort festlegen" : "Passwort ändern"}</CardTitle>
      <CardDescription className="mt-1">
        {user.mustChangePassword
          ? "Das temporäre Passwort aus der Praxis gilt nur für die erste Anmeldung. Bitte wählen Sie jetzt ein eigenes Passwort."
          : "Wählen Sie ein neues Passwort. Andere Geräte werden dabei abgemeldet."}
      </CardDescription>
      <PasswordForm forced={!!user.mustChangePassword} />
    </Card>
  );
}
