import React from "react";
import { useQuery } from "react-query";
import { useAuth } from "../context/AuthContext";
import { getExpenseStatistics } from "../services/api";
import Settings from "../components/Settings";
import { LoadingState } from "../components/LoadingState";
import styles from "../styles/UserProfile.module.css";

interface Statistics {
  totalPaid: number;
  totalPending: number;
  totalExpenses: number;
}

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { data: stats, isLoading } = useQuery<Statistics>(
    "expenseStatistics",
    getExpenseStatistics
  );

  if (isLoading) return <LoadingState />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img src={user?.avatarUrl} alt={user?.name} className={styles.avatar} />
        <div className={styles.userInfo}>
          <h1>{user?.name}</h1>
          <p>{user?.email}</p>
        </div>
      </div>

      <div className={styles.statistics}>
        <h2>Statistics</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>${stats?.totalPaid || 0}</span>
            <span className={styles.statLabel}>Total Paid</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              ${stats?.totalPending || 0}
            </span>
            <span className={styles.statLabel}>Total Pending</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {stats?.totalExpenses || 0}
            </span>
            <span className={styles.statLabel}>Total Expenses</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Settings</h2>
        <Settings />
      </div>
    </div>
  );
};

export default UserProfile;
