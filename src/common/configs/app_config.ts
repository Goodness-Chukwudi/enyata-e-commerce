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
  host: 'localhost',
  user: 'enyata-user',
  password: 'password',
  database: 'enyata-e-ecommerce',
  max: 1,
  idleTimeoutMillis: 50000,
  connectionTimeoutMillis: 10000,
  port: 5432
};

export {
  JoiValidatorOptions,
  DbConfig
}