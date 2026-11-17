
import {
  db,
  isFirebaseConfigured,
  warnPlaceholderFirebaseOnce,
  withFirestoreTimeout,
} from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { SYSTEM_DEFAULT_MODEL } from "@/ai/constants";
import { CACHE_TTL, cachedQuery, setCachedValue } from "@/lib/query-cache";

export type SystemSettings = {
  aiProvider: 'GOOGLE' | 'OPENROUTER' | 'OLLAMA' | 'NVIDIA';
  aiModelId: string;
  ollamaBaseUrl?: string;
  ollamaApiKey?: string;
  ollamaKeepAlive?: string; // -1, 5m, 30m, 0
  ollamaTemperature?: number;
  googleApiKey?: string;
  openrouterApiKey?: string;
};

const SETTINGS_DOC = "system_settings/global";
const CACHE_KEY = "system_settings:global";

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  aiProvider: 'OPENROUTER',
  aiModelId: SYSTEM_DEFAULT_MODEL,
  ollamaBaseUrl: 'https://boxlike-barrack-silencer.ngrok-free.dev',
  ollamaKeepAlive: '5m',
  ollamaTemperature: 0.7,
};

let demoSettingsStore: SystemSettings = { ...DEFAULT_SYSTEM_SETTINGS };

export const systemSettingsService = {
  /**
   * Obtém as configurações globais do sistema com cache e deduplicação.
   */
  async getSettings(forceRefresh: boolean = false): Promise<SystemSettings> {
    return cachedQuery(
      CACHE_KEY,
      async () => {
        if (!isFirebaseConfigured) {
          warnPlaceholderFirebaseOnce("system_settings");
          return { ...demoSettingsStore };
        }

        try {
          const docRef = doc(db, SETTINGS_DOC);
          const snap = await withFirestoreTimeout(getDoc(docRef), "getSettings", 3500);
          if (snap.exists()) {
            const data = snap.data();
            return { ...DEFAULT_SYSTEM_SETTINGS, ...data } as SystemSettings;
          }
        } catch (e) {
          console.error("SystemSettingsService: Falha ao ler Firestore, usando defaults técnicos.", e);
        }

        return { ...DEFAULT_SYSTEM_SETTINGS };
      },
      { ttlMs: typeof window === "undefined" ? CACHE_TTL.SHORT : CACHE_TTL.LONG, forceRefresh }
    );
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<void> {
    const cleanSettings = JSON.parse(JSON.stringify(settings));

    if (!isFirebaseConfigured) {
      warnPlaceholderFirebaseOnce("updateSettings");
      demoSettingsStore = { ...demoSettingsStore, ...cleanSettings };
      setCachedValue(CACHE_KEY, { ...demoSettingsStore }, CACHE_TTL.LONG);
      return;
    }

    try {
      const docRef = doc(db, SETTINGS_DOC);
      await withFirestoreTimeout(setDoc(docRef, cleanSettings, { merge: true }), "updateSettings");
      const current = await this.getSettings();
      setCachedValue(CACHE_KEY, { ...current, ...cleanSettings }, CACHE_TTL.LONG);
    } catch (e) {
      console.error("SystemSettingsService: Falha ao salvar configurações.", e);
      throw new Error("Erro ao persistir no Firestore.");
    }
  },
};
