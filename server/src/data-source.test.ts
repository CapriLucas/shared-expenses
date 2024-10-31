import { DataSource } from "typeorm";
import { newDb, IMemoryDb } from "pg-mem";
import { User } from "./entities/User";
import { Expense } from "./entities/Expense";
import { Payment } from "./entities/Payment";
import { Notification } from "./entities/Notification";

export const getTestDataSource = async (): Promise<DataSource> => {
  const db: IMemoryDb = newDb({
    autoCreateForeignKeyIndices: true,
  });

  // Register basic Postgres functions
  db.public.registerFunction({
    name: "current_database",
    implementation: () => "test",
  });

  db.public.registerFunction({
    name: "version",
    implementation: () => "PostgreSQL 14.2",
  });

  // Configure timestamp handling
  db.public.registerFunction({
    name: "now",
    implementation: () => new Date(),
  });

  db.public.interceptQueries((queryText) => {
    if (queryText.search(/(pg_views|pg_matviews|pg_tables|pg_enum)/g) > -1) {
      return [];
    }
    return null;
  });

  // Create the test data source with minimal configuration
  const dataSource = await db.adapters.createTypeormDataSource({
    type: "postgres",
    entities: [User, Expense, Payment, Notification],
    synchronize: true,
    logging: false,
    dropSchema: true,
    entitySkipConstructor: true,
    // Disable features that might cause issues with pg-mem
    enableWAL: false,
    cache: false,
  });

  // Initialize without trying to drop database
  await dataSource.initialize();

  // Manually create schema and required tables
  await dataSource.query(`
    CREATE SCHEMA IF NOT EXISTS public;
    
    -- Override timestamp columns to use timestamptz
    ALTER TABLE "expense" 
    ALTER COLUMN "dueDate" TYPE timestamp with time zone,
    ALTER COLUMN "recurrenceEndDate" TYPE timestamp with time zone,
    ALTER COLUMN "createdAt" TYPE timestamp with time zone,
    ALTER COLUMN "updatedAt" TYPE timestamp with time zone;

    ALTER TABLE "payment"
    ALTER COLUMN "paymentDate" TYPE timestamp with time zone,
    ALTER COLUMN "createdAt" TYPE timestamp with time zone;
  `);

  return dataSource;
};
