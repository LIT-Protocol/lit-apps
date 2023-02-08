export const redisConfig = () => {
  let redis: {
    host: string | any;
    port: number | any;
    password?: string;
  };

  if (process.env.ENV === "dev") {
    redis = {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    };
  } else {
    redis = {
      host: process.env.REDIS_HOST_PROD,
      port: process.env.REDIS_PORT_PROD,
      password: process.env.REDIS_PASSWORD_PROD,
    };
  }

  return redis;
};
