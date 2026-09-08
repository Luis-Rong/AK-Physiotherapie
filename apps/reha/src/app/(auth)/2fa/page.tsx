import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { TotpForm } from "./totp-form";

export default function TwoFactorPage() {
  return (
    <Card>
      <CardTitle>Zweiter Faktor</CardTitle>
      <CardDescription className="mt-1">
        Geben Sie den sechsstelligen Code aus Ihrer Authenticator-App ein.
      </CardDescription>
      <TotpForm mode="verify" />
    </Card>
  );
}
