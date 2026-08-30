import pino from "pino";
import { env } from "../config/env";

// Pas de transport pino-pretty (worker threads) — fragile sur Termux/Android.
// Sortie JSON brute, lisible avec `| npx pino-pretty` en pipe si besoin plus tard
// sur un environnement qui le supporte correctement (voir package.json: "dev:pretty").
export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
});
