import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useUser from "./useUser";
import {
  createExpense,
  createExpenses,
  createIncome,
  createIncomeEntries,
  deleteExpense,
  deleteIncome,
  ExpenseInput,
  getExpenses,
  getIncomeEntries,
  IncomeInput,
  TransactionEditInput,
  updateExpense,
  updateIncome,
} from "@/lib/data-services";

export type { ExpenseInput, IncomeInput };

export function useExpenses() {
  const { user } = useUser();
  return useQuery({
    queryKey: ["expenses"],
    queryFn: getExpenses,
    enabled: !!user,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ExpenseInput) => createExpense(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });
}

export function useCreateExpenses() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inputs: ExpenseInput[]) => createExpenses(inputs),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: TransactionEditInput & { id: string }) =>
      updateExpense(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });
}

export function useIncome() {
  const { user } = useUser();
  return useQuery({
    queryKey: ["income_entries"],
    queryFn: getIncomeEntries,
    enabled: !!user,
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: IncomeInput) => createIncome(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["income_entries"] }),
  });
}

export function useCreateIncomeEntries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inputs: IncomeInput[]) => createIncomeEntries(inputs),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["income_entries"] }),
  });
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: TransactionEditInput & { id: string }) =>
      updateIncome(id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["income_entries"] }),
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteIncome(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["income_entries"] }),
  });
}
