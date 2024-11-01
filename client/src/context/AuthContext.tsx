import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { User, AuthState, AuthContextType } from "../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>(initialState);

  const login = useCallback(async (googleResponse: any) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/google`,
        {
          token: googleResponse.credential,
        }
      );

      const user: User = response.data.user;

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      // Store the access token
      localStorage.setItem("token", response.data.token);

      // Set default Authorization header for future requests
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;
    } catch (error) {
      console.error("Login error:", error);
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  const logout = useCallback(() => {
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
