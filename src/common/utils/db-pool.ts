import { Pool } from "pg";
import { DbConfig } from "../configs/app_config";

const pool = new Pool(DbConfig);

export default pool;