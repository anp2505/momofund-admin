import { createFileRoute } from "@tanstack/react-router";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/settings")({
  head: () => ({ meta: [{ title: "Cài đặt — MomoFund Admin" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cài đặt</h1>
        <p className="mt-1 text-sm text-muted-foreground">Cấu hình hệ thống MomoFund Admin</p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card space-y-5">
        <h2 className="font-semibold">Bảo mật</h2>
        <Row title="Xác thực 2 lớp (2FA)" desc="Bắt buộc 2FA cho tất cả admin">
          <Switch defaultChecked onCheckedChange={() => toast.success("Đã cập nhật")} />
        </Row>
        <Row title="Tự động khóa session" desc="Đăng xuất sau 30 phút không hoạt động">
          <Switch defaultChecked />
        </Row>
        <Row title="Thông báo đăng nhập lạ" desc="Email khi có đăng nhập từ thiết bị mới">
          <Switch defaultChecked />
        </Row>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card space-y-5">
        <h2 className="font-semibold">Thông báo hệ thống</h2>
        <Row title="Báo cáo mới" desc="Nhận push khi có báo cáo PENDING"><Switch defaultChecked /></Row>
        <Row title="Giao dịch lớn (&gt;50M)" desc="Cảnh báo các giao dịch bất thường"><Switch defaultChecked /></Row>
        <Row title="Newsletter tuần" desc="Tóm tắt analytics gửi vào Thứ Hai"><Switch /></Row>
      </div>

      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="font-semibold text-destructive">Khu vực nguy hiểm</h2>
        <p className="mt-1 text-xs text-muted-foreground">Các hành động này không thể hoàn tác.</p>
        <button className="mt-4 rounded-xl border border-destructive bg-card px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground">
          Reset tất cả phiên admin
        </button>
      </div>
    </div>
  );
}

function Row({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border/40 pt-4 first:border-0 first:pt-0">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      {children}
    </div>
  );
}
