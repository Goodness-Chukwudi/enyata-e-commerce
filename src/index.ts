import mongoose from 'mongoose';
import App from "./App";
import {ENVIRONMENTS } from './common/constants/app_constants';
import UserService from './services/UserService';
import Env from './common/configs/environment_config';
import { DbConfig } from './common/configs/app_config';

//Initiate DB connection

mongoose.connect(Env.MONGODB_URI, DbConfig);
mongoose.connection.on('disconnected', () => console.log("DB disconnected"));
mongoose.connection.on('error', err => console.error('Unable to connect to MongoDB via Mongoose\n'+ err));

mongoose.connection.once('open', async () => {
  console.log('Connected to MongoDB via Mongoose');

  //Create app default user on successful connection
  //this is the super admin user
  //This happens only if there's no existing super admin user
  // const userService = new UserService();
  // await userService.createSuperAdmin();

  App.listen(Env.PORT, () => {
    if (Env.ENVIRONMENT == ENVIRONMENTS.DEV) console.log(`Express is listening at http://localhost:${Env.PORT}${Env.API_PATH}`);
  });
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
