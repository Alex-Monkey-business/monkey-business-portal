export type Child = {
  id: string;
  name: string;
  color: string;
  weekly_amount: number;
  created_at: string;
};

export type Task = {
  id: string;
  child_id: string;
  title: string;
  reward: number;
  active: boolean;
  created_at: string;
};

export type TaskCompletion = {
  id: string;
  task_id: string;
  completed_on: string;
  created_at: string;
};

export type Goal = {
  id: string;
  child_id: string;
  title: string;
  target_amount: number;
  saved_amount: number;
  achieved_at: string | null;
  created_at: string;
};

export type TransactionKind = "weekly" | "task" | "bonus" | "spend" | "adjust";

export type Transaction = {
  id: string;
  child_id: string;
  amount: number;
  kind: TransactionKind;
  note: string | null;
  task_id: string | null;
  goal_id: string | null;
  created_at: string;
};

export type ChildBalance = {
  child_id: string;
  name: string;
  balance: number;
};
