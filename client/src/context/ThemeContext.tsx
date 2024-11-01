import React, { createContext, useContext, useEffect } from "react";
import { useUserSettings } from "../hooks/useUserSettings";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { settings, updateSettings } = useUserSettings();

  useEffect(() => {
    console.log("settings", settings);

    // Apply theme to HTML element instead of document
    const theme = settings?.display.theme || "light";
    document.documentElement.setAttribute("data-theme", theme);
  }, [settings?.display.theme]);

  const toggleTheme = () => {
    if (!settings) return;

    const newTheme = settings.display.theme === "light" ? "dark" : "light";
    updateSettings({
      ...settings,
      display: {
        ...settings.display,
        theme: newTheme,
      },
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: settings?.display.theme || "light",
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
