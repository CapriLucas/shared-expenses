export interface UserSettings {
  id: number;
  notifications: {
    newExpenses: boolean;
    payments: boolean;
    dueDates: boolean;
  };
  currency: string;
  dateFormat: string;
  language: string;
  display: {
    theme: "light" | "dark";
    compactView: boolean;
  };
}
