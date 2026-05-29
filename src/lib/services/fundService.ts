import {
  collection, getDocs, query, where,
  doc, getDoc, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Fund } from "@/lib/mock-data";

/**
 * Chuyển một Firestore document thành Fund object
 */
function docToFund(docSnap: { id: string; data: () => Record<string, unknown> }): Fund {
  const data = docSnap.data();
  const get = <T>(...keys: string[]): T | undefined => {
    for (const k of keys) {
      if (Object.prototype.hasOwnProperty.call(data, k) && data[k] != null) return data[k] as T;
    }
    return undefined;
  };

  const created = get<any>("createdAt", "created_at");
  const createdStr = created instanceof Timestamp
    ? created.toDate().toISOString()
    : (typeof created === "string" ? created : undefined) ?? "";

  const toNumber = (v: unknown) => typeof v === "number" ? v : (typeof v === "string" && v !== "" ? Number(v) || 0 : 0);

  return {
    fund_id: docSnap.id,
    owner_id: (get<string>("ownerId", "owner_id") as string) ?? "",
    owner_name: (get<string>("ownerName", "owner_name") as string) ?? "",
    fund_name: (get<string>("name", "fundName", "fund_name") as string) ?? "",
    description: (get<string>("description") as string) ?? "",
    avatar_url: (get<string>("photoURL", "avatarUrl", "avatar_url") as string) ?? "",
    privacy_type: (get<string>("privacyType", "privacy_type") as Fund["privacy_type"]) ?? "PUBLIC",
    fund_status: (get<string>("status", "fundStatus", "fund_status") as Fund["fund_status"]) ?? "ACTIVE",
    target_amount: toNumber(get<unknown>("targetAmount", "target_amount")),
    current_balance: toNumber(get<unknown>("balance", "currentBalance", "current_balance")),
    created_at: createdStr,
    members_count: toNumber(get<unknown>("memberCount", "membersCount", "members_count")),
  };
}

/**
 * Lấy tất cả quỹ từ Firestore
 */
export async function fetchFunds(startDate?: Date, endDate?: Date): Promise<Fund[]> {
  try {
    const snap = await getDocs(collection(db, "funds"));
    let funds = snap.docs.map(docToFund);
    
    if (startDate || endDate) {
      funds = funds.filter(f => {
        if (!f.created_at) return true;
        
        // parse date properly
        const d = new Date(f.created_at);
        if (isNaN(d.getTime())) return true;
        
        if (startDate && d < startDate) return false;
        if (endDate && d > endDate) return false;
        return true;
      });
    }
    return funds;
  } catch (error) {
    console.error("Error fetching funds:", error);
    return [];
  }
}

/**
 * Lấy một quỹ theo ID (dùng getDoc trực tiếp)
 */
export async function fetchFundById(fundId: string): Promise<Fund | null> {
  try {
    const snap = await getDoc(doc(db, "funds", fundId));
    if (!snap.exists()) return null;
    return docToFund(snap);
  } catch (error) {
    console.error("Error fetching fund:", error);
    return null;
  }
}

/**
 * Lấy quỹ theo trạng thái
 */
export async function fetchFundsByStatus(status: string): Promise<Fund[]> {
  try {
    const q = query(collection(db, "funds"), where("fund_status", "==", status));
    const snap = await getDocs(q);
    return snap.docs.map(docToFund);
  } catch (error) {
    console.error("Error fetching funds by status:", error);
    return [];
  }
}

/**
 * Lấy quỹ theo chủ sở hữu
 */
export async function fetchFundsByOwner(ownerId: string): Promise<Fund[]> {
  try {
    const q = query(collection(db, "funds"), where("owner_id", "==", ownerId));
    const snap = await getDocs(q);
    return snap.docs.map(docToFund);
  } catch (error) {
    console.error("Error fetching funds by owner:", error);
    return [];
  }
}

/**
 * Thống kê quỹ
 */
export async function getFundStats() {
  try {
    const funds = await fetchFunds();
    const totalBalance = funds.reduce((s, f) => s + f.current_balance, 0);
    const totalTarget = funds.reduce((s, f) => s + f.target_amount, 0);
    const totalMembers = funds.reduce((s, f) => s + f.members_count, 0);
    return {
      total: funds.length,
      active: funds.filter(f => f.fund_status === "ACTIVE").length,
      paused: funds.filter(f => f.fund_status === "PAUSED").length,
      closed: funds.filter(f => f.fund_status === "CLOSED").length,
      totalBalance,
      totalTarget,
      totalMembers,
      averageProgress: totalTarget > 0
        ? Math.round((totalBalance / totalTarget) * 100)
        : 0,
    };
  } catch (error) {
    console.error("Error getting fund stats:", error);
    return { total: 0, active: 0, paused: 0, closed: 0, totalBalance: 0, totalTarget: 0, totalMembers: 0, averageProgress: 0 };
  }
}
