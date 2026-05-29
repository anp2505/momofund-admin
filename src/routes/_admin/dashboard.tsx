import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "motion/react";
import {
  Users, Wallet, ArrowLeftRight, ShieldAlert, Banknote,
  UserPlus, Sparkles, AlertCircle, Loader,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  fetchUsers, fetchFunds, fetchReports, fetchUserGrowthData, fetchTransactionVolumeData, fetchFundStatusData, fetchDashboardStats,
  formatVND, formatDateTime, type User, type Fund, type Report,
} from "@/lib/mock-data";
import { DateRangePicker } from "@/components/admin/DateRangePicker";
import type { DateRange } from "react-day-picker";

export const Route = createFileRoute("/_admin/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — MomoFund Admin" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalFunds: 0, totalTransactions: 0, pendingReports: 0, totalCirculating: 0 });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentFunds, setRecentFunds] = useState<Fund[]>([]);
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [transactionVolumeData, setTransactionVolumeData] = useState<any[]>([]);
  const [fundStatusData, setFundStatusData] = useState<any[]>([]);
  const [date, setDate] = useState<DateRange | undefined>();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [users, funds, reports, statsData, userGrowth, txVolume, fundStatus] = await Promise.all([
          fetchUsers(date?.from, date?.to),
          fetchFunds(date?.from, date?.to),
          fetchReports(date?.from, date?.to),
          fetchDashboardStats(date?.from, date?.to),
          fetchUserGrowthData(date?.from, date?.to),
          fetchTransactionVolumeData(date?.from, date?.to),
          fetchFundStatusData(date?.from, date?.to),
        ]);

        setRecentUsers(users.slice(0, 4));
        setRecentFunds(funds.slice(0, 3));
        setRecentReports(reports.filter(r => r.report_status === "PENDING").slice(0, 3));
        setStats(statsData as any);
        setUserGrowthData(userGrowth);
        setTransactionVolumeData(txVolume);
        setFundStatusData(fundStatus);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadData();
      } else {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [date]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tổng quan hệ thống</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Chào mừng trở lại 👋 Đây là tình hình MomoFund hôm nay.
          </p>
        </div>
        <DateRangePicker date={date} setDate={setDate} />
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Tổng người dùng" value={stats.totalUsers.toLocaleString("vi-VN")} delta="Số liệu hiện tại từ Firestore" icon={Users} accent="primary" index={0} />
        <StatCard label="Tổng quỹ" value={stats.totalFunds.toLocaleString("vi-VN")} delta="Dựa trên quỹ hiện có" icon={Wallet} accent="accent" index={1} />
        <StatCard label="Giao dịch" value={stats.totalTransactions.toLocaleString("vi-VN")} delta="Tổng giao dịch thực tế" icon={ArrowLeftRight} accent="success" index={2} />
        <StatCard label="Báo cáo chờ" value={String(stats.pendingReports)} delta="Số báo cáo đang chờ xử lý" trend="down" icon={ShieldAlert} accent="warning" index={3} />
        <StatCard label="Tiền lưu thông" value={formatVND(stats.totalCirculating)} delta="Tổng tiền trong hệ thống" icon={Banknote} accent="primary" index={4} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-6 shadow-card"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Tăng trưởng người dùng & quỹ</h2>
              <p className="text-xs text-muted-foreground">12 tháng gần nhất</p>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Users</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-accent" />Funds</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={userGrowthData}>
              <defs>
                <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.58 0.22 348)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(0.58 0.22 348)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gFunds" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.62 0.22 295)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(0.62 0.22 295)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 310)" vertical={false} />
              <XAxis dataKey="month" stroke="oklch(0.5 0.04 305)" fontSize={12} />
              <YAxis stroke="oklch(0.5 0.04 305)" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.02 310)", background: "white" }} />
              <Area type="monotone" dataKey="users" stroke="oklch(0.58 0.22 348)" strokeWidth={2.5} fill="url(#gUsers)" />
              <Area type="monotone" dataKey="funds" stroke="oklch(0.62 0.22 295)" strokeWidth={2.5} fill="url(#gFunds)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border/60 bg-card p-6 shadow-card"
        >
          <h2 className="text-lg font-semibold">Trạng thái quỹ</h2>
          <p className="text-xs text-muted-foreground">Phân bổ hiện tại</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={fundStatusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={4}>
                {fundStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="rounded-2xl border border-border/60 bg-card p-6 shadow-card"
      >
        <h2 className="text-lg font-semibold">Khối lượng giao dịch</h2>
        <p className="text-xs text-muted-foreground">14 ngày gần nhất (triệu VND)</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={transactionVolumeData}>
            <defs>
              <linearGradient id="gBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.58 0.22 348)" />
                <stop offset="100%" stopColor="oklch(0.62 0.22 295)" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 310)" vertical={false} />
            <XAxis dataKey="day" stroke="oklch(0.5 0.04 305)" fontSize={12} />
            <YAxis stroke="oklch(0.5 0.04 305)" fontSize={12} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.02 310)", background: "white" }}
              formatter={(value: any, _name: any) => {
                const numericValue = typeof value === "number" ? value : Number(value) || 0;
                return [numericValue.toLocaleString("vi-VN", { maximumFractionDigits: 2 }), "triệu VND"];
              }}
            />
            <Bar dataKey="volume" fill="url(#gBar)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RealtimeCard title="Người dùng mới" icon={UserPlus} items={recentUsers.map(u => ({
          id: u.user_id, title: u.full_name, subtitle: u.email, time: formatDateTime(u.created_at), avatar: u.avatar_url,
        }))} />
        <RealtimeCard title="Quỹ mới tạo" icon={Sparkles} items={recentFunds.map(f => ({
          id: f.fund_id, title: f.fund_name, subtitle: `Chủ quỹ: ${f.owner_name}`, time: formatDateTime(f.created_at), avatar: f.avatar_url,
        }))} />
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-warning/20 text-warning-foreground">
              <AlertCircle className="size-4" />
            </div>
            <h3 className="font-semibold">Báo cáo mới</h3>
          </div>
          <ul className="space-y-3">
            {recentReports.map(r => (
              <li key={r.report_id} className="rounded-xl border border-border/50 p-3 transition-colors hover:bg-muted/40">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug">{r.reason}</p>
                  <StatusBadge status={r.report_status} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Đối tượng: <span className="font-medium text-foreground">{r.target_name}</span>
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{formatDateTime(r.created_at)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function RealtimeCard({ title, icon: Icon, items }: { title: string; icon: typeof UserPlus; items: { id: string; title: string; subtitle: string; time: string; avatar: string }[] }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <div className="bg-gradient-accent flex size-8 items-center justify-center rounded-lg text-white">
          <Icon className="size-4" />
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map(it => (
          <li key={it.id} className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/40">
            <img src={it.avatar} alt={it.title} className="size-10 rounded-xl border border-border object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{it.title}</p>
              <p className="truncate text-xs text-muted-foreground">{it.subtitle}</p>
            </div>
            <span className="shrink-0 text-[10px] text-muted-foreground">{it.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
