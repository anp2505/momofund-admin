import { collection, getDocs, query, where, orderBy, limit, doc, getDoc, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ActivityLog } from "@/lib/mock-data";

/**
 * Fetch user display name by ID
 */
async function getUserDisplayName(userId: string): Promise<string> {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data().displayName || userId;
    }
    return userId;
  } catch (error) {
    console.error("Error fetching user display name:", error);
    return userId;
  }
}

/**
 * Fetch all activity logs from Firestore (with limit for performance)
 */
export async function fetchActivityLogs(limitCount: number = 100): Promise<ActivityLog[]> {
  try {
    const logsRef = collection(db, "activityLogs");
    const q = query(logsRef, orderBy("createdAt", "desc"), limit(limitCount));
    const querySnapshot = await getDocs(q);
    
    // Fetch all logs and enrich with actor names
    const logsWithNames = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const actorName = await getUserDisplayName(data.actorId);
        
        return {
          log_id: doc.id,
          actor_id: data.actorId,
          actor_name: actorName,
          action: data.action,
          target_type: data.targetType || "",
          target_id: data.targetId || "",
          detail: data.detail || "",
          ip_address: data.ipAddress || "",
          created_at: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : (data.createdAt || "")
        } as ActivityLog;
      })
    );
    
    return logsWithNames;
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return [];
  }
}

/**
 * Fetch activity logs by actor
 */
export async function fetchActivityLogsByActor(actorId: string): Promise<ActivityLog[]> {
  try {
    const logsRef = collection(db, "activityLogs");
    const q = query(logsRef, where("actorId", "==", actorId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const logsWithNames = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const actorName = await getUserDisplayName(data.actorId);
        
        return {
          log_id: doc.id,
          actor_id: data.actorId,
          actor_name: actorName,
          action: data.action,
          target_type: data.targetType || "",
          target_id: data.targetId || "",
          detail: data.detail || "",
          ip_address: data.ipAddress || "",
          created_at: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : (data.createdAt || "")
        } as ActivityLog;
      })
    );
    
    return logsWithNames;
  } catch (error) {
    console.error("Error fetching activity logs by actor:", error);
    return [];
  }
}

/**
 * Fetch activity logs by action type
 */
export async function fetchActivityLogsByAction(action: string): Promise<ActivityLog[]> {
  try {
    const logsRef = collection(db, "activityLogs");
    const q = query(logsRef, where("action", "==", action), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const logsWithNames = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const actorName = await getUserDisplayName(data.actorId);
        
        return {
          log_id: doc.id,
          actor_id: data.actorId,
          actor_name: actorName,
          action: data.action,
          target_type: data.targetType || "",
          target_id: data.targetId || "",
          detail: data.detail || "",
          ip_address: data.ipAddress || "",
          created_at: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : (data.createdAt || "")
        } as ActivityLog;
      })
    );
    
    return logsWithNames;
  } catch (error) {
    console.error("Error fetching activity logs by action:", error);
    return [];
  }
}

/**
 * Fetch activity logs by target
 */
export async function fetchActivityLogsByTarget(targetId: string): Promise<ActivityLog[]> {
  try {
    const logsRef = collection(db, "activityLogs");
    const q = query(logsRef, where("targetId", "==", targetId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const logsWithNames = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const actorName = await getUserDisplayName(data.actorId);
        
        return {
          log_id: doc.id,
          actor_id: data.actorId,
          actor_name: actorName,
          action: data.action,
          target_type: data.targetType || "",
          target_id: data.targetId || "",
          detail: data.detail || "",
          ip_address: data.ipAddress || "",
          created_at: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : (data.createdAt || "")
        } as ActivityLog;
      })
    );
    
    return logsWithNames;
  } catch (error) {
    console.error("Error fetching activity logs by target:", error);
    return [];
  }
}

/**
 * Create an activity log entry
 */
export async function createActivityLog(
  actorId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  detail?: string,
  ipAddress?: string
): Promise<void> {
  try {
    const logsRef = collection(db, "activityLogs");
    await addDoc(logsRef, {
      actorId,
      action,
      targetType: targetType || "",
      targetId: targetId || "",
      detail: detail || "",
      ipAddress: ipAddress || "",
      createdAt: Timestamp.now()
    });
  } catch (error) {
    console.error("Error creating activity log:", error);
  }
}
