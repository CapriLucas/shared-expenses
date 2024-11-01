import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/Navbar.module.css";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/">Shared Expenses</Link>
      </div>
      <div className={styles.menu}>
        <Link to="/expenses/new" className={styles.newExpense}>
          New Expense
        </Link>
        <div className={styles.userInfo}>
          <img src={user.avatarUrl} alt={user.name} className={styles.avatar} />
          <span>{user.name}</span>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
