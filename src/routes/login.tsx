import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Đăng nhập — MomoFund Admin" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(err?.message ?? "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 shadow-card">
        <h1 className="text-2xl font-bold mb-4">Đăng nhập Admin</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required className="w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Mật khẩu</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" required className="w-full rounded-md border px-3 py-2" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex items-center justify-between">
            <button type="submit" className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
