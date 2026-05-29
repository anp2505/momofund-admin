import { collection, getDocs, query, where, documentId } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Fund } from "@/lib/mock-data";
import { fetchFundById } from "@/lib/services/fundService";

export interface FundMember {
  member_id: string;
  fund_id: string;
  user_id: string;
  user_name: string;
  user_avatar_url?: string;
  role?: string;
  joined_at?: string;
  contribution_amount?: number;
}

export async function fetchMembersByFundId(fundId: string): Promise<FundMember[]> {
  try {
    const ref = collection(db, "fund_members");
    const q = query(ref, where("fund_id", "==", fundId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => {
        const data = doc.data();
        const get = <T>(...keys: string[]): T | undefined => {
          for (const k of keys) {
            if (Object.prototype.hasOwnProperty.call(data, k) && data[k] != null) return data[k] as T;
          }
          return undefined;
        };
        const joined = get<any>("joined_at", "joinedAt");
        const joinedStr = joined?.toDate ? (joined as any).toDate().toISOString() : (typeof joined === "string" ? joined : "");
        const contribution = get<unknown>("contribution_amount", "contributionAmount");
        const contributionAmt = typeof contribution === "number" ? contribution : (typeof contribution === "string" ? Number(contribution) || 0 : 0);

        return {
          member_id: doc.id,
          fund_id: (get<string>("fund_id", "fundId") as string) ?? "",
          user_id: (get<string>("user_id", "userId") as string) ?? "",
          user_name: (get<string>("user_name", "userName") as string) ?? "",
          user_avatar_url: (get<string>("user_avatar_url", "userAvatarUrl") as string) ?? "",
          role: (get<string>("role") as string) ?? "MEMBER",
          joined_at: joinedStr,
          contribution_amount: contributionAmt,
        };
    });
  } catch (error) {
    console.error("Error fetching fund members:", error);
    return [];
  }
}

export async function fetchFundsByUserId(userId: string): Promise<Fund[]> {
  try {
    const ref = collection(db, "fund_members");
    const q = query(ref, where("user_id", "==", userId));
    const snap = await getDocs(q);
    const fundIds = snap.docs
      .map(doc => doc.data().fund_id as string)
      .filter((id): id is string => Boolean(id));

    if (fundIds.length === 0) {
      return [];
    }

    if (fundIds.length <= 10) {
      const fundQuery = query(collection(db, "funds"), where(documentId(), "in", fundIds));
        const fundSnap = await getDocs(fundQuery);
        return fundSnap.docs.map(doc => {
          const d = doc.data();
          const get = <T>(...keys: string[]): T | undefined => {
            for (const k of keys) {
              if (Object.prototype.hasOwnProperty.call(d, k) && d[k] != null) return d[k] as T;
            }
            return undefined;
          };
          const created = get<any>("created_at", "createdAt");
          const createdStr = created?.toDate ? (created as any).toDate().toISOString() : (typeof created === "string" ? created : "");
          const toNumber = (v: unknown) => typeof v === "number" ? v : (typeof v === "string" && v !== "" ? Number(v) || 0 : 0);

          return {
            fund_id: doc.id,
            owner_id: (get<string>("owner_id", "ownerId") as string) ?? "",
            owner_name: (get<string>("owner_name", "ownerName") as string) ?? "",
            fund_name: (get<string>("fund_name", "fundName") as string) ?? "",
            description: (get<string>("description") as string) ?? "",
            avatar_url: (get<string>("avatar_url", "avatarUrl") as string) ?? "",
            privacy_type: (get<string>("privacy_type", "privacyType") as Fund["privacy_type"]) ?? "PUBLIC",
            fund_status: (get<string>("fund_status", "fundStatus") as Fund["fund_status"]) ?? "ACTIVE",
            target_amount: toNumber(get<unknown>("target_amount", "targetAmount")),
            current_balance: toNumber(get<unknown>("current_balance", "currentBalance")),
            created_at: createdStr,
            members_count: toNumber(get<unknown>("members_count", "membersCount")),
          };
        });
    }

    const funds: Fund[] = [];
    await Promise.all(fundIds.map(async fundId => {
      const fund = await fetchFundById(fundId);
      if (fund) funds.push(fund);
    }));
    return funds;
  } catch (error) {
    console.error("Error fetching funds by user id:", error);
    return [];
  }
}
