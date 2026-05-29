import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ActivityLog } from "@/lib/mock-data";

/**
 * Fetch all activity logs from Firestore (with limit for performance)
 */
export async function fetchActivityLogs(limitCount: number = 100): Promise<ActivityLog[]> {
  try {
    const logsRef = collection(db, "activity_logs");
    const q = query(logsRef, orderBy("created_at", "desc"), limit(limitCount));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      log_id: doc.id,
      ...doc.data()
    } as ActivityLog));
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
    const logsRef = collection(db, "activity_logs");
    const q = query(logsRef, where("actor_id", "==", actorId), orderBy("created_at", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      log_id: doc.id,
      ...doc.data()
    } as ActivityLog));
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
    const logsRef = collection(db, "activity_logs");
    const q = query(logsRef, where("action", "==", action), orderBy("created_at", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      log_id: doc.id,
      ...doc.data()
    } as ActivityLog));
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
    const logsRef = collection(db, "activity_logs");
    const q = query(logsRef, where("target_id", "==", targetId), orderBy("created_at", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      log_id: doc.id,
      ...doc.data()
    } as ActivityLog));
  } catch (error) {
    console.error("Error fetching activity logs by target:", error);
    return [];
  }
}
