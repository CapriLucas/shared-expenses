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

    const expense = expenseRepository.create({
      description,
      amount,
      dueDate: new Date(dueDate),
      recurrenceType: recurrenceType || RecurrenceType.NONE,
      recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate) : null,
      creator: req.user!,
      payer,
      lastRecurrence: null,
      parentExpense: null,
    });

    await expenseRepository.save(expense);
    return res.status(201).json(expense);
  } catch (error) {
    console.error("Create expense error:", error);
    return res.status(500).json({ error: "Failed to create expense" });
  }
};

export const getExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const expenseRepository = getDataSource().getRepository(Expense);

    const expenses = await expenseRepository.find({
      where: [
        { creator: { id: req.user!.id } },
        { payer: { id: req.user!.id } },
      ],
      relations: {
        creator: true,
        payer: true,
        payments: true,
        parentExpense: true,
      },
      order: {
        createdAt: "DESC",
      },
    });

    return res.json(expenses);
  } catch (error) {
    console.error("Get expenses error:", error);
    return res.status(500).json({ error: "Failed to fetch expenses" });
  }
};

export const getExpenseById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const expenseRepository = getDataSource().getRepository(Expense);

    const expense = await expenseRepository.findOne({
      where: { id: parseInt(id) },
      relations: {
        creator: true,
        payer: true,
        payments: {
          payer: true,
        },
        parentExpense: true,
      },
    });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

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
    const expenseRepository = getDataSource().getRepository(Expense);

    const expense = await expenseRepository.findOne({
      where: { id: parseInt(id) },
      relations: { creator: true },
    });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    if (expense.creator.id !== req.user!.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const deleteRecurring = req.query.deleteRecurring === "true";
    if (deleteRecurring && expense.recurrenceType !== RecurrenceType.NONE) {
      await expenseRepository
        .createQueryBuilder()
        .delete()
        .from(Expense)
        .where("parentExpense = :parentId", { parentId: expense.id })
        .execute();
    }

    await expenseRepository.remove(expense);
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
      .leftJoin("expense.creator", "creator")
      .leftJoin("expense.payer", "payer")
      .select([
        "COALESCE(SUM(CASE WHEN expense.isPaid = true THEN expense.amount ELSE 0 END), 0) as totalpaid",
        "COALESCE(SUM(CASE WHEN expense.isPaid = false THEN expense.amount ELSE 0 END), 0) as totalpending",
        "COUNT(*) as totalexpenses",
      ])
      .where("creator.id = :userId OR payer.id = :userId", {
        userId: req.user!.id,
      })
      .getRawOne();

    const formattedStats = {
      totalPaid: parseFloat(stats.totalpaid) || 0,
      totalPending: parseFloat(stats.totalpending) || 0,
      totalExpenses: parseInt(stats.totalexpenses) || 0,
    };

    return res.json(formattedStats);
  } catch (error) {
    console.error("Get expense statistics error:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch expense statistics" });
  }
};
