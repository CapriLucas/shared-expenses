import React from "react";
import styles from "../styles/LoadingState.module.css";

export const LoadingState: React.FC = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>Loading...</p>
    </div>
  );
};
