import { createClient } from 'redis';
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const redisClient = createClient({ url: redisUrl });
redisClient.connect().catch(err => console.error('Redis connect error', err));

export const pushRecentSearch = async (userId: string, query: string) => {
  const key = `recent:${userId}`;
  await redisClient.lPush(key, query);
  await redisClient.lTrim(key, 0, 9); // keep last 10
};

export const getRecentSearches = async (userId: string) => {
  const key = `recent:${userId}`;
  return redisClient.lRange(key, 0, 9);
};
