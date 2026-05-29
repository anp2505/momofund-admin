import { Bell, Search, Moon, Sun, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth } from "@/lib/firebase";
import { signOut, onAuthStateChanged, type User } from "firebase/auth";
import { useNavigate } from "@tanstack/react-router";

export function AdminTopbar() {
  const [dark, setDark] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate({ to: "/login" });
  };

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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative flex size-10 items-center justify-center rounded-xl border border-border bg-background/50 transition-colors hover:bg-muted outline-none">
            <Bell className="size-4" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-gradient-primary ring-2 ring-background" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="font-semibold text-sm">Thông báo</span>
            <span className="text-xs text-primary cursor-pointer hover:underline">Đánh dấu đã đọc</span>
          </div>
          <DropdownMenuSeparator />
          <div className="max-h-[300px] overflow-y-auto">
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-4 cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-primary"></span>
                <span className="font-semibold text-sm">Báo cáo mới</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">Người dùng Nguyễn Văn A vừa gửi một báo cáo vi phạm đối với quỹ "Đi vũng tàu".</p>
              <span className="text-[10px] text-muted-foreground mt-1">10 phút trước</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-4 cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-primary"></span>
                <span className="font-semibold text-sm">Hệ thống</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">Hệ thống vừa cập nhật phiên bản mới với nhiều tính năng bảo mật hơn.</p>
              <span className="text-[10px] text-muted-foreground mt-1">2 giờ trước</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-4 cursor-pointer">
              <span className="font-semibold text-sm">Người dùng mới</span>
              <p className="text-xs text-muted-foreground line-clamp-2">Có 50 người dùng đăng ký mới trong vòng 24h qua.</p>
              <span className="text-[10px] text-muted-foreground mt-1">Hôm qua</span>
            </DropdownMenuItem>
          </div>
          <DropdownMenuSeparator />
          <div className="p-2 text-center">
            <span className="text-xs text-primary cursor-pointer hover:underline">Xem tất cả thông báo</span>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-xl border border-border bg-background/50 py-1 pl-1 pr-3 transition-colors hover:bg-muted">
          <Avatar className="size-8">
            <AvatarImage src={user?.photoURL || "https://i.pravatar.cc/150?img=12"} />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div className="hidden text-left md:block">
            <p className="text-xs font-semibold leading-tight">{user?.displayName || "Admin MomoFund"}</p>
            <p className="text-[10px] text-muted-foreground">{user?.email || "Chưa đăng nhập"}</p>
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
          <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">Đăng xuất</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
