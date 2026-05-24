import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, Wallet, ShieldAlert, ScrollText,
  BarChart3, Settings, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/users", label: "Quản lý người dùng", icon: Users },
  { to: "/funds", label: "Quản lý quỹ", icon: Wallet },
  { to: "/reports", label: "Báo cáo vi phạm", icon: ShieldAlert, badge: 8 },
  { to: "/activity", label: "Nhật ký hoạt động", icon: ScrollText },
  { to: "/analytics", label: "Thống kê hệ thống", icon: BarChart3 },
  { to: "/settings", label: "Cài đặt", icon: Settings },
] as const;

export function AdminSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="bg-gradient-sidebar fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-sidebar-border lg:flex">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="bg-gradient-accent flex size-10 items-center justify-center rounded-xl shadow-glow">
          <Sparkles className="size-5 text-white" />
        </div>
        <div>
          <p className="text-base font-bold text-sidebar-foreground">MomoFund</p>
          <p className="text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/60">Admin Console</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item, i) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <Link
                to={item.to}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-glow"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-gradient-accent"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={cn("size-4 transition-transform group-hover:scale-110", active && "text-primary")} />
                <span className="flex-1 truncate">{item.label}</span>
                {"badge" in item && item.badge && (
                  <span className="rounded-full bg-gradient-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    {item.badge}
                  </span>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="m-3 rounded-2xl border border-sidebar-border bg-sidebar-accent/30 p-4 backdrop-blur">
        <p className="text-xs font-semibold text-sidebar-foreground">Cần hỗ trợ?</p>
        <p className="mt-1 text-[11px] text-sidebar-foreground/60">Liên hệ team kỹ thuật MomoFund 24/7.</p>
        <button className="bg-gradient-accent mt-3 w-full rounded-lg py-1.5 text-xs font-semibold text-white shadow-glow transition-transform hover:scale-[1.02]">
          Mở ticket
        </button>
      </div>
    </aside>
  );
}
