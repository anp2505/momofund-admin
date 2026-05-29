import { collection, getDocs, query, where, getDoc, doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Report, ReportStatus } from "@/lib/mock-data";

function getField<T>(data: Record<string, unknown>, ...keys: string[]): T | undefined {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(data, key) && data[key] != null) {
      return data[key] as T;
    }
  }
  return undefined;
}

function normalizeTimestamp(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return "";
}

function normalizeStatus(status: unknown): ReportStatus {
  const normalized = String(status ?? "").toUpperCase();
  if (normalized === "PENDING" || normalized === "RESOLVED" || normalized === "DISMISSED") {
    return normalized as ReportStatus;
  }
  return "PENDING";
}

function docToReport(docSnap: { id: string; data: () => Record<string, unknown> }): Report {
  const data = docSnap.data();

  return {
    reportId: docSnap.id,
    reporterId: getField<string>(data, "reporterId", "reporter_id") ?? "",
    reporterName: getField<string>(data, "reporterName", "reporter_name") ?? "",
    targetType: (getField<string>(data, "targetType", "target_type")?.toUpperCase() as "USER" | "FUND") ?? "USER",
    targetId: getField<string>(data, "targetId", "target_id") ?? "",
    targetName: getField<string>(data, "targetName", "target_name") ?? "",
    reason: getField<string>(data, "reason") ?? "",
    reportStatus: normalizeStatus(getField<string>(data, "reportStatus", "report_status", "status")),
    resolutionNote: getField<string>(data, "resolutionNote", "resolution_note"),
    createdAt: normalizeTimestamp(getField<unknown>(data, "createdAt", "created_at")),
    handledAt: normalizeTimestamp(getField<unknown>(data, "handledAt", "handled_at")),
    handledBy: getField<string>(data, "handledBy", "handled_by"),
  };
}

export async function fetchReports(startDate?: Date, endDate?: Date): Promise<Report[]> {
  try {
    const reportsRef = collection(db, "reports");
    const querySnapshot = await getDocs(reportsRef);
    let reports = querySnapshot.docs.map(docToReport);

    if (startDate || endDate) {
      reports = reports.filter(r => {
        if (!r.createdAt) return true;
        const d = new Date(r.createdAt);
        if (isNaN(d.getTime())) return true;
        if (startDate && d < startDate) return false;
        if (endDate && d > endDate) return false;
        return true;
      });
    }
    return reports;
  } catch (error) {
    console.error("Error fetching reports:", error);
    return [];
  }
}

export async function fetchReportById(reportId: string): Promise<Report | null> {
  try {
    const reportRef = doc(db, "reports", reportId);
    const snap = await getDoc(reportRef);
    if (!snap.exists()) return null;
    return docToReport(snap);
  } catch (error) {
    console.error("Error fetching report:", error);
    return null;
  }
}

export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  note: string,
  adminId: string
): Promise<boolean> {
  try {
    const reportRef = doc(db, "reports", reportId);
    const now = Timestamp.now();
    await updateDoc(reportRef, {
      reportStatus: status,
      report_status: status,
      resolutionNote: note,
      resolution_note: note,
      handledAt: now,
      handled_at: now,
      handledBy: adminId,
      handled_by: adminId,
    });
    return true;
  } catch (error) {
    console.error("Error updating report status:", error);
    return false;
  }
}

export async function fetchReportsByStatus(status: ReportStatus): Promise<Report[]> {
  try {
    const reportsRef = collection(db, "reports");
    let querySnapshot = await getDocs(query(reportsRef, where("reportStatus", "==", status)));
    if (querySnapshot.empty) {
      querySnapshot = await getDocs(query(reportsRef, where("report_status", "==", status)));
    }
    return querySnapshot.docs.map(docToReport);
  } catch (error) {
    console.error("Error fetching reports by status:", error);
    return [];
  }
}

export async function fetchReportsByTarget(targetId: string): Promise<Report[]> {
  try {
    const reportsRef = collection(db, "reports");
    let querySnapshot = await getDocs(query(reportsRef, where("targetId", "==", targetId)));
    if (querySnapshot.empty) {
      querySnapshot = await getDocs(query(reportsRef, where("target_id", "==", targetId)));
    }
    return querySnapshot.docs.map(docToReport);
  } catch (error) {
    console.error("Error fetching reports by target:", error);
    return [];
  }
}

export async function getReportStats() {
  try {
    const reports = await fetchReports();
    return {
      total: reports.length,
      pending: reports.filter(r => r.reportStatus === "PENDING").length,
      resolved: reports.filter(r => r.reportStatus === "RESOLVED").length,
      dismissed: reports.filter(r => r.reportStatus === "DISMISSED").length,
    };
  } catch (error) {
    console.error("Error getting report stats:", error);
    return { total: 0, pending: 0, resolved: 0, dismissed: 0 };
  }
}
