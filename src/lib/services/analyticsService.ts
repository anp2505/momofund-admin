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
  if (typeof value === "string") {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
    
    // Try DD/MM/YYYY
    const match = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (match) {
      return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
    }
  }
  return null;
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    // Remove all non-numeric characters except dots and minus signs
    const cleaned = value.replace(/[^0-9.-]+/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function buildTimeBuckets(start?: Date, end?: Date) {
  const endDate = end || new Date();
  const startDate = start || new Date(endDate.getFullYear(), endDate.getMonth() - 11, 1);
  
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isDaily = diffDays <= 60;
  
  const buckets: string[] = [];
  const formatKey = (d: Date) => isDaily 
    ? `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`
    : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    
  const displayLabel = (key: string) => isDaily ? key : `T${key.split("-")[1]}`;
  
  let current = new Date(startDate);
  if (!isDaily) {
    current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  } else {
    current.setHours(0, 0, 0, 0);
  }
  
  while (current <= endDate) {
    buckets.push(formatKey(current));
    if (isDaily) {
      current.setDate(current.getDate() + 1);
    } else {
      current.setMonth(current.getMonth() + 1);
    }
  }
  
  return { buckets, formatKey, displayLabel, isDaily };
}

export async function fetchUserGrowthData(startDate?: Date, endDate?: Date) {
  try {
    const [usersSnap, fundsSnap] = await Promise.all([
      getDocs(collection(db, "users")),
      getDocs(collection(db, "funds")),
    ]);

    const { buckets, formatKey, displayLabel } = buildTimeBuckets(startDate, endDate);
    const growthMap = buckets.reduce<Record<string, { users: number; funds: number }>>((acc, key) => {
      acc[key] = { users: 0, funds: 0 };
      return acc;
    }, {} as Record<string, { users: number; funds: number }>);

    usersSnap.docs.forEach(doc => {
      const createdAt = parseTimestamp(doc.data().createdAt ?? doc.data().created_at);
      if (!createdAt) return;
      if (startDate && createdAt < startDate) return;
      if (endDate && createdAt > endDate) return;
      
      const key = formatKey(createdAt);
      if (growthMap[key]) {
        growthMap[key].users += 1;
      }
    });

    fundsSnap.docs.forEach(doc => {
      const createdAt = parseTimestamp(doc.data().createdAt ?? doc.data().created_at);
      if (!createdAt) return;
      if (startDate && createdAt < startDate) return;
      if (endDate && createdAt > endDate) return;

      const key = formatKey(createdAt);
      if (growthMap[key]) {
        growthMap[key].funds += 1;
      }
    });

    return buckets.map(key => ({ month: displayLabel(key), users: growthMap[key].users, funds: growthMap[key].funds }));
  } catch (error) {
    console.error("Error fetching user growth data:", error);
    return Array.from({ length: 12 }, (_, i) => ({
      month: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"][i],
      users: 0,
      funds: 0,
    }));
  }
}

export async function fetchTransactionVolumeData(startDate?: Date, endDate?: Date) {
  try {
    const end = endDate || new Date();
    const start = startDate || new Date(end.getTime() - 13 * 24 * 60 * 60 * 1000);

    const ref = collection(db, "transactions");
    let q = query(ref, where("createdAt", ">=", Timestamp.fromDate(start)), orderBy("createdAt", "asc"));
    const snap = await getDocs(q);

    const { buckets, formatKey, displayLabel } = buildTimeBuckets(startDate, endDate);

    const volumeMap = new Map<string, number>();
    for (const key of buckets) {
      volumeMap.set(key, 0);
    }

    snap.docs.forEach(doc => {
      const createdAt = parseTimestamp(doc.data().createdAt ?? doc.data().created_at);
      if (!createdAt || createdAt > end) return;
      const key = formatKey(createdAt);
      if (volumeMap.has(key)) {
        volumeMap.set(key, volumeMap.get(key)! + toNumber(doc.data().amount));
      }
    });

    return Array.from(volumeMap.entries()).map(([key, volume]) => ({
      day: displayLabel(key),
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

export async function fetchFundStatusData(startDate?: Date, endDate?: Date) {
  try {
    const snap = await getDocs(collection(db, "funds"));
    const counts: Record<string, number> = { ACTIVE: 0, PAUSED: 0, CLOSED: 0 };
    snap.docs.forEach(doc => {
      const createdAt = parseTimestamp(doc.data().createdAt ?? doc.data().created_at);
      if (startDate && createdAt && createdAt < startDate) return;
      if (endDate && createdAt && createdAt > endDate) return;
      
      const status = (doc.data().status ?? doc.data().fundStatus ?? doc.data().fund_status as string) ?? "ACTIVE";
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

export async function fetchDashboardStats(startDate?: Date, endDate?: Date) {
  try {
    const [usersSnap, fundsSnap, txSnap, reportsSnap] = await Promise.all([
      getDocs(collection(db, "users")),
      getDocs(collection(db, "funds")),
      getDocs(collection(db, "transactions")),
      getDocs(collection(db, "reports")),
    ]);

    const filterByDate = (docs: any[]) => {
      if (!startDate && !endDate) return docs;
      return docs.filter(doc => {
        const createdAt = parseTimestamp(doc.data().createdAt ?? doc.data().created_at);
        if (!createdAt) return true;
        if (startDate && createdAt < startDate) return false;
        if (endDate && createdAt > endDate) return false;
        return true;
      });
    };

    const filteredUsers = filterByDate(usersSnap.docs);
    const filteredFunds = filterByDate(fundsSnap.docs);
    const filteredTx = filterByDate(txSnap.docs);
    const filteredReports = filterByDate(reportsSnap.docs);

    const totalCirculating = filteredFunds.reduce((sum, doc) => {
      const data = doc.data();
      const balance = data.current_balance ?? data.currentBalance ?? data.balance ?? 0;
      return sum + toNumber(balance);
    }, 0);
    const pendingReports = filteredReports.filter(doc => (doc.data().status ?? doc.data().report_status as string) === "PENDING").length;

    return {
      totalUsers: filteredUsers.length,
      totalFunds: filteredFunds.length,
      totalTransactions: filteredTx.length,
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
