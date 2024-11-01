import React from "react";
import { useQuery } from "react-query";
import { useAuth } from "../context/AuthContext";
import { getExpenseStatistics } from "../services/api";
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

  if (isLoading) return <div>Loading...</div>;

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

      <div className={styles.settings}>
        <h2>Settings</h2>
        <div className={styles.settingsForm}>
          <div className={styles.settingGroup}>
            <h3>Notifications</h3>
            <label className={styles.checkbox}>
              <input type="checkbox" defaultChecked />
              Email notifications for new expenses
            </label>
            <label className={styles.checkbox}>
              <input type="checkbox" defaultChecked />
              Email notifications for payments
            </label>
            <label className={styles.checkbox}>
              <input type="checkbox" defaultChecked />
              Email notifications for due dates
            </label>
          </div>

          <div className={styles.settingGroup}>
            <h3>Display</h3>
            <label className={styles.select}>
              Currency
              <select defaultValue="USD">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </label>
            <label className={styles.select}>
              Date Format
              <select defaultValue="MM/DD/YYYY">
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
