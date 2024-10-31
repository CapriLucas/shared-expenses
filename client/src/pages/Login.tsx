import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Login.module.css";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (response: any) => {
    await login(response);
    navigate("/");
  };

  const handleError = () => {
    console.error("Login Failed");
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1>Shared Expenses</h1>
        <p>Sign in with your Google account to continue</p>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap
        />
      </div>
    </div>
  );
};

export default Login;
