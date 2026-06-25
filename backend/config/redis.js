const redis = require('redis');

let redisClient = null;
let isRedisConnected = false;

const connectRedis = async () => {
  const redisUrl = process.env.REDIS_URL || '';
  
  if (!redisUrl || redisUrl.includes('YOUR_REDIS_PASSWORD') || redisUrl.includes('localhost')) {
    console.log('Redis cache disabled (REDIS_URL not configured or placeholder detected).');
    isRedisConnected = false;
    return;
  }
  
  redisClient = redis.createClient({
    url: redisUrl,
    socket: {
      connectTimeout: 3000, // Timeout connection after 3 seconds
      reconnectStrategy: (retries) => {
        // Attempt reconnection up to 2 times in serverless to avoid hangs, then stop
        if (retries > 2) {
          console.warn('Redis reconnection stopped: limit reached. Operating in cache-disabled fallback.');
          return false; 
        }
        return 1000; // Wait 1s between attempts
      }
    }
  });

  redisClient.on('error', (err) => {
    console.error(`Redis Client Error: ${err.message}`);
    isRedisConnected = false;
  });

  redisClient.on('connect', () => {
    console.log('Redis connecting...');
  });

  redisClient.on('ready', () => {
    console.log('Redis Client Connected and Ready');
    isRedisConnected = true;
  });

  redisClient.on('end', () => {
    console.log('Redis Connection Closed');
    isRedisConnected = false;
  });

  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Redis failed to connect on startup. Operating in cache-disabled fallback.');
    isRedisConnected = false;
  }
};

const getRedisClient = () => {
  return isRedisConnected ? redisClient : null;
};

const getIsRedisConnected = () => {
  return isRedisConnected;
};

module.exports = {
  connectRedis,
  getRedisClient,
  getIsRedisConnected
};
