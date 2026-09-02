import { Card, CardDescription, CardTitle, Alert } from "@/components/ui/card";
import { LoginForm } from "./login-form";

const REASONS: Record<string, string> = {
  abgelaufen:
    "Das temporäre Passwort ist abgelaufen. Bitte lassen Sie sich in der Praxis ein neues geben.",
  abgemeldet: "Sie wurden abgemeldet.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ grund?: string }> }) {
  const { grund } = await searchParams;
  const reason = grund ? REASONS[grund] : undefined;
  return (
    <Card>
      <CardTitle>Anmelden</CardTitle>
      <CardDescription className="mt-1">
        Ihre Zugangsdaten haben Sie von Ihrer Praxis erhalten.
      </CardDescription>
      {reason && (
        <Alert tone="info" className="mt-4">
          {reason}
        </Alert>
      )}
      <LoginForm />
      <p className="mt-6 text-xs text-muted">
        Passwort vergessen? Aus Sicherheitsgründen gibt es keinen Reset-Link per E-Mail. Ihre Praxis
        vergibt Ihnen ein neues temporäres Passwort.
      </p>
    </Card>
  );
}
