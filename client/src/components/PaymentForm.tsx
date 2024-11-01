import React, { useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { createPayment } from "../services/api";
import styles from "../styles/PaymentForm.module.css";

interface PaymentFormProps {
  expenseId: number;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ expenseId }) => {
  const [amount, setAmount] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const createPaymentMutation = useMutation(createPayment, {
    onSuccess: () => {
      queryClient.invalidateQueries(["expense", expenseId.toString()]);
      // Reset form
      setAmount("");
      setReceipt(null);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receipt) return;

    const formData = new FormData();
    formData.append("expenseId", expenseId.toString());
    formData.append("amount", amount);
    formData.append("paymentDate", new Date().toISOString());
    formData.append("receipt", receipt);

    createPaymentMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3>Submit Payment</h3>
      <div className={styles.formGroup}>
        <label htmlFor="amount">Amount</label>
        <input
          id="amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="receipt">Receipt</label>
        <input
          id="receipt"
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          onChange={(e) => setReceipt(e.target.files?.[0] || null)}
          required
        />
      </div>

      <button
        type="submit"
        disabled={createPaymentMutation.isLoading}
        className={styles.submitButton}
      >
        {createPaymentMutation.isLoading ? "Submitting..." : "Submit Payment"}
      </button>
    </form>
  );
};

export default PaymentForm;
