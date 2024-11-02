import { Expense } from "../entities/Expense";
import { getDataSource } from "../database/context";
import { UserSettings } from "../entities/UserSettings";

export const sendRecurringExpenseNotification = async (expense: Expense) => {
  const settingsRepository = getDataSource().getRepository(UserSettings);

  // Get payer settings
  const payerSettings = await settingsRepository.findOne({
    where: { user: { id: expense.payer.id } },
  });

  if (payerSettings?.notifications.newExpenses) {
    // Send email notification
    await sendEmail(
      expense.payer.email,
      "New Recurring Expense Created",
      `A new recurring expense "${expense.description}" for $${expense.amount} has been created.`
    );
  }
};

const sendEmail = async (to: string, subject: string, body: string) => {
  // Implement email sending logic here
  // You might want to use a service like SendGrid, AWS SES, etc.
  console.log(`Sending email to ${to}: ${subject}`);
  console.log(body);
};
