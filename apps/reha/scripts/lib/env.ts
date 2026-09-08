import { config } from "dotenv";
// .env.local hat Vorrang vor .env (wie in Next.js)
config({ path: [".env.local", ".env"], quiet: true });
