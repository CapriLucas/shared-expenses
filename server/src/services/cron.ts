import cron from "node-cron";
import { processRecurringExpenses } from "./recurringExpense";

export const initializeCronJobs = () => {
  // Run every day at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("Running recurring expense processor...");
    try {
      await processRecurringExpenses();
      console.log("Recurring expense processor completed successfully");
    } catch (error) {
      console.error("Error processing recurring expenses:", error);
    }
  });
};
