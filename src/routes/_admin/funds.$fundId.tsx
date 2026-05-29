import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Users as UsersIcon, ArrowDownCircle, ArrowUpCircle, Loader } from "lucide-react";
import { motion } from "motion/react";
import {
  fetchFundById,
  fetchMembersByFundId,
  fetchTransactionsByFundId,
  fetchTransactionStats,
  formatVND,
  formatDate,
  formatDateTime,
  type Fund,
  type FundMember,
  type Transaction,
} from "@/lib/mock-data";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_admin/funds/$fundId")({
  head: ({ params }) => ({ meta: [{ title: `Quỹ ${params.fundId} — MomoFund Admin` }] }),
  component: FundDetail,
});

function FundDetail() {
  const { fundId } = Route.useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fund, setFund] = useState<Fund | null>(null);
  const [members, setMembers] = useState<FundMember[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionStats, setTransactionStats] = useState({ totalTransactions: 0, totalAmount: 0 });

  useEffect(() => {
    const loadFund = async () => {
      try {
        setLoading(true);
        const fundData = await fetchFundById(fundId);
        if (!fundData) {
          navigate({ to: "/funds" });
          return;
        }
        setFund(fundData);

        const [membersData, txData, txStats] = await Promise.all([
          fetchMembersByFundId(fundId),
          fetchTransactionsByFundId(fundId),
          fetchTransactionStats(fundId),
        ]);

        setMembers(membersData);
        setTransactions(txData);
        setTransactionStats(txStats);
      } catch (error) {
        console.error("Error loading fund:", error);
      } finally {
        setLoading(false);
      }
    };
    loadFund();
  }, [fundId, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!fund) {
    return <div className="p-4 text-center text-muted-foreground">Không tìm thấy quỹ</div>;
  }

  const pct = Math.min(100, Math.round((fund.current_balance / fund.target_amount) * 100));

  return (
    <div className="space-y-6">
      <button onClick={() => navigate({ to: "/funds" })} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />Quay lại
      </button>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
        <div className="bg-gradient-primary relative h-40">
          <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-mesh)" }} />
        </div>
        <div className="px-6 pb-6">
          <div className="-mt-10 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <img src={fund.avatar_url} alt="" className="size-20 rounded-2xl border-4 border-card bg-white" />
              <div className="pb-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{fund.fund_name}</h1>
                  <StatusBadge status={fund.fund_status} />
                  <StatusBadge status={fund.privacy_type} />
                </div>
                <p className="text-sm text-muted-foreground">Chủ quỹ: <Link to="/_admin/users/$userId" params={{ userId: fund.owner_id }} className="text-primary hover:underline">{fund.owner_name}</Link></p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{fund.description}</p>

          <div className="mt-6 rounded-2xl border border-border/60 bg-secondary/40 p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Số dư hiện tại</p>
                <p className="text-3xl font-bold text-gradient">{formatVND(fund.current_balance)}</p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                Mục tiêu: <span className="font-semibold text-foreground">{formatVND(fund.target_amount)}</span>
              </div>
            </div>
            <Progress value={pct} className="mt-3 h-3" />
            <p className="mt-1 text-xs text-muted-foreground">Đã đạt {pct}% mục tiêu</p>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-card border border-border/60 p-1">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="members">Thành viên ({fund.members_count})</TabsTrigger>
          <TabsTrigger value="transactions">Giao dịch</TabsTrigger>
          <TabsTrigger value="reports">Báo cáo liên quan</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 grid gap-4 md:grid-cols-3">
          <StatBlock label="Tổng giao dịch" value={String(transactionStats.totalTransactions)} />
          <StatBlock label="Tổng tiền góp" value={formatVND(transactionStats.totalAmount)} />
          <StatBlock label="Thành viên" value={String(fund.members_count)} />
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
            <div className="grid gap-3 md:grid-cols-2">
              {members.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">Không có thành viên</div>
              ) : members.map(m => (
                <div key={m.user_id} className="flex items-center gap-3 rounded-xl border border-border/50 p-3">
                  <Avatar><AvatarImage src={m.user_avatar_url} /><AvatarFallback>{m.user_name?.[0] ?? "?"}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{m.user_name}</p>
                    <p className="text-xs text-muted-foreground">Đóng góp: {formatVND(m.contribution_amount ?? 0)}</p>
                  </div>
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">{m.role ?? "MEMBER"}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
            <ul className="space-y-2">
              {transactions.length === 0 ? (
                <li className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">Không có giao dịch cho quỹ này</li>
              ) : transactions.map(tx => (
                <li key={tx.transaction_id} className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted/40">
                  <div className={`flex size-10 items-center justify-center rounded-xl ${tx.type === "DEPOSIT" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                    {tx.type === "DEPOSIT" ? <ArrowDownCircle className="size-5" /> : <ArrowUpCircle className="size-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{tx.type === "DEPOSIT" ? "Nạp quỹ" : "Rút quỹ"} — {tx.user_name || tx.user_id}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(tx.created_at)}</p>
                  </div>
                  <span className={`font-semibold ${tx.type === "DEPOSIT" ? "text-success" : "text-destructive"}`}>
                    {tx.type === "DEPOSIT" ? "+" : "-"}{formatVND(tx.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <div className="rounded-2xl border border-border/60 bg-card p-8 text-center shadow-card">
            <UsersIcon className="mx-auto size-10 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Chưa có báo cáo nào liên quan đến quỹ này.</p>
            <p className="text-xs text-muted-foreground">Tạo từ {formatDate(fund.created_at)}</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
