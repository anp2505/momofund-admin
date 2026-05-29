import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Quên mật khẩu — MomoFund Admin" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      if (err?.code === 'auth/user-not-found') {
        setError("Không tìm thấy tài khoản với email này.");
      } else {
        setError(err?.message ?? "Không thể gửi email khôi phục.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 shadow-card">
        <h1 className="text-2xl font-bold mb-2">Quên mật khẩu?</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Nhập email của bạn và chúng tôi sẽ gửi liên kết để đặt lại mật khẩu.
        </p>
        
        {success ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-success/15 p-4 text-sm text-success">
              Đã gửi email khôi phục thành công! Vui lòng kiểm tra hộp thư đến (và hộp thư rác) của bạn.
            </div>
            <Link to="/login" className="flex w-full justify-center rounded-md bg-primary px-4 py-2 text-white">
              Quay lại Đăng nhập
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Email</label>
              <input 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                type="email" 
                required 
                placeholder="admin@momofund.vn"
                className="w-full rounded-md border px-3 py-2" 
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex flex-col gap-3 mt-6">
              <button type="submit" className="flex w-full justify-center items-center px-4 py-2 rounded-md bg-primary text-white" disabled={loading}>
                {loading ? "Đang gửi..." : "Gửi liên kết khôi phục"}
              </button>
              <Link to="/login" className="flex w-full justify-center items-center px-4 py-2 rounded-md border border-border hover:bg-muted text-foreground transition-colors">
                Quay lại Đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
