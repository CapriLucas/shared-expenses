import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { createExpense, searchUsers } from "../services/api";
import { RecurrenceType } from "../types/expense";
import { User } from "../types/user";
import { useDateFormat } from "../utils/dateFormat";
import styles from "../styles/ExpenseForm.module.css";

const ExpenseForm: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { parseDate } = useDateFormat();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(
    RecurrenceType.NONE
  );
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayer, setSelectedPayer] = useState<User | null>(null);

  const { data: users } = useQuery(
    ["users", searchQuery],
    () => searchUsers(searchQuery),
    {
      enabled: searchQuery.length > 2,
    }
  );

  const createExpenseMutation = useMutation(createExpense, {
    onSuccess: () => {
      queryClient.invalidateQueries("expenses");
      navigate("/");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayer) return;

    createExpenseMutation.mutate({
      description,
      amount: parseFloat(amount),
      dueDate: parseDate(dueDate).toISOString(),
      recurrenceType,
      recurrenceEndDate: recurrenceEndDate
        ? parseDate(recurrenceEndDate).toISOString()
        : null,
      payerId: selectedPayer.id,
    });
  };

  return (
    <div className={styles.formContainer}>
      <h1>Create New Expense</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

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
          <label htmlFor="dueDate">Due Date</label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="recurrenceType">Recurrence</label>
          <select
            id="recurrenceType"
            value={recurrenceType}
            onChange={(e) =>
              setRecurrenceType(e.target.value as RecurrenceType)
            }
          >
            <option value={RecurrenceType.NONE}>None</option>
            <option value={RecurrenceType.WEEKLY}>Weekly</option>
            <option value={RecurrenceType.MONTHLY}>Monthly</option>
            <option value={RecurrenceType.YEARLY}>Yearly</option>
          </select>
        </div>

        {recurrenceType !== RecurrenceType.NONE && (
          <div className={styles.formGroup}>
            <label htmlFor="recurrenceEndDate">
              Recurrence End Date (Optional)
            </label>
            <input
              id="recurrenceEndDate"
              type="date"
              value={recurrenceEndDate}
              onChange={(e) => setRecurrenceEndDate(e.target.value)}
              min={dueDate}
            />
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="payer">Payer</label>
          <input
            id="payer"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
          />
          {users && users.length > 0 && (
            <div className={styles.userList}>
              {users.map((user) => (
                <div
                  key={user.id}
                  className={styles.userItem}
                  onClick={() => {
                    setSelectedPayer(user);
                    setSearchQuery(user.name);
                  }}
                >
                  <img src={user.avatarUrl} alt={user.name} />
                  <span>{user.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={createExpenseMutation.isLoading}
          className={styles.submitButton}
        >
          {createExpenseMutation.isLoading ? "Creating..." : "Create Expense"}
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
