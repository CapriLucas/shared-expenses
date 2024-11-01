import React, { createContext, useContext, useState } from "react";
import { UserSettings } from "../types/settings";
import { useAuth } from "./AuthContext";

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
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
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  // Only provide settings context if user is authenticated
  if (!user) {
    return <>{children}</>;
  }

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
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
