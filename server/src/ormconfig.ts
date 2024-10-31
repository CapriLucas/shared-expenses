import { DataSourceOptions } from "typeorm";
import { User } from "./entities/User";
import { Expense } from "./entities/Expense";
import { Payment } from "./entities/Payment";

const config: DataSourceOptions = {
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: [User, Expense, Payment],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
};

export default config;
