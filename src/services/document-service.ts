
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
  updateDoc,
  doc,
} from "firebase/firestore";
import { MOCK_DOCUMENTS } from "@/lib/mock-data";
import {
  CACHE_TTL,
  cachedQuery,
  getCachedValue,
  setCachedValue,
} from "@/lib/query-cache";

const COLLECTION_NAME = "official_documents";
const CACHE_KEY_ALL = "documents:all";

let demoDocumentsStore: any[] = [...MOCK_DOCUMENTS];

export const documentService = {
  async getDocuments(forceRefresh: boolean = false): Promise<any[]> {
    return cachedQuery(
      CACHE_KEY_ALL,
      async () => {
        if (!isFirebaseConfigured) {
          warnPlaceholderFirebaseOnce("documents");
          return [...demoDocumentsStore];
        }

        try {
          const q = query(
            collection(db, COLLECTION_NAME),
            orderBy("createdAt", "desc")
          );
          const querySnapshot = await withFirestoreTimeout(getDocs(q), "getDocuments");
          const firestoreData = querySnapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));

          return firestoreData.length > 0 ? firestoreData : [...demoDocumentsStore];
        } catch (error) {
          console.error("Document Service Error - Using Mock:", error);
          return [...demoDocumentsStore];
        }
      },
      { ttlMs: CACHE_TTL.MEDIUM, forceRefresh }
    );
  },

  async markAsPrinted(id: string) {
    if (!isFirebaseConfigured) {
      warnPlaceholderFirebaseOnce("markAsPrinted");
      demoDocumentsStore = demoDocumentsStore.map((d) =>
        d.id === id ? { ...d, status: 'PRINTED' } : d
      );
      setCachedValue(CACHE_KEY_ALL, [...demoDocumentsStore], CACHE_TTL.MEDIUM);
      return;
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await withFirestoreTimeout(updateDoc(docRef, { status: 'PRINTED' }), "markAsPrinted");
      const cached = getCachedValue<any[]>(CACHE_KEY_ALL);
      if (cached) {
        setCachedValue(
          CACHE_KEY_ALL,
          cached.map((d) => (d.id === id ? { ...d, status: 'PRINTED' } : d)),
          CACHE_TTL.MEDIUM
        );
      }
    } catch (e) {
      console.error("Failed to update document status", e);
    }
  },
};
