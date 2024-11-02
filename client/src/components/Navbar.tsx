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
        <Link to="/expenses/new" className={styles.menuItem}>
          New Expense
        </Link>
        <Link to="/quick-split" className={styles.menuItem}>
          Quick Split
        </Link>
        <div className={styles.userInfo}>
          <Link to="/profile" className={styles.profileLink}>
            <img
              src={user.avatarUrl}
              alt={user.name}
              className={styles.avatar}
            />
            <span>{user.name}</span>
          </Link>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
