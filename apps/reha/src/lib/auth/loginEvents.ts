import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { loginEvents, user } from "@/db/schema";

export async function recordLoginEvent(input: {
  request: Request;
  email: string | null;
  success: boolean;
  reason: string;
}) {
  const ip = input.request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = input.request.headers.get("user-agent")?.slice(0, 300) ?? null;
  let userId: string | null = null;
  if (input.email) {
    const found = await db.select({ id: user.id }).from(user).where(eq(user.email, input.email)).limit(1);
    userId = found[0]?.id ?? null;
  }
  try {
    await db.insert(loginEvents).values({
      userId,
      email: input.email,
      success: input.success,
      reason: input.reason,
      ip,
      userAgent,
    });
  } catch (err) {
    // Protokollierung darf den Login nicht blockieren; Fehler landet im Server-Log ohne Inhalte
    console.error("login_events insert failed", (err as Error).message);
  }
}
