import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Transaction {
  transaction_id: string;
  fund_id: string;
  user_id: string;
  user_name: string;
  type: "DEPOSIT" | "WITHDRAW" | "TRANSFER" | string;
  amount: number;
  created_at: string;
}

export interface TransactionStats {
  totalTransactions: number;
  totalDeposit: number;
  totalWithdraw: number;
  totalAmount: number;
  netAmount: number;
}

function normalizeNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return value === "" ? 0 : Number(value) || 0;
  return 0;
}

function getTransactionSign(type: string) {
  return type === "WITHDRAW" ? -1 : 1;
}

export async function fetchTransactionsByFundId(fundId: string): Promise<Transaction[]> {
  try {
    const ref = collection(db, "transactions");
    const q = query(ref, where("fund_id", "==", fundId), orderBy("created_at", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(doc => {
      const data = doc.data();
      const get = <T>(...keys: string[]): T | undefined => {
        for (const k of keys) {
          if (Object.prototype.hasOwnProperty.call(data, k) && data[k] != null) return data[k] as T;
        }
        return undefined;
      };

      const created = get<any>("created_at", "createdAt");
      const createdStr = created?.toDate ? (created as any).toDate().toISOString() : (typeof created === "string" ? created : "");
      const rawAmount = get<unknown>("amount");
      const amount = normalizeNumber(rawAmount);

      return {
        transaction_id: doc.id,
        fund_id: (get<string>("fund_id", "fundId") as string) ?? "",
        user_id: (get<string>("user_id", "userId") as string) ?? "",
        user_name: (get<string>("user_name", "userName") as string) ?? "",
        type: (get<string>("type") as string) ?? "DEPOSIT",
        amount,
        created_at: createdStr,
      };
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

export async function fetchTransactionStats(fundId: string): Promise<TransactionStats> {
  try {
    const transactions = await fetchTransactionsByFundId(fundId);
    const totalDeposit = transactions
      .filter(tx => tx.type === "DEPOSIT")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalWithdraw = transactions
      .filter(tx => tx.type === "WITHDRAW")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalAmount = totalDeposit;
    return {
      totalTransactions: transactions.length,
      totalDeposit,
      totalWithdraw,
      totalAmount,
      netAmount: totalDeposit - totalWithdraw,
    };
  } catch (error) {
    console.error("Error fetching transaction stats:", error);
    return {
      totalTransactions: 0,
      totalDeposit: 0,
      totalWithdraw: 0,
      totalAmount: 0,
      netAmount: 0,
    };
  }
}

export async function fetchFundBalanceFromTransactions(fundId: string): Promise<number> {
  try {
    const stats = await fetchTransactionStats(fundId);
    return stats.netAmount;
  } catch (error) {
    console.error("Error fetching fund balance from transactions:", error);
    return 0;
  }
}
