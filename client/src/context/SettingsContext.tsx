import React, { createContext, useContext } from "react";
import { UserSettings } from "../types/settings";
import { useAuth } from "./AuthContext";
import { useUserSettings } from "../hooks/useUserSettings";

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  isLoading: boolean;
}

const defaultSettings: UserSettings = {
  id: 0,
  notifications: {
    newExpenses: true,
    payments: true,
    dueDates: true,
  },
  currency: "USD",
  dateFormat: "MM/DD/YYYY",
  language: "en",
  display: {
    theme: "light",
    compactView: false,
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const {
    settings = defaultSettings,
    updateSettings,
    isLoading,
  } = useUserSettings();

  // Only provide settings context if user is authenticated
  if (!user) {
    return <>{children}</>;
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const { user } = useAuth();
  const context = useContext(SettingsContext);

  if (!user) {
    throw new Error("useSettings must be used with an authenticated user");
  }

  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }

  return context;
};
