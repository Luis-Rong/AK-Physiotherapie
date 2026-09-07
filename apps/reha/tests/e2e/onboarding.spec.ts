import { expect, test, type Page } from "@playwright/test";
import { seedTotpSecret } from "@ak-physio/testdata";
import { totpCode } from "../../scripts/lib/totp";

/**
 * Der Weg aus ADR 0005 und der Plan-Verifikation:
 * temporäres Passwort → erzwungener Wechsel → Einwilligung → Portal → Eintrag mit
 * Ampel. Dazu: keine externen Requests (ADR 0003) und CSP-Header.
 */

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("E-Mail-Adresse").fill(email);
  await page.getByLabel("Passwort", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Anmelden" }).click();
}

test("Onboarding mit temporärem Passwort bis zum ersten Tagebucheintrag", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (req) => {
    const url = new URL(req.url());
    if (url.host !== "localhost:3100") external.push(req.url());
  });

  await login(page, "jonas@example.test", "temp-jonas-1234");
  await expect(page).toHaveURL(/\/passwort-aendern/);
  await page.getByLabel("Temporäres Passwort").fill("temp-jonas-1234");
  await page.getByLabel("Neues Passwort", { exact: true }).fill("jonas-neues-passwort-2026");
  await page.getByLabel("Neues Passwort wiederholen").fill("jonas-neues-passwort-2026");
  await page.getByRole("button", { name: "Passwort speichern" }).click();

  await expect(page).toHaveURL(/\/einwilligung/);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Zustimmen und weiter" }).click();

  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole("heading", { name: /Guten (Morgen|Tag|Abend), Jonas/ })).toBeVisible();

  // Eintrag ohne Plan: nur Schmerzwerte
  await page.goto("/app/tagebuch/eintrag");
  await page.getByRole("group", { name: /Während der Übungen/ }).getByRole("button", { name: "7", exact: true }).click();
  await page.getByRole("group", { name: /^Danach/ }).getByRole("button", { name: "3", exact: true }).click();
  await page.getByLabel("Was ist Ihnen aufgefallen?").fill("erster Eintrag");
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page).toHaveURL(/\/app\/tagebuch$/);
  // Werte erscheinen in der Liste (Punkt) und ggf. als Ampel („Zuletzt") – mindestens einmal sichtbar
  await expect(page.getByLabel(/Schmerz 7 von 10, Stufe Rot/).first()).toBeVisible();
  await expect(page.getByLabel(/Schmerz 3 von 10, Stufe Grün/).first()).toBeVisible();

  expect(external, "Alle Requests müssen same-origin sein (ADR 0003)").toEqual([]);
});

test("Sicherheits-Header und CSP ohne unsafe-inline für Skripte", async ({ request }) => {
  const res = await request.get("/login");
  const csp = res.headers()["content-security-policy"] ?? "";
  expect(csp).toContain("default-src 'self'");
  expect(csp).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/);
  expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
  expect(csp).toContain("frame-ancestors 'none'");
  expect(res.headers()["x-frame-options"]).toBe("DENY");
  expect(res.headers()["referrer-policy"]).toBe("no-referrer");
});

test("Falsches Passwort wird abgewiesen und protokolliert, Patient kommt nicht in die Praxis", async ({ page }) => {
  await login(page, "mara@example.test", "falsch-falsch-falsch");
  await expect(page.getByText("nicht korrekt")).toBeVisible();

  await login(page, "mara@example.test", "mara-test-passwort");
  await expect(page).toHaveURL(/\/app$/);
  await page.goto("/praxis");
  await expect(page).toHaveURL(/\/app$/);
});

test("Praxis ohne zweiten Faktor wird zur Einrichtung gezwungen", async ({ page }) => {
  await login(page, "praxis-neu@example.test", "praxis-neu-test-passwort");
  await expect(page).toHaveURL(/\/2fa-einrichten/);
  await page.goto("/praxis");
  await expect(page).toHaveURL(/\/2fa-einrichten/);
});

test("Praxis mit zweitem Faktor: Passwort, dann TOTP-Code, dann Praxisbereich", async ({ page }) => {
  // Nur ein Login: /sign-in/email ist auf 5 Versuche pro Minute begrenzt (suite-weit).
  await login(page, "physio@example.test", "physio-test-passwort");
  await expect(page).toHaveURL(/\/2fa$/);
  // Ohne Code keine Sitzung: Praxisbereich bleibt zu
  await page.goto("/praxis");
  await expect(page).toHaveURL(/\/login/);
  await page.goto("/2fa");
  // Nach dem Vollreload erst hydrieren lassen, sonst landet der Wert nur im DOM, nicht im State
  await page.waitForLoadState("networkidle");
  const confirm = page.getByRole("button", { name: "Bestätigen" });
  await page.getByLabel("Code").fill("000000");
  await expect(confirm).toBeEnabled();
  await confirm.click();
  await expect(page.getByText("nicht gültig")).toBeVisible();

  await page.getByLabel("Code").fill(totpCode(seedTotpSecret));
  await expect(confirm).toBeEnabled();
  await confirm.click();
  await expect(page).toHaveURL(/\/praxis/);
});
