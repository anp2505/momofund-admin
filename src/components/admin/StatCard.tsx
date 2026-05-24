import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  accent?: "primary" | "accent" | "success" | "warning";
  index?: number;
}

const accents = {
  primary: "from-primary/20 to-primary/0 text-primary",
  accent: "from-accent/20 to-accent/0 text-accent",
  success: "from-success/20 to-success/0 text-success",
  warning: "from-warning/30 to-warning/0 text-warning-foreground",
};

export function StatCard({ label, value, delta, trend = "up", icon: Icon, accent = "primary", index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-card hover:shadow-glow transition-shadow"
    >
      <div className={cn("absolute -right-8 -top-8 size-32 rounded-full bg-gradient-to-br blur-2xl opacity-60", accents[accent])} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {delta && (
            <p className={cn("mt-1.5 text-xs font-medium", trend === "up" ? "text-success" : "text-destructive")}>
              {trend === "up" ? "▲" : "▼"} {delta}
            </p>
          )}
        </div>
        <div className={cn("flex size-11 items-center justify-center rounded-xl bg-gradient-to-br", accents[accent])}>
          <Icon className="size-5" />
        </div>
      </div>
    </motion.div>
  );
}
