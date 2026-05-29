import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Đăng ký — MomoFund Admin" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: fullName
      });
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') {
        setError("Email này đã được sử dụng");
      } else {
        setError(err?.message ?? "Đăng ký thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 shadow-card">
        <h1 className="text-2xl font-bold mb-4">Đăng ký Admin</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Họ và tên</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} type="text" required className="w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required className="w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Mật khẩu</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" required className="w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Xác nhận mật khẩu</label>
            <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type="password" required className="w-full rounded-md border px-3 py-2" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex items-center justify-between mt-6">
            <button type="submit" className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white" disabled={loading}>
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
