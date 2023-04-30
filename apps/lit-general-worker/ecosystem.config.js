module.exports = {
  apps: [
    {
      name: "lit-general-worker",
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
