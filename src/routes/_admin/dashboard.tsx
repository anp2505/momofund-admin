import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Users, Wallet, ArrowLeftRight, ShieldAlert, Banknote,
  UserPlus, Sparkles, AlertCircle,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  dashboardStats, userGrowthData, transactionVolumeData, fundStatusData,
  users, funds, reports, formatVND, formatDateTime,
} from "@/lib/mock-data";

export const Route = createFileRoute("/_admin/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — MomoFund Admin" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const recentUsers = users.slice(0, 4);
  const recentFunds = funds.slice(0, 3);
  const recentReports = reports.filter(r => r.report_status === "PENDING").slice(0, 3);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">Tổng quan hệ thống</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Chào mừng trở lại 👋 Đây là tình hình MomoFund hôm nay.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Tổng người dùng" value={dashboardStats.totalUsers.toLocaleString("vi-VN")} delta="+12.4% tuần này" icon={Users} accent="primary" index={0} />
        <StatCard label="Tổng quỹ" value={dashboardStats.totalFunds.toLocaleString("vi-VN")} delta="+8.2%" icon={Wallet} accent="accent" index={1} />
        <StatCard label="Giao dịch" value={dashboardStats.totalTransactions.toLocaleString("vi-VN")} delta="+24.1%" icon={ArrowLeftRight} accent="success" index={2} />
        <StatCard label="Báo cáo chờ" value={String(dashboardStats.pendingReports)} delta="3 cần xử lý gấp" trend="down" icon={ShieldAlert} accent="warning" index={3} />
        <StatCard label="Tiền lưu thông" value={formatVND(dashboardStats.totalCirculating)} delta="+5.7%" icon={Banknote} accent="primary" index={4} />
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
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.02 310)", background: "white" }} />
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
