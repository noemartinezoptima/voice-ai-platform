import { createClient } from "redis";
let client;
export async function createRedisClient() {
    if (client)
        return client;
    const url = process.env.REDIS_URL || "redis://localhost:6379";
    client = createClient({ url });
    client.on("error", (err) => console.error("Redis error:", err));
    await client.connect();
    console.log("Redis connected");
    return client;
}
//# sourceMappingURL=redis.js.map