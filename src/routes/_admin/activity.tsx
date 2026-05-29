import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Download, Search, Loader, ScrollText } from "lucide-react";
import { fetchActivityLogs, type ActivityLog } from "@/lib/mock-data";

export const Route = createFileRoute("/_admin/activity")({
  head: () => ({ meta: [{ title: "Nhật ký hoạt động — MomoFund Admin" }] }),
  component: ActivityPage,
});

const actionColorMap: Record<string, { bg: string; text: string }> = {
  /* ── User actions ── */
  USER_LOCKED:       { bg: "rgba(220, 38, 38, 0.12)", text: "#dc2626" },
  lock_user:         { bg: "rgba(220, 38, 38, 0.12)", text: "#dc2626" },
  USER_UNLOCKED:     { bg: "rgba(16, 185, 129, 0.12)", text: "#059669" },
  unlock_user:       { bg: "rgba(16, 185, 129, 0.12)", text: "#059669" },
  USER_LOGIN:        { bg: "rgba(107, 114, 128, 0.12)", text: "#6b7280" },
  user_login:        { bg: "rgba(107, 114, 128, 0.12)", text: "#6b7280" },
  USER_LOGOUT:       { bg: "rgba(107, 114, 128, 0.12)", text: "#6b7280" },
  user_logout:       { bg: "rgba(107, 114, 128, 0.12)", text: "#6b7280" },

  /* ── Fund actions ── */
  FUND_CREATED:      { bg: "rgba(16, 185, 129, 0.12)", text: "#059669" },
  create_fund:       { bg: "rgba(16, 185, 129, 0.12)", text: "#059669" },
  FUND_PAUSED:       { bg: "rgba(245, 158, 11, 0.15)", text: "#d97706" },
  pause_fund:        { bg: "rgba(245, 158, 11, 0.15)", text: "#d97706" },
  FUND_CLOSED:       { bg: "rgba(239, 68, 68, 0.12)", text: "#ef4444" },
  close_fund:        { bg: "rgba(239, 68, 68, 0.12)", text: "#ef4444" },
  FUND_RESUMED:      { bg: "rgba(59, 130, 246, 0.12)", text: "#2563eb" },
  resume_fund:       { bg: "rgba(59, 130, 246, 0.12)", text: "#2563eb" },

  /* ── Transaction actions ── */
  TRANSACTION_CREATED: { bg: "rgba(139, 92, 246, 0.12)", text: "#7c3aed" },
  create_transaction:  { bg: "rgba(139, 92, 246, 0.12)", text: "#7c3aed" },

  /* ── Withdrawal actions ── */
  WITHDRAWAL_APPROVED: { bg: "rgba(16, 185, 129, 0.12)", text: "#059669" },
  approve_withdrawal:  { bg: "rgba(16, 185, 129, 0.12)", text: "#059669" },
  WITHDRAWAL_REJECTED: { bg: "rgba(239, 68, 68, 0.12)", text: "#ef4444" },
  reject_withdrawal:   { bg: "rgba(239, 68, 68, 0.12)", text: "#ef4444" },

  /* ── Report actions ── */
  REPORT_RESOLVED:   { bg: "rgba(168, 85, 247, 0.12)", text: "#9333ea" },
  resolve_report:    { bg: "rgba(168, 85, 247, 0.12)", text: "#9333ea" },
  REPORT_DISMISSED:  { bg: "rgba(107, 114, 128, 0.12)", text: "#6b7280" },
  dismiss_report:    { bg: "rgba(107, 114, 128, 0.12)", text: "#6b7280" },

  /* ── Deputy / Member actions ── */
  DEPUTY_GRANTED:    { bg: "rgba(14, 165, 233, 0.12)", text: "#0284c7" },
  grant_deputy:      { bg: "rgba(14, 165, 233, 0.12)", text: "#0284c7" },
  DEPUTY_REVOKED:    { bg: "rgba(249, 115, 22, 0.12)", text: "#ea580c" },
  revoke_deputy:     { bg: "rgba(249, 115, 22, 0.12)", text: "#ea580c" },
  MEMBER_REMOVED:    { bg: "rgba(239, 68, 68, 0.12)", text: "#ef4444" },
  remove_member:     { bg: "rgba(239, 68, 68, 0.12)", text: "#ef4444" },

  /* ── Join request actions ── */
  JOIN_APPROVED:     { bg: "rgba(16, 185, 129, 0.12)", text: "#059669" },
  approve_join:      { bg: "rgba(16, 185, 129, 0.12)", text: "#059669" },
  JOIN_REJECTED:     { bg: "rgba(239, 68, 68, 0.12)", text: "#ef4444" },
  reject_join:       { bg: "rgba(239, 68, 68, 0.12)", text: "#ef4444" },
};

const defaultActionColor = { bg: "rgba(107, 114, 128, 0.10)", text: "#6b7280" };

function getActionColor(action: string) {
  return actionColorMap[action] || defaultActionColor;
}


/** Format: "HH:mm DD/MM/YYYY" — time first, then date */
function formatActivityDateTime(iso: string): string {
  if (!iso) return "N/A";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${hh}:${mm} ${dd}/${mo}/${yyyy}`;
}

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
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ScrollText className="size-12 mb-3 opacity-40" />
            <p className="text-sm font-medium">Không có nhật ký hoạt động nào</p>
          </div>
        ) : (
          <ol className="relative space-y-4 border-l-2 border-dashed border-border pl-6">
            {filtered.map((log, i) => {
              const color = getActionColor(log.action);
              return (
              <motion.li key={log.log_id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                className="relative">
                <span className="bg-gradient-primary absolute -left-[31px] top-2 size-3.5 rounded-full ring-4 ring-card" />
                <div className="rounded-xl border border-border/60 bg-background p-4 transition-colors hover:bg-muted/30">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                      style={{ backgroundColor: color.bg, color: color.text }}
                    >
                      {log.action}
                    </span>
                    <span className="text-sm font-semibold">{log.actor_name}</span>
                    <span className="text-xs text-muted-foreground">→ {log.target_type} #{log.target_id}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{formatActivityDateTime(log.created_at)}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{log.detail}</p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">IP: {log.ip_address} · Actor: {log.actor_id}</p>
                </div>
              </motion.li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}

