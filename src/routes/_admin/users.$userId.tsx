import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Lock, Unlock, Mail, Phone, Calendar, Wallet, AlertTriangle, Loader } from "lucide-react";
import { fetchUserById, fetchFundsByUserId, updateUserLockStatus, createActivityLog, formatDateTime, formatVND, formatDate, type User, type Fund } from "@/lib/mock-data";
import { auth } from "@/lib/firebase";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/users/$userId")({
  head: ({ params }) => ({ meta: [{ title: `User ${params.userId} — MomoFund Admin` }] }),
  component: UserDetail,
  notFoundComponent: () => <div>Không tìm thấy user</div>,
});

function UserDetail() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userFunds, setUserFunds] = useState<Fund[]>([]);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [opLoading, setOpLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const userData = await fetchUserById(userId);
        if (!userData) {
          navigate({ to: "/users" });
          return;
        }
        setUser(userData);

        const fundsJoined = await fetchFundsByUserId(userId);
        setUserFunds(fundsJoined.slice(0, Math.min(4, fundsJoined.length)));
      } catch (error) {
        console.error("Error loading user:", error);
        toast.error("Không thể tải thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [userId, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <div className="p-4 text-center text-muted-foreground">Không tìm thấy người dùng.</div>;
  }

  const isAdmin = user.role === "ADMIN";

  const handleLock = async () => {
    if (!reason.trim()) { toast.error("Vui lòng nhập lý do khóa tài khoản"); return; }
    if (!user) return;
    if (opLoading) return;
    try {
      setOpLoading(true);
      const success = await updateUserLockStatus(user.user_id, true, reason);
      if (!success) {
        toast.error("Không thể khóa tài khoản");
        return;
      }
      setUser({ ...user, account_status: "LOCKED", locked_at: new Date().toISOString(), locked_reason: reason });
      toast.success(`Đã khóa tài khoản ${user.full_name}`);
      try { await createActivityLog(auth.currentUser?.uid || "system", "LOCK_USER", "USER", user.user_id, `Khóa tài khoản: ${reason}`); } catch (e) { console.error(e); }
      setOpen(false);
      setReason("");
    } finally {
      setOpLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate({ to: "/users" })} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />Quay lại danh sách
      </button>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
        <div className="bg-gradient-primary h-32" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <Avatar className="size-24 ring-4 ring-card">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback>{user.full_name[0]}</AvatarFallback>
              </Avatar>
              <div className="pb-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{user.full_name}</h1>
                  <StatusBadge status={user.role} />
                  <StatusBadge status={user.account_status} />
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-2 pb-2">
              {user.account_status === "ACTIVE" ? (
                <button
                  onClick={() => setOpen(true)}
                  disabled={isAdmin || opLoading}
                  className="bg-gradient-to-r from-destructive to-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isAdmin ? "Không thể khóa Admin" : ""}
                >
                  <Lock className="size-4" />Khóa tài khoản
                </button>
              ) : (
                <button disabled={opLoading} onClick={async () => {
                  if (!user || opLoading) return;
                  try {
                    setOpLoading(true);
                    const success = await updateUserLockStatus(user.user_id, false);
                    if (success) {
                      setUser({ ...user, account_status: "ACTIVE", locked_at: undefined, locked_reason: undefined });
                      toast.success("Đã mở khóa tài khoản");
                      try { await createActivityLog(auth.currentUser?.uid || "system", "UNLOCK_USER", "USER", user.user_id, `Mở khóa tài khoản`); } catch (e) { console.error(e); }
                    } else {
                      toast.error("Không thể mở khóa tài khoản");
                    }
                  } catch (err) {
                    console.error(err);
                    toast.error("Lỗi khi mở khóa tài khoản");
                  } finally {
                    setOpLoading(false);
                  }
                }}
                  className="bg-gradient-to-r from-success to-accent inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-glow hover:scale-[1.02]">
                  <Unlock className="size-4" />Mở khóa
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <Section title="Thông tin cá nhân">
            <InfoRow icon={Mail} label="Email" value={user.email} />
            <InfoRow icon={Phone} label="Số điện thoại" value={user.phone_number} />
            <InfoRow icon={Calendar} label="Ngày tạo" value={formatDate(user.created_at)} />
            <InfoRow icon={Calendar} label="Đăng nhập cuối" value={formatDateTime(user.last_login_at)} />
            <InfoRow icon={Wallet} label="Tổng đóng góp" value={formatVND(user.total_contributed)} />
          </Section>

          {user.account_status === "LOCKED" && user.locked_reason && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="size-4" />
                <p className="text-sm font-semibold">Tài khoản đã bị khóa</p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Lý do: <span className="font-medium text-foreground">{user.locked_reason}</span></p>
              <p className="text-xs text-muted-foreground">Thời điểm: {user.locked_at ? formatDateTime(user.locked_at) : ""}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <Section title={`Quỹ tham gia (${userFunds.length})`}>
            <div className="space-y-3">
              {userFunds.map(f => (
                <Link key={f.fund_id} to="/funds/$fundId" params={{ fundId: f.fund_id }}
                  className="flex items-center gap-3 rounded-xl border border-border/50 p-3 transition-all hover:border-primary/40 hover:shadow-soft">
                  <img src={f.avatar_url} alt={f.fund_name} className="size-12 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{f.fund_name}</p>
                    <p className="text-xs text-muted-foreground">{f.members_count} thành viên · {formatVND(f.current_balance)}</p>
                  </div>
                  <StatusBadge status={f.fund_status} />
                </Link>
              ))}
            </div>
          </Section>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />Khóa tài khoản người dùng
            </DialogTitle>
            <DialogDescription>
              Hành động này sẽ thu hồi phiên đăng nhập và đặt trạng thái thành <strong>LOCKED</strong>. Hệ thống sẽ ghi nhận vào ACTIVITY_LOGS.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Lý do khóa <span className="text-destructive">*</span></label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={4}
              placeholder="Mô tả chi tiết lý do khóa tài khoản..."
              className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-destructive focus:ring-4 focus:ring-destructive/10" />
          </div>
          <DialogFooter>
            <button onClick={() => setOpen(false)} className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-muted">Hủy</button>
            <button onClick={handleLock} className="bg-gradient-to-r from-destructive to-primary rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-glow">Xác nhận khóa</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
      <h2 className="mb-4 font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 border-b border-border/40 py-2.5 last:border-0">
      <Icon className="size-4 text-muted-foreground mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
