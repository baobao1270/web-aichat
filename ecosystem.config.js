module.exports = {
  apps : [{
    name: 'web-aichat',
    script: 'entry.mjs',
    cwd: './dist/server',
    env_production: {
      NODE_ENV: 'production',
      HOST: '127.0.0.1',
      PORT: 3000,
      MONGODB_URI: 'mongodb://localhost:27017/web-aichat',
      JWT_KEY: 'A931CBB0-6C6A-4B23-B52A-1A853F42BAB8',
      OPENAI_API_KEY: 'YOUR_API_KEY_1',
      AZURE_API_KEY: 'YOUR_API_KEY_2',
    },
  }],
};
