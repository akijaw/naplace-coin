export type TransactionType =
  | "club_to_student"
  | "student_to_club"
  | "admin_grant"
  | "admin_deduct";

export type Direction = "club_to_student" | "student_to_club";

export type PaymentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "expired"
  | "canceled";

export interface UserRow {
  id: string;
  username: string;
  password: string;
  name: string;
  balance: number;
  club_id: string | null;
  active: number;
  created_at: string;
}

export interface ClubRow {
  id: string;
  name: string;
  balance: number;
  created_at: string;
}

export interface ApiKeyRow {
  key: string;
  club_id: string;
  label: string | null;
  active: number;
  created_at: string;
  last_used_at: string | null;
}

export interface TransactionRow {
  id: number;
  student_id: string | null;
  club_id: string | null;
  amount: number;
  transaction_type: TransactionType;
  title: string | null;
  created_at: string;
}

export interface PaymentRequestRow {
  id: string;
  student_id: string;
  club_id: string;
  amount: number;
  title: string | null;
  status: PaymentStatus;
  created_at: string;
  expires_at: string;
  resolved_at: string | null;
}

export interface ActivityRow {
  id: number;
  club_id: string;
  name: string;
  amount: number;
  direction: Direction;
  created_at: string;
}
