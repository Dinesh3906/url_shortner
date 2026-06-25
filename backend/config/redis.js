const redis = require('redis');

let redisClient = null;
let isRedisConnected = false;

const connectRedis = async () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  redisClient = redis.createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries) => {
        // Attempt reconnection up to 5 times, then stop to prevent logs flooding
        if (retries > 5) {
          console.warn('Redis reconnection stopped: limit reached. Operating in cache-disabled fallback.');
          return false; // Stop reconnecting
        }
        return Math.min(retries * 500, 2000); // Wait 0.5s, 1s, 1.5s, 2s...
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
