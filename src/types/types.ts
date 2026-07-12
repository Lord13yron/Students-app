export type Household = {
  id: string;
  name: string;
};

export type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

export type Student = {
  id: string;
  created_at: string;
  household_id: string;
  name: string;
  city: string;
  notes: string;
  arrival_date: string;
  departure_date: string;
  is_active: boolean;
};

export type Expense = {
  id: string;
  household_id: string;
  student_id: string;
  amount: number;
  category: string;
  note: string;
  created_by: string;
  created_at: string;
};

export type Income = {
  id: string;
  household_id: string;
  student_id: string;
  amount: number;
  created_by: string;
  created_at: string;
  note: string;
  category: string;
};

export type Transaction =
  | (Expense & { type: "expense" })
  | (Income & { type: "income" });
