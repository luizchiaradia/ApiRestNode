import 'dotenv/config';
import { knex as setupKnex, Knex } from "knex";

export const config: Knex.Config = {
    client: "sqlite",
    connection: {
      filename: process.env.DATABASE_URL
    },
    useNullAsDefault: true,
    migrations: {
      directory: "./db/migrations",
      extension: "ts",
    }
  }

export const knex = setupKnex(config);
