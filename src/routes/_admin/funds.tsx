import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Wallet, TrendingUp, Users as UsersIcon, Loader } from "lucide-react";
import { fetchFunds, formatVND, formatDate, type Fund } from "@/lib/mock-data";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_admin/funds")({
  head: () => ({ meta: [{ title: "Quản lý quỹ — MomoFund Admin" }] }),
  component: FundsPage,
});

function FundsPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "PAUSED" | "CLOSED">("ALL");
  const [loading, setLoading] = useState(true);
  const [funds, setFunds] = useState<Fund[]>([]);

  useEffect(() => {
    const loadFunds = async () => {
      try {
        setLoading(true);
        const data = await fetchFunds();
        setFunds(data);
      } catch (error) {
        console.error("Error loading funds:", error);
      } finally {
        setLoading(false);
      }
    };
    loadFunds();
  }, []);

  const filtered = useMemo(() => funds.filter(f => {
    const matchQ = !q || f.fund_name.toLowerCase().includes(q.toLowerCase()) || f.owner_name.toLowerCase().includes(q.toLowerCase());
    const matchF = filter === "ALL" || f.fund_status === filter;
    return matchQ && matchF;
  }), [q, filter, funds]);

  const totalBalance = funds.reduce((s, f) => s + f.current_balance, 0);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý quỹ</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tổng cộng {funds.length} quỹ — lưu thông {formatVND(totalBalance)}</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <AnalyticsMini label="Tổng quỹ" value={String(funds.length)} icon={Wallet} />
        <AnalyticsMini label="Đang hoạt động" value={String(funds.filter(f => f.fund_status === "ACTIVE").length)} icon={TrendingUp} />
        <AnalyticsMini label="Tổng thành viên" value={funds.reduce((s, f) => s + f.members_count, 0).toString()} icon={UsersIcon} />
        <AnalyticsMini label="Tổng số dư" value={formatVND(totalBalance)} icon={Wallet} />
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm tên quỹ hoặc chủ quỹ..."
              className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </div>
          <div className="flex gap-2">
            {(["ALL", "ACTIVE", "PAUSED", "CLOSED"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((f, i) => {
          const pct = f.target_amount > 0 ? Math.min(100, Math.round((f.current_balance / f.target_amount) * 100)) : 0;
          return (
            <motion.div key={f.fund_id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link to="/funds/$fundId" params={{ fundId: f.fund_id }}
                className="group block overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-glow">
                <div className="bg-gradient-primary relative h-20">
                  <img src={f.avatar_url} alt="" className="absolute -bottom-6 left-5 size-14 rounded-2xl border-4 border-card bg-white" />
                  <div className="absolute right-3 top-3">
                    <StatusBadge status={f.fund_status} />
                  </div>
                </div>
                <div className="p-5 pt-8">
                  <h3 className="truncate font-semibold group-hover:text-primary">{f.fund_name}</h3>
                  <p className="text-xs text-muted-foreground">Chủ quỹ: {f.owner_name}</p>
                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="text-muted-foreground">Tiến độ</span>
                      <span className="font-semibold">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <div className="mt-2 flex justify-between text-xs">
                      <span className="font-medium">{formatVND(f.current_balance)}</span>
                      <span className="text-muted-foreground">/ {formatVND(f.target_amount)}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
                    <span>{f.members_count} thành viên</span>
                    <span>{formatDate(f.created_at)}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function AnalyticsMini({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Wallet }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-card">
      <div className="bg-gradient-accent flex size-10 items-center justify-center rounded-xl text-white">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-bold">{value}</p>
      </div>
    </div>
  );
}
