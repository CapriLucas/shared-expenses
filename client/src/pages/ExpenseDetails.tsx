import React from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { getExpenseById, verifyPayment } from "../services/api";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/ExpenseDetails.module.css";
import PaymentForm from "../components/PaymentForm";
import PaymentList from "../components/PaymentList";
import { useDateFormat } from "../utils/dateFormat";

const ExpenseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { formatDate } = useDateFormat();

  const {
    data: expense,
    isLoading,
    error,
  } = useQuery(["expense", id], () => getExpenseById(id!));

  const verifyPaymentMutation = useMutation(
    ({ paymentId, isVerified }: { paymentId: number; isVerified: boolean }) =>
      verifyPayment(paymentId, isVerified),
    {
      onSuccess: () => {
        // Refetch expense data to update the UI
        queryClient.invalidateQueries(["expense", id]);
      },
    }
  );

  const handleVerifyPayment = (paymentId: number) => {
    verifyPaymentMutation.mutate({ paymentId, isVerified: true });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading expense</div>;
  if (!expense) return <div>Expense not found</div>;

  const isCreator = expense.creator.id === user?.id;
  const isPayer = expense.payer.id === user?.id;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.mainInfo}>
          <h1>{expense.description}</h1>
          <span className={styles.amount}>${expense.amount}</span>
        </div>
        <div className={styles.status}>
          <span
            className={`${styles.statusBadge} ${
              expense.isPaid ? styles.paid : styles.pending
            }`}
          >
            {expense.isPaid ? "Paid" : "Pending"}
          </span>
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.infoCard}>
          <h2>Details</h2>
          <div className={styles.infoGrid}>
            <div>
              <label>Created by</label>
              <p>{expense.creator.name}</p>
            </div>
            <div>
              <label>Payer</label>
              <p>{expense.payer.name}</p>
            </div>
            <div>
              <label>Due Date</label>
              <p>Due Date: {formatDate(expense.dueDate)}</p>
            </div>
            <div>
              <label>Recurrence</label>
              <p>{expense.recurrenceType}</p>
            </div>
            {expense.recurrenceEndDate && (
              <div>
                <label>Recurrence End Date</label>
                <p>
                  Recurrence End Date: {formatDate(expense.recurrenceEndDate)}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.paymentsSection}>
          <h2>Payments</h2>
          {isPayer && !expense.isPaid && <PaymentForm expenseId={expense.id} />}
          <PaymentList
            payments={expense.payments}
            isCreator={isCreator}
            onVerify={handleVerifyPayment}
            isVerifying={verifyPaymentMutation.isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetails;
