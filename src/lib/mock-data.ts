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

const avatars = [
  "https://i.pravatar.cc/150?img=1","https://i.pravatar.cc/150?img=2",
  "https://i.pravatar.cc/150?img=3","https://i.pravatar.cc/150?img=4",
  "https://i.pravatar.cc/150?img=5","https://i.pravatar.cc/150?img=6",
  "https://i.pravatar.cc/150?img=7","https://i.pravatar.cc/150?img=8",
  "https://i.pravatar.cc/150?img=9","https://i.pravatar.cc/150?img=10",
  "https://i.pravatar.cc/150?img=11","https://i.pravatar.cc/150?img=12",
];

const names = [
  "Nguyễn Minh Anh","Trần Thị Bích","Lê Hoàng Long","Phạm Quỳnh Như",
  "Đỗ Văn Khoa","Vũ Thu Hà","Bùi Tuấn Kiệt","Hoàng Mai Linh",
  "Đặng Thanh Tùng","Ngô Phương Thảo","Lý Quang Huy","Mai Diệu Linh",
];

const fundNames = [
  "Quỹ Du Lịch Đà Nẵng 2026","Quỹ Cưới Hỏi Lan & Minh","Quỹ Mua Nhà Chung",
  "Quỹ Đầu Tư Crypto","Quỹ Tiết Kiệm Gia Đình","Quỹ Hỗ Trợ Sinh Viên",
  "Quỹ Sinh Nhật Sếp","Quỹ Bóng Đá Phòng IT","Quỹ Quyên Góp Miền Trung",
  "Quỹ Họp Lớp 12A1","Quỹ Đám Cưới Khoa","Quỹ Mua Quà Tết",
];

const reasons = [
  "Hành vi lừa đảo, chiếm đoạt tiền góp quỹ",
  "Spam tin nhắn quảng cáo trong nhóm",
  "Nội dung không phù hợp, xúc phạm thành viên",
  "Tài khoản giả mạo người khác",
  "Quỹ có dấu hiệu rửa tiền bất thường",
  "Chủ quỹ không minh bạch giao dịch",
];

function randDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return d.toISOString();
}

export const users: User[] = Array.from({ length: 24 }, (_, i) => ({
  user_id: `u_${1000 + i}`,
  email: `${names[i % names.length].toLowerCase().replace(/\s+/g, ".").normalize("NFD").replace(/[\u0300-\u036f]/g, "")}@momofund.vn`,
  full_name: names[i % names.length],
  avatar_url: avatars[i % avatars.length],
  phone_number: `09${Math.floor(10000000 + Math.random() * 89999999)}`,
  account_status: i % 9 === 0 ? "LOCKED" : "ACTIVE",
  role: i === 0 ? "ADMIN" : "USER",
  created_at: randDate(180),
  last_login_at: randDate(7),
  locked_at: i % 9 === 0 ? randDate(30) : undefined,
  locked_reason: i % 9 === 0 ? "Vi phạm quy định cộng đồng nhiều lần" : undefined,
  total_contributed: Math.floor(Math.random() * 50000000),
  funds_joined: Math.floor(Math.random() * 8) + 1,
}));

export const funds: Fund[] = Array.from({ length: 18 }, (_, i) => {
  const owner = users[(i + 1) % users.length];
  const target = (Math.floor(Math.random() * 50) + 10) * 1000000;
  return {
    fund_id: `f_${2000 + i}`,
    owner_id: owner.user_id,
    owner_name: owner.full_name,
    fund_name: fundNames[i % fundNames.length],
    description: "Quỹ chung của nhóm để cùng nhau tiết kiệm và đạt mục tiêu đã đề ra trong năm.",
    avatar_url: `https://api.dicebear.com/7.x/shapes/svg?seed=${i}&backgroundColor=ffafcc,bde0fe,cdb4db`,
    privacy_type: i % 3 === 0 ? "PUBLIC" : "PRIVATE",
    fund_status: i % 7 === 0 ? "CLOSED" : i % 5 === 0 ? "PAUSED" : "ACTIVE",
    target_amount: target,
    current_balance: Math.floor(target * Math.random()),
    created_at: randDate(200),
    members_count: Math.floor(Math.random() * 25) + 3,
  };
});

export const reports: Report[] = Array.from({ length: 16 }, (_, i) => {
  const reporter = users[i % users.length];
  const isUser = i % 2 === 0;
  const target = isUser ? users[(i + 3) % users.length] : funds[i % funds.length];
  return {
    report_id: `r_${3000 + i}`,
    reporter_id: reporter.user_id,
    reporter_name: reporter.full_name,
    target_type: isUser ? "USER" : "FUND",
    target_id: isUser ? (target as User).user_id : (target as Fund).fund_id,
    target_name: isUser ? (target as User).full_name : (target as Fund).fund_name,
    reason: reasons[i % reasons.length],
    report_status: i % 4 === 0 ? "RESOLVED" : i % 5 === 0 ? "DISMISSED" : "PENDING",
    resolution_note: i % 4 === 0 ? "Đã xác minh và xử lý theo quy định." : undefined,
    created_at: randDate(30),
    handled_at: i % 4 === 0 ? randDate(5) : undefined,
  };
});

export const activityLogs: ActivityLog[] = Array.from({ length: 30 }, (_, i) => {
  const actor = users[i % users.length];
  const actions = ["USER_LOCKED", "FUND_CREATED", "REPORT_RESOLVED", "USER_LOGIN", "TRANSACTION_CREATED", "FUND_PAUSED"];
  const action = actions[i % actions.length];
  return {
    log_id: `log_${4000 + i}`,
    actor_id: actor.user_id,
    actor_name: actor.full_name,
    action,
    target_type: action.includes("USER") ? "USER" : action.includes("FUND") ? "FUND" : "REPORT",
    target_id: `t_${5000 + i}`,
    detail: `Hệ thống ghi nhận hành động ${action.toLowerCase().replace(/_/g, " ")}.`,
    ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    created_at: randDate(14),
  };
});

export const dashboardStats = {
  totalUsers: 12847,
  totalFunds: 1923,
  totalTransactions: 84520,
  pendingReports: reports.filter(r => r.report_status === "PENDING").length,
  totalCirculating: 8420000000,
};

export const userGrowthData = Array.from({ length: 12 }, (_, i) => ({
  month: ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"][i],
  users: 2000 + i * 850 + Math.floor(Math.random() * 500),
  funds: 200 + i * 140 + Math.floor(Math.random() * 80),
}));

export const transactionVolumeData = Array.from({ length: 14 }, (_, i) => ({
  day: `${i + 10}/12`,
  volume: Math.floor(Math.random() * 800) + 200,
}));

export const fundStatusData = [
  { name: "ACTIVE", value: funds.filter(f => f.fund_status === "ACTIVE").length, color: "oklch(0.58 0.22 348)" },
  { name: "PAUSED", value: funds.filter(f => f.fund_status === "PAUSED").length, color: "oklch(0.78 0.16 75)" },
  { name: "CLOSED", value: funds.filter(f => f.fund_status === "CLOSED").length, color: "oklch(0.62 0.04 310)" },
];

export function formatVND(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
