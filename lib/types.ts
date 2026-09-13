export type Role = 'employee' | 'admin';

export type ThemeKey = 'warm' | 'festival' | 'premium';

export interface User {
  id: string;
  fullName: string;
  email: string;
  birthDate: string; // ISO yyyy-mm-dd
  department: string;
  avatarUrl: string;
  role: Role;
}

export interface Wish {
  id: string;
  authorEmail: string;
  targetUserId: string;
  text: string;
  createdAt: string;
}

export interface Donation {
  userId: string;
  totalAmount: number;
}

export type RefundReason = 'refund_declined' | 'emergency_refund';

export interface DonationHistoryEntry {
  id: string;
  userId: string;
  adminEmail: string;
  previousAmount: number;
  newAmount: number;
  reason: RefundReason;
  comment: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  authorEmail: string;
  text: string;
  isAdmin: boolean;
  createdAt: string;
  readByAdmin?: boolean;
}

export interface ChatThread {
  userEmail: string;
  messages: ChatMessage[];
}
