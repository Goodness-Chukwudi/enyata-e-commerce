import Env from "./environment_config";

const JoiValidatorOptions = {
    errors: {
      wrap: {
        label: ""
      }
    },
    stripUnknown: true,
    abortEarly: false
};

const DbConfig = {
  host: Env.DB_HOST,
  user: Env.DB_USER,
  password: Env.DB_PASSWORD,
  database: Env.DB_NAME,
  port: Env.DB_PORT,
  max: 2,
  idleTimeoutMillis: 50000,
  connectionTimeoutMillis: 10000
};

export {
  JoiValidatorOptions,
  DbConfig
}