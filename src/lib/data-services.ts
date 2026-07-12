import { Expense, Household, Income, Profile, Student } from "@/types/types";
import { supabase } from "./supabase";

export type StudentInput = {
  name: string;
  notes: string;
  city: string;
  household_id: string | null | undefined;
  arrival_date: string;
  departure_date: string;
  is_active?: boolean;
};

export type ExpenseInput = {
  household_id: string;
  student_id: string;
  amount: number;
  category: string;
  note: string;
  created_by: string;
};

export type IncomeInput = {
  household_id: string;
  student_id: string;
  amount: number;
  created_by: string;
  note: string;
  category: string;
};

export type TransactionEditInput = {
  amount: number;
  category: string;
  note: string;
};

export async function getStudents() {
  const { data, error } = await supabase.from("students").select("*");
  if (error) {
    console.log("Failed to fetch students", error);
    throw new Error("Failed to fetch students", { cause: error });
  }
  return data as Student[];
}

export async function getStudentById(id: String) {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.log("Failed to fetch students", error);
    throw new Error("Failed to fetch students", { cause: error });
  }
  return data as Student;
}

export async function createStudent(input: StudentInput) {
  const { data, error } = await supabase
    .from("students")
    .insert(input)
    .select();

  if (error) {
    console.log("Failed to create student", error);
    throw new Error("Failed to create student", { cause: error });
  }
  return data[0] as Student;
}

export async function updateStudent(id: string, input: StudentInput) {
  const { data, error } = await supabase
    .from("students")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.log("Failed to edit student", error);
    throw new Error("Failed to edit student", { cause: error });
  }
  return data as Student;
}

export async function getHouseholdId(userId: string) {
  const { data, error } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.log("Failed to fetch household membership", error);
    throw new Error("Failed to fetch household membership");
  }
  return (data?.household_id ?? null) as string | null;
}

export async function getHousehold(householdId: string) {
  const { data, error } = await supabase
    .from("households")
    .select("id, name")
    .eq("id", householdId)
    .single();

  if (error) {
    console.log("Failed to fetch household", error);
    throw new Error("Failed to fetch household", { cause: error });
  }
  return data as Household;
}

export async function updateProfile(id: string, username: string) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id, username, updated_at: new Date() })
    .select("id, username, full_name, avatar_url")
    .single();

  if (error) {
    console.log("Failed to update profile", error);
    throw new Error("Failed to update profile", { cause: error });
  }
  return data as Profile;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.log("Failed to fetch profile", error);
    throw new Error("Failed to fetch profile");
  }
  return data as Profile | null;
}

export async function deleteStudent(id: string) {
  const { data, error } = await supabase.from("students").delete().eq("id", id);

  if (error) {
    console.log("Failed to delete student", error);
    throw new Error("Failed to delete student");
  }
}

export async function getExpenses() {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Failed to get expenses", error);
    throw new Error("Failed to get expenses");
  }
  return data as Expense[];
}

export async function createExpense(input: ExpenseInput) {
  const { data, error } = await supabase
    .from("expenses")
    .insert(input)
    .select()
    .single();

  if (error) {
    console.log("Failed to add expense", error);
    throw new Error("Failed to add expense", { cause: error });
  }
  return data as Expense;
}

export async function createExpenses(inputs: ExpenseInput[]) {
  const { data, error } = await supabase
    .from("expenses")
    .insert(inputs)
    .select();

  if (error) {
    console.log("Failed to add expenses", error);
    throw new Error("Failed to add expenses", { cause: error });
  }
  return data as Expense[];
}

export async function updateExpense(id: string, input: TransactionEditInput) {
  const { data, error } = await supabase
    .from("expenses")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.log("Failed to update expense", error);
    throw new Error("Failed to update expense", { cause: error });
  }
  return data as Expense;
}

export async function deleteExpense(id: string) {
  const { error } = await supabase.from("expenses").delete().eq("id", id);

  if (error) {
    console.log("Failed to delete expense", error);
    throw new Error("Failed to delete expense");
  }
}

export async function getIncomeEntries() {
  const { data, error } = await supabase
    .from("income_entries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Failed to get income entries", error);
    throw new Error("Failed to get income entries");
  }
  return data as Income[];
}

export async function createIncome(input: IncomeInput) {
  const { data, error } = await supabase
    .from("income_entries")
    .insert(input)
    .select()
    .single();

  if (error) {
    console.log("Failed to add income entry", error);
    throw new Error("Failed to add income entry", { cause: error });
  }
  return data as Income;
}

export async function createIncomeEntries(inputs: IncomeInput[]) {
  const { data, error } = await supabase
    .from("income_entries")
    .insert(inputs)
    .select();

  if (error) {
    console.log("Failed to add income entries", error);
    throw new Error("Failed to add income entries", { cause: error });
  }
  return data as Income[];
}

export async function updateIncome(id: string, input: TransactionEditInput) {
  const { data, error } = await supabase
    .from("income_entries")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.log("Failed to update income entry", error);
    throw new Error("Failed to update income entry", { cause: error });
  }
  return data as Income;
}

export async function deleteIncome(id: string) {
  const { error } = await supabase.from("income_entries").delete().eq("id", id);

  if (error) {
    console.log("Failed to delete income entry", error);
    throw new Error("Failed to delete income entry");
  }
}
