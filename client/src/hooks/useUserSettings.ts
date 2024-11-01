import { useQuery, useMutation, useQueryClient } from "react-query";
import { getUserSettings, updateUserSettings } from "../services/api";
import { UserSettings } from "../types/settings";

export const useUserSettings = () => {
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading,
    error,
  } = useQuery<UserSettings>("userSettings", getUserSettings, {
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    onSuccess: (data) => {
      // Store in localStorage as backup
      localStorage.setItem("userSettings", JSON.stringify(data));
    },
    // Use localStorage data while fetching
    placeholderData: () => {
      const cached = localStorage.getItem("userSettings");
      return cached ? JSON.parse(cached) : undefined;
    },
  });

  const updateSettings = useMutation(updateUserSettings, {
    onSuccess: (newSettings) => {
      queryClient.setQueryData("userSettings", newSettings);
      localStorage.setItem("userSettings", JSON.stringify(newSettings));
    },
  });

  return {
    settings,
    isLoading,
    error,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isLoading,
  };
};
