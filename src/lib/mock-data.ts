export type AccountStatus = "ACTIVE" | "LOCKED";
export type UserRole = "ADMIN" | "USER";
export type FundStatus = "ACTIVE" | "PAUSED" | "CLOSED";
export type ReportStatus = "PENDING" | "RESOLVED" | "DISMISSED";

export interface User {
  user_id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  phone_number: string;
  account_status: AccountStatus;
  role: UserRole;
  created_at: string;
  last_login_at: string;
  locked_at?: string;
  locked_reason?: string;
  total_contributed: number;
  funds_joined: number;
}

export interface Fund {
  fund_id: string;
  owner_id: string;
  owner_name: string;
  fund_name: string;
  description: string;
  avatar_url: string;
  privacy_type: "PUBLIC" | "PRIVATE";
  fund_status: FundStatus;
  target_amount: number;
  current_balance: number;
  created_at: string;
  members_count: number;
}

export interface Report {
  report_id: string;
  reporter_id: string;
  reporter_name: string;
  target_type: "USER" | "FUND";
  target_id: string;
  target_name: string;
  reason: string;
  report_status: ReportStatus;
  resolution_note?: string;
  created_at: string;
  handled_at?: string;
}

export interface ActivityLog {
  log_id: string;
  actor_id: string;
  actor_name: string;
  action: string;
  target_type: string;
  target_id: string;
  detail: string;
  ip_address: string;
  created_at: string;
}

export interface FundMember {
  member_id: string;
  fund_id: string;
  user_id: string;
  user_name: string;
  user_avatar_url?: string;
  role?: string;
  joined_at?: string;
  contribution_amount?: number;
}

export interface Transaction {
  transaction_id: string;
  fund_id: string;
  user_id: string;
  user_name: string;
  type: "DEPOSIT" | "WITHDRAW" | "TRANSFER" | string;
  amount: number;
  created_at: string;
}

// Re-export Firebase service functions for use in components
export { fetchUsers, fetchUserById, fetchUsersByFilter, getUserStats, updateUserLockStatus } from "@/lib/services/userService";
export { fetchFunds, fetchFundById, fetchFundsByStatus, fetchFundsByOwner, getFundStats } from "@/lib/services/fundService";
export { fetchReports, fetchReportById, fetchReportsByStatus, fetchReportsByTarget, getReportStats, updateReportStatus } from "@/lib/services/reportService";
export { fetchActivityLogs, fetchActivityLogsByActor, fetchActivityLogsByAction, fetchActivityLogsByTarget } from "@/lib/services/activityService";
export { fetchUserGrowthData, fetchTransactionVolumeData, fetchFundStatusData, fetchDashboardStats } from "@/lib/services/analyticsService";
export { fetchMembersByFundId, fetchFundsByUserId } from "@/lib/services/memberService";
export { fetchTransactionsByFundId, fetchTransactionStats } from "@/lib/services/transactionService";




export function formatVND(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
