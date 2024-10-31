import { Response } from "express";
import { Expense, RecurrenceType } from "../entities/Expense";
import { User } from "../entities/User";
import { AuthRequest } from "../middleware/auth";
import { getDataSource } from "../database/context";

export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    const {
      description,
      amount,
      dueDate,
      recurrenceType,
      recurrenceEndDate,
      payerId,
    } = req.body;

    const expenseRepository = getDataSource().getRepository(Expense);
    const userRepository = getDataSource().getRepository(User);

    const payer = await userRepository.findOneBy({ id: payerId });
    if (!payer) {
      return res.status(404).json({ error: "Payer not found" });
    }

    const expense = new Expense();
    expense.description = description;
    expense.amount = amount;
    expense.dueDate = new Date(dueDate);
    expense.recurrenceType = recurrenceType || RecurrenceType.NONE;
    expense.recurrenceEndDate = recurrenceEndDate
      ? new Date(recurrenceEndDate)
      : null;
    expense.creator = req.user!;
    expense.payer = payer;
    expense.createdAt = new Date();
    expense.updatedAt = new Date();

    await expenseRepository.save(expense);
    return res.status(201).json(expense);
  } catch (error) {
    console.error("Create expense error:", error);
    return res.status(500).json({ error: "Failed to create expense" });
  }
};

export const getExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const expenses = await getDataSource()
      .getRepository(Expense)
      .find({
        where: [
          { creator: { id: req.user!.id } },
          { payer: { id: req.user!.id } },
        ],
        relations: {
          creator: true,
          payer: true,
          payments: true,
        },
        order: {
          createdAt: "DESC",
        },
      });

    res.json(expenses);
  } catch (error) {
    console.error("Get expenses error:", error);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
};

export const getExpenseById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const expense = await getDataSource()
      .getRepository(Expense)
      .findOne({
        where: { id: parseInt(id) },
        relations: {
          creator: true,
          payer: true,
          payments: {
            payer: true,
          },
        },
      });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    // Check if user has access to this expense
    if (
      expense.creator.id !== req.user!.id &&
      expense.payer.id !== req.user!.id
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    return res.json(expense);
  } catch (error) {
    console.error("Get expense error:", error);
    return res.status(500).json({ error: "Failed to fetch expense" });
  }
};

export const updateExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const expense = await getDataSource()
      .getRepository(Expense)
      .findOne({
        where: { id: parseInt(id) },
        relations: { creator: true },
      });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    if (expense.creator.id !== req.user!.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    getDataSource()
      .getRepository(Expense)
      .merge(expense, {
        ...updates,
        updatedAt: new Date(),
      });

    await getDataSource().getRepository(Expense).save(expense);
    return res.json(expense);
  } catch (error) {
    console.error("Update expense error:", error);
    return res.status(500).json({ error: "Failed to update expense" });
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const expense = await getDataSource()
      .getRepository(Expense)
      .findOne({
        where: { id: parseInt(id) },
        relations: { creator: true },
      });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    // Only creator can delete the expense
    if (expense.creator.id !== req.user!.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    await getDataSource().getRepository(Expense).remove(expense);
    return res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Delete expense error:", error);
    return res.status(500).json({ error: "Failed to delete expense" });
  }
};

export const getExpenseStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await getDataSource()
      .getRepository(Expense)
      .createQueryBuilder("expense")
      .select([
        "SUM(CASE WHEN expense.isPaid = true THEN expense.amount ELSE 0 END)",
        "totalPaid",
        "SUM(CASE WHEN expense.isPaid = false THEN expense.amount ELSE 0 END)",
        "totalPending",
        "COUNT(*)",
        "totalExpenses",
      ])
      .where("expense.creator.id = :userId OR expense.payer.id = :userId", {
        userId: req.user!.id,
      })
      .getRawOne();

    return res.json(stats);
  } catch (error) {
    console.error("Get expense statistics error:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch expense statistics" });
  }
};
