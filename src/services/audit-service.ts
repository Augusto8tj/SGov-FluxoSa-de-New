import {
  db,
  isFirebaseConfigured,
  warnPlaceholderFirebaseOnce,
  withFirestoreTimeout,
} from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  addDoc,
} from "firebase/firestore";
import { MOCK_AUDIT_LOGS } from "@/lib/mock-data";
import {
  CACHE_TTL,
  cachedQuery,
  getCachedValue,
  setCachedValue,
} from "@/lib/query-cache";

const COLLECTION_NAME = "audit_logs";
const CACHE_KEY_ALL = "audit_logs:all";

let demoAuditLogsStore: any[] = [...MOCK_AUDIT_LOGS];

/**
 * @fileOverview Serviço de auditoria com cache em memória e suporte a dados mock técnicos para TI.
 */
export const auditService = {
  async getLogs(forceRefresh: boolean = false): Promise<any[]> {
    return cachedQuery(
      CACHE_KEY_ALL,
      async () => {
        if (!isFirebaseConfigured) {
          warnPlaceholderFirebaseOnce("audit_logs");
          return [...demoAuditLogsStore];
        }

        try {
          const q = query(
            collection(db, COLLECTION_NAME),
            orderBy("timestamp", "desc"),
            limit(100)
          );
          const querySnapshot = await withFirestoreTimeout(getDocs(q), "getAuditLogs");
          const firestoreData = querySnapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));

          return firestoreData.length > 0 ? firestoreData : [...demoAuditLogsStore];
        } catch (error) {
          console.error("Audit Service: Firestore offline ou vazio. Usando Mock técnico.", error);
          return [...demoAuditLogsStore];
        }
      },
      { ttlMs: CACHE_TTL.SHORT, forceRefresh }
    );
  },

  async logAction(data: {
    userId: string;
    userEmail: string;
    action: string;
    resource: string;
    ip: string;
    status: 'SUCCESS' | 'WARNING' | 'ERROR';
  }) {
    const entry = {
      ...data,
      timestamp: new Date().toISOString(),
    };

    if (!isFirebaseConfigured) {
      warnPlaceholderFirebaseOnce("logAction");
      demoAuditLogsStore = [{ id: `L-${Date.now().toString().slice(-6)}`, ...entry }, ...demoAuditLogsStore];
      setCachedValue(CACHE_KEY_ALL, [...demoAuditLogsStore], CACHE_TTL.SHORT);
      return;
    }

    try {
      const docRef = await withFirestoreTimeout(
        addDoc(collection(db, COLLECTION_NAME), entry),
        "logAction"
      );
      const cached = getCachedValue<any[]>(CACHE_KEY_ALL);
      if (cached) {
        setCachedValue(CACHE_KEY_ALL, [{ id: docRef.id, ...entry }, ...cached], CACHE_TTL.SHORT);
      }
    } catch (e) {
      console.error("Failed to log technical action", e);
    }
  },
};
