import React from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { getExpenses } from "../services/api";
import styles from "../styles/Dashboard.module.css";
import { Expense } from "../types/expense";

const Dashboard: React.FC = () => {
  const {
    data: expenses,
    isLoading,
    error,
  } = useQuery<Expense[]>("expenses", getExpenses);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading expenses</div>;

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>My Expenses</h1>
        <Link to="/expenses/new" className={styles.newButton}>
          Create New Expense
        </Link>
      </div>
      <div className={styles.expenseList}>
        {expenses?.map((expense: Expense) => (
          <Link
            to={`/expenses/${expense.id}`}
            key={expense.id}
            className={styles.expenseCard}
          >
            <div className={styles.expenseInfo}>
              <h3>{expense.description}</h3>
              <p className={styles.amount}>${expense.amount}</p>
            </div>
            <div className={styles.expenseDetails}>
              <p>Due: {new Date(expense.dueDate).toLocaleDateString()}</p>
              <p>Status: {expense.isPaid ? "Paid" : "Pending"}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
