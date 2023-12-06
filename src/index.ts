import {ENVIRONMENTS } from './common/constants/app_constants';
import Env from './common/configs/environment_config';
import AppUtils from "./common/utils/AppUtils";
import pool from "./common/utils/db-pool";
import App from './App';
import UserService from './services/UserService';

//Initiate DB connection
pool.connect().then(async client => {
  const appUtils = new AppUtils();
  await appUtils.createDbTables(client);

  const userService = new UserService();
  userService.createDefaultAdmin();

  App.listen(Env.PORT, () => {
    if (Env.ENVIRONMENT == ENVIRONMENTS.DEV) console.log(`Express is listening at http://localhost:${Env.PORT}${Env.API_PATH}`);
  });
}).catch(error => {
  console.log(error)
});
  


process.on('unhandledRejection', (reason: string, p: Promise<any>) => {
  console.error('Unhandled Rejection at:\n', p);
  console.log("\n")
  console.error('Reason:\n', reason);
  
  process.exit(1);
  //Restart with pm2 in production
});

process.on('uncaughtException', (error: Error) => {
  console.error(`Uncaught exception:`);
  console.log("\n")
  console.error(error);

  process.exit(1);
  //Restart with pm2 in production
});
