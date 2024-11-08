import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import { ThemeProvider } from "./context/ThemeContext";
import { checkHealth } from "./services/api";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ExpenseForm from "./pages/ExpenseForm";
import ExpenseDetails from "./pages/ExpenseDetails";
import UserProfile from "./pages/UserProfile";
import QuickSplit from "./pages/QuickSplit";
import "./styles/theme.css";

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    // Run health check when app starts
    checkHealth().then((result) => {
      console.log("Initial health check:", result);
    });
  }, []);

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID!}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SettingsProvider>
            <ThemeProvider>
              <Router>
                <div className="app">
                  <Navbar />
                  <main className="main-content">
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route
                        path="/"
                        element={
                          <PrivateRoute>
                            <Dashboard />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <PrivateRoute>
                            <UserProfile />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/expenses/new"
                        element={
                          <PrivateRoute>
                            <ExpenseForm />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/expenses/:id"
                        element={
                          <PrivateRoute>
                            <ExpenseDetails />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/quick-split"
                        element={
                          <PrivateRoute>
                            <QuickSplit />
                          </PrivateRoute>
                        }
                      />
                    </Routes>
                  </main>
                </div>
              </Router>
            </ThemeProvider>
          </SettingsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
