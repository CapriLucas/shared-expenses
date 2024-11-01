import React, { useState } from "react";
import { useUserSettings } from "../hooks/useUserSettings";
import { LoadingState } from "./LoadingState";
import styles from "../styles/Settings.module.css";

const Settings: React.FC = () => {
  const { settings, isLoading, updateSettings, isUpdating } = useUserSettings();
  const [saveMessage, setSaveMessage] = useState<string>("");

  const handleNotificationChange =
    (key: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log("key", key);
      console.log("e", e);
      console.log("settings", settings);

      if (!settings) return;

      try {
        await updateSettings({
          ...settings,
          notifications: {
            ...settings.notifications,
            [key]: e.target.checked,
          },
        });
        setSaveMessage("Settings saved successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      } catch (error) {
        setSaveMessage("Failed to save settings. Please try again.");
        setTimeout(() => setSaveMessage(""), 3000);
      }
    };

  const handleDisplayChange =
    (key: string) => async (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (!settings) return;

      try {
        if (key === "theme" || key === "compactView") {
          await updateSettings({
            ...settings,
            display: {
              ...settings.display,
              [key]: e.target.value,
            },
          });
        } else {
          await updateSettings({
            ...settings,
            [key]: e.target.value,
          });
        }

        setSaveMessage("Settings saved successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      } catch (error) {
        setSaveMessage("Failed to save settings. Please try again.");
        setTimeout(() => setSaveMessage(""), 3000);
      }
    };

  if (isLoading) return <LoadingState />;

  return (
    <div className={styles.settingsContainer}>
      {saveMessage && (
        <div
          className={`${styles.message} ${
            saveMessage.includes("Failed") ? styles.error : styles.success
          }`}
        >
          {saveMessage}
        </div>
      )}
      <div className={styles.settingGroup}>
        <h3>Notifications</h3>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={settings?.notifications.newExpenses}
            onChange={handleNotificationChange("newExpenses")}
            disabled={isUpdating}
          />
          Email notifications for new expenses
        </label>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={settings?.notifications.payments}
            onChange={handleNotificationChange("payments")}
            disabled={isUpdating}
          />
          Email notifications for payments
        </label>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={settings?.notifications.dueDates}
            onChange={handleNotificationChange("dueDates")}
            disabled={isUpdating}
          />
          Email notifications for due dates
        </label>
      </div>
      <div className={styles.settingGroup}>
        <h3>Display</h3>
        <label className={styles.select}>
          Currency
          <select
            value={settings?.currency}
            onChange={handleDisplayChange("currency")}
            disabled={isUpdating}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </label>
        <label className={styles.select}>
          Date Format
          <select
            value={settings?.dateFormat}
            onChange={handleDisplayChange("dateFormat")}
            disabled={isUpdating}
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </label>
        <label className={styles.select}>
          Theme
          <select
            value={settings?.display.theme}
            onChange={handleDisplayChange("theme")}
            disabled={isUpdating}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </div>
    </div>
  );
};

export default Settings;
