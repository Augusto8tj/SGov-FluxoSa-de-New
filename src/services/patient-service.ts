
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
import { Patient } from "@/lib/types";
import { MOCK_PATIENTS } from "@/lib/mock-data";
import {
  CACHE_TTL,
  cachedQuery,
  getCachedValue,
  invalidateCache,
  setCachedValue,
} from "@/lib/query-cache";

const COLLECTION_NAME = "patients";
const CACHE_KEY_ALL = "patients:all";

let demoPatientsStore: Patient[] = [...MOCK_PATIENTS];

export const patientService = {
  async getPatients(forceRefresh: boolean = false): Promise<Patient[]> {
    return cachedQuery(
      CACHE_KEY_ALL,
      async () => {
        if (!isFirebaseConfigured) {
          warnPlaceholderFirebaseOnce("patients");
          return [...demoPatientsStore];
        }

        try {
          const q = query(collection(db, COLLECTION_NAME), orderBy("name", "asc"));
          const querySnapshot = await withFirestoreTimeout(getDocs(q), "getPatients");

          const firestoreData = querySnapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          } as Patient));

          return firestoreData.length > 0 ? firestoreData : [...demoPatientsStore];
        } catch (error) {
          console.error("Patient Service Error - Using Mock:", error);
          return [...demoPatientsStore];
        }
      },
      { ttlMs: CACHE_TTL.MEDIUM, forceRefresh }
    );
  },

  async addPatient(patient: Omit<Patient, "id">): Promise<string> {
    const now = new Date().toISOString();
    const payload = {
      ...patient,
      createdAt: now,
      updatedAt: now,
    };

    if (!isFirebaseConfigured) {
      warnPlaceholderFirebaseOnce("addPatient");
      const newId = `P-${Date.now().toString().slice(-6)}`;
      const created: Patient = { id: newId, ...payload };
      demoPatientsStore = [...demoPatientsStore, created].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setCachedValue(CACHE_KEY_ALL, [...demoPatientsStore], CACHE_TTL.MEDIUM);
      return newId;
    }

    try {
      const docRef = await withFirestoreTimeout(
        addDoc(collection(db, COLLECTION_NAME), payload),
        "addPatient"
      );
      const cached = getCachedValue<Patient[]>(CACHE_KEY_ALL);
      if (cached) {
        setCachedValue(
          CACHE_KEY_ALL,
          [...cached, { id: docRef.id, ...payload }].sort((a, b) =>
            a.name.localeCompare(b.name)
          ),
          CACHE_TTL.MEDIUM
        );
      } else {
        invalidateCache("patients");
      }
      return docRef.id;
    } catch (error) {
      console.error("Erro ao adicionar paciente:", error);
      throw new Error("Erro ao realizar cadastro do cidadão.");
    }
  },

  async updatePatient(id: string, data: Partial<Patient>): Promise<void> {
    const patch = { ...data, updatedAt: new Date().toISOString() };

    if (!isFirebaseConfigured) {
      warnPlaceholderFirebaseOnce("updatePatient");
      demoPatientsStore = demoPatientsStore.map((p) => (p.id === id ? { ...p, ...patch } : p));
      setCachedValue(CACHE_KEY_ALL, [...demoPatientsStore], CACHE_TTL.MEDIUM);
      return;
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await withFirestoreTimeout(updateDoc(docRef, patch), "updatePatient");
      const cached = getCachedValue<Patient[]>(CACHE_KEY_ALL);
      if (cached) {
        setCachedValue(
          CACHE_KEY_ALL,
          cached.map((p) => (p.id === id ? { ...p, ...patch } : p)),
          CACHE_TTL.MEDIUM
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar paciente:", error);
      throw new Error("Erro ao atualizar dados cadastrais.");
    }
  },

  async deletePatient(id: string): Promise<void> {
    if (!isFirebaseConfigured) {
      warnPlaceholderFirebaseOnce("deletePatient");
      demoPatientsStore = demoPatientsStore.filter((p) => p.id !== id);
      setCachedValue(CACHE_KEY_ALL, [...demoPatientsStore], CACHE_TTL.MEDIUM);
      return;
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await withFirestoreTimeout(deleteDoc(docRef), "deletePatient");
      const cached = getCachedValue<Patient[]>(CACHE_KEY_ALL);
      if (cached) {
        setCachedValue(
          CACHE_KEY_ALL,
          cached.filter((p) => p.id !== id),
          CACHE_TTL.MEDIUM
        );
      }
    } catch (error) {
      console.error("Erro ao remover paciente:", error);
      throw new Error("Erro ao remover registro do paciente.");
    }
  },
};
