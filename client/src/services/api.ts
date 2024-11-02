import axios from "axios";
import { User } from "../types/user";
import { Expense } from "../types/expense";
import { Payment } from "../types/payment";
import { UserSettings } from "../types/settings";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    console.log("API Request:", {
      url: config.url,
      baseURL: config.baseURL,
      method: config.method,
    });
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("API Response Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return Promise.reject(error);
  }
);

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add simple health check
export const checkHealth = async () => {
  try {
    console.log("Checking API health at:", process.env.REACT_APP_API_URL);
    const response = await api.get("/health");
    console.log("Health check response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Health check failed:", error);
    return null;
  }
};

export const searchUsers = async (query: string): Promise<User[]> => {
  const response = await api.get(`/api/users/search?query=${query}`);
  return response.data;
};

export const getExpenses = async (): Promise<Expense[]> => {
  const response = await api.get("/api/expenses");
  return response.data;
};

export const createExpense = async (
  data: Partial<Expense> & { payerId: number }
): Promise<Expense> => {
  const response = await api.post("/api/expenses", data);
  return response.data;
};

export const getExpenseById = async (id: string): Promise<Expense> => {
  const response = await api.get(`/api/expenses/${id}`);
  return response.data;
};

export const createPayment = async (formData: FormData): Promise<Payment> => {
  const response = await api.post("/api/payments", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const verifyPayment = async (
  paymentId: number,
  isVerified: boolean
): Promise<Payment> => {
  const response = await api.patch(`/api/payments/${paymentId}/verify`, {
    isVerified,
  });
  return response.data;
};

export const getExpenseStatistics = async () => {
  const response = await api.get("/api/expenses/statistics");
  return response.data;
};

export const getUserSettings = async () => {
  const response = await api.get("/api/settings");
  return response.data;
};

export const updateUserSettings = async (settings: Partial<UserSettings>) => {
  const response = await api.patch("/api/settings", settings);
  return response.data;
};
