
'use client';

import {
  db,
  isFirebaseConfigured,
  warnPlaceholderFirebaseOnce,
  withFirestoreTimeout,
} from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
  limit,
  writeBatch,
} from "firebase/firestore";
import { DriverReport, BoardingLog } from "@/lib/types";
import { MOCK_REPORTS } from "@/lib/mock-data";
import {
  CACHE_TTL,
  cachedQuery,
  getCachedValue,
  invalidateCache,
  setCachedValue,
} from "@/lib/query-cache";

const COLLECTION_NAME = "reports";
const CACHE_KEY_ALL = "reports:all";

let demoReportsStore: DriverReport[] = [...MOCK_REPORTS];

export const reportService = {
  async addReport(report: Omit<DriverReport, "id" | "read">): Promise<string> {
    const payload = {
      ...report,
      read: false,
      type: report.type || 'NORMAL',
    };

    if (!isFirebaseConfigured) {
      warnPlaceholderFirebaseOnce("addReport");
      const newId = `R-${Date.now().toString().slice(-6)}`;
      demoReportsStore = [{ id: newId, ...payload }, ...demoReportsStore];
      setCachedValue(CACHE_KEY_ALL, [...demoReportsStore], CACHE_TTL.SHORT);
      return newId;
    }

    try {
      const docRef = await withFirestoreTimeout(
        addDoc(collection(db, COLLECTION_NAME), payload),
        "addReport"
      );
      const cached = getCachedValue<DriverReport[]>(CACHE_KEY_ALL);
      if (cached) {
        setCachedValue(CACHE_KEY_ALL, [{ id: docRef.id, ...payload }, ...cached], CACHE_TTL.SHORT);
      } else {
        invalidateCache("reports");
      }
      return docRef.id;
    } catch (error) {
      console.error("Error adding report:", error);
      throw new Error("Falha ao enviar relatório oficial.");
    }
  },

  async addBoardingLog(log: BoardingLog): Promise<void> {
    if (!isFirebaseConfigured) {
      warnPlaceholderFirebaseOnce("addBoardingLog");
      return;
    }

    try {
      await withFirestoreTimeout(addDoc(collection(db, "boarding_logs"), log), "addBoardingLog");
    } catch (error) {
      console.error("Error logging boarding:", error);
    }
  },

  async getReports(forceRefresh: boolean = false): Promise<DriverReport[]> {
    return cachedQuery(
      CACHE_KEY_ALL,
      async () => {
        if (!isFirebaseConfigured) {
          warnPlaceholderFirebaseOnce("reports");
          return [...demoReportsStore];
        }

        try {
          const q = query(collection(db, COLLECTION_NAME), orderBy("timestamp", "desc"), limit(100));
          const querySnapshot = await withFirestoreTimeout(getDocs(q), "getReports");
          const firestoreData = querySnapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          } as DriverReport));

          return firestoreData.length > 0 ? firestoreData : [...demoReportsStore];
        } catch (error) {
          console.error("Report Service Error - Using Mock:", error);
          return [...demoReportsStore];
        }
      },
      { ttlMs: CACHE_TTL.SHORT, forceRefresh }
    );
  },

  async markAsRead(id: string): Promise<void> {
    if (!isFirebaseConfigured) {
      warnPlaceholderFirebaseOnce("markAsRead");
      demoReportsStore = demoReportsStore.map((r) => (r.id === id ? { ...r, read: true } : r));
      setCachedValue(CACHE_KEY_ALL, [...demoReportsStore], CACHE_TTL.SHORT);
      return;
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await withFirestoreTimeout(updateDoc(docRef, { read: true }), "markAsRead");
      const cached = getCachedValue<DriverReport[]>(CACHE_KEY_ALL);
      if (cached) {
        setCachedValue(
          CACHE_KEY_ALL,
          cached.map((r) => (r.id === id ? { ...r, read: true } : r)),
          CACHE_TTL.SHORT
        );
      }
    } catch (error) {
      console.error("Error updating report status:", error);
    }
  },

  async markManyAsRead(ids: string[]): Promise<void> {
    if (!isFirebaseConfigured) {
      warnPlaceholderFirebaseOnce("markManyAsRead");
      const idSet = new Set(ids);
      demoReportsStore = demoReportsStore.map((r) => (idSet.has(r.id) ? { ...r, read: true } : r));
      setCachedValue(CACHE_KEY_ALL, [...demoReportsStore], CACHE_TTL.SHORT);
      return;
    }

    try {
      const batch = writeBatch(db);
      ids.forEach((id) => {
        const ref = doc(db, COLLECTION_NAME, id);
        batch.update(ref, { read: true });
      });
      await withFirestoreTimeout(batch.commit(), "markManyAsRead");
      const cached = getCachedValue<DriverReport[]>(CACHE_KEY_ALL);
      if (cached) {
        const idSet = new Set(ids);
        setCachedValue(
          CACHE_KEY_ALL,
          cached.map((r) => (idSet.has(r.id) ? { ...r, read: true } : r)),
          CACHE_TTL.SHORT
        );
      }
    } catch (error) {
      console.error("Error in batch mark as read:", error);
    }
  },
};
