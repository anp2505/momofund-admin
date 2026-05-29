import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Download, Search, Loader } from "lucide-react";
import { fetchActivityLogs, formatDateTime, type ActivityLog } from "@/lib/mock-data";

export const Route = createFileRoute("/_admin/activity")({
  head: () => ({ meta: [{ title: "Nhật ký hoạt động — MomoFund Admin" }] }),
  component: ActivityPage,
});

const actionColors: Record<string, string> = {
  USER_LOCKED: "bg-destructive/15 text-destructive",
  FUND_CREATED: "bg-success/15 text-success",
  REPORT_RESOLVED: "bg-accent/15 text-accent",
  USER_LOGIN: "bg-muted text-muted-foreground",
  TRANSACTION_CREATED: "bg-primary/15 text-primary",
  FUND_PAUSED: "bg-warning/20 text-warning-foreground",
};

function ActivityPage() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        const data = await fetchActivityLogs(100);
        setLogs(data);
      } catch (error) {
        console.error("Error loading activity logs:", error);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  const filtered = logs.filter(l =>
    !q || l.actor_name.toLowerCase().includes(q.toLowerCase()) || l.action.toLowerCase().includes(q.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nhật ký hoạt động</h1>
          <p className="mt-1 text-sm text-muted-foreground">Audit log toàn hệ thống — minh bạch & truy vết</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold shadow-card hover:bg-muted">
          <Download className="size-4" />Export CSV
        </button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm theo actor, action..."
            className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card">
        <ol className="relative space-y-4 border-l-2 border-dashed border-border pl-6">
          {filtered.map((log, i) => (
            <motion.li key={log.log_id}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
              className="relative">
              <span className="bg-gradient-primary absolute -left-[31px] top-2 size-3.5 rounded-full ring-4 ring-card" />
              <div className="rounded-xl border border-border/60 bg-background p-4 transition-colors hover:bg-muted/30">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${actionColors[log.action] ?? "bg-muted text-muted-foreground"}`}>
                    {log.action}
                  </span>
                  <span className="text-sm font-medium">{log.actor_name}</span>
                  <span className="text-xs text-muted-foreground">→ {log.target_type} #{log.target_id}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{formatDateTime(log.created_at)}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{log.detail}</p>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">IP: {log.ip_address} · Actor: {log.actor_id}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  );
}
