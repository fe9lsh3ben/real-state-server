const { Redis } = require("ioredis");
const redis = new Redis(); // connect to default localhost:6379

// Push latest notification to Redis cache
const cacheNotification = async (Office_ID, Note) => {
    const key = `office:${Office_ID}:notifications`;
    await redis.lpush(key, JSON.stringify(Note)); // add to list
    await redis.ltrim(key, 0, 19);                        // keep only last 20
    await redis.expire(key, 60 * 60 * 24);                // auto-expire in 24h
}

// Get cached notifications
const getCachedNotifications = async (Office_ID) => {
    try {
        const key = `office:${Office_ID}:notifications`;
        const [items, delResult] = await redis.multi()
            .lrange(key, 0, 19)
            .ltrim(key, 20, -1)
            .exec();

        if (items[1].length > 0) {
            return items[1].map(JSON.parse)
        }else{
            return []
        }
        
    }
    catch (error) {
        console.log(error);
    }
}

const setFullNotificationCache = async (Office_ID, notes) => {
    const key = `office:${Office_ID}:notifications`;
    const pipeline = redis.pipeline();
    pipeline.del(key); // Clear old cache
    notes.forEach(note => pipeline.rpush(key, JSON.stringify(note)));
    pipeline.expire(key, 86400);
    await pipeline.exec();
}

// Remove notifications from cache (optional, e.g., if deleted)
const removeCachedNotification = async (Office_ID, Note_ID) => {
    const key = `office:${Office_ID}:notifications`;
    const items = await redis.lrange(key, 0, 19);
    for (let item of items) {
        if (JSON.parse(item).Note_ID === Note_ID) {
            await redis.lrem(key, 0, item);
            break;
        }
    }
}


module.exports = {
    cacheNotification,
    getCachedNotifications,
    setFullNotificationCache,
    removeCachedNotification
}

/**
 * 1- Download Redis for windows from: https://github.com/tporadowski/redis/releases
 * 2- Extract the downloaded file.
 * 3- Run commands in terminal: ' redis-server.exe' at path in which redis-server.exe is exist.

So it starts automatically with Windows:

redis-server.exe --service-install redis.windows.conf --loglevel verbose
redis-server.exe --service-start


Stop service if needed:

redis-server.exe --service-stop


 */