
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
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  writeBatch,
} from "firebase/firestore";
import { TransportRequest } from "@/lib/types";
import { MOCK_REQUESTS } from "@/lib/mock-data";
import {
  CACHE_TTL,
  cachedQuery,
  getCachedValue,
  invalidateCache,
  setCachedValue,
} from "@/lib/query-cache";

const COLLECTION_NAME = "requests";
const CACHE_KEY_ALL = "requests:all";

let demoRequestsStore: TransportRequest[] = [...MOCK_REQUESTS];

/**
 * @fileOverview Serviço de gestão de solicitações com cache em memória,
 * deduplicação de requisições simultâneas e fallback rápido de demonstração.
 */
export const requestService = {
  async getRequests(forceRefresh: boolean = false): Promise<TransportRequest[]> {
    return cachedQuery(
      CACHE_KEY_ALL,
      async () => {
        if (!isFirebaseConfigured) {
          warnPlaceholderFirebaseOnce("requests");
          return [...demoRequestsStore];
        }

        try {
          const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
          const querySnapshot = await withFirestoreTimeout(getDocs(q), "getRequests");

          const firestoreData = querySnapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          } as TransportRequest));

          return firestoreData.length > 0 ? firestoreData : [...demoRequestsStore];
        } catch (error) {
          console.error("Firestore Error (Requests) - Falling back to Mock:", error);
          return [...demoRequestsStore];
        }
      },
      { ttlMs: CACHE_TTL.SHORT, forceRefresh }
    );
  },

  async getByAccessCode(code: string): Promise<TransportRequest | null> {
    const cachedAll = getCachedValue<TransportRequest[]>(CACHE_KEY_ALL);
    if (cachedAll) {
      const hit = cachedAll.find((r) => r.patientAccessCode === code);
      if (hit) return hit;
    }

    return cachedQuery(
      `requests:code:${code}`,
      async () => {
        if (!isFirebaseConfigured) {
          warnPlaceholderFirebaseOnce("requests:getByAccessCode");
          return demoRequestsStore.find((r) => r.patientAccessCode === code) || null;
        }

        try {
          const q = query(collection(db, COLLECTION_NAME), where("patientAccessCode", "==", code));
          const querySnapshot = await withFirestoreTimeout(getDocs(q), "getByAccessCode");

          if (!querySnapshot.empty) {
            const docData = querySnapshot.docs[0];
            return { id: docData.id, ...docData.data() } as TransportRequest;
          }

          return demoRequestsStore.find((r) => r.patientAccessCode === code) || null;
        } catch (error) {
          console.error("Access Code Error:", error);
          return demoRequestsStore.find((r) => r.patientAccessCode === code) || null;
        }
      },
      { ttlMs: CACHE_TTL.SHORT }
    );
  },

  async addRequest(request: Omit<TransportRequest, "id">): Promise<string> {
    const now = new Date().toISOString();
    const patientAccessCode = Math.floor(100000 + Math.random() * 900000).toString();
    const payload = {
      ...request,
      patientAccessCode,
      createdAt: now,
      updatedAt: now,
    };

    if (!isFirebaseConfigured) {
      warnPlaceholderFirebaseOnce("addRequest");
      const newId = `REQ-${Date.now().toString().slice(-6)}`;
      const created: TransportRequest = { id: newId, ...payload };
      demoRequestsStore = [created, ...demoRequestsStore];
      setCachedValue(CACHE_KEY_ALL, [...demoRequestsStore], CACHE_TTL.SHORT);
      return newId;
    }

    try {
      const docRef = await withFirestoreTimeout(
        addDoc(collection(db, COLLECTION_NAME), payload),
        "addRequest"
      );
      const cached = getCachedValue<TransportRequest[]>(CACHE_KEY_ALL);
      if (cached) {
        setCachedValue(CACHE_KEY_ALL, [{ id: docRef.id, ...payload }, ...cached], CACHE_TTL.SHORT);
      } else {
        invalidateCache("requests");
      }
      return docRef.id;
    } catch (error) {
      console.error("Add Request Error:", error);
      throw new Error("Falha ao criar nova solicitação no Firestore.");
    }
  },

  async updateRequest(id: string, data: Partial<TransportRequest>): Promise<void> {
    const updatedAt = new Date().toISOString();
    const patch = { ...data, updatedAt };

    if (!isFirebaseConfigured) {
      warnPlaceholderFirebaseOnce("updateRequest");
      demoRequestsStore = demoRequestsStore.map((r) => (r.id === id ? { ...r, ...patch } : r));
      setCachedValue(CACHE_KEY_ALL, [...demoRequestsStore], CACHE_TTL.SHORT);
      return;
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await withFirestoreTimeout(updateDoc(docRef, patch), "updateRequest");
      const cached = getCachedValue<TransportRequest[]>(CACHE_KEY_ALL);
      if (cached) {
        setCachedValue(
          CACHE_KEY_ALL,
          cached.map((r) => (r.id === id ? { ...r, ...patch } : r)),
          CACHE_TTL.SHORT
        );
      }
      invalidateCache("requests:code");
    } catch (error) {
      console.error("Update Request Error:", error);
      throw new Error("Falha ao atualizar solicitação real.");
    }
  },

  async deleteRequest(id: string): Promise<void> {
    if (!isFirebaseConfigured) {
      warnPlaceholderFirebaseOnce("deleteRequest");
      demoRequestsStore = demoRequestsStore.filter((r) => r.id !== id);
      setCachedValue(CACHE_KEY_ALL, [...demoRequestsStore], CACHE_TTL.SHORT);
      return;
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await withFirestoreTimeout(deleteDoc(docRef), "deleteRequest");
      const cached = getCachedValue<TransportRequest[]>(CACHE_KEY_ALL);
      if (cached) {
        setCachedValue(
          CACHE_KEY_ALL,
          cached.filter((r) => r.id !== id),
          CACHE_TTL.SHORT
        );
      }
      invalidateCache("requests:code");
    } catch (error) {
      console.error("Delete Request Error:", error);
      throw new Error("Falha ao remover solicitação real.");
    }
  },

  async createManifestBatch(assignments: any[]): Promise<void> {
    const assignedAt = new Date().toISOString();

    if (!isFirebaseConfigured) {
      warnPlaceholderFirebaseOnce("createManifestBatch");
      const updatesById = new Map<string, Partial<TransportRequest>>();
      assignments.forEach((assign) => {
        const manifestId = `MF-${Date.now().toString().slice(-4)}-${String(assign.vehicleId).slice(0, 3).toUpperCase()}`;
        assign.route.forEach((requestId: string) => {
          updatesById.set(requestId.trim(), {
            manifestId,
            driverId: assign.driverName,
            vehicleId: assign.vehicleType || assign.vehicleId,
            assignedAt,
            status: "APPROVED",
          });
        });
      });
      demoRequestsStore = demoRequestsStore.map((r) => {
        const patch = updatesById.get(r.id);
        return patch ? { ...r, ...patch } : r;
      });
      setCachedValue(CACHE_KEY_ALL, [...demoRequestsStore], CACHE_TTL.SHORT);
      return;
    }

    try {
      const batch = writeBatch(db);
      const updatesById = new Map<string, Partial<TransportRequest>>();

      assignments.forEach((assign) => {
        const manifestId = `MF-${Date.now().toString().slice(-4)}-${String(assign.vehicleId).slice(0, 3).toUpperCase()}`;

        assign.route.forEach((requestId: string) => {
          const cleanId = requestId.trim();
          const docRef = doc(db, COLLECTION_NAME, cleanId);
          const patch: Partial<TransportRequest> = {
            manifestId,
            driverId: assign.driverName,
            vehicleId: assign.vehicleType || assign.vehicleId,
            assignedAt,
            status: "APPROVED",
          };
          updatesById.set(cleanId, patch);
          batch.update(docRef, patch);
        });
      });

      await withFirestoreTimeout(batch.commit(), "createManifestBatch");
      const cached = getCachedValue<TransportRequest[]>(CACHE_KEY_ALL);
      if (cached) {
        setCachedValue(
          CACHE_KEY_ALL,
          cached.map((r) => {
            const patch = updatesById.get(r.id);
            return patch ? { ...r, ...patch } : r;
          }),
          CACHE_TTL.SHORT
        );
      }
      invalidateCache("requests:code");
    } catch (error) {
      console.error("Create Manifest Batch Error:", error);
      throw error;
    }
  },
};
