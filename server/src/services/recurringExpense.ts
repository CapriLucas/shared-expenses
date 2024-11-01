import { addWeeks, addMonths, addYears, isBefore } from "date-fns";
import { getDataSource } from "../database/context";
import { Expense, RecurrenceType } from "../entities/Expense";
import { Not, IsNull } from "typeorm";

export const processRecurringExpenses = async () => {
  const expenseRepository = getDataSource().getRepository(Expense);

  // Get only parent recurring expenses (those without a parentExpense)
  const recurringExpenses = await expenseRepository.find({
    where: [
      {
        recurrenceType: Not(RecurrenceType.NONE),
        parentExpense: IsNull(),
      },
    ],
    relations: ["creator", "payer"],
  });

  for (const expense of recurringExpenses) {
    await processExpense(expense);
  }
};

const processExpense = async (expense: Expense) => {
  const expenseRepository = getDataSource().getRepository(Expense);
  const now = new Date();

  // Skip if recurrence end date has passed
  if (expense.recurrenceEndDate && isBefore(expense.recurrenceEndDate, now)) {
    return;
  }

  // Get the starting point for new recurrences
  let lastDate = expense.lastRecurrence || expense.dueDate;
  let nextDueDate = getNextDueDate(lastDate, expense.recurrenceType);

  // Create expenses for all missing periods
  while (isBefore(nextDueDate, now)) {
    // Create new expense for this period
    const newExpense = expenseRepository.create({
      description: expense.description,
      amount: expense.amount,
      dueDate: nextDueDate,
      recurrenceType: expense.recurrenceType,
      recurrenceEndDate: expense.recurrenceEndDate,
      creator: expense.creator,
      payer: expense.payer,
      parentExpense: expense,
    });

    await expenseRepository.save(newExpense);

    // Update the last recurrence date
    expense.lastRecurrence = nextDueDate;
    await expenseRepository.save(expense);

    // Calculate next due date
    lastDate = nextDueDate;
    nextDueDate = getNextDueDate(lastDate, expense.recurrenceType);

    // Check if we've reached the end date
    if (
      expense.recurrenceEndDate &&
      isBefore(expense.recurrenceEndDate, nextDueDate)
    ) {
      break;
    }
  }
};

const getNextDueDate = (date: Date, recurrenceType: RecurrenceType): Date => {
  switch (recurrenceType) {
    case RecurrenceType.WEEKLY:
      return addWeeks(date, 1);
    case RecurrenceType.MONTHLY:
      return addMonths(date, 1);
    case RecurrenceType.YEARLY:
      return addYears(date, 1);
    default:
      return date;
  }
};
