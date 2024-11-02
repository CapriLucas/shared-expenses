import React, { useEffect } from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { QueryClient } from "react-query";
// import { GoogleOAuthProvider } from "@react-oauth/google";
// import { AuthProvider } from "./context/AuthContext";
// import { SettingsProvider } from "./context/SettingsContext";
// import { ThemeProvider } from "./context/ThemeContext";
import { checkHealth } from "./services/api";
// import PrivateRoute from "./components/PrivateRoute";
// import Navbar from "./components/Navbar";
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import ExpenseForm from "./pages/ExpenseForm";
// import ExpenseDetails from "./pages/ExpenseDetails";
// import UserProfile from "./pages/UserProfile";
// import QuickSplit from "./pages/QuickSplit";
import "./styles/theme.css";

// const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    // Run health check when app starts
    checkHealth().then((result) => {
      console.log("Initial health check:", result);
    });
  }, []);

  return <h1>g</h1>;
}

export default App;
