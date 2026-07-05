import "dotenv/config";
import { createWsServer } from "./ws-server.js";
import { createRedisClient } from "./redis.js";
const PORT = parseInt(process.env.PORT || "9090", 10);
async function main() {
    const redis = await createRedisClient();
    const server = createWsServer(redis);
    server.listen(PORT, () => {
        console.log(`Media Worker listening on port ${PORT}`);
    });
    process.on("SIGTERM", () => {
        console.log("Shutting down...");
        server.close();
        redis.quit();
        process.exit(0);
    });
}
main().catch(console.error);
//# sourceMappingURL=index.js.map