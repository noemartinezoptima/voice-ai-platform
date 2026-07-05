import "dotenv/config";
import { createWsServer, getActiveCallCount, getIsShuttingDown, closeAllCalls } from "./ws-server.js";
import { createRedisClient } from "./redis.js";

const PORT = parseInt(process.env.PORT || "9090", 10);
const GRACEFUL_SHUTDOWN_TIMEOUT_MS = parseInt(process.env.GRACEFUL_SHUTDOWN_TIMEOUT_MS || "30000", 10);

async function main() {
  const redis = await createRedisClient();
  const server = createWsServer(redis);

  server.listen(PORT, () => {
    console.log(JSON.stringify({ ts: new Date().toISOString(), msg: `Media Worker listening on port ${PORT}` }));
  });

  const shutdown = (signal: string) => {
    console.log(JSON.stringify({ ts: new Date().toISOString(), msg: `Received ${signal}, shutting down...` }));

    const drainTimer = setTimeout(() => {
      const remaining = getActiveCallCount();
      console.log(JSON.stringify({ ts: new Date().toISOString(), msg: "drain timeout, force closing", remaining }));
      closeAllCalls();
    }, GRACEFUL_SHUTDOWN_TIMEOUT_MS);

    drainTimer.unref();

    server.close(() => {
      const remaining = getActiveCallCount();
      if (remaining > 0) {
        console.log(JSON.stringify({ ts: new Date().toISOString(), msg: "server closed but calls remain", remaining }));
      }

      clearTimeout(drainTimer);

      redis.quit().finally(() => {
        process.exit(0);
      });
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  console.error(JSON.stringify({ ts: new Date().toISOString(), msg: "fatal startup error", error: String(err) }));
  process.exit(1);
});
