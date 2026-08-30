import { env } from "./config/env";
import { createApp } from "./app";
import { logger } from "./lib/logger";
import { startScheduledJobs } from "./jobs/scheduledJobs";

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`🚀 GadonPay backend démarré sur http://localhost:${env.PORT}`);
  startScheduledJobs();
});
