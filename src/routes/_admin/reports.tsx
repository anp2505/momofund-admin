import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ShieldAlert, CheckCircle2, XCircle, Search as SearchIcon, AlertTriangle, Loader } from "lucide-react";
import { fetchReports, formatDateTime, updateReportStatus, type Report, type ReportStatus } from "@/lib/mock-data";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/reports")({
  head: () => ({ meta: [{ title: "Báo cáo vi phạm — MomoFund Admin" }] }),
  component: ReportsPage,
});

const columns: { status: ReportStatus; title: string; tone: string }[] = [
  { status: "PENDING", title: "Chờ xử lý", tone: "from-warning/15 to-warning/0 border-warning/40" },
  { status: "RESOLVED", title: "Đã xử lý", tone: "from-success/15 to-success/0 border-success/40" },
  { status: "DISMISSED", title: "Đã bác", tone: "from-muted to-muted/0 border-border" },
];

function ReportsPage() {
  const [selected, setSelected] = useState<Report | null>(null);
  const [mode, setMode] = useState<"RESOLVE" | "DISMISS" | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        const data = await fetchReports();
        setReports(data);
      } catch (error) {
        console.error("Error loading reports:", error);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  const handleSubmit = async () => {
    if (!selected) return;
    if (!note.trim()) { toast.error("Vui lòng nhập ghi chú xử lý"); return; }

    const newStatus = mode === "RESOLVE" ? "RESOLVED" : "DISMISSED";
    const success = await updateReportStatus(selected.report_id, newStatus, note, "system_admin");
    if (!success) {
      toast.error("Không thể cập nhật báo cáo");
      return;
    }

    const updatedReport = { ...selected, report_status: newStatus as ReportStatus, resolution_note: note, handled_at: new Date().toISOString() };
    setReports(prev => prev.map(r => r.report_id === selected.report_id ? updatedReport : r));
    setSelected(updatedReport);
    toast.success(mode === "RESOLVE" ? "Báo cáo đã được xử lý" : "Báo cáo đã bị bác");
    setMode(null);
    setNote("");
  };

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
        <h1 className="text-3xl font-bold tracking-tight">Báo cáo vi phạm</h1>
        <p className="mt-1 text-sm text-muted-foreground">Moderation panel — xử lý các báo cáo từ cộng đồng MomoFund</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {columns.map(col => {
          const items = reports.filter(r => r.report_status === col.status);
          return (
            <div key={col.status} className={`rounded-2xl border bg-gradient-to-b ${col.tone} backdrop-blur p-4`}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{col.title}</h3>
                  <span className="rounded-full bg-card px-2 py-0.5 text-xs font-semibold">{items.length}</span>
                </div>
              </div>
              <div className="space-y-3">
                {items.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                    Trống
                  </div>
                ) : items.map((r, i) => (
                  <motion.button
                    key={r.report_id} onClick={() => setSelected(r)}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="block w-full rounded-xl border border-border/60 bg-card p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-glow"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-muted-foreground">{r.report_id}</span>
                      <StatusBadge status={r.report_status} />
                    </div>
                    <p className="line-clamp-2 text-sm font-medium">{r.reason}</p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="rounded-full bg-secondary px-2 py-0.5 font-semibold">{r.target_type}</span>
                      <span className="text-muted-foreground">{formatDateTime(r.created_at)}</span>
                    </div>
                    <p className="mt-2 truncate text-xs text-muted-foreground">Đối tượng: {r.target_name}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!selected && !mode} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShieldAlert className="size-5 text-primary" />
                  Chi tiết báo cáo {selected.report_id}
                </DialogTitle>
                <DialogDescription>Xem xét đầy đủ thông tin trước khi đưa ra quyết định xử lý.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="rounded-xl border border-border/60 bg-secondary/40 p-4">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Lý do báo cáo</p>
                  <p className="mt-1 font-medium">{selected.reason}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Người báo cáo" value={selected.reporter_name} />
                  <Field label="Đối tượng" value={`${selected.target_name} (${selected.target_type})`} />
                  <Field label="Thời gian gửi" value={formatDateTime(selected.created_at)} />
                  <Field label="Trạng thái" value={selected.report_status} />
                </div>
                <div className="rounded-xl border border-border/60 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Báo cáo liên quan</p>
                  <p className="text-sm font-medium">
                    {reports.filter(r => r.target_id === selected.target_id).length} báo cáo cùng đối tượng
                  </p>
                </div>
              </div>
              <DialogFooter className="flex flex-wrap gap-2">
                <button className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-sm hover:bg-muted">
                  <SearchIcon className="size-4" />Điều tra
                </button>
                <button onClick={() => setMode("DISMISS")} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-sm hover:bg-muted">
                  <XCircle className="size-4" />Bác bỏ
                </button>
                <button onClick={() => setMode("RESOLVE")} className="bg-gradient-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow">
                  <CheckCircle2 className="size-4" />Đánh dấu đã xử lý
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!mode} onOpenChange={(o) => !o && setMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-primary" />
              {mode === "RESOLVE" ? "Xử lý báo cáo" : "Bác bỏ báo cáo"}
            </DialogTitle>
            <DialogDescription>
              {mode === "RESOLVE"
                ? "Nhập ghi chú xử lý. Notification sẽ được gửi tới người báo cáo."
                : "Nhập lý do bác bỏ. Thông báo sẽ được gửi tới reporter."}
            </DialogDescription>
          </DialogHeader>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={4}
            placeholder="Resolution note..."
            className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
          <DialogFooter>
            <button onClick={() => setMode(null)} className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-muted">Hủy</button>
            <button onClick={handleSubmit} className="bg-gradient-primary rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow">Xác nhận</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}
