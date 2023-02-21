module.exports = {
  apps: [
    {
      name: "event-listener-be",
      script: "node dist/main.js",
      instances: "1",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
