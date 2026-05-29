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
      const amount = typeof rawAmount === "number" ? rawAmount : (typeof rawAmount === "string" ? Number(rawAmount) || 0 : 0);

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

export async function fetchTransactionStats(fundId: string) {
  try {
    const transactions = await fetchTransactionsByFundId(fundId);
    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    return {
      totalTransactions: transactions.length,
      totalAmount,
    };
  } catch (error) {
    console.error("Error fetching transaction stats:", error);
    return {
      totalTransactions: 0,
      totalAmount: 0,
    };
  }
}
