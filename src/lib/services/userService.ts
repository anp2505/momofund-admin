import {
  collection, getDocs, query, where,
  doc, getDoc, updateDoc, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { User } from "@/lib/mock-data";

/**
 * Chuyển một Firestore document thành User object
 */
function docToUser(docSnap: { id: string; data: () => Record<string, unknown> }): User {
  const data = docSnap.data();
  const get = <T>(...keys: string[]): T | undefined => {
    for (const k of keys) {
      if (Object.prototype.hasOwnProperty.call(data, k) && data[k] != null) return data[k] as T;
    }
    return undefined;
  };

  const created = get<any>("createdAt", "created_at");
  const createdStr = created instanceof Timestamp ? created.toDate().toISOString() : (typeof created === "string" ? created : "");
  const lastLogin = get<any>("lastLoginAt", "last_login_at");
  const lastLoginStr = lastLogin instanceof Timestamp ? lastLogin.toDate().toISOString() : (typeof lastLogin === "string" ? lastLogin : "");
  const locked = get<any>("lockedAt", "locked_at");
  const lockedStr = locked instanceof Timestamp ? locked.toDate().toISOString() : (typeof locked === "string" ? locked : undefined);
  const toNumber = (v: unknown) => typeof v === "number" ? v : (typeof v === "string" && v !== "" ? Number(v) || 0 : 0);

  return {
    user_id: docSnap.id,
    email: (get<string>("email") as string) ?? "",
    full_name: (get<string>("displayName", "fullName", "full_name") as string) ?? "",
    avatar_url: (get<string>("photoURL", "avatarUrl", "avatar_url") as string) ?? "",
    phone_number: (get<string>("phoneNumber", "phone_number") as string) ?? "",
    account_status: (get<string>("status", "accountStatus", "account_status") as User["account_status"]) ?? "ACTIVE",
    role: (get<string>("role") as User["role"]) ?? "USER",
    created_at: createdStr,
    last_login_at: lastLoginStr,
    locked_at: lockedStr,
    locked_reason: get<string>("lockedReason", "locked_reason") as string | undefined,
    total_contributed: toNumber(get<unknown>("totalContributed", "total_contributed")),
    funds_joined: toNumber(get<unknown>("fundsJoined", "funds_joined")),
  };
}

/**
 * Lấy tất cả người dùng từ Firestore
 */
export async function fetchUsers(startDate?: Date, endDate?: Date): Promise<User[]> {
  try {
    const [snap, txSnap] = await Promise.all([
      getDocs(collection(db, "users")),
      getDocs(collection(db, "transactions"))
    ]);
    
    // Aggregate contributions and funds joined from transactions
    const userContributions = new Map<string, number>();
    const userFunds = new Map<string, Set<string>>();
    
    txSnap.docs.forEach(txDoc => {
      const data = txDoc.data();
      if (data.type === "contribution" && data.status === "completed") {
        const uid = data.userId;
        const fid = data.fundId;
        if (uid) {
          const amt = Number(data.amount) || 0;
          userContributions.set(uid, (userContributions.get(uid) || 0) + amt);
          if (fid) {
            if (!userFunds.has(uid)) userFunds.set(uid, new Set());
            userFunds.get(uid)!.add(fid);
          }
        }
      }
    });

    let users = snap.docs.map(doc => {
      const u = docToUser(doc);
      if (userContributions.has(u.user_id)) {
        u.total_contributed = userContributions.get(u.user_id)!;
      }
      if (userFunds.has(u.user_id)) {
        u.funds_joined = userFunds.get(u.user_id)!.size;
      }
      return u;
    });
    
    if (startDate || endDate) {
      users = users.filter(u => {
        if (!u.created_at) return true;
        
        // parse date properly
        const d = new Date(u.created_at);
        if (isNaN(d.getTime())) return true;
        
        if (startDate && d < startDate) return false;
        if (endDate && d > endDate) return false;
        return true;
      });
    }
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

/**
 * Lấy một người dùng theo ID (dùng getDoc trực tiếp theo document ID)
 */
export async function fetchUserById(userId: string): Promise<User | null> {
  try {
    const snap = await getDoc(doc(db, "users", userId));
    if (!snap.exists()) return null;
    return docToUser(snap);
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

/**
 * Lấy người dùng theo trạng thái hoặc vai trò
 */
export async function fetchUsersByFilter(
  filterType: "status" | "role",
  filterValue: string
): Promise<User[]> {
  try {
    const fieldName = filterType === "status" ? "account_status" : "role";
    const q = query(collection(db, "users"), where(fieldName, "==", filterValue));
    const snap = await getDocs(q);
    return snap.docs.map(docToUser);
  } catch (error) {
    console.error("Error fetching filtered users:", error);
    return [];
  }
}

/**
 * Thống kê số lượng người dùng
 */
export async function getUserStats() {
  try {
    const users = await fetchUsers();
    return {
      total: users.length,
      active: users.filter(u => u.account_status === "ACTIVE").length,
      locked: users.filter(u => u.account_status === "LOCKED").length,
      admin: users.filter(u => u.role === "ADMIN").length,
    };
  } catch (error) {
    console.error("Error getting user stats:", error);
    return { total: 0, active: 0, locked: 0, admin: 0 };
  }
}

/**
 * Khóa hoặc mở khóa tài khoản người dùng và ghi vào Firestore
 */
export async function updateUserLockStatus(
  userId: string,
  lock: boolean,
  reason?: string
): Promise<boolean> {
  try {
    const ref = doc(db, "users", userId);
    if (lock) {
      await updateDoc(ref, {
        account_status: "LOCKED",
        locked_at: Timestamp.now(),
        locked_reason: reason ?? "",
      });
    } else {
      await updateDoc(ref, {
        account_status: "ACTIVE",
        locked_at: null,
        locked_reason: null,
      });
    }
    return true;
  } catch (error) {
    console.error("Error updating user lock status:", error);
    return false;
  }
}
