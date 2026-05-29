import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Filter, MoreHorizontal, Eye, Lock, Unlock, Download, Loader, Wallet, TrendingUp, Users as UsersIcon, AlertTriangle } from "lucide-react";
import { fetchUsers, formatDateTime, formatVND, updateUserLockStatus, createActivityLog, type User } from "@/lib/mock-data";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_admin/users")({
  head: () => ({ meta: [{ title: "Quản lý người dùng — MomoFund Admin" }] }),
  component: UsersPage,
});

function UsersPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "LOCKED" | "ADMIN">("ALL");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [reason, setReason] = useState("");
  const [opLoading, setOpLoading] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await fetchUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchQ = !q || u.full_name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()) || u.phone_number.includes(q);
      const matchF =
        filter === "ALL" ||
        (filter === "ADMIN" && u.role === "ADMIN") ||
        (filter === "ACTIVE" && u.account_status === "ACTIVE") ||
        (filter === "LOCKED" && u.account_status === "LOCKED");
      return matchQ && matchF;
    });
  }, [q, filter, users]);

  const totalContributed = users.reduce((sum, u) => sum + u.total_contributed, 0);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tổng cộng {users.length.toLocaleString("vi-VN")} người dùng — tổng đóng góp {formatVND(totalContributed)}
          </p>
        </div>
        <button className="bg-gradient-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]">
          <Download className="size-4" />Xuất CSV
        </button>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <MiniStat label="Tổng" value={users.length.toLocaleString("vi-VN")} icon={UsersIcon} />
        <MiniStat label="Đang hoạt động" value={users.filter(u => u.account_status === "ACTIVE").length.toLocaleString("vi-VN")} icon={TrendingUp} />
        <MiniStat label="Bị khóa" value={users.filter(u => u.account_status === "LOCKED").length.toLocaleString("vi-VN")} icon={Lock} />
        <MiniStat label="Admin" value={users.filter(u => u.role === "ADMIN").length.toLocaleString("vi-VN")} icon={UsersIcon} />
        <MiniStat label="Tổng đóng góp" value={formatVND(totalContributed)} icon={Wallet} />
      </div>

      <div className="rounded-2xl border border-border/60 bg-card shadow-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-border/60 p-4">
          <div className="relative flex-1 min-w-60">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q} onChange={e => setQ(e.target.value)}
              placeholder="Tìm theo tên, email, số điện thoại..."
              className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            {(["ALL", "ACTIVE", "LOCKED", "ADMIN"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}>{f}</button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Người dùng</th>
                <th className="px-4 py-3 font-medium">Liên hệ</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium">Đóng góp</th>
                <th className="px-4 py-3 font-medium">Đăng nhập cuối</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <motion.tr key={u.user_id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-border/40 transition-colors hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <Link to="/_admin/users/$userId" params={{ userId: u.user_id }} className="flex items-center gap-3">
                      <Avatar className="size-9 ring-2 ring-border">
                        <AvatarImage src={u.avatar_url} />
                        <AvatarFallback>{u.full_name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{u.full_name}</p>
                        <p className="text-xs text-muted-foreground">{u.user_id}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p>{u.email}</p>
                    <p className="text-xs text-muted-foreground">{u.phone_number}</p>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={u.role} /></td>
                  <td className="px-4 py-3"><StatusBadge status={u.account_status} /></td>
                  <td className="px-4 py-3 font-medium">{formatVND(u.total_contributed)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateTime(u.last_login_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="rounded-lg p-2 hover:bg-muted"><MoreHorizontal className="size-4" /></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to="/_admin/users/$userId" params={{ userId: u.user_id }}><Eye className="mr-2 size-4" />Xem chi tiết</Link>
                              </DropdownMenuItem>
                              {u.account_status === "ACTIVE" ? (
                                <DropdownMenuItem onSelect={() => { setSelectedUser(u); setReason(""); setDialogOpen(true); }} className="text-destructive"><Lock className="mr-2 size-4" />Khóa tài khoản</DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onSelect={async () => {
                                  try {
                                          if (opLoading) return;
                                          setOpLoading(true);
                                    const success = await updateUserLockStatus(u.user_id, false);
                                    if (success) {
                                      setUsers(prev => prev.map(p => p.user_id === u.user_id ? { ...p, account_status: "ACTIVE", locked_at: undefined, locked_reason: undefined } : p));
                                      toast.success("Đã mở khóa tài khoản");
                                            // create activity log
                                            try { await createActivityLog(auth.currentUser?.uid || "system", "UNLOCK_USER", "USER", u.user_id, `Mở khóa tài khoản`); } catch (e) { console.error(e); }
                                    } else {
                                      toast.error("Không thể mở khóa tài khoản");
                                    }
                                  } catch (err) {
                                    console.error(err);
                                    toast.error("Lỗi khi mở khóa");
                                  } finally {
                                    setOpLoading(false);
                                  }
                                }} className="text-success"><Unlock className="mr-2 size-4" />Mở khóa</DropdownMenuItem>
                              )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">Không tìm thấy người dùng phù hợp.</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border/60 p-4 text-xs text-muted-foreground">
          <span>Hiển thị {filtered.length} / {users.length} người dùng</span>
          <div className="flex gap-1">
            <button className="rounded-lg border border-border bg-background px-3 py-1.5 hover:bg-muted">Trước</button>
            <button className="bg-gradient-primary rounded-lg px-3 py-1.5 text-primary-foreground">1</button>
            <button className="rounded-lg border border-border bg-background px-3 py-1.5 hover:bg-muted">2</button>
            <button className="rounded-lg border border-border bg-background px-3 py-1.5 hover:bg-muted">Sau</button>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="size-5" />Khóa tài khoản người dùng</DialogTitle>
            <DialogDescription>
              Hành động này sẽ đặt trạng thái người dùng thành <strong>LOCKED</strong>. Vui lòng nhập lý do.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Lý do khóa <span className="text-destructive">*</span></label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={4}
              placeholder="Mô tả chi tiết lý do khóa tài khoản..."
              className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-destructive focus:ring-4 focus:ring-destructive/10" />
          </div>
          <DialogFooter>
            <button onClick={() => { setDialogOpen(false); setSelectedUser(null); }} className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-muted">Hủy</button>
            <button disabled={opLoading} onClick={async () => {
              if (!selectedUser) return;
              if (!reason.trim()) { toast.error("Vui lòng nhập lý do khóa tài khoản"); return; }
              try {
                if (opLoading) return;
                setOpLoading(true);
                const success = await updateUserLockStatus(selectedUser.user_id, true, reason);
                if (success) {
                  setUsers(prev => prev.map(p => p.user_id === selectedUser.user_id ? { ...p, account_status: "LOCKED", locked_at: new Date().toISOString(), locked_reason: reason } : p));
                  toast.success(`Đã khóa tài khoản ${selectedUser.full_name}`);
                  try { await createActivityLog(auth.currentUser?.uid || "system", "LOCK_USER", "USER", selectedUser.user_id, `Khóa tài khoản: ${reason}`); } catch (e) { console.error(e); }
                  setDialogOpen(false);
                  setSelectedUser(null);
                  setReason("");
                } else {
                  toast.error("Không thể khóa tài khoản");
                }
              } catch (err) {
                console.error(err);
                toast.error("Lỗi khi khóa tài khoản");
              } finally {
                setOpLoading(false);
              }
            }} className="bg-gradient-to-r from-destructive to-primary rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-glow">Xác nhận khóa</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function MiniStat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Wallet }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-card">
      <div className="bg-gradient-accent flex size-10 items-center justify-center rounded-xl text-white">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
