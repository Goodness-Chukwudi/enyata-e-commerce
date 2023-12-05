import App, {appInstance} from "./App";
import {ENVIRONMENTS } from './common/constants/app_constants';
import UserService from './services/UserService';
import Env from './common/configs/environment_config';
import { DbConfig } from './common/configs/app_config';
import { Pool } from 'pg';
import User, { user_table } from "./models/user";

//Initiate DB connection
const pool = new Pool(DbConfig);

pool.connect().then(async client => {
  appInstance.setDbClient(client);

  const createTableText = `
CREATE TABLE IF NOT EXISTS book(
  id SERIAL PRIMARY KEY,
  name VARCHAR (50),
  author VARCHAR (50),
  amount INT NOT NULL,
  sold_out BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS app_user(
  id SERIAL PRIMARY KEY,
  name VARCHAR (50) NOT NULL,
  email VARCHAR (50) NOT NULL,
  age INT NOT NULL,
  married BOOLEAN DEFAULT false
);
`
// create our temp table
await client.query(createTableText)

// console.log(res.rows)

  //Create app default user on successful connection
  //this is the super admin user
  //This happens only if there's no existing super admin user
  const userService = new UserService();

  const userData = {
    name: "John Doe",
    email: "johndoe@gmail.com",
    age: 23,
    married: false
  }

  const bookData = {
    name: "Peter Obi",
    author: "Emeka",
    amount: 5000,
    sold_out: true
  }

  const transData = [
    {
      name: user_table,
      data: userData
    },
    {
      name: "book",
      data: bookData
    },
]

  const res = await userService.updateOne({name: "John Emeka Doe"}, "id=2 AND email='johndoe@gmail.com'");

  console.log(res)

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
