import { format, parse } from "date-fns";
import { useSettings } from "../context/SettingsContext";

export const useDateFormat = () => {
  const { settings } = useSettings();

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    switch (settings.dateFormat) {
      case "DD/MM/YYYY":
        return format(dateObj, "dd/MM/yyyy");
      case "MM/DD/YYYY":
        return format(dateObj, "MM/dd/yyyy");
      case "YYYY-MM-DD":
        return format(dateObj, "yyyy-MM-dd");
      default:
        return format(dateObj, "MM/dd/yyyy"); // Default format
    }
  };

  const parseDate = (dateString: string) => {
    switch (settings.dateFormat) {
      case "DD/MM/YYYY":
        return parse(dateString, "dd/MM/yyyy", new Date());
      case "MM/DD/YYYY":
        return parse(dateString, "MM/dd/yyyy", new Date());
      case "YYYY-MM-DD":
        return parse(dateString, "yyyy-MM-dd", new Date());
      default:
        return parse(dateString, "MM/dd/yyyy", new Date());
    }
  };

  return { formatDate, parseDate };
};
