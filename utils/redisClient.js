const redis = require('redis');

// Create a Redis client
const client = redis.createClient({
  url: 'redis://localhost:6379', // Redis server URL
});

// Handle connection errors
client.on('error', (err) => {
  console.error('Redis error:', err);
});

// Connect to Redis
client.connect()
  .then(() => {
    console.log('Redis client connected');
  })
  .catch((err) => {
    console.error('Failed to connect to Redis:', err);
  });

module.exports = client;