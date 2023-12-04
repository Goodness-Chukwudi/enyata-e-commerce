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
  dbName: "mainstack-test",
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 100
};

export {
  JoiValidatorOptions,
  DbConfig
}