
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
import { Vehicle } from "@/lib/types";
import { MOCK_VEHICLES } from "@/lib/mock-data";
import {
  CACHE_TTL,
  cachedQuery,
  getCachedValue,
  invalidateCache,
  setCachedValue,
} from "@/lib/query-cache";

const COLLECTION_NAME = "vehicles";
const CACHE_KEY_ALL = "vehicles:all";

let demoVehiclesStore: Vehicle[] = [...MOCK_VEHICLES];

/**
 * @fileOverview Serviço de frota com cache em memória, deduplicação e telemetria mock rápida.
 */
export const vehicleService = {
  async getVehicles(forceRefresh: boolean = false): Promise<Vehicle[]> {
    return cachedQuery(
      CACHE_KEY_ALL,
      async () => {
        if (!isFirebaseConfigured) {
          warnPlaceholderFirebaseOnce("vehicles");
          return [...demoVehiclesStore];
        }

        try {
          const q = query(collection(db, COLLECTION_NAME), orderBy("licensePlate", "asc"));
          const querySnapshot = await withFirestoreTimeout(getDocs(q), "getVehicles");

          const firestoreData = querySnapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          } as Vehicle));

          return firestoreData.length > 0 ? firestoreData : [...demoVehiclesStore];
        } catch (error) {
          console.error("Vehicle Service Error - Using Mock:", error);
          return [...demoVehiclesStore];
        }
      },
      { ttlMs: CACHE_TTL.MEDIUM, forceRefresh }
    );
  },

  async addVehicle(vehicle: Omit<Vehicle, "id">): Promise<string> {
    const now = new Date().toISOString();
    const payload = {
      ...vehicle,
      createdAt: now,
      updatedAt: now,
    };

    if (!isFirebaseConfigured) {
      warnPlaceholderFirebaseOnce("addVehicle");
      const newId = `V-${Date.now().toString().slice(-6)}`;
      const created: Vehicle = { id: newId, ...payload };
      demoVehiclesStore = [...demoVehiclesStore, created].sort((a, b) =>
        a.licensePlate.localeCompare(b.licensePlate)
      );
      setCachedValue(CACHE_KEY_ALL, [...demoVehiclesStore], CACHE_TTL.MEDIUM);
      return newId;
    }

    try {
      const docRef = await withFirestoreTimeout(
        addDoc(collection(db, COLLECTION_NAME), payload),
        "addVehicle"
      );
      const cached = getCachedValue<Vehicle[]>(CACHE_KEY_ALL);
      if (cached) {
        setCachedValue(
          CACHE_KEY_ALL,
          [...cached, { id: docRef.id, ...payload }].sort((a, b) =>
            a.licensePlate.localeCompare(b.licensePlate)
          ),
          CACHE_TTL.MEDIUM
        );
      } else {
        invalidateCache("vehicles");
      }
      return docRef.id;
    } catch (error) {
      console.error("Erro ao persistir veículo oficial:", error);
      throw new Error("Erro ao persistir veículo oficial.");
    }
  },

  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<void> {
    const patch = { ...data, updatedAt: new Date().toISOString() };

    if (!isFirebaseConfigured) {
      warnPlaceholderFirebaseOnce("updateVehicle");
      demoVehiclesStore = demoVehiclesStore.map((v) => (v.id === id ? { ...v, ...patch } : v));
      setCachedValue(CACHE_KEY_ALL, [...demoVehiclesStore], CACHE_TTL.MEDIUM);
      return;
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await withFirestoreTimeout(updateDoc(docRef, patch), "updateVehicle");
      const cached = getCachedValue<Vehicle[]>(CACHE_KEY_ALL);
      if (cached) {
        setCachedValue(
          CACHE_KEY_ALL,
          cached.map((v) => (v.id === id ? { ...v, ...patch } : v)),
          CACHE_TTL.MEDIUM
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar metadados da viatura:", error);
      throw new Error("Erro ao atualizar metadados da viatura.");
    }
  },

  async deleteVehicle(id: string): Promise<void> {
    if (!isFirebaseConfigured) {
      warnPlaceholderFirebaseOnce("deleteVehicle");
      demoVehiclesStore = demoVehiclesStore.filter((v) => v.id !== id);
      setCachedValue(CACHE_KEY_ALL, [...demoVehiclesStore], CACHE_TTL.MEDIUM);
      return;
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await withFirestoreTimeout(deleteDoc(docRef), "deleteVehicle");
      const cached = getCachedValue<Vehicle[]>(CACHE_KEY_ALL);
      if (cached) {
        setCachedValue(
          CACHE_KEY_ALL,
          cached.filter((v) => v.id !== id),
          CACHE_TTL.MEDIUM
        );
      }
    } catch (error) {
      console.error("Erro ao expurgar veículo da frota:", error);
      throw new Error("Erro ao expurgar veículo da frota.");
    }
  },
};
