import { collection, getDocs, query, where, getDoc, doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Report, ReportStatus } from "@/lib/mock-data";

export async function fetchReports(): Promise<Report[]> {
  try {
    const reportsRef = collection(db, "reports");
    const querySnapshot = await getDocs(reportsRef);
    return querySnapshot.docs.map(doc => ({
      report_id: doc.id,
      ...doc.data()
    } as Report));
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
    return {
      report_id: snap.id,
      ...snap.data()
    } as Report;
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
    await updateDoc(reportRef, {
      report_status: status,
      resolution_note: note,
      handled_at: Timestamp.now(),
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
    const q = query(reportsRef, where("report_status", "==", status));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      report_id: doc.id,
      ...doc.data()
    } as Report));
  } catch (error) {
    console.error("Error fetching reports by status:", error);
    return [];
  }
}

export async function fetchReportsByTarget(targetId: string): Promise<Report[]> {
  try {
    const reportsRef = collection(db, "reports");
    const q = query(reportsRef, where("target_id", "==", targetId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      report_id: doc.id,
      ...doc.data()
    } as Report));
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
      pending: reports.filter(r => r.report_status === "PENDING").length,
      resolved: reports.filter(r => r.report_status === "RESOLVED").length,
      dismissed: reports.filter(r => r.report_status === "DISMISSED").length,
    };
  } catch (error) {
    console.error("Error getting report stats:", error);
    return { total: 0, pending: 0, resolved: 0, dismissed: 0 };
  }
}
