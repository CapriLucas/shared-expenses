import { Response } from "express";
import { Payment } from "../entities/Payment";
import { Expense } from "../entities/Expense";
import { AuthRequest } from "../middleware/auth";
import { uploadFile } from "../services/storage";
import { getDataSource } from "../database/context";

export const createPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { expenseId, amount, paymentDate } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Receipt file is required" });
    }

    const paymentRepository = getDataSource().getRepository(Payment);
    const expenseRepository = getDataSource().getRepository(Expense);

    // Upload file to Google Cloud Storage
    const fileUrl = await uploadFile(file);

    // Find expense
    const expense = await expenseRepository.findOne({
      where: { id: parseInt(expenseId) },
      relations: { payer: true },
    });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    // Verify user is the payer
    if (expense.payer.id !== req.user!.id) {
      return res
        .status(403)
        .json({ error: "Only the payer can submit payments" });
    }

    const payment = new Payment();
    payment.expense = expense;
    payment.payer = req.user!;
    payment.amount = parseFloat(amount);
    payment.paymentDate = new Date(paymentDate);
    payment.receiptUrl = fileUrl;
    payment.createdAt = new Date();

    await paymentRepository.save(payment);

    // Check if payment completes the expense
    if (payment.amount >= expense.amount) {
      expense.isPaid = true;
      await expenseRepository.save(expense);
    }

    return res.status(201).json(payment);
  } catch (error) {
    console.error("Create payment error:", error);
    return res.status(500).json({ error: "Failed to create payment" });
  }
};

export const getPayments = async (req: AuthRequest, res: Response) => {
  try {
    const payments = await getDataSource()
      .getRepository(Payment)
      .find({
        where: [
          { payer: { id: req.user!.id } },
          { expense: { creator: { id: req.user!.id } } },
        ],
        relations: {
          expense: {
            creator: true,
          },
          payer: true,
        },
        order: {
          createdAt: "DESC",
        },
      });

    res.json(payments);
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
};

export const getPaymentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const payment = await getDataSource()
      .getRepository(Payment)
      .findOne({
        where: { id: parseInt(id) },
        relations: {
          expense: {
            creator: true,
          },
          payer: true,
        },
      });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Check if user has access to this payment
    if (
      payment.payer.id !== req.user!.id &&
      payment.expense.creator.id !== req.user!.id
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    return res.json(payment);
  } catch (error) {
    console.error("Get payment error:", error);
    return res.status(500).json({ error: "Failed to fetch payment" });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const payment = await getDataSource()
      .getRepository(Payment)
      .findOne({
        where: { id: parseInt(id) },
        relations: {
          expense: {
            creator: true,
          },
        },
      });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Only expense creator can verify payments
    if (payment.expense.creator.id !== req.user!.id) {
      return res
        .status(403)
        .json({ error: "Only the expense creator can verify payments" });
    }

    payment.isVerified = isVerified;
    await getDataSource().getRepository(Payment).save(payment);

    return res.json(payment);
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({ error: "Failed to verify payment" });
  }
};
