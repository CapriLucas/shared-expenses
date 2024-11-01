import React from "react";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { createExpense, searchUsers } from "../services/api";
import { RecurrenceType } from "../types/expense";
import { User } from "../types/user";
import styles from "../styles/ExpenseForm.module.css";

const ExpenseForm: React.FC = () => {
  const navigate = useNavigate();
  const [description, setDescription] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [recurrenceType, setRecurrenceType] = React.useState<RecurrenceType>(
    RecurrenceType.NONE
  );
  const [recurrenceEndDate, setRecurrenceEndDate] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedPayer, setSelectedPayer] = React.useState<User | null>(null);

  const { data: users } = useQuery<User[]>(
    ["users", searchQuery],
    () => searchUsers(searchQuery),
    {
      enabled: searchQuery.length > 2,
    }
  );

  const createExpenseMutation = useMutation(createExpense, {
    onSuccess: () => {
      navigate("/");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayer) return;

    createExpenseMutation.mutate({
      description,
      amount: parseFloat(amount),
      dueDate,
      recurrenceType,
      recurrenceEndDate: recurrenceEndDate || null,
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
            <label htmlFor="recurrenceEndDate">Recurrence End Date</label>
            <input
              id="recurrenceEndDate"
              type="date"
              value={recurrenceEndDate}
              onChange={(e) => setRecurrenceEndDate(e.target.value)}
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
          {users && (
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
