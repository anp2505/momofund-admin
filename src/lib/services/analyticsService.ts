import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

function parseTimestamp(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === "string") return new Date(value);
  return null;
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [, month] = key.split("-").map(Number);
  return `T${month}`;
}

function buildLastMonths(count: number) {
  const now = new Date();
  const months: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(formatMonthKey(d));
  }
  return months;
}

export async function fetchUserGrowthData() {
  try {
    const [usersSnap, fundsSnap] = await Promise.all([
      getDocs(collection(db, "users")),
      getDocs(collection(db, "funds")),
    ]);

    const months = buildLastMonths(12);
    const growthMap = months.reduce<Record<string, { users: number; funds: number }>>((acc, key) => {
      acc[key] = { users: 0, funds: 0 };
      return acc;
    }, {} as Record<string, { users: number; funds: number }>);

    usersSnap.docs.forEach(doc => {
      const createdAt = parseTimestamp(doc.data().created_at);
      if (!createdAt) return;
      const key = formatMonthKey(createdAt);
      if (growthMap[key]) {
        growthMap[key].users += 1;
      }
    });

    fundsSnap.docs.forEach(doc => {
      const createdAt = parseTimestamp(doc.data().created_at);
      if (!createdAt) return;
      const key = formatMonthKey(createdAt);
      if (growthMap[key]) {
        growthMap[key].funds += 1;
      }
    });

    return months.map(key => ({ month: monthLabel(key), users: growthMap[key].users, funds: growthMap[key].funds }));
  } catch (error) {
    console.error("Error fetching user growth data:", error);
    return Array.from({ length: 12 }, (_, i) => ({
      month: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"][i],
      users: 0,
      funds: 0,
    }));
  }
}

export async function fetchTransactionVolumeData() {
  try {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 13);

    const ref = collection(db, "transactions");
    const q = query(ref, where("created_at", ">=", Timestamp.fromDate(startDate)), orderBy("created_at", "asc"));
    const snap = await getDocs(q);

    const volumeMap = new Map<string, number>();
    for (let i = 0; i < 14; i += 1) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const key = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
      volumeMap.set(key, 0);
    }

    snap.docs.forEach(doc => {
      const createdAt = parseTimestamp(doc.data().created_at);
      if (!createdAt) return;
      const key = `${String(createdAt.getDate()).padStart(2, "0")}/${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
      if (volumeMap.has(key)) {
        volumeMap.set(key, volumeMap.get(key)! + ((doc.data().amount as number) ?? 0));
      }
    });

    return Array.from(volumeMap.entries()).map(([day, volume]) => ({
      day,
      volume: parseFloat((volume / 1_000_000).toFixed(2)),
    }));
  } catch (error) {
    console.error("Error fetching transaction volume data:", error);
    return Array.from({ length: 14 }, (_, i) => ({
      day: `${String(14 - i).padStart(2, "0")}/${String(new Date().getMonth() + 1).padStart(2, "0")}`,
      volume: 0,
    }));
  }
}

export async function fetchFundStatusData() {
  try {
    const snap = await getDocs(collection(db, "funds"));
    const counts: Record<string, number> = { ACTIVE: 0, PAUSED: 0, CLOSED: 0 };
    snap.docs.forEach(doc => {
      const status = (doc.data().fund_status as string) ?? "ACTIVE";
      counts[status] = (counts[status] || 0) + 1;
    });
    return [
      { name: "ACTIVE", value: counts.ACTIVE, color: "oklch(0.58 0.22 348)" },
      { name: "PAUSED", value: counts.PAUSED, color: "oklch(0.78 0.16 75)" },
      { name: "CLOSED", value: counts.CLOSED, color: "oklch(0.62 0.04 310)" },
    ];
  } catch (error) {
    console.error("Error fetching fund status data:", error);
    return [
      { name: "ACTIVE", value: 0, color: "oklch(0.58 0.22 348)" },
      { name: "PAUSED", value: 0, color: "oklch(0.78 0.16 75)" },
      { name: "CLOSED", value: 0, color: "oklch(0.62 0.04 310)" },
    ];
  }
}

export async function fetchDashboardStats() {
  try {
    const [usersSnap, fundsSnap, txSnap, reportsSnap] = await Promise.all([
      getDocs(collection(db, "users")),
      getDocs(collection(db, "funds")),
      getDocs(collection(db, "transactions")),
      getDocs(collection(db, "reports")),
    ]);

    const totalCirculating = fundsSnap.docs.reduce((sum, doc) => sum + toNumber(doc.data().current_balance), 0);
    const pendingReports = reportsSnap.docs.filter(doc => (doc.data().report_status as string) === "PENDING").length;

    return {
      totalUsers: usersSnap.size,
      totalFunds: fundsSnap.size,
      totalTransactions: txSnap.size,
      pendingReports,
      totalCirculating,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalUsers: 0,
      totalFunds: 0,
      totalTransactions: 0,
      pendingReports: 0,
      totalCirculating: 0,
    };
  }
}
