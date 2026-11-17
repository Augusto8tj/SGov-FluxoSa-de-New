
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
  addDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Driver } from "@/lib/types";
import { MOCK_DRIVERS } from "@/lib/mock-data";
import {
  CACHE_TTL,
  cachedQuery,
  getCachedValue,
  invalidateCache,
  setCachedValue,
} from "@/lib/query-cache";

const COLLECTION_NAME = "drivers";
const CACHE_KEY_ALL = "drivers:all";

let demoDriversStore: Driver[] = [...MOCK_DRIVERS];

export const driverService = {
  async getDrivers(forceRefresh: boolean = false): Promise<Driver[]> {
    return cachedQuery(
      CACHE_KEY_ALL,
      async () => {
        if (!isFirebaseConfigured) {
          warnPlaceholderFirebaseOnce("drivers");
          return [...demoDriversStore];
        }

        try {
          const q = query(collection(db, COLLECTION_NAME), orderBy("name", "asc"));
          const querySnapshot = await withFirestoreTimeout(getDocs(q), "getDrivers");
          const firestoreData = querySnapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          } as Driver));

          return firestoreData.length > 0 ? firestoreData : [...demoDriversStore];
        } catch (error) {
          console.error("Driver Service Error - Using Mock:", error);
          return [...demoDriversStore];
        }
      },
      { ttlMs: CACHE_TTL.MEDIUM, forceRefresh }
    );
  },

  async getAvailableDrivers(forceRefresh: boolean = false): Promise<Driver[]> {
    const allDrivers = await this.getDrivers(forceRefresh);
    return allDrivers.filter((d) => d.available);
  },

  async addDriver(driver: Omit<Driver, "id">): Promise<string> {
    const payload = {
      ...driver,
      createdAt: new Date().toISOString(),
    };

    if (!isFirebaseConfigured) {
      warnPlaceholderFirebaseOnce("addDriver");
      const newId = `D-${Date.now().toString().slice(-6)}`;
      const created: Driver = { id: newId, ...payload };
      demoDriversStore = [...demoDriversStore, created].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setCachedValue(CACHE_KEY_ALL, [...demoDriversStore], CACHE_TTL.MEDIUM);
      return newId;
    }

    try {
      const docRef = await withFirestoreTimeout(
        addDoc(collection(db, COLLECTION_NAME), payload),
        "addDriver"
      );
      const cached = getCachedValue<Driver[]>(CACHE_KEY_ALL);
      if (cached) {
        setCachedValue(
          CACHE_KEY_ALL,
          [...cached, { id: docRef.id, ...payload }].sort((a, b) =>
            a.name.localeCompare(b.name)
          ),
          CACHE_TTL.MEDIUM
        );
      } else {
        invalidateCache("drivers");
      }
      return docRef.id;
    } catch (error) {
      console.error("Erro ao cadastrar motorista:", error);
      throw new Error("Erro ao cadastrar motorista.");
    }
  },

  async updateDriver(id: string, data: Partial<Driver>): Promise<void> {
    const patch = { ...data, updatedAt: new Date().toISOString() };

    if (!isFirebaseConfigured) {
      warnPlaceholderFirebaseOnce("updateDriver");
      demoDriversStore = demoDriversStore.map((d) => (d.id === id ? { ...d, ...patch } : d));
      setCachedValue(CACHE_KEY_ALL, [...demoDriversStore], CACHE_TTL.MEDIUM);
      return;
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await withFirestoreTimeout(updateDoc(docRef, patch), "updateDriver");
      const cached = getCachedValue<Driver[]>(CACHE_KEY_ALL);
      if (cached) {
        setCachedValue(
          CACHE_KEY_ALL,
          cached.map((d) => (d.id === id ? { ...d, ...patch } : d)),
          CACHE_TTL.MEDIUM
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar dados do motorista:", error);
      throw new Error("Erro ao atualizar dados do motorista.");
    }
  },
};
