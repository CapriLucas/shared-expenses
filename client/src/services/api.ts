import axios from "axios";
import { User } from "../types/user";
import { Expense } from "../types/expense";
import { Payment } from "../types/payment";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
