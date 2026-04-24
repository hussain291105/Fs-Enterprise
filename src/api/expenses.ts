import axios from "axios";

export interface Expense {
  id?: number;
  item: string;
  qty: number;
  amount: number;
}

const API_URL = "/api/expenses";

// ✅ GET all expenses
export const fetchExpenses = async (): Promise<Expense[]> => {
  const response = await axios.get<Expense[]>(API_URL);
  return response.data;
};

// ✅ CREATE expense
export const createExpense = async (expense: Expense): Promise<Expense> => {
  const response = await axios.post<Expense>(API_URL, expense);
  return response.data;
};

// ✅ UPDATE expense
export const updateExpense = async (id: number, expense: Expense): Promise<Expense> => {
  const response = await axios.put<Expense>(`${API_URL}/${id}`, expense);
  return response.data;
};

// ✅ DELETE expense
export const deleteExpense = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
