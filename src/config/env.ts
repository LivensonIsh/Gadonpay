import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL est requis"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET doit faire au moins 16 caractères"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  ADMIN_JWT_SECRET: z.string().min(16, "ADMIN_JWT_SECRET doit faire au moins 16 caractères"),
  ADMIN_JWT_EXPIRES_IN: z.string().default("12h"),
  PAYMENT_EXPIRY_MINUTES: z.coerce.number().default(30),
  MATCHING_TIME_WINDOW_MINUTES: z.coerce.number().default(20),
  WEBHOOK_MAX_ATTEMPTS: z.coerce.number().default(6),
  WEBHOOK_TIMEOUT_MS: z.coerce.number().default(8000),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().default("GadonPay <onboarding@resend.dev>"),
  FRONTEND_URL: z.string().default("https://gadonpay.lat"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("❌ Variables d'environnement invalides :", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
