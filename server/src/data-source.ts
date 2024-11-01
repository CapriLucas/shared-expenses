import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Expense } from "./entities/Expense";
import { Payment } from "./entities/Payment";
import { UserSettings } from "./entities/UserSettings";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: [User, Expense, Payment, UserSettings],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});
