import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  AreaChart, Area, RadialBarChart, RadialBar, Legend,
} from "recharts";
import { userGrowthData, transactionVolumeData, fundStatusData } from "@/lib/mock-data";

export const Route = createFileRoute("/_admin/analytics")({
  head: () => ({ meta: [{ title: "Thống kê hệ thống — MomoFund Admin" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Thống kê hệ thống</h1>
        <p className="mt-1 text-sm text-muted-foreground">Phân tích chi tiết hiệu suất MomoFund</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Tăng trưởng users" subtitle="12 tháng">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 310)" vertical={false} />
              <XAxis dataKey="month" stroke="oklch(0.5 0.04 305)" fontSize={12} />
              <YAxis stroke="oklch(0.5 0.04 305)" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.02 310)" }} />
              <Line dataKey="users" stroke="oklch(0.58 0.22 348)" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Volume giao dịch" subtitle="14 ngày">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={transactionVolumeData}>
              <defs>
                <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.62 0.22 295)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="oklch(0.62 0.22 295)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 310)" vertical={false} />
              <XAxis dataKey="day" stroke="oklch(0.5 0.04 305)" fontSize={12} />
              <YAxis stroke="oklch(0.5 0.04 305)" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.02 310)" }} />
              <Area dataKey="volume" stroke="oklch(0.62 0.22 295)" strokeWidth={2.5} fill="url(#ga)" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Trạng thái quỹ" subtitle="Phân bổ">
          <ResponsiveContainer width="100%" height={280}>
            <RadialBarChart innerRadius="30%" outerRadius="100%" data={fundStatusData} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" cornerRadius={12} background />
              <Legend iconType="circle" />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Tỉ lệ Active vs Locked" subtitle="Người dùng">
          <div className="flex h-[280px] flex-col justify-center gap-4 p-4">
            <Metric label="Active users" pct={92} color="oklch(0.68 0.17 155)" />
            <Metric label="Locked accounts" pct={4} color="oklch(0.6 0.24 25)" />
            <Metric label="Admin" pct={1} color="oklch(0.58 0.22 348)" />
            <Metric label="Inactive >30d" pct={18} color="oklch(0.62 0.22 295)" />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card">
      <h2 className="font-semibold">{title}</h2>
      <p className="mb-3 text-xs text-muted-foreground">{subtitle}</p>
      {children}
    </div>
  );
}

function Metric({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-semibold">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
