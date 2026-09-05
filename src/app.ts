import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger";
import { errorHandler } from "./middleware/errorHandler";

import { authRouter } from "./modules/auth/auth.routes";
import { projectsRouter } from "./modules/projects/projects.routes";
import { providerAccountsRouter } from "./modules/providerAccounts/providerAccounts.routes";
import { gatewaysRouter } from "./modules/gateways/gateways.routes";
import { paymentsRouter } from "./modules/payments/payments.routes";
import { webhooksRouter } from "./modules/webhooks/webhooks.routes";
import { adminRouter } from "./modules/admin/admin.routes";

export function createApp() {
  const app = express();

  // Nécessaire derrière nginx : sans ça, express-rate-limit plante sur X-Forwarded-For
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "256kb" }));
  app.use(pinoHttp({ logger }));

  // Rate limit global — resserré sur /v1/payments dans son propre routeur si besoin
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.get("/health", async (_req, res) => {
    res.json({ ok: true, service: "gadonpay-backend" });
  });

  // ── Dashboard marchand (JWT) ──────────────────────────────────────────
  app.use("/auth", authRouter);
  app.use("/projects", projectsRouter);
  app.use("/provider-accounts", providerAccountsRouter);
  app.use("/gateways", gatewaysRouter); // contient aussi /gateways/ingest (auth par token Gateway)
  app.use("/webhooks", webhooksRouter);

  // ── API publique marchand (X-Gadonpay-Key) ───────────────────────────
  app.use("/v1/payments", paymentsRouter);

  // ── Dashboard admin interne (jamais exposé publiquement en prod : à mettre
  //    derrière un sous-domaine séparé / VPN / IP allowlist) ──────────────
  app.use("/admin", adminRouter);

  app.use(errorHandler);

  return app;
}
