import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export const Route = createFileRoute("/_admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate({ to: "/login" });
      } else {
        setChecking(false);
      }
    });
    return () => unsub();
  }, [navigate]);

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center bg-background">Đang kiểm tra đăng nhập...</div>;
  }

  return (
    <div className="min-h-screen">
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminTopbar />
        <main className="px-6 py-8">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
