import { Bell, Search, Moon, Sun, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AdminTopbar() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="glass-strong sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/60 px-6">
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Tìm kiếm người dùng, quỹ, báo cáo..."
          className="h-10 w-full rounded-xl border border-border bg-background/50 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
        />
        <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground md:inline">⌘K</kbd>
      </div>

      <button
        onClick={() => setDark(!dark)}
        className="flex size-10 items-center justify-center rounded-xl border border-border bg-background/50 transition-colors hover:bg-muted"
        aria-label="Toggle theme"
      >
        {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>

      <button className="relative flex size-10 items-center justify-center rounded-xl border border-border bg-background/50 transition-colors hover:bg-muted">
        <Bell className="size-4" />
        <span className="absolute right-2 top-2 size-2 rounded-full bg-gradient-primary ring-2 ring-background" />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-xl border border-border bg-background/50 py-1 pl-1 pr-3 transition-colors hover:bg-muted">
          <Avatar className="size-8">
            <AvatarImage src="https://i.pravatar.cc/150?img=12" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div className="hidden text-left md:block">
            <p className="text-xs font-semibold leading-tight">Admin MomoFund</p>
            <p className="text-[10px] text-muted-foreground">admin@momofund.vn</p>
          </div>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Hồ sơ</DropdownMenuItem>
          <DropdownMenuItem>Cài đặt bảo mật</DropdownMenuItem>
          <DropdownMenuItem>Hoạt động</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">Đăng xuất</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
