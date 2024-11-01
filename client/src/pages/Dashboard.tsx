import React, { useState } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { getExpenses } from "../services/api";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/Dashboard.module.css";
import { Expense } from "../types/expense";

type TabType = "created" | "payable";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("created");

  const {
    data: expenses,
    isLoading,
    error,
  } = useQuery<Expense[]>("expenses", getExpenses);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading expenses</div>;

  const createdExpenses = expenses?.filter(
    (expense) => expense.creator.id === user?.id
  );
  const payableExpenses = expenses?.filter(
    (expense) => expense.payer.id === user?.id
  );

  const activeExpenses =
    activeTab === "created" ? createdExpenses : payableExpenses;

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>My Expenses</h1>
        <Link to="/expenses/new" className={styles.newButton}>
          Create New Expense
        </Link>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${
            activeTab === "created" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("created")}
        >
          Created by me ({createdExpenses?.length || 0})
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "payable" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("payable")}
        >
          To Pay ({payableExpenses?.length || 0})
        </button>
      </div>

      <div className={styles.expenseList}>
        {activeExpenses?.map((expense) => (
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
              <div>
                <p>Due: {new Date(expense.dueDate).toLocaleDateString()}</p>
                <p className={styles.participant}>
                  {activeTab === "created"
                    ? `Payer: ${expense.payer.name}`
                    : `Created by: ${expense.creator.name}`}
                </p>
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
          </Link>
        ))}
        {activeExpenses?.length === 0 && (
          <div className={styles.emptyState}>
            <p>
              No {activeTab === "created" ? "created" : "payable"} expenses
              found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
