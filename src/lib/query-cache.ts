/**
 * @fileOverview Cache em memória com deduplicação de requisições em voo (in-flight)
 * e utilitários para eliminar gargalos de renderização/abertura de formulários.
 */

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const cacheStore = new Map<string, CacheEntry<unknown>>();
const inflightStore = new Map<string, Promise<unknown>>();

export const CACHE_TTL = {
  SHORT: 15_000,    // 15s: dados operacionais dinâmicos (requests, reports, audit)
  MEDIUM: 60_000,   // 60s: cadastros (patients, units, vehicles, drivers, docs)
  LONG: 120_000,    // 2m: configurações globais (system_settings)
} as const;

export function getCachedValue<T>(key: string): T | undefined {
  const entry = cacheStore.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key);
    return undefined;
  }
  return entry.data;
}

export function setCachedValue<T>(key: string, data: T, ttlMs: number = CACHE_TTL.MEDIUM): void {
  cacheStore.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

export function invalidateCache(keyOrPrefix: string): void {
  for (const key of Array.from(cacheStore.keys())) {
    if (key === keyOrPrefix || key.startsWith(`${keyOrPrefix}:`)) {
      cacheStore.delete(key);
    }
  }
}

export async function cachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: { ttlMs?: number; forceRefresh?: boolean }
): Promise<T> {
  const ttlMs = options?.ttlMs ?? CACHE_TTL.MEDIUM;
  const forceRefresh = options?.forceRefresh ?? false;

  if (!forceRefresh) {
    const cached = getCachedValue<T>(key);
    if (cached !== undefined) {
      return cached;
    }
  }

  const inflight = inflightStore.get(key) as Promise<T> | undefined;
  if (inflight) {
    return inflight;
  }

  const promise = fetcher()
    .then((result) => {
      setCachedValue(key, result, ttlMs);
      return result;
    })
    .finally(() => {
      inflightStore.delete(key);
    });

  inflightStore.set(key, promise);
  return promise;
}

/**
 * Evita colisão de FocusScope/RemoveScroll do Radix UI ao abrir um Dialog
 * a partir de um DropdownMenuItem (que ainda está fechando no mesmo tick).
 */
export function openAfterDropdownClose(callback: () => void): void {
  if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(() => {
      callback();
    });
  } else {
    setTimeout(callback, 0);
  }
}
