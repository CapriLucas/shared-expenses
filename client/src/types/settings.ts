export interface UserSettings {
  notifications: {
    newExpenses: boolean;
    payments: boolean;
    dueDates: boolean;
  };
  display: {
    currency: string;
    dateFormat: string;
  };
}
