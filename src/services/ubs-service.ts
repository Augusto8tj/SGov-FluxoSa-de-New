
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
} from "firebase/firestore";
import { UBS } from "@/lib/types";
import { MOCK_UBS } from "@/lib/mock-data";
import {
  CACHE_TTL,
  cachedQuery,
  getCachedValue,
  invalidateCache,
  setCachedValue,
} from "@/lib/query-cache";

const COLLECTION_NAME = "units";
const CACHE_KEY_ALL = "units:all";

let demoUnitsStore: UBS[] = [...MOCK_UBS];

export const ubsService = {
  async getUnits(forceRefresh: boolean = false): Promise<UBS[]> {
    return cachedQuery(
      CACHE_KEY_ALL,
      async () => {
        if (!isFirebaseConfigured) {
          warnPlaceholderFirebaseOnce("units");
          return [...demoUnitsStore];
        }

        try {
          const q = query(collection(db, COLLECTION_NAME), orderBy("name", "asc"));
          const querySnapshot = await withFirestoreTimeout(getDocs(q), "getUnits");
          const firestoreData = querySnapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          } as UBS));

          return firestoreData.length > 0 ? firestoreData : [...demoUnitsStore];
        } catch (error) {
          console.error("UBS Service Error - Using Mock:", error);
          return [...demoUnitsStore];
        }
      },
      { ttlMs: CACHE_TTL.MEDIUM, forceRefresh }
    );
  },

  async addUnit(unit: Omit<UBS, "id">): Promise<string> {
    const payload = {
      ...unit,
      createdAt: new Date().toISOString(),
    };

    if (!isFirebaseConfigured) {
      warnPlaceholderFirebaseOnce("addUnit");
      const newId = `UBS-${Date.now().toString().slice(-6)}`;
      const created: UBS = { id: newId, ...payload };
      demoUnitsStore = [...demoUnitsStore, created].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setCachedValue(CACHE_KEY_ALL, [...demoUnitsStore], CACHE_TTL.MEDIUM);
      return newId;
    }

    try {
      const docRef = await withFirestoreTimeout(
        addDoc(collection(db, COLLECTION_NAME), payload),
        "addUnit"
      );
      const cached = getCachedValue<UBS[]>(CACHE_KEY_ALL);
      if (cached) {
        setCachedValue(
          CACHE_KEY_ALL,
          [...cached, { id: docRef.id, ...payload }].sort((a, b) =>
            a.name.localeCompare(b.name)
          ),
          CACHE_TTL.MEDIUM
        );
      } else {
        invalidateCache("units");
      }
      return docRef.id;
    } catch (error) {
      console.error("Erro ao registrar Unidade de Saúde:", error);
      throw new Error("Erro ao registrar Unidade de Saúde.");
    }
  },

  async updateUnit(id: string, data: Partial<UBS>): Promise<void> {
    const patch = { ...data, updatedAt: new Date().toISOString() };

    if (!isFirebaseConfigured) {
      warnPlaceholderFirebaseOnce("updateUnit");
      demoUnitsStore = demoUnitsStore.map((u) => (u.id === id ? { ...u, ...patch } : u));
      setCachedValue(CACHE_KEY_ALL, [...demoUnitsStore], CACHE_TTL.MEDIUM);
      return;
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await withFirestoreTimeout(updateDoc(docRef, patch), "updateUnit");
      const cached = getCachedValue<UBS[]>(CACHE_KEY_ALL);
      if (cached) {
        setCachedValue(
          CACHE_KEY_ALL,
          cached.map((u) => (u.id === id ? { ...u, ...patch } : u)),
          CACHE_TTL.MEDIUM
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar unidade:", error);
      throw new Error("Erro ao atualizar unidade.");
    }
  },

  async deleteUnit(id: string): Promise<void> {
    if (!isFirebaseConfigured) {
      warnPlaceholderFirebaseOnce("deleteUnit");
      demoUnitsStore = demoUnitsStore.filter((u) => u.id !== id);
      setCachedValue(CACHE_KEY_ALL, [...demoUnitsStore], CACHE_TTL.MEDIUM);
      return;
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await withFirestoreTimeout(deleteDoc(docRef), "deleteUnit");
      const cached = getCachedValue<UBS[]>(CACHE_KEY_ALL);
      if (cached) {
        setCachedValue(
          CACHE_KEY_ALL,
          cached.filter((u) => u.id !== id),
          CACHE_TTL.MEDIUM
        );
      }
    } catch (error) {
      console.error("Erro ao remover unidade:", error);
      throw new Error("Erro ao remover unidade.");
    }
  },
};
