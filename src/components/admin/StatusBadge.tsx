import { cn } from "@/lib/utils";

type Variant =
  | "ACTIVE" | "LOCKED" | "PAUSED" | "CLOSED"
  | "PENDING" | "RESOLVED" | "DISMISSED"
  | "ADMIN" | "USER" | "PUBLIC" | "PRIVATE";

const styles: Record<Variant, string> = {
  ACTIVE: "bg-success/15 text-success border-success/30",
  LOCKED: "bg-destructive/15 text-destructive border-destructive/30",
  PAUSED: "bg-warning/20 text-warning-foreground border-warning/40",
  CLOSED: "bg-muted text-muted-foreground border-border",
  PENDING: "bg-warning/20 text-warning-foreground border-warning/40",
  RESOLVED: "bg-success/15 text-success border-success/30",
  DISMISSED: "bg-muted text-muted-foreground border-border",
  ADMIN: "bg-gradient-primary text-primary-foreground border-transparent",
  USER: "bg-accent/15 text-accent border-accent/30",
  PUBLIC: "bg-accent/15 text-accent border-accent/30",
  PRIVATE: "bg-muted text-muted-foreground border-border",
};

const labels: Record<Variant, string> = {
  ACTIVE: "Hoạt động",
  LOCKED: "Đã khóa",
  PAUSED: "Tạm dừng",
  CLOSED: "Đã đóng",
  PENDING: "Chờ xử lý",
  RESOLVED: "Đã xử lý",
  DISMISSED: "Đã bác",
  ADMIN: "Admin",
  USER: "Người dùng",
  PUBLIC: "Công khai",
  PRIVATE: "Riêng tư",
};

export function StatusBadge({ status, className }: { status: Variant; className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
      styles[status],
      className,
    )}>
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {labels[status]}
    </span>
  );
}
